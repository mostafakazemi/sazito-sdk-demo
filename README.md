# Sazito SDK Storefront

A Persian, RTL storefront built with Next.js 16 and the Sazito Client SDK for
`testmosi.sazito.com`.

## Local development

Copy the environment example, then install and start the app:

```bash
cp .env.example .env.local
pnpm install
pnpm dev
```

The storefront is available at [http://localhost:3000](http://localhost:3000).
To test from another device on the same network, start Next.js with a network
host, for example `pnpm dev --hostname 0.0.0.0`.

## Environment

```dotenv
SAZITO_STORE_DOMAIN=testmosi.sazito.com
STOREFRONT_URL=https://testmosi.sazito.com
```

- `SAZITO_STORE_DOMAIN` is the Sazito shop domain without a protocol.
- `STOREFRONT_URL` is the public origin used for canonical links, JSON-LD,
  `robots.txt`, and `sitemap.xml`. It falls back to the HTTPS Sazito shop domain.

## Included flows

- Live homepage, categories, search, and product detail pages
- Guest cart, dynamic product forms, shipping, payment, and checkout return flow
- Five-minute server data caching with overlapping Sazito SDK caches disabled
- Persian metadata, safe product/store JSON-LD, image sitemap, and crawler rules
- Responsive RTL UI using Estedad, Tailwind CSS 4, and shadcn/ui primitives

## Verification

```bash
pnpm test
pnpm lint
pnpm build
```

SEO discovery files are served at `/robots.txt` and `/sitemap.xml`.
