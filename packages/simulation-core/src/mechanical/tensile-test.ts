/**
 * Universal Testing Machine (UTM) Tensile Test & Stress-Strain Curve
 * Benchmark: IIT Bombay & NITK Surathkal Material Science Virtual Labs
 *
 * Simulates uniaxial tensile loading of standard dogbone specimens (Mild Steel, Aluminium, Brass)
 * Calculates:
 * - Engineering Stress: sigma = P / A0
 * - Engineering Strain: epsilon = delta_L / L0
 * - Modulus of Elasticity (Young's Modulus E)
 * - Yield Strength (0.2% offset proof stress)
 * - Ultimate Tensile Strength (UTS)
 * - Fracture point and percentage elongation
 */

export type SpecimenMaterial = 'mild_steel' | 'aluminium_6061' | 'structural_brass';

export interface SpecimenProperties {
  readonly name: string;
  readonly youngsModulusGpa: number;
  readonly yieldStressMpa: number;
  readonly utsMpa: number;
  readonly fractureStrain: number;
  readonly strainHardeningExponent: number; // Ramberg-Osgood n
  readonly color: string;
}

export const MATERIAL_PROPERTIES: Record<SpecimenMaterial, SpecimenProperties> = {
  mild_steel: {
    name: 'Mild Steel (IS 2062)',
    youngsModulusGpa: 210,
    yieldStressMpa: 250,
    utsMpa: 420,
    fractureStrain: 0.28,
    strainHardeningExponent: 0.22,
    color: '#64748B',
  },
  aluminium_6061: {
    name: 'Aluminium 6061-T6',
    youngsModulusGpa: 69,
    yieldStressMpa: 275,
    utsMpa: 310,
    fractureStrain: 0.17,
    strainHardeningExponent: 0.10,
    color: '#94A3B8',
  },
  structural_brass: {
    name: 'Cartridge Brass (70/30)',
    youngsModulusGpa: 110,
    yieldStressMpa: 140,
    utsMpa: 330,
    fractureStrain: 0.45,
    strainHardeningExponent: 0.35,
    color: '#EAB308',
  },
};

export interface TensileTestParameters {
  readonly material: SpecimenMaterial;
  /** Specimen gauge length L0 in mm (standard 50 mm) */
  readonly gaugeLengthMm: number;
  /** Specimen original diameter d0 in mm (standard 12.5 mm) */
  readonly diameterMm: number;
  /** Applied crosshead displacement / elongation in mm */
  readonly elongationMm: number;
}

export interface StressStrainPoint {
  readonly strain: number;
  readonly stressMpa: number;
  readonly loadKn: number;
  readonly region: 'elastic' | 'yield' | 'strain_hardening' | 'necking' | 'fractured';
}

export interface TensileTestResult {
  readonly currentStrain: number;
  readonly currentStressMpa: number;
  readonly currentLoadKn: number;
  readonly crossSectionAreaMm2: number;
  readonly currentDiameterMm: number;
  readonly testStage: 'elastic' | 'yield' | 'strain_hardening' | 'necking' | 'fractured';
  readonly regime: 'elastic' | 'yield' | 'strain_hardening' | 'necking' | 'fractured';
  readonly yieldLoadKn: number;
  readonly maxLoadKn: number;
  readonly fractureLoadKn: number;
  readonly percentageElongation: number;
  readonly percentageReductionInArea: number;
  readonly stressStrainCurve: readonly StressStrainPoint[];
  readonly curvePoints: readonly StressStrainPoint[];
}

