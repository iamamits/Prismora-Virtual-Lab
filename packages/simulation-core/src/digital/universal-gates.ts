import { GATE_DEFINITIONS } from './gates';
import type {
  GateType,
  LogicLevel,
  SynthesizedTarget,
  UniversalGateNode,
  UniversalGateType,
  UniversalSynthesisResult,
} from './types';

/**
 * Universal Gate Realization Engine
 * Synthesizes standard Boolean gates (NOT, AND, OR, NAND, NOR, XOR, XNOR)
 * exclusively using NAND-only or NOR-only topologies, providing intermediate node traces
 * and analytical equivalence verification.
 */
export class UniversalGatesEngine {
  /**
   * Synthesize and evaluate target gate using purely NAND gates.
   */
  static evaluateNandCircuit(
    target: SynthesizedTarget,
    a: LogicLevel,
    b: LogicLevel = 0,
  ): UniversalSynthesisResult {
    const nand = (x: LogicLevel, y: LogicLevel): LogicLevel => (x === 1 && y === 1 ? 0 : 1);
    const nodes: UniversalGateNode[] = [];
    let out: LogicLevel = 0;
    let desc = '';

    switch (target) {
      case 'NOT': {
        // NOT A = NAND(A, A)
        out = nand(a, a);
        nodes.push({
          id: 'G1',
          label: 'NAND 1 (Inverter)',
          inputs: [a, a],
          output: out,
          expression: "¬(A · A) = ¬A",
        });
        desc = '1 NAND Gate: Inputs tied together to form an inverter.';
        break;
      }

      case 'AND': {
        // G1 = NAND(A, B)
        // G2 = NAND(G1, G1)
        const g1 = nand(a, b);
        out = nand(g1, g1);
        nodes.push(
          {
            id: 'G1',
            label: 'NAND 1 (Pre-Inversion)',
            inputs: [a, b],
            output: g1,
            expression: '¬(A · B)',
          },
          {
            id: 'G2',
            label: 'NAND 2 (Output Inverter)',
            inputs: [g1, g1],
            output: out,
            expression: '¬(G1 · G1) = A · B',
          },
        );
        desc = '2 NAND Gates: G1 computes NAND(A,B), G2 inverts the result to produce AND.';
        break;
      }

      case 'OR': {
        // G1 = NAND(A, A) = ¬A
        // G2 = NAND(B, B) = ¬B
        // G3 = NAND(G1, G2) = ¬(¬A · ¬B) = A + B (De Morgan)
        const g1 = nand(a, a);
        const g2 = nand(b, b);
        out = nand(g1, g2);
        nodes.push(
          {
            id: 'G1',
            label: 'NAND 1 (Invert A)',
            inputs: [a, a],
            output: g1,
            expression: '¬A',
          },
          {
            id: 'G2',
            label: 'NAND 2 (Invert B)',
            inputs: [b, b],
            output: g2,
            expression: '¬B',
          },
          {
            id: 'G3',
            label: 'NAND 3 (De Morgan Merge)',
            inputs: [g1, g2],
            output: out,
            expression: '¬(¬A · ¬B) = A + B',
          },
        );
        desc = '3 NAND Gates: Invert both inputs using G1 and G2, then cross-NAND with G3.';
        break;
      }

      case 'NOR': {
        // OR followed by inverter (4 NANDs)
        const g1 = nand(a, a);
        const g2 = nand(b, b);
        const g3 = nand(g1, g2); // A + B
        out = nand(g3, g3); // ¬(A + B)
        nodes.push(
          { id: 'G1', label: 'NAND 1 (Invert A)', inputs: [a, a], output: g1, expression: '¬A' },
          { id: 'G2', label: 'NAND 2 (Invert B)', inputs: [b, b], output: g2, expression: '¬B' },
          { id: 'G3', label: 'NAND 3 (OR Stage)', inputs: [g1, g2], output: g3, expression: 'A + B' },
          { id: 'G4', label: 'NAND 4 (NOR Inverter)', inputs: [g3, g3], output: out, expression: '¬(A + B)' },
        );
        desc = '4 NAND Gates: Synthesizes OR (3 gates) followed by an inverter stage.';
        break;
      }

      case 'XOR': {
        // 4 NAND Gates (classic minimal)
        // G1 = NAND(A, B)
        // G2 = NAND(A, G1)
        // G3 = NAND(B, G1)
        // G4 = NAND(G2, G3) = A ⊕ B
        const g1 = nand(a, b);
        const g2 = nand(a, g1);
        const g3 = nand(b, g1);
        out = nand(g2, g3);
        nodes.push(
          { id: 'G1', label: 'NAND 1 (Shared Term)', inputs: [a, b], output: g1, expression: '¬(A · B)' },
          { id: 'G2', label: 'NAND 2 (Upper Branch)', inputs: [a, g1], output: g2, expression: '¬(A · G1)' },
          { id: 'G3', label: 'NAND 3 (Lower Branch)', inputs: [b, g1], output: g3, expression: '¬(B · G1)' },
          { id: 'G4', label: 'NAND 4 (Output Stage)', inputs: [g2, g3], output: out, expression: '¬(G2 · G3) = A ⊕ B' },
        );
        desc = '4 NAND Gates: Minimal 4-gate XOR tree utilizing shared term G1 = ¬(A · B).';
        break;
      }

      case 'XNOR': {
        // 5 NAND Gates: XOR (4 gates) followed by inverter (1 gate)
        const g1 = nand(a, b);
        const g2 = nand(a, g1);
        const g3 = nand(b, g1);
        const g4 = nand(g2, g3);
        out = nand(g4, g4);
        nodes.push(
          { id: 'G1', label: 'NAND 1', inputs: [a, b], output: g1, expression: '¬(A · B)' },
          { id: 'G2', label: 'NAND 2', inputs: [a, g1], output: g2, expression: '¬(A · G1)' },
          { id: 'G3', label: 'NAND 3', inputs: [b, g1], output: g3, expression: '¬(B · G1)' },
          { id: 'G4', label: 'NAND 4 (XOR Stage)', inputs: [g2, g3], output: g4, expression: 'A ⊕ B' },
          { id: 'G5', label: 'NAND 5 (Equivalence Inverter)', inputs: [g4, g4], output: out, expression: '¬(A ⊕ B)' },
        );
        desc = '5 NAND Gates: 4-gate XOR core followed by output inverter stage.';
        break;
      }

      default:
        out = nand(a, b);
        nodes.push({ id: 'G1', label: 'NAND 1', inputs: [a, b], output: out, expression: '¬(A · B)' });
        desc = '1 NAND Gate (Identity)';
    }

    const expected = GATE_DEFINITIONS[target as GateType]?.evaluate(target === 'NOT' ? [a] : [a, b]) ?? out;
    const isEquivalent = out === expected;

    return {
      target,
      universalType: 'NAND',
      gateCount: nodes.length,
      inputValues: { A: a, ...(target !== 'NOT' ? { B: b } : {}) },
      nodes,
      output: out,
      isEquivalent,
      schematicDescription: desc,
    };
  }

