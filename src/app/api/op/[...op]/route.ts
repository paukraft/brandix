import { createNextRouteHandler } from '@openpanel/nextjs/server'

const hasOpenPanel = Boolean(
  process.env.OPENPANEL_CLIENT_ID && process.env.OPENPANEL_CLIENT_SECRET
)

export const POST = hasOpenPanel
  ? createNextRouteHandler({})
  : async () => new Response(null, { status: 404 })
