export default function AboutScreen() {
  return (
    <section className="panel p-6 sm:p-8">
      <p className="text-sm font-medium text-violet-600 dark:text-violet-400">Information</p>
      <h2 className="mt-2 text-2xl font-semibold text-zinc-900 dark:text-white">About Plumb</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 dark:text-zinc-400">
        Plumb is a small language for describing data pipelines. This frontend is a simple,
        navigable screen mockup built with React and JSX.
      </p>
    </section>
  )
}
