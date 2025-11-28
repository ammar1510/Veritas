# Veritas Frontend V0 Plan

## Overview

Build a clean, intuitive web interface that visualizes truth timelines with branching narratives. The frontend should make complex information digestible while maintaining the rigor of source-backed verification.

## Design Philosophy

**Core Principles:**
- **Clarity over complexity**: Information density without clutter
- **Trust through transparency**: Always show sources and credibility scores
- **Progressive disclosure**: Start simple, reveal depth on interaction
- **Accessibility**: Understandable by both casual readers and analysts

## Tech Stack

### Core Framework
- **React 18+** with TypeScript
- **Vite** for fast development and builds
- **React Router** for navigation

### Visualization
- **D3.js** for timeline rendering
  - Full control over custom visualizations
  - Smooth animations and transitions
  - Responsive to window size
- **Framer Motion** for UI animations

### Styling
- **Tailwind CSS** for utility-first styling
- **shadcn/ui** for component primitives (optional, for consistency)
- **Lucide React** for icons

### State Management
- **React Query (TanStack Query)** for server state
  - Automatic polling for timeline status
  - Caching and background refetching
  - Optimistic updates
- **Zustand** for minimal client state (UI preferences, filters)

### API Client
- **Axios** for HTTP requests with interceptors

### Deployment
- **Vercel** for hosting (optimal for React apps)
- **Environment variables** for API endpoint configuration

## Information Architecture

```
/                          → Landing page
  └─ /timeline/new         → Create timeline form
  └─ /timeline/:id         → Timeline visualization
      ├─ Overview tab      → Full timeline view
      ├─ Events tab        → List view of events
      ├─ Sources tab       → Source credibility explorer
      └─ Branches tab      → Narrative divergences
```

## Component Architecture

```
src/
├── components/
│   ├── timeline/
│   │   ├── TimelineVisualization.tsx    # D3 timeline renderer
│   │   ├── TimelineAxis.tsx             # Date axis
│   │   ├── EventNode.tsx                # Individual event markers
│   │   ├── BranchPath.tsx               # Visual narrative branches
│   │   └── TimelineControls.tsx         # Zoom, pan, filters
│   │
│   ├── event/
│   │   ├── EventCard.tsx                # Event detail card
│   │   ├── EventModal.tsx               # Full event view
│   │   └── EventTimeline.tsx            # Mini timeline for event
│   │
│   ├── branch/
│   │   ├── BranchComparison.tsx         # Side-by-side narratives
│   │   ├── BranchCard.tsx               # Individual branch
│   │   └── CredibilityIndicator.tsx     # Visual credibility score
│   │
│   ├── source/
│   │   ├── SourceList.tsx               # List of sources
│   │   ├── SourceCard.tsx               # Source with credibility
│   │   ├── SourceBadge.tsx              # Outlet badge with score
│   │   └── ClaimsList.tsx               # Claims from source
│   │
│   ├── search/
│   │   ├── TimelineSearch.tsx           # Query input
│   │   └── SearchSuggestions.tsx        # Example topics
│   │
│   └── shared/
│       ├── LoadingState.tsx             # Processing animation
│       ├── ErrorBoundary.tsx            # Error handling
│       ├── StatusBadge.tsx              # Timeline status
│       └── ProgressBar.tsx              # Generation progress
│
├── pages/
│   ├── HomePage.tsx                     # Landing + search
│   ├── TimelinePage.tsx                 # Main visualization
│   └── NotFoundPage.tsx                 # 404
│
├── hooks/
│   ├── useTimeline.ts                   # Fetch timeline data
│   ├── useTimelineStatus.ts             # Poll status
│   ├── useCreateTimeline.ts             # Create mutation
│   └── useTimelineFilters.ts            # Filter state
│
├── services/
│   └── api.ts                           # API client setup
│
├── types/
│   └── timeline.ts                      # TypeScript types
│
└── utils/
    ├── dateFormatter.ts                 # Date display utilities
    ├── credibilityScore.ts              # Score formatting
    └── colorScale.ts                    # Credibility → color mapping
```

## Key Features for V0

### 1. Timeline Creation Flow

