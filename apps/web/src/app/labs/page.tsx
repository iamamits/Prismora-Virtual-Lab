'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  FlaskConical,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@prismora/ui';
import {
  LABORATORIES,
  SIMULATION_REGISTRY,
  type LaboratoryId,
  type SimulationRegistryEntry,
  querySimulations,
} from '@/lib/simulations/registry';
import { SimulationCard } from '@/components/catalog/simulation-card';
import { ExperimentConceptModal } from '@/components/catalog/experiment-concept-modal';

export default function LabsCatalogPage() {
  const [activeLab, setActiveLab] = useState<LaboratoryId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [selectedConcept, setSelectedConcept] = useState<SimulationRegistryEntry | null>(null);

  const filteredSimulations = querySimulations({
    search: searchQuery,
    laboratoryId: activeLab,
    difficulty: difficultyFilter,
  });

  const availableCount = SIMULATION_REGISTRY.filter((s) => s.status === 'available').length;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-[#172033] min-h-screen">
      {/* Top Header & Breadcrumbs */}
      <section className="border-b border-zinc-200 bg-white px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <nav className="flex items-center gap-2 text-xs text-zinc-500" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-zinc-900 transition-colors">
              Prismora
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-900">Laboratories</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-2.5">
                <FlaskConical className="w-7 h-7 text-[#2563EB]" />
                <span>Prismora Laboratories</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-2xl leading-relaxed">
                Structured discipline testbenches with analytical physics, 3D/SVG visualizers, KaTeX governing equations, and real instrumentation.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{availableCount} Available Now</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 text-blue-800 text-xs font-mono font-semibold flex items-center gap-1 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>11 Disciplines</span>
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
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider font-mono">
              Filter by Scientific Discipline
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveLab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                activeLab === 'all'
                  ? 'bg-zinc-900 text-white border-transparent shadow-xs'
                  : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-400'
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
                      ? 'text-white border-transparent shadow-xs'
                      : 'bg-white border-zinc-200 text-zinc-700 hover:border-zinc-400'
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
                  <span className="opacity-80 text-[10px] font-mono">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Laboratory Focus Banner (When a specific lab is selected) */}
        <AnimatePresence mode="wait">
          {activeLab !== 'all' && (
            <motion.div
              key={activeLab}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="p-5 rounded-2xl border bg-white space-y-3 shadow-xs"
              style={{ borderColor: LABORATORIES[activeLab].disciplineColor, borderLeftWidth: '6px' }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[11px] font-bold text-white uppercase tracking-wider font-mono shadow-2xs"
                    style={{ backgroundColor: LABORATORIES[activeLab].disciplineColor }}
                  >
                    {LABORATORIES[activeLab].shortName}
                  </span>
                  <h2 className="text-lg font-black text-zinc-900">
                    {LABORATORIES[activeLab].name}
                  </h2>
                </div>
                <button
                  onClick={() => setActiveLab('all')}
                  className="text-xs text-zinc-500 hover:text-zinc-900 font-semibold"
                >
                  Show all labs
                </button>
              </div>

              <p className="text-xs text-zinc-600 leading-relaxed">
                {LABORATORIES[activeLab].description}
              </p>

              {/* Structured Syllabus Categories */}
              <div className="pt-2 border-t border-zinc-100">
                <div className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider mb-2 font-mono">
                  Curriculum Modules:
                </div>
                <div className="flex flex-wrap gap-2">
                  {LABORATORIES[activeLab].categories.map((cat) => (
                    <span
                      key={cat}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-zinc-100 text-zinc-700 border border-zinc-200"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search, Filter, and Controls Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 bg-white shadow-xs">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search experiments by title, tags, or concepts (e.g. truss, kinematics, distillation, enzyme)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-zinc-200 bg-zinc-50/70 text-zinc-900 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Difficulty Filter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              aria-label="Filter by academic difficulty"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-700 focus:outline-hidden"
            >
              <option value="all">All Difficulties</option>
              <option value="introductory">Introductory</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>

            {(searchQuery || difficultyFilter !== 'all' || activeLab !== 'all') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('all');
                  setActiveLab('all');
                }}
                className="p-1.5 text-xs text-zinc-500 hover:text-rose-500 rounded-lg hover:bg-zinc-100 transition-colors"
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
          <div className="flex items-center justify-between text-xs text-zinc-500 px-1">
            <span>
              Showing <strong>{filteredSimulations.length}</strong> of {SIMULATION_REGISTRY.length} simulations
            </span>
          </div>

          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredSimulations.map((sim) => (
              <motion.div
                key={sim.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <SimulationCard
                  simulation={sim}
                  onSelectConcept={(s) => setSelectedConcept(s)}
                />
              </motion.div>
            ))}
          </motion.div>

          {/* Empty State */}
          {filteredSimulations.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-zinc-300 rounded-2xl space-y-3 bg-white">
              <Search className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="text-sm font-bold text-zinc-900">
                No simulations found
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                No simulation matched your current query &ldquo;{searchQuery}&rdquo;. Try clearing filters or searching for kinematics, truss, distillation, or enzyme.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
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

      {/* Concept Modal */}
      <ExperimentConceptModal
        simulation={selectedConcept}
        isOpen={!!selectedConcept}
        onClose={() => setSelectedConcept(null)}
      />
    </div>
  );
}
