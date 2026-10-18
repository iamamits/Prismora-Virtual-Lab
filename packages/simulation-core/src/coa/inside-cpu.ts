/**
 * Inside the CPU — 8-Bit Architecture Simulation Engine
 * Ported and enhanced from Amit Singh's Inside-the-CPU project.
 *
 * Implements:
 * - 8-bit CPU with 8 general-purpose registers (R0-R7), PC, MAR, MDR, IR
 * - 5-Stage Pipeline (FETCH, DECODE, EXECUTE, MEMORY, WRITE BACK)
 * - ALU with status flags (Z, C, S, V)
 * - Direct-Mapped Cache (2, 4, 8 lines) with 1-cycle hit / 3-cycle miss timing
 * - Hazard detection (RAW data stalls, branch flushes, structural stalls, cache misses)
 * - Full 256-byte RAM and Assembler
 */

export const CPU_STAGES = ['FETCH', 'DECODE', 'EXECUTE', 'MEMORY', 'WRITE BACK'] as const;
export type CPUStage = (typeof CPU_STAGES)[number] | 'HALTED';

export interface CPUFlags {
  Z: boolean; // Zero flag
  C: boolean; // Carry flag
  S: boolean; // Sign flag (negative)
  V: boolean; // Overflow flag
}

export interface InsideCPUALUResult {
  a: number;
  b: number;
  op: string;
  result: number;
  flags: CPUFlags;
}

export const OPCODES: Record<string, ('reg' | 'value' | 'address' | 'target')[]> = {
  MOV: ['reg', 'value'],
  LOAD: ['reg', 'address'],
  STORE: ['reg', 'address'],
  ADD: ['reg', 'value'],
  SUB: ['reg', 'value'],
  AND: ['reg', 'value'],
  OR: ['reg', 'value'],
  XOR: ['reg', 'value'],
  CMP: ['reg', 'value'],
  NOT: ['reg'],
  INC: ['reg'],
  DEC: ['reg'],
  JMP: ['target'],
  JZ: ['target'],
  JNZ: ['target'],
  JC: ['target'],
  CALL: ['target'],
  RET: [],
  IN: ['reg'],
  OUT: ['value'],
  NOP: [],
  HALT: [],
};

export const OPCODE_BYTES: Record<string, number> = Object.fromEntries(
  Object.keys(OPCODES).map((op, code) => [op, code]),
);

export const BRANCHES = new Set(['JMP', 'JZ', 'JNZ', 'JC', 'CALL', 'RET']);
export const WRITES = new Set([
  'MOV',
  'LOAD',
  'ADD',
  'SUB',
  'AND',
  'OR',
  'XOR',
  'NOT',
  'INC',
  'DEC',
  'IN',
]);

export function encodeInstruction(op: string, args: (string | number)[]): number[] {
  const bytes = [OPCODE_BYTES[op] ?? 0];
  const format = OPCODES[op] ?? [];
  format.forEach((kind, i) => {
    const operand = args[i];
    if (kind === 'value') {
      bytes.push(typeof operand === 'string' ? 1 : 0);
    }
    bytes.push(typeof operand === 'string' ? Number(operand[1]) : (operand as number));
  });
  return bytes;
}

export function registerReads(inst: InstructionRecord): string[] {
  const [a, b] = inst.args;
  if (inst.op === 'MOV') return typeof b === 'string' ? [b] : [];
  if (['ADD', 'SUB', 'AND', 'OR', 'XOR', 'CMP'].includes(inst.op)) {
    return [a, b].filter((v): v is string => typeof v === 'string' && /^R[0-7]$/.test(v));
  }
  if (['INC', 'DEC', 'NOT', 'STORE', 'OUT'].includes(inst.op)) {
    return [a].filter((v): v is string => typeof v === 'string' && /^R[0-7]$/.test(v));
  }
  return [];
}

export function registerWrite(inst: InstructionRecord): string | null {
  return WRITES.has(inst.op) && typeof inst.args[0] === 'string' ? inst.args[0] : null;
}

