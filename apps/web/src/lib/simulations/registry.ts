/**
 * Prismora Scalable Simulation & Laboratory Registry
 *
 * Centralized, strongly-typed metadata catalog powering Prismora Labs,
 * Explore discovery, search, filtering, and breadcrumb navigation.
 */

export type LaboratoryId =
  | 'physics'
  | 'digital-electronics'
  | 'coa'
  | 'toc'
  | 'mathematics'
  | 'engineering'
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

  // 5. Harmonic Oscillator (Planned / In Development)
  {
    id: 'harmonic-oscillator',
    title: 'Simple Harmonic Oscillator & Resonance',
    shortTitle: 'Harmonic Oscillator',
    description:
      'Mass-spring and pendulum dynamics with viscous damping, periodic driving frequency, phase space portraits, and resonance amplitude analysis.',
    laboratoryId: 'physics',
    category: 'Waves and Oscillations',
    difficulty: 'Intermediate',
    status: 'in_development',
    route: '/experiments/projectile-motion',
    disciplineColor: '#2563EB',
    tags: ['Oscillations', 'Springs', 'Resonance', 'Phase Space'],
    learningObjectives: [
      'Investigate natural frequency omega_0 and damping ratio zeta',
      'Observe underdamped, critically damped, and overdamped motion',
      'Explore phase portraits (position vs velocity) and limit cycles',
    ],
    capabilities: ['Damped Motion Stepper', 'Phase Portrait Plot', 'Driving Force Tuning'],
  },

  // 6. Vector Field Studio (Planned / In Development)
  {
    id: 'vector-field-studio',
    title: '2D/3D Vector Field Studio',
    shortTitle: 'Vector Fields',
    description:
      'Interactive vector calculus studio for visualizing curl, divergence, field flux lines, and line integrals on 2D coordinate manifolds.',
    laboratoryId: 'mathematics',
    category: 'Geometry and Vectors',
    difficulty: 'Advanced',
    status: 'in_development',
    route: '/experiments/projectile-motion',
    disciplineColor: '#8B5CF6',
    tags: ['Vector Fields', 'Calculus', 'Curl', 'Divergence'],
    learningObjectives: [
      'Understand spatial divergence as source or sink strength',
      'Visualize local rotational circulation through curl vectors',
      'Calculate line integrals along interactive user-drawn paths',
    ],
    capabilities: ['Vector Arrow Grid', 'Streamline Tracers', 'Divergence Heatmap'],
  },

  // 7. Two-Body & Keplerian Orbits (Planned)
  {
    id: 'orbital-mechanics',
    title: 'Two-Body & Keplerian Celestial Orbits',
    shortTitle: 'Keplerian Orbits',
    description:
      'Newtonian gravitational attraction, orbital eccentricity, escape velocity, and Hohmann satellite transfer ellipses.',
    laboratoryId: 'physics',
    category: 'Mechanics',
    difficulty: 'Intermediate',
    status: 'planned',
    route: '/experiments/projectile-motion',
    disciplineColor: '#2563EB',
    tags: ['Kepler', 'Gravity', 'Orbits', 'Celestial'],
    learningObjectives: [
      'Verify Kepler three laws of planetary motion',
      'Simulate Hohmann transfer orbits between celestial bodies',
    ],
    capabilities: ['Orbital Trajectory Plot', 'Eccentricity Slider', 'Transfer Velocity Calculator'],
  },

  // 8. Acid-Base Titration (Planned)
  {
    id: 'acid-base-titration',
    title: 'Acid-Base Titration & pH Curves',
    shortTitle: 'Titration Lab',
    description:
      'Dynamic pH electrode measurements, buffer solution capacity, indicator color shifts, and stoichiometric equivalence calculations.',
    laboratoryId: 'chemistry',
    category: 'Acid-Base Equilibrium',
    difficulty: 'Intermediate',
    status: 'planned',
    route: '/experiments/projectile-motion',
    disciplineColor: '#FBBF24',
    tags: ['pH', 'Titration', 'Equilibrium', 'Buffers'],
    learningObjectives: [
      'Derive Henderson-Hasselbalch buffer equations from experimental titration curves',
      'Identify equivalence points and inflection points in strong and weak acid titrations',
    ],
    capabilities: ['Burette Drop Dispenser', 'pH Sensor Probe', 'Titration Curve Plotter'],
  },

  // 9. Predator-Prey Dynamics (Planned)
  {
    id: 'population-dynamics',
    title: 'Lotka-Volterra Predator-Prey Dynamics',
    shortTitle: 'Predator-Prey',
    description:
      'Non-linear ecological equilibrium dynamics with phase plane orbits, environmental carrying capacity limits, and perturbation stability.',
    laboratoryId: 'biology',
    category: 'Population Dynamics',
    difficulty: 'Introductory',
    status: 'planned',
    route: '/experiments/projectile-motion',
    disciplineColor: '#22C55E',
    tags: ['Ecology', 'Population', 'Differential Equations'],
    learningObjectives: [
      'Analyze cyclic population oscillations between predators and prey',
      'Investigate carrying capacity saturation and extinction thresholds',
    ],
    capabilities: ['Phase Plane Viewer', 'Population Time Graph', 'Predation Rate Controls'],
  },

  // 10. Planar Truss Analysis (Planned)
  {
    id: 'truss-structural-analysis',
    title: 'Planar Truss Structural Stress Analysis',
    shortTitle: 'Truss Analysis',
    description:
      'Method of joints and sections for architectural bridge trusses, tension-compression distribution, and safety factor calculations.',
    laboratoryId: 'engineering',
    category: 'Structural Analysis',
    difficulty: 'Intermediate',
    status: 'planned',
    route: '/experiments/projectile-motion',
    disciplineColor: '#F43F5E',
    tags: ['Statics', 'Stress', 'Truss', 'Structures'],
    learningObjectives: [
      'Calculate member forces using the method of joints',
      'Identify critical failure points under external point loads',
    ],
    capabilities: ['Interactive Node Pinning', 'Stress Color-Coding', 'Load Vector Arrow'],
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
