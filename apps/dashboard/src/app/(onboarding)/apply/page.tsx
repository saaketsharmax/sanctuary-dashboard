'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2,
  Users,
  Lightbulb,
  TrendingUp,
  Heart,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react'
import { APPLICATION_STAGES } from '@/types'

// Form schema
const founderSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.string().optional(),
  isLead: z.boolean(),
  linkedin: z.string().url().optional().or(z.literal('')),
  yearsExperience: z.number().min(0).optional(),
  hasStartedBefore: z.boolean(),
})

const applicationSchema = z.object({
  // Company basics
  companyName: z.string().min(2, 'Company name is required'),
  companyOneLiner: z.string().min(10, 'Please provide a brief description'),
  companyWebsite: z.string().url().optional().or(z.literal('')),
  companyDescription: z.string().optional(),

  // Founders
  founders: z.array(founderSchema).min(1, 'At least one founder is required'),

  // Problem & Solution
  problemDescription: z.string().min(20, 'Please describe the problem'),
  targetCustomer: z.string().min(10, 'Please describe your target customer'),
  solutionDescription: z.string().min(20, 'Please describe your solution'),

  // Current state
  stage: z.string().min(1, 'Please select your stage'),
  userCount: z.number().min(0).optional(),
  mrr: z.number().min(0).optional(),
  biggestChallenge: z.string().min(10, 'Please describe your biggest challenge'),

  // Why Sanctuary
  whySanctuary: z.string().min(20, 'Please tell us why you want to join'),
  whatTheyWant: z.string().min(20, 'Please tell us what you want from the program'),
})

type ApplicationFormData = z.infer<typeof applicationSchema>

const STEPS = [
  { id: 'company', label: 'Company', icon: Building2 },
  { id: 'founders', label: 'Founders', icon: Users },
  { id: 'problem', label: 'Problem', icon: Lightbulb },
  { id: 'traction', label: 'Traction', icon: TrendingUp },
  { id: 'sanctuary', label: 'Why Us', icon: Heart },
  { id: 'review', label: 'Review', icon: CheckCircle2 },
]

