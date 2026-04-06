'use client';

import { useState, useCallback } from 'react';
import { parseCommand } from '@/lib/commandParser';
import { streamTextAi, callImageAi, callCodeAi } from '@/lib/ai-client';

export type AIResult = {
  type: 'text' | 'image' | 'code';
  content: string;
  language?: string;
  originalPrompt?: string;
};

interface UseAICommandState {
  isLoading: boolean;
  error: string | null;
  result: AIResult | null;
}

export function useAICommand() {
  const [state, setState] = useState<UseAICommandState>({
    isLoading: false,
    error: null,
    result: null,
  });

  const executeCommand = useCallback(async (input: string) => {
    setState({ isLoading: true, error: null, result: null });

    try {
      const parsed = parseCommand(input);

      if (parsed.type === 'unknown') {
        setState({
          isLoading: false,
          error: 'Invalid command format. Use { ai: }, { img: }, or { code: }',
          result: null,
        });
        return;
      }

      if (parsed.type === 'text') {
        const response = await streamTextAi(parsed.prompt);
        if (!response.success) {
          setState({
            isLoading: false,
            error: response.error || 'Failed to get response',
            result: null,
          });
          return;
        }
        setState({
          isLoading: false,
          error: null,
          result: {
            type: 'text',
            content: response.data,
          },
        });
      } else if (parsed.type === 'code') {
        const response = await callCodeAi(parsed.prompt, parsed.language);
        if (!response.success) {
          setState({
            isLoading: false,
            error: response.error || 'Failed to generate code',
            result: null,
          });
          return;
        }
        setState({
          isLoading: false,
          error: null,
          result: {
            type: 'code',
            content: response.data,
            language: response.language,
          },
        });
      } else if (parsed.type === 'image') {
        const response = await callImageAi(parsed.prompt);
        if (!response.success) {
          setState({
            isLoading: false,
            error: response.error || 'Failed to generate image',
            result: null,
          });
          return;
        }
        setState({
          isLoading: false,
          error: null,
          result: {
            type: 'image',
            content: response.data,
            originalPrompt: parsed.prompt,
          },
        });
      }
    } catch (err) {
      setState({
        isLoading: false,
        error: err instanceof Error ? err.message : 'An error occurred',
        result: null,
      });
    }
  }, []);

  const clearResult = useCallback(() => {
    setState({ isLoading: false, error: null, result: null });
  }, []);

  return {
    ...state,
    executeCommand,
    clearResult,
  };
}
