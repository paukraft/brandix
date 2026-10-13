import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

/**
 * A window over a dimmed page, built like the studio itself: one card with a
 * title, a body that scrolls, and the actions under it. Surfaces inside are
 * tiles, told apart by tone rather than rules.
 */
function Dialog({
  open,
  onOpenChange,
  title,
  description,
  className,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  className?: string
  children: React.ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-scrim backdrop-blur-[2px] transition-opacity duration-(--modal-open-dur) ease-(--modal-ease) data-ending-style:opacity-0 data-ending-style:duration-(--modal-close-dur) data-starting-style:opacity-0 motion-reduce:transition-none" />
        <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <DialogPrimitive.Popup
            className={cn(
              "pointer-events-auto flex max-h-full w-full max-w-[460px] flex-col rounded-window bg-card p-6 shadow-[0_24px_80px_-24px_oklch(0.2_0.003_68/0.28)] transition-[scale,opacity] duration-(--modal-open-dur) ease-(--modal-ease) outline-none data-ending-style:scale-(--modal-scale-close) data-ending-style:opacity-0 data-ending-style:duration-(--modal-close-dur) data-starting-style:scale-(--modal-scale) data-starting-style:opacity-0 motion-reduce:transition-none sm:p-8 dark:shadow-[0_24px_80px_-24px_oklch(0_0_0/0.6)]",
              className
            )}
          >
            <header className="flex shrink-0 items-start gap-3">
              <div className="min-w-0 flex-1">
                <DialogPrimitive.Title className="text-[22px] leading-tight font-medium tracking-[-0.01em] text-balance">
                  {title}
                </DialogPrimitive.Title>
                {description && (
                  <DialogPrimitive.Description className="mt-2 text-note text-pretty text-muted-foreground">
                    {description}
                  </DialogPrimitive.Description>
                )}
              </div>
              <DialogPrimitive.Close
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Close"
                    className="-mt-1 -mr-2 size-8 text-muted-foreground hover:text-foreground"
                  />
                }
              >
                <X />
              </DialogPrimitive.Close>
            </header>
            {children}
          </DialogPrimitive.Popup>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

/** The part that scrolls when the window outgrows the screen. */
function DialogBody({
  className,
  children,
}: {
  className?: string
  children: React.ReactNode
}) {
  return (
    <ScrollArea className={cn("-mx-1 mt-7 flex-1", className)}>
      <div className="flex flex-col gap-7 px-1">{children}</div>
    </ScrollArea>
  )
}

export { Dialog, DialogBody }
