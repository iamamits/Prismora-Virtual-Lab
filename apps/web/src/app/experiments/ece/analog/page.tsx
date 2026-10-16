/**
 * Prismora Electronics & Communication: Analog Electronics Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Bombay, IIT Kharagpur & IIT Roorkee
 * Experiments:
 * 1. Bipolar Junction Transistor (BJT) Common Emitter Characteristics (EC-201)
 * 2. Operational Amplifier (Op-Amp) Linear & Computing Circuits (EC-204)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  BjtCharacteristicsEngine,
  DEFAULT_BJT_PARAMS,
  type BjtParameters,
  OpAmpEngine,
  DEFAULT_OPAMP_PARAMS,
  type OpAmpParameters,
  type OpAmpConfiguration,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  BookOpen,
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

type AnalogExpId = 'bjt-characteristics' | 'op-amp';

interface AnalogExperimentDef {
  readonly id: AnalogExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const ANALOG_EXPERIMENTS: readonly AnalogExperimentDef[] = [
  {
    id: 'bjt-characteristics',
    title: 'BJT Common Emitter (CE) Input & Output Characteristics',
    shortTitle: 'BJT Characteristics',
    courseCode: 'EC-201 (Analog Electronic Circuits)',
    benchmark: 'IIT Kharagpur & IIT Roorkee',
    description: 'NPN/PNP transistor in CE configuration, input characteristics (IB vs VBE), output family of curves (IC vs VCE), Early voltage VA, and small-signal parameters.',
    color: '#06B6D4',
    equations: [
      'I_C = \\beta I_B \\left(1 + \\frac{V_{CE}}{V_A}\\right) \\quad (\\text{Active Region})',
      'I_B = \\frac{I_s}{\\beta} \\left(e^{\\frac{V_{BE}}{\\eta V_T}} - 1\\right)',
      'r_\\pi = \\frac{\\beta V_T}{I_C}, \\quad g_m = \\frac{I_C}{V_T}',
    ],
  },
  {
    id: 'op-amp',
    title: 'Operational Amplifiers: Inverting, Non-Inverting, Summing & Integrator',
    shortTitle: 'Op-Amp Circuits',
    courseCode: 'EC-204 (Linear Integrated Circuits)',
    benchmark: 'IIT Bombay & IIT Roorkee',
    description: 'Ideal vs real op-amp golden rules, virtual ground concept, inverting gain (-Rf/Rin), non-inverting gain (1 + Rf/R1), summing amplifier, and active integrator waveforms.',
    color: '#8B5CF6',
    equations: [
      'V_{out} = -\\frac{R_f}{R_{in}} V_{in} \\quad (\\text{Inverting})',
      'V_{out} = \\left(1 + \\frac{R_f}{R_1}\\right) V_{in} \\quad (\\text{Non-Inverting})',
      'V_{out}(t) = -\\frac{1}{R C} \\int_0^t V_{in}(\\tau) d\\tau \\quad (\\text{Integrator})',
    ],
  },
];

function AnalogWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as AnalogExpId) || 'bjt-characteristics';
  const [activeExpId, setActiveExpId] = useState<AnalogExpId>(
    ANALOG_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'bjt-characteristics',
  );

  const activeExp = useMemo(
    () => ANALOG_EXPERIMENTS.find((e) => e.id === activeExpId) ?? ANALOG_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // ==========================================
  // EXP 1: BJT States
  // ==========================================
  const [bjtParams, setBjtParams] = useState<BjtParameters>(DEFAULT_BJT_PARAMS);
  const bjtResult = useMemo(() => BjtCharacteristicsEngine.compute(bjtParams), [bjtParams]);

  // ==========================================
  // EXP 2: Op-Amp States
  // ==========================================
  const [opampParams, setOpampParams] = useState<OpAmpParameters>(DEFAULT_OPAMP_PARAMS);
  const opampResult = useMemo(() => OpAmpEngine.compute(opampParams), [opampParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 flex flex-col font-sans">
      {/* Top Breadcrumb & Header */}
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Link href="/" className="hover:text-blue-600 transition-colors">Prismora</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/experiments/ece" className="hover:text-blue-600 transition-colors">ECE Lab</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-zinc-900">Analog Electronics</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`ece-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ANALOG_EXPERIMENTS.map((exp) => {
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
                    layoutId="active-analog-tab"
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
          {/* TAB 1: BJT CHARACTERISTICS */}
          {activeExpId === 'bjt-characteristics' && (
            <motion.div
              key="bjt-characteristics"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200 uppercase">
                      Region: {bjtResult.operatingRegion} (β = {bjtParams.nominalBeta})
                    </span>
                  </div>

                  {/* Output Characteristics Family of Curves */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#334155" strokeWidth="1.5" />

                      {/* Family of IC vs VCE curves */}
                      {bjtResult.outputCharacteristicsCurves.map((curve, cIdx) => {
                        const pts = curve.points;
                        const maxVce = 12;
                        const maxIc = 18; // mA
                        const toX = (v: number) => 40 + (v / maxVce) * 440;
                        const toY = (i: number) => 170 - (i / maxIc) * 150;

                        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.vce).toFixed(1)} ${toY(p.icMa).toFixed(1)}`).join(' ');
                        const isCurrentIb = curve.ibMicroA === bjtParams.baseCurrentMicroA;

                        return (
                          <g key={cIdx}>
                            <path
                              d={path}
                              fill="none"
                              stroke={isCurrentIb ? '#06B6D4' : '#475569'}
                              strokeWidth={isCurrentIb ? 2.5 : 1}
                            />
                            <text x={toX(11.5)} y={toY(pts[pts.length - 1]?.icMa ?? 0) - 3} fill={isCurrentIb ? '#06B6D4' : '#64748B'} fontSize="9" fontFamily="monospace">
                              {curve.ibMicroA}µA
                            </text>
                          </g>
                        );
                      })}

                      {/* Current operating Q-point */}
                      {(() => {
                        const toX = (v: number) => 40 + (v / 12) * 440;
                        const toY = (i: number) => 170 - (i / 18) * 150;
                        const qx = toX(bjtParams.collectorVoltageVce);
                        const qy = toY(bjtResult.collectorCurrentMa);
                        return <circle cx={qx} cy={qy} r="5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2" />;
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Collector-Emitter Voltage VCE (V)</span>
                      <span className="text-cyan-400">Q-Point: (VCE = {bjtParams.collectorVoltageVce}V, IC = {bjtResult.collectorCurrentMa.toFixed(2)}mA)</span>
                      <span>Collector Current IC (mA)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Collector Current IC</span>
                      <span className="text-base font-mono font-black text-cyan-600">{bjtResult.collectorCurrentMa.toFixed(2)} mA</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Base-Emitter VBE</span>
                      <span className="text-base font-mono font-black text-zinc-900">{bjtResult.baseEmitterVoltageV.toFixed(3)} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Transconductance gm</span>
                      <span className="text-base font-mono font-black text-blue-600">{bjtResult.smallSignalGmMs.toFixed(1)} mS</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Input Resistance rπ</span>
                      <span className="text-base font-mono font-black text-emerald-600">{bjtResult.smallSignalRpiOhms.toFixed(0)} Ω</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-cyan-600" />
                    <span>BJT Operating Biasing</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Base Current (IB):</span>
                        <span className="font-bold text-cyan-600">{bjtParams.baseCurrentMicroA} µA</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={bjtParams.baseCurrentMicroA}
                        onChange={(e) => setBjtParams({ ...bjtParams, baseCurrentMicroA: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Collector Voltage (VCE):</span>
                        <span className="font-bold text-zinc-900">{bjtParams.collectorVoltageVce} V</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="12.0"
                        step="0.2"
                        value={bjtParams.collectorVoltageVce}
                        onChange={(e) => setBjtParams({ ...bjtParams, collectorVoltageVce: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Transistor Gain (β):</span>
                        <span className="font-bold text-zinc-900">{bjtParams.nominalBeta}</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="300"
                        step="10"
                        value={bjtParams.nominalBeta}
                        onChange={(e) => setBjtParams({ ...bjtParams, nominalBeta: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase block">Transistor Physics</span>
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

          {/* TAB 2: OP-AMP CIRCUITS */}
          {activeExpId === 'op-amp' && (
            <motion.div
              key="op-amp"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200 capitalize">
                      {opampParams.configuration.replace('_', ' ')} (Gain = {opampResult.closedLoopGain.toFixed(2)})
                    </span>
                  </div>

                  {/* SVG Op-Amp Schematic */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      {/* Triangle Op-Amp Body */}
                      <polygon points="200,50 200,170 320,110" fill="#1E293B" stroke="#8B5CF6" strokeWidth="2.5" />
                      {/* Inputs minus & plus signs */}
                      <text x="215" y="80" fill="#E2E8F0" fontSize="16" fontFamily="monospace">-</text>
                      <text x="215" y="145" fill="#E2E8F0" fontSize="16" fontFamily="monospace">+</text>

                      {/* Inverting input lead */}
                      <line x1="80" y1="75" x2="200" y2="75" stroke="#38BDF8" strokeWidth="2.5" />
                      {/* Input resistor Rin */}
                      <rect x="110" y="67" width="40" height="16" fill="#F59E0B" rx="2" />
                      <text x="130" y="60" textAnchor="middle" fill="#A1A1AA" fontSize="10" fontFamily="monospace">Rin={opampParams.inputResistanceRinKOhms}kΩ</text>

                      {/* Non-inverting input to ground */}
                      <line x1="160" y1="140" x2="200" y2="140" stroke="#94A3B8" strokeWidth="2.5" />
                      <line x1="150" y1="150" x2="170" y2="150" stroke="#94A3B8" strokeWidth="2" />

                      {/* Output line */}
                      <line x1="320" y1="110" x2="420" y2="110" stroke="#8B5CF6" strokeWidth="2.5" />

                      {/* Feedback branch Rf */}
                      <line x1="180" y1="75" x2="180" y2="35" stroke="#38BDF8" strokeWidth="2" />
                      <line x1="180" y1="35" x2="350" y2="35" stroke="#38BDF8" strokeWidth="2" />
                      <line x1="350" y1="35" x2="350" y2="110" stroke="#8B5CF6" strokeWidth="2" />
                      <rect x="240" y="27" width="50" height="16" fill="#A855F7" rx="2" />
                      <text x="265" y="22" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontFamily="monospace">Rf={opampParams.feedbackResistanceRfKOhms}kΩ</text>

                      <text x="440" y="115" fill="#8B5CF6" fontSize="12" fontWeight="bold" fontFamily="monospace">
                        Vout = {opampResult.outputVoltageVolts.toFixed(2)}V
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Output Vout</span>
                      <span className="text-base font-mono font-black text-purple-600">{opampResult.outputVoltageVolts.toFixed(2)} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Closed-Loop Gain</span>
                      <span className="text-base font-mono font-black text-zinc-900">{opampResult.closedLoopGain.toFixed(2)}x</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Virtual Ground</span>
                      <span className="text-base font-mono font-black text-blue-600">{opampResult.virtualGroundVoltageVolts.toFixed(3)} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Rail Saturation</span>
                      <span className="text-base font-mono font-black text-emerald-600">{opampResult.isSaturated ? 'Saturated' : 'Linear Range'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>Op-Amp Configuration</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Topology:</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        {(['inverting', 'non_inverting', 'summing', 'integrator'] as OpAmpConfiguration[]).map((cfg) => (
                          <button
                            key={cfg}
                            onClick={() => setOpampParams({ ...opampParams, configuration: cfg })}
                            className={`px-2 py-1.5 rounded-lg text-xs font-mono font-semibold border text-left ${
                              opampParams.configuration === cfg
                                ? 'border-purple-500 bg-purple-50 text-purple-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {cfg.replace('_', ' ')}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Input Voltage (Vin):</span>
                        <span className="font-bold text-zinc-900">{opampParams.inputVoltageVin1Volts} V</span>
                      </div>
                      <input
                        type="range"
                        min="-5.0"
                        max="5.0"
                        step="0.2"
                        value={opampParams.inputVoltageVin1Volts}
                        onChange={(e) => setOpampParams({ ...opampParams, inputVoltageVin1Volts: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Feedback Rf:</span>
                        <span className="font-bold text-zinc-900">{opampParams.feedbackResistanceRfKOhms} kΩ</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="100"
                        step="5"
                        value={opampParams.feedbackResistanceRfKOhms}
                        onChange={(e) => setOpampParams({ ...opampParams, feedbackResistanceRfKOhms: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Input Rin:</span>
                        <span className="font-bold text-zinc-900">{opampParams.inputResistanceRinKOhms} kΩ</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        step="5"
                        value={opampParams.inputResistanceRinKOhms}
                        onChange={(e) => setOpampParams({ ...opampParams, inputResistanceRinKOhms: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">Op-Amp Transfer Function</span>
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

export default function AnalogWorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Analog Laboratory...</div>}>
      <AnalogWorkbenchContent />
    </Suspense>
  );
}
