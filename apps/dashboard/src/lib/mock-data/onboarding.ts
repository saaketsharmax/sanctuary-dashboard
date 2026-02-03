// =====================================================
// SANCTUARY DASHBOARD — Onboarding Mock Data
// Applications, Interviews, Assessments, Programmes
// =====================================================

import type {
  Application,
  ApplicationFounder,
  Interview,
  InterviewMessage,
  Assessment,
  ProposedProgramme,
  ProposedProgrammeWeek,
  ApplicationWithFounders,
  InterviewWithMessages,
  ApplicationStatus,
  InterviewSection,
} from '@/types'

// -----------------------------------------------------
// APPLICATIONS
// -----------------------------------------------------

export const applications: Application[] = [
  {
    id: 'app-1',
    status: 'interview_completed',
    companyName: 'DataSync Pro',
    companyOneLiner: 'Real-time data synchronization for distributed teams',
    companyWebsite: 'https://datasyncpro.io',
    companyDescription:
      'DataSync Pro helps remote teams keep their databases, documents, and workflows in perfect sync across time zones. Our platform reduces merge conflicts by 90% and saves engineering teams 10+ hours per week.',
    problemDescription:
      'Distributed teams waste countless hours dealing with data conflicts, version mismatches, and sync issues. This leads to bugs, rework, and frustrated developers.',
    targetCustomer:
      'Engineering teams at remote-first companies with 50-500 employees who use multiple data sources.',
    solutionDescription:
      'A lightweight SDK that integrates with existing databases and provides conflict-free real-time synchronization with automatic resolution.',
    stage: 'has_users',
    userCount: 12,
    mrr: 2400,
    biggestChallenge: 'Moving from design partners to self-serve customers',
    whySanctuary:
      'We need guidance on GTM strategy and pricing. Our current users love us but we are struggling to scale beyond warm intros.',
    whatTheyWant:
      'Help with sales process, pricing experiments, and intro to enterprise customers in our ICP.',
    interviewScheduledAt: '2026-01-28T14:00:00Z',
    interviewCompletedAt: '2026-01-28T15:05:00Z',
    submittedAt: '2026-01-25T10:30:00Z',
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-28T15:05:00Z',
  },
  {
    id: 'app-2',
    status: 'submitted',
    companyName: 'MealMate AI',
    companyOneLiner: 'AI-powered meal planning for busy families',
    companyWebsite: 'https://mealmate.ai',
    companyDescription:
      'MealMate uses AI to create personalized weekly meal plans based on dietary restrictions, budget, and what is in your fridge. We reduce food waste and save families 5 hours per week on meal planning.',
    problemDescription:
      'Families struggle to plan healthy meals that everyone will eat, stay within budget, and minimize food waste. Most give up and order takeout.',
    targetCustomer: 'Dual-income families with children aged 5-15 who want to eat healthier.',
    solutionDescription:
      'Mobile app that scans your fridge, learns your family preferences, and generates a personalized weekly plan with automated grocery ordering.',
    stage: 'has_mvp',
    userCount: 0,
    mrr: 0,
    biggestChallenge: 'Getting our first paying customers',
    whySanctuary:
      'We have a working product but zero users. Need help with launch strategy and finding early adopters.',
    whatTheyWant: 'Customer discovery frameworks, launch playbook, early user acquisition tactics.',
    interviewScheduledAt: null,
    interviewCompletedAt: null,
    submittedAt: '2026-01-30T09:15:00Z',
    createdAt: '2026-01-30T08:00:00Z',
    updatedAt: '2026-01-30T09:15:00Z',
  },
  {
    id: 'app-3',
    status: 'approved',
    companyName: 'ComplianceBot',
    companyOneLiner: 'Automated SOC 2 compliance for startups',
    companyWebsite: 'https://compliancebot.co',
    companyDescription:
      'ComplianceBot automates 80% of SOC 2 compliance work. We connect to your existing tools (GitHub, AWS, Slack) and continuously monitor for compliance gaps.',
    problemDescription:
      'Startups lose enterprise deals because they do not have SOC 2. Getting certified takes 6-12 months and $50K+ in consulting fees.',
    targetCustomer: 'B2B SaaS startups with 10-100 employees trying to close enterprise deals.',
    solutionDescription:
      'Automated compliance platform that integrates with your stack, identifies gaps, and generates audit-ready evidence.',
    stage: 'has_revenue',
    userCount: 45,
    mrr: 12000,
    biggestChallenge: 'Scaling our sales team and reducing CAC',
    whySanctuary:
      'We have strong product-market fit but need help building a repeatable sales process and hiring our first AE.',
    whatTheyWant: 'Sales playbook, hiring frameworks, intro to sales leaders who have scaled B2B SaaS.',
    interviewScheduledAt: '2026-01-20T10:00:00Z',
    interviewCompletedAt: '2026-01-20T11:10:00Z',
    submittedAt: '2026-01-15T14:00:00Z',
    createdAt: '2026-01-15T13:30:00Z',
    updatedAt: '2026-01-22T16:00:00Z',
  },
]

