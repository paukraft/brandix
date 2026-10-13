import { useCallback, useMemo } from "react"

import { suggestionKey, type Suggestion } from "@/lib/naming"
import { useDismissedStore, useFavoriteStore } from "@/hooks/use-reactions"

export function useFavorites() {
  const [favorites, setFavorites] = useFavoriteStore()
  const [dismissed, setDismissed] = useDismissedStore()

  const keys = useMemo(() => new Set(favorites.map(suggestionKey)), [favorites])

  const isFavorite = useCallback(
    (suggestion: Suggestion) => keys.has(suggestionKey(suggestion)),
    [keys]
  )

  /** Starring a name takes back its dismissal. */
  const toggleFavorite = useCallback(
    (suggestion: Suggestion) => {
      const key = suggestionKey(suggestion)
      if (keys.has(key)) {
        setFavorites(favorites.filter((f) => suggestionKey(f) !== key))
        return
      }
      setFavorites([suggestion, ...favorites])
      if (dismissed.includes(suggestion.name)) {
        setDismissed(dismissed.filter((name) => name !== suggestion.name))
      }
    },
    [favorites, keys, setFavorites, dismissed, setDismissed]
  )

  return { favorites, isFavorite, toggleFavorite }
}
