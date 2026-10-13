import { useQueries } from "@tanstack/react-query"

import { domainQuery, type DomainCheck } from "@/lib/domain.functions"
import type { Suggestion } from "@/lib/naming"

export type Availability = DomainCheck | { status: "checking" }

/** Availability for each suggestion, in order. */
export function useAvailability(suggestions: Suggestion[]) {
  return useQueries({
    queries: suggestions.map(({ domain }) => domainQuery(domain)),
    combine: (results) =>
      results.map((result): Availability => {
        if (result.data) return result.data
        if (result.isError) return { status: "unknown" }
        return { status: "checking" }
      }),
  })
}
