/**
 * Prismora Physical Component Library — Mechanical Knife Switch
 *
 * Renders an authentic laboratory single-pole single-throw (SPST) knife switch:
 * - Slate/ceramic insulated base plate
 * - Heavy-duty copper hinge pivot and contact jaw
 * - Articulated mechanical blade lever flipping between OPEN (45 deg) and CLOSED (0 deg)
 * - Clickable interaction toggling electrical continuity
 */

'use client';

import React from 'react';

export interface KnifeSwitchProps {
  id?: string;
  isOpen: boolean;
  onToggle?: () => void;
  label?: string;
  className?: string;
}

export const PhysicalKnifeSwitch: React.FC<KnifeSwitchProps> = ({
  isOpen = false,
  onToggle,
  label = 'SPST Knife Switch',
  className = '',
}) => {
  return (
    <div
      onClick={onToggle}
      className={`flex flex-col items-center cursor-pointer group select-none ${className}`}
      title={`Click to ${isOpen ? 'Close' : 'Open'} Knife Switch`}
    >
      <div className="relative w-40 h-24 flex items-center justify-center">
        <svg
          viewBox="0 0 160 90"
          className="w-full h-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Insulated Base Board */}
          <rect
            x="10"
            y="55"
            width="140"
            height="22"
            rx="4"
            fill="#334155"
            stroke="#1E293B"
            strokeWidth="2"
          />

          {/* Left Hinge Post Terminal (Terminal A) */}
          <rect x="25" y="42" width="16" height="15" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          <circle cx="33" cy="48" r="4" fill="#FBBF24" />
          <circle cx="33" cy="72" r="4.5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="33" y="84" fill="#2563EB" fontSize="9" fontWeight="bold" textAnchor="middle">
            A
          </text>

          {/* Right Jaw Contact Terminal (Terminal B) */}
          <rect x="115" y="42" width="16" height="15" fill="#D97706" stroke="#92400E" strokeWidth="1.5" />
          {/* U-Shaped Contact Jaw Prongs */}
          <path d="M 119 32 L 119 45 L 127 45 L 127 32" stroke="#B45309" strokeWidth="3" fill="none" />
          <circle cx="123" cy="72" r="4.5" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="1.5" />
          <text x="123" y="84" fill="#F43F5E" fontSize="9" fontWeight="bold" textAnchor="middle">
            B
          </text>

          {/* Articulated Copper Knife Blade Lever */}
          <g
            className="transition-transform duration-200 origin-[33px_48px]"
            style={{
              transform: isOpen ? 'rotate(-38deg)' : 'rotate(0deg)',
            }}
          >
            {/* Copper Blade Bar */}
            <rect
              x="30"
              y="44"
              width="96"
              height="8"
              rx="2"
              fill="#F59E0B"
              stroke="#B45309"
              strokeWidth="1.5"
            />
            {/* Insulated Grip Handle (Hard Red Plastic/Wood) */}
            <rect
              x="110"
              y="41"
              width="24"
              height="14"
              rx="3"
              fill="#DC2626"
              stroke="#991B1B"
              strokeWidth="1.5"
            />
          </g>
        </svg>
      </div>

      {/* State Badge */}
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[11px] font-bold text-zinc-800">{label}</span>
        <span
          className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${
            isOpen
              ? 'bg-red-50 text-red-600 border-red-200'
              : 'bg-emerald-50 text-emerald-600 border-emerald-200'
          }`}
        >
          {isOpen ? 'OPEN' : 'CLOSED'}
        </span>
      </div>
    </div>
  );
};
