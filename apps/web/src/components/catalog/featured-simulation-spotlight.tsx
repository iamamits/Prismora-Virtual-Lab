'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, FlaskConical, Atom, Zap, Cpu, Compass } from 'lucide-react';
import { Button } from '@prismora/ui';
import { InteractiveHeroSimulation } from '@/components/landing/interactive-hero-simulation';
import { SimulationPreview } from './simulation-preview';
import type { SimulationRegistryEntry } from '@/lib/simulations/registry';

interface FeaturedSpotlightProps {
  onSelectConcept?: (sim: SimulationRegistryEntry) => void;
}

export function FeaturedSimulationSpotlight({ onSelectConcept }: FeaturedSpotlightProps) {
  const [activeTab, setActiveTab] = useState<'physics' | 'ece'>('physics');

  return (
    <section className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F172A] overflow-hidden shadow-lg">
      {/* Top Banner Navigation */}
      <div className="px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#070D1A] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 font-mono">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            <span>Featured Laboratory Spotlight</span>
          </span>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-zinc-200/60 dark:bg-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('physics')}
            className={`px-3 py-1 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'physics'
                ? 'bg-white dark:bg-[#1E293B] text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Physics: Projectile Motion</span>
          </button>
          <button
            onClick={() => setActiveTab('ece')}
            className={`px-3 py-1 rounded-md font-bold transition-colors flex items-center gap-1.5 ${
              activeTab === 'ece'
                ? 'bg-white dark:bg-[#1E293B] text-cyan-600 dark:text-cyan-400 shadow-xs'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ECE: Nodal Circuit Lab</span>
          </button>
        </div>
      </div>

      {/* Main Spotlight Body */}
      {activeTab === 'physics' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
          {/* Left: Real Interactive Hero Simulation Canvas (7 cols) */}
          <div className="lg:col-span-7 bg-[#0B1120] p-4 sm:p-6 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800">
            <InteractiveHeroSimulation />
          </div>

          {/* Right: Laboratory Storytelling & Direct Access (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold">
                <Atom className="w-3.5 h-3.5" />
                <span>Flagship Classical Mechanics</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  Analytical Projectile Motion
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  Investigate 2D kinematic trajectory equations with articulated drag-to-aim launcher, variable celestial gravity (Earth, Moon, Mars, Zero-G), target hit reticle, and calibrated sensor probes.
                </p>
              </div>

              {/* Invariant Equation Badges */}
              <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                  Governing Trajectory Closed-Form:
                </span>
                <code className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 block">
                  y(t) = y₀ + v₀·sin(θ)·t - ½·g·t²
                </code>
              </div>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <div className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <span className="block text-[10px] text-zinc-400 font-mono">GRAVITY PRESETS</span>
                  <strong className="text-zinc-900 dark:text-white">Earth, Moon, Mars</strong>
                </div>
                <div className="p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <span className="block text-[10px] text-zinc-400 font-mono">PRECISION</span>
                  <strong className="text-zinc-900 dark:text-white">Zero Numerical Drift</strong>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-500 font-mono">
                Level: <strong>Introductory</strong>
              </span>
              <Link href="/experiments/projectile-motion">
                <Button size="lg" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-5 shadow-sm flex items-center gap-2">
                  <span>Enter Full Physics Lab</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
          {/* Left: ECE Schematic & Oscilloscope View (7 cols) */}
          <div className="lg:col-span-7 bg-[#0B1120] p-4 sm:p-6 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-zinc-200 dark:border-zinc-800 aspect-[16/10]">
            <SimulationPreview simId="diode-rectifier" isHovered={true} />
          </div>

          {/* Right: ECE Laboratory Overview (5 cols) */}
          <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-xs font-mono font-bold">
                <Cpu className="w-3.5 h-3.5" />
                <span>Electronics &amp; Communication Engineering</span>
              </div>

              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">
                  ECE Virtual Laboratory Workbench
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                  Real-time nodal circuit solver featuring dual schematic &amp; physical breadboard views, dual-channel oscilloscope, true RMS digital multimeter, and 200 B.Tech mapped curriculum topics.
                </p>
              </div>

              {/* Sub-labs Quick Links */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block font-mono">
                  Featured ECE Sub-Laboratories:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Link href="/experiments/ece/ohms-law" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 block text-center">
                    Ohm&apos;s Law
                  </Link>
                  <Link href="/experiments/ece/diode-rectifier" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 block text-center">
                    Rectifiers
                  </Link>
                  <Link href="/experiments/ece/adders" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-blue-400 text-xs font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-50 dark:bg-zinc-900 block text-center">
                    Adders
                  </Link>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3">
              <span className="text-xs text-zinc-500 font-mono">
                Curriculum: <strong>200+ Topics</strong>
              </span>
              <Link href="/experiments/ece">
                <Button size="lg" className="bg-[#06B6D4] hover:bg-[#0891B2] text-white font-bold text-xs px-5 shadow-sm flex items-center gap-2">
                  <span>Enter ECE Workbench</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
