'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, CheckCircle2, Clock, Eye } from 'lucide-react';
import { Button, MathView, sanitizeToCleanMathText } from '@prismora/ui';
import { SimulationPreview } from './simulation-preview';
import type { SimulationRegistryEntry } from '@/lib/simulations/registry';

interface SimulationCardProps {
  simulation: SimulationRegistryEntry;
  onSelectConcept?: (sim: SimulationRegistryEntry) => void;
  featured?: boolean;
}

export function SimulationCard({
  simulation,
  onSelectConcept,
  featured = false,
}: SimulationCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const isAvailable = simulation.status === 'available';

  const handleCardClick = (e: React.MouseEvent) => {
    if (!isAvailable && onSelectConcept) {
      e.preventDefault();
      onSelectConcept(simulation);
    }
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative flex flex-col justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0F172A] overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 h-full ${
        featured ? 'lg:col-span-2' : ''
      }`}
    >
      {/* 1. Large Experiment Visualization (60-65% visual weight) */}
      <div className="relative w-full aspect-[16/10] bg-[#0B1120] overflow-hidden border-b border-zinc-100 dark:border-zinc-800">
        <SimulationPreview
          simId={simulation.id}
          category={simulation.category}
          isHovered={isHovered}
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* Discipline & Category Pill */}
          <span
            className="text-[10px] font-mono font-bold px-2 py-0.5 rounded shadow-xs truncate max-w-[170px]"
            title={simulation.category}
            style={{
              backgroundColor: simulation.disciplineColor,
              color: '#FFFFFF',
            }}
          >
            {simulation.category}
          </span>

          {/* Status Indicator */}
          {isAvailable ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/90 text-white shadow-xs flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>Available</span>
            </span>
          ) : simulation.status === 'in_development' ? (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/90 text-white shadow-xs font-mono">
              In Dev
            </span>
          ) : (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700 font-mono">
              Planned
            </span>
          )}
        </div>

        {/* Bottom subtle equation preview if available */}
        {simulation.equations && simulation.equations.length > 0 && (
          <div className="absolute bottom-2.5 left-3 right-3 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="px-2 py-0.5 rounded bg-black/80 text-zinc-100 border border-zinc-700/60 backdrop-blur-xs inline-flex items-center max-w-full overflow-x-auto shadow-md">
              <MathView
                math={simulation.equations[0]}
                size="xs"
                className="text-zinc-100"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Metadata & Actions (35-40% visual weight) */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-medium">
            <span>Difficulty: <strong className="text-zinc-700 dark:text-zinc-300">{simulation.difficulty}</strong></span>
            {simulation.capabilities && (
              <span className="font-mono text-[11px] text-zinc-400">
                {simulation.capabilities.length} tools
              </span>
            )}
          </div>

          <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
            {simulation.title}
          </h3>

          <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {simulation.description}
          </p>
        </div>

        {/* Card Footer: Action Button */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2">
          {simulation.equations && simulation.equations.length > 0 ? (
            <div
              className="flex items-center gap-1.5 max-w-[170px] overflow-hidden"
              title={sanitizeToCleanMathText(simulation.equations[0])}
            >
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 shrink-0 font-mono">
                Model:
              </span>
              <MathView
                math={simulation.equations[0]}
                size="xs"
                className="text-zinc-600 dark:text-zinc-300 font-medium truncate"
                ariaLabel={`Governing formula: ${simulation.title}`}
              />
            </div>
          ) : (
            <span className="text-[11px] text-zinc-400 font-medium">
              Verified Scientific Model
            </span>
          )}

          {isAvailable ? (
            <Link href={simulation.route}>
              <Button
                size="sm"
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-3.5 h-8 rounded-lg shadow-xs flex items-center gap-1.5 group-hover:translate-x-0.5 transition-transform"
              >
                <span>Launch Lab</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={handleCardClick}
              className="text-xs font-semibold px-3 h-8 border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-zinc-400" />
              <span>View Concept</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
