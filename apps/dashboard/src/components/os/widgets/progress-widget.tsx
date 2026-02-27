'use client'

import { WidgetCard } from '../widget-card'
import { Calendar } from 'lucide-react'

interface ProgressWidgetProps {
  title: string
  progress: number
  currentWeek: number
  totalWeeks: number
  dueDate?: string
  tasksCompleted?: number
  totalTasks?: number
}

export function ProgressWidget({
  title,
  progress,
  currentWeek,
  totalWeeks,
  dueDate,
  tasksCompleted,
  totalTasks
}: ProgressWidgetProps) {
  return (
    <WidgetCard>
      <div className="p-5 space-y-4">
        <div>
          <h3 className="text-[15.5px] font-medium text-black leading-[21.6px] mb-1">
            {title}
          </h3>
          <p className="text-[11.4px] font-medium text-black/50 leading-[16.2px]">
            Week {currentWeek} of {totalWeeks}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-black/50">Progress</span>
            <span className="text-[10px] font-medium text-black">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-black/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-black rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Tasks */}
        {tasksCompleted !== undefined && totalTasks !== undefined && (
          <div className="flex items-center justify-between py-2 border-t border-black/10">
            <span className="text-[11.4px] font-medium text-black/50">Tasks</span>
            <span className="text-[11.4px] font-medium text-black">
              {tasksCompleted} / {totalTasks} completed
            </span>
          </div>
        )}

        {/* Due Date */}
        {dueDate && (
          <div className="flex items-center gap-2 pt-2 border-t border-black/10">
            <Calendar className="w-4 h-4 text-black/50" />
            <span className="text-[11.4px] font-medium text-black/50">Due {dueDate}</span>
          </div>
        )}
      </div>
    </WidgetCard>
  )
}
