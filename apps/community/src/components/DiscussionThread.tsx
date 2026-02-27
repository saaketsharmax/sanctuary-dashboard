'use client'

import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  MessageCircle,
  Eye,
  ArrowUp,
  Pin,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DiscussionThread as DiscussionThreadType, DiscussionTag } from '@/types'

const tagConfig: Record<DiscussionTag, { label: string; color: string }> = {
  general: { label: 'General', color: 'bg-gray-100 text-gray-700' },
  technical: { label: 'Technical', color: 'bg-blue-100 text-blue-700' },
  fundraising: { label: 'Fundraising', color: 'bg-green-100 text-green-700' },
  hiring: { label: 'Hiring', color: 'bg-purple-100 text-purple-700' },
  product: { label: 'Product', color: 'bg-amber-100 text-amber-700' },
  marketing: { label: 'Marketing', color: 'bg-pink-100 text-pink-700' },
  legal: { label: 'Legal', color: 'bg-red-100 text-red-700' },
  advice: { label: 'Advice', color: 'bg-teal-100 text-teal-700' },
}

export { tagConfig }

interface DiscussionThreadCardProps {
  thread: DiscussionThreadType
  compact?: boolean
}

export function DiscussionThreadCard({ thread, compact = false }: DiscussionThreadCardProps) {
  if (compact) {
    return (
      <Link
        href={`/discussions/${thread.id}`}
        className="flex items-center gap-3 p-3 bg-card border rounded-lg hover:shadow-sm transition-shadow"
      >
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{thread.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {thread.authorName} · {thread.replyCount} replies
          </p>
        </div>
        {thread.isResolved && (
          <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
        )}
      </Link>
    )
  }

  return (
    <div className={cn(
      'bg-card border rounded-lg p-4 hover:shadow-md transition-shadow',
      thread.isPinned && 'border-sanctuary-gold bg-sanctuary-gold/5'
    )}>
      <div className="flex items-start gap-4">
        {/* Upvote column */}
        <div className="flex flex-col items-center gap-1 pt-1">
          <button className="p-1 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground">
            <ArrowUp className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium">{thread.upvotes}</span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            {thread.isPinned && (
              <Pin className="h-3.5 w-3.5 text-sanctuary-gold" />
            )}
            {thread.isResolved && (
              <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded-full flex items-center gap-1">
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

          <Link href={`/discussions/${thread.id}`}>
            <h3 className="font-semibold mb-1 hover:text-primary transition-colors">
              {thread.title}
            </h3>
          </Link>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{thread.content}</p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>
              <span className="font-medium text-foreground">{thread.authorName}</span>
              {thread.authorRole && <span> · {thread.authorRole}</span>}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {thread.replyCount} replies
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {thread.viewCount} views
            </span>
            <span>
              {formatDistanceToNow(new Date(thread.lastActivityAt), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
