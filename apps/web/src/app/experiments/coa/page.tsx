'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Database,
  Layers,
  Play,
  RotateCcw,
  SkipForward,
  Terminal,
} from 'lucide-react';
import {
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

export default function COALabPage() {
  const [activeTab, setActiveTab] = useState<'datapath' | 'pipeline' | 'code' | 'cache' | 'vmem'>('datapath');

  // --- CPU DATAPATH & CODE EXECUTION STATE ---
  const [selectedPreset, setSelectedPreset] = useState<'fibonacci' | 'factorial' | 'arraySum'>('fibonacci');
  const [assemblySource, setAssemblySource] = useState(SAMPLE_RISCV_PROGRAMS.fibonacci);

  // Single-Cycle CPU Instance
  const [cpu] = useState(() => {
    const instance = new SingleCycleCPU();
    const insts = RISCVAssembler.assembleProgram(SAMPLE_RISCV_PROGRAMS.fibonacci);
    instance.loadProgram(insts);
    return instance;
  });

  const [cpuState, setCpuState] = useState(() => cpu.getState());

  const handleStepCPU = () => {
    const next = cpu.step();
    setCpuState(next);
  };

  const handleResetCPU = (source = assemblySource) => {
    try {
      const insts = RISCVAssembler.assembleProgram(source);
      cpu.loadProgram(insts);
      setCpuState(cpu.getState());
    } catch {
      // Ignore assembly error on typing
    }
  };

  const handleSelectPreset = (preset: 'fibonacci' | 'factorial' | 'arraySum') => {
    setSelectedPreset(preset);
    const code = SAMPLE_RISCV_PROGRAMS[preset];
    setAssemblySource(code);
    handleResetCPU(code);
  };

  // --- PIPELINE STATE ---
  const [pipeline] = useState(() => {
    const p = new PipelinedCPU();
    const insts = RISCVAssembler.assembleProgram(SAMPLE_RISCV_PROGRAMS.fibonacci);
    p.loadProgram(insts);
    return p;
  });

  const [pipelineState, setPipelineState] = useState<PipelineState>(() => pipeline.step());

  const handleStepPipeline = () => {
    setPipelineState(pipeline.step());
  };

  const handleResetPipeline = () => {
    const insts = RISCVAssembler.assembleProgram(assemblySource);
    pipeline.loadProgram(insts);
    setPipelineState(pipeline.step());
  };

  // --- CACHE STATE ---
  const [cacheSize, setCacheSize] = useState<number>(256);
  const [blockSize, setBlockSize] = useState<number>(16);
  const [associativity, setAssociativity] = useState<CacheAssociativity>('direct');
  const [replacementPolicy, setReplacementPolicy] = useState<ReplacementPolicy>('LRU');

  const [cache] = useState(() => new CacheSimulator(256, 16, 'direct'));
  const [targetAddressInput, setTargetAddressInput] = useState<string>('0x100');
  const [cacheLog, setCacheLog] = useState<{ addr: string; hit: boolean; tag: number; index: number }[]>([]);
  const [cacheStats, setCacheStats] = useState(() => cache.getStats());

  const handleReconfigureCache = (
    cSize = cacheSize,
    bSize = blockSize,
    assoc = associativity,
    rep = replacementPolicy,
  ) => {
    cache.configure();
    setCacheStats(cache.getStats());
    setCacheLog([]);
  };

  const handleAccessCache = (hexAddr = targetAddressInput) => {
    const num = parseInt(hexAddr, 16);
    if (isNaN(num)) return;

    const res = cache.access(num);
    setCacheStats(cache.getStats());
    setCacheLog((prev) => [
      {
        addr: hexAddr,
        hit: res.hit,
        tag: res.addressBreakdown.tag,
        index: res.addressBreakdown.index,
      },
      ...prev.slice(0, 9),
    ]);
  };

  // Diagnostic snapshot for bug reports
  const diagnosticSnapshot = {
    activeTab,
    selectedPreset,
    pc: cpuState.pc,
    cycleCount: cpuState.cycleCount,
    registers: cpuState.registers.slice(0, 8),
    pipelineCycle: pipelineState.cycle,
    cacheStats,
    cacheConfig: { cacheSize, blockSize, associativity, replacementPolicy },
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Breadcrumb & Status Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium">
              Prismora
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/explore" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium">
              Engineering
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-cyan-600 dark:text-cyan-400">Computer Organization &amp; Architecture</span>
            <Badge variant="astronomy" className="ml-2">
              Phase 2
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <BugReportModal
              simulationId="coa-riscv"
              moduleName="Computer Organization & Architecture (RV32I)"
              diagnosticSnapshot={diagnosticSnapshot}
            />
          </div>
        </div>
      </header>

      {/* Module Title & Hero Strip */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a]/50 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Cpu className="w-6 h-6 text-[#06B6D4]" />
              RISC-V Microarchitecture &amp; Memory Hierarchy Lab
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Inspect single-cycle and 5-stage pipelined RV32I microarchitecture. Trace live datapath signals, RAW data hazard stalls, forwarding paths, and associative cache mapping.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('datapath')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'datapath'
                  ? 'bg-[#06B6D4] text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              1. Datapath &amp; CPU
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'pipeline'
                  ? 'bg-[#F43F5E] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              2. 5-Stage Pipeline
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'code'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              3. Assembly &amp; Registers
            </button>
            <button
              onClick={() => setActiveTab('cache')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'cache'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              4. Cache Hierarchy
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: SINGLE-CYCLE CPU DATAPATH */}
        {/* ============================================================ */}
        {activeTab === 'datapath' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>RV32I Harvard Datapath Execution</span>
                    <div className="flex items-center gap-2">
                      <Button variant="cyan" size="sm" onClick={handleStepCPU}>
                        <SkipForward className="w-3.5 h-3.5 mr-1" />
                        Step Instruction
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleResetCPU()}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Reset PC
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Schematic Datapath Diagram */}
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-white space-y-6 select-none">
                    {/* Top Status Strip */}
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3 text-xs font-mono">
                      <div>
                        PC: <span className="text-cyan-400 font-bold">0x{cpuState.pc.toString(16).padStart(4, '0')}</span>
                      </div>
                      <div>
                        Instruction: <span className="text-emerald-400 font-bold">{cpuState.busValues.instruction}</span>
                      </div>
                      <div>
                        Cycles: <span className="text-amber-400 font-bold">{cpuState.cycleCount}</span>
                      </div>
                    </div>

                    {/* Datapath Blocks Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-center">
                      {/* Block 1: PC & Instruction Memory */}
                      <div className="p-4 rounded-lg bg-zinc-800/80 border border-zinc-700 space-y-2">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">Instruction Fetch</div>
                        <div className="text-xs font-bold text-cyan-400">Inst Memory</div>
                        <div className="text-[11px] font-mono text-zinc-300">PC &rarr; 0x{cpuState.pc.toString(16)}</div>
                      </div>

                      {/* Block 2: Register File */}
                      <div className="p-4 rounded-lg bg-zinc-800/80 border border-zinc-700 space-y-2">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">Decode &amp; Regs</div>
                        <div className="text-xs font-bold text-purple-400">Register File</div>
                        <div className="text-[10px] font-mono text-zinc-300">
                          RS1: {cpuState.busValues.readData1} | RS2: {cpuState.busValues.readData2}
                        </div>
                      </div>

                      {/* Block 3: ALU */}
                      <div className="p-4 rounded-lg bg-zinc-800/80 border border-zinc-700 space-y-2">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">Execute (ALU)</div>
                        <div className="text-xs font-bold text-emerald-400">{cpuState.controlSignals.aluOp || 'ALU'}</div>
                        <div className="text-[10px] font-mono text-zinc-300">Result: {cpuState.busValues.aluResult}</div>
                      </div>

                      {/* Block 4: Data Memory & WB */}
                      <div className="p-4 rounded-lg bg-zinc-800/80 border border-zinc-700 space-y-2">
                        <div className="text-[10px] font-mono text-zinc-400 uppercase">Memory &amp; Writeback</div>
                        <div className="text-xs font-bold text-amber-400">Data Memory</div>
                        <div className="text-[10px] font-mono text-zinc-300">WB: {cpuState.busValues.writeBackData}</div>
                      </div>
                    </div>
                  </div>

                  {/* Active Program Picker */}
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300">Load Educational Program:</span>
                    <div className="flex gap-2">
                      {(['fibonacci', 'factorial', 'arraySum'] as const).map((p) => (
                        <button
                          key={p}
                          onClick={() => handleSelectPreset(p)}
                          className={`px-2.5 py-1 rounded text-xs font-bold capitalize transition-colors ${
                            selectedPreset === p
                              ? 'bg-cyan-600 text-white'
                              : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Control Signals Readout */}
            <div className="lg:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Control Unit Signals</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 font-mono text-xs">
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                    <div className="py-1.5 flex justify-between items-center">
                      <span className="text-zinc-500">RegWrite:</span>
                      <span className={`font-bold ${cpuState.controlSignals.regWrite ? 'text-emerald-500' : 'text-zinc-400'}`}>
                        {cpuState.controlSignals.regWrite ? '1 (TRUE)' : '0'}
                      </span>
                    </div>
                    <div className="py-1.5 flex justify-between items-center">
                      <span className="text-zinc-500">ALUSrc:</span>
                      <span className={`font-bold ${cpuState.controlSignals.aluSrc ? 'text-cyan-500' : 'text-zinc-400'}`}>
                        {cpuState.controlSignals.aluSrc ? '1 (Imm)' : '0 (Reg)'}
                      </span>
                    </div>
                    <div className="py-1.5 flex justify-between items-center">
                      <span className="text-zinc-500">MemRead:</span>
                      <span className={`font-bold ${cpuState.controlSignals.memRead ? 'text-blue-500' : 'text-zinc-400'}`}>
                        {cpuState.controlSignals.memRead ? '1 (READ)' : '0'}
                      </span>
                    </div>
                    <div className="py-1.5 flex justify-between items-center">
                      <span className="text-zinc-500">MemWrite:</span>
                      <span className={`font-bold ${cpuState.controlSignals.memWrite ? 'text-rose-500' : 'text-zinc-400'}`}>
                        {cpuState.controlSignals.memWrite ? '1 (WRITE)' : '0'}
                      </span>
                    </div>
                    <div className="py-1.5 flex justify-between items-center">
                      <span className="text-zinc-500">MemToReg:</span>
                      <span className={`font-bold ${cpuState.controlSignals.memToReg ? 'text-purple-500' : 'text-zinc-400'}`}>
                        {cpuState.controlSignals.memToReg ? '1 (Mem)' : '0 (ALU)'}
                      </span>
                    </div>
                    <div className="py-1.5 flex justify-between items-center">
                      <span className="text-zinc-500">Branch:</span>
                      <span className={`font-bold ${cpuState.controlSignals.branch ? 'text-amber-500' : 'text-zinc-400'}`}>
                        {cpuState.controlSignals.branch ? '1 (BRANCH)' : '0'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: 5-STAGE PIPELINED PROCESSOR & HAZARDS */}
        {/* ============================================================ */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>5-Stage Classic Pipeline (IF &bull; ID &bull; EX &bull; MEM &bull; WB)</span>
                  <div className="flex items-center gap-2">
                    <Button variant="coral" size="sm" onClick={handleStepPipeline}>
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Clock Cycle (&uarr;)
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleResetPipeline}>
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Reset Pipeline
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pipeline Stages Banner */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {/* IF Stage */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white space-y-2">
                    <div className="text-[10px] font-mono uppercase text-cyan-400 font-bold">1. IF (Fetch)</div>
                    <div className="font-mono text-xs font-bold truncate">
                      {pipelineState.if.bubble ? (
                        <span className="text-zinc-500">NOP ({pipelineState.if.bubbleReason || 'Bubble'})</span>
                      ) : (
                        <span className="text-emerald-400">{pipelineState.if.instruction?.assembly}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">PC: 0x{pipelineState.if.pc.toString(16)}</div>
                  </div>

                  {/* ID Stage */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white space-y-2">
                    <div className="text-[10px] font-mono uppercase text-purple-400 font-bold">2. ID (Decode)</div>
                    <div className="font-mono text-xs font-bold truncate">
                      {pipelineState.id.bubble ? (
                        <span className="text-zinc-500">NOP</span>
                      ) : (
                        <span className="text-emerald-400">{pipelineState.id.instruction?.assembly}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">Registers Read</div>
                  </div>

                  {/* EX Stage */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white space-y-2">
                    <div className="text-[10px] font-mono uppercase text-emerald-400 font-bold">3. EX (Execute)</div>
                    <div className="font-mono text-xs font-bold truncate">
                      {pipelineState.ex.bubble ? (
                        <span className="text-rose-400 font-bold">NOP ({pipelineState.ex.bubbleReason || 'Stall Bubble'})</span>
                      ) : (
                        <span className="text-emerald-400">{pipelineState.ex.instruction?.assembly}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">ALU Calc</div>
                  </div>

                  {/* MEM Stage */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white space-y-2">
                    <div className="text-[10px] font-mono uppercase text-amber-400 font-bold">4. MEM (Memory)</div>
                    <div className="font-mono text-xs font-bold truncate">
                      {pipelineState.mem.bubble ? (
                        <span className="text-zinc-500">NOP</span>
                      ) : (
                        <span className="text-emerald-400">{pipelineState.mem.instruction?.assembly}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">Data Access</div>
                  </div>

                  {/* WB Stage */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white space-y-2">
                    <div className="text-[10px] font-mono uppercase text-blue-400 font-bold">5. WB (Writeback)</div>
                    <div className="font-mono text-xs font-bold truncate">
                      {pipelineState.wb.bubble ? (
                        <span className="text-zinc-500">NOP</span>
                      ) : (
                        <span className="text-emerald-400">{pipelineState.wb.instruction?.assembly}</span>
                      )}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">Reg Commit</div>
                  </div>
                </div>

                {/* Pipeline Hazards & Forwarding Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <span className="text-zinc-500 font-bold">Cycle Count:</span>{' '}
                    <span className="text-cyan-600 font-black">{pipelineState.cycle}</span>
                  </div>
                  <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <span className="text-zinc-500 font-bold">Load-Use RAW Hazard Stall:</span>{' '}
                    <span className={pipelineState.hazardStall ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                      {pipelineState.hazardStall ? 'YES (Stall Injected)' : 'NO'}
                    </span>
                  </div>
                  <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    <span className="text-zinc-500 font-bold">Forwarding Units:</span>{' '}
                    <span className="text-purple-600 font-bold">
                      A: {pipelineState.forwardingA} | B: {pipelineState.forwardingB}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: ASSEMBLY CODE & REGISTER FILE */}
        {/* ============================================================ */}
        {activeTab === 'code' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>RV32I Assembly Editor</span>
                    <Button variant="default" size="sm" onClick={() => handleResetCPU(assemblySource)}>
                      Reassemble Code
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <textarea
                    rows={12}
                    value={assemblySource}
                    onChange={(e) => setAssemblySource(e.target.value)}
                    className="w-full p-4 rounded-xl bg-zinc-900 text-cyan-300 font-mono text-xs border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Register File Inspector */}
            <div className="lg:col-span-6 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Register File ($x0 - $x31)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs max-h-[320px] overflow-y-auto pr-1">
                    {cpuState.registers.map((val, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded border text-center ${
                          val !== 0
                            ? 'bg-cyan-950/40 border-cyan-800 text-cyan-300 font-bold'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500'
                        }`}
                      >
                        <div className="text-[10px] text-zinc-400">
                          x{idx} ({RISCV_REGISTERS[idx]?.abi})
                        </div>
                        <div className="truncate">{val}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: CACHE MEMORY HIERARCHY SIMULATOR */}
        {/* ============================================================ */}
        {activeTab === 'cache' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>L1 Cache Simulator &amp; Address Breakdown</span>
                  <Badge variant="mathematics">Memory Hierarchy</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Configuration Strip */}
                <div className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                  <div>
                    <label className="block font-semibold mb-1">Cache Associativity:</label>
                    <select
                      value={associativity}
                      onChange={(e) => {
                        const val = e.target.value as CacheAssociativity;
                        setAssociativity(val);
                        handleReconfigureCache(cacheSize, blockSize, val);
                      }}
                      className="px-2 py-1.5 rounded bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                    >
                      <option value="direct">Direct Mapped (1-Way)</option>
                      <option value="2-way">2-Way Set Associative</option>
                      <option value="4-way">4-Way Set Associative</option>
                      <option value="fully">Fully Associative</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold mb-1">Target Memory Address:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={targetAddressInput}
                        onChange={(e) => setTargetAddressInput(e.target.value)}
                        placeholder="0x100"
                        className="px-3 py-1.5 rounded font-mono bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 w-28"
                      />
                      <Button variant="violet" size="sm" onClick={() => handleAccessCache()}>
                        Access
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center font-mono">
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                    <span className="text-[10px] text-zinc-400">Total Accesses</span>
                    <div className="text-2xl font-black text-cyan-400">{cacheStats.accesses}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                    <span className="text-[10px] text-zinc-400">Cache Hits</span>
                    <div className="text-2xl font-black text-emerald-400">{cacheStats.hits}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                    <span className="text-[10px] text-zinc-400">Cache Misses</span>
                    <div className="text-2xl font-black text-rose-400">{cacheStats.misses}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                    <span className="text-[10px] text-zinc-400">Hit Rate</span>
                    <div className="text-2xl font-black text-amber-400">{cacheStats.hitRate}%</div>
                  </div>
                </div>

                {/* Memory Access Log */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Recent Cache Accesses:</span>
                  <div className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs">
                    {cacheLog.map((log, idx) => (
                      <div key={idx} className="py-2 flex items-center justify-between">
                        <span>Address: {log.addr}</span>
                        <span className="text-zinc-500">Set: {log.index} &bull; Tag: 0x{log.tag.toString(16)}</span>
                        <span className={log.hit ? 'text-emerald-500 font-bold' : 'text-rose-500 font-bold'}>
                          {log.hit ? 'HIT' : 'MISS'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
