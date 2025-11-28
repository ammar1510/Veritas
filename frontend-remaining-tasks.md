# Veritas Frontend - Remaining Implementation Tasks

## Phase 3: Timeline Visualization (Main Priority)

### Core Timeline Components
- [ ] **TimelineVisualization Component** (D3.js vertical timeline)
  - [ ] Vertical axis with date/time markers
  - [ ] Event nodes positioned by date
  - [ ] Node sizing based on priority (critical/high/medium/low)
  - [ ] Smooth scrolling through timeline
  - [ ] Optional scroll-snapping to events
  - [ ] Responsive design for mobile/tablet

- [ ] **Branch Path Visualization**
  - [ ] Main narrative as solid vertical line
  - [ ] Alternative narratives branching to the right
  - [ ] Color-coding by credibility score
  - [ ] Visual connectors between branches and events
  - [ ] Branch labels with credibility percentages

- [ ] **Interactive Features**
  - [ ] Hover tooltips showing event details
  - [ ] Click event to open detail modal
  - [ ] Zoom controls (optional)
  - [ ] Filter by credibility threshold
  - [ ] Filter by event priority

### Event Components
- [ ] **EventCard Component**
  - [ ] Display event metadata (title, date, priority)
  - [ ] Show branch count and source count
  - [ ] Color-coded priority indicator
  - [ ] Click to expand details

- [ ] **EventModal Component**
  - [ ] Full event details view
  - [ ] Branch comparison section
  - [ ] Source list with credibility badges
  - [ ] Claims from each source
  - [ ] Links to original articles (open in new tab)
  - [ ] Close/dismiss functionality

### Branch Components
- [ ] **BranchComparison Component**
  - [ ] Side-by-side narrative comparison
  - [ ] Visual credibility indicators
  - [ ] Supporting sources listed
  - [ ] Evidence snippets
  - [ ] Distinguish main vs alternative narratives

- [ ] **BranchCard Component**
  - [ ] Individual branch display
  - [ ] Narrative text
  - [ ] Credibility score with visual bar
  - [ ] Source count
  - [ ] Evidence preview

- [ ] **CredibilityIndicator Component**
  - [ ] Visual representation of score (0-100%)
  - [ ] Color-coded badge
  - [ ] Label (High/Medium/Low/Very Low)

### Source Components
- [ ] **SourceList Component**
  - [ ] List all sources for timeline
  - [ ] Group by outlet
  - [ ] Sort by credibility or date
  - [ ] Filter by outlet or credibility threshold

- [ ] **SourceCard Component**
  - [ ] Outlet name with logo (optional)
  - [ ] Credibility score badge
  - [ ] Publication date
  - [ ] Article title/snippet
  - [ ] Link to original source
  - [ ] Claims associated with this source

- [ ] **SourceBadge Component**
  - [ ] Compact outlet indicator
  - [ ] Credibility score display
  - [ ] Reusable across components

- [ ] **ClaimsList Component**
  - [ ] Display claims from a source
  - [ ] Claim text
  - [ ] Confidence level
  - [ ] Supporting quotes

## Phase 4: Tab Navigation & Views

### Events Tab
- [ ] **EventsListView Component**
  - [ ] List all events chronologically
  - [ ] Sort by date or priority
  - [ ] Search/filter events
  - [ ] Quick stats (branches, sources)
  - [ ] Click to open event modal

### Sources Tab
- [ ] **SourceExplorerView Component**
  - [ ] Group sources by outlet
  - [ ] Show credibility for each outlet
  - [ ] List articles from each outlet
  - [ ] Filter by credibility threshold
  - [ ] Sort by credibility or article count
  - [ ] Expand/collapse outlet groups

### Branches Tab
- [ ] **BranchesView Component**
  - [ ] List all detected narrative branches
  - [ ] Group by event
  - [ ] Side-by-side comparison
  - [ ] Credibility bars
  - [ ] Supporting sources and evidence
  - [ ] Highlight conflicts

### Tab Navigation
- [ ] **Tabs Component**
  - [ ] Active tab highlighting
  - [ ] Smooth transitions between views
  - [ ] URL-based routing (optional: `/timeline/:id/events`)
  - [ ] Persist active tab in state

## Phase 5: Polish & Enhancements

### UI Improvements
- [ ] **Animations with Framer Motion**
  - [ ] Page transitions
  - [ ] Modal slide-in/fade
  - [ ] Event node animations on timeline
  - [ ] Branch reveal animations
  - [ ] Loading state animations

- [ ] **Empty States**
  - [ ] No events found
  - [ ] No branches detected
  - [ ] No sources available
  - [ ] Helpful messaging and actions

- [ ] **Error Boundaries**
  - [ ] Catch React errors gracefully
  - [ ] Display user-friendly error messages
  - [ ] Retry mechanisms
  - [ ] Error reporting (optional)

### Responsive Design
- [ ] **Mobile Optimization**
  - [ ] Vertical timeline works on small screens
  - [ ] Touch-friendly event nodes
  - [ ] Collapsible sections
  - [ ] Bottom sheet for event details (mobile)
  - [ ] Hamburger menu for tabs (mobile)

- [ ] **Tablet Optimization**
  - [ ] Two-column layout where appropriate
  - [ ] Optimized spacing
  - [ ] Touch and mouse support

### Accessibility
- [ ] **WCAG AA Compliance**
  - [ ] Keyboard navigation for all interactive elements
  - [ ] ARIA labels for icons and controls
  - [ ] Focus indicators
  - [ ] Skip navigation links
  - [ ] Sufficient color contrast
  - [ ] Screen reader testing

