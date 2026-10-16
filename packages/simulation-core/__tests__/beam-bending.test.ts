import { describe, expect, it } from 'vitest';
import { BeamBendingEngine, DEFAULT_BEAM_PARAMS } from '../src/civil/beam-bending';

describe('BeamBendingEngine (SFD & BMD Beam Mechanics)', () => {
  it('satisfies vertical equilibrium of reactions for simply supported beam', () => {
    const res = BeamBendingEngine.compute(DEFAULT_BEAM_PARAMS);
    const totalAppliedLoad = DEFAULT_BEAM_PARAMS.pointLoadKn + DEFAULT_BEAM_PARAMS.udlKnPerM * DEFAULT_BEAM_PARAMS.spanLengthM;
    expect(res.leftReactionKn + res.rightReactionKn).toBeCloseTo(totalAppliedLoad, 1);
  });

  it('computes maximum bending moment and maximum shear force', () => {
    const res = BeamBendingEngine.compute(DEFAULT_BEAM_PARAMS);
    expect(res.maxBendingMomentKnm).toBeGreaterThan(0);
    expect(res.maxShearForceKn).toBeGreaterThan(0);
    expect(res.points.length).toBeGreaterThan(50);
  });

  it('computes maximum deflection at midspan area', () => {
    const res = BeamBendingEngine.compute(DEFAULT_BEAM_PARAMS);
    expect(res.maxDeflectionMm).toBeGreaterThan(0);
    // Deflection at ends of simply supported beam should be zero
    expect(res.points[0]!.deflectionMm).toBeCloseTo(0, 1);
    expect(res.points[res.points.length - 1]!.deflectionMm).toBeCloseTo(0, 1);
  });

  it('computes cantilever reaction matching total load at fixed support', () => {
    const res = BeamBendingEngine.compute({
      ...DEFAULT_BEAM_PARAMS,
      supportType: 'cantilever',
    });
    const totalLoad = DEFAULT_BEAM_PARAMS.pointLoadKn + DEFAULT_BEAM_PARAMS.udlKnPerM * DEFAULT_BEAM_PARAMS.spanLengthM;
    expect(res.leftReactionKn).toBeCloseTo(totalLoad, 1);
    expect(res.rightReactionKn).toBe(0);
  });
});
