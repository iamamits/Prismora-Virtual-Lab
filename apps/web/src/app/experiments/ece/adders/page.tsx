/**
 * Prismora ECE Virtual Lab — Flagship Half Adder & Full Adder Virtual Laboratory
 * Production-quality interactive circuit simulation with 2D component canvas, wire routing,
 * live truth tables, automated verification, multi-channel logic analysis, and theory drawer.
 */

'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  CircuitComponentType,
  CircuitEvaluator,
  CircuitGraph,
  CircuitTerminal,
  createComponent,
  createFullAdderCircuit,
  createHalfAdderCircuit,
  createNandHalfAdderCircuit,
} from '@prismora/simulation-core';
import { Badge, BugReportModal, Button } from '@prismora/ui';
import {
  Activity,
  AlertCircle,
  BookOpen,
  ChevronRight,
  Cpu,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  RotateCcw,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CircuitCanvas } from '@/components/ece/circuit-canvas';
import { ComponentPalette } from '@/components/ece/component-palette';
import { LogicAnalyzer } from '@/components/ece/logic-analyzer';
import { TheoryDrawer } from '@/components/ece/theory-drawer';
import { TruthTableView } from '@/components/ece/truth-table-view';

export default function AddersVirtualLabPage() {
  const [mode, setMode] = useState<'half-adder' | 'full-adder'>('half-adder');

  // Circuit graph state
  const [graph, setGraph] = useState<CircuitGraph>(() => createHalfAdderCircuit());

  // Panel visibility toggles
  const [showPalette, setShowPalette] = useState(false);
  const [showTruthTable, setShowTruthTable] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const [showAnalyzer, setShowAnalyzer] = useState(true);

  // Default panels open on desktop
  React.useEffect(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      setShowPalette(true);
      setShowTruthTable(true);
    }
  }, []);

  // Digital Logic Probe active mode
  const [probeActive, setProbeActive] = useState(false);
  const [, setProbedTerminal] = useState<{
    term: CircuitTerminal;
    signal: any;
  } | null>(null);

  // Switch between Half Adder and Full Adder modes
  const handleModeChange = (newMode: 'half-adder' | 'full-adder') => {
    setMode(newMode);
    if (newMode === 'half-adder') {
      setGraph(createHalfAdderCircuit());
    } else {
      setGraph(createFullAdderCircuit());
    }
  };

  // Presets
  const handleLoadPreset = (preset: 'canonical' | 'nand' | 'clear') => {
    if (preset === 'canonical') {
      setGraph(mode === 'half-adder' ? createHalfAdderCircuit() : createFullAdderCircuit());
    } else if (preset === 'nand') {
      setGraph(createNandHalfAdderCircuit());
    } else if (preset === 'clear') {
      // Clear all except standard inputs and outputs
      setGraph({
        components: [
          createComponent('INPUT_SWITCH', 'Input A', 80, 140, 'sw-a'),
          createComponent('INPUT_SWITCH', 'Input B', 80, 260, 'sw-b'),
          ...(mode === 'full-adder'
            ? [createComponent('INPUT_SWITCH', 'Carry In (Cin)', 80, 380, 'sw-cin')]
            : []),
          createComponent('OUTPUT_LED', 'Sum (S)', 600, 140, 'led-sum'),
          createComponent(
            'OUTPUT_LED',
            mode === 'full-adder' ? 'Carry Out (Cout)' : 'Carry (C)',
            600,
            260,
            'led-carry',
          ),
        ],
        wires: [],
      });
    }
  };

  // Add component from palette
  const handleAddComponent = (type: CircuitComponentType, label: string) => {
    // Stagger placement around center
    const x = 320 + (graph.components.length % 4) * 20;
    const y = 180 + (graph.components.length % 4) * 25;
    const newComp = createComponent(type, label, x, y);
    setGraph((prev) => ({
      ...prev,
      components: [...prev.components, newComp],
    }));
  };

  // Evaluate circuit graph
  const evalResult = useMemo(() => {
    return CircuitEvaluator.evaluate(graph);
  }, [graph]);

  // Set inputs from Truth Table row click
  const handleSetInputs = (inputs: Record<string, 0 | 1>) => {
    const updated = graph.components.map((c) => {
      if (c.type === 'INPUT_SWITCH') {
        for (const [name, val] of Object.entries(inputs)) {
          if (
            c.label.toLowerCase().includes(name.toLowerCase()) ||
            c.id.toLowerCase().includes(name.toLowerCase())
          ) {
            return {
              ...c,
              state: { ...c.state, switchState: val },
            };
          }
        }
      }
      return c;
    });
    setGraph({ ...graph, components: updated });
  };

  // Logic Analyzer channels & signals
  const isFullAdder = mode === 'full-adder';
  const analyzerChannels = isFullAdder
    ? [
        { id: 'A', name: 'A', color: '#06B6D4' },
        { id: 'B', name: 'B', color: '#3B82F6' },
        { id: 'Cin', name: 'Cin', color: '#FBBF24' },
        { id: 'Sum', name: 'Sum', color: '#22C55E' },
        { id: 'Cout', name: 'Cout', color: '#8B5CF6' },
      ]
    : [
        { id: 'A', name: 'A', color: '#06B6D4' },
        { id: 'B', name: 'B', color: '#3B82F6' },
        { id: 'Sum', name: 'Sum', color: '#22C55E' },
        { id: 'Carry', name: 'Carry', color: '#8B5CF6' },
      ];

  const currentAnalyzerSignals = useMemo(() => {
    const sigs: Record<string, 0 | 1 | 'FLOATING'> = {};

    const findSwitch = (name: string) =>
      graph.components.find(
        (c) =>
          c.type === 'INPUT_SWITCH' &&
          (c.label.toLowerCase().includes(name.toLowerCase()) ||
            c.id.toLowerCase().includes(name.toLowerCase())),
      );

    const findLed = (name: string) =>
      graph.components.find(
        (c) =>
          c.type === 'OUTPUT_LED' &&
          (c.label.toLowerCase().includes(name.toLowerCase()) ||
            c.id.toLowerCase().includes(name.toLowerCase())),
      );

    sigs['A'] = (findSwitch('A')?.state?.switchState ?? 0) as 0 | 1;
    sigs['B'] = (findSwitch('B')?.state?.switchState ?? 0) as 0 | 1;
    if (isFullAdder) {
      sigs['Cin'] = (findSwitch('Cin')?.state?.switchState ?? 0) as 0 | 1;
    }

    const sumLed = findLed('Sum');
    if (sumLed?.inputs[0]?.id) {
      sigs['Sum'] = (evalResult.terminalSignals[sumLed.inputs[0].id] ?? 'FLOATING') as any;
    } else {
      sigs['Sum'] = 'FLOATING';
    }

    const carryLed = isFullAdder ? findLed('Cout') : findLed('Carry');
    const carryKey = isFullAdder ? 'Cout' : 'Carry';
    if (carryLed?.inputs[0]?.id) {
      sigs[carryKey] = (evalResult.terminalSignals[carryLed.inputs[0].id] ?? 'FLOATING') as any;
    } else {
      sigs[carryKey] = 'FLOATING';
    }

    return sigs;
  }, [graph, evalResult, isFullAdder]);

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] w-full bg-[#F8FAFC] text-[#172033] overflow-hidden select-none">
      {/* Top Laboratory Control Bar */}
      <header className="h-12 border-b border-zinc-200 bg-white px-4 flex items-center justify-between shrink-0 z-40 shadow-xs">
        {/* Left: Breadcrumbs & Title */}
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Link href="/labs" className="hover:text-zinc-900 transition-colors">
              Labs
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-400" />
            <Link href="/experiments/ece" className="text-blue-600 font-bold hover:underline">
              ECE Virtual Lab
            </Link>
            <ChevronRight className="w-3 h-3 text-zinc-400" />
            <span className="text-[#172033] font-bold">Adders</span>
          </nav>

          <div className="w-[1px] h-4 bg-zinc-200 mx-1 hidden sm:block" />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
            <button
              onClick={() => handleModeChange('half-adder')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                mode === 'half-adder'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Half Adder
            </button>
            <button
              onClick={() => handleModeChange('full-adder')}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                mode === 'full-adder'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              Full Adder
            </button>
          </div>
        </div>

        {/* Center: Presets & Templates */}
        <div className="hidden md:flex items-center gap-2">
          <button
            onClick={() => handleLoadPreset('canonical')}
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Load Reference Canonical Circuit"
          >
            <Sparkles className="w-3 h-3 text-blue-600" />
            <span>Reference Circuit</span>
          </button>
          {mode === 'half-adder' && (
            <button
              onClick={() => handleLoadPreset('nand')}
              className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 transition-colors flex items-center gap-1.5 shadow-xs"
              title="Load 5-NAND Universal Realization"
            >
              <Cpu className="w-3 h-3 text-emerald-600" />
              <span>Universal NAND</span>
            </button>
          )}
          <button
            onClick={() => handleLoadPreset('clear')}
            className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Reset to blank canvas"
          >
            <RotateCcw className="w-3 h-3 text-zinc-500" />
            <span>Sandbox Mode</span>
          </button>
        </div>

        {/* Right: Instruments & Views Toggles */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPalette(!showPalette)}
            title="Toggle Component Palette"
            aria-label="Toggle Component Palette"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showPalette
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Palette</span>
          </button>

          <button
            onClick={() => setShowTruthTable(!showTruthTable)}
            title="Toggle Truth Table Panel"
            aria-label="Toggle Truth Table"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showTruthTable
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>

          <button
            onClick={() => setProbeActive(!probeActive)}
            title="Toggle Logic Probe Cursor"
            aria-label="Toggle Logic Probe"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              probeActive
                ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Probe</span>
          </button>

          <button
            onClick={() => setShowAnalyzer(!showAnalyzer)}
            title="Toggle Logic Analyzer Waveforms"
            aria-label="Toggle Logic Analyzer"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showAnalyzer
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Analyzer</span>
          </button>

          <button
            onClick={() => setShowTheory(!showTheory)}
            title="Toggle Theory & Procedure Drawer"
            aria-label="Toggle Theory & Procedure"
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border transition-colors flex items-center gap-1.5 ${
              showTheory
                ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory</span>
          </button>

          <BugReportModal
            simulationId={`ece-${mode}`}
            moduleName="Prismora ECE Virtual Lab"
            triggerText="Report Bug"
            diagnosticSnapshot={{
              mode,
              componentsCount: graph.components.length,
              wiresCount: graph.wires.length,
              isValid: evalResult.isValid,
              floatingCount: evalResult.floatingInputs.length,
              hasCycle: evalResult.hasCycle,
            }}
          />
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* Left: Component Palette Drawer (Slide-out on mobile, inline on desktop) */}
        {showPalette && (
          <div className="absolute inset-y-0 left-0 z-30 lg:relative lg:inset-auto lg:z-auto h-full shadow-2xl lg:shadow-none flex">
            <ComponentPalette onAddComponent={handleAddComponent} />
          </div>
        )}

        {/* Center: Circuit Canvas & Logic Analyzer */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0 relative">
          {/* Interactive Circuit Canvas */}
          <div className="flex-1 min-h-0 relative">
            <CircuitCanvas
              graph={graph}
              evalResult={evalResult}
              onChange={setGraph}
              probeActive={probeActive}
              onProbeTerminal={(term, sig) => setProbedTerminal({ term, signal: sig })}
            />
          </div>

          {/* Collapsible Logic Analyzer Waveforms */}
          {showAnalyzer && (
            <div className="h-44 shrink-0">
              <LogicAnalyzer
                currentSignals={currentAnalyzerSignals}
                channels={analyzerChannels}
              />
            </div>
          )}
        </div>

        {/* Right: Synchronized Truth Table View (Slide-out on mobile, inline on desktop) */}
        {showTruthTable && (
          <div className="absolute inset-y-0 right-0 z-30 lg:relative lg:inset-auto lg:z-auto h-full shadow-2xl lg:shadow-none flex">
            <TruthTableView
              mode={mode}
              graph={graph}
              evalResult={evalResult}
              onSetInputs={handleSetInputs}
            />
          </div>
        )}

        {/* Far Right: Theory, Procedure, Troubleshooting & Quiz Drawer */}
        {showTheory && (
          <div className="absolute inset-y-0 right-0 z-30 lg:relative lg:inset-auto lg:z-auto h-full shadow-2xl lg:shadow-none flex">
            <TheoryDrawer mode={mode} />
          </div>
        )}
      </div>
    </div>
  );
}
