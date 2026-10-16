/**
 * Prismora Biological Sciences & Medical Physiology Virtual Laboratory
 * Comprehensive Class 11 & 12 NCERT / NEET / AICTE Curriculum Standard
 *
 * Benchmark Institutions: AIIMS New Delhi, IISc Bangalore & NCERT
 *
 * Experiments:
 * 1. Human Reproduction, Menstrual Cycle & Embryogenesis (NCERT Class 12 Ch 3 & 4)
 * 2. Principles of Inheritance: Mendelian Genetics & Punnett Squares (NCERT Class 12 Ch 5)
 * 3. Cell Division: Mitosis & Cytokinesis under Virtual Microscope (NCERT Class 11 Ch 10)
 * 4. Plant Physiology: Stomatal Transpiration & Photosynthesis (NCERT Class 11 Ch 11 & 13)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import { RealtimeReproductionScene } from '@/components/simulation/realtime-reproduction-scene';
import { RealtimeGeneticsScene } from '@/components/simulation/realtime-genetics-scene';
import {
  calculateMenstrualCycleState,
  solveMonohybridCross,
  calculateMitosisState,
  type MitosisStage,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Dna,
  Download,
  Heart,
  Layers,
  Microscope,
  RotateCcw,
  ShieldAlert,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

type BiologyExpId =
  | 'human-reproduction'
  | 'genetics-mendel'
  | 'cell-mitosis'
  | 'plant-transpiration';

interface BiologyExperimentDef {
  readonly id: BiologyExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const BIOLOGY_EXPERIMENTS: readonly BiologyExperimentDef[] = [
  {
    id: 'human-reproduction',
    title: 'Human Reproduction, Menstrual Cycle & Embryogenesis',
    shortTitle: 'Human Reproduction',
    courseCode: 'NCERT Class 12 (Chapters 3 & 4)',
    benchmark: 'AIIMS New Delhi & NCERT',
    description: 'Hormonal regulation (FSH, LH surge, Estrogen, Progesterone), 60 FPS fertilization kinetics, acrosome & cortical reaction, cleavage timeline, and scientific family planning without taboos.',
    color: '#EC4899',
    equations: [
      '\\text{LH Surge Peak} > 40\\text{ mIU/mL} \\implies \\text{Ovulation at Day } 14 \\pm 1',
      '\\text{Acrosome: } \\text{Hyaluronidase} + \\text{Acrosin} \\implies \\text{Zona Pellucida Lysis}',
      '\\text{Cortical Granule Exocytosis} \\implies \\text{ZP2 Cleavage (Slow Block to Polyspermy)}',
      '\\text{Cleavage: } 2n = 46 \\xrightarrow{\\text{Mitosis}} 2 \\to 4 \\to 8 \\text{ Morula} \\to 128 \\text{ Blastocyst}',
    ],
  },
  {
    id: 'genetics-mendel',
    title: 'Principles of Inheritance: Mendelian Genetics & Punnett Squares',
    shortTitle: 'Mendelian Genetics',
    courseCode: 'NCERT Class 12 (Chapter 5)',
    benchmark: 'IISc Bangalore & NCERT',
    description: 'Monohybrid cross (3:1 phenotypic, 1:2:1 genotypic), Dihybrid cross (9:3:3:1), Law of Segregation, and Independent Assortment.',
    color: '#10B981',
    equations: [
      'F_2 \\text{ Phenotypic Ratio} = 3 \\text{ Dominant} : 1 \\text{ Recessive}',
      'F_2 \\text{ Genotypic Ratio} = 1\\,TT : 2\\,Tt : 1\\,tt',
      '\\chi^2 = \\sum \\frac{(O - E)^2}{E} \\quad (\\text{Goodness-of-Fit Test})',
      '\\text{Dihybrid Cross: } (3:1) \\times (3:1) = 9 : 3 : 3 : 1',
    ],
  },
  {
    id: 'cell-mitosis',
    title: 'Cell Division: Mitosis & Cytokinesis under Virtual Microscope',
    shortTitle: 'Mitosis Cytology',
    courseCode: 'NCERT Class 11 (Chapter 10)',
    benchmark: 'NCERT & National Science Centre',
    description: 'Onion root tip cytology slide: Prophase, Metaphase plate alignment, Anaphase sister chromatid migration, Telophase, and Cytokinesis.',
    color: '#8B5CF6',
    equations: [
      '2n \\xrightarrow{\\text{Equational Division}} 2 \\times 2n \\quad (\\text{Chromosome complement preserved})',
      '\\text{Metaphase: } \\text{Kinetochore tension} \\implies \\text{Equatorial plate alignment}',
      '\\text{Anaphase: } \\text{Separase enzyme cleaves Cohesin} \\implies \\text{Centromere separation}',
    ],
  },
  {
    id: 'plant-transpiration',
    title: 'Plant Physiology: Stomatal Apparatus & Transpiration Rate',
    shortTitle: 'Stomatal Physiology',
    courseCode: 'NCERT Class 11 (Chapter 11 & 13)',
    benchmark: 'IARI New Delhi & NCERT',
    description: 'Guard cell turgor pressure regulation, potassium ion (K+) active influx pump, stomatal aperture dynamics, and transpiration pull.',
    color: '#059669',
    equations: [
      '\\text{Light} \\implies \\text{H}^+\\text{ pump out} \\implies \\text{K}^+\\text{ influx} \\implies \\Psi_s \\downarrow \\implies \\text{Endosmosis (Turgid)}',
      '\\text{Transpiration Pull: } \\Delta P = \\frac{2 \\gamma \\cos \\theta}{r}',
    ],
  },
];

function BiologyLabContent() {
  const searchParams = useSearchParams();
  const expParam = searchParams.get('exp') as BiologyExpId | null;
  const [activeExpId, setActiveExpId] = useState<BiologyExpId>(expParam || 'human-reproduction');

  // Human Reproduction states
  const [repDay, setRepDay] = useState<number>(14);
  const repState = useMemo(() => calculateMenstrualCycleState(repDay), [repDay]);

  // Mitosis state
  const [mitosisStage, setMitosisStage] = useState<MitosisStage>('metaphase');
  const mitState = useMemo(() => calculateMitosisState(mitosisStage, 50, 4), [mitosisStage]);

  const activeExp = useMemo(() => {
    return BIOLOGY_EXPERIMENTS.find((e) => e.id === activeExpId) || BIOLOGY_EXPERIMENTS[0]!;
  }, [activeExpId]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top Breadcrumb & Header */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500">
            <Link href="/" className="hover:text-zinc-900 transition-colors">
              Prismora
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/library" className="hover:text-zinc-900 transition-colors">
              Laboratories
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-pink-600 font-bold">Class 11 & 12 Biology</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-pink-50 text-pink-700 border border-pink-200">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              NCERT / NEET Syllabus Standard
            </span>

            <BugReportModal simulationId={`bio-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto gap-2 py-2 border-t border-zinc-100">
          {BIOLOGY_EXPERIMENTS.map((exp) => {
            const isActive = exp.id === activeExpId;
            return (
              <button
                key={exp.id}
                onClick={() => setActiveExpId(exp.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs font-semibold'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: exp.color }}
                />
                <span>{exp.shortTitle}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: HUMAN REPRODUCTION & EMBRYOGENESIS */}
          {activeExpId === 'human-reproduction' && (
            <motion.div
              key="human-reproduction"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Header Card */}
              <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-pink-100 text-pink-800">
                      NCERT Class 12 Chapter 3 & 4
                    </span>
                    <span className="text-zinc-400 text-xs">|</span>
                    <span className="text-xs font-mono text-zinc-500">Benchmark: AIIMS New Delhi</span>
                  </div>
                  <h1 className="text-xl font-bold text-zinc-900 mt-1">
                    Human Reproduction, Gametogenesis & Embryonic Development
                  </h1>
                  <p className="text-xs text-zinc-500 mt-0.5 max-w-3xl">
                    Full physiological scientific simulation: 28-day menstrual cycle, LH surge ovulation, 60 FPS sperm motility & chemotaxis, acrosome/cortical reactions (polyspermy block), cleavage stages to blastocyst, and reproductive health mechanisms without social taboos.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 font-mono text-xs font-bold">
                    60 FPS Living Simulation
                  </span>
                </div>
              </div>

              {/* PhET Standard Interactive Workbench */}
              <RealtimeReproductionScene />

              {/* Scientific Theory & Equations Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-pink-600 block">
                    1. Endocrine Feedback
                  </span>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    GnRH from hypothalamus triggers pituitary LH & FSH. Developing Graafian follicle secretes 17β-Estradiol. High estrogen causes positive feedback triggering the dramatic <strong>LH Surge</strong> on Day 14, rupturing the follicle to release the secondary oocyte.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 block">
                    2. Luteal Transformation
                  </span>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    Ruptured follicle converts into the <strong>Corpus Luteum</strong>, secreting high Progesterone (&gt;10 ng/mL). Progesterone transforms the endometrium into a nutrient-rich, coiled secretory tissue and causes a thermogenic rise in basal body temperature (+0.4°C).
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-cyan-600 block">
                    3. Acrosome & Polyspermy Block
                  </span>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    Sperm undergoes capacitation. Acrosome releases hyaluronidase and acrosin to penetrate Zona Pellucida. Contact triggers a rapid Ca²⁺ wave causing <strong>Cortical Granule Exocytosis</strong>, cleaving ZP2 to permanently block lethal polyspermy.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white border border-zinc-200 shadow-2xs space-y-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-purple-600 block">
                    4. Cleavage & Implantation
                  </span>
                  <p className="text-xs text-zinc-700 leading-relaxed">
                    Zygote undergoes rapid mitotic cleavages: 2-cell (30h), 4-cell (48h), 8-cell Morula (72h), and Blastocyst (120h) with Inner Cell Mass (embryo) and Trophoblast (placenta). Implantation into secretory endometrium occurs on Day 6–8.
                  </p>
                </div>
              </div>

              {/* KaTeX Equations Card */}
              <div className="p-4 rounded-xl bg-pink-50/60 border border-pink-200 space-y-2">
                <span className="text-xs font-mono font-bold text-pink-900 uppercase">
                  NCERT Physiological Governing Equations
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-800">
                  {activeExp.equations.map((eq, i) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-pink-100 overflow-x-auto">
                      <MathView math={eq} display={false} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: MENDELIAN GENETICS & PUNNETT SQUARES */}
          {activeExpId === 'genetics-mendel' && (
            <motion.div
              key="genetics-mendel"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      NCERT Class 12 Chapter 5
                    </span>
                    <span className="text-zinc-400 text-xs">|</span>
                    <span className="text-xs font-mono text-zinc-500">Benchmark: IISc Bangalore & NCERT</span>
                  </div>
                  <h1 className="text-xl font-bold text-zinc-900 mt-1">
                    Principles of Inheritance: Mendelian Monohybrid & Dihybrid Crosses
                  </h1>
                  <p className="text-xs text-zinc-500 mt-0.5 max-w-3xl">
                    Interactive Punnett square matrix calculator: observe meiotic allele segregation, gamete union, phenotypic (3:1 and 9:3:3:1) and genotypic frequency distributions, and Chi-Square goodness-of-fit.
                  </p>
                </div>

                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-mono text-xs font-bold">
                  Gregor Mendel (1866)
                </span>
              </div>

              {/* PhET Standard Interactive Genetics Workbench */}
              <RealtimeGeneticsScene />

              {/* KaTeX Equations Card */}
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-2">
                <span className="text-xs font-mono font-bold text-emerald-900 uppercase">
                  Mendelian Mathematical Ratios & Chi-Square Laws
                </span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-zinc-800">
                  {activeExp.equations.map((eq, i) => (
                    <div key={i} className="p-2 bg-white rounded-lg border border-emerald-100 overflow-x-auto">
                      <MathView math={eq} display={false} />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: CELL DIVISION: MITOSIS CYTOLOGY UNDER VIRTUAL MICROSCOPE */}
          {activeExpId === 'cell-mitosis' && (
            <motion.div
              key="cell-mitosis"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-100 text-purple-800">
                      NCERT Class 11 Chapter 10 Practical
                    </span>
                    <span className="text-zinc-400 text-xs">|</span>
                    <span className="text-xs font-mono text-zinc-500">Benchmark: NCERT Laboratory Manual</span>
                  </div>
                  <h1 className="text-xl font-bold text-zinc-900 mt-1">
                    Mitosis in Onion Root Tip Cells: Virtual High-Resolution Cytology
                  </h1>
                  <p className="text-xs text-zinc-500 mt-0.5 max-w-3xl">
                    Examine root apical meristem squash slides under 100x oil immersion: identify Prophase, Metaphase plate alignment, Anaphase sister chromatid migration, and Telophase cytokinesis.
                  </p>
                </div>
              </div>

              {/* Virtual Microscope Viewport */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center min-h-[420px] relative overflow-hidden shadow-2xl">
                  {/* Microscope Circular Ocular Aperture */}
                  <div className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px] rounded-full border-8 border-zinc-800 bg-[#090D16] relative flex items-center justify-center shadow-inner overflow-hidden">
                    {/* Acetocarmine nuclear stain gradient */}
                    <div className="absolute inset-0 bg-radial from-rose-900/30 via-transparent to-transparent pointer-events-none" />

                    {/* Cell Graphic based on Mitosis Stage */}
                    <div className="relative w-48 h-48 rounded-full border-2 border-rose-500/40 flex items-center justify-center">
                      {mitosisStage === 'interphase' && (
                        <div className="w-28 h-28 rounded-full bg-rose-600/30 border border-rose-400 flex items-center justify-center">
                          <span className="w-4 h-4 rounded-full bg-rose-300 animate-pulse" />
                        </div>
                      )}

                      {mitosisStage === 'prophase' && (
                        <div className="flex gap-2 flex-wrap items-center justify-center w-28">
                          <div className="w-2.5 h-12 bg-rose-400 rounded-full rotate-45 shadow-sm" />
                          <div className="w-2.5 h-12 bg-rose-400 rounded-full -rotate-45 shadow-sm" />
                          <div className="w-2.5 h-12 bg-rose-400 rounded-full rotate-12 shadow-sm" />
                        </div>
                      )}

                      {mitosisStage === 'metaphase' && (
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="w-32 h-1 bg-cyan-400/30 dashed mb-1" />
                          <div className="flex gap-2 items-center">
                            <div className="w-3 h-10 bg-rose-400 rounded-full border border-white" />
                            <div className="w-3 h-10 bg-rose-400 rounded-full border border-white" />
                            <div className="w-3 h-10 bg-rose-400 rounded-full border border-white" />
                            <div className="w-3 h-10 bg-rose-400 rounded-full border border-white" />
                          </div>
                          <span className="text-[9px] font-mono text-cyan-300 font-bold mt-2">
                            Equatorial Metaphase Plate
                          </span>
                        </div>
                      )}

                      {mitosisStage === 'anaphase' && (
                        <div className="flex justify-between w-full px-4">
                          <div className="flex flex-col gap-2">
                            <div className="w-6 h-2 bg-rose-400 rounded-full -rotate-45" />
                            <div className="w-6 h-2 bg-rose-400 rounded-full -rotate-45" />
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="w-6 h-2 bg-rose-400 rounded-full rotate-45" />
                            <div className="w-6 h-2 bg-rose-400 rounded-full rotate-45" />
                          </div>
                        </div>
                      )}

                      {mitosisStage === 'telophase' && (
                        <div className="flex justify-between w-full px-3">
                          <div className="w-16 h-16 rounded-full bg-rose-600/30 border border-rose-400" />
                          <div className="w-16 h-16 rounded-full bg-rose-600/30 border border-rose-400" />
                        </div>
                      )}

                      {mitosisStage === 'cytokinesis' && (
                        <div className="flex gap-4 items-center">
                          <div className="w-18 h-18 rounded-full border border-rose-400 bg-rose-900/20" />
                          <div className="w-1 h-24 bg-zinc-600" />
                          <div className="w-18 h-18 rounded-full border border-rose-400 bg-rose-900/20" />
                        </div>
                      )}
                    </div>

                    {/* Reticle Crosshair */}
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                      <div className="w-full h-[1px] bg-zinc-700/40" />
                      <div className="h-full w-[1px] bg-zinc-700/40 absolute" />
                    </div>
                  </div>

                  <div className="mt-4 font-mono text-xs text-zinc-400 flex items-center gap-4">
                    <span>Magnification: <strong className="text-white">1000x (Oil Immersion)</strong></span>
                    <span>Stain: <strong className="text-rose-400">Acetocarmine</strong></span>
                  </div>
                </div>

                {/* Microscope Controls */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                      <Microscope className="w-4 h-4 text-purple-600" />
                      <span>Stage Selector</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {(['interphase', 'prophase', 'metaphase', 'anaphase', 'telophase', 'cytokinesis'] as MitosisStage[]).map((stg) => (
                        <button
                          key={stg}
                          onClick={() => setMitosisStage(stg)}
                          className={`px-3 py-2 rounded-xl font-mono text-xs font-bold capitalize transition-all ${
                            mitosisStage === stg
                              ? 'bg-purple-600 text-white shadow-xs'
                              : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                          }`}
                        >
                          {stg}
                        </button>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 space-y-2">
                      <span className="text-[10px] font-mono uppercase font-bold text-purple-800 block">
                        Diagnostic Cytological Features
                      </span>
                      <ul className="text-xs text-zinc-700 space-y-1 list-disc list-inside">
                        {mitState.microscopeFeatures.map((feat, i) => (
                          <li key={i}>{feat}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-xs font-mono space-y-1">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Chromosome Count (2n):</span>
                        <span className="font-bold text-zinc-900">{mitState.chromosomeCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Nuclear Envelope:</span>
                        <span className={`font-bold ${mitState.nuclearMembraneIntact ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {mitState.nuclearMembraneIntact ? 'Intact' : 'Disassembled'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Centromere Splitting:</span>
                        <span className={`font-bold ${mitState.centromereSplitting ? 'text-emerald-600' : 'text-zinc-400'}`}>
                          {mitState.centromereSplitting ? 'Active' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: PLANT PHYSIOLOGY: STOMATAL TRANSPIRATION */}
          {activeExpId === 'plant-transpiration' && (
            <motion.div
              key="plant-transpiration"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      NCERT Class 11 Chapter 11
                    </span>
                    <span className="text-zinc-400 text-xs">|</span>
                    <span className="text-xs font-mono text-zinc-500">Benchmark: IARI New Delhi</span>
                  </div>
                  <h1 className="text-xl font-bold text-zinc-900 mt-1">
                    Plant Physiology: Stomatal Opening & Transpiration Dynamics
                  </h1>
                  <p className="text-xs text-zinc-500 mt-0.5 max-w-3xl">
                    Levitt Active Potassium Ion (K⁺) mechanism: active H⁺ extrusion by guard cell membrane ATPase, K⁺ and malate²⁻ accumulation, osmotic endosmosis, turgor pressure increase, and outer thin wall bowing creating open stomatal pore.
                  </p>
                </div>
              </div>

              {/* Stomatal Visual Workbench */}
              <div className="bg-zinc-950 p-6 rounded-2xl border border-zinc-800 flex flex-col items-center justify-center min-h-[380px] shadow-2xl relative">
                <svg viewBox="0 0 500 280" className="w-full max-w-[500px]">
                  {/* Left Guard Cell */}
                  <path
                    d="M 210 40 C 140 40 140 240 210 240 C 230 200 230 80 210 40 Z"
                    fill="#15803D"
                    stroke="#4ADE80"
                    strokeWidth="3"
                  />
                  {/* Left Chloroplasts */}
                  <circle cx="180" cy="80" r="5" fill="#86EFAC" />
                  <circle cx="170" cy="140" r="5" fill="#86EFAC" />
                  <circle cx="180" cy="200" r="5" fill="#86EFAC" />

                  {/* Right Guard Cell */}
                  <path
                    d="M 290 40 C 360 40 360 240 290 240 C 270 200 270 80 290 40 Z"
                    fill="#15803D"
                    stroke="#4ADE80"
                    strokeWidth="3"
                  />
                  {/* Right Chloroplasts */}
                  <circle cx="320" cy="80" r="5" fill="#86EFAC" />
                  <circle cx="330" cy="140" r="5" fill="#86EFAC" />
                  <circle cx="320" cy="200" r="5" fill="#86EFAC" />

                  {/* Stomatal Aperture Pore */}
                  <ellipse cx="250" cy="140" rx="16" ry="65" fill="#0B1120" stroke="#86EFAC" strokeWidth="1.5" />

                  {/* K+ ions active transport arrows */}
                  <text x="250" y="145" textAnchor="middle" fill="#38BDF8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    K⁺ INFLUX
                  </text>
                  <text x="250" y="270" textAnchor="middle" fill="#CBD5E1" fontSize="10" fontFamily="monospace">
                    Open Stoma (Turgid Guard Cells, High Light)
                  </text>
                </svg>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function BiologyLabPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-50 flex items-center justify-center font-mono">Loading Biology Virtual Laboratory...</div>}>
      <BiologyLabContent />
    </Suspense>
  );
}
