import type { KMapCell, KMapGrouping, KMapResult } from './types';

// Standard Gray Code Sequences
const GRAY_2BIT = ['00', '01', '11', '10'];
const GRAY_1BIT = ['0', '1'];

/**
 * Quine-McCluskey Boolean Minimization and Karnaugh Map Generator.
 * Supports 2, 3, and 4 variables.
 */
export class KMapEngine {
  /**
   * Generates a 2, 3, or 4 variable K-map with Gray code mapping.
   */
  static generateKMap(
    numVars: 2 | 3 | 4,
    mintermValues: Record<number, 0 | 1 | 'X'>,
  ): KMapResult {
    let variableNames: string[];
    let rowGray: string[];
    let colGray: string[];

    if (numVars === 2) {
      variableNames = ['A', 'B'];
      rowGray = GRAY_1BIT; // A: 0, 1
      colGray = GRAY_1BIT; // B: 0, 1
    } else if (numVars === 3) {
      variableNames = ['A', 'B', 'C'];
      rowGray = GRAY_1BIT; // A: 0, 1
      colGray = GRAY_2BIT; // BC: 00, 01, 11, 10
    } else {
      variableNames = ['A', 'B', 'C', 'D'];
      rowGray = GRAY_2BIT; // AB: 00, 01, 11, 10
      colGray = GRAY_2BIT; // CD: 00, 01, 11, 10
    }

    const cells: KMapCell[][] = [];

    for (let r = 0; r < rowGray.length; r++) {
      const rowArr: KMapCell[] = [];
      const rowBits = rowGray[r]!;

      for (let c = 0; c < colGray.length; c++) {
        const colBits = colGray[c]!;
        const fullBits = rowBits + colBits;
        const mintermIndex = parseInt(fullBits, 2);
        const value = mintermValues[mintermIndex] ?? 0;

        rowArr.push({
          row: r,
          col: c,
          rowLabel: rowBits,
          colLabel: colBits,
          mintermIndex,
          value,
        });
      }
      cells.push(rowArr);
    }

    // Extract ones and don't-cares
    const ones: number[] = [];
    const dontCares: number[] = [];
    const totalCells = Math.pow(2, numVars);

    for (let i = 0; i < totalCells; i++) {
      const val = mintermValues[i] ?? 0;
      if (val === 1) ones.push(i);
      else if (val === 'X') dontCares.push(i);
    }

    const primeImplicants = this.solveQuineMcCluskey(numVars, ones, dontCares, variableNames);
    const minimalSOP = this.buildSOPExpression(primeImplicants, ones.length, totalCells);

    // Complement for POS
    const zeros: number[] = [];
    for (let i = 0; i < totalCells; i++) {
      const val = mintermValues[i] ?? 0;
      if (val === 0) zeros.push(i);
    }
    const zeroImplicants = this.solveQuineMcCluskey(numVars, zeros, dontCares, variableNames);
    const minimalPOS = this.buildPOSExpression(zeroImplicants, zeros.length, totalCells);

    return {
      numVariables: numVars,
      variableNames,
      cells,
      rowLabels: rowGray,
      colLabels: colGray,
      primeImplicants,
      essentialPrimeImplicants: primeImplicants, // In our grouping representation
      minimalSOP,
      minimalPOS,
    };
  }

