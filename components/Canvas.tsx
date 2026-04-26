'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const UI_OPTIONS = { canvasActions: { toggleTheme: false } } as const;

// ── Dynamic wrapper ───────────────────────────────────────────────────────────
// The inner component is a NAMED function so React can track hooks.
// useMemo on <MainMenu> ensures the JSX tree reference is stable across renders,
// preventing Excalidraw's internal Jotai store from calling Set.forEach setState
// during reconciliation (the infinite-loop source).
const ExcalidrawWithMenu = dynamic(
  () =>
    import('@excalidraw/excalidraw').then((mod) => {
      const { Excalidraw, MainMenu } = mod;

      function ExcalidrawInner({
        excalidrawAPI,
        onChange,
        gridModeEnabled,
        theme,
        onThemeToggle,
      }: {
        excalidrawAPI: (api: any) => void;
        onChange: (elements: any, appState: any, files: any) => void;
        gridModeEnabled: boolean;
        theme: 'light' | 'dark';
        onThemeToggle: () => void; // stable – uses setTheme(prev=>…), no theme dep
      }) {
        // onThemeToggle is a stable useCallback (empty deps) → this memo NEVER
        // invalidates → MainMenu renders exactly once → no Jotai-store loop.
        const menu = useMemo(
          () => (
            <MainMenu>
              <MainMenu.DefaultItems.LoadScene />
              <MainMenu.DefaultItems.SaveToActiveFile />
              <MainMenu.DefaultItems.SaveAsImage />
              <MainMenu.DefaultItems.Export />
              <MainMenu.Separator />
              <MainMenu.DefaultItems.CommandPalette />
              <MainMenu.DefaultItems.SearchMenu />
              <MainMenu.DefaultItems.Help />
              <MainMenu.DefaultItems.ClearCanvas />
              <MainMenu.Separator />
              <MainMenu.Item onSelect={onThemeToggle}>Toggle theme</MainMenu.Item>
              <MainMenu.DefaultItems.ChangeCanvasBackground />
            </MainMenu>
          ),
          [onThemeToggle]
        );

        return (
          <Excalidraw
            excalidrawAPI={excalidrawAPI}
            onChange={onChange}
            gridModeEnabled={gridModeEnabled}
            theme={theme}
            UIOptions={UI_OPTIONS}
          >
            {menu}
          </Excalidraw>
        );
      }

      return { default: ExcalidrawInner };
    }),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center text-slate-500">
        Loading canvas…
      </div>
    ),
  }
);

// ── Props ─────────────────────────────────────────────────────────────────────

interface CanvasProps {
  gridEnabled?: boolean;
  darkMode?: boolean;
  strokeColor?: string;
  strokeWidth?: number;
  activeTool?: string;
  onExcalidrawAPI?: (api: any) => void;
  onChange?: (elements: any[], appState: any) => void;
}

// ── Canvas ────────────────────────────────────────────────────────────────────

export function Canvas({
  gridEnabled = false,
  darkMode = false,
  strokeColor = '#000000',
  strokeWidth = 2,
  activeTool = 'selection',
  onExcalidrawAPI,
  onChange,
}: CanvasProps) {
  const excalidrawRef = useRef<any>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(darkMode ? 'dark' : 'light');

  useEffect(() => { setTheme(darkMode ? 'dark' : 'light'); }, [darkMode]);
  useEffect(() => { setIsMounted(true); }, []);

  // Stable refs so callbacks never change identity ──────────────────────────
  const onExcalidrawAPIRef = useRef(onExcalidrawAPI);
  useEffect(() => { onExcalidrawAPIRef.current = onExcalidrawAPI; });

  const onChangeRef = useRef(onChange);
  useEffect(() => { onChangeRef.current = onChange; });

  const handleExcalidrawAPI = useCallback((api: any) => {
    excalidrawRef.current = api;
    onExcalidrawAPIRef.current?.(api);
  }, []);

  const handleChange = useCallback((elements: any[], appState: any) => {
    onChangeRef.current?.(elements, appState);
  }, []);

  // No `theme` in deps → functional update → stable reference forever ────────
  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Sync tool / stroke imperatively ─────────────────────────────────────────
  useEffect(() => {
    const api = excalidrawRef.current;
    if (!api) return;
    const toolMap: Record<string, string> = {
      select: 'selection', pen: 'freedraw', eraser: 'eraser',
      rectangle: 'rectangle', circle: 'ellipse', line: 'line', text: 'text',
    };
    api.updateScene({
      appState: {
        activeTool: { type: toolMap[activeTool] ?? activeTool },
        currentItemStrokeColor: strokeColor,
        currentItemStrokeWidth: strokeWidth,
      },
    });
  }, [activeTool, strokeColor, strokeWidth]);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50">
        <div className="text-slate-500">Loading canvas…</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full" style={{ overflow: 'hidden' }}>
      <ExcalidrawWithMenu
        excalidrawAPI={handleExcalidrawAPI}
        onChange={handleChange}
        gridModeEnabled={gridEnabled}
        theme={theme}
        onThemeToggle={handleThemeToggle}
      />
    </div>
  );
}
