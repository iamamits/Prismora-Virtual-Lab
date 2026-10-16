/**
 * Prismora Biotechnology & Biomedical Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Kharagpur, IIT Roorkee, IIT Delhi & Amrita Vishwa Vidyapeetham
 * Experiments:
 * 1. Michaelis-Menten & Lineweaver-Burk Enzyme Kinetics (BT-201)
 * 2. Microbial Growth & Monod Kinetics Batch Fermentation (BT-204)
 * 3. Volumetric Oxygen Transfer Coefficient (KLa) in Bioreactors (BT-301)
 * 4. Gel Filtration / Size Exclusion Chromatography (SEC) (BT-303)
 * 5. Polymerase Chain Reaction (PCR) Amplification Kinetics (BT-305)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  EnzymeKineticsEngine,
  DEFAULT_ENZYME_PARAMS,
  type EnzymeParameters,
  BacterialGrowthEngine,
  DEFAULT_MICROBIAL_PARAMS,
  type MicrobialParameters,
  KlaBioreactorEngine,
  DEFAULT_KLA_PARAMS,
  type KlaBioreactorParameters,
  ChromatographyEngine,
  DEFAULT_CHROMATOGRAPHY_PARAMS,
  type ChromatographyParameters,
  PcrKineticsEngine,
  DEFAULT_PCR_PARAMS,
  type PcrParameters,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  BookOpen,
  ChevronRight,
  Dna,
  Download,
  FlaskConical,
  Layers,
  RotateCcw,
  Sliders,
  Sparkles,
  TestTube,
} from 'lucide-react';

type BiotechExpId =
  | 'enzyme-kinetics'
  | 'bacterial-growth'
  | 'kla-bioreactor'
  | 'chromatography'
  | 'pcr-kinetics';

interface BiotechExperimentDef {
  readonly id: BiotechExpId;
  readonly title: string;
  readonly shortTitle: string;
  readonly courseCode: string;
  readonly benchmark: string;
  readonly description: string;
  readonly color: string;
  readonly equations: readonly string[];
}

const BIOTECH_EXPERIMENTS: readonly BiotechExperimentDef[] = [
  {
    id: 'enzyme-kinetics',
    title: 'Michaelis-Menten & Lineweaver-Burk Enzyme Kinetics',
    shortTitle: 'Enzyme Kinetics',
    courseCode: 'BT-201 (Biochemistry & Enzymology)',
    benchmark: 'IIT Kharagpur & Amrita University',
    description: 'Initial reaction velocity v0 vs [S], hyperbolic saturation, double-reciprocal plot, Km and Vmax determination, and enzyme inhibitors.',
    color: '#EC4899',
    equations: [
      'v_0 = \\frac{V_{max} [S]}{K_m + [S]}',
      '\\frac{1}{v_0} = \\frac{K_m}{V_{max}} \\frac{1}{[S]} + \\frac{1}{V_{max}} \\quad (\\text{Lineweaver-Burk})',
      'K_{m,app} = K_m \\left(1 + \\frac{[I]}{K_i}\\right) \\quad (\\text{Competitive})',
    ],
  },
  {
    id: 'bacterial-growth',
    title: 'Microbial Growth & Monod Kinetics Batch Fermentation',
    shortTitle: 'Microbial Fermentation',
    courseCode: 'BT-204 (Bioprocess Engineering)',
    benchmark: 'IIT Roorkee & IIT Delhi',
    description: 'Bacterial growth phases (Lag, Exponential Log, Stationary, Death), Monod substrate affinity Ks, specific growth rate mu, and biomass yield.',
    color: '#10B981',
    equations: [
      '\\mu = \\mu_{max} \\frac{S}{K_s + S} \\quad (\\text{Monod Model})',
      '\\frac{dX}{dt} = (\\mu - k_d) X',
      't_d = \\frac{\\ln 2}{\\mu_{max}}, \\quad Y_{X/S} = \\frac{\\Delta X}{\\Delta S}',
    ],
  },
  {
    id: 'kla-bioreactor',
    title: 'Volumetric Oxygen Transfer Coefficient (KLa) in Bioreactors',
    shortTitle: 'Bioreactor KLa & OTR',
    courseCode: 'BT-301 (Bioreactor Design & Scale-up)',
    benchmark: 'IIT Madras & IIT Delhi',
    description: 'Dynamic gassing-out method, dissolved oxygen DO reoxygenation kinetics, agitation speed RPM, aeration rate vvm, and maximum oxygen transfer rate OTR.',
    color: '#06B6D4',
    equations: [
      '\\frac{dC_L}{dt} = K_L a (C^* - C_L)',
      '\\ln\\left(\\frac{C^* - C_{L,0}}{C^* - C_L(t)}\\right) = K_L a \\cdot t',
      '\\text{OTR}_{max} = K_L a \\cdot C^*',
    ],
  },
  {
    id: 'chromatography',
    title: 'Size Exclusion / Gel Filtration Chromatography (SEC)',
    shortTitle: 'Gel Chromatography',
    courseCode: 'BT-303 (Downstream Processing)',
    benchmark: 'IIT Delhi & IIT Kharagpur',
    description: 'Porous dextran bead matrix fractionation, void volume V0, total volume Vt, partition coefficient Kav vs log(MW), and peak resolution Rs.',
    color: '#8B5CF6',
    equations: [
      'K_{av} = \\frac{V_e - V_0}{V_t - V_0}',
      'R_s = \\frac{2 (V_{e,2} - V_{e,1})}{w_1 + w_2}',
      'K_{av} = -m \\log_{10}(\\text{MW}) + c',
    ],
  },
  {
    id: 'pcr-kinetics',
    title: 'Polymerase Chain Reaction (PCR) Amplification Kinetics',
    shortTitle: 'PCR & qPCR Kinetics',
    courseCode: 'BT-305 (Molecular Biology & Diagnostics)',
    benchmark: 'IIT Delhi & Amrita Virtual Labs',
    description: '3-phase thermal cycling (denaturation, annealing, extension), exponential copy doubling N = N0*(1+E)^n, threshold cycle Ct, and reaction plateau.',
    color: '#F43F5E',
    equations: [
      'N = N_0 (1 + E)^n',
      'C_t = \\frac{\\log(N_{threshold}) - \\log(N_0)}{\\log(1 + E)}',
      '\\text{Amplification Fold} = (1 + E)^{n_{total}}',
    ],
  },
];

function BiotechWorkbenchContent() {
  const searchParams = useSearchParams();
  const initialExp = (searchParams.get('exp') as BiotechExpId) || 'enzyme-kinetics';
  const [activeExpId, setActiveExpId] = useState<BiotechExpId>(
    BIOTECH_EXPERIMENTS.some((e) => e.id === initialExp) ? initialExp : 'enzyme-kinetics',
  );

  React.useEffect(() => {
    const exp = searchParams.get('exp') as BiotechExpId;
    if (exp && BIOTECH_EXPERIMENTS.some((e) => e.id === exp)) {
      setActiveExpId(exp);
    }
  }, [searchParams]);

  const activeExp = useMemo(
    () => BIOTECH_EXPERIMENTS.find((e) => e.id === activeExpId) ?? BIOTECH_EXPERIMENTS[0]!,
    [activeExpId],
  );

  // ==========================================
  // EXP 1: Enzyme States
  // ==========================================
  const [enzymeParams, setEnzymeParams] = useState<EnzymeParameters>(DEFAULT_ENZYME_PARAMS);
  const enzymeResult = useMemo(() => EnzymeKineticsEngine.compute(enzymeParams), [enzymeParams]);

  // ==========================================
  // EXP 2: Bacterial Growth States
  // ==========================================
  const [bacterialParams, setBacterialParams] = useState<MicrobialParameters>(DEFAULT_MICROBIAL_PARAMS);
  const bacterialResult = useMemo(() => BacterialGrowthEngine.compute(bacterialParams), [bacterialParams]);

  // ==========================================
  // EXP 3: KLa Bioreactor States
  // ==========================================
  const [klaParams, setKlaParams] = useState<KlaBioreactorParameters>(DEFAULT_KLA_PARAMS);
  const klaResult = useMemo(() => KlaBioreactorEngine.compute(klaParams), [klaParams]);

  // ==========================================
  // EXP 4: Chromatography States
  // ==========================================
  const [chromParams, setChromParams] = useState<ChromatographyParameters>(DEFAULT_CHROMATOGRAPHY_PARAMS);
  const chromResult = useMemo(() => ChromatographyEngine.compute(chromParams), [chromParams]);

  // ==========================================
  // EXP 5: PCR Kinetics States
  // ==========================================
  const [pcrParams, setPcrParams] = useState<PcrParameters>(DEFAULT_PCR_PARAMS);
  const pcrResult = useMemo(() => PcrKineticsEngine.compute(pcrParams), [pcrParams]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 flex flex-col font-sans">
      {/* Top Breadcrumb & Header */}
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Link href="/" className="hover:text-blue-600 transition-colors">Prismora</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/library" className="hover:text-blue-600 transition-colors">Disciplines</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-zinc-900">Biotechnology Virtual Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-50 text-pink-800 border border-pink-200 font-bold">
              {activeExp.courseCode}
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
              {activeExp.benchmark}
            </span>
            <BugReportModal simulationId={`bt-${activeExp.id}`} moduleName={activeExp.title} />
          </div>
        </div>

        {/* Experiment Switcher Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {BIOTECH_EXPERIMENTS.map((exp) => {
            const isActive = exp.id === activeExpId;
            return (
              <button
                key={exp.id}
                onClick={() => setActiveExpId(exp.id)}
                className={`relative px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 ${
                  isActive
                    ? 'text-zinc-900 bg-zinc-100 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: exp.color }}
                />
                <span>{exp.shortTitle}</span>
                {isActive && (
                  <motion.div
                    layoutId="active-bt-tab"
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full"
                    style={{ backgroundColor: exp.color }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <AnimatePresence mode="wait">
          {/* TAB 1: ENZYME KINETICS */}
          {activeExpId === 'enzyme-kinetics' && (
            <motion.div
              key="enzyme-kinetics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-pink-50 text-pink-700 border border-pink-200">
                      Km = {enzymeResult.kmApparentMm.toFixed(2)} mM
                    </span>
                  </div>

                  {/* Michaelis-Menten Curve Graph */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#334155" strokeWidth="1.5" />

                      {(() => {
                        const pts = enzymeResult.saturationCurve;
                        const maxS = Math.max(1, pts[pts.length - 1]?.substrateConcentrationMm ?? 50);
                        const maxV = Math.max(1, enzymeResult.vmaxApparentMicroMPerMin * 1.2);
                        const toX = (s: number) => 40 + (s / maxS) * 440;
                        const toY = (v: number) => 170 - (v / maxV) * 150;

                        const path = pts.map((p: { substrateConcentrationMm: number; velocityMicroMPerMin: number }, i: number) => `${i === 0 ? 'M' : 'L'} ${toX(p.substrateConcentrationMm).toFixed(1)} ${toY(p.velocityMicroMPerMin).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#EC4899" strokeWidth="2.5" />;
                      })()}

                      {/* Vmax asymptote */}
                      <line x1="40" y1="35" x2="480" y2="35" stroke="#F43F5E" strokeWidth="1" strokeDasharray="4,4" />
                      <text x="470" y="30" textAnchor="end" fill="#F43F5E" fontSize="10" fontFamily="monospace">
                        Vmax = {enzymeResult.vmaxApparentMicroMPerMin.toFixed(1)} µM/min
                      </text>
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Substrate [S] (mM)</span>
                      <span className="text-pink-400">Hyperbolic Saturation v0 = Vmax[S] / (Km + [S])</span>
                      <span>Rate v0 (µM/min)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Vmax Apparent</span>
                      <span className="text-base font-mono font-black text-pink-600">{enzymeResult.vmaxApparentMicroMPerMin.toFixed(1)} µM/min</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Km Apparent</span>
                      <span className="text-base font-mono font-black text-zinc-900">{enzymeResult.kmApparentMm.toFixed(2)} mM</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Catalytic Turnover</span>
                      <span className="text-base font-mono font-black text-blue-600">{enzymeResult.turnoverNumberKcatSec.toFixed(1)} s⁻¹</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Catalytic Efficiency</span>
                      <span className="text-base font-mono font-black text-emerald-600">{(enzymeResult.catalyticEfficiencyPerMSec / 1e4).toFixed(1)}×10⁴</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-pink-600" />
                    <span>Enzyme Parameters</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Substrate Affinity Km:</span>
                        <span className="font-bold text-zinc-900">{enzymeParams.michaelisConstantKm} mM</span>
                      </div>
                      <input
                        type="range"
                        min="0.5"
                        max="10.0"
                        step="0.5"
                        value={enzymeParams.michaelisConstantKm}
                        onChange={(e) => setEnzymeParams({ ...enzymeParams, michaelisConstantKm: parseFloat(e.target.value) })}
                        className="w-full accent-pink-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Max Velocity Vmax:</span>
                        <span className="font-bold text-zinc-900">{enzymeParams.maximumVelocityVmax} µM/min</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="150"
                        step="5"
                        value={enzymeParams.maximumVelocityVmax}
                        onChange={(e) => setEnzymeParams({ ...enzymeParams, maximumVelocityVmax: parseFloat(e.target.value) })}
                        className="w-full accent-pink-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Inhibitor Conc [I]:</span>
                        <span className="font-bold text-zinc-900">{enzymeParams.inhibitorConcentrationMm ?? 0} mM</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        step="0.5"
                        value={enzymeParams.inhibitorConcentrationMm ?? 0}
                        onChange={(e) => setEnzymeParams({ ...enzymeParams, inhibitorConcentrationMm: parseFloat(e.target.value) })}
                        className="w-full accent-pink-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-pink-50/60 border border-pink-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-pink-800 uppercase block">Enzyme Kinetics</span>
                    {activeExp.equations.map((eq, i) => (
                      <div key={i} className="text-xs text-zinc-800 overflow-x-auto py-1">
                        <MathView math={eq} display={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: BACTERIAL GROWTH */}
          {activeExpId === 'bacterial-growth' && (
            <motion.div
              key="bacterial-growth"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Doubling Time td = {bacterialResult.doublingTimeHours.toFixed(2)} h
                    </span>
                  </div>

                  {/* Growth Curve Graph */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#334155" strokeWidth="1.5" />

                      {/* Biomass X (Green) */}
                      {(() => {
                        const pts = bacterialResult.growthCurve;
                        const maxT = bacterialParams.fermentationTimeHours;
                        const maxX = Math.max(1, bacterialResult.maximumBiomassGPerL * 1.15);
                        const toX = (t: number) => 40 + (t / (bacterialParams.fermentationTimeHours ?? 16)) * 440;
                        const toY = (x: number) => 170 - (x / maxX) * 150;
                        const path = pts.map((p: { timeHours: number; biomassGPerL: number }, i: number) => `${i === 0 ? 'M' : 'L'} ${toX(p.timeHours).toFixed(1)} ${toY(p.biomassGPerL).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#10B981" strokeWidth="2.5" />;
                      })()}

                      {/* Substrate S (Amber dashed) */}
                      {(() => {
                        const pts = bacterialResult.growthCurve;
                        const maxT = bacterialParams.fermentationTimeHours ?? 16;
                        const maxS = bacterialParams.initialSubstrateGPerL ?? 20;
                        const toX = (t: number) => 40 + (t / maxT) * 440;
                        const toY = (s: number) => 170 - (s / maxS) * 150;
                        const path = pts.map((p: { timeHours: number; substrateGPerL: number }, i: number) => `${i === 0 ? 'M' : 'L'} ${toX(p.timeHours).toFixed(1)} ${toY(p.substrateGPerL).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#F59E0B" strokeWidth="2" strokeDasharray="5,2" />;
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span className="text-emerald-400">― Biomass X(t)</span>
                      <span className="text-amber-400">--- Substrate S(t)</span>
                      <span>Time t (hours)</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Biomass</span>
                      <span className="text-base font-mono font-black text-emerald-600">{bacterialResult.maximumBiomassGPerL.toFixed(2)} g/L</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Growth Rate μmax</span>
                      <span className="text-base font-mono font-black text-zinc-900">{bacterialParams.maxSpecificGrowthRateMu} h⁻¹</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Doubling Time</span>
                      <span className="text-base font-mono font-black text-blue-600">{bacterialResult.doublingTimeHours.toFixed(2)} h</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Biomass Yield Yx/s</span>
                      <span className="text-base font-mono font-black text-purple-600">{bacterialResult.biomassYieldYXOverS.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-emerald-600" />
                    <span>Fermentation Conditions</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Initial Substrate (Glucose):</span>
                        <span className="font-bold text-zinc-900">{bacterialParams.initialSubstrateGPerL} g/L</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="80"
                        step="5"
                        value={bacterialParams.initialSubstrateGPerL}
                        onChange={(e) => setBacterialParams({ ...bacterialParams, initialSubstrateGPerL: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Monod Constant (Ks):</span>
                        <span className="font-bold text-zinc-900">{bacterialParams.monodConstantKsGPerL} g/L</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.1"
                        value={bacterialParams.monodConstantKsGPerL}
                        onChange={(e) => setBacterialParams({ ...bacterialParams, monodConstantKsGPerL: parseFloat(e.target.value) })}
                        className="w-full accent-emerald-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">Monod Kinetics</span>
                    {activeExp.equations.map((eq, i) => (
                      <div key={i} className="text-xs text-zinc-800 overflow-x-auto py-1">
                        <MathView math={eq} display={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: KLA BIOREACTOR */}
          {activeExpId === 'kla-bioreactor' && (
            <motion.div
              key="kla-bioreactor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-50 text-cyan-800 border border-cyan-200">
                      KLa = {klaResult.klaPerHour.toFixed(1)} h⁻¹ ({klaResult.klaPerSecond.toFixed(4)} s⁻¹)
                    </span>
                  </div>

                  {/* Reoxygenation Curve Graph */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#334155" strokeWidth="1.5" />

                      {(() => {
                        const pts = klaResult.reoxygenationCurve;
                        const maxT = pts[pts.length - 1]?.timeSec ?? 100;
                        const maxDO = klaResult.saturationDoMgPerL * 1.1;
                        const toX = (t: number) => 40 + (t / maxT) * 440;
                        const toY = (d: number) => 170 - (d / maxDO) * 150;
                        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.timeSec).toFixed(1)} ${toY(p.dissolvedOxygenMgPerL).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#38BDF8" strokeWidth="2.5" />;
                      })()}

                      {/* Saturation DO Line */}
                      <line x1="40" y1="35" x2="480" y2="35" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4,4" />
                      <text x="470" y="30" textAnchor="end" fill="#38BDF8" fontSize="10" fontFamily="monospace">
                        C* = {klaResult.saturationDoMgPerL.toFixed(2)} mg/L
                      </text>
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Time t (s)</span>
                      <span className="text-cyan-400">DO Re-oxygenation: CL(t) = C*(1 - e^(-KLa*t))</span>
                      <span>t90 = {klaResult.timeTo90PctSaturationSeconds.toFixed(1)}s</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">KLa Coefficient</span>
                      <span className="text-base font-mono font-black text-cyan-600">{klaResult.klaPerHour.toFixed(1)} h⁻¹</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Saturation C*</span>
                      <span className="text-base font-mono font-black text-zinc-900">{klaResult.saturationDoMgPerL.toFixed(2)} mg/L</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max OTR</span>
                      <span className="text-base font-mono font-black text-blue-600">{klaResult.maxOtrMgPerLPerH.toFixed(1)} mg/L·h</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Time to 90% DO</span>
                      <span className="text-base font-mono font-black text-emerald-600">{klaResult.timeTo90PctSaturationSeconds.toFixed(0)} s</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-cyan-600" />
                    <span>Bioreactor Operating Conditions</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Agitation Speed (RPM):</span>
                        <span className="font-bold text-cyan-600">{klaParams.agitationSpeedRpm} RPM</span>
                      </div>
                      <input
                        type="range"
                        min="200"
                        max="800"
                        step="25"
                        value={klaParams.agitationSpeedRpm}
                        onChange={(e) => setKlaParams({ ...klaParams, agitationSpeedRpm: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Aeration Rate (vvm):</span>
                        <span className="font-bold text-zinc-900">{klaParams.aerationRateVvm.toFixed(1)} vvm</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="2.5"
                        step="0.1"
                        value={klaParams.aerationRateVvm}
                        onChange={(e) => setKlaParams({ ...klaParams, aerationRateVvm: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Broth Temperature:</span>
                        <span className="font-bold text-zinc-900">{klaParams.brothTemperatureC}°C</span>
                      </div>
                      <input
                        type="range"
                        min="25"
                        max="42"
                        step="1"
                        value={klaParams.brothTemperatureC}
                        onChange={(e) => setKlaParams({ ...klaParams, brothTemperatureC: parseFloat(e.target.value) })}
                        className="w-full accent-cyan-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-cyan-50/60 border border-cyan-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-cyan-800 uppercase block">Oxygen Transfer</span>
                    {activeExp.equations.map((eq, i) => (
                      <div key={i} className="text-xs text-zinc-800 overflow-x-auto py-1">
                        <MathView math={eq} display={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: CHROMATOGRAPHY */}
          {activeExpId === 'chromatography' && (
            <motion.div
              key="chromatography"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-purple-50 text-purple-800 border border-purple-200">
                      Resolution Rs = {chromResult.resolutionRs.toFixed(2)} ({chromResult.isBaselineSeparated ? 'Baseline Resolved' : 'Overlapping'})
                    </span>
                  </div>

                  {/* UV Chromatogram 280nm Profile */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#334155" strokeWidth="1.5" />

                      {(() => {
                        const pts = chromResult.chromatogramUvCurve;
                        const maxV = chromResult.totalVolumeVtMl * 1.1;
                        const maxAbs = 1.4;
                        const toX = (v: number) => 40 + (v / maxV) * 440;
                        const toY = (a: number) => 170 - (a / maxAbs) * 150;
                        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.volumeMl).toFixed(1)} ${toY(p.absorbance280nm).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#A855F7" strokeWidth="2.5" />;
                      })()}
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Void Volume V0 = {chromResult.voidVolumeV0Ml.toFixed(1)} mL</span>
                      <span className="text-purple-400">UV Absorbance A280 (Elution Profile)</span>
                      <span>Total Volume Vt = {chromResult.totalVolumeVtMl.toFixed(1)} mL</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Void Volume V0</span>
                      <span className="text-base font-mono font-black text-purple-600">{chromResult.voidVolumeV0Ml.toFixed(1)} mL</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Total Volume Vt</span>
                      <span className="text-base font-mono font-black text-zinc-900">{chromResult.totalVolumeVtMl.toFixed(1)} mL</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Peak Resolution Rs</span>
                      <span className="text-base font-mono font-black text-blue-600">{chromResult.resolutionRs.toFixed(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Proteins Resolved</span>
                      <span className="text-base font-mono font-black text-emerald-600">{chromResult.peaks.length} Peaks</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-purple-600" />
                    <span>Column Specifications</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Column Length:</span>
                        <span className="font-bold text-zinc-900">{chromParams.columnLengthCm} cm</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="60"
                        step="5"
                        value={chromParams.columnLengthCm}
                        onChange={(e) => setChromParams({ ...chromParams, columnLengthCm: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Flow Rate:</span>
                        <span className="font-bold text-zinc-900">{chromParams.flowRateMlPerMin} mL/min</span>
                      </div>
                      <input
                        type="range"
                        min="0.2"
                        max="2.0"
                        step="0.1"
                        value={chromParams.flowRateMlPerMin}
                        onChange={(e) => setChromParams({ ...chromParams, flowRateMlPerMin: parseFloat(e.target.value) })}
                        className="w-full accent-purple-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-purple-800 uppercase block">Chromatography Equations</span>
                    {activeExp.equations.map((eq, i) => (
                      <div key={i} className="text-xs text-zinc-800 overflow-x-auto py-1">
                        <MathView math={eq} display={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 5: PCR KINETICS */}
          {activeExpId === 'pcr-kinetics' && (
            <motion.div
              key="pcr-kinetics"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-bold text-zinc-900">{activeExp.title}</h2>
                      <p className="text-xs text-zinc-500 mt-0.5">{activeExp.description}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-rose-50 text-rose-800 border border-rose-200">
                      Ct = {pcrResult.cycleThresholdCt.toFixed(1)} Cycles (E = {pcrParams.efficiencyPct}%)
                    </span>
                  </div>

                  {/* qPCR Sigmoid Amplification Curve */}
                  <div className="h-64 sm:h-72 w-full bg-zinc-900 rounded-xl overflow-hidden relative p-4 flex flex-col justify-between">
                    <svg className="w-full h-full" viewBox="0 0 500 200">
                      <rect x="0" y="0" width="500" height="200" fill="#09090B" />
                      <line x1="40" y1="170" x2="480" y2="170" stroke="#334155" strokeWidth="1.5" />
                      <line x1="40" y1="170" x2="40" y2="20" stroke="#334155" strokeWidth="1.5" />

                      {(() => {
                        const pts = pcrResult.amplificationCurve;
                        const maxCycle = pcrParams.cycleCount;
                        const toX = (c: number) => 40 + (c / maxCycle) * 440;
                        const toY = (rfu: number) => 170 - (rfu / 100) * 150;
                        const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${toX(p.cycle).toFixed(1)} ${toY(p.fluorescenceRfu).toFixed(1)}`).join(' ');
                        return <path d={path} fill="none" stroke="#F43F5E" strokeWidth="2.5" />;
                      })()}

                      {/* Ct Threshold Line */}
                      <line x1="40" y1="140" x2="480" y2="140" stroke="#EAB308" strokeWidth="1" strokeDasharray="3,3" />
                      <text x="470" y="135" textAnchor="end" fill="#EAB308" fontSize="10" fontFamily="monospace">
                        Threshold Ct = {pcrResult.cycleThresholdCt.toFixed(1)}
                      </text>
                    </svg>

                    <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                      <span>Initial N0 = {pcrParams.initialTemplateCopies.toLocaleString()}</span>
                      <span className="text-rose-400">qPCR Fluorescence Sigmoid Curve RFU</span>
                      <span>Total Cycles = {pcrParams.cycleCount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Threshold Cycle Ct</span>
                      <span className="text-base font-mono font-black text-rose-600">{pcrResult.cycleThresholdCt.toFixed(1)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Fold Amplification</span>
                      <span className="text-base font-mono font-black text-zinc-900">{pcrResult.foldAmplification.toExponential(2)}</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Efficiency E</span>
                      <span className="text-base font-mono font-black text-blue-600">{pcrParams.efficiencyPct}%</span>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                      <span className="text-[10px] font-mono text-zinc-500 uppercase block">Final Amplicons</span>
                      <span className="text-base font-mono font-black text-emerald-600">{pcrResult.finalAmpliconCopies.toExponential(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="lg:col-span-4 space-y-4">
                <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                    <Sliders className="w-4 h-4 text-rose-600" />
                    <span>PCR Cycling Parameters</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Initial Template Copies:</span>
                        <span className="font-bold text-zinc-900">{pcrParams.initialTemplateCopies.toLocaleString()}</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="50000"
                        step="500"
                        value={pcrParams.initialTemplateCopies}
                        onChange={(e) => setPcrParams({ ...pcrParams, initialTemplateCopies: parseFloat(e.target.value) })}
                        className="w-full accent-rose-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Amplification Efficiency:</span>
                        <span className="font-bold text-zinc-900">{pcrParams.efficiencyPct}%</span>
                      </div>
                      <input
                        type="range"
                        min="80"
                        max="100"
                        step="1"
                        value={pcrParams.efficiencyPct}
                        onChange={(e) => setPcrParams({ ...pcrParams, efficiencyPct: parseFloat(e.target.value) })}
                        className="w-full accent-rose-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between font-mono text-xs mb-1">
                        <span className="text-zinc-600">Annealing Temp (°C):</span>
                        <span className="font-bold text-zinc-900">{pcrParams.annealingTemperatureC}°C</span>
                      </div>
                      <input
                        type="range"
                        min="50"
                        max="65"
                        step="1"
                        value={pcrParams.annealingTemperatureC}
                        onChange={(e) => setPcrParams({ ...pcrParams, annealingTemperatureC: parseFloat(e.target.value) })}
                        className="w-full accent-rose-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-rose-800 uppercase block">Kinetics Equations</span>
                    {activeExp.equations.map((eq, i) => (
                      <div key={i} className="text-xs text-zinc-800 overflow-x-auto py-1">
                        <MathView math={eq} display={false} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function BiotechWorkbenchPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-xs font-mono">Loading Biotechnology Laboratory...</div>}>
      <BiotechWorkbenchContent />
    </Suspense>
  );
}