### Performance
- [ ] **Optimization**
  - [ ] Memoize expensive components (React.memo)
  - [ ] Virtualized scrolling for long event lists
  - [ ] Lazy load event modals
  - [ ] Image optimization (if outlet logos added)
  - [ ] Code splitting by route
  - [ ] Bundle size analysis

## Phase 6: Advanced Features (Optional/Future)

### Search & Filtering
- [ ] **Timeline Search**
  - [ ] Search within events
  - [ ] Search within sources
  - [ ] Highlight search results
  - [ ] Filter by date range

- [ ] **Advanced Filters**
  - [ ] Multi-select filters
  - [ ] Filter by source outlet
  - [ ] Filter by event priority
  - [ ] Filter by credibility range
  - [ ] Combine multiple filters

### Sharing & Export
- [ ] **Share Timeline**
  - [ ] Copy shareable URL
  - [ ] Social media share buttons
  - [ ] Embed code for websites

- [ ] **Export Functionality**
  - [ ] Export as PDF
  - [ ] Export as PNG image
  - [ ] Export as JSON data
  - [ ] Print-friendly view

### User Preferences
- [ ] **Settings/Preferences**
  - [ ] Dark mode toggle
  - [ ] Timeline density (compact/normal/spacious)
  - [ ] Default credibility threshold
  - [ ] Preferred date format
  - [ ] Save preferences to localStorage

### Timeline History
- [ ] **Recently Viewed Timelines**
  - [ ] Show list on home page
  - [ ] Cache in localStorage or backend
  - [ ] Quick access to previous timelines
  - [ ] Delete from history

### Real-time Updates (v1 Feature)
- [ ] **WebSocket Integration**
  - [ ] Live timeline updates
  - [ ] Real-time progress without polling
  - [ ] New event notifications
  - [ ] Auto-refresh on completion

## Testing (Post-V0)

### Unit Tests
- [ ] Utility function tests (Vitest)
  - [ ] credibilityScore.ts
  - [ ] dateFormatter.ts
  - [ ] colorScale.ts

- [ ] Hook tests (React Testing Library)
  - [ ] useCreateTimeline
  - [ ] useTimelineStatus
  - [ ] useTimeline

### Component Tests
- [ ] Shared component tests
  - [ ] LoadingState
  - [ ] ProgressBar
  - [ ] StatusBadge

- [ ] Page component tests
  - [ ] HomePage
  - [ ] TimelinePage (all states)

### E2E Tests (Playwright)
- [ ] Critical user flows
  - [ ] Create timeline flow
  - [ ] View timeline flow
  - [ ] Navigate between tabs
  - [ ] Open event details
  - [ ] Error handling

### Visual Regression Tests
- [ ] Chromatic integration (optional)
- [ ] Screenshot comparison
- [ ] Component library

## Documentation

- [ ] **Component Documentation**
  - [ ] Storybook setup (optional)
  - [ ] Component prop documentation
  - [ ] Usage examples

- [ ] **Developer Guide**
  - [ ] Setup instructions
  - [ ] Architecture overview
  - [ ] State management guide
  - [ ] API integration guide

- [ ] **User Guide**
  - [ ] How to create timelines
  - [ ] How to interpret credibility scores
  - [ ] How to explore branches
  - [ ] FAQ section

## Deployment Checklist

- [ ] **Production Build**
  - [ ] Optimize bundle size
  - [ ] Remove console logs
  - [ ] Enable source maps (production)
  - [ ] Set up error tracking (Sentry, etc.)

- [ ] **Vercel Deployment**
  - [ ] Configure environment variables
  - [ ] Set up custom domain (optional)
  - [ ] Configure redirects
  - [ ] Enable analytics (optional)

- [ ] **CI/CD**
  - [ ] GitHub Actions for builds
  - [ ] Automated testing on PR
  - [ ] Auto-deploy on merge to main
  - [ ] Preview deployments for PRs

- [ ] **Monitoring**
  - [ ] Performance monitoring
  - [ ] Error tracking
  - [ ] Analytics integration
  - [ ] Uptime monitoring

---

## Current Status

✅ **Completed:**
- Project setup and configuration
- Core dependencies installed
- API client and React Query setup
- TypeScript types
- Utility functions
- Home page with timeline creation
- Timeline page with all states (processing/completed/failed)
- Loading states and progress indicators
- Status polling (fixed)
- Backend database session issues (fixed)

🚧 **In Progress:**
- Phase 3: Timeline Visualization (ready to start)

⏳ **Not Started:**
- Phases 4-6 and beyond

---

## Estimated Timeline

**Phase 3: Timeline Visualization** → 4-6 days
**Phase 4: Tab Navigation & Views** → 2-3 days
**Phase 5: Polish & Enhancements** → 2-3 days
**Phase 6: Advanced Features** → 5-7 days (optional)

**Total for MVP (Phases 3-5):** ~8-12 days
**Total for Full V0 (Phases 3-6):** ~15-20 days

---

## Priority Order

1. **Critical (Must Have for MVP)**
   - Timeline Visualization with D3
   - Event Modal
   - Branch Visualization
   - Basic filtering

2. **High (Should Have for V0)**
   - All tab views (Events, Sources, Branches)
   - Mobile responsive
   - Animations and polish
   - Error boundaries

3. **Medium (Nice to Have)**
   - Advanced filters
   - Share/Export
   - Dark mode
   - Timeline history

4. **Low (Future Enhancement)**
   - Real-time updates
   - Testing suite
   - Documentation
   - Analytics
