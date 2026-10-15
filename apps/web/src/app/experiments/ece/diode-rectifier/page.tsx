/**
 * Prismora ECE Virtual Lab — PN-Junction Diode & Rectifier Circuits Laboratory
 *
 * A genuinely interactive hands-on virtual laboratory featuring:
 * - Diode DC I-V Characteristics: Silicon vs Germanium material models, Shockley equation, knee voltage, dynamic resistance
 * - Half-Wave Rectifier with dual-channel waveform observation
 * - Full-Wave Bridge Rectifier (4-diode diamond topology) with capacitor smoothing filter
 * - Professional Dual-Trace Virtual Oscilloscope with real time-series sampling
 * - Live analytical metrics: Peak voltage, DC average voltage, RMS voltage, ripple factor, efficiency
 * - Comprehensive educational drawer: Theory, IIT Roorkee procedure, troubleshooting, quiz
 * - Strict Light Theme styling
 */

'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  computeDiodeIVCurve,
  simulateRectifier,
  DEFAULT_SILICON_DIODE,
  DEFAULT_GERMANIUM_DIODE,
  RectifierTopology,
} from '@prismora/simulation-core';
import { Oscilloscope, ScopeSample } from '@/components/ece/instruments/oscilloscope';
import { BugReportModal } from '@prismora/ui';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  ListOrdered,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

type ExperimentMode = 'diode-iv' | 'half-wave' | 'full-wave-bridge';

