'use client'

import { Input, Button, cn } from '@sanctuary/ui'
import { useState } from 'react'
import { Search, Mic, Paperclip, ChevronDown } from 'lucide-react'
interface QuickAction {
  label: string
  onClick: () => void
}

interface RecentCard {
  id: string
  title: string
  subtitle: string
  icon: React.ReactNode
  onClick: () => void
}

interface RecentSection {
  title: string
  helpText?: string
  cards: RecentCard[]
}

interface HomeScreenProps {
  userName: string
  greeting?: string
  placeholder?: string
  quickActions: QuickAction[]
  recentSections: RecentSection[]
  onSearchSubmit?: (query: string) => void
}

export function HomeScreen({
  userName,
  greeting = 'Good morning',
  placeholder = 'Message Sanctuary',
  quickActions,
  recentSections,
  onSearchSubmit,
}: HomeScreenProps) {
  const [inputValue, setInputValue] = useState('')
  const [showQuickResponse, setShowQuickResponse] = useState(false)

  const handleSubmit = () => {
    const query = inputValue.trim()
    if (query && onSearchSubmit) {
      onSearchSubmit(query)
      setInputValue('') // Clear input after submitting
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center pt-32 pb-24 px-8">
      {/* Greeting */}
      <div className="text-center mb-12">
        <h1 className="text-[42px] font-normal text-white mb-2 drop-shadow-lg">
          {greeting}, {userName}
        </h1>
        <p className="text-[28px] font-light text-white/90 drop-shadow-md">
          What's on your mind?
        </p>
      </div>

      {/* Input Box */}
      <div className="w-full max-w-3xl mb-6">
        <div className="bg-white rounded-3xl shadow-[0px_2px_8px_rgba(0,0,0,0.08)] border border-black/[0.08] p-5 transition-all duration-300 hover:shadow-[0px_4px_16px_rgba(0,0,0,0.12)] hover:scale-[1.01]">
          <input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full mb-3 border-none bg-transparent text-lg px-0 py-2 outline-none focus:outline-none"
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="transition-all duration-200 hover:scale-110 active:scale-95 rounded-full"
              >
                <Paperclip className="w-4 h-4" />
              </Button>

              <Button
                onClick={() => setShowQuickResponse(!showQuickResponse)}
                variant="ghost"
                className="transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <span className="text-sm">Quick response</span>
                <ChevronDown className={cn("w-4 h-4 ml-1.5 transition-transform duration-300", showQuickResponse && "rotate-180")} />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmit}
                variant="ghost"
                size="icon"
                className="transition-all duration-200 hover:scale-110 active:scale-95 rounded-full"
              >
                <Search className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="transition-all duration-200 hover:scale-110 active:scale-95 rounded-full"
              >
                <Mic className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center mb-16 max-w-4xl">
        {quickActions.map((action, index) => (
          <Button
            key={index}
            onClick={action.onClick}
            variant="ghost"
            className="transition-all duration-300 hover:scale-105 hover:-translate-y-0.5 active:scale-95 bg-white/90 backdrop-blur-sm border border-black/[0.06]"
          >
            {action.label}
          </Button>
        ))}
      </div>

      {/* Recent Sections */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recentSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
            {/* Section Header */}
            <div className="flex items-center gap-2 mb-4 px-1">
              <span className="text-sm font-medium text-white/90 drop-shadow">
                {section.title}
              </span>
              {section.helpText && (
                <button className="p-1 hover:bg-white/20 rounded-full transition-colors">
                  <div className="w-4 h-4 rounded-full border border-white/60 flex items-center justify-center">
                    <span className="text-[10px] text-white/80">?</span>
                  </div>
                </button>
              )}
            </div>

            {/* Cards */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-[0px_2px_8px_rgba(0,0,0,0.08)] border border-black/[0.08] overflow-hidden transition-all duration-300 hover:shadow-[0px_4px_16px_rgba(0,0,0,0.12)]">
              {section.cards.map((card, cardIndex) => (
                <button
                  key={card.id}
                  onClick={card.onClick}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 hover:bg-black/[0.05] transition-all duration-200 group text-left hover:pl-5',
                    cardIndex < section.cards.length - 1 && 'border-b border-black/[0.06]'
                  )}
                >
                  <div className="flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-black truncate transition-colors duration-200 group-hover:text-black/90">
                      {card.title}
                    </p>
                    <p className="text-xs text-black/50 transition-colors duration-200 group-hover:text-black/60">
                      {card.subtitle}
                    </p>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-black/[0.05] rounded-full transition-all duration-200 hover:scale-110">
                    <span className="text-black/60">⋮</span>
                  </button>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
