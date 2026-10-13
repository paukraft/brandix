import { openai } from "@ai-sdk/openai"
import type { LanguageModelUsage } from "ai"

import { track } from "@/lib/analytics.server"

const MODEL = "gpt-6-luna"

// USD per million tokens.
const PRICING = { input: 0.1, cachedInput: 0.01, output: 0.5 }

export const model = openai(MODEL)

function costOf(usage: LanguageModelUsage) {
  const cached = usage.inputTokenDetails.cacheReadTokens ?? 0
  const uncached = (usage.inputTokens ?? 0) - cached
  const output = usage.outputTokens ?? 0
  return (
    (uncached * PRICING.input +
      cached * PRICING.cachedInput +
      output * PRICING.output) /
    1_000_000
  )
}

/** Records what a model call consumed and cost under the given event. */
export function trackUsage(event: string, usage: LanguageModelUsage) {
  track(event, {
    model: MODEL,
    inputTokens: usage.inputTokens,
    outputTokens: usage.outputTokens,
    costUsd: costOf(usage),
  })
}
