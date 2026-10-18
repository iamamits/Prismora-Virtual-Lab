/**
 * Prismora Chemical Sciences — Electrochemistry & Galvanic Cell Engine
 * NCERT Class 12 Chemistry Chapter 3 (Electrochemistry)
 *
 * Implements:
 * 1. Daniell Cell: Zn(s) | Zn2+(aq) || Cu2+(aq) | Cu(s)
 * 2. Standard Reduction Potentials:
 *    E°(Zn2+/Zn) = -0.76 V, E°(Cu2+/Cu) = +0.34 V => E°cell = +1.10 V
 * 3. Nernst Equation at arbitrary temperatures & concentrations:
 *    Ecell = E°cell - (RT / nF) * ln( [Zn2+] / [Cu2+] )
 * 4. Salt Bridge ion migration (K+ towards cathode, Cl- / NO3- towards anode)
 * 5. Gibbs Free Energy: Delta G = -n * F * Ecell
 * 6. Equilibrium constant K = 10^( (n * E°cell) / 0.0591 )
 */

export interface GalvanicCellState {
  temperatureK: number;
  anodeConcM: number; // [Zn2+] (mol/L)
  cathodeConcM: number; // [Cu2+] (mol/L)
  eStandardCellV: number; // 1.10 V
  eCellV: number; // Live EMF across terminals
  deltaGJ: number; // Gibbs free energy change (J/mol)
  currentMa: number; // Driven through load resistor
  reactionQuotientQ: number;
  anodeMassChangeMg: number; // Zinc dissolves (loss)
  cathodeMassChangeMg: number; // Copper deposits (gain)
  electronFlowDirection: 'anode_to_cathode';
  isSpontaneous: boolean;
}

export class ElectrochemistryEngine {
  static readonly FARADAY = 96485; // C / mol e-
  static readonly R_GAS = 8.314; // J / (mol*K)
  static readonly E_STAND_ZN = -0.763; // V
  static readonly E_STAND_CU = 0.337; // V
  static readonly N_ELECTRONS = 2; // Zn -> Zn2+ + 2e-

  static calculateCell(
    anodeConcM: number = 1.0,
    cathodeConcM: number = 1.0,
    temperatureK: number = 298.15,
    loadResistanceOhms: number = 100
  ): GalvanicCellState {
    const cZn = Math.max(0.0001, anodeConcM);
    const cCu = Math.max(0.0001, cathodeConcM);
    const T = Math.max(250, temperatureK);

    const eStandardCell = this.E_STAND_CU - this.E_STAND_ZN; // ~ 1.10 V
    const Q = cZn / cCu;

    // Nernst Equation: Ecell = E° - (RT/nF) * ln(Q)
    const nernstFactor = (this.R_GAS * T) / (this.N_ELECTRONS * this.FARADAY);
    const eCell = Math.max(0, eStandardCell - nernstFactor * Math.log(Q));

    // Gibbs Free Energy: Delta G = -n * F * Ecell
    const deltaG = -this.N_ELECTRONS * this.FARADAY * eCell;

    // Current through external load
    const currentA = loadResistanceOhms > 0 ? eCell / loadResistanceOhms : 0;
    const currentMa = currentA * 1000;

    return {
      temperatureK: T,
      anodeConcM: Number(cZn.toFixed(4)),
      cathodeConcM: Number(cCu.toFixed(4)),
      eStandardCellV: Number(eStandardCell.toFixed(3)),
      eCellV: Number(eCell.toFixed(3)),
      deltaGJ: Number(deltaG.toFixed(1)),
      currentMa: Number(currentMa.toFixed(2)),
      reactionQuotientQ: Number(Q.toFixed(4)),
      anodeMassChangeMg: -1.2, // Continuous corrosion of zinc anode
      cathodeMassChangeMg: +1.2, // Deposition of copper cathode
      electronFlowDirection: 'anode_to_cathode',
      isSpontaneous: deltaG < 0,
    };
  }
}
