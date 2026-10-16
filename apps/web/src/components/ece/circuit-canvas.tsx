/**
 * Prismora ECE Virtual Lab — Interactive 2D Circuit Canvas Editor
 * Genuine interactive circuit construction canvas with component dragging, terminal-to-terminal
 * wire routing, signal state visualization, snap-to-grid, pan/zoom, and undo/redo.
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  CircuitComponent,
  CircuitEvaluationResult,
  CircuitGraph,
  CircuitTerminal,
  CircuitWire,
  createWire,
  generateUniqueId,
} from '@prismora/simulation-core';
import {
  Copy,
  Maximize2,
  MousePointer,
  Redo2,
  RotateCw,
  Search,
  Sparkles,
  Trash2,
  Undo2,
  Zap,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { GateSymbol } from './circuit-symbols';

interface CircuitCanvasProps {
  graph: CircuitGraph;
  evalResult: CircuitEvaluationResult;
  onChange: (newGraph: CircuitGraph) => void;
  probeActive?: boolean;
  onProbeTerminal?: (term: CircuitTerminal, signal: any) => void;
}

export const CircuitCanvas: React.FC<CircuitCanvasProps> = ({
  graph,
  evalResult,
  onChange,
  probeActive = false,
  onProbeTerminal,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 20, y: 20 });
  const [zoom, setZoom] = useState<number>(1);
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Selection & Dragging
  const [selectedCompId, setSelectedCompId] = useState<string | null>(null);
  const [selectedWireId, setSelectedWireId] = useState<string | null>(null);
  const [draggedCompId, setDraggedCompId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Wire Connection Dragging
  const [activeWireStart, setActiveWireStart] = useState<{
    compId: string;
    termId: string;
    termType: 'input' | 'output';
  } | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredTermId, setHoveredTermId] = useState<string | null>(null);

  // Snap to Grid
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const GRID_SIZE = 15;

  // History Stack for Undo/Redo
  const [history, setHistory] = useState<CircuitGraph[]>([graph]);
  const [historyIdx, setHistoryIdx] = useState<number>(0);

  const pushHistory = useCallback(
    (newGraph: CircuitGraph) => {
      const nextHistory = history.slice(0, historyIdx + 1);
      nextHistory.push(JSON.parse(JSON.stringify(newGraph)));
      if (nextHistory.length > 30) nextHistory.shift();
      setHistory(nextHistory);
      setHistoryIdx(nextHistory.length - 1);
      onChange(newGraph);
    },
    [history, historyIdx, onChange],
  );

  const handleUndo = useCallback(() => {
    if (historyIdx > 0) {
      const prev = history[historyIdx - 1]!;
      setHistoryIdx(historyIdx - 1);
      onChange(JSON.parse(JSON.stringify(prev)));
    }
  }, [history, historyIdx, onChange]);

  const handleRedo = useCallback(() => {
    if (historyIdx < history.length - 1) {
      const next = history[historyIdx + 1]!;
      setHistoryIdx(historyIdx + 1);
      onChange(JSON.parse(JSON.stringify(next)));
    }
  }, [history, historyIdx, onChange]);

  // Convert client viewport coordinates to canvas coordinates
  const clientToCanvas = useCallback(
    (clientX: number, clientY: number) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      const x = (clientX - rect.left - pan.x) / zoom;
      const y = (clientY - rect.top - pan.y) / zoom;
      return { x, y };
    },
    [pan, zoom],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && (selectedCompId || selectedWireId)) {
        e.preventDefault();
        if (selectedWireId) {
          const newWires = graph.wires.filter((w) => w.id !== selectedWireId);
          pushHistory({ ...graph, wires: newWires });
          setSelectedWireId(null);
        } else if (selectedCompId) {
          const newComps = graph.components.filter((c) => c.id !== selectedCompId);
          const newWires = graph.wires.filter(
            (w) => w.from.componentId !== selectedCompId && w.to.componentId !== selectedCompId,
          );
          pushHistory({ components: newComps, wires: newWires });
          setSelectedCompId(null);
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          handleRedo();
        } else {
          handleUndo();
        }
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }

      if (e.key === 'Escape') {
        setActiveWireStart(null);
        setSelectedCompId(null);
        setSelectedWireId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [graph, selectedCompId, selectedWireId, handleUndo, handleRedo, pushHistory]);

  // Mouse wheel zoom (attached via native non-passive listener to allow preventDefault safely)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
      setZoom((prevZoom) => Math.min(Math.max(prevZoom * zoomFactor, 0.4), 2.5));
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', onWheel);
    };
  }, []);

  // Canvas background pointer down (pan)
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0 && e.target === e.currentTarget) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedCompId(null);
      setSelectedWireId(null);
      setActiveWireStart(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const coords = clientToCanvas(e.clientX, e.clientY);
    setCursorPos(coords);

    if (isPanning) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    } else if (draggedCompId) {
      let nextX = coords.x - dragOffset.x;
      let nextY = coords.y - dragOffset.y;

      if (snapToGrid) {
        nextX = Math.round(nextX / GRID_SIZE) * GRID_SIZE;
        nextY = Math.round(nextY / GRID_SIZE) * GRID_SIZE;
      }

      const updated = graph.components.map((c) =>
        c.id === draggedCompId ? { ...c, x: nextX, y: nextY } : c,
      );
      onChange({ ...graph, components: updated });
    }
  };

  const handleMouseUp = () => {
    if (isPanning) setIsPanning(false);
    if (draggedCompId) {
      setDraggedCompId(null);
      pushHistory(graph);
    }
    if (activeWireStart) {
      setActiveWireStart(null);
    }
  };

  // Toggle Switch state
  const handleToggleSwitch = (e: React.MouseEvent, comp: CircuitComponent) => {
    e.stopPropagation();
    const current = comp.state?.switchState ?? 0;
    const next = current === 1 ? 0 : 1;
    const updated = graph.components.map((c) =>
      c.id === comp.id ? { ...c, state: { ...c.state, switchState: next } } : c,
    );
    pushHistory({ ...graph, components: updated });
  };

  // Terminal click to create wire
  const handleTerminalClick = (
    e: React.MouseEvent,
    comp: CircuitComponent,
    term: CircuitTerminal,
  ) => {
    e.stopPropagation();

    if (probeActive && onProbeTerminal) {
      const sig = evalResult.terminalSignals[term.id] ?? 'FLOATING';
      onProbeTerminal(term, sig);
      return;
    }

    if (!activeWireStart) {
      // Start wire
      setActiveWireStart({
        compId: comp.id,
        termId: term.id,
        termType: term.type,
      });
    } else {
      // Connect wire if valid opposite direction and different component
      if (
        activeWireStart.compId !== comp.id &&
        activeWireStart.termType !== term.type
      ) {
        const from =
          activeWireStart.termType === 'output'
            ? { componentId: activeWireStart.compId, terminalId: activeWireStart.termId }
            : { componentId: comp.id, terminalId: term.id };

        const to =
          activeWireStart.termType === 'input'
            ? { componentId: activeWireStart.compId, terminalId: activeWireStart.termId }
            : { componentId: comp.id, terminalId: term.id };

        // Check if wire already exists
        const exists = graph.wires.some(
          (w) => w.from.terminalId === from.terminalId && w.to.terminalId === to.terminalId,
        );

        if (!exists) {
          const newWire = createWire(
            from.componentId,
            from.terminalId,
            to.componentId,
            to.terminalId,
          );
          pushHistory({ ...graph, wires: [...graph.wires, newWire] });
        }
      }
      setActiveWireStart(null);
    }
  };

  // Compute terminal absolute canvas coordinates
  const getTerminalCoords = (termId: string) => {
    for (const comp of graph.components) {
      const inTerm = comp.inputs.find((t) => t.id === termId);
      if (inTerm) {
        return {
          x: comp.x + inTerm.relativePos.x,
          y: comp.y + inTerm.relativePos.y,
        };
      }
      const outTerm = comp.outputs.find((t) => t.id === termId);
      if (outTerm) {
        return {
          x: comp.x + outTerm.relativePos.x,
          y: comp.y + outTerm.relativePos.y,
        };
      }
    }
    return { x: 0, y: 0 };
  };

  // Wire color mapping
  const getWireColor = (wire: CircuitWire) => {
    const sig = evalResult.wireSignals[wire.id];
    if (sig === 1) return '#22C55E'; // High: bright solid green
    if (sig === 0) return '#64748B'; // Low: slate
    if (sig === 'INVALID') return '#F43F5E'; // Conflict: coral red
    return '#FBBF24'; // Floating: amber
  };

  return (
    <div
      ref={containerRef}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="relative w-full h-full min-h-[500px] bg-[#F8FAFC] overflow-hidden select-none cursor-crosshair touch-none"
      style={{
        backgroundImage: snapToGrid
          ? 'radial-gradient(circle, rgba(0,0,0,0.12) 1.2px, transparent 1.2px)'
          : 'none',
        backgroundSize: `${GRID_SIZE * zoom}px ${GRID_SIZE * zoom}px`,
        backgroundPosition: `${pan.x}px ${pan.y}px`,
      }}
    >
      {/* Floating Canvas Controls */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg border border-zinc-200 shadow-md text-zinc-800">
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.15, 2.5))}
          title="Zoom In"
          className="p-1.5 hover:bg-zinc-100 rounded text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.15, 0.4))}
          title="Zoom Out"
          className="p-1.5 hover:bg-zinc-100 rounded text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 40, y: 30 });
          }}
          title="Fit / Reset View"
          className="p-1.5 hover:bg-zinc-100 rounded text-zinc-700 hover:text-zinc-900 transition-colors text-xs font-mono px-2 font-bold"
        >
          {Math.round(zoom * 100)}%
        </button>
        <div className="w-[1px] h-4 bg-zinc-300 mx-1" />
        <button
          onClick={handleUndo}
          disabled={historyIdx === 0}
          title="Undo (Ctrl+Z)"
          className="p-1.5 hover:bg-zinc-100 disabled:opacity-30 rounded text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={handleRedo}
          disabled={historyIdx >= history.length - 1}
          title="Redo (Ctrl+Y)"
          className="p-1.5 hover:bg-zinc-100 disabled:opacity-30 rounded text-zinc-600 hover:text-zinc-900 transition-colors"
        >
          <Redo2 className="w-4 h-4" />
        </button>
        <div className="w-[1px] h-4 bg-zinc-300 mx-1" />
        <button
          onClick={() => setSnapToGrid(!snapToGrid)}
          title="Toggle Grid Snap"
          className={`px-2 py-1 text-xs font-bold rounded transition-colors ${
            snapToGrid ? 'bg-[#06B6D4] text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          Grid
        </button>
        {selectedCompId && (
          <button
            onClick={() => {
              const newComps = graph.components.filter((c) => c.id !== selectedCompId);
              const newWires = graph.wires.filter(
                (w) => w.from.componentId !== selectedCompId && w.to.componentId !== selectedCompId,
              );
              pushHistory({ components: newComps, wires: newWires });
              setSelectedCompId(null);
            }}
            title="Delete Selected Component"
            className="p-1.5 bg-red-600/80 hover:bg-red-600 rounded text-white transition-colors ml-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Circuit SVG Layer */}
      <svg
        className="w-full h-full absolute inset-0 overflow-visible pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
        }}
      >
        <defs>
          <filter id="glow-high" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Established Circuit Wires */}
        {graph.wires.map((wire) => {
          const fromPt = getTerminalCoords(wire.from.terminalId);
          const toPt = getTerminalCoords(wire.to.terminalId);
          const color = getWireColor(wire);
          const isSelected = selectedWireId === wire.id;
          const isHigh = evalResult.wireSignals[wire.id] === 1;

          // Smooth cubic bezier routing
          const dx = Math.abs(toPt.x - fromPt.x);
          const controlOffset = Math.max(dx * 0.5, 40);
          const pathD = `M ${fromPt.x} ${fromPt.y} C ${fromPt.x + controlOffset} ${fromPt.y}, ${toPt.x - controlOffset} ${toPt.y}, ${toPt.x} ${toPt.y}`;

          return (
            <g
              key={wire.id}
              className="pointer-events-auto cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedWireId(wire.id);
                setSelectedCompId(null);
              }}
            >
              {/* Invisible wide hit area */}
              <path d={pathD} fill="none" stroke="transparent" strokeWidth="14" />
              {/* Wire visible stroke */}
              <path
                d={pathD}
                fill="none"
                stroke={isSelected ? '#EC4899' : color}
                strokeWidth={isSelected ? '3.5' : '2.5'}
                strokeDasharray={
                  evalResult.wireSignals[wire.id] === 'FLOATING' ? '5,4' : undefined
                }
                filter={isHigh ? 'url(#glow-high)' : undefined}
                className="transition-colors duration-150"
              />
              {/* Animated pulse dots when signal is HIGH */}
              {isHigh && (
                <circle r="3.5" fill="#FFFFFF">
                  <animateMotion path={pathD} dur="1.4s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          );
        })}

        {/* Active Wire Connection Drawing */}
        {activeWireStart && (
          <path
            d={`M ${getTerminalCoords(activeWireStart.termId).x} ${
              getTerminalCoords(activeWireStart.termId).y
            } L ${cursorPos.x} ${cursorPos.y}`}
            fill="none"
            stroke="#06B6D4"
            strokeWidth="2.5"
            strokeDasharray="4,4"
            className="pointer-events-none animate-pulse"
          />
        )}
      </svg>

      {/* Interactive Component Nodes Layer */}
      <div
        className="absolute inset-0 origin-top-left pointer-events-none"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
        }}
      >
        {graph.components.map((comp) => {
          const isSelected = selectedCompId === comp.id;

          return (
            <div
              key={comp.id}
              style={{
                left: `${comp.x}px`,
                top: `${comp.y}px`,
                width: `${comp.width}px`,
                height: `${comp.height}px`,
              }}
              onMouseDown={(e) => {
                if (e.button === 0) {
                  e.stopPropagation();
                  setSelectedCompId(comp.id);
                  setSelectedWireId(null);
                  setDraggedCompId(comp.id);
                  const coords = clientToCanvas(e.clientX, e.clientY);
                  setDragOffset({ x: coords.x - comp.x, y: coords.y - comp.y });
                }
              }}
              className={`absolute pointer-events-auto rounded-lg select-none transition-shadow ${
                isSelected
                  ? 'ring-2 ring-pink-500 shadow-xl'
                  : 'hover:ring-1 hover:ring-zinc-500'
              }`}
            >
              {/* Component Visual Body */}
              {comp.type === 'INPUT_SWITCH' ? (
                <div
                  onClick={(e) => handleToggleSwitch(e, comp)}
                  className="w-full h-full bg-white border-2 border-zinc-300 rounded-lg p-1.5 flex flex-col justify-between cursor-pointer hover:border-[#06B6D4] transition-colors shadow-xs"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-700">
                    <span>{comp.label}</span>
                    <span
                      className={`w-2 h-2 rounded-full ${
                        comp.state?.switchState === 1 ? 'bg-emerald-500 shadow-xs' : 'bg-zinc-400'
                      }`}
                    />
                  </div>
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        comp.state?.switchState === 1
                          ? 'bg-[#22C55E] text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {comp.state?.switchState === 1 ? 'HIGH (1)' : 'LOW (0)'}
                    </span>
                  </div>
                </div>
              ) : comp.type === 'OUTPUT_LED' ? (
                <div className="w-full h-full bg-white border-2 border-zinc-300 rounded-lg p-1.5 flex flex-col justify-between items-center shadow-xs">
                  <span className="text-[10px] font-bold text-zinc-700 truncate w-full text-center">
                    {comp.label}
                  </span>
                  <div className="relative">
                    <div
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        evalResult.terminalSignals[`${comp.id}-in`] === 1
                          ? 'bg-emerald-500 border-white shadow-[0_0_12px_#22C55E]'
                          : evalResult.terminalSignals[`${comp.id}-in`] === 'FLOATING'
                          ? 'bg-amber-500/40 border-amber-500/80 border-dashed'
                          : evalResult.terminalSignals[`${comp.id}-in`] === 'INVALID'
                          ? 'bg-red-500 border-white'
                          : 'bg-zinc-200 border-zinc-300'
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-mono font-bold text-zinc-800">
                    {evalResult.terminalSignals[`${comp.id}-in`] === 1
                      ? '1'
                      : evalResult.terminalSignals[`${comp.id}-in`] === 0
                      ? '0'
                      : '—'}
                  </span>
                </div>
              ) : comp.type === 'LOGIC_PROBE' ? (
                <div className="w-full h-full bg-white border-2 border-[#06B6D4] rounded-lg p-1 flex flex-col justify-center items-center shadow-xs">
                  <span className="text-[9px] font-bold text-[#0891B2]">PROBE</span>
                  <span className="text-sm font-mono font-bold text-zinc-900">
                    {evalResult.terminalSignals[`${comp.id}-in`] === 1
                      ? '5.0V (1)'
                      : evalResult.terminalSignals[`${comp.id}-in`] === 0
                      ? '0.0V (0)'
                      : 'FLOAT'}
                  </span>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  {/* Gate SVG Silhouette */}
                  <GateSymbol
                    type={comp.type}
                    width={comp.width}
                    height={comp.height}
                    isActive={
                      comp.outputs[0] &&
                      evalResult.terminalSignals[comp.outputs[0].id] === 1
                    }
                  />
                  <span className="absolute bottom-[-16px] text-[10px] font-semibold text-zinc-400 pointer-events-none truncate max-w-[90px]">
                    {comp.label}
                  </span>
                </div>
              )}

              {/* Input Terminals */}
              {comp.inputs.map((term) => {
                const sig = evalResult.terminalSignals[term.id];
                const isHovered = hoveredTermId === term.id;
                const isConnected = graph.wires.some((w) => w.to.terminalId === term.id);

                return (
                  <div
                    key={term.id}
                    title={`${term.name}: ${sig ?? 'FLOATING'}`}
                    style={{
                      left: `${term.relativePos.x}px`,
                      top: `${term.relativePos.y}px`,
                    }}
                    onMouseEnter={() => setHoveredTermId(term.id)}
                    onMouseLeave={() => setHoveredTermId(null)}
                    onClick={(e) => handleTerminalClick(e, comp, term)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer z-10"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full border transition-all ${
                        sig === 1
                          ? 'bg-emerald-400 border-white shadow-sm'
                          : sig === 0
                          ? 'bg-slate-400 border-slate-600'
                          : sig === 'INVALID'
                          ? 'bg-red-500 border-white'
                          : 'bg-zinc-800 border-amber-400'
                      } ${isHovered ? 'scale-125 ring-2 ring-cyan-400' : ''}`}
                    />
                  </div>
                );
              })}

              {/* Output Terminals */}
              {comp.outputs.map((term) => {
                const sig = evalResult.terminalSignals[term.id];
                const isHovered = hoveredTermId === term.id;

                return (
                  <div
                    key={term.id}
                    title={`${term.name}: ${sig ?? 'FLOATING'}`}
                    style={{
                      left: `${term.relativePos.x}px`,
                      top: `${term.relativePos.y}px`,
                    }}
                    onMouseEnter={() => setHoveredTermId(term.id)}
                    onMouseLeave={() => setHoveredTermId(null)}
                    onClick={(e) => handleTerminalClick(e, comp, term)}
                    className="absolute -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center cursor-pointer z-10"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full border transition-all ${
                        sig === 1
                          ? 'bg-emerald-400 border-white shadow-sm'
                          : sig === 0
                          ? 'bg-slate-400 border-slate-600'
                          : 'bg-zinc-800 border-zinc-600'
                      } ${isHovered ? 'scale-125 ring-2 ring-cyan-400' : ''}`}
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Bottom Status & Diagnostic Strip */}
      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono pointer-events-none">
        <div className="flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 shadow-md">
          <span className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                evalResult.isValid ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <strong className="text-zinc-900">
              {evalResult.isValid ? 'Topological Evaluator Active' : 'Circuit Has Errors'}
            </strong>
          </span>
          <span className="text-zinc-400">&bull;</span>
          <span>
            Components: <strong className="text-zinc-900">{graph.components.length}</strong>
          </span>
          <span className="text-zinc-400">&bull;</span>
          <span>
            Wires: <strong className="text-zinc-900">{graph.wires.length}</strong>
          </span>
          {evalResult.floatingInputs.length > 0 && (
            <>
              <span className="text-zinc-400">&bull;</span>
              <span className="text-amber-600 font-bold">
                Floating: {evalResult.floatingInputs.length}
              </span>
            </>
          )}
        </div>

        <div className="hidden sm:flex items-center gap-2 bg-white/95 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-600 text-[11px] shadow-md">
          <span>Click switch to toggle</span>
          <span className="text-zinc-300">&bull;</span>
          <span>Click terminals to wire</span>
          <span className="text-zinc-300">&bull;</span>
          <span>Del key to remove</span>
        </div>
      </div>
    </div>
  );
};
