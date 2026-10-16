/**
 * Prismora Mechanical Engineering Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Roorkee, IIT Bombay, IIT Madras & NITK Surathkal
 * Experiments:
 * 1. Forced Harmonic Oscillator & Mechanical Resonance (Machine Dynamics)
 * 2. Bernoulli's Theorem & Venturimeter Flow Measurement (Fluid Mechanics)
 * 3. UTM Tensile Test & Stress-Strain Curve (Mechanics of Materials)
 * 4. Darcy-Weisbach Pipe Friction & Minor Flow Losses (Fluid Mechanics)
 * 5. Torsion Testing of Circular Shaft & Shear Modulus (Mechanics of Solids)
 * 6. Four-Bar Planar Mechanism Kinematics (Kinematics & Theory of Machines)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  VenturiFlowEngine,
  DEFAULT_VENTURI_PARAMS,
  type VenturiParameters,
  TensileTestEngine,
  type SpecimenMaterial,
  MATERIAL_PROPERTIES,
  PipeFrictionEngine,
  DEFAULT_PIPE_FRICTION_PARAMS,
  type PipeFrictionParameters,
  type PipeMaterialType,
  TorsionTestEngine,
  DEFAULT_TORSION_PARAMS,
  type TorsionParameters,
  type ShaftMaterialType,
  FourBarLinkageEngine,
  DEFAULT_FOUR_BAR_PARAMS,
  type FourBarParameters,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Download,
  Gauge,
  Layers,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Waves,
  Zap,
} from 'lucide-react';

type MechanicalExpId =
  | 'harmonic-oscillator'
  | 'venturi-flow'
  | 'tensile-test'
  | 'pipe-friction'
  | 'torsion-test'
  | 'four-bar';

interface MechanicalExperimentDef {
  readonly id: MechanicalExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const MECHANICAL_EXPERIMENTS: readonly MechanicalExperimentDef[] = [
  {
    id: 'harmonic-oscillator',
    title: 'Damped Harmonic Oscillator & Mechanical Resonance',
    shortTitle: 'Harmonic Oscillator',
    courseCode: 'ME-201 (Dynamics of Machines)',
    benchmark: 'IIT Roorkee & NITK Surathkal',
    description: 'Mass-spring-damper oscillator with viscous damping, harmonic excitation, and phase-space state trajectories.',
    color: '#F59E0B',
    equations: [
      'm \\ddot{x} + c \\dot{x} + k x = F_0 \\cos(\\omega t)',
      '\\omega_n = \\sqrt{\\frac{k}{m}}, \\quad \\zeta = \\frac{c}{2\\sqrt{km}}',
      'M(\\omega) = \\frac{1}{\\sqrt{(1 - (\\omega/\\omega_n)^2)^2 + (2\\zeta \\omega/\\omega_n)^2}}',
    ],
  },
  {
    id: 'venturi-flow',
    title: "Bernoulli's Theorem & Venturimeter Flow Measurement",
    shortTitle: 'Venturimeter Flow',
    courseCode: 'ME-204 (Fluid Mechanics)',
    benchmark: 'IIT Kanpur & NITK Surathkal',
    description: 'Converging-diverging pipe, piezometric manometer pressure heads, continuity equation, and discharge coefficient Cd.',
    color: '#06B6D4',
    equations: [
      'P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2',
      'Q_{theo} = \\frac{A_1 A_2}{\\sqrt{A_1^2 - A_2^2}} \\sqrt{2g \\Delta h}',
      'Q_{act} = C_d \\times Q_{theo}',
    ],
  },
  {
    id: 'tensile-test',
    title: 'Universal Testing Machine (UTM) Tensile Test & Stress-Strain Curve',
    shortTitle: 'UTM Tensile Test',
    courseCode: 'ME-206 (Mechanics of Materials)',
    benchmark: 'IIT Bombay & IIT Delhi',
    description: 'Uniaxial tensile loading of standard dogbone specimens (Mild Steel, Aluminium, Brass), elastic limit, yield stress, and UTS.',
    color: '#EF4444',
    equations: [
      '\\sigma = \\frac{P}{A_0}, \\quad \\epsilon = \\frac{\\Delta L}{L_0}',
      'E = \\frac{\\sigma}{\\epsilon} \\quad (\\text{Hooke\'s Law})',
      '\\text{UTS} = \\frac{P_{max}}{A_0}, \\quad \\% \\text{Elongation} = \\frac{L_f - L_0}{L_0} \\times 100',
    ],
  },
  {
    id: 'pipe-friction',
    title: 'Darcy-Weisbach Major & Minor Pipe Friction Losses',
    shortTitle: 'Pipe Friction & Losses',
    courseCode: 'ME-204 (Fluid Mechanics)',
    benchmark: 'IIT Roorkee & IIT Madras',
    description: 'Frictional head loss in commercial pipes, Reynolds number regimes, Swamee-Jain / Colebrook friction factor, and differential manometer deflection.',
    color: '#3B82F6',
    equations: [
      'h_f = f \\frac{L}{D} \\frac{v^2}{2g}',
      'Re = \\frac{\\rho v D}{\\mu}',
      'f = \\frac{0.25}{\\left[\\log_{10}\\left(\\frac{\\epsilon}{3.7D} + \\frac{5.74}{Re^{0.9}}\\right)\\right]^2}',
    ],
  },
  {
    id: 'torsion-test',
    title: 'Torsion Testing of Circular Shaft & Shear Modulus (G)',
    shortTitle: 'Torsion Test',
    courseCode: 'ME-206 (Mechanics of Solids)',
    benchmark: 'IIT Delhi & COEP Pune',
    description: 'Pure elastic torsion, torque vs angle of twist, polar moment of inertia J, maximum surface shear stress, and torsional stiffness.',
    color: '#8B5CF6',
    equations: [
      '\\frac{T}{J} = \\frac{\\tau}{r} = \\frac{G \\theta}{L}',
      'J = \\frac{\\pi D^4}{32} \\quad (\\text{Solid Shaft})',
      '\\tau_{max} = \\frac{T \\cdot D}{2J}, \\quad G = \\frac{T L}{J \\theta}',
    ],
  },
  {
    id: 'four-bar',
    title: 'Four-Bar Planar Mechanism Kinematics (Grashof Criterion)',
    shortTitle: 'Four-Bar Linkage',
    courseCode: 'ME-301 (Theory of Machines)',
    benchmark: 'IIT Kharagpur & NITK Surathkal',
    description: 'Grashof mobility criterion (s + l <= p + q), Freudenstein kinematic loop-closure equation, transmission angle, and coupler curve tracing.',
    color: '#10B981',
    equations: [
      's + l \\le p + q \\quad (\\text{Grashof Criterion})',
      'K_1 \\cos\\theta_4 - K_2 \\cos\\theta_2 + K_3 = \\cos(\\theta_2 - \\theta_4)',
      '\\mu = \\arccos\\left(\\frac{b^2 + c^2 - (d - a\\cos\\theta_2)^2 - (a\\sin\\theta_2)^2}{2bc}\\right)',
    ],
  },
];

function MechanicalWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as MechanicalExpId) || 'harmonic-oscillator';
  const [activeExpId, setActiveExpId] = useState<MechanicalExpId>(
    MECHANICAL_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'harmonic-oscillator',
  );

  const activeExp = useMemo(
    () => MECHANICAL_EXPERIMENTS.find((e) => e.id === activeExpId) ?? MECHANICAL_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // ==========================================
  // EXP 1: Harmonic Oscillator States
  // ==========================================
  const [mass, setMass] = useState<number>(2.0); // kg
  const [stiffness, setStiffness] = useState<number>(50.0); // N/m
  const [damping, setDamping] = useState<number>(2.5); // N*s/m
  const [drivingFreq, setDrivingFreq] = useState<number>(5.0); // rad/s
  const [drivingForce, setDrivingForce] = useState<number>(10.0); // N

  const wn = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const r = drivingFreq / wn;
  const magnification = 1 / Math.sqrt(Math.pow(1 - r * r, 2) + Math.pow(2 * zeta * r, 2));
  const steadyAmplitude = (drivingForce / stiffness) * magnification;

  // ==========================================
  // EXP 2: Venturi Flow States
  // ==========================================
  const [venturiParams, setVenturiParams] = useState<VenturiParameters>(DEFAULT_VENTURI_PARAMS);
  const venturiResult = useMemo(() => VenturiFlowEngine.compute(venturiParams), [venturiParams]);

  // ==========================================
  // EXP 3: Tensile Test States
  // ==========================================
  const [selectedMaterial, setSelectedMaterial] = useState<SpecimenMaterial>('mild_steel');
  const [elongationMm, setElongationMm] = useState<number>(2.5);
  const tensileResult = useMemo(
    () =>
      TensileTestEngine.compute({
        material: selectedMaterial,
        gaugeLengthMm: 50,
        diameterMm: 12.5,
        elongationMm,
      }),
    [selectedMaterial, elongationMm],
  );

  // ==========================================
  // EXP 4: Pipe Friction States
  // ==========================================
  const [pipeParams, setPipeParams] = useState<PipeFrictionParameters>(DEFAULT_PIPE_FRICTION_PARAMS);
  const pipeResult = useMemo(() => PipeFrictionEngine.compute(pipeParams), [pipeParams]);

  // ==========================================
  // EXP 5: Torsion Test States
  // ==========================================
  const [torsionParams, setTorsionParams] = useState<TorsionParameters>(DEFAULT_TORSION_PARAMS);
  const torsionResult = useMemo(() => TorsionTestEngine.compute(torsionParams), [torsionParams]);

  // ==========================================
  // EXP 6: Four-Bar Linkage States
  // ==========================================
  const [fourBarParams, setFourBarParams] = useState<FourBarParameters>(DEFAULT_FOUR_BAR_PARAMS);
  const fourBarResult = useMemo(() => FourBarLinkageEngine.compute(fourBarParams), [fourBarParams]);

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
            <span className="font-bold text-zinc-900">Mechanical Engineering Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`me-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {MECHANICAL_EXPERIMENTS.map((exp) => {
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
                    layoutId="active-me-tab"
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
          {/* TAB 1: HARMONIC OSCILLATOR */}
          {activeExpId === 'harmonic-oscillator' && (
            <motion.div
              key="harmonic-oscillator"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Display (SVG Animation) */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      {zeta < 1 ? `Underdamped (ζ = ${zeta.toFixed(2)})` : `Overdamped (ζ = ${zeta.toFixed(2)})`}
                    </span>
                  </div>

                  {/* Visualizer Canvas */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative flex items-center justify-center p-4">
                    <svg className="w-full h-full" viewBox="0 0 600 240">
                      <rect x="0" y="0" width="600" height="240" fill="#09090B" />
                      <line x1="40" y1="20" x2="40" y2="220" stroke="#52525B" strokeWidth="4" />
                      <line x1="40" y1="200" x2="560" y2="200" stroke="#27272A" strokeWidth="2" />

                      {/* Spring Coils */}
                      <path
                        d="M 40 120 L 70 120 L 85 90 L 115 150 L 145 90 L 175 150 L 205 90 L 235 150 L 250 120 L 280 120"
                        fill="none"
                        stroke="#F59E0B"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Mass Block */}
                      <rect x="280" y="80" width="100" height="80" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2" />
                      <text x="330" y="125" textAnchor="middle" fill="#09090B" fontSize="13" fontWeight="bold" fontFamily="monospace">
                        m = {mass} kg
                      </text>

                      {/* Damper Dashpot */}
                      <rect x="280" y="170" width="70" height="20" rx="3" fill="#3F3F46" />
                      <line x1="40" y1="180" x2="280" y2="180" stroke="#71717A" strokeWidth="3" />
                      <text x="140" y="175" fill="#A1A1AA" fontSize="10" fontFamily="monospace">c = {damping} N·s/m</text>

                      {/* Excitation Force Vector Arrow */}
                      <line x1="380" y1="120" x2="470" y2="120" stroke="#EF4444" strokeWidth="3" />
                      <polygon points="475,120 465,115 465,125" fill="#EF4444" />
                      <text x="425" y="110" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">
                        F(t) = {drivingForce} N
                      </text>
                    </svg>
                  </div>

                  {/* Readouts Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Natural Freq ωn</span>
                      <span className="text-base font-mono font-black text-zinc-900">{wn.toFixed(2)} rad/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Damping Ratio ζ</span>
                      <span className="text-base font-mono font-black text-amber-600">{zeta.toFixed(3)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Magnification M</span>
                      <span className="text-base font-mono font-black text-blue-600">{magnification.toFixed(2)}x</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Steady Amplitude X</span>
                      <span className="text-base font-mono font-black text-emerald-600">{(steadyAmplitude * 100).toFixed(1)} cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>Oscillator Parameters</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Mass (m):</span>
                        <span className="font-bold text-zinc-900">{mass} kg</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="10.0"
                        step="0.5"
                        value={mass}
                        onChange={(e) => setMass(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Spring Stiffness (k):</span>
                        <span className="font-bold text-zinc-900">{stiffness} N/m</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="5"
                        value={stiffness}
                        onChange={(e) => setStiffness(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Damping (c):</span>
                        <span className="font-bold text-zinc-900">{damping} N·s/m</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="15.0"
                        step="0.2"
                        value={damping}
                        onChange={(e) => setDamping(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Driving Freq (ω):</span>
                        <span className="font-bold text-zinc-900">{drivingFreq} rad/s</span>
                      </div>
                      <input
                        type="range"
                        min="1.0"
                        max="15.0"
                        step="0.2"
                        value={drivingFreq}
                        onChange={(e) => setDrivingFreq(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Governing Equations Card */}
                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Governing Physics</span>
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

          {/* TAB 2: VENTURI FLOW */}
          {activeExpId === 'venturi-flow' && (
            <motion.div
              key="venturi-flow"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                      Cd = {venturiParams.dischargeCoeffCd}
                    </span>
                  </div>

                  {/* Venturi Visualizer */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 600 240">
                      <rect x="0" y="0" width="600" height="240" fill="#09090B" />
                      <polygon points="40,60 180,60 270,95 330,95 440,60 560,60 560,180 440,180 330,145 270,145 180,180 40,180" fill="#0284C7" fillOpacity="0.25" stroke="#38BDF8" strokeWidth="2.5" />
                      <line x1="120" y1="60" x2="120" y2="20" stroke="#38BDF8" strokeWidth="3" />
                      <line x1="300" y1="95" x2="300" y2="20" stroke="#38BDF8" strokeWidth="3" />
                      <rect x="110" y="20" width="20" height="40" fill="#38BDF8" fillOpacity="0.8" />
                      <rect x="290" y="35" width="20" height="60" fill="#38BDF8" fillOpacity="0.8" />
                      <text x="120" y="15" textAnchor="middle" fill="#E0F2FE" fontSize="10" fontFamily="monospace">h1 = {venturiResult.inletPressureHeadM.toFixed(2)}m</text>
                      <text x="300" y="15" textAnchor="middle" fill="#E0F2FE" fontSize="10" fontFamily="monospace">h2 = {venturiResult.throatPressureHeadM.toFixed(2)}m</text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Diff Head Δh</span>
                      <span className="text-base font-mono font-black text-cyan-600">{venturiResult.differentialHeadM.toFixed(3)} m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Actual Flow Q</span>
                      <span className="text-base font-mono font-black text-zinc-900">{venturiResult.actualDischargeLps.toFixed(2)} L/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Throat Velocity v2</span>
                      <span className="text-base font-mono font-black text-blue-600">{venturiResult.throatVelocityMps.toFixed(2)} m/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Throat Re</span>
                      <span className="text-base font-mono font-black text-emerald-600">{venturiResult.reynoldsNumberThroat.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-cyan-600" />
                    <span>Venturi Geometry & Flow</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Inlet Diameter (d1):</span>
                        <span className="font-bold text-zinc-900">{venturiParams.inletDiameterMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="150"
                        step="5"
                        value={venturiParams.inletDiameterMm}
                        onChange={(e) => setVenturiParams({ ...venturiParams, inletDiameterMm: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Throat Diameter (d2):</span>
                        <span className="font-bold text-zinc-900">{venturiParams.throatDiameterMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="60"
                        step="2"
                        value={venturiParams.throatDiameterMm}
                        onChange={(e) => setVenturiParams({ ...venturiParams, throatDiameterMm: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Inlet Velocity (v1):</span>
                        <span className="font-bold text-zinc-900">{venturiParams.inletVelocityMps} m/s</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="4.0"
                        step="0.1"
                        value={venturiParams.inletVelocityMps}
                        onChange={(e) => setVenturiParams({ ...venturiParams, inletVelocityMps: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase block">Fluid Mechanics</span>
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

          {/* TAB 3: TENSILE TEST */}
          {activeExpId === 'tensile-test' && (
            <motion.div
              key="tensile-test"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200 uppercase">
                      {tensileResult.regime}
                    </span>
                  </div>

                  {/* Stress-Strain Curve Graph */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#3F3F46" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#3F3F46" strokeWidth="1.5" />

                      {(() => {
                        const pts = tensileResult.curvePoints;
                        if (!pts || pts.length === 0) return null;
                        const maxStrain = 0.35;
                        const maxStress = 700;
                        const toX = (e: number) => 40 + (e / maxStrain) * 440;
                        const toY = (s: number) => 170 - (s / maxStress) * 150;

                        const pathData = pts
                          .map((p: { strain: number; stressMpa: number }, idx: number) => `${idx === 0 ? 'M' : 'L'} ${toX(p.strain).toFixed(1)} ${toY(p.stressMpa).toFixed(1)}`)
                          .join(' ');

                        const currX = toX(tensileResult.currentStrain);
                        const currY = toY(tensileResult.currentStressMpa);

                        return (
                          <>
                            <path d={pathData} fill="none" stroke="#EF4444" strokeWidth="2.5" />
                            <circle cx={currX} cy={currY} r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>ε = 0.0</span>
                      <span>Yield Proof</span>
                      <span>Ultimate Tensile Strength</span>
                      <span>Fracture εf = {(MATERIAL_PROPERTIES[selectedMaterial].fractureStrain * 100).toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Applied Load P</span>
                      <span className="text-base font-mono font-black text-red-600">{tensileResult.currentLoadKn} kN</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Current Stress σ</span>
                      <span className="text-base font-mono font-black text-zinc-900">{tensileResult.currentStressMpa} MPa</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Strain ε</span>
                      <span className="text-base font-mono font-black text-blue-600">{tensileResult.currentStrain}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Yield Load</span>
                      <span className="text-base font-mono font-black text-emerald-600">{tensileResult.yieldLoadKn} kN</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-red-600" />
                    <span>UTM Controls & Material</span>
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-xs font-mono text-zinc-600">Specimen Material:</span>
                    <div className="grid grid-cols-1 gap-1.5">
                      {(['mild_steel', 'aluminium_6061', 'structural_brass'] as SpecimenMaterial[]).map((mat) => (
                        <button
                          key={mat}
                          onClick={() => setSelectedMaterial(mat)}
                          className={`px-3 py-2 rounded-lg text-xs font-mono font-semibold text-left border transition-all ${
                            selectedMaterial === mat
                              ? 'border-red-500 bg-red-50 text-red-900'
                              : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                          }`}
                        >
                          {MATERIAL_PROPERTIES[mat].name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-zinc-600">Crosshead Elongation (ΔL):</span>
                      <span className="font-bold text-red-600">{elongationMm.toFixed(2)} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="18.0"
                      step="0.2"
                      value={elongationMm}
                      onChange={(e) => setElongationMm(parseFloat(e.target.value))}
                      className="w-full accent-red-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-red-800 uppercase block">Solid Mechanics</span>
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

          {/* TAB 4: PIPE FRICTION & LOSSES */}
          {activeExpId === 'pipe-friction' && (
            <motion.div
              key="pipe-friction"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase">
                      Flow Regime: {pipeResult.flowRegime}
                    </span>
                  </div>

                  {/* SVG Pipe + Manometer Diagram */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 600 240">
                      <rect x="0" y="0" width="600" height="240" fill="#09090B" />
                      {/* Pipe wall */}
                      <rect x="40" y="70" width="520" height="40" fill="#1E293B" stroke="#475569" strokeWidth="2.5" />
                      {/* Flow stream */}
                      <rect x="40" y="74" width="520" height="32" fill="#0284C7" fillOpacity="0.35" />
                      {/* Flow directional arrows */}
                      <line x1="80" y1="90" x2="160" y2="90" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6,4" />
                      <line x1="260" y1="90" x2="340" y2="90" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6,4" />
                      <line x1="420" y1="90" x2="500" y2="90" stroke="#38BDF8" strokeWidth="2" strokeDasharray="6,4" />

                      {/* Pressure Taps into U-tube Manometer */}
                      <line x1="120" y1="70" x2="120" y2="140" stroke="#94A3B8" strokeWidth="3" />
                      <line x1="460" y1="70" x2="460" y2="140" stroke="#94A3B8" strokeWidth="3" />
                      {/* U-tube body */}
                      <path d="M 120 140 L 120 200 A 30 30 0 0 0 180 200 L 180 170" fill="none" stroke="#94A3B8" strokeWidth="6" />
                      <path d="M 460 140 L 460 200 A 30 30 0 0 1 400 200 L 400 170" fill="none" stroke="#94A3B8" strokeWidth="6" />
                      {/* Mercury Deflection */}
                      <circle cx="150" cy="205" r="7" fill="#F43F5E" />
                      <circle cx="430" cy="205" r="7" fill="#F43F5E" />
                      <text x="300" y="210" textAnchor="middle" fill="#E2E8F0" fontSize="12" fontFamily="monospace">
                        Differential Manometer Δh = {pipeResult.manometerDeflectionMm.toFixed(1)} mm Hg
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Head Loss hf</span>
                      <span className="text-base font-mono font-black text-blue-600">{pipeResult.frictionalHeadLossM.toFixed(3)} m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Friction Factor f</span>
                      <span className="text-base font-mono font-black text-zinc-900">{pipeResult.darcyFrictionFactor.toFixed(4)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Reynolds No.</span>
                      <span className="text-base font-mono font-black text-emerald-600">{pipeResult.reynoldsNumber.toLocaleString()}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Pressure Drop ΔP</span>
                      <span className="text-base font-mono font-black text-purple-600">{pipeResult.pressureDropKpa.toFixed(2)} kPa</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Pipe Parameters</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Flow Velocity (v):</span>
                        <span className="font-bold text-zinc-900">{pipeParams.flowVelocityMPerS.toFixed(2)} m/s</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="5.0"
                        step="0.1"
                        value={pipeParams.flowVelocityMPerS}
                        onChange={(e) => setPipeParams({ ...pipeParams, flowVelocityMPerS: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Pipe Diameter (D):</span>
                        <span className="font-bold text-zinc-900">{pipeParams.pipeDiameterMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="100"
                        step="5"
                        value={pipeParams.pipeDiameterMm}
                        onChange={(e) => setPipeParams({ ...pipeParams, pipeDiameterMm: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Pipe Length (L):</span>
                        <span className="font-bold text-zinc-900">{pipeParams.pipeLengthM} m</span>
                      </div>
                      <input
                        type="range"
                        min="2"
                        max="50"
                        step="2"
                        value={pipeParams.pipeLengthM}
                        onChange={(e) => setPipeParams({ ...pipeParams, pipeLengthM: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Pipe Material:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['commercial_steel', 'smooth_pvc', 'galvanized_iron', 'cast_iron'] as PipeMaterialType[]).map((mat) => (
                          <button
                            key={mat}
                            onClick={() => setPipeParams({ ...pipeParams, pipeMaterial: mat })}
                            className={`px-2 py-1.5 rounded-lg text-[10px] font-mono font-semibold border text-left ${
                              pipeParams.pipeMaterial === mat
                                ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {mat.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-blue-800 uppercase block">Governing Equations</span>
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

          {/* TAB 5: TORSION TEST */}
          {activeExpId === 'torsion-test' && (
            <motion.div
              key="torsion-test"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                      Yield Proof: {torsionResult.hasYielded ? 'Yield Exceeded' : 'Elastic Range'}
                    </span>
                  </div>

                  {/* SVG 3D Isometric Shaft Diagram */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 600 240">
                      <rect x="0" y="0" width="600" height="240" fill="#09090B" />
                      {/* Fixed Chuck on Left */}
                      <rect x="50" y="50" width="40" height="140" fill="#334155" stroke="#64748B" strokeWidth="2" />
                      <line x1="50" y1="50" x2="30" y2="70" stroke="#475569" strokeWidth="2" />
                      <line x1="50" y1="120" x2="30" y2="140" stroke="#475569" strokeWidth="2" />
                      <line x1="50" y1="190" x2="30" y2="210" stroke="#475569" strokeWidth="2" />

                      {/* Cylindrical Shaft */}
                      <rect x="90" y="80" width="400" height="80" fill="#475569" stroke="#94A3B8" strokeWidth="2" />
                      {/* Twist spiral line */}
                      <path
                        d={`M 90 120 Q 290 ${120 + torsionResult.angleTwistDeg * 2.5} 490 120`}
                        fill="none"
                        stroke="#A855F7"
                        strokeWidth="3.5"
                        strokeDasharray="6,4"
                      />

                      {/* Right Chuck & Twisting Moment Torque Arrow */}
                      <rect x="490" y="60" width="30" height="120" fill="#334155" stroke="#64748B" strokeWidth="2" />
                      <path d="M 535 70 A 45 45 0 1 1 535 170" fill="none" stroke="#F59E0B" strokeWidth="4" />
                      <polygon points="535,65 525,75 540,80" fill="#F59E0B" />
                      <text x="560" y="125" textAnchor="middle" fill="#F59E0B" fontSize="11" fontWeight="bold" fontFamily="monospace">
                        T = {torsionParams.appliedTorqueNm} N·m
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Angle of Twist θ</span>
                      <span className="text-base font-mono font-black text-purple-600">{torsionResult.angleTwistDeg.toFixed(2)}°</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Shear Stress τ</span>
                      <span className="text-base font-mono font-black text-zinc-900">{torsionResult.maxShearStressMpa.toFixed(1)} MPa</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Polar Moment J</span>
                      <span className="text-base font-mono font-black text-emerald-600">{(torsionResult.polarMomentMm4 / 1e4).toFixed(1)}×10⁴ mm⁴</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Torsional Stiffness</span>
                      <span className="text-base font-mono font-black text-blue-600">{torsionResult.torsionalStiffnessNmPerRad.toFixed(0)} N·m/rad</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>Torsion Apparatus</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Applied Torque (T):</span>
                        <span className="font-bold text-zinc-900">{torsionParams.appliedTorqueNm} N·m</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="800"
                        step="20"
                        value={torsionParams.appliedTorqueNm}
                        onChange={(e) => setTorsionParams({ ...torsionParams, appliedTorqueNm: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Shaft Outer Diameter (D):</span>
                        <span className="font-bold text-zinc-900">{torsionParams.outerDiameterMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="15"
                        max="60"
                        step="2"
                        value={torsionParams.outerDiameterMm}
                        onChange={(e) => setTorsionParams({ ...torsionParams, outerDiameterMm: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Shaft Length (L):</span>
                        <span className="font-bold text-zinc-900">{torsionParams.lengthM} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.3"
                        max="2.0"
                        step="0.1"
                        value={torsionParams.lengthM}
                        onChange={(e) => setTorsionParams({ ...torsionParams, lengthM: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Shaft Material:</span>
                      <div className="grid grid-cols-1 gap-1.5">
                        {(['mild_steel', 'aluminium_alloy', 'structural_brass'] as ShaftMaterialType[]).map((mat) => (
                          <button
                            key={mat}
                            onClick={() => setTorsionParams({ ...torsionParams, material: mat })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border text-left ${
                              torsionParams.material === mat
                                ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {mat.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">Solid Mechanics</span>
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

          {/* TAB 6: FOUR-BAR LINKAGE */}
          {activeExpId === 'four-bar' && (
            <motion.div
              key="four-bar"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                      {fourBarResult.linkageType.replace(/_/g, ' ')}
                    </span>
                  </div>

                  {/* SVG Kinematic Planar Linkage */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 240">
                      <rect x="0" y="0" width="500" height="240" fill="#09090B" />
                      {(() => {
                        const originX = 140;
                        const originY = 160;
                        const scale = 1.0;
                        const { jointB, jointC, jointD } = fourBarResult;

                        const Ax = originX;
                        const Ay = originY;
                        const Bx = originX + jointB.x * scale;
                        const By = originY - jointB.y * scale;
                        const Cx = originX + jointC.x * scale;
                        const Cy = originY - jointC.y * scale;
                        const Dx = originX + jointD.x * scale;
                        const Dy = originY - jointD.y * scale;

                        return (
                          <>
                            {/* Coupler Curve Trajectory Trail */}
                            {fourBarResult.fullCouplerPath && (
                              <polyline
                                points={fourBarResult.fullCouplerPath.map((p: { x: number; y: number }) => `${originX + p.x * scale},${originY - p.y * scale}`).join(' ')}
                                fill="none"
                                stroke="#10B981"
                                strokeWidth="1.5"
                                strokeDasharray="3,3"
                                strokeOpacity="0.6"
                              />
                            )}

                            {/* Ground Link AD */}
                            <line x1={Ax} y1={Ay} x2={Dx} y2={Dy} stroke="#71717A" strokeWidth="4" strokeDasharray="6,3" />
                            {/* Crank AB */}
                            <line x1={Ax} y1={Ay} x2={Bx} y2={By} stroke="#F59E0B" strokeWidth="5" strokeLinecap="round" />
                            {/* Coupler BC */}
                            <line x1={Bx} y1={By} x2={Cx} y2={Cy} stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" />
                            {/* Rocker CD */}
                            <line x1={Cx} y1={Cy} x2={Dx} y2={Dy} stroke="#EC4899" strokeWidth="5" strokeLinecap="round" />

                            {/* Pivots */}
                            <circle cx={Ax} cy={Ay} r="6" fill="#F8FAFC" stroke="#09090B" strokeWidth="2" />
                            <circle cx={Bx} cy={By} r="5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />
                            <circle cx={Cx} cy={Cy} r="5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
                            <circle cx={Dx} cy={Dy} r="6" fill="#F8FAFC" stroke="#09090B" strokeWidth="2" />

                            <text x={Ax - 15} y={Ay + 15} fill="#A1A1AA" fontSize="10" fontFamily="monospace">A (0,0)</text>
                            <text x={Dx + 10} y={Dy + 15} fill="#A1A1AA" fontSize="10" fontFamily="monospace">D ({fourBarParams.fixedLengthD}mm)</text>
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Crank Angle θ2</span>
                      <span className="text-base font-mono font-black text-amber-600">{fourBarParams.inputAngleTheta2Deg}°</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Rocker Angle θ4</span>
                      <span className="text-base font-mono font-black text-pink-600">{fourBarResult.rockerAngleDeg.toFixed(1)}°</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Coupler Angle θ3</span>
                      <span className="text-base font-mono font-black text-sky-600">{fourBarResult.couplerAngleDeg.toFixed(1)}°</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Transmission Angle μ</span>
                      <span className="text-base font-mono font-black text-emerald-600">{fourBarResult.transmissionAngleDeg.toFixed(1)}°</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Linkage Kinematics</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Crank Rotation (θ2):</span>
                        <span className="font-bold text-amber-600">{fourBarParams.inputAngleTheta2Deg}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="5"
                        value={fourBarParams.inputAngleTheta2Deg}
                        onChange={(e) => setFourBarParams({ ...fourBarParams, inputAngleTheta2Deg: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Crank Length (a):</span>
                        <span className="font-bold text-zinc-900">{fourBarParams.crankLengthA} mm</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        step="2"
                        value={fourBarParams.crankLengthA}
                        onChange={(e) => setFourBarParams({ ...fourBarParams, crankLengthA: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Coupler Length (b):</span>
                        <span className="font-bold text-zinc-900">{fourBarParams.couplerLengthB} mm</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="220"
                        step="5"
                        value={fourBarParams.couplerLengthB}
                        onChange={(e) => setFourBarParams({ ...fourBarParams, couplerLengthB: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Rocker Length (c):</span>
                        <span className="font-bold text-zinc-900">{fourBarParams.rockerLengthC} mm</span>
                      </div>
                      <input
                        type="range"
                        min="60"
                        max="180"
                        step="5"
                        value={fourBarParams.rockerLengthC}
                        onChange={(e) => setFourBarParams({ ...fourBarParams, rockerLengthC: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Mechanism Kinematics</span>
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

export default function MechanicalWorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Mechanical Laboratory...</div>}>
      <MechanicalWorkbenchContent />
    </Suspense>
  );
}
