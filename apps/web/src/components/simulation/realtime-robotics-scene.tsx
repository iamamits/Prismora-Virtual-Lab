'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Crosshair,
  RotateCcw,
  Grid,
  Zap,
  Sliders,
} from 'lucide-react';

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

  // Arm state
  const [theta1Deg, setTheta1Deg] = useState<number>(initialTheta1Deg);
  const [theta2Deg, setTheta2Deg] = useState<number>(initialTheta2Deg);
  const [isDraggingTarget, setIsDraggingTarget] = useState<boolean>(false);

  // Target position in world millimeters (relative to base)
  const l1 = link1LengthMm;
  const l2 = link2LengthMm;
  const initialTh1Rad = (initialTheta1Deg * Math.PI) / 180;
  const initialTh2Rad = (initialTheta2Deg * Math.PI) / 180;
  const initX = l1 * Math.cos(initialTh1Rad) + l2 * Math.cos(initialTh1Rad + initialTh2Rad);
  const initY = l1 * Math.sin(initialTh1Rad) + l2 * Math.sin(initialTh1Rad + initialTh2Rad);

  const [targetMm, setTargetMm] = useState<{ x: number; y: number }>({ x: initX, y: initY });

  // Tools
  const [showWorkspace, setShowWorkspace] = useState<boolean>(true);
  const [showTrace, setShowTrace] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // Trace path history
  const traceHistoryRef = useRef<Array<{ x: number; y: number }>>([]);

  // Analytical Inverse Kinematics 2-DOF planar
  const solveIK = useCallback(
    (targetX: number, targetY: number) => {
      const distSq = targetX * targetX + targetY * targetY;
      const dist = Math.sqrt(distSq);
      const maxReach = l1 + l2;
      const minReach = Math.abs(l1 - l2);

      const isReachable = dist <= maxReach && dist >= minReach;

      // Clamp target to reachable circle if outside
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
      const th2Rad = Math.acos(clampedCos2); // Elbow up

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
        theta1Deg: th1Deg,
        theta2Deg: th2Deg,
        endX: clampedX,
        endY: clampedY,
        jacDet,
        isSingular,
        isReachable,
      };
    },
    [l1, l2],
  );

  // Render Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
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

      // Base anchor origin on screen
      const baseX = width * 0.42;
      const baseY = height * 0.78;
      const pixelsPerMm = 0.38; // scale

      // Solve IK for current target
      const ik = solveIK(targetMm.x, targetMm.y);

      // Forward kinematics joint coordinates
      const th1R = (ik.theta1Deg * Math.PI) / 180;
      const th2R = (ik.theta2Deg * Math.PI) / 180;

      const joint1X = baseX;
      const joint1Y = baseY;

      const joint2X = baseX + l1 * Math.cos(th1R) * pixelsPerMm;
      const joint2Y = baseY - l1 * Math.sin(th1R) * pixelsPerMm; // Screen y is inverted

      const endEffectorX = joint2X + l2 * Math.cos(th1R + th2R) * pixelsPerMm;
      const endEffectorY = joint2Y - l2 * Math.sin(th1R + th2R) * pixelsPerMm;

      // Record trace
      if (showTrace) {
        const hist = traceHistoryRef.current;
        hist.push({ x: endEffectorX, y: endEffectorY });
        if (hist.length > 200) hist.shift();
      }

      if (onPoseChange) {
        onPoseChange({
          theta1Deg: ik.theta1Deg,
          theta2Deg: ik.theta2Deg,
          endEffectorXMm: ik.endX,
          endEffectorYMm: ik.endY,
          jacobianDet: ik.jacDet,
          isSingular: ik.isSingular,
          isReachable: ik.isReachable,
        });
      }

      // -------------------------------------------------------------
      // DRAW CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, width, height);

      // Grid
      if (showGrid) {
        ctx.strokeStyle = '#1E293B';
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 30) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 30) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }

      // 1. Reachable Workspace Circles
      if (showWorkspace) {
        const maxReachPx = (l1 + l2) * pixelsPerMm;
        const minReachPx = Math.abs(l1 - l2) * pixelsPerMm;

        ctx.save();
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);

        ctx.beginPath();
        ctx.arc(baseX, baseY, maxReachPx, 0, Math.PI * 2);
        ctx.stroke();

        if (minReachPx > 5) {
          ctx.beginPath();
          ctx.arc(baseX, baseY, minReachPx, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      }

      // 2. Trace Trail
      if (showTrace && traceHistoryRef.current.length > 1) {
        ctx.save();
        ctx.strokeStyle = '#F43F5E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        traceHistoryRef.current.forEach((pt, idx) => {
          if (idx === 0) ctx.moveTo(pt.x, pt.y);
          else ctx.lineTo(pt.x, pt.y);
        });
        ctx.stroke();
        ctx.restore();
      }

      // 3. Heavy Industrial Floor & Base Mount
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(baseX - 45, baseY, 90, 35);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2;
      ctx.strokeRect(baseX - 45, baseY, 90, 35);

      // Base Joint Pivot
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(baseX, baseY, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 4. Link 1 (Aluminum Casting Arm)
      ctx.save();
      ctx.strokeStyle = '#0284C7';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(joint1X, joint1Y);
      ctx.lineTo(joint2X, joint2Y);
      ctx.stroke();

      // Inner highlight line
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.restore();

      // 5. Joint 2 (Elbow Actuator)
      ctx.fillStyle = '#1E293B';
      ctx.beginPath();
      ctx.arc(joint2X, joint2Y, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 3;
      ctx.stroke();

      // 6. Link 2 (Forearm)
      ctx.save();
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(joint2X, joint2Y);
      ctx.lineTo(endEffectorX, endEffectorY);
      ctx.stroke();

      ctx.strokeStyle = '#67E8F9';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();

      // 7. End-Effector Gripper
      ctx.save();
      ctx.fillStyle = '#F43F5E';
      ctx.beginPath();
      ctx.arc(endEffectorX, endEffectorY, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Gripper fingers
      const toolAngle = th1R + th2R;
      const fingerLen = 14;
      const perpX = -Math.sin(toolAngle) * 7;
      const perpY = -Math.cos(toolAngle) * 7;
      const fwdX = Math.cos(toolAngle) * fingerLen;
      const fwdY = -Math.sin(toolAngle) * fingerLen;

      ctx.strokeStyle = '#F43F5E';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(endEffectorX + perpX, endEffectorY + perpY);
      ctx.lineTo(endEffectorX + perpX + fwdX, endEffectorY + perpY + fwdY);
      ctx.moveTo(endEffectorX - perpX, endEffectorY - perpY);
      ctx.lineTo(endEffectorX - perpX + fwdX, endEffectorY - perpY + fwdY);
      ctx.stroke();
      ctx.restore();

      // 8. Draggable Target Crosshair
      const targetScreenX = baseX + targetMm.x * pixelsPerMm;
      const targetScreenY = baseY - targetMm.y * pixelsPerMm;

      ctx.save();
      ctx.strokeStyle = isDraggingTarget ? '#F59E0B' : '#FACC15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(targetScreenX, targetScreenY, 16, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(targetScreenX - 22, targetScreenY);
      ctx.lineTo(targetScreenX + 22, targetScreenY);
      ctx.moveTo(targetScreenX, targetScreenY - 22);
      ctx.lineTo(targetScreenX, targetScreenY + 22);
      ctx.stroke();

      ctx.fillStyle = '#FACC15';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Target (${targetMm.x.toFixed(0)}, ${targetMm.y.toFixed(0)}) mm`, targetScreenX, targetScreenY - 22);
      ctx.restore();

      // 9. Joint Angles Overlay Readout Box (Top Right)
      const readBoxW = 160;
      const readBoxH = 68;
      const readBoxX = width - readBoxW - 16;
      const readBoxY = 16;

      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(readBoxX, readBoxY, readBoxW, readBoxH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText('INVERSE KINEMATICS', readBoxX + 8, readBoxY + 14);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(`θ₁ (Shoulder): ${ik.theta1Deg.toFixed(1)}°`, readBoxX + 8, readBoxY + 28);
      ctx.fillText(`θ₂ (Elbow): ${ik.theta2Deg.toFixed(1)}°`, readBoxX + 8, readBoxY + 42);
      ctx.fillText(`det(J): ${ik.jacDet.toFixed(4)}`, readBoxX + 8, readBoxY + 56);

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    l1,
    l2,
    targetMm,
    showWorkspace,
    showTrace,
    showGrid,
    isDraggingTarget,
    solveIK,
    onPoseChange,
  ]);

  // Pointer interactions for dragging end-effector target
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    const baseX = width * 0.42;
    const baseY = height * 0.78;
    const pixelsPerMm = 0.38;

    const targetScreenX = baseX + targetMm.x * pixelsPerMm;
    const targetScreenY = baseY - targetMm.y * pixelsPerMm;

    if (Math.hypot(px - targetScreenX, py - targetScreenY) <= 30) {
      setIsDraggingTarget(true);
      canvas.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;

    if (isDraggingTarget) {
      const dpr = window.devicePixelRatio || 1;
      const width = canvas.width / dpr;
      const height = canvas.height / dpr;
      const baseX = width * 0.42;
      const baseY = height * 0.78;
      const pixelsPerMm = 0.38;

      const newMmX = (px - baseX) / pixelsPerMm;
      const newMmY = (baseY - py) / pixelsPerMm;

      setTargetMm({ x: Math.round(newMmX), y: Math.round(newMmY) });
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingTarget(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="font-mono font-bold text-zinc-100">Planar 2-DOF Robotic Arm Workbench</span>
          <span className="text-zinc-500">|</span>
          <span className="font-mono text-zinc-400">Interactive Inverse Kinematics</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShowTrace(!showTrace)}
            className={`px-2.5 py-1 rounded-md text-[11px] font-mono flex items-center gap-1 transition-all ${
              showTrace
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'text-zinc-400 hover:bg-zinc-800 border border-transparent'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Path Trace</span>
          </button>

          <button
            onClick={() => {
              traceHistoryRef.current = [];
              setTargetMm({ x: initX, y: initY });
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-[11px]"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear Trace</span>
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative w-full h-[320px] sm:h-[380px] bg-[#0B1120] cursor-crosshair select-none touch-none"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />

        <div className="absolute bottom-3 left-4 pointer-events-none text-[11px] font-mono text-zinc-400/80 bg-zinc-900/70 backdrop-blur-xs px-2.5 py-1 rounded border border-zinc-800/80 flex items-center gap-2">
          <span className="text-cyan-400 font-bold">💡 Tip:</span>
          <span>Click & drag the yellow target crosshair to move the robotic arm with real-time Inverse Kinematics!</span>
        </div>
      </div>
    </div>
  );
}