// -----------------------------------------------------
// APPLICATION FOUNDERS
// -----------------------------------------------------

export const applicationFounders: ApplicationFounder[] = [
  // DataSync Pro founders
  {
    id: 'app-founder-1',
    applicationId: 'app-1',
    name: 'Michael Torres',
    email: 'michael@datasyncpro.io',
    role: 'CEO',
    isLead: true,
    linkedin: 'https://linkedin.com/in/michaeltorres',
    yearsExperience: 8,
    hasStartedBefore: true,
    previousStartupOutcome: 'Sold previous company (developer tools) to GitLab in 2022',
    createdAt: '2026-01-25T10:00:00Z',
  },
  {
    id: 'app-founder-2',
    applicationId: 'app-1',
    name: 'Priya Sharma',
    email: 'priya@datasyncpro.io',
    role: 'CTO',
    isLead: false,
    linkedin: 'https://linkedin.com/in/priyasharma',
    yearsExperience: 10,
    hasStartedBefore: false,
    previousStartupOutcome: null,
    createdAt: '2026-01-25T10:00:00Z',
  },
  // MealMate AI founder
  {
    id: 'app-founder-3',
    applicationId: 'app-2',
    name: 'Jessica Kim',
    email: 'jessica@mealmate.ai',
    role: 'CEO & Solo Founder',
    isLead: true,
    linkedin: 'https://linkedin.com/in/jessicakim',
    yearsExperience: 5,
    hasStartedBefore: false,
    previousStartupOutcome: null,
    createdAt: '2026-01-30T08:00:00Z',
  },
  // ComplianceBot founders
  {
    id: 'app-founder-4',
    applicationId: 'app-3',
    name: 'David Chen',
    email: 'david@compliancebot.co',
    role: 'CEO',
    isLead: true,
    linkedin: 'https://linkedin.com/in/davidchen',
    yearsExperience: 12,
    hasStartedBefore: true,
    previousStartupOutcome: 'Founded and sold a security consultancy',
    createdAt: '2026-01-15T13:30:00Z',
  },
  {
    id: 'app-founder-5',
    applicationId: 'app-3',
    name: 'Amanda Foster',
    email: 'amanda@compliancebot.co',
    role: 'CTO',
    isLead: false,
    linkedin: 'https://linkedin.com/in/amandafoster',
    yearsExperience: 9,
    hasStartedBefore: false,
    previousStartupOutcome: null,
    createdAt: '2026-01-15T13:30:00Z',
  },
]

// -----------------------------------------------------
// INTERVIEWS
// -----------------------------------------------------

export const interviews: Interview[] = [
  {
    id: 'interview-1',
    applicationId: 'app-1',
    status: 'completed',
    currentSection: 'sanctuary_fit',
    startedAt: '2026-01-28T14:00:00Z',
    completedAt: '2026-01-28T15:05:00Z',
    durationMinutes: 65,
    aiModel: 'claude-sonnet-4-20250514',
    createdAt: '2026-01-28T13:55:00Z',
    updatedAt: '2026-01-28T15:05:00Z',
  },
  {
    id: 'interview-2',
    applicationId: 'app-3',
    status: 'completed',
    currentSection: 'sanctuary_fit',
    startedAt: '2026-01-20T10:00:00Z',
    completedAt: '2026-01-20T11:10:00Z',
    durationMinutes: 70,
    aiModel: 'claude-sonnet-4-20250514',
    createdAt: '2026-01-20T09:55:00Z',
    updatedAt: '2026-01-20T11:10:00Z',
  },
]

