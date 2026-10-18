/**
 * Prismora Biological Sciences — Real-Time Human Reproduction & Embryogenesis Laboratory
 * NCERT Class 12 Chapters 3 & 4 Standard (Human Reproduction & Reproductive Health)
 * Benchmark: AIIMS New Delhi, IISc Bangalore & WebGL 3D Medical Visualizations
 *
 * Capabilities:
 * 1. Macro Anatomical Tract Journey: Cross-section of Female Reproductive System (Vagina, Cervix, Uterine cavity, Fallopian Tube Ampulla, Ovary) with live sperm chemotaxis & thermotaxis
 * 2. 60 FPS Microscopic Fertilization Chamber: Secondary Oocyte, Corona Radiata, Zona Pellucida, Acrosome reaction, Cortical Reaction (Ca2+ wave preventing polyspermy), and Pronucleus Syngamy (2n = 46)
 * 3. Cleavage & Blastocyst Stage Scrubber: Zygote -> 2-cell -> 4-cell -> 8-cell (Compaction) -> Morula -> Blastocyst (Trophoblast & Inner Cell Mass) -> Implantation
 * 4. Fetal Trimester Milestones: Week 4 (heart tube), Week 8 (fetus transition), Week 12 (gender differentiation), Week 24 (surfactant), Week 38 (parturition)
 * 5. Endocrine Cycle Dynamics: 28-day hormonal regulation (FSH, LH Surge, 17β-Estradiol, Progesterone)
 * 6. Reproductive Health & Family Planning: Contraceptive mechanisms (Oral pills, Copper IUD, Barrier condom)
 */

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

export type ReproductionSceneMode =
  | 'tract_journey'
  | 'fertilization'
  | 'embryogenesis'
  | 'fetal_milestones'
  | 'menstrual_cycle'
  | 'contraception_lab';

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

interface TractSpermParticle {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  tailPhase: number;
  region: 'vagina' | 'cervix' | 'uterus' | 'fallopian_tube' | 'ampulla';
}

interface FetalMilestone {
  week: number;
  title: string;
  trimester: '1st Trimester' | '2nd Trimester' | '3rd Trimester';
  crownRumpMm: number;
  keyFeatures: string;
  heartRateBpm: number;
}

const FETAL_MILESTONES: FetalMilestone[] = [
  {
    week: 4,
    title: 'Neurulation & Primitive Heart Tube',
    trimester: '1st Trimester',
    crownRumpMm: 4,
    keyFeatures: 'Neural tube closes, primitive S-shaped heart tube begins rhythmic peristaltic contractions, limb buds appear.',
    heartRateBpm: 105,
  },
  {
    week: 8,
    title: 'Embryo to Fetus Transition & Organogenesis',
    trimester: '1st Trimester',
    crownRumpMm: 30,
    keyFeatures: 'All essential internal and external structures formed. Webbed digits separate, retinal pigment visible, reflexive movements begin.',
    heartRateBpm: 165,
  },
  {
    week: 12,
    title: 'First Trimester Completion & Differentiated Genitalia',
    trimester: '1st Trimester',
    crownRumpMm: 75,
    keyFeatures: 'External genitalia distinctly differentiated (male/female). Kidneys produce amniotic fluid/urine, fingernails form.',
    heartRateBpm: 155,
  },
  {
    week: 24,
    title: 'Viability Milestone & Pulmonary Alveoli Surfactant',
    trimester: '2nd Trimester',
    crownRumpMm: 210,
    keyFeatures: 'Threshold of extrauterine viability reached. Type II pneumocytes initiate pulmonary surfactant production, auditory hearing functional.',
    heartRateBpm: 140,
  },
  {
    week: 38,
    title: 'Full Term Fetus Ready for Parturition',
    trimester: '3rd Trimester',
    crownRumpMm: 360,
    keyFeatures: 'Full lung maturity, protective vernix caseosa & subcutaneous fat depot, cephalic presentation ready for oxytocin labor contractions.',
    heartRateBpm: 130,
  },
];

