import type { SupabaseClient } from '@supabase/supabase-js'
import type { IDDRepository, DbResult, DbListResult } from '../../../repositories/interfaces'

export class SupabaseDDRepository implements IDDRepository {
  constructor(private client: SupabaseClient) {}

  // ---------------------------------------------------------------------------
  // Claims
  // ---------------------------------------------------------------------------

  async insertClaims(claims: Record<string, any>[]): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('dd_claims')
      .insert(claims)
      .select('*')
    return { data: data || [], error }
  }

  async getClaims(
    applicationId: string,
    filters?: { category?: string; status?: string; priority?: string }
  ): Promise<DbListResult<Record<string, any>>> {
    let query = this.client
      .from('dd_claims')
      .select('*')
      .eq('application_id', applicationId)
      .order('priority', { ascending: true })
      .order('category', { ascending: true })

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    if (filters?.priority) {
      query = query.eq('priority', filters.priority)
    }

    const { data, error } = await query
    return { data: data || [], error }
  }

  async getClaimsFiltered(filters: { createdAtGte?: string }): Promise<DbListResult<Record<string, any>>> {
    let query = this.client
      .from('dd_claims')
      .select('*')

    if (filters.createdAtGte) {
      query = query.gte('created_at', filters.createdAtGte)
    }

    const { data, error } = await query
    return { data: data || [], error }
  }

  async getClaimCount(applicationId: string): Promise<{ count: number; error: Error | null }> {
    const { count, error } = await this.client
      .from('dd_claims')
      .select('*', { count: 'exact', head: true })
      .eq('application_id', applicationId)
    return { count: count ?? 0, error }
  }

  async deleteClaims(applicationId: string): Promise<{ error: Error | null }> {
    const { error } = await this.client
      .from('dd_claims')
      .delete()
      .eq('application_id', applicationId)
    return { error }
  }

  async updateClaim(claimId: string, data: Record<string, any>): Promise<{ error: Error | null }> {
    const { error } = await this.client
      .from('dd_claims')
      .update(data)
      .eq('id', claimId)
    return { error }
  }

  // ---------------------------------------------------------------------------
  // Verifications
  // ---------------------------------------------------------------------------

  async insertVerifications(verifications: Record<string, any>[]): Promise<{ error: Error | null }> {
    const { error } = await this.client
      .from('dd_verifications')
      .insert(verifications)
    return { error }
  }

  async getVerifications(claimIds: string[]): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('dd_verifications')
      .select('*')
      .in('claim_id', claimIds)
    return { data: data || [], error }
  }

  async deleteVerifications(claimIds: string[]): Promise<{ error: Error | null }> {
    const { error } = await this.client
      .from('dd_verifications')
      .delete()
      .in('claim_id', claimIds)
    return { error }
  }

  // ---------------------------------------------------------------------------
  // Reports
  // ---------------------------------------------------------------------------

  async insertReport(report: Record<string, any>): Promise<DbResult<{ id: string }>> {
    const { data, error } = await this.client
      .from('dd_reports')
      .insert(report)
      .select('id')
      .single()
    return { data, error }
  }

  async getReport(reportId: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('dd_reports')
      .select('*')
      .eq('id', reportId)
      .single()
    return { data, error }
  }

  async getReportByApplicationId(applicationId: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('dd_reports')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  }

  async getLatestReportData(applicationId: string): Promise<DbResult<{ report_data: unknown }>> {
    const { data, error } = await this.client
      .from('dd_reports')
      .select('report_data')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  }

  async updateLatestReport(
    applicationId: string,
    data: Record<string, any>
  ): Promise<{ error: Error | null }> {
    // Fetch the most recent report id first, then update by id to avoid
    // relying on .order().limit() chained with .update() (not supported by PostgREST).
    const { data: row, error: fetchError } = await this.client
      .from('dd_reports')
      .select('id')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (fetchError || !row) {
      return { error: fetchError }
    }

    const { error } = await this.client
      .from('dd_reports')
      .update(data)
      .eq('id', (row as Record<string, any>).id as string)

    return { error }
  }

  async deleteReports(applicationId: string): Promise<{ error: Error | null }> {
    const { error } = await this.client
      .from('dd_reports')
      .delete()
      .eq('application_id', applicationId)
    return { error }
  }

  // ---------------------------------------------------------------------------
  // Agent runs
  // ---------------------------------------------------------------------------

  async logAgentRun(data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('agent_runs')
      .insert(data)
      .select()
      .single()
    return { data: result, error }
  }

  async updateAgentRun(id: string, data: Record<string, any>): Promise<{ error: Error | null }> {
    const { error } = await this.client
      .from('agent_runs')
      .update(data)
      .eq('id', id)
    return { error }
  }

  async getLatestAgentRun(agentType: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('agent_runs')
      .select('*')
      .eq('agent_type', agentType)
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  }
}
