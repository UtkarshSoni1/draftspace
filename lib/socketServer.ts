import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';

let io: SocketIOServer | null = null;

interface UserCursor {
  userId: string;
  userName: string;
  userColor: string;
  x: number;
  y: number;
  timestamp: number;
}

interface RoomUser {
  userId: string;
  userName: string;
  userColor: string;
  joinedAt: number;
}

// In-memory store for active rooms and users
const roomUsers = new Map<string, Map<string, RoomUser>>();
const roomCursors = new Map<string, Map<string, UserCursor>>();

export function initSocketServer(httpServer: HTTPServer): SocketIOServer {
  if (io) {
    return io;
  }

  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      credentials: true,
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket: Socket) => {
    console.log('[Socket] User connected:', socket.id);

    // User joins a room
    socket.on('join-room', (data: { roomId: string; userId: string; userName: string; userColor: string }) => {
      const { roomId, userId, userName, userColor } = data;
      socket.join(roomId);

      // Store user in room
      if (!roomUsers.has(roomId)) {
        roomUsers.set(roomId, new Map());
      }
      roomUsers.get(roomId)!.set(userId, {
        userId,
        userName,
        userColor,
        joinedAt: Date.now(),
      });

      if (!roomCursors.has(roomId)) {
        roomCursors.set(roomId, new Map());
      }

      // Notify others in room
      const users = Array.from(roomUsers.get(roomId)!.values());
      io!.to(roomId).emit('user-joined', { users, joinedUser: { userId, userName, userColor } });

      console.log(`[Socket] User ${userId} joined room ${roomId}`);
    });

    // User leaves room
    socket.on('leave-room', (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      socket.leave(roomId);

      // Remove user from room
      if (roomUsers.has(roomId)) {
        roomUsers.get(roomId)!.delete(userId);
        const remaining = roomUsers.get(roomId)!.size;

        // Clean up empty room
        if (remaining === 0) {
          roomUsers.delete(roomId);
          roomCursors.delete(roomId);
        } else {
          const users = Array.from(roomUsers.get(roomId)!.values());
          io!.to(roomId).emit('user-left', { userId, users });
        }
      }

      console.log(`[Socket] User ${userId} left room ${roomId}`);
    });

    // Cursor movement
    socket.on('cursor-move', (data: { roomId: string; userId: string; x: number; y: number }) => {
      const { roomId, userId, x, y } = data;

      if (!roomCursors.has(roomId)) {
        roomCursors.set(roomId, new Map());
      }

      const cursors = roomCursors.get(roomId)!;
      const existing = cursors.get(userId);

      const cursor: UserCursor = {
        userId,
        userName: existing?.userName || '',
        userColor: existing?.userColor || '',
        x,
        y,
        timestamp: Date.now(),
      };

      cursors.set(userId, cursor);

      // Broadcast to room (throttled via client)
      socket.to(roomId).emit('remote-cursor', { userId, x, y });
    });

    // Canvas changes (elements, appState)
    socket.on('canvas-change', (data: { roomId: string; elements: any[]; appState: any }) => {
      const { roomId, elements, appState } = data;
      // Broadcast to other users in room
      socket.to(roomId).emit('canvas-updated', { elements, appState });
    });

    // Request initial canvas state
    socket.on('request-canvas-state', (data: { roomId: string; userId: string }) => {
      const { roomId, userId } = data;
      // In production, fetch from DB
      io!.to(socket.id).emit('canvas-state', {
        elements: [],
        appState: {},
      });
    });

    // Disconnect
    socket.on('disconnect', () => {
      // Clean up user from all rooms
      for (const [roomId, users] of roomUsers.entries()) {
        for (const [userId, _] of users.entries()) {
          // The user left via leave-room event or client disconnect
          users.delete(userId);
        }
        if (users.size === 0) {
          roomUsers.delete(roomId);
          roomCursors.delete(roomId);
        }
      }
      console.log('[Socket] User disconnected:', socket.id);
    });
  });

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}

export { Socket };
