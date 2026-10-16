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

// Electrical Engineering (Network Theorems: Thévenin, Norton, Max Power)
export * as Electrical from './electrical';
export * from './electrical';

// Mechanical Engineering (Harmonic Oscillator, Dynamics, Resonant Vibrations)
export * as Mechanical from './mechanical';
export * from './mechanical';

// Chemical Sciences (Acid-Base Titrations, Ionic Equilibria, Buffer Solutions)
export * as Chemistry from './chemistry';
export * from './chemistry';

// Physical Sciences (Wave Optics, Double-Slit Interference, Diffraction)
export * as Physics from './physics';
export * from './physics';

// Civil & Structural Engineering (Bridge Truss Mechanics, Method of Joints)
export * as Civil from './civil';
export * from './civil';

// Robotics & Mechanisms (DH Parameters, Forward & Inverse Kinematics)
export * as Robotics from './robotics';
export * from './robotics';

// Chemical Engineering (McCabe-Thiele Fractional Distillation Column)
export * as ChemicalEngineering from './chemical';
export * from './chemical';

// Biotechnology & Bioengineering (Enzyme Kinetics, Michaelis-Menten, Inhibition)
export * as Biotech from './biotech';
export * from './biotech';


