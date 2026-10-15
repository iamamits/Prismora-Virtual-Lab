'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  projectileMotionModel,
  SimulationController,
  type ProjectileMotionParameters,
  type ProjectileMotionState,
  type ExperimentConfiguration,
  degreesToRadians,
  radiansToDegrees,
} from '@prismora/simulation-core';
import {
  ParameterControl,
  MeasurementDisplay,
  VectorDisplay,
  SimulationControls,
  Button,
  Badge,
} from '@prismora/ui';
import { ProjectileCanvas } from '@/components/simulation/projectile-canvas';
import { LiveEquations } from '@/components/simulation/live-equations';
import { TrajectoryGraph } from '@/components/simulation/trajectory-graph';
import { ObservationPanel, type Observation } from '@/components/simulation/observation-panel';
import { ExportDialog } from '@/components/simulation/export-dialog';
import {
  RotateCcw,
  Share2,
  Sliders,
  Eye,
  BookOpen,
  Info,
  CheckCircle2,
} from 'lucide-react';

// Preset physical scenarios
const PRESETS: Record<string, { name: string; params: Partial<ProjectileMotionParameters> }> = {
  standard: {
    name: 'Earth 45° Max Range',
    params: { initialSpeed: 20, launchAngle: Math.PI / 4, gravity: 9.81, initialHeight: 0 },
  },
  cliff: {
    name: 'High Cliff Launch (25m)',
    params: { initialSpeed: 15, launchAngle: degreesToRadians(30), gravity: 9.81, initialHeight: 25 },
  },
  horizontal: {
    name: 'Pure Horizontal Drop',
    params: { initialSpeed: 25, launchAngle: 0, gravity: 9.81, initialHeight: 20 },
  },
  moon: {
    name: 'Moon Gravity (1.62 m/s²)',
    params: { initialSpeed: 20, launchAngle: degreesToRadians(45), gravity: 1.62, initialHeight: 0 },
  },
  mars: {
    name: 'Mars Gravity (3.71 m/s²)',
    params: { initialSpeed: 20, launchAngle: degreesToRadians(45), gravity: 3.71, initialHeight: 0 },
  },
  zerog: {
    name: 'Zero-G Orbital Path',
    params: { initialSpeed: 15, launchAngle: degreesToRadians(30), gravity: 0, initialHeight: 10 },
  },
};

