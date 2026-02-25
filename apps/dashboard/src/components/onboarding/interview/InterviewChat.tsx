'use client'

import { Button, Textarea } from '@sanctuary/ui'
import { useEffect, useRef, useState, useCallback } from 'react'
import { InterviewMessage, TypingIndicator } from './InterviewMessage'
import { InterviewProgressCompact } from './InterviewProgress'
import { useInterviewStore } from '@/lib/stores/interview-store'
import { Send, Pause, Square, Sparkles, Cpu, Loader2 } from 'lucide-react'
import type { InterviewSection, InterviewMessage as InterviewMessageType } from '@/types'

interface InterviewChatProps {
  applicationId: string
  onComplete?: () => void
  applicationContext?: {
    companyName: string
    companyOneLiner?: string
    industry?: string
    stage?: string
    problemStatement?: string
    solutionStatement?: string
  }
}

// API response type
interface ChatApiResponse {
  response: string
  shouldTransition: boolean
  isComplete: boolean
  signals?: Array<{
    type: string
    content: string
    dimension: string
    impact: number
  }>
  mode: 'live' | 'mock'
}

// Signal type for collection
interface CollectedSignal {
  type: string
  content: string
  dimension: 'founder' | 'problem' | 'user_value' | 'execution'
  impact: number
  sourceMessageId?: string
  section: string
  confidence?: number
}

