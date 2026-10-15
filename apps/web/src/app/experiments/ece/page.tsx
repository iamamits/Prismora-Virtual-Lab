/**
 * Prismora ECE Virtual Lab — Central Engineering Directory & Experiment Catalog
 * Comprehensive 12-category academic launchpad with clear working vs. planned statuses,
 * instant search, and direct laboratory launch.
 */

'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  LABORATORIES,
  SIMULATION_REGISTRY,
  SimulationRegistryEntry,
} from '@/lib/simulations/registry';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Layers,
  Radio,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';

const ECE_CATEGORIES = [
  'All Categories',
  'Basic and Analog Electronics',
  'Digital Electronics and Logic Design',
  'Signals and Systems',
  'Analog and Digital Communication',
  'Digital Signal Processing',
  'Semiconductor Devices and Microelectronics',
  'VLSI and Hardware Design',
  'Embedded Systems and Microcontrollers',
  'RF, Antennas and Wireless Communication',
  'Computer Networks and Communication Protocols',
  'Information and Coding Theory',
  'Electronic Instrumentation and Measurements',
] as const;

export default function ECELabCatalogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'in_development' | 'planned'>(
    'all',
  );

  // Filter ECE experiments
  const experiments = useMemo(() => {
    return SIMULATION_REGISTRY.filter((s) => {
      // Must belong to ECE or Digital Electronics
      const isECE = s.laboratoryId === 'ece' || s.laboratoryId === 'digital-electronics';
      if (!isECE) return false;

      // Category filter
      if (selectedCategory !== 'All Categories' && s.category !== selectedCategory) {
        return false;
      }

      // Status filter
      if (statusFilter !== 'all' && s.status !== statusFilter) {
        return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchDesc = s.description.toLowerCase().includes(q);
        const matchTags = s.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTags) return false;
      }

      return true;
    });
  }, [selectedCategory, statusFilter, search]);

  const workingCount = SIMULATION_REGISTRY.filter(
    (s) => (s.laboratoryId === 'ece' || s.laboratoryId === 'digital-electronics') && s.status === 'available',
  ).length;

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-[#0B1120] text-zinc-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
          <Link href="/" className="hover:text-white transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link href="/labs" className="hover:text-white transition-colors">
            Laboratories
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-cyan-400 font-bold">Prismora ECE Virtual Lab</span>
        </nav>

        {/* Hero Banner */}
        <div className="rounded-2xl border-2 border-cyan-800/60 bg-[#0F172A] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-950 border border-cyan-500 text-cyan-300">
                Department of Electronics & Communication Engineering
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 border border-emerald-500 text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{workingCount} Fully Interactive Labs Online</span>
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Prismora ECE Virtual Lab
            </h1>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Explore, construct, simulate, and verify electronic circuits, digital logic architectures,
              communication channels, and signal processing algorithms with mathematically rigorous
              analytical solvers and real-time observability.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/experiments/ece/adders"
                className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-md transition-colors flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Launch Half & Full Adder Virtual Lab</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/experiments/digital-electronics"
                className="px-4 py-2 rounded-lg bg-[#182030] hover:bg-[#1E293B] border border-zinc-700 text-zinc-200 font-bold text-xs transition-colors flex items-center gap-2"
              >
                <Cpu className="w-4 h-4 text-pink-400" />
                <span>Digital Logic & K-Map Workbench</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ECE experiments by title or topic..."
                className="w-full bg-[#182030] border border-zinc-700/80 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#182030] p-1 rounded-lg border border-zinc-800 text-xs font-bold">
              {[
                { id: 'all', label: 'All Status' },
                { id: 'available', label: 'Interactive (Ready)' },
                { id: 'in_development', label: 'In Development' },
                { id: 'planned', label: 'Planned' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStatusFilter(s.id as any)}
                  className={`px-3 py-1 rounded-md transition-colors ${
                    statusFilter === s.id
                      ? 'bg-cyan-600 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* 12 ECE Category Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 custom-scrollbar">
            {ECE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat
                    ? 'bg-cyan-600 text-white border-cyan-500 shadow-sm'
                    : 'bg-[#182030] text-zinc-400 hover:text-white border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Experiment Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {experiments.map((sim) => {
            const isWorking = sim.status === 'available';

            return (
              <div
                key={sim.id}
                className="flex flex-col justify-between rounded-xl border border-zinc-800 bg-[#0F172A] p-5 shadow-lg hover:border-cyan-500/80 transition-all group"
              >
                <div className="space-y-3">
                  {/* Top Badges */}
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
                      {sim.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded font-bold border ${
                        isWorking
                          ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                          : sim.status === 'in_development'
                          ? 'bg-amber-950/80 border-amber-600 text-amber-300'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                      }`}
                    >
                      {isWorking
                        ? 'Interactive Simulator'
                        : sim.status === 'in_development'
                        ? 'In Development'
                        : 'Planned Curriculum'}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h2 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {sim.title}
                    </h2>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-3 leading-relaxed">
                      {sim.description}
                    </p>
                  </div>

                  {/* Learning Objectives Preview */}
                  {sim.learningObjectives.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-[#182030]/80 border border-zinc-800/80 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                        Core Objectives
                      </span>
                      <ul className="text-[11px] text-zinc-300 space-y-0.5 list-disc pl-3.5">
                        {sim.learningObjectives.slice(0, 2).map((obj, i) => (
                          <li key={i}>{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-4 border-t border-zinc-800/80 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1">
                    {sim.tags.slice(0, 2).map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  {isWorking ? (
                    <Link
                      href={sim.route}
                      className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow transition-colors flex items-center gap-1.5"
                    >
                      <span>Launch</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <span className="text-[11px] font-mono text-zinc-500">
                      Curriculum Spec
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
