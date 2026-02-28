import type { SupabaseClient } from '@supabase/supabase-js'
import type { IStartupRepository, DbResult, DbListResult } from '../../../repositories/interfaces'

export class SupabaseStartupRepository implements IStartupRepository {
  constructor(private client: SupabaseClient) {}

  // ---------------------------------------------------------------------------
  // Startups
  // ---------------------------------------------------------------------------

  async getById(id: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('startups')
      .select('*')
      .eq('id', id)
      .single()
    return { data, error }
  }

  async getByIdWithCohort(id: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('startups')
      .select('*, cohorts(name, start_date, end_date)')
      .eq('id', id)
      .single()
    return { data, error }
  }

  async getByApplicationId(applicationId: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('startups')
      .select('*')
      .eq('application_id', applicationId)
      .single()
    return { data, error }
  }

  async create(data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('startups')
      .insert(data)
      .select()
      .single()
    return { data: result, error }
  }

  async update(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('startups')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    return { data: result, error }
  }

  // ---------------------------------------------------------------------------
  // Metrics
  // ---------------------------------------------------------------------------

  async getLatestMetrics(startupId: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('metrics')
      .select('*')
      .eq('startup_id', startupId)
      .order('date', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  }

  async getMetricsHistory(
    startupId: string,
    since: string,
    fields?: string
  ): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('metrics')
      .select(fields ?? '*')
      .eq('startup_id', startupId)
      .gte('date', since)
    return { data: data || [], error }
  }

  async getMetricsSeries(startupId: string, limit: number): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('metrics')
      .select('*')
      .eq('startup_id', startupId)
      .order('date', { ascending: false })
      .limit(limit)
    return { data: data || [], error }
  }

  async getAllRecentMetrics(limit: number): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('metrics')
      .select('*')
      .order('date', { ascending: false })
      .limit(limit)
    return { data: data || [], error }
  }

  // ---------------------------------------------------------------------------
  // Shared metrics config
  // ---------------------------------------------------------------------------

  async getSharedMetrics(startupId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('shared_metrics')
      .select('*')
      .eq('startup_id', startupId)
      .eq('is_active', true)
    return { data: data || [], error }
  }

  // ---------------------------------------------------------------------------
  // Checkpoints
  // ---------------------------------------------------------------------------

  async getCheckpoints(startupId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('checkpoints')
      .select('*')
      .eq('startup_id', startupId)
      .order('due_date', { ascending: true })
    return { data: data || [], error }
  }

  async getCheckpointById(id: string, startupId: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('checkpoints')
      .select('*')
      .eq('id', id)
      .eq('startup_id', startupId)
      .single()
    return { data, error }
  }

  async updateCheckpoint(
    id: string,
    data: Record<string, any>
  ): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('checkpoints')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    return { data: result, error }
  }

  // ---------------------------------------------------------------------------
  // Partner feedback
  // ---------------------------------------------------------------------------

  async getPartnerFeedback(
    startupId: string,
    options?: { visibleToFounder?: boolean; limit?: number }
  ): Promise<DbListResult<Record<string, any>>> {
    let query = this.client
      .from('partner_feedback')
      .select('*')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })

    if (options?.visibleToFounder !== undefined) {
      query = query.eq('is_visible_to_founder', options.visibleToFounder)
    }

    if (options?.limit !== undefined) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query
    return { data: data || [], error }
  }
}
