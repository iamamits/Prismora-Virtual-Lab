export type TMHeadDirection = 'L' | 'R' | 'S'; // Left, Right, Stay

export interface TMTransition {
  currentState: string;
  readSymbol: string;
  nextState: string;
  writeSymbol: string;
  direction: TMHeadDirection;
}

export interface TuringMachineConfig {
  states: string[];
  inputAlphabet: string[];
  tapeAlphabet: string[]; // inputAlphabet + blank symbol '⊔' / '_'
  initialState: string;
  acceptState: string;
  rejectState: string;
  blankSymbol: string;
  transitions: TMTransition[];
}

export interface TMExecutionState {
  tape: string[];
  headPosition: number;
  currentState: string;
  stepCount: number;
  halted: boolean;
  accepted: boolean;
  rejected: boolean;
  statusMessage: string;
}

export class TuringMachineEngine {
  private config: TuringMachineConfig;
  private state: TMExecutionState;

  constructor(config: TuringMachineConfig) {
    this.config = config;
    this.state = this.getInitialState('');
  }

  getInitialState(input: string): TMExecutionState {
    const blank = this.config.blankSymbol;
    const initialTape = input.length > 0 ? input.split('') : [blank];
    // Pad with blanks on both sides
    const tape = [blank, blank, ...initialTape, blank, blank];

    return {
      tape,
      headPosition: 2, // Points to start of input
      currentState: this.config.initialState,
      stepCount: 0,
      halted: false,
      accepted: false,
      rejected: false,
      statusMessage: `Ready. Initial state: ${this.config.initialState}`,
    };
  }

  loadInput(input: string): void {
    this.state = this.getInitialState(input);
  }

  getState(): TMExecutionState {
    return {
      ...this.state,
      tape: [...this.state.tape],
    };
  }

  step(): TMExecutionState {
    if (this.state.halted) return this.getState();

    // Check if in accept or reject state
    if (this.state.currentState === this.config.acceptState) {
      this.state.halted = true;
      this.state.accepted = true;
      this.state.statusMessage = `Halted: Accepted in state ${this.config.acceptState}`;
      return this.getState();
    }
    if (this.state.currentState === this.config.rejectState) {
      this.state.halted = true;
      this.state.rejected = true;
      this.state.statusMessage = `Halted: Rejected in state ${this.config.rejectState}`;
      return this.getState();
    }

    const currentSymbol = this.state.tape[this.state.headPosition] ?? this.config.blankSymbol;

    // Find matching transition
    const tr = this.config.transitions.find(
      (t) => t.currentState === this.state.currentState && t.readSymbol === currentSymbol,
    );

    if (!tr) {
      // No transition defined: implicitly reject / halt
      this.state.halted = true;
      this.state.rejected = true;
      this.state.statusMessage = `Halted: No transition from (${this.state.currentState}, '${currentSymbol}') -> Rejected`;
      return this.getState();
    }

    // Apply transition: Write symbol
    this.state.tape[this.state.headPosition] = tr.writeSymbol;
    this.state.currentState = tr.nextState;
    this.state.stepCount++;

    // Move Head
    if (tr.direction === 'R') {
      this.state.headPosition++;
      if (this.state.headPosition >= this.state.tape.length) {
        this.state.tape.push(this.config.blankSymbol);
      }
    } else if (tr.direction === 'L') {
      this.state.headPosition--;
      if (this.state.headPosition < 0) {
        this.state.tape.unshift(this.config.blankSymbol);
        this.state.headPosition = 0;
      }
    }

    // Check acceptance
    if (this.state.currentState === this.config.acceptState) {
      this.state.halted = true;
      this.state.accepted = true;
      this.state.statusMessage = `Success: String Accepted in ${this.state.stepCount} steps!`;
    } else if (this.state.currentState === this.config.rejectState) {
      this.state.halted = true;
      this.state.rejected = true;
      this.state.statusMessage = `String Rejected in ${this.state.stepCount} steps.`;
    } else {
      this.state.statusMessage = `Step ${this.state.stepCount}: Read '${currentSymbol}', wrote '${tr.writeSymbol}', moved ${tr.direction} -> State ${tr.nextState}`;
    }

    return this.getState();
  }
}

/**
 * Pre-built Turing Machine: Binary Incrementer (adds 1 to a binary string)
 * e.g. "1011" + 1 -> "1100"
 */
export const BINARY_INCREMENTER_TM: TuringMachineConfig = {
  states: ['q0', 'q1', 'q_accept'],
  inputAlphabet: ['0', '1'],
  tapeAlphabet: ['0', '1', '_'],
  initialState: 'q0',
  acceptState: 'q_accept',
  rejectState: 'q_reject',
  blankSymbol: '_',
  transitions: [
    // Move to end of binary number
    { currentState: 'q0', readSymbol: '0', nextState: 'q0', writeSymbol: '0', direction: 'R' },
    { currentState: 'q0', readSymbol: '1', nextState: 'q0', writeSymbol: '1', direction: 'R' },
    { currentState: 'q0', readSymbol: '_', nextState: 'q1', writeSymbol: '_', direction: 'L' },

    // Carry propagation backwards
    { currentState: 'q1', readSymbol: '1', nextState: 'q1', writeSymbol: '0', direction: 'L' },
    { currentState: 'q1', readSymbol: '0', nextState: 'q_accept', writeSymbol: '1', direction: 'S' },
    { currentState: 'q1', readSymbol: '_', nextState: 'q_accept', writeSymbol: '1', direction: 'S' },
  ],
};
