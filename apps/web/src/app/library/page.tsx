/**
 * Prismora Library — Curriculum-Mapped Multi-Domain Experiment Library
 *
 * A national syllabus and virtual laboratory catalog benchmarked against
 * AICTE model curricula and the Indian Virtual Labs portal (vlab.co.in).
 *
 * Segregates 11 Academic Disciplines into dedicated Domain Hubs with smooth
 * framer-motion animations, KaTeX mathematical formulas, and direct workbench launchers.
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MASTER_EXPERIMENT_INVENTORY } from '@/lib/curriculum/master-inventory';
import { ACADEMIC_DOMAINS } from '@/lib/curriculum/domains';
import type { AcademicDomainId, AcademicDegree, AcademicSemester, CurricularExperimentDef } from '@/lib/curriculum/types';
import { MathView } from '@prismora/ui';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Layers,
  Library,
  RotateCcw,
  Search,
  Sparkles,
  X,
  LayoutGrid,
  FolderTree,
  Building2,
  Bot,
  TestTubes,
  Dna,
  Cog,
  Atom,
  Cpu,
  Zap,
  Binary,
  Calculator,
  FlaskConical,
  ArrowRight,
} from 'lucide-react';

const DOMAIN_ICONS: Record<AcademicDomainId, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  ee: Zap,
  ece: Cpu,
  cse: Binary,
  me: Cog,
  che: TestTubes,
  bt_bme: Dna,
  ce: Building2,
  physics: Atom,
  chemistry: FlaskConical,
  math: Calculator,
  interdisciplinary: Bot,
};

export default function LibraryPage() {
  const [viewMode, setViewMode] = useState<'hubs' | 'grid'>('hubs');
  const [selectedDomain, setSelectedDomain] = useState<AcademicDomainId | 'all'>('all');
  const [selectedDegree, setSelectedDegree] = useState<AcademicDegree | 'all'>('all');
  const [selectedSemester, setSelectedSemester] = useState<AcademicSemester | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingExperiment, setInspectingExperiment] = useState<CurricularExperimentDef | null>(null);

  // Filtered experiments for grid view
  const filteredExperiments = useMemo(() => {
    return MASTER_EXPERIMENT_INVENTORY.filter((exp) => {
      // Domain filter
      if (selectedDomain !== 'all' && exp.domain !== selectedDomain) return false;
      // Degree filter
      if (selectedDegree !== 'all' && exp.degree !== selectedDegree) return false;
      // Semester filter
      if (selectedSemester !== 'all' && exp.semester !== selectedSemester) return false;
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(q) || exp.shortTitle.toLowerCase().includes(q);
        const matchesCourse = exp.courseCode.toLowerCase().includes(q) || exp.courseName.toLowerCase().includes(q);
        const matchesTags = exp.tags.some((t) => t.toLowerCase().includes(q));
        const matchesInst = exp.attribution.institution.toLowerCase().includes(q);
        if (!matchesTitle && !matchesCourse && !matchesTags && !matchesInst) return false;
      }
      return true;
    });
  }, [selectedDomain, selectedDegree, selectedSemester, searchQuery]);

  // Grouped experiments by domain for Hubs view
  const experimentsByDomain = useMemo(() => {
    const grouped: Record<AcademicDomainId, CurricularExperimentDef[]> = {
      ee: [],
      ece: [],
      cse: [],
      me: [],
      che: [],
      bt_bme: [],
      ce: [],
      physics: [],
      chemistry: [],
      math: [],
      interdisciplinary: [],
    };

    MASTER_EXPERIMENT_INVENTORY.forEach((exp) => {
      // Filter by search query if present
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(q) || exp.shortTitle.toLowerCase().includes(q);
        const matchesCourse = exp.courseCode.toLowerCase().includes(q) || exp.courseName.toLowerCase().includes(q);
        const matchesTags = exp.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCourse && !matchesTags) return;
      }

      if (selectedDegree !== 'all' && exp.degree !== selectedDegree) return;
      if (selectedSemester !== 'all' && exp.semester !== selectedSemester) return;

      if (grouped[exp.domain]) {
        grouped[exp.domain].push(exp);
      }
    });

    return grouped;
  }, [searchQuery, selectedDegree, selectedSemester]);

  const functionalCount = MASTER_EXPERIMENT_INVENTORY.filter((e) => e.status === 'functional').length;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-zinc-900 overflow-x-hidden min-h-screen">
      {/* Top Banner & Header */}
      <section className="border-b border-zinc-200 bg-white px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-7xl mx-auto space-y-4">
          <nav className="flex items-center gap-2 text-xs text-zinc-600 font-medium">
            <Link href="/" className="hover:text-zinc-900 transition-colors">
              Prismora
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-zinc-900">Curriculum Library</span>
          </nav>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 flex items-center gap-2.5">
                <Library className="w-7 h-7 text-indigo-600" />
                <span>Prismora Curriculum Library</span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-2xl leading-relaxed">
                National university syllabus & AICTE curriculum catalog benchmarked against Indian Virtual Labs (vlab.co.in) and premier IIT/NIT laboratory coursework.
              </p>
            </div>

            {/* Quick Metrics Badges & View Switcher */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{functionalCount} Fully Interactive Labs</span>
              </div>

              {/* View Mode Toggle */}
              <div className="bg-zinc-100 p-1 rounded-xl flex items-center gap-1 border border-zinc-200 shadow-2xs">
                <button
                  onClick={() => setViewMode('hubs')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'hubs'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <FolderTree className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Discipline Hubs</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white text-zinc-900 shadow-xs'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Curriculum Grid</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Viewport */}
      <section className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Search & Filters Bar */}
        <div className="bg-white rounded-2xl border border-zinc-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by course code (e.g. CE-202, EE-201, CS-202), topic, or institution..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-zinc-200 rounded-lg text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Degree & Semester Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedDegree}
                onChange={(e) => setSelectedDegree(e.target.value as AcademicDegree | 'all')}
                className="text-xs font-semibold border border-zinc-200 rounded-lg px-2.5 py-2 bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Degrees</option>
                <option value="B.Tech">B.Tech / B.E.</option>
                <option value="B.Sc">B.Sc / BS</option>
                <option value="M.Tech">M.Tech / MS</option>
              </select>

              <select
                value={selectedSemester}
                onChange={(e) => {
                  const val = e.target.value;
                  setSelectedSemester(val === 'all' ? 'all' : (parseInt(val) as AcademicSemester));
                }}
                className="text-xs font-semibold border border-zinc-200 rounded-lg px-2.5 py-2 bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Semesters</option>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>

              {(selectedDomain !== 'all' || selectedDegree !== 'all' || selectedSemester !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedDomain('all');
                    setSelectedDegree('all');
                    setSelectedSemester('all');
                    setSearchQuery('');
                  }}
                  className="flex items-center gap-1 text-xs text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-2 rounded-lg font-semibold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>

          {/* Quick Domain Selector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-100 pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedDomain === 'all'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              All Disciplines ({MASTER_EXPERIMENT_INVENTORY.length})
            </button>
            {Object.values(ACADEMIC_DOMAINS).map((dom) => {
              const count = MASTER_EXPERIMENT_INVENTORY.filter((e) => e.domain === dom.id).length;
              const isSelected = selectedDomain === dom.id;
              const Icon = DOMAIN_ICONS[dom.id] || Layers;

              return (
                <button
                  key={dom.id}
                  onClick={() => setSelectedDomain(dom.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'text-white shadow-xs'
                      : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                  style={{
                    backgroundColor: isSelected ? dom.primaryColor : undefined,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{dom.shortName}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      isSelected ? 'bg-white/30 text-white' : 'bg-zinc-200 text-zinc-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* View Mode 1: DISCIPLINE HUBS (Dedicated Domain Sections) */}
        {viewMode === 'hubs' ? (
          <div className="space-y-10">
            {Object.values(ACADEMIC_DOMAINS)
              .filter((dom) => selectedDomain === 'all' || dom.id === selectedDomain)
              .map((dom) => {
                const domainExps = experimentsByDomain[dom.id] || [];
                if (domainExps.length === 0 && searchQuery) return null;
                const Icon = DOMAIN_ICONS[dom.id] || Layers;

                return (
                  <motion.div
                    key={dom.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs"
                  >
                    {/* Discipline Hub Banner */}
                    <div
                      className="px-6 py-5 border-b border-zinc-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                      style={{ borderLeft: `6px solid ${dom.primaryColor}` }}
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs"
                          style={{ backgroundColor: `${dom.primaryColor}18`, color: dom.primaryColor }}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-zinc-900 tracking-tight">
                              {dom.name}
                            </h2>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 border border-zinc-200">
                              {dom.shortName}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-600 mt-0.5 max-w-2xl leading-relaxed">
                            {dom.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2 text-[11px] text-zinc-500 font-medium">
                            <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                            <span>Accreditation Benchmarks: {dom.benchmarkInstitutions.join(' • ')}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                        <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          {domainExps.length} Virtual Labs
                        </span>
                      </div>
                    </div>

                    {/* Discipline Experiments Grid */}
                    <div className="p-6">
                      {domainExps.length === 0 ? (
                        <div className="py-8 text-center text-zinc-500 text-xs">
                          No experiment in this discipline matches your active search filters.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                          {domainExps.map((exp) => (
                            <ExperimentHubCard
                              key={exp.id}
                              experiment={exp}
                              onInspect={() => setInspectingExperiment(exp)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
          </div>
        ) : (
          /* View Mode 2: CURRICULUM GRID */
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-zinc-600 px-1">
              <span>
                Showing <strong>{filteredExperiments.length}</strong> curricular experiment modules
              </span>
            </div>

            {filteredExperiments.length === 0 ? (
              <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center space-y-3">
                <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
                <h3 className="font-bold text-zinc-900">No experiments match your filter criteria</h3>
                <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                  Try resetting your search query or selecting &quot;All Disciplines&quot; to view the complete inventory.
                </p>
              </div>
            ) : (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.04 } },
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {filteredExperiments.map((exp) => (
                  <motion.div
                    key={exp.id}
                    variants={{
                      hidden: { opacity: 0, y: 10 },
                      visible: { opacity: 1, y: 0 },
                    }}
                  >
                    <ExperimentHubCard
                      experiment={exp}
                      onInspect={() => setInspectingExperiment(exp)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        )}
      </section>

      {/* Inspecting Experiment Detail Modal */}
      <AnimatePresence>
        {inspectingExperiment && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="p-6 border-b border-zinc-200 flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                      {inspectingExperiment.courseCode}
                    </span>
                    <span className="text-xs font-bold text-zinc-600">
                      {inspectingExperiment.branch} • Semester {inspectingExperiment.semester}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-zinc-900 leading-snug">
                    {inspectingExperiment.title}
                  </h2>
                </div>
                <button
                  onClick={() => setInspectingExperiment(null)}
                  className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg hover:bg-zinc-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs text-zinc-700">
                {/* Description */}
                <div>
                  <h4 className="font-bold text-zinc-900 mb-1">Academic Context & Scope</h4>
                  <p className="text-zinc-600 leading-relaxed">{inspectingExperiment.description}</p>
                </div>

                {/* Governing Equations via MathView */}
                {inspectingExperiment.equations.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-bold text-zinc-900">Governing Scientific Equations</h4>
                    <div className="bg-slate-50 border border-zinc-200 rounded-xl p-3 space-y-2">
                      {inspectingExperiment.equations.map((eq, i) => (
                        <div key={i} className="text-center overflow-x-auto">
                          <MathView math={eq} display />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Learning Objectives */}
                <div>
                  <h4 className="font-bold text-zinc-900 mb-2">Learning Objectives</h4>
                  <ul className="space-y-1.5 list-disc pl-4 text-zinc-600">
                    {inspectingExperiment.learningObjectives.map((obj, i) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* Required Instruments */}
                <div>
                  <h4 className="font-bold text-zinc-900 mb-2">Required Laboratory Equipment</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {inspectingExperiment.requiredInstruments.map((inst, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-800 text-[11px] font-medium border border-zinc-200"
                      >
                        {inst}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Attribution */}
                <div className="pt-3 border-t border-zinc-100 text-[11px] text-zinc-600 space-y-1 font-mono">
                  <div>Benchmark: {inspectingExperiment.attribution.institution}</div>
                  <div>Curriculum: {inspectingExperiment.attribution.accreditationSyllabus}</div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center">
                <button
                  onClick={() => setInspectingExperiment(null)}
                  className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 px-3 py-1.5"
                >
                  Close Spec
                </button>
                {inspectingExperiment.route && (
                  <Link
                    href={inspectingExperiment.route}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <span>Launch Virtual Laboratory</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Clean, high-contrast Experiment Card within a Hub
 */
function ExperimentHubCard({
  experiment,
  onInspect,
}: {
  experiment: CurricularExperimentDef;
  onInspect: () => void;
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all shadow-xs hover:shadow-md flex flex-col justify-between overflow-hidden group">
      {/* Top Accent Strip */}
      <div
        className="h-1.5 w-full"
        style={{ backgroundColor: experiment.disciplineColor || '#2563EB' }}
      />

      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Badges */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                {experiment.courseCode}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                Sem {experiment.semester}
              </span>
            </div>

            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Interactive Lab
            </span>
          </div>

          {/* Title */}
          <h3 className="font-bold text-sm text-zinc-900 group-hover:text-[#2563EB] transition-colors line-clamp-2 leading-snug">
            {experiment.title}
          </h3>

          {/* Description */}
          <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
            {experiment.description}
          </p>

          {/* Mathematical Model Formula Preview */}
          {experiment.equations && experiment.equations.length > 0 && (
            <div className="pt-1 overflow-x-hidden">
              <div className="bg-slate-50 border border-zinc-200/80 rounded-lg px-2.5 py-1.5 flex items-center gap-2">
                <span className="text-[9px] font-mono font-bold uppercase text-zinc-600 shrink-0">Model:</span>
                <MathView
                  math={experiment.equations[0]}
                  size="xs"
                  className="text-zinc-700 truncate"
                />
              </div>
            </div>
          )}

          {/* Benchmark Institution */}
          <div className="pt-1 text-[11px] text-zinc-600 flex items-center gap-1 font-medium">
            <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{experiment.attribution.institution}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
          <button
            onClick={onInspect}
            className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:underline"
          >
            Syllabus Spec
          </button>

          {experiment.route && (
            <Link
              href={experiment.route}
              className="flex items-center gap-1.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs px-3.5 py-1.5 rounded-lg transition-colors shadow-2xs group-hover:translate-x-0.5"
            >
              <span>Launch Lab</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
