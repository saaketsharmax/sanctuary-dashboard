'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ScrollArea,
  cn,
} from '@sanctuary/ui'
import { useState } from 'react'
import { Bot, User, ChevronDown, ChevronRight, Clock, Cpu, Quote } from 'lucide-react'
import type { Interview, InterviewMessage, InterviewSection, TranscriptHighlight } from '@/types'
import { INTERVIEW_SECTIONS, getInterviewSectionInfo } from '@/types'

interface InterviewTranscriptViewerProps {
  messages: InterviewMessage[]
  interview: Interview
  highlights?: TranscriptHighlight[]
}

interface MessageBubbleProps {
  message: InterviewMessage
  isHighlighted?: boolean
}

function MessageBubble({ message, isHighlighted }: MessageBubbleProps) {
  const isAssistant = message.role === 'assistant' || message.role === 'system'

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isAssistant ? 'self-start' : 'self-end flex-row-reverse',
        isHighlighted && 'ring-2 ring-yellow-400 ring-offset-2 rounded-2xl'
      )}
    >
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isAssistant ? 'bg-primary text-primary-foreground' : 'bg-muted'
        )}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>

      <div
        className={cn(
          'rounded-2xl px-4 py-3',
          isAssistant
            ? 'bg-muted rounded-tl-none'
            : 'bg-primary text-primary-foreground rounded-tr-none'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        <p
          className={cn(
            'text-[10px] mt-1',
            isAssistant ? 'text-muted-foreground' : 'text-primary-foreground/70'
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}

interface SectionGroupProps {
  section: InterviewSection
  messages: InterviewMessage[]
  highlights?: TranscriptHighlight[]
  defaultOpen?: boolean
}

function SectionGroup({ section, messages, highlights, defaultOpen = false }: SectionGroupProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const sectionInfo = getInterviewSectionInfo(section)

  // Check if any message in this section contains a highlighted quote
  const highlightedMessageIds = new Set<string>()
  if (highlights) {
    messages.forEach((msg) => {
      highlights.forEach((h) => {
        if (msg.content.includes(h.quote)) {
          highlightedMessageIds.add(msg.id)
        }
      })
    })
  }

  const hasHighlights = highlightedMessageIds.size > 0

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between px-4 py-3 h-auto hover:bg-muted/50"
        >
          <div className="flex items-center gap-3">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <span className="font-medium">{sectionInfo.label}</span>
            <Badge variant="secondary" className="text-xs">
              {messages.length} messages
            </Badge>
            {hasHighlights && (
              <Quote className="h-4 w-4 text-yellow-500" />
            )}
          </div>
          <span className="text-xs text-muted-foreground">{sectionInfo.duration}</span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="px-4 pb-4 pt-2 flex flex-col gap-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              isHighlighted={highlightedMessageIds.has(msg.id)}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

export function InterviewTranscriptViewer({
  messages,
  interview,
  highlights,
}: InterviewTranscriptViewerProps) {
  // Group messages by section
  const messagesBySection = messages.reduce(
    (acc, msg) => {
      if (!acc[msg.section]) {
        acc[msg.section] = []
      }
      acc[msg.section].push(msg)
      return acc
    },
    {} as Record<InterviewSection, InterviewMessage[]>
  )

  // Get sections in order
  const orderedSections = INTERVIEW_SECTIONS.map((s) => s.value).filter(
    (section) => messagesBySection[section]?.length > 0
  )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Interview Details</span>
            <div className="flex items-center gap-4 text-sm font-normal text-muted-foreground">
              {interview.durationMinutes && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{interview.durationMinutes} min</span>
                </div>
              )}
              {interview.completedAt && (
                <span>
                  Completed {new Date(interview.completedAt).toLocaleDateString()}
                </span>
              )}
              <div className="flex items-center gap-1">
                <Cpu className="h-4 w-4" />
                <span className="text-xs">{interview.aiModel}</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Transcript</CardTitle>
          {highlights && highlights.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              <Quote className="h-3 w-3 inline mr-1 text-yellow-500" />
              {highlights.length} highlighted quotes from assessment
            </p>
          )}
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {orderedSections.map((section, index) => (
              <SectionGroup
                key={section}
                section={section}
                messages={messagesBySection[section]}
                highlights={highlights}
                defaultOpen={index === 0}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {highlights && highlights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Quotes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {highlights.map((highlight, index) => (
              <div key={index} className="border-l-2 border-yellow-400 pl-4 py-2">
                <p className="text-sm italic">"{highlight.quote}"</p>
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{highlight.timestamp}</span>
                  <span>-</span>
                  <span>{highlight.context}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
