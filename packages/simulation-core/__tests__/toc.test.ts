import { describe, expect, it } from 'vitest';
import {
  AutomataEngine,
  BINARY_INCREMENTER_TM,
  CFGEngine,
  CyberSecurityAnalyzer,
  CyberThompsonEngine,
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

  describe('CyberShield Automata & Security Engine', () => {
    it('should build ε-NFA via Thompson construction with explainable steps', () => {
      const { enfa, steps } = CyberThompsonEngine.buildEpsilonNFA('(a|b)*abb');
      expect(enfa.alphabet).toContain('a');
      expect(enfa.alphabet).toContain('b');
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0]?.phase).toBe('Parsing');
    });

    it('should eliminate epsilons and convert to NFA', () => {
      const { enfa } = CyberThompsonEngine.buildEpsilonNFA('a*b');
      const nfa = CyberThompsonEngine.removeEpsilon(enfa);
      expect(nfa.alphabet).toEqual(['a', 'b']);
      expect(nfa.finalStates.length).toBeGreaterThan(0);
    });

    it('should convert NFA to DFA via subset construction and minimize with Hopcroft', () => {
      const { enfa } = CyberThompsonEngine.buildEpsilonNFA('ab');
      const nfa = CyberThompsonEngine.removeEpsilon(enfa);
      const { dfa } = CyberThompsonEngine.subsetConstruction(nfa);
      expect(dfa.states.length).toBeGreaterThan(0);

      const { minimalDfa } = CyberThompsonEngine.minimizeDFA(dfa);
      expect(minimalDfa.states.length).toBeLessThanOrEqual(dfa.states.length);

      // Trace valid and invalid strings
      const acceptedTrace = CyberThompsonEngine.traceString(minimalDfa, 'ab');
      expect(acceptedTrace.accepted).toBe(true);

      const rejectedTrace = CyberThompsonEngine.traceString(minimalDfa, 'a');
      expect(rejectedTrace.accepted).toBe(false);
    });

    it('should detect security patterns with automata security scanner', () => {
      const sqliResult = CyberSecurityAnalyzer.scanPayload(
        'SQL-injection-like',
        "admin' or '1'='1' --",
      );
      expect(sqliResult.detected).toBe(true);
      expect(sqliResult.highestSeverity).toBe('critical');
      expect(sqliResult.matchedPatterns.some((p) => p.literal === "' or '")).toBe(true);
      expect(sqliResult.matchedPatterns.some((p) => p.literal === '--')).toBe(true);

      const xssResult = CyberSecurityAnalyzer.scanPayload(
        'XSS-like',
        "<img src=x onerror=alert('PWNED')>",
      );
      expect(xssResult.detected).toBe(true);
      expect(xssResult.matchedPatterns.some((p) => p.literal === 'onerror=')).toBe(true);

      const cleanResult = CyberSecurityAnalyzer.scanPayload(
        'SQL-injection-like',
        'john_doe_99',
      );
      expect(cleanResult.detected).toBe(false);
    });
  });
});

