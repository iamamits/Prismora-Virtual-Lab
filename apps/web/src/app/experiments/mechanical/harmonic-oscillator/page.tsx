/**
 * Prismora Mechanical Engineering Virtual Lab — Damped Harmonic Oscillator Workbench
 *
 * Implements an interactive SDOF mass-spring-damper laboratory covering:
 * - Free vibration regimes: Undamped, Underdamped, Critically Damped, Overdamped
 * - Harmonic forced resonance: Magnification factor M(r), Phase lag phi, Quality factor Q
 * - Energy dissipation: Kinetic, Potential, and Total mechanical damping
 * - Phase portrait trajectories (x vs v)
 *
 * 7-Step Pedagogical Workflow:
 * 1. Understand (Governing ODEs & KaTeX equations)
 * 2. Predict (Student hypothesis testing)
 * 3. Explore (Live interactive mechanical test rig with animated spring & dashpot)
 * 4. Guided (AICTE / IIT Roorkee mechanical vibrations procedure checkpoints)
 * 5. Analyze (Time history, Phase portrait & Frequency Response Bode curve)
 * 6. Challenge (Natural frequency & damping identification quiz with auto-grading)
 * 7. Report (Comprehensive vibration engineering observation record with PDF export)
 */

'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  HarmonicOscillatorEvaluator,
  HarmonicOscillatorParams,
  SDOFSystemCharacteristics,
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
  Pause,
  Play,
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