export default function ApplyPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      companyName: '',
      companyOneLiner: '',
      companyWebsite: '',
      companyDescription: '',
      founders: [
        {
          name: '',
          email: '',
          role: 'CEO',
          isLead: true,
          linkedin: '',
          yearsExperience: 0,
          hasStartedBefore: false,
        },
      ],
      problemDescription: '',
      targetCustomer: '',
      solutionDescription: '',
      stage: '',
      userCount: 0,
      mrr: 0,
      biggestChallenge: '',
      whySanctuary: '',
      whatTheyWant: '',
    },
  })

  const { fields: founderFields, append: appendFounder, remove: removeFounder } = useFieldArray({
    control,
    name: 'founders',
  })

  const formData = watch()

  const onSubmit = async (data: ApplicationFormData) => {
    setIsSubmitting(true)
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Generate a mock application ID
    const applicationId = `app-${Date.now()}`

    // In a real app, we'd save to database here
    console.log('Application submitted:', data)

    // Redirect to success page
    router.push(`/apply/success?id=${applicationId}`)
  }

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const goToStep = (index: number) => {
    setCurrentStep(index)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Apply to Sanctuary</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Tell us about your startup. This should take about 15 minutes.
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        {STEPS.map((step, index) => {
          const Icon = step.icon
          const isActive = index === currentStep
          const isCompleted = index < currentStep

          return (
            <button
              key={step.id}
              onClick={() => goToStep(index)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : isCompleted
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{step.label}</span>
            </button>
          )
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep].label}</CardTitle>
            <CardDescription>
              {currentStep === 0 && 'Tell us about your company'}
              {currentStep === 1 && 'Who is building this?'}
              {currentStep === 2 && 'What problem are you solving?'}
              {currentStep === 3 && 'Where are you now?'}
              {currentStep === 4 && 'Why Sanctuary?'}
              {currentStep === 5 && 'Review your application'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Company */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    {...register('companyName')}
                    placeholder="Acme Inc"
                  />
                  {errors.companyName && (
                    <p className="text-xs text-red-600">{errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyOneLiner">One-liner *</Label>
                  <Input
                    id="companyOneLiner"
                    {...register('companyOneLiner')}
                    placeholder="We help X do Y by doing Z"
                  />
                  {errors.companyOneLiner && (
                    <p className="text-xs text-red-600">{errors.companyOneLiner.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Website</Label>
                  <Input
                    id="companyWebsite"
                    {...register('companyWebsite')}
                    placeholder="https://example.com"
                  />
                  {errors.companyWebsite && (
                    <p className="text-xs text-red-600">{errors.companyWebsite.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyDescription">Description</Label>
                  <Textarea
                    id="companyDescription"
                    {...register('companyDescription')}
                    placeholder="Tell us more about what you're building..."
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 2: Founders */}
            {currentStep === 1 && (
              <div className="space-y-6">
                {founderFields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">Founder {index + 1}</h4>
                        {formData.founders[index]?.isLead && (
                          <Badge variant="secondary">Lead</Badge>
                        )}
                      </div>
                      {founderFields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFounder(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Name *</Label>
                        <Input
                          {...register(`founders.${index}.name`)}
                          placeholder="Full name"
                        />
                        {errors.founders?.[index]?.name && (
                          <p className="text-xs text-red-600">
                            {errors.founders[index]?.name?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          {...register(`founders.${index}.email`)}
                          placeholder="email@example.com"
                        />
                        {errors.founders?.[index]?.email && (
                          <p className="text-xs text-red-600">
                            {errors.founders[index]?.email?.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label>Role</Label>
                        <Input
                          {...register(`founders.${index}.role`)}
                          placeholder="CEO, CTO, etc."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>LinkedIn</Label>
                        <Input
                          {...register(`founders.${index}.linkedin`)}
                          placeholder="https://linkedin.com/in/..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Years of Experience</Label>
                        <Input
                          type="number"
                          {...register(`founders.${index}.yearsExperience`, {
                            valueAsNumber: true,
                          })}
                          placeholder="0"
                        />
                      </div>

                      <div className="flex items-center gap-2 pt-6">
                        <Checkbox
                          id={`founder-${index}-started`}
                          checked={formData.founders[index]?.hasStartedBefore}
                          onCheckedChange={(checked) =>
                            setValue(`founders.${index}.hasStartedBefore`, !!checked)
                          }
                        />
                        <Label htmlFor={`founder-${index}-started`} className="text-sm">
                          Has started a company before
                        </Label>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    appendFounder({
                      name: '',
                      email: '',
                      role: '',
                      isLead: false,
                      linkedin: '',
                      yearsExperience: 0,
                      hasStartedBefore: false,
                    })
                  }
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Founder
                </Button>
              </div>
            )}

            {/* Step 3: Problem & Solution */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="problemDescription">What problem are you solving? *</Label>
                  <Textarea
                    id="problemDescription"
                    {...register('problemDescription')}
                    placeholder="Describe the problem in detail. Who has this problem? How painful is it?"
                    rows={4}
                  />
                  {errors.problemDescription && (
                    <p className="text-xs text-red-600">{errors.problemDescription.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetCustomer">Who is your target customer? *</Label>
                  <Textarea
                    id="targetCustomer"
                    {...register('targetCustomer')}
                    placeholder="Be specific. Who exactly are you building for?"
                    rows={3}
                  />
                  {errors.targetCustomer && (
                    <p className="text-xs text-red-600">{errors.targetCustomer.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="solutionDescription">How are you solving it? *</Label>
                  <Textarea
                    id="solutionDescription"
                    {...register('solutionDescription')}
                    placeholder="Describe your solution. What makes it unique?"
                    rows={4}
                  />
                  {errors.solutionDescription && (
                    <p className="text-xs text-red-600">{errors.solutionDescription.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 4: Traction */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>What stage are you at? *</Label>
                  <Select
                    value={formData.stage}
                    onValueChange={(value) => setValue('stage', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {APPLICATION_STAGES.map((stage) => (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userCount">Number of users</Label>
                    <Input
                      id="userCount"
                      type="number"
                      {...register('userCount', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mrr">Monthly Recurring Revenue ($)</Label>
                    <Input
                      id="mrr"
                      type="number"
                      {...register('mrr', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="biggestChallenge">What is your biggest challenge right now? *</Label>
                  <Textarea
                    id="biggestChallenge"
                    {...register('biggestChallenge')}
                    placeholder="What's the #1 thing holding you back?"
                    rows={3}
                  />
                  {errors.biggestChallenge && (
                    <p className="text-xs text-red-600">{errors.biggestChallenge.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Why Sanctuary */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="whySanctuary">Why do you want to join Sanctuary? *</Label>
                  <Textarea
                    id="whySanctuary"
                    {...register('whySanctuary')}
                    placeholder="What drew you to apply? What do you hope to gain?"
                    rows={4}
                  />
                  {errors.whySanctuary && (
                    <p className="text-xs text-red-600">{errors.whySanctuary.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatTheyWant">What specific help do you need? *</Label>
                  <Textarea
                    id="whatTheyWant"
                    {...register('whatTheyWant')}
                    placeholder="What skills, connections, or resources would be most valuable?"
                    rows={4}
                  />
                  {errors.whatTheyWant && (
                    <p className="text-xs text-red-600">{errors.whatTheyWant.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Review */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">Company</h4>
                  <p className="text-lg font-semibold">{formData.companyName || 'Not provided'}</p>
                  <p className="text-sm text-muted-foreground">{formData.companyOneLiner}</p>
                  {formData.companyWebsite && (
                    <p className="text-sm text-primary">{formData.companyWebsite}</p>
                  )}
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">Founders ({formData.founders.length})</h4>
                  <div className="space-y-1">
                    {formData.founders.map((founder, i) => (
                      <p key={i} className="text-sm">
                        {founder.name || 'Unnamed'} - {founder.role || 'No role'}
                        {founder.isLead && ' (Lead)'}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="p-4 border rounded-lg space-y-2">
                  <h4 className="font-medium">Stage</h4>
                  <p className="text-sm">
                    {APPLICATION_STAGES.find((s) => s.value === formData.stage)?.label || 'Not selected'}
                  </p>
                  {((formData.userCount ?? 0) > 0 || (formData.mrr ?? 0) > 0) && (
                    <p className="text-sm text-muted-foreground">
                      {(formData.userCount ?? 0) > 0 && `${formData.userCount} users`}
                      {(formData.userCount ?? 0) > 0 && (formData.mrr ?? 0) > 0 && ' | '}
                      {(formData.mrr ?? 0) > 0 && `$${formData.mrr} MRR`}
                    </p>
                  )}
                </div>

                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
                  <h4 className="font-medium text-primary">Ready to Submit?</h4>
                  <p className="text-sm text-muted-foreground">
                    By submitting, you agree to our interview process. We will review your
                    application and get back to you within 48 hours.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t">
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              {currentStep < STEPS.length - 1 ? (
                <Button type="button" onClick={nextStep}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
