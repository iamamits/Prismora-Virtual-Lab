/**
 * Finite Automata Types & Simulation Engine
 * Supports DFA, NFA, and ε-NFA.
 */

export interface AutomatonState {
  id: string;
  label: string;
  isInitial: boolean;
  isAccept: boolean;
  x?: number; // Visual coordinates
  y?: number;
}

export interface AutomatonTransition {
  from: string; // state ID
  to: string; // state ID
  symbol: string; // alphabet symbol or 'ε' / 'e' for epsilon
}

export interface FiniteAutomaton {
  id: string;
  name: string;
  type: 'DFA' | 'NFA' | 'ENFA';
  states: AutomatonState[];
  alphabet: string[]; // e.g. ['0', '1'] or ['a', 'b']
  initialStateId: string;
  acceptStateIds: string[];
  transitions: AutomatonTransition[];
}

export interface AutomatonStepResult {
  currentStates: string[];
  inputRemaining: string;
  consumedChar?: string;
  accepted: boolean;
  rejected: boolean;
  trace: { stateId: string; char: string }[];
}

export class AutomataEngine {
  /**
   * Computes the ε-closure of a set of states for an ε-NFA.
   */
  static epsilonClosure(stateIds: string[], transitions: AutomatonTransition[]): string[] {
    const closure = new Set<string>(stateIds);
    const stack = [...stateIds];

    while (stack.length > 0) {
      const curr = stack.pop()!;
      for (const t of transitions) {
        if (t.from === curr && (t.symbol === 'ε' || t.symbol === 'e' || t.symbol === '')) {
          if (!closure.has(t.to)) {
            closure.add(t.to);
            stack.push(t.to);
          }
        }
      }
    }

    return Array.from(closure).sort();
  }

  /**
   * Computes the transition set from a set of states on a given input symbol.
   */
  static stepStates(
    currentStates: string[],
    symbol: string,
    transitions: AutomatonTransition[],
  ): string[] {
    const nextStates = new Set<string>();
    for (const s of currentStates) {
      for (const t of transitions) {
        if (t.from === s && t.symbol === symbol) {
          nextStates.add(t.to);
        }
      }
    }
    return Array.from(nextStates).sort();
  }

  /**
   * Evaluates an entire input string on a finite automaton.
   */
  static evaluateString(
    fa: FiniteAutomaton,
    input: string,
  ): {
    accepted: boolean;
    history: { states: string[]; symbol?: string; remaining: string }[];
  } {
    let currentStates =
      fa.type === 'ENFA'
        ? this.epsilonClosure([fa.initialStateId], fa.transitions)
        : [fa.initialStateId];

    const history: { states: string[]; symbol?: string; remaining: string }[] = [
      { states: currentStates, remaining: input },
    ];

    for (let i = 0; i < input.length; i++) {
      const char = input[i]!;
      let next = this.stepStates(currentStates, char, fa.transitions);
      if (fa.type === 'ENFA') {
        next = this.epsilonClosure(next, fa.transitions);
      }
      currentStates = next;
      history.push({
        states: currentStates,
        symbol: char,
        remaining: input.slice(i + 1),
      });

      if (currentStates.length === 0) break;
    }

    const accepted = currentStates.some((s) => fa.acceptStateIds.includes(s));
    return { accepted, history };
  }
}
