export interface ProjectileMotionMeasurements {
  /** Total flight time in seconds */
  readonly flightTime: number | null;
  /** Maximum height reached in metres */
  readonly maxHeight: number;
  /** Time to reach maximum height in seconds */
  readonly timeToMaxHeight: number;
  /** Horizontal range at ground level in metres */
  readonly range: number | null;
  /** Current speed in m/s */
  readonly currentSpeed: number;
  /** Current height in metres */
  readonly currentHeight: number;
  /** Current horizontal distance in metres */
  readonly currentDistance: number;
}
