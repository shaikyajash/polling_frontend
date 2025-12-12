'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

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
            throw new Error('Failed to fetch polls')
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
    } catch (error: any) {
        console.error('getAllPolls error:', error)
        throw new Error(error.message || 'Failed to fetch polls')
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
        const errorText = await res.text()
        let errorMessage = 'Failed to create poll'
        try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error || errorMessage
        } catch {
            errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
    }

    const data = await res.json()
    return data
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
            const errorText = await res.text()
            let errorMessage = 'Failed to fetch poll'
            try {
                const errorJson = JSON.parse(errorText)
                errorMessage = errorJson.error || errorMessage
            } catch {
                errorMessage = errorText || errorMessage
            }
            throw new Error(errorMessage)
        }

        const data = await res.json()
        return data
    } catch (error: any) {
        console.error('getPollById error:', error)
        throw new Error(error.message || 'Failed to fetch poll')
    }
}

export async function votePoll(pollId: string, optionId: string): Promise<void> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')

    if (!token) {
        throw new Error('You must be logged in to vote')
    }

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
        const errorText = await res.text()
        let errorMessage = 'Failed to cast vote'
        try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error || errorMessage
        } catch {
            errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
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
            throw new Error('Failed to fetch user polls')
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
    } catch (error: any) {
        console.error('getUserPolls error:', error)
        throw new Error(error.message || 'Failed to fetch user polls')
    }
}

export async function closePoll(pollId: string): Promise<void> {
    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')

    if (!token) {
        throw new Error('You must be logged in to close a poll')
    }

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
        const errorText = await res.text()
        let errorMessage = 'Failed to close poll'
        try {
            const errorJson = JSON.parse(errorText)
            errorMessage = errorJson.error || errorMessage
        } catch {
            errorMessage = errorText || errorMessage
        }
        throw new Error(errorMessage)
    }
}
