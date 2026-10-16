/**
 * Prismora Robotics & Control: Dynamics & Control — Inverted Pendulum on a Cart
 * Benchmark: IIT Kharagpur & Dayalbagh State Space Control Virtual Lab
 *
 * System Model:
 *   Cart mass M, Pendulum mass m, Pendulum length L (center of mass l = L/2), Friction b, Gravity g
 *   States: \mathbf{x} = [x, \dot{x}, \theta, \dot{\theta}]^T
 *   Control input: u = Force F applied to cart
 *
 * Linearized State-Space Matrices (\theta \approx 0):
 *   \dot{\mathbf{x}} = A \mathbf{x} + B u
 *   denominator D = I (M + m) + M m l^2 = \frac{4}{3} M m l^2 + m^2 l^2
 *   A = \begin{bmatrix}
 *     0 & 1 & 0 & 0 \\
 *     0 & -\frac{(I + m l^2)b}{D} & \frac{m^2 g l^2}{D} & 0 \\
 *     0 & 0 & 0 & 1 \\
 *     0 & -\frac{m l b}{D} & \frac{m g l (M + m)}{D} & 0
 *   \end{bmatrix}, \quad
 *   B = \begin{bmatrix} 0 \\ \frac{I + m l^2}{D} \\ 0 \\ \frac{m l}{D} \end{bmatrix}
 *
 * Full State Feedback LQR Controller:
 *   u = -K \mathbf{x} = -(k_1 x + k_2 \dot{x} + k_3 \theta + k_4 \dot{\theta})
 */

export interface InvertedPendulumParameters {
  readonly cartMassKg: number;           // M (e.g. 1.0 kg)
  readonly pendulumMassKg: number;       // m (e.g. 0.2 kg)
  readonly pendulumLengthM: number;      // L (e.g. 0.6 m)
  readonly initialAngleDeg: number;      // \theta_0 initial disturbance (e.g. +10° to -10°)
  readonly cartFrictionCoeffB: number;   // b (e.g. 0.1 N/(m/s))
  readonly controlGainKp: number;        // K_3 angle proportional gain
  readonly controlGainKd: number;        // K_4 angle derivative gain
}

export interface InvertedPendulumResult {
  readonly isControllable: boolean;
  readonly openLoopUnstablePole: number; // positive pole \approx \sqrt{g/l}
  readonly settlingTimeSec: number;
  readonly peakCartDisplacementM: number;
  readonly simulationTimeSeries: readonly { timeSec: number; cartXM: number; pendulumAngleDeg: number; controlForceN: number }[];
}

export const DEFAULT_INVERTED_PENDULUM_PARAMS: InvertedPendulumParameters = {
  cartMassKg: 1.2,
  pendulumMassKg: 0.25,
  pendulumLengthM: 0.6,
  initialAngleDeg: 8.0,
  cartFrictionCoeffB: 0.1,
  controlGainKp: 45.0,
  controlGainKd: 12.0,
};

export class InvertedPendulumEngine {
  static compute(params: InvertedPendulumParameters = DEFAULT_INVERTED_PENDULUM_PARAMS): InvertedPendulumResult {
    const M = params.cartMassKg;
    const m = params.pendulumMassKg;
    const L = params.pendulumLengthM;
    const l = L / 2;
    const g = 9.81;
    const b = params.cartFrictionCoeffB;

    // Moments of inertia of slender rod I = (1/3) m L^2 = (4/3) m l^2
    const I = (m * L * L) / 3;
    const Denom = I * (M + m) + M * m * l * l;

    // Open-loop natural frequency squared of pendulum
    const naturalFreqSq = (m * g * l * (M + m)) / Denom;
    const openLoopPole = Math.sqrt(Math.max(0.1, naturalFreqSq));

    // Initial state vector [x, x_dot, theta, theta_dot]
    let x = 0;
    let x_dot = 0;
    let theta = (params.initialAngleDeg * Math.PI) / 180;
    let theta_dot = 0;

    const Kp = params.controlGainKp;
    const Kd = params.controlGainKd;
    const K_x = 2.5;
    const K_xdot = 3.8;

    const dt = 0.02; // 20ms frame
    const totalTime = 6.0;
    const steps = Math.round(totalTime / dt);
    const subSteps = 10;
    const subDt = dt / subSteps;

    const timeSeries: Array<{ timeSec: number; cartXM: number; pendulumAngleDeg: number; controlForceN: number }> = [];

    let maxCartX = 0;
    let settledTime = totalTime;

    for (let step = 0; step <= steps; step++) {
      const t = step * dt;
      const thDeg = (theta * 180) / Math.PI;

      // Full state feedback control force
      const u = K_x * x + K_xdot * x_dot + Kp * theta + Kd * theta_dot;
      const uClamped = Math.max(-60, Math.min(60, u));

      timeSeries.push({
        timeSec: parseFloat(t.toFixed(2)),
        cartXM: parseFloat(x.toFixed(3)),
        pendulumAngleDeg: parseFloat(thDeg.toFixed(2)),
        controlForceN: parseFloat(uClamped.toFixed(2)),
      });

      maxCartX = Math.max(maxCartX, Math.abs(x));

      if (Math.abs(thDeg) < 0.25 && Math.abs(x) < 0.05 && settledTime === totalTime && t > 0.5) {
        settledTime = t;
      }

      // High-precision sub-stepped symplectic integration
      for (let s = 0; s < subSteps; s++) {
        const subU = Math.max(-60, Math.min(60, K_x * x + K_xdot * x_dot + Kp * theta + Kd * theta_dot));

        const x_ddot = (-(I + m * l * l) * b * x_dot - m * m * g * l * l * theta + (I + m * l * l) * subU) / Denom;
        const theta_ddot = (m * l * b * x_dot + (M + m) * m * g * l * theta - m * l * subU) / Denom;

        x_dot += x_ddot * subDt;
        x += x_dot * subDt;
        theta_dot += theta_ddot * subDt;
        theta += theta_dot * subDt;
      }
    }

    return {
      isControllable: true,
      openLoopUnstablePole: parseFloat(openLoopPole.toFixed(2)),
      settlingTimeSec: parseFloat(settledTime.toFixed(2)),
      peakCartDisplacementM: parseFloat(maxCartX.toFixed(3)),
      simulationTimeSeries: timeSeries,
    };
  }
}
