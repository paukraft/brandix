import { useEffect, useRef, useState } from "react"

import { RegistrarLogo } from "@/components/registrar-logo"
import { cost, yearly, type FreeDomain } from "@/lib/naming"
import { REGISTRARS } from "@/lib/registrars"
import { cn } from "@/lib/utils"

/**
 * Inset on the left so a 12px mark, or the dot centred in its place, sits
 * where the dot of a plain pill does. Closed, the pill takes a full touch
 * target; open, its rows sit too close for one each.
 */
const ROW =
  "relative flex h-6 items-center gap-1.5 rounded-full pr-2.5 pl-[7px] outline-none transition-[background-color,scale] duration-150 ease-[cubic-bezier(0.2,0,0,1)] hover:bg-current/10 aria-[expanded=false]:touch-target focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset"

/**
 * A free domain's status and what a year of it costs where it is cheapest.
 * Clicked, the pill grows into the list of every registrar's price: its own
 * row stays where it was and becomes the cheapest registrar's, the others
 * unfold beneath it, each a link to register the domain there.
 */
export function PriceBadge({
  free: { domain, offers, premium },
}: {
  free: FreeDomain
}) {
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLSpanElement>(null)
  const [surface, ink] =
    premium === undefined
      ? ["bg-ok-soft", "text-ok"]
      : ["bg-warn-soft", "text-warn"]
  const status = premium === undefined ? "Available" : "Premium"

  useEffect(() => {
    if (!open) return
    const close = (event: Event) => {
      const outside = !root.current?.contains(event.target as Node)
      if (outside || (event as KeyboardEvent).key === "Escape") setOpen(false)
    }
    const events = ["pointerdown", "focusin", "keydown"]
    events.forEach((type) => document.addEventListener(type, close))
    return () =>
      events.forEach((type) => document.removeEventListener(type, close))
  }, [open])

  if (!offers.length)
    return (
      <span
        className={cn(
          "inline-flex h-6 items-center gap-1.5 rounded-full px-2.5 text-caption whitespace-nowrap",
          surface,
          ink
        )}
      >
        <span className="size-1.5 rounded-full bg-current" />
        {status}
      </span>
    )

  const [cheapest, ...rest] = offers

  return (
    <span
      ref={root}
      data-open={open || undefined}
      style={{ "--rows": rest.length } as React.CSSProperties}
      className={cn(
        "t-offers text-caption whitespace-nowrap tabular-nums",
        ink
      )}
    >
      <span aria-hidden className={cn("t-offers-panel", surface)} />
      <a
        href={REGISTRARS[cheapest.registrar].url(domain)}
        target="_blank"
        rel="noreferrer"
        aria-expanded={open}
        // The first click opens the list; after that this is a row like the rest.
        onClick={(event) => {
          if (open) return
          event.preventDefault()
          setOpen(true)
        }}
        className={ROW}
      >
        {/* Both of each pair keep one cell, so nothing around them moves. */}
        <span className="grid size-3 place-items-center *:col-start-1 *:row-start-1">
          <span
            className={cn(
              "size-1.5 rounded-full bg-current",
              open && "invisible"
            )}
          />
          <RegistrarLogo
            registrar={cheapest.registrar}
            className={cn(!open && "invisible")}
          />
        </span>
        <span className="inline-grid *:col-start-1 *:row-start-1">
          <span
            className={cn("flex items-center gap-1.5", open && "invisible")}
          >
            {status}
            <span className="opacity-70">·</span>
          </span>
          <span className={cn(!open && "invisible")}>
            {REGISTRARS[cheapest.registrar].name}
          </span>
        </span>
        <span className="opacity-70">{cost({ offers, premium })}</span>
      </a>
      <ul inert={!open} className="t-offers-rest">
        {rest.map(({ registrar, price }) => (
          <li key={registrar}>
            <a
              href={REGISTRARS[registrar].url(domain)}
              target="_blank"
              rel="noreferrer"
              className={ROW}
            >
              <RegistrarLogo registrar={registrar} />
              <span className="min-w-0 flex-1 truncate">
                {REGISTRARS[registrar].name}
              </span>
              <span className="opacity-70">{yearly(price)}</span>
            </a>
          </li>
        ))}
      </ul>
    </span>
  )
}
