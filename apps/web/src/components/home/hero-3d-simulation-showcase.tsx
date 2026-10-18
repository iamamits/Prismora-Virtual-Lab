/**
 * Prismora Hero 3D Motion Graphics Simulation Showcase
 *
 * Implements a cinematic 3D perspective live simulation carousel:
 * - 6 Flagship Live Animated Simulators cycling smoothly with 3D perspective depth,
 *   fly-forward transitions, and graceful fade-outs.
 * - Live Canvas & SVG animations for:
 *   1. 3D Projectile Cannon & Trajectory (Physics Kinematics)
 *   2. ECE Circuit Studio & Virtual Arduino Uno (Electronics & Microcontrollers)
 *   3. 60 FPS Fertilization Chamber & Calcium Wave (Human Reproduction Biology)
 *   4. Inside the CPU: 8-Bit Pipelined Architecture (Computer Systems)
 *   5. Gas Piston Vessel & Le Chatelier Optical Density (Chemical Equilibrium)
 *   6. Rutherford Alpha Particle Scattering (Atomic Physics)
 * - Autoplay timer with progress bar, manual scrub buttons, and direct Launch CTA.
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Activity,
  ArrowRight,
  Atom,
  CheckCircle2,
  Cpu,
  Dna,
  Flame,
  Layers,
  Pause,
  Play,
  Radio,
  Sparkles,
  Zap,
} from 'lucide-react';

interface ShowcaseSlide {
  id: string;
  discipline: string;
  disciplineColor: string;
  title: string;
  subtitle: string;
  route: string;
  stats: { label: string; value: string }[];
  tag: string;
}

const SHOWCASE_SLIDES: ShowcaseSlide[] = [
  {
    id: 'projectile',
    discipline: 'Physics & Kinematics',
    disciplineColor: '#2563EB',
    title: '3D Projectile Motion & Cannon Trajectory',
    subtitle: '60 FPS closed-form ballistics, vector decompositions (vx, vy), and live ground impact telemetry.',
    route: '/experiments/projectile-motion',
    tag: 'Kinematics Studio',
    stats: [
      { label: 'Initial Speed', value: '25.0 m/s' },
      { label: 'Launch Angle', value: '45.0°' },
      { label: 'Max Height', value: '15.93 m' },
      { label: 'Range', value: '63.71 m' },
    ],
  },
  {
    id: 'arduino',
    discipline: 'ECE & Embedded Hardware',
    disciplineColor: '#0284C7',
    title: 'Circuit Studio & Virtual Arduino Uno R3',
    subtitle: 'TinkerCAD + PhET construction kit with live ATmega328P C++ interpreter, blinking Pin 13, and spinning DC rotor.',
    route: '/experiments/ece/circuit-studio',
    tag: 'TinkerCAD + PhET',
    stats: [
      { label: 'MCU Core', value: 'ATmega328P' },
      { label: 'Clock Speed', value: '16.0 MHz' },
      { label: 'PWM Duty', value: '490 Hz' },
      { label: 'Pin 13 LED', value: 'BLINKING' },
    ],
  },
  {
    id: 'reproduction',
    discipline: 'Human Reproduction & Embryogenesis',
    disciplineColor: '#EC4899',
    title: '60 FPS Microscopic Fertilization Chamber',
    subtitle: 'Living Secondary Oocyte, swimming sperm cells, acrosome reaction, and glowing Ca²⁺ wave polyspermy block.',
    route: '/experiments/biology',
    tag: 'No Taboo • Pure Science',
    stats: [
      { label: 'Karyotype', value: '2n = 46 (XY)' },
      { label: 'Cortical Wave', value: 'Ca²⁺ ACTIVE' },
      { label: 'Polyspermy Block', value: 'ZP2 CLEAVED' },
      { label: 'Site', value: 'Ampulla' },
    ],
  },
  {
    id: 'cpu',
    discipline: 'Computer Architecture & Systems',
    disciplineColor: '#8B5CF6',
    title: 'Inside the CPU: 8-Bit Architecture',
    subtitle: 'Animated register datapath, instruction cycle, 5-stage pipeline, 256B RAM, and ALU accumulator.',
    route: '/experiments/coa',
    tag: 'Processor Lab',
    stats: [
      { label: 'Architecture', value: '8-Bit RISC' },
      { label: 'Registers', value: 'A, B, IR, PC' },
      { label: 'Pipeline', value: '5 Stages' },
      { label: 'Clock Speed', value: '4 Hz Step' },
    ],
  },
  {
    id: 'equilibrium',
    discipline: 'Chemical Sciences & Kinetics',
    disciplineColor: '#F59E0B',
    title: 'Chemical Equilibrium: N₂O₄ ⇌ 2 NO₂',
    subtitle: 'Endothermic gas dissociation in a movable piston chamber with live optical density and van \'t Hoff shifts.',
    route: '/experiments/chemistry',
    tag: 'Le Chatelier Lab',
    stats: [
      { label: 'Enthalpy ΔH°', value: '+57.2 kJ' },
      { label: 'Kc (298K)', value: '0.0059 M' },
      { label: 'Optical State', value: 'Red-Brown NO₂' },
      { label: 'Pressure', value: '1.85 atm' },
    ],
  },
  {
    id: 'rutherford',
    discipline: 'Modern Physics & Atomic Structure',
    disciplineColor: '#EAB308',
    title: 'Rutherford Alpha Particle Scattering',
    subtitle: 'Coulomb electrostatic repulsion on Gold foil nucleus (Z=79) with 180° backscattering detector.',
    route: '/experiments/physics',
    tag: 'Atoms & Nuclei',
    stats: [
      { label: 'Target Foil', value: 'Gold (Au, Z=79)' },
      { label: 'Beam Energy', value: '5.5 MeV' },
      { label: 'Closest Approach', value: '41.38 fm' },
      { label: 'Backscatter Rate', value: '1 in 8,000' },
    ],
  },
];

export function Hero3DSimulationShowcase() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentSlide = SHOWCASE_SLIDES[currentIndex]!;

  // Autoplay timer with progressive countdown
  useEffect(() => {
    if (isPaused) return;

    const DURATION = 6000; // 6 seconds per simulation
    const STEP = 50;
    const increment = (STEP / DURATION) * 100;

    const timer = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          setCurrentIndex((idx) => (idx + 1) % SHOWCASE_SLIDES.length);
          return 0;
        }
        return p + increment;
      });
    }, STEP);

    return () => clearInterval(timer);
  }, [isPaused, currentIndex]);

  // Live Canvas 60 FPS Micro-Simulator
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let t = 0;

    const render = () => {
      t += 0.035;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Deep scientific dark space background
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, w, h);

      // Subtle background grid
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // 1. PROJECTILE CANNON
      if (currentSlide.id === 'projectile') {
        const startX = 60;
        const startY = h - 50;

        // Draw Parabolic Arc
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38BDF8';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(startX, startY);

        const v0 = 24;
        const theta = Math.PI / 4;
        const g = 9.81;
        const maxTime = (2 * v0 * Math.sin(theta)) / (g * 0.25);
        const curT = (t * 4) % (maxTime + 1.5);

        for (let time = 0; time <= Math.min(curT, maxTime); time += 0.2) {
          const px = startX + v0 * Math.cos(theta) * time * 5;
          const py = startY - (v0 * Math.sin(theta) * time * 5 - 0.5 * (g * 0.25) * time * time * 25);
          ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Cannon Ball with glowing trail
        if (curT <= maxTime) {
          const ballX = startX + v0 * Math.cos(theta) * curT * 5;
          const ballY = startY - (v0 * Math.sin(theta) * curT * 5 - 0.5 * (g * 0.25) * curT * curT * 25);

          ctx.fillStyle = '#FACC15';
          ctx.shadowColor = '#FACC15';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Cannon barrel
        ctx.fillStyle = '#64748B';
        ctx.save();
        ctx.translate(startX, startY);
        ctx.rotate(-theta);
        ctx.fillRect(0, -8, 36, 16);
        ctx.restore();
      }

      // 2. ARDUINO CIRCUITS & MOTOR
      if (currentSlide.id === 'arduino') {
        const ardX = w / 2 - 120;
        const ardY = h / 2 - 70;

        // Arduino PCB
        ctx.fillStyle = '#00878F';
        ctx.strokeStyle = '#006468';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(ardX, ardY, 140, 100, 8);
        ctx.fill();
        ctx.stroke();

        // ATmega328P Chip
        ctx.fillStyle = '#0F172A';
        ctx.fillRect(ardX + 45, ardY + 30, 50, 40);

        // Blinking Pin 13 LED
        const isLedOn = Math.floor(t * 2) % 2 === 0;
        ctx.fillStyle = isLedOn ? '#FACC15' : '#713F12';
        ctx.shadowColor = isLedOn ? '#FACC15' : 'transparent';
        ctx.shadowBlur = isLedOn ? 18 : 0;
        ctx.beginPath();
        ctx.arc(ardX + 25, ardY + 25, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Spinning DC Motor
        const motX = ardX + 220;
        const motY = ardY + 50;

        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(motX, motY, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Propeller blades rotating
        ctx.save();
        ctx.translate(motX, motY);
        ctx.rotate(t * 12);
        ctx.fillStyle = '#38BDF8';
        ctx.fillRect(-30, -5, 60, 10);
        ctx.fillRect(-5, -30, 10, 60);
        ctx.restore();

        // Connecting Wires
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(ardX + 140, ardY + 30);
        ctx.bezierCurveTo(ardX + 170, ardY + 10, motX - 30, motY - 20, motX - 36, motY);
        ctx.stroke();
      }

      // 3. HUMAN REPRODUCTION & CALCIUM WAVE
      if (currentSlide.id === 'reproduction') {
        const eggX = w / 2;
        const eggY = h / 2;

        // Pulsing Secondary Oocyte
        const eggR = 50 + Math.sin(t) * 2;
        const grad = ctx.createRadialGradient(eggX, eggY, 10, eggX, eggY, eggR);
        grad.addColorStop(0, '#FDA4AF');
        grad.addColorStop(1, '#E11D48');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(eggX, eggY, eggR, 0, Math.PI * 2);
        ctx.fill();

        // Zona Pellucida
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(eggX, eggY, eggR + 15, 0, Math.PI * 2);
        ctx.stroke();

        // Calcium Wave radiating outward
        const caWave = (t * 35) % 90;
        ctx.strokeStyle = '#34D399';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#34D399';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(eggX, eggY, eggR + caWave, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Swimming motile sperm cells
        for (let i = 0; i < 18; i++) {
          const angle = (i / 18) * Math.PI * 2 + t * 0.4;
          const dist = eggR + 35 + Math.sin(i * 3 + t * 2) * 15;
          const sx = eggX + Math.cos(angle) * dist;
          const sy = eggY + Math.sin(angle) * dist;

          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(sx, sy, 4, 2.5, angle + Math.PI, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = 'rgba(255,255,255,0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(sx, sy);
          ctx.lineTo(sx + Math.cos(angle) * 12, sy + Math.sin(angle) * 12);
          ctx.stroke();
        }
      }

      // 4. INSIDE THE CPU
      if (currentSlide.id === 'cpu') {
        const startX = 70;
        const startY = h / 2 - 40;

        // 4 CPU Units (PC -> IR -> ALU -> RAM)
        const units = ['PROG COUNTER', 'INSTR REG', 'ALU ACCUM', '256B RAM'];
        units.forEach((u, i) => {
          const ux = startX + i * 115;
          ctx.fillStyle = '#1E1B4B';
          ctx.strokeStyle = '#818CF8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(ux, startY, 90, 60, 6);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#C7D2FE';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'center';
          ctx.fillText(u, ux + 45, startY + 35);
        });

        // Pulsing Bus Packets moving across units
        const busX = startX + ((t * 80) % 400);
        ctx.fillStyle = '#FACC15';
        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(busX, startY + 30, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 5. CHEMICAL EQUILIBRIUM & PISTON
      if (currentSlide.id === 'equilibrium') {
        const vesX = w / 2 - 70;
        const vesY = 60;
        const vesW = 140;
        const vesH = 160;

        // Dynamic Red-Brown NO2 Color shifting with sine wave
        const heatShift = (Math.sin(t * 1.5) + 1) / 2; // 0 to 1
        const rVal = Math.round(255 - heatShift * 125);
        const gVal = Math.round(240 - heatShift * 180);
        const bVal = Math.round(220 - heatShift * 205);

        // Vessel Body
        ctx.fillStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(vesX, vesY, vesW, vesH, 8);
        ctx.fill();
        ctx.stroke();

        // Piston Head moving up/down
        const pistonY = vesY + 20 + Math.sin(t * 1.5) * 25;
        ctx.fillStyle = '#334155';
        ctx.fillRect(vesX, pistonY, vesW, 14);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('N₂O₄ ⇌ 2 NO₂', w / 2, vesY + 110);
      }

      // 6. RUTHERFORD SCATTERING
      if (currentSlide.id === 'rutherford') {
        const nucX = w / 2;
        const nucY = h / 2;

        // Gold Target Nucleus (+79e)
        ctx.fillStyle = '#FACC15';
        ctx.shadowColor = '#FACC15';
        ctx.shadowBlur = 16;
        ctx.beginPath();
        ctx.arc(nucX, nucY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#713F12';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('+79e', nucX, nucY + 3);

        // Incoming Alpha Particles Hyperbolic trajectories
        for (let i = -3; i <= 3; i++) {
          const b = i * 20;
          ctx.strokeStyle = i === 0 ? '#EF4444' : '#F59E0B';
          ctx.lineWidth = i === 0 ? 2.5 : 1.5;
          ctx.beginPath();
          ctx.moveTo(nucX - 180, nucY + b);

          if (i === 0) {
            // Head-on backscattering 180°
            ctx.lineTo(nucX - 25, nucY);
            ctx.lineTo(nucX - 180, nucY - 40);
          } else {
            // Deflection
            const defAngle = (40 / Math.abs(b)) * (b > 0 ? 1 : -1);
            ctx.quadraticCurveTo(nucX, nucY + b * 0.4, nucX + 180, nucY + b + defAngle * 80);
          }
          ctx.stroke();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [currentSlide]);

  return (
    <div className="relative w-full rounded-3xl border-2 border-blue-500/30 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 shadow-2xl overflow-hidden text-white">
      {/* Top Header & Simulation Pill Ribbon */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-blue-400">
              Live Interactive 3D Simulation Engine
            </span>
            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-800">
              ● 60 FPS REAL PHYSICS
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1">
            {currentSlide.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5 max-w-2xl leading-relaxed">
            {currentSlide.subtitle}
          </p>
        </div>

        {/* Action Controls: Pause & Launch Simulator */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title={isPaused ? 'Resume Autoplay' : 'Pause Autoplay'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>

          <Link
            href={currentSlide.route}
            className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg hover:shadow-blue-500/25 transition-all"
          >
            <span>Launch Live Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Main 3D Perspective Visualizer Stage */}
      <div className="relative w-full h-[320px] sm:h-[380px] bg-slate-950 overflow-hidden">
        {/* 60 FPS HTML5 Canvas */}
        <canvas ref={canvasRef} width={800} height={380} className="w-full h-full block" />

        {/* Live Simulation Real-time Stats Overlay Cards */}
        <div className="absolute top-4 right-4 grid grid-cols-2 gap-2 pointer-events-none">
          {currentSlide.stats.map((s, idx) => (
            <div
              key={idx}
              className="px-3 py-2 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800/90 shadow-md text-left"
            >
              <span className="text-[9px] font-mono uppercase text-slate-400 block">{s.label}</span>
              <span className="text-xs font-black font-mono text-blue-400">{s.value}</span>
            </div>
          ))}
        </div>

        {/* Discipline Watermark Pill */}
        <div className="absolute bottom-4 left-4 pointer-events-none flex items-center gap-2">
          <span
            className="px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider text-white shadow-md border border-white/20"
            style={{ backgroundColor: currentSlide.disciplineColor }}
          >
            {currentSlide.discipline}
          </span>
          <span className="text-xs font-mono text-slate-400 bg-slate-900/80 px-2.5 py-1 rounded-full border border-slate-800">
            {currentSlide.tag}
          </span>
        </div>
      </div>

      {/* Bottom Progress Countdown Bar & Jump Pills */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Jump Pills for All 6 Simulators */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {SHOWCASE_SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => {
                setCurrentIndex(idx);
                setProgress(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all shrink-0 ${
                currentIndex === idx
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {idx + 1}. {slide.title.split(':')[0]?.split('&')[0]}
            </button>
          ))}
        </div>

        {/* Active Progress Bar */}
        <div className="w-full sm:w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden shrink-0">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-75"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
