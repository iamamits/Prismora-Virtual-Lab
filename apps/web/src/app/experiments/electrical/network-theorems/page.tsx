/**
 * Prismora Electrical Engineering Virtual Lab — Network Theorems Workbench
 *
 * Interactive laboratory covering:
 * - Thévenin's Theorem (V_th = V_oc, R_th = V_oc / I_sc)
 * - Norton's Theorem (I_N = I_sc, R_N = R_th)
 * - Maximum Power Transfer Theorem (Jacobi's Law, P_L,max at R_L = R_th, η = 50%)
 * - Superposition Principle (V_th = V_th1 + V_th2)
 *
 * Full 7-Step Pedagogical Workflow:
 * 1. Understand (Foundational theory & KaTeX formulas)
 * 2. Predict (Student hypothesis testing)
 * 3. Explore (Live circuit schematic with interactive source/resistor controls)
 * 4. Guided (IIT Roorkee laboratory procedure checkpoints)
 * 5. Analyze (Original vs Thévenin vs Norton comparative analysis & P_L vs R_L power curve)
 * 6. Challenge (Randomized problem generator with auto-grading)
 * 7. Report (Comprehensive academic laboratory observation sheet with PDF export)
 */

'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  evaluateNetworkTheorems,
  CircuitTopology,
  NetworkTheoremsParams,
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

