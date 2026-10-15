/**
 * Prismora ECE Virtual Lab — Multi-Channel Digital Logic Analyzer
 * Real-time synchronous digital oscilloscope / logic analyzer recording discrete
 * signal transitions across inputs and outputs with timeline cursors.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Activity, Clock, RotateCcw } from 'lucide-react';

export interface LogicSample {
  timeIndex: number;
  timestamp: string;
  signals: Record<string, 0 | 1 | 'FLOATING'>;
}

interface LogicAnalyzerProps {
  currentSignals: Record<string, 0 | 1 | 'FLOATING'>;
  channels: { id: string; name: string; color: string }[];
}

export const LogicAnalyzer: React.FC<LogicAnalyzerProps> = ({
  currentSignals,
  channels,
}) => {
  const [samples, setSamples] = useState<LogicSample[]>([
    {
      timeIndex: 0,
      timestamp: '0ns',
      signals: currentSignals,
    },
  ]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const prevSignalsRef = useRef<string>(JSON.stringify(currentSignals));

  // Whenever currentSignals changes, record a new logic transition sample
  useEffect(() => {
    const curStr = JSON.stringify(currentSignals);
    if (curStr !== prevSignalsRef.current) {
      prevSignalsRef.current = curStr;
      setSamples((prev) => {
        const nextTimeIdx = prev.length;
        const newSample: LogicSample = {
          timeIndex: nextTimeIdx,
          timestamp: `${nextTimeIdx * 10}ns`,
          signals: { ...currentSignals },
        };
        const next = [...prev, newSample];
        return next.slice(-25); // retain last 25 samples
      });
    }
  }, [currentSignals]);

  const handleClear = () => {
    setSamples([
      {
        timeIndex: 0,
        timestamp: '0ns',
        signals: currentSignals,
      },
    ]);
  };

  const sampleCount = samples.length;
  const colWidth = Math.max(28, Math.min(45, 600 / Math.max(sampleCount, 1)));
  const trackHeight = 32;

  return (
    <div className="flex flex-col h-full bg-[#111827] border-t border-zinc-800 p-3 select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">
            Multi-Channel Digital Logic Analyzer
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
            {samples.length} Transition Events
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            className="text-[11px] font-bold text-zinc-400 hover:text-white px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 transition-colors flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Waveform Canvas Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[#090D16] rounded-lg border border-zinc-800 p-2 flex flex-col justify-between">
        {channels.map((chan) => {
          return (
            <div key={chan.id} className="flex items-center gap-3 h-8">
              {/* Channel Label */}
              <div className="w-20 shrink-0 flex items-center justify-between">
                <span className="text-xs font-mono font-bold" style={{ color: chan.color }}>
                  {chan.name}
                </span>
                <span className="text-[10px] font-mono text-zinc-500">
                  {currentSignals[chan.id] ?? 0}
                </span>
              </div>

              {/* Digital Waveform Trace */}
              <div className="flex-1 relative h-6 bg-[#182030]/60 rounded overflow-hidden flex items-center">
                <svg
                  className="w-full h-full"
                  viewBox={`0 0 ${Math.max(samples.length * colWidth, 300)} 24`}
                  preserveAspectRatio="none"
                >
                  {/* Grid Lines */}
                  {samples.map((_, i) => (
                    <line
                      key={i}
                      x1={i * colWidth}
                      y1="0"
                      x2={i * colWidth}
                      y2="24"
                      stroke="#27272A"
                      strokeWidth="1"
                    />
                  ))}

                  {/* Signal Waveform Path */}
                  {(() => {
                    if (samples.length === 0) return null;
                    let d = '';

                    for (let i = 0; i < samples.length; i++) {
                      const val = samples[i]!.signals[chan.id];
                      const y = val === 1 ? 4 : 20; // 4 is HIGH, 20 is LOW
                      const x1 = i * colWidth;
                      const x2 = (i + 1) * colWidth;

                      if (i === 0) {
                        d += `M ${x1} ${y} L ${x2} ${y}`;
                      } else {
                        // Rising or falling vertical edge then horizontal
                        d += ` L ${x1} ${y} L ${x2} ${y}`;
                      }
                    }

                    return (
                      <path
                        d={d}
                        fill="none"
                        stroke={chan.color}
                        strokeWidth="2.5"
                        strokeLinecap="square"
                        strokeLinejoin="miter"
                      />
                    );
                  })()}
                </svg>
              </div>
            </div>
          );
        })}

        {/* Time Axis Bar */}
        <div className="flex items-center gap-3 pt-1 border-t border-zinc-800 text-[10px] font-mono text-zinc-500">
          <div className="w-20 shrink-0 text-zinc-400 font-bold">Time (t)</div>
          <div className="flex-1 flex justify-between pr-2">
            {samples.map((s, i) => (
              <span key={i} style={{ width: `${colWidth}px` }} className="text-center truncate">
                {s.timestamp}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
