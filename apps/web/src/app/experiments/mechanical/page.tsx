/**
 * Prismora Mechanical Engineering Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Roorkee, IIT Bombay & NITK Surathkal
 * Experiments:
 * 1. Forced Harmonic Oscillator & Mechanical Resonance (Machine Dynamics)
 * 2. Bernoulli's Theorem & Venturimeter Flow Measurement (Fluid Mechanics)
 * 3. UTM Tensile Test & Stress-Strain Curve (Material Science & Strength of Materials)
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

type MechanicalExpId = 'harmonic-oscillator' | 'venturi-flow' | 'tensile-test';

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

      {/* Main Workbench Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Experiment Focus Banner */}
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
            {activeExpId === 'harmonic-oscillator' && (
              <Link
                href="/experiments/mechanical/harmonic-oscillator"
                className="px-3.5 py-1.5 rounded-lg bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Full Screen Studio</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Experiment Specific Workspace */}
        <AnimatePresence mode="wait">
          {activeExpId === 'harmonic-oscillator' && (
            <motion.div
              key="harmonic"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Canvas & State Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">Mechanical System Telemetry</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                      {zeta < 1 ? 'Underdamped' : zeta === 1 ? 'Critically Damped' : 'Overdamped'}
                    </span>
                  </div>

                  {/* Mass-Spring Schematic Visualizer */}
                  <div className="h-64 rounded-xl bg-gradient-to-b from-zinc-50 to-zinc-100/60 border border-zinc-200/80 relative flex items-center justify-center p-6 overflow-hidden">
                    {/* Fixed wall */}
                    <div className="absolute left-6 top-12 bottom-12 w-3 bg-zinc-700 rounded-l-md border-r-2 border-zinc-400" />
                    
                    {/* Spring coils */}
                    <div className="absolute left-9 right-48 flex items-center justify-center">
                      <svg className="w-full h-16 stroke-amber-600 fill-none stroke-[2.5]" viewBox="0 0 200 40">
                        <path d="M 0,20 L 20,20 L 30,5 L 45,35 L 60,5 L 75,35 L 90,5 L 105,35 L 120,5 L 135,35 L 150,5 L 165,35 L 180,20 L 200,20" />
                      </svg>
                    </div>

                    {/* Mass Block */}
                    <div className="absolute right-24 w-28 h-28 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-500 shadow-lg text-white font-mono flex flex-col items-center justify-center border-2 border-amber-400/40">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-200">Mass</span>
                      <span className="text-2xl font-black">{mass} kg</span>
                      <span className="text-[10px] text-amber-100 mt-1">x(t) = {steadyAmplitude.toFixed(3)} m</span>
                    </div>

                    {/* Driving force indicator */}
                    <div className="absolute right-6 flex items-center gap-1 text-red-600 font-mono text-xs font-bold animate-pulse">
                      <span>F0</span>
                      <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                    </div>
                  </div>

                  {/* Key Readouts Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Natural Freq ωn</span>
                      <span className="text-base font-mono font-black text-zinc-900">{wn.toFixed(2)} rad/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Damping Ratio ζ</span>
                      <span className="text-base font-mono font-black text-zinc-900">{zeta.toFixed(3)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Magnification M</span>
                      <span className="text-base font-mono font-black text-amber-600">{magnification.toFixed(2)}x</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Amplitude X</span>
                      <span className="text-base font-mono font-black text-blue-600">{steadyAmplitude.toFixed(3)} m</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Controls Panel */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>Oscillator Parameters</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
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
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Stiffness (k):</span>
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
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Damping Coeff (c):</span>
                        <span className="font-bold text-zinc-900">{damping} N·s/m</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="15.0"
                        step="0.1"
                        value={damping}
                        onChange={(e) => setDamping(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Driving Freq (ω):</span>
                        <span className="font-bold text-zinc-900">{drivingFreq} rad/s</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="15.0"
                        step="0.1"
                        value={drivingFreq}
                        onChange={(e) => setDrivingFreq(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Governing Equations Panel */}
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

          {activeExpId === 'venturi-flow' && (
            <motion.div
              key="venturi"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Venturi Left Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">Venturimeter Fluid Dynamics</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-bold border border-cyan-200">
                      Re = {venturiResult.reynoldsNumber.toLocaleString()} (Turbulent)
                    </span>
                  </div>

                  {/* Piezometric Manometer & Venturi Pipe Diagram */}
                  <div className="h-72 rounded-xl bg-gradient-to-b from-sky-50 to-blue-50/50 border border-zinc-200 p-4 relative overflow-hidden flex flex-col justify-between">
                    {/* Manometer Tubes */}
                    <div className="flex justify-between px-10 pt-2">
                      {venturiResult.profilePoints.map((pt, idx) => (
                        <div key={idx} className="flex flex-col items-center">
                          <span className="text-[9px] font-mono text-zinc-500 font-bold mb-1">{pt.pressureHeadCm} cm</span>
                          <div className="w-4 h-24 bg-zinc-200/80 rounded-t-sm border border-zinc-300 relative overflow-hidden">
                            {/* Water level inside piezometer tube */}
                            <div
                              className="absolute bottom-0 left-0 right-0 bg-blue-500/80 transition-all duration-300"
                              style={{ height: `${Math.min(100, Math.max(10, (pt.pressureHeadCm / 80) * 100))}%` }}
                            />
                          </div>
                          <span className="text-[8px] font-mono text-zinc-400 mt-1">h{idx + 1}</span>
                        </div>
                      ))}
                    </div>

                    {/* Venturi Tube Section */}
                    <div className="relative h-20 flex items-center justify-center">
                      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 600 80">
                        {/* Upper Wall */}
                        <path d="M 0,10 L 150,10 L 250,28 L 350,28 L 600,10" fill="none" stroke="#64748B" strokeWidth="4" />
                        {/* Lower Wall */}
                        <path d="M 0,70 L 150,70 L 250,52 L 350,52 L 600,70" fill="none" stroke="#64748B" strokeWidth="4" />
                        {/* Flow Arrows */}
                        <line x1="40" y1="40" x2="100" y2="40" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 2" />
                        <line x1="270" y1="40" x2="330" y2="40" stroke="#0284C7" strokeWidth="3.5" />
                        <line x1="480" y1="40" x2="540" y2="40" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 2" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-between px-8 text-[10px] font-mono font-bold text-zinc-700 pointer-events-none">
                        <span>Inlet (d1: {venturiParams.inletDiameterMm}mm)</span>
                        <span className="text-cyan-700 bg-white/80 px-1.5 py-0.5 rounded border border-cyan-200">
                          Throat (d2: {venturiParams.throatDiameterMm}mm)
                        </span>
                        <span>Exit</span>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Differential Head Δh</span>
                      <span className="text-base font-mono font-black text-cyan-700">{venturiResult.deltaHCm} cm</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Actual Flow Rate Q</span>
                      <span className="text-base font-mono font-black text-blue-700">{venturiResult.actualDischargeLps} L/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Throat Velocity v2</span>
                      <span className="text-base font-mono font-black text-emerald-700">{venturiResult.throatVelocityMs} m/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Discharge Coeff Cd</span>
                      <span className="text-base font-mono font-black text-zinc-800">{venturiParams.dischargeCoefficient}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Venturi Right Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Gauge className="w-4 h-4 text-cyan-600" />
                    <span>Hydraulic Controls</span>
                  </div>

                  <div className="space-y-3.5 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Inlet Valve Opening:</span>
                        <span className="font-bold text-zinc-900">{Math.round(venturiParams.valveOpening * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={venturiParams.valveOpening}
                        onChange={(e) => setVenturiParams({ ...venturiParams, valveOpening: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Throat Diameter (d2):</span>
                        <span className="font-bold text-zinc-900">{venturiParams.throatDiameterMm} mm</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="22"
                        step="1"
                        value={venturiParams.throatDiameterMm}
                        onChange={(e) => setVenturiParams({ ...venturiParams, throatDiameterMm: parseInt(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Discharge Coeff (Cd):</span>
                        <span className="font-bold text-zinc-900">{venturiParams.dischargeCoefficient}</span>
                      </div>
                      <input
                        type="range"
                        min="0.94"
                        max="0.99"
                        step="0.01"
                        value={venturiParams.dischargeCoefficient}
                        onChange={(e) => setVenturiParams({ ...venturiParams, dischargeCoefficient: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Governing Equations */}
                  <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase block">Bernoulli Formulations</span>
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

          {activeExpId === 'tensile-test' && (
            <motion.div
              key="tensile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Tensile Left Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">UTM Specimen & Stress-Strain Curve</span>
                    <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold border ${
                      tensileResult.testStage === 'elastic' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      tensileResult.testStage === 'yield' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      tensileResult.testStage === 'necking' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      Stage: {tensileResult.testStage.toUpperCase()}
                    </span>
                  </div>

                  {/* Stress-Strain SVG Graph */}
                  <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <span>σ (Stress, MPa) vs ε (Strain, mm/mm)</span>
                      <span className="text-red-400 font-bold">UTS: {MATERIAL_PROPERTIES[selectedMaterial].utsMpa} MPa</span>
                    </div>

                    {/* SVG Curve Plot */}
                    <svg className="w-full h-44 overflow-visible" viewBox="0 0 400 160">
                      {/* Grid lines */}
                      <line x1="30" y1="140" x2="380" y2="140" stroke="#334155" strokeWidth="1" />
                      <line x1="30" y1="10" x2="30" y2="140" stroke="#334155" strokeWidth="1" />
                      
                      {/* Polyline from stressStrainCurve */}
                      {(() => {
                        const maxStress = MATERIAL_PROPERTIES[selectedMaterial].utsMpa * 1.15;
                        const maxStrain = MATERIAL_PROPERTIES[selectedMaterial].fractureStrain * 1.1;
                        const pointsStr = tensileResult.stressStrainCurve
                          .map((pt) => {
                            const x = 30 + (pt.strain / maxStrain) * 350;
                            const y = 140 - (pt.stressMpa / maxStress) * 125;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ');

                        const currX = 30 + (tensileResult.currentStrain / maxStrain) * 350;
                        const currY = 140 - (tensileResult.currentStressMpa / maxStress) * 125;

                        return (
                          <>
                            <polyline fill="none" stroke="#F87171" strokeWidth="2.5" points={pointsStr} />
                            {/* Current point cursor */}
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

                  {/* Readouts Grid */}
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

              {/* Tensile Right Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-red-600" />
                    <span>UTM Controls & Material</span>
                  </div>

                  {/* Material Selector */}
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

                  {/* Crosshead Elongation Slider */}
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between font-mono text-xs">
                      <span className="text-zinc-600">Elongation (ΔL):</span>
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

                  {/* Governing Equations */}
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