// -----------------------------------------------------
// INTERVIEW MESSAGES (Sample conversation for app-1)
// -----------------------------------------------------

export const interviewMessages: InterviewMessage[] = [
  // SECTION 1: Founder DNA
  {
    id: 'msg-1',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "Welcome to your Sanctuary interview, Michael. I'm going to ask you some direct questions to understand you and DataSync Pro better. This will take about 45-60 minutes. Ready to begin?",
    section: 'founder_dna',
    sequenceNumber: 1,
    createdAt: '2026-01-28T14:00:00Z',
  },
  {
    id: 'msg-2',
    interviewId: 'interview-1',
    role: 'user',
    content: "Yes, I'm ready. Let's do this.",
    section: 'founder_dna',
    sequenceNumber: 2,
    createdAt: '2026-01-28T14:00:30Z',
  },
  {
    id: 'msg-3',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "Great. Tell me about yourself in 60 seconds. Not your resume — who are you as a person? What drives you?",
    section: 'founder_dna',
    sequenceNumber: 3,
    createdAt: '2026-01-28T14:00:45Z',
  },
  {
    id: 'msg-4',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "I'm a builder at heart. I've been coding since I was 12, and I've always been obsessed with making tools that help other developers work faster. My first startup was about making code review easier, and we sold to GitLab. But honestly? I'm most myself when I'm deep in a hard problem with my co-founder Priya, whiteboarding solutions until 2am. The sync problem has haunted me for years — I lived it at my last company.",
    section: 'founder_dna',
    sequenceNumber: 4,
    createdAt: '2026-01-28T14:01:30Z',
  },
  {
    id: 'msg-5',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "Good. You mentioned the sync problem \"haunted\" you. Tell me about a specific moment when you felt that pain most acutely. What happened?",
    section: 'founder_dna',
    sequenceNumber: 5,
    createdAt: '2026-01-28T14:02:00Z',
  },
  {
    id: 'msg-6',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "At GitLab, we had a major incident where a sync bug caused data loss for a customer. I was the one who had to call them and explain. Their CTO was furious — they'd lost three days of work. I spent the next month building internal tooling to prevent it from happening again. That's when I realized this wasn't just our problem. Every distributed team faces this.",
    section: 'founder_dna',
    sequenceNumber: 6,
    createdAt: '2026-01-28T14:03:00Z',
  },
  {
    id: 'msg-7',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "That's a strong origin story. Now tell me about Priya. How did you two meet, and what makes her the right co-founder for this?",
    section: 'founder_dna',
    sequenceNumber: 7,
    createdAt: '2026-01-28T14:03:30Z',
  },
  {
    id: 'msg-8',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "Priya and I worked together at GitLab for 4 years. She's the one who actually built most of the sync infrastructure there. She's brilliant at distributed systems — way better than me. We complement each other well. I'm more customer-facing and product-minded; she's deeply technical and keeps me honest about what's actually possible.",
    section: 'founder_dna',
    sequenceNumber: 8,
    createdAt: '2026-01-28T14:04:15Z',
  },
  {
    id: 'msg-9',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "Have you and Priya had any major disagreements about the company direction? How did you resolve them?",
    section: 'founder_dna',
    sequenceNumber: 9,
    createdAt: '2026-01-28T14:04:45Z',
  },
  {
    id: 'msg-10',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "Yes, actually. Early on, I wanted to go after enterprise immediately. Priya pushed back hard — she thought we needed to nail the developer experience first. We had a pretty heated debate. Eventually, I realized she was right. We spent three extra months on the SDK before talking to customers, and it's paying off now. Our developers love how clean the integration is.",
    section: 'founder_dna',
    sequenceNumber: 10,
    createdAt: '2026-01-28T14:05:30Z',
  },

  // SECTION 2: Problem Interrogation
  {
    id: 'msg-11',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "Good, sounds like you have a healthy dynamic. Let's shift gears and talk about the problem. Explain the sync problem to me like I'm 12 years old.",
    section: 'problem_interrogation',
    sequenceNumber: 11,
    createdAt: '2026-01-28T14:06:00Z',
  },
  {
    id: 'msg-12',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "Imagine you and your friend are both editing the same Google Doc, but your internet is slow. You type something, they type something, and when the internet catches up — boom, one of your changes disappears. Now imagine that happening with important data, like customer orders or code. That's what we fix.",
    section: 'problem_interrogation',
    sequenceNumber: 12,
    createdAt: '2026-01-28T14:06:45Z',
  },
  {
    id: 'msg-13',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "Clear. How many engineering teams have you actually talked to about this problem? Give me a specific number and tell me about one of those conversations.",
    section: 'problem_interrogation',
    sequenceNumber: 13,
    createdAt: '2026-01-28T14:07:15Z',
  },
  {
    id: 'msg-14',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "We've done 47 customer discovery calls over the past 6 months. One that stands out — the VP of Engineering at a fintech company told me, quote: 'We spend 20% of every sprint just dealing with sync issues. It's become a tax on our velocity.' He actually pulled up their JIRA board and showed me. Dozens of tickets tagged with 'sync-bug'.",
    section: 'problem_interrogation',
    sequenceNumber: 14,
    createdAt: '2026-01-28T14:08:00Z',
  },
  {
    id: 'msg-15',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "47 calls is solid. What do teams do today to solve this without you? What are the existing alternatives?",
    section: 'problem_interrogation',
    sequenceNumber: 15,
    createdAt: '2026-01-28T14:08:30Z',
  },
  {
    id: 'msg-16',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "Most teams either: (1) Build their own sync layer internally — which takes months and is usually buggy, (2) Use AWS AppSync or Firebase, which works for simple cases but falls apart at scale, or (3) Just accept the pain and have developers manually resolve conflicts. None of these are good solutions.",
    section: 'problem_interrogation',
    sequenceNumber: 16,
    createdAt: '2026-01-28T14:09:15Z',
  },
  {
    id: 'msg-17',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "What would make you realize you're wrong about this problem? What evidence would convince you to pivot or shut down?",
    section: 'problem_interrogation',
    sequenceNumber: 17,
    createdAt: '2026-01-28T14:09:45Z',
  },
  {
    id: 'msg-18',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "If we can't get teams to pay more than $500/month for this, it means the pain isn't real enough. Or if we find that the existing solutions are 'good enough' for 90% of use cases. We're watching churn closely — if our first 20 customers don't stick around, that's a red flag.",
    section: 'problem_interrogation',
    sequenceNumber: 18,
    createdAt: '2026-01-28T14:10:30Z',
  },

  // SECTION 3: Solution & Execution
  {
    id: 'msg-19',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "Good awareness of potential failure modes. Let's talk about what you've built. Walk me through your product. What does a developer actually experience when they integrate DataSync?",
    section: 'solution_execution',
    sequenceNumber: 19,
    createdAt: '2026-01-28T14:11:00Z',
  },
  {
    id: 'msg-20',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "It's a 3-line SDK integration. You import our library, wrap your data models, and call sync(). We handle all the CRDT magic under the hood. Developers tell us they're fully integrated in under an hour. We also have a dashboard where they can monitor sync status and see conflict resolution in real-time.",
    section: 'solution_execution',
    sequenceNumber: 20,
    createdAt: '2026-01-28T14:11:45Z',
  },
  {
    id: 'msg-21',
    interviewId: 'interview-1',
    role: 'assistant',
    content: "What features did you intentionally NOT build? What did you cut to ship faster?",
    section: 'solution_execution',
    sequenceNumber: 21,
    createdAt: '2026-01-28T14:12:15Z',
  },
  {
    id: 'msg-22',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "We cut offline-first support initially. A lot of people asked for it, but we realized it would add 3 months to our timeline. We also don't do self-hosted yet — everything is cloud-only. And we only support PostgreSQL and MongoDB for now, even though people keep asking for MySQL.",
    section: 'solution_execution',
    sequenceNumber: 22,
    createdAt: '2026-01-28T14:13:00Z',
  },
  {
    id: 'msg-23',
    interviewId: 'interview-1',
    role: 'assistant',
    content: "How long did it take to build what you have now? Be specific about the timeline.",
    section: 'solution_execution',
    sequenceNumber: 23,
    createdAt: '2026-01-28T14:13:30Z',
  },
  {
    id: 'msg-24',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "8 months from first line of code to first paying customer. First 3 months were R&D on the CRDT algorithm. Then 2 months building the SDK. Then 3 months of design partner feedback and iteration. We probably should have shipped sooner, but the core sync logic had to be bulletproof.",
    section: 'solution_execution',
    sequenceNumber: 24,
    createdAt: '2026-01-28T14:14:15Z',
  },

  // SECTION 4: Market & Competition
  {
    id: 'msg-25',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "Let's talk about the market. Who are your competitors, and why will you win against them?",
    section: 'market_competition',
    sequenceNumber: 25,
    createdAt: '2026-01-28T14:15:00Z',
  },
  {
    id: 'msg-26',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "Direct competitors are Liveblocks and PowerSync. Liveblocks is focused on collaborative features — cursors, presence. We're focused on data sync. PowerSync is mobile-first; we're backend-first. Our unfair advantage is that Priya literally wrote the book on CRDTs at GitLab. Our algorithm is 3x faster than anything else on the market.",
    section: 'market_competition',
    sequenceNumber: 26,
    createdAt: '2026-01-28T14:15:45Z',
  },
  {
    id: 'msg-27',
    interviewId: 'interview-1',
    role: 'assistant',
    content: "How big is this market? What's your honest assessment of the opportunity?",
    section: 'market_competition',
    sequenceNumber: 27,
    createdAt: '2026-01-28T14:16:15Z',
  },
  {
    id: 'msg-28',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "The developer tools market is $15B+. Real-time sync infrastructure is a subset — maybe $500M-$1B today. But every app is becoming collaborative. I think this could be a $5B market in 5 years. We're going after the same trajectory as Stripe for payments — become the default infrastructure.",
    section: 'market_competition',
    sequenceNumber: 28,
    createdAt: '2026-01-28T14:17:00Z',
  },

  // SECTION 5: Sanctuary Fit
  {
    id: 'msg-29',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "Last section. What do you need most from Sanctuary in the next 5 months? Be specific.",
    section: 'sanctuary_fit',
    sequenceNumber: 29,
    createdAt: '2026-01-28T14:18:00Z',
  },
  {
    id: 'msg-30',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "Three things: (1) Help with our go-to-market motion — we're engineers trying to figure out sales. (2) Pricing strategy — we're probably undercharging. (3) Intros to enterprise engineering leaders who could be design partners. If we nail enterprise, this becomes a much bigger business.",
    section: 'sanctuary_fit',
    sequenceNumber: 30,
    createdAt: '2026-01-28T14:18:45Z',
  },
  {
    id: 'msg-31',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "What does success look like at the end of the 5 months? What metrics would make you say 'Sanctuary was worth it'?",
    section: 'sanctuary_fit',
    sequenceNumber: 31,
    createdAt: '2026-01-28T14:19:15Z',
  },
  {
    id: 'msg-32',
    interviewId: 'interview-1',
    role: 'user',
    content:
      "$15K MRR, 3 enterprise pilots in progress, and a clear path to raising a seed round. If we hit those, we're set up to really scale.",
    section: 'sanctuary_fit',
    sequenceNumber: 32,
    createdAt: '2026-01-28T14:19:45Z',
  },
  {
    id: 'msg-33',
    interviewId: 'interview-1',
    role: 'assistant',
    content:
      "Thank you, Michael. This has been a great conversation. You'll hear from us within 48 hours with next steps. Good luck with DataSync Pro.",
    section: 'sanctuary_fit',
    sequenceNumber: 33,
    createdAt: '2026-01-28T14:20:00Z',
  },
]