export default function ProjectileMotionPage() {
  // Controller singleton ref
  const controllerRef = useRef<SimulationController<ProjectileMotionParameters, ProjectileMotionState> | null>(null);

  if (!controllerRef.current) {
    controllerRef.current = new SimulationController(projectileMotionModel, {
      timeStep: 1 / 60,
      recordSnapshots: true,
      snapshotInterval: 0.05,
    });
    controllerRef.current.initialize(projectileMotionModel.getDefaultParameters());
  }

  const controller = controllerRef.current;

  // React state synchronized with controller
  const [params, setParams] = useState<ProjectileMotionParameters>(controller.parameters);
  const [angleDegrees, setAngleDegrees] = useState<number>(
    Math.round(radiansToDegrees(controller.parameters.launchAngle)),
  );
  const [state, setState] = useState<ProjectileMotionState>(controller.currentState);
  const [controllerStatus, setControllerStatus] = useState(controller.status);
  const [playbackSpeed, setPlaybackSpeed] = useState(controller.playbackSpeed);
  const [snapshots, setSnapshots] = useState<readonly ProjectileMotionState[]>(controller.snapshots);

  // Visualization options
  const [showVelocity, setShowVelocity] = useState(true);
  const [showAcceleration, setShowAcceleration] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [vectorScale, setVectorScale] = useState(1.0);
  const [activeTab, setActiveTab] = useState<'controls' | 'equations' | 'graphs' | 'observations'>('controls');

  // Observations log
  const [observations, setObservations] = useState<Observation[]>([]);

  // Export/Import modal
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Computed measurements
  const measurements = controller.getMeasurements();
  const terminalTime = controller.terminalTime;
  const maxHeight = measurements['maxHeight']?.value ?? 0;
  const range = measurements['range']?.value ?? 0;
  const flightTime = measurements['flightTime']?.value ?? null;

  // Animation loop
  const lastTimeRef = useRef<number | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const loop = useCallback((now: number) => {
    if (lastTimeRef.current !== null) {
      const deltaMs = Math.min(100, now - lastTimeRef.current);
      if (controller.status === 'running') {
        const nextState = controller.tick(deltaMs);
        setState(nextState);
        setSnapshots([...controller.snapshots]);
        setControllerStatus(controller.status);
      }
    }
    lastTimeRef.current = now;
    reqIdRef.current = requestAnimationFrame(loop);
  }, [controller]);

  useEffect(() => {
    reqIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
    };
  }, [loop]);

  // Parameter change handler
  const handleUpdateParameter = (field: keyof ProjectileMotionParameters, value: number) => {
    const newParams = { ...params, [field]: value };
    controller.updateParameters(newParams);
    setParams(newParams);
    setState(controller.currentState);
    setSnapshots([...controller.snapshots]);
    setControllerStatus(controller.status);
  };

  const handleAngleChange = (degrees: number) => {
    setAngleDegrees(degrees);
    handleUpdateParameter('launchAngle', degreesToRadians(degrees));
  };

  // Playback control handlers
  const handlePlay = () => {
    controller.play();
    setControllerStatus(controller.status);
  };

  const handlePause = () => {
    controller.pause();
    setControllerStatus(controller.status);
  };

  const handleStep = () => {
    const nextState = controller.step();
    setState(nextState);
    setSnapshots([...controller.snapshots]);
    setControllerStatus(controller.status);
  };

  const handleReset = () => {
    controller.reset();
    setState(controller.currentState);
    setSnapshots([...controller.snapshots]);
    setControllerStatus(controller.status);
  };

  const handleSeek = (time: number) => {
    const nextState = controller.seekTo(time);
    setState(nextState);
    setControllerStatus(controller.status);
  };

  const handleSpeedChange = (speed: number) => {
    controller.setPlaybackSpeed(speed);
    setPlaybackSpeed(speed);
  };

  // Preset selector
  const handleApplyPreset = (presetKey: string) => {
    const preset = PRESETS[presetKey];
    if (!preset) return;
    const newParams: ProjectileMotionParameters = {
      ...params,
      ...preset.params,
    };
    controller.initialize(newParams);
    setParams(newParams);
    setAngleDegrees(Math.round(radiansToDegrees(newParams.launchAngle)));
    setState(controller.currentState);
    setSnapshots([...controller.snapshots]);
    setControllerStatus(controller.status);
  };

  // Import handler
  const handleImportConfiguration = (config: ExperimentConfiguration<ProjectileMotionParameters>): boolean => {
    const res = controller.importConfiguration(config);
    if (res.valid) {
      setParams(controller.parameters);
      setAngleDegrees(Math.round(radiansToDegrees(controller.parameters.launchAngle)));
      setState(controller.currentState);
      setSnapshots([...controller.snapshots]);
      setControllerStatus(controller.status);
      return true;
    }
    return false;
  };

  return (
    <div className="flex-1 flex flex-col bg-zinc-50 dark:bg-[#070b12] text-zinc-900 dark:text-zinc-100 min-h-screen">
      {/* Top Header Strip */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">Ideal Projectile Motion</h1>
              <Badge variant="default" className="text-[10px] font-mono uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                Flagship Model
              </Badge>
              <Badge variant="outline" className="text-[10px] text-zinc-500 font-mono">
                SI Units
              </Badge>
            </div>
            <p className="text-xs text-zinc-400">
              Analytical kinematics simulation without drag under uniform gravitational acceleration.
            </p>
          </div>
        </div>

        {/* Preset scenarios & Share/Export buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-zinc-400 text-[11px] hidden sm:inline">Presets:</span>
            <select
              aria-label="Preset physical scenarios"
              onChange={(e) => handleApplyPreset(e.target.value)}
              className="text-xs font-medium py-1 px-2 rounded border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              defaultValue="standard"
            >
              {Object.entries(PRESETS).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.name}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={handleReset} className="h-8 text-xs">
            <RotateCcw className="w-3.5 h-3.5 mr-1" />
            Reset
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsExportOpen(true)}
            className="h-8 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" />
            Export / Import
          </Button>
        </div>
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left / Center Viewport (Interactive Canvas & Primary Strip) */}
        <div className="flex-1 flex flex-col min-w-0 border-r border-zinc-200 dark:border-zinc-800">
          {/* Canvas Area */}
          <div className="flex-1 relative min-h-[380px] lg:min-h-[480px] bg-[#090d16] overflow-hidden flex flex-col">
            <ProjectileCanvas
              currentState={state}
              trajectoryHistory={snapshots}
              initialHeight={params.initialHeight}
              launchAngle={params.launchAngle}
              maxRange={range}
              maxHeight={maxHeight}
              showVelocityVector={showVelocity}
              showAccelerationVector={showAcceleration}
              showTrajectoryTrace={showTrajectory}
              showGrid={showGrid}
              vectorScale={vectorScale}
            />

            {/* In-canvas HUD quick metrics overlay */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2 pointer-events-none">
              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-zinc-300 border border-white/10 flex items-center gap-2">
                <span className="text-zinc-500">t:</span>
                <span className="text-white font-bold">{state.time.toFixed(2)}s</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-zinc-300 border border-white/10 flex items-center gap-2">
                <span className="text-zinc-500">pos:</span>
                <span className="text-white">({state.position.x.toFixed(1)}m, {state.position.y.toFixed(1)}m)</span>
              </div>
              <div className="bg-black/60 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-zinc-300 border border-white/10 flex items-center gap-2">
                <span className="text-zinc-500">|v|:</span>
                <span className="text-blue-400 font-bold">{state.speed.toFixed(1)} m/s</span>
              </div>
              {state.terminated && (
                <div className="bg-emerald-950/80 backdrop-blur-md px-2.5 py-1 rounded text-[11px] font-mono text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Ground Contact</span>
                </div>
              )}
            </div>

            {/* Quick View toggles bar */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-md border border-white/10 text-xs">
              <button
                onClick={() => setShowVelocity(!showVelocity)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  showVelocity ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Toggle Velocity Vector"
              >
                v-vector
              </button>
              <button
                onClick={() => setShowAcceleration(!showAcceleration)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  showAcceleration ? 'bg-orange-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Toggle Acceleration Vector"
              >
                a-vector
              </button>
              <button
                onClick={() => setShowTrajectory(!showTrajectory)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  showTrajectory ? 'bg-cyan-600 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Toggle Trajectory Trace"
              >
                trace
              </button>
              <button
                onClick={() => setShowGrid(!showGrid)}
                className={`px-2 py-0.5 rounded text-[10px] font-mono transition-colors ${
                  showGrid ? 'bg-zinc-700 text-white' : 'text-zinc-400 hover:text-white'
                }`}
                title="Toggle Coordinate Grid"
              >
                grid
              </button>
            </div>
          </div>

          {/* Bottom Simulation Controls Bar */}
          <div className="p-3 bg-white dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800">
            <SimulationControls
              status={controllerStatus}
              currentTime={state.time}
              terminalTime={terminalTime}
              playbackSpeed={playbackSpeed}
              onPlay={handlePlay}
              onPause={handlePause}
              onStep={handleStep}
              onReset={handleReset}
              onSeek={handleSeek}
              onSpeedChange={handleSpeedChange}
            />
          </div>

          {/* Key Analytical Measurements Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-200 dark:border-zinc-800">
            <MeasurementDisplay
              label="Flight Time (tf)"
              value={flightTime ?? 0}
              unit="s"
              precision={3}
              highlight={true}
              size="sm"
            />
            <MeasurementDisplay
              label="Max Height (h_max)"
              value={maxHeight}
              unit="m"
              precision={3}
              highlight={true}
              size="sm"
            />
            <MeasurementDisplay
              label="Range (R)"
              value={range}
              unit="m"
              precision={3}
              highlight={true}
              size="sm"
            />
            <MeasurementDisplay
              label="Current Speed"
              value={state.speed}
              unit="m/s"
              precision={2}
              size="sm"
            />
          </div>
        </div>

        {/* Right Sidebar: Parameters, Equations, Graphs, Observations */}
        <div className="w-full lg:w-96 flex flex-col bg-white dark:bg-zinc-950 overflow-y-auto">
          {/* Tab Navigation */}
          <div className="flex border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('controls')}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'controls'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/20 dark:bg-indigo-950/20'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Params</span>
            </button>

            <button
              onClick={() => setActiveTab('equations')}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'equations'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/20 dark:bg-indigo-950/20'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Equations</span>
            </button>

            <button
              onClick={() => setActiveTab('graphs')}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'graphs'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/20 dark:bg-indigo-950/20'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Plot</span>
            </button>

            <button
              onClick={() => setActiveTab('observations')}
              className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1.5 border-b-2 transition-colors ${
                activeTab === 'observations'
                  ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-50/20 dark:bg-indigo-950/20'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>
          </div>

          {/* Tab Content Panels */}
          <div className="p-4 space-y-4 flex-1">
            {activeTab === 'controls' && (
              <div className="space-y-4">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-2">
                  <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-500 mb-0.5">
                    Launch Parameters
                  </h3>
                  <p className="text-[11px] text-zinc-400">
                    Adjust speed, angle, gravity, and launch platform height.
                  </p>
                </div>

                {/* Initial Speed */}
                <ParameterControl
                  label="Initial Speed (v₀)"
                  value={params.initialSpeed}
                  min={0}
                  max={100}
                  step={0.5}
                  unit="m/s"
                  onChange={(val) => handleUpdateParameter('initialSpeed', val)}
                  description="Magnitude of initial launch velocity vector"
                />

                {/* Launch Angle */}
                <ParameterControl
                  label="Launch Angle (θ)"
                  value={angleDegrees}
                  min={-90}
                  max={90}
                  step={1}
                  unit="°"
                  onChange={handleAngleChange}
                  description="Angle relative to horizontal plane"
                />

                {/* Gravity */}
                <div className="space-y-1.5">
                  <ParameterControl
                    label="Gravitational Accel (g)"
                    value={params.gravity}
                    min={0}
                    max={30}
                    step={0.01}
                    unit="m/s²"
                    precision={2}
                    onChange={(val) => handleUpdateParameter('gravity', val)}
                    description="Downward vertical acceleration"
                  />
                  {/* Quick celestial bodies buttons */}
                  <div className="flex gap-1 pt-1">
                    <button
                      onClick={() => handleUpdateParameter('gravity', 9.81)}
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        params.gravity === 9.81
                          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      Earth (9.81)
                    </button>
                    <button
                      onClick={() => handleUpdateParameter('gravity', 1.62)}
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        params.gravity === 1.62
                          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      Moon (1.62)
                    </button>
                    <button
                      onClick={() => handleUpdateParameter('gravity', 3.71)}
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        params.gravity === 3.71
                          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      Mars (3.71)
                    </button>
                    <button
                      onClick={() => handleUpdateParameter('gravity', 0)}
                      className={`text-[10px] px-2 py-0.5 rounded border ${
                        params.gravity === 0
                          ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold'
                          : 'border-zinc-200 dark:border-zinc-800 text-zinc-500'
                      }`}
                    >
                      Zero-G (0)
                    </button>
                  </div>
                </div>

                {/* Initial Height */}
                <ParameterControl
                  label="Launch Height (y₀)"
                  value={params.initialHeight}
                  min={0}
                  max={100}
                  step={1}
                  unit="m"
                  onChange={(val) => handleUpdateParameter('initialHeight', val)}
                  description="Initial elevation above ground level"
                />

                {/* Vectors Readout */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-500">
                    Live Vector Components
                  </h4>
                  <VectorDisplay
                    label="Instantaneous Velocity (v)"
                    x={state.velocity.x}
                    y={state.velocity.y}
                    unit="m/s"
                    color="#3b82f6"
                  />
                  <VectorDisplay
                    label="Instantaneous Acceleration (a)"
                    x={state.acceleration.x}
                    y={state.acceleration.y}
                    unit="m/s²"
                    color="#f97316"
                    showMagnitude={false}
                  />
                </div>

                {/* Vector Scale Control */}
                <div className="pt-1">
                  <label className="text-xs text-zinc-500 block mb-1">Vector Arrow Visual Scale</label>
                  <input
                    type="range"
                    aria-label="Vector Arrow Visual Scale"
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    value={vectorScale}
                    onChange={(e) => setVectorScale(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded appearance-none cursor-pointer"
                  />
                </div>
              </div>
            )}

            {activeTab === 'equations' && (
              <LiveEquations
                parameters={params}
                state={state}
                flightTime={flightTime}
                maxHeight={maxHeight}
                range={range}
              />
            )}

            {activeTab === 'graphs' && (
              <div className="space-y-4">
                <TrajectoryGraph
                  history={snapshots}
                  currentTime={state.time}
                  terminalTime={terminalTime}
                  maxHeight={maxHeight}
                />
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500 space-y-1">
                  <div className="font-semibold text-zinc-700 dark:text-zinc-300">Phase Space Invariants:</div>
                  <div>• Horizontal velocity is conserved: v_x(t) = {state.velocity.x.toFixed(2)} m/s (constant)</div>
                  <div>• Kinetic energy per unit mass: {state.kineticEnergyPerMass.toFixed(1)} J/kg</div>
                  <div>• Potential energy per unit mass: {state.potentialEnergyPerMass.toFixed(1)} J/kg</div>
                </div>
              </div>
            )}

            {activeTab === 'observations' && (
              <ObservationPanel
                parameters={params}
                currentState={state}
                observations={observations}
                onAddObservation={(obs) => setObservations([obs, ...observations])}
                onDeleteObservation={(id) => setObservations(observations.filter((o) => o.id !== id))}
              />
            )}
          </div>
        </div>
      </div>

      {/* Export / Import Configuration Dialog */}
      {isExportOpen && (
        <ExportDialog
          isOpen={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          configuration={controller.exportConfiguration()}
          onImport={handleImportConfiguration}
        />
      )}
    </div>
  );
}
