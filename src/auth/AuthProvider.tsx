import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  getCurrentUser,
  login as loginRequest,
  logout as logoutRequest,
  signup as signupRequest,
  type AuthResponse,
  type LoginPayload,
  type SignupPayload,
  type User,
} from '../api/auth'
import { getToken, setToken } from './token'
import { AuthContext, type AuthContextValue } from './AuthContext'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] =
    useState<AuthContextValue['status']>('restoring')

  // On load, restore the session from a stored token by calling /me.
  useEffect(() => {
    let cancelled = false

    async function restore() {
      if (!getToken()) {
        setStatus('unauthenticated')
        return
      }
      try {
        const me = await getCurrentUser()
        if (cancelled) return
        setUser(me)
        setStatus('authenticated')
      } catch {
        // Token missing/invalid/expired — drop it and start clean.
        if (cancelled) return
        setToken(null)
        setUser(null)
        setStatus('unauthenticated')
      }
    }

    void restore()
    return () => {
      cancelled = true
    }
  }, [])

  const applyAuth = useCallback((res: AuthResponse) => {
    setToken(res.accessToken)
    setUser(res.user)
    setStatus('authenticated')
  }, [])

  const signup = useCallback(
    async (payload: SignupPayload) => {
      applyAuth(await signupRequest(payload))
    },
    [applyAuth],
  )

  const login = useCallback(
    async (payload: LoginPayload) => {
      applyAuth(await loginRequest(payload))
    },
    [applyAuth],
  )

  const logout = useCallback(async () => {
    try {
      await logoutRequest()
    } catch {
      // JWTs are stateless; logout completes client-side even if the call fails.
    }
    setToken(null)
    setUser(null)
    setStatus('unauthenticated')
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, signup, login, logout }),
    [user, status, signup, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
