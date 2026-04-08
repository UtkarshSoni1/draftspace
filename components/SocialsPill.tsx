'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Github, Instagram, Linkedin } from 'lucide-react';

interface SocialLink {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export function SocialsPill() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const socialLinks: SocialLink[] = [
    {
      label: 'GitHub',
      icon: <Github className="w-4 h-4" />,
      href: 'https://github.com/UtkarshSoni1',
    },
    {
      label: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4" />,
      href: 'https://www.linkedin.com/in/utkarsh-soni-6bb1b2322',
    },
    {
      label: 'Instagram',
      icon: <Instagram className="w-4 h-4" />,
      href: 'https://www.instagram.com/utk.arsh_soni/',
    },
  ];

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Close on mouse leave (desktop)
  const handleMouseLeave = () => {
    setIsOpen(false);
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 z-50"
      onMouseLeave={handleMouseLeave}
    >
      {/* Closed Pill State */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          onMouseEnter={() => setIsOpen(true)}
          className="px-3 py-2 rounded-full font-medium text-sm transition-all duration-300 ease-out hover:shadow-md active:scale-95"
          style={{
            backgroundColor: '#E8DDB5',
            color: '#5C4A2A',
            border: '1.5px solid #C5D08A',
            boxShadow: '0 2px 8px rgba(92, 74, 42, 0.12)',
          }}
        >
          Socials ✦
        </button>
      )}

      {/* Open Dialog State */}
      {isOpen && (
        <div
          className="absolute bottom-0 right-0 rounded-2xl p-3 shadow-xl border animate-in fade-in zoom-in-95 duration-200"
          style={{
            backgroundColor: '#FDFAF3',
            borderColor: '#E8DDB5',
            border: '1.5px solid #E8DDB5',
            boxShadow: '0 8px 24px rgba(92, 74, 42, 0.16)',
            minWidth: '200px',
          }}
        >
          <div className="flex flex-col gap-1">
            {socialLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg transition-all duration-200 group"
                style={{
                  color: '#5C4A2A',
                }}
              >
                <span
                  className="transition-colors duration-200 group-hover:opacity-100"
                  style={{ color: '#9CA764' }}
                >
                  {link.icon}
                </span>
                <span className="text-sm font-medium group-hover:font-semibold transition-all">
                  {link.label}
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Dark mode styles */}
      <style>{`
        .dark [style*="background: #FDFAF3"] {
          background-color: #2a2418 !important;
          border-color: #3d3428 !important;
        }
        
        .dark [style*="color: #5C4A2A"] {
          color: #e8ddb5 !important;
        }
        
        .dark [style*="background-color: #E8DDB5"] {
          background-color: #9CA764 !important;
          border-color: #7A8A4E !important;
        }
      `}</style>
    </div>
  );
}
