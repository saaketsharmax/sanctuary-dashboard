import type { SupabaseClient } from '@supabase/supabase-js'
import type { IUserRepository, DbResult, DbListResult } from '../../../repositories/interfaces'

// Helper: cast PostgrestError to the Error | null shape the interface expects.
// PostgrestError is structurally compatible at runtime; the cast is safe here.
function castError(e: unknown): Error | null {
  return e as Error | null
}

export class SupabaseUserRepository implements IUserRepository {
  constructor(private client: SupabaseClient) {}

  async getById(id: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', id)
      .single()
    return { data: data as Record<string, any> | null, error: castError(error) }
  }

  async getByField(field: string, value: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq(field, value)
      .single()
    return { data: data as Record<string, any> | null, error: castError(error) }
  }

  async update(id: string, data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    return { data: result as Record<string, any> | null, error: castError(error) }
  }

  async getUserType(id: string): Promise<DbResult<{ user_type: string | null }>> {
    const { data, error } = await this.client
      .from('users')
      .select('user_type')
      .eq('id', id)
      .single()
    return { data: data as { user_type: string | null } | null, error: castError(error) }
  }

  async getPartners(subTypes?: string[]): Promise<DbListResult<Record<string, any>>> {
    let query = this.client
      .from('users')
      .select('*')
      .eq('user_type', 'partner')
    if (subTypes && subTypes.length > 0) {
      query = query.in('partner_sub_type', subTypes)
    }
    const { data, error } = await query
    return { data: (data as Record<string, any>[] | null) || [], error: castError(error) }
  }
}
