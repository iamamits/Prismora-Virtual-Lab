'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { PrismoraLogo } from '@prismora/ui';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Menu,
  X,
  Compass,
  Atom,
  Zap,
  Cpu,
  FlaskConical,
  Binary,
  Layers,
  Library,
  ChevronDown,
  Building2,
  Bot,
  TestTubes,
  Dna,
  Cog,
  Calculator,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface DisciplineItem {
  name: string;
  short: string;
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  description: string;
}

const ACADEMIC_DISCIPLINES: {
  category: string;
  items: DisciplineItem[];
}[] = [
  {
    category: 'Engineering Disciplines',
    items: [
      {
        name: 'Civil & Structural Engineering',
        short: 'Civil Truss Lab',
        href: '/experiments/civil',
        icon: Building2,
        color: '#78716C',
        description: 'Bridge truss statics, method of joints, and beam bending SFD/BMD',
      },
      {
        name: 'Electrical Engineering',
        short: 'Network Theorems',
        href: '/experiments/electrical',
        icon: Zap,
        color: '#2563EB',
        description: "Thévenin, Norton, Transformer OC/SC tests, and RLC AC resonance",
      },
      {
        name: 'Mechanical Engineering',
        short: 'Harmonic Oscillator',
        href: '/experiments/mechanical',
        icon: Cog,
        color: '#F59E0B',
        description: 'Vibrations, venturimeter Bernoulli flow, and UTM tensile stress-strain',
      },
      {
        name: 'Chemical Process Engineering',
        short: 'Distillation Column',
        href: '/experiments/chemical',
        icon: TestTubes,
        color: '#10B981',
        description: 'McCabe-Thiele distillation, VLE curve, and CSTR vs PFR reactor kinetics',
      },
    ],
  },
  {
    category: 'Computing & Logic Systems',
    items: [
      {
        name: 'Electronics & Communication',
        short: 'ECE Workbench',
        href: '/experiments/ece',
        icon: Cpu,
        color: '#06B6D4',
        description: "Ohm's law, diode rectifiers, 4-bit ALUs, and semiconductor devices",
      },
      {
        name: 'Digital Logic Design',
        short: 'Digital Electronics',
        href: '/experiments/digital-electronics',
        icon: Zap,
        color: '#F43F5E',
        description: 'Logic gates, Quine-McCluskey K-map, flip-flops, and sub-ns hazards',
      },
      {
        name: 'Computer Architecture (RV32I)',
        short: 'COA RISC-V',
        href: '/experiments/coa',
        icon: Layers,
        color: '#06B6D4',
        description: 'Single-cycle datapath, 5-stage pipeline, RAW stalls, and L1 cache',
      },
      {
        name: 'Theory of Computation',
        short: 'TOC Automata',
        href: '/experiments/toc',
        icon: Binary,
        color: '#8B5CF6',
        description: '5-tuple DFA/NFA, Hopcroft state minimizer, CYK parser, Turing tape',
      },
    ],
  },
  {
    category: 'Natural Sciences & Interdisciplinary',
    items: [
      {
        name: 'Physical Sciences',
        short: 'Physics & Optics',
        href: '/experiments/physics',
        icon: Atom,
        color: '#2563EB',
        description: 'Photoelectric effect, wave optics, celestial gravity kinematics',
      },
      {
        name: 'Chemical Sciences',
        short: 'Acid-Base Titration',
        href: '/experiments/chemistry/titration',
        icon: FlaskConical,
        color: '#F59E0B',
        description: 'Dynamic pH titration neutralization curves and Henderson-Hasselbalch',
      },
      {
        name: 'Biological Sciences & Reproduction',
        short: 'Biology & Reproduction',
        href: '/experiments/biology',
        icon: Dna,
        color: '#EC4899',
        description: 'Human reproduction, 28-day endocrine cycle, fertilization, and Mendelian genetics',
      },
      {
        name: 'Biotechnology & Bioengineering',
        short: 'Enzyme & Fermentation',
        href: '/experiments/biotech',
        icon: TestTubes,
        color: '#10B981',
        description: 'Michaelis-Menten enzyme kinetics and Monod bacterial fermentation',
      },
      {
        name: 'Robotics & Mechanisms',
        short: 'Robotics & Control',
        href: '/experiments/robotics',
        icon: Bot,
        color: '#06B6D4',
        description: 'Denavit-Hartenberg frames, analytical IK, and PID controller tuning',
      },
      {
        name: 'Mathematics & Analysis',
        short: 'Math Studio',
        href: '/studio',
        icon: Calculator,
        color: '#8B5CF6',
        description: 'Function tangents, 2D matrix warping, and RK4 numerical vector fields',
      },
    ],
  },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [disciplinesOpen, setDisciplinesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDisciplinesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDisciplinesOpen(false);
  }, [pathname]);

  const mainLinks = [
    { label: 'Explore', href: '/explore', icon: Compass },
    { label: 'Curriculum Library', href: '/library', icon: Library },
    { label: 'Labs Catalog', href: '/labs', icon: FlaskConical },
    { label: 'Math Studio', href: '/studio', icon: Calculator },
  ];

  const isDisciplineActive = pathname.startsWith('/experiments');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md select-none shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand / Official Prismora Logo Lockup */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <PrismoraLogo variant="full" size="md" />
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 text-[#2563EB] border border-blue-200">
              v0.1
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {/* Explore Link */}
            <Link
              href="/explore"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/explore' || pathname === '/'
                  ? 'text-[#172033] font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Explore</span>
              {(pathname === '/explore' || pathname === '/') && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#2563EB] rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

            {/* Curriculum Library Link */}
            <Link
              href="/library"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/library'
                  ? 'text-[#172033] font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Library className="w-3.5 h-3.5 text-indigo-600" />
              <span>Curriculum Library</span>
              {pathname === '/library' && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

            {/* Disciplines Mega-Menu Trigger */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDisciplinesOpen(!disciplinesOpen)}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  disciplinesOpen || isDisciplineActive
                    ? 'text-zinc-900 bg-zinc-100'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                aria-expanded={disciplinesOpen}
              >
                <Layers className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Disciplines & Labs</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                    disciplinesOpen ? 'rotate-180 text-zinc-700' : ''
                  }`}
                />
                {isDisciplineActive && !disciplinesOpen && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#2563EB] rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              {/* Mega-Menu Dropdown Panel */}
              <AnimatePresence>
                {disciplinesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.99 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-[780px] bg-white rounded-2xl border border-zinc-200 shadow-2xl p-5 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <Layers className="w-4 h-4 text-indigo-600" />
                          <span>11 Multi-Disciplinary Scientific Laboratories</span>
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Curriculum-mapped virtual experiments with analytical physics, 3D testbenches, and KaTeX mathematical models.
                        </p>
                      </div>
                      <Link
                        href="/library"
                        onClick={() => setDisciplinesOpen(false)}
                        className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span>Full Syllabus</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      {ACADEMIC_DISCIPLINES.map((group) => (
                        <div key={group.category} className="space-y-2">
                          <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 px-2">
                            {group.category}
                          </h5>
                          <div className="space-y-1">
                            {group.items.map((item) => {
                              const Icon = item.icon;
                              const isActive = pathname === item.href;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setDisciplinesOpen(false)}
                                  className={`group/item flex items-start gap-2.5 p-2 rounded-xl transition-all ${
                                    isActive
                                      ? 'bg-blue-50 border border-blue-200'
                                      : 'hover:bg-zinc-50 border border-transparent hover:border-zinc-200'
                                  }`}
                                >
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs group-hover/item:scale-105 transition-transform"
                                    style={{
                                      backgroundColor: `${item.color}18`,
                                      color: item.color,
                                    }}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-zinc-800 group-hover/item:text-[#2563EB] transition-colors truncate">
                                      {item.short}
                                    </div>
                                    <div className="text-[10px] text-zinc-500 line-clamp-1 leading-tight mt-0.5">
                                      {item.description}
                                    </div>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom Quick Launch Strip */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs bg-slate-50 -mx-5 -mb-5 px-5 py-3">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span>All 16 Flagship Virtual Laboratories are 100% functional and interactive.</span>
                      </div>
                      <Link
                        href="/labs"
                        onClick={() => setDisciplinesOpen(false)}
                        className="font-semibold text-zinc-700 hover:text-zinc-900 flex items-center gap-1"
                      >
                        <span>Browse Lab Catalog</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Labs Catalog Link */}
            <Link
              href="/labs"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/labs'
                  ? 'text-[#172033] font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
              <span>Labs Catalog</span>
              {pathname === '/labs' && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-emerald-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

            {/* Math Studio Link */}
            <Link
              href="/studio"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/studio'
                  ? 'text-[#172033] font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-violet-600" />
              <span>Math Studio</span>
              {pathname === '/studio' && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-violet-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Direct Launch Shortcut */}
          <Link
            href="/experiments/projectile-motion"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-xs transition-all hover:shadow-sm"
          >
            <Atom className="w-3.5 h-3.5" />
            <span>Launch Physics</span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu dropdown */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-b border-zinc-200 bg-white px-4 py-4 space-y-4 shadow-xl overflow-hidden max-h-[85vh] overflow-y-auto"
          >
            {/* Top Primary Links */}
            <div className="space-y-1">
              {mainLinks.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-[#172033] text-white shadow-xs'
                        : 'text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Disciplines Section in Mobile Menu */}
            <div className="pt-2 border-t border-zinc-100 space-y-3">
              <span className="text-xs font-bold font-mono text-zinc-600 uppercase tracking-wider block px-1">
                Academic Disciplines & Workbenches
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {ACADEMIC_DISCIPLINES.flatMap((g) => g.items).map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        isActive
                          ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold'
                          : 'bg-zinc-50/50 border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${item.color}20`, color: item.color }}
                      >
                        <Icon className="w-3 h-3" />
                      </div>
                      <span className="truncate">{item.short}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