export function RealtimeReproductionScene({
  initialMode = 'fertilization', // Default to visually captivating fertilization chamber
  initialDay = 14,
  initialContraception = 'none',
  className = '',
  onStateChange,
}: RealtimeReproductionSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Active Mode & Stage State
  const [activeMode, setActiveMode] = useState<ReproductionSceneMode>(initialMode);
  const [dayOfCycle, setDayOfCycle] = useState<number>(initialDay);
  const [contraceptive, setContraceptive] = useState<ContraceptionMethod>(initialContraception);
  const [embryoStageIndex, setEmbryoStageIndex] = useState<number>(0);
  const [fetalMilestoneIndex, setFetalMilestoneIndex] = useState<number>(1);

  // Playback & Animation
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);

  // Camera & Tools
  const [userZoom, setUserZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [showStopwatch, setShowStopwatch] = useState<boolean>(false);
  const [showProbe, setShowProbe] = useState<boolean>(true);
  const [showVectors, setShowVectors] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(false);

  // Virtual Coordinates tools
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 450, y: 140 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  // Sperm particles in Fertilization Microscopic View
  const spermRef = useRef<SpermParticle[]>([]);
  const caWaveRadiusRef = useRef<number>(0);
  const fertilizationCompletedRef = useRef<boolean>(false);

  // Tract Sperm particles for Macro Insemination Journey
  const tractSpermRef = useRef<TractSpermParticle[]>([]);

  // Cycle State
  const cycleState = useMemo(() => {
    return calculateMenstrualCycleState(dayOfCycle, contraceptive);
  }, [dayOfCycle, contraceptive]);

  useEffect(() => {
    if (onStateChange) onStateChange(cycleState);
  }, [cycleState, onStateChange]);

  // Initialize Microscopic Sperm Particles for Fertilization Chamber
  const initMicroSperm = useCallback(() => {
    const list: SpermParticle[] = [];
    const count = contraceptive === 'barrier_condom' ? 0 : contraceptive === 'copper_iud' ? 8 : 45;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 160 + Math.random() * 110;
      list.push({
        x: 450 + Math.cos(angle) * dist,
        y: 250 + Math.sin(angle) * dist,
        vx: 0,
        vy: 0,
        tailPhase: Math.random() * Math.PI * 2,
        capacitated: Math.random() < 0.85,
        boundToZona: false,
      });
    }
    spermRef.current = list;
    caWaveRadiusRef.current = 0;
    fertilizationCompletedRef.current = false;
  }, [contraceptive]);

  // Initialize Macro Tract Sperm Particles (Swimming Vagina -> Cervix -> Uterus -> Ampulla)
  const initTractSperm = useCallback(() => {
    const list: TractSpermParticle[] = [];
    const count = contraceptive === 'barrier_condom' ? 0 : contraceptive === 'copper_iud' ? 10 : 80;
    for (let i = 0; i < count; i++) {
      list.push({
        x: 430 + (Math.random() - 0.5) * 40,
        y: 440 + Math.random() * 40, // deposited in upper vagina
        targetX: 200 + Math.random() * 80, // swimming toward left or right ampulla
        targetY: 170 + Math.random() * 40,
        speed: 0.6 + Math.random() * 0.8,
        tailPhase: Math.random() * Math.PI * 2,
        region: 'vagina',
      });
    }
    tractSpermRef.current = list;
  }, [contraceptive]);

  useEffect(() => {
    initMicroSperm();
    initTractSperm();
  }, [initMicroSperm, initTractSperm]);

  // Main 60 FPS Biological Canvas Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);

      // Clear Canvas Background (Deep Medical Navy/Black)
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#070B14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Apply Virtual Coordinate System (900 x 520)
      ctx.save();
      applyVirtualViewport(ctx, vp);

      if (isPlaying) {
        setSimTime((t) => t + dt * playbackSpeed);
      }

      // =========================================================================
      // 1. MACRO ANATOMICAL TRACT JOURNEY (VAGINA -> CERVIX -> UTERUS -> AMPULLA)
      // =========================================================================
      if (activeMode === 'tract_journey') {
        // Draw Anatomical Female Reproductive Tract Cross-Section
        ctx.save();

        // Uterine Myometrium & Outer Muscle Wall
        ctx.fillStyle = '#1E1528';
        ctx.strokeStyle = '#382245';
        ctx.lineWidth = 4;
        ctx.beginPath();
        // Vagina
        ctx.moveTo(410, 500);
        ctx.lineTo(410, 420);
        // Cervix constriction
        ctx.lineTo(425, 380);
        // Uterine triangular body
        ctx.lineTo(330, 260);
        // Left Fallopian Tube
        ctx.bezierCurveTo(240, 240, 160, 200, 150, 170);
        // Left Infundibulum & Fimbriae
        ctx.lineTo(130, 190);
        ctx.lineTo(150, 210);
        // Left Ovary
        ctx.bezierCurveTo(180, 230, 280, 270, 360, 290);
        // Right Fallopian Tube
        ctx.lineTo(540, 290);
        ctx.bezierCurveTo(620, 270, 720, 230, 750, 210);
        ctx.lineTo(770, 190);
        ctx.lineTo(750, 170);
        ctx.bezierCurveTo(740, 200, 660, 240, 570, 260);
        // Right Cervix
        ctx.lineTo(475, 380);
        ctx.lineTo(490, 420);
        ctx.lineTo(490, 500);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Endometrial Vascular Lining (Rose Glow)
        ctx.fillStyle = '#4A1D2F';
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(430, 380);
        ctx.lineTo(360, 280);
        ctx.lineTo(450, 250); // Uterine Fundus
        ctx.lineTo(540, 280);
        ctx.lineTo(470, 380);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Left & Right Ovaries (Releasing Ovum)
        ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        // Left Ovary
        ctx.beginPath();
        ctx.ellipse(140, 230, 28, 18, -Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Right Ovary
        ctx.beginPath();
        ctx.ellipse(760, 230, 28, 18, Math.PI / 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Ovulated Secondary Oocyte waiting in Left Ampulla
        const ovumAmpX = 180;
        const ovumAmpY = 180;
        ctx.fillStyle = '#F43F5E';
        ctx.strokeStyle = '#FDA4AF';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(ovumAmpX, ovumAmpY, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Corona Radiata glow around Ovum in Ampulla
        ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
        ctx.beginPath();
        ctx.arc(ovumAmpX, ovumAmpY, 22, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('OVUM IN AMPULLA', ovumAmpX, ovumAmpY - 26);

        // Chemotaxis Progesterone Diffusion Waves (expanding from left ovary/ampulla)
        if (showVectors) {
          ctx.strokeStyle = 'rgba(236, 72, 153, 0.25)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([6, 6]);
          for (let r = 40; r <= 220; r += 45) {
            ctx.beginPath();
            ctx.arc(ovumAmpX, ovumAmpY, (r + simTime * 20) % 240, 0, Math.PI * 2);
            ctx.stroke();
          }
          ctx.setLineDash([]);
        }

        // Animate Tract Sperm Particles
        if (isPlaying) {
          tractSpermRef.current.forEach((s) => {
            s.tailPhase += 0.35;
            // Guide sperm toward Left Ampulla target
            const dx = s.targetX - s.x;
            const dy = s.targetY - s.y;
            const dist = Math.hypot(dx, dy);

            if (dist > 8) {
              s.x += (dx / dist) * s.speed;
              s.y += (dy / dist) * s.speed;
            } else {
              // Reached ampulla - circle around
              s.x += (Math.random() - 0.5) * 2;
              s.y += (Math.random() - 0.5) * 2;
            }
          });
        }

        // Render Swimming Sperm Swarm
        tractSpermRef.current.forEach((s) => {
          ctx.save();
          const angle = Math.atan2(s.targetY - s.y, s.targetX - s.x);
          ctx.translate(s.x, s.y);
          ctx.rotate(angle);

          // Sperm head (White oval)
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.ellipse(0, 0, 4, 2.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Undulating Flagellar Tail
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(-4, 0);
          for (let tx = -4; tx >= -18; tx -= 3) {
            const ty = Math.sin(s.tailPhase + tx * 0.4) * 2.5;
            ctx.lineTo(tx, ty);
          }
          ctx.stroke();
          ctx.restore();
        });

        // Anatomical Region Annotations
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('1. Vagina (Insemination Pool: 200-300M Sperm)', 45, 470);
        ctx.fillText('2. Cervical Canal (Mucus Filtration & Crypts)', 45, 410);
        ctx.fillText('3. Uterine Cavity (Capacitation & Myometrial Peristalsis)', 45, 320);
        ctx.fillText('4. Fallopian Tube Ampulla (Fertilization Site)', 45, 140);
        ctx.restore();
      }

      // =========================================================================
      // 2. 60 FPS MICROSCOPIC FERTILIZATION CHAMBER (AMPULLARY-ISTHMIC JUNCTION)
      // =========================================================================
      if (activeMode === 'fertilization') {
        const ovumX = 450;
        const ovumY = 245;
        const ovumR = 65;
        const zonaR = 88;
        const coronaR = 130;

        ctx.save();

        // 1. Corona Radiata Follicular Cells (Golden Protective Cluster)
        for (let a = 0; a < Math.PI * 2; a += 0.18) {
          const distOffset = Math.sin(a * 5 + simTime) * 8;
          const cx = ovumX + Math.cos(a) * (coronaR - 8 + distOffset);
          const cy = ovumY + Math.sin(a) * (coronaR - 8 + distOffset);

          ctx.fillStyle = 'rgba(251, 191, 36, 0.25)';
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(cx, cy, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Cell Nucleus
          ctx.fillStyle = '#D97706';
          ctx.beginPath();
          ctx.arc(cx, cy, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // 2. Zona Pellucida Glycoprotein Shell (ZP1, ZP2, ZP3)
        const zpGrad = ctx.createRadialGradient(ovumX, ovumY, ovumR, ovumX, ovumY, zonaR);
        zpGrad.addColorStop(0, 'rgba(56, 189, 248, 0.1)');
        zpGrad.addColorStop(1, fertilizationCompletedRef.current ? 'rgba(16, 185, 129, 0.4)' : 'rgba(56, 189, 248, 0.35)');
        ctx.fillStyle = zpGrad;
        ctx.strokeStyle = fertilizationCompletedRef.current ? '#10B981' : '#38BDF8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(ovumX, ovumY, zonaR, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Cortical Reaction Calcium (Ca2+) Wave Animation
        if (caWaveRadiusRef.current > 0) {
          ctx.strokeStyle = '#34D399';
          ctx.lineWidth = 5;
          ctx.shadowColor = '#34D399';
          ctx.shadowBlur = 15;
          ctx.beginPath();
          ctx.arc(ovumX, ovumY, caWaveRadiusRef.current, 0, Math.PI * 2);
          ctx.stroke();
          ctx.shadowBlur = 0;
        }

        // 3. Perivitelline Space with First Polar Body (Haploid n=23)
        ctx.fillStyle = '#F472B6';
        ctx.strokeStyle = '#DB2777';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(ovumX + ovumR * 0.72, ovumY - ovumR * 0.5, 9, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#831843';
        ctx.font = 'bold 7px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('1st PB', ovumX + ovumR * 0.72, ovumY - ovumR * 0.5 + 2);

        // 4. Ooplasm (Nutrient-rich Cytoplasm of Secondary Oocyte)
        const ooplasmGrad = ctx.createRadialGradient(ovumX, ovumY, 10, ovumX, ovumY, ovumR);
        ooplasmGrad.addColorStop(0, '#FDA4AF');
        ooplasmGrad.addColorStop(0.8, '#F43F5E');
        ooplasmGrad.addColorStop(1, '#E11D48');
        ctx.fillStyle = ooplasmGrad;
        ctx.beginPath();
        ctx.arc(ovumX, ovumY, ovumR, 0, Math.PI * 2);
        ctx.fill();

        // Female Pronucleus (Haploid 23, X)
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.strokeStyle = '#9F1239';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ovumX - 16, ovumY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#881337';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('♀ 23,X', ovumX - 16, ovumY + 3);

        // Male Pronucleus (Haploid 23, Y or 23, X)
        if (fertilizationCompletedRef.current) {
          ctx.fillStyle = 'rgba(186, 230, 253, 0.9)';
          ctx.strokeStyle = '#0284C7';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(ovumX + 16, ovumY, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#0369A1';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.fillText('♂ 23,Y', ovumX + 16, ovumY + 3);

          // Syngamy Center Fusion Glow
          ctx.fillStyle = '#FACC15';
          ctx.beginPath();
          ctx.arc(ovumX, ovumY, 6, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. Motile Sperm Cells with Sine-Wave Flagellar Undulation
        spermRef.current.forEach((s) => {
          if (isPlaying) {
            s.tailPhase += 0.45;

            // Move toward egg center
            const dx = ovumX - s.x;
            const dy = ovumY - s.y;
            const dist = Math.hypot(dx, dy);

            if (!s.boundToZona) {
              if (dist > zonaR + 4) {
                s.vx = (dx / dist) * 1.4;
                s.vy = (dy / dist) * 1.4;
                s.x += s.vx;
                s.y += s.vy;
              } else {
                // Docked on Zona Pellucida
                s.boundToZona = true;
                if (!fertilizationCompletedRef.current) {
                  fertilizationCompletedRef.current = true;
                  caWaveRadiusRef.current = ovumR;
                }
              }
            }
          }

          // Render Individual Sperm
          ctx.save();
          const angle = Math.atan2(s.vy, s.vx);
          ctx.translate(s.x, s.y);
          ctx.rotate(angle);

          // Head with Acrosome Cap
          ctx.fillStyle = s.capacitated ? '#FFFFFF' : '#94A3B8';
          ctx.beginPath();
          ctx.ellipse(0, 0, 5.5, 3.2, 0, 0, Math.PI * 2);
          ctx.fill();

          // Acrosome Cap (releases Hyaluronidase & Acrosin)
          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(3, 0, 2.5, -Math.PI / 2, Math.PI / 2);
          ctx.fill();

          // Long Flagellar Tail (Sine wave)
          ctx.strokeStyle = '#E2E8F0';
          ctx.lineWidth = 1.4;
          ctx.beginPath();
          ctx.moveTo(-5.5, 0);
          for (let tx = -5.5; tx >= -32; tx -= 3) {
            const ty = Math.sin(s.tailPhase + tx * 0.35) * 3.8;
            ctx.lineTo(tx, ty);
          }
          ctx.stroke();
          ctx.restore();
        });

        // Expand Ca2+ Wave
        if (caWaveRadiusRef.current > 0 && caWaveRadiusRef.current < zonaR + 10) {
          caWaveRadiusRef.current += 1.5;
        }

        // Telemetry HUD Card
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(40, 40, 290, 125, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#EC4899';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('FERTILIZATION KINETICS (AMPULLA)', 55, 62);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`Motile Sperm at Site: ${spermRef.current.length} cells`, 55, 82);
        ctx.fillText(`Acrosome Reaction: ${fertilizationCompletedRef.current ? 'ACTIVE (Acrosin Released)' : 'INDUCING'}`, 55, 98);
        ctx.fillText(`Cortical Reaction: ${fertilizationCompletedRef.current ? 'SLOW BLOCK ACTIVATED' : 'READY'}`, 55, 114);
        ctx.fillText(`Diploid Karyogamy: ${fertilizationCompletedRef.current ? '2n = 46, XY RESTORED' : 'PENDING'}`, 55, 130);
        ctx.fillText(`Polyspermy Block: ${fertilizationCompletedRef.current ? 'ZP2 HARDENED (100% BLOCKED)' : 'MONITORING'}`, 55, 146);

        ctx.restore();
      }

      // =========================================================================
      // 3. CLEAVAGE & BLASTOCYST TIMELINE (DAY 1 TO 7)
      // =========================================================================
      if (activeMode === 'embryogenesis') {
        const curStage = EMBRYOGENESIS_STAGES[embryoStageIndex]!;
        const emX = 450;
        const emY = 230;
        const emR = 95;

        ctx.save();

        // Zona Pellucida (sheds during hatching blastocyst)
        const isHatched = embryoStageIndex >= 6;
        if (!isHatched) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.arc(emX, emY, emR + 10, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Render Blastomeres according to stage
        ctx.fillStyle = 'rgba(236, 72, 153, 0.4)';
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 2.5;

        if (curStage.cellCount === 1) {
          // Zygote
          ctx.beginPath();
          ctx.arc(emX, emY, emR, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          // Nuclei
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(emX - 10, emY, 12, 0, Math.PI * 2);
          ctx.arc(emX + 10, emY, 12, 0, Math.PI * 2);
          ctx.fill();
        } else if (curStage.cellCount === 2) {
          // 2-cell
          ctx.beginPath();
          ctx.arc(emX - 42, emY, emR * 0.55, 0, Math.PI * 2);
          ctx.arc(emX + 42, emY, emR * 0.55, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (curStage.cellCount === 4) {
          // 4-cell
          ctx.beginPath();
          ctx.arc(emX - 38, emY - 38, emR * 0.44, 0, Math.PI * 2);
          ctx.arc(emX + 38, emY - 38, emR * 0.44, 0, Math.PI * 2);
          ctx.arc(emX - 38, emY + 38, emR * 0.44, 0, Math.PI * 2);
          ctx.arc(emX + 38, emY + 38, emR * 0.44, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else if (curStage.cellCount <= 16) {
          // Morula (mulberry appearance)
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
            ctx.beginPath();
            ctx.arc(emX + Math.cos(a) * 45, emY + Math.sin(a) * 45, 24, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }
          ctx.beginPath();
          ctx.arc(emX, emY, 28, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        } else {
          // Blastocyst: Trophoblast + Inner Cell Mass + Blastocoel
          // Trophoblast Outer Epithelial Rim
          ctx.fillStyle = 'rgba(56, 189, 248, 0.3)';
          ctx.strokeStyle = '#38BDF8';
          for (let a = 0; a < Math.PI * 2; a += 0.2) {
            ctx.beginPath();
            ctx.arc(emX + Math.cos(a) * (emR - 8), emY + Math.sin(a) * (emR - 8), 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }

          // Inner Cell Mass (Embryoblast / Pluripotent Stem Cells)
          ctx.fillStyle = '#F59E0B';
          ctx.strokeStyle = '#D97706';
          for (let i = 0; i < 12; i++) {
            const ix = emX - 45 + (i % 4) * 16;
            const iy = emY - 45 + Math.floor(i / 4) * 16;
            ctx.beginPath();
            ctx.arc(ix, iy, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
          }

          // Blastocoel Fluid Cavity
          ctx.fillStyle = 'rgba(14, 165, 233, 0.15)';
          ctx.beginPath();
          ctx.arc(emX + 20, emY + 20, 40, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#CBD5E1';
          ctx.font = 'bold 9px JetBrains Mono, monospace';
          ctx.textAlign = 'left';
          ctx.fillText('Inner Cell Mass (ICM - Embryo)', emX - 95, emY - 60);
          ctx.fillText('Fluid-filled Blastocoel', emX - 10, emY + 30);
          ctx.fillText('Outer Trophoblast (Placenta)', emX + 20, emY - 95);
        }

        // Stage Description Banner
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(80, 400, 740, 85, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`STAGE ${embryoStageIndex + 1}: ${curStage.stageName.toUpperCase()}`, 100, 424);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(
          `Time: ${curStage.hoursPostFertilization}h post-fertilization | Cell Count: ${curStage.cellCount} | Site: ${curStage.anatomicalLocation.replace(/_/g, ' ').toUpperCase()}`,
          100,
          442
        );
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(curStage.description, 100, 462);
        ctx.restore();
      }

      // =========================================================================
      // 4. FETAL MILESTONES (WEEK 4 TO 38 TRIMESTERS)
      // =========================================================================
      if (activeMode === 'fetal_milestones') {
        const ms = FETAL_MILESTONES[fetalMilestoneIndex]!;

        ctx.save();
        // Central Fetal Presentation Card
        const fetX = 450;
        const fetY = 220;

        // Amniotic Sac & Fluid
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(fetX, fetY, 140, 110, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Render Fetal Silhouette / Organogenesis representation
        ctx.fillStyle = '#FDA4AF';
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2.5;

        // Fetal C-shaped curve
        ctx.beginPath();
        ctx.arc(fetX - 20, fetY - 30, Math.min(50, 15 + ms.week * 0.9), 0, Math.PI * 2); // Head
        ctx.fill();
        ctx.stroke();

        // Beating Heart Indicator
        const heartPulse = 1.0 + Math.sin(simTime * (ms.heartRateBpm / 20)) * 0.15;
        ctx.fillStyle = '#EF4444';
        ctx.beginPath();
        ctx.arc(fetX, fetY, 10 * heartPulse, 0, Math.PI * 2);
        ctx.fill();

        // Fetal Body Trunk
        ctx.fillStyle = '#FECDD3';
        ctx.beginPath();
        ctx.ellipse(fetX + 10, fetY + 20, Math.min(55, 12 + ms.week * 1.1), Math.min(35, 10 + ms.week * 0.7), Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Umbilical Cord
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(fetX + 15, fetY + 25);
        ctx.bezierCurveTo(fetX + 60, fetY + 60, fetX + 90, fetY + 30, fetX + 130, fetY + 40);
        ctx.stroke();

        // Placental Attachment Plate
        ctx.fillStyle = '#881337';
        ctx.beginPath();
        ctx.arc(fetX + 130, fetY + 40, 25, -Math.PI / 2, Math.PI / 2);
        ctx.fill();

        // Telemetry HUD for Fetal Metrics
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(80, 390, 740, 95, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#EC4899';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`WEEK ${ms.week}: ${ms.title.toUpperCase()} (${ms.trimester.toUpperCase()})`, 100, 414);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(
          `Crown-Rump Length (CRL): ${ms.crownRumpMm} mm | Fetal Heart Rate: ${ms.heartRateBpm} BPM (Doppler)`,
          100,
          432
        );
        ctx.fillStyle = '#94A3B8';
        ctx.fillText(ms.keyFeatures, 100, 452);
        ctx.restore();
      }

      // =========================================================================
      // 5. ENDOCRINE CYCLE DYNAMICS (28-DAY HORMONAL CURVES)
      // =========================================================================
      if (activeMode === 'menstrual_cycle' || activeMode === 'contraception_lab') {
        const curDay = Math.floor(dayOfCycle);
        const curState = calculateMenstrualCycleState(dayOfCycle, contraceptive);

        const gX = 80;
        const gY = 40;
        const gW = 740;
        const gH = 180;

        ctx.save();
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(gX - 10, gY - 15, gW + 20, gH + 30, 8);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#020617';
        ctx.fillRect(gX, gY, gW, gH);

        // Days 1-28
        for (let d = 1; d <= 28; d++) {
          const px = gX + ((d - 1) / 27) * gW;
          if (d === 1 || d === 5 || d === 14 || d === 21 || d === 28) {
            ctx.fillStyle = d === 14 ? '#EC4899' : '#94A3B8';
            ctx.font = 'bold 9px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(`D${d}`, px, gY + gH + 12);
          }
        }

        // Curves: LH, FSH, Estrogen, Progesterone
        const plotCurve = (calcVal: (d: number) => number, maxVal: number, color: string) => {
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let d = 1; d <= 28; d += 0.5) {
            const val = calcVal(d);
            const cx = gX + ((d - 1) / 27) * gW;
            const cy = gY + gH - (val / maxVal) * gH * 0.92;
            if (d === 1) ctx.moveTo(cx, cy);
            else ctx.lineTo(cx, cy);
          }
          ctx.stroke();
        };

        plotCurve((d) => calculateMenstrualCycleState(d, contraceptive).lhMiuMl, 80, '#F59E0B');
        plotCurve((d) => calculateMenstrualCycleState(d, contraceptive).fshMiuMl, 80, '#38BDF8');
        plotCurve((d) => calculateMenstrualCycleState(d, contraceptive).estradiolPgMl, 350, '#EC4899');
        plotCurve((d) => calculateMenstrualCycleState(d, contraceptive).progesteroneNgMl, 20, '#10B981');

        // Day Cursor
        const curPx = gX + ((dayOfCycle - 1) / 27) * gW;
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(curPx, gY);
        ctx.lineTo(curPx, gY + gH);
        ctx.stroke();

        // Legend
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#F59E0B';
        ctx.fillText(`● LH: ${curState.lhMiuMl} mIU/mL`, gX + 10, gY + 18);
        ctx.fillStyle = '#38BDF8';
        ctx.fillText(`● FSH: ${curState.fshMiuMl} mIU/mL`, gX + 160, gY + 18);
        ctx.fillStyle = '#EC4899';
        ctx.fillText(`● Estrogen: ${curState.estradiolPgMl} pg/mL`, gX + 310, gY + 18);
        ctx.fillStyle = '#10B981';
        ctx.fillText(`● Progesterone: ${curState.progesteroneNgMl} ng/mL`, gX + 480, gY + 18);

        // Lower Histology Panel
        const bY = 275;
        const bH = 175;
        ctx.fillStyle = '#0F172A';
        ctx.beginPath();
        ctx.roundRect(gX - 10, bY, gW + 20, bH, 8);
        ctx.fill();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText(`ENDOMETRIAL HISTOLOGY | Day ${curDay}/28 | Phase: ${curState.phase.toUpperCase()}`, gX + 15, bY + 24);
        ctx.fillText(`Thickness: ${curState.endometrialThicknessMm} mm | BBT: ${curState.basalBodyTempC} °C | Fertile: ${curState.fertileWindow ? 'YES' : 'NO'}`, gX + 15, bY + 42);

        // Endometrial layer fill
        const endoH = (curState.endometrialThicknessMm / 14) * 90;
        ctx.fillStyle = '#F43F5E';
        ctx.fillRect(gX + 15, bY + 150 - endoH, gW - 30, endoH);
        ctx.restore();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    activeMode,
    dayOfCycle,
    contraceptive,
    embryoStageIndex,
    fetalMilestoneIndex,
    isPlaying,
    playbackSpeed,
    simTime,
    showVectors,
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

  return (
    <PhetWorkbench
      title="Human Reproduction & Embryogenesis Laboratory"
      subtitle="NCERT Class 12 Biology (Ch 3 & 4) | Insemination, 60 FPS Fertilization, Cleavage & Trimesters"
      disciplineColor="#EC4899"
      isPlaying={isPlaying}
      playbackSpeed={playbackSpeed}
      simTime={simTime}
      onPlayPause={() => setIsPlaying(!isPlaying)}
      onReset={() => {
        initMicroSperm();
        initTractSperm();
        caWaveRadiusRef.current = 0;
        fertilizationCompletedRef.current = false;
      }}
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
      <div className="flex flex-col bg-[#070B14]">
        {/* Living Simulation Mode Selector Ribbon */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => setActiveMode('fertilization')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'fertilization'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🔬 Ampulla Fertilization (60 FPS)
            </button>

            <button
              onClick={() => setActiveMode('tract_journey')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'tract_journey'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🤰 Full Reproductive Tract Journey
            </button>

            <button
              onClick={() => setActiveMode('embryogenesis')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'embryogenesis'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🌱 Cleavage & Blastocyst (Day 1 - 7)
            </button>

            <button
              onClick={() => setActiveMode('fetal_milestones')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'fetal_milestones'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              👶 Fetal Milestones (Wk 4 - 38)
            </button>

            <button
              onClick={() => setActiveMode('menstrual_cycle')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'menstrual_cycle'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              📊 Endocrine Curves (LH/FSH)
            </button>

            <button
              onClick={() => setActiveMode('contraception_lab')}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeMode === 'contraception_lab'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              🛡️ Reproductive Health
            </button>
          </div>

          {/* Quick Interactive Stage Controls */}
          {activeMode === 'fertilization' && (
            <div className="flex items-center gap-2">
              <button
                onClick={initMicroSperm}
                className="px-2.5 py-1 rounded bg-pink-700 hover:bg-pink-600 text-white font-mono text-[11px] font-bold"
              >
                + Insemination Pulse (Add Sperm)
              </button>
            </div>
          )}

          {activeMode === 'embryogenesis' && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <button
                onClick={() => setEmbryoStageIndex((i) => Math.max(0, i - 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                ← Prev Stage
              </button>
              <span className="text-pink-400 font-bold">
                Stage {embryoStageIndex + 1}/{EMBRYOGENESIS_STAGES.length}
              </span>
              <button
                onClick={() => setEmbryoStageIndex((i) => Math.min(EMBRYOGENESIS_STAGES.length - 1, i + 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Next Stage →
              </button>
            </div>
          )}

          {activeMode === 'fetal_milestones' && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <button
                onClick={() => setFetalMilestoneIndex((i) => Math.max(0, i - 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                ← Prev Week
              </button>
              <span className="text-pink-400 font-bold">
                Week {FETAL_MILESTONES[fetalMilestoneIndex]?.week}
              </span>
              <button
                onClick={() => setFetalMilestoneIndex((i) => Math.min(FETAL_MILESTONES.length - 1, i + 1))}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200"
              >
                Next Week →
              </button>
            </div>
          )}

          {activeMode === 'menstrual_cycle' && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="text-slate-400">Day:</span>
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
              <span className="text-slate-400">Method:</span>
              <select
                value={contraceptive}
                onChange={(e) => setContraceptive(e.target.value as ContraceptionMethod)}
                className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200"
              >
                <option value="none">Natural / None</option>
                <option value="oral_combined_pill">Oral Contraceptive Pill (Blocks LH Surge)</option>
                <option value="copper_iud">Copper IUD (Spermicidal & Blocks Implantation)</option>
                <option value="barrier_condom">Barrier / Condom (Blocks Gamete Contact & STIs)</option>
              </select>
            </div>
          )}
        </div>

        {/* 60 FPS Living Canvas */}
        <div
          ref={containerRef}
          className="relative w-full h-[440px] sm:h-[520px] bg-[#070B14] select-none touch-none"
        >
          <canvas ref={canvasRef} className="w-full h-full block" />

          {/* Bottom Callout Banner */}
          <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] font-mono text-slate-400 bg-slate-900/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="text-pink-400 font-bold">💡 NCERT Class 12 Reproduction:</span>
            <span>
              Real-time biophysical simulation of human gamete motility, cortical reaction slow block to polyspermy, and embryonic cleavage. No social taboos — pure biological science.
            </span>
          </div>
        </div>
      </div>
    </PhetWorkbench>
  );
}
