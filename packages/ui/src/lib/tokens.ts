/**
 * Prismora Design Tokens
 *
 * A scientific instrument-inspired design system with precise typography,
 * restrained colors, and high information density.
 *
 * Color palette inspired by scientific instruments:
 * - Deep navy/slate backgrounds for dark mode
 * - Clean white/gray for light mode
 * - Accent colors derived from physics: blue (velocity), green (position),
 *   orange (acceleration), purple (energy)
 */

export const colors = {
  // Brand
  brand: {
    50: '#eef2ff',
    100: '#e0e7ff',
    200: '#c7d2fe',
    300: '#a5b4fc',
    400: '#818cf8',
    500: '#6366f1', // Primary brand
    600: '#4f46e5',
    700: '#4338ca',
    800: '#3730a3',
    900: '#312e81',
    950: '#1e1b4b',
  },

  // Semantic physics colors
  physics: {
    position: '#22c55e',     // Green — position vectors
    velocity: '#3b82f6',     // Blue — velocity vectors
    acceleration: '#f97316', // Orange — acceleration vectors
    force: '#ef4444',        // Red — force vectors
    energy: '#a855f7',       // Purple — energy
    trajectory: '#06b6d4',   // Cyan — trajectory path
    ground: '#78716c',       // Stone — ground reference
    grid: '#d4d4d8',         // Zinc — coordinate grid
  },

  // Status
  status: {
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    math: ['KaTeX_Main', 'Times New Roman', 'serif'],
  },
  fontSize: {
    'xs': ['0.75rem', { lineHeight: '1rem' }],
    'sm': ['0.875rem', { lineHeight: '1.25rem' }],
    'base': ['1rem', { lineHeight: '1.5rem' }],
    'lg': ['1.125rem', { lineHeight: '1.75rem' }],
    'xl': ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  },
} as const;

export const spacing = {
  panel: '1rem',
  section: '1.5rem',
  canvas: '0',
} as const;

export const borders = {
  radius: {
    sm: '0.375rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
} as const;

export const shadows = {
  panel: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
  elevated: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
  modal: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
} as const;

export const animation = {
  duration: {
    fast: '150ms',
    normal: '200ms',
    slow: '300ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

/** Z-index scale for layering */
export const zIndex = {
  base: 0,
  panel: 10,
  controls: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;

