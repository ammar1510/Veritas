import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Zap } from 'lucide-react';
import { useTimelineStatus } from '../hooks/useTimelineStatus';
import { useTimeline } from '../hooks/useTimeline';
import LoadingState from '../components/shared/LoadingState';
import ProgressBar from '../components/shared/ProgressBar';
import StatusBadge from '../components/shared/StatusBadge';
import TimelineVisualization from '../components/timeline/TimelineVisualization';
import EventModal from '../components/event/EventModal';
import EventsTab from '../components/tabs/EventsTab';
import SourcesTab from '../components/tabs/SourcesTab';
import BranchesTab from '../components/tabs/BranchesTab';
import type { Event } from '../types/timeline';

type TabType = 'overview' | 'events' | 'sources' | 'branches';

export default function TimelinePage() {
  const { id } = useParams<{ id: string }>();
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Poll for status
  const { data: status, isLoading: statusLoading, isError: statusError } = useTimelineStatus(id);

  // Fetch full timeline when completed
  const { data: timeline, isLoading: timelineLoading } = useTimeline(
    id,
    status?.status === 'completed'
  );

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  // Loading state
  if (statusLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingState message="Loading timeline..." />
      </div>
    );
  }

  // Error state
  if (statusError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Failed to load timeline</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Processing state
  if (status?.status === 'processing') {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto px-4 py-16">
          {/* Header */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
          >
            <ArrowLeft size={20} />
            Back to Search
          </Link>

          {/* Processing Card */}
          <div className="bg-white border-2 border-gray-200 rounded-lg p-8">
            <div className="text-center mb-8">
              <Zap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Generating Timeline...
              </h1>
              <p className="text-gray-600">
                Analyzing sources and detecting narrative branches
              </p>
            </div>

            {/* Progress */}
            <div className="mb-8">
              <ProgressBar progress={status.progress} label="Processing events" />
            </div>

            {/* Info */}
            <div className="text-center text-sm text-gray-500">
              This usually takes 1-3 minutes. The page will update automatically.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Failed state
  if (status?.status === 'failed') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">Timeline generation failed</p>
          <p className="text-gray-600 mb-6">Please try creating a new timeline.</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Completed state - loading full timeline
  if (timelineLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingState message="Loading timeline data..." />
      </div>
    );
  }

  // Completed state - show timeline
  if (timeline) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
              Back to Search
            </Link>
            <StatusBadge status={timeline.status} />
          </div>

          {/* Timeline Info */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{timeline.topic}</h1>
            <div className="flex items-center gap-4 text-gray-600">
              <span>Events: {timeline.events.length}</span>
              <span>•</span>
              <span>
                {timeline.date_range_start && timeline.date_range_end
                  ? `${new Date(timeline.date_range_start).toLocaleDateString()} - ${new Date(timeline.date_range_end).toLocaleDateString()}`
                  : 'Date range unavailable'}
              </span>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <div className="flex gap-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`border-b-2 pb-4 font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('events')}
                className={`border-b-2 pb-4 font-medium transition-colors ${
                  activeTab === 'events'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Events
              </button>
              <button
                onClick={() => setActiveTab('sources')}
                className={`border-b-2 pb-4 font-medium transition-colors ${
                  activeTab === 'sources'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Sources
              </button>
              <button
                onClick={() => setActiveTab('branches')}
                className={`border-b-2 pb-4 font-medium transition-colors ${
                  activeTab === 'branches'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                Branches
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {timeline.events.length > 0 ? (
            <>
              {activeTab === 'overview' && (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <TimelineVisualization
                    events={timeline.events}
                    onEventClick={handleEventClick}
                  />
                </div>
              )}

              {activeTab === 'events' && (
                <EventsTab
                  events={timeline.events}
                  onEventClick={handleEventClick}
                />
              )}

              {activeTab === 'sources' && (
                <SourcesTab events={timeline.events} />
              )}

              {activeTab === 'branches' && (
                <BranchesTab events={timeline.events} />
              )}
            </>
          ) : (
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
              <p className="text-gray-600">No events found in this timeline</p>
            </div>
          )}
        </div>

        {/* Event Modal */}
        <EventModal
          event={selectedEvent}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      </div>
    );
  }

  return null;
}
