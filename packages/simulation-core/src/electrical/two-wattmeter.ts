/**
 * Prismora Electrical Engineering: AC Circuits — Two-Wattmeter 3-Phase Power Measurement
 * Benchmark: IIT Bombay & Dayalbagh Basic Electrical Engineering Virtual Lab
 *
 * Governing Equations:
 * In a balanced 3-phase 3-wire star or delta system:
 * Line voltage V_L, Line current I_L, Phase angle \phi (lagging or leading)
 *
 * Wattmeter Readings:
 *   W_1 = V_L I_L \cos(30^\circ - \phi)
 *   W_2 = V_L I_L \cos(30^\circ + \phi)
 *
 * 1. Total 3-Phase Active Power:
 *    P_{3\phi} = W_1 + W_2 = \sqrt{3} V_L I_L \cos\phi
 *
 * 2. Total 3-Phase Reactive Power:
 *    Q_{3\phi} = \sqrt{3}(W_1 - W_2) = \sqrt{3} V_L I_L \sin\phi
 *
 * 3. Power Factor Determination:
 *    \tan\phi = \frac{\sqrt{3}(W_1 - W_2)}{W_1 + W_2}
 *    \cos\phi = \cos\left(\tan^{-1}\left(\frac{\sqrt{3}(W_1 - W_2)}{W_1 + W_2}\right)\right)
 *
 * Special Cases:
 * - Unity PF (\phi = 0°): W_1 = W_2 = 0.5 P
 * - 0.5 PF (\phi = 60°): W_2 = 0, W_1 = P
 * - < 0.5 PF (\phi > 60°): W_2 becomes negative! (potential coil connection reversal required)
 */

export interface TwoWattmeterParameters {
  readonly lineVoltageV: number;        // V_L (e.g. 415 V)
  readonly perPhaseResistanceOhms: number; // R_ph in Ω (e.g. 20 Ω)
  readonly perPhaseReactanceOhms: number;  // X_L or -X_C in Ω (e.g. +15 Ω inductive, -10 Ω capacitive)
  readonly loadConnection: 'star' | 'delta';
}

export interface TwoWattmeterResult {
  readonly wattmeter1W: number;
  readonly wattmeter2W: number;
  readonly totalActivePowerW: number;
  readonly totalReactivePowerVar: number;
  readonly apparentPowerVa: number;
  readonly lineCurrentA: number;
  readonly powerFactor: number;
  readonly phaseAngleDeg: number;
  readonly pfNature: 'lagging' | 'unity' | 'leading';
  readonly requiresReversalOfW2: boolean;
  readonly phasorValues: {
    vl: number;
    il: number;
    phiDeg: number;
  };
}

export const DEFAULT_TWO_WATTMETER_PARAMS: TwoWattmeterParameters = {
  lineVoltageV: 415,
  perPhaseResistanceOhms: 24,
  perPhaseReactanceOhms: 18, // Inductive (cos phi = 0.8 lagging)
  loadConnection: 'star',
};

export class TwoWattmeterEngine {
  static compute(params: TwoWattmeterParameters = DEFAULT_TWO_WATTMETER_PARAMS): TwoWattmeterResult {
    const VL = params.lineVoltageV;
    const R = params.perPhaseResistanceOhms;
    const X = params.perPhaseReactanceOhms;

    // Phase impedance
    const Zph = Math.hypot(R, X);
    const phiRad = Math.atan2(X, R);
    const phiDeg = (phiRad * 180) / Math.PI;
    const pf = Math.cos(phiRad);

    let Vph: number;
    let Iph: number;
    let IL: number;

    if (params.loadConnection === 'star') {
      Vph = VL / Math.sqrt(3);
      Iph = Vph / Math.max(0.1, Zph);
      IL = Iph;
    } else {
      Vph = VL;
      Iph = Vph / Math.max(0.1, Zph);
      IL = Math.sqrt(3) * Iph;
    }

    // Wattmeter readings W1 and W2
    const rad30 = (30 * Math.PI) / 180;
    const W1 = VL * IL * Math.cos(rad30 - phiRad);
    const W2 = VL * IL * Math.cos(rad30 + phiRad);

    const totalP = W1 + W2;
    const totalQ = Math.sqrt(3) * (W1 - W2);
    const S = Math.sqrt(3) * VL * IL;

    const pfNature: 'lagging' | 'unity' | 'leading' =
      Math.abs(X) < 1e-4 ? 'unity' : X > 0 ? 'lagging' : 'leading';

    return {
      wattmeter1W: parseFloat(W1.toFixed(1)),
      wattmeter2W: parseFloat(W2.toFixed(1)),
      totalActivePowerW: parseFloat(totalP.toFixed(1)),
      totalReactivePowerVar: parseFloat(totalQ.toFixed(1)),
      apparentPowerVa: parseFloat(S.toFixed(1)),
      lineCurrentA: parseFloat(IL.toFixed(2)),
      powerFactor: parseFloat(pf.toFixed(3)),
      phaseAngleDeg: parseFloat(phiDeg.toFixed(1)),
      pfNature,
      requiresReversalOfW2: W2 < 0,
      phasorValues: {
        vl: VL,
        il: parseFloat(IL.toFixed(2)),
        phiDeg: parseFloat(phiDeg.toFixed(1)),
      },
    };
  }
}

