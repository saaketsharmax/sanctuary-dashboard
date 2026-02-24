'use client'

import { ReactNode, useRef, useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface DraggableWidgetProps {
  id: string
  children: ReactNode
  initialPosition?: { x: number; y: number }
  initialSize?: { width: number; height: number }
  onPositionChange?: (id: string, position: { x: number; y: number }) => void
  onSizeChange?: (id: string, size: { width: number; height: number }) => void
  gridSize?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export function DraggableWidget({
  id,
  children,
  initialPosition = { x: 0, y: 0 },
  initialSize = { width: 330, height: 'auto' as any },
  onPositionChange,
  onSizeChange,
  gridSize = 0,
  minWidth = 200,
  minHeight = 150,
  maxWidth = 800,
  maxHeight = 1000,
}: DraggableWidgetProps) {
  const [position, setPosition] = useState(initialPosition)
  const [size, setSize] = useState(initialSize)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string>('')
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const widgetRef = useRef<HTMLDivElement>(null)

  // Load position and size from localStorage on mount
  useEffect(() => {
    const savedPosition = localStorage.getItem(`widget-position-${id}`)
    if (savedPosition) {
      try {
        const parsed = JSON.parse(savedPosition)
        setPosition(parsed)
      } catch (e) {
        console.error('Failed to parse saved position', e)
      }
    }

    const savedSize = localStorage.getItem(`widget-size-${id}`)
    if (savedSize) {
      try {
        const parsed = JSON.parse(savedSize)
        setSize(parsed)
      } catch (e) {
        console.error('Failed to parse saved size', e)
      }
    }
  }, [id])

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag if clicking on the widget itself, not on interactive elements or resize handles
    const target = e.target as HTMLElement
    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'A' ||
      target.closest('button') ||
      target.closest('a') ||
      target.closest('[data-no-drag]') ||
      target.closest('[data-resize-handle]')
    ) {
      return
    }

    e.preventDefault()
    setIsDragging(true)

    const rect = widgetRef.current?.getBoundingClientRect()
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }
  }

  const handleResizeStart = (e: React.MouseEvent, direction: string) => {
    e.preventDefault()
    e.stopPropagation()
    setIsResizing(true)
    setResizeDirection(direction)

    const rect = widgetRef.current?.getBoundingClientRect()
    if (rect) {
      setResizeStart({
        x: e.clientX,
        y: e.clientY,
        width: rect.width,
        height: rect.height,
      })
    }
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const newX = e.clientX - dragOffset.x
        const newY = e.clientY - dragOffset.y

        // Snap to grid if gridSize is provided
        const snappedX = gridSize > 0 ? Math.round(newX / gridSize) * gridSize : newX
        const snappedY = gridSize > 0 ? Math.round(newY / gridSize) * gridSize : newY

        // Constrain to viewport
        const maxX = window.innerWidth - (widgetRef.current?.offsetWidth || 0)
        const maxY = window.innerHeight - (widgetRef.current?.offsetHeight || 0)

        const constrainedX = Math.max(0, Math.min(snappedX, maxX))
        const constrainedY = Math.max(0, Math.min(snappedY, maxY))

        setPosition({ x: constrainedX, y: constrainedY })
      } else if (isResizing) {
        const deltaX = e.clientX - resizeStart.x
        const deltaY = e.clientY - resizeStart.y

        let newWidth = resizeStart.width
        let newHeight = resizeStart.height
        let newX = position.x
        let newY = position.y

        // Calculate new dimensions based on resize direction
        if (resizeDirection.includes('e')) {
          newWidth = resizeStart.width + deltaX
        }
        if (resizeDirection.includes('w')) {
          newWidth = resizeStart.width - deltaX
          newX = position.x + deltaX
        }
        if (resizeDirection.includes('s')) {
          newHeight = resizeStart.height + deltaY
        }
        if (resizeDirection.includes('n')) {
          newHeight = resizeStart.height - deltaY
          newY = position.y + deltaY
        }

        // Apply constraints
        newWidth = Math.max(minWidth, Math.min(newWidth, maxWidth))
        newHeight = Math.max(minHeight, Math.min(newHeight, maxHeight))

        // Update position if resizing from top or left
        if (resizeDirection.includes('w')) {
          newX = position.x + (resizeStart.width - newWidth)
        }
        if (resizeDirection.includes('n')) {
          newY = position.y + (resizeStart.height - newHeight)
        }

        setSize({ width: newWidth, height: newHeight })
        if (resizeDirection.includes('w') || resizeDirection.includes('n')) {
          setPosition({ x: newX, y: newY })
        }
      }
    }

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false)
        // Save position to localStorage
        localStorage.setItem(`widget-position-${id}`, JSON.stringify(position))
        // Notify parent
        onPositionChange?.(id, position)
      }
      if (isResizing) {
        setIsResizing(false)
        // Save size to localStorage
        localStorage.setItem(`widget-size-${id}`, JSON.stringify(size))
        // Notify parent
        onSizeChange?.(id, size)
      }
    }

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, isResizing, dragOffset, resizeStart, resizeDirection, position, size, id, onPositionChange, onSizeChange, gridSize, minWidth, minHeight, maxWidth, maxHeight])

  const resizeHandles = [
    { direction: 'n', className: 'top-0 left-1/2 -translate-x-1/2 w-16 h-1 cursor-ns-resize' },
    { direction: 's', className: 'bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 cursor-ns-resize' },
    { direction: 'e', className: 'right-0 top-1/2 -translate-y-1/2 w-1 h-16 cursor-ew-resize' },
    { direction: 'w', className: 'left-0 top-1/2 -translate-y-1/2 w-1 h-16 cursor-ew-resize' },
    { direction: 'ne', className: 'top-0 right-0 w-4 h-4 cursor-ne-resize' },
    { direction: 'nw', className: 'top-0 left-0 w-4 h-4 cursor-nw-resize' },
    { direction: 'se', className: 'bottom-0 right-0 w-4 h-4 cursor-se-resize' },
    { direction: 'sw', className: 'bottom-0 left-0 w-4 h-4 cursor-sw-resize' },
  ]

  return (
    <div
      ref={widgetRef}
      className={cn(
        'absolute transition-shadow group',
        isDragging && 'shadow-2xl scale-[1.02] z-50',
        isResizing && 'shadow-2xl z-50',
        !isDragging && !isResizing && 'cursor-grab'
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: typeof size.width === 'number' ? `${size.width}px` : size.width,
        height: typeof size.height === 'number' ? `${size.height}px` : size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={cn((isDragging || isResizing) && 'pointer-events-none')}>
        {children}
      </div>

      {/* Resize Handles - visible on hover */}
      {resizeHandles.map(({ direction, className }) => (
        <div
          key={direction}
          data-resize-handle
          className={cn(
            'absolute opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-blue-500/50',
            className
          )}
          onMouseDown={(e) => handleResizeStart(e, direction)}
        />
      ))}

      {/* Corner resize indicators */}
      <div className="absolute top-0 right-0 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500/70" />
      </div>
      <div className="absolute bottom-0 right-0 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500/70" />
      </div>
      <div className="absolute top-0 left-0 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-blue-500/70" />
      </div>
      <div className="absolute bottom-0 left-0 w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="absolute bottom-1 left-1 w-1.5 h-1.5 rounded-full bg-blue-500/70" />
      </div>
    </div>
  )
}
