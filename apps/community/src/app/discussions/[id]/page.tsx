'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronLeft,
  ArrowUp,
  MessageCircle,
  Eye,
  Pin,
  CheckCircle2,
  Send,
  Share2,
  Flag,
  BookmarkPlus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockDiscussions } from '@/lib/mock-data'
import { tagConfig } from '@/components/DiscussionThread'
import type { DiscussionReply } from '@/types'

export default function DiscussionDetailPage() {
  const params = useParams()
  const threadId = params.id as string
  const thread = mockDiscussions.find((d) => d.id === threadId)

  const [newReply, setNewReply] = useState('')
  const [replies, setReplies] = useState(thread?.replies ?? [])
  const [upvoted, setUpvoted] = useState(false)

  if (!thread) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Discussion not found</h2>
          <Link href="/discussions" className="text-primary hover:underline">
            Back to discussions
          </Link>
        </div>
      </div>
    )
  }

  const handleReply = () => {
    if (newReply.trim()) {
      const reply: DiscussionReply = {
        id: `reply-${Date.now()}`,
        threadId: thread.id,
        authorId: 'user-1',
        authorName: 'Alex Chen',
        authorRole: 'Founder, NeuralPath AI',
        content: newReply.trim(),
        upvotes: 0,
        isAcceptedAnswer: false,
        createdAt: new Date().toISOString(),
      }
      setReplies([...replies, reply])
      setNewReply('')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/discussions" className="text-muted-foreground hover:text-foreground">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <span className="text-sm text-muted-foreground">Discussion</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground" title="Save">
                <BookmarkPlus className="h-4 w-4" />
              </button>
              <button className="p-2 hover:bg-muted rounded-lg text-muted-foreground" title="Share">
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Thread */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex items-start gap-4">
            {/* Upvote column */}
            <div className="flex flex-col items-center gap-1">
              <button
                onClick={() => setUpvoted(!upvoted)}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  upvoted
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted text-muted-foreground'
                )}
              >
                <ArrowUp className="h-5 w-5" />
              </button>
              <span className="text-lg font-semibold">
                {thread.upvotes + (upvoted ? 1 : 0)}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Tags & Status */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {thread.isPinned && (
                  <Pin className="h-4 w-4 text-sanctuary-gold" />
                )}
                {thread.isResolved && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Resolved
                  </span>
                )}
                {thread.tags.map((tag) => (
                  <span key={tag} className={cn('px-2 py-0.5 rounded-full text-xs font-medium', tagConfig[tag].color)}>
                    {tagConfig[tag].label}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-4">{thread.title}</h1>

              {/* Author info */}
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white font-bold">
                  {thread.authorName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-sm">{thread.authorName}</p>
                  <p className="text-xs text-muted-foreground">
                    {thread.authorRole && `${thread.authorRole} · `}
                    {formatDistanceToNow(new Date(thread.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed mb-4">
                <p>{thread.content}</p>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4 border-t">
                <span className="flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  {replies.length} replies
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="h-4 w-4" />
                  {thread.viewCount} views
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Replies */}
        <div className="space-y-4 mb-6">
          <h2 className="font-semibold text-lg">
            {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
          </h2>

          {replies.map((reply) => (
            <div
              key={reply.id}
              className={cn(
                'bg-card border rounded-lg p-5',
                reply.isAcceptedAnswer && 'border-green-300 bg-green-50/50'
              )}
            >
              {reply.isAcceptedAnswer && (
                <div className="flex items-center gap-1.5 text-green-700 text-xs font-medium mb-3">
                  <CheckCircle2 className="h-4 w-4" />
                  Accepted Answer
                </div>
              )}

              <div className="flex items-start gap-4">
                {/* Upvote */}
                <div className="flex flex-col items-center gap-1">
                  <button className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
                    <ArrowUp className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-medium">{reply.upvotes}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white text-xs font-bold">
                      {reply.authorName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{reply.authorName}</p>
                      <p className="text-xs text-muted-foreground">
                        {reply.authorRole && `${reply.authorRole} · `}
                        {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reply.content}
                  </p>

                  <div className="flex items-center gap-3 mt-3">
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      Reply
                    </button>
                    <button className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
                      <Flag className="h-3 w-3" />
                      Report
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {replies.length === 0 && (
            <div className="text-center py-8 text-muted-foreground bg-card border rounded-lg">
              <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No replies yet. Be the first to respond!</p>
            </div>
          )}
        </div>

        {/* Reply Input */}
        <div className="bg-card border rounded-lg p-6">
          <h3 className="font-semibold mb-3">Your Reply</h3>
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white font-bold flex-shrink-0">
              AC
            </div>
            <div className="flex-1">
              <textarea
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder="Share your thoughts..."
                rows={4}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none mb-3"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleReply}
                  disabled={!newReply.trim()}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    newReply.trim()
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-muted text-muted-foreground cursor-not-allowed'
                  )}
                >
                  <Send className="h-4 w-4" />
                  Post Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
