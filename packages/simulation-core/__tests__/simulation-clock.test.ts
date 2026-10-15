import { describe, it, expect } from 'vitest';
import { SimulationClock } from '../src/engine/simulation-clock';

describe('SimulationClock', () => {
  it('should start at time 0', () => {
    const clock = new SimulationClock();
    expect(clock.currentTime).toBe(0);
    expect(clock.status).toBe('stopped');
  });

  it('should advance by one timestep on step()', () => {
    const clock = new SimulationClock({ timeStep: 0.01 });
    clock.step();
    expect(clock.currentTime).toBeCloseTo(0.01, 10);
  });

  it('should advance multiple steps', () => {
    const clock = new SimulationClock({ timeStep: 0.01 });
    for (let i = 0; i < 100; i++) clock.step();
    expect(clock.currentTime).toBeCloseTo(1.0, 6);
  });

  it('should not exceed maxTime', () => {
    const clock = new SimulationClock({ timeStep: 1, maxTime: 5 });
    for (let i = 0; i < 10; i++) clock.step();
    expect(clock.currentTime).toBe(5);
  });

  it('should reset to 0', () => {
    const clock = new SimulationClock();
    clock.step();
    clock.step();
    clock.reset();
    expect(clock.currentTime).toBe(0);
    expect(clock.status).toBe('stopped');
  });

  it('should transition between play/pause/stop states', () => {
    const clock = new SimulationClock();
    expect(clock.status).toBe('stopped');
    clock.play();
    expect(clock.status).toBe('running');
    clock.pause();
    expect(clock.status).toBe('paused');
    clock.stop();
    expect(clock.status).toBe('stopped');
  });

  it('should seek to a specific time', () => {
    const clock = new SimulationClock();
    clock.seekTo(5.5);
    expect(clock.currentTime).toBeCloseTo(5.5, 10);
  });

  it('should not seek to negative time', () => {
    const clock = new SimulationClock();
    clock.seekTo(3);
    clock.seekTo(-1);
    expect(clock.currentTime).toBe(3);
  });

  it('should clamp seek to maxTime', () => {
    const clock = new SimulationClock({ maxTime: 10 });
    clock.seekTo(100);
    expect(clock.currentTime).toBe(10);
  });

  describe('update() with wall delta', () => {
    it('should not advance when not running', () => {
      const clock = new SimulationClock({ timeStep: 1 / 60 });
      const steps = clock.update(16.67);
      expect(steps).toBe(0);
    });

    it('should advance when running', () => {
      const clock = new SimulationClock({ timeStep: 1 / 60, playbackSpeed: 1 });
      clock.play();
      const steps = clock.update(16.67);
      expect(steps).toBe(1);
    });

    it('should scale with playback speed', () => {
      const clock = new SimulationClock({ timeStep: 1 / 60, playbackSpeed: 2 });
      clock.play();
      const steps = clock.update(16.67);
      expect(steps).toBe(2);
    });
  });
});
