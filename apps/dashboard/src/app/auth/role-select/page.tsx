'use client'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  RadioGroup,
  RadioGroupItem,
  Label,
} from '@sanctuary/ui'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { updateUserType, getUserProfile } from '@/lib/supabase/auth'
import { useAuthStore, type UserRole, type PartnerSubType } from '@/lib/stores/auth-store'
import {
  Rocket,
  Briefcase,
  Users,
  TrendingUp,
  Building2,
  Loader2,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

type PartnerType = 'mentor' | 'vc' | 'startup_manager'

const partnerTypes: {
  value: PartnerType
  label: string
  description: string
  icon: typeof Users
}[] = [
  {
    value: 'mentor',
    label: 'Mentor',
    description: 'Guide and advise startups with your expertise',
    icon: Users,
  },
  {
    value: 'vc',
    label: 'Investor / VC',
    description: 'Evaluate and invest in promising startups',
    icon: TrendingUp,
  },
  {
    value: 'startup_manager',
    label: 'Startup Manager',
    description: 'Manage and oversee the accelerator portfolio',
    icon: Building2,
  },
]

export default function RoleSelectPage() {
  const router = useRouter()
  const { setRole, setProfile } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState<UserRole>(null)
  const [selectedPartnerType, setSelectedPartnerType] = useState<PartnerType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkingAuth, setCheckingAuth] = useState(true)

  // Check if user is authenticated and if they already have a role
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/auth/login')
        return
      }

      // Check if user already has a role
      const { data: profile } = await getUserProfile()
      if (profile?.user_type) {
        // User already has a role, redirect to appropriate dashboard
        const redirectUrl = profile.user_type === 'founder'
          ? '/founder/dashboard'
          : '/partner/dashboard'
        router.push(redirectUrl)
        return
      }

      setCheckingAuth(false)
    }

    checkAuth()
  }, [router])

  const handleContinue = async () => {
    if (!selectedRole) return

    if (selectedRole === 'partner' && !selectedPartnerType) {
      setError('Please select your partner type')
      return
    }

    setIsLoading(true)
    setError(null)

    const { data, error: updateError } = await updateUserType(
      selectedRole,
      selectedPartnerType as PartnerSubType
    )

    if (updateError) {
      setError(updateError.message)
      setIsLoading(false)
      return
    }

    // Update local state
    setRole(selectedRole, selectedPartnerType as PartnerSubType)

    // Update profile in store
    if (data) {
      setProfile({
        id: data.id,
        email: data.email,
        name: data.name,
        avatarUrl: data.avatar_url,
        userType: data.user_type as UserRole,
        partnerSubType: data.partner_sub_type as PartnerSubType,
        startupId: data.startup_id,
        onboardingComplete: data.onboarding_complete,
      })
    }

    // Redirect based on role
    const redirectUrl = selectedRole === 'founder'
      ? '/founder/apply'  // Founders go to application first
      : '/partner/dashboard'
    router.push(redirectUrl)
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-background to-muted/30">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mx-auto mb-4">
            <span className="text-primary-foreground font-bold text-xl">S</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Sanctuary</h1>
          <p className="text-muted-foreground">
            Tell us how you&apos;d like to participate
          </p>
        </div>

        {/* Role Selection */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Founder Card */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedRole === 'founder'
                ? 'border-primary ring-2 ring-primary/20'
                : ''
            }`}
            onClick={() => {
              setSelectedRole('founder')
              setSelectedPartnerType(null)
              setError(null)
            }}
          >
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-info/15 flex items-center justify-center mb-2">
                <Rocket className="h-6 w-6 text-info" />
              </div>
              <CardTitle className="flex items-center justify-between">
                Founder / Startup
                {selectedRole === 'founder' && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </CardTitle>
              <CardDescription>
                I&apos;m building a startup and want to join the accelerator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Apply to the accelerator program</li>
                <li>Get matched with mentors</li>
                <li>Track your progress</li>
              </ul>
            </CardContent>
          </Card>

          {/* Partner Card */}
          <Card
            className={`cursor-pointer transition-all hover:border-primary/50 ${
              selectedRole === 'partner'
                ? 'border-primary ring-2 ring-primary/20'
                : ''
            }`}
            onClick={() => {
              setSelectedRole('partner')
              setError(null)
            }}
          >
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-lg bg-success/15 flex items-center justify-center mb-2">
                <Briefcase className="h-6 w-6 text-success" />
              </div>
              <CardTitle className="flex items-center justify-between">
                Partner
                {selectedRole === 'partner' && (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                )}
              </CardTitle>
              <CardDescription>
                I want to mentor, invest, or manage startups
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Review startup applications</li>
                <li>Mentor portfolio companies</li>
                <li>Track portfolio metrics</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Partner Type Selection */}
        {selectedRole === 'partner' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">What&apos;s your role?</CardTitle>
              <CardDescription>
                This helps us customize your experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedPartnerType || ''}
                onValueChange={(value) => {
                  setSelectedPartnerType(value as PartnerType)
                  setError(null)
                }}
              >
                <div className="space-y-3">
                  {partnerTypes.map((type) => {
                    const Icon = type.icon
                    return (
                      <div key={type.value} className="flex items-center space-x-3">
                        <RadioGroupItem value={type.value} id={type.value} />
                        <Label
                          htmlFor={type.value}
                          className="flex items-center gap-3 cursor-pointer flex-1"
                        >
                          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                            <Icon className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium">{type.label}</p>
                            <p className="text-sm text-muted-foreground">
                              {type.description}
                            </p>
                          </div>
                        </Label>
                      </div>
                    )
                  })}
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 p-3 mb-4 text-sm text-destructive bg-destructive/10 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={handleContinue}
            disabled={!selectedRole || isLoading}
            className="px-8"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Setting up...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
