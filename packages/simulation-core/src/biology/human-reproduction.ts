/**
 * Prismora Biology & Medical Physiology Scientific Engine
 * Human Reproduction, Menstrual Cycle, Fertilization & Embryogenesis
 *
 * References:
 * - NCERT Class 12 Biology: Chapter 3 (Human Reproduction) & Chapter 4 (Reproductive Health)
 * - Guyton and Hall Textbook of Medical Physiology (14th Edition)
 * - Campbell Biology (12th Edition)
 *
 * Implements:
 * 1. 28-Day Menstrual Cycle Endocrine Kinetics: FSH, LH surge, 17β-Estradiol, Progesterone
 * 2. Endometrial Histology & Thickness Model (Menstrual, Proliferative, Secretory phases)
 * 3. Gamete Dynamics & Fertilization Kinetics (Capacitation, Acrosome reaction, Cortical reaction / Polyspermy block)
 * 4. Embryogenesis & Cleavage Timeline (Zygote -> Morula -> Blastocyst -> Implantation)
 * 5. Scientific Contraceptive Mechanisms (Oral pills, Copper IUD, Barrier, Implants)
 */

export type MenstrualPhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';

export type ContraceptionMethod = 'none' | 'barrier_condom' | 'oral_combined_pill' | 'copper_iud' | 'progestin_implant';

export interface MenstrualCycleState {
  day: number; // 1 to 28
  phase: MenstrualPhase;
  fshMiuMl: number; // Follicle Stimulating Hormone (mIU/mL)
  lhMiuMl: number; // Luteinizing Hormone (mIU/mL)
  estradiolPgMl: number; // 17β-Estradiol (pg/mL)
  progesteroneNgMl: number; // Progesterone (ng/mL)
  endometrialThicknessMm: number; // mm (1 to 14 mm)
  follicleDiameterMm: number; // Ovarian follicle diameter (mm)
  basalBodyTempC: number; // °C (36.4 to 37.0 °C)
  cervicalMucusType: 'scant_thick' | 'watery_elastic_spinnbarkeit' | 'sticky_viscous';
  ovulationOccurred: boolean;
  fertileWindow: boolean;
}

export interface FertilizationKinetics {
  spermCountMillion: number;
  capacitatedPct: number;
  chemotaxisIndex: number; // 0 to 1
  acrosomeReactionTriggered: boolean;
  zonaPenetrationDepthPct: number; // 0 to 100%
  corticalGranuleExocytosis: boolean; // Slow block to polyspermy
  polyspermyPrevented: boolean;
  pronucleiFusionComplete: boolean;
  fertilizationSuccessful: boolean;
}

export interface EmbryogenesisStage {
  hoursPostFertilization: number;
  stageName: string;
  cellCount: number;
  diameterMicrons: number;
  anatomicalLocation: 'ampulla' | 'isthmus' | 'uterine_cavity' | 'endometrium_implanted';
  description: string;
}

/**
 * Compute the hormonal and histological state of the 28-day menstrual cycle.
 */
