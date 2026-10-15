import { describe, it, expect } from 'vitest';
import { SceneCamera } from '../scene-camera';

describe('SceneCamera Coordinate Transforms', () => {
  const vp = { width: 1000, height: 600, dpr: 1 };

  it('should roundtrip world -> screen -> world coordinates accurately', () => {
    const camera = new SceneCamera(1.0, 0, 0);
    const testPoints = [
      { x: 0, y: 0 },
      { x: 25.5, y: 14.2 },
      { x: 100, y: 50 },
      { x: 5, y: 80 },
    ];

    for (const pt of testPoints) {
      const screen = camera.worldToScreen(pt.x, pt.y, vp);
      const worldBack = camera.screenToWorld(screen.x, screen.y, vp);

      expect(worldBack.x).toBeCloseTo(pt.x, 8);
      expect(worldBack.y).toBeCloseTo(pt.y, 8);
    }
  });

  it('should maintain roundtrip consistency under pan and zoom', () => {
    const camera = new SceneCamera(1.8, 15, 8);
    const screen = camera.worldToScreen(35, 20, vp);
    const worldBack = camera.screenToWorld(screen.x, screen.y, vp);

    expect(worldBack.x).toBeCloseTo(35, 8);
    expect(worldBack.y).toBeCloseTo(20, 8);
  });

  it('zooming should scale pixelsPerMeter proportionally without mutating world distance', () => {
    const camera1 = new SceneCamera(1.0);
    const camera2 = new SceneCamera(2.0);

    expect(camera2.pixelsPerMeter).toBeCloseTo(camera1.pixelsPerMeter * 2, 8);

    // Physical distance of 10m is 10m in world units regardless of camera zoom
    const px1 = camera1.metersToPixels(10);
    const px2 = camera2.metersToPixels(10);
    expect(px2).toBeCloseTo(px1 * 2, 8);
    expect(camera1.pixelsToMeters(px1)).toBeCloseTo(10, 8);
    expect(camera2.pixelsToMeters(px2)).toBeCloseTo(10, 8);
  });

  it('should clamp zoom within safe limits', () => {
    const camera = new SceneCamera();
    camera.setZoom(100);
    expect(camera.zoom).toBeLessThanOrEqual(5.0);
    camera.setZoom(0.001);
    expect(camera.zoom).toBeGreaterThanOrEqual(0.2);
  });
});
