'use client';

import React from 'react';
import {
  Pen,
  Eraser,
  Square,
  Circle,
  Minus,
  Type,
  Mouse,
  Undo2,
  Redo2,
  Download,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export type ToolType = 'select' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text';

export interface ToolbarState {
  activeTool: ToolType;
  color: string;
  strokeWidth: number;
}

export interface ToolbarProps {
  activeTool: ToolType;
  color: string;
  strokeWidth: number;
  onToolChange?: (tool: ToolType) => void;
  onColorChange?: (color: string) => void;
  onStrokeWidthChange?: (width: number) => void;
  onUndo?: () => void;
  onRedo?: () => void;
  onExport?: (format: 'png' | 'svg' | 'json') => void;
  onClear?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

const COLORS = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Purple', value: '#A855F7' },
];

const TOOLS: { type: ToolType; label: string; icon: React.ReactNode }[] = [
  { type: 'select', label: 'Select', icon: <Mouse className="w-4 h-4" /> },
  { type: 'pen', label: 'Pen', icon: <Pen className="w-4 h-4" /> },
  { type: 'eraser', label: 'Eraser', icon: <Eraser className="w-4 h-4" /> },
  { type: 'rectangle', label: 'Rectangle', icon: <Square className="w-4 h-4" /> },
  { type: 'circle', label: 'Circle', icon: <Circle className="w-4 h-4" /> },
  { type: 'line', label: 'Line', icon: <Minus className="w-4 h-4" /> },
  { type: 'text', label: 'Text', icon: <Type className="w-4 h-4" /> },
];

export function Toolbar({
  activeTool,
  color: selectedColor,
  strokeWidth,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onExport,
  onClear,
  canUndo = true,
  canRedo = true,
}: ToolbarProps) {
  const handleToolChange = (tool: ToolType) => {
    onToolChange?.(tool);
  };

  const handleColorChange = (color: string) => {
    onColorChange?.(color);
  };

  const handleStrokeWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const width = parseInt(e.target.value, 10);
    onStrokeWidthChange?.(width);
  };

  const handleExport = (format: 'png' | 'svg' | 'json') => {
    onExport?.(format);
  };

  const handleClear = () => {
    onClear?.();
  };

  return (
    <TooltipProvider>
      <div className="w-full bg-gradient-to-r from-white to-slate-100 border-b border-slate-200 shadow-sm px-4 py-3">
        <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto flex-wrap sm:flex-nowrap">
          {/* Tool Buttons */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 shadow-xs">
            {TOOLS.map((tool) => (
              <Tooltip key={tool.type}>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToolChange(tool.type)}
                    className={`relative h-8 w-8 p-0 transition-all ${
                      activeTool === tool.type
                        ? 'bg-blue-100 text-blue-600 hover:bg-blue-100'
                        : 'hover:bg-slate-100'
                    }`}
                  >
                    {activeTool === tool.type && (
                      <div className="absolute inset-0 rounded-md border-2 border-blue-500 pointer-events-none" />
                    )}
                    {tool.icon}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {tool.label}
                </TooltipContent>
              </Tooltip>
            ))}
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Color Picker */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 hidden sm:inline">Color:</span>
            <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 shadow-xs">
              {COLORS.map((color) => (
                <Tooltip key={color.value}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => handleColorChange(color.value)}
                      className={`w-6 h-6 rounded-md transition-all border-2 ${
                        selectedColor === color.value
                          ? 'border-blue-500 scale-110'
                          : 'border-slate-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      aria-label={`Select ${color.name} color`}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs">
                    {color.name}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Stroke Width Slider */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-600 hidden sm:inline">Width:</span>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1 border border-slate-200 shadow-xs">
              <input
                type="range"
                min="1"
                max="10"
                value={strokeWidth}
                onChange={handleStrokeWidthChange}
                className="w-24 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                aria-label="Stroke width"
              />
              <span className="text-xs font-medium text-slate-700 min-w-6 text-right">
                {strokeWidth}px
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-6 w-px bg-slate-200 hidden sm:block" />

          {/* Action Buttons */}
          <div className="flex items-center gap-1 bg-white rounded-lg p-1 border border-slate-200 shadow-xs">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUndo?.()}
                  disabled={!canUndo}
                  className="h-8 w-8 p-0"
                >
                  <Undo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Undo
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRedo?.()}
                  disabled={!canRedo}
                  className="h-8 w-8 p-0"
                >
                  <Redo2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs">
                Redo
              </TooltipContent>
            </Tooltip>

            {/* Export Dropdown */}
            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Export
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-32">
                <DropdownMenuItem onClick={() => handleExport('png')}>
                  Export as PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('svg')}>
                  Export as SVG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('json')}>
                  Export as JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Clear Canvas */}
            <AlertDialog>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-slate-500 hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  Clear Canvas
                </TooltipContent>
              </Tooltip>
              <AlertDialogContent>
                <AlertDialogTitle>Clear Canvas</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to clear the canvas? This action cannot be undone.
                </AlertDialogDescription>
                <div className="flex gap-3 justify-end mt-6">
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleClear}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Clear
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}

export default Toolbar;
