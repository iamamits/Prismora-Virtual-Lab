/**
 * Prismora Chemical Engineering Virtual Laboratory
 * Continuous Binary Fractional Distillation Column: McCabe-Thiele Method
 *
 * Course Code: CH-401 (Mass Transfer & Separation Processes)
 * Benchmark Institutions: IIT Roorkee & IIT Bombay
 * Pedagogical Lifecycle: Understand -> Predict -> Explore -> Guided -> Analyze -> Challenge -> Report
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  solveMcCabeThiele,
  DEFAULT_DISTILLATION_PARAMS,
  type DistillationParameters,
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

export default function DistillationPage() {
  const [activeStep, setActiveStep] = useState<WorkflowStep>('explore');

  // Distillation Parameters
  const [alpha, setAlpha] = useState<number>(2.5);
  const [xF, setXF] = useState<number>(0.45);
  const [xD, setXD] = useState<number>(0.95);
  const [xB, setXB] = useState<number>(0.05);
  const [refluxRatio, setRefluxRatio] = useState<number>(2.2);
  const [feedQuality, setFeedQuality] = useState<number>(1.0); // 1 = Saturated liquid

  // Hypothesis / Prediction State
  const [predStages, setPredStages] = useState('');
  const [predRmin, setPredRmin] = useState('');
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);

  // Guided Procedure State
  const [guidedStep, setGuidedStep] = useState(1);
  const [completedGuidedSteps, setCompletedGuidedSteps] = useState<number[]>([]);

  // Challenge State
  const [challengeTargetR] = useState<number>(1.8);
  const [challengeAnswerStages, setChallengeAnswerStages] = useState('');
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  // Solve McCabe-Thiele model
  const analysisResult = useMemo(() => {
    return solveMcCabeThiele({
      relativeVolatility: alpha,
      feedComposition: xF,
      distillatePurity: xD,
      bottomsPurity: xB,
      refluxRatio,
      feedQuality,
    });
  }, [alpha, xF, xD, xB, refluxRatio, feedQuality]);

  const verifyCurrentGuidedStep = () => {
    if (!completedGuidedSteps.includes(guidedStep)) {
      setCompletedGuidedSteps([...completedGuidedSteps, guidedStep]);
    }
    if (guidedStep < 5) {
      setGuidedStep(guidedStep + 1);
    }
  };

  const submitChallenge = () => {
    const tempRes = solveMcCabeThiele({
      relativeVolatility: 2.5,
      feedComposition: 0.45,
      distillatePurity: 0.95,
      bottomsPurity: 0.05,
      refluxRatio: challengeTargetR,
      feedQuality: 1.0,
    });
    const userVal = parseInt(challengeAnswerStages);

    if (Math.abs(userVal - tempRes.numberOfStages) <= 1) {
      setChallengeScore((prev) => prev + 50);
      setChallengeFeedback(`Correct! Exact number of stages is ${tempRes.numberOfStages} (+50 XP).`);
    } else {
      setChallengeFeedback(`Incorrect. Computed ${userVal} stages, but exact is ${tempRes.numberOfStages}.`);
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
              Chemical Engineering
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <h1 className="font-bold text-emerald-700 text-xs sm:text-sm">McCabe-Thiele Binary Distillation</h1>
          </nav>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 hidden sm:inline">
            CH-401
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
                  isActive ? 'text-emerald-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeDistillTab"
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
          <BugReportModal simulationId="chemical-distillation-mccabe" moduleName="McCabe-Thiele Distillation Lab" />
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
                <div className="flex items-center gap-2 text-emerald-600">
                  <FlaskConical className="w-5 h-5" />
                  <h1 className="text-xl font-bold text-zinc-900">
                    Fractional Distillation Column & McCabe-Thiele Method
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Fractional distillation separates binary liquid mixtures based on differences in boiling points (relative volatility <MathView math="\alpha" />). The graphical McCabe-Thiele method assumes constant molar overflow (CMO) to determine the exact number of theoretical equilibrium stages required for a target product purity.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-600" />
                      Operating Lines (ROL & SOL)
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Material balances across the rectifying and stripping sections generate two straight operating lines:
                    </p>
                    <div className="bg-white p-2.5 rounded border border-zinc-200 text-center font-mono text-xs">
                      <MathView math="y = \frac{R}{R + 1} x + \frac{x_D}{R + 1} \quad (\text{Rectifying})" display />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-blue-600" />
                      Feed Condition (q-Line)
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Thermal quality <MathView math="q" /> represents the moles of liquid added to the stripping section per mole of feed:
                    </p>
                    <div className="bg-white p-2.5 rounded border border-zinc-200 text-center font-mono text-xs">
                      <MathView math="y = \frac{q}{q - 1} x - \frac{x_F}{q - 1} \quad (q = 1 \implies \text{Saturated Liquid})" display />
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
                <div className="flex items-center gap-2 text-emerald-600">
                  <Lightbulb className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-zinc-900">Pre-Lab Hypothesis & Prediction</h2>
                </div>
                <p className="text-xs text-zinc-600">
                  Given a Benzene-Toluene mixture (<MathView math="\alpha = 2.5" />) with <MathView math="x_F = 0.45, x_D = 0.95, x_B = 0.05" /> and reflux ratio <MathView math="R = 2.2" />, predict the column separation metrics:
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Predicted Minimum Reflux Ratio R_min:
                    </label>
                    <input
                      type="number"
                      value={predRmin}
                      onChange={(e) => setPredRmin(e.target.value)}
                      placeholder="e.g. 1.15"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Predicted Number of Theoretical Stages:
                    </label>
                    <input
                      type="number"
                      value={predStages}
                      onChange={(e) => setPredStages(e.target.value)}
                      placeholder="e.g. 8"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <button
                    onClick={() => setPredictionSubmitted(true)}
                    disabled={!predRmin || !predStages}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 disabled:text-zinc-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-xs"
                  >
                    Submit Hypothesis & Compare
                  </button>
                </div>

                {predictionSubmitted && (
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70 space-y-2 text-xs">
                    <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Analytical Comparison:
                    </span>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-lg border border-emerald-100">
                        <span className="text-zinc-600 block">Minimum Reflux (R_min):</span>
                        <span className="font-mono font-bold text-zinc-900">Predicted: {predRmin}</span>
                        <span className="block font-mono text-emerald-700 font-bold mt-0.5">
                          Exact: {analysisResult.minimumRefluxRatio}
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-emerald-100">
                        <span className="text-zinc-600 block">Theoretical Trays:</span>
                        <span className="font-mono font-bold text-zinc-900">Predicted: {predStages}</span>
                        <span className="block font-mono text-emerald-700 font-bold mt-0.5">
                          Exact: {analysisResult.numberOfStages} Trays
                        </span>
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
              {/* Left 2 Cols: McCabe-Thiele Diagram & Column Graphic */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      <div>
                        <h2 className="font-bold text-zinc-900 text-sm sm:text-base">
                          MCCABE-THIELE BINARY EQUILIBRIUM DIAGRAM
                        </h2>
                        <span className="text-[11px] text-zinc-500">
                          {analysisResult.numberOfStages} Theoretical Stages | Optimal Feed Tray #{analysisResult.optimalFeedStage}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                      R / R_min = {(refluxRatio / analysisResult.minimumRefluxRatio).toFixed(2)}x
                    </span>
                  </div>

                  {/* SVG McCabe Thiele Plot */}
                  <div className="w-full aspect-16/10 bg-slate-50 border border-zinc-200 rounded-lg relative overflow-hidden flex items-center justify-center p-3">
                    <svg viewBox="-0.1 -0.1 1.2 1.2" className="w-full h-full text-zinc-800">
                      {/* Grid Box & y = x Diagonal */}
                      <rect x="0" y="0" width="1" height="1" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.005" />
                      <line x1="0" y1="1" x2="1" y2="0" stroke="#94a3b8" strokeWidth="0.006" strokeDasharray="0.02 0.02" />

                      {/* VLE Equilibrium Curve */}
                      <polyline
                        fill="none"
                        stroke="#059669"
                        strokeWidth="0.008"
                        points={analysisResult.vlePoints.map((p) => `${p.x},${1 - p.y}`).join(' ')}
                      />

                      {/* Q-Line */}
                      <polyline
                        fill="none"
                        stroke="#8b5cf6"
                        strokeWidth="0.008"
                        points={analysisResult.qLinePoints.map((p) => `${p.x},${1 - p.y}`).join(' ')}
                      />

                      {/* Rectifying Operating Line (ROL) */}
                      <polyline
                        fill="none"
                        stroke="#2563eb"
                        strokeWidth="0.008"
                        points={analysisResult.rolPoints.map((p) => `${p.x},${1 - p.y}`).join(' ')}
                      />

                      {/* Stripping Operating Line (SOL) */}
                      <polyline
                        fill="none"
                        stroke="#ea580c"
                        strokeWidth="0.008"
                        points={analysisResult.solPoints.map((p) => `${p.x},${1 - p.y}`).join(' ')}
                      />

                      {/* Stepped Trays (Triangles) */}
                      {analysisResult.stages.map((stg) => {
                        // Horizontal: (stg.xEquilibrium, 1 - stg.yVapor) to (stg.xNext, 1 - stg.yNext)
                        const pts = [
                          `${stg.xEquilibrium},${1 - stg.yVapor}`,
                          `${stg.xEquilibrium},${1 - stg.yNext}`,
                        ];
                        return (
                          <g key={stg.stageNumber}>
                            <polyline
                              fill="none"
                              stroke={stg.isFeedStage ? '#dc2626' : '#0f172a'}
                              strokeWidth={stg.isFeedStage ? 0.008 : 0.005}
                              points={pts.join(' ')}
                            />
                            {/* Horizontal segment */}
                            <line
                              x1={stg.xNext}
                              y1={1 - stg.yNext}
                              x2={analysisResult.stages[stg.stageNumber]?.xEquilibrium ?? stg.xNext}
                              y2={1 - stg.yNext}
                              stroke="#0f172a"
                              strokeWidth="0.005"
                            />
                          </g>
                        );
                      })}

                      {/* Pin markers for xD, xF, xB */}
                      <circle cx={xD} cy={1 - xD} r="0.015" className="fill-blue-600" />
                      <circle cx={xF} cy={1 - xF} r="0.015" className="fill-purple-600" />
                      <circle cx={xB} cy={1 - xB} r="0.015" className="fill-orange-600" />
                    </svg>
                  </div>

                  {/* Diagram Legend */}
                  <div className="flex items-center justify-between text-xs pt-1 px-1 text-zinc-600">
                    <div className="flex items-center gap-4 flex-wrap">
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-emerald-600" /> VLE Curve
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-blue-600" /> ROL (Rectifying)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-orange-600" /> SOL (Stripping)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2.5 h-2.5 rounded bg-purple-600" /> q-Line
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column Hardware Simulation Readout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Total Stages</span>
                    <span className="text-base font-mono font-bold text-zinc-900">
                      {analysisResult.numberOfStages} Trays
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Optimal Feed Tray</span>
                    <span className="text-base font-mono font-bold text-rose-600">
                      Tray #{analysisResult.optimalFeedStage}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Minimum Reflux</span>
                    <span className="text-base font-mono font-bold text-emerald-700">
                      R_min = {analysisResult.minimumRefluxRatio}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Fenske Min Trays</span>
                    <span className="text-base font-mono font-bold text-zinc-700">
                      {analysisResult.minimumStagesFenske}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Col: Controls & Composition */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-200 pb-2">
                    Operating Column Controls
                  </h3>

                  {/* Reflux Ratio Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                      <span>Reflux Ratio (R = L/D)</span>
                      <span className="font-mono text-emerald-700">{refluxRatio.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="6.0"
                      step="0.1"
                      value={refluxRatio}
                      onChange={(e) => setRefluxRatio(parseFloat(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                  </div>

                  {/* Feed Quality (q) Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Feed Thermal Quality (q):
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setFeedQuality(1.0)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          feedQuality === 1.0
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        Saturated Liquid (q=1)
                      </button>
                      <button
                        onClick={() => setFeedQuality(0.0)}
                        className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                          feedQuality === 0.0
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                        }`}
                      >
                        Saturated Vapor (q=0)
                      </button>
                    </div>
                  </div>

                  {/* Distillate Purity xD Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                      <span>Distillate Purity (x_D)</span>
                      <span className="font-mono text-blue-600">{(xD * 100).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.85"
                      max="0.99"
                      step="0.01"
                      value={xD}
                      onChange={(e) => setXD(parseFloat(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer"
                    />
                  </div>

                  {/* Bottoms Purity xB Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                      <span>Bottoms Impurity (x_B)</span>
                      <span className="font-mono text-orange-600">{(xB * 100).toFixed(1)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.01"
                      max="0.15"
                      step="0.01"
                      value={xB}
                      onChange={(e) => setXB(parseFloat(e.target.value))}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>

                  {/* Relative Volatility alpha Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                      <span>Relative Volatility (α)</span>
                      <span className="font-mono text-zinc-900">{alpha.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.5"
                      max="4.0"
                      step="0.1"
                      value={alpha}
                      onChange={(e) => setAlpha(parseFloat(e.target.value))}
                      className="w-full accent-zinc-700 cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={() => {
                      setAlpha(2.5);
                      setXF(0.45);
                      setXD(0.95);
                      setXB(0.05);
                      setRefluxRatio(2.2);
                      setFeedQuality(1.0);
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
                  <div className="flex items-center gap-2 text-emerald-600">
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
                      title: 'Step 1: Plot Equilibrium Curve and y = x Diagonal',
                      instructions: 'Plot vapor-liquid equilibrium curve y = (alpha*x)/(1 + (alpha-1)*x) and 45-degree reference line.',
                    },
                    {
                      step: 2,
                      title: 'Step 2: Construct Feed Condition q-Line',
                      instructions: 'Draw q-line through (xF, xF). For saturated liquid feed, the line is strictly vertical.',
                    },
                    {
                      step: 3,
                      title: 'Step 3: Construct Rectifying Operating Line (ROL)',
                      instructions: 'Plot ROL through (xD, xD) with slope R/(R+1) to find intersection (xQ, yQ) with q-line.',
                    },
                    {
                      step: 4,
                      title: 'Step 4: Construct Stripping Operating Line (SOL)',
                      instructions: 'Connect (xB, xB) to the intersection (xQ, yQ).',
                    },
                    {
                      step: 5,
                      title: 'Step 5: Step Off Theoretical Trays',
                      instructions: 'Alternate horizontal steps to VLE and vertical steps to operating lines to determine required trays.',
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`p-4 rounded-xl border transition-all ${
                        guidedStep === s.step
                          ? 'border-emerald-400 bg-emerald-50/50 shadow-xs'
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
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs flex items-center justify-center font-bold">
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
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors shadow-xs"
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
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <h3 className="font-bold text-zinc-900 text-sm">
                      Theoretical Tray Profile & Vapor-Liquid Compositions
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {analysisResult.numberOfStages} Trays
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Tray Number</th>
                        <th className="p-2.5">Liquid Composition (x)</th>
                        <th className="p-2.5">Vapor Composition (y)</th>
                        <th className="p-2.5">Column Section</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono">
                      {analysisResult.stages.map((stg) => (
                        <tr key={stg.stageNumber} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-bold text-zinc-900">Tray #{stg.stageNumber}</td>
                          <td className="p-2.5 text-blue-600">{stg.xEquilibrium}</td>
                          <td className="p-2.5 text-emerald-600">{stg.yVapor}</td>
                          <td className="p-2.5 font-sans">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                stg.isFeedStage
                                  ? 'bg-rose-50 text-rose-700'
                                  : stg.stageNumber < analysisResult.optimalFeedStage
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-orange-50 text-orange-700'
                              }`}
                            >
                              {stg.isFeedStage
                                ? '★ Feed Tray'
                                : stg.stageNumber < analysisResult.optimalFeedStage
                                ? 'Rectifying'
                                : 'Stripping'}
                            </span>
                          </td>
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
                      Distillation Column Optimization Challenge
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Score: {challengeScore} XP
                  </span>
                </div>

                <p className="text-xs text-zinc-600">
                  Given reflux ratio <MathView math="R = 1.8" /> with <MathView math="\alpha = 2.5, x_F = 0.45, x_D = 0.95, x_B = 0.05" />, solve for the total number of theoretical trays required:
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Calculated Number of Trays:
                    </label>
                    <input
                      type="number"
                      value={challengeAnswerStages}
                      onChange={(e) => setChallengeAnswerStages(e.target.value)}
                      placeholder="Enter integer number of trays"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={submitChallenge}
                    disabled={!challengeAnswerStages}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-200 disabled:text-zinc-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-xs"
                  >
                    Submit Tray Count
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
                      CH-401 Mass Transfer Laboratory Practicum Report
                    </h2>
                    <span className="text-xs text-zinc-500">
                      IIT Roorkee & IIT Bombay • Chemical Separation Processes Laboratory
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
                    <span className="text-zinc-500 block text-[10px]">Total Trays</span>
                    <span className="font-bold text-zinc-900">{analysisResult.numberOfStages}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Feed Tray</span>
                    <span className="font-bold text-rose-600">#{analysisResult.optimalFeedStage}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">R_min</span>
                    <span className="font-bold text-emerald-700">{analysisResult.minimumRefluxRatio}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Fenske Min</span>
                    <span className="font-bold text-zinc-900">{analysisResult.minimumStagesFenske}</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-600 space-y-2">
                  <h4 className="font-bold text-zinc-900">Laboratory Conclusions:</h4>
                  <p>
                    1. Operating at reflux ratio R = {refluxRatio} satisfies the operational inequality <MathView math="R > R_{min}" />, ensuring separation without column pinch.
                  </p>
                  <p>
                    2. The stepping analysis reveals {analysisResult.numberOfStages} theoretical trays are needed to achieve distillate purity xD = {xD} and bottoms purity xB = {xB}.
                  </p>
                  <p>
                    3. Optimum feed introduction occurs at Tray #{analysisResult.optimalFeedStage}, where rectifying and stripping operating lines intersect the feed condition line.
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
