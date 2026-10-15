import { describe, it, expect } from 'vitest';
import {
  evaluateDCCircuit,
  DCCircuitGraph,
  computeDiodeIVCurve,
  simulateRectifier,
  DEFAULT_SILICON_DIODE,
} from '../src/ece';

describe('DC Network Evaluator (MNA)', () => {
  it('should accurately calculate Ohm\'s law V = I * R for a single resistor circuit', () => {
    // 12V Battery -> Resistor (6 Ohm) -> Ground
    const circuit: DCCircuitGraph = {
      groundNodeId: 'gnd',
      components: [
        {
          id: 'v1',
          name: 'DC Source',
          type: 'dc-voltage-source',
          nodeA: 'n1',
          nodeB: 'gnd',
          value: 12,
        },
        {
          id: 'r1',
          name: 'Resistor',
          type: 'resistor',
          nodeA: 'n1',
          nodeB: 'gnd',
          value: 6,
        },
      ],
    };

    const res = evaluateDCCircuit(circuit);
    expect(res.nodeVoltages['n1']).toBeCloseTo(12.0, 5);
    expect(res.nodeVoltages['gnd']).toBeCloseTo(0.0, 5);

    const rEval = res.componentEvaluations['r1']!;
    expect(rEval.voltageDrop).toBeCloseTo(12.0, 5);
    expect(rEval.current).toBeCloseTo(2.0, 5); // 12V / 6ohm = 2A
    expect(rEval.power).toBeCloseTo(24.0, 5); // 12V * 2A = 24W
    expect(rEval.status).toBe('ACTIVE');
  });

  it('should compute series resistor voltage divider correctly', () => {
    // 10V Battery -> R1 (3 Ohm) -> R2 (2 Ohm) -> Ground
    // Total R = 5 Ohm. Current = 2A.
    // Node 1 = 10V, Node 2 = 10 - 2*3 = 4V
    const circuit: DCCircuitGraph = {
      groundNodeId: 'gnd',
      components: [
        {
          id: 'v1',
          name: '10V Supply',
          type: 'dc-voltage-source',
          nodeA: 'n1',
          nodeB: 'gnd',
          value: 10,
        },
        {
          id: 'r1',
          name: 'R1',
          type: 'resistor',
          nodeA: 'n1',
          nodeB: 'n2',
          value: 3,
        },
        {
          id: 'r2',
          name: 'R2',
          type: 'resistor',
          nodeA: 'n2',
          nodeB: 'gnd',
          value: 2,
        },
      ],
    };

    const res = evaluateDCCircuit(circuit);
    expect(res.nodeVoltages['n1']).toBeCloseTo(10.0, 4);
    expect(res.nodeVoltages['n2']).toBeCloseTo(4.0, 4); // 10V * (2 / (3 + 2)) = 4V
    expect(res.componentEvaluations['r1']!.current).toBeCloseTo(2.0, 4);
    expect(res.componentEvaluations['r2']!.current).toBeCloseTo(2.0, 4);
  });

  it('should handle knife switch open and closed states', () => {
    // 12V Supply -> Switch -> Bulb (24 Ohm) -> Ground
    const circuitClosed: DCCircuitGraph = {
      groundNodeId: 'gnd',
      components: [
        {
          id: 'v1',
          name: '12V Supply',
          type: 'dc-voltage-source',
          nodeA: 'n1',
          nodeB: 'gnd',
          value: 12,
        },
        {
          id: 'sw1',
          name: 'Main Switch',
          type: 'toggle-switch',
          nodeA: 'n1',
          nodeB: 'n2',
          value: 0,
          state: 'CLOSED',
        },
        {
          id: 'b1',
          name: 'Incandescent Bulb',
          type: 'light-bulb',
          nodeA: 'n2',
          nodeB: 'gnd',
          value: 24,
          ratedPower: 6,
        },
      ],
    };

    const resClosed = evaluateDCCircuit(circuitClosed);
    expect(resClosed.nodeVoltages['n2']).toBeCloseTo(12.0, 2);
    const bulbClosed = resClosed.componentEvaluations['b1']!;
    expect(bulbClosed.current).toBeCloseTo(0.5, 2); // 12V / 24 = 0.5A
    expect(bulbClosed.power).toBeCloseTo(6.0, 2); // 0.5A * 12V = 6W (100% rated)
    expect(bulbClosed.filamentBrightness).toBeCloseTo(1.0, 1);
    expect(bulbClosed.lumens).toBeGreaterThan(0);

    // Now switch is OPEN:
    const circuitOpen: DCCircuitGraph = {
      groundNodeId: 'gnd',
      components: [
        {
          id: 'v1',
          name: '12V Supply',
          type: 'dc-voltage-source',
          nodeA: 'n1',
          nodeB: 'gnd',
          value: 12,
        },
        {
          id: 'sw1',
          name: 'Main Switch',
          type: 'toggle-switch',
          nodeA: 'n1',
          nodeB: 'n2',
          value: 0,
          state: 'OPEN',
        },
        {
          id: 'b1',
          name: 'Incandescent Bulb',
          type: 'light-bulb',
          nodeA: 'n2',
          nodeB: 'gnd',
          value: 24,
          ratedPower: 6,
        },
      ],
    };

    const resOpen = evaluateDCCircuit(circuitOpen);
    expect(resOpen.nodeVoltages['n2']).toBeCloseTo(0.0, 2);
    const bulbOpen = resOpen.componentEvaluations['b1']!;
    expect(bulbOpen.current).toBeCloseTo(0.0, 4);
    expect(bulbOpen.power).toBeCloseTo(0.0, 4);
    expect(bulbOpen.status).toBe('OFF');
  });

  it('should detect short circuit condition when voltage source terminals are bridged', () => {
    const circuit: DCCircuitGraph = {
      groundNodeId: 'gnd',
      components: [
        {
          id: 'v1',
          name: 'DC Source',
          type: 'dc-voltage-source',
          nodeA: 'gnd',
          nodeB: 'gnd',
          value: 5,
        },
      ],
    };

    const res = evaluateDCCircuit(circuit);
    expect(res.isShortCircuit).toBe(true);
    expect(res.diagnostics.length).toBeGreaterThan(0);
  });
});

