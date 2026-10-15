import type { AutomatonState, AutomatonTransition, FiniteAutomaton } from './automata';

/**
 * Hopcroft's / Partition Refinement DFA State Minimization.
 */
export class DFAMinimization {
  static minimize(dfa: FiniteAutomaton): FiniteAutomaton {
    // 1. Separate states into Accepting and Non-Accepting partitions
    const allStateIds = dfa.states.map((s) => s.id);
    const acceptSet = new Set(dfa.acceptStateIds);
    const nonAcceptIds = allStateIds.filter((id) => !acceptSet.has(id));
    const acceptIds = allStateIds.filter((id) => acceptSet.has(id));

    let partitions: string[][] = [];
    if (nonAcceptIds.length > 0) partitions.push(nonAcceptIds);
    if (acceptIds.length > 0) partitions.push(acceptIds);

    // Map each state to its transition target for each symbol
    const delta = new Map<string, Map<string, string>>();
    for (const s of dfa.states) {
      delta.set(s.id, new Map());
    }
    for (const t of dfa.transitions) {
      delta.get(t.from)?.set(t.symbol, t.to);
    }

    const findPartitionIndex = (stateId: string, parts: string[][]): number => {
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]!.includes(stateId)) return i;
      }
      return -1;
    };

    let changed = true;
    while (changed) {
      changed = false;
      const nextPartitions: string[][] = [];

      for (const group of partitions) {
        if (group.length <= 1) {
          nextPartitions.push(group);
          continue;
        }

        // Sub-partition the group based on transition targets
        const subGroups = new Map<string, string[]>();

        for (const stateId of group) {
          // Signature is string of partition indices for each symbol
          const sigParts: string[] = [];
          for (const sym of dfa.alphabet) {
            const target = delta.get(stateId)?.get(sym);
            const partIdx = target !== undefined ? findPartitionIndex(target, partitions) : -1;
            sigParts.push(`${sym}:${partIdx}`);
          }
          const sig = sigParts.join('|');

          if (!subGroups.has(sig)) {
            subGroups.set(sig, []);
          }
          subGroups.get(sig)!.push(stateId);
        }

        if (subGroups.size > 1) {
          changed = true;
        }

        for (const sub of subGroups.values()) {
          nextPartitions.push(sub);
        }
      }

      partitions = nextPartitions;
    }

    // Build minimized DFA
    const minStates: AutomatonState[] = [];
    const minTransitions: AutomatonTransition[] = [];
    const minAcceptIds: string[] = [];
    let minInitialId = '';

    const groupToId = new Map<string, string>();

    partitions.forEach((group, idx) => {
      const minId = `M${idx}`;
      groupToId.set(group.sort().join(','), minId);

      const isInitial = group.includes(dfa.initialStateId);
      const isAccept = group.some((s) => dfa.acceptStateIds.includes(s));

      if (isInitial) minInitialId = minId;
      if (isAccept) minAcceptIds.push(minId);

      minStates.push({
        id: minId,
        label: `{${group.join(',')}}`,
        isInitial,
        isAccept,
      });
    });

    // Build transitions between partition groups
    for (const group of partitions) {
      const repState = group[0]!;
      const fromMinId = groupToId.get(group.sort().join(','))!;

      for (const sym of dfa.alphabet) {
        const target = delta.get(repState)?.get(sym);
        if (target !== undefined) {
          const targetPartIdx = findPartitionIndex(target, partitions);
          const targetGroup = partitions[targetPartIdx]!;
          const toMinId = groupToId.get(targetGroup.sort().join(','))!;

          minTransitions.push({
            from: fromMinId,
            to: toMinId,
            symbol: sym,
          });
        }
      }
    }

    return {
      id: `${dfa.id}-minimized`,
      name: `${dfa.name} (Minimized)`,
      type: 'DFA',
      states: minStates,
      alphabet: [...dfa.alphabet],
      initialStateId: minInitialId,
      acceptStateIds: minAcceptIds,
      transitions: minTransitions,
    };
  }
}
