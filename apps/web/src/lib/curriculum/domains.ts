/**
 * Prismora 11 Scientific & Engineering Domains
 * Benchmarked against Virtual Labs ecosystem (vlab.co.in) and National Model Curricula.
 */

import type { AcademicDomainId, DomainMeta } from './types';

export const ACADEMIC_DOMAINS: Record<AcademicDomainId, DomainMeta> = {
  ece: {
    id: 'ece',
    name: 'Electronics & Communication Engineering',
    shortName: 'ECE',
    tagline: 'Semiconductors, circuits, signal processing, and communication networks',
    description:
      'Rigorous virtual laboratories spanning discrete analog & digital electronics, Shockley diode physics, operational amplifiers, DSP algorithms, microcontrollers, and wireless communications.',
    primaryColor: '#06B6D4', // Cyan
    benchmarkInstitutions: ['IIT Roorkee', 'IIT Kharagpur', 'IIT Bombay', 'IIIT Hyderabad'],
    totalDiscoveredLabs: 28,
    coreCourses: [
      { code: 'EC-201', name: 'Electronic Devices & Circuits', semester: 3 },
      { code: 'EC-202', name: 'Digital Logic & Circuit Design', semester: 3 },
      { code: 'EC-301', name: 'Signals and Systems Studio', semester: 4 },
      { code: 'EC-302', name: 'Analog Integrated Circuits', semester: 4 },
      { code: 'EC-401', name: 'Digital Signal Processing (DSP)', semester: 5 },
      { code: 'EC-402', name: 'Analog & Digital Communication', semester: 5 },
      { code: 'EC-501', name: 'RF, Antennas & Wave Propagation', semester: 6 },
      { code: 'EC-502', name: 'VLSI Design & Hardware Description', semester: 6 },
    ],
  },
  cse: {
    id: 'cse',
    name: 'Computer Science & Engineering',
    shortName: 'CSE',
    tagline: 'Algorithms, computer architecture, automata, systems, and intelligence',
    description:
      'Interactive laboratories for instruction execution, 5-stage RISC-V pipelining, cache hierarchies, formal language automata, parsing algorithms, and computer systems.',
    primaryColor: '#8B5CF6', // Violet
    benchmarkInstitutions: ['IIT Delhi', 'IIT Bombay', 'IIIT Hyderabad', 'IIT Kanpur'],
    totalDiscoveredLabs: 24,
    coreCourses: [
      { code: 'CS-201', name: 'Data Structures & Algorithms', semester: 3 },
      { code: 'CS-202', name: 'Computer Organization & Architecture (RV32I)', semester: 3 },
      { code: 'CS-301', name: 'Theory of Computation & Automata', semester: 4 },
      { code: 'CS-302', name: 'Operating Systems & Concurrency', semester: 4 },
      { code: 'CS-401', name: 'Database Management Systems (DBMS)', semester: 5 },
      { code: 'CS-402', name: 'Computer Networks & Distributed Protocols', semester: 5 },
      { code: 'CS-501', name: 'Compiler Design & Language Systems', semester: 6 },
      { code: 'CS-502', name: 'Artificial Intelligence & Machine Learning', semester: 6 },
    ],
  },
  ee: {
    id: 'ee',
    name: 'Electrical Engineering',
    shortName: 'Electrical',
    tagline: 'Network theorems, AC machines, power systems, and control loops',
    description:
      'Laboratory experiments covering DC/AC network theorems (Thevenin, Norton, Superposition, Maximum Power Transfer), transient analysis, transformers, DC machines, and feedback control.',
    primaryColor: '#2563EB', // Blue
    benchmarkInstitutions: ['IIT Kharagpur', 'IIT Roorkee', 'IIT Delhi', 'IIT Madras'],
    totalDiscoveredLabs: 22,
    coreCourses: [
      { code: 'EE-101', name: 'Basic Electrical Engineering', semester: 1 },
      { code: 'EE-201', name: 'Electric Circuit Analysis & Network Theorems', semester: 3 },
      { code: 'EE-202', name: 'Electrical Machines I (DC Machines & Transformers)', semester: 3 },
      { code: 'EE-301', name: 'Electrical Machines II (Induction & Synchronous)', semester: 4 },
      { code: 'EE-302', name: 'Control Systems Engineering', semester: 4 },
      { code: 'EE-401', name: 'Power Electronics & Drive Systems', semester: 5 },
      { code: 'EE-402', name: 'Power System Analysis & Grid Dynamics', semester: 5 },
    ],
  },
  me: {
    id: 'me',
    name: 'Mechanical Engineering',
    shortName: 'Mechanical',
    tagline: 'Mechanics, kinematics, thermodynamics, fluid dynamics, and manufacturing',
    description:
      'Mechanisms and linkages, Mohr stress circle, Reynolds fluid flow, Carnot heat engines, harmonic vibration resonance, and CNC machining kinematics.',
    primaryColor: '#F59E0B', // Amber
    benchmarkInstitutions: ['IIT Roorkee', 'IIT Bombay', 'IIT Kharagpur', 'IIT Madras'],
    totalDiscoveredLabs: 26,
    coreCourses: [
      { code: 'ME-101', name: 'Engineering Mechanics', semester: 1 },
      { code: 'ME-201', name: 'Strength of Materials & Solid Mechanics', semester: 3 },
      { code: 'ME-202', name: 'Kinematics & Dynamics of Machines', semester: 3 },
      { code: 'ME-301', name: 'Fluid Mechanics & Hydraulic Machinery', semester: 4 },
      { code: 'ME-302', name: 'Applied Thermodynamics & Heat Transfer', semester: 4 },
      { code: 'ME-401', name: 'Mechanical Vibrations & Condition Monitoring', semester: 5 },
      { code: 'ME-402', name: 'Manufacturing Processes & CNC Automation', semester: 5 },
    ],
  },
  che: {
    id: 'che',
    name: 'Chemical Engineering',
    shortName: 'Chemical',
    tagline: 'Transport phenomena, distillation columns, reaction kinetics, and unit operations',
    description:
      'Fluidized beds, McCabe-Thiele fractional distillation, heat exchangers, chemical reactors (CSTR, PFR), and reaction equilibrium kinetics.',
    primaryColor: '#10B981', // Emerald
    benchmarkInstitutions: ['IIT Guwahati', 'IIT Roorkee', 'IIT Bombay', 'IIT Kharagpur'],
    totalDiscoveredLabs: 16,
    coreCourses: [
      { code: 'CH-201', name: 'Chemical Process Calculations', semester: 3 },
      { code: 'CH-202', name: 'Fluid Particle Operations & Mechanics', semester: 3 },
      { code: 'CH-301', name: 'Heat Transfer Operations', semester: 4 },
      { code: 'CH-302', name: 'Chemical Engineering Thermodynamics', semester: 4 },
      { code: 'CH-401', name: 'Mass Transfer & Separation Processes', semester: 5 },
      { code: 'CH-402', name: 'Chemical Reaction Engineering (CRE)', semester: 5 },
    ],
  },
  bt_bme: {
    id: 'bt_bme',
    name: 'Biotechnology & Biomedical Engineering',
    shortName: 'Biotech & BME',
    tagline: 'Molecular genetics, enzyme kinetics, biomedical instrumentation, and biosignals',
    description:
      'Michaelis-Menten enzyme kinetics, ECG/EMG biosignal acquisition, DNA gel electrophoresis, bioreactor dynamics, and biomedical transducer instrumentation.',
    primaryColor: '#EC4899', // Pink
    benchmarkInstitutions: ['IIT Delhi', 'Amrita Vishwa Vidyapeetham', 'IIT Kharagpur'],
    totalDiscoveredLabs: 14,
    coreCourses: [
      { code: 'BT-201', name: 'Biochemistry & Molecular Biology', semester: 3 },
      { code: 'BT-202', name: 'Microbiology & Cell Culture', semester: 3 },
      { code: 'BM-301', name: 'Biomedical Instrumentation & Transducers', semester: 4 },
      { code: 'BM-302', name: 'Biomedical Signal Processing (ECG/EEG)', semester: 4 },
      { code: 'BT-401', name: 'Bioprocess Engineering & Bioreactors', semester: 5 },
    ],
  },
  ce: {
    id: 'ce',
    name: 'Civil Engineering',
    shortName: 'Civil',
    tagline: 'Structural analysis, geotechnical soil mechanics, hydraulics, and survey',
    description:
      'Determinate and indeterminate truss stress distribution, Darcy permeability, open-channel weir flow, concrete cube compressive testing, and theodolite surveying.',
    primaryColor: '#78716C', // Stone
    benchmarkInstitutions: ['IIT Roorkee', 'IIT Delhi', 'IIT Bombay', 'IIT Madras'],
    totalDiscoveredLabs: 18,
    coreCourses: [
      { code: 'CE-201', name: 'Surveying & Geomatics', semester: 3 },
      { code: 'CE-202', name: 'Structural Analysis & Truss Mechanics', semester: 3 },
      { code: 'CE-301', name: 'Fluid Mechanics & Open Channel Hydraulics', semester: 4 },
      { code: 'CE-302', name: 'Soil Mechanics & Geotechnical Testing', semester: 4 },
      { code: 'CE-401', name: 'Design of Concrete Structures', semester: 5 },
      { code: 'CE-402', name: 'Environmental Engineering & Water Quality', semester: 5 },
    ],
  },
  physics: {
    id: 'physics',
    name: 'Physical Sciences',
    shortName: 'Physics',
    tagline: 'Classical kinematics, wave optics, electromagnetism, and quantum phenomena',
    description:
      'Parabolic projectile trajectories under celestial gravity, Franck-Hertz atomic energy quantization, Michelson interferometer fringes, and Hall effect semiconductor transport.',
    primaryColor: '#2563EB', // Blue
    benchmarkInstitutions: ['IIT Roorkee', 'IIT Kanpur', 'Amrita Vishwa Vidyapeetham'],
    totalDiscoveredLabs: 20,
    coreCourses: [
      { code: 'PH-101', name: 'Engineering Physics: Mechanics & Waves', semester: 1 },
      { code: 'PH-102', name: 'Electromagnetism & Quantum Concepts', semester: 2 },
      { code: 'PH-201', name: 'Wave Optics & Interferometry', semester: 3 },
      { code: 'PH-202', name: 'Solid State Physics & Semiconductors', semester: 4 },
    ],
  },
  chemistry: {
    id: 'chemistry',
    name: 'Chemical Sciences',
    shortName: 'Chemistry',
    tagline: 'Physical chemistry, acid-base titration, spectrophotometry, and kinetics',
    description:
      'Dynamic pH titration neutralization curves, Beer-Lambert spectrophotometry, galvanic cell Nernst potential, and chemical reaction order determination.',
    primaryColor: '#F59E0B', // Amber
    benchmarkInstitutions: ['IIT Kharagpur', 'IIT Bombay', 'Amrita Vishwa Vidyapeetham'],
    totalDiscoveredLabs: 15,
    coreCourses: [
      { code: 'CY-101', name: 'Engineering Chemistry & Physical Principles', semester: 1 },
      { code: 'CY-201', name: 'Analytical & Instrumental Chemistry', semester: 3 },
      { code: 'CY-202', name: 'Chemical Kinetics & Electrochemistry', semester: 4 },
    ],
  },
  math: {
    id: 'math',
    name: 'Mathematics & Applied Computing',
    shortName: 'Mathematics',
    tagline: 'Graphing manifolds, numerical analysis, vector calculus, and linear maps',
    description:
      'Continuous function root bisection, Runge-Kutta differential equations, 2D/3D linear transformations, Riemann integration slices, and eigenvalue geometric projections.',
    primaryColor: '#8B5CF6', // Purple
    benchmarkInstitutions: ['IIT Roorkee', 'IIT Delhi', 'IIT Kanpur'],
    totalDiscoveredLabs: 14,
    coreCourses: [
      { code: 'MA-101', name: 'Calculus & Linear Algebra', semester: 1 },
      { code: 'MA-102', name: 'Differential Equations & Transforms', semester: 2 },
      { code: 'MA-201', name: 'Numerical Methods & Computational Analysis', semester: 3 },
      { code: 'MA-202', name: 'Probability, Random Variables & Statistics', semester: 4 },
    ],
  },
  interdisciplinary: {
    id: 'interdisciplinary',
    name: 'Design Engineering & Interdisciplinary Technologies',
    shortName: 'Interdisciplinary',
    tagline: 'Robotics, IoT sensors, 3D printing kinematics, and cyber-physical systems',
    description:
      'Inverse robot kinematics, forward kinematics (DH parameters), sensor telemetry dashboards, additive manufacturing toolpaths, and autonomous control.',
    primaryColor: '#06B6D4', // Cyan
    benchmarkInstitutions: ['IIT Delhi', 'IIIT Hyderabad', 'IIT Madras'],
    totalDiscoveredLabs: 12,
    coreCourses: [
      { code: 'ID-201', name: 'Introduction to Robotics & Automation', semester: 4 },
      { code: 'ID-301', name: 'Internet of Things (IoT) Sensor Systems', semester: 5 },
      { code: 'ID-401', name: 'Digital Fabrication & Additive Manufacturing', semester: 6 },
    ],
  },
};
