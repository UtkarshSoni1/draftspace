'use client';

import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  setTheme: () => {},
});

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  return mode === 'system' ? getSystemTheme() : mode;
}

function applyThemeClass(mode: ThemeMode) {
  const resolved = resolveTheme(mode);
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
  return resolved;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');
  const themeRef = useRef<ThemeMode>('system');

  // Load from localStorage on mount and apply immediately
  useEffect(() => {
    const saved = (localStorage.getItem('draftspace-theme') as ThemeMode | null) ?? 'system';
    themeRef.current = saved;
    setThemeState(saved);
    const resolved = applyThemeClass(saved);
    setResolvedTheme(resolved);

    // Watch for system preference changes (only relevant in 'system' mode)
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => {
      if (themeRef.current === 'system') {
        const resolved = applyThemeClass('system');
        setResolvedTheme(resolved);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const setTheme = (mode: ThemeMode) => {
    themeRef.current = mode;
    setThemeState(mode);
    localStorage.setItem('draftspace-theme', mode);
    const resolved = applyThemeClass(mode);
    setResolvedTheme(resolved);
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
