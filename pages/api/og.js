import { ImageResponse } from '@vercel/og'

export const config = {
  runtime: 'edge',
}

export default function handler(req) {
  return new ImageResponse(
    (
        <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
        }}
      >
          <svg
            width="120"
            height="150"
            viewBox="0 0 24 24"
            fill="#ff5d26"
            >
            <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z" />
            </svg>
        </div>
    
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}