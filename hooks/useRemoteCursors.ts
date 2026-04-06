'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Socket } from 'socket.io-client';

interface RemoteCursor {
  userId: string;
  x: number;
  y: number;
  userName?: string;
  userColor?: string;
}

interface UseRemoteCursorsProps {
  socket: Socket | null;
  enabled: boolean;
}

export function useRemoteCursors({ socket, enabled }: UseRemoteCursorsProps) {
  const [cursors, setCursors] = useState<Map<string, RemoteCursor>>(new Map());
  const cursorTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!socket || !enabled) return;

    socket.on('remote-cursor', (data: { userId: string; x: number; y: number }) => {
      const { userId, x, y } = data;

      setCursors((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(userId);
        updated.set(userId, {
          userId,
          x,
          y,
          userName: existing?.userName,
          userColor: existing?.userColor,
        });
        return updated;
      });

      // Clear existing timeout for this cursor
      const existingTimeout = cursorTimeoutRef.current.get(userId);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
      }

      // Remove cursor after 3 seconds of inactivity
      const timeout = setTimeout(() => {
        setCursors((prev) => {
          const updated = new Map(prev);
          updated.delete(userId);
          return updated;
        });
        cursorTimeoutRef.current.delete(userId);
      }, 3000);

      cursorTimeoutRef.current.set(userId, timeout);
    });

    return () => {
      // Clear all timeouts on unmount
      cursorTimeoutRef.current.forEach((timeout) => clearTimeout(timeout));
      cursorTimeoutRef.current.clear();
      socket.off('remote-cursor');
    };
  }, [socket, enabled]);

  // Update user info (name, color) for cursors
  const updateCursorInfo = useCallback(
    (userId: string, userName: string, userColor: string) => {
      setCursors((prev) => {
        const updated = new Map(prev);
        const existing = updated.get(userId);
        if (existing) {
          updated.set(userId, { ...existing, userName, userColor });
        }
        return updated;
      });
    },
    []
  );

  return {
    cursors,
    updateCursorInfo,
  };
}
