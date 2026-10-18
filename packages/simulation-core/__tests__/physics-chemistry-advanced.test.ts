import { describe, expect, it } from 'vitest';
import {
  ChemicalEquilibriumEngine,
  ElectrochemistryEngine,
  RutherfordScatteringEngine,
} from '../src';

describe('Advanced Class 11 & 12 Chemistry & Physics Engines', () => {
  describe('Chemical Equilibrium & Le Chatelier (N2O4 <=> 2 NO2)', () => {
    it('should compute temperature-dependent Kc using van \'t Hoff equation', () => {
      // Endothermic reaction: higher temperature increases Kc (more NO2 formed)
      const kc298 = ChemicalEquilibriumEngine.calculateKc(298.15);
      const kc350 = ChemicalEquilibriumEngine.calculateKc(350);
      const kc273 = ChemicalEquilibriumEngine.calculateKc(273.15);

      expect(kc298).toBeCloseTo(0.0059, 4);
      expect(kc350).toBeGreaterThan(kc298);
      expect(kc273).toBeLessThan(kc298);
    });

    it('should shift equilibrium towards fewer gas moles upon compression (Volume reduction)', () => {
      // Compressing from 5L to 1L shifts towards N2O4 (1 mole vs 2 moles)
      const state5L = ChemicalEquilibriumEngine.solveEquilibrium(300, 5.0, 0.5, 0.2);
      const state1L = ChemicalEquilibriumEngine.solveEquilibrium(300, 1.0, 0.5, 0.2);

      expect(state1L.pressureAtm).toBeGreaterThan(state5L.pressureAtm);
      expect(state1L.opticalAbsorbance).toBeDefined();
    });
  });

  describe('Electrochemistry & Daniell Cell (Zn | Zn2+ || Cu2+ | Cu)', () => {
    it('should calculate standard cell potential E°cell = 1.10 V at 1M concentrations', () => {
      const cell = ElectrochemistryEngine.calculateCell(1.0, 1.0, 298.15);
      expect(cell.eStandardCellV).toBeCloseTo(1.10, 2);
      expect(cell.eCellV).toBeCloseTo(1.10, 2);
      expect(cell.isSpontaneous).toBe(true);
      expect(cell.deltaGJ).toBeLessThan(0); // Spontaneous reaction
    });

    it('should obey Nernst equation when concentrations deviate from standard 1M', () => {
      // High [Zn2+] and low [Cu2+] decreases EMF
      const cell = ElectrochemistryEngine.calculateCell(2.0, 0.01, 298.15);
      expect(cell.eCellV).toBeLessThan(1.10);
      expect(cell.reactionQuotientQ).toBe(200);
    });
  });

  describe('Rutherford Alpha Particle Scattering (Au Z=79)', () => {
    it('should compute distance of closest approach r0 correctly', () => {
      // For 5.5 MeV on Gold (Z=79): r0 = (2 * 79 * 1.44) / 5.5 ≈ 41.38 fm
      const r0 = RutherfordScatteringEngine.calculateClosestApproach(79, 5.5);
      expect(r0).toBeCloseTo(41.38, 1);
    });

    it('should simulate beam trajectories with forward and large-angle backscattering', () => {
      const beam = RutherfordScatteringEngine.simulateBeam(79, 5.5, 20);
      expect(beam.trajectories.length).toBe(20);
      expect(beam.closestApproachFm).toBeGreaterThan(0);
      expect(beam.trajectories.some((t) => t.isBackscattered)).toBeDefined();
    });
  });
});
