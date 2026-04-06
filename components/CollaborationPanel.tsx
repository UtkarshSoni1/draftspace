'use client';

import { Users, Copy, Check } from 'lucide-react';
import { useState } from 'react';

interface RoomUser {
  userId: string;
  userName: string;
  userColor: string;
}

interface CollaborationPanelProps {
  roomId: string;
  roomName: string;
  users: RoomUser[];
  isConnected: boolean;
  onLeaveRoom?: () => void;
}

export function CollaborationPanel({
  roomId,
  roomName,
  users,
  isConnected,
  onLeaveRoom,
}: CollaborationPanelProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/room/${roomId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-4 left-4 z-40 bg-white border border-slate-200 rounded-lg shadow-lg p-4 max-w-xs">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-slate-600" />
        <div className="flex-1">
          <h3 className="font-semibold text-sm text-slate-900">
            {roomName}
          </h3>
          <p className="text-xs text-slate-500">
            {isConnected ? 'Connected' : 'Connecting...'}
          </p>
        </div>
      </div>

      {/* Users List */}
      <div className="mb-4">
        <p className="text-xs font-medium text-slate-600 mb-2">
          Active Users ({users.length})
        </p>
        <div className="space-y-1">
          {users.length === 0 ? (
            <p className="text-xs text-slate-500">No other users in room</p>
          ) : (
            users.map((user) => (
              <div
                key={user.userId}
                className="flex items-center gap-2 px-2 py-1 rounded bg-slate-50"
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: user.userColor }}
                />
                <span className="text-xs text-slate-700 truncate">
                  {user.userName}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Share Room */}
      <div className="mb-4 p-3 bg-slate-50 rounded border border-slate-200">
        <p className="text-xs font-medium text-slate-600 mb-2">Share Room</p>
        <div className="flex items-center gap-2">
          <code className="text-xs text-slate-600 truncate bg-white px-2 py-1 rounded border border-slate-200 flex-1">
            {roomId}
          </code>
          <button
            onClick={copyToClipboard}
            className="flex-shrink-0 p-1 hover:bg-slate-200 rounded transition-colors"
            title="Copy room ID"
          >
            {copied ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Leave Button */}
      {onLeaveRoom && (
        <button
          onClick={onLeaveRoom}
          className="w-full px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
        >
          Leave Room
        </button>
      )}
    </div>
  );
}
