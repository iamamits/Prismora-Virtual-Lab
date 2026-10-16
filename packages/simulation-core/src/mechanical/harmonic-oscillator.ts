/**
 * Prismora Mechanical Engineering Simulation Core — Harmonic Oscillator Evaluator
 *
 * Implements rigorous analytical and numerical modeling for Single-Degree-of-Freedom (SDOF)
 * translational mass-spring-damper systems benchmarked against AICTE Dynamics of Machinery
 * (ME-202) and IIT Roorkee Mechanical Vibrations Virtual Lab.
 *
 * Governing Equation of Motion:
 *   m * x''(t) + c * x'(t) + k * x(t) = F_0 * cos(ω * t)
 *
 * Parameters:
 *   m : Mass in kg (> 0)
 *   k : Spring stiffness in N/m (> 0)
 *   c : Damping coefficient in N·s/m (>= 0)
 *   F0: External harmonic force amplitude in N (>= 0)
 *   omega: Excitation driving frequency in rad/s (>= 0)
 *
 * Characteristic Quantities:
 *   Natural angular frequency: ω_n = sqrt(k / m)
 *   Critical damping coeff:   c_c = 2 * sqrt(k * m) = 2 * m * ω_n
 *   Damping ratio:            ζ = c / c_c
 *   Damped angular frequency: ω_d = ω_n * sqrt(1 - ζ^2) (for ζ < 1)
 *   Resonant frequency:       ω_r = ω_n * sqrt(1 - 2*ζ^2) (for ζ < 1/√2 ≈ 0.7071)
 *   Quality factor:           Q = 1 / (2 * ζ)
 *
 * Magnification Factor (Dynamic Amplification):
 *   M(r) = 1 / sqrt((1 - r^2)^2 + (2 * ζ * r)^2), where r = ω / ω_n
 *   Phase lag: φ = atan2(2 * ζ * r, 1 - r^2)
 */

export type DampingRegime = 'undamped' | 'underdamped' | 'critically_damped' | 'overdamped';

export interface HarmonicOscillatorParams {
  /** Mass in kilograms (e.g. 1.0 kg) */
  mass: number;
  /** Spring stiffness in Newtons per meter (e.g. 100 N/m) */
  stiffness: number;
  /** Damping coefficient in N·s/m (e.g. 2.0 N·s/m) */
  damping: number;
  /** Initial displacement x(0) in meters (e.g. 0.1 m) */
  initialDisplacement: number;
  /** Initial velocity v(0) in m/s (e.g. 0.0 m/s) */
  initialVelocity: number;
  /** External driving force amplitude in Newtons (0 for free vibration) */
  drivingForceAmp: number;
  /** External driving angular frequency in rad/s (e.g. 10 rad/s) */
  drivingFrequency: number;
}

export interface DynamicState {
  /** Time in seconds */
  time: number;
  /** Displacement x(t) in meters */
  displacement: number;
  /** Velocity v(t) = dx/dt in m/s */
  velocity: number;
  /** Acceleration a(t) = d²x/dt² in m/s² */
  acceleration: number;
  /** Kinetic energy T = 0.5 * m * v² in Joules */
  kineticEnergy: number;
  /** Potential energy V = 0.5 * k * x² in Joules */
  potentialEnergy: number;
  /** Total mechanical energy E = T + V in Joules */
  totalEnergy: number;
  /** Phase angle in phase space (atan2(v / omega_n, x)) */
  phaseSpaceAngle: number;
}

export interface FrequencyResponsePoint {
  frequencyRatio: number; // r = omega / omega_n
  drivingFreq: number;    // omega in rad/s
  magnification: number;  // M(r)
  phaseLagDeg: number;    // phi in degrees
  amplitude: number;      // X = (F0 / k) * M(r)
}

export interface SDOFSystemCharacteristics {
  naturalFrequencyRad: number; // omega_n in rad/s
  naturalFrequencyHz: number;  // f_n = omega_n / (2*pi)
  criticalDamping: number;     // c_c in N*s/m
  dampingRatio: number;        // zeta = c / c_c
  dampingRegime: DampingRegime;
  dampedFrequencyRad: number;  // omega_d in rad/s (null if overdamped/critically damped)
  dampedFrequencyHz: number;   // f_d in Hz
  resonantFrequencyRad: number;// omega_r in rad/s (null if zeta >= 1/sqrt(2))
  resonantFrequencyHz: number;
  qualityFactor: number;       // Q
  logarithmicDecrement: number;// delta = 2 * pi * zeta / sqrt(1 - zeta^2)
  staticDeflection: number;    // x_static = F0 / k
}

