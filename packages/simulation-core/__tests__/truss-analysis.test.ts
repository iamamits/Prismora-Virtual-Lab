import { describe, it, expect } from 'vitest';
import { solveTruss, createWarrenTruss, type TrussJoint, type TrussMember } from '../src/civil/truss-analysis';

describe('Civil Engineering: Planar Pin-Jointed Bridge Truss Mechanics', () => {
  it('should evaluate static determinacy condition m + r = 2j', () => {
    const { joints, members } = createWarrenTruss(12, 3, 50, 2);
    const result = solveTruss(joints, members);

    // j = 9 joints -> 2j = 18
    // m = 15 members, r = 3 (pin:2, roller:1) -> m + r = 18
    expect(result.jointCount).toBe(9);
    expect(result.memberCount).toBe(15);
    expect(result.reactionCount).toBe(3);
    expect(result.isDeterminate).toBe(true);
  });

  it('should compute symmetric vertical reactions for midspan vertical load', () => {
    // 60 kN applied at midpoint joint J2
    const { joints, members } = createWarrenTruss(12, 3, 60, 2);
    const result = solveTruss(joints, members);

    const rA = result.reactions.find((r) => r.jointId === 'J0');
    const rB = result.reactions.find((r) => r.jointId === 'J4');

    expect(rA).toBeDefined();
    expect(rB).toBeDefined();

    // Symmetry: each support carries 30 kN
    expect(rA!.ryKn).toBeCloseTo(30, 1);
    expect(rB!.ryKn).toBeCloseTo(30, 1);
    // No horizontal load applied, so Rx = 0
    expect(rA!.rxKn).toBeCloseTo(0, 1);
  });

  it('should calculate bottom chords in tension and top chords in compression under gravity loading', () => {
    const { joints, members } = createWarrenTruss(12, 3, 80, 2);
    const result = solveTruss(joints, members);

    // Bottom central chord (M1-2 or M2-3) should be in positive tension
    const bottomChord = result.members.find((m) => m.memberId === 'M1-2');
    expect(bottomChord).toBeDefined();
    expect(bottomChord!.forceKn).toBeGreaterThan(0);
    expect(bottomChord!.isTension).toBe(true);

    // Top central chord (M6-7) should be in negative compression
    const topChord = result.members.find((m) => m.memberId === 'M6-7');
    expect(topChord).toBeDefined();
    expect(topChord!.forceKn).toBeLessThan(0);
    expect(topChord!.isTension).toBe(false);
  });

  it('should compute reasonable stress and safety factors under allowable yield limit', () => {
    const { joints, members } = createWarrenTruss(12, 3, 40, 2);
    const result = solveTruss(joints, members);

    result.members.forEach((m) => {
      expect(m.stressMpa).toBeGreaterThanOrEqual(0);
      expect(m.safetyFactor).toBeGreaterThan(1.0); // Safe under 40 kN load with 2500 mm² steel
    });
  });

  it('should correctly solve an elementary 3-bar equilateral truss', () => {
    // Simple 3-joint, 3-member triangle
    // J0 at (0,0) pin, J1 at (4,0) roller, J2 at (2, 2*sqrt(3)) free
    const joints: TrussJoint[] = [
      { id: 'A', x: 0, y: 0, supportType: 'pin' },
      { id: 'B', x: 4, y: 0, supportType: 'roller_x' },
      { id: 'C', x: 2, y: 2 * Math.sqrt(3), supportType: 'free', loadY: -100 },
    ];
    const members: TrussMember[] = [
      { id: 'AB', jointA: 'A', jointB: 'B' },
      { id: 'AC', jointA: 'A', jointB: 'C' },
      { id: 'BC', jointA: 'B', jointB: 'C' },
    ];

    const res = solveTruss(joints, members);
    expect(res.isDeterminate).toBe(true);

    // Reactions: Ay = 50 kN, By = 50 kN
    const rA = res.reactions.find((r) => r.jointId === 'A');
    const rB = res.reactions.find((r) => r.jointId === 'B');
    expect(rA!.ryKn).toBeCloseTo(50, 1);
    expect(rB!.ryKn).toBeCloseTo(50, 1);

    // Members AC and BC should be in compression (-57.74 kN)
    const mAC = res.members.find((m) => m.memberId === 'AC');
    expect(mAC!.forceKn).toBeCloseTo(-57.74, 1);

    // Bottom tie AB should be in tension (+28.87 kN)
    const mAB = res.members.find((m) => m.memberId === 'AB');
    expect(mAB!.forceKn).toBeCloseTo(28.87, 1);
  });
});
