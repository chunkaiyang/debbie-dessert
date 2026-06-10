# Debbie Dessert

Bilingual Next.js website for vegetarian Basque cheesecake ordering, scheduled mandala class bookings, and owner operations.

## Run locally

```bash
npm install
npm run dev
```

The application uses seeded demo data when Supabase environment variables are absent.

## Supabase

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local` and add the project URL and publishable key.
3. Apply `supabase/migrations/20260607000000_initial_schema.sql`.
4. Apply `supabase/seed.sql` for sample catalogue and availability data.
5. Create the owner through Supabase Auth and insert their user ID into `public.staff_roles` with role `owner`.
6. Schedule `select public.expire_cake_holds();` to run every minute using Supabase Cron.

All exposed tables use RLS. Public mutations are limited to the two atomic reservation functions.

The `/admin` dashboard is fail-closed: it does not show order, production, or class details unless Supabase is configured, the visitor is signed in, and `public.is_owner()` returns true. In local development without Supabase env vars, `/admin` redirects to `/admin/login?error=setup`.

Owner operations are backed by live Supabase data:

- `/admin/orders` manages order, payment and fulfilment statuses and exports filtered CSV history.
- `/admin/availability` creates and publishes cake dates, capacity and pickup windows.
- `/admin/flavours` manages bilingual cake details, pricing, display order and Storage-backed images.
- Owner mutations are validated in Server Actions and protected again by RLS/RPC owner checks.

## Cake confirmation, payments and email

Cake ordering currently uses a manual-confirmation flow:

- Public cake availability is read from Supabase through `get_cake_ordering_data`.
- `reserve_cake_order` reserves capacity immediately with `pending_confirmation` and `payment_status = 'unpaid'`.
- Debbie confirms pickup and payment details manually before production.
- Customer and owner notification records are inserted into `notification_outbox`.

Online cake checkout remains provider-neutral. To add Stripe or Square later:

- Creates hosted checkout from the server after `reserve_cake_order`.
- Stores the provider reference in `payments`.
- Verifies webhook signatures in `/api/payments/webhook`.
- Inserts the unique provider event before confirming the order.
- Marks the capacity hold confirmed only after verified payment.

Class bookings require no advance payment. The owner records cash, card, or bank transfer after attendance.

Email delivery should consume `notification_outbox` records with idempotent retries.

## Deployment

Deploy the repository to Vercel and configure the values from `.env.example` in the project settings. The site is configured for `Australia/Brisbane` and AUD.
