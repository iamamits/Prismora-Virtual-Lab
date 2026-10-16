/**
 * Prismora Scalable Simulation & Laboratory Registry
 *
 * Centralized, strongly-typed metadata catalog powering Prismora Labs,
 * Explore discovery, search, filtering, and breadcrumb navigation.
 */

import { ECE_CURRICULUM_SPECIFICATIONS } from './ece-curriculum';

export type LaboratoryId =
  | 'ece'
  | 'physics'
  | 'digital-electronics'
  | 'coa'
  | 'toc'
  | 'mathematics'
  | 'engineering'
  | 'civil'
  | 'robotics'
  | 'chemical'
  | 'biotech'
  | 'mechanical'
  | 'chemistry'
  | 'biology';

export type SimulationDifficulty = 'Introductory' | 'Intermediate' | 'Advanced';
export type SimulationStatus = 'available' | 'in_development' | 'planned';

export interface LaboratoryDef {
  readonly id: LaboratoryId;
  readonly name: string;
  readonly shortName: string;
  readonly tagline: string;
  readonly description: string;
  readonly disciplineColor: string;
  readonly accentBg: string;
  readonly categories: readonly string[];
}

export interface SimulationRegistryEntry {
  readonly id: string;
  readonly title: string;
  readonly shortTitle: string;
  readonly description: string;
  readonly laboratoryId: LaboratoryId;
  readonly category: string;
  readonly difficulty: SimulationDifficulty;
  readonly status: SimulationStatus;
  readonly route: string;
  readonly disciplineColor: string;
  readonly featured?: boolean;
  readonly tags: readonly string[];
  readonly learningObjectives: readonly string[];
  readonly capabilities: readonly string[];
  readonly equations?: readonly string[];
}

export const LABORATORIES: Record<LaboratoryId, LaboratoryDef> = {
  ece: {
    id: 'ece',
    name: 'Prismora ECE Virtual Lab',
    shortName: 'ECE Lab',
    tagline: 'Electronics, Communication Engineering, Signal Processing, and Hardware Design',
    description:
      'World-class, interactive virtual laboratory platform for electronics, logic design, communication systems, DSP, semiconductor physics, and scientific instrumentation.',
    disciplineColor: '#06B6D4', // Cyan
    accentBg: '#06B6D415',
    categories: [
      'Basic and Analog Electronics',
      'Digital Electronics and Logic Design',
      'Signals and Systems',
      'Analog and Digital Communication',
      'Digital Signal Processing',
      'Semiconductor Devices and Microelectronics',
      'VLSI and Hardware Design',
      'Embedded Systems and Microcontrollers',
      'RF, Antennas and Wireless Communication',
      'Computer Networks and Communication Protocols',
      'Information and Coding Theory',
      'Electronic Instrumentation and Measurements',
    ],
  },
  physics: {
    id: 'physics',
    name: 'Physics Laboratory',
    shortName: 'Physics',
    tagline: 'Classical mechanics, wave dynamics, fields, and thermodynamics',
    description:
      'Rigorous physical modeling with analytical and numerical engines, variable celestial gravity, vector displays, and data probe instrumentation.',
    disciplineColor: '#2563EB', // Electric Blue
    accentBg: '#2563EB15',
    categories: ['Mechanics', 'Waves and Oscillations', 'Electricity and Magnetism', 'Optics', 'Thermodynamics'],
  },
  'digital-electronics': {
    id: 'digital-electronics',
    name: 'Digital Electronics Lab',
    shortName: 'Digital',
    tagline: 'Logic design, Boolean minimization, combinational arithmetic, and sequential systems',
    description:
      'Explore discrete logic gates, interactive truth tables, Quine-McCluskey K-map minimization, ripple arithmetic units, flip-flops, and timing hazard waveforms.',
    disciplineColor: '#F43F5E', // Coral / Rose
    accentBg: '#F43F5E15',
    categories: ['Logic Gates and Boolean Algebra', 'Combinational Circuits', 'Sequential Logic', 'Registers and Counters', 'Timing and Hazards'],
  },
  coa: {
    id: 'coa',
    name: 'Computer Organization & Architecture',
    shortName: 'COA RISC-V',
    tagline: 'RV32I microarchitecture, pipelined datapaths, hazard handling, and cache hierarchies',
    description:
      'Interactive RISC-V processor simulation with single-cycle execution, classic 5-stage pipeline, forwarding and hazard bubble injection, 32-register ABI inspection, and associative L1 cache analysis.',
    disciplineColor: '#06B6D4', // Cyan
    accentBg: '#06B6D415',
    categories: ['CPU Datapath', 'Instruction Execution', 'RISC-V', 'Pipelining and Hazards', 'Cache and Memory Hierarchy'],
  },
  toc: {
    id: 'toc',
    name: 'Theory of Computation Lab',
    shortName: 'TOC Automata',
    tagline: 'Formal languages, finite automata, grammars, and Turing computability',
    description:
      'Interactive automata laboratory featuring 5-tuple DFA/NFA state graph traversal, subset construction, Hopcroft minimization, Thompson regex compilation, CYK parsing, and bidirectional Turing machines.',
    disciplineColor: '#8B5CF6', // Royal Violet
    accentBg: '#8B5CF615',
    categories: ['DFA and NFA', 'Regular Expressions', 'Context-Free Grammars', 'Pushdown Automata', 'Turing Machines', 'Computability and Complexity'],
  },
  mathematics: {
    id: 'mathematics',
    name: 'Mathematics Studio',
    shortName: 'Math Studio',
    tagline: 'Function graphing, geometric constructions, vector fields, and linear systems',
    description:
      'Dynamic mathematical representations unifying continuous curves, vector calculus, coordinate manifolds, and linear algebraic transformations.',
    disciplineColor: '#8B5CF6', // Royal Violet
    accentBg: '#8B5CF615',
    categories: ['Graphing and Functions', 'Geometry and Vectors', 'Calculus', 'Linear Algebra'],
  },
  civil: {
    id: 'civil',
    name: 'Civil & Structural Engineering Lab',
    shortName: 'Civil Engineering',
    tagline: 'Bridge truss structural statics, method of joints, and safety factors',
    description:
      'Method of joints matrix static equilibrium solver for planar Warren bridge trusses, determinacy criterion verification (m + r = 2j), tension/compression member stresses, and yield safety evaluation.',
    disciplineColor: '#78716C', // Stone
    accentBg: '#78716C15',
    categories: ['Structural Analysis', 'Truss Mechanics', 'Statics', 'Stress Distribution'],
  },
  robotics: {
    id: 'robotics',
    name: 'Robotics & Mechanisms Laboratory',
    shortName: 'Robotics Lab',
    tagline: 'Denavit-Hartenberg frames, forward/inverse kinematics, and Jacobian singularities',
    description:
      'Interactive multi-link robotic arm testbench featuring DH 4x4 homogeneous transformation matrices, dual-branch closed-form inverse kinematics, and real-time Jacobian determinant singularity warnings.',
    disciplineColor: '#06B6D4', // Cyan
    accentBg: '#06B6D415',
    categories: ['Robotics', 'Kinematics', 'DH Parameters', 'Jacobians & Singularities'],
  },
  chemical: {
    id: 'chemical',
    name: 'Chemical Engineering Operations Lab',
    shortName: 'Chemical Engineering',
    tagline: 'McCabe-Thiele fractional distillation, VLE curves, and separation stages',
    description:
      'Continuous fractional distillation column simulation featuring vapor-liquid equilibrium (VLE), dynamic feed thermal q-lines, rectifying and stripping operating lines, and theoretical tray stepping.',
    disciplineColor: '#10B981', // Emerald
    accentBg: '#10B98115',
    categories: ['Separation Processes', 'Distillation Columns', 'Mass Transfer', 'Vapor-Liquid Equilibrium'],
  },
  biotech: {
    id: 'biotech',
    name: 'Biotechnology & Bioengineering Lab',
    shortName: 'Biotechnology',
    tagline: 'Michaelis-Menten enzyme kinetics, Lineweaver-Burk plots, and inhibitor assays',
    description:
      'Spectrophotometric initial velocity rate assays, hyperbolic v0 vs [S] curves, Lineweaver-Burk double reciprocal transformations, and reversible enzyme inhibition kinetic models.',
    disciplineColor: '#EC4899', // Pink
    accentBg: '#EC489915',
    categories: ['Enzyme Kinetics', 'Biochemistry', 'Lineweaver-Burk Plots', 'Enzyme Inhibition'],
  },
  mechanical: {
    id: 'mechanical',
    name: 'Mechanical Vibrations & Dynamics Lab',
    shortName: 'Mechanical Engineering',
    tagline: 'Damped harmonic oscillators, resonance magnification, and phase portraits',
    description:
      'Mass-spring-dashpot mechanical vibration testbench with underdamped/critically/overdamped modes, harmonic driving frequencies, 90-degree phase resonance, and phase-space state portraits.',
    disciplineColor: '#F59E0B', // Amber
    accentBg: '#F59E0B15',
    categories: ['Vibrations', 'Resonance', 'Phase Space', 'Oscillations'],
  },
  engineering: {
    id: 'engineering',
    name: 'Virtual Engineering Labs',
    shortName: 'Engineering',
    tagline: 'Circuits, structural mechanics, instrumentation, and control systems',
    description:
      'Applied scientific experimentation focusing on engineering circuits, stress distribution, sensor calibration, and physical laboratory instrumentation.',
    disciplineColor: '#F43F5E', // Coral
    accentBg: '#F43F5E15',
    categories: ['Circuits and Electronics', 'Instrumentation', 'Measurements and Experiments', 'Structural Analysis'],
  },
  chemistry: {
    id: 'chemistry',
    name: 'Virtual Chemistry Laboratory',
    shortName: 'Chemistry',
    tagline: 'Molecular kinetics, equilibrium, acid-base systems, and stoichiometry',
    description:
      'Configurable chemical titration apparatus, reaction rates, equilibrium shifts, and stoichiometric calculations.',
    disciplineColor: '#FBBF24', // Amber
    accentBg: '#FBBF2415',
    categories: ['Acid-Base Equilibrium', 'Reaction Kinetics', 'Thermodynamics', 'Electrochemistry'],
  },
  biology: {
    id: 'biology',
    name: 'Computational Biology Lab',
    shortName: 'Biology',
    tagline: 'Population dynamics, genetic regulation, and ecological equilibria',
    description:
      'Mathematical modeling of biological systems including predator-prey dynamics, enzyme kinetics, and population genetics.',
    disciplineColor: '#22C55E', // Emerald Green
    accentBg: '#22C55E15',
    categories: ['Population Dynamics', 'Enzyme Kinetics', 'Genetics', 'Ecology'],
  },
};

