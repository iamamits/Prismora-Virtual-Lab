/**
 * Prismora ECE Virtual Lab — Component Palette
 * Searchable palette of logic gates, power rails, input switches, and measurement probes.
 */

'use client';

import React, { useState } from 'react';
import {
  CircuitComponentType,
  createComponent,
} from '@prismora/simulation-core';
import { Plus, Search, Zap } from 'lucide-react';

interface ComponentPaletteProps {
  onAddComponent: (type: CircuitComponentType, label: string) => void;
}

interface PaletteItem {
  type: CircuitComponentType;
  label: string;
  category: 'Inputs' | 'Gates' | 'Outputs';
  description: string;
}

const PALETTE_ITEMS: PaletteItem[] = [
  // Inputs
  { type: 'INPUT_SWITCH', label: 'Toggle Switch', category: 'Inputs', description: 'Interactive 0/1 binary switch' },
  { type: 'VCC', label: 'VCC (+5V)', category: 'Inputs', description: 'Constant Logic HIGH rail' },
  { type: 'GND', label: 'GND (0V)', category: 'Inputs', description: 'Constant Logic LOW rail' },
  { type: 'CLOCK', label: 'Clock Pulse', category: 'Inputs', description: 'Periodic digital square wave' },

  // Gates
  { type: 'XOR', label: 'XOR Gate', category: 'Gates', description: 'Y = A ⊕ B (Modulo-2 addition)' },
  { type: 'AND', label: 'AND Gate', category: 'Gates', description: 'Y = A · B (Conjunction)' },
  { type: 'OR', label: 'OR Gate', category: 'Gates', description: 'Y = A + B (Disjunction)' },
  { type: 'NOT', label: 'NOT Inverter', category: 'Gates', description: 'Y = A̅ (Negation)' },
  { type: 'NAND', label: 'NAND Gate', category: 'Gates', description: 'Universal gate: Y = (A · B)̅' },
  { type: 'NOR', label: 'NOR Gate', category: 'Gates', description: 'Universal gate: Y = (A + B)̅' },
  { type: 'XNOR', label: 'XNOR Gate', category: 'Gates', description: 'Equivalence: Y = (A ⊕ B)̅' },

  // Outputs
  { type: 'OUTPUT_LED', label: 'Output LED', category: 'Outputs', description: 'Visual logic level indicator' },
  { type: 'LOGIC_PROBE', label: 'Logic Probe', category: 'Outputs', description: 'Voltage & state probe' },
];

export const ComponentPalette: React.FC<ComponentPaletteProps> = ({ onAddComponent }) => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | 'Inputs' | 'Gates' | 'Outputs'>('All');

  const filtered = PALETTE_ITEMS.filter((item) => {
    const matchSearch =
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase()) ||
      item.type.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'All' || item.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 p-3 select-none w-64 shrink-0 shadow-sm">
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
        <span className="text-xs font-bold uppercase tracking-wider text-zinc-600">
          Component Library
        </span>
        <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {PALETTE_ITEMS.length} Parts
        </span>
      </div>

      {/* Search Input */}
      <div className="relative mb-2.5">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search components..."
          className="w-full bg-zinc-50 border border-zinc-200 rounded-md pl-8 pr-2.5 py-1 text-xs text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1 mb-3">
        {(['All', 'Gates', 'Inputs', 'Outputs'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex-1 py-1 rounded text-[11px] font-bold transition-colors ${
              activeCategory === cat
                ? 'bg-blue-600 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Component Cards List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 pr-0.5 custom-scrollbar min-h-0">
        {filtered.map((item) => (
          <div
            key={item.type}
            onClick={() => onAddComponent(item.type, item.label)}
            className="group flex items-center justify-between p-2 rounded-lg bg-white hover:bg-zinc-50 border border-zinc-200 hover:border-blue-400 cursor-pointer transition-all shadow-xs"
          >
            <div className="flex flex-col min-w-0 pr-1.5">
              <span className="text-xs font-bold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                {item.label}
              </span>
              <span className="text-[10px] text-zinc-500 truncate">
                {item.description}
              </span>
            </div>
            <button
              className="p-1 rounded bg-zinc-100 group-hover:bg-blue-600 text-zinc-600 group-hover:text-white transition-colors shrink-0"
              title="Add to Canvas"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
