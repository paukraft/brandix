import { Output, generateText, type ModelMessage } from "ai"
import { z } from "zod"

import { model, trackUsage } from "@/lib/model.server"
import { SHOWN_MAX, cost, type ShownName } from "@/lib/naming"
import type { FreeName } from "@/lib/screen.server"

/** Free domains shown beside the one picked for a name. */
const ALTERNATES_MAX = 3
/** Names free on the wanted TLD from which the editor picks among them alone. */
const WANTED_ENOUGH = SHOWN_MAX * 2

const instructions = `You are the final editor at a naming studio. Many names were drafted for the person you are reading; you get the ones whose domains are free and choose the few worth showing.

PICKING
- Choose the ${SHOWN_MAX} strongest names for what the person asked for, best first. Fewer when fewer are truly good.
- Judge the name before the domain: distinctive, easy to say and spell, the right tone for the brief, no bad connotation. When the person shared their taste, it decides between otherwise equal names.
- Cover different ideas rather than ${SHOWN_MAX} takes on one, unless the person asked for variations of a single name.
- Their latest message says what this round is for; earlier ones give the brief.

DOMAINS
- The names are free on the TLD the person wants most, .com unless they asked for another. When a second list follows, of names free only elsewhere, take a name from it only when the first has no good name left.
- For each pick choose one of its listed domains: the first, unless the person asked for another.
- Prices are per year; a domain listed without one is just as free, its price unknown. A costly domain needs a clearly better name to earn its place.
- A domain marked premium is resold above the standard price: the first number is what registering it costs up front, the second what each year after costs; a single number is both. Never choose one for a name that has a regular domain listed, and pick a name free only on premium domains when it is clearly the best of the pool.

OUTPUT
- name and domain exactly as listed.
- reason: one plain sentence of at most 14 words on why this name fits this brief: what it evokes or how it works. In the person's language. No hype, nothing about domains or availability.`

const nameLine = ({ name, domains }: FreeName) =>
  `${name}: ${domains
    .map((free) => {
      const price = cost(free)
      if (!price) return free.domain
      return `${free.domain} (${free.premium === undefined ? "" : "premium: "}${price})`
    })
    .join(", ")}`

/**
 * The pool as the editor reads it: names free on the wanted TLD first, and
 * the rest only when those are too few to pick from.
 */
function poolPrompt(pool: FreeName[], tld: string) {
  const isWanted = (free: FreeName) =>
    free.domains.some(
      ({ domain, premium }) =>
        premium === undefined && domain.endsWith(`.${tld}`)
    )
  const wanted = pool.filter(isWanted)
  const rest =
    wanted.length < WANTED_ENOUGH ? pool.filter((free) => !isWanted(free)) : []
  const list = (title: string, names: FreeName[]) =>
    names.length ? [`${title}:\n${names.map(nameLine).join("\n")}`] : []

  return [
    ...list(`Names free on .${tld}`, wanted),
    ...list("Names free only elsewhere", rest),
  ].join("\n\n")
}

/**
 * Has an editor choose the names worth showing from the registrable pool,
 * each on the domain that suits the brief and with a line on why it fits.
 * `tld` is the one wanted most; names free on it come before the rest.
 */
export async function pick(
  brief: ModelMessage[],
  pool: FreeName[],
  tld: string,
  abortSignal?: AbortSignal
): Promise<ShownName[]> {
  if (!pool.length) return []

  const { output, usage } = await generateText({
    model,
    instructions,
    messages: [...brief, { role: "user", content: poolPrompt(pool, tld) }],
    output: Output.object({
      schema: z.object({
        picks: z
          .array(
            z.object({
              name: z.string(),
              domain: z.string(),
              reason: z.string(),
            })
          )
          .max(SHOWN_MAX),
      }),
    }),
    reasoning: "low",
    abortSignal,
  })
  trackUsage("name_pick", usage)

  // Only what the screen confirmed is shown, whatever the editor wrote.
  const byName = new Map(pool.map((free) => [free.name, free.domains]))
  return output.picks.flatMap(({ name, domain, reason }) => {
    const domains = byName.get(name)
    const chosen = domains?.find((free) => free.domain === domain)
    if (!domains || !chosen) return []
    // A regular domain, listed first when there is one, beats a premium pick.
    const picked =
      chosen.premium !== undefined && domains[0].premium === undefined
        ? domains[0]
        : chosen
    byName.delete(name)
    return {
      name,
      reason,
      domains: [
        picked,
        ...domains.filter((free) => free !== picked).slice(0, ALTERNATES_MAX),
      ],
    }
  })
}
