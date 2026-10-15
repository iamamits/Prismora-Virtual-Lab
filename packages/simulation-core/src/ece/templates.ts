/**
 * Prismora ECE Virtual Lab — Circuit Templates & Factory Helpers
 * Provides standardized components, terminals, and canonical reference circuits
 * including Half Adder and Full Adder.
 */

import {
  CircuitComponent,
  CircuitComponentType,
  CircuitGraph,
  CircuitTerminal,
  CircuitWire,
} from './types';

let idCounter = 1;
export function generateUniqueId(prefix: string = 'comp'): string {
  return `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;
}

/**
 * Create a new circuit component with standard dimensions and terminal definitions.
 */
export function createComponent(
  type: CircuitComponentType,
  label: string,
  x: number,
  y: number,
  customId?: string,
): CircuitComponent {
  const id = customId ?? generateUniqueId(type.toLowerCase());
  const width = type === 'INPUT_SWITCH' ? 70 : type === 'OUTPUT_LED' ? 70 : 80;
  const height = type === 'INPUT_SWITCH' ? 50 : type === 'OUTPUT_LED' ? 50 : 60;

  let inputs: CircuitTerminal[] = [];
  let outputs: CircuitTerminal[] = [];
  const state: Record<string, any> = {};

  switch (type) {
    case 'INPUT_SWITCH':
      state.switchState = 0;
      outputs = [
        {
          id: `${id}-out`,
          name: 'Q',
          type: 'output',
          componentId: id,
          relativePos: { x: width, y: height / 2 },
        },
      ];
      break;

    case 'OUTPUT_LED':
      state.state = 0;
      inputs = [
        {
          id: `${id}-in`,
          name: 'D',
          type: 'input',
          componentId: id,
          relativePos: { x: 0, y: height / 2 },
        },
      ];
      break;

    case 'LOGIC_PROBE':
      state.state = 0;
      inputs = [
        {
          id: `${id}-in`,
          name: 'Probe',
          type: 'input',
          componentId: id,
          relativePos: { x: 0, y: height / 2 },
        },
      ];
      break;

    case 'NOT':
    case 'BUFFER':
      inputs = [
        {
          id: `${id}-in`,
          name: 'A',
          type: 'input',
          componentId: id,
          relativePos: { x: 0, y: height / 2 },
        },
      ];
      outputs = [
        {
          id: `${id}-out`,
          name: 'Y',
          type: 'output',
          componentId: id,
          relativePos: { x: width, y: height / 2 },
        },
      ];
      break;

    case 'AND':
    case 'OR':
    case 'XOR':
    case 'NAND':
    case 'NOR':
    case 'XNOR':
      inputs = [
        {
          id: `${id}-in-0`,
          name: 'A',
          type: 'input',
          componentId: id,
          relativePos: { x: 0, y: height / 3 },
        },
        {
          id: `${id}-in-1`,
          name: 'B',
          type: 'input',
          componentId: id,
          relativePos: { x: 0, y: (height * 2) / 3 },
        },
      ];
      outputs = [
        {
          id: `${id}-out`,
          name: 'Y',
          type: 'output',
          componentId: id,
          relativePos: { x: width, y: height / 2 },
        },
      ];
      break;

    case 'VCC':
      outputs = [
        {
          id: `${id}-out`,
          name: 'VCC',
          type: 'output',
          componentId: id,
          relativePos: { x: width, y: height / 2 },
        },
      ];
      break;

    case 'GND':
      outputs = [
        {
          id: `${id}-out`,
          name: 'GND',
          type: 'output',
          componentId: id,
          relativePos: { x: width, y: height / 2 },
        },
      ];
      break;

    case 'CLOCK':
      state.clockState = 0;
      outputs = [
        {
          id: `${id}-out`,
          name: 'CLK',
          type: 'output',
          componentId: id,
          relativePos: { x: width, y: height / 2 },
        },
      ];
      break;
  }

  return {
    id,
    type,
    label,
    x,
    y,
    width,
    height,
    inputs,
    outputs,
    state,
  };
}

/**
 * Connect two component terminals with a wire.
 */
export function createWire(
  fromComponentId: string,
  fromTerminalId: string,
  toComponentId: string,
  toTerminalId: string,
  customId?: string,
): CircuitWire {
  return {
    id: customId ?? generateUniqueId('wire'),
    from: {
      componentId: fromComponentId,
      terminalId: fromTerminalId,
    },
    to: {
      componentId: toComponentId,
      terminalId: toTerminalId,
    },
  };
}

/**
 * Create Canonical Half Adder Reference Circuit (Sum = A XOR B, Carry = A AND B).
 */
export function createHalfAdderCircuit(): CircuitGraph {
  const swA = createComponent('INPUT_SWITCH', 'Input A', 80, 130, 'sw-a');
  const swB = createComponent('INPUT_SWITCH', 'Input B', 80, 270, 'sw-b');

  const xorGate = createComponent('XOR', 'XOR (Sum)', 280, 130, 'gate-xor');
  const andGate = createComponent('AND', 'AND (Carry)', 280, 270, 'gate-and');

  const ledSum = createComponent('OUTPUT_LED', 'Sum (S)', 480, 135, 'led-sum');
  const ledCarry = createComponent('OUTPUT_LED', 'Carry (C)', 480, 275, 'led-carry');

  const wires: CircuitWire[] = [
    // Switch A -> XOR & AND
    createWire(swA.id, `${swA.id}-out`, xorGate.id, `${xorGate.id}-in-0`, 'w-a-xor'),
    createWire(swA.id, `${swA.id}-out`, andGate.id, `${andGate.id}-in-0`, 'w-a-and'),

    // Switch B -> XOR & AND
    createWire(swB.id, `${swB.id}-out`, xorGate.id, `${xorGate.id}-in-1`, 'w-b-xor'),
    createWire(swB.id, `${swB.id}-out`, andGate.id, `${andGate.id}-in-1`, 'w-b-and'),

    // Gates -> LEDs
    createWire(xorGate.id, `${xorGate.id}-out`, ledSum.id, `${ledSum.id}-in`, 'w-xor-sum'),
    createWire(andGate.id, `${andGate.id}-out`, ledCarry.id, `${ledCarry.id}-in`, 'w-and-carry'),
  ];

  return {
    components: [swA, swB, xorGate, andGate, ledSum, ledCarry],
    wires,
  };
}

/**
 * Create Canonical Full Adder Reference Circuit:
 * Sum = A XOR B XOR Cin
 * Cout = (A AND B) OR (Cin AND (A XOR B))
 */
export function createFullAdderCircuit(): CircuitGraph {
  const swA = createComponent('INPUT_SWITCH', 'Input A', 60, 90, 'sw-a');
  const swB = createComponent('INPUT_SWITCH', 'Input B', 60, 210, 'sw-b');
  const swCin = createComponent('INPUT_SWITCH', 'Carry In (Cin)', 60, 350, 'sw-cin');

  // Half Adder 1
  const xor1 = createComponent('XOR', 'XOR 1', 250, 110, 'gate-xor1');
  const and1 = createComponent('AND', 'AND 1', 250, 230, 'gate-and1');

  // Half Adder 2
  const xor2 = createComponent('XOR', 'XOR 2 (Sum)', 460, 130, 'gate-xor2');
  const and2 = createComponent('AND', 'AND 2', 460, 270, 'gate-and2');

  // Carry Out OR
  const or1 = createComponent('OR', 'OR (Cout)', 640, 280, 'gate-or1');

  // Outputs
  const ledSum = createComponent('OUTPUT_LED', 'Sum (S)', 760, 135, 'led-sum');
  const ledCout = createComponent('OUTPUT_LED', 'Carry Out (Cout)', 760, 285, 'led-cout');

  const wires: CircuitWire[] = [
    // Inputs A and B to XOR1 & AND1
    createWire(swA.id, `${swA.id}-out`, xor1.id, `${xor1.id}-in-0`, 'w-a-xor1'),
    createWire(swA.id, `${swA.id}-out`, and1.id, `${and1.id}-in-0`, 'w-a-and1'),
    createWire(swB.id, `${swB.id}-out`, xor1.id, `${xor1.id}-in-1`, 'w-b-xor1'),
    createWire(swB.id, `${swB.id}-out`, and1.id, `${and1.id}-in-1`, 'w-b-and1'),

    // XOR1 output (S1) to XOR2 and AND2
    createWire(xor1.id, `${xor1.id}-out`, xor2.id, `${xor2.id}-in-0`, 'w-xor1-xor2'),
    createWire(xor1.id, `${xor1.id}-out`, and2.id, `${and2.id}-in-0`, 'w-xor1-and2'),

    // Cin to XOR2 and AND2
    createWire(swCin.id, `${swCin.id}-out`, xor2.id, `${xor2.id}-in-1`, 'w-cin-xor2'),
    createWire(swCin.id, `${swCin.id}-out`, and2.id, `${and2.id}-in-1`, 'w-cin-and2'),

    // AND outputs to OR1
    createWire(and1.id, `${and1.id}-out`, or1.id, `${or1.id}-in-0`, 'w-and1-or1'),
    createWire(and2.id, `${and2.id}-out`, or1.id, `${or1.id}-in-1`, 'w-and2-or1'),

    // Outputs to LEDs
    createWire(xor2.id, `${xor2.id}-out`, ledSum.id, `${ledSum.id}-in`, 'w-xor2-sum'),
    createWire(or1.id, `${or1.id}-out`, ledCout.id, `${ledCout.id}-in`, 'w-or1-cout'),
  ];

  return {
    components: [swA, swB, swCin, xor1, and1, xor2, and2, or1, ledSum, ledCout],
    wires,
  };
}

/**
 * Universal NAND Implementation of Half Adder (5 NAND gates).
 */
export function createNandHalfAdderCircuit(): CircuitGraph {
  const swA = createComponent('INPUT_SWITCH', 'Input A', 60, 130, 'sw-a');
  const swB = createComponent('INPUT_SWITCH', 'Input B', 60, 270, 'sw-b');

  const nand1 = createComponent('NAND', 'NAND 1', 220, 200, 'gate-nand1');
  const nand2 = createComponent('NAND', 'NAND 2', 380, 110, 'gate-nand2');
  const nand3 = createComponent('NAND', 'NAND 3', 380, 290, 'gate-nand3');
  const nand4 = createComponent('NAND', 'NAND 4 (Sum)', 540, 200, 'gate-nand4');
  const nand5 = createComponent('NAND', 'NAND 5 (Carry)', 540, 340, 'gate-nand5');

  const ledSum = createComponent('OUTPUT_LED', 'Sum (S)', 700, 205, 'led-sum');
  const ledCarry = createComponent('OUTPUT_LED', 'Carry (C)', 700, 345, 'led-carry');

  const wires: CircuitWire[] = [
    // Inputs to NAND 1
    createWire(swA.id, `${swA.id}-out`, nand1.id, `${nand1.id}-in-0`, 'w-a-n1'),
    createWire(swB.id, `${swB.id}-out`, nand1.id, `${nand1.id}-in-1`, 'w-b-n1'),

    // A to NAND 2
    createWire(swA.id, `${swA.id}-out`, nand2.id, `${nand2.id}-in-0`, 'w-a-n2'),
    // NAND 1 out to NAND 2 in-1
    createWire(nand1.id, `${nand1.id}-out`, nand2.id, `${nand2.id}-in-1`, 'w-n1-n2'),

    // NAND 1 out to NAND 3 in-0
    createWire(nand1.id, `${nand1.id}-out`, nand3.id, `${nand3.id}-in-0`, 'w-n1-n3'),
    // B to NAND 3 in-1
    createWire(swB.id, `${swB.id}-out`, nand3.id, `${nand3.id}-in-1`, 'w-b-n3'),

    // NAND 2 & 3 to NAND 4 (Sum)
    createWire(nand2.id, `${nand2.id}-out`, nand4.id, `${nand4.id}-in-0`, 'w-n2-n4'),
    createWire(nand3.id, `${nand3.id}-out`, nand4.id, `${nand4.id}-in-1`, 'w-n3-n4'),

    // NAND 1 to both inputs of NAND 5 to invert (Carry)
    createWire(nand1.id, `${nand1.id}-out`, nand5.id, `${nand5.id}-in-0`, 'w-n1-n5a'),
    createWire(nand1.id, `${nand1.id}-out`, nand5.id, `${nand5.id}-in-1`, 'w-n1-n5b'),

    // Outputs to LEDs
    createWire(nand4.id, `${nand4.id}-out`, ledSum.id, `${ledSum.id}-in`, 'w-n4-sum'),
    createWire(nand5.id, `${nand5.id}-out`, ledCarry.id, `${ledCarry.id}-in`, 'w-n5-carry'),
  ];

  return {
    components: [swA, swB, nand1, nand2, nand3, nand4, nand5, ledSum, ledCarry],
    wires,
  };
}
