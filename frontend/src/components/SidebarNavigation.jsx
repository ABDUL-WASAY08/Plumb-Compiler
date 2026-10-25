import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Compiler', end: true },
  { to: '/ast', label: 'AST Viewer' },
  { to: '/metrics', label: 'Metrics' },
  { to: '/about', label: 'About' },
  { to: '/settings', label: 'Settings' },
]

export default function SidebarNavigation() {
  return (
    <nav aria-label="Main navigation" className="panel flex gap-2 overflow-x-auto p-2 lg:flex-col">
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? 'bg-violet-600 text-white'
                : 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
