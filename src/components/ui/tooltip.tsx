import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

/**
 * A second reading of something already on the page.
 *
 * The rule it keeps is that nothing here is only here: a tooltip elaborates —
 * the exact stamp behind "4 minutes ago" — it never carries the only copy of
 * something a reader needs, because a touch screen and a screen reader both
 * arrive at the trigger without it. So the trigger stays legible alone, and
 * this is what hovering adds.
 *
 * The popup mounts on open, which is why the content may be computed in the
 * browser's own terms — a local time zone, a live count — without disagreeing
 * with the markup the server sent.
 */
function Tooltip({
  trigger,
  children,
  side = "top",
  align = "center",
  delay = 200,
  disabled = false,
}: {
  /** The element being explained — rendered as the trigger, not wrapped. */
  trigger: React.ReactElement<Record<string, unknown>>
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  align?: "start" | "center" | "end"
  delay?: number
  /** For a trigger that only sometimes hides what the tooltip would say. */
  disabled?: boolean
}) {
  return (
    <TooltipPrimitive.Root disabled={disabled}>
      <TooltipPrimitive.Trigger delay={delay} render={trigger} />
      <TooltipPrimitive.Portal>
        {/* The z-index belongs on the positioner: the popup is statically
            positioned, so a z-index on it is ignored. */}
        <TooltipPrimitive.Positioner
          sideOffset={6}
          side={side}
          align={align}
          className="z-50"
        >
          <TooltipPrimitive.Popup
            className={cn(
              "max-w-[min(20rem,calc(100vw-2rem))] origin-[var(--transform-origin)] rounded-md bg-popover px-2 py-1 text-caption text-popover-foreground shadow-[0_8px_28px_-12px_oklch(0.2_0.003_68/0.3)]",
              // Eases in, gets out of the way almost at once.
              "transition-[scale,opacity] duration-(--tt-in-dur) ease-(--tt-in-ease) data-ending-style:scale-(--tt-scale) data-ending-style:opacity-0 data-ending-style:duration-(--tt-out-dur) data-ending-style:ease-(--tt-out-ease) data-starting-style:scale-(--tt-scale) data-starting-style:opacity-0 motion-reduce:transition-none"
            )}
          >
            {children}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export { Tooltip }
