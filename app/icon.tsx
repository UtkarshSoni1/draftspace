import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: '#F1E8C7',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
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
          {/* Sparkle */}
          <g transform="translate(20, 6)">
            <path
              d="M0,-3 L1,-1 L3,0 L1,1 L0,3 L-1,1 L-3,0 L-1,-1 Z"
              fill="#5C4A2A"
            />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  );
}
