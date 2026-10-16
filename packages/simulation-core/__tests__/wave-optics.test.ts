import { describe, it, expect } from 'vitest';
import {
  WaveOpticsEvaluator,
  type WaveOpticsParams,
} from '../src/physics/wave-optics';

describe('WaveOpticsEvaluator — AICTE Physics & Wave Optics', () => {
  const baseParams: WaveOpticsParams = {
    wavelengthNm: 632.8,       // He-Ne Red Laser: lambda = 632.8 nm
    slitSeparationMm: 0.25,    // d = 0.25 mm = 2.5e-4 m
    slitWidthMm: 0.05,         // a = 0.05 mm = 5.0e-5 m => d/a = 5
    screenDistanceM: 1.5,      // D = 1.5 m
    sourceIntensityPct: 100,
  };

  it('computes linear fringe width accurately according to Young formula', () => {
    const char = WaveOpticsEvaluator.computeCharacteristics(baseParams);

    // w = lambda * D / d = (632.8e-9 * 1.5) / 2.5e-4 = 9.492e-7 / 2.5e-4 = 3.7968e-3 m = 3.7968 mm
    const expectedWidthMm = (632.8e-9 * 1.5 * 1000) / 2.5e-4;
    expect(char.fringeWidthMm).toBeCloseTo(expectedWidthMm, 4);
    expect(char.ratioSeparationToWidth).toBeCloseTo(5.0, 4);
  });

  it('identifies missing orders where diffraction minima cancel interference maxima', () => {
    const char = WaveOpticsEvaluator.computeCharacteristics(baseParams);
    // When d / a = 5, orders 5, 10, 15, 20 are cancelled
    expect(char.missingOrders).toContain(5);
    expect(char.missingOrders).toContain(10);
  });

  it('evaluates peak maximum intensity at screen center x = 0', () => {
    const centerPoint = WaveOpticsEvaluator.computeIntensityAt(baseParams, 0.0);
    expect(centerPoint.intensity).toBeCloseTo(1.0, 4);
    expect(centerPoint.diffractionEnvelope).toBeCloseTo(1.0, 4);
    expect(centerPoint.interferenceFactor).toBeCloseTo(1.0, 4);
  });

  it('evaluates zero intensity at first destructive interference condition', () => {
    const char = WaveOpticsEvaluator.computeCharacteristics(baseParams);
    // First dark fringe occurs at x = w / 2 = 3.7968 / 2 = 1.8984 mm
    const darkPoint = WaveOpticsEvaluator.computeIntensityAt(baseParams, char.fringeWidthMm / 2);
    expect(darkPoint.interferenceFactor).toBeCloseTo(0.0, 2);
    expect(darkPoint.intensity).toBeCloseTo(0.0, 2);
  });

  it('maps physical laser wavelengths to standard RGB and spectral color names', () => {
    const red = WaveOpticsEvaluator.wavelengthToColor(650);
    expect(red.name).toContain('Red');
    expect(red.hex.toUpperCase()).toContain('#FF');

    const green = WaveOpticsEvaluator.wavelengthToColor(532);
    expect(green.name).toContain('Green');

    const blue = WaveOpticsEvaluator.wavelengthToColor(450);
    expect(blue.name).toContain('Blue');
  });

  it('generates symmetric intensity profile across screen span', () => {
    const profile = WaveOpticsEvaluator.generateIntensityProfile(baseParams, 15, 101);
    expect(profile.length).toBe(101);

    const centerIdx = 50;
    expect(profile[centerIdx]!.xPositionMm).toBeCloseTo(0.0, 3);
    expect(profile[centerIdx]!.intensity).toBeCloseTo(1.0, 3);

    // Left and right symmetric points must have equal intensity
    const leftPoint = profile[30]!;
    const rightPoint = profile[70]!;
    expect(leftPoint.intensity).toBeCloseTo(rightPoint.intensity, 3);
  });
});
