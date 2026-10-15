/**
 * Prismora ECE Virtual Lab — Automated Truth Table Verifier
 * Rigorously evaluates circuit graphs through all 2^N input combinations and verifies
 * outputs against analytical Boolean reference models.
 */

import { CircuitEvaluator } from './circuit-evaluator';
import {
  CircuitGraph,
  TruthTableVerificationReport,
  TruthTableVerificationRow,
} from './types';

export interface ExpectedSpec {
  name: string;
  inputNames: string[];
  outputNames: string[];
  evaluateExpected: (inputs: Record<string, 0 | 1>) => Record<string, 0 | 1>;
}

export const HALF_ADDER_SPEC: ExpectedSpec = {
  name: 'Half Adder (Ideal)',
  inputNames: ['A', 'B'],
  outputNames: ['Sum', 'Carry'],
  evaluateExpected: (inputs) => {
    const a = inputs['A'] ?? 0;
    const b = inputs['B'] ?? 0;
    return {
      Sum: (a ^ b) as 0 | 1,
      Carry: (a & b) as 0 | 1,
    };
  },
};

export const FULL_ADDER_SPEC: ExpectedSpec = {
  name: 'Full Adder (Ideal)',
  inputNames: ['A', 'B', 'Cin'],
  outputNames: ['Sum', 'Cout'],
  evaluateExpected: (inputs) => {
    const a = inputs['A'] ?? 0;
    const b = inputs['B'] ?? 0;
    const cin = inputs['Cin'] ?? 0;
    const sum = (a ^ b ^ cin) as 0 | 1;
    const cout = ((a & b) | (cin & (a ^ b))) as 0 | 1;
    return {
      Sum: sum,
      Cout: cout,
    };
  },
};

export class TruthTableVerifier {
  /**
   * Verify circuit graph against a specification.
   */
  static verify(graph: CircuitGraph, spec: ExpectedSpec): TruthTableVerificationReport {
    const numInputs = spec.inputNames.length;
    const totalCount = Math.pow(2, numInputs);
    const rows: TruthTableVerificationRow[] = [];
    let passedCount = 0;

    // Find input switches matching spec input names
    // Match by label contains name or ID contains name
    const switchMap = new Map<string, string>(); // inputName -> compId
    for (const name of spec.inputNames) {
      const match = graph.components.find(
        (c) =>
          c.type === 'INPUT_SWITCH' &&
          (c.label.toLowerCase().includes(name.toLowerCase()) ||
            c.id.toLowerCase().includes(name.toLowerCase())),
      );
      if (match) {
        switchMap.set(name, match.id);
      }
    }

    // Fallback: if not matched by label, match switches in positional order
    const allSwitches = graph.components.filter((c) => c.type === 'INPUT_SWITCH');
    spec.inputNames.forEach((name, idx) => {
      if (!switchMap.has(name) && allSwitches[idx]) {
        switchMap.set(name, allSwitches[idx]!.id);
      }
    });

    // Find output LEDs matching spec output names
    const ledMap = new Map<string, string>(); // outputName -> compId
    for (const name of spec.outputNames) {
      const match = graph.components.find(
        (c) =>
          c.type === 'OUTPUT_LED' &&
          (c.label.toLowerCase().includes(name.toLowerCase()) ||
            c.id.toLowerCase().includes(name.toLowerCase())),
      );
      if (match) {
        ledMap.set(name, match.id);
      }
    }

    const allLeds = graph.components.filter((c) => c.type === 'OUTPUT_LED');
    spec.outputNames.forEach((name, idx) => {
      if (!ledMap.has(name) && allLeds[idx]) {
        ledMap.set(name, allLeds[idx]!.id);
      }
    });

    // Deep clone components to safely mutate switch states
    for (let i = 0; i < totalCount; i++) {
      const inputVector: Record<string, 0 | 1> = {};
      for (let bit = 0; bit < numInputs; bit++) {
        const inputName = spec.inputNames[bit]!;
        // MSB first: (i >> (numInputs - 1 - bit)) & 1
        const val = ((i >> (numInputs - 1 - bit)) & 1) as 0 | 1;
        inputVector[inputName] = val;
      }

      const expectedOutputs = spec.evaluateExpected(inputVector);

      // Create test graph with this combination of switch inputs
      const testComponents = graph.components.map((c) => {
        if (c.type === 'INPUT_SWITCH') {
          // Find which inputName this switch maps to
          for (const [name, compId] of switchMap.entries()) {
            if (c.id === compId) {
              return {
                ...c,
                state: { ...c.state, switchState: inputVector[name] ?? 0 },
              };
            }
          }
        }
        return c;
      });

      const evalResult = CircuitEvaluator.evaluate({
        components: testComponents,
        wires: graph.wires,
      });

      // Read observed outputs
      const observedOutputs: Record<string, any> = {};
      for (const outName of spec.outputNames) {
        const ledId = ledMap.get(outName);
        if (ledId) {
          const ledComp = testComponents.find((c) => c.id === ledId);
          const inTermId = ledComp?.inputs[0]?.id;
          if (inTermId) {
            observedOutputs[outName] = evalResult.terminalSignals[inTermId] ?? 'FLOATING';
          } else {
            observedOutputs[outName] = 'FLOATING';
          }
        } else {
          observedOutputs[outName] = 'FLOATING';
        }
      }

      // Check discrepancies
      const discrepancies: string[] = [];
      let rowPassed = true;

      for (const outName of spec.outputNames) {
        const exp = expectedOutputs[outName];
        const obs = observedOutputs[outName];
        if (obs !== exp) {
          rowPassed = false;
          discrepancies.push(
            `Output "${outName}": Expected ${exp}, observed ${obs}`,
          );
        }
      }

      if (rowPassed) {
        passedCount++;
      }

      rows.push({
        inputs: inputVector,
        expected: expectedOutputs,
        observed: observedOutputs,
        passed: rowPassed,
        discrepancies,
      });
    }

    return {
      circuitName: spec.name,
      allPassed: passedCount === totalCount,
      passedCount,
      totalCount,
      rows,
      timestamp: new Date().toISOString(),
    };
  }
}
