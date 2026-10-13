import {
  ArrowSquareOut,
  ArrowsLeftRight,
  ChartBarHorizontal,
  Copy,
  DotsThree,
  GitBranch,
  Plus,
  Scissors,
  Shuffle,
  Star,
} from "@phosphor-icons/react"
import { useQueryClient } from "@tanstack/react-query"

import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { Menu } from "@/components/ui/menu"
import { TextSwap } from "@/components/ui/text-swap"
import { useStudio } from "@/components/studio/studio-context"
import { useFavorites } from "@/hooks/use-favorites"
import { domainQuery, type DomainCheck } from "@/lib/domain.functions"
import { domainUrl, type Suggestion } from "@/lib/naming"
import { cn } from "@/lib/utils"

const iterations = (name: string) => [
  {
    label: "Similar names",
    icon: GitBranch,
    prompt: `Generate variations of "${name}" with a similar meaning and style`,
    followUps: [
      `More variations of "${name}"`,
      `Variations of "${name}" in a different style`,
      `Make "${name}" more unique`,
    ],
  },
  {
    label: "Shorter",
    icon: Scissors,
    prompt: `Shorten "${name}" while keeping its core meaning`,
    followUps: [
      `Even shorter versions of "${name}"`,
      `Single-word versions of "${name}"`,
    ],
  },
  {
    label: "Add prefix or suffix",
    icon: Plus,
    prompt: `Extend "${name}" with prefixes or suffixes`,
    followUps: [
      `Different prefixes for "${name}"`,
      `Different suffixes for "${name}"`,
    ],
  },
  {
    label: "Swap in synonyms",
    icon: ArrowsLeftRight,
    prompt: `Replace words in "${name}" with synonyms or related terms`,
    followUps: [`More synonyms for "${name}"`, `Stronger words for "${name}"`],
  },
  {
    label: "Rearrange",
    icon: Shuffle,
    prompt: `Rearrange or restructure the parts of "${name}"`,
    followUps: [
      `Other word orders for "${name}"`,
      `Make "${name}" flow better`,
    ],
  },
]

/** A domain's ending, dot included: ".com" of "stripe.com". */
export const tldOf = (domain: string) => domain.slice(domain.indexOf("."))

/**
 * A name on a tile, wherever it is listed: its domain as the headline with
 * `badge` beside it and `children` under it, then the star, `actions`, analyze
 * and the overflow menu. `muted` sets back a name that is out of the running.
 */
export function NameRow({
  suggestion,
  confirmed,
  muted,
  index,
  badge,
  actions,
  children,
}: {
  suggestion: Suggestion
  /** What is already known of the domain, so starring need not ask again. */
  confirmed?: DomainCheck
  muted: boolean
  /** Its place in a list that rises in one after another. */
  index?: number
  badge: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  const { name, domain } = suggestion
  const { send, busy } = useStudio()
  const { isFavorite, toggleFavorite } = useFavorites()
  const favorite = isFavorite(suggestion)
  const queryClient = useQueryClient()

  const star = () => {
    if (confirmed) {
      queryClient.setQueryData(domainQuery(domain).queryKey, confirmed)
    }
    toggleFavorite(suggestion)
  }

  return (
    <li
      style={{ "--i": index } as React.CSSProperties}
      className="t-rise t-offers-host flex items-center gap-3 px-4 py-3 max-sm:flex-col max-sm:items-stretch max-sm:gap-2.5"
    >
      {/* A muted name keeps its place, so the list still reads whole. */}
      <div
        className={cn(
          "min-w-0 flex-1 transition-opacity duration-150",
          muted && "opacity-50"
        )}
      >
        {/* The domain is the headline: the name with the TLD it is free on. */}
        <div className="flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
          <a
            href={domainUrl(domain)}
            target="_blank"
            rel="noreferrer"
            className={cn(
              "group/domain flex min-w-0 items-baseline rounded-sm text-heading font-medium tracking-[-0.01em] transition-colors duration-150 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
              muted && "text-muted-foreground"
            )}
          >
            <span className="truncate">{name}</span>
            <TextSwap
              id={domain}
              value={tldOf(domain)}
              className="shrink-0 text-muted-foreground transition-colors duration-150 group-hover/domain:text-foreground"
            >
              {(tld) => tld}
            </TextSwap>
          </a>
          {badge}
        </div>
        {children}
      </div>

      {/* Too narrow for both side by side: the actions drop under the name,
          pulled left so the first icon lines up with the text. */}
      <div className="flex shrink-0 items-center max-sm:-ml-2 pointer-coarse:gap-3">
        <IconButton
          label={favorite ? "Remove from shortlist" : "Add to shortlist"}
          aria-pressed={favorite}
          onClick={star}
          className="aria-pressed:text-foreground"
        >
          <span className="t-icon-swap" data-state={favorite ? "b" : "a"}>
            <Star className="t-icon" data-icon="a" />
            <Star weight="fill" className="t-icon" data-icon="b" />
          </span>
        </IconButton>
        {actions}
        <IconButton
          label="Analyze this name"
          aria-label="Analyze"
          disabled={busy}
          onClick={() => send(`Analyze the name "${name}" (${domain})`)}
        >
          <ChartBarHorizontal />
        </IconButton>
        <Menu
          trigger={
            <Button
              variant="ghost"
              size="icon"
              aria-label="More"
              className="size-8 text-muted-foreground hover:text-foreground data-popup-open:text-foreground"
            >
              <DotsThree weight="bold" />
            </Button>
          }
          actions={[
            ...iterations(name).map((it) => ({
              label: it.label,
              icon: it.icon,
              disabled: busy,
              onClick: () => send(it.prompt, it.followUps),
            })),
            "separator",
            {
              label: "Copy name",
              icon: Copy,
              blink: true,
              onClick: () => navigator.clipboard.writeText(name),
            },
            {
              label: "Open on Domainr",
              icon: ArrowSquareOut,
              onClick: () =>
                window.open(domainUrl(domain), "_blank", "noopener"),
            },
          ]}
        />
      </div>
    </li>
  )
}
