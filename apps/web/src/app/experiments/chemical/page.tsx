/**
 * Prismora Chemical Engineering Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Bombay, IIT Guwahati, IIT Roorkee & IIT Kharagpur
 * Experiments:
 * 1. McCabe-Thiele Binary Distillation Column (ChE-301)
 * 2. Chemical Reaction Engineering: CSTR vs PFR Performance (ChE-304)
 * 3. Liquid-Liquid Extraction (LLE) & Binodal Equilibrium Curve (ChE-306)
 * 4. Double-Pipe & Shell-and-Tube Heat Exchanger (LMTD / NTU) (ChE-308)
 * 5. Gas Absorption in Packed Bed Column (ChE-310)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import { RealtimeDistillationScene } from '@/components/simulation/realtime-distillation-scene';
import {
  DistillationEngine,
  DEFAULT_DISTILLATION_PARAMS,
  type DistillationParameters,
  ReactorKineticsEngine,
  DEFAULT_REACTOR_PARAMS,
  type ReactorParameters,
  LiquidExtractionEngine,
  DEFAULT_EXTRACTION_PARAMS,
  type LiquidExtractionParameters,
  HeatExchangerEngine,
  DEFAULT_HEAT_EXCHANGER_PARAMS,
  type HeatExchangerParameters,
  type FlowArrangement,
  GasAbsorptionEngine,
  DEFAULT_GAS_ABSORPTION_PARAMS,
  type GasAbsorptionParameters,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Download,
  Flame,
  Layers,
  RotateCcw,
  Sliders,
  Sparkles,
  TestTubes,
} from 'lucide-react';

type ChemicalExpId =
  | 'distillation'
  | 'reactor-kinetics'
  | 'liquid-extraction'
  | 'heat-exchanger'
  | 'gas-absorption';

interface ChemicalExperimentDef {
  readonly id: ChemicalExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const CHEMICAL_EXPERIMENTS: readonly ChemicalExperimentDef[] = [
  {
    id: 'distillation',
    title: 'McCabe-Thiele Binary Fractional Distillation Column',
    shortTitle: 'Distillation Column',
    courseCode: 'ChE-301 (Mass Transfer Operations)',
    benchmark: 'IIT Bombay & IIT Kharagpur',
    description: 'Vapor-liquid equilibrium (VLE) curve, q-line feed thermal condition, rectifying and stripping operating lines, and tray stepping.',
    color: '#10B981',
    equations: [
      'y = \\frac{R}{R+1} x + \\frac{x_D}{R+1} \\quad (\\text{Rectifying Line})',
      'y = \\frac{q}{q-1} x - \\frac{x_F}{q-1} \\quad (\\text{q-Line})',
      'N_{min} = \\frac{\\ln(\\frac{x_D}{1-x_D} \\frac{1-x_B}{x_B})}{\\ln \\alpha}',
    ],
  },
  {
    id: 'reactor-kinetics',
    title: 'Chemical Reaction Engineering: CSTR vs PFR Performance',
    shortTitle: 'CSTR vs PFR Reactors',
    courseCode: 'ChE-304 (Chemical Reaction Engineering)',
    benchmark: 'IIT Bombay & IIT Guwahati',
    description: 'First-order liquid reaction A -> B, Damköhler number Da = k*tau, conversion comparison X_CSTR vs X_PFR, and required volume ratio.',
    color: '#059669',
    equations: [
      'X_{CSTR} = \\frac{Da}{1 + Da}, \\quad X_{PFR} = 1 - e^{-Da}',
      'Da = k \\tau = \\frac{k V}{v_0}',
      '\\frac{V_{CSTR}}{V_{PFR}} = \\frac{X / (1-X)}{\\ln(1 / (1-X))}',
    ],
  },
  {
    id: 'liquid-extraction',
    title: 'Liquid-Liquid Extraction (LLE) & Ternary Binodal Curve',
    shortTitle: 'Liquid-Liquid Extraction',
    courseCode: 'ChE-306 (Separation Processes)',
    benchmark: 'IIT Guwahati & IIT Roorkee',
    description: 'Cross-current solvent extraction, distribution coefficient K = y/x, ternary phase equilibrium, and percentage solute recovery.',
    color: '#0D9488',
    equations: [
      'K = \\frac{y_E}{x_R} \\quad (\\text{Distribution Coefficient})',
      'F x_F + S y_S = E y_E + R x_R',
      '\\eta = \\frac{E y_E}{F x_F} \\times 100\\%',
    ],
  },
  {
    id: 'heat-exchanger',
    title: 'Double-Pipe & Shell-and-Tube Heat Exchanger Performance',
    shortTitle: 'Heat Exchanger',
    courseCode: 'ChE-308 (Heat Transfer Operations)',
    benchmark: 'IIT Roorkee & IIT Bombay',
    description: 'Counter-current vs co-current arrangements, Log Mean Temperature Difference (LMTD), overall heat transfer coefficient U, and effectiveness-NTU.',
    color: '#F59E0B',
    equations: [
      'Q = U A \\Delta T_{lm} = \\dot{m} C_p \\Delta T',
      '\\Delta T_{lm} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)}',
      '\\epsilon = \\frac{Q}{Q_{max}} = \\frac{1 - e^{-NTU(1-C_r)}}{1 - C_r e^{-NTU(1-C_r)}}',
    ],
  },
  {
    id: 'gas-absorption',
    title: 'Gas Absorption in Packed Column & Number of Transfer Units',
    shortTitle: 'Gas Absorption Column',
    courseCode: 'ChE-310 (Mass Transfer II)',
    benchmark: 'IIT Kharagpur & IIT Roorkee',
    description: "Packed bed gas absorption, Colburn's equation, absorption factor A = L/(m*G), height of packing Z = N_OG * H_OG, and solute recovery.",
    color: '#0284C7',
    equations: [
      'A = \\frac{L}{m G} \\quad (\\text{Absorption Factor})',
      'N_{OG} = \\frac{\\ln\\left[\\frac{y_1 - m x_2}{y_2 - m x_2}(1 - \\frac{1}{A}) + \\frac{1}{A}\\right]}{1 - \\frac{1}{A}}',
      'Z = N_{OG} \\times H_{OG}',
    ],
  },
];

function ChemicalWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as ChemicalExpId) || 'distillation';
  const [activeExpId, setActiveExpId] = useState<ChemicalExpId>(
    CHEMICAL_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'distillation',
  );

  React.useEffect(() => {
    const exp = searchParams.get('exp') as ChemicalExpId;
    if (exp && CHEMICAL_EXPERIMENTS.some((e) => e.id === exp)) {
      setActiveExpId(exp);
    }
  }, [searchParams]);

  const activeExp = useMemo(
    () => CHEMICAL_EXPERIMENTS.find((e) => e.id === activeExpId) ?? CHEMICAL_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // ==========================================
  // EXP 1: Distillation States
  // ==========================================
  const [distillParams, setDistillParams] = useState<DistillationParameters>(DEFAULT_DISTILLATION_PARAMS);
  const distillResult = useMemo(() => DistillationEngine.compute(distillParams), [distillParams]);

  // ==========================================
  // EXP 2: Reactor Kinetics States
  // ==========================================
  const [reactorParams, setReactorParams] = useState<ReactorParameters>(DEFAULT_REACTOR_PARAMS);
  const reactorResult = useMemo(() => ReactorKineticsEngine.compute(reactorParams), [reactorParams]);

  // ==========================================
  // EXP 3: Liquid Extraction States
  // ==========================================
  const [extractParams, setExtractParams] = useState<LiquidExtractionParameters>(DEFAULT_EXTRACTION_PARAMS);
  const extractResult = useMemo(() => LiquidExtractionEngine.compute(extractParams), [extractParams]);

  // ==========================================
  // EXP 4: Heat Exchanger States
  // ==========================================
  const [hxParams, setHxParams] = useState<HeatExchangerParameters>(DEFAULT_HEAT_EXCHANGER_PARAMS);
  const hxResult = useMemo(() => HeatExchangerEngine.compute(hxParams), [hxParams]);

  // ==========================================
  // EXP 5: Gas Absorption States
  // ==========================================
  const [absorbParams, setAbsorbParams] = useState<GasAbsorptionParameters>(DEFAULT_GAS_ABSORPTION_PARAMS);
  const absorbResult = useMemo(() => GasAbsorptionEngine.compute(absorbParams), [absorbParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 flex flex-col font-sans">
      {/* Top Breadcrumb & Header */}
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Link href="/" className="hover:text-blue-600 transition-colors">Prismora</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/library" className="hover:text-blue-600 transition-colors">Disciplines</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-zinc-900">Chemical Engineering Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`che-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CHEMICAL_EXPERIMENTS.map((exp) => {
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
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: exp.color }}
                />
                <span>{exp.shortTitle}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-che-tab"
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: DISTILLATION */}
          {activeExpId === 'distillation' && (
            <motion.div
              key="distillation"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Stages = {distillResult.theoreticalTrays} Theoretical Trays
                    </span>
                  </div>

                  {/* Realtime Interactive PhET Distillation Workbench */}
                  <RealtimeDistillationScene
                    relativeVolatility={distillParams.relativeVolatility ?? 2.5}
                    feedMoleFraction={distillParams.feedMoleFraction ?? 0.45}
                    distillateMoleFraction={distillParams.distillateMoleFraction ?? 0.95}
                    bottomsMoleFraction={distillParams.bottomsMoleFraction ?? 0.05}
                    refluxRatio={distillParams.refluxRatio ?? 2.2}
                    feedQuality={distillParams.feedThermalConditionQ ?? 1.0}
                  />

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Theoretical Trays</span>
                      <span className="text-base font-mono font-black text-emerald-600">{distillResult.theoreticalTrays}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Min Reflux Rmin</span>
                      <span className="text-base font-mono font-black text-zinc-900">{distillResult.minimumRefluxRatio.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Optimum Reflux R</span>
                      <span className="text-base font-mono font-black text-blue-600">{distillParams.refluxRatio.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Feed Tray Location</span>
                      <span className="text-base font-mono font-black text-amber-600">Tray #{distillResult.feedTrayLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Distillation Operating Specs</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Reflux Ratio (R):</span>
                        <span className="font-bold text-zinc-900">{distillParams.refluxRatio}</span>
                      </div>
                      <input
                        type="range"
                        min="1.2"
                        max="5.0"
                        step="0.1"
                        value={distillParams.refluxRatio}
                        onChange={(e) => setDistillParams({ ...distillParams, refluxRatio: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Relative Volatility (α):</span>
                        <span className="font-bold text-zinc-900">{distillParams.relativeVolatility}</span>
                      </div>
                      <input
                        type="range"
                        min="1.5"
                        max="3.5"
                        step="0.1"
                        value={distillParams.relativeVolatility}
                        onChange={(e) => setDistillParams({ ...distillParams, relativeVolatility: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Feed Quality (q):</span>
                        <span className="font-bold text-zinc-900">{distillParams.feedThermalConditionQ}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={distillParams.feedThermalConditionQ}
                        onChange={(e) => setDistillParams({ ...distillParams, feedThermalConditionQ: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Mass Transfer Equations</span>
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

          {/* TAB 2: CSTR VS PFR */}
          {activeExpId === 'reactor-kinetics' && (
            <motion.div
              key="reactor-kinetics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Da = {reactorResult.damkohlerNumber.toFixed(2)}
                    </span>
                  </div>

                  {/* Reactor Schematics Comparison */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-around">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      {/* CSTR Tank */}
                      <rect x="70" y="40" width="110" height="110" rx="10" fill="#1E293B" stroke="#059669" strokeWidth="2.5" />
                      <line x1="125" y1="20" x2="125" y2="80" stroke="#94A3B8" strokeWidth="4" />
                      <line x1="110" y1="80" x2="140" y2="80" stroke="#94A3B8" strokeWidth="4" />
                      <text x="125" y="170" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="bold" fontFamily="monospace">
                        CSTR: X = {(reactorResult.cstrConversion * 100).toFixed(1)}%
                      </text>

                      {/* PFR Tube */}
                      <rect x="290" y="70" width="160" height="50" rx="6" fill="#1E293B" stroke="#38BDF8" strokeWidth="2.5" />
                      <line x1="250" y1="95" x2="290" y2="95" stroke="#38BDF8" strokeWidth="3" />
                      <line x1="450" y1="95" x2="490" y2="95" stroke="#38BDF8" strokeWidth="3" />
                      <text x="370" y="170" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontWeight="bold" fontFamily="monospace">
                        PFR: X = {(reactorResult.pfrConversion * 100).toFixed(1)}%
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">CSTR Conversion</span>
                      <span className="text-base font-mono font-black text-emerald-600">{(reactorResult.cstrConversion * 100).toFixed(1)}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">PFR Conversion</span>
                      <span className="text-base font-mono font-black text-sky-600">{(reactorResult.pfrConversion * 100).toFixed(1)}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Space Time τ</span>
                      <span className="text-base font-mono font-black text-zinc-900">{reactorResult.spaceTimeSeconds.toFixed(1)} s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Volume Ratio Vc/Vp</span>
                      <span className="text-base font-mono font-black text-amber-600">{reactorResult.volumeRatioCstrOverPfr.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Reaction Kinetics</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Reaction Constant (k):</span>
                        <span className="font-bold text-zinc-900">{reactorParams.reactionRateConstantK} s⁻¹</span>
                      </div>
                      <input
                        type="range"
                        min="0.01"
                        max="0.5"
                        step="0.01"
                        value={reactorParams.reactionRateConstantK}
                        onChange={(e) => setReactorParams({ ...reactorParams, reactionRateConstantK: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Feed Flow Rate:</span>
                        <span className="font-bold text-zinc-900">{reactorParams.volumetricFlowRateLps} L/s</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="5.0"
                        step="0.1"
                        value={reactorParams.volumetricFlowRateLps}
                        onChange={(e) => setReactorParams({ ...reactorParams, volumetricFlowRateLps: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Reactor Volume:</span>
                        <span className="font-bold text-zinc-900">{reactorParams.reactorVolumeLiters} L</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={reactorParams.reactorVolumeLiters}
                        onChange={(e) => setReactorParams({ ...reactorParams, reactorVolumeLiters: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Reaction Engineering</span>
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

          {/* TAB 3: LIQUID-LIQUID EXTRACTION */}
          {activeExpId === 'liquid-extraction' && (
            <motion.div
              key="liquid-extraction"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      Overall Recovery = {extractResult.overallRecoveryPct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Ternary Binodal Curve / Extraction Stages Display */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      {/* Equilateral Triangle for Ternary System */}
                      <polygon points="250,20 80,190 420,190" fill="none" stroke="#475569" strokeWidth="2" />
                      <text x="250" y="15" textAnchor="middle" fill="#F8FAFC" fontSize="11" fontWeight="bold" fontFamily="monospace">Solute B (Acid)</text>
                      <text x="60" y="205" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="monospace">Carrier A (Water)</text>
                      <text x="435" y="205" textAnchor="middle" fill="#F59E0B" fontSize="11" fontFamily="monospace">Solvent C (Ester)</text>

                      {/* Binodal dome curve */}
                      <path d="M 120 190 Q 250 50 380 190" fill="#0D9488" fillOpacity="0.25" stroke="#14B8A6" strokeWidth="2.5" />
                      {/* Tie Line */}
                      <line x1="160" y1="160" x2="340" y2="160" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4,4" />
                      <circle cx="160" cy="160" r="5" fill="#38BDF8" />
                      <circle cx="340" cy="160" r="5" fill="#F59E0B" />
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Solute Recovery</span>
                      <span className="text-base font-mono font-black text-teal-600">{extractResult.overallRecoveryPct.toFixed(1)}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Final Raffinate xR</span>
                      <span className="text-base font-mono font-black text-zinc-900">{extractResult.finalRaffinateSoluteFraction.toFixed(3)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Extract Rate</span>
                      <span className="text-base font-mono font-black text-blue-600">{extractResult.totalExtractRateKgPerH.toFixed(1)} kg/h</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Stages</span>
                      <span className="text-base font-mono font-black text-emerald-600">{extractResult.stages.length}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-teal-600" />
                    <span>Extraction Operating Parameters</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Distribution Coeff (K):</span>
                        <span className="font-bold text-zinc-900">{extractParams.distributionCoeffK}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="4.0"
                        step="0.1"
                        value={extractParams.distributionCoeffK}
                        onChange={(e) => setExtractParams({ ...extractParams, distributionCoeffK: parseFloat(e.target.value) })}
                        className="w-full accent-teal-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Solvent Flow Rate (S):</span>
                        <span className="font-bold text-zinc-900">{extractParams.solventRateKgPerH} kg/h</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        step="10"
                        value={extractParams.solventRateKgPerH}
                        onChange={(e) => setExtractParams({ ...extractParams, solventRateKgPerH: parseFloat(e.target.value) })}
                        className="w-full accent-teal-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Number of Stages:</span>
                        <span className="font-bold text-zinc-900">{extractParams.numberOfStages}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="4"
                        step="1"
                        value={extractParams.numberOfStages}
                        onChange={(e) => setExtractParams({ ...extractParams, numberOfStages: parseInt(e.target.value, 10) })}
                        className="w-full accent-teal-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-teal-800 uppercase block">LLE Equations</span>
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

          {/* TAB 4: HEAT EXCHANGER */}
          {activeExpId === 'heat-exchanger' && (
            <motion.div
              key="heat-exchanger"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 capitalize">
                      {hxParams.flowArrangement.replace('_', ' ')} (ε = {hxResult.effectivenessPct.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Temperature Profiles Along Exchanger Length */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#334155" strokeWidth="1.5" />

                      {/* Hot fluid curve (Red) */}
                      {(() => {
                        const pts = hxResult.temperatureProfilesAlongLength;
                        const toX = (f: number) => 40 + f * 440;
                        const toY = (t: number) => 170 - (t / 100) * 150;
                        const hotPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.lengthFrac).toFixed(1)} ${toY(p.hotTempC).toFixed(1)}`).join(' ');
                        const coldPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.lengthFrac).toFixed(1)} ${toY(p.coldTempC).toFixed(1)}`).join(' ');
                        return (
                          <>
                            <path d={hotPath} fill="none" stroke="#EF4444" strokeWidth="2.5" />
                            <path d={coldPath} fill="none" stroke="#38BDF8" strokeWidth="2.5" />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span className="text-red-400">― Hot Stream: {hxParams.hotInletTempC}°C → {hxResult.hotOutletTempC.toFixed(1)}°C</span>
                      <span className="text-sky-400">― Cold Stream: {hxParams.coldInletTempC}°C → {hxResult.coldOutletTempC.toFixed(1)}°C</span>
                      <span>LMTD = {hxResult.lmtdC.toFixed(1)}°C</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Heat Duty Q</span>
                      <span className="text-base font-mono font-black text-amber-600">{hxResult.heatDutyKw.toFixed(1)} kW</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">LMTD</span>
                      <span className="text-base font-mono font-black text-zinc-900">{hxResult.lmtdC.toFixed(1)} °C</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Effectiveness ε</span>
                      <span className="text-base font-mono font-black text-emerald-600">{hxResult.effectivenessPct.toFixed(1)}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">NTU</span>
                      <span className="text-base font-mono font-black text-blue-600">{hxResult.ntu.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>Heat Exchanger Operating Specs</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Hot Inlet Temp:</span>
                        <span className="font-bold text-red-600">{hxParams.hotInletTempC}°C</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="120"
                        step="2"
                        value={hxParams.hotInletTempC}
                        onChange={(e) => setHxParams({ ...hxParams, hotInletTempC: parseFloat(e.target.value) })}
                        className="w-full accent-red-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Overall Coeff (U):</span>
                        <span className="font-bold text-zinc-900">{hxParams.overallHeatTransferCoeffU} W/m²·K</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="1500"
                        step="50"
                        value={hxParams.overallHeatTransferCoeffU}
                        onChange={(e) => setHxParams({ ...hxParams, overallHeatTransferCoeffU: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Flow Arrangement:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['counter_current', 'co_current'] as FlowArrangement[]).map((arr) => (
                          <button
                            key={arr}
                            onClick={() => setHxParams({ ...hxParams, flowArrangement: arr })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border text-left ${
                              hxParams.flowArrangement === arr
                                ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {arr.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Heat Transfer Equations</span>
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

          {/* TAB 5: GAS ABSORPTION */}
          {activeExpId === 'gas-absorption' && (
            <motion.div
              key="gas-absorption"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                      Recovery = {absorbResult.percentageRecovery.toFixed(1)}% (Z = {absorbResult.heightOfPackingZMetres.toFixed(2)} m)
                    </span>
                  </div>

                  {/* Packed Bed Schematic Diagram */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      {/* Packed Column Column Shell */}
                      <rect x="200" y="20" width="100" height="180" rx="8" fill="#1E293B" stroke="#0284C7" strokeWidth="2.5" />
                      {/* Packing Material Texture (rings/saddles) */}
                      <pattern id="packingPattern" width="10" height="10" patternUnits="userSpaceOnUse">
                        <circle cx="5" cy="5" r="3" fill="none" stroke="#64748B" strokeWidth="1" />
                      </pattern>
                      <rect x="205" y="45" width="90" height="130" fill="url(#packingPattern)" />

                      {/* Gas In (bottom left) & Gas Out (top) */}
                      <line x1="150" y1="180" x2="200" y2="180" stroke="#F59E0B" strokeWidth="3" />
                      <text x="130" y="185" fill="#F59E0B" fontSize="10" fontFamily="monospace">Gas In (y1)</text>

                      {/* Liquid In (top right) & Liquid Out (bottom) */}
                      <line x1="300" y1="40" x2="350" y2="40" stroke="#38BDF8" strokeWidth="3" />
                      <text x="360" y="45" fill="#38BDF8" fontSize="10" fontFamily="monospace">Liquid In</text>

                      <text x="250" y="210" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontFamily="monospace">
                        Packed Bed Height Z = {absorbResult.heightOfPackingZMetres.toFixed(2)}m (NOG = {absorbResult.numberOfTransferUnitsNog.toFixed(1)})
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Bed Height Z</span>
                      <span className="text-base font-mono font-black text-sky-600">{absorbResult.heightOfPackingZMetres.toFixed(2)} m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Transfer Units NOG</span>
                      <span className="text-base font-mono font-black text-zinc-900">{absorbResult.numberOfTransferUnitsNog.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Absorption Factor A</span>
                      <span className="text-base font-mono font-black text-blue-600">{absorbResult.absorptionFactorA.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Gas Recovery</span>
                      <span className="text-base font-mono font-black text-emerald-600">{absorbResult.percentageRecovery.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-sky-600" />
                    <span>Absorption Column Design</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Liquid Flow Rate (L):</span>
                        <span className="font-bold text-zinc-900">{absorbParams.liquidFlowRateKmolPerH} kmol/h</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="200"
                        step="10"
                        value={absorbParams.liquidFlowRateKmolPerH}
                        onChange={(e) => setAbsorbParams({ ...absorbParams, liquidFlowRateKmolPerH: parseFloat(e.target.value) })}
                        className="w-full accent-sky-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Gas Flow Rate (G):</span>
                        <span className="font-bold text-zinc-900">{absorbParams.gasFlowRateKmolPerH} kmol/h</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="120"
                        step="5"
                        value={absorbParams.gasFlowRateKmolPerH}
                        onChange={(e) => setAbsorbParams({ ...absorbParams, gasFlowRateKmolPerH: parseFloat(e.target.value) })}
                        className="w-full accent-sky-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Height of Transfer Unit HOG:</span>
                        <span className="font-bold text-zinc-900">{absorbParams.heightOfTransferUnitHogM} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="1.2"
                        step="0.05"
                        value={absorbParams.heightOfTransferUnitHogM}
                        onChange={(e) => setAbsorbParams({ ...absorbParams, heightOfTransferUnitHogM: parseFloat(e.target.value) })}
                        className="w-full accent-sky-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-sky-800 uppercase block">Mass Transfer Equations</span>
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

export default function ChemicalWorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Chemical Engineering Laboratory...</div>}>
      <ChemicalWorkbenchContent />
    </Suspense>
  );
}