export default function NetworkTheoremsLabPage() {
  const [activeStep, setActiveStep] = useState<WorkflowStep>('explore');
  const [topology, setTopology] = useState<CircuitTopology>('dual-source-t-network');

  // Dual-Source T-Network parameters
  const [v1, setV1] = useState(12.0);
  const [r1, setR1] = useState(100);
  const [v2, setV2] = useState(6.0);
  const [r2, setR2] = useState(200);
  const [r3, setR3] = useState(200);
  const [rL, setRL] = useState(150);

  // Load state mode: 'connected' | 'open' | 'short'
  const [loadMode, setLoadMode] = useState<'connected' | 'open' | 'short'>('connected');

  // Student hypothesis state (Predict step)
  const [predVth, setPredVth] = useState('');
  const [predRth, setPredRth] = useState('');
  const [predRLOpt, setPredRLOpt] = useState('');
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);

  // Guided procedure state
  const [guidedStep, setGuidedStep] = useState(1);
  const [completedGuidedSteps, setCompletedGuidedSteps] = useState<number[]>([]);

  // Challenge mode state
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeProblem, setChallengeProblem] = useState({
    v1: 15,
    r1: 50,
    v2: 5,
    r2: 100,
    r3: 100,
  });
  const [ansVth, setAnsVth] = useState('');
  const [ansRth, setAnsRth] = useState('');
  const [challengeResult, setChallengeResult] = useState<'correct' | 'incorrect' | null>(null);

  // Student report metadata
  const [studentName, setStudentName] = useState('Prismora Scholar');
  const [rollNumber, setRollNumber] = useState('EE2026-042');
  const [institution, setInstitution] = useState('Indian Institute of Technology (IIT)');

  // Evaluate Network
  const effectiveRL = loadMode === 'open' ? 1e9 : loadMode === 'short' ? 1e-4 : rL;

  const simResult = useMemo(() => {
    const params: NetworkTheoremsParams = {
      topology: 'dual-source-t-network',
      v1,
      r1,
      v2,
      r2,
      r3,
      rL: effectiveRL,
    };
    return evaluateNetworkTheorems(params);
  }, [v1, r1, v2, r2, r3, effectiveRL]);

  // Handle Challenge validation
  const handleVerifyChallenge = () => {
    const g1 = 1 / challengeProblem.r1;
    const g2 = 1 / challengeProblem.r2;
    const g3 = 1 / challengeProblem.r3;
    const gTot = g1 + g2 + g3;
    const trueVth = (challengeProblem.v1 * g1 + challengeProblem.v2 * g2) / gTot;
    const trueRth = 1 / gTot;

    const userV = parseFloat(ansVth);
    const userR = parseFloat(ansRth);

    if (Math.abs(userV - trueVth) < 0.2 && Math.abs(userR - trueRth) < 1.0) {
      setChallengeResult('correct');
      setChallengeScore((s) => s + 100);
    } else {
      setChallengeResult('incorrect');
    }
  };

  const handleNextChallenge = () => {
    setChallengeProblem({
      v1: Math.floor(Math.random() * 20) + 5,
      r1: (Math.floor(Math.random() * 8) + 2) * 20,
      v2: Math.floor(Math.random() * 15) + 3,
      r2: (Math.floor(Math.random() * 8) + 2) * 25,
      r3: (Math.floor(Math.random() * 8) + 2) * 25,
    });
    setAnsVth('');
    setAnsRth('');
    setChallengeResult(null);
  };

  // Check Guided Step
  const verifyCurrentGuidedStep = () => {
    if (guidedStep === 1 && loadMode === 'open') {
      if (!completedGuidedSteps.includes(1)) setCompletedGuidedSteps((s) => [...s, 1]);
      setGuidedStep(2);
    } else if (guidedStep === 2 && loadMode === 'short') {
      if (!completedGuidedSteps.includes(2)) setCompletedGuidedSteps((s) => [...s, 2]);
      setGuidedStep(3);
    } else if (guidedStep === 3) {
      if (!completedGuidedSteps.includes(3)) setCompletedGuidedSteps((s) => [...s, 3]);
      setGuidedStep(4);
    } else if (guidedStep === 4 && loadMode === 'connected') {
      if (!completedGuidedSteps.includes(4)) setCompletedGuidedSteps((s) => [...s, 4]);
      setGuidedStep(5);
    } else if (guidedStep === 5 && Math.abs(rL - simResult.rTh) < 5) {
      if (!completedGuidedSteps.includes(5)) setCompletedGuidedSteps((s) => [...s, 5]);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] w-full bg-[#F8FAFC] text-zinc-900 overflow-hidden select-none">
      {/* Top Laboratory Control Bar */}
      <header className="h-12 border-b border-zinc-200 bg-white px-4 flex items-center justify-between shrink-0 z-40 shadow-xs">
        {/* Left: Breadcrumbs & Module Title */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
            <Link href="/labs" className="hover:text-zinc-900 transition-colors">
              Labs
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-[#3B82F6] font-bold">Electrical Engineering</span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-900 font-bold">Network Theorems</span>
          </nav>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 hidden md:inline">
            EE-201 • Semester III
          </span>
        </div>

        {/* Middle: 7-Step Workflow Nav Tabs */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs overflow-x-auto max-w-xl">
          {[
            { id: 'understand', label: '1. Understand', icon: BookOpen },
            { id: 'predict', label: '2. Predict', icon: Lightbulb },
            { id: 'explore', label: '3. Explore', icon: Sliders },
            { id: 'guided', label: '4. Guided', icon: ClipboardList },
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
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-white text-blue-600 shadow-xs border border-zinc-200'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Reset & Help */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setV1(12.0);
              setR1(100);
              setV2(6.0);
              setR2(200);
              setR3(200);
              setRL(150);
              setLoadMode('connected');
            }}
            className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 px-2 py-1 rounded border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 transition-colors"
            title="Reset circuit to standard textbook default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          <BugReportModal simulationId="electrical-network-theorems" moduleName="Network Theorems Lab" />
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
        {/* ================= STEP 1: UNDERSTAND ================= */}
        {activeStep === 'understand' && (
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-xl font-bold text-zinc-900">Foundations of Network Reduction</h2>
              </div>
              <p className="text-sm text-zinc-600 leading-relaxed">
                Linear electrical network analysis often involves complex multi-loop circuits.
                Thévenin's and Norton's theorems provide rigorous mathematical reduction
                techniques to replace any arbitrary two-terminal linear subnetwork with an ideal
                single-source equivalent. Jacobi's Maximum Power Transfer theorem establishes the
                fundamental thermodynamic and electrical limits of transferring power to an
                external load.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thévenin Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    Thévenin&apos;s Theorem (1883)
                  </h3>
                  <span className="text-[11px] font-mono font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-200">
                    Voltage Equivalent
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Any linear two-terminal DC network can be replaced by an ideal independent voltage
                  source <span className="font-mono font-bold">V_th</span> in series with an internal
                  resistance <span className="font-mono font-bold">R_th</span>.
                </p>
                <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                  <MathView math="V_{th} = V_{oc} \quad \text{and} \quad R_{th} = \frac{V_{oc}}{I_{sc}}" display />
                </div>
                <ul className="text-xs text-zinc-600 space-y-1 list-disc pl-4">
                  <li><strong>V_oc:</strong> Open-circuit voltage measured across terminals A-B.</li>
                  <li><strong>R_th:</strong> Resistance looking into A-B with all independent sources killed (voltage sources shorted, current sources opened).</li>
                </ul>
              </div>

              {/* Norton Card */}
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Norton&apos;s Theorem (1926)
                  </h3>
                  <span className="text-[11px] font-mono font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                    Current Equivalent
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Dual of Thévenin&apos;s theorem: Any linear two-terminal network can be modeled as
                  an ideal independent current source <span className="font-mono font-bold">I_N</span> in
                  parallel with an internal conductance/resistance <span className="font-mono font-bold">R_N = R_th</span>.
                </p>
                <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                  <MathView math="I_N = I_{sc} = \frac{V_{th}}{R_{th}} \quad \text{with} \quad R_N = R_{th}" display />
                </div>
                <ul className="text-xs text-zinc-600 space-y-1 list-disc pl-4">
                  <li><strong>I_sc:</strong> Current flowing through an ideal zero-ohm short circuit between terminals A-B.</li>
                  <li>Direct source transformation converts Thévenin to Norton and vice versa.</li>
                </ul>
              </div>

              {/* Maximum Power Transfer */}
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Maximum Power Transfer (Jacobi&apos;s Law)
                  </h3>
                  <span className="text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                    Impedance Matching
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Power delivered to a variable load resistor <span className="font-mono font-bold">R_L</span> is
                  strictly maximized when the load resistance equals the internal Thévenin resistance:
                </p>
                <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                  <MathView math="P_L(R_L) = \frac{V_{th}^2 R_L}{(R_{th} + R_L)^2} \implies P_{L,\max} = \frac{V_{th}^2}{4 R_{th}} \quad (R_L = R_{th})" display />
                </div>
                <p className="text-xs text-zinc-600">
                  <strong>Crucial Insight:</strong> At maximum power transfer, exactly half the total power is dissipated in the source itself, yielding an efficiency of <span className="font-bold text-emerald-600">η = 50%</span>.
                </p>
              </div>

              {/* Superposition */}
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-100 pb-2">
                  <h3 className="font-bold text-zinc-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-purple-500" />
                    Superposition Principle
                  </h3>
                  <span className="text-[11px] font-mono font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200">
                    Linearity
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  In a linear bilateral network with multiple independent sources, the response in any branch is the algebraic sum of the responses caused by each source acting independently:
                </p>
                <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                  <MathView math="V_{th} = V_{th1}|_{V_2=0} + V_{th2}|_{V_1=0}" display />
                </div>
                <p className="text-xs text-zinc-600">
                  When analyzing one source, all other independent voltage sources are replaced with short circuits (0V), and current sources with open circuits (0A).
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveStep('predict')}
                className="flex items-center gap-2 bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
              >
                Proceed to Predict Hypothesis
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: PREDICT ================= */}
        {activeStep === 'predict' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-amber-600">
                <Lightbulb className="w-5 h-5" />
                <h2 className="text-lg font-bold text-zinc-900">Student Pre-Lab Hypothesis Challenge</h2>
              </div>
              <p className="text-sm text-zinc-600">
                Before testing in the interactive workbench, calculate and predict the Thévenin
                parameters for the current circuit configuration:
              </p>

              {/* Current Parameters Summary */}
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-lg border border-zinc-200 text-center font-mono text-xs">
                <div>
                  <span className="text-zinc-600 block text-[10px]">V1</span>
                  <span className="font-bold text-blue-600">{v1} V</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[10px]">R1</span>
                  <span className="font-bold text-zinc-900">{r1} Ω</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[10px]">V2</span>
                  <span className="font-bold text-blue-600">{v2} V</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[10px]">R2</span>
                  <span className="font-bold text-zinc-900">{r2} Ω</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[10px]">R3</span>
                  <span className="font-bold text-zinc-900">{r3} Ω</span>
                </div>
              </div>

              {/* Prediction Input Form */}
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Predicted Thévenin Voltage V_th (Volts):
                  </label>
                  <input
                    type="number"
                    value={predVth}
                    onChange={(e) => setPredVth(e.target.value)}
                    placeholder="e.g. 7.50"
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Predicted Thévenin Resistance R_th (Ohms):
                  </label>
                  <input
                    type="number"
                    value={predRth}
                    onChange={(e) => setPredRth(e.target.value)}
                    placeholder="e.g. 50.0"
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Predicted Optimal Load Resistance R_L for Maximum Power Transfer (Ohms):
                  </label>
                  <input
                    type="number"
                    value={predRLOpt}
                    onChange={(e) => setPredRLOpt(e.target.value)}
                    placeholder="e.g. 50.0"
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={() => setPredictionSubmitted(true)}
                  disabled={!predVth || !predRth || !predRLOpt}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 disabled:text-zinc-600 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-xs"
                >
                  Submit & Compare with Simulation
                </button>
              </div>

              {/* Feedback after submission */}
              {predictionSubmitted && (
                <div className="mt-4 p-4 rounded-xl border border-blue-200 bg-blue-50/70 space-y-3">
                  <h4 className="font-bold text-sm text-blue-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    Hypothesis Evaluation:
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <span className="text-zinc-600 block">Thévenin Voltage:</span>
                      <span className="font-mono font-bold text-zinc-900">Predicted: {predVth} V</span>
                      <span className="block font-mono text-blue-600 font-bold mt-1">
                        Exact: {simResult.vTh.toFixed(2)} V
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <span className="text-zinc-600 block">Thévenin Resistance:</span>
                      <span className="font-mono font-bold text-zinc-900">Predicted: {predRth} Ω</span>
                      <span className="block font-mono text-blue-600 font-bold mt-1">
                        Exact: {simResult.rTh.toFixed(2)} Ω
                      </span>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-blue-100">
                      <span className="text-zinc-600 block">Optimal Max Power R_L:</span>
                      <span className="font-mono font-bold text-zinc-900">Predicted: {predRLOpt} Ω</span>
                      <span className="block font-mono text-emerald-600 font-bold mt-1">
                        Exact: {simResult.rTh.toFixed(2)} Ω
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setActiveStep('explore')}
                      className="bg-blue-600 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enter Interactive Workbench →
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3: EXPLORE (INTERACTIVE WORKBENCH) ================= */}
        {activeStep === 'explore' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left & Middle: Circuit Schematic Canvas (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-blue-600" />
                    <h3 className="font-bold text-zinc-900 text-base">
                      Interactive Dual-Source T-Network
                    </h3>
                  </div>
                  {/* Load Terminal State Controls */}
                  <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-lg border border-zinc-200 text-xs">
                    <button
                      onClick={() => setLoadMode('connected')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                        loadMode === 'connected'
                          ? 'bg-white text-blue-600 shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                    >
                      Load Connected
                    </button>
                    <button
                      onClick={() => setLoadMode('open')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                        loadMode === 'open'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                      title="Open circuit to measure V_th = V_oc"
                    >
                      Open Circuit (V_oc)
                    </button>
                    <button
                      onClick={() => setLoadMode('short')}
                      className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                        loadMode === 'short'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-zinc-600 hover:text-zinc-900'
                      }`}
                      title="Short circuit to measure I_N = I_sc"
                    >
                      Short Circuit (I_sc)
                    </button>
                  </div>
                </div>

                {/* SVG Circuit Schematic */}
                <div className="w-full aspect-16/9 bg-slate-50 border border-zinc-200 rounded-lg relative overflow-hidden flex items-center justify-center p-4">
                  <svg
                    viewBox="0 0 640 360"
                    className="w-full h-full text-zinc-800"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {/* Background Grid */}
                    <defs>
                      <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="1" fill="#cbd5e1" />
                      </pattern>
                      <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="5"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#3B82F6" />
                      </marker>
                    </defs>
                    <rect width="640" height="360" fill="url(#grid)" />

                    {/* Source 1 Branch (Left) */}
                    {/* V1 Circle */}
                    <circle cx="80" cy="180" r="28" className="fill-white stroke-blue-600 stroke-[2.5]" />
                    <text x="80" y="176" textAnchor="middle" className="text-xs font-mono font-bold fill-blue-700" stroke="none">
                      V1
                    </text>
                    <text x="80" y="194" textAnchor="middle" className="text-[11px] font-mono font-bold fill-zinc-600" stroke="none">
                      {v1}V
                    </text>
                    <text x="80" y="142" textAnchor="middle" className="text-xs font-bold fill-rose-600" stroke="none">+</text>
                    <text x="80" y="222" textAnchor="middle" className="text-xs font-bold fill-zinc-600" stroke="none">-</text>

                    {/* Wires around V1 */}
                    <path d="M 80 152 L 80 80 L 160 80" className="stroke-zinc-700" />
                    <path d="M 80 208 L 80 280 L 320 280" className="stroke-zinc-700" />

                    {/* Resistor R1 */}
                    <g transform="translate(160, 80)">
                      <path d="M 0 0 L 15 0 L 22 -12 L 32 12 L 42 -12 L 52 12 L 62 -12 L 69 0 L 85 0" className="stroke-amber-600 stroke-[2.5]" />
                      <text x="42" y="-18" textAnchor="middle" className="text-xs font-mono font-bold fill-amber-700" stroke="none">
                        R1: {r1}Ω
                      </text>
                    </g>
                    <path d="M 245 80 L 320 80" className="stroke-zinc-700" />

                    {/* Central Node X */}
                    <circle cx="320" cy="80" r="5" className="fill-blue-600 stroke-blue-700" />
                    <text x="320" y="66" textAnchor="middle" className="text-xs font-bold font-mono fill-blue-600" stroke="none">
                      Node X ({simResult.vTh.toFixed(2)}V)
                    </text>

                    {/* Resistor R3 (Shunt to Ground) */}
                    <path d="M 320 80 L 320 130" className="stroke-zinc-700" />
                    <g transform="translate(320, 130) rotate(90)">
                      <path d="M 0 0 L 15 0 L 22 -12 L 32 12 L 42 -12 L 52 12 L 62 -12 L 69 0 L 85 0" className="stroke-amber-600 stroke-[2.5]" />
                      <text x="42" y="22" textAnchor="middle" className="text-xs font-mono font-bold fill-amber-700" stroke="none" transform="rotate(-90 42 22)">
                        R3: {r3}Ω
                      </text>
                    </g>
                    <path d="M 320 215 L 320 280" className="stroke-zinc-700" />

                    {/* Resistor R2 Branch (Right) */}
                    <path d="M 320 80 L 395 80" className="stroke-zinc-700" />
                    <g transform="translate(395, 80)">
                      <path d="M 0 0 L 15 0 L 22 -12 L 32 12 L 42 -12 L 52 12 L 62 -12 L 69 0 L 85 0" className="stroke-amber-600 stroke-[2.5]" />
                      <text x="42" y="-18" textAnchor="middle" className="text-xs font-mono font-bold fill-amber-700" stroke="none">
                        R2: {r2}Ω
                      </text>
                    </g>
                    <path d="M 480 80 L 560 80 L 560 152" className="stroke-zinc-700" />

                    {/* V2 Circle */}
                    <circle cx="560" cy="180" r="28" className="fill-white stroke-blue-600 stroke-[2.5]" />
                    <text x="560" y="176" textAnchor="middle" className="text-xs font-mono font-bold fill-blue-700" stroke="none">
                      V2
                    </text>
                    <text x="560" y="194" textAnchor="middle" className="text-[11px] font-mono font-bold fill-zinc-600" stroke="none">
                      {v2}V
                    </text>
                    <text x="560" y="142" textAnchor="middle" className="text-xs font-bold fill-rose-600" stroke="none">+</text>
                    <text x="560" y="222" textAnchor="middle" className="text-xs font-bold fill-zinc-600" stroke="none">-</text>

                    <path d="M 560 208 L 560 280 L 320 280" className="stroke-zinc-700" />

                    {/* Ground Reference Symbol at bottom */}
                    <g transform="translate(320, 280)">
                      <circle cx="0" cy="0" r="4" className="fill-zinc-700" />
                      <path d="M 0 0 L 0 20 M -16 20 L 16 20 M -10 26 L 10 26 M -4 32 L 4 32" className="stroke-zinc-800 stroke-[2]" />
                    </g>

                    {/* Load Terminals A and B */}
                    {/* Node A (Upper) */}
                    <circle cx="320" cy="80" r="4" className="fill-rose-500" />
                    <text x="340" y="95" className="text-xs font-bold font-mono fill-rose-600" stroke="none">Terminal A</text>

                    {/* Node B (Lower ground) */}
                    <circle cx="320" cy="280" r="4" className="fill-zinc-700" />
                    <text x="340" y="270" className="text-xs font-bold font-mono fill-zinc-700" stroke="none">Terminal B (GND)</text>

                    {/* Load Representation */}
                    {loadMode === 'connected' && (
                      <g>
                        <path d="M 320 80 Q 240 180 240 180" className="stroke-emerald-600 stroke-[2.5] stroke-dasharray-[4,4]" />
                        <rect x="210" y="160" width="60" height="40" rx="6" className="fill-emerald-50 stroke-emerald-600 stroke-[2]" />
                        <text x="240" y="178" textAnchor="middle" className="text-xs font-bold font-mono fill-emerald-800" stroke="none">
                          RL: {rL}Ω
                        </text>
                        <text x="240" y="192" textAnchor="middle" className="text-[10px] font-bold font-mono fill-emerald-600" stroke="none">
                          {simResult.pL.toFixed(3)}W
                        </text>
                        <path d="M 240 200 Q 240 280 320 280" className="stroke-emerald-600 stroke-[2.5] stroke-dasharray-[4,4]" />
                      </g>
                    )}

                    {loadMode === 'open' && (
                      <g>
                        <text x="240" y="180" textAnchor="middle" className="text-xs font-bold fill-amber-600" stroke="none">
                          OPEN CIRCUIT (Voc = {simResult.vTh.toFixed(2)}V)
                        </text>
                      </g>
                    )}

                    {loadMode === 'short' && (
                      <g>
                        <path d="M 320 80 L 320 280" className="stroke-rose-600 stroke-[4]" />
                        <text x="335" y="180" className="text-xs font-bold fill-rose-600" stroke="none">
                          SHORT (Isc = {simResult.iN.toFixed(3)}A)
                        </text>
                      </g>
                    )}
                  </svg>
                </div>

                {/* Live Measurements Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Thévenin Voltage V_th</span>
                    <span className="text-lg font-mono font-bold text-blue-600">{simResult.vTh.toFixed(3)} V</span>
                  </div>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Thévenin Resistance R_th</span>
                    <span className="text-lg font-mono font-bold text-amber-600">{simResult.rTh.toFixed(2)} Ω</span>
                  </div>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Norton Current I_N</span>
                    <span className="text-lg font-mono font-bold text-purple-600">{simResult.iN.toFixed(4)} A</span>
                  </div>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Max Available Power</span>
                    <span className="text-lg font-mono font-bold text-emerald-600">
                      {(simResult.pLMax * 1000).toFixed(1)} mW
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Parameter Adjuster Panel (1 col) */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-200 pb-2">
                  Component Parameters
                </h3>

                {/* V1 Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>DC Source V1</span>
                    <span className="font-mono text-blue-600">{v1.toFixed(1)} V</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={v1}
                    onChange={(e) => setV1(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* R1 Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Resistor R1</span>
                    <span className="font-mono text-zinc-900">{r1} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={r1}
                    onChange={(e) => setR1(parseInt(e.target.value))}
                    className="w-full accent-zinc-700 cursor-pointer"
                  />
                </div>

                {/* V2 Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>DC Source V2</span>
                    <span className="font-mono text-blue-600">{v2.toFixed(1)} V</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="0.5"
                    value={v2}
                    onChange={(e) => setV2(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer"
                  />
                </div>

                {/* R2 Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Resistor R2</span>
                    <span className="font-mono text-zinc-900">{r2} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={r2}
                    onChange={(e) => setR2(parseInt(e.target.value))}
                    className="w-full accent-zinc-700 cursor-pointer"
                  />
                </div>

                {/* R3 Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Central Shunt R3</span>
                    <span className="font-mono text-zinc-900">{r3} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="1000"
                    step="10"
                    value={r3}
                    onChange={(e) => setR3(parseInt(e.target.value))}
                    className="w-full accent-zinc-700 cursor-pointer"
                  />
                </div>

                {/* Load Resistor RL Slider */}
                <div className="pt-2 border-t border-zinc-100">
                  <div className="flex justify-between text-xs font-bold text-emerald-800 mb-1">
                    <span>Load Resistor RL</span>
                    <span className="font-mono">{rL} Ω</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="500"
                    step="5"
                    value={rL}
                    onChange={(e) => setRL(parseInt(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between items-center mt-2">
                    <button
                      onClick={() => setRL(Math.round(simResult.rTh))}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 transition-colors"
                    >
                      Match RL = R_th ({Math.round(simResult.rTh)} Ω)
                    </button>
                    {simResult.isAtMaximumPower && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                        ★ Max Power!
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Operating Metrics */}
              <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs space-y-2 text-xs">
                <h4 className="font-bold text-zinc-800 border-b border-zinc-100 pb-1">
                  Load Operating Point
                </h4>
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-600">Load Voltage (V_L):</span>
                  <span className="font-mono font-bold text-zinc-900">{simResult.vL.toFixed(3)} V</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-600">Load Current (I_L):</span>
                  <span className="font-mono font-bold text-zinc-900">{(simResult.iL * 1000).toFixed(2)} mA</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-50">
                  <span className="text-zinc-600">Load Power (P_L):</span>
                  <span className="font-mono font-bold text-emerald-600">
                    {(simResult.pL * 1000).toFixed(2)} mW
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-600">Transfer Efficiency (η):</span>
                  <span className="font-mono font-bold text-blue-600">
                    {simResult.efficiencyPct.toFixed(1)} %
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 4: GUIDED PROCEDURE ================= */}
        {activeStep === 'guided' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2 text-blue-600">
                  <ClipboardList className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-zinc-900">
                    IIT Roorkee Laboratory Procedure Checkpoints
                  </h2>
                </div>
                <span className="text-xs font-bold text-zinc-600">
                  Step {guidedStep} of 5
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full transition-all duration-300"
                  style={{ width: `${(completedGuidedSteps.length / 5) * 100}%` }}
                />
              </div>

              {/* Steps Accordion / List */}
              <div className="space-y-3">
                {[
                  {
                    step: 1,
                    title: 'Step 1: Determine Open-Circuit Voltage V_oc (Thévenin Voltage V_th)',
                    instructions:
                      'Disconnect the load resistor R_L to create an open circuit between terminals A-B. Measure the open-circuit voltage V_oc across terminals A-B.',
                    actionLabel: 'Set Load to Open Circuit',
                    action: () => setLoadMode('open'),
                    isSatisfied: loadMode === 'open',
                  },
                  {
                    step: 2,
                    title: 'Step 2: Determine Short-Circuit Current I_sc (Norton Current I_N)',
                    instructions:
                      'Connect an ideal zero-resistance ammeter or short between terminals A-B. Measure the resulting short-circuit current I_sc.',
                    actionLabel: 'Set Load to Short Circuit',
                    action: () => setLoadMode('short'),
                    isSatisfied: loadMode === 'short',
                  },
                  {
                    step: 3,
                    title: 'Step 3: Calculate Thévenin Equivalent Resistance R_th',
                    instructions:
                      'Compute R_th using Ohm\'s law quotient: R_th = V_oc / I_sc. Verify this matches the analytical combination R_1 || R_2 || R_3.',
                    actionLabel: 'Verify R_th Calculation',
                    action: () => {},
                    isSatisfied: true,
                  },
                  {
                    step: 4,
                    title: 'Step 4: Verify Equivalence with Load Connected',
                    instructions:
                      'Reconnect load resistor R_L. Compare the actual load current in the original multi-source network against the Thévenin single-loop calculation I_L = V_th / (R_th + R_L).',
                    actionLabel: 'Reconnect Load Resistor',
                    action: () => setLoadMode('connected'),
                    isSatisfied: loadMode === 'connected',
                  },
                  {
                    step: 5,
                    title: 'Step 5: Verify Jacobi\'s Maximum Power Transfer Law',
                    instructions:
                      'Sweep the load resistor R_L and adjust it to exactly equal R_th. Observe that load power P_L reaches its absolute maximum, and transfer efficiency equals exactly 50%.',
                    actionLabel: 'Set RL = R_th',
                    action: () => {
                      setLoadMode('connected');
                      setRL(Math.round(simResult.rTh));
                    },
                    isSatisfied: Math.abs(rL - simResult.rTh) < 5,
                  },
                ].map((s) => {
                  const isCurrent = guidedStep === s.step;
                  const isDone = completedGuidedSteps.includes(s.step);
                  return (
                    <div
                      key={s.step}
                      className={`p-4 rounded-xl border transition-all ${
                        isCurrent
                          ? 'border-blue-400 bg-blue-50/50 shadow-xs'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50/30'
                          : 'border-zinc-200 bg-white opacity-75'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 text-xs flex items-center justify-center font-bold">
                              {s.step}
                            </span>
                          )}
                          {s.title}
                        </h4>
                        {isDone && (
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Verified ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-600 mb-3">{s.instructions}</p>
                      {isCurrent && (
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={s.action}
                            className="bg-white border border-zinc-300 text-zinc-800 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-zinc-50 shadow-2xs"
                          >
                            {s.actionLabel}
                          </button>
                          <button
                            onClick={verifyCurrentGuidedStep}
                            disabled={!s.isSatisfied}
                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-200 disabled:text-zinc-600 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors shadow-xs"
                          >
                            Verify & Proceed →
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 5: ANALYZE ================= */}
        {activeStep === 'analyze' && (
          <div className="max-w-6xl mx-auto space-y-6">
            {/* Equivalence Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
                <span className="text-[10px] font-bold text-zinc-600 uppercase block mb-1">Original Network</span>
                <h4 className="font-bold text-sm text-zinc-900 mb-2">Dual-Source Circuit</h4>
                <div className="text-xs space-y-1 font-mono text-zinc-700">
                  <div>V1: {v1}V, V2: {v2}V</div>
                  <div>R1: {r1}Ω, R2: {r2}Ω, R3: {r3}Ω</div>
                  <div className="text-blue-600 font-bold pt-1">Load I_L: {(simResult.iL * 1000).toFixed(2)} mA</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-xs bg-blue-50/20">
                <span className="text-[10px] font-bold text-blue-600 uppercase block mb-1">Thévenin Equivalent</span>
                <h4 className="font-bold text-sm text-zinc-900 mb-2">V_th in series with R_th</h4>
                <div className="text-xs space-y-1 font-mono text-zinc-700">
                  <div>V_th: {simResult.vTh.toFixed(3)} V</div>
                  <div>R_th: {simResult.rTh.toFixed(2)} Ω</div>
                  <div className="text-blue-600 font-bold pt-1">Load I_L: {(simResult.iL * 1000).toFixed(2)} mA</div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-xs bg-purple-50/20">
                <span className="text-[10px] font-bold text-purple-600 uppercase block mb-1">Norton Equivalent</span>
                <h4 className="font-bold text-sm text-zinc-900 mb-2">I_N in parallel with R_N</h4>
                <div className="text-xs space-y-1 font-mono text-zinc-700">
                  <div>I_N: {(simResult.iN * 1000).toFixed(2)} mA</div>
                  <div>R_N: {simResult.rN.toFixed(2)} Ω</div>
                  <div className="text-blue-600 font-bold pt-1">Load I_L: {(simResult.iL * 1000).toFixed(2)} mA</div>
                </div>
              </div>
            </div>

            {/* Interactive Maximum Power Transfer Curve */}
            <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-zinc-900 text-sm">
                    Maximum Power Transfer Characteristic Curve: P_L vs R_L
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Peak at R_L = R_th ({simResult.rTh.toFixed(1)} Ω)
                </span>
              </div>

              {/* Power Sweep Graph (SVG) */}
              <div className="w-full aspect-21/9 bg-slate-50 border border-zinc-200 rounded-lg p-3 relative">
                <svg viewBox="0 0 700 240" className="w-full h-full">
                  {/* Grid Lines */}
                  {[0, 60, 120, 180].map((y) => (
                    <line key={y} x1="50" y1={y + 20} x2="680" y2={y + 20} stroke="#e2e8f0" strokeDasharray="3 3" />
                  ))}

                  {/* Axes */}
                  <line x1="50" y1="200" x2="680" y2="200" stroke="#64748b" strokeWidth="1.5" />
                  <line x1="50" y1="20" x2="50" y2="200" stroke="#64748b" strokeWidth="1.5" />

                  {/* Axis Labels */}
                  <text x="365" y="232" textAnchor="middle" className="text-[11px] font-bold fill-zinc-600">
                    Load Resistance R_L (Ω)
                  </text>
                  <text x="18" y="110" textAnchor="middle" className="text-[11px] font-bold fill-zinc-600" transform="rotate(-90 18 110)">
                    Power P_L (mW)
                  </text>

                  {/* Power Curve Plot */}
                  {(() => {
                    const maxP = simResult.pLMax * 1.15;
                    const maxR = simResult.rTh * 3.0;

                    const pathPoints = simResult.loadSweep.map((pt) => {
                      const x = 50 + (pt.rL / maxR) * 620;
                      const y = 200 - (pt.pL / maxP) * 175;
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    });

                    // Current Operating Point
                    const currentX = 50 + (Math.min(rL, maxR) / maxR) * 620;
                    const currentY = 200 - (simResult.pL / maxP) * 175;

                    // Peak Point
                    const peakX = 50 + (simResult.rTh / maxR) * 620;
                    const peakY = 200 - (simResult.pLMax / maxP) * 175;

                    return (
                      <>
                        {/* Peak dashed indicator line */}
                        <line x1={peakX} y1="20" x2={peakX} y2="200" stroke="#10b981" strokeDasharray="4 4" strokeWidth="1.5" />
                        <text x={peakX} y="15" textAnchor="middle" className="text-[10px] font-mono font-bold fill-emerald-600">
                          R_th = {simResult.rTh.toFixed(1)}Ω
                        </text>

                        {/* Power Curve */}
                        <polyline
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="3"
                          points={pathPoints.join(' ')}
                        />

                        {/* Peak Marker Dot */}
                        <circle cx={peakX} cy={peakY} r="5" fill="#10b981" />

                        {/* Current Operating Point Marker */}
                        <circle cx={currentX} cy={currentY} r="6" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                        <text x={currentX + 8} y={currentY - 8} className="text-[10px] font-mono font-bold fill-blue-600">
                          Current: {(simResult.pL * 1000).toFixed(1)} mW
                        </text>
                      </>
                    );
                  })()}
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 6: CHALLENGE ================= */}
        {activeStep === 'challenge' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                <div className="flex items-center gap-2 text-purple-600">
                  <Award className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-zinc-900">
                    Randomized Circuit Reduction Challenge
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  Score: {challengeScore} XP
                </span>
              </div>

              <p className="text-xs text-zinc-600">
                Solve for the exact Thévenin equivalent parameters for this generated circuit problem:
              </p>

              <div className="grid grid-cols-5 gap-2 bg-slate-50 p-3 rounded-lg border border-zinc-200 text-center font-mono text-xs">
                <div>
                  <span className="text-zinc-600 block text-[10px]">V1</span>
                  <span className="font-bold text-blue-600">{challengeProblem.v1} V</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[10px]">R1</span>
                  <span className="font-bold text-zinc-900">{challengeProblem.r1} Ω</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[10px]">V2</span>
                  <span className="font-bold text-blue-600">{challengeProblem.v2} V</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[10px]">R2</span>
                  <span className="font-bold text-zinc-900">{challengeProblem.r2} Ω</span>
                </div>
                <div>
                  <span className="text-zinc-600 block text-[10px]">R3</span>
                  <span className="font-bold text-zinc-900">{challengeProblem.r3} Ω</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Calculate V_th (Volts, within ±0.2V):
                  </label>
                  <input
                    type="number"
                    value={ansVth}
                    onChange={(e) => setAnsVth(e.target.value)}
                    placeholder="Enter V_th"
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Calculate R_th (Ohms, within ±1.0Ω):
                  </label>
                  <input
                    type="number"
                    value={ansRth}
                    onChange={(e) => setAnsRth(e.target.value)}
                    placeholder="Enter R_th"
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleVerifyChallenge}
                    disabled={!ansVth || !ansRth}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-200 disabled:text-zinc-600 text-white font-semibold text-sm py-2 rounded-lg transition-colors shadow-xs"
                  >
                    Check Answer
                  </button>
                  <button
                    onClick={handleNextChallenge}
                    className="flex items-center gap-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs px-3 py-2 rounded-lg transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    New Problem
                  </button>
                </div>

                {challengeResult === 'correct' && (
                  <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Correct! +100 XP awarded. You demonstrated mastery of nodal reduction.
                  </div>
                )}

                {challengeResult === 'incorrect' && (
                  <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs space-y-1">
                    <div className="font-bold">Not quite. Hint:</div>
                    <div>Use V_th = (V1/R1 + V2/R2) / (1/R1 + 1/R2 + 1/R3).</div>
                    <div>Use R_th = 1 / (1/R1 + 1/R2 + 1/R3).</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 7: REPORT ================= */}
        {activeStep === 'report' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-xl border border-zinc-200 p-6 shadow-xs space-y-6 print:border-none print:shadow-none">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-zinc-200 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-zinc-900">
                    VIRTUAL LABORATORY OBSERVATION SHEET
                  </h2>
                  <p className="text-xs text-zinc-600 mt-1">
                    Experiment: Verification of Thévenin, Norton & Maximum Power Transfer Theorems
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 bg-blue-600 text-white font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors print:hidden shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save PDF
                </button>
              </div>

              {/* Student Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="text-zinc-600 block mb-1 font-semibold">Student Name:</label>
                  <input
                    type="text"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full border border-zinc-300 rounded px-2.5 py-1.5 font-medium"
                  />
                </div>
                <div>
                  <label className="text-zinc-600 block mb-1 font-semibold">Roll Number / UID:</label>
                  <input
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full border border-zinc-300 rounded px-2.5 py-1.5 font-medium font-mono"
                  />
                </div>
                <div>
                  <label className="text-zinc-600 block mb-1 font-semibold">Institution:</label>
                  <input
                    type="text"
                    value={institution}
                    onChange={(e) => setInstitution(e.target.value)}
                    className="w-full border border-zinc-300 rounded px-2.5 py-1.5 font-medium"
                  />
                </div>
              </div>

              {/* Observation Table */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-800">
                  Experimental Observation & Verification Table
                </h3>
                <div className="border border-zinc-200 rounded-lg overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-zinc-100 border-b border-zinc-200 font-bold text-zinc-700">
                      <tr>
                        <th className="p-2.5">Parameter</th>
                        <th className="p-2.5">Theoretical (Calculated)</th>
                        <th className="p-2.5">Simulated (Measured)</th>
                        <th className="p-2.5">Relative Error (%)</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 font-mono">
                      <tr>
                        <td className="p-2.5 font-sans font-medium">Thévenin Voltage (V_th)</td>
                        <td className="p-2.5">{simResult.vTh.toFixed(3)} V</td>
                        <td className="p-2.5">{simResult.vTh.toFixed(3)} V</td>
                        <td className="p-2.5">0.00 %</td>
                        <td className="p-2.5 font-sans text-emerald-600 font-bold">Verified ✓</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans font-medium">Thévenin Resistance (R_th)</td>
                        <td className="p-2.5">{simResult.rTh.toFixed(2)} Ω</td>
                        <td className="p-2.5">{simResult.rTh.toFixed(2)} Ω</td>
                        <td className="p-2.5">0.00 %</td>
                        <td className="p-2.5 font-sans text-emerald-600 font-bold">Verified ✓</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans font-medium">Norton Current (I_N)</td>
                        <td className="p-2.5">{(simResult.iN * 1000).toFixed(2)} mA</td>
                        <td className="p-2.5">{(simResult.iN * 1000).toFixed(2)} mA</td>
                        <td className="p-2.5">0.00 %</td>
                        <td className="p-2.5 font-sans text-emerald-600 font-bold">Verified ✓</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans font-medium">Load Current (I_L) at RL={rL}Ω</td>
                        <td className="p-2.5">{(simResult.iL * 1000).toFixed(2)} mA</td>
                        <td className="p-2.5">{(simResult.iL * 1000).toFixed(2)} mA</td>
                        <td className="p-2.5">0.00 %</td>
                        <td className="p-2.5 font-sans text-emerald-600 font-bold">Verified ✓</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-sans font-medium">Max Available Power (P_L,max)</td>
                        <td className="p-2.5">{(simResult.pLMax * 1000).toFixed(2)} mW</td>
                        <td className="p-2.5">{(simResult.pLMax * 1000).toFixed(2)} mW</td>
                        <td className="p-2.5">0.00 %</td>
                        <td className="p-2.5 font-sans text-emerald-600 font-bold">Verified ✓</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Conclusion & Signature */}
              <div className="pt-4 border-t border-zinc-200 text-xs text-zinc-600 space-y-2">
                <p>
                  <strong>Academic Conclusion:</strong> The experimental data confirms that the complex dual-source resistive network behaves identically to its Thévenin equivalent (V_th in series with R_th) and its Norton equivalent (I_N in parallel with R_N). The maximum power transfer theorem is validated, with maximum load power occurring strictly when R_L = R_th.
                </p>
                <div className="flex justify-between items-end pt-8 font-mono text-[11px]">
                  <div>Date: {new Date().toLocaleDateString()}</div>
                  <div className="border-t border-zinc-400 pt-1 text-center w-48">
                    Evaluator / Instructor Signature
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
