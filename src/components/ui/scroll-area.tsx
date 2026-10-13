import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"
import { useEffect, useRef, useState } from "react"

import { useTouchPrimary } from "@/hooks/use-touch-primary"
import { cn } from "@/lib/utils"

const FADE =
  "pointer-events-none absolute inset-x-0 z-10 h-8 from-card to-transparent opacity-0 transition-opacity duration-300 data-shown:opacity-100"

/**
 * What scrolls up and down inside a card, after Lina (lina.sameer.sh): an
 * edge fades where there is more beyond it, touch scrolls natively, and a
 * pointer gets a scrollbar that shows only while it is of use. `className`
 * sizes the area; what is inside lays itself out.
 */
function ScrollArea({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLSpanElement>(null)
  const bottomRef = useRef<HTMLSpanElement>(null)
  const touch = useTouchPrimary()
  const [above, setAbove] = useState(false)
  const [below, setBelow] = useState(false)

  // There is more past an edge while the content's own end is out of view.
  // Watching the ends, not the scroll size, leaves out what only reaches past
  // an edge in passing, like a chip rising into place.
  useEffect(() => {
    const top = topRef.current
    const bottom = bottomRef.current
    if (!top || !bottom) return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const { target, isIntersecting } of entries) {
          const setMore = target === top ? setAbove : setBelow
          setMore(!isIntersecting)
        }
      },
      { root: viewportRef.current, rootMargin: "1px" }
    )
    observer.observe(top)
    observer.observe(bottom)
    return () => observer.disconnect()
  }, [touch])

  const root = cn("relative flex min-h-0 flex-col overflow-hidden", className)
  const content = (
    <>
      <span ref={topRef} className="block" />
      {children}
      <span ref={bottomRef} className="block" />
    </>
  )
  const fades = (
    <>
      <span
        data-shown={above || undefined}
        className={cn(FADE, "top-0 bg-linear-to-b")}
      />
      <span
        data-shown={below || undefined}
        className={cn(FADE, "bottom-0 bg-linear-to-t")}
      />
    </>
  )

  if (touch) {
    return (
      <div className={root}>
        <div ref={viewportRef} className="min-h-0 flex-1 overflow-y-auto">
          {content}
        </div>
        {fades}
      </div>
    )
  }

  return (
    <ScrollAreaPrimitive.Root className={root}>
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        className="min-h-0 flex-1 outline-none"
      >
        {content}
      </ScrollAreaPrimitive.Viewport>
      <ScrollAreaPrimitive.Scrollbar className="z-20 flex w-2.5 touch-none p-px opacity-0 transition-opacity duration-150 select-none data-hovering:opacity-100 data-scrolling:opacity-100">
        <ScrollAreaPrimitive.Thumb className="my-1 flex-1 rounded-full bg-faint transition-[scale] active:scale-y-95" />
      </ScrollAreaPrimitive.Scrollbar>
      {fades}
    </ScrollAreaPrimitive.Root>
  )
}

export { ScrollArea }
