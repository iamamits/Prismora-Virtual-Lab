'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@prismora/ui';

interface SimulationItem {
  id: string;
  title: string;
  description: string;
  subject: 'Physics' | 'Mathematics' | 'Chemistry' | 'Biology' | 'Astronomy';
  difficulty: 'Introductory' | 'Intermediate' | 'Advanced';
  status: 'Available Now' | 'In Development' | 'Planned';
  href: string;
  tags: string[];
  featured?: boolean;
}

const SIMULATIONS: SimulationItem[] = [
  {
    id: 'projectile-motion',
    title: 'Ideal Projectile Motion',
    description:
      'Scientifically validated kinematic trajectory model with live vector components, variable gravitational fields, initial heights, and analytical equations.',
    subject: 'Physics',
    difficulty: 'Introductory',
    status: 'Available Now',
    href: '/experiments/projectile-motion',
    tags: ['Kinematics', 'Gravity', 'Trajectories', 'Vectors'],
    featured: true,
  },
  {
    id: 'harmonic-oscillator',
    title: 'Simple Harmonic Oscillator',
    description:
      'Mass-spring and pendulum dynamics with damping, driving frequency, phase space portraits, and resonance analysis.',
    subject: 'Physics',
    difficulty: 'Intermediate',
    status: 'In Development',
    href: '/experiments/projectile-motion',
    tags: ['Oscillations', 'Springs', 'Energy Conservation'],
  },
  {
    id: 'vector-field-studio',
    title: '2D/3D Vector Field Studio',
    description:
      'Visualize curl, divergence, gradient fields, and line integrals on interactive manifolds.',
    subject: 'Mathematics',
    difficulty: 'Advanced',
    status: 'In Development',
    href: '/experiments/projectile-motion',
    tags: ['Calculus', 'Vector Fields', 'Differential Geometry'],
  },
  {
    id: 'orbital-mechanics',
    title: 'Two-Body & Keplerian Orbits',
    description:
      'Gravitational attraction, orbital eccentricity, escape velocity, and satellite transfer orbits.',
    subject: 'Astronomy',
    difficulty: 'Intermediate',
    status: 'Planned',
    href: '/experiments/projectile-motion',
    tags: ['Kepler', 'Gravity', 'Orbits'],
  },
  {
    id: 'acid-base-titration',
    title: 'Acid-Base Titration Curves',
    description:
      'Dynamic pH measurement, buffer capacity, indicator transitions, and equivalence point calculations.',
    subject: 'Chemistry',
    difficulty: 'Intermediate',
    status: 'Planned',
    href: '/experiments/projectile-motion',
    tags: ['Equilibrium', 'pH', 'Titration'],
  },
  {
    id: 'population-dynamics',
    title: 'Lotka-Volterra Predator-Prey',
    description:
      'Non-linear ecological equilibrium models with phase planes, carrying capacity, and perturbation response.',
    subject: 'Biology',
    difficulty: 'Introductory',
    status: 'Planned',
    href: '/experiments/projectile-motion',
    tags: ['Ecology', 'Differential Equations'],
  },
];

