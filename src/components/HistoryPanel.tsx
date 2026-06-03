import { useAppStore } from '../store/appStore'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function HistoryPanel() {
  const history = useAppStore((s) => s.history)
  const setOutput = useAppStore((s) => s.setOutput)
  const deleteHistoryEntry = useAppStore((s) => s.deleteHistoryEntry)
  const clearHistory = useAppStore((s) => s.clearHistory)

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          History
        </h2>
        {history.length > 0 && (
          <button
            type="button"
            onClick={clearHistory}
            className="text-xs text-gray-400 hover:text-red-400"
          >
            Clear
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-xs text-gray-500">
          Generated letters will be saved here.
        </p>
      ) : (
        <ul className="-mr-1 flex-1 space-y-1 overflow-y-auto pr-1">
          {history.map((entry) => (
            <li
              key={entry.id}
              className="group rounded-md border border-gray-700 bg-gray-800/60 p-2 transition hover:border-indigo-500"
            >
              <button
                type="button"
                onClick={() => setOutput(entry.output)}
                className="block w-full text-left"
              >
                <span className="block truncate text-sm font-medium text-gray-100">
                  {entry.jobTitle || 'Untitled role'}
                </span>
                <span className="block truncate text-xs text-gray-400">
                  {entry.companyName || 'Unknown company'}
                </span>
                <span className="mt-0.5 block text-[11px] text-gray-500">
                  {formatDate(entry.createdAt)} &middot; {entry.tone}
                </span>
              </button>
              <button
                type="button"
                onClick={() => deleteHistoryEntry(entry.id)}
                className="mt-1 text-[11px] text-gray-500 opacity-0 transition group-hover:opacity-100 hover:text-red-400"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
