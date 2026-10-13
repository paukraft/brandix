import { z } from "zod"

import { suggestionSchema, type Suggestion } from "@/lib/naming"
import { useStored } from "@/hooks/use-stored"

const favoritesSchema = z.array(suggestionSchema)
const dismissedSchema = z.array(z.string())
const NO_FAVORITES: Suggestion[] = []
const NO_DISMISSED: string[] = []

/**
 * The two reactions to a name, newest first. Kept side by side because each
 * one clears the other: a name is starred or dismissed, never both.
 */
export function useFavoriteStore() {
  return useStored("favorite-suggestions", favoritesSchema, NO_FAVORITES)
}

export function useDismissedStore() {
  return useStored("brandix:dismissed", dismissedSchema, NO_DISMISSED)
}
