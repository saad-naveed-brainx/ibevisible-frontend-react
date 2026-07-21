// Base URL for the API. In dev, requests to /api are proxied to the NestJS
// backend by Vite (see vite.config.ts). In other environments set
// VITE_API_BASE_URL to point directly at the API.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

export interface HealthStatus {
  status: string
  service: string
  timestamp: string
  uptime: number
}

export async function getHealth(): Promise<HealthStatus> {
  const res = await fetch(`${API_BASE_URL}/api/health`)
  if (!res.ok) {
    throw new Error(`Health check failed: ${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<HealthStatus>
}
