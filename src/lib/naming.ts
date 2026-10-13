import { z } from "zod"

import type { Offer } from "@/lib/registrars"

export const suggestionSchema = z.object({
  name: z.string().describe('e.g. "Google", "Stripe", "Linear"'),
  domain: z.string().describe('e.g. "google.com", "stripe.com", "linear.app"'),
})

export type Suggestion = z.infer<typeof suggestionSchema>

/** How wide a round goes: directions explored, and names drafted in each. */
export const DIRECTIONS_MAX = 5
export const NAMES_PER_DIRECTION = 20
/** Names of a round that reach the user. */
export const SHOWN_MAX = 5
/** A round showing fewer names than this is thin; the model goes again. */
export const SHOWN_MIN = 3

/** TLDs every name is checked on unless the user asks for others, best first. */
export const TLDS = ["com", "io", "app", "ai", "co"]

/** Domains the registrar takes per search. */
export const SEARCH_MAX = 200

/**
 * A domain free to register. `offers` is what a year costs at each registrar
 * a price is known for, cheapest first; `premium` marks a domain resold above
 * the standard price and is what registering it costs up front.
 */
export type FreeDomain = { domain: string; offers: Offer[]; premium?: number }

const PRICE = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  trailingZeroDisplay: "stripIfInteger",
})

/** A price charged every year: "$11.25/yr". */
export const yearly = (price: number) => `${PRICE.format(price)}/yr`

/**
 * What a free domain costs where it is cheapest, when known: a premium one up
 * front, then yearly.
 */
export function cost({ offers, premium }: Omit<FreeDomain, "domain">) {
  if (!offers.length) return
  const { price } = offers[0]
  return premium === undefined || premium === price
    ? yearly(price)
    : `${PRICE.format(premium)}, then ${yearly(price)}`
}

/** A picked name: why it fits, and its free domains, the chosen one first. */
export type ShownName = { name: string; reason: string; domains: FreeDomain[] }

/** What a round of naming came to. */
export type Round = { checked: number; free: number; names: ShownName[] }

export const analysisSchema = z.object({
  suggestion: suggestionSchema,
  criteria: z.array(
    z.object({
      name: z.string(),
      analysis: z.string(),
      weight: z.number().describe("Relative weight; all weights sum to ~100"),
      score: z
        .number()
        .min(0)
        .max(10)
        .describe("0–4 weak, 5–7 good, 8–10 excellent"),
    })
  ),
  conclusion: z.string(),
})

export type Analysis = z.infer<typeof analysisSchema>

/** The longest a trait runs. */
export const TRAIT_MAX = 60
/** Traits the user can add, and reacted names a round is steered by. */
export const TRAITS_MAX = 12
export const REACTED_MAX = 40

/** Something the user wants in a name, or wants to stay away from. */
export const traitSchema = z.object({
  text: z
    .string()
    .trim()
    .min(1)
    .max(TRAIT_MAX)
    .describe('e.g. "two syllables"'),
  stance: z.enum(["like", "avoid"]),
})

export type Trait = z.infer<typeof traitSchema>

const reactedNamesSchema = z.array(z.string().max(60)).max(REACTED_MAX)

/** The taste sent along with every chat request to steer generation. */
export const tasteSchema = z.object({
  traits: z.array(traitSchema).max(TRAITS_MAX),
  liked: reactedNamesSchema,
  disliked: reactedNamesSchema,
})

export type Taste = z.infer<typeof tasteSchema>

/** Stable identity for a suggestion across messages, favorites and lookups. */
export function suggestionKey({ name, domain }: Suggestion) {
  return `${domain.toLowerCase()}::${name}`
}

/** The domain label a name registers under: the name itself, nothing added. */
export function domainLabel(name: string) {
  return name
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 63)
}

/** Domainr's page for a domain: who has it, or where to register it. */
export function domainUrl(domain: string) {
  return `https://domainr.com/${domain}`
}

/** Shaped like something a registrar can be asked about. */
export function isCompleteDomain(domain: string | undefined): domain is string {
  return !!domain && /^[a-z0-9-]+(\.[a-z0-9-]+)*\.[a-z]{2,}$/i.test(domain)
}

/** Weighted 0–10 score; 0 when there is nothing to weigh. */
export function overallScore(criteria: Analysis["criteria"]) {
  const total = criteria.reduce((sum, c) => sum + c.weight, 0)
  if (!total) return 0
  return criteria.reduce((sum, c) => sum + c.score * c.weight, 0) / total
}
