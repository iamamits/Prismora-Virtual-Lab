import type { GateDefinition, GateType, LogicLevel, TruthTable } from './types';

export const GATE_DEFINITIONS: Record<GateType, GateDefinition> = {
  AND: {
    type: 'AND',
    name: 'AND Gate',
    minInputs: 2,
    maxInputs: 4,
    evaluate: (inputs) => (inputs.every((v) => v === 1) ? 1 : 0),
    symbol: '&',
    booleanSymbol: '·',
    description: 'Output is HIGH (1) only if ALL inputs are HIGH (1).',
  },
  OR: {
    type: 'OR',
    name: 'OR Gate',
    minInputs: 2,
    maxInputs: 4,
    evaluate: (inputs) => (inputs.some((v) => v === 1) ? 1 : 0),
    symbol: '≥1',
    booleanSymbol: '+',
    description: 'Output is HIGH (1) if AT LEAST ONE input is HIGH (1).',
  },
  NOT: {
    type: 'NOT',
    name: 'NOT Inverter',
    minInputs: 1,
    maxInputs: 1,
    evaluate: (inputs) => (inputs[0] === 1 ? 0 : 1),
    symbol: '1',
    booleanSymbol: "¬",
    description: 'Inverts the single input logic level (0 → 1, 1 → 0).',
  },
  NAND: {
    type: 'NAND',
    name: 'NAND Gate',
    minInputs: 2,
    maxInputs: 4,
    evaluate: (inputs) => (inputs.every((v) => v === 1) ? 0 : 1),
    symbol: '&',
    booleanSymbol: '↑',
    description: 'Universal Gate. Output is LOW (0) only if ALL inputs are HIGH (1).',
  },
  NOR: {
    type: 'NOR',
    name: 'NOR Gate',
    minInputs: 2,
    maxInputs: 4,
    evaluate: (inputs) => (inputs.some((v) => v === 1) ? 0 : 1),
    symbol: '≥1',
    booleanSymbol: '↓',
    description: 'Universal Gate. Output is HIGH (1) only if ALL inputs are LOW (0).',
  },
  XOR: {
    type: 'XOR',
    name: 'Exclusive-OR Gate',
    minInputs: 2,
    maxInputs: 2,
    evaluate: (inputs) => (inputs[0] !== inputs[1] ? 1 : 0),
    symbol: '=1',
    booleanSymbol: '⊕',
    description: 'Output is HIGH (1) if the inputs are different (odd parity).',
  },
  XNOR: {
    type: 'XNOR',
    name: 'Exclusive-NOR Gate',
    minInputs: 2,
    maxInputs: 2,
    evaluate: (inputs) => (inputs[0] === inputs[1] ? 1 : 0),
    symbol: '=1',
    booleanSymbol: '⊙',
    description: 'Equivalence Gate. Output is HIGH (1) if inputs are identical (even parity).',
  },
  BUFFER: {
    type: 'BUFFER',
    name: 'Logic Buffer',
    minInputs: 1,
    maxInputs: 1,
    evaluate: (inputs) => inputs[0] ?? 0,
    symbol: '1',
    booleanSymbol: '=',
    description: 'Passes logic level unchanged, boosting drive capability and introducing delay.',
  },
};

/**
 * Generates an exhaustive truth table for any specified gate with given number of inputs.
 */
export function generateGateTruthTable(gateType: GateType, numInputs: number = 2): TruthTable {
  const gate = GATE_DEFINITIONS[gateType];
  const actualInputs = Math.max(gate.minInputs, Math.min(gate.maxInputs, numInputs));
  const numRows = Math.pow(2, actualInputs);

  const inputNames =
    actualInputs === 1
      ? ['A']
      : actualInputs === 2
      ? ['A', 'B']
      : actualInputs === 3
      ? ['A', 'B', 'C']
      : ['A', 'B', 'C', 'D'];

  const rows = [];

  for (let i = 0; i < numRows; i++) {
    const inputValues: Record<string, LogicLevel> = {};
    const inputsArray: LogicLevel[] = [];

    for (let bit = actualInputs - 1; bit >= 0; bit--) {
      const val = ((i >> bit) & 1) as LogicLevel;
      const name = inputNames[actualInputs - 1 - bit]!;
      inputValues[name] = val;
      inputsArray.push(val);
    }

    const outVal = gate.evaluate(inputsArray);
    rows.push({
      inputs: inputValues,
      outputs: { Y: outVal },
    });
  }

  return {
    inputNames,
    outputNames: ['Y'],
    rows,
  };
}
