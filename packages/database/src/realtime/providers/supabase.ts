// Supabase implementation of RealtimeProvider

import type { SupabaseClient } from '@supabase/supabase-js'
import type { RealtimeProvider, RealtimeSubscriptionConfig, RealtimePayload } from '../interfaces'

export class SupabaseRealtimeProvider implements RealtimeProvider {
  constructor(private client: SupabaseClient) {}

  subscribe(
    config: RealtimeSubscriptionConfig,
    callback: (payload: RealtimePayload) => void
  ): { unsubscribe: () => void } {
    const channelConfig: {
      event: string
      schema: string
      table: string
      filter?: string
    } = {
      event: config.event,
      schema: 'public',
      table: config.table,
    }
    if (config.filter) {
      channelConfig.filter = config.filter
    }

    const channel = this.client
      .channel(config.channel)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on(
        'postgres_changes' as const,
        channelConfig as any,
        (payload: Record<string, unknown>) => {
          callback({
            eventType: payload.eventType as string,
            new: (payload.new as Record<string, unknown>) || null,
            old: (payload.old as Record<string, unknown>) || null,
          })
        },
      )
      .subscribe()

    return {
      unsubscribe: () => {
        this.client.removeChannel(channel)
      },
    }
  }
}
