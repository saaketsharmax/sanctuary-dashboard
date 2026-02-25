'use client'

import {
  Button,
  Input,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@sanctuary/ui'
import { Bell, Search, Plus } from 'lucide-react'
import { useAuthStore, useUser } from '@/lib/stores/auth-store'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  title?: string
  showSearch?: boolean
  showAddButton?: boolean
  onAddClick?: () => void
  addButtonLabel?: string
}

export function Header({
  title,
  showSearch = true,
  showAddButton = false,
  onAddClick,
  addButtonLabel = 'Add New',
}: HeaderProps) {
  const router = useRouter()
  const user = useUser()
  const { clearRole } = useAuthStore()

  const initials = user?.name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleLogout = () => {
    clearRole()
    router.push('/')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      {/* Left side - Title */}
      <div className="flex items-center gap-4">
        {title && <h1 className="text-xl font-semibold">{title}</h1>}
      </div>

      {/* Center - Search */}
      {showSearch && (
        <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search startups, founders..."
              className="pl-9 bg-background"
            />
          </div>
        </div>
      )}

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        {showAddButton && (
          <Button onClick={onAddClick} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {addButtonLabel}
          </Button>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.avatarUrl || undefined} alt={user?.name} />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {initials || '?'}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive">
              Exit to Home
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
