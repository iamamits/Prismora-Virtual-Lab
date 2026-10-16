'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PhetWorkbench } from './phet-workbench';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  computeViewport,
  applyVirtualViewport,
  screenToVirtualCoords,
  type ViewportTransform,
} from './viewport-helper';

export interface RealtimeOscillatorSceneProps {
  mass: number; // kg
  stiffness: number; // N/m
  damping: number; // N*s/m
  drivingForce: number; // N
  drivingFreq: number; // rad/s
  className?: string;
  onProbeSample?: (sample: {
    t: number;
    x: number;
    v: number;
    a: number;
    ke: number;
    pe: number;
    energyTotal: number;
  }) => void;
}

export function RealtimeOscillatorScene({
  mass,
  stiffness,
  damping,
  drivingForce,
  drivingFreq,
  className = '',
  onProbeSample,
}: RealtimeOscillatorSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);

  // Camera Zoom & Pan
  const [userZoom, setUserZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tools
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [showStopwatch, setShowStopwatch] = useState<boolean>(false);
  const [showProbe, setShowProbe] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Physics state (world units: x in meters, v in m/s)
  const stateRef = useRef<{
    t: number;
    x: number; // displacement from equilibrium (meters)
    v: number; // velocity (m/s)
    isDragging: boolean;
    dragStartX: number;
    dragStartDisp: number;
    phaseHistory: Array<{ x: number; v: number }>;
  }>({
    t: 0,
    x: 0.12, // start with 12 cm initial displacement
    v: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartDisp: 0,
    phaseHistory: [],
  });

  // Tools in Virtual Space
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 580, y: 110 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 320,
    y1: 270,
    x2: 480,
    y2: 270,
  });
  const [activeTapeHandle, setActiveTapeHandle] = useState<'none' | 'p1' | 'p2'>('none');

  // Reset
  const handleReset = useCallback(() => {
    stateRef.current.t = 0;
    stateRef.current.x = 0.12;
    stateRef.current.v = 0;
    stateRef.current.phaseHistory = [];
    setSimTime(0);
  }, []);

  // Step (single frame advancement)
  const handleStep = useCallback(() => {
    const dt = 0.02 * playbackSpeed;
    const s = stateRef.current;
    if (s.isDragging) return;

    const fSpring = -stiffness * s.x;
    const fDamp = -damping * s.v;
    const fDrive = drivingForce * Math.cos(drivingFreq * s.t);
    const a = (fSpring + fDamp + fDrive) / mass;

    s.v += a * dt;
    s.x += s.v * dt;
    s.t += dt;
    setSimTime(s.t);
  }, [stiffness, damping, drivingForce, drivingFreq, mass, playbackSpeed]);

  // Main Render Loop
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
      const s = stateRef.current;

      // Numerical Physics Integration (RK4)
      if (isPlaying && !s.isDragging) {
        const subSteps = 4;
        const subDt = dt / subSteps;

        for (let i = 0; i < subSteps; i++) {
          const computeA = (x: number, v: number, t: number) =>
            (-stiffness * x - damping * v + drivingForce * Math.cos(drivingFreq * t)) / mass;

          const k1v = computeA(s.x, s.v, s.t);
          const k1x = s.v;

          const k2v = computeA(s.x + 0.5 * subDt * k1x, s.v + 0.5 * subDt * k1v, s.t + 0.5 * subDt);
          const k2x = s.v + 0.5 * subDt * k1v;

          const k3v = computeA(s.x + 0.5 * subDt * k2x, s.v + 0.5 * subDt * k2v, s.t + 0.5 * subDt);
          const k3x = s.v + 0.5 * subDt * k2v;

          const k4v = computeA(s.x + subDt * k3x, s.v + subDt * k3v, s.t + subDt);
          const k4x = s.v + subDt * k3v;

          s.x += (subDt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
          s.v += (subDt / 6) * (k1v + 2 * k2v + 2 * k3v + k4v);
          s.t += subDt;
        }

        s.x = Math.max(-0.35, Math.min(0.35, s.x));
        s.phaseHistory.push({ x: s.x, v: s.v });
        if (s.phaseHistory.length > 200) s.phaseHistory.shift();

        setSimTime(s.t);

        if (onProbeSample) {
          const ke = 0.5 * mass * s.v * s.v;
          const pe = 0.5 * stiffness * s.x * s.x;
          const a = (-stiffness * s.x - damping * s.v + drivingForce * Math.cos(drivingFreq * s.t)) / mass;
          onProbeSample({
            t: s.t,
            x: s.x,
            v: s.v,
            a,
            ke,
            pe,
            energyTotal: ke + pe,
          });
        }
      }

      // -------------------------------------------------------------
      // DRAW CANVAS (Using Universal Viewport)
      // -------------------------------------------------------------
      ctx.save();
      // Clear physical screen
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Compute and apply virtual viewport (900 x 520)
      const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
      applyVirtualViewport(ctx, vp, dpr);

      // 1. Environmental Lab Background
      // Soft scientific gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, VIRTUAL_HEIGHT);
      bgGrad.addColorStop(0, '#0F172A');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Grid overlay
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

      // Workbench Floor & Rail
      const anchorWallX = 110;
      const eqCenterMassX = 460;
      const massCenterY = 220;
      const pixelsPerMeter = 420; // 0.1m = 42px in virtual space

      const currentMassCenterX = eqCenterMassX + s.x * pixelsPerMeter;
      const massWidth = 95;
      const massHeight = 70;
      const massLeftX = currentMassCenterX - massWidth / 2;
      const massTopY = massCenterY - massHeight / 2;

      // 2. Fixed Anchor Wall (Left)
      const wallGrad = ctx.createLinearGradient(anchorWallX - 40, 0, anchorWallX, 0);
      wallGrad.addColorStop(0, '#1E293B');
      wallGrad.addColorStop(1, '#475569');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(anchorWallX - 35, 60, 35, 300);

      // Wall hatch stripes
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2;
      for (let y = 70; y < 350; y += 18) {
        ctx.beginPath();
        ctx.moveTo(anchorWallX - 35, y + 14);
        ctx.lineTo(anchorWallX, y);
        ctx.stroke();
      }
      ctx.fillStyle = '#94A3B8';
      ctx.fillRect(anchorWallX - 4, 60, 4, 300);

      // 3. Precision Optical Guide Rail (Floor)
      const railY = massTopY + massHeight + 14;
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(anchorWallX, railY, VIRTUAL_WIDTH - anchorWallX - 40, 10);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(anchorWallX, railY, VIRTUAL_WIDTH - anchorWallX - 40, 2);

      // Metric ticks on rail
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      for (let rx = anchorWallX; rx < VIRTUAL_WIDTH - 40; rx += 21) {
        ctx.beginPath();
        ctx.moveTo(rx, railY + 2);
        ctx.lineTo(rx, railY + 6);
        ctx.stroke();
      }

      // Equilibrium dashed reference
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(eqCenterMassX, 55);
      ctx.lineTo(eqCenterMassX, railY + 25);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#38BDF8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Equilibrium (x = 0)', eqCenterMassX, 48);

      // 4. Spring Coils (Upper Mount)
      const springMountY = massCenterY - 14;
      const springLength = massLeftX - anchorWallX;
      const numCoils = 14;
      const coilAmp = 15;

      ctx.save();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(anchorWallX, springMountY);
      ctx.lineTo(anchorWallX + 18, springMountY);

      const coilStep = (springLength - 36) / numCoils;
      for (let i = 0; i < numCoils; i++) {
        const cx = anchorWallX + 18 + i * coilStep;
        ctx.lineTo(cx + coilStep * 0.25, springMountY - coilAmp);
        ctx.lineTo(cx + coilStep * 0.75, springMountY + coilAmp);
        ctx.lineTo(cx + coilStep, springMountY);
      }
      ctx.lineTo(massLeftX, springMountY);
      ctx.stroke();

      // Golden glow
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = 7;
      ctx.stroke();
      ctx.restore();

      // 5. Viscous Damper Dashpot (Lower Mount)
      const damperY = massCenterY + 16;
      const cylinderLen = 75;
      const cylinderR = 12;
      const cylStartX = anchorWallX + 24;

      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(anchorWallX, damperY);
      ctx.lineTo(cylStartX, damperY);
      ctx.stroke();

      // Cylinder body
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2;
      ctx.fillRect(cylStartX, damperY - cylinderR, cylinderLen, cylinderR * 2);
      ctx.strokeRect(cylStartX, damperY - cylinderR, cylinderLen, cylinderR * 2);

      // Silicone oil
      ctx.fillStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.fillRect(cylStartX + 2, damperY - cylinderR + 2, cylinderLen - 4, cylinderR * 2 - 4);

      // Piston connected to mass
      const pistonX = Math.max(cylStartX + 10, Math.min(cylStartX + cylinderLen - 10, massLeftX - 35));
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(pistonX - 4, damperY - cylinderR + 3, 6, cylinderR * 2 - 6);

      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(pistonX, damperY);
      ctx.lineTo(massLeftX, damperY);
      ctx.stroke();

      // 6. Mass Roller Bearings
      const rollerR = 7;
      const roller1X = massLeftX + 20;
      const roller2X = massLeftX + massWidth - 20;
      const rollerY = massTopY + massHeight + rollerR;

      [roller1X, roller2X].forEach((rx) => {
        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.arc(rx, rollerY, rollerR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(rx, rollerY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7. Mass Block (Direct Dragging Target)
      ctx.save();
      const massGrad = ctx.createLinearGradient(massLeftX, massTopY, massLeftX + massWidth, massTopY + massHeight);
      if (s.isDragging) {
        massGrad.addColorStop(0, '#F59E0B');
        massGrad.addColorStop(1, '#D97706');
      } else {
        massGrad.addColorStop(0, '#38BDF8');
        massGrad.addColorStop(1, '#0284C7');
      }
      ctx.fillStyle = massGrad;
      ctx.shadowColor = s.isDragging ? 'rgba(245, 158, 11, 0.5)' : 'rgba(2, 132, 199, 0.4)';
      ctx.shadowBlur = 14;

      ctx.beginPath();
      ctx.roundRect(massLeftX, massTopY, massWidth, massHeight, 10);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(massLeftX, massTopY, massWidth, massHeight, 10);
      ctx.stroke();

      // Drag Grip grooves
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(currentMassCenterX + i * 9, massTopY + 16);
        ctx.lineTo(currentMassCenterX + i * 9, massTopY + massHeight - 16);
        ctx.stroke();
      }

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 13px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${mass.toFixed(1)} kg`, currentMassCenterX, massTopY + massHeight / 2 + 5);

      ctx.fillStyle = s.x >= 0 ? '#38BDF8' : '#F43F5E';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(`x = ${(s.x * 100).toFixed(1)} cm`, currentMassCenterX, massTopY - 10);

      // 8. Dynamic Vectors
      if (showVectors) {
        const velLen = s.v * 85;
        if (Math.abs(velLen) > 3) {
          ctx.strokeStyle = '#10B981';
          ctx.fillStyle = '#10B981';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(currentMassCenterX, massCenterY);
          ctx.lineTo(currentMassCenterX + velLen, massCenterY);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(currentMassCenterX + velLen, massCenterY, 4.5, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillText(`v = ${s.v.toFixed(2)} m/s`, currentMassCenterX + velLen, massCenterY - 10);
        }

        const fSpring = -stiffness * s.x;
        const springVecLen = (fSpring / (stiffness * 0.15)) * 60;
        if (Math.abs(springVecLen) > 3) {
          ctx.strokeStyle = '#F59E0B';
          ctx.fillStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(currentMassCenterX, massTopY + 10);
          ctx.lineTo(currentMassCenterX + springVecLen, massTopY + 10);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(currentMassCenterX + springVecLen, massTopY + 10, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 9. Inset Phase Space Portrait (Top Right)
      const phaseBoxW = 140;
      const phaseBoxH = 95;
      const phaseBoxX = VIRTUAL_WIDTH - phaseBoxW - 20;
      const phaseBoxY = 20;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(phaseBoxX, phaseBoxY, phaseBoxW, phaseBoxH, 8);
      ctx.fill();
      ctx.stroke();

      const phaseCenterX = phaseBoxX + phaseBoxW / 2;
      const phaseCenterY = phaseBoxY + phaseBoxH / 2;
      ctx.strokeStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(phaseBoxX, phaseCenterY);
      ctx.lineTo(phaseBoxX + phaseBoxW, phaseCenterY);
      ctx.moveTo(phaseCenterX, phaseBoxY);
      ctx.lineTo(phaseCenterX, phaseBoxY + phaseBoxH);
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Phase Portrait (x - v)', phaseBoxX + 8, phaseBoxY + 14);

      if (s.phaseHistory.length > 1) {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        s.phaseHistory.forEach((pt, idx) => {
          const px = phaseCenterX + pt.x * 240;
          const py = phaseCenterY - pt.v * 38;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        const currPx = phaseCenterX + s.x * 240;
        const currPy = phaseCenterY - s.v * 38;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(currPx, currPy, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // 10. Sensor Diagnostic Probe
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
        ctx.lineTo(prX, prY + 18);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(prX, prY, 3, 0, Math.PI * 2);
        ctx.fill();

        const ke = 0.5 * mass * s.v * s.v;
        const pe = 0.5 * stiffness * s.x * s.x;
        const cardW = 150;
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
        ctx.fillText('DIAGNOSTIC PROBE', cardX + 8, cardY + 15);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`x: ${(s.x * 100).toFixed(1)} cm`, cardX + 8, cardY + 30);
        ctx.fillText(`v: ${s.v.toFixed(2)} m/s`, cardX + 78, cardY + 30);
        ctx.fillText(`KE: ${ke.toFixed(2)} J`, cardX + 8, cardY + 46);
        ctx.fillText(`PE: ${pe.toFixed(2)} J`, cardX + 78, cardY + 46);
        ctx.fillText(`Total E: ${(ke + pe).toFixed(2)} J`, cardX + 8, cardY + 58);
      }

      // 11. Measurement Tape
      if (showRuler) {
        const { x1, y1, x2, y2 } = rulerTape;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const distPx = Math.sqrt(dx * dx + dy * dy);
        const distM = distPx / pixelsPerMeter;

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
        ctx.fillText(`${(distM * 100).toFixed(1)} cm`, midX, midY - 8);
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
    mass,
    stiffness,
    damping,
    drivingForce,
    drivingFreq,
    showGrid,
    showVectors,
    showProbe,
    showRuler,
    probePos,
    isDraggingProbe,
    rulerTape,
    onProbeSample,
  ]);

  // Pointer interactions in Virtual Space
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

    // Check Probe
    if (showProbe && Math.hypot(x - probePos.x, y - probePos.y) <= 25) {
      setIsDraggingProbe(true);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // Check Ruler Tape
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

    // Check Mass Hit
    const eqCenterMassX = 460;
    const pixelsPerMeter = 420;
    const massCenterX = eqCenterMassX + stateRef.current.x * pixelsPerMeter;
    const massCenterY = 220;

    if (Math.abs(x - massCenterX) <= 50 && Math.abs(y - massCenterY) <= 40) {
      stateRef.current.isDragging = true;
      stateRef.current.dragStartX = x;
      stateRef.current.dragStartDisp = stateRef.current.x;
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

    if (stateRef.current.isDragging) {
      const pixelsPerMeter = 420;
      const deltaVirtual = x - stateRef.current.dragStartX;
      const newX = stateRef.current.dragStartDisp + deltaVirtual / pixelsPerMeter;
      stateRef.current.x = Math.max(-0.35, Math.min(0.35, newX));
      stateRef.current.v = 0;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    stateRef.current.isDragging = false;
    setIsDraggingProbe(false);
    setActiveTapeHandle('none');
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Resize canvas to parent container width/height
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
      title="Damped Harmonic Oscillator"
      subtitle="Mass-Spring-Damper 60FPS Physics Engine"
      disciplineColor="#F59E0B"
      isPlaying={isPlaying}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onStep={handleStep}
      onReset={handleReset}
      simTime={simTime}
      playbackSpeed={playbackSpeed}
      onSpeedChange={setPlaybackSpeed}
      showProbe={showProbe}
      onToggleProbe={() => setShowProbe(!showProbe)}
      showRuler={showRuler}
      onToggleRuler={() => setShowRuler(!showRuler)}
      showStopwatch={showStopwatch}
      onToggleStopwatch={() => setShowStopwatch(!showStopwatch)}
      showVectors={showVectors}
      onToggleVectors={() => setShowVectors(!showVectors)}
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
          <span className="text-amber-400 font-bold">💡 PhET Tip:</span>
          <span>Click & drag the blue mass block to pull and release, or grab the sensor probe!</span>
        </div>
      </div>
    </PhetWorkbench>
  );
}
