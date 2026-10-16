import { describe, it, expect } from 'vitest';
import {
  safeRenderLatex,
  sanitizeToCleanMathText,
  parseMathString,
} from '@prismora/ui';

describe('Prismora Mathematical Formula Rendering System', () => {
  const getVisibleHtml = (html: string) => html.split('class="katex-html"')[1] || '';

  describe('Diode Shockley & ECE Governing Formulations', () => {
    it('renders the classic Shockley diode equation without error or raw command leakage in visible HTML', () => {
      const shockley = 'I_D = I_s \\left( e^{\\frac{V_D}{\\eta V_T}} - 1 \\right)';
      const result = safeRenderLatex(shockley, true);

      expect(result.isError).toBe(false);
      expect(result.html).toContain('katex');

      const visible = getVisibleHtml(result.html);
      expect(visible).toContain('I');
      expect(visible).toContain('D');
      expect(visible).toContain('V');
      expect(visible).toContain('η');
      expect(visible).toContain('mfrac');
      expect(visible).not.toContain('\\frac');
      expect(visible).not.toContain('\\left');
      expect(visible).not.toContain('\\right');
      expect(visible).not.toContain('\\eta');
    });

    it('renders dynamic diode resistance with fraction and Greek eta', () => {
      const rd = 'r_d = \\frac{\\eta V_T}{I_D}';
      const result = safeRenderLatex(rd, false);

      expect(result.isError).toBe(false);
      expect(result.html).toContain('katex');

      const visible = getVisibleHtml(result.html);
      expect(visible).toContain('η');
      expect(visible).toContain('mfrac');
      expect(visible).not.toContain('\\frac');
    });

    it('renders second-order differential equation roots with plus-minus and square root', () => {
      const roots = 's_{1,2} = -\\alpha \\pm \\sqrt{\\alpha^2 - \\omega_0^2}';
      const result = safeRenderLatex(roots, true);

      expect(result.isError).toBe(false);
      expect(result.html).toContain('katex');

      const visible = getVisibleHtml(result.html);
      expect(visible).toContain('±');
      expect(visible).toContain('α');
      expect(visible).toContain('ω');
      expect(visible).toContain('sqrt');
      expect(visible).not.toContain('\\pm');
      expect(visible).not.toContain('\\sqrt');
      expect(visible).not.toContain('\\alpha');
      expect(visible).not.toContain('\\omega');
    });

    it('renders Friis transmission equation with square powers and nested fractions', () => {
      const friis = '\\frac{P_r}{P_t} = G_t G_r \\left(\\frac{\\lambda}{4\\pi d}\\right)^2';
      const result = safeRenderLatex(friis, true);

      expect(result.isError).toBe(false);
      expect(result.html).toContain('katex');

      const visible = getVisibleHtml(result.html);
      expect(visible).toContain('λ');
      expect(visible).toContain('π');
      expect(visible).toContain('mfrac');
      expect(visible).not.toContain('\\lambda');
      expect(visible).not.toContain('\\pi');
    });

    it('renders Fourier series with summation, infinity limit, and trig functions', () => {
      const fourier = 'x(t) = a_0 + \\sum_{n=1}^{\\infty} \\left[a_n \\cos(n \\omega_0 t) + b_n \\sin(n \\omega_0 t)\\right]';
      const result = safeRenderLatex(fourier, true);

      expect(result.isError).toBe(false);
      expect(result.html).toContain('katex');

      const visible = getVisibleHtml(result.html);
      expect(visible).toContain('∑');
      expect(visible).toContain('∞');
      expect(visible).not.toContain('\\sum');
      expect(visible).not.toContain('\\infty');
    });

    it('renders Boolean logic formulation with exclusive-OR symbol', () => {
      const fullAdderSum = 'S = A \\oplus B \\oplus C_{in}';
      const result = safeRenderLatex(fullAdderSum, false);

      expect(result.isError).toBe(false);
      expect(result.html).toContain('katex');

      const visible = getVisibleHtml(result.html);
      expect(visible).toContain('⊕');
      expect(visible).not.toContain('\\oplus');
    });
  });

  describe('Mixed Text & Delimiter Parser (parseMathString)', () => {
    it('parses mixed text with inline $...$ math blocks', () => {
      const text = 'The terminal voltage is $V_T = 26\\text{mV}$ under room temperature.';
      const segments = parseMathString(text);

      expect(segments).toHaveLength(3);
      expect(segments[0]).toEqual({ type: 'text', content: 'The terminal voltage is ' });
      expect(segments[1]).toEqual({ type: 'inline-math', content: 'V_T = 26\\text{mV}' });
      expect(segments[2]).toEqual({ type: 'text', content: ' under room temperature.' });
    });

    it('parses display math blocks with $$...$$ delimiters', () => {
      const text = 'Governing equation:\n$$P = \\frac{V^2}{R}$$\nwhere P is power.';
      const segments = parseMathString(text);

      expect(segments).toHaveLength(3);
      expect(segments[0]).toEqual({ type: 'text', content: 'Governing equation:\n' });
      expect(segments[1]).toEqual({ type: 'display-math', content: 'P = \\frac{V^2}{R}' });
      expect(segments[2]).toEqual({ type: 'text', content: '\nwhere P is power.' });
    });

    it('handles strings without any math delimiters as a single text segment', () => {
      const plain = 'Simple textual description without math';
      const segments = parseMathString(plain);

      expect(segments).toHaveLength(1);
      expect(segments[0]).toEqual({ type: 'text', content: plain });
    });
  });

  describe('Sanitization & Fallback Safety (sanitizeToCleanMathText)', () => {
    it('converts Shockley diode equation to clean, accessible human-readable text', () => {
      const shockley = 'I_D = I_s \\left( e^{\\frac{V_D}{\\eta V_T}} - 1 \\right)';
      const clean = sanitizeToCleanMathText(shockley);

      expect(clean).toContain('I_D = I_s');
      expect(clean).toContain('(V_D / η V_T)');
      expect(clean).not.toContain('\\frac');
      expect(clean).not.toContain('\\left');
      expect(clean).not.toContain('\\right');
      expect(clean).not.toContain('\\eta');
      expect(clean).not.toContain('\\');
    });

    it('converts square root and Greek symbols to readable text', () => {
      const expr = '\\alpha = \\frac{R}{2L}, \\quad \\omega_0 = \\frac{1}{\\sqrt{LC}}';
      const clean = sanitizeToCleanMathText(expr);

      expect(clean).toContain('α = (R / 2L)');
      expect(clean).toContain('ω_0 = (1 / √(LC))');
      expect(clean).not.toContain('\\alpha');
      expect(clean).not.toContain('\\sqrt');
      expect(clean).not.toContain('\\quad');
      expect(clean).not.toContain('\\');
    });

    it('gracefully handles malformed or incomplete LaTeX without throwing or leaking raw macros', () => {
      const broken = 'I_D = \\frac{unclosed';
      const result = safeRenderLatex(broken, false);

      expect(result.html).not.toContain('katex-error');
      expect(result.html).not.toContain('\\frac');
    });
  });
});
