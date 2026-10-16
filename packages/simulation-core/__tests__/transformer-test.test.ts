import { describe, expect, it } from 'vitest';
import { DEFAULT_TRANSFORMER_PARAMS, TransformerTestEngine } from '../src/electrical/transformer-test';

describe('TransformerTestEngine (O.C. & S.C. Tests)', () => {
  it('extracts positive equivalent parameters Rc, Xm, Req, Xeq', () => {
    const res = TransformerTestEngine.compute(DEFAULT_TRANSFORMER_PARAMS);
    expect(res.coreResistanceRc).toBeGreaterThan(100);
    expect(res.magnetizingReactanceXm).toBeGreaterThan(50);
    expect(res.equivalentResistanceReq).toBeGreaterThan(0.01);
    expect(res.equivalentReactanceXeq).toBeGreaterThan(0.01);
  });

  it('computes efficiency above 90% for typical 5 kVA transformer at full load', () => {
    const res = TransformerTestEngine.compute(DEFAULT_TRANSFORMER_PARAMS);
    expect(res.efficiencyPercent).toBeGreaterThan(94);
    expect(res.efficiencyPercent).toBeLessThan(99);
  });

  it('produces positive regulation for lagging power factor and negative for leading', () => {
    const laggingRes = TransformerTestEngine.compute({
      ...DEFAULT_TRANSFORMER_PARAMS,
      powerFactorType: 'lagging',
    });
    const leadingRes = TransformerTestEngine.compute({
      ...DEFAULT_TRANSFORMER_PARAMS,
      powerFactor: 0.8,
      powerFactorType: 'leading',
    });
    expect(laggingRes.voltageRegulationPercent).toBeGreaterThan(0);
    expect(leadingRes.voltageRegulationPercent).toBeLessThan(laggingRes.voltageRegulationPercent);
  });
});
