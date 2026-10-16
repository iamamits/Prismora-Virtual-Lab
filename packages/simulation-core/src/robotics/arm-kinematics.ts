/**
 * Prismora Robotics & Mechanisms: Articulated Serial Arm Kinematics
 * Denavit-Hartenberg (DH) Convention, Forward & Analytical Inverse Kinematics
 *
 * Forward Kinematics:
 *   ^{i-1}T_i = Rot_z(\theta_i) * Trans_z(d_i) * Trans_x(a_i) * Rot_x(\alpha_i)
 *
 * Analytical Inverse Kinematics (2-Link / 3-Link Planar):
 *   \cos\theta_2 = \frac{x^2 + y^2 - l_1^2 - l_2^2}{2 l_1 l_2}
 *   \theta_1 = \text{atan2}(y, x) - \text{atan2}(l_2\sin\theta_2, l_1 + l_2\cos\theta_2)
 *
 * Kinematic Singularity:
 *   \det(J) = l_1 l_2 \sin\theta_2 = 0 \implies \theta_2 = 0^\circ \text{ (Boundary)} \text{ or } 180^\circ
 */

export interface DHParameters {
  readonly thetaRad: number; // Joint rotation angle around z_{i-1}
  readonly dMetres: number;  // Joint offset along z_{i-1}
  readonly aMetres: number;  // Link length along x_i
  readonly alphaRad: number; // Link twist around x_i
}

export interface JointCoordinate {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly angleDeg: number;
}

export interface ForwardKinematicsResult {
  readonly joints: readonly JointCoordinate[];
  readonly endEffector: JointCoordinate;
  readonly transformationMatrices: readonly number[][][]; // 4x4 matrices
  readonly jacobian: number[][]; // 2x2 or 2x3 matrix
  readonly manipulability: number;
  readonly isSingular: boolean;
  readonly reachabilityRadius: number;
}

export interface InverseKinematicsResult {
  readonly isReachable: boolean;
  readonly clampedTarget: { x: number; y: number };
  readonly solutions: {
    readonly elbowDown: { theta1Deg: number; theta2Deg: number; theta3Deg?: number };
    readonly elbowUp: { theta1Deg: number; theta2Deg: number; theta3Deg?: number };
  };
}

/**
 * Compute 4x4 Homogeneous Transformation Matrix from DH parameters
 */
export function computeDHMatrix(params: DHParameters): number[][] {
  const { thetaRad: theta, dMetres: d, aMetres: a, alphaRad: alpha } = params;
  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const cosA = Math.cos(alpha);
  const sinA = Math.sin(alpha);

  return [
    [cosT, -sinT * cosA, sinT * sinA, a * cosT],
    [sinT, cosT * cosA, -cosT * sinA, a * sinT],
    [0, sinA, cosA, d],
    [0, 0, 0, 1],
  ];
}

/**
 * Multiply two 4x4 matrices
 */
export function multiplyMatrices4x4(A: number[][], B: number[][]): number[][] {
  const result: number[][] = Array.from({ length: 4 }, () => new Array(4).fill(0));
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += A[i]![k]! * B[k]![j]!;
      }
      result[i]![j] = sum;
    }
  }
  return result;
}

/**
 * Compute forward kinematics for a 2-Link or 3-Link planar robot arm
 */
