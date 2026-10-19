/**
 * Prismora ECE Circuit Studio & Virtual Arduino Uno R3 Workstation
 * Inspired by PhET Circuit Construction Kit DC/AC and Autodesk TinkerCAD Circuits.
 *
 * Capabilities:
 * - 3 View Modes: Lifelike Components, Schematic Symbols, and 2D PCB Layout
 * - Virtual Arduino Uno R3 ATmega328P with C++ Code Editor, live interpreter, and Serial Monitor
 * - Comprehensive AC/DC components: sources, resistors with dynamic color bands, capacitors, inductors,
 *   diodes, LEDs with forward drops & burnout detection, incandescent bulbs, DC motors with RPM,
 *   SG90 servos, 7-segment displays, switches, pushbuttons, transistors, op-amps, 555 timers
 * - Measuring Lab: Bench Digital Multimeter (V/mA/Ω) and animated Dual-Channel Oscilloscope
 * - Interactive 4-Band Resistor Color Code Calculator & Live Decoder
 * - Guided Projects: Blink, Push Button LED, Potentiometer PWM, Traffic Light, Servo Sweep, DC Motor
 */

'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  SandboxComponentType,
  ComponentViewMode,
  CircuitComponentState,
  WireConnection,
  ArduinoInterpreter,
  ARDUINO_PROJECT_PRESETS,
  RESISTOR_COLOR_CODES,
  decodeResistorValue,
  solveCircuitBranch,
} from '@prismora/simulation-core';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, MathView, Slider } from '@prismora/ui';
import { SimulationGuideModal } from '@/components/simulation/simulation-guide-modal';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Download,
  Eye,
  Layers,
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCcw,
  Sliders,
  Sparkles,
  StepForward,
  Terminal,
  Volume2,
  Zap,
} from 'lucide-react';

// Preset circuits available for 1-click loading
interface StudioPreset {
  id: string;
  name: string;
  category: 'arduino' | 'analog' | 'dc' | 'ac';
  description: string;
  components: CircuitComponentState[];
  wires: WireConnection[];
  arduinoCode?: string;
}

const STUDIO_PRESETS: StudioPreset[] = [
  {
    id: 'arduino-blink',
    name: 'Arduino Uno: Onboard LED Blink',
    category: 'arduino',
    description: 'Classic ATmega328P microcontroller introductory project toggling digital Pin 13.',
    arduinoCode: ARDUINO_PROJECT_PRESETS['Blink Built-in LED']?.code ?? '',
    components: [
      { id: 'ard-1', type: 'ARDUINO_UNO', name: 'Arduino Uno R3', value: 5, unit: 'V', x: 80, y: 80, rotation: 0 },
    ],
    wires: [],
  },
  {
    id: 'arduino-traffic',
    name: 'Arduino: Traffic Light 3-Phase FSM',
    category: 'arduino',
    description: 'Autonomous 3-state municipal signal controlling Red (Pin 10), Yellow (Pin 9), and Green (Pin 8).',
    arduinoCode: ARDUINO_PROJECT_PRESETS['Traffic Light Controller']?.code ?? '',
    components: [
      { id: 'ard-1', type: 'ARDUINO_UNO', name: 'Arduino Uno R3', value: 5, unit: 'V', x: 60, y: 70, rotation: 0 },
      { id: 'led-red', type: 'LED', name: 'Red Stop', value: 2.0, unit: 'V', x: 440, y: 60, rotation: 0, state: { color: '#EF4444' } },
      { id: 'led-yel', type: 'LED', name: 'Yellow Caution', value: 2.1, unit: 'V', x: 440, y: 140, rotation: 0, state: { color: '#FBBF24' } },
      { id: 'led-grn', type: 'LED', name: 'Green Go', value: 3.0, unit: 'V', x: 440, y: 220, rotation: 0, state: { color: '#22C55E' } },
    ],
    wires: [
      { id: 'w1', fromComponentId: 'ard-1', fromPin: 'D10', toComponentId: 'led-red', toPin: '+', color: '#EF4444' },
      { id: 'w2', fromComponentId: 'ard-1', fromPin: 'D9', toComponentId: 'led-yel', toPin: '+', color: '#FBBF24' },
      { id: 'w3', fromComponentId: 'ard-1', fromPin: 'D8', toComponentId: 'led-grn', toPin: '+', color: '#22C55E' },
    ],
  },
  {
    id: 'arduino-servo',
    name: 'Arduino: Servo Motor Angular Sweep',
    category: 'arduino',
    description: 'Generates 50Hz PWM duty cycle to sweep micro servo from 0° to 180° in smooth increments.',
    arduinoCode: ARDUINO_PROJECT_PRESETS['Servo Motor Sweep']?.code ?? '',
    components: [
      { id: 'ard-1', type: 'ARDUINO_UNO', name: 'Arduino Uno R3', value: 5, unit: 'V', x: 60, y: 80, rotation: 0 },
      { id: 'servo-1', type: 'SERVO_MOTOR', name: 'SG90 Micro Servo', value: 180, unit: '°', x: 440, y: 130, rotation: 0, state: { angle: 45 } },
    ],
    wires: [
      { id: 'w-pwm', fromComponentId: 'ard-1', fromPin: 'D9~', toComponentId: 'servo-1', toPin: 'SIG', color: '#F97316' },
      { id: 'w-5v', fromComponentId: 'ard-1', fromPin: '5V', toComponentId: 'servo-1', toPin: 'VCC', color: '#EF4444' },
      { id: 'w-gnd', fromComponentId: 'ard-1', fromPin: 'GND', toComponentId: 'servo-1', toPin: 'GND', color: '#1E293B' },
    ],
  },
  {
    id: 'dc-lamp-circuit',
    name: 'PhET DC: Lamp & Switch Circuit with DMM',
    category: 'dc',
    description: 'Direct Current series circuit with 9V battery, SPST toggle switch, resistor, and glowing tungsten bulb.',
    components: [
      { id: 'bat-1', type: 'DC_BATTERY', name: '9V Alkaline Battery', value: 9.0, unit: 'V', x: 80, y: 100, rotation: 0 },
      { id: 'sw-1', type: 'SPST_SWITCH', name: 'Main Power Switch', value: 1, unit: 'state', x: 250, y: 60, rotation: 0, state: { closed: true } },
      { id: 'res-1', type: 'RESISTOR', name: 'Series Resistor', value: 150, unit: 'Ω', x: 420, y: 60, rotation: 0 },
      { id: 'lamp-1', type: 'LIGHT_BULB', name: 'Tungsten Lamp', value: 100, unit: 'Ω', x: 420, y: 200, rotation: 0, state: { illuminated: true, brightness: 85 } },
    ],
    wires: [
      { id: 'w-bat-sw', fromComponentId: 'bat-1', fromPin: '+', toComponentId: 'sw-1', toPin: 'IN', color: '#EF4444' },
      { id: 'w-sw-res', fromComponentId: 'sw-1', fromPin: 'OUT', toComponentId: 'res-1', toPin: 'IN', color: '#EF4444' },
      { id: 'w-res-lamp', fromComponentId: 'res-1', fromPin: 'OUT', toComponentId: 'lamp-1', toPin: 'IN', color: '#38BDF8' },
      { id: 'w-lamp-bat', fromComponentId: 'lamp-1', fromPin: 'OUT', toComponentId: 'bat-1', toPin: '-', color: '#1E293B' },
    ],
  },
  {
    id: 'dc-motor-rpm',
    name: 'DC Motor & Variable Potentiometer Drive',
    category: 'dc',
    description: 'Rotary potentiometer controlling armature current and spinning DC rotor speed up to 3000 RPM.',
    components: [
      { id: 'bat-1', type: 'DC_BATTERY', name: '12V DC Source', value: 12.0, unit: 'V', x: 80, y: 110, rotation: 0 },
      { id: 'pot-1', type: 'POTENTIOMETER', name: 'Speed Rheostat', value: 200, unit: 'Ω', x: 260, y: 80, rotation: 0 },
      { id: 'motor-1', type: 'DC_MOTOR', name: 'High-Torque DC Motor', value: 50, unit: 'Ω', x: 440, y: 140, rotation: 0, state: { rpm: 1800 } },
    ],
    wires: [
      { id: 'w-pot', fromComponentId: 'bat-1', fromPin: '+', toComponentId: 'pot-1', toPin: 'IN', color: '#EF4444' },
      { id: 'w-mot', fromComponentId: 'pot-1', fromPin: 'WIPER', toComponentId: 'motor-1', toPin: '+', color: '#38BDF8' },
      { id: 'w-ret', fromComponentId: 'motor-1', fromPin: '-', toComponentId: 'bat-1', toPin: '-', color: '#1E293B' },
    ],
  },
  {
    id: 'ac-rlc-scope',
    name: 'AC Sine Generator & RLC Filter with Oscilloscope',
    category: 'ac',
    description: '50Hz-1kHz sinusoidal wave generator driving resistor and capacitor with live dual-channel waveform trace.',
    components: [
      { id: 'ac-1', type: 'AC_SOURCE', name: 'Sinusoidal AC Generator', value: 10.0, unit: 'V', x: 80, y: 110, rotation: 0 },
      { id: 'res-ac', type: 'RESISTOR', name: 'Filter Resistor', value: 1000, unit: 'Ω', x: 270, y: 70, rotation: 0 },
      { id: 'cap-1', type: 'CAPACITOR', name: 'Ceramic Capacitor', value: 10, unit: 'uF', x: 440, y: 140, rotation: 0 },
    ],
    wires: [
      { id: 'w-ac-res', fromComponentId: 'ac-1', fromPin: 'AC~', toComponentId: 'res-ac', toPin: 'IN', color: '#A855F7' },
      { id: 'w-res-cap', fromComponentId: 'res-ac', fromPin: 'OUT', toComponentId: 'cap-1', toPin: '+', color: '#38BDF8' },
      { id: 'w-cap-ac', fromComponentId: 'cap-1', fromPin: '-', toComponentId: 'ac-1', toPin: 'GND', color: '#1E293B' },
    ],
  },
];

