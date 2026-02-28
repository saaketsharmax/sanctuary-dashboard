// Realtime provider interface — decouples realtime subscriptions from any specific service

export interface RealtimePayload {
  eventType: string
  new: Record<string, unknown> | null
  old: Record<string, unknown> | null
}

export interface RealtimeSubscriptionConfig {
  channel: string
  table: string
  event: '*' | 'INSERT' | 'UPDATE' | 'DELETE'
  filter?: string
}

export interface RealtimeProvider {
  subscribe(
    config: RealtimeSubscriptionConfig,
    callback: (payload: RealtimePayload) => void
  ): { unsubscribe: () => void }
}
