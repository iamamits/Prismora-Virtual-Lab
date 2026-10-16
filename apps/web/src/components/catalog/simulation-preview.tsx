'use client';

import React, { useState } from 'react';

interface PreviewProps {
  isHovered?: boolean;
  className?: string;
}

/**
 * 1. Projectile Motion Preview
 * Visualizes articulated launcher, coordinate scale, parabolic trajectory,
 * apex altitude marker, target reticle, and decomposed velocity vector.
 */
export function ProjectileMotionPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Projectile motion trajectory visualization"
    >
      {/* Background Grid */}
      <rect width="320" height="200" fill="#0B1120" />
      <g stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3">
        <line x1="20" y1="40" x2="300" y2="40" />
        <line x1="20" y1="80" x2="300" y2="80" />
        <line x1="20" y1="120" x2="300" y2="120" />
        <line x1="20" y1="160" x2="300" y2="160" />
        <line x1="80" y1="20" x2="80" y2="160" />
        <line x1="140" y1="20" x2="140" y2="160" />
        <line x1="200" y1="20" x2="200" y2="160" />
        <line x1="260" y1="20" x2="260" y2="160" />
      </g>

      {/* Axis lines & labels */}
      <line x1="24" y1="20" x2="24" y2="162" stroke="#475569" strokeWidth="1.5" />
      <line x1="24" y1="162" x2="304" y2="162" stroke="#475569" strokeWidth="1.5" />

      {/* Ground plane styling */}
      <rect x="0" y="162" width="320" height="38" fill="#0F172A" />
      <line x1="0" y1="162" x2="320" y2="162" stroke="#22C55E" strokeWidth="2" />
      {/* Ground hatch marks */}
      <g stroke="#1E293B" strokeWidth="1">
        {[20, 50, 80, 110, 140, 170, 200, 230, 260, 290].map((x) => (
          <line key={x} x1={x} y1="162" x2={x - 12} y2="178" />
        ))}
      </g>

      {/* Ticks and axis units */}
      <text x="28" y="32" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono, monospace">
        y (m)
      </text>
      <text x="290" y="156" fill="#64748B" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="end">
        x (m)
      </text>
      <text x="14" y="83" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="end">
        15
      </text>
      <text x="14" y="123" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="end">
        7.5
      </text>

      {/* Parabolic Trajectory: y(x) from x=30 to x=270, apex at x=150, y=55 */}
      {/* Ghost trajectory track */}
      <path
        d="M 30 162 Q 150 -52 270 162"
        stroke="#1E3A8A"
        strokeWidth="2.5"
        strokeDasharray="4 4"
        fill="none"
      />
      {/* Active illuminated path */}
      <path
        d="M 30 162 Q 150 -52 270 162"
        stroke="#38BDF8"
        strokeWidth="2"
        fill="none"
        strokeDasharray="360"
        strokeDashoffset={isHovered ? 0 : 70}
        className="transition-all duration-700 ease-out"
      />

      {/* Apex Marker & Altitude dashed line */}
      <line x1="150" y1="55" x2="150" y2="162" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" />
      <circle cx="150" cy="55" r="3" fill="#F59E0B" />
      <rect x="156" y="48" width="56" height="15" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="0.8" />
      <text x="184" y="59" fill="#FBBF24" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
        h_max: 15.3m
      </text>

      {/* Target Reticle at Range Impact (x=270, y=162) */}
      <circle cx="270" cy="162" r="10" stroke="#F43F5E" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
      <circle cx="270" cy="162" r="4" fill="#F43F5E" />
      <text x="270" y="184" fill="#F43F5E" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        R: 61.2m
      </text>

      {/* Articulated Launcher Cannon (at origin x=30, y=162) */}
      <g transform="translate(30, 162)">
        {/* Mount base */}
        <path d="M -12 0 L 12 0 L 8 -10 L -8 -10 Z" fill="#475569" stroke="#334155" strokeWidth="1" />
        <circle cx="0" cy="-10" r="5" fill="#3B82F6" />
        {/* Cannon barrel rotated 45 deg */}
        <g transform="rotate(-45, 0, -10)">
          <rect x="-4" y="-32" width="8" height="24" rx="2" fill="#2563EB" stroke="#60A5FA" strokeWidth="1.2" />
          <line x1="-5" y1="-32" x2="5" y2="-32" stroke="#93C5FD" strokeWidth="1.5" />
        </g>
        {/* Angle arc */}
        <path d="M 14 -10 A 14 14 0 0 0 10 -20" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
        <text x="18" y="-14" fill="#FBBF24" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          45°
        </text>
      </g>

      {/* Flying Projectile Ball along path (placed at x=100, y=88 or animated) */}
      <g transform={isHovered ? 'translate(150, 55)' : 'translate(100, 88)'} className="transition-all duration-500">
        {/* Glow halo */}
        <circle cx="0" cy="0" r="7" fill="#2563EB" fillOpacity="0.4" />
        <circle cx="0" cy="0" r="4.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1" />
        {/* Velocity vector arrow (tangent) */}
        <line x1="0" y1="0" x2="22" y2="-12" stroke="#38BDF8" strokeWidth="1.8" />
        <polygon points="22,-12 16,-16 18,-10" fill="#38BDF8" />
        <text x="26" y="-12" fill="#38BDF8" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          v
        </text>
        {/* Decomposed vectors (v_x and v_y) */}
        <line x1="0" y1="0" x2="20" y2="0" stroke="#06B6D4" strokeWidth="1" strokeDasharray="1.5 1.5" />
        <line x1="0" y1="0" x2="0" y2="-12" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="1.5 1.5" />
      </g>

      {/* Physics Model Badge */}
      <rect x="238" y="10" width="72" height="17" rx="3.5" fill="#0F172A" stroke="#2563EB" strokeWidth="1" />
      <text x="274" y="22" fill="#60A5FA" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        ANALYTICAL 2D
      </text>
    </svg>
  );
}

/**
 * 2. Digital Electronics & Logic Preview
 * Visualizes logic gates, high/low binary lines, truth table matrix row,
 * and multi-channel timing waveform.
 */
export function DigitalLogicPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Digital logic gates and timing waveforms"
    >
      <rect width="320" height="200" fill="#0B1120" />

      {/* Subtle schematic dot matrix */}
      <g fill="#1E293B">
        {[40, 80, 120, 160, 200, 240, 280].flatMap((x) =>
          [30, 60, 90, 120, 150, 180].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1" />)
        )}
      </g>

      {/* Input pins with high/low logic values */}
      {/* Input A = 1 (High, solid emerald) */}
      <rect x="14" y="28" width="22" height="15" rx="3" fill="#065F46" stroke="#10B981" strokeWidth="1" />
      <text x="25" y="39" fill="#A7F3D0" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        A:1
      </text>
      <line x1="36" y1="35" x2="70" y2="35" stroke="#10B981" strokeWidth="2" />

      {/* Input B = 0 (Low, neutral zinc) */}
      <rect x="14" y="58" width="22" height="15" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1" />
      <text x="25" y="69" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        B:0
      </text>
      <line x1="36" y1="65" x2="70" y2="65" stroke="#475569" strokeWidth="2" />

      {/* Branches to Gate 2 (AND) */}
      <circle cx="50" cy="35" r="2.5" fill="#10B981" />
      <line x1="50" y1="35" x2="50" y2="105" stroke="#10B981" strokeWidth="2" />
      <line x1="50" y1="105" x2="70" y2="105" stroke="#10B981" strokeWidth="2" />

      <circle cx="58" cy="65" r="2.5" fill="#475569" />
      <line x1="58" y1="65" x2="58" y2="125" stroke="#475569" strokeWidth="2" />
      <line x1="58" y1="125" x2="70" y2="125" stroke="#475569" strokeWidth="2" />

      {/* Gate 1: XOR Gate (Half-Adder Sum) */}
      <g transform="translate(70, 26)">
        {/* Back curved line */}
        <path d="M 0 5 Q 8 24 0 44" stroke="#60A5FA" strokeWidth="2" fill="none" />
        {/* Gate body */}
        <path d="M 5 5 Q 13 24 5 44 C 28 44 45 32 50 24 C 45 16 28 4 5 5 Z" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.8" />
        <text x="24" y="28" fill="#93C5FD" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          XOR
        </text>
      </g>
      {/* XOR Output S = A XOR B = 1 */}
      <line x1="120" y1="50" x2="160" y2="50" stroke="#10B981" strokeWidth="2" />
      <circle cx="160" cy="50" r="3.5" fill="#10B981" />
      <text x="168" y="53" fill="#34D399" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        SUM = 1
      </text>

      {/* Gate 2: AND Gate (Half-Adder Carry) */}
      <g transform="translate(70, 96)">
        <path d="M 0 5 L 24 5 C 38 5 46 15 46 25 C 46 35 38 45 24 45 L 0 45 Z" fill="#1E293B" stroke="#F43F5E" strokeWidth="1.8" />
        <text x="20" y="29" fill="#FDA4AF" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          AND
        </text>
      </g>
      {/* AND Output C = A AND B = 0 */}
      <line x1="116" y1="120" x2="160" y2="120" stroke="#475569" strokeWidth="2" />
      <circle cx="160" cy="120" r="3.5" fill="#475569" />
      <text x="168" y="123" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        CARRY = 0
      </text>

      {/* Mini Truth Table Matrix Inset (Right side) */}
      <g transform="translate(228, 20)">
        <rect width="80" height="92" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
        {/* Header */}
        <rect width="80" height="20" rx="4" fill="#1E293B" />
        <text x="14" y="14" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">A</text>
        <text x="32" y="14" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">B</text>
        <text x="50" y="14" fill="#38BDF8" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">S</text>
        <text x="68" y="14" fill="#F43F5E" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">C</text>
        <line x1="0" y1="20" x2="80" y2="20" stroke="#334155" strokeWidth="1" />

        {/* Row 0: 0 0 | 0 0 */}
        <text x="14" y="34" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">0</text>
        <text x="32" y="34" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">0</text>
        <text x="50" y="34" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">0</text>
        <text x="68" y="34" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">0</text>

        {/* Row 1: 0 1 | 1 0 */}
        <text x="14" y="49" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">0</text>
        <text x="32" y="49" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">1</text>
        <text x="50" y="49" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">1</text>
        <text x="68" y="49" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">0</text>

        {/* Row 2: 1 0 | 1 0 (ACTIVE HIGHLIGHT) */}
        <rect x="2" y="55" width="76" height="17" rx="3" fill="#065F46" fillOpacity="0.4" stroke="#10B981" strokeWidth="1" />
        <text x="14" y="67" fill="#A7F3D0" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">1</text>
        <text x="32" y="67" fill="#A7F3D0" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">0</text>
        <text x="50" y="67" fill="#34D399" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">1</text>
        <text x="68" y="67" fill="#A7F3D0" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">0</text>

        {/* Row 3: 1 1 | 0 1 */}
        <text x="14" y="85" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">1</text>
        <text x="32" y="85" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">1</text>
        <text x="50" y="85" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">0</text>
        <text x="68" y="85" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">1</text>
      </g>

      {/* Waveform Viewer Strip (Bottom) */}
      <g transform="translate(14, 150)">
        <rect width="292" height="42" rx="4" fill="#050811" stroke="#1E293B" strokeWidth="1" />
        {/* Clock Channel */}
        <text x="6" y="16" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">CLK</text>
        <path d="M 32 16 L 50 16 L 50 6 L 68 6 L 68 16 L 86 16 L 86 6 L 104 6 L 104 16 L 122 16 L 122 6 L 140 6 L 140 16 L 158 16 L 158 6 L 176 6 L 176 16 L 194 16 L 194 6 L 212 6 L 212 16 L 230 16 L 230 6 L 248 6 L 248 16 L 266 16 L 266 6 L 284 6 L 284 16" stroke="#06B6D4" strokeWidth="1.2" fill="none" />

        {/* Output Channel (SUM) */}
        <text x="6" y="34" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace">SUM</text>
        <path d="M 32 34 L 86 34 L 88 24 L 176 24 L 178 34 L 284 34" stroke="#10B981" strokeWidth="1.5" fill="none" />
      </g>
    </svg>
  );
}

/**
 * 3. Computer Organization & Architecture Preview (RISC-V RV32I)
 * Visualizes 5-stage classic pipeline (IF, ID, EX, MEM, WB),
 * register file, ALU block, and hazard forwarding loop.
 */
export function RiscVPipelinePreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="RISC-V 5-stage processor pipeline and datapath"
    >
      <rect width="320" height="200" fill="#0B1120" />

      {/* Header bar: Processor specs */}
      <rect x="14" y="10" width="292" height="22" rx="4" fill="#0F172A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="24" fill="#06B6D4" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        RV32I RISC-V CORE
      </text>
      <text x="160" y="24" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">
        PC: 0x0040 &bull; CPI: 1.14
      </text>
      <rect x="250" y="13" width="50" height="15" rx="3" fill="#065F46" />
      <text x="275" y="24" fill="#34D399" fontSize="7.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        FORWARDING
      </text>

      {/* 5 Classic Pipeline Stages */}
      {/* 1. IF: Instruction Fetch */}
      <g transform="translate(14, 46)">
        <rect width="52" height="74" rx="4" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
        <rect width="52" height="18" rx="4" fill="#06B6D4" />
        <text x="26" y="13" fill="#082F49" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          IF
        </text>
        <text x="26" y="34" fill="#E2E8F0" fontSize="7.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          I-Cache
        </text>
        <text x="26" y="48" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          PC+4
        </text>
        <text x="26" y="64" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          Fetch
        </text>
      </g>

      {/* Latch 1 */}
      <line x1="66" y1="83" x2="74" y2="83" stroke="#475569" strokeWidth="2" />

      {/* 2. ID: Instruction Decode / Regs */}
      <g transform="translate(74, 46)">
        <rect width="52" height="74" rx="4" fill="#0F172A" stroke="#2563EB" strokeWidth="1.5" />
        <rect width="52" height="18" rx="4" fill="#2563EB" />
        <text x="26" y="13" fill="#EFF6FF" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          ID
        </text>
        <text x="26" y="34" fill="#E2E8F0" fontSize="7.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          RegFile
        </text>
        <text x="26" y="48" fill="#93C5FD" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          x1, x2
        </text>
        <text x="26" y="64" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          ImmGen
        </text>
      </g>

      {/* Latch 2 */}
      <line x1="126" y1="83" x2="134" y2="83" stroke="#475569" strokeWidth="2" />

      {/* 3. EX: Execute / ALU */}
      <g transform="translate(134, 46)">
        <rect width="52" height="74" rx="4" fill="#0F172A" stroke="#F59E0B" strokeWidth="1.5" />
        <rect width="52" height="18" rx="4" fill="#F59E0B" />
        <text x="26" y="13" fill="#451A03" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          EX
        </text>
        {/* Trapezoid ALU Symbol */}
        <polygon points="12,28 40,28 34,48 18,48" fill="#1E293B" stroke="#FBBF24" strokeWidth="1" />
        <text x="26" y="42" fill="#FDE68A" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          ALU
        </text>
        <text x="26" y="64" fill="#F59E0B" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          ADD
        </text>
      </g>

      {/* Latch 3 */}
      <line x1="186" y1="83" x2="194" y2="83" stroke="#475569" strokeWidth="2" />

      {/* 4. MEM: Memory Access */}
      <g transform="translate(194, 46)">
        <rect width="52" height="74" rx="4" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1.5" />
        <rect width="52" height="18" rx="4" fill="#8B5CF6" />
        <text x="26" y="13" fill="#FAF5FF" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          MEM
        </text>
        <text x="26" y="34" fill="#E2E8F0" fontSize="7.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          D-Cache
        </text>
        <text x="26" y="48" fill="#C4B5FD" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          L1 Read
        </text>
        <text x="26" y="64" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          Addr/Data
        </text>
      </g>

      {/* Latch 4 */}
      <line x1="246" y1="83" x2="254" y2="83" stroke="#475569" strokeWidth="2" />

      {/* 5. WB: Writeback */}
      <g transform="translate(254, 46)">
        <rect width="52" height="74" rx="4" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
        <rect width="52" height="18" rx="4" fill="#10B981" />
        <text x="26" y="13" fill="#022C22" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          WB
        </text>
        <text x="26" y="36" fill="#E2E8F0" fontSize="7.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          RegWrite
        </text>
        <text x="26" y="52" fill="#6EE7B7" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          x3 &lt;= Rd
        </text>
      </g>

      {/* EX-to-EX Forwarding Data Bus Loop (Bottom arc) */}
      <path
        d="M 194 92 C 194 140, 134 140, 134 94"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeDasharray="3 3"
        fill="none"
      />
      <polygon points="134,94 130,102 138,102" fill="#10B981" />
      <text x="164" y="146" fill="#34D399" fontSize="7.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        RAW Forwarding Bypass
      </text>

      {/* Register inspection footer strip */}
      <g transform="translate(14, 156)">
        <rect width="292" height="34" rx="4" fill="#070C18" stroke="#1E293B" strokeWidth="1" />
        <text x="10" y="16" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">
          x10 (a0): 0x0000002A
        </text>
        <text x="110" y="16" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">
          x1 (ra): 0x00400010
        </text>
        <text x="210" y="16" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">
          x2 (sp): 0x7FFF0000
        </text>
        <text x="10" y="28" fill="#F59E0B" fontSize="7" fontFamily="JetBrains Mono, monospace">
          Instr: add a0, a0, t0 &bull; Opcode: 0x33 &bull; Funct3: 0x0
        </text>
      </g>
    </svg>
  );
}

/**
 * 4. Theory of Computation & Automata Preview
 * Visualizes 5-tuple DFA state transition graph, tape ribbon,
 * double-circle accept state, and symbol evaluation.
 */
