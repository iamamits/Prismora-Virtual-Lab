'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PhetWorkbench } from './phet-workbench';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  computeViewport,
  applyVirtualViewport,
} from './viewport-helper';

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

  // Playback
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);

  // Camera
  const [userZoom, setUserZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tools
  const [showOscilloscope, setShowOscilloscope] = useState<boolean>(true);
  const [showElectrons, setShowElectrons] = useState<boolean>(true);
  const [showStopwatch, setShowStopwatch] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Electron particles around rectangular loop
  const electronsRef = useRef<Array<{ frac: number }>>([]);

  useEffect(() => {
    const list: Array<{ frac: number }> = [];
    for (let i = 0; i < 45; i++) {
      list.push({ frac: i / 45 });
    }
    electronsRef.current = list;
  }, []);

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
  const isResonant = Math.abs(frequencyHz - f0Hz) <= 2.5;

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

      let curT = simTime;
      if (isPlaying) {
        curT += dt;
        setSimTime(curT);

        const instV = sourceVoltageV * Math.sin(omega * curT);
        const instI = currentPeak * Math.sin(omega * curT - phaseRad);

        waveHistoryRef.current.push({ t: curT, v: instV, i: instI });
        if (waveHistoryRef.current.length > 250) waveHistoryRef.current.shift();

        const loopSpeed = instI * 0.45;
        const electrons = electronsRef.current;
        for (let i = 0; i < electrons.length; i++) {
          electrons[i]!.frac = (electrons[i]!.frac + loopSpeed * dt + 1.0) % 1.0;
        }

        if (onSampleUpdate) {
          onSampleUpdate({
            currentA: currentPeak / Math.SQRT2,
            impedanceOhms: z,
            phaseDeg,
            resonantFreqHz: f0Hz,
            isResonant,
          });
        }
      }

      // -------------------------------------------------------------
      // DRAW CANVAS (Virtual Viewport: 900 x 520)
      // -------------------------------------------------------------
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
      applyVirtualViewport(ctx, vp, dpr);

      // Lab Background
      const bgGrad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      if (showGrid) {
        ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= VIRTUAL_WIDTH; x += 45) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, VIRTUAL_HEIGHT);
          ctx.stroke();
        }
        for (let y = 0; y <= VIRTUAL_HEIGHT; y += 45) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(VIRTUAL_WIDTH, y);
          ctx.stroke();
        }
      }

      // Left: Circuit (x: 40 to 450)
      // Right: Oscilloscope (x: 480 to 860)
      const loopL = 60;
      const loopR = 430;
      const loopT = 90;
      const loopB = 430;
      const loopPerimeter = 2 * (loopR - loopL + (loopB - loopT));

      const getLoopCoord = (frac: number) => {
        const dist = frac * loopPerimeter;
        const w = loopR - loopL;
        const h = loopB - loopT;

        if (dist < w) return { x: loopL + dist, y: loopT };
        if (dist < w + h) return { x: loopR, y: loopT + (dist - w) };
        if (dist < 2 * w + h) return { x: loopR - (dist - (w + h)), y: loopB };
        return { x: loopL, y: loopB - (dist - (2 * w + h)) };
      };

      // Copper Wires
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3.5;
      ctx.strokeRect(loopL, loopT, loopR - loopL, loopB - loopT);

      // Electrons
      if (showElectrons) {
        const electrons = electronsRef.current;
        for (let i = 0; i < electrons.length; i++) {
          const pt = getLoopCoord(electrons[i]!.frac);
          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = 'rgba(250, 204, 21, 0.35)';
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 7, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Components
      // Generator (Left)
      const genY = (loopT + loopB) / 2;
      ctx.fillStyle = '#0F172A';
      ctx.beginPath();
      ctx.arc(loopL, genY, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (let s = -12; s <= 12; s++) {
        const sy = Math.sin((s / 12) * Math.PI) * 8;
        if (s === -12) ctx.moveTo(loopL + s, genY + sy);
        else ctx.lineTo(loopL + s, genY + sy);
      }
      ctx.stroke();

      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${sourceVoltageV} V~`, loopL - 28, genY - 4);
      ctx.fillText(`${frequencyHz} Hz`, loopL - 28, genY + 10);

      // Resistor (Top)
      const resX = (loopL + loopR) / 2;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(resX - 30, loopT - 14, 60, 28);

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const zSteps = 6;
      for (let z = 0; z <= zSteps; z++) {
        const zx = resX - 30 + (z / zSteps) * 60;
        const zy = loopT + (z % 2 === 1 ? -10 : 10);
        if (z === 0) ctx.moveTo(zx, loopT);
        else if (z === zSteps) ctx.lineTo(zx, loopT);
        else ctx.lineTo(zx, zy);
      }
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.textAlign = 'center';
      ctx.fillText(`R = ${R} Ω`, resX, loopT - 20);

      // Inductor (Right)
      const indY = (loopT + loopB) / 2;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(loopR - 14, indY - 35, 28, 70);

      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      for (let c = 0; c < 4; c++) {
        const cy = indY - 26 + c * 17;
        ctx.beginPath();
        ctx.arc(loopR, cy, 9, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      }

      ctx.fillStyle = '#10B981';
      ctx.textAlign = 'left';
      ctx.fillText(`L = ${inductanceMh} mH`, loopR + 20, indY - 6);
      ctx.fillText(`X_L = ${xl.toFixed(1)} Ω`, loopR + 20, indY + 10);

      // Capacitor (Bottom)
      const capX = (loopL + loopR) / 2;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(capX - 20, loopB - 18, 40, 36);

      ctx.strokeStyle = '#EC4899';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(capX - 8, loopB - 14);
      ctx.lineTo(capX - 8, loopB + 14);
      ctx.moveTo(capX + 8, loopB - 14);
      ctx.lineTo(capX + 8, loopB + 14);
      ctx.stroke();

      ctx.fillStyle = '#EC4899';
      ctx.textAlign = 'center';
      ctx.fillText(`C = ${capacitanceUf} µF`, capX, loopB + 28);
      ctx.fillText(`X_C = ${xc.toFixed(1)} Ω`, capX, loopB + 42);

      // Resonance Badge
      if (isResonant) {
        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        const bW = 150;
        const bH = 40;
        ctx.beginPath();
        ctx.roundRect((loopL + loopR) / 2 - bW / 2, (loopT + loopB) / 2 - bH / 2, bW, bH, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText('⚡ RESONANCE PEAK', (loopL + loopR) / 2, (loopT + loopB) / 2 - 2);
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`f₀ = ${f0Hz.toFixed(1)} Hz`, (loopL + loopR) / 2, (loopT + loopB) / 2 + 12);
      }

      // -------------------------------------------------------------
      // Right: Digital Oscilloscope Screen (x: 480 to 860)
      // -------------------------------------------------------------
      if (showOscilloscope) {
        const oscX = 480;
        const oscY = 60;
        const oscW = 380;
        const oscH = 400;

        ctx.save();
        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(oscX, oscY, oscW, oscH, 10);
        ctx.fill();
        ctx.stroke();

        // Oscilloscope Phosphor Grid
        const oscCenterY = oscY + oscH / 2;
        ctx.strokeStyle = '#0F291E';
        ctx.lineWidth = 1;
        for (let gx = oscX; gx <= oscX + oscW; gx += 25) {
          ctx.beginPath();
          ctx.moveTo(gx, oscY);
          ctx.lineTo(gx, oscY + oscH);
          ctx.stroke();
        }
        for (let gy = oscY; gy <= oscY + oscH; gy += 25) {
          ctx.beginPath();
          ctx.moveTo(oscX, gy);
          ctx.lineTo(oscX + oscW, gy);
          ctx.stroke();
        }

        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(oscX, oscCenterY);
        ctx.lineTo(oscX + oscW, oscCenterY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#FACC15';
        ctx.fillText('CH1: Voltage V(t) [Yellow]', oscX + 14, oscY + 22);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText('CH2: Current I(t) [Cyan]', oscX + 14, oscY + 38);

        const hist = waveHistoryRef.current;
        if (hist.length > 2) {
          const vScale = (oscH * 0.35) / Math.max(1, sourceVoltageV);
          const iScale = (oscH * 0.35) / Math.max(0.01, currentPeak);

          ctx.strokeStyle = '#FACC15';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          hist.forEach((pt, idx) => {
            const px = oscX + (idx / hist.length) * oscW;
            const py = oscCenterY - pt.v * vScale;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();

          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          hist.forEach((pt, idx) => {
            const px = oscX + (idx / hist.length) * oscW;
            const py = oscCenterY - pt.i * iScale;
            if (idx === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          });
          ctx.stroke();
        }

        ctx.fillStyle = '#CBD5E1';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`I_rms: ${(currentPeak / Math.SQRT2).toFixed(2)} A`, oscX + oscW - 14, oscY + oscH - 28);
        ctx.fillText(`Phase φ: ${phaseDeg.toFixed(1)}°`, oscX + oscW - 14, oscY + oscH - 14);
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
    userZoom,
    pan,
    sourceVoltageV,
    frequencyHz,
    resistanceOhms,
    inductanceMh,
    capacitanceUf,
    showOscilloscope,
    showElectrons,
    showGrid,
    omega,
    currentPeak,
    phaseRad,
    phaseDeg,
    z,
    f0Hz,
    isResonant,
    onSampleUpdate,
  ]);

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
    <PhetWorkbench
      title="RLC Resonant Tank & Oscilloscope Workbench"
      subtitle="AC Reactive Alternating Current Dynamics"
      disciplineColor="#A855F7"
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onReset={() => {
        setSimTime(0);
        waveHistoryRef.current = [];
      }}
      simTime={simTime}
      playbackSpeed={playbackSpeed}
      onSpeedChange={setPlaybackSpeed}
      showVectors={showElectrons}
      onToggleVectors={() => setShowElectrons(!showElectrons)}
      showStopwatch={showStopwatch}
      onToggleStopwatch={() => setShowStopwatch(!showStopwatch)}
      showGrid={showGrid}
      onToggleGrid={() => setShowGrid(!showGrid)}
      onZoomIn={() => setUserZoom((z) => Math.min(2.5, z + 0.15))}
      onZoomOut={() => setUserZoom((z) => Math.max(0.6, z - 0.15))}
      onResetCamera={() => {
        setUserZoom(1.0);
        setPan({ x: 0, y: 0 });
      }}
      className={className}
    >
      <div ref={containerRef} className="w-full h-full relative select-none">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </PhetWorkbench>
  );
}