**Input Page** (`/`)
```
┌─────────────────────────────────────────┐
│         VERITAS                         │
│   Explore Truth Through Time            │
│                                         │
│  ┌────────────────────────────────┐    │
│  │ What event do you want to      │    │
│  │ explore?                       │    │
│  │                                │    │
│  │ e.g., "Notre Dame Fire 2019"  │    │
│  └────────────────────────────────┘    │
│                                         │
│  [Generate Timeline]                    │
│                                         │
│  Try these:                             │
│  • Notre Dame Fire 2019                 │
│  • SpaceX Starship First Launch 2023   │
│  • SVB Collapse 2023                    │
└─────────────────────────────────────────┘
```

**Features:**
- Clean search input with placeholder examples
- Suggested topics as clickable chips
- Loading state redirects to timeline page

### 2. Timeline Visualization Page

**Main Timeline View** (`/timeline/:id`)

```
┌──────────────────────────────────────────────────────────┐
│ ← Back to Search          Notre Dame Fire 2019          │
├──────────────────────────────────────────────────────────┤
│  Status: ● Completed    Events: 8    Sources: 24        │
│  Apr 15, 2019 - Apr 20, 2019                            │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  [Overview] [Events] [Sources] [Branches]               │
│                                                          │
│  ┌────────────────────────────────────────────────┐  ▲  │
│  │        Timeline (Scroll to explore)            │  │  │
│  │                                                │  │  │
│  │  Apr 15, 2019                                  │  │  │
│  │     6:20 PM  ●━━ Fire breaks out               │  │  │
│  │              ┃                                 │  │  │
│  │     7:00 PM  ●━━ Initial response              │  │  │
│  │              ┃                                 │  │  │
│  │  Apr 16      ┃                                 │  │  │
│  │     9:00 AM  ●━┳━ Cause investigation          │  │  │
│  │              ┃ ┗━● Alt: Worker cigarette (28%) │  │  │
│  │              ┃                                 │  │  │
│  │    12:00 PM  ●━━ Damage assessment             │  │  │
│  │              ┃                                 │  │  │
│  │  Apr 17      ●━━ Rebuild plans announced       │  │  │
│  │              ┃                                 │  │  │
│  │  Apr 18      ●━━ Political responses           │  │  │
│  │              ┃                                 │  │  │
│  │              ▼                                 │  │  │
│  └────────────────────────────────────────────────┘  ▼  │
│                                                          │
│  Filter: [All Events ▼] [Credibility > 0.5 ▼]          │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**Visual Design:**
- **Timeline axis**: Vertical line with date/time markers on the left
- **Event nodes**: Circles sized by priority (critical/high/medium/low)
- **Branch visualization**:
  - Main narrative = solid vertical line
  - Alternative narratives = branching lines to the right
  - Color-coded by credibility (green = high, yellow = medium, red = low)
- **Interactive**:
  - Hover over event → show tooltip with full details
  - Click event → open event detail modal
  - Natural scrolling up/down to navigate timeline
  - Scroll snapping to events (optional, for smooth navigation)

**Color Scheme for Credibility:**
```
0.8-1.0:  Green (#10b981)   - High credibility
0.5-0.8:  Blue (#3b82f6)    - Medium credibility
0.3-0.5:  Yellow (#f59e0b)  - Low credibility
0.0-0.3:  Red (#ef4444)     - Very low credibility
```

### 3. Event Detail Modal

```
┌────────────────────────────────────────────┐
│  Fire breaks out                       ✕  │
├────────────────────────────────────────────┤
│  April 15, 2019, 6:20 PM                   │
│  Priority: Critical                        │
│                                            │
│  Description:                              │
│  Fire broke out at Notre-Dame Cathedral... │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ NARRATIVES (2 branches detected)   │   │
│  ├────────────────────────────────────┤   │
│  │ ● Electrical short circuit         │   │
│  │   Credibility: 72% (8 sources)     │   │
│  │   BBC, Reuters, AP, Le Figaro...   │   │
│  │                                    │   │
│  │ ○ Worker's cigarette               │   │
│  │   Credibility: 28% (2 sources)     │   │
│  │   Le Monde (retracted)             │   │
│  └────────────────────────────────────┘   │
│                                            │
│  Sources (10):                             │
│  ┌────────────────────────────────────┐   │
│  │ BBC News              ✓ 85%        │   │
│  │ "Officials suspect electrical..."  │   │
│  │ Apr 16, 2019 • View source →       │   │
│  ├────────────────────────────────────┤   │
│  │ Reuters               ✓ 90%        │   │
│  │ "Investigation focuses on..."      │   │
│  │ Apr 16, 2019 • View source →       │   │
│  └────────────────────────────────────┘   │
│                                            │
│  [Close]                                   │
└────────────────────────────────────────────┘
```

**Features:**
- Event metadata (date, priority)
- Branch comparison with credibility scores
- Source list with outlet badges and scores
- Links to original articles (open in new tab)

### 4. Processing State

**While Timeline Generates** (`/timeline/:id` during processing)

```
┌──────────────────────────────────────────┐
│  Generating Timeline...                  │
│                                          │
│  ┌────────────────────────────────┐     │
│  │    ⚡ Analyzing sources...      │     │
│  │                                │     │
│  │    ████████░░░░░░░░░░ 8/10     │     │
│  │                                │     │
│  │    Processing event:           │     │
│  │    "Cause investigation"       │     │
│  └────────────────────────────────┘     │
│                                          │
│  This usually takes 1-3 minutes.         │
│  The page will update automatically.     │
└──────────────────────────────────────────┘
```

**Implementation:**
- Poll `/api/timelines/:id/status` every 2 seconds
- Show progress bar with current event
- Smooth transition to full timeline when complete
- Use React Query's `refetchInterval` for auto-polling

### 5. Events Tab

**List View of All Events**

```
┌────────────────────────────────────────────┐
│  Events (8)               Sort: Date ▼     │
├────────────────────────────────────────────┤
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ 🔴 Fire breaks out                 │   │
│  │    April 15, 2019, 6:20 PM         │   │
│  │    2 branches • 10 sources         │   │
│  │    [View Details]                  │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ┌────────────────────────────────────┐   │
│  │ 🔵 Initial response begins         │   │
│  │    April 15, 2019, 7:00 PM         │   │
│  │    1 branch • 6 sources            │   │
│  │    [View Details]                  │   │
│  └────────────────────────────────────┘   │
│                                            │
│  ... more events ...                       │
│                                            │
└────────────────────────────────────────────┘
```

**Features:**
- Sortable by date or priority
- Color-coded priority indicators
- Quick stats (branches, sources)
- Click to open event modal

### 6. Sources Tab

**Source Credibility Explorer**

```
┌──────────────────────────────────────────────┐
│  Sources (24)         Filter: All Outlets ▼  │
│                       Sort: Credibility ▼    │
├──────────────────────────────────────────────┤
│                                              │
│  ┌────────────────────────────────────┐     │
│  │ Reuters                      ✓ 90% │     │
│  │ 5 articles • High credibility      │     │
│  │                                    │     │
│  │ • "Fire engulfs Notre-Dame..."     │     │
│  │   Apr 15, 2019                     │     │
│  │ • "Investigation underway..."      │     │
│  │   Apr 16, 2019                     │     │
│  │ [Show all →]                       │     │
│  └────────────────────────────────────┘     │
│                                              │
│  ┌────────────────────────────────────┐     │
│  │ BBC News                     ✓ 85% │     │
│  │ 4 articles • High credibility      │     │
│  │ [Show all →]                       │     │
│  └────────────────────────────────────┘     │
│                                              │
│  ... more sources ...                        │
│                                              │
└──────────────────────────────────────────────┘
```

**Features:**
- Grouped by outlet
- Credibility badge with visual indicator
- List of articles from each outlet
- Filter by credibility threshold
- Sort by credibility or article count

### 7. Branches Tab

**Narrative Divergence Explorer**

```
┌──────────────────────────────────────────────────┐
│  Branching Narratives (3 detected)               │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌────────────────────────────────────────┐     │
│  │ Event: Cause of fire                   │     │
│  ├────────────────────────────────────────┤     │
│  │                                        │     │
│  │  Branch A (Main)          Cred: 72%    │     │
│  │  Electrical short circuit              │     │
│  │                                        │     │
│  │  Sources: BBC, Reuters, AP,            │     │
│  │           Le Figaro, Le Monde          │     │
│  │                                        │     │
│  │  Evidence:                             │     │
│  │  "Investigators found evidence of..."  │     │
│  │                                        │     │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │     │
│  │                                        │     │
│  │  Branch B (Alternative)   Cred: 28%    │     │
│  │  Worker's cigarette                    │     │
│  │                                        │     │
│  │  Sources: Le Monde (initial, later     │     │
│  │           retracted)                   │     │
│  │                                        │     │
│  │  Evidence:                             │     │
│  │  "Early reports suggested a worker..." │     │
│  │                                        │     │
│  └────────────────────────────────────────┘     │
│                                                  │
│  ... more branches ...                           │
│                                                  │
└──────────────────────────────────────────────────┘
```

**Features:**
- Side-by-side comparison of narratives
- Visual credibility bars
- Supporting sources listed
- Evidence snippets
- Clearly mark main narrative vs alternatives

## Implementation Roadmap

### Phase 1: Project Setup (Day 1)

**Tasks:**
- Initialize Vite + React + TypeScript project
- Install dependencies (React Query, Axios, D3, Tailwind, Framer Motion)
- Set up folder structure
- Configure Tailwind CSS
- Set up API client with Axios
- Create TypeScript types matching backend schemas

**Deliverable:** Empty React app with routing skeleton

### Phase 2: Core Components (Days 2-3)

**Tasks:**
- Build `TimelineSearch` component (home page)
- Implement `useCreateTimeline` hook
- Create loading states and error boundaries
- Build status polling with `useTimelineStatus`
- Implement redirect flow (search → processing → timeline)

**Deliverable:** Working timeline creation flow

### Phase 3: Timeline Visualization (Days 4-6)

**Tasks:**
- Build D3 vertical timeline axis with date/time labels
- Implement event node rendering (sized by priority)
- Add branch path visualization (branches extend to the right)
- Implement smooth scrolling with optional snap-to-event
- Make timeline responsive (adjust layout for mobile)
- Add hover tooltips with event details
- Add click handlers for event modals

**Deliverable:** Interactive vertical timeline visualization

### Phase 4: Event Details (Day 7)

**Tasks:**
- Build `EventModal` component
- Implement `EventCard` with all metadata
- Create `BranchComparison` component
- Build `SourceList` and `SourceCard`
- Add credibility indicators
- Link to external sources

**Deliverable:** Full event detail view

### Phase 5: Additional Views (Days 8-9)

**Tasks:**
- Build Events tab (list view)
- Build Sources tab (grouped by outlet)
- Build Branches tab (narrative comparison)
- Implement sorting and filtering
- Add tab navigation

**Deliverable:** All timeline views functional

### Phase 6: Polish & Responsive (Day 10)

**Tasks:**
- Make all components mobile-responsive
- Add animations (Framer Motion)
- Refine color scheme and typography
- Add keyboard navigation
- Implement proper error states
- Add empty states
- Performance optimization (memoization, lazy loading)

**Deliverable:** Production-ready UI

### Phase 7: Deployment (Day 11)

**Tasks:**
- Set up Vercel project
- Configure environment variables
- Deploy to production
- Test on multiple devices/browsers
- Set up CI/CD (optional)

**Deliverable:** Live URL

## API Integration

### Endpoints Used

```typescript
// Create timeline
POST /api/timelines/create
Body: { query: string }
Response: { id: string, status: string, progress: string }

// Get timeline status (polling)
GET /api/timelines/:id/status
Response: { id: string, status: string, progress: string }

// Get full timeline (once completed)
GET /api/timelines/:id
Response: {
  id: string
  topic: string
  status: string
  progress: string
  date_range_start: string
  date_range_end: string
  created_at: string
  events: Event[]
}
```

### React Query Setup

```typescript
// useCreateTimeline.ts
export const useCreateTimeline = () => {
  return useMutation({
    mutationFn: (query: string) =>
      api.post('/api/timelines/create', { query }),
    onSuccess: (data) => {
      // Redirect to timeline page
      navigate(`/timeline/${data.id}`)
    }
  })
}

// useTimelineStatus.ts (with polling)
export const useTimelineStatus = (id: string) => {
  return useQuery({
    queryKey: ['timeline-status', id],
    queryFn: () => api.get(`/api/timelines/${id}/status`),
    refetchInterval: (data) =>
      data?.status === 'processing' ? 2000 : false,
    enabled: !!id
  })
}

// useTimeline.ts
export const useTimeline = (id: string) => {
  return useQuery({
    queryKey: ['timeline', id],
    queryFn: () => api.get(`/api/timelines/${id}`),
    enabled: !!id
  })
}
```

## Design Specifications

### Typography
- **Headings**: Inter or IBM Plex Sans (clean, modern)
- **Body**: System font stack for readability
- **Monospace**: For timestamps and technical data

### Spacing
- Use Tailwind's spacing scale consistently
- Card padding: `p-6`
- Section gaps: `gap-4` to `gap-8`
- Component margins: `mb-4` to `mb-8`

### Responsive Breakpoints
```
sm:  640px  - Mobile landscape
md:  768px  - Tablet
lg:  1024px - Desktop
xl:  1280px - Large desktop
```

### Animations
- Subtle fade-in for page loads (200ms)
- Smooth transitions for state changes (150ms)
- Spring animations for modals (Framer Motion)
- Progressive loading for timeline nodes

### Accessibility
- WCAG AA contrast ratios
- Keyboard navigation for all interactive elements
- ARIA labels for icons and controls
- Focus indicators
- Skip navigation links

## Performance Targets

- **Initial load**: < 2 seconds
- **Timeline render**: < 500ms for 10 events
- **Smooth 60fps** for pan/zoom animations
- **Lazy load** event details (only fetch when modal opens)
- **Bundle size**: < 500KB gzipped

## Testing Strategy (Post-V0)

For V0, manual testing is sufficient. Future improvements:
- **Unit tests**: Vitest for utilities and hooks
- **Component tests**: React Testing Library
- **E2E tests**: Playwright for critical flows
- **Visual regression**: Chromatic (optional)

## Open Questions

1. **Should we show "in-progress" timelines on the home page?**
   - Option A: Only completed timelines
   - Option B: Show all with status badges
   - **Recommendation**: B, allows users to return to ongoing generations

2. **How to handle large timelines (50+ events)?**
   - Option A: Pagination in list views
   - Option B: Virtualized scrolling
   - Option C: "Load more" button
   - **Recommendation**: C for simplicity in V0

3. **Should we cache generated timelines client-side?**
   - Option A: Always fetch fresh
   - Option B: Cache in React Query (5 min)
   - **Recommendation**: B, reduces server load

4. **Mobile-first or desktop-first design?**
   - **Recommendation**: Desktop-first for V0, but vertical timeline design is naturally mobile-friendly and requires minimal adaptation

5. **Dark mode support?**
   - **Recommendation**: Not for V0, add in V1 based on user feedback

## Future Enhancements (Post-V0)

Once core works:
- **Timeline history**: View previously generated timelines
- **Timeline sharing**: Shareable URLs with embed support
- **Export functionality**: PDF, PNG, or JSON export
- **Advanced filters**: By source, credibility threshold, date range
- **Timeline comparison**: Compare how different sources covered same event
- **Real-time updates**: WebSocket for live timeline updates
- **Comments/annotations**: Allow users to add context
- **Mobile app**: React Native version

## Success Metrics

- **Usability**: 5+ test users can understand timeline without explanation
- **Performance**: Timeline loads in < 3 seconds after generation completes
- **Accuracy**: Credibility scores visually match user expectations
- **Engagement**: Users explore at least 3 events per timeline
- **Conversion**: 30%+ of visitors create a timeline

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| D3 timeline too complex to implement | High | Start with simple vertical line, add features iteratively |
| Timeline doesn't scale to many events | Medium | Vertical scrolling handles this naturally, test with 20+ event timeline |
| Polling creates performance issues | Medium | Use exponential backoff, stop after completion |
| Users confused by branch visualization | Medium | User testing early, simplify if needed |
| Mobile experience is poor | Low | Vertical layout is mobile-friendly, test on devices |

## Next Steps

1. **Review this plan** with stakeholders
2. **Set up repository** and initialize project
3. **Create mockups** in Figma (optional, for alignment)
4. **Build Phase 1** (project setup)
5. **Iterate rapidly** based on testing

---

**Estimated Time to Working Demo:** 10-14 days (solo developer, full-time)

**Estimated Cost:** $0 (Vercel free tier, all OSS libraries)

**Primary Risk:** D3 timeline visualization complexity - may need to simplify branch visualization or use pre-built components
