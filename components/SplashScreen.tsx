'use client';

import { useState, useEffect } from 'react';
import { Logo } from './Logo';

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center transition-opacity duration-500"
      style={{
        backgroundColor: '#F1E8C7',
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
    >
      {/* Logo with breathing animation */}
      <div
        style={{
          animation: 'breathing 1.8s ease-in-out infinite',
        }}
      >
        <Logo size="lg" />
      </div>

      {/* Tagline */}
      <p
        className="mt-6 text-center"
        style={{
          fontSize: '16px',
          color: '#5C4A2A',
          opacity: 0.7,
        }}
      >
        Think visually. Build together.
      </p>

      <style>{`
        @keyframes breathing {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.04);
          }
        }
      `}</style>
    </div>
  );
}
