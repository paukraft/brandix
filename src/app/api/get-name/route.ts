import { getName } from '@/lib/sharedNames'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)

  const nameParam = searchParams.get('name')

  const name = z.string().parse(nameParam)

  const nameFromDB = await getName({
    name: name,
  })

  return NextResponse.json({ name: nameFromDB })
}
