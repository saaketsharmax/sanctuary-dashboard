// Shared database types
// These will be generated from Supabase schema

export type UserRole = 'founder' | 'partner' | 'mentor' | null
export type PartnerSubType = 'mentor' | 'vc' | 'startup_manager' | null

export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  user_type: UserRole
  partner_sub_type: PartnerSubType
  startup_id: string | null
  onboarding_complete: boolean
  created_at: string
  updated_at: string
}

export interface Startup {
  id: string
  name: string
  description: string | null
  stage: string | null
  sector: string | null
  website: string | null
  founded_date: string | null
  team_size: number | null
  funding_raised: number | null
  mrr: number | null
  created_at: string
  updated_at: string
}

export interface Event {
  id: string
  title: string
  description: string | null
  event_type: 'workshop' | 'fitness' | 'sports' | 'social' | 'speaker' | 'office_hours' | 'community'
  start_time: string
  end_time: string
  location: string | null
  capacity: number | null
  registered_count: number
  is_resident_only: boolean
  created_by: string
  created_at: string
  updated_at: string
}
