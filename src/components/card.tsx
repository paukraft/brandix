import { cn } from '@/lib/utils'
import { PropsWithChildren } from 'react'

export const Card = ({
  children,
  className,
}: PropsWithChildren<{ className?: string }>) => {
  return (
    <div
      className={cn(
        'p-6 rounded-lg gap-2 border border-input dark:bg-zinc-900/10 flex flex-col w-fit',
        className
      )}
    >
      {children}
    </div>
  )
}
