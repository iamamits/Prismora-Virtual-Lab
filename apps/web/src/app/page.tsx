'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Search,
  Atom,
  LineChart,
  FlaskConical,
  Library,
  ArrowRight,
  Gauge,
  CheckCircle2,
  Compass,
  Play,
  Share2,
  GraduationCap,
  Layers,
  Zap,
  Cpu,
  Binary,
  Code2,
  Wrench,
  Sparkles,
  Filter,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PrismoraLogo, PrismoraIcon } from '@prismora/ui';
import { SIMULATION_REGISTRY, LABORATORIES, type SimulationRegistryEntry } from '@/lib/simulations/registry';
import { SimulationCard } from '@/components/catalog/simulation-card';
import { FeaturedSimulationSpotlight } from '@/components/catalog/featured-simulation-spotlight';
import { ExperimentConceptModal } from '@/components/catalog/experiment-concept-modal';

const DISCIPLINES = [
  { id: 'all', name: 'All Laboratories', icon: Compass, color: '#172033' },
  { id: 'physics', name: 'Physics', icon: Atom, color: '#2563EB' },
  { id: 'ece', name: 'ECE & Circuits', icon: Cpu, color: '#06B6D4' },
  { id: 'digital-electronics', name: 'Digital Logic', icon: Zap, color: '#F43F5E' },
  { id: 'coa', name: 'Computer Architecture', icon: Layers, color: '#F59E0B' },
  { id: 'toc', name: 'Automata & TOC', icon: Binary, color: '#8B5CF6' },
  { id: 'mathematics', name: 'Mathematics', icon: LineChart, color: '#8B5CF6' },
  { id: 'chemistry', name: 'Chemistry', icon: FlaskConical, color: '#FBBF24' },
] as const;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'planned'>('all');

  // Selected concept for detail modal (for planned / in-dev simulations)
  const [selectedConcept, setSelectedConcept] = useState<SimulationRegistryEntry | null>(null);

  // Filtered simulations
  const filteredSimulations = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return SIMULATION_REGISTRY.filter((sim) => {
      // Search text match
      const matchesSearch =
        !q ||
        sim.title.toLowerCase().includes(q) ||
        sim.shortTitle.toLowerCase().includes(q) ||
        sim.description.toLowerCase().includes(q) ||
        sim.category.toLowerCase().includes(q) ||
        sim.tags.some((tag) => tag.toLowerCase().includes(q));

      // Discipline match
      const matchesDiscipline =
        selectedDiscipline === 'all' ||
        sim.laboratoryId === selectedDiscipline ||
        (selectedDiscipline === 'ece' &&
          (sim.laboratoryId === 'ece' || sim.laboratoryId === 'digital-electronics' || sim.laboratoryId === 'coa'));

      // Difficulty match
      const matchesDifficulty =
        selectedDifficulty === 'all' || sim.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();

      // Status match
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'available' && sim.status === 'available') ||
        (statusFilter === 'planned' && sim.status !== 'available');

      return matchesSearch && matchesDiscipline && matchesDifficulty && matchesStatus;
    });
  }, [searchQuery, selectedDiscipline, selectedDifficulty, statusFilter]);

  // Core functional labs
  const functionalSimulations = useMemo(
    () => SIMULATION_REGISTRY.filter((s) => s.status === 'available'),
    []
  );

  // Planned/In-dev concepts
  const plannedSimulations = useMemo(
    () => SIMULATION_REGISTRY.filter((s) => s.status !== 'available'),
    []
  );

  const isFiltering = searchQuery.trim() !== '' || selectedDiscipline !== 'all' || selectedDifficulty !== 'all' || statusFilter !== 'all';

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-[#172033] dark:text-[#F8FAFC]">
      {/* 1. Compact, Inspiring Scientific Header */}
      <section className="relative border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F172A] pt-8 pb-8 px-4 sm:px-6 lg:px-8 select-none">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50/80 dark:bg-blue-950/60 text-xs font-mono font-bold text-blue-700 dark:text-blue-300 shadow-xs">
                <PrismoraIcon size={14} minimal />
                <span>Next-Generation Open Source Scientific Simulation &amp; Virtual Labs</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-[#172033] dark:text-white uppercase font-sans leading-none">
                Explore. Experiment.{' '}
                <span className="text-[#2563EB] dark:text-[#38BDF8]">Understand.</span>
              </h1>

              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
                Step into verified physical apparatus, discrete micro-logic gates, RISC-V pipelined processors, and formal automata theory. Every experiment is driven by analytical closed-form equations and real-time matrix solvers.
              </p>
            </div>

            {/* Quick Metrics Badges */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 shrink-0">
              <div className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>8 Working Interactive Labs</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-mono font-bold">
                <span>200+ GATE &amp; B.Tech Topics</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-mono">
                <span>100% Client-Side Solvers</span>
              </div>
            </div>
          </div>

          {/* Search Bar & Instant Discipline Filter Ribbon */}
          <div className="pt-2 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-t border-zinc-100 dark:border-zinc-800">
            {/* Discipline Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
              {DISCIPLINES.map((disc) => {
                const Icon = disc.icon;
                const isSelected = selectedDiscipline === disc.id;
                return (
                  <button
                    key={disc.id}
                    onClick={() => setSelectedDiscipline(disc.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 border ${
                      isSelected
                        ? 'bg-[#172033] dark:bg-white text-white dark:text-[#172033] border-transparent shadow-xs'
                        : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color: isSelected ? undefined : disc.color }} />
                    <span>{disc.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80 shrink-0">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search experiments or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-10">
        {/* If user is NOT searching/filtering, show the editorial Spotlight + Curated Collections */}
        {!isFiltering ? (
          <>
            {/* Featured Simulation Spotlight (Wide Interactive Editorial Card) */}
            <FeaturedSimulationSpotlight onSelectConcept={(sim) => setSelectedConcept(sim)} />

            {/* Scientific & Engineering Disciplines Hub */}
            <section className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-600" />
                    <span>Scientific &amp; Engineering Disciplines</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Explore verified physical models, digital micro-logic, pipelined CPU architectures, and formal automata theory.
                  </p>
                </div>
                <Link href="/labs" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <span>View All Labs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: 'Physics', tagline: 'Kinematics, Dynamics & Gravity', color: '#2563EB', icon: Atom, route: '/experiments/projectile-motion', status: 'Online' },
                  { name: 'Digital Electronics', tagline: 'Logic Gates, K-Maps & Adders', color: '#F43F5E', icon: Zap, route: '/experiments/digital-electronics', status: 'Online' },
                  { name: 'Computer Architecture', tagline: 'RV32I Datapath & Hazards', color: '#06B6D4', icon: Cpu, route: '/experiments/coa', status: 'Online' },
                  { name: 'Theory of Computation', tagline: 'DFA/NFA, CYK & Turing', color: '#8B5CF6', icon: Binary, route: '/experiments/toc', status: 'Online' },
                ].map((sub) => {
                  const Icon = sub.icon;
                  return (
                    <Link key={sub.name} href={sub.route} className="group">
                      <div
                        className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F172A] hover:shadow-md transition-all h-full flex flex-col justify-between"
                        style={{ borderLeftWidth: '4px', borderLeftColor: sub.color }}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-xs"
                              style={{ backgroundColor: sub.color }}
                            >
                              <Icon className="w-4 h-4" />
                            </div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{sub.status}</span>
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 transition-colors">
                            {sub.name}
                          </h3>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            {sub.tagline}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300 mt-3">
                          <span>Enter Workspace</span>
                          <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>

            {/* Curated Collection: Flagship Functional Laboratories */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-blue-600" />
                    <span>Verified Interactive Laboratories</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Fully functional browser simulations with real-time vector graphics, live instruments, and interactive parameters.
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  {functionalSimulations.length} Labs Online
                </span>
              </div>

              {/* Grid of Visualization-First Functional Simulation Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {functionalSimulations.map((sim) => (
                  <SimulationCard
                    key={sim.id}
                    simulation={sim}
                    onSelectConcept={(s) => setSelectedConcept(s)}
                  />
                ))}
              </div>
            </section>

            {/* Curated Collection: Upcoming & Roadmap Scientific Concepts */}
            <section className="space-y-4 pt-4">
              <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                <div className="space-y-0.5">
                  <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-purple-600" />
                    <span>Curriculum Roadmap &amp; Scientific Concepts</span>
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Carefully previewed conceptual models aligned with undergraduate engineering and physics syllabi.
                  </p>
                </div>

                <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/40 px-2.5 py-1 rounded-md border border-purple-500/20">
                  {plannedSimulations.length} Concepts
                </span>
              </div>

              {/* Grid of Planned Experiment Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plannedSimulations.map((sim) => (
                  <SimulationCard
                    key={sim.id}
                    simulation={sim}
                    onSelectConcept={(s) => setSelectedConcept(s)}
                  />
                ))}
              </div>
            </section>
          </>
        ) : (
          /* Search & Filter Results Mode */
          <section className="space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-600" />
                  <span>Search &amp; Filter Results</span>
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Showing {filteredSimulations.length} of {SIMULATION_REGISTRY.length} simulations matching your criteria.
                </p>
              </div>

              {/* Status and Reset controls */}
              <div className="flex items-center gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-medium focus:outline-none"
                  aria-label="Filter by implementation status"
                >
                  <option value="all">All Statuses</option>
                  <option value="available">Available Now</option>
                  <option value="planned">Planned Concepts</option>
                </select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDiscipline('all');
                    setSelectedDifficulty('all');
                    setStatusFilter('all');
                  }}
                  className="text-xs font-semibold h-8"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5 text-zinc-400" />
                  <span>Reset</span>
                </Button>
              </div>
            </div>

            {/* Grid of filtered cards */}
            {filteredSimulations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSimulations.map((sim) => (
                  <SimulationCard
                    key={sim.id}
                    simulation={sim}
                    onSelectConcept={(s) => setSelectedConcept(s)}
                  />
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="p-16 text-center border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-2xl space-y-3 bg-white dark:bg-zinc-900/40">
                <Search className="w-10 h-10 text-zinc-400 mx-auto" />
                <h3 className="text-base font-bold text-zinc-800 dark:text-zinc-200">
                  No simulations match your search query
                </h3>
                <p className="text-xs text-zinc-500 max-w-md mx-auto">
                  Try searching with broader terms (e.g. &quot;physics&quot;, &quot;circuit&quot;, &quot;gate&quot;, &quot;kinematics&quot;) or reset your filters.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedDiscipline('all');
                    setSelectedDifficulty('all');
                    setStatusFilter('all');
                  }}
                  className="mt-2 text-xs font-semibold"
                >
                  Reset All Filters
                </Button>
              </div>
            )}
          </section>
        )}
      </main>

      {/* 3. Scientific Architecture Recap */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-100 dark:bg-[#070D1A] border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-black tracking-tight text-[#172033] dark:text-white">
              The Prismora Scientific Architecture
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Decoupled, zero-dependency mathematical models operating directly in browser memory.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-blue-500/20 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Atom className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora Explore</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Kinematics, dynamics, and celestial gravity simulations with verified analytical models.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-cyan-500/20 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-cyan-600 text-white flex items-center justify-center font-bold">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora ECE Lab</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Nodal circuit analysis, virtual breadboards, oscilloscopes, and DMM instrumentation.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-purple-500/20 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
                <Binary className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora Micro &amp; TOC</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                RISC-V 5-stage CPU pipelining, associative caches, DFA/NFA powerset, and Turing machines.
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-[#0F172A] border border-rose-500/20 space-y-2 shadow-xs">
              <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora Studio</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Continuous function manifolds, coordinate geometry, vector fields, and reproducible reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Global Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0B1120] py-8 px-4 sm:px-6 text-center text-xs text-zinc-500 space-y-2">
        <div className="flex justify-center items-center gap-2 mb-1">
          <PrismoraLogo variant="full" size="sm" />
        </div>
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">
          Explore. Experiment. Understand. &bull; Open-Source Virtual Laboratories
        </p>
        <p>Licensed under MIT License &bull; Free and accessible for universities, students, and researchers worldwide</p>
      </footer>

      {/* 5. Experiment Concept Modal for Planned Labs */}
      <ExperimentConceptModal
        simulation={selectedConcept}
        isOpen={!!selectedConcept}
        onClose={() => setSelectedConcept(null)}
      />
    </div>
  );
}
