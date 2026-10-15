/**
 * Prismora ECE Virtual Lab — Standard Logic Gate SVG Symbols
 * Renders IEEE/ANSI standard logic gate silhouettes with solid colors and clear pinouts.
 */

import React from 'react';
import { CircuitComponentType } from '@prismora/simulation-core';

interface GateSymbolProps {
  type: CircuitComponentType;
  width: number;
  height: number;
  isActive?: boolean;
}

export const GateSymbol: React.FC<GateSymbolProps> = ({ type, width, height, isActive = false }) => {
  const strokeColor = isActive ? '#16A34A' : '#475569';
  const fillColor = isActive ? '#DCFCE7' : '#F1F5F9';

  switch (type) {
    case 'AND':
      // D-shape
      return (
        <svg width={width} height={height} viewBox="0 0 80 60" className="overflow-visible">
          <path
            d="M 15 10 L 45 10 A 20 20 0 0 1 45 50 L 15 50 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'OR':
      // Curved input, pointed output
      return (
        <svg width={width} height={height} viewBox="0 0 80 60" className="overflow-visible">
          <path
            d="M 12 10 Q 28 30 12 50 Q 45 50 62 30 Q 45 10 12 10 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'XOR':
      // Double curved input, pointed output
      return (
        <svg width={width} height={height} viewBox="0 0 80 60" className="overflow-visible">
          {/* Back crescent curve */}
          <path
            d="M 8 10 Q 24 30 8 50"
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Main body */}
          <path
            d="M 15 10 Q 30 30 15 50 Q 48 50 65 30 Q 48 10 15 10 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    case 'NOT':
      // Triangle with inversion bubble
      return (
        <svg width={width} height={height} viewBox="0 0 80 60" className="overflow-visible">
          <polygon
            points="18,12 52,30 18,48"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle
            cx="58"
            cy="30"
            r="4.5"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
          />
        </svg>
      );

    case 'NAND':
      // AND with inversion bubble
      return (
        <svg width={width} height={height} viewBox="0 0 80 60" className="overflow-visible">
          <path
            d="M 15 10 L 42 10 A 18 18 0 0 1 42 50 L 15 50 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle
            cx="64"
            cy="30"
            r="4"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
        </svg>
      );

    case 'NOR':
      // OR with inversion bubble
      return (
        <svg width={width} height={height} viewBox="0 0 80 60" className="overflow-visible">
          <path
            d="M 12 10 Q 26 30 12 50 Q 42 50 56 30 Q 42 10 12 10 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle
            cx="63"
            cy="30"
            r="4"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
        </svg>
      );

    case 'XNOR':
      // XOR with inversion bubble
      return (
        <svg width={width} height={height} viewBox="0 0 80 60" className="overflow-visible">
          <path
            d="M 6 10 Q 20 30 6 50"
            fill="none"
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M 14 10 Q 28 30 14 50 Q 44 50 58 30 Q 44 10 14 10 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle
            cx="65"
            cy="30"
            r="4"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2"
          />
        </svg>
      );

    case 'BUFFER':
      return (
        <svg width={width} height={height} viewBox="0 0 80 60" className="overflow-visible">
          <polygon
            points="18,12 56,30 18,48"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
        </svg>
      );

    default:
      return null;
  }
};
