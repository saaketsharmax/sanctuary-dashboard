import { create } from 'zustand'
import type {
  KYRProfile,
  CommunityEvent,
  EventRSVP,
  CheckIn,
  BoardPost,
  Celebration,
  Visitor,
} from '@/types'

// Mock current user
const CURRENT_USER = {
  id: 'user-1',
  name: 'Alex Chen',
  avatarUrl: null,
}

interface CommunityState {
  // Current user
  currentUser: typeof CURRENT_USER

  // Residents
  residents: KYRProfile[]
  setResidents: (residents: KYRProfile[]) => void

  // Events
  events: CommunityEvent[]
  setEvents: (events: CommunityEvent[]) => void
  rsvps: EventRSVP[]
  addRSVP: (eventId: string, status: EventRSVP['status']) => void

  // Check-ins
  checkIns: CheckIn[]
  setCheckIns: (checkIns: CheckIn[]) => void
  checkIn: (location: CheckIn['location'], status: string) => void
  checkOut: () => void

  // Board
  posts: BoardPost[]
  setPosts: (posts: BoardPost[]) => void
  addPost: (post: Omit<BoardPost, 'id' | 'createdAt' | 'reactions' | 'commentCount'>) => void

  // Celebrations
  celebrations: Celebration[]
  setCelebrations: (celebrations: Celebration[]) => void

  // Visitors
  visitors: Visitor[]
  setVisitors: (visitors: Visitor[]) => void

  // Occupancy
  currentOccupancy: number
  maxCapacity: number
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  currentUser: CURRENT_USER,

  // Residents
  residents: [],
  setResidents: (residents) => set({ residents }),

  // Events
  events: [],
  setEvents: (events) => set({ events }),
  rsvps: [],
  addRSVP: (eventId, status) => {
    const { currentUser, rsvps } = get()
    const existingIndex = rsvps.findIndex(
      (r) => r.eventId === eventId && r.userId === currentUser.id
    )

    const newRSVP: EventRSVP = {
      id: `rsvp-${Date.now()}`,
      eventId,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatarUrl: currentUser.avatarUrl ?? undefined,
      status,
      createdAt: new Date().toISOString(),
    }

    if (existingIndex >= 0) {
      const updated = [...rsvps]
      updated[existingIndex] = newRSVP
      set({ rsvps: updated })
    } else {
      set({ rsvps: [...rsvps, newRSVP] })
    }
  },

  // Check-ins
  checkIns: [],
  setCheckIns: (checkIns) => set({ checkIns }),
  checkIn: (location, status) => {
    const { currentUser, checkIns } = get()

    // Check out first if already checked in
    const existingCheckIn = checkIns.find(
      (c) => c.userId === currentUser.id && !c.checkOutTime
    )

    let updatedCheckIns = checkIns
    if (existingCheckIn) {
      updatedCheckIns = checkIns.map((c) =>
        c.id === existingCheckIn.id
          ? { ...c, checkOutTime: new Date().toISOString() }
          : c
      )
    }

    const newCheckIn: CheckIn = {
      id: `checkin-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatarUrl: currentUser.avatarUrl ?? undefined,
      checkInTime: new Date().toISOString(),
      location,
      status,
      isVisitor: false,
    }

    set({ checkIns: [...updatedCheckIns, newCheckIn] })
  },
  checkOut: () => {
    const { currentUser, checkIns } = get()
    set({
      checkIns: checkIns.map((c) =>
        c.userId === currentUser.id && !c.checkOutTime
          ? { ...c, checkOutTime: new Date().toISOString() }
          : c
      ),
    })
  },

  // Board
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (postData) => {
    const { currentUser, posts } = get()
    const newPost: BoardPost = {
      ...postData,
      id: `post-${Date.now()}`,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatarUrl: currentUser.avatarUrl ?? undefined,
      reactions: [],
      commentCount: 0,
      createdAt: new Date().toISOString(),
    }
    set({ posts: [newPost, ...posts] })
  },

  // Celebrations
  celebrations: [],
  setCelebrations: (celebrations) => set({ celebrations }),

  // Visitors
  visitors: [],
  setVisitors: (visitors) => set({ visitors }),

  // Occupancy
  currentOccupancy: 23,
  maxCapacity: 50,
}))
