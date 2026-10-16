/**
 * Prismora Chemical Engineering: Heat Transfer — Double-Pipe / Shell & Tube Heat Exchanger
 * Benchmark: IIT Bombay & IIT Roorkee Heat Transfer Virtual Laboratory
 *
 * Governing Equations:
 * 1. Heat Duty:
 *    Q = \dot{m}_h C_{p,h} (T_{h,in} - T_{h,out}) = \dot{m}_c C_{p,c} (T_{c,out} - T_{c,in})
 *
 * 2. Log Mean Temperature Difference (LMTD):
 *    \Delta T_{lm} = \frac{\Delta T_1 - \Delta T_2}{\ln(\Delta T_1 / \Delta T_2)}
 *    - Counter-current: \Delta T_1 = T_{h,in} - T_{c,out}, \Delta T_2 = T_{h,out} - T_{c,in}
 *    - Co-current (Parallel): \Delta T_1 = T_{h,in} - T_{c,in}, \Delta T_2 = T_{h,out} - T_{c,out}
 *
 * 3. Heat Transfer Equation:
 *    Q = U A F_t \Delta T_{lm}
 *
 * 4. Effectiveness - NTU (\epsilon - NTU) Method:
 *    C_h = \dot{m}_h C_{p,h}, \quad C_c = \dot{m}_c C_{p,c}
 *    C_{\min} = \min(C_h, C_c), \quad C_r = C_{\min} / C_{\max}
 *    Q_{\max} = C_{\min} (T_{h,in} - T_{c,in})
 *    \epsilon = Q / Q_{\max}
 */

export type FlowArrangement = 'counter_current' | 'co_current';

export interface HeatExchangerParameters {
  readonly flowArrangement: FlowArrangement;
  readonly hotInletTempC: number;         // T_h,in (e.g. 95°C)
  readonly hotFlowRateKgPerS: number;     // m_h (e.g. 0.8 kg/s)
  readonly coldInletTempC: number;        // T_c,in (e.g. 20°C)
  readonly coldFlowRateKgPerS: number;    // m_c (e.g. 1.2 kg/s)
  readonly heatTransferAreaM2: number;    // A (e.g. 4.5 m²)
  readonly overallHeatTransferCoeffU: number; // U in W/(m²·K) (e.g. 850 W/m²·K)
}

export interface HeatExchangerResult {
  readonly flowArrangement: FlowArrangement;
  readonly hotOutletTempC: number;
  readonly coldOutletTempC: number;
  readonly heatDutyKw: number;
  readonly lmtdC: number;
  readonly effectivenessPct: number;
  readonly ntu: number;
  readonly capacityRatioCr: number;
  readonly temperatureProfilesAlongLength: readonly { lengthFrac: number; hotTempC: number; coldTempC: number }[];
}

export const DEFAULT_HEAT_EXCHANGER_PARAMS: HeatExchangerParameters = {
  flowArrangement: 'counter_current',
  hotInletTempC: 90,
  hotFlowRateKgPerS: 0.6,
  coldInletTempC: 25,
  coldFlowRateKgPerS: 1.0,
  heatTransferAreaM2: 3.5,
  overallHeatTransferCoeffU: 750, // W/(m²·K)
};

export class HeatExchangerEngine {
  static compute(params: HeatExchangerParameters = DEFAULT_HEAT_EXCHANGER_PARAMS): HeatExchangerResult {
    const cp_water = 4184; // J/(kg·K)
    const Ch = params.hotFlowRateKgPerS * cp_water; // W/K
    const Cc = params.coldFlowRateKgPerS * cp_water; // W/K
    const Cmin = Math.min(Ch, Cc);
    const Cmax = Math.max(Ch, Cc);
    const Cr = Cmin / Cmax;

    const U = params.overallHeatTransferCoeffU;
    const A = params.heatTransferAreaM2;
    const NTU = (U * A) / Cmin;

    let epsilon: number;
    if (params.flowArrangement === 'co_current') {
      // Parallel flow effectiveness
      epsilon = (1 - Math.exp(-NTU * (1 + Cr))) / (1 + Cr);
    } else {
      // Counter-current flow effectiveness
      if (Math.abs(Cr - 1.0) < 1e-4) {
        epsilon = NTU / (1 + NTU);
      } else {
        const expTerm = Math.exp(-NTU * (1 - Cr));
        epsilon = (1 - expTerm) / (1 - Cr * expTerm);
      }
    }

    const Qmax = Cmin * (params.hotInletTempC - params.coldInletTempC);
    const Q = epsilon * Qmax; // Watts

    const Th_out = params.hotInletTempC - Q / Ch;
    const Tc_out = params.coldInletTempC + Q / Cc;

    // LMTD calculation
    let dt1: number;
    let dt2: number;
    if (params.flowArrangement === 'counter_current') {
      dt1 = params.hotInletTempC - Tc_out;
      dt2 = Th_out - params.coldInletTempC;
    } else {
      dt1 = params.hotInletTempC - params.coldInletTempC;
      dt2 = Th_out - Tc_out;
    }

    let lmtd: number;
    if (Math.abs(dt1 - dt2) < 1e-4) {
      lmtd = dt1;
    } else {
      lmtd = (dt1 - dt2) / Math.log(Math.max(1e-4, dt1 / Math.max(1e-4, dt2)));
    }

    // Temperature profiles along length [0 to 1]
    const profiles: Array<{ lengthFrac: number; hotTempC: number; coldTempC: number }> = [];
    for (let i = 0; i <= 20; i++) {
      const z = i / 20;
      let Th_z: number;
      let Tc_z: number;
      if (params.flowArrangement === 'counter_current') {
        Th_z = params.hotInletTempC - (params.hotInletTempC - Th_out) * z;
        Tc_z = params.coldInletTempC + (Tc_out - params.coldInletTempC) * (1 - z);
      } else {
        Th_z = params.hotInletTempC - (params.hotInletTempC - Th_out) * z;
        Tc_z = params.coldInletTempC + (Tc_out - params.coldInletTempC) * z;
      }
      profiles.push({
        lengthFrac: parseFloat(z.toFixed(2)),
        hotTempC: parseFloat(Th_z.toFixed(1)),
        coldTempC: parseFloat(Tc_z.toFixed(1)),
      });
    }

    return {
      flowArrangement: params.flowArrangement,
      hotOutletTempC: parseFloat(Th_out.toFixed(1)),
      coldOutletTempC: parseFloat(Tc_out.toFixed(1)),
      heatDutyKw: parseFloat((Q / 1000).toFixed(2)),
      lmtdC: parseFloat(Math.max(0, lmtd).toFixed(1)),
      effectivenessPct: parseFloat((epsilon * 100).toFixed(1)),
      ntu: parseFloat(NTU.toFixed(2)),
      capacityRatioCr: parseFloat(Cr.toFixed(2)),
      temperatureProfilesAlongLength: profiles,
    };
  }
}
