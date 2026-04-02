'use client';

import { useToast } from '@/context/ToastContext';
import { CommandInput } from './CommandInput';

interface HomeContentProps {
  onCommandSubmit: (command: string) => void;
  onPatternDetected: (pattern: 'ai' | 'img' | 'code', value: string) => void;
}

export default function HomeContent({
  onCommandSubmit,
  onPatternDetected,
}: HomeContentProps) {
  const { addToast } = useToast();

  const demoToastProcessing = () => {
    addToast({
      type: 'processing',
      message: 'Generating image...',
      description: 'Your AI image is being created',
    });
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
    <>
      {/* Toast Demo Buttons - Optional to display */}
      <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 flex gap-2 justify-center flex-wrap z-40 bg-white p-3 rounded-lg shadow-lg border border-slate-200">
        <button
          onClick={demoToastProcessing}
          className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition-colors"
        >
          Processing
        </button>
        <button
          onClick={demoToastSuccess}
          className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition-colors"
        >
          Success
        </button>
        <button
          onClick={demoToastError}
          className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
        >
          Error
        </button>
        <button
          onClick={demoToastCopy}
          className="px-3 py-1 bg-slate-600 text-white rounded text-xs hover:bg-slate-700 transition-colors"
        >
          Copy
        </button>
      </div>

      {/* Command Input */}
      <CommandInput
        onSubmit={onCommandSubmit}
        onPatternDetected={onPatternDetected}
      />
    </>
  );
}
