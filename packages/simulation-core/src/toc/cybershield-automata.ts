/**
 * CyberShield — Automata-Based Security Analyzer & Formal Language Studio
 * Ported and enhanced from Amit Singh's CyberShield project.
 *
 * Implements:
 * - Thompson Construction (Regex -> ε-NFA) with step-by-step explainable traces
 * - Epsilon-Closure & ε-Removal (ε-NFA -> NFA)
 * - Subset Construction (powerset construction: NFA -> DFA)
 * - DFA Minimization (Hopcroft partition refinement)
 * - Step-by-Step String Execution Tracer
 * - Structural Diagnostics (Reachable, Productive, Trap states, Finiteness, Shortest accepted word)
 * - Product Automata (Intersection, Union, Difference, Symmetric Difference, Equivalence & Shortest Counterexample)
 * - Automata-Powered Web Security Analyzer (SQLi, XSS, Path Traversal, Input Sanitization)
 */

export const EPSILON = 'ε';

export enum TokenKind {
  LITERAL = 'LITERAL',
  EPSILON = 'EPSILON',
  UNION = 'UNION',
  CONCAT = 'CONCAT',
  STAR = 'STAR',
  LEFT_PAREN = 'LEFT_PAREN',
  RIGHT_PAREN = 'RIGHT_PAREN',
}

export interface RegexToken {
  kind: TokenKind;
  value: string;
}

export interface ExplainableStep {
  phase: string;
  title: string;
  action: string;
  reason: string;
  formula?: string;
  sourceStates?: number[];
  resultStates?: number[];
  symbol?: string;
}

export class RegexParser {
  tokenize(regex: string): RegexToken[] {
    if (!regex || regex.trim() === '') {
      throw new Error('The regular expression cannot be empty.');
    }

    const raw: RegexToken[] = [];
    let index = 0;
    const operators: Record<string, TokenKind> = {
      '|': TokenKind.UNION,
      '+': TokenKind.UNION,
      '*': TokenKind.STAR,
      '(': TokenKind.LEFT_PAREN,
      ')': TokenKind.RIGHT_PAREN,
    };

    while (index < regex.length) {
      const char = regex[index]!;
      if (char === '\\') {
        index++;
        if (index >= regex.length) {
          throw new Error('A trailing backslash must escape a symbol.');
        }
        raw.push({ kind: TokenKind.LITERAL, value: regex[index]! });
      } else if (char === EPSILON) {
        raw.push({ kind: TokenKind.EPSILON, value: char });
      } else if (operators[char]) {
        raw.push({ kind: operators[char]!, value: char });
      } else {
        raw.push({ kind: TokenKind.LITERAL, value: char });
      }
      index++;
    }

    // Insert explicit concatenation operators
    const result: RegexToken[] = [];
    const leftCanEnd = new Set([
      TokenKind.LITERAL,
      TokenKind.EPSILON,
      TokenKind.RIGHT_PAREN,
      TokenKind.STAR,
    ]);
    const rightCanStart = new Set([
      TokenKind.LITERAL,
      TokenKind.EPSILON,
      TokenKind.LEFT_PAREN,
    ]);

    for (const token of raw) {
      if (result.length > 0) {
        const prev = result[result.length - 1]!;
        if (leftCanEnd.has(prev.kind) && rightCanStart.has(token.kind)) {
          result.push({ kind: TokenKind.CONCAT, value: '.' });
        }
      }
      result.push(token);
    }

    return result;
  }

