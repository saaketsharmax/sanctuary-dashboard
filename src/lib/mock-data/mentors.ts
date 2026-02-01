import type {
  Mentor,
  MentorExperience,
  Bottleneck,
  Match,
  MatchWithDetails,
  MentorWithExperiences,
  BottleneckWithMatches,
} from '@/types'
import { startups } from './startups'

// -----------------------------------------------------
// MENTORS
// -----------------------------------------------------

export const mentors: Mentor[] = [
  {
    id: 'mentor-1',
    name: 'Alex Rivera',
    email: 'alex@rivera.vc',
    bio: 'Serial founder with 3 successful exits. Former CEO of DataStream (acquired by Salesforce). Now investing and advising early-stage B2B SaaS companies.',
    linkedinUrl: 'https://linkedin.com/in/alexrivera',
    photoUrl: null,
    isActive: true,
    expertise: ['fundraising', 'finding_pmf', 'scaling_sales'],
    investedStartupIds: ['startup-1', 'startup-3'], // Invested in TechFlow AI and HealthBridge
    availableForInvestment: true,
    checkSize: '$50K-$250K',
    preferredStages: ['problem_discovery', 'solution_shaping', 'user_value'],
    maxActiveMatches: 3,
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'mentor-2',
    name: 'Dr. Maya Patel',
    email: 'maya@patelsales.com',
    bio: 'Enterprise sales leader with 15+ years at Oracle, Stripe, and Snowflake. Built sales teams from 0 to 200. Specializes in complex B2B sales cycles.',
    linkedinUrl: 'https://linkedin.com/in/mayapatel',
    photoUrl: null,
    isActive: true,
    expertise: ['first_customers', 'scaling_sales', 'channel_strategy'],
    investedStartupIds: [],
    availableForInvestment: false,
    checkSize: null,
    preferredStages: ['user_value', 'growth'],
    maxActiveMatches: 2,
    createdAt: '2025-06-15T00:00:00Z',
    updatedAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'mentor-3',
    name: 'James Chen',
    email: 'james@chentech.io',
    bio: 'CTO and technical co-founder of 2 YC companies. Expert in building scalable systems and hiring engineering talent. Previously at Google and Meta.',
    linkedinUrl: 'https://linkedin.com/in/jameschen',
    photoUrl: null,
    isActive: true,
    expertise: ['technical_architecture', 'hiring_key_role', 'product_prioritization'],
    investedStartupIds: ['startup-1'], // Invested in TechFlow AI
    availableForInvestment: true,
    checkSize: '$25K-$100K',
    preferredStages: ['problem_discovery', 'solution_shaping'],
    maxActiveMatches: 4,
    createdAt: '2025-07-01T00:00:00Z',
    updatedAt: '2025-07-01T00:00:00Z',
  },
  {
    id: 'mentor-4',
    name: 'Sarah Mitchell',
    email: 'sarah@gtmstrategy.co',
    bio: 'Growth and GTM expert. Built marketing at 3 unicorns. Specializes in B2B SaaS go-to-market strategy and brand positioning.',
    linkedinUrl: 'https://linkedin.com/in/sarahmitchell',
    photoUrl: null,
    isActive: true,
    expertise: ['market_positioning', 'channel_strategy', 'first_customers'],
    investedStartupIds: ['startup-2'], // Invested in GreenCommute
    availableForInvestment: true,
    checkSize: '$10K-$50K',
    preferredStages: ['solution_shaping', 'user_value', 'growth'],
    maxActiveMatches: 3,
    createdAt: '2025-07-15T00:00:00Z',
    updatedAt: '2025-07-15T00:00:00Z',
  },
  {
    id: 'mentor-5',
    name: 'Marcus Johnson',
    email: 'marcus@opsexcellence.com',
    bio: 'Operations wizard. Scaled operations at Uber and DoorDash. Expert in unit economics, supply chain, and operational efficiency.',
    linkedinUrl: 'https://linkedin.com/in/marcusjohnson',
    photoUrl: null,
    isActive: true,
    expertise: ['operational_scaling', 'unit_economics', 'scaling_sales'],
    investedStartupIds: [],
    availableForInvestment: true,
    checkSize: '$100K-$500K',
    preferredStages: ['growth', 'capital_ready'],
    maxActiveMatches: 2,
    createdAt: '2025-08-01T00:00:00Z',
    updatedAt: '2025-08-01T00:00:00Z',
  },
  {
    id: 'mentor-6',
    name: 'Lisa Wang',
    email: 'lisa@productleader.io',
    bio: 'Product leader with experience at Airbnb, Notion, and Figma. Expert in finding PMF and building products users love.',
    linkedinUrl: 'https://linkedin.com/in/lisawang',
    photoUrl: null,
    isActive: true,
    expertise: ['finding_pmf', 'product_prioritization', 'first_customers'],
    investedStartupIds: ['startup-4'], // Invested in FinLit
    availableForInvestment: true,
    checkSize: '$25K-$75K',
    preferredStages: ['problem_discovery', 'solution_shaping', 'user_value'],
    maxActiveMatches: 3,
    createdAt: '2025-08-15T00:00:00Z',
    updatedAt: '2025-08-15T00:00:00Z',
  },
  {
    id: 'mentor-7',
    name: 'David Kim',
    email: 'david@peopleops.co',
    bio: 'People and culture expert. Former VP People at Stripe and Coinbase. Specializes in building high-performance teams and culture.',
    linkedinUrl: 'https://linkedin.com/in/davidkim',
    photoUrl: null,
    isActive: true,
    expertise: ['hiring_key_role', 'team_dynamics', 'operational_scaling'],
    investedStartupIds: [],
    availableForInvestment: false,
    checkSize: null,
    preferredStages: ['solution_shaping', 'user_value', 'growth'],
    maxActiveMatches: 2,
    createdAt: '2025-09-01T00:00:00Z',
    updatedAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'mentor-8',
    name: 'Rachel Torres',
    email: 'rachel@pivotmaster.co',
    bio: 'Pivot specialist. Led 3 successful pivots including one that resulted in a $500M exit. Expert in recognizing when and how to pivot.',
    linkedinUrl: 'https://linkedin.com/in/racheltorres',
    photoUrl: null,
    isActive: true,
    expertise: ['pivoting', 'finding_pmf', 'fundraising'],
    investedStartupIds: ['startup-5'], // Invested in BuildRight
    availableForInvestment: true,
    checkSize: '$50K-$200K',
    preferredStages: ['problem_discovery', 'solution_shaping'],
    maxActiveMatches: 2,
    createdAt: '2025-09-15T00:00:00Z',
    updatedAt: '2025-09-15T00:00:00Z',
  },
]

