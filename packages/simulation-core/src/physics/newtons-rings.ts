/**
 * Prismora Physical Sciences: Optics — Newton's Rings Interference Experiment
 * Benchmark: IIT Bombay & Amrita Virtual Labs Advanced Optics Lab
 *
 * Governing Equations:
 * In a thin wedge air film enclosed between a convex lens (radius of curvature R)
 * and an optically flat glass plate:
 *
 * Path Difference:
 *   \Delta = 2 \mu t \cos r + \frac{\lambda}{2}
 *   For normal incidence (\cos r = 1) in air (\mu = 1):
 *   \Delta = 2t + \frac{\lambda}{2}
 *
 * Dark Ring Diameters:
 *   Condition for destructive interference (dark fringe): 2t = n \lambda
 *   From geometry of sphere: t = \frac{r_n^2}{2R} = \frac{D_n^2}{8R}
 *   \implies D_n^2 = 4 n \lambda R
 *   D_n = 2 \sqrt{n \lambda R}
 *
 * Determination of Wavelength \lambda:
 *   Slope S of D_{n+p}^2 - D_n^2 vs p:
 *   D_{n+p}^2 - D_n^2 = 4 p \lambda R
 *   \lambda = \frac{D_{n+p}^2 - D_n^2}{4 p R}
 *
 * If a liquid of refractive index \mu is introduced into the air wedge:
 *   (D_n^2)_{liquid} = \frac{4 n \lambda R}{\mu} \implies \mu = \frac{(D_n^2)_{air}}{(D_n^2)_{liquid}}
 */

export interface NewtonsRingsParameters {
  readonly wavelengthNm: number;          // \lambda in nm (e.g. 589.3 nm for Sodium D-line)
  readonly lensRadiusOfCurvatureM: number;// R in metres (e.g. 0.8 m - 1.5 m)
  readonly mediumRefractiveIndex: number; // \mu (1.0 for Air, 1.33 for Water, 1.47 for Glycerin)
  readonly maxRingsToDisplay?: number;    // e.g. 10 rings
}

export interface RingDiameterData {
  readonly ringNumberN: number;
  readonly diameterMm: number;
  readonly diameterSquaredMm2: number;
}

export interface NewtonsRingsResult {
  readonly wavelengthNm: number;
  readonly lensRadiusOfCurvatureM: number;
  readonly mediumRefractiveIndex: number;
  readonly calculatedWavelengthNm: number;
  readonly ringDiameters: readonly RingDiameterData[];
  readonly fringeSpacingMm: number;
  readonly radialIntensityProfile: readonly { radiusMm: number; intensityNorm: number }[];
}

export const DEFAULT_NEWTONS_RINGS_PARAMS: NewtonsRingsParameters = {
  wavelengthNm: 589.3, // Sodium yellow light
  lensRadiusOfCurvatureM: 1.0,
  mediumRefractiveIndex: 1.0, // Air
  maxRingsToDisplay: 8,
};

export class NewtonsRingsEngine {
  static compute(params: NewtonsRingsParameters = DEFAULT_NEWTONS_RINGS_PARAMS): NewtonsRingsResult {
    const lambdaM = params.wavelengthNm * 1e-9;
    const R = params.lensRadiusOfCurvatureM;
    const mu = Math.max(1.0, params.mediumRefractiveIndex);
    const maxN = params.maxRingsToDisplay ?? 8;

    const ringDiameters: RingDiameterData[] = [];

    for (let n = 1; n <= maxN; n++) {
      // D_n^2 = 4 * n * lambda * R / mu
      const d2_m2 = (4 * n * lambdaM * R) / mu;
      const d_m = Math.sqrt(d2_m2);
      const d_mm = d_m * 1000;
      const d2_mm2 = d2_m2 * 1e6;

      ringDiameters.push({
        ringNumberN: n,
        diameterMm: parseFloat(d_mm.toFixed(3)),
        diameterSquaredMm2: parseFloat(d2_mm2.toFixed(3)),
      });
    }

    // Determine wavelength from slope of D_{n+4}^2 - D_n^2
    const p = 4;
    const r1 = ringDiameters[0]!;
    const r5 = ringDiameters[Math.min(ringDiameters.length - 1, p)]!;
    const deltaD2_m2 = (r5.diameterSquaredMm2 - r1.diameterSquaredMm2) * 1e-6;
    const calcLambdaM = (deltaD2_m2 * mu) / (4 * (r5.ringNumberN - r1.ringNumberN) * R);
    const calcLambdaNm = calcLambdaM * 1e9;

    // Fringe spacing between adjacent outer rings
    const fringeSpacing = (ringDiameters[ringDiameters.length - 1]!.diameterMm - ringDiameters[ringDiameters.length - 2]!.diameterMm) / 2;

    // Radial interference intensity pattern I(r) = I_0 \sin^2(2 \pi \mu t / \lambda)
    const profile: Array<{ radiusMm: number; intensityNorm: number }> = [];
    const maxRadiusMm = (ringDiameters[ringDiameters.length - 1]!.diameterMm / 2) * 1.15;
    for (let i = 0; i <= 60; i++) {
      const r_mm = (i / 60) * maxRadiusMm;
      const r_m = r_mm / 1000;
      const t = (r_m * r_m) / (2 * R);
      // Phase difference delta = (4 * pi * mu * t) / lambda + pi
      const delta = (4 * Math.PI * mu * t) / lambdaM + Math.PI;
      const intensity = 0.5 * (1 + Math.cos(delta));
      profile.push({
        radiusMm: parseFloat(r_mm.toFixed(3)),
        intensityNorm: parseFloat(intensity.toFixed(3)),
      });
    }

    return {
      wavelengthNm: params.wavelengthNm,
      lensRadiusOfCurvatureM: R,
      mediumRefractiveIndex: mu,
      calculatedWavelengthNm: parseFloat(calcLambdaNm.toFixed(1)),
      ringDiameters,
      fringeSpacingMm: parseFloat(fringeSpacing.toFixed(3)),
      radialIntensityProfile: profile,
    };
  }
}
