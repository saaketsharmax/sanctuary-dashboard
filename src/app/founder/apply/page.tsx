'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FounderHeader } from '@/components/founder/layout/founder-header'
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
  { id: 'company', label: 'COMPANY', icon: 'apartment' },
  { id: 'founders', label: 'FOUNDERS', icon: 'group' },
  { id: 'problem', label: 'PROBLEM', icon: 'lightbulb' },
  { id: 'traction', label: 'TRACTION', icon: 'trending_up' },
  { id: 'sanctuary', label: 'WHY_US', icon: 'favorite' },
  { id: 'review', label: 'REVIEW', icon: 'check_circle' },
]

export default function FounderApplyPage() {
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

    // Redirect to interview
    router.push(`/founder/interview/${applicationId}`)
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
    <div className="flex flex-col h-full bg-[var(--deep-black)]">
      <FounderHeader
        title="APPLICATION_FORM"
        breadcrumb={['Apply']}
        description="Tell us about your startup"
      />

      {/* Progress Steps */}
      <section className="border-b border-[var(--grid-line)] px-10 py-6">
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {STEPS.map((step, index) => {
            const isActive = index === currentStep
            const isCompleted = index < currentStep

            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`flex items-center gap-2 px-4 py-2 text-[10px] font-mono uppercase tracking-widest transition-colors border ${
                  isActive
                    ? 'bg-[var(--olive)] border-[var(--olive)] text-[var(--deep-black)]'
                    : isCompleted
                    ? 'bg-[var(--olive)]/10 border-[var(--olive)] text-[var(--olive)]'
                    : 'bg-transparent border-[var(--grid-line)] text-[var(--cream)]/40 hover:border-[var(--cream)]/40 hover:text-[var(--cream)]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">{step.icon}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Form */}
      <div className="flex-1 overflow-auto p-10">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="border border-[var(--grid-line)]">
              {/* Step Header */}
              <div className="border-b border-[var(--grid-line)] p-6">
                <h2 className="text-xl font-bold font-mono uppercase tracking-tight text-[var(--cream)]">
                  {STEPS[currentStep].label}
                </h2>
                <p className="text-[10px] font-mono uppercase text-[var(--cream)]/60 mt-1">
                  {currentStep === 0 && 'TELL_US_ABOUT_YOUR_COMPANY'}
                  {currentStep === 1 && 'WHO_IS_BUILDING_THIS?'}
                  {currentStep === 2 && 'WHAT_PROBLEM_ARE_YOU_SOLVING?'}
                  {currentStep === 3 && 'WHERE_ARE_YOU_NOW?'}
                  {currentStep === 4 && 'WHY_SANCTUARY?'}
                  {currentStep === 5 && 'REVIEW_YOUR_APPLICATION'}
                </p>
              </div>

              {/* Step Content */}
              <div className="p-6 space-y-6">
                {/* Step 1: Company */}
                {currentStep === 0 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        COMPANY_NAME *
                      </label>
                      <input
                        {...register('companyName')}
                        placeholder="Acme Inc"
                        className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20"
                      />
                      {errors.companyName && (
                        <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">{errors.companyName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        ONE_LINER *
                      </label>
                      <input
                        {...register('companyOneLiner')}
                        placeholder="We help X do Y by doing Z"
                        className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20"
                      />
                      {errors.companyOneLiner && (
                        <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">{errors.companyOneLiner.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        WEBSITE
                      </label>
                      <input
                        {...register('companyWebsite')}
                        placeholder="https://example.com"
                        className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        DESCRIPTION
                      </label>
                      <textarea
                        {...register('companyDescription')}
                        placeholder="Tell us more about what you're building..."
                        rows={4}
                        className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20 resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Founders */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    {founderFields.map((field, index) => (
                      <div key={field.id} className="border border-[var(--grid-line)] p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[var(--olive)] text-[var(--deep-black)]">
                              FOUNDER_{index + 1}
                            </span>
                            {formData.founders[index]?.isLead && (
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 border border-[var(--olive)] text-[var(--olive)]">
                                LEAD
                              </span>
                            )}
                          </div>
                          {founderFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFounder(index)}
                              className="size-8 border border-[var(--grid-line)] flex items-center justify-center text-[var(--warning)] hover:border-[var(--warning)] transition-colors"
                            >
                              <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                              NAME *
                            </label>
                            <input
                              {...register(`founders.${index}.name`)}
                              placeholder="Full name"
                              className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20"
                            />
                            {errors.founders?.[index]?.name && (
                              <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">
                                {errors.founders[index]?.name?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                              EMAIL *
                            </label>
                            <input
                              type="email"
                              {...register(`founders.${index}.email`)}
                              placeholder="email@example.com"
                              className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20"
                            />
                            {errors.founders?.[index]?.email && (
                              <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">
                                {errors.founders[index]?.email?.message}
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                              ROLE
                            </label>
                            <input
                              {...register(`founders.${index}.role`)}
                              placeholder="CEO, CTO, etc."
                              className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                              LINKEDIN
                            </label>
                            <input
                              {...register(`founders.${index}.linkedin`)}
                              placeholder="https://linkedin.com/in/..."
                              className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                              YEARS_EXPERIENCE
                            </label>
                            <input
                              type="number"
                              {...register(`founders.${index}.yearsExperience`, {
                                valueAsNumber: true,
                              })}
                              placeholder="0"
                              className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20"
                            />
                          </div>

                          <div className="flex items-center gap-3 pt-6">
                            <button
                              type="button"
                              onClick={() => setValue(`founders.${index}.hasStartedBefore`, !formData.founders[index]?.hasStartedBefore)}
                              className={`size-5 border flex items-center justify-center transition-colors ${
                                formData.founders[index]?.hasStartedBefore
                                  ? 'border-[var(--olive)] bg-[var(--olive)]'
                                  : 'border-[var(--cream)]/20'
                              }`}
                            >
                              {formData.founders[index]?.hasStartedBefore && (
                                <span className="material-symbols-outlined text-sm text-[var(--deep-black)]">check</span>
                              )}
                            </button>
                            <label className="text-[10px] font-mono uppercase text-[var(--cream)]/60">
                              HAS_STARTED_COMPANY_BEFORE
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      type="button"
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
                      className="w-full border border-dashed border-[var(--grid-line)] py-4 text-[10px] font-mono uppercase tracking-widest text-[var(--cream)]/60 hover:border-[var(--olive)] hover:text-[var(--olive)] transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">add</span>
                      ADD_ANOTHER_FOUNDER
                    </button>
                  </div>
                )}

                {/* Step 3: Problem & Solution */}
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        WHAT_PROBLEM_ARE_YOU_SOLVING? *
                      </label>
                      <textarea
                        {...register('problemDescription')}
                        placeholder="Describe the problem in detail. Who has this problem? How painful is it?"
                        rows={4}
                        className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20 resize-none"
                      />
                      {errors.problemDescription && (
                        <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">{errors.problemDescription.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        TARGET_CUSTOMER *
                      </label>
                      <textarea
                        {...register('targetCustomer')}
                        placeholder="Be specific. Who exactly are you building for?"
                        rows={3}
                        className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20 resize-none"
                      />
                      {errors.targetCustomer && (
                        <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">{errors.targetCustomer.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        HOW_ARE_YOU_SOLVING_IT? *
                      </label>
                      <textarea
                        {...register('solutionDescription')}
                        placeholder="Describe your solution. What makes it unique?"
                        rows={4}
                        className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20 resize-none"
                      />
                      {errors.solutionDescription && (
                        <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">{errors.solutionDescription.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 4: Traction */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        CURRENT_STAGE *
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {APPLICATION_STAGES.map((stage) => (
                          <button
                            key={stage.value}
                            type="button"
                            onClick={() => setValue('stage', stage.value)}
                            className={`px-4 py-3 text-[10px] font-mono uppercase transition-colors border ${
                              formData.stage === stage.value
                                ? 'bg-[var(--olive)] border-[var(--olive)] text-[var(--deep-black)]'
                                : 'bg-transparent border-[var(--grid-line)] text-[var(--cream)]/60 hover:border-[var(--cream)]/40'
                            }`}
                          >
                            {stage.label}
                          </button>
                        ))}
                      </div>
                      {errors.stage && (
                        <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">{errors.stage.message}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                          NUMBER_OF_USERS
                        </label>
                        <input
                          type="number"
                          {...register('userCount', { valueAsNumber: true })}
                          placeholder="0"
                          className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                          MRR_($)
                        </label>
                        <input
                          type="number"
                          {...register('mrr', { valueAsNumber: true })}
                          placeholder="0"
                          className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        BIGGEST_CHALLENGE *
                      </label>
                      <textarea
                        {...register('biggestChallenge')}
                        placeholder="What's the #1 thing holding you back?"
                        rows={3}
                        className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20 resize-none"
                      />
                      {errors.biggestChallenge && (
                        <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">{errors.biggestChallenge.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 5: Why Sanctuary */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        WHY_DO_YOU_WANT_TO_JOIN_SANCTUARY? *
                      </label>
                      <textarea
                        {...register('whySanctuary')}
                        placeholder="What drew you to apply? What do you hope to gain?"
                        rows={4}
                        className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20 resize-none"
                      />
                      {errors.whySanctuary && (
                        <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">{errors.whySanctuary.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2 block">
                        WHAT_SPECIFIC_HELP_DO_YOU_NEED? *
                      </label>
                      <textarea
                        {...register('whatTheyWant')}
                        placeholder="What skills, connections, or resources would be most valuable?"
                        rows={4}
                        className="w-full bg-transparent border border-[var(--grid-line)] px-4 py-3 text-[var(--cream)] font-mono text-sm focus:border-[var(--olive)] focus:outline-none transition-colors placeholder:text-[var(--cream)]/20 resize-none"
                      />
                      {errors.whatTheyWant && (
                        <p className="text-[10px] text-[var(--warning)] mt-1 font-mono">{errors.whatTheyWant.message}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Step 6: Review */}
                {currentStep === 5 && (
                  <div className="space-y-6">
                    <div className="border border-[var(--grid-line)] p-4">
                      <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">COMPANY</p>
                      <p className="text-lg font-bold font-mono text-[var(--cream)]">{formData.companyName || 'NOT_PROVIDED'}</p>
                      <p className="text-sm text-[var(--cream)]/60 mt-1">{formData.companyOneLiner}</p>
                      {formData.companyWebsite && (
                        <p className="text-sm text-[var(--olive)] mt-1">{formData.companyWebsite}</p>
                      )}
                    </div>

                    <div className="border border-[var(--grid-line)] p-4">
                      <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">
                        FOUNDERS ({formData.founders.length})
                      </p>
                      <div className="space-y-1">
                        {formData.founders.map((founder, i) => (
                          <p key={i} className="text-sm text-[var(--cream)]/80 font-mono">
                            {founder.name || 'UNNAMED'} — {founder.role || 'NO_ROLE'}
                            {founder.isLead && ' (LEAD)'}
                          </p>
                        ))}
                      </div>
                    </div>

                    <div className="border border-[var(--grid-line)] p-4">
                      <p className="text-[10px] font-mono uppercase text-[var(--olive)] mb-2">STAGE</p>
                      <p className="text-sm text-[var(--cream)]/80 font-mono">
                        {APPLICATION_STAGES.find((s) => s.value === formData.stage)?.label || 'NOT_SELECTED'}
                      </p>
                      {((formData.userCount ?? 0) > 0 || (formData.mrr ?? 0) > 0) && (
                        <p className="text-sm text-[var(--cream)]/60 mt-1 font-mono">
                          {(formData.userCount ?? 0) > 0 && `${formData.userCount} USERS`}
                          {(formData.userCount ?? 0) > 0 && (formData.mrr ?? 0) > 0 && ' | '}
                          {(formData.mrr ?? 0) > 0 && `$${formData.mrr} MRR`}
                        </p>
                      )}
                    </div>

                    <div className="border border-[var(--olive)]/30 bg-[var(--olive)]/5 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-[var(--olive)]">smart_toy</span>
                        <p className="font-bold font-mono uppercase text-[var(--olive)]">NEXT: AI_INTERVIEW</p>
                      </div>
                      <p className="text-sm text-[var(--cream)]/60">
                        After submitting, you will proceed to a short AI-powered interview to help us
                        understand your startup better. This takes about 45 minutes.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation */}
              <div className="border-t border-[var(--grid-line)] p-6 flex items-center justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className={`px-6 py-3 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 transition-colors ${
                    currentStep === 0
                      ? 'text-[var(--cream)]/20 cursor-not-allowed'
                      : 'text-[var(--cream)]/60 hover:text-[var(--cream)] border border-[var(--grid-line)] hover:border-[var(--cream)]/40'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  BACK
                </button>

                {currentStep < STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-[var(--olive)] text-[var(--deep-black)] px-6 py-3 text-[10px] font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors flex items-center gap-2"
                  >
                    NEXT
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-[var(--olive)] text-[var(--deep-black)] px-6 py-3 text-[10px] font-bold tracking-widest font-mono uppercase hover:bg-[var(--cream)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? 'SUBMITTING...' : 'SUBMIT_&_START_INTERVIEW'}
                    <span className="material-symbols-outlined text-sm">send</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
