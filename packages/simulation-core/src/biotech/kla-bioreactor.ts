/**
 * Prismora Biotechnology & Bioengineering: Bioprocess Engineering — Volumetric Oxygen Transfer Coefficient (K_L a)
 * Benchmark: IIT Madras & IIT Delhi Bioprocess Virtual Laboratory
 *
 * Dynamic Gassing-Out Method:
 * 1. De-oxygenation Phase (Nitrogen Sparge):
 *    Sparging N_2 strips dissolved oxygen (DO) to near zero (C_L \approx 0 mg/L).
 *
 * 2. Re-oxygenation Phase (Air Sparge):
 *    Air is switched on at fixed agitation speed N (RPM) and aeration rate Q_air (vvm):
 *    \frac{dC_L}{dt} = K_L a (C^* - C_L)
 *    Integrated form:
 *    \ln\left(\frac{C^* - C_{L,0}}{C^* - C_L(t)}\right) = K_L a \cdot t
 *    Slope of \ln(1 - C_L / C^*) vs t gives -K_L a.
 *
 * 3. Oxygen Transfer Rate (OTR):
 *    OTR = K_L a (C^* - C_L) \text{ (mg/(L·h))}
 *
 * 4. Critical Dissolved Oxygen (C_crit):
 *    For optimal aerobic growth (e.g. E. coli or Pichia pastoris), DO must remain above C_crit \approx 10-20% saturation.
 */

export interface KlaBioreactorParameters {
  readonly agitationSpeedRpm: number;     // Stirrer RPM (e.g. 200 - 800 RPM)
  readonly aerationRateVvm: number;       // Air volume per liquid volume per minute (e.g. 0.5 - 2.0 vvm)
  readonly brothTemperatureC: number;     // Temperature (e.g. 30°C - 37°C)
  readonly workingVolumeLiters: number;   // Bioreactor volume (e.g. 5 L)
}

export interface KlaBioreactorResult {
  readonly klaPerSecond: number;          // K_L a in s^-1
  readonly klaPerHour: number;            // K_L a in h^-1
  readonly saturationDoMgPerL: number;    // C* (oxygen solubility at T)
  readonly maxOtrMgPerLPerH: number;      // Maximum OTR when CL = 0
  readonly timeTo90PctSaturationSeconds: number; // t_90
  readonly reoxygenationCurve: readonly { timeSec: number; dissolvedOxygenMgPerL: number; saturationPct: number }[];
  readonly logPlotPoints: readonly { timeSec: number; lnDeficit: number }[];
}

export const DEFAULT_KLA_PARAMS: KlaBioreactorParameters = {
  agitationSpeedRpm: 450,
  aerationRateVvm: 1.0,
  brothTemperatureC: 37,
  workingVolumeLiters: 5.0,
};

export class KlaBioreactorEngine {
  static compute(params: KlaBioreactorParameters = DEFAULT_KLA_PARAMS): KlaBioreactorResult {
    const N = params.agitationSpeedRpm;
    const vvm = params.aerationRateVvm;
    const temp = params.brothTemperatureC;

    // Oxygen solubility in water/broth at 1 atm as function of temperature
    // At 30°C ~ 7.53 mg/L, at 37°C ~ 6.72 mg/L
    const C_star = 14.16 - 0.394 * temp + 0.00771 * temp * temp - 0.0000646 * Math.pow(temp, 3);
    const C_star_clean = Math.max(4.0, Math.min(10.0, C_star));

    // Van't Riet empirical correlation for non-coalescing / coalescing air-water dispersions:
    // K_L a = k * (P_g / V)^a * (v_s)^b
    // Scaled realistically for lab-scale bench bioreactors (10 h^-1 to 300 h^-1)
    const baseKlaPerH = 0.0055 * Math.pow(N, 1.45) * Math.pow(vvm, 0.65);
    const klaH = Math.max(5.0, Math.min(450.0, baseKlaPerH));
    const klaS = klaH / 3600;

    // t_90 = ln(1 / (1 - 0.90)) / K_L a = ln(10) / K_L a \approx 2.303 / K_L a
    const t90 = 2.3026 / klaS;

    // OTR_max = K_L a * C*
    const maxOtr = klaH * C_star_clean;

    // Reoxygenation curve over 0 to 2.5 * t90 seconds
    const totalTime = Math.min(600, Math.ceil(t90 * 2.2));
    const reoxygenationCurve: Array<{ timeSec: number; dissolvedOxygenMgPerL: number; saturationPct: number }> = [];
    const logPlotPoints: Array<{ timeSec: number; lnDeficit: number }> = [];

    const numPoints = 25;
    for (let i = 0; i < numPoints; i++) {
      const t = (i / (numPoints - 1)) * totalTime;
      // C_L(t) = C* * (1 - e^(-K_L a * t))
      const CL = C_star_clean * (1 - Math.exp(-klaS * t));
      const satPct = (CL / C_star_clean) * 100;
      const deficit = Math.max(1e-4, (C_star_clean - CL) / C_star_clean);
      const lnDef = Math.log(deficit);

      reoxygenationCurve.push({
        timeSec: parseFloat(t.toFixed(1)),
        dissolvedOxygenMgPerL: parseFloat(CL.toFixed(2)),
        saturationPct: parseFloat(satPct.toFixed(1)),
      });

      logPlotPoints.push({
        timeSec: parseFloat(t.toFixed(1)),
        lnDeficit: parseFloat(lnDef.toFixed(3)),
      });
    }

    return {
      klaPerSecond: parseFloat(klaS.toFixed(5)),
      klaPerHour: parseFloat(klaH.toFixed(1)),
      saturationDoMgPerL: parseFloat(C_star_clean.toFixed(2)),
      maxOtrMgPerLPerH: parseFloat(maxOtr.toFixed(1)),
      timeTo90PctSaturationSeconds: parseFloat(t90.toFixed(1)),
      reoxygenationCurve,
      logPlotPoints,
    };
  }
}