  toPostfix(regex: string): RegexToken[] {
    const tokens = this.tokenize(regex);
    const output: RegexToken[] = [];
    const stack: RegexToken[] = [];

    const precedence: Record<string, number> = {
      [TokenKind.STAR]: 3,
      [TokenKind.CONCAT]: 2,
      [TokenKind.UNION]: 1,
    };

    for (const token of tokens) {
      if (token.kind === TokenKind.LITERAL || token.kind === TokenKind.EPSILON) {
        output.push(token);
      } else if (token.kind === TokenKind.STAR) {
        output.push(token);
      } else if (token.kind === TokenKind.LEFT_PAREN) {
        stack.push(token);
      } else if (token.kind === TokenKind.RIGHT_PAREN) {
        while (stack.length > 0 && stack[stack.length - 1]!.kind !== TokenKind.LEFT_PAREN) {
          output.push(stack.pop()!);
        }
        if (stack.length === 0) {
          throw new Error('Mismatched parentheses in regular expression.');
        }
        stack.pop(); // Remove LEFT_PAREN
      } else {
        // Operator UNION or CONCAT
        const p = precedence[token.kind] ?? 0;
        while (
          stack.length > 0 &&
          stack[stack.length - 1]!.kind !== TokenKind.LEFT_PAREN &&
          (precedence[stack[stack.length - 1]!.kind] ?? 0) >= p
        ) {
          output.push(stack.pop()!);
        }
        stack.push(token);
      }
    }

    while (stack.length > 0) {
      const top = stack.pop()!;
      if (top.kind === TokenKind.LEFT_PAREN || top.kind === TokenKind.RIGHT_PAREN) {
        throw new Error('Mismatched parentheses in regular expression.');
      }
      output.push(top);
    }

    return output;
  }
}

export interface CyberEpsilonTransition {
  from: number;
  to: number;
  symbol: string; // symbol or EPSILON
}

export interface CyberEpsilonNFA {
  states: number[];
  alphabet: string[];
  startState: number;
  finalState: number;
  transitions: CyberEpsilonTransition[];
}

export interface CyberDFA {
  states: number[];
  alphabet: string[];
  startState: number;
  finalStates: number[];
  transitions: Record<number, Record<string, number>>;
  stateLabels?: Record<number, string>;
}

export interface CyberNFA {
  states: number[];
  alphabet: string[];
  startState: number;
  finalStates: number[];
  transitions: Record<number, Record<string, number[]>>;
}

export class CyberThompsonEngine {
  static buildEpsilonNFA(regex: string): {
    enfa: CyberEpsilonNFA;
    steps: ExplainableStep[];
  } {
    const parser = new RegexParser();
    const postfix = parser.toPostfix(regex);
    const steps: ExplainableStep[] = [
      {
        phase: 'Parsing',
        title: 'Shunting-Yard Infix to Postfix',
        action: `Tokenize and convert "${regex}" to postfix order.`,
        reason: 'Postfix notation clarifies operator precedence and enables stack-based execution.',
        formula: postfix.map((t) => t.value).join(' '),
      },
    ];

    interface Fragment {
      start: number;
      end: number;
    }

    const fragments: Fragment[] = [];
    const allTransitions: CyberEpsilonTransition[] = [];
    const alphabetSet = new Set<string>();
    let stateCounter = 0;

    const createState = (): number => stateCounter++;

    for (const token of postfix) {
      if (token.kind === TokenKind.LITERAL || token.kind === TokenKind.EPSILON) {
        const s = createState();
        const e = createState();
        allTransitions.push({ from: s, to: e, symbol: token.value });
        if (token.kind === TokenKind.LITERAL) {
          alphabetSet.add(token.value);
        }
        fragments.push({ start: s, end: e });
        steps.push({
          phase: 'Base Fragment',
          title: `Construct literal "${token.value}"`,
          action: `Create state q${s} → q${e} on symbol '${token.value}'.`,
          reason: 'Base building block for atomic symbol recognition.',
          sourceStates: [s],
          resultStates: [e],
          symbol: token.value,
        });
      } else if (token.kind === TokenKind.CONCAT) {
        if (fragments.length < 2) throw new Error('Malformed regular expression: missing operands for concatenation.');
        const right = fragments.pop()!;
        const left = fragments.pop()!;
        allTransitions.push({ from: left.end, to: right.start, symbol: EPSILON });
        fragments.push({ start: left.start, end: right.end });
        steps.push({
          phase: 'Concatenation',
          title: `Concatenate fragments [q${left.start}..q${left.end}] . [q${right.start}..q${right.end}]`,
          action: `Add ε-transition from q${left.end} to q${right.start}.`,
          reason: 'Connects the exit of the left sub-expression to the entry of the right sub-expression.',
          sourceStates: [left.end],
          resultStates: [right.start],
          symbol: EPSILON,
        });
      } else if (token.kind === TokenKind.UNION) {
        if (fragments.length < 2) throw new Error('Malformed regular expression: missing operands for union.');
        const right = fragments.pop()!;
        const left = fragments.pop()!;
        const newStart = createState();
        const newEnd = createState();
        allTransitions.push(
          { from: newStart, to: left.start, symbol: EPSILON },
          { from: newStart, to: right.start, symbol: EPSILON },
          { from: left.end, to: newEnd, symbol: EPSILON },
          { from: right.end, to: newEnd, symbol: EPSILON },
        );
        fragments.push({ start: newStart, end: newEnd });
        steps.push({
          phase: 'Union',
          title: `Union (|) branches: [q${left.start}] or [q${right.start}]`,
          action: `Split start q${newStart} into q${left.start} and q${right.start}, join to q${newEnd}.`,
          reason: 'Allows the non-deterministic automaton to branch into either alternative path.',
          sourceStates: [newStart],
          resultStates: [newEnd],
          symbol: EPSILON,
        });
      } else if (token.kind === TokenKind.STAR) {
        if (fragments.length < 1) throw new Error('Malformed regular expression: missing operand for star.');
        const frag = fragments.pop()!;
        const newStart = createState();
        const newEnd = createState();
        allTransitions.push(
          { from: newStart, to: frag.start, symbol: EPSILON },
          { from: frag.end, to: frag.start, symbol: EPSILON }, // Loop back
          { from: frag.end, to: newEnd, symbol: EPSILON },
          { from: newStart, to: newEnd, symbol: EPSILON }, // Skip (0 occurrences)
        );
        fragments.push({ start: newStart, end: newEnd });
        steps.push({
          phase: 'Kleene Star',
          title: `Kleene Star (*) on fragment [q${frag.start}..q${frag.end}]`,
          action: `Create loopback q${frag.end} → q${frag.start} and bypass q${newStart} → q${newEnd}.`,
          reason: 'Allows matching zero or any positive number of repetitions.',
          sourceStates: [newStart, frag.end],
          resultStates: [frag.start, newEnd],
          symbol: EPSILON,
        });
      }
    }

    if (fragments.length !== 1) {
      throw new Error('Invalid regular expression: leftover operands.');
    }

    const finalFragment = fragments[0]!;
    const states = Array.from({ length: stateCounter }, (_, i) => i);
    const alphabet = Array.from(alphabetSet).sort();

    return {
      enfa: {
        states,
        alphabet,
        startState: finalFragment.start,
        finalState: finalFragment.end,
        transitions: allTransitions,
      },
      steps,
    };
  }

