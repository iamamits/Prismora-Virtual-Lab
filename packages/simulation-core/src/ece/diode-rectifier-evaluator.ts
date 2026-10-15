/**
 * Prismora ECE Simulation Core — PN Junction Diode & Rectifier Analysis Engine
 *
 * Implements non-linear semiconductor modeling:
 * - Shockley diode equation: I_D = I_s * (exp(V_D / (n * V_T)) - 1)
 * - Forward & Reverse bias DC characteristics
 * - Half-Wave Rectifier waveform synthesis (with & without capacitor filter)
 * - Full-Wave Bridge Rectifier waveform synthesis
 * - Mathematical ripple factor, DC average voltage, RMS voltage, and efficiency metrics
 */

export interface DiodeModelParams {
  saturationCurrent: number; // I_s in Amps (e.g. 1e-12 for Silicon, 1e-6 for Germanium)
  idealityFactor: number; // n (1.0 - 2.0)
  thermalVoltage: number; // V_T in Volts (e.g. 0.026V at 300K)
  breakdownVoltage: number; // V_Z in Volts (e.g. -50V or -5.6V for Zener)
  seriesResistance: number; // r_s in Ohms (e.g. 0.5 ohm)
  material: 'Silicon' | 'Germanium' | 'Zener';
}

export const DEFAULT_SILICON_DIODE: DiodeModelParams = {
  saturationCurrent: 1e-12,
  idealityFactor: 1.1,
  thermalVoltage: 0.026,
  breakdownVoltage: -50,
  seriesResistance: 0.5,
  material: 'Silicon',
};

export const DEFAULT_GERMANIUM_DIODE: DiodeModelParams = {
  saturationCurrent: 1e-6,
  idealityFactor: 1.0,
  thermalVoltage: 0.026,
  breakdownVoltage: -30,
  seriesResistance: 0.8,
  material: 'Germanium',
};

export interface DiodeIVPoint {
  voltage: number; // V_D (Volts)
  current: number; // I_D (Amperes)
  currentMA: number; // I_D (Milliamperes)
}

/**
 * Computes the DC I-V curve for a semiconductor diode across a voltage sweep.
 */
export function computeDiodeIVCurve(
  params: DiodeModelParams = DEFAULT_SILICON_DIODE,
  minV: number = -2.0,
  maxV: number = 1.0,
  steps: number = 100,
): DiodeIVPoint[] {
  const { saturationCurrent: Is, idealityFactor: n, thermalVoltage: Vt, breakdownVoltage: Vz } = params;
  const points: DiodeIVPoint[] = [];
  const stepSize = (maxV - minV) / steps;

  for (let i = 0; i <= steps; i++) {
    const v = minV + i * stepSize;
    let current = 0;

    if (v < Vz) {
      // Breakdown region
      current = -1e-3 * Math.abs(v - Vz);
    } else {
      // Forward and reverse bias Shockley equation with exponential clamping to prevent numerical overflow
      const exponent = Math.min(40, v / (n * Vt));
      current = Is * (Math.exp(exponent) - 1);
    }

    points.push({
      voltage: Number(v.toFixed(3)),
      current,
      currentMA: Number((current * 1000).toFixed(4)),
    });
  }

  return points;
}

export type RectifierTopology = 'half-wave' | 'full-wave-bridge';

export interface RectifierSimulationParams {
  topology: RectifierTopology;
  inputPeakVoltage: number; // V_m in Volts (e.g. 10V)
  inputFrequency: number; // f in Hertz (e.g. 50Hz or 60Hz)
  loadResistance: number; // R_L in Ohms (e.g. 1000 ohm)
  filterCapacitance: number; // C in Farads (e.g. 100e-6 for 100uF, 0 for unfiltered)
  diodeForwardDrop?: number; // V_F in Volts (0.7V for Silicon)
}

export interface RectifierWaveformSample {
  timeMs: number;
  inputVoltage: number; // V_in(t)
  outputVoltage: number; // V_out(t)
  diodeCurrentMA: number; // i_D(t) in mA
}

export interface RectifierAnalysisResult {
  samples: RectifierWaveformSample[];
  peakOutputVoltage: number; // V_peak(out)
  averageDCVoltage: number; // V_dc
  rmsVoltage: number; // V_rms
  rippleVoltagePP: number; // V_r(pp)
  rippleFactor: number; // r = V_ac(rms) / V_dc
  rectificationEfficiency: number; // eta (%)
  conductionAngleDeg: number; // degrees
}

