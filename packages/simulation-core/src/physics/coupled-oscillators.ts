/**
 * Prismora Physical Sciences: Classical Mechanics — Coupled Harmonic Oscillators
 * Benchmark: IIT Kanpur & IIT Roorkee Waves and Oscillations Virtual Lab
 *
 * Governing Equations:
 * Two identical masses m coupled by a central spring k_c and anchored to fixed walls by springs k:
 *   m \ddot{x}_1 + k x_1 + k_c (x_1 - x_2) = 0
 *   m \ddot{x}_2 + k x_2 + k_c (x_2 - x_1) = 0
 *
 * Normal Modes:
 * 1. Symmetric Mode (In-Phase, x_1 = x_2):
 *    Central spring unextended.
 *    \omega_1 = \omega_s = \sqrt{\frac{k}{m}}
 *
 * 2. Antisymmetric Mode (Out-of-Phase, x_1 = -x_2):
 *    Central spring alternately compressed and stretched.
 *    \omega_2 = \omega_a = \sqrt{\frac{k + 2k_c}{m}}
 *
 * Beat Frequency & Modulated Waveforms:
 *   When only mass 1 is initially displaced (x_1(0) = A, x_2(0) = 0):
 *   x_1(t) = A \cos(\omega_{mod} t) \cos(\omega_{avg} t)
 *   x_2(t) = A \sin(\omega_{mod} t) \sin(\omega_{avg} t)
 *   where:
 *   \omega_{avg} = \frac{\omega_a + \omega_s}{2}, \quad \omega_{mod} = \frac{\omega_a - \omega_s}{2}
 *   Beat Period: T_{beat} = \frac{2\pi}{\omega_a - \omega_s}
 */

export interface CoupledOscillatorParameters {
  readonly massKg: number;                // Mass m in kg (e.g. 0.5 kg - 2.0 kg)
  readonly mainSpringConstantNPerM: number;// k in N/m (e.g. 20 N/m)
  readonly couplingSpringConstantKc: number;// k_c in N/m (e.g. 5 N/m)
  readonly initialDisplacementX1M: number;// x1(0) (e.g. 0.10 m)
  readonly initialDisplacementX2M: number;// x2(0) (e.g. 0.0 m)
  readonly simulationDurationSec?: number; // default 15 sec
}

export interface CoupledOscillatorResult {
  readonly symmetricFreqOmega1RadPerS: number;
  readonly antisymmetricFreqOmega2RadPerS: number;
  readonly beatPeriodSeconds: number;
  readonly couplingRatioKcOverK: number;
  readonly timeSeriesData: readonly { timeSec: number; x1M: number; x2M: number; kineticEnergyJ: number; potentialEnergyJ: number }[];
}

export const DEFAULT_COUPLED_PARAMS: CoupledOscillatorParameters = {
  massKg: 1.0,
  mainSpringConstantNPerM: 25,
  couplingSpringConstantKc: 4.5,
  initialDisplacementX1M: 0.12,
  initialDisplacementX2M: 0.0,
  simulationDurationSec: 12,
};

export class CoupledOscillatorEngine {
  static compute(params: CoupledOscillatorParameters = DEFAULT_COUPLED_PARAMS): CoupledOscillatorResult {
    const m = Math.max(0.05, params.massKg);
    const k = Math.max(0.1, params.mainSpringConstantNPerM);
    const kc = Math.max(0.01, params.couplingSpringConstantKc);
    const x1_0 = params.initialDisplacementX1M;
    const x2_0 = params.initialDisplacementX2M;
    const duration = params.simulationDurationSec ?? 12;

    // Normal mode frequencies
    const w1 = Math.sqrt(k / m);
    const w2 = Math.sqrt((k + 2 * kc) / m);

    // Normal coordinates:
    // q1 = (x1 + x2) / sqrt(2)  [symmetric]
    // q2 = (x1 - x2) / sqrt(2)  [antisymmetric]
    const q1_0 = (x1_0 + x2_0) / Math.SQRT2;
    const q2_0 = (x1_0 - x2_0) / Math.SQRT2;

    const beatPeriod = Math.abs(w2 - w1) > 1e-4 ? (2 * Math.PI) / (w2 - w1) : 999;
    const couplingRatio = kc / k;

    // Generate analytical time series
    const timeSeries: Array<{
      timeSec: number;
      x1M: number;
      x2M: number;
      kineticEnergyJ: number;
      potentialEnergyJ: number;
    }> = [];

    const numSteps = 120;
    for (let i = 0; i <= numSteps; i++) {
      const t = (i / numSteps) * duration;

      // q1(t) = q1_0 * cos(w1 * t)
      // q2(t) = q2_0 * cos(w2 * t)
      const q1 = q1_0 * Math.cos(w1 * t);
      const q2 = q2_0 * Math.cos(w2 * t);

      // x1 = (q1 + q2) / sqrt(2)
      // x2 = (q1 - q2) / sqrt(2)
      const x1 = (q1 + q2) / Math.SQRT2;
      const x2 = (q1 - q2) / Math.SQRT2;

      // Velocities
      const v_q1 = -w1 * q1_0 * Math.sin(w1 * t);
      const v_q2 = -w2 * q2_0 * Math.sin(w2 * t);
      const v1 = (v_q1 + v_q2) / Math.SQRT2;
      const v2 = (v_q1 - v_q2) / Math.SQRT2;

      const ke = 0.5 * m * (v1 * v1 + v2 * v2);
      const pe = 0.5 * k * (x1 * x1 + x2 * x2) + 0.5 * kc * Math.pow(x1 - x2, 2);

      timeSeries.push({
        timeSec: parseFloat(t.toFixed(2)),
        x1M: parseFloat(x1.toFixed(3)),
        x2M: parseFloat(x2.toFixed(3)),
        kineticEnergyJ: parseFloat(ke.toFixed(4)),
        potentialEnergyJ: parseFloat(pe.toFixed(4)),
      });
    }

    return {
      symmetricFreqOmega1RadPerS: parseFloat(w1.toFixed(3)),
      antisymmetricFreqOmega2RadPerS: parseFloat(w2.toFixed(3)),
      beatPeriodSeconds: parseFloat(beatPeriod.toFixed(2)),
      couplingRatioKcOverK: parseFloat(couplingRatio.toFixed(3)),
      timeSeriesData: timeSeries,
    };
  }
}
