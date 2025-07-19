// Shared in-memory data store
// In production, replace this with a proper database

export interface User {
  id: string
  name: string
  email: string
  password: string
  createdAt: string
}

export interface Form {
  id: string
  userId: string
  title: string
  description: string
  questions: Array<{
    id: string
    text: string
    type: string
    options?: string[]
    required: boolean
  }>
  responses: Array<{
    id: string
    answers: Record<string, any>
    submittedAt: string
  }>
  createdAt: string
  isActive: boolean
}

// Global data stores
export const users: User[] = []
export const forms: Form[] = []

// Simple hash function (for demo - use bcrypt in production)
export function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// Simple JWT creation (for demo - use proper JWT library in production)
export function createToken(payload: any): string {
  const header = btoa(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const payloadStr = btoa(JSON.stringify({ ...payload, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 }))
  // Using a simple hardcoded secret for demo purposes. In production, use process.env.JWT_SECRET
  const signature = btoa(`${header}.${payloadStr}.v0_secret_key`)
  return `${header}.${payloadStr}.${signature}`
}

// Simple token verification
export function verifyToken(token: string): any | null {
  try {
    const parts = token.split(".")
    if (parts.length !== 3) return null

    const payload = JSON.parse(atob(parts[1]))
    // Check expiration
    if (payload.exp < Date.now()) return null

    // Simple signature verification (for demo)
    const expectedSignature = btoa(`${parts[0]}.${parts[1]}.v0_secret_key`)
    if (expectedSignature !== parts[2]) return null

    return payload
  } catch {
    return null
  }
}
