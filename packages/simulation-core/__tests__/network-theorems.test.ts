import { describe, it, expect } from 'vitest';
import {
  evaluateNetworkTheorems,
  evaluateDualSourceTNetwork,
  evaluateBridgeNetwork,
  generateLoadSweep,
  validateNetworkParams,
} from '../src/electrical/network-theorems-evaluator';

describe('Network Theorems Evaluator', () => {
  describe('Dual-Source T-Network (Standard Benchmark)', () => {
    // Textbook parameters:
    // V1 = 12V, R1 = 100Ω, V2 = 6V, R2 = 200Ω, R3 = 200Ω, RL = 150Ω
    const textbookParams = {
      topology: 'dual-source-t-network' as const,
      v1: 12,
      r1: 100,
      v2: 6,
      r2: 200,
      r3: 200,
      rL: 150,
    };

    it('should compute exact Thévenin open-circuit voltage V_th', () => {
      const res = evaluateDualSourceTNetwork(textbookParams);
      // g1 = 0.01, g2 = 0.005, g3 = 0.005 => gTotal = 0.02 S
      // V_th = (12*0.01 + 6*0.005)/0.02 = 0.15 / 0.02 = 7.5 V
      expect(res.vTh).toBeCloseTo(7.5, 6);
    });

    it('should compute exact Thévenin resistance R_th', () => {
      const res = evaluateDualSourceTNetwork(textbookParams);
      // R_th = 1 / gTotal = 1 / 0.02 = 50 Ω
      expect(res.rTh).toBeCloseTo(50, 6);
    });

    it('should compute exact Norton short-circuit current I_N and satisfy I_N * R_th == V_th', () => {
      const res = evaluateDualSourceTNetwork(textbookParams);
      // I_N = 12/100 + 6/200 = 0.12 + 0.03 = 0.15 A
      expect(res.iN).toBeCloseTo(0.15, 6);
      expect(res.rN).toBeCloseTo(50, 6);
      expect(res.iN * res.rTh).toBeCloseTo(res.vTh, 6);
    });

    it('should verify equivalence between original circuit and Thévenin & Norton equivalents', () => {
      const res = evaluateDualSourceTNetwork(textbookParams);
      expect(res.originalCircuitMatchesThevenin).toBe(true);
      expect(res.theveninMatchesNorton).toBe(true);

      // Load current at RL = 150 Ω:
      // I_L = 7.5 / (50 + 150) = 7.5 / 200 = 0.0375 A (37.5 mA)
      expect(res.iL).toBeCloseTo(0.0375, 6);
      expect(res.vL).toBeCloseTo(0.0375 * 150, 6); // 5.625 V
      expect(res.pL).toBeCloseTo(0.0375 * 5.625, 6); // 0.2109375 W
    });

    it('should confirm Maximum Power Transfer occurs strictly at R_L = R_th', () => {
      const atMaxParams = { ...textbookParams, rL: 50 }; // RL == R_th == 50
      const resMax = evaluateDualSourceTNetwork(atMaxParams);

      expect(resMax.isAtMaximumPower).toBe(true);
      // P_max = V_th^2 / (4 * R_th) = 7.5^2 / (4 * 50) = 56.25 / 200 = 0.28125 W
      expect(resMax.pLMax).toBeCloseTo(0.28125, 6);
      expect(resMax.pL).toBeCloseTo(0.28125, 6);
      // Efficiency must be exactly 50% at maximum power transfer
      expect(resMax.efficiencyPct).toBeCloseTo(50.0, 4);

      // Lower load: RL = 25 Ω
      const resLow = evaluateDualSourceTNetwork({ ...textbookParams, rL: 25 });
      expect(resLow.pL).toBeLessThan(resMax.pL);
      expect(resLow.pL).toBeCloseTo(0.25, 5);

      // Higher load: RL = 100 Ω
      const resHigh = evaluateDualSourceTNetwork({ ...textbookParams, rL: 100 });
      expect(resHigh.pL).toBeLessThan(resMax.pL);
      expect(resHigh.pL).toBeCloseTo(0.25, 5);
    });

    it('should confirm Superposition theorem: V_th1 + V_th2 == V_th', () => {
      const res = evaluateDualSourceTNetwork(textbookParams);
      expect(res.superposition).toBeDefined();
      expect(res.superposition!.sumCheck).toBe(true);
      // V1 alone: (12 * 0.01) / 0.02 = 6.0 V
      // V2 alone: (6 * 0.005) / 0.02 = 1.5 V
      // Total: 7.5 V
      expect(res.superposition!.vTh1).toBeCloseTo(6.0, 6);
      expect(res.superposition!.vTh2).toBeCloseTo(1.5, 6);
      expect(res.superposition!.vTh1 + res.superposition!.vTh2).toBeCloseTo(7.5, 6);
    });

    it('should generate valid load sweep points with peak at R_th', () => {
      const sweep = generateLoadSweep(7.5, 50, 150, 21);
      expect(sweep.length).toBeGreaterThanOrEqual(21);
      const optimalPoint = sweep.find((pt) => pt.isOptimal);
      expect(optimalPoint).toBeDefined();
      expect(optimalPoint!.rL).toBeCloseTo(50, 4);
      expect(optimalPoint!.pL).toBeCloseTo(0.28125, 5);

      // Check that all other points in sweep have pL <= optimalPoint.pL
      sweep.forEach((pt) => {
        expect(pt.pL).toBeLessThanOrEqual(optimalPoint!.pL + 1e-6);
      });
    });
  });

  describe('Bridge Network (Wheatstone / Unbalanced Bridge)', () => {
    // Vs = 10V, R1 = 100Ω, R2 = 300Ω, R3 = 200Ω, R4 = 200Ω, RL = 175Ω
    const bridgeParams = {
      topology: 'bridge-network' as const,
      vs: 10,
      r1: 100,
      r2: 300,
      r3: 200,
      r4: 200,
      rL: 175,
    };

    it('should compute exact bridge open-circuit voltage and Thévenin resistance', () => {
      const res = evaluateBridgeNetwork(bridgeParams);
      // VC = 10 * 300 / 400 = 7.5 V
      // VD = 10 * 200 / 400 = 5.0 V
      // V_th = 7.5 - 5.0 = 2.5 V
      expect(res.vTh).toBeCloseTo(2.5, 6);

      // R_th = (100 || 300) + (200 || 200) = 75 + 100 = 175 Ω
      expect(res.rTh).toBeCloseTo(175, 6);
    });

    it('should confirm Maximum Power at RL == R_th in bridge network', () => {
      const res = evaluateBridgeNetwork(bridgeParams);
      // Since rL = 175 == rTh = 175, this should be at maximum power
      expect(res.isAtMaximumPower).toBe(true);
      // P_max = 2.5^2 / (4 * 175) = 6.25 / 700 ≈ 0.00892857 W
      expect(res.pL).toBeCloseTo(6.25 / 700, 6);
      expect(res.efficiencyPct).toBeCloseTo(50.0, 4);
    });
  });

  describe('Universal Evaluator and Validation', () => {
    it('should dispatch correctly via evaluateNetworkTheorems', () => {
      const res = evaluateNetworkTheorems({
        topology: 'dual-source-t-network',
        v1: 10,
        r1: 50,
        v2: 5,
        r2: 50,
        r3: 50,
        rL: 50,
      });
      expect(res.topology).toBe('dual-source-t-network');
      expect(res.derivations.length).toBe(4);
    });

    it('should reject non-positive resistances', () => {
      const validation = validateNetworkParams({
        topology: 'dual-source-t-network',
        v1: 12,
        r1: -10, // Invalid
        v2: 6,
        r2: 200,
        r3: 200,
        rL: 100,
      });
      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('strictly positive');
    });

    it('should reject non-finite voltages', () => {
      const validation = validateNetworkParams({
        topology: 'dual-source-t-network',
        v1: NaN,
        r1: 100,
        v2: 6,
        r2: 200,
        r3: 200,
        rL: 100,
      });
      expect(validation.valid).toBe(false);
    });
  });
});
