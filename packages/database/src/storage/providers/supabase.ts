// Supabase implementation of StorageProvider

import type { SupabaseClient } from '@supabase/supabase-js'
import type { StorageProvider } from '../interfaces'

export class SupabaseStorageProvider implements StorageProvider {
  constructor(private client: SupabaseClient) {}

  async upload(
    bucket: string,
    path: string,
    file: File | Blob
  ): Promise<{ path: string | null; error: Error | null }> {
    const { data, error } = await this.client.storage
      .from(bucket)
      .upload(path, file)
    return { path: data?.path ?? null, error }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.client.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }

  async remove(
    bucket: string,
    paths: string[]
  ): Promise<{ error: Error | null }> {
    const { error } = await this.client.storage.from(bucket).remove(paths)
    return { error }
  }
}
