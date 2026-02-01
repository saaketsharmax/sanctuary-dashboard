'use client'

import { use, useState } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PartnerHeader } from '@/components/partner/layout/partner-header'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { StartupHeader } from '@/components/startup/startup-header'
import { CompanyDetails } from '@/components/startup/company-details'
import { ScoresDisplay } from '@/components/startup/scores-display'
import { FoundersSection } from '@/components/startup/founders-section'
import { CheckpointsSection } from '@/components/startup/checkpoints-section'
import { EditStartupModal } from '@/components/startup/edit-startup-modal'
import { ScoreInputModal } from '@/components/startup/score-input-modal'
import { CheckpointFormModal } from '@/components/startup/checkpoint-form-modal'
import { EditFounderModal } from '@/components/startup/edit-founder-modal'
import { StartupMetricsPanel } from '@/components/metrics'
import { getStartupWithFounders, getCheckpointsByStartupId, getCohortById } from '@/lib/mock-data'
import type { Founder, Checkpoint, ScoreFormData, CheckpointFormData, FounderFormData } from '@/types'

interface StartupPageProps {
  params: Promise<{ id: string }>
}

export default function PartnerStartupPage({ params }: StartupPageProps) {
  const { id } = use(params)
  const startup = getStartupWithFounders(id)
  const checkpoints = getCheckpointsByStartupId(id)
  const cohort = startup ? getCohortById(startup.cohortId) ?? null : null

  // Modal states
  const [editStartupOpen, setEditStartupOpen] = useState(false)
  const [scoreInputOpen, setScoreInputOpen] = useState(false)
  const [checkpointFormOpen, setCheckpointFormOpen] = useState(false)
  const [editFounderOpen, setEditFounderOpen] = useState(false)
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<Checkpoint | null>(null)
  const [selectedFounder, setSelectedFounder] = useState<Founder | null>(null)
  const [isNewFounder, setIsNewFounder] = useState(false)

  if (!startup) {
    notFound()
  }

  // Handlers
  const handleEditStartup = () => {
    setEditStartupOpen(true)
  }

  const handleEditStartupSuccess = (data: { name: string }) => {
    toast.success('Startup updated', {
      description: `${data.name} has been updated successfully.`,
    })
  }

  const handleUpdateScores = () => {
    setScoreInputOpen(true)
  }

  const handleScoreSuccess = (data: ScoreFormData) => {
    toast.success('Scores updated', {
      description: `Overall score: ${Math.round((data.founderScore + data.problemScore + data.userValueScore + data.executionScore) / 4)}`,
    })
  }

  const handleAddCheckpoint = () => {
    setSelectedCheckpoint(null)
    setCheckpointFormOpen(true)
  }

  const handleEditCheckpoint = (checkpoint: Checkpoint) => {
    setSelectedCheckpoint(checkpoint)
    setCheckpointFormOpen(true)
  }

  const handleCheckpointSuccess = (data: CheckpointFormData) => {
    const action = selectedCheckpoint ? 'updated' : 'added'
    toast.success(`Checkpoint ${action}`, {
      description: `Week ${data.weekNumber} checkpoint has been ${action}.`,
    })
  }

  const handleAddFounder = () => {
    setSelectedFounder(null)
    setIsNewFounder(true)
    setEditFounderOpen(true)
  }

  const handleEditFounder = (founder: Founder) => {
    setSelectedFounder(founder)
    setIsNewFounder(false)
    setEditFounderOpen(true)
  }

  const handleFounderSuccess = (data: FounderFormData) => {
    const action = isNewFounder ? 'added' : 'updated'
    toast.success(`Founder ${action}`, {
      description: `${data.name} has been ${action} successfully.`,
    })
  }

  const existingWeeks = checkpoints.map((c) => c.weekNumber)

  return (
    <div className="flex flex-col h-full">
      <PartnerHeader title={startup.name} description="Startup Details" />

      <div className="flex-1 overflow-auto">
        {/* Back button */}
        <div className="px-6 pt-4">
          <Link href="/partner/portfolio">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Portfolio
            </Button>
          </Link>
        </div>

        {/* Startup Header */}
        <StartupHeader
          startup={startup}
          cohort={cohort}
          onEdit={handleEditStartup}
        />

        {/* Main Content */}
        <div className="px-6 pb-6">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="founders">Founders</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
              <TabsTrigger value="metrics">Metrics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Company Details */}
                <div className="lg:col-span-2 space-y-6">
                  <CompanyDetails startup={startup} />
                </div>

                {/* Right Column - Scores */}
                <div>
                  <ScoresDisplay startup={startup} onUpdateScores={handleUpdateScores} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="founders">
              <FoundersSection
                founders={startup.founders}
                startupName={startup.name}
                onAddFounder={handleAddFounder}
                onEditFounder={handleEditFounder}
              />
            </TabsContent>

            <TabsContent value="progress">
              <CheckpointsSection
                checkpoints={checkpoints}
                startupName={startup.name}
                onAddCheckpoint={handleAddCheckpoint}
                onEditCheckpoint={handleEditCheckpoint}
              />
            </TabsContent>

            <TabsContent value="metrics">
              <StartupMetricsPanel startupId={startup.id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modals */}
      <EditStartupModal
        open={editStartupOpen}
        onOpenChange={setEditStartupOpen}
        startup={startup}
        onSuccess={handleEditStartupSuccess}
      />

      <ScoreInputModal
        open={scoreInputOpen}
        onOpenChange={setScoreInputOpen}
        startup={startup}
        onSuccess={handleScoreSuccess}
      />

      <CheckpointFormModal
        open={checkpointFormOpen}
        onOpenChange={setCheckpointFormOpen}
        startupName={startup.name}
        checkpoint={selectedCheckpoint}
        existingWeeks={existingWeeks}
        onSuccess={handleCheckpointSuccess}
      />

      <EditFounderModal
        open={editFounderOpen}
        onOpenChange={setEditFounderOpen}
        founder={selectedFounder}
        isNew={isNewFounder}
        onSuccess={handleFounderSuccess}
      />
    </div>
  )
}
