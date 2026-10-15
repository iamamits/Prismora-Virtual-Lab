import type { SimulationModel, SimulationState, ValidationResult } from '../types/simulation';
import { SimulationClock, type SimulationClockOptions } from './simulation-clock';
import { SnapshotRecorder } from './snapshot-recorder';

export type ControllerStatus = 'idle' | 'ready' | 'running' | 'paused' | 'completed' | 'error';

export interface SimulationControllerOptions extends SimulationClockOptions {
  /** Whether to record snapshots (default: true) */
  recordSnapshots?: boolean;
  /** Snapshot recording interval in simulation seconds (default: timeStep) */
  snapshotInterval?: number;
  /** Maximum number of snapshots to retain (default: 10000) */
  maxSnapshots?: number;
}

/**
 * Orchestrates the simulation lifecycle: initialization, stepping,
 * pausing, resetting, and snapshot management.
 */
export class SimulationController<TParams, TState extends SimulationState> {
  private readonly model: SimulationModel<TParams, TState>;
  private readonly clock: SimulationClock;
  private readonly recorder: SnapshotRecorder<TState>;
  private _params: TParams;
  private _currentState: TState;
  private _status: ControllerStatus = 'idle';
  private _error: string | null = null;
  private readonly _recordSnapshots: boolean;
  private readonly _snapshotInterval: number;
  private _lastSnapshotTime: number = -Infinity;

  constructor(
    model: SimulationModel<TParams, TState>,
    options: SimulationControllerOptions = {},
  ) {
    this.model = model;
    this.clock = new SimulationClock(options);
    this._recordSnapshots = options.recordSnapshots ?? true;
    this._snapshotInterval = options.snapshotInterval ?? (options.timeStep ?? 1 / 60);
    this.recorder = new SnapshotRecorder<TState>(options.maxSnapshots ?? 10000);
    this._params = model.getDefaultParameters();
    this._currentState = model.computeState(this._params, 0);
  }

  get status(): ControllerStatus {
    return this._status;
  }

  get error(): string | null {
    return this._error;
  }

  get currentState(): TState {
    return this._currentState;
  }

  get parameters(): TParams {
    return this._params;
  }

  get simulationTime(): number {
    return this.clock.currentTime;
  }

  get clockStatus() {
    return this.clock.status;
  }

  get playbackSpeed(): number {
    return this.clock.playbackSpeed;
  }

  get snapshots(): readonly TState[] {
    return this.recorder.getSnapshots();
  }

  get terminalTime(): number | null {
    return this.model.computeTerminalTime(this._params);
  }

  /**
   * Initialize or reinitialize with new parameters.
   */
  initialize(params: TParams): ValidationResult {
    const validation = this.model.validateParameters(params);
    if (!validation.valid) {
      this._status = 'error';
      this._error = validation.errors.map((e) => e.message).join('; ');
      return validation;
    }

    this._params = params;
    this.clock.reset();
    this.recorder.clear();
    this._currentState = this.model.computeState(params, 0);
    this._status = 'ready';
    this._error = null;
    this._lastSnapshotTime = -Infinity;

    this._recordSnapshot();

    return validation;
  }

  /**
   * Update parameters without resetting the simulation.
   * Recomputes the current state at the current time with new parameters.
   */
  updateParameters(params: TParams): ValidationResult {
    const validation = this.model.validateParameters(params);
    if (!validation.valid) {
      return validation;
    }

    this._params = params;
    this._currentState = this.model.computeState(params, this.clock.currentTime);

    // Clear snapshots since parameters changed
    this.recorder.clear();
    this._lastSnapshotTime = -Infinity;
    this._recordSnapshot();

    return validation;
  }

  play(): void {
    if (this._status === 'error' || this._status === 'idle') return;
    if (this._currentState.terminated) return;
    this._status = 'running';
    this.clock.play();
  }

  pause(): void {
    if (this._status !== 'running') return;
    this._status = 'paused';
    this.clock.pause();
  }

  /**
   * Advance by one fixed timestep.
   */
  step(): TState {
    if (this._status === 'error' || this._status === 'idle') return this._currentState;
    if (this._currentState.terminated) return this._currentState;

    this.clock.step();
    this._currentState = this.model.computeState(this._params, this.clock.currentTime);
    this._recordSnapshot();

    if (this._currentState.terminated) {
      this._status = 'completed';
      this.clock.stop();
    } else {
      this._status = 'paused';
    }

    return this._currentState;
  }

  /**
   * Advance based on wall-clock delta (for animation loops).
   * Returns the current state after advancement.
   */
  tick(wallDeltaMs: number): TState {
    if (this._status !== 'running') return this._currentState;

    const steps = this.clock.update(wallDeltaMs);

    if (steps > 0) {
      this._currentState = this.model.computeState(this._params, this.clock.currentTime);
      this._recordSnapshot();
    }

    if (this._currentState.terminated) {
      this._status = 'completed';
      this.clock.stop();
    }

    return this._currentState;
  }

  /**
   * Reset to initial conditions.
   */
  reset(): void {
    this.clock.reset();
    this.recorder.clear();
    this._currentState = this.model.computeState(this._params, 0);
    this._status = 'ready';
    this._error = null;
    this._lastSnapshotTime = -Infinity;
    this._recordSnapshot();
  }

  /**
   * Seek to a specific simulation time.
   */
  seekTo(time: number): TState {
    if (this._status === 'error' || this._status === 'idle') return this._currentState;

    this.clock.seekTo(time);
    this._currentState = this.model.computeState(this._params, this.clock.currentTime);

    if (this._currentState.terminated) {
      this._status = 'completed';
    } else if (this._status === 'completed') {
      this._status = 'paused';
    }

    return this._currentState;
  }

  setPlaybackSpeed(speed: number): void {
    this.clock.setPlaybackSpeed(speed);
  }

  /**
   * Get computed measurements for the current state.
   */
  getMeasurements() {
    return this.model.computeMeasurements(this._params, this._currentState);
  }

  /**
   * Export the current experiment configuration.
   */
  exportConfiguration(): ExperimentConfiguration<TParams> {
    return {
      version: '1.0.0',
      modelId: this.model.id,
      modelVersion: this.model.version,
      parameters: { ...this._params },
      clockSettings: {
        timeStep: this.clock.timeStep,
        playbackSpeed: this.clock.playbackSpeed,
        maxTime: this.clock.maxTime,
      },
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Import an experiment configuration.
   */
  importConfiguration(config: ExperimentConfiguration<TParams>): ValidationResult {
    if (config.modelId !== this.model.id) {
      return {
        valid: false,
        errors: [{
          field: 'modelId',
          message: `Expected model "${this.model.id}" but got "${config.modelId}"`,
          value: config.modelId,
        }],
      };
    }

    return this.initialize(config.parameters);
  }

  private _recordSnapshot(): void {
    if (!this._recordSnapshots) return;
    const t = this.clock.currentTime;
    if (t - this._lastSnapshotTime >= this._snapshotInterval * 0.99) {
      this.recorder.record(this._currentState);
      this._lastSnapshotTime = t;
    }
  }
}

export interface ExperimentConfiguration<TParams> {
  version: string;
  modelId: string;
  modelVersion: string;
  parameters: TParams;
  clockSettings: {
    timeStep: number;
    playbackSpeed: number;
    maxTime: number;
  };
  createdAt: string;
  observations?: string;
}
