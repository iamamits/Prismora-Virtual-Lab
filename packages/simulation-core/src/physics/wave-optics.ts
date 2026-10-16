/**
 * Prismora Physical Sciences Simulation Core — Wave Optics & Double Slit Evaluator
 *
 * Implements authoritative analytical modeling for Fraunhofer double-slit interference
 * and single-slit diffraction benchmarked against AICTE Engineering Physics (PH-101)
 * and IIT Roorkee General Physics / Optics Virtual Lab.
 *
 * Governing Intensity Distribution:
 *   I(θ) = I_0 * [ sin(α) / α ]² * cos²(β)
 *
 * where:
 *   α = (π * a / λ) * sin(θ)   [Diffraction Envelope]
 *   β = (π * d / λ) * sin(θ)   [Interference Fringes]
 *
 * Parameters:
 *   λ (lambda) : Wavelength of monochromatic light in nanometers (380 - 780 nm)
 *   d          : Slit center-to-center separation in millimeters (0.05 - 2.0 mm)
 *   a          : Slit aperture width in millimeters (0.01 - 0.5 mm, must be < d)
 *   D          : Distance from double-slit plane to observation screen in meters (0.5 - 3.0 m)
 *   I_0        : Peak central intensity (normalized, e.g. 1.0 or 100%)
 *
 * Physical Constants & Derived Relationships:
 *   Linear fringe width:         w_fringe = (λ * D) / d
 *   Diffraction envelope half-width: x_diff = (λ * D) / a
 *   Number of bright fringes in central envelope: N ≈ 2 * (d / a) - 1
 *   Missing orders condition:    m = n * (d / a) for integer n
 */

export interface WaveOpticsParams {
  /** Light wavelength in nanometers (e.g. 632.8 nm for He-Ne laser) */
  wavelengthNm: number;
  /** Slit center-to-center separation in millimeters (e.g. 0.25 mm) */
  slitSeparationMm: number;
  /** Individual slit width in millimeters (e.g. 0.05 mm) */
  slitWidthMm: number;
  /** Distance to projection screen in meters (e.g. 1.5 m) */
  screenDistanceM: number;
  /** Peak central irradiance intensity in percentage (default 100) */
  sourceIntensityPct?: number;
}

export interface OpticsScreenPoint {
  /** Position on screen relative to optical axis in millimeters */
  xPositionMm: number;
  /** Diffraction angle θ in radians */
  thetaRad: number;
  /** Total combined normalized intensity [0.0 - 1.0] */
  intensity: number;
  /** Pure interference factor cos²(β) [0.0 - 1.0] */
  interferenceFactor: number;
  /** Pure diffraction envelope factor (sin(α)/α)² [0.0 - 1.0] */
  diffractionEnvelope: number;
}

export interface WaveOpticsCharacteristics {
  fringeWidthMm: number;
  diffractionEnvelopeWidthMm: number;
  fringesInCentralMax: number;
  ratioSeparationToWidth: number;
  missingOrders: number[];
  colorHex: string;
  colorName: string;
}

export class WaveOpticsEvaluator {
  /**
   * Compute static analytical characteristics of the interference pattern.
   */
  public static computeCharacteristics(params: WaveOpticsParams): WaveOpticsCharacteristics {
    const { wavelengthNm: lambdaNm, slitSeparationMm: dMm, slitWidthMm: aMm, screenDistanceM: DM } = params;

    const lambda = lambdaNm * 1e-9; // meters
    const d = dMm * 1e-3;           // meters
    const a = aMm * 1e-3;           // meters
    const D = DM;                   // meters

    // Linear fringe width between adjacent interference maxima: w = lambda * D / d
    const fringeWidthM = d > 0 ? (lambda * D) / d : 0;
    const fringeWidthMm = fringeWidthM * 1000;

    // First diffraction minimum: a * sin(theta) = lambda => x = lambda * D / a
    const diffHalfM = a > 0 ? (lambda * D) / a : 0;
    const diffEnvelopeWidthMm = 2 * diffHalfM * 1000;

    const ratio = a > 0 ? d / a : 1;
    const fringesCount = Math.max(1, Math.round(2 * ratio - 1));

    // Calculate missing orders: m where m * lambda / d = n * lambda / a => m = n * (d / a)
    const missingOrders: number[] = [];
    const intRatio = Math.round(ratio);
    if (Math.abs(ratio - intRatio) < 0.05) {
      for (let n = 1; n <= 4; n++) {
        missingOrders.push(n * intRatio);
      }
    }

    const { hex, name } = this.wavelengthToColor(lambdaNm);

    return {
      fringeWidthMm,
      diffractionEnvelopeWidthMm: diffEnvelopeWidthMm,
      fringesInCentralMax: fringesCount,
      ratioSeparationToWidth: ratio,
      missingOrders,
      colorHex: hex,
      colorName: name,
    };
  }