// -----------------------------------------------------
// MENTOR EXPERIENCES
// -----------------------------------------------------

export const mentorExperiences: MentorExperience[] = [
  // Alex Rivera experiences
  {
    id: 'exp-1',
    mentorId: 'mentor-1',
    problemArchetype: 'fundraising',
    problemStatement: 'Struggling to close Series A despite strong metrics',
    context: 'CEO at DataStream, Series A stage, 2019. We had $1M ARR but kept getting "not yet" from VCs.',
    solution: 'Shifted narrative from features to market timing. Created urgency by showing competitor funding. Targeted VCs who had lost deals in our space.',
    outcomes: 'Closed $12M Series A in 6 weeks. 3x oversubscribed.',
    yearOccurred: 2019,
    companyStage: 'solution_shaping',
    createdAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 'exp-2',
    mentorId: 'mentor-1',
    problemArchetype: 'finding_pmf',
    problemStatement: 'Product had users but no clear path to revenue',
    context: 'CEO at my first startup, 2015. Lots of free users, nobody willing to pay.',
    solution: 'Did 50 customer interviews to find the "hair on fire" problem. Rebuilt core feature around that pain point. Charged 10x what we thought we could.',
    outcomes: 'First paying customer within 2 weeks. $100K ARR in 3 months.',
    yearOccurred: 2015,
    companyStage: 'problem_discovery',
    createdAt: '2025-06-01T00:00:00Z',
  },
  // Maya Patel experiences
  {
    id: 'exp-3',
    mentorId: 'mentor-2',
    problemArchetype: 'first_customers',
    problemStatement: 'Cannot get past the gatekeeper to decision makers',
    context: 'VP Sales at early Stripe, 2014. Enterprise deals kept dying at procurement.',
    solution: 'Built champion program. Gave internal advocates ammunition (ROI calcs, case studies). Created executive-to-executive intro program.',
    outcomes: 'Reduced sales cycle from 9 months to 3 months. Closed first Fortune 500.',
    yearOccurred: 2014,
    companyStage: 'user_value',
    createdAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'exp-4',
    mentorId: 'mentor-2',
    problemArchetype: 'scaling_sales',
    problemStatement: 'Founder-led sales not scaling, reps failing',
    context: 'Sales Leader at Snowflake, 2018. Hired 10 reps, 8 failed in first quarter.',
    solution: 'Created sales playbook from founder deals. Built shadowing program. Changed comp to favor learning over closing in first 90 days.',
    outcomes: 'Next cohort: 9/10 hit quota. Built repeatable hiring process.',
    yearOccurred: 2018,
    companyStage: 'growth',
    createdAt: '2025-06-15T00:00:00Z',
  },
  // James Chen experiences
  {
    id: 'exp-5',
    mentorId: 'mentor-3',
    problemArchetype: 'technical_architecture',
    problemStatement: 'System cannot handle 10x growth, constant outages',
    context: 'CTO at YC startup, 2020. Growth broke everything. Team firefighting daily.',
    solution: 'Paused features for 6 weeks. Re-architected to microservices. Implemented proper monitoring and auto-scaling. Hired SRE.',
    outcomes: 'Zero outages in next 12 months. Handled 50x growth.',
    yearOccurred: 2020,
    companyStage: 'growth',
    createdAt: '2025-07-01T00:00:00Z',
  },
  {
    id: 'exp-6',
    mentorId: 'mentor-3',
    problemArchetype: 'hiring_key_role',
    problemStatement: 'Cannot close senior engineering hires',
    context: 'CTO at seed stage, 2021. Losing every candidate to FAANG offers.',
    solution: 'Stopped competing on comp. Sold mission and ownership. Gave real technical challenges in interview. Moved fast - offer in 48 hours.',
    outcomes: 'Hired 5 senior engineers in 2 months. All still at company.',
    yearOccurred: 2021,
    companyStage: 'solution_shaping',
    createdAt: '2025-07-01T00:00:00Z',
  },
  // Sarah Mitchell experiences
  {
    id: 'exp-7',
    mentorId: 'mentor-4',
    problemArchetype: 'market_positioning',
    problemStatement: 'Lost in a crowded market, no differentiation',
    context: 'VP Marketing at B2B startup, 2019. 50+ competitors, all saying same thing.',
    solution: 'Found underserved niche (mid-market fintech). Became "the X for Y" of that segment. All content targeted that persona.',
    outcomes: 'Became category leader in niche. 5x pipeline in 6 months.',
    yearOccurred: 2019,
    companyStage: 'user_value',
    createdAt: '2025-07-15T00:00:00Z',
  },
  {
    id: 'exp-8',
    mentorId: 'mentor-4',
    problemArchetype: 'channel_strategy',
    problemStatement: 'Paid acquisition too expensive, CAC payback 24+ months',
    context: 'Growth lead at SaaS startup, 2020. Burning cash on Google Ads.',
    solution: 'Shifted to partnerships and content. Built integration ecosystem. Created SEO-driven comparison pages.',
    outcomes: 'Reduced CAC by 70%. Organic became 60% of pipeline.',
    yearOccurred: 2020,
    companyStage: 'growth',
    createdAt: '2025-07-15T00:00:00Z',
  },
  // Marcus Johnson experiences
  {
    id: 'exp-9',
    mentorId: 'mentor-5',
    problemArchetype: 'unit_economics',
    problemStatement: 'Growing revenue but losing more money per customer',
    context: 'Operations at food delivery startup, 2018. Every order lost $5.',
    solution: 'Mapped full cost structure. Renegotiated delivery partner deals. Implemented dynamic pricing. Cut low-margin markets.',
    outcomes: 'Positive unit economics in 4 months. Path to profitability.',
    yearOccurred: 2018,
    companyStage: 'growth',
    createdAt: '2025-08-01T00:00:00Z',
  },
  {
    id: 'exp-10',
    mentorId: 'mentor-5',
    problemArchetype: 'operational_scaling',
    problemStatement: 'Operations team drowning, everything manual',
    context: 'Ops lead at Uber Eats, 2017. Team working 80-hour weeks.',
    solution: 'Identified 5 highest-impact automations. Built internal tools team. Created ops playbooks for every scenario.',
    outcomes: '10x order volume with same team size. Team back to 45-hour weeks.',
    yearOccurred: 2017,
    companyStage: 'growth',
    createdAt: '2025-08-01T00:00:00Z',
  },
  // Lisa Wang experiences
  {
    id: 'exp-11',
    mentorId: 'mentor-6',
    problemArchetype: 'finding_pmf',
    problemStatement: 'Users sign up but never come back',
    context: 'Product lead at Notion, 2018. Great first impression, terrible retention.',
    solution: 'Identified "aha moment" through data. Redesigned onboarding to reach it faster. Added templates for immediate value.',
    outcomes: 'D7 retention went from 15% to 45%. PMF achieved.',
    yearOccurred: 2018,
    companyStage: 'user_value',
    createdAt: '2025-08-15T00:00:00Z',
  },
  {
    id: 'exp-12',
    mentorId: 'mentor-6',
    problemArchetype: 'product_prioritization',
    problemStatement: 'Team pulled in 100 directions, shipping nothing',
    context: 'PM at Airbnb, 2016. Stakeholders demanding everything.',
    solution: 'Implemented RICE scoring. Created "bet" framework - 70% core, 20% adjacent, 10% experiments. Weekly prioritization reviews.',
    outcomes: 'Shipped 3x more features. Team morale improved.',
    yearOccurred: 2016,
    companyStage: 'growth',
    createdAt: '2025-08-15T00:00:00Z',
  },
  // David Kim experiences
  {
    id: 'exp-13',
    mentorId: 'mentor-7',
    problemArchetype: 'team_dynamics',
    problemStatement: 'Co-founder conflict threatening to break company apart',
    context: 'HR advisor to YC startup, 2021. Technical and business co-founder at war.',
    solution: 'Facilitated structured conversation. Created clear swim lanes. Established decision-making framework. Weekly alignment meetings.',
    outcomes: 'Co-founders working effectively. Company raised Series B.',
    yearOccurred: 2021,
    companyStage: 'solution_shaping',
    createdAt: '2025-09-01T00:00:00Z',
  },
  {
    id: 'exp-14',
    mentorId: 'mentor-7',
    problemArchetype: 'hiring_key_role',
    problemStatement: 'First VP hire failed catastrophically',
    context: 'VP People at Coinbase, 2019. New VP Sales lasted 3 months.',
    solution: 'Created "working session" interview stage. Added founder-fit assessment. Implemented 90-day check-ins with clear milestones.',
    outcomes: 'Next 5 VP hires all successful. Created repeatable process.',
    yearOccurred: 2019,
    companyStage: 'growth',
    createdAt: '2025-09-01T00:00:00Z',
  },
  // Rachel Torres experiences
  {
    id: 'exp-15',
    mentorId: 'mentor-8',
    problemArchetype: 'pivoting',
    problemStatement: 'Market disappeared, need to find new direction fast',
    context: 'CEO at travel startup, 2020. COVID killed our market overnight.',
    solution: 'Ran rapid customer discovery (50 calls in 2 weeks). Found adjacent problem. Pivoted entire product in 6 weeks.',
    outcomes: '$500M exit 2 years later in new market.',
    yearOccurred: 2020,
    companyStage: 'growth',
    createdAt: '2025-09-15T00:00:00Z',
  },
  {
    id: 'exp-16',
    mentorId: 'mentor-8',
    problemArchetype: 'finding_pmf',
    problemStatement: 'Built for wrong customer, need to find right one',
    context: 'Founder at enterprise SaaS, 2017. SMBs loved it but wouldn\'t pay. Enterprise paid but sales cycle too long.',
    solution: 'Identified mid-market sweet spot. Rebuilt for their specific needs. Created land-and-expand motion.',
    outcomes: 'Found PMF in mid-market. $10M ARR in 18 months.',
    yearOccurred: 2017,
    companyStage: 'solution_shaping',
    createdAt: '2025-09-15T00:00:00Z',
  },
]

