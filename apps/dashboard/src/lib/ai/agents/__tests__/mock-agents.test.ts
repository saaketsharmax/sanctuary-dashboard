import { describe, it, expect } from 'vitest'
import { MockGodModeDDAgent, getGodModeDDAgent } from '../god-mode-dd-agent'
import { MockMatchmakingAgent, getMatchmakingAgent } from '../matchmaking-agent'
import { MockProgrammeAgent, getProgrammeAgent } from '../programme-agent'
import type { GodModeDDInput } from '../../types/god-mode-dd'
import type { MatchmakingInput, MatchCandidate, MatchRequest } from '../../types/matchmaking'
import type { ProgrammeInput } from '../../types/programme'

// ─── God Mode DD Agent Tests ─────────────────────────────────────────────

describe('MockGodModeDDAgent', () => {
  const agent = new MockGodModeDDAgent()

  const testInput: GodModeDDInput = {
    companyName: 'TestCo',
    applicationData: {
      companyDescription: 'AI-powered analytics',
      problemDescription: 'Data analysis is slow',
      solutionDescription: 'Automated insights',
      targetCustomer: 'SMBs',
      stage: 'pre-seed',
      userCount: 100,
      mrr: 2400,
    },
    interviewTranscript: [
      { role: 'assistant', content: 'Tell me about your startup' },
      { role: 'user', content: 'We help SMBs with analytics' },
    ],
    signals: [
      { type: 'interview_confidence', content: 'High confidence in responses', dimension: 'founder', impact: 8 },
    ],
  }

  it('returns a valid GodModeDDReport', async () => {
    const report = await agent.analyze(testInput)

    expect(report).toBeDefined()
    expect(report.godModeScore).toBeGreaterThanOrEqual(0)
    expect(report.godModeScore).toBeLessThanOrEqual(100)
    expect(report.convictionLevel).toBeDefined()
    expect(report.oneLineVerdict).toBeTruthy()
    expect(report.memoAddendum).toBeTruthy()
  })

  it('includes all 9 metrics', async () => {
    const report = await agent.analyze(testInput)

    expect(report.behavioralFingerprint).toBeDefined()
    expect(report.signalConsistency).toBeDefined()
    expect(report.revenueQuality).toBeDefined()
    expect(report.capitalEfficiency).toBeDefined()
    expect(report.networkEffectPotential).toBeDefined()
    expect(report.moatDurability).toBeDefined()
    expect(report.marketTiming).toBeDefined()
    expect(report.contrarianSignals).toBeDefined()
    expect(report.patternMatch).toBeDefined()
  })

  it('behavioral fingerprint has required fields', async () => {
    const report = await agent.analyze(testInput)
    const bf = report.behavioralFingerprint

    expect(bf.confidenceConsistency).toBeGreaterThanOrEqual(0)
    expect(bf.specificityScore).toBeGreaterThanOrEqual(0)
    expect(bf.deceptionRiskScore).toBeGreaterThanOrEqual(0)
    expect(bf.founderArchetype).toBeTruthy()
    expect(Array.isArray(bf.deflectionPatterns)).toBe(true)
    expect(Array.isArray(bf.authenticityMarkers)).toBe(true)
  })

  it('moat durability includes projections', async () => {
    const report = await agent.analyze(testInput)
    const moat = report.moatDurability

    expect(moat.currentMoatScore).toBeDefined()
    expect(moat.projectedMoatIn12Months).toBeDefined()
    expect(moat.projectedMoatIn36Months).toBeDefined()
    expect(moat.moatTrajectory).toBeDefined()
  })

  it('alpha signals and blind spots are arrays', async () => {
    const report = await agent.analyze(testInput)

    expect(Array.isArray(report.alphaSignals)).toBe(true)
    expect(report.alphaSignals.length).toBeGreaterThan(0)
    expect(Array.isArray(report.blindSpots)).toBe(true)
    expect(report.blindSpots.length).toBeGreaterThan(0)
  })

  it('factory returns mock agent without API key', () => {
    // Without ANTHROPIC_API_KEY, should return mock
    const agent = getGodModeDDAgent()
    expect(agent).toBeDefined()
  })
})

