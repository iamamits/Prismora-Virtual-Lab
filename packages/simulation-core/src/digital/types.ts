/**
 * Digital Electronics Type Definitions
 * Covers logic values, gates, truth tables, K-maps, combinational and sequential components.
 */

export type LogicLevel = 0 | 1;
export type LogicValue = 0 | 1 | 'X' | 'Z'; // 0, 1, Don't-Care / Unknown (X), High-Impedance (Z)

export type GateType =
  | 'AND'
  | 'OR'
  | 'NOT'
  | 'NAND'
  | 'NOR'
  | 'XOR'
  | 'XNOR'
  | 'BUFFER';

export interface GateDefinition {
  type: GateType;
  name: string;
  minInputs: number;
  maxInputs: number;
  evaluate: (inputs: LogicLevel[]) => LogicLevel;
  symbol: string;
  booleanSymbol: string;
  description: string;
}

export interface TruthTableRow {
  inputs: Record<string, LogicLevel>;
  outputs: Record<string, LogicLevel>;
}

export interface TruthTable {
  inputNames: string[];
  outputNames: string[];
  rows: TruthTableRow[];
}

export interface KMapCell {
  row: number;
  col: number;
  rowLabel: string;
  colLabel: string;
  mintermIndex: number;
  value: 0 | 1 | 'X';
}

export interface KMapGrouping {
  id: string;
  minterms: number[];
  term: string; // e.g. "A'B"
  color: string;
}

export interface KMapResult {
  numVariables: 2 | 3 | 4;
  variableNames: string[];
  cells: KMapCell[][];
  rowLabels: string[];
  colLabels: string[];
  primeImplicants: KMapGrouping[];
  essentialPrimeImplicants: KMapGrouping[];
  minimalSOP: string;
  minimalPOS: string;
}

export interface FullAdderResult {
  sum: LogicLevel;
  carryOut: LogicLevel;
}

export interface FullSubtractorResult {
  difference: LogicLevel;
  borrowOut: LogicLevel;
}

export interface ALUFlags {
  zero: boolean;
  sign: boolean;
  carry: boolean;
  overflow: boolean;
}

export interface ALUResult {
  result: number; // 4-bit unsigned result
  binaryResult: string;
  flags: ALUFlags;
}

export type ALUOperation =
  | 'ADD'
  | 'SUB'
  | 'AND'
  | 'OR'
  | 'XOR'
  | 'NOT'
  | 'SLL' // Shift Left Logical
  | 'SRL' // Shift Right Logical
  | 'SLT'; // Set on Less Than

export interface FlipFlopState {
  q: LogicLevel;
  qBar: LogicLevel;
}

export interface TimingTracePoint {
  time: number; // in nanoseconds or clock ticks
  value: LogicLevel;
}

export interface TimingSignal {
  name: string;
  color: string;
  points: TimingTracePoint[];
}