  /**
   * Synthesize and evaluate target gate using purely NOR gates.
   */
  static evaluateNorCircuit(
    target: SynthesizedTarget,
    a: LogicLevel,
    b: LogicLevel = 0,
  ): UniversalSynthesisResult {
    const nor = (x: LogicLevel, y: LogicLevel): LogicLevel => (x === 0 && y === 0 ? 1 : 0);
    const nodes: UniversalGateNode[] = [];
    let out: LogicLevel = 0;
    let desc = '';

    switch (target) {
      case 'NOT': {
        // NOT A = NOR(A, A)
        out = nor(a, a);
        nodes.push({
          id: 'G1',
          label: 'NOR 1 (Inverter)',
          inputs: [a, a],
          output: out,
          expression: '¬(A + A) = ¬A',
        });
        desc = '1 NOR Gate: Inputs tied together to form an inverter.';
        break;
      }

      case 'OR': {
        // G1 = NOR(A, B)
        // G2 = NOR(G1, G1)
        const g1 = nor(a, b);
        out = nor(g1, g1);
        nodes.push(
          { id: 'G1', label: 'NOR 1 (Pre-Inversion)', inputs: [a, b], output: g1, expression: '¬(A + B)' },
          { id: 'G2', label: 'NOR 2 (Output Inverter)', inputs: [g1, g1], output: out, expression: '¬(G1 + G1) = A + B' },
        );
        desc = '2 NOR Gates: G1 computes NOR(A,B), G2 inverts the result to produce OR.';
        break;
      }

      case 'AND': {
        // G1 = NOR(A, A) = ¬A
        // G2 = NOR(B, B) = ¬B
        // G3 = NOR(G1, G2) = ¬(¬A + ¬B) = A · B (De Morgan)
        const g1 = nor(a, a);
        const g2 = nor(b, b);
        out = nor(g1, g2);
        nodes.push(
          { id: 'G1', label: 'NOR 1 (Invert A)', inputs: [a, a], output: g1, expression: '¬A' },
          { id: 'G2', label: 'NOR 2 (Invert B)', inputs: [b, b], output: g2, expression: '¬B' },
          { id: 'G3', label: 'NOR 3 (De Morgan Merge)', inputs: [g1, g2], output: out, expression: '¬(¬A + ¬B) = A · B' },
        );
        desc = '3 NOR Gates: Invert both inputs using G1 and G2, then cross-NOR with G3.';
        break;
      }

      case 'NAND': {
        // AND followed by inverter (4 NORs)
        const g1 = nor(a, a);
        const g2 = nor(b, b);
        const g3 = nor(g1, g2); // A · B
        out = nor(g3, g3); // ¬(A · B)
        nodes.push(
          { id: 'G1', label: 'NOR 1 (Invert A)', inputs: [a, a], output: g1, expression: '¬A' },
          { id: 'G2', label: 'NOR 2 (Invert B)', inputs: [b, b], output: g2, expression: '¬B' },
          { id: 'G3', label: 'NOR 3 (AND Stage)', inputs: [g1, g2], output: g3, expression: 'A · B' },
          { id: 'G4', label: 'NOR 4 (NAND Inverter)', inputs: [g3, g3], output: out, expression: '¬(A · B)' },
        );
        desc = '4 NOR Gates: Synthesizes AND (3 gates) followed by an inverter stage.';
        break;
      }

      case 'XNOR': {
        // 4 NOR Gates (classic minimal)
        // G1 = NOR(A, B)
        // G2 = NOR(A, G1)
        // G3 = NOR(B, G1)
        // G4 = NOR(G2, G3) = ¬(A ⊕ B)
        const g1 = nor(a, b);
        const g2 = nor(a, g1);
        const g3 = nor(b, g1);
        out = nor(g2, g3);
        nodes.push(
          { id: 'G1', label: 'NOR 1 (Shared Term)', inputs: [a, b], output: g1, expression: '¬(A + B)' },
          { id: 'G2', label: 'NOR 2 (Upper Branch)', inputs: [a, g1], output: g2, expression: '¬(A + G1)' },
          { id: 'G3', label: 'NOR 3 (Lower Branch)', inputs: [b, g1], output: g3, expression: '¬(B + G1)' },
          { id: 'G4', label: 'NOR 4 (Output Stage)', inputs: [g2, g3], output: out, expression: '¬(G2 + G3) = ¬(A ⊕ B)' },
        );
        desc = '4 NOR Gates: Minimal 4-gate XNOR tree utilizing shared term G1 = ¬(A + B).';
        break;
      }

      case 'XOR': {
        // 5 NOR Gates: XNOR (4 gates) followed by inverter (1 gate)
        const g1 = nor(a, b);
        const g2 = nor(a, g1);
        const g3 = nor(b, g1);
        const g4 = nor(g2, g3);
        out = nor(g4, g4);
        nodes.push(
          { id: 'G1', label: 'NOR 1', inputs: [a, b], output: g1, expression: '¬(A + B)' },
          { id: 'G2', label: 'NOR 2', inputs: [a, g1], output: g2, expression: '¬(A + G1)' },
          { id: 'G3', label: 'NOR 3', inputs: [b, g1], output: g3, expression: '¬(B + G1)' },
          { id: 'G4', label: 'NOR 4 (XNOR Stage)', inputs: [g2, g3], output: g4, expression: '¬(A ⊕ B)' },
          { id: 'G5', label: 'NOR 5 (Inverter Stage)', inputs: [g4, g4], output: out, expression: 'A ⊕ B' },
        );
        desc = '5 NOR Gates: 4-gate XNOR core followed by output inverter stage.';
        break;
      }

      default:
        out = nor(a, b);
        nodes.push({ id: 'G1', label: 'NOR 1', inputs: [a, b], output: out, expression: '¬(A + B)' });
        desc = '1 NOR Gate (Identity)';
    }

    const expected = GATE_DEFINITIONS[target as GateType]?.evaluate(target === 'NOT' ? [a] : [a, b]) ?? out;
    const isEquivalent = out === expected;

    return {
      target,
      universalType: 'NOR',
      gateCount: nodes.length,
      inputValues: { A: a, ...(target !== 'NOT' ? { B: b } : {}) },
      nodes,
      output: out,
      isEquivalent,
      schematicDescription: desc,
    };
  }

