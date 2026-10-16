/**
 * Prismora Robotics & Interdisciplinary Engineering Virtual Laboratory
 * Planar Serial Link Robotic Manipulators: Forward & Inverse Kinematics (DH Parameters)
 *
 * Course Code: ID-301 (Robotics & Mechanism Kinematics)
 * Benchmark Institutions: IIT Delhi & IIIT Hyderabad
 * Pedagogical Lifecycle: Understand -> Predict -> Explore -> Guided -> Analyze -> Challenge -> Report
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  computeForwardKinematics,
  computeInverseKinematics,
  type ForwardKinematicsResult,
  type InverseKinematicsResult,
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
  Cpu,
  Download,
  FileText,
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

export default function RoboticsKinematicsPage() {
  const [activeStep, setActiveStep] = useState<WorkflowStep>('explore');
  const [controlMode, setControlMode] = useState<'forward' | 'inverse'>('forward');

  // Robot Geometry: link lengths l1, l2, l3 (metres)
  const [link1Len, setLink1Len] = useState<number>(2.0);
  const [link2Len, setLink2Len] = useState<number>(1.5);
  const [link3Len, setLink3Len] = useState<number>(0.8);
  const [hasThirdLink, setHasThirdLink] = useState<boolean>(true);

  // Joint Angles (Degrees)
  const [theta1, setTheta1] = useState<number>(30);
  const [theta2, setTheta2] = useState<number>(45);
  const [theta3, setTheta3] = useState<number>(-20);

  // Inverse Kinematics Target
  const [targetX, setTargetX] = useState<number>(2.5);
  const [targetY, setTargetY] = useState<number>(1.8);
  const [ikElbowConfig, setIkElbowConfig] = useState<'down' | 'up'>('down');

  // Hypothesis / Prediction State
  const [predEndX, setPredEndX] = useState('');
  const [predEndY, setPredEndY] = useState('');
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);

  // Guided Procedure State
  const [guidedStep, setGuidedStep] = useState(1);
  const [completedGuidedSteps, setCompletedGuidedSteps] = useState<number[]>([]);

  // Challenge State
  const [challengeTargetX] = useState<number>(2.2);
  const [challengeTargetY] = useState<number>(1.5);
  const [challengeAnswerT1, setChallengeAnswerT1] = useState('');
  const [challengeAnswerT2, setChallengeAnswerT2] = useState('');
  const [challengeScore, setChallengeScore] = useState(0);
  const [challengeFeedback, setChallengeFeedback] = useState<string | null>(null);

  // Compute Forward Kinematics
  const fkResult: ForwardKinematicsResult = useMemo(() => {
    if (controlMode === 'inverse') {
      const ik = computeInverseKinematics(targetX, targetY, link1Len, link2Len);
      const chosenAngles = ikElbowConfig === 'down' ? ik.solutions.elbowDown : ik.solutions.elbowUp;
      return computeForwardKinematics(
        hasThirdLink ? [link1Len, link2Len, link3Len] : [link1Len, link2Len],
        hasThirdLink ? [chosenAngles.theta1Deg, chosenAngles.theta2Deg, theta3] : [chosenAngles.theta1Deg, chosenAngles.theta2Deg]
      );
    }

    return computeForwardKinematics(
      hasThirdLink ? [link1Len, link2Len, link3Len] : [link1Len, link2Len],
      hasThirdLink ? [theta1, theta2, theta3] : [theta1, theta2]
    );
  }, [controlMode, targetX, targetY, link1Len, link2Len, link3Len, hasThirdLink, theta1, theta2, theta3, ikElbowConfig]);

  // Compute Inverse Kinematics for current end-effector position
  const ikResult: InverseKinematicsResult = useMemo(() => {
    return computeInverseKinematics(fkResult.endEffector.x, fkResult.endEffector.y, link1Len, link2Len);
  }, [fkResult.endEffector.x, fkResult.endEffector.y, link1Len, link2Len]);

  const verifyCurrentGuidedStep = () => {
    if (!completedGuidedSteps.includes(guidedStep)) {
      setCompletedGuidedSteps([...completedGuidedSteps, guidedStep]);
    }
    if (guidedStep < 5) {
      setGuidedStep(guidedStep + 1);
    }
  };

  const submitChallenge = () => {
    const ik = computeInverseKinematics(challengeTargetX, challengeTargetY, link1Len, link2Len);
    const uT1 = parseFloat(challengeAnswerT1);
    const uT2 = parseFloat(challengeAnswerT2);

    const matchesDown =
      Math.abs(uT1 - ik.solutions.elbowDown.theta1Deg) < 4.0 &&
      Math.abs(uT2 - ik.solutions.elbowDown.theta2Deg) < 4.0;
    const matchesUp =
      Math.abs(uT1 - ik.solutions.elbowUp.theta1Deg) < 4.0 &&
      Math.abs(uT2 - ik.solutions.elbowUp.theta2Deg) < 4.0;

    if (matchesDown || matchesUp) {
      setChallengeScore((prev) => prev + 50);
      setChallengeFeedback(`Correct! Reached target within tolerance (+50 XP).`);
    } else {
      setChallengeFeedback(
        `Incorrect. Expected [${ik.solutions.elbowDown.theta1Deg}°, ${ik.solutions.elbowDown.theta2Deg}°] or [${ik.solutions.elbowUp.theta1Deg}°, ${ik.solutions.elbowUp.theta2Deg}°].`
      );
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
              Robotics
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <h1 className="font-bold text-cyan-700 text-xs sm:text-sm">Robotic Arm Kinematics</h1>
          </nav>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 hidden sm:inline">
            ID-301
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
                  isActive ? 'text-cyan-700 shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeRobotTab"
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
          <BugReportModal simulationId="robotics-serial-kinematics" moduleName="Robotics Kinematics Lab" />
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
                <div className="flex items-center gap-2 text-cyan-600">
                  <Cpu className="w-5 h-5" />
                  <h1 className="text-xl font-bold text-zinc-900">
                    Robotic Manipulator Kinematics & Denavit-Hartenberg (DH) Convention
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                  Kinematics models the geometric motion of multi-link robotic arms without considering forces or torques. The Denavit-Hartenberg (DH) convention defines coordinate frame assignments to systematically describe kinematic link chains using 4 parameters: link length <MathView math="a_i" />, link twist <MathView math="\alpha_i" />, joint offset <MathView math="d_i" />, and joint angle <MathView math="\theta_i" />.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-600" />
                      Forward Kinematics (FK)
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Maps joint angle configuration space <MathView math="(\theta_1, \theta_2, \theta_3)" /> into end-effector Cartesian workspace coordinates <MathView math="(x_e, y_e, \phi)" />:
                    </p>
                    <div className="bg-white p-2.5 rounded border border-zinc-200 text-center font-mono text-xs">
                      <MathView math="x_e = l_1 \cos\theta_1 + l_2 \cos(\theta_1 + \theta_2)" display />
                      <MathView math="y_e = l_1 \sin\theta_1 + l_2 \sin(\theta_1 + \theta_2)" display />
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-4 space-y-2">
                    <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
                      <Compass className="w-4 h-4 text-indigo-600" />
                      Inverse Kinematics (IK) & Singularity
                    </h3>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Calculates joint angles needed to position the tool tip at a desired target point:
                    </p>
                    <div className="bg-white p-2.5 rounded border border-zinc-200 text-center font-mono text-xs">
                      <MathView math="\cos\theta_2 = \frac{x_e^2 + y_e^2 - l_1^2 - l_2^2}{2 l_1 l_2}" display />
                    </div>
                    <p className="text-[11px] text-zinc-500">
                      When <MathView math="\det(J) = l_1 l_2 \sin\theta_2 = 0" />, the arm enters a kinematic singularity (boundary limit) where instantaneous tool motion in certain Cartesian directions is impossible.
                    </p>
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
                <div className="flex items-center gap-2 text-cyan-600">
                  <Lightbulb className="w-5 h-5" />
                  <h2 className="text-lg font-bold text-zinc-900">Pre-Lab Hypothesis & Prediction</h2>
                </div>
                <p className="text-xs text-zinc-600">
                  Given link lengths <MathView math="l_1 = 2.0\text{ m}" /> and <MathView math="l_2 = 1.5\text{ m}" />, predict the Cartesian end-effector coordinates when Joint 1 is at <strong>0°</strong> and Joint 2 is at <strong>90°</strong>:
                </p>

                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Predicted End-Effector X (metres):
                    </label>
                    <input
                      type="number"
                      value={predEndX}
                      onChange={(e) => setPredEndX(e.target.value)}
                      placeholder="e.g. 2.00"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Predicted End-Effector Y (metres):
                    </label>
                    <input
                      type="number"
                      value={predEndY}
                      onChange={(e) => setPredEndY(e.target.value)}
                      placeholder="e.g. 1.50"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-cyan-500"
                    />
                  </div>

                  <button
                    onClick={() => setPredictionSubmitted(true)}
                    disabled={!predEndX || !predEndY}
                    className="w-full bg-cyan-600 hover:bg-cyan-700 disabled:bg-zinc-200 disabled:text-zinc-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-xs"
                  >
                    Submit Hypothesis & Compare
                  </button>
                </div>

                {predictionSubmitted && (
                  <div className="p-4 rounded-xl border border-cyan-200 bg-cyan-50/70 space-y-2 text-xs">
                    <span className="font-bold text-cyan-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Analytical Verification:
                    </span>
                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div className="bg-white p-3 rounded-lg border border-cyan-100">
                        <span className="text-zinc-600 block">X Coordinate:</span>
                        <span className="font-mono font-bold text-zinc-900">Predicted: {predEndX} m</span>
                        <span className="block font-mono text-cyan-700 font-bold mt-0.5">Exact: 2.00 m</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-cyan-100">
                        <span className="text-zinc-600 block">Y Coordinate:</span>
                        <span className="font-mono font-bold text-zinc-900">Predicted: {predEndY} m</span>
                        <span className="block font-mono text-cyan-700 font-bold mt-0.5">Exact: 1.50 m</span>
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
              {/* Left 2 Cols: Articulated Arm Simulation Rig */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-5 h-5 text-cyan-600" />
                      <div>
                        <h2 className="font-bold text-zinc-900 text-sm sm:text-base">
                          ARTICULATED SERIAL ARM WORKBENCH
                        </h2>
                        <span className="text-[11px] text-zinc-500">
                          Workspace Radius: {fkResult.reachabilityRadius} m | Manipulability: {fkResult.manipulability}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {fkResult.isSingular && (
                        <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                          Kinematic Singularity ⚠
                        </span>
                      )}
                      <div className="flex bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs font-semibold">
                        <button
                          onClick={() => setControlMode('forward')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            controlMode === 'forward' ? 'bg-white text-cyan-700 shadow-xs' : 'text-zinc-600'
                          }`}
                        >
                          Forward (FK)
                        </button>
                        <button
                          onClick={() => setControlMode('inverse')}
                          className={`px-2.5 py-1 rounded-md transition-all ${
                            controlMode === 'inverse' ? 'bg-white text-cyan-700 shadow-xs' : 'text-zinc-600'
                          }`}
                        >
                          Target IK
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* SVG Robot Arm Canvas */}
                  <div
                    className="w-full aspect-16/9 bg-slate-50 border border-zinc-200 rounded-lg relative overflow-hidden flex items-center justify-center p-2 cursor-crosshair"
                    onClick={(e) => {
                      if (controlMode === 'inverse') {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const clickY = e.clientY - rect.top;
                        // Origin is at (rect.width/2, rect.height/2 + 60), scale 60px/m
                        const ox = rect.width / 2;
                        const oy = rect.height / 2 + 60;
                        const scale = 65;
                        const targetMtrX = (clickX - ox) / scale;
                        const targetMtrY = -(clickY - oy) / scale;
                        setTargetX(parseFloat(targetMtrX.toFixed(2)));
                        setTargetY(parseFloat(targetMtrY.toFixed(2)));
                      }
                    }}
                  >
                    <svg viewBox="-5 -2 10 7" className="w-full h-full text-zinc-800">
                      {/* Reachability Boundary Annulus */}
                      <circle
                        cx="0"
                        cy="0"
                        r={fkResult.reachabilityRadius}
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="0.03"
                        strokeDasharray="0.1 0.1"
                      />
                      <line x1="-5" y1="0" x2="5" y2="0" stroke="#cbd5e1" strokeWidth="0.04" />
                      <line x1="0" y1="-2" x2="0" y2="5" stroke="#cbd5e1" strokeWidth="0.04" />

                      {/* Base Pedestal */}
                      <rect x="-0.4" y="-0.3" width="0.8" height="0.3" rx="0.08" className="fill-zinc-800" />
                      <circle cx="0" cy="0" r="0.25" className="fill-zinc-900" />

                      {/* Robot Arm Links */}
                      {(() => {
                        const j = fkResult.joints;
                        return (
                          <g>
                            {/* Link 1 */}
                            <line
                              x1={j[0]!.x}
                              y1={j[0]!.y}
                              x2={j[1]!.x}
                              y2={j[1]!.y}
                              stroke="#0284c7"
                              strokeWidth="0.22"
                              strokeLinecap="round"
                            />
                            {/* Link 2 */}
                            <line
                              x1={j[1]!.x}
                              y1={j[1]!.y}
                              x2={j[2]!.x}
                              y2={j[2]!.y}
                              stroke="#06b6d4"
                              strokeWidth="0.18"
                              strokeLinecap="round"
                            />
                            {/* Link 3 (if active) */}
                            {j[3] && (
                              <line
                                x1={j[2]!.x}
                                y1={j[2]!.y}
                                x2={j[3]!.x}
                                y2={j[3]!.y}
                                stroke="#14b8a6"
                                strokeWidth="0.14"
                                strokeLinecap="round"
                              />
                            )}

                            {/* Servo Joint Motors */}
                            {j.map((pt, idx) => (
                              <g key={idx}>
                                <circle cx={pt.x} cy={pt.y} r="0.18" className="fill-white stroke-zinc-900 stroke-[0.04]" />
                                <circle cx={pt.x} cy={pt.y} r="0.08" className="fill-cyan-600" />
                              </g>
                            ))}

                            {/* End-Effector Gripper Tool */}
                            <circle cx={fkResult.endEffector.x} cy={fkResult.endEffector.y} r="0.12" className="fill-rose-500" />
                            <text
                              x={fkResult.endEffector.x + 0.2}
                              y={fkResult.endEffector.y + 0.1}
                              fontSize="0.22"
                              className="fill-zinc-900 font-mono font-bold"
                            >
                              TCP ({fkResult.endEffector.x.toFixed(2)}, {fkResult.endEffector.y.toFixed(2)})
                            </text>

                            {/* Inverse Kinematics Drag Target Marker */}
                            {controlMode === 'inverse' && (
                              <g>
                                <circle
                                  cx={targetX}
                                  cy={targetY}
                                  r="0.2"
                                  className="fill-none stroke-rose-600 stroke-[0.05] stroke-dasharray-[0.08,0.08]"
                                />
                                <circle cx={targetX} cy={targetY} r="0.05" className="fill-rose-600" />
                              </g>
                            )}
                          </g>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 px-1 text-zinc-600">
                    <span className="text-[11px] text-zinc-500">
                      {controlMode === 'inverse'
                        ? 'Click anywhere on canvas to command end-effector IK target'
                        : 'Adjust joint rotation angle knobs on the right panel'}
                    </span>
                    <span className="font-mono text-cyan-700 font-bold">
                      Tip: ({fkResult.endEffector.x.toFixed(2)} m, {fkResult.endEffector.y.toFixed(2)} m)
                    </span>
                  </div>
                </div>

                {/* Telemetry & DH Parameter Frame Diagnostics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">End-Effector X</span>
                    <span className="text-base font-mono font-bold text-zinc-900">
                      {fkResult.endEffector.x.toFixed(3)} m
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">End-Effector Y</span>
                    <span className="text-base font-mono font-bold text-zinc-900">
                      {fkResult.endEffector.y.toFixed(3)} m
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Manipulability</span>
                    <span className={`text-base font-mono font-bold ${fkResult.isSingular ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {fkResult.manipulability.toFixed(3)}
                    </span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-zinc-200 shadow-xs">
                    <span className="text-[10px] text-zinc-500 uppercase block font-semibold">Total Reach</span>
                    <span className="text-base font-mono font-bold text-cyan-700">
                      {fkResult.reachabilityRadius} m
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Col: Kinematic Controls */}
              <div className="space-y-4">
                <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
                  <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-200 pb-2">
                    {controlMode === 'forward' ? 'Joint Angle Servo Controls' : 'Inverse Kinematics Target'}
                  </h3>

                  {controlMode === 'forward' ? (
                    <>
                      {/* Theta 1 */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                          <span>Base Joint (θ₁)</span>
                          <span className="font-mono text-cyan-700">{theta1}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={theta1}
                          onChange={(e) => setTheta1(parseInt(e.target.value))}
                          className="w-full accent-cyan-600 cursor-pointer"
                        />
                      </div>

                      {/* Theta 2 */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                          <span>Elbow Joint (θ₂)</span>
                          <span className="font-mono text-cyan-700">{theta2}°</span>
                        </div>
                        <input
                          type="range"
                          min="-180"
                          max="180"
                          value={theta2}
                          onChange={(e) => setTheta2(parseInt(e.target.value))}
                          className="w-full accent-cyan-600 cursor-pointer"
                        />
                      </div>

                      {/* Theta 3 */}
                      {hasThirdLink && (
                        <div>
                          <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                            <span>Wrist Joint (θ₃)</span>
                            <span className="font-mono text-cyan-700">{theta3}°</span>
                          </div>
                          <input
                            type="range"
                            min="-180"
                            max="180"
                            value={theta3}
                            onChange={(e) => setTheta3(parseInt(e.target.value))}
                            className="w-full accent-cyan-600 cursor-pointer"
                          />
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Target X Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                          <span>Target X</span>
                          <span className="font-mono text-rose-600">{targetX.toFixed(2)} m</span>
                        </div>
                        <input
                          type="range"
                          min="-3.5"
                          max="3.5"
                          step="0.05"
                          value={targetX}
                          onChange={(e) => setTargetX(parseFloat(e.target.value))}
                          className="w-full accent-rose-600 cursor-pointer"
                        />
                      </div>

                      {/* Target Y Slider */}
                      <div>
                        <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                          <span>Target Y</span>
                          <span className="font-mono text-rose-600">{targetY.toFixed(2)} m</span>
                        </div>
                        <input
                          type="range"
                          min="-1.5"
                          max="3.5"
                          step="0.05"
                          value={targetY}
                          onChange={(e) => setTargetY(parseFloat(e.target.value))}
                          className="w-full accent-rose-600 cursor-pointer"
                        />
                      </div>

                      {/* Elbow Configuration Selector */}
                      <div>
                        <label className="block text-xs font-semibold text-zinc-700 mb-1">
                          Elbow Branch Solution:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setIkElbowConfig('down')}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                              ikElbowConfig === 'down'
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            Elbow Down (+θ₂)
                          </button>
                          <button
                            onClick={() => setIkElbowConfig('up')}
                            className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
                              ikElbowConfig === 'up'
                                ? 'bg-cyan-600 text-white shadow-xs'
                                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                            }`}
                          >
                            Elbow Up (-θ₂)
                          </button>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Link Lengths Toggles */}
                  <div className="pt-2 border-t border-zinc-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-zinc-700">3-Link Manipulator</span>
                      <input
                        type="checkbox"
                        checked={hasThirdLink}
                        onChange={(e) => setHasThirdLink(e.target.checked)}
                        className="rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTheta1(30);
                      setTheta2(45);
                      setTheta3(-20);
                      setTargetX(2.5);
                      setTargetY(1.8);
                      setControlMode('forward');
                    }}
                    className="w-full flex items-center justify-center gap-1.5 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 py-2 rounded-lg font-semibold transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset Baseline Arm Pose
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
                  <div className="flex items-center gap-2 text-cyan-600">
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
                      title: 'Step 1: Compute Base DH Transformation Matrix T01',
                      instructions: 'Apply Denavit-Hartenberg parameter assignment to Link 1 with a_1 = 2.0m and d_1 = 0.',
                    },
                    {
                      step: 2,
                      title: 'Step 2: Verify End-Effector Direct Coordinates',
                      instructions: 'Multiply homogeneous transformation matrices T02 = T01 * T12 to compute end-effector position.',
                    },
                    {
                      step: 3,
                      title: 'Step 3: Investigate Kinematic Boundary Singularity (θ₂ = 0°)',
                      instructions: 'Set θ₂ = 0° to observe complete arm extension. Check that determinant det(J) vanishes to zero.',
                    },
                    {
                      step: 4,
                      title: 'Step 4: Solve Closed-Form Geometric Inverse Kinematics',
                      instructions: 'Command an arbitrary target within workspace annulus and compute elbow-up and elbow-down solutions.',
                    },
                    {
                      step: 5,
                      title: 'Step 5: Inspect Manipulability Ellipsoid',
                      instructions: 'Observe Yoshikawa manipulability metric reaching maximum when link axes are orthogonal (θ₂ = ±90°).',
                    },
                  ].map((s) => (
                    <div
                      key={s.step}
                      className={`p-4 rounded-xl border transition-all ${
                        guidedStep === s.step
                          ? 'border-cyan-400 bg-cyan-50/50 shadow-xs'
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
                            <span className="w-5 h-5 rounded-full bg-cyan-100 text-cyan-800 text-xs flex items-center justify-center font-bold">
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
                          className="bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors shadow-xs"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* DH Transformation Matrix T02 */}
                <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                  <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                    <Compass className="w-4 h-4 text-cyan-600" />
                    Overall Homogeneous Transformation Matrix [T]
                  </h3>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-4 font-mono text-xs overflow-x-auto text-center">
                    <table className="mx-auto">
                      <tbody>
                        {fkResult.transformationMatrices[1]?.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((val, cIdx) => (
                              <td key={cIdx} className="px-2.5 py-1 text-zinc-800">
                                {val.toFixed(3)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Analytical Jacobian Matrix J */}
                <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                  <h3 className="font-bold text-zinc-900 text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    Positional Jacobian Matrix [J]
                  </h3>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-4 font-mono text-xs overflow-x-auto text-center">
                    <table className="mx-auto">
                      <tbody>
                        {fkResult.jacobian.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {row.map((val, cIdx) => (
                              <td key={cIdx} className="px-3 py-1 text-zinc-800">
                                {val.toFixed(3)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="text-xs text-zinc-600 flex justify-between pt-1">
                    <span>Determinant: <strong>{fkResult.manipulability}</strong></span>
                    <span>Singularity status: <strong>{fkResult.isSingular ? 'Singular' : 'Well-Conditioned'}</strong></span>
                  </div>
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
                      Inverse Kinematics Reaching Challenge
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Score: {challengeScore} XP
                  </span>
                </div>

                <p className="text-xs text-zinc-600">
                  Solve for joint angles <MathView math="\theta_1" /> and <MathView math="\theta_2" /> to position the end-effector at Cartesian target coordinates: <strong>({challengeTargetX} m, {challengeTargetY} m)</strong> with <MathView math="l_1 = 2.0\text{ m}, l_2 = 1.5\text{ m}" />:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Joint Angle θ₁ (Degrees):
                      </label>
                      <input
                        type="number"
                        value={challengeAnswerT1}
                        onChange={(e) => setChallengeAnswerT1(e.target.value)}
                        placeholder="e.g. 25.5"
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-700 mb-1">
                        Joint Angle θ₂ (Degrees):
                      </label>
                      <input
                        type="number"
                        value={challengeAnswerT2}
                        onChange={(e) => setChallengeAnswerT2(e.target.value)}
                        placeholder="e.g. 52.3"
                        className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={submitChallenge}
                    disabled={!challengeAnswerT1 || !challengeAnswerT2}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-200 disabled:text-zinc-500 text-white font-semibold text-sm py-2.5 rounded-lg transition-colors shadow-xs"
                  >
                    Submit IK Angles
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
                      ID-301 Robotics Laboratory Practicum Report
                    </h2>
                    <span className="text-xs text-zinc-500">
                      IIT Delhi & IIIT Hyderabad • Robotics and Mechanism Analysis Laboratory
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
                    <span className="text-zinc-500 block text-[10px]">End Effector X</span>
                    <span className="font-bold text-zinc-900">{fkResult.endEffector.x.toFixed(3)} m</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">End Effector Y</span>
                    <span className="font-bold text-zinc-900">{fkResult.endEffector.y.toFixed(3)} m</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Manipulability</span>
                    <span className="font-bold text-cyan-700">{fkResult.manipulability.toFixed(3)}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[10px]">Reach Radius</span>
                    <span className="font-bold text-zinc-900">{fkResult.reachabilityRadius} m</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-600 space-y-2">
                  <h4 className="font-bold text-zinc-900">Laboratory Conclusions:</h4>
                  <p>
                    1. Forward kinematics was verified using standard Denavit-Hartenberg parameter matrices, mapping joint angles into global coordinate frames.
                  </p>
                  <p>
                    2. Analytical inverse kinematics accurately mapped target Cartesian positions into dual elbow-up and elbow-down configurations.
                  </p>
                  <p>
                    3. Kinematic singularities occur when <MathView math="\sin\theta_2 = 0" />, reducing the rank of the Jacobian matrix and limiting degree-of-freedom reach.
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
