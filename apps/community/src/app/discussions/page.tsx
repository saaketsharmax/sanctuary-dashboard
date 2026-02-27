'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ChevronLeft,
  Plus,
  Search,
  MessageSquare,
  TrendingUp,
  Clock,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockDiscussions } from '@/lib/mock-data'
import { DiscussionThreadCard, tagConfig } from '@/components/DiscussionThread'
import type { DiscussionTag, DiscussionThread } from '@/types'

type SortOption = 'recent' | 'popular' | 'most-replies'

export default function DiscussionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<DiscussionTag | 'all'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('recent')
  const [showNewThread, setShowNewThread] = useState(false)

  // New thread form state
  const [newTitle, setNewTitle] = useState('')
  const [newContent, setNewContent] = useState('')
  const [newTags, setNewTags] = useState<DiscussionTag[]>([])
  const [threads, setThreads] = useState(mockDiscussions)

  const filteredThreads = threads
    .filter((thread) => {
      // Search
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          thread.title.toLowerCase().includes(query) ||
          thread.content.toLowerCase().includes(query) ||
          thread.authorName.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Tag filter
      if (selectedTag !== 'all' && !thread.tags.includes(selectedTag)) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popular':
          return b.upvotes - a.upvotes
        case 'most-replies':
          return b.replyCount - a.replyCount
        case 'recent':
        default:
          return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
      }
    })

  const pinnedThreads = filteredThreads.filter((t) => t.isPinned)
  const regularThreads = filteredThreads.filter((t) => !t.isPinned)

  const handleNewThread = () => {
    if (newTitle.trim() && newContent.trim()) {
      const newThread: DiscussionThread = {
        id: `disc-${Date.now()}`,
        authorId: 'user-1',
        authorName: 'Alex Chen',
        authorRole: 'Founder, NeuralPath AI',
        title: newTitle,
        content: newContent,
        tags: newTags.length > 0 ? newTags : ['general'],
        replies: [],
        replyCount: 0,
        viewCount: 0,
        upvotes: 0,
        isPinned: false,
        isResolved: false,
        createdAt: new Date().toISOString(),
        lastActivityAt: new Date().toISOString(),
      }
      setThreads([newThread, ...threads])
      setShowNewThread(false)
      setNewTitle('')
      setNewContent('')
      setNewTags([])
    }
  }

  const toggleNewTag = (tag: DiscussionTag) => {
    setNewTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground lg:hidden">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold newspaper-masthead tracking-wider">DISCUSSIONS</h1>
            </div>
            <button
              onClick={() => setShowNewThread(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Thread</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Search & Filter */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-3 mb-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortBy('recent')}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors',
                  sortBy === 'recent'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                <Clock className="h-3.5 w-3.5" />
                Recent
              </button>
              <button
                onClick={() => setSortBy('popular')}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors',
                  sortBy === 'popular'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                <TrendingUp className="h-3.5 w-3.5" />
                Popular
              </button>
              <button
                onClick={() => setSortBy('most-replies')}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-colors',
                  sortBy === 'most-replies'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                Most Replies
              </button>
            </div>
          </div>

          {/* Tag Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedTag('all')}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                selectedTag === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              )}
            >
              All
            </button>
            {Object.entries(tagConfig).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setSelectedTag(key as DiscussionTag)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                  selectedTag === key
                    ? config.color
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                {config.label}
              </button>
            ))}
          </div>
        </div>

        {/* Pinned Threads */}
        {pinnedThreads.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Pinned</h2>
            <div className="space-y-3">
              {pinnedThreads.map((thread) => (
                <DiscussionThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Threads */}
        <section>
          {pinnedThreads.length > 0 && regularThreads.length > 0 && (
            <h2 className="text-sm font-medium text-muted-foreground mb-3">All Discussions</h2>
          )}
          <div className="space-y-3">
            {regularThreads.map((thread) => (
              <DiscussionThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        </section>

        {/* Empty State */}
        {filteredThreads.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No discussions found</p>
            <button
              onClick={() => setShowNewThread(true)}
              className="mt-2 text-primary hover:underline"
            >
              Start the first discussion
            </button>
          </div>
        )}
      </main>

      {/* New Thread Modal */}
      {showNewThread && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between">
              <h2 className="text-xl font-semibold">New Discussion</h2>
              <button
                onClick={() => setShowNewThread(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Tags */}
              <div>
                <label className="text-sm font-medium mb-2 block">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(tagConfig).map(([key, config]) => (
                    <button
                      key={key}
                      onClick={() => toggleNewTag(key as DiscussionTag)}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                        newTags.includes(key as DiscussionTag)
                          ? config.color
                          : 'bg-muted text-muted-foreground hover:bg-accent'
                      )}
                    >
                      {config.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="What would you like to discuss?"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-sm font-medium mb-1.5 block">Details</label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Share more context..."
                  rows={5}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none"
                />
              </div>
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowNewThread(false)}
                className="flex-1 px-4 py-2 border rounded-lg text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewThread}
                disabled={!newTitle.trim() || !newContent.trim()}
                className={cn(
                  'flex-1 px-4 py-2 rounded-lg text-primary-foreground transition-colors',
                  newTitle.trim() && newContent.trim()
                    ? 'bg-primary hover:bg-primary/90'
                    : 'bg-muted text-muted-foreground cursor-not-allowed'
                )}
              >
                Post Discussion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
