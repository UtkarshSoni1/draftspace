import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'
import '@excalidraw/excalidraw/index.css'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'DraftSpace — Think visually',
  description: 'An AI-powered collaborative whiteboard',
  generator: 'v0.app',
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased" style={{ backgroundColor: '#F7F3E8', color: '#5C4A2A' }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
