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
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, Badge, Button, PrismoraLogo, PrismoraIcon } from '@prismora/ui';

interface SimulationItem {
  id: string;
  title: string;
  description: string;
  subject: 'Physics' | 'Mathematics' | 'Chemistry' | 'Biology' | 'Astronomy' | 'Engineering';
  difficulty: 'Introductory' | 'Intermediate' | 'Advanced';
  status: 'Available Now' | 'In Development' | 'Planned';
  href: string;
  tags: string[];
  disciplineColor: string;
  featured?: boolean;
}

const SIMULATIONS: SimulationItem[] = [
  {
    id: 'projectile-motion',
    title: 'Ideal Projectile Motion',
    description:
      'Scientifically validated kinematic trajectory model with articulated launcher, live vector components, variable celestial gravity, target hit detection, and kinematics probe.',
    subject: 'Physics',
    difficulty: 'Introductory',
    status: 'Available Now',
    href: '/experiments/projectile-motion',
    tags: ['Kinematics', 'Gravity', 'Trajectories', 'Vectors'],
    disciplineColor: '#2563EB', // Electric Blue
    featured: true,
  },
  {
    id: 'harmonic-oscillator',
    title: 'Simple Harmonic Oscillator',
    description:
      'Mass-spring and pendulum dynamics with viscous damping, driving frequency, phase space portraits, and resonance analysis.',
    subject: 'Physics',
    difficulty: 'Intermediate',
    status: 'In Development',
    href: '/experiments/projectile-motion',
    tags: ['Oscillations', 'Springs', 'Energy Conservation'],
    disciplineColor: '#2563EB',
  },
  {
    id: 'vector-field-studio',
    title: '2D/3D Vector Field Studio',
    description:
      'Visualize curl, divergence, field flux lines, and line integrals on interactive 2D coordinate manifolds.',
    subject: 'Mathematics',
    difficulty: 'Advanced',
    status: 'In Development',
    href: '/experiments/projectile-motion',
    tags: ['Calculus', 'Vector Fields', 'Differential Geometry'],
    disciplineColor: '#8B5CF6', // Violet
  },
  {
    id: 'orbital-mechanics',
    title: 'Two-Body & Keplerian Orbits',
    description:
      'Gravitational attraction, orbital eccentricity, escape velocity, and satellite transfer ellipses.',
    subject: 'Astronomy',
    difficulty: 'Intermediate',
    status: 'Planned',
    href: '/experiments/projectile-motion',
    tags: ['Kepler', 'Gravity', 'Orbits'],
    disciplineColor: '#06B6D4', // Cyan
  },
  {
    id: 'acid-base-titration',
    title: 'Acid-Base Titration Curves',
    description:
      'Dynamic pH measurement, buffer capacity, indicator color transitions, and equivalence point stoichiometric calculations.',
    subject: 'Chemistry',
    difficulty: 'Intermediate',
    status: 'Planned',
    href: '/experiments/projectile-motion',
    tags: ['Equilibrium', 'pH', 'Titration'],
    disciplineColor: '#FBBF24', // Amber
  },
  {
    id: 'population-dynamics',
    title: 'Lotka-Volterra Predator-Prey',
    description:
      'Non-linear ecological equilibrium dynamics with phase planes, carrying capacity limits, and perturbation stability.',
    subject: 'Biology',
    difficulty: 'Introductory',
    status: 'Planned',
    href: '/experiments/projectile-motion',
    tags: ['Ecology', 'Differential Equations'],
    disciplineColor: '#22C55E', // Green
  },
  {
    id: 'digital-electronics',
    title: 'Digital Electronics & Logic Design',
    description:
      'Interactive logic gates, truth tables, Quine-McCluskey K-map minimization, full adders, multiplexers, flip-flops, counters, ALU, and static hazard glitch simulation.',
    subject: 'Engineering',
    difficulty: 'Intermediate',
    status: 'Available Now',
    href: '/experiments/digital-electronics',
    tags: ['Logic Gates', 'K-Map', 'ALU', 'Flip-Flops', 'Timing Analysis'],
    disciplineColor: '#F43F5E', // Coral
    featured: true,
  },
  {
    id: 'coa-riscv',
    title: 'Computer Organization & Architecture',
    description:
      'RISC-V 32-bit (RV32I) microarchitecture lab with single-cycle datapath, 5-stage pipeline, forwarding unit, RAW load-use hazard detection, and associative cache mapping.',
    subject: 'Engineering',
    difficulty: 'Advanced',
    status: 'Available Now',
    href: '/experiments/coa',
    tags: ['RISC-V', 'CPU Datapath', 'Pipelining', 'Hazards', 'Cache Memory'],
    disciplineColor: '#06B6D4', // Cyan
    featured: true,
  },
  {
    id: 'toc-automata',
    title: 'Theory of Computation & Automata',
    description:
      'Formal language systems featuring interactive DFA/NFA state graph execution, subset construction, Hopcroft minimization, regex Thompson NFA, CYK parsing, and Turing machine.',
    subject: 'Mathematics',
    difficulty: 'Advanced',
    status: 'Available Now',
    href: '/experiments/toc',
    tags: ['DFA/NFA', 'Regex', 'CYK Parser', 'Turing Machine', 'Formal Languages'],
    disciplineColor: '#8B5CF6', // Violet
    featured: true,
  },
  {
    id: 'truss-structural-analysis',
    title: 'Planar Truss Structural Stress',
    description:
      'Method of joints and sections for bridge trusses, tension-compression distribution, and failure analysis.',
    subject: 'Engineering',
    difficulty: 'Intermediate',
    status: 'Planned',
    href: '/experiments/projectile-motion',
    tags: ['Statics', 'Stress', 'Structures'],
    disciplineColor: '#F43F5E', // Coral
  },
];

