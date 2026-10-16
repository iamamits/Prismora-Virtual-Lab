/**
 * Bernoulli's Theorem & Venturimeter Flow Measurement Model
 * Benchmark: IIT Kanpur & NITK Surathkal Fluid Mechanics Virtual Labs
 *
 * Governing Equations:
 * 1. Continuity: A1 * v1 = A2 * v2 = Q
 * 2. Bernoulli: P1 / (rho * g) + v1^2 / (2g) + z1 = P2 / (rho * g) + v2^2 / (2g) + z2
 * 3. Theoretical Discharge: Q_theo = (A1 * A2 / sqrt(A1^2 - A2^2)) * sqrt(2 * g * delta_h)
 * 4. Actual Discharge: Q_act = C_d * Q_theo
 */

export interface VenturiParameters {
  /** Inlet pipe diameter d1 in mm (e.g., 25 - 50 mm) */
  readonly inletDiameterMm: number;
  /** Throat diameter d2 in mm (e.g., 10 - 25 mm) */
  readonly throatDiameterMm: number;
  /** Flow rate control / valve opening (0.1 to 1.0) */
  readonly valveOpening: number;
  /** Fluid type: 'water' | 'kerosene' | 'mercury_manometer' */
  readonly fluidType: 'water' | 'kerosene';
  /** Coefficient of discharge Cd (typically 0.96 - 0.98 for venturi) */
  readonly dischargeCoefficient: number;
  readonly dischargeCoeffCd?: number;
  readonly inletVelocityMps?: number;
}

export interface VenturiMeasurementPoint {
  readonly positionMm: number;
  readonly diameterMm: number;
  readonly areaM2: number;
  readonly velocityMs: number;
  readonly pressureHeadCm: number;
  readonly dynamicHeadCm: number;
  readonly totalHeadCm: number;
}

export interface VenturiResult {
  readonly inletAreaM2: number;
  readonly throatAreaM2: number;
  readonly areaRatio: number;
  readonly deltaHCm: number;
  readonly differentialHeadM: number;
  readonly inletPressureHeadM: number;
  readonly throatPressureHeadM: number;
  readonly theoreticalDischargeM3s: number;
  readonly actualDischargeM3s: number;
  readonly actualDischargeLps: number;
  readonly inletVelocityMs: number;
  readonly throatVelocityMs: number;
  readonly throatVelocityMps: number;
  readonly reynoldsNumber: number;
  readonly reynoldsNumberThroat: number;
  readonly profilePoints: readonly VenturiMeasurementPoint[];
}

export const DEFAULT_VENTURI_PARAMS: VenturiParameters = {
  inletDiameterMm: 28,
  throatDiameterMm: 14,
  valveOpening: 0.65,
  fluidType: 'water',
  dischargeCoefficient: 0.97,
};

export class VenturiFlowEngine {
  private static readonly G = 9.80665; // m/s^2

  static compute(params: VenturiParameters): VenturiResult {
    const d1 = params.inletDiameterMm / 1000; // m
    const d2 = params.throatDiameterMm / 1000; // m
    const a1 = (Math.PI * d1 * d1) / 4;
    const a2 = (Math.PI * d2 * d2) / 4;

    // Density and dynamic viscosity
    const rho = params.fluidType === 'water' ? 998.2 : 820.0;
    const mu = params.fluidType === 'water' ? 0.001002 : 0.00164;

    // Head difference delta_h (in cm of fluid) scaled with valve opening
    // At valve 1.0, maximum differential head ~ 45 cm
    const deltaHCm = Math.max(0.5, 45.0 * Math.pow(params.valveOpening, 1.8));
    const deltaHMeters = deltaHCm / 100;

    // Q_theo = (a1 * a2 / sqrt(a1^2 - a2^2)) * sqrt(2 * g * delta_h)
    const areaFactor = (a1 * a2) / Math.sqrt(Math.max(1e-9, a1 * a1 - a2 * a2));
    const qTheo = areaFactor * Math.sqrt(2 * this.G * deltaHMeters);
    const qAct = params.dischargeCoefficient * qTheo;
    const qLps = qAct * 1000; // Litres per second

    const v1 = qAct / a1;
    const v2 = qAct / a2;

    const reynolds = (rho * v1 * d1) / mu;

    // Pressure profile along the converging-diverging venturi pipe (7 measurement stations)
    // Stations: 0mm (inlet), 30mm (converging), 60mm (throat), 90mm (diverging 1), 120mm (diverging 2), 150mm (diverging 3), 180mm (exit)
    const stationPositions = [0, 25, 50, 75, 110, 145, 180];
    const inletTotalHeadCm = 80; // Baseline piezometric datum

    const profilePoints: VenturiMeasurementPoint[] = stationPositions.map((pos) => {
      let diamMm: number;
      if (pos <= 50) {
        // Converging section from inlet to throat
        const t = pos / 50;
        diamMm = params.inletDiameterMm * (1 - t) + params.throatDiameterMm * t;
      } else {
        // Diverging section from throat to exit
        const t = (pos - 50) / 130;
        diamMm = params.throatDiameterMm * (1 - t) + params.inletDiameterMm * t;
      }

      const dMeters = diamMm / 1000;
      const area = (Math.PI * dMeters * dMeters) / 4;
      const vel = qAct / area;
      const dynHeadCm = ((vel * vel) / (2 * this.G)) * 100;
      // Head loss in diverging section
      const lossFactor = pos > 50 ? 0.05 * ((pos - 50) / 130) * deltaHCm : 0;
      const piezometricHeadCm = inletTotalHeadCm - dynHeadCm - lossFactor;
      const totalHead = piezometricHeadCm + dynHeadCm;

      return {
        positionMm: pos,
        diameterMm: Number(diamMm.toFixed(1)),
        areaM2: area,
        velocityMs: Number(vel.toFixed(3)),
        pressureHeadCm: Number(piezometricHeadCm.toFixed(1)),
        dynamicHeadCm: Number(dynHeadCm.toFixed(2)),
        totalHeadCm: Number(totalHead.toFixed(1)),
      };
    });

    return {
      inletAreaM2: a1,
      throatAreaM2: a2,
      areaRatio: Number((a1 / a2).toFixed(2)),
      deltaHCm: Number(deltaHCm.toFixed(2)),
      differentialHeadM: Number((deltaHCm / 100).toFixed(3)),
      inletPressureHeadM: Number((inletTotalHeadCm / 100).toFixed(3)),
      throatPressureHeadM: Number(((inletTotalHeadCm - deltaHCm) / 100).toFixed(3)),
      theoreticalDischargeM3s: qTheo,
      actualDischargeM3s: qAct,
      actualDischargeLps: Number(qLps.toFixed(3)),
      inletVelocityMs: Number(v1.toFixed(3)),
      throatVelocityMs: Number(v2.toFixed(3)),
      throatVelocityMps: Number(v2.toFixed(3)),
      reynoldsNumber: Math.round(reynolds),
      reynoldsNumberThroat: Math.round(reynolds),
      profilePoints,
    };
  }
}
