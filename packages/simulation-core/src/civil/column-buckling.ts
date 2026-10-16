/**
 * Prismora Civil & Structural Engineering: Column Buckling & Euler's Critical Load
 * Benchmark: IIT Delhi & IIT Roorkee Structural Mechanics Virtual Lab
 *
 * Euler's Formula:
 *   P_{cr} = \frac{\pi^2 E I}{L_e^2}
 *
 * Effective Length Factors (K):
 *   - Both ends pinned (hinged-hinged): K = 1.0, L_e = L
 *   - Fixed-Free (cantilever column):   K = 2.0, L_e = 2L
 *   - Fixed-Pinned:                     K = 0.7, L_e = 0.7L
 *   - Both ends fixed:                  K = 0.5, L_e = 0.5L
 *
 * Slenderness Ratio:
 *   \lambda = \frac{L_e}{r}, \quad r = \sqrt{\frac{I}{A}} \text{ (Radius of Gyration)}
 *
 * Critical Buckling Stress:
 *   \sigma_{cr} = \frac{P_{cr}}{A} = \frac{\pi^2 E}{\lambda^2}
 *
 * Euler's Hyperbola vs Johnson's Parabolic Limit:
 *   Valid only when \sigma_{cr} \le \sigma_y (Yield strength limit)
 */

export type ColumnEndCondition = 'pinned_pinned' | 'fixed_free' | 'fixed_pinned' | 'fixed_fixed';

export interface ColumnBucklingParameters {
  readonly lengthMetres: number;        // Column length L (e.g. 1.0 m - 6.0 m)
  readonly columnLengthM: number;
  readonly sectionShape: 'rectangular' | 'circular';
  readonly widthOrDiameterMm: number;   // Cross section width b or diameter d in mm (e.g. 40 mm)
  readonly crossSectionDimension1Mm: number;
  readonly crossSectionDimension2Mm: number;
  readonly heightMm?: number;           // Height h for rectangular section in mm (e.g. 20 mm)
  readonly endCondition: ColumnEndCondition;
  readonly elasticModulusGpa: number;   // E in GPa (e.g. 200 GPa for steel, 70 GPa for Al)
  readonly yieldStrengthMpa: number;    // \sigma_y in MPa (e.g. 250 MPa)
}

export interface ColumnBucklingResult {
  readonly effectiveLengthFactorK: number;
  readonly effectiveLengthM: number;
  readonly crossSectionAreaMm2: number;
  readonly momentOfInertiaMm4: number;
  readonly radiusOfGyrationMm: number;
  readonly slendernessRatio: number;
  readonly criticalBucklingLoadKn: number;
  readonly criticalLoadKn: number;
  readonly rankineLoadKn: number;
  readonly criticalStressMpa: number;
  readonly failureMode: string;
  readonly isEulerValid: boolean; // false if sigma_cr > sigma_yield (inelastic buckling applies)
  readonly bucklingModeShape: readonly { xNorm: number; deflectionNorm: number }[];
  readonly buckledShapePoints: readonly { yNormalized: number; normalizedDeflection: number; xNorm: number; deflectionNorm: number }[];
  readonly slendernessCurve: readonly { lambda: number; sigmaCrMpa: number }[];
}

const K_FACTORS: Record<ColumnEndCondition, number> = {
  pinned_pinned: 1.0,
  fixed_free: 2.0,
  fixed_pinned: 0.7,
  fixed_fixed: 0.5,
};

export const DEFAULT_COLUMN_BUCKLING_PARAMS: ColumnBucklingParameters = {
  lengthMetres: 2.5,
  columnLengthM: 2.5,
  sectionShape: 'rectangular',
  widthOrDiameterMm: 50,
  crossSectionDimension1Mm: 50,
  crossSectionDimension2Mm: 25,
  heightMm: 25,
  endCondition: 'pinned_pinned',
  elasticModulusGpa: 200, // Steel
  yieldStrengthMpa: 250,
};

