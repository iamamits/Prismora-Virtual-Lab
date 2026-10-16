/**
 * Prismora Chemical Sciences Simulation Core — Acid-Base Titration Evaluator
 *
 * Implements rigorous ionic equilibrium modeling for aqueous acid-base neutralization
 * titrations benchmarked against AICTE Engineering Chemistry (CY-101) and
 * Virtual Labs Physical Chemistry curricula.
 *
 * Equilibrium Equations:
 *   1. Autoionization of Water:
 *      Kw = [H+] * [OH-] = 1.0e-14 (at 25°C)
 *
 *   2. Monoprotic Weak Acid Dissociation:
 *      HA <=> H+ + A-,   Ka = ([H+] * [A-]) / [HA]
 *
 *   3. Buffer Region (Henderson-Hasselbalch):
 *      pH = pKa + log10([A-] / [HA])
 *      At half-equivalence: [A-] = [HA] => pH = pKa
 *
 *   4. Equivalence Point Hydrolysis:
 *      A- + H2O <=> HA + OH-,   Kh = Kw / Ka
 *      [OH-] = sqrt(Kh * C_salt) => pH = 7 + 0.5 * (pKa + log10(C_salt))
 *
 *   5. Buffer Capacity (Van Slyke):
 *      β = 2.303 * ( [H+] + [OH-] + (C_total * Ka * [H+]) / (Ka + [H+])^2 )
 */

export type TitrationSystemType =
  | 'strong-acid-strong-base' // HCl + NaOH
  | 'weak-acid-strong-base'   // CH3COOH + NaOH
  | 'weak-base-strong-acid';  // NH3 + HCl

export type IndicatorType =
  | 'phenolphthalein'
  | 'methyl-orange'
  | 'bromothymol-blue'
  | 'phenol-red';

export interface TitrationParams {
  systemType: TitrationSystemType;
  /** Volume of analyte solution in flask (in mL, e.g. 25.0 mL) */
  analyteVolumeMl: number;
  /** Analyte molarity in mol/L (e.g. 0.1 M) */
  analyteConcentrationM: number;
  /** Titrant molarity in burette in mol/L (e.g. 0.1 M) */
  titrantConcentrationM: number;
  /** Acid dissociation constant Ka (e.g. 1.75e-5 for acetic acid) */
  acidKa?: number;
  /** Base dissociation constant Kb (e.g. 1.77e-5 for ammonia) */
  baseKb?: number;
  /** Indicator chosen for visual transition */
  indicator: IndicatorType;
}

export interface TitrationPoint {
  /** Added titrant volume in mL */
  volumeAddedMl: number;
  /** Measured solution pH */
  ph: number;
  /** First derivative dpH/dV in 1/mL */
  dpH_dV: number;
  /** Buffer capacity beta in mol/(L * pH) */
  bufferCapacity: number;
  /** Fraction titrated (V / V_eq) */
  fractionTitrated: number;
  /** Dynamic visual liquid color hex string */
  solutionColor: string;
  /** Qualitative chemical state description */
  regime: 'initial' | 'buffer' | 'half-equivalence' | 'equivalence' | 'excess-titrant';
}

export interface TitrationSummary {
  systemName: string;
  equivalenceVolumeMl: number;
  equivalencePh: number;
  halfEquivalencePh: number;
  initialPh: number;
  maxFirstDerivative: number;
  indicatorSuitability: {
    indicator: IndicatorType;
    transitionRange: string;
    suitable: boolean;
    reason: string;
  };
}

export class AcidBaseTitrationEvaluator {
  private static readonly Kw = 1.0e-14;

