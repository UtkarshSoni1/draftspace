'use client';

import { useEffect, useState } from 'react';
import { Check, Loader2, AlertCircle } from 'lucide-react';

interface SaveStatusProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
}

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 10) {
    return 'just now';
  }
  if (diffSecs < 60) {
    return `${diffSecs}s ago`;
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  return `${diffDays}d ago`;
}

export function SaveStatus({ isSaving, lastSaved, error }: SaveStatusProps) {
  const [relativeTime, setRelativeTime] = useState<string>('');

  // Update relative time every 10 seconds
  useEffect(() => {
    if (!lastSaved) return;

    const updateTime = () => {
      setRelativeTime(getRelativeTime(lastSaved));
    };

    updateTime();
    const interval = setInterval(updateTime, 10000);

    return () => clearInterval(interval);
  }, [lastSaved]);

  // Show nothing if there's no state to display
  if (!isSaving && !lastSaved && !error) {
    return null;
  }

  return (
    <div className="flex items-center gap-1.5 transition-opacity duration-300">
      {isSaving ? (
        <>
          <Loader2
            className="w-3 h-3 animate-spin"
            style={{ color: '#5C4A2A', opacity: 0.6 }}
          />
          <span
            className="text-xs"
            style={{ color: '#5C4A2A', opacity: 0.6 }}
          >
            Saving...
          </span>
        </>
      ) : error ? (
        <>
          <AlertCircle
            className="w-3 h-3"
            style={{ color: '#C0392B' }}
          />
          <span
            className="text-xs"
            style={{ color: '#C0392B' }}
          >
            Save failed
          </span>
        </>
      ) : lastSaved ? (
        <>
          <Check
            className="w-3 h-3"
            style={{ color: '#9CA764' }}
          />
          <span
            className="text-xs"
            style={{ color: '#9CA764' }}
          >
            Saved {relativeTime}
          </span>
        </>
      ) : null}
    </div>
  );
}
