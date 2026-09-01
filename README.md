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
SAZITO_REVALIDATE_SECRET=replace-with-at-least-32-random-characters
```

- `SAZITO_STORE_DOMAIN` is the Sazito shop domain without a protocol.
- `STOREFRONT_URL` is the public origin used for canonical links, JSON-LD,
  `robots.txt`, and `sitemap.xml`. It falls back to the HTTPS Sazito shop domain.
- `SAZITO_REVALIDATE_SECRET` protects the cache-invalidation webhook and must be
  a random value containing at least 32 characters.

## Cache invalidation webhook

Configure the Sazito webhook URL as:

```text
https://your-store.example/api/webhooks/sazito?secret=YOUR_RANDOM_SECRET
```

The Client SDK documentation does not define a webhook event payload or a
signature header, so this endpoint intentionally does not inspect or depend on
the request body. Every authorized `POST` immediately expires the store-wide
Next.js cache tag and clears the in-process SDK cache. The next storefront
request fetches fresh data from Sazito.

You can test it locally after setting the same secret in `.env.local`:

```bash
curl -X POST \
  "http://127.0.0.1:3000/api/webhooks/sazito?secret=YOUR_RANDOM_SECRET"
```

The response identifies the invalidated tag:

```json
{
  "ok": true,
  "revalidated": true,
  "tag": "sazito:testmosi.sazito.com"
}
```

Use HTTPS in production and keep the full webhook URL private because it
contains the shared secret.

## Included flows

- Live homepage, categories, search, product detail, CMS, and blog pages
- Guest cart, dynamic product forms, shipping, payment, and checkout return flow
- Customer login, registration, profile, saved addresses, order history, and wallet activity
- Authenticated order ratings and optional product-review submission
- Five-minute server caching with authenticated on-demand invalidation
- Persian metadata, safe product/store JSON-LD, image sitemap, and crawler rules
- Responsive RTL UI using Estedad, Tailwind CSS 4, and shadcn/ui primitives

### Live SDK validation

Run the opt-in, read-only contract suite against `SAZITO_STORE_DOMAIN` with:

```bash
pnpm test:sdk:live
```

This checks the live store identity, recursive header menu, category hierarchy,
product listing, CMS/blog content, entity-route resolution, search response, and
anonymous protection for customer wallet data. It
does not
create carts, invoices, payments, or orders. The regular `pnpm test` command
excludes this suite and does not require network access.

## Verification

```bash
pnpm test
pnpm lint
pnpm build
```

SEO discovery files are served at `/robots.txt` and `/sitemap.xml`.
