/**
 * Prismora ECE Virtual Lab — Theory, Procedure, Observations & Assessment Drawer
 * Comprehensive educational companion providing Boolean algebraic derivations, lab steps,
 * live experiment logging, troubleshooting guides, and knowledge check quizzes.
 */

'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  HelpCircle,
  Lightbulb,
  ListOrdered,
  XCircle,
} from 'lucide-react';

interface TheoryDrawerProps {
  mode: 'half-adder' | 'full-adder';
}

export const TheoryDrawer: React.FC<TheoryDrawerProps> = ({ mode }) => {
  const [activeTab, setActiveTab] = useState<
    'theory' | 'procedure' | 'observations' | 'troubleshooting' | 'quiz'
  >('theory');

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [showQuizResults, setShowQuizResults] = useState(false);

  const isFullAdder = mode === 'full-adder';

  const QUIZ_QUESTIONS = isFullAdder
    ? [
        {
          question: 'How many Half Adders and basic gates are required to construct a Full Adder?',
          options: [
            '1 Half Adder and 1 OR gate',
            '2 Half Adders and 1 OR gate',
            '2 Half Adders and 1 AND gate',
            '3 Half Adders and 1 XOR gate',
          ],
          correct: 1,
          explanation:
            'A Full Adder is constructed by cascading 2 Half Adders: HA1 computes S1 = A ⊕ B and C1 = A·B, HA2 computes Sum = S1 ⊕ Cin and C2 = S1·Cin. An OR gate combines C1 + C2 to generate Cout.',
        },
        {
          question: 'What is the output of a Full Adder when A = 1, B = 1, and Cin = 1?',
          options: [
            'Sum = 0, Cout = 0',
            'Sum = 1, Cout = 0',
            'Sum = 0, Cout = 1',
            'Sum = 1, Cout = 1',
          ],
          correct: 3,
          explanation:
            '1 + 1 + 1 in binary equals 3, which is 11₂. Hence Sum = 1 and Cout = 1.',
        },
        {
          question: 'What is the minimal number of 2-input NAND gates needed to implement a Full Adder?',
          options: ['5 NAND gates', '7 NAND gates', '9 NAND gates', '12 NAND gates'],
          correct: 2,
          explanation:
            'A Full Adder can be constructed universally using 9 NAND gates (4 NAND gates per XOR function plus carry recombination).',
        },
      ]
    : [
        {
          question: 'What are the Boolean equations for the outputs of a Half Adder?',
          options: [
            'Sum = A + B, Carry = A · B',
            'Sum = A ⊕ B, Carry = A · B',
            'Sum = A ⊕ B, Carry = A + B',
            'Sum = A · B, Carry = A ⊕ B',
          ],
          correct: 1,
          explanation:
            'Sum represents modulo-2 addition without carry (A ⊕ B), while Carry represents both inputs being 1 simultaneously (A · B).',
        },
        {
          question: 'What is the minimum number of NAND gates required to build a Half Adder?',
          options: ['3 NAND gates', '4 NAND gates', '5 NAND gates', '6 NAND gates'],
          correct: 2,
          explanation:
            '5 NAND gates are required: 4 NAND gates realize the XOR function for Sum, and 1 additional NAND gate inverts the intermediate NAND product to produce Carry = A·B.',
        },
        {
          question: 'Why cannot a Half Adder be used directly for multi-bit ripple-carry addition?',
          options: [
            'It is too slow',
            'It cannot accept a Carry-in from a preceding lower-order bit',
            'It produces inverted outputs',
            'It requires dual power supplies',
          ],
          correct: 1,
          explanation:
            'A Half Adder has only two inputs (A and B). Multi-bit addition requires accepting a Carry-in (Cin) from the preceding column, necessitating a Full Adder.',
        },
      ];

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    setQuizAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  return (
    <div className="flex flex-col h-full bg-[#111827] border-l border-zinc-800 text-zinc-300 select-none w-96 shrink-0">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-zinc-800 bg-[#0F172A] p-1 gap-1">
        {(
          [
            { id: 'theory', label: 'Theory', icon: BookOpen },
            { id: 'procedure', label: 'Procedure', icon: ListOrdered },
            { id: 'troubleshooting', label: 'Pitfalls', icon: AlertTriangle },
            { id: 'quiz', label: 'Quiz', icon: HelpCircle },
          ] as const
        ).map((t) => {
          const Icon = t.icon;
          const isSelected = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-1.5 px-2 rounded-md text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                isSelected
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Body */}
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar text-xs leading-relaxed space-y-4">
        {/* TAB 1: THEORY */}
        {activeTab === 'theory' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white mb-1">
                {isFullAdder ? 'Full Adder Circuit Architecture' : 'Half Adder Circuit Architecture'}
              </h3>
              <p className="text-zinc-400">
                {isFullAdder
                  ? 'A Full Adder adds three one-bit binary numbers: two operands A and B, plus a Carry-in (Cin) generated by the preceding stage. It forms the fundamental core of arithmetic logic units (ALUs).'
                  : 'A Half Adder is a combinational arithmetic circuit that performs the addition of two individual binary digits (bits) A and B, producing a Sum bit (S) and a Carry bit (C).'}
              </p>
            </div>

            {/* Boolean Equations Card */}
            <div className="p-3 rounded-lg bg-[#182030] border border-cyan-800/60 shadow-sm space-y-2">
              <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                Analytical Boolean Formulations
              </span>
              <div className="font-mono text-sm space-y-1.5 text-white">
                {isFullAdder ? (
                  <>
                    <div className="p-1.5 bg-black/40 rounded border border-white/5">
                      <strong className="text-emerald-400">Sum (S)</strong> = A ⊕ B ⊕ Cin
                    </div>
                    <div className="p-1.5 bg-black/40 rounded border border-white/5">
                      <strong className="text-cyan-400">Cout</strong> = (A · B) + (Cin · (A ⊕ B))
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-1.5 bg-black/40 rounded border border-white/5">
                      <strong className="text-emerald-400">Sum (S)</strong> = A ⊕ B = A̅B + AB̅
                    </div>
                    <div className="p-1.5 bg-black/40 rounded border border-white/5">
                      <strong className="text-cyan-400">Carry (C)</strong> = A · B
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Circuit Composition */}
            <div className="space-y-1.5">
              <h4 className="font-bold text-white">Gate Composition & Topology:</h4>
              <ul className="list-disc pl-4 space-y-1 text-zinc-400">
                {isFullAdder ? (
                  <>
                    <li>
                      <strong className="text-zinc-200">Half Adder 1:</strong> Computes intermediate
                      sum <code className="text-cyan-300">S1 = A ⊕ B</code> and intermediate carry{' '}
                      <code className="text-cyan-300">C1 = A · B</code>.
                    </li>
                    <li>
                      <strong className="text-zinc-200">Half Adder 2:</strong> Computes final sum{' '}
                      <code className="text-emerald-300">Sum = S1 ⊕ Cin</code> and second carry{' '}
                      <code className="text-cyan-300">C2 = S1 · Cin</code>.
                    </li>
                    <li>
                      <strong className="text-zinc-200">Recombination OR Gate:</strong> Computes{' '}
                      <code className="text-violet-300">Cout = C1 + C2</code>. Since C1 and C2 are mutually
                      exclusive (cannot both be 1 simultaneously), an OR gate performs exact carry addition.
                    </li>
                  </>
                ) : (
                  <>
                    <li>
                      <strong className="text-zinc-200">XOR Gate:</strong> Implements modulo-2
                      addition without carry. Gives 1 when inputs are unequal (odd parity).
                    </li>
                    <li>
                      <strong className="text-zinc-200">AND Gate:</strong> Generates carry output.
                      High only when both A and B are 1 simultaneously.
                    </li>
                    <li>
                      <strong className="text-zinc-200">Universal NAND Realization:</strong> Both Sum
                      and Carry can be synthesized using 5 NAND gates, avoiding the need for dedicated XOR ICs.
                    </li>
                  </>
                )}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: PROCEDURE */}
        {activeTab === 'procedure' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white mb-2">
              Virtual Laboratory Experimental Procedure
            </h3>
            <div className="space-y-2.5">
              {[
                {
                  step: 1,
                  title: 'Inspect or Load Reference Template',
                  desc: 'Use the top toolbar preset to load the standard XOR+AND reference circuit or clear the canvas to build from raw components.',
                },
                {
                  step: 2,
                  title: 'Wire the Gate Inputs and Outputs',
                  desc: 'Click on output terminals of the input switches and connect them to the respective gate inputs. Then connect the final gate outputs to the Sum and Carry LEDs.',
                },
                {
                  step: 3,
                  title: 'Exercise All Input Combinations',
                  desc: 'Toggle the input switches on the canvas or click directly on rows in the Truth Table panel to apply each binary combination.',
                },
                {
                  step: 4,
                  title: 'Verify Against Golden Mathematical Model',
                  desc: 'Click the "Verify Truth Table" button. The simulation engine will automatically test all 2^N combinations and highlight any wiring errors.',
                },
                {
                  step: 5,
                  title: 'Inspect Logic Analyzer Waveforms',
                  desc: 'Examine the multi-channel timing diagram below the canvas to observe synchronized rising and falling transition edges.',
                },
              ].map((s) => (
                <div key={s.step} className="p-2.5 rounded-lg bg-[#182030] border border-zinc-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-5 h-5 rounded-full bg-cyan-600 text-white font-bold flex items-center justify-center text-[10px]">
                      {s.step}
                    </span>
                    <span className="font-bold text-white">{s.title}</span>
                  </div>
                  <p className="text-zinc-400 pl-7">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PITFALLS & TROUBLESHOOTING */}
        {activeTab === 'troubleshooting' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white mb-2">Common Pitfalls & Debugging</h3>
            <div className="space-y-2.5">
              <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-600/60">
                <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Floating Inputs (Unconnected Pins)</span>
                </div>
                <p className="text-amber-200/80">
                  In CMOS/TTL logic, floating pins pick up electrostatic interference. The simulation
                  engine flags unconnected gate inputs as <strong className="text-amber-300">FLOATING</strong> (dashed amber wire). Always connect all inputs to a switch, VCC, or GND.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-600/60">
                <div className="flex items-center gap-1.5 font-bold text-red-300 mb-1">
                  <XCircle className="w-4 h-4" />
                  <span>Bus Contention / Driver Conflict</span>
                </div>
                <p className="text-red-200/80">
                  Never wire two gate outputs directly together without a multiplexer or tristate buffer.
                  If one gate drives HIGH and another drives LOW, a dead short occurs. The engine flags
                  this as <strong className="text-red-300">INVALID</strong>.
                </p>
              </div>

              <div className="p-2.5 rounded-lg bg-[#182030] border border-zinc-800">
                <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1">
                  <Lightbulb className="w-4 h-4" />
                  <span>Sum vs. Carry Terminal Inversion</span>
                </div>
                <p className="text-zinc-400">
                  Ensure the XOR output connects to the Sum LED and the AND/OR output connects to Carry.
                  A frequent student mistake is reversing the two outputs, causing the Truth Table verifier
                  to fail for A=1, B=0 and A=1, B=1.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: QUIZ */}
        {activeTab === 'quiz' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">Knowledge Check & Review</h3>
              {showQuizResults && (
                <button
                  onClick={() => {
                    setQuizAnswers({});
                    setShowQuizResults(false);
                  }}
                  className="text-[11px] text-cyan-400 hover:underline"
                >
                  Reset Quiz
                </button>
              )}
            </div>

            <div className="space-y-4">
              {QUIZ_QUESTIONS.map((q, qIdx) => {
                const userChoice = quizAnswers[qIdx];
                const isAnswered = userChoice !== undefined;
                const isCorrect = userChoice === q.correct;

                return (
                  <div
                    key={qIdx}
                    className="p-3 rounded-lg bg-[#182030] border border-zinc-800 space-y-2"
                  >
                    <span className="font-bold text-white block">
                      {qIdx + 1}. {q.question}
                    </span>
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => {
                        const isSelected = userChoice === optIdx;
                        let btnStyle = 'bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700';

                        if (showQuizResults) {
                          if (optIdx === q.correct) {
                            btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-200 font-bold';
                          } else if (isSelected && !isCorrect) {
                            btnStyle = 'bg-red-950 border-red-500 text-red-200';
                          }
                        } else if (isSelected) {
                          btnStyle = 'bg-cyan-600 border-cyan-400 text-white font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(qIdx, optIdx)}
                            className={`w-full text-left p-2 rounded border text-[11px] transition-colors flex items-center justify-between ${btnStyle}`}
                          >
                            <span>{opt}</span>
                            {showQuizResults && optIdx === q.correct && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {showQuizResults && (
                      <div className="mt-2 p-2 rounded bg-black/40 text-[11px] text-zinc-300 border border-white/5">
                        <strong className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                          {isCorrect ? 'Correct!' : 'Incorrect.'}{' '}
                        </strong>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!showQuizResults && (
              <button
                onClick={() => setShowQuizResults(true)}
                disabled={Object.keys(quizAnswers).length === 0}
                className="w-full py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-bold text-xs shadow-md transition-colors"
              >
                Submit Answers
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
