/**
 * Prismora ECE Simulation Core — DC Electrical Network Analysis Engine
 *
 * Implements linear and piecewise-linear electrical circuit modeling using
 * Modified Nodal Analysis (MNA), solving G * V = I.
 *
 * Computes:
 * - Deterministic node voltages
 * - Component branch currents
 * - Component power dissipation (P = V * I = I^2 * R)
 * - Physics-driven incandescent bulb filament temperature and lumen intensity
 * - Open-circuit and short-circuit diagnostics
 */

export type DCComponentType =
  | 'dc-voltage-source'
  | 'resistor'
  | 'light-bulb'
  | 'toggle-switch'
  | 'diode'
  | 'ground';

export interface DCComponent {
  id: string;
  name: string;
  type: DCComponentType;
  nodeA: string; // Positive terminal / Anode
  nodeB: string; // Negative terminal / Cathode
  value: number; // Volts for source, Ohms for resistor/bulb
  state?: 'OPEN' | 'CLOSED'; // For switches
  ratedPower?: number; // Rated Watts for light bulb (e.g. 5W, 60W)
  ratedVoltage?: number; // Rated Volts for light bulb (e.g. 12V, 120V)
}

export interface DCCircuitGraph {
  components: DCComponent[];
  groundNodeId: string;
}

export interface DCComponentEvaluation {
  id: string;
  voltageDrop: number; // V_A - V_B (Volts)
  current: number; // Branch current from A to B (Amperes)
  power: number; // Dissipated power (Watts)
  status: 'ACTIVE' | 'OFF' | 'OPEN_CIRCUIT' | 'SHORT_CIRCUIT' | 'REVERSE_BIASED';
  // Specific for incandescent bulb:
  filamentBrightness?: number; // 0.0 to 1.5 (1.0 = rated brightness)
  filamentColor?: string; // Hex color for filament visual rendering
  lumens?: number; // Estimated lumen output
}

export interface DCCircuitResult {
  nodeVoltages: Record<string, number>;
  componentEvaluations: Record<string, DCComponentEvaluation>;
  isShortCircuit: boolean;
  isOpenCircuit: boolean;
  diagnostics: string[];
}

/**
 * Solve a linear system A * x = b via Gaussian elimination with partial pivoting.
 */
