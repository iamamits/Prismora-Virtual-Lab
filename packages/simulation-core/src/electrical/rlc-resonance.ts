/**
 * Series & Parallel RLC Circuit AC Resonance Analyzer
 * Benchmark: IIT Roorkee Electric Circuits & Measurements Virtual Labs
 *
 * Governing Equations:
 * 1. Resonant Frequency: f0 = 1 / (2 * pi * sqrt(L * C))
 * 2. Inductive Reactance: XL = 2 * pi * f * L
 * 3. Capacitive Reactance: XC = 1 / (2 * pi * f * C)
 * 4. Series Impedance: Z = sqrt(R^2 + (XL - XC)^2)
 * 5. Current Magnitude: I = V_source / Z
 * 6. Phase Angle: theta = atan((XL - XC) / R)
 * 7. Quality Factor: Q = (omega0 * L) / R = 1 / (omega0 * C * R)
 * 8. Bandwidth: BW = f0 / Q = R / (2 * pi * L)
 * 9. Half-Power Frequencies: f1, f2 = f0 * (sqrt(1 + 1/(4*Q^2)) +- 1/(2*Q))
 */

export interface RlcParameters {
  /** Circuit resistance R in Ohms (1 - 500 ohms) */
  readonly resistanceOhms: number;
  /** Inductance L in millihenries mH (1 - 100 mH) */
  readonly inductanceMh: number;
  /** Capacitance C in microfarads uF (0.1 - 50 uF) */
  readonly capacitanceUf: number;
  readonly capacitanceMicroF?: number;
  /** AC Source RMS Voltage V_rms (1 - 50 V) */
  readonly sourceVoltageVrms: number;
  /** Current operating frequency in Hz */
  readonly frequencyHz: number;
}

export interface RlcFrequencyPoint {
  readonly frequencyHz: number;
  readonly impedanceOhms: number;
  readonly currentMa: number;
  readonly phaseAngleDeg: number;
  readonly powerWatts: number;
}

export interface RlcResonanceResult {
  readonly resonantFrequencyHz: number;
  readonly angularResonantFrequencyRadS: number;
  readonly qualityFactor: number;
  readonly qualityFactorQ: number;
  readonly bandwidthHz: number;
  readonly lowerCutoffHz: number;
  readonly upperCutoffHz: number;
  readonly resonantCurrentAmps: number;

  // At current frequency:
  readonly currentImpedanceOhms: number;
  readonly currentCurrentMa: number;
  readonly currentPhaseAngleDeg: number;
  readonly vrVolts: number;
  readonly vlVolts: number;
  readonly vcVolts: number;
  readonly nature: 'inductive' | 'capacitive' | 'purely_resistive';

  // Frequency response sweep (from 0.2*f0 to 2.5*f0)
  readonly frequencyCurve: readonly RlcFrequencyPoint[];
  readonly frequencyResponse: readonly { frequencyHz: number; currentAmps: number }[];
}

export const DEFAULT_RLC_PARAMS: RlcParameters = {
  resistanceOhms: 25,
  inductanceMh: 15,
  capacitanceUf: 4.7,
  sourceVoltageVrms: 10,
  frequencyHz: 600,
};

export class RlcResonanceEngine {
  static compute(params: RlcParameters): RlcResonanceResult {
    const R = params.resistanceOhms;
    const L = params.inductanceMh * 1e-3; // H
    const C = (params.capacitanceMicroF ?? params.capacitanceUf) * 1e-6; // F
    const V = params.sourceVoltageVrms;

    const omega0 = 1 / Math.sqrt(L * C);
    const f0 = omega0 / (2 * Math.PI);
    const Q = (omega0 * L) / R;
    const BW = f0 / Q;
    const f1 = f0 * (Math.sqrt(1 + 1 / (4 * Q * Q)) - 1 / (2 * Q));
    const f2 = f0 * (Math.sqrt(1 + 1 / (4 * Q * Q)) + 1 / (2 * Q));

    // Evaluation at current frequency
    const f = params.frequencyHz;
    const omega = 2 * Math.PI * f;
    const XL = omega * L;
    const XC = 1 / (omega * C);
    const Z = Math.sqrt(R * R + Math.pow(XL - XC, 2));
    const I = V / Z; // Amps
    const phaseRad = Math.atan2(XL - XC, R);
    const phaseDeg = (phaseRad * 180) / Math.PI;

    const Vr = I * R;
    const Vl = I * XL;
    const Vc = I * XC;

    let nature: RlcResonanceResult['nature'] = 'purely_resistive';
    if (Math.abs(XL - XC) < 0.1) {
      nature = 'purely_resistive';
    } else if (XL > XC) {
      nature = 'inductive';
    } else {
      nature = 'capacitive';
    }

    // Generate frequency response sweep
    const fMin = Math.max(10, f0 * 0.2);
    const fMax = f0 * 2.5;
    const steps = 70;
    const frequencyCurve: RlcFrequencyPoint[] = [];

    for (let i = 0; i <= steps; i++) {
      const freq = fMin + (i / steps) * (fMax - fMin);
      const w = 2 * Math.PI * freq;
      const xl = w * L;
      const xc = 1 / (w * C);
      const z = Math.sqrt(R * R + Math.pow(xl - xc, 2));
      const iCurrent = (V / z) * 1000; // mA
      const pAngle = (Math.atan2(xl - xc, R) * 180) / Math.PI;
      const pWatts = Math.pow(V / z, 2) * R;

      frequencyCurve.push({
        frequencyHz: Math.round(freq),
        impedanceOhms: Number(z.toFixed(1)),
        currentMa: Number(iCurrent.toFixed(1)),
        phaseAngleDeg: Number(pAngle.toFixed(1)),
        powerWatts: Number(pWatts.toFixed(3)),
      });
    }

    const frequencyResponse = frequencyCurve.map((p) => ({
      frequencyHz: p.frequencyHz,
      currentAmps: p.currentMa / 1000,
    }));

    return {
      resonantFrequencyHz: Number(f0.toFixed(1)),
      angularResonantFrequencyRadS: Number(omega0.toFixed(1)),
      qualityFactor: Number(Q.toFixed(2)),
      qualityFactorQ: Number(Q.toFixed(2)),
      bandwidthHz: Number(BW.toFixed(1)),
      lowerCutoffHz: Number(f1.toFixed(1)),
      upperCutoffHz: Number(f2.toFixed(1)),
      resonantCurrentAmps: Number((V / R).toFixed(3)),

      currentImpedanceOhms: Number(Z.toFixed(2)),
      currentCurrentMa: Number((I * 1000).toFixed(1)),
      currentPhaseAngleDeg: Number(phaseDeg.toFixed(1)),
      vrVolts: Number(Vr.toFixed(2)),
      vlVolts: Number(Vl.toFixed(2)),
      vcVolts: Number(Vc.toFixed(2)),
      nature,

      frequencyCurve,
      frequencyResponse,
    };
  }
}
