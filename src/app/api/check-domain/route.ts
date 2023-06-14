import { rateLimiter } from '@/lib/rateLimiter'
import * as dns from 'dns'
import { NextRequest, NextResponse } from 'next/server'
// @ts-expect-error - no types
import * as whois from 'whois'
import { z } from 'zod'

export const dynamic = 'force-dynamic'

const inputSchema = z.object({
  domain: z.string(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { domain } = inputSchema.parse(body)

  const { success } = await rateLimiter(req)

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 })
  }

  try {
    const data = await checkDomainAvailability(domain)

    return NextResponse.json({
      available: data.available,
      whois: data.whoisResult,
      onlyProbably: data.onlyProbably,
    })
  } catch (error) {
    return NextResponse.json({})
  }
}

type DomainAvailability = {
  available: boolean
  whoisResult: string
  onlyProbably?: boolean
}

async function checkDomainAvailability(
  domain: string
): Promise<DomainAvailability> {
  return new Promise((resolve, reject) => {
    dns.lookup(domain, (err, address) => {
      if (err && err.code === 'ENOTFOUND') {
        // @ts-expect-error - no types
        whois.lookup(domain, (whoisErr, whoisData) => {
          if (whoisErr) {
            reject(whoisErr)
          } else {
            if (whoisData.includes('Lookup quota exceeded')) {
              resolve({
                available: true,
                whoisResult:
                  'We can only handle a limited amount of certain domain checks.',
                onlyProbably: true,
              })
            } else {
              const available =
                whoisData.includes('No match for domain') ||
                whoisData.includes('No Object Found') ||
                whoisData.includes('Status: free')
              resolve({ available, whoisResult: 'Domain is available' })
            }
          }
        })
      } else if (address) {
        resolve({ available: false, whoisResult: 'Domain is already in use' })
      } else {
        reject(err)
      }
    })
  })
}
// function checkDomainAvailability(domain: string): Promise<boolean> {
//   return new Promise((resolve, reject) => {
//     dns.lookup(domain, (error, address) => {
//       if (error) {
//         if (error.code === 'ENOTFOUND') {
//           resolve(true) // Domain is not found, so it's available
//         } else {
//           reject(error)
//         }
//       } else {
//         resolve(false) // Domain is found, so it's not available
//       }
//     })
//   })
// }
