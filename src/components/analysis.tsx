import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { AnalysisCriteriaType } from '@/lib/schemas'
import { RiArrowDownSLine } from '@remixicon/react'
import { ChevronUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from './ui/button'

// ASCII-style progress bar that's fully dynamic and responsive
const AsciiProgressBar = ({ value }: { value: number }) => {
  const normalizedValue = Math.max(0, Math.min(10, value))
  const percent = (normalizedValue / 10) * 100

  // Color based on score
  const getColorClass = (score: number) => {
    if (score >= 8) return 'bg-green-600 dark:bg-green-400'
    if (score >= 6) return 'bg-yellow-600 dark:bg-yellow-400'
    return 'bg-red-600 dark:bg-red-400'
  }

  return (
    <div className="flex items-center font-mono text-xs sm:text-sm w-full">
      <span className="text-muted-foreground mr-1 shrink-0">[</span>
      <div className="relative flex-1 h-3 bg-muted-foreground/20">
        {/* ASCII-style background pattern */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `repeating-linear-gradient(
              90deg,
              transparent,
              transparent 0.5ch,
              currentColor 0.5ch,
              currentColor 1ch
            )`,
            backgroundSize: '1ch 100%',
          }}
        />
        {/* Filled portion */}
        <div
          className={`h-full transition-[width] duration-500 relative ${getColorClass(
            normalizedValue
          )}`}
          style={{ width: `${percent}%` }}
        >
          {/* ASCII-style filled pattern */}
          <div
            className="absolute inset-0 opacity-80"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                transparent,
                transparent 0.2ch,
                rgba(255,255,255,0.3) 0.2ch,
                rgba(255,255,255,0.3) 0.8ch
              )`,
              backgroundSize: '1ch 100%',
            }}
          />
        </div>
      </div>
      <span className="text-muted-foreground ml-1 shrink-0">]</span>
    </div>
  )
}

// Dynamic ASCII-style range indicator
const AsciiRangeIndicator = ({
  minValue,
  maxValue,
}: {
  minValue: number
  maxValue: number
}) => {
  const minPercent = (minValue / 10) * 100
  const maxPercent = (maxValue / 10) * 100

  return (
    <div className="font-mono text-xs text-foreground space-y-2">
      {/* Range visualization */}
      <div className="relative">
        <div className="flex items-center justify-between text-muted-foreground mb-1">
          <span>0.0</span>
          <span>5.0</span>
          <span>10.0</span>
        </div>
        <div className="relative h-2 bg-muted-foreground/20">
          {/* Background scale marks */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: `repeating-linear-gradient(
                90deg,
                currentColor,
                currentColor 1px,
                transparent 1px,
                transparent 10%
              )`,
            }}
          />
          {/* Range indicator */}
          <div
            className="absolute top-0 h-full bg-primary/60"
            style={{
              left: `${minPercent}%`,
              width: `${maxPercent - minPercent}%`,
            }}
          />
          {/* Min marker */}
          <div
            className="absolute top-0 w-0.5 h-full bg-foreground"
            style={{ left: `${minPercent}%` }}
          />
          {/* Max marker */}
          <div
            className="absolute top-0 w-0.5 h-full bg-foreground"
            style={{ left: `${maxPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-foreground font-semibold">
            {minValue.toFixed(1)}
          </span>
          <span className="text-muted-foreground">range</span>
          <span className="text-foreground font-semibold">
            {maxValue.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  )
}

// Framed section that mimics document boxes without fixed-width ASCII
const DoubleFrame = ({
  title,
  children,
  showChevron = false,
}: {
  title?: string
  children: ReactNode
  showChevron?: boolean
}) => {
  return (
    <div className="border border-border">
      <div className="m-1 border border-border">
        {title && (
          <div className="border-b border-border bg-muted/30 px-3 py-2 font-mono text-xs sm:text-sm tracking-wider text-muted-foreground flex justify-between items-center">
            <span>{title}</span>
            {showChevron && (
              <RiArrowDownSLine
                className="text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                size={16}
              />
            )}
          </div>
        )}
        <div className="p-3 sm:p-4">{children}</div>
      </div>
    </div>
  )
}

const formatDate = () => {
  return new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const Analysis = ({ analysis }: { analysis: AnalysisCriteriaType }) => {
  // Handle streaming data - criteria might be undefined or empty during streaming
  const criteria = analysis.criteria || []
  const suggestion = analysis.suggestion || { name: '', domain: '' }
  const conclusion = analysis.conclusion || ''

  // Calculate overall weighted score with safe defaults
  const totalWeight = criteria.reduce(
    (sum, criterion) => sum + (criterion?.weight || 0),
    0
  )
  const weightedScore =
    totalWeight > 0
      ? criteria.reduce(
          (sum, criterion) =>
            sum + (criterion?.score || 0) * (criterion?.weight || 0),
          0
        ) / totalWeight
      : 0

  const overallScore = Math.round(weightedScore * 10) / 10
  const maxScore =
    criteria.length > 0 ? Math.max(...criteria.map((c) => c?.score || 0)) : 0
  const minScore =
    criteria.length > 0 ? Math.min(...criteria.map((c) => c?.score || 0)) : 0

  return (
    <Collapsible
      defaultOpen
      className="w-full max-w-none md:max-w-3xl mx-auto bg-background border border-border overflow-x-hidden group"
    >
      {/* Header */}
      <CollapsibleTrigger className="w-full text-left">
        <DoubleFrame title="DOMAIN ANALYSIS REPORT" showChevron>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 cursor-pointer">
            <div className="min-w-0">
              <h1 className="truncate text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                {suggestion.name || 'Domain Analysis'}
              </h1>
              <p className="text-muted-foreground font-mono text-xs sm:text-sm mt-1 break-all">
                Domain: {suggestion.domain || 'N/A'}
              </p>
            </div>
            <div className="text-left sm:text-right text-xs sm:text-sm text-muted-foreground font-mono">
              <div>Generated: {formatDate()}</div>
              <div>
                Report ID: #
                {Math.random().toString(36).substr(2, 8).toUpperCase()}
              </div>
            </div>
          </div>
        </DoubleFrame>
      </CollapsibleTrigger>

      {/* Document Body */}
      <CollapsibleContent>
        <div className="p-3 sm:p-4 md:p-6 space-y-5 md:space-y-6">
          {/* Executive Summary */}
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 border-b border-border pb-2">
              EXECUTIVE SUMMARY
            </h2>

            <DoubleFrame title="SCORE OVERVIEW">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-28 text-xs text-muted-foreground font-mono">
                    Overall
                  </div>
                  <AsciiProgressBar value={overallScore} />
                  <div className="w-14 text-right font-mono text-xs text-foreground">
                    {overallScore.toFixed(1)}/10
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-mono">
                      Criteria
                    </div>
                    <div className="font-semibold text-foreground">
                      {criteria.length}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-mono">
                      Highest
                    </div>
                    <div className="font-semibold text-foreground">
                      {maxScore.toFixed(1)}/10
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-mono">
                      Lowest
                    </div>
                    <div className="font-semibold text-foreground">
                      {minScore.toFixed(1)}/10
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-mono">
                      Total weight
                    </div>
                    <div className="font-semibold text-foreground">
                      {totalWeight.toFixed(1)}x
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-mono">
                      Average
                    </div>
                    <div className="font-semibold text-foreground">
                      {criteria.length > 0
                        ? (
                            criteria.reduce((s, c) => s + (c?.score || 0), 0) /
                            criteria.length
                          ).toFixed(1)
                        : '0.0'}
                      /10
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground font-mono">
                      Status
                    </div>
                    <div className="font-semibold text-foreground">
                      {overallScore >= 8
                        ? 'EXCELLENT'
                        : overallScore >= 6
                        ? 'GOOD'
                        : 'NEEDS WORK'}
                    </div>
                  </div>
                </div>
              </div>
            </DoubleFrame>
          </section>

          {/* Criteria Analysis */}
          {criteria.length > 0 && (
            <section>
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 border-b border-border pb-2">
                DETAILED CRITERIA ANALYSIS
              </h2>

              {/* Criteria framed list (responsive, no ASCII) */}
              <DoubleFrame title="CRITERIA">
                <div className="space-y-5">
                  {criteria.map((criterion, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <h3 className="font-semibold text-foreground text-sm sm:text-base truncate">
                          {index + 1}. {criterion?.name || 'Unnamed Criterion'}
                        </h3>
                        <div className="flex items-center gap-3 sm:gap-4 font-mono text-xs sm:text-sm">
                          <span className="text-muted-foreground">
                            Weight: {criterion?.weight || 0}x
                          </span>
                          <span
                            className={`font-bold ${
                              (criterion?.score || 0) >= 8
                                ? 'text-green-600 dark:text-green-400'
                                : (criterion?.score || 0) >= 6
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400'
                            }`}
                          >
                            {criterion?.score || 0}/10
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <AsciiProgressBar value={criterion?.score || 0} />
                      </div>
                      {criterion?.analysis && (
                        <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                          {criterion.analysis}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </DoubleFrame>
            </section>
          )}

          {/* Statistical Summary */}
          <section>
            <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 border-b border-border pb-2">
              STATISTICAL SUMMARY
            </h2>

            <DoubleFrame title="PERFORMANCE METRICS">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-mono">
                    Distribution:
                  </div>
                  <div className="font-mono text-xs space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-green-600 dark:text-green-400">
                        █
                      </span>
                      <span className="text-foreground">
                        Excellent (8-10):{' '}
                        {criteria
                          .filter((c) => (c?.score || 0) >= 8)
                          .length.toString()
                          .padStart(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 dark:text-yellow-400">
                        █
                      </span>
                      <span className="text-foreground">
                        Good (6-7):{' '}
                        {criteria
                          .filter(
                            (c) => (c?.score || 0) >= 6 && (c?.score || 0) < 8
                          )
                          .length.toString()
                          .padStart(2)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-red-600 dark:text-red-400">█</span>
                      <span className="text-foreground">
                        Poor (0-5):{' '}
                        {criteria
                          .filter((c) => (c?.score || 0) < 6)
                          .length.toString()
                          .padStart(2)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-mono">
                    Score Range:
                  </div>
                  <AsciiRangeIndicator
                    minValue={minScore}
                    maxValue={maxScore}
                  />
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-mono">
                    Average:
                  </div>
                  <div className="font-semibold text-foreground">
                    {criteria.length > 0
                      ? (
                          criteria.reduce(
                            (sum, c) => sum + (c?.score || 0),
                            0
                          ) / criteria.length
                        ).toFixed(1)
                      : '0.0'}{' '}
                    /10
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground font-mono">
                    Weighted:
                  </div>
                  <div className="font-semibold text-foreground">
                    {overallScore.toFixed(1)}
                  </div>
                </div>
              </div>
            </DoubleFrame>
          </section>

          {/* Conclusion */}
          {conclusion && (
            <section>
              <h2 className="text-base sm:text-lg font-semibold text-foreground mb-3 sm:mb-4 border-b border-border pb-2">
                CONCLUSION & RECOMMENDATIONS
              </h2>

              <DoubleFrame title="FINAL ASSESSMENT">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                    <div className="text-xs text-muted-foreground font-mono">
                      Overall Score:
                    </div>
                    <AsciiProgressBar value={overallScore} />
                    <div className="w-14 text-right font-mono text-xs text-foreground">
                      {overallScore.toFixed(1)}/10
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                    {conclusion}
                  </p>
                </div>
              </DoubleFrame>
            </section>
          )}

          {/* Collapse Button */}
          <div className="flex justify-center pt-4">
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" icon={ChevronUp}>
                collapse analysis
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
