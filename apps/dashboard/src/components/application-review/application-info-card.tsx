'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, Target, Lightbulb, AlertTriangle, Heart, HelpCircle } from 'lucide-react'
import type { Application } from '@/types'

interface ApplicationInfoCardProps {
  application: Application
}

interface InfoSectionProps {
  icon: React.ReactNode
  title: string
  content: string | null
}

function InfoSection({ icon, title, content }: InfoSectionProps) {
  if (!content) return null

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm font-medium">
        <div className="text-muted-foreground">{icon}</div>
        {title}
      </div>
      <p className="text-sm text-muted-foreground pl-6">{content}</p>
    </div>
  )
}

export function ApplicationInfoCard({ application }: ApplicationInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Application Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <InfoSection
          icon={<Building2 className="h-4 w-4" />}
          title="Company Description"
          content={application.companyDescription}
        />

        <InfoSection
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Problem"
          content={application.problemDescription}
        />

        <InfoSection
          icon={<Target className="h-4 w-4" />}
          title="Target Customer"
          content={application.targetCustomer}
        />

        <InfoSection
          icon={<Lightbulb className="h-4 w-4" />}
          title="Solution"
          content={application.solutionDescription}
        />

        <InfoSection
          icon={<HelpCircle className="h-4 w-4" />}
          title="Biggest Challenge"
          content={application.biggestChallenge}
        />

        <div className="pt-4 border-t space-y-6">
          <InfoSection
            icon={<Heart className="h-4 w-4" />}
            title="Why Sanctuary"
            content={application.whySanctuary}
          />

          <InfoSection
            icon={<Target className="h-4 w-4" />}
            title="What They Want"
            content={application.whatTheyWant}
          />
        </div>

        {application.companyWebsite && (
          <div className="pt-4 border-t">
            <a
              href={application.companyWebsite}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              {application.companyWebsite}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
