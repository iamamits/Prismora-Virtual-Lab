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

  // Playback & Interaction
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);

  // Camera
  const [userZoom, setUserZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Load state
  const [pointLoadKn, setPointLoadKn] = useState<number>(initialPointLoadKn);
  const [loadPosM, setLoadPosM] = useState<number>(initialLoadPositionM ?? spanLengthM * 0.5);
  const [isDraggingLoad, setIsDraggingLoad] = useState<boolean>(false);

  // Tools
  const [showProbe, setShowProbe] = useState<boolean>(true);
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [showStopwatch, setShowStopwatch] = useState<boolean>(false);
  const [showSfdBmd, setShowSfdBmd] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Dial Gauge
  const [dialGaugeM, setDialGaugeM] = useState<number>(spanLengthM * 0.5);
  const [isDraggingDial, setIsDraggingDial] = useState<boolean>(false);

  // Deflection function
  const computeDeflectionMm = useCallback(
    (xM: number, aM: number, pKn: number) => {
      const L = spanLengthM;
      const bM = L - aM;
      const E = elasticModulusGpa * 1e9;
      const I = momentOfInertiaCm4 * 1e-8;
      const P = pKn * 1e3;

      const EI = E * I;
      if (EI <= 0) return 0;

      let vM = 0;
      if (xM <= aM) {
        vM = (P * bM * xM / (6 * EI * L)) * (L * L - bM * bM - xM * xM);
      } else {
        const xDist = L - xM;
        vM = (P * aM * xDist / (6 * EI * L)) * (L * L - aM * aM - xDist * xDist);
      }
      return vM * 1e3;
    },
    [spanLengthM, elasticModulusGpa, momentOfInertiaCm4],
  );

  // Render Loop
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

      // Virtual Coordinate Anchors (900 x 520)
      const beamStartX = 110;
      const beamEndX = 790;
      const beamPixelSpan = beamEndX - beamStartX;
      const pixelsPerMeter = beamPixelSpan / spanLengthM;
      const undeflectedY = 120;

      const a = loadPosM;
      const b = spanLengthM - a;
      const ra = (pointLoadKn * b) / spanLengthM;
      const rb = (pointLoadKn * a) / spanLengthM;
      const maxM = (pointLoadKn * a * b) / spanLengthM;
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
      // DRAW CANVAS (Virtual Viewport)
      // -------------------------------------------------------------
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
      applyVirtualViewport(ctx, vp, dpr);

      // Background
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

      const visualDeflScale = 6.0;

      // 1. Supports
      // Left Pin
      ctx.fillStyle = '#64748B';
      ctx.beginPath();
      ctx.moveTo(beamStartX, undeflectedY);
      ctx.lineTo(beamStartX - 16, undeflectedY + 28);
      ctx.lineTo(beamStartX + 16, undeflectedY + 28);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#334155';
      ctx.fillRect(beamStartX - 22, undeflectedY + 28, 44, 5);

      // Right Roller
      ctx.beginPath();
      ctx.moveTo(beamEndX, undeflectedY);
      ctx.lineTo(beamEndX - 16, undeflectedY + 20);
      ctx.lineTo(beamEndX + 16, undeflectedY + 20);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      [-8, 8].forEach((dx) => {
        ctx.fillStyle = '#94A3B8';
        ctx.beginPath();
        ctx.arc(beamEndX + dx, undeflectedY + 25, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.fillStyle = '#334155';
      ctx.fillRect(beamEndX - 22, undeflectedY + 29, 44, 5);

      // Reaction Vectors
      ctx.strokeStyle = '#10B981';
      ctx.fillStyle = '#10B981';
      ctx.lineWidth = 3;

      ctx.beginPath();
      ctx.moveTo(beamStartX, undeflectedY + 65);
      ctx.lineTo(beamStartX, undeflectedY + 38);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(beamStartX - 5, undeflectedY + 44);
      ctx.lineTo(beamStartX, undeflectedY + 36);
      ctx.lineTo(beamStartX + 5, undeflectedY + 44);
      ctx.fill();
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`R_A = ${ra.toFixed(1)} kN`, beamStartX, undeflectedY + 80);

      ctx.beginPath();
      ctx.moveTo(beamEndX, undeflectedY + 65);
      ctx.lineTo(beamEndX, undeflectedY + 40);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(beamEndX - 5, undeflectedY + 46);
      ctx.lineTo(beamEndX, undeflectedY + 38);
      ctx.lineTo(beamEndX + 5, undeflectedY + 46);
      ctx.fill();
      ctx.fillText(`R_B = ${rb.toFixed(1)} kN`, beamEndX, undeflectedY + 80);

      // 2. Elastic Deflected Beam
      ctx.save();
      const beamThick = 14;
      const numPts = 90;

      ctx.beginPath();
      for (let i = 0; i <= numPts; i++) {
        const xF = i / numPts;
        const curX = beamStartX + xF * beamPixelSpan;
        const curM = xF * spanLengthM;
        const defl = computeDeflectionMm(curM, a, pointLoadKn);
        const curY = undeflectedY + defl * visualDeflScale - beamThick / 2;
        if (i === 0) ctx.moveTo(curX, curY);
        else ctx.lineTo(curX, curY);
      }
      for (let i = numPts; i >= 0; i--) {
        const xF = i / numPts;
        const curX = beamStartX + xF * beamPixelSpan;
        const curM = xF * spanLengthM;
        const defl = computeDeflectionMm(curM, a, pointLoadKn);
        const curY = undeflectedY + defl * visualDeflScale + beamThick / 2;
        ctx.lineTo(curX, curY);
      }
      ctx.closePath();

      const beamGrad = ctx.createLinearGradient(0, undeflectedY - 15, 0, undeflectedY + 35);
      beamGrad.addColorStop(0, '#38BDF8');
      beamGrad.addColorStop(0.5, '#0284C7');
      beamGrad.addColorStop(1, '#0369A1');
      ctx.fillStyle = beamGrad;
      ctx.fill();
      ctx.strokeStyle = '#E0F2FE';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // 3. Draggable Load Arrow
      const loadPxX = beamStartX + loadPosM * pixelsPerMeter;
      const deflAtLoad = computeDeflectionMm(loadPosM, a, pointLoadKn);
      const loadTipY = undeflectedY + deflAtLoad * visualDeflScale - beamThick / 2;
      const loadArrowLen = Math.min(75, 35 + pointLoadKn * 1.2);

      ctx.save();
      ctx.strokeStyle = isDraggingLoad ? '#F59E0B' : '#EF4444';
      ctx.fillStyle = isDraggingLoad ? '#F59E0B' : '#EF4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(loadPxX, loadTipY - loadArrowLen);
      ctx.lineTo(loadPxX, loadTipY);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(loadPxX - 8, loadTipY - 12);
      ctx.lineTo(loadPxX, loadTipY);
      ctx.lineTo(loadPxX + 8, loadTipY - 12);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.arc(loadPxX, loadTipY - loadArrowLen, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`P = ${pointLoadKn} kN`, loadPxX, loadTipY - loadArrowLen - 14);
      ctx.fillStyle = '#F59E0B';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`x = ${loadPosM.toFixed(2)} m`, loadPxX, loadTipY - loadArrowLen - 2);
      ctx.restore();

      // 4. Dial Gauge (Deflectometer)
      if (showProbe) {
        const dialPxX = beamStartX + dialGaugeM * pixelsPerMeter;
        const deflAtDial = computeDeflectionMm(dialGaugeM, a, pointLoadKn);
        const dialTipY = undeflectedY + deflAtDial * visualDeflScale + beamThick / 2;

        ctx.save();
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(dialPxX, dialTipY);
        ctx.lineTo(dialPxX, dialTipY + 22);
        ctx.stroke();

        const dialCenterY = dialTipY + 38;
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(dialPxX, dialCenterY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        const needleAng = deflAtDial * 0.45;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(dialPxX, dialCenterY);
        ctx.lineTo(dialPxX + Math.sin(needleAng) * 11, dialCenterY - Math.cos(needleAng) * 11);
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`δ = ${deflAtDial.toFixed(2)} mm`, dialPxX, dialCenterY + 28);
        ctx.fillText(`@ x = ${dialGaugeM.toFixed(2)}m`, dialPxX, dialCenterY + 40);
        ctx.restore();
      }

      // 5. Live SFD & BMD
      if (showSfdBmd) {
        const sfdZeroY = 320;
        const bmdZeroY = 445;

        // SFD
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(beamStartX, sfdZeroY);
        ctx.lineTo(beamEndX, sfdZeroY);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('Shear Force V(x)', 15, sfdZeroY + 4);

        const sfdScale = 0.6;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(beamStartX, sfdZeroY);
        ctx.lineTo(beamStartX, sfdZeroY - ra * sfdScale);
        ctx.lineTo(loadPxX, sfdZeroY - ra * sfdScale);
        ctx.lineTo(loadPxX, sfdZeroY + rb * sfdScale);
        ctx.lineTo(beamEndX, sfdZeroY + rb * sfdScale);
        ctx.lineTo(beamEndX, sfdZeroY);
        ctx.closePath();

        ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.fill();
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();

        // BMD
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(beamStartX, bmdZeroY);
        ctx.lineTo(beamEndX, bmdZeroY);
        ctx.stroke();

        ctx.fillStyle = '#94A3B8';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText('Bending Moment M(x)', 15, bmdZeroY + 4);

        const bmdScale = 0.55;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(beamStartX, bmdZeroY);
        ctx.lineTo(loadPxX, bmdZeroY - maxM * bmdScale);
        ctx.lineTo(beamEndX, bmdZeroY);
        ctx.closePath();

        ctx.fillStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.fill();
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`M_max = ${maxM.toFixed(1)} kN·m`, loadPxX, bmdZeroY - maxM * bmdScale - 6);
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

  // Pointer interaction
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

    const beamStartX = 110;
    const beamEndX = 790;
    const beamPixelSpan = beamEndX - beamStartX;
    const pixelsPerMeter = beamPixelSpan / spanLengthM;

    const loadPxX = beamStartX + loadPosM * pixelsPerMeter;
    const deflAtLoad = computeDeflectionMm(loadPosM, loadPosM, pointLoadKn);
    const loadTipY = 120 + deflAtLoad * 6.0 - 7;
    const loadArrowLen = Math.min(75, 35 + pointLoadKn * 1.2);
    const handleY = loadTipY - loadArrowLen;

    if (Math.hypot(x - loadPxX, y - handleY) <= 25) {
      setIsDraggingLoad(true);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    if (showProbe) {
      const dialPxX = beamStartX + dialGaugeM * pixelsPerMeter;
      if (Math.abs(x - dialPxX) <= 25 && y >= 100 && y <= 210) {
        setIsDraggingDial(true);
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const { x } = getVirtualPointer(e);

    const beamStartX = 110;
    const beamEndX = 790;
    const beamPixelSpan = beamEndX - beamStartX;

    if (isDraggingLoad) {
      const frac = Math.max(0.05, Math.min(0.95, (x - beamStartX) / beamPixelSpan));
      setLoadPosM(parseFloat((frac * spanLengthM).toFixed(2)));
      return;
    }

    if (isDraggingDial) {
      const frac = Math.max(0.02, Math.min(0.98, (x - beamStartX) / beamPixelSpan));
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
      title="Flexural Beam Deflection & Stress Bench"
      subtitle={`Span: ${spanLengthM} m`}
      disciplineColor="#2563EB"
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onReset={() => {
        setLoadPosM(spanLengthM * 0.5);
        setDialGaugeM(spanLengthM * 0.5);
        setPointLoadKn(25);
        setSimTime(0);
      }}
      simTime={simTime}
      playbackSpeed={playbackSpeed}
      onSpeedChange={setPlaybackSpeed}
      showProbe={showProbe}
      onToggleProbe={() => setShowProbe(!showProbe)}
      showStopwatch={showStopwatch}
      onToggleStopwatch={() => setShowStopwatch(!showStopwatch)}
      showVectors={showSfdBmd}
      onToggleVectors={() => setShowSfdBmd(!showSfdBmd)}
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
          <span className="text-blue-400 font-bold">💡 PhET Tip:</span>
          <span>Click & drag the red point load arrow (P) along the span, or slide the dial indicator probe!</span>
        </div>
      </div>
    </PhetWorkbench>
  );
}