export const SIMULATION_REGISTRY: readonly SimulationRegistryEntry[] = [
  // 1. Projectile Motion
  {
    id: 'projectile-motion',
    title: 'Ideal Projectile Motion',
    shortTitle: 'Projectile Motion',
    description:
      'Scientifically validated kinematic trajectory model with articulated launcher, direct elevation drag, variable celestial gravity (Earth, Moon, Mars, Zero-G), target hit detection, data probe, and measurement tape.',
    laboratoryId: 'physics',
    category: 'Mechanics',
    difficulty: 'Introductory',
    status: 'available',
    route: '/experiments/projectile-motion',
    disciplineColor: '#2563EB',
    featured: true,
    tags: ['Kinematics', 'Trajectories', 'Gravity', 'Vectors', 'Energy Conservation'],
    learningObjectives: [
      'Understand independence of horizontal and vertical velocity components',
      'Investigate the influence of launch angle and initial speed on maximum height and range',
      'Compare projectile dynamics across celestial gravity fields (Earth, Moon, Mars)',
      'Sample trajectory points using calibrated sensor probes',
    ],
    capabilities: [
      'Articulated Cannon Dragging',
      'Variable Gravity Presets',
      'Progressive Trajectory Rendering',
      'Kinematics Sensor Probe',
      'Measurement Tape Tool',
      'JSON Export & Import',
    ],
    equations: [
      'x(t) = v_0 \\cos(\\theta) t',
      'y(t) = y_0 + v_0 \\sin(\\theta) t - \\frac{1}{2} g t^2',
      'R = \\frac{v_0^2 \\sin(2\\theta)}{g}',
      'h_{max} = y_0 + \\frac{v_0^2 \\sin^2(\\theta)}{2g}',
    ],
  },

  // 2. Digital Electronics
  {
    id: 'digital-electronics',
    title: 'Digital Electronics & Logic Design Workbench',
    shortTitle: 'Digital Electronics',
    description:
      'Scientifically verified discrete logic laboratory featuring 7 primitive gates, interactive truth tables, Quine-McCluskey K-map minimization, 4-bit ripple adders and ALUs, sequential flip-flops (SR, JK, D, T), synchronous counters, and static 1-hazard waveforms.',
    laboratoryId: 'digital-electronics',
    category: 'Logic Gates and Boolean Algebra',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/digital-electronics',
    disciplineColor: '#F43F5E',
    featured: true,
    tags: ['Logic Gates', 'Truth Tables', 'K-Map', 'ALU', 'Flip-Flops', 'Glitch Waveforms'],
    learningObjectives: [
      'Evaluate Boolean functions and verify gate propagation',
      'Derive minimal Sum-of-Products (SOP) expressions using algorithmic K-map grouping',
      'Understand arithmetic flag generation (Carry, Zero, Sign, Overflow) in 4-bit ALUs',
      'Observe edge-triggered state changes in sequential flip-flops and counters',
      'Diagnose static-1 hazards and propagation delay glitches in combinational networks',
    ],
    capabilities: [
      '7 Primitive Gate Explorations',
      'Quine-McCluskey K-Map Minimizer (2, 3, 4 Vars)',
      '4-Bit Full Adder & Combinational ALU',
      'Clocked Sequential Flip-Flops & 4-Bit Counter',
      'Sub-Nanosecond Hazard Timing Waveforms',
    ],
    equations: [
      'F = \\sum m(m_0, m_1, ...)',
      'S_i = A_i \\oplus B_i \\oplus C_i',
      'C_{i+1} = A_i B_i + C_i (A_i \\oplus B_i)',
      'Q_{next} = J \\overline{Q} + \\overline{K} Q',
    ],
  },

  // 3. Computer Organization & Architecture
  {
    id: 'coa-riscv',
    title: 'Computer Organization & Architecture (RV32I)',
    shortTitle: 'COA RISC-V',
    description:
      'RISC-V 32-bit (RV32I) microarchitecture workbench with live Harvard single-cycle datapath, 5-stage classic pipeline (IF/ID/EX/MEM/WB), RAW load-use hazard bubble stall detection, forwarding unit, 32-register ABI inspection, and configurable L1 cache simulator.',
    laboratoryId: 'coa',
    category: 'CPU Datapath',
    difficulty: 'Advanced',
    status: 'available',
    route: '/experiments/coa',
    disciplineColor: '#06B6D4',
    featured: true,
    tags: ['RISC-V', 'RV32I', 'Datapath', '5-Stage Pipeline', 'Hazard Stall', 'L1 Cache'],
    learningObjectives: [
      'Trace instruction flow through Fetch, Decode, Execute, Memory, and Writeback stages',
      'Observe pipeline RAW hazards and understand 1-cycle bubble stalls vs EX-to-EX forwarding',
      'Inspect 32 general-purpose registers with standardized ABI nomenclature (zero, ra, sp, t0-t6, a0-a7)',
      'Analyze cache hit/miss distributions across direct-mapped, 2-way, and 4-way set associative configurations',
    ],
    capabilities: [
      'Single-Cycle Datapath Highlighting',
      '5-Stage Pipelined Clock Stepper',
      'Load-Use RAW Hazard Bubble Injection',
      'Forwarding Unit Verification',
      '32-Register ABI File with Hex/Dec Formats',
      'L1 Cache Hit/Miss Breakdown',
    ],
    equations: [
      'CPI = \\frac{\\text{Total Clock Cycles}}{\\text{Instructions Executed}}',
      '\\text{Hit Rate} = \\frac{\\text{Hits}}{\\text{Accesses}}',
      '\\text{AMAT} = \\text{Hit Time} + \\text{Miss Rate} \\times \\text{Miss Penalty}',
    ],
  },

  // 4. Theory of Computation
  {
    id: 'toc-automata',
    title: 'Theory of Computation & Automata Studio',
    shortTitle: 'TOC Automata',
    description:
      'Formal language systems featuring interactive 5-tuple DFA and NFA execution with string stepping, powerset subset construction with state reachability pruning, Hopcroft O(n log n) DFA minimization, Thompson regex epsilon-NFA compiler, O(n³) CYK triangular parser, and 7-tuple deterministic Turing machine on bidirectional tape.',
    laboratoryId: 'toc',
    category: 'DFA and NFA',
    difficulty: 'Advanced',
    status: 'available',
    route: '/experiments/toc',
    disciplineColor: '#8B5CF6',
    featured: true,
    tags: ['Automata', 'DFA', 'NFA', 'Hopcroft', 'Regex', 'CYK Parser', 'Turing Machine'],
    learningObjectives: [
      'Trace state transitions on finite automata for arbitrary input alphabets',
      'Convert non-deterministic automata (NFA) to equivalent deterministic automata (DFA) via subset construction',
      'Minimize DFA states by partitioning indistinguishable equivalence classes',
      'Compile regular expressions into epsilon-NFAs using Thompson construction',
      'Parse context-free grammars in Chomsky Normal Form with the CYK dynamic programming table',
      'Execute multi-step Turing machine computations with head shifts on infinite tape',
    ],
    capabilities: [
      '5-Tuple DFA/NFA Transition Stepper',
      'Powerset Subset Construction Engine',
      'Hopcroft DFA State Minimizer',
      'Thompson Regex Compiler',
      'Triangular CYK Dynamic Parse Table',
      'Bidirectional Infinite Turing Tape',
    ],
    equations: [
      'M = (Q, \\Sigma, \\delta, q_0, F)',
      '\\delta : Q \\times \\Sigma \\rightarrow Q',
      'V[i, j] = \\bigcup_{k=1}^{j-1} \\{ A \\mid A \\rightarrow B C, B \\in V[i, k], C \\in V[i+k, j-k] \\}',
    ],
  },

  // Flagship Electrical Engineering Lab
  {
    id: 'network-theorems',
    title: "Network Theorems Lab: Thévenin, Norton & Maximum Power",
    shortTitle: 'Network Theorems',
    description:
      'Scientifically verified circuit reduction workbench. Compute open-circuit voltage Voc = Vth, internal de-energized resistance Rin = Rth, Norton current In = Vth/Rth, and swept load resistance dynamic power transfer curve (PL vs RL peak at RL = Rth).',
    laboratoryId: 'ece',
    category: 'Circuit Analysis and Network Theorems',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/electrical/network-theorems',
    disciplineColor: '#2563EB',
    featured: true,
    tags: ["Thévenin's Theorem", "Norton's Theorem", 'Maximum Power Transfer', 'Network Reduction', 'Vth', 'Rth', 'Circuits'],
    learningObjectives: [
      'Experimentally measure open-circuit terminal voltage Voc to determine Thévenin voltage Vth',
      'De-energize independent sources to find equivalent internal resistance Rth',
      'Construct and verify dual equivalent circuits (Original 5-element vs 2-element Thévenin)',
      'Demonstrate Jacobi Maximum Power Transfer Theorem: maximum load power occurs when RL = Rth',
      'Compute Norton equivalent current In = Vth / Rth and verify source transformation duality',
    ],
    capabilities: [
      'Dual Independent DC Bench Voltage Supplies (0 - 30V)',
      'Precision Resistor Decade Box (10Ω - 10kΩ)',
      'Digital Multimeter (DC Voltmeter & Precision DC Ammeter)',
      'Swept Variable Potentiometer Load with Real-time Power Curve',
    ],
    equations: [
      'V_{th} = V_{oc} = \\frac{\\frac{V_1}{R_1} + \\frac{V_2}{R_2}}{\\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}}',
      'R_{th} = \\frac{1}{\\frac{1}{R_1} + \\frac{1}{R_2} + \\frac{1}{R_3}}',
      'I_N = \\frac{V_{th}}{R_{th}}',
      'P_L(R_L) = \\frac{V_{th}^2 R_L}{(R_{th} + R_L)^2} \\implies P_{L,\\max} = \\frac{V_{th}^2}{4 R_{th}}',
    ],
  },

  ...ECE_CURRICULUM_SPECIFICATIONS,

  // 5. Harmonic Oscillator (Mechanical Vibrations)
  {
    id: 'harmonic-oscillator',
    title: 'Damped Harmonic Oscillator & Mechanical Resonance',
    shortTitle: 'Harmonic Oscillator',
    description:
      'Mass-spring-damper oscillator with viscous dashpot, harmonic forcing excitation, phase-space state portrait (x vs v), and resonant frequency magnification factor sweep.',
    laboratoryId: 'mechanical',
    category: 'Waves and Oscillations',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/mechanical/harmonic-oscillator',
    disciplineColor: '#F59E0B',
    featured: true,
    tags: ['Vibrations', 'Oscillations', 'Springs', 'Resonance', 'Phase Space', 'Dashpot'],
    learningObjectives: [
      'Investigate natural frequency omega_n and damping ratio zeta',
      'Observe underdamped, critically damped, and overdamped motion',
      'Explore phase portraits (position vs velocity) and limit cycles',
      'Observe 90-degree phase lag at resonance frequency in forced systems',
    ],
    capabilities: ['Damped Motion Stepper', 'Phase Portrait Plot', 'Driving Force Tuning', 'Bode Frequency Response'],
    equations: [
      'm \\ddot{x} + c \\dot{x} + k x = F_0 \\cos(\\omega t)',
      '\\omega_n = \\sqrt{\\frac{k}{m}}, \\quad \\zeta = \\frac{c}{2 \\sqrt{k m}}',
      'M(\\omega) = \\frac{1}{\\sqrt{(1 - (\\omega/\\omega_n)^2)^2 + (2\\zeta \\omega/\\omega_n)^2}}',
    ],
  },

  // 6. Vector Field Studio (Mathematics Studio)
  {
    id: 'vector-field-studio',
    title: 'Prismora Studio: Calculus, Linear Maps & Vector Fields',
    shortTitle: 'Math Studio',
    description:
      'Interactive mathematical computing environment featuring function derivative tangents, Riemann sums, 2D matrix transformations with basis vector warping, and autonomous vector fields with RK4 integration.',
    laboratoryId: 'mathematics',
    category: 'Geometry and Vectors',
    difficulty: 'Advanced',
    status: 'available',
    route: '/studio',
    disciplineColor: '#8B5CF6',
    featured: true,
    tags: ['Calculus', 'Linear Algebra', 'Vector Fields', 'Matrices', 'Eigenvalues', 'RK4'],
    learningObjectives: [
      'Understand spatial divergence as source or sink strength',
      'Visualize local rotational circulation through curl vectors',
      'Calculate line integrals along interactive user-drawn paths',
      'Analyze 2x2 matrix transformations and real eigenvalue span axes',
    ],
    capabilities: ['Vector Arrow Grid', 'RK4 Numerical Trajectory', 'Riemann Integral Slicer', '2x2 Matrix Warp'],
    equations: [
      '\\vec{v}(x, y) = P(x, y)\\hat{i} + Q(x, y)\\hat{j}',
      '\\text{div } \\vec{F} = \\nabla \\cdot \\vec{F} = \\frac{\\partial P}{\\partial x} + \\frac{\\partial Q}{\\partial y}',
      '\\text{curl } \\vec{F} = \\nabla \\times \\vec{F} = \\left( \\frac{\\partial Q}{\\partial x} - \\frac{\\partial P}{\\partial y} \\right) \\hat{k}',
    ],
  },

  // 7. Wave Optics: Young's Double Slit & Diffraction
  {
    id: 'wave-optics',
    title: "Wave Optics: Young's Double-Slit Interference & Diffraction",
    shortTitle: 'Wave Optics',
    description:
      'Virtual optical bench with multi-wavelength laser sources (Red 633nm, Green 532nm, Blue 450nm, Violet 405nm), double-slit aperture slide, real-time spatial irradiance profile I(x), photodetector probe, and missing orders analysis.',
    laboratoryId: 'physics',
    category: 'Optics',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/physics/wave-optics',
    disciplineColor: '#E11D48',
    featured: true,
    tags: ['Wave Optics', 'Double Slit', 'Interference', 'Diffraction', 'Laser', 'Fringe Width'],
    learningObjectives: [
      'Validate linear fringe width relation w = (lambda * D) / d experimentally',
      'Determine laser light wavelength from measured fringe separation',
      'Identify missing spectral orders where diffraction minima cancel interference maxima',
    ],
    capabilities: ['Multi-Wavelength Lasers', 'Double-Slit Aperture Holder', 'Sliding Photodetector Probe', 'Irradiance Profile Plot'],
    equations: [
      'I(\\theta) = I_0 \\left( \\frac{\\sin\\alpha}{\\alpha} \\right)^2 \\cos^2(\\beta)',
      'w_{fringe} = \\frac{\\lambda D}{d}',
      'm = n \\left( \\frac{d}{a} \\right)',
    ],
  },

  // 8. Acid-Base Titration (Physical Chemistry)
  {
    id: 'acid-base-titration',
    title: 'Acid-Base Neutralization & Buffer Titration Curves',
    shortTitle: 'Titration Lab',
    description:
      'Digital automatic burette titration apparatus. Titrate strong/weak acids (HCl, CH3COOH) with standard base (NaOH), record continuous dynamic pH sigmoidal curves, observe first derivative inflection peaks (dpH/dV), and simulate indicator color transitions.',
    laboratoryId: 'chemistry',
    category: 'Acid-Base Equilibrium',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/chemistry/titration',
    disciplineColor: '#10B981',
    featured: true,
    tags: ['pH', 'Titration', 'Equilibrium', 'Buffers', 'Henderson-Hasselbalch', 'Indicator'],
    learningObjectives: [
      'Derive Henderson-Hasselbalch buffer equations from experimental titration curves',
      'Identify equivalence points and inflection points in strong and weak acid titrations',
      'Analyze indicator color transitions and suitability for different acid-base pairs',
    ],
    capabilities: ['Burette Drop Dispenser', 'Digital pH Sensor Probe', 'Titration Curve Plotter', 'First Derivative dpH/dV Peak'],
    equations: [
      '\\text{pH} = -\\log_{10}[\\text{H}^+]',
      '\\text{pH} = \\text{p}K_a + \\log_{10}\\left(\\frac{[\\text{A}^-]}{[\\text{HA}]}\\right)',
    ],
  },

  // 9. Planar Truss Structural Analysis (Civil Engineering)
  {
    id: 'truss-structural-analysis',
    title: 'Planar Bridge Truss Structural Mechanics',
    shortTitle: 'Truss Analysis',
    description:
      'Method of joints matrix solution for architectural bridge trusses, tension-compression distribution, safety factors, and node load deflection.',
    laboratoryId: 'civil',
    category: 'Structural Analysis',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/civil/truss-analysis',
    disciplineColor: '#78716C',
    featured: true,
    tags: ['Statics', 'Stress', 'Truss', 'Structures', 'Method of Joints', 'Civil'],
    learningObjectives: [
      'Verify static determinacy criterion: m + r = 2j',
      'Calculate member forces using the method of joints',
      'Identify tension vs compression members and yield safety factor',
    ],
    capabilities: ['Interactive Node Pinning', 'Stress Color-Coding', 'Load Vector Arrow', 'Safety Factor Matrix'],
    equations: [
      '\\sum F_x = 0, \\quad \\sum F_y = 0',
      '\\sigma_i = \\frac{F_i}{A_i}',
      'm + r = 2j',
    ],
  },

  // 10. Serial Robotic Arm Kinematics (Interdisciplinary / Robotics)
  {
    id: 'robotics-kinematics',
    title: 'Planar & Spatial Robotic Arm Kinematics',
    shortTitle: 'Robotics Lab',
    description:
      'Denavit-Hartenberg (DH) homogeneous transformation matrices, forward kinematics, closed-form analytical inverse kinematics, and Jacobian singularity detection.',
    laboratoryId: 'robotics',
    category: 'Robotics',
    difficulty: 'Advanced',
    status: 'available',
    route: '/experiments/robotics/kinematics',
    disciplineColor: '#06B6D4',
    featured: true,
    tags: ['Robotics', 'Kinematics', 'DH Parameters', 'End Effector', 'Inverse Kinematics', 'Jacobian'],
    learningObjectives: [
      'Compute forward kinematics via DH 4x4 matrix multiplication',
      'Solve analytical inverse kinematics for dual elbow configurations',
      'Detect kinematic singularities where manipulability vanishes',
    ],
    capabilities: ['Direct Target IK Drag', 'Servo Joint Angle Sliders', 'Jacobian Matrix HUD', 'Manipulability Gauge'],
    equations: [
      '^{i-1}T_i = \\text{Rot}_z(\\theta_i) \\text{Trans}_z(d_i) \\text{Trans}_x(a_i) \\text{Rot}_x(\\alpha_i)',
      'x_e = l_1 \\cos\\theta_1 + l_2 \\cos(\\theta_1 + \\theta_2)',
      '\\det(J) = l_1 l_2 \\sin\\theta_2',
    ],
  },

  // 11. Fractional Distillation Column (Chemical Engineering)
  {
    id: 'distillation-column',
    title: 'McCabe-Thiele Binary Distillation Column',
    shortTitle: 'Distillation Lab',
    description:
      'Continuous fractional distillation column simulation. Adjust reflux ratio R, feed thermal condition q, distillate and bottoms purity to step off theoretical trays.',
    laboratoryId: 'chemical',
    category: 'Separation Processes',
    difficulty: 'Advanced',
    status: 'available',
    route: '/experiments/chemical/distillation',
    disciplineColor: '#10B981',
    featured: true,
    tags: ['Distillation', 'McCabe-Thiele', 'Equilibrium', 'Reflux Ratio', 'VLE'],
    learningObjectives: [
      'Construct Vapor-Liquid Equilibrium (VLE) curve for binary mixture',
      'Plot Rectifying and Stripping operating lines with feed q-line',
      'Step off theoretical stages to determine total trays and optimal feed plate',
    ],
    capabilities: ['McCabe-Thiele Stepping Plot', 'Reflux Ratio Controller', 'Distillation Column Graphic', 'Fenske Min Trays'],
    equations: [
      'y = \\frac{R}{R+1} x + \\frac{x_D}{R+1}',
      'y = \\frac{q}{q-1} x - \\frac{x_F}{q-1}',
      'N_{min} = \\frac{\\ln(\\frac{x_D}{1-x_D} \\frac{1-x_B}{x_B})}{\\ln\\alpha}',
    ],
  },

  // 12. Enzyme Kinetics Studio (Biotechnology & Biomedical)
  {
    id: 'enzyme-kinetics',
    title: 'Enzyme Kinetics: Michaelis-Menten Studio',
    shortTitle: 'Enzyme Kinetics',
    description:
      'Initial velocity rate assays, Lineweaver-Burk double reciprocal plots, and reversible inhibition kinetics (competitive, non-competitive, uncompetitive).',
    laboratoryId: 'biotech',
    category: 'Enzyme Kinetics',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/biotech/enzyme-kinetics',
    disciplineColor: '#EC4899',
    featured: true,
    tags: ['Enzyme', 'Michaelis-Menten', 'Lineweaver-Burk', 'Inhibition', 'Biochemistry'],
    learningObjectives: [
      'Determine Vmax and Km from hyperbolic Michaelis-Menten rate curves',
      'Linearize kinetic assays via Lineweaver-Burk transformations',
      'Distinguish competitive from non-competitive enzyme inhibitors',
    ],
    capabilities: ['v0 vs [S] Hyperbolic Plot', 'Lineweaver-Burk 1/v0 vs 1/[S]', 'Inhibition Toggle', 'Substrate Pipette'],
    equations: [
      'v_0 = \\frac{V_{max} [S]}{K_m + [S]}',
      '\\frac{1}{v_0} = \\frac{K_m}{V_{max}} \\frac{1}{[S]} + \\frac{1}{V_{max}}',
    ],
  },

  // 13. Venturimeter & Bernoulli's Flow (Mechanical / Fluid Mechanics)
  {
    id: 'venturi-flow',
    title: "Bernoulli's Theorem & Venturimeter Flow Measurement",
    shortTitle: 'Venturimeter Flow',
    description:
      'Fluid mechanics testbench. Measure piezometric pressure heads h1..h7 across converging-diverging venturi pipe, compute theoretical discharge, and determine discharge coefficient Cd.',
    laboratoryId: 'mechanical',
    category: 'Fluid Mechanics',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/mechanical?exp=venturi-flow',
    disciplineColor: '#06B6D4',
    featured: true,
    tags: ['Bernoulli', 'Venturimeter', 'Fluid Mechanics', 'Manometer', 'Discharge Coefficient', 'Reynolds Number'],
    learningObjectives: [
      'Verify Bernoulli total energy conservation P/rho*g + v^2/2g + z = const along streamlines',
      'Measure differential head delta_h using multi-tube piezometers',
      'Calculate theoretical and actual flow rates to determine discharge coefficient Cd',
    ],
    capabilities: ['Multi-Tube Piezometer Display', 'Dynamic Velocity Profile', 'Valve Flow Controller', 'Reynolds HUD'],
    equations: [
      'P_1 + \\frac{1}{2}\\rho v_1^2 = P_2 + \\frac{1}{2}\\rho v_2^2',
      'Q_{theo} = \\frac{A_1 A_2}{\\sqrt{A_1^2 - A_2^2}} \\sqrt{2g \\Delta h}',
      'Q_{act} = C_d \\times Q_{theo}',
    ],
  },

  // 14. UTM Tensile Test & Stress-Strain (Mechanical / Materials)
  {
    id: 'tensile-test',
    title: 'Universal Testing Machine (UTM) Tensile Test & Stress-Strain Curve',
    shortTitle: 'UTM Tensile Test',
    description:
      'Uniaxial tensile loading of mild steel, aluminium 6061, and brass specimens. Observe linear Hookean elasticity, yield plateau, plastic strain hardening, necking, and fracture.',
    laboratoryId: 'mechanical',
    category: 'Mechanics of Materials',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/mechanical?exp=tensile-test',
    disciplineColor: '#EF4444',
    featured: true,
    tags: ['Tensile Test', 'UTM', 'Stress-Strain', 'Youngs Modulus', 'Yield Strength', 'UTS', 'Ductility'],
    learningObjectives: [
      'Derive Young\'s Modulus of Elasticity E from the linear slope of stress vs strain',
      'Identify 0.2% offset proof yield strength and ultimate tensile strength (UTS)',
      'Analyze necking instability and percentage reduction in area at fracture',
    ],
    capabilities: ['Dogbone Specimen Necking Visualizer', 'Live Stress-Strain Curve Plotter', 'Material Selection Menu', 'Stage Indicator HUD'],
    equations: [
      '\\sigma = \\frac{P}{A_0}, \\quad \\epsilon = \\frac{\\Delta L}{L_0}',
      'E = \\frac{\\sigma}{\\epsilon}',
      '\\text{UTS} = \\frac{P_{max}}{A_0}',
    ],
  },

  // 15. Beam Bending SFD & BMD (Civil / Structural)
  {
    id: 'beam-bending',
    title: 'Beam Bending Mechanics: Shear Force & Bending Moment Diagrams',
    shortTitle: 'Beam SFD & BMD',
    description:
      'Structural mechanics workbench for simply supported and cantilever beams. Apply point loads and distributed loads to plot real-time SFD V(x), BMD M(x), and deflection delta(x).',
    laboratoryId: 'civil',
    category: 'Structural Analysis',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/civil?exp=beam-bending',
    disciplineColor: '#3B82F6',
    featured: true,
    tags: ['Beam', 'SFD', 'BMD', 'Shear Force', 'Bending Moment', 'Deflection', 'Flexural Stress'],
    learningObjectives: [
      'Construct shear force and bending moment diagrams for combined point and UDL loadings',
      'Locate points of zero shear corresponding to maximum bending moment',
      'Compute maximum outer-fiber flexural stress using Euler-Bernoulli equation sigma = M*y/I',
    ],
    capabilities: ['Interactive Span & Load Sliders', 'Simultaneous Dual SFD/BMD Plotters', 'Deflection Profile Curve', 'Section Modulus HUD'],
    equations: [
      'V(x) = \\frac{dM}{dx}, \\quad M(x) = \\int V(x) dx',
      '\\frac{M}{I} = \\frac{\\sigma}{y} = \\frac{E}{R}',
      '\\delta_{max} = \\frac{5 w L^4}{384 E I} + \\frac{P L^3}{48 E I}',
    ],
  },

  // 16. Transformer O.C. & S.C. Tests (Electrical Machines)
  {
    id: 'transformer-test',
    title: 'Single-Phase Transformer Open & Short Circuit Tests',
    shortTitle: 'Transformer Tests',
    description:
      'Electrical machines laboratory. Perform no-load O.C. test and full-load S.C. test to extract core loss resistance Rc, magnetizing reactance Xm, equivalent impedance, and efficiency curve.',
    laboratoryId: 'ece',
    category: 'Electrical Machines',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/electrical?exp=transformer-test',
    disciplineColor: '#059669',
    featured: true,
    tags: ['Transformer', 'OC Test', 'SC Test', 'Efficiency', 'Voltage Regulation', 'Core Loss', 'Copper Loss'],
    learningObjectives: [
      'Determine shunt branch parameters Rc and Xm from open-circuit test measurements',
      'Calculate series equivalent parameters Req and Xeq from short-circuit test data',
      'Evaluate transformer efficiency vs load fraction and voltage regulation for lagging/leading power factors',
    ],
    capabilities: ['Variac & Meter HUD', 'Equivalent Circuit Parameter Display', 'Efficiency vs Load Curve', 'Power Factor Lag/Lead Selector'],
    equations: [
      'R_c = \\frac{V_0^2}{W_0}, \\quad X_m = \\frac{V_0}{I_0 \\sin\\phi_0}',
      'R_{eq} = \\frac{W_{sc}}{I_{sc}^2}, \\quad Z_{eq} = \\frac{V_{sc}}{I_{sc}}',
      '\\eta = \\frac{x S \\cos\\phi}{x S \\cos\\phi + P_i + x^2 P_{cu}} \\times 100\\%',
    ],
  },

  // 17. Series RLC AC Resonance (Electrical / Signals)
  {
    id: 'rlc-resonance',
    title: 'Series RLC Circuit AC Resonance & Frequency Response',
    shortTitle: 'RLC Resonance',
    description:
      'AC circuit resonance testbench. Sweep frequency from 100 Hz to 1500 Hz to observe resonance peak, minimum impedance Z = R, Quality Factor Q, and phasor phase angles.',
    laboratoryId: 'ece',
    category: 'Circuits and Electronics',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/electrical?exp=rlc-resonance',
    disciplineColor: '#7C3AED',
    featured: true,
    tags: ['RLC', 'Resonance', 'Quality Factor', 'Bandwidth', 'Impedance', 'Phasor', 'AC Circuits'],
    learningObjectives: [
      'Validate analytical resonant frequency formula f0 = 1 / (2*pi*sqrt(LC))',
      'Analyze frequency response bandwidth BW and Quality Factor Q = omega0*L / R',
      'Observe transition between capacitive (f < f0), purely resistive (f = f0), and inductive (f > f0) regimes',
    ],
    capabilities: ['Frequency Sweep Generator', 'Resonance Bell Curve Plotter', 'L-C-R Component Sliders', 'Phasor Voltage Meters'],
    equations: [
      'f_0 = \\frac{1}{2\\pi\\sqrt{LC}}',
      'Z(f) = \\sqrt{R^2 + (\\omega L - \\frac{1}{\\omega C})^2}',
      'Q = \\frac{\\omega_0 L}{R} = \\frac{f_0}{BW}',
    ],
  },

  // 18. Chemical Reaction Engineering: CSTR vs PFR (Chemical)
  {
    id: 'reactor-kinetics',
    title: 'Chemical Reaction Engineering: CSTR vs PFR Performance',
    shortTitle: 'CSTR vs PFR Reactors',
    description:
      'Reaction engineering laboratory. Compare isothermal performance of Continuous Stirred Tank Reactor (CSTR) vs Plug Flow Reactor (PFR) for first-order reaction kinetics.',
    laboratoryId: 'chemical',
    category: 'Reaction Engineering',
    difficulty: 'Advanced',
    status: 'available',
    route: '/experiments/chemical?exp=reactor-kinetics',
    disciplineColor: '#059669',
    featured: true,
    tags: ['CSTR', 'PFR', 'Reaction Engineering', 'Kinetics', 'Damkohler', 'Space Time', 'Conversion'],
    learningObjectives: [
      'Evaluate Damköhler number Da = k*tau and its influence on reactant conversion',
      'Demonstrate why PFR achieves strictly higher conversion than CSTR for identical space time',
      'Determine reactor volume ratio required to achieve identical fractional conversion',
    ],
    capabilities: ['Dual CSTR/PFR Comparison Graph', 'Space Time & Flow Rate Sliders', 'Effluent Concentration HUD', 'Volume Ratio Meter'],
    equations: [
      'X_{CSTR} = \\frac{Da}{1 + Da}, \\quad X_{PFR} = 1 - e^{-Da}',
      'Da = k \\tau = \\frac{k V}{v_0}',
      '\\frac{V_{CSTR}}{V_{PFR}} = \\frac{X / (1-X)}{\\ln(1 / (1-X))}',
    ],
  },

  // 19. Microbial Growth & Monod Fermentation (Biotechnology)
  {
    id: 'bacterial-growth',
    title: 'Microbial Growth & Monod Kinetics Batch Fermentation',
    shortTitle: 'Microbial Fermentation',
    description:
      'Bioprocess engineering laboratory. Simulate bacterial growth curves through lag, exponential log, stationary, and death phases under Monod substrate limitation.',
    laboratoryId: 'biotech',
    category: 'Bioprocess Engineering',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/biotech?exp=bacterial-growth',
    disciplineColor: '#10B981',
    featured: true,
    tags: ['Microbial Growth', 'Monod', 'Fermentation', 'Biomass', 'Doubling Time', 'Yield Factor'],
    learningObjectives: [
      'Model bacterial specific growth rate using the Monod equation mu = mu_max * S / (Ks + S)',
      'Identify transitions between lag, log, stationary, and death phases in batch culture',
      'Calculate doubling generation time td = ln(2) / mu_max and biomass yield coefficient Yx/s',
    ],
    capabilities: ['Biomass & Substrate Dual Trajectory Plot', 'Monod Kinetic Parameter Controls', 'Growth Phase Flag HUD', 'Doubling Time Gauge'],
    equations: [
      '\\mu = \\mu_{max} \\frac{S}{K_s + S}',
      '\\frac{dX}{dt} = (\\mu - k_d) X',
      't_d = \\frac{\\ln 2}{\\mu_{max}}, \\quad Y_{X/S} = \\frac{\\Delta X}{\\Delta S}',
    ],
  },

  // 20. Einstein's Photoelectric Effect (Physics)
  {
    id: 'photoelectric-effect',
    title: "Einstein's Photoelectric Effect & Planck's Constant",
    shortTitle: 'Photoelectric Effect',
    description:
      'Modern physics laboratory. Irradiate metal targets with monochromatic light, adjust retarding voltage, record I-V curves, and determine stopping potential Vs and Planck\'s constant h.',
    laboratoryId: 'physics',
    category: 'Modern Physics',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/physics',
    disciplineColor: '#F59E0B',
    featured: true,
    tags: ['Photoelectric', 'Planck Constant', 'Work Function', 'Stopping Potential', 'Photons', 'Threshold Frequency'],
    learningObjectives: [
      'Verify Einstein\'s photoelectric equation eVs = h*nu - Phi experimentally',
      'Confirm independence of stopping potential from incident light intensity',
      'Determine cathode work function Phi and threshold cut-off wavelength lambda0',
    ],
    capabilities: ['Cathode Metal Selector (Cs, Na, K, Zn, Cu)', 'Monochromatic Wavelength Tuner', 'Retarding Voltage Dial', 'Real-time I-V Curve HUD'],
    equations: [
      'e V_s = h\\nu - \\Phi = \\frac{hc}{\\lambda} - \\Phi',
      'K_{max} = \\frac{1}{2} m_e v_{max}^2 = e V_s',
      '\\nu_0 = \\frac{\\Phi}{h}, \\quad \\lambda_0 = \\frac{hc}{\\Phi}',
    ],
  },

  // 21. Closed-Loop PID Controller Tuning (Robotics & Control)
  {
    id: 'pid-tuning',
    title: 'Closed-Loop PID Controller Tuning & Dynamic Step Response',
    shortTitle: 'PID Controller Tuning',
    description:
      'Control systems and robotics workbench. Tune proportional Kp, integral Ki, and derivative Kd gains to eliminate steady-state error and optimize transient step response.',
    laboratoryId: 'robotics',
    category: 'Control Systems',
    difficulty: 'Advanced',
    status: 'available',
    route: '/experiments/robotics?exp=pid-tuning',
    disciplineColor: '#8B5CF6',
    featured: true,
    tags: ['PID', 'Control Systems', 'Step Response', 'Overshoot', 'Rise Time', 'Settling Time', 'Feedback'],
    learningObjectives: [
      'Understand roles of proportional, integral, and derivative terms in closed-loop error correction',
      'Minimize rise time tr and peak overshoot Mp% while maintaining closed-loop stability',
      'Eliminate steady-state error using integral action without introducing windup oscillations',
    ],
    capabilities: ['Kp, Ki, Kd Tuning Sliders', 'Transient Step Response Scope', 'Performance Indices HUD (tr, tp, ts, Mp)', 'Plant Damping Controls'],
    equations: [
      'u(t) = K_p e(t) + K_i \\int e(\\tau) d\\tau + K_d \\frac{de(t)}{dt}',
      'G(s) = \\frac{\\omega_n^2}{s^2 + 2\\zeta \\omega_n s + \\omega_n^2}',
      'M_p = e^{-\\frac{\\pi \\zeta}{\\sqrt{1 - \\zeta^2}}} \\times 100\\%',
    ],
  },

  // 22. Pipe Friction (Mechanical)
  {
    id: 'pipe-friction',
    title: 'Darcy-Weisbach Major & Minor Pipe Friction Losses',
    shortTitle: 'Pipe Friction & Losses',
    description: 'Investigate frictional pressure drops in fluid pipes across laminar, transition, and turbulent flow regimes, Moody chart, and manometer head loss.',
    laboratoryId: 'mechanical',
    category: 'Fluid Mechanics',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/mechanical?exp=pipe-friction',
    disciplineColor: '#3B82F6',
    featured: true,
    tags: ['Fluid Mechanics', 'Darcy-Weisbach', 'Reynolds Number', 'Head Loss', 'Moody Chart'],
    learningObjectives: [
      'Calculate Reynolds number and determine laminar vs turbulent transition',
      'Evaluate Darcy friction factor f via Swamee-Jain and Colebrook-White formulations',
      'Relate frictional head loss hf to flow rate and commercial pipe roughness',
    ],
    capabilities: ['Pipe Diameter & Roughness Controls', 'Fluid Velocity Slider', 'U-Tube Manometer Deflection View', 'Reynolds Number Indicator'],
    equations: ['h_f = f \\frac{L}{D} \\frac{v^2}{2g}', 'Re = \\frac{\\rho v D}{\\mu}', '\\Delta P = \\rho g h_f'],
  },

  // 23. Torsion Test (Mechanical)
  {
    id: 'torsion-test',
    title: 'Torsion Testing of Circular Shaft & Shear Modulus (G)',
    shortTitle: 'Torsion Testing',
    description: 'Determine torsional stiffness, polar moment of inertia J, maximum surface shear stress, and modulus of rigidity G of solid and hollow shafts.',
    laboratoryId: 'mechanical',
    category: 'Mechanics of Solids',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/mechanical?exp=torsion-test',
    disciplineColor: '#8B5CF6',
    tags: ['Torsion', 'Shear Stress', 'Angle of Twist', 'Polar Moment', 'Rigidity Modulus'],
    learningObjectives: [
      'Verify the torsion formula T/J = tau/r = G*theta/L',
      'Examine distribution of shear stress across circular cross-sections',
      'Determine yield torque and elastic angle of twist',
    ],
    capabilities: ['Shaft Dimension Controls', 'Torque Dynamometer Dial', '3D Twist Visualizer', 'Stress Distribution HUD'],
    equations: ['\\frac{T}{J} = \\frac{\\tau}{r} = \\frac{G \\theta}{L}', 'J = \\frac{\\pi D^4}{32}', '\\tau_{max} = \\frac{T D}{2J}'],
  },

  // 24. Four-Bar Linkage (Mechanical)
  {
    id: 'four-bar',
    title: 'Four-Bar Planar Mechanism Kinematics (Grashof Criterion)',
    shortTitle: 'Four-Bar Linkage',
    description: 'Synthesize planar four-bar linkages, classify mechanisms using the Grashof criterion (s+l <= p+q), compute transmission angles, and trace coupler curves.',
    laboratoryId: 'mechanical',
    category: 'Theory of Machines',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/mechanical?exp=four-bar',
    disciplineColor: '#10B981',
    featured: true,
    tags: ['Four-Bar', 'Kinematics', 'Grashof', 'Transmission Angle', 'Coupler Curve', 'Mechanism'],
    learningObjectives: [
      'Apply Grashof mobility criterion to identify crank-rocker, double-crank, and double-rocker mechanisms',
      'Evaluate Freudenstein loop-closure equations for angular positions',
      'Monitor transmission angle mu to prevent mechanical toggle locking',
    ],
    capabilities: ['Link Length Sliders (a, b, c, d)', 'Interactive Crank Rotation', 'Coupler Curve Path Tracer', 'Transmission Angle Monitor'],
    equations: ['s + l \\le p + q', 'K_1 \\cos\\theta_4 - K_2 \\cos\\theta_2 + K_3 = \\cos(\\theta_2 - \\theta_4)'],
  },

  // 25. Column Buckling (Civil)
  {
    id: 'column-buckling',
    title: 'Euler Column Buckling & Critical Slenderness Ratio',
    shortTitle: 'Column Buckling',
    description: 'Investigate elastic stability of slender structural columns under axial compression, effective length factors K, and Rankine-Gordon transition.',
    laboratoryId: 'civil',
    category: 'Structural Mechanics',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/civil?exp=column-buckling',
    disciplineColor: '#D97706',
    featured: true,
    tags: ['Buckling', 'Euler Critical Load', 'Slenderness Ratio', 'Effective Length', 'Rankine Formula'],
    learningObjectives: [
      'Derive Euler critical buckling load Pcr for various end boundary conditions',
      'Understand the significance of slenderness ratio lambda = Le / r_min',
      'Distinguish elastic buckling failure from material crushing failure',
    ],
    capabilities: ['End Condition Selectors (Pinned, Fixed, Free)', 'Cross-Section Geometry Customizer', 'Buckled Mode Shape Renderer', 'Rankine-Gordon Curve'],
    equations: ['P_{cr} = \\frac{\\pi^2 E I}{L_e^2}', '\\sigma_{cr} = \\frac{\\pi^2 E}{\\lambda^2}', '\\frac{1}{P_R} = \\frac{1}{P_c} + \\frac{1}{P_E}'],
  },

  // 26. Direct Shear Test (Civil)
  {
    id: 'direct-shear',
    title: 'Soil Direct Shear Test & Mohr-Coulomb Failure Envelope',
    shortTitle: 'Soil Direct Shear',
    description: 'Determine soil shear strength parameters: internal friction angle phi and effective cohesion c using laboratory shear box data.',
    laboratoryId: 'civil',
    category: 'Geotechnical Engineering',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/civil?exp=direct-shear',
    disciplineColor: '#B45309',
    tags: ['Soil Mechanics', 'Direct Shear', 'Mohr-Coulomb', 'Friction Angle', 'Cohesion'],
    learningObjectives: [
      'Construct Mohr-Coulomb failure envelope tau = c + sigma_n * tan(phi)',
      'Determine peak and residual shear strengths of sands and clays',
      'Understand normal stress application and shear displacement rates',
    ],
    capabilities: ['Soil Type Presets (Dense Sand, Loose Sand, Clay)', 'Multi-Normal Stress Test Battery', 'Mohr-Coulomb Envelope Plotter', 'Shear Stress vs Displacement Curve'],
    equations: ['\\tau_f = c + \\sigma_n \\tan\\phi', '\\sigma_n = \\frac{N}{A_0}', '\\tau = \\frac{F_s}{A_0}'],
  },

  // 27. Weir & Notch Flow (Civil)
  {
    id: 'weir-flow',
    title: 'Open Channel Flow Discharge over Notches & Sharp-Crested Weirs',
    shortTitle: 'Weir & Notch Flow',
    description: 'Calibrate rectangular, triangular (V-notch), and trapezoidal (Cipolletti) weirs for flow measurement in open hydraulic channels.',
    laboratoryId: 'civil',
    category: 'Hydraulics',
    difficulty: 'Introductory',
    status: 'available',
    route: '/experiments/civil?exp=weir-flow',
    disciplineColor: '#0284C7',
    tags: ['Hydraulics', 'Weirs', 'Notches', 'Open Channel', 'Discharge Coefficient', 'Nappe Flow'],
    learningObjectives: [
      'Relate discharge Q to upstream head H over weir crest',
      'Determine discharge coefficient Cd for rectangular and triangular notches',
      'Observe nappe aeration and end contraction effects',
    ],
    capabilities: ['Notch Geometry Switcher (Rectangular, V-Notch, Cipolletti)', 'Head H Water Level Control', 'Nappe Flow Profile Canvas', 'Theoretical vs Actual Q HUD'],
    equations: ['Q_{rect} = \\frac{2}{3} C_d b \\sqrt{2g} H^{3/2}', 'Q_{tri} = \\frac{8}{15} C_d \\tan(\\frac{\\theta}{2}) \\sqrt{2g} H^{5/2}'],
  },

  // 28. DC Shunt Motor (Electrical)
  {
    id: 'dc-motor',
    title: 'DC Shunt Motor Speed Control & Torque-Speed Characteristics',
    shortTitle: 'DC Shunt Motor',
    description: 'Simulate speed control of DC shunt motors via armature voltage variation and field flux weakening, back-EMF, and torque-speed regulation.',
    laboratoryId: 'ece',
    category: 'Electrical Machines',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/electrical?exp=dc-motor',
    disciplineColor: '#DC2626',
    featured: true,
    tags: ['DC Motor', 'Electrical Machines', 'Speed Control', 'Back EMF', 'Torque-Speed'],
    learningObjectives: [
      'Understand back-EMF Eb = V - Ia*Ra generation and speed relationship',
      'Examine armature control (constant torque) vs field weakening (constant power)',
      'Observe torque-speed droop characteristics under mechanical loads',
    ],
    capabilities: ['Armature Voltage Slider', 'Field Rheostat Control', 'Mechanical Load Dynamometer', 'Torque-Speed Curve Scope'],
    equations: ['N = \\frac{V - I_a R_a}{k \\Phi}', 'T_e = k \\Phi I_a', 'E_b = V - I_a R_a'],
  },

  // 29. Two-Wattmeter 3-Phase (Electrical)
  {
    id: 'two-wattmeter',
    title: '3-Phase Power & Power Factor Measurement by Two-Wattmeter Method',
    shortTitle: 'Two-Wattmeter Method',
    description: 'Measure total active power and load power factor across balanced 3-phase star/delta AC systems using two electrodynamometer wattmeters.',
    laboratoryId: 'ece',
    category: 'Electrical Measurements',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/electrical?exp=two-wattmeter',
    disciplineColor: '#D97706',
    tags: ['3-Phase', 'Two-Wattmeter', 'Power Factor', 'Active Power', 'Reactive Power', 'Star-Delta'],
    learningObjectives: [
      'Verify P_total = W1 + W2 in balanced 3-phase circuits',
      'Compute power factor angle phi from wattmeter readings difference',
      'Analyze special power factor cases: unity (W1=W2), 0.5 (W2=0), <0.5 (W2 negative)',
    ],
    capabilities: ['Balanced Star/Delta Load Selector', 'R-L-C Phase Impedance Tuning', 'Wattmeter Dial Gauges', 'Phasor Vector Diagram HUD'],
    equations: ['P = W_1 + W_2 = \\sqrt{3} V_L I_L \\cos\\phi', '\\tan\\phi = \\sqrt{3} \\frac{W_1 - W_2}{W_1 + W_2}'],
  },

  // 30. Alternator Regulation (Electrical)
  {
    id: 'alternator-regulation',
    title: 'Alternator Voltage Regulation by Synchronous Impedance Method',
    shortTitle: 'Alternator Regulation',
    description: 'Determine synchronous impedance Zs from Open-Circuit (OCC) and Short-Circuit (SCC) tests, and calculate percentage voltage regulation.',
    laboratoryId: 'ece',
    category: 'AC Machines',
    difficulty: 'Advanced',
    status: 'available',
    route: '/experiments/electrical?exp=alternator-regulation',
    disciplineColor: '#0284C7',
    tags: ['Alternator', 'Synchronous Generator', 'Voltage Regulation', 'OCC', 'SCC', 'EMF Method'],
    learningObjectives: [
      'Extract synchronous reactance Xs from OCC saturation and SCC lines',
      'Construct alternator phasor diagrams at lagging, unity, and leading power factors',
      'Observe negative voltage regulation under leading capacitive loads',
    ],
    capabilities: ['Power Factor Slider (0.5 to 1.0)', 'Lag/Lead Power Factor Switch', 'OCC & SCC Dual Curve Scope', 'Phasor EMF Calculator'],
    equations: ['Z_s = \\frac{V_{oc}}{I_{sc}}', 'E_0 = \\sqrt{(V\\cos\\phi + I_a R_a)^2 + (V\\sin\\phi \\pm I_a X_s)^2}', '\\% \\text{Reg} = \\frac{E_0 - V}{V} \\times 100'],
  },

  // 31. Liquid-Liquid Extraction (Chemical)
  {
    id: 'liquid-extraction',
    title: 'Liquid-Liquid Extraction (LLE) & Ternary Phase Equilibrium',
    shortTitle: 'Liquid Extraction',
    description: 'Simulate cross-current liquid-liquid extraction, ternary binodal solubility dome, partition coefficient K, and solute recovery percentage.',
    laboratoryId: 'chemical',
    category: 'Separation Processes',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/chemical?exp=liquid-extraction',
    disciplineColor: '#0D9488',
    featured: true,
    tags: ['Separation', 'Liquid Extraction', 'Binodal Curve', 'Ternary Equilibrium', 'Solvent Recovery'],
    learningObjectives: [
      'Calculate multi-stage cross-current extraction material balances',
      'Understand the influence of distribution coefficient K on recovery',
      'Interpret ternary liquid-liquid equilibrium phase diagrams',
    ],
    capabilities: ['Solvent Flow Rate Slider', 'Distribution Coeff K Tuner', 'Stage Count Selector (1-4)', 'Ternary Binodal Plot'],
    equations: ['K = \\frac{y_E}{x_R}', 'F x_F + S y_S = E y_E + R x_R', '\\eta = \\frac{E y_E}{F x_F} \\times 100\\%'],
  },

  // 32. Heat Exchanger (Chemical)
  {
    id: 'heat-exchanger',
    title: 'Double-Pipe & Shell-and-Tube Heat Exchanger Performance',
    shortTitle: 'Heat Exchanger',
    description: 'Thermal performance of concentric double-pipe heat exchangers in counter-current and co-current flows, LMTD, and effectiveness-NTU analysis.',
    laboratoryId: 'chemical',
    category: 'Heat Transfer',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/chemical?exp=heat-exchanger',
    disciplineColor: '#F59E0B',
    featured: true,
    tags: ['Heat Transfer', 'Heat Exchanger', 'LMTD', 'NTU', 'Counter-Current', 'Effectiveness'],
    learningObjectives: [
      'Evaluate Log Mean Temperature Difference (LMTD) for parallel and counter-current flows',
      'Determine overall heat transfer coefficient U and thermal heat duty Q',
      'Apply effectiveness-NTU method to predict outlet temperatures',
    ],
    capabilities: ['Counter/Co-Current Flow Switch', 'Inlet Temperature & Flow Rate Sliders', 'Temperature Profile Along Exchanger Length', 'LMTD & NTU Gauge HUD'],
    equations: ['Q = U A \\Delta T_{lm}', '\\Delta T_{lm} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)}', '\\epsilon = \\frac{Q}{Q_{max}}'],
  },

  // 33. Gas Absorption (Chemical)
  {
    id: 'gas-absorption',
    title: 'Gas Absorption in Packed Bed Column & Number of Transfer Units',
    shortTitle: 'Gas Absorption Column',
    description: 'Design packed absorption columns for gas-liquid mass transfer, Colburn equation, Number of Transfer Units N_OG, and bed height Z.',
    laboratoryId: 'chemical',
    category: 'Mass Transfer',
    difficulty: 'Advanced',
    status: 'available',
    route: '/experiments/chemical?exp=gas-absorption',
    disciplineColor: '#0284C7',
    tags: ['Mass Transfer', 'Gas Absorption', 'Packed Column', 'Transfer Units', 'Colburn Equation'],
    learningObjectives: [
      'Calculate absorption factor A = L / (m * G)',
      'Compute overall gas transfer units N_OG using Colburn analytical equation',
      'Determine required height of packed bed Z = N_OG * H_OG',
    ],
    capabilities: ['Gas & Solvent Flow Rate Controls', 'Inlet Solute Fraction Tuner', 'Packed Bed Animation', 'Operating vs Equilibrium Line Plot'],
    equations: ['A = \\frac{L}{m G}', 'N_{OG} = \\frac{\\ln\\left[\\frac{y_1 - m x_2}{y_2 - m x_2}(1 - \\frac{1}{A}) + \\frac{1}{A}\\right]}{1 - \\frac{1}{A}}', 'Z = N_{OG} H_{OG}'],
  },

  // 34. Bioreactor KLa (Biotech)
  {
    id: 'kla-bioreactor',
    title: 'Volumetric Oxygen Transfer Coefficient (KLa) in Bioreactors',
    shortTitle: 'Bioreactor KLa & OTR',
    description: 'Measure volumetric oxygen transfer coefficient KLa in benchtop fermenters using the dynamic gassing-out method under variable RPM and aeration.',
    laboratoryId: 'biotech',
    category: 'Bioprocess Engineering',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/biotech?exp=kla-bioreactor',
    disciplineColor: '#06B6D4',
    featured: true,
    tags: ['Bioreactor', 'KLa', 'Oxygen Transfer', 'OTR', 'Aeration', 'Fermentation'],
    learningObjectives: [
      'Apply the dynamic gassing-out method to measure KLa',
      'Evaluate effects of impeller RPM and air sparge vvm on gas-liquid interfacial area',
      'Determine maximum oxygen transfer rate OTR_max to prevent cellular hypoxia',
    ],
    capabilities: ['Impeller Agitation Slider (200-800 RPM)', 'Aeration Rate Tuner (vvm)', 'Dissolved Oxygen Reoxygenation Curve', 'Semi-Log Deficit Slope HUD'],
    equations: ['\\frac{dC_L}{dt} = K_L a (C^* - C_L)', '\\text{OTR}_{max} = K_L a \\cdot C^*'],
  },

  // 35. Gel Chromatography (Biotech)
  {
    id: 'chromatography',
    title: 'Size Exclusion / Gel Filtration Chromatography (SEC)',
    shortTitle: 'Gel Chromatography',
    description: 'Separate protein mixtures based on hydrodynamic molecular size through dextran bead matrices, void volume V0, and calibration curves.',
    laboratoryId: 'biotech',
    category: 'Downstream Processing',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/biotech?exp=chromatography',
    disciplineColor: '#8B5CF6',
    featured: true,
    tags: ['Chromatography', 'Size Exclusion', 'Protein Purification', 'Partition Coefficient', 'Resolution'],
    learningObjectives: [
      'Understand molecular exclusion mechanisms in porous dextran/agarose beads',
      'Determine void volume V0, total volume Vt, and elution volumes Ve',
      'Assess chromatographic resolution Rs and achieve baseline peak separation',
    ],
    capabilities: ['Column Height & Flow Rate Sliders', 'Protein Sample Composition Selector', 'UV 280nm Chromatogram Scope', 'Molecular Weight Log Calibration'],
    equations: ['K_{av} = \\frac{V_e - V_0}{V_t - V_0}', 'R_s = \\frac{2 (V_{e,2} - V_{e,1})}{w_1 + w_2}'],
  },

  // 36. PCR Amplification Kinetics (Biotech)
  {
    id: 'pcr-kinetics',
    title: 'Polymerase Chain Reaction (PCR) Amplification Kinetics',
    shortTitle: 'PCR & qPCR Kinetics',
    description: 'Model real-time quantitative PCR (qPCR) amplification curves, 3-step thermal cycling, cycle threshold Ct, and enzyme efficiency.',
    laboratoryId: 'biotech',
    category: 'Molecular Biology',
    difficulty: 'Introductory',
    status: 'available',
    route: '/experiments/biotech?exp=pcr-kinetics',
    disciplineColor: '#F43F5E',
    tags: ['PCR', 'qPCR', 'DNA Amplification', 'Threshold Cycle', 'Thermal Cycling'],
    learningObjectives: [
      'Model exponential doubling of DNA amplicons N = N0*(1+E)^n',
      'Determine threshold cycle Ct from fluorescent baseline crossing',
      'Observe transition into linear and plateau phases due to dNTP exhaustion',
    ],
    capabilities: ['Initial Template Copy Slider', 'Amplification Efficiency Tuner', 'Sigmoid Fluorescence Curve Scope', 'Thermal Profile Step Visualizer'],
    equations: ['N = N_0 (1 + E)^n', 'C_t = \\frac{\\log(N_{threshold}) - \\log(N_0)}{\\log(1 + E)}'],
  },

  // 37. Newton's Rings (Physics)
  {
    id: 'newtons-rings',
    title: "Newton's Rings Interference & Wavelength Determination",
    shortTitle: "Newton's Rings",
    description: 'Measure monochromatic sodium D-line wavelength and liquid refractive indices using circular thin-film interference fringes.',
    laboratoryId: 'physics',
    category: 'Wave Optics',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/physics?exp=newtons-rings',
    disciplineColor: '#3B82F6',
    featured: true,
    tags: ['Wave Optics', 'Interference', 'Newtons Rings', 'Wavelength', 'Thin Film'],
    learningObjectives: [
      'Derive constructive and destructive interference conditions in air wedges',
      'Verify Dn^2 proportional to ring order n',
      'Determine lens radius of curvature R and liquid film refractive index',
    ],
    capabilities: ['Monochromatic Wavelength Tuner', 'Plano-Convex Lens Radius Dial', 'Liquid Medium Selector (Air, Water, Glycerin)', 'Fringe Diameter HUD'],
    equations: ['D_n^2 = 4 n \\lambda R', '\\lambda = \\frac{D_{n+p}^2 - D_n^2}{4 p R}', '\\mu = \\frac{(D_n^2)_{air}}{(D_n^2)_{liquid}}'],
  },

  // 38. Diffraction Grating (Physics)
  {
    id: 'diffraction-grating',
    title: 'Plane Diffraction Grating Spectrometer & Angular Dispersion',
    shortTitle: 'Diffraction Grating',
    description: 'Calibrate optical spectrometers, determine ruling element d = 1/N, resolve spectral lines of Mercury and Sodium doublet separation.',
    laboratoryId: 'physics',
    category: 'Optics & Spectroscopy',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/physics?exp=diffraction-grating',
    disciplineColor: '#8B5CF6',
    tags: ['Optics', 'Diffraction Grating', 'Spectrometer', 'Dispersion', 'Resolving Power'],
    learningObjectives: [
      'Apply grating formula (a+b)*sin(theta) = m*lambda at normal incidence',
      'Measure angular dispersion d(theta)/d(lambda)',
      'Evaluate Rayleigh criterion for resolving Sodium doublet lines (0.6 nm apart)',
    ],
    capabilities: ['Grating Density Selector (300, 600, 1000 lines/mm)', 'Spectral Order Switcher (m=1, 2)', 'Dispersed Spectral Lines View', 'Doublet Resolution Gauge'],
    equations: ['d \\sin\\theta = m \\lambda', '\\frac{d\\theta}{d\\lambda} = \\frac{m}{d \\cos\\theta}', '\\frac{\\lambda}{\\Delta\\lambda} = m N_{total}'],
  },

  // 39. Coupled Oscillators (Physics)
  {
    id: 'coupled-oscillators',
    title: 'Coupled Harmonic Oscillators, Normal Modes & Beats',
    shortTitle: 'Coupled Oscillators',
    description: 'Explore energy transfer between coupled mechanical masses, in-phase symmetric mode w1, out-of-phase antisymmetric mode w2, and beat periods.',
    laboratoryId: 'physics',
    category: 'Mechanics & Waves',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/physics?exp=coupled-oscillators',
    disciplineColor: '#10B981',
    tags: ['Oscillations', 'Coupled Systems', 'Normal Modes', 'Beat Frequency', 'Energy Transfer'],
    learningObjectives: [
      'Identify symmetric and antisymmetric eigen-frequencies of coupled masses',
      'Observe periodic energy transfer and beat waveforms',
      'Analyze the effect of coupling spring stiffness kc on modulation frequency',
    ],
    capabilities: ['Main & Coupling Spring Sliders', 'Initial Displacement Controls', 'Coupled Displacements Time Scope', 'Normal Mode Frequency HUD'],
    equations: ['\\omega_s = \\sqrt{\\frac{k}{m}}, \\quad \\omega_a = \\sqrt{\\frac{k + 2k_c}{m}}', 'T_{beat} = \\frac{2\\pi}{\\omega_a - \\omega_s}'],
  },

  // 40. Differential Drive Robot (Robotics)
  {
    id: 'differential-drive',
    title: 'Differential Drive Mobile Robot Kinematics & Odometry',
    shortTitle: 'Differential Drive Robot',
    description: 'Simulate forward kinematics and dead-reckoning odometry of two-wheeled mobile robots, instantaneous center of curvature, and 2D trajectory tracking.',
    laboratoryId: 'robotics',
    category: 'Mobile Robotics',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/robotics?exp=differential-drive',
    disciplineColor: '#10B981',
    featured: true,
    tags: ['Robotics', 'Differential Drive', 'Odometry', 'Kinematics', 'Unicycle Model', 'ICC'],
    learningObjectives: [
      'Formulate unicycle kinematic equations from left and right wheel angular velocities',
      'Calculate robot linear forward speed v and chassis yaw rate omega',
      'Compute instantaneous center of curvature (ICC) and turning radius',
    ],
    capabilities: ['Independent Left/Right Wheel Speed Sliders', 'Wheelbase & Radius Geometry Controls', '2D Trajectory Arena Canvas', 'Pose Vector HUD (x, y, theta)'],
    equations: ['v = \\frac{v_R + v_L}{2}, \\quad \\omega = \\frac{v_R - v_L}{L}', 'R = \\frac{L}{2} \\frac{v_R + v_L}{v_R - v_L}'],
  },

  // 41. Inverted Pendulum (Robotics)
  {
    id: 'inverted-pendulum',
    title: 'Inverted Pendulum on a Cart: State-Space LQR Stabilization',
    shortTitle: 'Inverted Pendulum Cart',
    description: 'Stabilize an inherently unstable non-linear inverted pendulum using linearized 4-state state-space full state feedback LQR control.',
    laboratoryId: 'robotics',
    category: 'State Space Control',
    difficulty: 'Advanced',
    status: 'available',
    route: '/experiments/robotics?exp=inverted-pendulum',
    disciplineColor: '#EF4444',
    featured: true,
    tags: ['Control Systems', 'Inverted Pendulum', 'State Space', 'LQR', 'Stabilization', 'Feedback'],
    learningObjectives: [
      'Formulate linearized state-space matrices [A, B] for cart-pendulum system',
      'Design stabilizing full-state feedback controller u = -Kx',
      'Assess closed-loop eigenvalue placement and disturbance settling time',
    ],
    capabilities: ['Initial Tilt Angle Disturbance Slider', 'LQR Gain Parameter Controls', 'Cart Position & Angle Time Scope', 'Controllability Matrix HUD'],
    equations: ['\\dot{\\mathbf{x}} = A \\mathbf{x} + B u', 'u = -K \\mathbf{x}', '\\omega_0 = \\sqrt{\\frac{(M+m)mgl}{D}}'],
  },

  // 42. Bode Plot (Robotics & Control)
  {
    id: 'bode-plot',
    title: 'Bode Plot Frequency Response: Stability, Gain & Phase Margins',
    shortTitle: 'Bode Stability Margins',
    description: 'Construct logarithmic magnitude and phase frequency response curves, locate gain/phase crossover frequencies, and verify Nyquist stability margins.',
    laboratoryId: 'robotics',
    category: 'Frequency Domain Control',
    difficulty: 'Advanced',
    status: 'available',
    route: '/experiments/robotics?exp=bode-plot',
    disciplineColor: '#F59E0B',
    tags: ['Control Systems', 'Bode Plot', 'Frequency Response', 'Phase Margin', 'Gain Margin', 'Stability'],
    learningObjectives: [
      'Plot logarithmic asymptotic magnitude (dB) and phase (degrees) vs frequency',
      'Determine gain crossover wgc and phase crossover wpc frequencies',
      'Evaluate phase margin PM and gain margin GM for closed-loop stability',
    ],
    capabilities: ['Open-Loop Gain K Slider', 'Natural Frequency wn & Damping Zeta Controls', 'Magnitude & Phase Dual Plot Canvas', 'Stability Decision HUD'],
    equations: ['M_{dB} = 20 \\log_{10} |G(j\\omega)|', '\\text{PM} = 180^\\circ + \\phi(\\omega_{gc})', '\\text{GM} = -20 \\log_{10} |G(j\\omega_{pc})|'],
  },

  // 43. BJT Characteristics (ECE)
  {
    id: 'bjt-characteristics',
    title: 'BJT Common Emitter (CE) Input & Output Characteristics',
    shortTitle: 'BJT Characteristics',
    description: 'Plot input and output family of characteristic curves of BJT in common emitter configuration, Early voltage VA, and small-signal parameters.',
    laboratoryId: 'ece',
    category: 'Semiconductor Devices',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/ece/analog?exp=bjt-characteristics',
    disciplineColor: '#06B6D4',
    featured: true,
    tags: ['BJT', 'Transistor', 'Common Emitter', 'Input Curves', 'Output Curves', 'Early Voltage'],
    learningObjectives: [
      'Plot input characteristics IB vs VBE and dynamic resistance r_pi',
      'Plot output characteristics IC vs VCE and identify cutoff, active, and saturation regions',
      'Extract transistor current gain beta and transconductance gm',
    ],
    capabilities: ['Base Current IB Step Tuner', 'VCE Collector Voltage Sweep', 'Output Characteristic Family of Curves', 'Q-Point Operating Region HUD'],
    equations: ['I_C = \\beta I_B \\left(1 + \\frac{V_{CE}}{V_A}\\right)', 'g_m = \\frac{I_C}{V_T}', 'r_\\pi = \\frac{\\beta}{g_m}'],
  },

  // 44. Op-Amp Circuits (ECE)
  {
    id: 'op-amp',
    title: 'Operational Amplifiers: Inverting, Non-Inverting, Summing & Integrator',
    shortTitle: 'Op-Amp Circuits',
    description: 'Verify linear operational amplifier circuit topologies, virtual ground concept, closed-loop voltage gain, summing nodes, and integrator waveforms.',
    laboratoryId: 'ece',
    category: 'Analog Electronics',
    difficulty: 'Intermediate',
    status: 'available',
    route: '/experiments/ece/analog?exp=op-amp',
    disciplineColor: '#8B5CF6',
    featured: true,
    tags: ['Op-Amp', 'Inverting', 'Non-Inverting', 'Virtual Ground', 'Integrator', 'Summing'],
    learningObjectives: [
      'Apply ideal op-amp golden rules (V+ = V-, I+ = I- = 0)',
      'Calculate closed-loop voltage gains for inverting (-Rf/Rin) and non-inverting (1 + Rf/Rin)',
      'Demonstrate analog computation using summing amplifiers and active integrators',
    ],
    capabilities: ['Topology Switcher (Inverting, Non-Inverting, Summing, Integrator)', 'Rf and Rin Resistor Sliders', 'Input Voltage Vin Controls', 'Output Waveform & Rail Saturation HUD'],
    equations: ['V_{out} = -\\frac{R_f}{R_{in}} V_{in}', 'V_{out} = \\left(1 + \\frac{R_f}{R_1}\\right) V_{in}', 'V_{out}(t) = -\\frac{1}{R C} \\int V_{in} dt'],
  },
];

