'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import type { ProjectileMotionState, Vector2D } from '@prismora/simulation-core';

export interface ProjectileCanvasProps {
  currentState: ProjectileMotionState;
  trajectoryHistory: readonly ProjectileMotionState[];
  initialHeight: number;
  launchAngle: number;
  maxRange: number;
  maxHeight: number;
  showVelocityVector?: boolean;
  showAccelerationVector?: boolean;
  showTrajectoryTrace?: boolean;
  showGrid?: boolean;
  vectorScale?: number;
  className?: string;
  onCanvasClick?: (coords: { x: number; y: number }) => void;
}

export const ProjectileCanvas: React.FC<ProjectileCanvasProps> = ({
  currentState,
  trajectoryHistory,
  initialHeight,
  launchAngle,
  maxRange,
  maxHeight,
  showVelocityVector = true,
  showAccelerationVector = true,
  showTrajectoryTrace = true,
  showGrid = true,
  vectorScale = 1.0,
  className = '',
  onCanvasClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const drawScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    // Viewport layout margins in physical pixels
    const marginLeft = 60 * dpr;
    const marginBottom = 50 * dpr;
    const marginTop = 40 * dpr;
    const marginRight = 40 * dpr;

    const plotWidth = width - marginLeft - marginRight;
    const plotHeight = height - marginBottom - marginTop;

    if (plotWidth <= 0 || plotHeight <= 0) return;

    // Determine scale in world units (meters)
    // Add 15% headroom
    const worldXMax = Math.max(20, maxRange * 1.15, (currentState.position.x || 0) * 1.1);
    const worldYMax = Math.max(15, maxHeight * 1.25, initialHeight * 1.2, (currentState.position.y || 0) * 1.1);

    const scaleX = plotWidth / worldXMax;
    const scaleY = plotHeight / worldYMax;
    // Choose proportional or fit-both scale
    const scale = Math.min(scaleX, scaleY);

    const worldToScreen = (wx: number, wy: number) => ({
      x: marginLeft + wx * scale,
      y: height - marginBottom - wy * scale,
    });

    const screenToWorld = (sx: number, sy: number) => ({
      x: (sx - marginLeft) / scale,
      y: (height - marginBottom - sy) / scale,
    });

    // Determine dark mode
    const isDark = document.documentElement.classList.contains('dark');

    // Background
    ctx.fillStyle = isDark ? '#090d16' : '#f8fafc';
    ctx.fillRect(0, 0, width, height);

    // Grid and axes
    if (showGrid) {
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.06)';
      ctx.lineWidth = 1 * dpr;

      // Choose grid step based on range
      const gridStep = Math.pow(10, Math.floor(Math.log10(worldXMax / 5))) || 5;

      ctx.fillStyle = isDark ? '#64748b' : '#94a3b8';
      ctx.font = `${10 * dpr}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      // Vertical grid lines
      for (let wx = 0; wx <= worldXMax; wx += gridStep) {
        const pt = worldToScreen(wx, 0);
        ctx.beginPath();
        ctx.moveTo(pt.x, marginTop);
        ctx.lineTo(pt.x, height - marginBottom);
        ctx.stroke();

        ctx.fillText(`${wx}m`, pt.x, height - marginBottom + 8 * dpr);
      }

      // Horizontal grid lines
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      for (let wy = 0; wy <= worldYMax; wy += gridStep) {
        const pt = worldToScreen(0, wy);
        ctx.beginPath();
        ctx.moveTo(marginLeft, pt.y);
        ctx.lineTo(marginLeft + worldXMax * scale, pt.y);
        ctx.stroke();

        if (wy > 0) {
          ctx.fillText(`${wy}m`, marginLeft - 8 * dpr, pt.y);
        }
      }
    }

    // Ground line
    const groundY = height - marginBottom;
    ctx.strokeStyle = isDark ? '#334155' : '#cbd5e1';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.moveTo(marginLeft, groundY);
    ctx.lineTo(width - marginRight, groundY);
    ctx.stroke();

    // Ground hatch marks
    ctx.strokeStyle = isDark ? 'rgba(51, 65, 85, 0.5)' : 'rgba(203, 213, 225, 0.7)';
    ctx.lineWidth = 1 * dpr;
    for (let x = marginLeft; x < width - marginRight; x += 15 * dpr) {
      ctx.beginPath();
      ctx.moveTo(x, groundY);
      ctx.lineTo(x - 8 * dpr, groundY + 8 * dpr);
      ctx.stroke();
    }

    // Launch platform (if initial height > 0)
    if (initialHeight > 0) {
      const launchPt = worldToScreen(0, initialHeight);
      const groundPt = worldToScreen(0, 0);

      // Platform pillar
      ctx.fillStyle = isDark ? '#1e293b' : '#e2e8f0';
      ctx.strokeStyle = isDark ? '#475569' : '#94a3b8';
      ctx.lineWidth = 1.5 * dpr;

      const pWidth = 24 * dpr;
      ctx.fillRect(launchPt.x - pWidth / 2, launchPt.y, pWidth, groundPt.y - launchPt.y);
      ctx.strokeRect(launchPt.x - pWidth / 2, launchPt.y, pWidth, groundPt.y - launchPt.y);

      // Height label
      ctx.fillStyle = isDark ? '#38bdf8' : '#0284c7';
      ctx.font = `${11 * dpr}px JetBrains Mono, monospace`;
      ctx.textAlign = 'right';
      ctx.fillText(`y₀ = ${initialHeight.toFixed(1)}m`, launchPt.x - pWidth / 2 - 6 * dpr, (launchPt.y + groundPt.y) / 2);
    }

    // Cannon barrel representation at origin
    const origin = worldToScreen(0, initialHeight);
    const barrelLength = 22 * dpr;
    const barrelAngle = -launchAngle; // Canvas y is flipped

    ctx.save();
    ctx.translate(origin.x, origin.y);
    ctx.rotate(barrelAngle);
    ctx.fillStyle = isDark ? '#475569' : '#64748b';
    ctx.strokeStyle = isDark ? '#94a3b8' : '#334155';
    ctx.lineWidth = 1.5 * dpr;
    ctx.beginPath();
    ctx.roundRect(-4 * dpr, -5 * dpr, barrelLength, 10 * dpr, 2 * dpr);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    // Trajectory trace
    if (showTrajectoryTrace && trajectoryHistory.length > 0) {
      ctx.strokeStyle = '#06b6d4'; // Cyan
      ctx.lineWidth = 2.5 * dpr;
      ctx.setLineDash([4 * dpr, 2 * dpr]);
      ctx.beginPath();

      const startPt = worldToScreen(0, initialHeight);
      ctx.moveTo(startPt.x, startPt.y);

      for (let i = 0; i < trajectoryHistory.length; i++) {
        const pt = worldToScreen(trajectoryHistory[i]!.position.x, trajectoryHistory[i]!.position.y);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Max Height marker
    if (maxHeight > initialHeight && Number.isFinite(maxHeight)) {
      const maxYScreen = worldToScreen(0, maxHeight).y;
      ctx.strokeStyle = isDark ? 'rgba(168, 85, 247, 0.4)' : 'rgba(147, 51, 234, 0.3)';
      ctx.lineWidth = 1 * dpr;
      ctx.setLineDash([3 * dpr, 3 * dpr]);
      ctx.beginPath();
      ctx.moveTo(marginLeft, maxYScreen);
      ctx.lineTo(marginLeft + worldXMax * scale, maxYScreen);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.fillStyle = isDark ? '#c084fc' : '#9333ea';
      ctx.font = `${10 * dpr}px JetBrains Mono, monospace`;
      ctx.textAlign = 'left';
      ctx.fillText(`Apex: ${maxHeight.toFixed(2)}m`, marginLeft + 8 * dpr, maxYScreen - 4 * dpr);
    }

    // Max Range marker
    if (maxRange > 0 && Number.isFinite(maxRange)) {
      const rangePt = worldToScreen(maxRange, 0);
      ctx.fillStyle = isDark ? '#34d399' : '#059669';
      ctx.beginPath();
      ctx.arc(rangePt.x, rangePt.y, 4 * dpr, 0, Math.PI * 2);
      ctx.fill();

      ctx.font = `${10 * dpr}px JetBrains Mono, monospace`;
      ctx.textAlign = 'center';
      ctx.fillText(`Target: ${maxRange.toFixed(2)}m`, rangePt.x, rangePt.y + 16 * dpr);
    }

    // Projectile current position
    const pos = currentState.position;
    const currentScreen = worldToScreen(pos.x, pos.y);

    // Glow effect
    const glowRadius = 12 * dpr;
    const gradient = ctx.createRadialGradient(
      currentScreen.x,
      currentScreen.y,
      2 * dpr,
      currentScreen.x,
      currentScreen.y,
      glowRadius,
    );
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.8)');
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(currentScreen.x, currentScreen.y, glowRadius, 0, Math.PI * 2);
    ctx.fill();

    // Projectile body
    ctx.fillStyle = '#6366f1'; // Indigo brand
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * dpr;
    ctx.beginPath();
    ctx.arc(currentScreen.x, currentScreen.y, 6 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Helper to draw an arrow
    const drawArrow = (
      from: { x: number; y: number },
      vector: Vector2D,
      color: string,
      scaleMultiplier: number,
      label: string,
    ) => {
      const vx = vector.x * scaleMultiplier * dpr;
      const vy = -vector.y * scaleMultiplier * dpr; // flipped Y
      const to = { x: from.x + vx, y: from.y + vy };
      const len = Math.sqrt(vx * vx + vy * vy);

      if (len < 3 * dpr) return;

      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2 * dpr;

      // Shaft
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();

      // Arrowhead
      const headLen = 8 * dpr;
      const angle = Math.atan2(vy, vx);
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - headLen * Math.cos(angle - Math.PI / 6), to.y - headLen * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(to.x - headLen * Math.cos(angle + Math.PI / 6), to.y - headLen * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();

      // Label
      ctx.font = `${10 * dpr}px JetBrains Mono, monospace`;
      ctx.fillText(label, to.x + 6 * dpr * Math.cos(angle), to.y + 6 * dpr * Math.sin(angle));
    };

    // Velocity vector (Blue)
    if (showVelocityVector) {
      const vScale = 2.0 * vectorScale;
      drawArrow(currentScreen, currentState.velocity, '#3b82f6', vScale, 'v');
    }

    // Acceleration vector (Orange)
    if (showAccelerationVector) {
      const aScale = 3.0 * vectorScale;
      drawArrow(currentScreen, currentState.acceleration, '#f97316', aScale, 'a');
    }

    // Axes labels
    ctx.fillStyle = isDark ? '#94a3b8' : '#475569';
    ctx.font = `bold ${11 * dpr}px sans-serif`;
    ctx.textAlign = 'right';
    ctx.fillText('Horizontal Distance (m) →', width - marginRight, height - 12 * dpr);

    ctx.save();
    ctx.translate(16 * dpr, marginTop + plotHeight / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Vertical Height (m) →', 0, 0);
    ctx.restore();
  }, [
    currentState,
    trajectoryHistory,
    initialHeight,
    launchAngle,
    maxRange,
    maxHeight,
    showVelocityVector,
    showAccelerationVector,
    showTrajectoryTrace,
    showGrid,
    vectorScale,
  ]);

  // Handle Resize & DPI Scaling
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      drawScene();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [drawScene]);

  // Re-draw when dependencies change
  useEffect(() => {
    drawScene();
  }, [drawScene]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[360px] overflow-hidden select-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-crosshair"
        onClick={(e) => {
          if (!onCanvasClick || !canvasRef.current) return;
          const rect = canvasRef.current.getBoundingClientRect();
          onCanvasClick({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
          });
        }}
      />
    </div>
  );
};
