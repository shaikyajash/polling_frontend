'use client'

import { useEffect } from 'react'
import { getUserFriendlyErrorMessage } from '@/lib/errors'

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to console for debugging
        console.error('Global error caught:', error)
    }, [error])

    const errorMessage = getUserFriendlyErrorMessage(error)

    return (
        <html>
            <body>
                <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-950 px-4">
                    <div className="max-w-md w-full">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
                            {/* Error Icon */}
                            <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                                <svg
                                    className="w-8 h-8 text-red-600 dark:text-red-400"
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
                            </div>

                            {/* Error Title */}
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                Something went wrong
                            </h1>

                            {/* Error Message */}
                            <p className="text-gray-600 dark:text-gray-300 mb-6">
                                {errorMessage}
                            </p>

                            {/* Error Digest (for debugging) */}
                            {error.digest && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-mono bg-gray-100 dark:bg-gray-700 py-2 px-3 rounded">
                                    Error ID: {error.digest}
                                </p>
                            )}

                            {/* Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <button
                                    onClick={reset}
                                    className="inline-flex items-center justify-center px-6 py-2.5 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    Try Again
                                </button>
                                <a
                                    href="/"
                                    className="inline-flex items-center justify-center px-6 py-2.5 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
                                >
                                    Go Home
                                </a>
                            </div>

                            {/* Additional Help */}
                            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    If this problem persists, please contact support
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </body>
        </html>
    )
}
