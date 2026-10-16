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

export interface RealtimePhotoelectricSceneProps {
  wavelengthNm: number;
  lightIntensityPct: number;
  retardingVoltageV: number;
  workFunctionEv: number;
  cathodeMaterialName: string;
  className?: string;
  onSampleUpdate?: (sample: {
    photonEnergyEv: number;
    maxKineticEnergyEv: number;
    stoppingPotentialV: number;
    photocurrentUa: number;
    isEmission: boolean;
  }) => void;
}

interface Particle {
  type: 'photon' | 'electron';
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  energyEv: number;
}

export function RealtimePhotoelectricScene({
  wavelengthNm,
  lightIntensityPct,
  retardingVoltageV,
  workFunctionEv,
  cathodeMaterialName,
  className = '',
  onSampleUpdate,
}: RealtimePhotoelectricSceneProps) {
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

  // Tools in Virtual Space
  const [probePos, setProbePos] = useState<{ x: number; y: number }>({ x: 450, y: 120 });
  const [isDraggingProbe, setIsDraggingProbe] = useState<boolean>(false);

  const [rulerTape, setRulerTape] = useState<{ x1: number; y1: number; x2: number; y2: number }>({
    x1: 300,
    y1: 350,
    x2: 560,
    y2: 350,
  });
  const [activeTapeHandle, setActiveTapeHandle] = useState<'none' | 'p1' | 'p2'>('none');

  // Physics calculation
  const hcEvNm = 1239.84;
  const photonEnergyEv = hcEvNm / Math.max(1, wavelengthNm);
  const maxKeEv = Math.max(0, photonEnergyEv - workFunctionEv);
  const isEmission = photonEnergyEv >= workFunctionEv;
  const stoppingPotentialV = maxKeEv; // in volts

  // Particles state
  const particlesRef = useRef<Particle[]>([]);

  // Convert wavelength to visible RGB color
  const wavelengthToColor = (nm: number) => {
    if (nm < 380) return '#C084FC'; // UV
    if (nm < 450) return '#60A5FA'; // Violet/Blue
    if (nm < 495) return '#38BDF8'; // Cyan
    if (nm < 570) return '#34D399'; // Green
    if (nm < 590) return '#FBBF24'; // Yellow
    if (nm < 620) return '#FB923C'; // Orange
    if (nm <= 750) return '#F87171'; // Red
    return '#EF4444'; // IR
  };

  const beamColor = wavelengthToColor(wavelengthNm);

  // Reset
  const handleReset = useCallback(() => {
    particlesRef.current = [];
    setSimTime(0);
  }, []);

  // Step (single frame advance)
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

      // Vacuum Tube Geometry in Virtual Space (900 x 520)
      const tubeCenterX = 430;
      const tubeCenterY = 250;
      const tubeRadiusX = 170;
      const tubeRadiusY = 110;

      const cathodeX = tubeCenterX - 110;
      const anodeX = tubeCenterX + 110;
      const plateH = 100;

      // Electric field visual force:
      // Positive retardingVoltageV opposes electron motion from cathode to anode
      const eFieldAcc = (-retardingVoltageV / 0.05) * 45; // virtual px/s^2

      const particles = particlesRef.current;
      let collectedElectronsPerSec = 0;

      if (isPlaying) {
        // Spawn Photons from Light Source (Lamp at x=120, y=90)
        const spawnChance = (lightIntensityPct / 100) * 0.7;
        if (Math.random() < spawnChance) {
          const lampAngle = 0.55;
          const speed = 220 + Math.random() * 40;
          particles.push({
            type: 'photon',
            x: 155,
            y: 115 + (Math.random() - 0.5) * 20,
            vx: Math.cos(lampAngle) * speed,
            vy: Math.sin(lampAngle) * speed,
            color: beamColor,
            size: 3.5,
            energyEv: photonEnergyEv,
          });
        }

        // Update existing particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]!;

          if (p.type === 'photon') {
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Check hit on Cathode Plate
            if (
              p.x >= cathodeX - 8 &&
              p.x <= cathodeX + 10 &&
              p.y >= tubeCenterY - plateH / 2 &&
              p.y <= tubeCenterY + plateH / 2
            ) {
              if (isEmission) {
                const maxVelPx = Math.sqrt(maxKeEv) * 110;
                const ejectAngle = (Math.random() - 0.5) * 1.1;
                const fraction = 0.3 + Math.random() * 0.7;
                particles.push({
                  type: 'electron',
                  x: cathodeX + 6,
                  y: p.y,
                  vx: Math.max(20, maxVelPx * Math.cos(ejectAngle) * fraction),
                  vy: maxVelPx * Math.sin(ejectAngle) * fraction,
                  color: '#38BDF8',
                  size: 2.5,
                  energyEv: maxKeEv * fraction * fraction,
                });
              }
              particles.splice(i, 1);
              continue;
            }

            if (p.x > VIRTUAL_WIDTH || p.y > VIRTUAL_HEIGHT || p.x < 0 || p.y < 0) {
              particles.splice(i, 1);
            }
          } else {
            // Electron dynamics under electric field
            p.vx += eFieldAcc * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Check if electron hits Anode collector plate
            if (
              p.x >= anodeX - 5 &&
              p.x <= anodeX + 10 &&
              p.y >= tubeCenterY - plateH / 2 &&
              p.y <= tubeCenterY + plateH / 2
            ) {
              collectedElectronsPerSec++;
              particles.splice(i, 1);
              continue;
            }

            // Check if electron turned around and struck cathode or left tube boundaries
            if (
              p.x < cathodeX ||
              p.x > anodeX + 40 ||
              Math.abs(p.y - tubeCenterY) > tubeRadiusY * 0.95
            ) {
              particles.splice(i, 1);
            }
          }
        }
      }

      // Calculate Photocurrent
      let photocurrentUa = 0;
      if (isEmission) {
        if (retardingVoltageV >= stoppingPotentialV) {
          photocurrentUa = 0; // Cutoff
        } else {
          const satCurrentUa = (lightIntensityPct / 100) * 15.0;
          const fraction = Math.max(0, 1 - retardingVoltageV / stoppingPotentialV);
          photocurrentUa = satCurrentUa * fraction;
        }
      }

      if (onSampleUpdate) {
        onSampleUpdate({
          photonEnergyEv,
          maxKineticEnergyEv: maxKeEv,
          stoppingPotentialV,
          photocurrentUa,
          isEmission,
        });
      }

      // -------------------------------------------------------------
      // DRAW CANVAS IN VIRTUAL COORDINATES (900 x 520)
      // -------------------------------------------------------------
      const vp = computeViewport(canvas.width, canvas.height, dpr, userZoom, pan.x, pan.y);
      applyVirtualViewport(ctx, vp, dpr);

      // Deep Dark Lab Bench Background
      ctx.fillStyle = '#090D16';
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

      // 1. Bench Table Top
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(40, 440, VIRTUAL_WIDTH - 80, 16);
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(40, 440, VIRTUAL_WIDTH - 80, 16);

      // 2. Quartz Vacuum Tube Outer Envelope
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 3;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.beginPath();
      ctx.ellipse(tubeCenterX, tubeCenterY, tubeRadiusX, tubeRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glass specular reflection highlights
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(
        tubeCenterX,
        tubeCenterY,
        tubeRadiusX - 10,
        tubeRadiusY - 10,
        0,
        -Math.PI * 0.8,
        -Math.PI * 0.2,
      );
      ctx.stroke();

      // Tube glass mounting stands
      ctx.fillStyle = '#1E293B';
      ctx.fillRect(tubeCenterX - 130, tubeCenterY + tubeRadiusY - 6, 20, 440 - (tubeCenterY + tubeRadiusY - 6));
      ctx.fillRect(tubeCenterX + 110, tubeCenterY + tubeRadiusY - 6, 20, 440 - (tubeCenterY + tubeRadiusY - 6));
      ctx.restore();

      // 3. Photocathode Plate (Left)
      const cathGrad = ctx.createLinearGradient(cathodeX - 10, 0, cathodeX, 0);
      cathGrad.addColorStop(0, '#64748B');
      cathGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = cathGrad;
      ctx.fillRect(cathodeX - 10, tubeCenterY - plateH / 2, 10, plateH);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cathodeX - 10, tubeCenterY - plateH / 2, 10, plateH);

      // Cathode terminal wiring
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cathodeX - 10, tubeCenterY);
      ctx.lineTo(cathodeX - 70, tubeCenterY);
      ctx.lineTo(cathodeX - 70, 420);
      ctx.lineTo(220, 420);
      ctx.stroke();

      // Cathode label
      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Cathode (-)`, cathodeX - 5, tubeCenterY + plateH / 2 + 18);
      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText(cathodeMaterialName, cathodeX - 5, tubeCenterY + plateH / 2 + 32);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText(`Φ = ${workFunctionEv.toFixed(2)} eV`, cathodeX - 5, tubeCenterY + plateH / 2 + 45);

      // 4. Anode Collector Plate (Right)
      const anodeGrad = ctx.createLinearGradient(anodeX, 0, anodeX + 10, 0);
      anodeGrad.addColorStop(0, '#CBD5E1');
      anodeGrad.addColorStop(1, '#64748B');
      ctx.fillStyle = anodeGrad;
      ctx.fillRect(anodeX, tubeCenterY - plateH / 2, 10, plateH);
      ctx.strokeRect(anodeX, tubeCenterY - plateH / 2, 10, plateH);

      // Anode terminal wiring
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(anodeX + 10, tubeCenterY);
      ctx.lineTo(anodeX + 70, tubeCenterY);
      ctx.lineTo(anodeX + 70, 420);
      ctx.lineTo(360, 420);
      ctx.stroke();

      // Anode label
      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Anode (+)`, anodeX + 5, tubeCenterY + plateH / 2 + 18);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '9px JetBrains Mono, monospace';
      ctx.fillText('Electron Collector', anodeX + 5, tubeCenterY + plateH / 2 + 32);

      // 5. Electric Field Vector Overlay inside Tube
      if (showVectors && Math.abs(retardingVoltageV) > 0.05) {
        ctx.save();
        ctx.strokeStyle = retardingVoltageV > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';
        ctx.fillStyle = retardingVoltageV > 0 ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)';
        ctx.lineWidth = 1.5;
        const eDir = retardingVoltageV > 0 ? -1 : 1;
        for (let rowY = tubeCenterY - 40; rowY <= tubeCenterY + 40; rowY += 40) {
          const arrowStartX = tubeCenterX - 40 * eDir;
          const arrowEndX = tubeCenterX + 40 * eDir;
          ctx.beginPath();
          ctx.moveTo(arrowStartX, rowY);
          ctx.lineTo(arrowEndX, rowY);
          ctx.stroke();
          // Arrowhead
          ctx.beginPath();
          ctx.moveTo(arrowEndX, rowY);
          ctx.lineTo(arrowEndX - 6 * eDir, rowY - 4);
          ctx.lineTo(arrowEndX - 6 * eDir, rowY + 4);
          ctx.closePath();
          ctx.fill();
        }
        ctx.fillStyle = retardingVoltageV > 0 ? '#F87171' : '#34D399';
        ctx.font = 'bold 9px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          `E-Field ${retardingVoltageV > 0 ? '← (Retarding)' : '→ (Accelerating)'}`,
          tubeCenterX,
          tubeCenterY - 60,
        );
        ctx.restore();
      }

      // 6. Monochromatic Lamp (Light Emitter)
      ctx.save();
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = beamColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(80, 75, 75, 80, 8);
      ctx.fill();
      ctx.stroke();

      // Lamp aperture lens
      ctx.fillStyle = beamColor;
      ctx.beginPath();
      ctx.arc(155, 115, 14, -Math.PI / 2, Math.PI / 2);
      ctx.fill();

      // Emitted Light Beam Cone to Cathode
      ctx.fillStyle = `${beamColor}25`;
      ctx.beginPath();
      ctx.moveTo(155, 115);
      ctx.lineTo(cathodeX - 8, tubeCenterY - plateH / 2 + 10);
      ctx.lineTo(cathodeX - 8, tubeCenterY + plateH / 2 - 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = beamColor;
      ctx.font = 'bold 11px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${wavelengthNm} nm`, 117, 105);
      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText(`hν = ${photonEnergyEv.toFixed(2)} eV`, 117, 122);
      ctx.fillText(`${lightIntensityPct}% Lux`, 117, 137);
      ctx.restore();

      // 7. Render Photons and Electrons
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.type === 'electron') {
          // Electron glow
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 8. Benchtop Dual Instrument Console (Right Side: 670 to 860)
      const meterX = 765;
      const meterY = 250;
      const meterR = 60;

      ctx.save();
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(660, 140, 210, 220, 12);
      ctx.fill();
      ctx.stroke();

      // Analog Ammeter Dial
      ctx.fillStyle = '#020617';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(meterX, meterY - 20, meterR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Ammeter dial ticks
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      for (let a = -Math.PI * 0.75; a <= -Math.PI * 0.25; a += Math.PI * 0.1) {
        ctx.beginPath();
        ctx.moveTo(meterX + Math.cos(a) * (meterR - 10), meterY - 20 + Math.sin(a) * (meterR - 10));
        ctx.lineTo(meterX + Math.cos(a) * (meterR - 3), meterY - 20 + Math.sin(a) * (meterR - 3));
        ctx.stroke();
      }

      // Needle deflection
      const maxCurrentUa = 15;
      const needleAngle =
        -Math.PI * 0.75 +
        (Math.min(maxCurrentUa, photocurrentUa) / maxCurrentUa) * (Math.PI * 0.5);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(meterX, meterY - 20);
      ctx.lineTo(
        meterX + Math.cos(needleAngle) * (meterR - 10),
        meterY - 20 + Math.sin(needleAngle) * (meterR - 10),
      );
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(meterX, meterY - 20, 5, 0, Math.PI * 2);
      ctx.fill();

      // Digital Photocurrent Readout
      ctx.fillStyle = '#020617';
      ctx.fillRect(meterX - 65, meterY + 52, 130, 30);
      ctx.strokeStyle = '#334155';
      ctx.strokeRect(meterX - 65, meterY + 52, 130, 30);

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 15px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${photocurrentUa.toFixed(2)} µA`, meterX, meterY + 72);

      ctx.fillStyle = '#94A3B8';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.fillText('PRECISION MICRO-AMMETER', meterX, meterY + 95);
      ctx.restore();

      // 9. DC Bias & Stopping Potential Source (Bottom Center: 210 to 370)
      ctx.save();
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(220, 400, 160, 40, 6);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`V = ${retardingVoltageV.toFixed(2)} V`, 300, 420);
      ctx.fillStyle = '#94A3B8';
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillText('DC RETARDING SOURCE', 300, 432);
      ctx.restore();

      // 10. Quantum Emission Status Banner (Top Center)
      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = !isEmission ? '#EF4444' : retardingVoltageV >= stoppingPotentialV ? '#F59E0B' : '#10B981';
      ctx.lineWidth = 1.5;
      const bW = 380;
      const bH = 46;
      ctx.beginPath();
      ctx.roundRect(VIRTUAL_WIDTH / 2 - bW / 2, 20, bW, bH, 8);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      if (!isEmission) {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillText('SUB-THRESHOLD: NO EMISSION (hν < Φ)', VIRTUAL_WIDTH / 2, 38);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(
          `Photon ${photonEnergyEv.toFixed(2)} eV < Work Function ${workFunctionEv.toFixed(2)} eV`,
          VIRTUAL_WIDTH / 2,
          53,
        );
      } else if (retardingVoltageV >= stoppingPotentialV) {
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillText('STOPPING POTENTIAL REACHED (I = 0)', VIRTUAL_WIDTH / 2, 38);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(
          `V_stop = ${stoppingPotentialV.toFixed(2)} V | All electrons turned back`,
          VIRTUAL_WIDTH / 2,
          53,
        );
      } else {
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 12px JetBrains Mono, monospace';
        ctx.fillText('PHOTOELECTRIC EMISSION ACTIVE', VIRTUAL_WIDTH / 2, 38);
        ctx.fillStyle = '#CBD5E1';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.fillText(
          `K_max = ${maxKeEv.toFixed(2)} eV | V_stop = ${stoppingPotentialV.toFixed(2)} V | I = ${photocurrentUa.toFixed(2)} µA`,
          VIRTUAL_WIDTH / 2,
          53,
        );
      }
      ctx.restore();

      // 11. Yellow Measuring Tape Tool
      if (showRuler) {
        ctx.save();
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(rulerTape.x1, rulerTape.y1);
        ctx.lineTo(rulerTape.x2, rulerTape.y2);
        ctx.stroke();

        const tapeDistPx = Math.hypot(rulerTape.x2 - rulerTape.x1, rulerTape.y2 - rulerTape.y1);
        const tapeDistCm = (tapeDistPx / 4.4).toFixed(1);

        // Handles
        ctx.fillStyle = '#D97706';
        ctx.beginPath();
        ctx.arc(rulerTape.x1, rulerTape.y1, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(rulerTape.x2, rulerTape.y2, 7, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Measurement tag
        const midX = (rulerTape.x1 + rulerTape.x2) / 2;
        const midY = (rulerTape.y1 + rulerTape.y2) / 2 - 14;
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
        ctx.fillText(`${tapeDistCm} cm`, midX, midY + 4);
        ctx.restore();
      }

      // 12. Diagnostic Sensor Probe Tool
      if (showProbe) {
        ctx.save();
        // Probe Wire
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(probePos.x, probePos.y);
        ctx.lineTo(probePos.x + 60, probePos.y - 40);
        ctx.stroke();
        ctx.setLineDash([]);

        // Probe Crosshair Pin
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

        // Probe Info HUD Card
        const cardX = probePos.x + 16;
        const cardY = probePos.y - 70;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(cardX, cardY, 175, 78, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#38BDF8';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.textAlign = 'left';
        ctx.fillText('QUANTUM SENSOR PROBE', cardX + 10, cardY + 16);

        ctx.fillStyle = '#CBD5E1';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`Photon hν: ${photonEnergyEv.toFixed(2)} eV`, cardX + 10, cardY + 32);
        ctx.fillText(`Work Func Φ: ${workFunctionEv.toFixed(2)} eV`, cardX + 10, cardY + 45);
        ctx.fillText(`Max K.E.: ${maxKeEv.toFixed(2)} eV`, cardX + 10, cardY + 58);
        ctx.fillText(`V_stop: ${stoppingPotentialV.toFixed(2)} V`, cardX + 10, cardY + 70);
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
    wavelengthNm,
    lightIntensityPct,
    retardingVoltageV,
    workFunctionEv,
    beamColor,
    photonEnergyEv,
    maxKeEv,
    isEmission,
    stoppingPotentialV,
    cathodeMaterialName,
    showGrid,
    showVectors,
    showRuler,
    showProbe,
    rulerTape,
    probePos,
    userZoom,
    pan,
    onSampleUpdate,
  ]);

  // Adjust canvas size for high-DPI
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

  // Pointer Interaction (Probe & Tape in Virtual Space)
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
        x: Math.max(50, Math.min(VIRTUAL_WIDTH - 50, vCoords.x)),
        y: Math.max(50, Math.min(VIRTUAL_HEIGHT - 50, vCoords.y)),
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
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    setIsDraggingProbe(false);
    setActiveTapeHandle('none');
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  return (
    <PhetWorkbench
      title="Photoelectric Effect Quantum Photocell Workbench"
      subtitle="Einstein Photon Absorption, Kinetic Energy & Stopping Potential"
      disciplineColor="#8B5CF6"
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
        className="relative w-full h-[400px] sm:h-[480px] bg-[#090D16] select-none touch-none cursor-crosshair"
      >
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="w-full h-full block"
        />
      </div>
    </PhetWorkbench>
  );
}
