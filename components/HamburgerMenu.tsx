'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlignJustify,
  FolderOpen,
  Download,
  Image,
  Users,
  Zap,
  Search,
  HelpCircle,
  RotateCcw,
  Github,
  Twitter,
  MessageCircle,
  UserPlus,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { useTheme, type ThemeMode } from '@/context/ThemeContext';

// ── Theme Toggle Row ──────────────────────────────────────────────────────────
function ThemeToggleRow() {
  const { theme, setTheme } = useTheme();

  const options: { mode: ThemeMode; icon: React.ReactNode; label: string }[] = [
    { mode: 'light', icon: <Sun className="w-4 h-4" />, label: 'Light' },
    { mode: 'dark', icon: <Moon className="w-4 h-4" />, label: 'Dark' },
    { mode: 'system', icon: <Monitor className="w-4 h-4" />, label: 'System' },
  ];

  return (
    <div
      className="flex items-center justify-between px-3 py-2.5"
      style={{ borderTop: '1px solid rgba(92,74,42,0.1)' }}
    >
      <span className="text-sm font-medium" style={{ color: '#5C4A2A' }}>
        Theme
      </span>
      <div
        className="flex items-center rounded-full p-0.5"
        style={{
          backgroundColor: 'rgba(92,74,42,0.08)',
          gap: '2px',
          border: '1px solid rgba(92,74,42,0.12)',
        }}
        role="group"
        aria-label="Color theme"
      >
        {options.map(({ mode, icon, label }) => {
          const isActive = theme === mode;
          return (
            <button
              key={mode}
              id={`menu-theme-btn-${mode}`}
              onClick={() => setTheme(mode)}
              title={label}
              aria-pressed={isActive}
              aria-label={`${label} theme`}
              className="flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200"
              style={{
                backgroundColor: isActive ? '#9CA764' : 'transparent',
                color: isActive ? '#fff' : '#5C4A2A',
                boxShadow: isActive ? '0 1px 4px rgba(92,74,42,0.25)' : 'none',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {icon}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ── Menu Item ─────────────────────────────────────────────────────────────────
interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  onClick?: () => void;
  href?: string;
  accent?: boolean;
  danger?: boolean;
}

function MenuItem({ icon, label, shortcut, onClick, href, accent, danger }: MenuItemProps) {
  const baseStyle: React.CSSProperties = {
    color: danger ? '#C0392B' : accent ? '#9CA764' : '#5C4A2A',
  };

  const content = (
    <div
      className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-150 cursor-pointer w-full text-left"
      style={baseStyle}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(92,74,42,0.07)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
      }}
      onClick={onClick}
    >
      <span style={{ color: accent ? '#9CA764' : danger ? '#C0392B' : '#9CA764', flexShrink: 0 }}>
        {icon}
      </span>
      <span className="flex-1 text-sm font-medium">{label}</span>
      {shortcut && (
        <span
          className="text-xs ml-auto"
          style={{ color: 'rgba(92,74,42,0.45)', letterSpacing: '0.02em' }}
        >
          {shortcut}
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {content}
      </a>
    );
  }
  return <button className="block w-full">{content}</button>;
}

// ── Divider ───────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <div
      className="my-1 mx-3"
      style={{ height: '1px', backgroundColor: 'rgba(92,74,42,0.1)' }}
    />
  );
}

// ── HamburgerMenu ─────────────────────────────────────────────────────────────
export function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', onClickOutside);
      return () => document.removeEventListener('mousedown', onClickOutside);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setIsOpen(false);
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div ref={menuRef} className="relative z-50">
      {/* Trigger button */}
      <button
        id="hamburger-menu-trigger"
        onClick={() => setIsOpen((v) => !v)}
        aria-label="Open menu"
        aria-expanded={isOpen}
        className="flex items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
        style={{
          backgroundColor: isOpen ? 'rgba(156,167,100,0.15)' : 'transparent',
          color: '#5C4A2A',
          border: '1px solid transparent',
        }}
        onMouseEnter={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'rgba(92,74,42,0.07)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <AlignJustify className="w-5 h-5" />
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: '#FDFAF3',
            border: '1.5px solid #E8DDB5',
            boxShadow: '0 8px 32px rgba(92,74,42,0.18), 0 2px 8px rgba(92,74,42,0.08)',
            minWidth: '260px',
            animation: 'menu-in 0.18s cubic-bezier(0.16,1,0.3,1)',
          }}
        >
          <style>{`
            @keyframes menu-in {
              from { opacity: 0; transform: translateY(-6px) scale(0.97); }
              to   { opacity: 1; transform: translateY(0)    scale(1);    }
            }
          `}</style>

          <div className="py-2 px-1">
            {/* File actions */}
            <MenuItem icon={<FolderOpen className="w-4 h-4" />} label="Open" shortcut="Ctrl+O" />
            <MenuItem icon={<Download className="w-4 h-4" />} label="Save to…" />
            <MenuItem
              icon={<Image className="w-4 h-4" />}
              label="Export image…"
              shortcut="Ctrl+Shift+E"
            />
            <MenuItem icon={<Users className="w-4 h-4" />} label="Live collaboration…" />

            <Divider />

            {/* App actions */}
            <MenuItem
              icon={<Zap className="w-4 h-4" />}
              label="Command palette"
              shortcut="Ctrl+/"
              accent
            />
            <MenuItem icon={<Search className="w-4 h-4" />} label="Find on canvas" shortcut="Ctrl+F" />
            <MenuItem icon={<HelpCircle className="w-4 h-4" />} label="Help" shortcut="?" />
            <MenuItem icon={<RotateCcw className="w-4 h-4" />} label="Reset the canvas" />

            <Divider />

            {/* Social links */}
            <MenuItem
              icon={<Github className="w-4 h-4" />}
              label="GitHub"
              href="https://github.com/UtkarshSoni1"
            />
            <MenuItem
              icon={<Twitter className="w-4 h-4" />}
              label="Follow us"
              href="https://twitter.com"
            />
            <MenuItem
              icon={<MessageCircle className="w-4 h-4" />}
              label="Discord chat"
              href="https://discord.com"
            />
            <MenuItem
              icon={<UserPlus className="w-4 h-4" />}
              label="Sign up"
              accent
              href="https://github.com/UtkarshSoni1"
            />

            <Divider />

            {/* Theme toggle at the bottom — like Excalidraw */}
            <ThemeToggleRow />
          </div>
        </div>
      )}
    </div>
  );
}
