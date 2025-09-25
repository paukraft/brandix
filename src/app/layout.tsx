import { Navbar } from '@/components/navbar'
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Brandix - AI-Powered Brand Naming Assistant',
    template: '%s | Brandix',
  },
  description:
    'AI-powered brand naming that captures your vision. Generate distinctive, memorable, and pronounceable names for your ideas, projects, startups, and companies with real-time domain availability checking.',
  openGraph: {
    type: 'website',
    title: 'Brandix - AI-Powered Brand Naming Assistant',
    description:
      'AI-powered brand naming that captures your vision. Generate distinctive, memorable names with real-time domain checking.',
    siteName: 'Brandix',
  },
  twitter: {
    card: 'summary',
    title: 'Brandix - AI-Powered Brand Naming Assistant',
    description:
      'AI-powered brand naming that captures your vision. Generate distinctive, memorable names with real-time domain checking.',
    creator: '@paukraft',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  )
}
