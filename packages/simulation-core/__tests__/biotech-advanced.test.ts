import { describe, it, expect } from 'vitest';
import {
  KlaBioreactorEngine,
  DEFAULT_KLA_PARAMS,
} from '../src/biotech/kla-bioreactor';
import {
  ChromatographyEngine,
  DEFAULT_CHROMATOGRAPHY_PARAMS,
} from '../src/biotech/chromatography';
import {
  PcrKineticsEngine,
  DEFAULT_PCR_PARAMS,
} from '../src/biotech/pcr-kinetics';

describe('Advanced Biotechnology & Bioengineering Engines', () => {
  describe('KlaBioreactorEngine', () => {
    it('computes KLa oxygen transfer coefficient and reoxygenation curves', () => {
      const res = KlaBioreactorEngine.compute(DEFAULT_KLA_PARAMS);
      expect(res.klaPerHour).toBeGreaterThan(10);
      expect(res.saturationDoMgPerL).toBeGreaterThan(5);
      expect(res.maxOtrMgPerLPerH).toBeGreaterThan(0);
      expect(res.reoxygenationCurve.length).toBeGreaterThan(10);
      expect(res.logPlotPoints.length).toBeGreaterThan(5);
    });

    it('higher RPM increases KLa rate', () => {
      const lowRpm = KlaBioreactorEngine.compute({
        ...DEFAULT_KLA_PARAMS,
        agitationSpeedRpm: 250,
      });
      const highRpm = KlaBioreactorEngine.compute({
        ...DEFAULT_KLA_PARAMS,
        agitationSpeedRpm: 700,
      });
      expect(highRpm.klaPerHour).toBeGreaterThan(lowRpm.klaPerHour);
    });
  });

  describe('ChromatographyEngine', () => {
    it('computes gel filtration elution volumes, Kav, and resolution', () => {
      const res = ChromatographyEngine.compute(DEFAULT_CHROMATOGRAPHY_PARAMS);
      expect(res.voidVolumeV0Ml).toBeGreaterThan(0);
      expect(res.totalVolumeVtMl).toBeGreaterThan(res.voidVolumeV0Ml);
      expect(res.peaks.length).toBe(3);
      // Largest molecule should elute first with lowest elution volume
      expect(res.peaks[0]!.elutionVolumeMl).toBeLessThan(res.peaks[2]!.elutionVolumeMl);
      expect(res.chromatogramUvCurve.length).toBeGreaterThan(20);
    });
  });

  describe('PcrKineticsEngine', () => {
    it('computes thermal cycling DNA copy amplification and Ct cycle', () => {
      const res = PcrKineticsEngine.compute(DEFAULT_PCR_PARAMS);
      expect(res.finalAmpliconCopies).toBeGreaterThan(DEFAULT_PCR_PARAMS.initialTemplateCopies);
      expect(res.foldAmplification).toBeGreaterThan(1e6);
      expect(res.cycleThresholdCt).toBeGreaterThan(10);
      expect(res.cycleThresholdCt).toBeLessThan(35);
      expect(res.amplificationCurve.length).toBe(DEFAULT_PCR_PARAMS.cycleCount + 1);
      expect(res.thermalProfile.length).toBeGreaterThan(5);
    });

    it('higher initial template copy count reduces Ct threshold cycle', () => {
      const lowTemplate = PcrKineticsEngine.compute({
        ...DEFAULT_PCR_PARAMS,
        initialTemplateCopies: 500,
      });
      const highTemplate = PcrKineticsEngine.compute({
        ...DEFAULT_PCR_PARAMS,
        initialTemplateCopies: 500000,
      });
      expect(highTemplate.cycleThresholdCt).toBeLessThan(lowTemplate.cycleThresholdCt);
    });
  });
});
