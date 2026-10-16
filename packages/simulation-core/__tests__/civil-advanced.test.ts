import { describe, it, expect } from 'vitest';
import {
  ColumnBucklingEngine,
  DEFAULT_COLUMN_BUCKLING_PARAMS,
  DirectShearEngine,
  DEFAULT_SOIL_SHEAR_PARAMS,
  WeirFlowEngine,
  DEFAULT_WEIR_FLOW_PARAMS,
} from '../src/civil';

describe('Civil Engineering Advanced Simulations', () => {
  describe('ColumnBucklingEngine (Euler Critical Load)', () => {
    it('should compute valid critical buckling load and slenderness ratio', () => {
      const res = ColumnBucklingEngine.compute(DEFAULT_COLUMN_BUCKLING_PARAMS);
      expect(res.slendernessRatio).toBeGreaterThan(50);
      expect(res.criticalBucklingLoadKn).toBeGreaterThan(0);
      expect(res.bucklingModeShape.length).toBeGreaterThan(10);
    });

    it('should scale effective length by K factor for fixed-fixed', () => {
      const pinned = ColumnBucklingEngine.compute({ ...DEFAULT_COLUMN_BUCKLING_PARAMS, endCondition: 'pinned_pinned' });
      const fixed = ColumnBucklingEngine.compute({ ...DEFAULT_COLUMN_BUCKLING_PARAMS, endCondition: 'fixed_fixed' });
      expect(fixed.criticalBucklingLoadKn).toBeGreaterThan(pinned.criticalBucklingLoadKn * 3.5);
    });
  });

  describe('DirectShearEngine (Mohr-Coulomb Failure Envelope)', () => {
    it('should compute friction angle, peak and residual shear stresses', () => {
      const res = DirectShearEngine.compute(DEFAULT_SOIL_SHEAR_PARAMS);
      expect(res.frictionAngleDeg).toBeGreaterThan(25);
      expect(res.peakShearStrengthKpa).toBeGreaterThan(res.residualShearStrengthKpa);
      expect(res.shearStressVsDisplacement.length).toBeGreaterThan(15);
      expect(res.failureEnvelopeTrials.length).toBe(4);
    });
  });

  describe('WeirFlowEngine (Flow Over Notches & Weirs)', () => {
    it('should compute discharge for 90 degree triangular notch', () => {
      const res = WeirFlowEngine.compute(DEFAULT_WEIR_FLOW_PARAMS);
      expect(res.actualDischargeLitersPerSec).toBeGreaterThan(0);
      expect(res.cd).toBeCloseTo(0.60, 2);
      expect(res.dischargeCurveHVsQ.length).toBeGreaterThan(10);
    });
  });
});
