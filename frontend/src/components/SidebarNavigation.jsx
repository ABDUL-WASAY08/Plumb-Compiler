import { Fragment } from 'react';
import { NavLink } from 'react-router-dom';
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { NAV_SECTIONS } from '../app/navigation';

// Vertical, collapsible sidebar on large screens; a horizontal scroll bar on mobile.
export default function SidebarNavigation({ collapsed = false, onToggle }) {
  return (
    <nav
      aria-label="Main navigation"
      className={`flex w-full shrink-0 items-center gap-2 overflow-x-auto border-b border-zinc-200 bg-white/85 p-3 backdrop-blur transition-[width] duration-200 lg:sticky lg:top-0 lg:h-screen lg:flex-col lg:items-stretch lg:gap-0 lg:overflow-y-auto lg:border-b-0 lg:border-r ${
        collapsed ? 'lg:w-[76px]' : 'lg:w-64'
      }`}
    >
      {/* Brand + collapse toggle */}
      <div className="flex shrink-0 items-center gap-2 lg:pb-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-zinc-900 text-sm font-bold text-white">
          P
        </span>
        <span
          className={`text-sm font-semibold tracking-widest text-zinc-900 ${
            collapsed ? 'lg:hidden' : ''
          }`}
        >
          PLUMB
        </span>

        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="ml-auto hidden rounded-lg p-1.5 text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 lg:block"
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {NAV_SECTIONS.map((section, index) => (
        <Fragment key={section.title}>
          {/* Clear division between groups */}
          {index > 0 && (
            <div
              aria-hidden="true"
              className={`hidden shrink-0 bg-zinc-200 lg:block ${
                collapsed ? 'mx-auto my-3 h-px w-8' : 'my-3 h-px w-full'
              }`}
            />
          )}

          <p
            className={`hidden shrink-0 px-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-zinc-400 ${
              collapsed ? 'lg:hidden' : 'lg:block'
            }`}
          >
            {section.title}
          </p>

          <div className="flex shrink-0 items-center gap-1 lg:flex-col lg:items-stretch lg:gap-1">
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                title={collapsed ? item.label : undefined}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    collapsed ? 'lg:justify-center lg:px-0' : ''
                  } ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-zinc-600 hover:bg-blue-50 hover:text-blue-700'
                  }`
                }
              >
                <item.icon size={18} className="shrink-0" />
                <span className={`whitespace-nowrap ${collapsed ? 'lg:hidden' : ''}`}>
                  {item.label}
                </span>
              </NavLink>
            ))}
          </div>
        </Fragment>
      ))}
    </nav>
  );
}
