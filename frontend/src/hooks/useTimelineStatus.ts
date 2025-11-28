import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import type { TimelineStatusResponse } from '../types/timeline';
import { logger } from '../utils/logger';

/**
 * Hook to poll timeline status
 * Auto-refetches every 2 seconds while status is 'processing'
 */
export const useTimelineStatus = (timelineId: string | undefined) => {
  return useQuery({
    queryKey: ['timeline-status', timelineId],
    queryFn: async (): Promise<TimelineStatusResponse> => {
      const response = await api.get<TimelineStatusResponse>(
        `/api/timelines/${timelineId}/status`
      );
      if (import.meta.env.DEV) {
        logger.info('[Timeline Status]', response.data);
      }
      return response.data;
    },
    enabled: !!timelineId,
    refetchInterval: (query) => {
      // Poll every 2 seconds if status is 'processing'
      const data = query.state.data;
      const shouldPoll = data?.status === 'processing';
      if (import.meta.env.DEV) {
        logger.debug('[Timeline Polling]', {
          status: data?.status,
          shouldPoll,
          interval: shouldPoll ? 2000 : false,
        });
      }
      return shouldPoll ? 2000 : false;
    },
    refetchIntervalInBackground: true,
    staleTime: 0, // Always consider data stale to enable refetching
    retry: 3,
  });
};
