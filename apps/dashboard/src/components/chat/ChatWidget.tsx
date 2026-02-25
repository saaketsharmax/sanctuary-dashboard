'use client'

import { Button } from '@sanctuary/ui'
import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, X, Minimize2 } from 'lucide-react'
import { DynamicComponent } from './DynamicComponents'

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  components?: Array<{ type: string; props: any }>
}

interface ChatWidgetProps {
  externalQuery?: string
  onQueryProcessed?: () => void
}

export function ChatWidget({ externalQuery, onQueryProcessed }: ChatWidgetProps = {}) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm Sanctuary AI. I can help you track your progress, answer questions about your documents, and provide insights. What would you like to know?",
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Handle external query from home screen
  useEffect(() => {
    if (externalQuery && externalQuery.trim()) {
      setIsOpen(true)
      // Small delay to ensure chat is open before sending
      setTimeout(() => {
        handleSend(externalQuery)
        if (onQueryProcessed) {
          onQueryProcessed()
        }
      }, 100)
    }
  }, [externalQuery])

  const handleSend = async (textToSend?: string) => {
    const messageText = textToSend?.trim() || inputValue.trim()
    if (!messageText) return

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
      const response = await fetch('/api/chat/ollama', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          history: messages.slice(-5),
          includeContext: true
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('ChatWidget: API error:', errorText)
        throw new Error('Failed to get response from AI')
      }

      const data = await response.json()

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: data.message,
        timestamp: new Date(),
        components: data.components || []
      }
      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('ChatWidget: Error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm having trouble connecting. Make sure Ollama is running locally on port 11434.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Chat Widget Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 flex items-center justify-center z-50 group"
        >
          <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full border-2 border-white animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-8 right-8 w-[420px] h-[600px] bg-card border border-border rounded-lg shadow-2xl z-50 flex flex-col animate-in slide-in-from-bottom-4 fade-in duration-200">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-sm rounded-t-lg">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Sanctuary AI</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setIsOpen(false)}
                className="hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className="space-y-2">
                {message.type === 'user' ? (
                  <div className="flex justify-end">
                    <div className="bg-primary rounded-lg px-4 py-2 max-w-[85%]">
                      <p className="text-sm text-primary-foreground leading-[1.6]">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="bg-muted rounded-lg px-4 py-2">
                        <p className="text-sm text-foreground leading-[1.6]">
                          {message.content}
                        </p>
                      </div>
                      {message.components && message.components.length > 0 && (
                        <div className="space-y-2">
                          {message.components.map((component, idx) => (
                            <DynamicComponent
                              key={idx}
                              type={component.type}
                              props={component.props}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
                <div className="flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-border bg-card/95 backdrop-blur-sm">
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSend()
                  }
                }}
                placeholder="Ask anything..."
                className="flex-1 px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <Button
                onClick={() => handleSend()}
                disabled={!inputValue.trim() || isTyping}
                size="icon"
                className="bg-primary hover:bg-primary/90 disabled:bg-muted text-primary-foreground rounded-lg"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
