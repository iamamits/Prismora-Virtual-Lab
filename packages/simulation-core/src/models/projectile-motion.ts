import type { SimulationModel, MeasurementValue, ValidationResult } from '../types/simulation';
import type { ProjectileMotionParameters } from '../types/parameters';
import { DEFAULT_PROJECTILE_PARAMETERS } from '../types/parameters';
import type { ProjectileMotionState } from '../types/state';
import { validateProjectileParameters } from '../validation/parameter-validator';

/**
 * Analytical projectile motion model (no air resistance).
 *
 * Equations of motion:
 *   x(t) = v₀·cos(θ)·t
 *   y(t) = y₀ + v₀·sin(θ)·t - ½·g·t²
 *   vx(t) = v₀·cos(θ)
 *   vy(t) = v₀·sin(θ) - g·t
 *   ax(t) = 0
 *   ay(t) = -g
 *
 * Terminal time: when y(t) = 0 (ground level)
 *   y₀ + v₀·sin(θ)·t - ½·g·t² = 0
 *   Using quadratic formula: t = (v₀·sin(θ) + √(v₀²·sin²(θ) + 2·g·y₀)) / g
 *
 * Maximum height: at t_max = v₀·sin(θ)/g
 *   y_max = y₀ + v₀²·sin²(θ) / (2·g)
 *
 * Range: x(t_flight)
 *
 * All units are SI: metres, seconds, m/s, m/s², radians.
 */
