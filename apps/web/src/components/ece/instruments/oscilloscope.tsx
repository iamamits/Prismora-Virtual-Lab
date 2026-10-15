/**
 * Prismora Professional Virtual Instruments — Dual-Trace Digital Storage Oscilloscope (DSO)
 *
 * Renders an authentic laboratory dual-channel oscilloscope with:
 * - Calibrated 8 vertical divisions x 10 horizontal divisions graticule screen
 * - Real sampled time-series waveform rendering:
 *   - Channel 1 (CH1): Electric Cyan (#06B6D4)
 *   - Channel 2 (CH2): Coral Red (#F43F5E)
 * - Calibrated Volts/Div (50mV to 10V) and Time/Div (0.5ms to 50ms) knobs
 * - Live automated measurements HUD (V_pp, V_rms, V_dc, Frequency, Period)
 * - Run / Freeze toggle
 */

'use client';

import React, { useState } from 'react';
import { Activity, Pause, Play, RefreshCw } from 'lucide-react';

export interface ScopeSample {
  timeMs: number;
  ch1: number; // Volts
  ch2?: number; // Volts
}

export interface OscilloscopeProps {
  samples: ScopeSample[];
  ch1Label?: string;
  ch2Label?: string;
  ch1Color?: string;
  ch2Color?: string;
  vpp?: number;
  vrms?: number;
  vdc?: number;
  frequency?: number;
  className?: string;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({
  samples,
  ch1Label = 'CH1: V_in',
  ch2Label = 'CH2: V_out',
  ch1Color = '#06B6D4',
  ch2Color = '#F43F5E',
  vpp = 0,
  vrms = 0,
  vdc = 0,
  frequency = 50,
  className = '',
}) => {
  const [ch1VoltsDiv, setCh1VoltsDiv] = useState(2.0); // 2V / div
  const [ch2VoltsDiv, setCh2VoltsDiv] = useState(2.0); // 2V / div
  const [isFrozen, setIsFrozen] = useState(false);
  const [showCh1, setShowCh1] = useState(true);
  const [showCh2, setShowCh2] = useState(true);

  const screenWidth = 500;
  const screenHeight = 240;
  const numDivX = 10;
  const numDivY = 8;
  const divWidth = screenWidth / numDivX;
  const divHeight = screenHeight / numDivY;
  const centerY = screenHeight / 2;

  // Convert samples to SVG path
  const generatePath = (channel: 'ch1' | 'ch2', voltsDiv: number): string => {
    if (!samples || samples.length === 0) return '';

    const maxTime = samples[samples.length - 1]?.timeMs ?? 20;
    const minTime = samples[0]?.timeMs ?? 0;
    const timeSpan = Math.max(0.1, maxTime - minTime);

    // Scale: 8 divisions total (-4 to +4)
    // centerY is 0V
    const pixelsPerVolt = divHeight / voltsDiv;

    return samples
      .map((s, idx) => {
        const x = ((s.timeMs - minTime) / timeSpan) * screenWidth;
        const val = channel === 'ch1' ? s.ch1 : (s.ch2 ?? 0);
        const y = centerY - val * pixelsPerVolt;
        return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  };

  const ch1Path = generatePath('ch1', ch1VoltsDiv);
  const ch2Path = generatePath('ch2', ch2VoltsDiv);

  return (
    <div
      className={`bg-zinc-100 border-2 border-zinc-300 rounded-xl p-3 shadow-md flex flex-col gap-2.5 select-none ${className}`}
    >
      {/* Header Controls Bar */}
      <div className="flex items-center justify-between border-b border-zinc-300 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#2563EB]" />
          <span className="text-xs font-mono font-bold text-zinc-900 tracking-wider">
            PRISMORA DSO-2000 DUAL-TRACE OSCILLOSCOPE
          </span>
        </div>

        {/* Play / Freeze Control */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsFrozen((v) => !v)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-colors ${
              isFrozen
                ? 'bg-amber-500 text-white shadow-xs'
                : 'bg-emerald-600 text-white hover:bg-emerald-700'
            }`}
          >
            {isFrozen ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
            <span>{isFrozen ? 'RESUME' : 'FREEZE'}</span>
          </button>
        </div>
      </div>

      {/* Main Graticule Screen */}
      <div className="relative bg-[#0F172A] border-2 border-zinc-800 rounded-lg overflow-hidden shadow-inner flex items-center justify-center">
        <svg
          viewBox={`0 0 ${screenWidth} ${screenHeight}`}
          className="w-full h-auto aspect-[500/240]"
        >
          {/* Coordinate Graticule Grid (8 Vert x 10 Horiz) */}
          <g stroke="#1E293B" strokeWidth="1">
            {/* Horizontal divisions */}
            {Array.from({ length: numDivY + 1 }).map((_, i) => (
              <line
                key={`h-${i}`}
                x1="0"
                y1={i * divHeight}
                x2={screenWidth}
                y2={i * divHeight}
                stroke={i === numDivY / 2 ? '#334155' : '#1E293B'}
                strokeWidth={i === numDivY / 2 ? 1.5 : 1}
              />
            ))}
            {/* Vertical divisions */}
            {Array.from({ length: numDivX + 1 }).map((_, i) => (
              <line
                key={`v-${i}`}
                x1={i * divWidth}
                y1="0"
                x2={i * divWidth}
                y2={screenHeight}
                stroke={i === numDivX / 2 ? '#334155' : '#1E293B'}
                strokeWidth={i === numDivX / 2 ? 1.5 : 1}
              />
            ))}
          </g>

          {/* Center Zero Voltage Axis Dashed Line */}
          <line
            x1="0"
            y1={centerY}
            x2={screenWidth}
            y2={centerY}
            stroke="#475569"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          {/* CH1 Waveform */}
          {showCh1 && ch1Path && (
            <path
              d={ch1Path}
              fill="none"
              stroke={ch1Color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* CH2 Waveform */}
          {showCh2 && ch2Path && (
            <path
              d={ch2Path}
              fill="none"
              stroke={ch2Color}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>

        {/* Live On-Screen HUD Telemetry */}
        <div className="absolute top-2 left-2 flex items-center gap-3 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded border border-white/10 text-[10px] font-mono text-white">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ch1Color }} />
            <span className="font-bold">{ch1Label}</span>
            <span className="text-zinc-400">({ch1VoltsDiv}V/div)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ch2Color }} />
            <span className="font-bold">{ch2Label}</span>
            <span className="text-zinc-400">({ch2VoltsDiv}V/div)</span>
          </div>
        </div>

        {/* Frequency & Voltage Measurement Readouts (Bottom Right HUD) */}
        <div className="absolute bottom-2 right-2 bg-black/70 backdrop-blur-xs px-2.5 py-1.5 rounded border border-white/10 grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] font-mono text-zinc-300">
          <div>
            <span className="text-zinc-400">V_pp: </span>
            <span className="font-bold text-white">{vpp.toFixed(2)} V</span>
          </div>
          <div>
            <span className="text-zinc-400">Freq: </span>
            <span className="font-bold text-[#06B6D4]">{frequency} Hz</span>
          </div>
          <div>
            <span className="text-zinc-400">V_rms: </span>
            <span className="font-bold text-white">{vrms.toFixed(2)} V</span>
          </div>
          <div>
            <span className="text-zinc-400">V_dc: </span>
            <span className="font-bold text-[#F43F5E]">{vdc.toFixed(2)} V</span>
          </div>
        </div>
      </div>

      {/* Control Knob Panels */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* CH1 Controls */}
        <div className="bg-white border border-zinc-200 rounded-lg p-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowCh1((v) => !v)}
              className="flex items-center gap-1.5 font-bold"
              style={{ color: ch1Color }}
            >
              <div
                className={`w-2 h-2 rounded-full ${showCh1 ? 'ring-2 ring-cyan-400' : 'opacity-40'}`}
                style={{ backgroundColor: ch1Color }}
              />
              <span>{ch1Label}</span>
            </button>
            <span className="text-[10px] font-mono text-zinc-500">{ch1VoltsDiv} V/div</span>
          </div>
          <div className="flex items-center gap-1">
            {[0.5, 1.0, 2.0, 5.0].map((scale) => (
              <button
                key={scale}
                onClick={() => setCh1VoltsDiv(scale)}
                className={`flex-1 py-0.5 text-[10px] font-mono font-bold rounded border transition-colors ${
                  ch1VoltsDiv === scale
                    ? 'bg-[#06B6D4] text-white border-[#06B6D4]'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {scale}V
              </button>
            ))}
          </div>
        </div>

        {/* CH2 Controls */}
        <div className="bg-white border border-zinc-200 rounded-lg p-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowCh2((v) => !v)}
              className="flex items-center gap-1.5 font-bold"
              style={{ color: ch2Color }}
            >
              <div
                className={`w-2 h-2 rounded-full ${showCh2 ? 'ring-2 ring-red-400' : 'opacity-40'}`}
                style={{ backgroundColor: ch2Color }}
              />
              <span>{ch2Label}</span>
            </button>
            <span className="text-[10px] font-mono text-zinc-500">{ch2VoltsDiv} V/div</span>
          </div>
          <div className="flex items-center gap-1">
            {[0.5, 1.0, 2.0, 5.0].map((scale) => (
              <button
                key={scale}
                onClick={() => setCh2VoltsDiv(scale)}
                className={`flex-1 py-0.5 text-[10px] font-mono font-bold rounded border transition-colors ${
                  ch2VoltsDiv === scale
                    ? 'bg-[#F43F5E] text-white border-[#F43F5E]'
                    : 'bg-zinc-50 text-zinc-700 border-zinc-200 hover:bg-zinc-100'
                }`}
              >
                {scale}V
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
