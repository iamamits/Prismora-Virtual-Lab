import type { FlipFlopState, LogicLevel } from './types';

/**
 * Sequential Logic Components: Latches, Flip-Flops, Registers, and Counters.
 */
export class SequentialEngine {
  /**
   * SR Latch (Active High NOR implementation)
   */
  static srLatch(
    s: LogicLevel,
    r: LogicLevel,
    previousQ: LogicLevel = 0,
  ): FlipFlopState & { invalid: boolean } {
    if (s === 1 && r === 1) {
      // Forbidden state in NOR SR Latch
      return { q: 0, qBar: 0, invalid: true };
    }
    if (s === 1 && r === 0) {
      return { q: 1, qBar: 0, invalid: false };
    }
    if (s === 0 && r === 1) {
      return { q: 0, qBar: 1, invalid: false };
    }
    // No change (s=0, r=0)
    return { q: previousQ, qBar: (previousQ === 1 ? 0 : 1) as LogicLevel, invalid: false };
  }

  /**
   * D Flip-Flop with Clock Edge Trigger (Positive Edge)
   */
  static dFlipFlop(
    d: LogicLevel,
    clockRisingEdge: boolean,
    previousQ: LogicLevel = 0,
    resetAsync: boolean = false,
  ): FlipFlopState {
    if (resetAsync) {
      return { q: 0, qBar: 1 };
    }
    if (clockRisingEdge) {
      return { q: d, qBar: (d === 1 ? 0 : 1) as LogicLevel };
    }
    return { q: previousQ, qBar: (previousQ === 1 ? 0 : 1) as LogicLevel };
  }

  /**
   * JK Flip-Flop with Toggle Mode on J=1, K=1
   */
  static jkFlipFlop(
    j: LogicLevel,
    k: LogicLevel,
    clockRisingEdge: boolean,
    previousQ: LogicLevel = 0,
  ): FlipFlopState {
    if (!clockRisingEdge) {
      return { q: previousQ, qBar: (previousQ === 1 ? 0 : 1) as LogicLevel };
    }

    if (j === 0 && k === 0) {
      // Hold
      return { q: previousQ, qBar: (previousQ === 1 ? 0 : 1) as LogicLevel };
    }
    if (j === 0 && k === 1) {
      // Reset
      return { q: 0, qBar: 1 };
    }
    if (j === 1 && k === 0) {
      // Set
      return { q: 1, qBar: 0 };
    }
    // Toggle (J=1, K=1)
    const toggled = (previousQ === 1 ? 0 : 1) as LogicLevel;
    return { q: toggled, qBar: previousQ };
  }

  /**
   * T Flip-Flop (Toggle Flip-Flop)
   */
  static tFlipFlop(
    t: LogicLevel,
    clockRisingEdge: boolean,
    previousQ: LogicLevel = 0,
  ): FlipFlopState {
    if (!clockRisingEdge) {
      return { q: previousQ, qBar: (previousQ === 1 ? 0 : 1) as LogicLevel };
    }
    if (t === 1) {
      const toggled = (previousQ === 1 ? 0 : 1) as LogicLevel;
      return { q: toggled, qBar: previousQ };
    }
    return { q: previousQ, qBar: (previousQ === 1 ? 0 : 1) as LogicLevel };
  }

  /**
   * 4-Bit Universal Shift Register
   * modes:
   * 0: Hold
   * 1: Shift Right (Serial In Right)
   * 2: Shift Left (Serial In Left)
   * 3: Parallel Load
   */
  static shiftRegister4Bit(
    currentState: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
    mode: 0 | 1 | 2 | 3,
    parallelIn: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
    serialInRight: LogicLevel = 0,
    serialInLeft: LogicLevel = 0,
    clockRisingEdge: boolean = true,
  ): [LogicLevel, LogicLevel, LogicLevel, LogicLevel] {
    if (!clockRisingEdge) return [...currentState];

    switch (mode) {
      case 0: // Hold
        return [...currentState];
      case 1: // Shift Right (MSB towards LSB)
        return [serialInRight, currentState[0]!, currentState[1]!, currentState[2]!];
      case 2: // Shift Left (LSB towards MSB)
        return [currentState[1]!, currentState[2]!, currentState[3]!, serialInLeft];
      case 3: // Parallel Load
        return [...parallelIn];
    }
  }

  /**
   * 4-Bit Synchronous Up/Down Counter
   */
  static counter4Bit(
    currentCount: number, // 0..15
    upNotDown: boolean, // true = Up, false = Down
    enable: boolean = true,
    reset: boolean = false,
    clockRisingEdge: boolean = true,
  ): {
    count: number;
    binary: [LogicLevel, LogicLevel, LogicLevel, LogicLevel];
    terminalCount: boolean; // Carry/Borrow output
  } {
    if (reset) {
      return { count: 0, binary: [0, 0, 0, 0], terminalCount: false };
    }
    if (!clockRisingEdge || !enable) {
      const b0 = ((currentCount >> 0) & 1) as LogicLevel;
      const b1 = ((currentCount >> 1) & 1) as LogicLevel;
      const b2 = ((currentCount >> 2) & 1) as LogicLevel;
      const b3 = ((currentCount >> 3) & 1) as LogicLevel;
      return { count: currentCount, binary: [b0, b1, b2, b3], terminalCount: false };
    }

    let nextCount: number;
    let tc = false;

    if (upNotDown) {
      nextCount = (currentCount + 1) % 16;
      tc = currentCount === 15;
    } else {
      nextCount = currentCount === 0 ? 15 : currentCount - 1;
      tc = currentCount === 0;
    }

    const b0 = ((nextCount >> 0) & 1) as LogicLevel;
    const b1 = ((nextCount >> 1) & 1) as LogicLevel;
    const b2 = ((nextCount >> 2) & 1) as LogicLevel;
    const b3 = ((nextCount >> 3) & 1) as LogicLevel;

    return { count: nextCount, binary: [b0, b1, b2, b3], terminalCount: tc };
  }
}
