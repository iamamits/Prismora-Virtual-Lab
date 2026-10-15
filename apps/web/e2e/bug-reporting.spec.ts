import { test, expect } from '@playwright/test';

test.describe('Universal Simulation Bug Reporting System', () => {
  test('should open bug reporting modal across simulation workspaces', async ({ page }) => {
    // Test on projectile-motion lab
    await page.goto('/experiments/projectile-motion');
    const reportBtn = page.getByRole('button', { name: 'Report a Bug' });
    await expect(reportBtn).toBeVisible();
    await reportBtn.click();

    // Dialog should open
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();
    await expect(modal.getByText('Report a Bug / Scientific Issue')).toBeVisible();
    await expect(modal.getByText('projectile-motion')).toBeVisible();

    // Close dialog
    await modal.getByRole('button', { name: 'Close dialog' }).click({ force: true });
    await expect(modal).not.toBeVisible();
  });

  test('should validate required fields before allowing report review', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    await page.getByRole('button', { name: 'Report a Bug' }).click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Review button should be disabled when fields are empty
    const reviewBtn = modal.getByRole('button', { name: 'Review Report' });
    await expect(reviewBtn).toBeDisabled();

    // Fill only Title
    await modal.getByPlaceholder('e.g., Apex height differs from theoretical calculation').fill('Test Title');
    await expect(reviewBtn).toBeDisabled();

    // Fill Description
    await modal.getByPlaceholder('Describe the discrepancy, glitch, or unexpected behavior in detail...').fill('Detailed observation');
    await expect(reviewBtn).toBeDisabled();

    // Fill Expected Behavior
    await modal.getByPlaceholder('What should have happened according to physics or standard logic?').fill('Expected output');
    // Now Review button should become enabled!
    await expect(reviewBtn).toBeEnabled();

    // Cancel out
    await modal.getByRole('button', { name: 'Cancel' }).click();
    await expect(modal).not.toBeVisible();
  });

  test('should preview diagnostic payload, review, and successfully submit bug report', async ({ page }) => {
    await page.goto('/experiments/coa');

    await page.getByRole('button', { name: 'Report a Bug' }).click();
    const modal = page.locator('[role="dialog"]');
    await expect(modal).toBeVisible();

    // Fill in bug details
    await modal.getByPlaceholder('e.g., Apex height differs from theoretical calculation').fill('Pipeline Stall Bubble Verification');
    await modal.getByPlaceholder('Describe the discrepancy, glitch, or unexpected behavior in detail...').fill('Verifying load-use RAW hazard bubble injection under test execution.');
    await modal.getByPlaceholder('What should have happened according to physics or standard logic?').fill('ID stage should stall 1 cycle and insert NOP into EX stage.');
    await modal.getByPlaceholder(/1\. Set speed to 25 m\/s/).fill('1. Load sample program\n2. Step clock to cycle 3\n3. Observe EX stage');

    // Toggle Preview Diagnostic Payload
    const previewDiagBtn = modal.getByRole('button', { name: 'Preview Diagnostic Payload' });
    await expect(previewDiagBtn).toBeVisible();
    await previewDiagBtn.click();
    await expect(modal.locator('pre')).toBeVisible();

    // Collapse diagnostic preview
    const hideDiagBtn = modal.getByRole('button', { name: 'Hide Diagnostic JSON' });
    await hideDiagBtn.click();
    await expect(modal.locator('pre')).not.toBeVisible();

    // Proceed to Review step
    await modal.getByRole('button', { name: 'Review Report' }).click();

    // Review step should display title and details
    await expect(modal.getByText('Pipeline Stall Bubble Verification')).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Back to Edit' })).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Confirm & Submit' })).toBeVisible();

    // Confirm & Submit
    await modal.getByRole('button', { name: 'Confirm & Submit' }).click();

    // Success screen
    await expect(modal.getByText('Bug Report Successfully Filed')).toBeVisible({ timeout: 10000 });
    // Reference ID should follow PRIS-BUG- pattern
    const refIdContainer = modal.locator('div.select-all');
    await expect(refIdContainer).toBeVisible();
    const refId = await refIdContainer.textContent();
    expect(refId).toMatch(/^PRIS-BUG-\d{4}-[A-Z0-9]+$/);

    // Click Done to close
    await modal.getByRole('button', { name: 'Done' }).click();
    await expect(modal).not.toBeVisible();
  });
});