export function calculateALU(op: string, a: number, b: number = 0): InsideCPUALUResult {
  let raw: number;
  let carry = false;
  let overflow = false;

  switch (op) {
    case 'ADD':
      raw = a + b;
      carry = raw > 255;
      overflow = Boolean(~(a ^ b) & (a ^ raw) & 128);
      break;
    case 'SUB':
    case 'CMP':
      raw = a - b;
      carry = a >= b;
      overflow = Boolean((a ^ b) & (a ^ raw) & 128);
      break;
    case 'AND':
      raw = a & b;
      break;
    case 'OR':
      raw = a | b;
      break;
    case 'XOR':
      raw = a ^ b;
      break;
    case 'NOT':
      raw = ~a;
      break;
    case 'INC':
      raw = a + 1;
      carry = raw > 255;
      overflow = a === 127;
      break;
    case 'DEC':
      raw = a - 1;
      carry = a >= 1;
      overflow = a === 128;
      break;
    default:
      throw new Error(`Unknown ALU operation: ${op}`);
  }

  const result = raw & 255;
  return {
    a,
    b,
    op,
    result,
    flags: {
      Z: result === 0,
      C: carry,
      S: Boolean(result & 128),
      V: overflow,
    },
  };
}

export interface InstructionRecord {
  op: string;
  args: (string | number)[];
  address: number;
  line: number;
  bytes: number[];
  text: string;
}

export class AssemblyError extends Error {
  line: number;
  constructor(line: number, message: string) {
    super(`Line ${line}: ${message}`);
    this.line = line;
    this.name = 'AssemblyError';
  }
}

function parseTokenNumber(token: string): number {
  if (!/^(?:\d+|0x[\da-f]+|0b[01]+)$/i.test(token)) return NaN;
  return Number(token);
}

export function assembleInsideCPU(source: string): InstructionRecord[] {
  const labels = new Map<string, number>();
  const rows: { text: string; line: number }[] = [];

  source.split(/\r?\n/).forEach((raw, i) => {
    let line = raw.replace(/;.*$/, '').trim();
    while (/^[A-Za-z_]\w*\s*:/.test(line)) {
      const match = line.match(/^([A-Za-z_]\w*)\s*:/);
      if (match && match[1]) {
        const label = match[1].toUpperCase();
        if (labels.has(label)) {
          throw new AssemblyError(i + 1, `duplicate label ${label}`);
        }
        labels.set(label, rows.length);
        line = line.slice(match[0].length).trim();
      }
    }
    if (line) rows.push({ text: line, line: i + 1 });
  });

  if (rows.length > 256) {
    throw new AssemblyError(rows[256]!.line, 'program exceeds 256 instruction addresses');
  }

  return rows.map(({ text, line }, address) => {
    const match = text.match(/^([A-Za-z]+)(?:\s+(.*))?$/);
    if (!match || !match[1]) throw new AssemblyError(line, 'invalid instruction syntax');
    const op = match[1].toUpperCase();
    const format = OPCODES[op];
    if (!format) throw new AssemblyError(line, `invalid instruction ${op}`);

    const tail = (match[2] || '').trim();
    const tokens = tail ? tail.split(',').map((x) => x.trim()) : [];
    if (tokens.length !== format.length || tokens.some((x) => !x)) {
      throw new AssemblyError(
        line,
        `${op} needs ${format.length} operand${format.length === 1 ? '' : 's'}`,
      );
    }

    const args = tokens.map((token, index) => {
      const kind = format[index];
      const upper = token.toUpperCase();
      if (kind === 'reg') {
        if (!/^R[0-7]$/.test(upper)) {
          throw new AssemblyError(line, `invalid register ${token}; use R0–R7`);
        }
        return upper;
      }
      if (kind === 'value' && /^R[0-7]$/.test(upper)) return upper;
      if (kind === 'target' && labels.has(upper)) return labels.get(upper)!;

      const n = parseTokenNumber(token);
      if (!Number.isInteger(n) || n < 0 || n > 255) {
        const name =
          kind === 'target'
            ? `unknown label or invalid target ${token}`
            : kind === 'address'
              ? `invalid memory address ${token}`
              : `invalid immediate value ${token}`;
        throw new AssemblyError(line, name);
      }
      if (kind === 'target' && n >= rows.length) {
        throw new AssemblyError(line, `target ${n} is outside the program`);
      }
      return n;
    });

    return {
      op,
      args,
      address,
      line,
      bytes: encodeInstruction(op, args),
      text: `${op}${args.length ? ' ' + args.join(', ') : ''}`,
    };
  });
}

export interface InsideCPUCacheLine {
  valid: boolean;
  tag: number;
  block: number;
  data: number[];
}

