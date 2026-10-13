import { ThumbsDown } from "@phosphor-icons/react"
import { useState } from "react"

import { IconButton } from "@/components/ui/icon-button"
import { TextSwap } from "@/components/ui/text-swap"
import { NameRow, tldOf } from "@/components/studio/name-row"
import { PriceBadge } from "@/components/studio/price-badge"
import { useDismissed } from "@/hooks/use-dismissed"
import type { Round, ShownName } from "@/lib/naming"

function SuggestionRow({
  shown: { name, reason, domains },
  index,
}: {
  shown: ShownName
  index: number
}) {
  const { isDismissed, toggleDismissed } = useDismissed()
  const [picked, setPicked] = useState(domains[0])
  const { domain, offers, premium } = picked
  const dismissed = isDismissed(name)
  const others = domains.filter((option) => option !== picked)

  return (
    <NameRow
      suggestion={{ name, domain }}
      confirmed={{ status: "available", offers, premium }}
      muted={dismissed}
      index={index}
      badge={
        // Above the row's later lines, which an open badge grows over.
        <TextSwap id={domain} value={picked} className="relative z-10 shrink-0">
          {(value) => <PriceBadge free={value} />}
        </TextSwap>
      }
      actions={
        <IconButton
          label={dismissed ? "Bring back" : "Dismiss"}
          aria-pressed={dismissed}
          onClick={() => toggleDismissed(name)}
          className="aria-pressed:text-foreground"
        >
          <span className="t-icon-swap" data-state={dismissed ? "b" : "a"}>
            <ThumbsDown className="t-icon" data-icon="a" />
            <ThumbsDown weight="fill" className="t-icon" data-icon="b" />
          </span>
        </IconButton>
      }
    >
      <p className="mt-1 text-note text-pretty text-muted-foreground">
        {reason}
      </p>
      {others.length > 0 && (
        <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-caption text-muted-foreground">
          Also free on
          {others.map((option) => (
            <button
              key={option.domain}
              type="button"
              aria-label={`Use ${option.domain}`}
              onClick={() => setPicked(option)}
              className="relative rounded-sm bg-foreground/5 px-1.5 font-mono text-[12px] transition-colors outline-none after:absolute after:-inset-1 hover:bg-foreground/10 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {tldOf(option.domain)}
            </button>
          ))}
        </p>
      )}
    </NameRow>
  )
}

/** The names picked from a round, on a tile, and how wide the round went. */
export function SuggestionList({
  round: { names, checked, free },
}: {
  round: Round
}) {
  if (!names.length) return null

  return (
    <div className="flex flex-col gap-2">
      <ul className="rounded-lg bg-tile">
        {names.map((shown, index) => (
          <SuggestionRow key={shown.name} shown={shown} index={index} />
        ))}
      </ul>
      <p className="px-4 text-caption text-muted-foreground tabular-nums">
        Picked from {free} free of {checked} names checked
      </p>
    </div>
  )
}
