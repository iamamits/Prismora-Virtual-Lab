/**
 * Beam Bending, Shear Force & Bending Moment (SFD / BMD) Model
 * Benchmark: IIT Delhi & NITK Surathkal Structural Analysis Virtual Labs
 *
 * Simulates simply supported and cantilever beams with concentrated point loads
 * and uniformly distributed loads (UDL).
 *
 * Governing Equations:
 * 1. Equilibrium: sum(Fy) = 0, sum(M) = 0
 * 2. Shear Force: V(x) = dM/dx
 * 3. Bending Moment: M(x) = integral(V(x) dx)
 * 4. Flexure Formula: sigma = (M * y) / I
 * 5. Maximum Deflection: delta_max (Macaulay's method / double integration)
 */

export type BeamSupportType = 'simply_supported' | 'cantilever';

export interface BeamBendingParameters {
  readonly supportType: BeamSupportType;
  /** Beam span length L in metres (e.g. 2 - 10 m) */
  readonly spanLengthM: number;
  readonly lengthM: number;
  /** Concentrated point load P in kN */
  readonly pointLoadKn: number;
  /** Point load location a in metres from left support */
  readonly pointLoadPositionM: number;
  readonly pointLoads: Array<{ positionM: number; magnitudeKn: number }>;
  /** Uniformly distributed load (UDL) w in kN/m */
  readonly udlKnPerM: number;
  readonly distributedLoads: Array<{ startM: number; endM: number; intensityKnPerM: number }>;
  /** Beam cross-section: width b in mm, height h in mm */
  readonly widthMm: number;
  readonly heightMm: number;
  /** Material Young's Modulus E in GPa (e.g. 200 for structural steel) */
  readonly youngsModulusGpa: number;
}

export interface BeamAnalysisPoint {
  readonly positionM: number;
  readonly x: number;
  readonly shearForceKn: number;
  readonly bendingMomentKnm: number;
  readonly deflectionMm: number;
  readonly normalStressMpa: number;
}

export interface BeamAnalysisResult {
  readonly leftReactionKn: number;
  readonly rightReactionKn: number;
  readonly maxShearForceKn: number;
  readonly maxBendingMomentKnm: number;
  readonly maxDeflectionMm: number;
  readonly maxNormalStressMpa: number;
  readonly maxBendingStressMpa: number;
  readonly momentOfInertiaMm4: number;
  readonly sectionModulusMm3: number;
  readonly points: readonly BeamAnalysisPoint[];
  readonly shearForceDiagram: readonly { positionM: number; x: number; shearForceKn: number }[];
  readonly bendingMomentDiagram: readonly { positionM: number; x: number; bendingMomentKnm: number }[];
}

export const DEFAULT_BEAM_PARAMS: BeamBendingParameters = {
  supportType: 'simply_supported',
  spanLengthM: 6.0,
  lengthM: 6.0,
  pointLoadKn: 25.0,
  pointLoadPositionM: 2.5,
  pointLoads: [{ positionM: 2.5, magnitudeKn: 25.0 }],
  udlKnPerM: 8.0,
  distributedLoads: [{ startM: 0, endM: 6.0, intensityKnPerM: 8.0 }],
  widthMm: 150,
  heightMm: 300,
  youngsModulusGpa: 200,
};

