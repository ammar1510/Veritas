import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { TimelineResponse } from '../types/timeline';

/**
 * Hook to fetch full timeline data
 * Only enabled when timeline status is 'completed'
 */
export const useTimeline = (timelineId: string | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['timeline', timelineId],
    queryFn: async (): Promise<TimelineResponse> => {
      const response = await api.get<TimelineResponse>(`/api/timelines/${timelineId}`);
      return response.data;
    },
    enabled: !!timelineId && enabled,
    retry: 2,
  });
};
