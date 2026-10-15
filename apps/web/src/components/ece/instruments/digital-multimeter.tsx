/**
 * Prismora Professional Virtual Instruments — Digital Multimeter (DMM)
 *
 * Renders an authentic laboratory digital multimeter with:
 * - High-contrast LCD digital screen with dynamic units (V, mV, A, mA, Ohm, kOhm)
 * - Rotary selector dial for DCV, ACV, DCA, Resistance, and Continuity modes
 * - Dual test probe inputs: Red (+) V/Ohm/mA and Black (-) COM
 * - Real numerical measurement extraction from circuit nodes
 */

'use client';

import React, { useState } from 'react';
import { Volume2, Zap } from 'lucide-react';

export type DMMMode = 'DCV' | 'ACV' | 'DCA' | 'RES' | 'CONT';

export interface DigitalMultimeterProps {
  measuredVoltage?: number; // In Volts
  measuredCurrent?: number; // In Amperes
  measuredResistance?: number; // In Ohms
  probeNodeA?: string;
  probeNodeB?: string;
  onSelectProbeNodeA?: (nodeId: string) => void;
  onSelectProbeNodeB?: (nodeId: string) => void;
  availableNodes?: string[];
  className?: string;
}

export const DigitalMultimeter: React.FC<DigitalMultimeterProps> = ({
  measuredVoltage = 0,
  measuredCurrent = 0,
  measuredResistance = 0,
  probeNodeA = 'n1',
  probeNodeB = 'gnd',
  onSelectProbeNodeA,
  onSelectProbeNodeB,
  availableNodes = ['n1', 'n2', 'gnd'],
  className = '',
}) => {
  const [mode, setMode] = useState<DMMMode>('DCV');

  // Format readout based on mode
  let displayValue = '0.00';
  let unit = 'V';
  let isContinuityBeep = false;

  if (mode === 'DCV') {
    const absV = Math.abs(measuredVoltage);
    if (absV < 1.0 && absV > 1e-4) {
      displayValue = (measuredVoltage * 1000).toFixed(1);
      unit = 'mV';
    } else {
      displayValue = measuredVoltage.toFixed(2);
      unit = 'V';
    }
  } else if (mode === 'ACV') {
    const acRms = Math.abs(measuredVoltage) / Math.SQRT2;
    displayValue = acRms.toFixed(2);
    unit = 'Vrms';
  } else if (mode === 'DCA') {
    const absI = Math.abs(measuredCurrent);
    if (absI < 1.0) {
      displayValue = (measuredCurrent * 1000).toFixed(1);
      unit = 'mA';
    } else {
      displayValue = measuredCurrent.toFixed(3);
      unit = 'A';
    }
  } else if (mode === 'RES') {
    const r = Math.max(0, measuredResistance);
    if (r >= 1e6) {
      displayValue = (r / 1e6).toFixed(2);
      unit = 'MΩ';
    } else if (r >= 1e3) {
      displayValue = (r / 1e3).toFixed(2);
      unit = 'kΩ';
    } else if (r > 1e7) {
      displayValue = 'O.L'; // Open Loop / Overload
      unit = 'Ω';
    } else {
      displayValue = r.toFixed(1);
      unit = 'Ω';
    }
  } else if (mode === 'CONT') {
    const r = Math.max(0, measuredResistance);
    if (r < 10) {
      displayValue = r.toFixed(1);
      unit = 'Ω';
      isContinuityBeep = true;
    } else {
      displayValue = 'O.L';
      unit = 'Ω';
      isContinuityBeep = false;
    }
  }

  return (
    <div
      className={`bg-[#F59E0B] border-4 border-[#D97706] rounded-2xl p-3 shadow-lg w-72 text-zinc-900 select-none ${className}`}
    >
      {/* Brand & Model Banner */}
      <div className="flex items-center justify-between border-b border-amber-600/40 pb-1 mb-2">
        <span className="text-[11px] font-black tracking-widest font-mono text-zinc-900">
          PRISMORA DMM-800
        </span>
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-900 text-amber-400 font-mono">
          TRUE RMS
        </span>
      </div>

      {/* Large LCD Digital Display Screen */}
      <div className="bg-[#CBD5E1] border-2 border-zinc-700 rounded-lg p-2.5 mb-3 shadow-inner relative flex flex-col items-end">
        {/* Annunciator Icons */}
        <div className="w-full flex items-center justify-between text-[10px] font-mono text-zinc-600 font-bold mb-0.5">
          <span>{mode}</span>
          {isContinuityBeep && (
            <span className="flex items-center gap-1 text-emerald-800 animate-pulse">
              <Volume2 className="w-3 h-3" />
              <span>BEEP!</span>
            </span>
          )}
          <span>AUTO</span>
        </div>

        {/* Big 7-Segment Value */}
        <div className="text-3xl font-mono font-bold text-zinc-900 tracking-wider">
          {displayValue}
          <span className="text-sm ml-1 font-semibold text-zinc-700">{unit}</span>
        </div>
      </div>

      {/* Mode Selector Buttons */}
      <div className="grid grid-cols-5 gap-1 mb-3">
        {(
          [
            { id: 'DCV', label: 'V ⎓' },
            { id: 'ACV', label: 'V ~' },
            { id: 'DCA', label: 'A ⎓' },
            { id: 'RES', label: 'Ω' },
            { id: 'CONT', label: '•)))' },
          ] as const
        ).map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`py-1 rounded text-xs font-bold font-mono transition-colors border ${
              mode === m.id
                ? 'bg-zinc-900 text-amber-400 border-zinc-900 shadow-xs'
                : 'bg-white/80 text-zinc-800 border-amber-600/30 hover:bg-white'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Probe Connection Selector Points */}
      <div className="bg-white/90 border border-amber-600/30 rounded-lg p-2 space-y-2 mb-2">
        <div className="text-[10px] font-bold text-zinc-700 uppercase tracking-wider flex items-center gap-1">
          <Zap className="w-3 h-3 text-[#2563EB]" />
          <span>Probe Test Points</span>
        </div>

        <div className="flex items-center justify-between text-xs font-mono">
          {/* Red Probe (+) */}
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#EF4444] border border-red-700 shadow-xs" />
            <span className="font-bold text-red-600">RED (+):</span>
            <select
              value={probeNodeA}
              onChange={(e) => onSelectProbeNodeA?.(e.target.value)}
              className="bg-zinc-100 border border-zinc-300 rounded px-1.5 py-0.5 text-xs font-bold text-zinc-900 focus:outline-hidden"
            >
              {availableNodes.map((n) => (
                <option key={n} value={n}>
                  {n === 'gnd' ? 'GND (0V)' : `Node ${n}`}
                </option>
              ))}
            </select>
          </div>

          {/* Black Probe (-) COM */}
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded-full bg-[#1E293B] border border-black shadow-xs" />
            <span className="font-bold text-zinc-800">BLK (-):</span>
            <select
              value={probeNodeB}
              onChange={(e) => onSelectProbeNodeB?.(e.target.value)}
              className="bg-zinc-100 border border-zinc-300 rounded px-1.5 py-0.5 text-xs font-bold text-zinc-900 focus:outline-hidden"
            >
              {availableNodes.map((n) => (
                <option key={n} value={n}>
                  {n === 'gnd' ? 'GND (0V)' : `Node ${n}`}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bottom Banana Jack Terminals */}
      <div className="flex items-center justify-around border-t border-amber-600/40 pt-2">
        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-[#EF4444] border-2 border-red-700 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-900" />
          </div>
          <span className="text-[9px] font-mono font-bold text-red-800 mt-0.5">V / Ω</span>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-5 h-5 rounded-full bg-[#1E293B] border-2 border-black flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-900" />
          </div>
          <span className="text-[9px] font-mono font-bold text-zinc-900 mt-0.5">COM</span>
        </div>
      </div>
    </div>
  );
};
