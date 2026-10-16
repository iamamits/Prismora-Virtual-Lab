'use client';

import React from 'react';
import type { ProjectileMotionParameters, ProjectileMotionState } from '@prismora/simulation-core';
import { Card, CardHeader, CardTitle, CardContent, MathView } from '@prismora/ui';

export interface LiveEquationsProps {
  parameters: ProjectileMotionParameters;
  state: ProjectileMotionState;
  flightTime: number | null;
  maxHeight: number;
  range: number | null;
  className?: string;
}

export const LiveEquations: React.FC<LiveEquationsProps> = ({
  parameters,
  state,
  flightTime,
  maxHeight,
  range,
  className = '',
}) => {
  const { initialSpeed: v0, launchAngle: theta, gravity: g, initialHeight: y0 } = parameters;
  const t = state.time;
  const cosTheta = Math.cos(theta);
  const sinTheta = Math.sin(theta);
  const v0x = v0 * cosTheta;
  const v0y = v0 * sinTheta;
  const deg = (theta * 180) / Math.PI;

  return (
    <Card className={`border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm ${className}`}>
      <CardHeader className="py-2.5 px-3 border-b border-zinc-100 dark:border-zinc-800/60">
        <CardTitle className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center justify-between">
          <span>Equations of Motion &amp; State</span>
          <span className="text-[10px] lowercase text-indigo-500 font-mono">analytical model</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 space-y-2.5 text-xs font-mono">
        {/* Horizontal Position */}
        <div className="bg-zinc-50 dark:bg-zinc-900/60 p-2 rounded border border-zinc-100 dark:border-zinc-800/80">
          <div className="text-zinc-600 dark:text-zinc-400 text-[11px] mb-1 overflow-x-auto">
            <MathView math="x(t) = v_0 \cos(\theta) t" size="xs" />
          </div>
          <div className="text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
            <span>
              x({t.toFixed(2)}s) = {v0.toFixed(1)} × {cosTheta.toFixed(3)} × {t.toFixed(2)}
            </span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">
              = {state.position.x.toFixed(2)} m
            </span>
          </div>
        </div>

        {/* Vertical Position */}
        <div className="bg-zinc-50 dark:bg-zinc-900/60 p-2 rounded border border-zinc-100 dark:border-zinc-800/80">
          <div className="text-zinc-600 dark:text-zinc-400 text-[11px] mb-1 overflow-x-auto">
            <MathView math="y(t) = y_0 + v_0 \sin(\theta) t - \frac{1}{2} g t^2" size="xs" />
          </div>
          <div className="text-zinc-800 dark:text-zinc-200 flex items-center justify-between">
            <span className="truncate mr-2">
              y({t.toFixed(2)}s) = {y0.toFixed(1)} + {v0y.toFixed(2)}×{t.toFixed(2)} - 0.5×{g.toFixed(2)}×{t.toFixed(2)}²
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
              = {state.position.y.toFixed(2)} m
            </span>
          </div>
        </div>

        {/* Velocity Components */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-zinc-50 dark:bg-zinc-900/60 p-2 rounded border border-zinc-100 dark:border-zinc-800/80">
            <div className="text-zinc-600 dark:text-zinc-400 text-[10px] mb-0.5 overflow-x-auto">
              <MathView math="v_x(t) = v_0 \cos(\theta)" size="xs" />
            </div>
            <div className="font-semibold text-blue-600 dark:text-blue-400">
              = {state.velocity.x.toFixed(2)} m/s
            </div>
          </div>
          <div className="bg-zinc-50 dark:bg-zinc-900/60 p-2 rounded border border-zinc-100 dark:border-zinc-800/80">
            <div className="text-zinc-600 dark:text-zinc-400 text-[10px] mb-0.5 overflow-x-auto">
              <MathView math="v_y(t) = v_0 \sin(\theta) - gt" size="xs" />
            </div>
            <div className="font-semibold text-blue-600 dark:text-blue-400">
              = {state.velocity.y.toFixed(2)} m/s
            </div>
          </div>
        </div>

        {/* Analytical Maxima */}
        <div className="pt-1 border-t border-zinc-100 dark:border-zinc-800 text-[11px] space-y-1 text-zinc-600 dark:text-zinc-400">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <span>Total Flight Time:</span>
              <MathView math="t_f" size="xs" />
            </span>
            <span className="font-bold text-zinc-900 dark:text-zinc-100">
              {flightTime !== null ? `${flightTime.toFixed(3)} s` : '∞'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <span>Apex Max Height:</span>
              <MathView math="h_{\max}" size="xs" />
            </span>
            <span className="font-bold text-purple-600 dark:text-purple-400">
              {Number.isFinite(maxHeight) ? `${maxHeight.toFixed(3)} m` : '∞'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-1">
              <span>Horizontal Range:</span>
              <MathView math="R" size="xs" />
            </span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">
              {range !== null ? `${range.toFixed(3)} m` : '—'}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