// -----------------------------------------------------
// ASSESSMENTS
// -----------------------------------------------------

export const assessments: Assessment[] = [
  {
    id: 'assessment-1',
    applicationId: 'app-1',
    interviewId: 'interview-1',
    recommendation: 'accept',
    recommendationConfidence: 0.85,
    oneLineSummary:
      'Strong technical founders with prior exit, solving a real pain point for distributed engineering teams. Clear path to enterprise.',

    founderScore: 82,
    founderReasoning:
      'Michael has a prior exit (GitLab acquisition), deep domain expertise, and clear founder-problem fit. The co-founder dynamic with Priya is healthy — they complement each other well and have resolved disagreements constructively.',

    problemScore: 78,
    problemReasoning:
      "47 customer discovery calls with specific quotes showing pain. The '20% of sprints' quote is compelling. Problem is real and frequent for target customers, though severity varies by team size.",

    userValueScore: 72,
    userValueReasoning:
      '12 paying users at $200/month average shows initial willingness to pay. Need more data on retention and expansion. The 3-line integration is a strong value prop.',

    executionScore: 80,
    executionReasoning:
      '8 months to first paying customer is reasonable for deep-tech. Showed good discipline cutting features (offline, MySQL). The SDK-first approach is smart.',

    overallScore: 78,

    keyStrengths: [
      {
        strength: 'Founder-problem fit',
        evidence: "Michael personally experienced the data loss incident at GitLab and built internal tooling to fix it. 'That's when I realized this wasn't just our problem.'",
        impact: 'Deep understanding of the problem leads to better product decisions.',
      },
      {
        strength: 'Technical moat',
        evidence: "Priya 'literally wrote the book on CRDTs at GitLab' — their algorithm is reportedly 3x faster than competitors.",
        impact: 'Hard to replicate technical advantage in core product.',
      },
      {
        strength: 'Healthy co-founder dynamic',
        evidence: "They disagreed on enterprise timing, debated it, and Michael admitted 'I realized she was right.'",
        impact: 'Teams that can disagree and resolve constructively tend to outperform.',
      },
    ],

    keyRisks: [
      {
        risk: 'GTM inexperience',
        evidence: "Michael explicitly said 'we're engineers trying to figure out sales.'",
        severity: 'medium',
        mitigation: 'Pair with sales-focused mentor. Focus first weeks on sales process design.',
      },
      {
        risk: 'Pricing uncertainty',
        evidence: "Michael suspects they're undercharging but has no pricing strategy.",
        severity: 'medium',
        mitigation: 'Run pricing experiments in weeks 3-4. Test 2-3x current pricing with new customers.',
      },
      {
        risk: 'Enterprise readiness gap',
        evidence: 'No self-hosted option, limited database support (no MySQL).',
        severity: 'low',
        mitigation: 'Prioritize based on actual enterprise requirements from pilots.',
      },
    ],

    criticalQuestions: [
      'Can they hire or develop sales capabilities quickly enough?',
      'Will enterprises pay enterprise prices, or is this SMB pricing at scale?',
      'How defensible is the CRDT advantage if well-funded competitors enter?',
    ],

    primaryNeed: 'Go-to-market strategy and sales process',
    secondaryNeeds: ['Pricing strategy', 'Enterprise customer intros'],
    mentorDomains: ['B2B sales', 'Developer tools', 'Enterprise sales'],
    fundraisingTimeline: '4-6 months',

    recommendedStartingStage: 'user_value',
    startingStageRationale:
      'They have users and revenue. Main focus should be on proving unit economics and building a repeatable sales motion before growth.',

    transcriptHighlights: [
      {
        timestamp: '14:03',
        quote: "Their CTO was furious — they'd lost three days of work. I spent the next month building internal tooling.",
        context: 'Strong origin story showing deep personal connection to the problem.',
      },
      {
        timestamp: '14:08',
        quote: "We spend 20% of every sprint just dealing with sync issues. It's become a tax on our velocity.",
        context: 'Compelling user evidence with specific quantification of pain.',
      },
      {
        timestamp: '14:10',
        quote: "If we can't get teams to pay more than $500/month, it means the pain isn't real enough.",
        context: 'Shows good self-awareness and clear falsification criteria.',
      },
    ],

    generatedAt: '2026-01-28T16:00:00Z',
    createdAt: '2026-01-28T16:00:00Z',
    updatedAt: '2026-01-28T16:00:00Z',
  },
]

