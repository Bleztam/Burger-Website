import type { Metadata, Viewport } from 'next'
import { Inter, Bebas_Neue } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LenisProvider } from '@/components/lenis-provider'
import { CartProvider } from '@/components/cart-provider'
import { AiConciergeChatbot } from '@/components/ai-concierge-chatbot'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-bebas',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Smash Burger Culture | Brazilian Street-Style Burgers',
  description:
    'Authentic Brazilian street-style smash burgers. Crispy edges, juicy centers, loaded with flavor. Order now for delivery or find our location in Sao Paulo.',
  keywords: ['smash burger', 'brazilian burger', 'street food', 'sao paulo'],
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#0d0d12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${bebasNeue.variable} bg-background`}>
      <body className="font-sans antialiased noise-overlay">
        <CartProvider>
          <LenisProvider>
            {children}
            <AiConciergeChatbot />
          </LenisProvider>
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}


