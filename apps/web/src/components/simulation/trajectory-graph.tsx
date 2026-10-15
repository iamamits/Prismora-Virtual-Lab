'use client';

import React, { useRef, useEffect } from 'react';
import type { ProjectileMotionState } from '@prismora/simulation-core';
import { Card, CardHeader, CardTitle, CardContent } from '@prismora/ui';

export interface TrajectoryGraphProps {
  history: readonly ProjectileMotionState[];
  currentTime: number;
  terminalTime: number | null;
  maxHeight: number;
  className?: string;
}

export const TrajectoryGraph: React.FC<TrajectoryGraphProps> = ({
  history,
  currentTime,
  terminalTime,
  maxHeight,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const isDark = document.documentElement.classList.contains('dark');

    // Margins
    const ml = 45 * dpr;
    const mr = 20 * dpr;
    const mt = 20 * dpr;
    const mb = 30 * dpr;

    const pw = width - ml - mr;
    const ph = height - mt - mb;

    ctx.fillStyle = isDark ? '#090d16' : '#ffffff';
    ctx.fillRect(0, 0, width, height);

    if (pw <= 0 || ph <= 0) return;

    // Time window
    const tMax = Math.max(2, terminalTime ?? 5, currentTime * 1.1);
    const yMax = Math.max(5, maxHeight * 1.2);

    const toScreen = (t: number, y: number) => ({
      x: ml + (t / tMax) * pw,
      y: mt + ph - (y / yMax) * ph,
    });

    // Grid lines
    ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)';
    ctx.lineWidth = 1 * dpr;
    ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
    ctx.font = `${9 * dpr}px JetBrains Mono, monospace`;

    // Horizontal time lines
    const tSteps = 4;
    for (let i = 0; i <= tSteps; i++) {
      const tVal = (tMax / tSteps) * i;
      const x = ml + (i / tSteps) * pw;
      ctx.beginPath();
      ctx.moveTo(x, mt);
      ctx.lineTo(x, mt + ph);
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillText(`${tVal.toFixed(1)}s`, x, mt + ph + 14 * dpr);
    }

    // Vertical height lines
    const ySteps = 3;
    ctx.textAlign = 'right';
    for (let j = 0; j <= ySteps; j++) {
      const yVal = (yMax / ySteps) * j;
      const y = mt + ph - (j / ySteps) * ph;
      ctx.beginPath();
      ctx.moveTo(ml, y);
      ctx.lineTo(ml + pw, y);
      ctx.stroke();

      ctx.fillText(`${yVal.toFixed(0)}m`, ml - 6 * dpr, y + 3 * dpr);
    }

    // Plot Height vs Time curve
    if (history.length > 0) {
      ctx.strokeStyle = '#22c55e'; // Green
      ctx.lineWidth = 2 * dpr;
      ctx.beginPath();

      const start = toScreen(0, history[0]!.position.y);
      ctx.moveTo(start.x, start.y);

      for (let k = 1; k < history.length; k++) {
        const pt = toScreen(history[k]!.time, history[k]!.position.y);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();

      // Current point
      const current = toScreen(currentTime, history[history.length - 1]?.position.y ?? 0);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(current.x, current.y, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Time cursor
    const cursorX = ml + (currentTime / tMax) * pw;
    ctx.strokeStyle = '#6366f1';
    ctx.setLineDash([2 * dpr, 2 * dpr]);
    ctx.beginPath();
    ctx.moveTo(cursorX, mt);
    ctx.lineTo(cursorX, mt + ph);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [history, currentTime, terminalTime, maxHeight]);

  return (
    <Card className={`border-zinc-200 dark:border-zinc-800 ${className}`}>
      <CardHeader className="py-2.5 px-3 border-b border-zinc-100 dark:border-zinc-800">
        <CardTitle className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center justify-between">
          <span>Height vs. Time y(t)</span>
          <span className="text-emerald-500 font-mono text-[11px]">● y(t)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <div ref={containerRef} className="relative w-full h-36">
          <canvas ref={canvasRef} className="w-full h-full block" />
        </div>
      </CardContent>
    </Card>
  );
};