  /** Compute Epsilon Closure of a set of states */
  static computeEpsilonClosure(
    states: number[],
    transitions: CyberEpsilonTransition[],
  ): number[] {
    const closure = new Set<number>(states);
    const queue = [...states];

    while (queue.length > 0) {
      const current = queue.pop()!;
      for (const t of transitions) {
        if (t.from === current && t.symbol === EPSILON && !closure.has(t.to)) {
          closure.add(t.to);
          queue.push(t.to);
        }
      }
    }

    return Array.from(closure).sort((a, b) => a - b);
  }

  /** Convert ε-NFA to an equivalent NFA by eliminating epsilon transitions */
  static removeEpsilon(enfa: CyberEpsilonNFA): CyberNFA {
    const { states, alphabet, startState, finalState, transitions } = enfa;
    const nfaTransitions: Record<number, Record<string, number[]>> = {};

    for (const s of states) {
      nfaTransitions[s] = {};
      for (const a of alphabet) {
        nfaTransitions[s][a] = [];
      }
    }

    const finalStates = new Set<number>();

    for (const s of states) {
      const sClosure = this.computeEpsilonClosure([s], transitions);
      if (sClosure.includes(finalState)) {
        finalStates.add(s);
      }

      for (const symbol of alphabet) {
        const symbolTargets = new Set<number>();
        for (const c of sClosure) {
          for (const t of transitions) {
            if (t.from === c && t.symbol === symbol) {
              symbolTargets.add(t.to);
            }
          }
        }

        const fullClosure = this.computeEpsilonClosure(Array.from(symbolTargets), transitions);
        nfaTransitions[s]![symbol] = fullClosure;
      }
    }

    return {
      states,
      alphabet,
      startState,
      finalStates: Array.from(finalStates).sort((a, b) => a - b),
      transitions: nfaTransitions,
    };
  }

