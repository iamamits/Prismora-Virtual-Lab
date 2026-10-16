/**
 * Single-Phase Transformer Open Circuit (O.C.) & Short Circuit (S.C.) Test
 * Benchmark: IIT Roorkee & COEP Pune Electrical Machines Virtual Labs
 *
 * Governing Equations:
 * 1. O.C. Test (Rated Voltage on LV side, HV open):
 *    - Core Loss: Pi = W0
 *    - No-load power factor: cos(phi0) = W0 / (V0 * I0)
 *    - Core loss resistance: Rc = V0^2 / W0
 *    - Magnetizing reactance: Xm = V0 / Im = V0 / (I0 * sin(phi0))
 * 2. S.C. Test (Rated Current on HV side, LV shorted):
 *    - Full-load copper loss: Pcu_fl = Wsc
 *    - Equivalent resistance: Req = Wsc / Isc^2
 *    - Equivalent impedance: Zeq = Vsc / Isc
 *    - Equivalent leakage reactance: Xeq = sqrt(Zeq^2 - Req^2)
 * 3. Performance:
 *    - Efficiency: eta = (V2 * I2 * cos(phi)) / (V2 * I2 * cos(phi) + Pi + x^2 * Pcu_fl) * 100%
 *    - Voltage Regulation: %Reg = (x * I2_fl * (Req * cos(phi) +- Xeq * sin(phi)) / V2) * 100%
 */

export interface TransformerRating {
  /** Rated kVA (e.g., 5 kVA) */
  readonly kva: number;
  /** Primary rated voltage in Volts (e.g., 230 V) */
  readonly v1Rated: number;
  /** Secondary rated voltage in Volts (e.g., 115 V) */
  readonly v2Rated: number;
}

export interface TransformerTestParameters {
  readonly rating: TransformerRating;
  /** Fraction of full load x (0.1 to 1.25) */
  readonly loadFraction: number;
  /** Load power factor cos(phi) (0.2 to 1.0) */
  readonly powerFactor: number;
  readonly loadPowerFactor?: number;
  /** Power factor type: 'lagging' | 'leading' | 'unity' */
  readonly powerFactorType: 'lagging' | 'leading' | 'unity';
  /** O.C. Test applied voltage V0 (typically rated V1 = 230V) */
  readonly v0: number;
  /** S.C. Test applied current Isc (typically rated I1) */
  readonly iSc: number;
}

export interface TransformerTestResult {
  // Equivalent Circuit Parameters (referred to primary)
  readonly coreResistanceRc: number;
  readonly coreResistanceRcOhms: number;
  readonly magnetizingReactanceXm: number;
  readonly magnetizingReactanceXmOhms: number;
  readonly equivalentResistanceReq: number;
  readonly equivalentResistanceReqOhms: number;
  readonly equivalentReactanceXeq: number;
  readonly equivalentImpedanceZeq: number;

  // Meter Readings
  readonly ocPowerWatts: number;
  readonly ocCurrentAmps: number;
  readonly scVoltageVolts: number;
  readonly scPowerWatts: number;

  // Operating Performance
  readonly outputPowerWatts: number;
  readonly totalLossesWatts: number;
  readonly copperLossWatts: number;
  readonly coreLossWatts: number;
  readonly efficiencyPercent: number;
  readonly efficiencyPct: number;
  readonly voltageRegulationPercent: number;
  readonly voltageRegulationPct: number;
  readonly secondaryTerminalVoltageVolts: number;

  // Efficiency vs Load Curve
  readonly efficiencyCurve: readonly { loadFraction: number; efficiency: number }[];
}

export const DEFAULT_TRANSFORMER_PARAMS: TransformerTestParameters = {
  rating: {
    kva: 5,
    v1Rated: 230,
    v2Rated: 115,
  },
  loadFraction: 1.0,
  powerFactor: 0.8,
  powerFactorType: 'lagging',
  v0: 230,
  iSc: 21.74, // 5000 / 230
};

