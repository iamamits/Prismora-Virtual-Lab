'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { PhetWorkbench } from './phet-workbench';
import {
  VIRTUAL_WIDTH,
  VIRTUAL_HEIGHT,
  computeViewport,
  applyVirtualViewport,
  screenToVirtualCoords,
} from './viewport-helper';

export interface RealtimeRoboticsSceneProps {
  link1LengthMm: number;
  link2LengthMm: number;
  initialTheta1Deg?: number;
  initialTheta2Deg?: number;
  className?: string;
  onPoseChange?: (pose: {
    theta1Deg: number;
    theta2Deg: number;
    endEffectorXMm: number;
    endEffectorYMm: number;
    jacobianDet: number;
    isSingular: boolean;
    isReachable: boolean;
  }) => void;
}

export function RealtimeRoboticsScene({
  link1LengthMm,
  link2LengthMm,
  initialTheta1Deg = 45,
  initialTheta2Deg = 45,
  className = '',
  onPoseChange,
}: RealtimeRoboticsSceneProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
  const [showTrace, setShowTrace] = useState<boolean>(true);

  // Tools in Virtual Space
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 220, y: 120 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 450,
    y1: 390,
    x2: 650,
    y2: 240,
  });
  const [activeTapeHandle, setActiveTapeHandle] = useState<'none' | 'p1' | 'p2'>('none');

  // Arm state
  const [isDraggingTarget, setIsDraggingTarget] = useState<boolean>(false);

  // World dimensions
  const l1 = link1LengthMm;
  const l2 = link2LengthMm;
  const initialTh1Rad = (initialTheta1Deg * Math.PI) / 180;
  const initialTh2Rad = (initialTheta2Deg * Math.PI) / 180;
  const initX = l1 * Math.cos(initialTh1Rad) + l2 * Math.cos(initialTh1Rad + initialTh2Rad);
  const initY = l1 * Math.sin(initialTh1Rad) + l2 * Math.sin(initialTh1Rad + initialTh2Rad);

  const [targetMm, setTargetMm] = useState<{ x: number; y: number }>({ x: initX, y: initY });

  // Trace history
  const traceHistoryRef = useRef<Array<{ x: number; y: number }>>([]);

  // Base and scaling in Virtual Coordinates (900 x 520)
  const baseX = 450;
  const baseY = 400;
  const pixelsPerMm = 0.38;

  // Analytical Inverse Kinematics
  const solveIK = useCallback(
    (targetX: number, targetY: number) => {
      const distSq = targetX * targetX + targetY * targetY;
      const dist = Math.sqrt(distSq);
      const maxReach = l1 + l2;
      const minReach = Math.abs(l1 - l2);

      const isReachable = dist <= maxReach && dist >= minReach;

      let clampedX = targetX;
      let clampedY = targetY;
      if (dist > maxReach) {
        clampedX = (targetX / dist) * (maxReach - 1);
        clampedY = (targetY / dist) * (maxReach - 1);
      } else if (dist < minReach) {
        clampedX = (targetX / dist) * (minReach + 1);
        clampedY = (targetY / dist) * (minReach + 1);
      }

      const rSq = clampedX * clampedX + clampedY * clampedY;

      // Law of Cosines for theta2
      const cosTheta2 = (rSq - l1 * l1 - l2 * l2) / (2 * l1 * l2);
      const clampedCos2 = Math.max(-1, Math.min(1, cosTheta2));
      const th2Rad = Math.acos(clampedCos2);

      // Theta 1
      const alpha = Math.atan2(clampedY, clampedX);
      const beta = Math.atan2(l2 * Math.sin(th2Rad), l1 + l2 * Math.cos(th2Rad));
      const th1Rad = alpha - beta;

      const th1Deg = (th1Rad * 180) / Math.PI;
      const th2Deg = (th2Rad * 180) / Math.PI;

      // Jacobian determinant = l1 * l2 * sin(theta2)
      const jacDet = (l1 / 1000) * (l2 / 1000) * Math.sin(th2Rad);
      const isSingular = Math.abs(Math.sin(th2Rad)) < 0.05;

      return {
        th1Rad,
        th2Rad,
        th1Deg,
        th2Deg,
        isReachable,
        isSingular,
        jacDet,
        clampedX,
        clampedY,
      };
    },
    [l1, l2],
  );

  // Reset
  const handleReset = useCallback(() => {
    traceHistoryRef.current = [];
    setTargetMm({ x: initX, y: initY });
    setSimTime(0);
  }, [initX, initY]);

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

      const ik = solveIK(targetMm.x, targetMm.y);

      // Forward kinematics for drawing joints
      const joint1X = baseX + l1 * Math.cos(ik.th1Rad) * pixelsPerMm;
      const joint1Y = baseY - l1 * Math.sin(ik.th1Rad) * pixelsPerMm;

      const endX = joint1X + l2 * Math.cos(ik.th1Rad + ik.th2Rad) * pixelsPerMm;
      const endY = joint1Y - l2 * Math.sin(ik.th1Rad + ik.th2Rad) * pixelsPerMm;

      // Record trace
      if (showTrace && isPlaying) {
        const trace = traceHistoryRef.current;
        if (
          trace.length === 0 ||
          Math.hypot(trace[trace.length - 1]!.x - endX, trace[trace.length - 1]!.y - endY) > 2
        ) {
          trace.push({ x: endX, y: endY });
          if (trace.length > 500) trace.shift();
        }
      }

      if (onPoseChange) {
        onPoseChange({
          theta1Deg: ik.th1Deg,
          theta2Deg: ik.th2Deg,
          endEffectorXMm: ik.clampedX,
          endEffectorYMm: ik.clampedY,
          jacobianDet: ik.jacDet,
          isSingular: ik.isSingular,
          isReachable: ik.isReachable,
        });
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

      // Work Surface Platform
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(baseX - 350, baseY + 18, 700, 18);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.strokeRect(baseX - 350, baseY + 18, 700, 18);

      // Workspace Reach Envelopes
      ctx.save();
      const maxReachPx = (l1 + l2) * pixelsPerMm;
      const minReachPx = Math.abs(l1 - l2) * pixelsPerMm;

      // Outer Reach Boundary
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.beginPath();
      ctx.arc(baseX, baseY, maxReachPx, -Math.PI, 0);
      ctx.stroke();

      // Inner Reach Boundary
      if (minReachPx > 5) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.25)';
        ctx.beginPath();
        ctx.arc(baseX, baseY, minReachPx, -Math.PI, 0);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.restore();

      // End-Effector Trajectory Trace
      if (showTrace && traceHistoryRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        const trace = traceHistoryRef.current;
        ctx.moveTo(trace[0]!.x, trace[0]!.y);
        for (let i = 1; i < trace.length; i++) {
          ctx.lineTo(trace[i]!.x, trace[i]!.y);
        }
        ctx.stroke();
        ctx.restore();
      }

      // 1. Robot Base Pedestal
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(baseX - 36, baseY - 6, 72, 26, 6);
      ctx.fill();
      ctx.stroke();

      // Base Turret Joint (Joint 0)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(baseX, baseY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // 2. Link 1 (Shoulder to Elbow)
      ctx.save();
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      ctx.lineTo(joint1X, joint1Y);
      ctx.stroke();

      // Link 1 Core Highlight
      ctx.strokeStyle = '#BAE6FD';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // 3. Elbow Joint (Joint 1)
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(joint1X, joint1Y, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.beginPath();
      ctx.arc(joint1X, joint1Y, 4, 0, Math.PI * 2);
      ctx.fill();

      // 4. Link 2 (Elbow to Wrist / End-Effector)
      ctx.save();
      ctx.strokeStyle = '#A855F7';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(joint1X, joint1Y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      // Link 2 Core Highlight
      ctx.strokeStyle = '#E9D5FF';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // 5. End-Effector Gripper / Tool Head
      ctx.save();
      const toolAngle = ik.th1Rad + ik.th2Rad;
      ctx.translate(endX, endY);
      ctx.rotate(-toolAngle);

      // Tool mount
      ctx.fillStyle = '#E2E8F0';
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-6, -6, 12, 12);

      // Gripper jaws
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(6, -8, 12, 4);
      ctx.fillRect(6, 4, 12, 4);

      // Laser guide dot
      ctx.fillStyle = '#EF4444';
      ctx.beginPath();
      ctx.arc(22, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 6. Interactive Target Crosshair Handle
      const targetScreenX = baseX + targetMm.x * pixelsPerMm;
      const targetScreenY = baseY - targetMm.y * pixelsPerMm;

      ctx.save();
      ctx.strokeStyle = isDraggingTarget ? '#FBBF24' : '#F59E0B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetScreenX, targetScreenY, 18, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(targetScreenX - 24, targetScreenY);
      ctx.lineTo(targetScreenX + 24, targetScreenY);
      ctx.moveTo(targetScreenX, targetScreenY - 24);
      ctx.lineTo(targetScreenX, targetScreenY + 24);
      ctx.stroke();

      ctx.fillStyle = isDraggingTarget ? 'rgba(251, 191, 36, 0.4)' : 'rgba(245, 158, 11, 0.2)';
      ctx.beginPath();
      ctx.arc(targetScreenX, targetScreenY, 10, 0, Math.PI * 2);
      ctx.fill();

      // Target Label
      ctx.fillStyle = '#FDE68A';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`TARGET (${targetMm.x}, ${targetMm.y})mm`, targetScreenX, targetScreenY - 28);
      ctx.restore();

      // 7. Joint Angle Vector Arcs
      if (showVectors) {
        ctx.save();
        // Theta 1 Arc
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(baseX, baseY, 35, 0, -ik.th1Rad, true);
        ctx.stroke();
        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText(`θ₁ = ${ik.th1Deg.toFixed(1)}°`, baseX + 42, baseY - 12);

        // Theta 2 Arc
        ctx.strokeStyle = '#A855F7';
        ctx.beginPath();
        ctx.arc(joint1X, joint1Y, 28, -ik.th1Rad, -ik.th1Rad - ik.th2Rad, true);
        ctx.stroke();
        ctx.fillStyle = '#C084FC';
        ctx.fillText(`θ₂ = ${ik.th2Deg.toFixed(1)}°`, joint1X + 32, joint1Y - 10);
        ctx.restore();
      }

      // 8. Kinematics Telemetry Card (Right Top: 680 to 870)
      ctx.save();
      const cardW = 195;
      const cardH = 145;
      const cardX = 675;
      const cardY = 25;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = ik.isSingular ? '#EF4444' : '#0284C7';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cardX, cardY, cardW, cardH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('KINEMATICS TELEMETRY', cardX + 12, cardY + 20);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(`Joint 1 (θ₁): ${ik.th1Deg.toFixed(1)}°`, cardX + 12, cardY + 38);
      ctx.fillText(`Joint 2 (θ₂): ${ik.th2Deg.toFixed(1)}°`, cardX + 12, cardY + 52);
      ctx.fillText(`End-Eff X: ${ik.clampedX.toFixed(1)} mm`, cardX + 12, cardY + 66);
      ctx.fillText(`End-Eff Y: ${ik.clampedY.toFixed(1)} mm`, cardX + 12, cardY + 80);
      ctx.fillText(`Jacobian Det: ${ik.jacDet.toFixed(4)}`, cardX + 12, cardY + 94);

      // Status pill
      ctx.fillStyle = ik.isSingular
        ? '#EF4444'
        : !ik.isReachable
        ? '#F59E0B'
        : '#10B981';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText(
        ik.isSingular ? '⚠ SINGULARITY' : !ik.isReachable ? '⚠ CLAMPED REACH' : '✓ REACHABLE DEXTEROUS',
        cardX + 12,
        cardY + 115,
      );
      ctx.restore();

      // 9. Measuring Tape Tool
      if (showRuler) {
        ctx.save();
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(rulerTape.x1, rulerTape.y1);
        ctx.lineTo(rulerTape.x2, rulerTape.y2);
        ctx.stroke();

        const tapePx = Math.hypot(rulerTape.x2 - rulerTape.x1, rulerTape.y2 - rulerTape.y1);
        const tapeMm = (tapePx / pixelsPerMm).toFixed(0);

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
        ctx.fillText(`${tapeMm} mm`, midX, midY + 4);
        ctx.restore();
      }

      // 10. Sensor Probe Tool
      if (showProbe) {
        ctx.save();
        ctx.strokeStyle = '#38BDF8';
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

        const pMmX = ((probePos.x - baseX) / pixelsPerMm).toFixed(0);
        const pMmY = ((baseY - probePos.y) / pixelsPerMm).toFixed(0);

        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(probePos.x + 15, probePos.y - 45, 140, 50, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('COORDINATE PROBE', probePos.x + 22, probePos.y - 28);
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`X: ${pMmX} mm | Y: ${pMmY} mm`, probePos.x + 22, probePos.y - 12);
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
    targetMm,
    l1,
    l2,
    solveIK,
    showTrace,
    showGrid,
    showVectors,
    showRuler,
    showProbe,
    rulerTape,
    probePos,
    isDraggingTarget,
    userZoom,
    pan,
    onPoseChange,
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
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
    const vCoords = screenToVirtualCoords(e.clientX, e.clientY, canvas, vp);

    // Check Probe Handle
    if (showProbe && Math.hypot(vCoords.x - probePos.x, vCoords.y - probePos.y) <= 22) {
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

    // Check Target Handle
    const targetScreenX = baseX + targetMm.x * pixelsPerMm;
    const targetScreenY = baseY - targetMm.y * pixelsPerMm;
    if (Math.hypot(vCoords.x - targetScreenX, vCoords.y - targetScreenY) <= 32) {
      setIsDraggingTarget(true);
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
    const vCoords = screenToVirtualCoords(e.clientX, e.clientY, canvas, vp);

    if (isDraggingProbe) {
      setProbePos({
        x: Math.max(40, Math.min(VIRTUAL_WIDTH - 40, vCoords.x)),
        y: Math.max(40, Math.min(VIRTUAL_HEIGHT - 40, vCoords.y)),
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

    if (isDraggingTarget) {
      const newMmX = (vCoords.x - baseX) / pixelsPerMm;
      const newMmY = (baseY - vCoords.y) / pixelsPerMm;
      setTargetMm({ x: Math.round(newMmX), y: Math.round(newMmY) });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingProbe(false);
    setActiveTapeHandle('none');
    setIsDraggingTarget(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <PhetWorkbench
      title="Planar 2-DOF Robotic Arm Workbench"
      subtitle="Interactive Inverse Kinematics, Jacobian Matrix & Workspace Analysis"
      disciplineColor="#06B6D4"
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
          <span className="text-cyan-400 font-bold">💡 Tip:</span>
          <span>Click & drag the orange target crosshair anywhere on screen to calculate Inverse Kinematics in real-time!</span>
        </div>
      </div>
    </PhetWorkbench>
  );
}
