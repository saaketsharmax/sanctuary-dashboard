// Auth provider interface — decouples auth from any specific SDK

export interface AuthUser {
  id: string
  email: string
  name: string | null
  avatarUrl: string | null
}

export interface AuthResult {
  user: AuthUser | null
  error: Error | null
}

export interface AuthProvider {
  getUser(): Promise<{ user: AuthUser | null; error: Error | null }>
  signUp(email: string, password: string, metadata?: Record<string, unknown>): Promise<AuthResult>
  signInWithPassword(email: string, password: string): Promise<AuthResult>
  signInWithOAuth(provider: 'google' | 'github'): Promise<{ url: string } | { error: Error }>
  signOut(): Promise<{ error: Error | null }>
  exchangeCodeForSession(code: string): Promise<{ error: Error | null }>
  onAuthStateChange(
    cb: (event: 'SIGNED_IN' | 'SIGNED_OUT', user: AuthUser | null) => void
  ): { unsubscribe: () => void }
}
