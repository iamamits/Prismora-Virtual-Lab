/**
 * Core simulation interfaces for the Prismora simulation engine.
 * These interfaces are framework-agnostic and define the contract
 * for all simulation models.
 */

export interface Vector2D {
  readonly x: number;
  readonly y: number;
}

export interface SimulationState {
  /** Current simulation time in seconds */
  readonly time: number;
  /** Position in metres */
  readonly position: Vector2D;
  /** Velocity in m/s */
  readonly velocity: Vector2D;
  /** Acceleration in m/s² */
  readonly acceleration: Vector2D;
  /** Whether the simulation has terminated (e.g., hit ground) */
  readonly terminated: boolean;
  /** Reason for termination, if terminated */
  readonly terminationReason?: string;
}

export interface SimulationModel<TParams, TState extends SimulationState> {
  /** Unique model identifier */
  readonly id: string;
  /** Model version for serialization compatibility */
  readonly version: string;
  /** Human-readable name */
  readonly name: string;

  /** Compute the state at an arbitrary time from initial conditions */
  computeState(params: TParams, time: number): TState;

  /** Validate parameters, returning errors if invalid */
  validateParameters(params: TParams): ValidationResult;

  /** Compute derived measurements from a state */
  computeMeasurements(params: TParams, state: TState): Record<string, MeasurementValue>;

  /** Get the analytical terminal time (e.g., when projectile hits ground) */
  computeTerminalTime(params: TParams): number | null;

  /** Get default parameters */
  getDefaultParameters(): TParams;
}

export interface ValidationResult {
  readonly valid: boolean;
  readonly errors: ValidationError[];
}

export interface ValidationError {
  readonly field: string;
  readonly message: string;
  readonly value?: unknown;
}

export interface MeasurementValue {
  readonly value: number;
  readonly unit: string;
  readonly label: string;
  readonly precision?: number;
}
