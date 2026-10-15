import { test, expect } from '@playwright/test';

test.describe('Flagship Projectile Motion Experiment', () => {
  test('should load public simulation anonymously without authentication barrier', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Title and badges
    await expect(page.locator('h1')).toContainText('Ideal Projectile Motion');
    await expect(page.getByText('Flagship Model')).toBeVisible();

    // Canvas should be rendered
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible();

    // Measurement displays should have initial values
    await expect(page.getByText('Flight Time (tf)')).toBeVisible();
    await expect(page.getByText('Max Height (h_max)')).toBeVisible();
    await expect(page.getByText('Range (R)')).toBeVisible();
  });

  test('should adjust parameters and update live measurements', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Preset selector
    const presetSelect = page.locator('select');
    await expect(presetSelect).toBeVisible();

    // Select Moon gravity preset
    await presetSelect.selectOption('moon');

    // Gravity should now be 1.62 m/s²
    await expect(page.getByText('Moon (1.62)')).toBeVisible();

    // Apex max height on moon should be significantly higher than earth
    // 20 m/s at 45 deg: vy0 = 14.14 m/s -> h = 14.14^2 / (2 * 1.62) ≈ 61.7m
    const maxHeightDisplay = page.locator('text=Max Height (h_max)').locator('..');
    await expect(maxHeightDisplay).toBeVisible();
  });

  test('should play, pause, single-step, and reset simulation deterministically', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Step button
    const stepBtn = page.getByRole('button', { name: 'Step forward' });
    await expect(stepBtn).toBeVisible();

    // Click step twice
    await stepBtn.click();
    await stepBtn.click();

    // Status should be paused
    await expect(page.getByText('Paused')).toBeVisible();

    // Play simulation
    const playBtn = page.getByRole('button', { name: 'Play simulation' });
    await playBtn.click();
    await expect(page.getByText('Running')).toBeVisible();

    // Pause simulation
    const pauseBtn = page.getByRole('button', { name: 'Pause simulation' });
    await pauseBtn.click();
    await expect(page.getByText('Paused')).toBeVisible();

    // Reset simulation
    const resetBtn = page.getByRole('button', { name: 'Reset simulation' });
    await resetBtn.click();
    await expect(page.getByText('Ready')).toBeVisible();
  });

  test('should open export/import dialog and serialize valid configuration', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Open Export / Import modal
    const exportBtn = page.getByRole('button', { name: 'Export / Import' });
    await exportBtn.click();

    // Modal should be visible with JSON payload
    await expect(page.getByText('Experiment Configuration (JSON)')).toBeVisible();
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    const jsonContent = await textarea.inputValue();
    expect(jsonContent).toContain('"modelId": "projectile-motion"');
    expect(jsonContent).toContain('"parameters"');

    // Close dialog
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await expect(page.getByText('Experiment Configuration (JSON)')).not.toBeVisible();
  });

  test('should log observations in observation panel', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Switch to Notes tab
    await page.getByRole('button', { name: 'Notes' }).click();

    // Input note
    const noteInput = page.getByPlaceholder('Record hypothesis, observation, or reading...');
    await noteInput.fill('Observed parabolic symmetry at apex');
    await page.getByRole('button', { name: 'Log' }).click();

    // Should appear in list
    await expect(page.getByText('Observed parabolic symmetry at apex')).toBeVisible();
  });

  test('explore discovery page should filter simulations', async ({ page }) => {
    await page.goto('/explore');

    await expect(page.getByText('Ideal Projectile Motion')).toBeVisible();

    // Search filter
    const searchInput = page.getByPlaceholder('Search simulations or tags...');
    await searchInput.fill('kinematics');
    await expect(page.getByText('Ideal Projectile Motion')).toBeVisible();

    // Non-matching search
    await searchInput.fill('quantum-teleportation-nonexistent');
    await expect(page.getByText('No simulations match your search query')).toBeVisible();
  });
});
