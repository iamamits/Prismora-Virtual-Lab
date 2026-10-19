/**
 * Prismora Hero 3D Motion Graphics Background
 *
 * Inspired by Gate Smashers / Sci-Fi High-Tech Intro Motion Graphics:
 * - 3D Perspective Grid receding into an infinite horizon with neon pulse lines
 * - Particle Starfield flying forward with depth perspective
 * - Live Automated Simulation Vignettes running seamlessly at 60 FPS:
 *   1. 3D Projectile Cannon & Trajectory (ballistics arc with glowing sparks & impact rings)
 *   2. Rutherford Alpha Scattering (Coulomb hyperbolic deflection around glowing nucleus)
 *   3. CPU Bus Architecture (pulsing logic pulses, data packet lines & binary packets)
 *   4. Harmonic Wave Oscillations (AC sinusoidal waves with phasor rotation)
 *   5. Double Helix / Molecular Orbital (spinning 3D helix strand)
 * - Pure 60 FPS HTML5 Canvas, zero UI controls, ambient background with subtle gradients.
 */

'use client';

import React, { useEffect, useRef } from 'react';

export function HeroMotionBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.parentElement.clientWidth || window.innerWidth;
      height = canvas.parentElement.clientHeight || 480;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // -------------------------------------------------------------
    // 1. Starfield Particles (3D warp towards camera)
    // -------------------------------------------------------------
    interface Star {
      x: number;
      y: number;
      z: number;
      size: number;
      color: string;
    }

    const STAR_COUNT = 90;
    const stars: Star[] = [];
    const starColors = ['#38BDF8', '#818CF8', '#C084FC', '#34D399', '#60A5FA'];

    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: (Math.random() - 0.5) * 1600,
        y: (Math.random() - 0.5) * 800,
        z: Math.random() * 1000 + 50,
        size: Math.random() * 1.8 + 0.8,
        color: starColors[i % starColors.length] || '#38BDF8',
      });
    }

    // -------------------------------------------------------------
    // 2. Simulation Vignette Engines (Auto-cycling in 3D space)
    // -------------------------------------------------------------
    let currentScene = 0;
    const TOTAL_SCENES = 5;
    const SCENE_DURATION_SEC = 6.0;
    let sceneTimer = 0;

    // Simulation 1: Projectile Trajectory State
    interface ProjectileSpark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      color: string;
    }
    const projectileSparks: ProjectileSpark[] = [];
    let projectileT = 0;
    const projectileV0 = 75;
    const projectileAngle = (52 * Math.PI) / 180;
    const projectileG = 42;

    // Simulation 2: Rutherford Scattering State
    interface AlphaParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      origY: number;
      trail: { x: number; y: number }[];
    }
    const alphaParticles: AlphaParticle[] = [];

    // Simulation 3: CPU Bus Logic Packets
    interface CpuPulse {
      x: number;
      y: number;
      speed: number;
      len: number;
      channel: number;
    }
    const cpuPulses: CpuPulse[] = [];
    for (let i = 0; i < 16; i++) {
      cpuPulses.push({
        x: Math.random() * 800,
        y: 0,
        speed: 120 + Math.random() * 160,
        len: 20 + Math.random() * 30,
        channel: i % 8,
      });
    }

    let lastTime = performance.now();

    const render = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Advance scene timer
      sceneTimer += dt;
      if (sceneTimer >= SCENE_DURATION_SEC) {
        sceneTimer = 0;
        currentScene = (currentScene + 1) % TOTAL_SCENES;
      }

      // Smooth transition alpha (fade in/out over 0.8s)
      const transitionDuration = 0.8;
      let sceneAlpha = 1.0;
      if (sceneTimer < transitionDuration) {
        sceneAlpha = sceneTimer / transitionDuration;
      } else if (sceneTimer > SCENE_DURATION_SEC - transitionDuration) {
        sceneAlpha = (SCENE_DURATION_SEC - sceneTimer) / transitionDuration;
      }
      sceneAlpha = Math.max(0, Math.min(1, sceneAlpha));

      ctx.clearRect(0, 0, width, height);

      // Deep dark sci-fi background gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#040711');
      bgGrad.addColorStop(0.5, '#070D1F');
      bgGrad.addColorStop(1, '#0B132B');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // -----------------------------------------------------------
      // A. Perspective Grid Horizon (Moving towards camera)
      // -----------------------------------------------------------
      const horizonY = height * 0.42;
      const speedGrid = 40; // px/sec
      const gridOffset = (now * 0.001 * speedGrid) % 36;

      ctx.save();
      // Grid Glow at Horizon
      const horizonGlow = ctx.createRadialGradient(
        width / 2,
        horizonY,
        10,
        width / 2,
        horizonY,
        width * 0.6
      );
      horizonGlow.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
      horizonGlow.addColorStop(0.3, 'rgba(99, 102, 241, 0.12)');
      horizonGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = horizonGlow;
      ctx.fillRect(0, 0, width, height);

      // Perspective grid floor lines (converging to vanishing point at center horizon)
      const vanishingX = width * 0.5;
      const vanishingY = horizonY;

      ctx.lineWidth = 1;
      const numPerspectiveLines = 26;
      for (let i = 0; i <= numPerspectiveLines; i++) {
        const bottomX = (width / numPerspectiveLines) * i * 1.8 - width * 0.4;
        const gradLine = ctx.createLinearGradient(vanishingX, vanishingY, bottomX, height);
        gradLine.addColorStop(0, 'rgba(56, 189, 248, 0.02)');
        gradLine.addColorStop(0.6, 'rgba(56, 189, 248, 0.15)');
        gradLine.addColorStop(1, 'rgba(129, 140, 248, 0.25)');
        ctx.strokeStyle = gradLine;
        ctx.beginPath();
        ctx.moveTo(vanishingX, vanishingY);
        ctx.lineTo(bottomX, height);
        ctx.stroke();
      }

      // Horizontal lines with exponential z spacing (giving true 3D depth)
      for (let z = 1; z <= 15; z++) {
        const progress = Math.pow(z / 15, 2.2);
        const y = horizonY + (height - horizonY) * progress + gridOffset * (progress * 0.5);
        if (y > horizonY && y < height) {
          const alpha = progress * 0.35;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
      }
      ctx.restore();

      // -----------------------------------------------------------
      // B. 3D Particle Starfield (Warping toward camera)
      // -----------------------------------------------------------
      ctx.save();
      const warpSpeed = 160;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i]!;
        s.z -= warpSpeed * dt;
        if (s.z <= 10) {
          s.z = 1000;
          s.x = (Math.random() - 0.5) * width * 1.4;
          s.y = (Math.random() - 0.5) * height * 1.2;
        }

        const k = 300 / s.z;
        const px = s.x * k + width / 2;
        const py = s.y * k + height * 0.38;

        if (px >= 0 && px <= width && py >= 0 && py <= height) {
          const sz = Math.max(0.6, s.size * k * 0.8);
          const alpha = Math.min(1, (1000 - s.z) / 400) * 0.7;

          ctx.fillStyle = s.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.arc(px, py, sz, 0, Math.PI * 2);
          ctx.fill();

          // Particle motion speed streak
          if (s.z < 600) {
            const streakK = 300 / (s.z + 25);
            const prevPx = s.x * streakK + width / 2;
            const prevPy = s.y * streakK + height * 0.38;
            ctx.strokeStyle = s.color;
            ctx.lineWidth = sz * 0.6;
            ctx.beginPath();
            ctx.moveTo(prevPx, prevPy);
            ctx.lineTo(px, py);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // -----------------------------------------------------------
      // C. Live Animated Simulation Holograms (Right / Center stage)
      // -----------------------------------------------------------
      ctx.save();
      ctx.globalAlpha = sceneAlpha * 0.85;

      const centerX = width > 768 ? width * 0.68 : width * 0.5;
      const centerY = height * 0.48;

      // SCENE 0: 3D Projectile Cannon & Trajectory
      if (currentScene === 0) {
        projectileT += dt * 1.4;
        const vx0 = projectileV0 * Math.cos(projectileAngle);
        const vy0 = projectileV0 * Math.sin(projectileAngle);
        const flightTime = (2 * vy0) / projectileG;

        if (projectileT > flightTime + 0.6) {
          projectileT = 0;
        }

        const originX = centerX - 180;
        const groundY = centerY + 90;
        const scaleX = 2.4;
        const scaleY = 2.4;

        // Draw parabolic analytical trajectory curve
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        for (let t = 0; t <= flightTime; t += 0.05) {
          const tx = originX + vx0 * t * scaleX;
          const ty = groundY - (vy0 * t - 0.5 * projectileG * t * t) * scaleY;
          if (t === 0) ctx.moveTo(tx, ty);
          else ctx.lineTo(tx, ty);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Projectile ball position
        const tClamped = Math.min(projectileT, flightTime);
        const curX = originX + vx0 * tClamped * scaleX;
        const curY = groundY - (vy0 * tClamped - 0.5 * projectileG * tClamped * tClamped) * scaleY;

        // Cannon at origin
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(originX - 10, groundY);
        ctx.lineTo(originX, groundY);
        ctx.lineTo(
          originX + 24 * Math.cos(projectileAngle),
          groundY - 24 * Math.sin(projectileAngle)
        );
        ctx.stroke();

        // Emit spark trail
        if (projectileT < flightTime) {
          for (let k = 0; k < 2; k++) {
            projectileSparks.push({
              x: curX,
              y: curY,
              vx: (Math.random() - 0.5) * 30 - 15,
              vy: (Math.random() - 0.5) * 30 + 10,
              life: 1.0,
              maxLife: 0.5 + Math.random() * 0.4,
              color: Math.random() > 0.5 ? '#38BDF8' : '#F59E0B',
            });
          }
        }

        // Draw sparks
        for (let i = projectileSparks.length - 1; i >= 0; i--) {
          const sp = projectileSparks[i]!;
          sp.x += sp.vx * dt;
          sp.y += sp.vy * dt;
          sp.life -= dt;
          if (sp.life <= 0) {
            projectileSparks.splice(i, 1);
          } else {
            ctx.fillStyle = sp.color;
            ctx.globalAlpha = (sp.life / sp.maxLife) * sceneAlpha * 0.8;
            ctx.beginPath();
            ctx.arc(sp.x, sp.y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Glowing Projectile Head
        ctx.globalAlpha = sceneAlpha;
        const glow = ctx.createRadialGradient(curX, curY, 2, curX, curY, 18);
        glow.addColorStop(0, '#FFFFFF');
        glow.addColorStop(0.4, '#38BDF8');
        glow.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(curX, curY, 18, 0, Math.PI * 2);
        ctx.fill();

        // Impact ground shockwave ripple
        if (projectileT >= flightTime && projectileT < flightTime + 0.5) {
          const impactProgress = (projectileT - flightTime) / 0.5;
          const r = impactProgress * 40;
          ctx.strokeStyle = `rgba(245, 158, 11, ${1 - impactProgress})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(curX, groundY, r, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Floating Title Pill
        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('PHYSICS: 3D PROJECTILE BALLISTICS [60 FPS]', originX, groundY + 24);
      }

      // SCENE 1: Rutherford Alpha Particle Scattering
      else if (currentScene === 1) {
        // Spawn alpha particles from left
        if (Math.random() < 0.25) {
          const impactY = (Math.random() - 0.5) * 160;
          alphaParticles.push({
            x: centerX - 240,
            y: centerY + impactY,
            vx: 180,
            vy: 0,
            origY: impactY,
            trail: [],
          });
        }

        // Gold Nucleus (Z = 79)
        const nucleusGlow = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, 36);
        nucleusGlow.addColorStop(0, '#F59E0B');
        nucleusGlow.addColorStop(0.5, 'rgba(234, 179, 8, 0.5)');
        nucleusGlow.addColorStop(1, 'rgba(234, 179, 8, 0)');
        ctx.fillStyle = nucleusGlow;
        ctx.beginPath();
        ctx.arc(centerX, centerY, 36, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FEF08A';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 7, 0, Math.PI * 2);
        ctx.fill();

        // Update & draw alpha particles with Coulomb hyperbolic deflection
        for (let i = alphaParticles.length - 1; i >= 0; i--) {
          const p = alphaParticles[i]!;
          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > 20) p.trail.shift();

          const dx = p.x - centerX;
          const dy = p.y - centerY;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);

          // Coulomb Repulsive force: F ~ 1/r^2
          if (dist > 10) {
            const force = 350000 / (distSq + 200);
            p.vx += (dx / dist) * force * dt;
            p.vy += (dy / dist) * force * dt;
          }

          p.x += p.vx * dt;
          p.y += p.vy * dt;

          // Draw trail
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          p.trail.forEach((pt, idx) => {
            if (idx === 0) ctx.moveTo(pt.x, pt.y);
            else ctx.lineTo(pt.x, pt.y);
          });
          ctx.stroke();

          // Particle head
          ctx.fillStyle = '#38BDF8';
          ctx.beginPath();
          ctx.arc(p.x, p.y, 2.5, 0, Math.PI * 2);
          ctx.fill();

          if (p.x > centerX + 260 || p.x < centerX - 260 || Math.abs(p.y - centerY) > 200) {
            alphaParticles.splice(i, 1);
          }
        }

        ctx.fillStyle = 'rgba(234, 179, 8, 0.9)';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('ATOMIC: RUTHERFORD SCATTERING (Au Z=79)', centerX - 140, centerY + 115);
      }

      // SCENE 2: CPU Architecture & Logic Bus
      else if (currentScene === 2) {
        // Draw 3D Isometric microchip block
        const chipW = 160;
        const chipH = 90;
        const chipX = centerX - chipW / 2;
        const chipY = centerY - chipH / 2;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(chipX, chipY, chipW, chipH, 12);
        ctx.fill();
        ctx.stroke();

        // Core label
        ctx.fillStyle = '#60A5FA';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PRISMORA RV32I / 8-BIT', centerX, centerY - 8);
        ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
        ctx.font = '10px monospace';
        ctx.fillText('ALU • RAM • 5-STAGE PIPELINE', centerX, centerY + 12);
        ctx.textAlign = 'left';

        // Bus lines leading in and out
        for (let ch = 0; ch < 8; ch++) {
          const lineY = chipY + 12 + ch * 9;
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.25)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(chipX - 90, lineY);
          ctx.lineTo(chipX, lineY);
          ctx.moveTo(chipX + chipW, lineY);
          ctx.lineTo(chipX + chipW + 90, lineY);
          ctx.stroke();
        }

        // Pulse packets along bus lines
        cpuPulses.forEach((pulse) => {
          pulse.x += pulse.speed * dt;
          if (pulse.x > 260) pulse.x = -90;

          const py = chipY + 12 + pulse.channel * 9;
          const px = pulse.x < 0 ? chipX + pulse.x : chipX + chipW + (pulse.x - 170);

          ctx.strokeStyle = '#38BDF8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + pulse.len, py);
          ctx.stroke();
        });

        ctx.fillStyle = 'rgba(129, 140, 248, 0.9)';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('COA: INSIDE THE CPU PIPELINE & MICROLOGIC', centerX - 140, centerY + 85);
      }

      // SCENE 3: AC Waveform & RLC Resonance
      else if (currentScene === 3) {
        const waveLen = 340;
        const waveStartX = centerX - waveLen / 2;
        const waveY = centerY;
        const freq = 3.5;
        const phase = now * 0.004;

        // Wave 1: Voltage
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let x = 0; x <= waveLen; x += 4) {
          const y = waveY + Math.sin(phase + (x / waveLen) * Math.PI * 2 * freq) * 45;
          if (x === 0) ctx.moveTo(waveStartX + x, y);
          else ctx.lineTo(waveStartX + x, y);
        }
        ctx.stroke();

        // Wave 2: Current (Phase shifted by 60 deg)
        ctx.strokeStyle = '#EC4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let x = 0; x <= waveLen; x += 4) {
          const y =
            waveY + Math.sin(phase - Math.PI / 3 + (x / waveLen) * Math.PI * 2 * freq) * 32;
          if (x === 0) ctx.moveTo(waveStartX + x, y);
          else ctx.lineTo(waveStartX + x, y);
        }
        ctx.stroke();

        // Phasor circle representation at left
        const phasorX = waveStartX - 45;
        const phasorY = waveY;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(phasorX, phasorY, 40, 0, Math.PI * 2);
        ctx.stroke();

        // Phasor Vector V
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(phasorX, phasorY);
        ctx.lineTo(phasorX + Math.cos(phase) * 40, phasorY + Math.sin(phase) * 40);
        ctx.stroke();

        ctx.fillStyle = 'rgba(56, 189, 248, 0.9)';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('ECE: AC SINUSOIDAL HARMONICS & PHASOR DYNAMICS', centerX - 145, centerY + 85);
      }

      // SCENE 4: 3D Double Helix / DNA Strand
      else if (currentScene === 4) {
        const strandLen = 300;
        const strandStartX = centerX - strandLen / 2;
        const strandY = centerY;
        const rot = now * 0.002;

        const numNodes = 28;
        for (let i = 0; i < numNodes; i++) {
          const x = strandStartX + (strandLen / numNodes) * i;
          const theta = rot + (i / numNodes) * Math.PI * 4;

          const y1 = strandY + Math.sin(theta) * 42;
          const z1 = Math.cos(theta);

          const y2 = strandY - Math.sin(theta) * 42;
          const z2 = -Math.cos(theta);

          // Base pair connecting line
          const baseAlpha = (z1 + 1) * 0.35 + 0.15;
          ctx.strokeStyle = `rgba(168, 85, 247, ${baseAlpha})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();

          // Node 1 (Strand A)
          ctx.fillStyle = z1 > 0 ? '#38BDF8' : '#6366F1';
          ctx.beginPath();
          ctx.arc(x, y1, (z1 + 1.2) * 2.2, 0, Math.PI * 2);
          ctx.fill();

          // Node 2 (Strand B)
          ctx.fillStyle = z2 > 0 ? '#EC4899' : '#9333EA';
          ctx.beginPath();
          ctx.arc(x, y2, (z2 + 1.2) * 2.2, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.fillStyle = 'rgba(236, 72, 153, 0.9)';
        ctx.font = 'bold 11px monospace';
        ctx.fillText('BIOLOGY: 3D MOLECULAR HELIX & CYTOGENETICS', centerX - 135, centerY + 85);
      }

      ctx.restore();

      // Top and bottom vignette fade overlays for silky smooth integration
      const topVignette = ctx.createLinearGradient(0, 0, 0, 80);
      topVignette.addColorStop(0, 'rgba(4, 7, 17, 0.7)');
      topVignette.addColorStop(1, 'rgba(4, 7, 17, 0)');
      ctx.fillStyle = topVignette;
      ctx.fillRect(0, 0, width, 80);

      const bottomVignette = ctx.createLinearGradient(0, height - 90, 0, height);
      bottomVignette.addColorStop(0, 'rgba(11, 19, 43, 0)');
      bottomVignette.addColorStop(1, 'rgba(11, 19, 43, 0.95)');
      ctx.fillStyle = bottomVignette;
      ctx.fillRect(0, height - 90, width, 90);

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none select-none z-0"
      aria-hidden="true"
    />
  );
}
