import { test, expect } from '@playwright/test';

test.describe('Immersive Projectile Motion Virtual Laboratory', () => {
  test('should load public simulation anonymously without authentication barrier', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Title and laboratory badge
    await expect(page.locator('h1')).toContainText('Projectile Motion Lab');
    await expect(page.getByText('Virtual Apparatus')).toBeVisible();

    // High-DPI interactive canvas should be rendered
    const canvas = page.locator('canvas');
    await expect(canvas.first()).toBeVisible();

    // Scene toolbar controls (Probe, Tape, Zoom)
    await expect(page.getByRole('button', { name: 'Probe' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tape' })).toBeVisible();
    await expect(page.getByLabel('Zoom In')).toBeVisible();
    await expect(page.getByLabel('Zoom Out')).toBeVisible();
  });

  test('should switch environmental presets and celestial bodies', async ({ page, isMobile }) => {
    await page.goto('/experiments/projectile-motion');

    if (isMobile) {
      // Mobile uses preset scenario selector
      const scenarioSelect = page.getByRole('combobox', { name: 'Preset challenge scenario' });
      await expect(scenarioSelect).toBeVisible();
      await scenarioSelect.selectOption('moon-mission');
      const gravityInput = page.getByRole('textbox', { name: 'Gravitational Accel (g)' });
      await expect(gravityInput).toHaveValue('1.62');
      return;
    }

    // Click Moon environment button
    const moonBtn = page.getByRole('button', { name: 'Moon' });
    await expect(moonBtn).toBeVisible();
    await moonBtn.click();

    // Gravity should now update to Moon gravity 1.62
    const gravityInput = page.getByRole('textbox', { name: 'Gravitational Accel (g)' });
    await expect(gravityInput).toHaveValue('1.62');

    // Click Mars environment button
    const marsBtn = page.getByRole('button', { name: 'Mars' });
    await marsBtn.click();
    await expect(gravityInput).toHaveValue('3.71');

    // Click Earth to restore
    const earthBtn = page.getByRole('button', { name: 'Earth' });
    await earthBtn.click();
    await expect(gravityInput).toHaveValue('9.81');
  });

  test('should toggle scientific probe and tape tools', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Toggle Probe tool
    const probeBtn = page.getByRole('button', { name: 'Probe' });
    await probeBtn.click();

    // Switch to Data tab in analytical drawer
    await page.getByRole('button', { name: 'Data' }).click();
    await expect(page.getByText('Sampled Sensor Points')).toBeVisible();

    // Toggle Tape tool
    const tapeBtn = page.getByRole('button', { name: 'Tape' });
    await tapeBtn.click();
  });

  test('should launch, pause, step, and reset simulation deterministically', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Single step
    const stepBtn = page.getByRole('button', { name: 'Step' });
    await expect(stepBtn).toBeVisible();
    await stepBtn.click();

    await expect(page.getByText('paused')).toBeVisible();

    // Launch button
    const launchBtn = page.getByRole('button', { name: 'Launch' });
    await launchBtn.click();
    await expect(page.getByText('running')).toBeVisible();

    // Pause button
    const pauseBtn = page.getByRole('button', { name: 'Pause' });
    await pauseBtn.click();
    await expect(page.getByText('paused')).toBeVisible();

    // Reset button
    const resetBtn = page.getByRole('button', { name: 'Reset' });
    await resetBtn.click();
    await expect(page.getByText('ready')).toBeVisible();
  });

  test('should collapse and expand analytical drawer for full-screen immersive view', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Toggle analytical drawer button
    const drawerToggleBtn = page.getByLabel('Toggle Analytical Panel');
    await expect(drawerToggleBtn).toBeVisible();

    // Collapse
    await drawerToggleBtn.click();
    await expect(page.getByText('Initial Launch Conditions')).not.toBeVisible();

    // Expand
    await drawerToggleBtn.click();
    await expect(page.getByText('Initial Launch Conditions')).toBeVisible();
  });

  test('should open export/import dialog and serialize valid configuration', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Open Config modal
    const configBtn = page.getByRole('button', { name: 'Config' });
    await configBtn.click();

    await expect(page.getByText('Experiment Configuration (JSON)')).toBeVisible();
    const textarea = page.locator('textarea');
    await expect(textarea).toBeVisible();

    const jsonContent = await textarea.inputValue();
    expect(jsonContent).toContain('"modelId": "projectile-motion"');
    expect(jsonContent).toContain('"parameters"');

    // Close modal
    await page.getByRole('button', { name: 'Close dialog' }).click();
    await expect(page.getByText('Experiment Configuration (JSON)')).not.toBeVisible();
  });

  test('explore discovery catalog should search and filter', async ({ page }) => {
    await page.goto('/explore');

    await expect(page.getByRole('heading', { name: 'Ideal Projectile Motion', exact: true })).toBeVisible();

    // Search filter
    const searchInput = page.getByPlaceholder('Search experiments or tags...');
    await searchInput.fill('kinematics');
    await expect(page.getByRole('heading', { name: 'Ideal Projectile Motion', exact: true })).toBeVisible();

    // Non-matching search
    await searchInput.fill('quantum-teleportation-nonexistent');
    await expect(page.getByText('No simulations match your search query')).toBeVisible();
  });
});
