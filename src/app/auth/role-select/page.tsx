'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import type { PartnerSubType } from '@/types'

type RoleStep = 'role' | 'partner-type'

const partnerSubTypes: { value: PartnerSubType; label: string; description: string; icon: string }[] = [
  {
    value: 'mentor',
    label: 'MENTOR',
    description: 'Guide founders through challenges and share your expertise',
    icon: 'school',
  },
  {
    value: 'vc',
    label: 'VC_/_INVESTOR',
    description: 'Access investment metrics and due diligence tools',
    icon: 'trending_up',
  },
  {
    value: 'startup_manager',
    label: 'STARTUP_MANAGER',
    description: 'Full portfolio management and programme oversight',
    icon: 'business_center',
  },
]

export default function RoleSelectPage() {
  const router = useRouter()
  const { data: session, status, update } = useSession()

  const [step, setStep] = useState<RoleStep>('role')
  const [selectedRole, setSelectedRole] = useState<'founder' | 'partner' | null>(null)
  const [selectedPartnerType, setSelectedPartnerType] = useState<PartnerSubType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle redirects based on auth state
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (session?.user?.userType) {
      const redirectUrl = session.user.userType === 'founder' ? '/founder/dashboard' : '/partner/dashboard'
      router.push(redirectUrl)
    }
  }, [status, session, router])

  // Show loading while checking auth
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--deep-black)]">
        <div className="text-center">
          <div className="size-16 border border-[var(--grid-line)] mx-auto mb-6 flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-3xl text-[var(--olive)]">hourglass_empty</span>
          </div>
          <p className="text-[var(--cream)]/60 font-mono uppercase text-sm">LOADING...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--deep-black)]">
        <div className="text-center">
          <div className="size-16 border border-[var(--grid-line)] mx-auto mb-6 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[var(--warning)]">lock</span>
          </div>
          <h2 className="text-xl font-bold font-mono uppercase text-[var(--cream)] mb-2">AUTHENTICATION_REQUIRED</h2>
          <p className="text-[var(--cream)]/60 font-mono uppercase text-sm mb-6">Please login to continue</p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-[var(--olive)] text-[var(--deep-black)] px-6 py-3 text-xs font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors"
          >
            GO_TO_LOGIN
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    )
  }

  // If user already has a role, show redirecting state
  if (session?.user?.userType) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--deep-black)]">
        <div className="text-center">
          <div className="size-16 border border-[var(--grid-line)] mx-auto mb-6 flex items-center justify-center animate-pulse">
            <span className="material-symbols-outlined text-3xl text-[var(--olive)]">sync</span>
          </div>
          <p className="text-[var(--cream)]/60 font-mono uppercase text-sm">REDIRECTING...</p>
        </div>
      </div>
    )
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
    <div className="min-h-screen flex items-center justify-center bg-[var(--deep-black)] p-4">
      <div className="w-full max-w-lg border border-[var(--grid-line)]">
        {/* Header */}
        <div className="p-8 text-center border-b border-[var(--grid-line)]">
          <div className="size-14 border border-[var(--olive)] mx-auto mb-6 flex items-center justify-center">
            <span className="material-symbols-outlined text-3xl text-[var(--olive)]">domain</span>
          </div>
          {step === 'role' ? (
            <>
              <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-[var(--cream)]">
                WELCOME_TO_SANCTUARY
              </h1>
              <p className="text-[var(--cream)]/60 text-sm mt-2">
                Tell us about yourself to customize your experience
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold font-mono uppercase tracking-tight text-[var(--cream)]">
                SELECT_YOUR_ROLE
              </h1>
              <p className="text-[var(--cream)]/60 text-sm mt-2">
                How will you be working with startups?
              </p>
            </>
          )}
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {step === 'role' && (
            <>
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={() => handleRoleSelect('founder')}
                  className={`w-full flex items-start gap-4 p-4 border text-left transition-all ${
                    selectedRole === 'founder'
                      ? 'border-[var(--olive)] bg-[var(--olive)]/5'
                      : 'border-[var(--grid-line)] hover:border-[var(--cream)]/40'
                  }`}
                >
                  <div className={`size-12 border flex items-center justify-center ${
                    selectedRole === 'founder' ? 'border-[var(--olive)] bg-[var(--olive)]/10' : 'border-[var(--grid-line)]'
                  }`}>
                    <span className={`material-symbols-outlined text-xl ${
                      selectedRole === 'founder' ? 'text-[var(--olive)]' : 'text-blue-500'
                    }`}>rocket_launch</span>
                  </div>
                  <div>
                    <h3 className="font-bold font-mono uppercase text-[var(--cream)]">I&apos;M_A_FOUNDER</h3>
                    <p className="text-sm text-[var(--cream)]/60 mt-1">
                      I&apos;m building a startup and looking for support, mentorship, and resources
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => handleRoleSelect('partner')}
                  className={`w-full flex items-start gap-4 p-4 border text-left transition-all ${
                    selectedRole === 'partner'
                      ? 'border-[var(--olive)] bg-[var(--olive)]/5'
                      : 'border-[var(--grid-line)] hover:border-[var(--cream)]/40'
                  }`}
                >
                  <div className={`size-12 border flex items-center justify-center ${
                    selectedRole === 'partner' ? 'border-[var(--olive)] bg-[var(--olive)]/10' : 'border-[var(--grid-line)]'
                  }`}>
                    <span className={`material-symbols-outlined text-xl ${
                      selectedRole === 'partner' ? 'text-[var(--olive)]' : 'text-[var(--olive)]'
                    }`}>groups</span>
                  </div>
                  <div>
                    <h3 className="font-bold font-mono uppercase text-[var(--cream)]">I&apos;M_A_PARTNER</h3>
                    <p className="text-sm text-[var(--cream)]/60 mt-1">
                      I&apos;m a mentor, investor, or startup manager working with the portfolio
                    </p>
                  </div>
                </button>
              </div>

              {selectedRole === 'founder' && (
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-[var(--olive)] text-[var(--deep-black)] px-6 py-4 text-xs font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      SETTING_UP...
                    </>
                  ) : (
                    <>
                      CONTINUE_AS_FOUNDER
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              )}
            </>
          )}

          {step === 'partner-type' && (
            <>
              <div className="space-y-3">
                {partnerSubTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedPartnerType(type.value)}
                    className={`w-full flex items-start gap-4 p-4 border text-left transition-all ${
                      selectedPartnerType === type.value
                        ? 'border-[var(--olive)] bg-[var(--olive)]/5'
                        : 'border-[var(--grid-line)] hover:border-[var(--cream)]/40'
                    }`}
                  >
                    <div className={`size-10 border flex items-center justify-center ${
                      selectedPartnerType === type.value ? 'border-[var(--olive)] bg-[var(--olive)]/10' : 'border-[var(--grid-line)]'
                    }`}>
                      <span className={`material-symbols-outlined ${
                        selectedPartnerType === type.value ? 'text-[var(--olive)]' : 'text-[var(--cream)]/60'
                      }`}>{type.icon}</span>
                    </div>
                    <div>
                      <h3 className="font-bold font-mono uppercase text-[var(--cream)] text-sm">{type.label}</h3>
                      <p className="text-xs text-[var(--cream)]/60 mt-1">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setStep('role')
                    setSelectedPartnerType(null)
                  }}
                  disabled={isLoading}
                  className="flex-1 border border-[var(--grid-line)] text-[var(--cream)]/60 px-6 py-3 text-xs font-bold tracking-widest font-mono uppercase hover:border-[var(--cream)]/40 hover:text-[var(--cream)] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  BACK
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading || !selectedPartnerType}
                  className="flex-1 bg-[var(--olive)] text-[var(--deep-black)] px-6 py-3 text-xs font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
                      SETTING_UP...
                    </>
                  ) : (
                    <>
                      CONTINUE
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {error && (
            <div className="p-4 border border-[var(--warning)] bg-[var(--warning)]/5">
              <p className="text-sm text-[var(--warning)] font-mono">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
