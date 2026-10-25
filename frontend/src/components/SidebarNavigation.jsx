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
    <nav
      aria-label="Main navigation"
      className="flex w-full shrink-0 gap-2 overflow-x-auto border-b border-zinc-200 bg-white p-3 lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:flex-col lg:gap-1 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:p-4"
    >
      <p className="hidden px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-zinc-400 lg:block">
        Menu
      </p>
      {links.map(({ to, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors lg:block ${
              isActive
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-zinc-600 hover:bg-blue-50 hover:text-blue-700'
            }`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
