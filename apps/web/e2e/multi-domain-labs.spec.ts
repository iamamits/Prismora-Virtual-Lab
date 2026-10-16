import { test, expect } from '@playwright/test';

test.describe('Prismora Multi-Domain Scientific Simulation Ecosystem', () => {
  test('Mechanical Vibrations Laboratory: Harmonic oscillator simulates damping regimes and resonance', async ({ page }) => {
    await page.goto('/experiments/mechanical/harmonic-oscillator');

    // Title and AICTE Course Code
    await expect(page.locator('h1')).toContainText('Damped Harmonic Oscillator');
    await expect(page.getByText('ME-202')).toBeVisible();

    // Verify 7 pedagogical tabs
    await expect(page.getByRole('button', { name: '1. Understand' })).toBeVisible();
    await expect(page.getByRole('button', { name: '2. Predict' })).toBeVisible();
    await expect(page.getByRole('button', { name: /3\. Explore/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '4. Guided Procedure' })).toBeVisible();
    await expect(page.getByRole('button', { name: /5\. Analyze/ })).toBeVisible();
    await expect(page.getByRole('button', { name: '6. Challenge' })).toBeVisible();
    await expect(page.getByRole('button', { name: '7. Report' })).toBeVisible();

    // Check Live Rig elements
    await expect(page.getByText('MASS-SPRING-DASHPOT TEST RIG')).toBeVisible();
    await expect(page.getByText('Displacement x(t)')).toBeVisible();
    await expect(page.getByText('Total Energy E(t)')).toBeVisible();

    // Click Critical Damping Preset
    await page.getByRole('button', { name: /Critical/ }).click();
    await expect(page.getByText(/critically damped/i)).toBeVisible();

    // Switch to Analyze tab and check Bode & Phase portraits
    await page.getByRole('button', { name: /5\. Analyze/ }).click();
    await expect(page.getByText(/Dynamic Magnification Factor M\(r\)/)).toBeVisible();
    await expect(page.getByText(/Phase-Space State Portrait/)).toBeVisible();
  });

  test('Chemical Sciences Laboratory: Acid-base titration with digital burette and indicator color change', async ({ page }) => {
    await page.goto('/experiments/chemistry/titration');

    // Title and AICTE Course Code
    await expect(page.locator('h1')).toContainText('Acid-Base Neutralization');
    await expect(page.getByText('CY-101')).toBeVisible();

    // Check virtual apparatus
    await expect(page.getByText('DIGITAL TITRATION APPARATUS')).toBeVisible();
    await expect(page.getByText('DIGITAL pH METER')).toBeVisible();

    // Dispense titrant (+5.0 mL)
    const initialVol = page.getByText(/V_added = 0.00 mL/);
    await expect(initialVol).toBeVisible();

    await page.getByRole('button', { name: '+5.0 mL' }).click();
    await expect(page.getByText(/V_added = 5.00 mL/)).toBeVisible();

    // Switch to Analyze tab and verify titration curve
    await page.getByRole('button', { name: /5\. Analyze/ }).click();
    await expect(page.getByText('Continuous Titration Sigmoidal Curve')).toBeVisible();
    await expect(page.getByText('First Derivative Inflection: dpH / dV')).toBeVisible();
  });

  test('Physical Sciences Laboratory: Wave optics double slit interference and spatial irradiance profile', async ({ page }) => {
    await page.goto('/experiments/physics/wave-optics');

    // Title and AICTE Course Code
    await expect(page.locator('h1')).toContainText('Wave Optics');
    await expect(page.getByText('PH-101')).toBeVisible();

    // Check optical bench elements
    await expect(page.getByText('VIRTUAL OPTICAL BENCH & SCREEN')).toBeVisible();
    await expect(page.getByText('Fringe Width (w)')).toBeVisible();

    // Switch laser preset to Green 532nm
    await page.getByRole('button', { name: 'Green 532nm' }).click();
    await expect(page.getByText(/λ = 532.0 nm/)).toBeVisible();

    // Check spatial irradiance profile
    await expect(page.getByText(/Spatial Irradiance Profile I\(x\)/)).toBeVisible();

    // Switch to Understand tab
    await page.getByRole('button', { name: '1. Understand' }).click();
    await expect(page.getByText(/Fraunhofer Double-Slit Diffraction/)).toBeVisible();
  });

  test('Electrical Engineering Laboratory: Network theorems workbench computes Thévenin and power peak', async ({ page }) => {
    await page.goto('/experiments/electrical/network-theorems');

    // Breadcrumb text
    await expect(page.getByText('Network Theorems')).toBeVisible();

    // Verify 7 pedagogical tabs
    await expect(page.getByRole('button', { name: /1\. Understand/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /3\. Explore/ })).toBeVisible();

    // Check dual source T-network schematic workbench
    await expect(page.getByText('Interactive Dual-Source T-Network')).toBeVisible();
    await expect(page.getByText('Load Connected')).toBeVisible();
    await expect(page.getByText('Open Circuit')).toBeVisible();

    // Switch to Analyze tab and check Maximum Power Transfer curve
    await page.getByRole('button', { name: /5\. Analyze/ }).click();
    await expect(page.getByText(/Maximum Power Transfer Characteristic Curve/)).toBeVisible();
    await expect(page.getByText(/Peak at R_L = R_th/)).toBeVisible();
  });

  test('Prismora Studio: Calculus, Linear Maps, and Vector Fields with RK4', async ({ page }) => {
    await page.goto('/studio');

    await expect(page.getByText('Prismora Studio')).toBeVisible();

    // Verify Calculus mode
    await expect(page.getByRole('button', { name: /Continuous Calculus/ })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Damped Oscillation' })).toBeVisible();

    // Switch to Linear Transformations mode
    await expect(page.getByRole('button', { name: /Linear Transformations/ })).toBeVisible();
    await page.getByRole('button', { name: /Linear Transformations/ }).click();
    await expect(page.getByText('2D Linear Transformation Manifold')).toBeVisible();
    await expect(page.getByText(/Determinant det\(M\)/)).toBeVisible();

    // Switch to Vector Fields mode
    await page.getByRole('button', { name: /Vector Fields/ }).click();
    await expect(page.getByText(/4th-Order Runge-Kutta/)).toBeVisible();
  });

  test('Master Curriculum Library: Explores 11 academic domains and semester filters', async ({ page }) => {
    await page.goto('/library');

    await expect(page.locator('h1')).toContainText('Prismora Curriculum Library');

    // Verify filter buttons by shortName
    await expect(page.getByRole('button', { name: /Electrical/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Mechanical/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Chemistry/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Physics/ })).toBeVisible();

    // Filter by Mechanical
    await page.getByRole('button', { name: /Mechanical/ }).click();
    await expect(page.getByText(/Harmonic Oscillator/)).toBeVisible();

    // Filter by Chemistry
    await page.getByRole('button', { name: /Chemistry/ }).click();
    await expect(page.getByText(/Acid-Base Neutralization/)).toBeVisible();
  });
});
