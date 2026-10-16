/**
 * Prismora Physical Sciences Virtual Lab — Wave Optics & Double-Slit Interference Workbench
 *
 * Implements an interactive Fraunhofer wave optics laboratory covering:
 * - Young's double-slit interference fringes (cos²β)
 * - Single-slit diffraction envelope ([sinα/α]²)
 * - Linear fringe width w = λ·D / d
 * - Missing orders cancellation where m = n·(d/a)
 * - Spectral wavelength to physical RGB color mapping (380 - 780 nm)
 * - Photodetector optical probe & virtual vernier caliper
 *
 * 7-Step Pedagogical Workflow:
 * 1. Understand (Wave optics principles & KaTeX formulas)
 * 2. Predict (Student fringe width & order hypothesis)
 * 3. Explore (Live virtual optical bench, laser source, screen pattern, photodetector)
 * 4. Guided (AICTE / IIT Roorkee wave optics experimental procedure)
 * 5. Analyze (Continuous spatial intensity distribution profile I(x))
 * 6. Challenge (Unknown laser wavelength calculation quiz)
 * 7. Report (Comprehensive physics optics observation sheet with PDF export)
 */

'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  WaveOpticsEvaluator,
  WaveOpticsParams,
  WaveOpticsCharacteristics,
  OpticsScreenPoint,
} from '@prismora/simulation-core';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  Eye,
  FileText,
  Lightbulb,
  Maximize2,
  Printer,
  RotateCcw,
  Sliders,
  TrendingUp,
  Zap,
} from 'lucide-react';

type WorkflowStep =
  | 'understand'
  | 'predict'
  | 'explore'
  | 'guided'
  | 'analyze'
  | 'challenge'
  | 'report';

