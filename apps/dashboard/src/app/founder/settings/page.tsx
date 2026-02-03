'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { mockFounder } from '@/lib/stores/auth-store'
import { User, Bell, Shield, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'

export default function FounderSettingsPage() {
  const [name, setName] = useState(mockFounder.name)
  const [email] = useState(mockFounder.email)
  const [notifications, setNotifications] = useState({
    email: true,
    mentorMatches: true,
    checkpointReminders: true,
    partnerFeedback: true,
  })

  const handleSave = () => {
    toast.success('Settings saved successfully')
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="bg-muted" />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Choose what you want to be notified about</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Email Notifications</p>
              <p className="text-xs text-muted-foreground">Receive updates via email</p>
            </div>
            <Switch
              checked={notifications.email}
              onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Mentor Matches</p>
              <p className="text-xs text-muted-foreground">When you&apos;re matched with a mentor</p>
            </div>
            <Switch
              checked={notifications.mentorMatches}
              onCheckedChange={(checked) => setNotifications({ ...notifications, mentorMatches: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Checkpoint Reminders</p>
              <p className="text-xs text-muted-foreground">Reminders for upcoming checkpoints</p>
            </div>
            <Switch
              checked={notifications.checkpointReminders}
              onCheckedChange={(checked) => setNotifications({ ...notifications, checkpointReminders: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Partner Feedback</p>
              <p className="text-xs text-muted-foreground">When partners leave feedback</p>
            </div>
            <Switch
              checked={notifications.partnerFeedback}
              onCheckedChange={(checked) => setNotifications({ ...notifications, partnerFeedback: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Change Password</Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave}>
        <Save className="h-4 w-4 mr-2" />
        Save Changes
      </Button>

      <Toaster />
    </div>
  )
}
