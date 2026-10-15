/**
 * RISC-V RV32I Architecture Definitions
 * Formats: R, I, S, B, U, J
 * General-purpose 32 registers (x0 - x31) with standard ABI names.
 */

export const RISCV_REGISTERS = [
  { num: 0, abi: 'zero', desc: 'Hard-wired zero' },
  { num: 1, abi: 'ra', desc: 'Return address' },
  { num: 2, abi: 'sp', desc: 'Stack pointer' },
  { num: 3, abi: 'gp', desc: 'Global pointer' },
  { num: 4, abi: 'tp', desc: 'Thread pointer' },
  { num: 5, abi: 't0', desc: 'Temporary / alternate link' },
  { num: 6, abi: 't1', desc: 'Temporary' },
  { num: 7, abi: 't2', desc: 'Temporary' },
  { num: 8, abi: 's0/fp', desc: 'Saved register / frame pointer' },
  { num: 9, abi: 's1', desc: 'Saved register' },
  { num: 10, abi: 'a0', desc: 'Function argument / return value' },
  { num: 11, abi: 'a1', desc: 'Function argument / return value' },
  { num: 12, abi: 'a2', desc: 'Function argument' },
  { num: 13, abi: 'a3', desc: 'Function argument' },
  { num: 14, abi: 'a4', desc: 'Function argument' },
  { num: 15, abi: 'a5', desc: 'Function argument' },
  { num: 16, abi: 'a6', desc: 'Function argument' },
  { num: 17, abi: 'a7', desc: 'Function argument' },
  { num: 18, abi: 's2', desc: 'Saved register' },
  { num: 19, abi: 's3', desc: 'Saved register' },
  { num: 20, abi: 's4', desc: 'Saved register' },
  { num: 21, abi: 's5', desc: 'Saved register' },
  { num: 22, abi: 's6', desc: 'Saved register' },
  { num: 23, abi: 's7', desc: 'Saved register' },
  { num: 24, abi: 's8', desc: 'Saved register' },
  { num: 25, abi: 's9', desc: 'Saved register' },
  { num: 26, abi: 's10', desc: 'Saved register' },
  { num: 27, abi: 's11', desc: 'Saved register' },
  { num: 28, abi: 't3', desc: 'Temporary' },
  { num: 29, abi: 't4', desc: 'Temporary' },
  { num: 30, abi: 't5', desc: 'Temporary' },
  { num: 31, abi: 't6', desc: 'Temporary' },
] as const;

export type InstructionFormat = 'R' | 'I' | 'S' | 'B' | 'U' | 'J';

export interface DecodedInstruction {
  address: number;
  rawHex: string;
  binary: string;
  mnemonic: string;
  format: InstructionFormat;
  rd?: number;
  rs1?: number;
  rs2?: number;
  imm?: number;
  shamt?: number;
  opcode: number;
  funct3?: number;
  funct7?: number;
  assembly: string;
}

export interface ControlSignals {
  regWrite: boolean;
  aluSrc: boolean; // 0 = rs2, 1 = imm
  memRead: boolean;
  memWrite: boolean;
  memToReg: boolean; // 0 = ALU, 1 = Mem
  branch: boolean;
  jump: boolean;
  aluOp: string;
}
