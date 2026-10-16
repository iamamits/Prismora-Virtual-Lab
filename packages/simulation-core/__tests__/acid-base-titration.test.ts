import { describe, it, expect } from 'vitest';
import {
  AcidBaseTitrationEvaluator,
  type TitrationParams,
} from '../src/chemistry/acid-base-titration';

describe('AcidBaseTitrationEvaluator — AICTE Chemistry & Physical Chemistry', () => {
  const strongParams: TitrationParams = {
    systemType: 'strong-acid-strong-base',
    analyteVolumeMl: 25.0,        // 25 mL HCl
    analyteConcentrationM: 0.1,   // 0.1 M HCl => 2.5 mmol
    titrantConcentrationM: 0.1,   // 0.1 M NaOH => Veq = 25 mL
    indicator: 'phenolphthalein',
  };

  const weakAcidParams: TitrationParams = {
    systemType: 'weak-acid-strong-base',
    analyteVolumeMl: 25.0,        // 25 mL CH3COOH
    analyteConcentrationM: 0.1,   // 0.1 M CH3COOH
    titrantConcentrationM: 0.1,   // 0.1 M NaOH => Veq = 25 mL
    acidKa: 1.75e-5,              // pKa = 4.757
    indicator: 'phenolphthalein',
  };

  it('calculates stoichiometric equivalence volume accurately', () => {
    const summary = AcidBaseTitrationEvaluator.computeSummary(strongParams);
    expect(summary.equivalenceVolumeMl).toBeCloseTo(25.0, 4);
    expect(summary.initialPh).toBeCloseTo(1.0, 2); // 0.1 M HCl => pH = -log10(0.1) = 1.0
  });

  it('evaluates neutral equivalence pH = 7.0 for strong acid-strong base', () => {
    const eqPoint = AcidBaseTitrationEvaluator.computePhAtVolume(strongParams, 25.0);
    expect(eqPoint.ph).toBeCloseTo(7.0, 2);
    expect(eqPoint.regime).toBe('equivalence');
  });

  it('verifies weak acid initial pH and Henderson-Hasselbalch half-equivalence', () => {
    // Initial pH of 0.1M CH3COOH: [H+] = sqrt(1.75e-5 * 0.1) = sqrt(1.75e-6) ≈ 1.323e-3 => pH ≈ 2.88
    const initialPoint = AcidBaseTitrationEvaluator.computePhAtVolume(weakAcidParams, 0.0);
    expect(initialPoint.ph).toBeCloseTo(2.88, 1);

    // Half-equivalence: V = 12.5 mL => pH should equal pKa = -log10(1.75e-5) ≈ 4.757
    const halfEqPoint = AcidBaseTitrationEvaluator.computePhAtVolume(weakAcidParams, 12.5);
    expect(halfEqPoint.ph).toBeCloseTo(4.757, 1);
    expect(halfEqPoint.regime).toBe('half-equivalence');
  });

  it('evaluates basic equivalence pH (> 8) for weak acid due to salt hydrolysis', () => {
    // CH3COO- + H2O <=> CH3COOH + OH-
    // C_salt = 2.5 mmol / 50 mL = 0.05 M
    // Kh = 1e-14 / 1.75e-5 = 5.714e-10
    // [OH-] = sqrt(5.714e-10 * 0.05) ≈ 5.345e-6 => pOH ≈ 5.27 => pH ≈ 8.73
    const eqPoint = AcidBaseTitrationEvaluator.computePhAtVolume(weakAcidParams, 25.0);
    expect(eqPoint.ph).toBeGreaterThan(8.0);
    expect(eqPoint.ph).toBeLessThan(9.5);
    expect(eqPoint.ph).toBeCloseTo(8.73, 1);
  });

  it('generates smooth titration curve with first derivative peak at equivalence', () => {
    const curve = AcidBaseTitrationEvaluator.generateTitrationCurve(strongParams, 100);
    expect(curve.length).toBe(100);

    // Peak derivative should align near 25 mL
    let maxDerivative = 0;
    let maxV = 0;
    for (const pt of curve) {
      if (pt.dpH_dV > maxDerivative) {
        maxDerivative = pt.dpH_dV;
        maxV = pt.volumeAddedMl;
      }
    }

    // Peak derivative should align near 25 mL within one step resolution
    expect(Math.abs(maxV - 25.0)).toBeLessThan(0.6);
  });

  it('updates solution indicator color dynamically across pH transitions', () => {
    // Phenolphthalein colorless at pH 2, bright pink at pH 11
    const colorAcid = AcidBaseTitrationEvaluator.calculateIndicatorColor('phenolphthalein', 2.0);
    const colorBase = AcidBaseTitrationEvaluator.calculateIndicatorColor('phenolphthalein', 11.0);

    expect(colorAcid).toBe('#F8FAFC');
    expect(colorBase).toBe('#EC4899');
  });
});
