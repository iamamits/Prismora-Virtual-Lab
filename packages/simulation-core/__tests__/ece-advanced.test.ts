import { describe, it, expect } from 'vitest';
import {
  BjtCharacteristicsEngine,
  DEFAULT_BJT_PARAMS,
} from '../src/ece/bjt-characteristics';
import {
  OpAmpEngine,
  DEFAULT_OPAMP_PARAMS,
} from '../src/ece/op-amp';

describe('Advanced ECE Analog Electronics Engines', () => {
  describe('BjtCharacteristicsEngine', () => {
    it('computes CE output characteristics and operating regions', () => {
      const res = BjtCharacteristicsEngine.compute(DEFAULT_BJT_PARAMS);
      expect(res.collectorCurrentMa).toBeGreaterThan(0);
      expect(res.emitterCurrentMa).toBeGreaterThan(res.collectorCurrentMa);
      expect(res.operatingRegion).toBe('active');
      expect(res.outputCharacteristicsCurves.length).toBeGreaterThan(3);
      expect(res.inputCharacteristicsPoints.length).toBeGreaterThan(5);
    });

    it('higher base current yields proportionally higher collector current', () => {
      const lowIb = BjtCharacteristicsEngine.compute({
        ...DEFAULT_BJT_PARAMS,
        baseCurrentMicroA: 20,
      });
      const highIb = BjtCharacteristicsEngine.compute({
        ...DEFAULT_BJT_PARAMS,
        baseCurrentMicroA: 60,
      });
      expect(highIb.collectorCurrentMa).toBeGreaterThan(lowIb.collectorCurrentMa);
    });
  });

  describe('OpAmpEngine', () => {
    it('computes inverting amplifier closed-loop gain and output voltage', () => {
      const res = OpAmpEngine.compute({
        ...DEFAULT_OPAMP_PARAMS,
        configuration: 'inverting',
        inputVoltageVin1Volts: 2.0,
        feedbackResistanceRfKOhms: 30,
        inputResistanceRinKOhms: 10,
        supplyVoltageVccVolts: 15,
      });
      expect(res.closedLoopGain).toBeCloseTo(-3, 4);
      expect(res.outputVoltageVolts).toBeCloseTo(-6, 4);
      expect(res.isSaturated).toBe(false);
      expect(res.waveformPoints.length).toBeGreaterThan(10);
    });

    it('clamps output voltage to power supply rails when saturated', () => {
      const res = OpAmpEngine.compute({
        ...DEFAULT_OPAMP_PARAMS,
        configuration: 'inverting',
        inputVoltageVin1Volts: 5.0,
        feedbackResistanceRfKOhms: 100,
        inputResistanceRinKOhms: 10,
        supplyVoltageVccVolts: 15,
      });
      expect(res.isSaturated).toBe(true);
      expect(res.outputVoltageVolts).toBe(-15);
    });

    it('computes non-inverting amplifier gain = 1 + Rf / Rin', () => {
      const res = OpAmpEngine.compute({
        ...DEFAULT_OPAMP_PARAMS,
        configuration: 'non_inverting',
        inputVoltageVin1Volts: 2.0,
        feedbackResistanceRfKOhms: 40,
        inputResistanceRinKOhms: 10,
        supplyVoltageVccVolts: 15,
      });
      expect(res.closedLoopGain).toBeCloseTo(5, 4);
      expect(res.outputVoltageVolts).toBeCloseTo(10, 4);
      expect(res.isSaturated).toBe(false);
    });
  });
});
