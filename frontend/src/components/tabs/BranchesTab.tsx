import { useMemo } from 'react';
import type { Event, Branch } from '../../types/timeline';
import { getCredibilityHexColor } from '../../utils/credibilityScore';
import { formatDateTime } from '../../utils/dateFormatter';

interface BranchesTabProps {
  events: Event[];
}

type BranchDivergence = {
  event: Event;
  branches: Branch[];
  divergenceScore: number; // How different the branches are (based on credibility spread)
};

export default function BranchesTab({ events }: BranchesTabProps) {
  // Find events with multiple narratives
  const divergences = useMemo(() => {
    const result: BranchDivergence[] = events
      .filter((event) => event.branches.length > 1)
      .map((event) => {
        // Calculate divergence score (larger spread = higher divergence)
        const scores = event.branches.map((b) => b.credibility_score);
        const max = Math.max(...scores);
        const min = Math.min(...scores);
        const divergenceScore = max - min;

        return {
          event,
          branches: [...event.branches].sort((a, b) => b.credibility_score - a.credibility_score),
          divergenceScore
        };
      })
      .sort((a, b) => b.divergenceScore - a.divergenceScore); // Sort by most divergent first

    return result;
  }, [events]);

  const getCredibilityBar = (score: number) => {
    const percent = score * 100;
    const color = getCredibilityHexColor(score);
    return (
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${percent}%`, backgroundColor: color }}
        />
      </div>
    );
  };

  const getBranchLabel = (index: number, totalBranches: number) => {
    if (index === 0) return 'Main Narrative';
    if (totalBranches === 2) return 'Alternative Narrative';
    return `Alternative ${index}`;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Branching Narratives ({divergences.length} detected)
        </h2>
        <p className="text-sm text-gray-600">
          Events where multiple conflicting narratives were reported
        </p>
      </div>

      {/* Divergences list */}
      <div className="space-y-6">
        {divergences.map((divergence) => (
          <div
            key={divergence.event.id}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Event header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {divergence.event.title}
              </h3>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <span>{formatDateTime(divergence.event.event_date)}</span>
                <span>•</span>
                <span>{divergence.branches.length} narratives</span>
                <span>•</span>
                <span className="text-orange-600 font-medium">
                  {Math.round(divergence.divergenceScore * 100)}% credibility divergence
                </span>
              </div>
            </div>

            {/* Branches comparison */}
            <div className="p-6 space-y-6">
              {divergence.branches.map((branch, index) => {
                const credibilityPercent = Math.round(branch.credibility_score * 100);
                const color = getCredibilityHexColor(branch.credibility_score);
                const isMain = index === 0;

                return (
                  <div key={branch.id} className="space-y-3">
                    {/* Branch header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: isMain ? color + '30' : '#f3f4f6',
                            color: isMain ? color : '#6b7280',
                            border: isMain ? `2px solid ${color}` : '2px solid #d1d5db'
                          }}
                        >
                          {getBranchLabel(index, divergence.branches.length)}
                        </div>
                        <div
                          className="text-sm font-bold"
                          style={{ color }}
                        >
                          {credibilityPercent}% credibility
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {branch.source_count} source{branch.source_count !== 1 ? 's' : ''}
                      </div>
                    </div>

                    {/* Credibility bar */}
                    {getCredibilityBar(branch.credibility_score)}

                    {/* Narrative description */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">
                        {branch.narrative || 'No narrative description available'}
                      </p>

                      {/* Evidence */}
                      {branch.evidence && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
                            Evidence:
                          </p>
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {branch.evidence}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {divergences.length === 0 && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-600 mb-2">No narrative divergences detected</p>
            <p className="text-sm text-gray-500">
              All events in this timeline have a single consensus narrative
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
