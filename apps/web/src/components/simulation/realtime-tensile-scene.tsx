'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PhetWorkbench } from './phet-workbench';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  computeViewport,
  applyVirtualViewport,
} from './viewport-helper';

export interface RealtimeTensileSceneProps {
  materialName: string;
  gaugeLengthMm: number;
  gaugeDiameterMm: number;
  yieldStrengthMpa: number;
  ultimateStrengthMpa: number;
  elasticModulusGpa: number;
  fractureStrainPct: number;
  className?: string;
  onSampleChange?: (sample: {
    strain: number;
    stressMpa: number;
    forceKn: number;
    elongationMm: number;
    isYielded: boolean;
    isFractured: boolean;
  }) => void;
}

export function RealtimeTensileScene({
  materialName,
  gaugeLengthMm,
  gaugeDiameterMm,
  yieldStrengthMpa,
  ultimateStrengthMpa,
  elasticModulusGpa,
  fractureStrainPct,
  className = '',
  onSampleChange,
}: RealtimeTensileSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Test State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [simTime, setSimTime] = useState<number>(0);
  const [isFractured, setIsFractured] = useState<boolean>(false);

  // Camera
  const [userZoom, setUserZoom] = useState<number>(1.0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Tools
  const [showStopwatch, setShowStopwatch] = useState<boolean>(false);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  const testRef = useRef<{
    strain: number;
    crossheadY: number;
    isFractured: boolean;
    stressStrainHistory: Array<{ strain: number; stress: number }>;
  }>({
    strain: 0,
    crossheadY: 0,
    isFractured: false,
    stressStrainHistory: [{ strain: 0, stress: 0 }],
  });

  const handleReset = useCallback(() => {
    testRef.current.strain = 0;
    testRef.current.crossheadY = 0;
    testRef.current.isFractured = false;
    testRef.current.stressStrainHistory = [{ strain: 0, stress: 0 }];
    setIsFractured(false);
    setIsPlaying(false);
    setSimTime(0);
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
      const t = testRef.current;

      if (isPlaying && !t.isFractured) {
        setSimTime((time) => time + dt);
        const strainRate = 0.018 * dt;
        t.strain += strainRate;

        const maxStrain = fractureStrainPct / 100;
        if (t.strain >= maxStrain) {
          t.strain = maxStrain;
          t.isFractured = true;
          setIsFractured(true);
          setIsPlaying(false);
        }

        const yieldStrain = yieldStrengthMpa / (elasticModulusGpa * 1000);
        let stress = 0;
        if (t.strain <= yieldStrain) {
          stress = t.strain * elasticModulusGpa * 1000;
        } else {
          const plasticStrain = t.strain - yieldStrain;
          const hardening =
            (ultimateStrengthMpa - yieldStrengthMpa) *
            Math.pow(plasticStrain / (maxStrain - yieldStrain), 0.35);
          stress = yieldStrengthMpa + hardening;

          const neckThreshold = yieldStrain + 0.6 * (maxStrain - yieldStrain);
          if (t.strain > neckThreshold) {
            const drop = (t.strain - neckThreshold) / (maxStrain - neckThreshold);
            stress -= (ultimateStrengthMpa - yieldStrengthMpa) * 0.45 * drop;
          }
        }

        t.stressStrainHistory.push({ strain: t.strain, stress });
        if (t.stressStrainHistory.length > 500) t.stressStrainHistory.shift();

        const areaMm2 = Math.PI * Math.pow(gaugeDiameterMm / 2, 2);
        const forceKn = (stress * areaMm2) / 1000;
        const elongationMm = t.strain * gaugeLengthMm;

        if (onSampleChange) {
          onSampleChange({
            strain: t.strain,
            stressMpa: stress,
            forceKn,
            elongationMm,
            isYielded: t.strain > yieldStrain,
            isFractured: t.isFractured,
          });
        }
      }

      // -------------------------------------------------------------
      // DRAW CANVAS (Virtual Viewport: 900 x 520)
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

      // Left: UTM Machine (x: 40 to 420)
      // Right: Live Graph (x: 450 to 860)
      const colX1 = 110;
      const colX2 = 350;
      const basePlateY = 440;
      const topPlateY = 70;
      const centerMachineX = (colX1 + colX2) / 2;

      // Base
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(colX1 - 30, basePlateY, colX2 - colX1 + 60, 30);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(colX1 - 30, basePlateY, colX2 - colX1 + 60, 30);

      // Top plate
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(colX1 - 30, topPlateY - 25, colX2 - colX1 + 60, 25);
      ctx.strokeRect(colX1 - 30, topPlateY - 25, colX2 - colX1 + 60, 25);

      // Columns
      [colX1, colX2].forEach((cx) => {
        const colGrad = ctx.createLinearGradient(cx - 9, 0, cx + 9, 0);
        colGrad.addColorStop(0, '#64748B');
        colGrad.addColorStop(0.5, '#F1F5F9');
        colGrad.addColorStop(1, '#475569');
        ctx.fillStyle = colGrad;
        ctx.fillRect(cx - 9, topPlateY, 18, basePlateY - topPlateY);
      });

      // Motorized Crosshead
      const elongationPx = t.strain * 70;
      const crossheadY = 190 - elongationPx;

      ctx.save();
      const crossheadGrad = ctx.createLinearGradient(0, crossheadY - 18, 0, crossheadY + 18);
      crossheadGrad.addColorStop(0, '#334155');
      crossheadGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = crossheadGrad;
      ctx.fillRect(colX1 - 15, crossheadY - 18, colX2 - colX1 + 30, 36);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.strokeRect(colX1 - 15, crossheadY - 18, colX2 - colX1 + 30, 36);
      ctx.restore();

      // Lower Stationary Grip
      const lowerGripY = 340;
      const gripW = 44;
      const gripH = 34;

      ctx.fillStyle = '#475569';
      ctx.fillRect(centerMachineX - gripW / 2, lowerGripY, gripW, gripH);
      ctx.strokeRect(centerMachineX - gripW / 2, lowerGripY, gripW, gripH);

      // Upper Moving Grip
      const upperGripY = crossheadY + 18;
      ctx.fillStyle = '#475569';
      ctx.fillRect(centerMachineX - gripW / 2, upperGripY, gripW, gripH);
      ctx.strokeRect(centerMachineX - gripW / 2, upperGripY, gripW, gripH);

      // Dogbone Specimen
      const specimenTopY = upperGripY + gripH;
      const specimenBottomY = lowerGripY;
      const specimenH = specimenBottomY - specimenTopY;
      const gaugeRadiusPx = 9;

      const neckAmount = Math.max(0, Math.min(0.6, (t.strain - 0.08) * 3));
      const midRadius = gaugeRadiusPx * (1 - neckAmount);

      ctx.save();
      const specGrad = ctx.createLinearGradient(
        centerMachineX - gaugeRadiusPx,
        0,
        centerMachineX + gaugeRadiusPx,
        0,
      );
      specGrad.addColorStop(0, '#94A3B8');
      specGrad.addColorStop(0.5, '#F8FAFC');
      specGrad.addColorStop(1, '#64748B');
      ctx.fillStyle = specGrad;

      if (!t.isFractured) {
        ctx.beginPath();
        ctx.moveTo(centerMachineX - gaugeRadiusPx - 6, specimenTopY);
        ctx.lineTo(centerMachineX - gaugeRadiusPx, specimenTopY + 10);
        ctx.quadraticCurveTo(
          centerMachineX - midRadius,
          specimenTopY + specimenH * 0.5,
          centerMachineX - gaugeRadiusPx,
          specimenBottomY - 10,
        );
        ctx.lineTo(centerMachineX - gaugeRadiusPx - 6, specimenBottomY);
        ctx.lineTo(centerMachineX + gaugeRadiusPx + 6, specimenBottomY);
        ctx.lineTo(centerMachineX + gaugeRadiusPx, specimenBottomY - 10);
        ctx.quadraticCurveTo(
          centerMachineX + midRadius,
          specimenTopY + specimenH * 0.5,
          centerMachineX + gaugeRadiusPx,
          specimenTopY + 10,
        );
        ctx.lineTo(centerMachineX + gaugeRadiusPx + 6, specimenTopY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        const fractureGap = 16;
        const midY = specimenTopY + specimenH * 0.5;

        // Top half
        ctx.beginPath();
        ctx.moveTo(centerMachineX - gaugeRadiusPx - 6, specimenTopY);
        ctx.lineTo(centerMachineX - gaugeRadiusPx, specimenTopY + 10);
        ctx.lineTo(centerMachineX - midRadius, midY - fractureGap / 2);
        ctx.lineTo(centerMachineX - midRadius * 0.4, midY - fractureGap / 2 - 3);
        ctx.lineTo(centerMachineX + midRadius * 0.3, midY - fractureGap / 2 + 3);
        ctx.lineTo(centerMachineX + midRadius, midY - fractureGap / 2);
        ctx.lineTo(centerMachineX + gaugeRadiusPx, specimenTopY + 10);
        ctx.lineTo(centerMachineX + gaugeRadiusPx + 6, specimenTopY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bottom half
        ctx.beginPath();
        ctx.moveTo(centerMachineX - gaugeRadiusPx - 6, specimenBottomY);
        ctx.lineTo(centerMachineX - gaugeRadiusPx, specimenBottomY - 10);
        ctx.lineTo(centerMachineX - midRadius, midY + fractureGap / 2);
        ctx.lineTo(centerMachineX - midRadius * 0.4, midY + fractureGap / 2 - 3);
        ctx.lineTo(centerMachineX + midRadius * 0.3, midY + fractureGap / 2 + 3);
        ctx.lineTo(centerMachineX + midRadius, midY + fractureGap / 2);
        ctx.lineTo(centerMachineX + gaugeRadiusPx, specimenBottomY - 10);
        ctx.lineTo(centerMachineX + gaugeRadiusPx + 6, specimenBottomY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ SPECIMEN FRACTURED', centerMachineX, midY + 4);
      }
      ctx.restore();

      // Dial Extensometer
      if (!t.isFractured) {
        const extX = centerMachineX + 28;
        const extY = specimenTopY + specimenH * 0.38;
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 2;
        ctx.strokeRect(extX, extY, 32, 32);
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(extX, extY, 32, 32);

        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(extX + 16, extY + 16, 12, 0, Math.PI * 2);
        ctx.fill();

        const needleAngle = t.strain * Math.PI * 8;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(extX + 16, extY + 16);
        ctx.lineTo(extX + 16 + Math.cos(needleAngle) * 9, extY + 16 + Math.sin(needleAngle) * 9);
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 8px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('EXTENSOMETER', extX + 16, extY + 42);
      }

      // -------------------------------------------------------------
      // Right Pane: Streaming Stress-Strain Curve (x: 450 to 860)
      // -------------------------------------------------------------
      const plotX = 450;
      const plotY = 60;
      const plotW = 410;
      const plotH = 400;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(plotX, plotY, plotW, plotH, 10);
      ctx.fill();
      ctx.stroke();

      const originX = plotX + 60;
      const originY = plotY + plotH - 45;
      const axisW = plotW - 85;
      const axisH = plotH - 75;

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(originX, originY - axisH);
      ctx.lineTo(originX, originY);
      ctx.lineTo(originX + axisW, originY);
      ctx.stroke();

      // Plot grid
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 4; i++) {
        const gy = originY - (axisH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(originX, gy);
        ctx.lineTo(originX + axisW, gy);
        ctx.stroke();

        const gx = originX + (axisW / 4) * i;
        ctx.beginPath();
        ctx.moveTo(gx, originY);
        ctx.lineTo(gx, originY - axisH);
        ctx.stroke();
      }

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Engineering Strain ε (%)', originX + axisW / 2, originY + 30);

      ctx.save();
      ctx.translate(originX - 40, originY - axisH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Engineering Stress σ (MPa)', 0, 0);
      ctx.restore();

      const maxPlotStress = ultimateStrengthMpa * 1.25;
      const maxPlotStrain = (fractureStrainPct / 100) * 1.15;

      const hist = t.stressStrainHistory;
      if (hist.length > 1) {
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 3;
        ctx.beginPath();
        hist.forEach((pt, idx) => {
          const px = originX + (pt.strain / maxPlotStrain) * axisW;
          const py = originY - (pt.stress / maxPlotStress) * axisH;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        const lastPt = hist[hist.length - 1]!;
        const currPx = originX + (lastPt.strain / maxPlotStrain) * axisW;
        const currPy = originY - (lastPt.stress / maxPlotStress) * axisH;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(currPx, currPy, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`σ = ${lastPt.stress.toFixed(1)} MPa`, plotX + plotW - 20, plotY + 28);
        ctx.fillText(`ε = ${(lastPt.strain * 100).toFixed(2)} %`, plotX + plotW - 20, plotY + 44);
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
    fractureStrainPct,
    yieldStrengthMpa,
    ultimateStrengthMpa,
    elasticModulusGpa,
    gaugeLengthMm,
    gaugeDiameterMm,
    showGrid,
    onSampleChange,
  ]);

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
      title="Universal Testing Machine (UTM)"
      subtitle={`Specimen: ${materialName}`}
      disciplineColor="#EF4444"
      isPlaying={isPlaying}
      onPlayPause={() => {
        if (!isFractured) setIsPlaying(!isPlaying);
      }}
      onReset={handleReset}
      simTime={simTime}
      playbackSpeed={playbackSpeed}
      onSpeedChange={setPlaybackSpeed}
      showStopwatch={showStopwatch}
      onToggleStopwatch={() => setShowStopwatch(!showStopwatch)}
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
      <div ref={containerRef} className="w-full h-full relative select-none">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </PhetWorkbench>
  );
}
