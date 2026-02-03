'use client'

import { useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronLeft,
  MapPin,
  Clock,
  Users,
  Coffee,
  Volume2,
  VolumeX,
  Briefcase,
  LogOut,
  Check,
  MessageSquare,
  Building,
  Phone,
  Sun,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { mockCheckIns, mockVisitors } from '@/lib/mock-data'
import type { CheckIn, CheckInLocation } from '@/types'

const locationConfig: Record<
  CheckInLocation,
  { label: string; icon: React.ComponentType<{ className?: string }>; description: string }
> = {
  'main-floor': { label: 'Main Floor', icon: Building, description: 'Open workspace' },
  'collab-zone': { label: 'Collab Zone', icon: Users, description: 'For collaboration' },
  'quiet-zone': { label: 'Quiet Zone', icon: VolumeX, description: 'Deep work area' },
  'phone-booth': { label: 'Phone Booth', icon: Phone, description: 'Private calls' },
  'rooftop': { label: 'Rooftop', icon: Sun, description: 'Outdoor space' },
  'cafe': { label: 'Café', icon: Coffee, description: 'Coffee & casual' },
  'meeting-room': { label: 'Meeting Room', icon: Briefcase, description: 'Scheduled meetings' },
}

const statusPresets = [
  'Heads down coding',
  'Open to chat',
  'In meetings',
  'Coffee break',
  'Taking calls',
  'Deep work - do not disturb',
  'Available for questions',
  'Wrapping up for the day',
]

function CheckInModal({ onClose, onCheckIn }: {
  onClose: () => void
  onCheckIn: (location: CheckInLocation, status: string) => void
}) {
  const [selectedLocation, setSelectedLocation] = useState<CheckInLocation | null>(null)
  const [status, setStatus] = useState('')

  const handleSubmit = () => {
    if (selectedLocation) {
      onCheckIn(selectedLocation, status || 'Working')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Check In</h2>
          <p className="text-sm text-gray-500">Let others know where you are</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Location Selection */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              Where are you?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(locationConfig).map(([key, config]) => {
                const Icon = config.icon
                const isSelected = selectedLocation === key
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedLocation(key as CheckInLocation)}
                    className={cn(
                      'p-3 rounded-lg border text-left transition-colors',
                      isSelected
                        ? 'border-sanctuary-navy bg-sanctuary-navy/5'
                        : 'hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={cn('h-4 w-4', isSelected ? 'text-sanctuary-navy' : 'text-gray-500')} />
                      <span className={cn('font-medium text-sm', isSelected && 'text-sanctuary-navy')}>
                        {config.label}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{config.description}</p>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">
              What are you up to?
            </label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="e.g., Working on pitch deck"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-sanctuary-navy/20 mb-2"
            />
            <div className="flex flex-wrap gap-1">
              {statusPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setStatus(preset)}
                  className={cn(
                    'px-2 py-1 text-xs rounded-full transition-colors',
                    status === preset
                      ? 'bg-sanctuary-navy text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  {preset}
                </button>
              ))}
            </div>
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
            disabled={!selectedLocation}
            className={cn(
              'flex-1 px-4 py-2 rounded-lg text-white transition-colors',
              selectedLocation
                ? 'bg-sanctuary-navy hover:bg-opacity-90'
                : 'bg-gray-300 cursor-not-allowed'
            )}
          >
            Check In
          </button>
        </div>
      </div>
    </div>
  )
}

function CheckInCard({ checkIn }: { checkIn: CheckIn }) {
  const config = locationConfig[checkIn.location]
  const LocationIcon = config.icon

  return (
    <div className="flex items-center gap-4 p-4 bg-white border rounded-lg">
      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-sanctuary-gold to-sanctuary-navy flex items-center justify-center text-white font-bold flex-shrink-0">
        {checkIn.userName.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium truncate">{checkIn.userName}</span>
          {checkIn.userRole && (
            <span className="text-xs text-gray-500">· {checkIn.userRole}</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <LocationIcon className="h-3.5 w-3.5" />
            {config.label}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDistanceToNow(new Date(checkIn.checkInTime), { addSuffix: true })}
          </span>
        </div>
        {checkIn.status && (
          <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
            <MessageSquare className="h-3.5 w-3.5 text-gray-400" />
            {checkIn.status}
          </p>
        )}
      </div>
    </div>
  )
}

export default function CheckInPage() {
  const [showCheckInModal, setShowCheckInModal] = useState(false)
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [myCheckIn, setMyCheckIn] = useState<{
    location: CheckInLocation
    status: string
    time: Date
  } | null>(null)

  const handleCheckIn = (location: CheckInLocation, status: string) => {
    setMyCheckIn({ location, status, time: new Date() })
    setIsCheckedIn(true)
  }

  const handleCheckOut = () => {
    setMyCheckIn(null)
    setIsCheckedIn(false)
  }

  // Group check-ins by location
  const checkInsByLocation = mockCheckIns.reduce((acc, checkIn) => {
    if (!acc[checkIn.location]) {
      acc[checkIn.location] = []
    }
    acc[checkIn.location].push(checkIn)
    return acc
  }, {} as Record<CheckInLocation, CheckIn[]>)

  const totalCheckedIn = mockCheckIns.length + (isCheckedIn ? 1 : 0)

  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold newspaper-masthead tracking-wider">WHO&apos;S HERE</h1>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-2 text-sm text-gray-600">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                {totalCheckedIn} in the building
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Check In/Out Button */}
        <div className="mb-6">
          {isCheckedIn && myCheckIn ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-700 font-medium flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    You&apos;re checked in
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {locationConfig[myCheckIn.location].label} · {myCheckIn.status}
                  </p>
                </div>
                <button
                  onClick={handleCheckOut}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Check Out
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowCheckInModal(true)}
              className="w-full p-4 bg-sanctuary-navy text-white rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center gap-2"
            >
              <MapPin className="h-5 w-5" />
              Check In
            </button>
          )}
        </div>

        {/* Location Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {Object.entries(locationConfig).slice(0, 4).map(([key, config]) => {
            const Icon = config.icon
            const count = checkInsByLocation[key as CheckInLocation]?.length || 0
            return (
              <div key={key} className="bg-white border rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">{config.label}</span>
                </div>
                <p className="text-2xl font-bold text-sanctuary-navy">{count}</p>
              </div>
            )
          })}
        </div>

        {/* Visitors Section */}
        {mockVisitors.length > 0 && (
          <section className="mb-6">
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Visitors Today
            </h2>
            <div className="space-y-2">
              {mockVisitors.map((visitor) => (
                <div key={visitor.id} className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="h-10 w-10 rounded-full bg-amber-200 flex items-center justify-center text-amber-700 font-medium">
                    {visitor.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{visitor.name}</p>
                    <p className="text-sm text-gray-600">
                      {visitor.company && `${visitor.company} · `}
                      {visitor.purpose}
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>Host: {visitor.hostName}</p>
                    <p>{visitor.badgeNumber}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* People by Location */}
        <section>
          <h2 className="text-lg font-semibold mb-3">In the Building</h2>
          <div className="space-y-4">
            {Object.entries(checkInsByLocation).map(([location, checkIns]) => {
              const config = locationConfig[location as CheckInLocation]
              const Icon = config.icon

              return (
                <div key={location}>
                  <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {config.label} ({checkIns.length})
                  </h3>
                  <div className="space-y-2">
                    {checkIns.map((checkIn) => (
                      <CheckInCard key={checkIn.id} checkIn={checkIn} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Empty State */}
        {Object.keys(checkInsByLocation).length === 0 && !isCheckedIn && (
          <div className="text-center py-12 text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No one has checked in yet today</p>
            <p className="text-sm mt-1">Be the first!</p>
          </div>
        )}
      </main>

      {/* Check In Modal */}
      {showCheckInModal && (
        <CheckInModal
          onClose={() => setShowCheckInModal(false)}
          onCheckIn={handleCheckIn}
        />
      )}
    </div>
  )
}
