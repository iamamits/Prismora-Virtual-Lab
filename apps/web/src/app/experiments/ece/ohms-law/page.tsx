/**
 * Prismora ECE Virtual Lab — Ohm's Law & DC Electrical Circuits Laboratory
 *
 * A genuinely interactive hands-on virtual laboratory featuring:
 * - Variable DC Benchtop Power Supply (0 - 30V)
 * - Articulated mechanical SPST knife switch
 * - Component swap: Pure linear Resistor vs Incandescent Light Bulb (with physics-driven filament glow and lumen output)
 * - Series and parallel network modes
 * - Real-time V-I scatter plot comparing linear ohmic vs non-linear filament characteristics
 * - Virtual Digital Multimeter with interactive probes
 * - Step-by-step IIT Roorkee experimental procedure, theory derivations, troubleshooting, and quiz
 * - Strict Light Theme styling
 */

'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  evaluateDCCircuit,
  DCCircuitGraph,
} from '@prismora/simulation-core';
import { DCPowerSupply } from '@/components/ece/physical-components/dc-power-supply';
import { PhysicalLightBulb } from '@/components/ece/physical-components/light-bulb';
import { PhysicalResistor } from '@/components/ece/physical-components/physical-resistor';
import { PhysicalKnifeSwitch } from '@/components/ece/physical-components/knife-switch';
import { DigitalMultimeter } from '@/components/ece/instruments/digital-multimeter';
import { BugReportModal } from '@prismora/ui';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Lightbulb,
  ListOrdered,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';

type CircuitMode = 'single-resistor' | 'incandescent-bulb' | 'series-pair' | 'parallel-pair';

interface VIPoint {
  voltage: number;
  current: number;
}

