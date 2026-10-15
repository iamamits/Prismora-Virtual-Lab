import { describe, it, expect } from 'vitest';
import { validateProjectileParameters } from '../src/validation/parameter-validator';
import type { ProjectileMotionParameters } from '../src/types/parameters';

const validParams: ProjectileMotionParameters = {
  initialSpeed: 20,
  launchAngle: Math.PI / 4,
  gravity: 9.81,
  initialHeight: 0,
};

describe('validateProjectileParameters', () => {
  it('should accept valid parameters', () => {
    expect(validateProjectileParameters(validParams).valid).toBe(true);
  });

  it('should accept zero values where valid', () => {
    expect(validateProjectileParameters({ ...validParams, initialSpeed: 0 }).valid).toBe(true);
    expect(validateProjectileParameters({ ...validParams, gravity: 0 }).valid).toBe(true);
    expect(validateProjectileParameters({ ...validParams, initialHeight: 0 }).valid).toBe(true);
  });

  it('should reject NaN for each field', () => {
    for (const field of ['initialSpeed', 'launchAngle', 'gravity', 'initialHeight'] as const) {
      const params = { ...validParams, [field]: NaN };
      const result = validateProjectileParameters(params);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === field)).toBe(true);
    }
  });

  it('should reject Infinity for each field', () => {
    for (const field of ['initialSpeed', 'launchAngle', 'gravity', 'initialHeight'] as const) {
      const params = { ...validParams, [field]: Infinity };
      const result = validateProjectileParameters(params);
      expect(result.valid).toBe(false);
    }
  });

  it('should reject out-of-range values', () => {
    expect(validateProjectileParameters({ ...validParams, initialSpeed: -1 }).valid).toBe(false);
    expect(validateProjectileParameters({ ...validParams, initialSpeed: 1001 }).valid).toBe(false);
    expect(validateProjectileParameters({ ...validParams, gravity: -1 }).valid).toBe(false);
    expect(validateProjectileParameters({ ...validParams, initialHeight: -1 }).valid).toBe(false);
  });

  it('should report multiple errors', () => {
    const result = validateProjectileParameters({
      initialSpeed: NaN,
      launchAngle: NaN,
      gravity: NaN,
      initialHeight: NaN,
    });
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBe(4);
  });
});