// -----------------------------------------------------
// BOTTLENECKS
// -----------------------------------------------------

export const bottlenecks: Bottleneck[] = [
  {
    id: 'bottleneck-1',
    startupId: 'startup-1', // TechFlow AI
    problemArchetype: 'scaling_sales',
    rawBlocker: 'We have strong product-market fit with our AI workflow tool, but our founder-led sales approach is hitting a ceiling. I\'m doing all the demos and closing, and I can\'t scale myself. We tried hiring 2 sales reps but both failed within 60 days.',
    rawAttempts: 'Hired 2 salespeople from job boards. Created a basic sales deck. Tried to document my sales process but reps couldn\'t replicate it. Also tried outbound email campaigns but response rates were terrible.',
    rawSuccessCriteria: 'Have 2 reps consistently hitting $50K MRR quota each within 6 months. Reduce my involvement in sales to <20% of my time.',
    status: 'matched',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'bottleneck-2',
    startupId: 'startup-2', // GreenCommute
    problemArchetype: 'first_customers',
    rawBlocker: 'We have a great sustainable commuting platform but can\'t get past procurement at large companies. HR loves us but it dies when it gets to IT security review or procurement. Been stuck at 5 pilot customers for 3 months.',
    rawAttempts: 'Created SOC2 compliance docs. Built security whitepaper. Tried to find champions internally. Attempted to go around procurement by starting with smaller teams.',
    rawSuccessCriteria: 'Close 3 enterprise customers (1000+ employees) with full contracts in next 4 months.',
    status: 'matched',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  },
  {
    id: 'bottleneck-3',
    startupId: 'startup-4', // FinLit
    problemArchetype: 'finding_pmf',
    rawBlocker: 'We have 8500 users on our financial literacy app but only 280 paying. Users love the free content but won\'t convert to premium. Not sure if we have a pricing problem, value proposition problem, or if we\'re targeting wrong users.',
    rawAttempts: 'Tried different price points ($5, $10, $20/month). Created more premium content. Added gamification. Sent conversion emails. Nothing moved the needle significantly.',
    rawSuccessCriteria: 'Achieve 5% free-to-paid conversion rate (currently 3.3%) and understand what drives conversions.',
    status: 'matched',
    createdAt: '2026-01-08T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
]

// -----------------------------------------------------
// MATCHES (Pre-computed)
// -----------------------------------------------------

export const matches: Match[] = [
  // Matches for TechFlow AI (scaling_sales)
  {
    id: 'match-1',
    bottleneckId: 'bottleneck-1',
    experienceId: 'exp-4', // Maya - scaling sales at Snowflake
    mentorId: 'mentor-2',
    score: 87,
    confidence: 'high',
    explanation: 'Maya faced the exact same challenge at Snowflake - transitioning from founder-led sales to a scalable team. Her approach of building a playbook from founder deals and changing the comp structure to favor learning directly addresses your rep failure pattern.',
    reasoning: {
      scores: {
        problemShape: 92,
        constraintAlignment: 85,
        stageRelevance: 88,
        experienceDepth: 82,
        recency: 85,
      },
      keyAlignments: [
        'Both faced founder-led sales ceiling with early rep failures',
        'Similar stage - transitioning from PMF to scaling',
        'B2B SaaS context matches',
      ],
      concerns: [
        'Snowflake was larger at this stage - some tactics may need adaptation',
      ],
    },
    status: 'pending',
    operatorNotes: null,
    introSentAt: null,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'match-2',
    bottleneckId: 'bottleneck-1',
    experienceId: 'exp-1', // Alex - fundraising (adjacent)
    mentorId: 'mentor-1',
    score: 68,
    confidence: 'medium',
    explanation: 'While Alex\'s direct experience is in fundraising, he built and scaled sales teams at DataStream. His pattern of creating urgency and targeting the right buyers could apply to enterprise sales motion.',
    reasoning: {
      scores: {
        problemShape: 65,
        constraintAlignment: 70,
        stageRelevance: 75,
        experienceDepth: 60,
        recency: 80,
      },
      keyAlignments: [
        'Built B2B sales function from scratch',
        'Understands founder-to-team transition',
      ],
      concerns: [
        'Primary expertise is fundraising, not sales operations',
        'May be too strategic, less tactical',
      ],
    },
    status: 'pending',
    operatorNotes: null,
    introSentAt: null,
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-01-20T00:00:00Z',
  },
  // Matches for GreenCommute (first_customers)
  {
    id: 'match-3',
    bottleneckId: 'bottleneck-2',
    experienceId: 'exp-3', // Maya - first customers at Stripe
    mentorId: 'mentor-2',
    score: 91,
    confidence: 'high',
    explanation: 'Maya\'s experience getting past gatekeepers at Stripe is directly applicable. Her champion program and executive-to-executive intro strategy addresses exactly the procurement blocker you\'re facing.',
    reasoning: {
      scores: {
        problemShape: 95,
        constraintAlignment: 90,
        stageRelevance: 92,
        experienceDepth: 88,
        recency: 80,
      },
      keyAlignments: [
        'Identical problem - stuck at procurement',
        'Same solution pattern - champion building',
        'Enterprise B2B context matches',
      ],
      concerns: [
        'Stripe had stronger brand - may need to adapt for earlier stage',
      ],
    },
    status: 'approved',
    operatorNotes: 'Strong match, Maya confirmed availability',
    introSentAt: null,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-22T00:00:00Z',
  },
  {
    id: 'match-4',
    bottleneckId: 'bottleneck-2',
    experienceId: 'exp-7', // Sarah - market positioning
    mentorId: 'mentor-4',
    score: 72,
    confidence: 'medium',
    explanation: 'Sarah\'s experience in finding underserved niches could help reframe the positioning to make enterprise sales easier. Her approach of becoming "the X for Y" could help GreenCommute own a specific segment.',
    reasoning: {
      scores: {
        problemShape: 70,
        constraintAlignment: 75,
        stageRelevance: 80,
        experienceDepth: 65,
        recency: 78,
      },
      keyAlignments: [
        'Positioning expertise could reduce sales friction',
        'B2B context matches',
      ],
      concerns: [
        'More strategic than tactical on sales execution',
        'Different core problem archetype',
      ],
    },
    status: 'pending',
    operatorNotes: null,
    introSentAt: null,
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-01-18T00:00:00Z',
  },
  // Matches for FinLit (finding_pmf)
  {
    id: 'match-5',
    bottleneckId: 'bottleneck-3',
    experienceId: 'exp-11', // Lisa - finding PMF at Notion
    mentorId: 'mentor-6',
    score: 89,
    confidence: 'high',
    explanation: 'Lisa\'s experience at Notion with retention and conversion is highly relevant. Her approach of finding the "aha moment" and redesigning onboarding directly addresses your conversion challenge.',
    reasoning: {
      scores: {
        problemShape: 93,
        constraintAlignment: 88,
        stageRelevance: 90,
        experienceDepth: 85,
        recency: 82,
      },
      keyAlignments: [
        'Same pattern - free users not converting',
        'Consumer/prosumer context similar',
        'Onboarding-focused solution applicable',
      ],
      concerns: [
        'Notion had viral component - FinLit may need different activation',
      ],
    },
    status: 'pending',
    operatorNotes: null,
    introSentAt: null,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'match-6',
    bottleneckId: 'bottleneck-3',
    experienceId: 'exp-2', // Alex - finding PMF
    mentorId: 'mentor-1',
    score: 82,
    confidence: 'high',
    explanation: 'Alex faced similar challenge - users but no revenue. His approach of finding the "hair on fire" problem through customer interviews and charging 10x more could help FinLit find the right premium value proposition.',
    reasoning: {
      scores: {
        problemShape: 88,
        constraintAlignment: 80,
        stageRelevance: 85,
        experienceDepth: 78,
        recency: 75,
      },
      keyAlignments: [
        'Same pattern - users but no paying customers',
        'Customer interview approach applicable',
        'Pricing insight relevant',
      ],
      concerns: [
        'B2B context vs B2C - some adaptation needed',
        'Experience is older (2015)',
      ],
    },
    status: 'pending',
    operatorNotes: null,
    introSentAt: null,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
  {
    id: 'match-7',
    bottleneckId: 'bottleneck-3',
    experienceId: 'exp-16', // Rachel - finding PMF (wrong customer)
    mentorId: 'mentor-8',
    score: 78,
    confidence: 'medium',
    explanation: 'Rachel\'s experience of building for the wrong customer segment is relevant. Her pivot to mid-market approach could help FinLit identify the right paying customer segment.',
    reasoning: {
      scores: {
        problemShape: 82,
        constraintAlignment: 75,
        stageRelevance: 80,
        experienceDepth: 72,
        recency: 78,
      },
      keyAlignments: [
        'Experience with customer segment misalignment',
        'Land-and-expand motion could apply',
      ],
      concerns: [
        'Enterprise SaaS context different from consumer app',
        'May suggest more dramatic pivot than needed',
      ],
    },
    status: 'pending',
    operatorNotes: null,
    introSentAt: null,
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-01-15T00:00:00Z',
  },
]

// -----------------------------------------------------
// GETTER FUNCTIONS
// -----------------------------------------------------

export function getMentorById(id: string): Mentor | undefined {
  return mentors.find((m) => m.id === id)
}

export function getMentorByEmail(email: string): Mentor | undefined {
  return mentors.find((m) => m.email === email)
}

export function getActiveMentors(): Mentor[] {
  return mentors.filter((m) => m.isActive)
}

export function getMentorsByExpertise(archetype: string): Mentor[] {
  return mentors.filter((m) => m.expertise.includes(archetype as any))
}

export function getMentorWithExperiences(id: string): MentorWithExperiences | undefined {
  const mentor = getMentorById(id)
  if (!mentor) return undefined
  return {
    ...mentor,
    experiences: getExperiencesByMentorId(id),
  }
}

export function getExperienceById(id: string): MentorExperience | undefined {
  return mentorExperiences.find((e) => e.id === id)
}

export function getExperiencesByMentorId(mentorId: string): MentorExperience[] {
  return mentorExperiences.filter((e) => e.mentorId === mentorId)
}

export function getBottleneckById(id: string): Bottleneck | undefined {
  return bottlenecks.find((b) => b.id === id)
}

export function getBottlenecksByStartupId(startupId: string): Bottleneck[] {
  return bottlenecks.filter((b) => b.startupId === startupId)
}

export function getBottleneckWithMatches(id: string): BottleneckWithMatches | undefined {
  const bottleneck = getBottleneckById(id)
  if (!bottleneck) return undefined
  return {
    ...bottleneck,
    matches: getMatchesByBottleneckId(id),
  }
}

export function getMatchById(id: string): Match | undefined {
  return matches.find((m) => m.id === id)
}

export function getMatchesByBottleneckId(bottleneckId: string): Match[] {
  return matches.filter((m) => m.bottleneckId === bottleneckId).sort((a, b) => b.score - a.score)
}

export function getMatchesByMentorId(mentorId: string): Match[] {
  return matches.filter((m) => m.mentorId === mentorId)
}

export function getPendingMatches(): Match[] {
  return matches.filter((m) => m.status === 'pending').sort((a, b) => b.score - a.score)
}

export function getMatchWithDetails(id: string): MatchWithDetails | undefined {
  const match = getMatchById(id)
  if (!match) return undefined

  const mentor = getMentorById(match.mentorId)
  const experience = getExperienceById(match.experienceId)
  const bottleneck = getBottleneckById(match.bottleneckId)
  const startup = bottleneck ? startups.find((s) => s.id === bottleneck.startupId) : undefined

  if (!mentor || !experience || !bottleneck || !startup) return undefined

  return {
    ...match,
    mentor,
    experience,
    bottleneck,
    startup,
  }
}

export function getMatchStats() {
  return {
    total: matches.length,
    pending: matches.filter((m) => m.status === 'pending').length,
    approved: matches.filter((m) => m.status === 'approved').length,
    introsSent: matches.filter((m) => m.status === 'intro_sent').length,
    completed: matches.filter((m) => m.status === 'completed').length,
    rejected: matches.filter((m) => m.status === 'rejected').length,
    averageScore: Math.round(matches.reduce((sum, m) => sum + m.score, 0) / matches.length),
    highConfidence: matches.filter((m) => m.confidence === 'high').length,
    mediumConfidence: matches.filter((m) => m.confidence === 'medium').length,
    lowConfidence: matches.filter((m) => m.confidence === 'low').length,
  }
}
