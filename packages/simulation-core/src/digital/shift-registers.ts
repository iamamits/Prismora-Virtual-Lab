import type { LogicLevel, SIPORegisterState } from './types';

/**
 * 4-Bit Serial-In Parallel-Out (SIPO) Shift Register Engine (74164 / 74195 Architecture)
 * Provides deterministic clock-stepped serial shift execution, multi-bit bitstream feeding,
 * active-low clear, hexadecimal/decimal decoders, and cycle-by-cycle snapshot history.
 */
export class ShiftRegisterEngine {
  private _bits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel] = [0, 0, 0, 0]; // [Q3, Q2, Q1, Q0] (Q3 = MSB)
  private _clockPulses: number = 0;
  private _history: Array<{
    clock: number;
    serialIn: LogicLevel;
    q: [LogicLevel, LogicLevel, LogicLevel, LogicLevel];
  }> = [];

  constructor(initialBits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel] = [0, 0, 0, 0]) {
    this._bits = [...initialBits];
    this._history.push({
      clock: 0,
      serialIn: 0,
      q: [...this._bits],
    });
  }

  get state(): SIPORegisterState {
    const [q3, q2, q1, q0] = this._bits;
    const decimal = (q3 << 3) | (q2 << 2) | (q1 << 1) | q0;
    const hex = '0x' + decimal.toString(16).toUpperCase();

    return {
      bits: [...this._bits],
      decimal,
      hex,
      clockPulses: this._clockPulses,
      history: [...this._history],
    };
  }

  /**
   * Reset register outputs to 0 (Active-Low Asynchronous Master Reset / Clear).
   */
  reset(): SIPORegisterState {
    this._bits = [0, 0, 0, 0];
    this._clockPulses = 0;
    this._history = [
      {
        clock: 0,
        serialIn: 0,
        q: [0, 0, 0, 0],
      },
    ];
    return this.state;
  }

  /**
   * Advance one clock cycle with a given serial input bit.
   * New bit enters at Q0 (LSB), and existing bits shift towards Q3 (MSB).
   *
   * Q3_next = Q2
   * Q2_next = Q1
   * Q1_next = Q0
   * Q0_next = SerialIn
   */
  clockPulse(serialIn: LogicLevel, clearActive: boolean = false): SIPORegisterState {
    if (clearActive) {
      this._bits = [0, 0, 0, 0];
      this._clockPulses++;
      this._history.push({
        clock: this._clockPulses,
        serialIn,
        q: [0, 0, 0, 0],
      });
      return this.state;
    }

    const nextQ3 = this._bits[1]; // Q2 -> Q3
    const nextQ2 = this._bits[2]; // Q1 -> Q2
    const nextQ1 = this._bits[3]; // Q0 -> Q1
    const nextQ0 = serialIn;      // SerialIn -> Q0

    this._bits = [nextQ3, nextQ2, nextQ1, nextQ0];
    this._clockPulses++;

    this._history.push({
      clock: this._clockPulses,
      serialIn,
      q: [...this._bits],
    });

    return this.state;
  }

  /**
   * Feed a complete bitstream sequence through the register (e.g. [1, 0, 1, 1]).
   */
  feedBitstream(stream: LogicLevel[]): SIPORegisterState {
    for (const bit of stream) {
      this.clockPulse(bit);
    }
    return this.state;
  }

  /**
   * Rewind state to a previous clock cycle snapshot.
   */
  rewindTo(clockStep: number): SIPORegisterState | null {
    const entry = this._history.find((h) => h.clock === clockStep);
    if (!entry) return null;

    this._bits = [...entry.q];
    this._clockPulses = entry.clock;
    this._history = this._history.filter((h) => h.clock <= clockStep);
    return this.state;
  }

  /**
   * Static pure evaluator: calculates next state from current state and serial input without instance mutation.
   */
  static shiftStep(
    current: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
    serialIn: LogicLevel,
  ): [LogicLevel, LogicLevel, LogicLevel, LogicLevel] {
    return [current[1], current[2], current[3], serialIn];
  }
}
