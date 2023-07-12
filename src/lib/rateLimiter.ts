import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest } from 'next/server'

const limiters = {
  generation: Ratelimit.tokenBucket(4, '20 s', 24),
  vote: Ratelimit.fixedWindow(10, '20 s'),
}

export const rateLimiter = async ({
  req,
  prefix = 'generation',
}: {
  req: NextRequest
  prefix?: keyof typeof limiters
}) => {
  const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: limiters[prefix],
    analytics: true,
  })

  const identifier = `${prefix}-${getClientIp(req) ?? 'unknown'}`

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
