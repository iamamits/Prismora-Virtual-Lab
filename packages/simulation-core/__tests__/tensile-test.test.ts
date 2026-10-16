import { describe, expect, it } from 'vitest';
import { TensileTestEngine } from '../src/mechanical/tensile-test';

describe('TensileTestEngine (UTM Tensile Stress-Strain)', () => {
  it('correctly calculates linear elastic stress in Hookean region', () => {
    // 0.05 mm elongation on 50 mm gauge = 0.001 strain (elastic)
    const res = TensileTestEngine.compute({
      material: 'mild_steel',
      gaugeLengthMm: 50,
      diameterMm: 12.5,
      elongationMm: 0.05,
    });

    expect(res.testStage).toBe('elastic');
    // E = 210 GPa = 210,000 MPa; sigma = 0.001 * 210,000 = 210 MPa
    expect(res.currentStressMpa).toBeCloseTo(210, 0);
  });

  it('identifies necking and UTS exceeding yield strength', () => {
    const res = TensileTestEngine.compute({
      material: 'mild_steel',
      gaugeLengthMm: 50,
      diameterMm: 12.5,
      elongationMm: 10.0, // 0.20 strain -> strain hardening / necking
    });

    expect(res.maxLoadKn).toBeGreaterThan(res.yieldLoadKn);
    expect(res.stressStrainCurve.length).toBeGreaterThan(50);
  });

  it('handles fracture when elongation exceeds ductility limit', () => {
    const res = TensileTestEngine.compute({
      material: 'aluminium_6061',
      gaugeLengthMm: 50,
      diameterMm: 12.5,
      elongationMm: 15.0, // Exceeds 17% fracture strain
    });

    expect(res.testStage).toBe('fractured');
    expect(res.currentStressMpa).toBe(0);
  });
});