  /**
   * Quine-McCluskey algorithm implementation for finding prime implicants.
   */
  private static solveQuineMcCluskey(
    numVars: number,
    ones: number[],
    dontCares: number[],
    varNames: string[],
  ): KMapGrouping[] {
    if (ones.length === 0) return [];
    if (ones.length + dontCares.length === Math.pow(2, numVars)) {
      return [{ id: 'all-ones', minterms: [...ones, ...dontCares], term: '1', color: '#2563EB' }];
    }

    const allIndices = [...ones, ...dontCares];

    // Convert each index into binary string with dashes representation
    interface Term {
      binary: string; // e.g. "01-0"
      minterms: number[];
      used: boolean;
    }

    let groups: Term[] = allIndices.map((idx) => ({
      binary: idx.toString(2).padStart(numVars, '0'),
      minterms: [idx],
      used: false,
    }));

    const primeImplicants: Term[] = [];

    while (groups.length > 0) {
      const nextGroups: Term[] = [];
      const seen = new Set<string>();

      for (let i = 0; i < groups.length; i++) {
        for (let j = i + 1; j < groups.length; j++) {
          const t1 = groups[i]!;
          const t2 = groups[j]!;

          // Check if they differ by exactly one non-dash bit
          let diffCount = 0;
          let diffPos = -1;

          for (let b = 0; b < numVars; b++) {
            if (t1.binary[b] !== t2.binary[b]) {
              diffCount++;
              diffPos = b;
            }
          }

          if (diffCount === 1) {
            t1.used = true;
            t2.used = true;

            const combinedBinary =
              t1.binary.substring(0, diffPos) + '-' + t1.binary.substring(diffPos + 1);

            const combinedMinterms = Array.from(new Set([...t1.minterms, ...t2.minterms])).sort(
              (a, b) => a - b,
            );

            if (!seen.has(combinedBinary)) {
              seen.add(combinedBinary);
              nextGroups.push({
                binary: combinedBinary,
                minterms: combinedMinterms,
                used: false,
              });
            }
          }
        }
      }

      for (const t of groups) {
        if (!t.used) {
          // Verify it covers at least one required '1' minterm
          if (t.minterms.some((m) => ones.includes(m))) {
            if (!primeImplicants.some((pi) => pi.binary === t.binary)) {
              primeImplicants.push(t);
            }
          }
        }
      }

      groups = nextGroups;
    }

    // Colors from Prismora solid brand palette
    const GROUP_COLORS = ['#2563EB', '#06B6D4', '#8B5CF6', '#F43F5E', '#EC4899', '#FBBF24', '#22C55E'];

    return primeImplicants.map((pi, idx) => {
      let term = '';
      for (let b = 0; b < numVars; b++) {
        const char = pi.binary[b];
        const vName = varNames[b];
        if (char === '1') {
          term += vName;
        } else if (char === '0') {
          term += `${vName}'`;
        }
      }
      if (term === '') term = '1';

      return {
        id: `pi-${idx}`,
        minterms: pi.minterms,
        term,
        color: GROUP_COLORS[idx % GROUP_COLORS.length]!,
      };
    });
  }

  private static buildSOPExpression(
    groupings: KMapGrouping[],
    onesCount: number,
    totalCount: number,
  ): string {
    if (onesCount === 0) return '0';
    if (groupings.length === 0) return '0';
    if (groupings.some((g) => g.term === '1') && onesCount === totalCount) return '1';
    return groupings.map((g) => g.term).join(' + ') || '0';
  }

  private static buildPOSExpression(
    zeroGroupings: KMapGrouping[],
    zerosCount: number,
    totalCount: number,
  ): string {
    if (zerosCount === 0) return '1';
    if (zeroGroupings.length === 0) return '1';
    if (zeroGroupings.some((g) => g.term === '1') && zerosCount === totalCount) return '0';

    return zeroGroupings
      .map((g) => {
        // Invert literals for POS
        // e.g., term "A'B" in 0s means maxterm (A + B')
        const parts = [];
        let i = 0;
        while (i < g.term.length) {
          const varName = g.term[i]!;
          if (i + 1 < g.term.length && g.term[i + 1] === "'") {
            // was A' in zero term → becomes A
            parts.push(varName);
            i += 2;
          } else {
            // was A in zero term → becomes A'
            parts.push(`${varName}'`);
            i += 1;
          }
        }
        return `(${parts.join(' + ')})`;
      })
      .join(' · ') || '1';
  }
}
