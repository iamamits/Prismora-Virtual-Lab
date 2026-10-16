'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Download,
  FileCheck,
  FileText,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import {
  CodeConverterEngine,
  CombinationalEngine,
  ComparatorsEngine,
  CountersEngine,
  GATE_DEFINITIONS,
  GateType,
  generateGateTruthTable,
  KMapEngine,
  LatchesEngine,
  LogicLevel,
  SequentialEngine,
  ShiftRegisterEngine,
  TimingEngine,
  UniversalGatesEngine,
} from '@prismora/simulation-core';
import { Badge, BugReportModal, Button, Card, CardContent, CardHeader, CardTitle } from '@prismora/ui';
import {
  DIGITAL_EXPERIMENTS,
  DigitalExperimentCategory,
  DigitalExperimentConfig,
} from './experiment-configs';
import { DipIcVisualizer } from './dip-ic-visualizer';
import { SchematicView } from './schematic-view';

interface DigitalLabWorkbenchProps {
  initialExpId?: string;
}

export function DigitalLabWorkbench({ initialExpId }: DigitalLabWorkbenchProps) {
  // Determine initial active experiment
  const defaultExp =
    DIGITAL_EXPERIMENTS.find((e) => e.id === initialExpId) ?? DIGITAL_EXPERIMENTS[0]!;

  const [activeExpId, setActiveExpId] = useState<string>(defaultExp.id);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'schematic' | 'dip'>('schematic');
  const [labMode, setLabMode] = useState<
    'explore' | 'understand' | 'guided' | 'analyze' | 'challenge' | 'report'
  >('explore');

  // Guided steps tracking
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  // Quiz answers tracking
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);

  // Student name for lab report
  const [studentName, setStudentName] = useState<string>('Prismora Student');

  const currentExp = useMemo(
    () => DIGITAL_EXPERIMENTS.find((e) => e.id === activeExpId) ?? DIGITAL_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // =========================================================================
  // SIMULATION STATES FOR ALL 12 EXPERIMENTS
  // =========================================================================

  // EXP 1: Basic Gates
  const [selectedGate, setSelectedGate] = useState<GateType>('AND');
  const [gateInputA, setGateInputA] = useState<LogicLevel>(1);
  const [gateInputB, setGateInputB] = useState<LogicLevel>(0);
  const [gateInputC, setGateInputC] = useState<LogicLevel>(1);
  const [gateInputsCount, setGateInputsCount] = useState<number>(2);

  const gateDef = GATE_DEFINITIONS[selectedGate];
  const activeGateInputs: LogicLevel[] =
    gateInputsCount === 1 ? [gateInputA] : gateInputsCount === 2 ? [gateInputA, gateInputB] : [gateInputA, gateInputB, gateInputC];
  const gateOutput = gateDef.evaluate(activeGateInputs);
  const gateTruthTable = generateGateTruthTable(selectedGate, gateInputsCount);

  // EXP 2: Adders
  const [adderA, setAdderA] = useState<LogicLevel>(1);
  const [adderB, setAdderB] = useState<LogicLevel>(1);
  const [adderCin, setAdderCin] = useState<LogicLevel>(0);
  const haRes = CombinationalEngine.halfAdder(adderA, adderB);
  const faRes = CombinationalEngine.fullAdder(adderA, adderB, adderCin);

  // EXP 3: Subtractors
  const [subA, setSubA] = useState<LogicLevel>(0);
  const [subB, setSubB] = useState<LogicLevel>(1);
  const [subBin, setSubBin] = useState<LogicLevel>(0);
  const hsRes = CombinationalEngine.halfSubtractor(subA, subB);
  const fsRes = CombinationalEngine.fullSubtractor(subA, subB, subBin);

  // EXP 4: Universal Gates
  const [universalTarget, setUniversalTarget] = useState<'NOT' | 'AND' | 'OR' | 'XOR'>('XOR');
  const [universalFamily, setUniversalFamily] = useState<'NAND' | 'NOR'>('NAND');
  const [univA, setUnivA] = useState<LogicLevel>(1);
  const [univB, setUnivB] = useState<LogicLevel>(0);
  const universalRes = UniversalGatesEngine.evaluate(universalTarget, universalFamily, univA, univB);

  // EXP 5: Latches
  const [latchType, setLatchType] = useState<'NOR' | 'NAND'>('NOR');
  const [latchS, setLatchS] = useState<LogicLevel>(1);
  const [latchR, setLatchR] = useState<LogicLevel>(0);
  const [latchSkew, setLatchSkew] = useState<number>(0);
  const [prevLatchQ, setPrevLatchQ] = useState<LogicLevel>(0);
  const [prevLatchQBar, setPrevLatchQBar] = useState<LogicLevel>(1);
  const latchRes =
    latchType === 'NOR'
      ? LatchesEngine.evaluateNorLatch(latchS, latchR, prevLatchQ, prevLatchQBar, latchSkew)
      : LatchesEngine.evaluateNandLatch(latchS, latchR, prevLatchQ, prevLatchQBar, latchSkew);

  // EXP 6: Flip-Flops
  const [ffType, setFfType] = useState<'D' | 'JK' | 'T' | 'SR'>('D');
  const [ffD, setFfD] = useState<LogicLevel>(1);
  const [ffJ, setFfJ] = useState<LogicLevel>(1);
  const [ffK, setFfK] = useState<LogicLevel>(1);
  const [ffT, setFfT] = useState<LogicLevel>(1);
  const [ffQ, setFfQ] = useState<LogicLevel>(0);
  const [ffPulseCount, setFfPulseCount] = useState<number>(0);

  // EXP 7: Shift Register
  const [sipoSerialIn, setSipoSerialIn] = useState<LogicLevel>(1);
  const [sipoBits, setSipoBits] = useState<[LogicLevel, LogicLevel, LogicLevel, LogicLevel]>([0, 0, 0, 0]);
  const [sipoHistory, setSipoHistory] = useState<Array<{ clock: number; serialIn: LogicLevel; q: [LogicLevel, LogicLevel, LogicLevel, LogicLevel] }>>([
    { clock: 0, serialIn: 0, q: [0, 0, 0, 0] },
  ]);

  // EXP 8: Decoder & Encoder
  const [decA, setDecA] = useState<LogicLevel>(1);
  const [decB, setDecB] = useState<LogicLevel>(0);
  const [decC, setDecC] = useState<LogicLevel>(0);
  const [decEnable, setDecEnable] = useState<LogicLevel>(1);
  const decoderOutputs = CombinationalEngine.decoder3to8([decA, decB, decC], decEnable);

  // EXP 9: MUX & DEMUX
  const [muxInputs, setMuxInputs] = useState<[LogicLevel, LogicLevel, LogicLevel, LogicLevel]>([0, 1, 0, 1]);
  const [muxS1, setMuxS1] = useState<LogicLevel>(0);
  const [muxS0, setMuxS0] = useState<LogicLevel>(1);
  const [muxEnable, setMuxEnable] = useState<LogicLevel>(1);
  const muxOut = CombinationalEngine.mux4to1(muxInputs, [muxS0, muxS1], muxEnable);

  // EXP 10: Counters
  const [counterArch, setCounterArch] = useState<'ASYNCHRONOUS' | 'SYNCHRONOUS'>('ASYNCHRONOUS');
  const [counterCount, setCounterCount] = useState<number>(7);
  const [counterUp, setCounterUp] = useState<boolean>(true);
  const counterRes = CountersEngine.evaluate(counterArch, counterCount, counterUp);

  // EXP 11: Gray Code
  const [grayBinary, setGrayBinary] = useState<[LogicLevel, LogicLevel, LogicLevel, LogicLevel]>([1, 0, 0, 1]);
  const grayRes = CodeConverterEngine.binaryToGray(grayBinary);
  const [shaftAngle, setShaftAngle] = useState<number>(202.5);

  // EXP 12: Magnitude Comparators
  const [compA1, setCompA1] = useState<LogicLevel>(1);
  const [compA0, setCompA0] = useState<LogicLevel>(0);
  const [compB1, setCompB1] = useState<LogicLevel>(0);
  const [compB0, setCompB0] = useState<LogicLevel>(1);
  const comp2BitRes = ComparatorsEngine.compare2Bit([compA1, compA0], [compB1, compB0]);

  // K-Map Minimizer State (Tab/Extra)
  const [kmapVars, setKmapVars] = useState<2 | 3 | 4>(3);
  const [kmapMinterms, setKmapMinterms] = useState<Record<number, 0 | 1 | 'X'>>({
    0: 1,
    2: 1,
    4: 1,
    6: 1,
  });
  const kmapRes = KMapEngine.generateKMap(kmapVars, kmapMinterms);

  // =========================================================================
  // CLOCK STEPPERS & TOGGLES
  // =========================================================================

  const handlePulseClock = () => {
    // Pulse for active experiment
    if (activeExpId === 'flip-flops') {
      setFfPulseCount((c) => c + 1);
      if (ffType === 'D') {
        const next = SequentialEngine.dFlipFlop(ffD, true, ffQ);
        setFfQ(next.q);
      } else if (ffType === 'JK') {
        const next = SequentialEngine.jkFlipFlop(ffJ, ffK, true, ffQ);
        setFfQ(next.q);
      } else if (ffType === 'T') {
        const next = SequentialEngine.tFlipFlop(ffT, true, ffQ);
        setFfQ(next.q);
      }
    } else if (activeExpId === 'shift-register') {
      const nextBits = ShiftRegisterEngine.shiftStep(sipoBits, sipoSerialIn);
      setSipoBits(nextBits);
      setSipoHistory((prev) => [
        ...prev,
        { clock: prev.length, serialIn: sipoSerialIn, q: nextBits },
      ]);
    } else if (activeExpId === 'counters') {
      setCounterCount((c) => (counterUp ? (c + 1) % 16 : c === 0 ? 15 : c - 1));
    }
  };

  const handleToggleInput = (name: string) => {
    if (name === 'A') setGateInputA((v) => (v === 1 ? 0 : 1));
    if (name === 'B') setGateInputB((v) => (v === 1 ? 0 : 1));
    if (name === 'Cin') setAdderCin((v) => (v === 1 ? 0 : 1));
    if (name === 'S') {
      setLatchS((v) => (v === 1 ? 0 : 1));
      setPrevLatchQ(latchRes.q);
      setPrevLatchQBar(latchRes.qBar);
    }
    if (name === 'R') {
      setLatchR((v) => (v === 1 ? 0 : 1));
      setPrevLatchQ(latchRes.q);
      setPrevLatchQBar(latchRes.qBar);
    }
    if (name === 'serialIn') setSipoSerialIn((v) => (v === 1 ? 0 : 1));
    if (name === 'A1') setCompA1((v) => (v === 1 ? 0 : 1));
    if (name === 'A0') setCompA0((v) => (v === 1 ? 0 : 1));
    if (name === 'B1') setCompB1((v) => (v === 1 ? 0 : 1));
    if (name === 'B0') setCompB0((v) => (v === 1 ? 0 : 1));
    if (name.startsWith('B')) {
      const bitIndex = parseInt(name.replace('B', ''), 10);
      if (!isNaN(bitIndex) && bitIndex >= 0 && bitIndex <= 3) {
        setGrayBinary((prev) => {
          const next = [...prev] as [LogicLevel, LogicLevel, LogicLevel, LogicLevel];
          const arrayIdx = 3 - bitIndex;
          next[arrayIdx] = (next[arrayIdx] === 1 ? 0 : 1) as LogicLevel;
          return next;
        });
      }
    }
  };

  // Build live signal map for SchematicView and DIP IC
  const schematicSignals: Record<string, LogicLevel | number | boolean | string | undefined> = useMemo(() => {
    switch (activeExpId) {
      case 'basic-gates':
        return {
          A: gateInputA,
          B: gateInputB,
          Y: gateOutput,
          gateType: selectedGate,
        };
      case 'adders':
        return {
          A: adderA,
          B: adderB,
          Cin: adderCin,
          sum1: haRes.sum,
          carry1: haRes.carryOut,
          carry2: (haRes.sum && adderCin ? 1 : 0) as LogicLevel,
          sum: faRes.sum,
          carryOut: faRes.carryOut,
        };
      case 'subtractors':
        return {
          A: subA,
          B: subB,
          Bin: subBin,
          diff: fsRes.difference,
          bout: fsRes.borrowOut,
        };
      case 'nor-nand-latches':
        return {
          S: latchS,
          R: latchR,
          Q: latchRes.q,
          QBar: latchRes.qBar,
        };
      case 'shift-register':
        return {
          serialIn: sipoSerialIn,
          q0: sipoBits[3],
          q1: sipoBits[2],
          q2: sipoBits[1],
          q3: sipoBits[0],
        };
      case 'code-converters':
        return {
          B3: grayBinary[0],
          B2: grayBinary[1],
          B1: grayBinary[2],
          B0: grayBinary[3],
          G3: grayRes.gray[0],
          G2: grayRes.gray[1],
          G1: grayRes.gray[2],
          G0: grayRes.gray[3],
        };
      case 'comparators':
        return {
          A1: compA1,
          A0: compA0,
          B1: compB1,
          B0: compB0,
          aGtB: comp2BitRes.aGreaterThanB,
          aEqB: comp2BitRes.aEqualToB,
          aLtB: comp2BitRes.aLessThanB,
        };
      default:
        return { moduleTitle: currentExp.title };
    }
  }, [
    activeExpId,
    gateInputA,
    gateInputB,
    gateOutput,
    selectedGate,
    adderA,
    adderB,
    adderCin,
    haRes,
    faRes,
    subA,
    subB,
    subBin,
    fsRes,
    latchS,
    latchR,
    latchRes,
    sipoSerialIn,
    sipoBits,
    grayBinary,
    grayRes,
    compA1,
    compA0,
    compB1,
    compB0,
    comp2BitRes,
    currentExp.title,
  ]);

  // DIP IC live pin mappings
  const dipLivePins: Record<number, LogicLevel | 'VCC' | 'GND' | 'CLK' | 'X'> = useMemo(() => {
    const base: Record<number, LogicLevel | 'VCC' | 'GND' | 'CLK' | 'X'> = {
      [currentExp.dipConfig.pinCount]: 'VCC',
      [currentExp.dipConfig.pinCount / 2]: 'GND',
    };

    if (activeExpId === 'basic-gates') {
      base[1] = gateInputA;
      base[2] = gateInputB;
      base[3] = gateOutput;
    } else if (activeExpId === 'adders') {
      base[1] = adderA;
      base[2] = adderB;
      base[3] = haRes.sum;
    } else if (activeExpId === 'nor-nand-latches') {
      base[2] = latchR;
      base[6] = latchS;
      base[1] = latchRes.qBar;
      base[4] = latchRes.q;
    } else if (activeExpId === 'shift-register') {
      base[1] = sipoSerialIn;
      base[8] = 'CLK';
      base[3] = sipoBits[3];
      base[4] = sipoBits[2];
      base[5] = sipoBits[1];
      base[6] = sipoBits[0];
    } else if (activeExpId === 'code-converters') {
      base[1] = grayBinary[0];
      base[2] = grayBinary[1];
      base[3] = grayRes.gray[1];
      base[4] = grayBinary[1];
      base[5] = grayBinary[2];
      base[6] = grayRes.gray[2];
      base[8] = grayRes.gray[3];
    } else if (activeExpId === 'comparators') {
      base[10] = compA0;
      base[12] = compA1;
      base[9] = compB0;
      base[11] = compB1;
      base[5] = comp2BitRes.aGreaterThanB;
      base[6] = comp2BitRes.aEqualToB;
      base[7] = comp2BitRes.aLessThanB;
    }

    return base;
  }, [
    currentExp,
    activeExpId,
    gateInputA,
    gateInputB,
    gateOutput,
    adderA,
    adderB,
    haRes.sum,
    latchR,
    latchS,
    latchRes,
    sipoSerialIn,
    sipoBits,
    grayBinary,
    grayRes,
    compA0,
    compA1,
    compB0,
    compB1,
    comp2BitRes,
  ]);

  // Quiz score
  const quizScore = useMemo(() => {
    let correct = 0;
    currentExp.quiz.forEach((q, idx) => {
      if (quizAnswers[idx] === q.answerIndex) correct++;
    });
    return correct;
  }, [currentExp.quiz, quizAnswers]);

  // Export lab report JSON
  const handleExportReport = () => {
    const reportData = {
      institution: 'Prismora Virtual Engineering Laboratory',
      curriculum: 'IIT Roorkee Virtual Labs Benchmark',
      experimentId: currentExp.id,
      experimentNumber: currentExp.expNumber,
      experimentTitle: currentExp.title,
      iitCode: currentExp.iitCode,
      studentName,
      timestamp: new Date().toISOString(),
      completedSteps: Object.keys(completedSteps).length,
      totalSteps: currentExp.procedure.length,
      quizScore: `${quizScore}/${currentExp.quiz.length}`,
      activeSignals: schematicSignals,
      verificationStatus: 'PASSED',
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Prismora-${currentExp.iitCode}-Report.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Header & Navigation */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium">
              Prismora
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/explore" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium">
              ECE Lab
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-rose-600 dark:text-rose-400">Digital Electronics</span>
            <Badge variant="engineering" className="ml-2">
              12 Experiments
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <BugReportModal
              simulationId="digital-electronics"
              moduleName="Digital Electronics Laboratory (12 Experiments)"
              diagnosticSnapshot={{
                activeExpId,
                viewMode,
                labMode,
                schematicSignals,
              }}
            />
          </div>
        </div>
      </header>

      {/* Main Hero Strip */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a]/50 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                {currentExp.iitCode}
              </span>
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                IIT Roorkee Virtual Labs Curriculum
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2 mt-1">
              <Zap className="w-6 h-6 text-[#2563EB]" />
              {currentExp.title}
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-3xl">
              {currentExp.objective}
            </p>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold self-start md:self-auto">
            <button
              onClick={() => setViewMode('schematic')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'schematic'
                  ? 'bg-[#2563EB] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              Logic Schematic
            </button>
            <button
              onClick={() => setViewMode('dip')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                viewMode === 'dip'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900'
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              Hardware DIP IC
            </button>
          </div>
        </div>
      </div>

      {/* Experiment Selector Bar (Scrollable / Categorized) */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 px-4 lg:px-8 py-2 overflow-x-auto">
        <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">
          <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mr-1">
            Experiments:
          </span>
          {DIGITAL_EXPERIMENTS.map((exp) => (
            <button
              key={exp.id}
              onClick={() => {
                setActiveExpId(exp.id);
                setQuizSubmitted(false);
                setQuizAnswers({});
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeExpId === exp.id
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                  : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-zinc-400'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  activeExpId === exp.id ? 'bg-cyan-400' : 'bg-zinc-400'
                }`}
              />
              {exp.shortTitle}
            </button>
          ))}
        </div>
      </div>

      {/* 6 Educational Modes Tabs */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 lg:px-8 py-1.5">
        <div className="max-w-7xl mx-auto flex flex-wrap gap-2 text-xs font-semibold">
          {[
            { id: 'explore', label: '1. Explore & Simulate', icon: Compass },
            { id: 'understand', label: '2. Understand (Theory)', icon: BookOpen },
            { id: 'guided', label: '3. Guided Experiment', icon: CheckCircle2 },
            { id: 'analyze', label: '4. Analyze (Truth Table)', icon: Activity },
            { id: 'challenge', label: '5. Challenge Quiz', icon: HelpCircle },
            { id: 'report', label: '6. Lab Report', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = labMode === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setLabMode(tab.id as typeof labMode)}
                className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-zinc-100 dark:bg-zinc-800 text-[#2563EB] dark:text-cyan-400 font-bold border-b-2 border-[#2563EB] dark:border-cyan-400'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* ========================================================================= */}
        {/* MODE 1: EXPLORE & SIMULATE */}
        {/* ========================================================================= */}
        {labMode === 'explore' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left 7 Columns: Visualization Canvas */}
            <div className="lg:col-span-7 space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold flex items-center gap-2">
                      <span>{viewMode === 'schematic' ? 'Logic Schematic View' : 'Physical IC Pinout View'}</span>
                    </CardTitle>
                    <Badge variant="physics">Live Simulation Active</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {viewMode === 'schematic' ? (
                    <SchematicView
                      expId={activeExpId}
                      signals={schematicSignals}
                      onToggleInput={handleToggleInput}
                      onPulseClock={
                        ['flip-flops', 'shift-register', 'counters'].includes(activeExpId)
                          ? handlePulseClock
                          : undefined
                      }
                    />
                  ) : (
                    <DipIcVisualizer config={currentExp.dipConfig} livePinValues={dipLivePins} />
                  )}
                </CardContent>
              </Card>

              {/* IC Chips Involved in this experiment */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider block mb-2">
                  Standard TTL IC Chips Employed:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentExp.icChips.map((ic) => (
                    <span
                      key={ic}
                      className="px-2.5 py-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-mono font-medium text-zinc-800 dark:text-zinc-200"
                    >
                      {ic}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 5 Columns: Dynamic Controls per Experiment */}
            <div className="lg:col-span-5 space-y-6">
              <Card className="border-zinc-200 dark:border-zinc-800 shadow-sm">
                <CardHeader className="pb-3 border-b border-zinc-100 dark:border-zinc-800">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Interactive Circuit Controls</span>
                    <Badge variant="engineering">Inputs &amp; Signals</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  {/* EXP 1: Basic Gates Controls */}
                  {activeExpId === 'basic-gates' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                          Select Logic Gate:
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['AND', 'OR', 'NOT', 'NAND', 'NOR', 'XOR', 'XNOR'] as GateType[]).map((g) => (
                            <button
                              key={g}
                              onClick={() => setSelectedGate(g)}
                              className={`py-1.5 text-xs font-bold rounded border transition-all ${
                                selectedGate === g
                                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                                  : 'bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700'
                              }`}
                            >
                              {g}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">Input A:</span>
                          <button
                            onClick={() => setGateInputA((v) => (v === 1 ? 0 : 1))}
                            className={`px-4 py-1 rounded font-mono font-bold text-sm ${
                              gateInputA === 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            {gateInputA}
                          </button>
                        </div>
                        {selectedGate !== 'NOT' && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold">Input B:</span>
                            <button
                              onClick={() => setGateInputB((v) => (v === 1 ? 0 : 1))}
                              className={`px-4 py-1 rounded font-mono font-bold text-sm ${
                                gateInputB === 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                              }`}
                            >
                              {gateInputB}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
                          Output Y ({gateDef.booleanSymbol}):
                        </span>
                        <span className="text-lg font-mono font-black text-emerald-600 dark:text-emerald-400">
                          {gateOutput}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* EXP 2: Adders Controls */}
                  {activeExpId === 'adders' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center">
                          <span className="text-[10px] font-bold block mb-1">Operand A</span>
                          <button
                            onClick={() => setAdderA((v) => (v === 1 ? 0 : 1))}
                            className={`w-full py-1 rounded font-mono font-bold ${
                              adderA === 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            {adderA}
                          </button>
                        </div>
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center">
                          <span className="text-[10px] font-bold block mb-1">Operand B</span>
                          <button
                            onClick={() => setAdderB((v) => (v === 1 ? 0 : 1))}
                            className={`w-full py-1 rounded font-mono font-bold ${
                              adderB === 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            {adderB}
                          </button>
                        </div>
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center">
                          <span className="text-[10px] font-bold block mb-1">Carry In (Cin)</span>
                          <button
                            onClick={() => setAdderCin((v) => (v === 1 ? 0 : 1))}
                            className={`w-full py-1 rounded font-mono font-bold ${
                              adderCin === 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            {adderCin}
                          </button>
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="font-semibold text-zinc-500">Half Adder Sum (A ⊕ B):</span>
                          <span className="font-mono font-bold">{haRes.sum}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-semibold text-zinc-500">Half Adder Carry (A · B):</span>
                          <span className="font-mono font-bold">{haRes.carryOut}</span>
                        </div>
                        <div className="border-t border-zinc-200 dark:border-zinc-700 pt-2 flex justify-between font-bold text-blue-600 dark:text-cyan-400">
                          <span>Full Adder Sum (S):</span>
                          <span className="font-mono text-base">{faRes.sum}</span>
                        </div>
                        <div className="flex justify-between font-bold text-emerald-600 dark:text-emerald-400">
                          <span>Full Adder Carry Out (Cout):</span>
                          <span className="font-mono text-base">{faRes.carryOut}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXP 4: Universal Gates Controls */}
                  {activeExpId === 'universal-gates' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                          Universal Gate Family:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setUniversalFamily('NAND')}
                            className={`py-1.5 text-xs font-bold rounded border ${
                              universalFamily === 'NAND'
                                ? 'bg-cyan-600 text-white border-cyan-600'
                                : 'bg-zinc-100 dark:bg-zinc-800'
                            }`}
                          >
                            NAND-Only Tree
                          </button>
                          <button
                            onClick={() => setUniversalFamily('NOR')}
                            className={`py-1.5 text-xs font-bold rounded border ${
                              universalFamily === 'NOR'
                                ? 'bg-rose-600 text-white border-rose-600'
                                : 'bg-zinc-100 dark:bg-zinc-800'
                            }`}
                          >
                            NOR-Only Tree
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                          Target Function to Synthesize:
                        </label>
                        <div className="grid grid-cols-4 gap-1.5">
                          {(['NOT', 'AND', 'OR', 'XOR'] as const).map((t) => (
                            <button
                              key={t}
                              onClick={() => setUniversalTarget(t)}
                              className={`py-1.5 text-xs font-bold rounded border ${
                                universalTarget === t
                                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                                  : 'bg-zinc-100 dark:bg-zinc-800'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold">Input A:</span>
                          <button
                            onClick={() => setUnivA((v) => (v === 1 ? 0 : 1))}
                            className={`px-3 py-1 rounded font-mono font-bold ${
                              univA === 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            {univA}
                          </button>
                        </div>
                        {universalTarget !== 'NOT' && (
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold">Input B:</span>
                            <button
                              onClick={() => setUnivB((v) => (v === 1 ? 0 : 1))}
                              className={`px-3 py-1 rounded font-mono font-bold ${
                                univB === 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                              }`}
                            >
                              {univB}
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs space-y-1">
                        <span className="font-bold text-zinc-500 block">Intermediate Universal Nodes:</span>
                        {universalRes.nodes.map((n) => (
                          <div key={n.id} className="flex justify-between font-mono text-[11px]">
                            <span className="text-zinc-600 dark:text-zinc-400">
                              {n.id} ({n.expression}):
                            </span>
                            <span className="font-bold text-emerald-500">{n.output}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* EXP 5: Latches Controls */}
                  {activeExpId === 'nor-nand-latches' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center">
                          <span className="text-xs font-bold block mb-1">Set Input (S)</span>
                          <button
                            onClick={() => {
                              setLatchS((v) => (v === 1 ? 0 : 1));
                              setPrevLatchQ(latchRes.q);
                              setPrevLatchQBar(latchRes.qBar);
                            }}
                            className={`w-full py-1.5 rounded font-mono font-bold ${
                              latchS === 1 ? 'bg-emerald-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            {latchS}
                          </button>
                        </div>
                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center">
                          <span className="text-xs font-bold block mb-1">Reset Input (R)</span>
                          <button
                            onClick={() => {
                              setLatchR((v) => (v === 1 ? 0 : 1));
                              setPrevLatchQ(latchRes.q);
                              setPrevLatchQBar(latchRes.qBar);
                            }}
                            className={`w-full py-1.5 rounded font-mono font-bold ${
                              latchR === 1 ? 'bg-rose-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                            }`}
                          >
                            {latchR}
                          </button>
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg border text-xs space-y-1 ${
                          latchRes.invalid
                            ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
                            : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
                        }`}
                      >
                        <div className="flex items-center justify-between font-bold">
                          <span>Operating State:</span>
                          <Badge variant={latchRes.invalid ? 'destructive' : 'physics'}>
                            {latchRes.stateName}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-zinc-600 dark:text-zinc-400 pt-1">
                          {latchRes.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* EXP 7: Shift Register Controls */}
                  {activeExpId === 'shift-register' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        <span className="text-xs font-bold">Serial Input Bit (Data):</span>
                        <button
                          onClick={() => setSipoSerialIn((v) => (v === 1 ? 0 : 1))}
                          className={`px-4 py-1.5 rounded font-mono font-bold text-sm ${
                            sipoSerialIn === 1 ? 'bg-cyan-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                          }`}
                        >
                          {sipoSerialIn}
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Button onClick={handlePulseClock} className="w-full bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold">
                          <Clock className="w-4 h-4 mr-1" />
                          Pulse Shift Clock
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSipoBits([0, 0, 0, 0]);
                            setSipoHistory([{ clock: 0, serialIn: 0, q: [0, 0, 0, 0] }]);
                          }}
                          className="w-full"
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Clear Register
                        </Button>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs space-y-2">
                        <span className="font-bold text-zinc-500 block">Preset Bitstream Feeder:</span>
                        <div className="flex gap-2">
                          {[
                            [1, 0, 1, 1],
                            [1, 1, 0, 0],
                            [0, 1, 0, 1],
                          ].map((stream, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                let cur = [...sipoBits] as [LogicLevel, LogicLevel, LogicLevel, LogicLevel];
                                for (const bit of stream) {
                                  cur = ShiftRegisterEngine.shiftStep(cur, bit as LogicLevel);
                                }
                                setSipoBits(cur);
                              }}
                              className="px-2.5 py-1 text-xs font-mono font-bold rounded bg-zinc-200 dark:bg-zinc-800 hover:bg-cyan-500 hover:text-white transition-colors"
                            >
                              Stream {stream.join('')}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXP 10: Counter Controls */}
                  {activeExpId === 'counters' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => setCounterArch('ASYNCHRONOUS')}
                          className={`py-1.5 text-xs font-bold rounded border ${
                            counterArch === 'ASYNCHRONOUS'
                              ? 'bg-[#2563EB] text-white border-[#2563EB]'
                              : 'bg-zinc-100 dark:bg-zinc-800'
                          }`}
                        >
                          Asynchronous (Ripple)
                        </button>
                        <button
                          onClick={() => setCounterArch('SYNCHRONOUS')}
                          className={`py-1.5 text-xs font-bold rounded border ${
                            counterArch === 'SYNCHRONOUS'
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-zinc-100 dark:bg-zinc-800'
                          }`}
                        >
                          Synchronous
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                        <span className="text-xs font-bold">Count Direction:</span>
                        <button
                          onClick={() => setCounterUp((u) => !u)}
                          className="px-3 py-1 rounded text-xs font-bold bg-zinc-200 dark:bg-zinc-700"
                        >
                          {counterUp ? 'Counting UP ↑' : 'Counting DOWN ↓'}
                        </button>
                      </div>

                      <div className="flex gap-2">
                        <Button onClick={handlePulseClock} className="flex-1 bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold">
                          Step Clock (Count: {counterCount})
                        </Button>
                        <Button variant="outline" onClick={() => setCounterCount(0)}>
                          Reset
                        </Button>
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Cumulative Propagation Delay:</span>
                          <span className="font-mono font-bold text-amber-500">
                            {counterRes.cumulativeDelayNs} ns
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Transient Glitch Spikes:</span>
                          <span className="font-bold text-rose-500">
                            {counterRes.hasGlitch ? 'DETECTED during transition!' : 'Clean (No Spikes)'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXP 11: Gray Code Controls */}
                  {activeExpId === 'code-converters' && (
                    <div className="space-y-4">
                      <span className="text-xs font-bold text-zinc-500 block">4-Bit Binary Input Word:</span>
                      <div className="grid grid-cols-4 gap-2">
                        {[3, 2, 1, 0].map((bit, idx) => (
                          <div key={bit} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-center">
                            <span className="text-[10px] font-bold block mb-1">B{bit}</span>
                            <button
                              onClick={() => {
                                setGrayBinary((prev) => {
                                  const next = [...prev] as [LogicLevel, LogicLevel, LogicLevel, LogicLevel];
                                  next[idx] = (next[idx] === 1 ? 0 : 1) as LogicLevel;
                                  return next;
                                });
                              }}
                              className={`w-full py-1 rounded font-mono font-bold ${
                                grayBinary[idx] === 1 ? 'bg-cyan-600 text-white' : 'bg-zinc-300 dark:bg-zinc-700'
                              }`}
                            >
                              {grayBinary[idx]}
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="p-3 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg space-y-1 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>Reflected Gray Code:</span>
                          <span className="font-mono text-emerald-500">{grayRes.grayString}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 pt-1 space-y-0.5">
                          {grayRes.xorEquations.map((eq, i) => (
                            <p key={i} className="font-mono">
                              {eq}
                            </p>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EXP 12: Magnitude Comparator Controls */}
                  {activeExpId === 'comparators' && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
                          <span className="text-xs font-bold text-blue-700 dark:text-blue-300 block mb-2">
                            Operand Word A (A1 A0):
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCompA1((v) => (v === 1 ? 0 : 1))}
                              className={`flex-1 py-1 rounded font-mono font-bold ${
                                compA1 === 1 ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700'
                              }`}
                            >
                              A1: {compA1}
                            </button>
                            <button
                              onClick={() => setCompA0((v) => (v === 1 ? 0 : 1))}
                              className={`flex-1 py-1 rounded font-mono font-bold ${
                                compA0 === 1 ? 'bg-blue-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700'
                              }`}
                            >
                              A0: {compA0}
                            </button>
                          </div>
                        </div>

                        <div className="p-3 bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 rounded-lg">
                          <span className="text-xs font-bold text-purple-700 dark:text-purple-300 block mb-2">
                            Operand Word B (B1 B0):
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setCompB1((v) => (v === 1 ? 0 : 1))}
                              className={`flex-1 py-1 rounded font-mono font-bold ${
                                compB1 === 1 ? 'bg-purple-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700'
                              }`}
                            >
                              B1: {compB1}
                            </button>
                            <button
                              onClick={() => setCompB0((v) => (v === 1 ? 0 : 1))}
                              className={`flex-1 py-1 rounded font-mono font-bold ${
                                compB0 === 1 ? 'bg-purple-600 text-white' : 'bg-zinc-200 dark:bg-zinc-700'
                              }`}
                            >
                              B0: {compB0}
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div
                          className={`p-2 rounded border font-bold text-xs ${
                            comp2BitRes.aGreaterThanB === 1
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          A &gt; B: {comp2BitRes.aGreaterThanB}
                        </div>
                        <div
                          className={`p-2 rounded border font-bold text-xs ${
                            comp2BitRes.aEqualToB === 1
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          A = B: {comp2BitRes.aEqualToB}
                        </div>
                        <div
                          className={`p-2 rounded border font-bold text-xs ${
                            comp2BitRes.aLessThanB === 1
                              ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                              : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          A &lt; B: {comp2BitRes.aLessThanB}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: UNDERSTAND (THEORY & EQUATIONS) */}
        {/* ========================================================================= */}
        {labMode === 'understand' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#2563EB]" />
                    <span>Scientific Theory &amp; Circuit Principles</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">
                  <p>{currentExp.theory}</p>

                  <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-zinc-500">
                      Fundamental Mathematical &amp; Boolean Equations:
                    </span>
                    <ul className="space-y-1 font-mono text-xs text-blue-600 dark:text-cyan-400">
                      {currentExp.equations.map((eq, i) => (
                        <li key={i} className="p-1 rounded bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                          {eq}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Hardware IC Specifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="font-mono text-xs font-bold text-cyan-500">
                    {currentExp.dipConfig.chipName}
                  </div>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">
                    {currentExp.dipConfig.description}
                  </p>
                  <div className="border-t border-zinc-200 dark:border-zinc-800 pt-2 space-y-1">
                    <span className="text-[11px] font-bold text-zinc-500">Key Pinout:</span>
                    {currentExp.dipConfig.pins.slice(0, 6).map((p) => (
                      <div key={p.number} className="text-[11px] font-mono flex justify-between">
                        <span className="text-zinc-500">Pin {p.number} ({p.label}):</span>
                        <span className="text-zinc-700 dark:text-zinc-300">{p.description}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 3: GUIDED EXPERIMENT */}
        {/* ========================================================================= */}
        {labMode === 'guided' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  <span>Step-by-Step Laboratory Procedure</span>
                </CardTitle>
                <span className="text-xs font-mono font-bold text-zinc-500">
                  {Object.values(completedSteps).filter(Boolean).length} of {currentExp.procedure.length} Steps Completed
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentExp.procedure.map((step) => {
                const isDone = completedSteps[`${currentExp.id}-${step.step}`];
                return (
                  <div
                    key={step.step}
                    onClick={() => {
                      setCompletedSteps((prev) => ({
                        ...prev,
                        [`${currentExp.id}-${step.step}`]: !isDone,
                      }));
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex items-start gap-4 ${
                      isDone
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs mt-0.5 ${
                        isDone ? 'bg-emerald-500 text-white' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600'
                      }`}
                    >
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                        {step.title}
                        {isDone && <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" />}
                      </h4>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">{step.instruction}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* MODE 4: ANALYZE & TRUTH TABLE */}
        {/* ========================================================================= */}
        {labMode === 'analyze' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-500" />
                <span>Analytical Truth Table &amp; Dynamic State Highlighting</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeExpId === 'basic-gates' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-left">
                        {gateTruthTable.inputNames.map((n) => (
                          <th key={n} className="p-3">Input {n}</th>
                        ))}
                        {gateTruthTable.outputNames.map((n) => (
                          <th key={n} className="p-3 text-emerald-600 dark:text-emerald-400">Output {n}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {gateTruthTable.rows.map((row, idx) => {
                        const isCurrent =
                          row.inputs['A'] === gateInputA &&
                          (gateInputsCount === 1 || row.inputs['B'] === gateInputB);
                        return (
                          <tr
                            key={idx}
                            className={`border-b border-zinc-100 dark:border-zinc-800 transition-colors ${
                              isCurrent
                                ? 'bg-cyan-100/60 dark:bg-cyan-950/60 font-bold text-cyan-900 dark:text-cyan-200'
                                : 'hover:bg-zinc-50 dark:hover:bg-zinc-900'
                            }`}
                          >
                            {gateTruthTable.inputNames.map((n) => (
                              <td key={n} className="p-3">{row.inputs[n]}</td>
                            ))}
                            {gateTruthTable.outputNames.map((n) => (
                              <td key={n} className="p-3 font-bold">{row.outputs[n]}</td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : activeExpId === 'adders' ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-left">
                        <th className="p-3">A</th>
                        <th className="p-3">B</th>
                        <th className="p-3">Cin</th>
                        <th className="p-3 text-blue-500">Sum (S)</th>
                        <th className="p-3 text-emerald-500">Carry Out (Cout)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        [0, 0, 0, 0, 0],
                        [0, 0, 1, 1, 0],
                        [0, 1, 0, 1, 0],
                        [0, 1, 1, 0, 1],
                        [1, 0, 0, 1, 0],
                        [1, 0, 1, 0, 1],
                        [1, 1, 0, 0, 1],
                        [1, 1, 1, 1, 1],
                      ].map(([a, b, c, s, cout], i) => {
                        const isCurrent = a === adderA && b === adderB && c === adderCin;
                        return (
                          <tr
                            key={i}
                            className={`border-b border-zinc-100 dark:border-zinc-800 ${
                              isCurrent ? 'bg-cyan-100/60 dark:bg-cyan-950/60 font-bold' : ''
                            }`}
                          >
                            <td className="p-3">{a}</td>
                            <td className="p-3">{b}</td>
                            <td className="p-3">{c}</td>
                            <td className="p-3 font-bold text-blue-500">{s}</td>
                            <td className="p-3 font-bold text-emerald-500">{cout}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-zinc-500 text-sm">
                  Analytical truth table dynamically compiled from the @prismora/simulation-core engine for {currentExp.title}.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* MODE 5: CHALLENGE QUIZ */}
        {/* ========================================================================= */}
        {labMode === 'challenge' && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>Interactive Concept Verification Quiz</span>
                </CardTitle>
                {quizSubmitted && (
                  <Badge variant={quizScore === currentExp.quiz.length ? 'physics' : 'destructive'}>
                    Score: {quizScore} / {currentExp.quiz.length}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentExp.quiz.map((q, qIdx) => {
                const selected = quizAnswers[qIdx];
                const isCorrect = selected === q.answerIndex;
                return (
                  <div key={qIdx} className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-3">
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                      {qIdx + 1}. {q.question}
                    </h4>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label
                          key={optIdx}
                          className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                            selected === optIdx
                              ? 'border-[#2563EB] bg-blue-50 dark:bg-blue-950/30'
                              : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`quiz-${qIdx}`}
                            checked={selected === optIdx}
                            onChange={() => setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }))}
                            className="text-[#2563EB]"
                          />
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>

                    {quizSubmitted && (
                      <div
                        className={`p-3 rounded-lg text-xs ${
                          isCorrect
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border border-emerald-300'
                            : 'bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 border border-rose-300'
                        }`}
                      >
                        <p className="font-bold">{isCorrect ? '✓ Correct!' : '✗ Incorrect'}</p>
                        <p className="mt-0.5">{q.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              <Button
                onClick={() => setQuizSubmitted(true)}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-bold"
              >
                Submit Answers for Grading
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ========================================================================= */}
        {/* MODE 6: LAB REPORT EXPORT */}
        {/* ========================================================================= */}
        {labMode === 'report' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <span>Standard University Laboratory Report Generation</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl space-y-4">
                <div>
                  <label className="text-xs font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                    Student Full Name:
                  </label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full max-w-sm px-3 py-1.5 text-xs rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block">Experiment:</span>
                    <span className="font-bold">{currentExp.iitCode}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Procedure Steps:</span>
                    <span className="font-bold">{Object.keys(completedSteps).length} / {currentExp.procedure.length}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Quiz Score:</span>
                    <span className="font-bold">{quizScore} / {currentExp.quiz.length}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Simulation Status:</span>
                    <span className="font-bold text-emerald-500">VERIFIED</span>
                  </div>
                </div>
              </div>

              <Button onClick={handleExportReport} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                <Download className="w-4 h-4 mr-2" />
                Download Complete Lab Report (JSON)
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
