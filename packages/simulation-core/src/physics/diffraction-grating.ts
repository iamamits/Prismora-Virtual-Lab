/**
 * Prismora Physical Sciences: Wave Optics — Diffraction Grating Spectrometer
 * Benchmark: IIT Delhi & Amrita Virtual Labs Optics Spectrometer
 *
 * Grating Equation (Normal Incidence):
 *   (a + b) \sin\theta = m \lambda \implies d \sin\theta = m \lambda
 *   where:
 *   d = (a + b) = Grating element (ruling pitch in metres)
 *   N = Lines per inch or lines per cm (e.g. 15,000 lines/inch \implies d \approx 1.693 \mu\text{m})
 *   m = Principal spectral order (m = 0, \pm 1, \pm 2)
 *   \theta = Angle of diffraction
 *
 * Angular Dispersion:
 *   \frac{d\theta}{d\lambda} = \frac{m}{d \cos\theta}
 *
 * Resolving Power:
 *   \frac{\lambda}{\Delta\lambda} = m \cdot N_{total}
 *   Sodium D-line doublet separation (\lambda_1 = 589.0 nm, \lambda_2 = 589.6 nm, \Delta\lambda = 0.6 nm)
 */

export interface SpectralLineInput {
  readonly label: string;
  readonly wavelengthNm: number;
  readonly hexColor: string;
}

export interface DiffractionGratingParameters {
  readonly linesPerMm: number;            // Lines/mm (e.g. 300, 600, or 1000 lines/mm)
  readonly spectralOrderM: number;        // Order m (1 or 2)
  readonly activeLines: readonly SpectralLineInput[];
}

export interface DiffractedLineResult {
  readonly label: string;
  readonly wavelengthNm: number;
  readonly hexColor: string;
  readonly diffractionAngleDeg: number;
  readonly angularDispersionRadPerNm: number;
}

export interface DiffractionGratingResult {
  readonly gratingPitchUm: number;        // d in micrometres
  readonly maxPossibleOrder: number;
  readonly diffractedLines: readonly DiffractedLineResult[];
  readonly sodiumDoubletResolutionThreshold: number; // minimum illuminated lines needed
  readonly intensityProfileOverAngle: readonly { angleDeg: number; intensityNorm: number }[];
}

export const DEFAULT_SPECTRAL_LINES: readonly SpectralLineInput[] = [
  { label: 'Mercury Violet', wavelengthNm: 404.7, hexColor: '#8B5CF6' },
  { label: 'Mercury Blue', wavelengthNm: 435.8, hexColor: '#3B82F6' },
  { label: 'Mercury Green', wavelengthNm: 546.1, hexColor: '#10B981' },
  { label: 'Sodium Yellow D1', wavelengthNm: 589.0, hexColor: '#F59E0B' },
  { label: 'Sodium Yellow D2', wavelengthNm: 589.6, hexColor: '#EAB308' },
  { label: 'Hydrogen Red', wavelengthNm: 656.3, hexColor: '#EF4444' },
];

export const DEFAULT_GRATING_PARAMS: DiffractionGratingParameters = {
  linesPerMm: 600,
  spectralOrderM: 1,
  activeLines: DEFAULT_SPECTRAL_LINES,
};

export class DiffractionGratingEngine {
  static compute(params: DiffractionGratingParameters = DEFAULT_GRATING_PARAMS): DiffractionGratingResult {
    const N_per_mm = params.linesPerMm;
    const d_m = 1e-3 / N_per_mm; // grating element d in metres
    const d_um = d_m * 1e6;
    const m = Math.max(1, params.spectralOrderM);

    const lines = params.activeLines.length > 0 ? params.activeLines : DEFAULT_SPECTRAL_LINES;
    const diffracted: DiffractedLineResult[] = [];

    lines.forEach((line) => {
      const lambdaM = line.wavelengthNm * 1e-9;
      // sin(theta) = m * lambda / d
      const sinTheta = (m * lambdaM) / d_m;

      if (Math.abs(sinTheta) <= 1.0) {
        const thetaRad = Math.asin(sinTheta);
        const thetaDeg = (thetaRad * 180) / Math.PI;
        // Dispersion = m / (d * cos(theta)) in rad/m -> convert to rad/nm
        const dispRadPerNm = (m / (d_m * Math.cos(thetaRad))) * 1e-9;

        diffracted.push({
          label: line.label,
          wavelengthNm: line.wavelengthNm,
          hexColor: line.hexColor,
          diffractionAngleDeg: parseFloat(thetaDeg.toFixed(2)),
          angularDispersionRadPerNm: parseFloat(dispRadPerNm.toFixed(6)),
        });
      }
    });

    // Max possible order for 589nm
    const maxOrder = Math.floor(d_m / (589e-9));

    // Rayleigh criterion lines required to resolve Sodium doublet (589.0 / 0.6 = ~982 lines)
    const requiredLines = Math.ceil(589.0 / (0.6 * m));

    // Diffraction pattern curve across angle [-45° to +45°]
    const profile: Array<{ angleDeg: number; intensityNorm: number }> = [];
    for (let th = -45; th <= 45; th += 0.5) {
      let totalI = 0.05; // background

      diffracted.forEach((dl) => {
        const dAngle = th - dl.diffractionAngleDeg;
        // Slit diffraction sinc envelope
        const peakWidth = 0.4;
        const lineIntensity = Math.exp(-(dAngle * dAngle) / (2 * peakWidth * peakWidth));
        totalI += lineIntensity;
      });

      profile.push({
        angleDeg: parseFloat(th.toFixed(1)),
        intensityNorm: parseFloat(Math.min(1.0, totalI).toFixed(3)),
      });
    }

    return {
      gratingPitchUm: parseFloat(d_um.toFixed(3)),
      maxPossibleOrder: maxOrder,
      diffractedLines: diffracted,
      sodiumDoubletResolutionThreshold: requiredLines,
      intensityProfileOverAngle: profile,
    };
  }
}
