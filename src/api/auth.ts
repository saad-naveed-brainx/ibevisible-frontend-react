import { getToken } from '../auth/token'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export interface User {
  id: string
  email: string
  fullName: string | null
  organizationId: string
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  user: User
}

export interface SignupPayload {
  email: string
  password: string
  fullName?: string
}

export interface LoginPayload {
  email: string
  password: string
}

// Thrown for any non-2xx response. `status` is the HTTP code and `message` is a
// human-readable string (NestJS validation errors arrive as an array, which we
// flatten into a single newline-joined message).
export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

// Shared request helper for all authenticated JSON endpoints. Prefixes `/api`,
// attaches the bearer token, and normalizes errors into `ApiError`. Exported so
// feature API modules (auth, content, …) share one transport.
export async function request<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  const token = getToken()
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}/api${path}`, { ...init, headers })
  } catch {
    throw new ApiError(0, 'Unable to reach the server. Is the backend running?')
  }

  const data = await parseBody(res)

  if (!res.ok) {
    throw new ApiError(res.status, extractMessage(data, res.statusText))
  }

  return data as T
}

async function parseBody(res: Response): Promise<unknown> {
  const text = await res.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

function extractMessage(data: unknown, fallback: string): string {
  if (data && typeof data === 'object' && 'message' in data) {
    const message = (data as { message: unknown }).message
    if (Array.isArray(message)) return message.join('\n')
    if (typeof message === 'string') return message
  }
  if (typeof data === 'string' && data) return data
  return fallback || 'Something went wrong.'
}

export function signup(payload: SignupPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function login(payload: LoginPayload): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getCurrentUser(): Promise<User> {
  return request<User>('/auth/me')
}

export function logout(): Promise<{ success: boolean }> {
  return request<{ success: boolean }>('/auth/logout', { method: 'POST' })
}
