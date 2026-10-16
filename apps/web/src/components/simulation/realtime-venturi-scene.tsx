'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PhetWorkbench } from './phet-workbench';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  computeViewport,
  applyVirtualViewport,
  screenToVirtualCoords,
} from './viewport-helper';

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
  yNorm: number;
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

  // Playback
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);

  // Camera
  const [userZoom, setUserZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tools
  const [showProbe, setShowProbe] = useState<boolean>(true);
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [showStopwatch, setShowStopwatch] = useState<boolean>(false);
  const [showStreamlines, setShowStreamlines] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Draggable Probe in Virtual space
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 450, y: 180 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);
  const [isDraggingThroat, setIsDraggingThroat] = useState<boolean>(false);

  // Particles
  const particlesRef = useRef<FluidParticle[]>([]);

  useEffect(() => {
    const pts: FluidParticle[] = [];
    for (let i = 0; i < 150; i++) {
      pts.push({
        x: 80 + Math.random() * 740,
        yNorm: (Math.random() - 0.5) * 1.7,
        size: Math.random() * 2.5 + 2,
        alpha: Math.random() * 0.6 + 0.4,
      });
    }
    particlesRef.current = pts;
  }, []);

  // Measurement Tape
  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 250,
    y1: 380,
    x2: 450,
    y2: 380,
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

      if (isPlaying) {
        setSimTime((t) => t + dt);
      }

      // Geometry in Virtual Coordinates (900 x 520)
      const pipeStartX = 80;
      const pipeEndX = 820;
      const throatX = 450;
      const pipeCenterY = 300;

      const dInletPx = 90;
      const rInletPx = dInletPx / 2;
      const dThroatPx = Math.max(25, Math.min(80, (throatDiameterMm / inletDiameterMm) * dInletPx));
      const rThroatPx = dThroatPx / 2;

      const getPipeRadius = (x: number) => {
        if (x < pipeStartX || x > pipeEndX) return rInletPx;
        const distFromThroat = Math.abs(x - throatX);
        const convergeLen = (throatX - pipeStartX) * 0.45;

        if (distFromThroat < 25) {
          return rThroatPx;
        } else if (distFromThroat < convergeLen + 25) {
          const frac = (distFromThroat - 25) / convergeLen;
          const smooth = 0.5 - 0.5 * Math.cos(frac * Math.PI);
          return rThroatPx + (rInletPx - rThroatPx) * smooth;
        } else {
          return rInletPx;
        }
      };

      const qM3s = (flowRateLps / 1000) * dischargeCoeff;
      const areaInlet = Math.PI * Math.pow((inletDiameterMm * 1e-3) / 2, 2);
      const vInlet = qM3s / areaInlet;

      const getVelocityAt = (x: number) => {
        const rVisual = getPipeRadius(x);
        const rRatio = rVisual / rInletPx;
        const areaRatio = rRatio * rRatio;
        return vInlet / Math.max(0.08, areaRatio);
      };

      // Particle physics update
      if (isPlaying) {
        const pts = particlesRef.current;
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i]!;
          const vLocal = getVelocityAt(pt.x);
          const pxSpeed = Math.max(70, vLocal * 110);
          pt.x += pxSpeed * dt;

          if (pt.x > pipeEndX) {
            pt.x = pipeStartX + Math.random() * 20;
            pt.yNorm = (Math.random() - 0.5) * 1.7;
          }
        }
      }

      // -------------------------------------------------------------
      // DRAW CANVAS (Virtual Viewport)
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

      // 1. Draw Pipe Interior Fluid
      ctx.save();
      ctx.beginPath();
      for (let x = pipeStartX; x <= pipeEndX; x += 6) {
        const r = getPipeRadius(x);
        if (x === pipeStartX) ctx.moveTo(x, pipeCenterY - r);
        else ctx.lineTo(x, pipeCenterY - r);
      }
      for (let x = pipeEndX; x >= pipeStartX; x -= 6) {
        const r = getPipeRadius(x);
        ctx.lineTo(x, pipeCenterY + r);
      }
      ctx.closePath();

      const fluidGrad = ctx.createLinearGradient(pipeStartX, 0, pipeEndX, 0);
      fluidGrad.addColorStop(0, 'rgba(6, 182, 212, 0.25)');
      fluidGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.5)');
      fluidGrad.addColorStop(1, 'rgba(6, 182, 212, 0.25)');
      ctx.fillStyle = fluidGrad;
      ctx.fill();

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // Flanges
      [pipeStartX, pipeEndX].forEach((fx) => {
        ctx.fillStyle = '#475569';
        ctx.fillRect(fx - 8, pipeCenterY - rInletPx - 14, 8, dInletPx + 28);
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(fx - 8, pipeCenterY - rInletPx - 14, 8, dInletPx + 28);
      });

      // 2. Streamline Particles
      if (showStreamlines) {
        const pts = particlesRef.current;
        for (let i = 0; i < pts.length; i++) {
          const pt = pts[i]!;
          if (pt.x < pipeStartX || pt.x > pipeEndX) continue;

          const rLocal = getPipeRadius(pt.x);
          const py = pipeCenterY + pt.yNorm * (rLocal - 5);
          const vLocal = getVelocityAt(pt.x);

          const speedFactor = Math.min(1.0, vLocal / (vInlet * 3.5));
          const rCol = Math.round(6 + speedFactor * 240);
          const gCol = Math.round(182 + speedFactor * 50);
          const bCol = Math.round(212 - speedFactor * 150);

          ctx.fillStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${pt.alpha})`;
          ctx.beginPath();
          ctx.arc(pt.x, py, pt.size, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(${rCol}, ${gCol}, ${bCol}, ${pt.alpha * 0.4})`;
          ctx.lineWidth = pt.size * 0.8;
          ctx.beginPath();
          ctx.moveTo(pt.x, py);
          ctx.lineTo(pt.x - vLocal * 9, py);
          ctx.stroke();
        }
      }

      // 3. Piezometer Glass Manometers
      const manometerInletX = pipeStartX + 120;
      const manometerThroatX = throatX;
      const manometerExitX = pipeEndX - 120;

      const vThroat = getVelocityAt(throatX);
      const deltaHMetres = Math.max(0, (vThroat * vThroat - vInlet * vInlet) / (2 * 9.81));
      const inletFluidHeightPx = 140;
      const throatFluidHeightPx = Math.max(30, inletFluidHeightPx - deltaHMetres * 240);
      const exitFluidHeightPx = inletFluidHeightPx - 10;

      const manometers = [
        { x: manometerInletX, h: inletFluidHeightPx, label: 'h₁ (Inlet)' },
        { x: manometerThroatX, h: throatFluidHeightPx, label: 'h₂ (Throat)' },
        { x: manometerExitX, h: exitFluidHeightPx, label: 'h₃ (Exit)' },
      ];

      manometers.forEach((m) => {
        const topPipeY = pipeCenterY - getPipeRadius(m.x);
        const tubeTopY = 45;
        const tubeW = 16;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 2;
        ctx.fillRect(m.x - tubeW / 2, tubeTopY, tubeW, topPipeY - tubeTopY);
        ctx.strokeRect(m.x - tubeW / 2, tubeTopY, tubeW, topPipeY - tubeTopY);

        const actualSurfaceY = Math.max(tubeTopY + 4, topPipeY - m.h);
        const colGrad = ctx.createLinearGradient(0, actualSurfaceY, 0, topPipeY);
        colGrad.addColorStop(0, '#38BDF8');
        colGrad.addColorStop(1, '#0284C7');
        ctx.fillStyle = colGrad;
        ctx.fillRect(m.x - tubeW / 2 + 1, actualSurfaceY, tubeW - 2, topPipeY - actualSurfaceY);

        ctx.fillStyle = '#BAE6FD';
        ctx.beginPath();
        ctx.ellipse(m.x, actualSurfaceY, tubeW / 2 - 1, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#CBD5E1';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(m.label, m.x, tubeTopY - 8);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`${(m.h * 0.35).toFixed(1)} cm`, m.x, actualSurfaceY - 6);
      });

      // Delta h reference line
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      const y1 = pipeCenterY - getPipeRadius(manometerInletX) - inletFluidHeightPx;
      const y2 = pipeCenterY - getPipeRadius(manometerThroatX) - throatFluidHeightPx;
      ctx.beginPath();
      ctx.moveTo(manometerInletX, y1);
      ctx.lineTo(manometerThroatX + 45, y1);
      ctx.moveTo(manometerThroatX, y2);
      ctx.lineTo(manometerThroatX + 45, y2);
      ctx.stroke();
      ctx.setLineDash([]);

      const arrowX = manometerThroatX + 40;
      ctx.beginPath();
      ctx.moveTo(arrowX, y1);
      ctx.lineTo(arrowX, y2);
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText(`Δh = ${(deltaHMetres * 100).toFixed(1)} cm`, arrowX + 6, (y1 + y2) / 2 + 4);

      // 4. Draggable Throat Handle
      const topThroatY = pipeCenterY - rThroatPx;
      ctx.fillStyle = isDraggingThroat ? '#F59E0B' : '#38BDF8';
      ctx.beginPath();
      ctx.arc(throatX, topThroatY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('d₂', throatX, topThroatY + 3);

      // 5. Pitot Sensor Probe
      if (showProbe) {
        const prX = probePos.x;
        const prY = probePos.y;

        ctx.strokeStyle = isDraggingProbe ? '#F59E0B' : '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(prX, prY, 14, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(prX - 18, prY);
        ctx.lineTo(prX + 18, prY);
        ctx.moveTo(prX, prY - 18);
        ctx.lineTo(prX + 18, prY + 18);
        ctx.stroke();

        const vAtProbe = getVelocityAt(prX);
        const dynP = 0.5 * fluidDensity * vAtProbe * vAtProbe * 1e-3;
        const staticP = 150 - dynP;

        const cardW = 160;
        const cardH = 65;
        const cardX = Math.min(VIRTUAL_WIDTH - cardW - 15, prX + 20);
        const cardY = Math.max(15, prY - 32);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, cardW, cardH, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('PITOT SENSOR PROBE', cardX + 8, cardY + 15);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`v(x): ${vAtProbe.toFixed(2)} m/s`, cardX + 8, cardY + 30);
        ctx.fillText(`P_dyn: ${dynP.toFixed(2)} kPa`, cardX + 85, cardY + 30);
        ctx.fillText(`P_stat: ${staticP.toFixed(1)} kPa`, cardX + 8, cardY + 46);
        ctx.fillText(`Pipe D: ${(getPipeRadius(prX) * 2 * (inletDiameterMm / dInletPx)).toFixed(1)} mm`, cardX + 8, cardY + 58);

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

      // 6. Measurement Tape
      if (showRuler) {
        const { x1, y1, x2, y2 } = rulerTape;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distPx = Math.sqrt(dx * dx + dy * dy);
        const tapeMm = (distPx / dInletPx) * inletDiameterMm;

        ctx.save();
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 4;
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
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        });

        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(midX - 35, midY - 20, 70, 18, 4);
        ctx.fill();

        ctx.fillStyle = '#FACC15';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${tapeMm.toFixed(1)} mm`, midX, midY - 8);
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

  // Pointer interactions
  const getVirtualPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const dpr = window.devicePixelRatio || 1;
    const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
    return screenToVirtualCoords(e.clientX, e.clientY, canvas, vp);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getVirtualPointer(e);

    if (showProbe && Math.hypot(x - probePos.x, y - probePos.y) <= 25) {
      setIsDraggingProbe(true);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    if (showRuler) {
      if (Math.hypot(x - rulerTape.x1, y - rulerTape.y1) <= 18) {
        setActiveTapeHandle('p1');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      if (Math.hypot(x - rulerTape.x2, y - rulerTape.y2) <= 18) {
        setActiveTapeHandle('p2');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    // Throat handle check
    const dInletPx = 90;
    const dThroatPx = Math.max(25, Math.min(80, (throatDiameterMm / inletDiameterMm) * dInletPx));
    const topThroatY = 300 - dThroatPx / 2;

    if (Math.hypot(x - 450, y - topThroatY) <= 18) {
      setIsDraggingThroat(true);
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x, y } = getVirtualPointer(e);

    if (isDraggingProbe) {
      setProbePos({
        x: Math.max(20, Math.min(VIRTUAL_WIDTH - 20, x)),
        y: Math.max(20, Math.min(VIRTUAL_HEIGHT - 20, y)),
      });
      return;
    }
    if (activeTapeHandle === 'p1') {
      setRulerTape((prev) => ({ ...prev, x1: x, y1: y }));
      return;
    }
    if (activeTapeHandle === 'p2') {
      setRulerTape((prev) => ({ ...prev, x2: x, y2: y }));
      return;
    }

    if (isDraggingThroat && onThroatChange) {
      const dInletPx = 90;
      const newRadiusPx = Math.max(12, Math.min(42, 300 - y));
      const newDiamMm = Math.round(((newRadiusPx * 2) / dInletPx) * inletDiameterMm);
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
      title="Bernoulli Venturimeter Flow Bench"
      subtitle="2D Continuous Fluid Dynamics & Piezometer Columns"
      disciplineColor="#06B6D4"
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onReset={() => setSimTime(0)}
      simTime={simTime}
      playbackSpeed={playbackSpeed}
      onSpeedChange={setPlaybackSpeed}
      showProbe={showProbe}
      onToggleProbe={() => setShowProbe(!showProbe)}
      showRuler={showRuler}
      onToggleRuler={() => setShowRuler(!showRuler)}
      showStopwatch={showStopwatch}
      onToggleStopwatch={() => setShowStopwatch(!showStopwatch)}
      showVectors={showStreamlines}
      onToggleVectors={() => setShowStreamlines(!showStreamlines)}
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
      <div
        ref={containerRef}
        className="w-full h-full relative cursor-crosshair select-none touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />

        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] font-mono text-zinc-400/80 bg-zinc-900/80 backdrop-blur-xs px-2.5 py-1 rounded border border-zinc-800 flex items-center gap-2">
          <span className="text-cyan-400 font-bold">💡 PhET Tip:</span>
          <span>Drag the blue handle on the throat (d₂) to change constriction, or move the Pitot probe anywhere!</span>
        </div>
      </div>
    </PhetWorkbench>
  );
}