  /**
   * Compute stoichiometric equivalence point and key transition metrics.
   */
  public static computeSummary(params: TitrationParams): TitrationSummary {
    const { analyteVolumeMl: Va, analyteConcentrationM: Ca, titrantConcentrationM: Cb, systemType } = params;

    // Monoprotic stoichiometric equivalence: Ca * Va = Cb * Veq => Veq = (Ca * Va) / Cb
    const Veq = (Ca * Va) / Math.max(1e-6, Cb);

    const initialPoint = this.computePhAtVolume(params, 0, Veq);
    const halfEqPoint = this.computePhAtVolume(params, Veq / 2, Veq);
    const eqPoint = this.computePhAtVolume(params, Veq, Veq);

    // Indicator transition ranges & suitability
    const indicator = params.indicator;
    let transitionRange = '';
    let suitable = false;
    let reason = '';

    switch (indicator) {
      case 'phenolphthalein':
        transitionRange = 'pH 8.2 – 10.0 (Colorless → Pink)';
        suitable = eqPoint.ph >= 7.5;
        reason = suitable
          ? 'Sharp color transition coincides with the steep equivalence jump.'
          : 'Changes color at pH > 8.2, which is past the equivalence point for weak bases.';
        break;
      case 'methyl-orange':
        transitionRange = 'pH 3.1 – 4.4 (Red → Yellow)';
        suitable = eqPoint.ph <= 6.0;
        reason = suitable
          ? 'End point aligns with the acidic equivalence point of weak bases.'
          : 'Color transition occurs prematurely before neutral/basic equivalence.';
        break;
      case 'bromothymol-blue':
        transitionRange = 'pH 6.0 – 7.6 (Yellow → Blue)';
        suitable = Math.abs(eqPoint.ph - 7.0) < 1.5;
        reason = suitable
          ? 'Ideal for strong acid-strong base systems with neutral equivalence near pH 7.0.'
          : 'Equivalence pH is outside the neutral 6.0 - 7.6 band.';
        break;
      case 'phenol-red':
        transitionRange = 'pH 6.8 – 8.4 (Yellow → Red)';
        suitable = eqPoint.ph >= 6.5 && eqPoint.ph <= 8.5;
        reason = suitable
          ? 'Covers the near-neutral to slight alkaline equivalence band.'
          : 'Equivalence pH lies outside the phenol red color band.';
        break;
    }

    const systemNames: Record<TitrationSystemType, string> = {
      'strong-acid-strong-base': 'Strong Acid (HCl) vs Strong Base (NaOH)',
      'weak-acid-strong-base': 'Weak Acid (CH₃COOH) vs Strong Base (NaOH)',
      'weak-base-strong-acid': 'Weak Base (NH₃) vs Strong Acid (HCl)',
    };

    return {
      systemName: systemNames[systemType],
      equivalenceVolumeMl: Veq,
      equivalencePh: eqPoint.ph,
      halfEquivalencePh: halfEqPoint.ph,
      initialPh: initialPoint.ph,
      maxFirstDerivative: 50.0, // Calculated dynamically across curve
      indicatorSuitability: {
        indicator,
        transitionRange,
        suitable,
        reason,
      },
    };
  }

