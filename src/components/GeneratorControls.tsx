import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { generateCoverLetter } from '../lib/claudeApi'
import type { ToneOption } from '../types'

const TONES: { value: ToneOption; label: string }[] = [
  { value: 'professional', label: 'Professional' },
  { value: 'assertive', label: 'Assertive' },
  { value: 'warm', label: 'Warm' },
]

export default function GeneratorControls() {
  const tone = useAppStore((s) => s.tone)
  const setTone = useAppStore((s) => s.setTone)
  const isGenerating = useAppStore((s) => s.isGenerating)
  const setIsGenerating = useAppStore((s) => s.setIsGenerating)
  const setOutput = useAppStore((s) => s.setOutput)
  const jobInput = useAppStore((s) => s.jobInput)
  const profiles = useAppStore((s) => s.profiles)
  const activeProfileId = useAppStore((s) => s.activeProfileId)
  const addToHistory = useAppStore((s) => s.addToHistory)

  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    const profile = profiles.find((p) => p.id === activeProfileId)
    if (!profile) {
      setError('Select a profile first (Manage Profiles in the sidebar).')
      return
    }
    setError(null)
    setIsGenerating(true)
    setOutput('')
    try {
      const letter = await generateCoverLetter(profile, jobInput, tone)
      setOutput(letter)
      addToHistory({
        profileName: profile.name,
        jobTitle: jobInput.jobTitle,
        companyName: jobInput.companyName,
        tone,
        output: letter,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-gray-800">
        2 &middot; Controls
      </h2>

      <div className="mb-4">
        <span className="mb-2 block text-sm font-medium text-gray-600">
          Tone
        </span>
        <div className="flex flex-wrap gap-2">
          {TONES.map((t) => {
            const active = tone === t.value
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setTone(t.value)}
                className={
                  'rounded-full px-4 py-1.5 text-sm font-medium transition ' +
                  (active
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200')
                }
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
        )}
        {isGenerating ? 'Generating…' : 'Generate Cover Letter'}
      </button>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  )
}
