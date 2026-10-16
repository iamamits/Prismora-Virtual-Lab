/**
 * Prismora Chemical Engineering: Fractional Distillation Column (McCabe-Thiele Method)
 * Multi-Stage Vapor-Liquid Equilibrium (VLE) Separation
 *
 * Equilibrium Curve:
 *   y = \frac{\alpha x}{1 + (\alpha - 1) x}
 *
 * Rectifying Operating Line (ROL):
 *   y = \frac{R}{R + 1} x + \frac{x_D}{R + 1}
 *
 * Feed Line (q-line):
 *   y = \frac{q}{q - 1} x - \frac{x_F}{q - 1} \quad (q \neq 1)
 *
 * Stripping Operating Line (SOL):
 *   Passes through (x_B, x_B) and the (x_q, y_q) intersection of ROL and q-line.
 */

export interface DistillationParameters {
  readonly relativeVolatility: number; // \alpha (e.g. 2.45 for Benzene-Toluene)
  readonly feedComposition: number;    // x_F (0.10 - 0.90, e.g. 0.40)
  readonly feedCompositionXf?: number; // alias
  readonly feedMoleFraction?: number;  // alias
  readonly distillatePurity: number;    // x_D (0.80 - 0.99, e.g. 0.95)
  readonly distillatePurityXd?: number; // alias
  readonly distillateMoleFraction?: number; // alias
  readonly bottomsPurity: number;       // x_B (0.01 - 0.20, e.g. 0.05)
  readonly bottomsPurityXb?: number;    // alias
  readonly bottomsMoleFraction?: number; // alias
  readonly refluxRatio: number;        // R = L/D (e.g. 2.0)
  readonly feedQuality: number;        // q (1.0 = saturated liquid, 0 = saturated vapor)
  readonly feedThermalConditionQ?: number; // alias
}

export interface DistillationStage {
  readonly stageNumber: number;
  readonly xEquilibrium: number;
  readonly yVapor: number;
  readonly xNext: number;
  readonly yNext: number;
  readonly isFeedStage: boolean;
  readonly x1: number;
  readonly y1: number;
  readonly x2: number;
  readonly y2: number;
  readonly x: number;
  readonly y: number;
}

export interface DistillationAnalysisResult {
  readonly numberOfStages: number;
  readonly theoreticalStages: number;
  readonly theoreticalTrays: number;
  readonly optimalFeedStage: number;
  readonly feedTrayLocation: number;
  readonly minimumRefluxRatio: number;
  readonly minimumStagesFenske: number;
  readonly minimumStages: number;
  readonly operatingRefluxRatio: number;
  readonly distillateRateMolH: number;
  readonly intersectionQ: { x: number; y: number };
  readonly stages: readonly DistillationStage[];
  readonly steppedTrays: readonly { x: number; y: number; nextX: number; nextY: number }[];
  readonly vlePoints: readonly { x: number; y: number }[];
  readonly equilibriumCurve: readonly { x: number; y: number }[];
  readonly rolPoints: readonly { x: number; y: number }[];
  readonly solPoints: readonly { x: number; y: number }[];
  readonly qLinePoints: readonly { x: number; y: number }[];
}

export const DEFAULT_DISTILLATION_PARAMS: DistillationParameters = {
  relativeVolatility: 2.5,
  feedComposition: 0.45,
  feedCompositionXf: 0.45,
  feedMoleFraction: 0.45,
  distillatePurity: 0.95,
  distillatePurityXd: 0.95,
  distillateMoleFraction: 0.95,
  bottomsPurity: 0.05,
  bottomsPurityXb: 0.05,
  bottomsMoleFraction: 0.05,
  refluxRatio: 2.2,
  feedQuality: 1.0, // Saturated liquid feed
  feedThermalConditionQ: 1.0,
};

/**
 * Vapor composition y from liquid composition x on VLE curve
 */
export function vleY(x: number, alpha: number): number {
  return (alpha * x) / (1 + (alpha - 1) * x);
}

/**
 * Liquid composition x from vapor composition y on VLE curve (inverse)
 */
export function vleX(y: number, alpha: number): number {
  return y / (alpha - (alpha - 1) * y);
}

/**
 * Full McCabe-Thiele stage-stepping analytical solver
 */
