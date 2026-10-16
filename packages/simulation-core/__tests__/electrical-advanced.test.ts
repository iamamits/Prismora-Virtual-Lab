import { describe, it, expect } from 'vitest';
import {
  DcMotorEngine,
  DEFAULT_DC_MOTOR_PARAMS,
  TwoWattmeterEngine,
  DEFAULT_TWO_WATTMETER_PARAMS,
  AlternatorRegulationEngine,
  DEFAULT_ALTERNATOR_PARAMS,
} from '../src/electrical';

describe('Electrical Engineering Advanced Simulations', () => {
  describe('DcMotorEngine (Speed-Torque Characteristics)', () => {
    it('should compute back EMF, armature current, and operating speed', () => {
      const res = DcMotorEngine.compute(DEFAULT_DC_MOTOR_PARAMS);
      expect(res.speedRpm).toBeGreaterThan(500);
      expect(res.backEmfV).toBeLessThan(DEFAULT_DC_MOTOR_PARAMS.terminalVoltageV);
      expect(res.efficiencyPct).toBeGreaterThan(50);
      expect(res.speedTorqueCharacteristics.length).toBeGreaterThan(5);
    });
  });

  describe('TwoWattmeterEngine (3-Phase AC Power & PF)', () => {
    it('should compute active power, reactive power, and lagging power factor', () => {
      const res = TwoWattmeterEngine.compute(DEFAULT_TWO_WATTMETER_PARAMS);
      expect(res.totalActivePowerW).toBeCloseTo(res.wattmeter1W + res.wattmeter2W, 1);
      expect(res.powerFactor).toBeGreaterThan(0.7);
      expect(res.pfNature).toBe('lagging');
    });
  });

  describe('AlternatorRegulationEngine (EMF Method)', () => {
    it('should compute synchronous impedance and percentage voltage regulation', () => {
      const res = AlternatorRegulationEngine.compute(DEFAULT_ALTERNATOR_PARAMS);
      expect(res.synchronousImpedanceZs).toBeGreaterThan(0);
      expect(res.voltageRegulationPct).toBeGreaterThan(0); // Lagging power factor regulation is positive
      expect(res.occPoints.length).toBeGreaterThan(5);
      expect(res.sccPoints.length).toBeGreaterThan(5);
    });
  });
});
