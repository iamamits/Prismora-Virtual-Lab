/**
 * Prismora Electronics & Communication: Analog Electronics — BJT Common Emitter Characteristics
 * Benchmark: IIT Kharagpur & IIT Roorkee Analog Electronics Virtual Lab
 *
 * Ebers-Moll / Shockley Transistor Modeling:
 * 1. Input Characteristics (I_B vs V_BE at constant V_CE):
 *    I_B = \frac{I_{s}}{\beta} \left( e^{\frac{V_{BE}}{\eta V_T}} - 1 \right)
 *    Input dynamic resistance: r_{\pi} = \left(\frac{\partial V_{BE}}{\partial I_B}\right)_{V_{CE}}
 *
 * 2. Output Characteristics (I_C vs V_CE at constant I_B):
 *    - Cutoff Region: V_{BE} < 0.65 V, I_C \approx I_{CEO} \approx 0
 *    - Saturation Region: V_{CE} < V_{CE,sat} \approx 0.2 V, I_C = \frac{V_{CC} - V_{CE}}{R_C}
 *    - Active Region: V_{CE} \ge 0.2 V:
 *      I_C = \beta I_B \left(1 + \frac{V_{CE}}{V_A}\right)
 *      where V_A = Early voltage (accounts for base-width modulation).
 *
 * 3. Dynamic Current Gain \beta:
 *    \beta = \left(\frac{\Delta I_C}{\Delta I_B}\right)_{V_{CE}}
 */

export interface BjtParameters {
  readonly transistorType: 'npn' | 'pnp';
  readonly baseCurrentMicroA: number;     // I_B in µA (e.g. 10 - 100 µA)
  readonly collectorVoltageVce: number;   // V_CE in Volts (e.g. 0 - 12 V)
  readonly nominalBeta: number;           // \beta_0 (e.g. 150)
  readonly earlyVoltageVa: number;        // V_A in Volts (e.g. 100 V)
  readonly saturationVoltageVceSat?: number; // V_CE(sat) ~ 0.2 V
}

export interface BjtResult {
  readonly collectorCurrentMa: number;    // I_C
  readonly emitterCurrentMa: number;      // I_E = I_B + I_C
  readonly baseEmitterVoltageV: number;   // V_BE
  readonly operatingRegion: 'cutoff' | 'saturation' | 'active';
  readonly smallSignalRpiOhms: number;    // r_pi
  readonly smallSignalGmMs: number;       // Transconductance g_m in mS
  readonly outputCharacteristicsCurves: readonly { ibMicroA: number; points: readonly { vce: number; icMa: number }[] }[];
  readonly inputCharacteristicsPoints: readonly { vbe: number; ibMicroA: number }[];
}

export const DEFAULT_BJT_PARAMS: BjtParameters = {
  transistorType: 'npn',
  baseCurrentMicroA: 40,
  collectorVoltageVce: 5.0,
  nominalBeta: 160,
  earlyVoltageVa: 100,
  saturationVoltageVceSat: 0.2,
};

export class BjtCharacteristicsEngine {
  static compute(params: BjtParameters = DEFAULT_BJT_PARAMS): BjtResult {
    const Ib_uA = params.baseCurrentMicroA;
    const Ib_mA = Ib_uA / 1000;
    const Vce = params.collectorVoltageVce;
    const beta0 = params.nominalBeta;
    const Va = params.earlyVoltageVa;
    const VceSat = params.saturationVoltageVceSat ?? 0.2;

    const Vt = 0.026; // Thermal voltage 26 mV
    const Vbe = Ib_uA > 0 ? 0.65 + Vt * Math.log(Math.max(1, Ib_uA / 5.0)) : 0;

    let Ic_mA: number;
    let region: 'cutoff' | 'saturation' | 'active';

    if (Ib_uA <= 0) {
      region = 'cutoff';
      Ic_mA = 0.001;
    } else if (Vce < VceSat) {
      region = 'saturation';
      // In saturation, current rises steeply with Vce
      const activeIc = beta0 * Ib_mA;
      Ic_mA = activeIc * (Vce / VceSat);
    } else {
      region = 'active';
      // Active region with Early effect: Ic = beta * Ib * (1 + Vce / Va)
      Ic_mA = beta0 * Ib_mA * (1 + Vce / Va);
    }

    const Ie_mA = Ic_mA + Ib_mA;
    // Small signal parameters
    const gm_mS = (Ic_mA / Vt); // mS
    const rpi_ohms = gm_mS > 0 ? (beta0 / (gm_mS / 1000)) : 1e6;

    // Output curves family for Ib = 20, 40, 60, 80, 100 uA
    const testIbs = [20, 40, 60, 80, 100];
    const outputCurves = testIbs.map((ib) => {
      const ib_m = ib / 1000;
      const pts: Array<{ vce: number; icMa: number }> = [];
      for (let v = 0; v <= 12; v += 0.4) {
        let ic: number;
        if (v < VceSat) {
          ic = beta0 * ib_m * (v / VceSat);
        } else {
          ic = beta0 * ib_m * (1 + v / Va);
        }
        pts.push({
          vce: parseFloat(v.toFixed(1)),
          icMa: parseFloat(ic.toFixed(2)),
        });
      }
      return { ibMicroA: ib, points: pts };
    });

    // Input curve (Ib vs Vbe)
    const inputPoints: Array<{ vbe: number; ibMicroA: number }> = [];
    for (let v = 0.5; v <= 0.8; v += 0.01) {
      const ib = 0.05 * Math.exp((v - 0.6) / Vt);
      inputPoints.push({
        vbe: parseFloat(v.toFixed(2)),
        ibMicroA: parseFloat(Math.min(200, ib).toFixed(1)),
      });
    }

    return {
      collectorCurrentMa: parseFloat(Ic_mA.toFixed(2)),
      emitterCurrentMa: parseFloat(Ie_mA.toFixed(2)),
      baseEmitterVoltageV: parseFloat(Vbe.toFixed(3)),
      operatingRegion: region,
      smallSignalRpiOhms: Math.round(rpi_ohms),
      smallSignalGmMs: parseFloat(gm_mS.toFixed(1)),
      outputCharacteristicsCurves: outputCurves,
      inputCharacteristicsPoints: inputPoints,
    };
  }
}
