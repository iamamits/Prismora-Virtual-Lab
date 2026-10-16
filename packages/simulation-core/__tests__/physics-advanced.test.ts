import { describe, it, expect } from 'vitest';
import {
  NewtonsRingsEngine,
  DEFAULT_NEWTONS_RINGS_PARAMS,
} from '../src/physics/newtons-rings';
import {
  DiffractionGratingEngine,
  DEFAULT_GRATING_PARAMS,
} from '../src/physics/diffraction-grating';
import {
  CoupledOscillatorEngine,
  DEFAULT_COUPLED_PARAMS,
} from '../src/physics/coupled-oscillators';

describe('Advanced Physical Sciences Engines', () => {
  describe('NewtonsRingsEngine', () => {
    it('computes dark ring diameters proportional to sqrt(n)', () => {
      const res = NewtonsRingsEngine.compute(DEFAULT_NEWTONS_RINGS_PARAMS);
      expect(res.ringDiameters.length).toBe(DEFAULT_NEWTONS_RINGS_PARAMS.maxRingsToDisplay);
      expect(res.ringDiameters[0]!.ringNumberN).toBe(1);
      expect(res.ringDiameters[1]!.diameterMm).toBeGreaterThan(res.ringDiameters[0]!.diameterMm);
      expect(res.calculatedWavelengthNm).toBeCloseTo(DEFAULT_NEWTONS_RINGS_PARAMS.wavelengthNm, 0);
      expect(res.radialIntensityProfile.length).toBeGreaterThan(10);
    });

    it('higher medium refractive index contracts the ring diameters', () => {
      const air = NewtonsRingsEngine.compute({
        ...DEFAULT_NEWTONS_RINGS_PARAMS,
        mediumRefractiveIndex: 1.0,
      });
      const water = NewtonsRingsEngine.compute({
        ...DEFAULT_NEWTONS_RINGS_PARAMS,
        mediumRefractiveIndex: 1.33,
      });
      expect(water.ringDiameters[3]!.diameterMm).toBeLessThan(air.ringDiameters[3]!.diameterMm);
    });
  });

  describe('DiffractionGratingEngine', () => {
    it('computes angular dispersion and spectral line angles', () => {
      const res = DiffractionGratingEngine.compute(DEFAULT_GRATING_PARAMS);
      expect(res.gratingPitchUm).toBeCloseTo(1000 / DEFAULT_GRATING_PARAMS.linesPerMm, 2);
      expect(res.diffractedLines.length).toBeGreaterThan(0);
      // Red light (longer wavelength) diffracted more than violet light
      const violet = res.diffractedLines.find(l => l.label.includes('Violet'));
      const red = res.diffractedLines.find(l => l.label.includes('Red'));
      expect(violet).toBeDefined();
      expect(red).toBeDefined();
      expect(red!.diffractionAngleDeg).toBeGreaterThan(violet!.diffractionAngleDeg);
      expect(res.intensityProfileOverAngle.length).toBeGreaterThan(20);
    });
  });

  describe('CoupledOscillatorEngine', () => {
    it('computes symmetric and antisymmetric normal mode frequencies and beat periods', () => {
      const res = CoupledOscillatorEngine.compute(DEFAULT_COUPLED_PARAMS);
      expect(res.antisymmetricFreqOmega2RadPerS).toBeGreaterThan(res.symmetricFreqOmega1RadPerS);
      expect(res.beatPeriodSeconds).toBeGreaterThan(0);
      expect(res.timeSeriesData.length).toBeGreaterThan(50);
    });
  });
});
