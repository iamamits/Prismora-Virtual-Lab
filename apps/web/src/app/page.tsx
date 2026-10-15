'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PrismoraLogo, PrismoraIcon } from '@prismora/ui';
import { InteractiveHeroSimulation } from '@/components/landing/interactive-hero-simulation';
import { SIMULATION_REGISTRY, LABORATORIES } from '@/lib/simulations/registry';

const SUBJECT_IDENTITIES = [
  {
    id: 'physics',
    name: 'Physics',
    tagline: 'Kinematics, Dynamics & Celestial Gravity',
    color: '#2563EB', // Electric Blue
    icon: Atom,
    featuredRoute: '/experiments/projectile-motion',
    availableCount: 1,
  },
  {
    id: 'digital',
    name: 'Digital Electronics',
    tagline: 'Logic Gates, K-Maps, Adders & Flip-Flops',
    color: '#F43F5E', // Coral
    icon: Zap,
    featuredRoute: '/experiments/digital-electronics',
    availableCount: 1,
  },
  {
    id: 'coa',
    name: 'Computer Architecture',
    tagline: 'RV32I Datapath, Pipeline Hazards & L1 Cache',
    color: '#06B6D4', // Cyan
    icon: Cpu,
    featuredRoute: '/experiments/coa',
    availableCount: 1,
  },
  {
    id: 'toc',
    name: 'Theory of Computation',
    tagline: 'DFA/NFA, Hopcroft, CYK & Turing Machines',
    color: '#8B5CF6', // Royal Violet
    icon: Binary,
    featuredRoute: '/experiments/toc',
    availableCount: 1,
  },
  {
    id: 'math',
    name: 'Mathematics Studio',
    tagline: 'Calculus, Vector Fields & Coordinate Geometry',
    color: '#8B5CF6',
    icon: LineChart,
    featuredRoute: '/studio',
    availableCount: 0,
  },
  {
    id: 'engineering',
    name: 'Virtual Engineering',
    tagline: 'Sensors, Instrumentation & Circuit Analysis',
    color: '#F43F5E',
    icon: Wrench,
    featuredRoute: '/labs',
    availableCount: 0,
  },
];

