'use client';

import { useState } from 'react';
import Toolbar from '@/components/Toolbar';
import { SettingsPanel } from '@/components/SettingsPanel';
import { CommandInput } from '@/components/CommandInput';
import ToastContainer from '@/components/ToastNotification';
import PropertiesPanel from '@/components/PropertiesPanel';

export default function Home() {
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);
  const [aiProvider, setAIProvider] = useState<'openai' | 'anthropic'>('openai');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState({
    id: 'element-1',
    type: 'shape' as const,
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

  const handlePropertyChange = (elementId: string, property: string, value: any) => {
    console.log(`Property changed: ${property} = ${value}`);
    setSelectedElement((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  const handleDelete = (elementId: string) => {
    console.log('Element deleted:', elementId);
    setSelectedElement(null);
  };

  const handleDuplicate = (elementId: string) => {
    console.log('Element duplicated:', elementId);
  };

  const handleBringToFront = (elementId: string) => {
    console.log('Bring to front:', elementId);
  };

  const handleSendToBack = (elementId: string) => {
    console.log('Send to back:', elementId);
  };



  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-slate-50 to-slate-100'}`}>
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
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-6 p-6">
        {/* Canvas Area */}
        <div className="flex-1">
          <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-lg border h-full flex items-center justify-center relative`}>
            {/* Demo Selected Element */}
            {selectedElement && (
              <div
                className="absolute border-2 border-blue-500 bg-blue-100 opacity-70 cursor-move"
                style={{
                  left: `${selectedElement.x}px`,
                  top: `${selectedElement.y}px`,
                  width: `${selectedElement.width}px`,
                  height: `${selectedElement.height}px`,
                }}
                onClick={() => console.log('Element selected')}
              />
            )}
            <div className="text-center z-10">
              <p className={`text-lg ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                Canvas Area
              </p>
              <p className={`text-sm mt-2 ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                Edit properties in the right panel
              </p>
              <div className={`mt-6 space-y-2 text-xs ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <p>Undo actions: {undoCount}</p>
                <p>Redo actions: {redoCount}</p>
                <p>Current AI Provider: {aiProvider}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80">
          <PropertiesPanel
            selectedElement={selectedElement}
            onPropertyChange={handlePropertyChange}
            onDelete={handleDelete}
            onDuplicate={handleDuplicate}
            onBringToFront={handleBringToFront}
            onSendToBack={handleSendToBack}
          />
        </div>
      </div>

      {/* Command Input */}
      <CommandInput
        onSubmit={handleCommandSubmit}
        onPatternDetected={handlePatternDetected}
      />

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
}
