import { describe, expect, it } from 'vitest';
import {
  CircuitEvaluator,
  createComponent,
  createFullAdderCircuit,
  createHalfAdderCircuit,
  createNandHalfAdderCircuit,
  createWire,
  FULL_ADDER_SPEC,
  HALF_ADDER_SPEC,
  TruthTableVerifier,
} from '../src/ece';

describe('ECE Virtual Lab — Circuit Engine & Evaluator', () => {
  describe('Gate Logic & Primitives', () => {
    it('should correctly evaluate an AND gate with 2 inputs', () => {
      const swA = createComponent('INPUT_SWITCH', 'A', 0, 0, 'sw-a');
      const swB = createComponent('INPUT_SWITCH', 'B', 0, 50, 'sw-b');
      const andGate = createComponent('AND', 'AND', 100, 25, 'and-1');
      const led = createComponent('OUTPUT_LED', 'Out', 200, 25, 'led-1');

      swA.state.switchState = 1;
      swB.state.switchState = 1;

      const wires = [
        createWire('sw-a', 'sw-a-out', 'and-1', 'and-1-in-0'),
        createWire('sw-b', 'sw-b-out', 'and-1', 'and-1-in-1'),
        createWire('and-1', 'and-1-out', 'led-1', 'led-1-in'),
      ];

      const res = CircuitEvaluator.evaluate({ components: [swA, swB, andGate, led], wires });
      expect(res.isValid).toBe(true);
      expect(res.terminalSignals['led-1-in']).toBe(1);

      // Now set B to 0
      swB.state.switchState = 0;
      const res2 = CircuitEvaluator.evaluate({ components: [swA, swB, andGate, led], wires });
      expect(res2.terminalSignals['led-1-in']).toBe(0);
    });

    it('should correctly evaluate XOR gate logic', () => {
      const swA = createComponent('INPUT_SWITCH', 'A', 0, 0, 'sw-a');
      const swB = createComponent('INPUT_SWITCH', 'B', 0, 50, 'sw-b');
      const xorGate = createComponent('XOR', 'XOR', 100, 25, 'xor-1');
      const led = createComponent('OUTPUT_LED', 'Out', 200, 25, 'led-1');

      const wires = [
        createWire('sw-a', 'sw-a-out', 'xor-1', 'xor-1-in-0'),
        createWire('sw-b', 'sw-b-out', 'xor-1', 'xor-1-in-1'),
        createWire('xor-1', 'xor-1-out', 'led-1', 'led-1-in'),
      ];

      // 0 ^ 1 = 1
      swA.state.switchState = 0;
      swB.state.switchState = 1;
      let res = CircuitEvaluator.evaluate({ components: [swA, swB, xorGate, led], wires });
      expect(res.terminalSignals['led-1-in']).toBe(1);

      // 1 ^ 1 = 0
      swA.state.switchState = 1;
      swB.state.switchState = 1;
      res = CircuitEvaluator.evaluate({ components: [swA, swB, xorGate, led], wires });
      expect(res.terminalSignals['led-1-in']).toBe(0);
    });

    it('should detect floating unconnected inputs and flag warnings', () => {
      const andGate = createComponent('AND', 'AND', 100, 25, 'and-1');
      const res = CircuitEvaluator.evaluate({ components: [andGate], wires: [] });

      expect(res.floatingInputs.length).toBe(2);
      expect(res.warnings.length).toBeGreaterThan(0);
      expect(res.terminalSignals['and-1-in-0']).toBe('FLOATING');
    });

    it('should detect feedback loops (cycles) in combinational circuit', () => {
      const not1 = createComponent('NOT', 'NOT 1', 100, 0, 'not-1');
      const not2 = createComponent('NOT', 'NOT 2', 200, 0, 'not-2');

      const wires = [
        createWire('not-1', 'not-1-out', 'not-2', 'not-2-in'),
        createWire('not-2', 'not-2-out', 'not-1', 'not-1-in'), // Feedback cycle
      ];

      const res = CircuitEvaluator.evaluate({ components: [not1, not2], wires });
      expect(res.hasCycle).toBe(true);
      expect(res.isValid).toBe(false);
      expect(res.errors.some((e) => e.includes('cycle'))).toBe(true);
    });

    it('should detect bus contention / conflicts with multiple conflicting drivers', () => {
      const sw1 = createComponent('INPUT_SWITCH', 'Sw 1', 0, 0, 'sw-1');
      const sw2 = createComponent('INPUT_SWITCH', 'Sw 2', 0, 50, 'sw-2');
      const led = createComponent('OUTPUT_LED', 'LED', 150, 25, 'led-1');

      sw1.state.switchState = 1;
      sw2.state.switchState = 0;

      // Both switches wired to the same input terminal
      const wires = [
        createWire('sw-1', 'sw-1-out', 'led-1', 'led-1-in'),
        createWire('sw-2', 'sw-2-out', 'led-1', 'led-1-in'),
      ];

      const res = CircuitEvaluator.evaluate({ components: [sw1, sw2, led], wires });
      expect(res.terminalSignals['led-1-in']).toBe('INVALID');
      expect(res.errors.some((e) => e.includes('conflict'))).toBe(true);
    });
  });

  describe('Canonical Reference Circuits & Automated Verification', () => {
    it('should verify Half Adder reference circuit for all 4 input combinations (100% pass)', () => {
      const halfAdder = createHalfAdderCircuit();
      const report = TruthTableVerifier.verify(halfAdder, HALF_ADDER_SPEC);

      expect(report.totalCount).toBe(4);
      expect(report.passedCount).toBe(4);
      expect(report.allPassed).toBe(true);

      // Verify specific row outputs
      // 0, 0 -> Sum 0, Carry 0
      expect(report.rows[0]?.expected).toEqual({ Sum: 0, Carry: 0 });
      expect(report.rows[0]?.observed).toEqual({ Sum: 0, Carry: 0 });
      expect(report.rows[0]?.passed).toBe(true);

      // 0, 1 -> Sum 1, Carry 0
      expect(report.rows[1]?.expected).toEqual({ Sum: 1, Carry: 0 });
      expect(report.rows[1]?.observed).toEqual({ Sum: 1, Carry: 0 });
      expect(report.rows[1]?.passed).toBe(true);

      // 1, 0 -> Sum 1, Carry 0
      expect(report.rows[2]?.expected).toEqual({ Sum: 1, Carry: 0 });
      expect(report.rows[2]?.observed).toEqual({ Sum: 1, Carry: 0 });
      expect(report.rows[2]?.passed).toBe(true);

      // 1, 1 -> Sum 0, Carry 1
      expect(report.rows[3]?.expected).toEqual({ Sum: 0, Carry: 1 });
      expect(report.rows[3]?.observed).toEqual({ Sum: 0, Carry: 1 });
      expect(report.rows[3]?.passed).toBe(true);
    });

    it('should verify Universal NAND Half Adder circuit (100% pass)', () => {
      const nandHA = createNandHalfAdderCircuit();
      const report = TruthTableVerifier.verify(nandHA, HALF_ADDER_SPEC);

      expect(report.totalCount).toBe(4);
      expect(report.passedCount).toBe(4);
      expect(report.allPassed).toBe(true);
    });

    it('should verify Full Adder reference circuit for all 8 input combinations (100% pass)', () => {
      const fullAdder = createFullAdderCircuit();
      const report = TruthTableVerifier.verify(fullAdder, FULL_ADDER_SPEC);

      expect(report.totalCount).toBe(8);
      expect(report.passedCount).toBe(8);
      expect(report.allPassed).toBe(true);

      // Row A=1, B=1, Cin=1 -> Sum=1, Cout=1
      const lastRow = report.rows[7];
      expect(lastRow?.inputs).toEqual({ A: 1, B: 1, Cin: 1 });
      expect(lastRow?.expected).toEqual({ Sum: 1, Cout: 1 });
      expect(lastRow?.observed).toEqual({ Sum: 1, Cout: 1 });
      expect(lastRow?.passed).toBe(true);

      // Row A=1, B=0, Cin=1 -> Sum=0, Cout=1
      const row5 = report.rows[5];
      expect(row5?.inputs).toEqual({ A: 1, B: 0, Cin: 1 });
      expect(row5?.expected).toEqual({ Sum: 0, Cout: 1 });
      expect(row5?.observed).toEqual({ Sum: 0, Cout: 1 });
      expect(row5?.passed).toBe(true);
    });

    it('should accurately detect and pinpoint discrepancies when circuit has incorrect wiring', () => {
      const corruptedHA = createHalfAdderCircuit();
      // Remove wire connecting to Sum LED
      corruptedHA.wires = corruptedHA.wires.filter((w) => w.id !== 'w-xor-sum');

      const report = TruthTableVerifier.verify(corruptedHA, HALF_ADDER_SPEC);
      expect(report.allPassed).toBe(false);
      expect(report.passedCount).toBeLessThan(4);

      // The rows where Sum is expected to be 1 will fail because it's now FLOATING
      const failedRow = report.rows.find((r) => !r.passed);
      expect(failedRow).toBeDefined();
      expect(failedRow?.discrepancies.length).toBeGreaterThan(0);
      expect(failedRow?.discrepancies[0]).toContain('Sum');
    });
  });
});
