/**
 * Prismora Electrical Engineering Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Roorkee, IIT Bombay & COEP Pune
 * Experiments:
 * 1. Network Theorems: Thévenin, Norton & Maximum Power Transfer (EE-201)
 * 2. Single-Phase Transformer Open & Short Circuit Tests (EE-203)
 * 3. Series RLC Circuit AC Resonance & Quality Factor (EE-205)
 * 4. DC Shunt Motor Speed-Torque & Armature/Field Control (EE-207)
 * 5. Three-Phase Power & Power Factor by Two-Wattmeter Method (EE-209)
 * 6. Alternator Voltage Regulation by Synchronous Impedance (EMF) Method (EE-301)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  evaluateNetworkTheorems,
  DEFAULT_NETWORK_CIRCUIT_PARAMS,
  TransformerTestEngine,
  DEFAULT_TRANSFORMER_PARAMS,
  type TransformerTestParameters,
  RlcResonanceEngine,
  DEFAULT_RLC_PARAMS,
  type RlcParameters,
  DcMotorEngine,
  DEFAULT_DC_MOTOR_PARAMS,
  type DcMotorParameters,
  type MotorControlType,
  TwoWattmeterEngine,
  DEFAULT_TWO_WATTMETER_PARAMS,
  type TwoWattmeterParameters,
  type LoadConnection,
  AlternatorRegulationEngine,
  DEFAULT_ALTERNATOR_PARAMS,
  type AlternatorParameters,
  type PowerFactorType,
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

type ElectricalExpId =
  | 'network-theorems'
  | 'transformer-test'
  | 'rlc-resonance'
  | 'dc-motor'
  | 'two-wattmeter'
  | 'alternator-regulation';

interface ElectricalExperimentDef {
  readonly id: ElectricalExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const ELECTRICAL_EXPERIMENTS: readonly ElectricalExperimentDef[] = [
  {
    id: 'network-theorems',
    title: 'Network Theorems Lab: Thévenin, Norton & Maximum Power',
    shortTitle: 'Network Theorems',
    courseCode: 'EE-201 (Electric Circuit Analysis)',
    benchmark: 'IIT Roorkee & IIT Delhi',
    description: 'Circuit reduction, open-circuit voltage Voc = Vth, internal resistance Rin = Rth, and swept load maximum power curve.',
    color: '#2563EB',
    equations: [
      'V_{th} = V_{oc}, \\quad R_{th} = R_{in}',
      'I_N = \\frac{V_{th}}{R_{th}}',
      'P_{L,max} = \\frac{V_{th}^2}{4 R_{th}} \\quad (\\text{when } R_L = R_{th})',
    ],
  },
  {
    id: 'transformer-test',
    title: 'Single-Phase Transformer Open & Short Circuit Tests',
    shortTitle: 'Transformer Tests',
    courseCode: 'EE-203 (Electrical Machines I)',
    benchmark: 'IIT Roorkee & COEP Pune',
    description: 'Determine core loss Rc, magnetizing reactance Xm, equivalent winding impedance Req, Xeq, efficiency eta, and voltage regulation.',
    color: '#059669',
    equations: [
      'R_c = \\frac{V_0^2}{W_0}, \\quad X_m = \\frac{V_0}{I_0 \\sin\\phi_0}',
      'R_{eq} = \\frac{W_{sc}}{I_{sc}^2}, \\quad Z_{eq} = \\frac{V_{sc}}{I_{sc}}',
      '\\eta = \\frac{x S \\cos\\phi}{x S \\cos\\phi + P_i + x^2 P_{cu}} \\times 100\\%',
    ],
  },
  {
    id: 'rlc-resonance',
    title: 'Series RLC Circuit AC Resonance & Frequency Response',
    shortTitle: 'RLC Resonance',
    courseCode: 'EE-205 (Signals & Network Synthesis)',
    benchmark: 'IIT Roorkee & NITK Surathkal',
    description: 'AC frequency sweep, resonant frequency f0 = 1 / (2*pi*sqrt(LC)), Quality Factor Q, bandwidth, and phasor phase angles.',
    color: '#7C3AED',
    equations: [
      'f_0 = \\frac{1}{2\\pi\\sqrt{LC}}',
      'Z(f) = \\sqrt{R^2 + (\\omega L - \\frac{1}{\\omega C})^2}',
      'Q = \\frac{\\omega_0 L}{R} = \\frac{f_0}{BW}',
    ],
  },
  {
    id: 'dc-motor',
    title: 'DC Shunt Motor Speed Control & Torque-Speed Characteristics',
    shortTitle: 'DC Shunt Motor',
    courseCode: 'EE-207 (Electrical Machines II)',
    benchmark: 'IIT Roorkee & IIT Bombay',
    description: 'Armature voltage control (below base speed), field flux weakening (above base speed), back-EMF Eb, and mechanical torque-speed curves.',
    color: '#DC2626',
    equations: [
      'N = \\frac{V - I_a R_a}{k \\Phi}',
      'T_e = k \\Phi I_a = \\frac{E_b I_a}{\\omega_m}',
      'E_b = V - I_a R_a',
    ],
  },
  {
    id: 'two-wattmeter',
    title: 'Measurement of 3-Phase Power & Power Factor by Two-Wattmeter Method',
    shortTitle: 'Two-Wattmeter 3-Phase',
    courseCode: 'EE-209 (Measurements & Instrumentation)',
    benchmark: 'IIT Kharagpur & COEP Pune',
    description: 'Total active power P = W1 + W2, reactive power Q = sqrt(3)*(W1 - W2), and power factor angle tan(phi) across balanced 3-phase star/delta loads.',
    color: '#D97706',
    equations: [
      'P_{total} = W_1 + W_2 = \\sqrt{3} V_L I_L \\cos\\phi',
      '\\tan\\phi = \\sqrt{3} \\frac{W_1 - W_2}{W_1 + W_2}',
      '\\text{PF} = \\cos\\phi',
    ],
  },
  {
    id: 'alternator-regulation',
    title: 'Voltage Regulation of 3-Phase Alternator by Synchronous Impedance Method',
    shortTitle: 'Alternator Regulation',
    courseCode: 'EE-301 (AC Electrical Machines)',
    benchmark: 'IIT Roorkee & IIT Madras',
    description: 'Open-circuit characteristics (OCC), short-circuit characteristics (SCC), synchronous impedance Zs = Voc / Isc, and regulation at lagging/leading PF.',
    color: '#0284C7',
    equations: [
      'Z_s = \\frac{V_{oc,ph}}{I_{sc,ph}} \\quad (\\text{at same } I_f)',
      'E_0 = \\sqrt{(V\\cos\\phi + I_a R_a)^2 + (V\\sin\\phi \\pm I_a X_s)^2}',
      '\\% \\text{Regulation} = \\frac{E_0 - V}{V} \\times 100\\%',
    ],
  },
];

function ElectricalWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as ElectricalExpId) || 'network-theorems';
  const [activeExpId, setActiveExpId] = useState<ElectricalExpId>(
    ELECTRICAL_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'network-theorems',
  );

  const activeExp = useMemo(
    () => ELECTRICAL_EXPERIMENTS.find((e) => e.id === activeExpId) ?? ELECTRICAL_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // ==========================================
  // EXP 1: Network Theorems States
  // ==========================================
  const [v1, setV1] = useState<number>(12);
  const [v2, setV2] = useState<number>(6);
  const [r1, setR1] = useState<number>(100);
  const [r2, setR2] = useState<number>(150);
  const [r3, setR3] = useState<number>(220);
  const [loadResistance, setLoadResistance] = useState<number>(100);

  const networkResult = useMemo(
    () =>
      evaluateNetworkTheorems({
        source1Volts: v1,
        source2Volts: v2,
        r1Ohms: r1,
        r2Ohms: r2,
        r3Ohms: r3,
        loadResistanceOhms: loadResistance,
      }),
    [v1, v2, r1, r2, r3, loadResistance],
  );

  // ==========================================
  // EXP 2: Transformer Tests States
  // ==========================================
  const [txParams, setTxParams] = useState<TransformerTestParameters>(DEFAULT_TRANSFORMER_PARAMS);
  const txResult = useMemo(() => TransformerTestEngine.compute(txParams), [txParams]);

  // ==========================================
  // EXP 3: RLC Resonance States
  // ==========================================
  const [rlcParams, setRlcParams] = useState<RlcParameters>(DEFAULT_RLC_PARAMS);
  const rlcResult = useMemo(() => RlcResonanceEngine.compute(rlcParams), [rlcParams]);

  // ==========================================
  // EXP 4: DC Shunt Motor States
  // ==========================================
  const [dcMotorParams, setDcMotorParams] = useState<DcMotorParameters>(DEFAULT_DC_MOTOR_PARAMS);
  const dcMotorResult = useMemo(() => DcMotorEngine.compute(dcMotorParams), [dcMotorParams]);

  // ==========================================
  // EXP 5: Two-Wattmeter States
  // ==========================================
  const [twoWattParams, setTwoWattParams] = useState<TwoWattmeterParameters>(DEFAULT_TWO_WATTMETER_PARAMS);
  const twoWattResult = useMemo(() => TwoWattmeterEngine.compute(twoWattParams), [twoWattParams]);

  // ==========================================
  // EXP 6: Alternator Regulation States
  // ==========================================
  const [altParams, setAltParams] = useState<AlternatorParameters>(DEFAULT_ALTERNATOR_PARAMS);
  const altResult = useMemo(() => AlternatorRegulationEngine.compute(altParams), [altParams]);

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
            <span className="font-bold text-zinc-900">Electrical Engineering Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`ee-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {ELECTRICAL_EXPERIMENTS.map((exp) => {
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
                    layoutId="active-ee-tab"
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
          {/* TAB 1: NETWORK THEOREMS */}
          {activeExpId === 'network-theorems' && (
            <motion.div
              key="network-theorems"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      Rth = {networkResult.theveninResistanceOhms.toFixed(1)} Ω
                    </span>
                  </div>

                  {/* Circuit Diagram Visualizer */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      <line x1="80" y1="60" x2="220" y2="60" stroke="#38BDF8" strokeWidth="2.5" />
                      <line x1="220" y1="60" x2="360" y2="60" stroke="#38BDF8" strokeWidth="2.5" />
                      <line x1="360" y1="60" x2="420" y2="60" stroke="#38BDF8" strokeWidth="2.5" />
                      <line x1="80" y1="160" x2="420" y2="160" stroke="#38BDF8" strokeWidth="2.5" />

                      {/* Source 1 */}
                      <circle cx="80" cy="110" r="18" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
                      <text x="80" y="114" textAnchor="middle" fill="#E2E8F0" fontSize="10" fontFamily="monospace">V1</text>
                      <line x1="80" y1="60" x2="80" y2="92" stroke="#38BDF8" strokeWidth="2.5" />
                      <line x1="80" y1="128" x2="80" y2="160" stroke="#38BDF8" strokeWidth="2.5" />

                      {/* Resistor R1 */}
                      <rect x="130" y="52" width="40" height="16" fill="#F59E0B" rx="2" />
                      <text x="150" y="44" textAnchor="middle" fill="#A1A1AA" fontSize="10" fontFamily="monospace">R1={r1}Ω</text>

                      {/* Resistor R2 (Branch) */}
                      <rect x="212" y="90" width="16" height="40" fill="#F59E0B" rx="2" />
                      <line x1="220" y1="60" x2="220" y2="90" stroke="#38BDF8" strokeWidth="2.5" />
                      <line x1="220" y1="130" x2="220" y2="160" stroke="#38BDF8" strokeWidth="2.5" />
                      <text x="245" y="114" fill="#A1A1AA" fontSize="10" fontFamily="monospace">R2={r2}Ω</text>

                      {/* Load RL */}
                      <rect x="412" y="90" width="16" height="40" fill="#EF4444" rx="2" />
                      <line x1="420" y1="60" x2="420" y2="90" stroke="#38BDF8" strokeWidth="2.5" />
                      <line x1="420" y1="130" x2="420" y2="160" stroke="#38BDF8" strokeWidth="2.5" />
                      <text x="445" y="114" fill="#EF4444" fontSize="11" fontWeight="bold" fontFamily="monospace">RL={loadResistance}Ω</text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Thévenin Voc</span>
                      <span className="text-base font-mono font-black text-blue-600">{networkResult.theveninVoltageVolts.toFixed(2)} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Thévenin Rth</span>
                      <span className="text-base font-mono font-black text-zinc-900">{networkResult.theveninResistanceOhms.toFixed(1)} Ω</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Norton Current In</span>
                      <span className="text-base font-mono font-black text-emerald-600">{(networkResult.nortonCurrentAmps * 1000).toFixed(1)} mA</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Load Power</span>
                      <span className="text-base font-mono font-black text-amber-600">{(networkResult.maxPowerTransferWatts * 1000).toFixed(1)} mW</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-blue-600" />
                    <span>Circuit Parameters</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Load Resistance (RL):</span>
                        <span className="font-bold text-red-600">{loadResistance} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="500"
                        step="5"
                        value={loadResistance}
                        onChange={(e) => setLoadResistance(parseFloat(e.target.value))}
                        className="w-full accent-red-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Source V1:</span>
                        <span className="font-bold text-zinc-900">{v1} V</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        step="1"
                        value={v1}
                        onChange={(e) => setV1(parseFloat(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Resistor R1:</span>
                        <span className="font-bold text-zinc-900">{r1} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="500"
                        step="10"
                        value={r1}
                        onChange={(e) => setR1(parseFloat(e.target.value))}
                        className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-blue-800 uppercase block">Circuit Theorems</span>
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

          {/* TAB 2: TRANSFORMER TESTS */}
          {activeExpId === 'transformer-test' && (
            <motion.div
              key="transformer-test"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Efficiency η = {txResult.efficiencyPct.toFixed(1)}%
                    </span>
                  </div>

                  {/* Transformer Schematic Visualizer */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      {/* Core */}
                      <rect x="180" y="40" width="140" height="140" fill="none" stroke="#64748B" strokeWidth="16" rx="10" />
                      <rect x="205" y="65" width="90" height="90" fill="#09090B" rx="4" />

                      {/* Primary Winding */}
                      <path d="M 120 70 L 172 70 M 120 90 L 172 90 M 120 110 L 172 110 M 120 130 L 172 130 M 120 150 L 172 150" stroke="#F59E0B" strokeWidth="4" />
                      <text x="140" y="55" textAnchor="middle" fill="#F59E0B" fontSize="11" fontFamily="monospace">Primary (230V)</text>

                      {/* Secondary Winding */}
                      <path d="M 328 70 L 380 70 M 328 90 L 380 90 M 328 110 L 380 110 M 328 130 L 380 130 M 328 150 L 380 150" stroke="#10B981" strokeWidth="4" />
                      <text x="360" y="55" textAnchor="middle" fill="#10B981" fontSize="11" fontFamily="monospace">Secondary (115V)</text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Core Resistance Rc</span>
                      <span className="text-base font-mono font-black text-zinc-900">{txResult.coreResistanceRcOhms.toFixed(0)} Ω</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Magnetizing Xm</span>
                      <span className="text-base font-mono font-black text-emerald-600">{txResult.magnetizingReactanceXmOhms.toFixed(0)} Ω</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Eq Resistance Req</span>
                      <span className="text-base font-mono font-black text-blue-600">{txResult.equivalentResistanceReqOhms.toFixed(2)} Ω</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Voltage Regulation</span>
                      <span className="text-base font-mono font-black text-purple-600">{txResult.voltageRegulationPct.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Transformer Loading</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Load Fraction (x):</span>
                        <span className="font-bold text-zinc-900">{(txParams.loadFraction * 100).toFixed(0)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1.2"
                        step="0.05"
                        value={txParams.loadFraction}
                        onChange={(e) => setTxParams({ ...txParams, loadFraction: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Power Factor (cos φ):</span>
                        <span className="font-bold text-zinc-900">{txParams.loadPowerFactor}</span>
                      </div>
                      <input
                        type="range"
                        min="0.4"
                        max="1.0"
                        step="0.05"
                        value={txParams.loadPowerFactor}
                        onChange={(e) => setTxParams({ ...txParams, loadPowerFactor: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Machine Theory</span>
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

          {/* TAB 3: RLC RESONANCE */}
          {activeExpId === 'rlc-resonance' && (
            <motion.div
              key="rlc-resonance"
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
                      f0 = {rlcResult.resonantFrequencyHz.toFixed(1)} Hz (Q = {rlcResult.qualityFactorQ.toFixed(2)})
                    </span>
                  </div>

                  {/* Frequency Response Graph */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#334155" strokeWidth="1.5" />

                      {(() => {
                        const pts = rlcResult.frequencyResponse;
                        if (!pts || pts.length === 0) return null;
                        const maxI = Math.max(1e-4, ...pts.map((p) => p.currentAmps));
                        const minF = pts[0]?.frequencyHz ?? 10;
                        const maxF = pts[pts.length - 1]?.frequencyHz ?? 2000;
                        const toX = (f: number) => 40 + ((f - minF) / (maxF - minF)) * 440;
                        const toY = (i: number) => 170 - (i / maxI) * 140;

                        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.frequencyHz).toFixed(1)} ${toY(p.currentAmps).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#A855F7" strokeWidth="2.5" />;
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Frequency f (Hz)</span>
                      <span className="text-purple-400">Resonant Current Peak I(f0)</span>
                      <span>Bandwidth BW = {rlcResult.bandwidthHz.toFixed(1)} Hz</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Resonant Freq f0</span>
                      <span className="text-base font-mono font-black text-purple-600">{rlcResult.resonantFrequencyHz.toFixed(1)} Hz</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Quality Factor Q</span>
                      <span className="text-base font-mono font-black text-zinc-900">{rlcResult.qualityFactorQ.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Bandwidth BW</span>
                      <span className="text-base font-mono font-black text-blue-600">{rlcResult.bandwidthHz.toFixed(1)} Hz</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Resonant Current</span>
                      <span className="text-base font-mono font-black text-emerald-600">{(rlcResult.resonantCurrentAmps * 1000).toFixed(1)} mA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>RLC Circuit Components</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Resistance (R):</span>
                        <span className="font-bold text-zinc-900">{rlcParams.resistanceOhms} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="5"
                        value={rlcParams.resistanceOhms}
                        onChange={(e) => setRlcParams({ ...rlcParams, resistanceOhms: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Inductance (L):</span>
                        <span className="font-bold text-zinc-900">{rlcParams.inductanceMh} mH</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={rlcParams.inductanceMh}
                        onChange={(e) => setRlcParams({ ...rlcParams, inductanceMh: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Capacitance (C):</span>
                        <span className="font-bold text-zinc-900">{rlcParams.capacitanceMicroF} µF</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="10.0"
                        step="0.1"
                        value={rlcParams.capacitanceMicroF}
                        onChange={(e) => setRlcParams({ ...rlcParams, capacitanceMicroF: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">AC Circuit Theory</span>
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

          {/* TAB 4: DC SHUNT MOTOR */}
          {activeExpId === 'dc-motor' && (
            <motion.div
              key="dc-motor"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200 capitalize">
                      Speed: {dcMotorResult.speedRpm.toFixed(0)} RPM
                    </span>
                  </div>

                  {/* SVG DC Motor Schematic */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      {/* Armature Rotor Circle */}
                      <circle cx="250" cy="110" r="45" fill="#1E293B" stroke="#EF4444" strokeWidth="3" />
                      <text x="250" y="115" textAnchor="middle" fill="#F8FAFC" fontSize="13" fontWeight="bold" fontFamily="monospace">A</text>
                      {/* Brushes */}
                      <rect x="242" y="58" width="16" height="8" fill="#475569" />
                      <rect x="242" y="154" width="16" height="8" fill="#475569" />

                      {/* Field Winding (Shunt) */}
                      <rect x="120" y="70" width="20" height="80" fill="#F59E0B" rx="3" />
                      <text x="130" y="60" textAnchor="middle" fill="#F59E0B" fontSize="10" fontFamily="monospace">Rf={dcMotorParams.fieldResistanceOhms}Ω</text>

                      {/* Supply Rail */}
                      <line x1="80" y1="40" x2="400" y2="40" stroke="#EF4444" strokeWidth="2.5" />
                      <line x1="80" y1="180" x2="400" y2="180" stroke="#38BDF8" strokeWidth="2.5" />
                      <text x="70" y="115" textAnchor="middle" fill="#EF4444" fontSize="12" fontWeight="bold" fontFamily="monospace">
                        V = {dcMotorParams.supplyVoltageV}V
                      </text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Rotor Speed N</span>
                      <span className="text-base font-mono font-black text-red-600">{dcMotorResult.speedRpm.toFixed(0)} RPM</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Armature Current Ia</span>
                      <span className="text-base font-mono font-black text-zinc-900">{dcMotorResult.armatureCurrentA.toFixed(2)} A</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Back EMF Eb</span>
                      <span className="text-base font-mono font-black text-blue-600">{dcMotorResult.backEmfV.toFixed(1)} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Efficiency η</span>
                      <span className="text-base font-mono font-black text-emerald-600">{dcMotorResult.efficiencyPct.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-red-600" />
                    <span>Motor Controls</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Mechanical Load Torque:</span>
                        <span className="font-bold text-zinc-900">{dcMotorParams.loadTorqueNm} N·m</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="35"
                        step="1"
                        value={dcMotorParams.loadTorqueNm}
                        onChange={(e) => setDcMotorParams({ ...dcMotorParams, loadTorqueNm: parseFloat(e.target.value) })}
                        className="w-full accent-red-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Armature Voltage (Va):</span>
                        <span className="font-bold text-zinc-900">{dcMotorParams.supplyVoltageV} V</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="250"
                        step="10"
                        value={dcMotorParams.supplyVoltageV}
                        onChange={(e) => setDcMotorParams({ ...dcMotorParams, supplyVoltageV: parseFloat(e.target.value) })}
                        className="w-full accent-red-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Field Rheostat Rf:</span>
                        <span className="font-bold text-zinc-900">{dcMotorParams.fieldResistanceOhms} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="150"
                        max="400"
                        step="10"
                        value={dcMotorParams.fieldResistanceOhms}
                        onChange={(e) => setDcMotorParams({ ...dcMotorParams, fieldResistanceOhms: parseFloat(e.target.value) })}
                        className="w-full accent-red-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-red-800 uppercase block">DC Machine Equations</span>
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

          {/* TAB 5: TWO-WATTMETER METHOD */}
          {activeExpId === 'two-wattmeter' && (
            <motion.div
              key="two-wattmeter"
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
                      PF = {twoWattResult.calculatedPowerFactor.toFixed(3)} (P = {twoWattResult.totalActivePowerKw.toFixed(2)} kW)
                    </span>
                  </div>

                  {/* 3-Phase Wiring Schematic */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex items-center justify-center">
                    <svg className="w-full h-full" viewBox="0 0 500 220">
                      <rect x="0" y="0" width="500" height="220" fill="#09090B" />
                      {/* Lines R, Y, B */}
                      <line x1="40" y1="50" x2="440" y2="50" stroke="#EF4444" strokeWidth="2.5" />
                      <line x1="40" y1="110" x2="440" y2="110" stroke="#EAB308" strokeWidth="2.5" />
                      <line x1="40" y1="170" x2="440" y2="170" stroke="#3B82F6" strokeWidth="2.5" />

                      {/* Wattmeter 1 on R phase */}
                      <circle cx="160" cy="50" r="18" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                      <text x="160" y="54" textAnchor="middle" fill="#F59E0B" fontSize="10" fontFamily="monospace">W1</text>
                      <line x1="160" y1="68" x2="160" y2="110" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,3" />

                      {/* Wattmeter 2 on B phase */}
                      <circle cx="320" cy="170" r="18" fill="#1E293B" stroke="#F59E0B" strokeWidth="2" />
                      <text x="320" y="174" textAnchor="middle" fill="#F59E0B" fontSize="10" fontFamily="monospace">W2</text>
                      <line x1="320" y1="152" x2="320" y2="110" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="3,3" />

                      <text x="50" y="42" fill="#EF4444" fontSize="11" fontFamily="monospace">Line R</text>
                      <text x="50" y="102" fill="#EAB308" fontSize="11" fontFamily="monospace">Line Y</text>
                      <text x="50" y="162" fill="#3B82F6" fontSize="11" fontFamily="monospace">Line B</text>
                    </svg>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Wattmeter W1</span>
                      <span className="text-base font-mono font-black text-amber-600">{twoWattResult.wattmeter1Watts.toFixed(0)} W</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Wattmeter W2</span>
                      <span className="text-base font-mono font-black text-zinc-900">{twoWattResult.wattmeter2Watts.toFixed(0)} W</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Power P</span>
                      <span className="text-base font-mono font-black text-blue-600">{twoWattResult.totalActivePowerKw.toFixed(2)} kW</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Power Factor</span>
                      <span className="text-base font-mono font-black text-emerald-600">{twoWattResult.calculatedPowerFactor.toFixed(3)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-amber-600" />
                    <span>3-Phase Load Controls</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Line Voltage VL:</span>
                        <span className="font-bold text-zinc-900">{twoWattParams.lineVoltageV} V</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="440"
                        step="10"
                        value={twoWattParams.lineVoltageV}
                        onChange={(e) => setTwoWattParams({ ...twoWattParams, lineVoltageV: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Load Resistance R:</span>
                        <span className="font-bold text-zinc-900">{twoWattParams.phaseResistanceOhms} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        step="5"
                        value={twoWattParams.phaseResistanceOhms}
                        onChange={(e) => setTwoWattParams({ ...twoWattParams, phaseResistanceOhms: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Load Reactance XL:</span>
                        <span className="font-bold text-zinc-900">{twoWattParams.phaseReactanceOhms} Ω</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="5"
                        value={twoWattParams.phaseReactanceOhms}
                        onChange={(e) => setTwoWattParams({ ...twoWattParams, phaseReactanceOhms: parseFloat(e.target.value) })}
                        className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">3-Phase Formulas</span>
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

          {/* TAB 6: ALTERNATOR VOLTAGE REGULATION */}
          {activeExpId === 'alternator-regulation' && (
            <motion.div
              key="alternator-regulation"
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
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-200">
                      Regulation: {altResult.voltageRegulationPct.toFixed(2)}% ({altParams.powerFactorType})
                    </span>
                  </div>

                  {/* OCC & SCC Graphs */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#334155" strokeWidth="1.5" />

                      {/* OCC Curve (Blue) */}
                      {(() => {
                        const pts = altResult.occPoints;
                        const toX = (ifield: number) => 40 + (ifield / 3.0) * 440;
                        const toY = (v: number) => 170 - (v / 500) * 150;
                        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.fieldCurrentA).toFixed(1)} ${toY(p.openCircuitVoltageV).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#38BDF8" strokeWidth="2.5" />;
                      })()}

                      {/* SCC Line (Amber) */}
                      {(() => {
                        const pts = altResult.sccPoints;
                        const toX = (ifield: number) => 40 + (ifield / 3.0) * 440;
                        const toY = (isc: number) => 170 - (isc / 25) * 150;
                        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.fieldCurrentA).toFixed(1)} ${toY(p.shortCircuitCurrentA).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,2" />;
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span className="text-sky-400">― Open-Circuit Curve (OCC)</span>
                      <span className="text-amber-400">--- Short-Circuit Line (SCC)</span>
                      <span>Field Current If (A)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">No-Load EMF E0</span>
                      <span className="text-base font-mono font-black text-sky-600">{altResult.noLoadEmfV.toFixed(1)} V</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Sync Reactance Xs</span>
                      <span className="text-base font-mono font-black text-zinc-900">{altResult.synchronousReactanceOhms.toFixed(2)} Ω</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Sync Impedance Zs</span>
                      <span className="text-base font-mono font-black text-blue-600">{altResult.synchronousImpedanceOhms.toFixed(2)} Ω</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">% Regulation</span>
                      <span className="text-base font-mono font-black text-emerald-600">{altResult.voltageRegulationPct.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-sky-600" />
                    <span>Alternator Loading</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Power Factor (cos φ):</span>
                        <span className="font-bold text-zinc-900">{altParams.powerFactor}</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="1.0"
                        step="0.05"
                        value={altParams.powerFactor}
                        onChange={(e) => setAltParams({ ...altParams, powerFactor: parseFloat(e.target.value) })}
                        className="w-full accent-sky-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <span className="text-xs font-mono text-zinc-600 block mb-1.5">Power Factor Type:</span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(['lagging', 'unity', 'leading'] as PowerFactorType[]).map((pf) => (
                          <button
                            key={pf}
                            onClick={() => setAltParams({ ...altParams, powerFactorType: pf })}
                            className={`px-2 py-1.5 rounded-lg text-xs font-mono font-semibold border text-center ${
                              altParams.powerFactorType === pf
                                ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold'
                                : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                            }`}
                          >
                            {pf.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-sky-800 uppercase block">EMF Method Formula</span>
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

export default function ElectricalWorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Electrical Laboratory...</div>}>
      <ElectricalWorkbenchContent />
    </Suspense>
  );
}
