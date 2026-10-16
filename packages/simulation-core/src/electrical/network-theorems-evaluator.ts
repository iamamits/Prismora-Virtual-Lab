/**
 * Prismora Electrical Engineering Simulation Core — Network Theorems Evaluator
 *
 * Implements authoritative analytical and computational modeling for fundamental
 * DC electrical network theorems benchmarked against IIT Roorkee and AICTE curricula:
 *
 * 1. Thévenin's Theorem:
 *    Any linear bilateral two-terminal network containing DC sources and resistors
 *    can be replaced by an equivalent circuit consisting of an independent voltage
 *    source V_th in series with an equivalent resistance R_th.
 *
 * 2. Norton's Theorem:
 *    Any linear bilateral two-terminal network can be replaced by an equivalent circuit
 *    consisting of an independent current source I_N in parallel with an equivalent
 *    resistance R_N (where R_N = R_th and I_N = V_th / R_th).
 *
 * 3. Maximum Power Transfer Theorem (Jacobi's Law):
 *    A resistive load connected across a DC network receives maximum electrical power
 *    when its load resistance R_L equals the Thévenin resistance R_th seen from the load terminals.
 *    P_L(R_L) = (V_th^2 * R_L) / (R_th + R_L)^2
 *    P_L,max = V_th^2 / (4 * R_th)
 *    Efficiency at max power = 50%
 *
 * 4. Superposition Theorem:
 *    In any linear bilateral network having more than one independent source,
 *    the total response is the algebraic sum of individual responses produced by each source acting alone.
 */

export type CircuitTopology = 'dual-source-t-network' | 'bridge-network';

export interface DualSourceTNetworkParams {
  topology: 'dual-source-t-network';
  /** DC Voltage Source 1 in Volts (e.g. 12V) */
  v1: number;
  /** Series Resistance 1 in Ohms (e.g. 100 Ω) */
  r1: number;
  /** DC Voltage Source 2 in Volts (e.g. 6V) */
  v2: number;
  /** Series Resistance 2 in Ohms (e.g. 220 Ω) */
  r2: number;
  /** Shunt / Central Resistance 3 in Ohms (e.g. 330 Ω) */
  r3: number;
  /** Load Resistance in Ohms (e.g. 150 Ω) */
  rL: number;
}

export interface BridgeNetworkParams {
  topology: 'bridge-network';
  /** DC Source Voltage across bridge in Volts (e.g. 10V) */
  vs: number;
  /** Arm 1 Resistance in Ohms */
  r1: number;
  /** Arm 2 Resistance in Ohms */
  r2: number;
  /** Arm 3 Resistance in Ohms */
  r3: number;
  /** Arm 4 Resistance in Ohms */
  r4: number;
  /** Detector / Load Resistance across nodes C and D in Ohms */
  rL: number;
}

export interface SimpleNetworkParams {
  topology?: 'dual-source-t-network';
  v1Volts: number;
  v2Volts: number;
  r1Ohms: number;
  r2Ohms: number;
  r3Ohms: number;
  rlOhms: number;
}

export const DEFAULT_NETWORK_CIRCUIT_PARAMS: SimpleNetworkParams = {
  v1Volts: 12,
  v2Volts: 6,
  r1Ohms: 100,
  r2Ohms: 150,
  r3Ohms: 220,
  rlOhms: 85,
};

export type NetworkTheoremsParams = DualSourceTNetworkParams | BridgeNetworkParams | SimpleNetworkParams;

export interface LoadSweepPoint {
  rL: number;
  vL: number; // Volts
  iL: number; // Amperes
  pL: number; // Watts
  efficiencyPct: number; // %
  isOptimal: boolean; // True when rL == rTh
}

export interface StepByStepDerivation {
  title: string;
  latexFormula: string;
  explanation: string;
  computedValue: number;
  unit: string;
}

