'use client';

import { useCallback, useEffect, useRef, useState, lazy, Suspense } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import Excalidraw to prevent server-side evaluation
const Excalidraw = dynamic(() => import('@excalidraw/excalidraw').then(mod => ({ default: mod.Excalidraw })), {
  ssr: false,
  loading: () => <div className="w-full h-full flex items-center justify-center">Loading canvas...</div>,
});

interface CanvasProps {
  gridEnabled?: boolean;
  snapToGridEnabled?: boolean;
  darkMode?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  activeTool?: string;
  onExcalidrawAPI?: (api: any) => void;
}

export function Canvas({
  gridEnabled = false,
  snapToGridEnabled = false,
  darkMode = false,
  strokeColor = '#000000',
  strokeWidth = 2,
  activeTool = 'selection',
  onExcalidrawAPI,
}: CanvasProps) {
  const excalidrawRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Callback when Excalidraw is ready
  const handleExcalidrawAPI = useCallback(
    (api: any) => {
      excalidrawRef.current = api;
      if (api && onExcalidrawAPI) {
        onExcalidrawAPI(api);
      }
    },
    [onExcalidrawAPI]
  );

  // Track changes
  const handleChange = useCallback((elements: any, appState: any, files: any) => {
    // Canvas is tracking changes
  }, []);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-slate-500">Loading canvas...</div>
      </div>
    );
  }

  return (
    <div
      className="w-full h-full"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
      }}
    >
      <div
        style={{
          flex: 1,
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <Excalidraw
          onChange={handleChange}
          excalidrawAPI={handleExcalidrawAPI}
          readOnly={false}
          viewModeEnabled={false}
          zenModeEnabled={false}
          gridModeEnabled={gridEnabled}
          theme={darkMode ? 'dark' : 'light'}
          initialData={{
            appState: {
              activeTool: {
                type: activeTool === 'pen' ? 'freedraw' : activeTool === 'select' ? 'selection' : activeTool,
              },
              currentItemStrokeColor: strokeColor,
              currentItemStrokeWidth: strokeWidth,
            },
          }}
        />
      </div>
    </div>
  );
}
