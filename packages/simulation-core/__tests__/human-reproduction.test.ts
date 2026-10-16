import { describe, it, expect } from 'vitest';
import {
  calculateMenstrualCycleState,
  evaluateFertilization,
  EMBRYOGENESIS_STAGES,
  solveMonohybridCross,
  solveDihybridCross,
  calculateMitosisState,
} from '../src/biology';

describe('Human Reproduction & Physiology Engine', () => {
  it('should compute day 14 ovulatory phase with LH surge and follicular maturity', () => {
    const state = calculateMenstrualCycleState(14);
    expect(state.phase).toBe('ovulatory');
    expect(state.ovulationOccurred).toBe(true);
    expect(state.lhMiuMl).toBeGreaterThan(40); // Marked LH surge
    expect(state.follicleDiameterMm).toBeGreaterThanOrEqual(20); // Mature Graafian follicle
    expect(state.cervicalMucusType).toBe('watery_elastic_spinnbarkeit');
    expect(state.fertileWindow).toBe(true);
  });

  it('should model luteal phase with elevated progesterone and secretory endometrium', () => {
    const state = calculateMenstrualCycleState(21);
    expect(state.phase).toBe('luteal');
    expect(state.progesteroneNgMl).toBeGreaterThan(10); // Elevated luteal progesterone
    expect(state.endometrialThicknessMm).toBeGreaterThan(10); // Thick secretory endometrium
    expect(state.basalBodyTempC).toBeGreaterThan(36.8); // Thermogenic shift
  });

  it('should model oral contraceptive pill suppressing LH surge and ovulation', () => {
    const state = calculateMenstrualCycleState(14, 'oral_combined_pill');
    expect(state.ovulationOccurred).toBe(false);
    expect(state.lhMiuMl).toBeLessThan(10); // LH surge suppressed
    expect(state.endometrialThicknessMm).toBeLessThan(5); // Atrophic endometrium
    expect(state.fertileWindow).toBe(false);
  });

  it('should model fertilization kinetics and polyspermy prevention', () => {
    // Normal 18h post-insemination
    const fert = evaluateFertilization(45, 18, 'none');
    expect(fert.acrosomeReactionTriggered).toBe(true);
    expect(fert.zonaPenetrationDepthPct).toBe(100);
    expect(fert.corticalGranuleExocytosis).toBe(true);
    expect(fert.polyspermyPrevented).toBe(true);
    expect(fert.pronucleiFusionComplete).toBe(true);
    expect(fert.fertilizationSuccessful).toBe(true);
  });

  it('should model barrier contraception blocking sperm entry', () => {
    const fert = evaluateFertilization(60, 12, 'barrier_condom');
    expect(fert.spermCountMillion).toBe(0);
    expect(fert.fertilizationSuccessful).toBe(false);
  });

  it('should verify human embryogenesis timeline milestones', () => {
    expect(EMBRYOGENESIS_STAGES.length).toBe(7);
    expect(EMBRYOGENESIS_STAGES[0]!.stageName).toContain('Zygote');
    expect(EMBRYOGENESIS_STAGES[4]!.stageName).toContain('Morula');
    expect(EMBRYOGENESIS_STAGES[5]!.stageName).toContain('Blastocyst');
    expect(EMBRYOGENESIS_STAGES[6]!.anatomicalLocation).toBe('endometrium_implanted');
  });
});

describe('Mendelian Genetics Engine', () => {
  it('should solve monohybrid Tt x Tt cross with 3:1 phenotypic ratio', () => {
    const result = solveMonohybridCross('Tt', 'Tt', 'Tall', 'Dwarf');
    expect(result.punnettGrid.length).toBe(2);
    expect(result.punnettGrid[0]!.length).toBe(2);
    expect(result.phenotypicRatio['Tall']).toBe(3);
    expect(result.phenotypicRatio['Dwarf']).toBe(1);
    expect(result.genotypicRatio['TT']).toBe(1);
    expect(result.genotypicRatio['Tt']).toBe(2);
    expect(result.genotypicRatio['tt']).toBe(1);
    expect(result.chiSquareValue).toBe(0);
  });

  it('should solve dihybrid RrYy x RrYy cross with 9:3:3:1 phenotypic ratio', () => {
    const result = solveDihybridCross('RrYy', 'RrYy');
    expect(result.punnettGrid.length).toBe(4);
    expect(result.punnettGrid[0]!.length).toBe(4);
    expect(result.phenotypicRatio['Round Yellow']).toBe(9);
    expect(result.phenotypicRatio['Round Green']).toBe(3);
    expect(result.phenotypicRatio['Wrinkled Yellow']).toBe(3);
    expect(result.phenotypicRatio['Wrinkled Green']).toBe(1);
  });
});

describe('Cytology & Mitosis Engine', () => {
  it('should compute metaphase equatorial plate alignment and spindle formation', () => {
    const state = calculateMitosisState('metaphase', 50, 4);
    expect(state.equatorialPlateAligned).toBe(true);
    expect(state.spindleFibersFormed).toBe(true);
    expect(state.nuclearMembraneIntact).toBe(false);
  });

  it('should compute anaphase centromere splitting and chromosome doubling', () => {
    const state = calculateMitosisState('anaphase', 70, 4);
    expect(state.centromereSplitting).toBe(true);
    expect(state.chromosomeCount).toBe(8); // Separated sister chromatids are now individual chromosomes
  });
});