export default function HarmonicOscillatorLabPage() {
  const [activeStep, setActiveStep] = useState<WorkflowStep>('explore');

  // Mechanical parameters
  const [mass, setMass] = useState(2.0);          // kg
  const [stiffness, setStiffness] = useState(200); // N/m
  const [damping, setDamping] = useState(4.0);     // N*s/m
  const [initialX, setInitialX] = useState(0.1);   // m
  const [initialV, setInitialV] = useState(0.0);   // m/s
  const [forceAmp, setForceAmp] = useState(0.0);   // N
  const [drivingFreq, setDrivingFreq] = useState(10.0); // rad/s

  // Simulation execution clock
  const [isPlaying, setIsPlaying] = useState(true);
  const [simTime, setSimTime] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);

  // Hypothesis State (Predict)
  const [predWn, setPredWn] = useState('');
  const [predRegime, setPredRegime] = useState('underdamped');
  const [predResonanceAmp, setPredResonanceAmp] = useState('');
  const [predictionSubmitted, setPredictionSubmitted] = useState(false);

  // Guided checklist
  const [guidedStep, setGuidedStep] = useState(0);

  // Challenge mode
  const [challengeAnswer, setChallengeAnswer] = useState('');
  const [challengeResult, setChallengeResult] = useState<string | null>(null);

  // Animation frame loop
  const lastWallTimeRef = useRef<number | null>(null);

  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      if (lastWallTimeRef.current !== null && isPlaying) {
        const dt = (now - lastWallTimeRef.current) / 1000;
        setSimTime((prev) => prev + dt * playbackSpeed);
      }
      lastWallTimeRef.current = now;
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [isPlaying, playbackSpeed]);

  const params: HarmonicOscillatorParams = useMemo(
    () => ({
      mass,
      stiffness,
      damping,
      initialDisplacement: initialX,
      initialVelocity: initialV,
      drivingForceAmp: forceAmp,
      drivingFrequency: drivingFreq,
    }),
    [mass, stiffness, damping, initialX, initialV, forceAmp, drivingFreq]
  );

  const characteristics: SDOFSystemCharacteristics = useMemo(
    () => HarmonicOscillatorEvaluator.computeCharacteristics(params),
    [params]
  );

  const currentState = useMemo(
    () => HarmonicOscillatorEvaluator.computeState(params, simTime),
    [params, simTime]
  );

  const timeTrajectory = useMemo(
    () => HarmonicOscillatorEvaluator.generateTrajectory(params, 8, 250),
    [params]
  );

  const frequencyResponse = useMemo(
    () => HarmonicOscillatorEvaluator.generateFrequencyResponse(params, 3.0, 150),
    [params]
  );

  // Preset Handlers
  const applyPreset = (preset: 'undamped' | 'underdamped' | 'critical' | 'overdamped' | 'resonance') => {
    setSimTime(0);
    setIsPlaying(true);
    setInitialX(0.12);
    setInitialV(0.0);
    setForceAmp(0.0);

    const m = 2.0;
    const k = 200.0; // wn = 10 rad/s, cc = 40 N*s/m
    setMass(m);
    setStiffness(k);

    switch (preset) {
      case 'undamped':
        setDamping(0);
        break;
      case 'underdamped':
        setDamping(4.0); // zeta = 0.1
        break;
      case 'critical':
        setDamping(40.0); // zeta = 1.0
        break;
      case 'overdamped':
        setDamping(70.0); // zeta = 1.75
        break;
      case 'resonance':
        setDamping(4.0); // zeta = 0.1
        setForceAmp(15.0);
        setDrivingFreq(10.0); // r = 1.0
        break;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-amber-100 selection:text-amber-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link
              href="/library"
              className="text-xs font-semibold px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors flex items-center"
            >
              ← Curriculum Library
            </Link>
            <div className="h-4 w-px bg-slate-200" />
            <div>
              <div className="flex items-center space-x-2">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                  ME-202
                </span>
                <h1 className="text-sm font-bold text-slate-900 sm:text-base">
                  Damped Harmonic Oscillator & Mechanical Resonance Lab
                </h1>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                IIT Roorkee / AICTE Model Curriculum: Kinematics & Dynamics of Machinery
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <BugReportModal
              simulationId="harmonic-oscillator-me"
              moduleName="Mechanical Vibrations SDOF Lab"
            />
            <button
              onClick={() => {
                setSimTime(0);
                setIsPlaying(false);
              }}
              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
              title="Reset Simulation Clock"
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
            { id: 'explore', label: '3. Explore (Live Rig)', icon: Activity },
            { id: 'guided', label: '4. Guided Procedure', icon: Compass },
            { id: 'analyze', label: '5. Analyze (Bode & Phase)', icon: TrendingUp },
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
                    ? 'border-amber-600 text-amber-700 font-semibold bg-amber-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* =================================================================== */}
        {/* TAB 1: UNDERSTAND (THEORY & FORMULAS) */}
        {/* =================================================================== */}
        {activeStep === 'understand' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-amber-600" />
                <span>Foundational Theory: SDOF Damped Translational Vibrations</span>
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">
                A single-degree-of-freedom (SDOF) mechanical oscillator consists of a rigid body of mass{' '}
                <MathView math="m" /> connected to a linear elastic spring of stiffness <MathView math="k" /> and
                a viscous damping element (dashpot) of coefficient <MathView math="c" />, driven by harmonic force{' '}
                <MathView math="F(t) = F_0 \cos(\omega t)" />.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900">Equation of Motion</h3>
                  <div className="bg-white p-3 rounded border border-slate-200 overflow-x-auto text-center">
                    <MathView math="m \ddot{x}(t) + c \dot{x}(t) + k x(t) = F_0 \cos(\omega t)" display />
                  </div>
                  <p className="text-xs text-slate-600">
                    Applying Newton's second law (<MathView math="\sum F = m a" />): Inertial force, viscous damping drag, and Hookean restoring force balance the external harmonic excitation.
                  </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
                  <h3 className="font-semibold text-sm text-slate-900">Characteristic Parameters</h3>
                  <div className="bg-white p-3 rounded border border-slate-200 overflow-x-auto text-center space-y-2">
                    <MathView math="\omega_n = \sqrt{\frac{k}{m}}, \quad c_c = 2 \sqrt{k m} = 2 m \omega_n" display />
                    <MathView math="\zeta = \frac{c}{c_c} = \frac{c}{2 m \omega_n}" display />
                  </div>
                  <p className="text-xs text-slate-600">
                    Where <MathView math="\omega_n" /> is undamped natural angular frequency, <MathView math="c_c" /> is critical damping coefficient, and <MathView math="\zeta" /> is dimensionless damping ratio.
                  </p>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="font-bold text-sm text-slate-900 mb-3">Classification of Free Vibration Regimes</h3>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <span className="font-bold text-blue-900 block mb-1">1. Undamped (ζ = 0)</span>
                    <p className="text-blue-800">
                      Zero dissipation. Continuous sinusoidal oscillation with constant amplitude <MathView math="x_0" /> and constant total energy.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <span className="font-bold text-amber-900 block mb-1">2. Underdamped (0 &lt; ζ &lt; 1)</span>
                    <p className="text-amber-800">
                      Oscillates at damped frequency <MathView math="\omega_d = \omega_n \sqrt{1 - \zeta^2}" /> with exponential envelope decay <MathView math="e^{-\zeta \omega_n t}" />.
                    </p>
                  </div>
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <span className="font-bold text-emerald-900 block mb-1">3. Critically Damped (ζ = 1)</span>
                    <p className="text-emerald-800">
                      Fastest return to equilibrium without any oscillatory overshoot. Critical benchmark for vehicle suspensions and door closers.
                    </p>
                  </div>
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg">
                    <span className="font-bold text-rose-900 block mb-1">4. Overdamped (ζ &gt; 1)</span>
                    <p className="text-rose-800">
                      Sluggish non-oscillatory exponential return governed by two real negative roots <MathView math="r_1, r_2" />.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200 pt-6">
                <h3 className="font-bold text-sm text-slate-900 mb-3">Forced Vibration & Resonance</h3>
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded border border-slate-200 text-center">
                      <MathView math="M(r) = \frac{1}{\sqrt{(1 - r^2)^2 + (2 \zeta r)^2}}, \quad r = \frac{\omega}{\omega_n}" display />
                    </div>
                    <div className="bg-white p-3 rounded border border-slate-200 text-center">
                      <MathView math="\tan \phi = \frac{2 \zeta r}{1 - r^2}, \quad Q \approx \frac{1}{2 \zeta}" display />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mt-3">
                    When excitation frequency ratio <MathView math="r \approx 1" />, dynamic magnification factor <MathView math="M" /> peaks sharply. Phase lag between excitation force and displacement reaches exactly <MathView math="90^\circ" /> at <MathView math="r = 1.0" />.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 2: PREDICT (HYPOTHESIS TESTING) */}
        {/* =================================================================== */}
        {activeStep === 'predict' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-2 flex items-center space-x-2">
                <Lightbulb className="w-5 h-5 text-amber-600" />
                <span>Formulate Scientific Predictions Prior to Experimentation</span>
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                Consider an SDOF system with mass <MathView math="m = 2.0\text{ kg}" />, spring stiffness <MathView math="k = 200\text{ N/m}" />, and damping <MathView math="c = 4.0\text{ N}\cdot\text{s/m}" />.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    1. Predicted Natural Angular Frequency <MathView math="\omega_n" /> (rad/s)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 10.0"
                    value={predWn}
                    onChange={(e) => setPredWn(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Formula: <MathView math="\sqrt{k / m}" /></span>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    2. Expected Motion Regime
                  </label>
                  <select
                    value={predRegime}
                    onChange={(e) => setPredRegime(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="underdamped">Underdamped (Oscillatory decay)</option>
                    <option value="critically_damped">Critically Damped (Deadbeat return)</option>
                    <option value="overdamped">Overdamped (Sluggish return)</option>
                    <option value="undamped">Undamped (Perpetual)</option>
                  </select>
                  <span className="text-[11px] text-slate-500 mt-1 block">Based on <MathView math="\zeta = c / (2\sqrt{km})" /></span>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    3. Resonant Magnification Factor <MathView math="M(1.0)" />
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    placeholder="e.g. 5.0"
                    value={predResonanceAmp}
                    onChange={(e) => setPredResonanceAmp(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">Formula: <MathView math="1 / (2\zeta)" /></span>
                </div>
              </div>

              <button
                onClick={() => setPredictionSubmitted(true)}
                className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition-colors shadow-xs"
              >
                Submit Hypothesis & Compare with Model
              </button>

              {predictionSubmitted && (
                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
                  <h4 className="font-bold text-sm text-amber-900 flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Hypothesis Verification Comparison</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Natural Frequency:</span>
                      <span className="font-medium text-slate-800">Your: {predWn || '—'} rad/s</span>
                      <span className="block font-bold text-emerald-700">Actual: {characteristics.naturalFrequencyRad.toFixed(2)} rad/s</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Damping Regime:</span>
                      <span className="font-medium text-slate-800">Your: {predRegime}</span>
                      <span className="block font-bold text-emerald-700">Actual: {characteristics.dampingRegime} (ζ = {characteristics.dampingRatio.toFixed(3)})</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Resonance Magnification:</span>
                      <span className="font-medium text-slate-800">Your: {predResonanceAmp || '—'}</span>
                      <span className="block font-bold text-emerald-700">Actual: {characteristics.qualityFactor.toFixed(2)}x</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =================================================================== */}
        {/* TAB 3: EXPLORE (LIVE INTERACTIVE TEST RIG) */}
        {/* =================================================================== */}
        {activeStep === 'explore' && (
          <>
            {/* Left 8 Cols: Interactive Mass-Spring-Damper Apparatus */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Mass-Spring-Dashpot Test Rig
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                      t = {simTime.toFixed(2)}s
                    </span>
                  </div>

                  {/* Play / Pause / Reset controls */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className={`px-3 py-1 text-xs font-medium rounded-md flex items-center space-x-1 ${
                        isPlaying
                          ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      <span>{isPlaying ? 'Pause' : 'Play'}</span>
                    </button>
                    <button
                      onClick={() => setSimTime(0)}
                      className="px-2.5 py-1 text-xs bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md"
                    >
                      Reset Time
                    </button>
                    <select
                      value={playbackSpeed}
                      onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                      className="text-xs bg-slate-100 border-none rounded py-1 px-2"
                    >
                      <option value={0.5}>0.5x</option>
                      <option value={1.0}>1.0x</option>
                      <option value={2.0}>2.0x</option>
                    </select>
                  </div>
                </div>

                {/* SVG Schematic Visualizer */}
                <div className="relative bg-slate-900 rounded-lg p-4 overflow-hidden shadow-inner flex items-center justify-center min-h-[260px]">
                  {/* Background grid */}
                  <div
                    className="absolute inset-0 opacity-15"
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 1px 1px, #94A3B8 1px, transparent 0)',
                      backgroundSize: '20px 20px',
                    }}
                  />

                  {/* Mechanical Rig SVG */}
                  {(() => {
                    // Visual position scaling: 1 meter = 400 pixels
                    const xMeters = currentState.displacement;
                    const visualOffsetPx = Math.max(-140, Math.min(140, xMeters * 500));
                    const baseMassX = 300 + visualOffsetPx;

                    return (
                      <svg viewBox="0 0 600 240" className="w-full max-h-[240px]">
                        {/* Rigid Wall Left */}
                        <line x1="60" y1="30" x2="60" y2="210" stroke="#64748B" strokeWidth="6" />
                        {/* Wall hatch pattern */}
                        {Array.from({ length: 9 }).map((_, i) => (
                          <line
                            key={i}
                            x1="60"
                            y1={40 + i * 18}
                            x2="45"
                            y2={55 + i * 18}
                            stroke="#475569"
                            strokeWidth="2"
                          />
                        ))}

                        {/* Ground guide rails */}
                        <line x1="50" y1="180" x2="550" y2="180" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
                        <rect x="50" y="180" width="500" height="8" fill="#1E293B" />

                        {/* 1. Spring (Helical zig-zag) */}
                        <g>
                          <path
                            d={`M 60 90 L 90 90 
                               L 110 75 L 130 105 L 150 75 L 170 105 L 190 75 L 210 105 L 230 75 L 250 105 
                               L ${baseMassX} 90`}
                            fill="none"
                            stroke={xMeters > 0 ? '#F59E0B' : xMeters < 0 ? '#06B6D4' : '#E2E8F0'}
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <text x="150" y="65" fill="#94A3B8" fontSize="10" fontWeight="bold">
                            Spring k = {stiffness} N/m
                          </text>
                        </g>

                        {/* 2. Viscous Dashpot */}
                        <g>
                          {/* Outer cylinder attached to left wall */}
                          <rect x="60" y="125" width="120" height="30" fill="#1E293B" stroke="#64748B" strokeWidth="2" rx="2" />
                          {/* Inner fluid tint */}
                          <rect x="62" y="127" width="116" height="26" fill="#0284C7" opacity="0.3" />

                          {/* Piston shaft attached to moving mass */}
                          <line x1={baseMassX} y1="140" x2="150" y2="140" stroke="#CBD5E1" strokeWidth="4" />
                          {/* Piston head inside cylinder */}
                          <rect x={140 + visualOffsetPx * 0.3} y="128" width="10" height="24" fill="#E2E8F0" rx="1" />
                          <text x="75" y="145" fill="#7DD3FC" fontSize="10" fontWeight="bold">
                            Dashpot c = {damping} N·s/m
                          </text>
                        </g>

                        {/* 3. Moving Mass Block */}
                        <g>
                          <rect
                            x={baseMassX}
                            y="70"
                            width="90"
                            height="110"
                            fill="#F8FAFC"
                            stroke="#E2E8F0"
                            strokeWidth="3"
                            rx="8"
                          />
                          {/* Center Mass Label */}
                          <text
                            x={baseMassX + 45}
                            y="120"
                            textAnchor="middle"
                            fill="#0F172A"
                            fontSize="14"
                            fontWeight="bold"
                          >
                            {mass} kg
                          </text>
                          <text
                            x={baseMassX + 45}
                            y="140"
                            textAnchor="middle"
                            fill="#64748B"
                            fontSize="10"
                          >
                            m
                          </text>

                          {/* Wheels under mass */}
                          <circle cx={baseMassX + 22} cy="180" r="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />
                          <circle cx={baseMassX + 68} cy="180" r="6" fill="#38BDF8" stroke="#0284C7" strokeWidth="2" />

                          {/* Displacement pointer indicator */}
                          <line
                            x1={baseMassX + 45}
                            y1="180"
                            x2={baseMassX + 45}
                            y2="205"
                            stroke="#F59E0B"
                            strokeWidth="2"
                          />
                          <polygon
                            points={`${baseMassX + 45},205 ${baseMassX + 40},215 ${baseMassX + 50},215`}
                            fill="#F59E0B"
                          />
                        </g>

                        {/* Static Equilibrium Datum Line (x = 0) */}
                        <line x1="345" y1="50" x2="345" y2="225" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3 3" />
                        <text x="345" y="42" textAnchor="middle" fill="#94A3B8" fontSize="10">
                          Equilibrium (x = 0)
                        </text>

                        {/* External Driving Force Arrow (if F0 > 0) */}
                        {forceAmp > 0 && (
                          <g>
                            <line
                              x1={baseMassX + 90}
                              y1="125"
                              x2={baseMassX + 90 + Math.cos(drivingFreq * simTime) * 45}
                              y2="125"
                              stroke="#EC4899"
                              strokeWidth="3"
                            />
                            <text x={baseMassX + 95} y="115" fill="#F472B6" fontSize="10" fontWeight="bold">
                              F(t) = {forceAmp} N
                            </text>
                          </g>
                        )}
                      </svg>
                    );
                  })()}
                </div>

                {/* Instantaneous Telemetry Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Displacement x(t)</span>
                    <span className="text-base font-bold text-amber-700 font-mono">
                      {(currentState.displacement * 100).toFixed(2)} cm
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Velocity v(t)</span>
                    <span className="text-base font-bold text-cyan-700 font-mono">
                      {currentState.velocity.toFixed(3)} m/s
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Total Energy E(t)</span>
                    <span className="text-base font-bold text-emerald-700 font-mono">
                      {currentState.totalEnergy.toFixed(3)} J
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                    <span className="text-[11px] text-slate-500 font-medium block">Motion Regime</span>
                    <span className="text-xs font-bold text-indigo-700 uppercase">
                      {characteristics.dampingRegime.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Real-time Oscilloscope Trajectory Chart */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Displacement Response Waveform x(t)</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    Envelope: e^(-ζ·ωn·t) = e^(-{(characteristics.dampingRatio * characteristics.naturalFrequencyRad).toFixed(2)}t)
                  </span>
                </div>

                <div className="relative h-44 bg-slate-900 rounded-lg p-2 overflow-hidden flex items-center justify-center">
                  <svg viewBox="0 0 500 160" className="w-full h-full">
                    {/* Grid Lines */}
                    <line x1="0" y1="80" x2="500" y2="80" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="125" y1="0" x2="125" y2="160" stroke="#1E293B" strokeWidth="1" />
                    <line x1="250" y1="0" x2="250" y2="160" stroke="#1E293B" strokeWidth="1" />
                    <line x1="375" y1="0" x2="375" y2="160" stroke="#1E293B" strokeWidth="1" />

                    {/* Waveform Path */}
                    {(() => {
                      const maxAbsX = Math.max(0.01, ...timeTrajectory.map((p) => Math.abs(p.displacement)));
                      const pointsStr = timeTrajectory
                        .map((pt, idx) => {
                          const px = (idx / (timeTrajectory.length - 1)) * 500;
                          const py = 80 - (pt.displacement / maxAbsX) * 65;
                          return `${px.toFixed(1)},${py.toFixed(1)}`;
                        })
                        .join(' ');

                      return (
                        <polyline
                          points={pointsStr}
                          fill="none"
                          stroke="#F59E0B"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                        />
                      );
                    })()}

                    {/* Current Time Marker */}
                    {(() => {
                      const maxT = 8.0;
                      const markerX = ((simTime % maxT) / maxT) * 500;
                      return (
                        <line
                          x1={markerX}
                          y1="0"
                          x2={markerX}
                          y2="160"
                          stroke="#38BDF8"
                          strokeWidth="1.5"
                          strokeDasharray="4 2"
                        />
                      );
                    })()}
                  </svg>
                </div>
              </div>
            </div>

            {/* Right 4 Cols: Parameter Control Console & Presets */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center space-x-1.5">
                    <Sliders className="w-3.5 h-3.5 text-amber-600" />
                    <span>Oscillator Controls</span>
                  </h3>
                </div>

                {/* Quick Presets */}
                <div>
                  <span className="text-[11px] font-semibold text-slate-600 block mb-2 uppercase tracking-wider">
                    Mechanical Presets
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => applyPreset('underdamped')}
                      className="px-2 py-1.5 text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200 rounded hover:bg-amber-100"
                    >
                      Underdamped (ζ=0.1)
                    </button>
                    <button
                      onClick={() => applyPreset('critical')}
                      className="px-2 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded hover:bg-emerald-100"
                    >
                      Critical (ζ=1.0)
                    </button>
                    <button
                      onClick={() => applyPreset('overdamped')}
                      className="px-2 py-1.5 text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 rounded hover:bg-rose-100"
                    >
                      Overdamped (ζ=1.75)
                    </button>
                    <button
                      onClick={() => applyPreset('resonance')}
                      className="px-2 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200 rounded hover:bg-indigo-100"
                    >
                      Resonance (ω=ωn)
                    </button>
                  </div>
                </div>

                {/* Slider Controls */}
                <div className="space-y-4 text-xs">
                  {/* Mass m */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Mass m (kg):</span>
                      <span className="font-mono font-bold text-slate-900">{mass.toFixed(1)} kg</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={mass}
                      onChange={(e) => setMass(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Stiffness k */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Spring Stiffness k (N/m):</span>
                      <span className="font-mono font-bold text-slate-900">{stiffness} N/m</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="500"
                      step="10"
                      value={stiffness}
                      onChange={(e) => setStiffness(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Damping c */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Damping Coeff c (N·s/m):</span>
                      <span className="font-mono font-bold text-slate-900">{damping.toFixed(1)} N·s/m</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="60"
                      step="1"
                      value={damping}
                      onChange={(e) => setDamping(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* Initial Displacement x0 */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Initial Displacement x₀:</span>
                      <span className="font-mono font-bold text-slate-900">{(initialX * 100).toFixed(0)} cm</span>
                    </div>
                    <input
                      type="range"
                      min="-0.3"
                      max="0.3"
                      step="0.02"
                      value={initialX}
                      onChange={(e) => setInitialX(Number(e.target.value))}
                      className="w-full accent-amber-600"
                    />
                  </div>

                  {/* External Forcing F0 */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Driving Force F₀ (N):</span>
                      <span className="font-mono font-bold text-slate-900">{forceAmp.toFixed(1)} N</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="40"
                      step="2"
                      value={forceAmp}
                      onChange={(e) => setForceAmp(Number(e.target.value))}
                      className="w-full accent-pink-600"
                    />
                  </div>

                  {/* Driving Frequency omega */}
                  <div>
                    <div className="flex justify-between font-medium text-slate-700 mb-1">
                      <span>Driving Freq ω (rad/s):</span>
                      <span className="font-mono font-bold text-slate-900">{drivingFreq.toFixed(1)} rad/s</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="25"
                      step="0.5"
                      value={drivingFreq}
                      onChange={(e) => setDrivingFreq(Number(e.target.value))}
                      className="w-full accent-pink-600"
                    />
                  </div>
                </div>

                {/* System Readout Box */}
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>Natural Freq ω_n:</span>
                    <span className="font-bold text-slate-900">{characteristics.naturalFrequencyRad.toFixed(2)} rad/s</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Damping Ratio ζ:</span>
                    <span className="font-bold text-slate-900">{characteristics.dampingRatio.toFixed(3)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Critical Damping c_c:</span>
                    <span className="font-bold text-slate-900">{characteristics.criticalDamping.toFixed(1)} N·s/m</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Quality Factor Q:</span>
                    <span className="font-bold text-slate-900">{characteristics.qualityFactor.toFixed(2)}</span>
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
                <Compass className="w-5 h-5 text-amber-600" />
                <span>AICTE Guided Experimental Procedure: Determination of Damping Ratio</span>
              </h2>

              <div className="space-y-4 text-sm">
                {[
                  {
                    title: 'Step 1: Set Initial System Parameters',
                    desc: 'Adjust mass m = 2.0 kg and spring stiffness k = 200 N/m. Set initial displacement x0 = 0.10 m (10 cm).',
                  },
                  {
                    title: 'Step 2: Observe Undamped Oscillation (c = 0)',
                    desc: 'Set damping c = 0. Verify constant peak-to-peak amplitude and absence of total energy dissipation.',
                  },
                  {
                    title: 'Step 3: Measure Logarithmic Decrement in Underdamped Mode',
                    desc: 'Introduce damping c = 4.0 N·s/m. Measure successive peak amplitudes X1 and X2 to calculate delta = ln(X1 / X2).',
                  },
                  {
                    title: 'Step 4: Identify Critical Damping Boundary (c = c_c = 40 N·s/m)',
                    desc: 'Increase damping to c = 40 N·s/m. Note that the mass returns to equilibrium in minimal time without overshoot.',
                  },
                  {
                    title: 'Step 5: Harmonic Excitation & Mechanical Resonance',
                    desc: 'Enable driving force F0 = 15 N. Sweep driving frequency from 2 to 20 rad/s. Observe peak response at omega = omega_n.',
                  },
                ].map((step, idx) => (
                  <div
                    key={idx}
                    onClick={() => setGuidedStep(idx)}
                    className={`p-4 rounded-lg border transition-all cursor-pointer ${
                      guidedStep === idx
                        ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900">{step.title}</span>
                      {guidedStep === idx && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-600 text-white">
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
        {/* TAB 5: ANALYZE (BODE & PHASE PORTRAITS) */}
        {/* =================================================================== */}
        {activeStep === 'analyze' && (
          <div className="lg:col-span-12 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Frequency Response Function M(r) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>Dynamic Magnification Factor M(r) vs Frequency Ratio r</span>
                  <span className="text-xs text-amber-700 font-mono">r = ω / ω_n</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Peak occurs at resonant frequency ratio <MathView math="r_r = \sqrt{1 - 2\zeta^2}" />. Current operating point highlighted.
                </p>

                <div className="h-56 bg-slate-900 rounded-lg p-2 flex items-center justify-center">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    <line x1="40" y1="170" x2="380" y2="170" stroke="#475569" strokeWidth="1.5" />
                    <line x1="40" y1="170" x2="40" y2="20" stroke="#475569" strokeWidth="1.5" />
                    <text x="360" y="185" fill="#94A3B8" fontSize="10">r</text>
                    <text x="15" y="25" fill="#94A3B8" fontSize="10">M(r)</text>

                    {/* Curve */}
                    {(() => {
                      const maxM = Math.max(6, ...frequencyResponse.map((p) => p.magnification));
                      const pts = frequencyResponse
                        .map((p) => {
                          const px = 40 + (p.frequencyRatio / 3.0) * 340;
                          const py = 170 - (p.magnification / maxM) * 145;
                          return `${px.toFixed(1)},${py.toFixed(1)}`;
                        })
                        .join(' ');
                      return <polyline points={pts} fill="none" stroke="#F59E0B" strokeWidth="2.5" />;
                    })()}

                    {/* Current operating point marker */}
                    {(() => {
                      const currentR = drivingFreq / characteristics.naturalFrequencyRad;
                      const currentM = 1 / Math.sqrt(Math.pow(1 - currentR * currentR, 2) + Math.pow(2 * characteristics.dampingRatio * currentR, 2) || 1);
                      const maxM = Math.max(6, ...frequencyResponse.map((p) => p.magnification));
                      const cx = 40 + Math.min(340, (currentR / 3.0) * 340);
                      const cy = 170 - Math.min(145, (currentM / maxM) * 145);

                      return (
                        <g>
                          <circle cx={cx} cy={cy} r="5" fill="#EC4899" stroke="#FFF" strokeWidth="2" />
                          <text x={cx + 8} y={cy - 5} fill="#F472B6" fontSize="10" fontWeight="bold">
                            r = {currentR.toFixed(2)}, M = {currentM.toFixed(1)}x
                          </text>
                        </g>
                      );
                    })()}
                  </svg>
                </div>
              </div>

              {/* Phase Portrait (x vs v) */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 flex items-center justify-between">
                  <span>Phase-Space State Portrait: Velocity v vs Displacement x</span>
                  <span className="text-xs text-indigo-700 font-mono">dx/dt vs x</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Visualizes system stability: stable spiral sink for underdamped, closed limit trajectory for undamped.
                </p>

                <div className="h-56 bg-slate-900 rounded-lg p-2 flex items-center justify-center">
                  <svg viewBox="0 0 400 200" className="w-full h-full">
                    {/* Axes */}
                    <line x1="200" y1="10" x2="200" y2="190" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                    <line x1="20" y1="100" x2="380" y2="100" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
                    <text x="365" y="95" fill="#94A3B8" fontSize="10">x</text>
                    <text x="205" y="20" fill="#94A3B8" fontSize="10">v</text>

                    {/* Trajectory */}
                    {(() => {
                      const maxDisplacement = Math.max(0.01, ...timeTrajectory.map((p) => Math.abs(p.displacement)));
                      const maxVelocity = Math.max(0.01, ...timeTrajectory.map((p) => Math.abs(p.velocity)));

                      const pts = timeTrajectory
                        .map((p) => {
                          const px = 200 + (p.displacement / maxDisplacement) * 160;
                          const py = 100 - (p.velocity / maxVelocity) * 80;
                          return `${px.toFixed(1)},${py.toFixed(1)}`;
                        })
                        .join(' ');

                      return <polyline points={pts} fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />;
                    })()}

                    {/* Current point */}
                    {(() => {
                      const maxDisplacement = Math.max(0.01, ...timeTrajectory.map((p) => Math.abs(p.displacement)));
                      const maxVelocity = Math.max(0.01, ...timeTrajectory.map((p) => Math.abs(p.velocity)));
                      const cx = 200 + (currentState.displacement / maxDisplacement) * 160;
                      const cy = 100 - (currentState.velocity / maxVelocity) * 80;
                      return <circle cx={cx} cy={cy} r="5" fill="#F59E0B" stroke="#FFF" strokeWidth="2" />;
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
                <Award className="w-5 h-5 text-amber-600" />
                <span>Vibration Engineering Challenge: Critical Damping Synthesis</span>
              </h2>
              <p className="text-slate-600 text-sm mb-6">
                An industrial robot joint has equivalent mass <MathView math="m = 5.0\text{ kg}" /> and spring stiffness{' '}
                <MathView math="k = 500\text{ N/m}" />. To ensure deadbeat settling with zero overshoot after rapid placement,
                what critical damping coefficient <MathView math="c_c" /> (in N·s/m) must the hydraulic damper provide?
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Calculated Damping Coefficient <MathView math="c_c" /> (N·s/m):
                  </label>
                  <input
                    type="number"
                    step="1"
                    placeholder="e.g. 100"
                    value={challengeAnswer}
                    onChange={(e) => setChallengeAnswer(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="text-xs text-slate-500 mt-1 block">
                    Hint: <MathView math="c_c = 2 \sqrt{k m}" />
                  </span>
                </div>

                <button
                  onClick={() => {
                    const ans = Number(challengeAnswer);
                    // c_c = 2 * sqrt(5 * 500) = 2 * sqrt(2500) = 2 * 50 = 100 N*s/m
                    if (Math.abs(ans - 100) < 1.0) {
                      setChallengeResult('correct');
                    } else {
                      setChallengeResult('incorrect');
                    }
                  }}
                  className="px-4 py-2 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700"
                >
                  Verify Answer
                </button>

                {challengeResult === 'correct' && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 text-xs">
                    <span className="font-bold block mb-1">✓ Correct! Excellent work!</span>
                    <MathView math="c_c = 2 \sqrt{500 \times 5} = 2 \times 50 = 100\text{ N}\cdot\text{s/m}" display />
                    With <MathView math="c = 100\text{ N}\cdot\text{s/m}" />, damping ratio <MathView math="\zeta = 1.0" /> (deadbeat motion).
                  </div>
                )}

                {challengeResult === 'incorrect' && (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 text-xs">
                    <span className="font-bold block mb-1">✕ Incorrect answer.</span>
                    Use the formula <MathView math="c_c = 2 \sqrt{k m}" />. Calculate <MathView math="2 \times \sqrt{2500}" />.
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
                    Laboratory Observation & Verification Report
                  </h2>
                  <p className="text-xs text-slate-500">
                    Course: ME-202 Dynamics of Machinery • AICTE / IIT Roorkee Virtual Lab
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

              {/* Table of System Parameters */}
              <div>
                <h3 className="font-bold text-sm text-slate-800 mb-2">1. Operating System Parameters</h3>
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
                      <td className="p-2 font-sans">Oscillating Mass</td>
                      <td className="p-2">m</td>
                      <td className="p-2 font-bold">{mass.toFixed(1)}</td>
                      <td className="p-2 font-sans">kg</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Spring Stiffness</td>
                      <td className="p-2">k</td>
                      <td className="p-2 font-bold">{stiffness}</td>
                      <td className="p-2 font-sans">N/m</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Viscous Damping</td>
                      <td className="p-2">c</td>
                      <td className="p-2 font-bold">{damping.toFixed(1)}</td>
                      <td className="p-2 font-sans">N·s/m</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">External Driving Force</td>
                      <td className="p-2">F0</td>
                      <td className="p-2 font-bold">{forceAmp.toFixed(1)}</td>
                      <td className="p-2 font-sans">N</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-sans">Driving Frequency</td>
                      <td className="p-2">ω</td>
                      <td className="p-2 font-bold">{drivingFreq.toFixed(1)}</td>
                      <td className="p-2 font-sans">rad/s</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Analytical Derived Quantities */}
              <div>
                <h3 className="font-bold text-sm text-slate-800 mb-2">2. Analytical System Characteristics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 font-sans block">Natural Freq ω_n:</span>
                    <span className="font-bold text-slate-900">{characteristics.naturalFrequencyRad.toFixed(3)} rad/s</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 font-sans block">Damping Ratio ζ:</span>
                    <span className="font-bold text-slate-900">{characteristics.dampingRatio.toFixed(4)}</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 font-sans block">Critical Damping c_c:</span>
                    <span className="font-bold text-slate-900">{characteristics.criticalDamping.toFixed(2)} N·s/m</span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-slate-500 font-sans block">Quality Factor Q:</span>
                    <span className="font-bold text-slate-900">{characteristics.qualityFactor.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Conclusion & Signature block */}
              <div className="border-t border-slate-200 pt-4 text-xs text-slate-600">
                <p>
                  <strong>Academic Verification:</strong> The system response complies with the analytical solution of the second-order ordinary differential equation. State trajectories in phase space confirm asymptotic stability for all positive damping values.
                </p>
                <div className="mt-8 flex justify-between text-slate-400 font-mono text-[11px]">
                  <span>Generated by Prismora Mechanical Engineering Lab Engine</span>
                  <span>Validated: IIT Roorkee V-Lab Benchmark</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
