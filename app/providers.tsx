'use client';

import { ToastProvider } from '@/context/ToastContext';
import { Analytics } from '@vercel/analytics/next';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      {children}
      <Analytics />
    </ToastProvider>
  );
}
