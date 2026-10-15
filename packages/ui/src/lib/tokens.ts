/**
 * Prismora Design Tokens & Brand System
 *
 * Vibrant, multi-colour scientific palette inspired by optical prism dispersion:
 * - Electric Blue (#2563EB)
 * - Cyan (#06B6D4)
 * - Violet (#8B5CF6)
 * - Coral (#F43F5E)
 * - Pink (#EC4899)
 * - Amber (#FBBF24)
 * - Green (#22C55E)
 * - Deep Navy (#172033)
 *
 * ABSOLUTELY NO GRADIENTS: All elements use crisp solid colours, balanced
 * neutrals, high-contrast borders, and clean typography.
 */

export const brandColors = {
  electricBlue: '#2563EB',
  cyan: '#06B6D4',
  violet: '#8B5CF6',
  coral: '#F43F5E',
  pink: '#EC4899',
  amber: '#FBBF24',
  green: '#22C55E',
  deepNavy: '#172033',
  darkBg: '#0B1120',
  lightBg: '#F8FAFC',
} as const;

/**
 * Dedicated, consistent color identities for scientific disciplines
 */
export const disciplineColors = {
  physics: {
    solid: '#2563EB',
    name: 'Electric Blue',
    bgLight: '#EFF6FF',
    borderLight: '#BFDBFE',
    bgDark: '#1E3A8A',
    text: '#2563EB',
  },
  chemistry: {
    solid: '#FBBF24',
    name: 'Amber Gold',
    bgLight: '#FFFBEB',
    borderLight: '#FDE68A',
    bgDark: '#78350F',
    text: '#D97706',
  },
  biology: {
    solid: '#22C55E',
    name: 'Emerald Green',
    bgLight: '#F0FDF4',
    borderLight: '#BBF7D0',
    bgDark: '#14532D',
    text: '#16A34A',
  },
  mathematics: {
    solid: '#8B5CF6',
    name: 'Violet',
    bgLight: '#F5F3FF',
    borderLight: '#DDD6FE',
    bgDark: '#4C1D95',
    text: '#7C3AED',
  },
  astronomy: {
    solid: '#06B6D4',
    name: 'Cyan',
    bgLight: '#ECFEFF',
    borderLight: '#A5F3FC',
    bgDark: '#164E63',
    text: '#0891B2',
  },
  engineering: {
    solid: '#F43F5E',
    name: 'Coral',
    bgLight: '#FFF1F2',
    borderLight: '#FECDD3',
    bgDark: '#881337',
    text: '#E11D48',
  },
} as const;

export const colors = {
  brand: brandColors,
  disciplines: disciplineColors,

  // Semantic physics & simulation indicators (solid colors only)
  physics: {
    position: '#22C55E',     // Green — position
    velocity: '#2563EB',     // Electric Blue — velocity
    acceleration: '#F43F5E', // Coral — acceleration
    force: '#EC4899',        // Pink — force
    energy: '#8B5CF6',       // Violet — energy
    trajectory: '#06B6D4',   // Cyan — trajectory path
    target: '#FBBF24',       // Amber — target & milestones
    ground: '#334155',       // Slate — ground reference
    grid: '#CBD5E1',         // Zinc — coordinate grid
  },

  // State indicators
  status: {
    success: '#22C55E',
    warning: '#FBBF24',
    error: '#F43F5E',
    info: '#06B6D4',
  },
} as const;

export const typography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
    mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    math: ['KaTeX_Main', 'Times New Roman', 'serif'],
  },
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
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
  // Crisp flat shadows with subtle depth
  panel: '0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.08)',
  elevated: '0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.08)',
  modal: '0 20px 25px -5px rgba(15, 23, 42, 0.25), 0 8px 10px -6px rgba(15, 23, 42, 0.2)',
  buttonSolid: '0 2px 0 0 rgba(15, 23, 42, 0.2)',
} as const;

export const animation = {
  duration: {
    fast: '120ms',
    normal: '180ms',
    slow: '250ms',
  },
  easing: {
    default: 'cubic-bezier(0.4, 0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
  },
} as const;

export const zIndex = {
  base: 0,
  panel: 10,
  controls: 20,
  overlay: 30,
  modal: 40,
  toast: 50,
} as const;
