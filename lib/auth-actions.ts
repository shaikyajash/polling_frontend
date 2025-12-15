'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type {
    PublicKeyCredentialCreationOptionsJSON,
    PublicKeyCredentialRequestOptionsJSON,
    RegistrationResponseJSON,
    AuthenticationResponseJSON
} from '@simplewebauthn/types'
import { extractErrorMessage, handleFetchError } from './errors'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

// Log BASE_URL for debugging production issues  
console.log('Auth Actions - Using BASE_URL:', BASE_URL)

// --- Types ---

interface RegisterStartResponse {
    registration_id: string
    public_key_options: {
        publicKey: PublicKeyCredentialCreationOptionsJSON
    }
}

interface AuthenticateStartResponse {
    authentication_id: string
    public_key_options: {
        publicKey: PublicKeyCredentialRequestOptionsJSON
    }
}

interface AuthSuccessResponse {
    message: string
    user_name: string
    user_id: string
    token: string
}

export type User = {
    id: string
    username: string
    // Add other fields if available/needed
}

// --- Actions ---

export async function registerStart(username: string) {
    try {
        const res = await fetch(`${BASE_URL}/auth/register/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, display_name: username }),
        })

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            return { success: false, error: errorMessage, data: null }
        }

        const data: RegisterStartResponse = await res.json()
        return { success: true, data, error: null }

    } catch (error) {
        console.error('registerStart error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Registration start failed'
        return { success: false, error: errorMessage, data: null }
    }
}



export async function registerFinish(username: string, registrationId: string, credential: RegistrationResponseJSON) {
    try {
        const res = await fetch(`${BASE_URL}/auth/register/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                registration_id: registrationId,
                credential,
            }),
        })

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            return { success: false, error: errorMessage }
        }

        return { success: true, error: null }
    } catch (error) {
        console.error('registerFinish error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Registration finish failed'
        return { success: false, error: errorMessage }
    }
}

export async function loginStart(username: string) {
    try {
        const res = await fetch(`${BASE_URL}/auth/authenticate/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username }),
        })

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            return { success: false, error: errorMessage, data: null }
        }

        const data: AuthenticateStartResponse = await res.json()
        return { success: true, data, error: null }
    } catch (error) {
        console.error('loginStart error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Login start failed'
        return { success: false, error: errorMessage, data: null }
    }
}

export async function loginFinish(authenticationId: string, credential: AuthenticationResponseJSON) {
    try {
        const res = await fetch(`${BASE_URL}/auth/authenticate/finish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                authentication_id: authenticationId,
                credential,
            }),
        })

        if (!res.ok) {
            const errorMessage = await extractErrorMessage(res)
            return { success: false, error: errorMessage, data: null }
        }

        const data: AuthSuccessResponse = await res.json()

        // Securely set the cookie
        // Expires in 24 hours (matching your JWT exp)
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

        const cookieStore = await cookies()
        cookieStore.set('session_token', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: expires,
            path: '/',
        })

        // Also store username in a cookie so we can restore it on refresh
        cookieStore.set('user_name', data.user_name, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: expires,
            path: '/',
        })

        // Store user_id in a cookie for easy access
        cookieStore.set('user_id', data.user_id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            expires: expires,
            path: '/',
        })

        // Return user info to update Zustand on client
        return {
            success: true,
            data: { user_id: data.user_id, user_name: data.user_name },
            error: null
        }

    } catch (error) {
        console.error('loginFinish error:', error)
        const errorMessage = error instanceof Error ? error.message : 'Login finish failed'
        return { success: false, error: errorMessage, data: null }
    }
}



export async function logout() {
    const cookieStore = await cookies()
    cookieStore.delete('session_token')
    cookieStore.delete('user_name')
    cookieStore.delete('user_id')
    redirect('/login')
}





export async function getSession() {

    const cookieStore = await cookies()
    const token = cookieStore.get('session_token')
    const username = cookieStore.get('user_name')

    if (!token || !username) {
        return null
    }


    try {
        const res = await fetch(`${BASE_URL}/api/protected/test`, {
            headers: {
                'Authorization': `Bearer ${token.value}`
            }
        })


        if (res.ok) {
            const data = await res.json()
            return {
                id: data.user_id,
                username: username?.value || 'Unknown',
            }
        }

        // Token is invalid - just return null
        // Can't delete cookies here (not in Server Action context)
        return null

    } catch (e) {
        return null
    }
}
