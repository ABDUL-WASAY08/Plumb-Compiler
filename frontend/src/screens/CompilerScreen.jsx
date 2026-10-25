import { useState } from 'react';

// Sample Plumb code initial text ke taur par
const DEFAULT_PLUMB_CODE = `pipeline process_data
    read "users.csv"
    filter age > 18
    transform name
    output "result.csv"`;

export default function CompilerScreen() {
  const [code, setCode] = useState(DEFAULT_PLUMB_CODE);

  const handleCompile = () => {
    console.log("Compiling Plumb Code:\n", code);
    alert("Compile button clicked! Phir jab backend ready hoga tab yahan se API hit hogi.");
  };

  const handleClear = () => {
    setCode('');
  };

  return (
    <section className="panel p-6 sm:p-8 space-y-6">
      <div>
        <p className="text-sm font-medium text-blue-600">Plumb Compiler</p>
        <h2 className="mt-1 text-2xl font-semibold text-zinc-900">Workspace</h2>
      </div>
      <div className="rounded-xl border border-zinc-200 bg-zinc-900 dark:border-zinc-800 shadow-lg overflow-hidden">
        {/* Editor Title Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-800/80 border-b border-zinc-700/50">
          <span className="text-xs font-mono text-zinc-400">main.plb</span>
          <span className="text-xs text-zinc-500">Plumb DSL</span>
        </div>

        {/* Textarea for Plumb Code */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your Plumb DSL code here..."
          rows={10}
          className="w-full p-4 font-mono text-sm bg-transparent text-emerald-400 placeholder-zinc-600 focus:outline-none resize-y"
          spellCheck={false}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={handleCompile}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow-md active:scale-95"
        >
          Compile
        </button>
        <button
          onClick={handleClear}
          className="px-6 py-2.5 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded-lg text-sm transition-colors active:scale-95"
        >
          Clear
        </button>
      </div>
    </section>
  );
}