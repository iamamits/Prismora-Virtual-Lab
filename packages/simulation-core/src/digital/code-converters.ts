import type { GrayCodeResult, LogicLevel } from './types';

/**
 * 4-Bit Binary-to-Gray and Gray-to-Binary Code Converter Engine
 * Implements hardware XOR gate tree topologies, analytical derivation expressions,
 * and Hamming distance validation for rotary encoder position sensing.
 */
export class CodeConverterEngine {
  /**
   * Convert 4-bit Binary to Gray Code:
   *   G3 = B3
   *   G2 = B3 ⊕ B2
   *   G1 = B2 ⊕ B1
   *   G0 = B1 ⊕ B0
   */
  static binaryToGray(
    binaryBits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
  ): GrayCodeResult {
    const [b3, b2, b1, b0] = binaryBits;

    const g3 = b3;
    const g2 = ((b3 ^ b2) & 1) as LogicLevel;
    const g1 = ((b2 ^ b1) & 1) as LogicLevel;
    const g0 = ((b1 ^ b0) & 1) as LogicLevel;

    const grayBits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel] = [g3, g2, g1, g0];
    const binaryInt = (b3 << 3) | (b2 << 2) | (b1 << 1) | b0;
    const grayInt = (g3 << 3) | (g2 << 2) | (g1 << 1) | g0;

    const xorEquations = [
      `G3 = B3 = ${g3}`,
      `G2 = B3 ⊕ B2 = ${b3} ⊕ ${b2} = ${g2}`,
      `G1 = B2 ⊕ B1 = ${b2} ⊕ ${b1} = ${g1}`,
      `G0 = B1 ⊕ B0 = ${b1} ⊕ ${b0} = ${g0}`,
    ];

    return {
      binary: binaryBits,
      gray: grayBits,
      binaryInt,
      grayInt,
      binaryString: binaryBits.join(''),
      grayString: grayBits.join(''),
      xorEquations,
    };
  }

  /**
   * Convert 4-bit Gray Code back to Binary:
   *   B3 = G3
   *   B2 = B3 ⊕ G2
   *   B1 = B2 ⊕ G1
   *   B0 = B1 ⊕ G0
   */
  static grayToBinary(
    grayBits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
  ): GrayCodeResult {
    const [g3, g2, g1, g0] = grayBits;

    const b3 = g3;
    const b2 = ((b3 ^ g2) & 1) as LogicLevel;
    const b1 = ((b2 ^ g1) & 1) as LogicLevel;
    const b0 = ((b1 ^ g0) & 1) as LogicLevel;

    const binaryBits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel] = [b3, b2, b1, b0];
    const binaryInt = (b3 << 3) | (b2 << 2) | (b1 << 1) | b0;
    const grayInt = (g3 << 3) | (g2 << 2) | (g1 << 1) | g0;

    const xorEquations = [
      `B3 = G3 = ${b3}`,
      `B2 = B3 ⊕ G2 = ${b3} ⊕ ${g2} = ${b2}`,
      `B1 = B2 ⊕ G1 = ${b2} ⊕ ${g1} = ${b1}`,
      `B0 = B1 ⊕ G0 = ${b1} ⊕ ${g0} = ${b0}`,
    ];

    return {
      binary: binaryBits,
      gray: grayBits,
      binaryInt,
      grayInt,
      binaryString: binaryBits.join(''),
      grayString: grayBits.join(''),
      xorEquations,
    };
  }

  /**
   * Calculate Hamming distance between two 4-bit words (number of differing bit positions).
   */
  static computeHammingDistance(
    wordA: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
    wordB: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
  ): number {
    let diff = 0;
    for (let i = 0; i < 4; i++) {
      if (wordA[i] !== wordB[i]) diff++;
    }
    return diff;
  }

  /**
   * Generate exhaustive 16-state code table verifying the unit Hamming distance (H=1) property.
   */
  static generateFullTable(): Array<{
    index: number;
    binaryString: string;
    grayString: string;
    hammingDistanceToPrevious: number;
  }> {
    const table = [];
    let prevGray: [LogicLevel, LogicLevel, LogicLevel, LogicLevel] | null = null;

    for (let i = 0; i < 16; i++) {
      const b3 = ((i >> 3) & 1) as LogicLevel;
      const b2 = ((i >> 2) & 1) as LogicLevel;
      const b1 = ((i >> 1) & 1) as LogicLevel;
      const b0 = (i & 1) as LogicLevel;

      const res = this.binaryToGray([b3, b2, b1, b0]);
      const hamming = prevGray ? this.computeHammingDistance(prevGray, res.gray) : 0;
      prevGray = res.gray;

      table.push({
        index: i,
        binaryString: res.binaryString,
        grayString: res.grayString,
        hammingDistanceToPrevious: hamming,
      });
    }

    return table;
  }
}
