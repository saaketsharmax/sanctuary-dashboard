import type { Cohort } from '@/types'

export const cohorts: Cohort[] = [
  {
    id: 'cohort-1',
    name: 'Cohort 1 - Spring 2026',
    startDate: '2026-02-01',
    endDate: '2026-06-30',
    status: 'active',
    description: 'First cohort of Sanctuary Accelerator',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'cohort-2',
    name: 'Cohort 2 - Fall 2026',
    startDate: '2026-09-01',
    endDate: '2027-01-31',
    status: 'upcoming',
    description: 'Second cohort - applications opening soon',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
]

export function getCohortById(id: string): Cohort | undefined {
  return cohorts.find((c) => c.id === id)
}

export function getActiveCohort(): Cohort | undefined {
  return cohorts.find((c) => c.status === 'active')
}
