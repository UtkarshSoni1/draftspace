'use client';

import { useState } from 'react';
import { Plus, LogIn, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/context/ToastContext';

interface RoomDialogProps {
  onRoomSelected: (roomId: string) => void;
  defaultTab?: 'create' | 'join';
}

export function RoomDialog({ onRoomSelected, defaultTab = 'create' }: RoomDialogProps) {
  const { addToast } = useToast();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<'create' | 'join'>(defaultTab);
  const [roomName, setRoomName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      addToast({
        type: 'error',
        message: 'Room name required',
        description: 'Please enter a name for your room',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/rooms/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create room');
      }

      const data = await response.json();

      addToast({
        type: 'success',
        message: 'Room created',
        description: `Room ID: ${data.room.roomId}`,
      });

      setRoomName('');
      setOpen(false);
      onRoomSelected(data.room.roomId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to create room';
      addToast({
        type: 'error',
        message: 'Error',
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      addToast({
        type: 'error',
        message: 'Room ID required',
        description: 'Please enter a room ID to join',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/rooms/get?roomId=${roomId}`);

      if (!response.ok) throw new Error('Room not found');

      addToast({
        type: 'success',
        message: 'Room found',
        description: `Joining ${roomId}`,
      });

      setRoomId('');
      setOpen(false);
      onRoomSelected(roomId);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Room not found';
      addToast({
        type: 'error',
        message: 'Error',
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          Collaboration
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Live Collaboration</DialogTitle>
          <DialogDescription>
            Create a new room or join an existing one to collaborate in real-time
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4 border-b border-slate-200">
          <button
            onClick={() => setTab('create')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'create'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Create Room
          </button>
          <button
            onClick={() => setTab('join')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === 'join'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Join Room
          </button>
        </div>

        {tab === 'create' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room-name" className="text-sm font-medium">
                Room Name
              </Label>
              <Input
                id="room-name"
                placeholder="e.g., Design Meeting"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateRoom();
                }}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleCreateRoom}
              disabled={isLoading || !roomName.trim()}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Create Room
                </>
              )}
            </Button>
          </div>
        )}

        {tab === 'join' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="room-id" className="text-sm font-medium">
                Room ID
              </Label>
              <Input
                id="room-id"
                placeholder="Enter room ID (e.g., ABC123DEF456)"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleJoinRoom();
                }}
                disabled={isLoading}
                maxLength={16}
              />
            </div>
            <Button
              onClick={handleJoinRoom}
              disabled={isLoading || !roomId.trim()}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Join Room
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
