import type { DecodedInstruction } from './riscv-isa';

export interface PipelineStageState {
  instruction: DecodedInstruction | null;
  pc: number;
  bubble: boolean;
  bubbleReason?: string;
}

export interface PipelineState {
  cycle: number;
  if: PipelineStageState;
  id: PipelineStageState;
  ex: PipelineStageState;
  mem: PipelineStageState;
  wb: PipelineStageState;
  forwardingA: 'NONE' | 'EX_TO_EX' | 'MEM_TO_EX';
  forwardingB: 'NONE' | 'EX_TO_EX' | 'MEM_TO_EX';
  hazardStall: boolean;
  branchFlush: boolean;
  cpi: number;
  completedInstructions: number;
}

export class PipelinedCPU {
  private cycle: number = 0;
  private pc: number = 0;
  private instructions: DecodedInstruction[] = [];
  private ifStage: PipelineStageState = { instruction: null, pc: 0, bubble: true };
  private idStage: PipelineStageState = { instruction: null, pc: 0, bubble: true };
  private exStage: PipelineStageState = { instruction: null, pc: 0, bubble: true };
  private memStage: PipelineStageState = { instruction: null, pc: 0, bubble: true };
  private wbStage: PipelineStageState = { instruction: null, pc: 0, bubble: true };
  private completedCount: number = 0;

  loadProgram(instructions: DecodedInstruction[]): void {
    this.instructions = [...instructions];
    this.cycle = 0;
    this.pc = 0;
    this.completedCount = 0;
    this.ifStage = { instruction: null, pc: 0, bubble: true };
    this.idStage = { instruction: null, pc: 0, bubble: true };
    this.exStage = { instruction: null, pc: 0, bubble: true };
    this.memStage = { instruction: null, pc: 0, bubble: true };
    this.wbStage = { instruction: null, pc: 0, bubble: true };
  }

  step(): PipelineState {
    this.cycle++;

    // 1. Writeback stage completes
    if (!this.wbStage.bubble && this.wbStage.instruction) {
      this.completedCount++;
    }

    // 2. Advance MEM -> WB
    this.wbStage = { ...this.memStage };

    // 3. Advance EX -> MEM
    this.memStage = { ...this.exStage };

    // 4. Hazard Detection Unit: Check for Load-Use Hazard
    // If instruction in EX is 'lw' and its rd matches rs1 or rs2 of instruction in ID:
    let hazardStall = false;
    let forwardingA: 'NONE' | 'EX_TO_EX' | 'MEM_TO_EX' = 'NONE';
    let forwardingB: 'NONE' | 'EX_TO_EX' | 'MEM_TO_EX' = 'NONE';

    const idInst = this.idStage.instruction;
    const exInst = this.exStage.instruction;
    const memInst = this.memStage.instruction;

    if (!this.exStage.bubble && exInst && exInst.mnemonic === 'lw' && !this.idStage.bubble && idInst) {
      if ((idInst.rs1 !== undefined && idInst.rs1 === exInst.rd && exInst.rd !== 0) ||
          (idInst.rs2 !== undefined && idInst.rs2 === exInst.rd && exInst.rd !== 0 && idInst.format === 'R')) {
        hazardStall = true;
      }
    }

    // 5. Forwarding Unit (for EX stage execution):
    if (!this.idStage.bubble && idInst) {
      // Forward A
      if (!this.exStage.bubble && exInst && exInst.rd && exInst.rd !== 0 && exInst.rd === idInst.rs1) {
        forwardingA = 'EX_TO_EX';
      } else if (!this.memStage.bubble && memInst && memInst.rd && memInst.rd !== 0 && memInst.rd === idInst.rs1) {
        forwardingA = 'MEM_TO_EX';
      }

      // Forward B
      if (!this.exStage.bubble && exInst && exInst.rd && exInst.rd !== 0 && exInst.rd === idInst.rs2) {
        forwardingB = 'EX_TO_EX';
      } else if (!this.memStage.bubble && memInst && memInst.rd && memInst.rd !== 0 && memInst.rd === idInst.rs2) {
        forwardingB = 'MEM_TO_EX';
      }
    }

    if (hazardStall) {
      // Insert bubble into EX stage, hold ID and IF stages
      this.exStage = { instruction: null, pc: 0, bubble: true, bubbleReason: 'Load-Use RAW Stall Bubble' };
    } else {
      // Normal advancement: ID -> EX
      this.exStage = { ...this.idStage };

      // Check branch in EX stage
      let branchFlush = false;
      if (!this.exStage.bubble && this.exStage.instruction) {
        const mnemonic = this.exStage.instruction.mnemonic;
        if (['beq', 'bne', 'blt', 'bge', 'jal'].includes(mnemonic)) {
          // In an educational pipeline with branch resolved in EX: flush IF and ID
          branchFlush = true;
        }
      }

      if (branchFlush) {
        this.idStage = { instruction: null, pc: 0, bubble: true, bubbleReason: 'Branch Misprediction Flush' };
        this.ifStage = { instruction: null, pc: 0, bubble: true, bubbleReason: 'Branch Misprediction Flush' };
      } else {
        // Advance IF -> ID
        this.idStage = { ...this.ifStage };

        // Fetch next instruction into IF
        const instIndex = Math.floor(this.pc / 4);
        if (instIndex < this.instructions.length) {
          this.ifStage = {
            instruction: this.instructions[instIndex]!,
            pc: this.pc,
            bubble: false,
          };
          this.pc += 4;
        } else {
          this.ifStage = { instruction: null, pc: this.pc, bubble: true, bubbleReason: 'Program End' };
        }
      }
    }

    const cpi = this.completedCount > 0 ? Number((this.cycle / this.completedCount).toFixed(2)) : 1.0;

    return {
      cycle: this.cycle,
      if: { ...this.ifStage },
      id: { ...this.idStage },
      ex: { ...this.exStage },
      mem: { ...this.memStage },
      wb: { ...this.wbStage },
      forwardingA,
      forwardingB,
      hazardStall,
      branchFlush: false,
      cpi,
      completedInstructions: this.completedCount,
    };
  }
}
