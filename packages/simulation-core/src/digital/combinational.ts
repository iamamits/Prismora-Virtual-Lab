import type {
  ALUFlags,
  ALUOperation,
  ALUResult,
  FullAdderResult,
  FullSubtractorResult,
  LogicLevel,
} from './types';

/**
 * Combinational Logic Units: Adders, Subtractors, MUX, DEMUX, Encoders, Decoders, and ALU.
 */
export class CombinationalEngine {
  /**
   * Half Adder: S = A ⊕ B, C = A · B
   */
  static halfAdder(a: LogicLevel, b: LogicLevel): FullAdderResult {
    const sum = (a !== b ? 1 : 0) as LogicLevel;
    const carryOut = (a === 1 && b === 1 ? 1 : 0) as LogicLevel;
    return { sum, carryOut };
  }

  /**
   * Full Adder: S = A ⊕ B ⊕ Cin, Cout = (A · B) + (Cin · (A ⊕ B))
   */
  static fullAdder(a: LogicLevel, b: LogicLevel, cin: LogicLevel): FullAdderResult {
    const p = a !== b ? 1 : 0;
    const sum = (p !== cin ? 1 : 0) as LogicLevel;
    const carryOut = (a === 1 && b === 1) || (cin === 1 && p === 1) ? 1 : 0;
    return { sum, carryOut: carryOut as LogicLevel };
  }

  /**
   * Full Subtractor: D = A ⊕ B ⊕ Bin, Bout = (A' · B) + (Bin · (A ⊕ B)')
   */
  static fullSubtractor(a: LogicLevel, b: LogicLevel, bin: LogicLevel): FullSubtractorResult {
    const diff = ((a ^ b ^ bin) & 1) as LogicLevel;
    const notA = a === 0 ? 1 : 0;
    const borrowOut = (notA === 1 && b === 1) || (bin === 1 && (a === b ? 1 : 0) === 1) ? 1 : 0;
    return { difference: diff, borrowOut: borrowOut as LogicLevel };
  }

  /**
   * 4-Bit Ripple Carry Adder / Subtractor
   * mode = 0 for ADD, mode = 1 for SUBTRACT (using two's complement via XOR with mode and Cin = mode)
   */
  static rippleCarry4Bit(
    a: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
    b: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
    mode: 0 | 1 = 0,
  ): {
    sum: [LogicLevel, LogicLevel, LogicLevel, LogicLevel];
    carryOut: LogicLevel;
    overflow: boolean;
  } {
    let c: LogicLevel = mode;
    const sum: LogicLevel[] = [];
    let penultimateCarry: LogicLevel = 0;

    for (let i = 0; i < 4; i++) {
      const bInvert = ((b[i]! ^ mode) & 1) as LogicLevel;
      if (i === 3) penultimateCarry = c;
      const res = this.fullAdder(a[i]!, bInvert, c);
      sum.push(res.sum);
      c = res.carryOut;
    }

    // Overflow occurs when Carry into MSB != Carry out of MSB
    const overflow = penultimateCarry !== c;

    return {
      sum: sum as [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
      carryOut: c,
      overflow,
    };
  }

  /**
   * 4:1 Multiplexer
   * S1, S0 select one of inputs I0, I1, I2, I3
   */
  static mux4to1(
    inputs: [LogicLevel, LogicLevel, LogicLevel, LogicLevel],
    select: [LogicLevel, LogicLevel],
    enable: LogicLevel = 1,
  ): LogicLevel {
    if (enable === 0) return 0;
    const index = (select[1]! << 1) | select[0]!;
    return inputs[index] ?? 0;
  }

  /**
   * 1:4 Demultiplexer
   */
  static demux1to4(
    input: LogicLevel,
    select: [LogicLevel, LogicLevel],
    enable: LogicLevel = 1,
  ): [LogicLevel, LogicLevel, LogicLevel, LogicLevel] {
    const outputs: [LogicLevel, LogicLevel, LogicLevel, LogicLevel] = [0, 0, 0, 0];
    if (enable === 0) return outputs;
    const index = (select[1]! << 1) | select[0]!;
    outputs[index] = input;
    return outputs;
  }

  /**
   * 3-to-8 Binary Decoder with active-high outputs and Enable
   */
  static decoder3to8(
    inputs: [LogicLevel, LogicLevel, LogicLevel],
    enable: LogicLevel = 1,
  ): LogicLevel[] {
    const outputs = Array<LogicLevel>(8).fill(0);
    if (enable === 0) return outputs;
    const index = (inputs[2]! << 2) | (inputs[1]! << 1) | inputs[0]!;
    outputs[index] = 1;
    return outputs;
  }

  /**
   * 4-to-2 Priority Encoder (Input 3 has highest priority)
   */
  static priorityEncoder4to2(inputs: [LogicLevel, LogicLevel, LogicLevel, LogicLevel]): {
    y: [LogicLevel, LogicLevel];
    valid: LogicLevel;
  } {
    if (inputs[3] === 1) return { y: [1, 1], valid: 1 };
    if (inputs[2] === 1) return { y: [0, 1], valid: 1 };
    if (inputs[1] === 1) return { y: [1, 0], valid: 1 };
    if (inputs[0] === 1) return { y: [0, 0], valid: 1 };
    return { y: [0, 0], valid: 0 };
  }

  /**
   * 4-Bit Arithmetic Logic Unit (ALU)
   */
  static evaluateALU(
    a: number, // 0..15 (4-bit)
    b: number, // 0..15 (4-bit)
    op: ALUOperation,
    cin: LogicLevel = 0,
  ): ALUResult {
    const uA = a & 0x0f;
    const uB = b & 0x0f;
    let res = 0;
    let carry = false;
    let overflow = false;

    switch (op) {
      case 'ADD': {
        const fullSum = uA + uB + cin;
        res = fullSum & 0x0f;
        carry = fullSum > 15;
        // Two's complement signed overflow check for 4-bit (-8 to +7)
        const sA = uA >= 8 ? uA - 16 : uA;
        const sB = uB >= 8 ? uB - 16 : uB;
        const sRes = sA + sB + cin;
        overflow = sRes > 7 || sRes < -8;
        break;
      }
      case 'SUB': {
        const fullSub = uA - uB - cin;
        res = fullSub & 0x0f;
        carry = fullSub < 0;
        const sA = uA >= 8 ? uA - 16 : uA;
        const sB = uB >= 8 ? uB - 16 : uB;
        const sRes = sA - sB - cin;
        overflow = sRes > 7 || sRes < -8;
        break;
      }
      case 'AND':
        res = uA & uB;
        break;
      case 'OR':
        res = uA | uB;
        break;
      case 'XOR':
        res = uA ^ uB;
        break;
      case 'NOT':
        res = (~uA) & 0x0f;
        break;
      case 'SLL':
        res = (uA << 1) & 0x0f;
        carry = (uA & 0x08) !== 0;
        break;
      case 'SRL':
        res = (uA >> 1) & 0x0f;
        carry = (uA & 0x01) !== 0;
        break;
      case 'SLT': {
        const sA = uA >= 8 ? uA - 16 : uA;
        const sB = uB >= 8 ? uB - 16 : uB;
        res = sA < sB ? 1 : 0;
        break;
      }
    }

    const flags: ALUFlags = {
      zero: res === 0,
      sign: (res & 0x08) !== 0,
      carry,
      overflow,
    };

    return {
      result: res,
      binaryResult: res.toString(2).padStart(4, '0'),
      flags,
    };
  }
}
