import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle } from 'lucide-react';
import { useCreateTimeline } from '../hooks/useCreateTimeline';
import { logger } from '../utils/logger';

const EXAMPLE_TOPICS = [
  'Notre Dame Fire 2019',
  'SpaceX Starship First Launch 2023',
  'SVB Collapse 2023',
];

export default function HomePage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const createTimeline = useCreateTimeline();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      try {
        const result = await createTimeline.mutateAsync({ query: query.trim() });
        // Navigate to timeline page
        navigate(`/timeline/${result.id}`);
      } catch (error) {
        logger.error('Failed to create timeline:', error);
      }
    }
  };

  const handleExampleClick = (topic: string) => {
    setQuery(topic);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            VERITAS
          </h1>
          <p className="text-xl text-gray-600">
            Explore Truth Through Time
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What event do you want to explore? e.g., Notre Dame Fire 2019"
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              disabled={createTimeline.isPending}
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={24} />
          </div>
          <button
            type="submit"
            disabled={!query.trim() || createTimeline.isPending}
            className="w-full mt-4 bg-blue-600 text-white px-6 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {createTimeline.isPending ? 'Creating Timeline...' : 'Generate Timeline'}
          </button>
        </form>

        {/* Error Message */}
        {createTimeline.isError && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
            <div>
              <p className="text-red-800 font-medium">Failed to create timeline</p>
              <p className="text-red-600 text-sm mt-1">
                Please try again or contact support if the problem persists.
              </p>
            </div>
          </div>
        )}

        {/* Example Topics */}
        <div>
          <p className="text-sm text-gray-600 mb-3">Try these:</p>
          <div className="flex flex-wrap gap-2">
            {EXAMPLE_TOPICS.map((topic) => (
              <button
                key={topic}
                onClick={() => handleExampleClick(topic)}
                disabled={createTimeline.isPending}
                className="px-4 py-2 bg-white border border-gray-300 rounded-full text-sm hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
