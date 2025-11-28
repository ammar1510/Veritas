import { X, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Event } from '../../types/timeline';
import { formatDateTime } from '../../utils/dateFormatter';
import { getCredibilityColor, formatCredibilityScore, getCredibilityLabel } from '../../utils/credibilityScore';

interface EventModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventModal({ event, isOpen, onClose }: EventModalProps) {
  if (!event) return null;

  // Sort branches by credibility (highest first)
  const sortedBranches = [...event.branches].sort(
    (a, b) => b.credibility_score - a.credibility_score
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.3 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-3xl md:max-h-[90vh] bg-white rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between p-6 border-b border-gray-200">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {event.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>{formatDateTime(event.event_date)}</span>
                  <span>•</span>
                  <span className="capitalize font-medium text-gray-700">
                    Priority: {event.priority}
                  </span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Description */}
              {event.description && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Description
                  </h3>
                  <p className="text-gray-700">{event.description}</p>
                </div>
              )}

              {/* Branches */}
              {sortedBranches.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Narratives ({sortedBranches.length}{' '}
                    {sortedBranches.length > 1 ? 'branches detected' : 'narrative'})
                  </h3>
                  <div className="space-y-4">
                    {sortedBranches.map((branch, idx) => {
                      const colors = getCredibilityColor(branch.credibility_score);
                      return (
                        <div
                          key={branch.id}
                          className={`p-4 rounded-lg border-2 ${colors.border} bg-gray-50`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-3 h-3 rounded-full ${colors.bg}`}
                              />
                              <span className="font-semibold text-gray-900">
                                {idx === 0 ? 'Main Narrative' : `Alternative ${idx}`}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${colors.text}`}>
                                {formatCredibilityScore(branch.credibility_score)}
                              </span>
                              <span className="text-xs text-gray-500">
                                ({getCredibilityLabel(branch.credibility_score)})
                              </span>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{branch.narrative}</p>
                          {branch.evidence && (
                            <p className="text-sm text-gray-600 italic">
                              Evidence: {branch.evidence}
                            </p>
                          )}
                          <div className="mt-2 text-xs text-gray-500">
                            Supported by {branch.source_count} source
                            {branch.source_count !== 1 ? 's' : ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sources */}
              {event.sources.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    Sources ({event.sources.length})
                  </h3>
                  <div className="space-y-3">
                    {event.sources.map((source) => {
                      const colors = getCredibilityColor(source.credibility_score);
                      return (
                        <div
                          key={source.id}
                          className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">
                                  {source.outlet}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}
                                >
                                  {formatCredibilityScore(source.credibility_score)}
                                </span>
                              </div>
                              {source.publish_date && (
                                <div className="text-xs text-gray-500">
                                  {formatDateTime(source.publish_date)}
                                </div>
                              )}
                            </div>
                            <a
                              href={source.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                            >
                              View source
                              <ExternalLink size={14} />
                            </a>
                          </div>

                          {/* Claims */}
                          {source.claims && source.claims.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {source.claims.map((claim, idx) => (
                                <div key={idx} className="text-sm">
                                  <p className="text-gray-700">{claim.text}</p>
                                  {claim.quotes && claim.quotes.length > 0 && (
                                    <blockquote className="mt-1 pl-3 border-l-2 border-gray-300 text-xs text-gray-600 italic">
                                      "{claim.quotes[0]}"
                                    </blockquote>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex justify-end p-6 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
