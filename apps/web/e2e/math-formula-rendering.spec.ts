import { test, expect } from '@playwright/test';

test.describe('Prismora Mathematical Formula Rendering (KaTeX)', () => {
  test('Catalog cards render formulas via KaTeX without raw LaTeX leak', async ({ page }) => {
    await page.goto('/labs');
    await page.waitForLoadState('domcontentloaded');

    // Wait for laboratories header
    await expect(page.locator('h1')).toContainText('Prismora Laboratories');

    // Check that KaTeX elements are rendered inside cards with equations
    const katexElements = page.locator('.katex');
    await expect(katexElements.first()).toBeVisible({ timeout: 10000 });
    const count = await katexElements.count();
    expect(count).toBeGreaterThan(0);

    // Verify no raw LaTeX command text is displayed in card footers or previews
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('\\frac{');
    expect(bodyText).not.toContain('\\left(');
    expect(bodyText).not.toContain('\\right)');
  });

  test('ECE Diode Rectifier lab renders Shockley equation and dynamic resistance', async ({ page }) => {
    await page.goto('/experiments/ece/diode-rectifier');
    await page.waitForLoadState('domcontentloaded');

    // Wait for interactive buttons
    const theoryDrawerBtn = page.getByRole('button', { name: 'Theory & Steps' });
    await expect(theoryDrawerBtn).toBeVisible();

    // Open theory drawer (with retry until hydration is active)
    const theoryHeader = page.getByText('Governing Mathematical Formulations');
    await expect(async () => {
      if (!(await theoryHeader.isVisible())) {
        await theoryDrawerBtn.click();
      }
      await expect(theoryHeader).toBeVisible();
    }).toPass({ timeout: 10000 });

    const theorySection = theoryHeader.locator('..');
    const katexInTheory = theorySection.locator('.katex');
    await expect(katexInTheory.first()).toBeVisible();

    // Ensure rendered HTML contains KaTeX visual representation without raw LaTeX macros
    const text = await theorySection.innerText();
    expect(text).not.toContain('\\frac');
    expect(text).not.toContain('\\eta');
    expect(text).not.toContain('\\left');
  });

  test('Digital Electronics workbench renders logic formulas via KaTeX', async ({ page }) => {
    await page.goto('/experiments/digital-electronics');
    await page.waitForLoadState('domcontentloaded');

    // Switch to Understand / Theory tab
    const understandTab = page.locator('button:has-text("Understand")');
    await expect(understandTab).toBeVisible();
    await understandTab.click();

    // Verify formulas header is visible
    await expect(page.locator('text=Fundamental Mathematical & Boolean Equations:')).toBeVisible();

    // Verify .katex elements are rendered inside the equations container
    const equationsContainer = page.locator('text=Fundamental Mathematical & Boolean Equations:').locator('..');
    const katexFormulas = equationsContainer.locator('.katex');
    await expect(katexFormulas.first()).toBeVisible();
    const formulaCount = await katexFormulas.count();
    expect(formulaCount).toBeGreaterThanOrEqual(4);

    // Verify no unparsed LaTeX backslashes leaked to user
    const equationsText = await equationsContainer.innerText();
    expect(equationsText).not.toContain('\\oplus');
    expect(equationsText).not.toContain('\\cdot');
    expect(equationsText).not.toContain('\\overline');
  });

  test('ECE Adders lab renders Boolean formulations via KaTeX', async ({ page }) => {
    await page.goto('/experiments/ece/adders');
    await page.waitForLoadState('domcontentloaded');

    // Toggle theory drawer if not open
    const theoryToggleBtn = page.getByRole('button', { name: 'Toggle Theory & Procedure' });
    if (!(await page.getByText('Analytical Boolean Formulations').isVisible())) {
      await theoryToggleBtn.click();
    }
    await expect(page.getByText('Analytical Boolean Formulations')).toBeVisible();

    // Check KaTeX elements in theory drawer
    const theoryDrawer = page.getByText('Analytical Boolean Formulations').locator('..');
    const katexElements = theoryDrawer.locator('.katex');
    await expect(katexElements.first()).toBeVisible();

    const drawerText = await theoryDrawer.innerText();
    expect(drawerText).not.toContain('\\oplus');
    expect(drawerText).not.toContain('\\cdot');
  });

  test('Projectile Motion workspace renders live equations with KaTeX symbols', async ({ page }) => {
    await page.goto('/experiments/projectile-motion');
    await page.waitForLoadState('domcontentloaded');

    // On mobile, open drawer if needed
    const openDrawerBtn = page.locator('button:has-text("Controls & Analysis")');
    if (await openDrawerBtn.isVisible()) {
      await openDrawerBtn.click();
    }

    // Switch to Formulas tab
    const formulasTabBtn = page.locator('button:has-text("Formulas")');
    await expect(formulasTabBtn).toBeVisible();
    await formulasTabBtn.click();

    // Verify Equations of Motion card is rendered
    await expect(page.locator('text=Equations of Motion & State')).toBeVisible();

    // Verify KaTeX rendered components exist
    const katexElements = page.locator('.katex');
    await expect(katexElements.first()).toBeVisible();

    const liveEquationsText = await page.locator('text=Equations of Motion & State').locator('../../..').innerText();
    expect(liveEquationsText).not.toContain('\\cos');
    expect(liveEquationsText).not.toContain('\\sin');
    expect(liveEquationsText).not.toContain('\\frac');
  });

  test('Formulas handle narrow mobile viewports without layout breaking', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/experiments/ece');
    await page.waitForLoadState('domcontentloaded');

    // Verify KaTeX formulas are present
    const formulaCard = page.locator('.katex').first();
    await expect(formulaCard).toBeVisible();

    // Verify page horizontal scroll width is within limits
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowInnerWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(windowInnerWidth + 5);
  });
});
