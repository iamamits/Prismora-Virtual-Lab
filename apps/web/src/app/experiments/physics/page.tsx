/**
 * Prismora Physical Sciences Virtual Laboratory
 * Comprehensive Multi-Experiment Virtual Laboratory Workbench
 *
 * Benchmark Institutions: IIT Bombay, IIT Delhi & Amrita Vishwa Vidyapeetham
 * Experiments:
 * 1. Einstein's Photoelectric Effect & Planck's Constant (PH-201)
 * 2. Young's Double-Slit Interference & Wave Optics (PH-202)
 * 3. Ideal Kinematics & Celestial Gravity (PH-101)
 */

'use client';

import React, { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  PhotoelectricEngine,
  CATHODE_METALS,
  type CathodeMetal,
  type PhotoelectricParameters,
} from '@prismora/simulation-core';
import {
  Activity,
  ArrowRight,
  Atom,
  BookOpen,
  ChevronRight,
  Download,
  Lightbulb,
  RotateCcw,
  Sliders,
  Sparkles,
  Sun,
  Zap,
} from 'lucide-react';

export default function PhysicsWorkbenchPage() {
  const [selectedMetal, setSelectedMetal] = useState<CathodeMetal>('cesium');
  const [wavelengthNm, setWavelengthNm] = useState<number>(420);
  const [intensityPercent, setIntensityPercent] = useState<number>(75);
  const [appliedVoltageV, setAppliedVoltageV] = useState<number>(-0.8);

  const peResult = useMemo(
    () =>
      PhotoelectricEngine.compute({
        metal: selectedMetal,
        wavelengthNm,
        intensityPercent,
        appliedVoltageV,
      }),
    [selectedMetal, wavelengthNm, intensityPercent, appliedVoltageV],
  );

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-zinc-900 flex flex-col font-sans">
      {/* Top Header */}
      <header className="border-b border-zinc-200 bg-white/95 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Link href="/" className="hover:text-blue-600 transition-colors">Prismora</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/library" className="hover:text-blue-600 transition-colors">Disciplines</Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-bold text-zinc-900">Physical Sciences Lab</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-bold">
              PH-201 (Modern Physics)
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 font-semibold">
              IIT Bombay & Amrita University
            </span>
            <BugReportModal simulationId="physics-photoelectric" moduleName="Photoelectric Effect" />
          </div>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button className="px-3.5 py-2 rounded-lg text-xs font-bold text-zinc-900 bg-zinc-100 shadow-2xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Photoelectric Effect</span>
          </button>
          <Link
            href="/experiments/physics/wave-optics"
            className="px-3.5 py-2 rounded-lg text-xs font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 flex items-center gap-2 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Wave Optics & Double Slit</span>
          </Link>
          <Link
            href="/experiments/projectile-motion"
            className="px-3.5 py-2 rounded-lg text-xs font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 flex items-center gap-2 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Projectile Motion & Celestial Gravity</span>
          </Link>
        </div>
      </header>

      {/* Main Workbench Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>Einstein&apos;s Photoelectric Effect &amp; Planck&apos;s Constant</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-600 mt-1 max-w-3xl leading-relaxed">
              Irradiate metal targets with monochromatic photons, measure stopping potential Vs, determine cut-off frequencies, and verify Einstein&apos;s photoelectric equation.
            </p>
          </div>
        </div>

        {/* Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Plot & Phototube Visualizer */}
          <div className="lg:col-span-8 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <span className="text-xs font-mono font-bold text-zinc-600 uppercase">Phototube Current vs Voltage (I-V)</span>
                <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold border ${
                  peResult.isEmissionPossible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {peResult.isEmissionPossible ? 'Photoemission Active' : 'No Emission (hν < Φ)'}
                </span>
              </div>

              {/* SVG I-V Curve */}
              <div className="h-64 rounded-xl bg-zinc-900 border border-zinc-800 p-4 relative overflow-hidden flex flex-col justify-between">
                <div className="flex justify-between text-[10px] font-mono text-zinc-400">
                  <span className="text-amber-400 font-bold">Photocurrent I (µA) vs Retarding/Accelerating Voltage V (Volts)</span>
                  <span className="text-emerald-400 font-bold">Stopping Potential Vs = {peResult.stoppingPotentialV} V</span>
                </div>

                <svg className="w-full h-44" viewBox="0 0 400 120">
                  <line x1="30" y1="100" x2="380" y2="100" stroke="#334155" strokeWidth="1" />
                  <line x1="200" y1="10" x2="200" y2="100" stroke="#475569" strokeWidth="1" strokeDasharray="3 3" />
                  {(() => {
                    const maxI = Math.max(1, peResult.saturationCurrentUa * 1.25);
                    const pts = peResult.ivCurve
                      .map((p) => {
                        const x = 30 + ((p.voltageV + 4) / 8) * 350;
                        const y = 100 - (p.currentMicroAmps / maxI) * 85;
                        return `${x.toFixed(1)},${y.toFixed(1)}`;
                      })
                      .join(' ');

                    const currX = 30 + ((appliedVoltageV + 4) / 8) * 350;
                    const currY = 100 - (peResult.currentPhotocurrentUa / maxI) * 85;

                    return (
                      <>
                        <polyline fill="none" stroke="#F59E0B" strokeWidth="2.5" points={pts} />
                        <circle cx={currX} cy={currY} r="5" fill="#EAB308" stroke="#FFFFFF" strokeWidth="2" />
                      </>
                    );
                  })()}
                </svg>

                <div className="flex justify-between text-[9px] font-mono text-zinc-500">
                  <span>V = -4.0 V (Retarding)</span>
                  <span>-Vs = -{peResult.stoppingPotentialV} V (Cut-off)</span>
                  <span>V = 0 V</span>
                  <span>V = +4.0 V (Saturation Isat = {peResult.saturationCurrentUa} µA)</span>
                </div>
              </div>

              {/* Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Photon Energy hν</span>
                  <span className="text-base font-mono font-black text-amber-600">{peResult.photonEnergyEv} eV</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Work Function Φ</span>
                  <span className="text-base font-mono font-black text-zinc-900">{peResult.workFunctionEv} eV</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Max Kinetic Kmax</span>
                  <span className="text-base font-mono font-black text-emerald-600">{peResult.maxKineticEnergyEv} eV</span>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-center">
                  <span className="text-[10px] font-mono text-zinc-500 uppercase block">Photocurrent</span>
                  <span className="text-base font-mono font-black text-blue-600">{peResult.currentPhotocurrentUa} µA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-5 rounded-2xl bg-white border border-zinc-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-700 uppercase">
                <Sliders className="w-4 h-4 text-amber-600" />
                <span>Phototube & Laser Setup</span>
              </div>

              {/* Cathode Metal Selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-mono text-zinc-600">Cathode Metal Target:</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {(['cesium', 'sodium', 'potassium', 'zinc', 'copper'] as CathodeMetal[]).map((metal) => (
                    <button
                      key={metal}
                      onClick={() => setSelectedMetal(metal)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold text-left border transition-all ${
                        selectedMetal === metal
                          ? 'border-amber-500 bg-amber-50 text-amber-900'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      {CATHODE_METALS[metal].name} (Φ = {CATHODE_METALS[metal].workFunctionEv} eV)
                    </button>
                  ))}
                </div>
              </div>

              {/* Sliders */}
              <div className="space-y-3 text-xs pt-2">
                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-zinc-600">Light Wavelength (λ):</span>
                    <span className="font-bold text-amber-600">{wavelengthNm} nm</span>
                  </div>
                  <input
                    type="range"
                    min="250"
                    max="700"
                    step="5"
                    value={wavelengthNm}
                    onChange={(e) => setWavelengthNm(parseInt(e.target.value))}
                    className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-zinc-600">Light Intensity:</span>
                    <span className="font-bold text-zinc-900">{intensityPercent}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={intensityPercent}
                    onChange={(e) => setIntensityPercent(parseInt(e.target.value))}
                    className="w-full accent-amber-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                  />
                </div>

                <div>
                  <div className="flex justify-between font-mono mb-1">
                    <span className="text-zinc-600">Applied Voltage (V):</span>
                    <span className="font-bold text-blue-600">{appliedVoltageV.toFixed(2)} V</span>
                  </div>
                  <input
                    type="range"
                    min="-3.5"
                    max="3.5"
                    step="0.1"
                    value={appliedVoltageV}
                    onChange={(e) => setAppliedVoltageV(parseFloat(e.target.value))}
                    className="w-full accent-blue-600 h-1.5 bg-zinc-200 rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              {/* Equations */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/80 space-y-2">
                <span className="text-[10px] font-mono font-bold text-amber-800 uppercase block">Photoelectric Theory</span>
                <div className="text-xs text-zinc-800 py-1">
                  <MathView math="e V_s = h\nu - \Phi = \frac{hc}{\lambda} - \Phi" display={false} />
                </div>
                <div className="text-xs text-zinc-800 py-1">
                  <MathView math="K_{max} = \frac{1}{2} m_e v_{max}^2 = e V_s" display={false} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
