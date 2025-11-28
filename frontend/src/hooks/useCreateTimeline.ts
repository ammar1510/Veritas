import { useMutation } from '@tanstack/react-query';
import api from '../services/api';
import type { TimelineCreate, CreateTimelineResponse } from '../types/timeline';
import { logger } from '../utils/logger';

/**
 * Hook to create a new timeline
 */
export const useCreateTimeline = () => {
  return useMutation({
    mutationFn: async (data: TimelineCreate): Promise<CreateTimelineResponse> => {
      const response = await api.post<CreateTimelineResponse>('/api/timelines/create', data);
      return response.data;
    },
    onError: (error: any) => {
      logger.error('Failed to create timeline:', error);
    },
  });
};
