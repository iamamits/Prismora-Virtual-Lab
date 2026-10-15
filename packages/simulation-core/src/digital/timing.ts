import type { LogicLevel, TimingSignal } from './types';

export interface GlitchSimulationResult {
  signals: TimingSignal[];
  hazardDetected: boolean;
  hazardTime?: number;
  hazardDescription: string;
}

/**
 * Timing Diagram and Propagation Delay / Glitch Simulation Engine.
 */
export class TimingEngine {
  /**
   * Generates a multi-period clock signal.
   */
  static generateClockSignal(
    periodNs: number = 20,
    totalCycles: number = 8,
    name: string = 'CLK',
  ): TimingSignal {
    const points = [];
    const half = periodNs / 2;

    for (let cycle = 0; cycle < totalCycles; cycle++) {
      const tStart = cycle * periodNs;
      points.push({ time: tStart, value: 1 as LogicLevel });
      points.push({ time: tStart + half, value: 0 as LogicLevel });
    }
    points.push({ time: totalCycles * periodNs, value: 1 as LogicLevel });

    return {
      name,
      color: '#06B6D4', // Cyan
      points,
    };
  }

  /**
   * Models a classic Static 1-Hazard (Glitch) in circuit: F = (A · B) + (A' · C)
   * When B=1, C=1 and input A transitions from 1 to 0:
   * Due to the inverter delay on A', both product terms may momentarily output 0,
   * producing a momentary 0 glitch on F (which ideally should remain 1).
   */
  static simulateStaticOneHazard(inverterDelayNs: number = 3): GlitchSimulationResult {
    // Timeline 0 to 40 ns. A transitions from 1 -> 0 at t = 10 ns
    const timeStep = 0.5;
    const totalTime = 30;

    const sigA: { time: number; value: LogicLevel }[] = [];
    const sigNotA: { time: number; value: LogicLevel }[] = [];
    const sigP1: { time: number; value: LogicLevel }[] = []; // A AND B (B=1)
    const sigP2: { time: number; value: LogicLevel }[] = []; // (NOT A) AND C (C=1)
    const sigF: { time: number; value: LogicLevel }[] = []; // P1 OR P2

    let hazardDetected = false;
    let hazardTime: number | undefined;

    for (let t = 0; t <= totalTime; t += timeStep) {
      // A transitions from 1 to 0 at t = 10
      const aVal: LogicLevel = t < 10 ? 1 : 0;
      // Inverter output responds after inverterDelayNs
      const notAVal: LogicLevel = t < 10 + inverterDelayNs ? 0 : 1;

      // P1 = A & B (with 1ns gate delay)
      const p1Val: LogicLevel = t < 11 ? 1 : 0;
      // P2 = (NOT A) & C (with 1ns gate delay)
      const p2Val: LogicLevel = t < 11 + inverterDelayNs ? 0 : 1;

      // F = P1 | P2 (with 1ns gate delay)
      const fVal: LogicLevel = p1Val === 1 || p2Val === 1 ? 1 : 0;

      sigA.push({ time: t, value: aVal });
      sigNotA.push({ time: t, value: notAVal });
      sigP1.push({ time: t, value: p1Val });
      sigP2.push({ time: t, value: p2Val });
      sigF.push({ time: t, value: fVal });

      if (t >= 11 && t < 11 + inverterDelayNs && fVal === 0) {
        hazardDetected = true;
        if (hazardTime === undefined) hazardTime = t;
      }
    }

    return {
      signals: [
        { name: 'Input A', color: '#2563EB', points: sigA },
        { name: "A' (Delayed)", color: '#8B5CF6', points: sigNotA },
        { name: 'P1 (A·B)', color: '#FBBF24', points: sigP1 },
        { name: "P2 (A'·C)", color: '#22C55E', points: sigP2 },
        { name: 'Output F (P1+P2)', color: '#F43F5E', points: sigF },
      ],
      hazardDetected,
      hazardTime,
      hazardDescription:
        'Static 1-Hazard detected! When A transitions 1 → 0, P1 turns OFF before P2 turns ON due to inverter propagation delay τ_inv = ' +
        inverterDelayNs +
        'ns, causing a momentary spurious 0 glitch in the output.',
    };
  }
}
