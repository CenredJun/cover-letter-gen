import { useState } from 'react'
import { useAppStore } from './store/appStore'
import ProfileManager from './components/ProfileManager'
import JobDescriptionInput from './components/JobDescriptionInput'
import GeneratorControls from './components/GeneratorControls'
import OutputPanel from './components/OutputPanel'
import HistoryPanel from './components/HistoryPanel'

export default function App() {
  const profiles = useAppStore((s) => s.profiles)
  const activeProfileId = useAppStore((s) => s.activeProfileId)
  const setActiveProfile = useAppStore((s) => s.setActiveProfile)

  const [managerOpen, setManagerOpen] = useState(false)

  return (
    <div className="flex h-full min-h-screen flex-col bg-gray-100 md:flex-row">
      {/* Sidebar */}
      <aside className="flex w-full flex-col gap-5 bg-gray-900 p-5 text-gray-100 md:h-screen md:w-[280px] md:shrink-0">
        <div>
          <h1 className="text-xl font-bold leading-tight">
            Cover Letter
            <br />
            Generator
          </h1>
        </div>

        <div>
          <label
            htmlFor="profile-switcher"
            className="mb-1 block text-sm font-semibold uppercase tracking-wide text-gray-400"
          >
            Active Profile
          </label>
          <select
            id="profile-switcher"
            value={activeProfileId ?? ''}
            onChange={(e) => setActiveProfile(e.target.value || null)}
            className="w-full rounded-md border border-gray-700 bg-gray-800 p-2 text-sm text-gray-100 outline-none focus:border-indigo-500"
          >
            {profiles.length === 0 && <option value="">No profiles</option>}
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            className="mt-2 w-full rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-sm font-medium text-gray-100 transition hover:bg-gray-700"
          >
            Manage Profiles
          </button>
        </div>

        <HistoryPanel />
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-5 md:h-screen">
        <div className="mx-auto flex max-w-3xl flex-col gap-5">
          <JobDescriptionInput />
          <GeneratorControls />
          <OutputPanel />
        </div>
      </main>

      {managerOpen && <ProfileManager onClose={() => setManagerOpen(false)} />}
    </div>
  )
}
