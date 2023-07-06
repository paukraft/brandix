import Footer from '@/components/Footer'
import { NavBar } from '@/components/NavBar'
import { ThemeProvider } from '@/components/ThemeProvider'
import { Toaster } from '@/components/ui/Toaster'
import { Analytics } from '@vercel/analytics/react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Brandix - Generate Brand Names Using AI',
  description:
    'Brandix uses AI to generate unique, short, and brandable business names. Our algorithm learns to make better recommendations over time. Try it for free!',
  keywords: [
    'Brandix',
    'AI',
    'brand names',
    'business names',
    'unique names',
    'short names',
    'brandable names',
    'name generator',
    'algorithm',
    'recommendations',
  ],
  authors: [{ name: 'Pau Kraft' }],
  publisher: 'Brandix',
  openGraph: {
    title: 'Brandix - Generate Brand Names Using AI',
    description:
      'Brandix uses AI to generate unique, short, and brandable business names. Our algorithm learns to make better recommendations over time. Try it for free!',
    url: 'https://brandix.ai',
    siteName: 'Brandix',
    images: [
      {
        url: 'https://brandix.ai/logo.png',
        width: 1080,
        height: 1080,
        alt: 'Brandix - AI Name Generator',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark dark:bg-slate-950 overflow-x-hidden">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="flex min-h-screen flex-col relative gap-6">
            <NavBar />

            {/* Blob */}
            <div className="absolute top-0 -translate-y-1/2 container w-full right-0 left-0 overflow-visible pointer-events-none">
              <div className="w-full aspect-square dark:bg-blue-950 rounded-full blur-3xl opacity-20 scale-125" />
            </div>

            <div className="flex flex-col gap-6">{children}</div>

            <Footer />
          </main>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
