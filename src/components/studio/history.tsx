import { MagnifyingGlass, X } from "@phosphor-icons/react"
import { useMemo, useState } from "react"

import { DialogBody } from "@/components/ui/dialog"
import { IconButton } from "@/components/ui/icon-button"
import type { Conversation } from "@/hooks/use-conversations"

const DAY = 24 * 60 * 60 * 1000

/** How far back a conversation lies, in the order the groups are shown. */
const AGES = ["Today", "Yesterday", "This week", "Older"] as const

function ageOf(time: number) {
  const days = Math.floor((new Date().setHours(24, 0, 0, 0) - time) / DAY)
  return AGES[days < 1 ? 0 : days < 2 ? 1 : days < 7 ? 2 : 3]
}

const clock = new Intl.DateTimeFormat(undefined, { timeStyle: "short" })
const day = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
})

/**
 * What a conversation is found by: it goes by what the user first asked for,
 * and every name it showed leads back to it.
 */
function entryOf(conversation: Conversation) {
  const prompts: string[] = []
  const names: string[] = []
  for (const message of conversation.messages) {
    for (const part of message.parts) {
      if (part.type === "text" && message.role === "user") {
        prompts.push(part.text)
      } else if (
        part.type === "tool-suggestNames" &&
        part.state === "output-available"
      ) {
        names.push(...part.output.names.map(({ name }) => name))
      }
    }
  }
  return { conversation, title: prompts[0] ?? "Untitled", prompts, names }
}

/**
 * Past conversations, newest first under how long ago they were, each one to
 * open again or delete. The search goes through their prompts and names.
 */
export function History({
  conversations,
  onOpen,
  onRemove,
}: {
  conversations: Conversation[]
  onOpen: (id: string) => void
  onRemove: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const entries = useMemo(() => conversations.map(entryOf), [conversations])

  const needle = query.trim().toLowerCase()
  const has = (text: string) => text.toLowerCase().includes(needle)
  const found = entries.flatMap((entry) => {
    const direct = !needle || entry.prompts.some(has)
    // Found by a name it showed: the row says which.
    const hit = direct ? undefined : entry.names.find(has)
    return direct || hit ? [{ ...entry, hit }] : []
  })

  return (
    <>
      <label className="mt-5 flex h-10 shrink-0 items-center gap-2 rounded-full bg-tile px-3.5 text-muted-foreground transition-shadow has-focus-visible:ring-3 has-focus-visible:ring-ring/15 pointer-coarse:h-11">
        <MagnifyingGlass className="size-4 shrink-0" />
        <input
          autoFocus
          value={query}
          placeholder="Search prompts and names"
          aria-label="Search conversations"
          onChange={(event) => setQuery(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-note text-foreground outline-none placeholder:text-muted-foreground"
        />
      </label>

      <DialogBody className="mt-3">
        {found.length ? (
          <div className="flex flex-col gap-4 px-1 pb-1">
            {AGES.map((age) => {
              const rows = found.filter(
                ({ conversation }) => ageOf(conversation.updatedAt) === age
              )
              return (
                rows.length > 0 && (
                  <section key={age} className="flex flex-col gap-0.5">
                    <h3 className="px-3 pb-1 text-caption text-muted-foreground">
                      {age}
                    </h3>
                    <ul aria-label={age} className="flex flex-col gap-0.5">
                      {rows.map(({ conversation, title, hit }) => (
                        <li
                          key={conversation.id}
                          className="group/row relative flex items-center rounded-lg pr-1.5 transition-colors duration-150 focus-within:bg-tile hover:bg-tile"
                        >
                          <button
                            type="button"
                            onClick={() => onOpen(conversation.id)}
                            className="flex h-10 min-w-0 flex-1 items-center gap-3 rounded-lg pr-2 pl-3 text-left text-note outline-none focus-visible:ring-3 focus-visible:ring-ring/50 pointer-coarse:h-12"
                          >
                            <span className="truncate">{title}</span>
                            {hit && (
                              <span className="shrink-0 text-muted-foreground">
                                {hit}
                              </span>
                            )}
                            <span className="ml-auto shrink-0 text-caption text-muted-foreground tabular-nums">
                              {(age === "Today" ? clock : day).format(
                                conversation.updatedAt
                              )}
                            </span>
                          </button>
                          {/* Revealed on hover where there is hover; always there on touch. */}
                          <IconButton
                            label="Delete"
                            aria-label={`Delete: ${title}`}
                            onClick={() => onRemove(conversation.id)}
                            className="size-7 pointer-fine:hidden pointer-fine:group-focus-within/row:flex pointer-fine:group-hover/row:flex"
                          >
                            <X />
                          </IconButton>
                        </li>
                      ))}
                    </ul>
                  </section>
                )
              )
            })}
          </div>
        ) : (
          <p className="px-4 py-10 text-center text-note text-pretty text-muted-foreground">
            No conversation mentions “{query.trim()}”.
          </p>
        )}
      </DialogBody>
    </>
  )
}