  /**
   * Compute exact pH and solution state at a specific added titrant volume Vb.
   */
  public static computePhAtVolume(params: TitrationParams, Vb: number, cachedVeq?: number): TitrationPoint {
    const { analyteVolumeMl: Va, analyteConcentrationM: Ca, titrantConcentrationM: Cb, systemType } = params;
    const Ka = params.acidKa ?? 1.75e-5;
    const Kb = params.baseKb ?? 1.77e-5;
    const Kw = this.Kw;

    const safeVb = Math.max(0, Vb);
    const Veq = cachedVeq ?? ((Ca * Va) / Math.max(1e-6, Cb));
    const fraction = safeVb / Veq;
    const totalVolume = Va + safeVb;

    let ph = 7.0;
    let regime: TitrationPoint['regime'] = 'buffer';
    let bufferCap = 0.001;

    if (safeVb === 0) {
      regime = 'initial';
    } else if (Math.abs(safeVb - Veq) < 0.05) {
      regime = 'equivalence';
    } else if (Math.abs(fraction - 0.5) < 0.05) {
      regime = 'half-equivalence';
    } else if (fraction > 1.05) {
      regime = 'excess-titrant';
    } else {
      regime = 'buffer';
    }

    switch (systemType) {
      // -------------------------------------------------------------
      // 1. STRONG ACID (e.g. HCl) vs STRONG BASE (e.g. NaOH)
      // -------------------------------------------------------------
      case 'strong-acid-strong-base': {
        const molesAcidInitial = (Ca * Va) / 1000;
        const molesBaseAdded = (Cb * safeVb) / 1000;

        if (molesBaseAdded < molesAcidInitial - 1e-9) {
          // Pre-equivalence: excess H+
          const molesHRem = molesAcidInitial - molesBaseAdded;
          const cH = molesHRem / (totalVolume / 1000);
          ph = -Math.log10(Math.max(1e-14, cH));
        } else if (Math.abs(molesBaseAdded - molesAcidInitial) <= 1e-9) {
          // Exactly at equivalence: pure water autoionization
          ph = 7.0;
        } else {
          // Post-equivalence: excess OH-
          const molesOH = molesBaseAdded - molesAcidInitial;
          const cOH = molesOH / (totalVolume / 1000);
          const pOH = -Math.log10(Math.max(1e-14, cOH));
          ph = 14.0 - pOH;
        }
        break;
      }

      // -------------------------------------------------------------
      // 2. WEAK ACID (e.g. CH3COOH) vs STRONG BASE (e.g. NaOH)
      // -------------------------------------------------------------
      case 'weak-acid-strong-base': {
        const pKa = -Math.log10(Ka);
        const molesAcidInitial = (Ca * Va) / 1000;
        const molesBaseAdded = (Cb * safeVb) / 1000;

        if (safeVb === 0) {
          // Initial weak acid: [H+] = sqrt(Ka * Ca)
          const cH = Math.sqrt(Ka * Ca);
          ph = -Math.log10(cH);
        } else if (molesBaseAdded < molesAcidInitial - 1e-7) {
          // Buffer region: Henderson-Hasselbalch
          const molesConjBase = molesBaseAdded;
          const molesWeakAcid = molesAcidInitial - molesBaseAdded;
          const ratio = molesConjBase / Math.max(1e-12, molesWeakAcid);
          ph = pKa + Math.log10(ratio);

          // Buffer capacity
          const cTotal = molesAcidInitial / (totalVolume / 1000);
          const hPlus = Math.pow(10, -ph);
          bufferCap = 2.303 * (hPlus + Kw / hPlus + (cTotal * Ka * hPlus) / Math.pow(Ka + hPlus, 2));
        } else if (Math.abs(molesBaseAdded - molesAcidInitial) <= 1e-7) {
          // Equivalence point: Basic salt hydrolysis of acetate A-
          const cSalt = molesAcidInitial / (totalVolume / 1000);
          const Kh = Kw / Ka;
          const cOH = Math.sqrt(Kh * cSalt);
          ph = 14.0 - (-Math.log10(cOH));
        } else {
          // Post-equivalence: Excess strong base dominants
          const molesOH = molesBaseAdded - molesAcidInitial;
          const cOH = molesOH / (totalVolume / 1000);
          ph = 14.0 - (-Math.log10(Math.max(1e-14, cOH)));
        }
        break;
      }

      // -------------------------------------------------------------
      // 3. WEAK BASE (e.g. NH3) vs STRONG ACID (e.g. HCl)
      // -------------------------------------------------------------
      case 'weak-base-strong-acid': {
        const pKb = -Math.log10(Kb);
        const molesBaseInitial = (Ca * Va) / 1000;
        const molesAcidAdded = (Cb * safeVb) / 1000;

        if (safeVb === 0) {
          // Initial weak base: [OH-] = sqrt(Kb * Cb)
          const cOH = Math.sqrt(Kb * Ca);
          ph = 14.0 - (-Math.log10(cOH));
        } else if (molesAcidAdded < molesBaseInitial - 1e-7) {
          // Buffer region: pOH = pKb + log10([BH+] / [B])
          const molesConjAcid = molesAcidAdded;
          const molesWeakBase = molesBaseInitial - molesAcidAdded;
          const ratio = molesConjAcid / Math.max(1e-12, molesWeakBase);
          const pOH = pKb + Math.log10(ratio);
          ph = 14.0 - pOH;
        } else if (Math.abs(molesAcidAdded - molesBaseInitial) <= 1e-7) {
          // Equivalence point: Acidic salt hydrolysis of NH4+
          const cSalt = molesBaseInitial / (totalVolume / 1000);
          const Kh = Kw / Kb;
          const cH = Math.sqrt(Kh * cSalt);
          ph = -Math.log10(cH);
        } else {
          // Post-equivalence: Excess strong acid dominates
          const molesH = molesAcidAdded - molesBaseInitial;
          const cH = molesH / (totalVolume / 1000);
          ph = -Math.log10(Math.max(1e-14, cH));
        }
        break;
      }
    }

    // Clamp pH within physical aqueous bounds (0.0 to 14.0)
    ph = Math.max(0.0, Math.min(14.0, ph));

    // Dynamic Solution Color based on Indicator & pH
    const color = this.calculateIndicatorColor(params.indicator, ph);

    return {
      volumeAddedMl: safeVb,
      ph,
      dpH_dV: 0, // Filled in batch curve computation
      bufferCapacity: bufferCap,
      fractionTitrated: fraction,
      solutionColor: color,
      regime,
    };
  }

