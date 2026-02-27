'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ChevronLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Video,
  Image,
  Tag,
  Repeat,
  BookOpen,
  Coffee,
  Mic,
  Dumbbell,
  Sparkles,
  PartyPopper,
  Globe,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { EventCategory } from '@/types'

const categoryOptions: {
  value: EventCategory
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}[] = [
  { value: 'workshop', label: 'Workshop', icon: BookOpen, color: 'bg-blue-100 text-blue-700' },
  { value: 'social', label: 'Social', icon: Coffee, color: 'bg-pink-100 text-pink-700' },
  { value: 'pitch', label: 'Pitch', icon: Mic, color: 'bg-purple-100 text-purple-700' },
  { value: 'networking', label: 'Networking', icon: Users, color: 'bg-green-100 text-green-700' },
  { value: 'wellness', label: 'Wellness', icon: Dumbbell, color: 'bg-teal-100 text-teal-700' },
  { value: 'learning', label: 'Learning', icon: Sparkles, color: 'bg-amber-100 text-amber-700' },
  { value: 'celebration', label: 'Celebration', icon: PartyPopper, color: 'bg-orange-100 text-orange-700' },
  { value: 'external', label: 'External', icon: Globe, color: 'bg-gray-100 text-gray-700' },
]

const locationOptions = [
  'Main Floor',
  'Collab Zone',
  'Quiet Zone',
  'Rooftop',
  'Cafe',
  'Meeting Room A',
  'Meeting Room B',
  'Main Event Space',
  'Phone Booth',
  'Virtual',
]

export default function CreateEventPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as EventCategory | '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    isVirtual: false,
    virtualLink: '',
    capacity: '',
    hasWaitlist: false,
    isRecurring: false,
    recurrencePattern: '',
    tags: '',
    isHighlight: false,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!formData.title.trim()) newErrors.title = 'Title is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    if (!formData.category) newErrors.category = 'Category is required'
    if (!formData.date) newErrors.date = 'Date is required'
    if (!formData.startTime) newErrors.startTime = 'Start time is required'
    if (!formData.endTime) newErrors.endTime = 'End time is required'
    if (!formData.location) newErrors.location = 'Location is required'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) {
      // In production, this would POST to an API
      router.push('/events')
    }
  }

  const updateField = (field: string, value: string | boolean | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/events" className="text-muted-foreground hover:text-foreground">
              <ChevronLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold newspaper-masthead tracking-wider">CREATE EVENT</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Info */}
          <section className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg">Basic Info</h2>

            {/* Title */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Event Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g., Founder Lunch & Learn: Fundraising 101"
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background',
                  errors.title && 'border-destructive'
                )}
              />
              {errors.title && <p className="text-xs text-destructive mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Description *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Tell people what this event is about..."
                rows={4}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background resize-none',
                  errors.description && 'border-destructive'
                )}
              />
              {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {categoryOptions.map((option) => {
                  const Icon = option.icon
                  const isSelected = formData.category === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updateField('category', option.value)}
                      className={cn(
                        'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors',
                        isSelected
                          ? option.color + ' border-transparent'
                          : 'hover:bg-muted'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {option.label}
                    </button>
                  )
                })}
              </div>
              {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
            </div>
          </section>

          {/* Date & Time */}
          <section className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Date & Time
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => updateField('date', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background',
                    errors.date && 'border-destructive'
                  )}
                />
                {errors.date && <p className="text-xs text-destructive mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">Start Time *</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => updateField('startTime', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background',
                    errors.startTime && 'border-destructive'
                  )}
                />
                {errors.startTime && <p className="text-xs text-destructive mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">End Time *</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => updateField('endTime', e.target.value)}
                  className={cn(
                    'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background',
                    errors.endTime && 'border-destructive'
                  )}
                />
                {errors.endTime && <p className="text-xs text-destructive mt-1">{errors.endTime}</p>}
              </div>
            </div>

            {/* Recurring */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRecurring}
                  onChange={(e) => updateField('isRecurring', e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm flex items-center gap-1">
                  <Repeat className="h-4 w-4 text-muted-foreground" />
                  Recurring event
                </span>
              </label>
            </div>

            {formData.isRecurring && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Recurrence Pattern
                </label>
                <input
                  type="text"
                  value={formData.recurrencePattern}
                  onChange={(e) => updateField('recurrencePattern', e.target.value)}
                  placeholder="e.g., Every Thursday, Mon/Wed/Fri"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
              </div>
            )}
          </section>

          {/* Location */}
          <section className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </h2>

            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Location *</label>
              <select
                value={formData.location}
                onChange={(e) => updateField('location', e.target.value)}
                className={cn(
                  'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background',
                  errors.location && 'border-destructive'
                )}
              >
                <option value="">Select a location</option>
                {locationOptions.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
              {errors.location && <p className="text-xs text-destructive mt-1">{errors.location}</p>}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isVirtual}
                  onChange={(e) => updateField('isVirtual', e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                <span className="text-sm flex items-center gap-1">
                  <Video className="h-4 w-4 text-muted-foreground" />
                  Virtual / hybrid event
                </span>
              </label>
            </div>

            {formData.isVirtual && (
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Virtual Link
                </label>
                <input
                  type="url"
                  value={formData.virtualLink}
                  onChange={(e) => updateField('virtualLink', e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
              </div>
            )}
          </section>

          {/* Capacity & Settings */}
          <section className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              Capacity & Settings
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Max Capacity
                </label>
                <input
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => updateField('capacity', e.target.value)}
                  placeholder="Leave blank for unlimited"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
                />
              </div>

              <div className="flex flex-col justify-end gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasWaitlist}
                    onChange={(e) => updateField('hasWaitlist', e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm">Enable waitlist</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isHighlight}
                    onChange={(e) => updateField('isHighlight', e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                  <span className="text-sm">Featured event</span>
                </label>
              </div>
            </div>
          </section>

          {/* Tags */}
          <section className="bg-card border rounded-lg p-6 space-y-4">
            <h2 className="font-semibold text-lg flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Tags
            </h2>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => updateField('tags', e.target.value)}
                placeholder="e.g., fundraising, workshop, networking"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Tags help people discover your event
              </p>
            </div>
          </section>

          {/* Actions */}
          <div className="flex gap-3">
            <Link
              href="/events"
              className="flex-1 px-4 py-3 border rounded-lg text-center text-muted-foreground hover:bg-muted transition-colors font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Create Event
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}
