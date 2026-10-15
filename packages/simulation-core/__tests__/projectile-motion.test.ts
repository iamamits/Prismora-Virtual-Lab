import { describe, it, expect } from 'vitest';
import { ProjectileMotionModel } from '../src/models/projectile-motion';
import { degreesToRadians } from '../src/utils/math-helpers';
import type { ProjectileMotionParameters } from '../src/types/parameters';

const model = new ProjectileMotionModel();

/** Helper to create params with angle in degrees */
function makeParams(overrides: Partial<ProjectileMotionParameters & { angleDeg?: number }> = {}): ProjectileMotionParameters {
  const { angleDeg, ...rest } = overrides;
  return {
    initialSpeed: 20,
    launchAngle: angleDeg !== undefined ? degreesToRadians(angleDeg) : Math.PI / 4,
    gravity: 9.81,
    initialHeight: 0,
    ...rest,
  };
}

describe('ProjectileMotionModel', () => {
  describe('Initial state (t=0)', () => {
    it('should have correct initial position', () => {
      const params = makeParams({ initialHeight: 5 });
      const state = model.computeState(params, 0);
      expect(state.position.x).toBeCloseTo(0, 10);
      expect(state.position.y).toBeCloseTo(5, 10);
      expect(state.time).toBe(0);
    });

    it('should have correct initial velocity components', () => {
      const params = makeParams({ initialSpeed: 20, angleDeg: 30 });
      const state = model.computeState(params, 0);
      expect(state.velocity.x).toBeCloseTo(20 * Math.cos(degreesToRadians(30)), 10);
      expect(state.velocity.y).toBeCloseTo(10, 10);
    });

    it('should have correct acceleration', () => {
      const params = makeParams({ gravity: 9.81 });
      const state = model.computeState(params, 0);
      expect(state.acceleration.x).toBe(0);
      expect(state.acceleration.y).toBe(-9.81);
    });
  });

  describe('Analytical trajectory', () => {
    it('should compute position at arbitrary time', () => {
      const params = makeParams({ initialSpeed: 10, angleDeg: 45, gravity: 10, initialHeight: 0 });
      const t = 0.5;
      const state = model.computeState(params, t);

      const cosTheta = Math.cos(degreesToRadians(45));
      const sinTheta = Math.sin(degreesToRadians(45));

      const expectedX = 10 * cosTheta * t;
      const expectedY = 10 * sinTheta * t - 0.5 * 10 * t * t;

      expect(state.position.x).toBeCloseTo(expectedX, 8);
      expect(state.position.y).toBeCloseTo(expectedY, 8);
    });

    it('should compute velocity at arbitrary time', () => {
      const params = makeParams({ initialSpeed: 10, angleDeg: 60, gravity: 9.81 });
      const t = 1.0;
      const state = model.computeState(params, t);

      const expectedVx = 10 * Math.cos(degreesToRadians(60));
      const expectedVy = 10 * Math.sin(degreesToRadians(60)) - 9.81 * 1.0;

      expect(state.velocity.x).toBeCloseTo(expectedVx, 8);
      expect(state.velocity.y).toBeCloseTo(expectedVy, 8);
    });
  });

  describe('Terminal time (flight time)', () => {
    it('should compute correct flight time for standard launch from ground', () => {
      const params = makeParams({ initialSpeed: 20, angleDeg: 45, gravity: 9.81, initialHeight: 0 });
      const t = model.computeTerminalTime(params);
      const expected = (2 * 20 * Math.sin(degreesToRadians(45))) / 9.81;
      expect(t).not.toBeNull();
      expect(t!).toBeCloseTo(expected, 6);
    });

    it('should compute correct flight time with initial height', () => {
      const params = makeParams({ initialSpeed: 10, angleDeg: 30, gravity: 9.81, initialHeight: 10 });
      const vy = 10 * Math.sin(degreesToRadians(30));
      const expected = (vy + Math.sqrt(vy * vy + 2 * 9.81 * 10)) / 9.81;
      const t = model.computeTerminalTime(params);
      expect(t).not.toBeNull();
      expect(t!).toBeCloseTo(expected, 6);
    });

    it('should return 0 for zero speed from ground level', () => {
      const params = makeParams({ initialSpeed: 0, gravity: 9.81, initialHeight: 0 });
      const t = model.computeTerminalTime(params);
      expect(t).toBe(0);
    });

    it('should return 0 for downward launch from ground level', () => {
      const params = makeParams({ initialSpeed: 10, angleDeg: -45, gravity: 9.81, initialHeight: 0 });
      const t = model.computeTerminalTime(params);
      expect(t).toBe(0);
    });

    it('should handle zero gravity with upward velocity (never lands)', () => {
      const params = makeParams({ initialSpeed: 10, angleDeg: 45, gravity: 0, initialHeight: 0 });
      const t = model.computeTerminalTime(params);
      expect(t).toBeNull();
    });

    it('should handle zero gravity with downward velocity', () => {
      const params = makeParams({ initialSpeed: 10, angleDeg: -30, gravity: 0, initialHeight: 100 });
      const vy = 10 * Math.sin(degreesToRadians(-30));
      const expected = -100 / vy;
      const t = model.computeTerminalTime(params);
      expect(t).not.toBeNull();
      expect(t!).toBeCloseTo(expected, 6);
    });

    it('should handle zero gravity, zero velocity at height (hovers forever)', () => {
      const params = makeParams({ initialSpeed: 0, gravity: 0, initialHeight: 50 });
      const t = model.computeTerminalTime(params);
      expect(t).toBeNull();
    });
  });

  describe('Maximum height', () => {
    it('should compute correct max height for standard launch', () => {
      const params = makeParams({ initialSpeed: 20, angleDeg: 45, gravity: 9.81, initialHeight: 0 });
      const state = model.computeState(params, 0);
      const m = model.computeMeasurements(params, state);

      const sinTheta = Math.sin(degreesToRadians(45));
      const expected = (20 * sinTheta) ** 2 / (2 * 9.81);

      expect(m['maxHeight']!.value).toBeCloseTo(expected, 4);
    });

    it('should account for initial height', () => {
      const params = makeParams({ initialSpeed: 20, angleDeg: 90, gravity: 9.81, initialHeight: 10 });
      const state = model.computeState(params, 0);
      const m = model.computeMeasurements(params, state);

      const expected = 10 + (20 * 20) / (2 * 9.81);
      expect(m['maxHeight']!.value).toBeCloseTo(expected, 4);
    });
  });

  describe('Horizontal range', () => {
    it('should compute correct range for standard launch from ground', () => {
      const params = makeParams({ initialSpeed: 20, angleDeg: 45, gravity: 9.81, initialHeight: 0 });
      const state = model.computeState(params, 0);
      const m = model.computeMeasurements(params, state);

      const expected = (20 * 20 * Math.sin(2 * degreesToRadians(45))) / 9.81;
      expect(m['range']!.value).toBeCloseTo(expected, 4);
    });

    it('should return 0 range for straight-up launch from ground', () => {
      const params = makeParams({ initialSpeed: 20, angleDeg: 90, gravity: 9.81, initialHeight: 0 });
      const state = model.computeState(params, 0);
      const m = model.computeMeasurements(params, state);

      expect(m['range']!.value).toBeCloseTo(0, 6);
    });
  });

  describe('Symmetry and invariants', () => {
    it('should have equal range for complementary angles from ground', () => {
      const params30 = makeParams({ initialSpeed: 20, angleDeg: 30 });
      const params60 = makeParams({ initialSpeed: 20, angleDeg: 60 });

      const state30 = model.computeState(params30, 0);
      const state60 = model.computeState(params60, 0);
      const m30 = model.computeMeasurements(params30, state30);
      const m60 = model.computeMeasurements(params60, state60);

      expect(m30['range']!.value).toBeCloseTo(m60['range']!.value, 4);
    });

    it('speed at ground should equal launch speed (energy conservation) for zero height', () => {
      const params = makeParams({ initialSpeed: 25, angleDeg: 60, gravity: 9.81, initialHeight: 0 });
      const flightTime = model.computeTerminalTime(params)!;
      const finalState = model.computeState(params, flightTime);

      expect(finalState.speed).toBeCloseTo(25, 4);
    });
  });

  describe('Parameter validation', () => {
    it('should accept valid parameters', () => {
      const result = model.validateParameters(makeParams());
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject negative initial speed', () => {
      const result = model.validateParameters(makeParams({ initialSpeed: -5 }));
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'initialSpeed')).toBe(true);
    });

    it('should reject NaN gravity', () => {
      const result = model.validateParameters(makeParams({ gravity: NaN }));
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'gravity')).toBe(true);
    });

    it('should reject Infinity initial speed', () => {
      const result = model.validateParameters(makeParams({ initialSpeed: Infinity }));
      expect(result.valid).toBe(false);
    });

    it('should reject negative initial height', () => {
      const result = model.validateParameters(makeParams({ initialHeight: -1 }));
      expect(result.valid).toBe(false);
    });
  });

  describe('Termination behavior', () => {
    it('should mark state as terminated when past flight time', () => {
      const params = makeParams({ initialSpeed: 20, angleDeg: 45 });
      const flightTime = model.computeTerminalTime(params)!;
      const state = model.computeState(params, flightTime + 10);

      expect(state.terminated).toBe(true);
      expect(state.time).toBeCloseTo(flightTime, 6);
      expect(state.position.y).toBeCloseTo(0, 4);
    });

    it('should not be terminated before flight time', () => {
      const params = makeParams({ initialSpeed: 20, angleDeg: 45 });
      const flightTime = model.computeTerminalTime(params)!;
      const state = model.computeState(params, flightTime * 0.5);

      expect(state.terminated).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle zero initial speed from height', () => {
      const params = makeParams({ initialSpeed: 0, gravity: 9.81, initialHeight: 20 });
      const t = model.computeTerminalTime(params);
      const expected = Math.sqrt(2 * 20 / 9.81);
      expect(t).not.toBeNull();
      expect(t!).toBeCloseTo(expected, 6);
    });

    it('should handle horizontal launch from height', () => {
      const params = makeParams({ initialSpeed: 10, angleDeg: 0, gravity: 9.81, initialHeight: 20 });
      const t = model.computeTerminalTime(params);
      const expected = Math.sqrt(2 * 20 / 9.81);
      expect(t).not.toBeNull();
      expect(t!).toBeCloseTo(expected, 6);
    });

    it('should handle 45-degree launch textbook case', () => {
      const params = makeParams({ initialSpeed: 10, angleDeg: 45, gravity: 10, initialHeight: 0 });
      const t = model.computeTerminalTime(params)!;
      const sin45 = Math.sin(degreesToRadians(45));

      expect(t).toBeCloseTo(2 * sin45, 6);

      const finalState = model.computeState(params, t);
      expect(finalState.position.x).toBeCloseTo(10, 4);

      const state0 = model.computeState(params, 0);
      const m = model.computeMeasurements(params, state0);
      expect(m['maxHeight']!.value).toBeCloseTo(2.5, 4);
    });

    it('should handle negative time gracefully', () => {
      const params = makeParams();
      const state = model.computeState(params, -5);
      expect(state.time).toBe(0);
    });
  });
});
