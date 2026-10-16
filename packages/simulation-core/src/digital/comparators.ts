import type {
  Comparator1BitResult,
  Comparator2BitResult,
  Comparator4BitResult,
  LogicLevel,
} from './types';

/**
 * Magnitude Comparator Engine (1-Bit, 2-Bit, and 4-Bit 74LS85 Architecture)
 * Evaluates binary word magnitudes (A > B, A = B, A < B) using bitwise equality
 * and hierarchical cascaded comparison logic trees.
 */
export class ComparatorsEngine {
  /**
   * 1-Bit Magnitude Comparator:
   *   A > B: A · ¬B
   *   A = B: ¬(A ⊕ B)  (XNOR)
   *   A < B: ¬A · B
   */
  static compare1Bit(a: LogicLevel, b: LogicLevel): Comparator1BitResult {
    const aGtB = (a === 1 && b === 0 ? 1 : 0) as LogicLevel;
    const aEqB = (a === b ? 1 : 0) as LogicLevel;
    const aLtB = (a === 0 && b === 1 ? 1 : 0) as LogicLevel;

    return {
      aGreaterThanB: aGtB,
      aEqualToB: aEqB,
      aLessThanB: aLtB,
    };
  }

  /**
   * 2-Bit Magnitude Comparator:
   *   Inputs: A1 A0 and B1 B0
   *   x1 = ¬(A1 ⊕ B1)  [MSB equality]
   *   x0 = ¬(A0 ⊕ B0)  [LSB equality]
   *   A = B: x1 · x0
   *   A > B: (A1 · ¬B1) + (x1 · A0 · ¬B0)
   *   A < B: (¬A1 · B1) + (x1 · ¬A0 · B0)
   */
  static compare2Bit(
    a: [LogicLevel, LogicLevel], // [A1 (MSB), A0 (LSB)]
    b: [LogicLevel, LogicLevel], // [B1 (MSB), B0 (LSB)]
  ): Comparator2BitResult {
    const [a1, a0] = a;
    const [b1, b0] = b;

    const x1 = (a1 === b1 ? 1 : 0) as LogicLevel;
    const x0 = (a0 === b0 ? 1 : 0) as LogicLevel;

    const msbGt = (a1 === 1 && b1 === 0 ? 1 : 0) as LogicLevel;
    const lsbGt = (a0 === 1 && b0 === 0 ? 1 : 0) as LogicLevel;

    const msbLt = (a1 === 0 && b1 === 1 ? 1 : 0) as LogicLevel;
    const lsbLt = (a0 === 0 && b0 === 1 ? 1 : 0) as LogicLevel;

    const aGtB = (msbGt === 1 || (x1 === 1 && lsbGt === 1) ? 1 : 0) as LogicLevel;
    const aEqB = (x1 === 1 && x0 === 1 ? 1 : 0) as LogicLevel;
    const aLtB = (msbLt === 1 || (x1 === 1 && lsbLt === 1) ? 1 : 0) as LogicLevel;

    return {
      aGreaterThanB: aGtB,
      aEqualToB: aEqB,
      aLessThanB: aLtB,
      terms: {
        msbCompare: `(A1 · ¬B1) = ${msbGt}, (¬A1 · B1) = ${msbLt}`,
        equality: `x1 = ${x1}, x0 = ${x0} → A=B is ${aEqB}`,
        lsbCompare: `(x1 · A0 · ¬B0) = ${x1 && lsbGt ? 1 : 0}`,
      },
    };
  }

  /**
   * 4-Bit Magnitude Comparator (74LS85 Model with Cascading Inputs):
   *   Inputs: A3..A0, B3..B0, plus cascade inputs (I_gt, I_eq, I_lt)
   */
  static compare4Bit(
    aBits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
    bBits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
    cascadeIn: { gt?: LogicLevel; eq?: LogicLevel; lt?: LogicLevel } = { gt: 0, eq: 1, lt: 0 },
  ): Comparator4BitResult {
    const aVal = (aBits[0] << 3) | (aBits[1] << 2) | (aBits[2] << 1) | aBits[3];
    const bVal = (bBits[0] << 3) | (bBits[1] << 2) | (bBits[2] << 1) | bBits[3];

    let aGtB: LogicLevel = 0;
    let aEqB: LogicLevel = 0;
    let aLtB: LogicLevel = 0;

    if (aVal > bVal) {
      aGtB = 1;
    } else if (aVal < bVal) {
      aLtB = 1;
    } else {
      // aVal === bVal: cascade resolution
      if (cascadeIn.eq === 1) {
        aEqB = 1;
      } else if (cascadeIn.gt === 1) {
        aGtB = 1;
      } else if (cascadeIn.lt === 1) {
        aLtB = 1;
      }
    }

    return {
      aGreaterThanB: aGtB,
      aEqualToB: aEqB,
      aLessThanB: aLtB,
      a: aVal,
      b: bVal,
    };
  }

  /**
   * Generate complete truth table for 2-bit comparator (16 combinations).
   */
  static generate2BitTable(): Array<{
    a1: LogicLevel;
    a0: LogicLevel;
    b1: LogicLevel;
    b0: LogicLevel;
    aInt: number;
    bInt: number;
    aGtB: LogicLevel;
    aEqB: LogicLevel;
    aLtB: LogicLevel;
  }> {
    const table = [];
    for (let aInt = 0; aInt < 4; aInt++) {
      for (let bInt = 0; bInt < 4; bInt++) {
        const a1 = ((aInt >> 1) & 1) as LogicLevel;
        const a0 = (aInt & 1) as LogicLevel;
        const b1 = ((bInt >> 1) & 1) as LogicLevel;
        const b0 = (bInt & 1) as LogicLevel;

        const res = this.compare2Bit([a1, a0], [b1, b0]);
        table.push({
          a1,
          a0,
          b1,
          b0,
          aInt,
          bInt,
          aGtB: res.aGreaterThanB,
          aEqB: res.aEqualToB,
          aLtB: res.aLessThanB,
        });
      }
    }
    return table;
  }
}
