'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Progress,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Separator,
} from '@sanctuary/ui'
import { useState } from 'react'
import {
  User,
  Mail,
  Linkedin,
  Twitter,
  Globe,
  Briefcase,
  GraduationCap,
  Star,
  Plus,
} from 'lucide-react'
import type { Founder } from '@/types'

interface FoundersSectionProps {
  founders: Founder[]
  startupName: string
  onAddFounder?: () => void
  onEditFounder?: (founder: Founder) => void
}

interface FounderCardProps {
  founder: Founder
  onClick: () => void
}

function SkillBar({ label, value }: { label: string; value: number | null }) {
  if (value === null) return null

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}/5</span>
      </div>
      <Progress value={(value / 5) * 100} className="h-1.5" />
    </div>
  )
}

function FounderCard({ founder, onClick }: FounderCardProps) {
  const initials = founder.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const hasSkills =
    founder.skillTechnical ||
    founder.skillProduct ||
    founder.skillSales ||
    founder.skillDesign ||
    founder.skillLeadership

  return (
    <Card
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar className="h-14 w-14">
            <AvatarImage src={founder.photoUrl || undefined} />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{founder.name}</h3>
              {founder.isLead && (
                <Badge variant="secondary" className="text-xs">
                  Lead
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{founder.role}</p>

            {founder.bio && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {founder.bio}
              </p>
            )}

            {/* Quick Links */}
            <div className="flex items-center gap-2 mt-3">
              {founder.email && (
                <a
                  href={`mailto:${founder.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Mail className="h-4 w-4" />
                </a>
              )}
              {founder.linkedin && (
                <a
                  href={founder.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}
              {founder.twitter && (
                <a
                  href={`https://twitter.com/${founder.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
              {founder.personalSite && (
                <a
                  href={founder.personalSite}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Globe className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Skills Preview */}
        {hasSkills && (
          <div className="mt-4 pt-4 border-t grid grid-cols-5 gap-2">
            {founder.skillTechnical && (
              <div className="text-center">
                <div className="text-lg font-bold">{founder.skillTechnical}</div>
                <div className="text-[10px] text-muted-foreground">Tech</div>
              </div>
            )}
            {founder.skillProduct && (
              <div className="text-center">
                <div className="text-lg font-bold">{founder.skillProduct}</div>
                <div className="text-[10px] text-muted-foreground">Product</div>
              </div>
            )}
            {founder.skillSales && (
              <div className="text-center">
                <div className="text-lg font-bold">{founder.skillSales}</div>
                <div className="text-[10px] text-muted-foreground">Sales</div>
              </div>
            )}
            {founder.skillDesign && (
              <div className="text-center">
                <div className="text-lg font-bold">{founder.skillDesign}</div>
                <div className="text-[10px] text-muted-foreground">Design</div>
              </div>
            )}
            {founder.skillLeadership && (
              <div className="text-center">
                <div className="text-lg font-bold">{founder.skillLeadership}</div>
                <div className="text-[10px] text-muted-foreground">Lead</div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FounderDetailDialog({
  founder,
  open,
  onOpenChange,
}: {
  founder: Founder | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!founder) return null

  const initials = founder.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={founder.photoUrl || undefined} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="flex items-center gap-2">
                {founder.name}
                {founder.isLead && (
                  <Badge variant="secondary">Lead Founder</Badge>
                )}
              </DialogTitle>
              <DialogDescription>{founder.role}</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Contact & Links */}
          <div className="flex flex-wrap gap-2">
            {founder.email && (
              <a href={`mailto:${founder.email}`}>
                <Button variant="outline" size="sm" className="gap-2">
                  <Mail className="h-4 w-4" />
                  {founder.email}
                </Button>
              </a>
            )}
            {founder.linkedin && (
              <a href={founder.linkedin} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="gap-2">
                  <Linkedin className="h-4 w-4" />
                  LinkedIn
                </Button>
              </a>
            )}
            {founder.twitter && (
              <a
                href={`https://twitter.com/${founder.twitter}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  <Twitter className="h-4 w-4" />
                  @{founder.twitter}
                </Button>
              </a>
            )}
          </div>

          {/* Bio */}
          {founder.bio && (
            <div>
              <h4 className="text-sm font-medium mb-2">Bio</h4>
              <p className="text-sm text-muted-foreground">{founder.bio}</p>
            </div>
          )}

          {/* Experience */}
          <div>
            <h4 className="text-sm font-medium mb-3">Background</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {founder.yearsExperience && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <span>{founder.yearsExperience} years experience</span>
                </div>
              )}
              {founder.education && (
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{founder.education}</span>
                </div>
              )}
              {founder.previousExits && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-warning" />
                  <span>Previous exit</span>
                </div>
              )}
            </div>

            {founder.previousCompanies.length > 0 && (
              <div className="mt-3">
                <span className="text-sm text-muted-foreground">Previous companies: </span>
                <span className="text-sm">{founder.previousCompanies.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Skills */}
          <div>
            <h4 className="text-sm font-medium mb-3">Skills</h4>
            <div className="grid grid-cols-2 gap-4">
              <SkillBar label="Technical" value={founder.skillTechnical} />
              <SkillBar label="Product" value={founder.skillProduct} />
              <SkillBar label="Sales" value={founder.skillSales} />
              <SkillBar label="Design" value={founder.skillDesign} />
              <SkillBar label="Leadership" value={founder.skillLeadership} />
            </div>
          </div>

          {/* Motivation */}
          {founder.whyThisProblem && (
            <div>
              <h4 className="text-sm font-medium mb-2">Why This Problem?</h4>
              <p className="text-sm text-muted-foreground">{founder.whyThisProblem}</p>
            </div>
          )}

          {founder.longTermAmbition && (
            <div>
              <h4 className="text-sm font-medium mb-2">Long-term Ambition</h4>
              <p className="text-sm text-muted-foreground">{founder.longTermAmbition}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function FoundersSection({ founders, startupName, onAddFounder, onEditFounder }: FoundersSectionProps) {
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null)

  const handleFounderClick = (founder: Founder) => {
    if (onEditFounder) {
      onEditFounder(founder)
    } else {
      setSelectedFounder(founder)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">
          Founders ({founders.length})
        </h2>
        <Button variant="outline" size="sm" className="gap-2" onClick={onAddFounder}>
          <Plus className="h-4 w-4" />
          Add Founder
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {founders.map((founder) => (
          <FounderCard
            key={founder.id}
            founder={founder}
            onClick={() => handleFounderClick(founder)}
          />
        ))}
      </div>

      {founders.length === 0 && (
        <Card>
          <CardContent className="py-8 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No founders added yet</p>
            <Button variant="outline" className="mt-4">
              Add First Founder
            </Button>
          </CardContent>
        </Card>
      )}

      <FounderDetailDialog
        founder={selectedFounder}
        open={!!selectedFounder}
        onOpenChange={(open) => !open && setSelectedFounder(null)}
      />
    </div>
  )
}
