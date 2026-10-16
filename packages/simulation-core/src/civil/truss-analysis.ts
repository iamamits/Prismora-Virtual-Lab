/**
 * Prismora Civil & Structural Engineering: Planar Pin-Jointed Bridge Truss Mechanics
 * Method of Joints Static Equilibrium Solver
 *
 * Equilibrium Equations for each pin joint j:
 *   \sum F_x = 0
 *   \sum F_y = 0
 *
 * For a truss with m members, j joints, and r reaction components:
 *   Static Determinacy Criterion: m + r = 2j
 *
 * Sign Convention:
 *   Tensile Member Force: T > 0 (Member pulled, tension)
 *   Compressive Member Force: T < 0 (Member pushed, compression)
 */

export interface TrussJoint {
  readonly id: string;
  readonly x: number; // in metres
  readonly y: number; // in metres
  readonly supportType: 'pin' | 'roller_x' | 'free'; // 'pin' resists X & Y; 'roller_x' resists Y only
  readonly loadX?: number; // External horizontal force in kN
  readonly loadY?: number; // External vertical force in kN (positive upwards)
}

export interface TrussMember {
  readonly id: string;
  readonly jointA: string;
  readonly jointB: string;
  readonly crossSectionAreaMm2?: number; // default 2500 mm²
  readonly yieldStrengthMpa?: number; // default 250 MPa (mild steel)
}

export interface MemberAnalysisResult {
  readonly memberId: string;
  readonly jointA: string;
  readonly jointB: string;
  readonly lengthMetres: number;
  readonly forceKn: number; // Positive = Tension, Negative = Compression
  readonly isTension: boolean;
  readonly isZeroForce: boolean;
  readonly stressMpa: number;
  readonly safetyFactor: number;
}

export interface ReactionForce {
  readonly jointId: string;
  readonly rxKn: number;
  readonly ryKn: number;
}

export interface TrussAnalysisResult {
  readonly isDeterminate: boolean;
  readonly memberCount: number;
  readonly jointCount: number;
  readonly reactionCount: number;
  readonly members: readonly MemberAnalysisResult[];
  readonly reactions: readonly ReactionForce[];
  readonly maxTensionKn: number;
  readonly maxCompressionKn: number;
}

/**
 * Standard Warren Bridge Truss geometry generator
 * span = length in metres (e.g. 12m), height = height in metres (e.g. 3m), panels = 4
 */
export function createWarrenTruss(
  span: number = 12,
  height: number = 3,
  appliedLoadKn: number = 50,
  loadedJointIndex: number = 2 // bottom middle joint
): { joints: TrussJoint[]; members: TrussMember[] } {
  const panelWidth = span / 4;

  // Bottom chord joints: J0, J1, J2, J3, J4
  // Top chord joints: J5, J6, J7
  const joints: TrussJoint[] = [
    { id: 'J0', x: 0, y: 0, supportType: 'pin' },
    { id: 'J1', x: panelWidth, y: 0, supportType: 'free' },
    { id: 'J2', x: panelWidth * 2, y: 0, supportType: 'free' },
    { id: 'J3', x: panelWidth * 3, y: 0, supportType: 'free' },
    { id: 'J4', x: span, y: 0, supportType: 'roller_x' },
    // Top chord (offset by half panel for equilateral/isosceles web)
    { id: 'J5', x: panelWidth * 0.5, y: height, supportType: 'free' },
    { id: 'J6', x: panelWidth * 1.5, y: height, supportType: 'free' },
    { id: 'J7', x: panelWidth * 2.5, y: height, supportType: 'free' },
    { id: 'J8', x: panelWidth * 3.5, y: height, supportType: 'free' },
  ];

  // Apply vertical point load (downwards is negative in standard Cartesian)
  const targetJoint = joints[loadedJointIndex] || joints[2]!;
  joints[loadedJointIndex] = {
    ...targetJoint,
    loadY: -Math.abs(appliedLoadKn),
    loadX: 0,
  };

  const members: TrussMember[] = [
    // Bottom chord members
    { id: 'M0-1', jointA: 'J0', jointB: 'J1' },
    { id: 'M1-2', jointA: 'J1', jointB: 'J2' },
    { id: 'M2-3', jointA: 'J2', jointB: 'J3' },
    { id: 'M3-4', jointA: 'J3', jointB: 'J4' },
    // Top chord members
    { id: 'M5-6', jointA: 'J5', jointB: 'J6' },
    { id: 'M6-7', jointA: 'J6', jointB: 'J7' },
    { id: 'M7-8', jointA: 'J7', jointB: 'J8' },
    // Web diagonals
    { id: 'M0-5', jointA: 'J0', jointB: 'J5' },
    { id: 'M5-1', jointA: 'J5', jointB: 'J1' },
    { id: 'M1-6', jointA: 'J1', jointB: 'J6' },
    { id: 'M6-2', jointA: 'J6', jointB: 'J2' },
    { id: 'M2-7', jointA: 'J2', jointB: 'J7' },
    { id: 'M7-3', jointA: 'J7', jointB: 'J3' },
    { id: 'M3-8', jointA: 'J3', jointB: 'J8' },
    { id: 'M8-4', jointA: 'J8', jointB: 'J4' },
  ];

  return { joints, members };
}

