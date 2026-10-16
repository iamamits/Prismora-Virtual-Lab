/**
 * Prismora Civil & Environmental Engineering: Hydraulics — Flow Over Notches & Weirs
 * Benchmark: IIT Kharagpur & IIT Roorkee Hydraulics and Water Resources Virtual Lab
 *
 * Discharge Equations:
 * 1. Rectangular Notch:
 *    Q = \frac{2}{3} C_d L \sqrt{2g} H^{3/2}
 *    With Francis end contractions correction (n contractions = 2):
 *    L_{eff} = L - 0.1 n H
 *
 * 2. Triangular V-Notch (Thomson's formula):
 *    Q = \frac{8}{15} C_d \tan\left(\frac{\theta}{2}\right) \sqrt{2g} H^{5/2}
 *    For standard 90° notch (\theta = 90°, \tan 45° = 1):
 *    Q \approx 2.36 C_d H^{2.5}
 *
 * 3. Coefficient of Discharge C_d:
 *    C_d = \frac{Q_{actual}}{Q_{theoretical}}
 */

export type NotchType = 'rectangular' | 'triangular_90deg' | 'triangular_60deg';
export type WeirType = 'rectangular' | 'v_notch' | 'trapezoidal' | 'triangular_90deg' | 'triangular_60deg';

export interface WeirFlowParameters {
  readonly notchType?: NotchType;
  readonly weirType: WeirType;
  readonly crestLengthM?: number;       // L in metres (for rectangular, e.g. 0.2 m - 0.5 m)
  readonly headOverCrestMm?: number;    // Head H in mm (e.g. 30 mm - 180 mm)
  readonly headOverCrestM: number;     // Head H in metres
  readonly dischargeCoefficientCd?: number; // C_d (typically 0.60 - 0.64 for rectangular, 0.58 - 0.62 for V-notch)
  readonly channelWidthM?: number;      // Approach channel width B (e.g. 0.6 m)
}

export interface WeirFlowResult {
  readonly notchType: NotchType;
  readonly weirType: WeirType;
  readonly headOverCrestM: number;
  readonly theoreticalDischargeM3PerS: number;
  readonly theoreticalDischargeLps: number;
  readonly actualDischargeM3PerS: number;
  readonly actualDischargeLitersPerSec: number;
  readonly actualDischargeLps: number;
  readonly cd: number;
  readonly dischargeCoefficientCd: number;
  readonly crestVelocityMps: number;
  readonly dischargeCurveHVsQ: readonly { headMm: number; qLps: number }[];
}

export const DEFAULT_WEIR_FLOW_PARAMS: WeirFlowParameters = {
  notchType: 'triangular_90deg',
  weirType: 'v_notch',
  crestLengthM: 0.3,
  headOverCrestMm: 95,
  headOverCrestM: 0.095,
  dischargeCoefficientCd: 0.60,
  channelWidthM: 0.6,
};

export class WeirFlowEngine {
  static compute(params: WeirFlowParameters = DEFAULT_WEIR_FLOW_PARAMS): WeirFlowResult {
    const H = params.headOverCrestM !== undefined ? params.headOverCrestM : (params.headOverCrestMm ?? 95) / 1000;
    const g = 9.81; // m/s²
    const L = params.crestLengthM ?? 0.3; // m
    const effNotch: NotchType =
      params.weirType === 'v_notch'
        ? 'triangular_90deg'
        : params.weirType === 'rectangular' || params.weirType === 'trapezoidal'
        ? 'rectangular'
        : (params.weirType as NotchType) ?? params.notchType ?? 'triangular_90deg';
    const cd = params.dischargeCoefficientCd ?? (effNotch === 'rectangular' ? 0.62 : 0.60);

    let Q_theo: number;
    let Q_actual: number;

    if (effNotch === 'rectangular') {
      // Francis end-contraction correction (2 end contractions)
      const Leff = Math.max(0.01, L - 0.2 * H);
      Q_theo = (2 / 3) * Leff * Math.sqrt(2 * g) * Math.pow(H, 1.5);
      Q_actual = cd * Q_theo;
    } else {
      // Triangular Notch
      const thetaDeg = effNotch === 'triangular_90deg' ? 90 : 60;
      const thetaHalfRad = ((thetaDeg / 2) * Math.PI) / 180;
      Q_theo = (8 / 15) * Math.tan(thetaHalfRad) * Math.sqrt(2 * g) * Math.pow(H, 2.5);
      Q_actual = cd * Q_theo;
    }

    const Q_lps = Q_actual * 1000;

    // Head H vs Discharge Q curve
    const curve: Array<{ headMm: number; qLps: number }> = [];
    for (let hMm = 10; hMm <= 200; hMm += 10) {
      const hM = hMm / 1000;
      let q: number;
      if (effNotch === 'rectangular') {
        const Leff = Math.max(0.01, L - 0.2 * hM);
        q = cd * (2 / 3) * Leff * Math.sqrt(2 * g) * Math.pow(hM, 1.5) * 1000;
      } else {
        const thetaDeg = effNotch === 'triangular_90deg' ? 90 : 60;
        const thetaHalfRad = ((thetaDeg / 2) * Math.PI) / 180;
        q = cd * (8 / 15) * Math.tan(thetaHalfRad) * Math.sqrt(2 * g) * Math.pow(hM, 2.5) * 1000;
      }
      curve.push({
        headMm: hMm,
        qLps: parseFloat(q.toFixed(2)),
      });
    }

    const vCrest = Math.sqrt(2 * g * H);
    return {
      notchType: effNotch,
      weirType: params.weirType ?? (effNotch === 'triangular_90deg' ? 'v_notch' : effNotch),
      headOverCrestM: parseFloat(H.toFixed(4)),
      theoreticalDischargeM3PerS: parseFloat(Q_theo.toFixed(5)),
      theoreticalDischargeLps: parseFloat((Q_theo * 1000).toFixed(2)),
      actualDischargeM3PerS: parseFloat(Q_actual.toFixed(5)),
      actualDischargeLitersPerSec: parseFloat(Q_lps.toFixed(2)),
      actualDischargeLps: parseFloat(Q_lps.toFixed(2)),
      cd: parseFloat(cd.toFixed(3)),
      dischargeCoefficientCd: parseFloat(cd.toFixed(3)),
      crestVelocityMps: parseFloat(vCrest.toFixed(2)),
      dischargeCurveHVsQ: curve,
    };
  }
}
