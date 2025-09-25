import { useCallback, useEffect, useMemo } from 'react'
import { useLocalStorage } from 'usehooks-ts'
import { SuggestionType } from './schemas'

const STORAGE_KEY = 'favorite-suggestions'
const OLD_STORAGE_KEY = 'favoriteDomains'

const createSuggestionKey = (s: SuggestionType) =>
  `${(s.domain || '').trim()}::${(s.name || '').trim()}`

const normalizeSuggestion = (s: SuggestionType): SuggestionType => ({
  domain: (s.domain || '').trim(),
  name: (s.name || '').trim(),
})

export const useFavorites = () => {
  const [favorites, setFavorites] = useLocalStorage<SuggestionType[]>(
    STORAGE_KEY,
    []
  )

  // One-time migration from v1 `favoriteDomains` → `favorite-suggestions`
  useEffect(() => {
    try {
      const raw =
        typeof window !== 'undefined'
          ? window.localStorage.getItem(OLD_STORAGE_KEY)
          : null
      if (!raw) return

      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        window.localStorage.removeItem(OLD_STORAGE_KEY)
        return
      }

      const migrated = (parsed as unknown[]) // v1 objects
        .map((item) => {
          const record = item as Record<string, unknown>
          const name = typeof record.name === 'string' ? record.name.trim() : ''
          const domain =
            typeof record.domain === 'string' ? record.domain.trim() : ''
          return { name, domain }
        })
        .filter((s) => s.name && s.domain)
        .map((s) => ({ domain: s.domain, name: s.name }))

      if (migrated.length === 0) {
        window.localStorage.removeItem(OLD_STORAGE_KEY)
        return
      }

      setFavorites((prev) => {
        const existingKeys = new Set(prev.map((s) => createSuggestionKey(s)))
        const toAdd = migrated
          .map((s) => ({
            domain: (s.domain || '').trim(),
            name: (s.name || '').trim(),
          }))
          .filter((s) => !existingKeys.has(createSuggestionKey(s)))
        if (toAdd.length === 0) return prev
        return [...prev, ...toAdd]
      })

      window.localStorage.removeItem(OLD_STORAGE_KEY)
    } catch {
      // If parsing fails, remove the old key to avoid retry loops
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(OLD_STORAGE_KEY)
      }
    }
  }, [setFavorites])

  const favoriteKeySet = useMemo(
    () => new Set(favorites.map((s) => createSuggestionKey(s))),
    [favorites]
  )

  const isFavorited = useCallback(
    (suggestion: SuggestionType) =>
      favoriteKeySet.has(createSuggestionKey(suggestion)),
    [favoriteKeySet]
  )

  const addFavorite = useCallback(
    (suggestion: SuggestionType) => {
      const normalized = normalizeSuggestion(suggestion)
      const key = createSuggestionKey(normalized)
      if (favoriteKeySet.has(key)) return
      setFavorites((prev) => [...prev, normalized])
    },
    [favoriteKeySet, setFavorites]
  )

  const removeFavorite = useCallback(
    (suggestion: SuggestionType) => {
      const key = createSuggestionKey(normalizeSuggestion(suggestion))
      if (!favoriteKeySet.has(key)) return
      setFavorites((prev) => prev.filter((s) => createSuggestionKey(s) !== key))
    },
    [favoriteKeySet, setFavorites]
  )

  const toggleFavorite = useCallback(
    (suggestion: SuggestionType) => {
      const normalized = normalizeSuggestion(suggestion)
      const key = createSuggestionKey(normalized)
      setFavorites((prev) => {
        const exists = prev.some((s) => createSuggestionKey(s) === key)
        if (exists) return prev.filter((s) => createSuggestionKey(s) !== key)
        return [...prev, normalized]
      })
    },
    [setFavorites]
  )

  return {
    favorites,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite,
  }
}
