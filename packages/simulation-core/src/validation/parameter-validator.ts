import type { ProjectileMotionParameters } from '../types/parameters';
import { PROJECTILE_PARAMETER_CONSTRAINTS } from '../types/parameters';
import type { ValidationResult, ValidationError } from '../types/simulation';
import { isFiniteNumber } from '../utils/math-helpers';

export function validateProjectileParameters(
  params: ProjectileMotionParameters,
): ValidationResult {
  const errors: ValidationError[] = [];

  // Check initialSpeed
  if (!isFiniteNumber(params.initialSpeed)) {
    errors.push({
      field: 'initialSpeed',
      message: 'Initial speed must be a finite number',
      value: params.initialSpeed,
    });
  } else {
    const c = PROJECTILE_PARAMETER_CONSTRAINTS.initialSpeed;
    if (params.initialSpeed < c.min || params.initialSpeed > c.max) {
      errors.push({
        field: 'initialSpeed',
        message: `Initial speed must be between ${c.min} and ${c.max} ${c.unit}`,
        value: params.initialSpeed,
      });
    }
  }

  // Check launchAngle
  if (!isFiniteNumber(params.launchAngle)) {
    errors.push({
      field: 'launchAngle',
      message: 'Launch angle must be a finite number',
      value: params.launchAngle,
    });
  } else {
    const c = PROJECTILE_PARAMETER_CONSTRAINTS.launchAngle;
    if (params.launchAngle < c.min || params.launchAngle > c.max) {
      errors.push({
        field: 'launchAngle',
        message: `Launch angle must be between ${c.min} and ${c.max} ${c.unit}`,
        value: params.launchAngle,
      });
    }
  }

  // Check gravity
  if (!isFiniteNumber(params.gravity)) {
    errors.push({
      field: 'gravity',
      message: 'Gravity must be a finite number',
      value: params.gravity,
    });
  } else {
    const c = PROJECTILE_PARAMETER_CONSTRAINTS.gravity;
    if (params.gravity < c.min || params.gravity > c.max) {
      errors.push({
        field: 'gravity',
        message: `Gravity must be between ${c.min} and ${c.max} ${c.unit}`,
        value: params.gravity,
      });
    }
  }

  // Check initialHeight
  if (!isFiniteNumber(params.initialHeight)) {
    errors.push({
      field: 'initialHeight',
      message: 'Initial height must be a finite number',
      value: params.initialHeight,
    });
  } else {
    const c = PROJECTILE_PARAMETER_CONSTRAINTS.initialHeight;
    if (params.initialHeight < c.min || params.initialHeight > c.max) {
      errors.push({
        field: 'initialHeight',
        message: `Initial height must be between ${c.min} and ${c.max} ${c.unit}`,
        value: params.initialHeight,
      });
    }
  }

  return { valid: errors.length === 0, errors };
}
