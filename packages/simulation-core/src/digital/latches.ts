import type { ExtendedLatchState, LatchType, LogicLevel } from './types';

/**
 * Latches and Bistable Multivibrators Engine
 * Models cross-coupled NOR and NAND latches with explicit feedback loops,
 * indeterminate/forbidden states, race hazards, and propagation delay differential resolution.
 */
export class LatchesEngine {
  /**
   * Evaluate Active-High NOR Latch with cross-coupled feedback.
   *
   * Upper NOR (Reset Gate): Q_bar = ¬(R + Q)
   * Lower NOR (Set Gate):   Q     = ¬(S + Q_bar)
   */
  static evaluateNorLatch(
    s: LogicLevel,
    r: LogicLevel,
    prevQ: LogicLevel = 0,
    prevQBar: LogicLevel = 1,
    delayDifferentialNs: number = 0, // >0: Set gate is faster; <0: Reset gate is faster
  ): ExtendedLatchState {
    if (s === 1 && r === 1) {
      // Forbidden state: both NOR outputs forced to 0
      return {
        q: 0,
        qBar: 0,
        invalid: true,
        stateName: 'INDETERMINATE',
        raceHazard: true,
        explanation:
          'Indeterminate State (S=1, R=1): Both NOR gate outputs are forced LOW (Q=0, Q̄=0). Complementarity Q ≠ Q̄ is violated!',
      };
    }

    if (s === 1 && r === 0) {
      return {
        q: 1,
        qBar: 0,
        invalid: false,
        stateName: 'SET',
        raceHazard: false,
        explanation: 'Set State (S=1, R=0): Output Q driven HIGH (1), Q̄ driven LOW (0).',
      };
    }

    if (s === 0 && r === 1) {
      return {
        q: 0,
        qBar: 1,
        invalid: false,
        stateName: 'RESET',
        raceHazard: false,
        explanation: 'Reset State (S=0, R=1): Output Q driven LOW (0), Q̄ driven HIGH (1).',
      };
    }

    // s === 0 && r === 0 (Hold)
    // If coming from an indeterminate state (both were 0), resolve race condition!
    if (prevQ === 0 && prevQBar === 0) {
      let resolvedQ: LogicLevel = 1;
      let resolvedQBar: LogicLevel = 0;

      if (delayDifferentialNs < 0) {
        // Reset gate faster
        resolvedQ = 0;
        resolvedQBar = 1;
      } else if (delayDifferentialNs > 0) {
        // Set gate faster
        resolvedQ = 1;
        resolvedQBar = 0;
      } else {
        // Equal delay: quasi-stable default to Set
        resolvedQ = 1;
        resolvedQBar = 0;
      }

      return {
        q: resolvedQ,
        qBar: resolvedQBar,
        invalid: false,
        stateName: 'HOLD',
        raceHazard: true,
        explanation: `Critical Race Resolved: Transition from (1,1) to (0,0) broke symmetry. Gate delay skew (${delayDifferentialNs}ns) determined final state Q=${resolvedQ}.`,
      };
    }

    return {
      q: prevQ,
      qBar: prevQBar,
      invalid: false,
      stateName: 'HOLD',
      raceHazard: false,
      explanation: 'Memory / Hold State (S=0, R=0): Outputs retain their previous stable values.',
    };
  }

  /**
   * Evaluate Active-Low NAND Latch (S̄-R̄ Latch).
   *
   * Upper NAND: Q     = ¬(S̄ · Q_bar)
   * Lower NAND: Q_bar = ¬(R̄ · Q)
   */
  static evaluateNandLatch(
    sBar: LogicLevel,
    rBar: LogicLevel,
    prevQ: LogicLevel = 1,
    prevQBar: LogicLevel = 0,
    delayDifferentialNs: number = 0,
  ): ExtendedLatchState {
    if (sBar === 0 && rBar === 0) {
      // Forbidden state: both NAND outputs forced to 1
      return {
        q: 1,
        qBar: 1,
        invalid: true,
        stateName: 'INDETERMINATE',
        raceHazard: true,
        explanation:
          'Indeterminate State (S̄=0, R̄=0): Both NAND gate outputs forced HIGH (Q=1, Q̄=1). Complementarity violated!',
      };
    }

    if (sBar === 0 && rBar === 1) {
      return {
        q: 1,
        qBar: 0,
        invalid: false,
        stateName: 'SET',
        raceHazard: false,
        explanation: 'Set State (S̄=0, R̄=1): Active-low Set asserts Q=1, Q̄=0.',
      };
    }

    if (sBar === 1 && rBar === 0) {
      return {
        q: 0,
        qBar: 1,
        invalid: false,
        stateName: 'RESET',
        raceHazard: false,
        explanation: 'Reset State (S̄=1, R̄=0): Active-low Reset asserts Q=0, Q̄=1.',
      };
    }

    // sBar === 1 && rBar === 1 (Hold)
    if (prevQ === 1 && prevQBar === 1) {
      // Transitioned from (0,0) -> (1,1)
      let resolvedQ: LogicLevel = 1;
      let resolvedQBar: LogicLevel = 0;

      if (delayDifferentialNs < 0) {
        resolvedQ = 0;
        resolvedQBar = 1;
      } else {
        resolvedQ = 1;
        resolvedQBar = 0;
      }

      return {
        q: resolvedQ,
        qBar: resolvedQBar,
        invalid: false,
        stateName: 'HOLD',
        raceHazard: true,
        explanation: `Critical Race Resolved: Transition from (0,0) to (1,1) broke symmetry. Final settled state Q=${resolvedQ}.`,
      };
    }

    return {
      q: prevQ,
      qBar: prevQBar,
      invalid: false,
      stateName: 'HOLD',
      raceHazard: false,
      explanation: 'Memory / Hold State (S̄=1, R̄=1): Latched outputs remain unchanged.',
    };
  }

  /**
   * Evaluate Gated SR Latch with Enable (Clock/Gate).
   */
  static evaluateGatedSrLatch(
    s: LogicLevel,
    r: LogicLevel,
    enable: LogicLevel,
    prevQ: LogicLevel = 0,
    prevQBar: LogicLevel = 1,
  ): ExtendedLatchState {
    if (enable === 0) {
      return {
        q: prevQ,
        qBar: prevQBar,
        invalid: false,
        stateName: 'HOLD',
        raceHazard: false,
        explanation: 'Gated / Inactive (Enable=0): Inputs S and R are blocked. State is preserved.',
      };
    }

    return this.evaluateNorLatch(s, r, prevQ, prevQBar);
  }

  /**
   * Generate exhaustive excitation and truth table for a given latch type.
   */
  static generateLatchTable(latchType: LatchType): Array<{
    input1Label: string;
    input1: LogicLevel;
    input2Label: string;
    input2: LogicLevel;
    qNext: LogicLevel;
    qBarNext: LogicLevel;
    stateName: string;
    isForbidden: boolean;
  }> {
    const isNand = latchType === 'NAND';
    const in1 = isNand ? 'S̄' : 'S';
    const in2 = isNand ? 'R̄' : 'R';

    const states: Array<[LogicLevel, LogicLevel]> = [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ];

    return states.map(([a, b]) => {
      const res = isNand
        ? this.evaluateNandLatch(a, b, 0, 1)
        : this.evaluateNorLatch(a, b, 0, 1);

      return {
        input1Label: in1,
        input1: a,
        input2Label: in2,
        input2: b,
        qNext: res.q,
        qBarNext: res.qBar,
        stateName: res.stateName,
        isForbidden: res.invalid,
      };
    });
  }
}
