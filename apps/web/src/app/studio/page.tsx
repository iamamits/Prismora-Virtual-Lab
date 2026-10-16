/**
 * Prismora Studio — Interactive Computational Mathematics & Geometric Manifolds
 *
 * A flagship interactive mathematical environment featuring:
 * 1. Calculus & Continuous Analysis Workbench:
 *    - Real-time function graphing with configurable domain [-10, 10]
 *    - Interactive tangent line and derivative slope readout f'(x0)
 *    - Riemann sum partition visualizer (Left, Right, Midpoint, Trapezoid) with N rectangles
 *    - Definite integral calculation and error convergence analysis
 *
 * 2. 2D Linear Transformation Manifold:
 *    - Dynamic 2x2 matrix controls: [[a, b], [c, d]]
 *    - Transformation of basis vectors [i_hat, j_hat] to [M*i_hat, M*j_hat]
 *    - Parallelogram area scaling with signed determinant det(M) = ad - bc
 *    - Characteristic equation, trace, determinant, and real eigenvalue span axes
 *    - Geometric presets: Rotations, Shears, Scaling, Reflections, Projections
 *
 * 3. Autonomous Dynamical Systems & Phase Portraits:
 *    - Vector field visualization: Simple Harmonic, Van der Pol, Predator-Prey, Damped Pendulum
 *    - 4th-Order Runge-Kutta (RK4) numerical trajectory integration
 *    - Clickable phase space initial condition seeding
 *
 * Strict Light Theme styling with KaTeX typesetting.
 */

'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import { MathView, BugReportModal } from '@prismora/ui';
import {
  Activity,
  ArrowRight,
  Compass,
  Grid,
  Layers,
  LineChart,
  Maximize2,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  TrendingUp,
  Zap,
} from 'lucide-react';

type StudioMode = 'calculus' | 'linear-algebra' | 'vector-fields';

// -------------------------------------------------------------
// Calculus Function Definitions
// -------------------------------------------------------------
interface FunctionPreset {
  id: string;
  name: string;
  latex: string;
  eval: (x: number) => number;
  derivative: (x: number) => number;
  defaultDomain: [number, number];
}

const CALCULUS_PRESETS: FunctionPreset[] = [
  {
    id: 'damped-sine',
    name: 'Damped Oscillation',
    latex: 'f(x) = \\sin(x) \\cdot e^{-0.15 x}',
    eval: (x) => Math.sin(x) * Math.exp(-0.15 * x),
    derivative: (x) => Math.cos(x) * Math.exp(-0.15 * x) - 0.15 * Math.sin(x) * Math.exp(-0.15 * x),
    defaultDomain: [-2, 10],
  },
  {
    id: 'cubic-extrema',
    name: 'Cubic with Local Extrema',
    latex: 'f(x) = \\frac{1}{3}x^3 - x + 1',
    eval: (x) => (1 / 3) * Math.pow(x, 3) - x + 1,
    derivative: (x) => Math.pow(x, 2) - 1,
    defaultDomain: [-3, 3],
  },
  {
    id: 'witch-of-agnesi',
    name: 'Witch of Agnesi (Runge Curve)',
    latex: 'f(x) = \\frac{4}{1 + x^2}',
    eval: (x) => 4 / (1 + x * x),
    derivative: (x) => (-8 * x) / Math.pow(1 + x * x, 2),
    defaultDomain: [-5, 5],
  },
  {
    id: 'fourier-sum',
    name: 'Harmonic Superposition',
    latex: 'f(x) = \\cos(x) + 0.5\\sin(3x)',
    eval: (x) => Math.cos(x) + 0.5 * Math.sin(3 * x),
    derivative: (x) => -Math.sin(x) + 1.5 * Math.cos(3 * x),
    defaultDomain: [-4, 8],
  },
];

// -------------------------------------------------------------
// Linear Algebra Transformation Presets
// -------------------------------------------------------------
interface MatrixPreset {
  id: string;
  name: string;
  matrix: [number, number, number, number]; // [a, b, c, d] for [[a,b],[c,d]]
  description: string;
}

const MATRIX_PRESETS: MatrixPreset[] = [
  {
    id: 'identity',
    name: 'Identity Matrix',
    matrix: [1, 0, 0, 1],
    description: 'Preserves all vectors and spatial orientation unchanged.',
  },
  {
    id: 'rotation-45',
    name: 'Rotation (45°)',
    matrix: [Math.SQRT1_2, -Math.SQRT1_2, Math.SQRT1_2, Math.SQRT1_2],
    description: 'Rotates the manifold counter-clockwise by π/4 radians.',
  },
  {
    id: 'horizontal-shear',
    name: 'Horizontal Shear',
    matrix: [1, 1.2, 0, 1],
    description: 'Slants parallel planes along the horizontal axis with constant area.',
  },
  {
    id: 'scaling',
    name: 'Non-Uniform Scaling',
    matrix: [1.8, 0, 0, 0.7],
    description: 'Dilates the x-axis by 1.8x and contracts the y-axis by 0.7x.',
  },
  {
    id: 'reflection-y',
    name: 'Reflection across Y-Axis',
    matrix: [-1, 0, 0, 1],
    description: 'Inverts x-coordinates; determinant is -1 (orientation reversing).',
  },
  {
    id: 'singular-projection',
    name: 'Singular Matrix (Projection)',
    matrix: [1, 1.5, 0.5, 0.75],
    description: 'Linearly dependent columns; det = 0 collapses 2D space to a 1D line.',
  },
];

