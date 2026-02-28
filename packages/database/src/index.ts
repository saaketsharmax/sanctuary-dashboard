// Sanctuary Database Package
// Shared Supabase client and types

export { createClient as createBrowserClient } from './client'
export { createSupabaseServerClient as createServerClient } from './server'
export * from './types'

// Database abstraction layer
export { createDb } from './db'
export type { DatabaseProvider, DbContext } from './db'
export type {
  DbResult,
  DbListResult,
  IUserRepository,
  IApplicationRepository,
  IDDRepository,
  IStartupRepository,
  IInvestmentRepository,
  IDocumentRepository,
  IMentorRepository,
  IRequestRepository,
} from './repositories/interfaces'

// Auth abstraction
export type { AuthProvider, AuthUser, AuthResult } from './auth/interfaces'
export { SupabaseAuthProvider } from './auth/providers/supabase'

// Storage abstraction
export type { StorageProvider } from './storage/interfaces'
export { SupabaseStorageProvider } from './storage/providers/supabase'

// Realtime abstraction
export type { RealtimeProvider, RealtimePayload, RealtimeSubscriptionConfig } from './realtime/interfaces'
export { SupabaseRealtimeProvider } from './realtime/providers/supabase'
