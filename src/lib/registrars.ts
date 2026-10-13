/** Registrars a price is known for, each with where a domain is bought there. */
export const REGISTRARS = {
  vercel: {
    name: "Vercel",
    url: (domain: string) => `https://vercel.com/domains/search?q=${domain}`,
  },
  porkbun: {
    name: "Porkbun",
    url: (domain: string) => `https://porkbun.com/checkout/search?q=${domain}`,
  },
  cloudflare: {
    name: "Cloudflare",
    url: (domain: string) => `https://domains.cloudflare.com/?domain=${domain}`,
  },
  inwx: {
    name: "INWX",
    url: (domain: string) =>
      `https://www.inwx.com/en/domain/check?domain=${domain}`,
  },
}

export type Registrar = keyof typeof REGISTRARS

/** What a year of a domain costs at one registrar. */
export type Offer = { registrar: Registrar; price: number }
