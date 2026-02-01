'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Founder } from '@/types'

const editFounderSchema = z.object({
  // Identity
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email required'),
  role: z.string().min(1, 'Role is required'),
  isLead: z.boolean(),
  photoUrl: z.string().url().optional().or(z.literal('')),

  // Background
  bio: z.string().optional(),
  linkedin: z.string().url().optional().or(z.literal('')),
  twitter: z.string().optional(),
  personalSite: z.string().url().optional().or(z.literal('')),

  // Experience
  yearsExperience: z.number().min(0).max(50).optional(),
  education: z.string().optional(),
  previousExits: z.boolean(),

  // Skills (1-5)
  skillTechnical: z.number().min(1).max(5).optional(),
  skillProduct: z.number().min(1).max(5).optional(),
  skillSales: z.number().min(1).max(5).optional(),
  skillDesign: z.number().min(1).max(5).optional(),
  skillLeadership: z.number().min(1).max(5).optional(),

  // Motivation
  whyThisProblem: z.string().optional(),
  longTermAmbition: z.string().optional(),
})

type EditFounderFormData = z.infer<typeof editFounderSchema>

interface EditFounderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  founder: Founder | null
  isNew?: boolean
  onSuccess?: (data: EditFounderFormData) => void
}

interface SkillSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
}

function SkillSlider({ label, value, onChange }: SkillSliderProps) {
  const labels = ['', 'Basic', 'Developing', 'Proficient', 'Advanced', 'Expert']

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-sm text-muted-foreground">
          {value}/5 — {labels[value]}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={1}
        max={5}
        step={1}
        className="w-full"
      />
    </div>
  )
}

export function EditFounderModal({
  open,
  onOpenChange,
  founder,
  isNew = false,
  onSuccess,
}: EditFounderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: EditFounderFormData = founder
    ? {
        name: founder.name,
        email: founder.email,
        role: founder.role,
        isLead: founder.isLead,
        photoUrl: founder.photoUrl || '',
        bio: founder.bio || '',
        linkedin: founder.linkedin || '',
        twitter: founder.twitter || '',
        personalSite: founder.personalSite || '',
        yearsExperience: founder.yearsExperience || undefined,
        education: founder.education || '',
        previousExits: founder.previousExits,
        skillTechnical: founder.skillTechnical || 3,
        skillProduct: founder.skillProduct || 3,
        skillSales: founder.skillSales || 3,
        skillDesign: founder.skillDesign || 3,
        skillLeadership: founder.skillLeadership || 3,
        whyThisProblem: founder.whyThisProblem || '',
        longTermAmbition: founder.longTermAmbition || '',
      }
    : {
        name: '',
        email: '',
        role: '',
        isLead: false,
        photoUrl: '',
        bio: '',
        linkedin: '',
        twitter: '',
        personalSite: '',
        yearsExperience: undefined,
        education: '',
        previousExits: false,
        skillTechnical: 3,
        skillProduct: 3,
        skillSales: 3,
        skillDesign: 3,
        skillLeadership: 3,
        whyThisProblem: '',
        longTermAmbition: '',
      }

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EditFounderFormData>({
    resolver: zodResolver(editFounderSchema),
    defaultValues,
  })

  const onSubmit = async (data: EditFounderFormData) => {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('Founder data:', data)
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
          <DialogTitle>
            {isNew ? 'Add Founder' : `Edit Founder — ${founder?.name}`}
          </DialogTitle>
          <DialogDescription>
            {isNew
              ? 'Add a new founder to this startup'
              : 'Update founder information'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="identity" className="space-y-4">
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger value="identity">Identity</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
              <TabsTrigger value="motivation">Motivation</TabsTrigger>
            </TabsList>

            {/* Identity Tab */}
            <TabsContent value="identity" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" {...register('name')} />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input id="email" type="email" {...register('email')} />
                  {errors.email && (
                    <p className="text-xs text-destructive">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input id="role" placeholder="e.g., CEO, CTO" {...register('role')} />
                  {errors.role && (
                    <p className="text-xs text-destructive">{errors.role.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="photoUrl">Photo URL</Label>
                  <Input
                    id="photoUrl"
                    type="url"
                    placeholder="https://..."
                    {...register('photoUrl')}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="isLead"
                  checked={watch('isLead')}
                  onCheckedChange={(checked) => setValue('isLead', !!checked)}
                />
                <Label htmlFor="isLead" className="text-sm font-normal">
                  Lead Founder
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  rows={3}
                  placeholder="Short biography..."
                  {...register('bio')}
                />
              </div>
            </TabsContent>

            {/* Background Tab */}
            <TabsContent value="background" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/..."
                    {...register('linkedin')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter Handle</Label>
                  <Input
                    id="twitter"
                    placeholder="username (without @)"
                    {...register('twitter')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalSite">Personal Website</Label>
                <Input
                  id="personalSite"
                  type="url"
                  placeholder="https://..."
                  {...register('personalSite')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="yearsExperience">Years of Experience</Label>
                  <Input
                    id="yearsExperience"
                    type="number"
                    min={0}
                    max={50}
                    {...register('yearsExperience', { valueAsNumber: true })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input
                    id="education"
                    placeholder="e.g., PhD CS, Stanford"
                    {...register('education')}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="previousExits"
                  checked={watch('previousExits')}
                  onCheckedChange={(checked) => setValue('previousExits', !!checked)}
                />
                <Label htmlFor="previousExits" className="text-sm font-normal">
                  Has previous startup exit(s)
                </Label>
              </div>
            </TabsContent>

            {/* Skills Tab */}
            <TabsContent value="skills" className="space-y-6">
              <p className="text-sm text-muted-foreground">
                Rate each skill from 1 (Basic) to 5 (Expert)
              </p>

              <SkillSlider
                label="Technical"
                value={watch('skillTechnical') || 3}
                onChange={(v) => setValue('skillTechnical', v)}
              />

              <SkillSlider
                label="Product"
                value={watch('skillProduct') || 3}
                onChange={(v) => setValue('skillProduct', v)}
              />

              <SkillSlider
                label="Sales"
                value={watch('skillSales') || 3}
                onChange={(v) => setValue('skillSales', v)}
              />

              <SkillSlider
                label="Design"
                value={watch('skillDesign') || 3}
                onChange={(v) => setValue('skillDesign', v)}
              />

              <SkillSlider
                label="Leadership"
                value={watch('skillLeadership') || 3}
                onChange={(v) => setValue('skillLeadership', v)}
              />
            </TabsContent>

            {/* Motivation Tab */}
            <TabsContent value="motivation" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="whyThisProblem">Why This Problem?</Label>
                <Textarea
                  id="whyThisProblem"
                  rows={4}
                  placeholder="What drives this founder to solve this specific problem?"
                  {...register('whyThisProblem')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="longTermAmbition">Long-term Ambition</Label>
                <Textarea
                  id="longTermAmbition"
                  rows={4}
                  placeholder="Where does this founder see the company in 10 years?"
                  {...register('longTermAmbition')}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : isNew ? (
                'Add Founder'
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
