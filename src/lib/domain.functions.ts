import { queryOptions } from "@tanstack/react-query"
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"

import { checkDomains, type DomainCheck } from "@/lib/domain.server"
import { SEARCH_MAX } from "@/lib/naming"

export type { DomainCheck }

const lookupDomains = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      domains: z
        .array(z.string().trim().toLowerCase().min(3).max(253))
        .min(1)
        .max(SEARCH_MAX),
    })
  )
  .handler(({ data }) => checkDomains(data.domains))

let batch: { domains: string[]; statuses: Promise<DomainCheck[]> } | null = null

/**
 * Lookups asked for in the same tick share one request to the server, and
 * start another once it holds all a request may.
 */
function lookupDomain(domain: string) {
  if (!batch || batch.domains.length === SEARCH_MAX) {
    const domains: string[] = []
    const open = {
      domains,
      statuses: new Promise<DomainCheck[]>((resolve) =>
        queueMicrotask(() => {
          if (batch === open) batch = null
          resolve(lookupDomains({ data: { domains } }))
        })
      ),
    }
    batch = open
  }
  const index = batch.domains.push(domain) - 1
  return batch.statuses.then((statuses) => statuses[index])
}

export const domainQuery = (domain: string) =>
  queryOptions({
    queryKey: ["domain", domain.toLowerCase()],
    queryFn: (): Promise<DomainCheck> => lookupDomain(domain),
    staleTime: (query) =>
      query.state.data?.status === "unknown" ? 0 : 60 * 60 * 1000,
    retry: false,
  })
