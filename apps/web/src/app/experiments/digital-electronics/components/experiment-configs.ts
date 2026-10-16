export type DigitalExperimentCategory =
  | 'Gates'
  | 'Combinational'
  | 'Sequential'
  | 'Converters'
  | 'Analysis';

export interface ProcedureStep {
  step: number;
  title: string;
  instruction: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface DipPin {
  number: number;
  label: string;
  type: 'input' | 'output' | 'power' | 'ground' | 'clock' | 'control';
  description: string;
}

export interface DipConfig {
  chipName: string;
  description: string;
  pinCount: 14 | 16;
  pins: DipPin[];
}

export interface DigitalExperimentConfig {
  id: string;
  expNumber: number;
  title: string;
  shortTitle: string;
  iitCode: string;
  category: DigitalExperimentCategory;
  icChips: string[];
  objective: string;
  theory: string;
  equations: string[];
  procedure: ProcedureStep[];
  quiz: QuizQuestion[];
  dipConfig: DipConfig;
}

export const DIGITAL_EXPERIMENTS: DigitalExperimentConfig[] = [
  // -------------------------------------------------------------------------
  // EXPERIMENT 1: Logic Gates & Truth Tables
  // -------------------------------------------------------------------------
  {
    id: 'basic-gates',
    expNumber: 1,
    title: 'Verification and Interpretation of Truth Tables of Logic Gates',
    shortTitle: '1. Basic Logic Gates',
    iitCode: 'IITR-DE-EXP01',
    category: 'Gates',
    icChips: ['7408 (Quad AND)', '7432 (Quad OR)', '7404 (Hex Inverter)', '7400 (Quad NAND)', '7402 (Quad NOR)', '7486 (Quad XOR)'],
    objective:
      'To verify the truth tables of primary discrete logic gates (AND, OR, NOT), universal gates (NAND, NOR), and arithmetic gates (XOR, XNOR) using standard TTL integrated circuits.',
    theory:
      'Logic gates are fundamental physical building blocks of digital electronic systems. Each gate executes a specific Boolean function relating binary inputs to a binary output. In positive logic, High represents binary 1 (nominal +5V TTL) and Low represents binary 0 (nominal 0V TTL). De Morgan laws govern algebraic complementation: ¬(A · B) = ¬A + ¬B and ¬(A + B) = ¬A · ¬B.',
    equations: [
      'Y_{AND} = A \\cdot B',
      'Y_{OR} = A + B',
      'Y_{NOT} = \\overline{A}',
      'Y_{NAND} = \\overline{A \\cdot B}',
      'Y_{NOR} = \\overline{A + B}',
      'Y_{XOR} = A \\oplus B = A\\overline{B} + \\overline{A}B',
      'Y_{XNOR} = \\overline{A \\oplus B} = AB + \\overline{A}\\,\\overline{B}',
    ],
    procedure: [
      { step: 1, title: 'Power Distribution', instruction: 'Connect Pin 14 of the TTL IC to +5V VCC and Pin 7 to 0V GND.' },
      { step: 2, title: 'Input Biasing', instruction: 'Connect logic switches to gate input pins (Pin 1 and Pin 2 for Gate 1).' },
      { step: 3, title: 'Output Monitoring', instruction: 'Connect gate output Pin 3 to an indicator LED with current-limiting resistor.' },
      { step: 4, title: 'Truth Table Verification', instruction: 'Cycle through all input permutations (00, 01, 10, 11) and record LED state.' },
    ],
    quiz: [
      {
        question: 'Which logic gate produces a LOW (0) output only when ALL its inputs are HIGH (1)?',
        options: ['NOR Gate', 'NAND Gate', 'XOR Gate', 'AND Gate'],
        answerIndex: 1,
        explanation: 'A NAND gate is an inverted AND; it outputs LOW if and only if all inputs are simultaneously HIGH.',
      },
      {
        question: 'What is the output of a 2-input XOR gate when both inputs are binary 1?',
        options: ['1', '0', 'High-Impedance', 'Oscillating'],
        answerIndex: 1,
        explanation: 'XOR outputs 1 for odd parity (different inputs). When both inputs are 1, they are identical, yielding output 0.',
      },
      {
        question: 'According to De Morgan theorem, what is the complement of (A + B)?',
        options: ['A\' + B\'', 'A\' · B\'', 'A · B', '(A · B)\''],
        answerIndex: 1,
        explanation: 'The complement of a logical sum equals the logical product of the complements: (A + B)\' = A\' · B\'.',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS08N (Quad 2-Input AND)',
      description: 'Contains four independent 2-input positive-AND gates in a 14-pin dual-in-line package.',
      pinCount: 14,
      pins: [
        { number: 1, label: '1A', type: 'input', description: 'Gate 1 Input A' },
        { number: 2, label: '1B', type: 'input', description: 'Gate 1 Input B' },
        { number: 3, label: '1Y', type: 'output', description: 'Gate 1 Output (1A · 1B)' },
        { number: 4, label: '2A', type: 'input', description: 'Gate 2 Input A' },
        { number: 5, label: '2B', type: 'input', description: 'Gate 2 Input B' },
        { number: 6, label: '2Y', type: 'output', description: 'Gate 2 Output' },
        { number: 7, label: 'GND', type: 'ground', description: 'Circuit Ground (0V)' },
        { number: 8, label: '3Y', type: 'output', description: 'Gate 3 Output' },
        { number: 9, label: '3A', type: 'input', description: 'Gate 3 Input A' },
        { number: 10, label: '3B', type: 'input', description: 'Gate 3 Input B' },
        { number: 11, label: '4Y', type: 'output', description: 'Gate 4 Output' },
        { number: 12, label: '4A', type: 'input', description: 'Gate 4 Input A' },
        { number: 13, label: '4B', type: 'input', description: 'Gate 4 Input B' },
        { number: 14, label: 'VCC', type: 'power', description: 'Power Supply (+5V DC)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 2: Half and Full Adder
  // -------------------------------------------------------------------------
  {
    id: 'adders',
    expNumber: 2,
    title: 'Design and Construction of Half Adder and Full Adder Circuits',
    shortTitle: '2. Half & Full Adder',
    iitCode: 'IITR-DE-EXP02',
    category: 'Combinational',
    icChips: ['7486 (Quad XOR)', '7408 (Quad AND)', '7432 (Quad OR)'],
    objective:
      'To design, construct, and verify arithmetic Half Adder and Full Adder circuits using basic logic gates, and analyze bit-slice carry propagation.',
    theory:
      'A Half Adder adds two single binary digits A and B, producing a Sum (S = A ⊕ B) and Carry (C = A · B). Because it cannot accept a carry from an earlier stage, it is limited to the least significant bit. A Full Adder accommodates three inputs: operands A and B, plus an incoming carry Cin from a lower-order column. It can be constructed by cascading two Half Adders with an OR gate to combine the carry terms.',
    equations: [
      'S_{HA} = A \\oplus B',
      'C_{HA} = A \\cdot B',
      'S_{FA} = A \\oplus B \\oplus C_{in}',
      'C_{out} = (A \\cdot B) + (C_{in} \\cdot (A \\oplus B))',
    ],
    procedure: [
      { step: 1, title: 'Half Adder Wiring', instruction: 'Connect inputs A and B to XOR (7486) for Sum and AND (7408) for Carry.' },
      { step: 2, title: 'Half Adder Testing', instruction: 'Verify all 4 input states against S and C outputs.' },
      { step: 3, title: 'Full Adder Cascade', instruction: 'Feed HA1 Sum and Cin into HA2 XOR to produce Full Sum. Merge carries through 7432 OR.' },
      { step: 4, title: 'Full Table Verification', instruction: 'Examine all 8 input states (000 to 111) and record Sum and Carry Out.' },
    ],
    quiz: [
      {
        question: 'How many NAND gates are required to construct a Full Adder from scratch?',
        options: ['5', '9', '12', '16'],
        answerIndex: 1,
        explanation: 'A Full Adder can be synthesized with exactly 9 NAND gates (4 NANDs per XOR stage, plus carry combination).',
      },
      {
        question: 'For inputs A=1, B=1, and Cin=1, what are the Full Adder Sum and Carry outputs?',
        options: ['Sum=0, Carry=1', 'Sum=1, Carry=0', 'Sum=1, Carry=1', 'Sum=0, Carry=0'],
        answerIndex: 2,
        explanation: '1 + 1 + 1 = 3 in decimal, which is binary 11 (Sum = 1, CarryOut = 1).',
      },
      {
        question: 'What is the function of the OR gate in a two-Half-Adder Full Adder topology?',
        options: ['Combines the sum bits', 'Combines the intermediate carry generated by HA1 and HA2', 'Inverts the incoming carry', 'Acts as a buffer'],
        answerIndex: 1,
        explanation: 'The OR gate merges the carry generated by the first half adder (A · B) with the carry from the second half adder (Cin · (A ⊕ B)).',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS86N (Quad 2-Input XOR)',
      description: 'Provides four independent 2-input Exclusive-OR gates essential for binary addition sum bits.',
      pinCount: 14,
      pins: [
        { number: 1, label: '1A', type: 'input', description: 'Adder Operand A' },
        { number: 2, label: '1B', type: 'input', description: 'Adder Operand B' },
        { number: 3, label: '1Y', type: 'output', description: 'Half Adder Sum (1A ⊕ 1B)' },
        { number: 4, label: '2A', type: 'input', description: 'Gate 2 Input A' },
        { number: 5, label: '2B', type: 'input', description: 'Gate 2 Input B' },
        { number: 6, label: '2Y', type: 'output', description: 'Gate 2 Output' },
        { number: 7, label: 'GND', type: 'ground', description: 'Circuit Ground' },
        { number: 8, label: '3Y', type: 'output', description: 'Gate 3 Output' },
        { number: 9, label: '3A', type: 'input', description: 'Gate 3 Input A' },
        { number: 10, label: '3B', type: 'input', description: 'Gate 3 Input B' },
        { number: 11, label: '4Y', type: 'output', description: 'Gate 4 Output' },
        { number: 12, label: '4A', type: 'input', description: 'Gate 4 Input A' },
        { number: 13, label: '4B', type: 'input', description: 'Gate 4 Input B' },
        { number: 14, label: 'VCC', type: 'power', description: 'Power Supply (+5V)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 3: Half and Full Subtractor
  // -------------------------------------------------------------------------
  {
    id: 'subtractors',
    expNumber: 3,
    title: 'Design and Construction of Half Subtractor and Full Subtractor Circuits',
    shortTitle: '3. Half & Full Subtractor',
    iitCode: 'IITR-DE-EXP03',
    category: 'Combinational',
    icChips: ['7486 (Quad XOR)', '7404 (Hex NOT)', '7408 (Quad AND)', '7432 (Quad OR)'],
    objective:
      'To construct binary Half and Full Subtractor circuits, verify difference and borrow generation, and relate subtraction to two complement arithmetic.',
    theory:
      'A Half Subtractor performs arithmetic subtraction of two single-bit binary numbers A (minuend) and B (subtrahend). It produces a Difference bit D = A ⊕ B and a Borrow bit Bout = ¬A · B. The borrow indicates that a 1 was taken from the next higher position. A Full Subtractor subtracts two bits A and B along with an incoming borrow Bin from a lower stage.',
    equations: [
      'D_{HS} = A \\oplus B',
      'B_{out,HS} = \\overline{A} \\cdot B',
      'D_{FS} = A \\oplus B \\oplus B_{in}',
      'B_{out,FS} = (\\overline{A} \\cdot B) + (B_{in} \\cdot \\overline{A \\oplus B})',
    ],
    procedure: [
      { step: 1, title: 'Half Subtractor Circuit', instruction: 'Connect inputs A and B to XOR for Difference and NOT(A) · B for Borrow.' },
      { step: 2, title: 'Verify Half Subtractor', instruction: 'Note that A=0, B=1 yields Difference=1 and Borrow=1.' },
      { step: 3, title: 'Full Subtractor Synthesis', instruction: 'Cascade two subtractor stages and merge the borrow outputs with an OR gate.' },
      { step: 4, title: 'Comprehensive Testing', instruction: 'Record all 8 truth table combinations for Diff and Bout.' },
    ],
    quiz: [
      {
        question: 'When minuend A=0 and subtrahend B=1 in a Half Subtractor, what are Difference and Borrow?',
        options: ['Diff=0, Borrow=0', 'Diff=1, Borrow=0', 'Diff=1, Borrow=1', 'Diff=0, Borrow=1'],
        answerIndex: 2,
        explanation: '0 - 1 requires borrowing 1 from the next bit (yielding binary 10 - 1 = 1), so Diff = 1 and Borrow = 1.',
      },
      {
        question: 'Which gate computes the borrow in a Half Subtractor?',
        options: ['AND gate with input A inverted', 'OR gate with input B inverted', 'NAND gate directly', 'XNOR gate'],
        answerIndex: 0,
        explanation: 'Borrow occurs only when A=0 and B=1, which is represented logically by ¬A · B.',
      },
      {
        question: 'How is a Full Subtractor related to a Full Adder?',
        options: ['Difference equation is identical to Sum equation', 'Borrow equation is identical to Carry equation', 'They are completely unrelated', 'A subtractor uses more clock cycles'],
        answerIndex: 0,
        explanation: 'The Difference expression (A ⊕ B ⊕ Bin) is mathematically identical to the Sum expression (A ⊕ B ⊕ Cin).',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS04N (Hex Inverter)',
      description: 'Contains six independent NOT inverters used to generate ¬A in borrow detection.',
      pinCount: 14,
      pins: [
        { number: 1, label: '1A', type: 'input', description: 'Minuend A Input' },
        { number: 2, label: '1Y', type: 'output', description: 'Inverted Minuend ¬A' },
        { number: 3, label: '2A', type: 'input', description: 'Inverter 2 Input' },
        { number: 4, label: '2Y', type: 'output', description: 'Inverter 2 Output' },
        { number: 5, label: '3A', type: 'input', description: 'Inverter 3 Input' },
        { number: 6, label: '3Y', type: 'output', description: 'Inverter 3 Output' },
        { number: 7, label: 'GND', type: 'ground', description: 'Ground' },
        { number: 8, label: '4Y', type: 'output', description: 'Inverter 4 Output' },
        { number: 9, label: '4A', type: 'input', description: 'Inverter 4 Input' },
        { number: 10, label: '5Y', type: 'output', description: 'Inverter 5 Output' },
        { number: 11, label: '5A', type: 'input', description: 'Inverter 5 Input' },
        { number: 12, label: '6Y', type: 'output', description: 'Inverter 6 Output' },
        { number: 13, label: '6A', type: 'input', description: 'Inverter 6 Input' },
        { number: 14, label: 'VCC', type: 'power', description: 'Power (+5V)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 4: Universal Gates (NAND & NOR)
  // -------------------------------------------------------------------------
  {
    id: 'universal-gates',
    expNumber: 4,
    title: 'Verification of Universal Gates and Synthesis of Target Logic Functions',
    shortTitle: '4. Universal Gates (NAND/NOR)',
    iitCode: 'IITR-DE-EXP04',
    category: 'Gates',
    icChips: ['7400 (Quad NAND)', '7402 (Quad NOR)'],
    objective:
      'To prove the functional completeness of NAND and NOR universal gates by synthesizing NOT, AND, OR, XOR, and XNOR functions exclusively from single-gate families.',
    theory:
      'A set of logic gates is functionally complete (universal) if any arbitrary Boolean expression can be implemented using only gates from that set without requiring any other gate types. Both NAND and NOR are universal gates. By tying inputs together, an inverter is created. By applying De Morgan laws, conjunction (AND) and disjunction (OR) are synthesized.',
    equations: [
      '\\text{NOT}(A) = \\overline{A \\cdot A}',
      '\\text{AND}(A, B) = \\overline{\\overline{A \\cdot B} \\cdot \\overline{A \\cdot B}}',
      '\\text{OR}(A, B) = \\overline{\\overline{A} \\cdot \\overline{B}} = \\overline{\\overline{A \\cdot A} \\cdot \\overline{B \\cdot B}}',
      '\\text{XOR}(A, B) = \\text{NAND}(\\text{NAND}(A, \\overline{AB}), \\text{NAND}(B, \\overline{AB}))',
    ],
    procedure: [
      { step: 1, title: 'Inverter Realization', instruction: 'Tie both inputs of a 7400 NAND gate together. Test as an inverter.' },
      { step: 2, title: 'AND Gate Realization', instruction: 'Cascade a 2-input NAND with a NAND inverter. Verify AND behavior.' },
      { step: 3, title: 'OR Gate Realization', instruction: 'Invert inputs A and B individually with NANDs, then feed both into a third NAND gate.' },
      { step: 4, title: '4-NAND XOR Synthesis', instruction: 'Construct the classic 4-gate XOR tree and verify equivalence with an analytical XOR.' },
    ],
    quiz: [
      {
        question: 'What is the minimum number of NAND gates required to synthesize a 2-input OR gate?',
        options: ['2', '3', '4', '5'],
        answerIndex: 1,
        explanation: '3 NAND gates: 2 gates invert inputs A and B individually, and the 3rd NAND merges them: ¬(¬A · ¬B) = A + B.',
      },
      {
        question: 'Why are NAND and NOR gates called "Universal Gates"?',
        options: ['They operate at higher clock speeds', 'Any Boolean function can be implemented using only NAND or only NOR gates', 'They consume zero quiescent power', 'They do not require VCC power'],
        answerIndex: 1,
        explanation: 'Functional completeness means every possible combinational logic function can be realized using solely that gate type.',
      },
      {
        question: 'How many NOR gates are needed to create an AND gate?',
        options: ['2', '3', '4', '5'],
        answerIndex: 1,
        explanation: '3 NOR gates: Invert A with NOR1, invert B with NOR2, then feed into NOR3: ¬(¬A + ¬B) = A · B.',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS00N (Quad 2-Input NAND)',
      description: 'Contains four independent 2-input NAND gates forming the universal logic workhorse.',
      pinCount: 14,
      pins: [
        { number: 1, label: '1A', type: 'input', description: 'Universal Gate 1 Input A' },
        { number: 2, label: '1B', type: 'input', description: 'Universal Gate 1 Input B' },
        { number: 3, label: '1Y', type: 'output', description: 'Gate 1 Output: ¬(1A · 1B)' },
        { number: 4, label: '2A', type: 'input', description: 'Gate 2 Input A' },
        { number: 5, label: '2B', type: 'input', description: 'Gate 2 Input B' },
        { number: 6, label: '2Y', type: 'output', description: 'Gate 2 Output' },
        { number: 7, label: 'GND', type: 'ground', description: 'Ground (0V)' },
        { number: 8, label: '3Y', type: 'output', description: 'Gate 3 Output' },
        { number: 9, label: '3A', type: 'input', description: 'Gate 3 Input A' },
        { number: 10, label: '3B', type: 'input', description: 'Gate 3 Input B' },
        { number: 11, label: '4Y', type: 'output', description: 'Gate 4 Output' },
        { number: 12, label: '4A', type: 'input', description: 'Gate 4 Input A' },
        { number: 13, label: '4B', type: 'input', description: 'Gate 4 Input B' },
        { number: 14, label: 'VCC', type: 'power', description: 'Power (+5V)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 5: RS Latches & Race Conditions
  // -------------------------------------------------------------------------
  {
    id: 'nor-nand-latches',
    expNumber: 5,
    title: 'Construction & Truth Table Verification of RS NOR and NAND Latches',
    shortTitle: '5. RS NOR/NAND Latches',
    iitCode: 'IITR-DE-EXP05',
    category: 'Sequential',
    icChips: ['7402 (Quad NOR)', '7400 (Quad NAND)'],
    objective:
      'To build cross-coupled bistable latches, observe 1-bit memory retention, investigate the indeterminate state (S=1, R=1), and observe race condition resolution.',
    theory:
      'The cross-coupled NOR latch is the fundamental asynchronous sequential storage cell. With S=1, R=0 the latch Sets (Q=1, Q̄=0). With S=0, R=1 the latch Resets (Q=0, Q̄=1). With S=0, R=0 it retains its previous state (Hold/Memory). The condition S=1, R=1 is forbidden (indeterminate) because both outputs are forced to 0, violating complementarity (Q ≠ Q̄). If inputs transition simultaneously from (1,1) to (0,0), a critical race hazard occurs.',
    equations: [
      'Q = \\overline{R + \\overline{Q}}',
      '\\overline{Q} = \\overline{S + Q}',
      'Q_{next} = S + \\overline{R} \\cdot Q \\quad (\\text{with } S \\cdot R = 0)',
    ],
    procedure: [
      { step: 1, title: 'NOR Latch Cross-Coupling', instruction: 'Connect Output of NOR1 to Input of NOR2, and Output of NOR2 to Input of NOR1.' },
      { step: 2, title: 'Set and Reset Verification', instruction: 'Assert Set (S=1, R=0) and observe Q=1. Then set S=0 to verify state retention.' },
      { step: 3, title: 'Indeterminate State Exploration', instruction: 'Apply S=1 and R=1 simultaneously. Observe that both Q and Q̄ drop to 0.' },
      { step: 4, title: 'Race Hazard Observation', instruction: 'Release both inputs simultaneously to (0,0) and observe which state settles first.' },
    ],
    quiz: [
      {
        question: 'In an active-high NOR SR Latch, what happens when S=1 and R=1 simultaneously?',
        options: ['Latch toggles state', 'Outputs remain unchanged', 'Both Q and Q̄ become 0 (Forbidden state)', 'Outputs become 1 and 0'],
        answerIndex: 2,
        explanation: 'A NOR gate outputs 0 whenever any input is 1. Thus S=1 and R=1 forces both Q=0 and Q̄=0 simultaneously.',
      },
      {
        question: 'What is the inactive (memory hold) state for an active-low NAND latch?',
        options: ['S̄=0, R̄=0', 'S̄=1, R̄=1', 'S̄=1, R̄=0', 'S̄=0, R̄=1'],
        answerIndex: 1,
        explanation: 'In an active-low NAND latch, 1 on both inputs allows the internal feedback loops to sustain the previous state.',
      },
      {
        question: 'Why does a critical race condition occur during the transition (1,1) -> (0,0) in a NOR latch?',
        options: ['VCC drops to ground', 'Both gates attempt to transition to 1 simultaneously, and slight delay differences decide the winner', 'The latch burns out', 'Clock frequency is too high'],
        answerIndex: 1,
        explanation: 'Both NOR gates see 0 on their external inputs and attempt to assert 1; whichever gate propagates first forces the other back to 0.',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS02N (Quad 2-Input NOR)',
      description: 'Contains four 2-input NOR gates used to form cross-coupled active-high bistable latches.',
      pinCount: 14,
      pins: [
        { number: 1, label: '1Y', type: 'output', description: 'NOR 1 Output: Q̄ (Feedback to 2A)' },
        { number: 2, label: '1A', type: 'input', description: 'Reset Input R' },
        { number: 3, label: '1B', type: 'input', description: 'Feedback Input Q (from 2Y)' },
        { number: 4, label: '2Y', type: 'output', description: 'NOR 2 Output: Q (Feedback to 1B)' },
        { number: 5, label: '2A', type: 'input', description: 'Feedback Input Q̄ (from 1Y)' },
        { number: 6, label: '2B', type: 'input', description: 'Set Input S' },
        { number: 7, label: 'GND', type: 'ground', description: 'Ground (0V)' },
        { number: 8, label: '3A', type: 'input', description: 'Gate 3 Input A' },
        { number: 9, label: '3B', type: 'input', description: 'Gate 3 Input B' },
        { number: 10, label: '3Y', type: 'output', description: 'Gate 3 Output' },
        { number: 11, label: '4A', type: 'input', description: 'Gate 4 Input A' },
        { number: 12, label: '4B', type: 'input', description: 'Gate 4 Input B' },
        { number: 13, label: '4Y', type: 'output', description: 'Gate 4 Output' },
        { number: 14, label: 'VCC', type: 'power', description: 'Power (+5V)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 6: Clocked Flip-Flops (D, JK, T, SR)
  // -------------------------------------------------------------------------
  {
    id: 'flip-flops',
    expNumber: 6,
    title: 'Study of Clocked Flip-Flops (RS, JK, D, and T) and Excitation Tables',
    shortTitle: '6. Clocked Flip-Flops',
    iitCode: 'IITR-DE-EXP06',
    category: 'Sequential',
    icChips: ['7474 (Dual D Flip-Flop)', '7476 (Dual JK Flip-Flop)'],
    objective:
      'To investigate edge-triggered sequential flip-flops, verify characteristic equations and excitation tables, and explore the JK toggle mode.',
    theory:
      'A flip-flop is a clocked, edge-triggered bistable multivibrator. Unlike transparent latches, flip-flops sample data exclusively during the clock transition (positive or negative edge). The D Flip-Flop eliminates race conditions by transmitting D to Q on the clock edge. The JK Flip-Flop resolves the invalid state of the SR latch: when J=1, K=1, the output toggles on every active clock pulse (Q_next = ¬Q), making it an ideal frequency divider.',
    equations: [
      'Q_{next,D} = D',
      'Q_{next,JK} = J\\overline{Q} + \\overline{K}Q',
      'Q_{next,T} = T \\oplus Q = T\\overline{Q} + \\overline{T}Q',
      'Q_{next,SR} = S + \\overline{R}Q \\quad (S \\cdot R = 0)',
    ],
    procedure: [
      { step: 1, title: 'D Flip-Flop Verification', instruction: 'Set D=1, pulse the clock edge. Verify Q updates to 1 only on the transition.' },
      { step: 2, title: 'JK Flip-Flop Hold and Reset', instruction: 'Test J=0, K=0 (Hold), J=0, K=1 (Reset), and J=1, K=0 (Set).' },
      { step: 3, title: 'JK Toggle Mode Verification', instruction: 'Set J=1, K=1. Pulse clock repeatedly and observe divide-by-2 toggle action.' },
      { step: 4, title: 'T Flip-Flop Configuration', instruction: 'Tie J and K inputs together to form a T (Toggle) flip-flop.' },
    ],
    quiz: [
      {
        question: 'What is the characteristic equation of a JK Flip-Flop?',
        options: ['Q_next = J + K · Q', 'Q_next = J · Q\' + K\' · Q', 'Q_next = D', 'Q_next = J · K'],
        answerIndex: 1,
        explanation: 'The JK characteristic equation is Q(next) = J·Q\' + K\'·Q.',
      },
      {
        question: 'What happens in a JK flip-flop when both J and K are held HIGH during consecutive clock pulses?',
        options: ['Output stays at 0', 'Output stays at 1', 'Output toggles on every active clock edge', 'Device enters forbidden state'],
        answerIndex: 2,
        explanation: 'When J=1 and K=1, the flip-flop toggles its output on every active clock edge (divide-by-2 behavior).',
      },
      {
        question: 'What distinguishes an edge-triggered flip-flop from a level-sensitive latch?',
        options: ['Flip-flops operate on AC power', 'Flip-flops change state only during the clock voltage transition', 'Latches have higher bit capacity', 'Latches do not have Q outputs'],
        answerIndex: 1,
        explanation: 'Edge-triggered flip-flops sample their inputs during a very brief clock transition (e.g. rising edge), remaining impervious to input variations during the rest of the clock period.',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS74AN (Dual D Positive-Edge Flip-Flop)',
      description: 'Contains two independent positive-edge triggered D-type flip-flops with asynchronous preset and clear.',
      pinCount: 14,
      pins: [
        { number: 1, label: '1CLR', type: 'control', description: 'Flip-Flop 1 Asynchronous Clear (Active Low)' },
        { number: 2, label: '1D', type: 'input', description: 'Flip-Flop 1 Data Input' },
        { number: 3, label: '1CLK', type: 'clock', description: 'Flip-Flop 1 Clock Pulse Input' },
        { number: 4, label: '1PRE', type: 'control', description: 'Flip-Flop 1 Asynchronous Preset (Active Low)' },
        { number: 5, label: '1Q', type: 'output', description: 'Flip-Flop 1 Non-Inverted Output' },
        { number: 6, label: '1Q̄', type: 'output', description: 'Flip-Flop 1 Inverted Output' },
        { number: 7, label: 'GND', type: 'ground', description: 'Ground (0V)' },
        { number: 8, label: '2Q̄', type: 'output', description: 'Flip-Flop 2 Inverted Output' },
        { number: 9, label: '2Q', type: 'output', description: 'Flip-Flop 2 Non-Inverted Output' },
        { number: 10, label: '2PRE', type: 'control', description: 'Flip-Flop 2 Preset' },
        { number: 11, label: '2CLK', type: 'clock', description: 'Flip-Flop 2 Clock' },
        { number: 12, label: '2D', type: 'input', description: 'Flip-Flop 2 Data' },
        { number: 13, label: '2CLR', type: 'control', description: 'Flip-Flop 2 Clear' },
        { number: 14, label: 'VCC', type: 'power', description: 'Power (+5V)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 7: 4-Bit SIPO Shift Register
  // -------------------------------------------------------------------------
  {
    id: 'shift-register',
    expNumber: 7,
    title: 'Design, Construction and Testing of 4-Bit SIPO Shift Register',
    shortTitle: '7. 4-Bit SIPO Shift Register',
    iitCode: 'IITR-DE-EXP07',
    category: 'Sequential',
    icChips: ['74164 (8-Bit SIPO Shift Register)', '7474 (Dual D-FF)'],
    objective:
      'To build a 4-bit Serial-In Parallel-Out shift register, observe synchronous bit shifting across cascaded flip-flops, and convert serial bitstreams into parallel bus words.',
    theory:
      'A shift register consists of cascaded flip-flops sharing a common clock. In a Serial-In Parallel-Out (SIPO) register, data bits are loaded one bit per clock cycle through a single serial input pin. On each rising clock edge, each flip-flop shifts its stored bit to the adjacent flip-flop (Q[k] = Q[k-1]), while the new input enters the first stage (Q0). After 4 clock cycles, a 4-bit word is simultaneously available across all parallel output pins.',
    equations: [
      'Q_0(t+1) = \\text{SerialIn}(t)',
      'Q_1(t+1) = Q_0(t)',
      'Q_2(t+1) = Q_1(t)',
      'Q_3(t+1) = Q_2(t)',
    ],
    procedure: [
      { step: 1, title: 'Master Clear Assertion', instruction: 'Assert Clear (Active-Low) to reset all 4 output stages to 0000.' },
      { step: 2, title: 'Bitstream Sequencing', instruction: 'Set Serial Input to 1. Provide 1 clock pulse. Observe Q0=1, Q1=0, Q2=0, Q3=0.' },
      { step: 3, title: 'Multi-Cycle Shift', instruction: 'Sequence a complete 4-bit pattern (e.g. 1-0-1-1) across 4 clock edges.' },
      { step: 4, title: 'Parallel Output Inspection', instruction: 'Inspect the resulting 4-bit parallel bus: Q3=1, Q2=0, Q1=1, Q0=1 (Hex 0xB).' },
    ],
    quiz: [
      {
        question: 'How many clock cycles are required to load a 4-bit word into a 4-bit SIPO shift register?',
        options: ['1 cycle', '2 cycles', '4 cycles', '8 cycles'],
        answerIndex: 2,
        explanation: 'In a serial-in architecture, exactly 1 clock pulse is required per bit, so a 4-bit word requires 4 clock cycles.',
      },
      {
        question: 'In a SIPO shift register, which output stage holds the very first bit shifted in after 4 clock pulses?',
        options: ['Q0 (First stage)', 'Q1', 'Q2', 'Q3 (Last stage / MSB)'],
        answerIndex: 3,
        explanation: 'The first bit entered is shifted successively rightward on each cycle, reaching Q3 after 4 clock edges.',
      },
      {
        question: 'What is the primary industrial application of SIPO shift registers?',
        options: ['Digital-to-Analog conversion', 'Serial-to-parallel bus deserialization (e.g. SPI, UART receivers)', 'Generating random numbers', 'Arithmetic division'],
        answerIndex: 1,
        explanation: 'SIPO registers deserialize serial bit streams arriving over long single-wire communication links into parallel data buses.',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS164N (8-Bit SIPO Shift Register)',
      description: '8-bit serial-in parallel-out shift register featuring gated serial inputs and asynchronous master reset.',
      pinCount: 14,
      pins: [
        { number: 1, label: 'A', type: 'input', description: 'Serial Data Input A' },
        { number: 2, label: 'B', type: 'input', description: 'Serial Data Input B' },
        { number: 3, label: 'QA', type: 'output', description: 'Parallel Output Stage 0' },
        { number: 4, label: 'QB', type: 'output', description: 'Parallel Output Stage 1' },
        { number: 5, label: 'QC', type: 'output', description: 'Parallel Output Stage 2' },
        { number: 6, label: 'QD', type: 'output', description: 'Parallel Output Stage 3' },
        { number: 7, label: 'GND', type: 'ground', description: 'Ground' },
        { number: 8, label: 'CLK', type: 'clock', description: 'Shift Clock Input' },
        { number: 9, label: 'CLR', type: 'control', description: 'Master Reset (Active Low)' },
        { number: 10, label: 'QE', type: 'output', description: 'Stage 4 Output' },
        { number: 11, label: 'QF', type: 'output', description: 'Stage 5 Output' },
        { number: 12, label: 'QG', type: 'output', description: 'Stage 6 Output' },
        { number: 13, label: 'QH', type: 'output', description: 'Stage 7 Output' },
        { number: 14, label: 'VCC', type: 'power', description: 'Power (+5V)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 8: 3-to-8 Decoder & Priority Encoder
  // -------------------------------------------------------------------------
  {
    id: 'decoder-encoder',
    expNumber: 8,
    title: 'Study of 3-to-8 Line Decoder (74138) and 4-to-2 Priority Encoder',
    shortTitle: '8. Decoders & Encoders',
    iitCode: 'IITR-DE-EXP08',
    category: 'Combinational',
    icChips: ['74138 (3-to-8 Decoder)', '74148 (8-to-3 Priority Encoder)'],
    objective:
      'To verify 3-to-8 binary address decoding, active-low output behavior, enable gating, and priority resolution for concurrent input lines.',
    theory:
      'A decoder converts an n-bit binary input code into a maximum of 2^n unique output lines. The standard 74LS138 decoder has 3 select lines (A, B, C) and 8 active-low outputs (Y0 to Y7). When enabled, exactly one output corresponding to the binary value of the address lines goes LOW. An encoder executes the inverse operation: converting active input lines to binary codes. A Priority Encoder resolves collisions when multiple inputs are asserted by granting priority to the highest-indexed line.',
    equations: [
      'Y_k = \\overline{m_k} \\quad (\\text{Active-Low minterm decoding})',
      '\\text{Enable} = G_1 \\cdot \\overline{G_{2A}} \\cdot \\overline{G_{2B}}',
    ],
    procedure: [
      { step: 1, title: 'Enable Pin Setup', instruction: 'Assert G1=1 and G2A=0, G2B=0 to activate the 74138 decoder chip.' },
      { step: 2, title: 'Address Selection', instruction: 'Set select lines C, B, A to 000. Verify output Y0 goes LOW (Active) while all other outputs remain HIGH.' },
      { step: 3, title: 'Full Address Scan', instruction: 'Cycle address lines from 000 through 111, verifying corresponding outputs Y0 through Y7.' },
      { step: 4, title: 'Priority Encoder Testing', instruction: 'Assert input lines 1 and 3 simultaneously; verify output code reflects priority line 3.' },
    ],
    quiz: [
      {
        question: 'Why are the outputs of the 74138 3-to-8 line decoder designated as active-low?',
        options: ['They conserve battery power', 'The selected output goes to 0V (LOW) while unselected outputs remain at 5V (HIGH)', 'They only work with negative numbers', 'It requires an external inverter'],
        answerIndex: 1,
        explanation: 'Active-low outputs drive LOW (0) when selected, which matches standard TTL memory chip-enable conventions.',
      },
      {
        question: 'If inputs 1, 2, and 3 are all asserted HIGH on a 4-to-2 Priority Encoder (with input 3 as highest priority), what is the output?',
        options: ['00', '01', '10', '11 (binary 3)'],
        answerIndex: 3,
        explanation: 'Priority encoders prioritize the highest active line index, so input 3 overrides inputs 1 and 2 to produce output 11.',
      },
      {
        question: 'How can a 3-to-8 decoder be used to implement an arbitrary Boolean function?',
        options: ['By connecting selected active-low minterm outputs to a NAND gate', 'By connecting inputs to ground', 'Decoders cannot implement logic functions', 'By increasing VCC'],
        answerIndex: 0,
        explanation: 'Because a decoder generates all minterms, combining active-low minterm lines with a NAND gate realizes any Sum-of-Products (SOP) function.',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS138N (3-to-8 Line Decoder/Demultiplexer)',
      description: 'High-speed 3-line to 8-line decoder with three enable inputs designed for memory address decoding.',
      pinCount: 16,
      pins: [
        { number: 1, label: 'A', type: 'input', description: 'Address Select Line A (LSB)' },
        { number: 2, label: 'B', type: 'input', description: 'Address Select Line B' },
        { number: 3, label: 'C', type: 'input', description: 'Address Select Line C (MSB)' },
        { number: 4, label: 'G2A', type: 'control', description: 'Enable Input 2A (Active Low)' },
        { number: 5, label: 'G2B', type: 'control', description: 'Enable Input 2B (Active Low)' },
        { number: 6, label: 'G1', type: 'control', description: 'Enable Input 1 (Active High)' },
        { number: 7, label: 'Y7', type: 'output', description: 'Decoded Output 7 (Active Low)' },
        { number: 8, label: 'GND', type: 'ground', description: 'Ground' },
        { number: 9, label: 'Y6', type: 'output', description: 'Decoded Output 6' },
        { number: 10, label: 'Y5', type: 'output', description: 'Decoded Output 5' },
        { number: 11, label: 'Y4', type: 'output', description: 'Decoded Output 4' },
        { number: 12, label: 'Y3', type: 'output', description: 'Decoded Output 3' },
        { number: 13, label: 'Y2', type: 'output', description: 'Decoded Output 2' },
        { number: 14, label: 'Y1', type: 'output', description: 'Decoded Output 1' },
        { number: 15, label: 'Y0', type: 'output', description: 'Decoded Output 0' },
        { number: 16, label: 'VCC', type: 'power', description: 'Power (+5V)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 9: 4:1 Multiplexer & 1:4 Demultiplexer
  // -------------------------------------------------------------------------
  {
    id: 'mux-demux',
    expNumber: 9,
    title: 'Study of 4:1 Multiplexer (74151/74153) and 1:4 Demultiplexer',
    shortTitle: '9. MUX & DEMUX',
    iitCode: 'IITR-DE-EXP09',
    category: 'Combinational',
    icChips: ['74151 (8:1 MUX)', '74153 (Dual 4:1 MUX)'],
    objective:
      'To investigate digital data selection, multiplexing multiple data channels onto a single transmission medium, and demultiplexing to designated destinations.',
    theory:
      'A Multiplexer (data selector) directs one of 2^n input lines to a single common output line based on an n-bit binary select address. A 4:1 MUX has 4 data inputs (I0, I1, I2, I3), 2 select lines (S1, S0), and 1 output Y. A Demultiplexer performs the complementary reverse operation, receiving a single input line and routing it to one of multiple output channels. Multiplexers are also universal combinational function generators: an n-variable function can be synthesized using a 2^(n-1):1 MUX.',
    equations: [
      'Y = \\overline{S_1}\\,\\overline{S_0} I_0 + \\overline{S_1} S_0 I_1 + S_1 \\overline{S_0} I_2 + S_1 S_0 I_3',
      'Y_k = \\text{DataIn} \\cdot (\\text{Select} == k) \\quad (\\text{DEMUX})',
    ],
    procedure: [
      { step: 1, title: 'Data Line Biasing', instruction: 'Set data inputs I0=0, I1=1, I2=0, I3=1 with input toggle switches.' },
      { step: 2, title: 'Select Line Control', instruction: 'Set select lines S1=0, S0=1. Observe that output Y mirrors data input I1 (1).' },
      { step: 3, title: 'Channel Switching', instruction: 'Change S1=1, S0=0. Verify output Y immediately switches to mirror input I2 (0).' },
      { step: 4, title: 'Function Synthesis', instruction: 'Configure data inputs to implement a 3-variable XOR function via 4:1 MUX.' },
    ],
    quiz: [
      {
        question: 'How many select lines are required for an 8:1 multiplexer?',
        options: ['2', '3', '4', '8'],
        answerIndex: 1,
        explanation: 'For 2^n inputs, exactly n select lines are required: 2^3 = 8, so 3 select lines are needed.',
      },
      {
        question: 'What is the state of a 4:1 MUX output Y when Enable (Strobe) is asserted inactive HIGH?',
        options: ['1', '0', 'Mirrors input I0', 'High-Impedance'],
        answerIndex: 1,
        explanation: 'When the active-low Enable is HIGH (disabled), the internal AND gates are disabled, forcing output Y to 0.',
      },
      {
        question: 'How does a Demultiplexer differ from a Decoder?',
        options: ['A DEMUX has a data input routed to selected outputs; a decoder converts binary address to one-hot output without data input', 'They are completely identical', 'A DEMUX has more inputs than outputs', 'A decoder requires an external oscillator'],
        answerIndex: 0,
        explanation: 'A decoder activates an output line based purely on an address, whereas a DEMUX channels an actual data signal to that selected line.',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS151N (8-Line to 1-Line Data Selector/Multiplexer)',
      description: 'Monolithic 8-channel multiplexer with complementary outputs Y and W, and active-low strobe.',
      pinCount: 16,
      pins: [
        { number: 1, label: 'D3', type: 'input', description: 'Data Input 3' },
        { number: 2, label: 'D2', type: 'input', description: 'Data Input 2' },
        { number: 3, label: 'D1', type: 'input', description: 'Data Input 1' },
        { number: 4, label: 'D0', type: 'input', description: 'Data Input 0' },
        { number: 5, label: 'Y', type: 'output', description: 'Multiplexed Output Y' },
        { number: 6, label: 'W', type: 'output', description: 'Inverted Multiplexed Output W' },
        { number: 7, label: 'Ḡ', type: 'control', description: 'Strobe/Enable (Active Low)' },
        { number: 8, label: 'GND', type: 'ground', description: 'Ground' },
        { number: 9, label: 'C', type: 'input', description: 'Select Line C (MSB)' },
        { number: 10, label: 'B', type: 'input', description: 'Select Line B' },
        { number: 11, label: 'A', type: 'input', description: 'Select Line A (LSB)' },
        { number: 12, label: 'D7', type: 'input', description: 'Data Input 7' },
        { number: 13, label: 'D6', type: 'input', description: 'Data Input 6' },
        { number: 14, label: 'D5', type: 'input', description: 'Data Input 5' },
        { number: 15, label: 'D4', type: 'input', description: 'Data Input 4' },
        { number: 16, label: 'VCC', type: 'power', description: 'Power (+5V)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 10: Asynchronous vs Synchronous Counters
  // -------------------------------------------------------------------------
  {
    id: 'counters',
    expNumber: 10,
    title: 'Synchronous and Asynchronous 4-Bit Binary Counters and Timing Delay Analysis',
    shortTitle: '10. Sync vs Async Counters',
    iitCode: 'IITR-DE-EXP10',
    category: 'Sequential',
    icChips: ['7493 (4-Bit Binary Ripple Counter)', '74161 (Synchronous 4-Bit Binary Counter)'],
    objective:
      'To construct 4-bit ripple and synchronous counters, observe cumulative propagation delays (Δt = n · t_pd), and detect transient decoding glitch spikes.',
    theory:
      'In an Asynchronous (Ripple) counter, flip-flops are chained such that each stage clock is driven by the output of the preceding stage. Because each stage must wait for previous stages to settle, propagation delays accumulate: t_total = n · t_pd. During multi-bit state transitions (e.g. 7 to 8), intermediate transient states occur (0111 -> 0110 -> 0100 -> 0000 -> 1000), producing false decoding spikes. In a Synchronous counter, all flip-flops share a common clock line, toggling in parallel with constant single-stage delay and zero ripple spikes.',
    equations: [
      't_{\\text{delay, async}} = n \\cdot t_{pd}',
      't_{\\text{delay, sync}} = t_{pd} + t_{\\text{gate}}',
      'f_{max, async} = \\frac{1}{n \\cdot t_{pd}}',
      'f_{max, sync} = \\frac{1}{t_{pd} + t_{gate}}',
    ],
    procedure: [
      { step: 1, title: 'Ripple Counter Clocking', instruction: 'Pulse the ripple counter clock. Observe each stage toggles half as often as the previous stage.' },
      { step: 2, title: 'Glitch Spike Observation', instruction: 'Step the counter from 7 (0111) to 8 (1000). Inspect transient decoding states.' },
      { step: 3, title: 'Synchronous Mode Comparison', instruction: 'Switch to synchronous counter architecture. Observe parallel transitions on clock edges.' },
      { step: 4, title: 'Frequency Limit Analysis', instruction: 'Compare the maximum operating frequencies of asynchronous and synchronous topologies.' },
    ],
    quiz: [
      {
        question: 'Why do transient decoding glitches occur in asynchronous ripple counters?',
        options: ['Flip-flops toggle at slightly different times due to cumulative propagation delay', 'The power supply voltage fluctuates', 'The clock pulse is too short', 'Capacitive coupling between wires'],
        answerIndex: 0,
        explanation: 'Because each flip-flop is clocked by the preceding flip-flop, the bits change sequentially rather than simultaneously, briefly passing through invalid intermediate states.',
      },
      {
        question: 'If each flip-flop has a propagation delay of 12 ns, what is the total settling time of a 4-bit ripple counter?',
        options: ['12 ns', '24 ns', '48 ns', '96 ns'],
        answerIndex: 2,
        explanation: 'In a ripple counter, delays accumulate: 4 stages × 12 ns = 48 ns.',
      },
      {
        question: 'What is the principal advantage of a synchronous counter over an asynchronous counter?',
        options: ['It requires fewer components', 'All bits update simultaneously on the clock edge, eliminating ripple delay and glitches', 'It works without power', 'It only counts downwards'],
        answerIndex: 1,
        explanation: 'Synchronous clocking ensures that all flip-flop outputs update at the exact same instant, enabling significantly higher maximum clock frequencies.',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS161AN (Synchronous 4-Bit Binary Counter)',
      description: 'Synchronous 4-bit binary counter with internal lookahead carry, asynchronous clear, and synchronous load.',
      pinCount: 16,
      pins: [
        { number: 1, label: 'CLR̄', type: 'control', description: 'Asynchronous Clear (Active Low)' },
        { number: 2, label: 'CLK', type: 'clock', description: 'Synchronous Clock Pulse' },
        { number: 3, label: 'A', type: 'input', description: 'Parallel Data Load Bit A' },
        { number: 4, label: 'B', type: 'input', description: 'Parallel Data Load Bit B' },
        { number: 5, label: 'C', type: 'input', description: 'Parallel Data Load Bit C' },
        { number: 6, label: 'D', type: 'input', description: 'Parallel Data Load Bit D' },
        { number: 7, label: 'ENP', type: 'control', description: 'Count Enable Parallel' },
        { number: 8, label: 'GND', type: 'ground', description: 'Ground' },
        { number: 9, label: 'LOAD̄', type: 'control', description: 'Parallel Load Enable' },
        { number: 10, label: 'ENT', type: 'control', description: 'Count Enable Trickle' },
        { number: 11, label: 'QD', type: 'output', description: 'Counter Bit 3 Output (MSB)' },
        { number: 12, label: 'QC', type: 'output', description: 'Counter Bit 2 Output' },
        { number: 13, label: 'QB', type: 'output', description: 'Counter Bit 1 Output' },
        { number: 14, label: 'QA', type: 'output', description: 'Counter Bit 0 Output (LSB)' },
        { number: 15, label: 'RCO', type: 'output', description: 'Ripple Carry Output (Terminal Count 15)' },
        { number: 16, label: 'VCC', type: 'power', description: 'Power (+5V)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 11: Binary-to-Gray & Gray-to-Binary Converters
  // -------------------------------------------------------------------------
  {
    id: 'code-converters',
    expNumber: 11,
    title: '4-Bit Binary-to-Gray and Gray-to-Binary Code Converters',
    shortTitle: '11. Gray Code Converters',
    iitCode: 'IITR-DE-EXP11',
    category: 'Converters',
    icChips: ['7486 (Quad XOR Gate)'],
    objective:
      'To build 4-bit bidirectional Gray code converters using XOR logic trees and verify the unit Hamming distance (H=1) property for rotary optical shaft encoders.',
    theory:
      'A Gray code (reflected binary code) is an unweighted code where adjacent numerical values differ by exactly one binary bit. This unit-distance property eliminates race errors in mechanical shaft position encoders where multiple mechanical brushes might otherwise make contact asynchronously. Conversion from binary (B) to Gray (G) uses G_k = B_k ⊕ B_{k+1}. The inverse conversion from Gray to binary uses B_k = G_k ⊕ B_{k+1}.',
    equations: [
      'G_3 = B_3',
      'G_2 = B_3 \\oplus B_2',
      'G_1 = B_2 \\oplus B_1',
      'G_0 = B_1 \\oplus B_0',
      'B_3 = G_3',
      'B_2 = B_3 \\oplus G_2',
      'B_1 = B_2 \\oplus G_1',
      'B_0 = B_1 \\oplus G_0',
      'H(G_i, G_{i+1}) = 1 \\quad (\\text{Unit Distance})',
    ],
    procedure: [
      { step: 1, title: 'Binary to Gray XOR Wiring', instruction: 'Connect 4-bit binary switches B3-B0 to the 7486 XOR gates following the ladder equations.' },
      { step: 2, title: 'Step-by-Step Code Validation', instruction: 'Cycle through values 0 to 15. Verify only 1 bit flips between any two consecutive values.' },
      { step: 3, title: 'Shaft Encoder Simulation', instruction: 'Rotate the optical angle wheel and observe instantaneous Gray code transitions without ambiguity.' },
      { step: 4, title: 'Gray to Binary Decoding', instruction: 'Wire the feedback XOR chain and verify perfect reconstruction of the original binary word.' },
    ],
    quiz: [
      {
        question: 'What is the fundamental property of a Gray code sequence?',
        options: ['Every code word has equal parity', 'Consecutive code words differ by exactly one binary bit (Hamming distance = 1)', 'It represents only prime numbers', 'All bit positions are weighted by powers of 2'],
        answerIndex: 1,
        explanation: 'The defining characteristic of Gray code is the unit-distance property: exactly one bit changes state between adjacent sequence steps.',
      },
      {
        question: 'What is the 4-bit Gray code equivalent of binary 1001 (decimal 9)?',
        options: ['1101', '1111', '1100', '1011'],
        answerIndex: 0,
        explanation: 'G3 = B3 = 1; G2 = B3 ⊕ B2 = 1 ⊕ 0 = 1; G1 = B2 ⊕ B1 = 0 ⊕ 0 = 0; G0 = B1 ⊕ B0 = 0 ⊕ 1 = 1. Result = 1101.',
      },
      {
        question: 'Why are Gray codes preferred over natural binary in optical rotary shaft angle encoders?',
        options: ['Gray codes require less wire gauge', 'To prevent catastrophic spurious intermediate codes when multiple tracks switch simultaneously', 'Gray codes generate higher torque', 'Natural binary cannot represent 360 degrees'],
        answerIndex: 1,
        explanation: 'In natural binary, transitioning from 0111 (7) to 1000 (8) changes all 4 bits simultaneously; mechanical misalignment can produce spurious readouts (e.g. 1111). Gray code changes only 1 bit, guaranteeing error-free readings.',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS86N (Quad 2-Input XOR)',
      description: 'Four XOR gates configured in feedforward or feedback ladder arrangements for code conversion.',
      pinCount: 14,
      pins: [
        { number: 1, label: '1A (B3)', type: 'input', description: 'Binary Bit 3 (MSB)' },
        { number: 2, label: '1B (B2)', type: 'input', description: 'Binary Bit 2' },
        { number: 3, label: '1Y (G2)', type: 'output', description: 'Gray Code Bit 2: B3 ⊕ B2' },
        { number: 4, label: '2A (B2)', type: 'input', description: 'Binary Bit 2' },
        { number: 5, label: '2B (B1)', type: 'input', description: 'Binary Bit 1' },
        { number: 6, label: '2Y (G1)', type: 'output', description: 'Gray Code Bit 1: B2 ⊕ B1' },
        { number: 7, label: 'GND', type: 'ground', description: 'Ground' },
        { number: 8, label: '3Y (G0)', type: 'output', description: 'Gray Code Bit 0: B1 ⊕ B0' },
        { number: 9, label: '3A (B1)', type: 'input', description: 'Binary Bit 1' },
        { number: 10, label: '3B (B0)', type: 'input', description: 'Binary Bit 0 (LSB)' },
        { number: 11, label: '4Y', type: 'output', description: 'Spare Output' },
        { number: 12, label: '4A', type: 'input', description: 'Spare Input A' },
        { number: 13, label: '4B', type: 'input', description: 'Spare Input B' },
        { number: 14, label: 'VCC', type: 'power', description: 'Power (+5V)' },
      ],
    },
  },

  // -------------------------------------------------------------------------
  // EXPERIMENT 12: 1-Bit and 2-Bit Magnitude Comparators
  // -------------------------------------------------------------------------
  {
    id: 'comparators',
    expNumber: 12,
    title: '1-Bit, 2-Bit and 4-Bit Digital Magnitude Comparators (74LS85)',
    shortTitle: '12. Magnitude Comparators',
    iitCode: 'IITR-DE-EXP12',
    category: 'Combinational',
    icChips: ['7485 (4-Bit Magnitude Comparator)'],
    objective:
      'To design and construct magnitude comparators, evaluate bitwise relationships (A > B, A = B, A < B), and analyze cascading for multi-byte word evaluation.',
    theory:
      'A digital comparator evaluates two binary words A and B and asserts one of three mutually exclusive output flags: A > B, A = B, or A < B. For a 1-bit comparator: A > B = A · ¬B, A = B = ¬(A ⊕ B), and A < B = ¬A · B. For multi-bit words, bits are compared starting from the most significant bit (MSB). If MSBs are equal, the comparison propagates to the next lower bit. The 74LS85 integrates this hierarchical tree with cascading inputs for expanding to 8-bit, 16-bit, and 32-bit words.',
    equations: [
      'A > B = A_1\\overline{B_1} + (A_1 \\odot B_1) \\cdot A_0\\overline{B_0}',
      'A = B = (A_1 \\odot B_1) \\cdot (A_0 \\odot B_0)',
      'A < B = \\overline{A_1}B_1 + (A_1 \\odot B_1) \\cdot \\overline{A_0}B_0',
    ],
    procedure: [
      { step: 1, title: '1-Bit Mutual Exclusivity', instruction: 'Test 1-bit inputs A and B. Verify that exactly one of the three output flags is HIGH at any time.' },
      { step: 2, title: '2-Bit Hierarchical Comparison', instruction: 'Set A1A0 = 10 (2) and B1B0 = 01 (1). Observe MSB dominance asserting A > B immediately.' },
      { step: 3, title: 'Equality Propagation', instruction: 'Set A1A0 = 11 and B1B0 = 11. Verify equality flag asserts while > and < remain LOW.' },
      { step: 4, title: '4-Bit 74LS85 Cascade Testing', instruction: 'Explore cascading inputs (I_A>B, I_A=B, I_A<B) to chain two comparators for 8-bit bytes.' },
    ],
    quiz: [
      {
        question: 'Under what condition does a 2-bit comparator evaluate the least significant bits (A0 and B0)?',
        options: ['Always at all times', 'Only when the most significant bits A1 and B1 are identical (A1 = B1)', 'Only when VCC exceeds 5V', 'Never'],
        answerIndex: 1,
        explanation: 'In hierarchical magnitude comparison, lower-order bits are only consulted when all higher-order bits are equal.',
      },
      {
        question: 'Are the three comparator output flags (A>B, A=B, A<B) ever simultaneously HIGH?',
        options: ['Yes, when inputs are zero', 'Yes, during clock edges', 'No, they are strictly mutually exclusive', 'Yes, in 2s complement'],
        answerIndex: 2,
        explanation: 'For any two real numbers A and B, exactly one relationship must hold: either A > B, A = B, or A < B (law of trichotomy).',
      },
      {
        question: 'Which logic gate represents single-bit equality (A = B)?',
        options: ['XOR Gate', 'XNOR (Equivalence) Gate', 'NAND Gate', 'OR Gate'],
        answerIndex: 1,
        explanation: 'The Exclusive-NOR (XNOR) gate outputs 1 if and only if both inputs are identical (00 or 11), directly computing bitwise equality.',
      },
    ],
    dipConfig: {
      chipName: 'SN74LS85N (4-Bit Magnitude Comparator)',
      description: '4-bit magnitude comparator with cascading inputs for multi-byte word evaluation.',
      pinCount: 16,
      pins: [
        { number: 1, label: 'B3', type: 'input', description: 'Operand B Bit 3 (MSB)' },
        { number: 2, label: 'I_{A<B}', type: 'control', description: 'Cascading Input: A < B' },
        { number: 3, label: 'I_{A=B}', type: 'control', description: 'Cascading Input: A = B' },
        { number: 4, label: 'I_{A>B}', type: 'control', description: 'Cascading Input: A > B' },
        { number: 5, label: 'A>B', type: 'output', description: 'Output Flag: A > B' },
        { number: 6, label: 'A=B', type: 'output', description: 'Output Flag: A = B' },
        { number: 7, label: 'A<B', type: 'output', description: 'Output Flag: A < B' },
        { number: 8, label: 'GND', type: 'ground', description: 'Ground' },
        { number: 9, label: 'B0', type: 'input', description: 'Operand B Bit 0 (LSB)' },
        { number: 10, label: 'A0', type: 'input', description: 'Operand A Bit 0 (LSB)' },
        { number: 11, label: 'B1', type: 'input', description: 'Operand B Bit 1' },
        { number: 12, label: 'A1', type: 'input', description: 'Operand A Bit 1' },
        { number: 13, label: 'A2', type: 'input', description: 'Operand A Bit 2' },
        { number: 14, label: 'B2', type: 'input', description: 'Operand B Bit 2' },
        { number: 15, label: 'A3', type: 'input', description: 'Operand A Bit 3 (MSB)' },
        { number: 16, label: 'VCC', type: 'power', description: 'Power (+5V)' },
      ],
    },
  },
];