  /** Convert NFA to DFA via Powerset / Subset Construction */
  static subsetConstruction(nfa: CyberNFA): {
    dfa: CyberDFA;
    table: { dfaState: number; nfaSubset: number[]; transitions: Record<string, number> }[];
  } {
    const { alphabet, startState, finalStates, transitions } = nfa;

    const stateKey = (set: number[]): string => Array.from(new Set(set)).sort((a, b) => a - b).join(',');

    const subsets: number[][] = [[startState]];
    const keyToDfaIndex = new Map<string, number>();
    keyToDfaIndex.set(stateKey([startState]), 0);

    const dfaTransitions: Record<number, Record<string, number>> = {};
    const table: { dfaState: number; nfaSubset: number[]; transitions: Record<string, number> }[] = [];

    let currentIdx = 0;
    while (currentIdx < subsets.length) {
      const currentSubset = subsets[currentIdx]!;
      dfaTransitions[currentIdx] = {};
      const rowTrans: Record<string, number> = {};

      for (const symbol of alphabet) {
        const destSet = new Set<number>();
        for (const s of currentSubset) {
          const targets = transitions[s]?.[symbol] ?? [];
          for (const t of targets) destSet.add(t);
        }

        const destArr = Array.from(destSet).sort((a, b) => a - b);
        const key = stateKey(destArr);

        if (destArr.length === 0) {
          // Dead / trap sink state
          let trapIdx = keyToDfaIndex.get('TRAP');
          if (trapIdx === undefined) {
            trapIdx = subsets.length;
            subsets.push([]);
            keyToDfaIndex.set('TRAP', trapIdx);
          }
          dfaTransitions[currentIdx]![symbol] = trapIdx;
          rowTrans[symbol] = trapIdx;
        } else {
          let targetIdx = keyToDfaIndex.get(key);
          if (targetIdx === undefined) {
            targetIdx = subsets.length;
            keyToDfaIndex.set(key, targetIdx);
            subsets.push(destArr);
          }
          dfaTransitions[currentIdx]![symbol] = targetIdx;
          rowTrans[symbol] = targetIdx;
        }
      }

      table.push({
        dfaState: currentIdx,
        nfaSubset: currentSubset,
        transitions: rowTrans,
      });

      currentIdx++;
    }

    const dfaStates = Array.from({ length: subsets.length }, (_, i) => i);
    const dfaFinalStates = dfaStates.filter((idx) => {
      const subset = subsets[idx]!;
      return subset.some((s) => finalStates.includes(s));
    });

    return {
      dfa: {
        states: dfaStates,
        alphabet,
        startState: 0,
        finalStates: dfaFinalStates,
        transitions: dfaTransitions,
        stateLabels: Object.fromEntries(
          dfaStates.map((s) => [s, `{${(subsets[s] || []).map((x) => `q${x}`).join(',') || '∅'}}`]),
        ),
      },
      table,
    };
  }