export function AutomataDfaPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Finite automata DFA state transition graph"
    >
      <rect width="320" height="200" fill="#0B1120" />

      {/* Grid pattern */}
      <g stroke="#1E293B" strokeWidth="0.8" strokeDasharray="3 3">
        <line x1="20" y1="50" x2="300" y2="50" />
        <line x1="20" y1="100" x2="300" y2="100" />
        <line x1="20" y1="150" x2="300" y2="150" />
      </g>

      {/* Initial Arrow pointing into q0 */}
      <line x1="16" y1="80" x2="48" y2="80" stroke="#8B5CF6" strokeWidth="2" />
      <polygon points="48,80 40,76 40,84" fill="#8B5CF6" />
      <text x="24" y="74" fill="#C4B5FD" fontSize="8" fontFamily="JetBrains Mono, monospace">
        START
      </text>

      {/* State q0 (Start) */}
      <circle cx="68" cy="80" r="18" fill="#1E293B" stroke="#8B5CF6" strokeWidth="2" />
      <text x="68" y="84" fill="#EDE9FE" fontSize="11" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        q₀
      </text>

      {/* Transition q0 -> q1 (symbol 'a') */}
      <path d="M 86 74 Q 128 50 170 74" stroke="#38BDF8" strokeWidth="1.8" fill="none" />
      <polygon points="170,74 160,70 164,78" fill="#38BDF8" />
      <text x="128" y="54" fill="#38BDF8" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        'a'
      </text>

      {/* State q1 */}
      <circle cx="188" cy="80" r="18" fill="#1E293B" stroke="#38BDF8" strokeWidth="2" />
      <text x="188" y="84" fill="#F0F9FF" fontSize="11" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        q₁
      </text>

      {/* Self-loop on q1 (symbol 'b') */}
      <path d="M 180 62 C 170 32, 206 32, 196 62" stroke="#F59E0B" strokeWidth="1.8" fill="none" />
      <polygon points="196,62 192,54 200,56" fill="#F59E0B" />
      <text x="188" y="32" fill="#FBBF24" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        'b'
      </text>

      {/* Transition q1 -> q2 (symbol 'a' leads to accept state) */}
      <line x1="206" y1="80" x2="250" y2="80" stroke="#10B981" strokeWidth="2" />
      <polygon points="250,80 242,76 242,84" fill="#10B981" />
      <text x="228" y="74" fill="#34D399" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        'a'
      </text>

      {/* State q2 (Double Circle Accept State) */}
      <circle cx="270" cy="80" r="20" fill="#064E3B" stroke="#10B981" strokeWidth="2" />
      <circle cx="270" cy="80" r="15" fill="#065F46" stroke="#34D399" strokeWidth="1.5" />
      <text x="270" y="84" fill="#ECFDF5" fontSize="11" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        q₂*
      </text>

      {/* Transition loop back q2 -> q0 (symbol 'b') */}
      <path d="M 262 98 Q 168 136 74 98" stroke="#64748B" strokeWidth="1.2" strokeDasharray="3 3" fill="none" />
      <polygon points="74,98 84,101 80,93" fill="#64748B" />
      <text x="168" y="132" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
        'b'
      </text>

      {/* Input Tape & Reading Head at bottom */}
      <g transform="translate(40, 150)">
        <rect width="240" height="28" rx="4" fill="#070D1A" stroke="#334155" strokeWidth="1" />
        {/* Tape cells */}
        {['a', 'b', 'b', 'a', 'a'].map((char, idx) => {
          const isCurrent = idx === 3; // pointing to 4th char
          return (
            <g key={idx} transform={`translate(${idx * 48}, 0)`}>
              <rect
                width="48"
                height="28"
                fill={isCurrent ? '#065F46' : 'none'}
                stroke="#1E293B"
                strokeWidth="1"
              />
              <text
                x="24"
                y="18"
                fill={isCurrent ? '#34D399' : '#94A3B8'}
                fontSize="11"
                fontFamily="JetBrains Mono, monospace"
                textAnchor="middle"
                fontWeight={isCurrent ? 'bold' : 'normal'}
              >
                {char}
              </text>
            </g>
          );
        })}
        {/* Head Arrow pointer */}
        <polygon points="168,0 162,-6 174,-6" fill="#10B981" />
        <text x="168" y="-9" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          HEAD
        </text>
      </g>

      {/* Language badge */}
      <rect x="14" y="12" width="105" height="18" rx="4" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1" />
      <text x="66" y="24" fill="#C4B5FD" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
        L = {"{ w | w ends with 'aa' }"}
      </text>
    </svg>
  );
}

/**
 * 5. Ohm's Law & DC Circuits Preview
 * Closed DC circuit loop, battery, resistor, current direction dots, and V-I line.
 */
export function OhmsLawCircuitPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Ohm's Law DC circuit diagram and V-I curve"
    >
      <rect width="320" height="200" fill="#0B1120" />

      {/* Circuit loop on Left (x=16 to x=180) */}
      <rect x="24" y="28" width="156" height="144" rx="4" stroke="#334155" strokeWidth="2" fill="none" />

      {/* DC Voltage Source (Left branch) */}
      <g transform="translate(24, 100)">
        <rect x="-10" y="-20" width="20" height="40" fill="#0B1120" />
        {/* Battery plates */}
        <line x1="-12" y1="-8" x2="12" y2="-8" stroke="#38BDF8" strokeWidth="2.5" />
        <line x1="-6" y1="0" x2="6" y2="0" stroke="#64748B" strokeWidth="1.8" />
        <line x1="-12" y1="8" x2="12" y2="8" stroke="#38BDF8" strokeWidth="2.5" />
        <line x1="-6" y1="16" x2="6" y2="16" stroke="#64748B" strokeWidth="1.8" />
        <text x="-16" y="-12" fill="#38BDF8" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="bold">+</text>
        <text x="-16" y="24" fill="#64748B" fontSize="10" fontFamily="JetBrains Mono, monospace">-</text>
        <text x="18" y="8" fill="#38BDF8" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          Vs: 12V
        </text>
      </g>

      {/* Resistor (Top branch) */}
      <g transform="translate(102, 28)">
        <rect x="-24" y="-10" width="48" height="20" fill="#0B1120" />
        {/* Zigzag symbol */}
        <path d="M -22 0 L -16 -6 L -8 6 L 0 -6 L 8 6 L 16 -6 L 22 0" stroke="#F59E0B" strokeWidth="2" fill="none" />
        <text x="0" y="-14" fill="#FBBF24" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          R = 100Ω
        </text>
      </g>

      {/* Current Flow Vector Arrow (Right branch) */}
      <g transform="translate(180, 100)">
        <line x1="0" y1="-20" x2="0" y2="20" stroke="#10B981" strokeWidth="2" />
        <polygon points="0,20 -4,12 4,12" fill="#10B981" />
        <text x="8" y="4" fill="#34D399" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          I = 120mA
        </text>
      </g>

      {/* Ground Symbol (Bottom branch) */}
      <g transform="translate(102, 172)">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#475569" strokeWidth="1.5" />
        <line x1="-10" y1="10" x2="10" y2="10" stroke="#475569" strokeWidth="1.5" />
        <line x1="-6" y1="14" x2="6" y2="14" stroke="#475569" strokeWidth="1.5" />
        <line x1="-2" y1="18" x2="2" y2="18" stroke="#475569" strokeWidth="1.5" />
      </g>

      {/* Inset V-I Plot on Right (x=200 to x=304) */}
      <g transform="translate(200, 28)">
        <rect width="104" height="144" rx="4" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
        <text x="10" y="16" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          V-I LINEARITY
        </text>

        {/* Axes */}
        <line x1="16" y1="28" x2="16" y2="124" stroke="#334155" strokeWidth="1.2" />
        <line x1="16" y1="124" x2="96" y2="124" stroke="#334155" strokeWidth="1.2" />
        <text x="8" y="32" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">V</text>
        <text x="92" y="134" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">I</text>

        {/* Straight linear line: slope = R */}
        <line x1="16" y1="124" x2="88" y2="44" stroke="#2563EB" strokeWidth="2" />
        {/* Operating Point */}
        <circle cx="64" cy="71" r="3.5" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="1" />
        <line x1="16" y1="71" x2="64" y2="71" stroke="#F43F5E" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="64" y1="71" x2="64" y2="124" stroke="#F43F5E" strokeWidth="0.8" strokeDasharray="2 2" />

        {/* Slope equation badge */}
        <rect x="22" y="94" width="70" height="20" rx="3" fill="#0F172A" stroke="#2563EB" strokeWidth="0.8" />
        <text x="57" y="107" fill="#60A5FA" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          Slope = 100Ω
        </text>
      </g>
    </svg>
  );
}

/**
 * 6. Diode Rectifier & Smoothing Filter Preview
 * AC input sine wave, PN junction diode symbol, and rectified smoothed DC.
 */
export function DiodeRectifierPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Diode rectifier circuit and AC/DC waveforms"
    >
      <rect width="320" height="200" fill="#0B1120" />

      {/* Top Schematic: AC Gen -> Diode -> RC Filter */}
      <g transform="translate(14, 18)">
        <rect width="292" height="60" rx="4" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />

        {/* AC Source symbol */}
        <circle cx="36" cy="30" r="14" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.5" />
        <path d="M 28 30 Q 32 23 36 30 Q 40 37 44 30" stroke="#38BDF8" strokeWidth="1.8" fill="none" />
        <text x="36" y="52" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          Vin 12VAC
        </text>

        {/* Wire to Diode */}
        <line x1="50" y1="30" x2="100" y2="30" stroke="#64748B" strokeWidth="1.5" />

        {/* Diode Symbol (1N4007) */}
        <g transform="translate(114, 30)">
          <polygon points="-12,-10 -12,10 6,0" fill="#2563EB" stroke="#60A5FA" strokeWidth="1" />
          <line x1="6" y1="-10" x2="6" y2="10" stroke="#60A5FA" strokeWidth="2" />
          <text x="-4" y="-14" fill="#93C5FD" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
            Vd: 0.7V
          </text>
        </g>

        {/* Wire to Filter & Load */}
        <line x1="120" y1="30" x2="180" y2="30" stroke="#64748B" strokeWidth="1.5" />

        {/* Filter Capacitor */}
        <g transform="translate(180, 30)">
          <line x1="0" y1="0" x2="0" y2="6" stroke="#64748B" strokeWidth="1.5" />
          <line x1="-8" y1="6" x2="8" y2="6" stroke="#10B981" strokeWidth="2" />
          <line x1="-8" y1="12" x2="8" y2="12" stroke="#10B981" strokeWidth="2" />
          <line x1="0" y1="12" x2="0" y2="24" stroke="#64748B" strokeWidth="1.5" />
          <text x="14" y="12" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace">
            C=470µF
          </text>
        </g>

        {/* Wire to Load Resistor */}
        <line x1="180" y1="30" x2="240" y2="30" stroke="#64748B" strokeWidth="1.5" />
        <g transform="translate(240, 30)">
          <path d="M 0 0 L 0 6 L -4 9 L 4 15 L -4 21 L 0 24" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
          <text x="10" y="16" fill="#FBBF24" fontSize="7" fontFamily="JetBrains Mono, monospace">
            RL=1kΩ
          </text>
        </g>
      </g>

      {/* Dual Waveform Oscilloscope Display (Bottom) */}
      <g transform="translate(14, 90)">
        <rect width="292" height="96" rx="4" fill="#040711" stroke="#334155" strokeWidth="1" />
        {/* Scope Grid */}
        <g stroke="#0F172A" strokeWidth="1">
          {[40, 80, 120, 160, 200, 240].map((x) => (
            <line key={x} x1={x} y1="0" x2={x} y2="96" />
          ))}
          {[24, 48, 72].map((y) => (
            <line key={y} x1="0" y1={y} x2="292" y2={y} />
          ))}
        </g>

        {/* Center 0V ground axis */}
        <line x1="0" y1="48" x2="292" y2="48" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />

        {/* CH1: Input AC Sinusoidal (Cyan / Blue, +/- 32px amp) */}
        <path
          d="M 10 48 Q 40 10 70 48 Q 100 86 130 48 Q 160 10 190 48 Q 220 86 250 48 Q 280 10 290 28"
          stroke="#0284C7"
          strokeWidth="1.5"
          fill="none"
          strokeOpacity="0.7"
        />

        {/* CH2: Rectified & Filtered DC Ripple Output (Solid Emerald / Gold) */}
        <path
          d="M 10 24 Q 40 18 70 20 L 76 25 Q 100 18 130 20 L 136 25 Q 160 18 190 20 L 196 25 Q 220 18 250 20 L 256 25 Q 280 18 290 19"
          stroke="#10B981"
          strokeWidth="2.2"
          fill="none"
        />

        {/* Legend */}
        <rect x="180" y="68" width="104" height="20" rx="3" fill="#0B1120" stroke="#1E293B" strokeWidth="0.8" />
        <circle cx="190" cy="78" r="3" fill="#0284C7" />
        <text x="198" y="81" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace">
          CH1: Vin AC
        </text>
        <circle cx="242" cy="78" r="3" fill="#10B981" />
        <text x="250" y="81" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace">
          CH2: Vdc
        </text>
      </g>
    </svg>
  );
}

/**
 * 7. Combinational Adders & Arithmetic Preview
 * Multi-gate Half/Full Adder schematic with Sum and Carry LEDs.
 */
export function AdderCircuitPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Full Adder digital arithmetic logic schematic"
    >
      <rect width="320" height="200" fill="#0B1120" />

      {/* Inputs (A=1, B=1, Cin=0) */}
      <g transform="translate(18, 30)">
        <rect width="32" height="18" rx="3" fill="#065F46" stroke="#10B981" strokeWidth="1" />
        <text x="16" y="12" fill="#A7F3D0" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          A=1
        </text>
      </g>
      <g transform="translate(18, 70)">
        <rect width="32" height="18" rx="3" fill="#065F46" stroke="#10B981" strokeWidth="1" />
        <text x="16" y="12" fill="#A7F3D0" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          B=1
        </text>
      </g>
      <g transform="translate(18, 110)">
        <rect width="32" height="18" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <text x="16" y="12" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          Cin=0
        </text>
      </g>

      {/* Logic Gates Interconnect */}
      <g transform="translate(90, 36)">
        {/* XOR Gate 1 */}
        <path d="M 0 5 Q 8 20 0 35 C 22 35 36 25 40 20 C 36 15 22 5 0 5 Z" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
        <text x="18" y="23" fill="#93C5FD" fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="bold">XOR</text>
      </g>

      <g transform="translate(90, 96)">
        {/* AND Gate 1 */}
        <path d="M 0 5 L 20 5 C 32 5 38 12 38 20 C 38 28 32 35 20 35 L 0 35 Z" fill="#1E293B" stroke="#F43F5E" strokeWidth="1.5" />
        <text x="16" y="23" fill="#FDA4AF" fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="bold">AND</text>
      </g>

      <g transform="translate(180, 56)">
        {/* XOR Gate 2 */}
        <path d="M 0 5 Q 8 20 0 35 C 22 35 36 25 40 20 C 36 15 22 5 0 5 Z" fill="#1E293B" stroke="#3B82F6" strokeWidth="1.5" />
        <text x="18" y="23" fill="#93C5FD" fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="bold">XOR</text>
      </g>

      <g transform="translate(180, 116)">
        {/* OR Gate for Carry */}
        <path d="M 0 5 Q 8 20 0 35 C 22 35 36 25 40 20 C 36 15 22 5 0 5 Z" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
        <text x="18" y="23" fill="#FDE68A" fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="bold">OR</text>
      </g>

      {/* Output LEDs (Right side) */}
      <g transform="translate(250, 66)">
        <circle cx="12" cy="10" r="10" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
        <circle cx="12" cy="10" r="5" fill="#475569" />
        <text x="30" y="14" fill="#94A3B8" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          SUM = 0
        </text>
      </g>

      <g transform="translate(250, 126)">
        <circle cx="12" cy="10" r="10" fill="#065F46" stroke="#10B981" strokeWidth="1.5" />
        <circle cx="12" cy="10" r="6" fill="#34D399" />
        <text x="30" y="14" fill="#34D399" fontSize="10" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          CARRY = 1
        </text>
      </g>

      {/* Binary equation summary banner */}
      <rect x="20" y="162" width="280" height="24" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
      <text x="160" y="178" fill="#F8FAFC" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        BINARY ADDITION: 1 + 1 + 0 = 10₂ (SUM=0, CARRY=1)
      </text>
    </svg>
  );
}

/**
 * 8. Harmonic Oscillator & Damped Resonance (Physics Planned)
 */
export function HarmonicOscillatorPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Harmonic oscillator mass-spring system and resonance curve"
    >
      <rect width="320" height="200" fill="#0B1120" />

      {/* Mass-Spring Apparatus on Left */}
      <g transform="translate(20, 20)">
        {/* Rigid ceiling */}
        <rect x="10" y="0" width="80" height="8" fill="#334155" />
        {[15, 30, 45, 60, 75].map((x) => (
          <line key={x} x1={x} y1="0" x2={x - 6} y2="-6" stroke="#475569" strokeWidth="1.5" />
        ))}

        {/* Helical Spring */}
        <path
          d="M 50 8 L 50 16 L 38 24 L 62 32 L 38 40 L 62 48 L 38 56 L 62 64 L 50 72 L 50 80"
          stroke="#38BDF8"
          strokeWidth="2"
          fill="none"
        />

        {/* Mass block m=2.0kg */}
        <g transform="translate(26, 80)">
          <rect width="48" height="34" rx="4" fill="#1E3A8A" stroke="#60A5FA" strokeWidth="1.5" />
          <text x="24" y="21" fill="#FFFFFF" fontSize="10" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
            m=2kg
          </text>
        </g>
        {/* Equilibrium dotted line */}
        <line x1="10" y1="97" x2="90" y2="97" stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
        <text x="50" y="132" fill="#FBBF24" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          x(t) = Ae^(-ζωt)cos(ωt)
        </text>
      </g>

      {/* Decaying Sinusoid & Resonance Response on Right */}
      <g transform="translate(130, 20)">
        <rect width="176" height="152" rx="4" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
        <text x="14" y="18" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          DAMPED RESONANCE CURVE
        </text>

        {/* Axes */}
        <line x1="20" y1="28" x2="20" y2="80" stroke="#334155" strokeWidth="1" />
        <line x1="20" y1="54" x2="164" y2="54" stroke="#334155" strokeWidth="1" />

        {/* Decaying Oscillation Wave */}
        <path
          d="M 20 54 Q 30 26 40 54 Q 50 76 60 54 Q 70 36 80 54 Q 90 68 100 54 Q 110 44 120 54 Q 130 60 140 54 Q 150 49 160 54"
          stroke="#2563EB"
          strokeWidth="1.8"
          fill="none"
        />
        {/* Damping Envelope */}
        <path d="M 20 26 Q 80 44 160 52" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        <path d="M 20 82 Q 80 64 160 56" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" fill="none" />

        {/* Resonance Frequency Peak Plot (Bottom half) */}
        <line x1="20" y1="92" x2="20" y2="140" stroke="#334155" strokeWidth="1" />
        <line x1="20" y1="140" x2="164" y2="140" stroke="#334155" strokeWidth="1" />
        <text x="160" y="148" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="end">
          ω (rad/s)
        </text>

        {/* Lorentzian resonance peak */}
        <path
          d="M 24 138 C 50 138 70 135 84 100 C 90 85 96 85 102 100 C 116 135 136 138 160 138"
          stroke="#10B981"
          strokeWidth="2"
          fill="none"
        />
        <circle cx="93" cy="88" r="3" fill="#10B981" />
        <text x="93" y="104" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
          ω₀ Peak
        </text>
      </g>
    </svg>
  );
}

