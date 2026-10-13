import { Star } from "@phosphor-icons/react"

import { Digits } from "@/components/ui/digits"
import { ScrollArea } from "@/components/ui/scroll-area"
import { TextSwap } from "@/components/ui/text-swap"
import {
  useAvailability,
  type Availability,
} from "@/components/studio/domain-status"
import { NameRow } from "@/components/studio/name-row"
import { PriceBadge } from "@/components/studio/price-badge"
import { useFavorites } from "@/hooks/use-favorites"
import { suggestionKey } from "@/lib/naming"
import { cn } from "@/lib/utils"

/** Available names lead; taken ones sink to the bottom. */
const RANK: Record<Availability["status"], number> = {
  available: 0,
  checking: 1,
  unknown: 2,
  taken: 3,
}

/**
 * Starred names. As a `pane` it carries its own heading; in a `dialog` the
 * dialog titles it.
 */
export function Shortlist({ variant }: { variant: "pane" | "dialog" }) {
  const heading = variant === "pane"
  const { favorites } = useFavorites()
  const availability = useAvailability(favorites)

  const rows = favorites
    .map((suggestion, index) => ({
      suggestion,
      availability: availability[index],
    }))
    .sort((a, b) => RANK[a.availability.status] - RANK[b.availability.status])
  const available = rows.filter(
    (row) => row.availability.status === "available"
  ).length

  return (
    <div className="flex h-full min-h-0 flex-col">
      {heading && (
        <header className="flex items-baseline gap-2 px-4 pt-4 pb-3">
          <h2 className="text-heading font-medium tracking-[-0.01em]">
            Shortlist
          </h2>
          {favorites.length > 0 && (
            <>
              <span className="text-caption text-muted-foreground tabular-nums">
                <Digits value={String(favorites.length)} />
              </span>
              <span className="ml-auto text-caption text-muted-foreground tabular-nums">
                <Digits value={String(available)} /> available
              </span>
            </>
          )}
        </header>
      )}

      {rows.length ? (
        <ScrollArea className="flex-1">
          <ul className={cn("rounded-lg bg-tile", heading && "mx-3 mb-3")}>
            {rows.map(({ suggestion, availability: checked }) => (
              <NameRow
                key={suggestionKey(suggestion)}
                suggestion={suggestion}
                muted={checked.status === "taken"}
                badge={
                  <TextSwap
                    id={checked.status}
                    value={checked}
                    className="relative z-10 shrink-0 text-caption text-muted-foreground"
                  >
                    {(value) => (
                      <Status domain={suggestion.domain} availability={value} />
                    )}
                  </TextSwap>
                }
              />
            ))}
          </ul>
        </ScrollArea>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center px-8 py-10 text-center">
          <span className="t-stagger-line grid size-12 place-items-center rounded-xl bg-tile text-muted-foreground [&_svg]:size-6">
            <Star />
          </span>
          <h3 className="t-stagger-line mt-5 text-heading font-medium tracking-[-0.01em] [--line:1]">
            Nothing shortlisted yet
          </h3>
          <p className="t-stagger-line mt-1.5 max-w-[260px] text-note text-pretty text-muted-foreground [--line:2]">
            Star a name to keep it here. Your shortlist stays on this device.
          </p>
        </div>
      )}
    </div>
  )
}

/** Where a starred domain stands: its price while free, a word otherwise. */
function Status({
  domain,
  availability,
}: {
  domain: string
  availability: Availability
}) {
  switch (availability.status) {
    case "available":
      return <PriceBadge free={{ domain, ...availability }} />
    case "checking":
      return <span className="t-shimmer">Checking</span>
    case "taken":
      return "Taken"
    case "unknown":
      return "Unknown"
  }
}