  /**
   * Compute normalized intensity at a specific position on the screen.
   */
  public static computeIntensityAt(params: WaveOpticsParams, xPositionMm: number): OpticsScreenPoint {
    const { wavelengthNm: lambdaNm, slitSeparationMm: dMm, slitWidthMm: aMm, screenDistanceM: DM, sourceIntensityPct = 100 } = params;

    const lambda = lambdaNm * 1e-9;
    const d = dMm * 1e-3;
    const a = aMm * 1e-3;
    const D = DM;
    const x = xPositionMm * 1e-3;

    // Small angle approximation sin(theta) approx tan(theta) = x / D (or exact x / sqrt(x^2 + D^2))
    const sinTheta = x / Math.sqrt(x * x + D * D);
    const theta = Math.asin(sinTheta);

    // alpha = (pi * a / lambda) * sin(theta)
    const alpha = (Math.PI * a / lambda) * sinTheta;
    // beta = (pi * d / lambda) * sin(theta)
    const beta = (Math.PI * d / lambda) * sinTheta;

    // Diffraction factor: (sin(alpha) / alpha)^2, with limit 1 as alpha -> 0
    let diffFactor = 1.0;
    if (Math.abs(alpha) > 1e-7) {
      const s = Math.sin(alpha) / alpha;
      diffFactor = s * s;
    }

    // Interference factor: cos^2(beta)
    const cosBeta = Math.cos(beta);
    const intFactor = cosBeta * cosBeta;

    const totalIntensity = (sourceIntensityPct / 100) * diffFactor * intFactor;

    return {
      xPositionMm,
      thetaRad: theta,
      intensity: Math.max(0, Math.min(1.0, totalIntensity)),
      interferenceFactor: intFactor,
      diffractionEnvelope: diffFactor,
    };
  }

  /**
   * Generate continuous spatial intensity profile across screen span [-xMaxMm, +xMaxMm].
   */
  public static generateIntensityProfile(
    params: WaveOpticsParams,
    xSpanMm: number = 25,
    numPoints: number = 350
  ): OpticsScreenPoint[] {
    const points: OpticsScreenPoint[] = [];
    const dx = (2 * xSpanMm) / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      const x = -xSpanMm + i * dx;
      points.push(this.computeIntensityAt(params, x));
    }

    return points;
  }

  /**
   * Physical spectrum conversion: maps wavelength (380-780nm) to accurate RGB hex and color name.
   */
  public static wavelengthToColor(wavelengthNm: number): { hex: string; name: string } {
    const w = Math.max(380, Math.min(780, wavelengthNm));
    let r = 0;
    let g = 0;
    let b = 0;

    if (w >= 380 && w < 440) {
      r = -(w - 440) / (440 - 380);
      g = 0.0;
      b = 1.0;
    } else if (w >= 440 && w < 490) {
      r = 0.0;
      g = (w - 440) / (490 - 440);
      b = 1.0;
    } else if (w >= 490 && w < 510) {
      r = 0.0;
      g = 1.0;
      b = -(w - 510) / (510 - 490);
    } else if (w >= 510 && w < 580) {
      r = (w - 510) / (580 - 510);
      g = 1.0;
      b = 0.0;
    } else if (w >= 580 && w < 645) {
      r = 1.0;
      g = -(w - 645) / (645 - 580);
      b = 0.0;
    } else if (w >= 645 && w <= 780) {
      r = 1.0;
      g = 0.0;
      b = 0.0;
    }

    // Intensity falloff near vision limits (380-420 nm and 700-780 nm)
    let factor = 1.0;
    if (w < 420) {
      factor = 0.3 + 0.7 * (w - 380) / (420 - 380);
    } else if (w > 700) {
      factor = 0.3 + 0.7 * (780 - w) / (780 - 700);
    }

    const R = Math.round(Math.max(0, Math.min(255, r * factor * 255)));
    const G = Math.round(Math.max(0, Math.min(255, g * factor * 255)));
    const B = Math.round(Math.max(0, Math.min(255, b * factor * 255)));

    const toHex = (c: number) => c.toString(16).padStart(2, '0');
    const hex = `#${toHex(R)}${toHex(G)}${toHex(B)}`;

    let name = 'Visible Spectrum';
    if (w < 430) name = 'Violet (405nm)';
    else if (w < 490) name = 'Blue (450nm)';
    else if (w < 510) name = 'Cyan (500nm)';
    else if (w < 560) name = 'Green (532nm DPSS)';
    else if (w < 590) name = 'Yellow (589nm Sodium D)';
    else if (w < 630) name = 'Orange (610nm)';
    else name = 'Red (632.8nm He-Ne / 650nm Diode)';

    return { hex, name };
  }
}
