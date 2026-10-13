import { createFileRoute } from "@tanstack/react-router"
import { getRequestIP } from "@tanstack/react-start/server"

const FORWARDED = [
  "content-type",
  "origin",
  "user-agent",
  "openpanel-client-id",
  "openpanel-sdk-name",
  "openpanel-sdk-version",
]

/**
 * Passes the browser's analytics events on to OpenPanel from our own origin,
 * which ad blockers leave alone, and tells it whose IP they came from.
 */
export const Route = createFileRoute("/api/op/track")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const headers = new Headers()
        for (const name of FORWARDED) {
          const value = request.headers.get(name)
          if (value) headers.set(name, value)
        }
        const ip = getRequestIP({ xForwardedFor: true })
        if (ip) headers.set("openpanel-client-ip", ip)

        const response = await fetch("https://api.openpanel.dev/track", {
          method: "POST",
          headers,
          body: await request.text(),
        })
        return new Response(await response.text(), {
          status: response.status,
          headers: {
            "content-type":
              response.headers.get("content-type") ?? "application/json",
          },
        })
      },
    },
  },
})
