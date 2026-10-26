

const SAMPLE = `pipeline process_data
    read "users.csv"
    filter age > 18`;

// The exact tokens the real lexer returns for SAMPLE (verified against the backend).
const SAMPLE_TOKENS = [
  { type: 'KEYWORD', value: 'pipeline', line: 1, column: 1 },
  { type: 'IDENTIFIER', value: 'process_data', line: 1, column: 10 },
  { type: 'KEYWORD', value: 'read', line: 2, column: 5 },
  { type: 'STRING', value: '"users.csv"', line: 2, column: 10 },
  { type: 'KEYWORD', value: 'filter', line: 3, column: 5 },
  { type: 'IDENTIFIER', value: 'age', line: 3, column: 12 },
  { type: 'OPERATOR', value: '>', line: 3, column: 16 },
  { type: 'NUMBER', value: '18', line: 3, column: 18 },
];

const TOKEN_COLORS = {
  KEYWORD: 'text-blue-700',
  IDENTIFIER: 'text-violet-700',
  NUMBER: 'text-emerald-700',
  STRING: 'text-amber-700',
  OPERATOR: 'text-cyan-700',
  COMMA: 'text-zinc-500',
  ERROR: 'text-red-700',
};

// Every kind of token the Plumb language understands.
const TOKEN_CATEGORIES = [
  {
    type: 'KEYWORD',
    pattern: '"pipeline", "read", "filter", "transform", "output", "log"',
    means: 'A reserved word. The language owns these words, so you cannot use them as names.',
  },
  {
    type: 'IDENTIFIER',
    pattern: String.raw`[a-zA-Z_][a-zA-Z0-9_]*`,
    means: 'A name you chose — a pipeline name or a column name.',
  },
  {
    type: 'NUMBER',
    pattern: String.raw`[0-9]+(\.[0-9]+)?`,
    means: 'A numeric value such as 18 or 2.5.',
  },
  {
    type: 'STRING',
    pattern: String.raw`"([^"\\]|\\.)*"`,
    means: 'Quoted text, usually a file path or a message.',
  },
  {
    type: 'OPERATOR',
    pattern: String.raw`[\+\-\*/<>=!]=?`,
    means: 'A comparison or maths symbol such as > or >=.',
  },
  {
    type: 'COMMA',
    pattern: ',',
    means: 'A separator between items.',
  },
  {
    type: 'ERROR',
    pattern: String.raw`.`,
    means: 'Anything no other rule matched — reported instead of crashing the program.',
  },
];

// The building blocks of regex, in the order you normally learn them.
const REGEX_BASICS = [
  { pattern: 'read', means: 'Exactly these characters, in this order.', example: 'matches read · not Read' },
  { pattern: String.raw`[abc]`, means: 'One character from the set.', example: 'matches a, b or c' },
  { pattern: String.raw`[a-z]`, means: 'One character in the range.', example: 'matches any lowercase letter' },
  { pattern: String.raw`[^0-9]`, means: 'One character that is NOT in the set.', example: 'matches x · not 5' },
  { pattern: String.raw`*`, means: 'The thing before it, repeated zero or more times.', example: 'a* matches "" and aaa' },
  { pattern: String.raw`+`, means: 'The thing before it, repeated one or more times.', example: 'a+ matches a and aaa · not ""' },
  { pattern: String.raw`?`, means: 'The thing before it, optional (zero or one).', example: 'a? matches "" and a' },
  { pattern: String.raw`{2,4}`, means: 'Between two and four times.', example: 'a{2,4} matches aa and aaaa' },
  { pattern: String.raw`|`, means: 'Either the left side or the right side.', example: 'cat|dog matches cat or dog' },
  { pattern: String.raw`(...)`, means: 'A group — the pieces inside count as one unit.', example: '(ab)+ matches ab, abab' },
  { pattern: String.raw`\.`, means: 'A real full stop (the backslash removes its special meaning).', example: 'matches . · not any letter' },
  { pattern: String.raw`.`, means: 'Any single character (the wildcard).', example: 'matches any one character' },
];