export class BeamBendingEngine {
  static compute(params: BeamBendingParameters): BeamAnalysisResult {
    const L = params.lengthM ?? params.spanLengthM;
    const pointLoad = params.pointLoads && params.pointLoads.length > 0 ? params.pointLoads[0]! : undefined;
    const P = pointLoad !== undefined ? pointLoad.magnitudeKn : params.pointLoadKn;
    const a = pointLoad !== undefined ? Math.min(L, Math.max(0, pointLoad.positionM)) : Math.min(L, Math.max(0, params.pointLoadPositionM));
    const b = L - a;
    const distLoad = params.distributedLoads && params.distributedLoads.length > 0 ? params.distributedLoads[0]! : undefined;
    const w = distLoad !== undefined ? distLoad.intensityKnPerM : params.udlKnPerM;

    // Cross-section geometry
    const width = params.widthMm;
    const height = params.heightMm;
    const I_mm4 = (width * Math.pow(height, 3)) / 12; // mm^4
    const Z_mm3 = (width * Math.pow(height, 2)) / 6; // mm^3
    const I_m4 = I_mm4 * 1e-12; // m^4
    const E_pa = params.youngsModulusGpa * 1e9; // Pa

    let R1 = 0;
    let R2 = 0;

    if (params.supportType === 'simply_supported') {
      // Reactions from statics:
      // sum(M_at_right) = 0: R1 * L - P * b - w * L * (L/2) = 0
      R1 = (P * b + (w * L * L) / 2) / L;
      R2 = P + w * L - R1;
    } else {
      // Cantilever beam (fixed at left, x=0)
      R1 = P + w * L; // Vertical reaction at clamp
      R2 = 0;
    }

    const numPoints = 80;
    const points: BeamAnalysisPoint[] = [];

    let maxShear = 0;
    let maxMoment = 0;
    let maxDeflection = 0;

    for (let i = 0; i <= numPoints; i++) {
      const x = (i / numPoints) * L;
      let V = 0; // Shear force in kN
      let M = 0; // Bending moment in kNm
      let delta = 0; // Deflection in mm

      if (params.supportType === 'simply_supported') {
        // V(x) = R1 - w*x - (x > a ? P : 0)
        V = R1 - w * x - (x > a ? P : 0);

        // M(x) = R1*x - (w*x^2)/2 - (x > a ? P*(x - a) : 0)
        M = R1 * x - (w * x * x) / 2 - (x > a ? P * (x - a) : 0);

        // Deflection delta(x) using superposition:
        // Due to UDL: w*x / (24*E*I) * (L^3 - 2*L*x^2 + x^3)
        const deltaUdl_m = ((w * 1000 * x) / (24 * E_pa * I_m4)) * (Math.pow(L, 3) - 2 * L * x * x + Math.pow(x, 3));

        // Due to point load (x <= a vs x > a):
        let deltaPoint_m = 0;
        if (x <= a) {
          deltaPoint_m = ((P * 1000 * b * x) / (6 * E_pa * I_m4 * L)) * (L * L - b * b - x * x);
        } else {
          deltaPoint_m = ((P * 1000 * a * (L - x)) / (6 * E_pa * I_m4 * L)) * (2 * L * x - x * x - a * a);
        }
        delta = (deltaUdl_m + deltaPoint_m) * 1000; // to mm
      } else {
        // Cantilever beam fixed at x=0, free at x=L
        // Shear from free end:
        const xFromEnd = L - x;
        V = w * xFromEnd + (x <= a ? P : 0);

        // Moment (hogging, negative):
        M = -((w * xFromEnd * xFromEnd) / 2) - (x <= a ? P * (a - x) : 0);

        // Deflection at distance x from fixed support:
        const deltaUdl_m = ((w * 1000 * x * x) / (24 * E_pa * I_m4)) * (x * x - 4 * L * x + 6 * L * L);
        let deltaPoint_m = 0;
        if (x <= a) {
          deltaPoint_m = ((P * 1000 * x * x) / (6 * E_pa * I_m4)) * (3 * a - x);
        } else {
          deltaPoint_m = ((P * 1000 * a * a) / (6 * E_pa * I_m4)) * (3 * x - a);
        }
        delta = (deltaUdl_m + deltaPoint_m) * 1000;
      }

      // Max flexural stress at outer fibre: sigma = M / Z (MPa)
      // M is in kNm = 1e6 N*mm, Z is in mm^3 -> sigma in MPa
      const stress = (Math.abs(M) * 1e6) / Z_mm3;

      maxShear = Math.max(maxShear, Math.abs(V));
      maxMoment = Math.max(maxMoment, Math.abs(M));
      maxDeflection = Math.max(maxDeflection, Math.abs(delta));

      points.push({
        positionM: Number(x.toFixed(2)),
        x: Number(x.toFixed(2)),
        shearForceKn: Number(V.toFixed(2)),
        bendingMomentKnm: Number(M.toFixed(2)),
        deflectionMm: Number(delta.toFixed(3)),
        normalStressMpa: Number(stress.toFixed(1)),
      });
    }

    const maxStress = (maxMoment * 1e6) / Z_mm3;

    const shearForceDiagram = points.map((p) => ({
      positionM: p.positionM,
      x: p.positionM,
      shearForceKn: p.shearForceKn,
    }));
    const bendingMomentDiagram = points.map((p) => ({
      positionM: p.positionM,
      x: p.positionM,
      bendingMomentKnm: p.bendingMomentKnm,
    }));

    return {
      leftReactionKn: Number(R1.toFixed(2)),
      rightReactionKn: Number(R2.toFixed(2)),
      maxShearForceKn: Number(maxShear.toFixed(2)),
      maxBendingMomentKnm: Number(maxMoment.toFixed(2)),
      maxDeflectionMm: Number(maxDeflection.toFixed(2)),
      maxNormalStressMpa: Number(maxStress.toFixed(1)),
      maxBendingStressMpa: Number(maxStress.toFixed(1)),
      momentOfInertiaMm4: Math.round(I_mm4),
      sectionModulusMm3: Math.round(Z_mm3),
      points,
      shearForceDiagram,
      bendingMomentDiagram,
    };
  }
}
