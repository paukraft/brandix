import { cn } from '@/lib/utils'

function Skeleton({
  variant = 'bright',
  className,
  ...props
}: { variant?: 'dark' | 'bright' } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-start')} {...props}>
      <div
        className={cn(
          'h-[1em] w-32 animate-pulse rounded-md',
          variant === 'dark' && 'bg-[hsl(210,40%,96.1%)]',
          variant === 'bright' && 'bg-neutral-600',
          className
        )}
      />
      {/* Invisible space fo height 5Head, please dont delete it :) */}
      <div className="invisible">​</div>
    </div>
  )
}

export { Skeleton }
