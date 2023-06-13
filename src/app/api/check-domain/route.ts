import * as dns from 'dns'
import { NextResponse } from 'next/server'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  domain: z.string(),
})

export async function POST(req: Request) {
  const body = await req.json()
  const { domain } = inputSchema.parse(body)

  const available = await checkDomainAvailability(domain)

  return NextResponse.json({
    available,
  })
}

function checkDomainAvailability(domain: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (error, address) => {
      if (error) {
        if (error.code === 'ENOTFOUND') {
          resolve(true) // Domain is not found, so it's available
        } else {
          reject(error)
        }
      } else {
        resolve(false) // Domain is found, so it's not available
      }
    })
  })
}