export function InterviewChat({ applicationId, onComplete, applicationContext }: InterviewChatProps) {
  const [input, setInput] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const [aiMode, setAiMode] = useState<'live' | 'mock' | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [collectedSignals, setCollectedSignals] = useState<CollectedSignal[]>([])
  const [pauseCount, setPauseCount] = useState(0)
  const [totalPauseTime, setTotalPauseTime] = useState(0)
  const pauseStartRef = useRef<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasStartedRef = useRef(false)

  const {
    currentInterview,
    messages,
    isTyping,
    startInterview,
    addMessage,
    setTyping,
    transitionSection,
    completeInterview,
  } = useInterviewStore()

  // Save interview to database
  const saveInterviewToDb = useCallback(async (action: 'start' | 'complete', signals?: CollectedSignal[]) => {
    try {
      const payload = action === 'start'
        ? { action: 'start' }
        : {
            action: 'complete',
            transcript: messages.map(m => ({
              id: m.id,
              interviewId: currentInterview?.id || '',
              role: m.role,
              content: m.content,
              section: m.section,
              sequenceNumber: m.sequenceNumber,
              createdAt: m.createdAt,
            })),
            signals: signals || collectedSignals,
            startedAt: currentInterview?.startedAt || new Date().toISOString(),
            completedAt: new Date().toISOString(),
            durationMinutes: currentInterview?.durationMinutes || 0,
            aiModel: currentInterview?.aiModel || 'claude-sonnet-4-20250514',
            pauses: pauseCount,
            totalPauseTime: totalPauseTime,
          }

      const response = await fetch(`/api/applications/${applicationId}/interview`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const data = await response.json()
        console.error(`Failed to ${action} interview:`, data.error)
      }
    } catch (error) {
      console.error(`Error saving interview (${action}):`, error)
    }
  }, [applicationId, messages, currentInterview, collectedSignals, pauseCount, totalPauseTime])

  // Initialize interview if not started
  useEffect(() => {
    if (!currentInterview && !hasStartedRef.current) {
      hasStartedRef.current = true
      startInterview(applicationId)
      // Mark interview as started in database
      saveInterviewToDb('start')
    }
  }, [applicationId, currentInterview, startInterview, saveInterviewToDb])

  // Send opening message when interview starts
  useEffect(() => {
    if (currentInterview && messages.length === 0) {
      const openingMessage = "Welcome to your Sanctuary interview. I'm going to ask you some direct questions to understand you and your startup better. This will take about 45-60 minutes. Let's begin.\n\nTell me about yourself in 60 seconds. Not your resume — who are you as a person?"
      setTyping(true)

      const timer = setTimeout(() => {
        addMessage({
          interviewId: currentInterview.id,
          role: 'assistant',
          content: openingMessage,
          section: currentInterview.currentSection,
        })
        setTyping(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [currentInterview, messages.length, addMessage, setTyping])

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim() || isTyping || !currentInterview || isPaused) return

    const userMessage = input.trim()
    setInput('')

    // Add user message
    addMessage({
      interviewId: currentInterview.id,
      role: 'user',
      content: userMessage,
      section: currentInterview.currentSection,
    })

    // Show typing indicator
    setTyping(true)

    try {
      // Call the interview chat API
      const response = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          interviewId: currentInterview.id,
          applicationId,
          message: userMessage,
          currentSection: currentInterview.currentSection,
          messageHistory: messages,
          applicationContext,
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data: ChatApiResponse = await response.json()

      // Track which mode we're in
      if (data.mode && aiMode !== data.mode) {
        setAiMode(data.mode)
      }

      // Collect signals from the response
      if (data.signals && data.signals.length > 0) {
        const newSignals: CollectedSignal[] = data.signals.map(signal => ({
          type: signal.type,
          content: signal.content,
          dimension: signal.dimension as 'founder' | 'problem' | 'user_value' | 'execution',
          impact: signal.impact,
          section: currentInterview.currentSection,
          sourceMessageId: messages[messages.length - 1]?.id, // Last user message
          confidence: 0.8, // Default confidence
        }))
        setCollectedSignals(prev => [...prev, ...newSignals])
      }

      // Handle section transition
      if (data.shouldTransition) {
        transitionSection()
      }

      // Add AI response
      addMessage({
        interviewId: currentInterview.id,
        role: 'assistant',
        content: data.response,
        section: data.shouldTransition
          ? getNextSection(currentInterview.currentSection)
          : currentInterview.currentSection,
      })

      // Handle interview completion
      if (data.isComplete) {
        completeInterview()
        // Save completed interview to database
        setIsSaving(true)
        await saveInterviewToDb('complete')
        setIsSaving(false)
        onComplete?.()
      }
    } catch (error) {
      console.error('Error processing message:', error)
      addMessage({
        interviewId: currentInterview.id,
        role: 'assistant',
        content: "I apologize, but I encountered an issue. Let's continue - could you repeat that?",
        section: currentInterview.currentSection,
      })
    } finally {
      setTyping(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleEndInterview = async () => {
    if (confirm('Are you sure you want to end the interview early? Your progress will be saved.')) {
      completeInterview()
      // Save completed interview to database
      setIsSaving(true)
      await saveInterviewToDb('complete')
      setIsSaving(false)
      onComplete?.()
    }
  }

  const getNextSection = (current: InterviewSection): InterviewSection => {
    const sections: InterviewSection[] = [
      'founder_dna',
      'problem_interrogation',
      'solution_execution',
      'market_competition',
      'sanctuary_fit',
    ]
    const currentIndex = sections.indexOf(current)
    return sections[Math.min(currentIndex + 1, sections.length - 1)]
  }

  if (!currentInterview) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-pulse text-muted-foreground">Initializing interview...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] max-h-[800px] bg-background rounded-lg border">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-3">
          <InterviewProgressCompact currentSection={currentInterview.currentSection} />
          {aiMode && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${
              aiMode === 'live'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {aiMode === 'live' ? <Sparkles className="h-3 w-3" /> : <Cpu className="h-3 w-3" />}
              {aiMode === 'live' ? 'AI' : 'Demo'}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (isPaused) {
                // Resuming - calculate pause time
                if (pauseStartRef.current) {
                  const pauseDuration = (Date.now() - pauseStartRef.current) / 1000
                  setTotalPauseTime(prev => prev + pauseDuration)
                  pauseStartRef.current = null
                }
              } else {
                // Pausing - record start time
                pauseStartRef.current = Date.now()
                setPauseCount(prev => prev + 1)
              }
              setIsPaused(!isPaused)
            }}
            className="text-muted-foreground"
          >
            {isPaused ? (
              <>
                <Send className="h-4 w-4 mr-1" />
                Resume
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-1" />
                Pause
              </>
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEndInterview}
            className="text-destructive hover:text-destructive"
          >
            <Square className="h-4 w-4 mr-1" />
            End
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <InterviewMessage
            key={message.id}
            role={message.role}
            content={message.content}
            timestamp={message.createdAt}
          />
        ))}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Paused overlay */}
      {isPaused && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Pause className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-lg font-medium">Interview Paused</p>
            <p className="text-sm text-muted-foreground mb-4">
              Take your time. Click Resume when you&apos;re ready.
            </p>
            <Button onClick={() => setIsPaused(false)}>
              <Send className="h-4 w-4 mr-2" />
              Resume Interview
            </Button>
          </div>
        </div>
      )}

      {/* Saving overlay */}
      {isSaving && (
        <div className="absolute inset-0 bg-background/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <Loader2 className="h-12 w-12 mx-auto text-primary mb-2 animate-spin" />
            <p className="text-lg font-medium">Saving Interview</p>
            <p className="text-sm text-muted-foreground">
              Please wait while we save your interview...
            </p>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t bg-muted/10">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isPaused ? 'Interview paused...' : 'Type your response...'}
            disabled={isTyping || isPaused}
            className="min-h-[60px] max-h-[150px] resize-none"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isTyping || isPaused}
            size="lg"
            className="px-6"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
