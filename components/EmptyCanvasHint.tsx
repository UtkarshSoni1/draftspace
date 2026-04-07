import React from 'react';
import { PenTool } from 'lucide-react';

interface EmptyCanvasHintProps {
  isEmpty: boolean;
}

export function EmptyCanvasHint({ isEmpty }: EmptyCanvasHintProps) {
  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
      style={{
        opacity: isEmpty ? 1 : 0,
        pointerEvents: isEmpty ? 'none' : 'none',
      }}
    >
      <div className="flex flex-col items-center gap-3">
        {/* Dashed outline box */}
        <div
          style={{
            border: '2px dashed #C5D08A',
            borderRadius: '12px',
            padding: '48px',
            opacity: 0.5,
          }}
        >
          {/* Pen icon */}
          <PenTool
            width={32}
            height={32}
            style={{ color: '#9CA764', marginBottom: '12px' }}
          />

          {/* Start drawing text */}
          <p
            style={{
              fontSize: '14px',
              color: '#5C4A2A',
              opacity: 0.4,
              marginBottom: '8px',
              textAlign: 'center',
            }}
          >
            Start drawing freely
          </p>

          {/* Or ask AI text */}
          <p
            style={{
              fontSize: '13px',
              color: '#9CA764',
              opacity: 0.6,
              textAlign: 'center',
            }}
          >
            or press "/" to ask AI
          </p>
        </div>
      </div>
    </div>
  );
}