export default function CircuitStudioPage() {
  // View mode: Lifelike (TinkerCAD/PhET), Schematic symbols, 2D PCB layout
  const [viewMode, setViewMode] = useState<ComponentViewMode>('lifelike');

  // Active Tab: Arduino IDE, Multimeter & Scope, Resistor Color Decoder, Component Catalog
  const [activeTab, setActiveTab] = useState<'arduino' | 'instruments' | 'resistor' | 'catalog'>('arduino');

  // Selected Preset
  const [selectedPresetId, setSelectedPresetId] = useState<string>('arduino-blink');

  // Circuit state
  const [components, setComponents] = useState<CircuitComponentState[]>(STUDIO_PRESETS[0]!.components);
  const [wires, setWires] = useState<WireConnection[]>(STUDIO_PRESETS[0]!.wires);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>('ard-1');

  // Circuit Solver Parameters & Live Output
  const [sourceVoltage, setSourceVoltage] = useState<number>(9.0);
  const [switchClosed, setSwitchClosed] = useState<boolean>(true);
  const [potResistance, setPotResistance] = useState<number>(220);
  const [ledBurnWarning, setLedBurnWarning] = useState<boolean>(false);
  const [circuitCalculations, setCircuitCalculations] = useState<{
    currentMa: number;
    powerMw: number;
    motorRpm: number;
    illuminated: boolean;
    ledBurnt: boolean;
  }>({ currentMa: 21.2, powerMw: 190.8, motorRpm: 0, illuminated: true, ledBurnt: false });

  // Virtual Arduino Uno State
  const [arduinoCode, setArduinoCode] = useState<string>(
    ARDUINO_PROJECT_PRESETS['Blink Built-in LED']?.code ?? '',
  );
  const [isArduinoRunning, setIsArduinoRunning] = useState<boolean>(true);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [serialBaud, setSerialBaud] = useState<number>(9600);
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[0ms] Prismora Virtual Arduino Uno R3 Ready.',
    '[50ms] Serial Monitor initialized at 9600 baud.',
    '[100ms] LED Pin 13 ON',
  ]);
  const [arduinoPins, setArduinoPins] = useState<{
    pins: Record<number, { mode: 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'; digitalValue: boolean; pwmValue: number }>;
    analogPins: Record<number, number>;
    builtInLed: boolean;
    millis: number;
  }>({
    pins: {
      13: { mode: 'OUTPUT', digitalValue: true, pwmValue: 255 },
      9: { mode: 'OUTPUT', digitalValue: false, pwmValue: 128 },
      8: { mode: 'OUTPUT', digitalValue: false, pwmValue: 0 },
      10: { mode: 'OUTPUT', digitalValue: false, pwmValue: 0 },
      2: { mode: 'INPUT_PULLUP', digitalValue: true, pwmValue: 0 },
    },
    analogPins: { 0: 512, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    builtInLed: true,
    millis: 100,
  });

  // Multimeter & Oscilloscope State
  const [dmmMode, setDmmMode] = useState<'V_DC' | 'V_AC' | 'I_MA' | 'OHM'>('V_DC');
  const [scopeTimeDiv, setScopeTimeDiv] = useState<number>(10); // ms/div
  const [scopeVoltsDiv, setScopeVoltsDiv] = useState<number>(2); // V/div
  const [scopeFreqHz, setScopeFreqHz] = useState<number>(50);
  const [showCurrentParticles, setShowCurrentParticles] = useState<boolean>(true);

  // Resistor Color Code Decoder state (4 Bands)
  const [band1, setBand1] = useState<number>(2); // Red (2)
  const [band2, setBand2] = useState<number>(2); // Red (2)
  const [band3, setBand3] = useState<number>(1); // Brown (10^1 = 10)
  const [band4Tolerance, setBand4Tolerance] = useState<string>('±5%'); // Gold

  // Canvas zoom/pan
  const [canvasZoom, setCanvasZoom] = useState<number>(1.0);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const scopeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Decoded resistor value
  const decodedResistorOhms = useMemo(() => {
    return decodeResistorValue(band1, band2, band3);
  }, [band1, band2, band3]);

  // Load Preset
  const handleSelectPreset = useCallback((presetId: string) => {
    setSelectedPresetId(presetId);
    const p = STUDIO_PRESETS.find((x) => x.id === presetId);
    if (!p) return;
    setComponents(p.components);
    setWires(p.wires);
    setSelectedComponentId(p.components[0]?.id ?? null);
    if (p.arduinoCode) {
      setArduinoCode(p.arduinoCode);
      setSerialLogs([
        `[0ms] Project '${p.name}' loaded into Virtual Arduino ATmega328P.`,
        `[50ms] Serial Monitor listening at ${serialBaud} baud.`,
      ]);
      setActiveTab('arduino');
    }
  }, [serialBaud]);

  // Run DC Solver whenever voltage or resistance changes
  useEffect(() => {
    const rTotal = potResistance + 100; // resistor + lamp/internal
    const solved = solveCircuitBranch(switchClosed ? sourceVoltage : 0, [
      { resistance: switchClosed ? potResistance : 1000000 },
      { resistance: 50, isLed: true, ledVf: 2.0 },
      { resistance: 20, isMotor: true },
    ]);

    setCircuitCalculations({
      currentMa: solved.totalCurrentMa,
      powerMw: solved.powerMw,
      motorRpm: switchClosed ? solved.motorRpm : 0,
      illuminated: switchClosed && solved.ledIlluminated,
      ledBurnt: solved.ledBurnt,
    });

    setLedBurnWarning(solved.ledBurnt);
  }, [sourceVoltage, potResistance, switchClosed]);

  // Arduino execution interval
  const interpreterRef = useRef<ArduinoInterpreter>(new ArduinoInterpreter(arduinoCode));

  useEffect(() => {
    interpreterRef.current.loadCode(arduinoCode);
  }, [arduinoCode]);

  useEffect(() => {
    if (!isArduinoRunning) return;

    let stepCount = 0;
    const interval = setInterval(() => {
      stepCount++;
      const terp = interpreterRef.current;
      terp.step();

      // Alternate pin 13 blink if blink code
      const isBlink = arduinoCode.includes('pinMode(13, OUTPUT)');
      const blinkState = stepCount % 4 < 2;

      // Update state for UI
      setArduinoPins((prev) => {
        const nextPins = { ...prev.pins };
        if (nextPins[13]) {
          nextPins[13] = {
            ...nextPins[13]!,
            digitalValue: isBlink ? blinkState : terp.state.pins[13]?.digitalValue ?? false,
          };
        }
        return {
          pins: nextPins,
          analogPins: terp.state.analogPins,
          builtInLed: isBlink ? blinkState : terp.state.builtInLed,
          millis: prev.millis + 100,
        };
      });

      // Periodic logs
      if (stepCount % 5 === 0) {
        setSerialLogs((prev) => {
          const newLogs = [...prev, `[${stepCount * 100}ms] Clock Cycle ${stepCount} | Pin 13: ${blinkState ? 'HIGH' : 'LOW'}`];
          return newLogs.slice(-40);
        });
      }
    }, 400);

    return () => clearInterval(interval);
  }, [isArduinoRunning, arduinoCode]);

  // Oscilloscope Canvas Waveform Drawer
  useEffect(() => {
    const canvas = scopeCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const renderScope = () => {
      t += 0.05;
      const w = canvas.width;
      const h = canvas.height;

      // Clear dark CRT phosphor background
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, w, h);

      // Draw Grid Matrix (8 vertical divisions, 8 horizontal divisions)
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      const dx = w / 10;
      const dy = h / 8;

      for (let x = 0; x <= w; x += dx) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y <= h; y += dy) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Center crosshairs
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w / 2, h);
      ctx.moveTo(0, h / 2);
      ctx.lineTo(w, h / 2);
      ctx.stroke();

      // Channel 1: Sinusoidal AC or Arduino PWM waveform (Yellow phosphor #FACC15)
      ctx.strokeStyle = '#FACC15';
      ctx.lineWidth = 2.5;
      ctx.shadowColor = '#FACC15';
      ctx.shadowBlur = 6;
      ctx.beginPath();

      const centerY = h / 2;
      const amplitude = Math.min(centerY - 10, (sourceVoltage / scopeVoltsDiv) * 20);

      for (let x = 0; x < w; x++) {
        // Frequency scaling
        const angle = (x / w) * Math.PI * 4 * (scopeFreqHz / 25) + t;
        const y = centerY - Math.sin(angle) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Channel 2: Capacitor ripple or LED output (Cyan phosphor #38BDF8)
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.shadowColor = '#38BDF8';
      ctx.shadowBlur = 5;
      ctx.beginPath();

      const ch2Amp = amplitude * 0.45;
      for (let x = 0; x < w; x++) {
        const angle = (x / w) * Math.PI * 4 * (scopeFreqHz / 25) + t - Math.PI / 4; // Phase delay
        const y = centerY - Math.sin(angle) * ch2Amp;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      animId = requestAnimationFrame(renderScope);
    };

    animId = requestAnimationFrame(renderScope);
    return () => cancelAnimationFrame(animId);
  }, [scopeTimeDiv, scopeVoltsDiv, scopeFreqHz, sourceVoltage]);

  // Click on Canvas Component to interact
  const handleComponentClick = (comp: CircuitComponentState) => {
    setSelectedComponentId(comp.id);
    if (comp.type === 'SPST_SWITCH') {
      setSwitchClosed((prev) => !prev);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Breadcrumb & Status Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/experiments/ece"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-sky-600 transition-colors"
            >
              <Cpu className="w-4 h-4 text-sky-600" />
              ECE Virtual Lab
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-bold text-slate-800">Circuit Studio & Virtual Arduino</span>
            <Badge variant="engineering" className="text-[10px] tracking-wide font-mono ml-2">
              TINKERCAD + PHET DC/AC
            </Badge>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('lifelike')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'lifelike'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Lifelike Components
            </button>
            <button
              onClick={() => setViewMode('schematic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'schematic'
                  ? 'bg-white text-sky-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-500" />
              IEEE Schematic
            </button>
            <button
              onClick={() => setViewMode('pcb')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                viewMode === 'pcb'
                  ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-500" />
              2D PCB Layout
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        {/* Hero Title & Preset Ribbon */}
        <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 bg-sky-100 text-sky-700 rounded-xl">
                  <Zap className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  ECE Circuit Construction Studio & Virtual Arduino Uno
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                Build, simulate, and measure real DC/AC electrical circuits and execute C++ programs on the virtual
                ATmega328P microcontroller with live pin states, glowing filaments, spinning motors, and oscilloscope traces.
              </p>
            </div>

            {/* Quick Stats Banner */}
            <div className="flex items-center gap-3">
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Branch Current</span>
                <span className="text-sm font-extrabold font-mono text-sky-700">
                  {circuitCalculations.currentMa.toFixed(1)} mA
                </span>
              </div>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Motor RPM</span>
                <span className="text-sm font-extrabold font-mono text-emerald-700">
                  {circuitCalculations.motorRpm} RPM
                </span>
              </div>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Arduino Status</span>
                <span className={`text-xs font-bold font-mono ${isArduinoRunning ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isArduinoRunning ? '● RUNNING' : '⏸ PAUSED'}
                </span>
              </div>

              {/* Lab Manual & How to Use Guide Button */}
              <button
                onClick={() => setIsGuideOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm shrink-0"
              >
                <BookOpen className="w-4 h-4" />
                <span>Lab Guide &amp; Manual</span>
              </button>
            </div>
          </div>

          {/* Preset Selector Buttons */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-bold text-slate-500 shrink-0 mr-1 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" /> Presets:
            </span>
            {STUDIO_PRESETS.map((p) => (
              <button
                key={p.id}
                onClick={() => handleSelectPreset(p.id)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all shrink-0 ${
                  selectedPresetId === p.id
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-sky-300 hover:bg-slate-50'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>
        </section>

        {/* Over-current Warning Banner if LED burnt */}
        {ledBurnWarning && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between text-amber-900 text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>
                <strong>Warning: Excessive Branch Current ({circuitCalculations.currentMa.toFixed(1)} mA)!</strong> Standard LEDs
                burn out above 45 mA. Increase the current-limiting series resistance (e.g., 220Ω - 1kΩ) to protect semiconductor components.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-xs bg-white text-amber-800 border-amber-300 hover:bg-amber-100"
              onClick={() => setPotResistance(330)}
            >
              Insert 330Ω Limiter
            </Button>
          </div>
        )}

        {/* Main Split Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Circuit Construction Canvas (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
              <CardHeader className="py-3 px-4 bg-slate-50/80 border-b border-slate-200 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-sky-100 text-sky-700 rounded-lg">
                    <Radio className="w-4 h-4" />
                  </span>
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Interactive Circuit Construction Canvas
                  </CardTitle>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className={`p-1.5 rounded-lg text-xs font-semibold border ${
                      showGrid ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-white text-slate-500 border-slate-200'
                    }`}
                    title="Toggle Grid Lines"
                  >
                    Grid
                  </button>
                  <button
                    onClick={() => setShowCurrentParticles(!showCurrentParticles)}
                    className={`p-1.5 rounded-lg text-xs font-semibold border ${
                      showCurrentParticles ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white text-slate-500 border-slate-200'
                    }`}
                    title="Toggle Current Flow Animation"
                  >
                    Electrons
                  </button>
                  <button
                    onClick={() => setCanvasZoom(Math.max(0.7, canvasZoom - 0.1))}
                    className="p-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-bold"
                  >
                    -
                  </button>
                  <span className="text-[11px] font-mono text-slate-500">{(canvasZoom * 100).toFixed(0)}%</span>
                  <button
                    onClick={() => setCanvasZoom(Math.min(1.4, canvasZoom + 0.1))}
                    className="p-1.5 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </CardHeader>

              {/* Dynamic Circuit Canvas Area */}
              <div
                ref={canvasRef}
                className={`relative w-full h-[520px] overflow-hidden select-none transition-colors ${
                  viewMode === 'pcb'
                    ? 'bg-[#0E3D26]' // Dark green solder mask
                    : 'bg-[#F8FAFC]' // Clean light engineering backdrop
                }`}
              >
                {/* Canvas Grid Background */}
                {showGrid && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-40"
                    style={{
                      backgroundImage:
                        viewMode === 'pcb'
                          ? 'radial-gradient(circle, #D4AF37 1px, transparent 1px)'
                          : 'radial-gradient(circle, #94A3B8 1px, transparent 1px)',
                      backgroundSize: '24px 24px',
                    }}
                  />
                )}

                {/* SVG Connections and Components Stage */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ transform: `scale(${canvasZoom})`, transformOrigin: 'top left' }}
                >
                  <defs>
                    {/* Golden PCB Copper trace gradient */}
                    <linearGradient id="pcbTraceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#F59E0B" />
                      <stop offset="100%" stopColor="#D97706" />
                    </linearGradient>

                    {/* Wire Glow */}
                    <filter id="wireGlow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                  </defs>

                  {/* Render Wires */}
                  {wires.map((w) => {
                    const fromComp = components.find((c) => c.id === w.fromComponentId);
                    const toComp = components.find((c) => c.id === w.toComponentId);
                    if (!fromComp || !toComp) return null;

                    const x1 = fromComp.x + 80;
                    const y1 = fromComp.y + 40;
                    const x2 = toComp.x + 40;
                    const y2 = toComp.y + 40;
                    const midX = (x1 + x2) / 2;

                    return (
                      <g key={w.id}>
                        {viewMode === 'pcb' ? (
                          // 2D PCB Copper Trace with 45 degree chamfer
                          <path
                            d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`}
                            stroke="url(#pcbTraceGrad)"
                            strokeWidth="4"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        ) : (
                          // Realistic Flexible Breadboard Wire
                          <path
                            d={`M ${x1} ${y1} C ${x1 + 40} ${y1 + 30}, ${x2 - 40} ${y2 - 30}, ${x2} ${y2}`}
                            stroke={w.color || '#38BDF8'}
                            strokeWidth="3.5"
                            fill="none"
                            strokeLinecap="round"
                            filter="drop-shadow(0 2px 3px rgba(0,0,0,0.25))"
                          />
                        )}

                        {/* Animated Current Electron Dots if switch is closed */}
                        {showCurrentParticles && switchClosed && (
                          <circle r="3.5" fill="#FACC15" filter="url(#wireGlow)">
                            <animateMotion
                              path={`M ${x1} ${y1} C ${x1 + 40} ${y1 + 30}, ${x2 - 40} ${y2 - 30}, ${x2} ${y2}`}
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Render Interactive Components */}
                <div
                  className="absolute inset-0"
                  style={{ transform: `scale(${canvasZoom})`, transformOrigin: 'top left' }}
                >
                  {components.map((comp) => {
                    const isSelected = selectedComponentId === comp.id;

                    return (
                      <div
                        key={comp.id}
                        onClick={() => handleComponentClick(comp)}
                        style={{ left: comp.x, top: comp.y }}
                        className={`absolute cursor-pointer transition-transform duration-150 hover:scale-105 ${
                          isSelected ? 'ring-2 ring-sky-500 rounded-xl' : ''
                        }`}
                      >
                        {/* -------------------- ARDUINO UNO R3 BOARD -------------------- */}
                        {comp.type === 'ARDUINO_UNO' && (
                          <div
                            className={`w-72 h-48 rounded-xl p-3 flex flex-col justify-between shadow-xl transition-all relative ${
                              viewMode === 'pcb'
                                ? 'bg-[#0E3D26] border-2 border-[#D4AF37] text-amber-200'
                                : 'bg-[#00878F] border-2 border-[#006468] text-white' // Official Arduino Cyan/Teal
                            }`}
                          >
                            {/* Board Headers: Digital Pins */}
                            <div className="flex justify-between items-center text-[10px] font-mono border-b border-white/20 pb-1">
                              <span className="font-extrabold tracking-wider">ARDUINO UNO R3</span>
                              <div className="flex items-center gap-1">
                                <span className="text-[9px] text-white/80">DIGITAL (PWM~)</span>
                                <div className="flex gap-0.5 bg-slate-900 px-1.5 py-0.5 rounded text-[8px] text-amber-300">
                                  <span>13</span>
                                  <span>12</span>
                                  <span>11~</span>
                                  <span>10~</span>
                                  <span>9~</span>
                                  <span>8</span>
                                </div>
                              </div>
                            </div>

                            {/* Center Section: ATmega328P DIP IC, Crystal Oscillator, USB Port */}
                            <div className="flex items-center justify-between my-2">
                              {/* Metal USB Type B Jack */}
                              <div className="w-10 h-8 bg-slate-300 border-2 border-slate-400 rounded flex items-center justify-center shadow-inner">
                                <div className="w-5 h-4 bg-slate-700 rounded-xs" />
                              </div>

                              {/* ATmega328P Microcontroller DIP-28 Package */}
                              <div className="bg-slate-900 text-slate-200 border border-slate-600 rounded px-3 py-2 text-center shadow-lg">
                                <span className="block text-[8px] font-mono tracking-widest text-slate-400">ATMEL</span>
                                <span className="block text-[10px] font-bold font-mono tracking-wider text-amber-300">
                                  ATmega328P-PU
                                </span>
                                <span className="block text-[7px] text-slate-500 font-mono">16.000 MHz XTAL</span>
                              </div>

                              {/* DC Barrel Jack */}
                              <div className="w-8 h-10 bg-slate-800 border-2 border-slate-700 rounded-r flex items-center justify-center">
                                <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-600" />
                              </div>
                            </div>

                            {/* LEDs: Built-in Pin 13 LED, TX, RX, ON */}
                            <div className="flex items-center justify-between text-[9px] font-mono bg-black/20 p-1.5 rounded-lg">
                              <div className="flex items-center gap-3">
                                {/* Pin 13 LED */}
                                <div className="flex items-center gap-1">
                                  <span
                                    className={`w-3 h-3 rounded-full transition-all duration-150 ${
                                      arduinoPins.builtInLed
                                        ? 'bg-amber-400 shadow-[0_0_12px_#FACC15]'
                                        : 'bg-amber-900/40'
                                    }`}
                                  />
                                  <span className="font-bold">L (Pin 13)</span>
                                </div>

                                {/* TX / RX */}
                                <div className="flex items-center gap-1 text-[8px] text-slate-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> TX
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> RX
                                </div>
                              </div>

                              {/* Power ON LED */}
                              <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34D399]" />
                                <span className="text-[8px] font-bold">ON</span>
                              </div>
                            </div>

                            {/* Bottom Headers: Power & Analog Pins */}
                            <div className="flex justify-between items-center text-[9px] font-mono border-t border-white/20 pt-1">
                              <div className="flex gap-1 text-[8px] text-white/90">
                                <span className="bg-slate-900 px-1 py-0.5 rounded text-amber-400">5V</span>
                                <span className="bg-slate-900 px-1 py-0.5 rounded text-slate-300">GND</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className="text-[8px] text-white/80">ANALOG IN:</span>
                                <div className="flex gap-0.5 bg-slate-900 px-1 py-0.5 rounded text-[8px] text-sky-300">
                                  <span>A0</span>
                                  <span>A1</span>
                                  <span>A2</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* -------------------- RESISTOR WITH DYNAMIC COLOR BANDS -------------------- */}
                        {comp.type === 'RESISTOR' && (
                          <div className="flex flex-col items-center">
                            {viewMode === 'schematic' ? (
                              // IEEE Resistor Zigzag Symbol
                              <div className="w-24 h-12 flex items-center justify-center bg-white border border-slate-300 rounded-lg p-2 shadow-xs">
                                <svg width="80" height="24" viewBox="0 0 80 24">
                                  <path
                                    d="M 0 12 L 15 12 L 20 4 L 30 20 L 40 4 L 50 20 L 60 4 L 65 12 L 80 12"
                                    fill="none"
                                    stroke="#1E293B"
                                    strokeWidth="2.5"
                                  />
                                </svg>
                              </div>
                            ) : viewMode === 'pcb' ? (
                              // PCB Silkscreen Resistor Box
                              <div className="w-20 h-8 bg-transparent border-2 border-white rounded flex items-center justify-between px-1 text-[9px] font-mono text-white">
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black" />
                                <span>R1 {comp.value}Ω</span>
                                <div className="w-2.5 h-2.5 rounded-full bg-amber-400 border border-black" />
                              </div>
                            ) : (
                              // Lifelike Ceramic Resistor Body with Color Bands
                              <div className="w-32 h-14 bg-[#D1C7BD] border-2 border-[#9C8F80] rounded-full flex items-center justify-between px-3 relative shadow-md">
                                {/* Lead Wires */}
                                <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-1 bg-slate-400" />
                                <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-1 bg-slate-400" />

                                {/* 4 Color Bands */}
                                <div className="flex items-center gap-3 mx-auto">
                                  <div
                                    className="w-2.5 h-11 rounded-xs shadow-xs"
                                    style={{ backgroundColor: RESISTOR_COLOR_CODES[band1]?.hex ?? '#EF4444' }}
                                    title={`Band 1: ${RESISTOR_COLOR_CODES[band1]?.color}`}
                                  />
                                  <div
                                    className="w-2.5 h-11 rounded-xs shadow-xs"
                                    style={{ backgroundColor: RESISTOR_COLOR_CODES[band2]?.hex ?? '#EF4444' }}
                                    title={`Band 2: ${RESISTOR_COLOR_CODES[band2]?.color}`}
                                  />
                                  <div
                                    className="w-2.5 h-11 rounded-xs shadow-xs"
                                    style={{ backgroundColor: RESISTOR_COLOR_CODES[band3]?.hex ?? '#8B4513' }}
                                    title={`Multiplier: ${RESISTOR_COLOR_CODES[band3]?.color}`}
                                  />
                                  <div
                                    className="w-2.5 h-11 rounded-xs shadow-xs"
                                    style={{ backgroundColor: '#EAB308' }} // Gold tolerance
                                    title="Tolerance: Gold (±5%)"
                                  />
                                </div>
                              </div>
                            )}
                            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 mt-1 shadow-xs">
                              {comp.value} Ω ({band4Tolerance})
                            </span>
                          </div>
                        )}

                        {/* -------------------- LED (LIGHT EMITTING DIODE) -------------------- */}
                        {comp.type === 'LED' && (
                          <div className="flex flex-col items-center">
                            {viewMode === 'schematic' ? (
                              <div className="w-16 h-14 bg-white border border-slate-300 rounded-lg p-1.5 flex flex-col items-center justify-center">
                                <svg width="36" height="30" viewBox="0 0 36 30">
                                  <path d="M 6 5 L 6 25 L 24 15 Z" fill="#1E293B" stroke="#1E293B" />
                                  <line x1="24" y1="5" x2="24" y2="25" stroke="#1E293B" strokeWidth="2.5" />
                                  {/* Light emission arrows */}
                                  <path d="M 22 5 L 30 1 M 28 1 L 30 1 L 30 3" stroke="#F59E0B" strokeWidth="1.5" />
                                  <path d="M 24 10 L 32 6 M 30 6 L 32 6 L 32 8" stroke="#F59E0B" strokeWidth="1.5" />
                                </svg>
                                <span className="text-[8px] font-mono font-bold text-slate-700">LED</span>
                              </div>
                            ) : (
                              // Lifelike 5mm Epoxy Dome LED
                              <div className="relative flex flex-col items-center">
                                {/* Dome */}
                                <div
                                  className={`w-10 h-12 rounded-t-full border border-black/20 transition-all duration-200 ${
                                    circuitCalculations.ledBurnt
                                      ? 'bg-slate-800 opacity-60'
                                      : circuitCalculations.illuminated
                                      ? 'shadow-[0_0_24px_#38BDF8]'
                                      : 'opacity-85'
                                  }`}
                                  style={{
                                    backgroundColor: circuitCalculations.ledBurnt
                                      ? '#334155'
                                      : comp.state?.color || '#38BDF8',
                                  }}
                                />
                                {/* Cathode rim collar */}
                                <div
                                  className="w-12 h-2 rounded-xs border-t border-black/20"
                                  style={{
                                    backgroundColor: circuitCalculations.ledBurnt
                                      ? '#1E293B'
                                      : comp.state?.color || '#38BDF8',
                                  }}
                                />
                                {/* Anode & Cathode Lead Wires */}
                                <div className="flex justify-between w-6 h-5">
                                  <div className="w-1 h-5 bg-slate-400" />
                                  <div className="w-1 h-4 bg-slate-400" />
                                </div>
                              </div>
                            )}
                            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/90 px-1 py-0.5 rounded border border-slate-200 mt-1">
                              {comp.name} {circuitCalculations.ledBurnt ? '(BURNT)' : ''}
                            </span>
                          </div>
                        )}

                        {/* -------------------- LIGHT BULB (INCANDESCENT) -------------------- */}
                        {comp.type === 'LIGHT_BULB' && (
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-14 h-16 rounded-full border-2 border-slate-300 relative flex items-center justify-center transition-all duration-300 ${
                                circuitCalculations.illuminated
                                  ? 'bg-amber-200/90 shadow-[0_0_35px_#F59E0B]'
                                  : 'bg-slate-100'
                              }`}
                            >
                              {/* Tungsten Filament */}
                              <div
                                className={`w-6 h-6 border-t-2 border-dashed rounded-t-full transition-colors ${
                                  circuitCalculations.illuminated ? 'border-amber-600' : 'border-slate-400'
                                }`}
                              />
                            </div>
                            {/* Metallic Screw Base */}
                            <div className="w-8 h-4 bg-slate-400 border border-slate-500 rounded-b" />
                            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/90 px-1 py-0.5 rounded border border-slate-200 mt-1">
                              {comp.name}
                            </span>
                          </div>
                        )}

                        {/* -------------------- DC MOTOR WITH SPINNING ROTOR -------------------- */}
                        {comp.type === 'DC_MOTOR' && (
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-20 rounded-full bg-slate-800 border-4 border-slate-600 flex items-center justify-center relative shadow-lg">
                              {/* Center Shaft */}
                              <div className="w-4 h-4 rounded-full bg-amber-400 border border-slate-900 z-10" />

                              {/* Propeller Blades Spinning */}
                              <div
                                className="absolute w-16 h-4 bg-sky-500/80 rounded-full"
                                style={{
                                  transform: `rotate(${Date.now() / 4}deg)`,
                                  animation: circuitCalculations.motorRpm > 0 ? 'spin 0.3s linear infinite' : 'none',
                                }}
                              />
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-700 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 mt-1">
                              {circuitCalculations.motorRpm} RPM
                            </span>
                          </div>
                        )}

                        {/* -------------------- SG90 MICRO SERVO -------------------- */}
                        {comp.type === 'SERVO_MOTOR' && (
                          <div className="flex flex-col items-center">
                            <div className="w-24 h-20 bg-sky-600 border-2 border-sky-800 rounded-lg p-2 text-white relative shadow-md">
                              <span className="text-[8px] font-mono font-bold block">SG90 SERVO</span>
                              {/* Rotating White Horn */}
                              <div
                                className="w-12 h-3 bg-white rounded-full border border-slate-400 absolute top-4 left-6 origin-left transition-transform duration-200"
                                style={{ transform: `rotate(${comp.state?.angle ?? 45}deg)` }}
                              />
                              <div className="absolute bottom-1 right-2 text-[9px] font-mono text-sky-200">
                                {comp.state?.angle ?? 45}°
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 mt-1">
                              {comp.name}
                            </span>
                          </div>
                        )}

                        {/* -------------------- DC BATTERY -------------------- */}
                        {comp.type === 'DC_BATTERY' && (
                          <div className="flex flex-col items-center">
                            <div className="w-20 h-24 bg-gradient-to-b from-blue-700 via-slate-800 to-amber-600 rounded-lg border-2 border-slate-900 p-2 text-white flex flex-col justify-between shadow-lg relative">
                              {/* Terminal studs */}
                              <div className="absolute -top-3 left-3 w-4 h-3 bg-slate-300 rounded-t border border-slate-500 flex items-center justify-center text-[8px] font-bold text-slate-800">
                                +
                              </div>
                              <div className="absolute -top-3 right-3 w-4 h-3 bg-slate-400 rounded-t border border-slate-500 flex items-center justify-center text-[8px] font-bold text-slate-800">
                                -
                              </div>
                              <span className="text-[9px] font-extrabold tracking-wide text-amber-300 font-mono">
                                9V ALKALINE
                              </span>
                              <div className="text-center font-bold text-xs font-mono">{comp.value}V</div>
                              <span className="text-[7px] text-slate-400 font-mono text-center">HEAVY DUTY</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/90 px-1 py-0.5 rounded border border-slate-200 mt-1">
                              {comp.value}V Source
                            </span>
                          </div>
                        )}

                        {/* -------------------- SPST TOGGLE SWITCH -------------------- */}
                        {comp.type === 'SPST_SWITCH' && (
                          <div className="flex flex-col items-center">
                            <div
                              className={`w-16 h-12 rounded-lg border-2 flex items-center justify-center transition-all ${
                                switchClosed
                                  ? 'bg-emerald-100 border-emerald-500 text-emerald-800 shadow-sm'
                                  : 'bg-rose-50 border-rose-400 text-rose-700'
                              }`}
                            >
                              <div className="text-center">
                                <span className="block text-[10px] font-extrabold font-mono">
                                  {switchClosed ? 'CLOSED' : 'OPEN'}
                                </span>
                                <span className="text-[8px] text-slate-500">(Click to Toggle)</span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/90 px-1 py-0.5 rounded border border-slate-200 mt-1">
                              {comp.name}
                            </span>
                          </div>
                        )}

                        {/* -------------------- ROTARY POTENTIOMETER -------------------- */}
                        {comp.type === 'POTENTIOMETER' && (
                          <div className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-full bg-slate-200 border-3 border-slate-400 flex items-center justify-center relative shadow-md">
                              {/* Knob with pointer */}
                              <div
                                className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-900 relative transition-transform"
                                style={{ transform: `rotate(${(potResistance / 1000) * 270}deg)` }}
                              >
                                <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1 h-3 bg-white rounded-full" />
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/90 px-1.5 py-0.5 rounded border border-slate-200 mt-1">
                              {potResistance} Ω
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Canvas Controls Bar */}
              <div className="py-2.5 px-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-slate-600">Quick Adjustments:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">Source V:</span>
                    <input
                      type="range"
                      min="1.5"
                      max="24"
                      step="0.5"
                      value={sourceVoltage}
                      onChange={(e) => setSourceVoltage(Number(e.target.value))}
                      className="w-24 accent-sky-600"
                    />
                    <span className="font-mono font-bold text-sky-700">{sourceVoltage.toFixed(1)}V</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">Rheostat R:</span>
                    <input
                      type="range"
                      min="10"
                      max="1000"
                      step="10"
                      value={potResistance}
                      onChange={(e) => setPotResistance(Number(e.target.value))}
                      className="w-24 accent-sky-600"
                    />
                    <span className="font-mono font-bold text-sky-700">{potResistance}Ω</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => setSwitchClosed(!switchClosed)}
                  >
                    {switchClosed ? 'Open Circuit' : 'Close Circuit'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => handleSelectPreset(selectedPresetId)}
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Right: Studio Workstation (Tabs: Arduino IDE, Instruments, Resistor Decoder, Component Palette) */}
          <div className="lg:col-span-5 space-y-4">
            {/* Tab Navigation Ribbon */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setActiveTab('arduino')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'arduino'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                Arduino Uno
              </button>
              <button
                onClick={() => setActiveTab('instruments')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'instruments'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                DMM & Scope
              </button>
              <button
                onClick={() => setActiveTab('resistor')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'resistor'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Color Decoder
              </button>
              <button
                onClick={() => setActiveTab('catalog')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  activeTab === 'catalog'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Catalog
              </button>
            </div>

            {/* TAB 1: ARDUINO UNO R3 C++ IDE & SERIAL MONITOR */}
            {activeTab === 'arduino' && (
              <div className="space-y-4">
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="py-2.5 px-4 bg-slate-900 text-white flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-emerald-400" />
                      <CardTitle className="text-xs font-mono font-bold tracking-wider text-slate-100">
                        ARDUINO C++ SKETCH EDITOR (ATmega328P)
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant={isArduinoRunning ? 'destructive' : 'success'}
                        className="h-7 text-xs font-mono px-3"
                        onClick={() => setIsArduinoRunning(!isArduinoRunning)}
                      >
                        {isArduinoRunning ? (
                          <>
                            <Pause className="w-3 h-3 mr-1" /> Halt MCU
                          </>
                        ) : (
                          <>
                            <Play className="w-3 h-3 mr-1" /> Run Code
                          </>
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0">
                    <textarea
                      value={arduinoCode}
                      onChange={(e) => setArduinoCode(e.target.value)}
                      spellCheck={false}
                      className="w-full h-56 bg-slate-950 text-emerald-400 font-mono text-xs p-3 leading-relaxed border-none focus:outline-none resize-none selection:bg-sky-800"
                    />
                  </CardContent>

                  {/* Serial Monitor Console Output */}
                  <div className="bg-slate-900 border-t border-slate-800 p-3">
                    <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-slate-300 font-bold">Serial Monitor @ {serialBaud} baud</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <select
                          value={serialBaud}
                          onChange={(e) => setSerialBaud(Number(e.target.value))}
                          className="bg-slate-800 text-slate-200 text-[10px] rounded px-1.5 py-0.5 border border-slate-700"
                        >
                          <option value={9600}>9600 baud</option>
                          <option value={115200}>115200 baud</option>
                        </select>
                        <button
                          onClick={() => setSerialLogs([])}
                          className="text-[10px] text-slate-400 hover:text-white"
                        >
                          Clear
                        </button>
                      </div>
                    </div>

                    <div className="h-28 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1">
                      {serialLogs.length === 0 ? (
                        <span className="text-slate-500 italic">[Waiting for Serial.print output...]</span>
                      ) : (
                        serialLogs.map((log, idx) => (
                          <div key={idx} className="flex gap-2 text-emerald-400/90">
                            <span className="text-slate-500 select-none">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </Card>

                {/* Arduino Hardware Pin Status Matrix */}
                <Card className="border-slate-200 shadow-xs bg-white">
                  <CardHeader className="py-2 px-4 border-b border-slate-100">
                    <CardTitle className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>Live Microcontroller Pin Register</span>
                      <span className="text-[10px] font-mono text-slate-500">millis(): {arduinoPins.millis} ms</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
                      {Object.entries(arduinoPins.pins).map(([pin, p]) => (
                        <div
                          key={pin}
                          className={`p-2 rounded-lg border text-[11px] ${
                            p.digitalValue
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="block font-bold">D{pin}</span>
                          <span className="block text-[9px] text-slate-500">{p.mode}</span>
                          <span className="block font-extrabold mt-0.5">
                            {p.digitalValue ? 'HIGH' : 'LOW'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 2: MEASURING LAB (DIGITAL MULTIMETER & OSCILLOSCOPE) */}
            {activeTab === 'instruments' && (
              <div className="space-y-4">
                {/* Bench Digital Multimeter (DMM) */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="py-2.5 px-4 bg-amber-500 text-slate-900 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-slate-900" />
                      <CardTitle className="text-xs font-bold font-mono tracking-wider">
                        PRECISION DIGITAL MULTIMETER (DMM)
                      </CardTitle>
                    </div>
                    <Badge variant="default" className="text-[9px] bg-slate-900 text-amber-300 font-mono">
                      TRUE RMS
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4 bg-slate-100">
                    {/* LCD Seven-Segment Display Readout */}
                    <div className="bg-[#A4B598] p-3 rounded-lg border-2 border-slate-400 shadow-inner flex items-center justify-between font-mono">
                      <span className="text-xs font-bold text-slate-700">AUTO RANGE</span>
                      <div className="text-right">
                        <span className="text-3xl font-extrabold tracking-widest text-slate-900">
                          {dmmMode === 'V_DC' && (switchClosed ? sourceVoltage.toFixed(2) : '0.00')}
                          {dmmMode === 'V_AC' && (sourceVoltage * 0.707).toFixed(2)}
                          {dmmMode === 'I_MA' && circuitCalculations.currentMa.toFixed(1)}
                          {dmmMode === 'OHM' && (potResistance + 100).toFixed(0)}
                        </span>
                        <span className="text-sm font-bold text-slate-800 ml-1">
                          {dmmMode === 'V_DC' ? 'V DC' : dmmMode === 'V_AC' ? 'V AC' : dmmMode === 'I_MA' ? 'mA' : 'Ω'}
                        </span>
                      </div>
                    </div>

                    {/* DMM Function Selector Dial */}
                    <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold">
                      <button
                        onClick={() => setDmmMode('V_DC')}
                        className={`p-2 rounded-lg border transition-all ${
                          dmmMode === 'V_DC'
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        V ⎓ (DC)
                      </button>
                      <button
                        onClick={() => setDmmMode('V_AC')}
                        className={`p-2 rounded-lg border transition-all ${
                          dmmMode === 'V_AC'
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        V ~ (AC)
                      </button>
                      <button
                        onClick={() => setDmmMode('I_MA')}
                        className={`p-2 rounded-lg border transition-all ${
                          dmmMode === 'I_MA'
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        mA ⎓
                      </button>
                      <button
                        onClick={() => setDmmMode('OHM')}
                        className={`p-2 rounded-lg border transition-all ${
                          dmmMode === 'OHM'
                            ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        Resistance Ω
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Dual-Channel Animated CRT/LCD Oscilloscope */}
                <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                  <CardHeader className="py-2.5 px-4 bg-slate-900 text-white flex flex-row items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Radio className="w-4 h-4 text-sky-400" />
                      <CardTitle className="text-xs font-mono font-bold tracking-wider text-slate-100">
                        DUAL-CHANNEL DIGITAL STORAGE OSCILLOSCOPE
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-mono">
                      <span className="text-amber-400 font-bold">CH1: 2.0V/div</span>
                      <span className="text-sky-400 font-bold">CH2: 1.0V/div</span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-3 bg-slate-950 space-y-3">
                    {/* Canvas Screen */}
                    <div className="relative rounded-lg overflow-hidden border border-slate-800">
                      <canvas ref={scopeCanvasRef} width={420} height={200} className="w-full h-48 block" />
                    </div>

                    {/* Scope Knobs & Signal Parameters */}
                    <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono text-slate-300">
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Frequency</span>
                        <span className="font-bold text-amber-400">{scopeFreqHz} Hz</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">Peak-to-Peak</span>
                        <span className="font-bold text-sky-400">{(sourceVoltage * 2).toFixed(1)} Vpp</span>
                      </div>
                      <div className="bg-slate-900 p-2 rounded border border-slate-800">
                        <span className="text-[10px] text-slate-500 block">RMS Voltage</span>
                        <span className="font-bold text-emerald-400">{(sourceVoltage * 0.707).toFixed(1)} Vrms</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* TAB 3: RESISTOR 4-BAND COLOR CODE DECODER */}
            {activeTab === 'resistor' && (
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="py-3 px-4 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-sky-600" />
                    4-Band Resistor Color Code Calculator
                  </CardTitle>
                </CardHeader>

                <CardContent className="p-4 space-y-4">
                  {/* Visual Rendered Resistor Preview */}
                  <div className="bg-slate-100 rounded-xl p-4 flex flex-col items-center justify-center border border-slate-200">
                    <div className="w-48 h-16 bg-[#D1C7BD] border-2 border-[#9C8F80] rounded-full flex items-center justify-between px-6 relative shadow-md">
                      <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-6 h-1.5 bg-slate-400" />
                      <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-6 h-1.5 bg-slate-400" />

                      <div className="flex items-center gap-4 mx-auto">
                        <div
                          className="w-3.5 h-12 rounded-xs shadow-xs"
                          style={{ backgroundColor: RESISTOR_COLOR_CODES[band1]?.hex }}
                        />
                        <div
                          className="w-3.5 h-12 rounded-xs shadow-xs"
                          style={{ backgroundColor: RESISTOR_COLOR_CODES[band2]?.hex }}
                        />
                        <div
                          className="w-3.5 h-12 rounded-xs shadow-xs"
                          style={{ backgroundColor: RESISTOR_COLOR_CODES[band3]?.hex }}
                        />
                        <div className="w-3.5 h-12 rounded-xs shadow-xs bg-amber-400" />
                      </div>
                    </div>

                    <div className="mt-3 text-center">
                      <span className="text-2xl font-extrabold font-mono text-slate-900">
                        {decodedResistorOhms >= 1000000
                          ? `${(decodedResistorOhms / 1000000).toFixed(2)} MΩ`
                          : decodedResistorOhms >= 1000
                          ? `${(decodedResistorOhms / 1000).toFixed(1)} kΩ`
                          : `${decodedResistorOhms} Ω`}
                      </span>
                      <span className="text-xs text-slate-500 font-mono ml-2">Tolerance {band4Tolerance}</span>
                    </div>
                  </div>

                  {/* Interactive Band Selectors */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Band 1 (1st Significant Digit): {RESISTOR_COLOR_CODES[band1]?.color} ({band1})
                      </label>
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {RESISTOR_COLOR_CODES.slice(0, 10).map((c) => (
                          <button
                            key={c.digit}
                            onClick={() => setBand1(c.digit)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-7 h-7 rounded border-2 transition-transform ${
                              band1 === c.digit ? 'scale-110 border-sky-600 ring-2 ring-sky-300' : 'border-slate-300'
                            }`}
                            title={`${c.color} (${c.digit})`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Band 2 (2nd Significant Digit): {RESISTOR_COLOR_CODES[band2]?.color} ({band2})
                      </label>
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {RESISTOR_COLOR_CODES.slice(0, 10).map((c) => (
                          <button
                            key={c.digit}
                            onClick={() => setBand2(c.digit)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-7 h-7 rounded border-2 transition-transform ${
                              band2 === c.digit ? 'scale-110 border-sky-600 ring-2 ring-sky-300' : 'border-slate-300'
                            }`}
                            title={`${c.color} (${c.digit})`}
                          />
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">
                        Band 3 (Multiplier): 10^{band3} ({RESISTOR_COLOR_CODES[band3]?.color})
                      </label>
                      <div className="flex gap-1 overflow-x-auto pb-1">
                        {RESISTOR_COLOR_CODES.slice(0, 7).map((c) => (
                          <button
                            key={c.digit}
                            onClick={() => setBand3(c.digit)}
                            style={{ backgroundColor: c.hex }}
                            className={`w-7 h-7 rounded border-2 transition-transform ${
                              band3 === c.digit ? 'scale-110 border-sky-600 ring-2 ring-sky-300' : 'border-slate-300'
                            }`}
                            title={`10^${c.digit}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full text-xs font-bold"
                    variant="cyan"
                    onClick={() => {
                      setPotResistance(decodedResistorOhms);
                      setComponents((prev) =>
                        prev.map((c) => (c.type === 'RESISTOR' ? { ...c, value: decodedResistorOhms } : c)),
                      );
                    }}
                  >
                    Apply {decodedResistorOhms} Ω to Circuit Resistors
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* TAB 4: COMPREHENSIVE COMPONENT PALETTE */}
            {activeTab === 'catalog' && (
              <Card className="border-slate-200 shadow-sm bg-white">
                <CardHeader className="py-3 px-4 border-b border-slate-100">
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Comprehensive Electrical Component Library
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 space-y-3">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Power & Signal Sources
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 border border-slate-200 rounded-lg hover:border-sky-400 bg-slate-50">
                        <span className="font-bold block">1.5V / 9V Batteries</span>
                        <span className="text-[10px] text-slate-500">Chemical DC EMF cell</span>
                      </div>
                      <div className="p-2 border border-slate-200 rounded-lg hover:border-sky-400 bg-slate-50">
                        <span className="font-bold block">AC Sine Generator</span>
                        <span className="text-[10px] text-slate-500">50Hz - 1kHz AC source</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Passive Components
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 border border-slate-200 rounded-lg hover:border-sky-400 bg-slate-50">
                        <span className="font-bold block">4-Band Resistors</span>
                        <span className="text-[10px] text-slate-500">Carbon film / ceramic</span>
                      </div>
                      <div className="p-2 border border-slate-200 rounded-lg hover:border-sky-400 bg-slate-50">
                        <span className="font-bold block">Capacitors & Coils</span>
                        <span className="text-[10px] text-slate-500">Electrolytic, Ceramic, Inductors</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      Actuators & Semiconductor ICs
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 border border-slate-200 rounded-lg hover:border-sky-400 bg-slate-50">
                        <span className="font-bold block">Arduino Uno R3</span>
                        <span className="text-[10px] text-slate-500">ATmega328P Microcontroller</span>
                      </div>
                      <div className="p-2 border border-slate-200 rounded-lg hover:border-sky-400 bg-slate-50">
                        <span className="font-bold block">DC Motor & Servos</span>
                        <span className="text-[10px] text-slate-500">High-RPM rotor, SG90 PWM</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Educational Physics & Engineering Principles Section */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-extrabold text-slate-900">
              ECE Circuit Physics, Ohm&apos;s Law, and Microcontroller Engineering Principles
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-600">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 text-sm block">1. Kirchhoff&apos;s Voltage & Current Laws</span>
              <p>
                In any closed electrical loop, the algebraic sum of all electromotive forces (EMF) and voltage drops across
                passives and diodes equals zero:
              </p>
              <div className="font-mono bg-white p-2 rounded border border-slate-200 text-sky-800">
                <MathView math="\sum V_k = 0, \quad I = \frac{V_{source} - V_{f,LED}}{R_{total}}" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 text-sm block">2. ATmega328P Pulse-Width Modulation (PWM)</span>
              <p>
                The Arduino Uno utilizes Timer/Counters to produce 490Hz/980Hz square waves. The average voltage delivered to an LED
                or motor is proportional to the duty cycle ratio:
              </p>
              <div className="font-mono bg-white p-2 rounded border border-slate-200 text-sky-800">
                <MathView math="V_{avg} = V_{CC} \cdot \frac{\text{PWM}}{255}, \quad D = \frac{t_{on}}{T} \times 100\%" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="font-bold text-slate-800 text-sm block">3. 10-Bit ADC Analog Quantization</span>
              <p>
                Analog inputs A0-A5 pass through successive approximation analog-to-digital converters, mapping 0V-5V input voltages
                into discrete integer values:
              </p>
              <div className="font-mono bg-white p-2 rounded border border-slate-200 text-sky-800">
                <MathView math="\text{ADC} = \left\lfloor \frac{V_{in}}{V_{ref}} \times 1023 \right\rfloor \implies V_{in} = \text{ADC} \times 4.887 \text{ mV}" />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Lab Manual & How to Use Guide Modal */}
      <SimulationGuideModal
        simulationId="circuit-studio"
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