export function calculateMenstrualCycleState(
  dayOfCycle: number,
  contraception: ContraceptionMethod = 'none'
): MenstrualCycleState {
  const day = Math.max(1, Math.min(28, dayOfCycle));

  // Determine standard cycle phase
  let phase: MenstrualPhase;
  if (day <= 5) {
    phase = 'menstrual';
  } else if (day <= 13) {
    phase = 'follicular';
  } else if (day <= 15) {
    phase = 'ovulatory';
  } else {
    phase = 'luteal';
  }

  // Baseline hormone calculations based on Guyton & Hall physiological norms
  let fsh = 0;
  let lh = 0;
  let estradiol = 0;
  let progesterone = 0;

  if (contraception === 'oral_combined_pill' || contraception === 'progestin_implant') {
    // Negative feedback from exogenous synthetic estrogen/progestin:
    // Suppresses pituitary GnRH, FSH and LH pulses; prevents LH surge completely.
    fsh = 2.5 + 0.5 * Math.sin(day * 0.2);
    lh = 3.0 + 0.4 * Math.cos(day * 0.2);
    estradiol = 35.0; // suppressed flat level
    progesterone = 0.5; // anovulatory flat level
  } else {
    // Normal Physiological Menstrual Cycle

    // 1. FSH (mIU/mL): Early rise to recruit follicles, dips, slight mid-cycle peak with LH surge
    if (day <= 4) {
      fsh = 7.0 + day * 0.8;
    } else if (day <= 11) {
      fsh = 10.0 - (day - 4) * 0.7; // dip due to rising estrogen feedback
    } else if (day >= 12 && day <= 14) {
      const surgeOffset = Math.abs(day - 13.5);
      fsh = 5.5 + 12.0 * Math.exp(-surgeOffset * surgeOffset * 2.0); // preovulatory peak ~ 17 mIU/mL
    } else {
      fsh = 4.0 + 1.5 * Math.sin((day - 14) * 0.3); // low in luteal phase
    }

    // 2. LH (mIU/mL): Basal 6-10 mIU/mL, massive surge reaching 50-80 mIU/mL on day 13.5
    if (day < 12) {
      lh = 6.0 + day * 0.3;
    } else if (day >= 12 && day <= 15) {
      const distFromSurge = Math.abs(day - 13.5);
      lh = 8.0 + 62.0 * Math.exp(-distFromSurge * distFromSurge * 2.5); // massive peak ~ 70 mIU/mL
    } else {
      lh = 7.0 - (day - 15) * 0.25;
    }

    // 3. 17β-Estradiol (pg/mL): Rises with Graafian follicle growth, peaks at day 13 (~ 320 pg/mL), secondary luteal rise (~ 180 pg/mL)
    if (day <= 5) {
      estradiol = 40.0 + day * 4.0;
    } else if (day <= 13) {
      estradiol = 60.0 + Math.pow((day - 5) / 8, 2.5) * 260.0; // steep exponential rise
    } else if (day <= 16) {
      estradiol = 320.0 - (day - 13) * 65.0; // post-ovulatory drop
    } else if (day <= 22) {
      estradiol = 120.0 + 65.0 * Math.sin((day - 16) * (Math.PI / 6)); // luteal plateau ~ 185 pg/mL
    } else {
      estradiol = 185.0 - (day - 22) * 24.0; // luteolysis drop
    }

    // 4. Progesterone (ng/mL): Very low in follicular phase (< 1 ng/mL), rises post-ovulation from Corpus Luteum to peak at day 21-22 (~ 16 ng/mL)
    if (day <= 13) {
      progesterone = 0.4 + day * 0.04;
    } else if (day <= 22) {
      progesterone = 1.0 + 15.0 * Math.sin(((day - 13) / 9) * (Math.PI / 2)); // luteal synthesis peak
    } else {
      progesterone = 16.0 * Math.exp(-(day - 22) * 0.5); // regression of corpus luteum
    }
  }

  // Endometrial Thickness (mm)
  let endometrialThicknessMm: number;
  if (contraception === 'oral_combined_pill' || contraception === 'progestin_implant') {
    endometrialThicknessMm = 3.5; // Atrophic endometrium, unfavorable for implantation
  } else if (day <= 4) {
    endometrialThicknessMm = Math.max(1.5, 4.0 - day * 0.7); // Desquamation / bleeding
  } else if (day <= 14) {
    endometrialThicknessMm = 2.0 + ((day - 4) / 10) * 6.5; // Proliferative phase (reaches 8.5 mm)
  } else {
    endometrialThicknessMm = 8.5 + 4.5 * Math.sin(((day - 14) / 14) * Math.PI); // Secretory phase (up to 13 mm)
  }

  // Follicle Diameter (mm)
  let follicleDiameterMm: number;
  if (contraception === 'oral_combined_pill' || contraception === 'progestin_implant') {
    follicleDiameterMm = 4.0; // Arrested primordial/primary follicle
  } else if (day <= 13) {
    follicleDiameterMm = 4.0 + ((day - 1) / 12) * 18.0; // Grows from 4 mm to mature 22 mm Graafian follicle
  } else if (day <= 14) {
    follicleDiameterMm = 22.0; // Mature pre-ovulatory follicle
  } else {
    follicleDiameterMm = Math.max(8.0, 20.0 - (day - 14) * 1.2); // Transforming into Corpus Luteum
  }

  // Basal Body Temperature (°C)
  // Progesterone has a thermogenic effect on the hypothalamus (+0.3 to 0.5 °C post-ovulation)
  const basalBodyTempC = day < 14 ? 36.45 + (Math.random() * 0.05 - 0.025) : 36.85 + (progesterone / 16.0) * 0.35;

  // Cervical Mucus
  let cervicalMucusType: 'scant_thick' | 'watery_elastic_spinnbarkeit' | 'sticky_viscous';
  if (day >= 11 && day <= 15 && contraception === 'none') {
    cervicalMucusType = 'watery_elastic_spinnbarkeit'; // High estrogen, watery, fern pattern, facilitates sperm motility
  } else if (day > 15 || contraception === 'oral_combined_pill' || contraception === 'progestin_implant') {
    cervicalMucusType = 'sticky_viscous'; // High progesterone, impenetrable sperm barrier
  } else {
    cervicalMucusType = 'scant_thick';
  }

  const ovulationOccurred = day >= 14 && contraception !== 'oral_combined_pill' && contraception !== 'progestin_implant';
  const fertileWindow = day >= 10 && day <= 16 && contraception === 'none';

  return {
    day,
    phase,
    fshMiuMl: Number(fsh.toFixed(2)),
    lhMiuMl: Number(lh.toFixed(2)),
    estradiolPgMl: Number(estradiol.toFixed(1)),
    progesteroneNgMl: Number(progesterone.toFixed(2)),
    endometrialThicknessMm: Number(endometrialThicknessMm.toFixed(2)),
    follicleDiameterMm: Number(follicleDiameterMm.toFixed(1)),
    basalBodyTempC: Number(basalBodyTempC.toFixed(2)),
    cervicalMucusType,
    ovulationOccurred,
    fertileWindow,
  };
}

