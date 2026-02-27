'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Separator,
} from '@sanctuary/ui'
import type { Startup } from '@/types'

interface CompanyDetailsProps {
  startup: Startup
}

export function CompanyDetails({ startup }: CompanyDetailsProps) {
  return (
    <div className="space-y-6">
      {/* Description */}
      {startup.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {startup.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Problem & Solution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Problem & Solution</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {startup.problemStatement && (
            <div>
              <h4 className="text-sm font-medium mb-1">Problem Statement</h4>
              <p className="text-sm text-muted-foreground">{startup.problemStatement}</p>
            </div>
          )}

          {startup.solutionDescription && (
            <div>
              <h4 className="text-sm font-medium mb-1">Solution</h4>
              <p className="text-sm text-muted-foreground">{startup.solutionDescription}</p>
            </div>
          )}

          {startup.targetCustomer && (
            <div>
              <h4 className="text-sm font-medium mb-1">Target Customer</h4>
              <p className="text-sm text-muted-foreground">{startup.targetCustomer}</p>
            </div>
          )}

          {!startup.problemStatement && !startup.solutionDescription && !startup.targetCustomer && (
            <p className="text-sm text-muted-foreground italic">No problem/solution details added yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Company Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company Details</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">Industry</dt>
              <dd className="font-medium">{startup.industry}</dd>
            </div>
            {startup.subIndustry && (
              <div>
                <dt className="text-muted-foreground">Sub-Industry</dt>
                <dd className="font-medium">{startup.subIndustry}</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Business Model</dt>
              <dd className="font-medium">{startup.businessModel}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Location</dt>
              <dd className="font-medium">{startup.city}, {startup.country}</dd>
            </div>
            {startup.residencyStart && (
              <div>
                <dt className="text-muted-foreground">Residency Start</dt>
                <dd className="font-medium">{startup.residencyStart}</dd>
              </div>
            )}
            {startup.residencyEnd && (
              <div>
                <dt className="text-muted-foreground">Residency End</dt>
                <dd className="font-medium">{startup.residencyEnd}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