function solveLinearSystem(A: number[][], b: number[]): number[] | null {
  const n = b.length;
  if (n === 0) return [];

  // Create augmented matrix
  const M: number[][] = A.map((row, i) => [...row, b[i] ?? 0]);

  for (let col = 0; col < n; col++) {
    // Find pivot
    let maxRow = col;
    let maxVal = Math.abs(M[col]?.[col] ?? 0);
    for (let row = col + 1; row < n; row++) {
      const val = Math.abs(M[row]?.[col] ?? 0);
      if (val > maxVal) {
        maxVal = val;
        maxRow = row;
      }
    }

    if (maxVal < 1e-12) {
      // Singular matrix / disconnected subnetwork
      return null;
    }

    // Swap pivot row
    if (maxRow !== col) {
      const temp = M[col]!;
      M[col] = M[maxRow]!;
      M[maxRow] = temp;
    }

    // Eliminate below
    const pivot = M[col]![col]!;
    for (let row = col + 1; row < n; row++) {
      const factor = (M[row]![col] ?? 0) / pivot;
      for (let c = col; c <= n; c++) {
        M[row]![c] = (M[row]![c] ?? 0) - factor * (M[col]![c] ?? 0);
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = M[row]![n]!;
    for (let col = row + 1; col < n; col++) {
      sum -= M[row]![col]! * x[col];
    }
    x[row] = sum / M[row]![row]!;
  }

  return x;
}

/**
 * Evaluates a DC electrical circuit using Modified Nodal Analysis (MNA).
 */
export function evaluateDCCircuit(graph: DCCircuitGraph): DCCircuitResult {
  const { components, groundNodeId } = graph;

  // 1. Collect unique nodes
  const nodeSet = new Set<string>();
  nodeSet.add(groundNodeId);

  components.forEach((c) => {
    if (c.type !== 'ground') {
      nodeSet.add(c.nodeA);
      nodeSet.add(c.nodeB);
    }
  });

  const allNodes = Array.from(nodeSet);
  // Ground is assigned index 0 conceptually, non-ground nodes are mapped 0..N-1
  const nonGroundNodes = allNodes.filter((n) => n !== groundNodeId);
  const nodeIndexMap = new Map<string, number>();
  nonGroundNodes.forEach((node, idx) => nodeIndexMap.set(node, idx));

  const numNonGround = nonGroundNodes.length;

  // Identify independent voltage sources
  const voltageSources = components.filter((c) => c.type === 'dc-voltage-source');
  const numSources = voltageSources.length;

  // Matrix dimension M = numNonGround + numSources
  const M = numNonGround + numSources;
  const G: number[][] = Array.from({ length: M }, () => new Array(M).fill(0));
  const I: number[] = new Array(M).fill(0);

  const diagnostics: string[] = [];
  let isShortCircuit = false;
  let isOpenCircuit = false;

  // 2. Stamp passive components (Resistors, Bulbs, Closed Switches, Diodes)
  components.forEach((c) => {
    if (c.type === 'resistor' || c.type === 'light-bulb' || c.type === 'toggle-switch') {
      let r = Math.max(1e-4, c.value);

      // Handle Switch state
      if (c.type === 'toggle-switch') {
        if (c.state === 'OPEN') {
          r = 1e9; // Near infinite resistance
          isOpenCircuit = true;
        } else {
          r = 1e-4; // Closed switch near zero resistance
        }
      }

      const g = 1 / r;
      const idxA = nodeIndexMap.get(c.nodeA);
      const idxB = nodeIndexMap.get(c.nodeB);

      if (idxA !== undefined) {
        G[idxA]![idxA] = (G[idxA]![idxA] ?? 0) + g;
      }
      if (idxB !== undefined) {
        G[idxB]![idxB] = (G[idxB]![idxB] ?? 0) + g;
      }
      if (idxA !== undefined && idxB !== undefined) {
        G[idxA]![idxB] = (G[idxA]![idxB] ?? 0) - g;
        G[idxB]![idxA] = (G[idxB]![idxA] ?? 0) - g;
      }
    } else if (c.type === 'diode') {
      // Piecewise linear diode model:
      // When forward biased, conducts with small forward resistance (e.g. 0.5 ohm)
      // When reverse biased, open (1e9 ohm)
      const rForward = 0.5;
      const g = 1 / rForward;
      const idxA = nodeIndexMap.get(c.nodeA);
      const idxB = nodeIndexMap.get(c.nodeB);

      if (idxA !== undefined) {
        G[idxA]![idxA] = (G[idxA]![idxA] ?? 0) + g;
      }
      if (idxB !== undefined) {
        G[idxB]![idxB] = (G[idxB]![idxB] ?? 0) + g;
      }
      if (idxA !== undefined && idxB !== undefined) {
        G[idxA]![idxB] = (G[idxA]![idxB] ?? 0) - g;
        G[idxB]![idxA] = (G[idxB]![idxA] ?? 0) - g;
      }
    }
  });

  // 3. Stamp Independent Voltage Sources
  voltageSources.forEach((vSrc, srcIdx) => {
    const row = numNonGround + srcIdx;
    const vValue = vSrc.value;

    const idxA = nodeIndexMap.get(vSrc.nodeA);
    const idxB = nodeIndexMap.get(vSrc.nodeB);

    if (idxA !== undefined) {
      G[idxA]![row] = (G[idxA]![row] ?? 0) + 1;
      G[row]![idxA] = (G[row]![idxA] ?? 0) + 1;
    }
    if (idxB !== undefined) {
      G[idxB]![row] = (G[idxB]![row] ?? 0) - 1;
      G[row]![idxB] = (G[row]![idxB] ?? 0) - 1;
    }

    I[row] = vValue;
  });

  // Check for direct short circuit across a voltage source
  voltageSources.forEach((v) => {
    if (v.nodeA === v.nodeB) {
      isShortCircuit = true;
      diagnostics.push(`Voltage source "${v.name}" has its positive and negative terminals shorted directly together!`);
    }
  });

  // 4. Solve system
  const solution = solveLinearSystem(G, I);

  const nodeVoltages: Record<string, number> = {};
  nodeVoltages[groundNodeId] = 0.0;

  if (solution) {
    nonGroundNodes.forEach((node, idx) => {
      nodeVoltages[node] = solution[idx] ?? 0;
    });
  } else {
    // Fallback if singular: all nodes 0 except source
    nonGroundNodes.forEach((node) => {
      nodeVoltages[node] = 0.0;
    });
    diagnostics.push('Circuit matrix is singular. Check for floating unconnected sub-networks or open loop.');
  }

  // 5. Compute Component-Level Branches (Current, Power, Status)
  const componentEvaluations: Record<string, DCComponentEvaluation> = {};

  components.forEach((c) => {
    const vA = nodeVoltages[c.nodeA] ?? 0;
    const vB = nodeVoltages[c.nodeB] ?? 0;
    const vDrop = vA - vB;

    if (c.type === 'dc-voltage-source') {
      const srcIdx = voltageSources.findIndex((s) => s.id === c.id);
      let srcCurrent = 0;
      if (solution && srcIdx !== -1) {
        srcCurrent = solution[numNonGround + srcIdx] ?? 0;
      }

      // Check for excessive current
      if (Math.abs(srcCurrent) > 50) {
        isShortCircuit = true;
        diagnostics.push(`Overcurrent detected in ${c.name} (${Math.abs(srcCurrent).toFixed(2)}A)! Check for a low-resistance short circuit.`);
      }

      componentEvaluations[c.id] = {
        id: c.id,
        voltageDrop: vDrop,
        current: Math.abs(srcCurrent),
        power: Math.abs(c.value * srcCurrent),
        status: isShortCircuit ? 'SHORT_CIRCUIT' : 'ACTIVE',
      };
    } else if (c.type === 'resistor') {
      const r = Math.max(1e-4, c.value);
      const i = vDrop / r;
      const p = Math.abs(vDrop * i);

      componentEvaluations[c.id] = {
        id: c.id,
        voltageDrop: vDrop,
        current: i,
        power: p,
        status: Math.abs(i) > 1e-6 ? 'ACTIVE' : 'OFF',
      };
    } else if (c.type === 'toggle-switch') {
      const isOpen = c.state === 'OPEN';
      const r = isOpen ? 1e9 : 1e-4;
      const i = vDrop / r;

      componentEvaluations[c.id] = {
        id: c.id,
        voltageDrop: vDrop,
        current: i,
        power: Math.abs(vDrop * i),
        status: isOpen ? 'OPEN_CIRCUIT' : 'ACTIVE',
      };
    } else if (c.type === 'light-bulb') {
      const r = Math.max(0.1, c.value);
      const i = vDrop / r;
      const p = Math.abs(vDrop * i);

      const ratedP = c.ratedPower ?? 5.0; // 5W default bulb
      const brightnessRatio = Math.min(1.5, p / ratedP);

      // Determine realistic physics-based filament color & lumen rating
      let filamentColor = '#334155'; // Cold dark gray
      let lumens = 0;

      if (brightnessRatio > 0.05) {
        lumens = Math.round(brightnessRatio * 50); // ~50 lumens at 100% rated
        if (brightnessRatio < 0.2) {
          filamentColor = '#B45309'; // Dim reddish-amber
        } else if (brightnessRatio < 0.6) {
          filamentColor = '#F59E0B'; // Warm amber glow
        } else if (brightnessRatio < 1.0) {
          filamentColor = '#FBBF24'; // Bright golden yellow
        } else {
          filamentColor = '#FEF08A'; // Intense white-hot incandescent
        }
      }

      componentEvaluations[c.id] = {
        id: c.id,
        voltageDrop: vDrop,
        current: i,
        power: p,
        status: brightnessRatio > 0.05 ? 'ACTIVE' : 'OFF',
        filamentBrightness: brightnessRatio,
        filamentColor,
        lumens,
      };
    } else if (c.type === 'diode') {
      const isForward = vDrop >= 0.6;
      const rEff = isForward ? 0.5 : 1e9;
      const i = isForward ? (vDrop - 0.7) / rEff : 1e-9;

      componentEvaluations[c.id] = {
        id: c.id,
        voltageDrop: vDrop,
        current: Math.max(0, i),
        power: Math.max(0, vDrop * i),
        status: isForward ? 'ACTIVE' : 'REVERSE_BIASED',
      };
    }
  });

  return {
    nodeVoltages,
    componentEvaluations,
    isShortCircuit,
    isOpenCircuit,
    diagnostics,
  };
}
