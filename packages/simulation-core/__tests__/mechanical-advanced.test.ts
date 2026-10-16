import { describe, it, expect } from 'vitest';
import {
  PipeFrictionEngine,
  DEFAULT_PIPE_FRICTION_PARAMS,
  TorsionTestEngine,
  DEFAULT_TORSION_PARAMS,
  FourBarLinkageEngine,
  DEFAULT_FOUR_BAR_PARAMS,
} from '../src/mechanical';

describe('Mechanical Engineering Advanced Simulations', () => {
  describe('PipeFrictionEngine (Darcy-Weisbach)', () => {
    it('should compute valid turbulent flow regime and head loss', () => {
      const res = PipeFrictionEngine.compute(DEFAULT_PIPE_FRICTION_PARAMS);
      expect(res.reynoldsNumber).toBeGreaterThan(4000);
      expect(res.flowRegime).toBe('turbulent');
      expect(res.frictionFactor).toBeGreaterThan(0.01);
      expect(res.frictionFactor).toBeLessThan(0.08);
      expect(res.headLossM).toBeGreaterThan(0);
      expect(res.pressureDropKpa).toBeGreaterThan(0);
      expect(res.hglPoints.length).toBeGreaterThan(10);
    });

    it('should compute laminar flow when velocity is low', () => {
      const res = PipeFrictionEngine.compute({
        ...DEFAULT_PIPE_FRICTION_PARAMS,
        pipeDiameterMm: 10,
        flowVelocityMPerS: 0.1,
      });
      expect(res.reynoldsNumber).toBeLessThan(2300);
      expect(res.flowRegime).toBe('laminar');
      expect(res.frictionFactor).toBeCloseTo(64 / res.reynoldsNumber, 3);
    });
  });

  describe('TorsionTestEngine', () => {
    it('should compute polar moment of inertia and angle of twist', () => {
      const res = TorsionTestEngine.compute(DEFAULT_TORSION_PARAMS);
      expect(res.polarMomentOfInertiaMm4).toBeGreaterThan(1000);
      expect(res.maxShearStressMpa).toBeGreaterThan(0);
      expect(res.angleOfTwistDeg).toBeGreaterThan(0);
      expect(res.safetyFactor).toBeGreaterThan(0);
      expect(res.stressDistributionRadial.length).toBeGreaterThan(5);
    });

    it('should flag yielding when torque is excessive', () => {
      const res = TorsionTestEngine.compute({
        ...DEFAULT_TORSION_PARAMS,
        appliedTorqueNm: 800,
      });
      expect(res.isYielded).toBe(true);
      expect(res.safetyFactor).toBeLessThan(1.0);
    });
  });

  describe('FourBarLinkageEngine (Grashof Criterion)', () => {
    it('should classify crank-rocker mechanism when shortest is crank', () => {
      const res = FourBarLinkageEngine.compute(DEFAULT_FOUR_BAR_PARAMS);
      expect(res.isGrashof).toBe(true);
      expect(res.linkageType).toBe('crank_rocker');
      expect(res.transmissionAngleDeg).toBeGreaterThan(0);
      expect(res.transmissionAngleDeg).toBeLessThan(180);
      expect(res.fullCouplerPath.length).toBeGreaterThan(10);
    });
  });
});
