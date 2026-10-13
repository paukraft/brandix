import { OpenPanel } from "@openpanel/sdk"
import { getRequest } from "@tanstack/react-start/server"
import type { ServerRequest } from "nitro/types"

const op =
  process.env.OPENPANEL_CLIENT_ID && process.env.OPENPANEL_CLIENT_SECRET
    ? new OpenPanel({
        clientId: process.env.OPENPANEL_CLIENT_ID,
        clientSecret: process.env.OPENPANEL_CLIENT_SECRET,
      })
    : null

/**
 * Best-effort and never awaited: an OpenPanel outage must not hold up a
 * response. `waitUntil` keeps the send alive after a serverless response ends.
 */
export function track(event: string, properties?: Record<string, unknown>) {
  if (!op) return
  const sent = op.track(event, properties).catch(console.error)
  ;(getRequest() as ServerRequest).waitUntil?.(sent)
}
