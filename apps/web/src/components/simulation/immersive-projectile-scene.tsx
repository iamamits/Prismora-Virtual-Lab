'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { ProjectileMotionState, Vector2D } from '@prismora/simulation-core';
import { SceneCamera } from './scene-camera';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Crosshair,
  Ruler,
  Target as TargetIcon,
  Sparkles,
  Eye,
  Grid,
} from 'lucide-react';

export type EnvironmentTheme = 'earth' | 'moon' | 'mars' | 'space';

export interface InteractiveSceneProps {
  currentState: ProjectileMotionState;
  trajectoryHistory: readonly ProjectileMotionState[];
  initialHeight: number;
  launchAngle: number; // in radians
  initialSpeed: number;
  gravity: number;
  flightTime: number | null;
  maxHeight: number;
  maxRange: number | null;
  onUpdateHeight: (newHeight: number) => void;
  onUpdateAngle: (newAngleRad: number) => void;
  onProbeSample?: (sample: { t: number; x: number; y: number; vx: number; vy: number; speed: number }) => void;
  theme?: EnvironmentTheme;
  showVelocityVector?: boolean;
  showAccelerationVector?: boolean;
  showTrajectoryTrace?: boolean;
  showGrid?: boolean;
  className?: string;
}

type DragTarget =
  | 'none'
  | 'pan'
  | 'launcher-height'
  | 'launcher-angle'
  | 'target'
  | 'probe'
  | 'tape-origin'
  | 'tape-tip';

interface TapeState {
  origin: { x: number; y: number }; // World coords (m)
  tip: { x: number; y: number };    // World coords (m)
}

interface ProbeState {
  x: number; // World coords (m)
  y: number; // World coords (m)
}