describe('PN-Junction Diode & Rectifier Evaluator', () => {
  it('should generate exponential Shockley I-V curve for Silicon diode', () => {
    const curve = computeDiodeIVCurve(DEFAULT_SILICON_DIODE, -1.0, 0.8, 40);
    expect(curve.length).toBe(41);

    // In reverse bias (e.g. -1V), current should be negligible (~1e-12A or ~0mA)
    const reversePoint = curve.find((p) => p.voltage === -1.0)!;
    expect(reversePoint.currentMA).toBeCloseTo(0.0, 3);

    // Near knee voltage ~0.7V, current should rise rapidly
    const kneePoint = curve.find((p) => p.voltage >= 0.7)!;
    expect(kneePoint.current).toBeGreaterThan(1e-3); // > 1mA
  });

  it('should simulate Half-Wave Rectifier and calculate peak, average DC, and ripple', () => {
    const result = simulateRectifier({
      topology: 'half-wave',
      inputPeakVoltage: 10,
      inputFrequency: 50,
      loadResistance: 1000,
      filterCapacitance: 0, // Unfiltered
      diodeForwardDrop: 0.7,
    });

    expect(result.peakOutputVoltage).toBeCloseTo(9.3, 1); // 10V - 0.7V = 9.3V
    // Theoretical unfiltered half-wave DC voltage: V_m / pi = 9.3 / 3.14159 = 2.96V
    expect(result.averageDCVoltage).toBeCloseTo(2.96, 0.5);
    // Theoretical unfiltered half-wave ripple factor: ~1.21
    expect(result.rippleFactor).toBeGreaterThan(1.0);
    expect(result.samples.length).toBeGreaterThan(50);
  });

  it('should simulate Full-Wave Bridge Rectifier with lower ripple and capacitor filtering', () => {
    const resultFiltered = simulateRectifier({
      topology: 'full-wave-bridge',
      inputPeakVoltage: 10,
      inputFrequency: 50,
      loadResistance: 1000,
      filterCapacitance: 100e-6, // 100uF smoothing capacitor
      diodeForwardDrop: 0.7,
    });

    // 2 diode drops for bridge: 10V - 1.4V = 8.6V peak
    expect(resultFiltered.peakOutputVoltage).toBeCloseTo(8.6, 1);
    // With 100uF capacitor filter, DC average should be significantly higher and ripple much lower
    expect(resultFiltered.averageDCVoltage).toBeGreaterThan(7.0);
    expect(resultFiltered.rippleFactor).toBeLessThan(0.3); // Far lower than unfiltered 0.48
    expect(resultFiltered.rectificationEfficiency).toBeGreaterThan(80);
  });
});
