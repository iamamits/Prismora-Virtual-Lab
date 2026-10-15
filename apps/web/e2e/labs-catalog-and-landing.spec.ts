import { test, expect } from '@playwright/test';

test.describe('Prismora Labs Architecture & Landing Page Redesign', () => {
  test('landing page should host interactive working hero simulation and subject hubs', async ({ page }) => {
    await page.goto('/');

    // Hero title
    await expect(page.locator('h1')).toContainText('Explore. Experiment. Understand.');

    // Interactive Hero Simulation Canvas
    const heroCanvas = page.locator('canvas').first();
    await expect(heroCanvas).toBeVisible();

    // Verify Telemetry HUD is active (time and speed indicators)
    await expect(page.getByText('t:').first()).toBeVisible();

    // Adjust Speed slider
    const speedSlider = page.locator('input[type="range"]').first();
    await expect(speedSlider).toBeVisible();
    await speedSlider.fill('30');

    // Switch Environment in Hero Simulation to Moon
    const moonBtn = page.getByRole('button', { name: 'Moon' });
    await expect(moonBtn).toBeVisible();
    await moonBtn.click();
    await expect(page.getByText('1.62 m/s²')).toBeVisible();

    // Fire Cannon
    const fireBtn = page.getByRole('button', { name: 'Fire Cannon!' });
    await expect(fireBtn).toBeVisible();
    await fireBtn.click();

    // Reset button should appear while animating or after
    await expect(page.getByRole('button', { name: 'Reset' })).toBeVisible();

    // Subject Hub Cards (use exact to prevent matching long workbench headings)
    await expect(page.getByRole('heading', { name: 'Physics', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Digital Electronics', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Computer Architecture', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Theory of Computation', exact: true })).toBeVisible();
  });

  test('dedicated Prismora Labs page should support laboratory filtering, search, and metadata', async ({ page }) => {
    await page.goto('/labs');

    // Heading and metrics
    await expect(page.locator('h1')).toContainText('Prismora Laboratories');
    await expect(page.getByText('Available Now').first()).toBeVisible();

    // Laboratory Switcher tabs
    await expect(page.getByRole('button', { name: /^All Labs/ })).toBeVisible();
    const digitalLabBtn = page.getByRole('button', { name: /Digital/i }).first();
    await expect(digitalLabBtn).toBeVisible();
    await digitalLabBtn.click();

    // Focus banner for Digital Electronics Lab
    await expect(page.getByRole('heading', { name: 'Digital Electronics Lab' })).toBeVisible();
    await expect(page.getByText('Curriculum Modules:')).toBeVisible();

    // Search within labs
    const searchInput = page.getByPlaceholder(/Search experiments by title/);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('K-Map');

    await expect(page.getByRole('heading', { name: 'Digital Electronics & Logic Design Workbench' })).toBeVisible();

    // Clear search
    await searchInput.fill('');

    // Switch to All Labs
    await page.getByRole('button', { name: /^All Labs/ }).click();
    await expect(page.getByRole('heading', { name: 'Ideal Projectile Motion' })).toBeVisible();
  });

  test('numeric inputs and unit labels must not overlap in projectile motion controls', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');

    // Controls tab in analytical drawer
    await expect(page.getByText('Initial Speed (v₀)')).toBeVisible();

    // Speed input container
    const speedInput = page.getByRole('textbox', { name: 'Initial Speed (v₀)' });
    await expect(speedInput).toBeVisible();
    await expect(speedInput).toHaveValue('20.0');

    // The unit "m/s" should be in a separate element right next to the input inside the input container
    const unitBadge = speedInput.locator('..').locator('span');
    await expect(unitBadge).toBeVisible();
    await expect(unitBadge).toHaveText('m/s');

    // Check gravity input with m/s² unit
    const gravityInput = page.getByRole('textbox', { name: 'Gravitational Accel (g)' });
    await expect(gravityInput).toBeVisible();
    const gravityUnit = gravityInput.locator('..').locator('span');
    await expect(gravityUnit).toBeVisible();
    await expect(gravityUnit).toHaveText('m/s²');

    // Verify box boundaries: unit is strictly to the right of input
    const inputBox = await speedInput.boundingBox();
    const unitBox = await unitBadge.boundingBox();
    expect(inputBox).not.toBeNull();
    expect(unitBox).not.toBeNull();
    if (inputBox && unitBox) {
      // Unit starts at or after input right edge (no overlapping)
      expect(unitBox.x).toBeGreaterThanOrEqual(inputBox.x + inputBox.width - 2);
    }
  });
});
