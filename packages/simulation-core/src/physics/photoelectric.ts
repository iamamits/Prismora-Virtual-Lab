/**
 * Einstein's Photoelectric Effect & Planck's Constant Determination
 * Benchmark: IIT Bombay & Amrita Vishwa Vidyapeetham Modern Physics Virtual Labs
 *
 * Governing Equations:
 * 1. Photon Energy: E = h * nu = (h * c) / lambda
 * 2. Einstein's Photoelectric Equation: K_max = h * nu - Phi = e * V_s
 * 3. Stopping (Cut-off) Potential: V_s = (h / e) * nu - (Phi / e)
 * 4. Threshold Frequency & Wavelength: nu_0 = Phi / h, lambda_0 = (h * c) / Phi
 * 5. Photocurrent I vs Retarding/Accelerating Voltage V:
 *    - For V < -Vs: I = 0
 *    - For -Vs <= V < 0: I = I_sat * ((V + Vs) / Vs)^2
 *    - For V >= 0: I = I_sat (Saturation current proportional to light intensity)
 */

export type CathodeMetal = 'cesium' | 'potassium' | 'sodium' | 'zinc' | 'copper';

export interface MetalProperties {
  readonly name: string;
  readonly symbol: string;
  readonly workFunctionEv: number;
  readonly thresholdWavelengthNm: number;
  readonly color: string;
}

export const CATHODE_METALS: Record<CathodeMetal, MetalProperties> = {
  cesium: {
    name: 'Cesium (Cs)',
    symbol: 'Cs',
    workFunctionEv: 2.14,
    thresholdWavelengthNm: 579,
    color: '#F59E0B',
  },
  potassium: {
    name: 'Potassium (K)',
    symbol: 'K',
    workFunctionEv: 2.30,
    thresholdWavelengthNm: 539,
    color: '#8B5CF6',
  },
  sodium: {
    name: 'Sodium (Na)',
    symbol: 'Na',
    workFunctionEv: 2.75,
    thresholdWavelengthNm: 451,
    color: '#EAB308',
  },
  zinc: {
    name: 'Zinc (Zn)',
    symbol: 'Zn',
    workFunctionEv: 4.31,
    thresholdWavelengthNm: 288,
    color: '#94A3B8',
  },
  copper: {
    name: 'Copper (Cu)',
    symbol: 'Cu',
    workFunctionEv: 4.65,
    thresholdWavelengthNm: 267,
    color: '#F97316',
  },
};

export interface PhotoelectricParameters {
  readonly metal: CathodeMetal;
  /** Incident light wavelength in nanometres nm (200 - 750 nm) */
  readonly wavelengthNm: number;
  /** Light intensity percentage (10% to 100%) */
  readonly intensityPercent: number;
  /** Retarding or accelerating voltage in Volts (-5.0V to +5.0V) */
  readonly appliedVoltageV: number;
}

export interface PhotoelectricPoint {
  readonly voltageV: number;
  readonly currentMicroAmps: number;
}

export interface PhotoelectricResult {
  readonly photonEnergyEv: number;
  readonly photonFrequencyHz: number;
  readonly workFunctionEv: number;
  readonly thresholdFrequencyHz: number;
  readonly thresholdWavelengthNm: number;
  readonly isEmissionPossible: boolean;
  readonly maxKineticEnergyEv: number;
  readonly maxElectronSpeedMs: number;
  readonly stoppingPotentialV: number;
  readonly currentPhotocurrentUa: number;
  readonly saturationCurrentUa: number;
  readonly ivCurve: readonly PhotoelectricPoint[];
}

export class PhotoelectricEngine {
  private static readonly H = 6.62607015e-34; // J*s (Planck's constant)
  private static readonly C = 2.99792458e8; // m/s (speed of light)
  private static readonly E = 1.602176634e-19; // C (electron charge)
  private static readonly M_E = 9.1093837e-31; // kg (electron rest mass)

  static compute(params: PhotoelectricParameters): PhotoelectricResult {
    const metal = CATHODE_METALS[params.metal];
    const lambdaM = params.wavelengthNm * 1e-9;
    const nu = this.C / lambdaM;
    const energyJoules = this.H * nu;
    const energyEv = energyJoules / this.E;

    const workEv = metal.workFunctionEv;
    const workJoules = workEv * this.E;
    const nu0 = workJoules / this.H;
    const lambda0Nm = metal.thresholdWavelengthNm;

    const isEmission = energyEv > workEv;
    const kMaxEv = isEmission ? energyEv - workEv : 0;
    const kMaxJoules = kMaxEv * this.E;
    const vMaxMs = isEmission ? Math.sqrt((2 * kMaxJoules) / this.M_E) : 0;
    const vs = isEmission ? kMaxEv : 0; // In volts

    // Saturation current proportional to light intensity
    const maxSatUa = 15.0; // uA at 100% intensity
    const satCurrentUa = isEmission ? (params.intensityPercent / 100) * maxSatUa : 0;

    // Evaluate photocurrent at applied voltage
    const V = params.appliedVoltageV;
    let currentUa = 0;

    if (isEmission) {
      if (V < -vs) {
        currentUa = 0;
      } else if (V < 0) {
        // Retarding potential between -Vs and 0: quadratic rise towards saturation
        const fraction = (V + vs) / vs;
        currentUa = satCurrentUa * Math.pow(Math.max(0, fraction), 1.8);
      } else {
        // Accelerating potential: smooth approach to saturation
        currentUa = satCurrentUa * (1 - 0.1 * Math.exp(-V * 1.5));
      }
    }

    // Generate I-V curve from -4V to +4V
    const ivCurve: PhotoelectricPoint[] = [];
    const vMin = -4.0;
    const vMax = 4.0;
    const steps = 60;

    for (let i = 0; i <= steps; i++) {
      const vSweep = vMin + (i / steps) * (vMax - vMin);
      let iUa = 0;
      if (isEmission) {
        if (vSweep < -vs) {
          iUa = 0;
        } else if (vSweep < 0) {
          const frac = (vSweep + vs) / vs;
          iUa = satCurrentUa * Math.pow(Math.max(0, frac), 1.8);
        } else {
          iUa = satCurrentUa * (1 - 0.1 * Math.exp(-vSweep * 1.5));
        }
      }
      ivCurve.push({
        voltageV: Number(vSweep.toFixed(2)),
        currentMicroAmps: Number(iUa.toFixed(2)),
      });
    }

    return {
      photonEnergyEv: Number(energyEv.toFixed(2)),
      photonFrequencyHz: Number(nu.toExponential(3)),
      workFunctionEv: workEv,
      thresholdFrequencyHz: Number(nu0.toExponential(3)),
      thresholdWavelengthNm: lambda0Nm,
      isEmissionPossible: isEmission,
      maxKineticEnergyEv: Number(kMaxEv.toFixed(2)),
      maxElectronSpeedMs: Math.round(vMaxMs),
      stoppingPotentialV: Number(vs.toFixed(2)),
      currentPhotocurrentUa: Number(currentUa.toFixed(2)),
      saturationCurrentUa: Number(satCurrentUa.toFixed(2)),
      ivCurve,
    };
  }
}
