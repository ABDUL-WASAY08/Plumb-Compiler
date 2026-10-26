# Plumb

A compiler for **Plumb**, a small domain-specific language (DSL) for describing data pipelines —
plus a web dashboard for writing Plumb code in the browser and seeing the compiler's output live.

You write something like this:

```plumb
pipeline process_data
    read "users.csv"
    filter age > 18
    transform name
    output "result.csv"
```

...and the project turns it into tokens, an abstract syntax tree, telemetry and JavaScript.

> **Project status — lexer stage.**
> The **frontend**, **backend** and the **lexer** are working end to end: type code in the browser,
> press Compile, and the real Java lexer returns the tokens. The parser, semantic analyser and code
> generator are planned (see [Roadmap](#roadmap)); the AST, Metrics and Settings screens are
> placeholders for now.

---

## Table of contents

- [What is Plumb](#what-is-plumb)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Repository layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Getting started](#getting-started)
- [How it works](#how-it-works)
- [API reference](#api-reference)
- [The Plumb language](#the-plumb-language)
- [Token reference](#token-reference)
- [Frontend](#frontend)
- [Compiler build](#compiler-build)
- [Environment variables](#environment-variables)
- [Troubleshooting](#troubleshooting)
- [Roadmap](#roadmap)
- [Further documentation](#further-documentation)

---

## What is Plumb

Plumb is a teaching-sized language for data pipelines. A program is a `pipeline` block containing a
few commands that read a CSV, filter rows, choose columns and write a result.

The project has three parts:

| Part          | What it is                                                        |
| ------------- | ----------------------------------------------------------------- |
| **Compiler**  | A Java lexer generated with JFlex. Turns Plumb text into tokens.  |
| **Backend**   | A Node/Express API that runs the lexer on demand and returns JSON.|
| **Frontend**  | A React dashboard to write Plumb and inspect the results.         |

The point is learning: every stage of a compiler is small, visible and explained in the UI.

---

## Architecture

```
┌──────────────────────────────┐
│  Frontend (React + Vite)     │  http://127.0.0.1:5174
│  CompilerScreen              │
└──────────────┬───────────────┘
               │  POST /api/tokenize   { "code": "pipeline ..." }
               ▼
┌──────────────────────────────┐
│  Backend (Node + Express)    │  http://localhost:5000
│  app.js → lexerRoutes        │
│  → LexerController.js        │
└──────────────┬───────────────┘
               │  execFile: java -cp <classes> LexerRunner "<code>"
               ▼
┌──────────────────────────────┐
│  Compiler (Java + JFlex)     │
│  PlumbLexer.yylex()          │  generated from plumb.jflex
│  LexerRunner                 │  prints JSON to stdout
└──────────────┬───────────────┘
               │  stdout: [ { "type": "KEYWORD", "value": "pipeline", ... } ]
               ▼
        JSON back up to the browser
```

The backend never parses Plumb itself. It is a thin bridge: **text in → run the Java lexer → JSON
out**.

---

## Tech stack

| Layer            | Choice                                                             |
| ---------------- | ------------------------------------------------------------------ |
| Lexer            | Java 17 + [JFlex](https://jflex.de/) 1.9.1                         |
| Compiler build   | [Gradle](https://gradle.org/) (Java + application plugins)          |
| Backend          | Node.js + [Express](https://expressjs.com/) 5, `cors`               |
| Frontend         | [React](https://react.dev/) 18 + [Vite](https://vitejs.dev/) 5      |
| Routing          | [React Router](https://reactrouter.com/) 6                          |
| Styling          | [Tailwind CSS](https://tailwindcss.com/) 3                         |
| HTTP client      | [axios](https://axios-http.com/)                                    |
| Icons            | [Lucide React](https://lucide.dev/)                                 |

---

## Repository layout

```
Plumb/
├── Compiler/                       # Java lexer (JFlex + Gradle)
│   ├── build.gradle                # generates the lexer, compiles, runs
│   ├── settings.gradle
│   └── src/main/
│       ├── Jflex/plumb.jflex       # ← the lexer rules (the only file you author)
│       └── java/LexerRunner.java   # ← main() that prints tokens as JSON
│
├── Backend/                        # Node + Express API
│   ├── app.js                      # server, CORS, JSON, mounts /api
│   ├── package.json
│   └── src/
│       ├── Controller/LexerController.js   # runs the Java lexer
│       └── Routes/lexerRoutes.js           # POST /tokenize
│
├── frontend/                       # React + Vite dashboard
│   ├── index.html
│   ├── vite.config.js              # dev port 5174
│   ├── tailwind.config.js          # design tokens
│   └── src/
│       ├── api/axios.js            # shared axios client
│       ├── components/
│       │   ├── Header.jsx
│       │   └── SidebarNavigation.jsx
│       ├── screens/
│       │   ├── CompilerScreen.jsx  # write code, press Compile, see tokens
│       │   ├── About.jsx           # tabs: Pipeline | Lexer
│       │   ├── Lexer.jsx           # the Lexer learning tab
│       │   ├── ASTScreen.jsx       # placeholder
│       │   ├── MetricsScreen.jsx   # placeholder
│       │   └── SettingsScreen.jsx  # placeholder
│       ├── App.jsx                 # layout + routes
│       ├── index.css               # Tailwind + component classes
│       └── main.jsx
│
├── CODE_NOTES.md                   # code-level walkthrough of every file
└── README.md
```

---

## Prerequisites

| Tool    | Version | Why                                   |
| ------- | ------- | ------------------------------------- |
| Node.js | 18+     | backend + frontend                    |
| JDK     | 17      | the compiler                          |
| Gradle  | 8+ / 9  | building the compiler (or use the wrapper) |
| npm     | any recent | installing frontend/backend packages |

Gradle is often not on the `PATH`. Either run it with its full path, or create a wrapper once
(`gradle wrapper`) and use `gradlew` from then on.

---

## Getting started

Three terminals, in this order.

### 1. Build the compiler

If you don't have a `gradlew` wrapper yet, create one with `gradle wrapper` (once). Otherwise
replace `gradlew` below with the full path to your Gradle launcher.

```bash
cd Compiler
gradle wrapper                                  # once only, if ./gradlew is missing
gradlew build                                   # generates the lexer + compiles
gradlew run --args="pipeline process_data read" # sanity check (prints tokens)
```

Expected output:

```json
[{"type":"KEYWORD","value":"pipeline","line":1,"column":1},
 {"type":"IDENTIFIER","value":"process_data","line":1,"column":10},
 {"type":"KEYWORD","value":"read","line":1,"column":23}]
```

This produces `Compiler/build/classes/java/main/`, which the backend runs.

### 2. Start the backend

```bash
cd Backend
npm install
npm run dev          # http://localhost:5000
```

### 3. Start the frontend

```bash
cd frontend
npm install
npm run dev          # http://127.0.0.1:5174
```

Open <http://127.0.0.1:5174>, go to **Compiler**, edit the sample, and press **Compile** — the token
table fills with the lexer's real output.

---

## How it works

1. **You type Plumb** into the editor on the Compiler screen.
2. Pressing **Compile** sends `POST /api/tokenize` with `{ "code": "..." }`.
3. `app.js` enables CORS + JSON parsing and routes `/api` to `lexerRoutes`.
4. `lexerRoutes` maps `/tokenize` to `LexerController.tokenizeCode`.
5. The controller resolves where the compiled Java classes live, then runs
   `java -cp <classes> LexerRunner "<code>"` with `execFile` (no shell, so the code is passed
   exactly as written).
6. `LexerRunner` feeds the text to `PlumbLexer`, loops `yylex()` collecting tokens, and prints a
   JSON array to `stdout`.
7. The controller `JSON.parse`s that output and replies `200 { tokens: [...] }`.
8. The frontend renders the table.

Nothing is executed — the lexer only reads and classifies text.

---

## API reference

Base URL: `http://localhost:5000`

### `POST /api/tokenize`

Runs the lexer over a piece of Plumb source.

**Request**

```http
POST /api/tokenize
Content-Type: application/json

{ "code": "pipeline process_data\n    read \"users.csv\"" }
```

**Response — `200 OK`**

```json
{
  "tokens": [
    { "type": "KEYWORD",    "value": "pipeline",    "line": 1, "column": 1  },
    { "type": "IDENTIFIER", "value": "process_data","line": 1, "column": 10 },
    { "type": "KEYWORD",    "value": "read",        "line": 2, "column": 5  },
    { "type": "STRING",     "value": "\"users.csv\"","line": 2, "column": 10 }
  ]
}
```

**Errors**

| Status | Body                                              | When                                  |
| ------ | ------------------------------------------------- | ------------------------------------- |
| `400`  | `{ "error": "No code provided" }`                 | `code` is missing from the body       |
| `500`  | `{ "error": "Lexer classes not found. …" }`       | the compiler was never built          |
| `500`  | `{ "error": "<java stderr>" }`                    | the JVM failed to run the lexer       |
| `500`  | `{ "error": "Invalid output format from lexer" }` | the lexer did not print clean JSON    |

---

## The Plumb language

| Command                  | Meaning                                     |
| ------------------------ | ------------------------------------------- |
| `pipeline name`          | Starts a pipeline and names it              |
| `read "file.csv"`        | Reads input data from a CSV file            |
| `filter column op value` | Keeps rows matching a condition             |
| `transform a, b, ...`    | Keeps the listed columns                    |
| `output "file.csv"`      | Writes the result to a CSV file             |
| `log "message"`          | Prints a message while the pipeline runs    |

**Operators:** `>`, `<`, `>=`, `<=`, `==`, `!=` (the rule also accepts the symbols `+ - * / = !`)
**Comments:** start with `#` and run to the end of the line

---

## Token reference

Every token carries a `type`, the exact `value` text, and its `line` / `column` (1-based).

| Type         | Matches                                             | Example                |
| ------------ | --------------------------------------------------- | ---------------------- |
| `KEYWORD`    | reserved words                                      | `pipeline`, `filter`   |
| `IDENTIFIER` | names: `[a-zA-Z_][a-zA-Z0-9_]*`                     | `process_data`, `age`  |
| `NUMBER`     | `[0-9]+(\.[0-9]+)?([eE][+-]?[0-9]+)?`               | `18`, `2.5`, `1e9`     |
| `STRING`     | double-quoted text                                  | `"users.csv"`          |
| `OPERATOR`   | `[\+\-\*/<>=!]=?`                                   | `>`, `>=`, `==`        |
| `COMMA`      | `,`                                                  | `,`                    |
| `ERROR`      | any single character no other rule matched          | `@`, `$`               |

Whitespace, indentation and comments are matched and discarded — they never become tokens.

---

## Frontend

Single-page React app, styled with Tailwind, routed with React Router.

| Route       | Screen            | Status                                    |
| ----------- | ----------------- | ----------------------------------------- |
| `/`         | `CompilerScreen`  | **Working** — compiles code, shows tokens |
| `/about`    | `About`           | **Working** — tabs: Pipeline · Lexer      |
| `/ast`      | `ASTScreen`       | Placeholder                               |
| `/metrics`  | `MetricsScreen`   | Placeholder                               |
| `/settings` | `SettingsScreen`  | Placeholder                               |
| `*`         | —                 | Redirects to `/`                          |

The **About** page has two tabs. **Pipeline** walks through all eight compiler phases one at a time
with a slow timer and a live explanation panel. **Lexer** is a learning page: what a lexer is, the
rules for writing one, a regex crash course, and how Plumb's own patterns are built.

The HTTP client lives in `src/api/axios.js` and reads `VITE_API_BASE_URL` (default
`http://localhost:5000`).

---

## Compiler build

Everything is automated by Gradle — you never run `jflex` or `javac` by hand. (`gradlew` below means
the wrapper; run `gradle wrapper` once to create it, or use your full path to Gradle.)

| Command                                    | What it does                                          |
| ------------------------------------------ | ----------------------------------------------------- |
| `gradlew build`                            | Generates the lexer, compiles, and packages the jar    |
| `gradlew run --args="<code>"`              | Builds and runs the lexer on the given code            |
| `gradlew clean`                            | Deletes `build/`                                        |
| `gradlew generateLexer`                    | Only regenerates `PlumbLexer.java` from `plumb.jflex`  |
| `gradlew copyLibs`                         | Copies dependency jars into `lib/` for manual commands |

How it hangs together:

- `plumb.jflex` → `generateLexer` (a `JavaExec` task running JFlex) → `build/generated/jflex/java/PlumbLexer.java`
- that folder is added as a Java source root, so `compileJava` compiles it together with `LexerRunner.java`
- output lands in `build/classes/java/main/`, exactly where the backend looks

To change the language, edit **`src/main/Jflex/plumb.jflex`** and rebuild. Generated files under
`build/` are never edited by hand.

---

## Environment variables

**frontend/.env**

```env
VITE_API_BASE_URL=http://localhost:5000
```

Only variables prefixed with `VITE_` are exposed to the browser. If the file is missing, the client
falls back to `http://localhost:5000`.

**Backend**

| Variable | Default | Purpose             |
| -------- | ------- | ------------------- |
| `PORT`   | `5000`  | port the API listens on |

---

## Troubleshooting

| Symptom                                          | Cause                                          | Fix                                             |
| ------------------------------------------------ | ---------------------------------------------- | ----------------------------------------------- |
| `ClassNotFoundException: LexerRunner`            | compiler not built                             | `cd Compiler && gradlew build`                  |
| `Lexer classes not found` (500)                  | no `build/` output                             | same as above                                   |
| `Cannot POST /api/tokenize` (404)                | an old backend is still on the port            | stop it and restart `npm run dev`               |
| Browser blocks the request / CORS error          | backend not running, or CORS missing           | start the backend (`app.js` enables CORS)       |
| `{ "error": "No code provided" }` (400)          | body is not JSON or `code` is missing          | send `Content-Type: application/json`           |
| Everything shows `ERROR` tokens                  | a character matched no rule                    | check spelling, or add a rule to `plumb.jflex`  |
| Port 5174 / 4174 / 5000 already in use           | another instance is running                    | stop it, or set `PORT` for the backend          |

---

## Roadmap

- [x] **Lexer** — JFlex lexer, Gradle automation, JSON output
- [x] **Backend API** — `POST /api/tokenize`, CORS
- [x] **Compiler screen** — write code, compile, view tokens
- [x] **Learning pages** — the Pipeline walkthrough and the Lexer guide
- [ ] **Parser** — build an AST from the tokens (CUP or hand-written)
- [ ] **Semantic analysis** — symbol table, type and order checks
- [ ] **Code generation** — emit JavaScript from the tree
- [ ] **AST viewer** — expandable tree with a node inspector
- [ ] **Metrics** — compile time, token counts, token distribution
- [ ] **Settings** — theme, backend URL, compiler strictness

---

## Further documentation

- **[CODE_NOTES.md](./CODE_NOTES.md)** — a line-by-line walkthrough of what every file does, what it
  returns, and the full request journey, with worked examples and an error→fix table.

---

## License

Part of the Plumb toolchain. Refer to the repository owner for licensing details.
