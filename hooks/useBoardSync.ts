'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface BoardData {
  _id: string;
  title: string;
  elements: unknown[];
  appState: Record<string, unknown>;
  thumbnail: string | null;
  updatedAt: string;
  createdAt: string;
}

interface UseBoardSyncReturn {
  isSaving: boolean;
  lastSaved: Date | null;
  error: string | null;
  saveBoard: (
    elements: unknown[],
    appState: Record<string, unknown>,
    title?: string,
    thumbnail?: string
  ) => Promise<void>;
  autoSave: (
    elements: unknown[],
    appState: Record<string, unknown>,
    title?: string
  ) => void;
  boardData: BoardData | null;
  boardId: string | null;
  isLoading: boolean;
}

export function useBoardSync(initialBoardId: string | null): UseBoardSyncReturn {
  const [boardId, setBoardId] = useState<string | null>(initialBoardId);
  const [boardData, setBoardData] = useState<BoardData | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveDataRef = useRef<string>('');

  // Fetch board data on mount if boardId exists
  useEffect(() => {
    if (!initialBoardId) {
      setBoardData(null);
      return;
    }

    const fetchBoard = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/boards/${initialBoardId}`);

        if (!response.ok) {
          if (response.status === 404) {
            setError('Board not found');
          } else {
            setError('Failed to load board');
          }
          return;
        }

        const data = await response.json();
        setBoardData(data.board);
        setBoardId(initialBoardId);
        
        if (data.board.updatedAt) {
          setLastSaved(new Date(data.board.updatedAt));
        }
      } catch (err) {
        console.error('Error fetching board:', err);
        setError('Failed to load board');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBoard();
  }, [initialBoardId]);

  // Save board function
  const saveBoard = useCallback(
    async (
      elements: unknown[],
      appState: Record<string, unknown>,
      title?: string,
      thumbnail?: string
    ) => {
      setIsSaving(true);
      setError(null);

      try {
        let targetBoardId = boardId;

        // If no boardId, create a new board first
        if (!targetBoardId) {
          const createResponse = await fetch('/api/boards', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title || 'Untitled Board' }),
          });

          if (!createResponse.ok) {
            throw new Error('Failed to create board');
          }

          const createData = await createResponse.json();
          targetBoardId = createData.board._id;
          setBoardId(targetBoardId);

          // Update URL without triggering navigation (only if window exists)
          if (typeof window !== 'undefined') {
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('board', targetBoardId);
            window.history.replaceState({}, '', newUrl.toString());
          }
        }

        // Now update the board with content
        const updateResponse = await fetch(`/api/boards/${targetBoardId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            elements,
            appState,
            title,
            thumbnail,
          }),
        });

        if (!updateResponse.ok) {
          throw new Error('Failed to save board');
        }

        const updateData = await updateResponse.json();
        setLastSaved(new Date(updateData.updatedAt));
        
        // Update the hash to track what we've saved
        lastSaveDataRef.current = JSON.stringify({ elements, title });
        
        // Update URL without triggering navigation (only if window exists)
        if (typeof window !== 'undefined') {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set('board', targetBoardId);
          window.history.replaceState({}, '', newUrl.toString());
        }
      } catch (err) {
        console.error('Error saving board:', err);
        setError(err instanceof Error ? err.message : 'Failed to save');
      } finally {
        setIsSaving(false);
      }
    },
    [boardId]
  );

  // Auto-save function with 3 second debounce
  const autoSave = useCallback(
    (
      elements: unknown[],
      appState: Record<string, unknown>,
      title?: string
    ) => {
      // Don't auto-save if elements array is empty
      if (!elements || elements.length === 0) {
        return;
      }

      // Check if data has actually changed
      const currentDataHash = JSON.stringify({ elements, title });
      if (currentDataHash === lastSaveDataRef.current) {
        return;
      }

      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for 3 seconds
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveBoard(elements, appState, title);
      }, 3000);
    },
    [saveBoard]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, []);

  return {
    isSaving,
    lastSaved,
    error,
    saveBoard,
    autoSave,
    boardData,
    boardId,
    isLoading,
  };
}
