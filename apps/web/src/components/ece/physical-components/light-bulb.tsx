/**
 * Prismora Physical Component Library — Realistic Incandescent Light Bulb
 *
 * Renders a photorealistic yet crisp vector incandescent light bulb with:
 * - Threaded brass/aluminum screw base (Edison E27)
 * - Glass envelope with subtle specular reflection
 * - Dual internal copper/tungsten lead wires
 * - Physics-driven coiled tungsten filament glowing from dark charcoal to brilliant incandescent yellow-white
 * - Radiant luminous halo and light rays proportional to calculated electrical power (P = V * I)
 */

'use client';

import React from 'react';

export interface LightBulbProps {
  id?: string;
  brightness?: number; // 0.0 to 1.5 (1.0 = 100% rated power)
  filamentColor?: string; // Hex color from solver
  lumens?: number; // Calculated lumens
  powerWatts?: number; // Power in Watts
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const PhysicalLightBulb: React.FC<LightBulbProps> = ({
  brightness = 0,
  filamentColor = '#334155',
  lumens = 0,
  powerWatts = 0,
  label = '60W Bulb',
  size = 'md',
  className = '',
}) => {
  const isGlowing = brightness > 0.04;
  const glowOpacity = Math.min(1.0, brightness * 0.9);
  const glowScale = 1.0 + Math.min(0.5, brightness * 0.4);

  const sizeDimensions = {
    sm: { width: 90, height: 130 },
    md: { width: 130, height: 180 },
    lg: { width: 170, height: 230 },
  }[size];

  // Dynamic filament glow style
  const filamentStroke = isGlowing ? filamentColor : '#475569';
  const filamentShadow = isGlowing
    ? `drop-shadow(0 0 ${Math.round(brightness * 12)}px ${filamentColor})`
    : 'none';

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      <div
        className="relative flex items-center justify-center"
        style={{ width: sizeDimensions.width, height: sizeDimensions.height }}
      >
        {/* Ambient Glow Halo (Luminous Radiant Aura) */}
        {isGlowing && (
          <div
            className="absolute rounded-full pointer-events-none transition-all duration-300"
            style={{
              width: sizeDimensions.width * 1.5 * glowScale,
              height: sizeDimensions.width * 1.5 * glowScale,
              backgroundColor: filamentColor,
              opacity: glowOpacity * 0.25,
              filter: `blur(${Math.round(20 * glowScale)}px)`,
              top: '5%',
            }}
          />
        )}

        <svg
          viewBox="0 0 140 190"
          className="w-full h-full overflow-visible z-10"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Base Threads Pattern */}
            <linearGradient id="bulbGlass" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="60%" stopColor="#E2E8F0" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#94A3B8" stopOpacity="0.2" />
            </linearGradient>

            <linearGradient id="screwBase" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="40%" stopColor="#E2E8F0" />
              <stop offset="70%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
          </defs>

          {/* Radiant Light Rays */}
          {isGlowing && brightness > 0.3 && (
            <g opacity={Math.min(0.8, brightness * 0.7)} stroke={filamentColor} strokeWidth="2" strokeLinecap="round">
              <line x1="70" y1="10" x2="70" y2="0" />
              <line x1="25" y1="25" x2="15" y2="15" />
              <line x1="115" y1="25" x2="125" y2="15" />
              <line x1="5" y1="65" x2="0" y2="65" />
              <line x1="135" y1="65" x2="140" y2="65" />
              <line x1="20" y1="105" x2="10" y2="115" />
              <line x1="120" y1="105" x2="130" y2="115" />
            </g>
          )}

          {/* Glass Envelope Body */}
          <path
            d="M 46 122 C 34 110, 20 86, 20 62 C 20 34, 42 16, 70 16 C 98 16, 120 34, 120 62 C 120 86, 106 110, 94 122 Z"
            fill={isGlowing ? filamentColor : 'url(#bulbGlass)'}
            fillOpacity={isGlowing ? Math.min(0.35, brightness * 0.3) : 0.25}
            stroke="#94A3B8"
            strokeWidth="2.5"
          />

          {/* Glass Specular Reflection Highlight */}
          <path
            d="M 32 50 C 32 35, 45 25, 62 23"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            opacity={isGlowing ? 0.9 : 0.6}
          />

