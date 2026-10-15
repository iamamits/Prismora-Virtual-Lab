import { describe, expect, it } from 'vitest';
import { CacheSimulator, PipelinedCPU, RISCVAssembler, SingleCycleCPU } from '../src/coa';

describe('Computer Organization & Architecture Simulation Engine', () => {
  describe('RISC-V Assembler & Disassembler', () => {
    it('should assemble R-type add instruction', () => {
      const inst = RISCVAssembler.assembleLine('add x1, x2, x3', 0);
      expect(inst.mnemonic).toBe('add');
      expect(inst.format).toBe('R');
      expect(inst.rd).toBe(1);
      expect(inst.rs1).toBe(2);
      expect(inst.rs2).toBe(3);
    });

    it('should assemble I-type addi and lw instructions', () => {
      const addi = RISCVAssembler.assembleLine('addi x5, x0, 10', 4);
      expect(addi.mnemonic).toBe('addi');
      expect(addi.rd).toBe(5);
      expect(addi.imm).toBe(10);

      const lw = RISCVAssembler.assembleLine('lw x6, 4(x5)', 8);
      expect(lw.mnemonic).toBe('lw');
      expect(lw.rd).toBe(6);
      expect(lw.rs1).toBe(5);
      expect(lw.imm).toBe(4);
    });

    it('should assemble sample educational Fibonacci program', () => {
      const prog = `
        addi x1, x0, 0
        addi x2, x0, 1
        add  x3, x1, x2
      `;
      const insts = RISCVAssembler.assembleProgram(prog);
      expect(insts.length).toBe(3);
      expect(insts[0]?.mnemonic).toBe('addi');
      expect(insts[2]?.mnemonic).toBe('add');
    });
  });

  describe('Single-Cycle CPU Datapath Execution', () => {
    it('should execute arithmetic instructions and preserve x0=0 invariant', () => {
      const cpu = new SingleCycleCPU();
      const program = [
        RISCVAssembler.assembleLine('addi x1, x0, 15', 0),
        RISCVAssembler.assembleLine('addi x2, x0, 25', 4),
        RISCVAssembler.assembleLine('add  x3, x1, x2', 8),
        RISCVAssembler.assembleLine('addi x0, x0, 999', 12), // Should NOT write to x0
      ];

      cpu.loadProgram(program);

      // Step 1: addi x1, x0, 15
      let state = cpu.step();
      expect(state.registers[1]).toBe(15);

      // Step 2: addi x2, x0, 25
      state = cpu.step();
      expect(state.registers[2]).toBe(25);

      // Step 3: add x3, x1, x2 -> 40
      state = cpu.step();
      expect(state.registers[3]).toBe(40);

      // Step 4: attempt write to x0 -> must remain 0
      state = cpu.step();
      expect(state.registers[0]).toBe(0);
    });

    it('should execute memory store and load instructions', () => {
      const cpu = new SingleCycleCPU();
      const program = [
        RISCVAssembler.assembleLine('addi x1, x0, 42', 0),
        RISCVAssembler.assembleLine('sw   x1, 100(x0)', 4),
        RISCVAssembler.assembleLine('lw   x2, 100(x0)', 8),
      ];

      cpu.loadProgram(program);
      cpu.step(); // x1 = 42
      cpu.step(); // memory[100] = 42
      const state = cpu.step(); // x2 = memory[100]

      expect(state.memory[100]).toBe(42);
      expect(state.registers[2]).toBe(42);
    });
  });

  describe('5-Stage Pipelined Processor & Hazards', () => {
    it('should detect Load-Use RAW Hazard and insert stall bubble', () => {
      const pipeline = new PipelinedCPU();
      // lw followed immediately by dependent add
      const program = [
        RISCVAssembler.assembleLine('lw   x1, 0(x0)', 0),
        RISCVAssembler.assembleLine('add  x2, x1, x3', 4),
      ];

      pipeline.loadProgram(program);

      // Cycle 1: lw enters IF
      pipeline.step();
      // Cycle 2: lw in ID, add in IF
      pipeline.step();
      // Cycle 3: lw in EX, add in ID
      const s3 = pipeline.step();
      expect(s3.ex.instruction?.mnemonic).toBe('lw');
      expect(s3.id.instruction?.mnemonic).toBe('add');

      // Cycle 4: Load-Use Hazard detected! EX receives stall bubble, ID is held with add
      const s4 = pipeline.step();
      expect(s4.hazardStall).toBe(true);
      expect(s4.ex.bubble).toBe(true);
      expect(s4.ex.bubbleReason).toContain('Load-Use');
      expect(s4.id.instruction?.mnemonic).toBe('add');
    });
  });

  describe('Cache Memory Hierarchy Simulation', () => {
    it('should breakdown 32-bit address into Tag, Index, and Offset bits', () => {
      // 256 bytes cache, 16 bytes block, direct mapped (16 sets)
      // Offset bits = log2(16) = 4
      // Index bits = log2(16) = 4
      // Tag bits = 32 - 4 - 4 = 24
      const cache = new CacheSimulator(256, 16, 'direct');
      const addr = 0x0000004c; // binary: ... 0100 1100 -> index: 4, offset: 12 (0xc)
      const b = cache.breakdownAddress(addr);

      expect(b.offsetBits).toBe(4);
      expect(b.indexBits).toBe(4);
      expect(b.tagBits).toBe(24);
      expect(b.offset).toBe(12);
      expect(b.index).toBe(4);
    });

    it('should record compulsory miss on first access and hit on repeated access', () => {
      const cache = new CacheSimulator(256, 16, 'direct');
      const res1 = cache.access(0x100);
      expect(res1.hit).toBe(false);
      expect(res1.missType).toBe('compulsory');

      // Second access to same block should be a HIT
      const res2 = cache.access(0x104);
      expect(res2.hit).toBe(true);
      expect(cache.getStats().hits).toBe(1);
      expect(cache.getStats().misses).toBe(1);
      expect(cache.getStats().hitRate).toBe(50.0);
    });
  });
});
