/**
 * Prismora Biology & Cytology Scientific Engine
 * Cell Division: Mitosis & Cytokinesis under Virtual Microscope
 *
 * References:
 * - NCERT Class 11 Biology: Chapter 10 (Cell Cycle and Cell Division)
 * - The Cell: A Molecular Approach (Cooper & Hausman)
 */

export type MitosisStage = 'interphase' | 'prophase' | 'metaphase' | 'anaphase' | 'telophase' | 'cytokinesis';

export interface MitosisState {
  stage: MitosisStage;
  progressPct: number; // 0 to 100% within the stage
  chromosomeCount: number; // e.g. 4 for 2n=4 onion root model, or 46 for human
  chromatidCount: number;
  nuclearMembraneIntact: boolean;
  spindleFibersFormed: boolean;
  equatorialPlateAligned: boolean;
  centromereSplitting: boolean;
  cleavageFurrowDepthPct: number;
  description: string;
  microscopeFeatures: string[];
}

export function calculateMitosisState(
  stage: MitosisStage,
  progressPct: number = 50,
  diploidNumber: number = 4
): MitosisState {
  const p = Math.max(0, Math.min(100, progressPct));

  switch (stage) {
    case 'interphase':
      return {
        stage,
        progressPct: p,
        chromosomeCount: diploidNumber,
        chromatidCount: diploidNumber * 2, // Replicated chromatin fibers in S phase
        nuclearMembraneIntact: true,
        spindleFibersFormed: false,
        equatorialPlateAligned: false,
        centromereSplitting: false,
        cleavageFurrowDepthPct: 0,
        description: 'G2 phase: DNA has replicated; chromosomes are uncoiled as diffuse chromatin. Prominent nucleolus present.',
        microscopeFeatures: ['Intact nuclear envelope', 'Diffuse chromatin mesh', 'Prominent nucleolus'],
      };

    case 'prophase':
      return {
        stage,
        progressPct: p,
        chromosomeCount: diploidNumber,
        chromatidCount: diploidNumber * 2,
        nuclearMembraneIntact: p < 80, // Breaks down in late prophase
        spindleFibersFormed: p > 40,
        equatorialPlateAligned: false,
        centromereSplitting: false,
        cleavageFurrowDepthPct: 0,
        description: 'Chromatin condenses into distinct rod-shaped chromosomes (two sister chromatids joined at centromere). Centrosomes move to opposite poles.',
        microscopeFeatures: ['Condensed visible chromatid pairs', 'Aster rays radiating', 'Disappearing nuclear envelope'],
      };

    case 'metaphase':
      return {
        stage,
        progressPct: p,
        chromosomeCount: diploidNumber,
        chromatidCount: diploidNumber * 2,
        nuclearMembraneIntact: false,
        spindleFibersFormed: true,
        equatorialPlateAligned: true,
        centromereSplitting: false,
        cleavageFurrowDepthPct: 0,
        description: 'All chromosomes align at the equatorial metaphase plate. Kinetochore microtubules connect sister chromatids to opposite poles.',
        microscopeFeatures: ['Linear alignment at equatorial plate', 'Bipolar spindle fibers attached to kinetochores', 'Maximal chromosome condensation (ideal for karyotyping)'],
      };

    case 'anaphase':
      return {
        stage,
        progressPct: p,
        chromosomeCount: diploidNumber * 2, // Centromeres split: now individual daughter chromosomes
        chromatidCount: diploidNumber * 2,
        nuclearMembraneIntact: false,
        spindleFibersFormed: true,
        equatorialPlateAligned: false,
        centromereSplitting: true,
        cleavageFurrowDepthPct: p * 0.3,
        description: 'Centromeres split simultaneously. Sister chromatids migrate toward opposite poles pulled by depolymerizing kinetochore microtubules (V, L, J shapes).',
        microscopeFeatures: ['Two migrating chromosome clusters', 'V-shaped arms trailing centromeres', 'Spindle elongation'],
      };

    case 'telophase':
      return {
        stage,
        progressPct: p,
        chromosomeCount: diploidNumber, // per newly forming nucleus
        chromatidCount: diploidNumber,
        nuclearMembraneIntact: p > 30, // Reform nuclear envelope
        spindleFibersFormed: p < 60, // Spindle depolymerizes
        equatorialPlateAligned: false,
        centromereSplitting: false,
        cleavageFurrowDepthPct: 30 + p * 0.4,
        description: 'Nuclear envelope reforms around two daughter nuclei. Chromosomes decondense back into diffuse chromatin. Nucleoli reappear.',
        microscopeFeatures: ['Two distinct reforming daughter nuclei', 'Decondensing chromatin threads', 'Disappearing spindle'],
      };

    case 'cytokinesis':
      return {
        stage,
        progressPct: p,
        chromosomeCount: diploidNumber,
        chromatidCount: diploidNumber,
        nuclearMembraneIntact: true,
        spindleFibersFormed: false,
        equatorialPlateAligned: false,
        centromereSplitting: false,
        cleavageFurrowDepthPct: 70 + p * 0.3,
        description: 'Physical division of cytoplasm: Actin-myosin contractile ring pinches animal cell furrow (or cell plate phragmoplast in plants), creating two identical daughter cells.',
        microscopeFeatures: ['Deep cleavage furrow pinching cells', 'Two separate daughter cells with complete nuclei'],
      };
  }
}