// ─── Matchmaking Agent Tests ─────────────────────────────────────────────

describe('MockMatchmakingAgent', () => {
  const agent = new MockMatchmakingAgent()

  const testCandidate: MatchCandidate = {
    id: 'mentor-1',
    type: 'mentor',
    name: 'Jane Expert',
    expertise: ['growth_marketing', 'fundraising', 'saas'],
    industries: ['SaaS', 'FinTech'],
    stagePreference: ['pre-seed', 'seed'],
    location: 'San Francisco',
    availability: 'high',
    trackRecord: { successCount: 8, totalEngagements: 12, avgRating: 4.5 },
    preferences: { maxStartups: 3, preferredStage: ['pre-seed'], dealbreakers: ['crypto'] },
  }

  const testRequest: MatchRequest = {
    requesterId: 'startup-1',
    requesterType: 'startup',
    matchType: 'mentor_startup',
    needs: ['growth_strategy', 'fundraising'],
    urgency: 'soon',
    context: {
      stage: 'pre-seed',
      industry: 'SaaS',
      currentChallenges: ['customer acquisition', 'pricing strategy'],
      previousMentors: [],
    },
  }

  const testInput: MatchmakingInput = {
    request: testRequest,
    candidates: [
      testCandidate,
      { ...testCandidate, id: 'mentor-2', name: 'Bob Builder', availability: 'medium' },
      { ...testCandidate, id: 'mentor-3', name: 'Alice Wonder', expertise: ['engineering', 'devops'] },
    ],
  }

  it('returns matches sorted by score', async () => {
    const output = await agent.findMatches(testInput)

    expect(output.matches.length).toBe(3)
    for (let i = 1; i < output.matches.length; i++) {
      expect(output.matches[i - 1].score.overallScore).toBeGreaterThanOrEqual(
        output.matches[i].score.overallScore,
      )
    }
  })

  it('includes marketplace insights', async () => {
    const output = await agent.findMatches(testInput)

    expect(output.marketplaceInsights).toBeDefined()
    expect(output.marketplaceInsights.totalCandidatesEvaluated).toBe(3)
    expect(output.marketplaceInsights.averageScore).toBeGreaterThan(0)
  })

  it('match scores have all 6 dimensions', async () => {
    const output = await agent.findMatches(testInput)

    for (const match of output.matches) {
      const dims = match.score.dimensions
      expect(dims.expertiseAlignment).toBeDefined()
      expect(dims.stageRelevance).toBeDefined()
      expect(dims.industryFit).toBeDefined()
      expect(dims.availabilityMatch).toBeDefined()
      expect(dims.trackRecordStrength).toBeDefined()
      expect(dims.personalityFit).toBeDefined()
    }
  })

  it('assigns correct ranks', async () => {
    const output = await agent.findMatches(testInput)

    output.matches.forEach((match, i) => {
      expect(match.rank).toBe(i + 1)
    })
  })

  it('includes suggested engagement format', async () => {
    const output = await agent.findMatches(testInput)

    const validFormats = ['weekly_1on1', 'biweekly_1on1', 'monthly_advisory', 'project_based', 'on_demand']
    for (const match of output.matches) {
      expect(validFormats).toContain(match.score.suggestedEngagementFormat)
    }
  })

  it('factory returns mock agent without API key', () => {
    const agent = getMatchmakingAgent()
    expect(agent).toBeDefined()
  })
})

// ─── Programme Agent Tests ───────────────────────────────────────────────

