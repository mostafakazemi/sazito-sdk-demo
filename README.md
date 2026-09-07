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
SAZITO_USE_MOCKS=true
NEXT_PUBLIC_SAZITO_USE_MOCKS=true
SAZITO_DEBUG=true
NEXT_PUBLIC_SAZITO_DEBUG=true
```

- `SAZITO_STORE_DOMAIN` is the Sazito shop domain without a protocol.
- `STOREFRONT_URL` is the public origin used for canonical links, JSON-LD,
  `robots.txt`, and `sitemap.xml`. It falls back to the HTTPS Sazito shop domain.
- `SAZITO_REVALIDATE_SECRET` protects the cache-invalidation webhook and must be
  a random value containing at least 32 characters.
- `SAZITO_USE_MOCKS` enables mock responses for server-rendered SDK calls.
- `NEXT_PUBLIC_SAZITO_USE_MOCKS` enables mock responses for browser-side cart
  and commerce SDK calls. Keep both flags set to `true` for a fully mocked
  local storefront.
- `SAZITO_DEBUG` controls server-side SDK logs, and `NEXT_PUBLIC_SAZITO_DEBUG`
  controls browser-side SDK logs. Both default to `true` when omitted.

### Run with mock data

The local environment is already configured for mocks. Start the app with:

```bash
pnpm dev
```

To switch back to the live Sazito API, set both mock flags to `false` in
`.env.local` and restart the dev server:

```dotenv
SAZITO_USE_MOCKS=false
NEXT_PUBLIC_SAZITO_USE_MOCKS=false
```

### Mock fixture layout

In mock mode, any non-empty discount code applies a 10% discount (for example,
`تخفیف`). The percentage is configured in `src/lib/sazito/mocks/discount-policy.json`.
The discount persists during the mock session and recalculates with cart quantities.

Mock payloads live in `src/lib/sazito/mocks/`, with one JSON file per endpoint
family. The resolver in `src/lib/sazito/mock.ts` only adds request-specific
behavior such as pagination, URL entity resolution, and path parameters.

To add a static endpoint, add its JSON response to the fixture directory and
register the endpoint in `staticFixtures` in `mock.ts`. For a parameterized
endpoint, reuse the fixture in the matching path resolver and change only the
request-specific fields there.

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
- Guest cart, post-login cart merging, dynamic product forms, shipping, payment, and server-verified checkout callbacks
- Customer login, password recovery, verified mobile changes, profile, addresses, orders, bookings, and wallet activity
- Authenticated order ratings and optional product reviews with image attachments
- Session-deduplicated storefront visit registration through the Sazito SDK
- SDK feature-aware search and blog navigation visibility with safe fallbacks
- Five-minute server caching with authenticated on-demand invalidation
- Persian metadata, safe product/store JSON-LD, image sitemap, and crawler rules
- Responsive RTL UI using Estedad, Tailwind CSS 4, and shadcn/ui primitives

### Password reset link

The reset landing page accepts the SDK's documented camelCase token field:

```text
/account/reset-password?forgotPasswordToken=TOKEN_FROM_SAZITO
```

### Live SDK validation

Run the opt-in, read-only contract suite against `SAZITO_STORE_DOMAIN` with:

```bash
pnpm test:sdk:live
```

This always checks the live store identity, recursive header menu, category
hierarchy, product listing, CMS/blog content, entity-route resolution, search
response, and anonymous protection for customer data.

To also validate authenticated read-only resources, add a dedicated test
account to the uncommitted `.env.local` file:

```dotenv
SAZITO_LIVE_TEST_EMAIL=customer@example.com
SAZITO_LIVE_TEST_PASSWORD=replace-with-test-account-password
```

Both variables are required together. When they are absent, the authenticated
suite is reported as skipped instead of failing. It performs one login request,
then GET-only checks for the current user, orders, saved addresses, wallet
balance, and wallet transactions. It does not create or modify customer data,
and booking lifecycle tests are excluded while that work is paused.

The live suites do not create carts, invoices, payments, bookings, or orders.
The regular `pnpm test` command excludes them and does not require network
access.

### Intentionally paused

- Further booking development, including availability, creation, and cancellation
- Replacing the temporary catalog attribute filters with SDK-backed values
- Deployment and production-domain configuration

## Verification

```bash
pnpm test
pnpm lint
pnpm build
```

SEO discovery files are served at `/robots.txt` and `/sitemap.xml`.
