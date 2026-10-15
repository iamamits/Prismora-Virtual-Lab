'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@prismora/ui';
import { Plus, Trash2, Bookmark } from 'lucide-react';
import type { ProjectileMotionParameters, ProjectileMotionState } from '@prismora/simulation-core';

export interface Observation {
  id: string;
  timestamp: string;
  simTime: number;
  note: string;
  snapshot: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
  };
}

export interface ObservationPanelProps {
  parameters: ProjectileMotionParameters;
  currentState: ProjectileMotionState;
  observations: Observation[];
  onAddObservation: (obs: Observation) => void;
  onDeleteObservation: (id: string) => void;
  className?: string;
}

export const ObservationPanel: React.FC<ObservationPanelProps> = ({
  currentState,
  observations,
  onAddObservation,
  onDeleteObservation,
  className = '',
}) => {
  const [newNote, setNewNote] = useState('');

  const handleAdd = () => {
    if (!newNote.trim()) return;

    const obs: Observation = {
      id: `obs-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      simTime: currentState.time,
      note: newNote.trim(),
      snapshot: {
        x: currentState.position.x,
        y: currentState.position.y,
        vx: currentState.velocity.x,
        vy: currentState.velocity.y,
        speed: currentState.speed,
      },
    };

    onAddObservation(obs);
    setNewNote('');
  };

  return (
    <Card className={`border-zinc-200 dark:border-zinc-800 ${className}`}>
      <CardHeader className="py-2.5 px-3 border-b border-zinc-100 dark:border-zinc-800 flex flex-row items-center justify-between">
        <CardTitle className="text-xs uppercase tracking-wider text-zinc-500 font-semibold flex items-center gap-1.5">
          <Bookmark className="w-3.5 h-3.5 text-indigo-500" />
          <span>Experiment Observations &amp; Log</span>
        </CardTitle>
        <span className="text-[11px] text-zinc-400 font-mono">
          {observations.length} {observations.length === 1 ? 'entry' : 'entries'}
        </span>
      </CardHeader>
      <CardContent className="p-3 space-y-3">
        {/* Input box */}
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Record hypothesis, observation, or reading..."
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 text-xs px-2.5 py-1.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newNote.trim()}
            className="text-xs px-2.5 py-1.5"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            Log
          </Button>
        </div>

        {/* Observations list */}
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
          {observations.length === 0 ? (
            <p className="text-xs text-zinc-400 text-center py-4 italic">
              No observations recorded yet. Take measurements at key points along the trajectory.
            </p>
          ) : (
            observations.map((obs) => (
              <div
                key={obs.id}
                className="p-2 rounded bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 text-xs space-y-1"
              >
                <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                  <span>
                    Sim t = <strong className="text-indigo-500">{obs.simTime.toFixed(2)}s</strong> ({obs.timestamp})
                  </span>
                  <button
                    onClick={() => onDeleteObservation(obs.id)}
                    className="text-zinc-400 hover:text-red-500 transition-colors p-0.5"
                    aria-label="Delete observation"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-zinc-800 dark:text-zinc-200 font-sans font-medium">
                  {obs.note}
                </div>
                <div className="text-[10px] font-mono text-zinc-500 flex gap-3 pt-0.5">
                  <span>x: {obs.snapshot.x.toFixed(2)}m</span>
                  <span>y: {obs.snapshot.y.toFixed(2)}m</span>
                  <span>|v|: {obs.snapshot.speed.toFixed(2)}m/s</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
