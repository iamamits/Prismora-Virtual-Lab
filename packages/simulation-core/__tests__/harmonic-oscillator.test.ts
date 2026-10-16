import { describe, it, expect } from 'vitest';
import {
  HarmonicOscillatorEvaluator,
  type HarmonicOscillatorParams,
} from '../src/mechanical/harmonic-oscillator';

describe('HarmonicOscillatorEvaluator — AICTE Mechanical Vibrations', () => {
  const baseParams: HarmonicOscillatorParams = {
    mass: 2.0,                  // m = 2 kg
    stiffness: 200.0,            // k = 200 N/m => wn = sqrt(200/2) = 10 rad/s
    damping: 4.0,               // c = 4 N*s/m => c_c = 2*sqrt(400) = 40 => zeta = 4/40 = 0.1
    initialDisplacement: 0.05,  // x0 = 5 cm = 0.05 m
    initialVelocity: 0.0,       // v0 = 0
    drivingForceAmp: 0.0,       // free vibration
    drivingFrequency: 0.0,
  };

  it('computes correct natural angular frequency and critical damping', () => {
    const char = HarmonicOscillatorEvaluator.computeCharacteristics(baseParams);

    // omega_n = sqrt(200 / 2) = 10 rad/s
    expect(char.naturalFrequencyRad).toBeCloseTo(10.0, 4);
    // f_n = 10 / (2*pi) ≈ 1.5915 Hz
    expect(char.naturalFrequencyHz).toBeCloseTo(10 / (2 * Math.PI), 4);
    // c_c = 2 * sqrt(2 * 200) = 40 N*s/m
    expect(char.criticalDamping).toBeCloseTo(40.0, 4);
    // zeta = 4 / 40 = 0.1
    expect(char.dampingRatio).toBeCloseTo(0.1, 4);
    expect(char.dampingRegime).toBe('underdamped');
  });

  it('computes damped natural frequency for underdamped system', () => {
    const char = HarmonicOscillatorEvaluator.computeCharacteristics(baseParams);
    // omega_d = omega_n * sqrt(1 - zeta^2) = 10 * sqrt(1 - 0.01) = 10 * sqrt(0.99) ≈ 9.94987 rad/s
    const expectedWd = 10 * Math.sqrt(0.99);
    expect(char.dampedFrequencyRad).toBeCloseTo(expectedWd, 4);
  });

  it('detects critical damping regime correctly', () => {
    const criticalParams: HarmonicOscillatorParams = {
      ...baseParams,
      damping: 40.0, // c = c_c = 40 => zeta = 1.0
    };
    const char = HarmonicOscillatorEvaluator.computeCharacteristics(criticalParams);
    expect(char.dampingRatio).toBeCloseTo(1.0, 4);
    expect(char.dampingRegime).toBe('critically_damped');
  });

  it('detects overdamped regime correctly', () => {
    const overParams: HarmonicOscillatorParams = {
      ...baseParams,
      damping: 60.0, // zeta = 60 / 40 = 1.5
    };
    const char = HarmonicOscillatorEvaluator.computeCharacteristics(overParams);
    expect(char.dampingRatio).toBeCloseTo(1.5, 4);
    expect(char.dampingRegime).toBe('overdamped');
  });

  it('verifies initial state conditions at t = 0', () => {
    const state = HarmonicOscillatorEvaluator.computeState(baseParams, 0);
    expect(state.time).toBe(0);
    expect(state.displacement).toBeCloseTo(0.05, 5);
    expect(state.velocity).toBeCloseTo(0.0, 5);
    // Potential Energy = 0.5 * k * x^2 = 0.5 * 200 * (0.05)^2 = 0.25 J
    expect(state.potentialEnergy).toBeCloseTo(0.25, 4);
    expect(state.kineticEnergy).toBeCloseTo(0.0, 4);
    expect(state.totalEnergy).toBeCloseTo(0.25, 4);
  });

  it('underdamped free vibration exhibits exponential decay envelope', () => {
    const t0 = HarmonicOscillatorEvaluator.computeState(baseParams, 0);
    const t1 = HarmonicOscillatorEvaluator.computeState(baseParams, 1.0);
    const t5 = HarmonicOscillatorEvaluator.computeState(baseParams, 5.0);

    // Energy must monotonically decrease due to positive damping
    expect(t1.totalEnergy).toBeLessThan(t0.totalEnergy);
    expect(t5.totalEnergy).toBeLessThan(t1.totalEnergy);
    expect(t5.totalEnergy).toBeGreaterThan(0);
  });

  it('computes resonance magnification peak when driven near natural frequency', () => {
    const drivenParams: HarmonicOscillatorParams = {
      ...baseParams,
      drivingForceAmp: 10.0,
      drivingFrequency: 10.0, // at resonance r = 1
    };

    // Test exact r = 1.0 directly from formula
    const char = HarmonicOscillatorEvaluator.computeCharacteristics(drivenParams);
    const zeta = char.dampingRatio; // 0.1
    const M_exact = 1 / (2 * zeta); // 5.0
    expect(M_exact).toBeCloseTo(5.0, 4);

    const freqCurve = HarmonicOscillatorEvaluator.generateFrequencyResponse(drivenParams, 3.0, 301);
    const atResonance = freqCurve.find((p) => Math.abs(p.frequencyRatio - 1.0) < 0.015);

    expect(atResonance).toBeDefined();
    expect(atResonance!.magnification).toBeCloseTo(5.0, 0.5);
    // At r approx 1.0, phase lag is in steep transition through 90 degrees
    expect(atResonance!.phaseLagDeg).toBeGreaterThan(75);
    expect(atResonance!.phaseLagDeg).toBeLessThan(105);
  });
});