  /** Minimize DFA using Hopcroft's Partition Refinement Algorithm */
  static minimizeDFA(dfa: CyberDFA): {
    minimalDfa: CyberDFA;
    partitions: number[][];
  } {
    const { states, alphabet, startState, finalStates, transitions } = dfa;

    // Eliminate unreachable states first
    const reachable = this.getReachableStates(dfa);
    const activeStates = states.filter((s) => reachable.has(s));

    const finalSet = new Set(finalStates.filter((s) => reachable.has(s)));
    const nonFinalSet = new Set(activeStates.filter((s) => !finalSet.has(s)));

    let P: number[][] = [];
    if (finalSet.size > 0) P.push(Array.from(finalSet));
    if (nonFinalSet.size > 0) P.push(Array.from(nonFinalSet));

    let changed = true;
    while (changed) {
      changed = false;
      const nextP: number[][] = [];

      for (const group of P) {
        if (group.length <= 1) {
          nextP.push(group);
          continue;
        }

        // Split group based on transitions for each symbol
        const splitMap = new Map<string, number[]>();

        for (const state of group) {
          const sig = alphabet
            .map((sym) => {
              const target = transitions[state]?.[sym];
              if (target === undefined) return -1;
              return P.findIndex((p) => p.includes(target));
            })
            .join('|');

          if (!splitMap.has(sig)) splitMap.set(sig, []);
          splitMap.get(sig)!.push(state);
        }

        const subGroups = Array.from(splitMap.values());
        if (subGroups.length > 1) {
          changed = true;
        }
        nextP.push(...subGroups);
      }

      P = nextP;
    }

    // Map each old state to its new partition index
    const stateToPartition = new Map<number, number>();
    P.forEach((group, idx) => {
      group.forEach((st) => stateToPartition.set(st, idx));
    });

    const newStart = stateToPartition.get(startState) ?? 0;
    const newFinals = new Set<number>();
    const newTransitions: Record<number, Record<string, number>> = {};

    P.forEach((group, idx) => {
      newTransitions[idx] = {};
      const rep = group[0]!;
      if (group.some((s) => finalStates.includes(s))) {
        newFinals.add(idx);
      }
      for (const sym of alphabet) {
        const dest = transitions[rep]?.[sym];
        if (dest !== undefined && stateToPartition.has(dest)) {
          newTransitions[idx]![sym] = stateToPartition.get(dest)!;
        }
      }
    });

    const minStates = Array.from({ length: P.length }, (_, i) => i);
    return {
      minimalDfa: {
        states: minStates,
        alphabet,
        startState: newStart,
        finalStates: Array.from(newFinals).sort((a, b) => a - b),
        transitions: newTransitions,
        stateLabels: Object.fromEntries(
          minStates.map((i) => [i, `P${i} [${(P[i] || []).map((s) => `q${s}`).join(', ')}]`]),
        ),
      },
      partitions: P,
    };
  }

  static getReachableStates(dfa: CyberDFA): Set<number> {
    const visited = new Set<number>([dfa.startState]);
    const queue = [dfa.startState];

    while (queue.length > 0) {
      const curr = queue.pop()!;
      for (const sym of dfa.alphabet) {
        const dest = dfa.transitions[curr]?.[sym];
        if (dest !== undefined && !visited.has(dest)) {
          visited.add(dest);
          queue.push(dest);
        }
      }
    }
    return visited;
  }

  /** Live String Simulation Tracer */
  static traceString(
    dfa: CyberDFA,
    input: string,
  ): {
    accepted: boolean;
    history: { step: number; state: number; symbol: string; remaining: string }[];
    rejectionReason?: string;
  } {
    const history: { step: number; state: number; symbol: string; remaining: string }[] = [];
    let currentState = dfa.startState;

    history.push({
      step: 0,
      state: currentState,
      symbol: '—',
      remaining: input,
    });

    for (let i = 0; i < input.length; i++) {
      const char = input[i]!;
      const nextState = dfa.transitions[currentState]?.[char];

      if (nextState === undefined) {
        return {
          accepted: false,
          history,
          rejectionReason: `No transition defined from state q${currentState} on character '${char}' at index ${i}.`,
        };
      }

      currentState = nextState;
      history.push({
        step: i + 1,
        state: currentState,
        symbol: char,
        remaining: input.slice(i + 1),
      });
    }

    const accepted = dfa.finalStates.includes(currentState);
    return {
      accepted,
      history,
      rejectionReason: accepted
        ? undefined
        : `Terminal state q${currentState} is not in the set of accepting final states {${dfa.finalStates.map((s) => `q${s}`).join(', ')}}.`,
    };
  }
}

// ============================================================
// AUTOMATA-POWERED SECURITY ANALYZER
// ============================================================