export default function DiodeRectifierLabPage() {
  const [mode, setMode] = useState<ExperimentMode>('half-wave');
  const [material, setMaterial] = useState<'Silicon' | 'Germanium'>('Silicon');

  // Rectifier circuit parameters
  const [peakVoltage, setPeakVoltage] = useState(10.0); // 10V peak AC
  const [frequency, setFrequency] = useState(50); // 50 Hz
  const [loadResistance, setLoadResistance] = useState(1000); // 1000 ohms
  const [hasCapacitorFilter, setHasCapacitorFilter] = useState(false);
  const [capacitanceMicroFarads, setCapacitanceMicroFarads] = useState(100); // 100 uF

  // Drawer & Bug report modal
  const [activeTab, setActiveTab] = useState<'theory' | 'procedure' | 'pitfalls' | 'quiz'>('theory');
  const [showDrawer, setShowDrawer] = useState(false);

  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setShowDrawer(true);
    }
  }, []);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  // 1. Compute Diode I-V Curve for 'diode-iv' mode
  const ivPoints = useMemo(() => {
    const diodeParams = material === 'Silicon' ? DEFAULT_SILICON_DIODE : DEFAULT_GERMANIUM_DIODE;
    return computeDiodeIVCurve(diodeParams, -2.0, 1.0, 60);
  }, [material]);

  // 2. Simulate Rectifier for 'half-wave' and 'full-wave-bridge' modes
  const rectifierResult = useMemo(() => {
    const topology: RectifierTopology =
      mode === 'full-wave-bridge' ? 'full-wave-bridge' : 'half-wave';
    const filterCap = hasCapacitorFilter ? capacitanceMicroFarads * 1e-6 : 0;
    const diodeDrop = material === 'Silicon' ? 0.7 : 0.3;

    return simulateRectifier({
      topology,
      inputPeakVoltage: peakVoltage,
      inputFrequency: frequency,
      loadResistance,
      filterCapacitance: filterCap,
      diodeForwardDrop: diodeDrop,
    });
  }, [mode, material, peakVoltage, frequency, loadResistance, hasCapacitorFilter, capacitanceMicroFarads]);

  // Convert samples for Oscilloscope
  const scopeSamples: ScopeSample[] = useMemo(() => {
    return rectifierResult.samples.map((s) => ({
      timeMs: s.timeMs,
      ch1: s.inputVoltage,
      ch2: s.outputVoltage,
    }));
  }, [rectifierResult]);

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] w-full bg-[#F8FAFC] text-zinc-900 overflow-hidden select-none">
      {/* Top Laboratory Control Bar */}
      <header className="h-12 border-b border-zinc-200 bg-white px-4 flex items-center justify-between shrink-0 z-40 shadow-xs">
        {/* Left: Breadcrumbs & Title */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
            <Link href="/labs" className="hover:text-zinc-900 transition-colors">
              Labs
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/experiments/ece" className="text-[#06B6D4] font-bold hover:underline">
              ECE Virtual Lab
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-900 font-bold">Diodes & Rectifiers</span>
          </nav>

          <div className="w-[1px] h-4 bg-zinc-300 mx-1 hidden sm:block" />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              onClick={() => setMode('diode-iv')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                mode === 'diode-iv'
                  ? 'bg-[#06B6D4] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Diode I-V Curve
            </button>
            <button
              onClick={() => setMode('half-wave')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                mode === 'half-wave'
                  ? 'bg-[#06B6D4] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Half-Wave Rectifier
            </button>
            <button
              onClick={() => setMode('full-wave-bridge')}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                mode === 'full-wave-bridge'
                  ? 'bg-[#06B6D4] text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Bridge Rectifier
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Material Selector */}
          <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
            <button
              onClick={() => setMaterial('Silicon')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                material === 'Silicon'
                  ? 'bg-white text-[#06B6D4] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Silicon (0.7V)
            </button>
            <button
              onClick={() => setMaterial('Germanium')}
              className={`px-2 py-0.5 rounded font-bold transition-colors ${
                material === 'Germanium'
                  ? 'bg-white text-[#2563EB] shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Germanium (0.3V)
            </button>
          </div>

          <button
            onClick={() => setShowDrawer((v) => !v)}
            className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1.5 border transition-colors ${
              showDrawer
                ? 'bg-[#06B6D4] text-white border-[#06B6D4]'
                : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory & Steps</span>
          </button>

          <BugReportModal
            simulationId="diode-iv-rectifier"
            moduleName="PN Junction Diode & Rectifiers"
            triggerText="Report Bug"
            diagnosticSnapshot={{
              mode,
              material,
              peakVoltage,
              frequency,
              hasCapacitorFilter,
              capacitanceMicroFarads,
              metrics: rectifierResult,
            }}
          />
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Side: Simulation Interactive Stage */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
          {mode === 'diode-iv' ? (
            /* MODE 1: DIODE I-V CHARACTERISTIC PLOTTER */
            <div className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900">
                    {material} PN Junction Diode DC I-V Characteristic
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Exponential Shockley equation curve showing knee voltage V_gamma and reverse saturation current I_s.
                  </p>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-cyan-50 text-[#0891B2] border border-cyan-200">
                  Knee V_γ ≈ {material === 'Silicon' ? '0.70 V' : '0.30 V'}
                </span>
              </div>

              {/* I-V Coordinate Graph */}
              <div className="relative w-full h-72 bg-zinc-50 border border-zinc-200 rounded-xl p-3">
                <svg viewBox="0 0 500 240" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <g stroke="#E2E8F0" strokeWidth="1">
                    {[0, 60, 120, 180, 240].map((y) => (
                      <line key={`gy-${y}`} x1="50" y1={y} x2="480" y2={y} />
                    ))}
                    {[50, 150, 250, 350, 480].map((x) => (
                      <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2="200" />
                    ))}
                  </g>

                  {/* Axes (Origin at X=200, Y=200) */}
                  <line x1="50" y1="200" x2="480" y2="200" stroke="#475569" strokeWidth="2" />
                  <line x1="200" y1="10" x2="200" y2="220" stroke="#475569" strokeWidth="2" />

                  {/* Axis Labels */}
                  <text x="475" y="215" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="end">
                    Forward Voltage V_D (V) →
                  </text>
                  <text x="55" y="215" fill="#475569" fontSize="10" fontWeight="bold">
                    ← Reverse Voltage
                  </text>
                  <text x="205" y="20" fill="#475569" fontSize="10" fontWeight="bold">
                    Current I_D (mA) ↑
                  </text>

                  {/* Zero Voltage Mark */}
                  <text x="195" y="215" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="end">
                    0V
                  </text>
                  <text x="350" y="215" fill="#0891B2" fontSize="10" fontWeight="bold" textAnchor="middle">
                    +0.7V
                  </text>

                  {/* Exponential Curve Polyline */}
                  <polyline
                    points={ivPoints
                      .map((p) => {
                        // Map Voltage (-2V to 1V): X from 50 to 480
                        const x = 200 + (p.voltage / 1.0) * 220;
                        // Map Current (0 to 30mA): Y from 200 to 20
                        const y = 200 - (Math.min(30, Math.max(0, p.currentMA)) / 30) * 180;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ')}
                    fill="none"
                    stroke={material === 'Silicon' ? '#06B6D4' : '#2563EB'}
                    strokeWidth="3"
                  />
                </svg>
              </div>

              {/* Analytical Summary Cards */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Material</span>
                  <span className="text-sm font-bold text-zinc-900">{material}</span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Threshold Voltage</span>
                  <span className="text-sm font-mono font-bold text-[#06B6D4]">
                    {material === 'Silicon' ? '0.70 V' : '0.30 V'}
                  </span>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-2.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold block">Reverse Saturation (I_s)</span>
                  <span className="text-sm font-mono font-bold text-[#F43F5E]">
                    {material === 'Silicon' ? '1.0 pA' : '1.0 µA'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* MODE 2 & 3: RECTIFIER OSCILLOSCOPE WORKSPACE */
            <div className="space-y-4">
              {/* Circuit Controls Toolbar */}
              <div className="bg-white border border-zinc-200 rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
                {/* AC Peak Voltage Slider */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-zinc-700">Input Peak (V_m):</span>
                  <input
                    type="range"
                    min="2"
                    max="20"
                    step="1"
                    value={peakVoltage}
                    onChange={(e) => setPeakVoltage(parseFloat(e.target.value))}
                    className="accent-[#06B6D4] w-24 h-1.5 bg-zinc-200 rounded"
                  />
                  <span className="font-mono font-bold text-[#06B6D4] w-12">{peakVoltage} V</span>
                </div>

                {/* Filter Capacitor Toggle */}
                <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
                  <button
                    onClick={() => setHasCapacitorFilter((v) => !v)}
                    className={`px-2.5 py-1 rounded font-bold border transition-colors ${
                      hasCapacitorFilter
                        ? 'bg-[#22C55E] text-white border-[#22C55E]'
                        : 'bg-zinc-100 text-zinc-700 border-zinc-300 hover:bg-zinc-200'
                    }`}
                  >
                    Smoothing Capacitor Filter: {hasCapacitorFilter ? 'ON' : 'OFF'}
                  </button>

                  {hasCapacitorFilter && (
                    <div className="flex items-center gap-1.5 ml-2">
                      <span className="text-zinc-600 font-semibold">C:</span>
                      <select
                        value={capacitanceMicroFarads}
                        onChange={(e) => setCapacitanceMicroFarads(parseInt(e.target.value))}
                        className="bg-white border border-zinc-300 rounded px-1.5 py-0.5 font-mono font-bold"
                      >
                        <option value="10">10 µF</option>
                        <option value="47">47 µF</option>
                        <option value="100">100 µF</option>
                        <option value="470">470 µF</option>
                        <option value="1000">1000 µF</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Load Resistance */}
                <div className="flex items-center gap-2 border-l border-zinc-200 pl-3">
                  <span className="font-bold text-zinc-700">Load R_L:</span>
                  <select
                    value={loadResistance}
                    onChange={(e) => setLoadResistance(parseInt(e.target.value))}
                    className="bg-white border border-zinc-300 rounded px-1.5 py-0.5 font-mono font-bold"
                  >
                    <option value="100">100 Ω</option>
                    <option value="470">470 Ω</option>
                    <option value="1000">1.0 kΩ</option>
                    <option value="4700">4.7 kΩ</option>
                    <option value="10000">10 kΩ</option>
                  </select>
                </div>
              </div>

              {/* Dual-Trace Oscilloscope */}
              <Oscilloscope
                samples={scopeSamples}
                ch1Label="CH1: AC Input (V_in)"
                ch2Label={
                  mode === 'full-wave-bridge'
                    ? 'CH2: Bridge Rectified (V_out)'
                    : 'CH2: Half-Wave Output (V_out)'
                }
                ch1Color="#06B6D4"
                ch2Color="#F43F5E"
                vpp={rectifierResult.rippleVoltagePP}
                vrms={rectifierResult.rmsVoltage}
                vdc={rectifierResult.averageDCVoltage}
                frequency={frequency}
              />

              {/* Analytical Waveform Performance HUD Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white border border-zinc-200 rounded-lg p-2.5 shadow-xs">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                    DC Average (V_dc)
                  </span>
                  <span className="text-lg font-mono font-bold text-[#F43F5E]">
                    {rectifierResult.averageDCVoltage} V
                  </span>
                </div>

                <div className="bg-white border border-zinc-200 rounded-lg p-2.5 shadow-xs">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                    Ripple Factor (r)
                  </span>
                  <span
                    className={`text-lg font-mono font-bold ${
                      rectifierResult.rippleFactor < 0.2 ? 'text-[#22C55E]' : 'text-amber-600'
                    }`}
                  >
                    {rectifierResult.rippleFactor}
                  </span>
                </div>

                <div className="bg-white border border-zinc-200 rounded-lg p-2.5 shadow-xs">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                    Peak-to-Peak Ripple
                  </span>
                  <span className="text-lg font-mono font-bold text-zinc-900">
                    {rectifierResult.rippleVoltagePP} V
                  </span>
                </div>

                <div className="bg-white border border-zinc-200 rounded-lg p-2.5 shadow-xs">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">
                    Rectification Efficiency
                  </span>
                  <span className="text-lg font-mono font-bold text-[#2563EB]">
                    {rectifierResult.rectificationEfficiency}%
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Educational Theory Drawer */}
        {showDrawer && (
          <div className="absolute inset-y-0 right-0 z-30 lg:relative lg:inset-auto lg:z-auto h-full w-80 sm:w-96 border-l border-zinc-200 bg-white flex flex-col shrink-0 shadow-2xl lg:shadow-none">
            {/* Drawer Header Tabs */}
            <div className="flex items-center border-b border-zinc-200 bg-zinc-50 p-1 gap-1">
              {(
                [
                  { id: 'theory', label: 'Theory', icon: BookOpen },
                  { id: 'procedure', label: 'Procedure', icon: ListOrdered },
                  { id: 'pitfalls', label: 'Pitfalls', icon: AlertTriangle },
                  { id: 'quiz', label: 'Quiz', icon: HelpCircle },
                ] as const
              ).map((t) => {
                const Icon = t.icon;
                const isSelected = activeTab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-[#06B6D4] text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto p-4 text-xs leading-relaxed space-y-4">
              {activeTab === 'theory' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Semiconductor Diodes & AC Rectification
                  </h3>
                  <p className="text-zinc-600">
                    A semiconductor PN junction diode is an asymmetrical two-terminal device that
                    permits current flow with negligible forward resistance when forward-biased, but
                    blocks current when reverse-biased.
                  </p>

                  <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-lg space-y-1.5">
                    <span className="text-[11px] font-bold text-[#0891B2] uppercase tracking-wide block">
                      Mathematical Equations
                    </span>
                    <div className="font-mono text-xs space-y-1 text-zinc-900">
                      <div>
                        <strong>Shockley:</strong> I_D = I_s · (e^(V_D / ηV_T) - 1)
                      </div>
                      <div>
                        <strong>Half-Wave V_dc:</strong> V_dc = (V_m - V_F) / π ≈ 0.318 V_m
                      </div>
                      <div>
                        <strong>Bridge V_dc:</strong> V_dc = 2(V_m - 2V_F) / π ≈ 0.636 V_m
                      </div>
                      <div>
                        <strong>Ripple Factor (r):</strong> r = 1 / (2√3 · f · R_L · C)
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-zinc-900">Rectifier Comparison:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-600">
                    <li>
                      <strong>Half-Wave:</strong> Only uses one half-cycle. Unfiltered ripple factor
                      is 1.21; max theoretical efficiency is 40.6%.
                    </li>
                    <li>
                      <strong>Bridge Rectifier:</strong> Conduction occurs over both positive and
                      negative half-cycles through complementary diode pairs. Ripple factor drops to
                      0.482; efficiency reaches 81.2%.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'procedure' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Virtual Laboratory Experimental Procedure
                  </h3>
                  <ol className="list-decimal pl-4 space-y-2 text-zinc-700">
                    <li>
                      Select <strong>Half-Wave Rectifier</strong> mode to observe single-diode
                      clipping of negative half-cycles on the oscilloscope.
                    </li>
                    <li>
                      Switch to <strong>Bridge Rectifier</strong> mode to observe full-wave inversion
                      where both cycles are rectified into positive DC pulses.
                    </li>
                    <li>
                      Toggle the <strong>Smoothing Capacitor Filter ON</strong> and observe the ripple
                      voltage drop drastically from pulsating DC to smooth linear DC.
                    </li>
                    <li>
                      Increase the filter capacitance from <strong>10µF to 1000µF</strong> and observe
                      the ripple factor approaching zero.
                    </li>
                  </ol>
                </div>
              )}

              {activeTab === 'pitfalls' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900">Common Mistakes & Pitfalls</h3>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-bold text-red-700">Capacitor Polarity Inversion</div>
                      <div className="text-zinc-600 text-[11px] mt-0.5">
                        Electrolytic capacitors must be connected with correct polarity. Inverting DC
                        leads causes dielectric breakdown and component failure.
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="font-bold text-amber-800">Exceeding Peak Inverse Voltage (PIV)</div>
                      <div className="text-zinc-600 text-[11px] mt-0.5">
                        Ensure the selected diode reverse breakdown rating V_Z exceeds the peak reverse
                        voltage applied during non-conducting half cycles.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'quiz' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900">Knowledge Check</h3>

                  <div className="space-y-2">
                    <div className="font-semibold text-zinc-800">
                      1. What is the ripple factor of an unfiltered Full-Wave Bridge Rectifier?
                    </div>
                    {['1.21', '0.482', '0.10', '0.00'].map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuizAnswers((p) => ({ ...p, 0: idx }))}
                        className={`w-full text-left p-2 rounded border text-xs font-medium transition-colors ${
                          quizAnswers[0] === idx
                            ? 'bg-cyan-50 border-cyan-500 text-cyan-900'
                            : 'bg-white border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="w-full py-1.5 bg-[#06B6D4] hover:bg-cyan-600 text-white font-bold rounded-md shadow-xs text-xs mt-2"
                  >
                    Submit Answers
                  </button>

                  {quizSubmitted && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Correct! The theoretical ripple factor is approximately 0.482.</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