export class ColumnBucklingEngine {
  static compute(params: ColumnBucklingParameters = DEFAULT_COLUMN_BUCKLING_PARAMS): ColumnBucklingResult {
    const L = params.columnLengthM ?? params.lengthMetres;
    const K = K_FACTORS[params.endCondition] ?? 1.0;
    const Le = K * L;
    const E = params.elasticModulusGpa * 1e9; // Pa
    const sigmaY = params.yieldStrengthMpa;
    const wOrD = params.crossSectionDimension1Mm ?? params.widthOrDiameterMm;

    // Cross section properties (weak axis buckling)
    let A_mm2: number;
    let I_mm4: number;

    if (params.sectionShape === 'circular') {
      const d = wOrD;
      A_mm2 = (Math.PI * d * d) / 4;
      I_mm4 = (Math.PI * Math.pow(d, 4)) / 64;
    } else {
      const b = wOrD;
      const h = params.crossSectionDimension2Mm ?? params.heightMm ?? b;
      A_mm2 = b * h;
      // Weak axis moment of inertia: min(b*h^3/12, h*b^3/12)
      I_mm4 = Math.min((b * Math.pow(h, 3)) / 12, (h * Math.pow(b, 3)) / 12);
    }

    const I_m4 = I_mm4 * 1e-12;
    const A_m2 = A_mm2 * 1e-6;

    // Radius of gyration r = sqrt(I / A)
    const r_m = Math.sqrt(I_m4 / A_m2);
    const r_mm = r_m * 1000;

    // Slenderness ratio lambda = Le / r
    const lambda = Le / r_m;

    // Euler critical load P_cr = pi^2 * E * I / Le^2
    const Pcr_N = (Math.PI * Math.PI * E * I_m4) / (Le * Le);
    const Pcr_Kn = Pcr_N / 1000;

    // Critical stress sigma_cr = P_cr / A
    const sigmaCrMpa = Pcr_N / A_m2 / 1e6;
    const isEulerValid = sigmaCrMpa <= sigmaY;

    // Rankine formula: 1 / PR = 1 / Pc + 1 / PE where Pc = sigmaY * A
    const Pc_N = sigmaY * 1e6 * A_m2;
    const Rankine_Kn = (Pc_N * Pcr_N) / (Pc_N + Pcr_N) / 1000;
    const failureMode = isEulerValid ? 'Elastic Buckling' : 'Inelastic / Crushing';

    // Buckling mode shape along normalized length x/L in [0, 1]
    const modeShape: Array<{ xNorm: number; deflectionNorm: number }> = [];
    for (let i = 0; i <= 20; i++) {
      const xNorm = i / 20;
      let yNorm = 0;
      if (params.endCondition === 'pinned_pinned') {
        yNorm = Math.sin(Math.PI * xNorm);
      } else if (params.endCondition === 'fixed_free') {
        yNorm = 1 - Math.cos((Math.PI / 2) * xNorm);
      } else if (params.endCondition === 'fixed_fixed') {
        yNorm = 0.5 * (1 - Math.cos(2 * Math.PI * xNorm));
      } else {
        // fixed_pinned
        yNorm = Math.sin(4.4934 * xNorm) - 4.4934 * (1 - xNorm);
        yNorm = Math.sin(Math.PI * Math.pow(xNorm, 1.2)); // smooth visual approx
      }
      modeShape.push({
        xNorm: parseFloat(xNorm.toFixed(2)),
        deflectionNorm: parseFloat(yNorm.toFixed(3)),
      });
    }

    const buckledShapePoints = modeShape.map((m) => ({
      yNormalized: m.xNorm,
      normalizedDeflection: m.deflectionNorm,
      xNorm: m.xNorm,
      deflectionNorm: m.deflectionNorm,
    }));

    // Slenderness curve (Euler hyperbola)
    const slendernessCurve: Array<{ lambda: number; sigmaCrMpa: number }> = [];
    for (let lam = 30; lam <= 200; lam += 10) {
      const sig = (Math.PI * Math.PI * E) / (lam * lam) / 1e6;
      slendernessCurve.push({
        lambda: lam,
        sigmaCrMpa: parseFloat(Math.min(sigmaY * 1.5, sig).toFixed(1)),
      });
    }

    return {
      effectiveLengthFactorK: K,
      effectiveLengthM: parseFloat(Le.toFixed(2)),
      crossSectionAreaMm2: parseFloat(A_mm2.toFixed(1)),
      momentOfInertiaMm4: parseFloat(I_mm4.toFixed(1)),
      radiusOfGyrationMm: parseFloat(r_mm.toFixed(2)),
      slendernessRatio: parseFloat(lambda.toFixed(1)),
      criticalBucklingLoadKn: parseFloat(Pcr_Kn.toFixed(2)),
      criticalLoadKn: parseFloat(Pcr_Kn.toFixed(2)),
      rankineLoadKn: parseFloat(Rankine_Kn.toFixed(1)),
      criticalStressMpa: parseFloat(sigmaCrMpa.toFixed(1)),
      failureMode,
      isEulerValid,
      bucklingModeShape: modeShape,
      buckledShapePoints,
      slendernessCurve,
    };
  }
}
