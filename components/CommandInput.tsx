'use client';

import { useState, useRef, useEffect } from 'react';
import { Sparkles, Image, Code, ChevronRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface AutocompleteItem {
  label: string;
  description: string;
  shortcut?: string;
  icon: React.ReactNode;
}

interface CommandInputProps {
  onSubmit?: (command: string) => void;
  onPatternDetected?: (pattern: 'ai' | 'img' | 'code', value: string) => void;
}

const PLACEHOLDER_EXAMPLES = [
  'Type "{ ai: }" to use AI assistant...',
  'Type "{ img: }" to generate images...',
  'Type "{ code: }" to write code...',
  'Press "/" for quick commands...',
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

export function CommandInput({ onSubmit, onPatternDetected }: CommandInputProps) {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Rotate placeholder every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDER_EXAMPLES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Detect pattern changes
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

  const detectPattern = (text: string): 'ai' | 'img' | 'code' | null => {
    if (/\{\s*ai:\s*\}/i.test(text)) return 'ai';
    if (/\{\s*img:\s*\}/i.test(text)) return 'img';
    if (/\{\s*code:\s*\}/i.test(text)) return 'code';
    return null;
  };

  const filteredItems = AUTOCOMPLETE_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(input.toLowerCase()) ||
    item.description.toLowerCase().includes(input.toLowerCase())
  );

  const handleSubmit = async () => {
    if (!input.trim()) return;

    setIsLoading(true);
    setStatus('idle');

    // Simulate API call
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false);
      setStatus('success');
      onSubmit?.(input);

      // Reset after 1.5 seconds
      setTimeout(() => {
        setInput('');
        setStatus('idle');
        setIsOpen(false);
      }, 1500);
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex < filteredItems.length && isOpen) {
        setInput(filteredItems[selectedIndex].label);
        setIsOpen(false);
      } else {
        handleSubmit();
      }
    } else if (e.key === 'Escape') {
      setInput('');
      setIsOpen(false);
      setStatus('idle');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < filteredItems.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (selectedIndex < filteredItems.length && isOpen) {
        setInput(filteredItems[selectedIndex].label);
        setIsOpen(false);
        setSelectedIndex(0);
      }
    }
  };

  const handleSelectItem = (item: AutocompleteItem) => {
    setInput(item.label);
    setIsOpen(false);
    setSelectedIndex(0);
  };

  const clearInput = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setInput('');
    setStatus('idle');
    setIsOpen(false);
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

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-50">
      <Popover open={isOpen && filteredItems.length > 0} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div
            className={`relative backdrop-blur-md bg-white/90 border-2 rounded-full shadow-2xl transition-all duration-300 ${getStatusColor()} ${
              isOpen && filteredItems.length > 0 ? 'border-blue-400' : ''
            }`}
            style={{
              backgroundImage: isOpen && filteredItems.length > 0 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))'
                : 'none',
            }}
          >
            <div className="flex items-center px-6 py-4 gap-3">
              {isLoading ? (
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
              ) : status === 'success' ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
              ) : status === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              ) : (
                <Sparkles className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}

              <Input
                ref={inputRef}
                type="text"
                placeholder={PLACEHOLDER_EXAMPLES[placeholderIndex]}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  setSelectedIndex(0);
                  setIsOpen(true);
                }}
                onKeyDown={handleKeyDown}
                onFocus={() => input.length > 0 && filteredItems.length > 0 && setIsOpen(true)}
                disabled={isLoading}
                className={`border-0 bg-transparent text-slate-900 placeholder:text-slate-400 focus-visible:ring-0 focus-visible:outline-none disabled:cursor-not-allowed flex-1 text-lg ${getFocusColor()}`}
              />

              {input && (
                <button
                  onClick={clearInput}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
                  aria-label="Clear input"
                >
                  ✕
                </button>
              )}

              <button
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 text-slate-400 hover:text-blue-500 disabled:opacity-50 transition-colors"
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
                onClick={() => handleSelectItem(item)}
                className={`w-full flex items-start gap-3 px-4 py-3 rounded-lg transition-all ${
                  index === selectedIndex
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="flex-shrink-0 mt-1 text-slate-600">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-slate-900 text-sm">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.description}</p>
                </div>
                {item.shortcut && (
                  <div className="flex-shrink-0 text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">
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