// -----------------------------------------------------
// PROPOSED PROGRAMMES
// -----------------------------------------------------

export const proposedProgrammes: ProposedProgramme[] = [
  {
    id: 'programme-1',
    assessmentId: 'assessment-1',
    applicationId: 'app-1',
    startingStage: 'user_value',
    totalWeeks: 20,
    programmeRationale:
      'DataSync Pro has users and revenue, so we skip Problem Discovery and Solution Shaping. Focus is on proving user value, building sales motion, and preparing for fundraise.',

    successMetrics: {
      mrr: 15000,
      customers: 30,
      enterprise_pilots: 3,
      retention_d30: 85,
    },

    conditions: [
      { condition: 'Complete pricing experiments by Week 4', dueByWeek: 4 },
      { condition: 'First enterprise pilot signed by Week 8', dueByWeek: 8 },
    ],

    mentorRecommendations: [
      {
        domain: 'B2B Sales',
        priority: 1,
        rationale: 'Founders explicitly lack sales experience. Need hands-on guidance on sales process.',
      },
      {
        domain: 'Developer Tools GTM',
        priority: 2,
        rationale: 'Developer-focused product needs specific GTM playbook.',
      },
      {
        domain: 'Pricing Strategy',
        priority: 3,
        rationale: 'Currently underpricing. Need help with value-based pricing for enterprise.',
      },
    ],

    status: 'draft',
    createdAt: '2026-01-28T16:30:00Z',
    updatedAt: '2026-01-28T16:30:00Z',
  },
]