  /**
   * Unified evaluator for any universal gate topology.
   */
  static evaluate(
    target: SynthesizedTarget,
    universalType: UniversalGateType,
    a: LogicLevel,
    b: LogicLevel = 0,
  ): UniversalSynthesisResult {
    return universalType === 'NAND'
      ? this.evaluateNandCircuit(target, a, b)
      : this.evaluateNorCircuit(target, a, b);
  }

  /**
   * Exhaustive verification of equivalence across all 2^n input states.
   */
  static verifyEquivalence(
    target: SynthesizedTarget,
    universalType: UniversalGateType,
  ): {
    isEquivalent: boolean;
    truthTable: Array<{
      a: LogicLevel;
      b: LogicLevel;
      expected: LogicLevel;
      actual: LogicLevel;
      match: boolean;
    }>;
  } {
    const isUnary = target === 'NOT';
    const combinations: Array<[LogicLevel, LogicLevel]> = isUnary
      ? [
          [0, 0],
          [1, 0],
        ]
      : [
          [0, 0],
          [0, 1],
          [1, 0],
          [1, 1],
        ];

    let allMatch = true;
    const truthTable = combinations.map(([a, b]) => {
      const res = this.evaluate(target, universalType, a, b);
      const expected = GATE_DEFINITIONS[target as GateType]?.evaluate(isUnary ? [a] : [a, b]) ?? res.output;
      const match = res.output === expected;
      if (!match) allMatch = false;
      return { a, b, expected, actual: res.output, match };
    });

    return { isEquivalent: allMatch, truthTable };
  }
}
