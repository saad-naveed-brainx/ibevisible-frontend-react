import { createContext, useContext } from 'react'
import type { LoginPayload, SignupPayload, User } from '../api/auth'

export interface AuthContextValue {
  // `null` once we know there is no session; `undefined` while restoring on load.
  user: User | null
  status: 'restoring' | 'authenticated' | 'unauthenticated'
  signup: (payload: SignupPayload) => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return ctx
}
