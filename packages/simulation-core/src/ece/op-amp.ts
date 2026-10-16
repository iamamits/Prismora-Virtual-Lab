/**
 * Prismora Electronics & Communication: Operational Amplifiers (Op-Amps)
 * Benchmark: IIT Bombay & IIT Roorkee Linear Integrated Circuits Lab
 *
 * Ideal Op-Amp Assumptions & Golden Rules:
 * 1. Infinite input impedance: I_+ = I_- = 0
 * 2. Infinite open-loop gain A_{OL} \to \infty: V_+ = V_- (Virtual Short / Ground)
 *
 * Topologies:
 * 1. Inverting Amplifier:
 *    V_{out} = -\frac{R_f}{R_{in}} V_{in}
 *
 * 2. Non-Inverting Amplifier:
 *    V_{out} = \left(1 + \frac{R_f}{R_1}\right) V_{in}
 *
 * 3. Summing Inverting Amplifier:
 *    V_{out} = -\left(\frac{R_f}{R_1} V_1 + \frac{R_f}{R_2} V_2\right)
 *
 * 4. Active Integrator:
 *    V_{out}(t) = -\frac{1}{R C} \int_0^t V_{in}(\tau) d\tau
 *
 * Rail Saturation:
 *   -V_{EE} \le V_{out} \le +V_{CC}
 */

export type OpAmpConfiguration = 'inverting' | 'non_inverting' | 'summing' | 'integrator';

export interface OpAmpParameters {
  readonly configuration: OpAmpConfiguration;
  readonly feedbackResistanceRfKOhms: number; // R_f in kΩ (e.g. 10 kΩ - 100 kΩ)
  readonly inputResistanceRinKOhms: number;    // R_in in kΩ (e.g. 10 kΩ)
  readonly inputVoltageVin1Volts: number;      // V_in1 in Volts (e.g. 1.5 V)
  readonly inputVoltageVin2Volts?: number;     // V_in2 for summing amp (e.g. -0.8 V)
  readonly inputResistanceR2KOhms?: number;    // R2 for summing amp (e.g. 10 kΩ)
  readonly supplyVoltageVccVolts?: number;     // Rails e.g. ±15 V
  readonly integrationCapacitorMicroF?: number;// C for integrator (e.g. 0.1 µF)
}

export interface OpAmpResult {
  readonly configuration: OpAmpConfiguration;
  readonly closedLoopGain: number;
  readonly outputVoltageVolts: number;
  readonly isSaturated: boolean;
  readonly virtualGroundVoltageVolts: number;
  readonly feedbackCurrentMa: number;
  readonly transferFunctionEquation: string;
  readonly waveformPoints: readonly { timeMs: number; vin: number; vout: number }[];
}

export const DEFAULT_OPAMP_PARAMS: OpAmpParameters = {
  configuration: 'inverting',
  feedbackResistanceRfKOhms: 47,
  inputResistanceRinKOhms: 10,
  inputVoltageVin1Volts: 2.0,
  inputVoltageVin2Volts: 0,
  supplyVoltageVccVolts: 15,
};

export class OpAmpEngine {
  static compute(params: OpAmpParameters = DEFAULT_OPAMP_PARAMS): OpAmpResult {
    const Rf = params.feedbackResistanceRfKOhms * 1000;
    const Rin = params.inputResistanceRinKOhms * 1000;
    const Vin1 = params.inputVoltageVin1Volts;
    const Vcc = params.supplyVoltageVccVolts ?? 15;
    const Vee = -Vcc;

    let gain: number;
    let idealVout: number;
    let vGround = 0;
    let ifeed_mA = 0;
    let eqStr = '';

    switch (params.configuration) {
      case 'inverting':
        gain = -(Rf / Rin);
        idealVout = gain * Vin1;
        vGround = 0; // Virtual ground
        ifeed_mA = (Vin1 / Rin) * 1000;
        eqStr = `V_{out} = -\\left(\\frac{${(Rf / 1000).toFixed(0)}k}{${(Rin / 1000).toFixed(0)}k}\\right) V_{in}`;
        break;

      case 'non_inverting':
        gain = 1 + Rf / Rin;
        idealVout = gain * Vin1;
        vGround = Vin1; // Follows non-inverting terminal
        ifeed_mA = (idealVout / (Rf + Rin)) * 1000;
        eqStr = `V_{out} = \\left(1 + \\frac{${(Rf / 1000).toFixed(0)}k}{${(Rin / 1000).toFixed(0)}k}\\right) V_{in}`;
        break;

      case 'summing':
        const R2 = (params.inputResistanceR2KOhms ?? 10) * 1000;
        const Vin2 = params.inputVoltageVin2Volts ?? 0;
        gain = -(Rf / Rin);
        idealVout = -(Rf / Rin * Vin1 + Rf / R2 * Vin2);
        vGround = 0;
        ifeed_mA = ((Vin1 / Rin) + (Vin2 / R2)) * 1000;
        eqStr = `V_{out} = -\\left(\\frac{R_f}{R_1} V_1 + \\frac{R_f}{R_2} V_2\\right)`;
        break;

      case 'integrator':
      default:
        gain = -1;
        idealVout = -Vin1 * 2.5; // for a pulse/ramp
        vGround = 0;
        eqStr = `V_{out}(t) = -\\frac{1}{R C} \\int V_{in}(\\tau) d\\tau`;
        break;
    }

    const isSat = idealVout > Vcc || idealVout < Vee;
    const vout = Math.max(Vee, Math.min(Vcc, idealVout));

    // AC Sine Wave transient response (1 kHz input)
    const wavePoints: Array<{ timeMs: number; vin: number; vout: number }> = [];
    for (let t = 0; t <= 2.0; t += 0.05) {
      const vin_t = Vin1 * Math.sin(2 * Math.PI * 1.0 * t);
      let vout_t: number;
      if (params.configuration === 'inverting') {
        vout_t = Math.max(Vee, Math.min(Vcc, gain * vin_t));
      } else if (params.configuration === 'non_inverting') {
        vout_t = Math.max(Vee, Math.min(Vcc, gain * vin_t));
      } else {
        vout_t = Math.max(Vee, Math.min(Vcc, gain * vin_t));
      }
      wavePoints.push({
        timeMs: parseFloat(t.toFixed(2)),
        vin: parseFloat(vin_t.toFixed(2)),
        vout: parseFloat(vout_t.toFixed(2)),
      });
    }

    return {
      configuration: params.configuration,
      closedLoopGain: parseFloat(gain.toFixed(2)),
      outputVoltageVolts: parseFloat(vout.toFixed(2)),
      isSaturated: isSat,
      virtualGroundVoltageVolts: parseFloat(vGround.toFixed(3)),
      feedbackCurrentMa: parseFloat(ifeed_mA.toFixed(3)),
      transferFunctionEquation: eqStr,
      waveformPoints: wavePoints,
    };
  }
}
