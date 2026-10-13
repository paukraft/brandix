# Brandix

AI brand naming where every name shown can be registered. Describe what you're building; Brandix drafts candidates, checks their domains, shows only the ones that are free (with price where known, premium domains labelled with what they cost up front), and can score any name against your brief.

Built with TanStack Start, shadcn (Base UI), Tailwind v4 and the AI SDK.

## Develop

```bash
bun install
cp .env.example .env   # fill in OPENAI_API_KEY
bun dev
```

## How it works

- `src/routes/api/chat.ts`: streams the conversation. The model presents names only through the `suggestNames` / `displayAnalysis` tools, which the UI renders as lists and score cards.
- `src/lib/screen.server.ts`, `src/lib/pick.server.ts`: `suggestNames` takes up to 100 names across up to 5 directions, checks them in one bulk search (as many registrar-sold TLDs per name as 200 domains allow), then an editor pass picks at most 5 registrable names for the brief, each with its domain and a one-line reason.
- `src/lib/domain.server.ts`: availability and yearly renewal price from the Vercel registrar search API, one request for any number of domains. Premium domains are kept and carry their first-year price as well. TLDs the registrar does not sell (`.de`, `.uk`, `.fr`, ...) fall back to a DNS nameserver lookup: free or taken.
- `src/lib/registrars.server.ts`: what the TLD costs per year at the registrars that publish a price list (Porkbun, Cloudflare, INWX), so the price badge shows the cheapest and opens into all of them. The shortlist rechecks its domains through a server function, cached per domain with TanStack Query.
- `src/hooks/use-taste.ts`: starring a name shortlists it, dismissing a name rules it out. Both, plus the traits to lean into or avoid that you add yourself, make up the taste profile sent with every chat request to steer generation.
- Conversations, shortlist, dismissed names and taste profile live in `localStorage`; nothing is stored server-side.
- Upstash rate limiting and OpenPanel analytics switch on when their env vars are set.

## License

MIT
