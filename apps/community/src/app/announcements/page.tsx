'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronLeft,
  Megaphone,
  Pin,
  AlertTriangle,
  AlertCircle,
  Info,
  Check,
  Bell,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockAnnouncements } from '@/lib/mock-data'
import type { AnnouncementPriority } from '@/types'

const priorityConfig: Record<
  AnnouncementPriority,
  {
    label: string
    icon: React.ComponentType<{ className?: string }>
    cardStyle: string
    badgeStyle: string
  }
> = {
  urgent: {
    label: 'Urgent',
    icon: AlertTriangle,
    cardStyle: 'border-destructive/50 bg-destructive/5',
    badgeStyle: 'bg-destructive text-destructive-foreground',
  },
  important: {
    label: 'Important',
    icon: AlertCircle,
    cardStyle: 'border-amber-300 bg-amber-50/50',
    badgeStyle: 'bg-amber-100 text-amber-700',
  },
  normal: {
    label: 'Normal',
    icon: Info,
    cardStyle: '',
    badgeStyle: 'bg-muted text-muted-foreground',
  },
}

export default function AnnouncementsPage() {
  const [filterPriority, setFilterPriority] = useState<AnnouncementPriority | 'all'>('all')
  const [readStatus, setReadStatus] = useState<Record<string, boolean>>({})
  const currentUserId = 'user-1'

  const isRead = (announcementId: string, readBy: string[]) => {
    return readStatus[announcementId] || readBy.includes(currentUserId)
  }

  const markAsRead = (id: string) => {
    setReadStatus((prev) => ({ ...prev, [id]: true }))
  }

  const filteredAnnouncements = mockAnnouncements.filter((ann) => {
    if (filterPriority !== 'all' && ann.priority !== filterPriority) return false
    return true
  })

  const pinnedAnnouncements = filteredAnnouncements.filter((a) => a.isPinned)
  const regularAnnouncements = filteredAnnouncements.filter((a) => !a.isPinned)

  const unreadCount = mockAnnouncements.filter(
    (a) => !isRead(a.id, a.readBy)
  ).length

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
              <h1 className="text-2xl font-bold newspaper-masthead tracking-wider">ANNOUNCEMENTS</h1>
            </div>
            {unreadCount > 0 && (
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Bell className="h-4 w-4" />
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        {/* Filter */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1">
          <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <button
            onClick={() => setFilterPriority('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
              filterPriority === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-accent'
            )}
          >
            All
          </button>
          {Object.entries(priorityConfig).map(([key, config]) => {
            const Icon = config.icon
            return (
              <button
                key={key}
                onClick={() => setFilterPriority(key as AnnouncementPriority)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5',
                  filterPriority === key
                    ? config.badgeStyle
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {config.label}
              </button>
            )
          })}
        </div>

        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <section className="mb-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Pin className="h-4 w-4" />
              Pinned
            </h2>
            <div className="space-y-3">
              {pinnedAnnouncements.map((announcement) => {
                const config = priorityConfig[announcement.priority]
                const PriorityIcon = config.icon
                const read = isRead(announcement.id, announcement.readBy)

                return (
                  <div
                    key={announcement.id}
                    className={cn(
                      'bg-card border rounded-lg p-5 transition-shadow hover:shadow-md',
                      config.cardStyle,
                      !read && 'ring-2 ring-primary/20'
                    )}
                    onClick={() => markAsRead(announcement.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'p-2 rounded-lg flex-shrink-0',
                        announcement.priority === 'urgent' ? 'bg-destructive/10' :
                        announcement.priority === 'important' ? 'bg-amber-100' : 'bg-muted'
                      )}>
                        <PriorityIcon className={cn(
                          'h-5 w-5',
                          announcement.priority === 'urgent' ? 'text-destructive' :
                          announcement.priority === 'important' ? 'text-amber-600' : 'text-muted-foreground'
                        )} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.badgeStyle)}>
                            {config.label}
                          </span>
                          {!read && (
                            <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                              New
                            </span>
                          )}
                          <Pin className="h-3 w-3 text-sanctuary-gold" />
                        </div>

                        <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                          {announcement.content}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <div className="h-5 w-5 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white text-[10px] font-bold">
                              {announcement.authorName.split(' ').map(n => n[0]).join('')}
                            </div>
                            <span>{announcement.authorName}</span>
                            <span>&middot;</span>
                            <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}</span>
                          </div>

                          {read && (
                            <span className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Check className="h-3 w-3" />
                              Read
                            </span>
                          )}
                        </div>

                        {announcement.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-3">
                            {announcement.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Regular Announcements */}
        <section>
          {pinnedAnnouncements.length > 0 && regularAnnouncements.length > 0 && (
            <h2 className="text-sm font-medium text-muted-foreground mb-3">Recent</h2>
          )}
          <div className="space-y-3">
            {regularAnnouncements.map((announcement) => {
              const config = priorityConfig[announcement.priority]
              const PriorityIcon = config.icon
              const read = isRead(announcement.id, announcement.readBy)

              return (
                <div
                  key={announcement.id}
                  className={cn(
                    'bg-card border rounded-lg p-5 transition-shadow hover:shadow-md cursor-pointer',
                    config.cardStyle,
                    !read && 'ring-2 ring-primary/20'
                  )}
                  onClick={() => markAsRead(announcement.id)}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'p-2 rounded-lg flex-shrink-0',
                      announcement.priority === 'urgent' ? 'bg-destructive/10' :
                      announcement.priority === 'important' ? 'bg-amber-100' : 'bg-muted'
                    )}>
                      <PriorityIcon className={cn(
                        'h-5 w-5',
                        announcement.priority === 'urgent' ? 'text-destructive' :
                        announcement.priority === 'important' ? 'text-amber-600' : 'text-muted-foreground'
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', config.badgeStyle)}>
                          {config.label}
                        </span>
                        {!read && (
                          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                            New
                          </span>
                        )}
                      </div>

                      <h3 className="font-semibold text-lg mb-2">{announcement.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                        {announcement.content}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="h-5 w-5 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white text-[10px] font-bold">
                            {announcement.authorName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span>{announcement.authorName}</span>
                          <span>&middot;</span>
                          <span>{formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })}</span>
                        </div>

                        {read && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Check className="h-3 w-3" />
                            Read
                          </span>
                        )}
                      </div>

                      {announcement.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {announcement.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 bg-muted text-muted-foreground text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Empty State */}
        {filteredAnnouncements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Megaphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No announcements in this category</p>
            <button
              onClick={() => setFilterPriority('all')}
              className="mt-2 text-primary hover:underline"
            >
              View all announcements
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
