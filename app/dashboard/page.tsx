'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Plus, PenTool, Sparkles, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Board {
  _id: string;
  title: string;
  thumbnail: string | null;
  updatedAt: string;
  createdAt: string;
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'just now';
  }
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [boards, setBoards] = useState<Board[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  // Rename dialog state
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [renameBoardId, setRenameBoardId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteBoardId, setDeleteBoardId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/dashboard');
    }
  }, [status, router]);

  // Fetch boards
  useEffect(() => {
    if (status !== 'authenticated') return;

    const fetchBoards = async () => {
      try {
        const response = await fetch('/api/boards');
        if (response.ok) {
          const data = await response.json();
          setBoards(data.boards);
        }
      } catch (error) {
        console.error('Error fetching boards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoards();
  }, [status]);

  const handleCreateBoard = async () => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Untitled Board' }),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/?board=${data.board._id}`);
      }
    } catch (error) {
      console.error('Error creating board:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenBoard = (boardId: string) => {
    router.push(`/?board=${boardId}`);
  };

  const handleRenameClick = (board: Board) => {
    setRenameBoardId(board._id);
    setRenameValue(board.title);
    setRenameDialogOpen(true);
  };

  const handleRenameSubmit = async () => {
    if (!renameBoardId || !renameValue.trim()) return;

    setIsRenaming(true);
    try {
      const response = await fetch(`/api/boards/${renameBoardId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: renameValue.trim() }),
      });

      if (response.ok) {
        setBoards((prev) =>
          prev.map((b) =>
            b._id === renameBoardId ? { ...b, title: renameValue.trim() } : b
          )
        );
        setRenameDialogOpen(false);
      }
    } catch (error) {
      console.error('Error renaming board:', error);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDeleteClick = (boardId: string) => {
    setDeleteBoardId(boardId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteBoardId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/boards/${deleteBoardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setBoards((prev) => prev.filter((b) => b._id !== deleteBoardId));
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting board:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const getUserInitial = () => {
    if (session?.user?.name) {
      return session.user.name.charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (status === 'loading' || isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#F7F3E8' }}
      >
        <div className="text-center">
          <div
            className="w-8 h-8 border-2 rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: '#E8DDB5', borderTopColor: '#9CA764' }}
          />
          <p style={{ color: '#5C4A2A' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F7F3E8' }}>
      {/* Navbar */}
      <div
        className="h-14 border-b flex items-center justify-between px-4"
        style={{
          backgroundColor: '#FDFAF3',
          borderColor: '#E8DDB5',
          boxShadow: '0 1px 8px rgba(92, 74, 42, 0.06)',
        }}
      >
        <Logo size="sm" />

        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center w-8 h-8 rounded-full text-white font-semibold text-sm"
            style={{ backgroundColor: '#9CA764' }}
            title={session?.user?.name || 'User'}
          >
            {getUserInitial()}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1
            className="text-2xl font-semibold"
            style={{ color: '#5C4A2A' }}
          >
            My Boards
          </h1>

          <button
            onClick={handleCreateBoard}
            disabled={isCreating}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
            style={{
              backgroundColor: '#9CA764',
              color: 'white',
            }}
            onMouseEnter={(e) => {
              if (!isCreating) {
                e.currentTarget.style.backgroundColor = '#7A8A4E';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#9CA764';
            }}
          >
            <Plus className="w-4 h-4" />
            <span>New Board</span>
          </button>
        </div>

        {/* Board Grid or Empty State */}
        {boards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: '#E8DDB5' }}
            >
              <div className="relative">
                <PenTool className="w-10 h-10" style={{ color: '#9CA764' }} />
                <Sparkles
                  className="w-5 h-5 absolute -top-1 -right-1"
                  style={{ color: '#9CA764' }}
                />
              </div>
            </div>

            <h2
              className="text-xl font-semibold mb-2"
              style={{ color: '#5C4A2A' }}
            >
              No boards yet
            </h2>

            <p
              className="text-sm mb-6"
              style={{ color: '#5C4A2A', opacity: 0.7 }}
            >
              Create your first board to get started
            </p>

            <button
              onClick={handleCreateBoard}
              disabled={isCreating}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-xl transition-all disabled:opacity-50"
              style={{
                backgroundColor: '#9CA764',
                color: 'white',
              }}
              onMouseEnter={(e) => {
                if (!isCreating) {
                  e.currentTarget.style.backgroundColor = '#7A8A4E';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#9CA764';
              }}
            >
              <Plus className="w-4 h-4" />
              <span>New Board</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {boards.map((board) => (
              <div
                key={board._id}
                className="group relative brand-card overflow-hidden cursor-pointer transition-all hover:shadow-lg"
                onClick={() => handleOpenBoard(board._id)}
              >
                {/* Thumbnail or Placeholder */}
                <div
                  className="aspect-video flex items-center justify-center"
                  style={{
                    backgroundColor: board.thumbnail ? 'transparent' : '#F1E8C7',
                  }}
                >
                  {board.thumbnail ? (
                    <img
                      src={board.thumbnail}
                      alt={board.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PenTool
                      className="w-8 h-8"
                      style={{ color: '#9CA764', opacity: 0.5 }}
                    />
                  )}
                </div>

                {/* Board Info */}
                <div className="p-3">
                  <h3
                    className="text-sm font-medium truncate"
                    style={{ color: '#5C4A2A' }}
                  >
                    {board.title}
                  </h3>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: '#E8DDB5' }}
                  >
                    {getRelativeTime(board.updatedAt)}
                  </p>
                </div>

                {/* Menu Button */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: 'rgba(253, 250, 243, 0.9)',
                          color: '#5C4A2A',
                        }}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameClick(board);
                        }}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(board._id);
                        }}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Board</DialogTitle>
          </DialogHeader>
          <Input
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            placeholder="Board name"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleRenameSubmit();
              }
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRenameSubmit}
              disabled={isRenaming || !renameValue.trim()}
              style={{
                backgroundColor: '#9CA764',
                color: 'white',
              }}
            >
              {isRenaming ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
          </DialogHeader>
          <p style={{ color: '#5C4A2A' }}>
            Are you sure you want to delete this board? This action cannot be
            undone.
          </p>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              variant="destructive"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
