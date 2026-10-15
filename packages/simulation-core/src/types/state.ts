import type { SimulationState } from './simulation';

export interface ProjectileMotionState extends SimulationState {
  /** Speed magnitude in m/s */
  readonly speed: number;
  /** Kinetic energy in Joules (per unit mass) */
  readonly kineticEnergyPerMass: number;
  /** Potential energy in Joules (per unit mass, relative to ground) */
  readonly potentialEnergyPerMass: number;
}
