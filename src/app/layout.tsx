import Footer from '@/components/Footer'
import { NavBar } from '@/components/NavBar'
import { Toaster } from '@/components/ui/Toaster'
import { Analytics } from '@vercel/analytics/react'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Brandix',
  description: 'Generated brand names with AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark dark:bg-slate-950">
      <body className={inter.className}>
        <main className="flex min-h-screen flex-col relative gap-6">
          <NavBar />

          {/* Blob */}
          <div className="fixed top-0 -translate-y-1/2 container w-full right-0 left-0 overflow-visible pointer-events-none">
            <div className="w-full aspect-square dark:bg-blue-950 rounded-full blur-3xl opacity-10 scale-125" />
          </div>

          <div className="flex flex-col gap-6">{children}</div>

          <Footer />
        </main>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
