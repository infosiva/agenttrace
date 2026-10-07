import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', background: '#0c111a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="120" height="120" viewBox="0 0 32 32">
          <path d="M7 22 L14 12 L19 18 L25 9" fill="none" stroke="#22d3ee" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="7" cy="22" r="2.4" fill="#22d3ee" />
          <circle cx="14" cy="12" r="2.4" fill="#22d3ee" />
          <circle cx="19" cy="18" r="2.4" fill="#22d3ee" />
          <circle cx="25" cy="9" r="2.4" fill="#fb7185" />
        </svg>
      </div>
    ),
    size,
  );
}