export interface InsideCPUCacheAccessResult {
  address: number;
  index: number;
  tag: number;
  offset: number;
  hit: boolean;
  write: boolean;
  cycles: number;
}

export class InsideCPUCache {
  lineCount: number;
  blockSize: number;
  lines: InsideCPUCacheLine[];
  stats: { accesses: number; hits: number; misses: number };
  last: InsideCPUCacheAccessResult | null;

  constructor(lineCount = 4, blockSize = 4) {
    if (![2, 4, 8].includes(lineCount) || ![-1, 1, 2, 4, 8].includes(blockSize)) {
      lineCount = 4;
      blockSize = 4;
    }
    this.lineCount = lineCount;
    this.blockSize = blockSize;
    this.lines = [];
    this.stats = { accesses: 0, hits: 0, misses: 0 };
    this.last = null;
    this.reset();
  }

  reset(): void {
    this.lines = Array.from({ length: this.lineCount }, () => ({
      valid: false,
      tag: 0,
      block: 0,
      data: Array(this.blockSize).fill(0),
    }));
    this.stats = { accesses: 0, hits: 0, misses: 0 };
    this.last = null;
  }

  access(ram: Uint8Array, address: number, write = false, value = 0): number {
    const block = Math.floor(address / this.blockSize);
    const index = block % this.lineCount;
    const tag = Math.floor(block / this.lineCount);
    const offset = address % this.blockSize;

    const line = this.lines[index]!;
    const hit = line.valid && line.tag === tag;

    this.stats.accesses++;
    if (hit) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }

    if (!hit) {
      line.valid = true;
      line.tag = tag;
      line.block = block;
      line.data = Array.from(
        { length: this.blockSize },
        (_, i) => ram[block * this.blockSize + i] ?? 0,
      );
    }

    if (write) {
      ram[address] = value & 255;
      line.data[offset] = value & 255;
    }

    this.last = { address, index, tag, offset, hit, write, cycles: hit ? 1 : 3 };
    return write ? value & 255 : (line.data[offset] ?? 0);
  }
}

export interface PipelineStages {
  IF: number;
  ID: number;
  EX: number;
  MEM: number;
  WB: number;
}

export interface PipelineRow {
  inst: InstructionRecord;
  stages: PipelineStages;
  dataStalls: number;
  structuralStalls: number;
  control: boolean;
  branchTaken: boolean;
  memoryDelay: number;
}

export interface PipelineEvent {
  cycle: number;
  text: string;
}

export class InsideCPUPipeline {
  rows: PipelineRow[];
  events: PipelineEvent[];
  nextIF: number;

  constructor() {
    this.rows = [];
    this.events = [];
    this.nextIF = 1;
  }

  reset(): void {
    this.rows = [];
    this.events = [];
    this.nextIF = 1;
  }

  commit(
    inst: InstructionRecord,
    memoryDelay = 1,
    branchTaken = false,
  ): PipelineRow {
    const prev = this.rows.at(-1);
    const reads = registerReads(inst);
    const control = Boolean(prev && prev.branchTaken);
    let start = this.nextIF;

    if (control && prev) {
      start += 2;
      this.events.push({
        cycle: start - 1,
        text: `Control hazard after ${prev.inst.op}: flush 2 slots`,
      });
    }

    const originalStart = start;
    const producers = this.rows.filter((row) =>
      reads.includes(registerWrite(row.inst) ?? ''),
    );
    const latest = producers.at(-1);

    for (const row of producers) {
      start = Math.max(start, row.stages.WB - 2);
    }

    const dataStalls = start - originalStart;
    if (dataStalls && latest) {
      this.events.push({
        cycle: start - 1,
        text: `RAW data hazard: ${inst.text} waits ${dataStalls} cycle${dataStalls === 1 ? '' : 's'} for ${registerWrite(latest.inst)}`,
      });
    }

    const beforeStructural = start;
    for (const row of this.rows) {
      if (start + 3 >= row.stages.MEM && start + 3 < row.stages.WB) {
        start = row.stages.WB - 3;
      }
    }

    const structuralStalls = start - beforeStructural;
    if (structuralStalls) {
      this.events.push({
        cycle: start - 1,
        text: `Structural hazard: MEM busy for ${structuralStalls} cycle${structuralStalls === 1 ? '' : 's'}`,
      });
    }

    const stages: PipelineStages = {
      IF: start,
      ID: start + 1,
      EX: start + 2,
      MEM: start + 3,
      WB: start + 3 + memoryDelay,
    };

    if (memoryDelay > 1) {
      this.events.push({
        cycle: stages.MEM,
        text: `Cache miss: MEM stalls ${memoryDelay - 1} cycles`,
      });
    }

    const entry: PipelineRow = {
      inst,
      stages,
      dataStalls,
      structuralStalls,
      control,
      branchTaken,
      memoryDelay,
    };

    this.rows.push(entry);
    this.nextIF = start + 1;
    return entry;
  }

