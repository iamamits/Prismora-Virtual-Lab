/**
 * Prismora Biotechnology & Biomedical Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Kharagpur, IIT Roorkee & Amrita Vishwa Vidyapeetham
 * Experiments:
 * 1. Michaelis-Menten & Lineweaver-Burk Enzyme Kinetics (BT-201)
 * 2. Microbial Growth & Monod Kinetics Batch Fermentation (BT-204)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  EnzymeKineticsEngine,
  DEFAULT_ENZYME_PARAMS,
  type EnzymeParameters,
  BacterialGrowthEngine,
  DEFAULT_MICROBIAL_PARAMS,
  type MicrobialParameters,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Dna,
  Download,
  FlaskConical,
  Layers,
  RotateCcw,
  Sliders,
  Sparkles,
  TestTube,
} from 'lucide-react';

type BiotechExpId = 'enzyme-kinetics' | 'bacterial-growth';

interface BiotechExperimentDef {
  readonly id: BiotechExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const BIOTECH_EXPERIMENTS: readonly BiotechExperimentDef[] = [
  {
    id: 'enzyme-kinetics',
    title: 'Michaelis-Menten & Lineweaver-Burk Enzyme Kinetics',
    shortTitle: 'Enzyme Kinetics',
    courseCode: 'BT-201 (Biochemistry & Enzymology)',
    benchmark: 'IIT Kharagpur & Amrita University',
    description: 'Initial reaction velocity v0 vs [S], hyperbolic saturation, double-reciprocal plot, Km and Vmax determination, and enzyme inhibitors.',
    color: '#EC4899',
    equations: [
      'v_0 = \\frac{V_{max} [S]}{K_m + [S]}',
      '\\frac{1}{v_0} = \\frac{K_m}{V_{max}} \\frac{1}{[S]} + \\frac{1}{V_{max}} \\quad (\\text{Lineweaver-Burk})',
      'K_{m,app} = K_m \\left(1 + \\frac{[I]}{K_i}\\right) \\quad (\\text{Competitive})',
    ],
  },
  {
    id: 'bacterial-growth',
    title: 'Microbial Growth & Monod Kinetics Batch Fermentation',
    shortTitle: 'Microbial Fermentation',
    courseCode: 'BT-204 (Bioprocess Engineering)',
    benchmark: 'IIT Roorkee & IIT Delhi',
    description: 'Bacterial growth phases (Lag, Exponential Log, Stationary, Death), Monod substrate affinity Ks, specific growth rate mu, and biomass yield.',
    color: '#10B981',
    equations: [
      '\\mu = \\mu_{max} \\frac{S}{K_s + S} \\quad (\\text{Monod Model})',
      '\\frac{dX}{dt} = (\\mu - k_d) X',
      't_d = \\frac{\\ln 2}{\\mu_{max}}, \\quad Y_{X/S} = \\frac{\\Delta X}{\\Delta S}',
    ],
  },
];

function BiotechWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as BiotechExpId) || 'enzyme-kinetics';
  const [activeExpId, setActiveExpId] = useState<BiotechExpId>(
    BIOTECH_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'enzyme-kinetics',
  );

  const activeExp = useMemo(
    () => BIOTECH_EXPERIMENTS.find((e) => e.id === activeExpId) ?? BIOTECH_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // ==========================================
  // EXP 1: Enzyme States
  // ==========================================
  const [enzymeParams, setEnzymeParams] = useState<EnzymeParameters>(DEFAULT_ENZYME_PARAMS);
  const enzymeResult = useMemo(() => EnzymeKineticsEngine.compute(enzymeParams), [enzymeParams]);

  // ==========================================
  // EXP 2: Bacterial Growth States
  // ==========================================
  const [microbialParams, setMicrobialParams] = useState<MicrobialParameters>(DEFAULT_MICROBIAL_PARAMS);
  const microbialResult = useMemo(() => BacterialGrowthEngine.compute(microbialParams), [microbialParams]);

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
            <span className="font-bold text-zinc-900">Biotechnology Virtual Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 border border-pink-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`bt-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BIOTECH_EXPERIMENTS.map((exp) => {
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
                    layoutId="active-bt-tab"
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
            {activeExpId === 'enzyme-kinetics' && (
              <Link
                href="/experiments/biotech/enzyme-kinetics"
                className="px-3.5 py-1.5 rounded-lg bg-pink-600 text-white text-xs font-bold hover:bg-pink-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Full Screen Assay</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Experiment Content */}
        <AnimatePresence mode="wait">
          {activeExpId === 'enzyme-kinetics' && (
            <motion.div
              key="enzyme"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">Michaelis-Menten Velocity Plot</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-pink-50 text-pink-700 font-bold border border-pink-200">
                      Km = {enzymeResult.apparentKm} mM | Vmax = {enzymeResult.apparentVmax} µmol/min
                    </span>
                  </div>

                  {/* SVG Velocity Curve */}
                  <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span className="text-pink-400 font-bold">Initial Velocity v0 (µmol/min) vs Substrate [S] (mM)</span>
                      <span>1/2 Vmax = {(enzymeResult.apparentVmax / 2).toFixed(1)} µmol/min</span>
                    </div>

                    <svg className="w-full h-44" viewBox="0 0 400 120">
                      <line x1="30" y1="100" x2="380" y2="100" stroke="#334155" strokeWidth="1" />
                      <line x1="30" y1="10" x2="30" y2="100" stroke="#334155" strokeWidth="1" />
                      {(() => {
                        const maxV = enzymeResult.apparentVmax * 1.15;
                        const maxS = enzymeResult.curvePoints[enzymeResult.curvePoints.length - 1]?.substrateMm ?? 50;
                        const pts = enzymeResult.curvePoints
                          .map((p) => {
                            const x = 30 + (p.substrateMm / maxS) * 350;
                            const y = 100 - (p.velocity / maxV) * 85;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ');
                        const subMm = enzymeParams.currentSubstrateMm ?? 5.0;
                        const currX = 30 + (subMm / maxS) * 350;
                        const currY = 100 - (enzymeResult.currentVelocity / maxV) * 85;
                        return (
                          <>
                            <polyline fill="none" stroke="#F472B6" strokeWidth="2.5" points={pts} />
                            <circle cx={currX} cy={currY} r="5" fill="#EC4899" stroke="#FFFFFF" strokeWidth="2" />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>[S] = 0 mM</span>
                      <span>Km = {enzymeResult.apparentKm} mM</span>
                      <span>[S] = 50 mM (Asymptotic Vmax)</span>
                    </div>
                  </div>

                  {/* Readout stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Current Rate v0</span>
                      <span className="text-base font-mono font-black text-pink-600">{enzymeResult.currentVelocity} µM/min</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Apparent Km</span>
                      <span className="text-base font-mono font-black text-zinc-900">{enzymeResult.apparentKm} mM</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Vmax Saturation</span>
                      <span className="text-base font-mono font-black text-blue-600">{enzymeResult.apparentVmax} µM/min</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Lineweaver Slope</span>
                      <span className="text-base font-mono font-black text-amber-600">{enzymeResult.lineweaverBurkSlope}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-pink-600" />
                    <span>Assay Conditions</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Substrate [S]:</span>
                        <span className="font-bold text-pink-600">{enzymeParams.substrateConcentration ?? 5.0} mM</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="40"
                        step="0.5"
                        value={enzymeParams.substrateConcentration ?? 5.0}
                        onChange={(e) =>
                          setEnzymeParams({ ...enzymeParams, substrateConcentration: parseFloat(e.target.value) })
                        }
                        className="w-full accent-pink-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Vmax Capacity:</span>
                        <span className="font-bold text-zinc-900">{enzymeParams.vMax} µM/min</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="200"
                        step="5"
                        value={enzymeParams.vMax}
                        onChange={(e) => setEnzymeParams({ ...enzymeParams, vMax: parseInt(e.target.value) })}
                        className="w-full accent-pink-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Michaelis Constant (Km):</span>
                        <span className="font-bold text-zinc-900">{enzymeParams.kM ?? 4.5} mM</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="0.5"
                        value={enzymeParams.kM ?? 4.5}
                        onChange={(e) => setEnzymeParams({ ...enzymeParams, kM: parseFloat(e.target.value) })}
                        className="w-full accent-pink-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Equations */}
                  <div className="p-3.5 rounded-xl bg-pink-50/60 border border-pink-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-pink-800 uppercase block">Enzyme Formulations</span>
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

          {activeExpId === 'bacterial-growth' && (
            <motion.div
              key="bacterial"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">Batch Microbial Growth & Substrate Depletion</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Doubling Time td = {microbialResult.doublingTimeHours} h
                    </span>
                  </div>

                  {/* SVG Fermentation Curve */}
                  <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span className="text-emerald-400 font-bold">Biomass X (g/L) & Substrate S (g/L) vs Time (hours)</span>
                      <span>Max Biomass: {microbialResult.maximumBiomassGL} g/L</span>
                    </div>

                    <svg className="w-full h-40" viewBox="0 0 400 120">
                      <line x1="30" y1="100" x2="380" y2="100" stroke="#334155" strokeWidth="1" />
                      <line x1="30" y1="10" x2="30" y2="100" stroke="#334155" strokeWidth="1" />
                      {(() => {
                        const maxB = microbialResult.maximumBiomassGL * 1.15;
                        const maxS = microbialParams.initialSubstrateGL;
                        const maxT = microbialParams.totalTimeHours;
                        const bioPts = microbialResult.trajectory
                          .map((p) => {
                            const x = 30 + (p.timeHours / maxT) * 350;
                            const y = 100 - (p.biomassGL / maxB) * 85;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ');
                        const subPts = microbialResult.trajectory
                          .map((p) => {
                            const x = 30 + (p.timeHours / maxT) * 350;
                            const y = 100 - (p.substrateGL / maxS) * 85;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ');
                        return (
                          <>
                            <polyline fill="none" stroke="#10B981" strokeWidth="2.5" points={bioPts} />
                            <polyline fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="4 2" points={subPts} />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                      <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                        <span className="w-2.5 h-0.5 bg-emerald-500 rounded-full" />
                        Biomass X(t) [Solid Line]
                      </span>
                      <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                        <span className="w-2.5 h-0.5 bg-amber-500 rounded-full" />
                        Substrate S(t) [Dashed Line]
                      </span>
                    </div>
                  </div>

                  {/* Readout stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Biomass</span>
                      <span className="text-base font-mono font-black text-emerald-600">{microbialResult.maximumBiomassGL} g/L</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Consumed Substrate</span>
                      <span className="text-base font-mono font-black text-zinc-900">{microbialResult.totalSubstrateConsumedGL} g/L</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Doubling Time td</span>
                      <span className="text-base font-mono font-black text-blue-600">{microbialResult.doublingTimeHours} h</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Biomass Yield Yxs</span>
                      <span className="text-base font-mono font-black text-amber-600">{microbialResult.overallYield}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Fermenter Parameters</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Max Growth Rate (µmax):</span>
                        <span className="font-bold text-emerald-600">{microbialParams.maxGrowthRateH} h⁻¹</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="1.2"
                        step="0.05"
                        value={microbialParams.maxGrowthRateH}
                        onChange={(e) =>
                          setMicrobialParams({ ...microbialParams, maxGrowthRateH: parseFloat(e.target.value) })
                        }
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Initial Substrate (S0):</span>
                        <span className="font-bold text-zinc-900">{microbialParams.initialSubstrateGL} g/L</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="40"
                        step="1"
                        value={microbialParams.initialSubstrateGL}
                        onChange={(e) =>
                          setMicrobialParams({ ...microbialParams, initialSubstrateGL: parseInt(e.target.value) })
                        }
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Affinity Constant (Ks):</span>
                        <span className="font-bold text-zinc-900">{microbialParams.substrateAffinityKs} g/L</span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.5"
                        step="0.05"
                        value={microbialParams.substrateAffinityKs}
                        onChange={(e) =>
                          setMicrobialParams({ ...microbialParams, substrateAffinityKs: parseFloat(e.target.value) })
                        }
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Equations */}
                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Monod Formulations</span>
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

export default function BiotechWorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Biotechnology Laboratory...</div>}>
      <BiotechWorkbenchContent />
    </Suspense>
  );
}
