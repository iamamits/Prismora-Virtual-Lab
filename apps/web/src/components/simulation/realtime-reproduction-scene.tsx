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
import {
  calculateMenstrualCycleState,
  evaluateFertilization,
  EMBRYOGENESIS_STAGES,
  type MenstrualCycleState,
  type ContraceptionMethod,
} from '@prismora/simulation-core';

export type ReproductionSceneMode = 'menstrual_cycle' | 'fertilization' | 'embryogenesis' | 'contraception_lab';

export interface RealtimeReproductionSceneProps {
  initialMode?: ReproductionSceneMode;
  initialDay?: number;
  initialContraception?: ContraceptionMethod;
  className?: string;
  onStateChange?: (state: MenstrualCycleState) => void;
}

interface SpermParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  tailPhase: number;
  capacitated: boolean;
  boundToZona: boolean;
}

export function RealtimeReproductionScene({
  initialMode = 'menstrual_cycle',
  initialDay = 14,
  initialContraception = 'none',
  className = '',
  onStateChange,
}: RealtimeReproductionSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mode Selection
  const [activeMode, setActiveMode] = useState<ReproductionSceneMode>(initialMode);
  const [dayOfCycle, setDayOfCycle] = useState<number>(initialDay);
  const [contraceptive, setContraceptive] = useState<ContraceptionMethod>(initialContraception);
  const [embryoStageIndex, setEmbryoStageIndex] = useState<number>(0);

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

  // Tools in Virtual Coordinates (900 x 520)
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 420, y: 160 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 220,
    y1: 200,
    x2: 360,
    y2: 200,
  });
  const [activeTapeHandle, setActiveTapeHandle] = useState<'none' | 'p1' | 'p2'>('none');

  // Sperm particles for fertilization mode
  const spermRef = useRef<SpermParticle[]>([]);
  const caWaveRadiusRef = useRef<number>(0);
  const fertilizationCompletedRef = useRef<boolean>(false);

  // Current physiological state
  const cycleState = useMemo(() => {
    return calculateMenstrualCycleState(dayOfCycle, contraceptive);
  }, [dayOfCycle, contraceptive]);

  // Notify parent
  useEffect(() => {
    if (onStateChange) onStateChange(cycleState);
  }, [cycleState, onStateChange]);

  // Initialize sperm particles
  const initSperm = useCallback(() => {
    const list: SpermParticle[] = [];
    const count = contraceptive === 'barrier_condom' ? 0 : contraceptive === 'copper_iud' ? 6 : 40;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 180 + Math.random() * 80;
      list.push({
        x: 450 + Math.cos(angle) * dist,
        y: 260 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        tailPhase: Math.random() * Math.PI * 2,
        capacitated: Math.random() < 0.8,
        boundToZona: false,
      });
    }
    spermRef.current = list;
    caWaveRadiusRef.current = 0;
    fertilizationCompletedRef.current = false;
  }, [contraceptive]);

  useEffect(() => {
    if (activeMode === 'fertilization') {
      initSperm();
    }
  }, [activeMode, initSperm]);

  // Reset
  const handleReset = useCallback(() => {
    setSimTime(0);
    setDayOfCycle(14);
    setEmbryoStageIndex(0);
    initSperm();
  }, [initSperm]);

  // Single step
  const handleStep = useCallback(() => {
    if (activeMode === 'menstrual_cycle') {
      setDayOfCycle((d) => (d >= 28 ? 1 : d + 1));
    } else if (activeMode === 'embryogenesis') {
      setEmbryoStageIndex((s) => (s + 1) % EMBRYOGENESIS_STAGES.length);
    }
    setSimTime((t) => t + 0.016);
  }, [activeMode]);

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

        // Auto-advance cycle in menstrual mode if playing
        if (activeMode === 'menstrual_cycle') {
          // 1 day every 2 seconds at 1x speed
          setDayOfCycle((prev) => {
            const next = prev + dt * 0.5;
            return next > 28 ? 1 : next;
          });
        }

        // Sperm kinematics in fertilization mode
        if (activeMode === 'fertilization') {
          const ovumCenterX = 450;
          const ovumCenterY = 260;
          const zonaRadius = 75;

          const spermList = spermRef.current;
          spermList.forEach((sperm) => {
            sperm.tailPhase += dt * 25;

            if (sperm.boundToZona) return;

            // Vector to ovum center (chemotaxis along progesterone gradient)
            const dx = ovumCenterX - sperm.x;
            const dy = ovumCenterY - sperm.y;
            const dist = Math.hypot(dx, dy);

            if (dist > zonaRadius) {
              const speed = contraceptive === 'copper_iud' ? 12 : sperm.capacitated ? 65 : 35;
              const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.4;
              sperm.vx = Math.cos(angle) * speed;
              sperm.vy = Math.sin(angle) * speed;

              sperm.x += sperm.vx * dt;
              sperm.y += sperm.vy * dt;
            } else {
              // Bound to zona pellucida!
              sperm.boundToZona = true;
              sperm.x = ovumCenterX + (dx / dist) * zonaRadius;
              sperm.y = ovumCenterY + (dy / dist) * zonaRadius;

              if (!fertilizationCompletedRef.current && sperm.capacitated) {
                fertilizationCompletedRef.current = true;
                caWaveRadiusRef.current = 10;
              }
            }
          });

          // Propagate Ca2+ wave (polyspermy cortical block)
          if (caWaveRadiusRef.current > 0 && caWaveRadiusRef.current < zonaRadius) {
            caWaveRadiusRef.current += dt * 80;
          }
        }
      }

      // -------------------------------------------------------------
      // DRAW CANVAS IN VIRTUAL COORDINATES (900 x 520)
      // -------------------------------------------------------------
      const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
      applyVirtualViewport(ctx, vp, dpr);

      // Deep Dark Medical Bio Background
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
      // MODE 1: MENSTRUAL & OVARIAN CYCLE (ENDOCRINE CURVES & HISTOLOGY)
      // =============================================================
      if (activeMode === 'menstrual_cycle' || activeMode === 'contraception_lab') {
        const curDay = Math.floor(dayOfCycle);
        const curState = calculateMenstrualCycleState(dayOfCycle, contraceptive);

        // TOP HALF: Dynamic Endocrine Curves (LH, FSH, Estrogen, Progesterone)
        const gX = 80;
        const gY = 40;
        const gW = 740;
        const gH = 180;

        ctx.save();
        // Graph Box
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(gX - 10, gY - 15, gW + 20, gH + 30, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#020617';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.fillRect(gX, gY, gW, gH);
        ctx.strokeRect(gX, gY, gW, gH);

        // X Axis: Days 1 to 28
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        for (let d = 1; d <= 28; d++) {
          const px = gX + ((d - 1) / 27) * gW;
          if (d === 1 || d === 5 || d === 14 || d === 21 || d === 28) {
            ctx.beginPath();
            ctx.moveTo(px, gY);
            ctx.lineTo(px, gY + gH);
            ctx.stroke();

            ctx.fillStyle = d === 14 ? '#EC4899' : '#94A3B8';
            ctx.font = 'bold 9px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`D${d}`, px, gY + gH + 12);
          }
        }

        // Ovulation vertical marker line
        const ovX = gX + ((14 - 1) / 27) * gW;
        ctx.strokeStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ovX, gY);
        ctx.lineTo(ovX, gY + gH);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#F472B6';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText('OVULATION (LH SURGE)', ovX, gY - 4);

        // Helpers to plot curves
        const plotCurve = (
          calcVal: (d: number) => number,
          maxVal: number,
          color: string,
          lineWidth: number = 2
        ) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = lineWidth;
          ctx.beginPath();
          for (let d = 1; d <= 28; d += 0.5) {
            const st = calculateMenstrualCycleState(d, contraceptive);
            const val = calcVal(d);
            const cx = gX + ((d - 1) / 27) * gW;
            const cy = gY + gH - (val / maxVal) * gH * 0.92;
            if (d === 1) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
          }
          ctx.stroke();
        };

        // 1. LH Curve (Yellow/Orange)
        plotCurve((d) => calculateMenstrualCycleState(d, contraceptive).lhMiuMl, 80, '#F59E0B', 2.5);

        // 2. FSH Curve (Cyan)
        plotCurve((d) => calculateMenstrualCycleState(d, contraceptive).fshMiuMl, 80, '#38BDF8', 2.0);

        // 3. Estrogen Curve (Rose Pink)
        plotCurve((d) => calculateMenstrualCycleState(d, contraceptive).estradiolPgMl, 350, '#EC4899', 2.5);

        // 4. Progesterone Curve (Emerald Green)
        plotCurve((d) => calculateMenstrualCycleState(d, contraceptive).progesteroneNgMl, 20, '#10B981', 2.5);

        // Current Day Cursor Pin
        const curPx = gX + ((dayOfCycle - 1) / 27) * gW;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(curPx, gY);
        ctx.lineTo(curPx, gY + gH);
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(curPx, gY, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Legend
        ctx.save();
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText(`● LH: ${curState.lhMiuMl} mIU/mL`, gX + 10, gY + 18);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`● FSH: ${curState.fshMiuMl} mIU/mL`, gX + 160, gY + 18);
        ctx.fillStyle = '#EC4899';
        ctx.fillText(`● Estrogen (E₂): ${curState.estradiolPgMl} pg/mL`, gX + 310, gY + 18);
        ctx.fillStyle = '#10B981';
        ctx.fillText(`● Progesterone (P₄): ${curState.progesteroneNgMl} ng/mL`, gX + 490, gY + 18);
        ctx.restore();

        // BOTTOM HALF: OVARIAN FOLLICULAR & ENDOMETRIAL HISTOLOGY
        const bY = 275;
        const bH = 175;

        ctx.save();
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(gX - 10, bY, gW + 20, bH, 8);
        ctx.fill();
        ctx.stroke();

        // Left Panel: Ovarian Follicle Anatomy
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText('OVARIAN FOLLICULAR STATUS', gX + 15, bY + 24);

        const folX = gX + 110;
        const folY = bY + 95;
        const folRadius = Math.max(12, curState.follicleDiameterMm * 2.5);

        // Ovarian Stroma background
        ctx.fillStyle = 'rgba(236, 72, 153, 0.15)';
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(folX, folY, 65, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Growing Follicle
        ctx.fillStyle = curDay < 14 ? 'rgba(56, 189, 248, 0.35)' : 'rgba(234, 179, 8, 0.45)';
        ctx.strokeStyle = curDay < 14 ? '#38BDF8' : '#F59E0B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(folX, folY, folRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Oocyte inside follicle
        if (curDay < 14 || contraceptive === 'oral_combined_pill') {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(folX, folY, 8, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          curState.ovulationOccurred && curDay >= 14
            ? 'Corpus Luteum (Secretes P₄)'
            : curState.follicleDiameterMm > 18
            ? 'Mature Graafian Follicle'
            : 'Developing Secondary Follicle',
          folX,
          bY + 160
        );

        // Right Panel: Uterine Endometrium Cross-section
        const endoX = gX + 270;
        const endoW = 450;
        ctx.fillStyle = '#EC4899';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `UTERINE ENDOMETRIAL WALL (Thickness: ${curState.endometrialThicknessMm} mm)`,
          endoX,
          bY + 24
        );

        // Myometrium base
        ctx.fillStyle = '#475569';
        ctx.fillRect(endoX, bY + 130, endoW, 20);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillText('Myometrium (Smooth Muscle Layer)', endoX + 10, bY + 144);

        // Dynamic Endometrium Height
        const maxEndoHeight = 85;
        const endoHeightPx = (curState.endometrialThicknessMm / 14.0) * maxEndoHeight;
        const endoTopY = bY + 130 - endoHeightPx;

        // Functional Layer Fill
        const endoGrad = ctx.createLinearGradient(0, endoTopY, 0, bY + 130);
        endoGrad.addColorStop(0, '#F43F5E');
        endoGrad.addColorStop(1, '#9F1239');
        ctx.fillStyle = endoGrad;
        ctx.fillRect(endoX, endoTopY, endoW, endoHeightPx);

        // Spiral Arteries in Endometrium
        ctx.strokeStyle = '#FECDD3';
        ctx.lineWidth = 1.5;
        for (let ax = endoX + 30; ax < endoX + endoW - 20; ax += 45) {
          ctx.beginPath();
          ctx.moveTo(ax, bY + 130);
          for (let y = bY + 130; y >= endoTopY + 5; y -= 6) {
            const wiggle = Math.sin(y * 0.4) * 5;
            ctx.lineTo(ax + wiggle, y);
          }
          ctx.stroke();
        }

        // Phase descriptor pill
        ctx.fillStyle = curState.phase === 'ovulatory' ? '#EC4899' : curState.phase === 'luteal' ? '#10B981' : '#38BDF8';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(
          `Current Phase: ${curState.phase.toUpperCase()} | Day ${curDay}/28 | BBT: ${curState.basalBodyTempC} °C`,
          endoX,
          bY + 42
        );
        ctx.fillText(
          `Cervical Mucus: ${curState.cervicalMucusType.replace(/_/g, ' ')} | Fertile: ${curState.fertileWindow ? 'YES' : 'NO'}`,
          endoX,
          bY + 56
        );
        ctx.restore();
      }

      // =============================================================
      // MODE 2: SPERM-OVUM FERTILIZATION & POLYSPERMY BLOCK
      // =============================================================
      if (activeMode === 'fertilization') {
        const ovumX = 450;
        const ovumY = 260;
        const ovumR = 55;
        const zonaR = 75;
        const coronaR = 115;

        ctx.save();
        // 1. Corona Radiata Follicular Cells
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1;
        for (let a = 0; a < Math.PI * 2; a += 0.22) {
          const cx = ovumX + Math.cos(a) * (coronaR - 10 + Math.sin(a * 4) * 6);
          const cy = ovumY + Math.sin(a) * (coronaR - 10 + Math.sin(a * 4) * 6);
          ctx.beginPath();
          ctx.arc(cx, cy, 9, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }

        // 2. Zona Pellucida Glycoprotein Coat
        ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ovumX, ovumY, zonaR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cortical Reaction Ca2+ Wave
        if (caWaveRadiusRef.current > 0) {
          ctx.strokeStyle = '#10B981';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(ovumX, ovumY, caWaveRadiusRef.current, 0, Math.PI * 2);
          ctx.stroke();
        }

        // 3. Ooplasm (Cytoplasm of Secondary Oocyte)
        ctx.fillStyle = 'rgba(244, 63, 94, 0.35)';
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ovumX, ovumY, ovumR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Female Pronucleus (Haploid 23, X)
        ctx.fillStyle = '#FDA4AF';
        ctx.strokeStyle = '#E11D48';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ovumX - 12, ovumY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#881337';
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('♀ 23,X', ovumX - 12, ovumY + 3);

        // Male Pronucleus (if fertilizing)
        if (fertilizationCompletedRef.current) {
          ctx.fillStyle = '#BAE6FD';
          ctx.strokeStyle = '#0284C7';
          ctx.beginPath();
          ctx.arc(ovumX + 12, ovumY, 14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#0369A1';
          ctx.fillText('♂ 23,Y', ovumX + 12, ovumY + 3);
        }

        // 4. Motile Sperm Cells
        spermRef.current.forEach((s) => {
          ctx.save();
          const angle = Math.atan2(s.vy, s.vx);
          ctx.translate(s.x, s.y);
          ctx.rotate(angle);

          // Head (Acrosome + Nucleus)
          ctx.fillStyle = s.capacitated ? '#FFFFFF' : '#94A3B8';
          ctx.beginPath();
          ctx.ellipse(0, 0, 5, 3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Flagellar Tail Wave
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(-5, 0);
          for (let tx = -5; tx >= -28; tx -= 3) {
            const ty = Math.sin(s.tailPhase + tx * 0.3) * 3.5;
            ctx.lineTo(tx, ty);
          }
          ctx.stroke();
          ctx.restore();
        });

        // Telemetry HUD
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(50, 40, 260, 115, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#EC4899';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('FERTILIZATION KINETICS', 65, 62);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`Motile Sperm Count: ${spermRef.current.length} cells`, 65, 80);
        ctx.fillText(`Acrosome Reaction: ${fertilizationCompletedRef.current ? 'ACTIVE' : 'INDUCING'}`, 65, 95);
        ctx.fillText(`Cortical Reaction: ${fertilizationCompletedRef.current ? 'SLOW BLOCK ACTIVATED' : 'WAITING'}`, 65, 110);
        ctx.fillText(`Diploid Karyogamy: ${fertilizationCompletedRef.current ? '46, XY RESTORED' : 'PENDING'}`, 65, 125);

        // Educational Callout Banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(50, 440, 800, 45, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText(
          '💡 Scientific Mechanism: Depolarization creates Fast Block; Cortical granules harden Zona Pellucida to permanently prevent Polyspermy.',
          65,
          467
        );
        ctx.restore();
      }

      // =============================================================
      // MODE 3: EMBRYOGENESIS & CLEAVAGE TIMELINE
      // =============================================================
      if (activeMode === 'embryogenesis') {
        const curStage = EMBRYOGENESIS_STAGES[embryoStageIndex]!;

        ctx.save();
        // Central Embryo Viewport
        const emX = 450;
        const emY = 240;
        const emR = 95;

        // Outer Zona Pellucida envelope (present until blastocyst hatching)
        const isHatched = embryoStageIndex >= 6;
        if (!isHatched) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(emX, emY, emR + 10, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Render Blastomere cells based on stage
        ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 2;

        if (curStage.cellCount === 1) {
          ctx.beginPath();
          ctx.arc(emX, emY, emR, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Nucleus
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(emX, emY, 15, 0, Math.PI * 2);
          ctx.fill();
        } else if (curStage.cellCount === 2) {
          ctx.beginPath();
          ctx.arc(emX - 40, emY, emR * 0.55, 0, Math.PI * 2);
          ctx.arc(emX + 40, emY, emR * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (curStage.cellCount === 4) {
          ctx.beginPath();
          ctx.arc(emX - 35, emY - 35, emR * 0.42, 0, Math.PI * 2);
          ctx.arc(emX + 35, emY - 35, emR * 0.42, 0, Math.PI * 2);
          ctx.arc(emX - 35, emY + 35, emR * 0.42, 0, Math.PI * 2);
          ctx.arc(emX + 35, emY + 35, emR * 0.42, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (curStage.cellCount <= 16) {
          // Morula: compacted mulberry ball
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.arc(emX + Math.cos(a) * 45, emY + Math.sin(a) * 45, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(emX, emY, 26, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          // Blastocyst: Trophoblast outer rim + Inner Cell Mass (ICM) + Blastocoel cavity
          // Outer Trophoblast Ring
          for (let a = 0; a < Math.PI * 2; a += 0.2) {
            ctx.beginPath();
            ctx.arc(emX + Math.cos(a) * (emR - 10), emY + Math.sin(a) * (emR - 10), 8, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          // Inner Cell Mass (Pluripotent Stem Cells)
          ctx.fillStyle = '#F59E0B';
          ctx.strokeStyle = '#D97706';
          for (let i = 0; i < 9; i++) {
            ctx.beginPath();
            ctx.arc(emX - 35 + (i % 3) * 16, emY - 35 + Math.floor(i / 3) * 16, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.fillStyle = '#CBD5E1';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText('Inner Cell Mass (ICM)', emX - 85, emY - 55);
          ctx.fillText('Blastocoel Cavity', emX + 5, emY + 35);
        }

        // Stage Description Card
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(80, 410, 740, 80, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`STAGE: ${curStage.stageName.toUpperCase()}`, 100, 432);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(
          `Time: ${curStage.hoursPostFertilization}h post-fertilization | Cells: ${curStage.cellCount} | Site: ${curStage.anatomicalLocation.replace(/_/g, ' ').toUpperCase()}`,
          100,
          450
        );
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(curStage.description, 100, 468);
        ctx.restore();
      }

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
        const tapeUm = (tapePx * 1.5).toFixed(0);

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
        ctx.roundRect(midX - 40, midY - 10, 80, 20, 4);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FDE68A';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`${tapeUm} µm`, midX, midY + 4);
        ctx.restore();
      }

      // 8. Endocrine / Cytology Sensor Probe Tool
      if (showProbe) {
        ctx.save();
        ctx.strokeStyle = '#EC4899';
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

        const cardX = Math.min(VIRTUAL_WIDTH - 210, probePos.x + 16);
        const cardY = Math.max(30, probePos.y - 65);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, 195, 75, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#EC4899';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('BIOMEDICAL SENSOR PROBE', cardX + 10, cardY + 16);
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`LH Peak: ${cycleState.lhMiuMl} mIU/mL`, cardX + 10, cardY + 32);
        ctx.fillText(`FSH Level: ${cycleState.fshMiuMl} mIU/mL`, cardX + 10, cardY + 46);
        ctx.fillText(`Endometrium: ${cycleState.endometrialThicknessMm} mm`, cardX + 10, cardY + 60);
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
    activeMode,
    dayOfCycle,
    contraceptive,
    embryoStageIndex,
    cycleState,
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
      title="Human Reproduction & Embryogenesis Laboratory Workbench"
      subtitle="NCERT Class 12 Biology | 60 FPS Endocrine Dynamics, Fertilization & Cleavage"
      disciplineColor="#EC4899"
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
      <div className="flex flex-col bg-[#080C14]">
        {/* Interactive Mode Selector Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveMode('menstrual_cycle')}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-bold transition-all ${
                activeMode === 'menstrual_cycle'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              🩸 Menstrual Cycle & Hormones
            </button>

            <button
              onClick={() => setActiveMode('fertilization')}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-bold transition-all ${
                activeMode === 'fertilization'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              🧬 Sperm-Ovum Fertilization
            </button>

            <button
              onClick={() => setActiveMode('embryogenesis')}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-bold transition-all ${
                activeMode === 'embryogenesis'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              🔬 Cleavage & Blastocyst
            </button>

            <button
              onClick={() => setActiveMode('contraception_lab')}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-bold transition-all ${
                activeMode === 'contraception_lab'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              🛡️ Reproductive Health & Family Planning
            </button>
          </div>

          {/* Quick Sub-Controls */}
          {activeMode === 'menstrual_cycle' && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-zinc-400">Day:</span>
              <input
                type="range"
                min="1"
                max="28"
                step="0.5"
                value={dayOfCycle}
                onChange={(e) => setDayOfCycle(parseFloat(e.target.value))}
                className="w-24 sm:w-32 accent-pink-500 cursor-pointer"
              />
              <span className="font-bold text-pink-400 w-8">{Math.floor(dayOfCycle)}</span>
            </div>
          )}

          {activeMode === 'contraception_lab' && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-zinc-400">Method:</span>
              <select
                value={contraceptive}
                onChange={(e) => setContraceptive(e.target.value as ContraceptionMethod)}
                className="bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-zinc-200"
              >
                <option value="none">Natural / None</option>
                <option value="oral_combined_pill">Oral Contraceptive Pill (Blocks LH Surge)</option>
                <option value="copper_iud">Copper IUD (Spermicidal & Blocks Implantation)</option>
                <option value="barrier_condom">Barrier / Condom (Blocks Gamete Contact & STIs)</option>
              </select>
            </div>
          )}

          {activeMode === 'embryogenesis' && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <button
                onClick={() => setEmbryoStageIndex((i) => Math.max(0, i - 1))}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                ← Prev
              </button>
              <span className="text-pink-400 font-bold">Stage {embryoStageIndex + 1}/{EMBRYOGENESIS_STAGES.length}</span>
              <button
                onClick={() => setEmbryoStageIndex((i) => Math.min(EMBRYOGENESIS_STAGES.length - 1, i + 1))}
                className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* 60 FPS Canvas */}
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
            <span className="text-pink-400 font-bold">💡 NCERT Class 12:</span>
            <span>Scientific, interactive simulation of Human Reproduction & Reproductive Health. Drag sensor probe to inspect hormonal levels!</span>
          </div>
        </div>
      </div>
    </PhetWorkbench>
  );
}
