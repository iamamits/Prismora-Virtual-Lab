/**
 * Scene Camera & Coordinate System for Prismora Simulations
 *
 * Provides bidirectional transformations between Physical World Coordinates (SI meters)
 * and Canvas Screen Coordinates (device pixels), supporting zoom, pan, DPR scaling,
 * and coordinate invariance.
 */

export interface CameraState {
  /** Horizontal pan offset in world meters */
  panX: number;
  /** Vertical pan offset in world meters */
  panY: number;
  /** Zoom scale factor (1.0 = default scale) */
  zoom: number;
}

export interface ViewportDimensions {
  width: number;
  height: number;
  dpr: number;
}

export interface TransformBounds {
  worldMinX: number;
  worldMaxX: number;
  worldMinY: number;
  worldMaxY: number;
}

export class SceneCamera {
  private _panX: number = 0;
  private _panY: number = 0;
  private _zoom: number = 1.0;
  private _basePixelsPerMeter: number = 20; // Default: 20 pixels per meter at zoom 1.0
  private _marginLeft: number = 80;
  private _marginBottom: number = 80;

  constructor(initialZoom: number = 1.0, panX: number = 0, panY: number = 0) {
    this._zoom = Math.max(0.2, Math.min(5.0, initialZoom));
    this._panX = panX;
    this._panY = panY;
  }

  get panX(): number {
    return this._panX;
  }

  get panY(): number {
    return this._panY;
  }

  get zoom(): number {
    return this._zoom;
  }

  get pixelsPerMeter(): number {
    return this._basePixelsPerMeter * this._zoom;
  }

  setPan(panX: number, panY: number): void {
    if (Number.isFinite(panX) && Number.isFinite(panY)) {
      this._panX = panX;
      this._panY = panY;
    }
  }

  panBy(deltaWorldX: number, deltaWorldY: number): void {
    if (Number.isFinite(deltaWorldX) && Number.isFinite(deltaWorldY)) {
      this._panX += deltaWorldX;
      this._panY += deltaWorldY;
    }
  }

  setZoom(zoom: number, anchorScreenX?: number, anchorScreenY?: number, vp?: ViewportDimensions): void {
    const clampedZoom = Math.max(0.2, Math.min(5.0, zoom));
    if (clampedZoom === this._zoom || !Number.isFinite(clampedZoom)) return;

    if (anchorScreenX !== undefined && anchorScreenY !== undefined && vp) {
      // Zoom centered at cursor position
      const worldBefore = this.screenToWorld(anchorScreenX, anchorScreenY, vp);
      this._zoom = clampedZoom;
      const worldAfter = this.screenToWorld(anchorScreenX, anchorScreenY, vp);
      this._panX += worldBefore.x - worldAfter.x;
      this._panY += worldBefore.y - worldAfter.y;
    } else {
      this._zoom = clampedZoom;
    }
  }

  resetView(): void {
    this._panX = 0;
    this._panY = 0;
    this._zoom = 1.0;
  }

  /**
   * Fit camera view to encompass a given bounding box with padding
   */
  fitBounds(bounds: TransformBounds, vp: ViewportDimensions): void {
    const dpr = vp.dpr || 1;
    const availWidth = vp.width / dpr - this._marginLeft - 60;
    const availHeight = vp.height / dpr - this._marginBottom - 60;

    const spanX = Math.max(10, bounds.worldMaxX - bounds.worldMinX);
    const spanY = Math.max(10, bounds.worldMaxY - bounds.worldMinY);

    const neededPpmX = availWidth / spanX;
    const neededPpmY = availHeight / spanY;
    const targetPpm = Math.min(neededPpmX, neededPpmY);

    this._zoom = Math.max(0.25, Math.min(3.0, targetPpm / this._basePixelsPerMeter));
    this._panX = bounds.worldMinX;
    this._panY = bounds.worldMinY;
  }

  /**
   * Transform physical world coordinates (m) to screen pixel coordinates
   */
  worldToScreen(worldX: number, worldY: number, vp: ViewportDimensions): { x: number; y: number } {
    const dpr = vp.dpr || 1;
    const ppm = this.pixelsPerMeter * dpr;
    const originScreenX = this._marginLeft * dpr;
    const originScreenY = vp.height - this._marginBottom * dpr;

    const screenX = originScreenX + (worldX - this._panX) * ppm;
    const screenY = originScreenY - (worldY - this._panY) * ppm; // Invert Y for screen coords

    return { x: screenX, y: screenY };
  }

  /**
   * Transform screen pixel coordinates to physical world coordinates (m)
   */
  screenToWorld(screenX: number, screenY: number, vp: ViewportDimensions): { x: number; y: number } {
    const dpr = vp.dpr || 1;
    const ppm = this.pixelsPerMeter * dpr;
    const originScreenX = this._marginLeft * dpr;
    const originScreenY = vp.height - this._marginBottom * dpr;

    const worldX = this._panX + (screenX - originScreenX) / ppm;
    const worldY = this._panY + (originScreenY - screenY) / ppm; // Invert Y back

    return { x: worldX, y: worldY };
  }

  /**
   * Convert physical meters distance to screen pixels
   */
  metersToPixels(meters: number, dpr: number = 1): number {
    return meters * this.pixelsPerMeter * dpr;
  }

  /**
   * Convert screen pixels distance to physical meters
   */
  pixelsToMeters(pixels: number, dpr: number = 1): number {
    const ppm = this.pixelsPerMeter * dpr;
    return ppm > 0 ? pixels / ppm : 0;
  }
}