  get cycles(): number {
    return Math.max(0, ...this.rows.map((r) => r.stages.WB));
  }
}

export interface ExecutionLogEntry {
  cycle: number;
  stage: string;
  instruction: string;
  ops: string[];
  signals: string[];
}

export class InsideCPU {
  source: string;
  cache: InsideCPUCache;
  pipeline: InsideCPUPipeline;
  program: InstructionRecord[];
  registers: number[];
  ram: Uint8Array;
  PC: number;
  IR: string;
  MAR: number;
  MDR: number;
  flags: CPUFlags;
  alu: InsideCPUALUResult;
  stageIndex: number;
  current: InstructionRecord | null;
  pending: {
    result?: number;
    flags?: CPUFlags;
    output?: number;
    branchTaken?: boolean;
    memoryDelay?: number;
  };
  cycles: number;
  executed: number;
  halted: boolean;
  input: number[];
  output: number[];
  callStack: number[];
  log: ExecutionLogEntry[];
  microOps: string[];
  signals: string[];
  changed: string[];
  hazard: string | null;

  constructor(source = 'HALT', config: { cacheLines?: number; blockSize?: number } = {}) {
    this.source = source;
    this.cache = new InsideCPUCache(config.cacheLines || 4, config.blockSize || 4);
    this.pipeline = new InsideCPUPipeline();
    this.program = [];
    this.registers = Array(8).fill(0);
    this.ram = new Uint8Array(256);
    this.PC = 0;
    this.IR = '—';
    this.MAR = 0;
    this.MDR = 0;
    this.flags = { Z: false, C: false, S: false, V: false };
    this.alu = { a: 0, b: 0, op: '—', result: 0, flags: { Z: false, C: false, S: false, V: false } };
    this.stageIndex = 0;
    this.current = null;
    this.pending = {};
    this.cycles = 0;
    this.executed = 0;
    this.halted = false;
    this.input = [];
    this.output = [];
    this.callStack = [];
    this.log = [];
    this.microOps = [];
    this.signals = [];
    this.changed = [];
    this.hazard = null;
    this.reset();
  }

  reset(source = this.source): this {
    const program = assembleInsideCPU(source);
    this.source = source;
    this.program = program;
    this.registers = Array(8).fill(0);
    this.ram = new Uint8Array(256);
    this.PC = 0;
    this.IR = '—';
    this.MAR = 0;
    this.MDR = 0;
    this.flags = { Z: false, C: false, S: false, V: false };
    this.alu = { a: 0, b: 0, op: '—', result: 0, flags: { Z: false, C: false, S: false, V: false } };
    this.cache.reset();
    this.pipeline.reset();
    this.stageIndex = 0;
    this.current = null;
    this.pending = {};
    this.cycles = 0;
    this.executed = 0;
    this.halted = false;
    this.input = [];
    this.output = [];
    this.callStack = [];
    this.log = [];
    this.microOps = [];
    this.signals = [];
    this.changed = [];
    this.hazard = null;
    return this;
  }

  get stage(): CPUStage {
    return this.halted ? 'HALTED' : (CPU_STAGES[this.stageIndex] ?? 'FETCH');
  }

  value(operand: string | number): number {
    return typeof operand === 'string'
      ? (this.registers[Number(operand[1])] ?? 0)
      : operand;
  }

  setRegister(name: string, val: number): void {
    const regNum = Number(name[1]);
    this.registers[regNum] = val & 255;
    this.changed.push(name);
  }

  setPC(value: number): void {
    this.PC = value;
    this.changed.push('PC');
  }