export default function OhmsLawLabPage() {
  const [mode, setMode] = useState<CircuitMode>('incandescent-bulb');
  const [supplyVoltage, setSupplyVoltage] = useState(12.0);
  const [isPowerSupplyOn, setIsPowerSupplyOn] = useState(true);
  const [isSwitchOpen, setIsSwitchOpen] = useState(false);
  const [resistorValue, setResistorValue] = useState(24.0); // 24 ohms
  const [viHistory, setViHistory] = useState<VIPoint[]>([
    { voltage: 0, current: 0 },
  ]);

  // Multimeter probe state
  const [probeA, setProbeA] = useState('n2');
  const [probeB, setProbeB] = useState('gnd');

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

  // Build DC Circuit Graph based on mode
  const circuitGraph: DCCircuitGraph = useMemo(() => {
    const vValue = isPowerSupplyOn ? supplyVoltage : 0;
    const swState = isSwitchOpen ? 'OPEN' : 'CLOSED';

    if (mode === 'incandescent-bulb') {
      return {
        groundNodeId: 'gnd',
        components: [
          {
            id: 'ps1',
            name: 'DC Bench Supply',
            type: 'dc-voltage-source',
            nodeA: 'n1',
            nodeB: 'gnd',
            value: vValue,
          },
          {
            id: 'sw1',
            name: 'Knife Switch',
            type: 'toggle-switch',
            nodeA: 'n1',
            nodeB: 'n2',
            value: 0,
            state: swState,
          },
          {
            id: 'b1',
            name: 'Incandescent Lamp',
            type: 'light-bulb',
            nodeA: 'n2',
            nodeB: 'gnd',
            value: resistorValue,
            ratedPower: 6.0,
            ratedVoltage: 12.0,
          },
        ],
      };
    }

    if (mode === 'single-resistor') {
      return {
        groundNodeId: 'gnd',
        components: [
          {
            id: 'ps1',
            name: 'DC Bench Supply',
            type: 'dc-voltage-source',
            nodeA: 'n1',
            nodeB: 'gnd',
            value: vValue,
          },
          {
            id: 'sw1',
            name: 'Knife Switch',
            type: 'toggle-switch',
            nodeA: 'n1',
            nodeB: 'n2',
            value: 0,
            state: swState,
          },
          {
            id: 'r1',
            name: 'Load Resistor',
            type: 'resistor',
            nodeA: 'n2',
            nodeB: 'gnd',
            value: resistorValue,
          },
        ],
      };
    }

    if (mode === 'series-pair') {
      return {
        groundNodeId: 'gnd',
        components: [
          {
            id: 'ps1',
            name: 'DC Bench Supply',
            type: 'dc-voltage-source',
            nodeA: 'n1',
            nodeB: 'gnd',
            value: vValue,
          },
          {
            id: 'sw1',
            name: 'Knife Switch',
            type: 'toggle-switch',
            nodeA: 'n1',
            nodeB: 'n2',
            value: 0,
            state: swState,
          },
          {
            id: 'r1',
            name: 'Resistor R1',
            type: 'resistor',
            nodeA: 'n2',
            nodeB: 'n3',
            value: resistorValue / 2,
          },
          {
            id: 'r2',
            name: 'Resistor R2',
            type: 'resistor',
            nodeA: 'n3',
            nodeB: 'gnd',
            value: resistorValue / 2,
          },
        ],
      };
    }

    // Parallel Pair
    return {
      groundNodeId: 'gnd',
      components: [
        {
          id: 'ps1',
          name: 'DC Bench Supply',
          type: 'dc-voltage-source',
          nodeA: 'n1',
          nodeB: 'gnd',
          value: vValue,
        },
        {
          id: 'sw1',
          name: 'Knife Switch',
          type: 'toggle-switch',
          nodeA: 'n1',
          nodeB: 'n2',
          value: 0,
          state: swState,
        },
        {
          id: 'r1',
          name: 'Branch R1',
          type: 'resistor',
          nodeA: 'n2',
          nodeB: 'gnd',
          value: resistorValue * 2,
        },
        {
          id: 'r2',
          name: 'Branch R2',
          type: 'resistor',
          nodeA: 'n2',
          nodeB: 'gnd',
          value: resistorValue * 2,
        },
      ],
    };
  }, [mode, supplyVoltage, isPowerSupplyOn, isSwitchOpen, resistorValue]);

  // Evaluate circuit deterministically
  const evalResult = useMemo(() => {
    return evaluateDCCircuit(circuitGraph);
  }, [circuitGraph]);

  // Extract component states
  const mainEval = evalResult.componentEvaluations[mode === 'incandescent-bulb' ? 'b1' : 'r1'];
  const currentAmps = mainEval?.current ?? 0;
  const voltageDrop = mainEval?.voltageDrop ?? 0;
  const powerWatts = mainEval?.power ?? 0;

  // Record point to V-I curve if power on and switch closed
  React.useEffect(() => {
    if (isPowerSupplyOn && !isSwitchOpen) {
      setViHistory((prev) => {
        const last = prev[prev.length - 1];
        if (!last || Math.abs(last.voltage - voltageDrop) > 0.4 || Math.abs(last.current - currentAmps) > 0.02) {
          const updated = [...prev, { voltage: Number(voltageDrop.toFixed(2)), current: Number(currentAmps.toFixed(3)) }];
          // Keep last 40 points, sorted by voltage
          return updated.slice(-40).sort((a, b) => a.voltage - b.voltage);
        }
        return prev;
      });
    }
  }, [voltageDrop, currentAmps, isPowerSupplyOn, isSwitchOpen]);

  // Multimeter calculation
  const vA = evalResult.nodeVoltages[probeA] ?? 0;
  const vB = evalResult.nodeVoltages[probeB] ?? 0;
  const dmmVoltage = vA - vB;
  const dmmCurrent = currentAmps;
  const dmmResistance = Math.abs(dmmCurrent) > 1e-4 ? Math.abs(dmmVoltage / dmmCurrent) : resistorValue;

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
            <span className="text-zinc-900 font-bold">Ohm&apos;s Law</span>
          </nav>

          <div className="w-[1px] h-4 bg-zinc-300 mx-1 hidden sm:block" />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            {(
              [
                { id: 'incandescent-bulb', label: 'Bulb & Filament' },
                { id: 'single-resistor', label: 'Linear Resistor' },
                { id: 'series-pair', label: 'Series Divider' },
                { id: 'parallel-pair', label: 'Parallel Divider' },
              ] as const
            ).map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id);
                  setViHistory([{ voltage: 0, current: 0 }]);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                  mode === m.id
                    ? 'bg-[#2563EB] text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViHistory([{ voltage: 0, current: 0 }])}
            className="px-2 py-1 rounded-md text-xs font-bold border border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-50 flex items-center gap-1.5"
            title="Clear V-I Plot Points"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Clear Plot</span>
          </button>

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
            simulationId="ohms-law"
            moduleName="Ohm's Law & DC Circuits"
            triggerText="Report Bug"
            diagnosticSnapshot={{
              mode,
              supplyVoltage,
              isPowerSupplyOn,
              isSwitchOpen,
              resistorValue,
              voltageDrop,
              currentAmps,
              powerWatts,
            }}
          />
        </div>
      </header>

      {/* Main Laboratory Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left Side: Interactive Circuit Workbench (Physical Components) */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-4">
          {/* Circuit Visual Stage */}
          <div className="bg-white border-2 border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-around gap-6 relative">
            {/* Live Circuit Wire Connectors */}
            <div className="absolute inset-x-12 top-1/2 -translate-y-1/2 h-1 bg-zinc-300 -z-0 pointer-events-none hidden sm:block" />

            {/* Component 1: DC Power Supply */}
            <div className="z-10">
              <DCPowerSupply
                voltage={supplyVoltage}
                measuredCurrent={currentAmps}
                isOn={isPowerSupplyOn}
                onVoltageChange={setSupplyVoltage}
                onTogglePower={() => setIsPowerSupplyOn((v) => !v)}
              />
            </div>

            {/* Component 2: Knife Switch */}
            <div className="z-10">
              <PhysicalKnifeSwitch
                isOpen={isSwitchOpen}
                onToggle={() => setIsSwitchOpen((v) => !v)}
                label="Main Switch"
              />
            </div>

            {/* Component 3: Load (Bulb or Resistor) */}
            <div className="z-10">
              {mode === 'incandescent-bulb' ? (
                <PhysicalLightBulb
                  brightness={mainEval?.filamentBrightness ?? 0}
                  filamentColor={mainEval?.filamentColor ?? '#334155'}
                  lumens={mainEval?.lumens ?? 0}
                  powerWatts={powerWatts}
                  label="Tungsten Bulb"
                />
              ) : (
                <PhysicalResistor
                  resistanceOhms={resistorValue}
                  voltageDrop={voltageDrop}
                  currentAmps={currentAmps}
                  powerWatts={powerWatts}
                  label={mode === 'series-pair' ? 'R1 + R2 Series' : mode === 'parallel-pair' ? 'R1 || R2 Parallel' : 'Ceramic Resistor'}
                />
              )}
            </div>
          </div>

          {/* Lower Stage: V-I Curve Graph & Virtual Multimeter */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* V-I Characteristic Plotter */}
            <div className="bg-white border border-zinc-200 rounded-xl p-4 shadow-xs flex flex-col">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-[#2563EB]" />
                  <span className="text-xs font-bold text-zinc-900 uppercase tracking-wide">
                    Experimental V-I Characteristic Curve
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500">
                  {viHistory.length} Samples Plotted
                </span>
              </div>

              {/* SVG Coordinate Grid Graph */}
              <div className="relative w-full h-48 bg-zinc-50 border border-zinc-200 rounded-lg p-2">
                <svg viewBox="0 0 400 180" className="w-full h-full overflow-visible">
                  {/* Grid Lines */}
                  <g stroke="#E2E8F0" strokeWidth="1">
                    {[0, 45, 90, 135, 180].map((y) => (
                      <line key={`gy-${y}`} x1="35" y1={y} x2="390" y2={y} />
                    ))}
                    {[35, 120, 210, 300, 390].map((x) => (
                      <line key={`gx-${x}`} x1={x} y1="0" x2={x} y2="160" />
                    ))}
                  </g>

                  {/* Axes */}
                  <line x1="35" y1="160" x2="390" y2="160" stroke="#475569" strokeWidth="2" />
                  <line x1="35" y1="0" x2="35" y2="160" stroke="#475569" strokeWidth="2" />

                  {/* Axis Labels */}
                  <text x="385" y="175" fill="#475569" fontSize="10" fontWeight="bold" textAnchor="end">
                    Voltage (V) →
                  </text>
                  <text x="10" y="15" fill="#475569" fontSize="10" fontWeight="bold" transform="rotate(-90 15,15)">
                    Current (A) →
                  </text>

                  {/* Plotted Points & Polyline */}
                  {viHistory.length > 1 && (
                    <polyline
                      points={viHistory
                        .map((p) => {
                          const x = 35 + (p.voltage / 30) * (390 - 35);
                          const y = 160 - (p.current / 2.0) * 160;
                          return `${x.toFixed(1)},${Math.max(0, y).toFixed(1)}`;
                        })
                        .join(' ')}
                      fill="none"
                      stroke={mode === 'incandescent-bulb' ? '#F59E0B' : '#2563EB'}
                      strokeWidth="2.5"
                    />
                  )}

                  {/* Data Point Circles */}
                  {viHistory.map((p, idx) => {
                    const x = 35 + (p.voltage / 30) * (390 - 35);
                    const y = 160 - (p.current / 2.0) * 160;
                    return (
                      <circle
                        key={idx}
                        cx={x}
                        cy={Math.max(0, y)}
                        r="3.5"
                        fill={mode === 'incandescent-bulb' ? '#F59E0B' : '#2563EB'}
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                    );
                  })}
                </svg>
              </div>

              {/* Caption */}
              <div className="mt-2 text-[11px] text-zinc-600 flex items-center justify-between">
                <span>
                  Slope: <strong className="font-mono text-zinc-900">I / V = 1 / R</strong>
                </span>
                <span className="text-[10px] text-zinc-500">
                  {mode === 'incandescent-bulb'
                    ? 'Non-linear: Filament resistance increases with temperature'
                    : 'Linear: Ideal constant ohmic resistance'}
                </span>
              </div>
            </div>

            {/* Virtual Digital Multimeter */}
            <div className="flex items-center justify-center">
              <DigitalMultimeter
                measuredVoltage={dmmVoltage}
                measuredCurrent={dmmCurrent}
                measuredResistance={dmmResistance}
                probeNodeA={probeA}
                probeNodeB={probeB}
                onSelectProbeNodeA={setProbeA}
                onSelectProbeNodeB={setProbeB}
                availableNodes={['n1', 'n2', 'gnd']}
              />
            </div>
          </div>
        </div>

        {/* Right Side: Educational Theory, Procedure & Quiz Drawer */}
        {showDrawer && (
          <div className="absolute inset-y-0 right-0 z-30 lg:relative lg:inset-auto lg:z-auto h-full w-80 sm:w-96 border-l border-zinc-200 bg-white flex flex-col shrink-0 shadow-2xl lg:shadow-none">
            {/* Drawer Tabs Header */}
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
                        ? 'bg-[#2563EB] text-white shadow-xs'
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Drawer Body Content */}
            <div className="flex-1 overflow-y-auto p-4 text-xs leading-relaxed space-y-4">
              {activeTab === 'theory' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900">
                    Ohm&apos;s Law & Electrical Energy
                  </h3>
                  <p className="text-zinc-600">
                    Ohm&apos;s Law states that the current flowing through a conductor between two
                    points is directly proportional to the voltage across the two points, provided
                    temperature remains constant.
                  </p>

                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-1.5">
                    <span className="text-[11px] font-bold text-[#2563EB] uppercase tracking-wide block">
                      Fundamental Mathematical Formulations
                    </span>
                    <div className="font-mono text-xs space-y-1 text-zinc-900">
                      <div>
                        <strong>Voltage:</strong> V = I · R
                      </div>
                      <div>
                        <strong>Current:</strong> I = V / R
                      </div>
                      <div>
                        <strong>Electrical Power:</strong> P = V · I = I²R = V² / R
                      </div>
                    </div>
                  </div>

                  <h4 className="font-bold text-zinc-900">Ohmic vs Non-Ohmic Conductors:</h4>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-600">
                    <li>
                      <strong>Standard Resistor:</strong> Strictly linear V-I line passing through the
                      origin with constant slope 1/R.
                    </li>
                    <li>
                      <strong>Incandescent Lamp:</strong> Non-linear. As filament current increases,
                      Joule heating raises the tungsten temperature to over 2500°C, increasing its
                      lattice scattering resistance and flattening the current slope.
                    </li>
                  </ul>
                </div>
              )}

              {activeTab === 'procedure' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900">
                    IIT Roorkee Virtual Lab Procedure
                  </h3>
                  <ol className="list-decimal pl-4 space-y-2 text-zinc-700">
                    <li>
                      Ensure the <strong>DC Power Supply</strong> is toggled <strong>ON</strong> and
                      the <strong>Main Knife Switch</strong> is <strong>CLOSED</strong>.
                    </li>
                    <li>
                      Start with the voltage dial set to <strong>0.0V</strong> and note that the
                      circuit current is 0.0A.
                    </li>
                    <li>
                      Increase voltage in increments of <strong>2.0V</strong> up to <strong>24.0V</strong>.
                    </li>
                    <li>
                      Observe the physical incandescent lamp filament transition from dark charcoal
                      → warm amber glow → brilliant yellow-white.
                    </li>
                    <li>
                      Observe the V-I plot updating automatically with each voltage increment.
                    </li>
                    <li>
                      Switch probe leads on the <strong>Digital Multimeter</strong> to verify node
                      voltages across components.
                    </li>
                  </ol>
                </div>
              )}

              {activeTab === 'pitfalls' && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-zinc-900">Common Experimental Pitfalls</h3>
                  <div className="space-y-2">
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-bold text-red-700">Ammeter in Parallel (Short Circuit)</div>
                      <div className="text-zinc-600 text-[11px] mt-0.5">
                        Never place an ammeter in parallel with a voltage source. An ideal ammeter has
                        zero internal resistance and will cause a dangerous short circuit.
                      </div>
                    </div>

                    <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="font-bold text-amber-800">Voltmeter in Series (Open Circuit)</div>
                      <div className="text-zinc-600 text-[11px] mt-0.5">
                        Placing a voltmeter in series blocks current flow because practical voltmeters have
                        input impedance of 10MΩ or higher.
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
                      1. If voltage across a 10Ω resistor is 20V, what is the power dissipated?
                    </div>
                    {['20 W', '40 W', '200 W', '2 W'].map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => setQuizAnswers((p) => ({ ...p, 0: idx }))}
                        className={`w-full text-left p-2 rounded border text-xs font-medium transition-colors ${
                          quizAnswers[0] === idx
                            ? 'bg-blue-50 border-blue-500 text-blue-900'
                            : 'bg-white border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setQuizSubmitted(true)}
                    className="w-full py-1.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-md shadow-xs text-xs mt-2"
                  >
                    Submit Answers
                  </button>

                  {quizSubmitted && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Correct! P = V² / R = 400 / 10 = 40 W.</span>
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