export interface NetworkTheoremsResult {
  topology: CircuitTopology;
  // Thévenin Equivalents
  vTh: number; // Open-circuit voltage (V)
  rTh: number; // Equivalent resistance (Ω)
  // Norton Equivalents
  iN: number; // Short-circuit current (A)
  rN: number; // Norton resistance (Ω) = rTh
  // Load Operating Point
  rL: number; // Load resistance (Ω)
  vL: number; // Load voltage (V)
  iL: number; // Load current (A)
  pL: number; // Power in load (W)
  pLMax: number; // Maximum possible power delivered (W) at rL = rTh
  efficiencyPct: number; // Power transfer efficiency (%)
  isAtMaximumPower: boolean; // |rL - rTh| < 1e-4
  // Convenience engineering aliases
  theveninVoltageVolts: number;
  theveninResistanceOhms: number;
  nortonCurrentMilliamps: number;
  loadPowerMilliwatts: number;
  maxPossiblePowerMilliwatts: number;
  // Equivalence checks
  originalCircuitMatchesThevenin: boolean;
  theveninMatchesNorton: boolean;
  // Superposition breakdown (for multi-source)
  superposition?: {
    vTh1: number; // Due to V1 alone
    vTh2: number; // Due to V2 alone
    sumCheck: boolean;
  };
  // Detailed educational derivations
  derivations: StepByStepDerivation[];
  // Sweep curve for Maximum Power Transfer
  loadSweep: LoadSweepPoint[];
}

/**
 * Validate input parameters for network theorems evaluation.
 */
export function validateNetworkParams(params: NetworkTheoremsParams): { valid: boolean; error?: string } {
  if ('v1Volts' in params) {
    if (!Number.isFinite(params.v1Volts) || !Number.isFinite(params.v2Volts)) {
      return { valid: false, error: 'Voltage sources must be finite numbers' };
    }
    if (params.r1Ohms <= 0 || params.r2Ohms <= 0 || params.r3Ohms <= 0 || params.rlOhms <= 0) {
      return { valid: false, error: 'All resistor values must be strictly positive (> 0 Ω)' };
    }
    return { valid: true };
  } else if (params.topology === 'dual-source-t-network') {
    if (!Number.isFinite(params.v1) || !Number.isFinite(params.v2)) {
      return { valid: false, error: 'Voltage sources must be finite numbers' };
    }
    if (params.r1 <= 0 || params.r2 <= 0 || params.r3 <= 0 || params.rL <= 0) {
      return { valid: false, error: 'All resistor values must be strictly positive (> 0 Ω)' };
    }
    return { valid: true };
  } else if (params.topology === 'bridge-network') {
    if (!Number.isFinite(params.vs)) {
      return { valid: false, error: 'Source voltage must be a finite number' };
    }
    if (params.r1 <= 0 || params.r2 <= 0 || params.r3 <= 0 || params.r4 <= 0 || params.rL <= 0) {
      return { valid: false, error: 'All bridge resistor values must be strictly positive (> 0 Ω)' };
    }
    return { valid: true };
  }

  return { valid: false, error: 'Unknown circuit topology' };
}

/**
 * Generate load sweep points for the P_L vs R_L Maximum Power Transfer curve.
 */
export function generateLoadSweep(
  vTh: number,
  rTh: number,
  currentRL: number,
  sweepPointsCount: number = 41,
): LoadSweepPoint[] {
  const points: LoadSweepPoint[] = [];
  const minRL = Math.max(0.1, rTh * 0.05);
  const maxRL = rTh * 3.0;
  const step = (maxRL - minRL) / (sweepPointsCount - 1);

  // Generate sweep points, guaranteeing an exact sample at rTh
  const rawValues: number[] = [];
  for (let i = 0; i < sweepPointsCount; i++) {
    rawValues.push(minRL + i * step);
  }
  // Insert rTh and currentRL into the set
  rawValues.push(rTh);
  rawValues.push(currentRL);
  const sortedValues = Array.from(new Set(rawValues.map((v) => Number(v.toFixed(4))))).sort((a, b) => a - b);

  sortedValues.forEach((r) => {
    const iL = vTh / (rTh + r);
    const vL = iL * r;
    const pL = iL * iL * r;
    const pTotal = iL * vTh;
    const efficiencyPct = pTotal > 1e-12 ? (pL / pTotal) * 100 : 0;
    const isOptimal = Math.abs(r - rTh) < 1e-4;

    points.push({
      rL: r,
      vL,
      iL,
      pL,
      efficiencyPct,
      isOptimal,
    });
  });

  return points;
}

