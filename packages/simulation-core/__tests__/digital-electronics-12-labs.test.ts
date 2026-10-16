import { describe, expect, it } from 'vitest';
import {
  CodeConverterEngine,
  CombinationalEngine,
  ComparatorsEngine,
  CountersEngine,
  GATE_DEFINITIONS,
  generateGateTruthTable,
  LatchesEngine,
  SequentialEngine,
  ShiftRegisterEngine,
  UniversalGatesEngine,
} from '../src/digital';

describe('Digital Electronics Laboratory — 12 IIT Roorkee Virtual Labs Experiments', () => {
  // =========================================================================
  // EXPERIMENT 1: Truth Table Verification of Basic & Derived Logic Gates
  // =========================================================================
  describe('Experiment 1: Discrete Logic Gates & Truth Tables', () => {
    it('verifies 2-input AND gate truth table: output is 1 only when all inputs are 1', () => {
      const and = GATE_DEFINITIONS.AND.evaluate;
      expect(and([0, 0])).toBe(0);
      expect(and([0, 1])).toBe(0);
      expect(and([1, 0])).toBe(0);
      expect(and([1, 1])).toBe(1);
    });

    it('verifies 2-input OR gate truth table: output is 1 when any input is 1', () => {
      const or = GATE_DEFINITIONS.OR.evaluate;
      expect(or([0, 0])).toBe(0);
      expect(or([0, 1])).toBe(1);
      expect(or([1, 0])).toBe(1);
      expect(or([1, 1])).toBe(1);
    });

    it('verifies NOT inverter gate truth table: 0 -> 1 and 1 -> 0', () => {
      const not = GATE_DEFINITIONS.NOT.evaluate;
      expect(not([0])).toBe(1);
      expect(not([1])).toBe(0);
    });

    it('verifies XOR and XNOR complement relationship', () => {
      const xor = GATE_DEFINITIONS.XOR.evaluate;
      const xnor = GATE_DEFINITIONS.XNOR.evaluate;
      for (const a of [0, 1] as const) {
        for (const b of [0, 1] as const) {
          expect(xor([a, b])).not.toBe(xnor([a, b]));
        }
      }
    });

    it('generates complete truth table object for 3-input AND gate', () => {
      const tt = generateGateTruthTable('AND', 3);
      expect(tt.rows.length).toBe(8);
      // Only input (1,1,1) should yield output 1
      const highRows = tt.rows.filter((r) => r.outputs['Y'] === 1);
      expect(highRows.length).toBe(1);
      expect(highRows[0]?.inputs).toEqual({ A: 1, B: 1, C: 1 });
    });
  });

  // =========================================================================
  // EXPERIMENT 2: Half and Full Adder
  // =========================================================================
  describe('Experiment 2: Half & Full Adder', () => {
    it('verifies Half Adder truth table', () => {
      expect(CombinationalEngine.halfAdder(0, 0)).toEqual({ sum: 0, carryOut: 0 });
      expect(CombinationalEngine.halfAdder(0, 1)).toEqual({ sum: 1, carryOut: 0 });
      expect(CombinationalEngine.halfAdder(1, 0)).toEqual({ sum: 1, carryOut: 0 });
      expect(CombinationalEngine.halfAdder(1, 1)).toEqual({ sum: 0, carryOut: 1 });
    });

    it('verifies Full Adder across all 8 input combinations', () => {
      const expected = [
        { a: 0, b: 0, cin: 0, sum: 0, cout: 0 },
        { a: 0, b: 0, cin: 1, sum: 1, cout: 0 },
        { a: 0, b: 1, cin: 0, sum: 1, cout: 0 },
        { a: 0, b: 1, cin: 1, sum: 0, cout: 1 },
        { a: 1, b: 0, cin: 0, sum: 1, cout: 0 },
        { a: 1, b: 0, cin: 1, sum: 0, cout: 1 },
        { a: 1, b: 1, cin: 0, sum: 0, cout: 1 },
        { a: 1, b: 1, cin: 1, sum: 1, cout: 1 },
      ] as const;

      for (const exp of expected) {
        const res = CombinationalEngine.fullAdder(exp.a, exp.b, exp.cin);
        expect(res.sum).toBe(exp.sum);
        expect(res.carryOut).toBe(exp.cout);
      }
    });

    it('verifies 4-bit ripple carry addition (5 + 7 = 12)', () => {
      // 5 = 0101 (A0=1, A1=0, A2=1, A3=0)
      // 7 = 0111 (B0=1, B1=1, B2=1, B3=0)
      // 12 = 1100 (S0=0, S1=0, S2=1, S3=1)
      const res = CombinationalEngine.rippleCarry4Bit([1, 0, 1, 0], [1, 1, 1, 0], 0);
      // In 4-bit 2's complement (-8 to +7), 5 + 7 = 12 overflows the signed capacity
      expect(res.sum).toEqual([0, 0, 1, 1]);
      expect(res.carryOut).toBe(0);
      expect(res.overflow).toBe(true);
    });
  });

  // =========================================================================
  // EXPERIMENT 3: Half and Full Subtractor
  // =========================================================================
  describe('Experiment 3: Half & Full Subtractor', () => {
    it('verifies Half Subtractor truth table (D = A ⊕ B, Bout = ¬A · B)', () => {
      expect(CombinationalEngine.halfSubtractor(0, 0)).toEqual({ difference: 0, borrowOut: 0 });
      expect(CombinationalEngine.halfSubtractor(0, 1)).toEqual({ difference: 1, borrowOut: 1 });
      expect(CombinationalEngine.halfSubtractor(1, 0)).toEqual({ difference: 1, borrowOut: 0 });
      expect(CombinationalEngine.halfSubtractor(1, 1)).toEqual({ difference: 0, borrowOut: 0 });
    });

    it('verifies Full Subtractor across all 8 input states', () => {
      const expected = [
        { a: 0, b: 0, bin: 0, diff: 0, bout: 0 },
        { a: 0, b: 0, bin: 1, diff: 1, bout: 1 },
        { a: 0, b: 1, bin: 0, diff: 1, bout: 1 },
        { a: 0, b: 1, bin: 1, diff: 0, bout: 1 },
        { a: 1, b: 0, bin: 0, diff: 1, bout: 0 },
        { a: 1, b: 0, bin: 1, diff: 0, bout: 0 },
        { a: 1, b: 1, bin: 0, diff: 0, bout: 0 },
        { a: 1, b: 1, bin: 1, diff: 1, bout: 1 },
      ] as const;

      for (const exp of expected) {
        const res = CombinationalEngine.fullSubtractor(exp.a, exp.b, exp.bin);
        expect(res.difference).toBe(exp.diff);
        expect(res.borrowOut).toBe(exp.bout);
      }
    });
  });

  // =========================================================================
  // EXPERIMENT 4: Universal Gates (NAND & NOR Realizations)
  // =========================================================================
  describe('Experiment 4: Universal Gates Realization & Equivalence', () => {
    it('validates all NAND-synthesized gates against analytical truth tables', () => {
      for (const target of ['NOT', 'AND', 'OR', 'NOR', 'XOR', 'XNOR'] as const) {
        const verify = UniversalGatesEngine.verifyEquivalence(target, 'NAND');
        expect(verify.isEquivalent).toBe(true);
      }
    });

    it('validates all NOR-synthesized gates against analytical truth tables', () => {
      for (const target of ['NOT', 'AND', 'OR', 'NAND', 'XOR', 'XNOR'] as const) {
        const verify = UniversalGatesEngine.verifyEquivalence(target, 'NOR');
        expect(verify.isEquivalent).toBe(true);
      }
    });

    it('inspects intermediate node values of 4-NAND XOR realization for (A=1, B=0)', () => {
      const res = UniversalGatesEngine.evaluateNandCircuit('XOR', 1, 0);
      expect(res.output).toBe(1);
      expect(res.gateCount).toBe(4);
      expect(res.isEquivalent).toBe(true);
      // G1 = ¬(1 · 0) = 1
      expect(res.nodes[0]?.output).toBe(1);
      // G2 = ¬(1 · 1) = 0
      expect(res.nodes[1]?.output).toBe(0);
      // G3 = ¬(0 · 1) = 1
      expect(res.nodes[2]?.output).toBe(1);
      // G4 = ¬(0 · 1) = 1
      expect(res.nodes[3]?.output).toBe(1);
    });
  });

  // =========================================================================
  // EXPERIMENT 5: RS Latches (NOR & NAND) with Indeterminate States
  // =========================================================================
  describe('Experiment 5: RS NOR & NAND Latches & Race Condition', () => {
    it('verifies Active-High NOR Latch states: Hold, Set, Reset, and Indeterminate', () => {
      // Set
      const setRes = LatchesEngine.evaluateNorLatch(1, 0);
      expect(setRes.q).toBe(1);
      expect(setRes.qBar).toBe(0);
      expect(setRes.stateName).toBe('SET');
      expect(setRes.invalid).toBe(false);

      // Hold after Set
      const holdRes = LatchesEngine.evaluateNorLatch(0, 0, 1, 0);
      expect(holdRes.q).toBe(1);
      expect(holdRes.qBar).toBe(0);
      expect(holdRes.stateName).toBe('HOLD');

      // Reset
      const resetRes = LatchesEngine.evaluateNorLatch(0, 1, 1, 0);
      expect(resetRes.q).toBe(0);
      expect(resetRes.qBar).toBe(1);
      expect(resetRes.stateName).toBe('RESET');

      // Indeterminate (S=1, R=1) forces Q=0, QBar=0
      const indetRes = LatchesEngine.evaluateNorLatch(1, 1);
      expect(indetRes.q).toBe(0);
      expect(indetRes.qBar).toBe(0);
      expect(indetRes.stateName).toBe('INDETERMINATE');
      expect(indetRes.invalid).toBe(true);
    });

    it('resolves critical race hazard when NOR latch transitions from (1,1) to (0,0)', () => {
      // Set gate faster (+1ns skew) -> settles into SET (Q=1, QBar=0)
      const resSet = LatchesEngine.evaluateNorLatch(0, 0, 0, 0, 1.5);
      expect(resSet.q).toBe(1);
      expect(resSet.qBar).toBe(0);
      expect(resSet.raceHazard).toBe(true);

      // Reset gate faster (-1ns skew) -> settles into RESET (Q=0, QBar=1)
      const resReset = LatchesEngine.evaluateNorLatch(0, 0, 0, 0, -1.5);
      expect(resReset.q).toBe(0);
      expect(resReset.qBar).toBe(1);
      expect(resReset.raceHazard).toBe(true);
    });

    it('verifies Active-Low NAND Latch states with forbidden S̄=0, R̄=0', () => {
      // Forbidden: S̄=0, R̄=0 forces both outputs HIGH
      const forbRes = LatchesEngine.evaluateNandLatch(0, 0);
      expect(forbRes.q).toBe(1);
      expect(forbRes.qBar).toBe(1);
      expect(forbRes.invalid).toBe(true);

      // Active-low Set (S̄=0, R̄=1)
      const setRes = LatchesEngine.evaluateNandLatch(0, 1);
      expect(setRes.q).toBe(1);
      expect(setRes.qBar).toBe(0);
    });
  });

  // =========================================================================
  // EXPERIMENT 6: Clocked Flip-Flops (D, JK, T, SR)
  // =========================================================================
  describe('Experiment 6: Clocked Flip-Flops (RS, JK, D, T)', () => {
    it('verifies D Flip-Flop updates only on clock rising edge', () => {
      // No clock edge -> holds previous Q
      expect(SequentialEngine.dFlipFlop(1, false, 0)).toEqual({ q: 0, qBar: 1 });
      // Clock rising edge -> updates to D
      expect(SequentialEngine.dFlipFlop(1, true, 0)).toEqual({ q: 1, qBar: 0 });
      expect(SequentialEngine.dFlipFlop(0, true, 1)).toEqual({ q: 0, qBar: 1 });
    });

    it('verifies JK Flip-Flop toggle behavior on J=1, K=1', () => {
      // Toggle from 0 -> 1
      const step1 = SequentialEngine.jkFlipFlop(1, 1, true, 0);
      expect(step1.q).toBe(1);
      expect(step1.qBar).toBe(0);

      // Toggle from 1 -> 0
      const step2 = SequentialEngine.jkFlipFlop(1, 1, true, 1);
      expect(step2.q).toBe(0);
      expect(step2.qBar).toBe(1);
    });

    it('verifies T Flip-Flop frequency divide-by-2 toggle', () => {
      let q: 0 | 1 = 0;
      for (let i = 0; i < 4; i++) {
        const next = SequentialEngine.tFlipFlop(1, true, q);
        expect(next.q).toBe(q === 0 ? 1 : 0);
        q = next.q;
      }
    });
  });

  // =========================================================================
  // EXPERIMENT 7: 4-Bit SIPO Shift Register
  // =========================================================================
  describe('Experiment 7: 4-Bit SIPO Shift Register', () => {
    it('shifts serial bitstream [1, 0, 1, 1] into parallel outputs across 4 clock cycles', () => {
      const sipo = new ShiftRegisterEngine([0, 0, 0, 0]);

      // Cycle 1: Feed 1 -> [0, 0, 0, 1]
      sipo.clockPulse(1);
      expect(sipo.state.bits).toEqual([0, 0, 0, 1]);
      expect(sipo.state.decimal).toBe(1);

      // Cycle 2: Feed 0 -> [0, 0, 1, 0]
      sipo.clockPulse(0);
      expect(sipo.state.bits).toEqual([0, 0, 1, 0]);
      expect(sipo.state.decimal).toBe(2);

      // Cycle 3: Feed 1 -> [0, 1, 0, 1]
      sipo.clockPulse(1);
      expect(sipo.state.bits).toEqual([0, 1, 0, 1]);
      expect(sipo.state.decimal).toBe(5);

      // Cycle 4: Feed 1 -> [1, 0, 1, 1] (decimal 11, hex 0xB)
      sipo.clockPulse(1);
      expect(sipo.state.bits).toEqual([1, 0, 1, 1]);
      expect(sipo.state.decimal).toBe(11);
      expect(sipo.state.hex).toBe('0xB');
    });

    it('supports master clear and snapshot rewinding', () => {
      const sipo = new ShiftRegisterEngine();
      sipo.feedBitstream([1, 1, 0, 1]);
      expect(sipo.state.clockPulses).toBe(4);

      // Rewind to cycle 2
      sipo.rewindTo(2);
      expect(sipo.state.clockPulses).toBe(2);
      expect(sipo.state.bits).toEqual([0, 0, 1, 1]);

      // Master reset
      sipo.reset();
      expect(sipo.state.bits).toEqual([0, 0, 0, 0]);
      expect(sipo.state.clockPulses).toBe(0);
    });
  });

  // =========================================================================
  // EXPERIMENT 8: 3-to-8 Decoder & 4-to-2 Priority Encoder
  // =========================================================================
  describe('Experiment 8: 3-to-8 Decoder (74138) & Priority Encoder', () => {
    it('verifies 3-to-8 decoder activates exactly one corresponding line for each 3-bit input', () => {
      for (let i = 0; i < 8; i++) {
        const in0 = (i & 1) as 0 | 1;
        const in1 = ((i >> 1) & 1) as 0 | 1;
        const in2 = ((i >> 2) & 1) as 0 | 1;

        const out = CombinationalEngine.decoder3to8([in0, in1, in2], 1);
        expect(out[i]).toBe(1);
        expect(out.filter((v) => v === 1).length).toBe(1);
      }
    });

    it('verifies priority encoder grants precedence to highest active index', () => {
      // Only Input 1 active -> Y = [1, 0]
      expect(CombinationalEngine.priorityEncoder4to2([0, 1, 0, 0])).toEqual({ y: [1, 0], valid: 1 });
      // Inputs 1 and 3 active -> Input 3 has priority -> Y = [1, 1]
      expect(CombinationalEngine.priorityEncoder4to2([0, 1, 0, 1])).toEqual({ y: [1, 1], valid: 1 });
      // No active inputs -> valid = 0
      expect(CombinationalEngine.priorityEncoder4to2([0, 0, 0, 0])).toEqual({ y: [0, 0], valid: 0 });
    });
  });

  // =========================================================================
  // EXPERIMENT 9: 4:1 Multiplexer (74151) & 1:4 Demultiplexer
  // =========================================================================
  describe('Experiment 9: 4:1 Multiplexer & 1:4 Demultiplexer', () => {
    it('verifies 4:1 MUX routes the selected input channel to the single output', () => {
      const inputs: [0 | 1, 0 | 1, 0 | 1, 0 | 1] = [0, 1, 0, 1];
      // Select 0 -> I0 = 0
      expect(CombinationalEngine.mux4to1(inputs, [0, 0])).toBe(0);
      // Select 1 -> I1 = 1
      expect(CombinationalEngine.mux4to1(inputs, [1, 0])).toBe(1);
      // Select 2 -> I2 = 0
      expect(CombinationalEngine.mux4to1(inputs, [0, 1])).toBe(0);
      // Select 3 -> I3 = 1
      expect(CombinationalEngine.mux4to1(inputs, [1, 1])).toBe(1);
    });

    it('verifies 1:4 DEMUX steers single input line to chosen output channel', () => {
      const dataIn = 1;
      // Select channel 2 (S1=1, S0=0)
      const out = CombinationalEngine.demux1to4(dataIn, [0, 1], 1);
      expect(out).toEqual([0, 0, 1, 0]);
    });
  });

  // =========================================================================
  // EXPERIMENT 10: Asynchronous vs Synchronous Counters
  // =========================================================================
  describe('Experiment 10: Synchronous & Asynchronous Counter Timing & Skew', () => {
    it('detects transient glitch spikes during ripple counter transition from 7 (0111) to 8 (1000)', () => {
      const asyncStep = CountersEngine.evaluateAsynchronousStep(7, true, 10);
      expect(asyncStep.count).toBe(8);
      expect(asyncStep.cumulativeDelayNs).toBe(40); // 4 stages * 10ns
      expect(asyncStep.hasGlitch).toBe(true);
      // Transient path must contain intermediate values (e.g. 6, 4, 0)
      expect(asyncStep.transientStates.length).toBeGreaterThan(2);
      expect(asyncStep.transientStates).toContain(8);
    });

    it('verifies synchronous counter updates in parallel with zero glitch spikes', () => {
      const syncStep = CountersEngine.evaluateSynchronousStep(7, true, 10);
      expect(syncStep.count).toBe(8);
      expect(syncStep.cumulativeDelayNs).toBe(15); // 10ns FF + 5ns AND gate
      expect(syncStep.hasGlitch).toBe(false);
      expect(syncStep.transientStates).toEqual([7, 8]);
    });

    it('generates 16-cycle comparative trace demonstrating clock skew divergence', () => {
      const trace = CountersEngine.generateComparativeTrace();
      expect(trace.length).toBe(16);
      // Step 7 -> 8 has max skew difference
      const step8 = trace[7];
      expect(step8?.async.cumulativeDelayNs).toBeGreaterThan(step8?.sync.cumulativeDelayNs ?? 0);
    });
  });

  // =========================================================================
  // EXPERIMENT 11: Binary-to-Gray & Gray-to-Binary Converters
  // =========================================================================
  describe('Experiment 11: Binary-to-Gray & Gray-to-Binary Converters', () => {
    it('converts 4-bit binary to Gray code and back without loss', () => {
      for (let i = 0; i < 16; i++) {
        const b: [0 | 1, 0 | 1, 0 | 1, 0 | 1] = [
          ((i >> 3) & 1) as 0 | 1,
          ((i >> 2) & 1) as 0 | 1,
          ((i >> 1) & 1) as 0 | 1,
          (i & 1) as 0 | 1,
        ];

        const toGray = CodeConverterEngine.binaryToGray(b);
        const backToBin = CodeConverterEngine.grayToBinary(toGray.gray);
        expect(backToBin.binary).toEqual(b);
        expect(backToBin.binaryInt).toBe(i);
      }
    });

    it('proves unit distance property: successive Gray codes have Hamming distance = 1', () => {
      const fullTable = CodeConverterEngine.generateFullTable();
      expect(fullTable.length).toBe(16);

      for (let i = 1; i < 16; i++) {
        expect(fullTable[i]?.hammingDistanceToPrevious).toBe(1);
      }
    });
  });

  // =========================================================================
  // EXPERIMENT 12: 1-Bit, 2-Bit, and 4-Bit Magnitude Comparators
  // =========================================================================
  describe('Experiment 12: 1-Bit & 2-Bit Magnitude Comparators', () => {
    it('verifies 1-bit comparator outputs are strictly mutually exclusive', () => {
      const cases: Array<[0 | 1, 0 | 1]> = [
        [0, 0],
        [0, 1],
        [1, 0],
        [1, 1],
      ];

      for (const [a, b] of cases) {
        const res = ComparatorsEngine.compare1Bit(a, b);
        const sum = res.aGreaterThanB + res.aEqualToB + res.aLessThanB;
        expect(sum).toBe(1); // Exactly one condition is true
        if (a > b) expect(res.aGreaterThanB).toBe(1);
        if (a === b) expect(res.aEqualToB).toBe(1);
        if (a < b) expect(res.aLessThanB).toBe(1);
      }
    });

    it('verifies 2-bit comparator across all 16 combinations', () => {
      const table = ComparatorsEngine.generate2BitTable();
      expect(table.length).toBe(16);

      for (const row of table) {
        if (row.aInt > row.bInt) {
          expect(row.aGtB).toBe(1);
          expect(row.aEqB).toBe(0);
          expect(row.aLtB).toBe(0);
        } else if (row.aInt === row.bInt) {
          expect(row.aGtB).toBe(0);
          expect(row.aEqB).toBe(1);
          expect(row.aLtB).toBe(0);
        } else {
          expect(row.aGtB).toBe(0);
          expect(row.aEqB).toBe(0);
          expect(row.aLtB).toBe(1);
        }
      }
    });

    it('verifies 4-bit 74LS85 comparator with cascading inputs', () => {
      // 12 (1100) vs 9 (1001) -> 12 > 9
      const res1 = ComparatorsEngine.compare4Bit([1, 1, 0, 0], [1, 0, 0, 1]);
      expect(res1.aGreaterThanB).toBe(1);
      expect(res1.aEqualToB).toBe(0);

      // 7 (0111) vs 7 (0111) with cascade input A=B asserted
      const res2 = ComparatorsEngine.compare4Bit([0, 1, 1, 1], [0, 1, 1, 1], { eq: 1 });
      expect(res2.aEqualToB).toBe(1);
    });
  });
});
