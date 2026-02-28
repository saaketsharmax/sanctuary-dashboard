// Database provider interface and factory
// Switch providers via DB_PROVIDER env var (default: 'supabase')

import type {
  IUserRepository,
  IApplicationRepository,
  IDDRepository,
  IStartupRepository,
  IInvestmentRepository,
  IDocumentRepository,
  IMentorRepository,
  IRequestRepository,
} from './repositories/interfaces'

export interface DatabaseProvider {
  users: IUserRepository
  applications: IApplicationRepository
  dd: IDDRepository
  startups: IStartupRepository
  investments: IInvestmentRepository
  documents: IDocumentRepository
  mentors: IMentorRepository
  requests: IRequestRepository
}

// For the Supabase provider, pass the already-created SupabaseClient.
// This lets auth stay on the existing `createClient()` pattern while data
// calls go through the repository layer. Other providers can accept
// different context shapes (e.g., a connection string).
export type DbContext =
  | { type: 'supabase-client'; client: unknown }
  | { type: 'admin' }

export function createDb(context: DbContext): DatabaseProvider {
  const provider = process.env.DB_PROVIDER || 'supabase'

  switch (provider) {
    case 'supabase': {
      const { SupabaseProvider } = require('./providers/supabase/index') as typeof import('./providers/supabase/index')
      return new SupabaseProvider(context)
    }
    default:
      throw new Error(`Unknown DB_PROVIDER: ${provider}. Supported: supabase`)
  }
}
