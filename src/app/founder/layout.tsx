import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth/auth-config'
import { FounderSidebar } from '@/components/founder/layout/founder-sidebar'

export default async function FounderLayout({
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

  // Redirect partners to their dashboard
  if (session.user.userType !== 'founder') {
    redirect('/partner/dashboard')
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <FounderSidebar />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  )
}
