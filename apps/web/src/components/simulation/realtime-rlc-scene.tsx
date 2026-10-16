'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Crosshair,
  Zap,
  Activity,
  Grid,
} from 'lucide-react';

export interface RealtimeRlcSceneProps {
  resistanceOhms: number;
  inductanceMh: number;
  capacitanceUf: number;
  sourceVoltageV: number;
  frequencyHz: number;
  className?: string;
  onSampleUpdate?: (sample: {
    currentA: number;
    impedanceOhms: number;
    phaseDeg: number;
    resonantFreqHz: number;
    isResonant: boolean;
  }) => void;
}

export function RealtimeRlcScene({
  resistanceOhms,
  inductanceMh,
  capacitanceUf,
  sourceVoltageV,
  frequencyHz,
  className = '',
  onSampleUpdate,
}: RealtimeRlcSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Transport State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);

  // Tools
  const [showOscilloscope, setShowOscilloscope] = useState<boolean>(true);
  const [showPhasor, setShowPhasor] = useState<boolean>(true);
  const [showElectrons, setShowElectrons] = useState<boolean>(true);
  const [probeComponent, setProbeComponent] = useState<'total' | 'R' | 'L' | 'C'>('total');

  // Electron particles around rectangular circuit loop
  const electronsRef = useRef<Array<{ frac: number }>>([]);

  useEffect(() => {
    const list: Array<{ frac: number }> = [];
    for (let i = 0; i < 40; i++) {
      list.push({ frac: i / 40 });
    }
    electronsRef.current = list;
  }, []);

  // AC electrical computations
  const omega = 2 * Math.PI * frequencyHz;
  const L = inductanceMh * 1e-3;
  const C = capacitanceUf * 1e-6;
  const R = resistanceOhms;

  const xl = omega * L;
  const xc = C > 0 && omega > 0 ? 1 / (omega * C) : 0;
  const xNet = xl - xc;
  const z = Math.sqrt(R * R + xNet * xNet);
  const currentPeak = z > 0 ? sourceVoltageV / z : 0;
  const phaseRad = Math.atan2(xNet, R);
  const phaseDeg = (phaseRad * 180) / Math.PI;

  const f0Hz = 1 / (2 * Math.PI * Math.sqrt(L * C));
  const isResonant = Math.abs(frequencyHz - f0Hz) <= 2.0;

  // Waveform history buffer
  const waveHistoryRef = useRef<Array<{ t: number; v: number; i: number }>>([]);

  // Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1) * playbackSpeed;
      lastTime = now;

      const canvas = canvasRef.current;
      if (!canvas) {
        animId = requestAnimationFrame(render);
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        animId = requestAnimationFrame(render);
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      let curT = simTime;
      if (isPlaying) {
        curT += dt;
        setSimTime(curT);

        // Instantaneous values
        const instV = sourceVoltageV * Math.sin(omega * curT);
        const instI = currentPeak * Math.sin(omega * curT - phaseRad);

        // Record wave history
        waveHistoryRef.current.push({ t: curT, v: instV, i: instI });
        if (waveHistoryRef.current.length > 250) waveHistoryRef.current.shift();

        // Advance electron charges along circuit perimeter
        const loopSpeed = instI * 0.45;
        const electrons = electronsRef.current;
        for (let i = 0; i < electrons.length; i++) {
          electrons[i]!.frac = (electrons[i]!.frac + loopSpeed * dt + 1.0) % 1.0;
        }

        if (onSampleUpdate) {
          onSampleUpdate({
            currentA: currentPeak / Math.SQRT2, // RMS
            impedanceOhms: z,
            phaseDeg,
            resonantFreqHz: f0Hz,
            isResonant,
          });
        }
      }

      // -------------------------------------------------------------
      // DRAW CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, width, height);

      // Left: Schematic Circuit Loop with glowing components
      // Right: Digital Oscilloscope Screen
      const circuitW = width * 0.52;
      const oscX = circuitW + 10;
      const oscW = width - oscX - 16;
      const oscH = height - 50;

      // 1. Circuit Loop Path Geometry
      const loopL = 40;
      const loopR = circuitW - 30;
      const loopT = 55;
      const loopB = height - 60;
      const loopPerimeter = 2 * ((loopR - loopL) + (loopB - loopT));

      // Coordinate mapper from fraction (0 to 1) along rectangular perimeter
      const getLoopCoord = (frac: number) => {
        const dist = frac * loopPerimeter;
        const w = loopR - loopL;
        const h = loopB - loopT;

        if (dist < w) {
          // Top branch (left to right)
          return { x: loopL + dist, y: loopT };
        } else if (dist < w + h) {
          // Right branch (top to bottom)
          return { x: loopR, y: loopT + (dist - w) };
        } else if (dist < 2 * w + h) {
          // Bottom branch (right to left)
          return { x: loopR - (dist - (w + h)), y: loopB };
        } else {
          // Left branch (bottom to top)
          return { x: loopL, y: loopB - (dist - (2 * w + h)) };
        }
      };

      // Draw Circuit Copper Wires
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.strokeRect(loopL, loopT, loopR - loopL, loopB - loopT);

      // 2. Animated Electrons flowing along wire
      if (showElectrons) {
        const electrons = electronsRef.current;
        for (let i = 0; i < electrons.length; i++) {
          const pt = getLoopCoord(electrons[i]!.frac);
          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(250, 204, 21, 0.4)';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Components mounted in loop
      // Left Branch: AC Sine Voltage Generator
      const genY = (loopT + loopB) / 2;
      ctx.fillStyle = '#0B1120';
      ctx.beginPath();
      ctx.arc(loopL, genY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Sine wave symbol inside generator
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = -10; s <= 10; s++) {
        const sy = Math.sin((s / 10) * Math.PI) * 6;
        if (s === -10) ctx.moveTo(loopL + s, genY + sy);
        else ctx.lineTo(loopL + s, genY + sy);
      }
      ctx.stroke();

      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${sourceVoltageV}V ~`, loopL - 22, genY - 4);
      ctx.fillText(`${frequencyHz}Hz`, loopL - 22, genY + 8);

      // Top Branch: Resistor R
      const resX = (loopL + loopR) / 2;
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(resX - 25, loopT - 12, 50, 24);

      // Zigzag resistor
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(resX - 25, loopT);
      const zigzagSteps = 6;
      for (let z = 0; z <= zigzagSteps; z++) {
        const zx = resX - 25 + (z / zigzagSteps) * 50;
        const zy = loopT + (z % 2 === 1 ? -8 : 8);
        if (z === 0) ctx.moveTo(zx, loopT);
        else if (z === zigzagSteps) ctx.lineTo(zx, loopT);
        else ctx.lineTo(zx, zy);
      }
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.textAlign = 'center';
      ctx.fillText(`R = ${R} Ω`, resX, loopT - 18);

      // Right Branch: Inductor L
      const indY = (loopT + loopB) / 2;
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(loopR - 12, indY - 30, 24, 60);

      // Inductor coiled loops
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      for (let c = 0; c < 4; c++) {
        const cy = indY - 22 + c * 14;
        ctx.beginPath();
        ctx.arc(loopR, cy, 7, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#10B981';
      ctx.textAlign = 'left';
      ctx.fillText(`L = ${inductanceMh} mH`, loopR + 18, indY);
      ctx.fillText(`X_L = ${xl.toFixed(1)} Ω`, loopR + 18, indY + 12);

      // Bottom Branch: Capacitor C
      const capX = (loopL + loopR) / 2;
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(capX - 16, loopB - 14, 32, 28);

      // Capacitor parallel plates
      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(capX - 6, loopB - 12);
      ctx.lineTo(capX - 6, loopB + 12);
      ctx.moveTo(capX + 6, loopB - 12);
      ctx.lineTo(capX + 6, loopB + 12);
      ctx.stroke();

      ctx.fillStyle = '#EC4899';
      ctx.textAlign = 'center';
      ctx.fillText(`C = ${capacitanceUf} µF`, capX, loopB + 24);
      ctx.fillText(`X_C = ${xc.toFixed(1)} Ω`, capX, loopB + 36);

      // Resonance indicator banner in middle of circuit
      if (isResonant) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        const bannerW = 120;
        const bannerH = 34;
        ctx.beginPath();
        ctx.roundRect((loopL + loopR) / 2 - bannerW / 2, (loopT + loopB) / 2 - bannerH / 2, bannerW, bannerH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText('⚡ RESONANCE PEAK', (loopL + loopR) / 2, (loopT + loopB) / 2 - 2);
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`f₀ = ${f0Hz.toFixed(1)} Hz`, (loopL + loopR) / 2, (loopT + loopB) / 2 + 10);
      }

      // -------------------------------------------------------------
      // 4. Digital Oscilloscope Screen (Right Pane)
      // -------------------------------------------------------------
      if (showOscilloscope) {
        ctx.save();
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(oscX, 25, oscW, oscH, 8);
        ctx.fill();
        ctx.stroke();

        // Oscilloscope Green Grid
        const oscCenterY = 25 + oscH / 2;
        ctx.strokeStyle = '#0F291E';
        ctx.lineWidth = 1;
        for (let gx = oscX; gx <= oscX + oscW; gx += 20) {
          ctx.beginPath();
          ctx.moveTo(gx, 25);
          ctx.lineTo(gx, 25 + oscH);
          ctx.stroke();
        }
        for (let gy = 25; gy <= 25 + oscH; gy += 20) {
          ctx.beginPath();
          ctx.moveTo(oscX, gy);
          ctx.lineTo(oscX + oscW, gy);
          ctx.stroke();
        }

        // Center Axis
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        ctx.beginPath();
        ctx.moveTo(oscX, oscCenterY);
        ctx.lineTo(oscX + oscW, oscCenterY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Legend
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FACC15';
        ctx.fillText('CH1: V(t) [Yellow]', oscX + 10, 42);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('CH2: I(t) [Cyan]', oscX + 10, 56);

        // Stream waveforms from waveHistoryRef
        const hist = waveHistoryRef.current;
        if (hist.length > 2) {
          const vScale = (oscH * 0.35) / Math.max(1, sourceVoltageV);
          const iScale = (oscH * 0.35) / Math.max(0.01, currentPeak);

          // Draw Voltage Wave (Yellow)
          ctx.strokeStyle = '#FACC15';
          ctx.lineWidth = 2;
          ctx.beginPath();
          hist.forEach((pt, idx) => {
            const px = oscX + (idx / hist.length) * oscW;
            const py = oscCenterY - pt.v * vScale;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();

          // Draw Current Wave (Cyan)
          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          hist.forEach((pt, idx) => {
            const px = oscX + (idx / hist.length) * oscW;
            const py = oscCenterY - pt.i * iScale;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
        }

        // Phase & RMS readout at bottom of scope
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`I_rms: ${(currentPeak / Math.SQRT2).toFixed(2)} A`, oscX + oscW - 10, 25 + oscH - 24);
        ctx.fillText(`Phase φ: ${phaseDeg.toFixed(1)}°`, oscX + oscW - 10, 25 + oscH - 10);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isPlaying,
    playbackSpeed,
    sourceVoltageV,
    frequencyHz,
    resistanceOhms,
    inductanceMh,
    capacitanceUf,
    showOscilloscope,
    showElectrons,
    omega,
    currentPeak,
    phaseRad,
    phaseDeg,
    z,
    f0Hz,
    isResonant,
    onSampleUpdate,
  ]);

  // Adjust canvas size
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  return (
    <div className={`flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="font-mono font-bold text-zinc-100">RLC Resonant Circuit Workbench</span>
          <span className="text-zinc-500">|</span>
          <span className="font-mono text-zinc-400">Live Dual-Trace Oscilloscope</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowElectrons(!showElectrons)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
              showElectrons
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Charge Flow</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full h-[320px] sm:h-[380px] bg-[#0B1120]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Transport Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause AC' : 'Start AC'}</span>
          </button>

          <button
            onClick={() => setSimTime(0)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Phase</span>
          </button>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="text-zinc-500 mr-1 text-[11px]">Speed:</span>
          {[0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                playbackSpeed === spd
                  ? 'bg-cyan-500 text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {spd}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