export class TransformerTestEngine {
  static compute(params: TransformerTestParameters): TransformerTestResult {
    const kva = params.rating.kva;
    const v1 = params.rating.v1Rated;
    const v2 = params.rating.v2Rated;
    const i1Rated = (kva * 1000) / v1;
    const i2Rated = (kva * 1000) / v2;

    // Typical physical parameters for 5 kVA dry transformer:
    // Core loss ~ 1.2% of rating = ~60 W
    const nominalCoreLoss = kva * 1000 * 0.012;
    // Full load Cu loss ~ 2.5% of rating = ~125 W
    const nominalCuLoss = kva * 1000 * 0.025;

    // Scaling OC with applied V0^2 (iron loss proportional to V^2)
    const ocPower = nominalCoreLoss * Math.pow(params.v0 / v1, 2);
    const noLoadPf = 0.22; // Typical no-load power factor
    const ocCurrent = ocPower / (params.v0 * noLoadPf);

    const rc = (params.v0 * params.v0) / ocPower;
    const im = ocCurrent * Math.sin(Math.acos(noLoadPf));
    const xm = params.v0 / im;

    // SC test: short LV side, supply on HV side with iSc
    const scRatio = params.iSc / i1Rated;
    const scPower = nominalCuLoss * Math.pow(scRatio, 2);
    const req = scPower / Math.pow(params.iSc, 2);
    const zeq = (v1 * 0.05) / i1Rated; // ~5% impedance
    const xeq = Math.sqrt(Math.max(0.01, zeq * zeq - req * req));
    const scVoltage = params.iSc * zeq;

    // Operating conditions at loadFraction x
    const x = params.loadFraction;
    const pf = params.loadPowerFactor ?? params.powerFactor;
    const phi = Math.acos(Math.min(1.0, Math.max(0.1, pf)));
    const sinPhi = Math.sin(phi);

    const outputPower = x * kva * 1000 * pf;
    const currentCuLoss = Math.pow(x, 2) * nominalCuLoss;
    const totalLosses = ocPower + currentCuLoss;
    const efficiency = (outputPower / (outputPower + totalLosses)) * 100;

    // Voltage regulation referred to secondary:
    // %Reg = (x * I2_fl * (Req2 * cosPhi +- Xeq2 * sinPhi) / V2) * 100%
    const turnsRatio = v1 / v2;
    const req2 = req / (turnsRatio * turnsRatio);
    const xeq2 = xeq / (turnsRatio * turnsRatio);

    const sign = params.powerFactorType === 'leading' ? -1 : 1;
    const deltaV2 = x * i2Rated * (req2 * pf + sign * xeq2 * sinPhi);
    const regulation = (deltaV2 / v2) * 100;
    const v2Terminal = Math.max(0, v2 - deltaV2);

    // Generate efficiency vs load curve (0.1 to 1.25)
    const curve: { loadFraction: number; efficiency: number }[] = [];
    for (let f = 0.1; f <= 1.25; f += 0.05) {
      const pOut = f * kva * 1000 * pf;
      const cuL = Math.pow(f, 2) * nominalCuLoss;
      const eff = (pOut / (pOut + ocPower + cuL)) * 100;
      curve.push({ loadFraction: Number(f.toFixed(2)), efficiency: Number(eff.toFixed(2)) });
    }

    return {
      coreResistanceRc: Math.round(rc),
      coreResistanceRcOhms: Math.round(rc),
      magnetizingReactanceXm: Math.round(xm),
      magnetizingReactanceXmOhms: Math.round(xm),
      equivalentResistanceReq: Number(req.toFixed(3)),
      equivalentResistanceReqOhms: Number(req.toFixed(3)),
      equivalentReactanceXeq: Number(xeq.toFixed(3)),
      equivalentImpedanceZeq: Number(zeq.toFixed(3)),

      ocPowerWatts: Number(ocPower.toFixed(1)),
      ocCurrentAmps: Number(ocCurrent.toFixed(2)),
      scVoltageVolts: Number(scVoltage.toFixed(1)),
      scPowerWatts: Number(scPower.toFixed(1)),

      outputPowerWatts: Math.round(outputPower),
      totalLossesWatts: Math.round(totalLosses),
      copperLossWatts: Math.round(currentCuLoss),
      coreLossWatts: Math.round(ocPower),
      efficiencyPercent: Number(efficiency.toFixed(2)),
      efficiencyPct: Number(efficiency.toFixed(2)),
      voltageRegulationPercent: Number(regulation.toFixed(2)),
      voltageRegulationPct: Number(regulation.toFixed(2)),
      secondaryTerminalVoltageVolts: Number(v2Terminal.toFixed(1)),

      efficiencyCurve: curve,
    };
  }
}
