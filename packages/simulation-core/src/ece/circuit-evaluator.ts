/**
 * Prismora ECE Virtual Lab — Topological Circuit Evaluator
 * Evaluates combinational logic circuits with cycle detection, multi-driver conflict handling,
 * and floating input diagnostics.
 */

import {
  CircuitComponent,
  CircuitEvaluationResult,
  CircuitGraph,
  CircuitWire,
  LogicSignalState,
} from './types';

export class CircuitEvaluator {
  /**
   * Evaluate a complete circuit graph deterministically.
   */
  static evaluate(graph: CircuitGraph): CircuitEvaluationResult {
    const terminalSignals: Record<string, LogicSignalState> = {};
    const wireSignals: Record<string, LogicSignalState> = {};
    const componentOutputs: Record<string, Record<string, LogicSignalState>> = {};
    const floatingInputs: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    const compMap = new Map<string, CircuitComponent>();
    for (const comp of graph.components) {
      compMap.set(comp.id, comp);
      componentOutputs[comp.id] = {};
    }

    // Map incoming wires for each input terminal
    const incomingWiresByTerminal = new Map<string, CircuitWire[]>();
    for (const comp of graph.components) {
      for (const input of comp.inputs) {
        incomingWiresByTerminal.set(input.id, []);
      }
    }

    for (const wire of graph.wires) {
      const list = incomingWiresByTerminal.get(wire.to.terminalId);
      if (list) {
        list.push(wire);
      }
    }

    // Detect floating inputs
    for (const comp of graph.components) {
      for (const input of comp.inputs) {
        const incoming = incomingWiresByTerminal.get(input.id) ?? [];
        if (incoming.length === 0) {
          floatingInputs.push(input.id);
          terminalSignals[input.id] = 'FLOATING';
          warnings.push(`Component "${comp.label}" input "${input.name}" is floating (unconnected).`);
        }
      }
    }

    // Build component dependency graph for topological sorting & cycle detection
    // Edge compA -> compB if compA output drives compB input
    const adjacency = new Map<string, Set<string>>();
    const inDegree = new Map<string, number>();

    for (const comp of graph.components) {
      adjacency.set(comp.id, new Set());
      inDegree.set(comp.id, 0);
    }

    for (const wire of graph.wires) {
      const fromCompId = wire.from.componentId;
      const toCompId = wire.to.componentId;

      if (fromCompId && toCompId && fromCompId !== toCompId) {
        const targets = adjacency.get(fromCompId);
        if (targets && !targets.has(toCompId)) {
          targets.add(toCompId);
        }
      }
    }

    // Calculate in-degree from unique directed edges
    for (const [, targets] of adjacency.entries()) {
      for (const target of targets) {
        inDegree.set(target, (inDegree.get(target) ?? 0) + 1);
      }
    }

    // Kahn's algorithm for topological ordering
    const queue: string[] = [];
    for (const [compId, deg] of inDegree.entries()) {
      if (deg === 0) {
        queue.push(compId);
      }
    }

    const topoOrder: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      topoOrder.push(current);

      const neighbors = adjacency.get(current);
      if (neighbors) {
        for (const neighbor of neighbors) {
          const newDeg = (inDegree.get(neighbor) ?? 1) - 1;
          inDegree.set(neighbor, newDeg);
          if (newDeg === 0) {
            queue.push(neighbor);
          }
        }
      }
    }

    const hasCycle = topoOrder.length < graph.components.length;
    const cycleComponents: string[] = [];

    if (hasCycle) {
      for (const [compId, deg] of inDegree.entries()) {
        if (deg > 0) {
          cycleComponents.push(compId);
        }
      }
      errors.push('Feedback loop (cycle) detected in combinational logic circuit.');
    }

    // Evaluation order: evaluate components in topological order
    // For components in a cycle (if any), append them at the end with safe fallback
    const evalOrder = [...topoOrder];
    for (const comp of graph.components) {
      if (!evalOrder.includes(comp.id)) {
        evalOrder.push(comp.id);
      }
    }

    for (const compId of evalOrder) {
      const comp = compMap.get(compId);
      if (!comp) continue;

      // 1. Gather inputs
      const inputValues: Record<string, LogicSignalState> = {};
      for (const input of comp.inputs) {
        const incoming = incomingWiresByTerminal.get(input.id) ?? [];
        if (incoming.length === 0) {
          inputValues[input.id] = 'FLOATING';
          terminalSignals[input.id] = 'FLOATING';
        } else if (incoming.length === 1) {
          const sourceWire = incoming[0]!;
          const sourceSignal = terminalSignals[sourceWire.from.terminalId] ?? 'FLOATING';
          inputValues[input.id] = sourceSignal;
          terminalSignals[input.id] = sourceSignal;
          wireSignals[sourceWire.id] = sourceSignal;
        } else {
          // Multiple drivers on same terminal: check for bus conflict
          let resolvedSignal: LogicSignalState | null = null;
          let hasConflict = false;

          for (const wire of incoming) {
            const sig = terminalSignals[wire.from.terminalId] ?? 'FLOATING';
            wireSignals[wire.id] = sig;

            if (sig !== 'FLOATING') {
              if (resolvedSignal === null) {
                resolvedSignal = sig;
              } else if (resolvedSignal !== sig) {
                hasConflict = true;
              }
            }
          }

          if (hasConflict) {
            resolvedSignal = 'INVALID';
            errors.push(`Contention / Bus conflict on "${comp.label}" input "${input.name}".`);
          }

          const finalSig = resolvedSignal ?? 'FLOATING';
          inputValues[input.id] = finalSig;
          terminalSignals[input.id] = finalSig;
        }
      }

      // 2. Compute component outputs
      const outputs = this.evaluateComponent(comp, inputValues);
      componentOutputs[comp.id] = outputs;

      for (const outputTerm of comp.outputs) {
        const sig = outputs[outputTerm.id] ?? 'FLOATING';
        terminalSignals[outputTerm.id] = sig;
      }
    }

