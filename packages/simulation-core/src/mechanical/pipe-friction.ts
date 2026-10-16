/**
 * Prismora Mechanical Engineering: Fluid Mechanics — Pipe Friction & Darcy-Weisbach Head Loss
 * Benchmark: IIT Madras & IIT Roorkee Fluid Mechanics Laboratory
 *
 * Governing Equations:
 * 1. Reynolds Number:
 *    Re = \frac{\rho v D}{\mu} = \frac{v D}{\nu}
 *    Laminar: Re < 2300, Critical: 2300 - 4000, Turbulent: Re > 4000
 *
 * 2. Darcy Friction Factor f:
 *    Laminar (Hagen-Poiseuille): f = 64 / Re
 *    Turbulent (Swamee-Jain explicit Colebrook-White approximation):
 *    f = \frac{0.25}{\left[\log_{10}\left(\frac{\epsilon}{3.7 D} + \frac{5.74}{Re^{0.9}}\right)\right]^2}
 *
 * 3. Major Head Loss (Darcy-Weisbach):
 *    h_f = f \frac{L}{D} \frac{v^2}{2g}
 *
 * 4. Hydraulic Gradient Line (HGL) & Energy Gradient Line (EGL):
 *    EGL = z + \frac{P}{\rho g} + \frac{v^2}{2g}
 *    HGL = z + \frac{P}{\rho g}
 */

export type PipeMaterial = 'glass' | 'smooth_copper' | 'commercial_steel' | 'cast_iron' | 'concrete';
export type PipeMaterialType = PipeMaterial;

export interface PipeFrictionParameters {
  readonly pipeDiameterMm: number;    // Diameter in mm (e.g. 25 mm - 100 mm)
  readonly pipeLengthM: number;       // Pipe length in metres (e.g. 10 m - 50 m)
  readonly flowVelocityMPerS: number; // Mean flow velocity in m/s (e.g. 0.5 - 4.0 m/s)
  readonly fluidTemperatureC?: number;// Water temperature in °C (default 20°C)
  readonly material: PipeMaterial;    // Surface roughness ε
  readonly pipeMaterial?: PipeMaterial;
}

export interface PipeFrictionResult {
  readonly reynoldsNumber: number;
  readonly flowRegime: 'laminar' | 'transitional' | 'turbulent';
  readonly frictionFactor: number;
  readonly darcyFrictionFactor: number;
  readonly headLossM: number;
  readonly frictionalHeadLossM: number;
  readonly pressureDropKpa: number;
  readonly flowRateLitersPerSec: number;
  readonly shearStressWallPa: number;
  readonly manometerDeflectionMm: number;
  readonly hglPoints: readonly { x: number; hgl: number; egl: number }[];
}

const ROUGHNESS_MAP: Record<PipeMaterial, number> = {
  glass: 0.0015,           // 0.0015 mm
  smooth_copper: 0.002,     // 0.002 mm
  commercial_steel: 0.045,  // 0.045 mm
  cast_iron: 0.26,          // 0.26 mm
  concrete: 1.2,            // 1.2 mm
};

export const DEFAULT_PIPE_FRICTION_PARAMS: PipeFrictionParameters = {
  pipeDiameterMm: 50,
  pipeLengthM: 20,
  flowVelocityMPerS: 1.8,
  fluidTemperatureC: 20,
  material: 'commercial_steel',
};

export class PipeFrictionEngine {
  static compute(params: PipeFrictionParameters = DEFAULT_PIPE_FRICTION_PARAMS): PipeFrictionResult {
    const d = params.pipeDiameterMm / 1000; // m
    const L = params.pipeLengthM; // m
    const v = params.flowVelocityMPerS; // m/s
    const g = 9.81; // m/s²
    const rho = 1000; // kg/m³

    // Kinematic viscosity of water at 20°C approx 1.004e-6 m²/s
    const temp = params.fluidTemperatureC ?? 20;
    const nu = (1.787 / (1 + 0.0337 * temp + 0.00022 * temp * temp)) * 1e-6;

    const Re = (v * d) / nu;
    const mat = params.pipeMaterial ?? params.material;
    const eps = (ROUGHNESS_MAP[mat] ?? 0.045) / 1000; // in m
    const relRoughness = eps / d;

    let f: number;
    let flowRegime: 'laminar' | 'transitional' | 'turbulent';

    if (Re < 2300) {
      flowRegime = 'laminar';
      f = 64 / Math.max(1, Re);
    } else if (Re < 4000) {
      flowRegime = 'transitional';
      const fLam = 64 / 2300;
      const fTurb = 0.25 / Math.pow(Math.log10(relRoughness / 3.7 + 5.74 / Math.pow(4000, 0.9)), 2);
      const frac = (Re - 2300) / (4000 - 2300);
      f = fLam + frac * (fTurb - fLam);
    } else {
      flowRegime = 'turbulent';
      // Swamee-Jain equation
      const denom = Math.log10(relRoughness / 3.7 + 5.74 / Math.pow(Re, 0.9));
      f = 0.25 / (denom * denom);
    }

    // Darcy-Weisbach head loss
    const hf = (f * (L / d) * (v * v)) / (2 * g);
    // Pressure drop \Delta P = \rho * g * h_f
    const deltaPKpa = (rho * g * hf) / 1000;
    // Volumetric flow rate Q = A * v
    const area = (Math.PI * d * d) / 4;
    const flowRateLps = area * v * 1000;
    // Wall shear stress \tau_w = \frac{f}{8} \rho v^2
    const tauW = (f / 8) * rho * v * v;

    // Hydraulic Gradient Line points along pipe length
    const totalHeadInlet = hf + 5.0; // arbitrary datum baseline
    const velHead = (v * v) / (2 * g);
    const hglPoints: Array<{ x: number; hgl: number; egl: number }> = [];
    const numPoints = 21;
    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * L;
      const headLossAtX = (x / L) * hf;
      const egl = totalHeadInlet - headLossAtX;
      const hgl = egl - velHead;
      hglPoints.push({
        x: parseFloat(x.toFixed(1)),
        hgl: parseFloat(hgl.toFixed(3)),
        egl: parseFloat(egl.toFixed(3)),
      });
    }

    // Manometer deflection in mm of mercury
    const hmDeflection = (hf / (13.6 - 1)) * 1000;

    return {
      reynoldsNumber: Math.round(Re),
      flowRegime,
      frictionFactor: parseFloat(f.toFixed(4)),
      darcyFrictionFactor: parseFloat(f.toFixed(4)),
      headLossM: parseFloat(hf.toFixed(3)),
      frictionalHeadLossM: parseFloat(hf.toFixed(3)),
      pressureDropKpa: parseFloat(deltaPKpa.toFixed(2)),
      flowRateLitersPerSec: parseFloat(flowRateLps.toFixed(2)),
      shearStressWallPa: parseFloat(tauW.toFixed(2)),
      manometerDeflectionMm: parseFloat(hmDeflection.toFixed(1)),
      hglPoints,
    };
  }
}