export class HarmonicOscillatorEvaluator {
  /**
   * Calculate static system characteristics independent of initial state.
   */
  public static computeCharacteristics(params: HarmonicOscillatorParams): SDOFSystemCharacteristics {
    const { mass: m, stiffness: k, damping: c, drivingForceAmp: F0 } = params;

    const safeM = Math.max(1e-6, m);
    const safeK = Math.max(1e-6, k);
    const safeC = Math.max(0, c);

    const omega_n = Math.sqrt(safeK / safeM);
    const f_n = omega_n / (2 * Math.PI);
    const c_c = 2 * Math.sqrt(safeK * safeM);
    const zeta = safeC / c_c;

    let dampingRegime: DampingRegime;
    if (zeta < 1e-6) {
      dampingRegime = 'undamped';
    } else if (zeta < 0.9999) {
      dampingRegime = 'underdamped';
    } else if (zeta <= 1.0001) {
      dampingRegime = 'critically_damped';
    } else {
      dampingRegime = 'overdamped';
    }

    const omega_d = zeta < 1 ? omega_n * Math.sqrt(1 - zeta * zeta) : 0;
    const f_d = omega_d / (2 * Math.PI);

    // Resonance peak occurs only when zeta < 1/sqrt(2) approx 0.707106
    let omega_r = 0;
    if (zeta < 1 / Math.SQRT2) {
      omega_r = omega_n * Math.sqrt(Math.max(0, 1 - 2 * zeta * zeta));
    }
    const f_r = omega_r / (2 * Math.PI);

    const qualityFactor = zeta > 1e-6 ? 1 / (2 * zeta) : Infinity;
    const logDecrement = zeta < 1 ? (2 * Math.PI * zeta) / Math.sqrt(Math.max(1e-6, 1 - zeta * zeta)) : Infinity;
    const staticDeflection = safeK > 0 ? F0 / safeK : 0;

    return {
      naturalFrequencyRad: omega_n,
      naturalFrequencyHz: f_n,
      criticalDamping: c_c,
      dampingRatio: zeta,
      dampingRegime,
      dampedFrequencyRad: omega_d,
      dampedFrequencyHz: f_d,
      resonantFrequencyRad: omega_r,
      resonantFrequencyHz: f_r,
      qualityFactor,
      logarithmicDecrement: logDecrement,
      staticDeflection,
    };
  }

