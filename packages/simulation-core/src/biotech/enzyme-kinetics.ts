/**
 * Prismora Biotechnology & Bioengineering: Enzyme Kinetics Studio
 * Michaelis-Menten Hyperbolic Kinetics & Lineweaver-Burk Double-Reciprocal Transformations
 *
 * Rate Equation:
 *   v_0 = \frac{V_{\max} [S]}{K_m + [S]}
 *
 * Lineweaver-Burk Transformation:
 *   \frac{1}{v_0} = \left(\frac{K_m}{V_{\max}}\right) \frac{1}{[S]} + \frac{1}{V_{\max}}
 *
 * Enzyme Inhibition Models:
 *   Competitive:      K_m' = K_m (1 + [I]/K_i),      V_{\max}' = V_{\max}
 *   Non-Competitive:  V_{\max}' = V_{\max} / (1 + [I]/K_i),  K_m' = K_m
 *   Uncompetitive:    K_m' = K_m / (1 + [I]/K_i),    V_{\max}' = V_{\max} / (1 + [I]/K_i)
 */

export type InhibitionType = 'none' | 'competitive' | 'non_competitive' | 'uncompetitive';

export interface EnzymeKineticsParameters {
  readonly vMax: number;          // Maximum velocity V_max in umol/(L*min) (e.g. 100)
  readonly maximumVelocityVmax?: number;
  readonly kM?: number;            // Michaelis constant K_m in mM (e.g. 5.0)
  readonly kmMm?: number;          // Alias for kM
  readonly michaelisConstantKm?: number;
  readonly substrateConcentration?: number; // Current [S] in mM (e.g. 2.0)
  readonly currentSubstrateMm?: number;     // Alias for substrateConcentration
  readonly inhibitionType?: InhibitionType;
  readonly inhibitorConcentration?: number; // [I] in mM (e.g. 1.5)
  readonly inhibitorConcentrationMm?: number;
  readonly inhibitorConstantKi?: number;    // K_i in mM (e.g. 2.0)
  readonly temperatureC?: number;          // Temperature (e.g. 37 C)
  readonly ph?: number;                    // pH (e.g. 7.4)
}

export type EnzymeParameters = EnzymeKineticsParameters;

export interface KineticsDataPoint {
  readonly substrate: number;     // [S] in mM
  readonly velocity: number;      // v_0 in umol/(L*min)
  readonly invSubstrate: number;  // 1 / [S]
  readonly invVelocity: number;   // 1 / v_0
}

export interface EnzymeCurvePoint {
  readonly s: number;
  readonly v: number;
  readonly substrateMm: number;
  readonly velocity: number;
}

export interface EnzymeAnalysisResult {
  readonly currentVelocity: number;
  readonly apparentVMax: number;
  readonly apparentVmax: number; // alias
  readonly vmaxApparentMicroMPerMin: number;
  readonly apparentKM: number;
  readonly apparentKm: number; // alias
  readonly kmApparentMm: number;
  readonly lineweaverBurkSlope: number;
  readonly lineweaverBurkYIntercept: number;
  readonly lineweaverBurkXIntercept: number;
  readonly saturationFraction: number; // v_0 / V_max
  readonly turnoverNumberKcatSec: number;
  readonly catalyticEfficiencyPerMSec: number;
  readonly dataPoints: readonly KineticsDataPoint[];
  readonly curvePoints: readonly EnzymeCurvePoint[];
  readonly saturationCurve: readonly { substrateConcentrationMm: number; s: number; velocityMicroMPerMin: number; v: number }[];
  readonly lineweaverPoints: readonly { invS: number; invV: number }[];
}

export const DEFAULT_ENZYME_PARAMS: EnzymeKineticsParameters = {
  vMax: 120,
  maximumVelocityVmax: 120,
  kM: 4.5,
  kmMm: 4.5,
  michaelisConstantKm: 4.5,
  substrateConcentration: 5.0,
  currentSubstrateMm: 5.0,
  inhibitionType: 'none',
  inhibitorConstantKi: 2.0,
  temperatureC: 37,
  ph: 7.4,
};

/**
 * Solve analytical Michaelis-Menten kinetics with inhibition
 */
