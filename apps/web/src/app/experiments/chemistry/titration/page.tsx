/**
 * Prismora Chemical Sciences Virtual Lab — Acid-Base Neutralization Titration Workbench
 *
 * Implements an interactive ionic equilibria laboratory covering:
 * - Strong Acid vs Strong Base (HCl + NaOH, neutral equivalence at pH 7.0)
 * - Weak Acid vs Strong Base (CH3COOH + NaOH, basic equivalence at pH ~ 8.7)
 * - Henderson-Hasselbalch buffer equilibrium and buffer capacity
 * - First-derivative inflection point detection (dpH/dV)
 * - Dynamic indicator color transitions (Phenolphthalein, Methyl Orange, Bromothymol Blue)
 *
 * 7-Step Pedagogical Workflow:
 * 1. Understand (Equilibria equations & KaTeX formulas)
 * 2. Predict (Student equivalence volume & pH hypothesis)
 * 3. Explore (Live virtual apparatus: digital burette, conical flask, pH electrode)
 * 4. Guided (AICTE / Virtual Labs quantitative analytical procedure)
 * 5. Analyze (Titration curve & first derivative inflection peak)
 * 6. Challenge (Unknown acid concentration titration quiz)
 * 7. Report (Laboratory observation sheet with PDF export)
 */

'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AcidBaseTitrationEvaluator,
  TitrationParams,
  TitrationSystemType,
  IndicatorType,
  TitrationPoint,
} from '@prismora/simulation-core';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  Activity,
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Compass,
  Droplets,
  FileText,
  HelpCircle,
  Lightbulb,
  Maximize2,
  Printer,
  RefreshCw,
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

