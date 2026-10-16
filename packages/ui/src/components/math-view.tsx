'use client';

import * as React from 'react';
import katex from 'katex';
import { cn } from '../lib/utils';

export interface MathViewProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The LaTeX mathematical string or mixed text containing LaTeX delimiters.
   * If omitted, children (if a string) will be used.
   */
  math?: string;
  /**
   * Alternative to `math` prop. Can be a string with LaTeX or mixed text.
   */
  children?: React.ReactNode;
  /**
   * If true, renders as a standalone display block formula (KaTeX displayMode: true).
   * Centered or block layout with responsive horizontal scrolling.
   */
  display?: boolean;
  /**
   * Explicit accessible description for screen readers.
   * If omitted, a clean natural text equivalent is automatically computed.
   */
  ariaLabel?: string;
  /**
   * Size preset for typography scaling.
   * 'xs' = 11px (ideal for catalog cards and badges)
   * 'sm' = 12px / 13px (compact cards, tables)
   * 'md' = 14px (default inline / body text)
   * 'lg' = 16px / 18px (modal display)
   * 'xl' = 20px+ (featured theory headers)
   */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Custom fallback text to show if parsing/rendering completely fails.
   * Will never show raw unrendered LaTeX commands.
   */
  fallbackText?: string;
}

export interface MathSegment {
  type: 'text' | 'inline-math' | 'display-math';
  content: string;
}

/**
 * Common Greek and mathematical symbols mapped to human-readable characters
 */
const SYMBOL_MAP: Record<string, string> = {
  '\\alpha': 'α',
  '\\beta': 'β',
  '\\gamma': 'γ',
  '\\Gamma': 'Γ',
  '\\delta': 'δ',
  '\\Delta': 'Δ',
  '\\epsilon': 'ε',
  '\\varepsilon': 'ε',
  '\\zeta': 'ζ',
  '\\eta': 'η',
  '\\theta': 'θ',
  '\\Theta': 'Θ',
  '\\lambda': 'λ',
  '\\Lambda': 'Λ',
  '\\mu': 'μ',
  '\\pi': 'π',
  '\\Pi': 'Π',
  '\\rho': 'ρ',
  '\\sigma': 'σ',
  '\\Sigma': 'Σ',
  '\\tau': 'τ',
  '\\phi': 'φ',
  '\\Phi': 'Φ',
  '\\psi': 'ψ',
  '\\omega': 'ω',
  '\\Omega': 'Ω',
  '\\cdot': '·',
  '\\times': '×',
  '\\div': '÷',
  '\\pm': '±',
  '\\mp': '∓',
  '\\approx': '≈',
  '\\neq': '≠',
  '\\le': '≤',
  '\\leq': '≤',
  '\\ge': '≥',
  '\\geq': '≥',
  '\\infty': '∞',
  '\\oplus': '⊕',
  '\\otimes': '⊗',
  '\\sum': '∑',
  '\\prod': '∏',
  '\\int': '∫',
  '\\partial': '∂',
  '\\nabla': '∇',
  '\\sqrt': '√',
  '\\rightarrow': '→',
  '\\leftarrow': '←',
  '\\leftrightarrow': '↔',
  '\\parallel': '∥',
  '\\in': '∈',
  '\\notin': '∉',
  '\\subset': '⊂',
  '\\subseteq': '⊆',
  '\\cup': '∪',
  '\\cap': '∩',
  '\\setminus': '∖',
  '\\forall': '∀',
  '\\exists': '∃',
};

function extractBracedArgument(str: string, startIndex: number): { content: string; endIndex: number } | null {
  if (startIndex >= str.length || str[startIndex] !== '{') return null;
  let depth = 1;
  let i = startIndex + 1;
  while (i < str.length && depth > 0) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') depth--;
    i++;
  }
  if (depth === 0) {
    return { content: str.slice(startIndex + 1, i - 1), endIndex: i };
  }
  return null;
}

/**
 * Converts a raw LaTeX string into a clean, human-readable plain text representation.
 * Guarantees that raw backslashes and LaTeX macros are stripped, providing a safe,
 * readable fallback and accessible label for screen readers.
 */
