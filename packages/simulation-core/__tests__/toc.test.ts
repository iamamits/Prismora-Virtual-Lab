import { describe, expect, it } from 'vitest';
import {
  AutomataEngine,
  BINARY_INCREMENTER_TM,
  CFGEngine,
  DFAMinimization,
  FiniteAutomaton,
  RegexEngine,
  SAMPLE_CNF_AN_BN,
  SubsetConstruction,
  TuringMachineEngine,
} from '../src/toc';

describe('Theory of Computation Simulation Engine', () => {
  describe('Finite Automata Evaluation', () => {
    // DFA accepting strings over {0, 1} ending in '01'
    const dfaEnding01: FiniteAutomaton = {
      id: 'dfa-01',
      name: 'Ends in 01',
      type: 'DFA',
      states: [
        { id: 'q0', label: 'q0', isInitial: true, isAccept: false },
        { id: 'q1', label: 'q1', isInitial: false, isAccept: false },
        { id: 'q2', label: 'q2', isInitial: false, isAccept: true },
      ],
      alphabet: ['0', '1'],
      initialStateId: 'q0',
      acceptStateIds: ['q2'],
      transitions: [
        { from: 'q0', to: 'q1', symbol: '0' },
        { from: 'q0', to: 'q0', symbol: '1' },
        { from: 'q1', to: 'q1', symbol: '0' },
        { from: 'q1', to: 'q2', symbol: '1' },
        { from: 'q2', to: 'q1', symbol: '0' },
        { from: 'q2', to: 'q0', symbol: '1' },
      ],
    };

    it('should correctly accept strings ending in 01 and reject others', () => {
      expect(AutomataEngine.evaluateString(dfaEnding01, '01').accepted).toBe(true);
      expect(AutomataEngine.evaluateString(dfaEnding01, '1001').accepted).toBe(true);
      expect(AutomataEngine.evaluateString(dfaEnding01, '11101').accepted).toBe(true);

      expect(AutomataEngine.evaluateString(dfaEnding01, '00').accepted).toBe(false);
      expect(AutomataEngine.evaluateString(dfaEnding01, '010').accepted).toBe(false);
      expect(AutomataEngine.evaluateString(dfaEnding01, '111').accepted).toBe(false);
    });
  });

  describe('NFA to DFA Subset Construction', () => {
    it('should convert NFA to an equivalent DFA', () => {
      // NFA accepting strings containing 'ab'
      const nfa: FiniteAutomaton = {
        id: 'nfa-ab',
        name: 'Contains ab',
        type: 'NFA',
        states: [
          { id: 'q0', label: 'q0', isInitial: true, isAccept: false },
          { id: 'q1', label: 'q1', isInitial: false, isAccept: false },
          { id: 'q2', label: 'q2', isInitial: false, isAccept: true },
        ],
        alphabet: ['a', 'b'],
        initialStateId: 'q0',
        acceptStateIds: ['q2'],
        transitions: [
          { from: 'q0', to: 'q0', symbol: 'a' },
          { from: 'q0', to: 'q0', symbol: 'b' },
          { from: 'q0', to: 'q1', symbol: 'a' },
          { from: 'q1', to: 'q2', symbol: 'b' },
          { from: 'q2', to: 'q2', symbol: 'a' },
          { from: 'q2', to: 'q2', symbol: 'b' },
        ],
      };

      const dfa = SubsetConstruction.convertNfaToDfa(nfa);
      expect(dfa.type).toBe('DFA');
      expect(AutomataEngine.evaluateString(dfa, 'ab').accepted).toBe(true);
      expect(AutomataEngine.evaluateString(dfa, 'baab').accepted).toBe(true);
      expect(AutomataEngine.evaluateString(dfa, 'ba').accepted).toBe(false);
    });
  });

  describe('DFA Minimization (Hopcroft)', () => {
    it('should minimize DFA by grouping equivalent states', () => {
      // Redundant DFA with duplicate accepting states
      const redundantDfa: FiniteAutomaton = {
        id: 'redundant',
        name: 'Redundant DFA',
        type: 'DFA',
        states: [
          { id: 'A', label: 'A', isInitial: true, isAccept: false },
          { id: 'B', label: 'B', isInitial: false, isAccept: true },
          { id: 'C', label: 'C', isInitial: false, isAccept: true },
        ],
        alphabet: ['0', '1'],
        initialStateId: 'A',
        acceptStateIds: ['B', 'C'],
        transitions: [
          { from: 'A', to: 'B', symbol: '0' },
          { from: 'A', to: 'C', symbol: '1' },
          { from: 'B', to: 'B', symbol: '0' },
          { from: 'B', to: 'B', symbol: '1' },
          { from: 'C', to: 'C', symbol: '0' },
          { from: 'C', to: 'C', symbol: '1' },
        ],
      };

      const minimized = DFAMinimization.minimize(redundantDfa);
      // States B and C are equivalent and should merge, leaving 2 partitions
      expect(minimized.states.length).toBe(2);
      expect(AutomataEngine.evaluateString(minimized, '0').accepted).toBe(true);
      expect(AutomataEngine.evaluateString(minimized, '1').accepted).toBe(true);
      expect(AutomataEngine.evaluateString(minimized, '').accepted).toBe(false);
    });
  });

  describe('Regex & Thompson Construction', () => {
    it('should build an ε-NFA from regex and accept matching strings', () => {
      // Regex: (a|b)*abb
      const nfa = RegexEngine.regexToNFA('(a|b)*abb');
      expect(nfa.type).toBe('ENFA');

      expect(AutomataEngine.evaluateString(nfa, 'abb').accepted).toBe(true);
      expect(AutomataEngine.evaluateString(nfa, 'aabb').accepted).toBe(true);
      expect(AutomataEngine.evaluateString(nfa, 'babb').accepted).toBe(true);
      expect(AutomataEngine.evaluateString(nfa, 'ab').accepted).toBe(false);
    });
  });

  describe('Context-Free Grammars & CYK Parsing', () => {
    it('should parse strings using CYK algorithm for L = { a^n b^n | n >= 1 }', () => {
      const g = SAMPLE_CNF_AN_BN;
      expect(CFGEngine.cykParse(g, 'ab').accepted).toBe(true);
      expect(CFGEngine.cykParse(g, 'aabb').accepted).toBe(true);
      expect(CFGEngine.cykParse(g, 'aaabbb').accepted).toBe(true);

      expect(CFGEngine.cykParse(g, 'a').accepted).toBe(false);
      expect(CFGEngine.cykParse(g, 'ba').accepted).toBe(false);
      expect(CFGEngine.cykParse(g, 'aab').accepted).toBe(false);
    });
  });

  describe('Turing Machine Execution', () => {
    it('should increment binary string by 1 (e.g. 1011 + 1 = 1100)', () => {
      const tm = new TuringMachineEngine(BINARY_INCREMENTER_TM);
      tm.loadInput('1011');

      let steps = 0;
      let state = tm.getState();
      while (!state.halted && steps < 50) {
        state = tm.step();
        steps++;
      }

      expect(state.halted).toBe(true);
      expect(state.accepted).toBe(true);
      // Clean tape output
      const tapeStr = state.tape.join('').replace(/_/g, '');
      expect(tapeStr).toBe('1100');
    });
  });
});
