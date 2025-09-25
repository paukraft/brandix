## Brandix

AI-powered brand naming assistant built with Next.js App Router, React, Tailwind, and shadcn UI.

### Features
- Generate 1–5 name + domain options
- Lightweight domain availability check (DNS + WHOIS heuristics)
- Optional analytics ingestion via OpenPanel (disabled by default)

### Quick start
```bash
bun install
# Create .env in the project root with at least:
# OPENAI_API_KEY=your_key
bun dev
```
Open the app at [http://localhost:3000](http://localhost:3000).

### Environment variables
- OPENAI_API_KEY (required): OpenAI API key used by the chat route.
- NEXT_PUBLIC_OPENPANEL_CLIENT_ID (optional): Enables the client analytics sender when set.
- OPENPANEL_CLIENT_ID, OPENPANEL_CLIENT_SECRET (optional): Enable the server ingest endpoint at /api/op.
- UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN (optional): Enable server-side rate limiting.

Behavior without optional envs:
- Analytics: If OpenPanel envs are missing, the client sender is not rendered and `/api/op` returns 404 (no events are sent).
- Rate limiting: If Upstash envs are missing, requests are allowed (no rate limiting).

### Deploy on Vercel
- Connect the repo and set the env vars you want to use.
- No database required.

### License
MIT