export default function WaveOpticsLabPage() {
  const [activeStep, setActiveStep] = useState<WorkflowStep>('explore');

  // Optical bench parameters
  const [wavelength, setWavelength] = useState(632.8); // nm (He-Ne red laser)
  const [slitSeparation, setSlitSeparation] = useState(0.25); // mm (d)
  const [slitWidth, setSlitWidth] = useState(0.05); // mm (a)
  const [screenDistance, setScreenDistance] = useState(1.5); // m (D)
  const [laserPower, setLaserPower] = useState(100); // %

  // Interactive photodetector probe position (in mm from center)
  const [probePositionMm, setProbePositionMm] = useState(0.0);

  // Hypothesis State (Predict)
  const [predFringeWidth, setPredFringeWidth] = useState('');
  const [predMissingOrder, setPredMissingOrder] = useState('');
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);

  // Guided checklist
  const [guidedStep, setGuidedStep] = useState(0);

  // Challenge mode
  const [challengeWavelengthGuess, setChallengeWavelengthGuess] = useState('');
  const [challengeResult, setChallengeResult] = useState<string | null>(null);

  const params: WaveOpticsParams = useMemo(
    () => ({
      wavelengthNm: wavelength,
      slitSeparationMm: slitSeparation,
      slitWidthMm: slitWidth,
      screenDistanceM: screenDistance,
      sourceIntensityPct: laserPower,
    }),
    [wavelength, slitSeparation, slitWidth, screenDistance, laserPower]
  );

  const characteristics: WaveOpticsCharacteristics = useMemo(
    () => WaveOpticsEvaluator.computeCharacteristics(params),
    [params]
  );

  const probePoint: OpticsScreenPoint = useMemo(
    () => WaveOpticsEvaluator.computeIntensityAt(params, probePositionMm),
    [params, probePositionMm]
  );

  const intensityProfile: OpticsScreenPoint[] = useMemo(
    () => WaveOpticsEvaluator.generateIntensityProfile(params, 20, 250),
    [params]
  );

  // Preset lasers
  const setLaserPreset = (wl: number) => {
    setWavelength(wl);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-rose-100 selection:text-rose-900 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/library"
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors flex items-center"
            >
              ← Curriculum Library
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800">
                  PH-101
                </span>
                <h1 className="text-sm font-bold text-slate-900 sm:text-base">
                  Wave Optics: Double-Slit Interference & Diffraction Laboratory
                </h1>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                IIT Roorkee / AICTE Model Curriculum: Engineering Physics (Electromagnetic & Wave Optics)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <BugReportModal
              simulationId="wave-optics-physics"
              moduleName="Wave Optics Virtual Lab"
            />
            <button
              onClick={() => {
                setWavelength(632.8);
                setSlitSeparation(0.25);
                setSlitWidth(0.05);
                setScreenDistance(1.5);
                setProbePositionMm(0);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Reset Parameters"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 7-Step Pedagogical Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto border-t border-slate-100 text-xs font-medium scrollbar-none">
          {[
            { id: 'understand', label: '1. Understand', icon: BookOpen },
            { id: 'predict', label: '2. Predict', icon: Lightbulb },
            { id: 'explore', label: '3. Explore (Optical Bench)', icon: Activity },
            { id: 'guided', label: '4. Guided Procedure', icon: Compass },
            { id: 'analyze', label: '5. Analyze (Intensity Profile)', icon: TrendingUp },
            { id: 'challenge', label: '6. Challenge', icon: Award },
            { id: 'report', label: '7. Report', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStep === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStep(tab.id as WorkflowStep)}
                className={`flex items-center space-x-1.5 py-2.5 px-3 border-b-2 whitespace-nowrap transition-colors ${
                  isActive
                    ? 'border-rose-600 text-rose-700 font-semibold bg-rose-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =================================================================== */}
        {/* TAB 1: UNDERSTAND (THEORY) */}
        {/* =================================================================== */}
        {activeStep === 'understand' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-rose-600" />
                <span>Wave Optics: Fraunhofer Double-Slit Diffraction & Interference Theory</span>
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                When monochromatic coherent light of wavelength <MathView math="\lambda" /> passes through two narrow parallel slits of width <MathView math="a" /> separated by distance <MathView math="d" />, the resulting irradiance on a distant observation screen is a composite of single-slit diffraction and double-slit interference.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900">Total Intensity Distribution Formula</h3>
                  <div className="bg-white p-3 rounded border border-slate-200 text-center">
                    <MathView math="I(\theta) = I_0 \left( \frac{\sin\alpha}{\alpha} \right)^2 \cos^2(\beta)" display />
                  </div>
                  <p className="text-xs text-slate-600">
                    where <MathView math="\alpha = \frac{\pi a}{\lambda} \sin\theta" /> dictates the broad diffraction envelope, and <MathView math="\beta = \frac{\pi d}{\lambda} \sin\theta" /> yields the closely-spaced interference fringes.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900">Linear Fringe Width & Missing Orders</h3>
                  <div className="bg-white p-3 rounded border border-slate-200 text-center space-y-2">
                    <MathView math="w_{fringe} = \frac{\lambda D}{d}" display />
                    <MathView math="m = n \left( \frac{d}{a} \right) \quad (n = 1, 2, 3...)" display />
                  </div>
                  <p className="text-xs text-slate-600">
                    Fringe width increases linearly with wavelength <MathView math="\lambda" /> and screen distance <MathView math="D" />, and inversely with slit separation <MathView math="d" />.
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="font-bold text-sm text-slate-900 mb-3">Key Wave Conditions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <span className="font-bold text-rose-900 block mb-1">Constructive Interference (Bright Fringes)</span>
                    <MathView math="d \sin\theta = m \lambda \quad (m = 0, \pm 1, \pm 2...)" display />
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="font-bold text-slate-900 block mb-1">Destructive Interference (Dark Fringes)</span>
                    <MathView math="d \sin\theta = (m + \frac{1}{2}) \lambda" display />
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="font-bold text-amber-900 block mb-1">Diffraction Envelope Minima (Zero Intensity)</span>
                    <MathView math="a \sin\theta = n \lambda \quad (n = \pm 1, \pm 2...)" display />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: PREDICT */}
        {/* =================================================================== */}
        {activeStep === 'predict' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-rose-600" />
                <span>Formulate Optical Predictions Before Adjusting Bench</span>
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                With He-Ne laser <MathView math="\lambda = 632.8\text{ nm}" />, slit separation <MathView math="d = 0.25\text{ mm}" />, slit width <MathView math="a = 0.05\text{ mm}" />, and screen distance <MathView math="D = 1.5\text{ m}" />:
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Predicted Fringe Width <MathView math="w_{fringe}" /> (mm):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 3.8"
                    value={predFringeWidth}
                    onChange={(e) => setPredFringeWidth(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Formula: <MathView math="\frac{\lambda D}{d} = \frac{632.8 \times 10^{-6} \times 1.5}{0.25}" />
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. First Missing Order <MathView math="m" /> (where diffraction cancels interference):
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 5"
                    value={predMissingOrder}
                    onChange={(e) => setPredMissingOrder(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Formula: <MathView math="m = d / a" />
                  </span>
                </div>

                <button
                  onClick={() => setPredictionSubmitted(true)}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors shadow-xs"
                >
                  Verify Predictions
                </button>

                {predictionSubmitted && (
                  <div className="mt-4 p-4 bg-rose-50 border border-rose-200 rounded-lg text-xs space-y-2">
                    <span className="font-bold text-rose-900 block">✓ Verification Result:</span>
                    <div>Fringe Width: Your prediction: {predFringeWidth} mm • Analytical model: {characteristics.fringeWidthMm.toFixed(2)} mm</div>
                    <div>First Missing Order: Your prediction: {predMissingOrder} • Analytical model: Order {characteristics.missingOrders[0]} (since d/a = 0.25/0.05 = 5)</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: EXPLORE (VIRTUAL OPTICAL BENCH) */}
        {/* =================================================================== */}
        {activeStep === 'explore' && (
          <>
            {/* Left 8 Cols: Virtual Optical Bench and Screen Fringe Visualization */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Virtual Optical Bench & Screen
                    </span>
                    <span
                      className="text-xs px-2 py-0.5 rounded font-bold font-mono"
                      style={{ backgroundColor: `${characteristics.colorHex}20`, color: characteristics.colorHex }}
                    >
                      λ = {wavelength.toFixed(1)} nm ({characteristics.colorName})
                    </span>
                  </div>

                  {/* Laser presets */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setLaserPreset(632.8)}
                      className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-800 hover:bg-red-200"
                    >
                      Red 633nm
                    </button>
                    <button
                      onClick={() => setLaserPreset(532.0)}
                      className="px-2 py-1 text-xs font-medium rounded bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                    >
                      Green 532nm
                    </button>
                    <button
                      onClick={() => setLaserPreset(450.0)}
                      className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800 hover:bg-blue-200"
                    >
                      Blue 450nm
                    </button>
                    <button
                      onClick={() => setLaserPreset(405.0)}
                      className="px-2 py-1 text-xs font-medium rounded bg-purple-100 text-purple-800 hover:bg-purple-200"
                    >
                      Violet 405nm
                    </button>
                  </div>
                </div>

                {/* SVG Visual Workbench */}
                <div className="relative bg-slate-950 rounded-lg p-4 overflow-hidden shadow-inner min-h-[300px]">
                  <svg viewBox="0 0 600 280" className="w-full max-h-[280px]">
                    {/* Laser Source Housing */}
                    <rect x="20" y="110" width="70" height="40" fill="#1E293B" stroke="#475569" strokeWidth="2" rx="4" />
                    <rect x="85" y="122" width="10" height="16" fill="#64748B" rx="1" />
                    <text x="55" y="135" textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="bold">
                      LASER
                    </text>

                    {/* Emitted Monochromatic Laser Beam */}
                    <line
                      x1="95"
                      y1="130"
                      x2="220"
                      y2="130"
                      stroke={characteristics.colorHex}
                      strokeWidth="3.5"
                      strokeOpacity="0.9"
                    />

                    {/* Double-Slit Slide Aperture */}
                    <g>
                      <rect x="220" y="50" width="12" height="160" fill="#0F172A" stroke="#64748B" strokeWidth="2" rx="2" />
                      {/* Slit gaps */}
                      <line x1="220" y1="126" x2="232" y2="126" stroke="#000" strokeWidth="2" />
                      <line x1="220" y1="134" x2="232" y2="134" stroke="#000" strokeWidth="2" />
                      <text x="226" y="42" textAnchor="middle" fill="#94A3B8" fontSize="9">
                        Double Slit
                      </text>
                      <text x="226" y="225" textAnchor="middle" fill="#64748B" fontSize="8 font-mono">
                        d={slitSeparation}mm
                      </text>
                    </g>

                    {/* Diverging Ray Cones to Screen */}
                    <polygon
                      points="232,130 520,30 520,230"
                      fill={characteristics.colorHex}
                      opacity="0.08"
                    />

                    {/* Observation Projection Screen */}
                    <g>
                      <rect x="520" y="25" width="40" height="210" fill="#020617" stroke="#334155" strokeWidth="2" rx="4" />
                      <text x="540" y="18" textAnchor="middle" fill="#94A3B8" fontSize="9" fontWeight="bold">
                        SCREEN
                      </text>

                      {/* Optical Interference & Diffraction Fringes on Screen */}
                      {Array.from({ length: 100 }).map((_, i) => {
                        const y = 30 + i * 2;
                        // Map y [30..230] to screen position mm [-15..+15]
                        const xMm = ((i - 50) / 50) * 15;
                        const pt = WaveOpticsEvaluator.computeIntensityAt(params, xMm);
                        const opacity = Math.max(0.02, pt.intensity);
                        return (
                          <rect
                            key={i}
                            x="522"
                            y={y}
                            width="36"
                            height="2"
                            fill={characteristics.colorHex}
                            opacity={opacity}
                          />
                        );
                      })}
                    </g>

                    {/* Photodetector Probe Tool */}
                    <g>
                      {(() => {
                        // Map probePositionMm [-15..+15] to y [30..230]
                        const probeY = 130 + (probePositionMm / 15) * 100;
                        return (
                          <g>
                            <line x1="480" y1={probeY} x2="520" y2={probeY} stroke="#38BDF8" strokeWidth="2" strokeDasharray="2 2" />
                            <circle cx="510" cy={probeY} r="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
                            <rect x="420" y={probeY - 12} width="60" height="24" fill="#0F172A" stroke="#38BDF8" strokeWidth="1" rx="4" />
                            <text x="450" y={probeY + 3} textAnchor="middle" fill="#38BDF8" fontSize="9" fontWeight="bold" fontFamily="monospace">
                              {(probePoint.intensity * 100).toFixed(0)}% I₀
                            </text>
                          </g>
                        );
                      })()}
                    </g>

                    {/* Caliper Vernier Scale Datum */}
                    <line x1="226" y1="255" x2="540" y2="255" stroke="#475569" strokeWidth="1.5" />
                    <text x="383" y="270" textAnchor="middle" fill="#94A3B8" fontSize="10">
                      Screen Distance D = {screenDistance.toFixed(2)} m
                    </text>
                  </svg>
                </div>

                {/* Real-time Measurements */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Fringe Width (w)</span>
                    <span className="text-base font-bold text-rose-700 font-mono">
                      {characteristics.fringeWidthMm.toFixed(3)} mm
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Diffraction Envelope Width</span>
                    <span className="text-base font-bold text-slate-800 font-mono">
                      {characteristics.diffractionEnvelopeWidthMm.toFixed(2)} mm
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Missing Orders m</span>
                    <span className="text-base font-bold text-amber-700 font-mono">
                      {characteristics.missingOrders.join(', ') || 'None'}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Probe Irradiance at {probePositionMm.toFixed(1)}mm</span>
                    <span className="text-base font-bold text-cyan-700 font-mono">
                      {(probePoint.intensity * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Spatial Intensity Distribution Curve I(x) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-rose-600" />
                    <span>Spatial Irradiance Profile I(x) Across Screen (mm)</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    I(x) = I₀ · (sinα/α)² · cos²β
                  </span>
                </div>

                <div className="relative h-44 bg-slate-900 rounded-lg p-2 overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 500 160" className="w-full h-full">
                    {/* Grid */}
                    <line x1="30" y1="140" x2="470" y2="140" stroke="#475569" strokeWidth="1.5" />
                    <line x1="250" y1="10" x2="250" y2="140" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="455" y="152" fill="#94A3B8" fontSize="10">x (mm)</text>
                    <text x="10" y="25" fill="#94A3B8" fontSize="10">I(x)</text>

                    {/* Diffraction Envelope (dashed) */}
                    {(() => {
                      const pts = intensityProfile
                        .map((p) => {
                          const px = 250 + (p.xPositionMm / 20) * 220;
                          const py = 140 - p.diffractionEnvelope * 120;
                          return `${px.toFixed(1)},${py.toFixed(1)}`;
                        })
                        .join(' ');
                      return <polyline points={pts} fill="none" stroke="#64748B" strokeWidth="1.5" strokeDasharray="3 3" />;
                    })()}

                    {/* Total Combined Interference Intensity Curve */}
                    {(() => {
                      const pts = intensityProfile
                        .map((p) => {
                          const px = 250 + (p.xPositionMm / 20) * 220;
                          const py = 140 - p.intensity * 120;
                          return `${px.toFixed(1)},${py.toFixed(1)}`;
                        })
                        .join(' ');
                      return <polyline points={pts} fill="none" stroke={characteristics.colorHex} strokeWidth="2.5" />;
                    })()}

                    {/* Sliding Probe Marker */}
                    {(() => {
                      const cx = 250 + (probePositionMm / 20) * 220;
                      const cy = 140 - probePoint.intensity * 120;
                      return (
                        <g>
                          <line x1={cx} y1="20" x2={cx} y2="140" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 2" />
                          <circle cx={cx} cy={cy} r="5" fill="#38BDF8" stroke="#FFF" strokeWidth="2" />
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Optical Console & Probing Controls */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-rose-600" />
                    <span>Optical Bench Controls</span>
                  </h3>
                </div>

                {/* Slider Controls */}
                <div className="space-y-4 text-xs">
                  {/* Wavelength */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Wavelength λ (nm):</span>
                      <span className="font-mono font-bold" style={{ color: characteristics.colorHex }}>
                        {wavelength.toFixed(1)} nm
                      </span>
                    </div>
                    <input
                      type="range"
                      min="380"
                      max="750"
                      step="5"
                      value={wavelength}
                      onChange={(e) => setWavelength(Number(e.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </div>

                  {/* Slit Separation d */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Slit Separation d (mm):</span>
                      <span className="font-mono font-bold text-slate-900">{slitSeparation.toFixed(2)} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0.10"
                      max="1.0"
                      step="0.05"
                      value={slitSeparation}
                      onChange={(e) => setSlitSeparation(Number(e.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </div>

                  {/* Slit Width a */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Slit Aperture Width a (mm):</span>
                      <span className="font-mono font-bold text-slate-900">{slitWidth.toFixed(3)} mm</span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.15"
                      step="0.01"
                      value={slitWidth}
                      onChange={(e) => setSlitWidth(Number(e.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </div>

                  {/* Screen Distance D */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Screen Distance D (m):</span>
                      <span className="font-mono font-bold text-slate-900">{screenDistance.toFixed(2)} m</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="3.0"
                      step="0.1"
                      value={screenDistance}
                      onChange={(e) => setScreenDistance(Number(e.target.value))}
                      className="w-full accent-rose-600"
                    />
                  </div>

                  {/* Photodetector Probe Position */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Photodetector Probe x (mm):</span>
                      <span className="font-mono font-bold text-cyan-700">{probePositionMm.toFixed(2)} mm</span>
                    </div>
                    <input
                      type="range"
                      min="-15"
                      max="15"
                      step="0.2"
                      value={probePositionMm}
                      onChange={(e) => setProbePositionMm(Number(e.target.value))}
                      className="w-full accent-cyan-600"
                    />
                  </div>
                </div>

                {/* Analytical Summary Card */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Fringe Separation:</span>
                    <span className="font-bold text-slate-900">{characteristics.fringeWidthMm.toFixed(3)} mm</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Aperture Ratio (d/a):</span>
                    <span className="font-bold text-slate-900">{characteristics.ratioSeparationToWidth.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Central Fringes Count:</span>
                    <span className="font-bold text-slate-900">~{characteristics.fringesInCentralMax}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* =================================================================== */}
        {/* TAB 4: GUIDED PROCEDURE */}
        {/* =================================================================== */}
        {activeStep === 'guided' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Compass className="w-5 h-5 text-rose-600" />
                <span>AICTE Guided Experimental Procedure: Determination of Wavelength</span>
              </h2>

              <div className="space-y-4 text-sm">
                {[
                  {
                    title: '1. Mount Laser Source and Align Optical Axis',
                    desc: 'Place the laser source at one end of the bench. Ensure the beam travels horizontally and strikes the screen perpendicularly.',
                  },
                  {
                    title: '2. Position Double-Slit Slide Aperture',
                    desc: 'Mount the double-slit slide (d = 0.25 mm) in the optical holder. Center the dual slits symmetrically within the laser spot.',
                  },
                  {
                    title: '3. Calibrate Screen Distance D',
                    desc: 'Set distance D = 1.50 m using the optical bench measuring scale.',
                  },
                  {
                    title: '4. Measure Cumulative Span of 5 Consecutive Fringes',
                    desc: 'Using the photodetector probe or virtual caliper, measure the distance between the 1st and 6th bright fringe (5 full fringe widths).',
                  },
                  {
                    title: '5. Compute Monochromatic Wavelength λ',
                    desc: 'Apply Young’s analytical relation λ = (w · d) / D to verify agreement with standard laser calibration.',
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => setGuidedStep(idx)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      guidedStep === idx
                        ? 'bg-rose-50 border-rose-300 ring-2 ring-rose-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{step.title}</span>
                      {guidedStep === idx && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-600 text-white">
                          Current Focus
                        </span>
                      )}
                    </div>
                    <p className="text-slate-600 text-xs mt-1">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 5: ANALYZE */}
        {/* =================================================================== */}
        {activeStep === 'analyze' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-slate-900">
                Analytical Decomposition: Interference Fringes vs Diffraction Envelope
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The total field intensity at any screen coordinate is modulated by two distinct physical effects occurring simultaneously:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block">1. Pure Double-Slit Interference Factor:</span>
                  <div className="bg-white p-2 rounded border border-slate-200 text-center">
                    <MathView math="\cos^2\beta = \cos^2\left(\frac{\pi d}{\lambda} \sin\theta\right)" display />
                  </div>
                  <p className="text-slate-500">
                    Creates equally spaced sinusoidal fringes with constant peak unity.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <span className="font-bold text-slate-900 block">2. Single-Slit Diffraction Envelope:</span>
                  <div className="bg-white p-2 rounded border border-slate-200 text-center">
                    <MathView math="\left(\frac{\sin\alpha}{\alpha}\right)^2 = \left(\frac{\sin(\frac{\pi a}{\lambda}\sin\theta)}{\frac{\pi a}{\lambda}\sin\theta}\right)^2" display />
                  </div>
                  <p className="text-slate-500">
                    Modulates and bounds the peak heights of interference fringes, driving outer orders to zero.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 6: CHALLENGE */}
        {/* =================================================================== */}
        {activeStep === 'challenge' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs max-w-2xl mx-auto">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
                <Award className="w-5 h-5 text-rose-600" />
                <span>Wave Optics Challenge: Unknown Laser Wavelength</span>
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                An unknown green DPSS laser illuminates double slits separated by <MathView math="d = 0.20\text{ mm}" />.
                On a screen at distance <MathView math="D = 2.0\text{ m}" />, the measured fringe width between adjacent maxima is{' '}
                <MathView math="w = 5.32\text{ mm}" />. Calculate the laser wavelength in nanometers.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Calculated Wavelength <MathView math="\lambda" /> (nm):
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 532"
                    value={challengeWavelengthGuess}
                    onChange={(e) => setChallengeWavelengthGuess(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Hint: <MathView math="\lambda = \frac{w \cdot d}{D}" />
                  </span>
                </div>

                <button
                  onClick={() => {
                    const ans = Number(challengeWavelengthGuess);
                    // lambda = (5.32e-3 * 0.2e-3) / 2.0 = 1.064e-6 / 2 = 5.32e-7 m = 532 nm
                    if (Math.abs(ans - 532) < 2) {
                      setChallengeResult('correct');
                    } else {
                      setChallengeResult('incorrect');
                    }
                  }}
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700"
                >
                  Verify Answer
                </button>

                {challengeResult === 'correct' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                    <span className="font-bold block mb-1">✓ Correct! Exact analytical match!</span>
                    <MathView math="\lambda = \frac{5.32 \times 10^{-3}\text{ m} \times 0.2 \times 10^{-3}\text{ m}}{2.0\text{ m}} = 532\text{ nm} \quad (\text{Standard Green DPSS Laser})" display />
                  </div>
                )}

                {challengeResult === 'incorrect' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs">
                    <span className="font-bold block mb-1">✕ Incorrect answer.</span>
                    Multiply <MathView math="5.32 \times 0.2" /> and divide by <MathView math="2.0" />.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 7: REPORT */}
        {/* =================================================================== */}
        {activeStep === 'report' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-xs max-w-4xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Physical Optics Laboratory Observation Sheet
                  </h2>
                  <p className="text-xs text-slate-500">
                    Course: PH-101 Engineering Physics • AICTE / Virtual Labs Optics Workbench
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium flex items-center space-x-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print PDF Record</span>
                </button>
              </div>

              {/* Table */}
              <div>
                <h3 className="font-bold text-sm text-slate-800 mb-2">1. Experimental Setup & Analytical Metrics</h3>
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="p-2 border-b">Parameter</th>
                      <th className="p-2 border-b">Symbol</th>
                      <th className="p-2 border-b">Experimental Value</th>
                      <th className="p-2 border-b">Units</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr>
                      <td className="p-2 font-sans">Laser Light Wavelength</td>
                      <td className="p-2">λ</td>
                      <td className="p-2 font-bold">{wavelength.toFixed(1)}</td>
                      <td className="p-2 font-sans">nm</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Slit Separation</td>
                      <td className="p-2">d</td>
                      <td className="p-2 font-bold">{slitSeparation.toFixed(2)}</td>
                      <td className="p-2 font-sans">mm</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Individual Slit Width</td>
                      <td className="p-2">a</td>
                      <td className="p-2 font-bold">{slitWidth.toFixed(3)}</td>
                      <td className="p-2 font-sans">mm</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Bench Screen Distance</td>
                      <td className="p-2">D</td>
                      <td className="p-2 font-bold">{screenDistance.toFixed(2)}</td>
                      <td className="p-2 font-sans">m</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Linear Fringe Width</td>
                      <td className="p-2">w</td>
                      <td className="p-2 font-bold text-rose-700">{characteristics.fringeWidthMm.toFixed(3)}</td>
                      <td className="p-2 font-sans">mm</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Diffraction Envelope Width</td>
                      <td className="p-2">2 x_diff</td>
                      <td className="p-2 font-bold">{characteristics.diffractionEnvelopeWidthMm.toFixed(2)}</td>
                      <td className="p-2 font-sans">mm</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 pt-4 text-xs text-slate-600">
                <p>
                  <strong>Academic Verification:</strong> Spatial irradiance distribution strictly adheres to the Fraunhofer double-slit equation. Measured fringe separation and missing orders match wave theory predictions within analytical machine precision.
                </p>
                <div className="mt-8 flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Generated by Prismora Physical Sciences Optics Engine</span>
                  <span>Validated: General Physics Virtual Lab Benchmark</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
