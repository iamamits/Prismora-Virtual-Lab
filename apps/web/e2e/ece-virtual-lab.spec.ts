import { test, expect } from '@playwright/test';

test.describe('Prismora ECE Virtual Lab — Comprehensive Suite', () => {
  test('ECE catalog should present 200-topic curriculum, responsive filter rail, and spec detail modal in pure light theme', async ({
    page,
  }) => {
    await page.goto('/experiments/ece');

    // Hero title & Department banner
    await expect(page.locator('h1')).toContainText('Prismora ECE Virtual Laboratory');
    await expect(page.getByText('Department of Electronics & Communication Engineering')).toBeVisible();
    await expect(page.getByText('200 Topic Standardized Curriculum')).toBeVisible();

    // Verify presence of Spotlight Flagship Cards
    await expect(page.getByRole('heading', { name: 'Half & Full Adder Virtual Lab' })).toBeVisible();
    await expect(page.getByRole('heading', { name: "Ohm's Law & DC Circuits Lab" })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'PN Junction Diode & Rectifiers Lab' })).toBeVisible();

    // On mobile, expand filter drawer if needed
    const showFilterBtn = page.getByRole('button', { name: 'Show Filters' });
    if (await showFilterBtn.isVisible()) {
      await showFilterBtn.click();
    }

    // Verify Discipline Filter Rail buttons
    await expect(page.getByRole('button', { name: 'Electrical Fundamentals and Network Analysis' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Basic Electronics and Semiconductor Devices' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Digital Electronics and Logic Design' })).toBeVisible();

    // Test Search Filtering
    const searchInput = page.getByPlaceholder('Search 200 ECE topics...');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('Thevenin');

    await expect(page.getByText("Thevenin's Theorem & Equivalent Circuit Extraction")).toBeVisible();

    // Test Spec Detail Modal
    const viewSpecBtn = page.getByRole('button', { name: 'View Spec' }).first();
    await expect(viewSpecBtn).toBeVisible();
    await viewSpecBtn.click();

    await expect(page.getByRole('heading', { name: 'Academic Overview' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Learning Objectives' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Required Instruments & Capabilities' })).toBeVisible();

    const closeSpecBtn = page.getByRole('button', { name: 'Close Specification' });
    await expect(closeSpecBtn).toBeVisible();
    await closeSpecBtn.click();
    await expect(page.getByRole('heading', { name: 'Academic Overview' })).not.toBeVisible();

    // Clear search
    await searchInput.fill('');
    await page.getByRole('button', { name: 'Interactive Ready' }).first().click();
    await expect(page.getByRole('heading', { name: "Ohm's Law & DC Electrical Circuits Laboratory" })).toBeVisible();
  });

  test('Adders Laboratory: should execute in pure light theme, auto-verify truth table, and record analyzer traces', async ({
    page,
  }) => {
    await page.goto('/experiments/ece/adders');

    // Breadcrumbs & Title
    await expect(page.getByRole('button', { name: 'Half Adder' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Full Adder' })).toBeVisible();

    // Canvas Status
    await expect(page.getByText('Topological Evaluator Active')).toBeVisible();

    // Component Palette: on mobile click toggle, on desktop it opens automatically
    const isMobile = page.viewportSize() && page.viewportSize()!.width < 1024;
    const paletteBtn = page.getByRole('button', { name: 'Toggle Component Palette' });
    if (isMobile) {
      await paletteBtn.click();
    }
    await expect(page.getByText('Component Library')).toBeVisible();
    await expect(page.getByText('XOR Gate', { exact: true })).toBeVisible();
    await expect(page.getByText('AND Gate', { exact: true })).toBeVisible();

    // On mobile, close palette so canvas switch is accessible
    if (isMobile) {
      await paletteBtn.click();
    }

    // Toggle Input Switch A: click switch on canvas
    const switchA = page.getByText('Input A').first();
    await expect(switchA).toBeVisible();
    await switchA.click();

    // Truth Table: on mobile click toggle, on desktop it opens automatically
    const tableBtn = page.getByRole('button', { name: 'Toggle Truth Table' });
    if (isMobile && !(await page.getByText('Half Adder Truth Table').isVisible())) {
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

    // Logic Analyzer should be visible
    await expect(page.getByText('Multi-Channel Digital Logic Analyzer')).toBeVisible();
    await expect(page.getByText('Transition Events')).toBeVisible();

    // Open Theory Drawer
    const theoryToggleBtn = page.getByRole('button', { name: 'Toggle Theory & Procedure' });
    if (!(await page.getByText('Full Adder Circuit Architecture').isVisible())) {
      await theoryToggleBtn.click();
    }

    // Theory Drawer tabs
    await expect(page.getByText('Full Adder Circuit Architecture')).toBeVisible();
    await expect(page.getByText('Sum (S) = A ⊕ B ⊕ Cin')).toBeVisible();

    // Procedure tab
    await page.getByRole('button', { name: 'Procedure', exact: true }).click();
    await expect(page.getByText('Virtual Laboratory Experimental Procedure')).toBeVisible();

    // Pitfalls tab
    await page.getByRole('button', { name: 'Pitfalls', exact: true }).click();
    await expect(page.getByText('Floating Inputs (Unconnected Pins)')).toBeVisible();

    // Quiz tab
    await page.getByRole('button', { name: 'Quiz', exact: true }).click();
    await expect(page.getByText('Knowledge Check & Review')).toBeVisible();
    await page.getByRole('button', { name: /2 Half Adders and 1 OR gate/ }).click();
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

  test("Ohm's Law Laboratory: should adjust DC bench supply voltage, actuate switch lever, glow incandescent bulb, and probe DMM", async ({
    page,
  }) => {
    await page.goto('/experiments/ece/ohms-law');

    // Title and bench supply
    await expect(page.getByText("Ohm's Law", { exact: true })).toBeVisible();
    await expect(page.getByText('PRISMORA PS-3005D')).toBeVisible();
    await expect(page.getByText('12.00V').first()).toBeVisible();

    // Knife Switch is CLOSED initially
    await expect(page.getByText('Main Switch')).toBeVisible();
    await expect(page.getByText('CLOSED', { exact: true })).toBeVisible();

    // Multimeter should display live voltage reading
    await expect(page.getByText('PRISMORA DMM-800')).toBeVisible();

    // Actuate knife switch by clicking the knife switch component
    const knifeSwitch = page.locator('div[title*="Knife Switch"]');
    await expect(knifeSwitch).toBeVisible();
    await knifeSwitch.click();

    // Now switch is OPEN
    await expect(page.getByText('OPEN', { exact: true })).toBeVisible();

    // Close knife switch back
    await knifeSwitch.click();
    await expect(page.getByText('CLOSED', { exact: true })).toBeVisible();

    // Switch mode to Linear Resistor
    await page.getByRole('button', { name: 'Linear Resistor' }).click();
    await expect(page.getByText('Ceramic Resistor')).toBeVisible();

    // Test Multimeter Mode Changing (Current DCA)
    const dcaBtn = page.getByRole('button', { name: 'A ⎓' });
    await expect(dcaBtn).toBeVisible();
    await dcaBtn.click();
    await expect(page.getByText('DCA')).toBeVisible();

    // Theory drawer
    if (!(await page.getByRole('heading', { name: "Ohm's Law & Electrical Energy" }).isVisible())) {
      const theoryBtn = page.getByRole('button', { name: 'Theory & Steps' });
      await theoryBtn.click();
    }
    await expect(page.getByRole('heading', { name: "Ohm's Law & Electrical Energy" })).toBeVisible();
    await expect(page.getByText('V = I · R')).toBeVisible();
  });

  test('Diode & Rectifiers Laboratory: should sweep I-V curve, capture dual-trace oscilloscope waveforms, and filter ripple', async ({
    page,
  }) => {
    await page.goto('/experiments/ece/diode-rectifier');

    // Title and Top Navigation
    await expect(page.getByText('Diodes & Rectifiers')).toBeVisible();

    // Default mode is Half-Wave Rectifier
    await expect(page.getByRole('button', { name: 'Half-Wave Rectifier' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Bridge Rectifier' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Diode I-V Curve' })).toBeVisible();

    // Oscilloscope is visible with dual traces
    await expect(page.getByText('PRISMORA DSO-2000 DUAL-TRACE OSCILLOSCOPE')).toBeVisible();
    await expect(page.getByText('CH1: AC Input (V_in)').first()).toBeVisible();
    await expect(page.getByText('CH2: Half-Wave Output (V_out)').first()).toBeVisible();

    // Check analytical metrics in HUD
    const rippleText = page.getByText('Ripple Factor (r)', { exact: true });
    await rippleText.scrollIntoViewIfNeeded();
    await expect(rippleText).toBeVisible();

    // Toggle capacitor filter ON
    const filterToggleBtn = page.getByRole('button', { name: /Smoothing Capacitor Filter/ });
    await expect(filterToggleBtn).toBeVisible();
    await filterToggleBtn.click();

    // Filter button now reads ON
    await expect(page.getByRole('button', { name: 'Smoothing Capacitor Filter: ON' })).toBeVisible();

    // Switch to Full-Wave Bridge Rectifier
    await page.getByRole('button', { name: 'Bridge Rectifier' }).click();
    await expect(page.getByText('Rectification Efficiency')).toBeVisible();

    // Switch to Diode I-V Characterization
    await page.getByRole('button', { name: 'Diode I-V Curve' }).click();
    await expect(page.getByText('PN Junction Diode DC I-V Characteristic')).toBeVisible();

    // Toggle material to Germanium
    await page.getByRole('button', { name: 'Germanium (0.3V)' }).click();
    await expect(page.getByText('Germanium PN Junction Diode DC I-V Characteristic')).toBeVisible();
    await expect(page.getByText('Knee V_γ ≈ 0.30 V')).toBeVisible();
  });
});