  step(): boolean {
    if (this.halted) return false;
    this.cycles++;
    this.changed = [];
    this.microOps = [];
    this.signals = [];

    const stage = this.stage;
    if (stage === 'FETCH') this.fetch();
    else if (stage === 'DECODE') this.decode();
    else if (stage === 'EXECUTE') this.execute();
    else if (stage === 'MEMORY') this.memory();
    else this.writeBack();

    const entry: ExecutionLogEntry = {
      cycle: this.cycles,
      stage,
      instruction: this.current?.text || this.IR,
      ops: [...this.microOps],
      signals: [...this.signals],
    };

    this.log.push(entry);
    if (this.log.length > 600) this.log.shift();
    return true;
  }

  stepInstruction(): boolean {
    if (this.halted) return false;
    do {
      this.step();
    } while (this.stageIndex !== 0 && !this.halted);
    return !this.halted;
  }

  fetch(): void {
    if (this.PC >= this.program.length) {
      this.halted = true;
      this.microOps.push('PC passed the end of the program; halt execution');
      return;
    }

    this.MAR = this.PC;
    this.current = this.program[this.PC]!;
    this.MDR = this.current.bytes[0]!;
    this.IR = this.current.text;
    this.setPC(this.PC + 1);
    this.pending = { branchTaken: false, memoryDelay: 1 };
    this.changed.push('MAR', 'MDR', 'IR');

    this.microOps.push(
      'MAR ← PC',
      `MDR ← InstructionROM[MAR].opcode (0x${this.MDR.toString(16).toUpperCase().padStart(2, '0')})`,
      `IR ← decode ROM record [${this.current.bytes.map((x) => x.toString(16).toUpperCase().padStart(2, '0')).join(' ')}]`,
      'PC ← PC + 1',
    );
    this.signals = ['PC_OUT', 'MAR_IN', 'MEM_READ', 'MDR_IN', 'IR_IN'];
    this.stageIndex = 1;
  }

  decode(): void {
    if (!this.current) return;
    const inst = this.current;
    this.microOps.push(`Decode ${inst.op}: ${inst.args.join(', ') || 'no operands'}`);
    const reads = registerReads(inst);
    if (reads.length) {
      this.signals.push('REG_READ');
      this.microOps.push(...reads.map((r) => `A/B ← ${r} (${this.value(r)})`));
    }
    this.stageIndex = 2;
  }

  execute(): void {
    if (!this.current) return;
    const { op, args } = this.current;
    const [a, b] = args;

    if (['ADD', 'SUB', 'AND', 'OR', 'XOR', 'NOT', 'INC', 'DEC', 'CMP'].includes(op)) {
      const valA = this.value(a!);
      const valB = b === undefined ? 0 : this.value(b);
      const result = calculateALU(op, valA, valB);
      this.alu = result;
      this.pending.result = result.result;
      this.pending.flags = result.flags;
      this.signals.push('REG_READ', 'ALU_ENABLE', `ALU_OP=${op}`);
      this.microOps.push(
        `ALU ← ${result.a} ${op} ${result.b} = ${result.result}`,
        'FLAGS ← ALU status at write back',
      );
    } else if (op === 'MOV') {
      this.pending.result = this.value(b!);
      this.microOps.push(`${a} ← ${b} (${this.value(b!)}) at write back`);
      if (typeof b === 'string') this.signals.push('REG_READ');
    } else if (op === 'LOAD' || op === 'STORE') {
      this.MAR = b as number;
      this.changed.push('MAR');
      this.microOps.push(`MAR ← ${b}`);
      if (op === 'STORE') {
        this.MDR = this.value(a!);
        this.changed.push('MDR');
        this.microOps.push(`MDR ← ${a} (${this.MDR})`);
      }
    } else if (op === 'IN') {
      if (!this.input.length) {
        this.cycles--;
        throw new Error('Input queue is empty. Add a byte in the I/O panel.');
      }
      this.pending.result = this.input.shift()!;
      this.signals.push('IO_READ');
      this.microOps.push(`${a} ← input byte ${this.pending.result} at write back`);
    } else if (op === 'OUT') {
      this.pending.output = this.value(a!);
      this.signals.push('REG_READ');
      this.microOps.push(`Output latch ← ${a} (${this.pending.output})`);
    } else if (BRANCHES.has(op)) {
      const taken =
        op === 'JMP' ||
        op === 'CALL' ||
        op === 'RET' ||
        (op === 'JZ' && this.flags.Z) ||
        (op === 'JNZ' && !this.flags.Z) ||
        (op === 'JC' && this.flags.C);

      if (op === 'RET' && !this.callStack.length) {
        throw new Error('RET with an empty call stack');
      }

      if (taken) {
        if (op === 'CALL') this.callStack.push(this.PC);
        this.setPC(op === 'RET' ? this.callStack.pop()! : (a as number));
        this.signals.push('PC_LOAD');
        this.microOps.push(`PC ← ${this.PC}`);
      } else {
        this.microOps.push(`${op} condition false; PC remains ${this.PC}`);
      }

      this.pending.branchTaken = taken;
      this.hazard = taken ? `Control hazard: ${op} taken; pipeline flushes 2 slots` : null;
    } else {
      this.microOps.push(
        op === 'HALT' ? 'Control unit requests stop at write back' : 'No state change',
      );
    }

    this.stageIndex = 3;
  }

