import type { ControlSignals, DecodedInstruction } from './riscv-isa';

export interface CPUState {
  pc: number;
  registers: number[]; // 32 registers
  memory: Record<number, number>; // word-addressable or byte-addressable
  currentInstruction: DecodedInstruction | null;
  controlSignals: ControlSignals;
  cycleCount: number;
  halted: boolean;
  busValues: {
    pc: number;
    instruction: string;
    readData1: number;
    readData2: number;
    aluResult: number;
    memReadData: number;
    writeBackData: number;
  };
}

export class SingleCycleCPU {
  private state: CPUState;
  private instructions: DecodedInstruction[] = [];

  constructor() {
    this.state = this.getInitialState();
  }

  private getInitialState(): CPUState {
    const registers = new Array(32).fill(0);
    return {
      pc: 0,
      registers,
      memory: {},
      currentInstruction: null,
      controlSignals: {
        regWrite: false,
        aluSrc: false,
        memRead: false,
        memWrite: false,
        memToReg: false,
        branch: false,
        jump: false,
        aluOp: 'NONE',
      },
      cycleCount: 0,
      halted: false,
      busValues: {
        pc: 0,
        instruction: 'NOP',
        readData1: 0,
        readData2: 0,
        aluResult: 0,
        memReadData: 0,
        writeBackData: 0,
      },
    };
  }

  loadProgram(instructions: DecodedInstruction[]): void {
    this.state = this.getInitialState();
    this.instructions = [...instructions];
  }

  getState(): CPUState {
    return {
      ...this.state,
      registers: [...this.state.registers],
      memory: { ...this.state.memory },
      controlSignals: { ...this.state.controlSignals },
      busValues: { ...this.state.busValues },
    };
  }

  setRegister(regNum: number, value: number): void {
    if (regNum > 0 && regNum < 32) {
      this.state.registers[regNum] = value | 0; // 32-bit signed integer
    }
  }

  step(): CPUState {
    if (this.state.halted) return this.getState();

    // 1. Fetch Instruction
    const instIndex = Math.floor(this.state.pc / 4);
    if (instIndex >= this.instructions.length) {
      this.state.halted = true;
      return this.getState();
    }

    const inst = this.instructions[instIndex]!;
    this.state.currentInstruction = inst;
    this.state.cycleCount++;

    // 2. Decode & Read Registers
    const rs1Val = inst.rs1 !== undefined ? this.state.registers[inst.rs1] ?? 0 : 0;
    const rs2Val = inst.rs2 !== undefined ? this.state.registers[inst.rs2] ?? 0 : 0;

    // 3. Control Unit & ALU Execution
    const controls: ControlSignals = {
      regWrite: false,
      aluSrc: false,
      memRead: false,
      memWrite: false,
      memToReg: false,
      branch: false,
      jump: false,
      aluOp: inst.mnemonic.toUpperCase(),
    };

    let aluOut = 0;
    let nextPc = this.state.pc + 4;
    let memReadData = 0;
    let writeBackData = 0;

    switch (inst.mnemonic) {
      // R-TYPE
      case 'add':
        aluOut = (rs1Val + rs2Val) | 0;
        controls.regWrite = true;
        break;
      case 'sub':
        aluOut = (rs1Val - rs2Val) | 0;
        controls.regWrite = true;
        break;
      case 'and':
        aluOut = (rs1Val & rs2Val) | 0;
        controls.regWrite = true;
        break;
      case 'or':
        aluOut = (rs1Val | rs2Val) | 0;
        controls.regWrite = true;
        break;
      case 'xor':
        aluOut = (rs1Val ^ rs2Val) | 0;
        controls.regWrite = true;
        break;
      case 'sll':
        aluOut = (rs1Val << (rs2Val & 0x1f)) | 0;
        controls.regWrite = true;
        break;
      case 'srl':
        aluOut = (rs1Val >>> (rs2Val & 0x1f)) | 0;
        controls.regWrite = true;
        break;
      case 'slt':
        aluOut = rs1Val < rs2Val ? 1 : 0;
        controls.regWrite = true;
        break;

      // I-TYPE Arithmetic
      case 'addi': {
        const imm = inst.imm ?? 0;
        aluOut = (rs1Val + imm) | 0;
        controls.aluSrc = true;
        controls.regWrite = true;
        break;
      }
      case 'andi': {
        const imm = inst.imm ?? 0;
        aluOut = (rs1Val & imm) | 0;
        controls.aluSrc = true;
        controls.regWrite = true;
        break;
      }
      case 'ori': {
        const imm = inst.imm ?? 0;
        aluOut = (rs1Val | imm) | 0;
        controls.aluSrc = true;
        controls.regWrite = true;
        break;
      }
      case 'xori': {
        const imm = inst.imm ?? 0;
        aluOut = (rs1Val ^ imm) | 0;
        controls.aluSrc = true;
        controls.regWrite = true;
        break;
      }

      // Load Word
      case 'lw': {
        const imm = inst.imm ?? 0;
        const addr = (rs1Val + imm) | 0;
        aluOut = addr;
        controls.aluSrc = true;
        controls.memRead = true;
        controls.memToReg = true;
        controls.regWrite = true;
        memReadData = this.state.memory[addr] ?? 0;
        break;
      }

      // Store Word
      case 'sw': {
        const imm = inst.imm ?? 0;
        const addr = (rs1Val + imm) | 0;
        aluOut = addr;
        controls.aluSrc = true;
        controls.memWrite = true;
        this.state.memory[addr] = rs2Val;
        break;
      }

      // Branch
      case 'beq': {
        controls.branch = true;
        if (rs1Val === rs2Val) {
          nextPc = this.state.pc + (inst.imm ?? 0);
        }
        break;
      }
      case 'bne': {
        controls.branch = true;
        if (rs1Val !== rs2Val) {
          nextPc = this.state.pc + (inst.imm ?? 0);
        }
        break;
      }
      case 'blt': {
        controls.branch = true;
        if (rs1Val < rs2Val) {
          nextPc = this.state.pc + (inst.imm ?? 0);
        }
        break;
      }
      case 'bge': {
        controls.branch = true;
        if (rs1Val >= rs2Val) {
          nextPc = this.state.pc + (inst.imm ?? 0);
        }
        break;
      }

      // Jump
      case 'jal': {
        controls.jump = true;
        controls.regWrite = true;
        aluOut = this.state.pc + 4;
        nextPc = this.state.pc + (inst.imm ?? 0);
        break;
      }

      default:
        break;
    }

    // 4. Writeback Stage
    writeBackData = controls.memToReg ? memReadData : aluOut;
    if (controls.regWrite && inst.rd !== undefined && inst.rd > 0) {
      this.state.registers[inst.rd] = writeBackData;
    }
    // Guarantee x0 is always hardwired to 0
    this.state.registers[0] = 0;

    // 5. Update Buses and PC
    this.state.controlSignals = controls;
    this.state.busValues = {
      pc: this.state.pc,
      instruction: inst.assembly,
      readData1: rs1Val,
      readData2: rs2Val,
      aluResult: aluOut,
      memReadData,
      writeBackData,
    };
    this.state.pc = nextPc;

    return this.getState();
  }
}
