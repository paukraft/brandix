import { createContext, useContext } from "react"

type StudioContextValue = {
  /** Send a message; `followUps` replaces the prompt chips under the composer. */
  send: (text: string, followUps?: string[]) => void
  /** A reply is on its way; actions that would send wait for it. */
  busy: boolean
}

export const StudioContext = createContext<StudioContextValue | null>(null)

export function useStudio() {
  const value = useContext(StudioContext)
  if (!value) throw new Error("useStudio outside <StudioContext>")
  return value
}
