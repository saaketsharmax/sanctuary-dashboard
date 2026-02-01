'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { InterviewMessage, TypingIndicator } from './InterviewMessage'
import { InterviewProgressCompact } from './InterviewProgress'
import { useInterviewStore } from '@/lib/stores/interview-store'
import { getInterviewAgent } from '@/lib/ai/agents/interview-agent'
import { Send, Pause, Square } from 'lucide-react'
import type { InterviewSection } from '@/types'

interface InterviewChatProps {
  applicationId: string
  onComplete?: () => void
}

export function InterviewChat({ applicationId, onComplete }: InterviewChatProps) {
  const [input, setInput] = useState('')
  const [isPaused, setIsPaused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

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

  const agent = getInterviewAgent()

  // Initialize interview if not started
  useEffect(() => {
    if (!currentInterview) {
      startInterview(applicationId)
    }
  }, [applicationId, currentInterview, startInterview])

  // Send opening message when interview starts
  useEffect(() => {
    if (currentInterview && messages.length === 0) {
      const openingMessage = agent.getOpeningMessage()
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
  }, [currentInterview, messages.length, addMessage, setTyping, agent])

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
      // Get AI response
      const { response, shouldTransition, isComplete } = await agent.processMessage(
        userMessage,
        currentInterview.currentSection,
        messages
      )

      // Handle section transition
      if (shouldTransition) {
        transitionSection()
      }

      // Add AI response
      addMessage({
        interviewId: currentInterview.id,
        role: 'assistant',
        content: response,
        section: shouldTransition
          ? getNextSection(currentInterview.currentSection)
          : currentInterview.currentSection,
      })

      // Handle interview completion
      if (isComplete) {
        completeInterview()
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

  const handleEndInterview = () => {
    if (confirm('Are you sure you want to end the interview early? Your progress will be saved.')) {
      completeInterview()
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
        <InterviewProgressCompact currentSection={currentInterview.currentSection} />
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPaused(!isPaused)}
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
