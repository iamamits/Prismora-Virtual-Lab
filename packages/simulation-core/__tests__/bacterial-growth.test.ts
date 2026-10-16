import { describe, expect, it } from 'vitest';
import { BacterialGrowthEngine, DEFAULT_MICROBIAL_PARAMS } from '../src/biotech/bacterial-growth';

describe('BacterialGrowthEngine (Monod Microbial Fermentation)', () => {
  it('predicts biomass accumulation and substrate consumption', () => {
    const res = BacterialGrowthEngine.compute(DEFAULT_MICROBIAL_PARAMS);
    expect(res.maximumBiomassGL).toBeGreaterThan(DEFAULT_MICROBIAL_PARAMS.initialBiomassGL);
    expect(res.totalSubstrateConsumedGL).toBeGreaterThan(0);
    expect(res.doublingTimeHours).toBeGreaterThan(0);
  });

  it('exhibits characteristic growth phases across batch timeline', () => {
    const res = BacterialGrowthEngine.compute(DEFAULT_MICROBIAL_PARAMS);
    const phases = res.trajectory.map((p) => p.growthPhase);
    expect(phases).toContain('lag');
    expect(phases).toContain('exponential');
  });

  it('calculates realistic cell yield matching yieldFactor within stoichiometric bounds', () => {
    const res = BacterialGrowthEngine.compute(DEFAULT_MICROBIAL_PARAMS);
    expect(res.overallYield).toBeGreaterThan(0.3);
    expect(res.overallYield).toBeLessThan(0.65);
  });
});
