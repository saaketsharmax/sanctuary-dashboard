'use client'

import { useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, Trash2, Link as LinkIcon } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { Checkpoint, CheckpointStatus } from '@/types'
import { CHECKPOINT_STATUSES } from '@/types'

const checkpointSchema = z.object({
  weekNumber: z.number().min(1).max(20),
  goal: z.string().min(1, 'Goal is required'),
  checkpointQuestion: z.string().optional(),
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string().min(1, 'Task title is required'),
      completed: z.boolean(),
    })
  ),
  founderNotes: z.string().optional(),
  partnerNotes: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'completed', 'blocked']),
  evidenceUrls: z.array(z.string().url().or(z.literal(''))),
})

type CheckpointFormData = z.infer<typeof checkpointSchema>

interface CheckpointFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  startupName: string
  checkpoint?: Checkpoint | null
  existingWeeks?: number[]
  onSuccess?: (data: CheckpointFormData) => void
}

const weekGoals: Record<number, { goal: string; question: string }> = {
  1: { goal: 'Define and validate core problem', question: 'Is this problem worth solving?' },
  2: { goal: 'Conduct 10+ user interviews', question: 'Who has this problem most acutely?' },
  3: { goal: 'Map the competitive landscape', question: 'Why will you win?' },
  4: { goal: 'Define MVP scope', question: 'What is the smallest valuable thing to build?' },
  5: { goal: 'Build MVP v1', question: 'Can you ship something this week?' },
  6: { goal: 'Get MVP in user hands', question: 'Is something usable in hands of users?' },
  7: { goal: 'Collect initial feedback', question: 'What do users love/hate?' },
  8: { goal: 'Iterate based on feedback', question: 'What must change before scaling?' },
  9: { goal: 'Measure retention', question: 'Do users come back?' },
  10: { goal: 'Test willingness to pay', question: 'Will users pay for this?' },
  11: { goal: 'Improve activation rate', question: 'What blocks users from getting value?' },
  12: { goal: 'Establish baseline metrics', question: 'What numbers matter most?' },
  13: { goal: 'Identify growth channels', question: 'Where do your best users come from?' },
  14: { goal: 'Run growth experiments', question: 'What scales and what doesn\'t?' },
  15: { goal: 'Optimize unit economics', question: 'Is each customer profitable?' },
  16: { goal: 'Build growth model', question: 'How do you 10x from here?' },
  17: { goal: 'Prepare pitch materials', question: 'Is your story compelling?' },
  18: { goal: 'Practice with mentors', question: 'What questions can\'t you answer?' },
  19: { goal: 'Finalize data room', question: 'Are you investor-ready?' },
  20: { goal: 'IC presentation', question: 'Should Sanctuary invest?' },
}

