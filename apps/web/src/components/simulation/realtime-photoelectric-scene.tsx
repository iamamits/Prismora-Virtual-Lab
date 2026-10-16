'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Zap,
  Sliders,
  Crosshair,
  Sparkles,
} from 'lucide-react';

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
  alpha: number;
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

  // Playback
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Physics calculation
  const hcEvNm = 1239.84;
  const photonEnergyEv = hcEvNm / Math.max(1, wavelengthNm);
  const maxKeEv = Math.max(0, photonEnergyEv - workFunctionEv);
  const isEmission = photonEnergyEv >= workFunctionEv;
  const stoppingPotentialV = maxKeEv; // in volts

  // Net potential across tube: retarding voltage opposes electron motion
  // If retardingVoltageV > 0, field retards electrons
  const particlesRef = useRef<Particle[]>([]);

  // Convert wavelength to visible RGB color
  const wavelengthToColor = (nm: number) => {
    if (nm < 380) return '#A855F7'; // UV (Purple)
    if (nm < 450) return '#3B82F6'; // Violet/Blue
    if (nm < 495) return '#06B6D4'; // Cyan
    if (nm < 570) return '#10B981'; // Green
    if (nm < 590) return '#FACC15'; // Yellow
    if (nm < 620) return '#F97316'; // Orange
    if (nm <= 750) return '#EF4444'; // Red
    return '#DC2626'; // IR
  };

  const beamColor = wavelengthToColor(wavelengthNm);

  // Animation Loop
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
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

      // Vacuum Tube Geometry
      const tubeCenterX = width * 0.48;
      const tubeCenterY = height * 0.46;
      const tubeRadiusX = 170;
      const tubeRadiusY = 105;

      const cathodeX = tubeCenterX - 110;
      const anodeX = tubeCenterX + 110;
      const plateH = 90;

      // Electric field force on electrons between plates:
      // F = q * E = q * (V / d)
      // Positive retardingVoltageV decelerates electrons moving from cathode to anode
      const plateDistM = 0.05; // 5 cm
      const eFieldAcc = (-retardingVoltageV / plateDistM) * 350; // visual acceleration px/s^2

      const particles = particlesRef.current;

      let collectedElectronsPerSec = 0;

      if (isPlaying) {
        // Spawn Photons from Light Source (Top Left)
        const spawnChance = (lightIntensityPct / 100) * 0.6;
        if (Math.random() < spawnChance) {
          particles.push({
            type: 'photon',
            x: 45,
            y: 40 + Math.random() * 40,
            vx: 180 + Math.random() * 30,
            vy: 90 + Math.random() * 20,
            color: beamColor,
            size: 3,
            alpha: 1.0,
          });
        }

        // Update existing particles
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i]!;

          if (p.type === 'photon') {
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Check hit on Cathode Plate
            if (p.x >= cathodeX - 5 && p.x <= cathodeX + 8 && p.y >= tubeCenterY - plateH / 2 && p.y <= tubeCenterY + plateH / 2) {
              // Eject electron if energy sufficient
              if (isEmission) {
                const maxVelPx = Math.sqrt(maxKeEv) * 95;
                const ejectAngle = (Math.random() - 0.5) * 0.8;
                particles.push({
                  type: 'electron',
                  x: cathodeX + 4,
                  y: p.y,
                  vx: Math.max(25, maxVelPx * Math.cos(ejectAngle) * (0.4 + Math.random() * 0.6)),
                  vy: maxVelPx * Math.sin(ejectAngle) * 0.5,
                  color: '#38BDF8',
                  size: 2.5,
                  alpha: 1.0,
                });
              }
              // Remove photon
              particles.splice(i, 1);
              continue;
            }

            if (p.x > width || p.y > height) {
              particles.splice(i, 1);
            }
          } else {
            // Electron dynamics under electric field
            p.vx += eFieldAcc * dt;
            p.x += p.vx * dt;
            p.y += p.vy * dt;

            // Check if electron hits Anode collector plate
            if (p.x >= anodeX - 4 && p.x <= anodeX + 8 && p.y >= tubeCenterY - plateH / 2 && p.y <= tubeCenterY + plateH / 2) {
              collectedElectronsPerSec++;
              particles.splice(i, 1);
              continue;
            }

            // Check if electron turned around and hit cathode or left tube
            if (p.x < cathodeX || p.x > width || Math.abs(p.y - tubeCenterY) > tubeRadiusY) {
              particles.splice(i, 1);
            }
          }
        }
      }

      // Calculate Photocurrent
      let photocurrentUa = 0;
      if (isEmission) {
        if (retardingVoltageV >= stoppingPotentialV) {
          photocurrentUa = 0; // complete cutoff
        } else {
          const satCurrentUa = (lightIntensityPct / 100) * 12.5;
          const fraction = Math.max(0, 1 - (retardingVoltageV / stoppingPotentialV));
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
      // DRAW CANVAS
      // -------------------------------------------------------------
      ctx.save();
      ctx.scale(dpr, dpr);

      ctx.fillStyle = '#0B1120';
      ctx.fillRect(0, 0, width, height);

      // 1. Draw Quartz Vacuum Tube Glass Envelope
      ctx.save();
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
      ctx.beginPath();
      ctx.ellipse(tubeCenterX, tubeCenterY, tubeRadiusX, tubeRadiusY, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Glass shine highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(tubeCenterX, tubeCenterY, tubeRadiusX - 8, tubeRadiusY - 8, 0, -Math.PI * 0.8, -Math.PI * 0.2);
      ctx.stroke();
      ctx.restore();

      // 2. Draw Photocathode Plate (Left)
      const cathGrad = ctx.createLinearGradient(cathodeX - 8, 0, cathodeX, 0);
      cathGrad.addColorStop(0, '#64748B');
      cathGrad.addColorStop(1, '#CBD5E1');
      ctx.fillStyle = cathGrad;
      ctx.fillRect(cathodeX - 8, tubeCenterY - plateH / 2, 8, plateH);
      ctx.strokeStyle = '#94A3B8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(cathodeX - 8, tubeCenterY - plateH / 2, 8, plateH);

      ctx.fillStyle = '#CBD5E1';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`Cathode (-)`, cathodeX - 4, tubeCenterY + plateH / 2 + 15);
      ctx.fillStyle = '#94A3B8';
      ctx.fillText(cathodeMaterialName, cathodeX - 4, tubeCenterY + plateH / 2 + 26);

      // 3. Draw Anode Collector Plate (Right)
      const anodeGrad = ctx.createLinearGradient(anodeX, 0, anodeX + 8, 0);
      anodeGrad.addColorStop(0, '#CBD5E1');
      anodeGrad.addColorStop(1, '#64748B');
      ctx.fillStyle = anodeGrad;
      ctx.fillRect(anodeX, tubeCenterY - plateH / 2, 8, plateH);
      ctx.strokeRect(anodeX, tubeCenterY - plateH / 2, 8, plateH);

      ctx.fillStyle = '#CBD5E1';
      ctx.fillText(`Anode (+)`, anodeX + 4, tubeCenterY + plateH / 2 + 15);

      // 4. Draw Monochromatic Light Source Lamp (Top Left)
      ctx.save();
      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = beamColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(15, 25, 45, 60, 6);
      ctx.fill();
      ctx.stroke();

      // Lamp lens
      ctx.fillStyle = beamColor;
      ctx.beginPath();
      ctx.arc(60, 55, 10, -Math.PI / 2, Math.PI / 2);
      ctx.fill();

      // Emitted Light Cone
      ctx.fillStyle = `${beamColor}20`; // translucent
      ctx.beginPath();
      ctx.moveTo(60, 55);
      ctx.lineTo(cathodeX, tubeCenterY - plateH / 2 + 10);
      ctx.lineTo(cathodeX, tubeCenterY + plateH / 2 - 10);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = beamColor;
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`${wavelengthNm}nm`, 15, 20);
      ctx.restore();

      // 5. Draw Flying Particles (Photons & Electrons)
      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        if (p.type === 'electron') {
          // Glow around electron
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 6. Analog Micro-Ammeter Meter (Bottom Right)
      const meterX = width - 85;
      const meterY = height - 60;
      const meterR = 38;

      ctx.fillStyle = '#1E293B';
      ctx.strokeStyle = '#38BDF8';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(meterX, meterY, meterR, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Meter dial ticks
      ctx.strokeStyle = '#64748B';
      ctx.lineWidth = 1;
      for (let a = -Math.PI * 0.75; a <= -Math.PI * 0.25; a += Math.PI * 0.1) {
        ctx.beginPath();
        ctx.moveTo(meterX + Math.cos(a) * (meterR - 6), meterY + Math.sin(a) * (meterR - 6));
        ctx.lineTo(meterX + Math.cos(a) * (meterR - 2), meterY + Math.sin(a) * (meterR - 2));
        ctx.stroke();
      }

      // Needle deflection
      const maxCurrentUa = 15;
      const needleAngle = -Math.PI * 0.75 + (Math.min(maxCurrentUa, photocurrentUa) / maxCurrentUa) * (Math.PI * 0.5);
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(meterX, meterY);
      ctx.lineTo(meterX + Math.cos(needleAngle) * (meterR - 8), meterY + Math.sin(needleAngle) * (meterR - 8));
      ctx.stroke();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(meterX, meterY, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${photocurrentUa.toFixed(2)} µA`, meterX, meterY + 18);
      ctx.fillStyle = '#94A3B8';
      ctx.fillText('PHOTOCURRENT', meterX, meterY + 28);

      // 7. Status Banner
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.strokeStyle = isEmission ? '#10B981' : '#EF4444';
      ctx.lineWidth = 1;
      const badgeW = 200;
      const badgeH = 40;
      ctx.beginPath();
      ctx.roundRect(width / 2 - badgeW / 2, 15, badgeW, badgeH, 6);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      if (!isEmission) {
        ctx.fillStyle = '#EF4444';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText('NO EMISSION (hν < Φ)', width / 2, 32);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`Photon ${photonEnergyEv.toFixed(2)}eV < Work ${workFunctionEv.toFixed(2)}eV`, width / 2, 45);
      } else if (retardingVoltageV >= stoppingPotentialV) {
        ctx.fillStyle = '#F59E0B';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText('STOPPING POTENTIAL REACHED', width / 2, 32);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`V_stop = ${stoppingPotentialV.toFixed(2)} V (Current = 0)`, width / 2, 45);
      } else {
        ctx.fillStyle = '#10B981';
        ctx.font = 'bold 10px JetBrains Mono, monospace';
        ctx.fillText('PHOTOELECTRIC EMISSION ACTIVE', width / 2, 32);
        ctx.fillStyle = '#94A3B8';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(`K_max = ${maxKeEv.toFixed(2)} eV | I = ${photocurrentUa.toFixed(2)} µA`, width / 2, 45);
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [
    isPlaying,
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
    onSampleUpdate,
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900 border-b border-zinc-800 text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <span className="font-mono font-bold text-zinc-100">Photoelectric Effect Quantum Photocell</span>
          <span className="text-zinc-500">|</span>
          <span className="font-mono text-zinc-400">Einstein Photoelectric Equation</span>
        </div>

        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-mono text-[11px]"
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Pause Photons' : 'Emit Photons'}</span>
        </button>
      </div>

      {/* Canvas */}
      <div ref={containerRef} className="relative w-full h-[320px] sm:h-[380px] bg-[#0B1120]">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>
    </div>
  );
}