export function computeForwardKinematics(
  linkLengths: [number, number, number?],
  jointAnglesDeg: [number, number, number?]
): ForwardKinematicsResult {
  const l1 = linkLengths[0];
  const l2 = linkLengths[1];
  const l3 = linkLengths[2] ?? 0;

  const t1 = (jointAnglesDeg[0] * Math.PI) / 180;
  const t2 = (jointAnglesDeg[1] * Math.PI) / 180;
  const t3 = linkLengths[2] !== undefined ? ((jointAnglesDeg[2] ?? 0) * Math.PI) / 180 : 0;

  // Joint 0 (Base Origin)
  const j0: JointCoordinate = { x: 0, y: 0, z: 0, angleDeg: 0 };

  // Joint 1
  const x1 = l1 * Math.cos(t1);
  const y1 = l1 * Math.sin(t1);
  const j1: JointCoordinate = { x: parseFloat(x1.toFixed(4)), y: parseFloat(y1.toFixed(4)), z: 0, angleDeg: jointAnglesDeg[0] };

  // Joint 2
  const x2 = x1 + l2 * Math.cos(t1 + t2);
  const y2 = y1 + l2 * Math.sin(t1 + t2);
  const j2: JointCoordinate = {
    x: parseFloat(x2.toFixed(4)),
    y: parseFloat(y2.toFixed(4)),
    z: 0,
    angleDeg: parseFloat(((jointAnglesDeg[0] + jointAnglesDeg[1]) % 360).toFixed(2)),
  };

  // Joint 3 (End Effector)
  let endEffector = j2;
  const joints: JointCoordinate[] = [j0, j1, j2];

  if (linkLengths[2] && linkLengths[2] > 0) {
    const x3 = x2 + l3 * Math.cos(t1 + t2 + t3);
    const y3 = y2 + l3 * Math.sin(t1 + t2 + t3);
    const j3: JointCoordinate = {
      x: parseFloat(x3.toFixed(4)),
      y: parseFloat(y3.toFixed(4)),
      z: 0,
      angleDeg: parseFloat(((jointAnglesDeg[0] + jointAnglesDeg[1] + (jointAnglesDeg[2] ?? 0)) % 360).toFixed(2)),
    };
    joints.push(j3);
    endEffector = j3;
  }

  // Compute DH Transformations
  const dh1 = computeDHMatrix({ thetaRad: t1, dMetres: 0, aMetres: l1, alphaRad: 0 });
  const dh2 = computeDHMatrix({ thetaRad: t2, dMetres: 0, aMetres: l2, alphaRad: 0 });
  const T01 = dh1;
  const T02 = multiplyMatrices4x4(T01, dh2);
  const transformMatrices: number[][][] = [T01, T02];

  if (linkLengths[2] && linkLengths[2] > 0) {
    const dh3 = computeDHMatrix({ thetaRad: t3, dMetres: 0, aMetres: l3, alphaRad: 0 });
    const T03 = multiplyMatrices4x4(T02, dh3);
    transformMatrices.push(T03);
  }

  // Jacobian Matrix (2x2 for planar positioning)
  // J = [ -l1*sin(t1) - l2*sin(t1+t2),  -l2*sin(t1+t2) ]
  //     [  l1*cos(t1) + l2*cos(t1+t2),   l2*cos(t1+t2) ]
  const j11 = -l1 * Math.sin(t1) - l2 * Math.sin(t1 + t2);
  const j12 = -l2 * Math.sin(t1 + t2);
  const j21 = l1 * Math.cos(t1) + l2 * Math.cos(t1 + t2);
  const j22 = l2 * Math.cos(t1 + t2);

  const jacobian = [
    [parseFloat(j11.toFixed(3)), parseFloat(j12.toFixed(3))],
    [parseFloat(j21.toFixed(3)), parseFloat(j22.toFixed(3))],
  ];

  // Determinant: det(J) = l1*l2*sin(t2)
  const detJ = l1 * l2 * Math.sin(t2);
  const manipulability = parseFloat(Math.abs(detJ).toFixed(4));
  const isSingular = Math.abs(detJ) < 0.05 * (l1 * l2); // within 5% of boundary singular condition

  const reachabilityRadius = l1 + l2 + l3;

  return {
    joints,
    endEffector,
    transformationMatrices: transformMatrices,
    jacobian,
    manipulability,
    isSingular,
    reachabilityRadius: parseFloat(reachabilityRadius.toFixed(3)),
  };
}

/**
 * Analytical closed-form 2-DOF planar inverse kinematics solver
 */
