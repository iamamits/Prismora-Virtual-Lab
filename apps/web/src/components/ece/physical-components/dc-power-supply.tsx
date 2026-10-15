/**
 * Prismora Physical Component Library — Benchtop Variable DC Power Supply
 *
 * Renders an authentic laboratory bench power supply with:
 * - Dual 7-segment digital readouts for Output Voltage (V) and Current (A)
 * - Coarse and fine voltage adjustment knobs
 * - Illuminated green power on/off rocker switch
 * - Heavy-duty binding posts (Red = + positive, Black = - ground/negative)
 */

'use client';

import React from 'react';
import { Power } from 'lucide-react';

export interface DCPowerSupplyProps {
  id?: string;
  voltage: number; // Configured voltage (0 to 30V)
  currentLimit?: number; // Configured current limit
  measuredCurrent?: number; // Actual circuit current in Amps
  isOn?: boolean;
  onVoltageChange?: (v: number) => void;
  onTogglePower?: () => void;
  className?: string;
}

export const DCPowerSupply: React.FC<DCPowerSupplyProps> = ({
  voltage = 12.0,
  measuredCurrent = 0,
  isOn = true,
  onVoltageChange,
  onTogglePower,
  className = '',
}) => {
  return (
    <div
      className={`bg-zinc-100 border-2 border-zinc-300 rounded-xl p-3 shadow-md w-64 select-none ${className}`}
    >
      {/* Top Banner / Brand */}
      <div className="flex items-center justify-between border-b border-zinc-300 pb-1.5 mb-2">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#06B6D4]" />
          <span className="text-[11px] font-bold text-zinc-900 tracking-wider uppercase font-mono">
            PRISMORA PS-3005D
          </span>
        </div>
        <span className="text-[9px] font-bold px-1 py-0.5 rounded bg-zinc-200 text-zinc-700">
          0-30V / 5A
        </span>
      </div>

      {/* Dual Digital LED Readout Screen */}
      <div className="bg-[#0F172A] border border-zinc-800 rounded-lg p-2.5 mb-3 flex items-center justify-between shadow-inner">
        {/* Voltage Display (Red 7-Segment Glow) */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
            VOLTAGE
          </span>
          <div className="text-xl font-mono font-bold text-[#F43F5E] tracking-wider drop-shadow-sm">
            {isOn ? voltage.toFixed(2) : '00.00'}
            <span className="text-xs ml-0.5 font-normal text-red-400">V</span>
          </div>
        </div>

        <div className="w-[1px] h-8 bg-zinc-700" />

        {/* Current Display (Green 7-Segment Glow) */}
        <div className="flex flex-col items-center">
          <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
            CURRENT
          </span>
          <div className="text-xl font-mono font-bold text-[#22C55E] tracking-wider drop-shadow-sm">
            {isOn ? measuredCurrent.toFixed(3) : '0.000'}
            <span className="text-xs ml-0.5 font-normal text-emerald-400">A</span>
          </div>
        </div>
      </div>

      {/* Voltage Controls Slider & Step Buttons */}
      <div className="space-y-1.5 mb-3">
        <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-700">
          <span>Voltage Adjust</span>
          <span className="font-mono text-xs font-bold text-[#2563EB]">
            {voltage.toFixed(1)} V
          </span>
        </div>
        <input
          type="range"
          min="0"
          max="30"
          step="0.5"
          value={voltage}
          disabled={!isOn}
          onChange={(e) => onVoltageChange?.(parseFloat(e.target.value))}
          className="w-full accent-[#2563EB] cursor-pointer h-1.5 bg-zinc-300 rounded-lg"
        />

        {/* Quick Voltage Presets */}
        <div className="flex items-center gap-1 justify-between pt-1">
          {[3.3, 5.0, 9.0, 12.0, 24.0].map((v) => (
            <button
              key={v}
              onClick={() => onVoltageChange?.(v)}
              disabled={!isOn}
              className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold border transition-colors ${
                Math.abs(voltage - v) < 0.1
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
              }`}
            >
              {v}V
            </button>
          ))}
        </div>
      </div>

      {/* Bottom Panel: Power Switch & Output Terminals */}
      <div className="flex items-center justify-between border-t border-zinc-300 pt-2.5">
        {/* Power Rocker Switch */}
        <button
          onClick={onTogglePower}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-bold transition-all shadow-xs ${
            isOn
              ? 'bg-[#22C55E] text-white hover:bg-emerald-600'
              : 'bg-zinc-300 text-zinc-600 hover:bg-zinc-400'
          }`}
          title="Toggle Power Supply ON/OFF"
        >
          <Power className="w-3.5 h-3.5" />
          <span>{isOn ? 'ON' : 'OFF'}</span>
        </button>

        {/* Binding Post Terminals */}
        <div className="flex items-center gap-3">
          {/* Positive Binding Post (+) Red */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-[#EF4444] border-2 border-[#B91C1C] flex items-center justify-center shadow-xs">
              <div className="w-2 h-2 rounded-full bg-white/80" />
            </div>
            <span className="text-[10px] font-bold text-[#DC2626] font-mono mt-0.5">+ V</span>
          </div>

          {/* Ground / Negative Binding Post (-) Black */}
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 rounded-full bg-[#1E293B] border-2 border-[#0F172A] flex items-center justify-center shadow-xs">
              <div className="w-2 h-2 rounded-full bg-white/80" />
            </div>
            <span className="text-[10px] font-bold text-zinc-800 font-mono mt-0.5">- GND</span>
          </div>
        </div>
      </div>
    </div>
  );
};
