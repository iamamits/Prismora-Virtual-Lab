'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import type { TitrationSystemType, IndicatorType } from '@prismora/simulation-core';
import { PhetWorkbench } from './phet-workbench';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  computeViewport,
  applyVirtualViewport,
  screenToVirtualCoords,
} from './viewport-helper';

export interface RealtimeTitrationSceneProps {
  analyteVolumeMl?: number; // e.g. 25.0 mL
  analyteMolarity?: number; // e.g. 0.1 M
  titrantMolarity?: number; // e.g. 0.1 M
  systemType?: TitrationSystemType;
  indicator?: IndicatorType;
  className?: string;
  onPointChange?: (point: { volumeAdded: number; ph: number; color: string }) => void;
}

interface FallingDrop {
  x: number;
  y: number;
  vy: number;
  r: number;
}

export function RealtimeTitrationScene({
  analyteVolumeMl = 25.0,
  analyteMolarity = 0.1,
  titrantMolarity = 0.1,
  systemType = 'weak-acid-strong-base',
  indicator = 'phenolphthalein',
  className = '',
  onPointChange,
}: RealtimeTitrationSceneProps) {
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
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 260, y: 310 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 200,
    y1: 70,
    x2: 200,
    y2: 440,
  });
  const [activeTapeHandle, setActiveTapeHandle] = useState<'none' | 'p1' | 'p2'>('none');

  // Titration operational state
  const [volumeAddedMl, setVolumeAddedMl] = useState<number>(0.0);
  const [dispenseRateMlS, setDispenseRateMlS] = useState<number>(0.5); // mL/s when flowing
  const [isStopcockOpen, setIsStopcockOpen] = useState<boolean>(false);

  // Stirrer rotation angle
  const stirAngleRef = useRef<number>(0);
  const dropsRef = useRef<FallingDrop[]>([]);

  // Theoretical Equivalence Volume
  // M_a * V_a = M_t * V_eq  =>  V_eq = (M_a * V_a) / M_t
  const vEqMl = useMemo(() => {
    return (analyteMolarity * analyteVolumeMl) / Math.max(0.001, titrantMolarity);
  }, [analyteMolarity, analyteVolumeMl, titrantMolarity]);

  // Compute pH at any dispensed volume V
  const calculatePh = useCallback(
    (vMl: number) => {
      const vL = vMl / 1000;
      const vInitL = analyteVolumeMl / 1000;
      const totalVL = vInitL + vL;

      const nAcidInit = analyteMolarity * vInitL;
      const nBaseAdded = titrantMolarity * vL;

      if (systemType === 'strong-acid-strong-base') {
        if (vMl < vEqMl - 0.001) {
          const remAcid = nAcidInit - nBaseAdded;
          const hConc = remAcid / totalVL;
          return Math.max(0.5, Math.min(6.9, -Math.log10(hConc)));
        } else if (Math.abs(vMl - vEqMl) <= 0.001) {
          return 7.0;
        } else {
          const excessBase = nBaseAdded - nAcidInit;
          const ohConc = excessBase / totalVL;
          const pOH = -Math.log10(ohConc);
          return Math.max(7.1, Math.min(13.8, 14 - pOH));
        }
      } else if (systemType === 'weak-acid-strong-base') {
        const pKa = 4.75; // Acetic acid
        const Ka = 1.75e-5;

        if (vMl <= 0.01) {
          // Initial weak acid dissociation: [H+] = sqrt(Ka * C)
          const hConc = Math.sqrt(Ka * analyteMolarity);
          return -Math.log10(hConc);
        } else if (vMl < vEqMl - 0.05) {
          // Buffer region (Henderson-Hasselbalch): pH = pKa + log([A-] / [HA])
          const molAminus = nBaseAdded;
          const molHA = nAcidInit - nBaseAdded;
          const ratio = Math.max(1e-4, molAminus / Math.max(1e-4, molHA));
          return Math.max(2.8, Math.min(8.0, pKa + Math.log10(ratio)));
        } else if (Math.abs(vMl - vEqMl) <= 0.05) {
          // Equivalence point: salt hydrolysis of acetate
          // pH = 7 + 0.5*pKa + 0.5*log(C_salt)
          const cSalt = nAcidInit / totalVL;
          return Math.max(7.5, Math.min(9.5, 7 + 0.5 * pKa + 0.5 * Math.log10(Math.max(1e-4, cSalt))));
        } else {
          // Excess strong base
          const excessBase = nBaseAdded - nAcidInit;
          const ohConc = excessBase / totalVL;
          const pOH = -Math.log10(ohConc);
          return Math.max(8.8, Math.min(13.8, 14 - pOH));
        }
      } else {
        // Strong acid weak base
        return 7.0;
      }
    },
    [analyteVolumeMl, analyteMolarity, titrantMolarity, vEqMl, systemType],
  );

  const currentPh = calculatePh(volumeAddedMl);

  // Indicator color function based on pH
  const getIndicatorColor = useCallback(
    (ph: number) => {
      if (indicator === 'phenolphthalein') {
        // Colorless below 8.2, pink/magenta at 8.2-10.0
        if (ph < 8.2) return 'rgba(240, 249, 255, 0.45)'; // translucent watery
        const f = Math.min(1, (ph - 8.2) / 1.8);
        return `rgba(236, 72, 153, ${0.35 + f * 0.55})`; // pink to intense magenta
      } else if (indicator === 'methyl-orange') {
        // Red < 3.1, orange 3.1-4.4, yellow > 4.4
        if (ph < 3.1) return 'rgba(239, 68, 68, 0.7)';
        if (ph > 4.4) return 'rgba(234, 179, 8, 0.7)';
        return 'rgba(249, 115, 22, 0.7)';
      } else {
        // Bromothymol blue: yellow < 6.0, green 6.0-7.6, blue > 7.6
        if (ph < 6.0) return 'rgba(234, 179, 8, 0.7)';
        if (ph > 7.6) return 'rgba(59, 130, 246, 0.7)';
        return 'rgba(16, 185, 129, 0.7)';
      }
    },
    [indicator],
  );

  const currentColor = getIndicatorColor(currentPh);

  // Reset
  const handleReset = useCallback(() => {
    setVolumeAddedMl(0);
    setIsStopcockOpen(false);
    dropsRef.current = [];
    setSimTime(0);
  }, []);

  // Step
  const handleStep = useCallback(() => {
    setVolumeAddedMl((v) => Math.min(50, v + 0.1));
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
        stirAngleRef.current += dt * 18;

        // Dispensing flow
        if (isStopcockOpen && volumeAddedMl < 50) {
          const added = dispenseRateMlS * dt;
          setVolumeAddedMl((v) => Math.min(50, v + added));

          // Spawn falling droplets
          if (Math.random() < 0.6) {
            dropsRef.current.push({
              x: 212 + (Math.random() - 0.5) * 2,
              y: 250,
              vy: 140 + Math.random() * 40,
              r: 2.2,
            });
          }
        }

        // Update drops
        for (let i = dropsRef.current.length - 1; i >= 0; i--) {
          const d = dropsRef.current[i]!;
          d.y += d.vy * dt;
          if (d.y > 330) {
            dropsRef.current.splice(i, 1);
          }
        }
      }

      if (onPointChange) {
        onPointChange({
          volumeAdded: volumeAddedMl,
          ph: currentPh,
          color: currentColor,
        });
      }

      // -------------------------------------------------------------
      // DRAW CANVAS IN VIRTUAL COORDINATES (900 x 520)
      // -------------------------------------------------------------
      const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
      applyVirtualViewport(ctx, vp, dpr);

      // Deep Dark Lab Bench Background
      ctx.fillStyle = '#080C14';
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
      // LEFT PANE: HIGH-PRECISION TITRATION APPARATUS (STAND, BURETTE, FLASK)
      // =============================================================

      // 1. Heavy Retort Stand
      ctx.save();
      // Stand heavy base plate
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(80, 430, 260, 24, 6);
      ctx.fill();
      ctx.stroke();

      // Stand vertical stainless steel rod
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(120, 430);
      ctx.lineTo(120, 50);
      ctx.stroke();

      // Clamps holding burette
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(120, 110);
      ctx.lineTo(200, 110);
      ctx.moveTo(120, 210);
      ctx.lineTo(200, 210);
      ctx.stroke();
      ctx.restore();

      // 2. 50 mL Graduated Precision Glass Burette
      ctx.save();
      const burX = 202;
      const burW = 20;
      const burTop = 60;
      const burH = 180;

      // Outer glass cylinder
      ctx.fillStyle = 'rgba(30, 41, 59, 0.6)';
      ctx.fillRect(burX, burTop, burW, burH);
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(burX, burTop, burW, burH);

      // Titrant Liquid inside Burette (level drops as volumeAddedMl increases)
      const liquidFraction = Math.max(0, 1 - volumeAddedMl / 50.0);
      const liquidHeight = liquidFraction * (burH - 10);
      const liquidTopY = burTop + burH - liquidHeight;

      ctx.fillStyle = 'rgba(56, 189, 248, 0.55)';
      ctx.fillRect(burX + 1, liquidTopY, burW - 2, liquidHeight);

      // Graduations & mL ticks
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 10; i++) {
        const tickY = burTop + 10 + i * (burH - 20) / 10;
        ctx.beginPath();
        ctx.moveTo(burX, tickY);
        ctx.lineTo(burX + (i % 5 === 0 ? 8 : 4), tickY);
        ctx.stroke();

        if (i % 2 === 0) {
          ctx.fillStyle = '#CBD5E1';
          ctx.font = '7px JetBrains Mono, monospace';
          ctx.textAlign = 'right';
          ctx.fillText(`${i * 5}`, burX - 3, tickY + 3);
        }
      }

      // Burette Stopcock Valve
      const valveY = burTop + burH + 8;
      ctx.fillStyle = '#F59E0B';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(burX + burW / 2, valveY, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Valve rotating handle
      ctx.save();
      ctx.translate(burX + burW / 2, valveY);
      ctx.rotate(isStopcockOpen ? Math.PI / 2 : 0);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, 0);
      ctx.lineTo(10, 0);
      ctx.stroke();
      ctx.restore();

      // Burette Delivery Tip
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(burX + 7, valveY + 7);
      ctx.lineTo(burX + 9, valveY + 22);
      ctx.lineTo(burX + 11, valveY + 22);
      ctx.lineTo(burX + 13, valveY + 7);
      ctx.stroke();
      ctx.restore();

      // 3. Falling Titrant Droplets
      ctx.save();
      dropsRef.current.forEach((d) => {
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // 4. Magnetic Stirrer Base Plate
      ctx.save();
      const stirX = 145;
      const stirY = 405;
      const stirW = 135;
      const stirH = 25;

      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(stirX, stirY, stirW, stirH, 6);
      ctx.fill();
      ctx.stroke();

      // Stirrer RPM control knob
      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(stirX + 22, stirY + 12, 6, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MAGNETIC STIRRER', stirX + stirW / 2 + 10, stirY + 16);
      ctx.restore();

      // 5. Conical / Erlenmeyer Flask
      ctx.save();
      const flaskNeckX = 196;
      const flaskNeckW = 32;
      const flaskTopY = 275;
      const flaskBaseY = 405;
      const flaskBaseW = 100;
      const flaskCenterX = 212;

      // Flask Solution Fluid Fill
      ctx.fillStyle = currentColor;
      ctx.beginPath();
      ctx.moveTo(flaskCenterX - flaskBaseW / 2 + 4, flaskBaseY - 2);
      ctx.lineTo(flaskCenterX + flaskBaseW / 2 - 4, flaskBaseY - 2);
      ctx.lineTo(flaskCenterX + 28, flaskBaseY - 50);
      ctx.lineTo(flaskCenterX - 28, flaskBaseY - 50);
      ctx.closePath();
      ctx.fill();

      // Flask Glass Contour Outline
      ctx.strokeStyle = '#E2E8F0';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      // Lip
      ctx.moveTo(flaskNeckX - 3, flaskTopY);
      ctx.lineTo(flaskNeckX + flaskNeckW + 3, flaskTopY);
      // Neck
      ctx.lineTo(flaskNeckX + flaskNeckW, flaskTopY + 25);
      // Conical wall
      ctx.lineTo(flaskCenterX + flaskBaseW / 2, flaskBaseY);
      // Flat bottom
      ctx.lineTo(flaskCenterX - flaskBaseW / 2, flaskBaseY);
      // Conical wall
      ctx.lineTo(flaskNeckX, flaskTopY + 25);
      ctx.closePath();
      ctx.stroke();

      // Rotating Stir Bar inside flask
      ctx.save();
      ctx.translate(flaskCenterX, flaskBaseY - 8);
      ctx.rotate(stirAngleRef.current);
      ctx.fillStyle = '#FFFFFF';
      ctx.strokeStyle = '#CBD5E1';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-10, -3, 20, 6, 3);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();

      // 6. Immersed Glass Combination pH Electrode
      ctx.save();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(270, 220);
      ctx.lineTo(235, 365);
      ctx.stroke();

      // Glass bulb sensor at tip
      ctx.fillStyle = '#38BDF8';
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(235, 365, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Flexible wire to benchtop meter
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(270, 220);
      ctx.bezierCurveTo(310, 180, 360, 160, 420, 160);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // 7. Interactive Stopcock Dispense Control Bar (Bottom Left)
      ctx.save();
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = isStopcockOpen ? '#10B981' : '#F59E0B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(80, 465, 260, 38, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isStopcockOpen ? '#10B981' : '#F59E0B';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(
        isStopcockOpen ? '● STOPCOCK OPEN: FLOWING' : '○ STOPCOCK CLOSED: CLICK TO DISPENSE',
        210,
        484,
      );
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(`Titrant Dispensed: ${volumeAddedMl.toFixed(2)} mL / 50.0 mL`, 210, 496);
      ctx.restore();

      // =============================================================
      // RIGHT PANE: DYNAMIC REAL-TIME TITRATION CURVE (pH vs V_added)
      // =============================================================
      const graphX = 430;
      const graphY = 65;
      const graphW = 410;
      const graphH = 340;

      ctx.save();
      // Backdrop
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
      ctx.fillText('DYNAMIC POTENTIOMETRIC TITRATION CURVE', graphX, graphY - 4);

      // Inner Canvas Plot Area
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.fillRect(graphX, graphY, graphW, graphH);
      ctx.strokeRect(graphX, graphY, graphW, graphH);

      // Coordinate mapper: V from 0 to 50 mL, pH from 0 to 14
      const toPlotX = (v: number) => graphX + (v / 50.0) * graphW;
      const toPlotY = (ph: number) => graphY + graphH - (ph / 14.0) * graphH;

      // pH = 7 Neutral Grid Line
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(toPlotX(0), toPlotY(7));
      ctx.lineTo(toPlotX(50), toPlotY(7));
      ctx.stroke();

      // V_eq vertical line
      ctx.strokeStyle = '#EF4444';
      ctx.beginPath();
      ctx.moveTo(toPlotX(vEqMl), toPlotY(0));
      ctx.lineTo(toPlotX(vEqMl), toPlotY(14));
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = '#F87171';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`V_eq = ${vEqMl.toFixed(1)} mL`, toPlotX(vEqMl), graphY + 14);

      // Titration curve (pre-drawn full theoretical curve in faint cyan)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(toPlotX(0), toPlotY(calculatePh(0)));
      for (let v = 0.5; v <= 50; v += 0.5) {
        ctx.lineTo(toPlotX(v), toPlotY(calculatePh(v)));
      }
      ctx.stroke();

      // Active dispensed curve (solid bright emerald)
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(toPlotX(0), toPlotY(calculatePh(0)));
      for (let v = 0.2; v <= volumeAddedMl; v += 0.2) {
        ctx.lineTo(toPlotX(v), toPlotY(calculatePh(v)));
      }
      ctx.stroke();

      // Current Point Pulsing Pin
      const curX = toPlotX(volumeAddedMl);
      const curY = toPlotY(currentPh);

      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(curX, curY, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Benchtop Digital pH Meter Readout Card
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(graphX + graphW - 145, graphY + graphH - 85, 135, 70, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 8px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('DIGITAL pH METER', graphX + graphW - 77, graphY + graphH - 70);

      ctx.fillStyle = '#10B981';
      ctx.font = 'bold 22px JetBrains Mono, monospace';
      ctx.fillText(`${currentPh.toFixed(2)}`, graphX + graphW - 77, graphY + graphH - 42);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText(`T = 25.0 °C | CALIBRATED`, graphX + graphW - 77, graphY + graphH - 24);

      // Graph Telemetry Legend
      ctx.fillStyle = '#CBD5E1';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(
        `System: ${systemType.replace(/-/g, ' ').toUpperCase()} | Indicator: ${indicator.toUpperCase()}`,
        graphX + 10,
        graphY + graphH + 20,
      );
      ctx.fillText(
        `Analyte: ${analyteMolarity} M (${analyteVolumeMl} mL) | Titrant: ${titrantMolarity} M NaOH`,
        graphX + 10,
        graphY + graphH + 34,
      );
      ctx.fillText(
        `Current: V = ${volumeAddedMl.toFixed(2)} mL | pH = ${currentPh.toFixed(2)} | Status: ${
          Math.abs(volumeAddedMl - vEqMl) < 0.2 ? 'EQUIVALENCE POINT' : volumeAddedMl < vEqMl ? 'PRE-EQUIVALENCE' : 'POST-EQUIVALENCE'
        }`,
        graphX + 10,
        graphY + graphH + 48,
      );
      ctx.restore();

      // 8. Yellow Measuring Tape Tool
      if (showRuler) {
        ctx.save();
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(rulerTape.x1, rulerTape.y1);
        ctx.lineTo(rulerTape.x2, rulerTape.y2);
        ctx.stroke();

        const tapePx = Math.hypot(rulerTape.x2 - rulerTape.x1, rulerTape.y2 - rulerTape.y1);
        const tapeCm = (tapePx / 8.5).toFixed(1);

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
        ctx.fillText(`${tapeCm} cm`, midX, midY + 4);
        ctx.restore();
      }

      // 9. Solution Diagnostic Sensor Probe Tool
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

        const hConc = Math.pow(10, -currentPh);
        const ohConc = Math.pow(10, -(14 - currentPh));

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
        ctx.fillText('IONIC EQUILIBRIA PROBE', cardX + 10, cardY + 16);
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`Measured pH: ${currentPh.toFixed(2)}`, cardX + 10, cardY + 32);
        ctx.fillText(`[H⁺] Conc: ${hConc.toExponential(2)} M`, cardX + 10, cardY + 46);
        ctx.fillText(`[OH⁻] Conc: ${ohConc.toExponential(2)} M`, cardX + 10, cardY + 60);
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
    volumeAddedMl,
    isStopcockOpen,
    dispenseRateMlS,
    currentPh,
    currentColor,
    vEqMl,
    calculatePh,
    systemType,
    indicator,
    analyteMolarity,
    analyteVolumeMl,
    titrantMolarity,
    showGrid,
    showVectors,
    showRuler,
    showProbe,
    rulerTape,
    probePos,
    userZoom,
    pan,
    onPointChange,
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

    // Check Stopcock valve or button click
    if (
      (Math.hypot(vCoords.x - 212, vCoords.y - 248) <= 20) ||
      (vCoords.x >= 80 && vCoords.x <= 340 && vCoords.y >= 465 && vCoords.y <= 503)
    ) {
      setIsStopcockOpen((open) => !open);
      return;
    }

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
      title="Potentiometric Acid-Base Titration Laboratory Workbench"
      subtitle="Volumetric Burette Dispensing, Dynamic Phenolphthalein Indicator & pH Sensor Probe"
      disciplineColor="#F59E0B"
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
        className="relative w-full h-[400px] sm:h-[480px] bg-[#080C14] select-none touch-none cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />

        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] font-mono text-zinc-400/80 bg-zinc-900/80 backdrop-blur-xs px-2.5 py-1 rounded border border-zinc-800/80 flex items-center gap-2">
          <span className="text-amber-400 font-bold">💡 Tip:</span>
          <span>Click the yellow stopcock valve or the bottom button to open the burette and dispense titrant!</span>
        </div>
      </div>
    </PhetWorkbench>
  );
}