  /**
   * Compute exact analytical state x(t), v(t), a(t) for free or forced vibration at time t.
   */
  public static computeState(params: HarmonicOscillatorParams, time: number): DynamicState {
    const t = Math.max(0, time);
    const { mass: m, stiffness: k, damping: c, initialDisplacement: x0, initialVelocity: v0, drivingForceAmp: F0, drivingFrequency: omega } = params;

    const char = this.computeCharacteristics(params);
    const { naturalFrequencyRad: wn, dampingRatio: zeta, dampedFrequencyRad: wd } = char;

    let x = 0;
    let v = 0;

    // Handle steady-state forced component if F0 > 0 and drivingFrequency > 0
    let x_particular = 0;
    let v_particular = 0;

    if (F0 > 0 && omega >= 0) {
      // Particular solution: x_p(t) = X * cos(omega * t - phi)
      // where X = (F0 / m) / sqrt((wn^2 - omega^2)^2 + (2 * zeta * wn * omega)^2)
      // and phi = atan2(2 * zeta * wn * omega, wn^2 - omega^2)
      const denom = Math.sqrt(Math.pow(wn * wn - omega * omega, 2) + Math.pow(2 * zeta * wn * omega, 2));
      const X_amp = denom > 1e-9 ? (F0 / m) / denom : 0;
      const phi = Math.atan2(2 * zeta * wn * omega, wn * wn - omega * omega);

      x_particular = X_amp * Math.cos(omega * t - phi);
      v_particular = -X_amp * omega * Math.sin(omega * t - phi);
    }

    // Homogeneous initial conditions adjusted for particular solution at t=0
    const x0_h = x0 - (F0 > 0 ? (F0 / m) * (wn * wn - omega * omega) / (Math.pow(wn * wn - omega * omega, 2) + Math.pow(2 * zeta * wn * omega, 2) || 1) : 0);
    const v0_h = v0 - (F0 > 0 ? (F0 / m) * (-2 * zeta * wn * omega * omega) / (Math.pow(wn * wn - omega * omega, 2) + Math.pow(2 * zeta * wn * omega, 2) || 1) : 0);

    // Homogeneous complementary solution x_h(t)
    let x_h = 0;
    let v_h = 0;

    if (zeta < 1e-6) {
      // 1. Undamped (zeta = 0)
      const A = x0_h;
      const B = v0_h / wn;
      x_h = A * Math.cos(wn * t) + B * Math.sin(wn * t);
      v_h = -A * wn * Math.sin(wn * t) + B * wn * Math.cos(wn * t);
    } else if (zeta < 0.9999) {
      // 2. Underdamped (0 < zeta < 1)
      const decay = Math.exp(-zeta * wn * t);
      const A = x0_h;
      const B = (v0_h + zeta * wn * x0_h) / wd;
      const cosWd = Math.cos(wd * t);
      const sinWd = Math.sin(wd * t);

      x_h = decay * (A * cosWd + B * sinWd);
      v_h = -zeta * wn * decay * (A * cosWd + B * sinWd) + decay * (-A * wd * sinWd + B * wd * cosWd);
    } else if (zeta <= 1.0001) {
      // 3. Critically Damped (zeta = 1)
      const decay = Math.exp(-wn * t);
      const c1 = x0_h;
      const c2 = v0_h + wn * x0_h;
      x_h = decay * (c1 + c2 * t);
      v_h = decay * (c2 - wn * (c1 + c2 * t));
    } else {
      // 4. Overdamped (zeta > 1)
      const s = wn * Math.sqrt(zeta * zeta - 1);
      const r1 = -zeta * wn + s;
      const r2 = -zeta * wn - s;
      const c1 = (v0_h - r2 * x0_h) / (r1 - r2);
      const c2 = (r1 * x0_h - v0_h) / (r1 - r2);

      x_h = c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
      v_h = c1 * r1 * Math.exp(r1 * t) + c2 * r2 * Math.exp(r2 * t);
    }

    x = x_h + x_particular;
    v = v_h + v_particular;

    // Acceleration from equation of motion: a = (F(t) - c*v - k*x) / m
    const F_t = F0 * Math.cos(omega * t);
    const a = (F_t - c * v - k * x) / m;

    const kineticEnergy = 0.5 * m * v * v;
    const potentialEnergy = 0.5 * k * x * x;
    const totalEnergy = kineticEnergy + potentialEnergy;
    const phaseSpaceAngle = Math.atan2(v / Math.max(1e-6, wn), x);

    return {
      time: t,
      displacement: x,
      velocity: v,
      acceleration: a,
      kineticEnergy,
      potentialEnergy,
      totalEnergy,
      phaseSpaceAngle,
    };
  }

  /**
   * Generate continuous time trajectory points for plotting time histories.
   */
  public static generateTrajectory(
    params: HarmonicOscillatorParams,
    durationSec: number = 10,
    numPoints: number = 400
  ): DynamicState[] {
    const states: DynamicState[] = [];
    const dt = durationSec / Math.max(1, numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const t = i * dt;
      states.push(this.computeState(params, t));
    }

    return states;
  }

  /**
   * Generate Frequency Response Curve (Bode Magnitude & Phase) across frequency ratios r = 0 to 3.0.
   */
  public static generateFrequencyResponse(
    params: HarmonicOscillatorParams,
    maxRatio: number = 3.0,
    steps: number = 150
  ): FrequencyResponsePoint[] {
    const char = this.computeCharacteristics(params);
    const { naturalFrequencyRad: wn, dampingRatio: zeta } = char;
    const { stiffness: k, drivingForceAmp: F0 } = params;

    const curve: FrequencyResponsePoint[] = [];
    const dr = maxRatio / (steps - 1);

    for (let i = 0; i < steps; i++) {
      const r = i * dr;
      const w = r * wn;

      const denom = Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
      const M = denom > 1e-6 ? 1 / denom : 100;
      const phaseRad = Math.atan2(2 * zeta * r, 1 - r * r);
      const phaseDeg = (phaseRad * 180) / Math.PI;
      const amp = k > 0 ? (F0 / k) * M : 0;

      curve.push({
        frequencyRatio: r,
        drivingFreq: w,
        magnification: M,
        phaseLagDeg: phaseDeg,
        amplitude: amp,
      });
    }

    return curve;
  }
}
