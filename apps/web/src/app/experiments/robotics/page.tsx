/**
 * Prismora Robotics & Control Systems Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIIT Hyderabad, IIT Kharagpur, IIT Kanpur & Dayalbagh
 * Experiments:
 * 1. Planar 2-DOF Serial Robotic Arm Kinematics & Singularities (ROB-301)
 * 2. Closed-Loop PID Controller Tuning & Dynamic Step Response (ROB-304)
 * 3. Mobile Robotics: Differential Drive Kinematics & Trajectory Odometry (ROB-306)
 * 4. Inverted Pendulum on a Cart: State-Space LQR Stabilization (ROB-308)
 * 5. Frequency Response: Bode Plot Stability & Phase/Gain Margins (ROB-310)
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
  DifferentialDriveEngine,
  DEFAULT_DIFF_DRIVE_PARAMS,
  type DifferentialDriveParameters,
  InvertedPendulumEngine,
  DEFAULT_INVERTED_PENDULUM_PARAMS,
  type InvertedPendulumParameters,
  BodePlotEngine,
  DEFAULT_BODE_PARAMS,
  type BodePlotParameters,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  Bot,
  ChevronRight,
  Cpu,
  Download,
  Gauge,
  Layers,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

type RoboticsExpId =
  | 'arm-kinematics'
  | 'pid-tuning'
  | 'differential-drive'
  | 'inverted-pendulum'
  | 'bode-plot';

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
    title: 'Planar 2-DOF Serial Robotic Arm Kinematics & Singularities',
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
  {
    id: 'differential-drive',
    title: 'Differential Drive Mobile Robot Kinematics & Odometry',
    shortTitle: 'Differential Drive Robot',
    courseCode: 'ROB-306 (Autonomous Mobile Robotics)',
    benchmark: 'IIIT Hyderabad & IIT Kanpur',
    description: 'Unicycle robot kinematics, left/right wheel speeds, linear velocity v, angular yaw rate omega, Instantaneous Center of Curvature (ICC), and 2D path tracking.',
    color: '#10B981',
    equations: [
      'v = \\frac{v_R + v_L}{2}, \\quad \\omega = \\frac{v_R - v_L}{L}',
      'R_{icc} = \\frac{L}{2} \\frac{v_R + v_L}{v_R - v_L}',
      '\\dot{x} = v \\cos\\theta, \\quad \\dot{y} = v \\sin\\theta, \\quad \\dot{\\theta} = \\omega',
    ],
  },
  {
    id: 'inverted-pendulum',
    title: 'Inverted Pendulum on a Cart: State-Space LQR Stabilization',
    shortTitle: 'Inverted Pendulum Cart',
    courseCode: 'ROB-308 (Advanced Control & State Space)',
    benchmark: 'IIT Kharagpur & Dayalbagh',
    description: 'Underactuated non-linear mechanical benchmark, linearized 4-state state-space model, full-state feedback LQR control, and angle disturbance rejection.',
    color: '#EF4444',
    equations: [
      '\\dot{\\mathbf{x}} = A \\mathbf{x} + B u',
      'u = -K \\mathbf{x} = - (k_1 x + k_2 \\dot{x} + k_3 \\theta + k_4 \\dot{\\theta})',
      '\\omega_0 = \\sqrt{\\frac{m g l (M + m)}{I(M+m) + M m l^2}}',
    ],
  },
  {
    id: 'bode-plot',
    title: 'Bode Plot Frequency Response: Stability, Gain & Phase Margins',
    shortTitle: 'Bode Stability Margins',
    courseCode: 'ROB-310 (Linear Control Systems)',
    benchmark: 'IIT Roorkee & IIT Kharagpur',
    description: 'Logarithmic magnitude and phase frequency response curves, gain crossover frequency wgc, phase margin PM, phase crossover wpc, and closed-loop stability verification.',
    color: '#F59E0B',
    equations: [
      'M_{dB} = 20 \\log_{10} |G(j\\omega)|, \\quad \\phi = \\angle G(j\\omega)',
      '\\text{PM} = 180^\\circ + \\phi(\\omega_{gc})',
      '\\text{GM} = -20 \\log_{10} |G(j\\omega_{pc})|',
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
  const [link1M, setLink1M] = useState<number>(1.2);
  const [link2M, setLink2M] = useState<number>(0.9);

  const armResult = useMemo(
    () =>
      RoboticArmEngine.computeForwardKinematics({
        link1LengthM: link1M,
        link2LengthM: link2M,
        theta1Deg,
        theta2Deg,
      }),
    [link1M, link2M, theta1Deg, theta2Deg],
  );

  // ==========================================
  // EXP 2: PID Controller States
  // ==========================================
  const [pidParams, setPidParams] = useState<PidParameters>(DEFAULT_PID_PARAMS);
  const pidResult = useMemo(() => PidControllerEngine.compute(pidParams), [pidParams]);

  // ==========================================
  // EXP 3: Differential Drive States
  // ==========================================
  const [diffParams, setDiffParams] = useState<DifferentialDriveParameters>(DEFAULT_DIFF_DRIVE_PARAMS);
  const diffResult = useMemo(() => DifferentialDriveEngine.compute(diffParams), [diffParams]);

  // ==========================================
  // EXP 4: Inverted Pendulum States
  // ==========================================
  const [pendulumParams, setPendulumParams] = useState<InvertedPendulumParameters>(DEFAULT_INVERTED_PENDULUM_PARAMS);
  const pendulumResult = useMemo(() => InvertedPendulumEngine.compute(pendulumParams), [pendulumParams]);

  // ==========================================
  // EXP 5: Bode Plot States
  // ==========================================
  const [bodeParams, setBodeParams] = useState<BodePlotParameters>(DEFAULT_BODE_PARAMS);
  const bodeResult = useMemo(() => BodePlotEngine.compute(bodeParams), [bodeParams]);

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
            <span className="font-bold text-zinc-900">Robotics & Control Systems Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`rob-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Switcher Tabs */}
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
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: exp.color }}
                />
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

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: ARM KINEMATICS */}
          {activeExpId === 'arm-kinematics' && (
            <motion.div
              key="arm-kinematics"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 text-cyan-700 border border-cyan-200">
                      det(J) = {armResult.jacobianDeterminant.toFixed(3)} ({armResult.isNearSingularity ? 'Near Singularity' : 'Regular Pose'})
                    </span>
                  </div>

                  {/* SVG 2-DOF Arm Visualizer */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      {(() => {
                        const originX = 120;
                        const originY = 170;
                        const scale = 75; // px per metre

                        const { elbowPosition, endEffectorPosition } = armResult;
                        const Ex = originX + elbowPosition.x * scale;
                        const Ey = originY - elbowPosition.y * scale;
                        const EEx = originX + endEffectorPosition.x * scale;
                        const EEy = originY - endEffectorPosition.y * scale;

                        return (
                          <>
                            {/* Base pedestal */}
                            <rect x={originX - 20} y={originY} width="40" height="20" fill="#475569" rx="3" />
                            {/* Link 1 */}
                            <line x1={originX} y1={originY} x2={Ex} y2={Ey} stroke="#06B6D4" strokeWidth="6" strokeLinecap="round" />
                            {/* Link 2 */}
                            <line x1={Ex} y1={Ey} x2={EEx} y2={EEy} stroke="#38BDF8" strokeWidth="5" strokeLinecap="round" />

                            {/* Base joint */}
                            <circle cx={originX} cy={originY} r="7" fill="#F8FAFC" stroke="#09090B" strokeWidth="2" />
                            {/* Elbow joint */}
                            <circle cx={Ex} cy={Ey} r="6" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1.5" />
                            {/* End-effector gripper */}
                            <circle cx={EEx} cy={EEy} r="6" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />
                            <text x={EEx + 10} y={EEy - 5} fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">
                              P({endEffectorPosition.x.toFixed(2)}, {endEffectorPosition.y.toFixed(2)})m
                            </text>
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">End-Effector X</span>
                      <span className="text-base font-mono font-black text-cyan-600">{armResult.endEffectorPosition.x.toFixed(3)} m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">End-Effector Y</span>
                      <span className="text-base font-mono font-black text-zinc-900">{armResult.endEffectorPosition.y.toFixed(3)} m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Reach Distance</span>
                      <span className="text-base font-mono font-black text-blue-600">{armResult.reachDistanceM.toFixed(3)} m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Manipulability Index</span>
                      <span className="text-base font-mono font-black text-emerald-600">{armResult.manipulabilityIndex.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-cyan-600" />
                    <span>Joint Angle Actuators</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Base Angle (θ1):</span>
                        <span className="font-bold text-cyan-600">{theta1Deg}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="180"
                        step="2"
                        value={theta1Deg}
                        onChange={(e) => setTheta1Deg(parseFloat(e.target.value))}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Elbow Angle (θ2):</span>
                        <span className="font-bold text-sky-600">{theta2Deg}°</span>
                      </div>
                      <input
                        type="range"
                        min="-150"
                        max="150"
                        step="2"
                        value={theta2Deg}
                        onChange={(e) => setTheta2Deg(parseFloat(e.target.value))}
                        className="w-full accent-sky-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Link 1 Length:</span>
                        <span className="font-bold text-zinc-900">{link1M} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="2.0"
                        step="0.1"
                        value={link1M}
                        onChange={(e) => setLink1M(parseFloat(e.target.value))}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase block">Robotics Kinematics</span>
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

          {/* TAB 2: PID CONTROLLER */}
          {activeExpId === 'pid-tuning' && (
            <motion.div
              key="pid-tuning"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                      Overshoot Mp = {pidResult.peakOvershootPct.toFixed(1)}% (ts = {pidResult.settlingTimeSec.toFixed(2)}s)
                    </span>
                  </div>

                  {/* Step Response Curve */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#334155" strokeWidth="1.5" />

                      {/* Setpoint Reference Line y = 1.0 */}
                      <line x1="40" y1="70" x2="480" y2="70" stroke="#EF4444" strokeWidth="1" strokeDasharray="4,4" />

                      {(() => {
                        const pts = pidResult.stepResponsePoints;
                        const maxT = pts[pts.length - 1]?.timeSec ?? 10;
                        const maxY = Math.max(1.5, ...pts.map((p) => p.outputY));
                        const toX = (t: number) => 40 + (t / maxT) * 440;
                        const toY = (y: number) => 170 - (y / maxY) * 150;

                        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.timeSec).toFixed(1)} ${toY(p.outputY).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#A855F7" strokeWidth="2.5" />;
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Time t (s)</span>
                      <span className="text-purple-400">Closed-Loop Step Response y(t)</span>
                      <span>Rise Time tr = {pidResult.riseTimeSec.toFixed(2)}s</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Peak Overshoot</span>
                      <span className="text-base font-mono font-black text-purple-600">{pidResult.peakOvershootPct.toFixed(1)}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Settling Time ts</span>
                      <span className="text-base font-mono font-black text-zinc-900">{pidResult.settlingTimeSec.toFixed(2)} s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Steady Error ess</span>
                      <span className="text-base font-mono font-black text-blue-600">{(pidResult.steadyStateError * 100).toFixed(2)}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Stability Check</span>
                      <span className="text-base font-mono font-black text-emerald-600">{pidResult.isStable ? 'Stable' : 'Unstable'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>PID Controller Gains</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Proportional Gain (Kp):</span>
                        <span className="font-bold text-zinc-900">{pidParams.kp}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="20"
                        step="0.5"
                        value={pidParams.kp}
                        onChange={(e) => setPidParams({ ...pidParams, kp: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Integral Gain (Ki):</span>
                        <span className="font-bold text-zinc-900">{pidParams.ki}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.2"
                        value={pidParams.ki}
                        onChange={(e) => setPidParams({ ...pidParams, ki: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Derivative Gain (Kd):</span>
                        <span className="font-bold text-zinc-900">{pidParams.kd}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={pidParams.kd}
                        onChange={(e) => setPidParams({ ...pidParams, kd: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">Control Equations</span>
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

          {/* TAB 3: DIFFERENTIAL DRIVE ROBOT */}
          {activeExpId === 'differential-drive' && (
            <motion.div
              key="differential-drive"
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
                      Linear v = {diffResult.linearVelocityMPerS.toFixed(2)} m/s (ω = {diffResult.angularVelocityRadPerS.toFixed(2)} rad/s)
                    </span>
                  </div>

                  {/* 2D Trajectory Arena */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      {/* Grid lines */}
                      <line x1="250" y1="20" x2="250" y2="200" stroke="#27272A" strokeWidth="1" strokeDasharray="4,4" />
                      <line x1="40" y1="110" x2="460" y2="110" stroke="#27272A" strokeWidth="1" strokeDasharray="4,4" />

                      {/* Robot Trajectory Trail */}
                      {(() => {
                        const pts = diffResult.trajectoryPoints;
                        const originX = 140;
                        const originY = 160;
                        const scale = 30; // px per metre
                        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${originX + p.xM * scale} ${originY - p.yM * scale}`).join(' ');

                        const lastPt = pts[pts.length - 1] ?? { xM: 0, yM: 0, headingDeg: 0 };
                        const rx = originX + lastPt.xM * scale;
                        const ry = originY - lastPt.yM * scale;

                        return (
                          <>
                            <path d={path} fill="none" stroke="#10B981" strokeWidth="2.5" />
                            {/* Robot Chassis icon */}
                            <circle cx={rx} cy={ry} r="9" fill="#10B981" stroke="#FFFFFF" strokeWidth="2" />
                            <line
                              x1={rx}
                              y1={ry}
                              x2={rx + 15 * Math.cos((lastPt.headingDeg * Math.PI) / 180)}
                              y2={ry - 15 * Math.sin((lastPt.headingDeg * Math.PI) / 180)}
                              stroke="#EF4444"
                              strokeWidth="2.5"
                            />
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Forward Speed v</span>
                      <span className="text-base font-mono font-black text-emerald-600">{diffResult.linearVelocityMPerS.toFixed(2)} m/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Yaw Rate ω</span>
                      <span className="text-base font-mono font-black text-zinc-900">{diffResult.angularVelocityRadPerS.toFixed(2)} rad/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Turning Radius R</span>
                      <span className="text-base font-mono font-black text-blue-600">{diffResult.turningRadiusM ? `${diffResult.turningRadiusM.toFixed(2)} m` : 'Straight'}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Final Heading</span>
                      <span className="text-base font-mono font-black text-purple-600">{diffResult.finalPose.thetaDeg.toFixed(1)}°</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Wheel Speed Actuators</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Left Wheel (ωL):</span>
                        <span className="font-bold text-zinc-900">{diffParams.leftWheelSpeedRadPerS} rad/s</span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.5"
                        value={diffParams.leftWheelSpeedRadPerS}
                        onChange={(e) => setDiffParams({ ...diffParams, leftWheelSpeedRadPerS: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Right Wheel (ωR):</span>
                        <span className="font-bold text-zinc-900">{diffParams.rightWheelSpeedRadPerS} rad/s</span>
                      </div>
                      <input
                        type="range"
                        min="-10"
                        max="10"
                        step="0.5"
                        value={diffParams.rightWheelSpeedRadPerS}
                        onChange={(e) => setDiffParams({ ...diffParams, rightWheelSpeedRadPerS: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Wheelbase (L):</span>
                        <span className="font-bold text-zinc-900">{diffParams.wheelBaseM} m</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="0.8"
                        step="0.05"
                        value={diffParams.wheelBaseM}
                        onChange={(e) => setDiffParams({ ...diffParams, wheelBaseM: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Odometry Kinematics</span>
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

          {/* TAB 4: INVERTED PENDULUM */}
          {activeExpId === 'inverted-pendulum' && (
            <motion.div
              key="inverted-pendulum"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      Unstable Pole = {pendulumResult.openLoopUnstablePole.toFixed(2)} rad/s (Settled in {pendulumResult.settlingTimeSec.toFixed(2)}s)
                    </span>
                  </div>

                  {/* Cart-Pendulum Time Response Graph */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="100" x2="480" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="4,4" />

                      {/* Pendulum Angle (Red) */}
                      {(() => {
                        const pts = pendulumResult.simulationTimeSeries;
                        const maxT = 6.0;
                        const maxTh = Math.max(1, Math.abs(pendulumParams.initialAngleDeg) * 1.2);
                        const toX = (t: number) => 40 + (t / maxT) * 440;
                        const toY = (th: number) => 100 - (th / maxTh) * 80;

                        const pathTh = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.timeSec).toFixed(1)} ${toY(p.pendulumAngleDeg).toFixed(1)}`).join(' ');
                        return <path d={pathTh} fill="none" stroke="#EF4444" strokeWidth="2.5" />;
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span className="text-rose-400">― Pendulum Angle θ(t) [Stabilizes to 0°]</span>
                      <span>Peak Cart Displacement = {pendulumResult.peakCartDisplacementM.toFixed(3)} m</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Settling Time ts</span>
                      <span className="text-base font-mono font-black text-rose-600">{pendulumResult.settlingTimeSec.toFixed(2)} s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Peak Cart X</span>
                      <span className="text-base font-mono font-black text-zinc-900">{pendulumResult.peakCartDisplacementM.toFixed(3)} m</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Open-Loop Pole</span>
                      <span className="text-base font-mono font-black text-blue-600">+{pendulumResult.openLoopUnstablePole.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Controllability</span>
                      <span className="text-base font-mono font-black text-emerald-600">Full Rank (4)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-rose-600" />
                    <span>LQR Controller Gains</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Initial Tilt Angle (θ0):</span>
                        <span className="font-bold text-zinc-900">{pendulumParams.initialAngleDeg}°</span>
                      </div>
                      <input
                        type="range"
                        min="-15"
                        max="15"
                        step="1"
                        value={pendulumParams.initialAngleDeg}
                        onChange={(e) => setPendulumParams({ ...pendulumParams, initialAngleDeg: parseFloat(e.target.value) })}
                        className="w-full accent-rose-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Angle Gain (Kp):</span>
                        <span className="font-bold text-zinc-900">{pendulumParams.controlGainKp}</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="80"
                        step="5"
                        value={pendulumParams.controlGainKp}
                        onChange={(e) => setPendulumParams({ ...pendulumParams, controlGainKp: parseFloat(e.target.value) })}
                        className="w-full accent-rose-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Angle Rate Gain (Kd):</span>
                        <span className="font-bold text-zinc-900">{pendulumParams.controlGainKd}</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="25"
                        step="1"
                        value={pendulumParams.controlGainKd}
                        onChange={(e) => setPendulumParams({ ...pendulumParams, controlGainKd: parseFloat(e.target.value) })}
                        className="w-full accent-rose-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-rose-800 uppercase block">State Space Formulation</span>
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

          {/* TAB 5: BODE PLOT */}
          {activeExpId === 'bode-plot' && (
            <motion.div
              key="bode-plot"
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
                      PM = {bodeResult.phaseMarginDeg.toFixed(1)}° ({bodeResult.isClosedLoopStable ? 'Closed-Loop Stable' : 'Unstable'})
                    </span>
                  </div>

                  {/* Magnitude & Phase Dual Bode Plot */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      {/* 0 dB Line */}
                      <line x1="40" y1="60" x2="480" y2="60" stroke="#EF4444" strokeWidth="1" strokeDasharray="3,3" />
                      {/* -180 deg Line */}
                      <line x1="40" y1="160" x2="480" y2="160" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3,3" />

                      {(() => {
                        const pts = bodeResult.bodeCurvePoints;
                        const minF = Math.log10(pts[0]?.frequencyRadPerS ?? 0.1);
                        const maxF = Math.log10(pts[pts.length - 1]?.frequencyRadPerS ?? 100);

                        const toX = (w: number) => 40 + ((Math.log10(w) - minF) / (maxF - minF)) * 440;
                        const toMagY = (db: number) => 60 - (db / 40) * 45;
                        const toPhaseY = (ph: number) => 120 - ((ph + 180) / 180) * 50;

                        const magPath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.frequencyRadPerS).toFixed(1)} ${toMagY(p.magnitudeDb).toFixed(1)}`).join(' ');
                        const phasePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.frequencyRadPerS).toFixed(1)} ${toPhaseY(p.phaseDeg).toFixed(1)}`).join(' ');

                        return (
                          <>
                            <path d={magPath} fill="none" stroke="#F59E0B" strokeWidth="2.5" />
                            <path d={phasePath} fill="none" stroke="#38BDF8" strokeWidth="2" strokeDasharray="5,2" />
                          </>
                        );
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span className="text-amber-400">― Magnitude 20 log|G| (dB) [0 dB crossing = {bodeResult.gainCrossoverFrequencyWgc.toFixed(2)} rad/s]</span>
                      <span className="text-sky-400">--- Phase ∠G (deg)</span>
                      <span>Phase Margin = {bodeResult.phaseMarginDeg.toFixed(1)}°</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Phase Margin PM</span>
                      <span className="text-base font-mono font-black text-amber-600">{bodeResult.phaseMarginDeg.toFixed(1)}°</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Gain Margin GM</span>
                      <span className="text-base font-mono font-black text-zinc-900">{bodeResult.gainMarginDb.toFixed(1)} dB</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Gain Crossover ωgc</span>
                      <span className="text-base font-mono font-black text-blue-600">{bodeResult.gainCrossoverFrequencyWgc.toFixed(2)} rad/s</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">System Stability</span>
                      <span className="text-base font-mono font-black text-emerald-600">{bodeResult.isClosedLoopStable ? 'Stable' : 'Unstable'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>Plant Transfer Function</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Open-Loop Gain (K):</span>
                        <span className="font-bold text-zinc-900">{bodeParams.systemGainK}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="25"
                        step="0.5"
                        value={bodeParams.systemGainK}
                        onChange={(e) => setBodeParams({ ...bodeParams, systemGainK: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Natural Freq (ωn):</span>
                        <span className="font-bold text-zinc-900">{bodeParams.naturalFrequencyWn} rad/s</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="0.5"
                        value={bodeParams.naturalFrequencyWn}
                        onChange={(e) => setBodeParams({ ...bodeParams, naturalFrequencyWn: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Damping Ratio (ζ):</span>
                        <span className="font-bold text-zinc-900">{bodeParams.dampingRatioZeta}</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.2"
                        step="0.05"
                        value={bodeParams.dampingRatioZeta}
                        onChange={(e) => setBodeParams({ ...bodeParams, dampingRatioZeta: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Frequency Response</span>
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