// -----------------------------------------------------
// PROPOSED PROGRAMME WEEKS
// -----------------------------------------------------

export const proposedProgrammeWeeks: ProposedProgrammeWeek[] = [
  // Weeks 1-4: User Value (starting stage)
  {
    id: 'week-1',
    proposedProgrammeId: 'programme-1',
    weekNumber: 1,
    title: 'Customer Deep Dive',
    goal: 'Understand your best customers and why they stay',
    checkpointQuestion: 'What are the top 3 reasons your best customers love DataSync?',
    focusArea: 'user_value',
    tasks: [
      { task: 'Interview your 5 most engaged customers', required: true },
      { task: 'Document their use cases and success metrics', required: true },
      { task: 'Identify common patterns among best customers', required: false },
    ],
    metricsToTrack: ['customer_interviews', 'nps_score'],
    mentorFocus: 'Customer discovery techniques',
    isMilestone: false,
    milestoneName: null,
    isCustomWeek: false,
    customRationale: null,
    createdAt: '2026-01-28T16:30:00Z',
  },
  {
    id: 'week-2',
    proposedProgrammeId: 'programme-1',
    weekNumber: 2,
    title: 'Value Metric Definition',
    goal: 'Define your north star metric and how to measure it',
    checkpointQuestion: 'What single metric best represents the value you deliver to customers?',
    focusArea: 'user_value',
    tasks: [
      { task: 'Analyze usage data for correlation with retention', required: true },
      { task: 'Define your value metric (e.g., sync operations/month)', required: true },
      { task: 'Set up tracking for value metric', required: true },
    ],
    metricsToTrack: ['value_metric_defined', 'tracking_implemented'],
    mentorFocus: 'Product analytics and metrics',
    isMilestone: false,
    milestoneName: null,
    isCustomWeek: false,
    customRationale: null,
    createdAt: '2026-01-28T16:30:00Z',
  },
  {
    id: 'week-3',
    proposedProgrammeId: 'programme-1',
    weekNumber: 3,
    title: 'Pricing Experiment Design',
    goal: 'Design and launch pricing experiments',
    checkpointQuestion: 'What pricing tiers are you testing and what results do you expect?',
    focusArea: 'user_value',
    tasks: [
      { task: 'Research competitor pricing models', required: true },
      { task: 'Design 3 pricing tiers based on value metric', required: true },
      { task: 'Create A/B test for new pricing on landing page', required: false },
    ],
    metricsToTrack: ['pricing_tiers_designed', 'experiment_launched'],
    mentorFocus: 'Value-based pricing strategies',
    isMilestone: false,
    milestoneName: null,
    isCustomWeek: true,
    customRationale: 'Added due to identified pricing uncertainty risk',
    createdAt: '2026-01-28T16:30:00Z',
  },
  {
    id: 'week-4',
    proposedProgrammeId: 'programme-1',
    weekNumber: 4,
    title: 'Pricing Results & Decision',
    goal: 'Analyze pricing experiment results and set final pricing',
    checkpointQuestion: 'What pricing will you launch with and why?',
    focusArea: 'user_value',
    tasks: [
      { task: 'Analyze pricing experiment results', required: true },
      { task: 'Make pricing decision based on data', required: true },
      { task: 'Update pricing on website and sales materials', required: true },
    ],
    metricsToTrack: ['new_pricing_live', 'conversion_rate_change'],
    mentorFocus: 'Pricing decisions and rollout',
    isMilestone: true,
    milestoneName: 'Pricing validated',
    isCustomWeek: true,
    customRationale: 'Milestone for pricing experiments condition',
    createdAt: '2026-01-28T16:30:00Z',
  },
  // Add more weeks as needed...
]

