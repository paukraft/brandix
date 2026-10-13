import { useState } from "react"

import { cn } from "@/lib/utils"

/**
 * Swaps content in place when `id` changes: the old copy exits up with a
 * blur, then the new one enters from below (transitions.dev text swap).
 * Content is a render function so the outgoing state can still be drawn.
 */
export function TextSwap<T>({
  id,
  value,
  children,
  className,
}: {
  id: string | number
  value: T
  children: (value: T) => React.ReactNode
  className?: string
}) {
  const [shown, setShown] = useState({ id, value })
  const [leaving, setLeaving] = useState<typeof shown | null>(null)
  const [swapped, setSwapped] = useState(false)

  if (id !== shown.id) {
    setLeaving(shown)
    setShown({ id, value })
    setSwapped(true)
  }

  return (
    <span className={cn("t-text-swap", className)}>
      {leaving && (
        <span
          key={`leaving-${leaving.id}`}
          aria-hidden
          className="is-exit"
          onAnimationEnd={(event) =>
            event.target === event.currentTarget && setLeaving(null)
          }
        >
          {children(leaving.value)}
        </span>
      )}
      <span key={id} className={cn(swapped && "is-enter")}>
        {children(value)}
      </span>
    </span>
  )
}
