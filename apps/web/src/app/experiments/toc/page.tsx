'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Code,
  Compass,
  FileCode,
  GitBranch,
  HelpCircle,
  Play,
  RotateCcw,
  SkipForward,
  XCircle,
} from 'lucide-react';
import {
  AutomataEngine,
  BINARY_INCREMENTER_TM,
  CFGEngine,
  DFAMinimization,
  FiniteAutomaton,
  RegexEngine,
  SAMPLE_CNF_AN_BN,
  SubsetConstruction,
  TuringMachineEngine,
} from '@prismora/simulation-core';
import { Badge, BugReportModal, Button, Card, CardContent, CardHeader, CardTitle } from '@prismora/ui';

export default function TOCLabPage() {
  const [activeTab, setActiveTab] = useState<'automata' | 'regex' | 'cfg' | 'turing'>('automata');

  // --- AUTOMATA STATE ---
  const [faType, setFaType] = useState<'DFA' | 'NFA'>('DFA');
  const [testString, setTestString] = useState('1001');

  // Sample DFA: Strings over {0,1} ending in '01'
  const [currentDFA, setCurrentDFA] = useState<FiniteAutomaton>({
    id: 'dfa-ending-01',
    name: 'Ends in 01',
    type: 'DFA',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccept: false, x: 80, y: 100 },
      { id: 'q1', label: 'q1', isInitial: false, isAccept: false, x: 220, y: 100 },
      { id: 'q2', label: 'q2', isInitial: false, isAccept: true, x: 360, y: 100 },
    ],
    alphabet: ['0', '1'],
    initialStateId: 'q0',
    acceptStateIds: ['q2'],
    transitions: [
      { from: 'q0', to: 'q1', symbol: '0' },
      { from: 'q0', to: 'q0', symbol: '1' },
      { from: 'q1', to: 'q1', symbol: '0' },
      { from: 'q1', to: 'q2', symbol: '1' },
      { from: 'q2', to: 'q1', symbol: '0' },
      { from: 'q2', to: 'q0', symbol: '1' },
    ],
  });

  const faEvaluation = AutomataEngine.evaluateString(currentDFA, testString);
  const [stepIndex, setStepIndex] = useState<number>(0);

  const activeStates =
    stepIndex < faEvaluation.history.length
      ? faEvaluation.history[stepIndex]!.states
      : [currentDFA.initialStateId];

  // NFA Subset Conversion
  const handleConvertNfaToDfa = () => {
    const converted = SubsetConstruction.convertNfaToDfa(currentDFA);
    setCurrentDFA(converted);
    setStepIndex(0);
  };

  // DFA Minimization
  const handleMinimizeDfa = () => {
    const min = DFAMinimization.minimize(currentDFA);
    setCurrentDFA(min);
    setStepIndex(0);
  };

  // --- REGEX STATE ---
  const [regexInput, setRegexInput] = useState('(a|b)*abb');
  const [regexTestString, setRegexTestString] = useState('aabb');
  const [thompsonNfa, setThompsonNfa] = useState(() => RegexEngine.regexToNFA('(a|b)*abb'));

  const handleBuildRegexNfa = () => {
    try {
      const nfa = RegexEngine.regexToNFA(regexInput);
      setThompsonNfa(nfa);
    } catch {
      // Ignore invalid regex typing
    }
  };

  const regexEvaluation = AutomataEngine.evaluateString(thompsonNfa, regexTestString);

  // --- CFG CYK STATE ---
  const [cfgString, setCfgString] = useState('aabb');
  const cykResult = CFGEngine.cykParse(SAMPLE_CNF_AN_BN, cfgString);

  // --- TURING MACHINE STATE ---
  const [tm] = useState(() => new TuringMachineEngine(BINARY_INCREMENTER_TM));
  const [tmInput, setTmInput] = useState('1011');
  const [tmState, setTmState] = useState(() => {
    tm.loadInput('1011');
    return tm.getState();
  });

  const handleStepTM = () => {
    setTmState(tm.step());
  };

  const handleResetTM = (input = tmInput) => {
    tm.loadInput(input);
    setTmState(tm.getState());
  };

  // Diagnostic snapshot for bug reports
  const diagnosticSnapshot = {
    activeTab,
    testString,
    activeStates,
    accepted: faEvaluation.accepted,
    regexInput,
    regexTestString,
    regexAccepted: regexEvaluation.accepted,
    cfgString,
    cykAccepted: cykResult.accepted,
    tmTape: tmState.tape,
    tmHead: tmState.headPosition,
    tmState: tmState.currentState,
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d16] text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* Top Breadcrumb & Status Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a] px-4 lg:px-8 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium">
              Prismora
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <Link href="/explore" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white font-medium">
              Theory
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
            <span className="font-semibold text-purple-600 dark:text-purple-400">Theory of Computation</span>
            <Badge variant="mathematics" className="ml-2">
              Phase 3
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <BugReportModal
              simulationId="toc-automata"
              moduleName="Theory of Computation & Formal Languages"
              diagnosticSnapshot={diagnosticSnapshot}
            />
          </div>
        </div>
      </header>

      {/* Module Title & Hero Strip */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0f172a]/50 px-4 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-[#8B5CF6]" />
              Automata, Grammars &amp; Turing Machine Studio
            </h1>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-2xl">
              Mathematically formal state transitions, regex Thompson construction, CYK parsing for context-free languages, and interactive Turing tape manipulation.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-zinc-100 dark:bg-zinc-800/80 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('automata')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'automata'
                  ? 'bg-[#8B5CF6] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              1. DFA / NFA
            </button>
            <button
              onClick={() => setActiveTab('regex')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'regex'
                  ? 'bg-[#06B6D4] text-zinc-950 font-bold shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              2. Regex &amp; Thompson
            </button>
            <button
              onClick={() => setActiveTab('cfg')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'cfg'
                  ? 'bg-[#22C55E] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              3. CFG &amp; CYK
            </button>
            <button
              onClick={() => setActiveTab('turing')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                activeTab === 'turing'
                  ? 'bg-[#F43F5E] text-white shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              4. Turing Machine
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: FINITE AUTOMATA (DFA / NFA) */}
        {/* ============================================================ */}
        {activeTab === 'automata' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>{currentDFA.name} &bull; Interactive State Graph</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleConvertNfaToDfa} className="text-xs">
                        Convert NFA &rarr; DFA
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleMinimizeDfa} className="text-xs">
                        Minimize DFA
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Visual Automaton Graph */}
                  <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-white min-h-[260px] flex items-center justify-center relative select-none">
                    <svg className="w-full h-48" viewBox="0 0 460 160">
                      {/* Transitions Arcs */}
                      <defs>
                        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                        </marker>
                      </defs>

                      {/* State Nodes */}
                      {currentDFA.states.map((st, i) => {
                        const x = 70 + i * 140;
                        const y = 80;
                        const isActive = activeStates.includes(st.id);

                        return (
                          <g key={st.id}>
                            {/* Initial State Arrow */}
                            {st.isInitial && (
                              <line x1={x - 45} y1={y} x2={x - 28} y2={y} stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow)" />
                            )}

                            {/* Outer Accept Ring */}
                            {st.isAccept && (
                              <circle cx={x} cy={y} r="28" fill="none" stroke={isActive ? '#38bdf8' : '#64748b'} strokeWidth="2" />
                            )}

                            {/* Main State Circle */}
                            <circle
                              cx={x}
                              cy={y}
                              r="24"
                              fill={isActive ? '#8B5CF6' : '#1e293b'}
                              stroke={isActive ? '#c084fc' : '#475569'}
                              strokeWidth="2.5"
                              className="transition-colors duration-150"
                            />
                            <text cx={x} cy={y + 4} textAnchor="middle" fill="#ffffff" fontFamily="monospace" fontSize="12" fontWeight="bold">
                              {st.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* String Stepper & Input */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block text-xs font-semibold mb-1">Test Input String:</label>
                      <input
                        type="text"
                        value={testString}
                        onChange={(e) => {
                          setTestString(e.target.value);
                          setStepIndex(0);
                        }}
                        className="w-full px-3 py-1.5 rounded-md font-mono text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                      />
                    </div>
                    <div className="flex items-end gap-2 pt-5">
                      <Button
                        variant="violet"
                        size="sm"
                        disabled={stepIndex >= faEvaluation.history.length - 1}
                        onClick={() => setStepIndex((prev) => Math.min(prev + 1, faEvaluation.history.length - 1))}
                      >
                        <SkipForward className="w-3.5 h-3.5 mr-1" />
                        Step Symbol
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setStepIndex(0)}>
                        <RotateCcw className="w-3.5 h-3.5 mr-1" />
                        Reset
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right: Acceptance Status & Trace Log */}
            <div className="lg:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Acceptance Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className={`p-4 rounded-xl border text-center space-y-1 ${
                      faEvaluation.accepted
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                        : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                    }`}
                  >
                    <div className="text-lg font-black font-mono">
                      {faEvaluation.accepted ? 'STRING ACCEPTED' : 'STRING REJECTED'}
                    </div>
                    <p className="text-[11px]">
                      {faEvaluation.accepted
                        ? `Halts in accept state {${currentDFA.acceptStateIds.join(',')}}`
                        : 'Final state is not in the accept set.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Execution History:</span>
                    <div className="divide-y divide-zinc-200 dark:divide-zinc-800 font-mono text-xs max-h-48 overflow-y-auto">
                      {faEvaluation.history.map((h, idx) => (
                        <div
                          key={idx}
                          className={`py-1.5 px-2 rounded flex justify-between ${
                            idx === stepIndex ? 'bg-purple-100 dark:bg-purple-950 text-purple-900 dark:text-purple-200 font-bold' : ''
                          }`}
                        >
                          <span>Step {idx}: {h.states.join(', ')}</span>
                          <span className="text-zinc-500">Remaining: &quot;{h.remaining}&quot;</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: REGULAR EXPRESSIONS & THOMPSON'S NFA */}
        {/* ============================================================ */}
        {activeTab === 'regex' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Regular Expression &rarr; &epsilon;-NFA Thompson Construction</span>
                  <Badge variant="astronomy">Thompson Algorithm</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Regular Expression:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={regexInput}
                        onChange={(e) => setRegexInput(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-md font-mono text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                      />
                      <Button variant="cyan" size="sm" onClick={handleBuildRegexNfa}>
                        Build NFA
                      </Button>
                    </div>
                    <span className="text-[10px] text-zinc-500 mt-1 block">Supports: a|b (union), ab (concatenation), a* (star).</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold mb-1">Test String Verification:</label>
                    <input
                      type="text"
                      value={regexTestString}
                      onChange={(e) => setRegexTestString(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-md font-mono text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                    />
                    <div className="mt-2 text-xs font-semibold">
                      Result:{' '}
                      <span className={regexEvaluation.accepted ? 'text-emerald-500' : 'text-rose-500'}>
                        {regexEvaluation.accepted ? 'MATCHES REGEX' : 'DOES NOT MATCH'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-mono text-xs space-y-2">
                  <div className="text-cyan-400 font-bold">Constructed &epsilon;-NFA Transitions ({thompsonNfa.transitions.length}):</div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto">
                    {thompsonNfa.transitions.map((t, i) => (
                      <div key={i} className="p-1 rounded bg-zinc-800/60 border border-zinc-700 text-center">
                        {t.from} &ndash;({t.symbol})&rarr; {t.to}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CONTEXT-FREE GRAMMARS & CYK PARSER */}
        {/* ============================================================ */}
        {activeTab === 'cfg' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>CYK Membership Algorithm &bull; Language L = &#123; a^n b^n | n &ge; 1 &#125;</span>
                  <Badge variant="biology">CNF Dynamic Programming</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold mb-1">Test String for CYK Parsing:</label>
                    <input
                      type="text"
                      value={cfgString}
                      onChange={(e) => setCfgString(e.target.value)}
                      className="w-full px-3 py-1.5 rounded font-mono text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>
                  <div className="pt-5">
                    <span
                      className={`px-3 py-1.5 rounded font-mono font-bold text-xs ${
                        cykResult.accepted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {cykResult.accepted ? 'ACCEPTED IN L' : 'REJECTED FROM L'}
                    </span>
                  </div>
                </div>

                {/* Triangular CYK Table */}
                <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800 text-white space-y-3">
                  <span className="text-xs font-mono text-emerald-400 font-bold">CYK Triangular Dynamic Programming Table:</span>
                  <div className="overflow-x-auto">
                    <table className="border-collapse font-mono text-xs">
                      <tbody>
                        {cykResult.table.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td className="p-2 border border-zinc-700 text-zinc-500 font-bold text-[10px]">
                              Len {rIdx + 1}
                            </td>
                            {row.map((cellSet, cIdx) => (
                              <td
                                key={cIdx}
                                className={`p-2.5 border border-zinc-700 text-center min-w-[50px] ${
                                  cellSet.has('S') ? 'bg-emerald-900/60 font-bold text-emerald-300' : 'text-zinc-300'
                                }`}
                              >
                                {cellSet.size > 0 ? `{${Array.from(cellSet).join(',')}}` : '∅'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: TURING MACHINE SIMULATOR */}
        {/* ============================================================ */}
        {activeTab === 'turing' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Deterministic Turing Machine &bull; Binary Incrementer (+1)</span>
                  <Badge variant="engineering">Turing Complete</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Input & Stepper Controls */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <label className="block text-xs font-semibold mb-1">Input Tape String:</label>
                    <input
                      type="text"
                      value={tmInput}
                      onChange={(e) => {
                        setTmInput(e.target.value);
                        handleResetTM(e.target.value);
                      }}
                      className="w-full px-3 py-1.5 rounded font-mono text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
                    />
                  </div>
                  <div className="flex items-end gap-2 pt-5">
                    <Button variant="coral" size="sm" onClick={handleStepTM} disabled={tmState.halted}>
                      <SkipForward className="w-3.5 h-3.5 mr-1" />
                      Step Tape
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleResetTM()}>
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>

                {/* Animated Bidirectional Tape */}
                <div className="p-8 rounded-xl bg-zinc-900 border border-zinc-800 text-white flex flex-col items-center gap-4 overflow-x-auto select-none">
                  <div className="flex items-center gap-1 font-mono">
                    {tmState.tape.map((sym, idx) => {
                      const isHead = idx === tmState.headPosition;
                      return (
                        <div key={idx} className="flex flex-col items-center">
                          {/* Tape Cell */}
                          <div
                            className={`w-12 h-14 rounded-lg flex items-center justify-center font-black text-lg border-2 transition-all ${
                              isHead
                                ? 'bg-[#F43F5E] text-white border-rose-400 shadow-lg scale-105'
                                : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                            }`}
                          >
                            {sym}
                          </div>
                          {/* Head Pointer Indicator */}
                          <div className={`text-xs mt-1 font-bold ${isHead ? 'text-rose-400' : 'text-transparent'}`}>
                            &uarr; HEAD
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="text-xs font-mono text-zinc-400">
                    State: <span className="text-white font-bold">{tmState.currentState}</span> &bull; Steps:{' '}
                    <span className="text-amber-400 font-bold">{tmState.stepCount}</span> &bull; Status:{' '}
                    <span className={tmState.accepted ? 'text-emerald-400 font-bold' : 'text-zinc-300'}>
                      {tmState.statusMessage}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
