/**
 * Prismora ECE Virtual Lab — Central Engineering Directory & Experiment Catalog
 * Comprehensive 200-Topic Undergraduate ECE Curriculum & Interactive Simulation Launchpad.
 * Exclusively Light Theme with pure solid colours, responsive filter rail, and interactive spotlight.
 */

'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  SIMULATION_REGISTRY,
  SimulationDifficulty,
  SimulationRegistryEntry,
  SimulationStatus,
} from '@/lib/simulations/registry';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Cpu,
  Eye,
  Filter,
  Layers,
  Radio,
  RotateCcw,
  Search,
  Sparkles,
  Sliders,
  X,
  Zap,
} from 'lucide-react';

const ECE_DISCIPLINES = [
  'All Disciplines',
  'Electrical Fundamentals and Network Analysis',
  'Basic Electronics and Semiconductor Devices',
  'Analog Electronics and Integrated Circuits',
  'Digital Electronics and Logic Design',
  'Signals and Systems',
  'Digital Signal Processing',
  'Analog and Digital Communication',
  'Embedded Systems and Microcontrollers',
  'RF, Antennas and Wireless Communication',
  'Information Theory and Coding',
  'Electronic Instrumentation and Measurements',
] as const;

export default function ECELabCatalogPage() {
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('All Disciplines');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedInstrument, setSelectedInstrument] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [activeSpecModal, setActiveSpecModal] = useState<SimulationRegistryEntry | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // All ECE registry items
  const allEceItems = useMemo(() => {
    return SIMULATION_REGISTRY.filter(
      (s) => s.laboratoryId === 'ece' || s.laboratoryId === 'digital-electronics',
    );
  }, []);

  // Filtered ECE experiments
  const filteredExperiments = useMemo(() => {
    return allEceItems.filter((s) => {
      // Discipline filter
      if (selectedDiscipline !== 'All Disciplines' && s.category !== selectedDiscipline) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'all' && s.status !== selectedStatus) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty !== 'All' && s.difficulty !== selectedDifficulty) {
        return false;
      }

      // Instrument filter
      if (selectedInstrument !== 'All') {
        const hasInstrument = s.capabilities.some((c) =>
          c.toLowerCase().includes(selectedInstrument.toLowerCase()),
        ) || s.tags.some((t) => t.toLowerCase().includes(selectedInstrument.toLowerCase()));
        if (!hasInstrument) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = s.title.toLowerCase().includes(q);
        const matchShort = s.shortTitle.toLowerCase().includes(q);
        const matchDesc = s.description.toLowerCase().includes(q);
        const matchId = s.id.toLowerCase().includes(q);
        const matchTags = s.tags.some((t) => t.toLowerCase().includes(q));
        const matchObjectives = s.learningObjectives.some((o) => o.toLowerCase().includes(q));
        if (!matchTitle && !matchShort && !matchDesc && !matchId && !matchTags && !matchObjectives) {
          return false;
        }
      }

      return true;
    });
  }, [allEceItems, selectedDiscipline, selectedStatus, selectedDifficulty, selectedInstrument, search]);

  const availableCount = allEceItems.filter((s) => s.status === 'available').length;
  const inDevCount = allEceItems.filter((s) => s.status === 'in_development').length;
  const plannedCount = allEceItems.filter((s) => s.status === 'planned').length;

  const handleResetFilters = () => {
    setSelectedDiscipline('All Disciplines');
    setSelectedDifficulty('All');
    setSelectedStatus('all');
    setSelectedInstrument('All');
    setSearch('');
  };

  const isFiltered =
    selectedDiscipline !== 'All Disciplines' ||
    selectedDifficulty !== 'All' ||
    selectedStatus !== 'all' ||
    selectedInstrument !== 'All' ||
    search.trim() !== '';

  return (
    <div className="min-h-[calc(100dvh-3.5rem)] bg-[#F8FAFC] text-[#172033] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <Link href="/" className="hover:text-zinc-900 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <Link href="/labs" className="hover:text-zinc-900 transition-colors">
            Laboratories
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-blue-600 font-bold">Prismora ECE Virtual Lab</span>
        </nav>

        {/* Hero Section */}
        <div className="rounded-2xl border-2 border-blue-200 bg-white p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 max-w-4xl space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">
                Department of Electronics & Communication Engineering
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{availableCount} Interactive Labs Online</span>
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                200 Topic Standardized Curriculum
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#172033]">
              Prismora ECE Virtual Laboratory
            </h1>

            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              Explore, construct, simulate, and verify electronic circuits, digital logic architectures,
              communication channels, and signal processing algorithms with mathematically rigorous
              analytical solvers and real-time observability.
            </p>

            {/* Quick stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div className="text-2xl font-black text-blue-600">200</div>
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                  Curriculum Topics
                </div>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div className="text-2xl font-black text-emerald-600">{availableCount}</div>
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                  Interactive Labs
                </div>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div className="text-2xl font-black text-violet-600">11</div>
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                  Core Disciplines
                </div>
              </div>
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl">
                <div className="text-2xl font-black text-amber-600">0</div>
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">
                  Dark Mode / Gradients
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Interactive Labs Spotlight */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-extrabold text-[#172033]">
                Flagship Interactive Simulators
              </h2>
            </div>
            <span className="text-xs font-semibold text-zinc-500">
              Validated with authentic analytical models & physical components
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Spotlight 1: Adders */}
            <div className="flex flex-col justify-between rounded-xl border-2 border-blue-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Digital Logic Design
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Interactive Ready
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172033]">
                    Half & Full Adder Virtual Lab
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    Interactive 2D schematic canvas, logic gates, real-time wire routing, automated truth
                    table verification, multi-channel logic analyzer, and comprehensive theory drawer.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">
                    2D Canvas
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">
                    Truth Table
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">
                    Logic Analyzer
                  </span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-zinc-100">
                <Link
                  href="/experiments/ece/adders"
                  className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Launch Adder Lab</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Spotlight 2: Ohm's Law */}
            <div className="flex flex-col justify-between rounded-xl border-2 border-emerald-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Electrical Fundamentals
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Interactive Ready
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172033]">
                    Ohm&apos;s Law & DC Circuits Lab
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    0-30V DC bench supply, SPST knife switch lever, physics-driven incandescent tungsten bulb
                    glow, 4-band EIA resistors, dynamic V-I scatter plot, and interactive multimeter.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">
                    DC Bench Supply
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">
                    Glowing Bulb
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">
                    Multimeter
                  </span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-zinc-100">
                <Link
                  href="/experiments/ece/ohms-law"
                  className="w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Launch Ohm&apos;s Law Lab</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Spotlight 3: Diode & Rectifiers */}
            <div className="flex flex-col justify-between rounded-xl border-2 border-violet-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-violet-50 text-violet-700 border border-violet-200">
                    Semiconductor Devices
                  </span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Interactive Ready
                  </span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#172033]">
                    PN Junction Diode & Rectifiers Lab
                  </h3>
                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">
                    Shockley equation solver, Silicon vs Germanium knee curve sweep, Half-Wave & Bridge
                    rectifiers, dual-trace oscilloscope graticule, and capacitor smoothing filter.
                  </p>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">
                    I-V Sweep Curve
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">
                    Bridge Rectifier
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-zinc-100 rounded text-zinc-600 font-mono">
                    Oscilloscope
                  </span>
                </div>
              </div>
              <div className="pt-4 mt-4 border-t border-zinc-100">
                <Link
                  href="/experiments/ece/diode-rectifier"
                  className="w-full py-2 px-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <span>Launch Rectifier Lab</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Main Two-Column Layout: Filter Rail + Catalog Grid */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Mobile Filter Toggle */}
          <div className="w-full lg:hidden flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-xl shadow-xs">
            <span className="text-xs font-bold text-zinc-700">Filter Curriculum Topics</span>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg border border-blue-200 flex items-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              <span>{showMobileFilters ? 'Hide Filters' : 'Show Filters'}</span>
            </button>
          </div>

          {/* Left Sidebar: Filter Rail */}
          <aside
            className={`w-full lg:w-72 shrink-0 space-y-6 ${
              showMobileFilters ? 'block' : 'hidden lg:block'
            }`}
          >
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-5 sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-bold text-[#172033]">Filter Catalog</span>
                </div>
                {isFiltered && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Search Bar */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block">Search Curriculum</label>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search 200 ECE topics..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-9 pr-8 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {search && (
                    <button
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Status Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block">Implementation Status</label>
                <div className="space-y-1">
                  {[
                    { id: 'all', label: 'All Statuses', count: allEceItems.length },
                    { id: 'available', label: 'Interactive Ready', count: availableCount },
                    { id: 'in_development', label: 'In Development', count: inDevCount },
                    { id: 'planned', label: 'Curriculum Planned', count: plannedCount },
                  ].map((s) => {
                    const isSelected = selectedStatus === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStatus(s.id)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                        }`}
                      >
                        <span>{s.label}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                            isSelected ? 'bg-blue-700 text-white' : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {s.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Discipline Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block">Academic Discipline</label>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar text-xs">
                  {ECE_DISCIPLINES.map((disc) => {
                    const isSelected = selectedDiscipline === disc;
                    const count =
                      disc === 'All Disciplines'
                        ? allEceItems.length
                        : allEceItems.filter((i) => i.category === disc).length;

                    return (
                      <button
                        key={disc}
                        onClick={() => setSelectedDiscipline(disc)}
                        className={`w-full text-left flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                        }`}
                      >
                        <span className="truncate pr-2">{disc}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                            isSelected ? 'bg-blue-700 text-white' : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block">Academic Level</label>
                <div className="grid grid-cols-2 gap-1">
                  {(['All', 'Introductory', 'Intermediate', 'Advanced'] as const).map((diff) => {
                    const isSelected = selectedDifficulty === diff;
                    return (
                      <button
                        key={diff}
                        onClick={() => setSelectedDifficulty(diff)}
                        className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center border transition-colors ${
                          isSelected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                        }`}
                      >
                        {diff}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Virtual Instruments Filter */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-700 block">Virtual Instrument</label>
                <div className="grid grid-cols-2 gap-1">
                  {['All', 'Multimeter', 'Oscilloscope', 'Power Supply', 'Logic Analyzer'].map(
                    (inst) => {
                      const isSelected = selectedInstrument === inst;
                      return (
                        <button
                          key={inst}
                          onClick={() => setSelectedInstrument(inst)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold text-center border transition-colors truncate ${
                            isSelected
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                          }`}
                        >
                          {inst}
                        </button>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Right Main Content: Results & Catalog Grid */}
          <main className="flex-1 min-w-0 space-y-5">
            {/* Results Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-200 gap-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#172033]">
                  Showing {filteredExperiments.length} Curriculum Topics
                </span>
                {isFiltered && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    Filtered
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <span>Undergraduate Curriculum Standards B.Tech ECE</span>
              </div>
            </div>

            {/* Empty State */}
            {filteredExperiments.length === 0 && (
              <div className="p-12 text-center bg-white border border-zinc-200 rounded-2xl space-y-3">
                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto text-zinc-400">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#172033]">No topics match your filters</h3>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  Try adjusting your search query, selecting &apos;All Disciplines&apos;, or clearing the
                  status filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            )}

            {/* Catalog Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredExperiments.map((sim) => {
                const isWorking = sim.status === 'available';
                const isInDev = sim.status === 'in_development';

                return (
                  <div
                    key={sim.id}
                    className="flex flex-col justify-between rounded-xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-blue-400 transition-all hover:shadow-sm group"
                  >
                    <div className="space-y-3">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span
                          className="px-2 py-0.5 rounded font-bold"
                          style={{
                            backgroundColor: `${sim.disciplineColor}15`,
                            color: sim.disciplineColor,
                          }}
                        >
                          {sim.category.split(' ')[0]}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded font-bold border ${
                            isWorking
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : isInDev
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                          }`}
                        >
                          {isWorking
                            ? 'Interactive Ready'
                            : isInDev
                            ? 'In Development'
                            : 'Curriculum Spec'}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <div>
                        <h3 className="text-sm font-bold text-[#172033] group-hover:text-blue-600 transition-colors">
                          {sim.title}
                        </h3>
                        <p className="text-xs text-zinc-600 mt-1 line-clamp-2 leading-relaxed">
                          {sim.description}
                        </p>
                      </div>

                      {/* Capabilities / Instruments preview */}
                      {sim.capabilities && sim.capabilities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {sim.capabilities.slice(0, 3).map((cap, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 bg-zinc-50 border border-zinc-200 rounded text-zinc-600 font-mono truncate max-w-[180px]"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Governing formula if available */}
                      {sim.equations && sim.equations.length > 0 && (
                        <div className="p-2 rounded bg-zinc-50 border border-zinc-200 font-mono text-[11px] text-zinc-800">
                          {sim.equations[0]}
                        </div>
                      )}
                    </div>

                    {/* Footer Action */}
                    <div className="pt-4 mt-4 border-t border-zinc-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
                        <span>{sim.difficulty}</span>
                        <span>•</span>
                        <span>{sim.tags[0]}</span>
                      </div>

                      {isWorking ? (
                        <Link
                          href={sim.route}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <span>Launch</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      ) : (
                        <button
                          onClick={() => setActiveSpecModal(sim)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-blue-200 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Spec</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      {/* Curriculum Specification Detail Modal */}
      {activeSpecModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between pb-3 border-b border-zinc-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-xs font-mono font-bold"
                    style={{
                      backgroundColor: `${activeSpecModal.disciplineColor}15`,
                      color: activeSpecModal.disciplineColor,
                    }}
                  >
                    {activeSpecModal.category}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-bold border ${
                      activeSpecModal.status === 'in_development'
                        ? 'bg-amber-50 border-amber-200 text-amber-700'
                        : 'bg-zinc-100 border-zinc-200 text-zinc-600'
                    }`}
                  >
                    {activeSpecModal.status === 'in_development'
                      ? 'In Active Development'
                      : 'Curriculum Specification'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#172033]">{activeSpecModal.title}</h2>
              </div>
              <button
                onClick={() => setActiveSpecModal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs leading-relaxed text-zinc-700">
              <div>
                <h4 className="font-bold text-zinc-900 mb-1">Academic Overview</h4>
                <p className="text-zinc-600">{activeSpecModal.description}</p>
              </div>

              {activeSpecModal.learningObjectives.length > 0 && (
                <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl space-y-1.5">
                  <h4 className="font-bold text-zinc-900">Learning Objectives</h4>
                  <ul className="list-disc pl-4 space-y-1 text-zinc-600">
                    {activeSpecModal.learningObjectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>
              )}

              {activeSpecModal.capabilities.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-bold text-zinc-900">Required Instruments & Capabilities</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeSpecModal.capabilities.map((cap, i) => (
                      <span
                        key={i}
                        className="px-2 py-1 rounded bg-zinc-100 border border-zinc-200 text-zinc-700 font-mono text-[11px]"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeSpecModal.equations && activeSpecModal.equations.length > 0 && (
                <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                  <h4 className="font-bold text-blue-900">Governing Mathematical Formulations</h4>
                  <div className="space-y-1 font-mono text-zinc-800 text-[11px]">
                    {activeSpecModal.equations.map((eq, i) => (
                      <div key={i} className="p-1.5 bg-white rounded border border-blue-100">
                        {eq}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-[11px]">
                <strong>Standardized B.Tech Syllabus Specification:</strong> This experiment
                definition is part of the standardized 200-topic ECE virtual laboratory roadmap
                benchmarking university virtual laboratory requirements.
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => setActiveSpecModal(null)}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs rounded-lg transition-colors"
              >
                Close Specification
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