/**
 * Simulate the biophysical kinetics of Fertilization at the Ampullary-Isthmic junction.
 */
export function evaluateFertilization(
  spermCountMillion: number,
  timePostInseminationHours: number,
  contraceptive: ContraceptionMethod = 'none'
): FertilizationKinetics {
  if (contraceptive === 'barrier_condom') {
    return {
      spermCountMillion: 0,
      capacitatedPct: 0,
      chemotaxisIndex: 0,
      acrosomeReactionTriggered: false,
      zonaPenetrationDepthPct: 0,
      corticalGranuleExocytosis: false,
      polyspermyPrevented: true,
      pronucleiFusionComplete: false,
      fertilizationSuccessful: false,
    };
  }

  if (contraceptive === 'copper_iud') {
    // Copper ions Cu2+ are directly spermicidal, inhibiting motility and acrosome enzymes
    return {
      spermCountMillion: Math.round(spermCountMillion * 0.05),
      capacitatedPct: 2,
      chemotaxisIndex: 0.05,
      acrosomeReactionTriggered: false,
      zonaPenetrationDepthPct: 5,
      corticalGranuleExocytosis: false,
      polyspermyPrevented: true,
      pronucleiFusionComplete: false,
      fertilizationSuccessful: false,
    };
  }

  // Normal pathway
  const t = Math.max(0, timePostInseminationHours);

  // Capacitation takes 5-7 hours in the female reproductive tract
  const capacitatedPct = Math.min(100, Math.max(0, (t / 6.0) * 85));

  // Chemotaxis towards progesterone & thermal gradient
  const chemotaxisIndex = Math.min(1.0, 0.2 + (t / 8.0) * 0.8);

  // Acrosome reaction occurs upon binding to ZP3 receptor on Zona Pellucida
  const acrosomeReactionTriggered = t >= 6.0 && spermCountMillion >= 15;

  // Zona penetration: hyaluronidase & acrosin enzymes digest path
  const zonaPenetrationDepthPct = acrosomeReactionTriggered ? Math.min(100, (t - 6.0) * 35) : 0;

  // Cortical reaction: triggered when first sperm membrane fuses with oolemma
  const corticalGranuleExocytosis = zonaPenetrationDepthPct >= 95;

  // Polyspermy block: hardening of zona pellucida via ZP2 cleavage (slow block)
  const polyspermyPrevented = corticalGranuleExocytosis;

  // Karyogamy (fusion of haploid male & female pronuclei, forming diploid 46-chromosome zygote)
  const pronucleiFusionComplete = t >= 16.0 && corticalGranuleExocytosis;

  const fertilizationSuccessful = pronucleiFusionComplete && polyspermyPrevented;

  return {
    spermCountMillion,
    capacitatedPct: Number(capacitatedPct.toFixed(1)),
    chemotaxisIndex: Number(chemotaxisIndex.toFixed(2)),
    acrosomeReactionTriggered,
    zonaPenetrationDepthPct: Number(zonaPenetrationDepthPct.toFixed(1)),
    corticalGranuleExocytosis,
    polyspermyPrevented,
    pronucleiFusionComplete,
    fertilizationSuccessful,
  };
}

