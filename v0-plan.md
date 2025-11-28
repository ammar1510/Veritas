# Veritas v0 Plan

## Executive Summary

Build a **historical timeline generator** that proves the core multi-agent architecture works. Focus on completed events with known outcomes to validate information synthesis and branch detection before tackling real-time complexity.

## v0 Scope Boundaries

### IN SCOPE
- Historical/completed events only (no real-time streaming)
- English-only sources
- Single timeline generation per request
- Simple source credibility (hardcoded scores for major outlets)
- Manual event discovery (user provides key events OR Pro does basic discovery)
- Branch detection for conflicting narratives
- Basic web UI to visualize timeline

### OUT OF SCOPE
- Real-time monitoring and updates
- Multilingual support and cross-lingual normalization
- ML-based credibility scoring
- User accounts, premium features, or community submissions
- Mobile apps
- Advanced bias analysis
- Fact-checking automated systems

## Architecture

### Tech Stack

**Backend:**
- Python 3.11+ (FastAPI for API)
- Gemini Pro (orchestrator agent)
- Gemini Flash (worker subagents)
- PostgreSQL (timeline storage)
- Redis (caching web fetches, rate limiting)

**Frontend:**
- React + TypeScript
- D3.js or vis.js (timeline visualization)
- Tailwind CSS

**Infrastructure:**
- Vercel/Railway (hosting)
- Supabase or managed PostgreSQL

### Agent Architecture

```
User Request: "Build timeline on Notre Dame Fire 2019"
    ↓
[GEMINI PRO - Orchestrator]
    │
    ├─ Phase 1: Skeleton Discovery
    │   • Identify 5-10 anchor events
    │   • Gather key dates and actors
    │   • Output: Rough timeline structure
    │
    ├─ Phase 2: Parallel Investigation (spawn Flash subagents)
    │   ├─ Flash Agent 1: "Fire outbreak & initial response"
    │   ├─ Flash Agent 2: "Cause investigation claims"
    │   ├─ Flash Agent 3: "Damage assessment reports"
    │   ├─ Flash Agent 4: "Reconstruction announcements"
    │   └─ Flash Agent 5: "Political responses"
    │       Each returns: sources, claims, timestamps, conflicts
    │
    ├─ Phase 3: Synthesis & Branch Detection
    │   • Merge subagent findings
    │   • Detect narrative divergences
    │   • Assign credibility to branches
    │   • Build final timeline structure
    │
    └─ Phase 4: Output
        • JSON timeline with events, sources, branches
        • Store in database
        • Return to frontend
```

## Phase Breakdown

### Phase 1: Skeleton Discovery (Gemini Pro)

**Input:** User query (e.g., "2024 NY Mayoral Race")

**Process:**
1. Pro searches web for overview (Wikipedia, major news summaries)
2. Extracts timeline skeleton:
   - Key dates
   - Major actors/entities
   - 5-10 anchor events
3. Generates structured output:

```json
{
  "timeline_id": "uuid",
  "topic": "Notre Dame Fire 2019",
  "date_range": {"start": "2019-04-15", "end": "2019-04-20"},
  "anchor_events": [
    {
      "event_id": "evt_1",
      "title": "Fire breaks out",
      "date": "2019-04-15T18:20:00Z",
      "priority": "critical"
    },
    {
      "event_id": "evt_2",
      "title": "Cause investigation begins",
      "date": "2019-04-16T09:00:00Z",
      "priority": "high"
    }
  ]
}
```

**Success Criteria:**
- Identifies 80%+ of major events for well-documented topics
- No hallucinated dates or events
- Runs in <30 seconds

### Phase 2: Parallel Investigation (Gemini Flash Subagents)

**Input:** One anchor event from Phase 1

**Each subagent's task:**
1. Search for 10-20 sources covering this specific event
2. Extract structured claims:
   - What happened (claim text)
   - Who reported it (source)
   - When published (timestamp)
   - Supporting quotes/evidence
3. Detect conflicts:
   - "Source A says X, Source B says Y"
4. Return structured report