/**
 * Solve planar truss equilibrium using the matrix method of joints
 */
export function solveTruss(joints: readonly TrussJoint[], members: readonly TrussMember[]): TrussAnalysisResult {
  const jCount = joints.length;
  const mCount = members.length;

  const jointMap = new Map<string, { index: number; joint: TrussJoint }>();
  joints.forEach((j, idx) => jointMap.set(j.id, { index: idx, joint: j }));

  // Determine reaction count
  let rCount = 0;
  const reactionVars: Array<{ jointId: string; type: 'rx' | 'ry'; col: number }> = [];

  joints.forEach((j) => {
    if (j.supportType === 'pin') {
      reactionVars.push({ jointId: j.id, type: 'rx', col: mCount + rCount++ });
      reactionVars.push({ jointId: j.id, type: 'ry', col: mCount + rCount++ });
    } else if (j.supportType === 'roller_x') {
      reactionVars.push({ jointId: j.id, type: 'ry', col: mCount + rCount++ });
    }
  });

  const isDeterminate = mCount + rCount === 2 * jCount;
  const totalUnknowns = mCount + rCount;
  const totalEquations = 2 * jCount;

  // Build linear system [A] [x] = [b]
  // Dimensions: (2*j) rows x (m + r) columns
  const A: number[][] = Array.from({ length: totalEquations }, () => new Array(totalUnknowns).fill(0));
  const b: number[] = new Array(totalEquations).fill(0);

  // Fill external loads in b: sum of internal member forces + reactions = -external loads
  joints.forEach((j, jIdx) => {
    const rowX = 2 * jIdx;
    const rowY = 2 * jIdx + 1;
    b[rowX] = -(j.loadX ?? 0);
    b[rowY] = -(j.loadY ?? 0);
  });

  // Fill member unit vectors in matrix A
  members.forEach((m, mIdx) => {
    const jA = jointMap.get(m.jointA)!.joint;
    const jB = jointMap.get(m.jointB)!.joint;
    const idxA = jointMap.get(m.jointA)!.index;
    const idxB = jointMap.get(m.jointB)!.index;

    const dx = jB.x - jA.x;
    const dy = jB.y - jA.y;
    const len = Math.hypot(dx, dy);

    const cosTheta = dx / len;
    const sinTheta = dy / len;

    // At joint A: force points towards joint B
    const rowAx = A[2 * idxA]!;
    const rowAy = A[2 * idxA + 1]!;
    rowAx[mIdx] = (rowAx[mIdx] ?? 0) + cosTheta;
    rowAy[mIdx] = (rowAy[mIdx] ?? 0) + sinTheta;

    // At joint B: force points towards joint A (opposite direction)
    const rowBx = A[2 * idxB]!;
    const rowBy = A[2 * idxB + 1]!;
    rowBx[mIdx] = (rowBx[mIdx] ?? 0) - cosTheta;
    rowBy[mIdx] = (rowBy[mIdx] ?? 0) - sinTheta;
  });

  // Fill reactions in matrix A
  reactionVars.forEach((r) => {
    const jEntry = jointMap.get(r.jointId)!;
    const jIdx = jEntry.index;
    if (r.type === 'rx') {
      const rowX = A[2 * jIdx]!;
      rowX[r.col] = 1;
    } else if (r.type === 'ry') {
      const rowY = A[2 * jIdx + 1]!;
      rowY[r.col] = 1;
    }
  });

  // Solve square or pseudo-square linear system using Gaussian Elimination with partial pivoting
  const sol = solveLinearSystem(A, b, totalUnknowns);

  // Parse Member results
  const memberResults: MemberAnalysisResult[] = members.map((m, mIdx) => {
    const jA = jointMap.get(m.jointA)!.joint;
    const jB = jointMap.get(m.jointB)!.joint;
    const len = Math.hypot(jB.x - jA.x, jB.y - jA.y);
    const force = sol[mIdx] ?? 0;
    const isZero = Math.abs(force) < 1e-4;
    const isTension = force > 1e-4;

    const area = m.crossSectionAreaMm2 ?? 2500;
    const yieldMpa = m.yieldStrengthMpa ?? 250;
    // Stress in MPa = (kN * 1000 N) / (area mm²)
    const stress = (Math.abs(force) * 1000) / area;
    const safetyFactor = stress > 1e-3 ? yieldMpa / stress : 999;

    return {
      memberId: m.id,
      jointA: m.jointA,
      jointB: m.jointB,
      lengthMetres: parseFloat(len.toFixed(3)),
      forceKn: parseFloat(force.toFixed(2)),
      isTension,
      isZeroForce: isZero,
      stressMpa: parseFloat(stress.toFixed(2)),
      safetyFactor: parseFloat(Math.min(999, safetyFactor).toFixed(2)),
    };
  });

  // Parse Reactions
  const reactionsMap = new Map<string, { rx: number; ry: number }>();
  reactionVars.forEach((r) => {
    const val = sol[r.col] ?? 0;
    const existing = reactionsMap.get(r.jointId) || { rx: 0, ry: 0 };
    if (r.type === 'rx') existing.rx = val;
    if (r.type === 'ry') existing.ry = val;
    reactionsMap.set(r.jointId, existing);
  });

  const reactions: ReactionForce[] = Array.from(reactionsMap.entries()).map(([jointId, r]) => ({
    jointId,
    rxKn: parseFloat(r.rx.toFixed(2)),
    ryKn: parseFloat(r.ry.toFixed(2)),
  }));

  const forces = memberResults.map((m) => m.forceKn);
  const maxTensionKn = Math.max(0, ...forces);
  const maxCompressionKn = Math.abs(Math.min(0, ...forces));

  return {
    isDeterminate,
    memberCount: mCount,
    jointCount: jCount,
    reactionCount: rCount,
    members: memberResults,
    reactions,
    maxTensionKn,
    maxCompressionKn,
  };
}

