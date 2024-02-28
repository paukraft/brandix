import { Suspense, type ReactNode } from 'react'

const Layout = async ({ children }: { children?: ReactNode }) => {
  return <Suspense>{children}</Suspense>
}

export default Layout
