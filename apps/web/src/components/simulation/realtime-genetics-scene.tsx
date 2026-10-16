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
  solveMonohybridCross,
  solveDihybridCross,
  type MonohybridResult,
  type DihybridResult,
} from '@prismora/simulation-core';

export interface RealtimeGeneticsSceneProps {
  initialType?: 'monohybrid' | 'dihybrid';
  initialP1?: string;
  initialP2?: string;
  className?: string;
  onResultChange?: (result: MonohybridResult | DihybridResult) => void;
}

export function RealtimeGeneticsScene({
  initialType = 'monohybrid',
  initialP1 = 'Tt',
  initialP2 = 'Tt',
  className = '',
  onResultChange,
}: RealtimeGeneticsSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Cross Configuration
  const [crossType, setCrossType] = useState<'monohybrid' | 'dihybrid'>(initialType);
  const [p1Alleles, setP1Alleles] = useState<string>(initialP1);
  const [p2Alleles, setP2Alleles] = useState<string>(initialP2);

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

  // Tools in Virtual Space
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 380, y: 220 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 180,
    y1: 120,
    x2: 440,
    y2: 120,
  });
  const [activeTapeHandle, setActiveTapeHandle] = useState<'none' | 'p1' | 'p2'>('none');

  // Compute Results
  const monoResult = useMemo(() => {
    return solveMonohybridCross(p1Alleles, p2Alleles, 'Tall', 'Dwarf');
  }, [p1Alleles, p2Alleles]);

  const dihybridResult = useMemo(() => {
    return solveDihybridCross('RrYy', 'RrYy');
  }, []);

  useEffect(() => {
    if (onResultChange) {
      onResultChange(crossType === 'monohybrid' ? monoResult : dihybridResult);
    }
  }, [crossType, monoResult, dihybridResult, onResultChange]);

  // Reset
  const handleReset = useCallback(() => {
    setSimTime(0);
    setP1Alleles('Tt');
    setP2Alleles('Tt');
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

      // -------------------------------------------------------------
      // DRAW CANVAS IN VIRTUAL COORDINATES (900 x 520)
      // -------------------------------------------------------------
      const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
      applyVirtualViewport(ctx, vp, dpr);

      // Deep Dark Lab Floor
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

      if (crossType === 'monohybrid') {
        // MONOHYBRID 2x2 PUNNETT SQUARE WORKBENCH
        const pX = 140;
        const pY = 110;
        const cellSize = 130;

        ctx.save();
        // Parents banner
        ctx.fillStyle = '#1E293B';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(80, 40, 360, 42, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`Parent 1 (${p1Alleles}) × Parent 2 (${p2Alleles})`, 260, 65);

        // Header Gamete Labels (P2 columns)
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 18px JetBrains Mono, monospace';
        ctx.fillText(monoResult.gametesP2[0]!, pX + cellSize * 0.5, pY - 14);
        ctx.fillText(monoResult.gametesP2[1]!, pX + cellSize * 1.5, pY - 14);

        // Side Gamete Labels (P1 rows)
        ctx.fillText(monoResult.gametesP1[0]!, pX - 25, pY + cellSize * 0.5 + 6);
        ctx.fillText(monoResult.gametesP1[1]!, pX - 25, pY + cellSize * 1.5 + 6);

        // Grid Cells
        for (let r = 0; r < 2; r++) {
          for (let c = 0; c < 2; c++) {
            const cellX = pX + c * cellSize;
            const cellY = pY + r * cellSize;
            const genotype = monoResult.punnettGrid[r]![c]!;
            const isDominant = genotype.includes('T');

            // Cell Backdrop
            ctx.fillStyle = isDominant ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)';
            ctx.strokeStyle = isDominant ? '#10B981' : '#EF4444';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(cellX, cellY, cellSize, cellSize, 8);
            ctx.fill();
            ctx.stroke();

            // Genotype text
            ctx.fillStyle = isDominant ? '#34D399' : '#F87171';
            ctx.font = 'bold 24px JetBrains Mono, monospace';
            ctx.textAlign = 'center';
            ctx.fillText(genotype, cellX + cellSize / 2, cellY + cellSize / 2);

            // Phenotype label
            ctx.fillStyle = '#CBD5E1';
            ctx.font = 'bold 11px JetBrains Mono, monospace';
            ctx.fillText(isDominant ? 'Tall Plant' : 'Dwarf Plant', cellX + cellSize / 2, cellY + cellSize / 2 + 25);
          }
        }
        ctx.restore();

        // RIGHT PANEL: RATIO CARDS & CHI-SQUARE
        const rX = 490;
        const rY = 60;
        const rW = 340;
        const rH = 390;

        ctx.save();
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(rX, rY, rW, rH, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('MENDELIAN PHENOTYPIC & GENOTYPIC RATIOS', rX + 20, rY + 30);

        // Phenotypic Breakdown
        ctx.fillStyle = '#CBD5E1';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText('Phenotypic Ratio (F2 Generation):', rX + 20, rY + 65);

        // Bars
        const tallCount = monoResult.phenotypicRatio['Tall'] ?? 0;
        const dwarfCount = monoResult.phenotypicRatio['Dwarf'] ?? 0;

        ctx.fillStyle = '#10B981';
        ctx.fillRect(rX + 20, rY + 80, (tallCount / 4) * 280, 22);
        ctx.fillStyle = '#EF4444';
        ctx.fillRect(rX + 20, rY + 110, (dwarfCount / 4) * 280, 22);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText(`Tall: ${tallCount}/4 (${((tallCount / 4) * 100).toFixed(0)}%)`, rX + 26, rY + 95);
        ctx.fillText(`Dwarf: ${dwarfCount}/4 (${((dwarfCount / 4) * 100).toFixed(0)}%)`, rX + 26, rY + 125);

        ctx.fillStyle = '#34D399';
        ctx.font = 'bold 16px JetBrains Mono, monospace';
        ctx.fillText(`Ratio: ${tallCount} : ${dwarfCount}`, rX + 20, rY + 160);

        // Genotypic Breakdown
        ctx.fillStyle = '#CBD5E1';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.fillText('Genotypic Breakdown (TT : Tt : tt):', rX + 20, rY + 200);

        const ttCount = monoResult.genotypicRatio['TT'] ?? 0;
        const tSmallCount = monoResult.genotypicRatio['Tt'] ?? 0;
        const smallSmallCount = monoResult.genotypicRatio['tt'] ?? 0;

        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(`● Homozygous Dominant (TT): ${ttCount}/4 (25%)`, rX + 20, rY + 225);
        ctx.fillText(`● Heterozygous Carrier (Tt): ${tSmallCount}/4 (50%)`, rX + 20, rY + 245);
        ctx.fillText(`● Homozygous Recessive (tt): ${smallSmallCount}/4 (25%)`, rX + 20, rY + 265);

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 14px JetBrains Mono, monospace';
        ctx.fillText(`Genotypic Ratio = ${ttCount} : ${tSmallCount} : ${smallSmallCount}`, rX + 20, rY + 295);

        // Mendel's First Law Callout
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(rX + 15, rY + 315, rW - 30, 60, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#A7F3D0';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText('Mendel\'s Law of Segregation:', rX + 25, rY + 333);
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillText('Alleles segregate during gametogenesis; each gamete', rX + 25, rY + 348);
        ctx.fillText('receives only one allele with equal 50% probability.', rX + 25, rY + 360);
        ctx.restore();
      } else {
        // DIHYBRID 4x4 PUNNETT SQUARE WORKBENCH
        const pX = 80;
        const pY = 80;
        const cellSize = 75;

        ctx.save();
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('DIHYBRID CROSS: RrYy × RrYy (Round/Wrinkled & Yellow/Green)', pX, pY - 30);

        // Header Gametes
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        dihybridResult.gametesP2.forEach((g, idx) => {
          ctx.fillText(g, pX + idx * cellSize + cellSize / 2, pY - 10);
        });

        // Side Gametes
        dihybridResult.gametesP1.forEach((g, idx) => {
          ctx.fillText(g, pX - 20, pY + idx * cellSize + cellSize / 2 + 4);
        });

        // 4x4 Grid
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            const cellX = pX + c * cellSize;
            const cellY = pY + r * cellSize;
            const genotype = dihybridResult.punnettGrid[r]![c]!;

            const isRound = genotype.includes('R');
            const isYellow = genotype.includes('Y');

            ctx.fillStyle = isRound && isYellow ? 'rgba(234, 179, 8, 0.25)' : isRound ? 'rgba(16, 185, 129, 0.25)' : isYellow ? 'rgba(249, 115, 22, 0.25)' : 'rgba(239, 68, 68, 0.25)';
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.roundRect(cellX, cellY, cellSize, cellSize, 4);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 10px JetBrains Mono, monospace';
            ctx.fillText(genotype, cellX + cellSize / 2, cellY + cellSize / 2 + 4);
          }
        }

        // Right Dihybrid Ratio Legend
        const rX = 450;
        const rY = 70;
        ctx.fillStyle = '#0F172A';
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(rX, rY, 390, 360, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 13px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('DIHYBRID PHENOTYPIC RATIO (9 : 3 : 3 : 1)', rX + 20, rY + 30);

        const traits = [
          { name: 'Round Yellow (R_Y_)', count: 9, color: '#EAB308' },
          { name: 'Round Green (R_yy)', count: 3, color: '#10B981' },
          { name: 'Wrinkled Yellow (rrY_)', count: 3, color: '#F97316' },
          { name: 'Wrinkled Green (rryy)', count: 1, color: '#EF4444' },
        ];

        traits.forEach((t, i) => {
          const barY = rY + 60 + i * 55;
          ctx.fillStyle = '#CBD5E1';
          ctx.font = 'bold 11px JetBrains Mono, monospace';
          ctx.fillText(`${t.name}: ${t.count}/16`, rX + 20, barY);

          ctx.fillStyle = t.color;
          ctx.fillRect(rX + 20, barY + 8, (t.count / 16) * 330, 18);
        });

        // Mendel's Second Law Callout
        ctx.fillStyle = 'rgba(16, 185, 129, 0.15)';
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.roundRect(rX + 15, rY + 285, 360, 60, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#A7F3D0';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.fillText('Mendel\'s Law of Independent Assortment:', rX + 25, rY + 303);
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillText('Alleles of two different genes assort independently into', rX + 25, rY + 318);
        ctx.fillText('gametes during metaphase I of meiosis.', rX + 25, rY + 330);
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
        const tapeCm = (tapePx / 25).toFixed(1);

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

      // 8. Genetic Diagnostic Probe Tool
      if (showProbe) {
        ctx.save();
        ctx.strokeStyle = '#10B981';
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

        const cardX = Math.min(VIRTUAL_WIDTH - 190, probePos.x + 16);
        const cardY = Math.max(30, probePos.y - 55);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#10B981';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, 175, 65, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('GENETIC ALLELE PROBE', cardX + 10, cardY + 16);
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`Target Allele: ${crossType === 'monohybrid' ? 'T/t Locus' : 'R/Y Dihybrid'}`, cardX + 10, cardY + 32);
        ctx.fillText(`Dominance: Complete Dominance`, cardX + 10, cardY + 46);
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
    crossType,
    p1Alleles,
    p2Alleles,
    monoResult,
    dihybridResult,
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
      title="Mendelian Genetics & Punnett Square Laboratory"
      subtitle="NCERT Class 12 Biology: Principles of Inheritance | Monohybrid & Dihybrid Segregation"
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
      <div className="flex flex-col bg-[#080C14]">
        {/* Controls Toolbar */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCrossType('monohybrid')}
              className={`px-3 py-1 rounded font-mono text-[11px] font-bold ${
                crossType === 'monohybrid' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              Monohybrid (Tt × Tt)
            </button>
            <button
              onClick={() => setCrossType('dihybrid')}
              className={`px-3 py-1 rounded font-mono text-[11px] font-bold ${
                crossType === 'dihybrid' ? 'bg-emerald-600 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}
            >
              Dihybrid (RrYy × RrYy)
            </button>
          </div>

          {crossType === 'monohybrid' && (
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <div className="flex items-center gap-1">
                <span className="text-zinc-400">P1:</span>
                <select
                  value={p1Alleles}
                  onChange={(e) => setP1Alleles(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-200"
                >
                  <option value="TT">TT (Homozygous Tall)</option>
                  <option value="Tt">Tt (Heterozygous Tall)</option>
                  <option value="tt">tt (Homozygous Dwarf)</option>
                </select>
              </div>

              <div className="flex items-center gap-1">
                <span className="text-zinc-400">P2:</span>
                <select
                  value={p2Alleles}
                  onChange={(e) => setP2Alleles(e.target.value)}
                  className="bg-zinc-800 border border-zinc-700 rounded px-2 py-0.5 text-zinc-200"
                >
                  <option value="TT">TT (Homozygous Tall)</option>
                  <option value="Tt">Tt (Heterozygous Tall)</option>
                  <option value="tt">tt (Homozygous Dwarf)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Canvas */}
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
            <span className="text-emerald-400 font-bold">💡 NCERT Class 12:</span>
            <span>Gregor Mendel\'s Laws of Inheritance. Drag the green sensor probe into the Punnett square!</span>
          </div>
        </div>
      </div>
    </PhetWorkbench>
  );
}
