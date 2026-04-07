'use client';

import { useCallback, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SettingsPanel, type AIProvider } from '@/components/SettingsPanel';
import { CommandInput } from '@/components/CommandInput';
import ToastContainer from '@/components/ToastNotification';
import PropertiesPanel from '@/components/PropertiesPanel';
import { Canvas } from '@/components/Canvas';
import { RoomDialog } from '@/components/RoomDialog';
import { CollaborationPanel } from '@/components/CollaborationPanel';
import { RemoteCursor } from '@/components/RemoteCursor';
import { Navbar } from '@/components/Navbar';
import { SplashScreen } from '@/components/SplashScreen';
import { EmptyCanvasHint } from '@/components/EmptyCanvasHint';
import { useCollaboration } from '@/hooks/useCollaboration';
import { useRemoteCursors } from '@/hooks/useRemoteCursors';
import { useToast } from '@/context/ToastContext';

const STORAGE_KEY = 'draftspace-settings';

type SelectedShape = {
  id: string;
  type: 'shape';
  x: number;
  y: number;
  width: number;
  height: number;
  shapeProps: {
    fillColor: string;
    strokeColor: string;
    strokeWidth: number;
    opacity: number;
  };
};

type PersistedSettings = {
  activeTool: ToolType;
  color: string;
  strokeWidth: number;
  aiProvider: AIProvider;
  apiKey: string;
  gridEnabled: boolean;
  snapToGridEnabled: boolean;
  darkMode: boolean;
  exportBackgroundEnabled: boolean;
  exportScale: number;
};

const defaultSettings: PersistedSettings = {
  activeTool: 'pen',
  color: '#000000',
  strokeWidth: 2,
  aiProvider: 'openai',
  apiKey: '',
  gridEnabled: false,
  snapToGridEnabled: false,
  darkMode: false,
  exportBackgroundEnabled: true,
  exportScale: 1,
};

