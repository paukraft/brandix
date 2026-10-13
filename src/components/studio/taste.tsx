import { ArrowElbowDownLeft, X } from "@phosphor-icons/react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { IconButton } from "@/components/ui/icon-button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useDismissed } from "@/hooks/use-dismissed"
import type { TasteProfile } from "@/hooks/use-taste"
import { TRAIT_MAX, type Trait } from "@/lib/naming"
import { cn } from "@/lib/utils"

/** What the section is, wherever it is titled. */
export const TASTE_DESCRIPTION = "Every round of names follows this."

/** The newest dismissed names on show before the rest are asked for. */
const DISMISSED_SHOWN = 12

/** The two sides of a taste, in the words and colour they go by everywhere. */
const SIDES: Side[] = [
  { stance: "like", label: "Like", dot: "bg-ok", example: "two syllables" },
  {
    stance: "avoid",
    label: "Avoid",
    dot: "bg-danger",
    example: "-ify endings",
  },
]

type Side = {
  stance: Trait["stance"]
  label: string
  dot: string
  example: string
}

function Dot({ className }: { className: string }) {
  return <span className={cn("size-1.5 shrink-0 rounded-full", className)} />
}

/**
 * A control small enough to sit inside a chip. Its touch target only grows
 * tall: wider, it would reach over the control beside it.
 */
function ChipButton(props: React.ComponentProps<typeof IconButton>) {
  return (
    <IconButton
      {...props}
      className="size-6 after:min-w-0 pointer-coarse:size-8 [&_svg:not([class*='size-'])]:size-3.5"
    />
  )
}

function Chip({
  text,
  index,
  removeLabel,
  onRemove,
}: {
  text: string
  index: number
  removeLabel: string
  onRemove: () => void
}) {
  return (
    <li
      style={{ "--i": index } as React.CSSProperties}
      className="t-rise flex h-7 max-w-full items-center rounded-full bg-foreground/[0.06] pr-0.5 pl-2.5 text-note pointer-coarse:h-9"
    >
      <span className="truncate pr-0.5">{text}</span>
      <ChipButton
        label={removeLabel}
        aria-label={`${removeLabel}: ${text}`}
        onClick={onRemove}
      >
        <X />
      </ChipButton>
    </li>
  )
}

/** A set of chips under its own name. */
function Group({
  label,
  dot,
  children,
}: {
  label: string
  dot: string
  children: React.ReactNode
}) {
  return (
    <section className="flex flex-col gap-1.5">
      <h3 className="flex items-center gap-1.5 text-caption text-muted-foreground">
        <Dot className={dot} />
        {label}
      </h3>
      <ul
        aria-label={label}
        className="flex flex-wrap gap-1.5 pointer-coarse:gap-2"
      >
        {children}
      </ul>
    </section>
  )
}

/** A trait in the user's own words, on the side they pick. Enter adds it. */
function AddTrait({ onAdd }: { onAdd: TasteProfile["add"] }) {
  const [text, setText] = useState("")
  const [side, setSide] = useState(SIDES[0])
  const trimmed = text.trim()

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        if (!trimmed) return
        onAdd(trimmed, side.stance)
        setText("")
      }}
      className="flex h-9 items-center rounded-full bg-tile pr-1.5 pl-1 transition-shadow has-[input:focus-visible]:ring-3 has-[input:focus-visible]:ring-ring/15 pointer-coarse:h-11"
    >
      <div role="group" aria-label="Side" className="flex shrink-0">
        {SIDES.map((option) => (
          <button
            key={option.stance}
            type="button"
            aria-pressed={option === side}
            onClick={() => setSide(option)}
            className="flex h-7 items-center gap-1.5 rounded-full px-2.5 text-caption text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 aria-pressed:bg-foreground/[0.08] aria-pressed:text-foreground pointer-coarse:h-9"
          >
            <Dot className={option.dot} />
            {option.label}
          </button>
        ))}
      </div>
      <input
        value={text}
        maxLength={TRAIT_MAX}
        placeholder={`e.g. ${side.example}`}
        aria-label={`Something to ${side.label.toLowerCase()}`}
        onChange={(event) => setText(event.target.value)}
        className="min-w-0 flex-1 bg-transparent px-2 text-note outline-none placeholder:text-muted-foreground"
      />
      <ChipButton type="submit" label="Add" disabled={!trimmed}>
        <ArrowElbowDownLeft />
      </ChipButton>
    </form>
  )
}

/**
 * What the user wants in a name, as chips sorted into what to like and what to
 * avoid, then the names they dismissed, each one to bring back. As a `pane` it carries its own heading; in a `dialog` the dialog
 * titles it.
 */
export function Taste({
  variant,
  taste,
}: {
  variant: "pane" | "dialog"
  taste: TasteProfile
}) {
  const heading = variant === "pane"
  const { traits } = taste
  const { dismissed, toggleDismissed } = useDismissed()
  const [allDismissed, setAllDismissed] = useState(false)

  return (
    <div
      className={cn("flex flex-col gap-3", heading && "max-h-3/5 shrink-0 p-4")}
    >
      {(heading || traits.length > 0) && (
        <header className="flex items-baseline gap-2">
          {heading && (
            <h2 className="text-heading font-medium tracking-[-0.01em]">
              Taste
            </h2>
          )}
          {traits.length > 0 && (
            <button
              type="button"
              onClick={taste.reset}
              className="relative ml-auto rounded-sm text-caption text-muted-foreground transition-colors outline-none after:absolute after:-inset-y-2 after:right-0 after:-left-2 hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              Reset
            </button>
          )}
        </header>
      )}

      {heading && (
        <p className="-mt-2 text-note text-pretty text-muted-foreground">
          {TASTE_DESCRIPTION}
        </p>
      )}

      {/* The traits scroll on their own, so the field under them stays put.
          Bled by a hair so the scroller doesn't clip a focus ring. */}
      <ScrollArea className="-m-1">
        <div className="flex flex-col gap-3 p-1">
          {traits.length ? (
            SIDES.map((side) => {
              const mine = traits.filter(
                (trait) => trait.stance === side.stance
              )
              return (
                mine.length > 0 && (
                  <Group key={side.stance} label={side.label} dot={side.dot}>
                    {mine.map((trait, index) => (
                      <Chip
                        key={trait.text.toLowerCase()}
                        text={trait.text}
                        index={index}
                        removeLabel="Remove"
                        onRemove={() => taste.remove(trait)}
                      />
                    ))}
                  </Group>
                )
              )
            })
          ) : (
            <p className="text-note text-pretty text-muted-foreground">
              The names you star and dismiss already steer each round. Add a
              trait to spell out what you want.
            </p>
          )}
          {dismissed.length > 0 && (
            <Group label="Dismissed names" dot="bg-muted-foreground/50">
              {(allDismissed
                ? dismissed
                : dismissed.slice(0, DISMISSED_SHOWN)
              ).map((name, index) => (
                <Chip
                  key={name}
                  text={name}
                  index={index}
                  removeLabel="Bring back"
                  onRemove={() => toggleDismissed(name)}
                />
              ))}
              {dismissed.length > DISMISSED_SHOWN && (
                <li>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAllDismissed(!allDismissed)}
                    className="h-7 rounded-full text-muted-foreground hover:text-foreground pointer-coarse:h-9"
                  >
                    {allDismissed
                      ? "Show fewer"
                      : `Show all ${dismissed.length}`}
                  </Button>
                </li>
              )}
            </Group>
          )}
        </div>
      </ScrollArea>

      <AddTrait onAdd={taste.add} />
    </div>
  )
}
