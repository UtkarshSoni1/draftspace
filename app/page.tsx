'use client';

import { useState } from 'react';
import Toolbar from '@/components/Toolbar';
import { SettingsPanel } from '@/components/SettingsPanel';
import { CommandInput } from '@/components/CommandInput';
import { useToast } from '@/context/ToastContext';
import ToastContainer from '@/components/ToastNotification';

export default function Home() {
  const { addToast } = useToast();
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

  const handleCommandSubmit = (command: string) => {
    console.log('Command submitted:', command);
  };

  const handlePatternDetected = (pattern: 'ai' | 'img' | 'code', value: string) => {
    console.log(`Pattern detected: ${pattern}`, value);
  };

  const demoToastProcessing = () => {
    const toastId = addToast({
      type: 'processing',
      message: 'Generating image...',
      description: 'Your AI image is being created',
    });

    setTimeout(() => {
      // Toast is removed after 4 seconds automatically
    }, 5000);
  };

  const demoToastSuccess = () => {
    addToast({
      type: 'success',
      message: 'Success!',
      description: 'Your image has been generated',
    });
  };

  const demoToastError = () => {
    addToast({
      type: 'error',
      message: 'Error occurred',
      description: 'Failed to generate image. Please try again.',
    });
  };

  const demoToastCopy = () => {
    addToast({
      type: 'copy',
      message: 'Copied to clipboard!',
      duration: 2000,
    });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200">
        <h1 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>
          Whiteboard App
        </h1>
        <SettingsPanel
          onAIProviderChange={handleAIProviderChange}
          onDarkModeToggle={handleDarkModeToggle}
          roomId="ROOM-ABC123"
          onlineUsers={5}
        />
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
      </div>

      {/* Canvas Area */}
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-lg border aspect-video flex items-center justify-center`}>
            <div className="text-center">
              <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Canvas Area
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                Click the toolbar buttons to interact with drawing tools
              </p>
              <div className={`mt-6 space-y-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <p>Undo actions: {undoCount}</p>
                <p>Redo actions: {redoCount}</p>
                <p>Current AI Provider: {aiProvider}</p>
              </div>

              {/* Toast Demo Buttons */}
              <div className="mt-8 flex gap-2 justify-center flex-wrap">
                <button
                  onClick={demoToastProcessing}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
                >
                  Processing Toast
                </button>
                <button
                  onClick={demoToastSuccess}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
                >
                  Success Toast
                </button>
                <button
                  onClick={demoToastError}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                >
                  Error Toast
                </button>
                <button
                  onClick={demoToastCopy}
                  className="px-4 py-2 bg-slate-600 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                >
                  Copy Toast
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Container */}
      <ToastContainer />

      {/* Command Input */}
      <CommandInput
        onSubmit={handleCommandSubmit}
        onPatternDetected={handlePatternDetected}
      />
    </div>
  );
}
