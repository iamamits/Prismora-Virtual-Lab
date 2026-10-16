/**
 * Prismora Civil & Structural Engineering Virtual Laboratory
 * Planar Pin-Jointed Bridge Truss Mechanics & Method of Joints
 *
 * Course Code: CE-202 (Structural Mechanics & Truss Analysis)
 * Benchmark Institutions: IIT Roorkee & IIT Delhi
 * Pedagogical Lifecycle: Understand -> Predict -> Explore -> Guided -> Analyze -> Challenge -> Report
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  solveTruss,
  createWarrenTruss,
  type TrussJoint,
  type TrussMember,
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
  HelpCircle,
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

export default function TrussAnalysisPage() {
  const [activeStep, setActiveStep] = useState<WorkflowStep>('explore');
  const [trussSpan, setTrussSpan] = useState<number>(12); // metres
  const [trussHeight, setTrussHeight] = useState<number>(3.0); // metres
  const [appliedLoadKn, setAppliedLoadKn] = useState<number>(60); // kN
  const [loadJointIdx, setLoadJointIdx] = useState<number>(2); // Joint index 1 to 3
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  // Hypothesis / Prediction State
  const [predMaxTension, setPredMaxTension] = useState('');
  const [predMaxCompression, setPredMaxCompression] = useState('');
  const [predReactionA, setPredReactionA] = useState('');
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);

  // Guided Procedure State
  const [guidedStep, setGuidedStep] = useState(1);
  const [completedGuidedSteps, setCompletedGuidedSteps] = useState<number[]>([]);

  // Challenge State
  const [challengeTargetLoad] = useState<number>(75);
  const [challengeJointIdx] = useState<number>(1);
  const [challengeAnswerTension, setChallengeAnswerTension] = useState('');
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  // Generate and solve truss model
  const { joints, members } = useMemo(() => {
    return createWarrenTruss(trussSpan, trussHeight, appliedLoadKn, loadJointIdx);
  }, [trussSpan, trussHeight, appliedLoadKn, loadJointIdx]);

  const trussResult = useMemo(() => {
    return solveTruss(joints, members);
  }, [joints, members]);

  // Selected member details
  const selectedMember = useMemo(() => {
    if (!selectedMemberId) return trussResult.members[0];
    return trussResult.members.find((m) => m.memberId === selectedMemberId) ?? trussResult.members[0];
  }, [selectedMemberId, trussResult]);

  // Guided step verification
  const verifyCurrentGuidedStep = () => {
    if (!completedGuidedSteps.includes(guidedStep)) {
      setCompletedGuidedSteps([...completedGuidedSteps, guidedStep]);
    }
    if (guidedStep < 5) {
      setGuidedStep(guidedStep + 1);
    }
  };

  // Evaluate challenge answer
  const submitChallenge = () => {
    const tempModel = createWarrenTruss(12, 3, challengeTargetLoad, challengeJointIdx);
    const tempRes = solveTruss(tempModel.joints, tempModel.members);
    const userVal = parseFloat(challengeAnswerTension);

    if (Math.abs(userVal - tempRes.maxTensionKn) < 3.0) {
      setChallengeScore((prev) => prev + 50);
      setChallengeFeedback(`Correct! Exact Max Tension is ${tempRes.maxTensionKn.toFixed(1)} kN (+50 XP).`);
    } else {
      setChallengeFeedback(`Incorrect. Computed ${userVal} kN, but exact is ${tempRes.maxTensionKn.toFixed(1)} kN.`);
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
              Civil Engineering
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <h1 className="font-bold text-amber-700 text-xs sm:text-sm">Bridge Truss Structural Mechanics</h1>
          </nav>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 hidden sm:inline">
            CE-202
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
                  isActive ? 'text-amber-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTrussTab"
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
          <BugReportModal simulationId="civil-bridge-truss" moduleName="Bridge Truss Mechanics Lab" />
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
                <div className="flex items-center gap-2 text-amber-600">
                  <BookOpen className="w-5 h-5" />
                  <h1 className="text-xl font-bold text-zinc-900">
                    Planar Pin-Jointed Bridge Truss Structural Analysis
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  A truss is an engineered network of slender structural members connected at pin joints. When loads are applied exclusively at joints, members experience pure axial tension or compression without bending moments.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-600" />
                      Static Determinacy Criterion
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      For a planar truss with <span className="font-mono font-bold">m</span> members, <span className="font-mono font-bold">j</span> joints, and <span className="font-mono font-bold">r</span> support reactions:
                    </p>
                    <div className="bg-white p-2.5 rounded border border-zinc-200 text-center">
                      <MathView math="m + r = 2j \implies \text{Statically Determinate}" display />
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      If <MathView math="m + r > 2j" />, the truss is indeterminate. If <MathView math="m + r < 2j" />, the structure is unstable (a mechanism).
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-blue-600" />
                      Method of Joints Equilibrium
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Every individual pin joint must satisfy concurrent coplanar static equilibrium:
                    </p>
                    <div className="bg-white p-2.5 rounded border border-zinc-200 text-center">
                      <MathView math="\sum F_x = 0 \quad \text{and} \quad \sum F_y = 0" display />
                    </div>
                    <ul className="text-xs text-zinc-600 list-disc pl-4 space-y-1">
                      <li><strong>Tension Member (T &gt; 0):</strong> Pulls away from joints; colored in Cyan/Blue.</li>
                      <li><strong>Compression Member (T &lt; 0):</strong> Pushes toward joints; colored in Crimson/Red.</li>
                    </ul>
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
                <div className="flex items-center gap-2 text-amber-600">
                  <Lightbulb className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-zinc-900">Pre-Lab Hypothesis & Prediction</h2>
                </div>
                <p className="text-xs text-zinc-600">
                  Before solving with the matrix solver, calculate reactions and member forces for a 12m span Warren truss under a <strong>{appliedLoadKn} kN</strong> vertical load applied at midspan (Joint J2):
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Predicted Vertical Reaction at Left Support J0 (kN):
                    </label>
                    <input
                      type="number"
                      value={predReactionA}
                      onChange={(e) => setPredReactionA(e.target.value)}
                      placeholder="e.g. 30.0"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Predicted Peak Tensile Member Force (kN):
                    </label>
                    <input
                      type="number"
                      value={predMaxTension}
                      onChange={(e) => setPredMaxTension(e.target.value)}
                      placeholder="e.g. 45.0"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <button
                    onClick={() => setPredictionSubmitted(true)}
                    disabled={!predReactionA || !predMaxTension}
                    className="w-full bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-200 disabled:text-zinc-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-xs"
                  >
                    Submit Hypothesis & Compare
                  </button>
                </div>

                {predictionSubmitted && (
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/70 space-y-2 text-xs">
                    <span className="font-bold text-amber-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Analytical Comparison:
                    </span>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-lg border border-amber-100">
                        <span className="text-zinc-600 block">Left Support Reaction:</span>
                        <span className="font-mono font-bold text-zinc-900">Predicted: {predReactionA} kN</span>
                        <span className="block font-mono text-amber-600 font-bold mt-0.5">
                          Exact: {trussResult.reactions[0]?.ryKn ?? 0} kN
                        </span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-amber-100">
                        <span className="text-zinc-600 block">Maximum Tension:</span>
                        <span className="font-mono font-bold text-zinc-900">Predicted: {predMaxTension} kN</span>
                        <span className="block font-mono text-blue-600 font-bold mt-0.5">
                          Exact: {trussResult.maxTensionKn} kN
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
              {/* Left 2 Cols: Architectural Truss Rig */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Wrench className="w-5 h-5 text-amber-600" />
                      <div>
                        <h2 className="font-bold text-zinc-900 text-sm sm:text-base">
                          PLANAR WARREN BRIDGE TRUSS WORKBENCH
                        </h2>
                        <span className="text-[11px] text-zinc-500">
                          Span: {trussSpan} m | Height: {trussHeight} m | Load: {appliedLoadKn} kN at Joint J{loadJointIdx}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                        {trussResult.isDeterminate ? 'Statically Determinate ✓' : 'Indeterminate'}
                      </span>
                    </div>
                  </div>

                  {/* SVG Truss Schematic */}
                  <div className="w-full aspect-16/9 bg-slate-50 border border-zinc-200 rounded-lg relative overflow-hidden flex items-center justify-center p-4">
                    <svg viewBox="-1 -1 14 5" className="w-full h-full text-zinc-800">
                      {/* Grid / Ground Water Line */}
                      <line x1="-1" y1="0" x2="13" y2="0" stroke="#cbd5e1" strokeWidth="0.04" strokeDasharray="0.2 0.2" />

                      {/* Members */}
                      {members.map((m) => {
                        const jA = joints.find((j) => j.id === m.jointA)!;
                        const jB = joints.find((j) => j.id === m.jointB)!;
                        const analysis = trussResult.members.find((res) => res.memberId === m.id);
                        const isSelected = selectedMemberId === m.id;

                        // Color coding: Blue = Tension, Red = Compression, Grey = Zero force
                        let strokeColor = '#94a3b8';
                        if (analysis) {
                          if (analysis.forceKn > 1) strokeColor = '#2563eb'; // Blue tension
                          else if (analysis.forceKn < -1) strokeColor = '#dc2626'; // Red compression
                        }

                        // SVG Y coordinates are inverted (0 at top, height downwards)
                        const yA = 3.2 - jA.y;
                        const yB = 3.2 - jB.y;

                        return (
                          <g key={m.id} onClick={() => setSelectedMemberId(m.id)} className="cursor-pointer group">
                            <line
                              x1={jA.x}
                              y1={yA}
                              x2={jB.x}
                              y2={yB}
                              stroke={strokeColor}
                              strokeWidth={isSelected ? 0.12 : 0.08}
                              strokeLinecap="round"
                              className="transition-all duration-150 group-hover:stroke-amber-500"
                            />
                            {/* Member label */}
                            <text
                              x={(jA.x + jB.x) / 2}
                              y={(yA + yB) / 2 - 0.1}
                              fontSize="0.25"
                              textAnchor="middle"
                              className="fill-zinc-700 font-mono font-bold select-none pointer-events-none"
                            >
                              {analysis ? `${Math.abs(analysis.forceKn).toFixed(0)}k` : m.id}
                            </text>
                          </g>
                        );
                      })}

                      {/* Joints */}
                      {joints.map((j) => {
                        const y = 3.2 - j.y;
                        const isLoaded = j.loadY && j.loadY !== 0;

                        return (
                          <g key={j.id}>
                            {/* Pin / Roller support symbols */}
                            {j.supportType === 'pin' && (
                              <polygon
                                points={`${j.x},${y} ${j.x - 0.25},${y + 0.35} ${j.x + 0.25},${y + 0.35}`}
                                className="fill-amber-600 stroke-amber-700 stroke-[0.02]"
                              />
                            )}
                            {j.supportType === 'roller_x' && (
                              <g>
                                <circle cx={j.x - 0.12} cy={y + 0.25} r="0.08" className="fill-amber-600" />
                                <circle cx={j.x + 0.12} cy={y + 0.25} r="0.08" className="fill-amber-600" />
                              </g>
                            )}

                            {/* Applied Load Arrow */}
                            {isLoaded && (
                              <g>
                                <line
                                  x1={j.x}
                                  y1={y - 0.9}
                                  x2={j.x}
                                  y2={y - 0.15}
                                  stroke="#ea580c"
                                  strokeWidth="0.08"
                                  markerEnd="url(#arrow-orange)"
                                />
                                <text
                                  x={j.x}
                                  y={y - 1.05}
                                  fontSize="0.32"
                                  textAnchor="middle"
                                  className="fill-orange-600 font-bold font-mono"
                                >
                                  {appliedLoadKn} kN
                                </text>
                              </g>
                            )}

                            {/* Joint Circle */}
                            <circle cx={j.x} cy={y} r="0.12" className="fill-white stroke-zinc-900 stroke-[0.04]" />
                            <text
                              x={j.x}
                              y={y + 0.04}
                              fontSize="0.16"
                              textAnchor="middle"
                              className="fill-zinc-900 font-mono font-bold pointer-events-none"
                            >
                              {j.id.replace('J', '')}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* Rig Legend */}
                  <div className="flex items-center justify-between text-xs pt-1 px-1 text-zinc-600">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-blue-600" />
                        <span className="font-semibold">Tension Member (Pull)</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-600" />
                        <span className="font-semibold">Compression Member (Push)</span>
                      </div>
                    </div>
                    <span className="text-[11px] text-zinc-500">Click on any member to inspect axial stress</span>
                  </div>
                </div>

                {/* Selected Member Diagnostics */}
                {selectedMember && (
                  <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-2 mb-3">
                      <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                        <span>Member Inspection: {selectedMember.memberId}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            selectedMember.isTension
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {selectedMember.isTension ? 'Tension (+)' : 'Compression (-)'}
                        </span>
                      </h3>
                      <span className="text-xs font-mono text-zinc-600">
                        Span: {selectedMember.jointA} → {selectedMember.jointB} ({selectedMember.lengthMetres} m)
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-zinc-100">
                        <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Axial Force</span>
                        <span className="text-base font-mono font-bold text-zinc-900">
                          {selectedMember.forceKn} kN
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-zinc-100">
                        <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Normal Stress</span>
                        <span className="text-base font-mono font-bold text-amber-700">
                          {selectedMember.stressMpa} MPa
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-zinc-100">
                        <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Factor of Safety</span>
                        <span className="text-base font-mono font-bold text-emerald-600">
                          {selectedMember.safetyFactor}
                        </span>
                      </div>
                      <div className="bg-slate-50 p-2.5 rounded-lg border border-zinc-100">
                        <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Yield Strength</span>
                        <span className="text-base font-mono font-bold text-zinc-700">250 MPa</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Col: Controls & Telemetry */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-200 pb-2">
                    Loading & Geometry Controls
                  </h3>

                  {/* Load Magnitude Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                      <span>Applied Point Load (P)</span>
                      <span className="font-mono text-orange-600">{appliedLoadKn} kN</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="150"
                      step="5"
                      value={appliedLoadKn}
                      onChange={(e) => setAppliedLoadKn(parseFloat(e.target.value))}
                      className="w-full accent-orange-600 cursor-pointer"
                    />
                  </div>

                  {/* Loaded Joint Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Load Application Joint:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[1, 2, 3].map((idx) => (
                        <button
                          key={idx}
                          onClick={() => setLoadJointIdx(idx)}
                          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                            loadJointIdx === idx
                              ? 'bg-orange-600 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                          }`}
                        >
                          Joint J{idx} {idx === 2 ? '(Mid)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Truss Height Slider */}
                  <div>
                    <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                      <span>Truss Height (h)</span>
                      <span className="font-mono text-zinc-900">{trussHeight.toFixed(1)} m</span>
                    </div>
                    <input
                      type="range"
                      min="2.0"
                      max="5.0"
                      step="0.2"
                      value={trussHeight}
                      onChange={(e) => setTrussHeight(parseFloat(e.target.value))}
                      className="w-full accent-zinc-700 cursor-pointer"
                    />
                  </div>

                  {/* Reset Defaults Button */}
                  <button
                    onClick={() => {
                      setAppliedLoadKn(60);
                      setLoadJointIdx(2);
                      setTrussHeight(3.0);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset to Textbook Baseline
                  </button>
                </div>

                {/* Reaction Force Readout */}
                <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs space-y-2 text-xs">
                  <h4 className="font-bold text-zinc-900 border-b border-zinc-100 pb-1">
                    Support Reactions & Envelope
                  </h4>
                  <div className="flex justify-between py-1 border-b border-zinc-50">
                    <span className="text-zinc-600">Left Pin Reaction (R_Ay):</span>
                    <span className="font-mono font-bold text-zinc-900">{trussResult.reactions[0]?.ryKn ?? 0} kN</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-50">
                    <span className="text-zinc-600">Right Roller Reaction (R_By):</span>
                    <span className="font-mono font-bold text-zinc-900">{trussResult.reactions[1]?.ryKn ?? 0} kN</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-zinc-50">
                    <span className="text-zinc-600">Max Tensile Demand:</span>
                    <span className="font-mono font-bold text-blue-600">+{trussResult.maxTensionKn} kN</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-zinc-600">Max Compressive Demand:</span>
                    <span className="font-mono font-bold text-red-600">-{trussResult.maxCompressionKn} kN</span>
                  </div>
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
                  <div className="flex items-center gap-2 text-amber-600">
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
                      title: 'Step 1: Check Determinacy Criterion (m + r = 2j)',
                      instructions: 'Count total members (15), joints (9), and reaction components (3). Verify that 15 + 3 = 18 = 2*9.',
                    },
                    {
                      step: 2,
                      title: 'Step 2: Solve External Support Reactions by Moment Equilibrium',
                      instructions: 'Take moments about support J0: \\sum M_0 = 0 to calculate R_By, then \\sum F_y = 0 to find R_Ay.',
                    },
                    {
                      step: 3,
                      title: 'Step 3: Resolve Joint J0 via Concurrent Method of Joints',
                      instructions: 'Isolate pin joint J0. Resolve \\sum F_y = 0 to determine diagonal M0-5, then \\sum F_x = 0 for bottom tie M0-1.',
                    },
                    {
                      step: 4,
                      title: 'Step 4: Identify Critical Peak Compression Members',
                      instructions: 'Verify that top chord members experience the highest compressive stress and check buckling risk.',
                    },
                    {
                      step: 5,
                      title: 'Step 5: Verify Yield Safety Margin (FS > 2.0)',
                      instructions: 'Ensure normal stress in all members remains strictly below allowable yield stress 250 MPa.',
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`p-4 rounded-xl border transition-all ${
                        guidedStep === s.step
                          ? 'border-amber-400 bg-amber-50/50 shadow-xs'
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
                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">
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
                          className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors shadow-xs"
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
                    <TrendingUp className="w-5 h-5 text-amber-600" />
                    <h3 className="font-bold text-zinc-900 text-sm">
                      Complete Truss Member Force & Stress Matrix
                    </h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    {trussResult.memberCount} Members Solved
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-zinc-200 text-zinc-600 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Member ID</th>
                        <th className="p-2.5">Span</th>
                        <th className="p-2.5">Length (m)</th>
                        <th className="p-2.5">Axial Force (kN)</th>
                        <th className="p-2.5">Stress Regime</th>
                        <th className="p-2.5">Normal Stress (MPa)</th>
                        <th className="p-2.5">Safety Factor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 font-mono">
                      {trussResult.members.map((m) => (
                        <tr key={m.memberId} className="hover:bg-slate-50 transition-colors">
                          <td className="p-2.5 font-bold text-zinc-900">{m.memberId}</td>
                          <td className="p-2.5 text-zinc-600">{m.jointA} - {m.jointB}</td>
                          <td className="p-2.5">{m.lengthMetres}</td>
                          <td className={`p-2.5 font-bold ${m.forceKn >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                            {m.forceKn >= 0 ? `+${m.forceKn}` : m.forceKn}
                          </td>
                          <td className="p-2.5 font-sans">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                m.isTension
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-red-50 text-red-700'
                              }`}
                            >
                              {m.isTension ? 'Tension' : 'Compression'}
                            </span>
                          </td>
                          <td className="p-2.5">{m.stressMpa}</td>
                          <td className="p-2.5 text-emerald-600 font-bold">{m.safetyFactor}</td>
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
                      Randomized Structural Reduction Challenge
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Score: {challengeScore} XP
                  </span>
                </div>

                <p className="text-xs text-zinc-600">
                  A vertical point load of <strong>{challengeTargetLoad} kN</strong> is applied at Joint <strong>J{challengeJointIdx}</strong>. Solve for the peak tensile force developed across the entire truss structure:
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Calculated Peak Tensile Force (kN, within ±3 kN):
                    </label>
                    <input
                      type="number"
                      value={challengeAnswerTension}
                      onChange={(e) => setChallengeAnswerTension(e.target.value)}
                      placeholder="Enter peak tension in kN"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <button
                    onClick={submitChallenge}
                    disabled={!challengeAnswerTension}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-200 disabled:text-zinc-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-xs"
                  >
                    Submit Structural Solution
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
                      CE-202 Virtual Laboratory Practicum Report
                    </h2>
                    <span className="text-xs text-zinc-500">
                      Indian Institute of Technology Roorkee • Civil Engineering Laboratory
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
                    <span className="text-zinc-500 block text-[10px]">Truss Span</span>
                    <span className="font-bold text-zinc-900">{trussSpan} m</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Height</span>
                    <span className="font-bold text-zinc-900">{trussHeight} m</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Peak Tension</span>
                    <span className="font-bold text-blue-600">+{trussResult.maxTensionKn} kN</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Peak Compression</span>
                    <span className="font-bold text-red-600">-{trussResult.maxCompressionKn} kN</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-600 space-y-2">
                  <h4 className="font-bold text-zinc-900">Laboratory Conclusions:</h4>
                  <p>
                    1. The 15-member, 9-joint Warren bridge truss satisfies static determinacy criterion <MathView math="m + r = 2j = 18" />.
                  </p>
                  <p>
                    2. Under downward gravity loading, lower chord members experience tension forces that pull the foundation inwards, while upper chord members experience compressive stresses that resist sag.
                  </p>
                  <p>
                    3. Maximum member stress of {trussResult.members[0]?.stressMpa ?? 0} MPa provides a minimum safety factor exceeding allowable civil structural limits.
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
