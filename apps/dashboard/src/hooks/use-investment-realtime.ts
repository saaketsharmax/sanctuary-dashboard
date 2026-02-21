'use client'

import { useEffect, useRef } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type Payload = RealtimePostgresChangesPayload<Record<string, unknown>>

interface UseInvestmentRealtimeOptions {
  investmentId?: string | null
  isMock: boolean
  onUpdate: () => void
  onEvent?: (payload: Payload) => void
}

export function useInvestmentRealtime({
  investmentId,
  isMock,
  onUpdate,
  onEvent,
}: UseInvestmentRealtimeOptions) {
  const onUpdateRef = useRef(onUpdate)
  const onEventRef = useRef(onEvent)

  // Keep refs current without re-subscribing
  useEffect(() => {
    onUpdateRef.current = onUpdate
  }, [onUpdate])

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    if (isMock || !isSupabaseConfigured()) return

    const supabase = createClient()
    let debounceTimer: ReturnType<typeof setTimeout> | null = null

    const channelName = investmentId
      ? `investment-txns-${investmentId}`
      : 'investment-txns-all'

    const filter = investmentId
      ? `investment_id=eq.${investmentId}`
      : undefined

    const channelConfig: Parameters<typeof channel['on']> extends never[]
      ? never
      : {
          event: '*'
          schema: 'public'
          table: 'investment_transactions'
          filter?: string
        } = {
      event: '*',
      schema: 'public',
      table: 'investment_transactions',
      ...(filter ? { filter } : {}),
    }

    let channel: RealtimeChannel

    // Build channel with subscription
    channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes' as const,
        channelConfig as Record<string, unknown>,
        (payload: Payload) => {
          // Fire event callback immediately (for toasts)
          onEventRef.current?.(payload)

          // Debounce the refetch to coalesce batch operations
          if (debounceTimer) clearTimeout(debounceTimer)
          debounceTimer = setTimeout(() => {
            onUpdateRef.current()
          }, 300)
        },
      )
      .subscribe()

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer)
      supabase.removeChannel(channel)
    }
  }, [investmentId, isMock])
}
