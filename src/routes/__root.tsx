import { OpenPanel } from "@openpanel/web"
import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router"
import { useEffect } from "react"

import { useThemeHotkey } from "@/hooks/use-theme-hotkey"
import { themeScript } from "@/lib/theme"
import appCss from "../styles.css?url"

const SITE_URL = "https://brandix.ai"
const OG_IMAGE = `${SITE_URL}/og.png`
const TITLE = "Brandix: AI brand naming with live domain checks"
const DESCRIPTION =
  "Describe what you're building and get distinctive, pronounceable brand names, each with its domain checked as it arrives."

const OG_IMAGE_ALT =
  "Brandix: brand names you can actually register, each listed with its available domain and yearly price."

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { name: "theme-color", content: "#1a1917" },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Brandix" },
      { property: "og:url", content: SITE_URL },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: OG_IMAGE_ALT },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: OG_IMAGE },
      { name: "twitter:image:alt", content: OG_IMAGE_ALT },
      { name: "twitter:creator", content: "@paukraft" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", sizes: "32x32" },
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },
      { rel: "canonical", href: SITE_URL },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Brandix",
          url: SITE_URL,
          description: DESCRIPTION,
          image: OG_IMAGE,
          applicationCategory: "BusinessApplication",
          operatingSystem: "Any",
          offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        }),
      },
    ],
  }),
  notFoundComponent: () => (
    <main className="grid min-h-svh place-items-center text-note text-muted-foreground">
      Page not found.
    </main>
  ),
  shellComponent: RootDocument,
})

function useAnalytics() {
  useEffect(() => {
    const clientId = import.meta.env.VITE_OPENPANEL_CLIENT_ID
    if (!clientId) return
    new OpenPanel({
      clientId,
      apiUrl: "/api/op",
      trackScreenViews: true,
      trackOutgoingLinks: true,
    })
  }, [])
}

function RootDocument({ children }: { children: React.ReactNode }) {
  useAnalytics()
  useThemeHotkey()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
