'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Image, Code, ChevronRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/context/ToastContext';
import {
  streamTextAi,
  callImageAi,
  callCodeAi,
} from '@/lib/ai-client';
import type { ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import {
  addAITextToCanvas,
  addAIImageToCanvas,
  addAICodeToCanvas,
} from '@/lib/canvasManager';

// Command history management
const HISTORY_STORAGE_KEY = 'draftspace-command-history';
const MAX_HISTORY = 10;

function loadHistory(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveHistory(commands: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(commands.slice(0, MAX_HISTORY)));
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

function addToHistory(command: string): void {
  const history = loadHistory();
  const filtered = history.filter((c) => c !== command);
  saveHistory([command, ...filtered]);
}

interface AutocompleteItem {
  label: string;
  description: string;
  shortcut?: string;
  icon: React.ReactNode;
}

interface CommandInputProps {
  onSubmit?: (command: string) => void | Promise<void>;
  onPatternDetected?: (pattern: 'ai' | 'img' | 'code', value: string) => void;
  excalidrawAPI?: ExcalidrawImperativeAPI;
}

const PLACEHOLDER_EXAMPLES = [
  'Type "{ ai: }" to use AI assistant...',
  'Type "{ img: }" to generate images...',
  'Type "{ code: }" to write code...',
  'Press "/" for quick commands...',
  'Ctrl+K to focus, ↑ for history...',
];

const AUTOCOMPLETE_ITEMS: AutocompleteItem[] = [
  {
    label: 'AI Assistant',
    description: 'Ask AI for help with any task',
    shortcut: 'Ctrl+Shift+A',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    label: 'Generate Image',
    description: 'Create images with AI',
    shortcut: 'Ctrl+Shift+I',
    icon: <Image className="w-4 h-4" />,
  },
  {
    label: 'Write Code',
    description: 'Generate code snippets',
    shortcut: 'Ctrl+Shift+C',
    icon: <Code className="w-4 h-4" />,
  },
];

type ParsedCommand =
  | { kind: 'ai' | 'img' | 'code'; prompt: string }
  | { kind: 'plain'; prompt: string };

function parseCommand(input: string): ParsedCommand {
  const t = input.trim();
  const re = /\{\s*(ai|img|code)\s*:\s*([^}]*)\}/i;
  const m = t.match(re);
  if (!m) return { kind: 'plain', prompt: t };
  const after = t.replace(m[0], '').trim();
  const inner = m[2].trim();
  const prompt = inner || after || t;
  const kind = m[1].toLowerCase() as 'ai' | 'img' | 'code';
  return { kind, prompt };
}

export function CommandInput({ onSubmit, onPatternDetected, excalidrawAPI }: CommandInputProps) {
  const { addToast, removeToast } = useToast();
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Load history on mount
  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  // Keyboard shortcut to focus (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Placeholder rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Pattern detection
  useEffect(() => {
    const aiMatch = input.match(/\{\s*ai:\s*\}/i);
    const imgMatch = input.match(/\{\s*img:\s*\}/i);
    const codeMatch = input.match(/\{\s*code:\s*\}/i);

    if (aiMatch && onPatternDetected) {
      onPatternDetected('ai', input.replace(aiMatch[0], '').trim());
    } else if (imgMatch && onPatternDetected) {
      onPatternDetected('img', input.replace(imgMatch[0], '').trim());
    } else if (codeMatch && onPatternDetected) {
      onPatternDetected('code', input.replace(codeMatch[0], '').trim());
    }
  }, [input, onPatternDetected]);

  const runAiPipeline = useCallback(
    async (raw: string) => {
      const parsed = parseCommand(raw);
      const commandType = parsed.kind === 'plain' ? 'ai' : parsed.kind;
      const toastId = addToast({
        type: 'processing',
        message: `Generating ${commandType === 'img' ? 'image' : commandType === 'code' ? 'code' : 'response'}...`,
        description: `Using ${commandType} API`,
      });

      try {
        if (parsed.kind === 'plain' || parsed.kind === 'ai') {
          const result = await streamTextAi(parsed.prompt);
          removeToast(toastId);
          if (!result.success) {
            addToast({
              type: 'error',
              message: 'Text generation failed',
              description: result.error ?? 'Unknown error',
            });
            return;
          }

          // Add to canvas if API is available
          if (excalidrawAPI) {
            try {
              await addAITextToCanvas(excalidrawAPI, result.data);
            } catch (e) {
              console.error('Failed to add text to canvas:', e);
            }
          }

          addToast({
            type: 'success',
            message: 'Text ready',
            description:
              result.data.slice(0, 160) + (result.data.length > 160 ? '…' : ''),
            duration: 6000,
          });
          return;
        }

        if (parsed.kind === 'img') {
          const result = await callImageAi(parsed.prompt);
          removeToast(toastId);
          if (!result.success) {
            addToast({
              type: 'error',
              message: 'Image generation failed',
              description: result.error ?? 'Unknown error',
            });
            return;
          }

          // Add to canvas if API is available
          if (excalidrawAPI) {
            try {
              await addAIImageToCanvas(excalidrawAPI, result.data);
            } catch (e) {
              console.error('Failed to add image to canvas:', e);
              addToast({
                type: 'error',
                message: 'Failed to add image to canvas',
                description: e instanceof Error ? e.message : 'Unknown error',
              });
              return;
            }
          }

          addToast({
            type: 'success',
            message: 'Image generated',
            description: 'Added to canvas',
            duration: 5000,
          });
          return;
        }

        if (parsed.kind === 'code') {
          const result = await callCodeAi(parsed.prompt);
          removeToast(toastId);
          if (!result.success) {
            addToast({
              type: 'error',
              message: 'Code generation failed',
              description: result.error ?? 'Unknown error',
            });
            return;
          }

          // Add to canvas if API is available
          if (excalidrawAPI) {
            try {
              await addAICodeToCanvas(excalidrawAPI, result.data, result.language);
            } catch (e) {
              console.error('Failed to add code to canvas:', e);
            }
          }

          addToast({
            type: 'success',
            message: `Code (${result.language})`,
            description: result.data.slice(0, 120) + (result.data.length > 120 ? '…' : ''),
            duration: 8000,
          });
          return;
        }
      } catch (e) {
        removeToast(toastId);
        const msg = e instanceof Error ? e.message : String(e);
        addToast({
          type: 'error',
          message: 'Request failed',
          description: msg,
        });
      }
    },
    [addToast, removeToast, excalidrawAPI]
  );

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setStatus('idle');
    setHistoryIndex(-1);

    try {
      await runAiPipeline(input);
      addToHistory(input);
      setHistory(loadHistory());
      await onSubmit?.(input);
      setStatus('success');
      timeoutRef.current = setTimeout(() => {
        setInput('');
        setStatus('idle');
        setIsOpen(false);
      }, 1500);
    } catch (e) {
      setStatus('error');
      const msg = e instanceof Error ? e.message : 'Check your input and try again.';
      addToast({
        type: 'error',
        message: 'Command failed',
        description: msg,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle Enter - submit or select autocomplete
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredItems.length && isOpen) {
        setInput(filteredItems[selectedIndex].label);
        setIsOpen(false);
      } else {
        void handleSubmit();
      }
      return;
    }

    // Handle Escape - clear and blur (improved)
    if (e.key === 'Escape') {
      e.preventDefault();
      if (input) {
        setInput('');
        setHistoryIndex(-1);
      }
      setIsOpen(false);
      setStatus('idle');
      inputRef.current?.blur();
      return;
    }

    // Handle Up arrow - navigate history or autocomplete
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      // If autocomplete is open, navigate autocomplete
      if (isOpen && filteredItems.length > 0) {
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else {
        // Navigate command history
        const newIndex = historyIndex === -1 ? 0 : historyIndex - 1;
        if (newIndex < history.length) {
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        }
      }
      return;
    }

    // Handle Down arrow - navigate history or autocomplete
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      // If autocomplete is open, navigate autocomplete
      if (isOpen && filteredItems.length > 0) {
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
      } else {
        // Navigate command history
        if (historyIndex > 0) {
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(history[newIndex]);
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInput('');
        }
      }
      return;
    }

    // Handle Tab - autocomplete selection
    if (e.key === 'Tab') {
      e.preventDefault();
      if (selectedIndex < filteredItems.length && isOpen) {
        setInput(filteredItems[selectedIndex].label);
        setIsOpen(false);
        setSelectedIndex(0);
      }
      return;
    }
  };

  const handleSelectItem = (item: AutocompleteItem) => {
    setInput(item.label);
    setIsOpen(false);
    setSelectedIndex(0);
    setHistoryIndex(-1);
  };

  const clearInput = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setInput('');
    setStatus('idle');
    setIsOpen(false);
    setHistoryIndex(-1);
  };

  const getStatusColor = () => {
    if (status === 'success') return 'border-green-400 bg-green-50';
    if (status === 'error') return 'border-red-400 bg-red-50';
    return 'border-slate-200 bg-white';
  };

  const getFocusColor = () => {
    if (status === 'success') return 'focus-visible:ring-green-400';
    if (status === 'error') return 'focus-visible:ring-red-400';
    return 'focus-visible:ring-blue-400';
  };

  const filteredItems = AUTOCOMPLETE_ITEMS.filter(
    (item) =>
      item.label.toLowerCase().includes(input.toLowerCase()) ||
      item.description.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50 transition-all duration-300 ease-out">
      <Popover open={isOpen && filteredItems.length > 0} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className={`relative backdrop-blur-md bg-white/90 border-2 rounded-full shadow-2xl transition-all duration-300 ${getStatusColor()} ${
              isOpen && filteredItems.length > 0 ? 'border-blue-400' : ''
            }`}
            style={{
              backgroundImage:
                isOpen && filteredItems.length > 0
                  ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
                  : 'none',
            }}
          >
            <div className="flex items-center px-6 py-4 gap-3">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin shrink-0" />
              ) : status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              ) : status === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-slate-400 shrink-0" />
              )}

              <Input
                ref={inputRef}
                type="text"
                placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setSelectedIndex(0);
                  setHistoryIndex(-1);
                  setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() =>
                  input.length > 0 &&
                  filteredItems.length > 0 &&
                  setIsOpen(true)
                }
                disabled={isLoading}
                className={`border-0 bg-transparent text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed flex-1 text-lg ${getFocusColor()}`}
              />

              {input && (
                <button
                  type="button"
                  onClick={clearInput}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
                  aria-label="Clear input"
                >
                  ✕
                </button>
              )}

              <button
                type="button"
                onClick={() => void handleSubmit()}
                disabled={!input.trim() || isLoading}
                className="shrink-0 text-slate-400 hover:text-blue-500 disabled:opacity-50 transition-colors"
                aria-label="Submit command"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent
          className="w-96 p-2 backdrop-blur-md bg-white/95 border border-slate-200 rounded-xl shadow-2xl"
          align="center"
          sideOffset={12}
        >
          <div className="space-y-1">
            {filteredItems.map((item, index) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleSelectItem(item)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all ${
                  index === selectedIndex
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="shrink-0 mt-1 text-slate-600">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                {item.shortcut && (
                  <div className="shrink-0 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    {item.shortcut}
                  </div>
                )}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
