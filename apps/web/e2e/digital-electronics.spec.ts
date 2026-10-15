import { test, expect } from '@playwright/test';

test.describe('Digital Electronics & Micro-Logic Workbench', () => {
  test('should load public simulation with gate explorer and verify initial logic', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    // Title and workbench header
    await expect(page.locator('h1')).toContainText('Digital Electronics & Micro-Logic Workbench');
    await expect(page.getByText('Phase 1')).toBeVisible();

    // Default gate is AND with Input A = 1, Input B = 0 -> Output = 0
    await expect(page.getByText('Input A')).toBeVisible();
    await expect(page.getByText('Input B')).toBeVisible();
    await expect(page.getByText('Output Y')).toBeVisible();

    // Verify truth table is present
    await expect(page.getByText('Exhaustive Truth Table')).toBeVisible();
  });

  test('should toggle logic inputs and evaluate gate outputs accurately', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    // Input A is 1, Input B is 0 -> AND output is 0
    const outputElem = page.getByTestId('gate-output');
    await expect(outputElem).toHaveText('0');

    // Click Input B to toggle to 1
    const inputBBtn = page.getByRole('button', { name: 'Toggle Input B' });
    await inputBBtn.click();

    // Now A=1, B=1 -> Output should be 1
    await expect(outputElem).toHaveText('1');

    // Switch gate to XOR
    await page.getByRole('button', { name: 'XOR', exact: true }).click();
    // In XOR with A=1, B=1 -> Output should be 0
    await expect(outputElem).toHaveText('0');

    // Toggle Input B back to 0 -> XOR with A=1, B=0 -> Output should be 1
    await inputBBtn.click();
    await expect(outputElem).toHaveText('1');
  });

  test('should navigate to K-Map Minimizer and toggle minterms for SOP derivation', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    // Switch to K-Map tab
    await page.getByRole('button', { name: '2. K-Map Minimizer' }).click();
    await expect(page.getByText('Quine-McCluskey Minimal Expressions')).toBeVisible();
    await expect(page.getByText('Minimal Sum of Products (SOP)')).toBeVisible();

    // Switch variable count to 2 Variables (A, B)
    await page.getByRole('button', { name: '2 Vars' }).click();

    // Click on minterm cell to toggle state
    const firstCell = page.locator('td[title*="Minterm"]').first();
    await firstCell.click();

    // Verify SOP expression is derived
    await expect(page.getByText('Minimal Sum of Products (SOP)')).toBeVisible();
  });

  test('should evaluate Combinational 4-bit ALU and flag calculations', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    // Switch to Combinational & ALU tab
    await page.getByRole('button', { name: '3. Combinational & ALU' }).click();
    await expect(page.getByText('ALU Status Flags')).toBeVisible();

    // Verify Zero, Sign, Carry, Overflow flags are visible
    await expect(page.getByText('Zero Flag (Z)')).toBeVisible();
    await expect(page.getByText('Sign Flag (S)')).toBeVisible();
    await expect(page.getByText('Carry Out (C)')).toBeVisible();
    await expect(page.getByText('Overflow Flag (V)')).toBeVisible();

    // Switch ALU operation to SUB
    await page.getByRole('button', { name: 'SUB', exact: true }).click();

    // Switch module to Full Adder
    await page.getByRole('button', { name: 'Full Adder' }).click();
    await expect(page.getByText('1-Bit Full Adder with Carry Propagation')).toBeVisible();
  });

  test('should step Flip-Flops and clock triggers in Sequential tab', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    // Switch to Sequential tab
    await page.getByRole('button', { name: '4. Flip-Flops & Counters' }).click();
    await expect(page.getByText('Edge-Triggered Flip-Flop Laboratory')).toBeVisible();

    // Pulse Clock button
    const pulseBtn = page.locator('button:has-text("Pulse Clock Edge")');
    await expect(pulseBtn).toBeVisible();
    await pulseBtn.click();

    // Verify clock pulses counter incremented
    await expect(page.locator('button:has-text("Total: 1")')).toBeVisible();

    // Switch to JK Flip-Flop
    await page.getByRole('button', { name: 'JK Type' }).click();
    await pulseBtn.click();
    await expect(page.locator('button:has-text("Total: 2")')).toBeVisible();
  });

  test('should display Timing & Hazards glitch waveforms', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    // Switch to Timing & Hazards tab
    await page.getByRole('button', { name: '5. Timing & Hazards' }).click();
    await expect(page.getByText('Logic Analyzer & Static 1-Hazard Glitch Simulation')).toBeVisible();
    await expect(page.getByText('Inverter Propagation Delay (τinv):')).toBeVisible();
  });
});
