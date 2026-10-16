/**
 * Prismora Electrical Engineering: Electrical Machines — DC Shunt Motor Characteristics
 * Benchmark: IIT Roorkee & IIT Kharagpur Electrical Machines Laboratory
 *
 * Governing Equations:
 * 1. Back EMF:
 *    E_b = V - I_a R_a = k_e \Phi \omega
 *
 * 2. Electromagnetic Torque:
 *    T_e = k_t \Phi I_a = \frac{E_b I_a}{\omega}
 *
 * 3. Speed:
 *    \omega = \frac{V - I_a R_a}{k \Phi} \quad \implies \quad N = \frac{60}{2\pi} \omega
 *
 * 4. Speed Regulation & Control:
 *    - Armature resistance control (inserting external series resistance R_ext)
 *    - Field flux control (rheostat weakening field current I_f = V / R_f)
 *
 * 5. Efficiency:
 *    \eta = \frac{P_{out}}{P_{in}} = \frac{T \omega}{V I_L} \times 100\%
 */

export interface DcMotorParameters {
  readonly terminalVoltageV: number;    // V in Volts (e.g. 220V)
  readonly armatureResistanceOhms: number; // Ra (e.g. 0.5 Ω)
  readonly externalArmatureResOhms?: number; // R_ext (0 - 5 Ω)
  readonly fieldResistanceOhms: number; // Rf (e.g. 200 Ω)
  readonly fieldRheostatOhms?: number;  // R_fext (0 - 150 Ω)
  readonly mechanicalLoadTorqueNm: number; // Load Torque T_L in N·m (0 - 40 N·m)
}

export interface DcMotorResult {
  readonly speedRpm: number;
  readonly backEmfV: number;
  readonly armatureCurrentA: number;
  readonly fieldCurrentA: number;
  readonly lineCurrentA: number;
  readonly electricalPowerInKw: number;
  readonly mechanicalPowerOutKw: number;
  readonly efficiencyPct: number;
  readonly speedTorqueCharacteristics: readonly { torqueNm: number; speedRpm: number }[];
}

export const DEFAULT_DC_MOTOR_PARAMS: DcMotorParameters = {
  terminalVoltageV: 220,
  armatureResistanceOhms: 0.6,
  externalArmatureResOhms: 0,
  fieldResistanceOhms: 220,
  fieldRheostatOhms: 0,
  mechanicalLoadTorqueNm: 15,
};

export class DcMotorEngine {
  static compute(params: DcMotorParameters = DEFAULT_DC_MOTOR_PARAMS): DcMotorResult {
    const V = params.terminalVoltageV;
    const Ra_total = params.armatureResistanceOhms + (params.externalArmatureResOhms ?? 0);
    const Rf_total = params.fieldResistanceOhms + (params.fieldRheostatOhms ?? 0);
    const TL = params.mechanicalLoadTorqueNm;

    // Field current If and relative flux phi
    const If = V / Rf_total;
    // Base motor constant: at rated V=220, If=1A, rated speed N_0 = 1500 RPM (omega_0 = 157 rad/s)
    const kPhi_rated = 1.35; // N·m/A or V/(rad/s)
    const kPhi = kPhi_rated * (If / (V / params.fieldResistanceOhms));

    // Torque equilibrium: T_e = kPhi * Ia = T_L + T_friction
    const Tfriction = 1.2; // N·m rotational losses
    const Te = TL + Tfriction;
    const Ia = Te / Math.max(0.05, kPhi);

    // Back EMF
    const Eb = Math.max(0, V - Ia * Ra_total);
    // Speed in rad/s and RPM
    const omega = Eb / Math.max(0.05, kPhi);
    const speedRpm = (omega * 60) / (2 * Math.PI);

    // Currents and Powers
    const IL = Ia + If;
    const PinW = V * IL;
    const PoutW = TL * omega;
    const eff = PinW > 1e-4 ? (PoutW / PinW) * 100 : 0;

    // Speed vs Torque Curve (0 to 35 N·m)
    const curve: Array<{ torqueNm: number; speedRpm: number }> = [];
    for (let t = 0; t <= 35; t += 3.5) {
      const ia_t = (t + Tfriction) / Math.max(0.05, kPhi);
      const eb_t = Math.max(0, V - ia_t * Ra_total);
      const om_t = eb_t / Math.max(0.05, kPhi);
      const rpm_t = (om_t * 60) / (2 * Math.PI);
      curve.push({
        torqueNm: parseFloat(t.toFixed(1)),
        speedRpm: parseFloat(Math.max(0, rpm_t).toFixed(1)),
      });
    }

    return {
      speedRpm: parseFloat(Math.max(0, speedRpm).toFixed(1)),
      backEmfV: parseFloat(Eb.toFixed(2)),
      armatureCurrentA: parseFloat(Ia.toFixed(2)),
      fieldCurrentA: parseFloat(If.toFixed(2)),
      lineCurrentA: parseFloat(IL.toFixed(2)),
      electricalPowerInKw: parseFloat((PinW / 1000).toFixed(3)),
      mechanicalPowerOutKw: parseFloat((PoutW / 1000).toFixed(3)),
      efficiencyPct: parseFloat(Math.min(98, Math.max(0, eff)).toFixed(1)),
      speedTorqueCharacteristics: curve,
    };
  }
}

