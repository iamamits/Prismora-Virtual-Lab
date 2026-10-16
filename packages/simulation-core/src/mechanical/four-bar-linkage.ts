/**
 * Prismora Mechanical Engineering: Kinematics of Machines — Planar Four-Bar Linkage Mechanism
 * Benchmark: IIT Delhi & IIT Kharagpur Mechanism Simulation Virtual Lab
 *
 * Grashof's Condition:
 *   Let s = shortest link, l = longest link, p and q = intermediate links
 *   Condition: s + l \le p + q
 *   - If s + l \le p + q:
 *     * Shortest is input crank -> Crank-Rocker Mechanism (continuous rotation)
 *     * Shortest is fixed base  -> Double-Crank (Drag-link) Mechanism
 *     * Shortest is coupler     -> Double-Rocker Mechanism
 *   - If s + l > p + q: Non-Grashof Triple-Rocker (no continuous rotation possible)
 *
 * Freudenstein's Equation for Joint Coordinates:
 *   Loop Closure Equation:
 *   \vec{r}_1 + \vec{r}_2 + \vec{r}_3 + \vec{r}_4 = 0
 *   Freudenstein relation: K_1 \cos\theta_4 - K_2 \cos\theta_2 + K_3 = \cos(\theta_2 - \theta_4)
 *   where:
 *   K_1 = d / a, K_2 = d / c, K_3 = (a^2 - b^2 + c^2 + d^2) / (2 a c)
 */

export type LinkageType =
  | 'crank_rocker'
  | 'double_crank'
  | 'double_rocker'
  | 'non_grashof_triple_rocker'
  | 'change_point';

export interface FourBarParameters {
  readonly fixedLengthD: number;    // Frame d (e.g. 100 mm)
  readonly crankLengthA: number;    // Input a (e.g. 40 mm)
  readonly couplerLengthB: number;  // Coupler b (e.g. 120 mm)
  readonly rockerLengthC: number;   // Output c (e.g. 80 mm)
  readonly inputAngleTheta2Deg: number; // Crank angle \theta_2 in deg
  readonly couplerPointOffsetP?: { u: number; v: number }; // Tracer point on coupler
}

export interface FourBarResult {
  readonly linkageType: LinkageType;
  readonly isGrashof: boolean;
  readonly transmissionAngleDeg: number;
  readonly isLockupOrToggle: boolean;
  readonly couplerAngleDeg: number;
  readonly rockerAngleDeg: number;
  readonly jointA: { x: number; y: number }; // Ground Left (0, 0)
  readonly jointB: { x: number; y: number }; // Input Crank Pin
  readonly jointC: { x: number; y: number }; // Coupler-Rocker Pin
  readonly jointD: { x: number; y: number }; // Ground Right (d, 0)
  readonly tracerPoint: { x: number; y: number }; // Coupler curve point
  readonly fullCouplerPath: readonly { x: number; y: number }[];
}

export const DEFAULT_FOUR_BAR_PARAMS: FourBarParameters = {
  fixedLengthD: 100,
  crankLengthA: 35,
  couplerLengthB: 110,
  rockerLengthC: 75,
  inputAngleTheta2Deg: 45,
  couplerPointOffsetP: { u: 55, v: 25 },
};

