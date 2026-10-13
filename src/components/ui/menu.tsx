import { Menu as MenuPrimitive } from "@base-ui/react/menu"
import type { Icon } from "@phosphor-icons/react"
import { useState } from "react"

export type MenuAction =
  | {
      label: string
      icon: Icon
      onClick: () => void
      disabled?: boolean
      /**
       * macOS confirms a menu click by blinking the item before the menu
       * closes. Opt in only where that's the sole feedback — copying, a quiet
       * background action. Anything that visibly changes the page already
       * confirms itself.
       */
      blink?: boolean
    }
  | "separator"

/** One beat of the selection blink: highlight off, then back on. */
const BLINK_MS = 90

/** A popup list of actions hung off any trigger element. */
export function Menu({
  trigger,
  actions,
  align = "end",
}: {
  trigger: React.ReactElement<Record<string, unknown>>
  actions: MenuAction[]
  align?: "start" | "center" | "end"
}) {
  const [open, setOpen] = useState(false)
  const [blinking, setBlinking] = useState<string>()

  /** Holds the menu open for the blink, then acts and closes it. */
  const blinkThen = (label: string, onClick: () => void) => () => {
    if (blinking) return
    setBlinking(label)
    setTimeout(() => {
      setBlinking(undefined)
      onClick()
      setOpen(false)
    }, BLINK_MS * 2)
  }

  return (
    <MenuPrimitive.Root open={open} onOpenChange={setOpen}>
      <MenuPrimitive.Trigger render={trigger} />
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner sideOffset={6} align={align} className="z-50">
          <MenuPrimitive.Popup className="min-w-52 origin-[var(--transform-origin)] rounded-lg bg-popover p-1 text-popover-foreground shadow-[0_12px_40px_-12px_oklch(0.2_0.003_68/0.25)] transition-[scale,opacity] duration-(--dropdown-open-dur) ease-(--dropdown-ease) data-ending-style:scale-(--dropdown-closing-scale) data-ending-style:opacity-0 data-ending-style:duration-(--dropdown-close-dur) data-starting-style:scale-(--dropdown-pre-scale) data-starting-style:opacity-0 motion-reduce:transition-none">
            {actions.map((action, index) =>
              action === "separator" ? (
                <MenuPrimitive.Separator
                  key={`separator-${index}`}
                  className="-mx-1 my-1 h-px bg-border"
                />
              ) : (
                <MenuPrimitive.Item
                  key={action.label}
                  disabled={action.disabled}
                  closeOnClick={!action.blink}
                  onClick={
                    action.blink
                      ? blinkThen(action.label, action.onClick)
                      : action.onClick
                  }
                  data-blink={blinking === action.label || undefined}
                  className="flex cursor-default items-center gap-2.5 rounded-sm px-2.5 py-1.5 text-note outline-none select-none data-blink:animate-[menu-item-blink_90ms] data-highlighted:bg-muted data-disabled:opacity-60"
                >
                  <action.icon className="size-3.5 text-muted-foreground" />
                  {action.label}
                </MenuPrimitive.Item>
              )
            )}
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  )
}