export default function Home() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const [hydrated, setHydrated] = useState(false);

  // Collaboration state
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [activeRoomName, setActiveRoomName] = useState<string>('');
  const [isCollaborating, setIsCollaborating] = useState(false);

  // Collaboration hooks
  const { socket, isConnected, users, sendCanvasChange, requestCanvasState } = useCollaboration({
    roomId: activeRoomId || '',
    userId: session?.user?.email || 'anonymous',
    userName: session?.user?.name || 'Anonymous',
    enabled: isCollaborating && !!activeRoomId,
  });

  const { cursors } = useRemoteCursors({
    socket,
    enabled: isCollaborating,
  });

  // Track local cursor movement
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!socket || !isCollaborating) return;

      const throttled = (socket as any).__cursorThrottle;
      if (throttled && Date.now() - throttled < 50) return;

      socket.emit('cursor-move', {
        roomId: activeRoomId,
        userId: session?.user?.email || 'anonymous',
        x: e.clientX,
        y: e.clientY,
      });
      (socket as any).__cursorThrottle = Date.now();
    },
    [socket, isCollaborating, activeRoomId, session]
  );

  const [activeTool, setActiveTool] = useState<ToolType>(defaultSettings.activeTool);
  const [strokeColor, setStrokeColor] = useState(defaultSettings.color);
  const [strokeWidth, setStrokeWidth] = useState(defaultSettings.strokeWidth);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aiProvider, setAIProvider] = useState<AIProvider>(defaultSettings.aiProvider);
  const [apiKey, setApiKey] = useState(defaultSettings.apiKey);
  const [gridEnabled, setGridEnabled] = useState(defaultSettings.gridEnabled);
  const [snapToGridEnabled, setSnapToGridEnabled] = useState(
    defaultSettings.snapToGridEnabled
  );
  const [darkMode, setDarkMode] = useState(defaultSettings.darkMode);
  const [exportBackgroundEnabled, setExportBackgroundEnabled] = useState(
    defaultSettings.exportBackgroundEnabled
  );
  const [exportScale, setExportScale] = useState(defaultSettings.exportScale);

  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [excalidrawAPI, setExcalidrawAPI] = useState<any>(null);

  const [boardTitle, setBoardTitle] = useState('Untitled Board');
  const [canvasEmpty, setCanvasEmpty] = useState(true);

  const [selectedElement, setSelectedElement] = useState<SelectedShape | null>({
    id: 'element-1',
    type: 'shape',
    x: 100,
    y: 100,
    width: 200,
    height: 150,
    shapeProps: {
      fillColor: '#3b82f6',
      strokeColor: '#1e40af',
      strokeWidth: 2,
      opacity: 100,
    },
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw) as Partial<PersistedSettings>;
        if (s.activeTool) setActiveTool(s.activeTool);
        if (s.color) setStrokeColor(s.color);
        if (typeof s.strokeWidth === 'number') setStrokeWidth(s.strokeWidth);
        if (s.aiProvider) setAIProvider(s.aiProvider);
        if (typeof s.apiKey === 'string') setApiKey(s.apiKey);
        if (typeof s.gridEnabled === 'boolean') setGridEnabled(s.gridEnabled);
        if (typeof s.snapToGridEnabled === 'boolean')
          setSnapToGridEnabled(s.snapToGridEnabled);
        if (typeof s.darkMode === 'boolean') setDarkMode(s.darkMode);
        if (typeof s.exportBackgroundEnabled === 'boolean')
          setExportBackgroundEnabled(s.exportBackgroundEnabled);
        if (typeof s.exportScale === 'number') setExportScale(s.exportScale);
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const payload: PersistedSettings = {
      activeTool,
      color: strokeColor,
      strokeWidth,
      aiProvider,
      apiKey,
      gridEnabled,
      snapToGridEnabled,
      darkMode,
      exportBackgroundEnabled,
      exportScale,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch {
      /* ignore */
    }
  }, [
    hydrated,
    activeTool,
    strokeColor,
    strokeWidth,
    aiProvider,
    apiKey,
    gridEnabled,
    snapToGridEnabled,
    darkMode,
    exportBackgroundEnabled,
    exportScale,
  ]);

  const handleToolChange = useCallback((tool: ToolType) => {
    setActiveTool(tool);
    if (tool === 'select') {
      /* selection mode */
    }
  }, []);

  const handleColorChange = useCallback((color: string) => {
    setStrokeColor(color);
    setSelectedElement((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        shapeProps: { ...prev.shapeProps, fillColor: color },
      };
    });
  }, []);

  const handleStrokeWidthChange = useCallback((width: number) => {
    setStrokeWidth(width);
    setSelectedElement((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        shapeProps: { ...prev.shapeProps, strokeWidth: width },
      };
    });
  }, []);

  const handleUndo = () => {
    if (excalidrawAPI?.undo) {
      excalidrawAPI.undo();
      setUndoCount((c) => Math.max(0, c - 1));
    }
  };

  const handleRedo = () => {
    if (excalidrawAPI?.redo) {
      excalidrawAPI.redo();
      setRedoCount((c) => c + 1);
    }
  };

  const handleExport = (format: 'png' | 'svg' | 'json') => {
    if (!excalidrawAPI) return;
    
    const exportFunc = excalidrawAPI[format === 'png' ? 'exportToPng' : format === 'svg' ? 'exportToSvg' : 'exportToJson'];
    if (exportFunc) {
      try {
        const elements = excalidrawAPI.getSceneElements?.();
        const appState = excalidrawAPI.getAppState?.();
        
        if (format === 'json') {
          const data = {
            elements: elements || [],
            appState: appState || {},
          };
          const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `drawing-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } else if (format === 'png') {
          excalidrawAPI.exportToPng?.({
            elements: elements || [],
            appState: appState || {},
            name: `drawing-${Date.now()}`,
          });
        } else if (format === 'svg') {
          excalidrawAPI.exportToSvg?.({
            elements: elements || [],
            appState: appState || {},
            name: `drawing-${Date.now()}`,
          });
        }
      } catch (e) {
        console.error('Export failed:', e);
      }
    }
    console.log('Exporting as:', format);
  };

  const handleClear = () => {
    if (excalidrawAPI?.updateScene) {
      excalidrawAPI.updateScene({
        elements: [],
        appState: {},
        storeAction: 'capture',
      });
      setUndoCount(0);
      setRedoCount(0);
      setSelectedElement(null);
    }
  };

  const handlePropertyChange = useCallback(
    (elementId: string, property: string, value: unknown) => {
      setSelectedElement((prev) => {
        if (!prev || prev.id !== elementId) return prev;
        const parts = property.split('.');
        if (parts.length === 1) {
          return { ...prev, [property]: value } as SelectedShape;
        }
        const [head, ...rest] = parts;
        const key = rest.join('.');
        if (head === 'shapeProps' && prev.shapeProps) {
          return {
            ...prev,
            shapeProps: {
              ...prev.shapeProps,
              [key]: value,
            },
          };
        }
        return prev;
      });
    },
    []
  );

  const handleDelete = (_elementId: string) => {
    setSelectedElement(null);
  };

  const handleDuplicate = (_elementId: string) => {
    setSelectedElement((prev) =>
      prev
        ? {
            ...prev,
            id: `${prev.id}-copy-${Date.now()}`,
            x: prev.x + 24,
            y: prev.y + 24,
          }
        : null
    );
  };

  const handleBringToFront = (_elementId: string) => {
    /* z-index handled when canvas has layers */
  };

  const handleSendToBack = (_elementId: string) => {
    /* z-index handled when canvas has layers */
  };

  const handleCommandLog = useCallback(async (command: string) => {
    console.log('Command finished:', command);
  }, []);

  const handlePatternDetected = useCallback(
    (pattern: 'ai' | 'img' | 'code', value: string) => {
      console.log(`Pattern detected: ${pattern}`, value);
    },
    []
  );

  const handleRoomSelected = useCallback(
    async (roomId: string) => {
      try {
        const response = await fetch(`/api/rooms/get?roomId=${roomId}`);
        if (!response.ok) throw new Error('Room not found');

        const data = await response.json();
        setActiveRoomId(roomId);
        setActiveRoomName(data.room.name);
        setIsCollaborating(true);

        addToast({
          type: 'success',
          message: 'Connected to room',
          description: `Joined ${data.room.name}`,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Failed to join room';
        addToast({
          type: 'error',
          message: 'Error',
          description: msg,
        });
      }
    },
    [addToast]
  );

  const handleLeaveRoom = useCallback(() => {
    setIsCollaborating(false);
    setActiveRoomId(null);
    setActiveRoomName('');

    addToast({
      type: 'success',
      message: 'Left room',
      description: 'Disconnected from collaboration',
    });
  }, [addToast]);

  // Sync canvas changes when collaborating
  useEffect(() => {
    if (!excalidrawAPI || !isCollaborating) return;

    const handleCanvasChange = (elements: any[], appState: any) => {
      sendCanvasChange(elements, appState);
    };

    // Hook into excalidraw's onChange if available
    const originalAPI = excalidrawAPI;
    // This would need to be properly integrated with the Canvas component
    // For now, we listen to canvas updates via the remote event
    const handleRemoteUpdate = (event: CustomEvent) => {
      const { elements, appState } = event.detail;
      if (originalAPI?.updateScene) {
        originalAPI.updateScene({
          elements,
          appState,
          storeAction: 'capture',
        });
      }
    };

    window.addEventListener('remote-canvas-update', handleRemoteUpdate as EventListener);
    return () => {
      window.removeEventListener('remote-canvas-update', handleRemoteUpdate as EventListener);
    };
  }, [excalidrawAPI, isCollaborating, sendCanvasChange]);

  return (
    <div
      className="h-screen w-screen flex flex-col overflow-hidden"
      style={{ backgroundColor: '#F7F3E8' }}
      onMouseMove={handleMouseMove}
    >
      <SplashScreen />
      <Navbar 
        title={boardTitle}
        onTitleChange={setBoardTitle}
        isConnected={isConnected}
      />

      <div className="flex-1 min-h-0 relative w-full h-full flex items-center justify-between" style={{ marginTop: '56px' }}>
        {/* Collaboration Panel */}
        {isCollaborating && activeRoomId && (
          <CollaborationPanel
            roomId={activeRoomId}
            roomName={activeRoomName}
            users={users}
            isConnected={isConnected}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {/* Room Dialog - shown when not collaborating */}
        {!isCollaborating && (
          <div className="absolute top-4 left-4 z-40">
            <RoomDialog onRoomSelected={handleRoomSelected} />
          </div>
        )}

        {/* Settings Panel */}
        <div className="absolute top-4 right-4 z-40">
          <SettingsPanel
            open={settingsOpen}
            onOpenChange={setSettingsOpen}
            aiProvider={aiProvider}
            onAIProviderChange={setAIProvider}
            apiKey={apiKey}
            onAPIKeyChange={setApiKey}
            gridEnabled={gridEnabled}
            onGridToggle={setGridEnabled}
            snapToGridEnabled={snapToGridEnabled}
            onSnapToGrid={setSnapToGridEnabled}
            darkModeEnabled={darkMode}
            onDarkModeToggle={setDarkMode}
            exportBackgroundEnabled={exportBackgroundEnabled}
            onExportBackgroundToggle={setExportBackgroundEnabled}
            exportScale={exportScale}
            onExportScaleChange={setExportScale}
            roomId={activeRoomId || undefined}
            onlineUsers={users.length}
          />
        </div>

        {/* Canvas */}
        <div className="relative flex-1 w-full h-full">
          <Canvas
            gridEnabled={gridEnabled}
            snapToGridEnabled={snapToGridEnabled}
            darkMode={darkMode}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            activeTool={activeTool}
            onExcalidrawAPI={setExcalidrawAPI}
          />
          <EmptyCanvasHint isEmpty={canvasEmpty} />
        </div>

        {/* Remote Cursors */}
        {isCollaborating &&
          Array.from(cursors.values()).map((cursor) => (
            <RemoteCursor
              key={cursor.userId}
              userId={cursor.userId}
              x={cursor.x}
              y={cursor.y}
              userName={cursor.userName}
              userColor={cursor.userColor}
            />
          ))}
      </div>

      {/* Command Input */}
      <CommandInput
        onSubmit={handleCommandLog}
        onPatternDetected={handlePatternDetected}
        excalidrawAPI={excalidrawAPI}
      />

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