// -------------------------------------------------------------
// Dynamical System Presets
// -------------------------------------------------------------
interface DynamicalSystemPreset {
  id: string;
  name: string;
  latex: string;
  derivatives: (x: number, y: number) => [number, number]; // [dx/dt, dy/dt]
  domain: [number, number, number, number]; // [xMin, xMax, yMin, yMax]
}

const DYNAMICAL_PRESETS: DynamicalSystemPreset[] = [
  {
    id: 'harmonic-oscillator',
    name: 'Simple Harmonic Oscillator',
    latex: '\\dot{x} = y, \\quad \\dot{y} = -x',
    derivatives: (x, y) => [y, -x],
    domain: [-3, 3, -3, 3],
  },
  {
    id: 'van-der-pol',
    name: 'Van der Pol Oscillator (Limit Cycle)',
    latex: '\\dot{x} = y, \\quad \\dot{y} = 1.0(1 - x^2)y - x',
    derivatives: (x, y) => [y, 1.0 * (1 - x * x) * y - x],
    domain: [-3.5, 3.5, -3.5, 3.5],
  },
  {
    id: 'damped-pendulum',
    name: 'Nonlinear Damped Pendulum',
    latex: '\\dot{x} = y, \\quad \\dot{y} = -\\sin(x) - 0.25 y',
    derivatives: (x, y) => [y, -Math.sin(x) - 0.25 * y],
    domain: [-6, 6, -4, 4],
  },
];

