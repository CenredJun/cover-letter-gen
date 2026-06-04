import { useState } from 'react'
import { useAppStore } from '../store/appStore'

export default function OutputPanel() {
  const output = useAppStore((s) => s.output)
  const jobInput = useAppStore((s) => s.jobInput)
  const outputMode = useAppStore((s) => s.outputMode)
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setCopied(false)
    }
  }

  function handleDownload() {
    if (!output) return
    const safe = (s: string) => s.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')
    const namePart =
      [jobInput.companyName, jobInput.jobTitle].filter(Boolean).map(safe).join('_') ||
      'cover-letter'
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${namePart}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        3 &middot; {outputMode === 'pitch' ? 'Pitch Output' : 'Output'}
      </h2>

      <textarea
        readOnly
        value={output}
        rows={16}
        placeholder="Your generated cover letter will appear here…"
        className="w-full resize-y rounded-md border border-gray-300 bg-gray-50 p-3 font-mono text-sm leading-relaxed text-gray-800 outline-none"
      />

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!output}
          className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {copied ? 'Copied!' : 'Copy to clipboard'}
        </button>
        <button
          type="button"
          onClick={handleDownload}
          disabled={!output}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Download as .txt
        </button>
      </div>
    </section>
  )
}
