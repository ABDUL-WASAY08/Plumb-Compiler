import { useState, useEffect, useRef } from 'react';

// How long each pipeline step stays on screen, in milliseconds.
// Deliberately slow: this page is for learning, so people get time to read.
const STEP_MS = 6000;

// A small Plumb program used throughout the walkthrough.
const SAMPLE_PLUMB_CODE = `pipeline process_data
    read "users.csv"
    filter age > 18
    transform name
    output "result.csv"`;

// A tiny program used to show what the lexer does, line by line.
const LEXER_SAMPLE = `pipeline process_data
    read "users.csv"
    filter age > 18`;

// The tokens the lexer produces for LEXER_SAMPLE.
// Value "\\n" means the newline character at the end of a line.
const LEXER_TOKENS = [
  { type: 'KEYWORD', value: 'pipeline', pos: '1 : 1', desc: 'Reserved word' },
  { type: 'IDENTIFIER', value: 'process_data', pos: '1 : 10', desc: 'Name of the pipeline' },
  { type: 'NEWLINE', value: '\\n', pos: '1 : 22', desc: 'Line ends' },
  { type: 'INDENT', value: '(4 spaces)', pos: '2 : 1', desc: 'Structure separator' },
  { type: 'KEYWORD', value: 'read', pos: '2 : 5', desc: 'Reserved word' },
  { type: 'STRING', value: '"users.csv"', pos: '2 : 10', desc: 'File path' },
  { type: 'NEWLINE', value: '\\n', pos: '2 : 21', desc: 'Line ends' },
  { type: 'INDENT', value: '(4 spaces)', pos: '3 : 1', desc: 'Structure separator' },
  { type: 'KEYWORD', value: 'filter', pos: '3 : 5', desc: 'Reserved word' },
  { type: 'IDENTIFIER', value: 'age', pos: '3 : 12', desc: 'Column name' },
  { type: 'OPERATOR', value: '>', pos: '3 : 16', desc: 'Comparison symbol' },
  { type: 'NUMBER', value: '18', pos: '3 : 18', desc: 'Numeric value' },
];

