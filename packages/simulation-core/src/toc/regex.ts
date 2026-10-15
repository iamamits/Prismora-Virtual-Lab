import type { AutomatonState, AutomatonTransition, FiniteAutomaton } from './automata';

/**
 * Regular Expression parser and Thompson's Construction Algorithm
 * Converts regular expression (concatenation, union '|', Kleene star '*') into an equivalent ε-NFA.
 */
export class RegexEngine {
  /**
   * Builds an ε-NFA from a simple regular expression using Thompson's construction.
   * Supports: literals, concatenation, union '|', Kleene star '*'.
   */
  static regexToNFA(regex: string): FiniteAutomaton {
    let stateCounter = 0;
    const newState = (): string => `s${stateCounter++}`;

    const states: AutomatonState[] = [];
    const transitions: AutomatonTransition[] = [];
    const alphabetSet = new Set<string>();

    interface Fragment {
      start: string;
      accept: string;
    }

    // Insert explicit concatenation operator '.' where needed
    // e.g. "ab" -> "a.b", "a*b" -> "a*.b", "(a|b)c" -> "(a|b).c"
    const formatRegex = (raw: string): string => {
      let res = '';
      for (let i = 0; i < raw.length; i++) {
        const c1 = raw[i]!;
        res += c1;
        if (i + 1 < raw.length) {
          const c2 = raw[i + 1]!;
          if (
            (c1 !== '(' && c1 !== '|' && c2 !== ')' && c2 !== '|' && c2 !== '*') ||
            (c1 === '*' && c2 !== ')' && c2 !== '|')
          ) {
            res += '.';
          }
        }
      }
      return res;
    };

    // Shunting-yard algorithm to convert formatted infix regex to postfix (RPN)
    const toPostfix = (infix: string): string => {
      let postfix = '';
      const opStack: string[] = [];
      const precedence: Record<string, number> = { '*': 3, '.': 2, '|': 1 };

      for (const char of infix) {
        if (char === '(') {
          opStack.push(char);
        } else if (char === ')') {
          while (opStack.length > 0 && opStack[opStack.length - 1] !== '(') {
            postfix += opStack.pop();
          }
          opStack.pop(); // discard '('
        } else if (char === '*' || char === '.' || char === '|') {
          while (
            opStack.length > 0 &&
            opStack[opStack.length - 1] !== '(' &&
            (precedence[opStack[opStack.length - 1]!] ?? 0) >= (precedence[char] ?? 0)
          ) {
            postfix += opStack.pop();
          }
          opStack.push(char);
        } else {
          // Operand
          postfix += char;
        }
      }

      while (opStack.length > 0) {
        postfix += opStack.pop();
      }
      return postfix;
    };

    const formatted = formatRegex(regex);
    const postfix = toPostfix(formatted);

    const stack: Fragment[] = [];

    for (const token of postfix) {
      if (token === '*') {
        // Kleene Star: loop back with ε
        const frag = stack.pop()!;
        const start = newState();
        const accept = newState();

        transitions.push({ from: start, to: frag.start, symbol: 'ε' });
        transitions.push({ from: start, to: accept, symbol: 'ε' });
        transitions.push({ from: frag.accept, to: frag.start, symbol: 'ε' });
        transitions.push({ from: frag.accept, to: accept, symbol: 'ε' });

        stack.push({ start, accept });
      } else if (token === '.') {
        // Concatenation: frag1.accept -> frag2.start with ε
        const frag2 = stack.pop()!;
        const frag1 = stack.pop()!;

        transitions.push({ from: frag1.accept, to: frag2.start, symbol: 'ε' });
        stack.push({ start: frag1.start, accept: frag2.accept });
      } else if (token === '|') {
        // Union: new start branches to both; both branch to new accept
        const frag2 = stack.pop()!;
        const frag1 = stack.pop()!;
        const start = newState();
        const accept = newState();

        transitions.push({ from: start, to: frag1.start, symbol: 'ε' });
        transitions.push({ from: start, to: frag2.start, symbol: 'ε' });
        transitions.push({ from: frag1.accept, to: accept, symbol: 'ε' });
        transitions.push({ from: frag2.accept, to: accept, symbol: 'ε' });

        stack.push({ start, accept });
      } else {
        // Literal Symbol
        alphabetSet.add(token);
        const start = newState();
        const accept = newState();
        transitions.push({ from: start, to: accept, symbol: token });
        stack.push({ start, accept });
      }
    }

    const finalFrag = stack.pop() ?? { start: newState(), accept: newState() };

    // Register all states
    for (let i = 0; i < stateCounter; i++) {
      const id = `s${i}`;
      states.push({
        id,
        label: id,
        isInitial: id === finalFrag.start,
        isAccept: id === finalFrag.accept,
      });
    }

    const sanitizedId = regex.replace(/[^a-zA-Z0-9]/g, '_');
    return {
      id: `regex-nfa-${sanitizedId}`,
      name: `Thompson NFA for /${regex}/`,
      type: 'ENFA',
      states,
      alphabet: Array.from(alphabetSet).sort(),
      initialStateId: finalFrag.start,
      acceptStateIds: [finalFrag.accept],
      transitions,
    };
  }
}
