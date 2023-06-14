import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

export const rateLimiter = async (req: NextRequest) => {
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.tokenBucket(4, '20 s', 24),
    analytics: true,
  })

  const identifier = getClientIp(req) ?? 'unknown'

  const result = await ratelimit.limit(identifier)

  return result
}

const getClientIp = (request: NextRequest) => {
  let ip = request.ip ?? request.headers.get('x-real-ip')
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (!ip && forwardedFor) {
    ip = forwardedFor.split(',').at(0) ?? null
    return ip
  }
  return ip
}