export const ImmersiveProjectileScene: React.FC<InteractiveSceneProps> = ({
  currentState,
  trajectoryHistory,
  initialHeight,
  launchAngle,
  initialSpeed,
  gravity,
  flightTime,
  maxHeight,
  maxRange,
  onUpdateHeight,
  onUpdateAngle,
  onProbeSample,
  theme = 'earth',
  showVelocityVector = true,
  showAccelerationVector = true,
  showTrajectoryTrace = true,
  showGrid = true,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Camera instance
  const cameraRef = useRef<SceneCamera>(new SceneCamera(1.0, 0, 0));
  const camera = cameraRef.current;

  // Interactive Tools state
  const [targetDistance, setTargetDistance] = useState<number>(30); // Target at x=30m initially
  const [isTargetHit, setIsTargetHit] = useState<boolean>(false);
  const [showProbe, setShowProbe] = useState<boolean>(false);
  const [showTape, setShowTape] = useState<boolean>(false);

  // Draggable tool positions (world coords in meters)
  const [probe, setProbe] = useState<ProbeState>({ x: 15, y: 10 });
  const [tape, setTape] = useState<TapeState>({
    origin: { x: 0, y: 0 },
    tip: { x: 30, y: 0 },
  });

  // Active interaction drag state
  const [dragMode, setDragMode] = useState<DragTarget>('none');
  const dragStartRef = useRef<{ clientX: number; clientY: number; cameraPanX: number; cameraPanY: number }>({
    clientX: 0,
    clientY: 0,
    cameraPanX: 0,
    cameraPanY: 0,
  });

  // Particle effects on impact / muzzle blast
  const [impactParticles, setImpactParticles] = useState<Array<{ x: number; y: number; vx: number; vy: number; life: number; color: string }>>([]);

  // Check target hit when simulation completes
  useEffect(() => {
    if (currentState.terminated && maxRange !== null) {
      const distanceDiff = Math.abs(currentState.position.x - targetDistance);
      if (distanceDiff <= 2.0) {
        setIsTargetHit(true);
      } else {
        setIsTargetHit(false);
      }
    } else if (currentState.time === 0) {
      setIsTargetHit(false);
    }
  }, [currentState.terminated, currentState.position.x, targetDistance, maxRange, currentState.time]);

  // Main Render Loop
  const renderScene = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;
    const vp = { width, height, dpr };

    ctx.clearRect(0, 0, width, height);

    // 1. Draw Environmental Backdrop
    drawEnvironment(ctx, vp, theme);

    // 2. Coordinate Grid
    if (showGrid) {
      drawCoordinateGrid(ctx, vp, camera, theme);
    }

    // 3. Ground & Terrain Strata
    drawGround(ctx, vp, camera, theme);

    // 4. Interactive Target
    drawTarget(ctx, vp, camera, targetDistance, isTargetHit);

    // 5. Trajectory History Trace & Timestamp dots
    if (showTrajectoryTrace && trajectoryHistory.length > 0) {
      drawTrajectory(ctx, vp, camera, trajectoryHistory, currentState, theme);
    }

    // 6. Max Height & Theoretical Range markers
    drawAnalyticalMarkers(ctx, vp, camera, maxHeight, maxRange, initialHeight);

    // 7. Articulated Launcher Platform
    drawArticulatedLauncher(ctx, vp, camera, initialHeight, launchAngle, initialSpeed, theme);

    // 8. Projectile with Specular Shading & Vectors
    drawProjectile(
      ctx,
      vp,
      camera,
      currentState,
      showVelocityVector,
      showAccelerationVector,
    );

    // 9. Interactive Measuring Tape (if enabled)
    if (showTape) {
      drawMeasuringTape(ctx, vp, camera, tape);
    }

    // 10. Interactive Kinematics Probe (if enabled)
    if (showProbe) {
      drawKinematicsProbe(ctx, vp, camera, probe, trajectoryHistory, onProbeSample);
    }

    // 11. Target Hit Banner effect
    if (isTargetHit) {
      drawHitBanner(ctx, vp, targetDistance, currentState.position.x);
    }
  }, [
    camera,
    theme,
    showGrid,
    targetDistance,
    isTargetHit,
    showTrajectoryTrace,
    trajectoryHistory,
    currentState,
    maxHeight,
    maxRange,
    initialHeight,
    launchAngle,
    initialSpeed,
    showVelocityVector,
    showAccelerationVector,
    showTape,
    tape,
    showProbe,
    probe,
    onProbeSample,
  ]);

  // Auto resize canvas & redraw
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

      renderScene();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, [renderScene]);

  // Redraw when scene properties update
  useEffect(() => {
    renderScene();
  }, [renderScene]);

  // Mouse & Touch Pointer Handlers for Real Scene Manipulations
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const vp = { width: canvas.width, height: canvas.height, dpr };

    const screenX = (e.clientX - rect.left) * dpr;
    const screenY = (e.clientY - rect.top) * dpr;
    const world = camera.screenToWorld(screenX, screenY, vp);

    // 1. Check Launcher Height Handle Hit (around x=0, y=initialHeight)
    const launcherScreen = camera.worldToScreen(0, initialHeight, vp);
    const distToLauncher = Math.hypot(screenX - launcherScreen.x, screenY - launcherScreen.y);
    if (distToLauncher <= 28 * dpr) {
      setDragMode('launcher-height');
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // 2. Check Launcher Angle Tip Handle Hit
    const barrelLengthMeters = 2.4;
    const barrelTipWorld = {
      x: barrelLengthMeters * Math.cos(launchAngle),
      y: initialHeight + barrelLengthMeters * Math.sin(launchAngle),
    };
    const tipScreen = camera.worldToScreen(barrelTipWorld.x, barrelTipWorld.y, vp);
    const distToTip = Math.hypot(screenX - tipScreen.x, screenY - tipScreen.y);
    if (distToTip <= 24 * dpr) {
      setDragMode('launcher-angle');
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // 3. Check Target Hit (around x=targetDistance, y=0)
    const targetScreen = camera.worldToScreen(targetDistance, 0, vp);
    const distToTarget = Math.hypot(screenX - targetScreen.x, screenY - (targetScreen.y - 15 * dpr));
    if (distToTarget <= 28 * dpr) {
      setDragMode('target');
      canvas.setPointerCapture(e.pointerId);
      return;
    }

    // 4. Check Tape Handles
    if (showTape) {
      const originScreen = camera.worldToScreen(tape.origin.x, tape.origin.y, vp);
      if (Math.hypot(screenX - originScreen.x, screenY - originScreen.y) <= 20 * dpr) {
        setDragMode('tape-origin');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
      const tipTapeScreen = camera.worldToScreen(tape.tip.x, tape.tip.y, vp);
      if (Math.hypot(screenX - tipTapeScreen.x, screenY - tipTapeScreen.y) <= 20 * dpr) {
        setDragMode('tape-tip');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    // 5. Check Probe Handle
    if (showProbe) {
      const probeScreen = camera.worldToScreen(probe.x, probe.y, vp);
      if (Math.hypot(screenX - probeScreen.x, screenY - probeScreen.y) <= 28 * dpr) {
        setDragMode('probe');
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }

    // Default: Pan the entire scene
    setDragMode('pan');
    dragStartRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      cameraPanX: camera.panX,
      cameraPanY: camera.panY,
    };
    canvas.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || dragMode === 'none') return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const vp = { width: canvas.width, height: canvas.height, dpr };

    const screenX = (e.clientX - rect.left) * dpr;
    const screenY = (e.clientY - rect.top) * dpr;
    const world = camera.screenToWorld(screenX, screenY, vp);

    if (dragMode === 'pan') {
      const dxPx = (e.clientX - dragStartRef.current.clientX) * dpr;
      const dyPx = (e.clientY - dragStartRef.current.clientY) * dpr;
      const dxMeters = camera.pixelsToMeters(dxPx, dpr);
      const dyMeters = camera.pixelsToMeters(dyPx, dpr);
      camera.setPan(
        dragStartRef.current.cameraPanX - dxMeters,
        dragStartRef.current.cameraPanY + dyMeters,
      );
      renderScene();
    } else if (dragMode === 'launcher-height') {
      // Clamped height in meters [0, 80]
      const newHeight = Math.max(0, Math.min(80, Math.round(world.y * 2) / 2));
      onUpdateHeight(newHeight);
    } else if (dragMode === 'launcher-angle') {
      // Calculate angle from pivot (0, initialHeight) to pointer
      const dx = world.x - 0;
      const dy = world.y - initialHeight;
      let angle = Math.atan2(dy, dx);
      // Clamp between -Math.PI/2 (-90°) and Math.PI/2 (90°)
      angle = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, angle));
      onUpdateAngle(angle);
    } else if (dragMode === 'target') {
      // Move target along the ground [5m, 150m]
      const newTargetX = Math.max(5, Math.min(150, Math.round(world.x * 2) / 2));
      setTargetDistance(newTargetX);
    } else if (dragMode === 'probe') {
      // Move probe freely and snap to nearest trajectory point if near
      let probeX = Math.max(0, world.x);
      let probeY = Math.max(0, world.y);

      // Check proximity to trajectory points for magnetic snap
      for (const pt of trajectoryHistory) {
        const ptScreen = camera.worldToScreen(pt.position.x, pt.position.y, vp);
        if (Math.hypot(screenX - ptScreen.x, screenY - ptScreen.y) <= 18 * dpr) {
          probeX = pt.position.x;
          probeY = pt.position.y;
          break;
        }
      }
      setProbe({ x: probeX, y: probeY });
    } else if (dragMode === 'tape-origin') {
      setTape((prev) => ({
        ...prev,
        origin: { x: Math.max(0, world.x), y: Math.max(0, world.y) },
      }));
    } else if (dragMode === 'tape-tip') {
      setTape((prev) => ({
        ...prev,
        tip: { x: Math.max(0, world.x), y: Math.max(0, world.y) },
      }));
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setDragMode('none');
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore if pointer capture was already released
    }
  };

  // Mouse wheel zoom anchored at cursor (attached via native non-passive listener to allow preventDefault safely)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const vp = { width: canvas.width, height: canvas.height, dpr };

      const screenX = (e.clientX - rect.left) * dpr;
      const screenY = (e.clientY - rect.top) * dpr;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      camera.setZoom(camera.zoom * zoomFactor, screenX, screenY, vp);
      renderScene();
    };

    canvas.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      canvas.removeEventListener('wheel', onWheel);
    };
  }, [camera, renderScene]);

  const handleZoomIn = () => {
    camera.setZoom(camera.zoom * 1.25);
    renderScene();
  };

  const handleZoomOut = () => {
    camera.setZoom(camera.zoom * 0.8);
    renderScene();
  };

  const handleResetCamera = () => {
    camera.resetView();
    renderScene();
  };

  const handleFitToTrajectory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const vp = { width: canvas.width, height: canvas.height, dpr };

    const effectiveMaxX = Math.max(25, maxRange ?? 30, targetDistance + 10);
    const effectiveMaxY = Math.max(15, maxHeight * 1.15, initialHeight + 5);

    camera.fitBounds(
      {
        worldMinX: -2,
        worldMaxX: effectiveMaxX,
        worldMinY: 0,
        worldMaxY: effectiveMaxY,
      },
      vp,
    );
    renderScene();
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full min-h-[460px] overflow-hidden select-none touch-none ${className}`}
    >
      {/* Interactive 2D Canvas */}
      <canvas
        ref={canvasRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="w-full h-full block cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Floating Scene Controls Toolbar (Top Left) */}
      <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 bg-black/60 dark:bg-zinc-900/80 backdrop-blur-md p-1.5 rounded-lg border border-white/10 shadow-lg text-white text-xs">
        {/* Zoom In */}
        <button
          onClick={handleZoomIn}
          className="p-1.5 rounded hover:bg-white/20 transition-colors"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        {/* Zoom Out */}
        <button
          onClick={handleZoomOut}
          className="p-1.5 rounded hover:bg-white/20 transition-colors"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        {/* Reset View */}
        <button
          onClick={handleResetCamera}
          className="p-1.5 rounded hover:bg-white/20 transition-colors text-[11px] font-mono"
          title="Reset View 1:1"
        >
          100%
        </button>

        {/* Fit to Trajectory */}
        <button
          onClick={handleFitToTrajectory}
          className="p-1.5 rounded hover:bg-white/20 transition-colors"
          title="Fit Camera to Trajectory"
          aria-label="Fit View"
        >
          <Maximize2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 bg-white/20 mx-0.5" />

        {/* Kinematics Probe Tool Toggle */}
        <button
          onClick={() => setShowProbe(!showProbe)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
            showProbe ? 'bg-indigo-600 text-white font-semibold' : 'hover:bg-white/20 text-zinc-300'
          }`}
          title="Kinematics Measurement Probe"
        >
          <Crosshair className="w-3.5 h-3.5" />
          <span>Probe</span>
        </button>

        {/* Measuring Tape Tool Toggle */}
        <button
          onClick={() => setShowTape(!showTape)}
          className={`flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors ${
            showTape ? 'bg-amber-600 text-white font-semibold' : 'hover:bg-white/20 text-zinc-300'
          }`}
          title="Precision Distance Tape"
        >
          <Ruler className="w-3.5 h-3.5" />
          <span>Tape</span>
        </button>
      </div>

      {/* Quick Interactive Hint Overlay (Bottom Left) */}
      <div className="absolute bottom-3 left-3 pointer-events-none hidden sm:flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2.5 py-1 rounded text-[11px] text-zinc-300 border border-white/5">
        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
        <span>Drag Cannon to adjust height &amp; angle • Drag Target on ground • Scroll to zoom</span>
      </div>
    </div>
  );
};

