'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  HelpCircle,
  Layers,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import {
  ALUOperation,
  CombinationalEngine,
  GATE_DEFINITIONS,
  GateType,
  generateGateTruthTable,
  KMapEngine,
  LogicLevel,
  SequentialEngine,
  TimingEngine,
} from '@prismora/simulation-core';
import { Badge, BugReportModal, Button, Card, CardContent, CardHeader, CardTitle } from '@prismora/ui';

export default function DigitalElectronicsLabPage() {
  const [activeTab, setActiveTab] = useState<'gates' | 'kmap' | 'combinational' | 'sequential' | 'timing'>('gates');

  // --- TAB 1: GATES STATE ---
  const [selectedGate, setSelectedGate] = useState<GateType>('AND');
  const [inputA, setInputA] = useState<LogicLevel>(1);
  const [inputB, setInputB] = useState<LogicLevel>(0);
  const [inputC, setInputC] = useState<LogicLevel>(1);
  const [gateInputsCount, setGateInputsCount] = useState<number>(2);

  const gateDef = GATE_DEFINITIONS[selectedGate];
  const activeGateInputs: LogicLevel[] =
    gateInputsCount === 1 ? [inputA] : gateInputsCount === 2 ? [inputA, inputB] : [inputA, inputB, inputC];
  const gateOutput = gateDef.evaluate(activeGateInputs);
  const truthTable = generateGateTruthTable(selectedGate, gateInputsCount);

  // --- TAB 2: K-MAP STATE ---
  const [kmapVars, setKmapVars] = useState<2 | 3 | 4>(3);
  const [mintermValues, setMintermValues] = useState<Record<number, 0 | 1 | 'X'>>({
    0: 1,
    2: 1,
    4: 1,
    6: 1,
  });

  const kmapResult = KMapEngine.generateKMap(kmapVars, mintermValues);

  const toggleKMapCell = (index: number) => {
    const current = mintermValues[index] ?? 0;
    const nextVal: 0 | 1 | 'X' = current === 0 ? 1 : current === 1 ? 'X' : 0;
    setMintermValues({
      ...mintermValues,
      [index]: nextVal,
    });
  };

  const resetKMap = () => {
    setMintermValues({});
  };

  // --- TAB 3: COMBINATIONAL STATE ---
  const [combModule, setCombModule] = useState<'adder' | 'subtractor' | 'mux' | 'decoder' | 'alu'>('alu');
  // Adder inputs
  const [faA, setFaA] = useState<LogicLevel>(1);
  const [faB, setFaB] = useState<LogicLevel>(1);
  const [faCin, setFaCin] = useState<LogicLevel>(0);
  const fullAdderRes = CombinationalEngine.fullAdder(faA, faB, faCin);

  // MUX inputs
  const [muxInputs, setMuxInputs] = useState<[LogicLevel, LogicLevel, LogicLevel, LogicLevel]>([0, 1, 0, 1]);
  const [muxSel, setMuxSel] = useState<[LogicLevel, LogicLevel]>([1, 0]);
  const muxOutput = CombinationalEngine.mux4to1(muxInputs, muxSel);

  // ALU inputs
  const [aluA, setAluA] = useState<number>(5);
  const [aluB, setAluB] = useState<number>(3);
  const [aluOp, setAluOp] = useState<ALUOperation>('ADD');
  const aluRes = CombinationalEngine.evaluateALU(aluA, aluB, aluOp);

  // --- TAB 4: SEQUENTIAL STATE ---
  const [flipFlopType, setFlipFlopType] = useState<'SR' | 'D' | 'JK' | 'T'>('D');
  const [ffD, setFfD] = useState<LogicLevel>(1);
  const [ffJ, setFfJ] = useState<LogicLevel>(1);
  const [ffK, setFfK] = useState<LogicLevel>(1);
  const [ffS, setFfS] = useState<LogicLevel>(1);
  const [ffR, setFfR] = useState<LogicLevel>(0);
  const [ffT, setFfT] = useState<LogicLevel>(1);
  const [ffQ, setFfQ] = useState<LogicLevel>(0);
  const [ffClockPulses, setFfClockPulses] = useState(0);

  // 4-bit Counter State
  const [counterVal, setCounterVal] = useState(0);
  const [counterUp, setCounterUp] = useState(true);

  const handlePulseClock = () => {
    setFfClockPulses((prev) => prev + 1);

    if (flipFlopType === 'D') {
      const res = SequentialEngine.dFlipFlop(ffD, true, ffQ);
      setFfQ(res.q);
    } else if (flipFlopType === 'JK') {
      const res = SequentialEngine.jkFlipFlop(ffJ, ffK, true, ffQ);
      setFfQ(res.q);
    } else if (flipFlopType === 'T') {
      const res = SequentialEngine.tFlipFlop(ffT, true, ffQ);
      setFfQ(res.q);
    } else if (flipFlopType === 'SR') {
      const res = SequentialEngine.srLatch(ffS, ffR, ffQ);
      if (!res.invalid) setFfQ(res.q);
    }

    // Step counter
    const nextCounter = SequentialEngine.counter4Bit(counterVal, counterUp, true, false, true);
    setCounterVal(nextCounter.count);
  };

  // --- TAB 5: TIMING STATE ---
  const [inverterDelay, setInverterDelay] = useState<number>(3);
  const glitchResult = TimingEngine.simulateStaticOneHazard(inverterDelay);

  // Diagnostic snapshot for bug reports
  const diagnosticSnapshot = {
    activeTab,
    selectedGate,
    gateInputs: activeGateInputs,
    kmapVars,
    mintermCount: Object.keys(mintermValues).length,
    aluOp,
    aluInputs: { a: aluA, b: aluB },
    flipFlopType,
    ffQ,
    inverterDelay,
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
            <span className="font-semibold text-rose-600 dark:text-rose-400">Digital Electronics Laboratory</span>
            <Badge variant="engineering" className="ml-2">
              Phase 1
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <BugReportModal
              simulationId="digital-electronics"
              moduleName="Digital Electronics & Logic Design"
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
              <Zap className="w-6 h-6 text-[#2563EB]" />
              Digital Electronics &amp; Micro-Logic Workbench
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Scientifically verified combinational and sequential logic engine. Investigate gate evaluations, Quine-McCluskey K-map minimization, ripple arithmetic units, flip-flops, and propagation delay glitches.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('gates')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'gates'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              1. Logic Gates
            </button>
            <button
              onClick={() => setActiveTab('kmap')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'kmap'
                  ? 'bg-[#FBBF24] text-zinc-950 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              2. K-Map Minimizer
            </button>
            <button
              onClick={() => setActiveTab('combinational')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'combinational'
                  ? 'bg-[#22C55E] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              3. Combinational &amp; ALU
            </button>
            <button
              onClick={() => setActiveTab('sequential')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'sequential'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              4. Flip-Flops &amp; Counters
            </button>
            <button
              onClick={() => setActiveTab('timing')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'timing'
                  ? 'bg-[#F43F5E] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              5. Timing &amp; Hazards
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: LOGIC GATES & TRUTH TABLES */}
        {/* ============================================================ */}
        {activeTab === 'gates' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls & Interactive Schematic */}
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Gate Selector &amp; Interactive Inputs</span>
                    <Badge variant="physics">{gateDef.name}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Gate Type Pills */}
                  <div className="flex flex-wrap gap-2">
                    {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR', 'BUFFER'] as GateType[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => {
                          setSelectedGate(g);
                          if (g === 'NOT' || g === 'BUFFER') setGateInputsCount(1);
                          else if (gateInputsCount === 1) setGateInputsCount(2);
                        }}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold font-mono transition-colors border ${
                          selectedGate === g
                            ? 'bg-[#2563EB] text-white border-[#2563EB]'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>

                  {/* Input Count Selector (if supported) */}
                  {selectedGate !== 'NOT' && selectedGate !== 'BUFFER' && selectedGate !== 'XOR' && selectedGate !== 'XNOR' && (
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-zinc-600 dark:text-zinc-400 font-medium">Number of Inputs:</span>
                      <div className="flex gap-1.5">
                        {[2, 3].map((num) => (
                          <button
                            key={num}
                            onClick={() => setGateInputsCount(num)}
                            className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
                              gateInputsCount === num
                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                            }`}
                          >
                            {num} Inputs
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Schematic Gate Diagram */}
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-white flex flex-col items-center justify-center relative select-none min-h-[220px]">
                    <div className="flex items-center justify-center gap-8 w-full max-w-md">
                      {/* Inputs Column */}
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                          <button
                            aria-label="Toggle Input A"
                            onClick={() => setInputA(inputA === 1 ? 0 : 1)}
                            className={`w-10 h-10 rounded-lg font-mono font-bold text-sm border-2 transition-all flex items-center justify-center shadow-md ${
                              inputA === 1
                                ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/40'
                                : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                            }`}
                          >
                            {inputA}
                          </button>
                          <span className="font-mono text-xs text-zinc-400">Input A</span>
                        </div>

                        {gateInputsCount >= 2 && (
                          <div className="flex items-center gap-2">
                            <button
                              aria-label="Toggle Input B"
                              onClick={() => setInputB(inputB === 1 ? 0 : 1)}
                              className={`w-10 h-10 rounded-lg font-mono font-bold text-sm border-2 transition-all flex items-center justify-center shadow-md ${
                                inputB === 1
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/40'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              {inputB}
                            </button>
                            <span className="font-mono text-xs text-zinc-400">Input B</span>
                          </div>
                        )}

                        {gateInputsCount >= 3 && (
                          <div className="flex items-center gap-2">
                            <button
                              aria-label="Toggle Input C"
                              onClick={() => setInputC(inputC === 1 ? 0 : 1)}
                              className={`w-10 h-10 rounded-lg font-mono font-bold text-sm border-2 transition-all flex items-center justify-center shadow-md ${
                                inputC === 1
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-emerald-900/40'
                                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              }`}
                            >
                              {inputC}
                            </button>
                            <span className="font-mono text-xs text-zinc-400">Input C</span>
                          </div>
                        )}
                      </div>

                      {/* Schematic Gate Symbol */}
                      <div className="w-24 h-24 rounded-2xl bg-zinc-800 border-2 border-zinc-600 flex flex-col items-center justify-center shadow-lg">
                        <span className="font-mono text-2xl font-black text-white">{gateDef.symbol}</span>
                        <span className="text-[10px] font-bold text-indigo-400 mt-1">{selectedGate}</span>
                      </div>

                      {/* Output Indicator */}
                      <div className="flex items-center gap-3">
                        <div
                          data-testid="gate-output"
                          className={`w-12 h-12 rounded-xl font-mono font-black text-lg border-2 flex items-center justify-center shadow-lg transition-all ${
                            gateOutput === 1
                              ? 'bg-[#2563EB] text-white border-blue-400 shadow-blue-900/60'
                              : 'bg-zinc-800 text-zinc-500 border-zinc-700'
                          }`}
                        >
                          {gateOutput}
                        </div>
                        <span className="font-mono text-xs text-zinc-400">Output Y</span>
                      </div>
                    </div>

                    <div className="mt-4 text-xs font-mono text-zinc-400 bg-zinc-800/60 px-3 py-1 rounded border border-zinc-700">
                      Expression: <span className="text-white font-bold">Y = {gateDef.booleanSymbol} (Inputs)</span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{gateDef.description}</p>
                </CardContent>
              </Card>
            </div>

            {/* Right: Real-time Live Truth Table */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Exhaustive Truth Table</span>
                    <span className="text-[11px] text-zinc-500 font-mono">{truthTable.rows.length} Combinations</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden text-xs">
                    <table className="w-full text-center">
                      <thead className="bg-zinc-100 dark:bg-zinc-800 font-mono font-bold text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
                        <tr>
                          {truthTable.inputNames.map((name) => (
                            <th key={name} className="py-2 px-3">
                              {name}
                            </th>
                          ))}
                          <th className="py-2 px-3 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                            Y (Output)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono">
                        {truthTable.rows.map((row, idx) => {
                          // Check if row matches current active inputs
                          const isActive = truthTable.inputNames.every(
                            (name) => row.inputs[name] === (name === 'A' ? inputA : name === 'B' ? inputB : inputC),
                          );

                          return (
                            <tr
                              key={idx}
                              className={`transition-colors ${
                                isActive
                                  ? 'bg-blue-100 dark:bg-blue-950/80 font-bold text-blue-900 dark:text-blue-100'
                                  : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                              }`}
                            >
                              {truthTable.inputNames.map((name) => (
                                <td key={name} className="py-2 px-3">
                                  {row.inputs[name]}
                                </td>
                              ))}
                              <td
                                className={`py-2 px-3 font-bold ${
                                  row.outputs['Y'] === 1
                                    ? 'text-emerald-600 dark:text-emerald-400'
                                    : 'text-zinc-500'
                                }`}
                              >
                                {row.outputs['Y']}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                    Active state row is highlighted in blue dynamically based on your current input toggles.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: KARNAUGH MAP & BOOLEAN MINIMIZER */}
        {/* ============================================================ */}
        {activeTab === 'kmap' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Interactive Karnaugh Map Grid</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500">Variables:</span>
                      {([2, 3, 4] as const).map((v) => (
                        <button
                          key={v}
                          onClick={() => {
                            setKmapVars(v);
                            setMintermValues({});
                          }}
                          className={`px-2 py-1 rounded text-xs font-mono font-bold ${
                            kmapVars === v
                              ? 'bg-[#FBBF24] text-zinc-950 font-bold'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300'
                          }`}
                        >
                          {v} Vars
                        </button>
                      ))}
                      <Button variant="outline" size="sm" onClick={resetKMap} className="ml-2 h-7 text-xs">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Clear
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Click any cell to cycle its value: <span className="font-bold text-zinc-900 dark:text-white">0 &rarr; 1 &rarr; X (Don&apos;t Care)</span>. Gray code ordering ensures adjacent cells differ by only 1 bit.
                  </p>

                  {/* K-Map Matrix Display */}
                  <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 overflow-x-auto text-white flex flex-col items-center">
                    <div className="text-xs font-mono font-bold text-amber-400 mb-2">
                      {kmapVars === 2 ? 'Row: A, Col: B' : kmapVars === 3 ? 'Row: A, Col: BC' : 'Row: AB, Col: CD'}
                    </div>

                    <table className="border-collapse">
                      <thead>
                        <tr>
                          <th className="p-2 border border-zinc-700 bg-zinc-800 text-[11px] font-mono text-zinc-400">
                            \
                          </th>
                          {kmapResult.colLabels.map((colLbl) => (
                            <th
                              key={colLbl}
                              className="p-2 border border-zinc-700 bg-zinc-800/80 font-mono text-xs text-cyan-400 font-bold min-w-[56px] text-center"
                            >
                              {colLbl}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {kmapResult.cells.map((rowArr, rIdx) => (
                          <tr key={rIdx}>
                            <th className="p-2 border border-zinc-700 bg-zinc-800/80 font-mono text-xs text-amber-400 font-bold text-center">
                              {kmapResult.rowLabels[rIdx]}
                            </th>
                            {rowArr.map((cell) => (
                              <td
                                key={cell.mintermIndex}
                                onClick={() => toggleKMapCell(cell.mintermIndex)}
                                className={`p-3 border border-zinc-700 text-center cursor-pointer transition-colors select-none ${
                                  cell.value === 1
                                    ? 'bg-[#2563EB] text-white font-black text-base hover:bg-blue-600'
                                    : cell.value === 'X'
                                    ? 'bg-purple-900/60 text-purple-300 font-black text-base hover:bg-purple-900'
                                    : 'bg-zinc-900 text-zinc-500 font-mono text-sm hover:bg-zinc-800'
                                }`}
                                title={`Minterm m${cell.mintermIndex} (Binary: ${cell.rowLabel}${cell.colLabel})`}
                              >
                                <div>{cell.value}</div>
                                <div className="text-[9px] font-mono text-zinc-400 font-normal">m{cell.mintermIndex}</div>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Prime Implicants List */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200">
                      Identified Prime Implicant Groups ({kmapResult.primeImplicants.length}):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {kmapResult.primeImplicants.map((pi) => (
                        <div
                          key={pi.id}
                          className="px-2.5 py-1 rounded text-xs font-mono font-bold border flex items-center gap-1.5"
                          style={{
                            backgroundColor: `${pi.color}20`,
                            borderColor: pi.color,
                            color: pi.color,
                          }}
                        >
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: pi.color }} />
                          <span>{pi.term}</span>
                          <span className="text-[10px] text-zinc-400 font-normal">
                            ({pi.minterms.map((m) => `m${m}`).join(', ')})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Minimized Expressions & Canonical Forms */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-amber-500" />
                    <span>Quine-McCluskey Minimal Expressions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Minimal SOP */}
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                      Minimal Sum of Products (SOP)
                    </span>
                    <div className="font-mono text-base font-black text-blue-950 dark:text-blue-100">
                      F = {kmapResult.minimalSOP}
                    </div>
                  </div>

                  {/* Minimal POS */}
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 space-y-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">
                      Minimal Product of Sums (POS)
                    </span>
                    <div className="font-mono text-base font-black text-purple-950 dark:text-purple-100">
                      F = {kmapResult.minimalPOS}
                    </div>
                  </div>

                  <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                    <p className="font-semibold text-zinc-900 dark:text-white">Scientific Principle:</p>
                    <p>
                      Quine-McCluskey performs systematic tabular reduction by identifying all adjacent minterm implicants differing by one literal, eliminating redundant terms to yield the optimal circuit implementation.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: COMBINATIONAL CIRCUITS & ALU */}
        {/* ============================================================ */}
        {activeTab === 'combinational' && (
          <div className="space-y-6">
            {/* Sub-selector */}
            <div className="flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              {(['alu', 'adder', 'mux'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setCombModule(m)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider ${
                    combModule === m
                      ? 'bg-[#22C55E] text-white shadow-sm'
                      : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200'
                  }`}
                >
                  {m === 'alu' ? '4-Bit ALU' : m === 'adder' ? 'Full Adder' : '4:1 Multiplexer'}
                </button>
              ))}
            </div>

            {/* ALU Display */}
            {combModule === 'alu' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-bold flex items-center justify-between">
                        <span>4-Bit Arithmetic Logic Unit (ALU) Controls</span>
                        <Badge variant="biology">ALU Engine</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Operand A (0..15): {aluA}</label>
                          <input
                            type="range"
                            min="0"
                            max="15"
                            value={aluA}
                            onChange={(e) => setAluA(parseInt(e.target.value, 10))}
                            className="w-full accent-blue-600"
                          />
                          <span className="font-mono text-xs text-zinc-500">Binary: {aluA.toString(2).padStart(4, '0')}</span>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Operand B (0..15): {aluB}</label>
                          <input
                            type="range"
                            min="0"
                            max="15"
                            value={aluB}
                            onChange={(e) => setAluB(parseInt(e.target.value, 10))}
                            className="w-full accent-blue-600"
                          />
                          <span className="font-mono text-xs text-zinc-500">Binary: {aluB.toString(2).padStart(4, '0')}</span>
                        </div>
                      </div>

                      {/* Operation Selector */}
                      <div>
                        <label className="block text-xs font-semibold mb-2">Operation Code:</label>
                        <div className="flex flex-wrap gap-2">
                          {(['ADD', 'SUB', 'AND', 'OR', 'XOR', 'NOT', 'SLL', 'SRL', 'SLT'] as ALUOperation[]).map((op) => (
                            <button
                              key={op}
                              onClick={() => setAluOp(op)}
                              className={`px-3 py-1.5 rounded text-xs font-mono font-bold border transition-colors ${
                                aluOp === op
                                  ? 'bg-emerald-600 text-white border-emerald-500'
                                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                              }`}
                            >
                              {op}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Result Display Box */}
                      <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-white text-center space-y-2">
                        <span className="text-xs text-zinc-400 font-mono uppercase tracking-wider">Computed 4-Bit Output</span>
                        <div className="text-3xl font-black font-mono text-emerald-400">
                          {aluRes.result} <span className="text-sm font-normal text-zinc-400">(0b{aluRes.binaryResult})</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Status Flags */}
                <div className="lg:col-span-5 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm font-bold">ALU Status Flags</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className={`p-3 rounded-lg border text-center ${aluRes.flags.zero ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 font-bold' : 'bg-zinc-800/40 border-zinc-800 text-zinc-500'}`}>
                          <div className="text-xs">Zero Flag (Z)</div>
                          <div className="text-lg font-mono">{aluRes.flags.zero ? '1 (SET)' : '0'}</div>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${aluRes.flags.sign ? 'bg-amber-500/20 border-amber-500 text-amber-400 font-bold' : 'bg-zinc-800/40 border-zinc-800 text-zinc-500'}`}>
                          <div className="text-xs">Sign Flag (S)</div>
                          <div className="text-lg font-mono">{aluRes.flags.sign ? '1 (NEGATIVE)' : '0'}</div>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${aluRes.flags.carry ? 'bg-blue-500/20 border-blue-500 text-blue-400 font-bold' : 'bg-zinc-800/40 border-zinc-800 text-zinc-500'}`}>
                          <div className="text-xs">Carry Out (C)</div>
                          <div className="text-lg font-mono">{aluRes.flags.carry ? '1' : '0'}</div>
                        </div>
                        <div className={`p-3 rounded-lg border text-center ${aluRes.flags.overflow ? 'bg-rose-500/20 border-rose-500 text-rose-400 font-bold' : 'bg-zinc-800/40 border-zinc-800 text-zinc-500'}`}>
                          <div className="text-xs">Overflow Flag (V)</div>
                          <div className="text-lg font-mono">{aluRes.flags.overflow ? '1 (OVERFLOW)' : '0'}</div>
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-2">
                        Signed overflow occurs when the result exceeds 4-bit two&apos;s complement range [-8, +7].
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            {/* Full Adder Display */}
            {combModule === 'adder' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">1-Bit Full Adder with Carry Propagation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center justify-center gap-6 p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-zinc-400">Inputs:</span>
                      <div className="flex gap-2">
                        <button onClick={() => setFaA(faA === 1 ? 0 : 1)} className={`w-10 h-10 rounded font-mono font-bold ${faA === 1 ? 'bg-blue-600' : 'bg-zinc-800'}`}>A: {faA}</button>
                        <button onClick={() => setFaB(faB === 1 ? 0 : 1)} className={`w-10 h-10 rounded font-mono font-bold ${faB === 1 ? 'bg-blue-600' : 'bg-zinc-800'}`}>B: {faB}</button>
                        <button onClick={() => setFaCin(faCin === 1 ? 0 : 1)} className={`w-10 h-10 rounded font-mono font-bold ${faCin === 1 ? 'bg-amber-600' : 'bg-zinc-800'}`}>Cin: {faCin}</button>
                      </div>
                    </div>
                    <ArrowRight className="w-5 h-5 text-zinc-500" />
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-zinc-400">Outputs:</span>
                      <div className="flex gap-2">
                        <div className={`w-10 h-10 rounded font-mono font-bold flex items-center justify-center ${fullAdderRes.sum === 1 ? 'bg-emerald-600' : 'bg-zinc-800'}`}>S: {fullAdderRes.sum}</div>
                        <div className={`w-10 h-10 rounded font-mono font-bold flex items-center justify-center ${fullAdderRes.carryOut === 1 ? 'bg-rose-600' : 'bg-zinc-800'}`}>Cout: {fullAdderRes.carryOut}</div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    Equations: <span className="font-mono">Sum = A &oplus; B &oplus; Cin</span>, <span className="font-mono">Cout = (A &middot; B) + (Cin &middot; (A &oplus; B))</span>.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Multiplexer Display */}
            {combModule === 'mux' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">4:1 Multiplexer (Data Selector)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap items-center justify-center gap-6 p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-white">
                    <div className="space-y-2">
                      <span className="text-xs font-mono text-zinc-400">Data Inputs (I0..I3):</span>
                      <div className="flex gap-2">
                        {muxInputs.map((val, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              const next = [...muxInputs] as [LogicLevel, LogicLevel, LogicLevel, LogicLevel];
                              next[idx] = val === 1 ? 0 : 1;
                              setMuxInputs(next);
                            }}
                            className={`w-9 h-9 rounded font-mono font-bold text-xs ${val === 1 ? 'bg-cyan-600' : 'bg-zinc-800'}`}
                          >
                            I{idx}:{val}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs font-mono text-zinc-400">Select Lines (S1, S0):</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setMuxSel([muxSel[0], muxSel[1] === 1 ? 0 : 1])}
                          className={`w-9 h-9 rounded font-mono font-bold text-xs ${muxSel[1] === 1 ? 'bg-amber-600' : 'bg-zinc-800'}`}
                        >
                          S1:{muxSel[1]}
                        </button>
                        <button
                          onClick={() => setMuxSel([muxSel[0] === 1 ? 0 : 1, muxSel[1]])}
                          className={`w-9 h-9 rounded font-mono font-bold text-xs ${muxSel[0] === 1 ? 'bg-amber-600' : 'bg-zinc-800'}`}
                        >
                          S0:{muxSel[0]}
                        </button>
                      </div>
                    </div>

                    <ArrowRight className="w-5 h-5 text-zinc-500" />
                    <div className="space-y-2 text-center">
                      <span className="text-xs font-mono text-zinc-400">Output Y:</span>
                      <div className={`w-10 h-10 rounded font-mono font-bold flex items-center justify-center text-sm ${muxOutput === 1 ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
                        {muxOutput}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: SEQUENTIAL CIRCUITS, FLIP-FLOPS & COUNTERS */}
        {/* ============================================================ */}
        {activeTab === 'sequential' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Edge-Triggered Flip-Flop Laboratory</span>
                    <Badge variant="mathematics">{flipFlopType} Flip-Flop</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Flip-Flop selector */}
                  <div className="flex gap-2">
                    {(['D', 'JK', 'T', 'SR'] as const).map((t) => (
                      <button
                        key={t}
                        onClick={() => setFlipFlopType(t)}
                        className={`px-3 py-1.5 rounded text-xs font-mono font-bold border ${
                          flipFlopType === t
                            ? 'bg-[#8B5CF6] text-white border-purple-500'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700'
                        }`}
                      >
                        {t} Type
                      </button>
                    ))}
                  </div>

                  {/* Interactive Flip-Flop Box */}
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-white flex flex-col items-center gap-6">
                    <div className="flex items-center justify-around w-full max-w-md">
                      {/* Inputs */}
                      <div className="space-y-3">
                        {flipFlopType === 'D' && (
                          <button
                            onClick={() => setFfD(ffD === 1 ? 0 : 1)}
                            className={`w-12 h-10 rounded font-mono font-bold text-sm ${ffD === 1 ? 'bg-blue-600' : 'bg-zinc-800'}`}
                          >
                            D: {ffD}
                          </button>
                        )}
                        {flipFlopType === 'JK' && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setFfJ(ffJ === 1 ? 0 : 1)}
                              className={`w-12 h-10 rounded font-mono font-bold text-sm ${ffJ === 1 ? 'bg-blue-600' : 'bg-zinc-800'}`}
                            >
                              J: {ffJ}
                            </button>
                            <button
                              onClick={() => setFfK(ffK === 1 ? 0 : 1)}
                              className={`w-12 h-10 rounded font-mono font-bold text-sm ${ffK === 1 ? 'bg-blue-600' : 'bg-zinc-800'}`}
                            >
                              K: {ffK}
                            </button>
                          </div>
                        )}
                        {flipFlopType === 'T' && (
                          <button
                            onClick={() => setFfT(ffT === 1 ? 0 : 1)}
                            className={`w-12 h-10 rounded font-mono font-bold text-sm ${ffT === 1 ? 'bg-blue-600' : 'bg-zinc-800'}`}
                          >
                            T: {ffT}
                          </button>
                        )}
                        {flipFlopType === 'SR' && (
                          <div className="flex flex-col gap-2">
                            <button
                              onClick={() => setFfS(ffS === 1 ? 0 : 1)}
                              className={`w-12 h-10 rounded font-mono font-bold text-sm ${ffS === 1 ? 'bg-blue-600' : 'bg-zinc-800'}`}
                            >
                              S: {ffS}
                            </button>
                            <button
                              onClick={() => setFfR(ffR === 1 ? 0 : 1)}
                              className={`w-12 h-10 rounded font-mono font-bold text-sm ${ffR === 1 ? 'bg-blue-600' : 'bg-zinc-800'}`}
                            >
                              R: {ffR}
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Flip Flop Body */}
                      <div className="w-28 h-28 rounded-xl bg-zinc-800 border-2 border-purple-500/60 flex flex-col items-center justify-center shadow-lg">
                        <span className="font-mono text-xl font-black text-purple-400">{flipFlopType}-FF</span>
                        <span className="text-[10px] text-zinc-400 mt-1">&gt; CLK Rising</span>
                      </div>

                      {/* Outputs */}
                      <div className="flex flex-col gap-2">
                        <div className={`w-12 h-10 rounded font-mono font-bold flex items-center justify-center text-sm ${ffQ === 1 ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
                          Q: {ffQ}
                        </div>
                        <div className={`w-12 h-10 rounded font-mono font-bold flex items-center justify-center text-sm ${ffQ === 0 ? 'bg-emerald-600' : 'bg-zinc-800'}`}>
                          Q&apos;: {ffQ === 1 ? 0 : 1}
                        </div>
                      </div>
                    </div>

                    {/* Clock Pulse Button */}
                    <Button variant="violet" size="sm" onClick={handlePulseClock} className="px-6 py-2">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>Pulse Clock Edge (&uarr;) &bull; Total: {ffClockPulses}</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 4-Bit Synchronous Counter */}
            <div className="lg:col-span-5 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>4-Bit Up/Down Counter</span>
                    <Badge variant="astronomy">{counterUp ? 'UP' : 'DOWN'}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-center space-y-3">
                    <span className="text-xs text-zinc-400 font-mono">Current Count</span>
                    <div className="text-4xl font-black font-mono text-cyan-400">{counterVal}</div>
                    <div className="text-xs font-mono text-zinc-400">
                      Binary: {counterVal.toString(2).padStart(4, '0')}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCounterUp(!counterUp)} className="flex-1">
                      Mode: {counterUp ? 'Counting Up' : 'Counting Down'}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setCounterVal(0)}>
                      Reset
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: TIMING DIAGRAM & STATIC 1-HAZARDS */}
        {/* ============================================================ */}
        {activeTab === 'timing' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Logic Analyzer &amp; Static 1-Hazard Glitch Simulation</span>
                  <Badge variant="engineering">Propagation Delay</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-zinc-900 dark:text-white">
                      Inverter Propagation Delay (&tau;inv): {inverterDelay} ns
                    </span>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Circuit: F = (A &middot; B) + (A&apos; &middot; C) with B=1, C=1. When A transitions 1 &rarr; 0, inverter delay causes a glitch.
                    </p>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="8"
                    value={inverterDelay}
                    onChange={(e) => setInverterDelay(parseInt(e.target.value, 10))}
                    className="w-48 accent-rose-500"
                  />
                </div>

                {/* Waveform Canvas Representation */}
                <div className="p-6 rounded-xl bg-zinc-950 border border-zinc-800 text-white space-y-4">
                  {glitchResult.signals.map((sig) => (
                    <div key={sig.name} className="flex items-center gap-4">
                      <div className="w-28 text-xs font-mono font-bold truncate text-zinc-300">{sig.name}</div>
                      <div className="flex-1 h-8 bg-zinc-900 rounded border border-zinc-800 relative flex items-center">
                        <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 30 10">
                          <polyline
                            points={sig.points.map((p) => `${p.time},${p.value === 1 ? 2 : 8}`).join(' ')}
                            fill="none"
                            stroke={sig.color}
                            strokeWidth="1.5"
                          />
                        </svg>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Hazard Explanation Alert */}
                {glitchResult.hazardDetected && (
                  <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-rose-600" />
                      Glitch Manifestation Confirmed
                    </span>
                    <p>{glitchResult.hazardDescription}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
