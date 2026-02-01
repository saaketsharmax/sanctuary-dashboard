import { auth } from '@/lib/auth/auth-config'
import { redirect } from 'next/navigation'
import { FounderHeader } from '@/components/founder/layout/founder-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Building2,
  Globe,
  MapPin,
  Users,
  Calendar,
  ExternalLink,
  Briefcase,
  Target,
  Lightbulb,
} from 'lucide-react'
import Link from 'next/link'
import { getStartupWithFounders } from '@/lib/mock-data'
import { getStageInfo } from '@/types'

export default async function FounderCompanyPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/login')
  }

  const startupId = session.user.startupId

  if (!startupId) {
    redirect('/founder/dashboard')
  }

  const startup = getStartupWithFounders(startupId)

  if (!startup) {
    redirect('/founder/dashboard')
  }

  const stageInfo = getStageInfo(startup.stage)

  return (
    <div className="flex flex-col">
      <FounderHeader
        title="Company Profile"
        description="Your startup information and team"
      />

      <div className="flex-1 p-6 space-y-6">
        {/* Company Overview */}
        <Card>
          <CardHeader className="flex flex-row items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
              {startup.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={startup.logoUrl} alt={startup.name} className="h-14 w-14 rounded" />
              ) : (
                <Building2 className="h-8 w-8" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{startup.name}</CardTitle>
                <Badge variant="outline" className="capitalize">
                  {stageInfo.label}
                </Badge>
              </div>
              <CardDescription className="mt-1 text-base">{startup.oneLiner}</CardDescription>
              <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {startup.city}, {startup.country}
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="h-4 w-4" />
                  {startup.industry}
                </div>
                {startup.website && (
                  <Link
                    href={startup.website}
                    target="_blank"
                    className="flex items-center gap-1 hover:text-foreground"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {startup.description && (
              <p className="text-muted-foreground">{startup.description}</p>
            )}
          </CardContent>
        </Card>

        {/* Problem & Solution */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-red-500" />
                <CardTitle className="text-lg">Problem</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {startup.problemStatement || 'No problem statement defined yet.'}
              </p>
              {startup.targetCustomer && (
                <>
                  <Separator className="my-4" />
                  <div>
                    <p className="text-sm font-medium mb-1">Target Customer</p>
                    <p className="text-sm text-muted-foreground">{startup.targetCustomer}</p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                <CardTitle className="text-lg">Solution</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                {startup.solutionDescription || 'No solution description defined yet.'}
              </p>
              <Separator className="my-4" />
              <div>
                <p className="text-sm font-medium mb-1">Business Model</p>
                <Badge variant="secondary">{startup.businessModel}</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Programme Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg">Programme Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-sm font-medium mb-1">Status</p>
                <Badge variant={startup.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                  {startup.status}
                </Badge>
              </div>
              {startup.residencyStart && (
                <div>
                  <p className="text-sm font-medium mb-1">Residency Start</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(startup.residencyStart).toLocaleDateString()}
                  </p>
                </div>
              )}
              {startup.residencyEnd && (
                <div>
                  <p className="text-sm font-medium mb-1">Residency End</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(startup.residencyEnd).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              <CardTitle className="text-lg">Founding Team</CardTitle>
            </div>
            <CardDescription>{startup.founders.length} team members</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {startup.founders.map((founder) => (
                <div
                  key={founder.id}
                  className="flex items-start gap-4 rounded-lg border p-4"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    {founder.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={founder.photoUrl}
                        alt={founder.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-semibold">
                        {founder.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{founder.name}</p>
                      {founder.isLead && (
                        <Badge variant="secondary" className="text-xs">
                          Lead
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{founder.role}</p>
                    <p className="text-sm text-muted-foreground">{founder.email}</p>
                    {founder.linkedin && (
                      <Link
                        href={founder.linkedin}
                        target="_blank"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        LinkedIn Profile
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scores */}
        {startup.overallScore !== null && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Evaluation Scores</CardTitle>
              <CardDescription>Partner assessment scores (read-only)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {startup.founderScore ?? '--'}
                  </div>
                  <p className="text-sm text-muted-foreground">Founder</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">
                    {startup.problemScore ?? '--'}
                  </div>
                  <p className="text-sm text-muted-foreground">Problem</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {startup.userValueScore ?? '--'}
                  </div>
                  <p className="text-sm text-muted-foreground">User Value</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">
                    {startup.executionScore ?? '--'}
                  </div>
                  <p className="text-sm text-muted-foreground">Execution</p>
                </div>
                <div className="text-center border-l">
                  <div className="text-3xl font-bold">{startup.overallScore ?? '--'}</div>
                  <p className="text-sm text-muted-foreground">Overall</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
