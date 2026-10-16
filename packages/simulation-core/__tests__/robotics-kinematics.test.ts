import { describe, it, expect } from 'vitest';
import {
  computeDHMatrix,
  computeForwardKinematics,
  computeInverseKinematics,
} from '../src/robotics/arm-kinematics';

describe('Robotics & Mechanisms: Serial Arm Kinematics Engine', () => {
  it('should compute identity transformation for zero angles and zero lengths', () => {
    const T = computeDHMatrix({ thetaRad: 0, dMetres: 0, aMetres: 0, alphaRad: 0 });
    expect(T[0]![0]).toBe(1);
    expect(T[1]![1]).toBe(1);
    expect(T[2]![2]).toBe(1);
    expect(T[3]![3]).toBe(1);
    expect(T[0]![3]).toBe(0);
  });

  it('should calculate accurate forward kinematics for 2-link horizontal extension', () => {
    // Both joints at 0 degrees -> arm points horizontally along x-axis
    // Link lengths: l1 = 2.0m, l2 = 1.5m -> Total reach = 3.5m
    const res = computeForwardKinematics([2.0, 1.5], [0, 0]);

    expect(res.joints[0]!.x).toBe(0);
    expect(res.joints[0]!.y).toBe(0);

    expect(res.joints[1]!.x).toBeCloseTo(2.0, 3);
    expect(res.joints[1]!.y).toBeCloseTo(0, 3);

    expect(res.endEffector.x).toBeCloseTo(3.5, 3);
    expect(res.endEffector.y).toBeCloseTo(0, 3);

    // Singularity check: sin(theta2) = sin(0) = 0 -> fully extended boundary singularity
    expect(res.isSingular).toBe(true);
    expect(res.manipulability).toBe(0);
  });

  it('should calculate accurate forward kinematics for 90-degree elbow bend', () => {
    // theta1 = 0 deg, theta2 = 90 deg -> Joint 1 at (2, 0), End-effector at (2, 1.5)
    const res = computeForwardKinematics([2.0, 1.5], [0, 90]);

    expect(res.endEffector.x).toBeCloseTo(2.0, 3);
    expect(res.endEffector.y).toBeCloseTo(1.5, 3);

    // Manipulability = l1 * l2 * sin(90) = 2.0 * 1.5 * 1 = 3.0
    expect(res.manipulability).toBeCloseTo(3.0, 2);
    expect(res.isSingular).toBe(false);
  });

  it('should solve closed-form inverse kinematics and reproduce target location', () => {
    const l1 = 2.5;
    const l2 = 1.8;
    const targetX = 2.0;
    const targetY = 2.0;

    const ik = computeInverseKinematics(targetX, targetY, l1, l2);
    expect(ik.isReachable).toBe(true);

    // Verify elbow-down solution via forward kinematics
    const solDown = ik.solutions.elbowDown;
    const fkDown = computeForwardKinematics([l1, l2], [solDown.theta1Deg, solDown.theta2Deg]);

    expect(fkDown.endEffector.x).toBeCloseTo(targetX, 2);
    expect(fkDown.endEffector.y).toBeCloseTo(targetY, 2);

    // Verify elbow-up solution via forward kinematics
    const solUp = ik.solutions.elbowUp;
    const fkUp = computeForwardKinematics([l1, l2], [solUp.theta1Deg, solUp.theta2Deg]);

    expect(fkUp.endEffector.x).toBeCloseTo(targetX, 2);
    expect(fkUp.endEffector.y).toBeCloseTo(targetY, 2);
  });

  it('should clamp unreachable targets outside max reach workspace', () => {
    const l1 = 1.0;
    const l2 = 1.0;
    // Target distance = hypot(3, 4) = 5.0m, but max reach is 2.0m
    const ik = computeInverseKinematics(3.0, 4.0, l1, l2);

    expect(ik.isReachable).toBe(false);
    const clampedDist = Math.hypot(ik.clampedTarget.x, ik.clampedTarget.y);
    expect(clampedDist).toBeCloseTo(2.0, 1);
  });
});
