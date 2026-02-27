'use client'

import { ReactNode, useState, useEffect } from 'react'
import { BottomNav } from './bottom-nav'
import { WindowView } from './window-view'
import { WallpaperSelector } from './wallpaper-selector'
import { MyDayPanel } from './my-day-panel'

interface OSLayoutProps {
  children: ReactNode
  backgroundImage?: string
  role?: 'founder' | 'partner'
  activeWindow?: NavSection | null
  onWindowChange?: (window: NavSection | null) => void
}

export type NavSection = 'home' | 'portfolio' | 'applications' | 'mentors' | 'analytics' | 'settings' | 'company' | 'documents' | 'requests' | 'progress'

export function OSLayout({
  children,
  backgroundImage: initialBackgroundImage,
  role = 'founder',
  activeWindow: externalActiveWindow,
  onWindowChange
}: OSLayoutProps) {
  const [internalActiveWindow, setInternalActiveWindow] = useState<NavSection | null>(null)
  const [isMyDayOpen, setIsMyDayOpen] = useState(false)
  const [showBottomNav, setShowBottomNav] = useState(false)

  // Use external state if provided, otherwise use internal
  const activeWindow = externalActiveWindow !== undefined ? externalActiveWindow : internalActiveWindow
  const setActiveWindow = onWindowChange || setInternalActiveWindow
  const [backgroundImage, setBackgroundImage] = useState(initialBackgroundImage || '/assets/wallpapers/wallpaper-bg.jpg')

  // Load saved wallpaper from localStorage
  useEffect(() => {
    const savedWallpaper = localStorage.getItem('sanctuary-wallpaper')
    if (savedWallpaper) {
      setBackgroundImage(savedWallpaper)
    }
  }, [])

  // Save wallpaper to localStorage when it changes
  const handleWallpaperChange = (newWallpaper: string) => {
    setBackgroundImage(newWallpaper)
    localStorage.setItem('sanctuary-wallpaper', newWallpaper)
  }

  const handleNavClick = (section: NavSection) => {
    if (section === 'home') {
      setActiveWindow(null)
    } else {
      setActiveWindow(section)
    }
  }

  const handleCloseWindow = () => {
    setActiveWindow(null)
  }

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* My Day Button - Top Right */}
      <button
        onClick={() => setIsMyDayOpen(true)}
        className="fixed top-8 right-8 z-30 px-6 py-3 bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/50 hover:bg-white/90 hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 group"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-br from-info to-purple-600 animate-pulse" />
          <span className="text-sm font-semibold text-black/90">My Day</span>
        </div>
      </button>

      {/* Home Screen - Widget Grid */}
      <div className="relative z-10 w-full h-full pb-24 overflow-auto">
        {children}
      </div>

      {/* Window Overlay */}
      {activeWindow && (
        <WindowView
          section={activeWindow}
          onClose={handleCloseWindow}
          role={role}
        />
      )}

      {/* Wallpaper Selector */}
      <WallpaperSelector
        currentWallpaper={backgroundImage}
        onWallpaperChange={handleWallpaperChange}
        isWindowOpen={!!activeWindow}
      />

      {/* My Day Panel */}
      <MyDayPanel
        isOpen={isMyDayOpen}
        onClose={() => setIsMyDayOpen(false)}
      />

      {/* Bottom Navigation Hover Area (when window is open and nav is hidden) */}
      {activeWindow && !showBottomNav && (
        <div
          className="fixed bottom-0 left-0 right-0 h-20 z-40 pointer-events-auto"
          onMouseEnter={() => setShowBottomNav(true)}
        />
      )}

      {/* Bottom Navigation */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          activeWindow
            ? showBottomNav
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0'
            : 'translate-y-0 opacity-100'
        }`}
        onMouseLeave={() => {
          if (activeWindow) {
            setShowBottomNav(false)
          }
        }}
      >
        <BottomNav
          activeSection={activeWindow || 'home'}
          onNavigate={handleNavClick}
          role={role}
        />
      </div>
    </div>
  )
}
