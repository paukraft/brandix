// Runtime: Ensure Node.js runtime on Vercel (not Edge) for net/dns support
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { rateLimiter } from '@/lib/rate-limiter'
import dns from 'node:dns/promises'
import net from 'node:net'
import { domainToASCII } from 'node:url'

// Keep within typical serverless limits
export const maxDuration = 15

const withTimeout = async <T>(
  promise: Promise<T>,
  timeoutMs: number,
  onTimeout?: () => void
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timeout = setTimeout(() => {
      if (onTimeout) onTimeout()
      reject(new Error('timeout'))
    }, timeoutMs)

    promise
      .then((value) => {
        clearTimeout(timeout)
        resolve(value)
      })
      .catch((err) => {
        clearTimeout(timeout)
        reject(err)
      })
  })
}

const normalizeDomain = (input: string): string => {
  const trimmed = input.trim()
  if (!trimmed) return ''

  // Add scheme if missing to leverage URL parsing
  const hasScheme = /^\w+:\/\//i.test(trimmed)
  const urlLike = hasScheme ? trimmed : `http://${trimmed}`
  let hostname = ''
  try {
    hostname = new URL(urlLike).hostname
  } catch {
    hostname = trimmed
  }

  // Strip trailing dot and common www prefix
  if (hostname.endsWith('.')) hostname = hostname.slice(0, -1)
  if (hostname.toLowerCase().startsWith('www.')) hostname = hostname.slice(4)

  const ascii = domainToASCII(hostname)
  return ascii.toLowerCase()
}

const isValidDomain = (domain: string): boolean => {
  // Basic domain validation (IDNA already converted). Avoids PSL complexity.
  if (!domain || domain.length > 253) return false
  const labels = domain.split('.')
  if (labels.length < 2) return false
  for (const label of labels) {
    if (!label || label.length > 63) return false
    // Disallow leading/trailing dash, only alnum + dash
    if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)) return false
  }
  return true
}

const safeResolve = async <T>(
  fn: () => Promise<T>,
  timeoutMs: number
): Promise<T | null> => {
  try {
    return await withTimeout(fn(), timeoutMs)
  } catch {
    return null
  }
}

const probeDns = async (domain: string, timeoutMs: number) => {
  const [a, aaaa, cname, mx, ns, txt, soa] = await Promise.all([
    safeResolve(() => dns.resolve4(domain), timeoutMs),
    safeResolve(() => dns.resolve6(domain), timeoutMs),
    safeResolve(() => dns.resolveCname(domain), timeoutMs),
    safeResolve(() => dns.resolveMx(domain), timeoutMs),
    safeResolve(() => dns.resolveNs(domain), timeoutMs),
    safeResolve(() => dns.resolveTxt(domain), timeoutMs),
    safeResolve(() => dns.resolveSoa(domain), timeoutMs),
  ])

  const counts = {
    aCount: Array.isArray(a) ? a.length : 0,
    aaaaCount: Array.isArray(aaaa) ? aaaa.length : 0,
    cnameCount: Array.isArray(cname) ? cname.length : 0,
    mxCount: Array.isArray(mx) ? mx.length : 0,
    nsCount: Array.isArray(ns) ? ns.length : 0,
    txtCount: Array.isArray(txt) ? txt.length : 0,
    hasSoa: !!soa,
  }

  const hasAnyRecords =
    counts.aCount +
      counts.aaaaCount +
      counts.cnameCount +
      counts.mxCount +
      counts.nsCount +
      counts.txtCount >
      0 || counts.hasSoa
  return { counts, hasAnyRecords }
}

const whoisQuery = async (
  server: string,
  query: string,
  timeoutMs: number
): Promise<string> => {
  return withTimeout(
    new Promise<string>((resolve, reject) => {
      const socket = net.createConnection({ host: server, port: 43 })
      let data = ''

      socket.setEncoding('utf8')
      socket.setTimeout(timeoutMs)

      socket.on('connect', () => {
        // Standard whois protocol: send query + CRLF
        socket.write(query + '\r\n')
      })

      socket.on('data', (chunk) => {
        data += chunk
      })

      socket.on('timeout', () => {
        socket.destroy()
        reject(new Error('whois timeout'))
      })

      socket.on('error', (err) => {
        socket.destroy()
        reject(err)
      })

      socket.on('end', () => {
        resolve(data)
      })

      socket.on('close', () => {
        // In case 'end' didn't fire, still resolve accumulated data
        if (data) resolve(data)
      })
    }),
    timeoutMs
  )
}

