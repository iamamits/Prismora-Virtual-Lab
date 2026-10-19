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
  Button,
  Badge,
  BugReportModal,
} from '@prismora/ui';
import { ImmersiveProjectileScene, type EnvironmentTheme } from '@/components/simulation/immersive-projectile-scene';
import { LiveEquations } from '@/components/simulation/live-equations';
import { TrajectoryGraph } from '@/components/simulation/trajectory-graph';
import { ObservationPanel, type Observation } from '@/components/simulation/observation-panel';
import { ExportDialog } from '@/components/simulation/export-dialog';
import { SimulationGuideModal } from '@/components/simulation/simulation-guide-modal';
import {
  Play,
  Pause,
  RotateCcw,
  SkipForward,
  Share2,
  Sliders,
  BookOpen,
  LineChart,
  Bookmark,
  ChevronRight,
  ChevronLeft,
  Gauge,
  Globe2,
  Moon,
  Sparkles,
  Flame,
  CheckCircle2,
  Maximize2,
  PanelRightClose,
  PanelRightOpen,
  X,
} from 'lucide-react';

// Preset physical scenarios and targets
const SCENARIOS = [
  {
    id: 'target-30',
    name: '🎯 Target Challenge (30m)',
    theme: 'earth' as EnvironmentTheme,
    params: { initialSpeed: 18, launchAngle: degreesToRadians(45), gravity: 9.81, initialHeight: 0 },
  },
  {
    id: 'cliff-drop',
    name: '⛰️ High Cliff Launch (20m)',
    theme: 'earth' as EnvironmentTheme,
    params: { initialSpeed: 15, launchAngle: degreesToRadians(20), gravity: 9.81, initialHeight: 20 },
  },
  {
    id: 'moon-mission',
    name: '🌕 Lunar Trajectory (1.62 m/s²)',
    theme: 'moon' as EnvironmentTheme,
    params: { initialSpeed: 20, launchAngle: degreesToRadians(45), gravity: 1.62, initialHeight: 0 },
  },
  {
    id: 'mars-rover',
    name: '🪐 Martian Surface (3.71 m/s²)',
    theme: 'mars' as EnvironmentTheme,
    params: { initialSpeed: 20, launchAngle: degreesToRadians(45), gravity: 3.71, initialHeight: 0 },
  },
  {
    id: 'zero-g',
    name: '✨ Orbital Zero-G Drift',
    theme: 'space' as EnvironmentTheme,
    params: { initialSpeed: 12, launchAngle: degreesToRadians(15), gravity: 0, initialHeight: 10 },
  },
];

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

  // Environmental Theme
  const [theme, setTheme] = useState<EnvironmentTheme>('earth');

  // Visualization options
  const [showVelocity, setShowVelocity] = useState(true);
  const [showAcceleration, setShowAcceleration] = useState(true);
  const [showTrajectory, setShowTrajectory] = useState(true);
  const [showGrid, setShowGrid] = useState(true);

  // Analytical Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<'controls' | 'equations' | 'graphs' | 'data' | 'notes'>('controls');

  // Kinematics sampled probe points
  const [probeDataPoints, setProbeDataPoints] = useState<
    Array<{ t: number; x: number; y: number; vx: number; vy: number; speed: number }>
  >([]);

  // Observations log
  const [observations, setObservations] = useState<Observation[]>([]);

  // Export/Import modal
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);

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

  // Parameter update handler
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

  // Environment & Gravity Quick Selector
  const handleSelectEnvironment = (selectedTheme: EnvironmentTheme) => {
    setTheme(selectedTheme);
    let g = 9.81;
    if (selectedTheme === 'moon') g = 1.62;
    if (selectedTheme === 'mars') g = 3.71;
    if (selectedTheme === 'space') g = 0;

    handleUpdateParameter('gravity', g);
  };

  // Preset Scenario selector
  const handleSelectScenario = (scenarioId: string) => {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    setTheme(scenario.theme);
    const newParams: ProjectileMotionParameters = {
      ...params,
      ...scenario.params,
    };
    controller.initialize(newParams);
    setParams(newParams);
    setAngleDegrees(Math.round(radiansToDegrees(newParams.launchAngle)));
    setState(controller.currentState);
    setSnapshots([...controller.snapshots]);
    setControllerStatus(controller.status);
  };

  // Kinematics Probe sample recorder
  const handleProbeSample = (sample: { t: number; x: number; y: number; vx: number; vy: number; speed: number }) => {
    // Avoid duplicate stamps
    setProbeDataPoints((prev) => {
      const exists = prev.some((p) => Math.abs(p.t - sample.t) < 0.05);
      if (exists) return prev;
      return [sample, ...prev.slice(0, 19)]; // Keep latest 20 points
    });
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

  const maxTime = terminalTime ?? 10;
  const progressPercent = maxTime > 0 ? (state.time / maxTime) * 100 : 0;

  return (
    <div className="flex-1 flex flex-col h-[calc(100dvh-3.5rem)] overflow-hidden bg-zinc-950 text-zinc-100">
      {/* Top Workspace Bar */}
      <div className="h-11 border-b border-zinc-800 bg-zinc-950 px-3 flex items-center justify-between text-xs gap-2 select-none z-20">
        <div className="flex items-center gap-2.5">
          <h1 className="font-bold text-sm text-zinc-100 flex items-center gap-2">
            <span>Projectile Motion Lab</span>
            <Badge variant="default" className="text-[10px] bg-indigo-600 text-white font-mono">
              Virtual Apparatus
            </Badge>
          </h1>

          <div className="hidden md:flex items-center gap-1 pl-2 border-l border-zinc-800">
            <span className="text-[11px] text-zinc-400">Environment:</span>
            <div className="flex items-center bg-zinc-900 rounded p-0.5 border border-zinc-800">
              <button
                onClick={() => handleSelectEnvironment('earth')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  theme === 'earth' ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Globe2 className="w-3 h-3" />
                <span>Earth</span>
              </button>
              <button
                onClick={() => handleSelectEnvironment('moon')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  theme === 'moon' ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Moon className="w-3 h-3" />
                <span>Moon</span>
              </button>
              <button
                onClick={() => handleSelectEnvironment('mars')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  theme === 'mars' ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3 text-orange-400" />
                <span>Mars</span>
              </button>
              <button
                onClick={() => handleSelectEnvironment('space')}
                className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors flex items-center gap-1 ${
                  theme === 'space' ? 'bg-indigo-600 text-white font-semibold' : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
                <span>Zero-G</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2">
          {/* Preset Challenge selector */}
          <select
            aria-label="Preset challenge scenario"
            onChange={(e) => handleSelectScenario(e.target.value)}
            className="text-xs font-medium py-1 px-2 rounded border border-zinc-800 bg-zinc-900 text-zinc-200 focus:outline-none"
            defaultValue="target-30"
          >
            {SCENARIOS.map((sc) => (
              <option key={sc.id} value={sc.id}>
                {sc.name}
              </option>
            ))}
          </select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsGuideOpen(true)}
            className="h-7 text-xs border-sky-500/40 bg-sky-500/10 text-sky-400 hover:bg-sky-500/20 font-bold"
          >
            <BookOpen className="w-3.5 h-3.5 mr-1 text-sky-400" />
            <span>Lab Guide</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExportOpen(true)}
            className="h-7 text-xs border-zinc-800 text-zinc-300 hover:bg-zinc-800"
          >
            <Share2 className="w-3.5 h-3.5 mr-1" />
            <span>Config</span>
          </Button>

          <BugReportModal
            simulationId="projectile-motion"
            moduleName="Projectile Motion Physics Lab"
            diagnosticSnapshot={{
              initialSpeed: params.initialSpeed,
              launchAngle: params.launchAngle,
              gravity: params.gravity,
              initialHeight: params.initialHeight,
              time: state.time,
              position: state.position,
              speed: state.speed,
              terminated: state.terminated,
              maxHeight,
              range,
              theme,
            }}
          />

          {/* Toggle Analytical Drawer Button */}
          <button
            onClick={() => setIsDrawerOpen(!isDrawerOpen)}
            className="p-1.5 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            title={isDrawerOpen ? 'Collapse Analytical Tools' : 'Open Analytical Tools'}
            aria-label="Toggle Analytical Panel"
          >
            {isDrawerOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Workspace Body */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Dominant Scene Canvas Viewport */}
        <div className="flex-1 flex flex-col relative h-full min-w-0 bg-[#090d16]">
          <ImmersiveProjectileScene
            currentState={state}
            trajectoryHistory={snapshots}
            initialHeight={params.initialHeight}
            launchAngle={params.launchAngle}
            initialSpeed={params.initialSpeed}
            gravity={params.gravity}
            flightTime={flightTime}
            maxHeight={maxHeight}
            maxRange={range}
            onUpdateHeight={(h) => handleUpdateParameter('initialHeight', h)}
            onUpdateAngle={(rad) => {
              setAngleDegrees(Math.round(radiansToDegrees(rad)));
              handleUpdateParameter('launchAngle', rad);
            }}
            onProbeSample={handleProbeSample}
            theme={theme}
            showVelocityVector={showVelocity}
            showAccelerationVector={showAcceleration}
            showTrajectoryTrace={showTrajectory}
            showGrid={showGrid}
            className="flex-1"
          />

          {/* Floating Live Telemetry HUD Bar (Top Center) */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/75 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 text-xs font-mono shadow-xl pointer-events-none">
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">t:</span>
              <span className="text-white font-bold">{state.time.toFixed(2)}s</span>
            </div>
            <div className="w-px h-3.5 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">x:</span>
              <span className="text-white font-bold">{state.position.x.toFixed(2)}m</span>
            </div>
            <div className="w-px h-3.5 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">y:</span>
              <span className="text-emerald-400 font-bold">{state.position.y.toFixed(2)}m</span>
            </div>
            <div className="w-px h-3.5 bg-white/20" />
            <div className="flex items-center gap-1.5">
              <span className="text-zinc-500">|v|:</span>
              <span className="text-blue-400 font-bold">{state.speed.toFixed(2)}m/s</span>
            </div>
          </div>

          {/* Floating Bottom Tactile Transport Controls Island */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-2xl bg-zinc-900/90 backdrop-blur-md border border-white/15 p-2.5 rounded-xl shadow-2xl flex flex-col gap-2 z-20">
            {/* Timeline Scrub Slider */}
            <div className="flex items-center gap-2.5 px-1">
              <span className="text-[11px] font-mono text-zinc-400 w-12 text-right">
                {state.time.toFixed(2)}s
              </span>
              <div
                className="flex-1 h-2 rounded-full bg-zinc-800 cursor-pointer relative overflow-hidden"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const fraction = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  handleSeek(fraction * maxTime);
                }}
                role="slider"
                aria-label="Simulation timeline scrub"
                aria-valuemin={0}
                aria-valuemax={maxTime}
                aria-valuenow={state.time}
                tabIndex={0}
              >
                <div
                  className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full transition-all duration-75"
                  style={{ width: `${Math.min(100, progressPercent)}%` }}
                />
              </div>
              <span className="text-[11px] font-mono text-zinc-400 w-12">
                {terminalTime !== null ? `${terminalTime.toFixed(2)}s` : '∞'}
              </span>
            </div>

            {/* Playback Buttons & Speeds */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center gap-2">
                {/* Primary Fire / Play Button */}
                {controllerStatus === 'running' ? (
                  <Button
                    size="sm"
                    onClick={handlePause}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold px-4 h-8"
                  >
                    <Pause className="w-4 h-4 mr-1.5" />
                    <span>Pause</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={handlePlay}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 h-8 shadow-md"
                  >
                    <Play className="w-4 h-4 mr-1.5 fill-current" />
                    <span>Launch</span>
                  </Button>
                )}

                {/* Step Forward */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStep}
                  disabled={state.terminated}
                  className="h-8 border-zinc-700 hover:bg-zinc-800 text-zinc-200"
                  aria-label="Step forward 1 frame"
                >
                  <SkipForward className="w-3.5 h-3.5 mr-1" />
                  <span>Step</span>
                </Button>

                {/* Reset */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="h-8 border-zinc-700 hover:bg-zinc-800 text-zinc-200"
                  aria-label="Reset experiment"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  <span>Reset</span>
                </Button>
              </div>

              {/* Status Indicator Badge */}
              <div className="flex items-center gap-1.5 text-xs">
                <span
                  className={`w-2 h-2 rounded-full ${
                    controllerStatus === 'running'
                      ? 'bg-emerald-400 animate-pulse'
                      : controllerStatus === 'completed'
                      ? 'bg-blue-400'
                      : 'bg-zinc-400'
                  }`}
                />
                <span className="text-zinc-300 font-medium capitalize">{controllerStatus}</span>
              </div>

              {/* Speed Multiplier */}
              <div className="flex items-center gap-1 bg-zinc-800/80 p-0.5 rounded border border-zinc-700 text-xs">
                {[0.1, 0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => handleSpeedChange(spd)}
                    className={`px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
                      playbackSpeed === spd ? 'bg-indigo-600 text-white font-bold' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {spd === 0.1 ? '0.1× Slow' : `${spd}×`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Analytical & Lab Drawer (Right Side) */}
        {isDrawerOpen && (
          <aside className="w-80 md:w-96 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full z-10 shrink-0 animate-in slide-in-from-right-4 duration-200">
            {/* Tab Header Strip */}
            <div className="flex items-center border-b border-zinc-800 text-xs font-semibold bg-zinc-900/60 shrink-0">
              <button
                onClick={() => setActiveTab('controls')}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1 border-b-2 transition-colors ${
                  activeTab === 'controls'
                    ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-950/20'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Controls</span>
              </button>
              <button
                onClick={() => setActiveTab('equations')}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1 border-b-2 transition-colors ${
                  activeTab === 'equations'
                    ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-950/20'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Formulas</span>
              </button>
              <button
                onClick={() => setActiveTab('graphs')}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1 border-b-2 transition-colors ${
                  activeTab === 'graphs'
                    ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-950/20'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <LineChart className="w-3.5 h-3.5" />
                <span>Plot</span>
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 py-2.5 text-center flex items-center justify-center gap-1 border-b-2 transition-colors ${
                  activeTab === 'data'
                    ? 'border-indigo-500 text-indigo-400 font-bold bg-indigo-950/20'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>Data</span>
              </button>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="md:hidden px-3 py-2.5 text-zinc-400 hover:text-white border-l border-zinc-800"
                aria-label="Close analytical drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tab Contents */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 overscroll-y-contain min-h-0">
              {activeTab === 'controls' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-400 mb-1">
                      Initial Launch Conditions
                    </h3>
                    <p className="text-[11px] text-zinc-500">
                      You can also drag the cannon barrel directly in the scene to rotate or adjust elevation.
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
                  />

                  {/* Gravity */}
                  <ParameterControl
                    label="Gravitational Accel (g)"
                    value={params.gravity}
                    min={0}
                    max={30}
                    step={0.01}
                    unit="m/s²"
                    precision={2}
                    onChange={(val) => handleUpdateParameter('gravity', val)}
                  />

                  {/* Launch Height */}
                  <ParameterControl
                    label="Launch Platform Height (y₀)"
                    value={params.initialHeight}
                    min={0}
                    max={80}
                    step={0.5}
                    unit="m"
                    onChange={(val) => handleUpdateParameter('initialHeight', val)}
                  />

                  {/* Vector Component Displays */}
                  <div className="pt-2 border-t border-zinc-800 space-y-2">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Live Physical Vectors
                    </h4>
                    <VectorDisplay
                      label="Velocity Vector (v)"
                      x={state.velocity.x}
                      y={state.velocity.y}
                      unit="m/s"
                      color="#3b82f6"
                    />
                    <VectorDisplay
                      label="Acceleration Vector (a)"
                      x={state.acceleration.x}
                      y={state.acceleration.y}
                      unit="m/s²"
                      color="#f97316"
                      showMagnitude={false}
                    />
                  </div>

                  {/* Visibility Toggles */}
                  <div className="pt-2 border-t border-zinc-800 space-y-2">
                    <h4 className="text-xs uppercase font-bold tracking-wider text-zinc-400">
                      Visual Overlays
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input
                          type="checkbox"
                          checked={showVelocity}
                          onChange={(e) => setShowVelocity(e.target.checked)}
                          className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-0"
                        />
                        <span>Velocity Vector</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input
                          type="checkbox"
                          checked={showAcceleration}
                          onChange={(e) => setShowAcceleration(e.target.checked)}
                          className="rounded bg-zinc-800 border-zinc-700 text-orange-600 focus:ring-0"
                        />
                        <span>Accel Vector</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input
                          type="checkbox"
                          checked={showTrajectory}
                          onChange={(e) => setShowTrajectory(e.target.checked)}
                          className="rounded bg-zinc-800 border-zinc-700 text-cyan-600 focus:ring-0"
                        />
                        <span>Trajectory Trail</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                        <input
                          type="checkbox"
                          checked={showGrid}
                          onChange={(e) => setShowGrid(e.target.checked)}
                          className="rounded bg-zinc-800 border-zinc-700 text-indigo-600 focus:ring-0"
                        />
                        <span>Coordinate Grid</span>
                      </label>
                    </div>
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
                  <div className="p-3 bg-zinc-900 rounded border border-zinc-800 text-xs text-zinc-400 space-y-1">
                    <div className="font-semibold text-zinc-200">Analytical Invariants:</div>
                    <div>• Horizontal momentum is conserved: v_x = {state.velocity.x.toFixed(2)} m/s</div>
                    <div>• Specific kinetic energy: {state.kineticEnergyPerMass.toFixed(1)} J/kg</div>
                    <div>• Specific potential energy: {state.potentialEnergyPerMass.toFixed(1)} J/kg</div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs uppercase font-bold text-zinc-400">Sampled Sensor Points</h4>
                    <span className="text-[11px] text-zinc-500 font-mono">{probeDataPoints.length} samples</span>
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Drag the Kinematics Probe over any trajectory dot in the scene to record experimental readings.
                  </p>

                  <div className="max-h-60 overflow-y-auto space-y-1.5">
                    {probeDataPoints.length === 0 ? (
                      <p className="text-xs text-zinc-600 italic text-center py-6">
                        No sensor data collected yet. Toggle Probe in the scene toolbar.
                      </p>
                    ) : (
                      probeDataPoints.map((pt, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded bg-zinc-900 border border-zinc-800 font-mono text-[11px] grid grid-cols-2 gap-x-2 gap-y-0.5"
                        >
                          <span className="text-indigo-400">t = {pt.t.toFixed(2)}s</span>
                          <span className="text-blue-400">|v| = {pt.speed.toFixed(2)}m/s</span>
                          <span className="text-zinc-400">x = {pt.x.toFixed(1)}m</span>
                          <span className="text-emerald-400">y = {pt.y.toFixed(1)}m</span>
                        </div>
                      ))
                    )}
                  </div>

                  {probeDataPoints.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setProbeDataPoints([])}
                      className="w-full text-xs h-7 border-zinc-800 text-zinc-400"
                    >
                      Clear Data Table
                    </Button>
                  )}
                </div>
              )}
            </div>

            {/* Quick Analytical Summary Strip at bottom of drawer */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/80 grid grid-cols-3 gap-2 shrink-0">
              <MeasurementDisplay
                label="Flight Time"
                value={flightTime ?? 0}
                unit="s"
                precision={2}
                size="sm"
              />
              <MeasurementDisplay
                label="Max Height"
                value={maxHeight}
                unit="m"
                precision={2}
                size="sm"
              />
              <MeasurementDisplay
                label="Range"
                value={range}
                unit="m"
                precision={2}
                size="sm"
              />
            </div>
          </aside>
        )}
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

      {/* Universal Lab Manual & How to Use Guide Modal */}
      <SimulationGuideModal
        simulationId="projectile-motion"
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
