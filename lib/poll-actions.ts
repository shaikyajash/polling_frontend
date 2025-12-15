'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { extractErrorMessage, handleFetchError } from './errors'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Log BASE_URL for debugging production issues
console.log('Poll Actions - Using BASE_URL:', BASE_URL)

export type Poll = {
    id: string
    title: string
    is_live: boolean
    total_votes: number
    created_at: string
    closed_at: string | null
}

export async function getAllPolls(filter: 'all' | 'open' | 'closed' = 'open'): Promise<Poll[]> {
    try {
        const res = await fetch(`${BASE_URL}/polls`, {
            cache: 'no-store', // Always fetch fresh data
        })

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            throw new Error(errorMessage)
        }

        const data = await res.json()
        let polls = data.polls || []

        if (filter === 'open') {
            polls = polls.filter((p: Poll) => p.is_live)
        } else if (filter === 'closed') {
            polls = polls.filter((p: Poll) => !p.is_live)
        }
        // 'all' returns everything, so no filter needed

        return polls
    } catch (error) {
        console.error('getAllPolls error:', error)
        handleFetchError(error, 'Failed to fetch polls')
    }
}

export type CreatePollResponse = {
    message: string
    poll: Poll & { creator_id: string; is_closed: boolean }
    options: Array<{
        id: string
        poll_id: string
        option_text: string
        vote_count: number
        display_order: number
    }>
}

export async function createPoll(title: string, options: string[]): Promise<CreatePollResponse> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')

    if (!token) {
        throw new Error('You must be logged in to create a poll')
    }

    try {
        const res = await fetch(`${BASE_URL}/polls/new`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ title, options }),
        })

        // If token is invalid/expired, clear cookies and force re-login
        if (res.status === 401) {
            cookieStore.set('session_token', '', { expires: new Date(0) })
            cookieStore.set('user_name', '', { expires: new Date(0) })
            cookieStore.set('user_id', '', { expires: new Date(0) })
            redirect('/login')  // This throws NEXT_REDIRECT - don't catch it!
        }

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            throw new Error(errorMessage)
        }

        const data = await res.json()
        return data
    } catch (error) {
        // Don't catch NEXT_REDIRECT errors
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        console.error('createPoll error:', error)
        handleFetchError(error, 'Failed to create poll')
    }
}

export type PollOption = {
    id: string
    poll_id: string
    option_text: string
    vote_count: number
    display_order: number
    percentage: number
}

export type PollDetails = {
    id: string
    title: string
    creator_id: string
    is_closed: boolean
    created_at: string
    closed_at: string | null
    total_votes: number
    options: PollOption[]
    user_voted_option_id: string | null
}

export async function getPollById(pollId: string): Promise<PollDetails> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')

    try {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        }

        // Include token if user is logged in (to get user_voted_option_id)
        if (token) {
            headers['Authorization'] = `Bearer ${token.value}`
        }

        const res = await fetch(`${BASE_URL}/polls/${pollId}`, {
            headers,
            cache: 'no-store',
        })

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            throw new Error(errorMessage)
        }

        const data = await res.json()
        return data
    } catch (error) {
        console.error('getPollById error:', error)
        handleFetchError(error, 'Failed to fetch poll')
    }
}

export async function votePoll(pollId: string, optionId: string): Promise<void> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')

    if (!token) {
        throw new Error('You must be logged in to vote')
    }

    try {
        const res = await fetch(`${BASE_URL}/polls/${pollId}/vote`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ option_id: optionId }),
        })

        // If token is invalid/expired, clear cookies and force re-login
        if (res.status === 401) {
            cookieStore.set('session_token', '', { expires: new Date(0) })
            cookieStore.set('user_name', '', { expires: new Date(0) })
            cookieStore.set('user_id', '', { expires: new Date(0) })
            redirect('/login')  // This throws NEXT_REDIRECT - don't catch it!
        }

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            throw new Error(errorMessage)
        }
    } catch (error) {
        // Don't catch NEXT_REDIRECT errors
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        console.error('votePoll error:', error)
        handleFetchError(error, 'Failed to cast vote')
    }
}

// User Poll type (from /polls/user/{id} endpoint)
export type UserPoll = {
    id: string
    title: string
    is_closed: boolean
    total_votes: number
    created_at: string
    closed_at: string | null
}

export type GetUserPollsResponse = {
    user_id: string
    polls: UserPoll[]
}

export async function getUserPolls(filter: 'all' | 'open' | 'closed' = 'open'): Promise<UserPoll[]> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')
    const userId = cookieStore.get('user_id')

    if (!token || !userId) {
        return []
    }

    try {
        const res = await fetch(`${BASE_URL}/polls/user/${userId.value}`, {
            headers: {
                'Authorization': `Bearer ${token.value}`,
            },
            cache: 'no-store',
        })

        // If token is invalid/expired, clear cookies and return empty
        if (res.status === 401) {
            cookieStore.set('session_token', '', { expires: new Date(0) })
            cookieStore.set('user_name', '', { expires: new Date(0) })
            cookieStore.set('user_id', '', { expires: new Date(0) })
            return []
        }

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            throw new Error(errorMessage)
        }

        const data: GetUserPollsResponse = await res.json()
        let polls = data.polls || []

        // Filter based on the filter parameter
        if (filter === 'open') {
            polls = polls.filter((p: UserPoll) => !p.is_closed)
        } else if (filter === 'closed') {
            polls = polls.filter((p: UserPoll) => p.is_closed)
        }
        // 'all' returns everything, so no filter needed

        return polls
    } catch (error) {
        console.error('getUserPolls error:', error)
        handleFetchError(error, 'Failed to fetch user polls')
    }
}

export async function closePoll(pollId: string): Promise<void> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')

    if (!token) {
        throw new Error('You must be logged in to close a poll')
    }

    try {
        const res = await fetch(`${BASE_URL}/polls/${pollId}/close`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'Content-Type': 'application/json',
            },
        })

        // If token is invalid/expired, clear cookies and force re-login
        if (res.status === 401) {
            cookieStore.set('session_token', '', { expires: new Date(0) })
            cookieStore.set('user_name', '', { expires: new Date(0) })
            cookieStore.set('user_id', '', { expires: new Date(0) })
            redirect('/login')  // This throws NEXT_REDIRECT - don't catch it!
        }

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            throw new Error(errorMessage)
        }
    } catch (error) {
        // Don't catch NEXT_REDIRECT errors
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        console.error('closePoll error:', error)
        handleFetchError(error, 'Failed to close poll')
    }
}

export async function resetPoll(pollId: string): Promise<void> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')

    if (!token) {
        throw new Error('You must be logged in to reset a poll')
    }

    try {
        const res = await fetch(`${BASE_URL}/polls/${pollId}/reset`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'Content-Type': 'application/json',
            },
        })

        // If token is invalid/expired, clear cookies and force re-login
        if (res.status === 401) {
            cookieStore.set('session_token', '', { expires: new Date(0) })
            cookieStore.set('user_name', '', { expires: new Date(0) })
            cookieStore.set('user_id', '', { expires: new Date(0) })
            redirect('/login')  // This throws NEXT_REDIRECT - don't catch it!
        }

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            throw new Error(errorMessage)
        }
    } catch (error) {
        // Don't catch NEXT_REDIRECT errors
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error
        }
        console.error('resetPoll error:', error)
        handleFetchError(error, 'Failed to reset poll')
    }
}