const SUBJECTS = ['All', 'Physics', 'Mathematics', 'Chemistry', 'Biology', 'Astronomy', 'Engineering'] as const;
const DIFFICULTIES = ['All', 'Introductory', 'Intermediate', 'Advanced'] as const;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // Filter registry
  const filteredSimulations = SIMULATION_REGISTRY.filter((sim) => {
    const lab = LABORATORIES[sim.laboratoryId];
    const subjectName = lab.shortName === 'Physics' ? 'Physics'
      : lab.shortName === 'Chemistry' ? 'Chemistry'
      : lab.shortName === 'Biology' ? 'Biology'
      : lab.shortName === 'Math Studio' ? 'Mathematics'
      : lab.shortName === 'Astronomy' ? 'Astronomy'
      : 'Engineering';

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      sim.title.toLowerCase().includes(q) ||
      sim.shortTitle.toLowerCase().includes(q) ||
      sim.description.toLowerCase().includes(q) ||
      sim.tags.some((tag) => tag.toLowerCase().includes(q));

    const matchesSubject = selectedSubject === 'All' || subjectName === selectedSubject || (selectedSubject === 'Engineering' && (sim.laboratoryId === 'digital-electronics' || sim.laboratoryId === 'coa' || sim.laboratoryId === 'engineering'));
    const matchesDifficulty = selectedDifficulty === 'All' || sim.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#090D16] text-[#172033] dark:text-[#F8FAFC]">
      {/* Hero Section with Embedded Working Simulation */}
      <section className="relative border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F172A] py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Hero Header Text */}
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-[#172033] dark:text-zinc-200 shadow-sm">
              <PrismoraIcon size={16} minimal />
              <span>Interactive Open-Source Scientific Computing Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#172033] dark:text-white uppercase font-sans">
              Explore. Experiment.{' '}
              <span className="text-[#2563EB] dark:text-[#38BDF8]">Understand.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-sm sm:text-base text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
              Prismora unifies real-time numerical simulation, interactive physics apparatus, digital micro-logic, and formal automata theory in a vibrant, accessible laboratory environment.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Link href="/labs">
                <Button size="lg" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md font-bold px-6">
                  <FlaskConical className="w-4 h-4 mr-2" />
                  Explore All Laboratories
                </Button>
              </Link>
              <a href="#discovery">
                <Button variant="outline" size="lg" className="border-2 border-zinc-300 dark:border-zinc-700 font-semibold">
                  <Search className="w-4 h-4 mr-2 text-[#2563EB]" />
                  Search Catalog
                </Button>
              </a>
            </div>
          </div>

          {/* Real Embedded Interactive Hero Simulation */}
          <div className="max-w-4xl mx-auto">
            <div className="mb-2 flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Live Interactive Simulation Preview</span>
              </span>
              <span className="text-zinc-500">
                Directly adjust parameters below to simulate physical motion in real-time
              </span>
            </div>
            <InteractiveHeroSimulation />
          </div>
        </div>
      </section>

      {/* Vibrant Subject Exploration Hub */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-4">
          <div>
            <h2 className="text-xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2563EB]" />
              <span>Scientific &amp; Engineering Disciplines</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Select a specialized domain to investigate verified equations, datapaths, and virtual experiments.
            </p>
          </div>
          <Link href="/labs" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
            <span>View Full Curriculum</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 6 Core Discipline Cards with Distinct Solid-Color Accents */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SUBJECT_IDENTITIES.map((sub) => {
            const Icon = sub.icon;
            return (
              <Link key={sub.id} href={sub.featuredRoute} className="group">
                <div
                  className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F172A] hover:shadow-lg transition-all relative overflow-hidden h-full flex flex-col justify-between"
                  style={{ borderLeftWidth: '4px', borderLeftColor: sub.color }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-white shadow-sm"
                        style={{ backgroundColor: sub.color }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      {sub.availableCount > 0 ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1 font-mono">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>Lab Available</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                          In Development
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-white group-hover:text-[#2563EB] transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {sub.tagline}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs font-bold text-zinc-600 dark:text-zinc-300 mt-4">
                    <span>Enter Laboratory</span>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Discovery & Simulation Catalog Section */}
      <section id="discovery" className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#172033] dark:text-white flex items-center gap-2">
              <PrismoraIcon size={22} minimal />
              <span>Scientific Simulation Catalog</span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Explore scientifically validated models across key natural and formal disciplines.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search experiments or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-md border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#172033] text-[#172033] dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Subject Pills with Distinct Discipline Colors */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-500 mr-1">Discipline:</span>
            {SUBJECTS.map((sub) => {
              const isSelected = selectedSubject === sub;
              let activeColor = '#172033';
              if (sub === 'Physics') activeColor = '#2563EB';
              if (sub === 'Chemistry') activeColor = '#FBBF24';
              if (sub === 'Biology') activeColor = '#22C55E';
              if (sub === 'Mathematics') activeColor = '#8B5CF6';
              if (sub === 'Astronomy') activeColor = '#06B6D4';
              if (sub === 'Engineering') activeColor = '#F43F5E';

              return (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors font-bold ${
                    isSelected
                      ? 'text-white'
                      : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  style={{
                    backgroundColor: isSelected ? activeColor : undefined,
                    borderColor: isSelected ? activeColor : undefined,
                    color: isSelected && sub === 'Chemistry' ? '#172033' : undefined,
                  }}
                >
                  {sub}
                </button>
              );
            })}
          </div>

          {/* Difficulty Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-zinc-500 mr-1">Level:</span>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`text-xs px-2 py-0.5 rounded font-semibold transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-[#172033] text-white dark:bg-zinc-200 dark:text-[#172033]'
                    : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          {filteredSimulations.map((sim) => {
            const lab = LABORATORIES[sim.laboratoryId];
            const isAvailable = sim.status === 'available';

            return (
              <Card
                key={sim.id}
                className="flex flex-col justify-between hover:shadow-md transition-all border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#172033] relative overflow-hidden"
              >
                {/* Top solid color discipline strip */}
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: sim.disciplineColor }}
                />

                <CardHeader className="p-4 pb-2">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className="text-[10px] font-mono font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: `${sim.disciplineColor}15`,
                        color: sim.disciplineColor,
                        border: `1px solid ${sim.disciplineColor}40`,
                      }}
                    >
                      {lab.shortName}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isAvailable
                          ? 'bg-[#22C55E]/15 text-[#16A34A] dark:text-[#4ADE80] border border-[#22C55E]/30'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {isAvailable ? 'Available Now' : sim.status === 'in_development' ? 'In Development' : 'Planned'}
                    </span>
                  </div>
                  <CardTitle className="text-base font-bold text-[#172033] dark:text-white">
                    {sim.title}
                  </CardTitle>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 pt-1">
                    {sim.description}
                  </p>
                </CardHeader>

                <CardContent className="p-4 pt-2 space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {sim.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                      Level: {sim.difficulty}
                    </span>
                    <Link href={sim.route}>
                      <Button
                        size="sm"
                        variant={isAvailable ? 'default' : 'outline'}
                        className="text-xs h-7 px-3 font-semibold"
                      >
                        {isAvailable ? 'Launch Lab' : 'Preview'}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty state if search yields no results */}
        {filteredSimulations.length === 0 && (
          <div className="p-12 text-center border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg space-y-2">
            <Search className="w-8 h-8 text-zinc-400 mx-auto" />
            <div className="text-sm font-bold text-zinc-700 dark:text-zinc-300">
              No simulations match your search query
            </div>
            <p className="text-xs text-zinc-500">
              Try adjusting your keywords or clearing the subject and difficulty filters.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('All');
                setSelectedDifficulty('All');
              }}
              className="mt-2 text-xs font-semibold"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* Module Architecture Section (Solid Discipline Color Blocks) */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-zinc-100 dark:bg-[#0F172A] border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-black tracking-tight text-[#172033] dark:text-white">
              The Prismora Scientific Architecture
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Four specialized scientific environments sharing an independent numerical simulation runtime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-[#172033] border-2 border-[#2563EB]/30 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded bg-[#2563EB] text-white flex items-center justify-center font-bold">
                <Atom className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora Explore</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Interactive physics, chemistry, biology, and astronomy simulations with verified mathematical models.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-[#172033] border-2 border-[#8B5CF6]/30 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded bg-[#8B5CF6] text-white flex items-center justify-center font-bold">
                <LineChart className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora Studio</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                2D &amp; 3D graphing, geometry, vector fields, and linked mathematical representations.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-[#172033] border-2 border-[#22C55E]/30 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded bg-[#22C55E] text-white flex items-center justify-center font-bold">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora Labs</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Virtual apparatus, configurable experiments, observation logging, and reproducible reports.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-[#172033] border-2 border-[#F43F5E]/30 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded bg-[#F43F5E] text-white flex items-center justify-center font-bold">
                <Library className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora Library</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Searchable, versioned, discoverable repository of experiments and educational activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Prismora branding */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0B1120] py-8 px-4 sm:px-6 text-center text-xs text-zinc-500 space-y-2">
        <div className="flex justify-center items-center gap-2 mb-1">
          <PrismoraLogo variant="full" size="sm" />
        </div>
        <p className="font-semibold text-zinc-700 dark:text-zinc-300">
          Scientific Simulation &amp; Experimentation Platform
        </p>
        <p>Explore. Experiment. Understand. &bull; Open Source under MIT License</p>
      </footer>
    </div>
  );
}
