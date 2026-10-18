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
  GraduationCap,
  BookOpen,
  Search,
  Activity,
  Heart,
  ChevronRight,
} from 'lucide-react';

interface NavExperimentItem {
  title: string;
  subject: string;
  href: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  color: string;
  badge?: string;
  description: string;
}

// =========================================================================
// 1. CLASS 11 & 12 NCERT / NEET / JEE CURRICULUM
// =========================================================================
const SCHOOL_CURRICULUM = {
  class11: [
    {
      title: 'Projectile Motion & Gravities',
      subject: 'Physics',
      href: '/experiments/projectile-motion',
      icon: Atom,
      color: '#2563EB',
      badge: '60 FPS Flagship',
      description: '2D parabolic trajectories, planetary gravity presets, measuring tape, and apex kinematics',
    },
    {
      title: 'Harmonic Oscillators & SHM',
      subject: 'Physics',
      href: '/experiments/mechanical?exp=harmonic-oscillator',
      icon: Activity,
      color: '#F59E0B',
      description: 'Spring-mass systems, phase portraits, damping factors, and resonant frequency',
    },
    {
      title: 'Venturimeter Bernoulli Flow',
      subject: 'Physics',
      href: '/experiments/mechanical?exp=venturi-flow',
      icon: Cog,
      color: '#0284C7',
      description: 'Manometer pressure differentials, discharge coefficient, and Bernoulli continuity',
    },
    {
      title: 'Acid-Base Dynamic Titration',
      subject: 'Chemistry',
      href: '/experiments/chemistry/titration',
      icon: FlaskConical,
      color: '#F59E0B',
      badge: 'Dynamic pH',
      description: 'Volumetric burette, neutralization curves, Henderson-Hasselbalch, and indicators',
    },
    {
      title: 'Mitosis Cytology under Microscope',
      subject: 'Biology',
      href: '/experiments/biology?exp=cell-mitosis',
      icon: Dna,
      color: '#8B5CF6',
      description: 'Virtual microscopy 100x: Prophase, Metaphase plate, Anaphase, and Cytokinesis',
    },
    {
      title: 'Stomatal Transpiration Pull',
      subject: 'Biology',
      href: '/experiments/biology?exp=plant-transpiration',
      icon: Dna,
      color: '#059669',
      description: 'Guard cell turgor pressure, active K+ ion influx pump, and transpiration rate',
    },
  ] as NavExperimentItem[],

  class12: [
    {
      title: 'Human Reproduction & Embryogenesis',
      subject: 'Biology',
      href: '/experiments/biology?exp=human-reproduction',
      icon: Heart,
      color: '#EC4899',
      badge: 'No Taboo • Flagship',
      description: '28-day endocrine cycle, LH surge, fertilization kinetics, polyspermy block, and family planning',
    },
    {
      title: '3D Human Anatomy Systems',
      subject: 'Biology',
      href: '/experiments/biology?exp=anatomy-3d',
      icon: Activity,
      color: '#06B6D4',
      badge: '3D WebGL',
      description: 'Interactive male/female 3D models with X-ray transparency and clinical landmark probes',
    },
    {
      title: 'Mendelian Genetics & Punnett Matrix',
      subject: 'Biology',
      href: '/experiments/biology?exp=genetics-mendel',
      icon: Dna,
      color: '#10B981',
      description: 'Monohybrid (3:1, 1:2:1) & Dihybrid (9:3:3:1) crosses with Chi-square analysis',
    },
    {
      title: "Young's Double Slit Wave Optics",
      subject: 'Physics',
      href: '/experiments/physics?exp=wave-optics',
      icon: Atom,
      color: '#2563EB',
      description: 'Interference fringe patterns, laser wavelength tuning, slit separation, and diffraction envelope',
    },
    {
      title: 'Photoelectric Effect & Quantum Photons',
      subject: 'Physics',
      href: '/experiments/physics?exp=photoelectric',
      icon: Zap,
      color: '#E11D48',
      description: 'Phototube stopping potential V0, cathode work functions, and Planck constant determination',
    },
    {
      title: 'Computational Calculus & Matrices',
      subject: 'Mathematics',
      href: '/studio',
      icon: Calculator,
      color: '#8B5CF6',
      badge: 'Math Studio',
      description: 'Real-time tangents, Riemann partitions, matrix warping, and Runge-Kutta phase portraits',
    },
  ] as NavExperimentItem[],
};

