/**
 * Prismora Control Systems Engineering: Frequency Response — Bode Plot & Stability Margins
 * Benchmark: IIT Kharagpur & Dayalbagh Linear Control Systems Virtual Lab
 *
 * System Transfer Function (Generic 2nd / 3rd Order Plant):
 *   G(s) = \frac{K \omega_n^2}{s (s^2 + 2\zeta \omega_n s + \omega_n^2)} \quad \text{or} \quad \frac{K}{(1 + s T_1)(1 + s T_2)}
 *
 * Frequency Response:
 *   s = j\omega
 *   Magnitude (dB): M_{dB}(\omega) = 20 \log_{10} |G(j\omega)|
 *   Phase (degrees): \phi(\omega) = \angle G(j\omega)
 *
 * Stability Criteria:
 * 1. Gain Crossover Frequency \omega_{gc}:
 *    Frequency where |G(j\omega_{gc})| = 1 (i.e. 0 dB).
 *
 * 2. Phase Margin (PM):
 *    PM = 180^\circ + \phi(\omega_{gc})
 *    Positive PM \implies Closed-loop stability!
 *
 * 3. Phase Crossover Frequency \omega_{pc}:
 *    Frequency where \phi(\omega_{pc}) = -180^\circ.
 *
 * 4. Gain Margin (GM):
 *    GM = -20 \log_{10} |G(j\omega_{pc})| \text{ (in dB)}
 */

export interface BodePlotParameters {
  readonly systemGainK: number;          // DC / Open-loop gain K (e.g. 10)
  readonly naturalFrequencyWn: number;   // \omega_n in rad/s (e.g. 5 rad/s)
  readonly dampingRatioZeta: number;     // \zeta (e.g. 0.4 - 0.9)
  readonly polePoleTimeConstantT1?: number; // T1 (e.g. 0.2 s)
}

export interface BodePoint {
  readonly frequencyRadPerS: number;
  readonly magnitudeDb: number;
  readonly phaseDeg: number;
}

export interface BodePlotResult {
  readonly gainMarginDb: number;
  readonly phaseMarginDeg: number;
  readonly gainCrossoverFrequencyWgc: number;
  readonly phaseCrossoverFrequencyWpc: number;
  readonly isClosedLoopStable: boolean;
  readonly bodeCurvePoints: readonly BodePoint[];
}

export const DEFAULT_BODE_PARAMS: BodePlotParameters = {
  systemGainK: 8.0,
  naturalFrequencyWn: 4.0,
  dampingRatioZeta: 0.5,
  polePoleTimeConstantT1: 0.25,
};

export class BodePlotEngine {
  static compute(params: BodePlotParameters = DEFAULT_BODE_PARAMS): BodePlotResult {
    const K = params.systemGainK;
    const wn = params.naturalFrequencyWn;
    const zeta = params.dampingRatioZeta;
    const T1 = params.polePoleTimeConstantT1 ?? 0.25;

    // G(s) = K / [ (1 + s T1) * (s^2 / wn^2 + 2*zeta*s/wn + 1) ]
    // Evaluate G(j*w):
    // Denominator = (1 + j w T1) * (1 - w^2/wn^2 + j 2*zeta*w/wn)
    const evalG = (w: number) => {
      const re1 = 1;
      const im1 = w * T1;

      const re2 = 1 - (w * w) / (wn * wn);
      const im2 = (2 * zeta * w) / wn;

      // Complex product (re1 + j*im1) * (re2 + j*im2)
      const reDen = re1 * re2 - im1 * im2;
      const imDen = re1 * im2 + im1 * re2;

      const magDen = Math.hypot(reDen, imDen);
      const magG = K / Math.max(1e-6, magDen);
      const magDb = 20 * Math.log10(magG);

      // Phase = 0 - atan2(imDen, reDen)
      const phaseRad = -Math.atan2(imDen, reDen);
      const phaseDeg = (phaseRad * 180) / Math.PI;

      return { magG, magDb, phaseDeg };
    };

    // Frequency sweep from 0.1 rad/s to 100 rad/s (logarithmic)
    const points: BodePoint[] = [];
    const minW = 0.1;
    const maxW = 50;
    const numPoints = 60;

    let wgc = wn;
    let wpc = wn * 1.5;
    let foundWgc = false;
    let foundWpc = false;

    let prevMagDb = evalG(minW).magDb;
    let prevPhase = evalG(minW).phaseDeg;

    for (let i = 0; i < numPoints; i++) {
      const logMin = Math.log10(minW);
      const logMax = Math.log10(maxW);
      const w = Math.pow(10, logMin + (i / (numPoints - 1)) * (logMax - logMin));
      const res = evalG(w);

      points.push({
        frequencyRadPerS: parseFloat(w.toFixed(2)),
        magnitudeDb: parseFloat(res.magDb.toFixed(2)),
        phaseDeg: parseFloat(res.phaseDeg.toFixed(1)),
      });

      // Detect 0 dB crossing
      if (!foundWgc && prevMagDb >= 0 && res.magDb < 0) {
        wgc = w;
        foundWgc = true;
      }
      // Detect -180 deg crossing
      if (!foundWpc && prevPhase >= -180 && res.phaseDeg < -180) {
        wpc = w;
        foundWpc = true;
      }

      prevMagDb = res.magDb;
      prevPhase = res.phaseDeg;
    }

    // Phase Margin at wgc
    const gAtWgc = evalG(wgc);
    const PM = 180 + gAtWgc.phaseDeg;

    // Gain Margin at wpc
    const gAtWpc = evalG(wpc);
    const GM = -gAtWpc.magDb;

    const isStable = PM > 0 && GM > 0;

    return {
      gainMarginDb: parseFloat(GM.toFixed(1)),
      phaseMarginDeg: parseFloat(PM.toFixed(1)),
      gainCrossoverFrequencyWgc: parseFloat(wgc.toFixed(2)),
      phaseCrossoverFrequencyWpc: parseFloat(wpc.toFixed(2)),
      isClosedLoopStable: isStable,
      bodeCurvePoints: points,
    };
  }
}
