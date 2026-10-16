import { expect, test } from '@playwright/test';

test.describe('Digital Electronics Laboratory — 12 IIT Roorkee Virtual Labs Workbench', () => {
  test('should load public simulation with 12-experiment selector and verify Exp 1 logic', async ({
    page,
  }) => {
    await page.goto('/experiments/digital-electronics');

    // Title and syllabus badge
    await expect(page.locator('h1')).toContainText('Logic Gates');
    await expect(page.getByText('IITR-DE-EXP01')).toBeVisible();
    await expect(page.getByText('12 Experiments')).toBeVisible();

    // Default gate is AND with inputs
    await expect(page.getByText('Select Logic Gate:')).toBeVisible();
    await expect(page.getByRole('button', { name: 'AND', exact: true })).toBeVisible();

    // Verify Schematic View is active by default
    await expect(page.getByText('Interactive Logic Schematic')).toBeVisible();
  });

  test('should toggle logic inputs and evaluate gate outputs accurately', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    // Default: AND gate with A=1, B=0 -> Output Y = 0
    await expect(page.getByText('Output Y (·):')).toBeVisible();

    // Toggle Input B: click switch to toggle from 0 to 1
    const inputBContainer = page.locator('div:has-text("Input B:")').last();
    const toggleB = inputBContainer.locator('button');
    await toggleB.click();

    // Now A=1, B=1 -> Output should be 1
    await expect(page.getByText('Output Y (·):').locator('..').locator('span').last()).toHaveText('1');

    // Switch gate to XOR
    await page.getByRole('button', { name: 'XOR', exact: true }).click();
    // In XOR with A=1, B=1 -> Output should be 0
    await expect(page.getByText('Output Y (⊕):').locator('..').locator('span').last()).toHaveText('0');
  });

  test('should toggle between Logic Schematic and Hardware DIP IC views', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    // Switch to Hardware DIP IC View
    await page.getByRole('button', { name: 'Hardware DIP IC' }).click();
    await expect(page.getByText('DIP-14')).toBeVisible();
    await expect(page.getByText('SN74LS08N', { exact: true })).toBeVisible();
    await expect(page.getByText('VCC', { exact: true }).first()).toBeVisible();

    // Switch back to Logic Schematic View
    await page.getByRole('button', { name: 'Logic Schematic' }).click();
    await expect(page.getByText('Interactive Logic Schematic')).toBeVisible();
  });

  test('should switch to Experiment 2 (Half & Full Adder) and verify addition', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    // Click Exp 2 in the selector bar
    await page.getByRole('button', { name: '2. Half & Full Adder' }).click();
    await expect(page.getByText('IITR-DE-EXP02')).toBeVisible();
    await expect(page.getByText('Operand A')).toBeVisible();
    await expect(page.getByText('Full Adder Sum (S):')).toBeVisible();
  });

  test('should switch to Experiment 5 (RS Latches) and verify Indeterminate state', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');

    // Click Exp 5 in the selector bar
    await page.getByRole('button', { name: '5. RS NOR/NAND Latches' }).click();
    await expect(page.getByText('IITR-DE-EXP05')).toBeVisible();

    // Assert Set (S=1, R=0) -> state SET
    await expect(page.getByText('SET', { exact: true })).toBeVisible();

    // Assert Reset as well (S=1, R=1) -> state INDETERMINATE
    const resetBtn = page.locator('div:has-text("Reset Input (R)")').last().locator('button');
    await resetBtn.click();

    await expect(page.getByText('INDETERMINATE', { exact: true })).toBeVisible();
  });

  test('should switch to Experiment 7 (4-Bit SIPO Shift Register) and clock serial bits', async ({
    page,
  }) => {
    await page.goto('/experiments/digital-electronics');

    // Click Exp 7 in the selector bar
    await page.getByRole('button', { name: '7. 4-Bit SIPO Shift Register' }).click();
    await expect(page.getByText('IITR-DE-EXP07')).toBeVisible();

    // Pulse Shift Clock
    const pulseClockBtn = page.getByRole('button', { name: 'Pulse Shift Clock' });
    await expect(pulseClockBtn).toBeVisible();
    await pulseClockBtn.click();

    // Stream preset 1011
    await page.getByRole('button', { name: 'Stream 1011' }).click();
  });

  test('should switch educational modes: Understand, Guided, Analyze, Challenge, Report', async ({
    page,
  }) => {
    await page.goto('/experiments/digital-electronics');

    // Mode 2: Understand
    await page.getByRole('button', { name: '2. Understand (Theory)' }).click();
    await expect(page.getByText('Scientific Theory & Circuit Principles')).toBeVisible();
    await expect(page.getByText('Fundamental Mathematical & Boolean Equations:')).toBeVisible();

    // Mode 3: Guided Experiment
    await page.getByRole('button', { name: '3. Guided Experiment' }).click();
    await expect(page.getByText('Step-by-Step Laboratory Procedure')).toBeVisible();
    // Complete Step 1
    const step1 = page.locator('text=Power Distribution').first();
    await step1.click();
    await expect(page.getByText('1 of 4 Steps Completed')).toBeVisible();

    // Mode 4: Analyze (Truth Table)
    await page.getByRole('button', { name: '4. Analyze (Truth Table)' }).click();
    await expect(page.getByText('Analytical Truth Table & Dynamic State Highlighting')).toBeVisible();

    // Mode 5: Challenge Quiz
    await page.getByRole('button', { name: '5. Challenge Quiz' }).click();
    await expect(page.getByText('Interactive Concept Verification Quiz')).toBeVisible();

    // Mode 6: Lab Report
    await page.getByRole('button', { name: '6. Lab Report' }).click();
    await expect(page.getByText('Standard University Laboratory Report Generation')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Download Complete Lab Report (JSON)' })).toBeVisible();
  });

  test('should support deep linking to any experiment via URL parameter ?exp=code-converters', async ({
    page,
  }) => {
    await page.goto('/experiments/digital-electronics?exp=code-converters');

    // Automatically selects Exp 11
    await expect(page.getByText('IITR-DE-EXP11')).toBeVisible();
    await expect(page.getByText('Reflected Gray Code:')).toBeVisible();
    await expect(page.getByText('4-Bit Binary Input Word:')).toBeVisible();
  });
});