**Subagent Output Format:**
```json
{
  "event_id": "evt_2",
  "sources": [
    {
      "url": "https://bbc.com/...",
      "outlet": "BBC",
      "credibility_score": 0.85,
      "publish_date": "2019-04-16T14:30:00Z",
      "claims": [
        {
          "claim_id": "claim_1",
          "text": "Electrical short circuit suspected as cause",
          "confidence": "medium",
          "quotes": ["Official said..."]
        }
      ]
    }
  ],
  "conflicts": [
    {
      "claim_a": "claim_1",
      "claim_b": "claim_5",
      "description": "BBC reports electrical cause, Le Monde reports cigarette"
    }
  ]
}
```

**Parallelization:**
- Spawn N subagents simultaneously (N = number of anchor events)
- Implement rate limiting (Gemini API limits)
- Timeout per subagent: 60 seconds max
- If subagent fails, retry once, then skip

**Success Criteria:**
- Each subagent finds 8+ credible sources
- Detects at least 1 conflict when present
- 90% completion rate across all subagents

### Phase 3: Synthesis & Branch Detection (Gemini Pro)

**Input:** All subagent reports from Phase 2

**Process:**
1. **Deduplication:** Merge identical claims from different subagents
2. **Branch Detection:** Identify where narratives diverge
   - Group conflicting claims into "branches"
   - Calculate credibility score per branch based on:
     - Number of sources supporting it
     - Average source credibility
     - Temporal consistency
3. **Timeline Assembly:** Order events chronologically
4. **Metadata Enrichment:** Add context, related events

**Branch Structure:**
```json
{
  "event_id": "evt_2",
  "title": "Cause of fire",
  "branches": [
    {
      "branch_id": "branch_a",
      "narrative": "Electrical short circuit",
      "credibility_score": 0.72,
      "sources": ["BBC", "Reuters", "AP"],
      "evidence": "..."
    },
    {
      "branch_id": "branch_b",
      "narrative": "Cigarette left by worker",
      "credibility_score": 0.28,
      "sources": ["Le Monde (initial report, later retracted)"],
      "evidence": "..."
    }
  ]
}
```

**Success Criteria:**
- Correctly identifies major narrative branches
- Credibility scores align with reality (verified facts score higher)
- Timeline is chronologically coherent

### Phase 4: Visualization & API

**Backend API:**
```
POST /api/timelines/create
Body: { "query": "Notre Dame Fire 2019" }
Response: { "timeline_id": "...", "status": "processing" }

GET /api/timelines/:id
Response: { timeline JSON with events, sources, branches }

GET /api/timelines/:id/status
Response: { "status": "complete", "progress": "8/10 events processed" }
```

**Frontend:**
- Timeline visualization (horizontal axis = time)
- Branch view: Clicking an event shows competing narratives
- Source explorer: List of all sources with credibility indicators
- Simple controls: Search timeline, filter by credibility threshold

**Success Criteria:**
- Timeline loads in <5 seconds after processing completes
- Branches are visually distinct
- Users can click through to original sources

## Implementation Roadmap

### Milestone 1: Single-Agent Prototype (Week 1-2)
**Goal:** Prove Gemini can extract timeline structure

- [ ] Set up Python project with Gemini SDK
- [ ] Implement Phase 1 (skeleton discovery) with Pro
- [ ] Test on 3 sample topics (simple historical events)
- [ ] Output structured JSON
- [ ] Validate accuracy manually

**Deliverable:** CLI tool that takes a query and outputs anchor events

### Milestone 2: Subagent Orchestration (Week 3-4)
**Goal:** Multi-agent system works

- [ ] Implement Phase 2 (Flash subagents)
- [ ] Build source fetching and parsing logic
- [ ] Add conflict detection algorithm
- [ ] Test parallel execution with rate limiting
- [ ] Cache web results in Redis

**Deliverable:** End-to-end pipeline (Pro → Flash → Pro synthesis)

### Milestone 3: Branch Detection & Credibility (Week 5)
**Goal:** Core Veritas value prop works

- [ ] Implement Phase 3 synthesis logic
- [ ] Build credibility scoring (simple heuristic)
- [ ] Create hardcoded source reliability database
- [ ] Test branch detection on known controversial events
- [ ] Validate branches match reality

