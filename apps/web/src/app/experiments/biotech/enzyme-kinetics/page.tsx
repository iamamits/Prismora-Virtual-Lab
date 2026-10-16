/**
 * Prismora Biotechnology & Bioengineering Virtual Laboratory
 * Enzyme Kinetics: Michaelis-Menten & Lineweaver-Burk Transformations
 *
 * Course Code: BT-201 (Biochemistry & Enzyme Technology)
 * Benchmark Institutions: IIT Delhi & Amrita Vishwa Vidyapeetham
 * Pedagogical Lifecycle: Understand -> Predict -> Explore -> Guided -> Analyze -> Challenge -> Report
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  solveEnzymeKinetics,
  DEFAULT_ENZYME_PARAMS,
  type InhibitionType,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Compass,
  Download,
  Dna,
  FileText,
  FlaskConical,
  Layers,
  Lightbulb,
  Maximize2,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingUp,
  Wrench,
  Zap,
} from 'lucide-react';

type WorkflowStep = 'understand' | 'predict' | 'explore' | 'guided' | 'analyze' | 'challenge' | 'report';

export default function EnzymeKineticsPage() {
  const [activeStep, setActiveStep] = useState<WorkflowStep>('explore');

  // Enzyme parameters
  const [vMax, setVMax] = useState<number>(120);
  const [kM, setKM] = useState<number>(4.5);
  const [substrate, setSubstrate] = useState<number>(5.0);
  const [inhibitionType, setInhibitionType] = useState<InhibitionType>('none');
  const [inhibitorConc, setInhibitorConc] = useState<number>(2.0);
  const [plotMode, setPlotMode] = useState<'hyperbolic' | 'lineweaver'>('hyperbolic');

  // Hypothesis / Prediction State
  const [predHalfVelocity, setPredHalfVelocity] = useState('');
  const [predApparentKm, setPredApparentKm] = useState('');
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);

  // Guided Procedure State
  const [guidedStep, setGuidedStep] = useState(1);
  const [completedGuidedSteps, setCompletedGuidedSteps] = useState<number[]>([]);

  // Challenge State
  const [challengeTargetSubstrate] = useState<number>(3.5);
  const [challengeAnswerV0, setChallengeAnswerV0] = useState('');
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  // Solve kinetics model
  const kineticsResult = useMemo(() => {
    return solveEnzymeKinetics({
      vMax,
      kM,
      substrateConcentration: substrate,
      inhibitionType,
      inhibitorConcentration: inhibitionType === 'none' ? 0 : inhibitorConc,
      inhibitorConstantKi: 2.0,
    });
  }, [vMax, kM, substrate, inhibitionType, inhibitorConc]);

  const verifyCurrentGuidedStep = () => {
    if (!completedGuidedSteps.includes(guidedStep)) {
      setCompletedGuidedSteps([...completedGuidedSteps, guidedStep]);
    }
    if (guidedStep < 5) {
      setGuidedStep(guidedStep + 1);
    }
  };

  const submitChallenge = () => {
    const tempRes = solveEnzymeKinetics({
      vMax: 120,
      kM: 4.5,
      substrateConcentration: challengeTargetSubstrate,
      inhibitionType: 'none',
      inhibitorConcentration: 0,
      inhibitorConstantKi: 2.0,
    });
    const userVal = parseFloat(challengeAnswerV0);

    if (Math.abs(userVal - tempRes.currentVelocity) < 3.0) {
      setChallengeScore((prev) => prev + 50);
      setChallengeFeedback(`Correct! Exact reaction rate is ${tempRes.currentVelocity} µmol/(L·min) (+50 XP).`);
    } else {
      setChallengeFeedback(`Incorrect. Computed ${userVal}, but exact is ${tempRes.currentVelocity}.`);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100dvh-3.5rem)] w-full bg-[#F8FAFC] text-zinc-900 select-none">
      {/* Top Header & Breadcrumbs */}
      <header className="border-b border-zinc-200 bg-white px-4 sm:px-6 py-2.5 flex items-center justify-between shrink-0 shadow-xs z-30">
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
            <Link href="/library" className="hover:text-zinc-900 transition-colors">
              Library
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/library" className="hover:text-zinc-900 transition-colors">
              Biotechnology
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <h1 className="font-bold text-pink-700 text-xs sm:text-sm">Enzyme Kinetics Studio</h1>
          </nav>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-pink-50 text-pink-800 border border-pink-200 hidden sm:inline">
            BT-201
          </span>
        </div>

        {/* 7-Step Workflow Nav Tabs */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs overflow-x-auto max-w-xl">
          {[
            { id: 'understand', label: '1. Understand', icon: BookOpen },
            { id: 'predict', label: '2. Predict', icon: Lightbulb },
            { id: 'explore', label: '3. Explore', icon: Sliders },
            { id: 'guided', label: '4. Guided Procedure', icon: ClipboardList },
            { id: 'analyze', label: '5. Analyze', icon: TrendingUp },
            { id: 'challenge', label: '6. Challenge', icon: Award },
            { id: 'report', label: '7. Report', icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeStep === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveStep(tab.id as WorkflowStep)}
                className={`relative flex items-center gap-1 px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${
                  isActive ? 'text-pink-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeBiotechTab"
                    className="absolute inset-0 bg-white rounded-md border border-zinc-200 -z-10"
                    transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                  />
                )}
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <BugReportModal simulationId="biotech-enzyme-kinetics" moduleName="Enzyme Kinetics Lab" />
        </div>
      </header>

      {/* Main Workspace Viewport */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
        <AnimatePresence mode="wait">
          {/* ================= STEP 1: UNDERSTAND ================= */}
          {activeStep === 'understand' && (
            <motion.div
              key="understand"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-5xl mx-auto space-y-6"
            >
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-pink-600">
                  <Dna className="w-5 h-5" />
                  <h1 className="text-xl font-bold text-zinc-900">
                    Enzyme Catalytic Kinetics & Michaelis-Menten Dynamics
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Enzymes are biological catalysts that accelerate chemical reactions by stabilizing transition states. The Michaelis-Menten hyperbolic rate equation relates the initial catalytic rate <MathView math="v_0" /> to substrate concentration <MathView math="[S]" /> through maximum velocity <MathView math="V_{\max}" /> and affinity constant <MathView math="K_m" />.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-pink-600" />
                      Michaelis-Menten Rate Law
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      At low substrate concentration (<MathView math="[S] \ll K_m" />), the rate is first-order. At high concentration (<MathView math="[S] \gg K_m" />), active sites saturate at zero-order maximum velocity <MathView math="V_{\max}" />:
                    </p>
                    <div className="bg-white p-2.5 rounded border border-zinc-200 text-center font-mono text-xs">
                      <MathView math="v_0 = \frac{V_{\max} [S]}{K_m + [S]}" display />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      Lineweaver-Burk Double Reciprocal Plot
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Linearizes hyperbolic kinetics to determine exact kinetic constants from linear intercepts:
                    </p>
                    <div className="bg-white p-2.5 rounded border border-zinc-200 text-center font-mono text-xs">
                      <MathView math="\frac{1}{v_0} = \left(\frac{K_m}{V_{\max}}\right) \frac{1}{[S]} + \frac{1}{V_{\max}}" display />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 2: PREDICT ================= */}
          {activeStep === 'predict' && (
            <motion.div
              key="predict"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-2 text-pink-600">
                  <Lightbulb className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-zinc-900">Pre-Lab Hypothesis & Prediction</h2>
                </div>
                <p className="text-xs text-zinc-600">
                  Given an enzyme with <MathView math="V_{\max} = 120\ \mu\text{mol}/(\text{L}\cdot\text{min})" /> and <MathView math="K_m = 4.5\text{ mM}" />, predict the catalytic response:
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Reaction Rate at [S] = Km (µmol/(L·min)):
                    </label>
                    <input
                      type="number"
                      value={predHalfVelocity}
                      onChange={(e) => setPredHalfVelocity(e.target.value)}
                      placeholder="e.g. 60.0"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Apparent Km under Competitive Inhibitor ([I] = 2 mM, Ki = 2 mM):
                    </label>
                    <input
                      type="number"
                      value={predApparentKm}
                      onChange={(e) => setPredApparentKm(e.target.value)}
                      placeholder="e.g. 9.0"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-pink-500"
                    />
                  </div>

                  <button
                    onClick={() => setPredictionSubmitted(true)}
                    disabled={!predHalfVelocity || !predApparentKm}
                    className="w-full bg-pink-600 hover:bg-pink-700 disabled:bg-zinc-200 disabled:text-zinc-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-xs"
                  >
                    Submit Hypothesis & Compare
                  </button>
                </div>

                {predictionSubmitted && (
                  <div className="p-4 rounded-xl border border-pink-200 bg-pink-50/70 space-y-2 text-xs">
                    <span className="font-bold text-pink-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Analytical Verification:
                    </span>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-lg border border-pink-100">
                        <span className="text-zinc-600 block">Rate at [S] = Km:</span>
                        <span className="font-mono font-bold text-zinc-900">Predicted: {predHalfVelocity}</span>
                        <span className="block font-mono text-pink-700 font-bold mt-0.5">Exact: 60.0 µmol/(L·min)</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-pink-100">
                        <span className="text-zinc-600 block">Competitive Km:</span>
                        <span className="font-mono font-bold text-zinc-900">Predicted: {predApparentKm} mM</span>
                        <span className="block font-mono text-pink-700 font-bold mt-0.5">Exact: 9.0 mM</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ================= STEP 3: EXPLORE (INTERACTIVE WORKBENCH) ================= */}
          {activeStep === 'explore' && (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
            >
              {/* Left 2 Cols: Interactive Graph & Cuvette Simulation */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-pink-600" />
                      <div>
                        <h2 className="font-bold text-zinc-900 text-sm sm:text-base">
                          {plotMode === 'hyperbolic'
                            ? 'MICHAELIS-MENTEN HYPERBOLIC VELOCITY CURVE'
                            : 'LINEWEAVER-BURK DOUBLE RECIPROCAL PLOT'}
                        </h2>
                        <span className="text-[11px] text-zinc-500">
                          Current Rate: {kineticsResult.currentVelocity} µmol/(L·min) | Saturation: {(kineticsResult.saturationFraction * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs font-semibold">
                      <button
                        onClick={() => setPlotMode('hyperbolic')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          plotMode === 'hyperbolic' ? 'bg-white text-pink-700 shadow-xs' : 'text-zinc-600'
                        }`}
                      >
                        v₀ vs [S]
                      </button>
                      <button
                        onClick={() => setPlotMode('lineweaver')}
                        className={`px-2.5 py-1 rounded-md transition-all ${
                          plotMode === 'lineweaver' ? 'bg-white text-pink-700 shadow-xs' : 'text-zinc-600'
                        }`}
                      >
                        1/v₀ vs 1/[S]
                      </button>
                    </div>
                  </div>

                  {/* SVG Plot Canvas */}
                  <div className="w-full aspect-16/9 bg-slate-50 border border-zinc-200 rounded-lg relative overflow-hidden flex items-center justify-center p-3">
                    {plotMode === 'hyperbolic' ? (
                      <svg viewBox="0 0 700 350" className="w-full h-full text-zinc-800">
                        {/* Axes */}
                        <line x1="60" y1="300" x2="660" y2="300" stroke="#64748b" strokeWidth="2" />
                        <line x1="60" y1="30" x2="60" y2="300" stroke="#64748b" strokeWidth="2" />

                        {/* Labels */}
                        <text x="360" y="335" textAnchor="middle" className="text-xs font-bold fill-zinc-600">
                          Substrate Concentration [S] (mM)
                        </text>
                        <text x="20" y="165" textAnchor="middle" className="text-xs font-bold fill-zinc-600" transform="rotate(-90 20 165)">
                          Reaction Velocity v₀ (µmol/L·min)
                        </text>

                        {/* Vmax asymptote line */}
                        {(() => {
                          const yVmax = 300 - (kineticsResult.apparentVMax / 160) * 260;
                          return (
                            <>
                              <line x1="60" y1={yVmax} x2="660" y2={yVmax} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth="1.5" />
                              <text x="655" y={yVmax - 6} textAnchor="end" className="text-[10px] font-mono font-bold fill-zinc-500">
                                V_max = {kineticsResult.apparentVMax}
                              </text>
                            </>
                          );
                        })()}

                        {/* Hyperbolic Curve */}
                        {(() => {
                          const points = kineticsResult.curvePoints.map((pt) => {
                            const x = 60 + (pt.s / 30) * 600;
                            const y = 300 - (pt.v / 160) * 260;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          });
                          return (
                            <polyline fill="none" stroke="#db2777" strokeWidth="3" points={points.join(' ')} />
                          );
                        })()}

                        {/* Assay Data Points */}
                        {kineticsResult.dataPoints.map((pt, idx) => {
                          const x = 60 + (pt.substrate / 30) * 600;
                          const y = 300 - (pt.velocity / 160) * 260;
                          return <circle key={idx} cx={x} cy={y} r="4" className="fill-white stroke-pink-600 stroke-2" />;
                        })}

                        {/* Current Operating Point */}
                        {(() => {
                          const cx = 60 + (substrate / 30) * 600;
                          const cy = 300 - (kineticsResult.currentVelocity / 160) * 260;
                          return (
                            <g>
                              <circle cx={cx} cy={cy} r="6" className="fill-pink-600 stroke-white stroke-2" />
                              <text x={cx + 8} y={cy - 8} className="text-xs font-mono font-bold fill-pink-700">
                                v₀ = {kineticsResult.currentVelocity}
                              </text>
                            </g>
                          );
                        })()}
                      </svg>
                    ) : (
                      <svg viewBox="0 0 700 350" className="w-full h-full text-zinc-800">
                        {/* Lineweaver-Burk Double Reciprocal Coordinates */}
                        <line x1="160" y1="300" x2="660" y2="300" stroke="#64748b" strokeWidth="2" />
                        <line x1="260" y1="30" x2="260" y2="300" stroke="#64748b" strokeWidth="2" />

                        {/* Labels */}
                        <text x="460" y="335" textAnchor="middle" className="text-xs font-bold fill-zinc-600">
                          1 / [S] (mM⁻¹)
                        </text>
                        <text x="210" y="50" textAnchor="middle" className="text-xs font-bold fill-zinc-600">
                          1 / v₀
                        </text>

                        {/* Linear Fit Line */}
                        {(() => {
                          const xInterceptX = 260 + kineticsResult.lineweaverBurkXIntercept * 120;
                          const yInterceptY = 300 - kineticsResult.lineweaverBurkYIntercept * 18000;
                          const sampleX = 260 + 2.0 * 120;
                          const sampleY = 300 - (kineticsResult.lineweaverBurkSlope * 2.0 + kineticsResult.lineweaverBurkYIntercept) * 18000;

                          return (
                            <>
                              <line
                                x1={xInterceptX}
                                y1="300"
                                x2={sampleX}
                                y2={sampleY}
                                stroke="#9333ea"
                                strokeWidth="2.5"
                              />
                              {/* X-intercept dot (-1/Km) */}
                              <circle cx={xInterceptX} cy="300" r="4" className="fill-purple-600" />
                              <text x={xInterceptX} y="318" textAnchor="middle" className="text-[10px] font-mono font-bold fill-purple-600">
                                -1/Km = {kineticsResult.lineweaverBurkXIntercept}
                              </text>
                              {/* Y-intercept dot (1/Vmax) */}
                              <circle cx="260" cy={yInterceptY} r="4" className="fill-purple-600" />
                              <text x="270" y={yInterceptY} className="text-[10px] font-mono font-bold fill-purple-600">
                                1/Vmax
                              </text>
                            </>
                          );
                        })()}
                      </svg>
                    )}
                  </div>
                </div>

                {/* Analytical Readouts */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Current Velocity</span>
                    <span className="text-base font-mono font-bold text-pink-700">
                      {kineticsResult.currentVelocity}
                    </span>
                    <span className="text-[10px] text-zinc-400">µmol/(L·min)</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Apparent V_max</span>
                    <span className="text-base font-mono font-bold text-zinc-900">
                      {kineticsResult.apparentVMax}
                    </span>
                    <span className="text-[10px] text-zinc-400">µmol/(L·min)</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Apparent K_m</span>
                    <span className="text-base font-mono font-bold text-purple-700">
                      {kineticsResult.apparentKM}
                    </span>
                    <span className="text-[10px] text-zinc-400">mM</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Fractional Saturation</span>
                    <span className="text-base font-mono font-bold text-emerald-700">
                      {(kineticsResult.saturationFraction * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Col: Kinetic Controls & Pipette Dispenser */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-200 pb-2">
                    Enzyme & Substrate Parameters
                  </h3>

                  {/* Substrate Concentration Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                      <span>Substrate Concentration [S]</span>
                      <span className="font-mono text-pink-700">{substrate.toFixed(1)} mM</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="25.0"
                      step="0.5"
                      value={substrate}
                      onChange={(e) => setSubstrate(parseFloat(e.target.value))}
                      className="w-full accent-pink-600 cursor-pointer"
                    />
                  </div>

                  {/* Inhibition Mechanism Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Inhibition Mechanism:
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setInhibitionType('none')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          inhibitionType === 'none'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        None
                      </button>
                      <button
                        onClick={() => setInhibitionType('competitive')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          inhibitionType === 'competitive'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        Competitive
                      </button>
                      <button
                        onClick={() => setInhibitionType('non_competitive')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          inhibitionType === 'non_competitive'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        Non-Competitive
                      </button>
                      <button
                        onClick={() => setInhibitionType('uncompetitive')}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          inhibitionType === 'uncompetitive'
                            ? 'bg-pink-600 text-white shadow-xs'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        Uncompetitive
                      </button>
                    </div>
                  </div>

                  {/* Inhibitor Concentration Slider */}
                  {inhibitionType !== 'none' && (
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                        <span>Inhibitor Concentration [I]</span>
                        <span className="font-mono text-purple-700">{inhibitorConc.toFixed(1)} mM</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="8.0"
                        step="0.5"
                        value={inhibitorConc}
                        onChange={(e) => setInhibitorConc(parseFloat(e.target.value))}
                        className="w-full accent-purple-600 cursor-pointer"
                      />
                    </div>
                  )}

                  {/* Vmax Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                      <span>Baseline V_max</span>
                      <span className="font-mono text-zinc-900">{vMax} µmol/(L·min)</span>
                    </div>
                    <input
                      type="range"
                      min="50"
                      max="200"
                      step="5"
                      value={vMax}
                      onChange={(e) => setVMax(parseInt(e.target.value))}
                      className="w-full accent-zinc-700 cursor-pointer"
                    />
                  </div>

                  {/* Km Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                      <span>Michaelis Constant (K_m)</span>
                      <span className="font-mono text-zinc-900">{kM.toFixed(1)} mM</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="10.0"
                      step="0.5"
                      value={kM}
                      onChange={(e) => setKM(parseFloat(e.target.value))}
                      className="w-full accent-zinc-700 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setVMax(120);
                      setKM(4.5);
                      setSubstrate(5.0);
                      setInhibitionType('none');
                      setInhibitorConc(2.0);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Baseline Parameters
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 4: GUIDED PROCEDURE ================= */}
          {activeStep === 'guided' && (
            <motion.div
              key="guided"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <div className="flex items-center gap-2 text-pink-600">
                    <ClipboardList className="w-5 h-5" />
                    <h2 className="text-lg font-bold text-zinc-900">
                      Standard Laboratory Practicum Checkpoints
                    </h2>
                  </div>
                  <span className="text-xs font-bold text-zinc-500">Step {guidedStep} of 5</span>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      step: 1,
                      title: 'Step 1: Perform Initial Rate Assay at Varied [S]',
                      instructions: 'Pipette substrate serial dilutions (0.5 to 25 mM) and measure spectrophotometer initial velocity v0.',
                    },
                    {
                      step: 2,
                      title: 'Step 2: Fit Hyperbolic Michaelis-Menten Curve',
                      instructions: 'Plot v0 vs [S] to observe saturation behavior approaching asymptotic Vmax.',
                    },
                    {
                      step: 3,
                      title: 'Step 3: Construct Lineweaver-Burk Double Reciprocal Plot',
                      instructions: 'Plot 1/v0 against 1/[S] to determine -1/Km from x-intercept and 1/Vmax from y-intercept.',
                    },
                    {
                      step: 4,
                      title: 'Step 4: Assay in the Presence of Competitive Inhibitor',
                      instructions: 'Observe shift in x-intercept indicating higher apparent Km while y-intercept (Vmax) remains constant.',
                    },
                    {
                      step: 5,
                      title: 'Step 5: Assay in the Presence of Non-Competitive Inhibitor',
                      instructions: 'Observe elevation in y-intercept indicating lower Vmax while x-intercept (Km) remains unchanged.',
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`p-4 rounded-xl border transition-all ${
                        guidedStep === s.step
                          ? 'border-pink-400 bg-pink-50/50 shadow-xs'
                          : completedGuidedSteps.includes(s.step)
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-zinc-200 bg-white opacity-70'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                          {completedGuidedSteps.includes(s.step) ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-pink-100 text-pink-800 text-xs flex items-center justify-center font-bold">
                              {s.step}
                            </span>
                          )}
                          {s.title}
                        </h4>
                      </div>
                      <p className="text-xs text-zinc-600 mb-2">{s.instructions}</p>
                      {guidedStep === s.step && (
                        <button
                          onClick={verifyCurrentGuidedStep}
                          className="bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors shadow-xs"
                        >
                          Verify & Proceed →
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 5: ANALYZE ================= */}
          {activeStep === 'analyze' && (
            <motion.div
              key="analyze"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-6xl mx-auto space-y-6"
            >
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-pink-600" />
                    <h3 className="font-bold text-zinc-900 text-sm">
                      Experimental Spectrophotometric Assay Velocity Matrix
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-pink-700 bg-pink-50 px-2 py-0.5 rounded border border-pink-200">
                    {kineticsResult.dataPoints.length} Assays Tested
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Substrate [S] (mM)</th>
                        <th className="p-2.5">Initial Velocity v₀ (µmol/L·min)</th>
                        <th className="p-2.5">1 / [S] (mM⁻¹)</th>
                        <th className="p-2.5">1 / v₀</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono">
                      {kineticsResult.dataPoints.map((pt, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-bold text-zinc-900">{pt.substrate}</td>
                          <td className="p-2.5 text-pink-600 font-bold">{pt.velocity}</td>
                          <td className="p-2.5 text-zinc-600">{pt.invSubstrate}</td>
                          <td className="p-2.5 text-purple-600">{pt.invVelocity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 6: CHALLENGE ================= */}
          {activeStep === 'challenge' && (
            <motion.div
              key="challenge"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <div className="flex items-center gap-2 text-purple-600">
                    <Award className="w-5 h-5" />
                    <h2 className="text-lg font-bold text-zinc-900">
                      Enzymatic Rate Prediction Challenge
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Score: {challengeScore} XP
                  </span>
                </div>

                <p className="text-xs text-zinc-600">
                  Given <MathView math="V_{\max} = 120\ \mu\text{mol}/(\text{L}\cdot\text{min})" /> and <MathView math="K_m = 4.5\text{ mM}" /> with no inhibitor, calculate initial reaction velocity <MathView math="v_0" /> when substrate concentration is <strong>{challengeTargetSubstrate} mM</strong>:
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Calculated Velocity v₀ (µmol/(L·min)):
                    </label>
                    <input
                      type="number"
                      value={challengeAnswerV0}
                      onChange={(e) => setChallengeAnswerV0(e.target.value)}
                      placeholder="Enter velocity"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={submitChallenge}
                    disabled={!challengeAnswerV0}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-200 disabled:text-zinc-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-xs"
                  >
                    Submit Reaction Rate
                  </button>

                  {challengeFeedback && (
                    <div className="p-3 rounded-lg border border-purple-200 bg-purple-50 text-xs font-semibold text-purple-900">
                      {challengeFeedback}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* ================= STEP 7: REPORT ================= */}
          {activeStep === 'report' && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900">
                      BT-201 Biochemistry Laboratory Practicum Report
                    </h2>
                    <span className="text-xs text-zinc-500">
                      IIT Delhi & Amrita Vishwa Vidyapeetham • Enzyme Kinetics Laboratory
                    </span>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export PDF
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-lg border border-zinc-200 text-xs font-mono">
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Velocity v0</span>
                    <span className="font-bold text-zinc-900">{kineticsResult.currentVelocity}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Apparent Vmax</span>
                    <span className="font-bold text-zinc-900">{kineticsResult.apparentVMax}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Apparent Km</span>
                    <span className="font-bold text-purple-700">{kineticsResult.apparentKM}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Saturation</span>
                    <span className="font-bold text-emerald-700">{(kineticsResult.saturationFraction * 100).toFixed(1)}%</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-600 space-y-2">
                  <h4 className="font-bold text-zinc-900">Laboratory Conclusions:</h4>
                  <p>
                    1. The initial catalytic reaction rate exhibits saturation kinetics adhering to the Michaelis-Menten hyperbolic formulation.
                  </p>
                  <p>
                    2. Linear double reciprocal Lineweaver-Burk plots allow direct derivation of kinetic parameters <MathView math="V_{\max}" /> and <MathView math="K_m" />.
                  </p>
                  <p>
                    3. Competitive inhibitors increase apparent <MathView math="K_m" /> without altering <MathView math="V_{\max}" />, whereas non-competitive inhibitors reduce catalytic velocity <MathView math="V_{\max}" />.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
