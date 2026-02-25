'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Switch,
  Toaster,
} from '@sanctuary/ui'
import { User, Bell, Shield, Save } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
export default function PartnerSettingsPage() {
  const [name, setName] = useState('')
  const [email] = useState('')
  const [notifications, setNotifications] = useState({
    newApplications: true,
    matchSuggestions: true,
    atRiskAlerts: true,
    weeklyDigest: true,
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
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" value={email} disabled className="bg-muted" placeholder="Your email" />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Input value="Partner" disabled className="bg-muted capitalize" />
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
              <p className="font-medium text-sm">New Applications</p>
              <p className="text-xs text-muted-foreground">When founders submit applications</p>
            </div>
            <Switch
              checked={notifications.newApplications}
              onCheckedChange={(checked) => setNotifications({ ...notifications, newApplications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Match Suggestions</p>
              <p className="text-xs text-muted-foreground">New mentor match recommendations</p>
            </div>
            <Switch
              checked={notifications.matchSuggestions}
              onCheckedChange={(checked) => setNotifications({ ...notifications, matchSuggestions: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">At-Risk Alerts</p>
              <p className="text-xs text-muted-foreground">When startups are flagged as at-risk</p>
            </div>
            <Switch
              checked={notifications.atRiskAlerts}
              onCheckedChange={(checked) => setNotifications({ ...notifications, atRiskAlerts: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">Weekly Digest</p>
              <p className="text-xs text-muted-foreground">Summary of portfolio activity</p>
            </div>
            <Switch
              checked={notifications.weeklyDigest}
              onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
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
