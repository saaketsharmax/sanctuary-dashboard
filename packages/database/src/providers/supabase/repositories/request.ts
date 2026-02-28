import type { SupabaseClient } from '@supabase/supabase-js'
import type { IRequestRepository, DbResult, DbListResult } from '../../../repositories/interfaces'

export class SupabaseRequestRepository implements IRequestRepository {
  constructor(private client: SupabaseClient) {}

  async getByStartupId(startupId: string): Promise<DbListResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('founder_requests')
      .select('id, type, title, description, status, priority, created_at, updated_at, assigned_to, resolution_notes, resolved_at, users!founder_requests_assigned_to_fkey(name)')
      .eq('startup_id', startupId)
      .order('created_at', { ascending: false })
    return { data: data || [], error }
  }

  async create(data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('founder_requests')
      .insert(data)
      .select()
      .single()
    return { data: result, error }
  }

  async getByIdForOwner(id: string, userId: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('founder_requests')
      .select('id, status, created_by')
      .eq('id', id)
      .eq('created_by', userId)
      .single()
    return { data, error }
  }

  async update(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('founder_requests')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    return { data: result, error }
  }
}
