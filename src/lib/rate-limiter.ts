import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
const limiters = {
  chat: {
    refillRate: 4,
    interval: '20 s',
    maxTokens: 24,
  },
  domainLookup: {
    refillRate: 10,
    interval: '10 s',
    maxTokens: 100,
  },
} as const

export const rateLimiter = async (req: Request, key: keyof typeof limiters) => {
  const hasUpstash = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  )

  if (hasUpstash) {
    const ratelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.tokenBucket(
        limiters[key].refillRate,
        limiters[key].interval,
        limiters[key].maxTokens
      ),
      analytics: true,
    })

    const identifier = getClientIp(req) ?? 'unknown'

    const result = await ratelimit.limit(identifier)

    return result
  }

  // No Upstash configured: allow all
  const cfg = limiters[key]
  return {
    success: true,
    remaining: cfg.maxTokens,
    limit: cfg.maxTokens,
    reset: Date.now(),
  }
}

const getClientIp = (request: Request) => {
  // Try to get IP from various headers in order of preference
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const xRealIp = request.headers.get('x-real-ip')
  const cfConnectingIp = request.headers.get('cf-connecting-ip')

  if (xForwardedFor) {
    // x-forwarded-for can contain multiple IPs, get the first one
    return xForwardedFor.split(',')[0].trim()
  }

  if (xRealIp) {
    return xRealIp
  }

  if (cfConnectingIp) {
    return cfConnectingIp
  }

  return 'unknown'
}
