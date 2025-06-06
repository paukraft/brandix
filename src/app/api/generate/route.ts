import { openAIStream } from '@/lib/openAiStream'
import { rateLimiter } from '@/lib/rateLimiter'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  messages: z.array(
    z.object({
      content: z.string(),
      role: z.enum(['user', 'assistant']),
    })
  ),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { messages } = inputSchema.parse(body)

  const { success } = await rateLimiter(req)

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }

  const { stream } = await openAIStream({
    model: 'gpt-4.1-mini',
    messages: [
      {
        content:
          'You are brandnameGPT, your job is to generate Brandnames for a company which in the best case arent taken already. Answer with a list from 1 to 5 with new Brandnames. Never return more than 5 new names. Never send the same name twice. Only generate Brandnames, no description or tagline. Never return descriptions or taglines!',
        role: 'system',
      },
      ...messages,
    ],
  })

  return new Response(stream)
}
