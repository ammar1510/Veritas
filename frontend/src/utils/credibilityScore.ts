import type { CredibilityLevel, CredibilityColor } from '../types/timeline';

/**
 * Convert a credibility score (0-1) to a level category
 */
export const getCredibilityLevel = (score: number): CredibilityLevel => {
  if (score >= 0.8) return 'high';
  if (score >= 0.5) return 'medium';
  if (score >= 0.3) return 'low';
  return 'verylow';
};

/**
 * Get color classes for a credibility score
 */
export const getCredibilityColor = (score: number): CredibilityColor => {
  const level = getCredibilityLevel(score);

  const colors: Record<CredibilityLevel, CredibilityColor> = {
    high: {
      bg: 'bg-credibility-high',
      text: 'text-credibility-high',
      border: 'border-credibility-high',
    },
    medium: {
      bg: 'bg-credibility-medium',
      text: 'text-credibility-medium',
      border: 'border-credibility-medium',
    },
    low: {
      bg: 'bg-credibility-low',
      text: 'text-credibility-low',
      border: 'border-credibility-low',
    },
    verylow: {
      bg: 'bg-credibility-verylow',
      text: 'text-credibility-verylow',
      border: 'border-credibility-verylow',
    },
  };

  return colors[level];
};

/**
 * Get hex color for a credibility score (for D3 visualization)
 */
export const getCredibilityHexColor = (score: number): string => {
  if (score >= 0.8) return '#10b981'; // green
  if (score >= 0.5) return '#3b82f6'; // blue
  if (score >= 0.3) return '#f59e0b'; // yellow
  return '#ef4444'; // red
};

/**
 * Format credibility score as percentage
 */
export const formatCredibilityScore = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};

/**
 * Get credibility label
 */
export const getCredibilityLabel = (score: number): string => {
  const level = getCredibilityLevel(score);
  const labels: Record<CredibilityLevel, string> = {
    high: 'High credibility',
    medium: 'Medium credibility',
    low: 'Low credibility',
    verylow: 'Very low credibility',
  };
  return labels[level];
};
