'use client';

import React, { useState } from 'react';
import type { ExperimentConfiguration, ProjectileMotionParameters } from '@prismora/simulation-core';
import { Card, CardHeader, CardTitle, CardContent, Button } from '@prismora/ui';
import { Download, Upload, Copy, Check, X, FileJson } from 'lucide-react';

export interface ExportDialogProps {
  configuration: ExperimentConfiguration<ProjectileMotionParameters>;
  onImport: (config: ExperimentConfiguration<ProjectileMotionParameters>) => boolean;
  onClose: () => void;
  isOpen: boolean;
}

export const ExportDialog: React.FC<ExportDialogProps> = ({
  configuration,
  onImport,
  onClose,
  isOpen,
}) => {
  const [copied, setCopied] = useState(false);
  const [importText, setImportText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');

  if (!isOpen) return null;

  const jsonString = JSON.stringify(configuration, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prismora-projectile-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleApplyImport = () => {
    setImportError(null);
    try {
      const parsed = JSON.parse(importText);
      if (!parsed || typeof parsed !== 'object') {
        setImportError('Invalid JSON format.');
        return;
      }
      if (parsed.modelId !== 'projectile-motion') {
        setImportError(`Incompatible model "${parsed.modelId}". Expected "projectile-motion".`);
        return;
      }
      if (!parsed.parameters) {
        setImportError('Missing parameters object in configuration.');
        return;
      }
      const success = onImport(parsed);
      if (success) {
        onClose();
      } else {
        setImportError('Failed to apply configuration. Parameter validation failed.');
      }
    } catch (e: unknown) {
      setImportError((e as Error).message || 'Failed to parse JSON.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setImportText(text);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-0">
      <Card className="w-full max-w-lg shadow-2xl border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <FileJson className="w-4 h-4 text-indigo-500" />
            <span>Experiment Configuration (JSON)</span>
          </CardTitle>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 p-1"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </CardHeader>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-100 dark:border-zinc-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Export Configuration
          </button>
          <button
            onClick={() => setActiveTab('import')}
            className={`flex-1 py-2 text-center border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            Import Configuration
          </button>
        </div>

        <CardContent className="p-4 space-y-3">
          {activeTab === 'export' ? (
            <>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                This schema-validated JSON payload contains all parameters, clock settings, and observations required to deterministically reproduce this simulation run.
              </p>
              <textarea
                readOnly
                value={jsonString}
                className="w-full h-52 text-[11px] font-mono p-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none resize-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={handleCopy}>
                  {copied ? <Check className="w-3.5 h-3.5 mr-1 text-emerald-500" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? 'Copied' : 'Copy JSON'}
                </Button>
                <Button size="sm" onClick={handleDownload}>
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Download File
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Paste an experiment JSON string or upload a JSON file to restore initial conditions and parameters.
              </p>
              <textarea
                placeholder='Paste experiment JSON here...'
                value={importText}
                onChange={(e) => {
                  setImportText(e.target.value);
                  setImportError(null);
                }}
                className="w-full h-44 text-[11px] font-mono p-2.5 rounded bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 focus:outline-none resize-none"
              />
              {importError && (
                <div className="text-xs text-red-500 bg-red-50 dark:bg-red-950/40 p-2 rounded border border-red-200 dark:border-red-900">
                  {importError}
                </div>
              )}
              <div className="flex items-center justify-between pt-1">
                <label className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload .json file</span>
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleApplyImport} disabled={!importText.trim()}>
                    Apply Configuration
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