/**
 * Standard Gaussian elimination with partial pivoting for N equations, N unknowns
 */
function solveLinearSystem(A_orig: number[][], b_orig: number[], n: number): number[] {
  const m = A_orig.length;
  // Make a working copy of rows
  const mat: number[][] = A_orig.map((row) => [...row]);
  const rhs: number[] = [...b_orig];

  const minDim = Math.min(m, n);

  for (let k = 0; k < minDim; k++) {
    // Find pivot
    let maxRow = k;
    let maxVal = Math.abs(mat[k]![k] ?? 0);
    for (let i = k + 1; i < m; i++) {
      const val = Math.abs(mat[i]![k] ?? 0);
      if (val > maxVal) {
        maxVal = val;
        maxRow = i;
      }
    }

    if (maxVal < 1e-12) continue; // Singular column or redundant equation

    // Swap rows
    if (maxRow !== k) {
      const tempRow = mat[k]!;
      mat[k] = mat[maxRow]!;
      mat[maxRow] = tempRow;

      const tempB = rhs[k]!;
      rhs[k] = rhs[maxRow]!;
      rhs[maxRow] = tempB;
    }

    // Eliminate below
    for (let i = k + 1; i < m; i++) {
      const rowI = mat[i]!;
      const rowK = mat[k]!;
      const factor = (rowI[k] ?? 0) / (rowK[k] ?? 1);
      rowI[k] = 0;
      for (let j = k + 1; j < n; j++) {
        rowI[j] = (rowI[j] ?? 0) - factor * (rowK[j] ?? 0);
      }
      rhs[i] = (rhs[i] ?? 0) - factor * (rhs[k] ?? 0);
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = minDim - 1; i >= 0; i--) {
    let sum = rhs[i]!;
    for (let j = i + 1; j < n; j++) {
      sum -= mat[i]![j]! * x[j]!;
    }
    const diag = mat[i]![i]!;
    if (Math.abs(diag) > 1e-12) {
      x[i] = sum / diag;
    } else {
      x[i] = 0;
    }
  }

  return x;
}