  memory(): void {
    if (!this.current) return;
    const { op, args } = this.current;
    const [a, b] = args;

    if (op === 'LOAD') {
      const val = this.cache.access(this.ram, b as number);
      this.MDR = val;
      this.pending.result = val;
      this.pending.memoryDelay = this.cache.last?.cycles ?? 1;
      this.changed.push('MDR');
      this.signals.push('MEM_READ', 'MDR_IN');
      this.microOps.push(
        `MDR ← Cache/RAM[${b}] (${val}) (${this.cache.last?.hit ? 'hit 1 cycle' : 'miss 3 cycles'})`,
      );
    } else if (op === 'STORE') {
      this.cache.access(this.ram, b as number, true, this.value(a!));
      this.pending.memoryDelay = this.cache.last?.cycles ?? 1;
      this.signals.push('MEM_WRITE');
      this.microOps.push(
        `RAM[${b}] and Cache ← ${a} (${this.value(a!)}) (${this.cache.last?.hit ? 'hit 1 cycle' : 'miss 3 cycles'})`,
      );
    } else {
      this.microOps.push('No memory access in this instruction');
    }

    this.stageIndex = 4;
  }

  writeBack(): void {
    if (!this.current) return;
    const { op, args } = this.current;
    const [a] = args;

    if (this.pending.result !== undefined && typeof a === 'string') {
      this.setRegister(a, this.pending.result);
      this.signals.push('REG_WRITE');
      this.microOps.push(`${a} ← ${this.pending.result}`);
    }

    if (this.pending.flags) {
      this.flags = { ...this.pending.flags };
      this.changed.push('FLAGS');
      this.microOps.push(
        `Flags updated: Z=${this.flags.Z ? 1 : 0} C=${this.flags.C ? 1 : 0} S=${this.flags.S ? 1 : 0} V=${this.flags.V ? 1 : 0}`,
      );
    }

    if (this.pending.output !== undefined) {
      this.output.push(this.pending.output);
      this.changed.push('OUTPUT');
      this.microOps.push(`Output port received byte ${this.pending.output}`);
    }

    this.executed++;
    this.pipeline.commit(
      this.current,
      this.pending.memoryDelay || 1,
      this.pending.branchTaken || false,
    );

    if (op === 'HALT') {
      this.halted = true;
      this.microOps.push('Processor execution halted');
    }

    this.stageIndex = 0;
  }
}

export const INSIDE_CPU_EXAMPLES: Record<string, string> = {
  'Basic arithmetic': `; Add two bytes and display the result
MOV R1, 15
MOV R2, 10
ADD R1, R2
OUT R1
HALT`,
  'Memory read/write': `MOV R1, 42
STORE R1, 100
LOAD R2, 100
OUT R2
HALT`,
  'Loop (Countdown)': `MOV R1, 5
LOOP: OUT R1
DEC R1
JNZ LOOP
HALT`,
  'Conditional branch': `MOV R1, 8
CMP R1, 8
JZ EQUAL
MOV R2, 0
JMP END
EQUAL: MOV R2, 1
END: OUT R2
HALT`,
  'Cache behavior': `MOV R1, 21
STORE R1, 64
LOAD R2, 64
LOAD R3, 65
LOAD R4, 80
LOAD R5, 64
OUT R5
HALT`,
  'Pipeline hazards': `MOV R1, 10
ADD R2, R1
SUB R3, R2
CMP R3, 0
JNZ DONE
MOV R4, 99
DONE: OUT R3
HALT`,
  'Input / output': `IN R1
MOV R2, 2
ADD R1, R2
OUT R1
HALT`,
};