const SUBJECTS = ['All', 'Physics', 'Mathematics', 'Chemistry', 'Biology', 'Astronomy'] as const;
const DIFFICULTIES = ['All', 'Introductory', 'Intermediate', 'Advanced'] as const;

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const filteredSimulations = SIMULATIONS.filter((sim) => {
    const matchesSearch =
      sim.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sim.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubject = selectedSubject === 'All' || sim.subject === selectedSubject;
    const matchesDifficulty = selectedDifficulty === 'All' || sim.difficulty === selectedDifficulty;

    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="relative border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-indigo-50/50 via-white to-transparent dark:from-indigo-950/20 dark:via-zinc-950 dark:to-transparent py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-200 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/60 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Open-Source Scientific Simulation &amp; Experimentation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
            Explore. Experiment.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500">
              Understand.
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 dark:text-zinc-400">
            Prismora brings interactive scientific computing, mathematical visualization, and rigorous experimentation together in a unified, accessible environment.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/experiments/projectile-motion">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                <Play className="w-4 h-4 mr-2" />
                Launch Flagship Simulation
              </Button>
            </Link>
            <a href="#discovery">
              <Button variant="outline" size="lg">
                <Compass className="w-4 h-4 mr-2 text-zinc-500" />
                Browse Experiment Catalog
              </Button>
            </a>
          </div>

          {/* Value Props Pills */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-4xl mx-auto">
            <div className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40">
              <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Analytical Rigor</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Independent physics core decoupled from UI, canvas, and framework.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40">
              <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-1">
                <Gauge className="w-3.5 h-3.5 text-indigo-500" />
                <span>Deterministic Time</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Fixed-step simulation clock with single-step, pause, seek, and rewind.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40">
              <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-1">
                <Share2 className="w-3.5 h-3.5 text-blue-500" />
                <span>Reproducibility</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Versioned JSON schema export &amp; import for experiments and lab work.
              </p>
            </div>
            <div className="p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/40">
              <div className="font-semibold text-xs text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                <span>Zero Barriers</span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Fully functional public access with zero required account or paywall.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Flagship Experiment Highlight */}
      <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="rounded-xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/50 via-white to-cyan-50/30 dark:from-indigo-950/30 dark:via-zinc-900/60 dark:to-cyan-950/20 p-5 sm:p-7 shadow-sm">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="text-xs font-semibold bg-indigo-600 text-white">
                  FLAGSHIP RELEASE
                </Badge>
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-mono font-medium">
                  Physics • Kinematics
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                Ideal Projectile Motion Experiment
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Interactive trajectory simulation with real-time vector components (velocity &amp; acceleration), coordinate grid, live equations with analytical substitution, synchronized height vs. time plots, celestial gravity presets (Earth, Moon, Mars), and exportable experiment logs.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Initial Speed v₀
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Launch Angle θ
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Gravity g
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                  Platform Height y₀
                </span>
              </div>
            </div>

            <Link href="/experiments/projectile-motion" className="w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold">
                <span>Open Experiment</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Discovery & Simulation Catalog Section */}
      <section id="discovery" className="py-10 px-4 sm:px-6 max-w-6xl mx-auto w-full space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Simulation Library &amp; Explore
            </h2>
            <p className="text-xs text-zinc-500">
              Discover verified scientific models across disciplines.
            </p>
          </div>

          {/* Search box */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-zinc-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search simulations or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Subject Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-zinc-400 mr-1">Subject:</span>
            {SUBJECTS.map((sub) => (
              <button
                key={sub}
                onClick={() => setSelectedSubject(sub)}
                className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                  selectedSubject === sub
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          {/* Difficulty Pills */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-zinc-400 mr-1">Difficulty:</span>
            {DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff)}
                className={`text-xs px-2 py-0.5 rounded transition-colors ${
                  selectedDifficulty === diff
                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900 font-semibold'
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
          {filteredSimulations.map((sim) => (
            <Card
              key={sim.id}
              className="flex flex-col justify-between hover:shadow-md transition-shadow border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
            >
              <CardHeader className="p-4 pb-2">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {sim.subject}
                  </Badge>
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      sim.status === 'Available Now'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {sim.status}
                  </span>
                </div>
                <CardTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">
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
                      className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border border-zinc-100 dark:border-zinc-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">Level: {sim.difficulty}</span>
                  <Link href={sim.href}>
                    <Button
                      size="sm"
                      variant={sim.status === 'Available Now' ? 'default' : 'outline'}
                      className="text-xs h-7 px-3"
                    >
                      {sim.status === 'Available Now' ? 'Launch' : 'Preview'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty state if search yields no results */}
        {filteredSimulations.length === 0 && (
          <div className="p-12 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg space-y-2">
            <Search className="w-8 h-8 text-zinc-400 mx-auto" />
            <div className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No simulations match your search query
            </div>
            <p className="text-xs text-zinc-400">
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
              className="mt-2 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </section>

      {/* Module Overview Section (Explore, Studio, Labs, Library) */}
      <section className="py-12 px-4 sm:px-6 bg-zinc-100/60 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-bold tracking-tight">The Prismora Platform Architecture</h3>
            <p className="text-xs text-zinc-500">
              Modular scientific computing environment spanning simulations, mathematical modeling, and reproducible lab experiments.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                <Atom className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold">Prismora Explore</h4>
              <p className="text-xs text-zinc-500">
                Interactive physics, chemistry, biology, and astronomy simulations with verified mathematical models.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                <LineChart className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold">Prismora Studio</h4>
              <p className="text-xs text-zinc-500">
                2D &amp; 3D graphing, geometry, vector fields, and linked mathematical representations.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold">Prismora Labs</h4>
              <p className="text-xs text-zinc-500">
                Virtual instrumentation, configurable experiments, observation logging, and reproducible reports.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="w-8 h-8 rounded bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                <Library className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold">Prismora Library</h4>
              <p className="text-xs text-zinc-500">
                Searchable, versioned, discoverable repository of experiments and educational activities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 py-6 px-4 sm:px-6 text-center text-xs text-zinc-500 space-y-1">
        <div className="font-semibold text-zinc-700 dark:text-zinc-300">
          PRISMORA — Scientific Simulation &amp; Experimentation Platform
        </div>
        <p>Explore. Experiment. Understand. • Open Source under MIT License</p>
      </footer>
    </div>
  );
}
