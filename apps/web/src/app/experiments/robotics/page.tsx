/**
 * Prismora Robotics & Control Systems Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIIT Hyderabad & IIT Kharagpur
 * Experiments:
 * 1. Planar 2-DOF Serial Robotic Arm Kinematics (ROB-301)
 * 2. Closed-Loop PID Controller Tuning & Dynamic Step Response (ROB-304)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  RoboticArmEngine,
  DEFAULT_ROBOTIC_ARM_PARAMS,
  type RoboticArmParameters,
  PidControllerEngine,
  DEFAULT_PID_PARAMS,
  type PidParameters,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  Bot,
  ChevronRight,
  Cpu,
  Download,
  Layers,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

type RoboticsExpId = 'arm-kinematics' | 'pid-tuning';

interface RoboticsExperimentDef {
  readonly id: RoboticsExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const ROBOTICS_EXPERIMENTS: readonly RoboticsExperimentDef[] = [
  {
    id: 'arm-kinematics',
    title: 'Planar 2-DOF Serial Robotic Arm Kinematics',
    shortTitle: 'Arm Kinematics',
    courseCode: 'ROB-301 (Robotics & Manipulator Mechanics)',
    benchmark: 'IIIT Hyderabad & IIT Delhi',
    description: 'Forward kinematics via Denavit-Hartenberg (DH) matrices, analytical inverse kinematics solver, and 2x2 Jacobian singularity HUD.',
    color: '#06B6D4',
    equations: [
      'x_e = l_1 \\cos\\theta_1 + l_2 \\cos(\\theta_1 + \\theta_2)',
      'y_e = l_1 \\sin\\theta_1 + l_2 \\sin(\\theta_1 + \\theta_2)',
      '\\det(J) = l_1 l_2 \\sin\\theta_2 \\quad (\\text{Singularity when } \\theta_2 = 0^\\circ, 180^\\circ)',
    ],
  },
  {
    id: 'pid-tuning',
    title: 'Closed-Loop PID Controller Tuning & Step Response',
    shortTitle: 'PID Tuning',
    courseCode: 'ROB-304 (Control Systems Engineering)',
    benchmark: 'IIT Kharagpur & Dayalbagh',
    description: 'Second-order plant feedback loop, proportional Kp, integral Ki, derivative Kd tuning, rise time tr, peak overshoot Mp%, and settling time ts.',
    color: '#8B5CF6',
    equations: [
      'u(t) = K_p e(t) + K_i \\int e(\\tau) d\\tau + K_d \\frac{de(t)}{dt}',
      'G(s) = \\frac{\\omega_n^2}{s^2 + 2\\zeta \\omega_n s + \\omega_n^2}',
      'M_p = e^{-\\frac{\\pi \\zeta}{\\sqrt{1 - \\zeta^2}}} \\times 100\\%',
    ],
  },
];

function RoboticsWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as RoboticsExpId) || 'arm-kinematics';
  const [activeExpId, setActiveExpId] = useState<RoboticsExpId>(
    ROBOTICS_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'arm-kinematics',
  );

  const activeExp = useMemo(
    () => ROBOTICS_EXPERIMENTS.find((e) => e.id === activeExpId) ?? ROBOTICS_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // ==========================================
  // EXP 1: Arm Kinematics States
  // ==========================================
  const [theta1Deg, setTheta1Deg] = useState<number>(35);
  const [theta2Deg, setTheta2Deg] = useState<number>(45);
  const [link1, setLink1] = useState<number>(2.5);
  const [link2, setLink2] = useState<number>(2.0);

  const armResult = useMemo(
    () =>
      RoboticArmEngine.computeForwardKinematics({
        link1LengthM: link1,
        link2LengthM: link2,
        joint1AngleRad: (theta1Deg * Math.PI) / 180,
        joint2AngleRad: (theta2Deg * Math.PI) / 180,
      }),
    [link1, link2, theta1Deg, theta2Deg],
  );

  // ==========================================
  // EXP 2: PID Controller States
  // ==========================================
  const [pidParams, setPidParams] = useState<PidParameters>(DEFAULT_PID_PARAMS);
  const pidResult = useMemo(() => PidControllerEngine.compute(pidParams), [pidParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Link href="/" className="hover:text-blue-600 transition-colors">Prismora</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/library" className="hover:text-blue-600 transition-colors">Disciplines</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-zinc-900">Robotics &amp; Control Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`rob-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ROBOTICS_EXPERIMENTS.map((exp) => {
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
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: exp.color }} />
                <span>{exp.shortTitle}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-rob-tab"
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

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Banner */}
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
            {activeExpId === 'arm-kinematics' && (
              <Link
                href="/experiments/robotics/kinematics"
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 text-white text-xs font-bold hover:bg-cyan-700 transition-colors shadow-2xs flex items-center gap-1.5"
              >
                <span>Full Screen Manipulator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Experiment Content */}
        <AnimatePresence mode="wait">
          {activeExpId === 'arm-kinematics' && (
            <motion.div
              key="arm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* Left Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">2-DOF Serial Link Manipulator</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-700 font-bold border border-cyan-200">
                      End-Effector: ({armResult.endEffectorX.toFixed(2)}m, {armResult.endEffectorY.toFixed(2)}m)
                    </span>
                  </div>

                  {/* SVG 2-DOF Arm Diagram */}
                  <div className="h-64 rounded-xl bg-gradient-to-b from-cyan-50/40 to-blue-50/30 border border-zinc-200 p-4 relative overflow-hidden flex items-center justify-center">
                    <svg className="w-full h-full max-h-56" viewBox="-1 -1 6 5">
                      {/* Grid circles */}
                      <circle cx="0" cy="0" r={link1} fill="none" stroke="#E2E8F0" strokeWidth="0.05" strokeDasharray="0.1 0.1" />
                      <circle cx="0" cy="0" r={link1 + link2} fill="none" stroke="#CBD5E1" strokeWidth="0.06" />

                      {/* Base origin */}
                      <circle cx="0" cy="0" r="0.2" fill="#0F172A" />

                      {/* Link 1 */}
                      <line
                        x1="0"
                        y1="0"
                        x2={armResult.joint2X}
                        y2={armResult.joint2Y}
                        stroke="#0284C7"
                        strokeWidth="0.18"
                        strokeLinecap="round"
                      />

                      {/* Joint 2 */}
                      <circle cx={armResult.joint2X} cy={armResult.joint2Y} r="0.16" fill="#0284C7" stroke="#FFFFFF" strokeWidth="0.05" />

                      {/* Link 2 */}
                      <line
                        x1={armResult.joint2X}
                        y1={armResult.joint2Y}
                        x2={armResult.endEffectorX}
                        y2={armResult.endEffectorY}
                        stroke="#0D9488"
                        strokeWidth="0.14"
                        strokeLinecap="round"
                      />

                      {/* End-Effector Gripper */}
                      <circle cx={armResult.endEffectorX} cy={armResult.endEffectorY} r="0.18" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="0.06" />
                    </svg>
                  </div>

                  {/* Readout stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">End-Effector X</span>
                      <span className="text-base font-mono font-black text-cyan-700">{armResult.endEffectorX.toFixed(2)} m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">End-Effector Y</span>
                      <span className="text-base font-mono font-black text-emerald-700">{armResult.endEffectorY.toFixed(2)} m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Reach Distance</span>
                      <span className="text-base font-mono font-black text-zinc-900">
                        {Math.sqrt(armResult.endEffectorX ** 2 + armResult.endEffectorY ** 2).toFixed(2)} m
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Jacobian Det(J)</span>
                      <span className="text-base font-mono font-black text-purple-600">
                        {armResult.jacobianDeterminant.toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-cyan-600" />
                    <span>Joint Servo Angles</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Base Joint (θ1):</span>
                        <span className="font-bold text-cyan-700">{theta1Deg}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="180"
                        step="1"
                        value={theta1Deg}
                        onChange={(e) => setTheta1Deg(parseInt(e.target.value))}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Elbow Joint (θ2):</span>
                        <span className="font-bold text-teal-700">{theta2Deg}°</span>
                      </div>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        step="1"
                        value={theta2Deg}
                        onChange={(e) => setTheta2Deg(parseInt(e.target.value))}
                        className="w-full accent-teal-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Equations */}
                  <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase block">DH Kinematics Equations</span>
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

          {activeExpId === 'pid-tuning' && (
            <motion.div
              key="pid"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              {/* PID Left Visualizer */}
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                    <span className="text-xs font-mono font-bold text-zinc-600 uppercase">Closed-Loop Step Response y(t)</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-bold border border-purple-200">
                      Overshoot Mp = {pidResult.overshootPercent}% | Settling ts = {pidResult.settlingTimeS ?? '—'} s
                    </span>
                  </div>

                  {/* Step Response Plot */}
                  <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
                    <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                      <span className="text-purple-400 font-bold">Output y(t) vs Time (seconds)</span>
                      <span>Steady-State Error: {pidResult.steadyStateError}</span>
                    </div>

                    <svg className="w-full h-40" viewBox="0 0 400 120">
                      <line x1="30" y1="100" x2="380" y2="100" stroke="#334155" strokeWidth="1" />
                      {/* Setpoint dashed line (y = setpoint) */}
                      <line x1="30" y1="50" x2="380" y2="50" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="4 2" />

                      {(() => {
                        const maxT = pidParams.simulationDurationS;
                        const maxVal = Math.max(1.8 * pidParams.setpoint, pidResult.peakValue * 1.15);
                        const pts = pidResult.trajectory
                          .map((p) => {
                            const x = 30 + (p.timeS / maxT) * 350;
                            const y = 100 - (p.output / maxVal) * 85;
                            return `${x.toFixed(1)},${y.toFixed(1)}`;
                          })
                          .join(' ');
                        return <polyline fill="none" stroke="#A855F7" strokeWidth="2.5" points={pts} />;
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-400">
                      <span>t = 0 s</span>
                      <span className="text-zinc-300">Target Setpoint = {pidParams.setpoint}</span>
                      <span>Rise Time tr = {pidResult.riseTimeS ?? '—'} s</span>
                      <span>t = {pidParams.simulationDurationS} s</span>
                    </div>
                  </div>

                  {/* Telemetry Metrics */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Overshoot Mp%</span>
                      <span className="text-base font-mono font-black text-purple-600">{pidResult.overshootPercent}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Rise Time tr</span>
                      <span className="text-base font-mono font-black text-blue-600">{pidResult.riseTimeS ?? '—'} s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Settling Time ts</span>
                      <span className="text-base font-mono font-black text-emerald-600">{pidResult.settlingTimeS ?? '—'} s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Peak Value</span>
                      <span className="text-base font-mono font-black text-zinc-900">{pidResult.peakValue}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PID Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>PID Gain Parameters</span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Proportional Gain (Kp):</span>
                        <span className="font-bold text-purple-600">{pidParams.kp}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="35"
                        step="0.5"
                        value={pidParams.kp}
                        onChange={(e) => setPidParams({ ...pidParams, kp: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Integral Gain (Ki):</span>
                        <span className="font-bold text-blue-600">{pidParams.ki}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="15"
                        step="0.5"
                        value={pidParams.ki}
                        onChange={(e) => setPidParams({ ...pidParams, ki: parseFloat(e.target.value) })}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono mb-1">
                        <span className="text-zinc-600">Derivative Gain (Kd):</span>
                        <span className="font-bold text-emerald-600">{pidParams.kd}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="8"
                        step="0.2"
                        value={pidParams.kd}
                        onChange={(e) => setPidParams({ ...pidParams, kd: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Equations */}
                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">PID Control Law</span>
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

export default function RoboticsWorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Robotics Laboratory...</div>}>
      <RoboticsWorkbenchContent />
    </Suspense>
  );
}
