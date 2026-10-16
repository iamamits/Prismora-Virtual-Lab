import { describe, expect, it } from 'vitest';
import { DEFAULT_PID_PARAMS, PidControllerEngine } from '../src/robotics/pid-controller';

describe('PidControllerEngine (Closed-Loop PID Control)', () => {
  it('achieves steady-state tracking for stable PID tuning', () => {
    const res = PidControllerEngine.compute(DEFAULT_PID_PARAMS);
    expect(res.isStable).toBe(true);
    expect(res.steadyStateError).toBeLessThan(0.05);
    expect(res.trajectory.length).toBeGreaterThan(100);
  });

  it('detects overshoot when proportional gain is high and damping is low', () => {
    const res = PidControllerEngine.compute({
      ...DEFAULT_PID_PARAMS,
      kp: 25.0,
      ki: 5.0,
      kd: 0.1, // very low derivative damping
    });
    expect(res.overshootPercent).toBeGreaterThan(5.0);
    expect(res.peakValue).toBeGreaterThan(DEFAULT_PID_PARAMS.setpoint);
  });

  it('eliminates steady-state error with integral action compared to pure P controller', () => {
    const pureP = PidControllerEngine.compute({
      ...DEFAULT_PID_PARAMS,
      kp: 5.0,
      ki: 0.0,
      kd: 0.0,
    });
    const withI = PidControllerEngine.compute({
      ...DEFAULT_PID_PARAMS,
      kp: 5.0,
      ki: 4.0,
      kd: 0.5,
    });

    expect(withI.steadyStateError).toBeLessThan(pureP.steadyStateError);
  });
});
