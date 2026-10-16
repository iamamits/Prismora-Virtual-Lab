/**
 * Prismora Electrical Engineering Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Roorkee & COEP Pune
 * Experiments:
 * 1. Network Theorems: Thévenin, Norton & Maximum Power Transfer (EE-201)
 * 2. Single-Phase Transformer Open & Short Circuit Tests (EE-203)
 * 3. Series RLC Circuit AC Resonance & Quality Factor (EE-205)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  evaluateNetworkTheorems,
  DEFAULT_NETWORK_CIRCUIT_PARAMS,
  TransformerTestEngine,
  DEFAULT_TRANSFORMER_PARAMS,
  type TransformerTestParameters,
  RlcResonanceEngine,
  DEFAULT_RLC_PARAMS,
  type RlcParameters,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Cpu,
  Download,
  Gauge,
  Layers,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

type ElectricalExpId = 'network-theorems' | 'transformer-test' | 'rlc-resonance';

interface ElectricalExperimentDef {
  readonly id: ElectricalExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const ELECTRICAL_EXPERIMENTS: readonly ElectricalExperimentDef[] = [
  {
    id: 'network-theorems',
    title: 'Network Theorems Lab: Thévenin, Norton & Maximum Power',
    shortTitle: 'Network Theorems',
    courseCode: 'EE-201 (Electric Circuit Analysis)',
    benchmark: 'IIT Roorkee & IIT Delhi',
    description: 'Circuit reduction, open-circuit voltage Voc = Vth, internal resistance Rin = Rth, and swept load maximum power curve.',
    color: '#2563EB',
    equations: [
      'V_{th} = V_{oc}, \\quad R_{th} = R_{in}',
      'I_N = \\frac{V_{th}}{R_{th}}',
      'P_{L,max} = \\frac{V_{th}^2}{4 R_{th}} \\quad (\\text{when } R_L = R_{th})',
    ],
  },
  {
    id: 'transformer-test',
    title: 'Single-Phase Transformer Open & Short Circuit Tests',
    shortTitle: 'Transformer Tests',
    courseCode: 'EE-203 (Electrical Machines I)',
    benchmark: 'IIT Roorkee & COEP Pune',
    description: 'Determine core loss Rc, magnetizing reactance Xm, equivalent winding impedance Req, Xeq, efficiency eta, and voltage regulation.',
    color: '#059669',
    equations: [
      'R_c = \\frac{V_0^2}{W_0}, \\quad X_m = \\frac{V_0}{I_0 \\sin\\phi_0}',
      'R_{eq} = \\frac{W_{sc}}{I_{sc}^2}, \\quad Z_{eq} = \\frac{V_{sc}}{I_{sc}}',
      '\\eta = \\frac{x S \\cos\\phi}{x S \\cos\\phi + P_i + x^2 P_{cu}} \\times 100\\%',
    ],
  },
  {
    id: 'rlc-resonance',
    title: 'Series RLC Circuit AC Resonance & Frequency Response',
    shortTitle: 'RLC Resonance',
    courseCode: 'EE-205 (Signals & Network Synthesis)',
    benchmark: 'IIT Roorkee & NITK Surathkal',
    description: 'AC frequency sweep, resonant frequency f0 = 1 / (2*pi*sqrt(LC)), Quality Factor Q, bandwidth, and phasor phase angles.',
    color: '#7C3AED',
    equations: [
      'f_0 = \\frac{1}{2\\pi\\sqrt{LC}}',
      'Z(f) = \\sqrt{R^2 + (\\omega L - \\frac{1}{\\omega C})^2}',
      'Q = \\frac{\\omega_0 L}{R} = \\frac{f_0}{BW}',
    ],
  },
];

function ElectricalWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as ElectricalExpId) || 'network-theorems';
  const [activeExpId, setActiveExpId] = useState<ElectricalExpId>(
    ELECTRICAL_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'network-theorems',
  );

  const activeExp = useMemo(
    () => ELECTRICAL_EXPERIMENTS.find((e) => e.id === activeExpId) ?? ELECTRICAL_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // ==========================================
  // EXP 1: Network Theorems States
  // ==========================================
  const [v1, setV1] = useState<number>(12);
  const [v2, setV2] = useState<number>(6);
  const [r1, setR1] = useState<number>(100);
  const [r2, setR2] = useState<number>(150);
  const [r3, setR3] = useState<number>(220);
  const [rl, setRl] = useState<number>(85);

  const netResult = useMemo(
    () =>
      evaluateNetworkTheorems({
        v1Volts: v1,
        v2Volts: v2,
        r1Ohms: r1,
        r2Ohms: r2,
        r3Ohms: r3,
        rlOhms: rl,
      }),
    [v1, v2, r1, r2, r3, rl],
  );

  // ==========================================
  // EXP 2: Transformer States
  // ==========================================
  const [transformerParams, setTransformerParams] = useState<TransformerTestParameters>(DEFAULT_TRANSFORMER_PARAMS);
  const transResult = useMemo(() => TransformerTestEngine.compute(transformerParams), [transformerParams]);

  // ==========================================
  // EXP 3: RLC Resonance States
  // ==========================================
  const [rlcParams, setRlcParams] = useState<RlcParameters>(DEFAULT_RLC_PARAMS);
  const rlcResult = useMemo(() => RlcResonanceEngine.compute(rlcParams), [rlcParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 flex flex-col font-sans">
      {/* Header & Breadcrumb */}
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Link href="/" className="hover:text-blue-600 transition-colors">Prismora</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/library" className="hover:text-blue-600 transition-colors">Disciplines</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-zinc-900">Electrical Engineering Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`ee-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ELECTRICAL_EXPERIMENTS.map((exp) => {
            const isActive = exp.id === activeExpId;
            return (
              <button
                key={exp.id}
                onClick={() => setActiveExpId(exp.id)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'text-zinc-900 bg-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: exp.color }} />
                <span>{exp.shortTitle}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-ee-tab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ backgroundColor: exp.color }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: activeExp.color }} />
              <span>{activeExp.title}</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-3xl leading-relaxed">
              {activeExp.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeExpId === 'network-theorems' && (
              <Link
                href="/experiments/electrical/network-theorems"
                className="px-3.5 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Full Screen Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Experiment Content */}
        <AnimatePresence mode="wait">
          {activeExpId === 'network-theorems' && (
            <motion.div
              key="network"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">Thévenin Equivalent Circuit HUD</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      Vth: {netResult.theveninVoltageVolts} V | Rth: {netResult.theveninResistanceOhms} Ω
                    </span>
                  </div>

                  {/* Circuit Visualizer Diagram */}
                  <div className="h-64 rounded-xl bg-gradient-to-b from-blue-50/40 to-indigo-50/30 border border-zinc-200 p-6 relative flex items-center justify-center">
                    <div className="w-full max-w-lg border-2 border-dashed border-blue-300 rounded-xl p-4 bg-white/80 shadow-xs relative">
                      <span className="absolute -top-3 left-4 bg-blue-600 text-white text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                        Thévenin Equivalent Model
                      </span>
                      <div className="flex items-center justify-between py-6 px-4">
                        <div className="text-center">
                          <div className="w-12 h-12 rounded-full border-2 border-blue-600 flex items-center justify-center font-mono font-bold text-blue-700 bg-blue-50 mx-auto">
                            + Vth -
                          </div>
                          <span className="text-xs font-mono font-bold text-zinc-800 mt-1 block">
                            {netResult.theveninVoltageVolts} V
                          </span>
                        </div>
                        <div className="h-0.5 flex-1 bg-zinc-400 mx-2" />
                        <div className="text-center">
                          <div className="px-3 py-1.5 rounded border-2 border-indigo-600 font-mono font-bold text-indigo-700 bg-indigo-50">
                            Rth: {netResult.theveninResistanceOhms} Ω
                          </div>
                        </div>
                        <div className="h-0.5 flex-1 bg-zinc-400 mx-2" />
                        <div className="text-center">
                          <div className="px-3 py-1.5 rounded border-2 border-emerald-600 font-mono font-bold text-emerald-700 bg-emerald-50">
                            RL: {rl} Ω
                          </div>
                          <span className="text-[10px] font-mono text-emerald-800 mt-1 block">
                            PL = {netResult.loadPowerMilliwatts} mW
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Readout stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Thévenin Voltage</span>
                      <span className="text-base font-mono font-black text-blue-600">{netResult.theveninVoltageVolts} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Thévenin Resistance</span>
                      <span className="text-base font-mono font-black text-indigo-600">{netResult.theveninResistanceOhms} Ω</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Norton Current IN</span>
                      <span className="text-base font-mono font-black text-amber-600">{netResult.nortonCurrentMilliamps} mA</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Achievable Power</span>
                      <span className="text-base font-mono font-black text-emerald-600">{netResult.maxPossiblePowerMilliwatts} mW</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls Right */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>DC Source & Resistor Values</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Source V1:</span>
                        <span className="font-bold text-zinc-900">{v1} V</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="30"
                        step="1"
                        value={v1}
                        onChange={(e) => setV1(parseInt(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Source V2:</span>
                        <span className="font-bold text-zinc-900">{v2} V</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="24"
                        step="1"
                        value={v2}
                        onChange={(e) => setV2(parseInt(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Load Resistor (RL):</span>
                        <span className="font-bold text-emerald-600">{rl} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="300"
                        step="5"
                        value={rl}
                        onChange={(e) => setRl(parseInt(e.target.value))}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Governing Equations */}
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-blue-800 uppercase block">Thévenin & Norton Equations</span>
                    {activeExp.equations.map((eq, i) => (
                      <div key={i} className="text-xs text-zinc-800 overflow-x-auto py-1">
                        <MathView math={eq} display={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeExpId === 'transformer-test' && (
            <motion.div
              key="transformer"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Transformer Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">Transformer Testbench & Efficiency Curve</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Efficiency η = {transResult.efficiencyPercent}%
                    </span>
                  </div>

                  {/* Efficiency Plot */}
                  <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span className="text-emerald-400 font-bold">Efficiency η(%) vs Fraction of Full Load x</span>
                      <span>Regulation: {transResult.voltageRegulationPercent}%</span>
                    </div>

                    <svg className="w-full h-40" viewBox="0 0 400 120">
                      <line x1="30" y1="100" x2="380" y2="100" stroke="#334155" strokeWidth="1" />
                      <line x1="30" y1="10" x2="30" y2="100" stroke="#334155" strokeWidth="1" />
                      {(() => {
                        const pts = transResult.efficiencyCurve
                          .map((pt) => {
                            const x = 30 + (pt.loadFraction / 1.25) * 350;
                            // Map 85% - 100% to Y axis
                            const y = 100 - ((pt.efficiency - 85) / 15) * 85;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ');
                        const currX = 30 + (transformerParams.loadFraction / 1.25) * 350;
                        const currY = 100 - ((transResult.efficiencyPercent - 85) / 15) * 85;
                        return (
                          <>
                            <polyline fill="none" stroke="#34D399" strokeWidth="2.5" points={pts} />
                            <circle cx={currX} cy={currY} r="5" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>x = 0.1 (Light Load)</span>
                      <span>x = 0.5 (Half Load)</span>
                      <span>x = 1.0 (Full Load)</span>
                      <span>x = 1.25 (Overload)</span>
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Core Loss (Pi)</span>
                      <span className="text-base font-mono font-black text-amber-600">{transResult.coreLossWatts} W</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Copper Loss (Pcu)</span>
                      <span className="text-base font-mono font-black text-red-600">{transResult.copperLossWatts} W</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Output Power</span>
                      <span className="text-base font-mono font-black text-emerald-600">{transResult.outputPowerWatts} W</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Secondary V2</span>
                      <span className="text-base font-mono font-black text-zinc-900">{transResult.secondaryTerminalVoltageVolts} V</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Transformer Load Settings</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Load Fraction (x):</span>
                        <span className="font-bold text-zinc-900">{(transformerParams.loadFraction * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.25"
                        step="0.05"
                        value={transformerParams.loadFraction}
                        onChange={(e) =>
                          setTransformerParams({ ...transformerParams, loadFraction: parseFloat(e.target.value) })
                        }
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Power Factor cos(φ):</span>
                        <span className="font-bold text-zinc-900">{transformerParams.powerFactor}</span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="1.0"
                        step="0.05"
                        value={transformerParams.powerFactor}
                        onChange={(e) =>
                          setTransformerParams({ ...transformerParams, powerFactor: parseFloat(e.target.value) })
                        }
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Governing Equations */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Transformer Formulations</span>
                    {activeExp.equations.map((eq, i) => (
                      <div key={i} className="text-xs text-zinc-800 overflow-x-auto py-1">
                        <MathView math={eq} display={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeExpId === 'rlc-resonance' && (
            <motion.div
              key="rlc"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* RLC Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">RLC Frequency Response Curve</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                      f0 = {rlcResult.resonantFrequencyHz} Hz | Q = {rlcResult.qualityFactor}
                    </span>
                  </div>

                  {/* Resonance Curve */}
                  <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span className="text-purple-400 font-bold">Current I (mA) vs Frequency (Hz)</span>
                      <span>Phase Angle: {rlcResult.currentPhaseAngleDeg}° ({rlcResult.nature})</span>
                    </div>

                    <svg className="w-full h-40" viewBox="0 0 400 120">
                      <line x1="30" y1="100" x2="380" y2="100" stroke="#334155" strokeWidth="1" />
                      <line x1="30" y1="10" x2="30" y2="100" stroke="#334155" strokeWidth="1" />
                      {(() => {
                        const maxI = Math.max(...rlcResult.frequencyCurve.map((c) => c.currentMa)) * 1.15;
                        const minF = rlcResult.frequencyCurve[0]?.frequencyHz ?? 10;
                        const maxF = rlcResult.frequencyCurve[rlcResult.frequencyCurve.length - 1]?.frequencyHz ?? 2000;
                        const pts = rlcResult.frequencyCurve
                          .map((pt) => {
                            const x = 30 + ((pt.frequencyHz - minF) / (maxF - minF)) * 350;
                            const y = 100 - (pt.currentMa / maxI) * 85;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ');
                        const currX = 30 + ((rlcParams.frequencyHz - minF) / (maxF - minF)) * 350;
                        const currY = 100 - (rlcResult.currentCurrentMa / maxI) * 85;
                        return (
                          <>
                            <polyline fill="none" stroke="#C084FC" strokeWidth="2.5" points={pts} />
                            <circle cx={currX} cy={currY} r="5" fill="#A855F7" stroke="#FFFFFF" strokeWidth="2" />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>f1 = {rlcResult.lowerCutoffHz} Hz</span>
                      <span className="text-purple-400 font-bold">f0 = {rlcResult.resonantFrequencyHz} Hz</span>
                      <span>f2 = {rlcResult.upperCutoffHz} Hz</span>
                      <span>BW = {rlcResult.bandwidthHz} Hz</span>
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Circuit Current</span>
                      <span className="text-base font-mono font-black text-purple-600">{rlcResult.currentCurrentMa} mA</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Impedance Z</span>
                      <span className="text-base font-mono font-black text-zinc-900">{rlcResult.currentImpedanceOhms} Ω</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Capacitor Voltage Vc</span>
                      <span className="text-base font-mono font-black text-blue-600">{rlcResult.vcVolts} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Inductor Voltage Vl</span>
                      <span className="text-base font-mono font-black text-amber-600">{rlcResult.vlVolts} V</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* RLC Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>RLC Circuit Components</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Signal Freq (f):</span>
                        <span className="font-bold text-purple-600">{rlcParams.frequencyHz} Hz</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="1500"
                        step="10"
                        value={rlcParams.frequencyHz}
                        onChange={(e) => setRlcParams({ ...rlcParams, frequencyHz: parseInt(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Resistance (R):</span>
                        <span className="font-bold text-zinc-900">{rlcParams.resistanceOhms} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={rlcParams.resistanceOhms}
                        onChange={(e) => setRlcParams({ ...rlcParams, resistanceOhms: parseInt(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Inductance (L):</span>
                        <span className="font-bold text-zinc-900">{rlcParams.inductanceMh} mH</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="1"
                        value={rlcParams.inductanceMh}
                        onChange={(e) => setRlcParams({ ...rlcParams, inductanceMh: parseInt(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Capacitance (C):</span>
                        <span className="font-bold text-zinc-900">{rlcParams.capacitanceUf} µF</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="20.0"
                        step="0.5"
                        value={rlcParams.capacitanceUf}
                        onChange={(e) => setRlcParams({ ...rlcParams, capacitanceUf: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Governing Equations */}
                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">Resonance Formulations</span>
                    {activeExp.equations.map((eq, i) => (
                      <div key={i} className="text-xs text-zinc-800 overflow-x-auto py-1">
                        <MathView math={eq} display={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function ElectricalWorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Electrical Laboratory...</div>}>
      <ElectricalWorkbenchContent />
    </Suspense>
  );
}
