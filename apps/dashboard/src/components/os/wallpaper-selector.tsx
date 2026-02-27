'use client'

import { cn } from '@sanctuary/ui'
import { useState } from 'react'
import { Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react'
const wallpapers = [
  { id: 1, name: 'Wallpaper 1', path: '/assets/wallpapers/wallpaper-bg.jpg', isGradient: false },
  { id: 2, name: 'Wallpaper 2', path: '/assets/wallpapers/wallpaper-bg-2.png', isGradient: false },
  { id: 3, name: 'Wallpaper 3', path: '/assets/wallpapers/wallpaper-bg-3.jpg', isGradient: false },
  { id: 4, name: 'Wallpaper 4', path: '/assets/wallpapers/wallpaper-bg-4.jpg', isGradient: false },
]

interface WallpaperSelectorProps {
  currentWallpaper: string
  onWallpaperChange: (wallpaper: string) => void
  isWindowOpen?: boolean
}

export function WallpaperSelector({ currentWallpaper, onWallpaperChange, isWindowOpen = false }: WallpaperSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Hide the selector when a window is open
  if (isWindowOpen) {
    return null
  }

  const currentIndex = wallpapers.findIndex(w => w.path === currentWallpaper)

  const handlePrevious = () => {
    const newIndex = currentIndex > 0 ? currentIndex - 1 : wallpapers.length - 1
    onWallpaperChange(wallpapers[newIndex].path)
  }

  const handleNext = () => {
    const newIndex = currentIndex < wallpapers.length - 1 ? currentIndex + 1 : 0
    onWallpaperChange(wallpapers[newIndex].path)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Wallpaper Thumbnails - appears when open */}
      {isOpen && (
        <div className="mb-3 grid grid-cols-2 gap-2 animate-in slide-in-from-bottom-2 fade-in duration-200">
          {wallpapers.map((wallpaper, index) => (
            <button
              key={wallpaper.id}
              onClick={() => {
                onWallpaperChange(wallpaper.path)
                setIsOpen(false)
              }}
              className={cn(
                'w-20 h-14 rounded-xl overflow-hidden border-2 transition-all duration-300 hover:scale-110 active:scale-95 relative group',
                currentWallpaper === wallpaper.path
                  ? 'border-white shadow-lg scale-105'
                  : 'border-white/30 hover:border-white/60'
              )}
              style={{ animationDelay: `${index * 30}ms` }}
              title={wallpaper.name}
            >
              <img
                src={wallpaper.path}
                alt={wallpaper.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            </button>
          ))}
        </div>
      )}

      {/* Control Panel */}
      <div className="bg-white/40 backdrop-blur-2xl rounded-3xl shadow-[0px_8px_32px_rgba(0,0,0,0.16)] border border-white/30 p-3 transition-all duration-300 hover:shadow-[0px_12px_40px_rgba(0,0,0,0.20)] hover:scale-105">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-white/40 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            title="Previous wallpaper"
          >
            <ChevronLeft className="w-4 h-4 text-black/70" />
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'p-2 rounded-full transition-all duration-200 hover:scale-110 active:scale-95',
              isOpen ? 'bg-white/50' : 'hover:bg-white/40'
            )}
            title="Select wallpaper"
          >
            <ImageIcon className="w-4 h-4 text-black/70" />
          </button>

          <button
            onClick={handleNext}
            className="p-2 hover:bg-white/40 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
            title="Next wallpaper"
          >
            <ChevronRight className="w-4 h-4 text-black/70" />
          </button>
        </div>

        {/* Wallpaper indicator */}
        <div className="flex gap-1 justify-center mt-2">
          {wallpapers.map((_, index) => (
            <div
              key={index}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                index === currentIndex ? 'bg-black/60 w-4' : 'bg-black/30 w-1.5 hover:bg-black/40'
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
