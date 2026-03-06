import React from 'react';
import { getTabLabel } from '../utils/formValidation';

/**
 * Modal that displays validation errors grouped by tab.
 * Clicking an error jumps to that tab.
 *
 * @param {{
 *   errors: Array<{field: string, message: string, tab: string}>,
 *   onClose: () => void,
 *   onJumpToTab: (tabId: string) => void,
 * }} props
 */
export default function ValidationModal({ errors, onClose, onJumpToTab }) {
  if (!errors || errors.length === 0) return null;

  // Group errors by tab
  const grouped = errors.reduce((acc, err) => {
    const tab = err.tab || 'general';
    if (!acc[tab]) acc[tab] = [];
    acc[tab].push(err);
    return acc;
  }, {});

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="validation-modal-title"
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-4 bg-red-50 border-b border-red-100">
          <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <h2 id="validation-modal-title" className="text-lg font-semibold text-red-800">
              Form Cannot Be Published
            </h2>
            <p className="text-sm text-red-600">
              {errors.length} issue{errors.length !== 1 ? 's' : ''} must be resolved before publishing.
            </p>
          </div>
        </div>

        {/* Error list */}
        <div className="px-6 py-4 max-h-80 overflow-y-auto">
          {Object.entries(grouped).map(([tab, tabErrors]) => (
            <div key={tab} className="mb-4 last:mb-0">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {getTabLabel(tab)}
              </h3>
              <ul className="space-y-1">
                {tabErrors.map((err, i) => (
                  <li key={i}>
                    <button
                      onClick={() => {
                        onJumpToTab(tab);
                        onClose();
                      }}
                      className="w-full text-left flex items-start gap-2 px-3 py-2 rounded-lg text-sm text-red-700 hover:bg-red-50 transition-colors"
                    >
                      <span className="mt-0.5 flex-shrink-0 w-1.5 h-1.5 rounded-full bg-red-400" aria-hidden="true" />
                      {err.message}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              if (errors.length > 0) {
                onJumpToTab(errors[0].tab);
              }
              onClose();
            }}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
          >
            Review Issues
          </button>
        </div>
      </div>
    </div>
  );
}
