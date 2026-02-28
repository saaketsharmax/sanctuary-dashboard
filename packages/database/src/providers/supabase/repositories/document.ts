import type { SupabaseClient } from '@supabase/supabase-js'
import type { IDocumentRepository, DbResult, DbListResult } from '../../../repositories/interfaces'

const FULL_FIELDS = 'id, name, type, file_url, file_size, mime_type, version, is_current, created_at, uploaded_by, users!documents_uploaded_by_fkey(name)'
const DD_FIELDS = 'id, name, type, file_url'
const ID_URL_FIELDS = 'id, file_url'

export class SupabaseDocumentRepository implements IDocumentRepository {
  constructor(private client: SupabaseClient) {}

  async getByStartupId(
    startupId: string,
    options?: { currentOnly?: boolean; fields?: string }
  ): Promise<DbListResult<Record<string, any>>> {
    const fields = options?.fields ?? FULL_FIELDS
    let query = this.client
      .from('documents')
      .select(fields)
      .eq('startup_id', startupId)
    if (options?.currentOnly) {
      query = query.eq('is_current', true)
    }
    const { data, error } = await query
    return { data: data || [], error }
  }

  async create(data: Record<string, any>): Promise<DbResult<Record<string, any>>> {
    const { data: result, error } = await this.client
      .from('documents')
      .insert(data)
      .select()
      .single()
    return { data: result, error }
  }

  async getById(id: string, startupId: string): Promise<DbResult<Record<string, any>>> {
    const { data, error } = await this.client
      .from('documents')
      .select(ID_URL_FIELDS)
      .eq('id', id)
      .eq('startup_id', startupId)
      .single()
    return { data, error }
  }

  async delete(id: string): Promise<{ error: Error | null }> {
    const { error } = await this.client
      .from('documents')
      .delete()
      .eq('id', id)
    return { error }
  }

  async markNotCurrent(startupId: string, docName: string, docType: string): Promise<{ error: Error | null }> {
    const { error } = await this.client
      .from('documents')
      .update({ is_current: false })
      .eq('startup_id', startupId)
      .eq('name', docName)
      .eq('type', docType)
    return { error }
  }

  async getMaxVersion(startupId: string, docName: string): Promise<DbResult<{ version: number }>> {
    const { data, error } = await this.client
      .from('documents')
      .select('version')
      .eq('startup_id', startupId)
      .eq('name', docName)
      .order('version', { ascending: false })
      .limit(1)
      .single()
    return { data, error }
  }
}
