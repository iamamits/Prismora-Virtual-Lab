/**
 * Prismora Library — Curriculum-Mapped Multi-Domain Experiment Library
 *
 * A national syllabus and virtual laboratory catalog benchmarked against
 * AICTE model curricula and the Indian Virtual Labs portal (vlab.co.in).
 *
 * Features:
 * - 11 Academic Disciplines: ECE, CSE, EE, ME, ChE, BT/BME, CE, Physics, Chemistry, Math, Interdisciplinary
 * - Degree filtering: B.Tech, B.Sc, M.Tech
 * - Semester filtering: Semester 1 through Semester 8
 * - Real-time keyword search across titles, course codes, equations, instruments, and tags
 * - Interactive Experiment Detail Modal with KaTeX equations, learning objectives, and instruments
 * - Direct launch buttons for functional virtual laboratories
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  MASTER_EXPERIMENT_INVENTORY,
} from '@/lib/curriculum/master-inventory';
import { ACADEMIC_DOMAINS } from '@/lib/curriculum/domains';
import type { AcademicDomainId, AcademicDegree, AcademicSemester, CurricularExperimentDef } from '@/lib/curriculum/types';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Filter,
  GraduationCap,
  Layers,
  Library,
  Lightbulb,
  Maximize2,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  Wrench,
  X,
} from 'lucide-react';

export default function LibraryPage() {
  const [selectedDomain, setSelectedDomain] = useState<AcademicDomainId | 'all'>('all');
  const [selectedDegree, setSelectedDegree] = useState<AcademicDegree | 'all'>('all');
  const [selectedSemester, setSelectedSemester] = useState<AcademicSemester | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'functional' | 'planned'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingExperiment, setInspectingExperiment] = useState<CurricularExperimentDef | null>(null);

  // Filtered experiments
  const filteredExperiments = useMemo(() => {
    return MASTER_EXPERIMENT_INVENTORY.filter((exp) => {
      // Domain filter
      if (selectedDomain !== 'all' && exp.domain !== selectedDomain) return false;
      // Degree filter
      if (selectedDegree !== 'all' && exp.degree !== selectedDegree) return false;
      // Semester filter
      if (selectedSemester !== 'all' && exp.semester !== selectedSemester) return false;
      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'functional' && exp.status !== 'functional') return false;
        if (statusFilter === 'planned' && exp.status === 'functional') return false;
      }
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
  }, [selectedDomain, selectedDegree, selectedSemester, statusFilter, searchQuery]);

  const functionalCount = MASTER_EXPERIMENT_INVENTORY.filter((e) => e.status === 'functional').length;
  const totalCount = MASTER_EXPERIMENT_INVENTORY.length;

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] text-zinc-900 overflow-x-hidden">
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

            {/* Quick Metrics Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{functionalCount} Interactive Labs Active</span>
              </div>
              <div className="px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-800 text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>11 Academic Disciplines</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Viewport */}
      <section className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Filters & Search Control Bar */}
        <div className="bg-white rounded-xl border border-zinc-200 p-4 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Search by course code (e.g. EE-201, CS-301), topic, equation, or institution..."
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

            {/* Quick Filter Selectors */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Degree Selector */}
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

              {/* Semester Selector */}
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

              {/* Status Selector */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'functional' | 'planned')}
                className="text-xs font-semibold border border-zinc-200 rounded-lg px-2.5 py-2 bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                <option value="functional">Interactive Only</option>
                <option value="planned">Curricular Specs Only</option>
              </select>

              {/* Reset Filters */}
              {(selectedDomain !== 'all' ||
                selectedDegree !== 'all' ||
                selectedSemester !== 'all' ||
                statusFilter !== 'all' ||
                searchQuery) && (
                <button
                  onClick={() => {
                    setSelectedDomain('all');
                    setSelectedDegree('all');
                    setSelectedSemester('all');
                    setStatusFilter('all');
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

          {/* 11 Academic Domain Horizontal Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-zinc-100 pb-1 scrollbar-thin">
            <button
              onClick={() => setSelectedDomain('all')}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                selectedDomain === 'all'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
              }`}
            >
              All Disciplines ({totalCount})
            </button>
            {Object.values(ACADEMIC_DOMAINS).map((dom) => {
              const count = MASTER_EXPERIMENT_INVENTORY.filter((e) => e.domain === dom.id).length;
              const isSelected = selectedDomain === dom.id;
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

        {/* Experiment Grid Results */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs text-zinc-600 px-1">
            <span>
              Showing <strong>{filteredExperiments.length}</strong> curricular experiment modules
            </span>
          </div>

          {filteredExperiments.length === 0 ? (
            <div className="bg-white rounded-xl border border-zinc-200 p-12 text-center space-y-3">
              <BookOpen className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="font-bold text-zinc-900">No experiments match your filter criteria</h3>
              <p className="text-xs text-zinc-600 max-w-sm mx-auto">
                Try resetting your search query or selecting &quot;All Disciplines&quot; to view the complete inventory.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredExperiments.map((exp) => {
                const domainMeta = ACADEMIC_DOMAINS[exp.domain];
                const isFunctional = exp.status === 'functional';

                return (
                  <div
                    key={exp.id}
                    className="bg-white rounded-xl border border-zinc-200 hover:border-zinc-300 transition-all shadow-xs hover:shadow-md flex flex-col overflow-hidden group"
                  >
                    {/* Top Color Accent Strip */}
                    <div
                      className="h-1.5 w-full"
                      style={{ backgroundColor: exp.disciplineColor || domainMeta?.primaryColor || '#6366f1' }}
                    />

                    {/* Card Content */}
                    <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {/* Course & Semester Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200">
                              {exp.courseCode}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                              Sem {exp.semester}
                            </span>
                            <span className="text-[10px] font-bold text-zinc-600">
                              {exp.degree}
                            </span>
                          </div>

                          {isFunctional ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                              Interactive
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                              Curricular Spec
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-sm text-zinc-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-snug">
                          {exp.title}
                        </h3>

                        {/* Description */}
                        <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed">
                          {exp.description}
                        </p>

                        {/* Benchmark Institution & Unit */}
                        <div className="pt-1 text-[11px] text-zinc-600 flex items-center gap-1 font-medium">
                          <GraduationCap className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span className="truncate">{exp.attribution.institution}</span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => setInspectingExperiment(exp)}
                          className="text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:underline"
                        >
                          View Syllabus Spec
                        </button>

                        {isFunctional && exp.route ? (
                          <Link
                            href={exp.route}
                            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors shadow-2xs"
                          >
                            <span>Launch Lab</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        ) : (
                          <button
                            onClick={() => setInspectingExperiment(exp)}
                            className="flex items-center gap-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
                          >
                            <span>Curricular Details</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Inspecting Experiment Detail Modal */}
      {inspectingExperiment && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-zinc-200 shadow-xl overflow-hidden my-8 animate-in fade-in-50 zoom-in-95">
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
                      <div key={i} className="text-center">
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
              {inspectingExperiment.status === 'functional' && inspectingExperiment.route ? (
                <Link
                  href={inspectingExperiment.route}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Launch Virtual Laboratory</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-semibold">
                  Curricular Specification Published
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
