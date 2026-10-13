import { ArrowClockwise } from "@phosphor-icons/react"
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import { TextSwap } from "@/components/ui/text-swap"
import { AnalysisCard } from "@/components/studio/analysis-card"
import { Markdown } from "@/components/studio/markdown"
import { SuggestionList } from "@/components/studio/suggestion-list"
import type { BrandixMessage } from "@/lib/chat"
import { SHOWN_MIN, type Round } from "@/lib/naming"

type Part = BrandixMessage["parts"][number]

const THINKING = ["Thinking…", "Exploring directions…", "Weighing options…"]

/** A shimmering status line that steps through `THINKING` while it waits. */
function ThinkingLine() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const hold = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(
        "--think-hold"
      )
    )
    const timer = setInterval(
      () => setIndex((i) => (i + 1) % THINKING.length),
      hold
    )
    return () => clearInterval(timer)
  }, [])

  return (
    <TextSwap id={index} value={THINKING[index]} className="self-start">
      {(text) => (
        <span role="status" className="t-shimmer text-note">
          {text}
        </span>
      )}
    </TextSwap>
  )
}

/** The round a part carries once its names are picked. */
function finalRound(part: Part) {
  return part.type === "tool-suggestNames" &&
    part.state === "output-available" &&
    !part.preliminary
    ? part.output
    : null
}

/** How many names a finished round showed. */
function shownNames(part: Part) {
  return finalRound(part)?.names.length ?? null
}

/**
 * An unfinished round or analysis shows only while `live`, and an analysis
 * only once the name it reads is whole.
 */
function isVisible(part: Part, live: boolean) {
  return (
    (part.type === "text" && part.text.trim().length > 0) ||
    (part.type === "tool-suggestNames" &&
      (finalRound(part)
        ? shownNames(part) !== 0
        : live || part.state === "output-error")) ||
    (part.type === "tool-displayAnalysis" &&
      (part.state === "output-available" ||
        (live && part.state !== "output-error" && !!part.input?.criteria)))
  )
}

/** Nothing on screen yet, or the last round came back thin and another follows. */
function isWaiting(message: BrandixMessage) {
  const part = message.parts.findLast(
    (p) => isVisible(p, true) || shownNames(p) === 0
  )
  const shown = part ? shownNames(part) : 0
  return shown !== null && shown < SHOWN_MIN
}

/** Where a round of names stands: drafting, checking or picking. */
function roundStatus(part: Extract<Part, { type: "tool-suggestNames" }>) {
  if (part.state === "output-available") {
    const { free, checked } = part.output
    return `${free} of ${checked} are free. Picking the best…`
  }

  const directions = part.input?.directions ?? []
  const count = directions.reduce(
    (sum, direction) => sum + (direction?.names?.length ?? 0),
    0
  )
  if (part.state !== "input-streaming") return `Checking ${count} names…`

  // A direction's label is whole once its names start to arrive.
  const label = directions.findLast((direction) => direction?.names)?.label
  return `${label ?? "Drafting names"}… ${count}`
}

function AssistantPart({ part, live }: { part: Part; live: boolean }) {
  switch (part.type) {
    case "text":
      return <Markdown text={part.text} live={live} />
    case "tool-suggestNames": {
      if (part.state === "output-error") {
        return (
          <p className="rounded-lg bg-danger-soft px-4 py-3 text-note text-pretty text-danger">
            Couldn't check domains just now, so there are no names to show.
          </p>
        )
      }
      return (
        <span
          role="status"
          className="t-shimmer self-start text-note tabular-nums"
        >
          {roundStatus(part)}
        </span>
      )
    }
    case "tool-displayAnalysis":
      return (
        <AnalysisCard
          analysis={part.input}
          complete={part.state !== "input-streaming"}
        />
      )
    default:
      return null
  }
}

function Message({
  message,
  live,
  ref,
}: {
  message: BrandixMessage
  live: boolean
  ref?: React.Ref<HTMLDivElement>
}) {
  if (message.role === "user") {
    const text = message.parts
      .map((p) => (p.type === "text" ? p.text : ""))
      .join("")
    return (
      <div ref={ref} className="t-rise flex justify-end">
        <p className="max-w-[85%] rounded-2xl bg-foreground/[0.05] px-4 py-2 text-body text-pretty whitespace-pre-wrap">
          {text}
        </p>
      </div>
    )
  }

  if (!message.parts.some((part) => isVisible(part, live))) return null

  // A reply that took several rounds shows them as one list, where the first
  // one landed.
  const rounds = message.parts.flatMap((part) => finalRound(part) ?? [])
  const anchor = message.parts.findIndex(finalRound)
  const total = (count: (round: Round) => number) =>
    rounds.reduce((sum, round) => sum + count(round), 0)

  return (
    <div className="flex flex-col gap-3">
      {message.parts.map((part, index) =>
        finalRound(part)
          ? index === anchor && (
              <SuggestionList
                key={index}
                round={{
                  checked: total((round) => round.checked),
                  free: total((round) => round.free),
                  names: rounds.flatMap((round) => round.names),
                }}
              />
            )
          : isVisible(part, live) && (
              <AssistantPart key={index} part={part} live={live} />
            )
      )}
    </div>
  )
}

export function Thread({
  messages,
  status,
  error,
  promptRef,
  onRetry,
}: {
  messages: BrandixMessage[]
  status: "submitted" | "streaming" | "ready" | "error"
  error: Error | undefined
  /** Receives the latest user message, where the scroller anchors a reply. */
  promptRef: React.Ref<HTMLDivElement>
  onRetry: () => void
}) {
  const last = messages.at(-1)
  const prompt = messages.findLast((message) => message.role === "user")
  const busy = status === "submitted" || status === "streaming"
  const thinking = busy && (last?.role !== "assistant" || isWaiting(last))
  // Every round of the reply was checked and none of it survived.
  const empty =
    !busy &&
    !error &&
    last?.role === "assistant" &&
    last.parts.some((part) => shownNames(part) === 0) &&
    !last.parts.some((part) => isVisible(part, false))

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:px-6">
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          live={busy && message === last}
          ref={message === prompt ? promptRef : undefined}
        />
      ))}

      {thinking && <ThinkingLine />}

      {empty && (
        <p className="text-note text-pretty text-muted-foreground">
          None of those names had a free domain. Ask for another round.
        </p>
      )}

      {error && (
        <div className="flex items-center gap-3 rounded-lg bg-danger-soft px-4 py-3 text-note text-danger">
          <p className="flex-1 text-pretty">
            {error.message.includes("Rate limit")
              ? "You're going a bit fast. Wait a few seconds and try again."
              : "Something went wrong generating a reply."}
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-danger"
          >
            <ArrowClockwise />
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}
