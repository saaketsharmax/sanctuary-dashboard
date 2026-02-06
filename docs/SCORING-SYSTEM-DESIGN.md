# Sanctuary Assessment Scoring System

## Overview

This document defines the scoring methodology for evaluating startup applications based on interview data. The system is designed to be:
- **Transparent** - Clear criteria for each score
- **Evidence-based** - Grounded in research on startup success factors
- **Calibrated** - Consistent scoring across different evaluators/runs

---

## The Four Dimensions

### 1. Founder Score (Weight: 30%)

**What it measures:** The founder(s)' likelihood of succeeding regardless of the specific idea.

**Research basis:**
- First Round Capital found that repeat founders are 2.5x more likely to succeed
- YC emphasizes "determination" as the #1 predictor
- Paul Graham: "The most important quality in a startup founder is determination"

**Scoring Rubric:**

| Score Range | Description |
|-------------|-------------|
| 90-100 | Exceptional founder. Prior successful exit, deep domain expertise, demonstrated grit through adversity |
| 80-89 | Strong founder. Relevant experience, clear founder-problem fit, evidence of resourcefulness |
| 70-79 | Good founder. Some relevant background, shows determination, but gaps in experience |
| 60-69 | Average founder. Limited relevant experience, potential but unproven |
| Below 60 | Weak signals. No clear founder-problem fit, concerning patterns |

**Interview Signals to Extract:**

| Signal | Impact | Example |
|--------|--------|---------|
| Prior exit | +15 | "We sold our last company to GitLab" |
| Years in domain | +2/year (max +10) | "I've been in DevOps for 8 years" |
| Worked at relevant company | +5 | "I was at Stripe building payments" |
| Faced and overcame adversity | +5 | "We ran out of money and I took a second job while building" |
| Co-founder conflict resolution | +5 | Healthy disagreement patterns |
| Technical + business balance | +5 | Complementary skills in team |
| Unclear role division | -5 | Both founders doing same thing |
| Blames external factors | -10 | "The market wasn't ready" without self-reflection |
| Gives up easily | -15 | Pattern of abandoning projects |

---

### 2. Problem Score (Weight: 25%)

**What it measures:** Is this a real problem worth solving? How validated is it?

**Research basis:**
- CB Insights: 42% of startups fail due to "no market need"
- Startup Genome: Companies that pivot 1-2 times raise 2.5x more money
- Customer discovery depth correlates with Series A success

**Scoring Rubric:**

| Score Range | Description |
|-------------|-------------|
| 90-100 | Deeply validated. 50+ customer conversations, paying customers, quantified pain |
| 80-89 | Well validated. 20+ conversations, clear pain points, some willingness to pay |
| 70-79 | Partially validated. 10+ conversations, problem exists but severity unclear |
| 60-69 | Lightly validated. Few conversations, mostly assumptions |
| Below 60 | Not validated. Building on intuition, no customer evidence |

**Interview Signals to Extract:**

| Signal | Impact | Example |
|--------|--------|---------|
| Customer discovery calls (qty) | +1/call (max +20) | "We've done 47 customer interviews" |
| Specific pain quote | +5 each (max +15) | "One CTO said 'I'd pay $10k/month for this'" |
| Quantified pain | +10 | "Teams lose 20% of sprints to this issue" |
| Personal experience of problem | +5 | "I dealt with this for 3 years at my last job" |
| Problem frequency | +5 (daily) / +3 (weekly) | "This happens every single deploy" |
| Problem severity | +10 (hair on fire) | "Production goes down when this fails" |
| Vague problem statement | -5 | "Companies need better tools" |
| No customer evidence | -15 | "We haven't talked to customers yet" |
| Solution looking for problem | -10 | "We built the tech and now finding use cases" |

---

### 3. User Value Score (Weight: 25%)

**What it measures:** Do users/customers actually get value? Is there evidence of product-market fit?

**Research basis:**
- Superhuman's PMF survey: "How disappointed if you couldn't use this?"
- Sean Ellis: 40% "very disappointed" = PMF
- Revenue is the ultimate validation of value

**Scoring Rubric:**

| Score Range | Description |
|-------------|-------------|
| 90-100 | Strong PMF signals. Growing revenue, retention >80%, users actively refer others |
| 80-89 | Early PMF. Paying users, good retention, organic growth |
| 70-79 | Value validated. Users engaged, some paying, retention needs work |
| 60-69 | Potential value. Users trying it, limited retention data |
| Below 60 | Unproven value. No users, or users not retained |

**Interview Signals to Extract:**

