'use client';

import React from 'react';
import type { DipConfig } from './experiment-configs';
import type { LogicLevel } from '@prismora/simulation-core';

interface DipIcVisualizerProps {
  config: DipConfig;
  livePinValues?: Record<number, LogicLevel | 'VCC' | 'GND' | 'CLK' | 'X'>;
  className?: string;
}

export function DipIcVisualizer({
  config,
  livePinValues = {},
  className = '',
}: DipIcVisualizerProps) {
  const pinCount = config.pinCount;
  const half = pinCount / 2;

  // Left pins: 1 to half (top to bottom)
  const leftPins = config.pins.filter((p) => p.number <= half).sort((a, b) => a.number - b.number);
  // Right pins: pinCount down to half + 1 (top to bottom)
  const rightPins = config.pins.filter((p) => p.number > half).sort((a, b) => b.number - a.number);

  const getPinColor = (pinNum: number) => {
    const val = livePinValues[pinNum];
    if (val === 'VCC') return { bg: 'bg-rose-500', glow: 'shadow-[0_0_8px_#f43f5e]', text: 'VCC (+5V)' };
    if (val === 'GND') return { bg: 'bg-zinc-800', glow: '', text: 'GND (0V)' };
    if (val === 'CLK') return { bg: 'bg-amber-400 animate-pulse', glow: 'shadow-[0_0_8px_#fbbf24]', text: 'CLK PULSE' };
    if (val === 1) return { bg: 'bg-emerald-500', glow: 'shadow-[0_0_8px_#10b981]', text: 'HIGH (1)' };
    if (val === 0) return { bg: 'bg-zinc-300 dark:bg-zinc-700', glow: '', text: 'LOW (0)' };
    if (val === 'X') return { bg: 'bg-amber-500', glow: 'shadow-[0_0_8px_#f59e0b]', text: 'INDETERMINATE' };

    // Default pin type color
    const pin = config.pins.find((p) => p.number === pinNum);
    if (pin?.type === 'power') return { bg: 'bg-rose-500', glow: '', text: '+5V' };
    if (pin?.type === 'ground') return { bg: 'bg-zinc-800', glow: '', text: '0V' };
    return { bg: 'bg-zinc-300 dark:bg-zinc-700', glow: '', text: '0' };
  };

  return (
    <div className={`p-4 bg-zinc-900 border border-zinc-700 rounded-xl text-white select-none shadow-md ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-800 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm font-bold text-cyan-400">{config.chipName}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
              DIP-{pinCount}
            </span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-0.5">{config.description}</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]" /> HIGH
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-zinc-600" /> LOW
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> VCC
          </span>
        </div>
      </div>

      {/* Main DIP Chip Graphic & Breadboard Rails */}
      <div className="relative flex justify-center py-4">
        {/* Breadboard VCC Rail (Left) */}
        <div className="hidden sm:flex flex-col justify-between items-center mr-6 py-2 px-1 border-r-2 border-rose-500/40 text-[9px] font-mono text-rose-400">
          <span>+5V</span>
          <div className="flex-1 w-0.5 bg-rose-500/20 my-2" />
          <span>VCC</span>
        </div>

        {/* Central IC Body */}
        <div className="relative w-64 bg-zinc-950 border-2 border-zinc-700 rounded-lg shadow-2xl py-6 px-3">
          {/* Top Notch for Orientation */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-3 bg-zinc-900 border-b border-x border-zinc-700 rounded-b-full shadow-inner" />
          {/* Pin 1 Dot Marker */}
          <div className="absolute top-4 left-3 w-2 h-2 rounded-full bg-zinc-800 border border-zinc-600" />

          {/* Silkscreen Label in Center */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
            <span className="font-mono text-xs font-bold tracking-widest text-zinc-300">TI 74LS SERIES</span>
            <span className="font-mono text-[10px] text-zinc-400">{config.chipName.split(' ')[0]}</span>
          </div>

          {/* Dual Pin Rows */}
          <div className="space-y-4 relative z-10">
            {leftPins.map((leftPin, idx) => {
              const rightPin = rightPins[idx];
              const leftState = getPinColor(leftPin.number);
              const rightState = rightPin ? getPinColor(rightPin.number) : null;

              return (
                <div key={leftPin.number} className="flex items-center justify-between">
                  {/* Left Pin */}
                  <div className="flex items-center gap-2 group relative">
                    {/* Metallic Pin Lead Out */}
                    <div className="w-3 h-2 bg-gradient-to-r from-zinc-400 to-zinc-600 rounded-l" />
                    {/* Pin Status LED */}
                    <div
                      className={`w-3.5 h-3.5 rounded-full border border-zinc-800 transition-all ${leftState.bg} ${leftState.glow} flex items-center justify-center text-[8px] font-bold text-zinc-950`}
                      title={`Pin ${leftPin.number}: ${leftPin.label} (${leftPin.description}) — ${leftState.text}`}
                    >
                      {livePinValues[leftPin.number] === 1 ? '1' : livePinValues[leftPin.number] === 0 ? '0' : ''}
                    </div>
                    {/* Pin Number & Label */}
                    <span className="font-mono text-[11px] font-semibold text-zinc-300 group-hover:text-cyan-400 transition-colors">
                      <span className="text-zinc-500 text-[9px] mr-1">{leftPin.number}</span>
                      {leftPin.label}
                    </span>
                  </div>

                  {/* Right Pin */}
                  {rightPin && (
                    <div className="flex items-center gap-2 group relative flex-row-reverse">
                      {/* Metallic Pin Lead Out */}
                      <div className="w-3 h-2 bg-gradient-to-l from-zinc-400 to-zinc-600 rounded-r" />
                      {/* Pin Status LED */}
                      <div
                        className={`w-3.5 h-3.5 rounded-full border border-zinc-800 transition-all ${rightState?.bg} ${rightState?.glow} flex items-center justify-center text-[8px] font-bold text-zinc-950`}
                        title={`Pin ${rightPin.number}: ${rightPin.label} (${rightPin.description}) — ${rightState?.text}`}
                      >
                        {livePinValues[rightPin.number] === 1 ? '1' : livePinValues[rightPin.number] === 0 ? '0' : ''}
                      </div>
                      {/* Pin Number & Label */}
                      <span className="font-mono text-[11px] font-semibold text-zinc-300 group-hover:text-cyan-400 transition-colors">
                        {rightPin.label}
                        <span className="text-zinc-500 text-[9px] ml-1">{rightPin.number}</span>
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Breadboard GND Rail (Right) */}
        <div className="hidden sm:flex flex-col justify-between items-center ml-6 py-2 px-1 border-l-2 border-blue-500/40 text-[9px] font-mono text-blue-400">
          <span>0V</span>
          <div className="flex-1 w-0.5 bg-blue-500/20 my-2" />
          <span>GND</span>
        </div>
      </div>
    </div>
  );
}
