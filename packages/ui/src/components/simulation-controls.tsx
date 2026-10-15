'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Button } from './button';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Gauge,
} from 'lucide-react';

export interface SimulationControlsProps {
  status: 'idle' | 'ready' | 'running' | 'paused' | 'completed' | 'error';
  currentTime: number;
  terminalTime: number | null;
  playbackSpeed: number;
  onPlay: () => void;
  onPause: () => void;
  onStep: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
  onSpeedChange: (speed: number) => void;
  className?: string;
}

const SPEED_OPTIONS = [0.25, 0.5, 1, 2, 4];

function SimulationControls({
  status,
  currentTime,
  terminalTime,
  playbackSpeed,
  onPlay,
  onPause,
  onStep,
  onReset,
  onSeek,
  onSpeedChange,
  className,
}: SimulationControlsProps) {
  const canPlay = status === 'ready' || status === 'paused';
  const canPause = status === 'running';
  const canStep = status === 'ready' || status === 'paused';
  const maxTime = terminalTime ?? 10;

  const progress = maxTime > 0 ? (currentTime / maxTime) * 100 : 0;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(fraction * maxTime);
  };

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-lg border bg-white p-3 dark:bg-zinc-950 dark:border-zinc-800 border-zinc-200',
        className,
      )}
    >
      {/* Timeline */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono tabular-nums text-zinc-500 dark:text-zinc-400 w-14 text-right">
          {currentTime.toFixed(2)}s
        </span>
        <div
          className="flex-1 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700 cursor-pointer relative overflow-hidden"
          onClick={handleTimelineClick}
          role="slider"
          aria-label="Simulation timeline"
          aria-valuemin={0}
          aria-valuemax={maxTime}
          aria-valuenow={currentTime}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') onSeek(Math.min(maxTime, currentTime + 0.1));
            if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentTime - 0.1));
          }}
        >
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-indigo-500 dark:bg-indigo-400 transition-all duration-75"
            style={{ width: `${Math.min(100, progress)}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white border-2 border-indigo-500 shadow-sm transition-all duration-75"
            style={{ left: `calc(${Math.min(100, progress)}% - 6px)` }}
          />
        </div>
        <span className="text-xs font-mono tabular-nums text-zinc-400 dark:text-zinc-500 w-14">
          {terminalTime !== null ? `${terminalTime.toFixed(2)}s` : '∞'}
        </span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {/* Play / Pause */}
          {canPause ? (
            <Button
              variant="default"
              size="icon"
              onClick={onPause}
              aria-label="Pause simulation"
            >
              <Pause className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              variant="default"
              size="icon"
              onClick={onPlay}
              disabled={!canPlay}
              aria-label="Play simulation"
            >
              <Play className="h-4 w-4" />
            </Button>
          )}

          {/* Step */}
          <Button
            variant="outline"
            size="icon"
            onClick={onStep}
            disabled={!canStep}
            aria-label="Step forward"
          >
            <SkipForward className="h-4 w-4" />
          </Button>

          {/* Reset */}
          <Button
            variant="outline"
            size="icon"
            onClick={onReset}
            aria-label="Reset simulation"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        {/* Status badge */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
              {
                'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400':
                  status === 'idle' || status === 'ready',
                'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400':
                  status === 'running',
                'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400':
                  status === 'paused',
                'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400':
                  status === 'completed',
                'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400':
                  status === 'error',
              },
            )}
          >
            <span
              className={cn('h-1.5 w-1.5 rounded-full', {
                'bg-zinc-400': status === 'idle' || status === 'ready',
                'bg-emerald-500 animate-pulse': status === 'running',
                'bg-amber-500': status === 'paused',
                'bg-blue-500': status === 'completed',
                'bg-red-500': status === 'error',
              })}
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-1.5">
          <Gauge className="h-3.5 w-3.5 text-zinc-400" />
          <div className="flex items-center rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {SPEED_OPTIONS.map((speed) => (
              <button
                key={speed}
                onClick={() => onSpeedChange(speed)}
                className={cn(
                  'px-2 py-1 text-xs font-mono transition-colors',
                  playbackSpeed === speed
                    ? 'bg-indigo-500 text-white dark:bg-indigo-600'
                    : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
                )}
                aria-label={`Set speed to ${speed}x`}
              >
                {speed}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export { SimulationControls };