export class FourBarLinkageEngine {
  static compute(params: FourBarParameters = DEFAULT_FOUR_BAR_PARAMS): FourBarResult {
    const { fixedLengthD: d, crankLengthA: a, couplerLengthB: b, rockerLengthC: c } = params;
    const links = [
      { name: 'a', val: a },
      { name: 'b', val: b },
      { name: 'c', val: c },
      { name: 'd', val: d },
    ];
    links.sort((x, y) => x.val - y.val);

    const s = links[0]!.val;
    const l = links[3]!.val;
    const p = links[1]!.val;
    const q = links[2]!.val;
    const sName = links[0]!.name;

    const grashofSum = s + l;
    const otherSum = p + q;
    const isGrashof = grashofSum <= otherSum;

    let linkageType: LinkageType;
    if (Math.abs(grashofSum - otherSum) < 1e-4) {
      linkageType = 'change_point';
    } else if (!isGrashof) {
      linkageType = 'non_grashof_triple_rocker';
    } else {
      if (sName === 'a') linkageType = 'crank_rocker';
      else if (sName === 'd') linkageType = 'double_crank';
      else linkageType = 'double_rocker';
    }

    // Solve for current angle
    const computePositions = (th2Deg: number) => {
      const th2 = (th2Deg * Math.PI) / 180;
      // Joint A is origin
      const jA = { x: 0, y: 0 };
      // Joint D is (d, 0)
      const jD = { x: d, y: 0 };
      // Joint B is crank pin: a*cos(th2), a*sin(th2)
      const jB = { x: a * Math.cos(th2), y: a * Math.sin(th2) };

      // Distance between B and D
      const distBD = Math.hypot(jD.x - jB.x, jD.y - jB.y);

      // Check if triangle BCD can be formed with lengths b, c, distBD
      if (distBD > b + c || distBD < Math.abs(b - c)) {
        return null; // toggle lockup
      }

      // Angle of BD vector relative to x-axis
      const alphaBD = Math.atan2(jD.y - jB.y, jD.x - jB.x);
      // Angle CBD using Law of Cosines
      const cosAngleCBD = (b * b + distBD * distBD - c * c) / (2 * b * distBD);
      const angleCBD = Math.acos(Math.max(-1, Math.min(1, cosAngleCBD)));

      // Coupler angle theta3
      const th3 = alphaBD - angleCBD; // open branch
      const jC = {
        x: jB.x + b * Math.cos(th3),
        y: jB.y + b * Math.sin(th3),
      };

      // Transmission angle mu between coupler (BC) and rocker (CD)
      const cosMu = (b * b + c * c - distBD * distBD) / (2 * b * c);
      const muDeg = (Math.acos(Math.max(-1, Math.min(1, cosMu))) * 180) / Math.PI;

      // Coupler tracer point
      const u = params.couplerPointOffsetP?.u ?? b / 2;
      const v = params.couplerPointOffsetP?.v ?? 0;
      // Rotated into coupler coordinate frame
      const tracer = {
        x: jB.x + u * Math.cos(th3) - v * Math.sin(th3),
        y: jB.y + u * Math.sin(th3) + v * Math.cos(th3),
      };

      const th4 = Math.atan2(jC.y - jD.y, jC.x - jD.x);
      const th3Deg = (th3 * 180) / Math.PI;
      const th4Deg = (th4 * 180) / Math.PI;

      return { jA, jB, jC, jD, muDeg, th3Deg, th4Deg, tracer };
    };

    const currentSol = computePositions(params.inputAngleTheta2Deg);
    const validSol = currentSol ?? {
      jA: { x: 0, y: 0 },
      jB: { x: a * Math.cos((params.inputAngleTheta2Deg * Math.PI) / 180), y: a * Math.sin((params.inputAngleTheta2Deg * Math.PI) / 180) },
      jC: { x: d - c * 0.7, y: c * 0.7 },
      jD: { x: d, y: 0 },
      muDeg: 90,
      th3Deg: 0,
      th4Deg: 90,
      tracer: { x: (a + d) / 2, y: 30 },
    };

    // Trace full coupler path over 360 degrees
    const path: Array<{ x: number; y: number }> = [];
    for (let deg = 0; deg <= 360; deg += 6) {
      const pos = computePositions(deg);
      if (pos) {
        path.push({
          x: parseFloat(pos.tracer.x.toFixed(1)),
          y: parseFloat(pos.tracer.y.toFixed(1)),
        });
      }
    }

    return {
      linkageType,
      isGrashof,
      transmissionAngleDeg: parseFloat(validSol.muDeg.toFixed(1)),
      isLockupOrToggle: currentSol === null,
      couplerAngleDeg: parseFloat(validSol.th3Deg.toFixed(1)),
      rockerAngleDeg: parseFloat(validSol.th4Deg.toFixed(1)),
      jointA: { x: parseFloat(validSol.jA.x.toFixed(1)), y: parseFloat(validSol.jA.y.toFixed(1)) },
      jointB: { x: parseFloat(validSol.jB.x.toFixed(1)), y: parseFloat(validSol.jB.y.toFixed(1)) },
      jointC: { x: parseFloat(validSol.jC.x.toFixed(1)), y: parseFloat(validSol.jC.y.toFixed(1)) },
      jointD: { x: parseFloat(validSol.jD.x.toFixed(1)), y: parseFloat(validSol.jD.y.toFixed(1)) },
      tracerPoint: { x: parseFloat(validSol.tracer.x.toFixed(1)), y: parseFloat(validSol.tracer.y.toFixed(1)) },
      fullCouplerPath: path,
    };
  }
}
