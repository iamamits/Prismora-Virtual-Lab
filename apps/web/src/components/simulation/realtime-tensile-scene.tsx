'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Gauge,
  Activity,
  Layers,
  Sparkles,
} from 'lucide-react';

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
  const [isFractured, setIsFractured] = useState<boolean>(false);

  // State ref for high-frequency physics
  const testRef = useRef<{
    strain: number; // engineering strain (fraction)
    crossheadY: number; // mm
    isFractured: boolean;
    fractureProgress: number; // 0 to 1 for snap animation
    stressStrainHistory: Array<{ strain: number; stress: number }>;
  }>({
    strain: 0,
    crossheadY: 0,
    isFractured: false,
    fractureProgress: 0,
    stressStrainHistory: [{ strain: 0, stress: 0 }],
  });

  const handleReset = useCallback(() => {
    testRef.current.strain = 0;
    testRef.current.crossheadY = 0;
    testRef.current.isFractured = false;
    testRef.current.fractureProgress = 0;
    testRef.current.stressStrainHistory = [{ strain: 0, stress: 0 }];
    setIsFractured(false);
    setIsPlaying(false);
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
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;

      const t = testRef.current;

      // Advance strain if test is running and not fractured
      if (isPlaying && !t.isFractured) {
        const strainRate = 0.018 * dt; // strain per second
        t.strain += strainRate;

        const maxStrain = fractureStrainPct / 100;
        if (t.strain >= maxStrain) {
          t.strain = maxStrain;
          t.isFractured = true;
          setIsFractured(true);
          setIsPlaying(false);
        }

        // Calculate Ramberg-Osgood / Hollomon stress
        const yieldStrain = yieldStrengthMpa / (elasticModulusGpa * 1000);
        let stress = 0;
        if (t.strain <= yieldStrain) {
          stress = t.strain * elasticModulusGpa * 1000;
        } else {
          // Plastic region with strain hardening up to UTS then necking softening
          const plasticStrain = t.strain - yieldStrain;
          const hardening = (ultimateStrengthMpa - yieldStrengthMpa) * Math.pow(plasticStrain / (maxStrain - yieldStrain), 0.35);
          stress = yieldStrengthMpa + hardening;

          // Necking reduction after 60% of plastic strain
          const neckThreshold = yieldStrain + 0.6 * (maxStrain - yieldStrain);
          if (t.strain > neckThreshold) {
            const drop = (t.strain - neckThreshold) / (maxStrain - neckThreshold);
            stress -= (ultimateStrengthMpa - yieldStrengthMpa) * 0.45 * drop;
          }
        }

        t.stressStrainHistory.push({ strain: t.strain, stress });
        if (t.stressStrainHistory.length > 500) t.stressStrainHistory.shift();

        // Calculate force & elongation
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
      // DRAW CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, width, height);

      // Left side: UTM Machine Frame. Right side: Live Stress-Strain Plot
      const frameW = width * 0.46;
      const plotX = frameW + 15;
      const plotW = width - plotX - 20;

      // 1. UTM Machine Frame Columns
      const colX1 = 45;
      const colX2 = frameW - 45;
      const basePlateY = height - 45;
      const topPlateY = 40;

      // Base plate
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(colX1 - 20, basePlateY, (colX2 - colX1) + 40, 25);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(colX1 - 20, basePlateY, (colX2 - colX1) + 40, 25);

      // Top crosshead plate
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(colX1 - 20, topPlateY - 20, (colX2 - colX1) + 40, 20);
      ctx.strokeRect(colX1 - 20, topPlateY - 20, (colX2 - colX1) + 40, 20);

      // Dual Lead Screws / Chrome Columns
      [colX1, colX2].forEach((cx) => {
        const colGrad = ctx.createLinearGradient(cx - 7, 0, cx + 7, 0);
        colGrad.addColorStop(0, '#64748B');
        colGrad.addColorStop(0.5, '#E2E8F0');
        colGrad.addColorStop(1, '#475569');
        ctx.fillStyle = colGrad;
        ctx.fillRect(cx - 7, topPlateY, 14, basePlateY - topPlateY);
      });

      // Motorized Moving Crosshead
      // Moves upwards as strain increases
      const elongationPx = t.strain * 55;
      const crossheadDefaultY = height * 0.38;
      const crossheadY = crossheadDefaultY - elongationPx;

      ctx.save();
      const crossheadGrad = ctx.createLinearGradient(0, crossheadY - 14, 0, crossheadY + 14);
      crossheadGrad.addColorStop(0, '#334155');
      crossheadGrad.addColorStop(1, '#0F172A');
      ctx.fillStyle = crossheadGrad;
      ctx.fillRect(colX1 - 10, crossheadY - 14, (colX2 - colX1) + 20, 28);
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(colX1 - 10, crossheadY - 14, (colX2 - colX1) + 20, 28);
      ctx.restore();

      // Lower Stationary Grip
      const lowerGripY = height * 0.72;
      const gripW = 34;
      const gripH = 26;
      const centerMachineX = (colX1 + colX2) / 2;

      ctx.fillStyle = '#475569';
      ctx.fillRect(centerMachineX - gripW / 2, lowerGripY, gripW, gripH);
      ctx.strokeRect(centerMachineX - gripW / 2, lowerGripY, gripW, gripH);

      // Upper Moving Grip (attached to crosshead)
      const upperGripY = crossheadY + 14;
      ctx.fillStyle = '#475569';
      ctx.fillRect(centerMachineX - gripW / 2, upperGripY, gripW, gripH);
      ctx.strokeRect(centerMachineX - gripW / 2, upperGripY, gripW, gripH);

      // 2. Dogbone Specimen
      const specimenTopY = upperGripY + gripH;
      const specimenBottomY = lowerGripY;
      const specimenH = specimenBottomY - specimenTopY;
      const gaugeRadiusPx = 7;

      // Necking calculation: when strain > 0.08, middle radius decreases
      const neckAmount = Math.max(0, Math.min(0.55, (t.strain - 0.08) * 3));
      const midRadius = gaugeRadiusPx * (1 - neckAmount);

      ctx.save();
      const specGrad = ctx.createLinearGradient(centerMachineX - gaugeRadiusPx, 0, centerMachineX + gaugeRadiusPx, 0);
      specGrad.addColorStop(0, '#94A3B8');
      specGrad.addColorStop(0.5, '#F8FAFC');
      specGrad.addColorStop(1, '#64748B');
      ctx.fillStyle = specGrad;

      if (!t.isFractured) {
        // Continuous specimen with necking profile
        ctx.beginPath();
        // Top shoulder
        ctx.moveTo(centerMachineX - gaugeRadiusPx - 4, specimenTopY);
        ctx.lineTo(centerMachineX - gaugeRadiusPx, specimenTopY + 8);
        // Left contour with neck
        ctx.quadraticCurveTo(centerMachineX - midRadius, specimenTopY + specimenH * 0.5, centerMachineX - gaugeRadiusPx, specimenBottomY - 8);
        // Bottom shoulder
        ctx.lineTo(centerMachineX - gaugeRadiusPx - 4, specimenBottomY);
        ctx.lineTo(centerMachineX + gaugeRadiusPx + 4, specimenBottomY);
        ctx.lineTo(centerMachineX + gaugeRadiusPx, specimenBottomY - 8);
        // Right contour with neck
        ctx.quadraticCurveTo(centerMachineX + midRadius, specimenTopY + specimenH * 0.5, centerMachineX + gaugeRadiusPx, specimenTopY + 8);
        ctx.lineTo(centerMachineX + gaugeRadiusPx + 4, specimenTopY);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        // Fractured in two pieces with gap!
        const fractureGap = 12;
        const midY = specimenTopY + specimenH * 0.5;

        // Top half
        ctx.beginPath();
        ctx.moveTo(centerMachineX - gaugeRadiusPx - 4, specimenTopY);
        ctx.lineTo(centerMachineX - gaugeRadiusPx, specimenTopY + 8);
        ctx.lineTo(centerMachineX - midRadius, midY - fractureGap / 2);
        // Jagged fracture surface
        ctx.lineTo(centerMachineX - midRadius * 0.4, midY - fractureGap / 2 - 2);
        ctx.lineTo(centerMachineX + midRadius * 0.3, midY - fractureGap / 2 + 3);
        ctx.lineTo(centerMachineX + midRadius, midY - fractureGap / 2);
        ctx.lineTo(centerMachineX + gaugeRadiusPx, specimenTopY + 8);
        ctx.lineTo(centerMachineX + gaugeRadiusPx + 4, specimenTopY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Bottom half
        ctx.beginPath();
        ctx.moveTo(centerMachineX - gaugeRadiusPx - 4, specimenBottomY);
        ctx.lineTo(centerMachineX - gaugeRadiusPx, specimenBottomY - 8);
        ctx.lineTo(centerMachineX - midRadius, midY + fractureGap / 2);
        // Jagged fracture surface
        ctx.lineTo(centerMachineX - midRadius * 0.4, midY + fractureGap / 2 - 2);
        ctx.lineTo(centerMachineX + midRadius * 0.3, midY + fractureGap / 2 + 3);
        ctx.lineTo(centerMachineX + midRadius, midY + fractureGap / 2);
        ctx.lineTo(centerMachineX + gaugeRadiusPx, specimenBottomY - 8);
        ctx.lineTo(centerMachineX + gaugeRadiusPx + 4, specimenBottomY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Fracture sparks / warning badge
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 11px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ SPECIMEN FRACTURED', centerMachineX, midY + 4);
      }
      ctx.restore();

      // 3. Extensometer Clip Gauge with Dial Indicator
      if (!t.isFractured) {
        const extX = centerMachineX + 22;
        const extY = specimenTopY + specimenH * 0.4;
        ctx.strokeStyle = '#F59E0B';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(extX, extY, 26, 26);
        ctx.fillStyle = '#1E293B';
        ctx.fillRect(extX, extY, 26, 26);

        // Dial face
        ctx.fillStyle = '#F8FAFC';
        ctx.beginPath();
        ctx.arc(extX + 13, extY + 13, 10, 0, Math.PI * 2);
        ctx.fill();

        // Dial needle
        const needleAngle = t.strain * Math.PI * 8;
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(extX + 13, extY + 13);
        ctx.lineTo(extX + 13 + Math.cos(needleAngle) * 8, extY + 13 + Math.sin(needleAngle) * 8);
        ctx.stroke();

        ctx.fillStyle = '#F59E0B';
        ctx.font = '8px JetBrains Mono, monospace';
        ctx.fillText('EXTENSOMETER', extX + 13, extY + 34);
      }

      // -------------------------------------------------------------
      // 4. Real-time Streaming Stress-Strain Curve Plot (Right Pane)
      // -------------------------------------------------------------
      const plotH = height - 70;
      const plotTopY = 35;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(plotX, plotTopY, plotW, plotH, 8);
      ctx.fill();
      ctx.stroke();

      // Plot Axes
      const originX = plotX + 45;
      const originY = plotTopY + plotH - 30;
      const axisW = plotW - 65;
      const axisH = plotH - 55;

      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(originX, originY - axisH);
      ctx.lineTo(originX, originY);
      ctx.lineTo(originX + axisW, originY);
      ctx.stroke();

      // Grid lines in plot
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

      // Axis labels
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('Strain ε (%)', originX + axisW / 2, originY + 22);

      ctx.save();
      ctx.translate(originX - 30, originY - axisH / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillText('Stress σ (MPa)', 0, 0);
      ctx.restore();

      // Max scale values
      const maxPlotStress = ultimateStrengthMpa * 1.25;
      const maxPlotStrain = (fractureStrainPct / 100) * 1.15;

      // Plot Stress-Strain curve path
      const hist = t.stressStrainHistory;
      if (hist.length > 1) {
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        hist.forEach((pt, idx) => {
          const px = originX + (pt.strain / maxPlotStrain) * axisW;
          const py = originY - (pt.stress / maxPlotStress) * axisH;
          if (idx === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        });
        ctx.stroke();

        // Current point tracer
        const lastPt = hist[hist.length - 1]!;
        const currPx = originX + (lastPt.strain / maxPlotStrain) * axisW;
        const currPy = originY - (lastPt.stress / maxPlotStress) * axisH;

        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(currPx, currPy, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#EF4444';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Digital readouts in plot
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`σ = ${lastPt.stress.toFixed(1)} MPa`, plotX + plotW - 14, plotTopY + 20);
        ctx.fillText(`ε = ${(lastPt.strain * 100).toFixed(2)} %`, plotX + plotW - 14, plotTopY + 34);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isPlaying,
    playbackSpeed,
    fractureStrainPct,
    yieldStrengthMpa,
    ultimateStrengthMpa,
    elasticModulusGpa,
    gaugeLengthMm,
    gaugeDiameterMm,
    onSampleChange,
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
    <div className={`flex flex-col rounded-2xl bg-zinc-950 border border-zinc-800 overflow-hidden shadow-2xl ${className}`}>
      {/* Workbench Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
          <span className="font-mono font-bold text-zinc-100">UTM Uniaxial Tensile Testing Bench</span>
          <span className="text-zinc-500">|</span>
          <span className="font-mono text-zinc-400">Specimen: {materialName}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
            isFractured ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400'
          }`}>
            {isFractured ? 'Fractured' : isPlaying ? 'Straining...' : 'Ready'}
          </span>
        </div>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full h-[320px] sm:h-[380px] bg-[#0B1120]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Transport Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-zinc-900/90 border-t border-zinc-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={isFractured}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-mono text-xs font-bold transition-all shadow-md active:scale-95"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause Crosshead' : 'Start Pull Test'}</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-xs transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Specimen</span>
          </button>
        </div>

        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="text-zinc-500 mr-1 text-[11px]">Pull Rate:</span>
          {[0.5, 1.0, 2.0, 4.0].map((spd) => (
            <button
              key={spd}
              onClick={() => setPlaybackSpeed(spd)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all ${
                playbackSpeed === spd
                  ? 'bg-red-600 text-white'
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
