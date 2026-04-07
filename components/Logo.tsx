import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ size = 'md' }: LogoProps) {
  const sizeMap = {
    sm: { icon: 20, text: 16 },
    md: { icon: 28, text: 22 },
    lg: { icon: 40, text: 32 },
  };

  const { icon: iconSize, text: textSize } = sizeMap[size];

  return (
    <div className="flex items-center gap-2">
      {/* Pen nib SVG with sparkle */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Pen nib */}
        <path
          d="M16 2C16 2 8 10 8 16C8 22 12 26 16 26C20 26 24 22 24 16C24 10 16 2 16 2Z"
          fill="#9CA764"
        />
        {/* Pen nib tip */}
        <path
          d="M14 26C14 28 15 30 16 30C17 30 18 28 18 26H14Z"
          fill="#9CA764"
        />

        {/* Sparkle (✦) at top right */}
        <g transform={`translate(${iconSize * 0.65}, ${iconSize * 0.2})`}>
          <path
            d="M0,-3 L1,-1 L3,0 L1,1 L0,3 L-1,1 L-3,0 L-1,-1 Z"
            fill="#5C4A2A"
          />
        </g>
      </svg>

      {/* Wordmark */}
      <span
        style={{ fontSize: `${textSize}px` }}
        className="font-semibold tracking-tight"
      >
        <span style={{ color: '#5C4A2A' }}>Draft</span>
        <span style={{ color: '#9CA764' }}>Space</span>
      </span>
    </div>
  );
}
