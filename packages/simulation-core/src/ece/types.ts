/**
 * Prismora ECE Virtual Lab — Circuit Simulation Types
 * Defines graph-based logic components, terminals, wires, signals, and evaluation structures.
 */

export type LogicSignalState = 0 | 1 | 'FLOATING' | 'INVALID';

export type CircuitComponentType =
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'XOR'
  | 'NAND'
  | 'NOR'
  | 'XNOR'
  | 'BUFFER'
  | 'INPUT_SWITCH'
  | 'VCC'
  | 'GND'
  | 'CLOCK'
  | 'OUTPUT_LED'
  | 'LOGIC_PROBE';

export type TerminalType = 'input' | 'output';

export interface CircuitTerminal {
  id: string;
  name: string;
  type: TerminalType;
  componentId: string;
  relativePos: { x: number; y: number };
}

export interface CircuitComponent {
  id: string;
  type: CircuitComponentType;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  inputs: CircuitTerminal[];
  outputs: CircuitTerminal[];
  state: Record<string, any>; // e.g. { switchState: 0 | 1 }
  description?: string;
}

export interface CircuitWire {
  id: string;
  from: {
    componentId: string;
    terminalId: string;
  };
  to: {
    componentId: string;
    terminalId: string;
  };
  color?: string;
}

export interface CircuitGraph {
  components: CircuitComponent[];
  wires: CircuitWire[];
}

export interface CircuitEvaluationResult {
  terminalSignals: Record<string, LogicSignalState>;
  wireSignals: Record<string, LogicSignalState>;
  componentOutputs: Record<string, Record<string, LogicSignalState>>;
  floatingInputs: string[];
  hasCycle: boolean;
  cycleComponents: string[];
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TruthTableVerificationRow {
  inputs: Record<string, 0 | 1>;
  expected: Record<string, 0 | 1>;
  observed: Record<string, LogicSignalState>;
  passed: boolean;
  discrepancies: string[];
}

export interface TruthTableVerificationReport {
  circuitName: string;
  allPassed: boolean;
  passedCount: number;
  totalCount: number;
  rows: TruthTableVerificationRow[];
  timestamp: string;
}

export interface LogicAnalyzerChannel {
  id: string;
  name: string;
  color: string;
  terminalId?: string;
  samples: (0 | 1 | 'FLOATING')[];
}
