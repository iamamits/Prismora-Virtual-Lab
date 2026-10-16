import type { CounterArchitecture, CounterTimingAnalysis, LogicLevel } from './types';

/**
 * 4-Bit Counter Timing & Propagation Engine
 * Models and compares Asynchronous (Ripple) and Synchronous counter topologies,
 * calculating sub-nanosecond stage propagation delays, cumulative skew,
 * and transient decoding glitches (e.g. 7 -> 6 -> 4 -> 0 -> 8 during ripple settlement).
 */
export class CountersEngine {
  private static readonly DEFAULT_FF_DELAY_NS = 10; // 10 ns per 74LS76/74LS74 flip-flop
  private static readonly AND_GATE_DELAY_NS = 5;    // 5 ns for synchronous carry lookahead AND

  /**
   * Evaluate a 4-bit Asynchronous (Ripple) counter step.
   * Calculates ripple cascade delays and transient glitch intermediate states.
   */
  static evaluateAsynchronousStep(
    currentCount: number,
    upNotDown: boolean = true,
    ffDelayNs: number = this.DEFAULT_FF_DELAY_NS,
  ): CounterTimingAnalysis {
    const nextCount = upNotDown
      ? (currentCount + 1) % 16
      : currentCount === 0
      ? 15
      : currentCount - 1;

    // Current bits [Q3, Q2, Q1, Q0]
    const curBits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel] = [
      ((currentCount >> 3) & 1) as LogicLevel,
      ((currentCount >> 2) & 1) as LogicLevel,
      ((currentCount >> 1) & 1) as LogicLevel,
      (currentCount & 1) as LogicLevel,
    ];

    // Next bits [Q3, Q2, Q1, Q0]
    const nextBits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel] = [
      ((nextCount >> 3) & 1) as LogicLevel,
      ((nextCount >> 2) & 1) as LogicLevel,
      ((nextCount >> 1) & 1) as LogicLevel,
      (nextCount & 1) as LogicLevel,
    ];

    // Compute ripple propagation: which bits flip in sequence?
    // Bit 0 flips first at t = 1 * ffDelayNs
    // Bit 1 flips only if Bit 0 transitioned in a way that clocks FF1
    // In an up-counter, Q0 transitioning 1->0 clocks FF1 (positive-edge triggered on Q_bar)
    const stageDelaysNs: number[] = [ffDelayNs, 0, 0, 0];
    const transientStates: number[] = [currentCount];

    let runningBits = [...curBits];
    let numStagesActive = 1;

    // Bit 0 always flips on clock pulse
    runningBits[3] = nextBits[3];
    stageDelaysNs[0] = ffDelayNs;
    let intermediateVal = (runningBits[0]! << 3) | (runningBits[1]! << 2) | (runningBits[2]! << 1) | runningBits[3]!;
    if (intermediateVal !== nextCount) {
      transientStates.push(intermediateVal);
    }

    // Bit 1 toggles if needed
    if (nextBits[2] !== curBits[2]) {
      numStagesActive = 2;
      runningBits[2] = nextBits[2];
      stageDelaysNs[1] = 2 * ffDelayNs;
      intermediateVal = (runningBits[0]! << 3) | (runningBits[1]! << 2) | (runningBits[2]! << 1) | runningBits[3]!;
      if (intermediateVal !== nextCount && !transientStates.includes(intermediateVal)) {
        transientStates.push(intermediateVal);
      }
    }

    // Bit 2 toggles if needed
    if (nextBits[1] !== curBits[1]) {
      numStagesActive = 3;
      runningBits[1] = nextBits[1];
      stageDelaysNs[2] = 3 * ffDelayNs;
      intermediateVal = (runningBits[0]! << 3) | (runningBits[1]! << 2) | (runningBits[2]! << 1) | runningBits[3]!;
      if (intermediateVal !== nextCount && !transientStates.includes(intermediateVal)) {
        transientStates.push(intermediateVal);
      }
    }

    // Bit 3 toggles if needed
    if (nextBits[0] !== curBits[0]) {
      numStagesActive = 4;
      runningBits[0] = nextBits[0];
      stageDelaysNs[3] = 4 * ffDelayNs;
      intermediateVal = (runningBits[0]! << 3) | (runningBits[1]! << 2) | (runningBits[2]! << 1) | runningBits[3]!;
      if (intermediateVal !== nextCount && !transientStates.includes(intermediateVal)) {
        transientStates.push(intermediateVal);
      }
    }

    transientStates.push(nextCount);
    const cumulativeDelayNs = numStagesActive * ffDelayNs;
    const hasGlitch = transientStates.length > 2;

    return {
      count: nextCount,
      binary: nextBits,
      terminalCount: upNotDown ? nextCount === 15 : nextCount === 0,
      stageDelaysNs,
      cumulativeDelayNs,
      transientStates,
      hasGlitch,
    };
  }

  /**
   * Evaluate a 4-bit Synchronous counter step.
   * All flip-flops update in parallel on the same clock edge, eliminating ripple transient spikes.
   */
  static evaluateSynchronousStep(
    currentCount: number,
    upNotDown: boolean = true,
    ffDelayNs: number = this.DEFAULT_FF_DELAY_NS,
  ): CounterTimingAnalysis {
    const nextCount = upNotDown
      ? (currentCount + 1) % 16
      : currentCount === 0
      ? 15
      : currentCount - 1;

    const nextBits: [LogicLevel, LogicLevel, LogicLevel, LogicLevel] = [
      ((nextCount >> 3) & 1) as LogicLevel,
      ((nextCount >> 2) & 1) as LogicLevel,
      ((nextCount >> 1) & 1) as LogicLevel,
      (nextCount & 1) as LogicLevel,
    ];

    // In synchronous design, delay is the single flip-flop propagation delay + carry gating
    const cumulativeDelayNs = ffDelayNs + this.AND_GATE_DELAY_NS;
    const stageDelaysNs = [cumulativeDelayNs, cumulativeDelayNs, cumulativeDelayNs, cumulativeDelayNs];

    return {
      count: nextCount,
      binary: nextBits,
      terminalCount: upNotDown ? nextCount === 15 : nextCount === 0,
      stageDelaysNs,
      cumulativeDelayNs,
      transientStates: [currentCount, nextCount],
      hasGlitch: false, // Synchronous clocking prevents ripple glitches!
    };
  }

  /**
   * Unified counter evaluator by architecture type.
   */
  static evaluate(
    architecture: CounterArchitecture,
    currentCount: number,
    upNotDown: boolean = true,
  ): CounterTimingAnalysis {
    return architecture === 'ASYNCHRONOUS'
      ? this.evaluateAsynchronousStep(currentCount, upNotDown)
      : this.evaluateSynchronousStep(currentCount, upNotDown);
  }

  /**
   * Generate complete 16-cycle comparison between Asynchronous and Synchronous counters.
   */
  static generateComparativeTrace(): Array<{
    step: number;
    async: CounterTimingAnalysis;
    sync: CounterTimingAnalysis;
    skewDifferenceNs: number;
  }> {
    const trace = [];
    let asyncCount = 0;
    let syncCount = 0;

    for (let step = 1; step <= 16; step++) {
      const asyncRes = this.evaluateAsynchronousStep(asyncCount, true);
      const syncRes = this.evaluateSynchronousStep(syncCount, true);
      asyncCount = asyncRes.count;
      syncCount = syncRes.count;

      trace.push({
        step,
        async: asyncRes,
        sync: syncRes,
        skewDifferenceNs: asyncRes.cumulativeDelayNs - syncRes.cumulativeDelayNs,
      });
    }

    return trace;
  }
}
