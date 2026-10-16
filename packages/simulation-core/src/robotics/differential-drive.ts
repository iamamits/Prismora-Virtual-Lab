/**
 * Prismora Robotics: Mobile Robotics — Differential Drive Kinematics & Trajectory Tracking
 * Benchmark: IIIT Hyderabad & IIT Kanpur Mobile Robotics Virtual Lab
 *
 * Kinematic Model (Unicycle / Two-Wheeled Differential Drive Robot):
 *   Wheel base = L (distance between wheels)
 *   Wheel radius = r
 *   Left wheel speed = \omega_L (rad/s), Right wheel speed = \omega_R (rad/s)
 *   Linear wheel velocities: v_L = r \omega_L, \quad v_R = r \omega_R
 *
 * Robot Chassis Forward Velocity v and Angular Velocity \omega:
 *   v = \frac{v_R + v_L}{2}
 *   \omega = \frac{v_R - v_L}{L}
 *
 * Instantaneous Center of Curvature (ICC):
 *   R = \frac{v}{\omega} = \frac{L}{2} \frac{v_R + v_L}{v_R - v_L}
 *
 * Discrete Odometry Integration (Runge-Kutta / Forward Euler):
 *   \dot{x} = v \cos\theta
 *   \dot{y} = v \sin\theta
 *   \dot{\theta} = \omega
 */

export type RobotTrajectoryPreset = 'straight_line' | 'circle' | 'figure_eight' | 'spin_in_place';

export interface DifferentialDriveParameters {
  readonly wheelBaseM: number;           // L in metres (e.g. 0.35 m)
  readonly wheelRadiusM: number;         // r in metres (e.g. 0.05 m)
  readonly leftWheelSpeedRadPerS: number;// \omega_L (e.g. -10 to +10 rad/s)
  readonly rightWheelSpeedRadPerS: number;// \omega_R (e.g. -10 to +10 rad/s)
  readonly simulationTimeSec: number;    // Duration (e.g. 5 sec - 20 sec)
  readonly initialPose?: { x: number; y: number; thetaDeg: number };
}

export interface DifferentialDriveResult {
  readonly linearVelocityMPerS: number;   // v
  readonly angularVelocityRadPerS: number;// \omega
  readonly turningRadiusM: number | null;// R (null if straight line)
  readonly finalPose: { x: number; y: number; thetaDeg: number };
  readonly trajectoryPoints: readonly { timeSec: number; xM: number; yM: number; headingDeg: number }[];
}

export const DEFAULT_DIFF_DRIVE_PARAMS: DifferentialDriveParameters = {
  wheelBaseM: 0.35,
  wheelRadiusM: 0.06,
  leftWheelSpeedRadPerS: 5.0,
  rightWheelSpeedRadPerS: 7.5,
  simulationTimeSec: 8.0,
  initialPose: { x: 0, y: 0, thetaDeg: 0 },
};

export class DifferentialDriveEngine {
  static compute(params: DifferentialDriveParameters = DEFAULT_DIFF_DRIVE_PARAMS): DifferentialDriveResult {
    const L = params.wheelBaseM;
    const r = params.wheelRadiusM;
    const wL = params.leftWheelSpeedRadPerS;
    const wR = params.rightWheelSpeedRadPerS;

    const vL = r * wL;
    const vR = r * wR;

    const v = (vR + vL) / 2;
    const omega = (vR - vL) / L;
    const turningRadius = Math.abs(omega) > 1e-4 ? v / omega : null;

    let x = params.initialPose?.x ?? 0;
    let y = params.initialPose?.y ?? 0;
    let theta = ((params.initialPose?.thetaDeg ?? 0) * Math.PI) / 180;

    const dt = 0.1; // 100ms step
    const steps = Math.round(params.simulationTimeSec / dt);

    const trajectory: Array<{ timeSec: number; xM: number; yM: number; headingDeg: number }> = [
      {
        timeSec: 0,
        xM: parseFloat(x.toFixed(2)),
        yM: parseFloat(y.toFixed(2)),
        headingDeg: parseFloat(((theta * 180) / Math.PI).toFixed(1)),
      },
    ];

    for (let i = 1; i <= steps; i++) {
      if (Math.abs(omega) < 1e-5) {
        // Straight line motion
        x += v * Math.cos(theta) * dt;
        y += v * Math.sin(theta) * dt;
      } else {
        // Exact circular arc integration
        const dTheta = omega * dt;
        x += (v / omega) * (Math.sin(theta + dTheta) - Math.sin(theta));
        y -= (v / omega) * (Math.cos(theta + dTheta) - Math.cos(theta));
        theta += dTheta;
      }

      let deg = (theta * 180) / Math.PI;
      while (deg > 180) deg -= 360;
      while (deg < -180) deg += 360;

      trajectory.push({
        timeSec: parseFloat((i * dt).toFixed(1)),
        xM: parseFloat(x.toFixed(3)),
        yM: parseFloat(y.toFixed(3)),
        headingDeg: parseFloat(deg.toFixed(1)),
      });
    }

    const lastPose = trajectory[trajectory.length - 1]!;

    return {
      linearVelocityMPerS: parseFloat(v.toFixed(3)),
      angularVelocityRadPerS: parseFloat(omega.toFixed(3)),
      turningRadiusM: turningRadius !== null ? parseFloat(turningRadius.toFixed(2)) : null,
      finalPose: {
        x: lastPose.xM,
        y: lastPose.yM,
        thetaDeg: lastPose.headingDeg,
      },
      trajectoryPoints: trajectory,
    };
  }
}
