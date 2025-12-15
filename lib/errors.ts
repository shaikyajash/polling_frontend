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
 * Throws error with message that should survive Next.js production wrapping
 */
export function handleFetchError(error: unknown, fallbackMessage: string): never {
    console.error('handleFetchError called with:', { error, fallbackMessage });

    if (error instanceof Error) {
        // Network errors - create explicit message
        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            const networkError = new Error('Unable to connect to the server. Please make sure the backend is running.');
            // Set name to make it more identifiable
            networkError.name = 'NetworkError';
            console.error('Throwing NetworkError:', networkError.message);
            throw networkError;
        }

        // Re-throw if it's already our custom error
        if (error instanceof ApiError || error instanceof AuthenticationError || error instanceof NetworkError) {
            console.error('Re-throwing custom error:', error.message);
            throw error;
        }

        // Generic error with message - create new Error to ensure message is preserved
        const preservedError = new Error(error.message);
        preservedError.name = error.name;
        preservedError.stack = error.stack;
        console.error('Throwing preserved error:', preservedError.message);
        throw preservedError;
    }

    // Unknown error type - create explicit error
    const unknownError = new Error(fallbackMessage);
    unknownError.name = 'UnknownError';
    console.error('Throwing unknown error:', unknownError.message);
    throw unknownError;
}

/**
 * Create a user-friendly error message from an error object
 */
export function getUserFriendlyErrorMessage(error: Error & { digest?: string }): string {
    // If there's a digest, it means Next.js has obscured the error in production
    if (error.digest) {
        // Log full error details for debugging (shows in Vercel function logs)
        console.error('Production error with digest:', {
            digest: error.digest,
            message: error.message,
            name: error.name,
            stack: error.stack,
            fullError: error
        })

        // Try to provide helpful messages based on common patterns
        if (error.message.includes('NEXT_NOT_FOUND')) {
            return 'The requested resource was not found.'
        }

        if (error.message.includes('NEXT_REDIRECT')) {
            return 'You are being redirected.'
        }

        if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
            return 'Unable to connect to the server. Please check your internet connection or try again later.'
        }

        // For other production errors, provide a generic but helpful message
        return `An error occurred while processing your request. ${error.digest ? `Error ID: ${error.digest}` : 'Please try again or contact support if the problem persists.'}`
    }

    // In development or when error hasn't been obscured, return the actual message
    return error.message || 'An unexpected error occurred'
}
