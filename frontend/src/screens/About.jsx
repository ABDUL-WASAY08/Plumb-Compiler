import { useState, useEffect, useRef } from 'react';
import Lexer from './Lexer.jsx';


const TABS = [
  { id: 'pipeline', label: 'Pipeline' },
  { id: 'lexer', label: 'Lexer' },
];
const STEP_MS = 6000;

const SAMPLE_PLUMB_CODE = `pipeline process_data
    read "users.csv"
    filter age > 18
    transform name
    output "result.csv"`;

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
  const [tab, setTab] = useState('pipeline');
  const [activeStep, setActiveStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef(null);

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

  const selectTab = (next) => {
    setIsRunning(false); 
    setTab(next);
  };

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
          A compiler turns the code you write into code the computer can run, in small steps. Start
          with <strong>Pipeline</strong> to see the whole journey, then open <strong>Lexer</strong> to
          learn how the very first step actually works.
        </p>
      </div>

     
      <nav aria-label="About sections" className="flex w-fit gap-1 rounded-xl border border-zinc-200 bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => selectTab(t.id)}
            aria-current={tab === t.id ? 'page' : undefined}
            className={`rounded-lg px-5 py-2 text-sm font-semibold transition-colors ${
              tab === t.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-blue-50 hover:text-blue-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {/* Lexer tab */}
      {tab === 'lexer' && <Lexer />}

      {/* Pipeline tab */}
      {tab === 'pipeline' && (
        <>
        
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
                <button onClick={handlePrev} disabled={activeStep === 0} className="btn btn-outline">
                  ← Back
                </button>
                <button onClick={handlePlayPause} className="btn btn-primary">
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
                          <div
                            className="flex justify-center py-1 text-lg text-zinc-300"
                            aria-hidden="true"
                          >
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
        </>
      )}
    </div>
  );
}
