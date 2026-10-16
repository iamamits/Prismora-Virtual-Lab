import { describe, it, expect } from 'vitest';
import {
  LiquidExtractionEngine,
  DEFAULT_EXTRACTION_PARAMS,
} from '../src/chemical/liquid-extraction';
import {
  HeatExchangerEngine,
  DEFAULT_HEAT_EXCHANGER_PARAMS,
} from '../src/chemical/heat-exchanger';
import {
  GasAbsorptionEngine,
  DEFAULT_GAS_ABSORPTION_PARAMS,
} from '../src/chemical/gas-absorption';

describe('Advanced Chemical Engineering Engines', () => {
  describe('LiquidExtractionEngine', () => {
    it('computes single and multi-stage extraction material balances', () => {
      const res = LiquidExtractionEngine.compute(DEFAULT_EXTRACTION_PARAMS);
      expect(res.stages.length).toBe(2);
      expect(res.overallRecoveryPct).toBeGreaterThan(0);
      expect(res.overallRecoveryPct).toBeLessThan(100);
      expect(res.finalRaffinateSoluteFraction).toBeLessThan(DEFAULT_EXTRACTION_PARAMS.feedSoluteMassFraction);
      expect(res.binodalCurvePoints.length).toBeGreaterThan(5);
    });

    it('higher distribution coefficient K yields higher recovery', () => {
      const lowK = LiquidExtractionEngine.compute({
        ...DEFAULT_EXTRACTION_PARAMS,
        distributionCoeffK: 1.0,
      });
      const highK = LiquidExtractionEngine.compute({
        ...DEFAULT_EXTRACTION_PARAMS,
        distributionCoeffK: 3.5,
      });
      expect(highK.overallRecoveryPct).toBeGreaterThan(lowK.overallRecoveryPct);
    });
  });

  describe('HeatExchangerEngine', () => {
    it('computes counter-current heat exchanger temperatures and LMTD', () => {
      const res = HeatExchangerEngine.compute(DEFAULT_HEAT_EXCHANGER_PARAMS);
      expect(res.hotOutletTempC).toBeLessThan(DEFAULT_HEAT_EXCHANGER_PARAMS.hotInletTempC);
      expect(res.coldOutletTempC).toBeGreaterThan(DEFAULT_HEAT_EXCHANGER_PARAMS.coldInletTempC);
      expect(res.heatDutyKw).toBeGreaterThan(0);
      expect(res.lmtdC).toBeGreaterThan(0);
      expect(res.effectivenessPct).toBeGreaterThan(0);
      expect(res.effectivenessPct).toBeLessThanOrEqual(100);
      expect(res.temperatureProfilesAlongLength.length).toBeGreaterThan(5);
    });

    it('counter-current flow has higher or equal effectiveness compared to co-current flow', () => {
      const counter = HeatExchangerEngine.compute({
        ...DEFAULT_HEAT_EXCHANGER_PARAMS,
        flowArrangement: 'counter_current',
      });
      const co = HeatExchangerEngine.compute({
        ...DEFAULT_HEAT_EXCHANGER_PARAMS,
        flowArrangement: 'co_current',
      });
      expect(counter.effectivenessPct).toBeGreaterThanOrEqual(co.effectivenessPct);
    });
  });

  describe('GasAbsorptionEngine', () => {
    it('computes absorption factor, transfer units, and packed height', () => {
      const res = GasAbsorptionEngine.compute(DEFAULT_GAS_ABSORPTION_PARAMS);
      expect(res.absorptionFactorA).toBeGreaterThan(1.0);
      expect(res.percentageRecovery).toBeGreaterThan(80);
      expect(res.numberOfTransferUnitsNog).toBeGreaterThan(0);
      expect(res.heightOfPackingZMetres).toBeGreaterThan(0);
      expect(res.operatingLinePoints.length).toBeGreaterThanOrEqual(2);
      expect(res.equilibriumLinePoints.length).toBeGreaterThanOrEqual(2);
    });
  });
});
