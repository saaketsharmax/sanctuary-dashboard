import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth-config'
import { PartnerSidebar } from '@/components/partner/layout/partner-sidebar'

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect('/login')
  }

  // Redirect to role selection if no user type
  if (!session.user.userType) {
    redirect('/auth/role-select')
  }

  // Redirect founders to their dashboard
  if (session.user.userType !== 'partner') {
    redirect('/founder/dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <PartnerSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}
