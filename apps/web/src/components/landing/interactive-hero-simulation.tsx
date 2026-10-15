'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Play, RotateCcw, ArrowRight, Gauge, Globe2, Moon, Flame } from 'lucide-react';
import { Button, Badge } from '@prismora/ui';
import {
  degreesToRadians,
  projectileMotionModel,
  type ProjectileMotionParameters,
} from '@prismora/simulation-core';

export function InteractiveHeroSimulation() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initial parameters
  const [speed, setSpeed] = useState<number>(22);
  const [angleDeg, setAngleDeg] = useState<number>(50);
  const [gravity, setGravity] = useState<number>(9.81);
  const [environment, setEnvironment] = useState<'earth' | 'moon' | 'mars'>('earth');

  // Animation state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [simTime, setSimTime] = useState<number>(0);
  const animationFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const angleRad = degreesToRadians(angleDeg);
  const params: ProjectileMotionParameters = {
    initialSpeed: speed,
    launchAngle: angleRad,
    gravity,
    initialHeight: 0,
  };

  const terminalTime = projectileMotionModel.computeTerminalTime(params) ?? 0;
  const currentState = projectileMotionModel.computeState(params, simTime);
  const measurements = projectileMotionModel.computeMeasurements(params, currentState);

  // Environmental presets
  const handleSelectEnv = (env: 'earth' | 'moon' | 'mars') => {
    setEnvironment(env);
    if (env === 'earth') setGravity(9.81);
    if (env === 'moon') setGravity(1.62);
    if (env === 'mars') setGravity(3.71);
    handleReset();
  };

  // Launch animation
  const handleLaunch = () => {
    setIsRunning(true);
    setSimTime(0);
    startTimeRef.current = performance.now();
  };

  const handleReset = () => {
    setIsRunning(false);
    setSimTime(0);
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  // Animation Loop
  useEffect(() => {
    if (!isRunning) return;

    const tick = (now: number) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsedWallSec = (now - startTimeRef.current) / 1000;
      // Normal playback speed
      const newTime = elapsedWallSec;

      if (newTime >= terminalTime) {
        setSimTime(terminalTime);
        setIsRunning(false);
      } else {
        setSimTime(newTime);
        animationFrameRef.current = requestAnimationFrame(tick);
      }
    };

    animationFrameRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRunning, terminalTime]);

  // Canvas Rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;

    ctx.save();
    ctx.scale(dpr, dpr);
    const width = rect.width;
    const height = rect.height;

    // Solid dark slate background (Zero gradients)
    ctx.fillStyle = '#090D16';
    ctx.fillRect(0, 0, width, height);

    // Coordinate mapping: origin at (40px, height - 35px)
    const originX = 45;
    const originY = height - 35;
    const maxRangeTheoretical = Math.max(
      40,
      measurements.range?.value || 40,
      (speed * speed) / Math.max(gravity, 1.62)
    );
    const scale = Math.min((width - 80) / maxRangeTheoretical, (height - 70) / (maxRangeTheoretical * 0.5));

    // Ground line (Solid dark zinc)
    ctx.strokeStyle = '#27272A';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, originY);
    ctx.lineTo(width - 10, originY);
    ctx.stroke();

    // Ground hash marks
    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1;
    for (let x = 10; x < width - 10; x += 15) {
      ctx.beginPath();
      ctx.moveTo(x, originY);
      ctx.lineTo(x - 5, originY + 6);
      ctx.stroke();
    }

    // Origin Platform
    ctx.fillStyle = '#3F3F46';
    ctx.fillRect(originX - 12, originY, 24, 6);

    // Theoretical Trajectory Arc (Solid blue dashed line)
    if (terminalTime > 0) {
      ctx.strokeStyle = '#2563EB60';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      const steps = 60;
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * terminalTime;
        const px = speed * Math.cos(angleRad) * t;
        const py = speed * Math.sin(angleRad) * t - 0.5 * gravity * t * t;
        const sx = originX + px * scale;
        const sy = originY - py * scale;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    }

    // Active Drawn Trajectory Path (Solid Cyan)
    if (simTime > 0) {
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 3;
      ctx.beginPath();
      const activeSteps = Math.min(80, Math.ceil((simTime / terminalTime) * 80) || 1);
      for (let i = 0; i <= activeSteps; i++) {
        const t = (i / activeSteps) * simTime;
        const px = speed * Math.cos(angleRad) * t;
        const py = Math.max(0, speed * Math.sin(angleRad) * t - 0.5 * gravity * t * t);
        const sx = originX + px * scale;
        const sy = originY - py * scale;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.stroke();
    }

    // Articulated Cannon Barrel at (originX, originY)
    ctx.save();
    ctx.translate(originX, originY);
    ctx.rotate(-angleRad);
    ctx.fillStyle = '#2563EB'; // Solid Electric Blue
    ctx.fillRect(0, -5, 26, 10);
    ctx.strokeStyle = '#1D4ED8';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(0, -5, 26, 10);
    ctx.restore();

    // Cannon Pivot Wheel
    ctx.fillStyle = '#18181B';
    ctx.beginPath();
    ctx.arc(originX, originY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Current Projectile (Solid Orange Orb)
    const currentPx = currentState.position.x;
    const currentPy = currentState.position.y;
    const ballScreenX = originX + currentPx * scale;
    const ballScreenY = originY - currentPy * scale;

    ctx.fillStyle = '#F97316';
    ctx.beginPath();
    ctx.arc(ballScreenX, ballScreenY, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Apex Marker Flag
    const apexHeight = measurements.maxHeight?.value || 0;
    const apexTime = measurements.timeToMaxHeight?.value || 0;
    const apexDist = speed * Math.cos(angleRad) * apexTime;
    const apexScreenX = originX + apexDist * scale;
    const apexScreenY = originY - apexHeight * scale;

    if (apexHeight > 0) {
      ctx.fillStyle = '#8B5CF6'; // Solid Violet
      ctx.beginPath();
      ctx.arc(apexScreenX, apexScreenY, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#A78BFA';
      ctx.font = '9px monospace';
      ctx.fillText(`Apex: ${apexHeight.toFixed(1)}m`, apexScreenX - 22, apexScreenY - 8);
    }

    ctx.restore();
  }, [speed, angleRad, gravity, simTime, terminalTime, currentState, measurements]);

  return (
    <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0B1120] shadow-xl overflow-hidden flex flex-col">
      {/* Simulation Scene Canvas Viewport */}
      <div className="relative w-full h-56 sm:h-72 bg-[#090D16] select-none">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Live HUD Telemetry Header */}
        <div className="absolute top-2.5 left-3 right-3 flex items-center justify-between text-xs font-mono pointer-events-none">
          <div className="flex items-center gap-2 bg-black/80 px-2.5 py-1 rounded border border-white/10 text-zinc-300">
            <span>t: <strong className="text-white">{currentState.time.toFixed(2)}s</strong></span>
            <span className="text-zinc-600">&bull;</span>
            <span>x: <strong className="text-white">{currentState.position.x.toFixed(1)}m</strong></span>
            <span className="text-zinc-600">&bull;</span>
            <span>y: <strong className="text-emerald-400">{currentState.position.y.toFixed(1)}m</strong></span>
            <span className="text-zinc-600">&bull;</span>
            <span>|v|: <strong className="text-blue-400">{currentState.speed.toFixed(1)}m/s</strong></span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 bg-black/80 px-2 py-1 rounded border border-white/10 text-[11px] text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Analytical Engine Active</span>
          </div>
        </div>

        {/* Launch Floating Action Button (Overlay bottom-right) */}
        <div className="absolute bottom-2.5 right-3 flex items-center gap-2">
          {isRunning ? (
            <Button
              size="sm"
              onClick={handleReset}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold h-7 px-2.5 text-xs border border-zinc-700"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" />
              <span>Reset</span>
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={handleLaunch}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold h-7 px-3 text-xs shadow-md"
            >
              <Play className="w-3.5 h-3.5 mr-1 fill-current" />
              <span>Fire Cannon!</span>
            </Button>
          )}
        </div>
      </div>

      {/* Interactive Controls Strip */}
      <div className="p-4 bg-zinc-50 dark:bg-[#0F172A] border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {/* Initial Speed Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-300 font-semibold">
              <span>Speed (v₀)</span>
              <span className="font-mono text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                {speed} m/s
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={40}
              step={1}
              value={speed}
              disabled={isRunning}
              onChange={(e) => {
                setSpeed(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-[#2563EB] cursor-pointer h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-lg"
            />
          </div>

          {/* Launch Angle Slider */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-300 font-semibold">
              <span>Angle (θ)</span>
              <span className="font-mono text-zinc-900 dark:text-white bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                {angleDeg}°
              </span>
            </div>
            <input
              type="range"
              min={10}
              max={85}
              step={1}
              value={angleDeg}
              disabled={isRunning}
              onChange={(e) => {
                setAngleDeg(Number(e.target.value));
                handleReset();
              }}
              className="w-full accent-[#2563EB] cursor-pointer h-1.5 bg-zinc-300 dark:bg-zinc-700 rounded-lg"
            />
          </div>

          {/* Environmental Gravity Switcher */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-zinc-700 dark:text-zinc-300 font-semibold">
              <span>Gravity Field</span>
              <span className="font-mono text-zinc-900 dark:text-white text-[11px]">
                {gravity} m/s²
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1">
              <button
                type="button"
                onClick={() => handleSelectEnv('earth')}
                className={`py-1 px-1.5 rounded text-[11px] font-bold border flex items-center justify-center gap-1 transition-colors ${
                  environment === 'earth'
                    ? 'bg-[#2563EB] text-white border-transparent'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <Globe2 className="w-3 h-3" />
                <span>Earth</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectEnv('moon')}
                className={`py-1 px-1.5 rounded text-[11px] font-bold border flex items-center justify-center gap-1 transition-colors ${
                  environment === 'moon'
                    ? 'bg-[#2563EB] text-white border-transparent'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Moon</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectEnv('mars')}
                className={`py-1 px-1.5 rounded text-[11px] font-bold border flex items-center justify-center gap-1 transition-colors ${
                  environment === 'mars'
                    ? 'bg-[#2563EB] text-white border-transparent'
                    : 'bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-700'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>Mars</span>
              </button>
            </div>
          </div>
        </div>

        {/* Action Link into Full Laboratory */}
        <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-medium hidden sm:inline">
            Interactive preview powered by Prismora Engine v0.1
          </span>
          <Link href="/experiments/projectile-motion" className="w-full sm:w-auto">
            <Button
              size="sm"
              variant="outline"
              className="w-full sm:w-auto h-7 text-xs font-bold border-zinc-300 dark:border-zinc-700 text-[#2563EB] hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <span>Launch Full Laboratory Apparatus</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
