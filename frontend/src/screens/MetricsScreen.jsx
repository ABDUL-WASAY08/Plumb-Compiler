import { AlertTriangle, BarChart3, Clock, Hash } from 'lucide-react'

const CARDS = [
  { icon: Clock, label: 'Compile time', value: '—' },
  { icon: Hash, label: 'Tokens', value: '—' },
  { icon: AlertTriangle, label: 'Errors', value: '—' },
]

export default function MetricsScreen() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {CARDS.map(({ icon: Icon, label, value }) => (
          <div key={label} className="panel p-5">
            <div className="flex items-center gap-2 text-zinc-500">
              <Icon size={16} />
              <span className="label">{label}</span>
            </div>
            <p className="mt-3 text-3xl font-bold text-zinc-900">{value}</p>
          </div>
        ))}
      </div>

      <section className="panel p-6 sm:p-8">
        <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
            <BarChart3 size={26} />
          </span>

          <div className="space-y-1">
            <h2 className="text-base font-semibold text-zinc-900">No runs recorded</h2>
            <p className="mx-auto max-w-md text-sm leading-6 text-zinc-600">
              Compile something on the Compiler page and the timing, token counts and distribution
              charts for each run will build up here.
            </p>
          </div>

          <span className="badge border-amber-200 bg-amber-50 text-amber-700">Planned</span>
        </div>
      </section>
    </div>
  )
}
