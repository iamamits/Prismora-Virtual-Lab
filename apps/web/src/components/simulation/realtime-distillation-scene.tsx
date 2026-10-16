'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { PhetWorkbench } from './phet-workbench';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  computeViewport,
  applyVirtualViewport,
  screenToVirtualCoords,
} from './viewport-helper';

export interface RealtimeDistillationSceneProps {
  relativeVolatility: number; // alpha (e.g. 2.5)
  feedMoleFraction: number; // xF (e.g. 0.45)
  distillateMoleFraction: number; // xD (e.g. 0.95)
  bottomsMoleFraction: number; // xB (e.g. 0.05)
  refluxRatio: number; // R (e.g. 2.2)
  feedQuality: number; // q (e.g. 1.0)
  className?: string;
  onStateUpdate?: (data: {
    theoreticalTrays: number;
    feedTray: number;
    minimumReflux: number;
    condenserDutyKw: number;
    reboilerDutyKw: number;
  }) => void;
}

interface VaporBubble {
  x: number;
  y: number;
  r: number;
  vy: number;
  tray: number;
}

interface LiquidDrop {
  x: number;
  y: number;
  r: number;
  vy: number;
  tray: number;
}

export function RealtimeDistillationScene({
  relativeVolatility = 2.5,
  feedMoleFraction = 0.45,
  distillateMoleFraction = 0.95,
  bottomsMoleFraction = 0.05,
  refluxRatio = 2.2,
  feedQuality = 1.0,
  className = '',
  onStateUpdate,
}: RealtimeDistillationSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Playback & Clock
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

  // Tools in Virtual Space (900 x 520)
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 230, y: 220 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 170,
    y1: 100,
    x2: 170,
    y2: 420,
  });
  const [activeTapeHandle, setActiveTapeHandle] = useState<'none' | 'p1' | 'p2'>('none');

  // Particle systems
  const bubblesRef = useRef<VaporBubble[]>([]);
  const dropsRef = useRef<LiquidDrop[]>([]);

  // Mathematical McCabe-Thiele calculation
  const alpha = relativeVolatility;
  const xF = feedMoleFraction;
  const xD = distillateMoleFraction;
  const xB = bottomsMoleFraction;
  const R = refluxRatio;
  const q = feedQuality;

  // Minimum reflux ratio R_min:
  // Feed pinch composition x_pinch:
  // intersection of q-line with VLE curve y = alpha*x / (1 + (alpha-1)*x)
  const Rmin = useMemo(() => {
    // simplified pinch approximation
    const num = xD - (alpha * xF) / (1 + (alpha - 1) * xF);
    const den = (alpha * xF) / (1 + (alpha - 1) * xF) - xF;
    return Math.max(0.5, Math.abs(num / Math.max(0.01, den)));
  }, [alpha, xF, xD]);

  // Stepping stages
  const calculatedStages = useMemo(() => {
    const stages: Array<{ tray: number; x: number; y: number }> = [];
    let currentX = xD;
    let tray = 1;
    const maxStages = 16;

    // VLE inversion: x = y / (alpha - (alpha - 1)*y)
    const vleX = (y: number) => y / (alpha - (alpha - 1) * y);

    while (currentX > xB && tray <= maxStages) {
      const yTray = currentX; // from previous or operating line
      const xEq = Math.max(xB * 0.5, vleX(yTray));
      stages.push({ tray, x: xEq, y: yTray });

      // Operating line to get next y
      if (xEq >= xF) {
        // Rectifying operating line: y = (R/(R+1))*x + xD/(R+1)
        currentX = (R / (R + 1)) * xEq + xD / (R + 1);
      } else {
        // Stripping line
        currentX = Math.max(xB, xEq - 0.08 * (alpha / 2));
      }
      tray++;
    }
    return stages;
  }, [alpha, xD, xB, xF, R]);

  const numTrays = Math.min(12, Math.max(4, calculatedStages.length));
  const feedTrayIdx = Math.max(2, Math.floor(numTrays * 0.45));

  // Reset
  const handleReset = useCallback(() => {
    bubblesRef.current = [];
    dropsRef.current = [];
    setSimTime(0);
  }, []);

  // Step
  const handleStep = useCallback(() => {
    setSimTime((t) => t + 0.016);
  }, []);

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

      // Column Geometry in Virtual Coordinates (900 x 520)
      const colLeft = 90;
      const colWidth = 140;
      const colTop = 75;
      const colHeight = 350;
      const colRight = colLeft + colWidth;
      const colBottom = colTop + colHeight;
      const colCenter = colLeft + colWidth / 2;

      const traySpacing = (colHeight - 60) / (numTrays + 1);

      // Particle update
      if (isPlaying) {
        // Spawn rising vapor bubbles
        if (Math.random() < 0.6) {
          bubblesRef.current.push({
            x: colLeft + 20 + Math.random() * (colWidth - 40),
            y: colBottom - 25,
            r: 2 + Math.random() * 2.5,
            vy: 55 + Math.random() * 35,
            tray: numTrays,
          });
        }

        // Spawn descending liquid droplets
        if (Math.random() < 0.5) {
          dropsRef.current.push({
            x: colLeft + 25 + Math.random() * (colWidth - 50),
            y: colTop + 30,
            r: 1.8 + Math.random() * 1.5,
            vy: 65 + Math.random() * 30,
            tray: 1,
          });
        }

        // Update bubbles
        for (let i = bubblesRef.current.length - 1; i >= 0; i--) {
          const b = bubblesRef.current[i]!;
          b.y -= b.vy * dt;
          b.x += (Math.random() - 0.5) * 12 * dt;
          if (b.y < colTop + 25) {
            bubblesRef.current.splice(i, 1);
          }
        }

        // Update drops
        for (let i = dropsRef.current.length - 1; i >= 0; i--) {
          const d = dropsRef.current[i]!;
          d.y += d.vy * dt;
          d.x += (Math.random() - 0.5) * 10 * dt;
          if (d.y > colBottom - 20) {
            dropsRef.current.splice(i, 1);
          }
        }
      }

      // -------------------------------------------------------------
      // DRAW CANVAS IN VIRTUAL COORDINATES (900 x 520)
      // -------------------------------------------------------------
      const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
      applyVirtualViewport(ctx, vp, dpr);

      // Dark Industrial Background
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Grid
      if (showGrid) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
        ctx.lineWidth = 1;
        for (let x = 0; x <= VIRTUAL_WIDTH; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, VIRTUAL_HEIGHT);
          ctx.stroke();
        }
        for (let y = 0; y <= VIRTUAL_HEIGHT; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(VIRTUAL_WIDTH, y);
          ctx.stroke();
        }
      }

      // =============================================================
      // LEFT PANE: INDUSTRIAL FRACTIONATING COLUMN APPARATUS
      // =============================================================

      // 1. Column Shell (Cylindrical Glass & Steel)
      ctx.save();
      const colGrad = ctx.createLinearGradient(colLeft, 0, colRight, 0);
      colGrad.addColorStop(0, 'rgba(30, 41, 59, 0.7)');
      colGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
      colGrad.addColorStop(1, 'rgba(30, 41, 59, 0.7)');
      ctx.fillStyle = colGrad;
      ctx.fillRect(colLeft, colTop, colWidth, colHeight);

      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.strokeRect(colLeft, colTop, colWidth, colHeight);

      // Top Dome
      ctx.beginPath();
      ctx.ellipse(colCenter, colTop, colWidth / 2, 22, 0, Math.PI, 0);
      ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
      ctx.fill();
      ctx.stroke();

      // Bottom Sump Dome
      ctx.beginPath();
      ctx.ellipse(colCenter, colBottom, colWidth / 2, 22, 0, 0, Math.PI);
      ctx.fillStyle = '#1E293B';
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // 2. Bubble Cap Trays Inside Column
      for (let t = 1; t <= numTrays; t++) {
        const trayY = colTop + 25 + t * traySpacing;
        const isFeed = t === feedTrayIdx;

        ctx.save();
        // Tray floor plate
        ctx.fillStyle = isFeed ? '#EF4444' : '#475569';
        ctx.fillRect(colLeft + 12, trayY, colWidth - 24, 4);

        // Bubble caps on tray
        for (let capX = colLeft + 30; capX <= colRight - 30; capX += 26) {
          ctx.fillStyle = '#94A3B8';
          ctx.beginPath();
          ctx.arc(capX, trayY - 4, 5, Math.PI, 0);
          ctx.fill();
          // riser
          ctx.fillRect(capX - 2, trayY - 4, 4, 4);
        }

        // Downcomer pipe
        const isLeftDowncomer = t % 2 === 0;
        const downX = isLeftDowncomer ? colLeft + 14 : colRight - 22;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.fillRect(downX, trayY + 4, 8, traySpacing - 6);

        // Tray label
        ctx.fillStyle = isFeed ? '#F87171' : '#94A3B8';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = isLeftDowncomer ? 'right' : 'left';
        ctx.fillText(`T${t}`, isLeftDowncomer ? colLeft + 8 : colRight + 6, trayY + 3);
        ctx.restore();
      }

      // 3. Feed Inlet Stream (Enters at Feed Tray)
      const feedY = colTop + 25 + feedTrayIdx * traySpacing;
      ctx.save();
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(25, feedY);
      ctx.lineTo(colLeft, feedY);
      ctx.stroke();

      // Feed nozzle arrow
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(colLeft - 2, feedY - 5);
      ctx.lineTo(colLeft + 6, feedY);
      ctx.lineTo(colLeft - 2, feedY + 5);
      ctx.closePath();
      ctx.fill();

      // Feed tag
      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`FEED INLET (xF = ${xF.toFixed(2)})`, 20, feedY - 8);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText(`q = ${q.toFixed(2)} (Saturated Liquid)`, 20, feedY + 14);
      ctx.restore();

      // 4. Overhead Vapor Pipe & Overhead Condenser
      ctx.save();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(colCenter, colTop - 22);
      ctx.lineTo(colCenter, 30);
      ctx.lineTo(290, 30);
      ctx.lineTo(290, 70);
      ctx.stroke();

      // Overhead Condenser Drum
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(260, 70, 60, 45, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('CONDENSER', 290, 90);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText('Cooling H₂O', 290, 102);

      // Reflux Return Line back to Top Tray
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(275, 115);
      ctx.lineTo(275, 135);
      ctx.lineTo(colRight, 135);
      ctx.stroke();

      // Distillate Product Take-off
      ctx.strokeStyle = '#F59E0B';
      ctx.beginPath();
      ctx.moveTo(305, 115);
      ctx.lineTo(305, 150);
      ctx.stroke();

      ctx.fillStyle = '#FBBF24';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Distillate xD = ${xD.toFixed(2)}`, 315, 145);
      ctx.fillStyle = '#34D399';
      ctx.fillText(`Reflux R = ${R.toFixed(1)}`, 280, 158);
      ctx.restore();

      // 5. Reboiler at Column Bottom
      ctx.save();
      const rebX = 260;
      const rebY = 410;
      // Bottom liquid drain to reboiler
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(colCenter, colBottom + 20);
      ctx.lineTo(colCenter, 465);
      ctx.lineTo(rebX + 30, 465);
      ctx.lineTo(rebX + 30, rebY + 45);
      ctx.stroke();

      // Reboiler Kettle Shell
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(rebX, rebY, 65, 45, 6);
      ctx.fill();
      ctx.stroke();

      // Reboiler Steam Heating Coil
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 1.5;
      for (let cy = rebY + 12; cy <= rebY + 32; cy += 8) {
        ctx.beginPath();
        ctx.moveTo(rebX + 10, cy);
        ctx.lineTo(rebX + 55, cy);
        ctx.stroke();
      }

      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('REBOILER', rebX + 32, rebY - 6);

      // Reboiler Vapor Return to Sump
      ctx.strokeStyle = '#F97316';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(rebX, rebY + 15);
      ctx.lineTo(colRight, rebY + 15);
      ctx.stroke();

      // Bottoms Product Take-off
      ctx.strokeStyle = '#94A3B8';
      ctx.beginPath();
      ctx.moveTo(rebX + 50, rebY + 45);
      ctx.lineTo(rebX + 50, 490);
      ctx.stroke();

      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`Bottoms xB = ${xB.toFixed(2)}`, rebX + 60, 488);
      ctx.restore();

      // 6. Draw Animated Particles (Rising Bubbles & Descending Drops)
      ctx.save();
      bubblesRef.current.forEach((b) => {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      dropsRef.current.forEach((d) => {
        ctx.fillStyle = 'rgba(16, 185, 129, 0.75)';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // =============================================================
      // RIGHT PANE: DYNAMIC MCCABE-THIELE EQUILIBRIUM GRAPH
      // =============================================================
      const graphX = 450;
      const graphY = 65;
      const graphW = 390;
      const graphH = 340;

      ctx.save();
      // Graph Card Backdrop
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(graphX - 15, graphY - 20, graphW + 30, graphH + 85, 10);
      ctx.fill();
      ctx.stroke();

      // Graph Title
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('MCCABE-THIELE BINARY EQUILIBRIUM DIAGRAM', graphX, graphY - 4);

      // Graph Inner Plot Area
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.fillRect(graphX, graphY, graphW, graphH);
      ctx.strokeRect(graphX, graphY, graphW, graphH);

      // Coordinate mapper: (0,0) to (1,1)
      const toPlotX = (xVal: number) => graphX + xVal * graphW;
      const toPlotY = (yVal: number) => graphY + graphH - yVal * graphH;

      // Diagonal line y = x
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(toPlotX(0), toPlotY(0));
      ctx.lineTo(toPlotX(1), toPlotY(1));
      ctx.stroke();
      ctx.setLineDash([]);

      // VLE Curve: y = alpha*x / (1 + (alpha-1)*x)
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(toPlotX(0), toPlotY(0));
      for (let px = 0.02; px <= 1.0; px += 0.02) {
        const py = (alpha * px) / (1 + (alpha - 1) * px);
        ctx.lineTo(toPlotX(px), toPlotY(py));
      }
      ctx.stroke();

      // Stepping Stairs
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(toPlotX(xD), toPlotY(xD));

      calculatedStages.forEach((stg) => {
        // Horizontal step to VLE curve
        ctx.lineTo(toPlotX(stg.x), toPlotY(stg.y));
        // Vertical drop to operating line
        ctx.lineTo(toPlotX(stg.x), toPlotY(stg.x >= xF ? (R / (R + 1)) * stg.x + xD / (R + 1) : Math.max(xB, stg.x - 0.08)));
      });
      ctx.stroke();

      // Points of interest: xD, xF, xB
      const drawPin = (val: number, label: string, color: string) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(toPlotX(val), toPlotY(val), 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(label, toPlotX(val), toPlotY(val) - 8);
      };

      drawPin(xD, 'xD', '#38BDF8');
      drawPin(xF, 'xF', '#EF4444');
      drawPin(xB, 'xB', '#94A3B8');

      // Graph Legend
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`α = ${alpha.toFixed(2)} | R = ${R.toFixed(2)} (R_min = ${Rmin.toFixed(2)})`, graphX + 10, graphY + graphH + 20);
      ctx.fillText(`Theoretical Stages = ${numTrays} Trays | Feed Tray = #${feedTrayIdx}`, graphX + 10, graphY + graphH + 34);
      ctx.fillText(`Top Distillate Purity = ${(xD * 100).toFixed(1)}% | Bottoms = ${(xB * 100).toFixed(1)}%`, graphX + 10, graphY + graphH + 48);
      ctx.restore();

      // 7. Yellow Measuring Tape Tool
      if (showRuler) {
        ctx.save();
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(rulerTape.x1, rulerTape.y1);
        ctx.lineTo(rulerTape.x2, rulerTape.y2);
        ctx.stroke();

        const tapePx = Math.hypot(rulerTape.x2 - rulerTape.x1, rulerTape.y2 - rulerTape.y1);
        const tapeM = (tapePx / 55).toFixed(2);

        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(rulerTape.x1, rulerTape.y1, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(rulerTape.x2, rulerTape.y2, 6, 0, Math.PI * 2);
        ctx.fill();

        const midX = (rulerTape.x1 + rulerTape.x2) / 2;
        const midY = (rulerTape.y1 + rulerTape.y2) / 2 - 12;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(midX - 35, midY - 10, 70, 20, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FDE68A';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${tapeM} m`, midX, midY + 4);
        ctx.restore();
      }

      // 8. Tray Temperature & Composition Diagnostic Sensor Probe
      if (showProbe) {
        ctx.save();
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(probePos.x, probePos.y, 8, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(probePos.x - 12, probePos.y);
        ctx.lineTo(probePos.x + 12, probePos.y);
        ctx.moveTo(probePos.x, probePos.y - 12);
        ctx.lineTo(probePos.x, probePos.y + 12);
        ctx.stroke();

        // Calculate tray index nearest to probe
        const probeRelY = probePos.y - (colTop + 25);
        const nearestTray = Math.max(1, Math.min(numTrays, Math.round(probeRelY / traySpacing)));
        const trayFrac = (nearestTray - 1) / Math.max(1, numTrays - 1);
        const trayX = xD - trayFrac * (xD - xB);
        const trayY = (alpha * trayX) / (1 + (alpha - 1) * trayX);
        const trayTempC = 78.3 + trayFrac * (100.0 - 78.3);

        const cardX = Math.min(VIRTUAL_WIDTH - 190, probePos.x + 16);
        const cardY = Math.max(30, probePos.y - 65);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, 175, 75, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`TRAY #${nearestTray} PROBE SENSOR`, cardX + 10, cardY + 16);
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`Temperature: ${trayTempC.toFixed(1)} °C`, cardX + 10, cardY + 32);
        ctx.fillText(`Liquid Comp (x): ${trayX.toFixed(3)}`, cardX + 10, cardY + 46);
        ctx.fillText(`Vapor Comp (y): ${trayY.toFixed(3)}`, cardX + 10, cardY + 60);
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
    alpha,
    xF,
    xD,
    xB,
    R,
    q,
    numTrays,
    feedTrayIdx,
    calculatedStages,
    Rmin,
    showGrid,
    showVectors,
    showRuler,
    showProbe,
    rulerTape,
    probePos,
    userZoom,
    pan,
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

  // Pointer Interaction
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
    const vCoords = screenToVirtualCoords(e.clientX, e.clientY, canvas, vp);

    // Check Probe Handle
    if (showProbe && Math.hypot(vCoords.x - probePos.x, vCoords.y - probePos.y) <= 24) {
      setIsDraggingProbe(true);
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // Check Tape Handles
    if (showRuler) {
      if (Math.hypot(vCoords.x - rulerTape.x1, vCoords.y - rulerTape.y1) <= 16) {
        setActiveTapeHandle('p1');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      if (Math.hypot(vCoords.x - rulerTape.x2, vCoords.y - rulerTape.y2) <= 16) {
        setActiveTapeHandle('p2');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
    const vCoords = screenToVirtualCoords(e.clientX, e.clientY, canvas, vp);

    if (isDraggingProbe) {
      setProbePos({
        x: Math.max(30, Math.min(VIRTUAL_WIDTH - 30, vCoords.x)),
        y: Math.max(30, Math.min(VIRTUAL_HEIGHT - 30, vCoords.y)),
      });
      return;
    }

    if (activeTapeHandle === 'p1') {
      setRulerTape((t) => ({ ...t, x1: vCoords.x, y1: vCoords.y }));
      return;
    }
    if (activeTapeHandle === 'p2') {
      setRulerTape((t) => ({ ...t, x2: vCoords.x, y2: vCoords.y }));
      return;
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingProbe(false);
    setActiveTapeHandle('none');
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <PhetWorkbench
      title="Fractional Distillation Column & McCabe-Thiele Workbench"
      subtitle="Vapor-Liquid Equilibrium (VLE), Bubble-Cap Trays & Reflux Hydrodynamics"
      disciplineColor="#10B981"
      isPlaying={isPlaying}
      playbackSpeed={playbackSpeed}
      simTime={simTime}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onStep={handleStep}
      onReset={handleReset}
      onSpeedChange={setPlaybackSpeed}
      showRuler={showRuler}
      showStopwatch={showStopwatch}
      showProbe={showProbe}
      showVectors={showVectors}
      showGrid={showGrid}
      onToggleRuler={() => setShowRuler(!showRuler)}
      onToggleStopwatch={() => setShowStopwatch(!showStopwatch)}
      onToggleProbe={() => setShowProbe(!showProbe)}
      onToggleVectors={() => setShowVectors(!showVectors)}
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
        className="relative w-full h-[400px] sm:h-[480px] bg-[#090D16] select-none touch-none cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />

        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] font-mono text-zinc-400/80 bg-zinc-900/80 backdrop-blur-xs px-2.5 py-1 rounded border border-zinc-800/80 flex items-center gap-2">
          <span className="text-emerald-400 font-bold">💡 Tip:</span>
          <span>Drag the blue sensor probe onto any tray of the distillation column to inspect local temperature and liquid-vapor compositions!</span>
        </div>
      </div>
    </PhetWorkbench>
  );
}
