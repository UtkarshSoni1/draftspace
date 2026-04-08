'use client';

import React from 'react';
import { Github, Instagram, Linkedin } from 'lucide-react';

interface MenuLink {
  label: string;
  icon: React.ReactNode;
  href: string;
}

export function SocialMenu() {
  const socialLinks: MenuLink[] = [
    {
      label: 'GitHub',
      icon: <Github className="w-5 h-5" />,
      href: 'https://github.com/UtkarshSoni1',
    },
    {
      label: 'Instagram',
      icon: <Instagram className="w-5 h-5" />,
      href: 'https://www.instagram.com/utk.arsh_soni/',
    },
    {
      label: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      href: 'https://www.linkedin.com/in/utkarsh-soni-6bb1b2322',
    },
  ];

  return (
    <div
      className="fixed top-20 right-4 bg-white rounded-lg shadow-lg border border-slate-200 p-2 z-50"
      style={{
        backgroundColor: '#FDFAF3',
        borderColor: '#E8DDB5',
        boxShadow: '0 4px 12px rgba(92, 74, 42, 0.15)',
      }}
    >
      <div className="flex flex-col gap-2">
        {socialLinks.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 rounded-md transition-all hover:bg-slate-100"
            style={{
              color: '#5C4A2A',
            }}
            title={link.label}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F1E8C7';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span style={{ color: '#9CA764' }}>{link.icon}</span>
            <span className="text-sm font-medium">{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
