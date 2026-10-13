import tailwindcss from "@tailwindcss/vite"
import { tanstackStart } from "@tanstack/react-start/plugin/vite"
import viteReact from "@vitejs/plugin-react"
import { nitro } from "nitro/vite"
import { defineConfig } from "vite"

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [
    tailwindcss(),
    tanstackStart(),
    nitro({
      // Old Next.js route.
      routeRules: { "/generate": { redirect: { to: "/", status: 301 } } },
      // A chat runs up to three rounds of drafting and domain checks.
      vercel: { functions: { maxDuration: 120 } },
    }),
    viteReact(),
  ],
})