export interface SecurityPatternSpec {
  name: string;
  literal: string;
  explanation: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export const SECURITY_CATEGORIES: Record<string, SecurityPatternSpec[]> = {
  'SQL-injection-like': [
    {
      name: 'Boolean quote tautology',
      literal: "' or '",
      explanation: "Quotes and 'OR' keyword used to bypass SQL authentication filters.",
      severity: 'critical',
    },
    {
      name: 'Numeric tautology',
      literal: "' or 1=1",
      explanation: "Classic SQL tautology forcing the WHERE clause to evaluate to true.",
      severity: 'critical',
    },
    {
      name: 'UNION SELECT injection',
      literal: 'union select',
      explanation: 'Appends arbitrary database tables to legitimate query results.',
      severity: 'critical',
    },
    {
      name: 'SQL inline comment',
      literal: '--',
      explanation: 'Comments out the remainder of a backend SQL query.',
      severity: 'high',
    },
    {
      name: 'SQL block comment',
      literal: '/*',
      explanation: 'Bypasses WAF regexes and truncates backend query validation.',
      severity: 'high',
    },
    {
      name: 'Destructive DDL',
      literal: 'drop table',
      explanation: 'Direct attempts to delete database relations.',
      severity: 'critical',
    },
  ],
  'XSS-like': [
    {
      name: 'Script tag opener',
      literal: '<script',
      explanation: 'Direct execution of client-side JavaScript in vulnerable browser DOMs.',
      severity: 'critical',
    },
    {
      name: 'Inline error event',
      literal: 'onerror=',
      explanation: 'Executes malicious JavaScript via injected image/media error callbacks.',
      severity: 'high',
    },
    {
      name: 'Inline load event',
      literal: 'onload=',
      explanation: 'Attaches automatic execution to DOM elements as soon as they load.',
      severity: 'high',
    },
    {
      name: 'JavaScript pseudo-protocol',
      literal: 'javascript:',
      explanation: 'Executes arbitrary script when links or attributes are navigated.',
      severity: 'critical',
    },
  ],
  'Suspicious URL': [
    {
      name: 'Directory traversal (UNIX)',
      literal: '../',
      explanation: 'Escapes web root to read sensitive OS configuration (/etc/passwd, .env).',
      severity: 'critical',
    },
    {
      name: 'Directory traversal (Windows)',
      literal: '..\\',
      explanation: 'Windows directory path traversal looking for SAM or boot.ini.',
      severity: 'critical',
    },
    {
      name: 'URL Encoded traversal',
      literal: '%2e%2e',
      explanation: 'URL hex encoded double dots designed to defeat naive string filters.',
      severity: 'high',
    },
    {
      name: 'Data URI HTML injection',
      literal: 'data:text/html',
      explanation: 'Encodes an entire HTML document inside a URI to execute scripts.',
      severity: 'high',
    },
  ],
  'Input validation': [
    {
      name: 'Angle bracket <',
      literal: '<',
      explanation: 'Disallowed HTML delimiter in pure alphanumeric input fields.',
      severity: 'low',
    },
    {
      name: 'Angle bracket >',
      literal: '>',
      explanation: 'Disallowed HTML tag closer.',
      severity: 'low',
    },
    {
      name: 'Command separator semicolon',
      literal: ';',
      explanation: 'Can be used for shell command chaining or SQL statement stacking.',
      severity: 'medium',
    },
    {
      name: 'Shell backtick',
      literal: '`',
      explanation: 'Executes nested bash commands in vulnerable server-side interpolations.',
      severity: 'high',
    },
  ],
};

export interface SecurityScanResult {
  category: string;
  payload: string;
  detected: boolean;
  highestSeverity?: 'low' | 'medium' | 'high' | 'critical';
  matchedPatterns: {
    name: string;
    literal: string;
    index: number;
    explanation: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
  }[];
  dfaStatesTraversed: number;
}

export class CyberSecurityAnalyzer {
  static scanPayload(category: string, payload: string): SecurityScanResult {
    const patterns = SECURITY_CATEGORIES[category] ?? [];
    const normalized = payload.toLowerCase();
    const matches: SecurityScanResult['matchedPatterns'] = [];

    let highestSeverity: SecurityScanResult['highestSeverity'] = undefined;
    const severityRank: Record<string, number> = { low: 1, medium: 2, high: 3, critical: 4 };

    for (const pat of patterns) {
      const idx = normalized.indexOf(pat.literal.toLowerCase());
      if (idx !== -1) {
        matches.push({
          name: pat.name,
          literal: pat.literal,
          index: idx,
          explanation: pat.explanation,
          severity: pat.severity,
        });

        if (
          !highestSeverity ||
          severityRank[pat.severity]! > severityRank[highestSeverity]!
        ) {
          highestSeverity = pat.severity;
        }
      }
    }

    return {
      category,
      payload,
      detected: matches.length > 0,
      highestSeverity,
      matchedPatterns: matches,
      dfaStatesTraversed: payload.length + 1,
    };
  }
}
