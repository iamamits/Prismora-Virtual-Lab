import { test, expect } from '@playwright/test';

test.describe('Prismora ECE Virtual Lab & Adders Reference Laboratory', () => {
  test('ECE catalog should present 12 categories, search, and working vs planned experiments', async ({
    page,
  }) => {
    await page.goto('/experiments/ece');

    // Hero title & Department banner
    await expect(page.locator('h1')).toContainText('Prismora ECE Virtual Lab');
    await expect(page.getByText('Department of Electronics & Communication Engineering')).toBeVisible();

    // Verify presence of core 12 categories
    await expect(page.getByRole('button', { name: 'Basic and Analog Electronics' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Digital Electronics and Logic Design' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Signals and Systems' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Analog and Digital Communication' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Digital Signal Processing' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Semiconductor Devices and Microelectronics' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'VLSI and Hardware Design' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Embedded Systems and Microcontrollers' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'RF, Antennas and Wireless Communication' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Computer Networks and Communication Protocols' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Information and Coding Theory' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Electronic Instrumentation and Measurements' })).toBeVisible();

    // Verify search functionality
    const searchInput = page.getByPlaceholder(/Search ECE experiments/);
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Adder');

    await expect(page.getByRole('heading', { name: 'Half Adder & Full Adder Virtual Laboratory' })).toBeVisible();

    // Clear search
    await searchInput.fill('');

    // Status filter
    await page.getByRole('button', { name: 'Interactive (Ready)' }).click();
    await expect(page.getByRole('heading', { name: 'Half Adder & Full Adder Virtual Laboratory' })).toBeVisible();
  });

  test('Adders Laboratory: should toggle switches, update outputs, highlight truth table, and verify', async ({
    page,
  }) => {
    await page.goto('/experiments/ece/adders');

    // Breadcrumbs & Title
    await expect(page.getByRole('button', { name: 'Half Adder' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Full Adder' })).toBeVisible();

    // Canvas Status
    await expect(page.getByText('Topological Evaluator Active')).toBeVisible();

    // Component Palette: open if not visible, verify, then close on mobile
    const paletteBtn = page.getByRole('button', { name: 'Palette' });
    if (!(await page.getByText('Component Library').isVisible())) {
      await paletteBtn.click();
    }
    await expect(page.getByText('Component Library')).toBeVisible();
    await expect(page.getByText('XOR Gate', { exact: true })).toBeVisible();
    await expect(page.getByText('AND Gate', { exact: true })).toBeVisible();

    // On mobile (< 1024px), close palette so canvas switch is clickable
    const isMobile = page.viewportSize() && page.viewportSize()!.width < 1024;
    if (isMobile) {
      await paletteBtn.click();
    }

    // Toggle Input Switch A: click switch on canvas
    const switchA = page.getByText('Input A').first();
    await expect(switchA).toBeVisible();
    await switchA.click();

    // On mobile, open Truth Table drawer if not visible
    const tableBtn = page.getByRole('button', { name: 'Table' });
    if (!(await page.getByText('Half Adder Truth Table').isVisible())) {
      await tableBtn.click();
    }
    await expect(page.getByText('Half Adder Truth Table')).toBeVisible();
    await expect(page.getByText('Observed Output:')).toBeVisible();

    // Click row 3 in Truth Table (index 3 is A=1, B=1)
    const rowBothOn = page.locator('tbody tr').nth(3);
    await rowBothOn.scrollIntoViewIfNeeded();
    await rowBothOn.click();

    // Run Automated Truth Table Verification
    const verifyBtn = page.getByRole('button', { name: 'Verify Truth Table' });
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    // Validation banner should announce success
    await expect(page.getByText('Circuit Scientifically Validated!')).toBeVisible();
    await expect(page.getByText('4 / 4 combinations verified')).toBeVisible();

    // Switch to Full Adder Mode
    await page.getByRole('button', { name: 'Full Adder' }).click();

    // On mobile, re-open table drawer if needed
    if (!(await page.getByText('Full Adder Truth Table').isVisible())) {
      await tableBtn.click();
    }
    await expect(page.getByText('Full Adder Truth Table')).toBeVisible();

    // Verify Full Adder
    await verifyBtn.click();
    await expect(page.getByText('Circuit Scientifically Validated!')).toBeVisible();
    await expect(page.getByText('8 / 8 combinations verified')).toBeVisible();
  });

  test('Adders Laboratory: should display Multi-Channel Logic Analyzer, Theory drawer, and Bug Reporting', async ({
    page,
  }) => {
    await page.goto('/experiments/ece/adders');

    // Logic Analyzer should be visible
    await expect(page.getByText('Multi-Channel Digital Logic Analyzer')).toBeVisible();
    await expect(page.getByText('Transition Events')).toBeVisible();

    // Open Theory Drawer
    const theoryToggleBtn = page.getByRole('button', { name: 'Theory' });
    await expect(theoryToggleBtn).toBeVisible();
    await theoryToggleBtn.click();

    // Theory Drawer tabs
    await expect(page.getByText('Half Adder Circuit Architecture')).toBeVisible();
    await expect(page.getByText('Sum (S) = A ⊕ B')).toBeVisible();

    // Procedure tab
    await page.getByRole('button', { name: 'Procedure', exact: true }).click();
    await expect(page.getByText('Virtual Laboratory Experimental Procedure')).toBeVisible();

    // Pitfalls tab
    await page.getByRole('button', { name: 'Pitfalls', exact: true }).click();
    await expect(page.getByText('Floating Inputs (Unconnected Pins)')).toBeVisible();

    // Quiz tab
    await page.getByRole('button', { name: 'Quiz', exact: true }).click();
    await expect(page.getByText('Knowledge Check & Review')).toBeVisible();
    await page.getByRole('button', { name: /Sum = A ⊕ B, Carry = A · B/ }).click();
    await page.getByRole('button', { name: 'Submit Answers' }).click();
    await expect(page.getByText('Correct!')).toBeVisible();

    // Bug Reporting Modal
    const bugBtn = page.getByRole('button', { name: 'Report Bug' });
    await expect(bugBtn).toBeVisible();
    await bugBtn.click();

    await expect(page.getByRole('heading', { name: 'Report a Bug / Scientific Issue' })).toBeVisible();
    const closeBtn = page.getByRole('button', { name: 'Close dialog' });
    await closeBtn.click();
  });
});
