import type { Checkpoint } from '@/types'

export const checkpoints: Checkpoint[] = [
  // TechFlow AI checkpoints
  {
    id: 'checkpoint-1-1',
    startupId: 'startup-1',
    weekNumber: 1,
    goal: 'Validate problem with 10 ML engineers',
    checkpointQuestion: 'Is MLOps deployment actually painful enough to pay for?',
    tasks: [
      { id: 'task-1', title: 'Conduct 10 user interviews', completed: true },
      { id: 'task-2', title: 'Document pain points', completed: true },
      { id: 'task-3', title: 'Analyze competitor solutions', completed: true },
    ],
    evidenceUrls: ['https://notion.so/interviews'],
    founderNotes: 'Strong signal - 8/10 engineers spend >50% time on deployment issues.',
    partnerNotes: 'Excellent validation. Consider expanding to enterprise decision makers.',
    status: 'completed',
    completedAt: '2026-02-07T00:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-07T00:00:00Z',
  },
  {
    id: 'checkpoint-1-2',
    startupId: 'startup-1',
    weekNumber: 2,
    goal: 'Interview 5 enterprise ML leaders',
    checkpointQuestion: 'Who is the buyer and what budget do they have?',
    tasks: [
      { id: 'task-4', title: 'Schedule 5 enterprise interviews', completed: true },
      { id: 'task-5', title: 'Map buying process', completed: true },
      { id: 'task-6', title: 'Identify budget owners', completed: true },
    ],
    evidenceUrls: [],
    founderNotes: 'VP of Engineering is the buyer. Budgets $50-200k for tooling.',
    partnerNotes: 'Great progress. Start thinking about pricing strategy.',
    status: 'completed',
    completedAt: '2026-02-14T00:00:00Z',
    createdAt: '2026-02-08T00:00:00Z',
    updatedAt: '2026-02-14T00:00:00Z',
  },
  {
    id: 'checkpoint-1-3',
    startupId: 'startup-1',
    weekNumber: 3,
    goal: 'Design MVP scope',
    checkpointQuestion: 'What is the smallest thing we can build that delivers value?',
    tasks: [
      { id: 'task-7', title: 'Define MVP features', completed: true },
      { id: 'task-8', title: 'Create technical architecture', completed: true },
      { id: 'task-9', title: 'Estimate development time', completed: false },
    ],
    evidenceUrls: [],
    founderNotes: 'MVP: One-click deploy for PyTorch models. 2-week build.',
    partnerNotes: null,
    status: 'in_progress',
    completedAt: null,
    createdAt: '2026-02-15T00:00:00Z',
    updatedAt: '2026-02-18T00:00:00Z',
  },

  // GreenCommute checkpoints
  {
    id: 'checkpoint-2-1',
    startupId: 'startup-2',
    weekNumber: 1,
    goal: 'Understand Scope 3 reporting requirements',
    checkpointQuestion: 'What regulations are driving demand?',
    tasks: [
      { id: 'task-10', title: 'Research EU CSRD requirements', completed: true },
      { id: 'task-11', title: 'Interview 5 sustainability managers', completed: true },
      { id: 'task-12', title: 'Map current solutions landscape', completed: true },
    ],
    evidenceUrls: [],
    founderNotes: 'CSRD mandates Scope 3 reporting by 2025 for EU companies. Huge opportunity.',
    partnerNotes: 'Regulatory tailwind is strong. Focus on the measurement accuracy angle.',
    status: 'completed',
    completedAt: '2026-02-07T00:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-07T00:00:00Z',
  },
  {
    id: 'checkpoint-2-2',
    startupId: 'startup-2',
    weekNumber: 2,
    goal: 'Validate commute tracking approach',
    checkpointQuestion: 'Can we get accurate data without being creepy?',
    tasks: [
      { id: 'task-13', title: 'Test 3 tracking methodologies', completed: true },
      { id: 'task-14', title: 'Run employee privacy survey', completed: false },
      { id: 'task-15', title: 'Design opt-in flow', completed: false },
    ],
    evidenceUrls: [],
    founderNotes: 'Calendar + expense integration seems most privacy-friendly.',
    partnerNotes: 'Privacy is key differentiator. Double down on this.',
    status: 'in_progress',
    completedAt: null,
    createdAt: '2026-02-08T00:00:00Z',
    updatedAt: '2026-02-12T00:00:00Z',
  },

  // HealthBridge checkpoints (more complete - they're in Growth stage)
  {
    id: 'checkpoint-3-1',
    startupId: 'startup-3',
    weekNumber: 1,
    goal: 'Validate problem with 20 patients and 10 providers',
    checkpointQuestion: 'Is communication actually the bottleneck?',
    tasks: [
      { id: 'task-16', title: 'Patient interviews', completed: true },
      { id: 'task-17', title: 'Provider interviews', completed: true },
      { id: 'task-18', title: 'Shadow clinic operations', completed: true },
    ],
    evidenceUrls: ['https://drive.google.com/research'],
    founderNotes: 'Overwhelming validation. Both sides frustrated with phone tag.',
    partnerNotes: 'Strong problem validation. Proceed to solution.',
    status: 'completed',
    completedAt: '2026-02-07T00:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-07T00:00:00Z',
  },

  // FinLit checkpoints (early stage, struggling)
  {
    id: 'checkpoint-4-1',
    startupId: 'startup-4',
    weekNumber: 1,
    goal: 'Validate problem with 30 Gen Z users',
    checkpointQuestion: 'Do young people actually want to learn about money?',
    tasks: [
      { id: 'task-22', title: 'Run Instagram survey', completed: true },
      { id: 'task-23', title: 'Conduct 15 user interviews', completed: false },
      { id: 'task-24', title: 'Analyze competing apps', completed: true },
    ],
    evidenceUrls: [],
    founderNotes: 'Survey shows interest but interviews are harder to schedule than expected.',
    partnerNotes: 'Need more depth here. Survey data is weak. Push for real conversations.',
    status: 'blocked',
    completedAt: null,
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-10T00:00:00Z',
  },

  // BuildRight checkpoints
  {
    id: 'checkpoint-5-1',
    startupId: 'startup-5',
    weekNumber: 1,
    goal: 'Validate with 10 general contractors',
    checkpointQuestion: 'What specific coordination problem costs the most money?',
    tasks: [
      { id: 'task-25', title: 'Interview 10 GCs', completed: true },
      { id: 'task-26', title: 'Quantify cost of delays', completed: true },
      { id: 'task-27', title: 'Map current tools used', completed: true },
    ],
    evidenceUrls: ['https://notion.so/gc-interviews'],
    founderNotes: 'RFI management is #1 pain point. Costs $50k+ per project in delays.',
    partnerNotes: 'Excellent quantification. Carlos has deep domain credibility.',
    status: 'completed',
    completedAt: '2026-02-07T00:00:00Z',
    createdAt: '2026-02-01T00:00:00Z',
    updatedAt: '2026-02-07T00:00:00Z',
  },
]

export function getCheckpointsByStartupId(startupId: string): Checkpoint[] {
  return checkpoints
    .filter((c) => c.startupId === startupId)
    .sort((a, b) => a.weekNumber - b.weekNumber)
}

export function getCheckpointById(id: string): Checkpoint | undefined {
  return checkpoints.find((c) => c.id === id)
}

export function getLatestCheckpoint(startupId: string): Checkpoint | undefined {
  const startupCheckpoints = getCheckpointsByStartupId(startupId)
  return startupCheckpoints[startupCheckpoints.length - 1]
}

export function getCheckpointsByStatus(status: Checkpoint['status']): Checkpoint[] {
  return checkpoints.filter((c) => c.status === status)
}
