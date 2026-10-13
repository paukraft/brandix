import { useCallback } from "react"
import { z } from "zod"

import type { BrandixMessage } from "@/lib/chat"
import { useStored } from "@/hooks/use-stored"

const conversationsSchema = z.array(
  z.object({
    id: z.string(),
    updatedAt: z.number(),
    messages: z.array(z.custom<BrandixMessage>()),
  })
)

export type Conversation = z.infer<typeof conversationsSchema>[number]

const NO_CONVERSATIONS: Conversation[] = []

/** Older ones fall off. */
const CONVERSATIONS_MAX = 50

/** Past conversations, newest first. They stay on the device. */
export function useConversations() {
  const [conversations, setConversations] = useStored(
    "brandix:conversations",
    conversationsSchema,
    NO_CONVERSATIONS
  )

  /** Files the conversation on top, unless nothing in it changed. */
  const save = useCallback(
    (id: string, messages: BrandixMessage[]) => {
      const saved = conversations.find((c) => c.id === id)
      if (JSON.stringify(saved?.messages) === JSON.stringify(messages)) return
      let kept = [
        { id, updatedAt: Date.now(), messages },
        ...conversations.filter((c) => c.id !== id),
      ].slice(0, CONVERSATIONS_MAX)
      // Storage full: the oldest make room.
      while (!setConversations(kept) && kept.length > 1) {
        kept = kept.slice(0, -1)
      }
    },
    [conversations, setConversations]
  )

  return {
    conversations,
    save,
    remove: (id: string) =>
      setConversations(conversations.filter((c) => c.id !== id)),
  }
}
