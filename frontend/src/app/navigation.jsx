import { BarChart3, BookOpen, Code2, GitBranch, Settings } from 'lucide-react';

// Single source of truth for the sidebar and the page header.
// Every route carries its own label (sidebar) and title/subtitle (header).
export const NAV_SECTIONS = [
  {
    title: 'Workspace',
    items: [
      {
        to: '/',
        label: 'Compiler',
        icon: Code2,
        end: true,
        eyebrow: 'Workspace',
        title: 'Compiler',
        subtitle: 'Write Plumb source and tokenise it with the real Java lexer.',
      },
      {
        to: '/ast',
        label: 'AST Viewer',
        icon: GitBranch,
        eyebrow: 'Workspace',
        title: 'AST Viewer',
        subtitle: 'Inspect the syntax tree the parser builds from the token stream.',
      },
      {
        to: '/metrics',
        label: 'Metrics',
        icon: BarChart3,
        eyebrow: 'Workspace',
        title: 'Metrics',
        subtitle: 'Compile time, token counts and distribution for each run.',
      },
    ],
  },
  {
    title: 'Learn',
    items: [
      {
        to: '/about',
        label: 'Study',
        icon: BookOpen,
        eyebrow: 'Learn',
        title: 'How the Compiler Works',
        subtitle:
          'Walk the full pipeline phase by phase, then dig into how the lexer actually works.',
      },
    ],
  },
  {
    title: 'System',
    items: [
      {
        to: '/settings',
        label: 'Settings',
        icon: Settings,
        eyebrow: 'System',
        title: 'Settings',
        subtitle: 'Preferences for the dashboard and the compiler backend.',
      },
    ],
  },
];

export const NAV_ITEMS = NAV_SECTIONS.flatMap((section) => section.items);

export function findNavItem(pathname) {
  return NAV_ITEMS.find((item) => item.to === pathname) ?? NAV_ITEMS[0];
}
