'use client';

import { useState } from 'react';
import { AlertCircle, Bug, CheckCircle2, ChevronRight, Eye, RefreshCw, Send, X } from 'lucide-react';
import { Button } from './button';

export type BugCategory =
  | 'incorrect_result'
  | 'broken_interaction'
  | 'rendering_ui'
  | 'performance'
  | 'accessibility'
  | 'other';

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';

export const BUG_CATEGORIES: { id: BugCategory; label: string; desc: string }[] = [
  { id: 'incorrect_result', label: 'Incorrect Simulation Result', desc: 'Calculation or equation discrepancy' },
  { id: 'broken_interaction', label: 'Broken Interaction', desc: 'Slider, handle, button or drag not responding' },
  { id: 'rendering_ui', label: 'Rendering / Visual Layout', desc: 'Canvas distortion, overlapping text, or contrast issue' },
  { id: 'performance', label: 'Performance Problem', desc: 'Low frame rate, UI freezing, or stutter' },
  { id: 'accessibility', label: 'Accessibility', desc: 'Keyboard focus, screen reader, or contrast issue' },
  { id: 'other', label: 'Other / Feedback', desc: 'General observation or suggestion' },
];

export interface BugReportModalProps {
  simulationId: string;
  moduleName: string;
  diagnosticSnapshot?: Record<string, unknown>;
  triggerText?: string;
  className?: string;
}

