'use client'

import { Badge, Button } from '@sanctuary/ui'
import { Sparkles, TrendingUp, Target, Calendar, Plus, MessageSquare, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown, Copy, Share2, Paperclip, Smile, Send, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { DynamicComponent } from '@/components/chat/DynamicComponents'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  reasoning?: string
  hasReasoning?: boolean
  components?: Array<{ type: string; props: any }>
}

interface ChatSession {
  id: string
  title: string
  lastMessage: string
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: '1',
    type: 'assistant',
    content: "Hi Sarah! I'm Sanctuary AI, your intelligent assistant. I have access to all your company data, documents, metrics, and goals. I can help you track progress, answer questions about your files, and provide strategic insights. What would you like to explore?",
    timestamp: new Date(Date.now() - 300000),
    hasReasoning: false
  }
]

const chatHistory: ChatSession[] = [
  {
    id: '1',
    title: 'Progress Update',
    lastMessage: 'Your MRR is growing steadily...',
    timestamp: new Date(Date.now() - 3600000)
  },
  {
    id: '2',
    title: 'Q1 Goals Review',
    lastMessage: 'You\'ve completed 8 out of 10...',
    timestamp: new Date(Date.now() - 86400000)
  },
  {
    id: '3',
    title: 'Metrics Discussion',
    lastMessage: 'Here are your key metrics...',
    timestamp: new Date(Date.now() - 172800000)
  },
]

export function FounderProgressContent() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [expandedReasoning, setExpandedReasoning] = useState<Record<string, boolean>>({})

  const handleSend = async (text?: string) => {
    const messageText = text || inputValue.trim()
    if (!messageText) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: messageText,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    try {
      // Call Ollama API
      const response = await fetch('/api/chat/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-5) // Send last 5 messages for context
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.message,
        timestamp: new Date(),
        hasReasoning: true,
        reasoning: "Analyzing your startup metrics and progress to provide contextual insights.",
        components: data.components || []
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble connecting to the AI service. Please make sure Ollama is running locally on port 11434.",
        timestamp: new Date(),
        hasReasoning: false
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  const toggleReasoning = (messageId: string) => {
    setExpandedReasoning(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }))
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 bg-card border-b border-border/30">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground">Progress Chat</h1>
          <Badge variant="outline">
            2
          </Badge>
        </div>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-6 py-8 space-y-8">
          {messages.map((message) => (
            <div key={message.id} className="space-y-3">
              {/* User Message */}
              {message.type === 'user' && (
                <div className="flex items-start gap-3 justify-end">
                  <div className="bg-primary rounded-lg px-4 py-2.5 max-w-[85%]">
                    <p className="text-sm text-primary-foreground leading-[1.6]">
                      {message.content}
                    </p>
                  </div>
                  <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                    <span className="text-muted-foreground text-xs">👤</span>
                  </div>
                </div>
              )}

              {/* Assistant Message */}
              {message.type === 'assistant' && (
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1 space-y-2 max-w-[85%]">
                    {/* Reasoning Section */}
                    {message.hasReasoning && (
                      <button
                        onClick={() => toggleReasoning(message.id)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-card border border-border rounded-md hover:bg-muted/50 transition-colors group"
                      >
                        <span className="text-xs font-medium text-muted-foreground">Reasoning...</span>
                        {expandedReasoning[message.id] ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </button>
                    )}

                    {/* Expanded Reasoning Content */}
                    {expandedReasoning[message.id] && message.reasoning && (
                      <div className="px-3 py-2.5 bg-muted/50 rounded-md border border-border/30">
                        <p className="text-xs text-muted-foreground leading-[1.6] italic">
                          {message.reasoning}
                        </p>
                      </div>
                    )}

                    {/* Message Content */}
                    <div className="bg-card rounded-lg px-4 py-2.5 border border-border/30">
                      <p className="text-sm text-foreground leading-[1.6] whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    {/* Dynamic Components */}
                    {message.components && message.components.length > 0 && (
                      <div className="space-y-3 mt-3">
                        {message.components.map((component, idx) => (
                          <DynamicComponent
                            key={idx}
                            type={component.type}
                            props={component.props}
                          />
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="flex items-center gap-1 pt-1">
                      <Button variant="ghost" size="icon-xs" title="Good response">
                        <ThumbsUp className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" title="Bad response">
                        <ThumbsDown className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon-xs" title="Copy">
                        <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-md">
                <Loader2 className="w-4 h-4 text-primary animate-spin" />
                <span className="text-xs font-medium text-muted-foreground">Reasoning...</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-card px-6 py-4 border-t border-border/30">
        <div className="max-w-[720px] mx-auto">
          <div className="relative bg-background border border-border rounded-lg focus-within:border-ring transition-colors">
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              placeholder="Ask about your progress..."
              rows={1}
              className="w-full px-4 py-3 pr-32 text-sm text-foreground placeholder:text-muted-foreground bg-transparent resize-none focus:outline-none"
              style={{ minHeight: '44px', maxHeight: '200px' }}
            />
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button variant="ghost" size="icon-sm">
                <Paperclip className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon-sm">
                <Smile className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button
                onClick={() => handleSend()}
                disabled={!inputValue.trim()}
                size="icon-sm"
                className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground rounded-lg ml-1"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
