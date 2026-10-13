import { z } from "zod"

import type { Offer, Registrar } from "@/lib/registrars"

/** How long a price list is kept before it is fetched again. */
const LIST_TTL = 12 * 60 * 60 * 1000
/** Porkbun takes its time: up to 20s for its list. */
const LIST_TIMEOUT = 30_000
/** How long a search waits for a list that has never arrived. */
const LIST_WAIT = 2000

async function getJson(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(LIST_TIMEOUT),
  })
  if (!response.ok) throw new Error(`${url} answered ${response.status}`)
  return response.json()
}

/** Porkbun writes prices as text, thousands separated: "2,060.25". */
const porkbunList = z.object({
  pricing: z.record(
    z.string(),
    z.object({
      renewal: z
        .string()
        .transform((price) => Number(price.replaceAll(",", "")))
        .pipe(z.number()),
    })
  ),
})
const cloudflareList = z.record(z.string(), z.object({ renewal: z.number() }))
/** INWX renews some TLDs for more than a year at once, one not in dollars. */
const inwxList = z.object({
  tlds: z.array(
    z.object({
      tld: z.string(),
      currency: z.string(),
      renewalPrice: z.number(),
      renewalPeriod: z.number(),
    })
  ),
})

/**
 * Registrars that charge one price per TLD and publish the list: yearly
 * renewal by TLD. Cloudflare publishes none, so its prices come from a
 * community-kept copy; INWX's are the ones its own price page loads.
 */
const lists = {
  porkbun: async () =>
    porkbunList.parse(
      await getJson("https://api.porkbun.com/api/json/v3/pricing/get")
    ).pricing,
  cloudflare: async () =>
    cloudflareList.parse(
      await getJson("https://cfdomainpricing.com/prices.json")
    ),
  inwx: async () =>
    Object.fromEntries(
      inwxList
        .parse(await getJson("https://www.inwx.com/api/v1/domain/all-prices"))
        .tlds.filter(({ currency }) => currency === "USD")
        .map(({ tld, renewalPrice, renewalPeriod }) => [
          tld,
          { renewal: renewalPrice / renewalPeriod },
        ])
    ),
} satisfies Partial<
  Record<Registrar, () => Promise<Record<string, { renewal: number }>>>
>

type Listed = keyof typeof lists
type Prices = Awaited<ReturnType<(typeof lists)[Listed]>>

const registrars = Object.keys(lists) as Listed[]
const kept = new Map<
  Listed,
  { prices?: Prices; at: number; loading?: Promise<void> }
>(registrars.map((registrar) => [registrar, { at: 0 }]))

/**
 * A registrar's list as last fetched. A stale or missing one is fetched in
 * the background, the old prices standing until the new arrive; a failed
 * fetch is tried again on the next call.
 */
function listOf(registrar: Listed) {
  const list = kept.get(registrar)!
  if (!list.loading && Date.now() - list.at >= LIST_TTL)
    list.loading = lists[registrar]()
      .then(
        (prices) => {
          list.prices = prices
          list.at = Date.now()
        },
        (error) =>
          console.error("Registrar price list failed", registrar, error)
      )
      .finally(() => {
        list.loading = undefined
      })
  return list
}

/**
 * Tells what a regular domain on a TLD costs at each registrar with a price
 * list. A list that has not arrived is waited on only briefly; its registrar
 * is left out until it has.
 */
export async function listedOffers() {
  const found = registrars.map(listOf)
  await Promise.race([
    Promise.all(found.map((list) => (list.prices ? undefined : list.loading))),
    new Promise((resolve) => setTimeout(resolve, LIST_WAIT)),
  ])
  return (tld: string) =>
    registrars.flatMap((registrar, index): Offer[] => {
      const listed = found[index].prices?.[tld]
      return listed ? [{ registrar, price: listed.renewal }] : []
    })
}

// Fetched as the server starts, so the lists are there for the first search.
registrars.forEach(listOf)