export function computeInverseKinematics(
  targetX: number,
  targetY: number,
  l1: number,
  l2: number
): InverseKinematicsResult {
  const dist = Math.hypot(targetX, targetY);
  const maxReach = l1 + l2;
  const minReach = Math.abs(l1 - l2);

  let isReachable = true;
  let clampedX = targetX;
  let clampedY = targetY;

  // Clamp if outside reachable workspace annulus
  if (dist > maxReach) {
    isReachable = false;
    clampedX = (targetX / dist) * (maxReach - 1e-4);
    clampedY = (targetY / dist) * (maxReach - 1e-4);
  } else if (dist < minReach) {
    isReachable = false;
    const safeMin = Math.max(1e-4, minReach + 1e-4);
    clampedX = dist > 1e-4 ? (targetX / dist) * safeMin : safeMin;
    clampedY = dist > 1e-4 ? (targetY / dist) * safeMin : 0;
  }

  const r2 = clampedX * clampedX + clampedY * clampedY;
  // Law of Cosines for theta2: r^2 = l1^2 + l2^2 + 2*l1*l2*cos(theta2)
  let cosT2 = (r2 - l1 * l1 - l2 * l2) / (2 * l1 * l2);
  cosT2 = Math.max(-1, Math.min(1, cosT2)); // Numerical safety clamp

  // Two solutions: Elbow Down (+theta2) and Elbow Up (-theta2)
  const t2Down = Math.acos(cosT2);
  const t2Up = -Math.acos(cosT2);

  // Solve for theta1: theta1 = atan2(y, x) - atan2(l2*sin(t2), l1 + l2*cos(t2))
  const beta = Math.atan2(clampedY, clampedX);

  const t1Down = beta - Math.atan2(l2 * Math.sin(t2Down), l1 + l2 * Math.cos(t2Down));
  const t1Up = beta - Math.atan2(l2 * Math.sin(t2Up), l1 + l2 * Math.cos(t2Up));

  const toDeg = (rad: number) => {
    let deg = (rad * 180) / Math.PI;
    while (deg > 180) deg -= 360;
    while (deg < -180) deg += 360;
    return parseFloat(deg.toFixed(2));
  };

  return {
    isReachable,
    clampedTarget: { x: parseFloat(clampedX.toFixed(3)), y: parseFloat(clampedY.toFixed(3)) },
    solutions: {
      elbowDown: {
        theta1Deg: toDeg(t1Down),
        theta2Deg: toDeg(t2Down),
      },
      elbowUp: {
        theta1Deg: toDeg(t1Up),
        theta2Deg: toDeg(t2Up),
      },
    },
  };
}

export interface RoboticArmParameters {
  readonly link1LengthM: number;
  readonly link2LengthM: number;
  readonly joint1AngleRad: number;
  readonly joint2AngleRad: number;
}

export const DEFAULT_ROBOTIC_ARM_PARAMS: RoboticArmParameters = {
  link1LengthM: 2.5,
  link2LengthM: 2.0,
  joint1AngleRad: (35 * Math.PI) / 180,
  joint2AngleRad: (45 * Math.PI) / 180,
};

export class RoboticArmEngine {
  static computeForwardKinematics(params: RoboticArmParameters) {
    const t1Deg = (params.joint1AngleRad * 180) / Math.PI;
    const t2Deg = (params.joint2AngleRad * 180) / Math.PI;
    const res = computeForwardKinematics([params.link1LengthM, params.link2LengthM], [t1Deg, t2Deg]);
    const j1 = res.joints[1] ?? { x: 0, y: 0 };
    const j2 = res.endEffector;
    const detJ = params.link1LengthM * params.link2LengthM * Math.sin(params.joint2AngleRad);
    return {
      joint1X: 0,
      joint1Y: 0,
      joint2X: j1.x,
      joint2Y: j1.y,
      endEffectorX: j2.x,
      endEffectorY: j2.y,
      jacobianDeterminant: parseFloat(detJ.toFixed(3)),
      isSingular: res.isSingular,
      manipulability: res.manipulability,
      raw: res,
    };
  }
}
