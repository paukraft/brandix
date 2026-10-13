import { createFileRoute } from "@tanstack/react-router"
import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  isStepCount,
  safeValidateUIMessages,
  streamText,
  toUIMessageStream,
  type StopCondition,
  type ModelMessage,
} from "ai"
import { z } from "zod"

import { model, trackUsage } from "@/lib/model.server"
import { SHOWN_MIN, tasteSchema } from "@/lib/naming"
import { instructions, tasteMessage } from "@/lib/prompt.server"
import { allow } from "@/lib/rate-limit.server"
import { tools } from "@/lib/tools.server"
import type { BrandixMessage } from "@/lib/chat"

/** A thin round of names gets another go; any other tool call ends the turn. */
const settled: StopCondition<typeof tools> = ({ steps }) =>
  !steps
    .at(-1)
    ?.staticToolResults.some(
      (result) =>
        result.toolName === "suggestNames" &&
        result.output.names.length < SHOWN_MIN
    )

const requestSchema = z.object({
  messages: z.unknown(),
  taste: tasteSchema,
})

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        if (!(await allow("chat"))) {
          return Response.json(
            { error: "Rate limit exceeded" },
            { status: 429 }
          )
        }

        const body = requestSchema.safeParse(
          await request.json().catch(() => null)
        )
        if (!body.success) {
          return Response.json({ error: "Invalid request" }, { status: 400 })
        }

        const messages = await safeValidateUIMessages<BrandixMessage>({
          messages: body.data.messages,
          tools,
        })
        // A client-sent system message would override the instructions.
        if (
          !messages.success ||
          messages.data.some((message) => message.role === "system")
        ) {
          return Response.json({ error: "Invalid request" }, { status: 400 })
        }

        const tasteText = tasteMessage(body.data.taste)
        const history = await convertToModelMessages(messages.data, {
          ignoreIncompleteToolCalls: true,
        })
        const context: ModelMessage[] = tasteText
          ? [{ role: "user", content: tasteText }]
          : []

        const result = streamText({
          model,
          instructions,
          messages: [...context, ...history],
          tools,
          reasoning: "low",
          // One round per step, so a round knows every name drafted before it.
          providerOptions: { openai: { parallelToolCalls: false } },
          stopWhen: [settled, isStepCount(3)],
          abortSignal: request.signal,
          onEnd: ({ usage }) => trackUsage("chat_completion", usage),
        })

        return createUIMessageStreamResponse({
          stream: toUIMessageStream({ stream: result.stream, tools }),
        })
      },
    },
  },
})
