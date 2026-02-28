import type { SupabaseClient } from '@supabase/supabase-js'
import type { IApplicationRepository, DbResult, DbListResult } from '../../../repositories/interfaces'

// Helper: cast PostgrestError to the Error | null shape the interface expects.
// PostgrestError is structurally compatible at runtime; the cast is safe here.
function castError(e: unknown): Error | null {
  return e as Error | null
}

export class SupabaseApplicationRepository implements IApplicationRepository {
  constructor(private client: SupabaseClient) {}

  // -------------------------------------------------------
  // applications table
  // -------------------------------------------------------

  async create(data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('applications')
      .insert(data)
      .select()
      .single()
    return { data: result as Record<string, any> | null, error: castError(error) }
  }

  async getById(id: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('applications')
      .select('*')
      .eq('id', id)
      .single()
    return { data: data as Record<string, any> | null, error: castError(error) }
  }

  async getByIdWithFields(id: string, fields: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('applications')
      .select(fields)
      .eq('id', id)
      .single()
    return { data: data as Record<string, any> | null, error: castError(error) }
  }

  async getByUserId(userId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data: (data as Record<string, any>[] | null) || [], error: castError(error) }
  }

  async getAll(fields?: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('applications')
      .select(fields ?? '*')
      .order('created_at', { ascending: false })
    return { data: (data as Record<string, any>[] | null) || [], error: castError(error) }
  }

  async getAllFiltered(
    filters: {
      reviewDecisionNotNull?: boolean
      reviewedAtGte?: string
    },
    fields?: string,
  ): Promise<DbListResult<Record<string, any>>> {
    let query = this.client
      .from('applications')
      .select(fields ?? '*')

    if (filters.reviewDecisionNotNull) {
      query = query.not('review_decision', 'is', null)
    }
    if (filters.reviewedAtGte) {
      query = query.gte('reviewed_at', filters.reviewedAtGte)
    }

    const { data, error } = await query
    return { data: (data as Record<string, any>[] | null) || [], error: castError(error) }
  }

  async update(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    // Fire-and-forget update — no .select() return
    const { data: result, error } = await this.client
      .from('applications')
      .update(data)
      .eq('id', id)
    return { data: (result as Record<string, any> | null) ?? null, error: castError(error) }
  }

  async updateAndReturn(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('applications')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    return { data: result as Record<string, any> | null, error: castError(error) }
  }

  // -------------------------------------------------------
  // interview_signals table
  // -------------------------------------------------------

  async insertSignals(signals: Record<string, any>[]): Promise<DbResult<null>> {
    const { error } = await this.client
      .from('interview_signals')
      .insert(signals)
    return { data: null, error: castError(error) }
  }

  async getSignals(applicationId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('interview_signals')
      .select('*')
      .eq('application_id', applicationId)
    return { data: (data as Record<string, any>[] | null) || [], error: castError(error) }
  }

  async getSignalsFiltered(filters: { createdAtGte?: string }): Promise<DbListResult<Record<string, any>>> {
    let query = this.client
      .from('interview_signals')
      .select('*')

    if (filters.createdAtGte) {
      query = query.gte('created_at', filters.createdAtGte)
    }

    const { data, error } = await query
    return { data: (data as Record<string, any>[] | null) || [], error: castError(error) }
  }

  // -------------------------------------------------------
  // assessment_feedback table
  // -------------------------------------------------------

  async insertFeedback(data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('assessment_feedback')
      .insert(data)
      .select()
      .single()
    return { data: result as Record<string, any> | null, error: castError(error) }
  }

  async getFeedback(applicationId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('assessment_feedback')
      .select('*')
      .eq('application_id', applicationId)
      .order('created_at', { ascending: false })
    return { data: (data as Record<string, any>[] | null) || [], error: castError(error) }
  }

  async getAllFeedback(): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('assessment_feedback')
      .select('*')
      .order('created_at', { ascending: true })
    return { data: (data as Record<string, any>[] | null) || [], error: castError(error) }
  }

  async getAllFeedbackFiltered(filters: { createdAtGte?: string }): Promise<DbListResult<Record<string, any>>> {
    let query = this.client
      .from('assessment_feedback')
      .select('*')

    if (filters.createdAtGte) {
      query = query.gte('created_at', filters.createdAtGte)
    }

    const { data, error } = await query
    return { data: (data as Record<string, any>[] | null) || [], error: castError(error) }
  }

  // -------------------------------------------------------
  // founders table
  // -------------------------------------------------------

  async getFounders(applicationId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('founders')
      .select('*')
      .eq('application_id', applicationId)
    return { data: (data as Record<string, any>[] | null) || [], error: castError(error) }
  }
}
