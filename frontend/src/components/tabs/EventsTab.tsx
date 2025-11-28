import { useState } from 'react';
import type { Event } from '../../types/timeline';
import { formatDateTime } from '../../utils/dateFormatter';
import { getPriorityColor } from '../../utils/colorScale';

interface EventsTabProps {
  events: Event[];
  onEventClick: (event: Event) => void;
}

type SortOption = 'date-asc' | 'date-desc' | 'priority';

export default function EventsTab({ events, onEventClick }: EventsTabProps) {
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');

  const sortedEvents = [...events].sort((a, b) => {
    if (sortBy === 'date-asc') {
      return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
    } else if (sortBy === 'date-desc') {
      return new Date(b.event_date).getTime() - new Date(a.event_date).getTime();
    } else {
      // Sort by priority: Critical > High > Medium > Low
      const priorityOrder: Record<string, number> = {
        'Critical': 0,
        'High': 1,
        'Medium': 2,
        'Low': 3
      };
      return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    }
  });

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'Critical':
        return '🔴';
      case 'High':
        return '🟠';
      case 'Medium':
        return '🟡';
      case 'Low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  return (
    <div>
      {/* Header with sort */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Events ({events.length})
        </h2>
        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-gray-600">
            Sort by:
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-asc">Date (oldest first)</option>
            <option value="date-desc">Date (newest first)</option>
            <option value="priority">Priority</option>
          </select>
        </div>
      </div>

      {/* Events list */}
      <div className="space-y-4">
        {sortedEvents.map((event) => (
          <div
            key={event.id}
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onEventClick(event)}
          >
            <div className="flex items-start gap-4">
              {/* Priority indicator */}
              <div className="text-3xl flex-shrink-0">
                {getPriorityEmoji(event.priority)}
              </div>

              {/* Event info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {event.title}
                </h3>
                <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
                  <span className="font-medium">
                    {formatDateTime(event.event_date)}
                  </span>
                  <span>•</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-semibold"
                    style={{
                      backgroundColor: getPriorityColor(event.priority) + '20',
                      color: getPriorityColor(event.priority)
                    }}
                  >
                    {event.priority}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>
                    {event.branches.length} narrative{event.branches.length !== 1 ? 's' : ''}
                  </span>
                  <span>•</span>
                  <span>
                    {event.sources.length} source{event.sources.length !== 1 ? 's' : ''}
                  </span>
                  {event.branches.length > 1 && (
                    <>
                      <span>•</span>
                      <span className="text-blue-600 font-medium">
                        Multiple narratives detected
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* View button */}
              <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex-shrink-0">
                View Details
              </button>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No events found
          </div>
        )}
      </div>
    </div>
  );
}
