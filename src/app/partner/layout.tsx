import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { PartnerSidebar } from '@/components/partner/layout/partner-sidebar'
import { Toaster } from '@/components/ui/sonner'

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  if (session.user.userType !== 'partner') {
    redirect('/founder/dashboard')
  }

  return (
    <div className="min-h-screen bg-[var(--deep-black)]">
      <PartnerSidebar />
      <main className="ml-16">
        {children}
      </main>
      <Toaster />
    </div>
  )
}
