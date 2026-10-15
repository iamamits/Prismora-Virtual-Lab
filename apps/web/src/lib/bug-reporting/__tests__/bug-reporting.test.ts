import { describe, expect, it } from 'vitest';
import { BugReportStore } from '../store';
import type { BugReportInput } from '../types';

describe('Bug Reporting Infrastructure', () => {
  const validPayload: BugReportInput = {
    simulationId: 'projectile-motion',
    moduleName: 'Physics Laboratory',
    url: 'http://localhost:3000/experiments/projectile-motion',
    category: 'incorrect_result',
    severity: 'medium',
    title: 'Discrepancy at 45 degree angle apex',
    description: 'The maximum height calculation shows slight rounding discrepancy compared to analytical equation.',
    expectedBehavior: 'Apex height should match v0^2 sin^2(theta) / 2g exactly.',
    reproductionSteps: '1. Set angle to 45 deg\n2. Set velocity to 20 m/s\n3. Launch',
    includeDiagnostics: true,
    diagnosticSnapshot: { initialSpeed: 20, launchAngle: 0.785398 },
    isAnonymous: false,
    contactEmail: 'tester@prismora.org',
  };

  it('should successfully submit and persist a valid bug report', async () => {
    const result = await BugReportStore.submitReport(validPayload, '192.168.1.100');
    expect(result.success).toBe(true);
    expect(result.reportId).toBeDefined();
    expect(result.reportId).toMatch(/^PRIS-BUG-\d{4}-[A-Z0-9]{4}$/);
  });

  it('should reject reports with missing title or short description', async () => {
    const invalid = { ...validPayload, title: 'no' };
    const result = await BugReportStore.submitReport(invalid, '192.168.1.101');
    expect(result.success).toBe(false);
    expect(result.error).toBe('INVALID_TITLE');
  });

  it('should support privacy-conscious anonymous submissions', async () => {
    const anon = { ...validPayload, isAnonymous: true, contactEmail: 'secret@secret.com' };
    const result = await BugReportStore.submitReport(anon, '192.168.1.102');
    expect(result.success).toBe(true);

    const reports = await BugReportStore.getReports();
    const stored = reports.find((r) => r.id === result.reportId);
    expect(stored).toBeDefined();
    expect(stored?.contactEmail).toBeUndefined(); // Email stripped when isAnonymous is true
    expect(stored?.isAnonymous).toBe(true);
  });
});
