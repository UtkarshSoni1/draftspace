'use client';

import { useState } from 'react';
import Toolbar from '@/components/Toolbar';
import { SettingsPanel } from '@/components/SettingsPanel';

export default function Home() {
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [aiProvider, setAIProvider] = useState<'openai' | 'anthropic'>('openai');
  const [darkMode, setDarkMode] = useState(false);

  const handleUndo = () => {
    setUndoCount((prev) => prev + 1);
  };

  const handleRedo = () => {
    setRedoCount((prev) => prev + 1);
  };

  const handleToolChange = (tool: string) => {
    console.log('Tool changed to:', tool);
  };

  const handleColorChange = (color: string) => {
    console.log('Color changed to:', color);
  };

  const handleStrokeWidthChange = (width: number) => {
    console.log('Stroke width changed to:', width);
  };

  const handleExport = (format: 'png' | 'svg' | 'json') => {
    console.log('Exporting as:', format);
  };

  const handleClear = () => {
    setUndoCount(0);
    setRedoCount(0);
    console.log('Canvas cleared');
  };

  const handleAIProviderChange = (provider: 'openai' | 'anthropic') => {
    setAIProvider(provider);
    console.log('AI provider changed to:', provider);
  };

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    console.log('Dark mode toggled:', enabled);
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Top Bar with Toolbar and Settings */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <div>
          <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
            Whiteboard App
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <SettingsPanel
            onAIProviderChange={handleAIProviderChange}
            onDarkModeToggle={handleDarkModeToggle}
            roomId="ROOM-ABC123"
            onlineUsers={5}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white border-b border-slate-200">
        <Toolbar
        onToolChange={handleToolChange}
        onColorChange={handleColorChange}
        onStrokeWidthChange={handleStrokeWidthChange}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onExport={handleExport}
        onClear={handleClear}
        canUndo={undoCount > 0}
        canRedo={true}
      />

      {/* Canvas Area */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-lg border aspect-video flex items-center justify-center`}>
            <div className="text-center">
              <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>Canvas Area</p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                Click the toolbar buttons to interact with drawing tools
              </p>
              <div className={`mt-4 space-y-1 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <p>Undo actions: {undoCount}</p>
                <p>Redo actions: {redoCount}</p>
                <p>Current AI Provider: {aiProvider}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
