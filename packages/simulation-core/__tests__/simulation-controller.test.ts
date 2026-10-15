import { describe, it, expect } from 'vitest';
import { SimulationController } from '../src/engine/simulation-controller';
import { ProjectileMotionModel } from '../src/models/projectile-motion';
import { degreesToRadians } from '../src/utils/math-helpers';

const model = new ProjectileMotionModel();

describe('SimulationController', () => {
  it('should start in idle status with default parameters', () => {
    const controller = new SimulationController(model);
    expect(controller.status).toBe('idle');
  });

  it('should transition to ready after initialization', () => {
    const controller = new SimulationController(model);
    const result = controller.initialize(model.getDefaultParameters());
    expect(result.valid).toBe(true);
    expect(controller.status).toBe('ready');
  });

  it('should reject invalid parameters', () => {
    const controller = new SimulationController(model);
    const result = controller.initialize({
      initialSpeed: -5,
      launchAngle: 0,
      gravity: 9.81,
      initialHeight: 0,
    });
    expect(result.valid).toBe(false);
    expect(controller.status).toBe('error');
  });

  it('should step and advance time', () => {
    const controller = new SimulationController(model, { timeStep: 0.1 });
    controller.initialize(model.getDefaultParameters());
    controller.step();
    expect(controller.simulationTime).toBeCloseTo(0.1, 6);
    expect(controller.status).toBe('paused');
  });

  it('should complete when projectile reaches ground', () => {
    const controller = new SimulationController(model, { timeStep: 0.01 });
    controller.initialize({
      initialSpeed: 10,
      launchAngle: degreesToRadians(45),
      gravity: 10,
      initialHeight: 0,
    });

    let steps = 0;
    while (controller.status !== 'completed' && steps < 10000) {
      controller.step();
      steps++;
    }

    expect(controller.status).toBe('completed');
    expect(controller.currentState.terminated).toBe(true);
  });

  it('should reset to initial conditions', () => {
    const controller = new SimulationController(model);
    controller.initialize(model.getDefaultParameters());
    controller.step();
    controller.step();
    controller.reset();
    expect(controller.simulationTime).toBe(0);
    expect(controller.status).toBe('ready');
    expect(controller.currentState.position.x).toBeCloseTo(0, 10);
  });

  it('should seek to a specific time', () => {
    const controller = new SimulationController(model);
    controller.initialize(model.getDefaultParameters());
    controller.seekTo(1.5);
    expect(controller.simulationTime).toBeCloseTo(1.5, 6);
  });

  it('should record snapshots', () => {
    const controller = new SimulationController(model, { recordSnapshots: true, timeStep: 0.1, snapshotInterval: 0.1 });
    controller.initialize(model.getDefaultParameters());
    controller.step();
    controller.step();
    controller.step();
    expect(controller.snapshots.length).toBeGreaterThanOrEqual(3);
  });

  it('should export and import configuration', () => {
    const controller = new SimulationController(model);
    const params = {
      initialSpeed: 15,
      launchAngle: degreesToRadians(30),
      gravity: 9.81,
      initialHeight: 5,
    };
    controller.initialize(params);

    const config = controller.exportConfiguration();
    expect(config.modelId).toBe('projectile-motion');
    expect(config.parameters.initialSpeed).toBe(15);

    const newController = new SimulationController(model);
    const result = newController.importConfiguration(config);
    expect(result.valid).toBe(true);
    expect(newController.parameters.initialSpeed).toBe(15);
  });

  it('should reject configuration for wrong model', () => {
    const controller = new SimulationController(model);
    const result = controller.importConfiguration({
      version: '1.0.0',
      modelId: 'wrong-model',
      modelVersion: '1.0.0',
      parameters: model.getDefaultParameters(),
      clockSettings: { timeStep: 1/60, playbackSpeed: 1, maxTime: 300 },
      createdAt: new Date().toISOString(),
    });
    expect(result.valid).toBe(false);
  });

  it('should compute measurements', () => {
    const controller = new SimulationController(model);
    controller.initialize(model.getDefaultParameters());
    const measurements = controller.getMeasurements();
    expect(measurements).toHaveProperty('flightTime');
    expect(measurements).toHaveProperty('maxHeight');
    expect(measurements).toHaveProperty('range');
  });
});
