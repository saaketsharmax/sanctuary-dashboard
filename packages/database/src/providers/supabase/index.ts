// Supabase provider — implements DatabaseProvider using @supabase/supabase-js

import type { SupabaseClient } from '@supabase/supabase-js'
import type { DatabaseProvider, DbContext } from '../../db'
import { getAdminClient } from './client'
import { SupabaseUserRepository } from './repositories/user'
import { SupabaseApplicationRepository } from './repositories/application'
import { SupabaseDDRepository } from './repositories/dd'
import { SupabaseStartupRepository } from './repositories/startup'
import { SupabaseInvestmentRepository } from './repositories/investment'
import { SupabaseDocumentRepository } from './repositories/document'
import { SupabaseMentorRepository } from './repositories/mentor'
import { SupabaseRequestRepository } from './repositories/request'

export class SupabaseProvider implements DatabaseProvider {
  users: SupabaseUserRepository
  applications: SupabaseApplicationRepository
  dd: SupabaseDDRepository
  startups: SupabaseStartupRepository
  investments: SupabaseInvestmentRepository
  documents: SupabaseDocumentRepository
  mentors: SupabaseMentorRepository
  requests: SupabaseRequestRepository

  constructor(context: DbContext) {
    const client = this.resolveClient(context)
    this.users = new SupabaseUserRepository(client)
    this.applications = new SupabaseApplicationRepository(client)
    this.dd = new SupabaseDDRepository(client)
    this.startups = new SupabaseStartupRepository(client)
    this.investments = new SupabaseInvestmentRepository(client)
    this.documents = new SupabaseDocumentRepository(client)
    this.mentors = new SupabaseMentorRepository(client)
    this.requests = new SupabaseRequestRepository(client)
  }

  private resolveClient(context: DbContext): SupabaseClient {
    switch (context.type) {
      case 'supabase-client':
        return context.client as SupabaseClient
      case 'admin':
        return getAdminClient()
    }
  }
}
