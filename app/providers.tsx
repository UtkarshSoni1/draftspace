'use client';

import { SessionProvider } from 'next-auth/react';
import { ToastProvider } from '@/context/ToastContext';
import { Analytics } from '@vercel/analytics/next';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        {children}
        <Analytics />
      </ToastProvider>
    </SessionProvider>
  );
}
