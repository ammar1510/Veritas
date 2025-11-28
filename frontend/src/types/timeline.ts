export interface TimelineCreate {
  query: string;
}

export interface Claim {
  claim_id: string;
  text: string;
  confidence: string;
  quotes?: string[];
}

export interface Branch {
  id: string;
  narrative: string;
  credibility_score: number;
  evidence?: string;
  source_count: number;
}

export interface Source {
  id: string;
  url: string;
  outlet: string;
  credibility_score: number;
  publish_date?: string;
  claims: Claim[];
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_date: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  branches: Branch[];
  sources: Source[];
}

export interface Timeline {
  id: string;
  topic: string;
  query: string;
  status: 'processing' | 'completed' | 'failed';
  progress: string;
  date_range_start?: string;
  date_range_end?: string;
  created_at: string;
  events: Event[];
}

export interface TimelineStatus {
  id: string;
  status: 'processing' | 'completed' | 'failed';
  progress: string;
}

// API response types
export interface CreateTimelineResponse {
  id: string;
  status: string;
  progress: string;
}

export interface TimelineResponse extends Timeline {}

export interface TimelineStatusResponse extends TimelineStatus {}

// Utility types
export type CredibilityLevel = 'high' | 'medium' | 'low' | 'verylow';

export interface CredibilityColor {
  bg: string;
  text: string;
  border: string;
}