// -----------------------------------------------------
// GETTER FUNCTIONS
// -----------------------------------------------------

export function getApplicationById(id: string): Application | undefined {
  return applications.find((a) => a.id === id)
}

export function getApplicationsByStatus(status: ApplicationStatus): Application[] {
  return applications.filter((a) => a.status === status)
}

export function getApplicationFounders(applicationId: string): ApplicationFounder[] {
  return applicationFounders.filter((f) => f.applicationId === applicationId)
}

export function getApplicationWithFounders(id: string): ApplicationWithFounders | undefined {
  const application = getApplicationById(id)
  if (!application) return undefined
  return {
    ...application,
    founders: getApplicationFounders(id),
  }
}

export function getAllApplicationsWithFounders(): ApplicationWithFounders[] {
  return applications.map((app) => ({
    ...app,
    founders: getApplicationFounders(app.id),
  }))
}

export function getInterviewById(id: string): Interview | undefined {
  return interviews.find((i) => i.id === id)
}

export function getInterviewByApplicationId(applicationId: string): Interview | undefined {
  return interviews.find((i) => i.applicationId === applicationId)
}

export function getInterviewMessages(interviewId: string): InterviewMessage[] {
  return interviewMessages
    .filter((m) => m.interviewId === interviewId)
    .sort((a, b) => a.sequenceNumber - b.sequenceNumber)
}

