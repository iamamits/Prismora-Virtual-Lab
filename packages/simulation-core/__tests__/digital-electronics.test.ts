import { describe, expect, it } from 'vitest';
import {
  CombinationalEngine,
  GATE_DEFINITIONS,
  generateGateTruthTable,
  KMapEngine,
  SequentialEngine,
  TimingEngine,
} from '../src/digital';

describe('Digital Electronics Simulation Engine', () => {
  describe('Logic Gates & Truth Tables', () => {
    it('should correctly evaluate standard 2-input gates', () => {
      // AND
      expect(GATE_DEFINITIONS.AND.evaluate([0, 0])).toBe(0);
      expect(GATE_DEFINITIONS.AND.evaluate([1, 0])).toBe(0);
      expect(GATE_DEFINITIONS.AND.evaluate([1, 1])).toBe(1);

      // OR
      expect(GATE_DEFINITIONS.OR.evaluate([0, 0])).toBe(0);
      expect(GATE_DEFINITIONS.OR.evaluate([0, 1])).toBe(1);
      expect(GATE_DEFINITIONS.OR.evaluate([1, 1])).toBe(1);

      // NOT
      expect(GATE_DEFINITIONS.NOT.evaluate([0])).toBe(1);
      expect(GATE_DEFINITIONS.NOT.evaluate([1])).toBe(0);

      // NAND & NOR
      expect(GATE_DEFINITIONS.NAND.evaluate([1, 1])).toBe(0);
      expect(GATE_DEFINITIONS.NAND.evaluate([0, 1])).toBe(1);
      expect(GATE_DEFINITIONS.NOR.evaluate([0, 0])).toBe(1);
      expect(GATE_DEFINITIONS.NOR.evaluate([1, 0])).toBe(0);

      // XOR & XNOR
      expect(GATE_DEFINITIONS.XOR.evaluate([0, 1])).toBe(1);
      expect(GATE_DEFINITIONS.XOR.evaluate([1, 1])).toBe(0);
      expect(GATE_DEFINITIONS.XNOR.evaluate([1, 1])).toBe(1);
      expect(GATE_DEFINITIONS.XNOR.evaluate([0, 1])).toBe(0);
    });

    it('should generate an exhaustive 4-row truth table for 2-input gates', () => {
      const tt = generateGateTruthTable('XOR', 2);
      expect(tt.rows.length).toBe(4);
      expect(tt.rows[0]?.outputs['Y']).toBe(0); // 0, 0 -> 0
      expect(tt.rows[1]?.outputs['Y']).toBe(1); // 0, 1 -> 1
      expect(tt.rows[2]?.outputs['Y']).toBe(1); // 1, 0 -> 1
      expect(tt.rows[3]?.outputs['Y']).toBe(0); // 1, 1 -> 0
    });
  });

  describe('K-Map & Quine-McCluskey Minimization', () => {
    it('should minimize 2-variable function correctly', () => {
      // f(A,B) = Σm(0, 1) -> A=0, B=0 and A=0, B=1 => should reduce to A'
      const kmap = KMapEngine.generateKMap(2, { 0: 1, 1: 1, 2: 0, 3: 0 });
      expect(kmap.minimalSOP).toBe("A'");
    });

    it('should minimize 3-variable function correctly', () => {
      // f(A,B,C) = Σm(0, 2, 4, 6) -> all where C=0 => should reduce to C'
      const minterms: Record<number, 0 | 1> = {
        0: 1,
        2: 1,
        4: 1,
        6: 1,
      };
      const kmap = KMapEngine.generateKMap(3, minterms);
      expect(kmap.minimalSOP).toBe("C'");
    });

    it('should handle all 1s and all 0s', () => {
      const allZeros = KMapEngine.generateKMap(2, { 0: 0, 1: 0, 2: 0, 3: 0 });
      expect(allZeros.minimalSOP).toBe('0');

      const allOnes = KMapEngine.generateKMap(2, { 0: 1, 1: 1, 2: 1, 3: 1 });
      expect(allOnes.minimalSOP).toBe('1');
    });
  });

  describe('Combinational Logic Units', () => {
    it('should compute Half Adder results', () => {
      expect(CombinationalEngine.halfAdder(0, 0)).toEqual({ sum: 0, carryOut: 0 });
      expect(CombinationalEngine.halfAdder(1, 0)).toEqual({ sum: 1, carryOut: 0 });
      expect(CombinationalEngine.halfAdder(1, 1)).toEqual({ sum: 0, carryOut: 1 });
    });

    it('should compute Full Adder results with carry in', () => {
      expect(CombinationalEngine.fullAdder(1, 1, 0)).toEqual({ sum: 0, carryOut: 1 });
      expect(CombinationalEngine.fullAdder(1, 1, 1)).toEqual({ sum: 1, carryOut: 1 });
      expect(CombinationalEngine.fullAdder(1, 0, 1)).toEqual({ sum: 0, carryOut: 1 });
    });

    it('should compute 4-bit ripple carry addition and detect signed overflow', () => {
      // 3 (0011) + 2 (0010) = 5 (0101) - no overflow
      const aNoOverflow = [1, 1, 0, 0] as [0 | 1, 0 | 1, 0 | 1, 0 | 1]; // LSB first: 3
      const bNoOverflow = [0, 1, 0, 0] as [0 | 1, 0 | 1, 0 | 1, 0 | 1]; // LSB first: 2
      const resNormal = CombinationalEngine.rippleCarry4Bit(aNoOverflow, bNoOverflow, 0);
      expect(resNormal.sum).toEqual([1, 0, 1, 0]); // LSB first: 1, 0, 1, 0 -> 5
      expect(resNormal.carryOut).toBe(0);
      expect(resNormal.overflow).toBe(false);

      // 5 (0101) + 3 (0011) = 8 (1000) - signed overflow because +8 > +7 for 4-bit signed
      const a = [1, 0, 1, 0] as [0 | 1, 0 | 1, 0 | 1, 0 | 1]; // LSB first: 5
      const b = [1, 1, 0, 0] as [0 | 1, 0 | 1, 0 | 1, 0 | 1]; // LSB first: 3
      const result = CombinationalEngine.rippleCarry4Bit(a, b, 0);
      expect(result.sum).toEqual([0, 0, 0, 1]); // LSB first: 0, 0, 0, 1 -> 8
      expect(result.carryOut).toBe(0);
      expect(result.overflow).toBe(true);
    });

    it('should multiplex 4 inputs with select lines', () => {
      const inputs: [0 | 1, 0 | 1, 0 | 1, 0 | 1] = [0, 1, 0, 1];
      expect(CombinationalEngine.mux4to1(inputs, [0, 0])).toBe(0); // I0
      expect(CombinationalEngine.mux4to1(inputs, [1, 0])).toBe(1); // I1
      expect(CombinationalEngine.mux4to1(inputs, [0, 1])).toBe(0); // I2
      expect(CombinationalEngine.mux4to1(inputs, [1, 1])).toBe(1); // I3
    });

    it('should evaluate 4-bit ALU operations and flags', () => {
      // 7 + 1 = 8 (triggers signed overflow for 4-bit 2s complement because max is 7)
      const addRes = CombinationalEngine.evaluateALU(7, 1, 'ADD');
      expect(addRes.result).toBe(8);
      expect(addRes.flags.overflow).toBe(true);
      expect(addRes.flags.zero).toBe(false);

      // 4 - 4 = 0 (triggers zero flag)
      const subRes = CombinationalEngine.evaluateALU(4, 4, 'SUB');
      expect(subRes.result).toBe(0);
      expect(subRes.flags.zero).toBe(true);

      // Bitwise AND
      const andRes = CombinationalEngine.evaluateALU(0b1100, 0b1010, 'AND');
      expect(andRes.result).toBe(0b1000);
    });
  });

  describe('Sequential Logic Units', () => {
    it('should correctly transition D Flip-Flop on rising edge', () => {
      // Clock not rising edge: state preserved
      const noEdge = SequentialEngine.dFlipFlop(1, false, 0);
      expect(noEdge.q).toBe(0);

      // Clock rising edge: sets to D
      const edge = SequentialEngine.dFlipFlop(1, true, 0);
      expect(edge.q).toBe(1);
      expect(edge.qBar).toBe(0);
    });

    it('should toggle JK Flip-Flop when J=1, K=1', () => {
      const step1 = SequentialEngine.jkFlipFlop(1, 1, true, 0);
      expect(step1.q).toBe(1);

      const step2 = SequentialEngine.jkFlipFlop(1, 1, true, 1);
      expect(step2.q).toBe(0);
    });

    it('should advance 4-bit synchronous counter', () => {
      const s0 = SequentialEngine.counter4Bit(14, true, true, false, true);
      expect(s0.count).toBe(15);
      expect(s0.terminalCount).toBe(false);

      // Rollover from 15 -> 0 triggers terminal count
      const s1 = SequentialEngine.counter4Bit(15, true, true, false, true);
      expect(s1.count).toBe(0);
      expect(s1.terminalCount).toBe(true);
    });
  });

  describe('Timing & Hazard Glitch Engine', () => {
    it('should detect static 1-hazard glitch with propagation delay', () => {
      const result = TimingEngine.simulateStaticOneHazard(3);
      expect(result.hazardDetected).toBe(true);
      expect(result.hazardTime).toBeDefined();
      expect(result.signals.length).toBe(5);
    });
  });
});
