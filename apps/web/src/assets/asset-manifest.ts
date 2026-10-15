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
  category: 'launcher' | 'projectile' | 'instrument' | 'target' | 'environment';
  type: 'vector-procedural' | 'svg' | 'canvas';
  license: string;
  attribution: string;
  description: string;
}

export const ASSET_MANIFEST: AssetEntry[] = [
  {
    id: 'cannon-launcher-articulated',
    name: 'Prismora Articulated Launcher',
    category: 'launcher',
    type: 'vector-procedural',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Articulated scientific launch apparatus featuring an industrial wheeled carriage, hydraulic telescoping elevation pillar, brass pivot bushing, angle protractor gauge, and metallic cannon barrel with interactive rotational grip.',
  },
  {
    id: 'projectile-cannonball',
    name: 'Solid Sphere Projectile',
    category: 'projectile',
    type: 'vector-procedural',
    license: 'MIT (Prismora Original)',
    attribution: 'Prismora Design System',
    description:
      'Metallic sphere with specular reflection highlight, radial gradient depth shading, and ground contact shadow.',
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
      'Art-directed environmental backdrops for Earth (stratified sky, distant peaks, lush grass), Moon (vacuum black space, stars, lunar regolith), Mars (ochre atmosphere, rusty dunes), and Zero-G Deep Space.',
  },
];
