'use client';

import { useState } from 'react';
import Toolbar from '@/components/Toolbar';

export default function Home() {
  const [undoCount, setUndoCount] = useState(0);
  const [redoCount, setRedoCount] = useState(0);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
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
          <div className="bg-white rounded-lg shadow-lg border border-slate-200 aspect-video flex items-center justify-center">
            <div className="text-center">
              <p className="text-slate-600 text-lg">Canvas Area</p>
              <p className="text-slate-400 text-sm mt-2">
                Click the toolbar buttons to interact with drawing tools
              </p>
              <div className="mt-4 space-y-1 text-xs text-slate-500">
                <p>Undo actions: {undoCount}</p>
                <p>Redo actions: {redoCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