// How Plumb builds each rule out of those pieces.
const PLUM_PATTERNS = [
  {
    name: 'Whitespace',
    pattern: String.raw`[ \t\r\n]+`,
    break: [
      'A character class holding a space, a tab (\\t), a carriage return (\\r) and a newline (\\n).',
      'The + means "one or more of them in a row".',
      'Result: any run of blank space between tokens.',
    ],
  },
  {
    name: 'Identifier',
    pattern: String.raw`[a-zA-Z_][a-zA-Z0-9_]*`,
    break: [
      'The first part [a-zA-Z_] allows one letter (upper or lower) or an underscore.',
      'The second part [a-zA-Z0-9_]* allows letters, digits or underscores, zero or more times.',
      'Because the first part has no 0-9, a name can never start with a digit.',
      'Result: age, process_data, _tmp, x1 match · 1abc does not.',
    ],
  },
  {
    name: 'Number',
    pattern: String.raw`[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?`,
    break: [
      '[0-9]+ — one or more digits, the whole-number part.',
      '(\\.[0-9]+)? — an optional decimal part: a dot then more digits.',
      '([eE][+-]?[0-9]+)? — an optional exponent, e.g. e9 or E-3.',
      'Result: 18, 2.5 and 1e9 all match.',
    ],
  },
  {
    name: 'String',
    pattern: String.raw`"([^"\\]|\\.)*"`,
    break: [
      'It starts with a real quote and must end with a real quote: " ... ".',
      'Inside, [^"\\\\] means a character that is not a quote and not a backslash.',
      'The alternative \\. means a backslash followed by anything (an escape, like \\").',
      'The * repeats that pair, so the string can be any length.',
      'Result: "users.csv" and "say \\"hi\\"" both match as one token.',
    ],
  },
  {
    name: 'Comment',
    pattern: String.raw`"#".*`,
    break: [
      'A real # character marks the start.',
      '.* means "any characters, zero or more", so it swallows the rest of the line.',
      'The action for this rule is empty, so comments are read and thrown away.',
    ],
  },
  {
    name: 'Operator',
    pattern: String.raw`[\+\-\*/<>=!]=?`,
    break: [
      'A character class of the symbols: + - * / < > = !',
      'The trailing =? makes a second = optional.',
      'Result: one rule handles both > and >=, and both = and ==.',
    ],
  },
];

const RULES = [
  {
    n: 1,
    title: 'One rule per kind of token',
    body: 'Every token type gets its own pattern + action pair. Keywords, names, numbers, strings and operators are each their own rule.',
  },
  {
    n: 2,
    title: 'The longest match wins',
    body: 'At each position the lexer takes the LONGEST text that any rule can match. For >= both > and >= match, so >= wins because it is longer.',
  },
  {
    n: 3,
    title: 'When two rules tie, the first one wins',
    body: 'If two rules match the same length, the rule written FIRST is used. This is why keyword rules must sit above the Identifier rule — otherwise filter would come back as an IDENTIFIER.',
  },
  {
    n: 4,
    title: 'Give the boring things an empty action',
    body: 'Whitespace and comments are matched and then thrown away. Their action does nothing, so they never appear as tokens but still move the reader forward.',
  },
  {
    n: 5,
    title: 'Always keep a fallback rule',
    body: 'One rule at the very end should match a single character of anything and report it as an error. Without it, an unexpected character like @ would crash the lexer instead of being reported.',
  },
  {
    n: 6,
    title: 'Record where each token is',
    body: 'Store the line and column of every token. That is what lets the compiler say "line 3, column 16" later instead of just "something is wrong".',
  },
  {
    n: 7,
    title: 'Order the rules from specific to general',
    body: 'Specific patterns go first and broad ones go last. Keywords before identifiers, multi-character operators before single characters, and the fallback dead last.',
  },
];

const MISTAKES = [
  {
    problem: 'Identifier rule placed above the keywords',
    result: 'filter, read, output come back as IDENTIFIER instead of KEYWORD.',
    fix: 'Always declare keyword rules first.',
  },
  {
    problem: 'No fallback rule',
    result: 'An unexpected character (like @ or $) throws an error and stops the lexer.',
    fix: 'End with a single-character rule that returns an ERROR token.',
  },
  {
    problem: 'Forgetting to escape a quote',
    result: 'The string pattern breaks, or it swallows the rest of the file.',
    fix: 'Write \\" when you mean a literal quote character.',
  },
  {
    problem: 'Letting whitespace become tokens',
    result: 'The parser is flooded with useless space and newline tokens.',
    fix: 'Match whitespace and give it an empty action.',
  },
  {
    problem: 'Not tracking line numbers',
    result: 'Error messages can only say "somewhere", never "line 3".',
    fix: 'Turn on line/column tracking and store them on every token.',
  },
];

function Code({ children }) {
  return (
    <pre className="overflow-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs leading-relaxed text-zinc-100">
      <code>{children}</code>
    </pre>
  );
}

