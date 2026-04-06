'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface RoomUser {
  userId: string;
  userName: string;
  userColor: string;
}

interface UseCollaborationProps {
  roomId: string;
  userId: string;
  userName: string;
  enabled: boolean;
}

export interface UseCollaborationReturn {
  socket: Socket | null;
  isConnected: boolean;
  users: RoomUser[];
  sendCanvasChange: (elements: any[], appState: any) => void;
  requestCanvasState: () => void;
}

export function useCollaboration({
  roomId,
  userId,
  userName,
  enabled,
}: UseCollaborationProps): UseCollaborationReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<RoomUser[]>([]);
  const throttleRef = useRef<NodeJS.Timeout | null>(null);

  // Generate user color
  const userColor = useRef<string>('');
  useEffect(() => {
    if (!userColor.current) {
      const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'];
      userColor.current = colors[Math.floor(Math.random() * colors.length)];
    }
  }, []);

  useEffect(() => {
    if (!enabled || !roomId || !userId) return;

    // Attempt to initialize socket connection, but gracefully degrade if server unavailable
    try {
      const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || window.location.origin, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 3,
        transports: ['websocket', 'polling'],
      });

      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[Collab] Connected to socket server');
        setIsConnected(true);

        // Join room
        socket.emit('join-room', {
          roomId,
          userId,
          userName,
          userColor: userColor.current,
        });

        // Request initial canvas state
        socket.emit('request-canvas-state', { roomId, userId });
      });

      socket.on('user-joined', (data: { users: RoomUser[]; joinedUser: RoomUser }) => {
        console.log('[Collab] User joined:', data.joinedUser.userName);
        setUsers(data.users);
      });

      socket.on('error', (error) => {
        console.warn('[Collab] Socket error, falling back to polling:', error);
        // Gracefully degrade - socket.io will continue trying to reconnect
        // but app will still function with read-only collaboration
        setIsConnected(false);
      });

      socket.on('disconnect', () => {
        console.log('[Collab] Disconnected from socket server');
        setIsConnected(false);
      });

      socket.on('user-left', (data: { userId: string; users: RoomUser[] }) => {
        console.log('[Collab] User left:', data.userId);
        setUsers(data.users);
      });

      socket.on('canvas-updated', (data: { elements: any[]; appState: any }) => {
        window.dispatchEvent(
          new CustomEvent('remote-canvas-update', {
            detail: data,
          })
        );
      });

      socket.on('canvas-state', (data: { elements: any[]; appState: any }) => {
        console.log('[Collab] Initial canvas state received');
        window.dispatchEvent(
          new CustomEvent('initial-canvas-state', {
            detail: data,
          })
        );
      });

      return () => {
        if (socket.connected) {
          socket.emit('leave-room', { roomId, userId });
          socket.disconnect();
        }
        socketRef.current = null;
      };
    } catch (error) {
      console.warn('[Collab] Socket.io initialization failed, collaboration disabled:', error);
      // Fall back to API-based updates instead of real-time socket
      setIsConnected(false);
      return () => {
        socketRef.current = null;
      };
    }
  }, [enabled, roomId, userId, userName]);

  const sendCanvasChange = useCallback(
    (elements: any[], appState: any) => {
      if (!socketRef.current || !socketRef.current.connected) return;

      // Throttle canvas updates to 10 per second
      if (throttleRef.current) {
        clearTimeout(throttleRef.current);
      }

      throttleRef.current = setTimeout(() => {
        socketRef.current?.emit('canvas-change', {
          roomId,
          elements,
          appState,
        });
      }, 100); // 100ms throttle
    },
    [roomId]
  );

  const requestCanvasState = useCallback(() => {
    if (!socketRef.current || !socketRef.current.connected) return;
    socketRef.current.emit('request-canvas-state', { roomId, userId });
  }, [roomId, userId]);

  return {
    socket: socketRef.current,
    isConnected,
    users,
    sendCanvasChange,
    requestCanvasState,
  };
}
