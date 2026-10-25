export default function Header() {
  return (
    <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-4 sm:px-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 font-bold text-white">
          P
        </div>
        <div>
          <h1 className="font-semibold text-zinc-900 dark:text-white">Plumb</h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">Developer dashboard</p>
        </div>
      </div>
    </header>
  )
}
