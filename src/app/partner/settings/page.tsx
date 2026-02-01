'use client'

import { useSession } from 'next-auth/react'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  User,
  Bell,
  Shield,
  Mail,
} from 'lucide-react'

function getPartnerTypeLabel(subType: string | null | undefined) {
  switch (subType) {
    case 'mentor':
      return 'Mentor'
    case 'vc':
      return 'Investor'
    case 'startup_manager':
      return 'Startup Manager'
    default:
      return 'Partner'
  }
}

export default function PartnerSettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="flex flex-col h-full">
      <PartnerHeader
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="flex-1 overflow-auto p-6 space-y-6 max-w-3xl">
        {/* Profile */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-green-600" />
              <CardTitle>Profile</CardTitle>
            </div>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue={session?.user?.name || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={session?.user?.email || ''} disabled />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <div>
                <Badge variant="secondary">
                  {getPartnerTypeLabel(session?.user?.partnerSubType)}
                </Badge>
              </div>
            </div>
            <Button>Save Changes</Button>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-yellow-600" />
              <CardTitle>Notifications</CardTitle>
            </div>
            <CardDescription>Manage how you receive updates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive updates about portfolio activity via email
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>New Applications</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when new startups apply
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Match Suggestions</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications for new mentor-startup matches
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Risk Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get alerted when startups show elevated risk
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Access Control */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <CardTitle>Access & Permissions</CardTitle>
            </div>
            <CardDescription>Your access level based on your role</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <p className="font-medium mb-2">
                {getPartnerTypeLabel(session?.user?.partnerSubType)} Access
              </p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {session?.user?.partnerSubType === 'startup_manager' && (
                  <>
                    <li>Full portfolio management access</li>
                    <li>Application review and approval</li>
                    <li>Mentor matching oversight</li>
                    <li>Shared view management</li>
                    <li>All metrics and analytics</li>
                  </>
                )}
                {session?.user?.partnerSubType === 'vc' && (
                  <>
                    <li>Full portfolio view access</li>
                    <li>Investment metrics and readiness scores</li>
                    <li>Due diligence documents</li>
                    <li>Limited mentor matching access</li>
                  </>
                )}
                {session?.user?.partnerSubType === 'mentor' && (
                  <>
                    <li>View matched startups</li>
                    <li>Mentor matching system access</li>
                    <li>Session feedback recording</li>
                    <li>Limited portfolio visibility</li>
                  </>
                )}
                {!session?.user?.partnerSubType && (
                  <li>Basic partner access</li>
                )}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-purple-600" />
              <CardTitle>Need Help?</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              If you have questions or need support, reach out to the admin team.
            </p>
            <Button variant="outline">
              <Mail className="mr-2 h-4 w-4" />
              Contact Admin
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
