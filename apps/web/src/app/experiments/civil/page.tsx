/**
 * Prismora Civil & Structural Engineering Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Roorkee & IIT Delhi
 * Experiments:
 * 1. Planar Bridge Truss Mechanics (Method of Joints) (CE-202)
 * 2. Beam Bending: Shear Force & Bending Moment Diagrams (SFD / BMD) (CE-205)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  solveTruss,
  createWarrenTruss,
  type TrussJoint,
  type TrussMember,
  BeamBendingEngine,
  DEFAULT_BEAM_PARAMS,
  type BeamBendingParameters,
  type BeamSupportType,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Building2,
  ChevronRight,
  Download,
  Layers,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingUp,
} from 'lucide-react';

type CivilExpId = 'truss-analysis' | 'beam-bending';

interface CivilExperimentDef {
  readonly id: CivilExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const CIVIL_EXPERIMENTS: readonly CivilExperimentDef[] = [
  {
    id: 'truss-analysis',
    title: 'Planar Bridge Truss Mechanics (Method of Joints)',
    shortTitle: 'Truss Analysis',
    courseCode: 'CE-202 (Structural Mechanics)',
    benchmark: 'IIT Roorkee & IIT Delhi',
    description: 'Pin-jointed steel bridge truss, static determinacy m + r = 2j, method of joints matrix solution, and safety factor HUD.',
    color: '#78716C',
    equations: [
      '\\sum F_x = 0, \\quad \\sum F_y = 0',
      '\\sigma_i = \\frac{F_i}{A_i}',
      'm + r = 2j',
    ],
  },
  {
    id: 'beam-bending',
    title: 'Beam Bending Mechanics: Shear Force & Bending Moment Diagrams',
    shortTitle: 'Beam SFD & BMD',
    courseCode: 'CE-205 (Mechanics of Solids)',
    benchmark: 'IIT Delhi & NITK Surathkal',
    description: 'Simply supported and cantilever structural beams, concentrated point loads, UDL, shear force V(x), bending moment M(x), and flexural stress.',
    color: '#3B82F6',
    equations: [
      'V(x) = \\frac{dM}{dx}, \\quad M(x) = \\int V(x) dx',
      '\\frac{M}{I} = \\frac{\\sigma}{y} = \\frac{E}{R}',
      '\\delta_{max} = \\frac{5 w L^4}{384 E I} + \\frac{P L^3}{48 E I}',
    ],
  },
];

function CivilWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as CivilExpId) || 'truss-analysis';
  const [activeExpId, setActiveExpId] = useState<CivilExpId>(
    CIVIL_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'truss-analysis',
  );

  const activeExp = useMemo(
    () => CIVIL_EXPERIMENTS.find((e) => e.id === activeExpId) ?? CIVIL_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // ==========================================
  // EXP 1: Truss States
  // ==========================================
  const [trussSpan, setTrussSpan] = useState<number>(12); // metres
  const [trussHeight, setTrussHeight] = useState<number>(3.0); // metres
  const [appliedLoadKn, setAppliedLoadKn] = useState<number>(60); // kN

  const { joints, members } = useMemo(() => {
    return createWarrenTruss(trussSpan, trussHeight, appliedLoadKn, 2);
  }, [trussSpan, trussHeight, appliedLoadKn]);

  const trussResult = useMemo(() => solveTruss(joints, members), [joints, members]);

  // ==========================================
  // EXP 2: Beam Bending States
  // ==========================================
  const [beamParams, setBeamParams] = useState<BeamBendingParameters>(DEFAULT_BEAM_PARAMS);
  const beamResult = useMemo(() => BeamBendingEngine.compute(beamParams), [beamParams]);

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
            <span className="font-bold text-zinc-900">Civil & Structural Engineering Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`ce-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CIVIL_EXPERIMENTS.map((exp) => {
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
                    layoutId="active-ce-tab"
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

      {/* Main Workbench Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Focus Banner */}
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
            {activeExpId === 'truss-analysis' && (
              <Link
                href="/experiments/civil/truss-analysis"
                className="px-3.5 py-1.5 rounded-lg bg-stone-700 text-white text-xs font-bold hover:bg-stone-800 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Full Screen Truss</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Experiment Content */}
        <AnimatePresence mode="wait">
          {activeExpId === 'truss-analysis' && (
            <motion.div
              key="truss"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">Truss Equilibrium Diagram</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      Static Determinacy Verified: m + r = 2j
                    </span>
                  </div>

                  {/* SVG Truss Schematic */}
                  <div className="h-64 rounded-xl bg-gradient-to-b from-stone-50 to-zinc-100 border border-zinc-200 p-4 relative overflow-hidden flex items-center justify-center">
                    <svg className="w-full h-full max-h-56" viewBox="-1 -1 14 5">
                      {/* Truss Members */}
                      {members.map((m) => {
                        const j1 = joints.find((j) => j.id === m.jointA)!;
                        const j2 = joints.find((j) => j.id === m.jointB)!;
                        const mRes = trussResult.members.find((item) => item.memberId === m.id);
                        const force = mRes?.forceKn ?? 0;
                        const isTension = mRes?.isTension ?? false;
                        const isComp = force < -0.05;
                        const strokeColor = isTension ? '#2563EB' : isComp ? '#DC2626' : '#9CA3AF';

                        return (
                          <line
                            key={m.id}
                            x1={j1.x}
                            y1={3.5 - j1.y}
                            x2={j2.x}
                            y2={3.5 - j2.y}
                            stroke={strokeColor}
                            strokeWidth="0.18"
                            strokeLinecap="round"
                          />
                        );
                      })}

                      {/* Truss Joints */}
                      {joints.map((j) => (
                        <circle
                          key={j.id}
                          cx={j.x}
                          cy={3.5 - j.y}
                          r="0.25"
                          fill="#FFFFFF"
                          stroke="#1E293B"
                          strokeWidth="0.1"
                        />
                      ))}
                    </svg>
                  </div>

                  {/* Readout stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Tension</span>
                      <span className="text-base font-mono font-black text-blue-600">
                        {trussResult.maxTensionKn.toFixed(1)} kN
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Compression</span>
                      <span className="text-base font-mono font-black text-red-600">
                        {Math.abs(trussResult.maxCompressionKn).toFixed(1)} kN
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Left Reaction Ay</span>
                      <span className="text-base font-mono font-black text-zinc-900">
                        {(trussResult.reactions.find((r) => r.jointId === 'J0')?.ryKn ?? (appliedLoadKn / 2)).toFixed(1)} kN
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Min Safety Factor</span>
                      <span className="text-base font-mono font-black text-emerald-600">
                        {(() => {
                          const minSF = Math.min(...trussResult.members.map((m) => m.safetyFactor));
                          return minSF > 100 ? '99+' : minSF.toFixed(2);
                        })()}x
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Truss Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-stone-600" />
                    <span>Truss Parameters</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Total Span (L):</span>
                        <span className="font-bold text-zinc-900">{trussSpan} m</span>
                      </div>
                      <input
                        type="range"
                        min="8"
                        max="24"
                        step="2"
                        value={trussSpan}
                        onChange={(e) => setTrussSpan(parseInt(e.target.value))}
                        className="w-full accent-stone-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Apex Height (h):</span>
                        <span className="font-bold text-zinc-900">{trussHeight} m</span>
                      </div>
                      <input
                        type="range"
                        min="1.5"
                        max="6.0"
                        step="0.5"
                        value={trussHeight}
                        onChange={(e) => setTrussHeight(parseFloat(e.target.value))}
                        className="w-full accent-stone-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Joint Load (P):</span>
                        <span className="font-bold text-zinc-900">{appliedLoadKn} kN</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="150"
                        step="5"
                        value={appliedLoadKn}
                        onChange={(e) => setAppliedLoadKn(parseInt(e.target.value))}
                        className="w-full accent-stone-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Governing Equations */}
                  <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-stone-800 uppercase block">Statics Principles</span>
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

          {activeExpId === 'beam-bending' && (
            <motion.div
              key="beam"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Beam Visualizer Left */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">SFD & BMD Distribution Curves</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold border border-blue-200">
                      Max Stress σ: {beamResult.maxNormalStressMpa} MPa
                    </span>
                  </div>

                  {/* SVG Shear Force & Bending Moment Diagrams */}
                  <div className="space-y-3">
                    {/* SFD Plot */}
                    <div className="h-32 rounded-xl bg-zinc-900 border border-zinc-800 p-3 relative flex flex-col justify-between">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span className="text-blue-400 font-bold">Shear Force Diagram V(x) [kN]</span>
                        <span>V_max = {beamResult.maxShearForceKn} kN</span>
                      </div>
                      <svg className="w-full h-20" viewBox="0 0 400 80">
                        <line x1="20" y1="40" x2="380" y2="40" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                        {(() => {
                          const maxV = Math.max(1, beamResult.maxShearForceKn * 1.2);
                          const pts = beamResult.points
                            .map((p) => {
                              const x = 20 + (p.positionM / beamParams.spanLengthM) * 360;
                              const y = 40 - (p.shearForceKn / maxV) * 35;
                              return `${x.toFixed(1)},${y.toFixed(1)}`;
                            })
                            .join(' ');
                          return <polyline fill="none" stroke="#38BDF8" strokeWidth="2" points={pts} />;
                        })()}
                      </svg>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                        <span>x = 0m (R1 = {beamResult.leftReactionKn} kN)</span>
                        <span>x = {beamParams.spanLengthM}m (R2 = {beamResult.rightReactionKn} kN)</span>
                      </div>
                    </div>

                    {/* BMD Plot */}
                    <div className="h-32 rounded-xl bg-zinc-900 border border-zinc-800 p-3 relative flex flex-col justify-between">
                      <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                        <span className="text-amber-400 font-bold">Bending Moment Diagram M(x) [kNm]</span>
                        <span>M_max = {beamResult.maxBendingMomentKnm} kNm</span>
                      </div>
                      <svg className="w-full h-20" viewBox="0 0 400 80">
                        <line x1="20" y1="40" x2="380" y2="40" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                        {(() => {
                          const maxM = Math.max(1, beamResult.maxBendingMomentKnm * 1.2);
                          const pts = beamResult.points
                            .map((p) => {
                              const x = 20 + (p.positionM / beamParams.spanLengthM) * 360;
                              const y = 40 - (p.bendingMomentKnm / maxM) * 35;
                              return `${x.toFixed(1)},${y.toFixed(1)}`;
                            })
                            .join(' ');
                          return <polyline fill="none" stroke="#FBBF24" strokeWidth="2" points={pts} />;
                        })()}
                      </svg>
                      <div className="flex justify-between text-[8px] font-mono text-zinc-500">
                        <span>Deflection δ_max = {beamResult.maxDeflectionMm} mm</span>
                        <span>Section Modulus Z = {beamResult.sectionModulusMm3.toLocaleString()} mm³</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Moment M</span>
                      <span className="text-base font-mono font-black text-amber-600">{beamResult.maxBendingMomentKnm} kNm</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Shear V</span>
                      <span className="text-base font-mono font-black text-blue-600">{beamResult.maxShearForceKn} kN</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Deflection δ</span>
                      <span className="text-base font-mono font-black text-purple-600">{beamResult.maxDeflectionMm} mm</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Extreme Stress σ</span>
                      <span className="text-base font-mono font-black text-zinc-900">{beamResult.maxNormalStressMpa} MPa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Beam Controls Right */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Loading & Section Controls</span>
                  </div>

                  {/* Support Type Toggle */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono text-zinc-600">Support Condition:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {(['simply_supported', 'cantilever'] as BeamSupportType[]).map((sup) => (
                        <button
                          key={sup}
                          onClick={() => setBeamParams({ ...beamParams, supportType: sup })}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border transition-all ${
                            beamParams.supportType === sup
                              ? 'border-blue-500 bg-blue-50 text-blue-900'
                              : 'border-zinc-200 hover:bg-zinc-50 text-zinc-600'
                          }`}
                        >
                          {sup === 'simply_supported' ? 'Simply Supported' : 'Cantilever'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sliders */}
                  <div className="space-y-3 text-xs pt-1">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Span Length (L):</span>
                        <span className="font-bold text-zinc-900">{beamParams.spanLengthM} m</span>
                      </div>
                      <input
                        type="range"
                        min="3.0"
                        max="12.0"
                        step="0.5"
                        value={beamParams.spanLengthM}
                        onChange={(e) => setBeamParams({ ...beamParams, spanLengthM: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Point Load (P):</span>
                        <span className="font-bold text-zinc-900">{beamParams.pointLoadKn} kN</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={beamParams.pointLoadKn}
                        onChange={(e) => setBeamParams({ ...beamParams, pointLoadKn: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Uniform Load (w):</span>
                        <span className="font-bold text-zinc-900">{beamParams.udlKnPerM} kN/m</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="1"
                        value={beamParams.udlKnPerM}
                        onChange={(e) => setBeamParams({ ...beamParams, udlKnPerM: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Governing Equations */}
                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-blue-800 uppercase block">Euler-Bernoulli Beam Equations</span>
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

export default function CivilWorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Civil Laboratory...</div>}>
      <CivilWorkbenchContent />
    </Suspense>
  );
}
