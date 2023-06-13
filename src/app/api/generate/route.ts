import { openAIStream } from '@/lib/openAiStream'
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

export async function POST(req: Request) {
  const body = await req.json()
  const { messages } = inputSchema.parse(body)

  console.log(messages)

  const { stream } = await openAIStream({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        content:
          'You are brandnameGPT, your job is to generate Brandnames for a company which in the best case arent taken already. Answer with a list from 1 to 5 with new Brandnames. Never return more than 5 new names. Never send the same name twice.',
        role: 'system',
      },
      ...messages,
    ],
  })

  return new Response(stream)
}
