export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex items-center gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
          P
        </div>
        <div>
          <h1 className="font-semibold text-zinc-900">Plumb</h1>
          <p className="text-xs text-zinc-500">Developer dashboard</p>
        </div>
      </div>
    </header>
  )
}
