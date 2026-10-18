/**
 * Prismora Chemical Sciences Virtual Laboratory
 * Comprehensive Class 11 & 12 NCERT, CBSE & NEET/JEE Standard
 *
 * Experiments:
 * 1. Chemical Equilibrium & Le Chatelier's Principle (NCERT Class 11 Chapter 7)
 * 2. Electrochemical Galvanic Cell & Nernst Equation (NCERT Class 12 Chapter 3)
 * 3. Acid-Base Neutralization Titration & pH Curves (NCERT Class 11 & 12)
 * 4. Fractional Distillation & Vapor-Liquid Equilibrium (NCERT Class 11 Ch 12)
 */

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, MathView } from '@prismora/ui';
import {
  ChemicalEquilibriumEngine,
  ElectrochemistryEngine,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Droplets,
  Flame,
  FlaskConical,
  Layers,
  RotateCcw,
  Sliders,
  Sparkles,
  Zap,
} from 'lucide-react';

type ChemistryExpId = 'equilibrium' | 'electrochem' | 'titration';

export default function ChemistryLabPage() {
  const [activeExpId, setActiveExpId] = useState<ChemistryExpId>('equilibrium');

  // Chemical Equilibrium Parameters
  const [eqTempK, setEqTempK] = useState<number>(298.15); // 25 °C
  const [eqVolumeL, setEqVolumeL] = useState<number>(2.0); // 2.0 Liters
  const [initialN2O4, setInitialN2O4] = useState<number>(0.5); // moles

  // Electrochemistry Parameters
  const [anodeZnConc, setAnodeZnConc] = useState<number>(1.0); // M [Zn2+]
  const [cathodeCuConc, setCathodeCuConc] = useState<number>(1.0); // M [Cu2+]
  const [cellTempK, setCellTempK] = useState<number>(298.15);
  const [loadResistance, setLoadResistance] = useState<number>(100); // Ohms

  // Computed Equilibrium State
  const eqState = useMemo(() => {
    return ChemicalEquilibriumEngine.solveEquilibrium(eqTempK, eqVolumeL, initialN2O4, 0.1);
  }, [eqTempK, eqVolumeL, initialN2O4]);

  // Computed Galvanic Cell State
  const cellState = useMemo(() => {
    return ElectrochemistryEngine.calculateCell(anodeZnConc, cathodeCuConc, cellTempK, loadResistance);
  }, [anodeZnConc, cathodeCuConc, cellTempK, loadResistance]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Top Breadcrumb & Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Prismora
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/library" className="hover:text-slate-900 transition-colors">
              Laboratories
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-rose-600 font-bold">Class 11 & 12 Chemistry</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              NCERT / NEET / JEE Chemistry Standard
            </span>
          </div>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex overflow-x-auto gap-2 py-2 border-t border-slate-100">
          <button
            onClick={() => setActiveExpId('equilibrium')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeExpId === 'equilibrium'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-300" />
            <span>Chemical Equilibrium & Le Chatelier (N₂O₄ ⇌ 2NO₂)</span>
          </button>

          <button
            onClick={() => setActiveExpId('electrochem')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeExpId === 'electrochem'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-sky-300" />
            <span>Galvanic Cell & Nernst Equation (Daniell Cell)</span>
          </button>

          <Link
            href="/experiments/chemistry/titration"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all"
          >
            <Droplets className="w-3.5 h-3.5 text-emerald-500" />
            <span>Acid-Base Neutralization Titration</span>
            <ArrowRight className="w-3 h-3 text-slate-400" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 space-y-6">
        <AnimatePresence mode="wait">
          {/* ============================================================ */}
          {/* TAB 1: CHEMICAL EQUILIBRIUM & LE CHATELIER'S PRINCIPLE */}
          {/* ============================================================ */}
          {activeExpId === 'equilibrium' && (
            <motion.div
              key="equilibrium"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800">
                      NCERT Class 11 Chapter 7
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-mono text-slate-500">Benchmark: IIT Bombay & Amrita Virtual Labs</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Chemical Equilibrium: N₂O₄ (Colorless) ⇌ 2 NO₂ (Dark Red-Brown)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                    Investigate dynamic equilibrium, van &apos;t Hoff temperature dependence, and Le Chatelier &apos;s principle
                    under volume and temperature perturbations with live optical gas density transmittance.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Equilibrium Kc</span>
                    <span className="text-sm font-extrabold font-mono text-rose-700">{eqState.Kc} M</span>
                  </div>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Reaction Pressure</span>
                    <span className="text-sm font-extrabold font-mono text-slate-800">{eqState.pressureAtm} atm</span>
                  </div>
                </div>
              </div>

              {/* Simulation Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Gas Chamber Canvas (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex flex-row items-center justify-between">
                      <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <FlaskConical className="w-4 h-4 text-rose-600" />
                        Sealed Piston Gas Reaction Vessel
                      </CardTitle>
                      <Badge variant="outline" className="font-mono text-xs text-slate-700">
                        ΔH° = +57.2 kJ/mol (Endothermic)
                      </Badge>
                    </CardHeader>

                    <CardContent className="p-6 flex flex-col items-center justify-center bg-slate-900">
                      {/* Cylindrical Gas Chamber */}
                      <div className="relative w-72 flex flex-col items-center">
                        {/* Movable Piston Top */}
                        <div
                          className="w-full h-8 bg-slate-400 border-2 border-slate-600 rounded-t-lg shadow-md flex items-center justify-center transition-all duration-300"
                          style={{ marginBottom: `${(eqVolumeL / 5.0) * 160}px` }}
                        >
                          <div className="w-4 h-6 bg-slate-700 -mt-6 rounded-t" />
                          <span className="text-[9px] font-mono font-bold text-slate-900">
                            PISTON (V = {eqVolumeL.toFixed(1)} L)
                          </span>
                        </div>

                        {/* Chamber Body with Dynamic Optical Color */}
                        <div
                          className="w-full h-56 rounded-b-xl border-4 border-slate-600 border-t-0 shadow-inner flex flex-col items-center justify-center p-4 transition-colors duration-500 relative"
                          style={{ backgroundColor: eqState.chamberColorHex }}
                        >
                          {/* Floating Gas Molecules Annotation */}
                          <div className="text-center font-mono font-extrabold text-white text-xs drop-shadow-md space-y-1">
                            <div>[N₂O₄] = {eqState.concN2O4} mol/L</div>
                            <div className="text-amber-200">[NO₂] = {eqState.concNO2} mol/L</div>
                            <div className="text-[10px] text-white/90">
                              Optical Absorbance: A = {eqState.opticalAbsorbance}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Directional Shift Status Badge */}
                      <div className="mt-4 px-4 py-1.5 rounded-full bg-slate-800 text-xs font-mono font-bold text-slate-200 border border-slate-700">
                        {eqState.shiftDirection === 'forward' && '➡️ Le Chatelier: Forward Shift (Forming Darker NO₂)'}
                        {eqState.shiftDirection === 'reverse' && '⬅️ Le Chatelier: Reverse Shift (Forming Colorless N₂O₄)'}
                        {eqState.shiftDirection === 'at_equilibrium' && '⚖️ Dynamic Equilibrium Reached (Qc ≈ Kc)'}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right: Controls & Parameters (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="py-3 px-4 border-b border-slate-100">
                      <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-rose-600" />
                        Reaction Vessel Controls
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-5 text-xs">
                      {/* Temperature Slider */}
                      <div>
                        <div className="flex justify-between font-mono font-bold mb-1">
                          <span className="text-slate-700">Temperature (T):</span>
                          <span className="text-rose-600 font-extrabold">
                            {eqTempK.toFixed(0)} K ({(eqTempK - 273.15).toFixed(0)} °C)
                          </span>
                        </div>
                        <input
                          type="range"
                          min="250"
                          max="420"
                          step="5"
                          value={eqTempK}
                          onChange={(e) => setEqTempK(parseFloat(e.target.value))}
                          className="w-full accent-rose-600 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-500">
                          Endothermic reaction: Heating increases Kc, shifting equilibrium to dark brown NO₂.
                        </span>
                      </div>

                      {/* Volume / Pressure Slider */}
                      <div>
                        <div className="flex justify-between font-mono font-bold mb-1">
                          <span className="text-slate-700">Vessel Volume (V):</span>
                          <span className="text-sky-600 font-extrabold">{eqVolumeL.toFixed(1)} Liters</span>
                        </div>
                        <input
                          type="range"
                          min="0.5"
                          max="5.0"
                          step="0.1"
                          value={eqVolumeL}
                          onChange={(e) => setEqVolumeL(parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                        <span className="text-[10px] text-slate-500">
                          Compression increases pressure: Le Chatelier shifts equilibrium toward fewer gas moles (N₂O₄).
                        </span>
                      </div>

                      {/* Preset Action Buttons */}
                      <div className="pt-2 border-t border-slate-100 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setEqTempK(373.15); // 100 °C boiling water bath
                          }}
                        >
                          🔥 Hot Water Bath (100°C)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setEqTempK(273.15); // 0 °C ice bath
                          }}
                        >
                          ❄️ Ice Bath (0°C)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* KaTeX Formulas Card */}
                  <Card className="border-slate-200 shadow-xs bg-slate-50">
                    <CardHeader className="py-2.5 px-4 border-b border-slate-200">
                      <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Mathematical Equilibrium Principles
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 text-xs space-y-2 font-mono text-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Equilibrium Constant:</span>
                        <MathView math="K_c = \frac{[\text{NO}_2]^2}{[\text{N}_2\text{O}_4]}, \quad Q_c = \frac{c_{\text{NO}_2}^2}{c_{\text{N}_2\text{O}_4}}" />
                      </div>
                      <div className="pt-1 border-t border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Van &apos;t Hoff Equation:</span>
                        <MathView math="\ln\left(\frac{K_2}{K_1}\right) = -\frac{\Delta H^\circ}{R}\left(\frac{1}{T_2} - \frac{1}{T_1}\right)" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: ELECTROCHEMISTRY & GALVANIC CELL (DANIELL CELL) */}
          {/* ============================================================ */}
          {activeExpId === 'electrochem' && (
            <motion.div
              key="electrochem"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-100 text-sky-800">
                      NCERT Class 12 Chapter 3
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-mono text-slate-500">Benchmark: IIT Delhi & Amrita University</span>
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Galvanic Daniell Cell: Zn(s) | Zn²⁺(aq) || Cu²⁺(aq) | Cu(s)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl">
                    Simulate spontaneous redox conversion of chemical free energy into electrical work, verify Nernst
                    equation across arbitrary ion molarities, and observe salt bridge counter-ion transport.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Measured EMF</span>
                    <span className="text-sm font-extrabold font-mono text-sky-700">{cellState.eCellV} V</span>
                  </div>
                  <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-center">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block">Gibbs ΔG°</span>
                    <span className="text-sm font-extrabold font-mono text-emerald-700">
                      {(cellState.deltaGJ / 1000).toFixed(1)} kJ/mol
                    </span>
                  </div>
                </div>
              </div>

              {/* Daniell Cell Workbench */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Visual Apparatus (7 cols) */}
                <div className="lg:col-span-7">
                  <Card className="border-slate-200 shadow-sm bg-white overflow-hidden">
                    <CardHeader className="py-3 px-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                      <CardTitle className="text-sm font-bold text-slate-800">
                        Electrochemical Daniell Cell Apparatus
                      </CardTitle>
                      <span className="text-xs font-mono font-bold text-sky-700">
                        E°cell = +1.10 V | I = {cellState.currentMa.toFixed(1)} mA
                      </span>
                    </CardHeader>

                    <CardContent className="p-6 bg-slate-900 flex flex-col items-center justify-center">
                      {/* Top Digital Voltmeter */}
                      <div className="w-48 bg-slate-800 border-2 border-slate-700 rounded-lg p-3 text-center shadow-lg mb-6">
                        <span className="text-[9px] font-mono text-slate-400 uppercase block">Digital Voltmeter</span>
                        <span className="text-2xl font-black font-mono text-emerald-400">
                          {cellState.eCellV.toFixed(3)} V
                        </span>
                      </div>

                      {/* Dual Beakers & Salt Bridge */}
                      <div className="relative flex items-center justify-center gap-10">
                        {/* Left Beaker: Zinc Anode Half-Cell */}
                        <div className="w-36 h-44 border-4 border-slate-400 rounded-b-2xl bg-sky-950/40 relative flex flex-col items-center justify-end p-2 shadow-inner">
                          {/* Zinc Electrode Strip */}
                          <div className="w-6 h-32 bg-slate-300 border border-slate-500 rounded-t absolute top-2 shadow-md flex items-center justify-center">
                            <span className="text-[8px] font-mono font-bold text-slate-800 -rotate-90">Zn ANODE (-)</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-sky-200 bg-black/40 px-1 rounded z-10">
                            [Zn²⁺] = {anodeZnConc.toFixed(2)} M
                          </span>
                        </div>

                        {/* Salt Bridge (Inverted U-Tube with KCl agar) */}
                        <div className="absolute top-8 w-28 h-20 border-8 border-b-0 border-amber-300/80 rounded-t-3xl pointer-events-none flex items-center justify-center">
                          <span className="text-[8px] font-mono font-extrabold text-amber-950 bg-amber-200 px-1 rounded -mt-6">
                            KCl SALT BRIDGE
                          </span>
                        </div>

                        {/* Right Beaker: Copper Cathode Half-Cell */}
                        <div className="w-36 h-44 border-4 border-slate-400 rounded-b-2xl bg-blue-900/40 relative flex flex-col items-center justify-end p-2 shadow-inner">
                          {/* Copper Electrode Strip */}
                          <div className="w-6 h-32 bg-amber-600 border border-amber-800 rounded-t absolute top-2 shadow-md flex items-center justify-center">
                            <span className="text-[8px] font-mono font-bold text-white -rotate-90">Cu CATHODE (+)</span>
                          </div>
                          <span className="text-[10px] font-mono font-bold text-blue-200 bg-black/40 px-1 rounded z-10">
                            [Cu²⁺] = {cathodeCuConc.toFixed(2)} M
                          </span>
                        </div>
                      </div>

                      {/* Direction of Electron Flow Banner */}
                      <div className="mt-6 text-xs font-mono font-bold text-slate-300 bg-slate-800/90 px-4 py-1.5 rounded-full border border-slate-700">
                        ⚡ Electron Flow: Zn Anode (-) ──► External Circuit ──► Cu Cathode (+)
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Controls & Nernst Equation (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <Card className="border-slate-200 shadow-sm bg-white">
                    <CardHeader className="py-3 px-4 border-b border-slate-100">
                      <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <Sliders className="w-4 h-4 text-sky-600" />
                        Electrolyte Concentration Sliders
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="p-4 space-y-5 text-xs">
                      <div>
                        <div className="flex justify-between font-mono font-bold mb-1">
                          <span className="text-slate-700">Zinc Ion [Zn²⁺]:</span>
                          <span className="text-sky-700 font-extrabold">{anodeZnConc.toFixed(2)} M</span>
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="2.0"
                          step="0.05"
                          value={anodeZnConc}
                          onChange={(e) => setAnodeZnConc(parseFloat(e.target.value))}
                          className="w-full accent-sky-600 cursor-pointer"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between font-mono font-bold mb-1">
                          <span className="text-slate-700">Copper Ion [Cu²⁺]:</span>
                          <span className="text-amber-700 font-extrabold">{cathodeCuConc.toFixed(2)} M</span>
                        </div>
                        <input
                          type="range"
                          min="0.01"
                          max="2.0"
                          step="0.05"
                          value={cathodeCuConc}
                          onChange={(e) => setCathodeCuConc(parseFloat(e.target.value))}
                          className="w-full accent-amber-600 cursor-pointer"
                        />
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => {
                            setAnodeZnConc(1.0);
                            setCathodeCuConc(1.0);
                          }}
                        >
                          Reset to Standard 1.0 M
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Nernst Formula Card */}
                  <Card className="border-slate-200 shadow-xs bg-slate-50">
                    <CardHeader className="py-2.5 px-4 border-b border-slate-200">
                      <CardTitle className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Nernst Equation & Thermodynamics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 text-xs space-y-2 font-mono text-slate-800">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Cell Potential:</span>
                        <MathView math="E_{\text{cell}} = E^\circ_{\text{cell}} - \frac{0.0591}{n} \log_{10}\left(\frac{[\text{Zn}^{2+}]}{[\text{Cu}^{2+}]}\right)" />
                      </div>
                      <div className="pt-1 border-t border-slate-200">
                        <span className="text-[10px] text-slate-500 block">Gibbs Free Energy:</span>
                        <MathView math="\Delta G = -n F E_{\text{cell}}, \quad \Delta G^\circ = -n F E^\circ_{\text{cell}}" />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
