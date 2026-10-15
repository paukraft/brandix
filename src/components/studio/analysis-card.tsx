import type { DeepPartial } from "ai"
import { useEffect, useState } from "react"

import { Digits } from "@/components/ui/digits"
import { overallScore, type Analysis } from "@/lib/naming"
import { cn } from "@/lib/utils"

function tone(score: number) {
  if (score >= 8) return { label: "Strong", ink: "text-ok", fill: "bg-ok" }
  if (score >= 6) return { label: "Solid", ink: "text-warn", fill: "bg-warn" }
  return { label: "Weak", ink: "text-danger", fill: "bg-danger" }
}

function formatScore(score: number) {
  return (Math.round(score * 10) / 10).toFixed(1)
}

/** How long one section takes to unfold, in ms. */
const UNFOLD_MS = 320

/**
 * Counts up to `target` one unfold at a time, so sections that arrive in a
 * burst still land in turn and the card grows at an even pace.
 */
function usePaced(target: number) {
  const [shown, setShown] = useState(target)

  useEffect(() => {
    if (shown >= target) return
    const timer = setTimeout(() => setShown(shown + 1), UNFOLD_MS)
    return () => clearTimeout(timer)
  }, [shown, target])

  return shown
}

/**
 * A structured read of one name. Grows while the payload streams, one finished
 * section at a time: a criterion counts once the next one has begun.
 */
export function AnalysisCard({
  analysis,
  complete,
}: {
  analysis: DeepPartial<Analysis> | undefined
  complete: boolean
}) {
  const streamed = analysis?.criteria ?? []
  const finished = (
    complete || analysis?.conclusion !== undefined
      ? streamed
      : streamed.slice(0, -1)
  ).filter(
    (c): c is Analysis["criteria"][number] =>
      !!c?.name && typeof c.score === "number" && typeof c.weight === "number"
  )
  const shown = usePaced(finished.length + (complete ? 1 : 0))
  const criteria = finished.slice(0, shown)
  const concluded = complete && shown > finished.length

  const overall = overallScore(criteria)
  const verdict = tone(overall)
  // Weights are asked to sum to 100, which holds the shares still meanwhile.
  const totalWeight = complete
    ? finished.reduce((sum, c) => sum + c.weight, 0)
    : 100

  return (
    <article
      className="overflow-hidden rounded-lg bg-tile"
      style={{ "--unfold": `${UNFOLD_MS}ms` } as React.CSSProperties}
    >
      <header className="flex items-end justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-caption text-muted-foreground">Analysis</p>
          <h3 className="mt-1 truncate text-title font-medium tracking-[-0.01em]">
            {analysis?.suggestion?.name}
          </h3>
          <p className="mt-0.5 font-mono text-[12px] text-muted-foreground">
            {analysis?.suggestion?.domain}
          </p>
        </div>
        {criteria.length > 0 && (
          <div className="shrink-0 text-right">
            <p className="text-title font-medium tabular-nums">
              <Digits value={formatScore(overall)} />
              <span className="text-heading text-muted-foreground">/10</span>
            </p>
            <p
              className={cn(
                "text-caption",
                concluded ? verdict.ink : "text-muted-foreground"
              )}
            >
              {concluded ? (
                verdict.label
              ) : (
                <span className="t-shimmer">Scoring</span>
              )}
            </p>
          </div>
        )}
      </header>

      <ul className="bg-card/60 dark:bg-transparent">
        {criteria.map((criterion, index) => {
          const { fill } = tone(criterion.score)
          const share = totalWeight
            ? Math.round((criterion.weight / totalWeight) * 100)
            : 0
          return (
            <li key={index} className="t-unfold">
              <div className="px-5 py-4">
                <div className="flex items-baseline gap-3">
                  <p className="min-w-0 flex-1 truncate text-note font-medium">
                    {criterion.name}
                  </p>
                  <span className="text-caption text-muted-foreground tabular-nums">
                    {share}% weight
                  </span>
                  <span className="w-9 text-right text-note tabular-nums">
                    {formatScore(criterion.score)}
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-foreground/[0.07]">
                  <div
                    className={cn("h-full rounded-full", fill)}
                    style={{ width: `${criterion.score * 10}%` }}
                  />
                </div>
                <p className="mt-2 text-note text-pretty text-muted-foreground">
                  {criterion.analysis}
                </p>
              </div>
            </li>
          )
        })}
      </ul>

      {concluded && (
        <footer className="t-unfold">
          <div className="p-5">
            <p className="text-caption text-muted-foreground">Verdict</p>
            <p className="mt-1 text-body text-pretty">{analysis?.conclusion}</p>
          </div>
        </footer>
      )}
    </article>
  )
}