// =========================================================================
// PROCEDURAL VECTOR DRAWING HELPERS
// =========================================================================

/**
 * 1. Draw Environmental Backdrop (Earth, Moon, Mars, Deep Space)
 */
function drawEnvironment(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  theme: EnvironmentTheme,
) {
  const { width, height } = vp;

  if (theme === 'earth') {
    // Realistic Atmospheric Sky Gradient: deep azure blue fading to warm horizon haze
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.75);
    skyGrad.addColorStop(0, '#0284c7'); // Rich stratosphere blue
    skyGrad.addColorStop(0.4, '#38bdf8'); // Sky blue
    skyGrad.addColorStop(0.75, '#bae6fd'); // Atmospheric haze
    skyGrad.addColorStop(1, '#fef08a'); // Warm golden horizon glow
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Subtle sun flare in upper-left
    const sunGrad = ctx.createRadialGradient(width * 0.15, height * 0.15, 10, width * 0.15, height * 0.15, 140);
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    sunGrad.addColorStop(0.3, 'rgba(254, 240, 138, 0.4)');
    sunGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(width * 0.15, height * 0.15, 140, 0, Math.PI * 2);
    ctx.fill();

    // Distant mountain silhouettes (Atmospheric aerial perspective)
    const mountainGrad = ctx.createLinearGradient(0, height * 0.45, 0, height * 0.75);
    mountainGrad.addColorStop(0, '#0369a1');
    mountainGrad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = mountainGrad;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.75);
    ctx.lineTo(width * 0.18, height * 0.52);
    ctx.lineTo(width * 0.35, height * 0.64);
    ctx.lineTo(width * 0.58, height * 0.48);
    ctx.lineTo(width * 0.82, height * 0.62);
    ctx.lineTo(width, height * 0.54);
    ctx.lineTo(width, height * 0.75);
    ctx.closePath();
    ctx.fill();

    // Midground rolling hills (Verdant lush greens with subtle shading)
    const hillGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
    hillGrad.addColorStop(0, '#22c55e');
    hillGrad.addColorStop(0.6, '#16a34a');
    hillGrad.addColorStop(1, '#15803d');
    ctx.fillStyle = hillGrad;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.75);
    ctx.bezierCurveTo(width * 0.25, height * 0.62, width * 0.65, height * 0.74, width, height * 0.68);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.fill();
  } else if (theme === 'moon') {
    // Deep starry vacuum space with subtle nebula
    const moonSky = ctx.createLinearGradient(0, 0, 0, height);
    moonSky.addColorStop(0, '#020617');
    moonSky.addColorStop(1, '#0f172a');
    ctx.fillStyle = moonSky;
    ctx.fillRect(0, 0, width, height);

    // Starfield with variable brightness
    for (let i = 0; i < 50; i++) {
      const sx = (i * 137.5) % width;
      const sy = (i * 269.3) % (height * 0.65);
      const r = (i % 3 === 0 ? 1.5 : 0.8) * vp.dpr;
      ctx.fillStyle = i % 4 === 0 ? '#93c5fd' : '#ffffff';
      ctx.beginPath();
      ctx.arc(sx, sy, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Earth in lunar sky with atmospheric corona
    const earthX = width * 0.82;
    const earthY = height * 0.22;
    const earthR = 30 * vp.dpr;

    const earthAtmosphere = ctx.createRadialGradient(earthX, earthY, earthR * 0.9, earthX, earthY, earthR * 1.3);
    earthAtmosphere.addColorStop(0, 'rgba(56, 189, 248, 0.6)');
    earthAtmosphere.addColorStop(1, 'rgba(56, 189, 248, 0)');
    ctx.fillStyle = earthAtmosphere;
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR * 1.3, 0, Math.PI * 2);
    ctx.fill();

    const earthBody = ctx.createRadialGradient(earthX - 8, earthY - 8, 4, earthX, earthY, earthR);
    earthBody.addColorStop(0, '#60a5fa');
    earthBody.addColorStop(0.6, '#1d4ed8');
    earthBody.addColorStop(1, '#0f172a');
    ctx.fillStyle = earthBody;
    ctx.beginPath();
    ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
    ctx.fill();
  } else if (theme === 'mars') {
    // Martian terracotta sky with dusty atmospheric scattering
    const marsSky = ctx.createLinearGradient(0, 0, 0, height * 0.75);
    marsSky.addColorStop(0, '#7c2d12');
    marsSky.addColorStop(0.5, '#c2410c');
    marsSky.addColorStop(1, '#fed7aa');
    ctx.fillStyle = marsSky;
    ctx.fillRect(0, 0, width, height);

    // Distant Martian crater rim ridges
    const ridgeGrad = ctx.createLinearGradient(0, height * 0.55, 0, height * 0.75);
    ridgeGrad.addColorStop(0, '#9a3412');
    ridgeGrad.addColorStop(1, '#7c2d12');
    ctx.fillStyle = ridgeGrad;
    ctx.beginPath();
    ctx.moveTo(0, height * 0.75);
    ctx.lineTo(width * 0.35, height * 0.58);
    ctx.lineTo(width * 0.65, height * 0.7);
    ctx.lineTo(width * 0.88, height * 0.6);
    ctx.lineTo(width, height * 0.75);
    ctx.closePath();
    ctx.fill();
  } else {
    // Zero-G Deep Space with cosmic nebula
    const spaceGrad = ctx.createLinearGradient(0, 0, width, height);
    spaceGrad.addColorStop(0, '#090d16');
    spaceGrad.addColorStop(0.5, '#0f172a');
    spaceGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, width, height);

    // Glowing cosmic dust cloud
    const nebula = ctx.createRadialGradient(width * 0.7, height * 0.35, 10, width * 0.7, height * 0.35, width * 0.3);
    nebula.addColorStop(0, 'rgba(168, 85, 247, 0.25)');
    nebula.addColorStop(0.5, 'rgba(56, 189, 248, 0.12)');
    nebula.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebula;
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * 2. Coordinate Grid with adaptive scale
 */
function drawCoordinateGrid(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  camera: SceneCamera,
  theme: EnvironmentTheme,
) {
  const dpr = vp.dpr;
  const gridStepMeters = camera.zoom < 0.6 ? 20 : camera.zoom > 2.0 ? 2 : 5;

  ctx.strokeStyle =
    theme === 'earth'
      ? 'rgba(255, 255, 255, 0.25)'
      : 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = 1 * dpr;

  ctx.fillStyle =
    theme === 'earth' ? 'rgba(15, 23, 42, 0.7)' : 'rgba(241, 245, 249, 0.7)';
  ctx.font = `${10 * dpr}px JetBrains Mono, monospace`;
  ctx.textAlign = 'center';

  // Visible bounds
  const topLeftWorld = camera.screenToWorld(0, 0, vp);
  const bottomRightWorld = camera.screenToWorld(vp.width, vp.height, vp);

  const startX = Math.floor(topLeftWorld.x / gridStepMeters) * gridStepMeters;
  const endX = Math.ceil(bottomRightWorld.x / gridStepMeters) * gridStepMeters;

  // Vertical grid lines
  for (let wx = Math.max(0, startX); wx <= endX; wx += gridStepMeters) {
    const pt = camera.worldToScreen(wx, 0, vp);
    ctx.beginPath();
    ctx.moveTo(pt.x, 0);
    ctx.lineTo(pt.x, vp.height);
    ctx.stroke();

    ctx.fillText(`${wx}m`, pt.x, pt.y + 16 * dpr);
  }

  // Horizontal grid lines
  ctx.textAlign = 'right';
  const startY = Math.floor(bottomRightWorld.y / gridStepMeters) * gridStepMeters;
  const endY = Math.ceil(topLeftWorld.y / gridStepMeters) * gridStepMeters;

  for (let wy = Math.max(0, startY); wy <= endY; wy += gridStepMeters) {
    const pt = camera.worldToScreen(0, wy, vp);
    ctx.beginPath();
    ctx.moveTo(0, pt.y);
    ctx.lineTo(vp.width, pt.y);
    ctx.stroke();

    if (wy > 0) {
      ctx.fillText(`${wy}m`, pt.x - 10 * dpr, pt.y + 4 * dpr);
    }
  }
}

/**
 * 3. Ground & Geological Cross-section (Realistic Strata & Gradients)
 */
function drawGround(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  camera: SceneCamera,
  theme: EnvironmentTheme,
) {
  const dpr = vp.dpr;
  const groundScreen = camera.worldToScreen(0, 0, vp);
  const groundY = groundScreen.y;

  // Ground layer colors based on celestial theme
  let topColorStart = '#22c55e'; // Vibrant turf
  let topColorEnd = '#15803d'; // Deep turf
  let bodyColorStart = '#92400e'; // Warm subsoil
  let bodyColorEnd = '#451a03'; // Compacted earth
  let bedrockColor = '#1c1917'; // Hard granite bedrock

  if (theme === 'moon') {
    topColorStart = '#cbd5e1';
    topColorEnd = '#94a3b8';
    bodyColorStart = '#64748b';
    bodyColorEnd = '#334155';
    bedrockColor = '#0f172a';
  } else if (theme === 'mars') {
    topColorStart = '#ea580c';
    topColorEnd = '#c2410c';
    bodyColorStart = '#9a3412';
    bodyColorEnd = '#7c2d12';
    bedrockColor = '#431407';
  } else if (theme === 'space') {
    topColorStart = '#6366f1';
    topColorEnd = '#4338ca';
    bodyColorStart = '#3730a3';
    bodyColorEnd = '#1e1b4b';
    bedrockColor = '#090d16';
  }

  // Top surface strip with lighting gradient
  const turfGrad = ctx.createLinearGradient(0, groundY, 0, groundY + 12 * dpr);
  turfGrad.addColorStop(0, topColorStart);
  turfGrad.addColorStop(1, topColorEnd);
  ctx.fillStyle = turfGrad;
  ctx.fillRect(0, groundY, vp.width, 12 * dpr);

  // Subsurface strata with organic geological gradient
  const strataHeight = Math.max(1, vp.height - (groundY + 12 * dpr));
  const strataGrad = ctx.createLinearGradient(0, groundY + 12 * dpr, 0, groundY + 12 * dpr + Math.min(180 * dpr, strataHeight));
  strataGrad.addColorStop(0, bodyColorStart);
  strataGrad.addColorStop(0.35, bodyColorEnd);
  strataGrad.addColorStop(1, bedrockColor);
  ctx.fillStyle = strataGrad;
  ctx.fillRect(0, groundY + 12 * dpr, vp.width, strataHeight);

  // Surface datum baseline - glowing coordinate reference
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  ctx.lineTo(vp.width, groundY);
  ctx.stroke();
}

/**
 * 4. Articulated Launcher Platform with Elevation Pillar & Rotating Barrel
 */
function drawArticulatedLauncher(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  camera: SceneCamera,
  heightMeters: number,
  angleRad: number,
  speedMetersPerSec: number,
  theme: EnvironmentTheme,
) {
  const dpr = vp.dpr;
  const groundPt = camera.worldToScreen(0, 0, vp);
  const pivotPt = camera.worldToScreen(0, heightMeters, vp);

  // Elevation pillar (if height > 0)
  if (heightMeters > 0) {
    const pillarWidth = 24 * dpr;
    // Hydraulic cylinder with cylindrical metallic chrome gradient
    const pillarGrad = ctx.createLinearGradient(
      pivotPt.x - pillarWidth / 2,
      0,
      pivotPt.x + pillarWidth / 2,
      0,
    );
    pillarGrad.addColorStop(0, '#1e293b');
    pillarGrad.addColorStop(0.2, '#64748b');
    pillarGrad.addColorStop(0.45, '#e2e8f0'); // Specular highlight
    pillarGrad.addColorStop(0.7, '#94a3b8');
    pillarGrad.addColorStop(1, '#334155');

    ctx.fillStyle = pillarGrad;
    ctx.fillRect(pivotPt.x - pillarWidth / 2, pivotPt.y, pillarWidth, groundPt.y - pivotPt.y);

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5 * dpr;
    ctx.strokeRect(pivotPt.x - pillarWidth / 2, pivotPt.y, pillarWidth, groundPt.y - pivotPt.y);

    // Height markings on pillar
    ctx.fillStyle = '#0f172a';
    ctx.font = `bold ${10 * dpr}px JetBrains Mono, monospace`;
    ctx.textAlign = 'right';
    ctx.fillText(`y₀ = ${heightMeters.toFixed(1)}m`, pivotPt.x - pillarWidth / 2 - 8 * dpr, (pivotPt.y + groundPt.y) / 2);
  }

  // Heavy Base Carriage with Wheels
  const carriageWidth = 44 * dpr;
  const carriageHeight = 16 * dpr;
  const carriageGrad = ctx.createLinearGradient(0, groundPt.y - carriageHeight, 0, groundPt.y);
  carriageGrad.addColorStop(0, '#475569');
  carriageGrad.addColorStop(1, '#1e293b');
  ctx.fillStyle = carriageGrad;
  ctx.fillRect(groundPt.x - carriageWidth / 2, groundPt.y - carriageHeight, carriageWidth, carriageHeight);

  // Wheels with hubcaps
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(groundPt.x - carriageWidth * 0.35, groundPt.y - 4 * dpr, 8 * dpr, 0, Math.PI * 2);
  ctx.arc(groundPt.x + carriageWidth * 0.35, groundPt.y - 4 * dpr, 8 * dpr, 0, Math.PI * 2);
  ctx.fill();

  // Launcher Platform Head / Turret Mount with metallic radial shading
  const turretGrad = ctx.createRadialGradient(
    pivotPt.x - 3 * dpr,
    pivotPt.y - 3 * dpr,
    2 * dpr,
    pivotPt.x,
    pivotPt.y,
    14 * dpr,
  );
  turretGrad.addColorStop(0, '#94a3b8');
  turretGrad.addColorStop(0.6, '#475569');
  turretGrad.addColorStop(1, '#0f172a');
  ctx.fillStyle = turretGrad;
  ctx.beginPath();
  ctx.arc(pivotPt.x, pivotPt.y, 14 * dpr, 0, Math.PI * 2);
  ctx.fill();

  // Angle Protractor Guide Arc behind barrel
  const arcRadius = 36 * dpr;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  ctx.arc(pivotPt.x, pivotPt.y, arcRadius, 0, -angleRad, angleRad < 0);
  ctx.stroke();

  // Rotating Cannon Barrel
  ctx.save();
  ctx.translate(pivotPt.x, pivotPt.y);
  ctx.rotate(-angleRad); // Screen Y is inverted

  const barrelLength = camera.metersToPixels(2.4, dpr);
  const barrelThickness = 14 * dpr;

  // Realistic Gunmetal Cannon Barrel with cylindrical specular lighting
  const barrelGrad = ctx.createLinearGradient(0, -barrelThickness / 2, 0, barrelThickness / 2);
  barrelGrad.addColorStop(0, '#1e293b');
  barrelGrad.addColorStop(0.2, '#64748b');
  barrelGrad.addColorStop(0.35, '#cbd5e1'); // Bright specular gleam
  barrelGrad.addColorStop(0.6, '#334155');
  barrelGrad.addColorStop(1, '#0f172a');

  ctx.fillStyle = barrelGrad;
  ctx.strokeStyle = '#020617';
  ctx.lineWidth = 1.5 * dpr;
  ctx.beginPath();
  ctx.roundRect(-4 * dpr, -barrelThickness / 2, barrelLength, barrelThickness, 3 * dpr);
  ctx.fill();
  ctx.stroke();

  // Golden Brass Muzzle Ring
  const brassGrad = ctx.createLinearGradient(0, -barrelThickness / 2, 0, barrelThickness / 2);
  brassGrad.addColorStop(0, '#78350f');
  brassGrad.addColorStop(0.35, '#fef08a');
  brassGrad.addColorStop(0.7, '#d97706');
  brassGrad.addColorStop(1, '#451a03');
  ctx.fillStyle = brassGrad;
  ctx.fillRect(barrelLength - 4 * dpr, -barrelThickness / 2 - 2 * dpr, 5 * dpr, barrelThickness + 4 * dpr);

  ctx.restore();

  // Interactive Angle Drag Handle (Solid electric blue tip circle)
  const tipScreen = {
    x: pivotPt.x + barrelLength * Math.cos(-angleRad),
    y: pivotPt.y + barrelLength * Math.sin(-angleRad),
  };

  ctx.fillStyle = '#2563eb';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5 * dpr;
  ctx.beginPath();
  ctx.arc(tipScreen.x, tipScreen.y, 7 * dpr, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Interactive Height Drag Handle at Pivot
  ctx.fillStyle = '#fbbf24'; // Prismora Amber handle
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  ctx.arc(pivotPt.x, pivotPt.y, 6 * dpr, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Angle and Speed Pill Label near Launcher
  const deg = Math.round((angleRad * 180) / Math.PI);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
  ctx.fillRect(pivotPt.x - 30 * dpr, pivotPt.y - 48 * dpr, 68 * dpr, 20 * dpr);
  ctx.fillStyle = '#38bdf8';
  ctx.font = `bold ${10 * dpr}px JetBrains Mono, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${deg}° | ${speedMetersPerSec.toFixed(1)}m/s`, pivotPt.x + 4 * dpr, pivotPt.y - 34 * dpr);
}

/**
 * 5. Interactive Draggable Target on Ground
 */
function drawTarget(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  camera: SceneCamera,
  targetDistance: number,
  isHit: boolean,
) {
  const dpr = vp.dpr;
  const targetScreen = camera.worldToScreen(targetDistance, 0, vp);

  const targetRadius = camera.metersToPixels(1.5, dpr); // 1.5m radius
  const ty = targetScreen.y;

  // Target base disk on ground
  ctx.fillStyle = isHit ? '#22c55e' : '#ef4444'; // Green when hit, red default
  ctx.beginPath();
  ctx.ellipse(targetScreen.x, ty, targetRadius, 6 * dpr, 0, 0, Math.PI * 2);
  ctx.fill();

  // Concentric white inner ring
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(targetScreen.x, ty, targetRadius * 0.6, 3.5 * dpr, 0, 0, Math.PI * 2);
  ctx.fill();

  // Center bullseye
  ctx.fillStyle = isHit ? '#15803d' : '#991b1b';
  ctx.beginPath();
  ctx.ellipse(targetScreen.x, ty, targetRadius * 0.25, 1.5 * dpr, 0, 0, Math.PI * 2);
  ctx.fill();

  // Target Flagpole
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  ctx.moveTo(targetScreen.x, ty);
  ctx.lineTo(targetScreen.x, ty - 32 * dpr);
  ctx.stroke();

  // Triangular Flag
  ctx.fillStyle = isHit ? '#22c55e' : '#ef4444';
  ctx.beginPath();
  ctx.moveTo(targetScreen.x, ty - 32 * dpr);
  ctx.lineTo(targetScreen.x + 16 * dpr, ty - 24 * dpr);
  ctx.lineTo(targetScreen.x, ty - 16 * dpr);
  ctx.closePath();
  ctx.fill();

  // Target Distance Tag
  ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
  ctx.fillRect(targetScreen.x - 30 * dpr, ty + 12 * dpr, 60 * dpr, 18 * dpr);
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${10 * dpr}px JetBrains Mono, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`${targetDistance.toFixed(1)}m`, targetScreen.x, ty + 25 * dpr);
}

/**
 * 6. Progressive Trajectory Path with Timestamp Dots
 */
function drawTrajectory(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  camera: SceneCamera,
  history: readonly ProjectileMotionState[],
  currentState: ProjectileMotionState,
  theme: EnvironmentTheme,
) {
  const dpr = vp.dpr;

  // Continuous glow trace
  ctx.strokeStyle = '#06b6d4'; // Glowing cyan
  ctx.lineWidth = 3 * dpr;
  ctx.beginPath();

  const startPt = camera.worldToScreen(history[0]!.position.x, history[0]!.position.y, vp);
  ctx.moveTo(startPt.x, startPt.y);

  for (let i = 1; i < history.length; i++) {
    const pt = camera.worldToScreen(history[i]!.position.x, history[i]!.position.y, vp);
    ctx.lineTo(pt.x, pt.y);
  }
  ctx.stroke();

  // Timestamp dots (every ~5th recorded snapshot)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#0891b2';
  ctx.lineWidth = 1.5 * dpr;

  const dotInterval = Math.max(1, Math.floor(history.length / 25));
  for (let i = 0; i < history.length; i += dotInterval) {
    const pt = camera.worldToScreen(history[i]!.position.x, history[i]!.position.y, vp);
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 2.5 * dpr, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

/**
 * 7. Projectile Body & Real-Time Physical Vectors
 */
function drawProjectile(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  camera: SceneCamera,
  state: ProjectileMotionState,
  showVel: boolean,
  showAccel: boolean,
) {
  const dpr = vp.dpr;
  const currentScreen = camera.worldToScreen(state.position.x, state.position.y, vp);

  // Ground drop shadow
  const groundY = camera.worldToScreen(state.position.x, 0, vp).y;
  const altitude = Math.max(0, state.position.y);
  const shadowScale = Math.max(0.2, 1 - altitude / 50);

  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(currentScreen.x, groundY, 8 * dpr * shadowScale, 3 * dpr * shadowScale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Projectile Atmospheric Energy Halo
  const haloR = 14 * dpr;
  const haloGrad = ctx.createRadialGradient(
    currentScreen.x,
    currentScreen.y,
    6 * dpr,
    currentScreen.x,
    currentScreen.y,
    haloR,
  );
  haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.5)');
  haloGrad.addColorStop(0.5, 'rgba(37, 99, 235, 0.25)');
  haloGrad.addColorStop(1, 'rgba(37, 99, 235, 0)');
  ctx.fillStyle = haloGrad;
  ctx.beginPath();
  ctx.arc(currentScreen.x, currentScreen.y, haloR, 0, Math.PI * 2);
  ctx.fill();

  // Projectile 3D Metallic/Luminescent Sphere with Phong-like specular lighting
  const ballR = 8 * dpr;
  const sphereGrad = ctx.createRadialGradient(
    currentScreen.x - 2.5 * dpr,
    currentScreen.y - 2.5 * dpr,
    1 * dpr,
    currentScreen.x,
    currentScreen.y,
    ballR,
  );
  sphereGrad.addColorStop(0, '#ffffff'); // Specular highlight pinpoint
  sphereGrad.addColorStop(0.25, '#60a5fa'); // Vibrant highlight rim
  sphereGrad.addColorStop(0.65, '#2563eb'); // Core color
  sphereGrad.addColorStop(0.9, '#1d4ed8'); // Ambient rim
  sphereGrad.addColorStop(1, '#0f172a'); // Shadowed limb

  ctx.fillStyle = sphereGrad;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1 * dpr;
  ctx.beginPath();
  ctx.arc(currentScreen.x, currentScreen.y, ballR, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Helper function to draw crisp vector arrows
  const drawArrow = (
    from: { x: number; y: number },
    vec: Vector2D,
    color: string,
    scaleMeters: number,
    label: string,
  ) => {
    const endX = from.x + camera.metersToPixels(vec.x * scaleMeters, dpr);
    const endY = from.y - camera.metersToPixels(vec.y * scaleMeters, dpr); // Invert Y
    const len = Math.hypot(endX - from.x, endY - from.y);

    if (len < 4 * dpr) return;

    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 2.5 * dpr;

    // Shaft
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Arrowhead
    const angle = Math.atan2(endY - from.y, endX - from.x);
    const headLen = 9 * dpr;
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - headLen * Math.cos(angle - Math.PI / 6), endY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(endX - headLen * Math.cos(angle + Math.PI / 6), endY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // Vector Label Tag
    ctx.font = `bold ${10 * dpr}px JetBrains Mono, monospace`;
    ctx.fillText(label, endX + 8 * dpr * Math.cos(angle), endY + 8 * dpr * Math.sin(angle));
  };

  // Velocity Vector (Blue)
  if (showVel) {
    drawArrow(currentScreen, state.velocity, '#3b82f6', 0.15, 'v');
  }

  // Acceleration Vector (Orange)
  if (showAccel) {
    drawArrow(currentScreen, state.acceleration, '#f97316', 0.25, 'a');
  }
}

/**
 * 8. Analytical Apex and Range Markers
 */
function drawAnalyticalMarkers(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  camera: SceneCamera,
  maxHeight: number,
  maxRange: number | null,
  initialHeight: number,
) {
  const dpr = vp.dpr;

  // Max Height horizontal dashed guide line
  if (maxHeight > initialHeight && Number.isFinite(maxHeight)) {
    const apexScreen = camera.worldToScreen(0, maxHeight, vp);
    ctx.strokeStyle = 'rgba(168, 85, 247, 0.5)';
    ctx.lineWidth = 1.5 * dpr;
    ctx.setLineDash([4 * dpr, 4 * dpr]);
    ctx.beginPath();
    ctx.moveTo(0, apexScreen.y);
    ctx.lineTo(vp.width, apexScreen.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#c084fc';
    ctx.font = `bold ${10 * dpr}px JetBrains Mono, monospace`;
    ctx.textAlign = 'left';
    ctx.fillText(`Apex: ${maxHeight.toFixed(2)}m`, 90 * dpr, apexScreen.y - 4 * dpr);
  }

  // Horizontal Range landing indicator
  if (maxRange !== null && maxRange > 0) {
    const rangeScreen = camera.worldToScreen(maxRange, 0, vp);
    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(rangeScreen.x, rangeScreen.y, 4 * dpr, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#4ade80';
    ctx.font = `bold ${10 * dpr}px JetBrains Mono, monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(`Range: ${maxRange.toFixed(2)}m`, rangeScreen.x, rangeScreen.y + 36 * dpr);
  }
}

/**
 * 9. Interactive Measuring Tape (Origin Peg, Tip Peg, Ruler markings)
 */
function drawMeasuringTape(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  camera: SceneCamera,
  tape: TapeState,
) {
  const dpr = vp.dpr;
  const oScreen = camera.worldToScreen(tape.origin.x, tape.origin.y, vp);
  const tScreen = camera.worldToScreen(tape.tip.x, tape.tip.y, vp);

  const deltaX = tape.tip.x - tape.origin.x;
  const deltaY = tape.tip.y - tape.origin.y;
  const distance = Math.hypot(deltaX, deltaY);

  // Yellow ruler tape band
  ctx.strokeStyle = '#eab308'; // Amber 500
  ctx.lineWidth = 8 * dpr;
  ctx.beginPath();
  ctx.moveTo(oScreen.x, oScreen.y);
  ctx.lineTo(tScreen.x, tScreen.y);
  ctx.stroke();

  // Tape borders
  ctx.strokeStyle = '#713f12';
  ctx.lineWidth = 1 * dpr;
  ctx.stroke();

  // Origin Post
  ctx.fillStyle = '#ca8a04';
  ctx.beginPath();
  ctx.arc(oScreen.x, oScreen.y, 8 * dpr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Tip Post (Draggable Handle)
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(tScreen.x, tScreen.y, 8 * dpr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();

  // Measurement Floating HUD Card at Midpoint
  const midX = (oScreen.x + tScreen.x) / 2;
  const midY = (oScreen.y + tScreen.y) / 2 - 20 * dpr;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(midX - 55 * dpr, midY - 14 * dpr, 110 * dpr, 36 * dpr);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 1 * dpr;
  ctx.strokeRect(midX - 55 * dpr, midY - 14 * dpr, 110 * dpr, 36 * dpr);

  ctx.fillStyle = '#fef08a';
  ctx.font = `bold ${10 * dpr}px JetBrains Mono, monospace`;
  ctx.textAlign = 'center';
  ctx.fillText(`d = ${distance.toFixed(2)} m`, midX, midY + 1 * dpr);

  ctx.fillStyle = '#94a3b8';
  ctx.font = `${9 * dpr}px JetBrains Mono, monospace`;
  ctx.fillText(`Δx: ${deltaX.toFixed(1)}m | Δy: ${deltaY.toFixed(1)}m`, midX, midY + 15 * dpr);
}

/**
 * 10. Interactive Kinematics Probe Tool
 */
function drawKinematicsProbe(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  camera: SceneCamera,
  probe: ProbeState,
  history: readonly ProjectileMotionState[],
  onSample?: (sample: { t: number; x: number; y: number; vx: number; vy: number; speed: number }) => void,
) {
  const dpr = vp.dpr;
  const pScreen = camera.worldToScreen(probe.x, probe.y, vp);

  // Reticle Crosshairs
  const crossLen = 14 * dpr;
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 2 * dpr;
  ctx.beginPath();
  ctx.moveTo(pScreen.x - crossLen, pScreen.y);
  ctx.lineTo(pScreen.x + crossLen, pScreen.y);
  ctx.moveTo(pScreen.x, pScreen.y - crossLen);
  ctx.lineTo(pScreen.x, pScreen.y + crossLen);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pScreen.x, pScreen.y, 8 * dpr, 0, Math.PI * 2);
  ctx.stroke();

  // Find nearest snapshot in trajectory history
  let bestPt: ProjectileMotionState | null = null;
  let bestDist = Infinity;

  for (const pt of history) {
    const d = Math.hypot(pt.position.x - probe.x, pt.position.y - probe.y);
    if (d < bestDist) {
      bestDist = d;
      bestPt = pt;
    }
  }

  // Floating Digital HUD Card tethered to probe
  const cardX = pScreen.x + 25 * dpr;
  const cardY = pScreen.y - 45 * dpr;
  const cardW = 125 * dpr;
  const cardH = 68 * dpr;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = '#818cf8';
  ctx.lineWidth = 1 * dpr;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  ctx.fillStyle = '#c7d2fe';
  ctx.font = `bold ${10 * dpr}px JetBrains Mono, monospace`;
  ctx.textAlign = 'left';
  ctx.fillText('KINEMATICS SENSOR', cardX + 8 * dpr, cardY + 14 * dpr);

  ctx.fillStyle = '#ffffff';
  ctx.font = `${9 * dpr}px JetBrains Mono, monospace`;
  if (bestPt && bestDist < 3.0) {
    ctx.fillText(`t: ${bestPt.time.toFixed(2)} s`, cardX + 8 * dpr, cardY + 28 * dpr);
    ctx.fillText(`pos: (${bestPt.position.x.toFixed(1)}, ${bestPt.position.y.toFixed(1)}) m`, cardX + 8 * dpr, cardY + 41 * dpr);
    ctx.fillText(`|v|: ${bestPt.speed.toFixed(2)} m/s`, cardX + 8 * dpr, cardY + 54 * dpr);
    if (onSample) {
      onSample({
        t: bestPt.time,
        x: bestPt.position.x,
        y: bestPt.position.y,
        vx: bestPt.velocity.x,
        vy: bestPt.velocity.y,
        speed: bestPt.speed,
      });
    }
  } else {
    ctx.fillText(`pos: (${probe.x.toFixed(1)}, ${probe.y.toFixed(1)}) m`, cardX + 8 * dpr, cardY + 32 * dpr);
    ctx.fillStyle = '#94a3b8';
    ctx.fillText('(drag over trajectory)', cardX + 8 * dpr, cardY + 48 * dpr);
  }
}

/**
 * 11. Target Hit Banner effect
 */
function drawHitBanner(
  ctx: CanvasRenderingContext2D,
  vp: { width: number; height: number; dpr: number },
  targetDist: number,
  actualX: number,
) {
  const dpr = vp.dpr;
  const bannerW = 240 * dpr;
  const bannerH = 46 * dpr;
  const bx = vp.width / 2 - bannerW / 2;
  const by = 60 * dpr;

  ctx.fillStyle = 'rgba(22, 101, 52, 0.95)';
  ctx.fillRect(bx, by, bannerW, bannerH);
  ctx.strokeStyle = '#4ade80';
  ctx.lineWidth = 2 * dpr;
  ctx.strokeRect(bx, by, bannerW, bannerH);

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${14 * dpr}px sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('🎯 DIRECT HIT ON TARGET!', vp.width / 2, by + 20 * dpr);

  ctx.fillStyle = '#bbf7d0';
  ctx.font = `${10 * dpr}px JetBrains Mono, monospace`;
  ctx.fillText(`Impact: ${actualX.toFixed(2)}m (Target: ${targetDist.toFixed(1)}m)`, vp.width / 2, by + 36 * dpr);
}
