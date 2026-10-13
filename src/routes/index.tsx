import { createFileRoute } from "@tanstack/react-router"
import { z } from "zod"

import { Studio } from "@/components/studio/studio"

export const Route = createFileRoute("/")({
  /** `c` is the conversation that is open. */
  validateSearch: z.object({ c: z.string().optional() }),
  component: Studio,
})
