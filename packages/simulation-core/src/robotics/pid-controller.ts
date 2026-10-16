/**
 * Closed-Loop PID Controller Tuning & Dynamic Step Response
 * Benchmark: IIT Kharagpur & Dayalbagh Control Systems Virtual Labs
 *
 * Simulates a second-order feedback control system:
 * - Plant: G(s) = omega_n^2 / (s^2 + 2 * zeta * omega_n * s + omega_n^2)
 * - PID Controller: C(s) = Kp + Ki / s + Kd * s
 * - Closed-Loop Step Response y(t)
 *
 * Calculates:
 * 1. Rise Time t_r (time to rise from 10% to 90% of setpoint)
 * 2. Peak Time t_p & Percentage Overshoot M_p %
 * 3. Settling Time t_s (2% error tolerance band)
 * 4. Steady-State Error e_ss
 */

export interface PidParameters {
  /** Proportional Gain Kp (0 - 50) */
  readonly kp: number;
  /** Integral Gain Ki (0 - 20) */
  readonly ki: number;
  /** Derivative Gain Kd (0 - 10) */
  readonly kd: number;
  /** Plant natural frequency omega_n in rad/s (1 - 10) */
  readonly naturalFrequencyRadS: number;
  /** Plant damping ratio zeta (0.1 - 2.0) */
  readonly dampingRatio: number;
  /** Commanded setpoint step amplitude (e.g. 1.0 or 10.0) */
  readonly setpoint: number;
  /** Simulation duration in seconds */
  readonly simulationDurationS: number;
}

export interface PidStepPoint {
  readonly timeS: number;
  readonly setpoint: number;
  readonly output: number;
  readonly error: number;
  readonly controlSignal: number;
}

export interface PidPerformanceResult {
  readonly riseTimeS: number | null;
  readonly peakTimeS: number | null;
  readonly peakValue: number;
  readonly overshootPercent: number;
  readonly settlingTimeS: number | null;
  readonly steadyStateError: number;
  readonly isStable: boolean;
  readonly trajectory: readonly PidStepPoint[];
  readonly peakOvershootPct: number;
  readonly settlingTimeSec: number;
  readonly riseTimeSec: number;
  readonly stepResponsePoints: readonly { timeSec: number; outputY: number }[];
}

export const DEFAULT_PID_PARAMS: PidParameters = {
  kp: 8.0,
  ki: 2.5,
  kd: 1.2,
  naturalFrequencyRadS: 3.0,
  dampingRatio: 0.5,
  setpoint: 1.0,
  simulationDurationS: 6.0,
};

export class PidControllerEngine {
  static compute(params: PidParameters): PidPerformanceResult {
    const { kp, ki, kd, naturalFrequencyRadS: wn, dampingRatio: zeta, setpoint: r, simulationDurationS: tMax } = params;

    const dt = 0.01; // 10ms sampling interval
    const steps = Math.round(tMax / dt);

    // Second-order plant state: [y, dy/dt]
    // d^2y/dt^2 = -2*zeta*wn*dy/dt - wn^2*y + wn^2*u(t)
    let y = 0;
    let yDot = 0;
    let integralError = 0;
    let prevError = r - y;

    const trajectory: PidStepPoint[] = [];

    let peakVal = 0;
    let peakTime: number | null = null;
    let riseTimeStart: number | null = null;
    let riseTimeEnd: number | null = null;
    let settlingTime: number | null = null;

    const lowerRiseThresh = 0.1 * r;
    const upperRiseThresh = 0.9 * r;
    const settlingTolerance = 0.02 * Math.abs(r);

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;
      const error = r - y;

      integralError += error * dt;
      // Clamp anti-windup
      integralError = Math.max(-50, Math.min(50, integralError));

      const derivativeError = (error - prevError) / dt;
      prevError = error;

      // PID control law: u(t) = Kp*e + Ki*integral(e) + Kd*de/dt
      let u = kp * error + ki * integralError + kd * derivativeError;
      // Saturate actuator output (-100 to +100)
      u = Math.max(-100, Math.min(100, u));

      trajectory.push({
        timeS: Number(t.toFixed(2)),
        setpoint: r,
        output: Number(y.toFixed(3)),
        error: Number(error.toFixed(3)),
        controlSignal: Number(u.toFixed(2)),
      });

      // Track rise time
      if (riseTimeStart === null && y >= lowerRiseThresh) {
        riseTimeStart = t;
      }
      if (riseTimeEnd === null && y >= upperRiseThresh) {
        riseTimeEnd = t;
      }

      // Track peak overshoot
      if (y > peakVal) {
        peakVal = y;
        peakTime = t;
      }

      // RK2 / Euler step for plant dynamics
      const yDdot = -2 * zeta * wn * yDot - wn * wn * y + wn * wn * u;
      yDot += yDdot * dt;
      y += yDot * dt;

      // Check stability: if output explodes beyond 1000x setpoint
      if (Math.abs(y) > 1000 * Math.max(1, Math.abs(r))) {
        break;
      }
    }

    // Determine settling time (last time error was outside 2% tolerance)
    for (let i = trajectory.length - 1; i >= 0; i--) {
      const pt = trajectory[i]!;
      if (Math.abs(pt.setpoint - pt.output) > settlingTolerance) {
        settlingTime = pt.timeS;
        break;
      }
    }

    const finalOutput = trajectory[trajectory.length - 1]?.output ?? 0;
    const ssError = Math.abs(r - finalOutput);
    const overshootPct = r > 0 && peakVal > r ? ((peakVal - r) / r) * 100 : 0;
    const riseTime = riseTimeStart !== null && riseTimeEnd !== null ? riseTimeEnd - riseTimeStart : null;
    const isStable = Math.abs(finalOutput) < 50 * Math.max(1, Math.abs(r)) && !isNaN(finalOutput);

    const stepResponsePoints = trajectory.map((p) => ({
      timeSec: p.timeS,
      outputY: p.output,
    }));

    return {
      riseTimeS: riseTime !== null ? Number(riseTime.toFixed(2)) : null,
      peakTimeS: peakTime !== null ? Number(peakTime.toFixed(2)) : null,
      peakValue: Number(peakVal.toFixed(3)),
      overshootPercent: Number(overshootPct.toFixed(1)),
      settlingTimeS: settlingTime !== null ? Number(settlingTime.toFixed(2)) : null,
      steadyStateError: Number(ssError.toFixed(4)),
      isStable,
      trajectory,
      peakOvershootPct: Number(overshootPct.toFixed(1)),
      settlingTimeSec: settlingTime !== null ? Number(settlingTime.toFixed(2)) : 0,
      riseTimeSec: riseTime !== null ? Number(riseTime.toFixed(2)) : 0,
      stepResponsePoints,
    };
  }
}
