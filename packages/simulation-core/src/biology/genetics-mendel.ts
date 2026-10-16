/**
 * Prismora Biology & Genetics Scientific Engine
 * Mendelian Inheritance, Monohybrid & Dihybrid Cross, Punnett Squares & Linkage
 *
 * References:
 * - NCERT Class 12 Biology: Chapter 5 (Principles of Inheritance and Variation)
 * - Gregor Mendel's Experiments on Plant Hybridization (1866)
 * - Principles of Genetics (Snustad & Simmons)
 */

export type AllelePair = [string, string]; // e.g. ['T', 't'] or ['Y', 'y']

export interface MonohybridResult {
  p1Genotype: string;
  p2Genotype: string;
  gametesP1: string[];
  gametesP2: string[];
  punnettGrid: string[][];
  genotypicRatio: Record<string, number>;
  phenotypicRatio: Record<string, number>;
  dominantTrait: string;
  recessiveTrait: string;
  chiSquareValue: number;
}

export interface DihybridResult {
  p1Genotype: string;
  p2Genotype: string;
  gametesP1: string[];
  gametesP2: string[];
  punnettGrid: string[][];
  genotypicRatio: Record<string, number>;
  phenotypicRatio: Record<string, number>;
  traits: {
    trait1: { dominant: string; recessive: string; symbolDom: string; symbolRec: string };
    trait2: { dominant: string; recessive: string; symbolDom: string; symbolRec: string };
  };
}

/**
 * Solve a Mendelian Monohybrid Cross (e.g. Tt x Tt)
 */
export function solveMonohybridCross(
  parent1: string, // e.g. "Tt"
  parent2: string, // e.g. "Tt"
  dominantTrait: string = 'Tall',
  recessiveTrait: string = 'Dwarf'
): MonohybridResult {
  const g1 = parent1.split('');
  const g2 = parent2.split('');

  const gametesP1 = [g1[0] ?? 'T', g1[1] ?? 't'];
  const gametesP2 = [g2[0] ?? 'T', g2[1] ?? 't'];

  const punnettGrid: string[][] = [];
  const genotypicCounts: Record<string, number> = {};
  const phenotypicCounts: Record<string, number> = {
    [dominantTrait]: 0,
    [recessiveTrait]: 0,
  };

  const domAllele = gametesP1[0]?.toUpperCase() ?? 'T';
  const recAllele = domAllele.toLowerCase();

  for (let r = 0; r < 2; r++) {
    const row: string[] = [];
    for (let c = 0; c < 2; c++) {
      const a1 = gametesP1[r]!;
      const a2 = gametesP2[c]!;
      // Standardize ordering: capital letter first
      const combo = a1 === domAllele || a2 === domAllele ? `${domAllele}${a1 === domAllele ? a2 : a1}` : `${recAllele}${recAllele}`;
      row.push(combo);

      genotypicCounts[combo] = (genotypicCounts[combo] ?? 0) + 1;

      if (combo.includes(domAllele)) {
        phenotypicCounts[dominantTrait] = (phenotypicCounts[dominantTrait] ?? 0) + 1;
      } else {
        phenotypicCounts[recessiveTrait] = (phenotypicCounts[recessiveTrait] ?? 0) + 1;
      }
    }
    punnettGrid.push(row);
  }

  // Chi-Square Goodness of Fit (expected 3:1 ratio for heterozygote cross)
  let chiSquareValue = 0;
  if (parent1 === `${domAllele}${recAllele}` && parent2 === `${domAllele}${recAllele}`) {
    const expDom = 3;
    const expRec = 1;
    const obsDom = phenotypicCounts[dominantTrait] ?? 0;
    const obsRec = phenotypicCounts[recessiveTrait] ?? 0;
    chiSquareValue = Math.pow(obsDom - expDom, 2) / expDom + Math.pow(obsRec - expRec, 2) / expRec;
  }

  return {
    p1Genotype: parent1,
    p2Genotype: parent2,
    gametesP1,
    gametesP2,
    punnettGrid,
    genotypicRatio: genotypicCounts,
    phenotypicRatio: phenotypicCounts,
    dominantTrait,
    recessiveTrait,
    chiSquareValue: Number(chiSquareValue.toFixed(3)),
  };
}

/**
 * Solve a Mendelian Dihybrid Cross (e.g. RrYy x RrYy)
 */
export function solveDihybridCross(
  parent1: string = 'RrYy',
  parent2: string = 'RrYy'
): DihybridResult {
  const p1Alleles = parent1.split('');
  const p2Alleles = parent2.split('');

  // Gametes: combinations of 1st gene and 2nd gene
  const g1_a = [p1Alleles[0] ?? 'R', p1Alleles[1] ?? 'r'];
  const g1_b = [p1Alleles[2] ?? 'Y', p1Alleles[3] ?? 'y'];
  const gametesP1: string[] = [];
  for (const a of g1_a) {
    for (const b of g1_b) {
      gametesP1.push(`${a}${b}`);
    }
  }

  const g2_a = [p2Alleles[0] ?? 'R', p2Alleles[1] ?? 'r'];
  const g2_b = [p2Alleles[2] ?? 'Y', p2Alleles[3] ?? 'y'];
  const gametesP2: string[] = [];
  for (const a of g2_a) {
    for (const b of g2_b) {
      gametesP2.push(`${a}${b}`);
    }
  }

  const punnettGrid: string[][] = [];
  const genotypicCounts: Record<string, number> = {};
  const phenotypicCounts: Record<string, number> = {
    'Round Yellow': 0,
    'Round Green': 0,
    'Wrinkled Yellow': 0,
    'Wrinkled Green': 0,
  };

  for (let r = 0; r < 4; r++) {
    const row: string[] = [];
    for (let c = 0; c < 4; c++) {
      const gA = gametesP1[r]!;
      const gB = gametesP2[c]!;

      // Sort alleles for gene 1 (R/r) and gene 2 (Y/y)
      const r1 = gA[0]!;
      const r2 = gB[0]!;
      const rCombo = (r1 === 'R' || r2 === 'R') ? `R${r1 === 'R' ? r2 : r1}` : 'rr';

      const y1 = gA[1]!;
      const y2 = gB[1]!;
      const yCombo = (y1 === 'Y' || y2 === 'Y') ? `Y${y1 === 'Y' ? y2 : y1}` : 'yy';

      const fullGenotype = `${rCombo}${yCombo}`;
      row.push(fullGenotype);

      genotypicCounts[fullGenotype] = (genotypicCounts[fullGenotype] ?? 0) + 1;

      // Phenotype determination
      const isRound = fullGenotype.includes('R');
      const isYellow = fullGenotype.includes('Y');

      if (isRound && isYellow) phenotypicCounts['Round Yellow']!++;
      else if (isRound && !isYellow) phenotypicCounts['Round Green']!++;
      else if (!isRound && isYellow) phenotypicCounts['Wrinkled Yellow']!++;
      else phenotypicCounts['Wrinkled Green']!++;
    }
    punnettGrid.push(row);
  }

  return {
    p1Genotype: parent1,
    p2Genotype: parent2,
    gametesP1,
    gametesP2,
    punnettGrid,
    genotypicRatio: genotypicCounts,
    phenotypicRatio: phenotypicCounts,
    traits: {
      trait1: { dominant: 'Round', recessive: 'Wrinkled', symbolDom: 'R', symbolRec: 'r' },
      trait2: { dominant: 'Yellow', recessive: 'Green', symbolDom: 'Y', symbolRec: 'y' },
    },
  };
}
