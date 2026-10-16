import { describe, it, expect } from 'vitest';
import {
  vleY,
  vleX,
  solveMcCabeThiele,
  DEFAULT_DISTILLATION_PARAMS,
} from '../src/chemical/distillation';

describe('Chemical Engineering: McCabe-Thiele Fractional Distillation Column', () => {
  it('should satisfy VLE bounds and inversion identity y = vleY(vleX(y))', () => {
    const alpha = 2.5;
    expect(vleY(0, alpha)).toBe(0);
    expect(vleY(1, alpha)).toBe(1);

    const testY = 0.65;
    const computedX = vleX(testY, alpha);
    const roundTripY = vleY(computedX, alpha);

    expect(roundTripY).toBeCloseTo(testY, 5);
  });

  it('should calculate valid number of theoretical stages for standard Benzene-Toluene separation', () => {
    const res = solveMcCabeThiele(DEFAULT_DISTILLATION_PARAMS);

    // With alpha=2.5, xF=0.45, xD=0.95, xB=0.05, R=2.2:
    // Stages should typically be between 7 and 14
    expect(res.numberOfStages).toBeGreaterThanOrEqual(6);
    expect(res.numberOfStages).toBeLessThanOrEqual(16);

    // Operating stages must exceed Fenske minimum stages
    expect(res.numberOfStages).toBeGreaterThan(res.minimumStagesFenske);

    // Feed stage should be positioned between stage 2 and N-1
    expect(res.optimalFeedStage).toBeGreaterThan(1);
    expect(res.optimalFeedStage).toBeLessThan(res.numberOfStages);
  });

  it('should verify minimum reflux ratio R_min is lower than operating reflux ratio R', () => {
    const res = solveMcCabeThiele(DEFAULT_DISTILLATION_PARAMS);
    expect(res.minimumRefluxRatio).toBeLessThan(res.operatingRefluxRatio);
    expect(res.minimumRefluxRatio).toBeGreaterThan(0.5);
  });

  it('should correctly position q-line intersection for saturated liquid feed (q=1)', () => {
    const res = solveMcCabeThiele({ ...DEFAULT_DISTILLATION_PARAMS, feedQuality: 1.0 });
    // Saturated liquid feed means vertical q-line at x = xF
    expect(res.intersectionQ.x).toBeCloseTo(DEFAULT_DISTILLATION_PARAMS.feedComposition, 3);
  });
});