const SUBJECTS = ['All', 'Physics', 'Mathematics', 'Chemistry', 'Biology', 'Astronomy', 'Engineering'] as const;
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
    <div className="flex-1 flex flex-col bg-[#F8FAFC] dark:bg-[#0B1120] text-[#172033] dark:text-[#F8FAFC]">
      {/* Hero Section (Solid Colors, Zero Gradients) */}
      <section className="relative border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F172A] py-14 sm:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          {/* Brand Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-xs font-bold text-[#172033] dark:text-zinc-200">
            <PrismoraIcon size={18} minimal />
            <span>Open-Source Scientific Simulation &amp; Experimentation</span>
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#172033] dark:text-white uppercase font-sans">
            Explore. Experiment.{' '}
            <span className="text-[#2563EB] dark:text-[#38BDF8]">Understand.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-600 dark:text-zinc-300 font-medium leading-relaxed">
            Prismora unifies interactive scientific computing, mathematical visualization, and hands-on virtual experimentation in a vibrant, accessible platform.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link href="/experiments/projectile-motion">
              <Button size="lg" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-md font-bold px-6">
                <Play className="w-4 h-4 mr-2 fill-current" />
                Launch Flagship Lab
              </Button>
            </Link>
            <a href="#discovery">
              <Button variant="outline" size="lg" className="border-2 border-zinc-300 dark:border-zinc-700 font-semibold">
                <Compass className="w-4 h-4 mr-2 text-[#2563EB]" />
                Browse Catalog
              </Button>
            </a>
          </div>

          {/* Value Props Strip in Distinct Solid Scientific Accents */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left max-w-4xl mx-auto">
            <div className="p-3.5 rounded-lg border-2 border-[#2563EB]/20 bg-white dark:bg-[#172033] shadow-sm">
              <div className="font-bold text-xs text-[#2563EB] flex items-center gap-1.5 mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Analytical Rigor</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Independent physics core decoupled from UI, DOM, and Canvas.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border-2 border-[#8B5CF6]/20 bg-white dark:bg-[#172033] shadow-sm">
              <div className="font-bold text-xs text-[#8B5CF6] flex items-center gap-1.5 mb-1">
                <Gauge className="w-3.5 h-3.5" />
                <span>Deterministic Time</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Fixed-step simulation clock with single-step, pause, seek, and slow-mo.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border-2 border-[#06B6D4]/20 bg-white dark:bg-[#172033] shadow-sm">
              <div className="font-bold text-xs text-[#0891B2] dark:text-[#06B6D4] flex items-center gap-1.5 mb-1">
                <Share2 className="w-3.5 h-3.5" />
                <span>Reproducibility</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Portable JSON schema configuration for labs, notes, and sharing.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border-2 border-[#22C55E]/20 bg-white dark:bg-[#172033] shadow-sm">
              <div className="font-bold text-xs text-[#16A34A] dark:text-[#22C55E] flex items-center gap-1.5 mb-1">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Open Access</span>
              </div>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Full scientific access for anyone without accounts or paywalls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Flagship Experiment Highlight Card (Solid Color Accents) */}
      <section className="py-8 px-4 sm:px-6 max-w-6xl mx-auto w-full">
        <div className="rounded-xl border-2 border-[#2563EB] bg-white dark:bg-[#172033] p-5 sm:p-7 shadow-md relative overflow-hidden">
          {/* Solid Color Top Accent Line */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#2563EB]" />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2.5 max-w-2xl">
              <div className="flex items-center gap-2">
                <Badge variant="physics" className="text-xs font-bold uppercase tracking-wider">
                  FLAGSHIP SIMULATION
                </Badge>
                <span className="text-xs font-mono font-bold text-[#2563EB] dark:text-[#38BDF8]">
                  Physics • Kinematics
                </span>
              </div>
              <h2 className="text-2xl font-black tracking-tight text-[#172033] dark:text-white">
                Ideal Projectile Motion Virtual Laboratory
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-300">
                Hands-on kinematics environment with an articulated launcher, direct barrel rotation, adjustable elevation lift, draggable target with hit detection, kinematics sampling probe, celestial gravity presets (Earth, Moon, Mars, Zero-G), and live analytical equation substitution.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-semibold">
                  Initial Speed v₀
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-semibold">
                  Launch Angle θ
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-semibold">
                  Celestial Gravity g
                </span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-semibold">
                  Elevation y₀
                </span>
              </div>
            </div>

            <Link href="/experiments/projectile-motion" className="w-full md:w-auto">
              <Button size="lg" className="w-full md:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold">
                <span>Enter Laboratory</span>
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
          {filteredSimulations.map((sim) => (
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
                    {sim.subject}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sim.status === 'Available Now'
                        ? 'bg-[#22C55E]/15 text-[#16A34A] dark:text-[#4ADE80] border border-[#22C55E]/30'
                        : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    }`}
                  >
                    {sim.status}
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
                  <Link href={sim.href}>
                    <Button
                      size="sm"
                      variant={sim.status === 'Available Now' ? 'default' : 'outline'}
                      className="text-xs h-7 px-3 font-semibold"
                    >
                      {sim.status === 'Available Now' ? 'Launch Lab' : 'Preview'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
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
      <section className="py-12 px-4 sm:px-6 bg-zinc-100 dark:bg-[#0F172A] border-t border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <h3 className="text-xl font-black tracking-tight text-[#172033] dark:text-white">
              The Prismora Scientific Architecture
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Four specialized scientific environments sharing an independent numerical simulation runtime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Explore */}
            <div className="p-4 rounded-lg bg-white dark:bg-[#172033] border-2 border-[#2563EB]/30 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded bg-[#2563EB] text-white flex items-center justify-center font-bold">
                <Atom className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora Explore</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Interactive physics, chemistry, biology, and astronomy simulations with verified mathematical models.
              </p>
            </div>

            {/* Studio */}
            <div className="p-4 rounded-lg bg-white dark:bg-[#172033] border-2 border-[#8B5CF6]/30 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded bg-[#8B5CF6] text-white flex items-center justify-center font-bold">
                <LineChart className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora Studio</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                2D &amp; 3D graphing, geometry, vector fields, and linked mathematical representations.
              </p>
            </div>

            {/* Labs */}
            <div className="p-4 rounded-lg bg-white dark:bg-[#172033] border-2 border-[#22C55E]/30 space-y-2 shadow-sm">
              <div className="w-8 h-8 rounded bg-[#22C55E] text-white flex items-center justify-center font-bold">
                <FlaskConical className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-[#172033] dark:text-white">Prismora Labs</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Virtual apparatus, configurable experiments, observation logging, and reproducible reports.
              </p>
            </div>

            {/* Library */}
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
        <p>Explore. Experiment. Understand. • Open Source under MIT License</p>
      </footer>
    </div>
  );
}
