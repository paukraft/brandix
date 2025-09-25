import { ChatUIProvider } from '@/components/chat-ui'
import { ThemeProvider } from '@/components/theme-provider'
import { TrackiTrack } from '@/components/tracki-track'
import { Toaster } from '@/components/ui/sonner'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <ChatUIProvider>
        <Toaster position="top-right" />
        <TrackiTrack />
        <NuqsAdapter>{children}</NuqsAdapter>
      </ChatUIProvider>
    </ThemeProvider>
  )
}
