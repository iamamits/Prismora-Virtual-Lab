'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Ruler,
  Crosshair,
  Clock,
  Grid,
  Zap,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export interface PhetWorkbenchProps {
  title: string;
  subtitle?: string;
  disciplineColor?: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStep?: () => void;
  onReset: () => void;
  simTime: number;
  playbackSpeed: number;
  onSpeedChange: (speed: number) => void;
  // Tools
  showRuler?: boolean;
  onToggleRuler?: () => void;
  showStopwatch?: boolean;
  onToggleStopwatch?: () => void;
  showProbe?: boolean;
  onToggleProbe?: () => void;
  showGrid?: boolean;
  onToggleGrid?: () => void;
  showVectors?: boolean;
  onToggleVectors?: () => void;
  // Camera
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetCamera?: () => void;
  className?: string;
  children: React.ReactNode;
}

export function PhetWorkbench({
  title,
  subtitle,
  disciplineColor = '#38BDF8',
  isPlaying,
  onPlayPause,
  onStep,
  onReset,
  simTime,
  playbackSpeed,
  onSpeedChange,
  showRuler,
  onToggleRuler,
  showStopwatch,
  onToggleStopwatch,
  showProbe,
  onToggleProbe,
  showGrid,
  onToggleGrid,
  showVectors,
  onToggleVectors,
  onZoomIn,
  onZoomOut,
  onResetCamera,
  className = '',
  children,
}: PhetWorkbenchProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Floating Stopwatch internal state
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((t) => t + 0.05);
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl overflow-hidden ${className} ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none w-screen h-screen' : ''
      }`}
    >
      {/* 1. PhET Style Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs select-none">
        <div className="flex items-center gap-2">
          <span
            className="flex h-2.5 w-2.5 rounded-full animate-pulse"
            style={{ backgroundColor: disciplineColor }}
          />
          <span className="font-mono font-bold text-zinc-100">{title}</span>
          {subtitle && (
            <>
              <span className="text-zinc-600">|</span>
              <span className="font-mono text-zinc-400 hidden sm:inline">{subtitle}</span>
            </>
          )}
        </div>

        {/* Top Right Quick Tools */}
        <div className="flex items-center gap-1.5">
          {onToggleProbe && (
            <button
              onClick={onToggleProbe}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
                showProbe
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                  : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
              }`}
              title="Toggle Diagnostic Sensor Probe"
            >
              <Crosshair className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Probe</span>
            </button>
          )}

          {onToggleRuler && (
            <button
              onClick={onToggleRuler}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
                showRuler
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
              }`}
              title="Toggle Precision Tape Measure"
            >
              <Ruler className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Tape</span>
            </button>
          )}

          {onToggleStopwatch && (
            <button
              onClick={onToggleStopwatch}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
                showStopwatch
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
              }`}
              title="Toggle Digital Stopwatch"
            >
              <Clock className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Stopwatch</span>
            </button>
          )}

          {onToggleVectors && (
            <button
              onClick={onToggleVectors}
              className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
                showVectors
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                  : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
              }`}
              title="Toggle Force & Motion Vectors"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Vectors</span>
            </button>
          )}

          {onToggleGrid && (
            <button
              onClick={onToggleGrid}
              className={`p-1.5 rounded-md transition-all ${
                showGrid ? 'text-zinc-100 bg-zinc-800' : 'text-zinc-500 hover:bg-zinc-800/60'
              }`}
              title="Toggle Coordinate Grid"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Camera Controls */}
          {onZoomIn && (
            <button
              onClick={onZoomIn}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          )}
          {onZoomOut && (
            <button
              onClick={onZoomOut}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
          )}
          {onResetCamera && (
            <button
              onClick={onResetCamera}
              className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all"
              title="Reset View / Fit to Screen"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-all ml-1"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* 2. Interactive Canvas Viewport (Children) */}
      <div className="relative flex-1 w-full bg-[#0B1120] overflow-hidden min-h-[340px] sm:min-h-[420px]">
        {children}

        {/* Floating Draggable Stopwatch (if opened) */}
        {showStopwatch && (
          <div className="absolute top-4 left-4 z-20 p-2.5 rounded-xl bg-zinc-900/90 backdrop-blur-md border border-zinc-700 shadow-xl select-none font-mono text-xs w-44">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-zinc-400 font-bold uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                Stopwatch
              </span>
              <button
                onClick={onToggleStopwatch}
                className="text-zinc-500 hover:text-zinc-200 text-xs"
              >
                ✕
              </button>
            </div>
            <div className="text-center py-1 text-lg font-black text-emerald-400 tabular-nums bg-zinc-950/80 rounded border border-zinc-800 mb-2">
              {stopwatchTime.toFixed(2)} s
            </div>
            <div className="flex items-center justify-between gap-1.5 text-[10px]">
              <button
                onClick={() => setIsStopwatchRunning(!isStopwatchRunning)}
                className={`flex-1 py-1 rounded font-bold transition-all ${
                  isStopwatchRunning
                    ? 'bg-amber-600 hover:bg-amber-500 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                {isStopwatchRunning ? 'Stop' : 'Start'}
              </button>
              <button
                onClick={() => {
                  setIsStopwatchRunning(false);
                  setStopwatchTime(0);
                }}
                className="py-1 px-2.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. PhET-Grade Transport & Playback Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/95 border-t border-zinc-800 text-xs select-none">
        {/* Left: Play/Pause/Step/Stop Transport */}
        <div className="flex items-center gap-2">
          {/* Big Friendly Glow Play/Pause Button */}
          <button
            onClick={onPlayPause}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white font-mono text-xs font-bold transition-all shadow-lg active:scale-95 ${
              isPlaying
                ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
            }`}
          >
            {isPlaying ? (
              <>
                <Pause className="w-4 h-4 fill-white" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Play</span>
              </>
            )}
          </button>

          {/* Single Step Forward */}
          {onStep && (
            <button
              onClick={onStep}
              disabled={isPlaying}
              className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Step Forward (1 Frame)"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          )}

          {/* Stop / Rewind to t=0 */}
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono transition-all"
            title="Reset Simulation to Initial State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Center: Digital Simulation Clock */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-zinc-500 text-[11px] uppercase tracking-wider">Sim Time:</span>
          <div className="px-2.5 py-1 rounded-lg bg-zinc-950 border border-zinc-800 text-sky-400 font-black tabular-nums text-sm shadow-inner">
            {simTime.toFixed(2)} s
          </div>
        </div>

        {/* Right: PhET Style Normal vs Slow Motion Speed Selector */}
        <div className="flex items-center gap-2 font-mono">
          <span className="text-zinc-500 text-[11px] uppercase mr-1">Speed:</span>
          <div className="flex items-center rounded-xl bg-zinc-950 p-1 border border-zinc-800">
            <button
              onClick={() => onSpeedChange(0.25)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                playbackSpeed === 0.25 ? 'bg-indigo-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              0.25x
            </button>
            <button
              onClick={() => onSpeedChange(0.5)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                playbackSpeed === 0.5 ? 'bg-sky-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Slow (0.5x)
            </button>
            <button
              onClick={() => onSpeedChange(1.0)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                playbackSpeed === 1.0 ? 'bg-emerald-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Normal (1x)
            </button>
            <button
              onClick={() => onSpeedChange(2.0)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${
                playbackSpeed === 2.0 ? 'bg-amber-600 text-white shadow' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              2x
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
