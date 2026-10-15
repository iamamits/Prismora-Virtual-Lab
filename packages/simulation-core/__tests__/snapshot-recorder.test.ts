import { describe, it, expect } from 'vitest';
import { SnapshotRecorder } from '../src/engine/snapshot-recorder';
import type { ProjectileMotionState } from '../src/types/state';

function makeState(time: number): ProjectileMotionState {
  return {
    time,
    position: { x: time * 10, y: time * 5 },
    velocity: { x: 10, y: 5 - 9.81 * time },
    acceleration: { x: 0, y: -9.81 },
    terminated: false,
    speed: 0,
    kineticEnergyPerMass: 0,
    potentialEnergyPerMass: 0,
  };
}

describe('SnapshotRecorder', () => {
  it('should record snapshots', () => {
    const recorder = new SnapshotRecorder();
    recorder.record(makeState(0));
    recorder.record(makeState(0.1));
    expect(recorder.length).toBe(2);
  });

  it('should clear snapshots', () => {
    const recorder = new SnapshotRecorder();
    recorder.record(makeState(0));
    recorder.clear();
    expect(recorder.length).toBe(0);
  });

  it('should respect max snapshots limit', () => {
    const recorder = new SnapshotRecorder(10);
    for (let i = 0; i < 20; i++) {
      recorder.record(makeState(i * 0.1));
    }
    expect(recorder.length).toBeLessThanOrEqual(15);
  });

  it('should find snapshot at time', () => {
    const recorder = new SnapshotRecorder();
    recorder.record(makeState(0));
    recorder.record(makeState(1));
    recorder.record(makeState(2));

    const snapshot = recorder.getSnapshotAtTime(1);
    expect(snapshot).not.toBeNull();
    expect(snapshot!.time).toBe(1);
  });

  it('should return null for empty recorder', () => {
    const recorder = new SnapshotRecorder();
    expect(recorder.getSnapshotAtTime(0)).toBeNull();
  });
});
