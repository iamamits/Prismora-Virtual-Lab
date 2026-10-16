'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Gauge,
  Sliders,
  Ruler,
  Crosshair,
  Grid,
  Activity,
  Zap,
} from 'lucide-react';

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

  // Physics state (world units: x in meters, v in m/s)
  const stateRef = useRef<{
    t: number;
    x: number; // displacement from equilibrium (meters)
    v: number; // velocity (m/s)
    isDragging: boolean;
    dragStartX: number;
    dragStartDisp: number;
    phaseHistory: Array<{ x: number; v: number }>;
    timeHistory: Array<{ t: number; x: number; v: number }>;
  }>({
    t: 0,
    x: 0.12, // start with 12 cm initial displacement
    v: 0,
    isDragging: false,
    dragStartX: 0,
    dragStartDisp: 0,
    phaseHistory: [],
    timeHistory: [],
  });

  // Tools toggle state
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [showProbe, setShowProbe] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Interactive tool coordinates (canvas pixels)
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 380, y: 70 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 260,
    y1: 180,
    x2: 380,
    y2: 180,
  });
  const [activeTapeHandle, setActiveTapeHandle] = useState<'none' | 'p1' | 'p2' | 'body'>('none');
  const tapeDragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 });

  // Reset function
  const handleReset = useCallback(() => {
    stateRef.current.t = 0;
    stateRef.current.x = 0.12;
    stateRef.current.v = 0;
    stateRef.current.phaseHistory = [];
    stateRef.current.timeHistory = [];
    setSimTime(0);
  }, []);

  // Step function
  const handleStep = useCallback(() => {
    const dt = 0.02 * playbackSpeed;
    const s = stateRef.current;
    if (s.isDragging) return;

    // Numerical integration (Runge-Kutta 4th order for harmonic oscillator)
    const computeDerivs = (x: number, v: number, t: number) => {
      const fSpring = -stiffness * x;
      const fDamp = -damping * v;
      const fDrive = drivingForce * Math.cos(drivingFreq * t);
      const a = (fSpring + fDamp + fDrive) / mass;
      return { dx: v, dv: a };
    };

    const k1 = computeDerivs(s.x, s.v, s.t);
    const k2 = computeDerivs(s.x + 0.5 * dt * k1.dx, s.v + 0.5 * dt * k1.dv, s.t + 0.5 * dt);
    const k3 = computeDerivs(s.x + 0.5 * dt * k2.dx, s.v + 0.5 * dt * k2.dv, s.t + 0.5 * dt);
    const k4 = computeDerivs(s.x + dt * k3.dx, s.v + dt * k3.dv, s.t + dt);

    s.x += (dt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx);
    s.v += (dt / 6) * (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv);
    s.t += dt;

    setSimTime(s.t);
  }, [stiffness, damping, drivingForce, drivingFreq, mass, playbackSpeed]);

  // Main Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTimestamp = performance.now();

    const render = (now: number) => {
      const wallDelta = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

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

      const s = stateRef.current;

      // Integrate if playing and not user-dragging mass
      if (isPlaying && !s.isDragging) {
        const dt = wallDelta * playbackSpeed;
        const subSteps = 4;
        const subDt = dt / subSteps;

        for (let i = 0; i < subSteps; i++) {
          const computeDerivs = (x: number, v: number, t: number) => {
            const fSpring = -stiffness * x;
            const fDamp = -damping * v;
            const fDrive = drivingForce * Math.cos(drivingFreq * t);
            const a = (fSpring + fDamp + fDrive) / mass;
            return { dx: v, dv: a };
          };

          const k1 = computeDerivs(s.x, s.v, s.t);
          const k2 = computeDerivs(s.x + 0.5 * subDt * k1.dx, s.v + 0.5 * subDt * k1.dv, s.t + 0.5 * subDt);
          const k3 = computeDerivs(s.x + 0.5 * subDt * k2.dx, s.v + 0.5 * subDt * k2.dv, s.t + 0.5 * subDt);
          const k4 = computeDerivs(s.x + subDt * k3.dx, s.v + subDt * k3.dv, s.t + subDt);

          s.x += (subDt / 6) * (k1.dx + 2 * k2.dx + 2 * k3.dx + k4.dx);
          s.v += (subDt / 6) * (k1.dv + 2 * k2.dv + 2 * k3.dv + k4.dv);
          s.t += subDt;
        }

        // Clamp extreme numerical explosions
        s.x = Math.max(-0.4, Math.min(0.4, s.x));

        // Record history for phase portrait and streaming waveforms
        s.phaseHistory.push({ x: s.x, v: s.v });
        if (s.phaseHistory.length > 250) s.phaseHistory.shift();

        s.timeHistory.push({ t: s.t, x: s.x, v: s.v });
        if (s.timeHistory.length > 300) s.timeHistory.shift();

        setSimTime(s.t);

        // Notify probe
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
      // DRAW CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);

      // Deep scientific dark background
      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, width, height);

      // Background Grid
      if (showGrid) {
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        const gridStep = 30;
        for (let x = 0; x < width; x += gridStep) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += gridStep) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // Coordinate anchors
      const anchorWallX = 70;
      const eqCenterMassX = width * 0.48; // equilibrium x of mass center
      const massCenterY = height * 0.44;
      const pixelsPerMeter = 320; // 1 meter = 320 px (0.1m = 32px)

      const currentMassCenterX = eqCenterMassX + s.x * pixelsPerMeter;
      const massWidth = 84;
      const massHeight = 64;
      const massLeftX = currentMassCenterX - massWidth / 2;
      const massTopY = massCenterY - massHeight / 2;

      // 1. Draw Fixed Rigid Anchor Wall (Left)
      const wallGrad = ctx.createLinearGradient(anchorWallX - 30, 0, anchorWallX, 0);
      wallGrad.addColorStop(0, '#1E293B');
      wallGrad.addColorStop(1, '#334155');
      ctx.fillStyle = wallGrad;
      ctx.fillRect(anchorWallX - 25, 40, 25, height - 80);

      // Wall hatch stripes
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      for (let y = 45; y < height - 80; y += 14) {
        ctx.beginPath();
        ctx.moveTo(anchorWallX - 25, y + 10);
        ctx.lineTo(anchorWallX, y);
        ctx.stroke();
      }

      // Wall face plate
      ctx.fillStyle = '#64748B';
      ctx.fillRect(anchorWallX - 4, 40, 4, height - 80);

      // 2. Draw Precision Guide Rail (Floor)
      const railY = massTopY + massHeight + 12;
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(anchorWallX, railY, width - anchorWallX - 20, 8);
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(anchorWallX, railY, width - anchorWallX - 20, 2);

      // Equilibrium dashed reference line
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(eqCenterMassX, 35);
      ctx.lineTo(eqCenterMassX, railY + 25);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#38BDF8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText('Equilibrium (x = 0)', eqCenterMassX - 52, 30);

      // 3. Draw Spring Coils (Upper Mount)
      const springMountY = massCenterY - 14;
      const springLength = massLeftX - anchorWallX;
      const numCoils = 14;
      const coilAmp = 14;

      ctx.save();
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(anchorWallX, springMountY);
      ctx.lineTo(anchorWallX + 15, springMountY);

      const coilSegmentLen = (springLength - 30) / numCoils;
      for (let i = 0; i < numCoils; i++) {
        const cx = anchorWallX + 15 + i * coilSegmentLen;
        ctx.lineTo(cx + coilSegmentLen * 0.25, springMountY - coilAmp);
        ctx.lineTo(cx + coilSegmentLen * 0.75, springMountY + coilAmp);
        ctx.lineTo(cx + coilSegmentLen, springMountY);
      }
      ctx.lineTo(massLeftX, springMountY);
      ctx.stroke();

      // Spring glow effect
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.restore();

      // 4. Draw Viscous Damper Dashpot (Lower Mount)
      const damperY = massCenterY + 16;
      const cylinderLen = 65;
      const cylinderRadius = 11;
      const cylinderStartX = anchorWallX + 20;

      // Damper connecting rod from wall
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(anchorWallX, damperY);
      ctx.lineTo(cylinderStartX, damperY);
      ctx.stroke();

      // Damper Cylinder Housing
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2;
      ctx.fillRect(cylinderStartX, damperY - cylinderRadius, cylinderLen, cylinderRadius * 2);
      ctx.strokeRect(cylinderStartX, damperY - cylinderRadius, cylinderLen, cylinderRadius * 2);

      // Fluid inside cylinder
      ctx.fillStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.fillRect(cylinderStartX + 2, damperY - cylinderRadius + 2, cylinderLen - 4, cylinderRadius * 2 - 4);

      // Damper Piston Rod & Head connected to Mass
      const pistonHeadX = Math.max(cylinderStartX + 8, Math.min(cylinderStartX + cylinderLen - 8, massLeftX - 35));
      ctx.fillStyle = '#38BDF8';
      ctx.fillRect(pistonHeadX - 4, damperY - cylinderRadius + 3, 6, cylinderRadius * 2 - 6);

      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(pistonHeadX, damperY);
      ctx.lineTo(massLeftX, damperY);
      ctx.stroke();

      // 5. Draw Mass Roller Bearings
      const rollerR = 6;
      const roller1X = massLeftX + 18;
      const roller2X = massLeftX + massWidth - 18;
      const rollerY = massTopY + massHeight + rollerR;

      [roller1X, roller2X].forEach((rx) => {
        ctx.fillStyle = '#64748B';
        ctx.beginPath();
        ctx.arc(rx, rollerY, rollerR, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94A3B8';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        // Inner bearing axle
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(rx, rollerY, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // 6. Draw Mass Block (Interactive Draggable)
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
      ctx.shadowBlur = 12;

      // Rounded rectangle for mass
      ctx.beginPath();
      ctx.roundRect(massLeftX, massTopY, massWidth, massHeight, 10);
      ctx.fill();
      ctx.restore();

      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(massLeftX, massTopY, massWidth, massHeight, 10);
      ctx.stroke();

      // Drag Handle grip lines on mass
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(currentMassCenterX + i * 8, massTopY + 14);
        ctx.lineTo(currentMassCenterX + i * 8, massTopY + massHeight - 14);
        ctx.stroke();
      }

      // Mass label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${mass.toFixed(1)} kg`, currentMassCenterX, massTopY + massHeight / 2 + 4);

      // Displacement annotation above mass
      ctx.fillStyle = s.x >= 0 ? '#38BDF8' : '#F43F5E';
      ctx.font = '11px JetBrains Mono, monospace';
      ctx.fillText(`x = ${(s.x * 100).toFixed(1)} cm`, currentMassCenterX, massTopY - 10);

      // 7. Dynamic Force Vectors
      if (showVectors) {
        // Velocity Vector (Green)
        const velLen = s.v * 70;
        if (Math.abs(velLen) > 3) {
          ctx.strokeStyle = '#10B981';
          ctx.fillStyle = '#10B981';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(currentMassCenterX, massCenterY);
          ctx.lineTo(currentMassCenterX + velLen, massCenterY);
          ctx.stroke();

          // Arrowhead
          const headAngle = velLen > 0 ? 0 : Math.PI;
          ctx.beginPath();
          ctx.arc(currentMassCenterX + velLen, massCenterY, 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.font = '9px JetBrains Mono, monospace';
          ctx.fillText(`v = ${s.v.toFixed(2)} m/s`, currentMassCenterX + velLen, massCenterY - 8);
        }

        // Restoring Spring Force Vector (Amber)
        const fSpring = -stiffness * s.x;
        const springVecLen = (fSpring / (stiffness * 0.15)) * 50;
        if (Math.abs(springVecLen) > 3) {
          ctx.strokeStyle = '#F59E0B';
          ctx.fillStyle = '#F59E0B';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(currentMassCenterX, massTopY + 8);
          ctx.lineTo(currentMassCenterX + springVecLen, massTopY + 8);
          ctx.stroke();
          ctx.beginPath();
          ctx.arc(currentMassCenterX + springVecLen, massTopY + 8, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 8. Inset Live Phase Portrait (x vs v)
      const phaseBoxW = 120;
      const phaseBoxH = 80;
      const phaseBoxX = width - phaseBoxW - 16;
      const phaseBoxY = 16;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(phaseBoxX, phaseBoxY, phaseBoxW, phaseBoxH, 6);
      ctx.fill();
      ctx.stroke();

      // Axis crosshairs in phase box
      const phaseCenterX = phaseBoxX + phaseBoxW / 2;
      const phaseCenterY = phaseBoxY + phaseBoxH / 2;
      ctx.strokeStyle = '#1E293B';
      ctx.beginPath();
      ctx.moveTo(phaseBoxX, phaseCenterY);
      ctx.lineTo(phaseBoxX + phaseBoxW, phaseCenterY);
      ctx.moveTo(phaseCenterX, phaseBoxY);
      ctx.lineTo(phaseCenterX, phaseBoxY + phaseBoxH);
      ctx.stroke();

      ctx.fillStyle = '#64748B';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('Phase Orbit (x-v)', phaseBoxX + 6, phaseBoxY + 12);

      // Plot phase history curve
      if (s.phaseHistory.length > 1) {
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        s.phaseHistory.forEach((pt, idx) => {
          const px = phaseCenterX + pt.x * 220;
          const py = phaseCenterY - pt.v * 35;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Current phase state dot
        const currPx = phaseCenterX + s.x * 220;
        const currPy = phaseCenterY - s.v * 35;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(currPx, currPy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 9. Calibrated Sensor Probe Tool
      if (showProbe) {
        const prX = probePos.x;
        const prY = probePos.y;

        // Draw crosshair ring
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

        // Small center dot
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(prX, prY, 3, 0, Math.PI * 2);
        ctx.fill();

        // Probe readout glass panel
        const ke = 0.5 * mass * s.v * s.v;
        const pe = 0.5 * stiffness * s.x * s.x;
        const cardW = 140;
        const cardH = 58;
        const cardX = prX + 20;
        const cardY = prY - 29;

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
        ctx.fillText('DIAGNOSTIC PROBE', cardX + 8, cardY + 14);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`x: ${(s.x * 100).toFixed(1)} cm`, cardX + 8, cardY + 28);
        ctx.fillText(`v: ${s.v.toFixed(2)} m/s`, cardX + 72, cardY + 28);
        ctx.fillText(`KE: ${ke.toFixed(2)} J`, cardX + 8, cardY + 42);
        ctx.fillText(`PE: ${pe.toFixed(2)} J`, cardX + 72, cardY + 42);
        ctx.fillText(`Total E: ${(ke + pe).toFixed(2)} J`, cardX + 8, cardY + 54);
      }

      // 10. Measurement Tape Tool
      if (showRuler) {
        const { x1, y1, x2, y2 } = rulerTape;
        const dx = x2 - x1;
        const dy = y2 - y1;
        const tapeDistPx = Math.sqrt(dx * dx + dy * dy);
        const tapeDistM = tapeDistPx / pixelsPerMeter;

        ctx.save();
        ctx.strokeStyle = '#FACC15';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // Metric ticks along tape
        const numTicks = Math.floor(tapeDistPx / 15);
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 1.5;
        for (let i = 1; i < numTicks; i++) {
          const frac = i / numTicks;
          const tx = x1 + dx * frac;
          const ty = y1 + dy * frac;
          const perpX = -dy / tapeDistPx;
          const perpY = dx / tapeDistPx;
          ctx.beginPath();
          ctx.moveTo(tx - perpX * 3, ty - perpY * 3);
          ctx.lineTo(tx + perpX * 3, ty + perpY * 3);
          ctx.stroke();
        }

        // Tape Endpoints
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

        // Measurement badge
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.roundRect(midX - 35, midY - 20, 70, 16, 4);
        ctx.fill();

        ctx.fillStyle = '#FACC15';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${(tapeDistM * 100).toFixed(1)} cm`, midX, midY - 9);
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
    stiffness,
    damping,
    drivingForce,
    drivingFreq,
    mass,
    showGrid,
    showVectors,
    showProbe,
    showRuler,
    probePos,
    isDraggingProbe,
    rulerTape,
    onProbeSample,
  ]);

  // Pointer interactions for dragging mass, probe, and ruler
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    // Check Probe hit (within 20px)
    if (showProbe) {
      const dProbe = Math.hypot(px - probePos.x, py - probePos.y);
      if (dProbe <= 25) {
        setIsDraggingProbe(true);
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    // Check Tape Handles
    if (showRuler) {
      const d1 = Math.hypot(px - rulerTape.x1, py - rulerTape.y1);
      const d2 = Math.hypot(px - rulerTape.x2, py - rulerTape.y2);
      if (d1 <= 15) {
        setActiveTapeHandle('p1');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      if (d2 <= 15) {
        setActiveTapeHandle('p2');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    // Check Mass Hit
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const eqCenterMassX = width * 0.48;
    const pixelsPerMeter = 320;
    const massCenterX = eqCenterMassX + stateRef.current.x * pixelsPerMeter;
    const massCenterY = height * 0.44;

    if (Math.abs(px - massCenterX) <= 45 && Math.abs(py - massCenterY) <= 35) {
      stateRef.current.isDragging = true;
      stateRef.current.dragStartX = px;
      stateRef.current.dragStartDisp = stateRef.current.x;
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

    if (stateRef.current.isDragging) {
      const pixelsPerMeter = 320;
      const deltaPx = px - stateRef.current.dragStartX;
      const newX = stateRef.current.dragStartDisp + deltaPx / pixelsPerMeter;
      stateRef.current.x = Math.max(-0.35, Math.min(0.35, newX));
      stateRef.current.v = 0; // zero velocity while held
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (stateRef.current.isDragging) {
      stateRef.current.isDragging = false;
    }
    if (isDraggingProbe) {
      setIsDraggingProbe(false);
    }
    if (activeTapeHandle !== 'none') {
      setActiveTapeHandle('none');
    }
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  // Adjust canvas pixel buffer to element size
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
      {/* Simulation Workbench Header Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-mono font-bold text-zinc-100">Harmonic Oscillator Workbench</span>
          <span className="text-zinc-500">|</span>
          <span className="font-mono text-zinc-400">Interactive Canvas Simulation</span>
        </div>

        {/* Toolbar Toggles */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowProbe(!showProbe)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
              showProbe
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
            }`}
            title="Toggle Sensor Probe"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>Probe</span>
          </button>

          <button
            onClick={() => setShowRuler(!showRuler)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
              showRuler
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
            }`}
            title="Toggle Measuring Tape"
          >
            <Ruler className="w-3.5 h-3.5" />
            <span>Ruler</span>
          </button>

          <button
            onClick={() => setShowVectors(!showVectors)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
              showVectors
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
            }`}
            title="Toggle Force & Velocity Vectors"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Vectors</span>
          </button>

          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-1 rounded-md text-zinc-400 hover:bg-zinc-800 transition-all ${
              showGrid ? 'text-zinc-200' : 'text-zinc-600'
            }`}
            title="Toggle Coordinate Grid"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Interactive Canvas Area */}
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

        {/* Drag Hint Overlay */}
        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] font-mono text-zinc-400/80 bg-zinc-900/70 backdrop-blur-xs px-2.5 py-1 rounded border border-zinc-800/80 flex items-center gap-2">
          <span className="text-amber-400 font-bold">💡 Tip:</span>
          <span>Click & drag the blue mass block to release it with initial displacement!</span>
        </div>
      </div>

      {/* Transport Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border-t border-zinc-800">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Play'}</span>
          </button>

          <button
            onClick={handleStep}
            disabled={isPlaying}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 disabled:opacity-40 font-mono text-xs transition-all"
            title="Single Step Forward"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition-all"
            title="Reset Simulation"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Time display */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-zinc-400">Simulation Time:</span>
          <span className="px-2 py-0.5 rounded bg-zinc-950 border border-zinc-800 text-sky-400 font-bold tabular-nums">
            {simTime.toFixed(2)} s
          </span>
        </div>

        {/* Playback Speed Multipliers */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="text-zinc-500 mr-1 text-[11px]">Speed:</span>
          {[0.25, 0.5, 1.0, 2.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                playbackSpeed === spd
                  ? 'bg-sky-500 text-white'
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
