'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { X, Sparkles, BookOpen, CheckCircle2, ArrowRight, Layers, ExternalLink, Calendar } from 'lucide-react';
import { Button, MathView } from '@prismora/ui';
import { SimulationPreview } from './simulation-preview';
import type { SimulationRegistryEntry } from '@/lib/simulations/registry';

interface ExperimentConceptModalProps {
  simulation: SimulationRegistryEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ExperimentConceptModal({
  simulation,
  isOpen,
  onClose,
}: ExperimentConceptModalProps) {
  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !simulation) return null;

  const isAvailable = simulation.status === 'available';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs select-none animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="concept-modal-title"
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-[#0F172A] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Preview Bar */}
        <div className="relative w-full aspect-[16/9] bg-[#0B1120] border-b border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <SimulationPreview simId={simulation.id} category={simulation.category} isHovered={true} />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-colors backdrop-blur-xs"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full border shadow-sm flex items-center gap-1.5 ${
                isAvailable
                  ? 'bg-emerald-500/90 text-white border-emerald-400'
                  : simulation.status === 'in_development'
                  ? 'bg-amber-500/90 text-white border-amber-400'
                  : 'bg-zinc-800/90 text-zinc-200 border-zinc-600'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-white' : 'bg-amber-300'}`} />
              <span>{isAvailable ? 'Fully Functional Lab' : simulation.status === 'in_development' ? 'In Active Development' : 'Curriculum Roadmap Concept'}</span>
            </span>
          </div>

          {/* Discipline pill */}
          <div className="absolute bottom-3 left-3">
            <span
              className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded shadow-sm"
              style={{
                backgroundColor: simulation.disciplineColor,
                color: '#FFFFFF',
              }}
            >
              {simulation.category}
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          <div>
            <h2 id="concept-modal-title" className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              {simulation.title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 mt-2 leading-relaxed">
              {simulation.description}
            </p>
          </div>

          {/* Scientific Equations if available */}
          {simulation.equations && simulation.equations.length > 0 && (
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-1.5">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block">
                Governing Analytical Models:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {simulation.equations.map((eq, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-lg bg-white dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 shadow-xs max-w-full overflow-x-auto flex items-center justify-center text-center"
                  >
                    <MathView
                      math={eq}
                      display
                      size="sm"
                      className="text-blue-700 dark:text-cyan-300 font-semibold"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Learning Objectives */}
          {simulation.learningObjectives && simulation.learningObjectives.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                <span>Academic Learning Objectives</span>
              </h3>
              <ul className="grid grid-cols-1 gap-2 text-xs text-zinc-700 dark:text-zinc-300">
                {simulation.learningObjectives.map((obj, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{obj}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Capabilities */}
          {simulation.capabilities && simulation.capabilities.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>Simulation Capabilities</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {simulation.capabilities.map((cap, i) => (
                  <span
                    key={i}
                    className="text-xs font-mono px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700"
                  >
                    {cap}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 px-6 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-[#070D1A] flex items-center justify-between gap-3">
          <div className="text-xs text-zinc-500 dark:text-zinc-400">
            Difficulty: <strong className="text-zinc-800 dark:text-zinc-200">{simulation.difficulty}</strong>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs font-semibold">
              Close Preview
            </Button>

            {isAvailable ? (
              <Link href={simulation.route}>
                <Button size="sm" className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs shadow-sm">
                  <span>Launch Laboratory</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            ) : (
              <Link href="/experiments/projectile-motion">
                <Button size="sm" className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs">
                  <span>Explore Working Labs</span>
                  <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
