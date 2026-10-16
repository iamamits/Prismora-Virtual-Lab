'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  FlaskConical,
  Atom,
  Cpu,
  Binary,
  Layers,
  LineChart,
  Wrench,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Filter,
  BookOpen,
  RotateCcw,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  PrismoraIcon,
} from '@prismora/ui';
import {
  LABORATORIES,
  SIMULATION_REGISTRY,
  type LaboratoryId,
  type SimulationRegistryEntry,
  type SimulationStatus,
  type SimulationDifficulty,
  querySimulations,
} from '@/lib/simulations/registry';
import { SimulationCard } from '@/components/catalog/simulation-card';
import { ExperimentConceptModal } from '@/components/catalog/experiment-concept-modal';

export default function LabsCatalogPage() {
  const [activeLab, setActiveLab] = useState<LaboratoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [recentlyVisited, setRecentlyVisited] = useState<string[]>([]);
  const [selectedConcept, setSelectedConcept] = useState<SimulationRegistryEntry | null>(null);

  // Load recently visited experiments from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('prismora:recent-sims');
      if (stored) {
        setRecentlyVisited(JSON.parse(stored));
      }
    } catch {
      // Storage unavailable or disabled
    }
  }, []);

  const filteredSimulations = querySimulations({
    search: searchQuery,
    laboratoryId: activeLab,
    difficulty: difficultyFilter,
    status: statusFilter,
  });

  const availableCount = SIMULATION_REGISTRY.filter((s) => s.status === 'available').length;
  const plannedCount = SIMULATION_REGISTRY.filter((s) => s.status !== 'available').length;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-[#172033] dark:text-[#F8FAFC]">
      {/* Top Header & Breadcrumbs */}
      <section className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F172A] px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <nav className="flex items-center gap-2 text-xs text-zinc-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-white transition-colors">
              Prismora
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">Laboratories</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
                <FlaskConical className="w-7 h-7 text-[#2563EB]" />
                <span>Prismora Laboratories</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
                Structured virtual laboratory environments for university physics, digital micro-logic, computer architecture, and automata theory.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>{availableCount} Available Now</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-mono font-semibold">
                <span>{plannedCount} In Development</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Container */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Laboratory Tabs Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Select Discipline Laboratory
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveLab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                activeLab === 'all'
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border-transparent shadow-sm'
                  : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
              }`}
            >
              All Labs ({SIMULATION_REGISTRY.length})
            </button>

            {Object.values(LABORATORIES).map((lab) => {
              const isSelected = activeLab === lab.id;
              const count = SIMULATION_REGISTRY.filter((s) => s.laboratoryId === lab.id).length;

              return (
                <button
                  key={lab.id}
                  onClick={() => setActiveLab(lab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'text-white border-transparent shadow-sm'
                      : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400'
                  }`}
                  style={{
                    backgroundColor: isSelected ? lab.disciplineColor : undefined,
                  }}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: lab.disciplineColor }}
                  />
                  <span>{lab.shortName}</span>
                  <span className="opacity-75 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Laboratory Focus Banner (When a specific lab is selected) */}
        {activeLab !== 'all' && (
          <div
            className="p-5 rounded-xl border bg-white dark:bg-zinc-900 space-y-3 transition-all"
            style={{ borderColor: LABORATORIES[activeLab].disciplineColor }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-bold text-white uppercase tracking-wider font-mono"
                  style={{ backgroundColor: LABORATORIES[activeLab].disciplineColor }}
                >
                  {LABORATORIES[activeLab].shortName}
                </span>
                <h2 className="text-lg font-black text-zinc-900 dark:text-white">
                  {LABORATORIES[activeLab].name}
                </h2>
              </div>
              <button
                onClick={() => setActiveLab('all')}
                className="text-xs text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
              >
                Show all labs
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              {LABORATORIES[activeLab].description}
            </p>

            {/* Structured Syllabus Categories */}
            <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Curriculum Modules:
              </div>
              <div className="flex flex-wrap gap-2">
                {LABORATORIES[activeLab].categories.map((cat) => (
                  <span
                    key={cat}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Search, Filter, and Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search experiments by title, tags, or concepts (e.g. kinematics, K-map, RV32I)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Status Filter */}
            <select
              aria-label="Filter by implementation status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="available">Available Now</option>
              <option value="in_development">In Development</option>
              <option value="planned">Planned</option>
            </select>

            {/* Difficulty Filter */}
            <select
              aria-label="Filter by academic difficulty"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 focus:outline-none"
            >
              <option value="all">All Difficulties</option>
              <option value="introductory">Introductory</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {(searchQuery || statusFilter !== 'all' || difficultyFilter !== 'all' || activeLab !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDifficultyFilter('all');
                  setActiveLab('all');
                }}
                className="p-1.5 text-xs text-zinc-500 hover:text-rose-500 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="Reset all filters"
                aria-label="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Simulations Catalog Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Showing {filteredSimulations.length} of {SIMULATION_REGISTRY.length} simulations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSimulations.map((sim) => (
              <SimulationCard
                key={sim.id}
                simulation={sim}
                onSelectConcept={(s) => setSelectedConcept(s)}
              />
            ))}
          </div>

          {/* Empty State */}
          {filteredSimulations.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl space-y-3 bg-white dark:bg-zinc-900">
              <Search className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                No simulations found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No simulation matched your current query &ldquo;{searchQuery}&rdquo;. Try clearing filters or searching for kinematics, K-map, RV32I, or automata.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDifficultyFilter('all');
                  setActiveLab('all');
                }}
                className="text-xs font-semibold"
              >
                Reset All Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Honest Scientific Concept Modal for Planned Labs */}
      <ExperimentConceptModal
        simulation={selectedConcept}
        isOpen={!!selectedConcept}
        onClose={() => setSelectedConcept(null)}
      />
    </div>
  );
}