export default function StudioPage() {
  const [studioMode, setStudioMode] = useState<StudioMode>('calculus');

  // -----------------------------------------------------------
  // Calculus State
  // -----------------------------------------------------------
  const [activeFuncId, setActiveFuncId] = useState<string>('damped-sine');
  const [probeX, setProbeX] = useState<number>(2.0);
  const [integralA, setIntegralA] = useState<number>(0.0);
  const [integralB, setIntegralB] = useState<number>(4.0);
  const [riemannPartitions, setRiemannPartitions] = useState<number>(12);
  const [riemannMethod, setRiemannMethod] = useState<'left' | 'right' | 'midpoint' | 'trapezoid'>('midpoint');

  // -----------------------------------------------------------
  // Linear Algebra State
  // -----------------------------------------------------------
  const [matrixA, setMatrixA] = useState<number>(1.2);
  const [matrixB, setMatrixB] = useState<number>(0.6);
  const [matrixC, setMatrixC] = useState<number>(0.3);
  const [matrixD, setMatrixD] = useState<number>(1.1);

  // -----------------------------------------------------------
  // Vector Fields State
  // -----------------------------------------------------------
  const [activeSystemId, setActiveSystemId] = useState<string>('harmonic-oscillator');
  const [trajectories, setTrajectories] = useState<Array<Array<[number, number]>>>([
    // Initial trajectory from (1.5, 1.5)
    [],
  ]);

  const activeFunction = useMemo(() => {
    return CALCULUS_PRESETS.find((f) => f.id === activeFuncId) ?? CALCULUS_PRESETS[0]!;
  }, [activeFuncId]);

  const activeSystem = useMemo(() => {
    return DYNAMICAL_PRESETS.find((s) => s.id === activeSystemId) ?? DYNAMICAL_PRESETS[0]!;
  }, [activeSystemId]);

  // Compute Calculus metrics
  const calculusMetrics = useMemo(() => {
    const f = activeFunction.eval;
    const fPrime = activeFunction.derivative;

    const y0 = f(probeX);
    const slope = fPrime(probeX);
    const angleDeg = (Math.atan(slope) * 180) / Math.PI;

    // Riemann Sum calculation
    const a = Math.min(integralA, integralB);
    const b = Math.max(integralA, integralB);
    const n = Math.max(2, riemannPartitions);
    const dx = (b - a) / n;

    let riemannSum = 0;
    const rectangles: Array<{ x: number; width: number; height: number; yVal: number }> = [];

    for (let i = 0; i < n; i++) {
      let sampleX = a + i * dx;
      if (riemannMethod === 'left') {
        sampleX = a + i * dx;
      } else if (riemannMethod === 'right') {
        sampleX = a + (i + 1) * dx;
      } else if (riemannMethod === 'midpoint') {
        sampleX = a + (i + 0.5) * dx;
      } else if (riemannMethod === 'trapezoid') {
        // Average of left and right
        const yL = f(a + i * dx);
        const yR = f(a + (i + 1) * dx);
        const avg = (yL + yR) / 2;
        riemannSum += avg * dx;
        rectangles.push({ x: a + i * dx, width: dx, height: avg, yVal: avg });
        continue;
      }

      const yVal = f(sampleX);
      riemannSum += yVal * dx;
      rectangles.push({ x: a + i * dx, width: dx, height: yVal, yVal });
    }

    // High precision adaptive Simpson quadrature for ground truth
    const simpsonSteps = 200;
    const simpH = (b - a) / simpsonSteps;
    let trueIntegral = f(a) + f(b);
    for (let i = 1; i < simpsonSteps; i++) {
      const x = a + i * simpH;
      trueIntegral += i % 2 === 0 ? 2 * f(x) : 4 * f(x);
    }
    trueIntegral = (trueIntegral * simpH) / 3;

    const errorPct =
      Math.abs(trueIntegral) > 1e-6
        ? Math.abs((riemannSum - trueIntegral) / trueIntegral) * 100
        : Math.abs(riemannSum - trueIntegral);

    return {
      y0,
      slope,
      angleDeg,
      riemannSum,
      trueIntegral,
      errorPct,
      rectangles,
      a,
      b,
      dx,
    };
  }, [activeFunction, probeX, integralA, integralB, riemannPartitions, riemannMethod]);

  // Compute Linear Algebra Metrics
  const linearMetrics = useMemo(() => {
    const a = matrixA;
    const b = matrixB;
    const c = matrixC;
    const d = matrixD;

    // Determinant
    const det = a * d - b * c;
    // Trace
    const trace = a + d;
    // Characteristic discriminant: D = tr^2 - 4*det
    const discriminant = trace * trace - 4 * det;

    let eigenvalues: [number, number] | null = null;
    let eigenvectors: Array<[number, number]> = [];

    if (discriminant >= 0) {
      const sqrtD = Math.sqrt(discriminant);
      const l1 = (trace + sqrtD) / 2;
      const l2 = (trace - sqrtD) / 2;
      eigenvalues = [l1, l2];

      // Compute span lines for eigenvectors
      // (A - lambda*I) * v = 0
      [l1, l2].forEach((lambda) => {
        // [a - lambda, b]
        if (Math.abs(b) > 1e-5) {
          eigenvectors.push([b, lambda - a]);
        } else if (Math.abs(c) > 1e-5) {
          eigenvectors.push([lambda - d, c]);
        } else {
          // Diagonal matrix
          eigenvectors.push(lambda === a ? [1, 0] : [0, 1]);
        }
      });
    }

    // Transformed basis vectors:
    // i_hat = [1, 0] -> [a, c]
    // j_hat = [0, 1] -> [b, d]
    const transformedI: [number, number] = [a, c];
    const transformedJ: [number, number] = [b, d];

    return {
      det,
      trace,
      discriminant,
      eigenvalues,
      eigenvectors,
      transformedI,
      transformedJ,
    };
  }, [matrixA, matrixB, matrixC, matrixD]);

  // Apply a matrix preset
  const applyMatrixPreset = (preset: MatrixPreset) => {
    setMatrixA(preset.matrix[0]);
    setMatrixB(preset.matrix[1]);
    setMatrixC(preset.matrix[2]);
    setMatrixD(preset.matrix[3]);
  };

  // Runge-Kutta 4th Order integrator for vector field trajectories
  const integrateRK4 = useCallback(
    (x0: number, y0: number, steps: number = 300, dt: number = 0.03) => {
      const trajectory: Array<[number, number]> = [[x0, y0]];
      let x = x0;
      let y = y0;
      const f = activeSystem.derivatives;

      for (let i = 0; i < steps; i++) {
        const [k1x, k1y] = f(x, y);
        const [k2x, k2y] = f(x + 0.5 * dt * k1x, y + 0.5 * dt * k1y);
        const [k3x, k3y] = f(x + 0.5 * dt * k2x, y + 0.5 * dt * k2y);
        const [k4x, k4y] = f(x + dt * k3x, y + dt * k3y);

        x += (dt / 6) * (k1x + 2 * k2x + 2 * k3x + k4x);
        y += (dt / 6) * (k1y + 2 * k2y + 2 * k3y + k4y);

        if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 20 || Math.abs(y) > 20) {
          break;
        }

        trajectory.push([x, y]);
      }

      return trajectory;
    },
    [activeSystem]
  );

  return (
    <div className="flex flex-col h-[calc(100dvh-3.5rem)] w-full bg-[#F8FAFC] text-zinc-900 overflow-hidden select-none">
      {/* Studio Header Bar */}
      <header className="h-12 border-b border-zinc-200 bg-white px-4 flex items-center justify-between shrink-0 z-40 shadow-xs">
        <div className="flex items-center gap-3">
          <nav className="flex items-center gap-1.5 text-xs text-zinc-600 font-medium">
            <Link href="/explore" className="hover:text-zinc-900 transition-colors">
              Explore
            </Link>
            <span className="text-zinc-400">/</span>
            <span className="text-indigo-600 font-bold">Prismora Studio</span>
          </nav>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 hidden md:inline">
            Computational Mathematics & Manifolds
          </span>
        </div>

        {/* Studio Modes Selector */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200 text-xs">
          <button
            onClick={() => setStudioMode('calculus')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
              studioMode === 'calculus'
                ? 'bg-white text-indigo-600 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Continuous Calculus</span>
          </button>
          <button
            onClick={() => setStudioMode('linear-algebra')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
              studioMode === 'linear-algebra'
                ? 'bg-white text-indigo-600 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Linear Transformations</span>
          </button>
          <button
            onClick={() => setStudioMode('vector-fields')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md font-semibold transition-all ${
              studioMode === 'vector-fields'
                ? 'bg-white text-indigo-600 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Vector Fields & RK4</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <BugReportModal simulationId="prismora-studio-math" moduleName="Prismora Mathematical Studio" />
        </div>
      </header>

      {/* Main Studio Body */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
        {/* ================= MODE 1: CONTINUOUS CALCULUS ================= */}
        {studioMode === 'calculus' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Visual Graph Viewport (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-bold text-zinc-900 text-sm">{activeFunction.name}</h3>
                      <div className="text-xs text-zinc-600 mt-0.5">
                        <MathView math={activeFunction.latex} />
                      </div>
                    </div>
                  </div>

                  {/* Function Presets dropdown */}
                  <select
                    value={activeFuncId}
                    onChange={(e) => {
                      setActiveFuncId(e.target.value);
                      const f = CALCULUS_PRESETS.find((p) => p.id === e.target.value);
                      if (f) {
                        setProbeX(f.defaultDomain[0] + (f.defaultDomain[1] - f.defaultDomain[0]) * 0.4);
                        setIntegralA(f.defaultDomain[0] + 0.5);
                        setIntegralB(f.defaultDomain[0] + (f.defaultDomain[1] - f.defaultDomain[0]) * 0.7);
                      }
                    }}
                    className="border border-zinc-300 rounded-lg text-xs px-2.5 py-1.5 font-semibold bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {CALCULUS_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SVG Graph Canvas */}
                <div className="w-full aspect-16/9 bg-slate-50 border border-zinc-200 rounded-lg relative overflow-hidden flex items-center justify-center p-2">
                  <svg viewBox="0 0 700 400" className="w-full h-full">
                    {/* Background Grid */}
                    <defs>
                      <pattern id="calc-grid" width="35" height="35" patternUnits="userSpaceOnUse">
                        <circle cx="17.5" cy="17.5" r="0.75" fill="#cbd5e1" />
                      </pattern>
                    </defs>
                    <rect width="700" height="400" fill="url(#calc-grid)" />

                    {/* Scale Mapping Constants */}
                    {(() => {
                      const [xMin, xMax] = activeFunction.defaultDomain;
                      const yMin = -2.5;
                      const yMax = 3.5;

                      const toSvgX = (x: number) => 50 + ((x - xMin) / (xMax - xMin)) * 600;
                      const toSvgY = (y: number) => 360 - ((y - yMin) / (yMax - yMin)) * 320;

                      // Coordinate axes
                      const originX = toSvgX(0);
                      const originY = toSvgY(0);

                      // Curve Polyline
                      const samples = 140;
                      const step = (xMax - xMin) / samples;
                      const curvePoints: string[] = [];
                      for (let i = 0; i <= samples; i++) {
                        const x = xMin + i * step;
                        const y = activeFunction.eval(x);
                        curvePoints.push(`${toSvgX(x).toFixed(1)},${toSvgY(y).toFixed(1)}`);
                      }

                      // Tangent Line at probeX
                      const tX1 = probeX - 2.0;
                      const tX2 = probeX + 2.0;
                      const tY1 = calculusMetrics.y0 + calculusMetrics.slope * (tX1 - probeX);
                      const tY2 = calculusMetrics.y0 + calculusMetrics.slope * (tX2 - probeX);

                      return (
                        <>
                          {/* Shaded Riemann Partition Rectangles */}
                          {calculusMetrics.rectangles.map((r, idx) => {
                            const rx = toSvgX(r.x);
                            const rw = toSvgX(r.x + r.width) - rx;
                            const ry0 = toSvgY(0);
                            const ryVal = toSvgY(r.yVal);
                            const rTop = Math.min(ry0, ryVal);
                            const rHeight = Math.abs(ryVal - ry0);

                            return (
                              <rect
                                key={idx}
                                x={rx}
                                y={rTop}
                                width={rw}
                                height={rHeight}
                                className="fill-indigo-400/25 stroke-indigo-500/50 stroke-1"
                              />
                            );
                          })}

                          {/* Axes */}
                          <line x1="50" y1={originY} x2="650" y2={originY} stroke="#94a3b8" strokeWidth="1.5" />
                          <line x1={originX} y1="40" x2={originX} y2="360" stroke="#94a3b8" strokeWidth="1.5" />

                          {/* Function Curve */}
                          <polyline
                            fill="none"
                            stroke="#4f46e5"
                            strokeWidth="2.5"
                            points={curvePoints.join(' ')}
                          />

                          {/* Tangent Line */}
                          <line
                            x1={toSvgX(tX1)}
                            y1={toSvgY(tY1)}
                            x2={toSvgX(tX2)}
                            y2={toSvgY(tY2)}
                            stroke="#e11d48"
                            strokeWidth="2"
                            strokeDasharray="4 4"
                          />

                          {/* Probe Marker Point */}
                          <circle
                            cx={toSvgX(probeX)}
                            cy={toSvgY(calculusMetrics.y0)}
                            r="6"
                            fill="#e11d48"
                            stroke="#ffffff"
                            strokeWidth="2"
                          />

                          {/* Tangent Slope Label */}
                          <text
                            x={toSvgX(probeX) + 10}
                            y={toSvgY(calculusMetrics.y0) - 10}
                            className="text-[11px] font-mono font-bold fill-rose-600"
                          >
                            f&apos;({probeX.toFixed(2)}) = {calculusMetrics.slope.toFixed(3)} (θ = {calculusMetrics.angleDeg.toFixed(1)}°)
                          </text>

                          {/* Integration Bounds Markers */}
                          <line
                            x1={toSvgX(calculusMetrics.a)}
                            y1="40"
                            x2={toSvgX(calculusMetrics.a)}
                            y2="360"
                            stroke="#6366f1"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                          <text x={toSvgX(calculusMetrics.a)} y="375" textAnchor="middle" className="text-[10px] font-mono font-bold fill-indigo-600">
                            a = {calculusMetrics.a.toFixed(1)}
                          </text>

                          <line
                            x1={toSvgX(calculusMetrics.b)}
                            y1="40"
                            x2={toSvgX(calculusMetrics.b)}
                            y2="360"
                            stroke="#6366f1"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                          <text x={toSvgX(calculusMetrics.b)} y="375" textAnchor="middle" className="text-[10px] font-mono font-bold fill-indigo-600">
                            b = {calculusMetrics.b.toFixed(1)}
                          </text>
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Live Readouts Card */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Instantaneous Derivative</span>
                    <span className="text-base font-mono font-bold text-rose-600">
                      f&apos;(x₀) = {calculusMetrics.slope.toFixed(4)}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Riemann Sum (S_N)</span>
                    <span className="text-base font-mono font-bold text-indigo-600">
                      {calculusMetrics.riemannSum.toFixed(4)}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Definite Integral (Exact)</span>
                    <span className="text-base font-mono font-bold text-emerald-600">
                      ∫ f(x)dx = {calculusMetrics.trueIntegral.toFixed(4)}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Approximation Error</span>
                    <span className="text-base font-mono font-bold text-amber-600">
                      {calculusMetrics.errorPct.toFixed(2)} %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Calculus Controls (1 col) */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-200 pb-2">
                  Calculus Parameters
                </h3>

                {/* Probe Point Slider */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Derivative Probe Point (x₀)</span>
                    <span className="font-mono text-rose-600">{probeX.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={activeFunction.defaultDomain[0]}
                    max={activeFunction.defaultDomain[1]}
                    step="0.05"
                    value={probeX}
                    onChange={(e) => setProbeX(parseFloat(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* Integral Bound A */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Lower Limit (a)</span>
                    <span className="font-mono text-indigo-600">{integralA.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={activeFunction.defaultDomain[0]}
                    max={activeFunction.defaultDomain[1]}
                    step="0.1"
                    value={integralA}
                    onChange={(e) => setIntegralA(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Integral Bound B */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Upper Limit (b)</span>
                    <span className="font-mono text-indigo-600">{integralB.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={activeFunction.defaultDomain[0]}
                    max={activeFunction.defaultDomain[1]}
                    step="0.1"
                    value={integralB}
                    onChange={(e) => setIntegralB(parseFloat(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Riemann Method */}
                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">
                    Riemann Sum Partition Rule:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-xs">
                    {(['left', 'right', 'midpoint', 'trapezoid'] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setRiemannMethod(m)}
                        className={`py-1.5 px-2 rounded-md font-semibold capitalize border transition-colors ${
                          riemannMethod === m
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-2xs'
                            : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Riemann Partitions N */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Partitions (N)</span>
                    <span className="font-mono text-zinc-900">{riemannPartitions}</span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="60"
                    step="1"
                    value={riemannPartitions}
                    onChange={(e) => setRiemannPartitions(parseInt(e.target.value))}
                    className="w-full accent-indigo-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600 font-mono mt-1">
                    <span>N = 2</span>
                    <span>N = 60</span>
                  </div>
                </div>
              </div>

              {/* Theory Summary */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-xs text-zinc-700 space-y-2">
                <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Fundamental Theorem of Calculus
                </h4>
                <p className="text-zinc-600 leading-relaxed">
                  As the partition count <MathView math="N \to \infty" /> (mesh size <MathView math="\Delta x \to 0" />), the Riemann summation strictly converges to the true definite integral:
                </p>
                <div className="bg-white p-2 rounded border border-indigo-100 text-center font-mono">
                  <MathView math="\lim_{N \to \infty} \sum_{i=1}^N f(x_i^*) \Delta x = \int_a^b f(x)\,dx" display />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODE 2: LINEAR TRANSFORMATIONS ================= */}
        {studioMode === 'linear-algebra' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* 2D Vector Space Viewport (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Grid className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-bold text-zinc-900 text-sm">2D Linear Transformation Manifold</h3>
                      <span className="text-xs text-zinc-600">
                        Mapping <MathView math="\mathbb{R}^2 \to \mathbb{R}^2" /> via matrix M
                      </span>
                    </div>
                  </div>

                  {/* Preset Pills */}
                  <div className="flex items-center gap-1 overflow-x-auto max-w-md">
                    {MATRIX_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => applyMatrixPreset(p)}
                        className="text-[11px] font-bold px-2 py-1 rounded bg-zinc-100 text-zinc-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors whitespace-nowrap"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* SVG Vector Space Canvas */}
                <div className="w-full aspect-16/9 bg-slate-50 border border-zinc-200 rounded-lg relative overflow-hidden flex items-center justify-center p-2">
                  <svg viewBox="0 0 600 400" className="w-full h-full">
                    {/* Origin is at (300, 200), scale is 50px per unit */}
                    <defs>
                      <marker id="arrow-i" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                      </marker>
                      <marker id="arrow-j" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                      </marker>
                    </defs>

                    {/* Coordinate axes */}
                    <line x1="20" y1="200" x2="580" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />
                    <line x1="300" y1="20" x2="300" y2="380" stroke="#cbd5e1" strokeWidth="1.5" />

                    {/* Transformed Grid Lines */}
                    {(() => {
                      const scale = 50;
                      const cx = 300;
                      const cy = 200;

                      const toSvg = (x: number, y: number) => ({
                        x: cx + x * scale,
                        y: cy - y * scale,
                      });

                      // Transformed Parallelogram spanned by M*i and M*j:
                      // Vertices: (0,0), M*i, M*i + M*j, M*j
                      const p0 = toSvg(0, 0);
                      const p1 = toSvg(linearMetrics.transformedI[0], linearMetrics.transformedI[1]);
                      const p2 = toSvg(
                        linearMetrics.transformedI[0] + linearMetrics.transformedJ[0],
                        linearMetrics.transformedI[1] + linearMetrics.transformedJ[1]
                      );
                      const p3 = toSvg(linearMetrics.transformedJ[0], linearMetrics.transformedJ[1]);

                      // Eigenvector lines if real
                      const eigenLines = linearMetrics.eigenvectors.map((ev, idx) => {
                        const len = Math.hypot(ev[0], ev[1]);
                        if (len < 1e-4) return null;
                        const nx = ev[0] / len;
                        const ny = ev[1] / len;
                        const pStart = toSvg(-4 * nx, -4 * ny);
                        const pEnd = toSvg(4 * nx, 4 * ny);
                        return (
                          <line
                            key={idx}
                            x1={pStart.x}
                            y1={pStart.y}
                            x2={pEnd.x}
                            y2={pEnd.y}
                            stroke="#8b5cf6"
                            strokeWidth="1.5"
                            strokeDasharray="4 4"
                          />
                        );
                      });

                      return (
                        <>
                          {/* Transformed Parallelogram Area */}
                          <polygon
                            points={`${p0.x},${p0.y} ${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
                            className={
                              linearMetrics.det >= 0
                                ? 'fill-indigo-500/20 stroke-indigo-600 stroke-[1.5]'
                                : 'fill-amber-500/20 stroke-amber-600 stroke-[1.5]'
                            }
                          />

                          {/* Eigenvector invariant axes */}
                          {eigenLines}

                          {/* Transformed Basis Vector i_hat (Green) */}
                          <line
                            x1={p0.x}
                            y1={p0.y}
                            x2={p1.x}
                            y2={p1.y}
                            stroke="#10b981"
                            strokeWidth="3"
                            markerEnd="url(#arrow-i)"
                          />
                          <text x={p1.x + 8} y={p1.y} className="text-xs font-mono font-bold fill-emerald-600">
                            M î = [{matrixA.toFixed(2)}, {matrixC.toFixed(2)}]ᵀ
                          </text>

                          {/* Transformed Basis Vector j_hat (Red) */}
                          <line
                            x1={p0.x}
                            y1={p0.y}
                            x2={p3.x}
                            y2={p3.y}
                            stroke="#ef4444"
                            strokeWidth="3"
                            markerEnd="url(#arrow-j)"
                          />
                          <text x={p3.x + 8} y={p3.y} className="text-xs font-mono font-bold fill-rose-600">
                            M ĵ = [{matrixB.toFixed(2)}, {matrixD.toFixed(2)}]ᵀ
                          </text>

                          {/* Origin dot */}
                          <circle cx={cx} cy={cy} r="4" fill="#334155" />
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Manifold Diagnostics Readout */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Determinant det(M)</span>
                    <span className="text-base font-mono font-bold text-indigo-600">
                      {linearMetrics.det.toFixed(3)}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Trace tr(M)</span>
                    <span className="text-base font-mono font-bold text-zinc-900">
                      {linearMetrics.trace.toFixed(3)}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Orientation</span>
                    <span className={`text-base font-mono font-bold ${linearMetrics.det >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {linearMetrics.det > 0 ? 'Preserved' : linearMetrics.det < 0 ? 'Reversed (Mirror)' : 'Collapsed (Rank 1)'}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-zinc-200 rounded-lg p-3 text-center">
                    <span className="text-[10px] uppercase font-bold text-zinc-600 block">Eigenvalues (λ)</span>
                    <span className="text-base font-mono font-bold text-purple-600">
                      {linearMetrics.eigenvalues
                        ? `${linearMetrics.eigenvalues[0].toFixed(2)}, ${linearMetrics.eigenvalues[1].toFixed(2)}`
                        : 'Complex (Rotation)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Matrix Adjustment Sliders (1 col) */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-4">
                <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-200 pb-2">
                  Transformation Matrix Entries
                </h3>

                <div className="bg-slate-50 p-3 rounded-lg border border-zinc-200 flex items-center justify-center font-mono text-base font-bold text-zinc-800">
                  <span className="text-2xl mr-2 text-zinc-400">[</span>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-center">
                    <span className="text-emerald-600">a = {matrixA.toFixed(2)}</span>
                    <span className="text-rose-600">b = {matrixB.toFixed(2)}</span>
                    <span className="text-emerald-600">c = {matrixC.toFixed(2)}</span>
                    <span className="text-rose-600">d = {matrixD.toFixed(2)}</span>
                  </div>
                  <span className="text-2xl ml-2 text-zinc-400">]</span>
                </div>

                {/* Entry a */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Entry a (î_x component)</span>
                    <span className="font-mono text-emerald-600">{matrixA.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2.5"
                    max="2.5"
                    step="0.05"
                    value={matrixA}
                    onChange={(e) => setMatrixA(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Entry b */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Entry b (ĵ_x component)</span>
                    <span className="font-mono text-rose-600">{matrixB.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2.5"
                    max="2.5"
                    step="0.05"
                    value={matrixB}
                    onChange={(e) => setMatrixB(parseFloat(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>

                {/* Entry c */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Entry c (î_y component)</span>
                    <span className="font-mono text-emerald-600">{matrixC.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2.5"
                    max="2.5"
                    step="0.05"
                    value={matrixC}
                    onChange={(e) => setMatrixC(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>

                {/* Entry d */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-zinc-700 mb-1">
                    <span>Entry d (ĵ_y component)</span>
                    <span className="font-mono text-rose-600">{matrixD.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min="-2.5"
                    max="2.5"
                    step="0.05"
                    value={matrixD}
                    onChange={(e) => setMatrixD(parseFloat(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Geometric Insight */}
              <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 text-xs text-zinc-700 space-y-2">
                <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  Geometric Area Scaling
                </h4>
                <p className="text-zinc-600 leading-relaxed">
                  The determinant <MathView math="\det(M)" /> represents the factor by which areas are scaled under this transformation. If <MathView math="\det(M) = 0" />, the transformation collapses the 2-dimensional plane into a lower-dimensional subspace (line or point).
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODE 3: VECTOR FIELDS & PHASE PORTRAITS ================= */}
        {studioMode === 'vector-fields' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Phase Portrait Canvas (2 cols) */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-zinc-200 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Compass className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h3 className="font-bold text-zinc-900 text-sm">{activeSystem.name}</h3>
                      <div className="text-xs text-zinc-600 mt-0.5">
                        <MathView math={activeSystem.latex} />
                      </div>
                    </div>
                  </div>

                  <select
                    value={activeSystemId}
                    onChange={(e) => {
                      setActiveSystemId(e.target.value);
                      setTrajectories([]);
                    }}
                    className="border border-zinc-300 rounded-lg text-xs px-2.5 py-1.5 font-semibold bg-white text-zinc-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    {DYNAMICAL_PRESETS.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* SVG Vector Field Canvas */}
                <div
                  className="w-full aspect-16/9 bg-slate-50 border border-zinc-200 rounded-lg relative overflow-hidden flex items-center justify-center cursor-crosshair"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const clickX = e.clientX - rect.left;
                    const clickY = e.clientY - rect.top;

                    const [xMin, xMax, yMin, yMax] = activeSystem.domain;
                    const simX = xMin + (clickX / rect.width) * (xMax - xMin);
                    const simY = yMax - (clickY / rect.height) * (yMax - yMin);

                    const newTraj = integrateRK4(simX, simY);
                    setTrajectories((t) => [...t, newTraj]);
                  }}
                >
                  <svg viewBox="0 0 640 360" className="w-full h-full">
                    {/* Background Grid */}
                    <defs>
                      <marker id="arrow-field" viewBox="0 0 8 8" refX="4" refY="4" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                        <path d="M 0 0 L 8 4 L 0 8 z" fill="#64748b" />
                      </marker>
                    </defs>

                    {/* Vector field arrows */}
                    {(() => {
                      const [xMin, xMax, yMin, yMax] = activeSystem.domain;
                      const cols = 21;
                      const rows = 13;
                      const dx = (xMax - xMin) / (cols - 1);
                      const dy = (yMax - yMin) / (rows - 1);

                      const toSvgX = (x: number) => ((x - xMin) / (xMax - xMin)) * 640;
                      const toSvgY = (y: number) => 360 - ((y - yMin) / (yMax - yMin)) * 360;

                      const arrows: React.ReactElement[] = [];

                      for (let c = 0; c < cols; c++) {
                        for (let r = 0; r < rows; r++) {
                          const x = xMin + c * dx;
                          const y = yMin + r * dy;
                          const [vx, vy] = activeSystem.derivatives(x, y);
                          const mag = Math.hypot(vx, vy);

                          if (mag < 1e-4) continue;

                          // Normalized arrow length
                          const len = 12;
                          const nx = (vx / mag) * len;
                          const ny = (vy / mag) * len;

                          const sx = toSvgX(x);
                          const sy = toSvgY(y);

                          arrows.push(
                            <line
                              key={`${c}-${r}`}
                              x1={sx}
                              y1={sy}
                              x2={sx + nx}
                              y2={sy - ny}
                              stroke="#94a3b8"
                              strokeWidth="1.2"
                              markerEnd="url(#arrow-field)"
                            />
                          );
                        }
                      }

                      // Trajectories
                      const trajectoryLines = trajectories.map((traj, idx) => {
                        const points = traj.map((pt) => `${toSvgX(pt[0]).toFixed(1)},${toSvgY(pt[1]).toFixed(1)}`).join(' ');
                        return (
                          <polyline
                            key={idx}
                            fill="none"
                            stroke="#6366f1"
                            strokeWidth="2.5"
                            points={points}
                          />
                        );
                      });

                      return (
                        <>
                          {arrows}
                          {trajectoryLines}
                        </>
                      );
                    })()}
                  </svg>
                  <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-xs text-[10px] font-semibold text-zinc-600 px-2 py-1 rounded border border-zinc-200">
                    Click anywhere on the field to seed an RK4 trajectory
                  </div>
                </div>

                <div className="flex justify-between items-center mt-3 text-xs">
                  <span className="text-zinc-600">
                    {trajectories.length} trajectories simulated via 4th-Order Runge-Kutta
                  </span>
                  <button
                    onClick={() => setTrajectories([])}
                    className="flex items-center gap-1 text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2.5 py-1 rounded transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Clear Trajectories
                  </button>
                </div>
              </div>
            </div>

            {/* Vector Field Info & Presets (1 col) */}
            <div className="space-y-4">
              <div className="bg-white rounded-xl border border-zinc-200 p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-zinc-900 text-sm border-b border-zinc-200 pb-2">
                  Dynamical System Properties
                </h3>
                <p className="text-xs text-zinc-600 leading-relaxed">
                  Phase portraits illustrate the topological structure of ordinary differential equations. Limit cycles, attractors, saddle points, and centers emerge naturally from the velocity vector field <MathView math="(\dot{x}, \dot{y})" />.
                </p>

                <div className="space-y-2 pt-2">
                  {DYNAMICAL_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setActiveSystemId(p.id);
                        setTrajectories([]);
                      }}
                      className={`w-full text-left p-3 rounded-lg border text-xs transition-colors ${
                        activeSystemId === p.id
                          ? 'border-indigo-400 bg-indigo-50/60 font-semibold text-indigo-900'
                          : 'border-zinc-200 hover:bg-zinc-50 text-zinc-700'
                      }`}
                    >
                      <div className="font-bold">{p.name}</div>
                      <div className="text-[11px] text-zinc-600 mt-1 font-mono">{p.latex}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
