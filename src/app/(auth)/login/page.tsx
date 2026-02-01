'use client'

import { Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import Link from 'next/link'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/auth/role-select'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(errorParam ? 'Authentication failed. Please try again.' : '')
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Invalid credentials. Try partner@sanctuary.vc')
        setIsLoading(false)
      } else {
        router.push(callbackUrl)
        router.refresh()
      }
    } catch {
      setError('System error. Please retry.')
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    setLoadingProvider(provider)
    try {
      await signIn(provider, { callbackUrl })
    } catch {
      setError('OAuth connection failed.')
      setLoadingProvider(null)
    }
  }

  const handleDemoLogin = async (role: 'partner' | 'founder') => {
    setError('')
    setIsLoading(true)
    const demoEmail = role === 'partner' ? 'partner@sanctuary.vc' : 'sarah@techflow.ai'

    try {
      const result = await signIn('credentials', {
        email: demoEmail,
        password: 'demo',
        redirect: false,
      })

      if (result?.error) {
        setError('Demo access failed.')
        setIsLoading(false)
      } else {
        const redirectUrl = role === 'partner' ? '/partner/dashboard' : '/founder/dashboard'
        router.push(redirectUrl)
        router.refresh()
      }
    } catch {
      setError('System error. Please retry.')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#000000]">
      {/* Header */}
      <header className="p-8 md:p-12">
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <div className="w-2 h-2 bg-[var(--olive)]" />
          <span className="text-xs uppercase tracking-[0.3em] font-bold font-mono text-[var(--cream)]">
            Terminal Access
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-4xl">
          {/* Massive Title */}
          <h1 className="text-[12vw] md:text-[10rem] font-black leading-[0.85] tracking-tighter text-[var(--cream)] mb-16 md:mb-24 text-center md:text-left font-mono">
            SANCTUARY
          </h1>

          <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
            {/* Login Form */}
            <div className="w-full max-w-md space-y-8">
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-widest text-[var(--cream)]/60 font-bold font-mono">
                  Authentication Protocol
                </label>
                <p className="text-sm text-[var(--cream)]/40 italic font-mono">
                  // Enter credentials to access system
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[var(--cream)] text-[var(--deep-black)] border-none h-16 px-6 text-lg font-bold placeholder:text-[var(--deep-black)]/30 focus:ring-4 focus:ring-[var(--olive)] outline-none transition-all uppercase font-mono"
                    placeholder="IDENTIFIER@ACCESS.IO"
                    required
                    disabled={isLoading || loadingProvider !== null}
                  />
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[var(--cream)] text-[var(--deep-black)] border-none h-16 px-6 text-lg font-bold placeholder:text-[var(--deep-black)]/30 focus:ring-4 focus:ring-[var(--olive)] outline-none transition-all uppercase font-mono"
                    placeholder="ACCESS_KEY"
                    required
                    disabled={isLoading || loadingProvider !== null}
                  />
                </div>

                {error && (
                  <p className="text-[10px] uppercase tracking-widest text-[var(--warning)] font-mono">
                    [ERROR]: {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || loadingProvider !== null}
                  className="w-full bg-[var(--olive)] hover:bg-[var(--dark-olive)] text-[var(--deep-black)] font-black uppercase tracking-widest h-16 transition-colors flex items-center justify-center gap-3 font-mono disabled:opacity-50"
                >
                  {isLoading ? (
                    <span>AUTHENTICATING...</span>
                  ) : (
                    <>
                      <span>Initialize_Session</span>
                      <span className="material-symbols-outlined font-black">arrow_right_alt</span>
                    </>
                  )}
                </button>
              </form>

              {/* OAuth Options */}
              <div className="space-y-3">
                <p className="text-[10px] uppercase tracking-widest text-[var(--cream)]/40 font-mono text-center">
                  // Alternative Protocols
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('google')}
                    disabled={isLoading || loadingProvider !== null}
                    className="h-12 border border-[var(--cream)]/20 hover:bg-[var(--cream)] hover:text-[var(--deep-black)] text-[var(--cream)] text-[10px] font-bold uppercase tracking-widest transition-colors font-mono disabled:opacity-50"
                  >
                    {loadingProvider === 'google' ? '...' : 'Google_SSO'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOAuthSignIn('github')}
                    disabled={isLoading || loadingProvider !== null}
                    className="h-12 border border-[var(--cream)]/20 hover:bg-[var(--cream)] hover:text-[var(--deep-black)] text-[var(--cream)] text-[10px] font-bold uppercase tracking-widest transition-colors font-mono disabled:opacity-50"
                  >
                    {loadingProvider === 'github' ? '...' : 'GitHub_SSO'}
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10">
                <p className="text-[10px] uppercase tracking-widest text-[var(--cream)]/40 leading-relaxed font-mono">
                  No credentials?{' '}
                  <Link href="/signup" className="text-[var(--olive)] hover:text-[var(--cream)] transition-colors">
                    Initialize_New_Account
                  </Link>
                </p>
              </div>

              {/* Demo Access */}
              <div className="pt-4 border-t border-white/10 space-y-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--cream)]/40 font-mono">
                  Demo_Access_Protocols
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('partner')}
                    disabled={isLoading || loadingProvider !== null}
                    className="h-12 border border-[var(--olive)] text-[var(--olive)] hover:bg-[var(--olive)] hover:text-[var(--deep-black)] text-[10px] font-bold uppercase tracking-widest transition-colors font-mono disabled:opacity-50"
                  >
                    Partner_Mode
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDemoLogin('founder')}
                    disabled={isLoading || loadingProvider !== null}
                    className="h-12 border border-[var(--olive)] text-[var(--olive)] hover:bg-[var(--olive)] hover:text-[var(--deep-black)] text-[10px] font-bold uppercase tracking-widest transition-colors font-mono disabled:opacity-50"
                  >
                    Founder_Mode
                  </button>
                </div>
              </div>
            </div>

            {/* System Status Panel */}
            <div className="hidden md:block flex-1 border-l border-white/10 pl-12 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--olive)] font-mono">
                  System_Status
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-white/10 p-4">
                    <div className="text-[10px] uppercase text-[var(--cream)]/40 font-mono">Portfolio_Data</div>
                    <div className="text-xl font-bold font-mono text-[var(--cream)]">99.9%</div>
                  </div>
                  <div className="border border-white/10 p-4">
                    <div className="text-[10px] uppercase text-[var(--cream)]/40 font-mono">Network_Node</div>
                    <div className="text-xl font-bold font-mono text-[var(--olive)]">SECURE</div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--olive)] font-mono">
                  Active_Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-white/10 p-4">
                    <div className="text-[10px] uppercase text-[var(--cream)]/40 font-mono">Entities</div>
                    <div className="text-xl font-bold font-mono text-[var(--cream)]">42</div>
                  </div>
                  <div className="border border-white/10 p-4">
                    <div className="text-[10px] uppercase text-[var(--cream)]/40 font-mono">Cohorts</div>
                    <div className="text-xl font-bold font-mono text-[var(--cream)]">3</div>
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-mono text-[var(--cream)]/20 uppercase leading-loose">
                [LOG]: SYSTEM_INITIALIZED<br />
                [LOG]: ENCRYPTION_ACTIVE<br />
                [LOG]: WAITING_FOR_USER_INPUT...
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-8 md:p-12 flex flex-col md:flex-row justify-between items-end gap-6 border-t border-white/5">
        <div className="text-[10px] uppercase tracking-[0.2em] text-[var(--cream)]/30 font-mono">
          &copy; 2024 SANCTUARY LTD / PORTFOLIO_INTEL
        </div>
        <nav className="flex gap-8 text-[10px] uppercase tracking-[0.2em] font-bold font-mono">
          <a className="text-[var(--cream)]/50 hover:text-[var(--olive)] transition-colors" href="#">
            Support
          </a>
          <a className="text-[var(--cream)]/50 hover:text-[var(--olive)] transition-colors" href="#">
            Privacy
          </a>
          <a className="text-[var(--cream)]/50 hover:text-[var(--olive)] transition-colors" href="#">
            Terms
          </a>
        </nav>
      </footer>
    </div>
  )
}

function LoginSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000000]">
      <div className="text-[var(--cream)]/40 font-mono text-sm uppercase tracking-widest">
        INITIALIZING_TERMINAL...
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
