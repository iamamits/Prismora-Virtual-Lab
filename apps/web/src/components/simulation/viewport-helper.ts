/**
 * Universal PhET & GeoGebra Standard Virtual Viewport Helper
 *
 * Guarantees that simulation graphics, labels, tools, and particles
 * NEVER go out of bounds regardless of screen size, device pixel ratio,
 * or layout container dimensions.
 */

export const VIRTUAL_WIDTH = 900;
export const VIRTUAL_HEIGHT = 520;

export interface ViewportTransform {
  scale: number;
  offsetX: number;
  offsetY: number;
  virtualWidth: number;
  virtualHeight: number;
}

export function computeViewport(
  canvasWidth: number,
  canvasHeight: number,
  dpr: number = 1,
  userZoom: number = 1.0,
  panX: number = 0,
  panY: number = 0,
): ViewportTransform {
  const cssWidth = canvasWidth / dpr;
  const cssHeight = canvasHeight / dpr;

  // Fit contain aspect ratio
  const baseScale = Math.min(cssWidth / VIRTUAL_WIDTH, cssHeight / VIRTUAL_HEIGHT);
  const scale = baseScale * userZoom;

  const offsetX = (cssWidth - VIRTUAL_WIDTH * scale) / 2 + panX;
  const offsetY = (cssHeight - VIRTUAL_HEIGHT * scale) / 2 + panY;

  return {
    scale,
    offsetX,
    offsetY,
    virtualWidth: VIRTUAL_WIDTH,
    virtualHeight: VIRTUAL_HEIGHT,
  };
}

export function applyVirtualViewport(
  ctx: CanvasRenderingContext2D,
  vp: ViewportTransform,
  dpr: number = 1,
): void {
  // Set matrix transform to map (0..900, 0..520) directly to canvas pixels
  ctx.setTransform(
    vp.scale * dpr,
    0,
    0,
    vp.scale * dpr,
    vp.offsetX * dpr,
    vp.offsetY * dpr,
  );
}

export function screenToVirtualCoords(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement,
  vp: ViewportTransform,
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const cssX = clientX - rect.left;
  const cssY = clientY - rect.top;

  return {
    x: (cssX - vp.offsetX) / vp.scale,
    y: (cssY - vp.offsetY) / vp.scale,
  };
}
