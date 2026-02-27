'use client'

import { cn } from '@sanctuary/ui'
import { Bot, User } from 'lucide-react'

interface InterviewMessageProps {
  role: 'system' | 'assistant' | 'user'
  content: string
  timestamp?: string
}

export function InterviewMessage({ role, content, timestamp }: InterviewMessageProps) {
  // Treat system messages like assistant messages for display
  const isAssistant = role === 'assistant' || role === 'system'

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isAssistant ? 'self-start' : 'self-end flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isAssistant ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      {/* Message Bubble */}
      <div
        className={cn(
          'rounded-2xl px-4 py-3',
          isAssistant
            ? 'bg-muted rounded-tl-none'
            : 'bg-primary text-primary-foreground rounded-tr-none'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{content}</p>
        {timestamp && (
          <p
            className={cn(
              'text-[10px] mt-1',
              isAssistant ? 'text-muted-foreground' : 'text-primary-foreground/70'
            )}
          >
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  )
}

export function TypingIndicator() {
  return (
    <div className="flex gap-3 max-w-[85%] self-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
        <Bot className="h-4 w-4" />
      </div>
      <div className="bg-muted rounded-2xl rounded-tl-none px-4 py-3">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" />
        </div>
      </div>
    </div>
  )
}
