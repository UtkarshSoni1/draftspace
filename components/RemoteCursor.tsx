'use client';

import { useEffect, useState } from 'react';

interface RemoteCursorProps {
  userId: string;
  x: number;
  y: number;
  userName?: string;
  userColor?: string;
}

export function RemoteCursor({
  userId,
  x,
  y,
  userName = 'User',
  userColor = '#4ECDC4',
}: RemoteCursorProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
  }, [x, y]);

  return (
    <div
      className="fixed pointer-events-none z-40 transition-all duration-75"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        opacity: isVisible ? 1 : 0,
      }}
    >
      {/* Cursor pointer */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6 4L19 15L11 16L10 23L8 20L4 18L6 4Z"
          fill={userColor}
          stroke="white"
          strokeWidth="1"
        />
      </svg>

      {/* User name label */}
      {userName && (
        <div
          className="absolute top-6 left-2 px-2 py-1 rounded text-xs font-medium text-white whitespace-nowrap shadow-lg"
          style={{
            backgroundColor: userColor,
          }}
        >
          {userName}
        </div>
      )}
    </div>
  );
}
