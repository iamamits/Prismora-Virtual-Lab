/**
 * Chemical Reaction Engineering: CSTR vs PFR Comparison
 * Benchmark: IIT Bombay & IIT Guwahati Chemical Engineering Virtual Labs
 *
 * Compares ideal Continuous Stirred Tank Reactor (CSTR) and Plug Flow Reactor (PFR)
 * for a first-order liquid-phase reaction A -> B.
 *
 * Governing Equations:
 * 1. Reaction Rate: -rA = k * CA = k * CA0 * (1 - XA)
 * 2. Damköhler Number: Da = k * tau = (k * V) / v0
 * 3. Space Time: tau = V / v0
 * 4. CSTR Mole Balance: V = v0 * (CA0 - CA) / (-rA) ==> X_CSTR = Da / (1 + Da)
 * 5. PFR Mole Balance: dX/dV = -rA / (v0 * CA0) ==> X_PFR = 1 - exp(-Da)
 * 6. Reactor Volume Ratio for same conversion:
 *    V_CSTR / V_PFR = (X / (1 - X)) / ln(1 / (1 - X))
 */

export interface ReactorParameters {
  /** Reaction rate constant k in min^-1 (0.01 - 1.0 min^-1) */
  readonly rateConstantK: number;
  /** Volumetric flow rate v0 in L/min (1 - 50 L/min) */
  readonly flowRateLPerMin: number;
  /** Initial reactant concentration CA0 in mol/L (0.1 - 5.0 mol/L) */
  readonly initialConcentrationMolL: number;
  /** Reactor volume V in Litres (10 - 500 L) */
  readonly reactorVolumeL: number;
  /** Activation energy Ea in kJ/mol (for Arrhenius temperature sweep) */
  readonly activationEnergyKjMol: number;
  /** Operating temperature in Kelvin */
  readonly temperatureK: number;
}

export interface ReactorProfilePoint {
  readonly tauMinutes: number;
  readonly conversionCstr: number;
  readonly conversionPfr: number;
  readonly concCstr: number;
  readonly concPfr: number;
}

export interface ReactorAnalysisResult {
  readonly spaceTimeMinutes: number;
  readonly damkohlerNumber: number;

  // CSTR metrics:
  readonly cstrConversion: number;
  readonly cstrEffluentConcMolL: number;
  readonly cstrReactionRateMolLMin: number;
  readonly cstrProductivityMolMin: number;

  // PFR metrics:
  readonly pfrConversion: number;
  readonly pfrEffluentConcMolL: number;
  readonly pfrReactionRateMolLMin: number;
  readonly pfrProductivityMolMin: number;

  // Comparison:
  readonly volumeRatioCstrOverPfr: number;
  readonly pfrConversionAdvantagePercent: number;

  readonly profile: readonly ReactorProfilePoint[];
}

export const DEFAULT_REACTOR_PARAMS: ReactorParameters = {
  rateConstantK: 0.15,
  flowRateLPerMin: 12.0,
  initialConcentrationMolL: 1.5,
  reactorVolumeL: 100.0,
  activationEnergyKjMol: 45.0,
  temperatureK: 310.0,
};

export class ReactorKineticsEngine {
  static compute(params: ReactorParameters): ReactorAnalysisResult {
    const k = params.rateConstantK;
    const v0 = params.flowRateLPerMin;
    const Ca0 = params.initialConcentrationMolL;
    const V = params.reactorVolumeL;

    const tau = V / v0; // minutes
    const Da = k * tau;

    // CSTR conversion: X_CSTR = Da / (1 + Da)
    const xCstr = Da / (1 + Da);
    const caCstr = Ca0 * (1 - xCstr);
    const rateCstr = k * caCstr;
    const prodCstr = v0 * Ca0 * xCstr;

    // PFR conversion: X_PFR = 1 - exp(-Da)
    const xPfr = 1 - Math.exp(-Da);
    const caPfr = Ca0 * (1 - xPfr);
    const ratePfr = k * caPfr;
    const prodPfr = v0 * Ca0 * xPfr;

    // Ratio of volumes required for same conversion (at target x = xPfr)
    const targetX = Math.min(0.98, xPfr);
    const volRatio = (targetX / (1 - targetX)) / Math.log(1 / (1 - targetX));

    // Space-time profile from 0 to 2.5 * tau
    const maxTau = Math.max(30, tau * 2.2);
    const steps = 60;
    const profile: ReactorProfilePoint[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * maxTau;
      const daLocal = k * t;
      const xC = daLocal / (1 + daLocal);
      const xP = 1 - Math.exp(-daLocal);

      profile.push({
        tauMinutes: Number(t.toFixed(1)),
        conversionCstr: Number(xC.toFixed(4)),
        conversionPfr: Number(xP.toFixed(4)),
        concCstr: Number((Ca0 * (1 - xC)).toFixed(3)),
        concPfr: Number((Ca0 * (1 - xP)).toFixed(3)),
      });
    }

    return {
      spaceTimeMinutes: Number(tau.toFixed(2)),
      damkohlerNumber: Number(Da.toFixed(3)),

      cstrConversion: Number(xCstr.toFixed(4)),
      cstrEffluentConcMolL: Number(caCstr.toFixed(3)),
      cstrReactionRateMolLMin: Number(rateCstr.toFixed(4)),
      cstrProductivityMolMin: Number(prodCstr.toFixed(2)),

      pfrConversion: Number(xPfr.toFixed(4)),
      pfrEffluentConcMolL: Number(caPfr.toFixed(3)),
      pfrReactionRateMolLMin: Number(ratePfr.toFixed(4)),
      pfrProductivityMolMin: Number(prodPfr.toFixed(2)),

      volumeRatioCstrOverPfr: Number(volRatio.toFixed(2)),
      pfrConversionAdvantagePercent: Number(((xPfr - xCstr) * 100).toFixed(1)),

      profile,
    };
  }
}