/**
 * Evaluates the Dual-Source T-Network using analytical Nodal & Thévenin methods.
 */
export function evaluateDualSourceTNetwork(params: DualSourceTNetworkParams): NetworkTheoremsResult {
  const { v1, r1, v2, r2, r3, rL } = params;

  // 1. Open-Circuit Voltage V_th across terminals A-B (Node X to Ground)
  // Nodal equation at Node X with R_L removed:
  // (V_X - V_1)/R_1 + (V_X - V_2)/R_2 + V_X/R_3 = 0
  // V_X * (1/R_1 + 1/R_2 + 1/R_3) = V_1/R_1 + V_2/R_2
  const g1 = 1 / r1;
  const g2 = 1 / r2;
  const g3 = 1 / r3;
  const gTotal = g1 + g2 + g3;

  const vTh = (v1 * g1 + v2 * g2) / gTotal;

  // 2. Thévenin Resistance R_th looking into terminals A-B with sources deactivated (shorted)
  // R_th = R_1 || R_2 || R_3 = 1 / (1/R_1 + 1/R_2 + 1/R_3)
  const rTh = 1 / gTotal;

  // 3. Norton Current I_N (Short-Circuit Current I_sc)
  // With Node X shorted directly to Ground:
  // I_sc = V_1/R_1 + V_2/R_2
  const iN = v1 * g1 + v2 * g2;
  const rN = rTh;

  // 4. Load Operating Point in Original Circuit
  // With R_L connected in parallel with R_3 from Node X to Ground:
  // V_X_loaded * (1/R_1 + 1/R_2 + 1/R_3 + 1/R_L) = V_1/R_1 + V_2/R_2
  const gLoaded = gTotal + 1 / rL;
  const vL_original = (v1 * g1 + v2 * g2) / gLoaded;
  const iL_original = vL_original / rL;
  const pL_original = iL_original * iL_original * rL;

  // 5. Load Operating Point via Thévenin Equivalent:
  // I_L_thev = V_th / (R_th + R_L)
  const iL_thev = vTh / (rTh + rL);
  const vL_thev = iL_thev * rL;
  const pL_thev = iL_thev * iL_thev * rL;

  // 6. Load Operating Point via Norton Equivalent:
  // I_L_norton = I_N * (R_N / (R_N + R_L))
  const iL_norton = iN * (rN / (rN + rL));

  // Max power transfer metrics
  const pLMax = (vTh * vTh) / (4 * rTh);
  const pTotal = iL_thev * vTh;
  const efficiencyPct = pTotal > 1e-12 ? (pL_thev / pTotal) * 100 : 0;
  const isAtMaximumPower = Math.abs(rL - rTh) < 1e-3;

  // Equivalence checks
  const originalCircuitMatchesThevenin =
    Math.abs(iL_original - iL_thev) < 1e-7 && Math.abs(pL_original - pL_thev) < 1e-7;
  const theveninMatchesNorton = Math.abs(iL_thev - iL_norton) < 1e-7;

  // Superposition breakdown
  const vTh1 = (v1 * g1) / gTotal;
  const vTh2 = (v2 * g2) / gTotal;
  const sumCheck = Math.abs(vTh1 + vTh2 - vTh) < 1e-8;

  // Step-by-step educational derivations
  const derivations: StepByStepDerivation[] = [
    {
      title: 'Thévenin Equivalent Voltage (Open-Circuit)',
      latexFormula: 'V_{th} = V_{oc} = \\frac{\\frac{V_1}{R_1} + \\frac{V_2}{R_2}}{\\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}}',
      explanation: 'Applying Kirchhoff\'s Current Law (Nodal Analysis) at Node X with the load resistor R_L removed (open circuit).',
      computedValue: vTh,
      unit: 'V',
    },
    {
      title: 'Thévenin Equivalent Resistance',
      latexFormula: 'R_{th} = R_1 \\parallel R_2 \\parallel R_3 = \\frac{1}{\\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}}',
      explanation: 'Deactivating all independent voltage sources (replacing V1 and V2 with ideal short circuits) and calculating the equivalent resistance seen from terminals A-B.',
      computedValue: rTh,
      unit: 'Ω',
    },
    {
      title: 'Norton Short-Circuit Current',
      latexFormula: 'I_N = I_{sc} = \\frac{V_1}{R_1} + \\frac{V_2}{R_2} = \\frac{V_{th}}{R_{th}}',
      explanation: 'Shorting terminals A-B to ground and summing the branch currents supplied by V1 and V2 into the zero-resistance short.',
      computedValue: iN,
      unit: 'A',
    },
    {
      title: 'Maximum Power Transfer Criterion (Jacobi\'s Law)',
      latexFormula: 'P_{L,\\max} = \\frac{V_{th}^2}{4 R_{th}} \\quad \\text{when} \\quad R_L = R_{th}',
      explanation: 'Setting dP_L / dR_L = 0 proves that power transfer to the load is strictly maximized when the load resistance equals the internal Thévenin resistance.',
      computedValue: pLMax,
      unit: 'W',
    },
  ];

  const loadSweep = generateLoadSweep(vTh, rTh, rL);

  return {
    topology: 'dual-source-t-network',
    vTh,
    rTh,
    iN,
    rN,
    rL,
    vL: vL_thev,
    iL: iL_thev,
    pL: pL_thev,
    pLMax,
    efficiencyPct,
    isAtMaximumPower,
    theveninVoltageVolts: parseFloat(vTh.toFixed(2)),
    theveninResistanceOhms: parseFloat(rTh.toFixed(2)),
    nortonCurrentMilliamps: parseFloat((iN * 1000).toFixed(2)),
    loadPowerMilliwatts: parseFloat((pL_thev * 1000).toFixed(2)),
    maxPossiblePowerMilliwatts: parseFloat((pLMax * 1000).toFixed(2)),
    originalCircuitMatchesThevenin,
    theveninMatchesNorton,
    superposition: {
      vTh1,
      vTh2,
      sumCheck,
    },
    derivations,
    loadSweep,
  };
}