describe('MockProgrammeAgent', () => {
  const agent = new MockProgrammeAgent()

  const testInput: ProgrammeInput = {
    applicationId: 'app-test',
    companyName: 'TestStartup',
    stage: 'pre-seed',
    industry: 'SaaS',
    applicationData: {
      problemDescription: 'Manual data entry is slow and error-prone',
      solutionDescription: 'AI-powered data extraction and entry automation',
      targetCustomer: 'SMB operations teams',
      userCount: 150,
      mrr: 2400,
      biggestChallenge: 'Scaling customer acquisition beyond word of mouth',
      whatTheyWant: 'Growth strategy, fundraise coaching, and product mentorship',
    },
    founders: [
      { name: 'John Doe', role: 'CEO', yearsExperience: 8, hasStartedBefore: true },
      { name: 'Jane Smith', role: 'CTO', yearsExperience: 6, hasStartedBefore: false },
    ],
  }

  it('generates a 90-day programme with 3 phases', async () => {
    const programme = await agent.generateProgramme(testInput)

    expect(programme.phases.length).toBe(3)
    expect(programme.phases[0].name).toBe('Foundation')
    expect(programme.phases[1].name).toBe('Acceleration')
    expect(programme.phases[2].name).toBe('Launch Pad')
  })

  it('has 8-12 milestones total', async () => {
    const programme = await agent.generateProgramme(testInput)

    const totalMilestones = programme.phases.reduce((s, p) => s + p.milestones.length, 0)
    expect(totalMilestones).toBeGreaterThanOrEqual(8)
    expect(totalMilestones).toBeLessThanOrEqual(12)
  })

  it('milestones have required fields', async () => {
    const programme = await agent.generateProgramme(testInput)

    for (const phase of programme.phases) {
      for (const milestone of phase.milestones) {
        expect(milestone.id).toBeTruthy()
        expect(milestone.title).toBeTruthy()
        expect(milestone.description).toBeTruthy()
        expect(milestone.weekNumber).toBeGreaterThanOrEqual(1)
        expect(milestone.weekNumber).toBeLessThanOrEqual(12)
        expect(Array.isArray(milestone.successCriteria)).toBe(true)
        expect(milestone.successCriteria.length).toBeGreaterThan(0)
        expect(Array.isArray(milestone.kpiTargets)).toBe(true)
        expect(milestone.status).toBe('upcoming')
        expect(milestone.dueDate).toBeTruthy()
      }
    }
  })

  it('sets KPI targets based on current metrics', async () => {
    const programme = await agent.generateProgramme(testInput)

    // The demo day milestone should have MRR target ~3x baseline
    const demoDay = programme.phases[2].milestones.find((m) => m.title.includes('Demo Day'))
    expect(demoDay).toBeDefined()

    const mrrTarget = demoDay!.kpiTargets.find((k) => k.metric === 'mrr')
    expect(mrrTarget).toBeDefined()
    // 3x of 2400 = 7200
    expect(mrrTarget!.target).toBe(7200)
  })

  it('includes mentor matching triggers', async () => {
    const programme = await agent.generateProgramme(testInput)

    expect(programme.mentorMatchingTriggers.length).toBeGreaterThan(0)
    for (const trigger of programme.mentorMatchingTriggers) {
      expect(trigger.milestone).toBeTruthy()
      expect(trigger.expertise.length).toBeGreaterThan(0)
      expect(['immediate', 'this_week', 'next_phase']).toContain(trigger.urgency)
    }
  })

  it('includes weekly check-in schedule for all 12 weeks', async () => {
    const programme = await agent.generateProgramme(testInput)

    expect(programme.weeklyCheckInSchedule.length).toBe(12)
    programme.weeklyCheckInSchedule.forEach((checkin, i) => {
      expect(checkin.weekNumber).toBe(i + 1)
      expect(checkin.focus).toBeTruthy()
      expect(checkin.attendees).toContain('founder')
    })
  })

  it('sets initial progress to 0 and risk level', async () => {
    const programme = await agent.generateProgramme(testInput)

    expect(programme.overallProgress).toBe(0)
    expect(programme.currentWeek).toBe(1)
    expect(['on_track', 'at_risk', 'behind']).toContain(programme.riskLevel)
  })

  it('identifies the next milestone', async () => {
    const programme = await agent.generateProgramme(testInput)

    expect(programme.nextMilestone).toBeDefined()
    expect(programme.nextMilestone!.status).toBe('upcoming')
  })

  it('factory returns mock agent without API key', () => {
    const agent = getProgrammeAgent()
    expect(agent).toBeDefined()
  })
})
