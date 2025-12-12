import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
    user_id: string;
    username: string;
};

type AuthStore = {
    user: User | null;
    token: string | null;
    isLoading: boolean;
    error: string | null;
    setUser: (user: User | null) => void;
    setToken: (token: string | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    logout: () => void;
};

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isLoading: false,
            error: null,
            setUser: (user) => set({ user }),
            setToken: (token) => set({ token }),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
            logout: () => set({ user: null, token: null, error: null }),
        }),
        {
            name: 'auth-storage',
            // Only persist user and token, not error or isLoading
            partialize: (state) => ({ 
                user: state.user, 
                token: state.token 
            }),
        }
    )
);