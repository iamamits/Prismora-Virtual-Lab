// Types
export type {
  Vector2D,
  SimulationState,
  SimulationModel,
  ValidationResult,
  ValidationError,
  MeasurementValue,
} from './types/simulation';

export type { ProjectileMotionParameters } from './types/parameters';
export { DEFAULT_PROJECTILE_PARAMETERS, PROJECTILE_PARAMETER_CONSTRAINTS } from './types/parameters';

export type { ProjectileMotionState } from './types/state';

export type { ProjectileMotionMeasurements } from './types/measurements';

// Models
export { ProjectileMotionModel, projectileMotionModel } from './models/projectile-motion';

// Engine
export { SimulationClock } from './engine/simulation-clock';
export type { ClockStatus, SimulationClockOptions } from './engine/simulation-clock';

export { SimulationController } from './engine/simulation-controller';
export type {
  ControllerStatus,
  SimulationControllerOptions,
  ExperimentConfiguration,
} from './engine/simulation-controller';

export { SnapshotRecorder } from './engine/snapshot-recorder';

// Validation
export { validateProjectileParameters } from './validation/parameter-validator';

// Utils
export { degreesToRadians, radiansToDegrees, isFiniteNumber, clamp } from './utils/math-helpers';
export { SI_UNITS, formatValue, formatWithUnit } from './utils/units';

// Advanced Engineering Modules
export * as DigitalElectronics from './digital';
export * from './digital';

export * as COA from './coa';
export * from './coa';

export * as TOC from './toc';
export * from './toc';

// ECE Virtual Lab (Circuits, Adders, Automated Verifier)
export * as ECE from './ece';
export * from './ece';

