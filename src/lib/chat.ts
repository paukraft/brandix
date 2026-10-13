import type { InferUITools, UIMessage } from "ai"

import type { tools } from "@/lib/tools.server"

export type BrandixMessage = UIMessage<never, never, InferUITools<typeof tools>>
