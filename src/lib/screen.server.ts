import { searchDomains, soldTlds } from "@/lib/domain.server"
import { SEARCH_MAX, domainLabel, type FreeDomain } from "@/lib/naming"

/**
 * A name that can be registered, with its free domains in TLD order, the
 * premium ones last.
 */
export type FreeName = { name: string; domains: FreeDomain[] }

/**
 * Checks the names' domains in one search and keeps the names that can be
 * registered. Every name is checked on as many of the TLDs the registrar
 * sells, in order, as its request holds: a wide round reaches fewer of them
 * than a narrow one. TLDs it does not sell are always checked.
 * `checked` counts the distinct names looked at.
 */
export async function screen(names: string[], tlds: string[]) {
  const labels = new Map<string, string>()
  for (const name of names) {
    const label = domainLabel(name)
    if (label && !labels.has(label)) labels.set(label, name)
  }
  if (!labels.size) return { checked: 0, pool: [] }

  const sold = await soldTlds()
  let room = Math.max(1, Math.floor(SEARCH_MAX / labels.size))
  const reach = tlds.filter((tld) => !sold(tld) || room-- > 0)
  const domainsOf = (label: string) => reach.map((tld) => `${label}.${tld}`)

  const results = await searchDomains([...labels.keys()].flatMap(domainsOf))
  const free = new Map<string, FreeDomain>(
    results.flatMap(({ domain, available, offers, premium }) =>
      available ? [[domain, { domain, offers, premium }]] : []
    )
  )

  const pool: FreeName[] = [...labels]
    .map(([label, name]) => ({
      name,
      domains: domainsOf(label)
        .flatMap((domain) => free.get(domain) ?? [])
        .sort((a, b) => Number(!!a.premium) - Number(!!b.premium)),
    }))
    .filter(({ domains }) => domains.length)

  return { checked: labels.size, pool }
}