export default function Lexer() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="space-y-3 border-b border-zinc-200 pb-6">
        <span className="badge border-blue-200 bg-blue-50 text-blue-700">Phase 1 · The first stage</span>
        <h1 className="text-3xl font-extrabold text-zinc-900 sm:text-4xl">The Lexer</h1>
        <p className="max-w-3xl text-base text-zinc-600">
          The lexer is the very first stage of a compiler. It takes your raw text and breaks it into
          small, labelled pieces called <strong>tokens</strong>. Everything else in the compiler works
          on those tokens, never on the raw characters again.
        </p>
      </div>

      {/* What is a lexer */}
      <section className="panel space-y-5 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-zinc-900">What is a lexer?</h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-3 text-sm leading-7 text-zinc-700">
            <p>
              Think of a sentence. Before you can understand its meaning, you split it into words and
              check that each word is spelled correctly. A lexer does exactly that for code.
            </p>
            <p>
              It reads the file <strong>one character at a time</strong>. Each time the characters it
              has read so far match one of its rules, it packages them into a token and moves on.
            </p>
            <p>
              Beside spelling, it does not understand anything. It does not know that <em>read</em>{' '}
              means "open a file" — it only knows that <em>read</em> is a reserved word.
            </p>
          </div>

          <div className="space-y-3">
            <p className="label">Analogy</p>
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-4">
              <p className="font-mono text-xs leading-6 text-zinc-700">
                "{' '}She reads books{' '}"
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                → the words: She · reads · books
              </p>
              <p className="mt-3 font-mono text-xs leading-6 text-zinc-700">
                pipeline process_data
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                → the tokens: KEYWORD(pipeline) · IDENTIFIER(process_data)
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-bold text-blue-700">Reads characters</h3>
            <p className="mt-1 text-sm text-zinc-600">
              It walks the text from left to right, never reading backwards.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-bold text-blue-700">Groups them</h3>
            <p className="mt-1 text-sm text-zinc-600">
              Characters that together match a pattern become one token.
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <h3 className="text-sm font-bold text-blue-700">Skips the rest</h3>
            <p className="mt-1 text-sm text-zinc-600">
              Spaces and comments are matched, then thrown away.
            </p>
          </div>
        </div>
      </section>

      {/* What a token looks like */}
      <section className="panel space-y-5 p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">What a token looks like</h2>
          <p className="mt-1 text-sm text-zinc-600">
            A token is not just the text. It also records what kind of thing it is and where it was
            found.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Code>{`{
  "type":   "KEYWORD",   // what kind of token it is
  "value":  "pipeline",  // the exact characters
  "line":   1,           // where it starts (1-based)
  "column": 1
}`}</Code>

          <ul className="space-y-2 text-sm leading-7 text-zinc-700">
            <li>
              <strong className="text-zinc-900">type</strong> — the category, chosen by whichever
              rule matched.
            </li>
            <li>
              <strong className="text-zinc-900">value</strong> — the real text, so the next stage can
              use it.
            </li>
            <li>
              <strong className="text-zinc-900">line &amp; column</strong> — turn "there is a mistake"
              into "line 3, column 16".
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-base font-bold text-zinc-900">The token categories in Plumb</h3>
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr>
                  <th className="p-3 font-semibold uppercase tracking-wide">Type</th>
                  <th className="p-3 font-semibold uppercase tracking-wide">Pattern</th>
                  <th className="p-3 font-semibold uppercase tracking-wide">What it means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {TOKEN_CATEGORIES.map((row) => (
                  <tr key={row.type}>
                    <td className={`p-3 font-mono font-semibold ${TOKEN_COLORS[row.type] || 'text-zinc-700'}`}>
                      {row.type}
                    </td>
                    <td className="p-3 font-mono text-zinc-800">{row.pattern}</td>
                    <td className="p-3 font-sans text-zinc-600">{row.means}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Worked example */}
      <section className="panel space-y-5 p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Worked example</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Here is a real run: this text goes in, these tokens come out.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <p className="label mb-1.5">Input</p>
            <Code>{SAMPLE}</Code>
          </div>
          <div>
            <p className="label mb-1.5">Tokens out</p>
            <div className="overflow-x-auto rounded-xl border border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-500">
                  <tr>
                    <th className="p-2.5 font-semibold uppercase tracking-wide">Type</th>
                    <th className="p-2.5 font-semibold uppercase tracking-wide">Value</th>
                    <th className="p-2.5 font-semibold uppercase tracking-wide">Line : Col</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono">
                  {SAMPLE_TOKENS.map((t, i) => (
                    <tr key={i}>
                      <td className={`p-2.5 font-semibold ${TOKEN_COLORS[t.type] || 'text-zinc-700'}`}>
                        {t.type}
                      </td>
                      <td className="p-2.5 text-zinc-800">{t.value}</td>
                      <td className="p-2.5 text-zinc-500">
                        {t.line} : {t.column}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <p className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
          Notice what is <strong>missing</strong>: the spaces and the indentation produced no tokens.
          They were matched and skipped — but the tokens still report the correct line and column,
          because the lexer counts every character it walks past.
        </p>
      </section>

      {/* Rules to write a lexer */}
      <section className="panel space-y-5 p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">The rules for writing a lexer</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Seven rules that hold for almost every lexer, whatever the language.
          </p>
        </div>

        <ol className="space-y-3">
          {RULES.map((rule) => (
            <li key={rule.n} className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-4">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                {rule.n}
              </span>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">{rule.title}</h3>
                <p className="mt-1 text-sm leading-6 text-zinc-600">{rule.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Regex crash course */}
      <section className="panel space-y-6 p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">A quick regex crash course</h2>
          <p className="mt-1 text-sm text-zinc-600">
            A lexer rule is really just a pattern — a regular expression. These are the pieces you
            need, and the ones Plumb actually uses.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="p-3 font-semibold uppercase tracking-wide">Pattern</th>
                <th className="p-3 font-semibold uppercase tracking-wide">What it means</th>
                <th className="p-3 font-semibold uppercase tracking-wide">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {REGEX_BASICS.map((row, i) => (
                <tr key={i}>
                  <td className="p-3 font-mono font-semibold text-blue-700">{row.pattern}</td>
                  <td className="p-3 text-zinc-600">{row.means}</td>
                  <td className="p-3 font-mono text-zinc-500">{row.example}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          <h3 className="text-base font-bold text-zinc-900">
            Building Plumb&apos;s patterns, piece by piece
          </h3>
          <div className="grid gap-4 lg:grid-cols-2">
            {PLUM_PATTERNS.map((p) => (
              <div key={p.name} className="rounded-xl border border-zinc-200 bg-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h4 className="text-sm font-bold text-blue-700">{p.name}</h4>
                  <code className="font-mono text-xs text-zinc-800">{p.pattern}</code>
                </div>
                <ul className="mt-2 space-y-1">
                  {p.break.map((line, i) => (
                    <li key={i} className="flex gap-2 text-xs leading-6 text-zinc-600">
                      <span className="text-blue-400">›</span>
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* JFlex */}
      <section className="panel space-y-5 p-6 sm:p-8">
        <div>
          <h2 className="text-xl font-bold text-zinc-900">Writing a rule in JFlex</h2>
          <p className="mt-1 text-sm text-zinc-600">
            JFlex is the tool that turns a list of rules into working Java. Every rule has the same
            three parts.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              1 · Pattern
            </p>
            <p className="mt-1 text-sm text-zinc-600">What to look for.</p>
            <div className="mt-2">
              <Code>{String.raw`[a-zA-Z_][a-zA-Z0-9_]*`}</Code>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">
              2 · Action
            </p>
            <p className="mt-1 text-sm text-zinc-600">What to do when it matches.</p>
            <div className="mt-2">
              <Code>{`return new Token("IDENTIFIER", yytext());`}</Code>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
              3 · Fallback
            </p>
            <p className="mt-1 text-sm text-zinc-600">What to do when nothing fits.</p>
            <div className="mt-2">
              <Code>{`return new Token("ERROR", yytext());`}</Code>
            </div>
          </div>
        </div>

        <div>
          <p className="label mb-1.5">Two facts JFlex gives every action for free</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <code className="font-mono text-xs font-semibold text-blue-700">yytext()</code>
              <p className="mt-1 text-xs text-zinc-600">
                The exact characters that matched, e.g. "pipeline".
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
              <code className="font-mono text-xs font-semibold text-blue-700">yyline / yycolumn</code>
              <p className="mt-1 text-xs text-zinc-600">
                Where the match starts. Both count from 0, so we use +1.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Common mistakes */}
      <section className="panel space-y-5 p-6 sm:p-8">
        <h2 className="text-xl font-bold text-zinc-900">Common mistakes</h2>
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500">
              <tr>
                <th className="p-3 font-semibold uppercase tracking-wide">Mistake</th>
                <th className="p-3 font-semibold uppercase tracking-wide">What you see</th>
                <th className="p-3 font-semibold uppercase tracking-wide">Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {MISTAKES.map((m, i) => (
                <tr key={i}>
                  <td className="p-3 font-medium text-zinc-800">{m.problem}</td>
                  <td className="p-3 text-zinc-600">{m.result}</td>
                  <td className="p-3 text-zinc-600">{m.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