/**
 * 9. Vector Field Studio (Math Planned)
 */
export function VectorFieldPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="2D vector field curl and streamline flow"
    >
      <rect width="320" height="200" fill="#0B1120" />
      <g stroke="#1E293B" strokeWidth="0.8">
        <line x1="160" y1="10" x2="160" y2="190" />
        <line x1="20" y1="100" x2="300" y2="100" />
      </g>

      {/* Rotating Vortex Vector Field Arrows F(x,y) = <-y, x> */}
      {[
        { x: 100, y: 60, dx: 14, dy: 10, col: '#38BDF8' },
        { x: 140, y: 50, dx: 16, dy: 4, col: '#60A5FA' },
        { x: 180, y: 50, dx: 16, dy: -4, col: '#8B5CF6' },
        { x: 220, y: 60, dx: 14, dy: -10, col: '#A855F7' },
        { x: 240, y: 100, dx: 0, dy: -16, col: '#C084FC' },
        { x: 220, y: 140, dx: -14, dy: -10, col: '#F43F5E' },
        { x: 180, y: 150, dx: -16, dy: -4, col: '#FB7185' },
        { x: 140, y: 150, dx: -16, dy: 4, col: '#F59E0B' },
        { x: 100, y: 140, dx: -14, dy: 10, col: '#10B981' },
        { x: 80, y: 100, dx: 0, dy: 16, col: '#34D399' },
      ].map((v, i) => (
        <g key={i} transform={`translate(${v.x}, ${v.y})`}>
          <line x1="0" y1="0" x2={v.dx} y2={v.dy} stroke={v.col} strokeWidth="1.8" />
          <circle cx={v.dx} cy={v.dy} r="2" fill={v.col} />
        </g>
      ))}

      {/* Circular Streamlines */}
      <circle cx="160" cy="100" r="42" stroke="#8B5CF6" strokeWidth="1.2" strokeDasharray="4 4" fill="none" />
      <circle cx="160" cy="100" r="75" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="5 5" fill="none" />

      {/* Central Singularity & Math Formula */}
      <circle cx="160" cy="100" r="4" fill="#FFFFFF" />
      <rect x="96" y="162" width="128" height="22" rx="4" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1" />
      <text x="160" y="177" fill="#C4B5FD" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        ∇ × F = 2ẑ  •  ∇ • F = 0
      </text>
    </svg>
  );
}

/**
 * 10. Keplerian Orbits (Physics Planned)
 */
export function KeplerOrbitPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Keplerian elliptical orbit and celestial dynamics"
    >
      <rect width="320" height="200" fill="#0B1120" />

      {/* Elliptical Keplerian Orbit (Semi-major a=110, Semi-minor b=65, Center at 160, 100) */}
      <ellipse cx="160" cy="100" rx="110" ry="65" stroke="#334155" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Focus: Central Sun (at focus c = sqrt(110^2 - 65^2) = 88.7 -> x = 160 - 55 = 105) */}
      <g transform="translate(105, 100)">
        <circle cx="0" cy="0" r="16" fill="#F59E0B" fillOpacity="0.3" />
        <circle cx="0" cy="0" r="10" fill="#FBBF24" />
        <text x="0" y="24" fill="#FDE68A" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
          M_sun
        </text>
      </g>

      {/* Orbiting Satellite / Planet at Perihelion */}
      <g transform="translate(230, 72)">
        <circle cx="0" cy="0" r="6" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.2" />
        {/* Tangent velocity vector */}
        <line x1="0" y1="0" x2="-20" y2="-18" stroke="#38BDF8" strokeWidth="1.8" />
        <polygon points="-20,-18 -12,-18 -17,-12" fill="#38BDF8" />
        <text x="-26" y="-12" fill="#38BDF8" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          v_orb
        </text>
      </g>

      {/* Swept equal area sector (Kepler 2nd law) */}
      <path d="M 105 100 L 230 72 A 110 65 0 0 1 254 90 Z" fill="#2563EB" fillOpacity="0.25" stroke="#2563EB" strokeWidth="1" />

      {/* Formula badge */}
      <rect x="80" y="162" width="160" height="22" rx="4" fill="#0F172A" stroke="#2563EB" strokeWidth="1" />
      <text x="160" y="177" fill="#60A5FA" fontSize="8.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        T² / a³ = 4π² / (GM)
      </text>
    </svg>
  );
}

/**
 * 11. Acid-Base Titration (Chemistry Planned)
 */
