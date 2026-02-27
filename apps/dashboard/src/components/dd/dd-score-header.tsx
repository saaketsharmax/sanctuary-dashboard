'use client'
import {
  Card,
  CardContent,
  Badge,
  Progress,
} from '@sanctuary/ui'

interface DDScoreHeaderProps {
  grade: string
  overallScore: number
  verificationCoverage: number
  totalClaims: number
  confirmedClaims: number
  refutedClaims: number
  redFlagCount: number
}

const gradeColors: Record<string, string> = {
  A: 'bg-success text-white',
  B: 'bg-info text-white',
  C: 'bg-warning text-white',
  D: 'bg-warning text-white',
  F: 'bg-destructive text-white',
}

export function DDScoreHeader({
  grade,
  overallScore,
  verificationCoverage,
  totalClaims,
  confirmedClaims,
  refutedClaims,
  redFlagCount,
}: DDScoreHeaderProps) {
  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex items-center gap-8">
          {/* Grade Badge */}
          <div className="flex flex-col items-center">
            <div
              className={`w-20 h-20 rounded-2xl flex items-center justify-center text-4xl font-bold ${
                gradeColors[grade] || gradeColors['F']
              }`}
            >
              {grade}
            </div>
            <p className="text-sm text-muted-foreground mt-2">DD Grade</p>
          </div>

          {/* Score + Coverage */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold">{overallScore}</p>
                <p className="text-sm text-muted-foreground">Overall DD Score</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-semibold">{Math.round(verificationCoverage * 100)}%</p>
                <p className="text-sm text-muted-foreground">Verification Coverage</p>
              </div>
            </div>
            <Progress value={overallScore} className="h-2" />
          </div>

          {/* Key Metrics */}
          <div className="flex gap-6">
            <div className="text-center">
              <p className="text-2xl font-semibold">{totalClaims}</p>
              <p className="text-xs text-muted-foreground">Total Claims</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-success">{confirmedClaims}</p>
              <p className="text-xs text-muted-foreground">Confirmed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-destructive">{refutedClaims}</p>
              <p className="text-xs text-muted-foreground">Refuted</p>
            </div>
            {redFlagCount > 0 && (
              <div className="text-center">
                <Badge variant="destructive" className="text-lg px-3 py-1">
                  {redFlagCount}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Red Flags</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