const getWhoisServerForTld = async (
  domain: string,
  timeoutMs: number
): Promise<string | null> => {
  const labels = domain.split('.')
  const tld = labels[labels.length - 1]

  // Helpful fallbacks for common TLDs
  const fallback: Record<string, string> = {
    com: 'whois.verisign-grs.com',
    net: 'whois.verisign-grs.com',
    org: 'whois.pir.org',
    io: 'whois.nic.io',
    ai: 'whois.nic.ai',
    co: 'whois.nic.co',
    app: 'whois.nic.google',
    dev: 'whois.nic.google',
    xyz: 'whois.nic.xyz',
    me: 'whois.nic.me',
  }

  try {
    const ianaRaw = await whoisQuery('whois.iana.org', tld, timeoutMs)
    const referMatch = /(?:refer|whois):\s*(\S+)/i.exec(ianaRaw)
    if (referMatch && referMatch[1]) {
      return referMatch[1].trim()
    }
  } catch {
    // ignore, fall back
  }

  return fallback[tld] ?? null
}

const parseWhoisAvailability = (
  raw: string
): 'available' | 'taken' | 'unknown' => {
  const text = raw || ''
  if (!text) return 'unknown'
  // Common availability phrases across registries
  const availablePatterns = [
    /no match for/i,
    /not found/i,
    /no entries found/i,
    /domain (name )?not found/i,
    /status:\s*available/i,
    /status:\s*free/i,
    /the queried object does not exist/i,
  ]
  if (availablePatterns.some((r) => r.test(text))) return 'available'

  const takenIndicators = [
    /domain name:/i,
    /registrar:/i,
    /creation date:/i,
    /updated date:/i,
    /expiry date:/i,
    /name server:/i,
  ]
  if (takenIndicators.some((r) => r.test(text))) return 'taken'

  return 'unknown'
}

const checkDomain = async (domainInput: string) => {
  const domain = normalizeDomain(domainInput)
  if (!isValidDomain(domain)) {
    return {
      ok: false,
      status: 400,
      body: { error: 'Invalid domain', domain: domain || domainInput },
    }
  }

  const dnsTimeoutMs = 2500
  const whoisTimeoutMs = 4000

  const dnsPromise = probeDns(domain, dnsTimeoutMs)
  const whoisPromise = (async () => {
    const server = await getWhoisServerForTld(domain, 2000)
    if (!server)
      return {
        server: null as string | null,
        result: 'unknown' as const,
        raw: '',
      }
    try {
      const raw = await whoisQuery(server, domain, whoisTimeoutMs)
      const result = parseWhoisAvailability(raw)
      return { server, result, raw }
    } catch {
      return { server, result: 'unknown' as const, raw: '' }
    }
  })()

  const [dnsResult, whoisResult] = await Promise.all([dnsPromise, whoisPromise])

  // Decide availability
  let availability: 'available' | 'taken' | 'unknown' = 'unknown'
  let confidence: 'high' | 'medium' | 'low' = 'low'

  if (whoisResult.result === 'available') {
    availability = 'available'
    confidence = 'high'
  } else if (whoisResult.result === 'taken') {
    availability = 'taken'
    confidence = 'high'
  } else if (dnsResult.hasAnyRecords) {
    availability = 'taken'
    confidence = 'medium'
  } else {
    availability = 'unknown'
    confidence = 'low'
  }

  return {
    ok: true,
    status: 200,
    body: {
      domain,
      availability,
      confidence,
      checks: {
        dns: {
          hasRecords: dnsResult.hasAnyRecords,
          ...dnsResult.counts,
        },
        whois: {
          server: whoisResult.server,
          result: whoisResult.result,
          // Truncate WHOIS raw to keep responses compact
          raw: whoisResult.raw ? whoisResult.raw.slice(0, 2000) : '',
        },
      },
    },
  }
}

export async function GET(req: Request) {
  const { success } = await rateLimiter(req, 'domainLookup')
  if (!success) {
    return Response.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { searchParams } = new URL(req.url)
  const domainParam = searchParams.get('domain') || ''
  const result = await checkDomain(domainParam)
  return Response.json(result.body, { status: result.status })
}
