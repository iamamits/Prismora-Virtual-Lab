export type ClockStatus = 'stopped' | 'running' | 'paused';

export interface SimulationClockOptions {
  /** Fixed time step in seconds (default: 1/60) */
  timeStep?: number;
  /** Playback speed multiplier (default: 1.0) */
  playbackSpeed?: number;
  /** Maximum simulation time in seconds (default: 300) */
  maxTime?: number;
}

/**
 * Simulation clock that manages simulation time independently of wall-clock time.
 * Uses a fixed timestep for deterministic advancement.
 */
export class SimulationClock {
  private _currentTime: number = 0;
  private _timeStep: number;
  private _playbackSpeed: number;
  private _maxTime: number;
  private _status: ClockStatus = 'stopped';
  private _accumulatedDelta: number = 0;

  constructor(options: SimulationClockOptions = {}) {
    this._timeStep = options.timeStep ?? 1 / 60;
    this._playbackSpeed = options.playbackSpeed ?? 1.0;
    this._maxTime = options.maxTime ?? 300;
  }

  get currentTime(): number {
    return this._currentTime;
  }

  get timeStep(): number {
    return this._timeStep;
  }

  get playbackSpeed(): number {
    return this._playbackSpeed;
  }

  get status(): ClockStatus {
    return this._status;
  }

  get maxTime(): number {
    return this._maxTime;
  }

  setPlaybackSpeed(speed: number): void {
    if (speed > 0 && speed <= 10 && Number.isFinite(speed)) {
      this._playbackSpeed = speed;
    }
  }

  setTimeStep(step: number): void {
    if (step > 0 && step <= 1 && Number.isFinite(step)) {
      this._timeStep = step;
    }
  }

  /**
   * Advance the clock by one fixed timestep.
   * Returns the new simulation time.
   */
  step(): number {
    const newTime = this._currentTime + this._timeStep;
    this._currentTime = Math.min(newTime, this._maxTime);
    return this._currentTime;
  }

  /**
   * Update the clock based on wall-clock delta time.
   * Returns the number of fixed steps that should be executed.
   */
  update(wallDeltaMs: number): number {
    if (this._status !== 'running') return 0;

    const scaledDelta = (wallDeltaMs / 1000) * this._playbackSpeed;
    this._accumulatedDelta += scaledDelta;

    let steps = 0;
    const maxStepsPerFrame = 10; // Prevent spiral of death

    while (this._accumulatedDelta >= this._timeStep && steps < maxStepsPerFrame) {
      this._currentTime = Math.min(this._currentTime + this._timeStep, this._maxTime);
      this._accumulatedDelta -= this._timeStep;
      steps++;
    }

    // If we hit max steps, drain remaining accumulated time
    if (steps >= maxStepsPerFrame) {
      this._accumulatedDelta = 0;
    }

    return steps;
  }

  play(): void {
    this._status = 'running';
    this._accumulatedDelta = 0;
  }

  pause(): void {
    this._status = 'paused';
    this._accumulatedDelta = 0;
  }

  stop(): void {
    this._status = 'stopped';
    this._accumulatedDelta = 0;
  }

  reset(): void {
    this._currentTime = 0;
    this._status = 'stopped';
    this._accumulatedDelta = 0;
  }

  seekTo(time: number): void {
    if (Number.isFinite(time) && time >= 0) {
      this._currentTime = Math.min(time, this._maxTime);
    }
  }
}