    // Ensure all wires have an assigned signal state
    for (const wire of graph.wires) {
      if (wireSignals[wire.id] === undefined) {
        wireSignals[wire.id] = terminalSignals[wire.from.terminalId] ?? 'FLOATING';
      }
    }

    const isValid = errors.length === 0;

    return {
      terminalSignals,
      wireSignals,
      componentOutputs,
      floatingInputs,
      hasCycle,
      cycleComponents,
      isValid,
      errors,
      warnings,
    };
  }

  /**
   * Evaluate a single component's outputs given resolved inputs.
   */
  private static evaluateComponent(
    comp: CircuitComponent,
    inputs: Record<string, LogicSignalState>,
  ): Record<string, LogicSignalState> {
    const outputs: Record<string, LogicSignalState> = {};

    switch (comp.type) {
      case 'INPUT_SWITCH': {
        const val: LogicSignalState = comp.state?.switchState === 1 ? 1 : 0;
        for (const out of comp.outputs) {
          outputs[out.id] = val;
        }
        break;
      }

      case 'VCC': {
        for (const out of comp.outputs) {
          outputs[out.id] = 1;
        }
        break;
      }

      case 'GND': {
        for (const out of comp.outputs) {
          outputs[out.id] = 0;
        }
        break;
      }

      case 'CLOCK': {
        const val: LogicSignalState = comp.state?.clockState === 1 ? 1 : 0;
        for (const out of comp.outputs) {
          outputs[out.id] = val;
        }
        break;
      }

      case 'AND': {
        const inVals = comp.inputs.map((inp) => inputs[inp.id] ?? 'FLOATING');
        outputs[comp.outputs[0]?.id ?? 'out'] = this.evalAnd(inVals);
        break;
      }

      case 'OR': {
        const inVals = comp.inputs.map((inp) => inputs[inp.id] ?? 'FLOATING');
        outputs[comp.outputs[0]?.id ?? 'out'] = this.evalOr(inVals);
        break;
      }

      case 'NOT': {
        const inVal = inputs[comp.inputs[0]?.id ?? ''] ?? 'FLOATING';
        outputs[comp.outputs[0]?.id ?? 'out'] = this.evalNot(inVal);
        break;
      }

      case 'XOR': {
        const inVals = comp.inputs.map((inp) => inputs[inp.id] ?? 'FLOATING');
        outputs[comp.outputs[0]?.id ?? 'out'] = this.evalXor(inVals);
        break;
      }

      case 'NAND': {
        const inVals = comp.inputs.map((inp) => inputs[inp.id] ?? 'FLOATING');
        outputs[comp.outputs[0]?.id ?? 'out'] = this.evalNot(this.evalAnd(inVals));
        break;
      }

      case 'NOR': {
        const inVals = comp.inputs.map((inp) => inputs[inp.id] ?? 'FLOATING');
        outputs[comp.outputs[0]?.id ?? 'out'] = this.evalNot(this.evalOr(inVals));
        break;
      }

      case 'XNOR': {
        const inVals = comp.inputs.map((inp) => inputs[inp.id] ?? 'FLOATING');
        outputs[comp.outputs[0]?.id ?? 'out'] = this.evalNot(this.evalXor(inVals));
        break;
      }

      case 'BUFFER': {
        const inVal = inputs[comp.inputs[0]?.id ?? ''] ?? 'FLOATING';
        outputs[comp.outputs[0]?.id ?? 'out'] = inVal;
        break;
      }

      case 'OUTPUT_LED': {
        const inVal = inputs[comp.inputs[0]?.id ?? ''] ?? 'FLOATING';
        outputs['state'] = inVal;
        break;
      }

      case 'LOGIC_PROBE': {
        const inVal = inputs[comp.inputs[0]?.id ?? ''] ?? 'FLOATING';
        outputs['state'] = inVal;
        break;
      }

      default:
        for (const out of comp.outputs) {
          outputs[out.id] = 'FLOATING';
        }
    }

    return outputs;
  }

  private static evalAnd(inputs: LogicSignalState[]): LogicSignalState {
    if (inputs.some((x) => x === 'INVALID')) return 'INVALID';
    if (inputs.some((x) => x === 0)) return 0;
    if (inputs.some((x) => x === 'FLOATING')) return 'FLOATING';
    return inputs.every((x) => x === 1) ? 1 : 0;
  }

  private static evalOr(inputs: LogicSignalState[]): LogicSignalState {
    if (inputs.some((x) => x === 'INVALID')) return 'INVALID';
    if (inputs.some((x) => x === 1)) return 1;
    if (inputs.some((x) => x === 'FLOATING')) return 'FLOATING';
    return inputs.every((x) => x === 0) ? 0 : 1;
  }

  private static evalNot(input: LogicSignalState): LogicSignalState {
    if (input === 'INVALID') return 'INVALID';
    if (input === 'FLOATING') return 'FLOATING';
    return input === 1 ? 0 : 1;
  }

  private static evalXor(inputs: LogicSignalState[]): LogicSignalState {
    if (inputs.some((x) => x === 'INVALID')) return 'INVALID';
    if (inputs.some((x) => x === 'FLOATING')) return 'FLOATING';
    let onesCount = 0;
    for (const val of inputs) {
      if (val === 1) onesCount++;
    }
    return onesCount % 2 === 1 ? 1 : 0;
  }
}
