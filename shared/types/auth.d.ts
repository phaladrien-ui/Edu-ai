// shared/types/auth.d.ts
declare module '#auth-utils' {
  interface User {
    id: string
    email: string
    name: string
    avatar: string
    provider: 'github' | 'google' | 'microsoft' | 'credentials'
  }

  interface UserSession {
    loggedInAt: number
  }
}

export {}