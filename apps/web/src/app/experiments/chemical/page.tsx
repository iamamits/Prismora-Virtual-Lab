/**
 * Prismora Chemical Engineering Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Bombay & IIT Guwahati
 * Experiments:
 * 1. McCabe-Thiele Binary Distillation Column (ChE-301)
 * 2. Chemical Reaction Engineering: CSTR vs PFR Reactor Kinetics (ChE-304)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  DistillationEngine,
  DEFAULT_DISTILLATION_PARAMS,
  type DistillationParameters,
  ReactorKineticsEngine,
  DEFAULT_REACTOR_PARAMS,
  type ReactorParameters,
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

type ChemicalExpId = 'distillation' | 'reactor-kinetics';

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
];

function ChemicalWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as ChemicalExpId) || 'distillation';
  const [activeExpId, setActiveExpId] = useState<ChemicalExpId>(
    CHEMICAL_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'distillation',
  );

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

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 flex flex-col font-sans">
      {/* Header */}
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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`che-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Tabs */}
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
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: exp.color }} />
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
            {activeExpId === 'distillation' && (
              <Link
                href="/experiments/chemical/distillation"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Full Screen Distillation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Experiment Content */}
        <AnimatePresence mode="wait">
          {activeExpId === 'distillation' && (
            <motion.div
              key="distill"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">McCabe-Thiele Stepping Diagram</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Theoretical Stages: {distillResult.theoreticalStages} Trays
                    </span>
                  </div>

                  {/* SVG McCabe Thiele Diagram */}
                  <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span className="text-emerald-400 font-bold">y (Vapor mole fraction) vs x (Liquid mole fraction)</span>
                      <span>Optimal Feed Stage: #{distillResult.optimalFeedStage}</span>
                    </div>

                    <svg className="w-full h-44" viewBox="0 0 300 200">
                      {/* 45-degree diagonal */}
                      <line x1="30" y1="170" x2="270" y2="30" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" />
                      
                      {/* Equilibrium curve */}
                      {(() => {
                        const alpha = distillParams.relativeVolatility;
                        const pts: string[] = [];
                        for (let i = 0; i <= 30; i++) {
                          const x = i / 30;
                          const y = (alpha * x) / (1 + (alpha - 1) * x);
                          const px = 30 + x * 240;
                          const py = 170 - y * 140;
                          pts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
                        }
                        return <polyline fill="none" stroke="#34D399" strokeWidth="2.5" points={pts.join(' ')} />;
                      })()}

                      {/* Trays staircase stepping */}
                      {(() => {
                        const steps = distillResult.stages;
                        const stairPts: string[] = [];
                        steps.forEach((s) => {
                          const x1 = 30 + s.x1 * 240;
                          const y1 = 170 - s.y1 * 140;
                          const x2 = 30 + s.x2 * 240;
                          const y2 = 170 - s.y2 * 140;
                          stairPts.push(`${x1.toFixed(1)},${y1.toFixed(1)}`);
                          stairPts.push(`${x2.toFixed(1)},${y2.toFixed(1)}`);
                        });
                        return <polyline fill="none" stroke="#FBBF24" strokeWidth="2" points={stairPts.join(' ')} />;
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Bottoms xB = {distillParams.bottomsPurityXb}</span>
                      <span>Feed xF = {distillParams.feedCompositionXf}</span>
                      <span>Distillate xD = {distillParams.distillatePurityXd}</span>
                    </div>
                  </div>

                  {/* Readout stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Trays</span>
                      <span className="text-base font-mono font-black text-emerald-600">{distillResult.theoreticalStages} Trays</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Min Reflux Rmin</span>
                      <span className="text-base font-mono font-black text-zinc-900">{distillResult.minimumRefluxRatio}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Min Trays Nmin</span>
                      <span className="text-base font-mono font-black text-amber-600">{distillResult.minimumStages} Trays</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Distillate Flow D</span>
                      <span className="text-base font-mono font-black text-blue-600">{distillResult.distillateRateMolH} mol/h</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Distillation Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Column Specifications</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Reflux Ratio (R):</span>
                        <span className="font-bold text-emerald-600">{distillParams.refluxRatio}</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="8.0"
                        step="0.2"
                        value={distillParams.refluxRatio}
                        onChange={(e) => setDistillParams({ ...distillParams, refluxRatio: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Relative Volatility (α):</span>
                        <span className="font-bold text-zinc-900">{distillParams.relativeVolatility}</span>
                      </div>
                      <input
                        type="range"
                        min="1.5"
                        max="4.0"
                        step="0.1"
                        value={distillParams.relativeVolatility}
                        onChange={(e) => setDistillParams({ ...distillParams, relativeVolatility: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Feed Thermal Condition (q):</span>
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

                  {/* Governing Equations */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">McCabe-Thiele Lines</span>
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

          {activeExpId === 'reactor-kinetics' && (
            <motion.div
              key="reactor"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Reactor Left Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">CSTR vs PFR Conversion Trajectory</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      PFR Advantage: +{reactorResult.pfrConversionAdvantagePercent}% Conversion
                    </span>
                  </div>

                  {/* SVG Conversion Curves */}
                  <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span className="text-emerald-400 font-bold">Conversion XA vs Space Time τ (minutes)</span>
                      <span>Volume Ratio V_CSTR/V_PFR: {reactorResult.volumeRatioCstrOverPfr}x</span>
                    </div>

                    <svg className="w-full h-40" viewBox="0 0 400 120">
                      <line x1="30" y1="100" x2="380" y2="100" stroke="#334155" strokeWidth="1" />
                      <line x1="30" y1="10" x2="30" y2="100" stroke="#334155" strokeWidth="1" />
                      {(() => {
                        const maxT = reactorResult.profile[reactorResult.profile.length - 1]?.tauMinutes ?? 30;
                        const cstrPts = reactorResult.profile
                          .map((p) => {
                            const x = 30 + (p.tauMinutes / maxT) * 350;
                            const y = 100 - p.conversionCstr * 85;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ');
                        const pfrPts = reactorResult.profile
                          .map((p) => {
                            const x = 30 + (p.tauMinutes / maxT) * 350;
                            const y = 100 - p.conversionPfr * 85;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ');
                        return (
                          <>
                            <polyline fill="none" stroke="#F59E0B" strokeWidth="2.5" points={cstrPts} />
                            <polyline fill="none" stroke="#10B981" strokeWidth="2.5" points={pfrPts} />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full" />
                        PFR (Plug Flow): X = {(reactorResult.pfrConversion * 100).toFixed(1)}%
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <span className="w-2.5 h-0.5 bg-amber-500 rounded-full" />
                        CSTR (Stirred Tank): X = {(reactorResult.cstrConversion * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Space Time τ</span>
                      <span className="text-base font-mono font-black text-zinc-900">{reactorResult.spaceTimeMinutes} min</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Damköhler No Da</span>
                      <span className="text-base font-mono font-black text-blue-600">{reactorResult.damkohlerNumber}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">PFR Output Conc</span>
                      <span className="text-base font-mono font-black text-emerald-600">{reactorResult.pfrEffluentConcMolL} M</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">CSTR Output Conc</span>
                      <span className="text-base font-mono font-black text-amber-600">{reactorResult.cstrEffluentConcMolL} M</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Kinetic Parameters</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Rate Constant (k):</span>
                        <span className="font-bold text-emerald-600">{reactorParams.rateConstantK} min⁻¹</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.8"
                        step="0.05"
                        value={reactorParams.rateConstantK}
                        onChange={(e) => setReactorParams({ ...reactorParams, rateConstantK: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Reactor Volume (V):</span>
                        <span className="font-bold text-zinc-900">{reactorParams.reactorVolumeL} L</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="300"
                        step="10"
                        value={reactorParams.reactorVolumeL}
                        onChange={(e) => setReactorParams({ ...reactorParams, reactorVolumeL: parseInt(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Feed Rate (v0):</span>
                        <span className="font-bold text-zinc-900">{reactorParams.flowRateLPerMin} L/min</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="30"
                        step="1"
                        value={reactorParams.flowRateLPerMin}
                        onChange={(e) => setReactorParams({ ...reactorParams, flowRateLPerMin: parseInt(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Governing Equations */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Design Formulations</span>
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
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Chemical Laboratory...</div>}>
      <ChemicalWorkbenchContent />
    </Suspense>
  );
}
