/**
 * Prismora Civil & Structural Engineering Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Roorkee, IIT Delhi, IIT Bombay & NITK Surathkal
 * Experiments:
 * 1. Planar Bridge Truss Mechanics (Method of Joints) (CE-202)
 * 2. Beam Bending: Shear Force & Bending Moment Diagrams (SFD / BMD) (CE-205)
 * 3. Euler Column Buckling & Critical Slenderness Ratio (CE-207)
 * 4. Soil Direct Shear Test & Mohr-Coulomb Failure Envelope (CE-301)
 * 5. Open Channel Flow over Notches & Sharp-Crested Weirs (CE-304)
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
  ColumnBucklingEngine,
  DEFAULT_COLUMN_BUCKLING_PARAMS,
  type ColumnBucklingParameters,
  type ColumnEndCondition,
  type ColumnCrossSection,
  DirectShearEngine,
  DEFAULT_DIRECT_SHEAR_PARAMS,
  type DirectShearParameters,
  type SoilType,
  WeirFlowEngine,
  DEFAULT_WEIR_PARAMS,
  type WeirParameters,
  type WeirType,
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
  Waves,
} from 'lucide-react';

type CivilExpId = 'truss-analysis' | 'beam-bending' | 'column-buckling' | 'direct-shear' | 'weir-flow';

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
  {
    id: 'column-buckling',
    title: 'Euler Column Buckling & Critical Slenderness Ratio',
    shortTitle: 'Column Buckling',
    courseCode: 'CE-207 (Structural Stability)',
    benchmark: 'IIT Bombay & IIT Roorkee',
    description: 'Elastic buckling of slender columns, end boundary conditions (pinned-pinned, fixed-fixed, fixed-free), effective length Le = K*L, and Rankine-Gordon transition.',
    color: '#D97706',
    equations: [
      'P_{cr} = \\frac{\\pi^2 E I}{(K L)^2} = \\frac{\\pi^2 E I}{L_e^2}',
      '\\sigma_{cr} = \\frac{\\pi^2 E}{\\lambda^2}, \\quad \\lambda = \\frac{L_e}{r_{min}}',
      '\\frac{1}{P_R} = \\frac{1}{P_c} + \\frac{1}{P_E} \\quad (\\text{Rankine Formula})',
    ],
  },
  {
    id: 'direct-shear',
    title: 'Soil Direct Shear Test & Mohr-Coulomb Failure Envelope',
    shortTitle: 'Soil Direct Shear',
    courseCode: 'CE-301 (Geotechnical Engineering)',
    benchmark: 'IIT Delhi & IIT Roorkee',
    description: 'Laboratory shear box test on cohesionless and cohesive soils, normal stress vs shear stress at failure, friction angle φ, and cohesion c.',
    color: '#B45309',
    equations: [
      '\\tau_f = c + \\sigma_n \\tan\\phi',
      '\\sigma_n = \\frac{N}{A_0}, \\quad \\tau = \\frac{F_{shear}}{A_0}',
    ],
  },
  {
    id: 'weir-flow',
    title: 'Open Channel Flow Discharge over Notches & Sharp-Crested Weirs',
    shortTitle: 'Weir & Notch Flow',
    courseCode: 'CE-304 (Hydraulics & Water Resources)',
    benchmark: 'IIT Kanpur & NITK Surathkal',
    description: 'Rectangular, V-notch (triangular), and trapezoidal (Cipolletti) weir calibrations, head H measurement, and discharge coefficient Cd.',
    color: '#0284C7',
    equations: [
      'Q_{rect} = \\frac{2}{3} C_d b \\sqrt{2g} H^{3/2}',
      'Q_{tri} = \\frac{8}{15} C_d \\tan\\left(\\frac{\\theta}{2}\\right) \\sqrt{2g} H^{5/2}',
    ],
  },
];

function CivilWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as CivilExpId) || 'truss-analysis';
  const [activeExpId, setActiveExpId] = useState<CivilExpId>(
    CIVIL_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'truss-analysis',
  );

  React.useEffect(() => {
    const exp = searchParams.get('exp') as CivilExpId;
    if (exp && CIVIL_EXPERIMENTS.some((e) => e.id === exp)) {
      setActiveExpId(exp);
    }
  }, [searchParams]);

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

  // ==========================================
  // EXP 3: Column Buckling States
  // ==========================================
  const [columnParams, setColumnParams] = useState<ColumnBucklingParameters>(DEFAULT_COLUMN_BUCKLING_PARAMS);
  const columnResult = useMemo(() => ColumnBucklingEngine.compute(columnParams), [columnParams]);

  // ==========================================
  // EXP 4: Soil Direct Shear States
  // ==========================================
  const [soilParams, setSoilParams] = useState<DirectShearParameters>(DEFAULT_DIRECT_SHEAR_PARAMS);
  const soilResult = useMemo(() => DirectShearEngine.compute(soilParams), [soilParams]);

  // ==========================================
  // EXP 5: Weir Flow States
  // ==========================================
  const [weirParams, setWeirParams] = useState<WeirParameters>(DEFAULT_WEIR_PARAMS);
  const weirResult = useMemo(() => WeirFlowEngine.compute(weirParams), [weirParams]);

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
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200 font-bold">
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
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: exp.color }}
                />
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: TRUSS ANALYSIS */}
          {activeExpId === 'truss-analysis' && (
            <motion.div
              key="truss-analysis"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-stone-100 text-stone-800 border border-stone-200">
                      {trussResult.isDeterminate ? 'Statically Determinate' : 'Indeterminate'}
                    </span>
                  </div>

                  {/* SVG Truss Diagram */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 600 240">
                      <rect x="0" y="0" width="600" height="240" fill="#09090B" />
                      {/* Truss Members */}
                      {members.map((m) => {
                        const j1 = joints.find((j) => j.id === m.joint1Id);
                        const j2 = joints.find((j) => j.id === m.joint2Id);
                        if (!j1 || !j2) return null;
                        const scaleX = 400 / trussSpan;
                        const scaleY = 120 / trussHeight;
                        const x1 = 100 + j1.x * scaleX;
                        const y1 = 190 - j1.y * scaleY;
                        const x2 = 100 + j2.x * scaleX;
                        const y2 = 190 - j2.y * scaleY;

                        const force = trussResult.memberForces[m.id] ?? 0;
                        const isTension = force > 0.01;
                        const isCompression = force < -0.01;
                        const strokeColor = isTension ? '#38BDF8' : isCompression ? '#F43F5E' : '#94A3B8';

                        return (
                          <line
                            key={m.id}
                            x1={x1}
                            y1={y1}
                            x2={x2}
                            y2={y2}
                            stroke={strokeColor}
                            strokeWidth={Math.min(5, Math.max(2, Math.abs(force) / 15))}
                            strokeLinecap="round"
                          />
                        );
                      })}

                      {/* Truss Joints */}
                      {joints.map((j) => {
                        const scaleX = 400 / trussSpan;
                        const scaleY = 120 / trussHeight;
                        const cx = 100 + j.x * scaleX;
                        const cy = 190 - j.y * scaleY;
                        return (
                          <circle
                            key={j.id}
                            cx={cx}
                            cy={cy}
                            r="5"
                            fill="#F8FAFC"
                            stroke="#09090B"
                            strokeWidth="2"
                          />
                        );
                      })}

                      {/* Ground Support Icons */}
                      <polygon points="90,195 100,190 110,195" fill="#E2E8F0" />
                      <polygon points="490,195 500,190 510,195" fill="#E2E8F0" />
                      <line x1="80" y1="200" x2="520" y2="200" stroke="#475569" strokeWidth="2" strokeDasharray="6,4" />
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Tension</span>
                      <span className="text-base font-mono font-black text-sky-600">{trussResult.maxTensionKn.toFixed(1)} kN</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Compression</span>
                      <span className="text-base font-mono font-black text-rose-600">{trussResult.maxCompressionKn.toFixed(1)} kN</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Support Reaction R1</span>
                      <span className="text-base font-mono font-black text-zinc-900">{(trussResult.reactions as Record<string, number | undefined>)['J1_Ry']?.toFixed(1) ?? '—'} kN</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Min Safety Factor</span>
                      <span className="text-base font-mono font-black text-emerald-600">{trussResult.minFactorOfSafety.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-stone-600" />
                    <span>Truss Geometry & Loading</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Truss Span (L):</span>
                        <span className="font-bold text-zinc-900">{trussSpan} m</span>
                      </div>
                      <input
                        type="range"
                        min="6"
                        max="24"
                        step="2"
                        value={trussSpan}
                        onChange={(e) => setTrussSpan(parseFloat(e.target.value))}
                        className="w-full accent-stone-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Truss Height (H):</span>
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
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Applied Mid-Span Load:</span>
                        <span className="font-bold text-stone-700">{appliedLoadKn} kN</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={appliedLoadKn}
                        onChange={(e) => setAppliedLoadKn(parseFloat(e.target.value))}
                        className="w-full accent-stone-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-stone-100 border border-stone-200 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-stone-800 uppercase block">Method of Joints</span>
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

          {/* TAB 2: BEAM BENDING SFD & BMD */}
          {activeExpId === 'beam-bending' && (
            <motion.div
              key="beam-bending"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                      {beamParams.supportType.replace('_', ' ')}
                    </span>
                  </div>

                  {/* SFD & BMD Dual Curve */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      {/* Midline */}
                      <line x1="40" y1="100" x2="480" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />

                      {/* Shear Force Diagram (Blue) */}
                      {(() => {
                        const pts = beamResult.shearForceDiagram;
                        const maxV = Math.max(1, Math.abs(beamResult.maxShearForceKn));
                        const toX = (x: number) => 40 + (x / (beamParams.lengthM ?? 6)) * 440;
                        const toY = (v: number) => 100 - (v / maxV) * 80;

                        const path = pts.map((p: { x: number; shearForceKn: number }, i: number) => `${i === 0 ? 'M' : 'L'} ${toX(p.x).toFixed(1)} ${toY(p.shearForceKn).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#38BDF8" strokeWidth="2.5" />;
                      })()}

                      {/* Bending Moment Diagram (Amber) */}
                      {(() => {
                        const pts = beamResult.bendingMomentDiagram;
                        const maxM = Math.max(1, Math.abs(beamResult.maxBendingMomentKnm));
                        const toX = (x: number) => 40 + (x / (beamParams.lengthM ?? 6)) * 440;
                        const toY = (m: number) => 100 - (m / maxM) * 80;

                        const path = pts.map((p: { x: number; bendingMomentKnm: number }, i: number) => `${i === 0 ? 'M' : 'L'} ${toX(p.x).toFixed(1)} ${toY(p.bendingMomentKnm).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,2" />;
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span className="text-sky-400">― Shear Force V(x)</span>
                      <span className="text-amber-400">--- Bending Moment M(x)</span>
                      <span>Span = {beamParams.lengthM}m</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Moment Mmax</span>
                      <span className="text-base font-mono font-black text-amber-600">{beamResult.maxBendingMomentKnm.toFixed(2)} kN·m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Shear Vmax</span>
                      <span className="text-base font-mono font-black text-sky-600">{beamResult.maxShearForceKn.toFixed(2)} kN</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Deflection δ</span>
                      <span className="text-base font-mono font-black text-purple-600">{beamResult.maxDeflectionMm.toFixed(2)} mm</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Bending Stress σ</span>
                      <span className="text-base font-mono font-black text-emerald-600">{beamResult.maxBendingStressMpa.toFixed(1)} MPa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Beam Configuration</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Beam Length (L):</span>
                        <span className="font-bold text-zinc-900">{beamParams.lengthM} m</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="12"
                        step="1"
                        value={beamParams.lengthM}
                        onChange={(e) => setBeamParams({ ...beamParams, lengthM: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Point Load (P):</span>
                        <span className="font-bold text-zinc-900">{beamParams.pointLoads[0]?.magnitudeKn ?? 0} kN</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="80"
                        step="5"
                        value={beamParams.pointLoads[0]?.magnitudeKn ?? 0}
                        onChange={(e) =>
                          setBeamParams({
                            ...beamParams,
                            pointLoads: [{ positionM: beamParams.lengthM / 2, magnitudeKn: parseFloat(e.target.value) }],
                          })
                        }
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">UDL (w):</span>
                        <span className="font-bold text-zinc-900">{beamParams.distributedLoads[0]?.intensityKnPerM ?? 0} kN/m</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="30"
                        step="2"
                        value={beamParams.distributedLoads[0]?.intensityKnPerM ?? 0}
                        onChange={(e) =>
                          setBeamParams({
                            ...beamParams,
                            distributedLoads: [
                              { startM: 0, endM: beamParams.lengthM, intensityKnPerM: parseFloat(e.target.value) },
                            ],
                          })
                        }
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Support Type:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['simply_supported', 'cantilever'] as BeamSupportType[]).map((sup) => (
                          <button
                            key={sup}
                            onClick={() => setBeamParams({ ...beamParams, supportType: sup })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border text-left ${
                              beamParams.supportType === sup
                                ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {sup.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-blue-800 uppercase block">Solid Mechanics</span>
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

          {/* TAB 3: COLUMN BUCKLING */}
          {activeExpId === 'column-buckling' && (
            <motion.div
              key="column-buckling"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200 uppercase">
                      Failure: {columnResult.failureMode}
                    </span>
                  </div>

                  {/* SVG Buckled Mode Shape */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 240">
                      <rect x="0" y="0" width="500" height="240" fill="#09090B" />
                      {/* Top Plate & Load P */}
                      <line x1="250" y1="20" x2="250" y2="50" stroke="#F59E0B" strokeWidth="4" />
                      <polygon points="250,55 243,43 257,43" fill="#F59E0B" />
                      <text x="265" y="38" fill="#F59E0B" fontSize="12" fontWeight="bold" fontFamily="monospace">
                        Pcr = {columnResult.criticalLoadKn.toFixed(1)} kN
                      </text>

                      {/* Straight Column Reference (dashed) */}
                      <line x1="250" y1="50" x2="250" y2="210" stroke="#334155" strokeWidth="2" strokeDasharray="4,4" />

                      {/* Buckled Deflection Curve */}
                      {(() => {
                        const pts = columnResult.buckledShapePoints;
                        const toY = (normY: number) => 50 + normY * 160;
                        const toX = (normDef: number) => 250 + normDef * 70;
                        const path = pts.map((p: { normalizedDeflection: number; yNormalized: number }, i: number) => `${i === 0 ? 'M' : 'L'} ${toX(p.normalizedDeflection).toFixed(1)} ${toY(p.yNormalized).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#F59E0B" strokeWidth="4" strokeLinecap="round" />;
                      })()}

                      {/* Base Support */}
                      <line x1="210" y1="210" x2="290" y2="210" stroke="#94A3B8" strokeWidth="4" />
                      <text x="250" y="230" textAnchor="middle" fill="#94A3B8" fontSize="10" fontFamily="monospace">
                        Effective Length Le = {columnResult.effectiveLengthM.toFixed(2)} m (K = {columnResult.effectiveLengthFactorK})
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Critical Load Pcr</span>
                      <span className="text-base font-mono font-black text-amber-600">{columnResult.criticalLoadKn.toFixed(1)} kN</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Slenderness λ</span>
                      <span className="text-base font-mono font-black text-zinc-900">{columnResult.slendernessRatio.toFixed(1)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Euler Stress σcr</span>
                      <span className="text-base font-mono font-black text-blue-600">{columnResult.criticalStressMpa.toFixed(1)} MPa</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Rankine Load PR</span>
                      <span className="text-base font-mono font-black text-emerald-600">{columnResult.rankineLoadKn.toFixed(1)} kN</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>Column Parameters</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Column Length (L):</span>
                        <span className="font-bold text-zinc-900">{columnParams.columnLengthM} m</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="8.0"
                        step="0.2"
                        value={columnParams.columnLengthM}
                        onChange={(e) => setColumnParams({ ...columnParams, columnLengthM: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Cross-Section Width:</span>
                        <span className="font-bold text-zinc-900">{columnParams.crossSectionDimension1Mm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="30"
                        max="150"
                        step="5"
                        value={columnParams.crossSectionDimension1Mm}
                        onChange={(e) =>
                          setColumnParams({
                            ...columnParams,
                            crossSectionDimension1Mm: parseFloat(e.target.value),
                            crossSectionDimension2Mm: parseFloat(e.target.value),
                          })
                        }
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">End Fixity Condition:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['pinned_pinned', 'fixed_fixed', 'fixed_free', 'fixed_pinned'] as ColumnEndCondition[]).map((cond) => (
                          <button
                            key={cond}
                            onClick={() => setColumnParams({ ...columnParams, endCondition: cond })}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-semibold border text-left ${
                              columnParams.endCondition === cond
                                ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {cond.replace('_', '-')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Stability Equations</span>
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

          {/* TAB 4: SOIL DIRECT SHEAR TEST */}
          {activeExpId === 'direct-shear' && (
            <motion.div
              key="direct-shear"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                      φ = {soilResult.frictionAngleDeg.toFixed(1)}°, c = {soilResult.cohesionKpa.toFixed(1)} kPa
                    </span>
                  </div>

                  {/* Mohr-Coulomb Failure Envelope Graph */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#3F3F46" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#3F3F46" strokeWidth="1.5" />

                      {/* Mohr-Coulomb Line: τ = c + σ tan(φ) */}
                      {(() => {
                        const maxSigma = 350;
                        const maxTau = 250;
                        const toX = (s: number) => 40 + (s / maxSigma) * 440;
                        const toY = (t: number) => 170 - (t / maxTau) * 150;

                        const tau0 = soilResult.cohesionKpa;
                        const tauMax = soilResult.cohesionKpa + maxSigma * Math.tan((soilResult.frictionAngleDeg * Math.PI) / 180);

                        return (
                          <>
                            <line x1={toX(0)} y1={toY(tau0)} x2={toX(maxSigma)} y2={toY(tauMax)} stroke="#F59E0B" strokeWidth="3" />
                            {/* Plotted Test Points */}
                            {soilResult.mohrCoulombPoints.map((pt, i) => (
                              <circle key={i} cx={toX(pt.normalStressKpa)} cy={toY(pt.peakShearStressKpa)} r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
                            ))}
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Normal Stress σn (kPa)</span>
                      <span className="text-amber-400">Mohr-Coulomb Failure Envelope: τ = c + σ tan(φ)</span>
                      <span>Shear Stress τ (kPa)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Friction Angle φ</span>
                      <span className="text-base font-mono font-black text-amber-600">{soilResult.frictionAngleDeg.toFixed(1)}°</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Cohesion c</span>
                      <span className="text-base font-mono font-black text-zinc-900">{soilResult.cohesionKpa.toFixed(1)} kPa</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">R² Linearity</span>
                      <span className="text-base font-mono font-black text-blue-600">{soilResult.regressionRSquared.toFixed(3)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Peak Shear Force</span>
                      <span className="text-base font-mono font-black text-emerald-600">{soilResult.mohrCoulombPoints[0]?.peakShearStressKpa.toFixed(1)} kPa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-amber-700" />
                    <span>Soil Specimen & Box</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Soil Type:</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {(['dense_sand', 'loose_sand', 'silty_clay', 'stiff_clay'] as SoilType[]).map((st) => (
                          <button
                            key={st}
                            onClick={() => setSoilParams({ ...soilParams, soilType: st })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border text-left ${
                              soilParams.soilType === st
                                ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {st.replace('_', ' ').toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Displacement Rate:</span>
                        <span className="font-bold text-zinc-900">{soilParams.shearingRateMmPerMin} mm/min</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.1"
                        value={soilParams.shearingRateMmPerMin}
                        onChange={(e) => setSoilParams({ ...soilParams, shearingRateMmPerMin: parseFloat(e.target.value) })}
                        className="w-full accent-amber-700 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Mohr-Coulomb Criterion</span>
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

          {/* TAB 5: FLOW OVER NOTCHES & WEIRS */}
          {activeExpId === 'weir-flow' && (
            <motion.div
              key="weir-flow"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200 capitalize">
                      {weirParams.weirType.replace('_', ' ')} Notch
                    </span>
                  </div>

                  {/* SVG Notch Flow Visualizer */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 240">
                      <rect x="0" y="0" width="500" height="240" fill="#09090B" />
                      {/* Water Channel Flume */}
                      <rect x="50" y="60" width="400" height="130" fill="#0284C7" fillOpacity="0.25" stroke="#0284C7" strokeWidth="2" />
                      {/* Weir Plate Wall */}
                      <rect x="250" y="60" width="20" height="130" fill="#475569" stroke="#94A3B8" strokeWidth="2" />

                      {/* Notch Cutout */}
                      {weirParams.weirType === 'v_notch' ? (
                        <polygon points="250,60 270,60 260,110" fill="#0284C7" />
                      ) : (
                        <rect x="250" y="60" width="20" height="50" fill="#0284C7" />
                      )}

                      {/* Flowing Water Nappe */}
                      <path d="M 270 100 Q 340 105 380 180" fill="none" stroke="#38BDF8" strokeWidth="5" />
                      <line x1="100" y1="60" x2="100" y2="100" stroke="#F59E0B" strokeWidth="2.5" />
                      <polygon points="100,55 95,65 105,65" fill="#F59E0B" />
                      <polygon points="100,105 95,95 105,95" fill="#F59E0B" />
                      <text x="110" y="85" fill="#F59E0B" fontSize="11" fontFamily="monospace">
                        Head H = {(weirParams.headOverCrestM * 100).toFixed(1)} cm
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Actual Flow Qact</span>
                      <span className="text-base font-mono font-black text-sky-600">{weirResult.actualDischargeLps.toFixed(2)} L/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Theoretical Q</span>
                      <span className="text-base font-mono font-black text-zinc-900">{weirResult.theoreticalDischargeLps.toFixed(2)} L/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Coeff of Discharge Cd</span>
                      <span className="text-base font-mono font-black text-blue-600">{weirResult.dischargeCoefficientCd.toFixed(3)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Nappe Velocity</span>
                      <span className="text-base font-mono font-black text-emerald-600">{weirResult.crestVelocityMps.toFixed(2)} m/s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-sky-600" />
                    <span>Hydraulic Parameters</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Head Over Crest (H):</span>
                        <span className="font-bold text-sky-600">{(weirParams.headOverCrestM * 100).toFixed(1)} cm</span>
                      </div>
                      <input
                        type="range"
                        min="0.02"
                        max="0.30"
                        step="0.01"
                        value={weirParams.headOverCrestM}
                        onChange={(e) => setWeirParams({ ...weirParams, headOverCrestM: parseFloat(e.target.value) })}
                        className="w-full accent-sky-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Weir Notch Geometry:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['rectangular', 'v_notch', 'trapezoidal'] as WeirType[]).map((wt) => (
                          <button
                            key={wt}
                            onClick={() => setWeirParams({ ...weirParams, weirType: wt })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border text-left ${
                              weirParams.weirType === wt
                                ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {wt.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-sky-800 uppercase block">Hydraulic Formula</span>
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
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Civil Engineering Laboratory...</div>}>
      <CivilWorkbenchContent />
    </Suspense>
  );
}
