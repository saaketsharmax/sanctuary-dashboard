import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Interview, InterviewMessage, InterviewSection } from '@/types'
import { INTERVIEW_SECTIONS } from '@/types'

interface InterviewState {
  // Current interview session
  currentInterview: Interview | null
  messages: InterviewMessage[]
  isTyping: boolean
  error: string | null

  // Actions
  startInterview: (applicationId: string) => void
  addMessage: (message: Omit<InterviewMessage, 'id' | 'createdAt' | 'sequenceNumber'>) => void
  setTyping: (typing: boolean) => void
  transitionSection: () => void
  completeInterview: () => void
  resetInterview: () => void
  setError: (error: string | null) => void
}

const generateId = () => `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set, get) => ({
      currentInterview: null,
      messages: [],
      isTyping: false,
      error: null,

      startInterview: (applicationId: string) => {
        const interview: Interview = {
          id: `interview-${Date.now()}`,
          applicationId,
          status: 'in_progress',
          currentSection: 'founder_dna',
          startedAt: new Date().toISOString(),
          completedAt: null,
          durationMinutes: null,
          aiModel: 'claude-sonnet-4-20250514',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }

        set({
          currentInterview: interview,
          messages: [],
          isTyping: false,
          error: null,
        })
      },

      addMessage: (message) => {
        set((state) => {
          const newMessage: InterviewMessage = {
            ...message,
            id: generateId(),
            sequenceNumber: state.messages.length + 1,
            createdAt: new Date().toISOString(),
          }
          return {
            messages: [...state.messages, newMessage],
          }
        })
      },

      setTyping: (typing: boolean) => {
        set({ isTyping: typing })
      },

      transitionSection: () => {
        set((state) => {
          if (!state.currentInterview) return state

          const currentIndex = INTERVIEW_SECTIONS.findIndex(
            (s) => s.value === state.currentInterview?.currentSection
          )

          if (currentIndex < INTERVIEW_SECTIONS.length - 1) {
            const nextSection = INTERVIEW_SECTIONS[currentIndex + 1].value as InterviewSection

            return {
              currentInterview: {
                ...state.currentInterview,
                currentSection: nextSection,
                updatedAt: new Date().toISOString(),
              },
            }
          }

          return state
        })
      },

      completeInterview: () => {
        set((state) => {
          if (!state.currentInterview) return state

          const startedAt = new Date(state.currentInterview.startedAt || Date.now())
          const completedAt = new Date()
          const durationMinutes = Math.round((completedAt.getTime() - startedAt.getTime()) / 60000)

          return {
            currentInterview: {
              ...state.currentInterview,
              status: 'completed',
              completedAt: completedAt.toISOString(),
              durationMinutes,
              updatedAt: completedAt.toISOString(),
            },
          }
        })
      },

      resetInterview: () => {
        set({
          currentInterview: null,
          messages: [],
          isTyping: false,
          error: null,
        })
      },

      setError: (error: string | null) => {
        set({ error })
      },
    }),
    {
      name: 'sanctuary-interview',
      partialize: (state) => ({
        currentInterview: state.currentInterview,
        messages: state.messages,
      }),
    }
  )
)

// Helper hooks
export function useCurrentSection() {
  const currentInterview = useInterviewStore((state) => state.currentInterview)
  if (!currentInterview) return null

  return INTERVIEW_SECTIONS.find((s) => s.value === currentInterview.currentSection) || null
}

export function getSectionProgress(section: InterviewSection): number {
  const index = INTERVIEW_SECTIONS.findIndex((s) => s.value === section)
  return ((index + 1) / INTERVIEW_SECTIONS.length) * 100
}