export class ProjectileMotionModel
  implements SimulationModel<ProjectileMotionParameters, ProjectileMotionState>
{
  readonly id = 'projectile-motion';
  readonly version = '1.0.0';
  readonly name = 'Projectile Motion (Ideal)';

  getDefaultParameters(): ProjectileMotionParameters {
    return { ...DEFAULT_PROJECTILE_PARAMETERS };
  }

  validateParameters(params: ProjectileMotionParameters): ValidationResult {
    return validateProjectileParameters(params);
  }

  /**
   * Compute the state at a given time using analytical equations.
   * Time must be >= 0. If time exceeds the terminal time, the state
   * is computed at the terminal time and marked as terminated.
   */
  computeState(params: ProjectileMotionParameters, time: number): ProjectileMotionState {
    const { initialSpeed: v0, launchAngle: theta, gravity: g, initialHeight: y0 } = params;

    const cosTheta = Math.cos(theta);
    const sinTheta = Math.sin(theta);

    // Check if already terminated at t=0
    // Case: on ground with no upward velocity and no height
    const terminalTime = this.computeTerminalTime(params);

    let t = Math.max(0, time);
    let terminated = false;
    let terminationReason: string | undefined;

    if (terminalTime !== null && t >= terminalTime) {
      t = terminalTime;
      terminated = true;
      terminationReason = 'Projectile reached ground level';
    }

    // Position
    const x = v0 * cosTheta * t;
    const y = y0 + v0 * sinTheta * t - 0.5 * g * t * t;

    // Velocity
    const vx = v0 * cosTheta;
    const vy = v0 * sinTheta - g * t;

    // Acceleration (constant)
    const ax = 0;
    const ay = -g;

    // Derived quantities
    const speed = Math.sqrt(vx * vx + vy * vy);
    const kineticEnergyPerMass = 0.5 * speed * speed;
    const potentialEnergyPerMass = g * Math.max(0, y);

    return {
      time: t,
      position: { x, y: Math.max(0, y) }, // Clamp to ground for display
      velocity: { x: vx, y: vy },
      acceleration: { x: ax, y: ay },
      terminated,
      terminationReason,
      speed,
      kineticEnergyPerMass,
      potentialEnergyPerMass,
    };
  }

  /**
   * Compute the time at which the projectile reaches ground level (y = 0).
   *
   * Solves: y₀ + v₀·sin(θ)·t - ½·g·t² = 0
   *
   * Returns null if the projectile never reaches ground:
   * - Zero gravity with non-negative vertical velocity and positive height
   * - Zero gravity, zero vertical velocity (hovers forever)
   *
   * Edge cases:
   * - g=0, vy<0: linear descent, t = y₀ / |vy|
   * - g=0, vy=0, y₀=0: already on ground, t=0
   * - g=0, vy>0: never lands (returns null)
   * - g=0, vy=0, y₀>0: hovers forever (returns null)
   * - y₀=0, vy<=0: already at or below ground, t=0
   */
  computeTerminalTime(params: ProjectileMotionParameters): number | null {
    const { initialSpeed: v0, launchAngle: theta, gravity: g, initialHeight: y0 } = params;
    const vy0 = v0 * Math.sin(theta);

    // Already on ground with no upward velocity
    if (y0 === 0 && vy0 <= 0) {
      return 0;
    }

    // Zero gravity cases
    if (g === 0) {
      if (vy0 < 0 && y0 > 0) {
        // Linear descent: y₀ + vy₀·t = 0 → t = -y₀/vy₀ = y₀/|vy₀|
        return -y0 / vy0;
      }
      if (vy0 < 0 && y0 === 0) {
        return 0;
      }
      // vy0 >= 0: either going up or stationary — never lands
      return null;
    }

    // Standard case: solve quadratic -½g·t² + vy₀·t + y₀ = 0
    // → ½g·t² - vy₀·t - y₀ = 0
    // → t = (vy₀ + √(vy₀² + 2·g·y₀)) / g
    const discriminant = vy0 * vy0 + 2 * g * y0;

    if (discriminant < 0) {
      // Should not happen with g >= 0 and y0 >= 0, but handle gracefully
      return null;
    }

    const sqrtDisc = Math.sqrt(discriminant);
    const t = (vy0 + sqrtDisc) / g;

    return Math.max(0, t);
  }

  /**
   * Compute derived measurements for a given parameter set and state.
   */
  computeMeasurements(
    params: ProjectileMotionParameters,
    state: ProjectileMotionState,
  ): Record<string, MeasurementValue> {
    const { initialSpeed: v0, launchAngle: theta, gravity: g, initialHeight: y0 } = params;
    const sinTheta = Math.sin(theta);

    // Flight time
    const flightTime = this.computeTerminalTime(params);

    // Max height: y₀ + v₀²·sin²(θ) / (2·g)
    let maxHeight: number;
    let timeToMaxHeight: number;

    if (g === 0) {
      // With zero gravity, if going up, max height is infinite
      // For practical purposes, report current height
      if (v0 * sinTheta > 0) {
        // Going up forever
        maxHeight = Infinity;
        timeToMaxHeight = Infinity;
      } else {
        // Not going up — max height is initial height
        maxHeight = y0;
        timeToMaxHeight = 0;
      }
    } else {
      timeToMaxHeight = Math.max(0, (v0 * sinTheta) / g);
      // If timeToMaxHeight exceeds flight time, the max height occurs at flight time is clamped
      // But the vertex is still the mathematical max — we report the achievable max
      if (flightTime !== null && timeToMaxHeight > flightTime) {
        // Projectile doesn't reach the vertex before landing
        // Max height is the initial height (it's going down the whole time)
        // Actually we need to check: the max height is at t=0 if vy0 < 0
        maxHeight = y0;
        timeToMaxHeight = 0;
      } else {
        maxHeight = y0 + (v0 * sinTheta * v0 * sinTheta) / (2 * g);
      }
    }

    // Range
    let range: number | null = null;
    if (flightTime !== null) {
      range = v0 * Math.cos(theta) * flightTime;
    }

    return {
      flightTime: {
        value: flightTime ?? NaN,
        unit: 's',
        label: 'Flight Time',
        precision: 3,
      },
      maxHeight: {
        value: maxHeight,
        unit: 'm',
        label: 'Maximum Height',
        precision: 3,
      },
      timeToMaxHeight: {
        value: timeToMaxHeight,
        unit: 's',
        label: 'Time to Max Height',
        precision: 3,
      },
      range: {
        value: range ?? NaN,
        unit: 'm',
        label: 'Horizontal Range',
        precision: 3,
      },
      currentSpeed: {
        value: state.speed,
        unit: 'm/s',
        label: 'Speed',
        precision: 2,
      },
      currentHeight: {
        value: state.position.y,
        unit: 'm',
        label: 'Height',
        precision: 2,
      },
      currentDistance: {
        value: state.position.x,
        unit: 'm',
        label: 'Distance',
        precision: 2,
      },
    };
  }
}

/** Singleton instance for convenience */
export const projectileMotionModel = new ProjectileMotionModel();
