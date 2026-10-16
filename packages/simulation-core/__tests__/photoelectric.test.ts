import { describe, expect, it } from 'vitest';
import { PhotoelectricEngine } from '../src/physics/photoelectric';

describe('PhotoelectricEngine (Einstein Photoelectric Effect)', () => {
  it('correctly predicts photoelectron emission when photon energy exceeds work function', () => {
    // Cesium: work function 2.14 eV. 400 nm photon energy ~ 3.10 eV -> emission
    const res = PhotoelectricEngine.compute({
      metal: 'cesium',
      wavelengthNm: 400,
      intensityPercent: 80,
      appliedVoltageV: 0,
    });

    expect(res.isEmissionPossible).toBe(true);
    expect(res.stoppingPotentialV).toBeGreaterThan(0.9);
    expect(res.maxElectronSpeedMs).toBeGreaterThan(1e5);
  });

  it('predicts zero emission when photon energy is below work function (red light on copper)', () => {
    // Copper: work function 4.65 eV. 650 nm red light photon ~ 1.91 eV -> no emission
    const res = PhotoelectricEngine.compute({
      metal: 'copper',
      wavelengthNm: 650,
      intensityPercent: 100,
      appliedVoltageV: 2,
    });

    expect(res.isEmissionPossible).toBe(false);
    expect(res.stoppingPotentialV).toBe(0);
    expect(res.currentPhotocurrentUa).toBe(0);
  });

  it('stops current when retarding potential is more negative than -Vs', () => {
    const res = PhotoelectricEngine.compute({
      metal: 'sodium',
      wavelengthNm: 350,
      intensityPercent: 50,
      appliedVoltageV: 0,
    });

    const vs = res.stoppingPotentialV;
    const cutOffState = PhotoelectricEngine.compute({
      metal: 'sodium',
      wavelengthNm: 350,
      intensityPercent: 50,
      appliedVoltageV: -vs - 0.5,
    });

    expect(cutOffState.currentPhotocurrentUa).toBe(0);
  });
});