/**
 * Simulates a rectifier circuit and generates dual-channel oscilloscope waveform samples
 * alongside analytical performance metrics.
 */
export function simulateRectifier(
  params: RectifierSimulationParams,
  numPeriods: number = 2,
  samplesPerPeriod: number = 100,
): RectifierAnalysisResult {
  const {
    topology,
    inputPeakVoltage: Vm,
    inputFrequency: f,
    loadResistance: RL,
    filterCapacitance: C,
    diodeForwardDrop = 0.7,
  } = params;

  const T = 1 / f; // Period in seconds
  const totalDuration = numPeriods * T;
  const totalSamples = numPeriods * samplesPerPeriod;
  const dt = totalDuration / totalSamples;

  const isBridge = topology === 'full-wave-bridge';
  const diodeDrop = isBridge ? 2 * diodeForwardDrop : diodeForwardDrop;
  const peakOutput = Math.max(0, Vm - diodeDrop);

  const samples: RectifierWaveformSample[] = [];

  // State variable for capacitor voltage
  let vCap = 0;
  let sumVout = 0;
  let sumVoutSq = 0;
  let maxVout = 0;
  let minVout = Infinity;

  // Run simulation over time
  for (let s = 0; s <= totalSamples; s++) {
    const t = s * dt;
    const timeMs = Number((t * 1000).toFixed(3));
    const vin = Vm * Math.sin(2 * Math.PI * f * t);

    // Ideal rectified wave before capacitor filtering
    let vRect = 0;
    if (isBridge) {
      vRect = Math.max(0, Math.abs(vin) - diodeDrop);
    } else {
      vRect = Math.max(0, vin - diodeDrop);
    }

    let vout = vRect;

    if (C > 0) {
      // Capacitor filter integration:
      // When vRect > vCap, capacitor charges rapidly to vRect
      if (vRect >= vCap) {
        vCap = vRect;
      } else {
        // When vRect < vCap, capacitor discharges through load resistor RL: dv/dt = -v / (RL * C)
        const tau = RL * C;
        vCap = vCap * Math.exp(-dt / tau);
      }
      vout = vCap;
    }

    const currentMA = (vout / RL) * 1000;

    samples.push({
      timeMs,
      inputVoltage: Number(vin.toFixed(3)),
      outputVoltage: Number(vout.toFixed(3)),
      diodeCurrentMA: Number(currentMA.toFixed(3)),
    });

    // Statistical aggregation for second period (steady state)
    if (t >= T) {
      sumVout += vout;
      sumVoutSq += vout * vout;
      if (vout > maxVout) maxVout = vout;
      if (vout < minVout) minVout = vout;
    }
  }

  // Steady-state metrics
  const steadySamplesCount = Math.floor(samplesPerPeriod * (numPeriods - 1));
  const averageDC = steadySamplesCount > 0 ? sumVout / steadySamplesCount : 0;
  const rms = steadySamplesCount > 0 ? Math.sqrt(sumVoutSq / steadySamplesCount) : 0;

  const ripplePP = C > 0 && Number.isFinite(minVout) ? Math.max(0, maxVout - minVout) : peakOutput;

  // Ripple factor: r = sqrt((Vrms / Vdc)^2 - 1)
  let rippleFactor = 0;
  if (averageDC > 0) {
    const ratio = rms / averageDC;
    rippleFactor = Math.sqrt(Math.max(0, ratio * ratio - 1));
  }

  // Rectification efficiency: eta = (P_dc / P_ac) * 100
  let efficiency = 0;
  if (rms > 0) {
    efficiency = Math.min(100, ((averageDC * averageDC) / (rms * rms)) * 100);
  }

  return {
    samples,
    peakOutputVoltage: Number(peakOutput.toFixed(2)),
    averageDCVoltage: Number(averageDC.toFixed(2)),
    rmsVoltage: Number(rms.toFixed(2)),
    rippleVoltagePP: Number(ripplePP.toFixed(2)),
    rippleFactor: Number(rippleFactor.toFixed(3)),
    rectificationEfficiency: Number(efficiency.toFixed(1)),
    conductionAngleDeg: isBridge ? 180 : 180,
  };
}
