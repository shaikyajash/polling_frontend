'use client'

import { useEffect } from 'react'
import { getUserFriendlyErrorMessage } from '@/lib/errors'

export default function PollsError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error for debugging
    console.error('Polls page error:', error)
  }, [error])

  const errorMessage = getUserFriendlyErrorMessage(error)

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            All Polls
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Browse and vote on active polls
          </p>
        </div>
      </div>

      <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
        <svg
          className="mx-auto h-12 w-12 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h3 className="mt-4 text-lg font-medium text-red-900 dark:text-red-200">
          Failed to Load Polls
        </h3>
        <p className="mt-2 text-sm text-red-700 dark:text-red-300 max-w-md mx-auto">
          {errorMessage}
        </p>
        {error.digest && (
          <p className="mt-2 text-xs text-red-600 dark:text-red-400 font-mono">
            Error ID: {error.digest}
          </p>
        )}
        <div className="mt-6">
          <button
            onClick={reset}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
