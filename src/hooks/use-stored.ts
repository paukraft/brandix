import { useCallback, useMemo, useSyncExternalStore } from "react"
import type { z } from "zod"

const listeners = new Set<() => void>()

function subscribe(listener: () => void) {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

function read(key: string) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

/**
 * A localStorage value, validated on read and shared live across every
 * component (and tab) using the same key. The server renders the fallback.
 */
export function useStored<T>(key: string, schema: z.ZodType<T>, fallback: T) {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(key),
    () => null
  )

  // Parsed once per stored string, so the value is referentially stable.
  const value = useMemo(() => {
    if (raw === null) return fallback
    try {
      const parsed = schema.safeParse(JSON.parse(raw))
      return parsed.success ? parsed.data : fallback
    } catch {
      return fallback
    }
  }, [raw, schema, fallback])

  /** False when storage is full or blocked: the change is dropped. */
  const set = useCallback(
    (next: T) => {
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        return false
      }
      listeners.forEach((listener) => listener())
      return true
    },
    [key]
  )

  return [value, set] as const
}
