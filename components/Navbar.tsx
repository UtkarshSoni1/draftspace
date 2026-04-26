'use client';

import { useState } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { Logo } from './Logo';

interface NavbarProps {
  title?: string;
  onTitleChange?: (title: string) => void;
  isConnected?: boolean;
}

export function Navbar({
  title = 'Untitled Board',
  onTitleChange,
  isConnected = true,
}: NavbarProps) {
  const { data: session } = useSession();
  const [boardTitle, setBoardTitle] = useState(title);
  const [isEditing, setIsEditing] = useState(false);

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (onTitleChange) {
      onTitleChange(boardTitle);
    }
  };

  const getUserInitial = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 h-14 border-b flex items-center justify-between px-4 gap-4"
      style={{
        backgroundColor: '#FDFAF3',
        borderColor: '#E8DDB5',
        boxShadow: '0 1px 8px rgba(92, 74, 42, 0.06)',
      }}
    >
      {/* Left: Logo */}
      <div className="flex-shrink-0">
        <Logo size="sm" />
      </div>

      {/* Center: Board title */}
      <div className="flex-1 min-w-0 flex justify-center px-4">
        {isEditing ? (
          <input
            type="text"
            value={boardTitle}
            onChange={(e) => setBoardTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleTitleBlur();
            }}
            autoFocus
            className="text-center text-sm font-medium bg-transparent border-0 outline-none max-w-xs"
            style={{ color: '#5C4A2A', borderBottom: '1px solid #9CA764' }}
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: '#5C4A2A' }}
          >
            {boardTitle}
          </button>
        )}
      </div>

      {/* Right: Status, Avatar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
          style={{
            backgroundColor: isConnected ? '#9CA764' : '#E8DDB5',
            color: isConnected ? 'white' : '#5C4A2A',
          }}
        >
          {isConnected ? (
            <><span>●</span><span>Live</span></>
          ) : (
            <><span>○</span><span>Offline</span></>
          )}
        </div>

        {session ? (
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-white font-semibold text-sm"
            style={{ backgroundColor: '#9CA764' }}
            title={session.user?.name || 'User'}
          >
            {getUserInitial()}
          </div>
        ) : (
          <button
            onClick={() => signIn()}
            className="px-3 py-1 text-sm font-medium rounded-lg border transition-all"
            style={{ color: '#5C4A2A', borderColor: '#9CA764' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#9CA764';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#5C4A2A';
            }}
          >
            Sign in
          </button>
        )}
      </div>
    </div>
  );
}
