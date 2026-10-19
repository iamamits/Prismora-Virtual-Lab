'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  FastForward,
  Layers,
  MemoryStick,
  Pause,
  Play,
  RotateCcw,
  SkipForward,
  Terminal,
  Zap,
} from 'lucide-react';
import {
  InsideCPU,
  INSIDE_CPU_EXAMPLES,
  type CPUStage,
  type InstructionRecord,
  CacheAssociativity,
  CacheSimulator,
  PipelinedCPU,
  PipelineState,
  ReplacementPolicy,
  RISCV_REGISTERS,
  RISCVAssembler,
  SAMPLE_RISCV_PROGRAMS,
  SingleCycleCPU,
} from '@prismora/simulation-core';
import { Badge, BugReportModal, Button, Card, CardContent, CardHeader, CardTitle } from '@prismora/ui';
import { SimulationGuideModal } from '@/components/simulation/simulation-guide-modal';

export default function COALabPage() {
  const [activeTab, setActiveTab] = useState<'inside-cpu' | 'pipeline' | 'cache' | 'editor' | 'riscv'>('inside-cpu');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // ============================================================
  // INSIDE THE CPU (8-BIT SIMULATION ENGINE) STATE
  // ============================================================
  const [selectedExample, setSelectedExample] = useState<string>('Basic arithmetic');
  const [assemblyCode, setAssemblyCode] = useState<string>(INSIDE_CPU_EXAMPLES['Basic arithmetic'] ?? '');
  const [cacheLines, setCacheLines] = useState<number>(4);
  const [clockSpeedMs, setClockSpeedMs] = useState<number>(600);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [assemblyError, setAssemblyError] = useState<string | null>(null);

  const cpuRef = useRef<InsideCPU>(new InsideCPU(assemblyCode, { cacheLines: 4, blockSize: 4 }));
  const [cpuVersion, setCpuVersion] = useState<number>(0);

  const refreshUI = () => setCpuVersion((v) => v + 1);

  // Assemble and Reset
  const handleReset8Bit = (source = assemblyCode, lines = cacheLines) => {
    setIsRunning(false);
    try {
      cpuRef.current = new InsideCPU(source, { cacheLines: lines, blockSize: 4 });
      setAssemblyError(null);
      refreshUI();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setAssemblyError(err.message);
      }
    }
  };

  const handleSelectExample = (name: string) => {
    setSelectedExample(name);
    const code = INSIDE_CPU_EXAMPLES[name] ?? '';
    setAssemblyCode(code);
    handleReset8Bit(code);
  };

  const handleStepStage = () => {
    if (cpuRef.current.halted) return;
    try {
      cpuRef.current.step();
      refreshUI();
    } catch (err: unknown) {
      if (err instanceof Error) setAssemblyError(err.message);
    }
  };

  const handleStepInstruction = () => {
    if (cpuRef.current.halted) return;
    try {
      cpuRef.current.stepInstruction();
      refreshUI();
    } catch (err: unknown) {
      if (err instanceof Error) setAssemblyError(err.message);
    }
  };

  // Continuous Run Timer
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && !cpuRef.current.halted) {
      timer = setInterval(() => {
        try {
          const ok = cpuRef.current.step();
          refreshUI();
          if (!ok || cpuRef.current.halted) {
            setIsRunning(false);
          }
        } catch {
          setIsRunning(false);
        }
      }, clockSpeedMs);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, clockSpeedMs]);

  const cpu = cpuRef.current;

  // ============================================================
  // RISC-V 32-BIT DATAPATH STATE
  // ============================================================
  const [riscvCpu] = useState(() => {
    const instance = new SingleCycleCPU();
    const insts = RISCVAssembler.assembleProgram(SAMPLE_RISCV_PROGRAMS.fibonacci);
    instance.loadProgram(insts);
    return instance;
  });
  const [riscvState, setRiscvState] = useState(() => riscvCpu.getState());

  const handleStepRiscv = () => {
    setRiscvState(riscvCpu.step());
  };

  const handleResetRiscv = () => {
    const insts = RISCVAssembler.assembleProgram(SAMPLE_RISCV_PROGRAMS.fibonacci);
    riscvCpu.loadProgram(insts);
    setRiscvState(riscvCpu.getState());
  };

  // Diagnostic Snapshot for Bug Reporting
  const diagnosticSnapshot = {
    activeTab,
    selectedExample,
    stage: cpu.stage,
    cycles: cpu.cycles,
    pc: cpu.PC,
    ir: cpu.IR,
    registers: cpu.registers,
    flags: cpu.flags,
    cacheStats: cpu.cache.stats,
    pipelineRows: cpu.pipeline.rows.length,
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-zinc-100 flex flex-col font-sans select-none">
      {/* Top Header Breadcrumb & Diagnostics */}
      <header className="border-b border-zinc-800 bg-[#0c1222] px-4 lg:px-8 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/" className="text-zinc-400 hover:text-white font-medium transition-colors">
              Prismora
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/explore" className="text-zinc-400 hover:text-white font-medium transition-colors">
              Engineering
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="font-semibold text-cyan-400">Computer Organization &amp; Architecture</span>
            <Badge variant="engineering" className="ml-2">
              Inside the CPU &bull; 8-Bit + RV32I
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/70 text-cyan-300 hover:bg-cyan-900/80 border border-cyan-800/80 transition-colors shadow-xs"
              title="Open Computer Architecture Lab Manual & Guide"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lab Guide</span>
            </button>
            <BugReportModal
              simulationId="inside-cpu-coa"
              moduleName="Computer Architecture Laboratory"
              diagnosticSnapshot={diagnosticSnapshot}
            />
          </div>
        </div>
      </header>

      {/* Hero Strip & Lab Navigation */}
      <div className="border-b border-zinc-800/80 bg-[#0f172a]/60 px-4 lg:px-8 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-cyan-400 animate-pulse" />
              Inside the CPU: Microarchitecture &amp; Datapath Studio
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Step through Fetch, Decode, Execute, Memory, and Write Back. Observe real-time RTL micro-operations, active bus wires, register states, pipeline hazard stalls, and cache hit/miss timing.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-zinc-900/90 rounded-lg border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('inside-cpu')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'inside-cpu'
                  ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              1. 8-Bit Datapath
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'pipeline'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              2. 5-Stage Pipeline
            </button>
            <button
              onClick={() => setActiveTab('cache')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'cache'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <MemoryStick className="w-3.5 h-3.5" />
              3. Cache &amp; RAM
            </button>
            <button
              onClick={() => setActiveTab('editor')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'editor'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              4. Assembly Labs
            </button>
            <button
              onClick={() => setActiveTab('riscv')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'riscv'
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-600/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              5. RV32I Harvard
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: 8-BIT DATAPATH STUDIO (INSIDE THE CPU) */}
        {/* ============================================================ */}
        {activeTab === 'inside-cpu' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 8 Cols: Visual Interactive Datapath */}
            <div className="lg:col-span-8 space-y-6">
              {/* Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-zinc-900/90 border border-zinc-800 shadow-lg">
                <div className="flex items-center gap-2">
                  <Button
                    variant="cyan"
                    size="sm"
                    onClick={handleStepStage}
                    disabled={cpu.halted}
                    className="font-bold text-xs"
                  >
                    <SkipForward className="w-3.5 h-3.5 mr-1" />
                    Step Stage ({cpu.stage})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleStepInstruction}
                    disabled={cpu.halted}
                    className="text-xs"
                  >
                    <FastForward className="w-3.5 h-3.5 mr-1" />
                    Step Instruction
                  </Button>
                  <Button
                    variant={isRunning ? 'destructive' : 'outline'}
                    size="sm"
                    onClick={() => setIsRunning(!isRunning)}
                    disabled={cpu.halted}
                    className="text-xs"
                  >
                    {isRunning ? (
                      <>
                        <Pause className="w-3.5 h-3.5 mr-1" /> Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 mr-1 text-emerald-400" /> Run
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReset8Bit()}
                    className="text-xs text-zinc-400 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    Reset
                  </Button>
                </div>

                {/* Clock Speed & Status Readout */}
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5 text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Speed:</span>
                    <input
                      type="range"
                      min={100}
                      max={1500}
                      step={50}
                      value={clockSpeedMs}
                      onChange={(e) => setClockSpeedMs(Number(e.target.value))}
                      className="w-20 accent-cyan-400 cursor-pointer"
                    />
                    <span className="text-cyan-400 font-bold">{clockSpeedMs}ms</span>
                  </div>
                  <div className="border-l border-zinc-700 pl-3">
                    Cycle: <span className="text-amber-400 font-bold">{cpu.cycles}</span>
                  </div>
                </div>
              </div>

              {/* Graphical Datapath Diagram */}
              <div className="p-6 rounded-2xl bg-[#090e1a] border border-cyan-500/20 shadow-2xl relative overflow-hidden">
                {/* Stage Header Banner */}
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">Active Stage:</span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black tracking-wide ${
                        cpu.stage === 'FETCH'
                          ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                          : cpu.stage === 'DECODE'
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/40'
                          : cpu.stage === 'EXECUTE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : cpu.stage === 'MEMORY'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                          : cpu.stage === 'WRITE BACK'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : 'bg-zinc-800 text-zinc-400'
                      }`}
                    >
                      {cpu.stage}
                    </span>
                    {cpu.halted && (
                      <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-red-900/40 text-red-400 border border-red-700">
                        HALTED
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono">
                    IR: <span className="text-cyan-300 font-bold">{cpu.IR}</span>
                  </div>
                </div>

                {/* Animated Bus Wire Diagram (SVG + Components) */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative z-10">
                  {/* Block 1: PC & Instruction ROM */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      cpu.stage === 'FETCH'
                        ? 'bg-blue-950/40 border-blue-500/60 shadow-lg shadow-blue-500/10'
                        : 'bg-zinc-900/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400 mb-2">
                      <span>Fetch Unit</span>
                      <span className="text-blue-400 font-bold">STAGE 1</span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between p-1.5 rounded bg-zinc-950/80 border border-zinc-800">
                        <span className="text-zinc-500">PC:</span>
                        <span className="text-cyan-400 font-bold">0x{cpu.PC.toString(16).toUpperCase().padStart(2, '0')} ({cpu.PC})</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-zinc-950/80 border border-zinc-800">
                        <span className="text-zinc-500">MAR:</span>
                        <span className="text-amber-400 font-bold">0x{cpu.MAR.toString(16).toUpperCase().padStart(2, '0')}</span>
                      </div>
                      <div className="flex justify-between p-1.5 rounded bg-zinc-950/80 border border-zinc-800">
                        <span className="text-zinc-500">MDR:</span>
                        <span className="text-emerald-400 font-bold">0x{cpu.MDR.toString(16).toUpperCase().padStart(2, '0')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Block 2: Decode & Control Unit */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      cpu.stage === 'DECODE'
                        ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/10'
                        : 'bg-zinc-900/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400 mb-2">
                      <span>Control Unit</span>
                      <span className="text-purple-400 font-bold">STAGE 2</span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-1.5 rounded bg-zinc-950/80 border border-zinc-800">
                        <div className="text-[10px] text-zinc-500">Opcode:</div>
                        <div className="text-purple-300 font-bold truncate">{cpu.current?.op || 'IDLE'}</div>
                      </div>
                      <div className="p-1.5 rounded bg-zinc-950/80 border border-zinc-800">
                        <div className="text-[10px] text-zinc-500">Operands:</div>
                        <div className="text-zinc-300 font-bold truncate">
                          {cpu.current?.args.join(', ') || 'none'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Block 3: ALU & Arithmetic Unit */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      cpu.stage === 'EXECUTE'
                        ? 'bg-emerald-950/40 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                        : 'bg-zinc-900/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400 mb-2">
                      <span>ALU &amp; Flags</span>
                      <span className="text-emerald-400 font-bold">STAGE 3</span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="flex justify-between p-1.5 rounded bg-zinc-950/80 border border-zinc-800">
                        <span className="text-zinc-500">ALU Out:</span>
                        <span className="text-emerald-400 font-bold">{cpu.alu.result}</span>
                      </div>
                      {/* Status Flags */}
                      <div className="grid grid-cols-4 gap-1 text-center text-[10px]">
                        <div className={`p-1 rounded ${cpu.flags.Z ? 'bg-emerald-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-500'}`}>
                          Z:{cpu.flags.Z ? 1 : 0}
                        </div>
                        <div className={`p-1 rounded ${cpu.flags.C ? 'bg-cyan-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-500'}`}>
                          C:{cpu.flags.C ? 1 : 0}
                        </div>
                        <div className={`p-1 rounded ${cpu.flags.S ? 'bg-amber-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-500'}`}>
                          S:{cpu.flags.S ? 1 : 0}
                        </div>
                        <div className={`p-1 rounded ${cpu.flags.V ? 'bg-rose-500 text-zinc-950 font-bold' : 'bg-zinc-800 text-zinc-500'}`}>
                          V:{cpu.flags.V ? 1 : 0}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Block 4: Memory & Write Back */}
                  <div
                    className={`p-4 rounded-xl border transition-all ${
                      cpu.stage === 'MEMORY' || cpu.stage === 'WRITE BACK'
                        ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10'
                        : 'bg-zinc-900/60 border-zinc-800'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono uppercase text-zinc-400 mb-2">
                      <span>Memory &amp; WB</span>
                      <span className="text-amber-400 font-bold">STAGE 4 &amp; 5</span>
                    </div>
                    <div className="space-y-2 text-xs font-mono">
                      <div className="p-1.5 rounded bg-zinc-950/80 border border-zinc-800 flex justify-between">
                        <span className="text-zinc-500">Cache Hit:</span>
                        <span className={`font-bold ${cpu.cache.last?.hit ? 'text-emerald-400' : 'text-zinc-500'}`}>
                          {cpu.cache.last ? (cpu.cache.last.hit ? 'HIT (1 cyc)' : 'MISS (3 cyc)') : '—'}
                        </span>
                      </div>
                      <div className="p-1.5 rounded bg-zinc-950/80 border border-zinc-800 flex justify-between">
                        <span className="text-zinc-500">Executed:</span>
                        <span className="text-cyan-400 font-bold">{cpu.executed} inst</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Micro-Operations & Active Signals Live Readout */}
                <div className="mt-6 pt-5 border-t border-zinc-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Micro-Operations */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800">
                    <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5" />
                      RTL Micro-Operations ({cpu.microOps.length})
                    </div>
                    <ul className="space-y-1 font-mono text-xs text-zinc-300">
                      {cpu.microOps.length > 0 ? (
                        cpu.microOps.map((op, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="text-cyan-500 font-bold">&bull;</span>
                            <span>{op}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-zinc-600 italic">No micro-operations currently executing</li>
                      )}
                    </ul>
                  </div>

                  {/* Active Bus Control Signals */}
                  <div className="p-3.5 rounded-xl bg-zinc-950/90 border border-zinc-800">
                    <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" />
                      Active Hardware Control Signals ({cpu.signals.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {cpu.signals.length > 0 ? (
                        cpu.signals.map((sig, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"
                          >
                            {sig}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-zinc-600 italic font-mono">No active control signals</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* General Purpose Registers (R0 - R7) */}
              <div className="p-5 rounded-2xl bg-zinc-900/80 border border-zinc-800">
                <div className="text-xs font-bold text-zinc-300 mb-3 uppercase tracking-wider flex items-center justify-between">
                  <span>8-Bit Register File (R0 &ndash; R7)</span>
                  <span className="text-[11px] font-normal text-zinc-500">Highlighted on modified cycle</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                  {cpu.registers.map((val, idx) => {
                    const regName = `R${idx}`;
                    const isChanged = cpu.changed.includes(regName);
                    return (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-center transition-all ${
                          isChanged
                            ? 'bg-cyan-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                            : 'bg-zinc-950/80 border-zinc-800'
                        }`}
                      >
                        <div className="text-[10px] font-mono text-zinc-400 font-bold">{regName}</div>
                        <div className="text-base font-mono font-black text-white mt-1">{val}</div>
                        <div className="text-[10px] font-mono text-zinc-500">0x{val.toString(16).toUpperCase().padStart(2, '0')}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Guided Programs & Assembled ROM */}
            <div className="lg:col-span-4 space-y-6">
              {/* Educational Preset Selector */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-cyan-400" />
                    Educational CPU Experiments
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.keys(INSIDE_CPU_EXAMPLES).map((name) => (
                    <button
                      key={name}
                      onClick={() => handleSelectExample(name)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between ${
                        selectedExample === name
                          ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300 shadow-sm'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
                      }`}
                    >
                      <span>{name}</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                    </button>
                  ))}
                </CardContent>
              </Card>

              {/* Assembled Instruction ROM View */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Instruction ROM (256-Word)</span>
                    <span className="text-xs font-mono text-zinc-500">{cpu.program.length} instructions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 max-h-[360px] overflow-y-auto pr-1">
                  {cpu.program.map((inst, idx) => {
                    const isCurrent = cpu.PC - 1 === idx && cpu.stage !== 'FETCH';
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-lg font-mono text-xs flex items-center justify-between border transition-all ${
                          isCurrent
                            ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                            : 'bg-zinc-950/40 border-zinc-800/80 text-zinc-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-zinc-600">0x{idx.toString(16).toUpperCase().padStart(2, '0')}</span>
                          <span className="font-bold text-zinc-200">{inst.text}</span>
                        </div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          [{inst.bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}]
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: 5-STAGE PIPELINE & HAZARD DETECTION */}
        {/* ============================================================ */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-purple-400" />
                    <span>5-Stage Instruction Pipeline Timing Diagram (IF &rarr; ID &rarr; EX &rarr; MEM &rarr; WB)</span>
                  </div>
                  <Badge variant="mathematics">{cpu.pipeline.rows.length} Instructions Committed</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pipeline Hazards Warning Banner */}
                {cpu.pipeline.events.length > 0 && (
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
                    <div className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                      Detected Microarchitectural Hazards &amp; Stalls:
                    </div>
                    <ul className="space-y-1 text-xs font-mono text-purple-200">
                      {cpu.pipeline.events.slice(-6).map((evt, idx) => (
                        <li key={idx} className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">[Cycle {evt.cycle}]</span>
                          <span>{evt.text}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Pipeline Grid Table */}
                <div className="overflow-x-auto border border-zinc-800 rounded-xl bg-zinc-950/80">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
                      <tr>
                        <th className="p-3">#</th>
                        <th className="p-3">Instruction</th>
                        <th className="p-3 text-center text-blue-400">IF</th>
                        <th className="p-3 text-center text-purple-400">ID</th>
                        <th className="p-3 text-center text-emerald-400">EX</th>
                        <th className="p-3 text-center text-amber-400">MEM</th>
                        <th className="p-3 text-center text-rose-400">WB</th>
                        <th className="p-3">Stalls / Flushes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/80">
                      {cpu.pipeline.rows.length > 0 ? (
                        cpu.pipeline.rows.map((row, i) => (
                          <tr key={i} className="hover:bg-zinc-900/40 transition-colors">
                            <td className="p-3 text-zinc-600">{i + 1}</td>
                            <td className="p-3 font-bold text-white">{row.inst.text}</td>
                            <td className="p-3 text-center font-bold text-blue-300">C{row.stages.IF}</td>
                            <td className="p-3 text-center font-bold text-purple-300">C{row.stages.ID}</td>
                            <td className="p-3 text-center font-bold text-emerald-300">C{row.stages.EX}</td>
                            <td className="p-3 text-center font-bold text-amber-300">C{row.stages.MEM}</td>
                            <td className="p-3 text-center font-bold text-rose-300">C{row.stages.WB}</td>
                            <td className="p-3">
                              {row.dataStalls > 0 && (
                                <span className="mr-1.5 px-2 py-0.5 rounded text-[10px] bg-red-950/60 text-red-400 border border-red-800">
                                  RAW +{row.dataStalls}
                                </span>
                              )}
                              {row.control && (
                                <span className="mr-1.5 px-2 py-0.5 rounded text-[10px] bg-purple-950/60 text-purple-400 border border-purple-800">
                                  BRANCH FLUSH 2
                                </span>
                              )}
                              {row.memoryDelay > 1 && (
                                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-950/60 text-amber-400 border border-amber-800">
                                  CACHE STALL +{row.memoryDelay - 1}
                                </span>
                              )}
                              {!row.dataStalls && !row.control && row.memoryDelay <= 1 && (
                                <span className="text-zinc-600 text-[11px]">—</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={8} className="p-6 text-center text-zinc-600 italic">
                            Execute instructions to generate pipeline cycle timings.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CACHE & RAM MEMORY HIERARCHY */}
        {/* ============================================================ */}
        {activeTab === 'cache' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Cache Inspector */}
            <div className="lg:col-span-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MemoryStick className="w-4 h-4 text-emerald-400" />
                      <span>Direct-Mapped L1 Cache</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-normal">
                      <span>Lines:</span>
                      <select
                        value={cacheLines}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setCacheLines(val);
                          handleReset8Bit(assemblyCode, val);
                        }}
                        className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-xs text-white"
                      >
                        <option value={2}>2 Lines</option>
                        <option value={4}>4 Lines</option>
                        <option value={8}>8 Lines</option>
                      </select>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Cache Stats Bar */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                      <div className="text-[10px] text-zinc-500 uppercase font-mono">Accesses</div>
                      <div className="text-lg font-black text-white font-mono">{cpu.cache.stats.accesses}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                      <div className="text-[10px] text-emerald-500 uppercase font-mono">Hits (1 Cyc)</div>
                      <div className="text-lg font-black text-emerald-400 font-mono">{cpu.cache.stats.hits}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                      <div className="text-[10px] text-rose-500 uppercase font-mono">Misses (3 Cyc)</div>
                      <div className="text-lg font-black text-rose-400 font-mono">{cpu.cache.stats.misses}</div>
                    </div>
                  </div>

                  {/* Cache Lines Table */}
                  <div className="overflow-x-auto border border-zinc-800 rounded-xl bg-zinc-950/80">
                    <table className="w-full text-left font-mono text-xs">
                      <thead className="bg-zinc-900 border-b border-zinc-800 text-zinc-400">
                        <tr>
                          <th className="p-2.5">Line #</th>
                          <th className="p-2.5">Valid</th>
                          <th className="p-2.5">Tag</th>
                          <th className="p-2.5">Block Data (4 Bytes)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/80">
                        {cpu.cache.lines.map((line, idx) => {
                          const isLast = cpu.cache.last?.index === idx;
                          return (
                            <tr
                              key={idx}
                              className={`transition-colors ${
                                isLast
                                  ? 'bg-emerald-950/30 text-emerald-200'
                                  : 'hover:bg-zinc-900/30 text-zinc-300'
                              }`}
                            >
                              <td className="p-2.5 font-bold text-cyan-400">Line {idx}</td>
                              <td className="p-2.5">
                                <span
                                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                    line.valid ? 'bg-emerald-900/40 text-emerald-400' : 'bg-zinc-800 text-zinc-500'
                                  }`}
                                >
                                  {line.valid ? '1' : '0'}
                                </span>
                              </td>
                              <td className="p-2.5 font-bold text-amber-400">{line.valid ? line.tag : '—'}</td>
                              <td className="p-2.5 font-mono text-zinc-400">
                                [{line.data.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')}]
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 256-Byte RAM Hex Viewer */}
            <div className="lg:col-span-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-4 h-4 text-cyan-400" />
                      <span>256-Byte Main Memory (RAM)</span>
                    </div>
                    <span className="text-xs text-zinc-500 font-mono">0x00 &ndash; 0xFF</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[340px] overflow-y-auto font-mono text-xs border border-zinc-800 rounded-xl p-3 bg-zinc-950/90 grid grid-cols-8 gap-2">
                    {Array.from({ length: 64 }, (_, i) => {
                      const val = cpu.ram[i] ?? 0;
                      const isAccessed = cpu.cache.last?.address === i;
                      return (
                        <div
                          key={i}
                          className={`p-2 rounded border text-center transition-all ${
                            isAccessed
                              ? 'bg-amber-500/30 border-amber-400 font-bold text-amber-200'
                              : val > 0
                              ? 'bg-zinc-800/80 border-cyan-500/40 text-cyan-300'
                              : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-600'
                          }`}
                        >
                          <div className="text-[9px] text-zinc-500">{i}</div>
                          <div className="font-bold">{val}</div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: ASSEMBLY LABS & I/O CONSOLE */}
        {/* ============================================================ */}
        {activeTab === 'editor' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Assembly Program Source Editor</span>
                    <Button variant="cyan" size="sm" onClick={() => handleReset8Bit(assemblyCode)}>
                      Assemble &amp; Reload
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {assemblyError && (
                    <div className="p-3 rounded-lg bg-red-950/60 border border-red-800 text-xs text-red-300 font-mono">
                      {assemblyError}
                    </div>
                  )}
                  <textarea
                    rows={14}
                    value={assemblyCode}
                    onChange={(e) => setAssemblyCode(e.target.value)}
                    className="w-full bg-[#050811] text-cyan-300 font-mono text-xs p-4 rounded-xl border border-zinc-800 focus:border-cyan-500 outline-none resize-none leading-relaxed"
                    spellCheck={false}
                  />
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-4">
              {/* Output Port Display */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    I/O Port Output Stream
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 font-mono text-xs min-h-[120px] flex items-center justify-center">
                    {cpu.output.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {cpu.output.map((byte, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-sm font-bold font-mono"
                          >
                            OUT: {byte}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-zinc-600 italic">No output bytes emitted yet. Use &apos;OUT Rx&apos;.</span>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Supported Instructions Reference */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">ISA Instruction Set Architecture Reference</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs font-mono">
                  <div className="grid grid-cols-2 gap-2 text-zinc-300">
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-cyan-400 font-bold">MOV</span> Rd, value/Rs
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-cyan-400 font-bold">ADD</span> Rd, value/Rs
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-cyan-400 font-bold">SUB</span> Rd, value/Rs
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-cyan-400 font-bold">LOAD</span> Rd, addr
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-cyan-400 font-bold">STORE</span> Rs, addr
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-cyan-400 font-bold">JMP / JZ / JNZ</span> target
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-cyan-400 font-bold">CMP</span> Rd, value/Rs
                    </div>
                    <div className="p-2 rounded bg-zinc-950 border border-zinc-800">
                      <span className="text-cyan-400 font-bold">OUT</span> Rs / HALT
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: 32-BIT RISC-V HARVARD ARCHITECTURE */}
        {/* ============================================================ */}
        {activeTab === 'riscv' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-blue-400" />
                    <span>RV32I Single-Cycle Harvard Processor Simulation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="cyan" size="sm" onClick={handleStepRiscv}>
                      <SkipForward className="w-3.5 h-3.5 mr-1" />
                      Step RISC-V
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetRiscv}>
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Reset
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">PC:</div>
                    <div className="text-cyan-400 font-bold text-sm">0x{riscvState.pc.toString(16).padStart(8, '0')}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Instruction:</div>
                    <div className="text-emerald-400 font-bold text-sm">{riscvState.busValues.instruction}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">ALU Op:</div>
                    <div className="text-purple-400 font-bold text-sm">{riscvState.controlSignals.aluOp || 'NONE'}</div>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Cycles:</div>
                    <div className="text-amber-400 font-bold text-sm">{riscvState.cycleCount}</div>
                  </div>
                </div>

                {/* RISC-V Registers Grid */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2">
                  <div className="text-xs font-bold text-zinc-400">Registers x0 &ndash; x7 (zero, ra, sp, gp, tp, t0, t1, t2)</div>
                  <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                    {riscvState.registers.slice(0, 8).map((val, idx) => (
                      <div key={idx} className="p-2 rounded bg-zinc-900 border border-zinc-800 text-center font-mono">
                        <div className="text-[10px] text-zinc-500">x{idx}</div>
                        <div className="text-xs font-bold text-white">{val}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Universal COA Architecture Manual Modal */}
      <SimulationGuideModal
        simulationId="coa"
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
