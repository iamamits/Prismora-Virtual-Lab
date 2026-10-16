/**
 * Prismora Mechanical Engineering: Strength of Materials — Torsion of Circular Shaft
 * Benchmark: IIT Bombay & IIT Roorkee Materials Testing Laboratory
 *
 * Torsion Formula:
 *   \frac{T}{J} = \frac{\tau}{r} = \frac{G \theta}{L}
 *
 * 1. Polar Moment of Inertia:
 *    Solid shaft: J = \frac{\pi d^4}{32}
 *    Hollow shaft: J = \frac{\pi (d_o^4 - d_i^4)}{32}
 *
 * 2. Maximum Shear Stress at surface r = d/2:
 *    \tau_{\max} = \frac{T \cdot r}{J} = \frac{16 T}{\pi d^3} (for solid)
 *
 * 3. Angle of Twist:
 *    \theta = \frac{T L}{G J} \text{ (radians)}
 *
 * 4. Torsional Stiffness:
 *    k_t = \frac{T}{\theta} = \frac{G J}{L} \text{ (N·m/rad)}
 */

export interface TorsionTestParameters {
  readonly shaftType: 'solid' | 'hollow';
  readonly outerDiameterMm: number; // mm (e.g. 20 mm - 50 mm)
  readonly innerDiameterMm?: number; // mm (for hollow, e.g. 15 mm)
  readonly shaftLengthMm: number;    // Length L in mm (e.g. 250 mm - 800 mm)
  readonly appliedTorqueNm: number;  // Torque T in N·m (e.g. 50 - 500 N·m)
  readonly shearModulusGpa: number;  // G in GPa (e.g. 79.3 GPa for steel, 26 GPa for Al)
  readonly yieldShearStressMpa: number; // \tau_y in MPa (e.g. 145 MPa for mild steel)
}

export interface TorsionTestResult {
  readonly polarMomentOfInertiaMm4: number;
  readonly maxShearStressMpa: number;
  readonly angleOfTwistRad: number;
  readonly angleOfTwistDeg: number;
  readonly torsionalStiffnessNmPerRad: number;
  readonly safetyFactor: number;
  readonly isYielded: boolean;
  readonly stressDistributionRadial: readonly { rMm: number; tauMpa: number }[];
  readonly torqueAngleCurve: readonly { angleDeg: number; torqueNm: number }[];
}

export const DEFAULT_TORSION_PARAMS: TorsionTestParameters = {
  shaftType: 'solid',
  outerDiameterMm: 25,
  innerDiameterMm: 0,
  shaftLengthMm: 500,
  appliedTorqueNm: 180,
  shearModulusGpa: 80, // Steel
  yieldShearStressMpa: 150,
};

export class TorsionTestEngine {
  static compute(params: TorsionTestParameters = DEFAULT_TORSION_PARAMS): TorsionTestResult {
    const doMm = params.outerDiameterMm;
    const diMm = params.shaftType === 'hollow' ? (params.innerDiameterMm ?? 15) : 0;
    const L = params.shaftLengthMm / 1000; // m
    const T = params.appliedTorqueNm; // N·m
    const G = params.shearModulusGpa * 1e9; // Pa
    const tauYieldMpa = params.yieldShearStressMpa;

    // Polar moment of inertia J in m^4 and mm^4
    const doM = doMm / 1000;
    const diM = diMm / 1000;
    const J_m4 = (Math.PI * (Math.pow(doM, 4) - Math.pow(diM, 4))) / 32;
    const J_mm4 = (Math.PI * (Math.pow(doMm, 4) - Math.pow(diMm, 4))) / 32;

    // Max shear stress at outer radius r_max = do / 2
    const rMax_m = doM / 2;
    const tauMaxPa = (T * rMax_m) / J_m4;
    const tauMaxMpa = tauMaxPa / 1e6;

    // Angle of twist
    const thetaRad = (T * L) / (G * J_m4);
    const thetaDeg = (thetaRad * 180) / Math.PI;

    // Torsional stiffness
    const kt = (G * J_m4) / L;

    // Safety factor
    const sf = tauMaxMpa > 1e-4 ? tauYieldMpa / tauMaxMpa : 999;
    const isYielded = tauMaxMpa >= tauYieldMpa;

    // Stress distribution across radius r = [0 or di/2 to do/2]
    const stressDistribution: Array<{ rMm: number; tauMpa: number }> = [];
    const rStart = diMm / 2;
    const rEnd = doMm / 2;
    const numPoints = 11;
    for (let i = 0; i < numPoints; i++) {
      const r = rStart + (i / (numPoints - 1)) * (rEnd - rStart);
      const tau = (r / rEnd) * tauMaxMpa;
      stressDistribution.push({
        rMm: parseFloat(r.toFixed(1)),
        tauMpa: parseFloat(tau.toFixed(2)),
      });
    }

    // Torque vs angle curve
    const torqueAngleCurve: Array<{ angleDeg: number; torqueNm: number }> = [];
    for (let step = 0; step <= 10; step++) {
      const tStep = (step / 10) * T * 1.5;
      const thRad = (tStep * L) / (G * J_m4);
      torqueAngleCurve.push({
        angleDeg: parseFloat(((thRad * 180) / Math.PI).toFixed(2)),
        torqueNm: parseFloat(tStep.toFixed(1)),
      });
    }

    return {
      polarMomentOfInertiaMm4: parseFloat(J_mm4.toFixed(1)),
      maxShearStressMpa: parseFloat(tauMaxMpa.toFixed(2)),
      angleOfTwistRad: parseFloat(thetaRad.toFixed(5)),
      angleOfTwistDeg: parseFloat(thetaDeg.toFixed(3)),
      torsionalStiffnessNmPerRad: parseFloat(kt.toFixed(1)),
      safetyFactor: parseFloat(Math.min(999, sf).toFixed(2)),
      isYielded,
      stressDistributionRadial: stressDistribution,
      torqueAngleCurve,
    };
  }
}

