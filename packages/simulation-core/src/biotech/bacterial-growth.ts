/**
 * Microbial Growth & Monod Kinetics Batch Fermentation Engine
 * Benchmark: IIT Kharagpur & Amrita Bioprocess Engineering Virtual Labs
 *
 * Simulates microbial batch growth phases:
 * 1. Lag Phase: Adaptation to growth medium
 * 2. Exponential (Log) Phase: Uninhibited binary fission
 * 3. Stationary Phase: Nutrient depletion and toxic metabolite accumulation
 * 4. Death (Decay) Phase: Cell lysis
 *
 * Governing Equations:
 * 1. Specific Growth Rate (Monod Equation): mu = mu_max * (S / (Ks + S))
 * 2. Biomass Growth: dX/dt = (mu - kd) * X
 * 3. Substrate Consumption: dS/dt = - (1 / Y_xs) * (dX/dt) - ms * X
 * 4. Doubling Time: t_d = ln(2) / mu_max
 */

export interface MicrobialParameters {
  /** Maximum specific growth rate mu_max in h^-1 (e.g. 0.3 - 0.9 h^-1 for E. coli) */
  readonly maxGrowthRateH: number;
  readonly maxSpecificGrowthRateMu?: number;
  /** Monod substrate affinity constant Ks in g/L (0.01 - 1.0 g/L) */
  readonly substrateAffinityKs: number;
  readonly monodConstantKsGPerL?: number;
  /** Biomass yield on substrate Y_xs in g-biomass / g-substrate (0.3 - 0.6) */
  readonly yieldFactorYxs: number;
  /** Initial biomass X0 in g/L (0.05 - 0.5 g/L) */
  readonly initialBiomassGL: number;
  /** Initial substrate concentration S0 in g/L (5 - 50 g/L) */
  readonly initialSubstrateGL: number;
  readonly initialSubstrateGPerL?: number;
  /** Specific endogenous cell death rate kd in h^-1 (0.005 - 0.05) */
  readonly deathRateKd: number;
  /** Duration of fermentation batch in hours */
  readonly totalTimeHours: number;
  readonly fermentationTimeHours?: number;
}

export interface GrowthTimePoint {
  readonly timeHours: number;
  readonly biomassGL: number;
  readonly biomassGPerL: number;
  readonly substrateGL: number;
  readonly substrateGPerL: number;
  readonly specificGrowthRateH: number;
  readonly growthPhase: 'lag' | 'exponential' | 'stationary' | 'death';
}

export interface GrowthAnalysisResult {
  readonly doublingTimeHours: number;
  readonly maximumBiomassGL: number;
  readonly maximumBiomassGPerL: number;
  readonly peakGrowthRateH: number;
  readonly totalSubstrateConsumedGL: number;
  readonly overallYield: number;
  readonly biomassYieldYXOverS: number;
  readonly trajectory: readonly GrowthTimePoint[];
  readonly growthCurve: readonly GrowthTimePoint[];
}

export const DEFAULT_MICROBIAL_PARAMS: MicrobialParameters = {
  maxGrowthRateH: 0.65,
  maxSpecificGrowthRateMu: 0.65,
  substrateAffinityKs: 0.15,
  monodConstantKsGPerL: 0.15,
  yieldFactorYxs: 0.48,
  initialBiomassGL: 0.1,
  initialSubstrateGL: 20.0,
  initialSubstrateGPerL: 20.0,
  deathRateKd: 0.02,
  totalTimeHours: 16.0,
  fermentationTimeHours: 16.0,
};

export class BacterialGrowthEngine {
  static compute(params: MicrobialParameters): GrowthAnalysisResult {
    const muMax = params.maxSpecificGrowthRateMu ?? params.maxGrowthRateH;
    const Ks = params.monodConstantKsGPerL ?? params.substrateAffinityKs;
    const Yxs = params.yieldFactorYxs;
    const kd = params.deathRateKd;
    const totalTime = params.fermentationTimeHours ?? params.totalTimeHours;
    const dt = 0.1; // 6 minute steps
    const steps = Math.round(totalTime / dt);

    const initX = params.initialBiomassGL;
    const initS = params.initialSubstrateGPerL ?? params.initialSubstrateGL;
    let X = initX;
    let S = initS;
    let maxBio = X;
    let peakRate = 0;

    const lagDurationHours = 1.5; // Nominal physiological lag phase
    const trajectory: GrowthTimePoint[] = [];

    for (let i = 0; i <= steps; i++) {
      const t = i * dt;

      // Lag phase reduction factor
      const lagFactor = t < lagDurationHours ? Math.pow(t / lagDurationHours, 2) : 1.0;
      // Monod specific growth rate
      const mu = S > 0.01 ? muMax * (S / (Ks + S)) * lagFactor : 0;
      peakRate = Math.max(peakRate, mu);

      // Identify growth phase
      let phase: GrowthTimePoint['growthPhase'] = 'exponential';
      if (t < lagDurationHours) {
        phase = 'lag';
      } else if (S < 0.2 && mu < kd * 1.5) {
        phase = 'stationary';
      } else if (S <= 0.02) {
        phase = 'death';
      }

      const bioVal = Number(X.toFixed(3));
      const subVal = Number(Math.max(0, S).toFixed(3));

      trajectory.push({
        timeHours: Number(t.toFixed(1)),
        biomassGL: bioVal,
        biomassGPerL: bioVal,
        substrateGL: subVal,
        substrateGPerL: subVal,
        specificGrowthRateH: Number(mu.toFixed(3)),
        growthPhase: phase,
      });

      maxBio = Math.max(maxBio, X);

      // Numerical Euler/RK2 integration step
      const dX = (mu - kd) * X * dt;
      const dS = - (1 / Yxs) * Math.max(0, mu * X) * dt;

      X = Math.max(0.001, X + dX);
      S = Math.max(0, S + dS);
    }

    const consumedS = initS - trajectory[trajectory.length - 1]!.substrateGL;
    const gainedX = maxBio - initX;
    const overallYield = consumedS > 0 ? gainedX / consumedS : Yxs;
    const doublingTime = Math.log(2) / muMax;

    return {
      doublingTimeHours: Number(doublingTime.toFixed(2)),
      maximumBiomassGL: Number(maxBio.toFixed(2)),
      maximumBiomassGPerL: Number(maxBio.toFixed(2)),
      peakGrowthRateH: Number(peakRate.toFixed(3)),
      totalSubstrateConsumedGL: Number(consumedS.toFixed(2)),
      overallYield: Number(overallYield.toFixed(3)),
      biomassYieldYXOverS: Number(overallYield.toFixed(3)),
      trajectory,
      growthCurve: trajectory,
    };
  }
}
