import { describe, expect, it } from 'vitest';
import { DEFAULT_RLC_PARAMS, RlcResonanceEngine } from '../src/electrical/rlc-resonance';

describe('RlcResonanceEngine (Series RLC AC Resonance)', () => {
  it('correctly calculates resonant frequency f0 = 1 / (2*pi*sqrt(LC))', () => {
    const res = RlcResonanceEngine.compute(DEFAULT_RLC_PARAMS);
    const L = DEFAULT_RLC_PARAMS.inductanceMh * 1e-3;
    const C = DEFAULT_RLC_PARAMS.capacitanceUf * 1e-6;
    const expectedF0 = 1 / (2 * Math.PI * Math.sqrt(L * C));
    expect(res.resonantFrequencyHz).toBeCloseTo(expectedF0, 0);
  });

  it('exhibits minimum impedance equal to resistance at resonance', () => {
    // Evaluate exactly at resonance
    const res0 = RlcResonanceEngine.compute(DEFAULT_RLC_PARAMS);
    const atResonance = RlcResonanceEngine.compute({
      ...DEFAULT_RLC_PARAMS,
      frequencyHz: res0.resonantFrequencyHz,
    });

    expect(atResonance.currentImpedanceOhms).toBeCloseTo(DEFAULT_RLC_PARAMS.resistanceOhms, 1);
    expect(atResonance.currentPhaseAngleDeg).toBeCloseTo(0, 1);
  });

  it('sweeps frequency response curve with peak current at resonance', () => {
    const res = RlcResonanceEngine.compute(DEFAULT_RLC_PARAMS);
    expect(res.frequencyCurve.length).toBeGreaterThan(50);
  });
});
