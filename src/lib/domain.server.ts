import { resolveNs } from "node:dns/promises"

import { Vercel } from "@vercel/sdk"

import { isCompleteDomain } from "@/lib/naming"
import { allow } from "@/lib/rate-limit.server"
import type { Offer } from "@/lib/registrars"
import { listedOffers } from "@/lib/registrars.server"

/**
 * The registrar allows 10 requests a minute and frees a slot every 6 seconds,
 * so a refused request waits for one, up to 20 seconds.
 */
const vercel = new Vercel({
  timeoutMs: 10_000,
  retryConfig: {
    strategy: "backoff",
    backoff: {
      initialInterval: 2000,
      maxInterval: 6000,
      exponent: 1,
      maxElapsedTime: 20_000,
    },
  },
})

export type DomainCheck =
  | { status: "available"; offers: Offer[]; premium?: number }
  | { status: "taken" }
  | { status: "unknown" }

const UNKNOWN: DomainCheck = { status: "unknown" }

/** What a lookup found for a domain; `available` is null when it cannot tell. */
type Looked = {
  domain: string
  available: boolean | null
  price?: number
  premium?: number
}

/**
 * A searched domain. A free one has what a year costs at each registrar a
 * price is known for, cheapest first.
 */
type Found = {
  domain: string
  available: boolean | null
  offers: Offer[]
  premium?: number
}

const tldOf = (domain: string) => domain.slice(domain.indexOf(".") + 1)

function statusCode(error: unknown) {
  return error && typeof error === "object" && "statusCode" in error
    ? (error as { statusCode: number }).statusCode
    : null
}

let registrarTlds: Promise<Set<string>> | undefined

/**
 * Tells the TLDs the registrar sells from the ones it does not. Its list is
 * fetched once; when that fails every TLD counts as sold, and the next call
 * fetches again.
 */
export async function soldTlds() {
  registrarTlds ??= vercel.domainsRegistrar
    .getSupportedTlds({})
    .then((tlds) => new Set(tlds))
  try {
    const tlds = await registrarTlds
    return (tld: string) => tlds.has(tld)
  } catch (error) {
    registrarTlds = undefined
    console.error("Registrar TLD list failed", error)
    return () => true
  }
}

function notFound(error: unknown) {
  return (error as NodeJS.ErrnoException).code === "ENOTFOUND"
}

const tldLookups = new Map<string, Promise<boolean>>()

/** Whether the TLD has nameservers. A lookup that fails is not remembered. */
function tldExists(tld: string) {
  let lookup = tldLookups.get(tld)
  if (!lookup) {
    lookup = resolveNs(tld).then(
      () => true,
      (error) => {
        if (notFound(error)) return false
        tldLookups.delete(tld)
        throw error
      }
    )
    tldLookups.set(tld, lookup)
  }
  return lookup
}

/**
 * Availability by DNS, for a TLD the registrar does not sell: no such name on
 * a TLD that exists means free, nameservers mean taken. A registered domain
 * without nameservers reads as free.
 */
async function resolveDomain(domain: string): Promise<Looked> {
  try {
    await resolveNs(domain)
    return { domain, available: false }
  } catch (error) {
    if (!notFound(error)) return { domain, available: null }
    const exists = await tldExists(tldOf(domain)).catch(() => false)
    return { domain, available: exists ? true : null }
  }
}

/**
 * Availability for the domains, in input order. Those on a TLD the registrar
 * sells go to it in one request of up to `SEARCH_MAX`
 * domains, and come back with a yearly price, premium ones also with what
 * they cost up front; one malformed name fails that whole batch. The rest are
 * looked up in DNS. A free domain also gets the other registrars' list price
 * for its TLD, unless it is premium: that costs what its seller asks.
 */
export async function searchDomains(domains: string[]): Promise<Found[]> {
  const sold = await soldTlds()
  const isSold = (domain: string) => sold(tldOf(domain))
  const priced = domains.filter(isSold)

  const [registrar, resolved, listed] = await Promise.all([
    priced.length
      ? vercel.domainsRegistrar.searchDomains({
          requestBody: { domains: priced },
        })
      : { results: [] },
    Promise.all(domains.filter((domain) => !isSold(domain)).map(resolveDomain)),
    listedOffers(),
  ])
  const looked = new Map(
    [
      ...registrar.results.map((result): Looked =>
        result.available
          ? {
              domain: result.domain,
              available: true,
              price: result.renewalPrice / result.years,
              ...(result.premium && { premium: result.price }),
            }
          : result
      ),
      ...resolved,
    ].map((result) => [result.domain, result])
  )
  return domains.flatMap((domain): Found[] => {
    const result = looked.get(domain)
    if (!result) return []
    const { available, price, premium } = result
    const own: Offer[] =
      price === undefined ? [] : [{ registrar: "vercel", price }]
    const offers = !available
      ? []
      : premium === undefined
        ? [...own, ...listed(tldOf(domain))].sort((a, b) => a.price - b.price)
        : own
    return [{ domain, available, offers, premium }]
  })
}

/** Checks the domains in one search, in input order. */
export async function checkDomains(domains: string[]): Promise<DomainCheck[]> {
  const unknown = () => domains.map(() => UNKNOWN)
  if (!(await allow("domain"))) return unknown()

  const valid = domains.filter(isCompleteDomain)
  try {
    const results = await searchDomains(valid)
    const found = new Map(results.map((result) => [result.domain, result]))
    return domains.map((domain) => {
      const result = found.get(domain)
      if (!result || result.available === null) return UNKNOWN
      return result.available
        ? {
            status: "available",
            offers: result.offers,
            premium: result.premium,
          }
        : { status: "taken" }
    })
  } catch (error) {
    if (statusCode(error) !== 429)
      console.error("Domain lookup failed", domains, error)
    return unknown()
  }
}
