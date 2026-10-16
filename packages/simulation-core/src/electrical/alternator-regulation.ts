/**
 * Prismora Electrical Engineering: Electrical Machines — Voltage Regulation of 3-Phase Alternator
 * Benchmark: IIT Madras & IIT Roorkee Synchronous Machines Virtual Lab
 *
 * Synchronous Impedance Method (EMF Method):
 * 1. Open Circuit Test (OCC):
 *    No-load line-to-neutral terminal voltage E_0 vs field current I_f
 *
 * 2. Short Circuit Test (SCC):
 *    Short-circuit armature current I_{sc} vs field current I_f (linear curve)
 *
 * 3. Synchronous Impedance Z_s and Synchronous Reactance X_s:
 *    Z_s = \frac{E_0 (\text{open-circuit per phase at given } I_f)}{I_{sc} (\text{short-circuit per phase at same } I_f)}
 *    X_s = \sqrt{Z_s^2 - R_a^2}
 *
 * 4. No-Load Induced EMF E_0:
 *    E_0 = \sqrt{(V \cos\phi + I_a R_a)^2 + (V \sin\phi \pm I_a X_s)^2}
 *    (+ for lagging power factor, - for leading power factor)
 *
 * 5. Percentage Voltage Regulation:
 *    \% \text{Regulation} = \frac{E_0 - V}{V} \times 100\%
 */

export interface AlternatorParameters {
  readonly ratedKva: number;             // Rated power (e.g. 10 kVA)
  readonly ratedVoltageLineV: number;    // Line voltage V_L (e.g. 400 V)
  readonly armatureResistancePerPhase: number; // Ra in Ω (e.g. 0.4 Ω)
  readonly fieldCurrentIfA: number;      // Test If (e.g. 1.2 A)
  readonly loadPowerFactor?: number;      // cos phi (e.g. 0.8)
  readonly powerFactor?: number;
  readonly loadPfType?: 'lagging' | 'unity' | 'leading';
  readonly powerFactorType?: 'lagging' | 'unity' | 'leading';
  readonly loadPercentage: number;       // 25% - 125% of full load
}

export interface AlternatorResult {
  readonly ratedFullLoadCurrentA: number;
  readonly operatingCurrentIa: number;
  readonly terminalVoltagePerPhaseV: number;
  readonly synchronousImpedanceZs: number;
  readonly synchronousImpedanceOhms: number;
  readonly synchronousReactanceXs: number;
  readonly synchronousReactanceOhms: number;
  readonly noLoadInducedEmfE0: number;
  readonly noLoadEmfV: number;
  readonly voltageRegulationPct: number;
  readonly occPoints: readonly { fieldCurrentA: number; openCircuitVoltageV: number }[];
  readonly sccPoints: readonly { fieldCurrentA: number; shortCircuitCurrentA: number }[];
}

export const DEFAULT_ALTERNATOR_PARAMS: AlternatorParameters = {
  ratedKva: 10,
  ratedVoltageLineV: 400,
  armatureResistancePerPhase: 0.5,
  fieldCurrentIfA: 1.5,
  loadPowerFactor: 0.8,
  loadPfType: 'lagging',
  loadPercentage: 100,
};

export class AlternatorRegulationEngine {
  static compute(params: AlternatorParameters = DEFAULT_ALTERNATOR_PARAMS): AlternatorResult {
    const S_va = params.ratedKva * 1000;
    const VL = params.ratedVoltageLineV;
    const Vph = VL / Math.sqrt(3); // Star connected baseline
    const Ra = params.armatureResistancePerPhase;
    const pfInput = params.powerFactor ?? params.loadPowerFactor ?? 0.8;
    const pfType = params.powerFactorType ?? params.loadPfType ?? 'lagging';
    const pf = Math.max(0.1, Math.min(1.0, pfInput));
    const sinPhi = Math.sqrt(1 - pf * pf);

    // Rated full-load current per phase
    const I_fl = S_va / (Math.sqrt(3) * VL);
    const Ia = I_fl * (params.loadPercentage / 100);

    // OCC curve approximation (saturation function)
    const occAtIf = (if_val: number) => {
      // Linear slope initially, then soft magnetic core saturation
      const linearSlope = 220;
      return (linearSlope * if_val) / (1 + 0.22 * if_val);
    };

    // SCC curve is strictly linear (air-gap dominated)
    const sccAtIf = (if_val: number) => {
      return if_val * 12.5; // A per A
    };

    const If_test = params.fieldCurrentIfA;
    const E0_test_ph = occAtIf(If_test);
    const Isc_test = sccAtIf(If_test);

    // Synchronous impedance
    const Zs = E0_test_ph / Math.max(0.1, Isc_test);
    const Xs = Math.sqrt(Math.max(0.01, Zs * Zs - Ra * Ra));

    // No-load EMF E0
    let E0: number;
    if (pfType === 'lagging') {
      const term1 = Vph * pf + Ia * Ra;
      const term2 = Vph * sinPhi + Ia * Xs;
      E0 = Math.hypot(term1, term2);
    } else if (pfType === 'leading') {
      const term1 = Vph * pf + Ia * Ra;
      const term2 = Vph * sinPhi - Ia * Xs;
      E0 = Math.hypot(term1, term2);
    } else {
      // Unity
      const term1 = Vph + Ia * Ra;
      const term2 = Ia * Xs;
      E0 = Math.hypot(term1, term2);
    }

    // % Voltage Regulation = ((E0 - Vph) / Vph) * 100
    const regPct = ((E0 - Vph) / Vph) * 100;

    // Generate OCC points
    const occPoints: Array<{ fieldCurrentA: number; openCircuitVoltageV: number }> = [];
    for (let if_step = 0; if_step <= 3.0; if_step += 0.3) {
      occPoints.push({
        fieldCurrentA: parseFloat(if_step.toFixed(1)),
        openCircuitVoltageV: parseFloat(occAtIf(if_step).toFixed(1)),
      });
    }

    // Generate SCC points
    const sccPoints: Array<{ fieldCurrentA: number; shortCircuitCurrentA: number }> = [];
    for (let if_step = 0; if_step <= 3.0; if_step += 0.3) {
      sccPoints.push({
        fieldCurrentA: parseFloat(if_step.toFixed(1)),
        shortCircuitCurrentA: parseFloat(sccAtIf(if_step).toFixed(1)),
      });
    }

    return {
      ratedFullLoadCurrentA: parseFloat(I_fl.toFixed(2)),
      operatingCurrentIa: parseFloat(Ia.toFixed(2)),
      terminalVoltagePerPhaseV: parseFloat(Vph.toFixed(1)),
      synchronousImpedanceZs: parseFloat(Zs.toFixed(2)),
      synchronousImpedanceOhms: parseFloat(Zs.toFixed(2)),
      synchronousReactanceXs: parseFloat(Xs.toFixed(2)),
      synchronousReactanceOhms: parseFloat(Xs.toFixed(2)),
      noLoadInducedEmfE0: parseFloat(E0.toFixed(1)),
      noLoadEmfV: parseFloat(E0.toFixed(1)),
      voltageRegulationPct: parseFloat(regPct.toFixed(2)),
      occPoints,
      sccPoints,
    };
  }
}
