'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronLeft,
  Plus,
  Pin,
  MessageCircle,
  Megaphone,
  HelpCircle,
  Gift,
  Search as SearchIcon,
  PartyPopper,
  MessageSquare,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockPosts } from '@/lib/mock-data'
import type { BoardPost, PostCategory } from '@/types'

const categoryConfig: Record<
  PostCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  announcement: { label: 'Announcement', icon: Megaphone, color: 'bg-red-100 text-red-700' },
  ask: { label: 'Ask', icon: HelpCircle, color: 'bg-blue-100 text-blue-700' },
  offer: { label: 'Offer', icon: Gift, color: 'bg-green-100 text-green-700' },
  'lost-found': { label: 'Lost & Found', icon: SearchIcon, color: 'bg-yellow-100 text-yellow-700' },
  event: { label: 'Event', icon: PartyPopper, color: 'bg-purple-100 text-purple-700' },
  shoutout: { label: 'Shoutout', icon: PartyPopper, color: 'bg-pink-100 text-pink-700' },
  discussion: { label: 'Discussion', icon: MessageSquare, color: 'bg-gray-100 text-gray-700' },
}

function PostCard({ post }: { post: BoardPost }) {
  const config = categoryConfig[post.category]
  const CategoryIcon = config.icon

  return (
    <div className={cn(
      'bg-white border rounded-lg p-4 hover:shadow-md transition-shadow',
      post.isPinned && 'border-sanctuary-gold bg-sanctuary-gold/5'
    )}>
      <div className="flex items-start gap-3">
        {/* Author Avatar */}
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white font-bold flex-shrink-0">
          {post.authorName.slice(0, 2).toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-medium">{post.authorName}</span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1', config.color)}>
              <CategoryIcon className="h-3 w-3" />
              {config.label}
            </span>
            {post.isPinned && (
              <span className="text-sanctuary-gold">
                <Pin className="h-3.5 w-3.5" />
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold mb-2">{post.title}</h3>

          {/* Content */}
          <p className="text-sm text-gray-600 mb-3">{post.content}</p>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Reactions */}
              <div className="flex items-center gap-1">
                {post.reactions.slice(0, 3).map((reaction, i) => (
                  <button
                    key={i}
                    className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                  >
                    <span>{reaction.emoji}</span>
                    <span className="text-xs text-gray-600">{reaction.count}</span>
                  </button>
                ))}
                <button className="flex items-center gap-1 px-2 py-1 text-gray-400 hover:bg-gray-100 rounded-full text-sm transition-colors">
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Comments */}
              <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                <MessageCircle className="h-4 w-4" />
                {post.commentCount}
              </button>
            </div>

            {/* Timestamp */}
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function NewPostModal({ onClose, onSubmit }: {
  onClose: () => void
  onSubmit: (data: { title: string; content: string; category: PostCategory }) => void
}) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<PostCategory>('discussion')

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      onSubmit({ title, content, category })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-xl font-semibold">New Post</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Category Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Category
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(categoryConfig).map(([key, config]) => {
                const Icon = config.icon
                const isSelected = category === key
                return (
                  <button
                    key={key}
                    onClick={() => setCategory(key as PostCategory)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1 transition-colors',
                      isSelected ? config.color : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's this about?"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sanctuary-navy/20"
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share more details..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sanctuary-navy/20 resize-none"
            />
          </div>
        </div>

        <div className="p-6 border-t flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!title.trim() || !content.trim()}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg text-white transition-colors',
              title.trim() && content.trim()
                ? 'bg-sanctuary-navy hover:bg-opacity-90'
                : 'bg-gray-300 cursor-not-allowed'
            )}
          >
            Post
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BoardPage() {
  const [showNewPost, setShowNewPost] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<PostCategory | 'all'>('all')
  const [posts, setPosts] = useState(mockPosts)

  const handleNewPost = (data: { title: string; content: string; category: PostCategory }) => {
    const newPost: BoardPost = {
      id: `post-${Date.now()}`,
      authorId: 'user-1',
      authorName: 'Alex Chen',
      ...data,
      reactions: [],
      commentCount: 0,
      isPinned: false,
      createdAt: new Date().toISOString(),
    }
    setPosts([newPost, ...posts])
  }

  const filteredPosts = posts.filter((post) => {
    if (selectedCategory === 'all') return true
    return post.category === selectedCategory
  })

  // Separate pinned posts
  const pinnedPosts = filteredPosts.filter((p) => p.isPinned)
  const regularPosts = filteredPosts.filter((p) => !p.isPinned)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-muted-foreground hover:text-foreground lg:hidden">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold newspaper-masthead tracking-wider">COMMUNITY BOARD</h1>
            </div>
            <button
              onClick={() => setShowNewPost(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Post</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              selectedCategory === 'all'
                ? 'bg-sanctuary-navy text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            All Posts
          </button>
          {Object.entries(categoryConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key as PostCategory)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1',
                  selectedCategory === key
                    ? config.color
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                <Icon className="h-3 w-3" />
                {config.label}
              </button>
            )
          })}
        </div>

        {/* Pinned Posts */}
        {pinnedPosts.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3 flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pinned
            </h2>
            <div className="space-y-3">
              {pinnedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </section>
        )}

        {/* Regular Posts */}
        <section>
          {pinnedPosts.length > 0 && (
            <h2 className="text-sm font-medium text-gray-500 mb-3">Recent</h2>
          )}
          <div className="space-y-3">
            {regularPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </section>

        {/* Empty State */}
        {filteredPosts.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No posts in this category yet</p>
            <button
              onClick={() => setShowNewPost(true)}
              className="mt-2 text-sanctuary-navy hover:underline"
            >
              Be the first to post
            </button>
          </div>
        )}
      </main>

      {/* New Post Modal */}
      {showNewPost && (
        <NewPostModal
          onClose={() => setShowNewPost(false)}
          onSubmit={handleNewPost}
        />
      )}
    </div>
  )
}
