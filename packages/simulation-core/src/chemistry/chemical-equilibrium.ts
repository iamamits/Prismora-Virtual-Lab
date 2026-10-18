/**
 * Prismora Chemical Sciences — Chemical Equilibrium & Le Chatelier's Principle Engine
 * NCERT Class 11 Chemistry Chapter 7 (Equilibrium) & AICTE Engineering Chemistry
 *
 * Implements:
 * 1. Dinitrogen Tetroxide & Nitrogen Dioxide gas equilibrium:
 *    N2O4 (g, Colorless) <=> 2 NO2 (g, Dark Red-Brown), Delta H = +57.2 kJ/mol (Endothermic)
 * 2. Temperature dependence via van 't Hoff equation:
 *    ln(K2/K1) = -Delta H / R * (1/T2 - 1/T1)
 * 3. Pressure & Volume perturbations (Le Chatelier shift towards fewer moles upon compression)
 * 4. Reaction Quotient Qc vs Kc directional prediction:
 *    Qc < Kc => Forward shift (Darker brown NO2 produced)
 *    Qc > Kc => Reverse shift (Colorless N2O4 formed)
 * 5. Optical absorbance & visible RGB chamber color modeling
 */

export interface EquilibriumState {
  temperatureK: number; // 250K to 450K
  volumeL: number; // 0.5L to 5.0L
  pressureAtm: number;
  nN2O4Moles: number;
  nNO2Moles: number;
  concN2O4: number; // mol/L
  concNO2: number; // mol/L
  Kc: number; // Equilibrium constant (mol/L)
  Qc: number; // Reaction quotient (mol/L)
  shiftDirection: 'forward' | 'reverse' | 'at_equilibrium';
  chamberColorHex: string; // Dynamic optical transmittance from transparent to reddish-brown
  opticalAbsorbance: number; // 0.0 to 2.5
}

export class ChemicalEquilibriumEngine {
  // Thermodynamic Constants
  static readonly R = 0.08206; // L*atm / (mol*K)
  static readonly R_J = 8.314; // J / (mol*K)
  static readonly DELTA_H = 57200; // J/mol (endothermic dissociation)
  static readonly T_REF = 298.15; // K (25 °C)
  static readonly KC_REF = 0.0059; // mol/L at 298.15 K

  /**
   * Calculate temperature-dependent equilibrium constant Kc using van 't Hoff equation.
   */
  static calculateKc(temperatureK: number): number {
    const T = Math.max(200, Math.min(600, temperatureK));
    // ln(Kc/Kc_ref) = -Delta H / R_J * (1/T - 1/T_ref)
    const exponent = (-this.DELTA_H / this.R_J) * (1 / T - 1 / this.T_REF);
    return this.KC_REF * Math.exp(exponent);
  }

  /**
   * Solve equilibrium state for given temperature, volume, and total nitrogen atoms.
   */
  static solveEquilibrium(
    temperatureK: number,
    volumeL: number,
    initialN2O4Moles: number = 0.5,
    initialNO2Moles: number = 0.2
  ): EquilibriumState {
    const V = Math.max(0.2, volumeL);
    const T = Math.max(220, temperatureK);
    const Kc = this.calculateKc(T);

    // Initial concentrations
    let cN2O4 = initialN2O4Moles / V;
    let cNO2 = initialNO2Moles / V;
    const Qc = cN2O4 > 0 ? (cNO2 * cNO2) / cN2O4 : 999;

    // Solve quadratic equation for equilibrium extent of reaction xi (cNO2_eq = cNO2 + 2*xi, cN2O4_eq = cN2O4 - xi):
    // (cNO2 + 2x)^2 / (cN2O4 - x) = Kc
    // 4x^2 + 4*cNO2*x + cNO2^2 = Kc*cN2O4 - Kc*x
    // 4x^2 + (4*cNO2 + Kc)*x + (cNO2^2 - Kc*cN2O4) = 0
    const a = 4;
    const b = 4 * cNO2 + Kc;
    const c = cNO2 * cNO2 - Kc * cN2O4;

    const discriminant = b * b - 4 * a * c;
    const x = (-b + Math.sqrt(Math.max(0, discriminant))) / (2 * a);

    const eqConcNO2 = Math.max(0.0001, cNO2 + 2 * x);
    const eqConcN2O4 = Math.max(0.0001, cN2O4 - x);

    const eqMolesNO2 = eqConcNO2 * V;
    const eqMolesN2O4 = eqConcN2O4 * V;

    const totalMoles = eqMolesN2O4 + eqMolesNO2;
    const pressureAtm = (totalMoles * this.R * T) / V;

    let shiftDirection: 'forward' | 'reverse' | 'at_equilibrium' = 'at_equilibrium';
    if (Qc < Kc * 0.95) shiftDirection = 'forward';
    else if (Qc > Kc * 1.05) shiftDirection = 'reverse';

    // Optical absorbance (Beer-Lambert law: A = epsilon * concNO2 * pathLength)
    const absorbance = Math.min(2.5, eqConcNO2 * 8.5);

    // Compute RGB chamber color (NO2 is red-brown #78350F)
    const brownIntensity = Math.min(1.0, absorbance / 1.6);
    const rVal = Math.round(255 - brownIntensity * 125); // 255 -> 130
    const gVal = Math.round(240 - brownIntensity * 180); // 240 -> 60
    const blueVal = Math.round(220 - brownIntensity * 205); // 220 -> 15
    const chamberColorHex = `rgb(${rVal}, ${gVal}, ${blueVal})`;

    return {
      temperatureK: T,
      volumeL: V,
      pressureAtm: Number(pressureAtm.toFixed(2)),
      nN2O4Moles: Number(eqMolesN2O4.toFixed(4)),
      nNO2Moles: Number(eqMolesNO2.toFixed(4)),
      concN2O4: Number(eqConcN2O4.toFixed(4)),
      concNO2: Number(eqConcNO2.toFixed(4)),
      Kc: Number(Kc.toFixed(5)),
      Qc: Number(Qc.toFixed(5)),
      shiftDirection,
      chamberColorHex,
      opticalAbsorbance: Number(absorbance.toFixed(3)),
    };
  }
}