**Deliverable:** Timeline JSON with credibility-scored branches

### Milestone 4: Basic Frontend (Week 6-7)
**Goal:** Visualize timelines

- [ ] Build FastAPI backend with endpoints
- [ ] PostgreSQL schema for timelines
- [ ] React app with timeline visualization
- [ ] Branch comparison view
- [ ] Source credibility indicators

**Deliverable:** Working web app (localhost)

### Milestone 5: Polish & Deploy (Week 8)
**Goal:** Shareable demo

- [ ] Deploy backend (Railway/Render)
- [ ] Deploy frontend (Vercel)
- [ ] Add loading states and error handling
- [ ] Write basic documentation
- [ ] Test on 5-10 diverse topics

**Deliverable:** Public URL with working demo

## Test Topics for v0

Start with these to validate the system:

### Simple (Well-documented, clear timeline)
1. Notre Dame Fire 2019
2. SpaceX Starship First Launch 2023
3. Queen Elizabeth II Death 2022

### Medium (Some conflicting narratives)
4. COVID-19 Origin Investigation 2020-2021
5. 2024 NY Mayoral Race (if completed)
6. Silicon Valley Bank Collapse 2023

### Hard (Highly contested, multiple branches)
7. January 6 Capitol Events 2021
8. Nord Stream Pipeline Sabotage 2022
9. Lab Leak vs Natural Origin (COVID)

## Success Metrics for v0

### Technical
- ✅ 90%+ accuracy in identifying major events
- ✅ <3 minutes end-to-end processing time
- ✅ Detects narrative branches when present (precision > 70%)
- ✅ Zero hallucinated events or dates

### User Experience
- ✅ 5+ test users can understand the timeline without explanation
- ✅ Branch credibility scores feel intuitive
- ✅ Users can trace claims back to sources in <2 clicks

### Cost
- ✅ <$2 per timeline generation (API costs)
- ✅ Caching reduces cost by 50%+ on repeated queries

## Open Questions to Resolve

1. **How deep should subagents search?**
   - Option A: First 10 Google results
   - Option B: Targeted search (news sites only, date-filtered)
   - Recommendation: B for v0

2. **When to stop iterating?**
   - Fixed iteration (Phase 1-2-3, done)
   - Or dynamic (if new critical events found, spawn more subagents)
   - Recommendation: Fixed for v0, dynamic for v1

3. **How to handle paywalled sources?**
   - Skip them in v0
   - Or integrate with diffbot/news API subscriptions
   - Recommendation: Skip for v0

4. **Source credibility database:**
   - Manually curate 50 major outlets
   - Or scrape from Media Bias/Fact Check
   - Recommendation: Manual curation for v0

5. **Error handling:**
   - If Pro fails to find events, ask user to provide seed events?
   - Recommendation: Yes, allow manual event seeding as fallback

## Post-v0 Roadmap Ideas

Once core works:
- **v0.5:** Add source profiling (bias, historical accuracy)
- **v1:** Real-time timeline updates (websocket streaming)
- **v2:** Multilingual support (cross-lingual claim normalization)
- **v3:** Community submissions and crowdsourced verification

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Gemini API costs exceed budget | High | Aggressive caching, rate limiting, use Flash for all subagents |
| Branch detection fails (false positives) | Medium | Start with conservative conflict threshold, manual validation |
| Pro can't find anchor events for obscure topics | Medium | Allow manual event seeding, improve search prompts |
| Subagents hallucinate sources | High | Strict output validation, require URLs, verify accessibility |
| Timeline takes too long (>5 min) | Medium | Parallelize aggressively, add timeouts, show progressive results |

## Next Steps

1. **Review this plan** - Confirm scope and architecture decisions
2. **Set up project** - Create repo, install dependencies
3. **Build Milestone 1** - Prove skeleton discovery works
4. **Iterate rapidly** - Test early, fail fast, adjust architecture

---

**Estimated Time to Working Demo:** 6-8 weeks (solo developer, part-time)
**Estimated Cost:** $50-200 (API usage during development)
**Primary Risk:** Branch detection accuracy - needs real-world testing
