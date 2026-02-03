'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, Plus, Mail, Linkedin } from 'lucide-react'
import { getActiveMentors } from '@/lib/mock-data/mentors'
import Link from 'next/link'

export default function MentorsPage() {
  const [search, setSearch] = useState('')
  const mentors = getActiveMentors()

  const filteredMentors = useMemo(() => {
    if (!search) return mentors
    const lower = search.toLowerCase()
    return mentors.filter(m =>
      m.name.toLowerCase().includes(lower) ||
      m.expertise.some(e => e.toLowerCase().includes(lower)) ||
      m.company.toLowerCase().includes(lower)
    )
  }, [mentors, search])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Mentors</h1>
          <p className="text-muted-foreground mt-1">Mentor database and matching</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Mentor
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, expertise, or company..."
          className="pl-10"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Total Mentors</p>
            <p className="text-2xl font-bold">{mentors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Active</p>
            <p className="text-2xl font-bold">{mentors.filter(m => m.isActive).length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Expertise Areas</p>
            <p className="text-2xl font-bold">14</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Avg Rating</p>
            <p className="text-2xl font-bold">4.8</p>
          </CardContent>
        </Card>
      </div>

      {/* Mentor Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMentors.map((mentor) => (
          <Link key={mentor.id} href={`/partner/mentors/${mentor.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={mentor.photoUrl || undefined} />
                    <AvatarFallback>
                      {mentor.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{mentor.name}</h3>
                    <p className="text-sm text-muted-foreground">{mentor.title}</p>
                    <p className="text-sm text-muted-foreground">{mentor.company}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mt-4">
                  {mentor.expertise.slice(0, 3).map((exp) => (
                    <Badge key={exp} variant="secondary" className="text-xs">
                      {exp}
                    </Badge>
                  ))}
                  {mentor.expertise.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{mentor.expertise.length - 3}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Button variant="ghost" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                  {mentor.linkedinUrl && (
                    <Button variant="ghost" size="sm">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  )}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {mentor.matchCount || 0} matches
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filteredMentors.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No mentors found matching &quot;{search}&quot;
          </CardContent>
        </Card>
      )}
    </div>
  )
}
