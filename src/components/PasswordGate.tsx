import { useEffect, useState } from 'react'

interface PasswordGateProps {
  onUnlock: () => void
}

export default function PasswordGate({ onUnlock }: PasswordGateProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)

  // If this browser session is already unlocked, skip the prompt.
  useEffect(() => {
    if (sessionStorage.getItem('app_unlocked') === 'true') {
      onUnlock()
    }
  }, [onUnlock])

  function handleSubmit() {
    if (password === import.meta.env.VITE_APP_PASSWORD) {
      sessionStorage.setItem('app_unlocked', 'true')
      setError(false)
      onUnlock()
    } else {
      setError(true)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
      <div className="w-full max-w-[380px] rounded-lg bg-white p-8 shadow-xl">
        <h1 className="text-center text-2xl font-bold leading-tight text-gray-800">
          Cover Letter Generator
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500">
          Personal workspace — enter password to continue
        </p>

        <div className="mt-6">
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              if (error) setError(false)
            }}
            onKeyDown={handleKeyDown}
            placeholder="Password"
            autoFocus
            className="w-full rounded-md border border-gray-300 p-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          {error && (
            <p className="mt-2 text-sm text-red-600">Incorrect password</p>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="mt-4 w-full rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Unlock
          </button>
        </div>
      </div>
    </div>
  )
}