export function CheckpointFormModal({
  open,
  onOpenChange,
  startupName,
  checkpoint,
  existingWeeks = [],
  onSuccess,
}: CheckpointFormModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditing = !!checkpoint

  const {
    register,
    control,
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CheckpointFormData>({
    resolver: zodResolver(checkpointSchema),
    defaultValues: checkpoint
      ? {
          weekNumber: checkpoint.weekNumber,
          goal: checkpoint.goal || '',
          checkpointQuestion: checkpoint.checkpointQuestion || '',
          tasks: checkpoint.tasks,
          founderNotes: checkpoint.founderNotes || '',
          partnerNotes: checkpoint.partnerNotes || '',
          status: checkpoint.status,
          evidenceUrls: checkpoint.evidenceUrls.length > 0 ? checkpoint.evidenceUrls : [''],
        }
      : {
          weekNumber: 1,
          goal: '',
          checkpointQuestion: '',
          tasks: [{ id: crypto.randomUUID(), title: '', completed: false }],
          founderNotes: '',
          partnerNotes: '',
          status: 'pending' as CheckpointStatus,
          evidenceUrls: [''],
        },
  })

  const { fields: taskFields, append: appendTask, remove: removeTask } = useFieldArray({
    control,
    name: 'tasks',
  })

  const { fields: urlFields, append: appendUrl, remove: removeUrl } = useFieldArray({
    control,
    name: 'evidenceUrls' as any,
  })

  const watchedWeek = watch('weekNumber')

  const handleWeekChange = (week: number) => {
    setValue('weekNumber', week)
    if (!isEditing && weekGoals[week]) {
      setValue('goal', weekGoals[week].goal)
      setValue('checkpointQuestion', weekGoals[week].question)
    }
  }

  const availableWeeks = Array.from({ length: 20 }, (_, i) => i + 1).filter(
    (week) => !existingWeeks.includes(week) || (isEditing && week === checkpoint?.weekNumber)
  )

  const onSubmit = async (data: CheckpointFormData) => {
    setIsSubmitting(true)

    // Filter out empty tasks and URLs
    const cleanedData = {
      ...data,
      tasks: data.tasks.filter((t) => t.title.trim() !== ''),
      evidenceUrls: data.evidenceUrls.filter((url) => url.trim() !== ''),
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    console.log('Checkpoint data:', cleanedData)
    onSuccess?.(cleanedData)
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
            {isEditing ? `Edit Week ${checkpoint.weekNumber} Checkpoint` : 'Add Checkpoint'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? `Update checkpoint for ${startupName}`
              : `Add a new weekly checkpoint for ${startupName}`}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Week & Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Week Number *</Label>
              <Select
                value={String(watchedWeek)}
                onValueChange={(v) => handleWeekChange(parseInt(v))}
                disabled={isEditing}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select week" />
                </SelectTrigger>
                <SelectContent>
                  {availableWeeks.map((week) => (
                    <SelectItem key={week} value={String(week)}>
                      Week {week}
                      {weekGoals[week] && (
                        <span className="text-muted-foreground ml-2">
                          — {weekGoals[week].goal}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status *</Label>
              <Select
                value={watch('status')}
                onValueChange={(v) => setValue('status', v as CheckpointStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="blocked">Blocked</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Goal & Question */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="goal">Goal *</Label>
              <Input
                id="goal"
                placeholder="What should be accomplished this week?"
                {...register('goal')}
              />
              {errors.goal && (
                <p className="text-xs text-destructive">{errors.goal.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkpointQuestion">Key Question</Label>
              <Input
                id="checkpointQuestion"
                placeholder="What question must be answered?"
                {...register('checkpointQuestion')}
              />
            </div>
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Tasks</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  appendTask({ id: crypto.randomUUID(), title: '', completed: false })
                }
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>

            <div className="space-y-2">
              {taskFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={watch(`tasks.${index}.completed`)}
                    onCheckedChange={(checked) =>
                      setValue(`tasks.${index}.completed`, !!checked)
                    }
                  />
                  <Input
                    placeholder="Task description"
                    {...register(`tasks.${index}.title`)}
                    className="flex-1"
                  />
                  {taskFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeTask(index)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="founderNotes">Founder Notes</Label>
              <Textarea
                id="founderNotes"
                placeholder="Founder's update..."
                rows={3}
                {...register('founderNotes')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnerNotes">Partner Feedback</Label>
              <Textarea
                id="partnerNotes"
                placeholder="Partner's feedback..."
                rows={3}
                {...register('partnerNotes')}
              />
            </div>
          </div>

          {/* Evidence URLs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Evidence Links</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => appendUrl('')}
              >
                <LinkIcon className="h-4 w-4 mr-1" />
                Add Link
              </Button>
            </div>

            <div className="space-y-2">
              {urlFields.map((field, index) => (
                <div key={field.id} className="flex items-center gap-2">
                  <Input
                    type="url"
                    placeholder="https://..."
                    {...register(`evidenceUrls.${index}`)}
                    className="flex-1"
                  />
                  {urlFields.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeUrl(index)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}
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
                  Saving...
                </>
              ) : isEditing ? (
                'Update Checkpoint'
              ) : (
                'Add Checkpoint'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
