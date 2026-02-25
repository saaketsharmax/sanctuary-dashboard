'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@sanctuary/ui'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { STAGES, INDUSTRIES, BUSINESS_MODELS, STARTUP_STATUSES } from '@/types'
import type { Startup } from '@/types'

// Empty until cohorts are fetched from database
const cohorts: { id: string; name: string }[] = []

const editStartupSchema = z.object({
  // Basic Info
  name: z.string().min(2, 'Name must be at least 2 characters'),
  oneLiner: z.string().min(10, 'One-liner must be at least 10 characters'),
  description: z.string().optional(),

  // Classification
  cohortId: z.string().min(1, 'Please select a cohort'),
  industry: z.string().min(1, 'Please select an industry'),
  subIndustry: z.string().optional(),
  businessModel: z.string().min(1, 'Please select a business model'),
  stage: z.string().min(1, 'Please select a stage'),
  status: z.string().min(1, 'Please select a status'),

  // Location
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  timezone: z.string().optional(),

  // Links
  website: z.string().url().optional().or(z.literal('')),
  demoUrl: z.string().url().optional().or(z.literal('')),
  pitchDeckUrl: z.string().url().optional().or(z.literal('')),

  // Product
  problemStatement: z.string().optional(),
  solutionDescription: z.string().optional(),
  targetCustomer: z.string().optional(),

  // Dates
  residencyStart: z.string().optional(),
  residencyEnd: z.string().optional(),
})

type EditStartupFormData = z.infer<typeof editStartupSchema>

interface EditStartupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  startup: Startup
  onSuccess?: (data: EditStartupFormData) => void
}

export function EditStartupModal({
  open,
  onOpenChange,
  startup,
  onSuccess,
}: EditStartupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<EditStartupFormData>({
    resolver: zodResolver(editStartupSchema),
    defaultValues: {
      name: startup.name,
      oneLiner: startup.oneLiner,
      description: startup.description || '',
      cohortId: startup.cohortId,
      industry: startup.industry,
      subIndustry: startup.subIndustry || '',
      businessModel: startup.businessModel,
      stage: startup.stage,
      status: startup.status,
      city: startup.city,
      country: startup.country,
      timezone: startup.timezone || '',
      website: startup.website || '',
      demoUrl: startup.demoUrl || '',
      pitchDeckUrl: startup.pitchDeckUrl || '',
      problemStatement: startup.problemStatement || '',
      solutionDescription: startup.solutionDescription || '',
      targetCustomer: startup.targetCustomer || '',
      residencyStart: startup.residencyStart || '',
      residencyEnd: startup.residencyEnd || '',
    },
  })

  const onSubmit = async (data: EditStartupFormData) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('Updated startup:', data)
    onSuccess?.(data)
    onOpenChange(false)
    setIsSubmitting(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Startup — {startup.name}</DialogTitle>
          <DialogDescription>
            Update startup information. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="basic" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="basic">Basic</TabsTrigger>
              <TabsTrigger value="classification">Classification</TabsTrigger>
              <TabsTrigger value="product">Product</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
            </TabsList>

            {/* Basic Info Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name *</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Status *</Label>
                  <Select
                    value={watch('status')}
                    onValueChange={(value) => setValue('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STARTUP_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="oneLiner">One-liner *</Label>
                <Input id="oneLiner" {...register('oneLiner')} />
                {errors.oneLiner && (
                  <p className="text-xs text-destructive">{errors.oneLiner.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} {...register('description')} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" {...register('city')} />
                  {errors.city && (
                    <p className="text-xs text-destructive">{errors.city.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Input id="country" {...register('country')} />
                  {errors.country && (
                    <p className="text-xs text-destructive">{errors.country.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" placeholder="e.g., America/New_York" {...register('timezone')} />
                </div>
              </div>
            </TabsContent>

            {/* Classification Tab */}
            <TabsContent value="classification" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cohort *</Label>
                  <Select
                    value={watch('cohortId')}
                    onValueChange={(value) => setValue('cohortId', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cohorts.map((cohort) => (
                        <SelectItem key={cohort.id} value={cohort.id}>
                          {cohort.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Stage *</Label>
                  <Select
                    value={watch('stage')}
                    onValueChange={(value) => setValue('stage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STAGES.map((stage) => (
                        <SelectItem key={stage.value} value={stage.value}>
                          {stage.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Industry *</Label>
                  <Select
                    value={watch('industry')}
                    onValueChange={(value) => setValue('industry', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subIndustry">Sub-Industry</Label>
                  <Input id="subIndustry" placeholder="e.g., MLOps" {...register('subIndustry')} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Business Model *</Label>
                <Select
                  value={watch('businessModel')}
                  onValueChange={(value) => setValue('businessModel', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="residencyStart">Residency Start</Label>
                  <Input id="residencyStart" type="date" {...register('residencyStart')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="residencyEnd">Residency End</Label>
                  <Input id="residencyEnd" type="date" {...register('residencyEnd')} />
                </div>
              </div>
            </TabsContent>

            {/* Product Tab */}
            <TabsContent value="product" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="problemStatement">Problem Statement</Label>
                <Textarea
                  id="problemStatement"
                  rows={3}
                  placeholder="What problem does this startup solve?"
                  {...register('problemStatement')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="solutionDescription">Solution Description</Label>
                <Textarea
                  id="solutionDescription"
                  rows={3}
                  placeholder="How does the solution work?"
                  {...register('solutionDescription')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetCustomer">Target Customer</Label>
                <Textarea
                  id="targetCustomer"
                  rows={2}
                  placeholder="Who is the ideal customer?"
                  {...register('targetCustomer')}
                />
              </div>
            </TabsContent>

            {/* Links Tab */}
            <TabsContent value="links" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://example.com"
                  {...register('website')}
                />
                {errors.website && (
                  <p className="text-xs text-destructive">{errors.website.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="demoUrl">Demo URL</Label>
                <Input
                  id="demoUrl"
                  type="url"
                  placeholder="https://demo.example.com"
                  {...register('demoUrl')}
                />
                {errors.demoUrl && (
                  <p className="text-xs text-destructive">{errors.demoUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pitchDeckUrl">Pitch Deck URL</Label>
                <Input
                  id="pitchDeckUrl"
                  type="url"
                  placeholder="https://docs.google.com/..."
                  {...register('pitchDeckUrl')}
                />
                {errors.pitchDeckUrl && (
                  <p className="text-xs text-destructive">{errors.pitchDeckUrl.message}</p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
