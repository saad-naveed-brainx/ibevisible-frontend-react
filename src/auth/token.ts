// Access-token persistence. The token is kept in localStorage so a session
// survives a page reload, and mirrored via the getter/setter below so the API
// layer can read it synchronously without touching storage on every request.

const STORAGE_KEY = 'ibv.accessToken'

let currentToken: string | null = readInitialToken()

function readInitialToken(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    // localStorage may be unavailable (private mode, SSR). Fall back to memory.
    return null
  }
}

export function getToken(): string | null {
  return currentToken
}

export function setToken(token: string | null): void {
  currentToken = token
  try {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token)
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  } catch {
    // Ignore storage failures; the in-memory token still works for this session.
  }
}