| Signal | Impact | Example |
|--------|--------|---------|
| Paying customers | +3/customer (max +15) | "We have 12 paying customers" |
| MRR | +1/100 MRR (max +20) | "$2,400 MRR" |
| User retention rate | +0.5/% (max +15) | "85% monthly retention" |
| Organic/referral growth | +10 | "40% of users come from referrals" |
| Usage frequency | +5 (daily) / +2 (weekly) | "Users are in the product daily" |
| Specific user quote | +5 | "They said they couldn't go back to the old way" |
| Clear value metric | +5 | "We save them 10 hours per week" |
| No paying users | -10 | "It's free right now" |
| High churn | -10 | "We lose 30% monthly" |
| Users don't return | -15 | "Most users try once and leave" |

---

### 4. Execution Score (Weight: 20%)

**What it measures:** Can this team actually build and ship? Do they make good decisions?

**Research basis:**
- Speed of iteration is highly correlated with success
- Startup Genome: Premature scaling is #1 cause of death
- YC: "Launch early, iterate fast"

**Scoring Rubric:**

| Score Range | Description |
|-------------|-------------|
| 90-100 | Exceptional execution. Shipped fast, smart pivots, efficient use of resources |
| 80-89 | Strong execution. Good shipping cadence, makes data-driven decisions |
| 70-79 | Decent execution. Shipping but slower, some good decisions |
| 60-69 | Weak execution. Slow to ship, unclear prioritization |
| Below 60 | Poor execution. Stuck in building, no shipping, bad decisions |

**Interview Signals to Extract:**

| Signal | Impact | Example |
|--------|--------|---------|
| Time to first user/customer | +10 (<6mo) / +5 (6-12mo) | "We got our first user in 3 months" |
| Iteration speed | +5 | "We ship every week" |
| Smart pivot/cut | +5 each | "We killed feature X when data showed..." |
| Data-driven decisions | +5 | "We A/B tested and found..." |
| Lean burn rate | +5 | "We've spent only $20k so far" |
| Clear milestones | +5 | "In 6 months we want to hit $10k MRR" |
| Slow shipping | -5 | "We've been building for 2 years" |
| Feature creep | -5 | "We're adding X, Y, Z before launch" |
| No clear priorities | -10 | Can't articulate what's most important |
| Premature scaling | -10 | "We hired 5 people before product-market fit" |

---

## Overall Score Calculation

```
Overall = (Founder × 0.30) + (Problem × 0.25) + (User Value × 0.25) + (Execution × 0.20)
```

**Recommendation Mapping:**

| Overall Score | Recommendation | Confidence Threshold |
|--------------|----------------|---------------------|
| 85+ | Strong Accept | High (>0.8) |
| 75-84 | Accept | Medium (0.6-0.8) |
| 65-74 | Conditional Accept | Requires discussion |
| 55-64 | Lean Decline | Medium |
| Below 55 | Decline | High |

---

## Calibration Approach

### Option 1: Historical Calibration (if data exists)
1. Score 20-30 past applications manually
2. Compare scores to actual outcomes (accepted, success, failed)
3. Adjust weights and thresholds

### Option 2: Expert Calibration
1. Have 3 partners independently score 10 sample applications
2. Discuss disagreements, align on interpretation
3. Create "anchor" examples for each score range

### Option 3: Continuous Calibration
1. Track AI scores vs. human reviewer decisions
2. Identify systematic biases
3. Adjust prompts/weights quarterly

---

## Implementation Notes

### For the Assessment Agent

The agent should:
1. Extract all signals from interview transcript
2. Calculate dimension scores based on signal impacts
3. Apply diminishing returns (don't let one signal dominate)
4. Generate reasoning explaining the score
5. Flag low-confidence assessments for human review

### Signal Extraction Prompt Structure

```
For each dimension, extract:
1. Positive signals (with specific quotes/evidence)
2. Negative signals (with specific quotes/evidence)
3. Missing information (things we didn't learn)
4. Confidence level (based on evidence density)
```

### Score Normalization

- Base score: 50 (neutral)
- Max positive impact per signal: capped to prevent gaming
- Signals have diminishing returns (3rd similar signal worth less than 1st)
- Missing critical information should lower confidence, not score

---

## Open Questions

1. **Should weights vary by stage?** A pre-revenue startup should weight Problem higher, post-revenue should weight User Value higher.

2. **How to handle co-founders?** Average individual scores? Weight by equity split?

3. **Industry adjustments?** B2B vs B2C have different benchmarks for "good" metrics.

4. **Confidence scoring?** How do we express uncertainty when interview data is thin?

---

## Next Steps

1. [ ] Validate rubric with Sanctuary partners
2. [ ] Create 5-10 "anchor" examples at different score levels
3. [ ] Build Assessment Agent with this framework
4. [ ] Test on historical applications (if available)
5. [ ] Iterate based on human reviewer feedback
