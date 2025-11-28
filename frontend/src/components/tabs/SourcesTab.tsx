import { useState, useMemo } from 'react';
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import type { Event, Source } from '../../types/timeline';
import { getCredibilityHexColor } from '../../utils/credibilityScore';
import { formatDateTime } from '../../utils/dateFormatter';

interface SourcesTabProps {
  events: Event[];
}

type SourceGroup = {
  outlet: string;
  sources: Source[];
  averageCredibility: number;
  articleCount: number;
};

type SortOption = 'credibility' | 'count' | 'outlet';

export default function SourcesTab({ events }: SourcesTabProps) {
  const [sortBy, setSortBy] = useState<SortOption>('credibility');
  const [expandedOutlets, setExpandedOutlets] = useState<Set<string>>(new Set());

  // Group sources by outlet
  const sourceGroups = useMemo(() => {
    const groups = new Map<string, SourceGroup>();

    events.forEach((event) => {
      event.sources.forEach((source) => {
        const outlet = source.outlet || 'Unknown Source';

        if (!groups.has(outlet)) {
          groups.set(outlet, {
            outlet,
            sources: [],
            averageCredibility: 0,
            articleCount: 0
          });
        }

        const group = groups.get(outlet)!;
        group.sources.push(source);
        group.articleCount++;
      });
    });

    // Calculate average credibility for each outlet
    groups.forEach((group) => {
      const total = group.sources.reduce((sum, s) => sum + s.credibility_score, 0);
      group.averageCredibility = total / group.sources.length;
    });

    // Sort groups
    const groupsArray = Array.from(groups.values());
    if (sortBy === 'credibility') {
      groupsArray.sort((a, b) => b.averageCredibility - a.averageCredibility);
    } else if (sortBy === 'count') {
      groupsArray.sort((a, b) => b.articleCount - a.articleCount);
    } else {
      groupsArray.sort((a, b) => a.outlet.localeCompare(b.outlet));
    }

    return groupsArray;
  }, [events, sortBy]);

  const toggleOutlet = (outlet: string) => {
    const newExpanded = new Set(expandedOutlets);
    if (newExpanded.has(outlet)) {
      newExpanded.delete(outlet);
    } else {
      newExpanded.add(outlet);
    }
    setExpandedOutlets(newExpanded);
  };

  const getCredibilityLabel = (score: number) => {
    if (score >= 0.8) return 'High credibility';
    if (score >= 0.5) return 'Medium credibility';
    if (score >= 0.3) return 'Low credibility';
    return 'Very low credibility';
  };

  const totalSources = events.reduce((sum, e) => sum + e.sources.length, 0);

  return (
    <div>
      {/* Header with sort */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Sources ({totalSources} from {sourceGroups.length} outlets)
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-sources" className="text-sm text-gray-600">
            Sort by:
          </label>
          <select
            id="sort-sources"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="credibility">Credibility</option>
            <option value="count">Article Count</option>
            <option value="outlet">Outlet Name</option>
          </select>
        </div>
      </div>

      {/* Source groups */}
      <div className="space-y-4">
        {sourceGroups.map((group) => {
          const isExpanded = expandedOutlets.has(group.outlet);
          const credibilityPercent = Math.round(group.averageCredibility * 100);
          const credibilityColor = getCredibilityHexColor(group.averageCredibility);

          return (
            <div
              key={group.outlet}
              className="bg-white border border-gray-200 rounded-lg overflow-hidden"
            >
              {/* Outlet header */}
              <button
                onClick={() => toggleOutlet(group.outlet)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: credibilityColor }}
                    />
                    <h3 className="text-lg font-semibold text-gray-900">
                      {group.outlet}
                    </h3>
                  </div>
                  <div
                    className="px-3 py-1 rounded-full text-sm font-semibold"
                    style={{
                      backgroundColor: credibilityColor + '20',
                      color: credibilityColor
                    }}
                  >
                    {credibilityPercent}%
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{group.articleCount}</span> article
                    {group.articleCount !== 1 ? 's' : ''}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getCredibilityLabel(group.averageCredibility)}
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={20} className="text-gray-400" />
                  )}
                </div>
              </button>

              {/* Article list (expanded) */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50">
                  <div className="divide-y divide-gray-200">
                    {group.sources.map((source, idx) => (
                      <div key={idx} className="px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: getCredibilityHexColor(source.credibility_score) }}
                              />
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                Article from {source.outlet}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-600 mb-2">
                              {source.publish_date ? formatDateTime(source.publish_date) : 'Date unknown'} •{' '}
                              <span
                                className="font-semibold"
                                style={{ color: getCredibilityHexColor(source.credibility_score) }}
                              >
                                {Math.round(source.credibility_score * 100)}% credibility
                              </span>
                            </p>
                            {source.claims && source.claims.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-500 mb-1">Key claims:</p>
                                <ul className="list-disc list-inside space-y-1">
                                  {source.claims.slice(0, 2).map((claim, claimIdx) => (
                                    <li key={claimIdx} className="text-xs text-gray-700">
                                      {claim.text.length > 100
                                        ? claim.text.substring(0, 97) + '...'
                                        : claim.text}
                                    </li>
                                  ))}
                                </ul>
                                {source.claims.length > 2 && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    +{source.claims.length - 2} more claim{source.claims.length - 2 !== 1 ? 's' : ''}
                                  </p>
                                )}
                              </div>
                            )}
                          </div>
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                          >
                            View source
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {sourceGroups.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No sources found
          </div>
        )}
      </div>
    </div>
  );
}