export class TensileTestEngine {
  static compute(params: TensileTestParameters): TensileTestResult {
    const mat = MATERIAL_PROPERTIES[params.material];
    const l0 = params.gaugeLengthMm;
    const d0 = params.diameterMm;
    const a0 = (Math.PI * d0 * d0) / 4; // mm^2

    const appliedStrain = params.elongationMm / l0;
    const yieldStrain = mat.yieldStressMpa / (mat.youngsModulusGpa * 1000);
    const neckingStrain = mat.fractureStrain * 0.65;

    // Helper to evaluate stress at any strain
    const evaluateStress = (strain: number): { stress: number; region: StressStrainPoint['region'] } => {
      if (strain <= 0) return { stress: 0, region: 'elastic' };
      if (strain >= mat.fractureStrain) return { stress: 0, region: 'fractured' };

      if (strain <= yieldStrain) {
        // Linear elastic region: sigma = E * epsilon
        const stress = strain * (mat.youngsModulusGpa * 1000);
        return { stress, region: 'elastic' };
      } else if (strain <= yieldStrain * 1.5 && params.material === 'mild_steel') {
        // Mild steel yield plateau (Lüders bands)
        return { stress: mat.yieldStressMpa, region: 'yield' };
      } else if (strain <= neckingStrain) {
        // Plastic strain hardening: Hollomon sigma = K * epsilon^n
        const plasticStrain = strain - yieldStrain;
        const normalized = plasticStrain / (neckingStrain - yieldStrain);
        const stress = mat.yieldStressMpa + (mat.utsMpa - mat.yieldStressMpa) * Math.pow(normalized, mat.strainHardeningExponent);
        return { stress: Math.min(mat.utsMpa, stress), region: 'strain_hardening' };
      } else {
        // Post-UTS necking region: engineering stress drops until fracture
        const neckingRatio = (strain - neckingStrain) / (mat.fractureStrain - neckingStrain);
        const fractureStress = mat.utsMpa * 0.78;
        const stress = mat.utsMpa - (mat.utsMpa - fractureStress) * Math.pow(neckingRatio, 1.2);
        return { stress, region: 'necking' };
      }
    };

    // Generate curve points (60 points from 0 to fracture strain)
    const curvePoints: StressStrainPoint[] = [];
    const stepCount = 60;
    const maxPlotStrain = mat.fractureStrain * 1.05;

    for (let i = 0; i <= stepCount; i++) {
      const s = (i / stepCount) * maxPlotStrain;
      const { stress, region } = evaluateStress(s);
      const load = (stress * a0) / 1000; // kN
      curvePoints.push({
        strain: Number(s.toFixed(4)),
        stressMpa: Number(stress.toFixed(1)),
        loadKn: Number(load.toFixed(2)),
        region,
      });
    }

    // Current state at applied elongation
    const currentState = evaluateStress(appliedStrain);
    const currentStress = currentState.stress;
    const currentLoad = (currentStress * a0) / 1000;

    // Lateral contraction (Poisson's ratio ~ 0.3 elastic, up to 0.5 plastic necking)
    const contractionFactor = appliedStrain > neckingStrain ? 0.75 : 1 - 0.3 * Math.min(0.2, appliedStrain);
    const currentDiameter = d0 * Math.sqrt(contractionFactor);

    return {
      currentStrain: Number(appliedStrain.toFixed(4)),
      currentStressMpa: Number(currentStress.toFixed(1)),
      currentLoadKn: Number(currentLoad.toFixed(2)),
      crossSectionAreaMm2: Number(a0.toFixed(2)),
      currentDiameterMm: Number(currentDiameter.toFixed(2)),
      testStage: currentState.region,
      regime: currentState.region,
      yieldLoadKn: Number(((mat.yieldStressMpa * a0) / 1000).toFixed(2)),
      maxLoadKn: Number(((mat.utsMpa * a0) / 1000).toFixed(2)),
      fractureLoadKn: Number(((mat.utsMpa * 0.78 * a0) / 1000).toFixed(2)),
      percentageElongation: Number((mat.fractureStrain * 100).toFixed(1)),
      percentageReductionInArea: Number(((1 - 0.75) * 100).toFixed(1)),
      stressStrainCurve: curvePoints,
      curvePoints,
    };
  }
}
