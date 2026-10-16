/**
 * Prismora Physical Sciences Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Bombay, IIT Delhi, IIT Kanpur & Amrita Vishwa Vidyapeetham
 * Experiments:
 * 1. Einstein's Photoelectric Effect & Planck's Constant (PH-201)
 * 2. Newton's Rings Interference & Wavelength Determination (PH-203)
 * 3. Diffraction Grating Spectrometer & Angular Dispersion (PH-205)
 * 4. Coupled Harmonic Oscillators & Normal Modes / Beats (PH-207)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  PhotoelectricEngine,
  CATHODE_METALS,
  type CathodeMetal,
  NewtonsRingsEngine,
  DEFAULT_NEWTONS_RINGS_PARAMS,
  type NewtonsRingsParameters,
  DiffractionGratingEngine,
  DEFAULT_GRATING_PARAMS,
  type DiffractionGratingParameters,
  CoupledOscillatorEngine,
  DEFAULT_COUPLED_PARAMS,
  type CoupledOscillatorParameters,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  Atom,
  BookOpen,
  ChevronRight,
  Download,
  Lightbulb,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Waves,
  Zap,
} from 'lucide-react';

type PhysicsExpId = 'photoelectric' | 'newtons-rings' | 'diffraction-grating' | 'coupled-oscillators';

interface PhysicsExperimentDef {
  readonly id: PhysicsExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const PHYSICS_EXPERIMENTS: readonly PhysicsExperimentDef[] = [
  {
    id: 'photoelectric',
    title: "Einstein's Photoelectric Effect & Planck's Constant (h)",
    shortTitle: 'Photoelectric Effect',
    courseCode: 'PH-201 (Modern Physics & Quantum)',
    benchmark: 'IIT Bombay & Amrita University',
    description: 'Cathode metal work functions, photon energy E = h*nu, stopping potential V0, photocurrent saturation, and Planck constant determination.',
    color: '#F59E0B',
    equations: [
      'K_{max} = h \\nu - \\Phi = e V_0',
      'V_0 = \\left(\\frac{h}{e}\\right) \\nu - \\frac{\\Phi}{e}',
      'I_{sat} \\propto \\text{Light Intensity}',
    ],
  },
  {
    id: 'newtons-rings',
    title: "Newton's Rings Interference & Radius of Curvature / Liquid Index",
    shortTitle: "Newton's Rings",
    courseCode: 'PH-203 (Wave Optics & Interference)',
    benchmark: 'IIT Delhi & Amrita University',
    description: 'Thin air wedge interference rings, dark fringe diameters Dn^2 = 4n*lambda*R, sodium D-line wavelength, and liquid refractive index measurement.',
    color: '#3B82F6',
    equations: [
      'D_n^2 = 4 n \\lambda R \\quad (\\text{Air Wedge})',
      '\\lambda = \\frac{D_{n+p}^2 - D_n^2}{4 p R}',
      '\\mu = \\frac{(D_n^2)_{air}}{(D_n^2)_{liquid}}',
    ],
  },
  {
    id: 'diffraction-grating',
    title: 'Plane Diffraction Grating Spectrometer & Angular Dispersion',
    shortTitle: 'Diffraction Grating',
    courseCode: 'PH-205 (Spectroscopy & Optics)',
    benchmark: 'IIT Delhi & IIT Roorkee',
    description: 'Transmission diffraction grating pitch d = 1/N, grating formula d*sin(theta) = m*lambda, spectral lines of Mercury and Sodium doublet separation.',
    color: '#8B5CF6',
    equations: [
      '(a + b) \\sin\\theta = d \\sin\\theta = m \\lambda',
      '\\frac{d\\theta}{d\\lambda} = \\frac{m}{d \\cos\\theta} \\quad (\\text{Angular Dispersion})',
      '\\frac{\\lambda}{\\Delta\\lambda} = m N_{total} \\quad (\\text{Resolving Power})',
    ],
  },
  {
    id: 'coupled-oscillators',
    title: 'Coupled Harmonic Oscillators, Normal Modes & Beats',
    shortTitle: 'Coupled Oscillators',
    courseCode: 'PH-207 (Classical Waves & Oscillations)',
    benchmark: 'IIT Kanpur & IIT Roorkee',
    description: 'Two identical masses connected by a central coupling spring kc, symmetric in-phase mode w1, antisymmetric out-of-phase mode w2, and beat envelope.',
    color: '#10B981',
    equations: [
      '\\omega_s = \\sqrt{\\frac{k}{m}}, \\quad \\omega_a = \\sqrt{\\frac{k + 2k_c}{m}}',
      'x_1(t) = A \\cos(\\omega_{mod} t) \\cos(\\omega_{avg} t)',
      'T_{beat} = \\frac{2\\pi}{\\omega_a - \\omega_s}',
    ],
  },
];

function PhysicsWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as PhysicsExpId) || 'photoelectric';
  const [activeExpId, setActiveExpId] = useState<PhysicsExpId>(
    PHYSICS_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'photoelectric',
  );

  React.useEffect(() => {
    const exp = searchParams.get('exp') as PhysicsExpId;
    if (exp && PHYSICS_EXPERIMENTS.some((e) => e.id === exp)) {
      setActiveExpId(exp);
    }
  }, [searchParams]);

  const activeExp = useMemo(
    () => PHYSICS_EXPERIMENTS.find((e) => e.id === activeExpId) ?? PHYSICS_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // ==========================================
  // EXP 1: Photoelectric States
  // ==========================================
  const [selectedMetal, setSelectedMetal] = useState<CathodeMetal>('cesium');
  const [wavelengthNm, setWavelengthNm] = useState<number>(420);
  const [intensityPercent, setIntensityPercent] = useState<number>(75);
  const [appliedVoltageV, setAppliedVoltageV] = useState<number>(-0.8);

  const peResult = useMemo(
    () =>
      PhotoelectricEngine.compute({
        metal: selectedMetal,
        wavelengthNm,
        intensityPercent,
        appliedVoltageV,
      }),
    [selectedMetal, wavelengthNm, intensityPercent, appliedVoltageV],
  );

  // ==========================================
  // EXP 2: Newton's Rings States
  // ==========================================
  const [ringsParams, setRingsParams] = useState<NewtonsRingsParameters>(DEFAULT_NEWTONS_RINGS_PARAMS);
  const ringsResult = useMemo(() => NewtonsRingsEngine.compute(ringsParams), [ringsParams]);

  // ==========================================
  // EXP 3: Diffraction Grating States
  // ==========================================
  const [gratingParams, setGratingParams] = useState<DiffractionGratingParameters>(DEFAULT_GRATING_PARAMS);
  const gratingResult = useMemo(() => DiffractionGrractionEngineSafe(gratingParams), [gratingParams]);

  function DiffractionGrractionEngineSafe(p: DiffractionGratingParameters) {
    return DiffractionGratingEngine.compute(p);
  }

  // ==========================================
  // EXP 4: Coupled Oscillators States
  // ==========================================
  const [coupledParams, setCoupledParams] = useState<CoupledOscillatorParameters>(DEFAULT_COUPLED_PARAMS);
  const coupledResult = useMemo(() => CoupledOscillatorEngine.compute(coupledParams), [coupledParams]);

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
            <span className="font-bold text-zinc-900">Physical Sciences Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`phy-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {PHYSICS_EXPERIMENTS.map((exp) => {
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
                    layoutId="active-phy-tab"
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
          {/* TAB 1: PHOTOELECTRIC EFFECT */}
          {activeExpId === 'photoelectric' && (
            <motion.div
              key="photoelectric"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      V0 = {peResult.stoppingPotentialV.toFixed(2)} V
                    </span>
                  </div>

                  {/* Phototube Visualizer */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      {/* Glass Tube Envelope */}
                      <rect x="120" y="40" width="260" height="140" rx="40" fill="none" stroke="#64748B" strokeWidth="2.5" />
                      {/* Cathode Plate */}
                      <rect x="160" y="60" width="12" height="100" rx="3" fill="#94A3B8" />
                      {/* Anode Plate */}
                      <rect x="328" y="60" width="12" height="100" rx="3" fill="#94A3B8" />

                      {/* Incident Light Photons */}
                      <line x1="80" y1="90" x2="160" y2="100" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6,4" />
                      <line x1="80" y1="110" x2="160" y2="110" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6,4" />
                      <line x1="80" y1="130" x2="160" y2="120" stroke="#F59E0B" strokeWidth="3" strokeDasharray="6,4" />

                      {/* Emitted Photoelectrons (dots) */}
                      {peResult.isEmissionPossible && (
                        <>
                          <circle cx="210" cy="100" r="3" fill="#38BDF8" />
                          <circle cx="250" cy="115" r="3" fill="#38BDF8" />
                          <circle cx="280" cy="95" r="3" fill="#38BDF8" />
                        </>
                      )}
                      <text x="250" y="200" textAnchor="middle" fill="#E2E8F0" fontSize="11" fontFamily="monospace">
                        Photocurrent I = {peResult.currentPhotocurrentUa.toFixed(2)} µA
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Stopping Potential</span>
                      <span className="text-base font-mono font-black text-amber-600">{peResult.stoppingPotentialV.toFixed(2)} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Kinetic Energy</span>
                      <span className="text-base font-mono font-black text-zinc-900">{peResult.maxKineticEnergyEv.toFixed(2)} eV</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Photon Energy hν</span>
                      <span className="text-base font-mono font-black text-blue-600">{peResult.photonEnergyEv.toFixed(2)} eV</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Cutoff Wavelength</span>
                      <span className="text-base font-mono font-black text-emerald-600">{peResult.thresholdWavelengthNm.toFixed(0)} nm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>Apparatus Parameters</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Light Wavelength (λ):</span>
                        <span className="font-bold text-amber-600">{wavelengthNm} nm</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="700"
                        step="5"
                        value={wavelengthNm}
                        onChange={(e) => setWavelengthNm(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Retarding Voltage:</span>
                        <span className="font-bold text-zinc-900">{appliedVoltageV.toFixed(2)} V</span>
                      </div>
                      <input
                        type="range"
                        min="-3.0"
                        max="2.0"
                        step="0.1"
                        value={appliedVoltageV}
                        onChange={(e) => setAppliedVoltageV(parseFloat(e.target.value))}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Cathode Metal:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['cesium', 'potassium', 'sodium', 'copper'] as CathodeMetal[]).map((m) => (
                          <button
                            key={m}
                            onClick={() => setSelectedMetal(m)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border text-left ${
                              selectedMetal === m
                                ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {CATHODE_METALS[m].name} ({CATHODE_METALS[m].workFunctionEv} eV)
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Quantum Equations</span>
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

          {/* TAB 2: NEWTON'S RINGS */}
          {activeExpId === 'newtons-rings' && (
            <motion.div
              key="newtons-rings"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      λ = {ringsResult.calculatedWavelengthNm.toFixed(1)} nm (R = {ringsParams.lensRadiusOfCurvatureM} m)
                    </span>
                  </div>

                  {/* Concentric Interference Newton's Rings Dark Field */}
                  <div className="h-64 sm:h-72 w-full bg-black rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 300 220">
                      <rect x="0" y="0" width="300" height="220" fill="#000000" />
                      {/* Central Dark Spot */}
                      <circle cx="150" cy="110" r="4" fill="#111111" stroke="#F59E0B" strokeWidth="0.8" />
                      {/* Rings */}
                      {ringsResult.ringDiameters.map((r, i) => {
                        const radiusPx = (r.diameterMm * 14);
                        return (
                          <circle
                            key={i}
                            cx="150"
                            cy="110"
                            r={radiusPx}
                            fill="none"
                            stroke="#F59E0B"
                            strokeWidth={Math.max(1, 4 - i * 0.35)}
                            strokeOpacity={0.85}
                          />
                        );
                      })}
                      {/* Microscope Crosshairs */}
                      <line x1="150" y1="20" x2="150" y2="200" stroke="#EF4444" strokeWidth="0.8" strokeDasharray="3,3" />
                      <line x1="50" y1="110" x2="250" y2="110" stroke="#EF4444" strokeWidth="0.8" strokeDasharray="3,3" />
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Ring #1 Diameter</span>
                      <span className="text-base font-mono font-black text-amber-600">{ringsResult.ringDiameters[0]?.diameterMm.toFixed(3)} mm</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Ring #5 Diameter</span>
                      <span className="text-base font-mono font-black text-zinc-900">{ringsResult.ringDiameters[4]?.diameterMm.toFixed(3)} mm</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Medium Index μ</span>
                      <span className="text-base font-mono font-black text-blue-600">{ringsParams.mediumRefractiveIndex}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Wavelength λ</span>
                      <span className="text-base font-mono font-black text-emerald-600">{ringsResult.calculatedWavelengthNm.toFixed(1)} nm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Optics Apparatus</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Lens Radius R:</span>
                        <span className="font-bold text-zinc-900">{ringsParams.lensRadiusOfCurvatureM} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={ringsParams.lensRadiusOfCurvatureM}
                        onChange={(e) => setRingsParams({ ...ringsParams, lensRadiusOfCurvatureM: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Light Wavelength (λ):</span>
                        <span className="font-bold text-amber-600">{ringsParams.wavelengthNm} nm</span>
                      </div>
                      <input
                        type="range"
                        min="400"
                        max="700"
                        step="10"
                        value={ringsParams.wavelengthNm}
                        onChange={(e) => setRingsParams({ ...ringsParams, wavelengthNm: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Liquid Film Medium:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { label: 'Air (1.0)', mu: 1.0 },
                          { label: 'Water (1.33)', mu: 1.33 },
                          { label: 'Glycerin (1.47)', mu: 1.47 },
                        ].map((m) => (
                          <button
                            key={m.label}
                            onClick={() => setRingsParams({ ...ringsParams, mediumRefractiveIndex: m.mu })}
                            className={`px-2 py-1.5 rounded-lg text-xs font-mono font-semibold border text-center ${
                              ringsParams.mediumRefractiveIndex === m.mu
                                ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {m.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-blue-800 uppercase block">Interference Optics</span>
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

          {/* TAB 3: DIFFRACTION GRATING */}
          {activeExpId === 'diffraction-grating' && (
            <motion.div
              key="diffraction-grating"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      Pitch d = {gratingResult.gratingPitchUm.toFixed(3)} µm ({gratingParams.linesPerMm} lines/mm)
                    </span>
                  </div>

                  {/* Spectrometer Dispersed Spectral Lines Field */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      {/* Central Un-diffracted Zero Order White Slit */}
                      <line x1="80" y1="40" x2="80" y2="180" stroke="#FFFFFF" strokeWidth="4" />
                      <text x="80" y="200" textAnchor="middle" fill="#FFFFFF" fontSize="10" fontFamily="monospace">m=0 (0°)</text>

                      {/* Diffracted Spectral Lines */}
                      {gratingResult.diffractedLines.map((line, idx) => {
                        const xPos = 80 + line.diffractionAngleDeg * 12;
                        return (
                          <g key={idx}>
                            <line x1={xPos} y1="40" x2={xPos} y2="180" stroke={line.hexColor} strokeWidth="3.5" />
                            <text x={xPos} y="30" textAnchor="middle" fill={line.hexColor} fontSize="9" fontFamily="monospace">
                              {line.diffractionAngleDeg.toFixed(1)}°
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Grating Pitch d</span>
                      <span className="text-base font-mono font-black text-purple-600">{gratingResult.gratingPitchUm.toFixed(3)} µm</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Spectral Order</span>
                      <span className="text-base font-mono font-black text-zinc-900">m = {gratingParams.spectralOrderM}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Sodium D1 Angle</span>
                      <span className="text-base font-mono font-black text-amber-600">{gratingResult.diffractedLines.find(l => l.label.includes('D1'))?.diffractionAngleDeg.toFixed(2)}°</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Doublet Threshold</span>
                      <span className="text-base font-mono font-black text-emerald-600">{gratingResult.sodiumDoubletResolutionThreshold} Lines</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>Grating Ruler & Order</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Ruling Density (lines/mm):</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[300, 600, 1000].map((lpm) => (
                          <button
                            key={lpm}
                            onClick={() => setGratingParams({ ...gratingParams, linesPerMm: lpm })}
                            className={`px-2 py-1.5 rounded-lg text-xs font-mono font-semibold border text-center ${
                              gratingParams.linesPerMm === lpm
                                ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {lpm} L/mm
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Spectral Order (m):</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {[1, 2].map((ord) => (
                          <button
                            key={ord}
                            onClick={() => setGratingParams({ ...gratingParams, spectralOrderM: ord })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold border text-center ${
                              gratingParams.spectralOrderM === ord
                                ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            Order m = {ord}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">Grating Formula</span>
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

          {/* TAB 4: COUPLED OSCILLATORS */}
          {activeExpId === 'coupled-oscillators' && (
            <motion.div
              key="coupled-oscillators"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Beat Period Tbeat = {coupledResult.beatPeriodSeconds.toFixed(2)} s
                    </span>
                  </div>

                  {/* Coupled Oscillations Time Series Graph */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="100" x2="480" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />

                      {/* Mass 1 displacement curve (Emerald) */}
                      {(() => {
                        const pts = coupledResult.timeSeriesData;
                        const maxT = pts[pts.length - 1]?.timeSec ?? 10;
                        const maxA = Math.max(0.01, coupledParams.initialDisplacementX1M * 1.2);
                        const toX = (t: number) => 40 + (t / maxT) * 440;
                        const toY = (x: number) => 100 - (x / maxA) * 80;

                        const path1 = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.timeSec).toFixed(1)} ${toY(p.x1M).toFixed(1)}`).join(' ');
                        const path2 = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.timeSec).toFixed(1)} ${toY(p.x2M).toFixed(1)}`).join(' ');
                        return (
                          <>
                            <path d={path1} fill="none" stroke="#10B981" strokeWidth="2.5" />
                            <path d={path2} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,2" />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span className="text-emerald-400">― Mass 1: x1(t)</span>
                      <span className="text-amber-400">--- Mass 2: x2(t) (Energy Transfer)</span>
                      <span>Beat Envelope</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">In-Phase Mode ω1</span>
                      <span className="text-base font-mono font-black text-emerald-600">{coupledResult.symmetricFreqOmega1RadPerS.toFixed(2)} rad/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Out-Phase Mode ω2</span>
                      <span className="text-base font-mono font-black text-amber-600">{coupledResult.antisymmetricFreqOmega2RadPerS.toFixed(2)} rad/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Coupling Ratio kc/k</span>
                      <span className="text-base font-mono font-black text-zinc-900">{coupledResult.couplingRatioKcOverK.toFixed(3)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Beat Period Tbeat</span>
                      <span className="text-base font-mono font-black text-blue-600">{coupledResult.beatPeriodSeconds.toFixed(2)} s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Oscillator Springs & Masses</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Main Spring (k):</span>
                        <span className="font-bold text-zinc-900">{coupledParams.mainSpringConstantNPerM} N/m</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="60"
                        step="2"
                        value={coupledParams.mainSpringConstantNPerM}
                        onChange={(e) => setCoupledParams({ ...coupledParams, mainSpringConstantNPerM: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Coupling Spring (kc):</span>
                        <span className="font-bold text-amber-600">{coupledParams.couplingSpringConstantKc} N/m</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="15.0"
                        step="0.5"
                        value={coupledParams.couplingSpringConstantKc}
                        onChange={(e) => setCoupledParams({ ...coupledParams, couplingSpringConstantKc: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Mass (m):</span>
                        <span className="font-bold text-zinc-900">{coupledParams.massKg} kg</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="3.0"
                        step="0.1"
                        value={coupledParams.massKg}
                        onChange={(e) => setCoupledParams({ ...coupledParams, massKg: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Coupled Oscillations</span>
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

export default function PhysicsWorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Physics Laboratory...</div>}>
      <PhysicsWorkbenchContent />
    </Suspense>
  );
}

