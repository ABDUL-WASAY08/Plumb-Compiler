import { useState } from 'react';
import api from '../api/axios';
import { showToast } from '../utils/notifications';

const DEFAULT_PLUMB_CODE = `pipeline process_data
    read "users.csv"
    filter age > 18
    transform name
    output "result.csv"`;

const TOKEN_COLORS = {
  KEYWORD: 'text-blue-400',
  IDENTIFIER: 'text-violet-300',
  NUMBER: 'text-emerald-400',
  STRING: 'text-amber-300',
  OPERATOR: 'text-cyan-300',
  COMMA: 'text-zinc-400',
  ERROR: 'text-red-400',
};

export default function CompilerScreen() {
  const [code, setCode] = useState(DEFAULT_PLUMB_CODE);
  const [tokens, setTokens] = useState([]);
  const [compiled, setCompiled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCompile = async () => {
    setLoading(true);
    setError('');

    try {

      const response = await api.post('/api/tokenize', { code });
      const nextTokens = response.data.tokens || [];

      setTokens(nextTokens);
      setCompiled(true);
      showToast.success(`Lexed ${nextTokens.length} token(s)`);
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Failed to tokenize code';

      setTokens([]);
      setCompiled(false);
      setError(message);
      showToast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setCode('');
    setTokens([]);
    setCompiled(false);
    setError('');
    showToast.info('Workspace cleared');
  };

  return (
    <section className="panel p-6 sm:p-8 space-y-6">
      <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg">
        <div className="flex items-center justify-between border-b border-zinc-700/50 bg-zinc-800/80 px-4 py-2">
          <span className="font-mono text-xs text-zinc-400">main.plb</span>
          <span className="text-xs text-zinc-500">Plumb DSL</span>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Write your Plumb DSL code here..."
          rows={8}
          className="w-full resize-y bg-transparent p-4 font-mono text-sm text-emerald-400 placeholder-zinc-600 focus:outline-none"
          spellCheck={false}
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleCompile}
          disabled={loading}
          className="cursor-pointer rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white shadow-md transition-colors hover:bg-blue-700 active:scale-95 disabled:bg-blue-800/50"
        >
          {loading ? 'Compiling...' : 'Compile'}
        </button>
        <button
          onClick={handleClear}
          className="cursor-pointer rounded-lg bg-zinc-200 px-6 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-300 active:scale-95"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-800 bg-red-950/60 p-4 font-mono text-sm text-red-300">
          ⚠️ <strong>Lexer Error:</strong> {error}
        </div>
      )}

      {compiled && (
        <>
        <span className='text-blue-900 text-lg font-bold  mt-10'>Lexer</span>
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900 shadow-lg">
            <div className="flex items-center justify-between border-b border-zinc-700/50 bg-zinc-800/80 px-4 py-2.5">
              <span className="font-mono text-xs font-semibold text-zinc-300">Generated Tokens</span>
              <span className="font-mono text-[11px] text-zinc-500">{tokens.length} token(s)</span>
            </div>

            {tokens.length === 0 ? (
              <p className="p-4 font-mono text-xs text-zinc-500">No tokens produced.</p>
            ) : (
              <div className="max-h-72 overflow-x-auto">
                <table className="w-full border-collapse text-left font-mono text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-400">
                      <th className="px-4 py-2.5 font-medium">#</th>
                      <th className="px-4 py-2.5 font-medium">Type</th>
                      <th className="px-4 py-2.5 font-medium">Lexeme (Value)</th>
                      <th className="px-4 py-2.5 font-medium">Line</th>
                      <th className="px-4 py-2.5 font-medium">Col</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {tokens.map((tok, idx) => (
                      <tr key={idx} className="hover:bg-zinc-800/40">
                        <td className="px-4 py-2 text-zinc-500">{idx + 1}</td>
                        <td
                          className={`px-4 py-2 font-bold ${TOKEN_COLORS[tok.type] || 'text-blue-400'
                            }`}
                        >
                          {tok.type}
                        </td>
                        <td className="break-all px-4 py-2 text-amber-300">{tok.value}</td>
                        <td className="px-4 py-2 text-zinc-400">{tok.line}</td>
                        <td className="px-4 py-2 text-zinc-400">{tok.column}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>

      )}
    </section>
  );
}
