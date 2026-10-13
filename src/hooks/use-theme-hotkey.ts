import { useEffect } from "react"

import { toggleTheme } from "@/lib/theme"

/** Press D anywhere outside a text field to flip the theme. */
export function useThemeHotkey() {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "d") return
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) return

      const target = event.target as HTMLElement
      if (target.isContentEditable || target.closest("input, textarea, select"))
        return

      toggleTheme()
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])
}
