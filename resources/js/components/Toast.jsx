import React, { useEffect, useRef, useState } from 'react';

const ICONS = {
  success: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    </svg>
  ),
};

const STYLES = {
  success: 'bg-green-50 border-green-400 text-green-800',
  error:   'bg-red-50 border-red-400 text-red-800',
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
};

const ICON_STYLES = {
  success: 'text-green-500',
  error:   'text-red-500',
  warning: 'text-yellow-500',
};

/**
 * Toast notification component.
 *
 * @param {{ message: string, type?: 'success'|'error'|'warning', onClose: () => void }} props
 */
export default function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    // Trigger slide-in animation
    const showTimer = setTimeout(() => setVisible(true), 10);

    timerRef.current = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300); // Wait for fade-out before removing
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(timerRef.current);
    };
  }, [onClose]);

  const handleClose = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`
        fixed top-4 right-4 z-50 flex items-start gap-3 max-w-sm w-full
        border rounded-lg shadow-lg px-4 py-3 transition-all duration-300
        ${STYLES[type]}
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      <span className={`flex-shrink-0 mt-0.5 ${ICON_STYLES[type]}`}>
        {ICONS[type]}
      </span>
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={handleClose}
        aria-label="Dismiss notification"
        className="flex-shrink-0 text-current opacity-60 hover:opacity-100 transition-opacity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