export function BugReportModal({
  simulationId,
  moduleName,
  diagnosticSnapshot,
  triggerText = 'Report a Bug',
  className = '',
}: BugReportModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');

  // Form fields
  const [category, setCategory] = useState<BugCategory>('incorrect_result');
  const [severity, setSeverity] = useState<BugSeverity>('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedBehavior, setExpectedBehavior] = useState('');
  const [reproductionSteps, setReproductionSteps] = useState('');
  const [includeDiagnostics, setIncludeDiagnostics] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [contactEmail, setContactEmail] = useState('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reportReferenceId, setReportReferenceId] = useState<string | null>(null);
  const [showDiagJson, setShowDiagJson] = useState(false);

  const resetForm = () => {
    setStep('form');
    setTitle('');
    setDescription('');
    setExpectedBehavior('');
    setReproductionSteps('');
    setErrorMessage(null);
    setReportReferenceId(null);
  };

  const handleOpen = () => {
    resetForm();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    const payload = {
      simulationId,
      moduleName,
      url: typeof window !== 'undefined' ? window.location.href : '',
      category,
      severity,
      title: title.trim(),
      description: description.trim(),
      expectedBehavior: expectedBehavior.trim(),
      reproductionSteps: reproductionSteps.trim() || undefined,
      includeDiagnostics,
      diagnosticSnapshot: includeDiagnostics ? diagnosticSnapshot : undefined,
      contactEmail: !isAnonymous && contactEmail.trim() ? contactEmail.trim() : undefined,
      isAnonymous,
      clientInfo: typeof window !== 'undefined' ? {
        appVersion: '0.1.0',
        viewport: { width: window.innerWidth, height: window.innerHeight },
        devicePixelRatio: window.devicePixelRatio || 1,
        colorScheme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
      } : undefined,
    };

    try {
      const res = await fetch('/api/bug-reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Submission failed');
      }

      setReportReferenceId(data.reportId || 'PRIS-BUG-2026-CONFIRMED');
      setStep('success');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error. Please try again.';
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Launch Trigger Button */}
      <button
        onClick={handleOpen}
        type="button"
        className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-rose-500 ${className}`}
        title="Report an issue or scientific discrepancy with this simulation"
      >
        <Bug className="w-3.5 h-3.5 text-rose-500" />
        <span>{triggerText}</span>
      </button>

      {/* Accessible Modal Overlay */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="bug-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white dark:bg-[#0f172a] rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-600">
                  <Bug className="w-4 h-4" />
                </div>
                <div>
                  <h2 id="bug-modal-title" className="text-sm font-bold text-zinc-900 dark:text-white">
                    Report a Bug / Scientific Issue
                  </h2>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {moduleName} &bull; <span className="font-mono text-zinc-600 dark:text-zinc-300">{simulationId}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Close dialog"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {errorMessage && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Submission Error</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Step 1: Form */}
              {step === 'form' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Category Selection */}
                    <div>
                      <label className="block font-semibold text-zinc-900 dark:text-white mb-1">
                        Issue Category <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value as BugCategory)}
                        className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        {BUG_CATEGORIES.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Severity Selection */}
                    <div>
                      <label className="block font-semibold text-zinc-900 dark:text-white mb-1">
                        Severity Level <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value as BugSeverity)}
                        className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="low">Low (Cosmetic / Suggestion)</option>
                        <option value="medium">Medium (Incorrect Display)</option>
                        <option value="high">High (Broken Calculation / Feature)</option>
                        <option value="critical">Critical (Crash / Freeze)</option>
                      </select>
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block font-semibold text-zinc-900 dark:text-white mb-1">
                      Summary Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Apex height differs from theoretical calculation"
                      className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block font-semibold text-zinc-900 dark:text-white mb-1">
                      Detailed Description <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={3}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the discrepancy, glitch, or unexpected behavior in detail..."
                      className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* Expected Behavior */}
                  <div>
                    <label className="block font-semibold text-zinc-900 dark:text-white mb-1">
                      Expected Scientific / UI Behavior <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={expectedBehavior}
                      onChange={(e) => setExpectedBehavior(e.target.value)}
                      placeholder="What should have happened according to physics or standard logic?"
                      className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  {/* Reproduction Steps */}
                  <div>
                    <label className="block font-semibold text-zinc-900 dark:text-white mb-1">
                      Steps to Reproduce (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={reproductionSteps}
                      onChange={(e) => setReproductionSteps(e.target.value)}
                      placeholder="1. Set speed to 25 m/s&#10;2. Set angle to 45 deg&#10;3. Click Fire"
                      className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono text-[11px]"
                    />
                  </div>

                  {/* Diagnostics Consent Box */}
                  <div className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-2">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeDiagnostics}
                        onChange={(e) => setIncludeDiagnostics(e.target.checked)}
                        className="mt-0.5 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <span className="font-semibold text-zinc-900 dark:text-white">
                          Attach Sanitized Simulation Diagnostics
                        </span>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          Includes current parameters, active state, and viewport resolution. No personal data or secrets are collected.
                        </p>
                      </div>
                    </label>

                    {includeDiagnostics && diagnosticSnapshot && (
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => setShowDiagJson(!showDiagJson)}
                          className="flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
                        >
                          <Eye className="w-3 h-3" />
                          <span>{showDiagJson ? 'Hide Diagnostic JSON' : 'Preview Diagnostic Payload'}</span>
                        </button>
                        {showDiagJson && (
                          <pre className="mt-1.5 p-2 rounded bg-zinc-100 dark:bg-black/60 border border-zinc-200 dark:border-zinc-800 overflow-x-auto text-[10px] font-mono text-zinc-800 dark:text-zinc-300 max-h-28">
                            {JSON.stringify(diagnosticSnapshot, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Anonymous Toggle */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    <div>
                      <span className="font-semibold text-zinc-900 dark:text-white">Submit Anonymously</span>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        No email or personal identifiers will be attached to this report.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-300 text-rose-600 focus:ring-rose-500"
                    />
                  </div>

                  {!isAnonymous && (
                    <div>
                      <label className="block font-semibold text-zinc-900 dark:text-white mb-1">
                        Contact Email (Optional for updates)
                      </label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="your.email@university.edu"
                        className="w-full px-3 py-2 rounded-md bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Step 2: Preview */}
              {step === 'preview' && (
                <div className="space-y-3">
                  <div className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-2">
                    <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                      <span className="font-bold text-zinc-900 dark:text-white text-sm">{title}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                        {category}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Description:</span>
                      <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{description}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300">Expected:</span>
                      <p className="text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{expectedBehavior}</p>
                    </div>
                    {reproductionSteps && (
                      <div>
                        <span className="font-semibold text-zinc-700 dark:text-zinc-300">Reproduction Steps:</span>
                        <p className="font-mono text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">{reproductionSteps}</p>
                      </div>
                    )}
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                      Module: <span className="font-mono">{moduleName}</span> &bull; Diagnostics: {includeDiagnostics ? 'Attached' : 'Excluded'} &bull; Submission: {isAnonymous ? 'Anonymous' : contactEmail || 'Public'}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Success Confirmation */}
              {step === 'success' && (
                <div className="py-6 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 flex items-center justify-center text-emerald-600">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                    Bug Report Successfully Filed
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                    Your report has been securely persisted in the triage queue. Use the reference ID below to track this issue.
                  </p>
                  <div className="inline-block px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono font-bold text-sm text-zinc-900 dark:text-zinc-100 tracking-wider select-all">
                    {reportReferenceId}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60">
              {step === 'form' && (
                <>
                  <Button variant="outline" size="sm" onClick={handleClose}>
                    Cancel
                  </Button>
                  <Button
                    variant="coral"
                    size="sm"
                    disabled={!title.trim() || !description.trim() || !expectedBehavior.trim()}
                    onClick={() => setStep('preview')}
                  >
                    <span>Review Report</span>
                    <ChevronRight className="w-3.5 h-3.5 ml-1" />
                  </Button>
                </>
              )}

              {step === 'preview' && (
                <>
                  <Button variant="outline" size="sm" onClick={() => setStep('form')} disabled={isSubmitting}>
                    Back to Edit
                  </Button>
                  <Button variant="coral" size="sm" onClick={handleSubmit} disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 mr-1.5" />
                        <span>Confirm &amp; Submit</span>
                      </>
                    )}
                  </Button>
                </>
              )}

              {step === 'success' && (
                <div className="w-full flex justify-end">
                  <Button variant="default" size="sm" onClick={handleClose}>
                    Done
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
