import * as d3 from 'd3';

/**
 * D3 color scale for credibility scores
 */
export const credibilityColorScale = d3
  .scaleLinear<string>()
  .domain([0, 0.3, 0.5, 0.8, 1.0])
  .range(['#ef4444', '#f59e0b', '#f59e0b', '#3b82f6', '#10b981']);

/**
 * Get priority color
 */
export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    critical: '#ef4444', // red
    high: '#f59e0b', // orange
    medium: '#3b82f6', // blue
    low: '#6b7280', // gray
  };
  return colors[priority] || colors.medium;
};

/**
 * Get priority size (for event nodes)
 */
export const getPrioritySize = (priority: string): number => {
  const sizes: Record<string, number> = {
    critical: 16,
    high: 12,
    medium: 10,
    low: 8,
  };
  return sizes[priority] || sizes.medium;
};
