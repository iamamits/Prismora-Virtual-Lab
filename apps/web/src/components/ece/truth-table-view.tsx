/**
 * Prismora ECE Virtual Lab — Live Truth Table & Automated Verifier
 * Synchronized truth table highlighting active input state, one-click row selection,
 * auto-stepping, and analytical circuit verification.
 */

'use client';

import React, { useState } from 'react';
import {
  CircuitEvaluationResult,
  CircuitGraph,
  FULL_ADDER_SPEC,
  HALF_ADDER_SPEC,
  TruthTableVerificationReport,
  TruthTableVerifier,
} from '@prismora/simulation-core';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  XCircle,
} from 'lucide-react';

interface TruthTableViewProps {
  mode: 'half-adder' | 'full-adder';
  graph: CircuitGraph;
  evalResult: CircuitEvaluationResult;
  onSetInputs: (inputs: Record<string, 0 | 1>) => void;
}

export const TruthTableView: React.FC<TruthTableViewProps> = ({
  mode,
  graph,
  evalResult,
  onSetInputs,
}) => {
  const isFullAdder = mode === 'full-adder';
  const spec = isFullAdder ? FULL_ADDER_SPEC : HALF_ADDER_SPEC;

  const [verificationReport, setVerificationReport] = useState<TruthTableVerificationReport | null>(
    null,
  );
  const [isVerifying, setIsVerifying] = useState(false);

  // Auto-Step Sequencer State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Read current input switch states from graph
  const currentInputs: Record<string, 0 | 1> = {};
  for (const name of spec.inputNames) {
    const sw = graph.components.find(
      (c) =>
        c.type === 'INPUT_SWITCH' &&
        (c.label.toLowerCase().includes(name.toLowerCase()) ||
          c.id.toLowerCase().includes(name.toLowerCase())),
    );
    currentInputs[name] = (sw?.state?.switchState === 1 ? 1 : 0) as 0 | 1;
  }

  // Read current output LED states from evalResult
  const currentOutputs: Record<string, any> = {};
  for (const name of spec.outputNames) {
    const led = graph.components.find(
      (c) =>
        c.type === 'OUTPUT_LED' &&
        (c.label.toLowerCase().includes(name.toLowerCase()) ||
          c.id.toLowerCase().includes(name.toLowerCase())),
    );
    if (led?.inputs[0]?.id) {
      currentOutputs[name] = evalResult.terminalSignals[led.inputs[0].id] ?? 'FLOATING';
    } else {
      currentOutputs[name] = 'FLOATING';
    }
  }

  const numInputs = spec.inputNames.length;
  const totalRows = Math.pow(2, numInputs);

  interface TruthRowItem {
    index: number;
    inputs: Record<string, 0 | 1>;
    expected: Record<string, 0 | 1>;
    isActive: boolean;
  }
  const rows: TruthRowItem[] = [];

  for (let i = 0; i < totalRows; i++) {
    const inVec: Record<string, 0 | 1> = {};
    for (let bit = 0; bit < numInputs; bit++) {
      const name = spec.inputNames[bit]!;
      const val = ((i >> (numInputs - 1 - bit)) & 1) as 0 | 1;
      inVec[name] = val;
    }
    const expected = spec.evaluateExpected(inVec);

    // Is this the currently active combination on the circuit?
    const isActive = spec.inputNames.every((name) => currentInputs[name] === inVec[name]);

    rows.push({
      index: i,
      inputs: inVec,
      expected,
      isActive,
    });
  }

  // Handle Verify Action
  const handleVerify = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const report = TruthTableVerifier.verify(graph, spec);
      setVerificationReport(report);
      setIsVerifying(false);
    }, 200);
  };

  // Auto-Step Sequencer
  const handleStepNext = () => {
    const nextIdx = (currentStepIdx + 1) % totalRows;
    setCurrentStepIdx(nextIdx);
    const targetRow = rows[nextIdx];
    if (targetRow) {
      onSetInputs(targetRow.inputs);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-zinc-200 p-3 select-none w-80 shrink-0">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-200">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-[#06B6D4]" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-900">
            {isFullAdder ? 'Full Adder' : 'Half Adder'} Truth Table
          </span>
        </div>
        <button
          onClick={handleStepNext}
          title="Step to next input combination"
          className="text-[11px] font-bold text-zinc-600 hover:text-zinc-900 px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 transition-colors flex items-center gap-1 border border-zinc-200"
        >
          <span>Step</span>
          <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* Verification Status Banner */}
      {verificationReport && (
        <div
          className={`p-2 rounded-lg mb-2.5 border text-xs flex items-start gap-2 shadow-xs ${
            verificationReport.allPassed
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {verificationReport.allPassed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          )}
          <div className="flex flex-col">
            <span className="font-bold">
              {verificationReport.allPassed
                ? 'Circuit Scientifically Validated!'
                : 'Wiring Discrepancy Detected'}
            </span>
            <span className="text-[11px] opacity-90">
              {verificationReport.passedCount} / {verificationReport.totalCount} combinations verified
            </span>
          </div>
        </div>
      )}

      {/* Table Container */}
      <div className="flex-1 overflow-y-auto pr-0.5 custom-scrollbar min-h-0 border border-zinc-200 rounded-lg overflow-hidden bg-white">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-mono text-[11px]">
              <th className="py-1.5 px-2 text-center w-6">#</th>
              {spec.inputNames.map((name) => (
                <th key={name} className="py-1.5 px-2 text-center font-bold text-[#0891B2]">
                  {name}
                </th>
              ))}
              <th className="py-1.5 px-1 text-zinc-400 text-center font-normal">|</th>
              {spec.outputNames.map((name) => (
                <th key={name} className="py-1.5 px-2 text-center font-bold text-[#16A34A]">
                  {name}
                </th>
              ))}
              {verificationReport && (
                <th className="py-1.5 px-2 text-center w-8 text-zinc-500 font-normal">Check</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 font-mono text-[11px]">
            {rows.map((row) => {
              const reportRow = verificationReport?.rows[row.index];

              return (
                <tr
                  key={row.index}
                  onClick={() => onSetInputs(row.inputs)}
                  className={`cursor-pointer transition-colors ${
                    row.isActive
                      ? 'bg-blue-50 text-blue-950 font-bold ring-1 ring-blue-300'
                      : 'hover:bg-zinc-50 text-zinc-700'
                  }`}
                  title="Click to apply these inputs to circuit"
                >
                  <td className="py-1 px-2 text-center text-[10px] text-zinc-400">{row.index}</td>
                  {spec.inputNames.map((name) => (
                    <td
                      key={name}
                      className={`py-1 px-2 text-center ${
                        row.inputs[name] === 1 ? 'text-zinc-900 font-bold' : 'text-zinc-400'
                      }`}
                    >
                      {row.inputs[name]}
                    </td>
                  ))}
                  <td className="py-1 px-1 text-center text-zinc-300">&bull;</td>
                  {spec.outputNames.map((name) => (
                    <td
                      key={name}
                      className={`py-1 px-2 text-center ${
                        row.expected[name] === 1 ? 'text-[#16A34A] font-bold' : 'text-zinc-400'
                      }`}
                    >
                      {row.expected[name]}
                    </td>
                  ))}
                  {verificationReport && (
                    <td className="py-1 px-2 text-center">
                      {reportRow?.passed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-600 inline" />
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Current Live Output Telemetry Box */}
      <div className="mt-2.5 p-2 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
        <span className="text-[11px] font-bold text-zinc-600">Observed Output:</span>
        <div className="flex items-center gap-2 font-mono">
          {spec.outputNames.map((name) => {
            const val = currentOutputs[name];
            return (
              <span
                key={name}
                className="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-800 shadow-2xs"
              >
                {name}: <strong className="text-[#16A34A]">{val ?? '—'}</strong>
              </span>
            );
          })}
        </div>
      </div>

      {/* Verify Button */}
      <button
        onClick={handleVerify}
        disabled={isVerifying}
        className="mt-2.5 w-full py-2 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{isVerifying ? 'Verifying...' : 'Verify Truth Table'}</span>
      </button>
    </div>
  );
};