export function solveMcCabeThiele(params: DistillationParameters): DistillationAnalysisResult {
  const alpha = params.relativeVolatility;
  const xF = params.feedMoleFraction ?? params.feedCompositionXf ?? params.feedComposition;
  const xD = params.distillateMoleFraction ?? params.distillatePurityXd ?? params.distillatePurity;
  const xB = params.bottomsMoleFraction ?? params.bottomsPurityXb ?? params.bottomsPurity;
  const R = params.refluxRatio;
  const q = params.feedThermalConditionQ ?? params.feedQuality;

  // Calculate ROL slope and intercept: y = m_r * x + c_r
  const mR = R / (R + 1);
  const cR = xD / (R + 1);

  // Calculate (x_q, y_q) intersection of ROL and q-line
  let xQ: number;
  let yQ: number;

  if (Math.abs(q - 1.0) < 1e-4) {
    // Saturated liquid feed: vertical q-line at x = xF
    xQ = xF;
    yQ = mR * xF + cR;
  } else if (Math.abs(q) < 1e-4) {
    // Saturated vapor feed: horizontal q-line at y = xF
    yQ = xF;
    xQ = (yQ - cR) / mR;
  } else {
    // General feed: y = (q/(q-1))*x - xF/(q-1)
    const mQ = q / (q - 1);
    const cQ = -xF / (q - 1);
    xQ = (cQ - cR) / (mR - mQ);
    yQ = mR * xQ + cR;
  }

  // SOL connects (xB, xB) to (xQ, yQ)
  const mS = (yQ - xB) / (xQ - xB);

  // Minimum Reflux Ratio R_min (pinch with equilibrium curve)
  // Solve intersection of q-line with VLE curve
  let xPinch: number;
  let yPinch: number;
  if (Math.abs(q - 1.0) < 1e-4) {
    xPinch = xF;
    yPinch = vleY(xF, alpha);
  } else {
    // Quadratic equation for pinch point
    // (alpha*x) / (1 + (alpha-1)*x) = mQ*x + cQ
    // For simplicity, sample along q-line from xF towards VLE
    let bestX = xF;
    let minDiff = 1e9;
    for (let sample = 0; sample <= 1; sample += 0.002) {
      const qY = (q / (q - 1)) * (sample - xF) + xF;
      const eqY = vleY(sample, alpha);
      const diff = Math.abs(qY - eqY);
      if (diff < minDiff) {
        minDiff = diff;
        bestX = sample;
      }
    }
    xPinch = bestX;
    yPinch = vleY(bestX, alpha);
  }

  const Rmin = Math.max(0.1, (xD - yPinch) / (yPinch - xPinch));

  // Fenske Minimum Stages at Total Reflux
  const fenskeNumerator = Math.log((xD / (1 - xD)) * ((1 - xB) / xB));
  const Nmin = fenskeNumerator / Math.log(alpha);

  // Step off stages from xD down to xB
  const stages: DistillationStage[] = [];
  let currentY = xD;
  let currentX = xD;
  let stageCount = 0;
  let optimalFeedStage = 1;
  let feedStageFound = false;

  const maxSafetySteps = 50;

  while (currentX > xB && stageCount < maxSafetySteps) {
    stageCount++;

    // Horizontal step to VLE curve
    const xEquil = vleX(currentY, alpha);

    // Check if feed stage reached
    if (!feedStageFound && xEquil <= xQ) {
      optimalFeedStage = stageCount;
      feedStageFound = true;
    }

    // Vertical step down to operating line
    let nextY: number;
    if (xEquil > xQ) {
      // Use Rectifying Operating Line (ROL)
      nextY = mR * xEquil + cR;
    } else {
      // Use Stripping Operating Line (SOL)
      nextY = mS * (xEquil - xB) + xB;
    }

    stages.push({
      stageNumber: stageCount,
      xEquilibrium: parseFloat(xEquil.toFixed(4)),
      yVapor: parseFloat(currentY.toFixed(4)),
      xNext: parseFloat(xEquil.toFixed(4)),
      yNext: parseFloat(Math.max(xB, nextY).toFixed(4)),
      isFeedStage: stageCount === optimalFeedStage,
      x1: parseFloat(currentX.toFixed(4)),
      y1: parseFloat(currentY.toFixed(4)),
      x2: parseFloat(xEquil.toFixed(4)),
      y2: parseFloat(Math.max(xB, nextY).toFixed(4)),
      x: parseFloat(currentX.toFixed(4)),
      y: parseFloat(currentY.toFixed(4)),
    });

    currentX = xEquil;
    currentY = Math.max(xB, nextY);
  }

  // Generate plot polyline points
  const vlePoints: Array<{ x: number; y: number }> = [];
  for (let i = 0; i <= 100; i++) {
    const x = i / 100;
    vlePoints.push({ x, y: parseFloat(vleY(x, alpha).toFixed(4)) });
  }

  // ROL from (xQ, yQ) to (xD, xD)
  const rolPoints = [
    { x: parseFloat(xQ.toFixed(4)), y: parseFloat(yQ.toFixed(4)) },
    { x: xD, y: xD },
  ];

  // SOL from (xB, xB) to (xQ, yQ)
  const solPoints = [
    { x: xB, y: xB },
    { x: parseFloat(xQ.toFixed(4)), y: parseFloat(yQ.toFixed(4)) },
  ];

  // Q-line from (xF, xF) to (xQ, yQ)
  const qLinePoints = [
    { x: xF, y: xF },
    { x: parseFloat(xQ.toFixed(4)), y: parseFloat(yQ.toFixed(4)) },
  ];

  const feedFlowF = 100;
  const distillateRateMolH = Math.max(0, (feedFlowF * (xF - xB)) / Math.max(1e-4, xD - xB));

  const steppedTrays = stages.map((s) => ({
    x: s.x1,
    y: s.y1,
    nextX: s.x2,
    nextY: s.y2,
  }));

  return {
    numberOfStages: stageCount,
    theoreticalStages: stageCount,
    theoreticalTrays: stageCount,
    optimalFeedStage,
    feedTrayLocation: optimalFeedStage,
    minimumRefluxRatio: parseFloat(Rmin.toFixed(2)),
    minimumStagesFenske: parseFloat(Nmin.toFixed(2)),
    minimumStages: parseFloat(Nmin.toFixed(2)),
    operatingRefluxRatio: R,
    distillateRateMolH: parseFloat(distillateRateMolH.toFixed(1)),
    intersectionQ: { x: parseFloat(xQ.toFixed(4)), y: parseFloat(yQ.toFixed(4)) },
    stages,
    steppedTrays,
    vlePoints,
    equilibriumCurve: vlePoints,
    rolPoints,
    solPoints,
    qLinePoints,
  };
}

export class DistillationEngine {
  static compute(params: DistillationParameters): DistillationAnalysisResult {
    return solveMcCabeThiele(params);
  }
}
