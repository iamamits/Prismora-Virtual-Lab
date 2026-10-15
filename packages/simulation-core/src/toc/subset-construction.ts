import type { AutomatonState, AutomatonTransition, FiniteAutomaton } from './automata';
import { AutomataEngine } from './automata';

/**
 * NFA to DFA Subset Construction (Powerset Algorithm).
 */
export class SubsetConstruction {
  static convertNfaToDfa(nfa: FiniteAutomaton): FiniteAutomaton {
    const dfaStates: AutomatonState[] = [];
    const dfaTransitions: AutomatonTransition[] = [];
    const dfaAcceptIds: string[] = [];

    // Initial state of DFA is ε-closure of NFA initial state
    const initialSet =
      nfa.type === 'ENFA'
        ? AutomataEngine.epsilonClosure([nfa.initialStateId], nfa.transitions)
        : [nfa.initialStateId];

    const stateMap = new Map<string, string>(); // sorted string representation -> dfa state id
    let stateCounter = 0;

    const getOrAddState = (set: string[]): string => {
      const key = set.sort().join(',');
      if (stateMap.has(key)) return stateMap.get(key)!;

      const newId = `Q${stateCounter++}`;
      stateMap.set(key, newId);

      const label = set.length > 0 ? `{${set.join(',')}}` : '∅';
      const isInitial = newId === 'Q0';
      const isAccept = set.some((s) => nfa.acceptStateIds.includes(s));

      if (isAccept) dfaAcceptIds.push(newId);

      dfaStates.push({
        id: newId,
        label,
        isInitial,
        isAccept,
      });

      return newId;
    };

    const initialDfaId = getOrAddState(initialSet);
    const workQueue: string[][] = [initialSet];
    const visited = new Set<string>();

    while (workQueue.length > 0) {
      const currentSet = workQueue.shift()!;
      const key = currentSet.sort().join(',');
      if (visited.has(key)) continue;
      visited.add(key);

      const fromDfaId = stateMap.get(key)!;

      for (const symbol of nfa.alphabet) {
        if (symbol === 'ε' || symbol === 'e') continue;

        let nextSet = AutomataEngine.stepStates(currentSet, symbol, nfa.transitions);
        if (nfa.type === 'ENFA') {
          nextSet = AutomataEngine.epsilonClosure(nextSet, nfa.transitions);
        }

        const toDfaId = getOrAddState(nextSet);
        dfaTransitions.push({
          from: fromDfaId,
          to: toDfaId,
          symbol,
        });

        const nextKey = nextSet.sort().join(',');
        if (!visited.has(nextKey)) {
          workQueue.push(nextSet);
        }
      }
    }

    return {
      id: `${nfa.id}-dfa`,
      name: `${nfa.name} (Equivalent DFA)`,
      type: 'DFA',
      states: dfaStates,
      alphabet: nfa.alphabet.filter((s) => s !== 'ε' && s !== 'e'),
      initialStateId: initialDfaId,
      acceptStateIds: dfaAcceptIds,
      transitions: dfaTransitions,
    };
  }
}
