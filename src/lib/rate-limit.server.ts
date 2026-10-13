import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { getRequestIP } from "@tanstack/react-start/server"

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null

const limiters = redis && {
  chat: new Ratelimit({
    redis,
    prefix: "brandix:chat",
    limiter: Ratelimit.tokenBucket(4, "20 s", 24),
  }),
  domain: new Ratelimit({
    redis,
    prefix: "brandix:domain",
    limiter: Ratelimit.tokenBucket(10, "10 s", 100),
  }),
}

/** True when the caller may proceed. Without Upstash configured, everyone may. */
export async function allow(bucket: "chat" | "domain") {
  if (!limiters) return true
  const ip = getRequestIP({ xForwardedFor: true }) ?? "unknown"
  const { success } = await limiters[bucket].limit(ip)
  return success
}
