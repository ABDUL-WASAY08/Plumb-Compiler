import { Bell, Palette, Server } from 'lucide-react'

const PREFERENCES = [
  {
    icon: Palette,
    label: 'Theme',
    value: 'Light',
    hint: 'Colour scheme used across the dashboard.',
  },
  {
    icon: Server,
    label: 'Backend URL',
    value: 'http://localhost:5000',
    hint: 'Where the tokeniser API is running.',
  },
  {
    icon: Bell,
    label: 'Notifications',
    value: 'On',
    hint: 'Toast messages for compile results and errors.',
  },
]

export default function SettingsScreen() {
  return (
    <section className="panel divide-y divide-zinc-200">
      {PREFERENCES.map(({ icon: Icon, label, value, hint }) => (
        <div key={label} className="flex items-center gap-4 p-5 sm:p-6">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
            <Icon size={18} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-900">{label}</p>
            <p className="text-xs text-zinc-500">{hint}</p>
          </div>

          <span className="badge shrink-0">{value}</span>
        </div>
      ))}

      <p className="p-5 text-xs text-zinc-500 sm:p-6">
        Static preview — these controls are not wired up yet.
      </p>
    </section>
  )
}
