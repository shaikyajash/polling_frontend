'use client'

import { useEffect } from 'react'
import { useAuthStore, User } from '@/store/auth'

export default function AuthInitializer({ user }: { user: User | null }) {

  useEffect(() => {
    // Update Zustand whenever user prop changes (from server)
    useAuthStore.getState().setUser(user)
    useAuthStore.getState().setIsLoading(false)

  }, [user])

  return null
}
