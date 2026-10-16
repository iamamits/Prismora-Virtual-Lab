/**
 * Prismora Chemical Engineering: Mass Transfer — Liquid-Liquid Extraction (LLE)
 * Benchmark: IIT Guwahati & IIT Roorkee Mass Transfer Virtual Lab
 *
 * System Model:
 *   Carrier Solvent (A) + Solute (B) + Extracting Solvent (C)
 *   e.g., Water (A) + Acetic Acid (B) + Ethyl Acetate or Benzene (C)
 *
 * Equilibrium & Distribution Coefficient:
 *   K = \frac{y_B}{x_B} \text{ (Extract phase solute mass fraction / Raffinate phase solute mass fraction)}
 *
 * Single-Stage Material Balance:
 *   Feed F with solute mass fraction x_F, Pure Solvent S
 *   Overall Balance: F + S = M = E + R
 *   Component Balance: F x_F + S y_S = M x_M = E y_E + R x_R
 *   Fraction of Solute Extracted (Extraction Recovery):
 *   \eta = \frac{E y_E}{F x_F} \times 100\%
 */

export interface LiquidExtractionParameters {
  readonly feedRateKgPerH: number;       // Feed flow rate F in kg/h (e.g. 100 kg/h)
  readonly feedSoluteMassFraction: number;// x_F (e.g. 0.25)
  readonly solventRateKgPerH: number;    // Solvent flow rate S in kg/h (e.g. 150 kg/h)
  readonly distributionCoeffK: number;   // K = y_E / x_R (e.g. 1.85)
  readonly numberOfStages: number;       // 1, 2, or 3 stages (cross-current)
}

export interface ExtractionStageResult {
  readonly stage: number;
  readonly raffinateRateKgPerH: number;
  readonly raffinateSoluteFraction: number;
  readonly extractRateKgPerH: number;
  readonly extractSoluteFraction: number;
  readonly stageRecoveryPct: number;
}

export interface LiquidExtractionResult {
  readonly finalRaffinateRateKgPerH: number;
  readonly finalRaffinateSoluteFraction: number;
  readonly totalExtractRateKgPerH: number;
  readonly totalExtractSoluteFraction: number;
  readonly overallRecoveryPct: number;
  readonly stages: readonly ExtractionStageResult[];
  readonly binodalCurvePoints: readonly { xA: number; xB: number; xC: number }[];
}

export const DEFAULT_EXTRACTION_PARAMS: LiquidExtractionParameters = {
  feedRateKgPerH: 100,
  feedSoluteMassFraction: 0.28,
  solventRateKgPerH: 120,
  distributionCoeffK: 1.85,
  numberOfStages: 2,
};

export class LiquidExtractionEngine {
  static compute(params: LiquidExtractionParameters = DEFAULT_EXTRACTION_PARAMS): LiquidExtractionResult {
    const F = params.feedRateKgPerH;
    const xF = params.feedSoluteMassFraction;
    const S_per_stage = params.solventRateKgPerH / params.numberOfStages;
    const K = params.distributionCoeffK;

    const stages: ExtractionStageResult[] = [];
    let currentFeed = F;
    let currentX = xF;
    let totalSoluteExtracted = 0;
    const totalSoluteIn = F * xF;

    for (let st = 1; st <= params.numberOfStages; st++) {
      // Analytical solution for immiscible carrier and solvent:
      // A (carrier) = currentFeed * (1 - currentX)
      // Solute mass balance: currentFeed * currentX = R * x_R + E * y_E
      // Since y_E = K * x_R and E \approx S_per_stage:
      // x_R = \frac{currentFeed * currentX}{currentFeed + K * S_per_stage}
      const xR = (currentFeed * currentX) / (currentFeed + K * S_per_stage);
      const yE = Math.min(0.95, K * xR);

      const extractMass = S_per_stage / (1 - yE);
      const raffinateMass = currentFeed - (extractMass * yE);

      const soluteExtracted = extractMass * yE;
      totalSoluteExtracted += soluteExtracted;
      const stageRec = (soluteExtracted / Math.max(1e-4, currentFeed * currentX)) * 100;

      stages.push({
        stage: st,
        raffinateRateKgPerH: parseFloat(Math.max(0, raffinateMass).toFixed(1)),
        raffinateSoluteFraction: parseFloat(Math.max(0, xR).toFixed(3)),
        extractRateKgPerH: parseFloat(extractMass.toFixed(1)),
        extractSoluteFraction: parseFloat(yE.toFixed(3)),
        stageRecoveryPct: parseFloat(stageRec.toFixed(1)),
      });

      currentFeed = Math.max(0.1, raffinateMass);
      currentX = Math.max(0, xR);
    }

    const overallRec = totalSoluteIn > 1e-4 ? (totalSoluteExtracted / totalSoluteIn) * 100 : 0;
    const lastStage = stages[stages.length - 1]!;

    // Triangular Binodal Curve points (A = Carrier, B = Solute, C = Solvent)
    const binodal: Array<{ xA: number; xB: number; xC: number }> = [];
    for (let t = 0; t <= 20; t++) {
      const frac = t / 20; // 0 to 1
      const xB_val = 0.5 * Math.sin(Math.PI * frac); // peak solubility dome
      const xC_val = frac * (1 - xB_val);
      const xA_val = 1 - xB_val - xC_val;
      binodal.push({
        xA: parseFloat(Math.max(0, xA_val).toFixed(3)),
        xB: parseFloat(Math.max(0, xB_val).toFixed(3)),
        xC: parseFloat(Math.max(0, xC_val).toFixed(3)),
      });
    }

    return {
      finalRaffinateRateKgPerH: lastStage.raffinateRateKgPerH,
      finalRaffinateSoluteFraction: lastStage.raffinateSoluteFraction,
      totalExtractRateKgPerH: parseFloat(stages.reduce((acc, s) => acc + s.extractRateKgPerH, 0).toFixed(1)),
      totalExtractSoluteFraction: parseFloat((totalSoluteExtracted / Math.max(1, params.solventRateKgPerH)).toFixed(3)),
      overallRecoveryPct: parseFloat(Math.min(99.9, overallRec).toFixed(1)),
      stages,
      binodalCurvePoints: binodal,
    };
  }
}
