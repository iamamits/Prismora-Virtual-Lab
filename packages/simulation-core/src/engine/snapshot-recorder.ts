import type { SimulationState } from '../types/simulation';

/**
 * Records simulation state snapshots for replay and analysis.
 * Maintains a bounded circular buffer to prevent unbounded memory growth.
 */
export class SnapshotRecorder<TState extends SimulationState> {
  private _snapshots: TState[] = [];
  private readonly _maxSnapshots: number;

  constructor(maxSnapshots: number = 10000) {
    this._maxSnapshots = maxSnapshots;
  }

  record(state: TState): void {
    if (this._snapshots.length >= this._maxSnapshots) {
      // Remove oldest snapshots (keep every other one to maintain coverage)
      this._snapshots = this._snapshots.filter((_, i) => i % 2 === 0);
    }
    this._snapshots.push(state);
  }

  getSnapshots(): readonly TState[] {
    return this._snapshots;
  }

  getSnapshotAtTime(time: number): TState | null {
    if (this._snapshots.length === 0) return null;

    // Binary search for closest snapshot
    let low = 0;
    let high = this._snapshots.length - 1;

    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      const snapshot = this._snapshots[mid];
      if (snapshot && snapshot.time < time) {
        low = mid + 1;
      } else {
        high = mid;
      }
    }

    return this._snapshots[low] ?? null;
  }

  get length(): number {
    return this._snapshots.length;
  }

  clear(): void {
    this._snapshots = [];
  }
}
