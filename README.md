# Plumb — Developer Dashboard (Frontend)

The frontend for **Plumb**, a lightweight Domain-Specific Language (DSL) for describing
simple data pipelines. The dashboard is a React single-page application that gives
developers a clean, navigable workspace for writing Plumb programs and, in later phases,
compiling them and inspecting the resulting AST, telemetry and generated JavaScript.

Built with **Vite + React** and styled with **Tailwind CSS**. Icons are provided by
**Lucide React**, and client-side navigation uses **React Router**.

> **Project status — Phase 1 (UI shell).**
> This repository currently contains the **presentation layer only**: the screen files
> (`src/screens/*.jsx`) and the shared layout components (`Header`, `SidebarNavigation`),
> wired together with client-side routing. There is **no application logic, no sample/dummy
> data, and no backend integration** yet — every screen is an intentional, data-free
> placeholder. Compilation, telemetry and API behaviour are described under
> [Roadmap](#roadmap) and [Backend API contract](#backend-api-contract) as planned work.

## Overview

Plumb lets a developer express a data pipeline in a small, readable syntax:

```
pipeline process_data
    read "users.csv"
    filter age > 18
    transform name
    output "result.csv"
```

This frontend is the user-facing half of that tool. In its finished form it will let a
developer write `.plb` source, send it to a compiler backend, and review the compile
result — timing and token statistics, a diagnostics list, an abstract syntax tree, and the
transpiled JavaScript — all from one screen.

## Tech stack

| Layer            | Choice                                                   |
| ---------------- | -------------------------------------------------------- |
| Build tool       | [Vite](https://vitejs.dev/) 5                            |
| UI library       | [React](https://react.dev/) 18 (function components)     |
| Routing          | [React Router](https://reactrouter.com/) 6               |
| Styling          | [Tailwind CSS](https://tailwindcss.com/) 3 + PostCSS     |
| Icons            | [Lucide React](https://lucide.dev/)                       |
| Language         | JavaScript (ESM) / JSX                                   |

## Screens & routing

Navigation is managed by **React Router** via `SidebarNavigation`, which renders a set of
`NavLink`s. The active route is highlighted; unknown routes redirect to the home screen.

| Route       | Component             | Purpose                                            |
| ----------- | --------------------- | -------------------------------------------------- |
| `/`         | `CompilerScreen`      | Primary workspace (default view)                   |
| `/ast`      | `ASTScreen`           | Abstract syntax tree inspection                    |
| `/metrics`  | `MetricsScreen`       | Compilation analytics and telemetry                |
| `/about`    | `AboutScreen`         | Project information                                |
| `/settings` | `SettingsScreen`      | Developer preferences                              |
| `*`         | —                     | Redirects to `/`                                   |

Each screen is a self-contained placeholder section styled with the shared `panel` class.
Screens contain no state, data or side effects at this phase.

### Layout components

| Component            | Responsibility                                             |
| -------------------- | ---------------------------------------------------------- |
| `Header.jsx`         | Top bar with the Plumb wordmark and subtitle              |
| `SidebarNavigation.jsx` | Primary navigation; a horizontal bar on mobile, a vertical sidebar on large screens |

## Project structure

```
frontend/
├── public/
│   └── favicon.svg          # Site favicon
├── src/
│   ├── components/
│   │   ├── Header.jsx           # Top bar / wordmark
│   │   └── SidebarNavigation.jsx# Primary navigation (React Router NavLinks)
│   ├── screens/
│   │   ├── AboutScreen.jsx      # About the project
│   │   ├── ASTScreen.jsx        # AST inspection view
│   │   ├── CompilerScreen.jsx   # Main workspace view
│   │   ├── MetricsScreen.jsx    # Analytics view
│   │   └── SettingsScreen.jsx   # Preferences view
│   ├── App.jsx              # Layout shell + route definitions
│   ├── index.css            # Tailwind directives, design tokens, component classes
│   └── main.jsx             # Application entry point (mounts <App/> in <BrowserRouter/>)
├── .env.example             # Example environment variables
├── index.html               # Root HTML document
├── package.json             # Scripts and dependencies
├── postcss.config.js        # PostCSS (Tailwind + Autoprefixer)
├── tailwind.config.js       # Tailwind theme (design tokens, animations)
└── vite.config.js           # Vite configuration (React plugin, dev/preview ports)
```

## Getting started

### Prerequisites

- **Node.js** 18 or newer
- A package manager — **npm**, **yarn** or **pnpm**

### Install

```bash
cd frontend
npm install
```

### Environment (optional)

Copy the example file if you plan to point the dashboard at a backend:

```bash
cp .env.example .env
```

See [Environment variables](#environment-variables) for the available keys. The app runs
without a `.env` file at this phase.

### Development server

```bash
npm run dev
```

Starts Vite with hot-module reload on **<http://127.0.0.1:5174>** (the port is fixed; see
`vite.config.js`).

### Build & preview

```bash
npm run build     # production bundle into dist/
npm run preview   # serve the built bundle on http://127.0.0.1:4174
```

### npm scripts

| Script            | Description                            |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Start the Vite dev server with HMR     |
| `npm run build`   | Production build into `dist/`          |
| `npm run preview` | Preview the production build locally   |

## Environment variables

Vite only exposes variables prefixed with `VITE_`. Create a `.env` file (see
`.env.example`):

```env
# Base URL of the Plumb backend API.
VITE_API_BASE_URL=http://localhost:5000/api

# When "true", compile locally in the browser instead of calling the backend.
VITE_USE_MOCK_COMPILER=false
```

These keys are reserved for the backend integration planned below; they are not consumed by
any code at this phase.

## Design system

Styling is centralised so screens stay consistent and free of ad-hoc CSS.

- **Theme tokens** live in `tailwind.config.js`: a violet `accent` palette, the
  `brand-gradient` background, glow shadows, and keyframe animations (`fade-up`,
  `fade-in`, `scale-in`, `float`, `gradient-pan`, and others).
- **Component classes** live in `src/index.css` under `@layer components`:
  `.panel`, `.panel-header`, `.panel-title`, `.btn` / `.btn-primary` / `.btn-outline` /
  `.btn-ghost`, `.input`, `.label`, `.tag`, `.badge`, and `.text-gradient`.
- **Dark mode** uses Tailwind's `class` strategy — the `<html>` element carries `dark`.
  The base document is dark by default (`index.html`).
- **Accessibility**: a visible `:focus-visible` ring is defined globally, and animation is
  reduced for users who prefer reduced motion.
- **Responsiveness**: layouts use Tailwind breakpoints; the sidebar becomes a horizontal
  scroll bar below the `lg` breakpoint, and content is constrained to a `max-w-6xl` grid.

When adding a screen, compose it from the `panel` classes and reuse the existing tokens
rather than introducing new colors or spacing scales.

## Roadmap

The screens are placeholders today. The following capabilities are planned, in the order
they are typically built:

1. **Compiler workspace** — a line-numbered `.plb` editor, a compile/clear toolbar, and
   live telemetry cards (compile time, token count, AST nodes, errors, warnings, status).
2. **AST viewer** — an expandable, collapsible syntax tree with a node inspector showing
   node type, source position and children.
3. **Metrics & telemetry** — token-distribution breakdown, compilation-trend charts, and a
   history of recent runs.
4. **Settings** — theme selection, backend base URL, and compiler strictness flags.
5. **Backend integration** — send source to the compiler API and render the response
   (see below), with a local fallback so the UI still works when the backend is offline.

## The Plumb language (quick reference)

```
pipeline process_data
    read "users.csv"
    filter age > 18
    transform name
    output "result.csv"
```

| Command                    | Meaning                                  |
| -------------------------- | ---------------------------------------- |
| `pipeline name`            | Starts a pipeline and names it           |
| `read "file.csv"`          | Reads input data from a CSV file         |
| `filter column op value`   | Keeps rows matching a condition          |
| `transform a, b, ...`      | Keeps the listed columns                 |
| `output "file.csv"`        | Writes the result to a CSV file          |
| `log "message"`            | Prints a message while the pipeline runs |

**Operators:** `>`, `<`, `>=`, `<=`, `==`, `!=`
**Comments:** start with `#`

## Backend API contract

_Planned — not implemented at this phase._ The dashboard will POST the editor contents to
the compiler service.

**Request** — `POST {VITE_API_BASE_URL}/compile`

```json
{
  "code": "pipeline process_data\n    read \"users.csv\"\n    filter age > 18\n    output \"result.csv\""
}
```

**Response**

```json
{
  "status": "success",
  "compilationTime": 24,
  "tokenCount": 12,
  "astNodes": 9,
  "errors": 0,
  "warnings": 0,
  "astTree": { "...": "..." },
  "generatedCode": "const data = readCSV(\"users.csv\");\nconst filtered = data.filter(r => r.age > 18);\nwriteCSV(filtered, \"result.csv\");"
}
```

Optional fields the UI is designed to understand when present: `tokens`, `symbols`,
`diagnostics` (`{ severity, type, line, column, message, suggestion }[]`) and
`tokenDistribution` (`{ label, count, percent }[]`). Any field the backend omits is
expected to be derived or defaulted so the interface never breaks.

### Graceful fallback

To keep the UI usable without a running backend, the integration is planned to fall back to
an in-browser reference compiler when `VITE_USE_MOCK_COMPILER=true` or the API is
unreachable, and to surface a notice whenever results come from that fallback.

## License

This project is part of the Plumb toolchain. Refer to the repository owner for licensing
details.
