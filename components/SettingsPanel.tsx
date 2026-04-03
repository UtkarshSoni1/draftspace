'use client';

import React, { useState } from 'react';
import {
  Settings,
  Copy,
  Eye,
  EyeOff,
  Grid3x3,
  Moon,
  Users,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';

export type AIProvider = 'openai' | 'anthropic';

export interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  aiProvider: AIProvider;
  onAIProviderChange: (provider: AIProvider) => void;
  apiKey: string;
  onAPIKeyChange: (key: string) => void;
  gridEnabled: boolean;
  onGridToggle: (enabled: boolean) => void;
  snapToGridEnabled: boolean;
  onSnapToGrid: (enabled: boolean) => void;
  darkModeEnabled: boolean;
  onDarkModeToggle: (enabled: boolean) => void;
  exportBackgroundEnabled: boolean;
  onExportBackgroundToggle: (enabled: boolean) => void;
  exportScale: number;
  onExportScaleChange: (scale: number) => void;
  roomId?: string;
  onlineUsers?: number;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  open,
  onOpenChange,
  aiProvider,
  onAIProviderChange,
  apiKey,
  onAPIKeyChange,
  gridEnabled,
  onGridToggle,
  snapToGridEnabled,
  onSnapToGrid,
  darkModeEnabled,
  onDarkModeToggle,
  exportBackgroundEnabled,
  onExportBackgroundToggle,
  exportScale,
  onExportScaleChange,
  roomId = 'ROOM-12345',
  onlineUsers = 3,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [apiKeyError, setApiKeyError] = useState('');
  const [copiedRoomId, setCopiedRoomId] = useState(false);

  const handleAIProviderChange = (value: AIProvider) => {
    onAIProviderChange(value);
  };

  const handleAPIKeyChange = (value: string) => {
    onAPIKeyChange(value);
    setApiKeyError('');
  };

  const validateAPIKey = (): boolean => {
    if (!apiKey.trim()) {
      setApiKeyError('API key is required');
      return false;
    }
    if (apiKey.length < 10) {
      setApiKeyError('API key must be at least 10 characters');
      return false;
    }
    setApiKeyError('');
    return true;
  };

  const handleGridToggle = (checked: boolean) => {
    onGridToggle(checked);
  };

  const handleSnapToGrid = (checked: boolean) => {
    onSnapToGrid(checked);
  };

  const handleDarkModeToggle = (checked: boolean) => {
    onDarkModeToggle(checked);
  };

  const handleExportBackgroundToggle = (checked: boolean) => {
    onExportBackgroundToggle(checked);
  };

  const handleExportScaleChange = (value: number[]) => {
    onExportScaleChange(value[0] ?? 1);
  };

  const copyRoomIdToClipboard = () => {
    navigator.clipboard.writeText(roomId);
    setCopiedRoomId(true);
    setTimeout(() => setCopiedRoomId(false), 2000);
  };

  return (
    <TooltipProvider>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 shrink-0 rounded-md hover:bg-gray-100 transition-transform duration-200 hover:scale-105"
                aria-label="Open settings"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Settings</TooltipContent>
          </Tooltip>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full sm:w-96 overflow-y-auto transition-transform duration-300 ease-out"
        >
          <SheetHeader className="mb-6">
            <SheetTitle>Settings</SheetTitle>
            <SheetDescription>
              Configure your whiteboard and AI settings
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-sm">AI Provider</h3>
              </div>
              <RadioGroup
                value={aiProvider}
                onValueChange={(value) =>
                  handleAIProviderChange(value as AIProvider)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai" />
                  <Label htmlFor="openai" className="cursor-pointer font-normal">
                    OpenAI
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="anthropic" id="anthropic" />
                  <Label htmlFor="anthropic" className="cursor-pointer font-normal">
                    Anthropic Claude
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Settings className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-sm">API Key</h3>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your API key"
                    value={apiKey}
                    onChange={(e) => handleAPIKeyChange(e.target.value)}
                    className={`pr-10 ${apiKeyError ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {apiKeyError && (
                  <p className="text-xs text-red-500">{apiKeyError}</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={validateAPIKey}
                  className="w-full"
                >
                  Validate Key
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Grid3x3 className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-sm">Canvas Settings</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="grid-toggle" className="font-normal cursor-pointer">
                    Show Grid
                  </Label>
                  <Switch
                    id="grid-toggle"
                    checked={gridEnabled}
                    onCheckedChange={handleGridToggle}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="snap-toggle" className="font-normal cursor-pointer">
                    Snap to Grid
                  </Label>
                  <Switch
                    id="snap-toggle"
                    checked={snapToGridEnabled}
                    onCheckedChange={handleSnapToGrid}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4" />
                    <Label htmlFor="dark-mode-toggle" className="font-normal cursor-pointer">
                      Dark Mode
                    </Label>
                  </div>
                  <Switch
                    id="dark-mode-toggle"
                    checked={darkModeEnabled}
                    onCheckedChange={handleDarkModeToggle}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-sm">Collaboration</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="room-id" className="text-xs text-gray-600 mb-1 block">
                    Room ID
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="room-id"
                      value={roomId}
                      readOnly
                      className="bg-gray-50 font-mono text-sm"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={copyRoomIdToClipboard}
                      className="px-3"
                    >
                      <Copy className={`h-4 w-4 ${copiedRoomId ? 'text-green-600' : ''}`} />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-600">Online Users</p>
                      <p className="text-lg font-semibold text-blue-600">{onlineUsers}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Download className="h-4 w-4 text-gray-600" />
                <h3 className="font-semibold text-sm">Export Settings</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="export-background" className="font-normal cursor-pointer">
                    Include Background
                  </Label>
                  <Switch
                    id="export-background"
                    checked={exportBackgroundEnabled}
                    onCheckedChange={handleExportBackgroundToggle}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-normal">
                      Scale: {exportScale}x
                    </Label>
                  </div>
                  <Slider
                    value={[exportScale]}
                    onValueChange={handleExportScaleChange}
                    min={1}
                    max={4}
                    step={0.5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1x</span>
                    <span>4x</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </TooltipProvider>
  );
};
