'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Crosshair,
  Ruler,
  Grid,
  Zap,
  Sliders,
  RotateCcw,
} from 'lucide-react';

export interface RealtimeBeamSceneProps {
  spanLengthM: number;
  elasticModulusGpa: number;
  momentOfInertiaCm4: number;
  initialPointLoadKn?: number;
  initialLoadPositionM?: number;
  className?: string;
  onStateChange?: (state: {
    loadPositionM: number;
    pointLoadKn: number;
    reactionAKn: number;
    reactionBKn: number;
    maxDeflectionMm: number;
    maxMomentKnm: number;
  }) => void;
}

export function RealtimeBeamScene({
  spanLengthM,
  elasticModulusGpa,
  momentOfInertiaCm4,
  initialPointLoadKn = 25,
  initialLoadPositionM,
  className = '',
  onStateChange,
}: RealtimeBeamSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Interactive Load State
  const [pointLoadKn, setPointLoadKn] = useState<number>(initialPointLoadKn);
  const [loadPosM, setLoadPosM] = useState<number>(initialLoadPositionM ?? spanLengthM * 0.5);
  const [isDraggingLoad, setIsDraggingLoad] = useState<boolean>(false);

  // Tools
  const [showProbe, setShowProbe] = useState<boolean>(true);
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [showSfdBmd, setShowSfdBmd] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Deflectometer Dial Gauge Probe
  const [dialGaugeM, setDialGaugeM] = useState<number>(spanLengthM * 0.5);
  const [isDraggingDial, setIsDraggingDial] = useState<boolean>(false);

  // Ruler Tape
  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 80,
    y1: 170,
    x2: 300,
    y2: 170,
  });
  const [activeTapeHandle, setActiveTapeHandle] = useState<'none' | 'p1' | 'p2'>('none');

  // Deflection computation function
  // For simply supported beam with point load P at distance a from left support:
  // v(x) = - (P b x) / (6 E I L) * (L^2 - b^2 - x^2) for x <= a
  // v(x) = - (P a (L - x)) / (6 E I L) * (2 L x - x^2 - a^2) for x > a
  const computeDeflectionMm = useCallback(
    (xM: number, aM: number, pKn: number) => {
      const L = spanLengthM;
      const bM = L - aM;
      const E = elasticModulusGpa * 1e9; // Pa
      const I = momentOfInertiaCm4 * 1e-8; // m^4
      const P = pKn * 1e3; // N

      const EI = E * I;
      if (EI <= 0) return 0;

      let vM = 0;
      if (xM <= aM) {
        vM = (P * bM * xM / (6 * EI * L)) * (L * L - bM * bM - xM * xM);
      } else {
        const xDist = L - xM;
        vM = (P * aM * xDist / (6 * EI * L)) * (L * L - aM * aM - xDist * xDist);
      }
      return vM * 1e3; // return mm
    },
    [spanLengthM, elasticModulusGpa, momentOfInertiaCm4],
  );

  // Animation & Rendering Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
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

      // Coordinate scaling
      const beamStartX = 70;
      const beamEndX = width - 70;
      const beamPixelSpan = beamEndX - beamStartX;
      const pixelsPerMeter = beamPixelSpan / spanLengthM;
      const undeflectedY = 90;

      // Reactions
      const a = loadPosM;
      const b = spanLengthM - a;
      const ra = (pointLoadKn * b) / spanLengthM;
      const rb = (pointLoadKn * a) / spanLengthM;
      const maxM = (pointLoadKn * a * b) / spanLengthM; // kNm

      // Maximum deflection
      const maxDefl = computeDeflectionMm(spanLengthM / 2, a, pointLoadKn);

      if (onStateChange) {
        onStateChange({
          loadPositionM: a,
          pointLoadKn,
          reactionAKn: ra,
          reactionBKn: rb,
          maxDeflectionMm: maxDefl,
          maxMomentKnm: maxM,
        });
      }

      // -------------------------------------------------------------
      // DRAW CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);

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

      // Visual exaggeration factor for deflection
      const visualDeflScale = 6.0;

      // 1. Draw Supports (Pin at left, Roller at right)
      // Left Pin Support
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.moveTo(beamStartX, undeflectedY);
      ctx.lineTo(beamStartX - 14, undeflectedY + 24);
      ctx.lineTo(beamStartX + 14, undeflectedY + 24);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pin ground plate
      ctx.fillStyle = '#334155';
      ctx.fillRect(beamStartX - 18, undeflectedY + 24, 36, 4);

      // Right Roller Support
      ctx.beginPath();
      ctx.moveTo(beamEndX, undeflectedY);
      ctx.lineTo(beamEndX - 14, undeflectedY + 18);
      ctx.lineTo(beamEndX + 14, undeflectedY + 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Roller wheels
      [-7, 7].forEach((dx) => {
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(beamEndX + dx, undeflectedY + 22, 3.5, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#334155';
      ctx.fillRect(beamEndX - 18, undeflectedY + 26, 36, 4);

      // Reaction force arrows
      ctx.strokeStyle = '#10B981';
      ctx.fillStyle = '#10B981';
      ctx.lineWidth = 2.5;

      // R_A arrow (pointing UP)
      ctx.beginPath();
      ctx.moveTo(beamStartX, undeflectedY + 50);
      ctx.lineTo(beamStartX, undeflectedY + 30);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(beamStartX - 4, undeflectedY + 34);
      ctx.lineTo(beamStartX, undeflectedY + 28);
      ctx.lineTo(beamStartX + 4, undeflectedY + 34);
      ctx.fill();
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`R_A = ${ra.toFixed(1)} kN`, beamStartX, undeflectedY + 62);

      // R_B arrow (pointing UP)
      ctx.beginPath();
      ctx.moveTo(beamEndX, undeflectedY + 50);
      ctx.lineTo(beamEndX, undeflectedY + 32);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(beamEndX - 4, undeflectedY + 36);
      ctx.lineTo(beamEndX, undeflectedY + 30);
      ctx.lineTo(beamEndX + 4, undeflectedY + 36);
      ctx.fill();
      ctx.fillText(`R_B = ${rb.toFixed(1)} kN`, beamEndX, undeflectedY + 62);

      // 2. Draw Elastic Deflected Beam
      ctx.save();
      const beamThick = 12;
      const numPoints = 80;

      // Top edge of beam
      ctx.beginPath();
      for (let i = 0; i <= numPoints; i++) {
        const xFrac = i / numPoints;
        const curX = beamStartX + xFrac * beamPixelSpan;
        const curM = xFrac * spanLengthM;
        const deflMm = computeDeflectionMm(curM, a, pointLoadKn);
        const curY = undeflectedY + deflMm * visualDeflScale - beamThick / 2;
        if (i === 0) ctx.moveTo(curX, curY);
        else ctx.lineTo(curX, curY);
      }
      // Bottom edge of beam (reverse)
      for (let i = numPoints; i >= 0; i--) {
        const xFrac = i / numPoints;
        const curX = beamStartX + xFrac * beamPixelSpan;
        const curM = xFrac * spanLengthM;
        const deflMm = computeDeflectionMm(curM, a, pointLoadKn);
        const curY = undeflectedY + deflMm * visualDeflScale + beamThick / 2;
        ctx.lineTo(curX, curY);
      }
      ctx.closePath();

      // Steel I-beam gradient
      const steelGrad = ctx.createLinearGradient(0, undeflectedY - 10, 0, undeflectedY + 30);
      steelGrad.addColorStop(0, '#38BDF8');
      steelGrad.addColorStop(0.5, '#0284C7');
      steelGrad.addColorStop(1, '#0369A1');
      ctx.fillStyle = steelGrad;
      ctx.fill();
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 3. Draggable Point Load Arrow (P)
      const loadPxX = beamStartX + loadPosM * pixelsPerMeter;
      const deflAtLoad = computeDeflectionMm(loadPosM, a, pointLoadKn);
      const loadTipY = undeflectedY + deflAtLoad * visualDeflScale - beamThick / 2;
      const loadArrowLen = Math.min(65, 30 + pointLoadKn * 1.2);

      ctx.save();
      ctx.strokeStyle = isDraggingLoad ? '#F59E0B' : '#EF4444';
      ctx.fillStyle = isDraggingLoad ? '#F59E0B' : '#EF4444';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(loadPxX, loadTipY - loadArrowLen);
      ctx.lineTo(loadPxX, loadTipY);
      ctx.stroke();

      // Arrowhead pointing down
      ctx.beginPath();
      ctx.moveTo(loadPxX - 7, loadTipY - 10);
      ctx.lineTo(loadPxX, loadTipY);
      ctx.lineTo(loadPxX + 7, loadTipY - 10);
      ctx.closePath();
      ctx.fill();

      // Load grip handle circle
      ctx.beginPath();
      ctx.arc(loadPxX, loadTipY - loadArrowLen, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`P = ${pointLoadKn} kN`, loadPxX, loadTipY - loadArrowLen - 12);
      ctx.fillStyle = '#F59E0B';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(`x = ${loadPosM.toFixed(2)} m`, loadPxX, loadTipY - loadArrowLen - 2);
      ctx.restore();

      // 4. Dial Gauge (Deflectometer Probe)
      if (showProbe) {
        const dialPxX = beamStartX + dialGaugeM * pixelsPerMeter;
        const deflAtDial = computeDeflectionMm(dialGaugeM, a, pointLoadKn);
        const dialTipY = undeflectedY + deflAtDial * visualDeflScale + beamThick / 2;

        ctx.save();
        // Dial gauge probe stem
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dialPxX, dialTipY);
        ctx.lineTo(dialPxX, dialTipY + 20);
        ctx.stroke();

        // Dial face
        const dialCenterY = dialTipY + 34;
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dialPxX, dialCenterY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Needle
        const needleAng = deflAtDial * 0.4;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(dialPxX, dialCenterY);
        ctx.lineTo(dialPxX + Math.sin(needleAng) * 10, dialCenterY - Math.cos(needleAng) * 10);
        ctx.stroke();

        // Readout badge
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`δ = ${deflAtDial.toFixed(2)} mm`, dialPxX, dialCenterY + 24);
        ctx.fillText(`@ x = ${dialGaugeM.toFixed(2)}m`, dialPxX, dialCenterY + 35);
        ctx.restore();
      }

      // 5. Live SFD & BMD (Bottom diagrams)
      if (showSfdBmd) {
        const sfdZeroY = height * 0.65;
        const bmdZeroY = height * 0.88;
        const diagW = beamPixelSpan;

        // SFD (Shear Force Diagram)
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(beamStartX, sfdZeroY);
        ctx.lineTo(beamEndX, sfdZeroY);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Shear Force (SFD)', 10, sfdZeroY + 3);

        const sfdScale = 0.55;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(beamStartX, sfdZeroY);
        ctx.lineTo(beamStartX, sfdZeroY - ra * sfdScale);
        ctx.lineTo(loadPxX, sfdZeroY - ra * sfdScale);
        ctx.lineTo(loadPxX, sfdZeroY + rb * sfdScale);
        ctx.lineTo(beamEndX, sfdZeroY + rb * sfdScale);
        ctx.lineTo(beamEndX, sfdZeroY);
        ctx.closePath();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
        ctx.fill();
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.restore();

        // BMD (Bending Moment Diagram)
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(beamStartX, bmdZeroY);
        ctx.lineTo(beamEndX, bmdZeroY);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillText('Bending Moment (BMD)', 10, bmdZeroY + 3);

        const bmdScale = 0.5;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(beamStartX, bmdZeroY);
        ctx.lineTo(loadPxX, bmdZeroY - maxM * bmdScale);
        ctx.lineTo(beamEndX, bmdZeroY);
        ctx.closePath();

        ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`M_max = ${maxM.toFixed(1)} kN·m`, loadPxX, bmdZeroY - maxM * bmdScale - 5);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    spanLengthM,
    loadPosM,
    pointLoadKn,
    showGrid,
    showProbe,
    showSfdBmd,
    dialGaugeM,
    isDraggingLoad,
    computeDeflectionMm,
    onStateChange,
  ]);

  // Pointer interactions
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const beamStartX = 70;
    const beamEndX = width - 70;
    const beamPixelSpan = beamEndX - beamStartX;
    const pixelsPerMeter = beamPixelSpan / spanLengthM;

    // Check Load Grip handle
    const loadPxX = beamStartX + loadPosM * pixelsPerMeter;
    const deflAtLoad = computeDeflectionMm(loadPosM, loadPosM, pointLoadKn);
    const loadTipY = 90 + deflAtLoad * 6.0 - 6;
    const loadArrowLen = Math.min(65, 30 + pointLoadKn * 1.2);
    const handleY = loadTipY - loadArrowLen;

    if (Math.hypot(px - loadPxX, py - handleY) <= 22) {
      setIsDraggingLoad(true);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // Check Dial Gauge handle
    if (showProbe) {
      const dialPxX = beamStartX + dialGaugeM * pixelsPerMeter;
      if (Math.abs(px - dialPxX) <= 20 && py >= 80 && py <= 160) {
        setIsDraggingDial(true);
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const beamStartX = 70;
    const beamEndX = width - 70;
    const beamPixelSpan = beamEndX - beamStartX;

    if (isDraggingLoad) {
      const frac = Math.max(0.05, Math.min(0.95, (px - beamStartX) / beamPixelSpan));
      setLoadPosM(parseFloat((frac * spanLengthM).toFixed(2)));
      return;
    }

    if (isDraggingDial) {
      const frac = Math.max(0.02, Math.min(0.98, (px - beamStartX) / beamPixelSpan));
      setDialGaugeM(parseFloat((frac * spanLengthM).toFixed(2)));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingLoad(false);
    setIsDraggingDial(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

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
      {/* Workbench Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
          <span className="font-mono font-bold text-zinc-100">Flexural Beam Deflection & Stress Bench</span>
          <span className="text-zinc-500">|</span>
          <span className="font-mono text-zinc-400">Span: {spanLengthM} m</span>
        </div>

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
            <span>Dial Gauge</span>
          </button>

          <button
            onClick={() => setShowSfdBmd(!showSfdBmd)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
              showSfdBmd
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>SFD & BMD</span>
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

      {/* Main Canvas */}
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
          <span className="text-blue-400 font-bold">💡 Tip:</span>
          <span>Click & drag the red load arrow (P) along the beam, or drag the dial indicator!</span>
        </div>
      </div>

      {/* Load Adjust Slider Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border-t border-zinc-800 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">Point Load (P):</span>
          <input
            type="range"
            min="5"
            max="100"
            step="5"
            value={pointLoadKn}
            onChange={(e) => setPointLoadKn(parseFloat(e.target.value))}
            className="w-32 accent-red-500 h-1.5 bg-zinc-700 rounded cursor-pointer"
          />
          <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-red-400 font-bold">
            {pointLoadKn} kN
          </span>
        </div>

        <button
          onClick={() => {
            setLoadPosM(spanLengthM * 0.5);
            setPointLoadKn(25);
            setDialGaugeM(spanLengthM * 0.5);
          }}
          className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Load</span>
        </button>
      </div>
    </div>
  );
}