export function getInterviewWithMessages(id: string): InterviewWithMessages | undefined {
  const interview = getInterviewById(id)
  if (!interview) return undefined
  return {
    ...interview,
    messages: getInterviewMessages(id),
  }
}

export function getAssessmentById(id: string): Assessment | undefined {
  return assessments.find((a) => a.id === id)
}

export function getAssessmentByApplicationId(applicationId: string): Assessment | undefined {
  return assessments.find((a) => a.applicationId === applicationId)
}

export function getProposedProgrammeById(id: string): ProposedProgramme | undefined {
  return proposedProgrammes.find((p) => p.id === id)
}

export function getProposedProgrammeByApplicationId(applicationId: string): ProposedProgramme | undefined {
  return proposedProgrammes.find((p) => p.applicationId === applicationId)
}

export function getProgrammeWeeks(programmeId: string): ProposedProgrammeWeek[] {
  return proposedProgrammeWeeks
    .filter((w) => w.proposedProgrammeId === programmeId)
    .sort((a, b) => a.weekNumber - b.weekNumber)
}

export function getOnboardingStats() {
  const statusCounts = {
    draft: applications.filter((a) => a.status === 'draft').length,
    submitted: applications.filter((a) => a.status === 'submitted').length,
    interview_scheduled: applications.filter((a) => a.status === 'interview_scheduled').length,
    interview_completed: applications.filter((a) => a.status === 'interview_completed').length,
    under_review: applications.filter((a) => a.status === 'under_review').length,
    approved: applications.filter((a) => a.status === 'approved').length,
    rejected: applications.filter((a) => a.status === 'rejected').length,
  }

  return {
    totalApplications: applications.length,
    pendingReview: statusCounts.interview_completed + statusCounts.under_review,
    awaitingInterview: statusCounts.submitted + statusCounts.interview_scheduled,
    approved: statusCounts.approved,
    rejected: statusCounts.rejected,
    statusCounts,
  }
}
