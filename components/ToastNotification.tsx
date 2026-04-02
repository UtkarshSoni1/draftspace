'use client';

import React, { useEffect, useState } from 'react';
import { useToast, Toast } from '@/context/ToastContext';
import { X, Loader2, CheckCircle2, AlertCircle, Copy } from 'lucide-react';

interface ToastItemProps {
  toast: Toast;
  onClose: (id: string) => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (toast.type === 'processing') return;

    const duration = toast.duration || 4000;
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        onClose(toast.id);
      }
    }, 50);

    return () => clearInterval(interval);
  }, [toast, onClose]);

  const getStyles = () => {
    switch (toast.type) {
      case 'processing':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          icon: 'text-blue-600',
          text: 'text-blue-900',
          barBg: 'bg-blue-500',
        };
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          icon: 'text-green-600',
          text: 'text-green-900',
          barBg: 'bg-green-500',
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          icon: 'text-red-600',
          text: 'text-red-900',
          barBg: 'bg-red-500',
        };
      case 'copy':
        return {
          bg: 'bg-slate-50',
          border: 'border-slate-200',
          icon: 'text-slate-600',
          text: 'text-slate-900',
          barBg: 'bg-slate-400',
        };
    }
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'processing':
        return <Loader2 className={`w-5 h-5 animate-spin ${getStyles().icon}`} />;
      case 'success':
        return <CheckCircle2 className={`w-5 h-5 ${getStyles().icon}`} />;
      case 'error':
        return <AlertCircle className={`w-5 h-5 ${getStyles().icon}`} />;
      case 'copy':
        return <Copy className={`w-5 h-5 ${getStyles().icon}`} />;
    }
  };

  const styles = getStyles();

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} border rounded-lg shadow-lg p-4 w-96 
        animate-in slide-in-from-right duration-300 ease-out
        overflow-hidden transition-all
      `}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${styles.text}`}>
            {toast.message}
          </p>
          {toast.description && (
            <p className={`text-xs mt-1 ${styles.text} opacity-75`}>
              {toast.description}
            </p>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={() => onClose(toast.id)}
          className={`flex-shrink-0 ml-2 ${styles.icon} hover:opacity-70 transition-opacity`}
          aria-label={`Close ${toast.type} notification`}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Bar */}
      {toast.type !== 'processing' && (
        <div className="mt-3 h-1 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${styles.barBg} transition-all`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onClose={removeToast} />
        </div>
      ))}
    </div>
  );
}

export default ToastContainer;
