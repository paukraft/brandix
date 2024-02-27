import { ReactQuery } from '@/components/ReactQuery'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ReactQuery>{children}</ReactQuery>
}