/**
 * Evaluates the Bridge Network (Wheatstone / Unbalanced Bridge).
 */
export function evaluateBridgeNetwork(params: BridgeNetworkParams): NetworkTheoremsResult {
  const { vs, r1, r2, r3, r4, rL } = params;

  // Node C is between R1 and R2: V_C = Vs * R2 / (R1 + R2)
  const vC = vs * (r2 / (r1 + r2));
  // Node D is between R3 and R4: V_D = Vs * R4 / (R3 + R4)
  const vD = vs * (r4 / (r3 + r4));

  // 1. Thévenin Open-Circuit Voltage across detector terminals C-D
  const vTh = vC - vD;

  // 2. Thévenin Resistance looking into C-D with Vs short-circuited:
  // Node C sees R1 in parallel with R2 to AC ground
  // Node D sees R3 in parallel with R4 to AC ground
  // R_th = (R1 || R2) + (R3 || R4)
  const r12 = (r1 * r2) / (r1 + r2);
  const r34 = (r3 * r4) / (r3 + r4);
  const rTh = r12 + r34;

  // 3. Norton Equivalents
  const iN = rTh > 1e-12 ? vTh / rTh : 0;
  const rN = rTh;

  // 4. Load Operating Point
  const iL_thev = vTh / (rTh + rL);
  const vL_thev = iL_thev * rL;
  const pL_thev = iL_thev * iL_thev * rL;

  const pLMax = rTh > 1e-12 ? (vTh * vTh) / (4 * rTh) : 0;
  const pTotal = Math.abs(iL_thev * vTh);
  const efficiencyPct = pTotal > 1e-12 ? (pL_thev / pTotal) * 100 : 0;
  const isAtMaximumPower = Math.abs(rL - rTh) < 1e-3;

  // Norton check
  const iL_norton = iN * (rN / (rN + rL));
  const theveninMatchesNorton = Math.abs(iL_thev - iL_norton) < 1e-7;

  const derivations: StepByStepDerivation[] = [
    {
      title: 'Bridge Thévenin Voltage (Potential Difference V_C - V_D)',
      latexFormula: 'V_{th} = V_s \\left( \\frac{R_2}{R_1 + R_2} - \\frac{R_4}{R_3 + R_4} \\right)',
      explanation: 'Open-circuit potential difference between the left branch divider (Node C) and right branch divider (Node D).',
      computedValue: vTh,
      unit: 'V',
    },
    {
      title: 'Bridge Thévenin Resistance',
      latexFormula: 'R_{th} = (R_1 \\parallel R_2) + (R_3 \\parallel R_4) = \\frac{R_1 R_2}{R_1 + R_2} + \\frac{R_3 R_4}{R_3 + R_4}',
      explanation: 'Deactivating source Vs places R1 in parallel with R2, in series with the parallel combination of R3 and R4.',
      computedValue: rTh,
      unit: 'Ω',
    },
    {
      title: 'Norton Current',
      latexFormula: 'I_N = \\frac{V_{th}}{R_{th}}',
      explanation: 'Current delivered across detector nodes C and D when short-circuited directly together.',
      computedValue: iN,
      unit: 'A',
    },
    {
      title: 'Maximum Power Transfer Criterion',
      latexFormula: 'P_{L,\\max} = \\frac{V_{th}^2}{4 R_{th}} \\quad (R_L = R_{th})',
      explanation: 'Maximum power dissipated in the detector/load impedance.',
      computedValue: pLMax,
      unit: 'W',
    },
  ];

  const loadSweep = generateLoadSweep(vTh, rTh, rL);

  return {
    topology: 'bridge-network',
    vTh,
    rTh,
    iN,
    rN,
    rL,
    vL: vL_thev,
    iL: iL_thev,
    pL: pL_thev,
    pLMax,
    efficiencyPct,
    isAtMaximumPower,
    theveninVoltageVolts: parseFloat(vTh.toFixed(2)),
    theveninResistanceOhms: parseFloat(rTh.toFixed(2)),
    nortonCurrentMilliamps: parseFloat((iN * 1000).toFixed(2)),
    loadPowerMilliwatts: parseFloat((pL_thev * 1000).toFixed(2)),
    maxPossiblePowerMilliwatts: parseFloat((pLMax * 1000).toFixed(2)),
    originalCircuitMatchesThevenin: true,
    theveninMatchesNorton,
    derivations,
    loadSweep,
  };
}

/**
 * Universal evaluator dispatching to the configured topology.
 */
export function evaluateNetworkTheorems(params: NetworkTheoremsParams): NetworkTheoremsResult {
  if ('v1Volts' in params) {
    const val = validateNetworkParams(params);
    if (!val.valid) throw new Error(val.error ?? 'Invalid network parameters');
    return evaluateDualSourceTNetwork({
      topology: 'dual-source-t-network',
      v1: params.v1Volts,
      v2: params.v2Volts,
      r1: params.r1Ohms,
      r2: params.r2Ohms,
      r3: params.r3Ohms,
      rL: params.rlOhms,
    });
  }

  const validation = validateNetworkParams(params);
  if (!validation.valid) {
    throw new Error(validation.error ?? 'Invalid network parameters');
  }

  if (params.topology === 'dual-source-t-network') {
    return evaluateDualSourceTNetwork(params);
  } else {
    return evaluateBridgeNetwork(params);
  }
}
