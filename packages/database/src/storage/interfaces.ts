// Storage provider interface — decouples file storage from any specific service

export interface StorageProvider {
  upload(bucket: string, path: string, file: File | Blob): Promise<{ path: string | null; error: Error | null }>
  getPublicUrl(bucket: string, path: string): string
  remove(bucket: string, paths: string[]): Promise<{ error: Error | null }>
}
