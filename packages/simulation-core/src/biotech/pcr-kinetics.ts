/**
 * Prismora Biotechnology & Molecular Biology: PCR (Polymerase Chain Reaction) Amplification Kinetics
 * Benchmark: IIT Delhi & Amrita Virtual Labs Molecular Biology Lab
 *
 * Thermal Cycling Phases (3-Step PCR):
 * 1. Denaturation: 94°C - 98°C (double-stranded DNA unwinds to single strands)
 * 2. Primer Annealing: 50°C - 65°C (primers bind to complementary target sequences)
 * 3. Taq Polymerase Extension / Elongation: 72°C (optimal dNTP synthesis at ~1000 bp/min)
 *
 * Amplification Kinetics:
 *   N = N_0 (1 + E)^n
 *   where:
 *   N_0 = Initial template copies (e.g. 10^3 to 10^6 molecules)
 *   E = Amplification efficiency (ideal E = 1.0 = 100% per cycle doubling)
 *   n = Thermal cycle number (1 to 40)
 *
 * Real-Time Quantitative PCR (qPCR) Sigmoid Kinetics:
 *   Includes:
 *   - Ground phase / baseline (noise floor)
 *   - Exponential phase (linear on semi-log scale, slope = \log(1+E))
 *   - Linear phase (enzyme/primer begins limiting)
 *   - Plateau phase (dNTP exhaustion, product inhibition)
 *
 * Threshold Cycle (C_t):
 *   C_t = \frac{\log(N_{threshold}) - \log(N_0)}{\log(1 + E)}
 */

export interface PcrParameters {
  readonly initialTemplateCopies: number; // N_0 (e.g. 1000 - 1000000)
  readonly cycleCount: number;             // Total cycles (e.g. 35 - 40)
  readonly efficiencyPct: number;          // Amplification efficiency (e.g. 92% - 100%)
  readonly annealingTemperatureC: number;  // T_anneal (e.g. 55°C - 62°C)
  readonly primerMeltingTempTmC?: number;  // T_m (e.g. 60°C)
  readonly dntpExhaustionLimitCopies?: number; // Plateau saturation level (default ~ 1e11)
}

export interface PcrResult {
  readonly cycleThresholdCt: number;
  readonly finalAmpliconCopies: number;
  readonly foldAmplification: number;
  readonly efficiencyFactor: number;
  readonly isPrimerAnnealingOptimal: boolean;
  readonly amplificationCurve: readonly { cycle: number; copies: number; log10Copies: number; fluorescenceRfu: number }[];
  readonly thermalProfile: readonly { timeSec: number; temperatureC: number; stepName: string }[];
}

export const DEFAULT_PCR_PARAMS: PcrParameters = {
  initialTemplateCopies: 5000,
  cycleCount: 35,
  efficiencyPct: 96,
  annealingTemperatureC: 56,
  primerMeltingTempTmC: 60,
  dntpExhaustionLimitCopies: 1e11,
};

export class PcrKineticsEngine {
  static compute(params: PcrParameters = DEFAULT_PCR_PARAMS): PcrResult {
    const N0 = Math.max(1, params.initialTemplateCopies);
    const nCycles = Math.min(45, Math.max(10, params.cycleCount));
    const E = (params.efficiencyPct / 100);
    const plateau = params.dntpExhaustionLimitCopies ?? 1e11;

    // Check primer annealing optimality (should be ~ 3-5°C below Tm)
    const Tm = params.primerMeltingTempTmC ?? 60;
    const isOptimalAnneal = Math.abs(params.annealingTemperatureC - (Tm - 4)) <= 3;

    // Fluorescence threshold for Ct detection (typically ~ 1e8 copies)
    const thresholdCopies = 5e7;
    const Ct = Math.log(thresholdCopies / N0) / Math.log(1 + E);

    const amplificationCurve: Array<{ cycle: number; copies: number; log10Copies: number; fluorescenceRfu: number }> = [];

    let currentN = N0;
    for (let c = 0; c <= nCycles; c++) {
      if (c === 0) {
        currentN = N0;
      } else {
        // Sigmoidal saturation model towards plateau
        const eff = E * (1 - currentN / plateau);
        currentN = Math.min(plateau, currentN * (1 + Math.max(0, eff)));
      }

      // RFU proportional to copies + baseline noise floor
      const rfu = 15 + (currentN / plateau) * 985;

      amplificationCurve.push({
        cycle: c,
        copies: Math.round(currentN),
        log10Copies: parseFloat(Math.log10(Math.max(1, currentN)).toFixed(2)),
        fluorescenceRfu: parseFloat(rfu.toFixed(1)),
      });
    }

    const finalCopies = amplificationCurve[amplificationCurve.length - 1]!.copies;
    const foldAmp = finalCopies / N0;

    // Thermal cycling profile (1 representative cycle in seconds: 95°C -> 56°C -> 72°C)
    const thermalProfile = [
      { timeSec: 0, temperatureC: 95, stepName: 'Denaturation' },
      { timeSec: 30, temperatureC: 95, stepName: 'Denaturation' },
      { timeSec: 45, temperatureC: params.annealingTemperatureC, stepName: 'Annealing' },
      { timeSec: 75, temperatureC: params.annealingTemperatureC, stepName: 'Annealing' },
      { timeSec: 90, temperatureC: 72, stepName: 'Elongation' },
      { timeSec: 150, temperatureC: 72, stepName: 'Elongation' },
    ];

    return {
      cycleThresholdCt: parseFloat(Math.max(1, Ct).toFixed(2)),
      finalAmpliconCopies: finalCopies,
      foldAmplification: parseFloat(foldAmp.toExponential(2)),
      efficiencyFactor: parseFloat((1 + E).toFixed(3)),
      isPrimerAnnealingOptimal: isOptimalAnneal,
      amplificationCurve,
      thermalProfile,
    };
  }
}
