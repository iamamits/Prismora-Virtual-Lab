import { test, expect } from '@playwright/test';

test.describe('Theory of Computation (TOC) & Formal Languages Studio', () => {
  test('should load public simulation with DFA state graph and verify initial acceptance', async ({ page }) => {
    await page.goto('/experiments/toc');

    // Title and workbench badge
    await expect(page.locator('h1')).toContainText('Automata, Grammars & Turing Machine Studio');
    await expect(page.getByText('Phase 3')).toBeVisible();

    // Default DFA is "Ends in 01", test string "1001"
    await expect(page.getByText('Ends in 01 • Interactive State Graph')).toBeVisible();
    await expect(page.getByText('STRING ACCEPTED')).toBeVisible();

    // Execution history should be visible
    await expect(page.getByText('Execution History:')).toBeVisible();
  });

  test('should step through DFA state transitions for input string', async ({ page }) => {
    await page.goto('/experiments/toc');

    // Test input string input
    const inputField = page.locator('input[type="text"]').first();
    await inputField.fill('1000');

    // Should update to rejected because it ends in '00' not '01'
    await expect(page.getByText('STRING REJECTED')).toBeVisible();

    // Step symbol button
    const stepBtn = page.getByRole('button', { name: 'Step Symbol' });
    await expect(stepBtn).toBeVisible();
    await stepBtn.click();

    // Reset button
    const resetBtn = page.getByRole('button', { name: 'Reset' });
    await resetBtn.click();
  });

  test('should convert NFA to DFA via subset construction and minimize states', async ({ page }) => {
    await page.goto('/experiments/toc');

    // Minimize DFA button
    const minimizeBtn = page.getByRole('button', { name: 'Minimize DFA' });
    await expect(minimizeBtn).toBeVisible();
    await minimizeBtn.click();

    // Convert NFA button
    const convertBtn = page.getByRole('button', { name: 'Convert NFA → DFA' });
    await expect(convertBtn).toBeVisible();
    await convertBtn.click();
  });

  test('should build Thompson NFA from Regular Expression and test strings', async ({ page }) => {
    await page.goto('/experiments/toc');

    // Switch to Regex & Thompson tab
    await page.getByRole('button', { name: '2. Regex & Thompson' }).click();
    await expect(page.getByText('Regular Expression → ε-NFA Thompson Construction')).toBeVisible();

    // Check transition list
    await expect(page.getByText('Constructed ε-NFA Transitions')).toBeVisible();

    // Test string verification
    await expect(page.getByText('MATCHES REGEX')).toBeVisible();

    // Click Build NFA button
    const buildBtn = page.getByRole('button', { name: 'Build NFA' });
    await expect(buildBtn).toBeVisible();
    await buildBtn.click();
  });

  test('should parse context-free language using CYK dynamic programming table', async ({ page }) => {
    await page.goto('/experiments/toc');

    // Switch to CFG & CYK tab
    await page.getByRole('button', { name: '3. CFG & CYK' }).click();
    await expect(page.getByText('CYK Membership Algorithm')).toBeVisible();
    await expect(page.getByText('ACCEPTED IN L')).toBeVisible();

    // CYK table should have Length rows
    await expect(page.getByText('Len 1')).toBeVisible();
    await expect(page.getByText('Len 2')).toBeVisible();
  });

  test('should step Turing Machine on bidirectional tape', async ({ page }) => {
    await page.goto('/experiments/toc');

    // Switch to Turing Machine tab
    await page.getByRole('button', { name: '4. Turing Machine' }).click();
    await expect(page.getByText('Deterministic Turing Machine • Binary Incrementer (+1)')).toBeVisible();

    // Step TM button
    const stepBtn = page.getByRole('button', { name: 'Step Tape' });
    await expect(stepBtn).toBeVisible();
    await stepBtn.click();

    // Step again
    await stepBtn.click();

    // Reset button
    const resetBtn = page.getByRole('button', { name: 'Reset', exact: true });
    await expect(resetBtn).toBeVisible();
    await resetBtn.click();
  });
});