/**
 * Progressive stages of Human Embryogenesis from Zygote to Implantation.
 */
export const EMBRYOGENESIS_STAGES: readonly EmbryogenesisStage[] = [
  {
    hoursPostFertilization: 0,
    stageName: 'Zygote (Single Diploid Cell)',
    cellCount: 1,
    diameterMicrons: 120,
    anatomicalLocation: 'ampulla',
    description: 'Fertilized ovum with male and female pronuclei fused. Diploid chromosome complement restored (46, XX or 46, XY).',
  },
  {
    hoursPostFertilization: 30,
    stageName: '2-Cell Stage (First Mitotic Cleavage)',
    cellCount: 2,
    diameterMicrons: 120,
    anatomicalLocation: 'ampulla',
    description: 'First mitotic division completes without increasing overall embryonic volume, constrained by Zona Pellucida.',
  },
  {
    hoursPostFertilization: 48,
    stageName: '4-Cell Stage',
    cellCount: 4,
    diameterMicrons: 120,
    anatomicalLocation: 'isthmus',
    description: 'Synchronous cleavage division yielding four equal totipotent blastomeres.',
  },
  {
    hoursPostFertilization: 72,
    stageName: '8-Cell Stage (Compaction)',
    cellCount: 8,
    diameterMicrons: 120,
    anatomicalLocation: 'isthmus',
    description: 'Blastomeres undergo compaction, forming tight junctions with distinct inner and outer cell orientations.',
  },
  {
    hoursPostFertilization: 96,
    stageName: 'Morula (Mulberry-like Solid Ball)',
    cellCount: 16,
    diameterMicrons: 120,
    anatomicalLocation: 'uterine_cavity',
    description: '16 to 32 compacted cells entering the uterine cavity. Fluid begins to accumulate in intercellular spaces.',
  },
  {
    hoursPostFertilization: 120,
    stageName: 'Early Blastocyst (Hatching begins)',
    cellCount: 64,
    diameterMicrons: 150,
    anatomicalLocation: 'uterine_cavity',
    description: 'Formation of fluid-filled blastocoel cavity. Differentiation into Inner Cell Mass (embryo) and Trophoblast (placenta).',
  },
  {
    hoursPostFertilization: 168,
    stageName: 'Implanting Blastocyst',
    cellCount: 128,
    diameterMicrons: 220,
    anatomicalLocation: 'endometrium_implanted',
    description: 'Hatched from Zona Pellucida. Syncytiotrophoblast invades secretory endometrium, initiating hCG secretion and pregnancy.',
  },
];
