'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Crosshair,
  Ruler,
  Grid,
  Zap,
} from 'lucide-react';

export interface RealtimeVenturiSceneProps {
  inletDiameterMm: number;
  throatDiameterMm: number;
  flowRateLps: number;
  dischargeCoeff: number;
  fluidDensity: number;
  className?: string;
  onThroatChange?: (newThroatMm: number) => void;
  onProbeSample?: (sample: {
    x: number;
    localVelocity: number;
    staticPressureKPa: number;
    dynamicPressureKPa: number;
    manometerHeightCm: number;
  }) => void;
}

interface FluidParticle {
  x: number;
  yNorm: number; // -1 to 1 across pipe cross-section
  size: number;
  alpha: number;
}

export function RealtimeVenturiScene({
  inletDiameterMm,
  throatDiameterMm,
  flowRateLps,
  dischargeCoeff,
  fluidDensity,
  className = '',
  onThroatChange,
  onProbeSample,
}: RealtimeVenturiSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Transport State
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);

  // Tools
  const [showProbe, setShowProbe] = useState<boolean>(true);
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [showStreamlines, setShowStreamlines] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Draggable Probe
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 330, y: 140 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  // Draggable Throat Constriction Handle
  const [isDraggingThroat, setIsDraggingThroat] = useState<boolean>(false);

  // Particles
  const particlesRef = useRef<FluidParticle[]>([]);

  // Initialize 140 particles
  useEffect(() => {
    const pts: FluidParticle[] = [];
    for (let i = 0; i < 140; i++) {
      pts.push({
        x: Math.random() * 600,
        yNorm: (Math.random() - 0.5) * 1.7, // -0.85 to +0.85
        size: Math.random() * 2.5 + 1.5,
        alpha: Math.random() * 0.6 + 0.4,
      });
    }
    particlesRef.current = pts;
  }, []);

  // Measurement Tape State
  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 180,
    y1: 220,
    x2: 330,
    y2: 220,
  });
  const [activeTapeHandle, setActiveTapeHandle] = useState<'none' | 'p1' | 'p2'>('none');

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

      if (isPlaying) {
        setSimTime((t) => t + dt);
      }

      // Pipe profile geometry definition
      // Pipe runs from x = 60 to x = width - 60
      const pipeStartX = 50;
      const pipeEndX = width - 50;
      const throatX = (pipeStartX + pipeEndX) * 0.5;
      const pipeCenterY = height * 0.58;

      const dInletPx = 70; // visual inlet diameter
      const rInletPx = dInletPx / 2;
      const dThroatPx = Math.max(20, Math.min(65, (throatDiameterMm / inletDiameterMm) * dInletPx));
      const rThroatPx = dThroatPx / 2;

      // Function returning pipe radius at position x
      const getPipeRadius = (x: number) => {
        if (x < pipeStartX || x > pipeEndX) return rInletPx;
        const distFromThroat = Math.abs(x - throatX);
        const convergeLen = (throatX - pipeStartX) * 0.45;

        if (distFromThroat < 20) {
          return rThroatPx;
        } else if (distFromThroat < convergeLen + 20) {
          const frac = (distFromThroat - 20) / convergeLen;
          const smooth = 0.5 - 0.5 * Math.cos(frac * Math.PI);
          return rThroatPx + (rInletPx - rThroatPx) * smooth;
        } else {
          return rInletPx;
        }
      };

      // Flow speed calculation across x
      // Continuity equation: v(x) = Q / A(x)
      const qM3s = (flowRateLps / 1000) * dischargeCoeff;
      const areaInlet = Math.PI * Math.pow(inletDiameterMm * 1e-3 / 2, 2);
      const vInlet = qM3s / areaInlet;

      const getVelocityAt = (x: number) => {
        const rVisual = getPipeRadius(x);
        const rRatio = rVisual / rInletPx;
        const areaRatio = rRatio * rRatio;
        return vInlet / Math.max(0.1, areaRatio);
      };

      // Update fluid particles
      if (isPlaying) {
        const pts = particlesRef.current;
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i]!;
          const vLocal = getVelocityAt(pt.x);
          // Scale visual velocity to pixels per second
          const pxSpeed = Math.max(60, vLocal * 90);
          pt.x += pxSpeed * dt;

          if (pt.x > pipeEndX) {
            pt.x = pipeStartX + Math.random() * 20;
            pt.yNorm = (Math.random() - 0.5) * 1.7;
          }
        }
      }

      // -------------------------------------------------------------
      // DRAW CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);

      // Background
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, width, height);

      // Grid
      if (showGrid) {
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // 1. Draw Glass Pipe Outline & Fluid Interior
      ctx.save();
      // Fluid Body Polygon
      ctx.beginPath();
      // Top wall from left to right
      for (let x = pipeStartX; x <= pipeEndX; x += 5) {
        const r = getPipeRadius(x);
        if (x === pipeStartX) ctx.moveTo(x, pipeCenterY - r);
        else ctx.lineTo(x, pipeCenterY - r);
      }
      // Bottom wall from right to left
      for (let x = pipeEndX; x >= pipeStartX; x -= 5) {
        const r = getPipeRadius(x);
        ctx.lineTo(x, pipeCenterY + r);
      }
      ctx.closePath();

      // Fluid interior gradient
      const fluidGrad = ctx.createLinearGradient(pipeStartX, 0, pipeEndX, 0);
      fluidGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      fluidGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.45)');
      fluidGrad.addColorStop(1, 'rgba(6, 182, 212, 0.25)');
      ctx.fillStyle = fluidGrad;
      ctx.fill();

      // Glass Pipe Outer Wall stroke
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.stroke();
      ctx.restore();

      // Pipe Flanges
      [pipeStartX, pipeEndX].forEach((fx) => {
        ctx.fillStyle = '#475569';
        ctx.fillRect(fx - 6, pipeCenterY - rInletPx - 10, 6, dInletPx + 20);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1;
        ctx.strokeRect(fx - 6, pipeCenterY - rInletPx - 10, 6, dInletPx + 20);
      });

      // 2. Fluid Particles & Streamlines
      if (showStreamlines) {
        const pts = particlesRef.current;
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i]!;
          if (pt.x < pipeStartX || pt.x > pipeEndX) continue;

          const rLocal = getPipeRadius(pt.x);
          const py = pipeCenterY + pt.yNorm * (rLocal - 4);
          const vLocal = getVelocityAt(pt.x);

          // Color based on velocity
          const speedFactor = Math.min(1.0, vLocal / (vInlet * 3.5));
          const rCol = Math.round(6 + speedFactor * 240);
          const gCol = Math.round(182 + speedFactor * 50);
          const bCol = Math.round(212 - speedFactor * 150);

          ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${pt.alpha})`;
          ctx.beginPath();
          ctx.arc(pt.x, py, pt.size, 0, Math.PI * 2);
          ctx.fill();

          // Speed streak tail
          ctx.strokeStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${pt.alpha * 0.4})`;
          ctx.lineWidth = pt.size * 0.7;
          ctx.beginPath();
          ctx.moveTo(pt.x, py);
          ctx.lineTo(pt.x - vLocal * 8, py);
          ctx.stroke();
        }
      }

      // 3. Vertical Piezometer Glass Manometers (Inlet, Throat, Exit)
      const manometerInletX = pipeStartX + 80;
      const manometerThroatX = throatX;
      const manometerExitX = pipeEndX - 80;

      const vThroat = getVelocityAt(throatX);
      // Bernoulli pressure head difference: Delta h = (v_throat^2 - v_inlet^2) / (2g)
      const deltaHMetres = Math.max(0, (vThroat * vThroat - vInlet * vInlet) / (2 * 9.81));
      const inletFluidHeightPx = 110;
      const throatFluidHeightPx = Math.max(25, inletFluidHeightPx - deltaHMetres * 220);
      const exitFluidHeightPx = inletFluidHeightPx - 8;

      const manometers = [
        { x: manometerInletX, h: inletFluidHeightPx, label: 'h₁ (Inlet)' },
        { x: manometerThroatX, h: throatFluidHeightPx, label: 'h₂ (Throat)' },
        { x: manometerExitX, h: exitFluidHeightPx, label: 'h₃ (Exit)' },
      ];

      manometers.forEach((m) => {
        const topPipeY = pipeCenterY - getPipeRadius(m.x);
        const tubeTopY = 35;
        const tubeW = 14;

        // Glass tube body
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 1.5;
        ctx.fillRect(m.x - tubeW / 2, tubeTopY, tubeW, topPipeY - tubeTopY);
        ctx.strokeRect(m.x - tubeW / 2, tubeTopY, tubeW, topPipeY - tubeTopY);

        // Fluid column inside tube
        const fluidSurfaceY = topPipeY - m.h;
        const actualSurfaceY = Math.max(tubeTopY + 4, fluidSurfaceY);

        const colGrad = ctx.createLinearGradient(0, actualSurfaceY, 0, topPipeY);
        colGrad.addColorStop(0, '#38BDF8');
        colGrad.addColorStop(1, '#0284C7');
        ctx.fillStyle = colGrad;
        ctx.fillRect(m.x - tubeW / 2 + 1, actualSurfaceY, tubeW - 2, topPipeY - actualSurfaceY);

        // Meniscus surface curve
        ctx.fillStyle = '#BAE6FD';
        ctx.beginPath();
        ctx.ellipse(m.x, actualSurfaceY, tubeW / 2 - 1, 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Label above tube
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(m.label, m.x, tubeTopY - 6);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`${(m.h * 0.4).toFixed(1)} cm`, m.x, actualSurfaceY - 6);
      });

      // Differential Manometer Head Delta h Indicator line
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      const y1 = pipeCenterY - getPipeRadius(manometerInletX) - inletFluidHeightPx;
      const y2 = pipeCenterY - getPipeRadius(manometerThroatX) - throatFluidHeightPx;
      ctx.beginPath();
      ctx.moveTo(manometerInletX, y1);
      ctx.lineTo(manometerThroatX + 35, y1);
      ctx.moveTo(manometerThroatX, y2);
      ctx.lineTo(manometerThroatX + 35, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Vertical Delta h arrow
      const arrowX = manometerThroatX + 30;
      ctx.strokeStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(arrowX, y1);
      ctx.lineTo(arrowX, y2);
      ctx.stroke();
      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText(`Δh = ${(deltaHMetres * 100).toFixed(1)} cm`, arrowX + 4, (y1 + y2) / 2 + 3);

      // 4. Draggable Throat Constriction Grip
      const topThroatY = pipeCenterY - rThroatPx;
      ctx.fillStyle = isDraggingThroat ? '#F59E0B' : '#38BDF8';
      ctx.beginPath();
      ctx.arc(throatX, topThroatY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('d₂', throatX, topThroatY + 3);

      // 5. Draggable Sensor Probe Tool
      if (showProbe) {
        const prX = probePos.x;
        const prY = probePos.y;

        ctx.strokeStyle = isDraggingProbe ? '#F59E0B' : '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(prX, prY, 13, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(prX - 16, prY);
        ctx.lineTo(prX + 16, prY);
        ctx.moveTo(prX, prY - 16);
        ctx.lineTo(prX, prY + 16);
        ctx.stroke();

        // Calculate sample at probe x
        const vAtProbe = getVelocityAt(prX);
        const dynP = 0.5 * fluidDensity * vAtProbe * vAtProbe * 1e-3; // kPa
        const staticP = 150 - dynP; // reference line

        const cardW = 145;
        const cardH = 58;
        const cardX = Math.min(width - cardW - 10, prX + 18);
        const cardY = Math.max(10, prY - 30);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('PITOT SENSOR PROBE', cardX + 8, cardY + 14);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`v(x): ${vAtProbe.toFixed(2)} m/s`, cardX + 8, cardY + 28);
        ctx.fillText(`P_dyn: ${dynP.toFixed(2)} kPa`, cardX + 75, cardY + 28);
        ctx.fillText(`P_stat: ${staticP.toFixed(1)} kPa`, cardX + 8, cardY + 42);
        ctx.fillText(`Pipe D: ${(getPipeRadius(prX) * 2 * (inletDiameterMm / dInletPx)).toFixed(1)} mm`, cardX + 8, cardY + 54);

        if (onProbeSample) {
          onProbeSample({
            x: prX,
            localVelocity: vAtProbe,
            staticPressureKPa: staticP,
            dynamicPressureKPa: dynP,
            manometerHeightCm: (staticP / (fluidDensity * 9.81)) * 100,
          });
        }
      }

      // 6. Measurement Tape Tool
      if (showRuler) {
        const { x1, y1, x2, y2 } = rulerTape;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const tapeDistPx = Math.sqrt(dx * dx + dy * dy);
        const tapeMm = (tapeDistPx / dInletPx) * inletDiameterMm;

        ctx.save();
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        [
          { x: x1, y: y1 },
          { x: x2, y: y2 },
        ].forEach((pt) => {
          ctx.fillStyle = '#FACC15';
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(midX - 35, midY - 18, 70, 16, 4);
        ctx.fill();

        ctx.fillStyle = '#FACC15';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${tapeMm.toFixed(1)} mm`, midX, midY - 7);
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
    inletDiameterMm,
    throatDiameterMm,
    flowRateLps,
    dischargeCoeff,
    fluidDensity,
    showGrid,
    showStreamlines,
    showProbe,
    showRuler,
    probePos,
    isDraggingProbe,
    isDraggingThroat,
    rulerTape,
    onProbeSample,
  ]);

  // Pointer Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (showProbe) {
      if (Math.hypot(px - probePos.x, py - probePos.y) <= 25) {
        setIsDraggingProbe(true);
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    if (showRuler) {
      if (Math.hypot(px - rulerTape.x1, py - rulerTape.y1) <= 15) {
        setActiveTapeHandle('p1');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      if (Math.hypot(px - rulerTape.x2, py - rulerTape.y2) <= 15) {
        setActiveTapeHandle('p2');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    // Throat Handle check
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const pipeStartX = 50;
    const pipeEndX = width - 50;
    const throatX = (pipeStartX + pipeEndX) * 0.5;
    const pipeCenterY = height * 0.58;
    const dInletPx = 70;
    const dThroatPx = Math.max(20, Math.min(65, (throatDiameterMm / inletDiameterMm) * dInletPx));
    const topThroatY = pipeCenterY - dThroatPx / 2;

    if (Math.hypot(px - throatX, py - topThroatY) <= 16) {
      setIsDraggingThroat(true);
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (isDraggingProbe) {
      setProbePos({ x: px, y: py });
      return;
    }
    if (activeTapeHandle === 'p1') {
      setRulerTape((prev) => ({ ...prev, x1: px, y1: py }));
      return;
    }
    if (activeTapeHandle === 'p2') {
      setRulerTape((prev) => ({ ...prev, x2: px, y2: py }));
      return;
    }

    if (isDraggingThroat && onThroatChange) {
      const dpr = window.devicePixelRatio || 1;
      const height = canvas.height / dpr;
      const pipeCenterY = height * 0.58;
      const dInletPx = 70;
      const newRadiusPx = Math.max(10, Math.min(32, pipeCenterY - py));
      const newDiamMm = Math.round((newRadiusPx * 2 / dInletPx) * inletDiameterMm);
      onThroatChange(Math.max(15, Math.min(inletDiameterMm - 5, newDiamMm)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingProbe(false);
    setIsDraggingThroat(false);
    setActiveTapeHandle('none');
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Resize canvas
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
      {/* Workbench Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="font-mono font-bold text-zinc-100">Bernoulli Venturimeter Flow Bench</span>
          <span className="text-zinc-500">|</span>
          <span className="font-mono text-zinc-400">Continuous 2D Fluid Simulation</span>
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowProbe(!showProbe)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
              showProbe
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Pitot Probe</span>
          </button>

          <button
            onClick={() => setShowRuler(!showRuler)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
              showRuler
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Ruler</span>
          </button>

          <button
            onClick={() => setShowStreamlines(!showStreamlines)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
              showStreamlines
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Streamlines</span>
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded-md text-zinc-400 hover:bg-zinc-800 transition-all ${
              showGrid ? 'text-zinc-200' : 'text-zinc-600'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-[320px] sm:h-[380px] bg-[#0B1120] cursor-crosshair select-none touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />

        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] font-mono text-zinc-400/80 bg-zinc-900/70 backdrop-blur-xs px-2.5 py-1 rounded border border-zinc-800/80 flex items-center gap-2">
          <span className="text-cyan-400 font-bold">💡 Tip:</span>
          <span>Drag the blue handle on the throat (d₂) to change constriction, or move the Pitot probe anywhere!</span>
        </div>
      </div>

      {/* Transport Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Flow'}</span>
          </button>

          <button
            onClick={() => setSimTime(0)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-400">Flow Time:</span>
          <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-cyan-400 font-bold tabular-nums">
            {simTime.toFixed(1)} s
          </span>
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
