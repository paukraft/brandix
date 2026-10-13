import { tool, type ModelMessage } from "ai"
import { z } from "zod"

import { track } from "@/lib/analytics.server"
import {
  DIRECTIONS_MAX,
  NAMES_PER_DIRECTION,
  SHOWN_MAX,
  TLDS,
  analysisSchema,
  domainLabel,
  type Round,
} from "@/lib/naming"
import { pick } from "@/lib/pick.server"
import { screen } from "@/lib/screen.server"

const suggestNamesInput = z.object({
  tlds: z
    .array(z.string().regex(/^[a-z]{2,24}(\.[a-z]{2,24})?$/))
    .min(1)
    .max(TLDS.length)
    .nullable()
    .describe(
      `The TLDs the user asked for or prefers, most wanted first, without a leading dot, e.g. ["com"], ["de", "com"] or ["co.uk"]. null when they named none: the app then checks ${TLDS.join(", ")}, as far down that list as one search reaches.`
    ),
  directions: z
    .array(
      z.object({
        label: z.string().describe('e.g. "Nautical metaphors"'),
        names: z
          .array(
            z
              .string()
              .describe('One word, e.g. "Basecamp", "Snowflake"')
              // The name reads as its domain does: no spaces.
              .transform((name) => name.replace(/\s+/g, ""))
          )
          .min(1)
          .max(NAMES_PER_DIRECTION),
      })
    )
    .min(1)
    .max(DIRECTIONS_MAX),
})

/** The names this turn's earlier rounds drafted, as domain labels. */
function draftedLabels(messages: ModelMessage[]) {
  const turn = messages.slice(
    messages.findLastIndex((message) => message.role === "user") + 1
  )
  const inputs = turn.flatMap((message) =>
    message.role === "assistant" && typeof message.content !== "string"
      ? message.content.flatMap((part) =>
          part.type === "tool-call" && part.toolName === "suggestNames"
            ? suggestNamesInput.safeParse(part.input)
            : []
        )
      : []
  )
  return new Set(
    inputs.flatMap((input) =>
      input.success
        ? input.data.directions.flatMap(({ names }) => names.map(domainLabel))
        : []
    )
  )
}

export const tools = {
  suggestNames: tool({
    description: `Draft names across several directions. The app checks each name's domain and an editor shows the user the best registrable ones, at most ${SHOWN_MAX}; the result lists them. The only way to propose names.`,
    inputSchema: suggestNamesInput,
    /** Reports the count of free names first, then the round once picked. */
    async *execute(
      { tlds, directions },
      { messages, abortSignal }
    ): AsyncGenerator<Round> {
      const drafted = draftedLabels(messages)
      const wanted = tlds ?? TLDS
      const { checked, pool } = await screen(
        directions
          .flatMap(({ names }) => names)
          .filter((name) => !drafted.has(domainLabel(name))),
        wanted
      )
      const round = { checked, free: pool.length }
      if (pool.length) yield { ...round, names: [] }

      const brief = messages.filter((message) => message.role === "user")
      yield { ...round, names: await pick(brief, pool, wanted[0], abortSignal) }
    },
  }),
  displayAnalysis: tool({
    description:
      "Show a structured analysis of one name to the user. Put everything, including the conclusion, in the payload; write no text around it.",
    inputSchema: analysisSchema,
    execute: () => {
      track("analysis_tool_call")
      return "Shown to the user."
    },
  }),
}
