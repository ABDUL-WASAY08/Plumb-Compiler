import { GitBranch } from 'lucide-react'

export default function ASTScreen() {
  return (
    <section className="panel p-6 sm:p-8">
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-100 text-zinc-500">
          <GitBranch size={26} />
        </span>

        <div className="space-y-1">
          <h2 className="text-base font-semibold text-zinc-900">No syntax tree yet</h2>
          <p className="mx-auto max-w-md text-sm leading-6 text-zinc-600">
            The token stream works today, but the parser is not built yet. Once it is, this page will
            show the abstract syntax tree for your last compile as an expandable node browser.
          </p>
        </div>

        <span className="badge border-amber-200 bg-amber-50 text-amber-700">Planned</span>
      </div>
    </section>
  )
}
