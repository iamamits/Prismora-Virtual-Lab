/**
 * Projectile motion parameters.
 * All values use SI units internally.
 */
export interface ProjectileMotionParameters {
  /** Initial speed in m/s. Must be >= 0. */
  readonly initialSpeed: number;
  /** Launch angle in radians internally. UI converts from degrees. */
  readonly launchAngle: number;
  /** Gravitational acceleration in m/s². Must be >= 0. */
  readonly gravity: number;
  /** Initial height in metres. Must be >= 0. */
  readonly initialHeight: number;
}

/** Parameter constraints for validation */
export const PROJECTILE_PARAMETER_CONSTRAINTS = {
  initialSpeed: { min: 0, max: 1000, unit: 'm/s' },
  launchAngle: { min: -Math.PI, max: Math.PI, unit: 'rad' },
  gravity: { min: 0, max: 100, unit: 'm/s²' },
  initialHeight: { min: 0, max: 10000, unit: 'm' },
} as const;

export const DEFAULT_PROJECTILE_PARAMETERS: ProjectileMotionParameters = {
  initialSpeed: 20,
  launchAngle: Math.PI / 4, // 45 degrees
  gravity: 9.81,
  initialHeight: 0,
};
