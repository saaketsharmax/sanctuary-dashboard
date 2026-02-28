import type { SupabaseClient } from '@supabase/supabase-js'
import type { IMentorRepository, DbListResult } from '../../../repositories/interfaces'

export class SupabaseMentorRepository implements IMentorRepository {
  constructor(private client: SupabaseClient) {}

  async getCandidates(): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('user_type', 'partner')
      .in('partner_sub_type', ['mentor', 'vc', 'startup_manager'])
    return { data: data || [], error }
  }

  async getMatches(startupId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('matches')
      .select('*')
      .eq('startup_id', startupId)
      .order('score', { ascending: false })
    return { data: data || [], error }
  }

  async getHistoricalMatches(statuses?: string[]): Promise<DbListResult<Record<string, any>>> {
    let query = this.client
      .from('matches')
      .select('mentor_id, startup_id, status, feedback')
    if (statuses && statuses.length > 0) {
      query = query.in('status', statuses)
    }
    const { data, error } = await query
    return { data: data || [], error }
  }
}
