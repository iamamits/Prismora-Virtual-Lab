import { describe, expect, it } from 'vitest';
import { DEFAULT_VENTURI_PARAMS, VenturiFlowEngine } from '../src/mechanical/venturi-flow';

describe('VenturiFlowEngine (Bernoulli & Venturimeter Flow)', () => {
  it('computes continuity and throat velocity higher than inlet velocity', () => {
    const res = VenturiFlowEngine.compute(DEFAULT_VENTURI_PARAMS);
    expect(res.throatVelocityMs).toBeGreaterThan(res.inletVelocityMs);
    expect(res.areaRatio).toBeCloseTo(4.0, 1); // (28/14)^2 = 4
  });

  it('computes actual discharge lower than theoretical discharge by Cd factor', () => {
    const res = VenturiFlowEngine.compute(DEFAULT_VENTURI_PARAMS);
    expect(res.actualDischargeM3s).toBeCloseTo(res.theoreticalDischargeM3s * DEFAULT_VENTURI_PARAMS.dischargeCoefficient, 5);
  });

  it('generates 7 pressure profile points along converging-diverging section', () => {
    const res = VenturiFlowEngine.compute(DEFAULT_VENTURI_PARAMS);
    expect(res.profilePoints).toHaveLength(7);
    // Pressure at throat (index 2) should be minimum due to highest velocity
    const throatPoint = res.profilePoints[2]!;
    const inletPoint = res.profilePoints[0]!;
    expect(throatPoint.pressureHeadCm).toBeLessThan(inletPoint.pressureHeadCm);
  });

  it('scales flow rate monotonically with valve opening', () => {
    const lowValve = VenturiFlowEngine.compute({ ...DEFAULT_VENTURI_PARAMS, valveOpening: 0.3 });
    const highValve = VenturiFlowEngine.compute({ ...DEFAULT_VENTURI_PARAMS, valveOpening: 0.9 });
    expect(highValve.actualDischargeLps).toBeGreaterThan(lowValve.actualDischargeLps);
  });
});
