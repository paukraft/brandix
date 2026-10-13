import { useMemo } from "react"
import { z } from "zod"

import {
  REACTED_MAX,
  TRAITS_MAX,
  traitSchema,
  type Taste,
  type Trait,
} from "@/lib/naming"
import { useDismissed } from "@/hooks/use-dismissed"
import { useFavorites } from "@/hooks/use-favorites"
import { useStored } from "@/hooks/use-stored"

const traitsSchema = z.array(traitSchema)
const NO_TRAITS: Trait[] = []

export type TasteProfile = ReturnType<typeof useTaste>

function same(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase()
}

/**
 * What the user wants in a name: the traits they wrote, and the names they
 * starred and dismissed.
 */
export function useTaste() {
  const [traits, setTraits] = useStored(
    "brandix:taste",
    traitsSchema,
    NO_TRAITS
  )
  const { favorites } = useFavorites()
  const { dismissed } = useDismissed()

  const payload = useMemo<Taste>(
    () => ({
      traits,
      liked: [...new Set(favorites.map((f) => f.name))].slice(0, REACTED_MAX),
      disliked: dismissed.slice(0, REACTED_MAX),
    }),
    [traits, favorites, dismissed]
  )

  return {
    traits,
    /** The taste as the chat request carries it. */
    payload,
    /** Add a trait, or restate one already there where it stands. */
    add: (text: string, stance: Trait["stance"]) => {
      const trait = { text, stance }
      setTraits(
        traits.some((t) => same(t.text, text))
          ? traits.map((t) => (same(t.text, text) ? trait : t))
          : [...traits, trait].slice(-TRAITS_MAX)
      )
    },
    remove: ({ text }: Trait) =>
      setTraits(traits.filter((t) => !same(t.text, text))),
    reset: () => setTraits(NO_TRAITS),
  }
}
