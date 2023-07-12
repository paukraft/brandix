import { rateLimiter } from '@/lib/rateLimiter'
import { addName } from '@/lib/sharedNames'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  name: z.string(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name } = inputSchema.parse(body)

  const { success } = await rateLimiter({ req })

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }

  await addName({ name })

  return NextResponse.json({})
}
