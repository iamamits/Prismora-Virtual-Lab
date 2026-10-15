/**
 * Prismora Visual Asset Manifest
 *
 * All visual scene assets in Prismora are custom designed, modular SVG/Canvas
 * vector objects engineered for crisp high-DPI scientific rendering without
 * heavy external raster image downloads.
 */

export interface AssetEntry {
  id: string;
  name: string;
  category: 'brand' | 'launcher' | 'projectile' | 'instrument' | 'target' | 'environment';
  type: 'vector-procedural' | 'svg' | 'canvas';
  license: string;
  attribution: string;
  description: string;
}

export const ASSET_MANIFEST: AssetEntry[] = [
  {
    id: 'prismora-primary-logo',
    name: 'Prismora Primary Wordmark Lockup',
    category: 'brand',
    type: 'svg',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Refined geometric dispersion prism symbol featuring triangular body with internal 4-point star, crossing atomic orbital loop, and bold modern wordmark with tagline "Explore. Experiment. Understand."',
  },
  {
    id: 'prismora-prism-icon',
    name: 'Prismora Geometric Prism Icon',
    category: 'brand',
    type: 'svg',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Standalone multi-colour faceted geometric prism with electric blue (#2563EB) left facet, cyan (#06B6D4) right facet, deep navy base (#172033), white 4-point star core, and atomic orbital loop in coral/amber/emerald.',
  },
  {
    id: 'prismora-favicon',
    name: 'Prismora Squircle Favicon',
    category: 'brand',
    type: 'svg',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Optimized browser tab squircle icon on deep navy background (#0F172A) with high-contrast geometric prism and atomic particle loop.',
  },
  {
    id: 'cannon-launcher-articulated',
    name: 'Prismora Articulated Launcher',
    category: 'launcher',
    type: 'vector-procedural',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Articulated scientific launch apparatus featuring an industrial wheeled carriage, solid steel hydraulic elevation pillar with precision specular stripe, angle protractor gauge, and metallic cannon barrel with interactive rotational grip.',
  },
  {
    id: 'projectile-cannonball',
    name: 'Solid Sphere Projectile',
    category: 'projectile',
    type: 'vector-procedural',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Solid Electric Blue (#2563EB) sphere with crisp white boundary stroke, specular highlight dot, and solid halo ring. Zero gradients.',
  },
  {
    id: 'interactive-target-bullseye',
    name: 'Calibrated Distance Target',
    category: 'target',
    type: 'vector-procedural',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Concentric bullseye rings with distance flag marker and hit-detection collision feedback.',
  },
  {
    id: 'scientific-probe-crosshair',
    name: 'Kinematics Sampling Probe',
    category: 'instrument',
    type: 'vector-procedural',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Movable scientific crosshair instrument with digital HUD readout showing exact (t, x, y, vx, vy, |v|) at sampled trajectory coordinates.',
  },
  {
    id: 'precision-measuring-tape',
    name: 'Dual-Point Caliper Measuring Tape',
    category: 'instrument',
    type: 'vector-procedural',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Draggable measuring tape with anchored origin and tip reticle calculating Euclidean distance, horizontal delta, and vertical elevation.',
  },
  {
    id: 'environment-backdrops',
    name: 'Celestial Environmental Presets',
    category: 'environment',
    type: 'vector-procedural',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Art-directed environmental backdrops rendered with solid flat color blocking: Earth (sky blue, mountain silhouettes, emerald hills, stratified ground), Moon (vacuum space, stars, Earth with atmospheric ring), Mars (terracotta atmosphere, rust craters), and Zero-G Deep Space (midnight navy).',
  },
];
