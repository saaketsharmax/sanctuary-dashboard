'use client'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import { STAGES, INDUSTRIES, BUSINESS_MODELS } from '@/types'

// Empty until cohorts are fetched from database
const cohorts: { id: string; name: string }[] = []

const addStartupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  oneLiner: z.string().min(10, 'One-liner must be at least 10 characters'),
  description: z.string().optional(),
  cohortId: z.string().min(1, 'Please select a cohort'),
  industry: z.string().min(1, 'Please select an industry'),
  businessModel: z.string().min(1, 'Please select a business model'),
  stage: z.string().min(1, 'Please select a stage'),
  city: z.string().min(2, 'City is required'),
  country: z.string().min(2, 'Country is required'),
  website: z.string().url().optional().or(z.literal('')),
  problemStatement: z.string().optional(),
  targetCustomer: z.string().optional(),
})

type AddStartupFormData = z.infer<typeof addStartupSchema>

interface AddStartupModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: (startup: AddStartupFormData) => void
}

export function AddStartupModal({ open, onOpenChange, onSuccess }: AddStartupModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<AddStartupFormData>({
    resolver: zodResolver(addStartupSchema),
    defaultValues: {
      name: '',
      oneLiner: '',
      description: '',
      cohortId: '',
      industry: '',
      businessModel: '',
      stage: 'problem_discovery',
      city: '',
      country: '',
      website: '',
      problemStatement: '',
      targetCustomer: '',
    },
  })

  const onSubmit = async (data: AddStartupFormData) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('New startup:', data)
    onSuccess?.(data)
    reset()
    onOpenChange(false)
    setIsSubmitting(false)
  }

  const handleClose = () => {
    reset()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Startup</DialogTitle>
          <DialogDescription>
            Add a new startup to your portfolio. You can edit details later.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Basic Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., TechFlow AI"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-red-600">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cohortId">Cohort *</Label>
                <Select
                  value={watch('cohortId')}
                  onValueChange={(value) => setValue('cohortId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select cohort" />
                  </SelectTrigger>
                  <SelectContent>
                    {cohorts.map((cohort) => (
                      <SelectItem key={cohort.id} value={cohort.id}>
                        {cohort.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.cohortId && (
                  <p className="text-xs text-red-600">{errors.cohortId.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="oneLiner">One-liner *</Label>
              <Input
                id="oneLiner"
                placeholder="e.g., MLOps platform for enterprise AI teams"
                {...register('oneLiner')}
              />
              {errors.oneLiner && (
                <p className="text-xs text-red-600">{errors.oneLiner.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Detailed description of the company..."
                rows={3}
                {...register('description')}
              />
            </div>
          </div>

          {/* Classification */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Classification</h3>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Industry *</Label>
                <Select
                  value={watch('industry')}
                  onValueChange={(value) => setValue('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.industry && (
                  <p className="text-xs text-red-600">{errors.industry.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Business Model *</Label>
                <Select
                  value={watch('businessModel')}
                  onValueChange={(value) => setValue('businessModel', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_MODELS.map((model) => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.businessModel && (
                  <p className="text-xs text-red-600">{errors.businessModel.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Stage *</Label>
                <Select
                  value={watch('stage')}
                  onValueChange={(value) => setValue('stage', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    {STAGES.map((stage) => (
                      <SelectItem key={stage.value} value={stage.value}>
                        {stage.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.stage && (
                  <p className="text-xs text-red-600">{errors.stage.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Location</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="e.g., San Francisco"
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-xs text-red-600">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Input
                  id="country"
                  placeholder="e.g., USA"
                  {...register('country')}
                />
                {errors.country && (
                  <p className="text-xs text-red-600">{errors.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Additional Information</h3>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://example.com"
                {...register('website')}
              />
              {errors.website && (
                <p className="text-xs text-red-600">{errors.website.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="problemStatement">Problem Statement</Label>
              <Textarea
                id="problemStatement"
                placeholder="What problem does this startup solve?"
                rows={2}
                {...register('problemStatement')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetCustomer">Target Customer</Label>
              <Input
                id="targetCustomer"
                placeholder="e.g., ML teams at enterprises with 50+ engineers"
                {...register('targetCustomer')}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Startup'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