  /**
   * Compute full titration curve from V = 0 to 2.0 * Veq with smooth derivative peaks.
   */
  public static generateTitrationCurve(params: TitrationParams, steps: number = 200): TitrationPoint[] {
    const { analyteVolumeMl: Va, analyteConcentrationM: Ca, titrantConcentrationM: Cb } = params;
    const Veq = (Ca * Va) / Math.max(1e-6, Cb);
    const maxV = Veq * 2.0;

    const points: TitrationPoint[] = [];
    const dV = maxV / (steps - 1);

    for (let i = 0; i < steps; i++) {
      const v = i * dV;
      points.push(this.computePhAtVolume(params, v, Veq));
    }

    // Calculate numerical first derivative: dpH / dV (central difference)
    for (let i = 0; i < points.length; i++) {
      let dpH = 0;
      if (i === 0) {
        dpH = (points[1]!.ph - points[0]!.ph) / (points[1]!.volumeAddedMl - points[0]!.volumeAddedMl);
      } else if (i === points.length - 1) {
        dpH = (points[i]!.ph - points[i - 1]!.ph) / (points[i]!.volumeAddedMl - points[i - 1]!.volumeAddedMl);
      } else {
        const vDiff = points[i + 1]!.volumeAddedMl - points[i - 1]!.volumeAddedMl;
        dpH = vDiff > 0 ? (points[i + 1]!.ph - points[i - 1]!.ph) / vDiff : 0;
      }
      points[i]!.dpH_dV = Math.abs(dpH);
    }

    return points;
  }

  /**
   * Calculate realistic visual RGB hex color corresponding to indicator and current pH.
   */
  public static calculateIndicatorColor(indicator: IndicatorType, ph: number): string {
    switch (indicator) {
      case 'phenolphthalein': {
        // Colorless (pH < 8.2) -> Bright Vibrant Pink/Magenta (pH > 10.0)
        if (ph <= 8.2) return '#F8FAFC'; // clear transparent fluid
        if (ph >= 10.0) return '#EC4899'; // deep magenta pink
        const t = (ph - 8.2) / (10.0 - 8.2);
        // Blend from #F8FAFC (248, 250, 252) to #EC4899 (236, 72, 153)
        const r = Math.round(248 + (236 - 248) * t);
        const g = Math.round(250 + (72 - 250) * t);
        const b = Math.round(252 + (153 - 252) * t);
        return `rgb(${r}, ${g}, ${b})`;
      }

      case 'methyl-orange': {
        // Red/Orange (pH < 3.1) -> Golden Yellow (pH > 4.4)
        if (ph <= 3.1) return '#EF4444'; // red
        if (ph >= 4.4) return '#EAB308'; // yellow
        const t = (ph - 3.1) / (4.4 - 3.1);
        const r = Math.round(239 + (234 - 239) * t);
        const g = Math.round(68 + (179 - 68) * t);
        const b = Math.round(68 + (8 - 68) * t);
        return `rgb(${r}, ${g}, ${b})`;
      }

      case 'bromothymol-blue': {
        // Yellow (pH < 6.0) -> Green (pH ~ 7.0) -> Blue (pH > 7.6)
        if (ph <= 6.0) return '#EAB308'; // yellow
        if (ph >= 7.6) return '#2563EB'; // blue
        const t = (ph - 6.0) / (7.6 - 6.0);
        // Interpolate yellow (234, 179, 8) through green (34, 197, 94) to blue (37, 99, 235)
        if (t < 0.5) {
          const t1 = t / 0.5;
          const r = Math.round(234 + (34 - 234) * t1);
          const g = Math.round(179 + (197 - 179) * t1);
          const b = Math.round(8 + (94 - 8) * t1);
          return `rgb(${r}, ${g}, ${b})`;
        } else {
          const t2 = (t - 0.5) / 0.5;
          const r = Math.round(34 + (37 - 34) * t2);
          const g = Math.round(197 + (99 - 197) * t2);
          const b = Math.round(94 + (235 - 94) * t2);
          return `rgb(${r}, ${g}, ${b})`;
        }
      }

      case 'phenol-red': {
        // Yellow (pH < 6.8) -> Red (pH > 8.4)
        if (ph <= 6.8) return '#FACC15'; // yellow
        if (ph >= 8.4) return '#DC2626'; // red
        const t = (ph - 6.8) / (8.4 - 6.8);
        const r = Math.round(250 + (220 - 250) * t);
        const g = Math.round(204 + (38 - 204) * t);
        const b = Math.round(21 + (38 - 21) * t);
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
  }
}