export function sanitizeToCleanMathText(rawLatex: string): string {
  if (!rawLatex || typeof rawLatex !== 'string') return '';

  let text = rawLatex.trim();

  // Strip math delimiters if present
  text = text.replace(/^(\$\$|\\\[|\$|\\\()/, '').replace(/(\$\$|\\\]|\$|\\\))$/, '');

  // Handle \frac{num}{den} with arbitrary nested expressions
  while (text.includes('\\frac')) {
    const fracIdx = text.indexOf('\\frac');
    let cursor = fracIdx + 5;
    while (cursor < text.length && /\s/.test(text[cursor] ?? '')) cursor++;
    const numArg = extractBracedArgument(text, cursor);
    if (!numArg) {
      text = text.slice(0, fracIdx) + text.slice(cursor);
      break;
    }
    cursor = numArg.endIndex;
    while (cursor < text.length && /\s/.test(text[cursor] ?? '')) cursor++;
    const denArg = extractBracedArgument(text, cursor);
    if (!denArg) {
      text = text.slice(0, fracIdx) + numArg.content + text.slice(cursor);
      break;
    }
    const cleanNum = sanitizeToCleanMathText(numArg.content);
    const cleanDen = sanitizeToCleanMathText(denArg.content);
    text = text.slice(0, fracIdx) + `(${cleanNum} / ${cleanDen})` + text.slice(denArg.endIndex);
  }

  // Handle square roots \sqrt{x} or \sqrt[n]{x}
  while (text.includes('\\sqrt')) {
    const sqrtIdx = text.indexOf('\\sqrt');
    let cursor = sqrtIdx + 5;
    while (cursor < text.length && /\s/.test(text[cursor] ?? '')) cursor++;
    let rootPrefix = '';
    if (text[cursor] === '[') {
      const closeBracket = text.indexOf(']', cursor);
      if (closeBracket !== -1) {
        rootPrefix = text.slice(cursor + 1, closeBracket);
        cursor = closeBracket + 1;
        while (cursor < text.length && /\s/.test(text[cursor] ?? '')) cursor++;
      }
    }
    const arg = extractBracedArgument(text, cursor);
    if (!arg) {
      text = text.slice(0, sqrtIdx) + '√' + text.slice(cursor);
      break;
    }
    const cleanArg = sanitizeToCleanMathText(arg.content);
    text = text.slice(0, sqrtIdx) + `${rootPrefix ? rootPrefix + '√' : '√'}(${cleanArg})` + text.slice(arg.endIndex);
  }

  // Handle \overline{x} and \bar{x}
  text = text.replace(/\\overline\{([^{}]+)\}/g, '$1̄');
  text = text.replace(/\\bar\{([^{}]+)\}/g, '$1̄');

  // Handle \text{...} and \mathrm{...}
  text = text.replace(/\\(text|mathrm|mathbf|mathit)\{([^{}]+)\}/g, '$2');

  // Handle known symbols and Greek letters
  for (const [cmd, char] of Object.entries(SYMBOL_MAP)) {
    text = text.replaceAll(cmd, char);
  }

  // Clean formatting macros like \left, \right, \quad, \qquad, \;, \!, \,
  text = text.replace(/\\left\s*/g, '');
  text = text.replace(/\\right\s*/g, '');
  text = text.replace(/\\(quad|qquad|,|;|!)/g, ' ');
  text = text.replace(/\\,/g, ' ');

  // Clean remaining braces and backslashes
  text = text.replace(/\{([^{}]+)\}/g, '$1');
  text = text.replace(/\\[a-zA-Z]+/g, '');
  text = text.replace(/[\\{}]/g, '');

  // Normalize spaces
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Tokenizes a string containing mixed text and LaTeX delimiters ($...$, $$...$$, \(...\), \[...\]).
 */
export function parseMathString(content: string): MathSegment[] {
  if (!content) return [];

  const segments: MathSegment[] = [];
  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(content)) !== null) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: content.slice(lastIndex, matchIndex),
      });
    }

    const matchedStr = match[0];
    if (matchedStr.startsWith('$$') && matchedStr.endsWith('$$')) {
      segments.push({
        type: 'display-math',
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.startsWith('\\[') && matchedStr.endsWith('\\]')) {
      segments.push({
        type: 'display-math',
        content: matchedStr.slice(2, -2).trim(),
      });
    } else if (matchedStr.startsWith('$') && matchedStr.endsWith('$')) {
      segments.push({
        type: 'inline-math',
        content: matchedStr.slice(1, -1).trim(),
      });
    } else if (matchedStr.startsWith('\\(') && matchedStr.endsWith('\\)')) {
      segments.push({
        type: 'inline-math',
        content: matchedStr.slice(2, -2).trim(),
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      content: content.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Safely renders a LaTeX mathematical expression with KaTeX.
 * If rendering fails or KaTeX outputs an error element, returns clean fallback HTML
 * that never exposes raw backslashed commands to the user.
 */
export function safeRenderLatex(expr: string, displayMode: boolean): { html: string; isError: boolean } {
  try {
    const rendered = katex.renderToString(expr, {
      displayMode,
      throwOnError: false,
      strict: false,
      output: 'htmlAndMathml',
    });

    // Check if KaTeX generated an error span
    if (rendered.includes('class="katex-error"')) {
      const fallback = sanitizeToCleanMathText(expr);
      return {
        html: `<span class="katex-fallback font-sans font-medium text-zinc-800 dark:text-zinc-200">${escapeHtml(fallback)}</span>`,
        isError: true,
      };
    }

    return { html: rendered, isError: false };
  } catch {
    const fallback = sanitizeToCleanMathText(expr);
    return {
      html: `<span class="katex-fallback font-sans font-medium text-zinc-800 dark:text-zinc-200">${escapeHtml(fallback)}</span>`,
      isError: true,
    };
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const SIZE_CLASSES = {
  xs: 'text-[11px] leading-tight',
  sm: 'text-xs leading-normal',
  md: 'text-sm leading-normal',
  lg: 'text-base sm:text-lg leading-relaxed',
  xl: 'text-lg sm:text-xl leading-relaxed',
};

/**
 * MathView is the primary mathematical formula rendering component for Prismora.
 * Powered by KaTeX, it cleanly formats inline and block LaTeX expressions,
 * wraps responsively with horizontal scrolling to prevent layout clipping,
 * sanitizes malformed expressions, and provides screen-reader accessibility.
 */
export const MathView: React.FC<MathViewProps> = ({
  math,
  children,
  display = false,
  ariaLabel,
  size = 'md',
  className,
  fallbackText,
  ...rest
}) => {
  // Extract text source from either math prop or children string
  const rawInput = React.useMemo(() => {
    if (typeof math === 'string') return math;
    if (typeof children === 'string') return children;
    return '';
  }, [math, children]);

  // If children is non-string React elements and no math prop, render children as-is
  if (!rawInput && children) {
    return <span className={cn('inline-block', className)}>{children}</span>;
  }

  if (!rawInput.trim()) {
    return null;
  }

  // Determine if input has embedded delimiters ($...$, $$...$$, etc.)
  const hasDelimiters = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/.test(rawInput);

  // If display is requested explicitly or delimiters are present, process accordingly
  if (hasDelimiters) {
    const segments = parseMathString(rawInput);
    const computedLabel = ariaLabel || sanitizeToCleanMathText(rawInput);

    return (
      <span
        role="region"
        aria-label={computedLabel}
        className={cn('inline-block max-w-full', SIZE_CLASSES[size], className)}
        {...rest}
      >
        {segments.map((seg, idx) => {
          if (seg.type === 'text') {
            return <span key={idx}>{seg.content}</span>;
          }
          const isDisplay = seg.type === 'display-math';
          const { html } = safeRenderLatex(seg.content, isDisplay);

          if (isDisplay) {
            return (
              <span
                key={idx}
                className="block w-full my-2 overflow-x-auto overflow-y-hidden text-center focus:outline-none"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          }

          return (
            <span
              key={idx}
              className="inline-block align-baseline overflow-x-auto overflow-y-hidden max-w-full"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
      </span>
    );
  }

  // Pure single LaTeX formula expression
  const isDisplayMode = display;
  const { html } = safeRenderLatex(rawInput, isDisplayMode);
  const computedLabel = ariaLabel || fallbackText || sanitizeToCleanMathText(rawInput);

  if (isDisplayMode) {
    return (
      <div
        role="region"
        aria-label={computedLabel}
        tabIndex={0}
        className={cn(
          'w-full overflow-x-auto overflow-y-hidden py-2 px-1 text-center sm:text-left focus:outline-none transition-colors rounded',
          SIZE_CLASSES[size],
          className
        )}
        {...rest}
      >
        <div
          className="inline-block min-w-full text-zinc-900 dark:text-zinc-100"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    );
  }

  return (
    <span
      role="math"
      aria-label={computedLabel}
      className={cn(
        'inline-flex items-center align-middle overflow-x-auto overflow-y-hidden max-w-full text-zinc-900 dark:text-zinc-100',
        SIZE_CLASSES[size],
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
      {...rest}
    />
  );
};

export default MathView;