// =========================================================================
// 2. HIGHER EDUCATION / B.TECH ENGINEERING DISCIPLINES
// =========================================================================
const BTECH_ENGINEERING = [
  {
    category: 'Computing & Electronics',
    disciplines: [
      {
        name: 'Computer Architecture (RV32I)',
        short: 'COA RISC-V',
        href: '/experiments/coa',
        icon: Layers,
        color: '#06B6D4',
        description: 'Single-cycle datapath, 5-stage pipeline, RAW hazard stalls, and L1 cache',
      },
      {
        name: 'Theory of Computation',
        short: 'TOC Automata',
        href: '/experiments/toc',
        icon: Binary,
        color: '#8B5CF6',
        description: '5-tuple DFA/NFA, Hopcroft state minimizer, CYK parser, and Turing tape',
      },
      {
        name: 'Electronics & Communication',
        short: 'ECE Workbench',
        href: '/experiments/ece',
        icon: Cpu,
        color: '#06B6D4',
        description: "Ohm's law, diode bridge rectifiers, 4-bit ALUs, and semiconductor devices",
      },
      {
        name: 'Digital Logic Design',
        short: 'Digital Electronics',
        href: '/experiments/digital-electronics',
        icon: Zap,
        color: '#F43F5E',
        description: 'Quine-McCluskey K-maps, JK/D flip-flops, hazard-free digital logic synthesis',
      },
    ],
  },
  {
    category: 'Core Engineering Branches',
    disciplines: [
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
        short: 'Vibrations & Mechanics',
        href: '/experiments/mechanical',
        icon: Cog,
        color: '#F59E0B',
        description: 'Harmonic vibration resonance, venturi Bernoulli flow, and tensile stress-strain',
      },
      {
        name: 'Civil & Structural',
        short: 'Civil Truss Lab',
        href: '/experiments/civil',
        icon: Building2,
        color: '#78716C',
        description: 'Bridge truss statics, method of joints, and beam bending SFD/BMD',
      },
      {
        name: 'Chemical Engineering',
        short: 'Distillation & Kinetics',
        href: '/experiments/chemical',
        icon: TestTubes,
        color: '#10B981',
        description: 'McCabe-Thiele fractional distillation, VLE equilibrium, and CSTR/PFR reactors',
      },
      {
        name: 'Biotechnology & Bioengg',
        short: 'Enzyme & Fermentation',
        href: '/experiments/biotech',
        icon: Dna,
        color: '#10B981',
        description: 'Michaelis-Menten enzyme kinetics, Lineweaver-Burk, and bacterial growth models',
      },
      {
        name: 'Robotics & Control',
        short: 'Robotics Kinematics',
        href: '/experiments/robotics',
        icon: Bot,
        color: '#06B6D4',
        description: 'Denavit-Hartenberg frames, analytical IK, and PID controller tuning',
      },
    ],
  },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [schoolOpen, setSchoolOpen] = useState(false);
  const [btechOpen, setBtechOpen] = useState(false);

  const schoolRef = useRef<HTMLDivElement>(null);
  const btechRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (schoolRef.current && !schoolRef.current.contains(event.target as Node)) {
        setSchoolOpen(false);
      }
      if (btechRef.current && !btechRef.current.contains(event.target as Node)) {
        setBtechOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setSchoolOpen(false);
    setBtechOpen(false);
  }, [pathname]);

  const isSchoolActive =
    pathname.startsWith('/experiments/biology') ||
    pathname.startsWith('/experiments/projectile-motion') ||
    pathname.startsWith('/experiments/physics') ||
    pathname.startsWith('/experiments/chemistry');

  const isBtechActive =
    pathname.startsWith('/experiments/coa') ||
    pathname.startsWith('/experiments/toc') ||
    pathname.startsWith('/experiments/ece') ||
    pathname.startsWith('/experiments/electrical') ||
    pathname.startsWith('/experiments/mechanical') ||
    pathname.startsWith('/experiments/civil') ||
    pathname.startsWith('/experiments/chemical') ||
    pathname.startsWith('/experiments/biotech') ||
    pathname.startsWith('/experiments/robotics') ||
    pathname.startsWith('/experiments/digital-electronics');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md select-none shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
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
            {/* 1. Explore Home */}
            <Link
              href="/explore"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/explore' || pathname === '/'
                  ? 'text-zinc-900 font-bold'
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

            {/* 2. School Curriculum (Class 11 & 12 Dropdown) */}
            <div className="relative" ref={schoolRef}>
              <button
                onClick={() => {
                  setSchoolOpen(!schoolOpen);
                  setBtechOpen(false);
                }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  schoolOpen || isSchoolActive
                    ? 'text-pink-900 bg-pink-50/80 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                aria-expanded={schoolOpen}
              >
                <GraduationCap className="w-3.5 h-3.5 text-pink-600" />
                <span>Class 11 & 12 (NCERT)</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                    schoolOpen ? 'rotate-180 text-pink-700' : ''
                  }`}
                />
                {isSchoolActive && !schoolOpen && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-pink-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              {/* School Dropdown Mega-Menu */}
              <AnimatePresence>
                {schoolOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.99 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-[760px] bg-white rounded-2xl border border-zinc-200 shadow-2xl p-5 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-pink-600" />
                          <span>Class 11 & 12 Senior Secondary Science Syllabus</span>
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Standard NCERT, NEET & JEE practical experiments with zero taboos and living 60 FPS simulations.
                        </p>
                      </div>
                      <Link
                        href="/library"
                        onClick={() => setSchoolOpen(false)}
                        className="text-xs font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 bg-pink-50 hover:bg-pink-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span>Filter School Labs</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {/* Column 1: Class 11 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-2">
                          <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-700">
                            Class 11 (Senior Secondary I)
                          </h5>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                            NCERT Standard
                          </span>
                        </div>
                        <div className="space-y-1">
                          {SCHOOL_CURRICULUM.class11.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSchoolOpen(false)}
                                className="group/item flex items-start gap-2.5 p-2 rounded-xl transition-all hover:bg-blue-50/60 border border-transparent hover:border-blue-200"
                              >
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs group-hover/item:scale-105 transition-transform"
                                  style={{
                                    backgroundColor: `${item.color}15`,
                                    color: item.color,
                                  }}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-zinc-900 group-hover/item:text-blue-700 transition-colors truncate">
                                      {item.title}
                                    </span>
                                    {item.badge && (
                                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 font-bold shrink-0">
                                        {item.badge}
                                      </span>
                                    )}
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

                      {/* Column 2: Class 12 */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between px-2">
                          <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-pink-700">
                            Class 12 (Senior Secondary II)
                          </h5>
                          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded">
                            NEET / AIIMS Focus
                          </span>
                        </div>
                        <div className="space-y-1">
                          {SCHOOL_CURRICULUM.class12.map((item) => {
                            const Icon = item.icon;
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setSchoolOpen(false)}
                                className="group/item flex items-start gap-2.5 p-2 rounded-xl transition-all hover:bg-pink-50/60 border border-transparent hover:border-pink-200"
                              >
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs group-hover/item:scale-105 transition-transform"
                                  style={{
                                    backgroundColor: `${item.color}15`,
                                    color: item.color,
                                  }}
                                >
                                  <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-zinc-900 group-hover/item:text-pink-700 transition-colors truncate">
                                      {item.title}
                                    </span>
                                    {item.badge && (
                                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-pink-100 text-pink-800 font-bold shrink-0">
                                        {item.badge}
                                      </span>
                                    )}
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
                    </div>

                    {/* Bottom Quick Strip */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs bg-slate-50 -mx-5 -mb-5 px-5 py-3">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                        <span>Interactive 3D Anatomy & 60 FPS reproduction science without taboos.</span>
                      </div>
                      <Link
                        href="/experiments/biology"
                        onClick={() => setSchoolOpen(false)}
                        className="font-semibold text-pink-600 hover:text-pink-700 flex items-center gap-1"
                      >
                        <span>Launch Biology Lab</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 3. Higher Education & B.Tech Disciplines */}
            <div className="relative" ref={btechRef}>
              <button
                onClick={() => {
                  setBtechOpen(!btechOpen);
                  setSchoolOpen(false);
                }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  btechOpen || isBtechActive
                    ? 'text-indigo-900 bg-indigo-50/80 font-bold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
                aria-expanded={btechOpen}
              >
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>B.Tech Engineering</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
                    btechOpen ? 'rotate-180 text-indigo-700' : ''
                  }`}
                />
                {isBtechActive && !btechOpen && (
                  <motion.div
                    layoutId="navbar-active-pill"
                    className="absolute bottom-0 left-2 right-2 h-0.5 bg-indigo-600 rounded-full"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              {/* B.Tech Dropdown Panel */}
              <AnimatePresence>
                {btechOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.99 }}
                    transition={{ duration: 0.18, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-[760px] bg-white rounded-2xl border border-zinc-200 shadow-2xl p-5 z-50 overflow-hidden"
                  >
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-indigo-600" />
                          <span>AICTE Model Engineering Curricula (IIT / NIT Benchmarks)</span>
                        </h4>
                        <p className="text-xs text-zinc-500 mt-0.5">
                          Rigorous engineering laboratories across 11 technical streams with quantitative analytical solvers.
                        </p>
                      </div>
                      <Link
                        href="/library"
                        onClick={() => setBtechOpen(false)}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <span>Full AICTE Syllabus</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      {BTECH_ENGINEERING.map((section) => (
                        <div key={section.category} className="space-y-2">
                          <h5 className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-600 px-2">
                            {section.category}
                          </h5>
                          <div className="space-y-1">
                            {section.disciplines.map((item) => {
                              const Icon = item.icon;
                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setBtechOpen(false)}
                                  className="group/item flex items-start gap-2.5 p-2 rounded-xl transition-all hover:bg-zinc-50 border border-transparent hover:border-zinc-200"
                                >
                                  <div
                                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs group-hover/item:scale-105 transition-transform"
                                    style={{
                                      backgroundColor: `${item.color}15`,
                                      color: item.color,
                                    }}
                                  >
                                    <Icon className="w-3.5 h-3.5" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-zinc-900 group-hover/item:text-[#2563EB] transition-colors truncate">
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

                    {/* Bottom Strip */}
                    <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs bg-slate-50 -mx-5 -mb-5 px-5 py-3">
                      <div className="flex items-center gap-2 text-zinc-600">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        <span>All 28+ engineering experiments include theoretical derivations & KaTeX equations.</span>
                      </div>
                      <Link
                        href="/library"
                        onClick={() => setBtechOpen(false)}
                        className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                      >
                        <span>Open National Catalog</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* 4. Curriculum Library Link */}
            <Link
              href="/library"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/library'
                  ? 'text-zinc-900 font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Library className="w-3.5 h-3.5 text-blue-600" />
              <span>Full Library</span>
              {pathname === '/library' && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-blue-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>

            {/* 5. Math Studio */}
            <Link
              href="/studio"
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                pathname === '/studio'
                  ? 'text-zinc-900 font-bold'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
            >
              <Calculator className="w-3.5 h-3.5 text-purple-600" />
              <span>Math Studio</span>
              {pathname === '/studio' && (
                <motion.div
                  layoutId="navbar-active-pill"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-purple-600 rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          </nav>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Creator & Architect Badge */}
          <a
            href="https://github.com/iamamits"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-pink-200/80 bg-pink-50/80 hover:bg-pink-100/90 text-pink-700 text-xs font-semibold transition-all group shadow-2xs"
            title="Crafted & Architected with ❤️ by Amit Singh"
          >
            <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 group-hover:scale-110 transition-transform" />
            <span className="hidden xl:inline text-[11px] text-pink-600 font-normal">Crafted by</span>
            <span className="font-bold">Amit Singh</span>
          </a>

          {/* Search Pill / Quick Filter */}
          <Link
            href="/library"
            className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-xs font-mono text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <span>Search 50+ labs...</span>
            <kbd className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-400">
              Ctrl+K
            </kbd>
          </Link>

          {/* Direct Launch Flagship Workbench */}
          <Link
            href="/experiments/projectile-motion"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold transition-all shadow-xs hover:shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Launch Flagship</span>
            <span className="sm:hidden">Launch</span>
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-zinc-200 bg-white px-4 py-4 space-y-4 max-h-[85vh] overflow-y-auto"
          >
            {/* Class 11 & 12 Section */}
            <div className="space-y-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-pink-600 px-1">
                Class 11 & 12 (NCERT / NEET)
              </span>
              <div className="grid grid-cols-1 gap-1">
                <Link
                  href="/experiments/biology"
                  className="flex items-center justify-between p-2 rounded-lg bg-pink-50/50 text-xs font-bold text-pink-900"
                >
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-pink-600" />
                    Human Reproduction & 3D Anatomy Lab
                  </span>
                  <ChevronRight className="w-4 h-4 text-pink-400" />
                </Link>
                <Link
                  href="/experiments/projectile-motion"
                  className="flex items-center justify-between p-2 rounded-lg bg-blue-50/50 text-xs font-bold text-blue-900"
                >
                  <span className="flex items-center gap-2">
                    <Atom className="w-4 h-4 text-blue-600" />
                    Class 11 Projectile Motion Workbench
                  </span>
                  <ChevronRight className="w-4 h-4 text-blue-400" />
                </Link>
                <Link
                  href="/experiments/chemistry/titration"
                  className="flex items-center justify-between p-2 rounded-lg bg-amber-50/50 text-xs font-bold text-amber-900"
                >
                  <span className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-amber-600" />
                    Class 11 Chemistry Titration Lab
                  </span>
                  <ChevronRight className="w-4 h-4 text-amber-400" />
                </Link>
                <Link
                  href="/experiments/physics"
                  className="flex items-center justify-between p-2 rounded-lg bg-indigo-50/50 text-xs font-bold text-indigo-900"
                >
                  <span className="flex items-center gap-2">
                    <Atom className="w-4 h-4 text-indigo-600" />
                    Class 12 Wave Optics & Photoelectric
                  </span>
                  <ChevronRight className="w-4 h-4 text-indigo-400" />
                </Link>
              </div>
            </div>

            {/* B.Tech Engineering Section */}
            <div className="space-y-2 pt-2 border-t border-zinc-100">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-indigo-600 px-1">
                B.Tech Higher Education (AICTE)
              </span>
              <div className="grid grid-cols-2 gap-1.5">
                <Link
                  href="/experiments/coa"
                  className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800"
                >
                  COA RISC-V Pipeline
                </Link>
                <Link
                  href="/experiments/toc"
                  className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800"
                >
                  TOC Automata
                </Link>
                <Link
                  href="/experiments/ece"
                  className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800"
                >
                  ECE & Rectifiers
                </Link>
                <Link
                  href="/experiments/electrical"
                  className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800"
                >
                  Electrical Networks
                </Link>
                <Link
                  href="/experiments/mechanical"
                  className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800"
                >
                  Mechanical Vibrations
                </Link>
                <Link
                  href="/experiments/chemical"
                  className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800"
                >
                  Chemical Distillation
                </Link>
                <Link
                  href="/experiments/civil"
                  className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800"
                >
                  Civil Bridge Trusses
                </Link>
                <Link
                  href="/experiments/biotech"
                  className="p-2 rounded-lg bg-zinc-50 hover:bg-zinc-100 text-xs font-semibold text-zinc-800"
                >
                  Biotech Kinetics
                </Link>
              </div>
            </div>

            {/* Core Pages */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
              <Link
                href="/library"
                className="flex-1 text-center py-2 bg-blue-50 text-blue-700 font-bold text-xs rounded-lg"
              >
                Curriculum Library
              </Link>
              <Link
                href="/studio"
                className="flex-1 text-center py-2 bg-purple-50 text-purple-700 font-bold text-xs rounded-lg"
              >
                Math Studio
              </Link>
            </div>

            {/* Mobile Creator Attribution */}
            <div className="pt-2 border-t border-zinc-100 flex items-center justify-center">
              <a
                href="https://github.com/iamamits"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-pink-200 bg-pink-50 text-pink-700 text-xs font-medium"
              >
                <span>Crafted with</span>
                <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                <span>by</span>
                <span className="font-bold underline">Amit Singh</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
