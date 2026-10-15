/**
 * SI unit system used internally throughout the simulation engine.
 * All conversions happen at presentation boundaries only.
 */

export const SI_UNITS = {
  distance: 'm',
  time: 's',
  speed: 'm/s',
  acceleration: 'm/s²',
  angle: 'rad',
  energy: 'J',
} as const;

export type SIUnit = (typeof SI_UNITS)[keyof typeof SI_UNITS];

/** Format a number with appropriate precision for display */
export function formatValue(value: number, precision: number = 2): string {
  if (!Number.isFinite(value)) return '—';
  return value.toFixed(precision);
}

/** Format a value with its unit */
export function formatWithUnit(value: number, unit: string, precision: number = 2): string {
  return `${formatValue(value, precision)} ${unit}`;
}
