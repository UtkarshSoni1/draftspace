'use client';

import { Github, Linkedin, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 h-12 border-t flex items-center justify-center gap-6 px-4"
      style={{
        backgroundColor: '#FDFAF3',
        borderColor: '#E8DDB5',
      }}
    >
      <div className="flex items-center gap-6">
        {/* GitHub Link */}
        <a
          href="https://github.com/UtkarshSoni1"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-70"
          title="GitHub"
          style={{ color: '#5C4A2A' }}
        >
          <Github className="w-5 h-5" />
        </a>

        {/* Instagram Link */}
        <a
          href="https://www.instagram.com/utk.arsh_soni/"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-70"
          title="Instagram"
          style={{ color: '#5C4A2A' }}
        >
          <Instagram className="w-5 h-5" />
        </a>

        {/* LinkedIn Link */}
        <a
          href="https://www.linkedin.com/in/utkarsh-soni-6bb1b2322"
          target="_blank"
          rel="noopener noreferrer"
          className="transition-opacity hover:opacity-70"
          title="LinkedIn"
          style={{ color: '#5C4A2A' }}
        >
          <Linkedin className="w-5 h-5" />
        </a>
      </div>
    </footer>
  );
}
