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
      return <ProjectileMotionPreview isHovered={isHovered} className={className} />;
    case 'network-theorems':
      return <NetworkTheoremsPreview isHovered={isHovered} className={className} />;

    case 'digital-electronics':
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
    case 'series-resistor-networks':
    case 'parallel-resistor-networks':
    case 'series-parallel-networks':
    case 'kirchhoff-current-law':
      return <OhmsLawCircuitPreview isHovered={isHovered} className={className} />;
    case 'diode-rectifier':
    case 'half-wave-rectifier':
    case 'full-wave-bridge-rectifier':
      return <DiodeRectifierPreview isHovered={isHovered} className={className} />;
    case 'adders':
    case 'half-adder-logic':
    case 'full-adder-logic':
    case 'half-full-adder':
    case 'half-full-subtractor':
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
      return <VectorFieldPreview isHovered={isHovered} className={className} />;
    case 'orbital-mechanics':
      return <KeplerOrbitPreview isHovered={isHovered} className={className} />;
    case 'acid-base-titration':
    case 'acid-base-titration-curve':
      return <TitrationPreview isHovered={isHovered} className={className} />;
    case 'wave-optics':
    case 'wave-optics-physics':
      return <WaveOpticsPreview isHovered={isHovered} className={className} />;
    default:
      return <GenericEceTopicPreview category={category} className={className} />;
  }
}
