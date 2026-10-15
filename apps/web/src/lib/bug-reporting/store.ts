import fs from 'node:fs';
import path from 'node:path';
import type { BugReportInput, BugReportRecord, BugReportResponse } from './types';

// Rate Limiting Map: IP / Client Token -> timestamps
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(clientKey: string): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(clientKey) ?? [];
  const validTimestamps = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW_MS);

  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    return false; // Rate limit exceeded
  }

  validTimestamps.push(now);
  rateLimitMap.set(clientKey, validTimestamps);
  return true;
}

/**
 * Sanitizes input text to prevent injection or leaking sensitive strings.
 */
function sanitizeText(text: string, maxLength: number = 2000): string {
  if (!text) return '';
  return text
    .slice(0, maxLength)
    .replace(/[<>]/g, '') // strip potential HTML tags
    .trim();
}

/**
 * Generates an educational, readable reference ID: PRIS-BUG-YYYY-XXXX
 */
function generateReferenceId(): string {
  const year = new Date().getFullYear();
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let rand = '';
  for (let i = 0; i < 4; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `PRIS-BUG-${year}-${rand}`;
}

export class BugReportStore {
  private static dataFilePath = path.join(process.cwd(), 'data', 'bug-reports.json');

  private static ensureDataFile(): void {
    const dir = path.dirname(this.dataFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (!fs.existsSync(this.dataFilePath)) {
      fs.writeFileSync(this.dataFilePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }

  static async submitReport(
    input: BugReportInput,
    clientIp: string = '127.0.0.1',
  ): Promise<BugReportResponse> {
    // 1. Rate Limiting Check
    if (!checkRateLimit(clientIp)) {
      return {
        success: false,
        message: 'Rate limit exceeded. Please wait a moment before submitting another report.',
        error: 'RATE_LIMIT_EXCEEDED',
      };
    }

    // 2. Validate required fields
    if (!input.title || input.title.trim().length < 3) {
      return {
        success: false,
        message: 'Please provide a clear title (at least 3 characters).',
        error: 'INVALID_TITLE',
      };
    }

    if (!input.description || input.description.trim().length < 5) {
      return {
        success: false,
        message: 'Please provide a description of the problem (at least 5 characters).',
        error: 'INVALID_DESCRIPTION',
      };
    }

    if (!input.expectedBehavior || input.expectedBehavior.trim().length < 3) {
      return {
        success: false,
        message: 'Please describe the expected behavior.',
        error: 'INVALID_EXPECTED_BEHAVIOR',
      };
    }

    // 3. Build sanitized record
    const id = generateReferenceId();
    const sanitizedRecord: BugReportRecord = {
      id,
      simulationId: sanitizeText(input.simulationId, 100),
      moduleName: sanitizeText(input.moduleName, 100),
      url: sanitizeText(input.url, 500),
      category: input.category,
      severity: input.severity,
      title: sanitizeText(input.title, 200),
      description: sanitizeText(input.description, 4000),
      expectedBehavior: sanitizeText(input.expectedBehavior, 2000),
      reproductionSteps: input.reproductionSteps ? sanitizeText(input.reproductionSteps, 3000) : undefined,
      includeDiagnostics: Boolean(input.includeDiagnostics),
      diagnosticSnapshot: input.includeDiagnostics && input.diagnosticSnapshot ? input.diagnosticSnapshot : undefined,
      contactEmail: input.isAnonymous ? undefined : input.contactEmail ? sanitizeText(input.contactEmail, 200) : undefined,
      isAnonymous: Boolean(input.isAnonymous),
      clientInfo: input.clientInfo,
      createdAt: new Date().toISOString(),
      status: 'open',
    };

    // 4. Atomic File Persistence
    try {
      this.ensureDataFile();
      const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
      const reports: BugReportRecord[] = JSON.parse(raw);
      reports.unshift(sanitizedRecord);

      // Write atomically to temporary file and rename
      const tempPath = `${this.dataFilePath}.tmp.${Date.now()}`;
      fs.writeFileSync(tempPath, JSON.stringify(reports, null, 2), 'utf-8');
      fs.renameSync(tempPath, this.dataFilePath);

      return {
        success: true,
        reportId: id,
        message: `Report ${id} submitted successfully. Thank you for helping improve Prismora!`,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: 'Failed to persist bug report to disk. Please try again.',
        error: errMsg,
      };
    }
  }

  static async getReports(): Promise<BugReportRecord[]> {
    try {
      this.ensureDataFile();
      const raw = fs.readFileSync(this.dataFilePath, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }
}