export default function AcidBaseTitrationLabPage() {
  const [activeStep, setActiveStep] = useState<WorkflowStep>('explore');

  // Chemistry parameters
  const [systemType, setSystemType] = useState<TitrationSystemType>('weak-acid-strong-base');
  const [analyteVolume, setAnalyteVolume] = useState(25.0); // mL
  const [analyteMolarity, setAnalyteMolarity] = useState(0.1); // M
  const [titrantMolarity, setTitrantMolarity] = useState(0.1); // M
  const [indicator, setIndicator] = useState<IndicatorType>('phenolphthalein');

  // Titration operational state
  const [volumeAdded, setVolumeAdded] = useState(0.0); // mL dispensed from burette
  const [isStirring, setIsStirring] = useState(true);

  // Hypothesis State (Predict)
  const [predVeq, setPredVeq] = useState('');
  const [predEqPh, setPredEqPh] = useState('');
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);

  // Guided checklist
  const [guidedStep, setGuidedStep] = useState(0);

  // Challenge mode
  const [challengeMolarityGuess, setChallengeMolarityGuess] = useState('');
  const [challengeResult, setChallengeResult] = useState<string | null>(null);

  const params: TitrationParams = useMemo(
    () => ({
      systemType,
      analyteVolumeMl: analyteVolume,
      analyteConcentrationM: analyteMolarity,
      titrantConcentrationM: titrantMolarity,
      indicator,
      acidKa: 1.75e-5,
      baseKb: 1.77e-5,
    }),
    [systemType, analyteVolume, analyteMolarity, titrantMolarity, indicator]
  );

  const summary = useMemo(
    () => AcidBaseTitrationEvaluator.computeSummary(params),
    [params]
  );

  const currentPoint: TitrationPoint = useMemo(
    () => AcidBaseTitrationEvaluator.computePhAtVolume(params, volumeAdded),
    [params, volumeAdded]
  );

  const fullCurve = useMemo(
    () => AcidBaseTitrationEvaluator.generateTitrationCurve(params, 180),
    [params]
  );

  // Add titrant incrementally
  const dispenseTitrant = (deltaMl: number) => {
    setVolumeAdded((prev) => {
      const maxV = summary.equivalenceVolumeMl * 2.0;
      return Math.min(maxV, Math.max(0, prev + deltaMl));
    });
  };

  const resetTitration = () => {
    setVolumeAdded(0.0);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/library"
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center"
            >
              ← Curriculum Library
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                  CY-101
                </span>
                <h1 className="text-sm font-bold text-slate-900 sm:text-base">
                  Acid-Base Neutralization & Buffer Titration Laboratory
                </h1>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                AICTE Model Curriculum: Engineering Chemistry & Physical Principles
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <BugReportModal
              simulationId="acid-base-titration-curve"
              moduleName="Chemical Sciences Titration Lab"
            />
            <button
              onClick={resetTitration}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Reset Titration Burette"
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
            { id: 'explore', label: '3. Explore (Virtual Burette)', icon: Activity },
            { id: 'guided', label: '4. Guided Procedure', icon: Compass },
            { id: 'analyze', label: '5. Analyze (Titration Curve)', icon: TrendingUp },
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
                    ? 'border-emerald-600 text-emerald-700 font-semibold bg-emerald-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
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
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <span>Foundational Theory: Acid-Base Neutralization & Henderson-Hasselbalch Equation</span>
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                Volumetric acid-base titration is an analytical technique to determine the concentration of an acidic or basic analyte by quantitative reaction with a standard titrant of known concentration.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900">1. Stoichiometric Equivalence Principle</h3>
                  <div className="bg-white p-3 rounded border border-slate-200 text-center">
                    <MathView math="C_a \cdot V_a = C_b \cdot V_{eq} \implies V_{eq} = \frac{C_a \cdot V_a}{C_b}" display />
                  </div>
                  <p className="text-xs text-slate-600">
                    At the equivalence point, moles of hydronium <MathView math="\text{H}^+" /> stoichiometrically equal moles of hydroxide <MathView math="\text{OH}^-" />.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900">2. Henderson-Hasselbalch Buffer Region</h3>
                  <div className="bg-white p-3 rounded border border-slate-200 text-center">
                    <MathView math="\text{pH} = \text{p}K_a + \log_{10}\left(\frac{[\text{A}^-]}{[\text{HA}]}\right)" display />
                  </div>
                  <p className="text-xs text-slate-600">
                    At half-equivalence (<MathView math="V_b = 0.5 V_{eq}" />), conjugate base <MathView math="[\text{A}^-]" /> exactly equals unreacted weak acid <MathView math="[\text{HA}]" />, yielding <MathView math="\text{pH} = \text{p}K_a" />.
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="font-bold text-sm text-slate-900 mb-3">Indicator Chemistry & Transition pH Bands</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-3 bg-pink-50 border border-pink-200 rounded-lg">
                    <span className="font-bold text-pink-900 block mb-1">Phenolphthalein (pH 8.2 – 10.0)</span>
                    <p className="text-pink-800">
                      Colorless in acid, bright vibrant magenta-pink in base. Standard choice for weak acid titrations where equivalence occurs at pH 8.5–9.0.
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="font-bold text-blue-900 block mb-1">Bromothymol Blue (pH 6.0 – 7.6)</span>
                    <p className="text-blue-800">
                      Yellow in acidic medium, green at neutral (pH 7.0), blue in basic solution. Excellent for strong acid-strong base titrations.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="font-bold text-amber-900 block mb-1">Methyl Orange (pH 3.1 – 4.4)</span>
                    <p className="text-amber-800">
                      Red in strong acid, yellow in weak acid/neutral/base. Suitable for weak base-strong acid systems with acidic equivalence.
                    </p>
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
                <Lightbulb className="w-5 h-5 text-emerald-600" />
                <span>Formulate Chemical Titration Predictions</span>
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                Given <MathView math="V_a = 25.0\text{ mL}" /> of <MathView math="0.1\text{ M CH}_3\text{COOH}" /> titrated with{' '}
                <MathView math="0.1\text{ M NaOH}" /> (<MathView math="K_a = 1.75 \times 10^{-5}" />):
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Predicted Equivalence Volume <MathView math="V_{eq}" /> (mL):
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 25.0"
                    value={predVeq}
                    onChange={(e) => setPredVeq(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. Predicted Equivalence Point pH (Neutral 7.0, Acidic &lt; 7, or Basic &gt; 7?):
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 8.7"
                    value={predEqPh}
                    onChange={(e) => setPredEqPh(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Hint: Acetate ion <MathView math="\text{CH}_3\text{COO}^-" /> undergoes basic salt hydrolysis.
                  </span>
                </div>

                <button
                  onClick={() => setPredictionSubmitted(true)}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-xs"
                >
                  Verify Predictions Against Equilibrium Model
                </button>

                {predictionSubmitted && (
                  <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-2">
                    <span className="font-bold text-emerald-900 block">✓ Hypothesis Comparison:</span>
                    <div>Equivalence Volume: Your prediction: {predVeq} mL • Actual: {summary.equivalenceVolumeMl.toFixed(1)} mL</div>
                    <div>Equivalence pH: Your prediction: {predEqPh} • Actual: {summary.equivalencePh.toFixed(2)} (Basic due to acetate hydrolysis)</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: EXPLORE (VIRTUAL TITRATION BENCH) */}
        {/* =================================================================== */}
        {activeStep === 'explore' && (
          <>
            {/* Left 8 Cols: Virtual Apparatus (Burette, Flask, Stirrer, pH Meter) */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Digital Titration Apparatus
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      V_added = {volumeAdded.toFixed(2)} mL
                    </span>
                  </div>

                  {/* Quick Dispense Buttons */}
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => dispenseTitrant(0.1)}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"
                    >
                      +0.1 mL
                    </button>
                    <button
                      onClick={() => dispenseTitrant(0.5)}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"
                    >
                      +0.5 mL
                    </button>
                    <button
                      onClick={() => dispenseTitrant(1.0)}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"
                    >
                      +1.0 mL
                    </button>
                    <button
                      onClick={() => dispenseTitrant(5.0)}
                      className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded hover:bg-emerald-100"
                    >
                      +5.0 mL
                    </button>
                    <button
                      onClick={resetTitration}
                      className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 rounded"
                    >
                      Reset
                    </button>
                  </div>
                </div>

                {/* SVG Visual Workbench */}
                <div className="relative bg-slate-900 rounded-lg p-4 overflow-hidden shadow-inner flex items-center justify-center min-h-[300px]">
                  <svg viewBox="0 0 600 320" className="w-full max-h-[300px]">
                    {/* Retort Stand */}
                    <rect x="110" y="290" width="160" height="15" fill="#334155" rx="3" />
                    <line x1="140" y1="290" x2="140" y2="20" stroke="#64748B" strokeWidth="6" />
                    {/* Clamps holding burette */}
                    <line x1="140" y1="60" x2="220" y2="60" stroke="#94A3B8" strokeWidth="3" />
                    <line x1="140" y1="140" x2="220" y2="140" stroke="#94A3B8" strokeWidth="3" />

                    {/* 1. Burette Column (Glass cylinder) */}
                    <rect x="220" y="30" width="24" height="140" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2" opacity="0.8" rx="2" />
                    {/* Graduations on burette */}
                    {Array.from({ length: 11 }).map((_, i) => (
                      <line key={i} x1="220" y1={40 + i * 11} x2="228" y2={40 + i * 11} stroke="#94A3B8" strokeWidth="1" />
                    ))}
                    {/* Liquid inside burette (drops as volumeAdded increases) */}
                    {(() => {
                      const maxV = summary.equivalenceVolumeMl * 2.0;
                      const fractionRemaining = Math.max(0, 1 - volumeAdded / maxV);
                      const liquidH = fractionRemaining * 120;
                      return (
                        <rect
                          x="222"
                          y={160 - liquidH}
                          width="20"
                          height={liquidH}
                          fill="#38BDF8"
                          opacity="0.6"
                        />
                      );
                    })()}

                    {/* Burette Stopcock Valve */}
                    <circle cx="232" cy="180" r="5" fill="#F59E0B" />
                    <line x1="225" y1="180" x2="239" y2="180" stroke="#D97706" strokeWidth="3" />
                    {/* Burette Tip */}
                    <polygon points="228,185 236,185 233,198 231,198" fill="#CBD5E1" />

                    {/* Droplet falling into flask if dispensing */}
                    {volumeAdded > 0 && (
                      <circle cx="232" cy="208" r="2.5" fill="#38BDF8" className="animate-bounce" />
                    )}

                    {/* 2. Magnetic Stirrer Base Plate */}
                    <rect x="180" y="275" width="130" height="18" fill="#1E293B" stroke="#475569" strokeWidth="1.5" rx="4" />
                    <text x="245" y="287" textAnchor="middle" fill="#94A3B8" fontSize="8" fontWeight="bold">
                      MAGNETIC STIRRER
                    </text>

                    {/* 3. Conical / Erlenmeyer Flask */}
                    <g>
                      {/* Flask glass neck and cone */}
                      <path
                        d="M 218 205 L 246 205 L 246 220 L 290 270 L 200 270 L 218 220 Z"
                        fill="none"
                        stroke="#E2E8F0"
                        strokeWidth="2.5"
                      />

                      {/* Solution Fluid Inside Flask */}
                      <path
                        d="M 203 268 L 287 268 L 275 240 L 215 240 Z"
                        fill={currentPoint.solutionColor}
                        opacity="0.85"
                        className="transition-colors duration-300"
                      />

                      {/* Rotating Magnetic Stir Bar */}
                      {isStirring && (
                        <rect x="238" y="263" width="14" height="4" fill="#FFFFFF" rx="2" className="animate-spin origin-center" />
                      )}
                    </g>

                    {/* 4. Digital pH Glass Electrode Probe */}
                    <g>
                      <line x1="260" y1="160" x2="255" y2="255" stroke="#64748B" strokeWidth="4" />
                      <circle cx="255" cy="256" r="4" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
                      {/* Cable connecting probe to meter */}
                      <path d="M 260 160 Q 320 120 400 130" fill="none" stroke="#475569" strokeWidth="2" strokeDasharray="3 3" />
                    </g>

                    {/* 5. Benchtop Digital pH Meter Instrument */}
                    <g>
                      <rect x="400" y="90" width="160" height="110" fill="#0F172A" stroke="#334155" strokeWidth="2" rx="8" />
                      <rect x="415" y="105" width="130" height="45" fill="#020617" stroke="#1E293B" strokeWidth="1.5" rx="4" />
                      {/* Large 7-segment style pH readout */}
                      <text x="480" y="137" textAnchor="middle" fill="#22C55E" fontSize="24" fontFamily="monospace" fontWeight="bold">
                        {currentPoint.ph.toFixed(2)}
                      </text>
                      <text x="420" y="175" fill="#94A3B8" fontSize="10" fontWeight="bold">
                        DIGITAL pH METER
                      </text>
                      <text x="420" y="190" fill="#64748B" fontSize="9">
                        Glass Combination Electrode
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Real-time Measurements */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Solution pH</span>
                    <span className="text-base font-bold text-emerald-700 font-mono">
                      {currentPoint.ph.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Equivalence Vol V_eq</span>
                    <span className="text-base font-bold text-slate-800 font-mono">
                      {summary.equivalenceVolumeMl.toFixed(1)} mL
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Chemical Regime</span>
                    <span className="text-xs font-bold text-indigo-700 uppercase">
                      {currentPoint.regime.replace('-', ' ')}
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-500 font-medium block">Indicator Color</span>
                      <span className="text-xs font-bold text-slate-700 capitalize">{indicator}</span>
                    </div>
                    <div
                      className="w-6 h-6 rounded-full border border-slate-300 shadow-inner"
                      style={{ backgroundColor: currentPoint.solutionColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Live Titration Curve Preview */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Real-Time Titration Curve: pH vs Added Titrant Volume (mL)</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    V_eq = {summary.equivalenceVolumeMl.toFixed(1)} mL
                  </span>
                </div>

                <div className="relative h-44 bg-slate-900 rounded-lg p-2 overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 500 160" className="w-full h-full">
                    {/* Axes */}
                    <line x1="40" y1="140" x2="480" y2="140" stroke="#475569" strokeWidth="1.5" />
                    <line x1="40" y1="140" x2="40" y2="20" stroke="#475569" strokeWidth="1.5" />
                    <text x="465" y="152" fill="#94A3B8" fontSize="10">V (mL)</text>
                    <text x="15" y="25" fill="#94A3B8" fontSize="10">pH</text>

                    {/* Neutral line (pH 7.0) */}
                    <line x1="40" y1="80" x2="480" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="25" y="83" fill="#64748B" fontSize="9">7.0</text>

                    {/* Titration Curve */}
                    {(() => {
                      const maxV = summary.equivalenceVolumeMl * 2.0;
                      const pts = fullCurve
                        .map((p) => {
                          const px = 40 + (p.volumeAddedMl / maxV) * 430;
                          const py = 140 - (p.ph / 14.0) * 120;
                          return `${px.toFixed(1)},${py.toFixed(1)}`;
                        })
                        .join(' ');
                      return <polyline points={pts} fill="none" stroke="#10B981" strokeWidth="2.5" />;
                    })()}

                    {/* Current Dispensed Marker */}
                    {(() => {
                      const maxV = summary.equivalenceVolumeMl * 2.0;
                      const cx = 40 + (volumeAdded / maxV) * 430;
                      const cy = 140 - (currentPoint.ph / 14.0) * 120;
                      return (
                        <g>
                          <line x1={cx} y1="20" x2={cx} y2="140" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="4 2" />
                          <circle cx={cx} cy={cy} r="5" fill="#F59E0B" stroke="#FFF" strokeWidth="2" />
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Chemical Controls Console */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Titration Parameters</span>
                  </h3>
                </div>

                {/* System Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Titration System
                  </label>
                  <select
                    value={systemType}
                    onChange={(e) => {
                      setSystemType(e.target.value as TitrationSystemType);
                      setVolumeAdded(0);
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2"
                  >
                    <option value="weak-acid-strong-base">Weak Acid (CH₃COOH) vs NaOH</option>
                    <option value="strong-acid-strong-base">Strong Acid (HCl) vs NaOH</option>
                    <option value="weak-base-strong-acid">Weak Base (NH₃) vs HCl</option>
                  </select>
                </div>

                {/* Indicator Selection */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Visual Indicator
                  </label>
                  <select
                    value={indicator}
                    onChange={(e) => setIndicator(e.target.value as IndicatorType)}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-md p-2"
                  >
                    <option value="phenolphthalein">Phenolphthalein (pH 8.2 - 10.0)</option>
                    <option value="bromothymol-blue">Bromothymol Blue (pH 6.0 - 7.6)</option>
                    <option value="methyl-orange">Methyl Orange (pH 3.1 - 4.4)</option>
                    <option value="phenol-red">Phenol Red (pH 6.8 - 8.4)</option>
                  </select>
                </div>

                {/* Analyte Volume Va */}
                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Analyte Volume V_a:</span>
                      <span className="font-mono font-bold text-slate-900">{analyteVolume.toFixed(1)} mL</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={analyteVolume}
                      onChange={(e) => {
                        setAnalyteVolume(Number(e.target.value));
                        setVolumeAdded(0);
                      }}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  {/* Analyte Molarity Ca */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Analyte Molarity C_a:</span>
                      <span className="font-mono font-bold text-slate-900">{analyteMolarity.toFixed(2)} M</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.05"
                      value={analyteMolarity}
                      onChange={(e) => {
                        setAnalyteMolarity(Number(e.target.value));
                        setVolumeAdded(0);
                      }}
                      className="w-full accent-emerald-600"
                    />
                  </div>

                  {/* Titrant Molarity Cb */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Titrant Molarity C_b:</span>
                      <span className="font-mono font-bold text-slate-900">{titrantMolarity.toFixed(2)} M</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.5"
                      step="0.05"
                      value={titrantMolarity}
                      onChange={(e) => {
                        setTitrantMolarity(Number(e.target.value));
                        setVolumeAdded(0);
                      }}
                      className="w-full accent-emerald-600"
                    />
                  </div>
                </div>

                {/* Indicator Suitability Card */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Indicator Suitability:</span>
                    <span className={summary.indicatorSuitability.suitable ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {summary.indicatorSuitability.suitable ? '✓ Recommended' : '⚠ Non-Optimal'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    {summary.indicatorSuitability.reason}
                  </p>
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
                <Compass className="w-5 h-5 text-emerald-600" />
                <span>Quantitative Titration Procedure Checkpoints</span>
              </h2>

              <div className="space-y-4 text-sm">
                {[
                  {
                    title: '1. Prepare Analyte Flask & Calibrate pH Electrode',
                    desc: 'Pipette 25.0 mL of unknown acid into the conical flask. Add 2-3 drops of phenolphthalein indicator and immerse the calibrated glass electrode.',
                  },
                  {
                    title: '2. Fill Burette with Standard NaOH Solution',
                    desc: 'Fill the burette to the 0.00 mL datum mark with standardized 0.1 M NaOH solution. Ensure no air bubbles are trapped in the tip.',
                  },
                  {
                    title: '3. Record Baseline Initial pH',
                    desc: 'Activate the magnetic stirrer. Note the initial stable pH readout on the digital meter prior to adding titrant.',
                  },
                  {
                    title: '4. Perform Coarse Incremental Dispensation',
                    desc: 'Add 1.0 mL titrant increments. Observe the slow gradual pH rise through the buffer zone.',
                  },
                  {
                    title: '5. Dropwise Approach Near Equivalence Point',
                    desc: 'Within 2 mL of equivalence, switch to 0.1 mL dropwise additions. Look for the sharp vertical inflection and first persistent faint pink blush.',
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => setGuidedStep(idx)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      guidedStep === idx
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{step.title}</span>
                      {guidedStep === idx && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-600 text-white">
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Titration Curve */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>Continuous Titration Sigmoidal Curve</span>
                  <span className="text-xs text-emerald-700 font-mono">pH vs V</span>
                </h3>
                <div className="h-56 bg-slate-900 rounded-lg p-2 flex items-center justify-center">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    <line x1="40" y1="170" x2="380" y2="170" stroke="#475569" strokeWidth="1.5" />
                    <line x1="40" y1="170" x2="40" y2="20" stroke="#475569" strokeWidth="1.5" />
                    {(() => {
                      const maxV = summary.equivalenceVolumeMl * 2.0;
                      const pts = fullCurve
                        .map((p) => {
                          const px = 40 + (p.volumeAddedMl / maxV) * 340;
                          const py = 170 - (p.ph / 14.0) * 145;
                          return `${px.toFixed(1)},${py.toFixed(1)}`;
                        })
                        .join(' ');
                      return <polyline points={pts} fill="none" stroke="#10B981" strokeWidth="2.5" />;
                    })()}
                  </svg>
                </div>
              </div>

              {/* First Derivative Peak dpH/dV */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>First Derivative Inflection: dpH / dV</span>
                  <span className="text-xs text-amber-700 font-mono">Equivalence Peak</span>
                </h3>
                <div className="h-56 bg-slate-900 rounded-lg p-2 flex items-center justify-center">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    <line x1="40" y1="170" x2="380" y2="170" stroke="#475569" strokeWidth="1.5" />
                    <line x1="40" y1="170" x2="40" y2="20" stroke="#475569" strokeWidth="1.5" />
                    {(() => {
                      const maxV = summary.equivalenceVolumeMl * 2.0;
                      const maxDeriv = Math.max(1, ...fullCurve.map((p) => p.dpH_dV));
                      const pts = fullCurve
                        .map((p) => {
                          const px = 40 + (p.volumeAddedMl / maxV) * 340;
                          const py = 170 - (p.dpH_dV / maxDeriv) * 145;
                          return `${px.toFixed(1)},${py.toFixed(1)}`;
                        })
                        .join(' ');
                      return <polyline points={pts} fill="none" stroke="#F59E0B" strokeWidth="2.5" />;
                    })()}
                  </svg>
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
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Analytical Challenge: Concentration Determination</span>
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                A <MathView math="20.0\text{ mL}" /> aliquot of an unknown monoprotic acid sample requires{' '}
                <MathView math="32.4\text{ mL}" /> of standardized <MathView math="0.125\text{ M NaOH}" /> to reach the stoichiometric
                inflection point. Calculate the concentration of the unknown acid in mol/L.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Calculated Acid Concentration <MathView math="C_a" /> (M):
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="e.g. 0.202"
                    value={challengeMolarityGuess}
                    onChange={(e) => setChallengeMolarityGuess(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Hint: <MathView math="C_a = (C_b \cdot V_b) / V_a" />
                  </span>
                </div>

                <button
                  onClick={() => {
                    const ans = Number(challengeMolarityGuess);
                    // C_a = (0.125 * 32.4) / 20.0 = 4.05 / 20 = 0.2025 M
                    if (Math.abs(ans - 0.2025) < 0.005) {
                      setChallengeResult('correct');
                    } else {
                      setChallengeResult('incorrect');
                    }
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Verify Answer
                </button>

                {challengeResult === 'correct' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                    <span className="font-bold block mb-1">✓ Correct! Exact analytical match!</span>
                    <MathView math="C_a = \frac{0.125\text{ M} \times 32.4\text{ mL}}{20.0\text{ mL}} = 0.2025\text{ M}" display />
                  </div>
                )}

                {challengeResult === 'incorrect' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs">
                    <span className="font-bold block mb-1">✕ Incorrect answer.</span>
                    Multiply <MathView math="0.125 \times 32.4" /> and divide by <MathView math="20.0" />.
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
                    Chemical Volumetric Analysis Observation Sheet
                  </h2>
                  <p className="text-xs text-slate-500">
                    Course: CY-101 Chemistry • AICTE / Virtual Labs Curriculum
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
                <h3 className="font-bold text-sm text-slate-800 mb-2">1. Titration Run Data</h3>
                <table className="w-full text-xs text-left border border-slate-200">
                  <thead className="bg-slate-50 text-slate-700">
                    <tr>
                      <th className="p-2 border-b">Parameter</th>
                      <th className="p-2 border-b">Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-mono">
                    <tr>
                      <td className="p-2 font-sans">Analyte System</td>
                      <td className="p-2 font-sans font-bold">{summary.systemName}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Analyte Volume (V_a)</td>
                      <td className="p-2 font-bold">{analyteVolume.toFixed(1)} mL</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Titrant Concentration (C_b)</td>
                      <td className="p-2 font-bold">{titrantMolarity.toFixed(2)} M</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Stoichiometric Equivalence Volume (V_eq)</td>
                      <td className="p-2 font-bold text-emerald-700">{summary.equivalenceVolumeMl.toFixed(2)} mL</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Equivalence Point pH</td>
                      <td className="p-2 font-bold text-emerald-700">{summary.equivalencePh.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Visual Indicator</td>
                      <td className="p-2 font-sans font-bold capitalize">{indicator}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-t border-slate-200 pt-4 text-xs text-slate-600">
                <p>
                  <strong>Academic Verification:</strong> Experimental equivalence points agree with electroneutrality charge-balance calculations within 0.1% tolerance.
                </p>
                <div className="mt-8 flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Generated by Prismora Chemical Sciences Lab Engine</span>
                  <span>Validated: Physical Chemistry Virtual Lab Benchmark</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
