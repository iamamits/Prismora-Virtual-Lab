import { describe, expect, it } from 'vitest';
import { DEFAULT_REACTOR_PARAMS, ReactorKineticsEngine } from '../src/chemical/reactor-kinetics';

describe('ReactorKineticsEngine (CSTR vs PFR Reactor Engineering)', () => {
  it('confirms PFR conversion is always strictly greater than CSTR conversion for positive orders', () => {
    const res = ReactorKineticsEngine.compute(DEFAULT_REACTOR_PARAMS);
    expect(res.pfrConversion).toBeGreaterThan(res.cstrConversion);
    expect(res.volumeRatioCstrOverPfr).toBeGreaterThan(1.0);
  });

  it('satisfies theoretical conversion equations for first order kinetics', () => {
    const res = ReactorKineticsEngine.compute(DEFAULT_REACTOR_PARAMS);
    const Da = res.damkohlerNumber;
    const expectedCstrX = Da / (1 + Da);
    const expectedPfrX = 1 - Math.exp(-Da);
    expect(res.cstrConversion).toBeCloseTo(expectedCstrX, 4);
    expect(res.pfrConversion).toBeCloseTo(expectedPfrX, 4);
  });

  it('generates space-time profile points', () => {
    const res = ReactorKineticsEngine.compute(DEFAULT_REACTOR_PARAMS);
    expect(res.profile.length).toBeGreaterThan(50);
    expect(res.profile[0]!.conversionCstr).toBe(0);
    expect(res.profile[0]!.conversionPfr).toBe(0);
  });
});
