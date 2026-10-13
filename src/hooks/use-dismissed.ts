import { useCallback } from "react"

import { useDismissedStore, useFavoriteStore } from "@/hooks/use-reactions"

/** Names the user turned down. They stay in the thread, read as rejected. */
export function useDismissed() {
  const [dismissed, setDismissed] = useDismissedStore()
  const [favorites, setFavorites] = useFavoriteStore()

  const isDismissed = useCallback(
    (name: string) => dismissed.includes(name),
    [dismissed]
  )

  /** Dismissing a name takes it off the shortlist, whatever its domain. */
  const toggleDismissed = useCallback(
    (name: string) => {
      if (dismissed.includes(name)) {
        setDismissed(dismissed.filter((d) => d !== name))
        return
      }
      setDismissed([name, ...dismissed])
      if (favorites.some((f) => f.name === name)) {
        setFavorites(favorites.filter((f) => f.name !== name))
      }
    },
    [dismissed, setDismissed, favorites, setFavorites]
  )

  return { dismissed, isDismissed, toggleDismissed }
}