export function solveEnzymeKinetics(params: EnzymeKineticsParameters): EnzymeAnalysisResult {
  const kM = params.michaelisConstantKm !== undefined && params.michaelisConstantKm !== DEFAULT_ENZYME_PARAMS.michaelisConstantKm
    ? params.michaelisConstantKm
    : (params.kM ?? params.kmMm ?? params.michaelisConstantKm ?? 4.5);
  const S = params.substrateConcentration ?? params.currentSubstrateMm ?? 5.0;
  const vMax = params.maximumVelocityVmax !== undefined && params.maximumVelocityVmax !== DEFAULT_ENZYME_PARAMS.maximumVelocityVmax
    ? params.maximumVelocityVmax
    : (params.vMax ?? params.maximumVelocityVmax ?? 120);
  const inhibitionType = params.inhibitionType ?? 'none';
  const I = params.inhibitorConcentrationMm !== undefined && params.inhibitorConcentrationMm !== 0
    ? params.inhibitorConcentrationMm
    : (params.inhibitorConcentration ?? 0);
  const Ki = params.inhibitorConstantKi ?? 2.0;

  // Compute apparent parameters based on inhibition type
  const alpha = 1 + (I > 0 && Ki > 0 ? I / Ki : 0);
  let appVmax = vMax;
  let appKm = kM;

  switch (inhibitionType) {
    case 'competitive':
      appKm = kM * alpha;
      appVmax = vMax;
      break;
    case 'non_competitive':
      appVmax = vMax / alpha;
      appKm = kM;
      break;
    case 'uncompetitive':
      appVmax = vMax / alpha;
      appKm = kM / alpha;
      break;
    case 'none':
    default:
      appVmax = vMax;
      appKm = kM;
      break;
  }

  // Current velocity
  const currentVelocity = (appVmax * S) / (appKm + S);
  const saturationFraction = currentVelocity / appVmax;

  // Lineweaver-Burk metrics: 1/v = (Km/Vmax) * (1/S) + 1/Vmax
  const lineweaverBurkSlope = appKm / appVmax;
  const lineweaverBurkYIntercept = 1 / appVmax;
  const lineweaverBurkXIntercept = -1 / appKm;

  // Sample data points representing laboratory assays
  const sampleConcentrations = [0.5, 1.0, 2.0, 4.0, 8.0, 15.0, 25.0];
  const dataPoints: KineticsDataPoint[] = sampleConcentrations.map((s) => {
    const v = (appVmax * s) / (appKm + s);
    return {
      substrate: s,
      velocity: parseFloat(v.toFixed(2)),
      invSubstrate: parseFloat((1 / s).toFixed(4)),
      invVelocity: parseFloat((1 / v).toFixed(5)),
    };
  });

  // Smooth Michaelis-Menten hyperbolic curve
  const curvePoints: Array<EnzymeCurvePoint> = [];
  const maxS = 50;
  for (let s = 0; s <= maxS; s += 0.5) {
    const v = (appVmax * s) / (appKm + s);
    curvePoints.push({
      s,
      v: parseFloat(v.toFixed(2)),
      substrateMm: s,
      velocity: parseFloat(v.toFixed(2)),
    });
  }

  const saturationCurve = curvePoints.map((c) => ({
    substrateConcentrationMm: c.s,
    s: c.s,
    velocityMicroMPerMin: c.v,
    v: c.v,
  }));

  const kcat = (appVmax / 60) * 1.5;
  const catEff = (kcat / (appKm * 1e-3)) * 1.0;

  // Lineweaver-Burk line: from negative x-intercept to 1/0.5
  const lineweaverPoints: Array<{ invS: number; invV: number }> = [
    {
      invS: parseFloat(lineweaverBurkXIntercept.toFixed(4)),
      invV: 0,
    },
    {
      invS: 0,
      invV: parseFloat(lineweaverBurkYIntercept.toFixed(5)),
    },
    {
      invS: 2.0, // 1 / 0.5 mM
      invV: parseFloat((lineweaverBurkSlope * 2.0 + lineweaverBurkYIntercept).toFixed(5)),
    },
  ];

  return {
    currentVelocity: parseFloat(currentVelocity.toFixed(2)),
    apparentVMax: parseFloat(appVmax.toFixed(2)),
    apparentVmax: parseFloat(appVmax.toFixed(2)),
    vmaxApparentMicroMPerMin: parseFloat(appVmax.toFixed(2)),
    apparentKM: parseFloat(appKm.toFixed(2)),
    apparentKm: parseFloat(appKm.toFixed(2)),
    kmApparentMm: parseFloat(appKm.toFixed(2)),
    lineweaverBurkSlope: parseFloat(lineweaverBurkSlope.toFixed(4)),
    lineweaverBurkYIntercept: parseFloat(lineweaverBurkYIntercept.toFixed(5)),
    lineweaverBurkXIntercept: parseFloat(lineweaverBurkXIntercept.toFixed(4)),
    saturationFraction: parseFloat(saturationFraction.toFixed(3)),
    turnoverNumberKcatSec: parseFloat(kcat.toFixed(1)),
    catalyticEfficiencyPerMSec: parseFloat(catEff.toFixed(1)),
    dataPoints,
    curvePoints,
    saturationCurve,
    lineweaverPoints,
  };
}

export class EnzymeKineticsEngine {
  static compute(params: EnzymeKineticsParameters): EnzymeAnalysisResult {
    return solveEnzymeKinetics(params);
  }
}
