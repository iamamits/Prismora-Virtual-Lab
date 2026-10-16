import { describe, it, expect } from 'vitest';
import {
  solveEnzymeKinetics,
  DEFAULT_ENZYME_PARAMS,
} from '../src/biotech/enzyme-kinetics';

describe('Biotechnology & Bioengineering: Enzyme Kinetics Studio', () => {
  it('should compute exact half-maximal velocity when [S] = K_m', () => {
    // When [S] = K_m, v_0 = V_max / 2
    const res = solveEnzymeKinetics({
      ...DEFAULT_ENZYME_PARAMS,
      substrateConcentration: DEFAULT_ENZYME_PARAMS.kM,
    });

    expect(res.currentVelocity).toBeCloseTo(DEFAULT_ENZYME_PARAMS.vMax / 2, 1);
    expect(res.saturationFraction).toBeCloseTo(0.5, 2);
  });

  it('should model competitive inhibition: increases apparent K_m while V_max remains unchanged', () => {
    const uninhibited = solveEnzymeKinetics({
      ...DEFAULT_ENZYME_PARAMS,
      inhibitionType: 'none',
    });

    const competitive = solveEnzymeKinetics({
      ...DEFAULT_ENZYME_PARAMS,
      inhibitionType: 'competitive',
      inhibitorConcentration: 4.0,
      inhibitorConstantKi: 2.0, // alpha = 1 + 4/2 = 3.0
    });

    // V_max unchanged
    expect(competitive.apparentVMax).toBeCloseTo(uninhibited.apparentVMax, 1);

    // K_m increased by factor of alpha = 3.0
    expect(competitive.apparentKM).toBeCloseTo(uninhibited.apparentKM * 3.0, 1);

    // Lineweaver-Burk y-intercept (1/V_max) remains identical
    expect(competitive.lineweaverBurkYIntercept).toBeCloseTo(uninhibited.lineweaverBurkYIntercept, 4);

    // Lineweaver-Burk slope (Km/Vmax) increases
    expect(competitive.lineweaverBurkSlope).toBeGreaterThan(uninhibited.lineweaverBurkSlope);
  });

  it('should model non-competitive inhibition: reduces apparent V_max while K_m remains unchanged', () => {
    const uninhibited = solveEnzymeKinetics({
      ...DEFAULT_ENZYME_PARAMS,
      inhibitionType: 'none',
    });

    const nonCompetitive = solveEnzymeKinetics({
      ...DEFAULT_ENZYME_PARAMS,
      inhibitionType: 'non_competitive',
      inhibitorConcentration: 2.0,
      inhibitorConstantKi: 2.0, // alpha = 1 + 2/2 = 2.0
    });

    // K_m unchanged
    expect(nonCompetitive.apparentKM).toBeCloseTo(uninhibited.apparentKM, 1);

    // V_max reduced by factor of 2.0
    expect(nonCompetitive.apparentVMax).toBeCloseTo(uninhibited.apparentVMax / 2.0, 1);

    // Lineweaver-Burk x-intercept (-1/K_m) remains identical
    expect(nonCompetitive.lineweaverBurkXIntercept).toBeCloseTo(uninhibited.lineweaverBurkXIntercept, 3);
  });

  it('should compute valid Lineweaver-Burk data points for linear regression', () => {
    const res = solveEnzymeKinetics(DEFAULT_ENZYME_PARAMS);
    expect(res.dataPoints.length).toBeGreaterThanOrEqual(5);

    res.dataPoints.forEach((pt) => {
      expect(pt.substrate).toBeGreaterThan(0);
      expect(pt.velocity).toBeGreaterThan(0);
      expect(pt.invSubstrate).toBeCloseTo(1 / pt.substrate, 4);
      expect(pt.invVelocity).toBeCloseTo(1 / pt.velocity, 4);
    });
  });
});