// Each phase of the compiler, explained in plain, everyday words.
const STEPS = [
  {
    id: 'source',
    name: 'Source Code',
    badge: 'Start',
    status: 'ready',
    simple:
      'This is where you begin. You write a small program in a file ending with .plb. It is only plain text right now — a human can read it, but the computer cannot run it yet.',
    inputLabel: 'What you have',
    inputCode: '— an empty editor —',
    outputLabel: 'What comes out',
    outputCode: SAMPLE_PLUMB_CODE,
  },
  {
    id: 'lexer',
    name: 'Lexer',
    badge: 'Core phase',
    status: 'ready',
    simple:
      'The compiler reads your text one character at a time and cuts it into small pieces called tokens. Think of tokens as the words of a sentence: each one is a single meaningful chunk, like a keyword (read, filter), a name (age), a number (18), or a quoted string ("users.csv").',
    inputLabel: 'What goes in',
    inputCode: SAMPLE_PLUMB_CODE,
    outputLabel: 'Tokens produced',
    outputCode: JSON.stringify(
      [
        { type: 'KEYWORD', value: 'pipeline', line: 1 },
        { type: 'IDENTIFIER', value: 'process_data', line: 1 },
        { type: 'INDENT', value: '4 spaces', line: 2 },
        { type: 'KEYWORD', value: 'read', line: 2 },
        { type: 'STRING', value: '"users.csv"', line: 2 },
        { type: 'KEYWORD', value: 'filter', line: 3 },
        { type: 'IDENTIFIER', value: 'age', line: 3 },
        { type: 'OPERATOR', value: '>', line: 3 },
        { type: 'NUMBER', value: '18', line: 3 },
        { type: 'KEYWORD', value: 'transform', line: 4 },
        { type: 'IDENTIFIER', value: 'name', line: 4 },
        { type: 'KEYWORD', value: 'output', line: 5 },
        { type: 'STRING', value: '"result.csv"', line: 5 },
      ],
      null,
      2
    ),
  },
  {
    id: 'parser',
    name: 'Parser',
    badge: 'Core phase',
    status: 'ready',
    simple:
      'The parser puts the tokens together into a shape called a tree. The tree shows how the parts of your program belong together — the pipeline at the top, and the steps it contains hanging underneath, like a family tree for your code.',
    inputLabel: 'What goes in',
    inputCode: 'The list of tokens from the previous step',
    outputLabel: 'Tree produced',
    outputCode: JSON.stringify(
      {
        type: 'Pipeline',
        name: 'process_data',
        body: [
          { type: 'ReadCommand', path: 'users.csv' },
          { type: 'FilterCommand', column: 'age', operator: '>', value: 18 },
          { type: 'TransformCommand', columns: ['name'] },
          { type: 'OutputCommand', path: 'result.csv' },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'semantic',
    name: 'Semantic Analyzer',
    badge: 'Core phase',
    status: 'ready',
    simple:
      'Now the compiler checks that your program actually makes sense. Did you read a file before using it? Do the column names exist? It keeps a little list of names, called a symbol table, and reports any mistakes it finds.',
    inputLabel: 'What goes in',
    inputCode: 'The tree from the parser',
    outputLabel: 'Check result',
    outputCode: JSON.stringify(
      {
        status: 'VALID',
        symbolTable: [
          { name: 'process_data', kind: 'Pipeline', scope: 'Global' },
          { name: 'age', kind: 'Column', type: 'Number', scope: 'process_data' },
          { name: 'name', kind: 'Column', type: 'String', scope: 'process_data' },
        ],
        errors: [],
        warnings: [],
      },
      null,
      2
    ),
  },
  {
    id: 'icg',
    name: 'Intermediate Code',
    badge: 'Skipped',
    status: 'skipped',
    simple:
      'Big compilers first turn your code into a middle language, halfway between your code and the machine. Plumb is small and simple, so it skips this step entirely — less machinery to build and understand.',
    inputLabel: 'What goes in',
    inputCode: '—',
    outputLabel: 'What happens',
    outputCode: '⏭  Skipped. Plumb goes straight from the tree to the final code.',
  },
  {
    id: 'optimizer',
    name: 'Optimizer',
    badge: 'Skipped',
    status: 'skipped',
    simple:
      'An optimizer looks for ways to make the program run faster without changing what it does. The JavaScript engine in your browser or in Node.js already does this for us, so Plumb does not need its own optimizer.',
    inputLabel: 'What goes in',
    inputCode: '—',
    outputLabel: 'What happens',
    outputCode: '⏭  Skipped. The JavaScript engine optimises the code while it runs.',
  },
  {
    id: 'codegen',
    name: 'Code Generator',
    badge: 'Core phase',
    status: 'ready',
    simple:
      'Finally, the compiler walks through the tree from top to bottom and writes out real JavaScript — the language the computer can actually run. Every step in your pipeline becomes a line of JavaScript.',
    inputLabel: 'What goes in',
    inputCode: 'The checked tree',
    outputLabel: 'JavaScript produced',
    outputCode: `const data = readCSV("users.csv");
const filtered = data.filter(r => r.age > 18);
const result = filtered.map(r => ({ name: r.name }));
writeCSV(result, "result.csv");`,
  },
  {
    id: 'target_opt',
    name: 'Target Optimizer',
    badge: 'Skipped',
    status: 'skipped',
    simple:
      'This last step tunes the finished code for one specific type of computer chip. Plumb hands that job to the JavaScript engine too, so there is nothing extra for us to do here.',
    inputLabel: 'What goes in',
    inputCode: '—',
    outputLabel: 'What happens',
    outputCode: '⏭  Skipped. The runtime environment handles machine-level tuning.',
  },
];

const GLOSSARY = [
  { term: 'Compiler', plain: 'A program that reads your code and turns it into something the computer can run.' },
  { term: 'Token', plain: 'One small piece of your code, like a single word.' },
  { term: 'Tree (AST)', plain: 'A map of how the pieces of your program fit together.' },
  { term: 'Symbol table', plain: 'A list of the names your program uses, kept so they can be checked.' },
  { term: 'JavaScript', plain: 'The language the finished code is written in, so the browser can run it.' },
];

export default function AboutScreen() {
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

  // Advance one step every STEP_MS while the tour is running.
  useEffect(() => {
    if (!isRunning) return undefined;

    timerRef.current = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= STEPS.length - 1) {
          setIsRunning(false);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_MS);

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const step = STEPS[activeStep];
  const isSkipped = step.status === 'skipped';

  const handlePlayPause = () => {
    if (isRunning) {
      setIsRunning(false);
      return;
    }
    if (activeStep >= STEPS.length - 1) setActiveStep(0);
    setIsRunning(true);
  };

  const goToStep = (index) => {
    setIsRunning(false);
    setActiveStep(index);
  };

  const handlePrev = () => {
    setIsRunning(false);
    setActiveStep((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    setIsRunning(false);
    setActiveStep((prev) => Math.min(STEPS.length - 1, prev + 1));
  };

  const handleRestart = () => {
    setActiveStep(0);
    setIsRunning(true);
  };

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-3 border-b border-zinc-200 pb-6">
        <span className="badge border-blue-200 bg-blue-50 text-blue-700">Learning hub</span>
        <h1 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">
          How the Plumb Compiler Works
        </h1>
        <p className="max-w-3xl text-base text-zinc-600">
          A compiler takes the code you write and turns it into code the computer can run. It does
          this in small steps, one after another. Press play and follow along — each step waits a few
          seconds so you can read what is happening before moving on.
        </p>
      </div>

      {/* The walkthrough: pipeline on the left, explanation on the right */}
      <section className="panel p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 text-xl font-bold text-zinc-900">
              <span className="h-3 w-3 rounded-full bg-blue-600" />
              Compiler Pipeline
            </h2>
            <p className="text-sm text-zinc-500">
              Eight phases, one at a time. The highlighted block is running now.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={activeStep === 0}
              className="btn btn-outline"
            >
              ← Back
            </button>
            <button
              onClick={handlePlayPause}
              className="btn btn-primary"
            >
              {isRunning ? '❚❚ Pause' : '▶ Play tour'}
            </button>
            <button
              onClick={handleNext}
              disabled={activeStep === STEPS.length - 1}
              className="btn btn-outline"
            >
              Next →
            </button>
            <button onClick={handleRestart} className="btn btn-ghost">
              ↺ Restart
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          {/* LEFT: the pipeline itself */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              The pipeline
            </p>
            <ol className="space-y-3">
              {STEPS.map((item, index) => {
                const isActive = index === activeStep;
                const isDone = index < activeStep;
                const itemSkipped = item.status === 'skipped';

                return (
                  <li key={item.id}>
                    <button
                      onClick={() => goToStep(index)}
                      className={`w-full rounded-xl border p-4 text-left transition-all duration-300 ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-500/10'
                          : isDone
                          ? 'border-emerald-200 bg-emerald-50/60'
                          : 'border-zinc-200 bg-white hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${
                            isActive
                              ? 'bg-blue-600 text-white'
                              : isDone
                              ? 'bg-emerald-500 text-white'
                              : 'bg-zinc-100 text-zinc-500'
                          }`}
                        >
                          {isDone ? '✓' : index + 1}
                        </span>
                        <span className="flex-1 text-sm font-semibold text-zinc-900">
                          {item.name}
                        </span>
                        <span
                          className={`badge ${
                            itemSkipped
                              ? 'border-amber-200 bg-amber-50 text-amber-700'
                              : index === activeStep
                              ? 'border-blue-300 bg-white text-blue-700'
                              : 'border-zinc-200 text-zinc-500'
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      {isActive && (
                        <p className="mt-2 text-xs font-medium text-blue-700">
                          Showing now — read the panel on the right.
                        </p>
                      )}
                    </button>

                    {index < STEPS.length - 1 && (
                      <div className="flex justify-center py-1 text-lg text-zinc-300" aria-hidden="true">
                        ↓
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>

          {/* RIGHT: explanation of the active step */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-400">
              What is happening
            </p>

            <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-zinc-900">
                  <span className="text-blue-600">Step {activeStep + 1}.</span> {step.name}
                </h3>
                <span
                  className={`badge ${
                    isSkipped
                      ? 'border-amber-200 bg-amber-50 text-amber-700'
                      : 'border-blue-200 bg-blue-50 text-blue-700'
                  }`}
                >
                  {isSkipped ? 'Skipped' : 'Core phase'}
                </span>
              </div>

              {/* Time bar: shows how long this step stays on screen. */}
              <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100">
                <div
                  key={activeStep}
                  className={`h-full w-full animate-grow-bar rounded-full ${
                    isSkipped ? 'bg-amber-400' : 'bg-blue-600'
                  }`}
                  style={{
                    animationDuration: `${STEP_MS}ms`,
                    animationTimingFunction: 'linear',
                    animationPlayState: isRunning ? 'running' : 'paused',
                  }}
                />
              </div>
              <p className="mt-2 text-xs text-zinc-400">
                {isRunning
                  ? `Next step in ${STEP_MS / 1000} seconds…`
                  : 'Paused — press play to continue the tour.'}
              </p>

              <p className="mt-4 text-sm leading-7 text-zinc-700">{step.simple}</p>

              {/* Before / after panels */}
              <div className="mt-5 grid gap-3">
                <div>
                  <p className="label mb-1.5">{step.inputLabel}</p>
                  <pre className="max-h-40 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed text-zinc-700">
                    <code>{step.inputCode}</code>
                  </pre>
                </div>
                <div>
                  <p className="label mb-1.5">{step.outputLabel}</p>
                  <pre className="max-h-56 overflow-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs leading-relaxed text-zinc-100">
                    <code>{step.outputCode}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Lexer deep-dive notes */}
      <section className="panel space-y-8 p-6 sm:p-8">
        <div className="border-b border-zinc-200 pb-4">
          <span className="badge border-blue-200 bg-blue-50 text-blue-700">Phase 1 · Notes</span>
          <h2 className="mt-3 text-2xl font-bold text-zinc-900">The Lexer, step by step</h2>
          <p className="mt-1 text-sm text-zinc-600">
            The lexer&apos;s job is to read the whole string one character at a time and build Tokens.
          </p>
        </div>

        {/* The example program */}
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="label mb-1.5">Our example pipeline</p>
            <pre className="overflow-auto rounded-lg bg-zinc-900 p-4 font-mono text-xs leading-relaxed text-zinc-100">
              <code>{LEXER_SAMPLE}</code>
            </pre>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
            <p className="label mb-2">What the lexer does</p>
            <p className="text-sm leading-7 text-zinc-700">
              It walks the text one character at a time. Whenever the characters it has read so far
              match a known pattern, it wraps them into a <strong>Token</strong> and moves on. Plain
              spaces are usually thrown away, but newlines and indentation are kept — they tell the
              parser how the lines are grouped.
            </p>
          </div>
        </div>

        {/* Token table */}
        <div>
          <h3 className="text-base font-bold text-zinc-900">
            Tokens produced — your notepad (Type, Value, Line : Col)
          </h3>
          <div className="mt-3 overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="p-3 font-semibold uppercase tracking-wide">Token Type</th>
                  <th className="p-3 font-semibold uppercase tracking-wide">Value (Text)</th>
                  <th className="p-3 font-semibold uppercase tracking-wide">Line : Col</th>
                  <th className="p-3 font-semibold uppercase tracking-wide">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-mono">
                {LEXER_TOKENS.map((token, index) => (
                  <tr key={index} className="text-zinc-700">
                    <td className="p-3 font-semibold text-blue-700">{token.type}</td>
                    <td className="p-3 text-zinc-900">{token.value}</td>
                    <td className="p-3 text-zinc-500">{token.pos}</td>
                    <td className="p-3 font-sans text-zinc-600">{token.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* JFlex rules */}
        <div className="space-y-4">
          <h3 className="text-base font-bold text-zinc-900">
            How do we do this in JFlex (Java)?
          </h3>
          <p className="text-sm leading-7 text-zinc-700">
            JFlex is a tool that we give Regular Expressions (Regex) to. JFlex reads the whole file
            character by character, and as soon as a pattern matches, it builds a Token object and
            returns it.
          </p>
          <p className="text-sm text-zinc-600">
            JFlex has three basic rules that you will design on your notepad:
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                1 · Regex Pattern
              </p>
              <p className="mt-1 text-sm text-zinc-600">For an identifier:</p>
              <pre className="mt-2 overflow-auto rounded-lg bg-zinc-900 p-2.5 font-mono text-xs text-zinc-100">
                <code>[a-zA-Z_][a-zA-Z0-9_]*</code>
              </pre>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
                2 · Action Code
              </p>
              <p className="mt-1 text-sm text-zinc-600">What to do when it matches:</p>
              <pre className="mt-2 overflow-auto rounded-lg bg-zinc-900 p-2.5 font-mono text-xs text-zinc-100">
                <code>return new Token("IDENTIFIER", yytext())</code>
              </pre>
            </div>

            <div className="rounded-xl border border-zinc-200 bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                3 · Error Handling
              </p>
              <p className="mt-1 text-sm text-zinc-600">
                When a character does not fit any rule (like @ or $):
              </p>
              <pre className="mt-2 overflow-auto rounded-lg bg-zinc-900 p-2.5 font-mono text-xs text-zinc-100">
                <code>{"Invalid character '@' at line 2, col 7"}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Simple glossary */}
      <section className="panel p-6 sm:p-8">
        <h2 className="text-xl font-bold text-zinc-900">Words you will hear</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Short, plain-English reminders of the terms used above.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GLOSSARY.map(({ term, plain }) => (
            <div key={term} className="rounded-xl border border-zinc-200 bg-white p-4">
              <h3 className="text-sm font-bold text-blue-700">{term}</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-600">{plain}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
