'use client';

import { useEffect, useState } from 'react';
import { Copy, X } from 'lucide-react';
import type { AIResult } from '@/hooks/useAICommand';

interface AIResultCardProps {
  result: AIResult;
  onClose: () => void;
  onCopy?: (text: string) => void;
}

export function AIResultCard({ result, onClose, onCopy }: AIResultCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopy?.(text);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (result.type === 'text') {
    return (
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 z-40">
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              AI Response
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(result.content)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Copy response"
              >
                <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
          <div className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap break-words max-h-48 overflow-y-auto">
            {result.content}
          </div>
          {copied && (
            <div className="mt-3 text-xs text-green-600 dark:text-green-400">
              ✓ Copied to clipboard
            </div>
          )}
        </div>
      </div>
    );
  }

  if (result.type === 'code') {
    return (
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-2xl animate-in fade-in slide-in-from-bottom-4 duration-300 z-40">
        <div className="bg-slate-900 dark:bg-slate-950 rounded-xl shadow-lg border border-slate-700 dark:border-slate-800 p-4">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="px-2 py-1 bg-blue-600 dark:bg-blue-700 text-white text-xs font-mono rounded">
                {result.language || 'Code'}
              </span>
              <h3 className="text-sm font-semibold text-white">Generated Code</h3>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(result.content)}
                className="p-1.5 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Copy code"
              >
                <Copy className="w-4 h-4 text-slate-300" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-slate-300" />
              </button>
            </div>
          </div>
          <pre className="font-mono text-sm text-slate-100 dark:text-slate-200 whitespace-pre-wrap break-words max-h-48 overflow-y-auto bg-slate-950 dark:bg-slate-900 rounded p-3">
            <code>{result.content}</code>
          </pre>
          {copied && (
            <div className="mt-3 text-xs text-green-400">
              ✓ Copied to clipboard
            </div>
          )}
        </div>
      </div>
    );
  }

  if (result.type === 'image') {
    return (
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 z-40">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 rounded-xl shadow-lg border border-blue-200 dark:border-slate-700 p-4">
          <div className="flex items-start justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              Enhanced Image Prompt
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(result.content)}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Copy prompt"
              >
                <Copy className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                title="Close"
              >
                <X className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 italic mb-2">
            Paste this into any AI image generator:
          </p>
          <div className="text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 rounded p-3 border border-slate-200 dark:border-slate-700 max-h-32 overflow-y-auto">
            {result.content}
          </div>
          {copied && (
            <div className="mt-3 text-xs text-green-600 dark:text-green-400">
              ✓ Copied to clipboard
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
