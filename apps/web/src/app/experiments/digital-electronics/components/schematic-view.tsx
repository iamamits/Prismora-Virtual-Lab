'use client';

import React from 'react';
import type { LogicLevel } from '@prismora/simulation-core';

interface SchematicViewProps {
  expId: string;
  signals: Record<string, LogicLevel | number | boolean | string | undefined>;
  onToggleInput?: (name: string) => void;
  onPulseClock?: () => void;
}

export function SchematicView({
  expId,
  signals,
  onToggleInput,
  onPulseClock,
}: SchematicViewProps) {
  const getLevel = (key: string): LogicLevel => (signals[key] === 1 ? 1 : 0);
  const wireColor = (level: LogicLevel) => (level === 1 ? '#10B981' : '#71717A'); // Emerald or Zinc
  const wireGlow = (level: LogicLevel) => (level === 1 ? 'drop-shadow(0 0 3px #10B981)' : 'none');

  // Interactive toggle button for schematic inputs
  const renderInputSwitch = (name: string, level: LogicLevel, x: number, y: number, label?: string) => (
    <g
      transform={`translate(${x}, ${y})`}
      className="cursor-pointer group select-none"
      onClick={() => onToggleInput?.(name)}
    >
      <rect
        x="-14"
        y="-10"
        width="28"
        height="20"
        rx="4"
        className={`transition-colors ${
          level === 1
            ? 'fill-emerald-600 stroke-emerald-400'
            : 'fill-zinc-700 stroke-zinc-500'
        }`}
        strokeWidth="1.5"
      />
      <text
        x="0"
        y="4"
        textAnchor="middle"
        className="font-mono text-[11px] font-bold fill-white pointer-events-none"
      >
        {level}
      </text>
      <text
        x="-22"
        y="4"
        textAnchor="end"
        className="font-mono text-[10px] font-bold fill-zinc-400 group-hover:fill-cyan-400 transition-colors"
      >
        {label ?? name}
      </text>
    </g>
  );

  // Output indicator LED
  const renderOutputLed = (level: LogicLevel, x: number, y: number, label: string) => (
    <g transform={`translate(${x}, ${y})`} className="select-none">
      <circle
        cx="0"
        cy="0"
        r="10"
        className={`transition-all ${
          level === 1
            ? 'fill-emerald-500 stroke-emerald-300'
            : 'fill-zinc-800 stroke-zinc-600'
        }`}
        strokeWidth="2"
        style={{ filter: level === 1 ? 'drop-shadow(0 0 8px #10B981)' : 'none' }}
      />
      <circle
        cx="-3"
        cy="-3"
        r="3"
        className={level === 1 ? 'fill-emerald-200' : 'fill-zinc-700'}
      />
      <text
        x="18"
        y="4"
        className={`font-mono text-xs font-bold ${
          level === 1 ? 'fill-emerald-400' : 'fill-zinc-400'
        }`}
      >
        {label} = {level}
      </text>
    </g>
  );

  return (
    <div className="relative w-full overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-inner">
      <div className="flex items-center justify-between mb-3 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Interactive Logic Schematic (Click switches to toggle inputs)
        </span>
        {onPulseClock && (
          <button
            onClick={onPulseClock}
            className="px-2.5 py-1 text-xs font-bold rounded bg-amber-500 hover:bg-amber-600 text-zinc-950 shadow flex items-center gap-1 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            Pulse Clock (CLK)
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto flex justify-center">
        <svg
          viewBox="0 0 500 240"
          className="w-full max-w-[560px] h-auto text-zinc-800 dark:text-zinc-200"
          style={{ minWidth: '400px' }}
        >
          {/* ========================================================= */}
          {/* EXP 1: BASIC LOGIC GATES */}
          {/* ========================================================= */}
          {expId === 'basic-gates' && (
            <g transform="translate(60, 40)">
              {/* Input A Wire & Switch */}
              <line
                x1="0"
                y1="40"
                x2="140"
                y2="40"
                stroke={wireColor(getLevel('A'))}
                strokeWidth="2.5"
                style={{ filter: wireGlow(getLevel('A')) }}
              />
              {renderInputSwitch('A', getLevel('A'), 0, 40, 'Input A')}

              {/* Input B Wire & Switch */}
              <line
                x1="0"
                y1="100"
                x2="140"
                y2="100"
                stroke={wireColor(getLevel('B'))}
                strokeWidth="2.5"
                style={{ filter: wireGlow(getLevel('B')) }}
              />
              {renderInputSwitch('B', getLevel('B'), 0, 100, 'Input B')}

              {/* Gate Body (AND/OR/XOR/etc.) */}
              <path
                d="M 140 20 L 190 20 A 50 50 0 0 1 190 120 L 140 120 Z"
                className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-700 dark:stroke-zinc-300"
                strokeWidth="2.5"
              />
              <text
                x="175"
                y="75"
                textAnchor="middle"
                className="font-mono text-sm font-black fill-zinc-900 dark:fill-white"
              >
                {String(signals['gateType'] ?? 'GATE')}
              </text>

              {/* Inversion Bubble if NAND/NOR/XNOR */}
              {['NAND', 'NOR', 'XNOR', 'NOT'].includes(String(signals['gateType'])) && (
                <circle
                  cx="244"
                  cy="70"
                  r="5"
                  className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-700 dark:stroke-zinc-300"
                  strokeWidth="2"
                />
              )}

              {/* Output Wire & Indicator */}
              <line
                x1={['NAND', 'NOR', 'XNOR', 'NOT'].includes(String(signals['gateType'])) ? '249' : '240'}
                y1="70"
                x2="330"
                y2="70"
                stroke={wireColor(getLevel('Y'))}
                strokeWidth="2.5"
                style={{ filter: wireGlow(getLevel('Y')) }}
              />
              {renderOutputLed(getLevel('Y'), 330, 70, 'Output Y')}
            </g>
          )}

          {/* ========================================================= */}
          {/* EXP 2: HALF / FULL ADDER */}
          {/* ========================================================= */}
          {expId === 'adders' && (
            <g transform="translate(40, 20)">
              {/* Inputs A, B, Cin */}
              {renderInputSwitch('A', getLevel('A'), 0, 30, 'A')}
              {renderInputSwitch('B', getLevel('B'), 0, 70, 'B')}
              {renderInputSwitch('Cin', getLevel('Cin'), 0, 150, 'Cin')}

              {/* HA1 Block */}
              <rect
                x="80"
                y="15"
                width="80"
                height="80"
                rx="6"
                className="fill-blue-500/10 stroke-blue-500"
                strokeWidth="2"
              />
              <text x="120" y="45" textAnchor="middle" className="text-[10px] font-bold fill-blue-500">
                Half Adder 1
              </text>
              <text x="120" y="65" textAnchor="middle" className="text-[9px] fill-zinc-500">
                (A ⊕ B, A·B)
              </text>

              {/* Wire to HA2 */}
              <line
                x1="160"
                y1="35"
                x2="220"
                y2="35"
                stroke={wireColor(getLevel('sum1'))}
                strokeWidth="2"
              />
              <line
                x1="0"
                y1="150"
                x2="220"
                y2="75"
                stroke={wireColor(getLevel('Cin'))}
                strokeWidth="2"
              />

              {/* HA2 Block */}
              <rect
                x="220"
                y="15"
                width="80"
                height="80"
                rx="6"
                className="fill-emerald-500/10 stroke-emerald-500"
                strokeWidth="2"
              />
              <text x="260" y="45" textAnchor="middle" className="text-[10px] font-bold fill-emerald-500">
                Half Adder 2
              </text>
              <text x="260" y="65" textAnchor="middle" className="text-[9px] fill-zinc-500">
                (S1 ⊕ Cin)
              </text>

              {/* Carry OR Gate */}
              <path
                d="M 330 130 Q 355 130 370 145 Q 355 160 330 160 Q 340 145 330 130 Z"
                className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-600"
                strokeWidth="2"
              />
              <line
                x1="160"
                y1="75"
                x2="335"
                y2="135"
                stroke={wireColor(getLevel('carry1'))}
                strokeWidth="2"
              />
              <line
                x1="300"
                y1="75"
                x2="335"
                y2="155"
                stroke={wireColor(getLevel('carry2'))}
                strokeWidth="2"
              />

              {/* Sum Output */}
              <line
                x1="300"
                y1="35"
                x2="390"
                y2="35"
                stroke={wireColor(getLevel('sum'))}
                strokeWidth="2.5"
                style={{ filter: wireGlow(getLevel('sum')) }}
              />
              {renderOutputLed(getLevel('sum'), 390, 35, 'Sum')}

              {/* Carry Output */}
              <line
                x1="370"
                y1="145"
                x2="390"
                y2="145"
                stroke={wireColor(getLevel('carryOut'))}
                strokeWidth="2.5"
                style={{ filter: wireGlow(getLevel('carryOut')) }}
              />
              {renderOutputLed(getLevel('carryOut'), 390, 145, 'Cout')}
            </g>
          )}

          {/* ========================================================= */}
          {/* EXP 5: RS NOR / NAND LATCH WITH FEEDBACK */}
          {/* ========================================================= */}
          {expId === 'nor-nand-latches' && (
            <g transform="translate(60, 30)">
              {/* Reset Input */}
              {renderInputSwitch('R', getLevel('R'), 0, 40, 'R (Reset)')}
              <line
                x1="0"
                y1="40"
                x2="120"
                y2="40"
                stroke={wireColor(getLevel('R'))}
                strokeWidth="2"
              />

              {/* Upper NOR Gate */}
              <path
                d="M 120 20 L 160 20 A 40 40 0 0 1 160 80 L 120 80 Z"
                className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-700 dark:stroke-zinc-300"
                strokeWidth="2"
              />
              <circle cx="205" cy="50" r="4" className="stroke-zinc-700 dark:stroke-zinc-300 fill-zinc-900" />
              <text x="150" y="55" className="text-[10px] font-bold fill-zinc-500">
                NOR
              </text>

              {/* Set Input */}
              {renderInputSwitch('S', getLevel('S'), 0, 140, 'S (Set)')}
              <line
                x1="0"
                y1="140"
                x2="120"
                y2="140"
                stroke={wireColor(getLevel('S'))}
                strokeWidth="2"
              />

              {/* Lower NOR Gate */}
              <path
                d="M 120 120 L 160 120 A 40 40 0 0 1 160 180 L 120 180 Z"
                className="fill-zinc-100 dark:fill-zinc-900 stroke-zinc-700 dark:stroke-zinc-300"
                strokeWidth="2"
              />
              <circle cx="205" cy="150" r="4" className="stroke-zinc-700 dark:stroke-zinc-300 fill-zinc-900" />
              <text x="150" y="155" className="text-[10px] font-bold fill-zinc-500">
                NOR
              </text>

              {/* Cross-coupled Feedback Lines */}
              {/* Q feedback to Upper NOR */}
              <path
                d="M 230 150 L 230 110 L 100 70 L 120 70"
                fill="none"
                stroke={wireColor(getLevel('Q'))}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />
              {/* Q_bar feedback to Lower NOR */}
              <path
                d="M 230 50 L 230 90 L 100 130 L 120 130"
                fill="none"
                stroke={wireColor(getLevel('QBar'))}
                strokeWidth="1.5"
                strokeDasharray="4 2"
              />

              {/* Outputs */}
              <line
                x1="209"
                y1="50"
                x2="300"
                y2="50"
                stroke={wireColor(getLevel('QBar'))}
                strokeWidth="2.5"
              />
              {renderOutputLed(getLevel('QBar'), 300, 50, 'Q̄')}

              <line
                x1="209"
                y1="150"
                x2="300"
                y2="150"
                stroke={wireColor(getLevel('Q'))}
                strokeWidth="2.5"
              />
              {renderOutputLed(getLevel('Q'), 300, 150, 'Q')}
            </g>
          )}

          {/* ========================================================= */}
          {/* EXP 7: 4-BIT SIPO SHIFT REGISTER */}
          {/* ========================================================= */}
          {expId === 'shift-register' && (
            <g transform="translate(10, 20)">
              {/* Serial In */}
              {renderInputSwitch('serialIn', getLevel('serialIn'), 15, 60, 'Data')}
              <line
                x1="15"
                y1="60"
                x2="55"
                y2="60"
                stroke={wireColor(getLevel('serialIn'))}
                strokeWidth="2"
              />

              {/* 4 Cascaded D-FF Stages */}
              {[0, 1, 2, 3].map((stage) => {
                const x = 55 + stage * 90;
                const bitVal = Number(signals[`q${stage}`] ?? 0) as LogicLevel;
                return (
                  <g key={stage} transform={`translate(${x}, 20)`}>
                    <rect
                      x="0"
                      y="0"
                      width="65"
                      height="90"
                      rx="4"
                      className="fill-zinc-900 stroke-zinc-700"
                      strokeWidth="1.5"
                    />
                    <text x="32" y="20" textAnchor="middle" className="text-[10px] font-bold fill-cyan-400">
                      FF{stage} (D)
                    </text>
                    <text x="10" y="45" className="text-[9px] fill-zinc-400 font-mono">
                      D
                    </text>
                    <text x="50" y="45" className="text-[9px] fill-emerald-400 font-mono">
                      Q
                    </text>
                    {/* Clock symbol */}
                    <path d="M 0 75 L 10 80 L 0 85" fill="none" stroke="#F59E0B" strokeWidth="1.5" />
                    {/* Bit Readout */}
                    <text
                      x="32"
                      y="60"
                      textAnchor="middle"
                      className={`text-base font-black ${
                        bitVal === 1 ? 'fill-emerald-400' : 'fill-zinc-600'
                      }`}
                    >
                      {bitVal}
                    </text>

                    {/* Connecting wire to next stage */}
                    {stage < 3 && (
                      <line
                        x1="65"
                        y1="40"
                        x2="90"
                        y2="40"
                        stroke={wireColor(bitVal)}
                        strokeWidth="2"
                      />
                    )}
                    {/* Parallel Output indicator */}
                    <line
                      x1="55"
                      y1="40"
                      x2="55"
                      y2="130"
                      stroke={wireColor(bitVal)}
                      strokeWidth="2"
                    />
                    {renderOutputLed(bitVal, 55, 140, `Q${stage}`)}
                  </g>
                );
              })}
            </g>
          )}

          {/* ========================================================= */}
          {/* EXP 11: BINARY TO GRAY CODE */}
          {/* ========================================================= */}
          {expId === 'code-converters' && (
            <g transform="translate(40, 20)">
              {/* Binary Inputs B3, B2, B1, B0 */}
              {[3, 2, 1, 0].map((bit, idx) => (
                <g key={bit}>
                  {renderInputSwitch(`B${bit}`, getLevel(`B${bit}`), 0, 30 + idx * 45, `B${bit}`)}
                  <line
                    x1="0"
                    y1={30 + idx * 45}
                    x2="150"
                    y2={30 + idx * 45}
                    stroke={wireColor(getLevel(`B${bit}`))}
                    strokeWidth="2"
                  />
                </g>
              ))}

              {/* B3 passes straight to G3 */}
              <line
                x1="150"
                y1="30"
                x2="330"
                y2="30"
                stroke={wireColor(getLevel('G3'))}
                strokeWidth="2.5"
              />
              {renderOutputLed(getLevel('G3'), 330, 30, 'G3')}

              {/* XOR Gate 1: B3 ⊕ B2 -> G2 */}
              <g transform="translate(180, 50)">
                <path
                  d="M 0 0 L 25 0 A 25 25 0 0 1 25 45 L 0 45 Z"
                  className="fill-zinc-900 stroke-zinc-600"
                  strokeWidth="1.5"
                />
                <text x="15" y="27" textAnchor="middle" className="text-[9px] font-bold fill-zinc-400">
                  ⊕
                </text>
              </g>
              <line x1="230" y1="72" x2="330" y2="72" stroke={wireColor(getLevel('G2'))} strokeWidth="2.5" />
              {renderOutputLed(getLevel('G2'), 330, 72, 'G2')}

              {/* XOR Gate 2: B2 ⊕ B1 -> G1 */}
              <g transform="translate(180, 95)">
                <path
                  d="M 0 0 L 25 0 A 25 25 0 0 1 25 45 L 0 45 Z"
                  className="fill-zinc-900 stroke-zinc-600"
                  strokeWidth="1.5"
                />
                <text x="15" y="27" textAnchor="middle" className="text-[9px] font-bold fill-zinc-400">
                  ⊕
                </text>
              </g>
              <line x1="230" y1="117" x2="330" y2="117" stroke={wireColor(getLevel('G1'))} strokeWidth="2.5" />
              {renderOutputLed(getLevel('G1'), 330, 117, 'G1')}

              {/* XOR Gate 3: B1 ⊕ B0 -> G0 */}
              <g transform="translate(180, 140)">
                <path
                  d="M 0 0 L 25 0 A 25 25 0 0 1 25 45 L 0 45 Z"
                  className="fill-zinc-900 stroke-zinc-600"
                  strokeWidth="1.5"
                />
                <text x="15" y="27" textAnchor="middle" className="text-[9px] font-bold fill-zinc-400">
                  ⊕
                </text>
              </g>
              <line x1="230" y1="162" x2="330" y2="162" stroke={wireColor(getLevel('G0'))} strokeWidth="2.5" />
              {renderOutputLed(getLevel('G0'), 330, 162, 'G0')}
            </g>
          )}

          {/* ========================================================= */}
          {/* EXP 12: MAGNITUDE COMPARATORS */}
          {/* ========================================================= */}
          {expId === 'comparators' && (
            <g transform="translate(60, 30)">
              {/* Inputs A and B */}
              {renderInputSwitch('A1', getLevel('A1'), 0, 30, 'A1')}
              {renderInputSwitch('A0', getLevel('A0'), 0, 70, 'A0')}
              {renderInputSwitch('B1', getLevel('B1'), 0, 120, 'B1')}
              {renderInputSwitch('B0', getLevel('B0'), 0, 160, 'B0')}

              {/* Central 2-Bit Comparator Chip Box */}
              <rect
                x="120"
                y="15"
                width="140"
                height="165"
                rx="8"
                className="fill-zinc-900 stroke-zinc-700"
                strokeWidth="2"
              />
              <text x="190" y="45" textAnchor="middle" className="text-xs font-bold fill-cyan-400">
                2-Bit Magnitude
              </text>
              <text x="190" y="62" textAnchor="middle" className="text-xs font-bold fill-cyan-400">
                Comparator
              </text>
              <text x="190" y="90" textAnchor="middle" className="text-[10px] font-mono fill-zinc-400">
                Word A vs Word B
              </text>

              {/* Output Wire Flags */}
              <line x1="260" y1="45" x2="320" y2="45" stroke={wireColor(getLevel('aGtB'))} strokeWidth="2.5" />
              {renderOutputLed(getLevel('aGtB'), 320, 45, 'A > B')}

              <line x1="260" y1="95" x2="320" y2="95" stroke={wireColor(getLevel('aEqB'))} strokeWidth="2.5" />
              {renderOutputLed(getLevel('aEqB'), 320, 95, 'A = B')}

              <line x1="260" y1="145" x2="320" y2="145" stroke={wireColor(getLevel('aLtB'))} strokeWidth="2.5" />
              {renderOutputLed(getLevel('aLtB'), 320, 145, 'A < B')}
            </g>
          )}

          {/* Default fallback graphic for other experiments */}
          {!['basic-gates', 'adders', 'nor-nand-latches', 'shift-register', 'code-converters', 'comparators'].includes(
            expId,
          ) && (
            <g transform="translate(100, 40)">
              <rect
                x="0"
                y="0"
                width="300"
                height="140"
                rx="8"
                className="fill-zinc-900 stroke-zinc-700"
                strokeWidth="2"
              />
              <text x="150" y="60" textAnchor="middle" className="text-sm font-bold fill-cyan-400">
                {String(signals['moduleTitle'] ?? 'Digital Logic Block')}
              </text>
              <text x="150" y="90" textAnchor="middle" className="text-xs fill-zinc-400">
                Active Simulation Engine Running
              </text>
            </g>
          )}
        </svg>
      </div>
    </div>
  );
}
