import { test, expect } from '@playwright/test';

test.describe('Computer Organization & Architecture (COA) RISC-V Workbench', () => {
  test('should load public simulation with RV32I datapath and verify initial state', async ({ page }) => {
    await page.goto('/experiments/coa');

    // Title and workbench badge
    await expect(page.locator('h1')).toContainText('RISC-V Microarchitecture & Memory Hierarchy Lab');
    await expect(page.getByText('Phase 2')).toBeVisible();

    // Datapath components should be visible
    await expect(page.getByText('RV32I Harvard Datapath Execution')).toBeVisible();
    await expect(page.getByText('Instruction Fetch')).toBeVisible();
    await expect(page.getByText('Decode & Regs')).toBeVisible();
    await expect(page.getByText('Execute (ALU)')).toBeVisible();
    await expect(page.getByText('Memory & Writeback')).toBeVisible();

    // Check PC value
    await expect(page.getByText('0x0000')).toBeVisible();
  });

  test('should step instructions through Single-Cycle CPU and update datapath registers', async ({ page }) => {
    await page.goto('/experiments/coa');

    // Step instruction
    const stepBtn = page.getByRole('button', { name: 'Step Instruction' });
    await expect(stepBtn).toBeVisible();
    await stepBtn.click();

    // Cycles should advance to 1
    await expect(page.getByText('Cycles: 1')).toBeVisible();

    // Step again
    await stepBtn.click();
    await expect(page.getByText('Cycles: 2')).toBeVisible();

    // Reset PC
    await page.getByRole('button', { name: 'Reset PC' }).click();
    await expect(page.getByText('Cycles: 0')).toBeVisible();
  });

  test('should switch educational programs and observe dynamic datapath changes', async ({ page }) => {
    await page.goto('/experiments/coa');

    // Select factorial program
    await page.getByRole('button', { name: 'factorial' }).click();

    // Step instruction in factorial
    await page.getByRole('button', { name: 'Step Instruction' }).click();
    await expect(page.getByText('Cycles: 1')).toBeVisible();

    // Select arraySum program
    await page.getByRole('button', { name: 'arraySum' }).click();
    await expect(page.getByText('Cycles: 0')).toBeVisible();
  });

  test('should simulate 5-Stage Classic Pipeline and detect pipeline cycles', async ({ page }) => {
    await page.goto('/experiments/coa');

    // Switch to 5-Stage Pipeline tab
    await page.getByRole('button', { name: '2. 5-Stage Pipeline' }).click();
    await expect(page.getByText('5-Stage Classic Pipeline')).toBeVisible();

    // Verify stages are rendered
    await expect(page.getByText('1. IF (Fetch)')).toBeVisible();
    await expect(page.getByText('2. ID (Decode)')).toBeVisible();
    await expect(page.getByText('3. EX (Execute)')).toBeVisible();
    await expect(page.getByText('4. MEM (Memory)')).toBeVisible();
    await expect(page.getByText('5. WB (Writeback)')).toBeVisible();

    // Clock cycle
    const clockBtn = page.getByRole('button', { name: 'Clock Cycle (↑)' });
    await expect(clockBtn).toBeVisible();
    await clockBtn.click();

    // Verify Cycle count incremented
    await expect(page.getByText('Cycle Count:')).toBeVisible();
  });

  test('should inspect Assembly & 32-Register file', async ({ page }) => {
    await page.goto('/experiments/coa');

    // Switch to Assembly & Registers tab
    await page.getByRole('button', { name: '3. Assembly & Registers' }).click();
    await expect(page.getByText('RV32I Assembly Editor')).toBeVisible();
    await expect(page.getByText('Register File ($x0 - $x31)')).toBeVisible();

    // Check registers are listed with ABI names
    await expect(page.getByText('x0 (zero)')).toBeVisible();
    await expect(page.getByText('x1 (ra)')).toBeVisible();
    await expect(page.getByText('x2 (sp)')).toBeVisible();
  });

  test('should simulate L1 Cache accesses and calculate hit/miss rates', async ({ page }) => {
    await page.goto('/experiments/coa');

    // Switch to Cache tab
    await page.getByRole('button', { name: '4. Cache Hierarchy' }).click();
    await expect(page.getByText('L1 Cache Simulator & Address Breakdown')).toBeVisible();

    // Click Access on address 0x100
    const accessBtn = page.getByRole('button', { name: 'Access' });
    await expect(accessBtn).toBeVisible();
    await accessBtn.click();

    // First access is a compulsory miss
    await expect(page.getByText('Misses')).toBeVisible();

    // Access the same address again -> should be a Hit!
    await accessBtn.click();
    await expect(page.getByText('Hits')).toBeVisible();
  });
});
