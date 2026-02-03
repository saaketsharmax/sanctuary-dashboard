// KYR (Know Your Resident) Types
export interface KYRProfile {
  id: string
  userId: string

  // Identity & Work
  fullName: string
  preferredName: string
  pronouns: string
  role: string // Founder, Engineer, Designer, etc.
  company?: string
  workingOn: string // What are you building?
  expertise: string[] // Skills to offer
  seeking: string[] // Skills/help needed

  // Preferences
  workStyle: 'early-bird' | 'night-owl' | 'flexible'
  collaborationPreference: 'solo' | 'pair' | 'team' | 'any'
  noisePreference: 'silent' | 'ambient' | 'music' | 'any'
  meetingPreference: 'morning' | 'afternoon' | 'evening' | 'any'

  // Personal
  hometown?: string
  languages: string[]
  hobbies: string[]

  // Food & Drink
  dietaryRestrictions: string[]
  favoriteCuisine: string[]
  coffeeOrder?: string

  // Fun Facts
  superpower?: string // What's your secret skill?
  currentlyReading?: string
  currentlyWatching?: string
  walkSong?: string // Song that plays when you enter

  // Contact
  slackHandle?: string
  linkedIn?: string
  twitter?: string
  personalSite?: string

  // Status
  avatarUrl?: string
  bio?: string
  isPublic: boolean
  createdAt: string
  updatedAt: string
}

// Events Types
export type EventCategory =
  | 'workshop'
  | 'social'
  | 'pitch'
  | 'networking'
  | 'wellness'
  | 'learning'
  | 'celebration'
  | 'external'

export type RSVPStatus = 'attending' | 'maybe' | 'declined' | 'waitlist'

export interface CommunityEvent {
  id: string
  title: string
  description: string
  category: EventCategory

  // Timing
  date: string // ISO date
  startTime: string // HH:MM
  endTime: string // HH:MM
  isAllDay: boolean
  isRecurring: boolean
  recurrencePattern?: string

  // Location
  location: string // "Collab Zone", "Rooftop", "Virtual", etc.
  isVirtual: boolean
  virtualLink?: string

  // Capacity
  capacity?: number
  spotsRemaining?: number
  hasWaitlist: boolean

  // Host
  hostId: string
  hostName: string
  hostAvatarUrl?: string

  // Engagement
  rsvpCount: number
  comments: EventComment[]

  // Meta
  imageUrl?: string
  tags: string[]
  isHighlight: boolean // Featured event
  createdAt: string
}

export interface EventRSVP {
  id: string
  eventId: string
  userId: string
  userName: string
  userAvatarUrl?: string
  status: RSVPStatus
  note?: string
  createdAt: string
}

export interface EventComment {
  id: string
  eventId: string
  userId: string
  userName: string
  userAvatarUrl?: string
  content: string
  createdAt: string
}

// Check-in Types
export type CheckInLocation =
  | 'main-floor'
  | 'collab-zone'
  | 'quiet-zone'
  | 'phone-booth'
  | 'rooftop'
  | 'cafe'
  | 'meeting-room'

export interface CheckIn {
  id: string
  userId: string
  userName: string
  userAvatarUrl?: string
  userRole?: string
  userCompany?: string

  checkInTime: string
  checkOutTime?: string
  location: CheckInLocation
  status: string // "Heads down coding", "Open to chat", etc.

  // For visitors
  isVisitor: boolean
  visitorCompany?: string
  visitorPurpose?: string
  hostId?: string
  hostName?: string
}

// Community Board Types
export type PostCategory =
  | 'announcement'
  | 'ask'
  | 'offer'
  | 'lost-found'
  | 'event'
  | 'shoutout'
  | 'discussion'

export interface BoardPost {
  id: string
  authorId: string
  authorName: string
  authorAvatarUrl?: string

  title: string
  content: string
  category: PostCategory

  // Engagement
  reactions: PostReaction[]
  commentCount: number

  // Meta
  isPinned: boolean
  expiresAt?: string
  createdAt: string
}

export interface PostReaction {
  emoji: string
  count: number
  userIds: string[]
}

// Celebration Types
export type CelebrationType =
  | 'birthday'
  | 'work-anniversary'
  | 'funding'
  | 'launch'
  | 'milestone'
  | 'welcome'

export interface Celebration {
  id: string
  userId: string
  userName: string
  userAvatarUrl?: string

  type: CelebrationType
  title: string
  description?: string
  date: string

  // For milestones
  milestoneType?: string
  milestoneValue?: string
}

// Space Types
export interface Space {
  id: string
  name: string
  type: 'desk' | 'meeting-room' | 'phone-booth' | 'event-space' | 'common-area'
  capacity: number
  floor: number
  amenities: string[]
  isBookable: boolean
  currentOccupancy: number
}

// Visitor Types
export interface Visitor {
  id: string
  name: string
  company?: string
  purpose: string
  hostId: string
  hostName: string
  checkInTime: string
  checkOutTime?: string
  badgeNumber?: string
  photoUrl?: string
}
