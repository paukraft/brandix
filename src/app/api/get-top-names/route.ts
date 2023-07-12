import { getTopNames } from '@/lib/sharedNames'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const LIMIT = 20

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const cursorParam = searchParams.get('cursor')
  const timespanInDaysParam = searchParams.get('timespanInDays')

  const cursor = z.string().parse(cursorParam)
  const timespanInDays = z.coerce
    .number()
    .min(1)
    .optional()
    .parse(timespanInDaysParam === '' ? undefined : timespanInDaysParam)

  const { names, nextCursor } = await getTopNames({
    limit: LIMIT,
    cursor,
    timespanInDays,
  })

  return NextResponse.json({ names, nextCursor })
}
