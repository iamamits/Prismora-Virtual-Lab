/**
 * Prismora Bug Reporting System Types & Schemas
 */

export type BugCategory =
  | 'incorrect_result'
  | 'broken_interaction'
  | 'rendering_ui'
  | 'performance'
  | 'accessibility'
  | 'other';

export type BugSeverity = 'low' | 'medium' | 'high' | 'critical';

export const BUG_CATEGORY_LABELS: Record<BugCategory, string> = {
  incorrect_result: 'Incorrect Simulation Result / Scientific Discrepancy',
  broken_interaction: 'Broken Interaction / Control Failure',
  rendering_ui: 'Rendering / Visual Layout Issue',
  performance: 'Performance / Lag or Frame Drop',
  accessibility: 'Accessibility / Keyboard / Contrast Problem',
  other: 'Other / General Feedback',
};

export interface ClientEnvironmentInfo {
  appVersion: string;
  viewport?: { width: number; height: number };
  devicePixelRatio?: number;
  colorScheme?: 'light' | 'dark';
  userAgent?: string;
}

export interface BugReportInput {
  simulationId: string;
  moduleName: string;
  url: string;
  category: BugCategory;
  severity: BugSeverity;
  title: string;
  description: string;
  expectedBehavior: string;
  reproductionSteps?: string;
  includeDiagnostics: boolean;
  diagnosticSnapshot?: Record<string, unknown>;
  contactEmail?: string;
  isAnonymous?: boolean;
  clientInfo?: ClientEnvironmentInfo;
}

export interface BugReportRecord extends BugReportInput {
  id: string; // e.g. "PRIS-BUG-2026-ABCD"
  createdAt: string;
  status: 'open' | 'triaged' | 'in_progress' | 'resolved';
}

export interface BugReportResponse {
  success: boolean;
  reportId?: string;
  message: string;
  error?: string;
}
