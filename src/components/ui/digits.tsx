import { useState } from "react"

import { cn } from "@/lib/utils"

/**
 * A number whose characters pop in whenever it changes, the last two
 * trailing behind (transitions.dev number pop-in). The first value renders
 * still.
 */
export function Digits({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const [previous, setPrevious] = useState(value)
  const [changed, setChanged] = useState(false)

  if (value !== previous) {
    setPrevious(value)
    setChanged(true)
  }

  const chars = [...value]
  const stagger = (index: number) => {
    if (index === 0) return undefined
    if (index === chars.length - 1) return 2
    if (index === chars.length - 2) return 1
    return undefined
  }

  return (
    // Keyed by value so every change remounts the group and replays.
    <span
      key={changed ? value : undefined}
      className={cn("t-digit-group", changed && "is-animating", className)}
    >
      {chars.map((char, index) => (
        <span key={index} className="t-digit" data-stagger={stagger(index)}>
          {char}
        </span>
      ))}
    </span>
  )
}
