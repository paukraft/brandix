'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

export const queryClient = new QueryClient()

export const ReactQuery = ({
  children,
  noDevtools = false,
}: {
  children: React.ReactNode
  noDevtools?: boolean
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {!noDevtools && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