          {/* Internal Support Stem & Lead Wires */}
          <line x1="70" y1="122" x2="70" y2="100" stroke="#64748B" strokeWidth="3" />
          <line x1="70" y1="100" x2="56" y2="70" stroke="#64748B" strokeWidth="2" />
          <line x1="70" y1="100" x2="84" y2="70" stroke="#64748B" strokeWidth="2" />

          {/* Support Hooks */}
          <circle cx="56" cy="70" r="1.5" fill="#475569" />
          <circle cx="84" cy="70" r="1.5" fill="#475569" />

          {/* Coiled Tungsten Filament (Physics Driven Glow) */}
          <path
            d="M 56 70 Q 63 60, 70 65 T 84 70"
            fill="none"
            stroke={filamentStroke}
            strokeWidth={isGlowing ? 3.5 : 2.5}
            strokeLinecap="round"
            style={{ filter: filamentShadow }}
          />

          {/* Additional Coiled Loop Detail when hot */}
          {isGlowing && (
            <ellipse
              cx="70"
              cy="66"
              rx={brightness * 14}
              ry={brightness * 10}
              fill={filamentColor}
              opacity={brightness * 0.4}
              style={{ filter: `blur(${Math.round(4 * brightness)}px)` }}
            />
          )}

          {/* Screw Base (Metal Cap Threads) */}
          <g>
            {/* Thread Rib 1 */}
            <rect x="44" y="122" width="52" height="7" rx="3" fill="url(#screwBase)" stroke="#64748B" strokeWidth="1.5" />
            {/* Thread Rib 2 */}
            <rect x="45" y="129" width="50" height="7" rx="3" fill="url(#screwBase)" stroke="#64748B" strokeWidth="1.5" />
            {/* Thread Rib 3 */}
            <rect x="46" y="136" width="48" height="7" rx="3" fill="url(#screwBase)" stroke="#64748B" strokeWidth="1.5" />
            {/* Thread Rib 4 */}
            <rect x="48" y="143" width="44" height="6" rx="3" fill="url(#screwBase)" stroke="#64748B" strokeWidth="1.5" />
            {/* Contact Foot Insulator */}
            <path d="M 50 149 L 90 149 L 85 156 L 55 156 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="1" />
            {/* Base Contact Solder Foot */}
            <ellipse cx="70" cy="157" rx="10" ry="3" fill="#64748B" stroke="#475569" strokeWidth="1" />
          </g>

          {/* Electrical Terminals for Interactive Probing */}
          {/* Terminal A: Thread Shell (Side) */}
          <circle cx="36" cy="134" r="5" fill="#2563EB" stroke="#FFFFFF" strokeWidth="2" />
          <text x="24" y="137" fill="#2563EB" fontSize="10" fontWeight="bold">A</text>

          {/* Terminal B: Center Contact Foot (Bottom) */}
          <circle cx="70" cy="172" r="5" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="2" />
          <text x="70" y="185" fill="#F43F5E" fontSize="10" fontWeight="bold" textAnchor="middle">B</text>
          <line x1="70" y1="160" x2="70" y2="167" stroke="#F43F5E" strokeWidth="2" strokeDasharray="2 2" />
        </svg>
      </div>

      {/* Physics & State Metrics Card */}
      <div className="mt-2 text-center bg-white border border-zinc-200 rounded-md p-1.5 shadow-xs w-full max-w-[170px]">
        <div className="text-xs font-bold text-zinc-900">{label}</div>
        <div className="flex items-center justify-between mt-1 text-[11px] font-mono">
          <span className="text-zinc-600">Power:</span>
          <span className="font-bold text-[#2563EB]">{powerWatts.toFixed(2)} W</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-600">Lumen:</span>
          <span className="font-bold text-[#F59E0B]">{lumens} lm</span>
        </div>
        <div className="flex items-center justify-between text-[11px] font-mono">
          <span className="text-zinc-600">Glow:</span>
          <span className="font-bold" style={{ color: isGlowing ? filamentColor : '#64748B' }}>
            {isGlowing ? `${Math.round(brightness * 100)}%` : 'OFF'}
          </span>
        </div>
      </div>
    </div>
  );
};
