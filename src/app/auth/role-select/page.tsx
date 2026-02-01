'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Building2, Loader2, Rocket, Users, Briefcase, GraduationCap, LineChart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { PartnerSubType } from '@/types'

type RoleStep = 'role' | 'partner-type'

const partnerSubTypes: { value: PartnerSubType; label: string; description: string; icon: React.ReactNode }[] = [
  {
    value: 'mentor',
    label: 'Mentor',
    description: 'Guide founders through challenges and share your expertise',
    icon: <GraduationCap className="h-6 w-6" />,
  },
  {
    value: 'vc',
    label: 'VC / Investor',
    description: 'Access investment metrics and due diligence tools',
    icon: <LineChart className="h-6 w-6" />,
  },
  {
    value: 'startup_manager',
    label: 'Startup Manager',
    description: 'Full portfolio management and programme oversight',
    icon: <Briefcase className="h-6 w-6" />,
  },
]

export default function RoleSelectPage() {
  const router = useRouter()
  const { data: session, update } = useSession()

  const [step, setStep] = useState<RoleStep>('role')
  const [selectedRole, setSelectedRole] = useState<'founder' | 'partner' | null>(null)
  const [selectedPartnerType, setSelectedPartnerType] = useState<PartnerSubType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // If user already has a role, redirect to appropriate dashboard
  if (session?.user?.userType) {
    const redirectUrl = session.user.userType === 'founder' ? '/founder/dashboard' : '/partner/dashboard'
    router.push(redirectUrl)
    return null
  }

  const handleRoleSelect = (role: 'founder' | 'partner') => {
    setSelectedRole(role)
    if (role === 'partner') {
      setStep('partner-type')
    }
  }

  const handleSubmit = async () => {
    if (!selectedRole) return

    if (selectedRole === 'partner' && !selectedPartnerType) {
      setError('Please select your partner type')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/role-select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType: selectedRole,
          partnerSubType: selectedPartnerType,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save role')
      }

      // Update the session with new role
      await update({
        userType: selectedRole,
        partnerSubType: selectedPartnerType,
      })

      // Redirect to appropriate dashboard
      router.push(data.redirectUrl)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Building2 className="h-7 w-7 text-primary-foreground" />
          </div>
          {step === 'role' ? (
            <>
              <CardTitle className="text-2xl">Welcome to Sanctuary</CardTitle>
              <CardDescription>Tell us about yourself to customize your experience</CardDescription>
            </>
          ) : (
            <>
              <CardTitle className="text-2xl">What&apos;s your role?</CardTitle>
              <CardDescription>Select how you&apos;ll be working with startups</CardDescription>
            </>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 'role' && (
            <>
              <div className="grid gap-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('founder')}
                  className={cn(
                    'flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all hover:border-primary',
                    selectedRole === 'founder' && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900 dark:text-blue-400">
                    <Rocket className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">I&apos;m a Founder</h3>
                    <p className="text-sm text-muted-foreground">
                      I&apos;m building a startup and looking for support, mentorship, and resources
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('partner')}
                  className={cn(
                    'flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all hover:border-primary',
                    selectedRole === 'partner' && 'border-primary bg-primary/5'
                  )}
                >
                  <div className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900 dark:text-green-400">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">I&apos;m a Partner</h3>
                    <p className="text-sm text-muted-foreground">
                      I&apos;m a mentor, investor, or startup manager working with the portfolio
                    </p>
                  </div>
                </button>
              </div>

              {selectedRole === 'founder' && (
                <Button onClick={handleSubmit} className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Continue as Founder'
                  )}
                </Button>
              )}
            </>
          )}

          {step === 'partner-type' && (
            <>
              <div className="grid gap-3">
                {partnerSubTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedPartnerType(type.value)}
                    className={cn(
                      'flex items-start gap-4 rounded-lg border-2 p-4 text-left transition-all hover:border-primary',
                      selectedPartnerType === type.value && 'border-primary bg-primary/5'
                    )}
                  >
                    <div className="rounded-lg bg-muted p-2">
                      {type.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold">{type.label}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('role')
                    setSelectedPartnerType(null)
                  }}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1"
                  disabled={isLoading || !selectedPartnerType}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Setting up...
                    </>
                  ) : (
                    'Continue'
                  )}
                </Button>
              </div>
            </>
          )}

          {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </CardContent>
      </Card>
    </div>
  )
}
