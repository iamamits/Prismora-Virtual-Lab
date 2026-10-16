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
