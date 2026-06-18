import { ImageResponse } from 'next/og'
export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'
export default function Icon() {
  return new ImageResponse(
    <div style={{
      width: 32, height: 32, borderRadius: 8,
      background: 'linear-gradient(135deg,#22d3ee,#06b6d4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <line x1="6" y1="6" x2="12" y2="18" stroke="white" strokeWidth="1.5" opacity="0.6"/>
        <line x1="18" y1="6" x2="12" y2="18" stroke="white" strokeWidth="1.5" opacity="0.6"/>
        <line x1="6" y1="6" x2="18" y2="6" stroke="white" strokeWidth="1.5" opacity="0.4"/>
        <circle cx="6" cy="6" r="2.5" fill="white"/>
        <circle cx="18" cy="6" r="2.5" fill="white" opacity="0.85"/>
        <circle cx="12" cy="18" r="2.5" fill="white"/>
      </svg>
    </div>
  )
}
