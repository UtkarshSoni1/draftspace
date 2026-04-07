'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Logo } from './Logo';
import { SaveStatus } from './SaveStatus';
import { LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  boardTitle?: string;
  onTitleChange?: (title: string) => void;
  isSaving?: boolean;
  lastSaved?: Date | null;
  saveError?: string | null;
}

export function Navbar({
  boardTitle = 'Untitled Board',
  onTitleChange,
  isSaving = false,
  lastSaved = null,
  saveError = null,
}: NavbarProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [localTitle, setLocalTitle] = useState(boardTitle);
  const [isEditing, setIsEditing] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync local title with prop
  useEffect(() => {
    setLocalTitle(boardTitle);
  }, [boardTitle]);

  // Debounced title change
  const handleTitleInputChange = useCallback(
    (newTitle: string) => {
      setLocalTitle(newTitle);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        if (onTitleChange) {
          onTitleChange(newTitle);
        }
      }, 1000);
    },
    [onTitleChange]
  );

  const handleTitleBlur = () => {
    setIsEditing(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    if (onTitleChange && localTitle !== boardTitle) {
      onTitleChange(localTitle);
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

      {/* Center: Board title input + Save status */}
      <div className="flex-1 min-w-0 flex items-center justify-center gap-3 px-4">
        {isEditing ? (
          <input
            type="text"
            value={localTitle}
            onChange={(e) => handleTitleInputChange(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTitleBlur();
              }
            }}
            autoFocus
            className="text-center text-sm font-medium bg-transparent border-0 outline-none max-w-xs"
            style={{
              color: '#5C4A2A',
              borderBottom: '1px solid #9CA764',
            }}
          />
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: '#5C4A2A' }}
          >
            {localTitle}
          </button>
        )}
        
        <SaveStatus
          isSaving={isSaving}
          lastSaved={lastSaved}
          error={saveError}
        />
      </div>

      {/* Right: Dashboard, Avatar, Sign in */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Dashboard button (only show if logged in) */}
        {session && (
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-all hover:bg-opacity-10"
            style={{
              color: '#5C4A2A',
              borderColor: '#E8DDB5',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E8DDB5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>My Boards</span>
          </button>
        )}

        {/* User avatar or sign in */}
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
            className="px-3 py-1 text-sm font-medium rounded-lg border transition-all hover:bg-opacity-10"
            style={{
              color: '#5C4A2A',
              borderColor: '#9CA764',
            }}
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
