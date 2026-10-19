/**
 * Prismora Universal Simulation Guide & Lab Manual Modal
 *
 * Provides a standardized, comprehensive interactive instructional manual for every simulation:
 * - 🎯 Learning Objectives & Pedagogical Standards (NCERT Class 11/12, NEET, JEE, AICTE)
 * - 🎮 Controls Manual (what each slider, button, probe, tape measure, and step action does)
 * - 📋 Step-by-Step Lab Protocol (guided experiment instructions like a physical laboratory manual)
 * - 📐 Theoretical Foundations & KaTeX Closed-Form Equations
 * - 💡 Guided Inquiries & Critical Thinking Questions
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  BookOpen,
  Sliders,
  CheckCircle2,
  Atom,
  HelpCircle,
  Lightbulb,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Zap,
  GraduationCap,
  ListOrdered,
  FileText,
} from 'lucide-react';
import { MathView } from '@prismora/ui';

export interface SimulationGuideData {
  id: string;
  title: string;
  subject: string;
  curriculum: string;
  difficulty: 'Introductory' | 'Intermediate' | 'Advanced';
  overview: string;
  learningObjectives: string[];
  controlsManual: {
    control: string;
    type: string;
    description: string;
  }[];
  stepByStepProcedure: {
    stepNumber: number;
    title: string;
    instruction: string;
    tip?: string;
  }[];
  theoreticalFormulas: {
    name: string;
    latex: string;
    explanation: string;
  }[];
  guidedInquiries: {
    question: string;
    hint: string;
  }[];
}

// Built-in Lab Manuals for Prismora Flagship & Core Laboratories
export const LAB_MANUALS: Record<string, SimulationGuideData> = {
  'projectile-motion': {
    id: 'projectile-motion',
    title: '3D Projectile Motion & Kinematics Studio',
    subject: 'Physics (Mechanics)',
    curriculum: 'NCERT Class 11 Physics Chapter 4 (Motion in a Plane) • JEE / NEET',
    difficulty: 'Introductory',
    overview:
      'Explore 2D parabolic trajectory dynamics under uniform gravitational fields. Analyze orthogonal velocity vector decomposition (vx, vy), apex maximum height, time of flight, and horizontal range across Earth, Moon, Mars, and custom celestial gravity presets.',
    learningObjectives: [
      'Understand how horizontal velocity vx remains constant while vertical velocity vy experiences constant downward acceleration -g.',
      'Derive and verify the angle of maximum range (45° over level ground).',
      'Observe complementary angle trajectory symmetry: complementary launch angles (e.g. 30° and 60°) achieve identical horizontal ranges.',
      'Investigate the impact of launch elevation (initial height y0 > 0) on optimal angle and landing velocity.',
    ],
    controlsManual: [
      { control: 'Launch Cannon / Play', type: 'Transport', description: 'Fires the projectile along its analytical ballistic trajectory at 60 FPS.' },
      { control: 'Step Forward', type: 'Transport', description: 'Advances simulation time by exactly 1 discrete frame (1/60s) for precision apex/impact analysis.' },
      { control: 'Initial Speed (v₀)', type: 'Slider', description: 'Adjusts launch muzzle speed from 0 to 100 m/s with 0.1 m/s precision.' },
      { control: 'Launch Angle (θ)', type: 'Slider & Cannon Drag', description: 'Rotate the cannon barrel or drag the slider between -90° (downward) and +90° (vertical).' },
      { control: 'Gravity (g)', type: 'Slider / Presets', description: 'Toggle between Earth (9.81 m/s²), Moon (1.62 m/s²), Mars (3.71 m/s²), or Zero-G.' },
      { control: 'Measuring Tape & Sensor Probe', type: 'Toolbar', description: 'Drag the precision measuring tape or place the floating sensor probe anywhere on the trajectory to inspect instantaneous time, height, and speed.' },
    ],
    stepByStepProcedure: [
      {
        stepNumber: 1,
        title: 'Calibrate Launch Conditions',
        instruction: 'Set Initial Height y₀ = 0 m, Gravity g = 9.81 m/s², and initial speed v₀ = 20 m/s on Earth.',
        tip: 'Ensure ground level is zero to observe textbook symmetrical parabolas.',
      },
      {
        stepNumber: 2,
        title: 'Investigate Launch Angle vs Range',
        instruction: 'Launch cannon at θ = 15°, 30°, 45°, 60°, and 75°. Record the total horizontal range R and time of flight t for each run.',
        tip: 'Notice that 30° and 60° land at the exact same location! 45° yields the absolute maximum range.',
      },
      {
        stepNumber: 3,
        title: 'Verify Kinematic Equations',
        instruction: 'Use the Apex formula H_max = (v₀² sin²θ)/(2g) to manually calculate theoretical height and compare with the live telemetry panel.',
      },
      {
        stepNumber: 4,
        title: 'Cliff Drop Experiment',
        instruction: 'Increase Initial Height to y₀ = 20 m and set launch angle to horizontal (θ = 0°). Observe how flight time depends strictly on height: t = √(2y₀/g).',
      },
    ],
    theoreticalFormulas: [
      {
        name: 'Horizontal Position',
        latex: 'x(t) = v_0 \\cos(\\theta) \\cdot t',
        explanation: 'Horizontal velocity vx is constant because there is zero horizontal acceleration (ax = 0).',
      },
      {
        name: 'Vertical Position',
        latex: 'y(t) = y_0 + v_0 \\sin(\\theta) \\cdot t - \\frac{1}{2}g t^2',
        explanation: 'Parabolic vertical equation under uniform gravitational acceleration g.',
      },
      {
        name: 'Total Horizontal Range',
        latex: 'R = \\frac{v_0^2 \\sin(2\\theta)}{g}',
        explanation: 'Valid for level ground (y0 = 0). Notice sin(2θ) reaches its maximum value of 1.0 at θ = 45°.',
      },
      {
        name: 'Maximum Apex Height',
        latex: 'H_{\\text{max}} = y_0 + \\frac{v_0^2 \\sin^2(\\theta)}{2g}',
        explanation: 'Occurs at the apex where vertical velocity component vy momentarily reaches 0 m/s.',
      },
    ],
    guidedInquiries: [
      {
        question: 'Why do launch angles of 30° and 60° achieve the exact same range on level ground?',
        hint: 'Examine the formula for range R = (v₀² sin(2θ))/g. Compute sin(2 × 30°) = sin(60°) and sin(2 × 60°) = sin(120°). Both equal √3/2!',
      },
      {
        question: 'If you launch a projectile on the Moon (g = 1.62 m/s²), how does maximum height compare to Earth?',
        hint: 'Since g_Moon is approximately 1/6th of g_Earth, and g is in the denominator of H_max, the projectile will fly approximately 6 times higher!',
      },
    ],
  },
  'circuit-studio': {
    id: 'circuit-studio',
    title: 'ECE Circuit Studio & Virtual Arduino Uno R3',
    subject: 'Electrical & Computer Engineering',
    curriculum: 'AICTE Basic Electrical & Electronics Engineering (BEEE) • Embedded Systems',
    difficulty: 'Intermediate',
    overview:
      'A full-fledged PhET + Autodesk TinkerCAD style interactive circuit workbench. Design DC/AC circuits, program an onboard ATmega328P microcontroller in C++ with live pin execution, inspect resistor color bands, and measure with dual-channel oscilloscope and bench digital multimeter.',
    learningObjectives: [
      'Apply Ohm’s Law (V = IR) and Kirchhoff’s Current/Voltage Laws (KCL, KVL) across active branches.',
      'Program an ATmega328P microcontroller with digital I/O, PWM analogWrite(), and serial telemetry.',
      'Decode 4-band EIA resistor color codes and observe power dissipation / thermal limits.',
      'Analyze transient and steady-state responses of capacitors, inductors, diodes, and transistors.',
    ],
    controlsManual: [
      { control: 'Component Palette', type: 'Sidebar', description: 'Drag-and-drop authentic components: Resistors, LEDs, DC Motors, Pushbuttons, Breadboards, and Arduino Uno R3.' },
      { control: 'Pin Wiring', type: 'Mouse Drag', description: 'Click any component terminal pin and drag to another pin to route a wire with dynamic color selection.' },
      { control: 'Arduino Code Editor', type: 'Modal Tab', description: 'Write or modify C++ sketch code with syntax highlighting, compiler diagnostics, and live Serial Monitor.' },
      { control: 'Digital Multimeter (DMM)', type: 'Instrument', description: 'Measure voltage (DC/AC), branch current in mA, and resistance across disconnected nodes.' },
      { control: 'Dual-Channel Oscilloscope', type: 'Instrument', description: 'Inspect live PWM waveforms, voltage ripples, and AC harmonics with adjustable timebase and volts/div.' },
    ],
    stepByStepProcedure: [
      {
        stepNumber: 1,
        title: 'Load Arduino Blink Preset',
        instruction: 'Click on the "Arduino: Onboard LED Blink" preset button in the toolbar to load a pre-wired microcontroller setup.',
      },
      {
        stepNumber: 2,
        title: 'Inspect C++ Firmware',
        instruction: 'Open the "Arduino C++ Code" drawer. Review pinMode(13, OUTPUT), digitalWrite(13, HIGH), and delay(1000) execution loops.',
      },
      {
        stepNumber: 3,
        title: 'Wire an External LED & Current-Limiting Resistor',
        instruction: 'From the component palette, place an LED and a 220Ω resistor. Connect Arduino D13 → Resistor → LED Anode (+) → LED Cathode (-) → Arduino GND.',
        tip: 'Never connect an LED directly across 5V without a series resistor or it will burn out from excessive forward current!',
      },
      {
        stepNumber: 4,
        title: 'Probe Voltages with DMM',
        instruction: 'Connect the red DMM probe to D13 and black probe to GND. Observe voltage toggling between 5.0V and 0.0V in sync with the blinking LED.',
      },
    ],
    theoreticalFormulas: [
      {
        name: "Ohm's Law",
        latex: 'V = I \\cdot R \\quad \\iff \\quad I = \\frac{V}{R}',
        explanation: 'Relates potential difference V (volts), current I (amperes), and resistance R (ohms).',
      },
      {
        name: 'LED Series Current-Limiting Resistor',
        latex: 'R_{\\text{series}} = \\frac{V_{\\text{source}} - V_{\\text{forward}}}{I_{\\text{LED}}} = \\frac{5.0\\text{V} - 2.0\\text{V}}{0.02\\text{A}} = 150\\,\\Omega',
        explanation: 'Guarantees the LED forward current stays within safe manufacturer limits (~20mA).',
      },
      {
        name: 'Electrical Power Dissipation',
        latex: 'P = V \\cdot I = I^2 R = \\frac{V^2}{R}',
        explanation: 'Rate at which electrical energy is converted into heat; must stay under resistor rating (0.25W / 0.5W).',
      },
    ],
    guidedInquiries: [
      {
        question: 'What happens if you replace the 220Ω resistor with a 10kΩ resistor?',
        hint: 'By Ohm’s Law, current I = V / R drops by a factor of ~45! The LED will glow extremely dimly.',
      },
      {
        question: 'How does Arduino analogWrite(pin, 128) control LED brightness without truly generating 2.5V DC?',
        hint: 'It uses Pulse Width Modulation (PWM) at 490 Hz with a 50% duty cycle, rapidly pulsing 5V and 0V to fool the human eye.',
      },
    ],
  },
  'biology': {
    id: 'biology',
    title: 'Human Reproduction & Microscopic Fertilization Chamber',
    subject: 'Biology (Human Embryology)',
    curriculum: 'NCERT Class 12 Biology Chapter 3 (Human Reproduction) • NEET Benchmark',
    difficulty: 'Intermediate',
    overview:
      'Experience living, taboo-free 60 FPS microscopic embryology: secondary oocyte morphology (zona pellucida, corona radiata), sperm chemotactic migration, acrosome enzymatic dissolution, glowing green Ca²⁺ wave, slow block to polyspermy (ZP2 cleavage), and cleavage zygote-to-blastocyst timeline.',
    learningObjectives: [
      'Identify anatomical micro-structures of the secondary oocyte: Zona Pellucida, Corona Radiata, Perivitelline Space, and Oolemma.',
      'Understand acrosome reaction enzymes (hyaluronidase and acrosin) facilitating sperm penetration.',
      'Visualize the cortical reaction: intracellular Ca²⁺ wave triggering exocytosis of cortical granules to establish the permanent polyspermy block.',
      'Track human developmental stages from syngamy (2n = 46) through morula, blastocyst implantation, and fetal trimesters.',
    ],
    controlsManual: [
      { control: 'Mode Tabs', type: 'Navigation', description: 'Switch between Fertilization Chamber, Reproductive Tract Migration, Cleavage Timeline, Fetal Milestones, and Hormonal Curves.' },
      { control: 'Sperm Chemotaxis Density', type: 'Slider', description: 'Vary the active sperm count to observe competitive capacitation and acrosome binding.' },
      { control: 'Cortical Wave Ca²⁺ Trigger', type: 'Interactive', description: 'Trigger or observe the green fluorescent calcium wave propagating across the ooplasm upon sperm fusion.' },
      { control: 'Timeline Scrub', type: 'Slider', description: 'Scrub day-by-day from Day 1 Syngamy through Day 7 Blastocyst implantation into the endometrium.' },
    ],
    stepByStepProcedure: [
      {
        stepNumber: 1,
        title: 'Microscopic Fertilization Chamber Observation',
        instruction: 'Under the 100x zoom view, identify the radial follicle cells (Corona Radiata) and the translucent glycoprotein mantle (Zona Pellucida).',
      },
      {
        stepNumber: 2,
        title: 'Acrosome Reaction Activation',
        instruction: 'Observe sperm heads binding to ZP3 receptor glycoproteins, releasing hyaluronidase enzymes to carve a penetration furrow.',
      },
      {
        stepNumber: 3,
        title: 'Observe the Cortical Calcium Wave',
        instruction: 'As the fertilizing sperm membrane fuses with the oolemma, watch the green wave of free intracellular Ca²⁺ sweep across the cell in ~30 seconds.',
        tip: 'This induces cortical granule exocytosis, cross-linking ZP2 and hardening the zona pellucida to prevent fatal polyspermy!',
      },
      {
        stepNumber: 4,
        title: 'Track Cleavage & Implantation',
        instruction: 'Switch to the "Cleavage & Blastocyst" tab. Observe mitotic division from 2-cell, 4-cell, 8-cell morula to the fluid-filled blastocyst cavity ready for uterine implantation.',
      },
    ],
    theoreticalFormulas: [
      {
        name: 'Diploid Restoration (Syngamy)',
        latex: 'n_{\\text{sperm}} (23) + n_{\\text{oocyte}} (23) \\xrightarrow{\\text{syngamy}} 2n_{\\text{zygote}} (46)',
        explanation: 'Restores the species-specific diploid chromosomal number with XY (male) or XX (female) determination.',
      },
      {
        name: 'Cortical Reaction Intracellular Calcium Diffusion',
        latex: '\\frac{\\partial [\\text{Ca}^{2+}]}{\\partial t} = D \\nabla^2 [\\text{Ca}^{2+}] + R_{\\text{release}} - R_{\\text{pump}}',
        explanation: 'Reaction-diffusion wave spreading radially from the sperm entry point to harden the zona pellucida.',
      },
    ],
    guidedInquiries: [
      {
        question: 'Why is polyspermy (fertilization by more than one sperm) lethal in human development?',
        hint: 'Extra sperm introduce extra sets of centrioles and chromosomes (triploidy 3n = 69), leading to abnormal multipolar mitotic spindles and early embryonic arrest.',
      },
      {
        question: 'At what anatomical site in the female reproductive tract does physiological fertilization normally occur?',
        hint: 'In the Ampulla of the Fallopian (uterine) tube, near the ampullary-isthmic junction.',
      },
    ],
  },
  'physics': {
    id: 'physics',
    title: 'Atomic Physics & Rutherford Alpha Particle Scattering',
    subject: 'Physics (Modern Physics)',
    curriculum: 'NCERT Class 12 Physics Chapter 12 (Atoms) • JEE Advanced',
    difficulty: 'Advanced',
    overview:
      'Recreate the historic 1911 Geiger-Marsden gold foil experiment that disproved the Thomson plum pudding model. Track Coulomb electrostatic repulsion between high-energy alpha particles (He²⁺) and the massive gold nucleus (Z = 79) in hyperbolic trajectory paths.',
    learningObjectives: [
      'Understand the relationship between impact parameter (b) and scattering angle (θ).',
      'Compute the distance of closest approach (r₀) representing the upper limit of nuclear radius.',
      'Verify the Rutherford scattering differential cross-section formula: N(θ) ∝ 1/sin⁴(θ/2).',
      'Appreciate why 1 in 8,000 alpha particles undergo dramatic back-scattering (>90°).',
    ],
    controlsManual: [
      { control: 'Alpha Particle Kinetic Energy', type: 'Slider', description: 'Adjust incident alpha energy from 1.0 MeV to 10.0 MeV (typical natural alpha source is ~5.5 MeV from Bismuth-214).' },
      { control: 'Target Atomic Number (Z)', type: 'Selector', description: 'Compare Gold (Z=79), Silver (Z=47), Copper (Z=29), and Aluminum (Z=13).' },
      { control: 'Beam Collimation & Intensity', type: 'Slider', description: 'Control beam flux and impact parameter dispersion across the gold lattice.' },
      { control: 'Scintillation Detector', type: 'Interactive Ring', description: 'Rotate the zinc sulfide detector screen around 360° to tally scattered alpha counts.' },
    ],
    stepByStepProcedure: [
      {
        stepNumber: 1,
        title: 'Initial Beam Calibration',
        instruction: 'Set Alpha Kinetic Energy to 5.0 MeV on Gold (Z = 79). Observe that most particles travel straight through with zero deflection.',
      },
      {
        stepNumber: 2,
        title: 'Observe Head-On Collisions (b = 0)',
        instruction: 'Adjust the impact parameter to direct a particle straight at the center of the gold nucleus. Watch it decelerate to a dead stop at distance r₀ and bounce 180° backward.',
      },
      {
        stepNumber: 3,
        title: 'Verify Scattering Angle Relationship',
        instruction: 'Reduce impact parameter b progressively and observe how deflection angle θ increases dramatically following cot(θ/2) = 2b / r₀.',
      },
    ],
    theoreticalFormulas: [
      {
        name: 'Distance of Closest Approach',
        latex: 'r_0 = \\frac{1}{4\\pi\\varepsilon_0} \\frac{2 Z e^2}{K_E} = \\frac{2 k Z e^2}{\\frac{1}{2} m v^2}',
        explanation: 'At closest approach, all initial kinetic energy KE is converted into electrostatic potential energy.',
      },
      {
        name: 'Impact Parameter vs Scattering Angle',
        latex: 'b = \\frac{1}{4\\pi\\varepsilon_0} \\frac{Z e^2}{K_E} \\cot\\left(\\frac{\\theta}{2}\\right) = \\frac{r_0}{2} \\cot\\left(\\frac{\\theta}{2}\\right)',
        explanation: 'Relates perpendicular offset distance b to the resulting deflection angle θ.',
      },
      {
        name: 'Rutherford Differential Cross Section',
        latex: 'N(\\theta) \\propto \\frac{1}{\\sin^4\\left(\\frac{\\theta}{2}\\right)}',
        explanation: 'Predicts that the number of particles detected drops precipitously at large scattering angles.',
      },
    ],
    guidedInquiries: [
      {
        question: 'Why did Rutherford conclude that the atom must be mostly empty space with a dense central nucleus?',
        hint: 'Over 99.9% of alpha particles passed through the gold foil with virtually zero deflection, while only a tiny fraction suffered massive backward rebound.',
      },
      {
        question: 'What happens to the distance of closest approach r₀ if the alpha particle kinetic energy is doubled?',
        hint: 'Since r₀ is inversely proportional to KE, doubling the kinetic energy halves r₀, allowing the alpha particle to probe twice as close to the nucleus.',
      },
    ],
  },
  'chemistry': {
    id: 'chemistry',
    title: 'Chemical Sciences: Equilibrium, Titration & Electrochemistry',
    subject: 'Chemistry (Physical Chemistry)',
    curriculum: 'NCERT Class 11 & 12 Chemistry • CBSE Laboratory Manual • JEE / NEET',
    difficulty: 'Intermediate',
    overview:
      'A multi-experiment chemistry suite featuring Le Chatelier Gas Piston Equilibrium (N2O4 ⇌ 2NO2 with Beer-Lambert optical absorbance), Volumetric Acid-Base Titration with pH curves and indicators, and Galvanic Daniell Cell with the Nernst Equation.',
    learningObjectives: [
      'Verify Le Chatelier’s principle by compressing or expanding a gas cylinder and heating/cooling the reaction.',
      'Understand how nitrogen dioxide (NO2, brown gas) and dinitrogen tetroxide (N2O4, colorless) interconvert.',
      'Construct titration neutralization curves and identify the stoichiometric equivalence point.',
      'Calculate galvanic cell electromotive force (EMF) using standard reduction potentials and the Nernst equation.',
    ],
    controlsManual: [
      { control: 'Experiment Tab Selector', type: 'Navigation', description: 'Switch between Chemical Equilibrium (N2O4 ⇌ 2NO2), Volumetric Titration, and Galvanic Daniell Cell.' },
      { control: 'Piston Volume Slider', type: 'Slider', description: 'Compress the cylinder volume from 5.0L down to 0.5L to observe instantaneous darkening followed by equilibrium shift toward N2O4.' },
      { control: 'Temperature Slider', type: 'Slider', description: 'Adjust temperature between 250K (-23°C) and 450K (+177°C) to shift endothermic equilibrium via van ’t Hoff equation.' },
      { control: 'Burette Stopcock Dispenser', type: 'Interactive', description: 'Dispense drops of 0.1M NaOH titrant into analyte solution and monitor live pH and color change.' },
    ],
    stepByStepProcedure: [
      {
        stepNumber: 1,
        title: 'Le Chatelier Piston Compression',
        instruction: 'Under the Equilibrium lab, drag the Volume slider from 2.0L down to 0.8L. Notice the gas immediately turns dark brown (concentration surge), then gradually fades to light amber as 2 NO2 molecules dimerize into 1 N2O4.',
      },
      {
        stepNumber: 2,
        title: 'Temperature Dependent Equilibrium',
        instruction: 'Heat the vessel to 400K. Because the forward dissociation is endothermic (ΔH° = +57.2 kJ/mol), heat acts as a reactant, driving the equilibrium forward to form rich brown NO2 gas.',
      },
      {
        stepNumber: 3,
        title: 'Galvanic Cell & Nernst Equation',
        instruction: 'Switch to the Electrochemistry tab. Insert Zinc anode and Copper cathode. Vary Zn²⁺ and Cu²⁺ molarities to watch the cell EMF fluctuate according to the Nernst equation.',
      },
    ],
    theoreticalFormulas: [
      {
        name: 'Chemical Equilibrium Constant',
        latex: 'K_c = \\frac{[\\text{NO}_2]^2}{[\\text{N}_2\\text{O}_4]}',
        explanation: 'Equilibrium ratio of product concentration squared to reactant concentration.',
      },
      {
        name: "Van 't Hoff Isochore Equation",
        latex: '\\ln\\left(\\frac{K_2}{K_1}\\right) = \\frac{\\Delta H^\\circ}{R} \\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)',
        explanation: 'Describes how the equilibrium constant changes with absolute temperature based on reaction enthalpy.',
      },
      {
        name: 'Nernst Equation (Daniell Cell at 298K)',
        latex: 'E_{\\text{cell}} = E^\\circ_{\\text{cell}} - \\frac{0.0591}{n} \\log_{10}\\left(\\frac{[\\text{Zn}^{2+}]}{[\\text{Cu}^{2+}]}\\right)',
        explanation: 'Calculates non-standard reduction potential where E° = 1.10V and number of electrons n = 2.',
      },
    ],
    guidedInquiries: [
      {
        question: 'Why does sudden compression of the N2O4/NO2 mixture initially make it look darker, before it lightens up?',
        hint: 'Compressing the volume immediately increases the concentration c = n/V of brown NO2 (Beer-Lambert law A = ε·c·l). Then Le Chatelier shifts equilibrium toward fewer gas moles (N2O4), lightening the color.',
      },
      {
        question: 'What is the theoretical cell potential of a Daniell cell when [Zn²⁺] = 0.01M and [Cu²⁺] = 1.0M?',
        hint: 'Use E = 1.10V - (0.0591/2) log10(0.01/1.0) = 1.10V - 0.02955 × (-2) = 1.10V + 0.059V = 1.159V!',
      },
    ],
  },
  'coa': {
    id: 'coa',
    title: 'Inside the CPU: 8-Bit Architecture & Datapath Simulator',
    subject: 'Computer Science (Computer Architecture)',
    curriculum: 'AICTE Computer Organization & Architecture (COA) • GATE CS Benchmark',
    difficulty: 'Advanced',
    overview:
      'Step directly inside a functional von Neumann CPU. Observe the synchronous Fetch-Decode-Execute instruction cycle, 5-stage RISC pipeline, arithmetic logic unit (ALU), program counter, 256-byte RAM, and internal register transfer language (RTL) state.',
    learningObjectives: [
      'Understand the classical von Neumann computer architecture: CPU, RAM, ALU, Registers, and Buses.',
      'Trace machine instructions through Fetch, Decode, Execute, Memory Access, and Writeback stages.',
      'Analyze data forwarding and pipeline hazard resolution (structural, data, and branch hazards).',
      'Inspect how machine opcodes (LOAD, ADD, SUB, STORE, JMP) manipulate register state.',
    ],
    controlsManual: [
      { control: 'Clock Step / Run', type: 'Transport', description: 'Step by single micro-operation or run continuous clock pulses at adjustable clock frequency (1 Hz to 50 Hz).' },
      { control: 'Program Selector', type: 'Dropdown', description: 'Load benchmark assembly programs: Fibonacci Series, Array Sum, Factorial, or Multiplication.' },
      { control: 'Register Inspector', type: 'Display', description: 'Inspect Program Counter (PC), Instruction Register (IR), Accumulator (ACC), General Purpose Registers (R0-R3), and ALU Flags (Zero, Carry, Negative).' },
      { control: 'RAM Memory Matrix', type: 'Interactive Grid', description: 'Live 256-byte interactive memory viewer with hex addresses and value editing.' },
    ],
    stepByStepProcedure: [
      {
        stepNumber: 1,
        title: 'Load Fibonacci Program',
        instruction: 'Select the "Fibonacci Number Sequence" from the preset program menu and reset the CPU.',
      },
      {
        stepNumber: 2,
        title: 'Single-Step the Instruction Fetch Stage',
        instruction: 'Click "Single Step". Watch PC point to Memory Address 0x00, read the opcode into the Instruction Register (IR), and increment PC to 0x01.',
      },
      {
        stepNumber: 3,
        title: 'Observe ALU Addition & Register Update',
        instruction: 'Step through the ADD instruction. Watch operand data flow through the internal data bus into the ALU, and the resulting sum write back into the Accumulator.',
      },
    ],
    theoreticalFormulas: [
      {
        name: 'CPU Execution Time Formula',
        latex: 'T_{\\text{exec}} = \\text{Instruction Count} \\times \\text{CPI} \\times \\text{Clock Cycle Time}',
        explanation: 'Fundamental performance equation governing microprocessor execution speed.',
      },
      {
        name: 'Pipelining Speedup Ratio',
        latex: 'S = \\frac{n \\cdot k}{k + n - 1} \\xrightarrow{n \\gg k} k',
        explanation: 'Theoretical maximum speedup of a k-stage pipeline processing n instructions approaches k.',
      },
    ],
    guidedInquiries: [
      {
        question: 'What is a "Data Hazard" (RAW - Read After Write) in pipelined execution?',
        hint: 'When an instruction depends on the result of an earlier instruction that has not yet reached the Writeback stage.',
      },
      {
        question: 'How does an instruction like JMP (Jump) alter normal sequential PC incrementation?',
        hint: 'It directly overwrites the Program Counter (PC) with the target memory address rather than doing PC = PC + 1.',
      },
    ],
  },
  'toc': {
    id: 'toc',
    title: 'CyberShield: Automata & Web Security Analyzer',
    subject: 'Computer Science (Theory of Computation)',
    curriculum: 'AICTE Formal Languages & Automata Theory • GATE CS',
    difficulty: 'Intermediate',
    overview:
      'Interactive automata theory and string language recognition workbench. Build and simulate Deterministic Finite Automata (DFA), Nondeterministic Finite Automata (NFA), Regular Expressions, and Pushdown Automata (PDA) applied to practical SQL injection & XSS regex firewall verification.',
    learningObjectives: [
      'Design formal 5-tuple Deterministic Finite Automata (Q, Σ, δ, q0, F).',
      'Trace state transition paths dynamically with input symbol tape inspection.',
      'Convert NFA with epsilon transitions into equivalent minimal DFA.',
      'Apply automata string acceptance models to real-world cybersecurity web vulnerability detection.',
    ],
    controlsManual: [
      { control: 'Tape Input String', type: 'Input Bar', description: 'Enter test strings (e.g. "0110", "1101", "\' OR 1=1--") to step through state transitions.' },
      { control: 'Step Input Symbol', type: 'Button', description: 'Reads the next character on the input tape and highlights the active state transition.' },
      { control: 'State Graph Editor', type: 'Interactive Canvas', description: 'Click to add states, set Initial/Accept states, and drag directional transition arcs.' },
    ],
    stepByStepProcedure: [
      {
        stepNumber: 1,
        title: 'Select Automaton Preset',
        instruction: 'Choose "Binary Strings Ending in 01" from the automaton preset menu.',
      },
      {
        stepNumber: 2,
        title: 'Test Input Tape',
        instruction: 'Type "10101" into the tape input box and click "Step". Observe the highlighted state moving through q0 → q0 → q1 → q0 → q1 → q2 (Accepting State).',
      },
    ],
    theoreticalFormulas: [
      {
        name: 'DFA 5-Tuple Definition',
        latex: 'M = (Q, \\Sigma, \\delta, q_0, F)',
        explanation: 'Q = finite states, Σ = input alphabet, δ = Q × Σ → Q transition function, q0 = start state, F ⊆ Q = accepting states.',
      },
    ],
    guidedInquiries: [
      {
        question: 'What is the key difference between a DFA and an NFA?',
        hint: 'In a DFA, for every state and input symbol there is exactly one next state. In an NFA, there can be 0, 1, or multiple transitions, as well as ε (empty) moves.',
      },
    ],
  },
};

interface SimulationGuideModalProps {
  simulationId: string;
  isOpen: boolean;
  onClose: () => void;
  customGuide?: Partial<SimulationGuideData>;
}

export function SimulationGuideModal({
  simulationId,
  isOpen,
  onClose,
  customGuide,
}: SimulationGuideModalProps) {
  const [activeTab, setActiveTab] = useState<'objectives' | 'controls' | 'procedure' | 'theory' | 'inquiries'>('objectives');

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Retrieve matching lab manual or create fallback
  const rawGuide = LAB_MANUALS[simulationId] || {
    id: simulationId,
    title: simulationId.replace(/-/g, ' ').toUpperCase(),
    subject: 'Scientific Simulation Laboratory',
    curriculum: 'National Educational Standards • Prismora Virtual Lab',
    difficulty: 'Intermediate' as const,
    overview:
      'Interactive scientific simulation laboratory engineered with closed-form analytical solvers and continuous telemetry.',
    learningObjectives: [
      'Investigate the physical and mathematical relationships governing this laboratory.',
      'Collect and record quantitative data under varying initial conditions.',
      'Verify theoretical textbook derivations through interactive experimentation.',
    ],
    controlsManual: [
      { control: 'Play / Pause', type: 'Transport', description: 'Start or pause continuous real-time simulation physics.' },
      { control: 'Reset', type: 'Transport', description: 'Return all state variables to standard initial conditions.' },
      { control: 'Parameter Sliders', type: 'Controls', description: 'Modify independent physical variables and observe dependent system response.' },
    ],
    stepByStepProcedure: [
      {
        stepNumber: 1,
        title: 'Calibrate Initial Conditions',
        instruction: 'Set parameter values to baseline default values before starting the experiment.',
      },
      {
        stepNumber: 2,
        title: 'Run Experiment & Collect Data',
        instruction: 'Click Play and observe system output variables on the live measurement gauges.',
      },
    ],
    theoreticalFormulas: [
      {
        name: 'Conservation of Energy',
        latex: 'E_{\\text{total}} = E_{\\text{kinetic}} + E_{\\text{potential}} = \\text{constant}',
        explanation: 'Total mechanical energy remains conserved in an ideal closed system.',
      },
    ],
    guidedInquiries: [
      {
        question: 'How do the output variables respond when you double the primary parameter?',
        hint: 'Check if the relationship is linear, quadratic, or inverse.',
      },
    ],
  };

  const guide: SimulationGuideData = {
    ...rawGuide,
    ...customGuide,
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs select-none animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="simulation-guide-title"
    >
      <div
        className="relative w-full max-w-3xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-zinc-900 border-b border-zinc-800 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/40">
                {guide.subject}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/40">
                {guide.difficulty}
              </span>
              <span className="text-[11px] text-zinc-400 font-mono hidden sm:inline">
                {guide.curriculum}
              </span>
            </div>
            <h2 id="simulation-guide-title" className="text-lg font-black text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-sky-400" />
              <span>{guide.title} — Lab Manual &amp; User Guide</span>
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center overflow-x-auto border-b border-zinc-800 bg-zinc-900/50 px-3 text-xs font-semibold scrollbar-none">
          <button
            onClick={() => setActiveTab('objectives')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'objectives'
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Objectives &amp; Theory</span>
          </button>

          <button
            onClick={() => setActiveTab('controls')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'controls'
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>How to Use &amp; Controls</span>
          </button>

          <button
            onClick={() => setActiveTab('procedure')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'procedure'
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Step-by-Step Protocol</span>
          </button>

          <button
            onClick={() => setActiveTab('theory')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'theory'
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Atom className="w-3.5 h-3.5" />
            <span>KaTeX Formulas</span>
          </button>

          <button
            onClick={() => setActiveTab('inquiries')}
            className={`py-3 px-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'inquiries'
                ? 'border-sky-500 text-sky-400 font-bold bg-sky-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Guided Inquiries</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 overflow-y-auto space-y-6 text-sm text-zinc-300">
          {/* TAB 1: OBJECTIVES & OVERVIEW */}
          {activeTab === 'objectives' && (
            <div className="space-y-5 animate-in fade-in duration-150">
              <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-sky-400 block">
                  Executive Scientific Summary
                </span>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {guide.overview}
                </p>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Key Learning Objectives</span>
                </h3>
                <ul className="space-y-2">
                  {guide.learningObjectives.map((obj, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 mt-2 shrink-0" />
                      <span>{obj}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-800/40 text-xs text-sky-200 flex items-center justify-between">
                <span>Aligned with National Educational Frameworks &amp; Model Syllabi.</span>
                <span className="font-mono font-bold text-sky-400">100% Client-Side Physics</span>
              </div>
            </div>
          )}

          {/* TAB 2: CONTROLS & HOW TO USE */}
          {activeTab === 'controls' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-zinc-400">
                Every slider, button, and measuring probe in this simulation interacts dynamically with the real-time simulation engine. Use these controls to manipulate independent variables and inspect outputs:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {guide.controlsManual.map((ctrl, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{ctrl.control}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                        {ctrl.type}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{ctrl.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: STEP-BY-STEP LAB PROTOCOL */}
          {activeTab === 'procedure' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-zinc-400">
                Follow this laboratory protocol to conduct a rigorous scientific experiment, collect data, and verify theoretical predictions:
              </p>

              <div className="space-y-3">
                {guide.stepByStepProcedure.map((step) => (
                  <div key={step.stepNumber} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-full bg-sky-500 text-white font-black text-xs flex items-center justify-center shrink-0">
                        {step.stepNumber}
                      </span>
                      <h4 className="font-bold text-sm text-white">{step.title}</h4>
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-300 pl-8 leading-relaxed">
                      {step.instruction}
                    </p>
                    {step.tip && (
                      <div className="ml-8 mt-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-start gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span><strong>Lab Tip:</strong> {step.tip}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: THEORETICAL FORMULAS */}
          {activeTab === 'theory' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-zinc-400">
                Closed-form mathematical equations and physical laws driving this simulation:
              </p>

              <div className="space-y-3">
                {guide.theoreticalFormulas.map((f, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <span className="text-xs font-mono font-bold text-sky-400 block uppercase">
                      {f.name}
                    </span>
                    <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 overflow-x-auto text-center">
                      <MathView math={f.latex} display={true} />
                    </div>
                    <p className="text-xs text-zinc-400 leading-relaxed">{f.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GUIDED INQUIRIES & QUESTIONS */}
          {activeTab === 'inquiries' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-zinc-400">
                Test your understanding and challenge your assumptions with these inquiry-based questions:
              </p>

              <div className="space-y-3">
                {guide.guidedInquiries.map((q, i) => (
                  <div key={i} className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 space-y-2">
                    <span className="font-bold text-sm text-white flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span>{q.question}</span>
                    </span>
                    <div className="p-2.5 rounded-lg bg-purple-950/30 border border-purple-800/40 text-xs text-purple-200">
                      <strong>Teacher Hint:</strong> {q.hint}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <span>Prismora Virtual Laboratory • Open Educational Resource</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold transition-colors"
          >
            Start Experiment
          </button>
        </div>
      </div>
    </div>
  );
}
