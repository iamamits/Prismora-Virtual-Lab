/**
 * Prismora Physical Sciences — Rutherford Alpha Particle Scattering Engine
 * NCERT Class 12 Physics Chapter 12 (Atoms & Nuclei) & IIT JEE Standard
 *
 * Implements:
 * 1. Classical Coulomb Electrostatic Scattering of Alpha Particles (q1 = +2e) by Gold Nucleus (q2 = +79e, Z = 79):
 *    F = (1 / 4*pi*epsilon0) * (2 * Z * e^2) / r^2
 * 2. Rutherford Scattering Formula for differential cross-section:
 *    N(theta) proportional to 1 / sin^4(theta / 2)
 * 3. Impact parameter b vs Scattering angle theta:
 *    b = (1 / 4*pi*epsilon0) * (Z * e^2 / K) * cot(theta / 2)
 * 4. Distance of closest approach r0 (head-on collision, b = 0):
 *    r0 = (2 * Z * e^2) / (4*pi*epsilon0 * K_alpha)
 * 5. Trajectory integration: hyperbolic orbits with real-time deflections
 */

export interface AlphaParticleTrajectory {
  id: number;
  initialY: number; // impact parameter offset (fm or arbitrary scale)
  energyMev: number; // e.g. 5.5 MeV (alpha from Bismuth-214)
  scatteringAngleDeg: number;
  impactParameterFm: number;
  points: { x: number; y: number }[];
  isBackscattered: boolean; // theta > 90 deg (Geiger-Marsden key observation: 1 in 8000)
}

export interface RutherfordScatteringState {
  targetNucleusZ: number; // 79 for Gold (Au), 13 for Aluminum, 29 for Copper
  targetName: string;
  alphaEnergyMev: number; // 5.5 MeV default
  closestApproachFm: number; // ~ 41.3 fm for 5.5 MeV on Au
  detectedCountsPerAngle: Record<number, number>; // theta -> count
  trajectories: AlphaParticleTrajectory[];
}

export class RutherfordScatteringEngine {
  // Physical Constants
  static readonly KE2_FM_MEV = 1.43996; // (e^2 / 4*pi*epsilon0) in MeV*fm
  static readonly GOLD_Z = 79;

  /**
   * Distance of closest approach for head-on collision (b = 0):
   * r0 = (2 * Z * e^2) / (4*pi*epsilon0 * K) = (2 * Z * 1.44) / K (fm)
   */
  static calculateClosestApproach(z: number = 79, energyMev: number = 5.5): number {
    return (2 * z * this.KE2_FM_MEV) / Math.max(0.1, energyMev);
  }

  /**
   * Compute scattering angle theta for given impact parameter b:
   * cot(theta / 2) = (2 * b * K) / (2 * Z * e^2) = b / (r0 / 2)
   * => tan(theta / 2) = r0 / (2 * b)
   * => theta = 2 * atan(r0 / (2 * b))
   */
  static calculateScatteringAngle(impactParameterFm: number, r0: number): number {
    if (impactParameterFm <= 0.001) return 180; // Head-on reflection
    const thetaRad = 2 * Math.atan(r0 / (2 * impactParameterFm));
    return (thetaRad * 180) / Math.PI;
  }

  /**
   * Generate trajectories for a bundle of alpha particles entering from x = -300 to x = +300.
   */
  static simulateBeam(
    targetZ: number = 79,
    energyMev: number = 5.5,
    beamCount: number = 15
  ): RutherfordScatteringState {
    const r0 = this.calculateClosestApproach(targetZ, energyMev);
    const trajectories: AlphaParticleTrajectory[] = [];
    const counts: Record<number, number> = { 10: 0, 30: 0, 60: 0, 90: 0, 120: 0, 150: 0, 180: 0 };

    for (let i = 0; i < beamCount; i++) {
      // Non-linear impact parameter distribution (more particles at larger b)
      const sign = i % 2 === 0 ? 1 : -1;
      const bNorm = Math.pow((i + 1) / beamCount, 1.8);
      const bFm = Math.max(0.5, bNorm * 60);
      const thetaDeg = this.calculateScatteringAngle(bFm, r0);

      const isBack = thetaDeg > 90;

      // Classify into angle bin
      const nearestAngle = Object.keys(counts)
        .map(Number)
        .reduce((prev, curr) => (Math.abs(curr - thetaDeg) < Math.abs(prev - thetaDeg) ? curr : prev));
      if (counts[nearestAngle] !== undefined) counts[nearestAngle]!++;

      // Compute hyperbolic trajectory points for Canvas visualization
      const points: { x: number; y: number }[] = [];
      const thetaRad = (thetaDeg * Math.PI) / 180;

      // Entering straight line from left to near nucleus (x = 0, y = 0)
      const approachX = -250;
      const approachY = sign * (bFm * 2.8);

      points.push({ x: approachX, y: approachY });
      points.push({ x: -40, y: approachY });

      // Curved deflection region near nucleus
      const bendX = 0;
      const bendY = sign * Math.max(12, bFm * 1.5);
      points.push({ x: bendX, y: bendY });

      // Exit trajectory at angle theta
      const exitLen = 260;
      const exitX = bendX + Math.cos(thetaRad * (isBack ? -1 : 1)) * exitLen;
      const exitY = bendY + sign * Math.sin(thetaRad) * exitLen;
      points.push({ x: exitX, y: exitY });

      trajectories.push({
        id: i,
        initialY: approachY,
        energyMev,
        scatteringAngleDeg: Number(thetaDeg.toFixed(1)),
        impactParameterFm: Number(bFm.toFixed(1)),
        points,
        isBackscattered: isBack,
      });
    }

    return {
      targetNucleusZ: targetZ,
      targetName: targetZ === 79 ? 'Gold (Au, Z=79)' : targetZ === 29 ? 'Copper (Cu, Z=29)' : 'Aluminum (Al, Z=13)',
      alphaEnergyMev: energyMev,
      closestApproachFm: Number(r0.toFixed(2)),
      detectedCountsPerAngle: counts,
      trajectories,
    };
  }
}
