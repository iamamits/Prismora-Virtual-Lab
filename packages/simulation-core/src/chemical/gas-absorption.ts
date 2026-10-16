/**
 * Prismora Chemical Engineering: Mass Transfer — Gas Absorption in Packed Column
 * Benchmark: IIT Kharagpur & IIT Roorkee Mass Transfer Operations Lab
 *
 * Governing Equations:
 * 1. Henry's Law Equilibrium:
 *    y^* = m \cdot x = \frac{H}{P} x
 *
 * 2. Operating Line (Material Balance):
 *    G_s (Y - Y_2) = L_s (X - X_2)
 *    where G_s = inert gas flow, L_s = pure liquid solvent flow
 *
 * 3. Absorption Factor:
 *    A = \frac{L}{m G}
 *    For efficient absorption, A > 1.2 - 2.0
 *
 * 4. Number of Overall Gas Transfer Units (N_OG):
 *    Colburn's equation for dilute systems with linear equilibrium line:
 *    N_{OG} = \frac{\ln\left[\left(\frac{y_1 - m x_2}{y_2 - m x_2}\right)\left(1 - \frac{1}{A}\right) + \frac{1}{A}\right]}{1 - \frac{1}{A}}
 *
 * 5. Height of Packed Bed:
 *    Z = N_{OG} \cdot H_{OG}
 */

export interface GasAbsorptionParameters {
  readonly gasInletMoleFractionY1: number; // y1 (e.g. 0.05 = 5% CO2 or NH3 in Air)
  readonly gasOutletTargetY2: number;       // y2 (e.g. 0.005 = 90% recovery)
  readonly liquidInletMoleFractionX2?: number; // x2 (pure solvent = 0)
  readonly gasFlowRateKmolPerH: number;     // G in kmol/h (e.g. 50 kmol/h)
  readonly liquidFlowRateKmolPerH: number;  // L in kmol/h (e.g. 80 kmol/h)
  readonly henrysConstantSlopeM: number;    // m = y*/x (e.g. 0.75 for NH3-water)
  readonly heightOfTransferUnitHogM: number;// H_OG in metres (e.g. 0.6 m)
}

export interface GasAbsorptionResult {
  readonly absorptionFactorA: number;
  readonly percentageRecovery: number;
  readonly liquidOutletMoleFractionX1: number;
  readonly numberOfTransferUnitsNog: number;
  readonly heightOfPackingZMetres: number;
  readonly operatingLinePoints: readonly { x: number; y: number }[];
  readonly equilibriumLinePoints: readonly { x: number; y: number }[];
}

export const DEFAULT_GAS_ABSORPTION_PARAMS: GasAbsorptionParameters = {
  gasInletMoleFractionY1: 0.06,
  gasOutletTargetY2: 0.006, // 90% removal
  liquidInletMoleFractionX2: 0,
  gasFlowRateKmolPerH: 60,
  liquidFlowRateKmolPerH: 100,
  henrysConstantSlopeM: 0.85,
  heightOfTransferUnitHogM: 0.55,
};

export class GasAbsorptionEngine {
  static compute(params: GasAbsorptionParameters = DEFAULT_GAS_ABSORPTION_PARAMS): GasAbsorptionResult {
    const y1 = params.gasInletMoleFractionY1;
    const y2 = params.gasOutletTargetY2;
    const x2 = params.liquidInletMoleFractionX2 ?? 0;
    const G = params.gasFlowRateKmolPerH;
    const L = params.liquidFlowRateKmolPerH;
    const m = params.henrysConstantSlopeM;
    const Hog = params.heightOfTransferUnitHogM;

    // Absorption factor A = L / (m * G)
    const A = L / (m * G);

    // Solute removed in gas = Solute absorbed in liquid: G*(y1 - y2) = L*(x1 - x2)
    const x1 = x2 + (G / L) * (y1 - y2);
    const recoveryPct = ((y1 - y2) / y1) * 100;

    // Colburn equation for N_OG
    let Nog: number;
    const numeratorTerm = ((y1 - m * x2) / (y2 - m * x2)) * (1 - 1 / A) + 1 / A;

    if (Math.abs(A - 1.0) < 1e-3) {
      // Limit as A -> 1
      Nog = (y1 - y2) / (y2 - m * x2);
    } else if (numeratorTerm > 0) {
      Nog = Math.log(numeratorTerm) / (1 - 1 / A);
    } else {
      Nog = 10; // safety clamp
    }

    Nog = Math.max(0.5, Nog);
    const Z = Nog * Hog;

    // Operating line: (x2, y2) to (x1, y1)
    const operatingLine = [
      { x: parseFloat(x2.toFixed(4)), y: parseFloat(y2.toFixed(4)) },
      { x: parseFloat(x1.toFixed(4)), y: parseFloat(y1.toFixed(4)) },
    ];

    // Equilibrium line: y* = m * x
    const maxX = Math.max(0.08, x1 * 1.25);
    const equilibriumLine = [
      { x: 0, y: 0 },
      { x: parseFloat(maxX.toFixed(4)), y: parseFloat((m * maxX).toFixed(4)) },
    ];

    return {
      absorptionFactorA: parseFloat(A.toFixed(2)),
      percentageRecovery: parseFloat(recoveryPct.toFixed(1)),
      liquidOutletMoleFractionX1: parseFloat(x1.toFixed(4)),
      numberOfTransferUnitsNog: parseFloat(Nog.toFixed(2)),
      heightOfPackingZMetres: parseFloat(Z.toFixed(2)),
      operatingLinePoints: operatingLine,
      equilibriumLinePoints: equilibriumLine,
    };
  }
}
