import { describe, it, expect } from 'vitest';
import {
  DifferentialDriveEngine,
  DEFAULT_DIFF_DRIVE_PARAMS,
} from '../src/robotics/differential-drive';
import {
  InvertedPendulumEngine,
  DEFAULT_INVERTED_PENDULUM_PARAMS,
} from '../src/robotics/inverted-pendulum';
import {
  BodePlotEngine,
  DEFAULT_BODE_PARAMS,
} from '../src/robotics/bode-plot';

describe('Advanced Robotics & Control Systems Engines', () => {
  describe('DifferentialDriveEngine', () => {
    it('computes unicycle odometry and chassis kinematics', () => {
      const res = DifferentialDriveEngine.compute(DEFAULT_DIFF_DRIVE_PARAMS);
      expect(res.linearVelocityMPerS).toBeGreaterThan(0);
      expect(res.angularVelocityRadPerS).toBeGreaterThan(0);
      expect(res.turningRadiusM).not.toBeNull();
      expect(res.trajectoryPoints.length).toBeGreaterThan(10);
    });

    it('straight line when left and right wheel speeds are identical', () => {
      const res = DifferentialDriveEngine.compute({
        ...DEFAULT_DIFF_DRIVE_PARAMS,
        leftWheelSpeedRadPerS: 6.0,
        rightWheelSpeedRadPerS: 6.0,
      });
      expect(res.angularVelocityRadPerS).toBeCloseTo(0, 5);
      expect(res.turningRadiusM).toBeNull();
    });
  });

  describe('InvertedPendulumEngine', () => {
    it('computes state-space feedback stabilization and time series', () => {
      const res = InvertedPendulumEngine.compute(DEFAULT_INVERTED_PENDULUM_PARAMS);
      expect(res.isControllable).toBe(true);
      expect(res.openLoopUnstablePole).toBeGreaterThan(0);
      expect(res.settlingTimeSec).toBeGreaterThan(0);
      expect(res.simulationTimeSeries.length).toBeGreaterThan(50);
      // Final angle should be stabilized near 0 degrees
      const finalPoint = res.simulationTimeSeries[res.simulationTimeSeries.length - 1];
      expect(Math.abs(finalPoint!.pendulumAngleDeg)).toBeLessThan(1.0);
    });
  });

  describe('BodePlotEngine', () => {
    it('computes frequency response, gain crossover, and phase margins', () => {
      const res = BodePlotEngine.compute(DEFAULT_BODE_PARAMS);
      expect(res.bodeCurvePoints.length).toBeGreaterThan(20);
      expect(res.gainCrossoverFrequencyWgc).toBeGreaterThan(0);
      expect(typeof res.phaseMarginDeg).toBe('number');
      expect(typeof res.isClosedLoopStable).toBe('boolean');
    });
  });
});
