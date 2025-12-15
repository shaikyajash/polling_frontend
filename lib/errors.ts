/**
 * Custom error classes for better error handling across the application
 */

export class ApiError extends Error {
    constructor(
        message: string,
        public statusCode?: number,
        public digest?: string
    ) {
        super(message)
        this.name = 'ApiError'
    }
}

export class AuthenticationError extends Error {
    constructor(message: string = 'Authentication failed') {
        super(message)
        this.name = 'AuthenticationError'
    }
}

export class NetworkError extends Error {
    constructor(message: string = 'Network request failed') {
        super(message)
        this.name = 'NetworkError'
    }
}

/**
 * Extract error message from various error response formats
 */
export async function extractErrorMessage(response: Response): Promise<string> {
    try {
        const contentType = response.headers.get('content-type')

        if (contentType?.includes('application/json')) {
            const data = await response.json()
            return data.error || data.message || `Request failed with status ${response.status}`
        } else {
            const text = await response.text()
            if (text) {
                try {
                    const json = JSON.parse(text)
                    return json.error || json.message || text
                } catch {
                    return text
                }
            }
        }
    } catch (error) {
        console.error('Error extracting error message:', error)
    }

    return `Request failed with status ${response.status}`
}

/**
 * Handle fetch errors and convert them to meaningful messages
 */
export function handleFetchError(error: unknown, fallbackMessage: string): never {
    if (error instanceof Error) {
        // Network errors
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            throw new NetworkError('Unable to connect to the server. Please make sure the backend is running.')
        }

        // Re-throw if it's already our custom error
        if (error instanceof ApiError || error instanceof AuthenticationError || error instanceof NetworkError) {
            throw error
        }

        // Generic error with message
        throw new Error(error.message)
    }

    // Unknown error type
    throw new Error(fallbackMessage)
}

/**
 * Create a user-friendly error message from an error object
 */
export function getUserFriendlyErrorMessage(error: Error & { digest?: string }): string {
    // If there's a digest, it means Next.js has obscured the error in production
    if (error.digest) {
        console.error('Error digest:', error.digest, 'Original error:', error)

        // Try to provide helpful messages based on common patterns
        if (error.message.includes('NEXT_NOT_FOUND')) {
            return 'The requested resource was not found.'
        }

        if (error.message.includes('NEXT_REDIRECT')) {
            return 'You are being redirected.'
        }

        // For other production errors, provide a generic but helpful message
        return 'An error occurred while processing your request. Please try again or contact support if the problem persists.'
    }

    // In development or when error hasn't been obscured, return the actual message
    return error.message || 'An unexpected error occurred'
}
