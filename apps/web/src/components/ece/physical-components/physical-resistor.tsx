/**
 * Prismora Physical Component Library — Ceramic Resistor with 4-Band Color Code
 *
 * Renders an authentic axial ceramic resistor with:
 * - Ceramic beige body with tapered ends
 * - Authentic 4-Band EIA standard color bands computed dynamically from the resistance value
 * - Axial tin-plated copper leads with connectable terminal terminals
 * - Live power dissipation and temperature indicator
 */

'use client';

import React from 'react';

export interface PhysicalResistorProps {
  id?: string;
  resistanceOhms: number; // Value in Ohms
  currentAmps?: number; // Live current
  voltageDrop?: number; // Live voltage drop
  powerWatts?: number; // Live power dissipation
  maxPowerRating?: number; // Rated wattage (e.g. 0.25W, 0.5W, 1W)
  label?: string;
  className?: string;
}

// EIA Standard Resistor Color Code mapping
const COLOR_DIGITS: Record<number, { name: string; color: string; textColor: string }> = {
  0: { name: 'Black', color: '#172033', textColor: '#FFFFFF' },
  1: { name: 'Brown', color: '#854D0E', textColor: '#FFFFFF' },
  2: { name: 'Red', color: '#DC2626', textColor: '#FFFFFF' },
  3: { name: 'Orange', color: '#EA580C', textColor: '#FFFFFF' },
  4: { name: 'Yellow', color: '#EAB308', textColor: '#172033' },
  5: { name: 'Green', color: '#16A34A', textColor: '#FFFFFF' },
  6: { name: 'Blue', color: '#2563EB', textColor: '#FFFFFF' },
  7: { name: 'Violet', color: '#9333EA', textColor: '#FFFFFF' },
  8: { name: 'Gray', color: '#64748B', textColor: '#FFFFFF' },
  9: { name: 'White', color: '#F8FAFC', textColor: '#172033' },
};

const MULTIPLIERS: Record<number, { name: string; color: string }> = {
  0: { name: 'Black (x1)', color: '#172033' },
  1: { name: 'Brown (x10)', color: '#854D0E' },
  2: { name: 'Red (x100)', color: '#DC2626' },
  3: { name: 'Orange (x1k)', color: '#EA580C' },
  4: { name: 'Yellow (x10k)', color: '#EAB308' },
  5: { name: 'Green (x100k)', color: '#16A34A' },
  6: { name: 'Blue (x1M)', color: '#2563EB' },
};

export const PhysicalResistor: React.FC<PhysicalResistorProps> = ({
  resistanceOhms,
  currentAmps = 0,
  voltageDrop = 0,
  powerWatts = 0,
  maxPowerRating = 0.5,
  label,
  className = '',
}) => {
  // Compute standard 4-band EIA colors:
  // Normalize resistance to 2 significant digits and multiplier
  const r = Math.max(0.1, resistanceOhms);
  const exponent = Math.floor(Math.log10(r));
  const normalized = r / Math.pow(10, exponent); // e.g. 1000 -> 1.0 (or 4.7 for 4700)
  const twoDigits = Math.round(normalized * 10); // e.g. 10 or 47

  const d1 = Math.floor(twoDigits / 10) % 10;
  const d2 = twoDigits % 10;
  const multIndex = Math.max(0, Math.min(6, exponent - 1));

  const band1 = COLOR_DIGITS[d1] ?? COLOR_DIGITS[1]!;
  const band2 = COLOR_DIGITS[d2] ?? COLOR_DIGITS[0]!;
  const band3 = MULTIPLIERS[multIndex] ?? MULTIPLIERS[1]!;
  const band4 = { name: 'Gold (5%)', color: '#D4AF37' }; // Gold tolerance

  // Power overload check
  const isOverheating = powerWatts > maxPowerRating;

  // Format readable resistance
  const formattedR =
    r >= 1e6
      ? `${(r / 1e6).toFixed(2)} MΩ`
      : r >= 1e3
        ? `${(r / 1e3).toFixed(2)} kΩ`
        : `${r.toFixed(1)} Ω`;

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* SVG Resistor Body */}
      <div className="relative w-48 h-20 flex items-center justify-center">
        <svg
          viewBox="0 0 200 80"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Overheating Smoke / Heatwaves if overloaded */}
          {isOverheating && (
            <g stroke="#DC2626" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 3">
              <path d="M 80 15 Q 85 5, 80 0" />
              <path d="M 100 15 Q 105 5, 100 0" />
              <path d="M 120 15 Q 125 5, 120 0" />
            </g>
          )}

          {/* Left Axial Metallic Lead */}
          <line x1="10" y1="40" x2="60" y2="40" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          {/* Terminal Dot A */}
          <circle cx="10" cy="40" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
          <text x="10" y="25" fill="#2563EB" fontSize="10" fontWeight="bold" textAnchor="middle">
            A
          </text>

          {/* Right Axial Metallic Lead */}
          <line x1="140" y1="40" x2="190" y2="40" stroke="#94A3B8" strokeWidth="4" strokeLinecap="round" />
          {/* Terminal Dot B */}
          <circle cx="190" cy="40" r="5" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
          <text x="190" y="25" fill="#F43F5E" fontSize="10" fontWeight="bold" textAnchor="middle">
            B
          </text>

          {/* Ceramic Resistor Body (Beige Cylinder with end bulges) */}
          <rect
            x="58"
            y="26"
            width="84"
            height="28"
            rx="12"
            fill="#EADBBF"
            stroke="#CBB38D"
            strokeWidth="2"
          />

          {/* Ceramic Highlight Curve */}
          <path d="M 64 30 L 136 30" stroke="#FFFFFF" strokeWidth="2" opacity="0.6" strokeLinecap="round" />

          {/* Color Band 1 (1st Digit) */}
          <rect x="74" y="26" width="6" height="28" fill={band1.color} />
          {/* Color Band 2 (2nd Digit) */}
          <rect x="88" y="26" width="6" height="28" fill={band2.color} />
          {/* Color Band 3 (Multiplier) */}
          <rect x="102" y="26" width="6" height="28" fill={band3.color} />
          {/* Color Band 4 (Tolerance Gold) */}
          <rect x="120" y="26" width="6" height="28" fill={band4.color} />
        </svg>
      </div>

      {/* Resistor Spec Card */}
      <div className="text-center bg-white border border-zinc-200 rounded-md p-1.5 shadow-xs w-full max-w-[170px]">
        <div className="text-xs font-bold text-zinc-900">{label ?? formattedR}</div>
        <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
          <span className="text-zinc-600">Voltage:</span>
          <span className="font-bold text-[#2563EB]">{voltageDrop.toFixed(2)} V</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-600">Current:</span>
          <span className="font-bold text-[#16A34A]">
            {Math.abs(currentAmps) >= 1
              ? `${currentAmps.toFixed(2)} A`
              : `${(currentAmps * 1000).toFixed(1)} mA`}
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-600">Power:</span>
          <span
            className="font-bold"
            style={{ color: isOverheating ? '#DC2626' : '#8B5CF6' }}
          >
            {powerWatts >= 1 ? `${powerWatts.toFixed(2)} W` : `${(powerWatts * 1000).toFixed(0)} mW`}
          </span>
        </div>
      </div>
    </div>
  );
};
