import type { DecodedInstruction } from './riscv-isa';
import { RISCV_REGISTERS } from './riscv-isa';

/**
 * Assembler & Disassembler for 32-bit RISC-V (RV32I).
 */
export class RISCVAssembler {
  private static regMap: Record<string, number> = (() => {
    const map: Record<string, number> = {};
    for (const r of RISCV_REGISTERS) {
      map[`x${r.num}`] = r.num;
      map[r.abi] = r.num;
    }
    // Alias s0/fp
    map['fp'] = 8;
    return map;
  })();

  static parseRegister(name: string): number {
    const clean = name.trim().replace(/,/g, '');
    const num = this.regMap[clean];
    if (num === undefined) {
      throw new Error(`Unknown register: "${clean}"`);
    }
    return num;
  }

  /**
   * Assemble a line of RISC-V assembly into a DecodedInstruction object.
   */
  static assembleLine(line: string, address: number = 0): DecodedInstruction {
    const trimmed = line.split('#')[0]!.split(';')[0]!.trim();
    if (!trimmed) {
      throw new Error('Empty instruction line');
    }

    const tokens = trimmed.split(/[\s,()]+/).filter(Boolean);
    const mnemonic = tokens[0]!.toLowerCase();

    switch (mnemonic) {
      // --- R-TYPE ---
      case 'add':
      case 'sub':
      case 'and':
      case 'or':
      case 'xor':
      case 'sll':
      case 'srl':
      case 'slt': {
        const rd = this.parseRegister(tokens[1]!);
        const rs1 = this.parseRegister(tokens[2]!);
        const rs2 = this.parseRegister(tokens[3]!);
        return {
          address,
          rawHex: '0x00000000',
          binary: '0'.repeat(32),
          mnemonic,
          format: 'R',
          rd,
          rs1,
          rs2,
          opcode: 0x33,
          assembly: `${mnemonic} x${rd}, x${rs1}, x${rs2}`,
        };
      }

      // --- I-TYPE Arithmetic ---
      case 'addi':
      case 'andi':
      case 'ori':
      case 'xori':
      case 'slli':
      case 'srli':
      case 'slti': {
        const rd = this.parseRegister(tokens[1]!);
        const rs1 = this.parseRegister(tokens[2]!);
        const imm = parseInt(tokens[3]!, 10);
        return {
          address,
          rawHex: '0x00000000',
          binary: '0'.repeat(32),
          mnemonic,
          format: 'I',
          rd,
          rs1,
          imm,
          opcode: 0x13,
          assembly: `${mnemonic} x${rd}, x${rs1}, ${imm}`,
        };
      }

      // --- I-TYPE Load ---
      case 'lw': {
        const rd = this.parseRegister(tokens[1]!);
        const imm = parseInt(tokens[2]!, 10);
        const rs1 = this.parseRegister(tokens[3]!);
        return {
          address,
          rawHex: '0x00000000',
          binary: '0'.repeat(32),
          mnemonic: 'lw',
          format: 'I',
          rd,
          rs1,
          imm,
          opcode: 0x03,
          assembly: `lw x${rd}, ${imm}(x${rs1})`,
        };
      }

      // --- S-TYPE Store ---
      case 'sw': {
        const rs2 = this.parseRegister(tokens[1]!);
        const imm = parseInt(tokens[2]!, 10);
        const rs1 = this.parseRegister(tokens[3]!);
        return {
          address,
          rawHex: '0x00000000',
          binary: '0'.repeat(32),
          mnemonic: 'sw',
          format: 'S',
          rs1,
          rs2,
          imm,
          opcode: 0x23,
          assembly: `sw x${rs2}, ${imm}(x${rs1})`,
        };
      }

      // --- B-TYPE Branch ---
      case 'beq':
      case 'bne':
      case 'blt':
      case 'bge': {
        const rs1 = this.parseRegister(tokens[1]!);
        const rs2 = this.parseRegister(tokens[2]!);
        const imm = parseInt(tokens[3]!, 10);
        return {
          address,
          rawHex: '0x00000000',
          binary: '0'.repeat(32),
          mnemonic,
          format: 'B',
          rs1,
          rs2,
          imm,
          opcode: 0x63,
          assembly: `${mnemonic} x${rs1}, x${rs2}, ${imm}`,
        };
      }

      // --- U-TYPE ---
      case 'lui': {
        const rd = this.parseRegister(tokens[1]!);
        const imm = parseInt(tokens[2]!, 10);
        return {
          address,
          rawHex: '0x00000000',
          binary: '0'.repeat(32),
          mnemonic: 'lui',
          format: 'U',
          rd,
          imm,
          opcode: 0x37,
          assembly: `lui x${rd}, ${imm}`,
        };
      }

      // --- J-TYPE Jump ---
      case 'jal': {
        const rd = this.parseRegister(tokens[1]!);
        const imm = parseInt(tokens[2]!, 10);
        return {
          address,
          rawHex: '0x00000000',
          binary: '0'.repeat(32),
          mnemonic: 'jal',
          format: 'J',
          rd,
          imm,
          opcode: 0x6f,
          assembly: `jal x${rd}, ${imm}`,
        };
      }

      default:
        throw new Error(`Unsupported RV32I instruction: ${mnemonic}`);
    }
  }

  /**
   * Assemble a multi-line program into a list of instructions.
   */
  static assembleProgram(source: string): DecodedInstruction[] {
    const lines = source.split('\n');
    const instructions: DecodedInstruction[] = [];
    let currentAddress = 0;

    for (const rawLine of lines) {
      const line = rawLine.split('#')[0]!.split(';')[0]!.trim();
      if (!line) continue;
      // Skip labels for now or parse instruction
      if (line.endsWith(':')) continue;

      const inst = this.assembleLine(line, currentAddress);
      instructions.push(inst);
      currentAddress += 4;
    }

    return instructions;
  }
}

/**
 * Pre-built educational assembly programs.
 */
export const SAMPLE_RISCV_PROGRAMS = {
  fibonacci: `# Fibonacci Generator
# Compute first N Fibonacci numbers in registers
addi x1, x0, 0     # F(0) = 0
addi x2, x0, 1     # F(1) = 1
addi x3, x0, 8     # Counter N = 8
addi x4, x0, 0     # Loop index i = 0
# Loop body:
add  x5, x1, x2    # F(next) = F(n-1) + F(n-2)
addi x1, x2, 0     # Shift F(n-2) = F(n-1)
addi x2, x5, 0     # Shift F(n-1) = F(next)
addi x4, x4, 1     # i++
`,

  factorial: `# Factorial Calculation (5! = 120)
addi x1, x0, 5     # N = 5
addi x2, x0, 1     # result = 1
addi x3, x0, 1     # counter i = 1
# Repeated addition multiplication
add  x4, x2, x0    # temp = result
add  x2, x4, x4    # multiply by 2
addi x1, x1, -1    # N--
`,

  arraySum: `# Memory Array Sum
addi x1, x0, 0     # Sum accumulator = 0
addi x2, x0, 0     # Base address = 0
sw   x3, 0(x2)     # Store 10 at arr[0]
sw   x4, 4(x2)     # Store 20 at arr[1]
lw   x5, 0(x2)     # Load arr[0]
add  x1, x1, x5    # sum += arr[0]
lw   x6, 4(x2)     # Load arr[1]
add  x1, x1, x6    # sum += arr[1]
`,
};