/**
 * Filter simulations by query, subject, difficulty, and status
 */
export function querySimulations(options: {
  search?: string;
  laboratoryId?: string;
  difficulty?: string;
  status?: string;
}): readonly SimulationRegistryEntry[] {
  const { search = '', laboratoryId = 'all', difficulty = 'all', status = 'all' } = options;
  const q = search.trim().toLowerCase();

  return SIMULATION_REGISTRY.filter((sim) => {
    // Search match
    if (q) {
      const matchTitle = sim.title.toLowerCase().includes(q);
      const matchShort = sim.shortTitle.toLowerCase().includes(q);
      const matchDesc = sim.description.toLowerCase().includes(q);
      const matchCat = sim.category.toLowerCase().includes(q);
      const matchTags = sim.tags.some((t) => t.toLowerCase().includes(q));
      const matchObjectives = sim.learningObjectives.some((o) => o.toLowerCase().includes(q));
      if (!matchTitle && !matchShort && !matchDesc && !matchCat && !matchTags && !matchObjectives) {
        return false;
      }
    }

    // Laboratory filter
    if (laboratoryId !== 'all' && sim.laboratoryId !== laboratoryId) {
      return false;
    }

    // Difficulty filter
    if (difficulty !== 'all' && sim.difficulty.toLowerCase() !== difficulty.toLowerCase()) {
      return false;
    }

    // Status filter
    if (status !== 'all' && sim.status !== status) {
      return false;
    }

    return true;
  });
}
