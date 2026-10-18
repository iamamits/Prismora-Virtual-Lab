import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://prismora.app';
  const now = new Date();

  const routes = [
    '',
    '/explore',
    '/labs',
    '/library',
    '/studio',
    // Biology & Physiology
    '/experiments/biology',
    // Physics
    '/experiments/physics',
    '/experiments/physics/wave-optics',
    '/experiments/projectile-motion',
    // Chemistry
    '/experiments/chemistry',
    '/experiments/chemistry/titration',
    '/experiments/chemical',
    '/experiments/chemical/distillation',
    // ECE & Circuits
    '/experiments/ece',
    '/experiments/ece/circuit-studio',
    '/experiments/ece/adders',
    '/experiments/ece/ohms-law',
    '/experiments/ece/diode-rectifier',
    '/experiments/ece/analog',
    '/experiments/electrical',
    '/experiments/electrical/network-theorems',
    '/experiments/digital-electronics',
    // Computing & Theory
    '/experiments/coa',
    '/experiments/toc',
    // Engineering Disciplines
    '/experiments/civil',
    '/experiments/civil/truss-analysis',
    '/experiments/mechanical',
    '/experiments/mechanical/harmonic-oscillator',
    '/experiments/robotics',
    '/experiments/robotics/kinematics',
    '/experiments/biotech',
    '/experiments/biotech/enzyme-kinetics',
    '/experiments/mathematics',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.includes('circuit-studio') || route.includes('biology') || route.includes('physics') || route.includes('chemistry') ? 0.9 : 0.8,
  }));
}