export function TitrationPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg
      viewBox="0 0 320 200"
      className={`w-full h-full select-none ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Acid-base chemical titration curve"
    >
      <rect width="320" height="200" fill="#0B1120" />

      {/* Burette on Left */}
      <g transform="translate(30, 20)">
        <rect x="14" y="0" width="12" height="70" fill="#1E293B" stroke="#475569" strokeWidth="1" />
        <polygon points="17,70 23,70 20,84" fill="#475569" />
        <circle cx="20" cy="94" r="2.5" fill="#F43F5E" />

        {/* Flask */}
        <polygon points="4,136 36,136 24,106 16,106" fill="#1E293B" stroke="#64748B" strokeWidth="1" />
        <path d="M 6,134 L 34,134 L 27,118 L 13,118 Z" fill="#F43F5E" fillOpacity="0.6" />
      </g>

      {/* Sigmoidal pH Titration Curve on Right */}
      <g transform="translate(90, 20)">
        <rect width="210" height="152" rx="4" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
        <text x="14" y="18" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          pH TITRATION CURVE
        </text>

        {/* Axes */}
        <line x1="24" y1="28" x2="24" y2="130" stroke="#334155" strokeWidth="1" />
        <line x1="24" y1="130" x2="190" y2="130" stroke="#334155" strokeWidth="1" />
        <text x="14" y="36" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">14</text>
        <text x="14" y="80" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">7</text>
        <text x="14" y="126" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">0</text>

        {/* Sigmoidal S-Curve */}
        <path
          d="M 24 122 C 70 120 90 115 106 80 C 114 45 130 36 180 34"
          stroke="#F59E0B"
          strokeWidth="2.2"
          fill="none"
        />

        {/* Equivalence Point Inflection at pH 7 */}
        <circle cx="106" cy="80" r="4" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="1" />
        <line x1="24" y1="80" x2="106" y2="80" stroke="#F43F5E" strokeWidth="0.8" strokeDasharray="2 2" />
        <line x1="106" y1="80" x2="106" y2="130" stroke="#F43F5E" strokeWidth="0.8" strokeDasharray="2 2" />
        <text x="114" y="82" fill="#FDA4AF" fontSize="7.5" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          Equivalence Point (pH=7)
        </text>
      </g>
    </svg>
  );
}

/**
 * 12. Generic ECE Curriculum Topic Fallback
 * Dynamically adapts according to category (Signals, Instrumentation, Semiconductor, etc.)
 */
export function GenericEceTopicPreview({
  category = '',
  className = '',
}: {
  category?: string;
  className?: string;
}) {
  const cat = category.toLowerCase();

  // DSP / Signal Processing
  if (cat.includes('signal') || cat.includes('dsp')) {
    return (
      <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#0B1120" />
        <rect x="20" y="20" width="280" height="160" rx="4" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
        <text x="36" y="42" fill="#06B6D4" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          DISCRETE TIME SIGNAL x[n] &amp; FFT
        </text>
        <line x1="40" y1="100" x2="280" y2="100" stroke="#334155" strokeWidth="1" />
        {/* Sampled stem pulses */}
        {[50, 70, 90, 110, 130, 150, 170, 190, 210, 230, 250, 270].map((x, i) => {
          const val = Math.sin(i * 0.7) * 35;
          return (
            <g key={x}>
              <line x1={x} y1="100" x2={x} y2={100 - val} stroke="#06B6D4" strokeWidth="1.5" />
              <circle cx={x} cy={100 - val} r="3" fill="#38BDF8" />
            </g>
          );
        })}
      </svg>
    );
  }

  // Semiconductor
  if (cat.includes('semiconductor') || cat.includes('device')) {
    return (
      <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="320" height="200" fill="#0B1120" />
        <rect x="20" y="20" width="280" height="160" rx="4" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
        <text x="36" y="42" fill="#F43F5E" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          PN JUNCTION ENERGY BAND DIAGRAM
        </text>
        {/* Conduction band Ec */}
        <path d="M 40 70 L 130 70 C 150 70 170 110 190 110 L 280 110" stroke="#F43F5E" strokeWidth="2" fill="none" />
        {/* Valence band Ev */}
        <path d="M 40 120 L 130 120 C 150 120 170 160 190 160 L 280 160" stroke="#38BDF8" strokeWidth="2" fill="none" />
        {/* Fermi level Ef */}
        <line x1="40" y1="95" x2="280" y2="95" stroke="#FBBF24" strokeWidth="1" strokeDasharray="3 3" />
        <text x="240" y="90" fill="#FBBF24" fontSize="8" fontFamily="JetBrains Mono, monospace">Ef</text>
        <text x="50" y="64" fill="#FDA4AF" fontSize="8" fontFamily="JetBrains Mono, monospace">Ec</text>
        <text x="50" y="134" fill="#93C5FD" fontSize="8" fontFamily="JetBrains Mono, monospace">Ev</text>
      </svg>
    );
  }

  // Default Circuit / Wave preview
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="20" y="20" width="280" height="160" rx="4" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="36" y="42" fill="#38BDF8" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        ANALYTICAL CIRCUIT SCHEMATIC
      </text>
      <circle cx="80" cy="100" r="24" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
      <path d="M 68 100 Q 74 88 80 100 Q 86 112 92 100" stroke="#38BDF8" strokeWidth="2" fill="none" />
      <line x1="104" y1="100" x2="160" y2="100" stroke="#64748B" strokeWidth="2" />
      <rect x="160" y="90" width="40" height="20" rx="2" fill="#1E293B" stroke="#F59E0B" strokeWidth="1.5" />
      <text x="180" y="104" fill="#FBBF24" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Z(s)</text>
      <line x1="200" y1="100" x2="240" y2="100" stroke="#64748B" strokeWidth="2" />
      <circle cx="240" cy="100" r="4" fill="#10B981" />
    </svg>
  );
}

/**
 * 13. Shift Register Preview (SIPO)
 */
export function ShiftRegisterPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="34" fill="#06B6D4" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        4-BIT SIPO SHIFT REGISTER (74164)
      </text>

      {/* Serial Input */}
      <rect x="24" y="70" width="30" height="18" rx="3" fill="#065F46" stroke="#10B981" strokeWidth="1" />
      <text x="39" y="82" fill="#A7F3D0" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        SIN=1
      </text>
      <line x1="54" y1="79" x2="70" y2="79" stroke="#10B981" strokeWidth="2" />

      {/* 4 D-FF Stages */}
      {[0, 1, 2, 3].map((i) => {
        const x = 70 + i * 55;
        const bits = [1, 0, 1, 1];
        const val = bits[i];
        return (
          <g key={i} transform={`translate(${x}, 52)`}>
            <rect width="46" height="60" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
            <text x="23" y="14" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
              FF{i}
            </text>
            <circle cx="23" cy="34" r="10" fill={val === 1 ? '#065F46' : '#1E293B'} stroke={val === 1 ? '#10B981' : '#475569'} strokeWidth="1.5" />
            <text x="23" y="38" fill={val === 1 ? '#34D399' : '#64748B'} fontSize="11" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
              {val}
            </text>
            {i < 3 && <line x1="46" y1="34" x2="55" y2="34" stroke={val === 1 ? '#10B981' : '#475569'} strokeWidth="2" />}
            {/* Parallel Out */}
            <line x1="23" y1="44" x2="23" y2="70" stroke={val === 1 ? '#10B981' : '#475569'} strokeWidth="1.5" />
          </g>
        );
      })}

      {/* Bus Hex Word */}
      <rect x="70" y="132" width="211" height="26" rx="4" fill="#1E293B" stroke="#06B6D4" strokeWidth="1" />
      <text x="80" y="149" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace">
        PARALLEL BUS [Q3..Q0]:
      </text>
      <text x="230" y="150" fill="#38BDF8" fontSize="11" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        1011 (0xB)
      </text>
    </svg>
  );
}

/**
 * 14. Counter Timing & Glitch Preview
 */
export function CounterTimingPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="34" fill="#F59E0B" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        RIPPLE SKEW &amp; TRANSIENT DECODING GLITCH
      </text>

      {/* Clock line */}
      <text x="24" y="62" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">CLK</text>
      <path d="M 50 64 L 70 64 L 70 52 L 90 52 L 90 64 L 110 64 L 110 52 L 130 52 L 130 64 L 290 64" stroke="#FBBF24" strokeWidth="1.5" fill="none" />

      {/* Bit 0 Q0 */}
      <text x="24" y="86" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">Q0 (10ns)</text>
      <path d="M 50 88 L 76 88 L 76 76 L 120 76 L 120 88 L 290 88" stroke="#10B981" strokeWidth="1.5" fill="none" />

      {/* Bit 1 Q1 with skew delay */}
      <text x="24" y="110" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">Q1 (20ns)</text>
      <path d="M 50 112 L 86 112 L 86 100 L 150 100 L 150 112 L 290 112" stroke="#06B6D4" strokeWidth="1.5" fill="none" />

      {/* Bit 2 Q2 */}
      <text x="24" y="134" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">Q2 (30ns)</text>
      <path d="M 50 136 L 96 136 L 96 124 L 200 124 L 200 136 L 290 136" stroke="#8B5CF6" strokeWidth="1.5" fill="none" />

      {/* Glitch Spike Marker */}
      <rect x="76" y="146" width="20" height="26" rx="2" fill="#881337" fillOpacity="0.4" stroke="#F43F5E" strokeWidth="1" />
      <path d="M 82 168 L 86 150 L 90 168" stroke="#F43F5E" strokeWidth="2" fill="none" />
      <text x="104" y="163" fill="#FDA4AF" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        TRANSIENT GLITCH SPIKE
      </text>
    </svg>
  );
}

/**
 * 15. Gray Code Optical Encoder Preview
 */
export function GrayCodePreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="34" fill="#38BDF8" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        REFLECTED GRAY CODE SHAFT ENCODER
      </text>

      {/* Rotary Optical Disk Pattern */}
      <g transform="translate(85, 110)">
        <circle cx="0" cy="0" r="54" fill="#0F172A" stroke="#334155" strokeWidth="2" />
        <circle cx="0" cy="0" r="42" fill="none" stroke="#06B6D4" strokeWidth="6" strokeDasharray="16 16" />
        <circle cx="0" cy="0" r="30" fill="none" stroke="#F59E0B" strokeWidth="6" strokeDasharray="32 32" />
        <circle cx="0" cy="0" r="18" fill="none" stroke="#10B981" strokeWidth="6" strokeDasharray="64 64" />
        <circle cx="0" cy="0" r="6" fill="#1E293B" stroke="#475569" strokeWidth="1" />
      </g>

      {/* Ladder Equations Box */}
      <g transform="translate(160, 48)">
        <rect width="134" height="120" rx="4" fill="#0F172A" stroke="#334155" strokeWidth="1" />
        <text x="14" y="20" fill="#A7F3D0" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          XOR LADDER:
        </text>
        <text x="14" y="42" fill="#E2E8F0" fontSize="8" fontFamily="JetBrains Mono, monospace">G3 = B3 = 1</text>
        <text x="14" y="60" fill="#38BDF8" fontSize="8" fontFamily="JetBrains Mono, monospace">G2 = B3 ⊕ B2 = 1</text>
        <text x="14" y="78" fill="#FBBF24" fontSize="8" fontFamily="JetBrains Mono, monospace">G1 = B2 ⊕ B1 = 0</text>
        <text x="14" y="96" fill="#F43F5E" fontSize="8" fontFamily="JetBrains Mono, monospace">G0 = B1 ⊕ B0 = 1</text>
        <line x1="14" y1="104" x2="120" y2="104" stroke="#334155" strokeWidth="1" />
        <text x="14" y="114" fill="#34D399" fontSize="7.5" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
          Hamming Distance H = 1
        </text>
      </g>
    </svg>
  );
}

/**
 * 16. Magnitude Comparator Preview
 */
export function MagnitudeComparatorPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="34" fill="#8B5CF6" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        4-BIT MAGNITUDE COMPARATOR (7485)
      </text>

      {/* Input Bus A */}
      <rect x="24" y="62" width="60" height="26" rx="4" fill="#1E3A8A" stroke="#3B82F6" strokeWidth="1" />
      <text x="54" y="78" fill="#93C5FD" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        A = 1100 (12)
      </text>

      {/* Input Bus B */}
      <rect x="24" y="112" width="60" height="26" rx="4" fill="#312E81" stroke="#6366F1" strokeWidth="1" />
      <text x="54" y="128" fill="#C7D2FE" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        B = 1001 (9)
      </text>

      {/* Central Chip Body */}
      <rect x="110" y="52" width="90" height="100" rx="4" fill="#0F172A" stroke="#8B5CF6" strokeWidth="2" />
      <text x="155" y="85" fill="#E2E8F0" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        74LS85
      </text>
      <text x="155" y="102" fill="#A78BFA" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
        4-BIT COMP
      </text>
      <text x="155" y="122" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
        CASCADED
      </text>

      {/* 3 Output Flags */}
      {/* A > B (ACTIVE GREEN) */}
      <rect x="226" y="56" width="68" height="24" rx="4" fill="#065F46" stroke="#10B981" strokeWidth="1.5" />
      <circle cx="238" cy="68" r="4" fill="#10B981" />
      <text x="250" y="72" fill="#A7F3D0" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        A &gt; B: 1
      </text>

      {/* A = B (INACTIVE) */}
      <rect x="226" y="90" width="68" height="24" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />
      <circle cx="238" cy="102" r="4" fill="#475569" />
      <text x="250" y="106" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono, monospace">
        A = B: 0
      </text>

      {/* A < B (INACTIVE) */}
      <rect x="226" y="124" width="68" height="24" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />
      <circle cx="238" cy="136" r="4" fill="#475569" />
      <text x="250" y="140" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono, monospace">
        A &lt; B: 0
      </text>
    </svg>
  );
}

/**
 * 17. RS Latch & Flip-Flop Preview
 */
export function LatchFlipFlopPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="34" fill="#F43F5E" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        BISTABLE LATCH &amp; FLIP-FLOP MEMORY
      </text>

      {/* Reset Input */}
      <text x="24" y="65" fill="#FDA4AF" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">R=0</text>
      <line x1="45" y1="62" x2="80" y2="62" stroke="#475569" strokeWidth="2" />

      {/* Upper NOR */}
      <rect x="80" y="48" width="55" height="32" rx="4" fill="#1E293B" stroke="#F43F5E" strokeWidth="1.5" />
      <text x="107" y="68" fill="#FDA4AF" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        NOR 1
      </text>

      {/* Set Input */}
      <text x="24" y="140" fill="#A7F3D0" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">S=1</text>
      <line x1="45" y1="137" x2="80" y2="137" stroke="#10B981" strokeWidth="2" />

      {/* Lower NOR */}
      <rect x="80" y="122" width="55" height="32" rx="4" fill="#1E293B" stroke="#10B981" strokeWidth="1.5" />
      <text x="107" y="142" fill="#A7F3D0" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        NOR 2
      </text>

      {/* Cross-Coupled Feedback Wires */}
      <path d="M 135 64 L 160 64 L 70 130 L 80 130" stroke="#475569" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />
      <path d="M 135 138 L 160 138 L 70 72 L 80 72" stroke="#10B981" strokeWidth="1.5" strokeDasharray="3 3" fill="none" />

      {/* Q Output (HIGH) */}
      <line x1="135" y1="138" x2="200" y2="138" stroke="#10B981" strokeWidth="2" />
      <rect x="200" y="125" width="70" height="26" rx="4" fill="#065F46" stroke="#10B981" strokeWidth="1.5" />
      <text x="235" y="142" fill="#A7F3D0" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">
        Q = 1 (SET)
      </text>

      {/* QBar Output (LOW) */}
      <line x1="135" y1="64" x2="200" y2="64" stroke="#475569" strokeWidth="2" />
      <rect x="200" y="51" width="70" height="26" rx="4" fill="#1E293B" stroke="#475569" strokeWidth="1" />
      <text x="235" y="68" fill="#94A3B8" fontSize="9" fontFamily="JetBrains Mono, monospace" textAnchor="middle">
        Q̄ = 0
      </text>
    </svg>
  );
}

/**
 * 18. Network Theorems (Thévenin, Norton & Maximum Power) Preview
 */
export function NetworkTheoremsPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      
      {/* Title */}
      <text x="24" y="32" fill="#38BDF8" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        THÉVENIN REDUCTION &amp; MAX POWER
      </text>

      {/* Left: Circuit Schematic */}
      {/* Vth Source */}
      <circle cx="50" cy="90" r="14" stroke="#38BDF8" strokeWidth="1.5" fill="#0B1120" />
      <text x="50" y="93" fill="#38BDF8" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">Vth</text>
      
      {/* Rth Resistor */}
      <path d="M 50 76 L 50 65 L 75 65 L 80 58 L 88 72 L 96 58 L 104 72 L 112 58 L 117 65 L 135 65" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
      <text x="96" y="52" fill="#FBBF24" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Rth</text>

      {/* Load Terminals */}
      <circle cx="135" cy="65" r="2.5" fill="#F43F5E" />
      <circle cx="135" cy="115" r="2.5" fill="#94A3B8" />
      <path d="M 50 104 L 50 115 L 135 115" stroke="#475569" strokeWidth="1.5" fill="none" />

      {/* RL Box */}
      <rect x="125" y="75" width="20" height="30" rx="3" fill="#065F46" stroke="#10B981" strokeWidth="1.5" />
      <text x="135" y="93" fill="#A7F3D0" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">RL</text>
      <line x1="135" y1="65" x2="135" y2="75" stroke="#10B981" strokeWidth="1.5" />
      <line x1="135" y1="105" x2="135" y2="115" stroke="#10B981" strokeWidth="1.5" />

      {/* Right: Power Curve PL vs RL */}
      <g transform="translate(170, 45)">
        {/* Axes */}
        <line x1="15" y1="95" x2="120" y2="95" stroke="#475569" strokeWidth="1" />
        <line x1="15" y1="20" x2="15" y2="95" stroke="#475569" strokeWidth="1" />
        <text x="115" y="105" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="end">RL</text>
        <text x="8" y="25" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">PL</text>

        {/* Parabolic Power Curve */}
        <path d="M 15 95 Q 60 15 115 70" stroke="#10B981" strokeWidth="2" fill="none" />

        {/* Peak indicator */}
        <line x1="60" y1="28" x2="60" y2="95" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="60" cy="28" r="3" fill="#38BDF8" />
        <text x="60" y="20" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">RL = Rth</text>
        <text x="60" y="105" fill="#10B981" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">η = 50%</text>
      </g>

      {/* Footer banner */}
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Voc = Vth • In = Vth/Rth • P_max = Vth²/(4Rth)
      </text>
    </svg>
  );
}

/**
 * 19. Wave Optics (Double Slit & Diffraction) Preview
 */
export function WaveOpticsPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />

      {/* Title */}
      <text x="24" y="32" fill="#F43F5E" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        WAVE OPTICS: DOUBLE SLIT INTERFERENCE
      </text>

      {/* Laser source */}
      <rect x="25" y="85" width="45" height="30" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1" />
      <text x="47" y="103" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">LASER</text>
      <line x1="70" y1="100" x2="135" y2="100" stroke="#E11D48" strokeWidth="2.5" />

      {/* Slits */}
      <rect x="135" y="50" width="8" height="100" fill="#0F172A" stroke="#64748B" strokeWidth="1.5" rx="1" />
      <line x1="135" y1="96" x2="143" y2="96" stroke="#000" strokeWidth="2" />
      <line x1="135" y1="104" x2="143" y2="104" stroke="#000" strokeWidth="2" />
      <text x="139" y="44" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">d = 0.25mm</text>

      {/* Rays */}
      <polygon points="143,100 240,40 240,160" fill="#E11D48" opacity="0.08" />

      {/* Screen Fringes */}
      <rect x="240" y="40" width="22" height="120" fill="#020617" stroke="#334155" strokeWidth="1.5" rx="2" />
      {Array.from({ length: 24 }).map((_, i) => {
        const y = 42 + i * 5;
        const dist = Math.abs(i - 12);
        const op = Math.max(0.05, 1.0 - dist * 0.08) * (i % 2 === 0 ? 1 : 0.15);
        return <rect key={i} x="242" y={y} width="18" height="3" fill="#E11D48" opacity={op} />;
      })}

      {/* Fringe width annotation */}
      <line x1="268" y1="95" x2="268" y2="105" stroke="#38BDF8" strokeWidth="1" />
      <text x="272" y="103" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace">w = λD/d</text>

      {/* Footer */}
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        λ = 632.8nm • I(θ) = I₀ · (sinα/α)² · cos²β
      </text>
    </svg>
  );
}

/**
 * 12. Bridge Truss Mechanics Preview
 */
export function TrussStructuralPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      {/* Abutments */}
      <rect x="20" y="140" width="30" height="40" fill="#334155" />
      <rect x="270" y="140" width="30" height="40" fill="#334155" />
      {/* Bottom Chord (Tension - Blue) */}
      <line x1="40" y1="140" x2="280" y2="140" stroke="#3B82F6" strokeWidth="3" />
      {/* Top Chord (Compression - Red) */}
      <line x1="100" y1="70" x2="220" y2="70" stroke="#EF4444" strokeWidth="3" />
      {/* Web Members */}
      <line x1="40" y1="140" x2="100" y2="70" stroke="#EF4444" strokeWidth="2.5" />
      <line x1="100" y1="70" x2="160" y2="140" stroke="#3B82F6" strokeWidth="2.5" />
      <line x1="160" y1="140" x2="220" y2="70" stroke="#3B82F6" strokeWidth="2.5" />
      <line x1="220" y1="70" x2="280" y2="140" stroke="#EF4444" strokeWidth="2.5" />
      {/* Center Post */}
      <line x1="160" y1="140" x2="160" y2="70" stroke="#94A3B8" strokeWidth="2" strokeDasharray="3 3" />
      {/* Point load arrow */}
      <line x1="160" y1="15" x2="160" y2="60" stroke="#F97316" strokeWidth="2.5" />
      <polygon points="156,55 160,68 164,55" fill="#F97316" />
      <text x="160" y="12" fill="#F97316" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="middle">P = 60kN</text>
      {/* Joints */}
      {[[40,140],[160,140],[280,140],[100,70],[220,70]].map(([x,y], idx) => (
        <circle key={idx} cx={x} cy={y} r="3.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
      ))}
      <text x="24" y="188" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Warren Bridge Truss • Method of Joints • m + r = 2j
      </text>
    </svg>
  );
}

/**
 * 13. Robotics Serial Arm Kinematics Preview
 */
export function RoboticsKinematicsPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      {/* Workspace Envelope */}
      <circle cx="160" cy="150" r="110" fill="none" stroke="#06B6D4" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      {/* Base */}
      <rect x="145" y="148" width="30" height="15" rx="3" fill="#334155" />
      <circle cx="160" cy="150" r="6" fill="#0EA5E9" />
      {/* Link 1 */}
      <line x1="160" y1="150" x2="210" y2="90" stroke="#0284C7" strokeWidth="5" strokeLinecap="round" />
      {/* Joint 2 */}
      <circle cx="210" cy="90" r="5" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2" />
      {/* Link 2 */}
      <line x1="210" y1="90" x2="255" y2="70" stroke="#06B6D4" strokeWidth="4" strokeLinecap="round" />
      {/* End-Effector Gripper */}
      <circle cx="255" cy="70" r="4.5" fill="#F43F5E" />
      <path d="M 255 66 L 265 62 M 255 74 L 265 78" stroke="#F43F5E" strokeWidth="2" strokeLinecap="round" />
      <text x="24" y="188" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Robotics Kinematics • DH Matrix [T] • det(J) = l₁l₂·sinθ₂
      </text>
    </svg>
  );
}

/**
 * 14. McCabe-Thiele Distillation Preview
 */
export function DistillationColumnPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      {/* Box */}
      <rect x="50" y="30" width="120" height="120" fill="#0F172A" stroke="#334155" strokeWidth="1" />
      <line x1="50" y1="150" x2="170" y2="30" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
      {/* VLE curve */}
      <path d="M 50 150 Q 80 50 170 30" stroke="#10B981" strokeWidth="2" fill="none" />
      {/* Stepping staircase */}
      <path
        d="M 160 40 L 135 40 L 135 62 L 110 62 L 110 88 L 85 88 L 85 118 L 65 118 L 65 145"
        stroke="#F59E0B"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Distillation Tower on Right */}
      <rect x="220" y="40" width="50" height="110" rx="25" fill="#1E293B" stroke="#0284C7" strokeWidth="2" />
      {[60, 75, 90, 105, 120, 135].map((y) => (
        <line key={y} x1="225" y1={y} x2="265" y2={y} stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
      ))}
      <text x="24" y="188" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        McCabe-Thiele • VLE Equilibrium • R = L/D • N_trays
      </text>
    </svg>
  );
}

/**
 * 15. Enzyme Kinetics Preview
 */
export function EnzymeKineticsPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      {/* Axes */}
      <line x1="40" y1="150" x2="280" y2="150" stroke="#475569" strokeWidth="1.5" />
      <line x1="40" y1="30" x2="40" y2="150" stroke="#475569" strokeWidth="1.5" />
      {/* Vmax Asymptote */}
      <line x1="40" y1="50" x2="280" y2="50" stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
      <text x="275" y="45" fill="#94A3B8" fontSize="8" fontFamily="JetBrains Mono, monospace" textAnchor="end">V_max</text>
      {/* Uninhibited Hyperbolic Curve */}
      <path d="M 40 150 Q 80 60 280 52" stroke="#EC4899" strokeWidth="2.5" fill="none" />
      {/* Competitive Inhibited Curve */}
      <path d="M 40 150 Q 140 85 280 54" stroke="#8B5CF6" strokeWidth="1.8" strokeDasharray="4 2" fill="none" />
      <text x="24" y="188" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Michaelis-Menten Kinetics • v₀ = V_max[S] / (K_m + [S])
      </text>
    </svg>
  );
}

/**
 * 23. Venturi Flow & Bernoulli Equation Preview
 */
export function VenturiFlowPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#06B6D4" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        VENTURIMETER &amp; BERNOULLI THEOREM
      </text>
      {/* Venturi Tube Outline */}
      <path
        d="M 25 70 L 100 70 L 150 95 L 170 95 L 220 70 L 295 70 L 295 130 L 220 130 L 170 105 L 150 105 L 100 130 L 25 130 Z"
        fill="#0E2F44"
        stroke="#0284C7"
        strokeWidth="1.5"
      />
      {/* Piezometer 1 (Inlet) */}
      <rect x="58" y="38" width="14" height="32" fill="#0B1120" stroke="#0284C7" strokeWidth="1" />
      <rect x="59" y="44" width="12" height="26" fill="#0284C7" opacity="0.6" />
      <line x1="58" y1="44" x2="72" y2="44" stroke="#38BDF8" strokeWidth="1.5" />
      <text x="65" y="41" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">h₁</text>
      {/* Piezometer 2 (Throat) */}
      <rect x="153" y="58" width="14" height="37" fill="#0B1120" stroke="#0284C7" strokeWidth="1" />
      <rect x="154" y="78" width="12" height="17" fill="#0284C7" opacity="0.6" />
      <line x1="153" y1="78" x2="167" y2="78" stroke="#F59E0B" strokeWidth="1.5" />
      <text x="160" y="74" fill="#FBBF24" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">h₂</text>
      {/* Streamlines */}
      <path
        d="M 25 100 L 100 100 L 150 100 L 170 100 L 220 100 L 295 100"
        stroke="#38BDF8"
        strokeWidth="1.2"
        strokeDasharray="4 3"
        strokeDashoffset={isHovered ? 0 : 7}
        className="transition-all duration-700"
      />
      <path
        d="M 25 85 L 100 85 L 150 98 L 170 98 L 220 85 L 295 85"
        stroke="#06B6D4"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      <path
        d="M 25 115 L 100 115 L 150 102 L 170 102 L 220 115 L 295 115"
        stroke="#06B6D4"
        strokeWidth="1"
        strokeDasharray="3 3"
      />
      {/* Velocity Vectors */}
      <text x="45" y="118" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace">v₁ (low)</text>
      <text x="145" y="120" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" fontWeight="bold">v₂ (high)</text>
      {/* Footer */}
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        P₁ + ½ρv₁² = P₂ + ½ρv₂² • Q = C_d · A₁A₂√(2gΔh / (A₁²-A₂²))
      </text>
    </svg>
  );
}

/**
 * 24. Tensile Test & Stress-Strain Curve Preview
 */
export function TensileTestPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#EF4444" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        UTM TENSILE TEST &amp; STRESS-STRAIN
      </text>
      {/* Left: Dogbone specimen in crossheads */}
      <g transform="translate(30, 45)">
        {/* Upper grip */}
        <rect x="5" y="0" width="36" height="14" rx="2" fill="#334155" stroke="#64748B" strokeWidth="1" />
        <line x1="23" y1="0" x2="23" y2="-8" stroke="#EF4444" strokeWidth="2" />
        <polygon points="20,-8 23,-14 26,-8" fill="#EF4444" />
        {/* Specimen */}
        <path
          d="M 12 14 L 34 14 L 28 30 L 28 65 L 34 80 L 12 80 L 18 65 L 18 30 Z"
          fill="#475569"
          stroke="#94A3B8"
          strokeWidth="1"
        />
        {/* Necking zone */}
        <ellipse cx="23" cy="48" rx="4" ry="2" fill="#F43F5E" opacity="0.6" />
        {/* Lower grip */}
        <rect x="5" y="80" width="36" height="14" rx="2" fill="#334155" stroke="#64748B" strokeWidth="1" />
        <line x1="23" y1="94" x2="23" y2="102" stroke="#EF4444" strokeWidth="2" />
        <polygon points="20,102 23,108 26,102" fill="#EF4444" />
      </g>
      {/* Right: Stress-Strain Curve */}
      <g transform="translate(105, 45)">
        <line x1="15" y1="95" x2="185" y2="95" stroke="#475569" strokeWidth="1.5" />
        <line x1="15" y1="10" x2="15" y2="95" stroke="#475569" strokeWidth="1.5" />
        <text x="185" y="105" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">Strain ε</text>
        <text x="12" y="8" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">Stress σ (MPa)</text>
        {/* Curve: Linear elastic -> Yield -> UTS peak -> Fracture */}
        <path
          d="M 15 95 L 45 45 Q 60 48 80 43 Q 120 22 150 25 L 165 40"
          stroke="#EF4444"
          strokeWidth="2.2"
          fill="none"
        />
        {/* Markers */}
        <circle cx="45" cy="45" r="2.5" fill="#FBBF24" />
        <text x="50" y="42" fill="#FBBF24" fontSize="6.5" fontFamily="JetBrains Mono, monospace">σ_y (Yield)</text>
        <circle cx="140" cy="23" r="2.5" fill="#10B981" />
        <text x="125" y="17" fill="#10B981" fontSize="6.5" fontFamily="JetBrains Mono, monospace">UTS = 460MPa</text>
        <circle cx="165" cy="40" r="2.5" fill="#F43F5E" />
        <text x="168" y="44" fill="#F43F5E" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Fracture</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        E = σ/ε (Young&apos;s Modulus) • Mild Steel • Yield: 250 MPa • Elongation: 26%
      </text>
    </svg>
  );
}

/**
 * 25. Pipe Friction & Moody Resistance Preview
 */
export function PipeFrictionPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#3B82F6" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        DARCY-WEISBACH PIPE FRICTION &amp; LOSSES
      </text>
      {/* Pipe section with velocity profile */}
      <rect x="25" y="55" width="150" height="50" rx="3" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
      <line x1="25" y1="80" x2="175" y2="80" stroke="#1E293B" strokeWidth="1" strokeDasharray="3 3" />
      {/* Parabolic velocity profile arrows */}
      {[60, 68, 76, 84, 92, 100].map((y) => {
        const dy = Math.abs(y - 80);
        const len = Math.max(10, 48 - (dy * dy) / 9);
        return (
          <g key={y}>
            <line x1="35" y1={y} x2={35 + len} y2={y} stroke="#38BDF8" strokeWidth="1.2" />
            <polygon points={`${35 + len},${y} ${30 + len},${y - 2} ${30 + len},${y + 2}`} fill="#38BDF8" />
          </g>
        );
      })}
      <path d="M 35 55 Q 85 80 35 105" stroke="#0EA5E9" strokeWidth="1.5" fill="none" />
      {/* Manometer tubes */}
      <line x1="55" y1="55" x2="55" y2="42" stroke="#38BDF8" strokeWidth="2" />
      <line x1="145" y1="55" x2="145" y2="47" stroke="#38BDF8" strokeWidth="2" />
      <text x="55" y="39" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">h₁</text>
      <text x="145" y="44" fill="#F59E0B" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">h₂</text>
      {/* Right: Moody chart miniature */}
      <g transform="translate(195, 48)">
        <rect x="0" y="0" width="95" height="65" fill="#0B1120" stroke="#334155" strokeWidth="1" />
        <text x="4" y="10" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">f vs Re</text>
        <line x1="5" y1="20" x2="30" y2="55" stroke="#10B981" strokeWidth="1.5" />
        <text x="10" y="32" fill="#10B981" fontSize="6" fontFamily="JetBrains Mono, monospace">Laminar</text>
        <path d="M 40 45 C 55 35 75 32 90 31" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
        <path d="M 40 40 C 55 28 75 25 90 24" stroke="#EF4444" strokeWidth="1.2" strokeDasharray="2 1" fill="none" />
        <text x="52" y="60" fill="#64748B" fontSize="6" fontFamily="JetBrains Mono, monospace">Re &gt; 4000</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        h_f = f(L/D)(v²/2g) • f_laminar = 64/Re • Swamee-Jain Colebrook
      </text>
    </svg>
  );
}

/**
 * 26. Torsion Testing of Shaft Preview
 */
export function TorsionTestPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#8B5CF6" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        TORSION TEST &amp; SHEAR MODULUS (G)
      </text>
      {/* Fixed Chuck on Left */}
      <rect x="25" y="60" width="22" height="60" rx="3" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
      {/* Circular Shaft */}
      <rect x="47" y="70" width="150" height="40" fill="#1E293B" stroke="#475569" strokeWidth="1.2" />
      {/* Torsion spiral / helical shear lines */}
      <path
        d="M 47 70 Q 75 80 100 90 Q 130 100 160 105 Q 185 108 197 110"
        stroke="#8B5CF6"
        strokeWidth="2"
        strokeDasharray={isHovered ? 'none' : '3 2'}
        fill="none"
      />
      <path
        d="M 47 85 Q 75 95 100 102 Q 130 108 160 110"
        stroke="#A78BFA"
        strokeWidth="1.2"
        strokeDasharray="3 2"
        fill="none"
      />
      {/* Rotating Head on Right */}
      <rect x="197" y="60" width="22" height="60" rx="3" fill="#334155" stroke="#8B5CF6" strokeWidth="1.5" />
      {/* Torque circular arrow indicator */}
      <path d="M 235 70 A 20 20 0 1 1 235 110" stroke="#F59E0B" strokeWidth="2.2" fill="none" />
      <polygon points="233,65 242,70 236,75" fill="#F59E0B" />
      <text x="260" y="93" fill="#FBBF24" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">T (N·m)</text>
      {/* Twist angle marker */}
      <text x="120" y="65" fill="#C4B5FD" fontSize="8" fontFamily="JetBrains Mono, monospace">Twist θ = 4.2°</text>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        T/J = τ/r = Gθ/L • J = πD⁴/32 • G = TL / (Jθ) • τ_max = Tr/J
      </text>
    </svg>
  );
}

/**
 * 27. Four-Bar Linkage Kinematics Preview
 */
export function FourBarPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#10B981" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        FOUR-BAR PLANAR MECHANISM (GRASHOF)
      </text>
      {/* Ground fixed link O2 - O4 */}
      <line x1="80" y1="135" x2="220" y2="135" stroke="#475569" strokeWidth="3" strokeDasharray="4 2" />
      <rect x="73" y="135" width="14" height="10" fill="#334155" />
      <rect x="213" y="135" width="14" height="10" fill="#334155" />
      {/* Crank circle orbit */}
      <circle cx="80" cy="135" r="38" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" fill="none" />
      {/* Crank link (a) */}
      <line x1="80" y1="135" x2="105" y2="105" stroke="#F59E0B" strokeWidth="3.5" strokeLinecap="round" />
      {/* Coupler link (b) */}
      <line x1="105" y1="105" x2="185" y2="85" stroke="#10B981" strokeWidth="3.5" strokeLinecap="round" />
      {/* Rocker link (c) */}
      <line x1="185" y1="85" x2="220" y2="135" stroke="#3B82F6" strokeWidth="3.5" strokeLinecap="round" />
      {/* Coupler point tracer path */}
      <path
        d="M 145 95 C 130 65 170 50 190 75 C 210 100 160 125 145 95"
        stroke="#EC4899"
        strokeWidth="1.5"
        strokeDasharray="2 2"
        fill="none"
      />
      <circle cx="145" cy="95" r="3" fill="#EC4899" />
      {/* Joint pins */}
      <circle cx="80" cy="135" r="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
      <circle cx="105" cy="105" r="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
      <circle cx="185" cy="85" r="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
      <circle cx="220" cy="135" r="4" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Grashof: s + l ≤ p + q • Crank-Rocker • Transmission Angle μ = 62°
      </text>
    </svg>
  );
}

/**
 * 28. Beam Bending & Dual SFD/BMD Preview
 */
export function BeamBendingPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#F59E0B" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        BEAM BENDING &amp; SFD / BMD DIAGRAMS
      </text>
      {/* Loaded Beam with deflection */}
      <line x1="40" y1="60" x2="280" y2="60" stroke="#475569" strokeWidth="4" />
      {/* Deflected elastic curve */}
      <path d="M 40 60 Q 160 74 280 60" stroke="#F59E0B" strokeWidth="2" strokeDasharray="3 2" fill="none" />
      {/* Supports */}
      <polygon points="34,70 40,62 46,70" fill="#94A3B8" />
      <circle cx="280" cy="66" r="4" fill="#94A3B8" />
      {/* Point load arrow */}
      <line x1="160" y1="36" x2="160" y2="58" stroke="#EF4444" strokeWidth="2.5" />
      <polygon points="156,54 160,60 164,54" fill="#EF4444" />
      <text x="160" y="32" fill="#EF4444" fontSize="7.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">P = 20 kN</text>
      {/* SFD (Shear Force Diagram) */}
      <g transform="translate(40, 85)">
        <line x1="0" y1="12" x2="240" y2="12" stroke="#334155" strokeWidth="1" />
        <rect x="0" y="2" width="120" height="10" fill="#3B82F6" opacity="0.3" stroke="#3B82F6" strokeWidth="1" />
        <rect x="120" y="12" width="120" height="10" fill="#EF4444" opacity="0.3" stroke="#EF4444" strokeWidth="1" />
        <text x="2" y="8" fill="#38BDF8" fontSize="6.5" fontFamily="JetBrains Mono, monospace">+V</text>
        <text x="220" y="20" fill="#F87171" fontSize="6.5" fontFamily="JetBrains Mono, monospace">-V</text>
      </g>
      {/* BMD (Bending Moment Diagram) */}
      <g transform="translate(40, 120)">
        <line x1="0" y1="0" x2="240" y2="0" stroke="#334155" strokeWidth="1" />
        <path d="M 0 0 L 120 20 L 240 0 Z" fill="#10B981" opacity="0.25" stroke="#10B981" strokeWidth="1.5" />
        <text x="120" y="16" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">M_max = PL/4</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        M/I = σ/y = E/R • Simply Supported • L = 6m • EI d²y/dx² = M(x)
      </text>
    </svg>
  );
}

/**
 * 29. Column Buckling (Euler Critical Load) Preview
 */
export function ColumnBucklingPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#78716C" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        EULER COLUMN BUCKLING &amp; SLENDERNESS
      </text>
      {/* Base fixed clamp */}
      <rect x="135" y="135" width="50" height="12" fill="#334155" stroke="#64748B" strokeWidth="1" />
      {/* Unbuckled reference line */}
      <line x1="160" y1="45" x2="160" y2="135" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
      {/* Sinusoidal Buckled Mode Shape (n=1) */}
      <path
        d="M 160 45 Q 192 90 160 135"
        stroke="#E11D48"
        strokeWidth="3.2"
        fill="none"
        strokeDasharray={isHovered ? 'none' : '180'}
      />
      {/* Axial compressive load arrow */}
      <line x1="160" y1="20" x2="160" y2="42" stroke="#EF4444" strokeWidth="2.5" />
      <polygon points="156,38 160,45 164,38" fill="#EF4444" />
      <text x="160" y="16" fill="#F87171" fontSize="7.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">P_cr</text>
      {/* Max lateral deflection delta */}
      <line x1="160" y1="90" x2="188" y2="90" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="2 1" />
      <text x="195" y="93" fill="#FBBF24" fontSize="7" fontFamily="JetBrains Mono, monospace">δ_max</text>
      {/* Formula & Slenderness annotations */}
      <g transform="translate(30, 75)">
        <text x="0" y="0" fill="#94A3B8" fontSize="7.5" fontFamily="JetBrains Mono, monospace">λ = L_eff / r</text>
        <text x="0" y="14" fill="#64748B" fontSize="7" fontFamily="JetBrains Mono, monospace">Slenderness &gt; 100</text>
        <text x="0" y="28" fill="#10B981" fontSize="7" fontFamily="JetBrains Mono, monospace">Elastic Regime</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        P_cr = π²EI / (KL)² • Both Ends Pinned (K=1.0) • σ_cr = π²E / λ²
      </text>
    </svg>
  );
}

/**
 * 30. Direct Shear Test & Mohr-Coulomb Preview
 */
export function DirectShearPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#D97706" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        DIRECT SHEAR TEST &amp; MOHR-COULOMB (SOIL)
      </text>
      {/* Shear Box Apparatus */}
      <g transform="translate(30, 50)">
        {/* Upper split box */}
        <rect x="0" y="0" width="80" height="22" fill="#334155" stroke="#64748B" strokeWidth="1" />
        {/* Normal Load P_N */}
        <line x1="40" y1="-15" x2="40" y2="-2" stroke="#EF4444" strokeWidth="2" />
        <polygon points="37,-4 40,0 43,-4" fill="#EF4444" />
        <text x="40" y="-18" fill="#EF4444" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">σ_n</text>
        {/* Horizontal Shear Force T */}
        <line x1="-15" y1="11" x2="-2" y2="11" stroke="#3B82F6" strokeWidth="2" />
        <polygon points="-4,8 0,11 -4,14" fill="#3B82F6" />
        <text x="-18" y="14" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="end">τ</text>
        {/* Shear plane */}
        <line x1="0" y1="22" x2="80" y2="22" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 2" />
        {/* Lower split box */}
        <rect x="0" y="22" width="80" height="22" fill="#1E293B" stroke="#475569" strokeWidth="1" />
      </g>
      {/* Mohr-Coulomb Failure Envelope Graph */}
      <g transform="translate(150, 48)">
        <line x1="15" y1="80" x2="135" y2="80" stroke="#475569" strokeWidth="1.2" />
        <line x1="15" y1="10" x2="15" y2="80" stroke="#475569" strokeWidth="1.2" />
        <text x="135" y="90" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">σ_n</text>
        <text x="10" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">τ</text>
        {/* Failure Envelope Line: intercept c, angle phi */}
        <line x1="15" y1="62" x2="125" y2="20" stroke="#F59E0B" strokeWidth="2" />
        <circle cx="15" cy="62" r="2.5" fill="#F59E0B" />
        <text x="22" y="62" fill="#FBBF24" fontSize="6.5" fontFamily="JetBrains Mono, monospace">c (Cohesion)</text>
        {/* Friction angle arc */}
        <path d="M 55 48 A 20 20 0 0 1 65 44" stroke="#38BDF8" strokeWidth="1" fill="none" />
        <text x="70" y="45" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace">φ = 32°</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        τ_f = c + σ_n · tan(φ) • Shear Strength of Soils • Peak vs Residual
      </text>
    </svg>
  );
}

/**
 * 31. Weir Flow Discharge Preview
 */
export function WeirFlowPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#0284C7" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        OPEN CHANNEL WEIR FLOW &amp; HYDRAULICS
      </text>
      {/* Channel flume bed */}
      <rect x="25" y="130" width="265" height="15" fill="#1E293B" stroke="#334155" strokeWidth="1" />
      {/* Weir Plate (V-notch or rectangular crest) */}
      <rect x="140" y="85" width="14" height="45" fill="#475569" stroke="#94A3B8" strokeWidth="1.2" />
      {/* Upstream water level */}
      <rect x="25" y="65" width="115" height="65" fill="#0284C7" opacity="0.3" />
      <line x1="25" y1="65" x2="140" y2="65" stroke="#38BDF8" strokeWidth="2" />
      {/* Head over crest H */}
      <line x1="125" y1="65" x2="125" y2="85" stroke="#F59E0B" strokeWidth="1.5" />
      <text x="118" y="77" fill="#FBBF24" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="end">H</text>
      {/* Overfalling water nappe */}
      <path
        d="M 140 65 Q 165 65 175 130 L 290 130 L 290 135 L 140 135 Z"
        fill="#0EA5E9"
        opacity="0.35"
      />
      <path
        d="M 140 65 Q 165 65 175 130"
        stroke="#38BDF8"
        strokeWidth="2"
        fill="none"
      />
      {/* Aerated aeration cavity under nappe */}
      <ellipse cx="152" cy="105" rx="6" ry="12" fill="#0B1120" opacity="0.6" />
      <text x="210" y="100" fill="#38BDF8" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        Discharge Q
      </text>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Rectangular: Q = ⅔ C_d b √(2g) H^(3/2) • V-Notch (90°): Q = 8/15 C_d √(2g) tan(θ/2) H^(5/2)
      </text>
    </svg>
  );
}

/**
 * 32. Transformer OC & SC Test Preview
 */
export function TransformerTestPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#2563EB" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        TRANSFORMER EQUIVALENT CIRCUIT &amp; OC/SC
      </text>
      {/* Magnetic Core */}
      <rect x="40" y="55" width="100" height="80" rx="4" fill="none" stroke="#64748B" strokeWidth="10" />
      <rect x="55" y="70" width="70" height="50" rx="2" fill="#070D1A" />
      {/* Magnetic Flux loop dashed */}
      <rect x="47" y="62" width="86" height="66" rx="3" fill="none" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="3 3" />
      <text x="90" y="97" fill="#FBBF24" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Φ(t)</text>
      {/* Primary Windings (Left) */}
      {[65, 75, 85, 95, 105, 115].map((y) => (
        <rect key={y} x="32" y={y} width="14" height="4" rx="2" fill="#D97706" />
      ))}
      <text x="28" y="95" fill="#F59E0B" fontSize="7.5" fontFamily="JetBrains Mono, monospace" textAnchor="end">N₁</text>
      {/* Secondary Windings (Right) */}
      {[70, 84, 98, 112].map((y) => (
        <rect key={y} x="134" y={y} width="14" height="4" rx="2" fill="#D97706" />
      ))}
      <text x="154" y="95" fill="#F59E0B" fontSize="7.5" fontFamily="JetBrains Mono, monospace">N₂</text>
      {/* Right: Equivalent Circuit Branch */}
      <g transform="translate(170, 60)">
        <text x="10" y="10" fill="#38BDF8" fontSize="7.5" fontFamily="JetBrains Mono, monospace">OC Test: R_c || X_m</text>
        <text x="10" y="24" fill="#34D399" fontSize="7.5" fontFamily="JetBrains Mono, monospace">SC Test: R_eq + jX_eq</text>
        {/* Efficiency Curve miniature */}
        <path d="M 10 58 Q 50 34 110 42" stroke="#2563EB" strokeWidth="2" fill="none" />
        <circle cx="50" cy="34" r="2.5" fill="#38BDF8" />
        <text x="54" y="32" fill="#38BDF8" fontSize="6.5" fontFamily="JetBrains Mono, monospace">η_max = 98.4%</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        V₁/V₂ = N₁/N₂ • P_core = V_oc² / R_c • P_cu = I_sc² R_eq • %VR
      </text>
    </svg>
  );
}

/**
 * 33. RLC Resonance Circuit Preview
 */
export function RlcResonancePreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#38BDF8" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        SERIES RLC RESONANCE &amp; QUALITY FACTOR
      </text>
      {/* Left: Circuit Schematic */}
      <g transform="translate(30, 50)">
        {/* Source */}
        <circle cx="20" cy="40" r="12" stroke="#38BDF8" strokeWidth="1.5" />
        <text x="20" y="43" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">~V_s</text>
        {/* Resistor R */}
        <path d="M 20 28 L 20 15 L 40 15 L 44 10 L 50 20 L 56 10 L 62 20 L 66 15 L 75 15" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
        <text x="53" y="6" fill="#FBBF24" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">R</text>
        {/* Inductor L */}
        <path d="M 75 15 C 80 5 85 5 90 15 C 95 5 100 5 105 15" stroke="#10B981" strokeWidth="1.5" fill="none" />
        <text x="90" y="6" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">L</text>
        {/* Capacitor C */}
        <line x1="105" y1="15" x2="115" y2="15" stroke="#38BDF8" strokeWidth="1.5" />
        <line x1="115" y1="8" x2="115" y2="22" stroke="#38BDF8" strokeWidth="2" />
        <line x1="120" y1="8" x2="120" y2="22" stroke="#38BDF8" strokeWidth="2" />
        <line x1="120" y1="15" x2="128" y2="15" stroke="#38BDF8" strokeWidth="1.5" />
        <text x="117" y="6" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">C</text>
        {/* Return wire */}
        <line x1="128" y1="15" x2="128" y2="65" stroke="#475569" strokeWidth="1.5" />
        <line x1="128" y1="65" x2="20" y2="65" stroke="#475569" strokeWidth="1.5" />
        <line x1="20" y1="65" x2="20" y2="52" stroke="#475569" strokeWidth="1.5" />
      </g>
      {/* Right: Resonant Bell Curve */}
      <g transform="translate(170, 45)">
        <line x1="15" y1="85" x2="130" y2="85" stroke="#475569" strokeWidth="1" />
        <line x1="15" y1="10" x2="15" y2="85" stroke="#475569" strokeWidth="1" />
        <text x="130" y="95" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Freq f</text>
        <text x="12" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Current I</text>
        {/* Sharp Resonance Peak */}
        <path
          d="M 20 82 C 45 80 60 70 72 20 C 84 70 100 80 125 82"
          stroke="#38BDF8"
          strokeWidth="2.2"
          fill="none"
        />
        {/* Resonant Frequency Line */}
        <line x1="72" y1="20" x2="72" y2="85" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" />
        <circle cx="72" cy="20" r="2.5" fill="#F59E0B" />
        <text x="72" y="15" fill="#FBBF24" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">f₀</text>
        {/* -3dB line */}
        <line x1="56" y1="40" x2="88" y2="40" stroke="#10B981" strokeWidth="1" strokeDasharray="1.5 1.5" />
        <text x="92" y="42" fill="#34D399" fontSize="6.5" fontFamily="JetBrains Mono, monospace">BW = f₀/Q</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        f₀ = 1 / (2π√LC) • Z_min = R • Q = ω₀L/R • Bandwidth Δf = R / (2πL)
      </text>
    </svg>
  );
}

/**
 * 34. DC Motor Characteristics Preview
 */
export function DcMotorPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#F97316" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        DC SHUNT MOTOR TORQUE-SPEED DYNAMICS
      </text>
      {/* Stator Poles & Armature */}
      <g transform="translate(30, 48)">
        {/* N Pole */}
        <path d="M 10 30 C 25 30 25 60 10 60 Z" fill="#EF4444" opacity="0.8" />
        <text x="14" y="48" fill="#FFFFFF" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">N</text>
        {/* S Pole */}
        <path d="M 90 30 C 75 30 75 60 90 60 Z" fill="#3B82F6" opacity="0.8" />
        <text x="82" y="48" fill="#FFFFFF" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">S</text>
        {/* Armature Rotor */}
        <circle cx="50" cy="45" r="22" fill="#1E293B" stroke="#94A3B8" strokeWidth="1.5" />
        <circle cx="50" cy="45" r="8" fill="#D97706" />
        {/* Commutator Brushes */}
        <rect x="46" y="18" width="8" height="6" fill="#334155" />
        <rect x="46" y="66" width="8" height="6" fill="#334155" />
        {/* Rotation Arrow */}
        <path d="M 40 32 A 15 15 0 0 1 60 32" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
        <polygon points="62,32 58,28 58,36" fill="#F59E0B" />
        <text x="50" y="85" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">ω (rad/s)</text>
      </g>
      {/* Right: Torque-Speed Characteristic Line */}
      <g transform="translate(155, 48)">
        <line x1="15" y1="80" x2="130" y2="80" stroke="#475569" strokeWidth="1" />
        <line x1="15" y1="10" x2="15" y2="80" stroke="#475569" strokeWidth="1" />
        <text x="130" y="90" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Torque T</text>
        <text x="10" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Speed N (RPM)</text>
        {/* Linear Drooping Characteristic */}
        <line x1="15" y1="20" x2="120" y2="65" stroke="#F97316" strokeWidth="2.2" />
        <circle cx="15" cy="20" r="2.5" fill="#38BDF8" />
        <text x="20" y="18" fill="#38BDF8" fontSize="6.5" fontFamily="JetBrains Mono, monospace">N₀ (No Load)</text>
        <circle cx="120" cy="65" r="2.5" fill="#EF4444" />
        <text x="85" y="75" fill="#F87171" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Rated Load</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        E_b = V - I_a R_a = k_e Φ ω • T = k_t Φ I_a • Speed N = (V - I_a R_a) / kΦ
      </text>
    </svg>
  );
}

/**
 * 35. Two-Wattmeter 3-Phase Method Preview
 */
export function TwoWattmeterPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#EAB308" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        TWO-WATTMETER 3-PHASE POWER MEASUREMENT
      </text>
      {/* 3-Phase Lines: R, Y, B */}
      <g transform="translate(25, 45)">
        <line x1="0" y1="20" x2="120" y2="20" stroke="#EF4444" strokeWidth="2" />
        <text x="5" y="15" fill="#EF4444" fontSize="7" fontFamily="JetBrains Mono, monospace">R</text>
        <line x1="0" y1="50" x2="120" y2="50" stroke="#EAB308" strokeWidth="2" />
        <text x="5" y="45" fill="#EAB308" fontSize="7" fontFamily="JetBrains Mono, monospace">Y</text>
        <line x1="0" y1="80" x2="120" y2="80" stroke="#3B82F6" strokeWidth="2" />
        <text x="5" y="75" fill="#3B82F6" fontSize="7" fontFamily="JetBrains Mono, monospace">B</text>
        {/* Wattmeter W1 */}
        <rect x="40" y="12" width="22" height="16" rx="2" fill="#0F172A" stroke="#EF4444" strokeWidth="1" />
        <text x="51" y="23" fill="#EF4444" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">W₁</text>
        {/* Wattmeter W2 */}
        <rect x="40" y="72" width="22" height="16" rx="2" fill="#0F172A" stroke="#3B82F6" strokeWidth="1" />
        <text x="51" y="83" fill="#3B82F6" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">W₂</text>
      </g>
      {/* Right: Phasor & Power Factor Star */}
      <g transform="translate(180, 50)">
        <circle cx="55" cy="45" r="35" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" fill="none" />
        {/* 120 deg Phasors */}
        <line x1="55" y1="45" x2="55" y2="15" stroke="#EF4444" strokeWidth="1.8" />
        <line x1="55" y1="45" x2="85" y2="60" stroke="#EAB308" strokeWidth="1.8" />
        <line x1="55" y1="45" x2="25" y2="60" stroke="#3B82F6" strokeWidth="1.8" />
        <text x="55" y="10" fill="#EF4444" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">V_R</text>
        <text x="92" y="65" fill="#EAB308" fontSize="7" fontFamily="JetBrains Mono, monospace">V_Y</text>
        <text x="18" y="65" fill="#3B82F6" fontSize="7" fontFamily="JetBrains Mono, monospace">V_B</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        P_total = W₁ + W₂ • tan φ = √3 (W₁ - W₂) / (W₁ + W₂) • PF = cos φ
      </text>
    </svg>
  );
}

/**
 * 36. Alternator Voltage Regulation Preview
 */
export function AlternatorRegulationPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#6366F1" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        SYNCHRONOUS ALTERNATOR REGULATION (OCC &amp; SCC)
      </text>
      {/* Synchronous Impedance Graph */}
      <g transform="translate(40, 50)">
        <line x1="15" y1="85" x2="160" y2="85" stroke="#475569" strokeWidth="1.2" />
        <line x1="15" y1="10" x2="15" y2="85" stroke="#475569" strokeWidth="1.2" />
        <text x="160" y="95" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Field Current I_f</text>
        <text x="10" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">V_oc / I_sc</text>
        {/* OCC (Open Circuit Curve - Saturates) */}
        <path d="M 15 85 Q 70 30 145 22" stroke="#6366F1" strokeWidth="2.2" fill="none" />
        <text x="148" y="24" fill="#818CF8" fontSize="7" fontFamily="JetBrains Mono, monospace">OCC</text>
        {/* SCC (Short Circuit Characteristic - Linear) */}
        <line x1="15" y1="85" x2="135" y2="30" stroke="#F59E0B" strokeWidth="1.8" strokeDasharray="3 2" />
        <text x="138" y="34" fill="#FBBF24" fontSize="7" fontFamily="JetBrains Mono, monospace">SCC</text>
      </g>
      {/* Right: Voltage Regulation vs Power Factor */}
      <g transform="translate(210, 50)">
        <text x="0" y="15" fill="#EF4444" fontSize="7" fontFamily="JetBrains Mono, monospace">Lagging: +%VR</text>
        <text x="0" y="30" fill="#10B981" fontSize="7" fontFamily="JetBrains Mono, monospace">Unity: ~5%</text>
        <text x="0" y="45" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace">Leading: -%VR</text>
        <text x="0" y="65" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace">Z_s = V_oc / I_sc</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        %VR = (E₀ - V_rated)/V_rated × 100 • Synchronous Impedance Method
      </text>
    </svg>
  );
}

/**
 * 37. Chemical Reactor Kinetics Preview (CSTR vs PFR)
 */
export function ReactorKineticsPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#10B981" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        CHEMICAL REACTOR KINETICS (CSTR VS PFR)
      </text>
      {/* Left: CSTR Vessel */}
      <g transform="translate(30, 48)">
        <rect x="10" y="15" width="45" height="55" rx="10" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
        {/* Impeller agitator */}
        <line x1="32" y1="5" x2="32" y2="48" stroke="#94A3B8" strokeWidth="1.5" />
        <ellipse cx="32" cy="48" rx="14" ry="4" fill="#34D399" />
        <text x="32" y="82" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">CSTR</text>
      </g>
      {/* Center: PFR Tubular Reactor */}
      <g transform="translate(95, 48)">
        <rect x="5" y="25" width="60" height="22" rx="4" fill="#0F172A" stroke="#3B82F6" strokeWidth="1.5" />
        {/* Plug slices */}
        {[20, 35, 50].map((x) => (
          <line key={x} x1={x} y1="25" x2={x} y2="47" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 1" />
        ))}
        <text x="35" y="82" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">PFR</text>
      </g>
      {/* Right: Conversion Profile X_A vs Space Time */}
      <g transform="translate(175, 48)">
        <line x1="15" y1="75" x2="120" y2="75" stroke="#475569" strokeWidth="1" />
        <line x1="15" y1="10" x2="15" y2="75" stroke="#475569" strokeWidth="1" />
        <text x="120" y="85" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">τ (s)</text>
        <text x="12" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Conv X_A</text>
        {/* PFR higher conversion curve */}
        <path d="M 15 75 Q 45 22 110 18" stroke="#3B82F6" strokeWidth="2" fill="none" />
        <text x="95" y="15" fill="#38BDF8" fontSize="6.5" fontFamily="JetBrains Mono, monospace">PFR</text>
        {/* CSTR lower conversion curve */}
        <path d="M 15 75 Q 60 45 110 32" stroke="#10B981" strokeWidth="1.8" strokeDasharray="3 2" fill="none" />
        <text x="95" y="42" fill="#34D399" fontSize="6.5" fontFamily="JetBrains Mono, monospace">CSTR</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        τ_CSTR = C_A0 X_A / (-r_A) • τ_PFR = C_A0 ∫ dX_A / (-r_A) • Damköhler Da
      </text>
    </svg>
  );
}

/**
 * 38. Liquid-Liquid Extraction Ternary Preview
 */
export function LiquidExtractionPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#0D9488" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        LIQUID-LIQUID EXTRACTION (TERNARY EQUILIBRIUM)
      </text>
      {/* Gibbs Equilateral Triangle */}
      <g transform="translate(60, 45)">
        <polygon points="100,5 5,100 195,100" stroke="#475569" strokeWidth="1.5" fill="#0B1120" />
        {/* Vertices */}
        <text x="100" y="-1" fill="#F59E0B" fontSize="7.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Solute (A)</text>
        <text x="-5" y="112" fill="#06B6D4" fontSize="7.5" fontFamily="JetBrains Mono, monospace">Carrier (B)</text>
        <text x="180" y="112" fill="#10B981" fontSize="7.5" fontFamily="JetBrains Mono, monospace">Solvent (S)</text>
        {/* Binodal solubility curve */}
        <path d="M 35 100 Q 100 35 165 100" stroke="#0D9488" strokeWidth="2.2" fill="#0D9488" fillOpacity="0.15" />
        {/* Tie lines */}
        <line x1="55" y1="88" x2="148" y2="82" stroke="#E11D48" strokeWidth="1" strokeDasharray="2 1" />
        <line x1="72" y1="72" x2="132" y2="65" stroke="#E11D48" strokeWidth="1" strokeDasharray="2 1" />
        {/* Plait Point */}
        <circle cx="106" cy="48" r="2.5" fill="#F43F5E" />
        <text x="110" y="46" fill="#F43F5E" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Plait Point</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Ternary Phase Diagram • Extract vs Raffinate Phases • Distribution Coeff K_d
      </text>
    </svg>
  );
}

/**
 * 39. Shell & Tube Heat Exchanger Preview
 */
export function HeatExchangerPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#F97316" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        SHELL &amp; TUBE HEAT EXCHANGER (LMTD)
      </text>
      {/* Shell cylinder */}
      <rect x="30" y="55" width="160" height="55" rx="8" fill="#0F172A" stroke="#475569" strokeWidth="1.5" />
      {/* Tubes (Hot Fluid - Red) */}
      <line x1="15" y1="72" x2="205" y2="72" stroke="#EF4444" strokeWidth="3" />
      <line x1="15" y1="92" x2="205" y2="92" stroke="#EF4444" strokeWidth="3" />
      <polygon points="12,72 6,69 6,75" fill="#EF4444" />
      <text x="15" y="65" fill="#EF4444" fontSize="7" fontFamily="JetBrains Mono, monospace">T_h,in</text>
      <text x="205" y="65" fill="#F87171" fontSize="7" fontFamily="JetBrains Mono, monospace">T_h,out</text>
      {/* Baffles in shell */}
      <line x1="75" y1="55" x2="75" y2="95" stroke="#64748B" strokeWidth="2" />
      <line x1="115" y1="70" x2="115" y2="110" stroke="#64748B" strokeWidth="2" />
      <line x1="155" y1="55" x2="155" y2="95" stroke="#64748B" strokeWidth="2" />
      {/* Shell Cold Fluid In/Out */}
      <text x="40" y="125" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace">T_c,in</text>
      <text x="175" y="48" fill="#0284C7" fontSize="7" fontFamily="JetBrains Mono, monospace">T_c,out</text>
      {/* Right: Countercurrent LMTD temperature curves */}
      <g transform="translate(205, 52)">
        <path d="M 10 18 Q 45 35 85 45" stroke="#EF4444" strokeWidth="2" fill="none" />
        <path d="M 10 70 Q 50 62 85 42" stroke="#38BDF8" strokeWidth="2" fill="none" />
        <text x="45" y="14" fill="#F87171" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Hot Stream</text>
        <text x="45" y="80" fill="#38BDF8" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Cold Stream</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Q = U·A·ΔT_lm • ΔT_lm = (ΔT₁ - ΔT₂) / ln(ΔT₁/ΔT₂) • NTU Method
      </text>
    </svg>
  );
}

/**
 * 40. Gas Absorption Packed Tower Preview
 */
export function GasAbsorptionPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#059669" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        GAS ABSORPTION &amp; PACKED TOWER (NTU / HTU)
      </text>
      {/* Packed Column */}
      <g transform="translate(45, 42)">
        <rect x="20" y="10" width="45" height="95" rx="8" fill="#0F172A" stroke="#059669" strokeWidth="1.5" />
        {/* Packing bed with Raschig ring icons */}
        <rect x="23" y="30" width="39" height="55" fill="#064E3B" opacity="0.4" stroke="#10B981" strokeWidth="1" strokeDasharray="2 2" />
        {/* Liquid distributor at top */}
        <line x1="28" y1="26" x2="57" y2="26" stroke="#38BDF8" strokeWidth="2" />
        <polygon points="42,12 38,18 46,18" fill="#38BDF8" />
        <text x="42" y="8" fill="#38BDF8" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Liquid L</text>
        {/* Gas inlet at bottom */}
        <polygon points="12,90 18,86 18,94" fill="#F59E0B" />
        <text x="5" y="92" fill="#FBBF24" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Gas G</text>
      </g>
      {/* Operating and Equilibrium Lines */}
      <g transform="translate(150, 48)">
        <line x1="15" y1="80" x2="130" y2="80" stroke="#475569" strokeWidth="1" />
        <line x1="15" y1="10" x2="15" y2="80" stroke="#475569" strokeWidth="1" />
        <text x="130" y="90" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">x (Liq mole)</text>
        <text x="12" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">y (Gas mole)</text>
        {/* Equilibrium Line: y = mx */}
        <line x1="15" y1="80" x2="110" y2="25" stroke="#10B981" strokeWidth="1.8" strokeDasharray="3 2" />
        <text x="112" y="27" fill="#34D399" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Equil y*</text>
        {/* Operating Line: steeper slope L/G */}
        <line x1="30" y1="80" x2="120" y2="15" stroke="#F59E0B" strokeWidth="2" />
        <text x="122" y="16" fill="#FBBF24" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Oper L/G</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Z = H_OG × N_OG • Height of Transfer Unit • Henry&apos;s Law y = H·x
      </text>
    </svg>
  );
}

/**
 * 41. Bacterial Growth Kinetics Preview
 */
export function BacterialGrowthPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#EC4899" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        MICROBIAL BATCH FERMENTATION PHASES
      </text>
      {/* 4-Phase Sigmoidal Growth Curve */}
      <g transform="translate(40, 48)">
        <line x1="15" y1="85" x2="230" y2="85" stroke="#475569" strokeWidth="1.2" />
        <line x1="15" y1="10" x2="15" y2="85" stroke="#475569" strokeWidth="1.2" />
        <text x="230" y="95" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Time t (h)</text>
        <text x="10" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">ln(Cell Density X)</text>
        {/* Sigmoid Curve: Lag -> Exponential -> Stationary -> Death */}
        <path
          d="M 15 78 L 50 78 Q 90 75 125 30 L 175 30 Q 200 35 225 65"
          stroke="#EC4899"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Phase Delimiters */}
        <line x1="50" y1="15" x2="50" y2="85" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="125" y1="15" x2="125" y2="85" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
        <line x1="175" y1="15" x2="175" y2="85" stroke="#334155" strokeWidth="1" strokeDasharray="2 2" />
        <text x="32" y="22" fill="#94A3B8" fontSize="6" fontFamily="JetBrains Mono, monospace">Lag</text>
        <text x="85" y="22" fill="#F43F5E" fontSize="6" fontFamily="JetBrains Mono, monospace" fontWeight="bold">Exponential</text>
        <text x="145" y="22" fill="#FBBF24" fontSize="6" fontFamily="JetBrains Mono, monospace">Stationary</text>
        <text x="195" y="22" fill="#64748B" fontSize="6" fontFamily="JetBrains Mono, monospace">Death</text>
        {/* Substrate depletion curve */}
        <path d="M 15 25 Q 90 35 175 80" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 2" fill="none" />
        <text x="25" y="32" fill="#38BDF8" fontSize="6" fontFamily="JetBrains Mono, monospace">Substrate [S]</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Monod: μ = μ_max·S / (K_s + S) • dX/dt = μX • Doubling Time t_d = ln(2)/μ
      </text>
    </svg>
  );
}

/**
 * 42. Kla Bioreactor Mass Transfer Preview
 */
export function KlaBioreactorPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#06B6D4" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        BIOREACTOR AERATION &amp; K_La OXYGEN TRANSFER
      </text>
      {/* Bioreactor Tank with Sparger */}
      <g transform="translate(30, 48)">
        <rect x="10" y="10" width="55" height="65" rx="8" fill="#0F172A" stroke="#06B6D4" strokeWidth="1.5" />
        {/* Impeller shaft & Rushton blade */}
        <line x1="37" y1="0" x2="37" y2="48" stroke="#94A3B8" strokeWidth="1.5" />
        <rect x="25" y="44" width="24" height="6" rx="1" fill="#38BDF8" />
        {/* Sparger bubbles rising */}
        {[25, 33, 42, 49].map((bx, idx) => (
          <circle key={bx} cx={bx} cy={58 - idx * 8} r="2.5" fill="#67E8F9" opacity="0.7" />
        ))}
      </g>
      {/* Dissolved Oxygen Dynamic Response Curve */}
      <g transform="translate(125, 48)">
        <line x1="15" y1="75" x2="160" y2="75" stroke="#475569" strokeWidth="1" />
        <line x1="15" y1="10" x2="15" y2="75" stroke="#475569" strokeWidth="1" />
        <text x="160" y="85" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Time t (s)</text>
        <text x="12" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">DO (% Saturation)</text>
        {/* Dynamic Gassing Out curve */}
        <path d="M 15 75 L 40 75 Q 70 70 110 32 L 155 24" stroke="#06B6D4" strokeWidth="2.2" fill="none" />
        {/* C* Equilibrium line */}
        <line x1="15" y1="22" x2="155" y2="22" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
        <text x="120" y="18" fill="#FBBF24" fontSize="6.5" fontFamily="JetBrains Mono, monospace">C* (100% Sat)</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        dC_L/dt = k_La (C* - C_L) • Dynamic Gassing-Out Method • Aerobic Cultures
      </text>
    </svg>
  );
}

/**
 * 43. Chromatography Column & Elution Peaks Preview
 */
export function ChromatographyPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#A855F7" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        GEL FILTRATION CHROMATOGRAPHY (COLUMN RESOLUTION)
      </text>
      {/* Chromatography Glass Column */}
      <g transform="translate(30, 48)">
        <rect x="15" y="10" width="28" height="70" rx="3" fill="#0F172A" stroke="#A855F7" strokeWidth="1.5" />
        {/* Separation bands */}
        <rect x="17" y="25" width="24" height="6" rx="1" fill="#EF4444" opacity="0.8" />
        <rect x="17" y="45" width="24" height="7" rx="1" fill="#3B82F6" opacity="0.8" />
        <rect x="17" y="65" width="24" height="8" rx="1" fill="#10B981" opacity="0.8" />
      </g>
      {/* Elution Chromatogram UV Peaks */}
      <g transform="translate(95, 48)">
        <line x1="15" y1="75" x2="190" y2="75" stroke="#475569" strokeWidth="1" />
        <line x1="15" y1="10" x2="15" y2="75" stroke="#475569" strokeWidth="1" />
        <text x="190" y="85" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Retention t_R (min)</text>
        <text x="12" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">A₂₈₀ (UV)</text>
        {/* Peak 1 (High MW) */}
        <path d="M 35 75 Q 55 18 75 75" stroke="#EF4444" strokeWidth="2" fill="#EF4444" fillOpacity="0.15" />
        <text x="55" y="14" fill="#F87171" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Peak 1</text>
        {/* Peak 2 (Medium MW) */}
        <path d="M 85 75 Q 110 30 135 75" stroke="#3B82F6" strokeWidth="2" fill="#3B82F6" fillOpacity="0.15" />
        <text x="110" y="26" fill="#60A5FA" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Peak 2</text>
        {/* Peak 3 (Small MW) */}
        <path d="M 145 75 Q 165 42 185 75" stroke="#10B981" strokeWidth="2" fill="#10B981" fillOpacity="0.15" />
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        R_s = 2(t_R2 - t_R1)/(W₁ + W₂) • Theoretical Plates N = 16(t_R/W)²
      </text>
    </svg>
  );
}

/**
 * 44. PCR Amplification Kinetics Preview
 */
export function PcrKineticsPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#14B8A6" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        REAL-TIME QPCR AMPLIFICATION &amp; C_T KINETICS
      </text>
      {/* Thermal Cycler Profile on Left */}
      <g transform="translate(30, 50)">
        <text x="0" y="8" fill="#94A3B8" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Cycles: 95°→55°→72°C</text>
        <path d="M 5 22 L 20 22 L 28 50 L 45 50 L 52 35 L 70 35 L 78 22" stroke="#F59E0B" strokeWidth="1.5" fill="none" />
        <text x="12" y="18" fill="#EF4444" fontSize="6" fontFamily="JetBrains Mono, monospace">Denat</text>
        <text x="32" y="60" fill="#38BDF8" fontSize="6" fontFamily="JetBrains Mono, monospace">Anneal</text>
        <text x="56" y="32" fill="#10B981" fontSize="6" fontFamily="JetBrains Mono, monospace">Ext</text>
      </g>
      {/* qPCR Sigmoid Curves on Right */}
      <g transform="translate(130, 48)">
        <line x1="15" y1="75" x2="155" y2="75" stroke="#475569" strokeWidth="1" />
        <line x1="15" y1="10" x2="15" y2="75" stroke="#475569" strokeWidth="1" />
        <text x="155" y="85" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Cycle #</text>
        <text x="12" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Fluorescence (Rn)</text>
        {/* Threshold Line */}
        <line x1="15" y1="48" x2="155" y2="48" stroke="#EF4444" strokeWidth="1" strokeDasharray="3 2" />
        <text x="135" y="45" fill="#F87171" fontSize="6.5" fontFamily="JetBrains Mono, monospace">C_t line</text>
        {/* Sample 1 (High copy, early Ct) */}
        <path d="M 15 72 L 50 72 Q 75 70 95 25 L 140 22" stroke="#14B8A6" strokeWidth="2.2" fill="none" />
        <circle cx="85" cy="48" r="2.5" fill="#14B8A6" />
        {/* Sample 2 (Low copy, late Ct) */}
        <path d="M 15 74 L 80 74 Q 105 72 125 30 L 150 26" stroke="#8B5CF6" strokeWidth="1.8" strokeDasharray="3 1" fill="none" />
        <circle cx="115" cy="48" r="2.5" fill="#8B5CF6" />
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        N_n = N₀ · (1 + E)^n • Threshold Cycle C_t • Taq Polymerase 5&apos;→3&apos;
      </text>
    </svg>
  );
}

/**
 * 45. Photoelectric Effect Preview
 */
export function PhotoelectricPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#E11D48" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        EINSTEIN PHOTOELECTRIC EFFECT &amp; WORK FUNCTION
      </text>
      {/* Vacuum Phototube */}
      <g transform="translate(30, 48)">
        <ellipse cx="60" cy="42" rx="42" ry="32" fill="#0F172A" stroke="#334155" strokeWidth="1.5" />
        {/* Photocathode Emitter plate */}
        <rect x="30" y="24" width="6" height="36" fill="#94A3B8" />
        <text x="24" y="44" fill="#94A3B8" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="end">Cathode</text>
        {/* Anode Collector plate */}
        <rect x="85" y="24" width="6" height="36" fill="#94A3B8" />
        <text x="95" y="44" fill="#94A3B8" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Anode</text>
        {/* Light Photons striking plate */}
        <path d="M 5 20 L 28 32 M 5 35 L 28 42 M 5 50 L 28 52" stroke="#F59E0B" strokeWidth="1.5" />
        {/* Ejected photoelectrons */}
        {[35, 42, 50].map((y, idx) => (
          <circle key={y} cx={45 + idx * 14} cy={y} r="2" fill="#38BDF8" />
        ))}
      </g>
      {/* Einstein K_max vs Frequency line */}
      <g transform="translate(160, 48)">
        <line x1="15" y1="75" x2="130" y2="75" stroke="#475569" strokeWidth="1" />
        <line x1="15" y1="10" x2="15" y2="75" stroke="#475569" strokeWidth="1" />
        <text x="130" y="85" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">Freq ν</text>
        <text x="12" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">K_max (eV)</text>
        {/* Linear line with threshold ν₀ */}
        <line x1="45" y1="75" x2="120" y2="15" stroke="#E11D48" strokeWidth="2.2" />
        <circle cx="45" cy="75" r="2.5" fill="#FBBF24" />
        <text x="45" y="86" fill="#FBBF24" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">ν₀</text>
        <text x="95" y="32" fill="#E11D48" fontSize="7" fontFamily="JetBrains Mono, monospace">Slope = h</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        K_max = hν - Φ = e·V₀ • Planck Constant h = 6.626×10⁻³⁴ J·s • Work Function Φ
      </text>
    </svg>
  );
}

/**
 * 46. Newton's Rings Interference Preview
 */
export function NewtonsRingsPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#F59E0B" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        NEWTON&apos;S RINGS INTERFERENCE &amp; LENS RADIUS
      </text>
      {/* Concentric Newton's Rings Pattern */}
      <g transform="translate(80, 95)">
        <circle cx="0" cy="0" r="45" fill="#0B1120" stroke="#334155" strokeWidth="1" />
        {/* Rings */}
        {[8, 16, 23, 29, 34, 39, 43].map((r, idx) => (
          <circle
            key={r}
            cx="0"
            cy="0"
            r={r}
            stroke="#F59E0B"
            strokeWidth={idx % 2 === 0 ? 2 : 1}
            fill="none"
            opacity={Math.max(0.2, 1 - idx * 0.12)}
          />
        ))}
        {/* Central Dark Spot */}
        <circle cx="0" cy="0" r="4" fill="#0F172A" stroke="#F59E0B" strokeWidth="1" />
      </g>
      {/* Plano-Convex Lens Schematic on Right */}
      <g transform="translate(170, 55)">
        {/* Glass Plate */}
        <rect x="10" y="65" width="105" height="10" fill="#334155" stroke="#64748B" strokeWidth="1" />
        {/* Plano-Convex Lens curve */}
        <path d="M 15 40 Q 62 65 110 40 L 110 32 L 15 32 Z" fill="#1E293B" stroke="#38BDF8" strokeWidth="1.5" />
        {/* Monochromatic sodium ray */}
        <line x1="62" y1="12" x2="62" y2="32" stroke="#F59E0B" strokeWidth="1.8" />
        <polygon points="59,28 62,34 65,28" fill="#F59E0B" />
        <text x="62" y="8" fill="#FBBF24" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">λ = 589nm</text>
        <text x="62" y="88" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Air Wedge Film</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        D_n² = 4n·λ·R • Dark Ring Condition • Radius of Curvature R = (D_(n+p)² - D_n²) / 4pλ
      </text>
    </svg>
  );
}

/**
 * 47. Diffraction Grating Preview
 */
export function DiffractionGratingPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#8B5CF6" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        DIFFRACTION GRATING &amp; SPECTRAL DISPERSION
      </text>
      {/* Laser / Collimator */}
      <rect x="25" y="85" width="40" height="20" rx="3" fill="#1E293B" stroke="#475569" strokeWidth="1" />
      <line x1="65" y1="95" x2="115" y2="95" stroke="#EC4899" strokeWidth="2.5" />
      {/* Grating plate */}
      <rect x="115" y="45" width="8" height="100" rx="2" fill="#0F172A" stroke="#8B5CF6" strokeWidth="1.5" />
      {[55, 65, 75, 85, 95, 105, 115, 125, 135].map((gy) => (
        <line key={gy} x1="115" y1={gy} x2="123" y2={gy} stroke="#000000" strokeWidth="1.5" />
      ))}
      <text x="119" y="38" fill="#A78BFA" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">d = 1/N</text>
      {/* Diffracted Spectral Orders */}
      {/* m = 0 central */}
      <line x1="123" y1="95" x2="250" y2="95" stroke="#EC4899" strokeWidth="2.5" />
      <text x="255" y="98" fill="#FDA4AF" fontSize="7" fontFamily="JetBrains Mono, monospace">m = 0</text>
      {/* m = +1 */}
      <line x1="123" y1="95" x2="250" y2="55" stroke="#38BDF8" strokeWidth="1.8" />
      <text x="255" y="58" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace">m = +1</text>
      {/* m = -1 */}
      <line x1="123" y1="95" x2="250" y2="135" stroke="#38BDF8" strokeWidth="1.8" />
      <text x="255" y="138" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace">m = -1</text>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        (a + b) sin θ = m λ • Grating Equation • Resolving Power R = λ/Δλ = m·N
      </text>
    </svg>
  );
}

/**
 * 48. Coupled Oscillators & Normal Modes Preview
 */
export function CoupledOscillatorsPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#38BDF8" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        COUPLED OSCILLATORS (BEATS &amp; NORMAL MODES)
      </text>
      {/* Top support bar */}
      <line x1="40" y1="48" x2="160" y2="48" stroke="#475569" strokeWidth="3" />
      {/* Pendulum 1 */}
      <line x1="70" y1="48" x2="65" y2="110" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="65" cy="110" r="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
      <text x="65" y="113" fill="#0F172A" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">m₁</text>
      {/* Pendulum 2 */}
      <line x1="130" y1="48" x2="135" y2="110" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="135" cy="110" r="10" fill="#38BDF8" stroke="#0284C7" strokeWidth="1.5" />
      <text x="135" y="113" fill="#0F172A" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">m₂</text>
      {/* Coupling Spring */}
      <path
        d="M 65 85 L 75 80 L 85 90 L 95 80 L 105 90 L 115 80 L 125 90 L 135 85"
        stroke="#F59E0B"
        strokeWidth="1.5"
        fill="none"
      />
      <text x="100" y="74" fill="#FBBF24" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">k_c</text>
      {/* Right: Modulated Beat Wave Envelope */}
      <g transform="translate(180, 50)">
        <line x1="10" y1="45" x2="120" y2="45" stroke="#334155" strokeWidth="1" />
        {/* Envelope */}
        <path d="M 10 20 Q 35 45 60 20 Q 85 45 110 20" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        <path d="M 10 70 Q 35 45 60 70 Q 85 45 110 70" stroke="#64748B" strokeWidth="1" strokeDasharray="2 2" fill="none" />
        {/* Fast oscillations inside beat */}
        <path
          d="M 10 45 Q 16 28 22 45 Q 28 62 35 45 Q 42 32 48 45 Q 54 58 60 45 Q 67 30 73 45 Q 80 60 87 45 Q 94 34 100 45 Q 106 56 112 45"
          stroke="#38BDF8"
          strokeWidth="1.5"
          fill="none"
        />
        <text x="65" y="85" fill="#38BDF8" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">Beats: ω_b = |ω₁ - ω₂|</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        Mode 1 (In-phase): ω₁ = √(g/L) • Mode 2 (Anti-phase): ω₂ = √(g/L + 2k_c/m)
      </text>
    </svg>
  );
}

/**
 * 49. PID Controller Closed-Loop Tuning Preview
 */
export function PidTuningPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#0EA5E9" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        CLOSED-LOOP PID TUNING &amp; STEP TRANSIENT
      </text>
      {/* Feedback Block Diagram */}
      <g transform="translate(25, 48)">
        <line x1="0" y1="20" x2="16" y2="20" stroke="#94A3B8" strokeWidth="1.5" />
        {/* Summing junction */}
        <circle cx="22" cy="20" r="6" stroke="#94A3B8" strokeWidth="1.2" fill="#0B1120" />
        <line x1="28" y1="20" x2="38" y2="20" stroke="#94A3B8" strokeWidth="1.5" />
        {/* PID Block */}
        <rect x="38" y="10" width="38" height="20" rx="3" fill="#0F172A" stroke="#0EA5E9" strokeWidth="1.2" />
        <text x="57" y="23" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle" fontWeight="bold">PID</text>
        <line x1="76" y1="20" x2="88" y2="20" stroke="#94A3B8" strokeWidth="1.5" />
        {/* Plant G(s) */}
        <rect x="88" y="10" width="38" height="20" rx="3" fill="#0F172A" stroke="#10B981" strokeWidth="1.2" />
        <text x="107" y="23" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">G(s)</text>
        {/* Output wire & feedback */}
        <line x1="126" y1="20" x2="145" y2="20" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="135" y1="20" x2="135" y2="40" stroke="#64748B" strokeWidth="1.2" />
        <line x1="135" y1="40" x2="22" y2="40" stroke="#64748B" strokeWidth="1.2" />
        <line x1="22" y1="40" x2="22" y2="26" stroke="#64748B" strokeWidth="1.2" />
      </g>
      {/* Right: Step Transient Response with Overshoot */}
      <g transform="translate(170, 48)">
        <line x1="15" y1="75" x2="130" y2="75" stroke="#475569" strokeWidth="1" />
        <line x1="15" y1="10" x2="15" y2="75" stroke="#475569" strokeWidth="1" />
        {/* Setpoint dashed line */}
        <line x1="15" y1="35" x2="130" y2="35" stroke="#64748B" strokeWidth="1" strokeDasharray="3 3" />
        <text x="132" y="37" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">r(t)=1</text>
        {/* Step Response: fast rise -> peak overshoot M_p -> settled */}
        <path
          d="M 15 75 Q 35 15 50 20 Q 65 45 80 32 Q 95 38 125 35"
          stroke="#0EA5E9"
          strokeWidth="2.2"
          fill="none"
        />
        {/* Overshoot indicator */}
        <circle cx="50" cy="20" r="2.5" fill="#EF4444" />
        <text x="50" y="14" fill="#F87171" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">M_p = 18%</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        u(t) = K_p·e(t) + K_i ∫ e(τ)dτ + K_d · de/dt • Ziegler-Nichols Rules
      </text>
    </svg>
  );
}

/**
 * 50. Differential Drive Mobile Robot Preview
 */
export function DifferentialDrivePreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#06B6D4" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        DIFFERENTIAL DRIVE ROBOT (ODOMETRY &amp; ICC)
      </text>
      {/* Curved trajectory path */}
      <path
        d="M 40 135 C 90 120 120 70 200 65"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeDasharray="4 3"
        fill="none"
      />
      {/* Robot Chassis at end of path */}
      <g transform="translate(190, 65) rotate(-15)">
        {/* Circular or rectangular chassis */}
        <rect x="-18" y="-14" width="36" height="28" rx="6" fill="#1E293B" stroke="#0284C7" strokeWidth="1.5" />
        {/* Left Wheel */}
        <rect x="-14" y="-18" width="16" height="5" rx="1" fill="#EF4444" />
        <text x="-6" y="-21" fill="#F87171" fontSize="6" fontFamily="JetBrains Mono, monospace">v_L</text>
        {/* Right Wheel */}
        <rect x="-14" y="13" width="16" height="5" rx="1" fill="#3B82F6" />
        <text x="-6" y="24" fill="#60A5FA" fontSize="6" fontFamily="JetBrains Mono, monospace">v_R</text>
        {/* Heading arrow */}
        <line x1="0" y1="0" x2="20" y2="0" stroke="#F59E0B" strokeWidth="1.5" />
        <polygon points="20,0 15,-3 15,3" fill="#F59E0B" />
      </g>
      {/* Instantaneous Center of Curvature (ICC) */}
      <circle cx="140" cy="130" r="3" fill="#F43F5E" />
      <text x="140" y="142" fill="#F43F5E" fontSize="7" fontFamily="JetBrains Mono, monospace" textAnchor="middle">ICC</text>
      <line x1="140" y1="130" x2="190" y2="65" stroke="#F43F5E" strokeWidth="1" strokeDasharray="2 2" />
      <text x="160" y="95" fill="#FDA4AF" fontSize="6.5" fontFamily="JetBrains Mono, monospace">R = L(v_R+v_L)/2(v_R-v_L)</text>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        ω = (v_R - v_L) / L • v = (v_R + v_L)/2 • Non-holonomic Constraint: ẏ cos θ - ẋ sin θ = 0
      </text>
    </svg>
  );
}

/**
 * 51. Inverted Pendulum on Cart Preview
 */
export function InvertedPendulumPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#E11D48" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        INVERTED PENDULUM CART (STATE-SPACE &amp; LQR)
      </text>
      {/* Horizontal Track rail */}
      <line x1="30" y1="135" x2="290" y2="135" stroke="#475569" strokeWidth="3" />
      {/* Motorized Cart */}
      <rect x="135" y="112" width="50" height="22" rx="3" fill="#1E293B" stroke="#0284C7" strokeWidth="1.5" />
      {/* Cart Wheels */}
      <circle cx="145" cy="135" r="5" fill="#64748B" />
      <circle cx="175" cy="135" r="5" fill="#64748B" />
      {/* Center Pivot Pin */}
      <circle cx="160" cy="112" r="3.5" fill="#F59E0B" />
      {/* Stabilized Upright Inverted Pendulum */}
      <line x1="160" y1="112" x2="168" y2="48" stroke="#EF4444" strokeWidth="3" strokeLinecap="round" />
      {/* Pendulum Bob / Tip mass */}
      <circle cx="168" cy="48" r="9" fill="#F43F5E" stroke="#FFFFFF" strokeWidth="1.5" />
      {/* Angle theta from vertical */}
      <line x1="160" y1="112" x2="160" y2="45" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />
      <text x="175" y="70" fill="#FBBF24" fontSize="7" fontFamily="JetBrains Mono, monospace">θ = 2.4°</text>
      {/* Control Force vector u(t) */}
      <line x1="110" y1="123" x2="132" y2="123" stroke="#10B981" strokeWidth="2.5" />
      <polygon points="132,123 126,120 126,126" fill="#10B981" />
      <text x="100" y="125" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace">u(t)</text>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        (M + m)ẍ + ml θ̈ cos θ - ml θ̇² sin θ = u • (I + ml²)θ̈ + ml ẍ cos θ = mgl sin θ
      </text>
    </svg>
  );
}

/**
 * 52. Bode Plot Frequency Response Preview
 */
export function BodePlotPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#8B5CF6" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        BODE PLOT (GAIN &amp; PHASE MARGINS)
      </text>
      {/* Top: Magnitude [dB] plot */}
      <g transform="translate(40, 45)">
        <line x1="15" y1="40" x2="240" y2="40" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
        <text x="8" y="42" fill="#94A3B8" fontSize="6.5" fontFamily="JetBrains Mono, monospace">0dB</text>
        {/* Magnitude Curve */}
        <path d="M 15 20 L 90 22 C 140 25 180 65 240 85" stroke="#38BDF8" strokeWidth="2" fill="none" />
        {/* Gain Crossover Frequency ω_gc */}
        <circle cx="150" cy="40" r="2.5" fill="#F59E0B" />
        <text x="150" y="34" fill="#FBBF24" fontSize="6.5" fontFamily="JetBrains Mono, monospace">ω_gc</text>
      </g>
      {/* Bottom: Phase [deg] plot */}
      <g transform="translate(40, 100)">
        <line x1="15" y1="35" x2="240" y2="35" stroke="#EF4444" strokeWidth="1" strokeDasharray="3 3" />
        <text x="0" y="38" fill="#F87171" fontSize="6.5" fontFamily="JetBrains Mono, monospace">-180°</text>
        {/* Phase Curve */}
        <path d="M 15 10 C 60 12 120 25 180 50 L 240 60" stroke="#A78BFA" strokeWidth="2" fill="none" />
        {/* Phase Margin arrow */}
        <line x1="150" y1="35" x2="150" y2="28" stroke="#10B981" strokeWidth="1.5" />
        <text x="155" y="32" fill="#34D399" fontSize="6.5" fontFamily="JetBrains Mono, monospace">PM = 48°</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        GM = -20 log|G(jω_pc)| • PM = 180° + ∠G(jω_gc) • Asymptotic Stability
      </text>
    </svg>
  );
}

/**
 * 53. BJT Common-Emitter Characteristics Preview
 */
export function BjtCharacteristicsPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#3B82F6" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        BJT NPN TRANSISTOR OUTPUT CHARACTERISTICS
      </text>
      {/* BJT Schematic Symbol on Left */}
      <g transform="translate(35, 50)">
        {/* Base bar */}
        <line x1="30" y1="20" x2="30" y2="50" stroke="#94A3B8" strokeWidth="3" />
        {/* Base terminal wire */}
        <line x1="10" y1="35" x2="30" y2="35" stroke="#94A3B8" strokeWidth="1.5" />
        <text x="5" y="38" fill="#94A3B8" fontSize="7" fontFamily="JetBrains Mono, monospace">B</text>
        {/* Collector */}
        <line x1="30" y1="26" x2="48" y2="12" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="48" y1="12" x2="48" y2="2" stroke="#94A3B8" strokeWidth="1.5" />
        <text x="52" y="10" fill="#EF4444" fontSize="7" fontFamily="JetBrains Mono, monospace">C</text>
        {/* Emitter with arrow */}
        <line x1="30" y1="44" x2="48" y2="58" stroke="#94A3B8" strokeWidth="1.5" />
        <line x1="48" y1="58" x2="48" y2="68" stroke="#94A3B8" strokeWidth="1.5" />
        <polygon points="46,56 42,48 48,50" fill="#38BDF8" />
        <text x="52" y="65" fill="#38BDF8" fontSize="7" fontFamily="JetBrains Mono, monospace">E</text>
      </g>
      {/* Right: Family of Collector Curves (IC vs VCE) */}
      <g transform="translate(125, 48)">
        <line x1="15" y1="80" x2="165" y2="80" stroke="#475569" strokeWidth="1.2" />
        <line x1="15" y1="10" x2="15" y2="80" stroke="#475569" strokeWidth="1.2" />
        <text x="165" y="90" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">V_CE (V)</text>
        <text x="10" y="8" fill="#64748B" fontSize="6.5" fontFamily="JetBrains Mono, monospace">I_C (mA)</text>
        {/* Curves for IB = 40uA, 30uA, 20uA, 10uA */}
        <path d="M 15 80 Q 25 18 160 15" stroke="#38BDF8" strokeWidth="1.8" fill="none" />
        <text x="162" y="16" fill="#38BDF8" fontSize="6" fontFamily="JetBrains Mono, monospace">I_B=40μA</text>
        <path d="M 15 80 Q 25 35 160 32" stroke="#60A5FA" strokeWidth="1.8" fill="none" />
        <text x="162" y="33" fill="#60A5FA" fontSize="6" fontFamily="JetBrains Mono, monospace">I_B=30μA</text>
        <path d="M 15 80 Q 25 52 160 50" stroke="#93C5FD" strokeWidth="1.8" fill="none" />
        <text x="162" y="51" fill="#93C5FD" fontSize="6" fontFamily="JetBrains Mono, monospace">I_B=20μA</text>
        {/* Saturation Region Line */}
        <line x1="25" y1="10" x2="25" y2="80" stroke="#F59E0B" strokeWidth="1" strokeDasharray="2 2" />
        <text x="27" y="70" fill="#FBBF24" fontSize="5.5" fontFamily="JetBrains Mono, monospace">Sat</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        I_C = β·I_B • Early Effect V_A • Active, Saturation &amp; Cutoff Regions
      </text>
    </svg>
  );
}

/**
 * 54. Operational Amplifier (Op-Amp) Preview
 */
export function OpAmpPreview({ isHovered = false, className = '' }: PreviewProps) {
  return (
    <svg viewBox="0 0 320 200" className={`w-full h-full select-none ${className}`} fill="none">
      <rect width="320" height="200" fill="#0B1120" />
      <rect x="14" y="14" width="292" height="172" rx="6" fill="#070D1A" stroke="#1E293B" strokeWidth="1" />
      <text x="24" y="32" fill="#10B981" fontSize="9" fontFamily="JetBrains Mono, monospace" fontWeight="bold">
        OP-AMP INVERTING AMPLIFIER &amp; FREQUENCY RESPONSE
      </text>
      {/* Op-Amp Triangle Symbol */}
      <g transform="translate(30, 50)">
        <polygon points="50,15 50,75 100,45" fill="#0F172A" stroke="#10B981" strokeWidth="1.5" />
        {/* Inverting (-) and Non-Inverting (+) */}
        <text x="56" y="32" fill="#EF4444" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">-</text>
        <text x="56" y="66" fill="#3B82F6" fontSize="8" fontFamily="JetBrains Mono, monospace" fontWeight="bold">+</text>
        {/* Inverting input line with R_in */}
        <line x1="5" y1="28" x2="22" y2="28" stroke="#94A3B8" strokeWidth="1.5" />
        <rect x="22" y="23" width="16" height="10" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
        <text x="30" y="31" fill="#FBBF24" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">R_in</text>
        <line x1="38" y1="28" x2="50" y2="28" stroke="#94A3B8" strokeWidth="1.5" />
        {/* Feedback resistor R_f */}
        <line x1="44" y1="28" x2="44" y2="8" stroke="#94A3B8" strokeWidth="1.2" />
        <line x1="44" y1="8" x2="60" y2="8" stroke="#94A3B8" strokeWidth="1.2" />
        <rect x="60" y="3" width="20" height="10" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
        <text x="70" y="11" fill="#FBBF24" fontSize="6.5" fontFamily="JetBrains Mono, monospace" textAnchor="middle">R_f</text>
        <line x1="80" y1="8" x2="110" y2="8" stroke="#94A3B8" strokeWidth="1.2" />
        <line x1="110" y1="8" x2="110" y2="45" stroke="#94A3B8" strokeWidth="1.2" />
        {/* Output pin */}
        <line x1="100" y1="45" x2="125" y2="45" stroke="#10B981" strokeWidth="1.8" />
        <text x="128" y="48" fill="#34D399" fontSize="7" fontFamily="JetBrains Mono, monospace">V_out</text>
      </g>
      {/* Right: Inverted Sine Waveforms (Input vs Output) */}
      <g transform="translate(180, 50)">
        <line x1="10" y1="45" x2="115" y2="45" stroke="#334155" strokeWidth="1" />
        {/* Small Input Sine Wave */}
        <path d="M 10 45 Q 22 25 35 45 Q 48 65 60 45 Q 72 25 85 45 Q 98 65 110 45" stroke="#38BDF8" strokeWidth="1.5" fill="none" />
        <text x="15" y="24" fill="#38BDF8" fontSize="6.5" fontFamily="JetBrains Mono, monospace">V_in (1V)</text>
        {/* Large 180 deg Inverted Output Sine Wave */}
        <path d="M 10 45 Q 22 80 35 45 Q 48 10 60 45 Q 72 80 85 45 Q 98 10 110 45" stroke="#10B981" strokeWidth="2" strokeDasharray="3 1" fill="none" />
        <text x="65" y="85" fill="#34D399" fontSize="6.5" fontFamily="JetBrains Mono, monospace">V_out (-5V)</text>
      </g>
      <text x="24" y="168" fill="#64748B" fontSize="8" fontFamily="JetBrains Mono, monospace">
        A_v = -R_f / R_in • Virtual Ground V⁻ ≈ V⁺ = 0V • Slew Rate SR = dV/dt
      </text>
    </svg>
  );
}

/**
 * Universal Simulation Preview Dispatcher
 * Automatically routes simulation ID to its dedicated scientific visualization
 */
export function SimulationPreview({
  simId,
  category = '',
  isHovered = false,
  className = '',
}: {
  simId: string;
  category?: string;
  isHovered?: boolean;
  className?: string;
}) {
  switch (simId) {
    case 'projectile-motion':
    case 'projectile-motion-physics':
      return <ProjectileMotionPreview isHovered={isHovered} className={className} />;
    case 'network-theorems':
    case 'thevenin-norton-power':
      return <NetworkTheoremsPreview isHovered={isHovered} className={className} />;

    case 'digital-electronics':
    case 'digital-electronics-12-labs':
    case 'basic-logic-gates':
    case 'universal-nand-nor-realization':
      return <DigitalLogicPreview isHovered={isHovered} className={className} />;
    case 'coa-riscv':
    case 'coa':
      return <RiscVPipelinePreview isHovered={isHovered} className={className} />;
    case 'toc-automata':
    case 'toc':
      return <AutomataDfaPreview isHovered={isHovered} className={className} />;
    case 'ohms-law':
    case 'ohms-law-dc':
    case 'series-resistor-networks':
    case 'parallel-resistor-networks':
    case 'series-parallel-networks':
    case 'kirchhoff-current-law':
      return <OhmsLawCircuitPreview isHovered={isHovered} className={className} />;
    case 'diode-rectifier':
    case 'pn-diode-rectifier':
    case 'half-wave-rectifier':
    case 'full-wave-bridge-rectifier':
      return <DiodeRectifierPreview isHovered={isHovered} className={className} />;
    case 'adders':
    case 'half-adder-logic':
    case 'full-adder-logic':
    case 'half-full-adder':
    case 'half-full-subtractor':
    case 'adders-logic':
      return <AdderCircuitPreview isHovered={isHovered} className={className} />;
    case 'shift-registers':
      return <ShiftRegisterPreview isHovered={isHovered} className={className} />;
    case 'asynchronous-ripple-counters':
    case 'synchronous-counters':
      return <CounterTimingPreview isHovered={isHovered} className={className} />;
    case 'gray-code-converter':
      return <GrayCodePreview isHovered={isHovered} className={className} />;
    case 'magnitude-comparators':
      return <MagnitudeComparatorPreview isHovered={isHovered} className={className} />;
    case 'sr-latch-flipflop':
    case 'd-flipflop-register':
    case 'jk-flipflop-toggle':
    case 't-flipflop-frequency-divider':
      return <LatchFlipFlopPreview isHovered={isHovered} className={className} />;
    case 'harmonic-oscillator':
    case 'harmonic-oscillator-me':
      return <HarmonicOscillatorPreview isHovered={isHovered} className={className} />;
    case 'vector-field-studio':
    case 'mathematics-studio':
    case 'numerical-methods':
      return <VectorFieldPreview isHovered={isHovered} className={className} />;
    case 'orbital-mechanics':
      return <KeplerOrbitPreview isHovered={isHovered} className={className} />;
    case 'acid-base-titration':
    case 'acid-base-titration-curve':
      return <TitrationPreview isHovered={isHovered} className={className} />;
    case 'wave-optics':
    case 'wave-optics-physics':
      return <WaveOpticsPreview isHovered={isHovered} className={className} />;
    case 'truss-structural-analysis':
    case 'truss-structural-mechanics':
    case 'truss-analysis':
      return <TrussStructuralPreview isHovered={isHovered} className={className} />;
    case 'robotics-kinematics':
    case 'robot-kinematics-dh':
    case 'arm-kinematics':
      return <RoboticsKinematicsPreview isHovered={isHovered} className={className} />;
    case 'distillation-column':
    case 'mccabe-thiele-distillation':
    case 'distillation':
      return <DistillationColumnPreview isHovered={isHovered} className={className} />;
    case 'enzyme-kinetics':
    case 'enzyme-kinetics-michaelis-menten':
      return <EnzymeKineticsPreview isHovered={isHovered} className={className} />;

    // Mechanical Engineering
    case 'venturi-flow':
      return <VenturiFlowPreview isHovered={isHovered} className={className} />;
    case 'tensile-test':
      return <TensileTestPreview isHovered={isHovered} className={className} />;
    case 'pipe-friction':
      return <PipeFrictionPreview isHovered={isHovered} className={className} />;
    case 'torsion-test':
      return <TorsionTestPreview isHovered={isHovered} className={className} />;
    case 'four-bar':
      return <FourBarPreview isHovered={isHovered} className={className} />;

    // Civil & Structural Engineering
    case 'beam-bending':
      return <BeamBendingPreview isHovered={isHovered} className={className} />;
    case 'column-buckling':
      return <ColumnBucklingPreview isHovered={isHovered} className={className} />;
    case 'direct-shear':
      return <DirectShearPreview isHovered={isHovered} className={className} />;
    case 'weir-flow':
      return <WeirFlowPreview isHovered={isHovered} className={className} />;

    // Electrical Engineering
    case 'transformer-test':
      return <TransformerTestPreview isHovered={isHovered} className={className} />;
    case 'rlc-resonance':
      return <RlcResonancePreview isHovered={isHovered} className={className} />;
    case 'dc-motor':
      return <DcMotorPreview isHovered={isHovered} className={className} />;
    case 'two-wattmeter':
      return <TwoWattmeterPreview isHovered={isHovered} className={className} />;
    case 'alternator-regulation':
      return <AlternatorRegulationPreview isHovered={isHovered} className={className} />;

    // Chemical Engineering
    case 'reactor-kinetics':
    case 'chemical-kinetics':
      return <ReactorKineticsPreview isHovered={isHovered} className={className} />;
    case 'liquid-extraction':
      return <LiquidExtractionPreview isHovered={isHovered} className={className} />;
    case 'heat-exchanger':
      return <HeatExchangerPreview isHovered={isHovered} className={className} />;
    case 'gas-absorption':
      return <GasAbsorptionPreview isHovered={isHovered} className={className} />;

    // Biotechnology & Biomedical Engineering
    case 'bacterial-growth':
      return <BacterialGrowthPreview isHovered={isHovered} className={className} />;
    case 'kla-bioreactor':
      return <KlaBioreactorPreview isHovered={isHovered} className={className} />;
    case 'chromatography':
      return <ChromatographyPreview isHovered={isHovered} className={className} />;
    case 'pcr-kinetics':
      return <PcrKineticsPreview isHovered={isHovered} className={className} />;

    // Physical Sciences
    case 'photoelectric':
    case 'photoelectric-effect':
      return <PhotoelectricPreview isHovered={isHovered} className={className} />;
    case 'newtons-rings':
      return <NewtonsRingsPreview isHovered={isHovered} className={className} />;
    case 'diffraction-grating':
      return <DiffractionGratingPreview isHovered={isHovered} className={className} />;
    case 'coupled-oscillators':
      return <CoupledOscillatorsPreview isHovered={isHovered} className={className} />;

    // Robotics & Interdisciplinary
    case 'pid-tuning':
      return <PidTuningPreview isHovered={isHovered} className={className} />;
    case 'differential-drive':
      return <DifferentialDrivePreview isHovered={isHovered} className={className} />;
    case 'inverted-pendulum':
      return <InvertedPendulumPreview isHovered={isHovered} className={className} />;
    case 'bode-plot':
      return <BodePlotPreview isHovered={isHovered} className={className} />;

    // ECE / Analog Electronics
    case 'bjt-characteristics':
      return <BjtCharacteristicsPreview isHovered={isHovered} className={className} />;
    case 'op-amp':
      return <OpAmpPreview isHovered={isHovered} className={className} />;

    default:
      return <GenericEceTopicPreview category={category} className={className} />;
  }
}

