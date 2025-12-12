import { create } from 'zustand'

export type User = {
    id: string
    username: string
}

interface AuthState {
    user: User | null
    isLoading: boolean
    setUser: (user: User | null) => void
    setIsLoading: (isLoading: boolean) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true, // Default to true while checking initial session
    setUser: (user) => set({ user }),
    setIsLoading: (isLoading) => set({ isLoading }),
    logout: () => set({ user: null }),
}))
