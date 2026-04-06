'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, Image, Code, ArrowRight } from 'lucide-react';
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

interface CommandInputProps {
  onSubmit?: (command: string) => void | Promise<void>;
  onPatternDetected?: (pattern: 'ai' | 'img' | 'code', value: string) => void;
  excalidrawAPI?: ExcalidrawImperativeAPI;
}

interface CommandOption {
  type: 'ai' | 'img' | 'code';
  prefix: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const COMMAND_OPTIONS: CommandOption[] = [
  {
    type: 'ai',
    prefix: '{ ai: ',
    label: 'AI Assistant',
    description: 'Ask AI for help with any task',
    icon: <Sparkles className="w-5 h-5" />,
  },
  {
    type: 'img',
    prefix: '{ img: ',
    label: 'Generate Image',
    description: 'Create images with AI',
    icon: <Image className="w-5 h-5" />,
  },
  {
    type: 'code',
    prefix: '{ code: ',
    label: 'Write Code',
    description: 'Generate code snippets',
    icon: <Code className="w-5 h-5" />,
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

export function CommandInput({ onSubmit, excalidrawAPI }: CommandInputProps) {
  const { addToast, removeToast } = useToast();
  const [input, setInput] = useState('');
  const [showPopover, setShowPopover] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState(40);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut to focus (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Auto-expand textarea height
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);

    // Show popover only if user typed "/" and it exists in the text
    const hasSlash = value.includes('/');
    setShowPopover(hasSlash && !value.includes('{ '));

    // Auto-expand textarea (min 1 line ~40px, max 5 lines ~200px)
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 40), 200);
      setTextareaHeight(newHeight);
    }
  };

  const handleSelectOption = (option: CommandOption) => {
    // Replace "/" with the command prefix
    const newInput = input.replace('/', option.prefix);
    setInput(newInput);
    setShowPopover(false);

    // Focus and place cursor after the prefix
    setTimeout(() => {
      if (textareaRef.current) {
        const cursorPos = newInput.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(cursorPos, cursorPos);
      }
    }, 0);
  };

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
    setShowPopover(false);

    try {
      await runAiPipeline(input);
      await onSubmit?.(input);
      setInput('');
      setTextareaHeight(40);
    } catch (e) {
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter to submit
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      void handleSubmit();
      return;
    }

    // Escape to clear
    if (e.key === 'Escape') {
      e.preventDefault();
      setInput('');
      setShowPopover(false);
      setTextareaHeight(40);
      textareaRef.current?.blur();
      return;
    }

    // Hide popover if user deletes the "/"
    if (e.key === 'Backspace' && !input.includes('/')) {
      setShowPopover(false);
    }
  };

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
          setShowPopover(false);
        }
      }
    };

    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showPopover]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-full max-w-[680px] px-4 z-50">
      <div className="relative">
        {/* Popover - appears above textarea */}
        {showPopover && (
          <div
            ref={popoverRef}
            className="absolute bottom-full mb-3 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg p-2 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="space-y-1">
              {COMMAND_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  type="button"
                  onClick={() => handleSelectOption(option)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors text-left"
                >
                  <span className="text-slate-600 flex-shrink-0">{option.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 text-sm">{option.label}</p>
                    <p className="text-xs text-slate-500">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input container */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md hover:shadow-lg transition-shadow">
          <div className="flex items-end gap-3 px-4 py-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask AI anything, or type "/" to pick a command type..."
              disabled={isLoading}
              rows={1}
              style={{ height: `${textareaHeight}px` }}
              className="flex-1 resize-none bg-transparent border-0 outline-none focus:ring-0 text-slate-900 placeholder:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed font-normal text-base leading-6"
            />

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Submit command"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
