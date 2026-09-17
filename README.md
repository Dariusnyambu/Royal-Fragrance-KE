# Royal Fragrance KE

A premium Kenyan online perfume boutique. Customers browse original perfumes and
order directly via WhatsApp — there's no online checkout. The admin manages the
entire catalog (products, brands, categories) and site settings from a dashboard.

**Stack:** React + Vite, Tailwind CSS v4, React Router, Supabase (Postgres,
Auth, Storage), Lucide icons.

## 1. Create your Supabase project

1. Go to supabase.com and create a new project.
2. In the SQL Editor, paste and run the contents of `supabase/schema.sql`.
   This creates every table, Row Level Security policy, and the two storage
   buckets (`product-images`, `brand-logos`) the app needs.
3. In **Project Settings -> API**, copy your Project URL and `anon` public key.

## 2. Configure the app

```
cp .env.example .env
```

Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

## 3. Install and run

```
npm install
npm run dev
```

The storefront runs at http://localhost:5173.

## 4. Create your admin account

The admin dashboard uses Supabase Authentication. To create your first admin:

1. In the Supabase dashboard, go to **Authentication -> Users -> Add user**
   (use "Invite" or "Create user" with a password of your choice).
2. A row is automatically created for them in the `profiles` table with
   `role = 'admin'` (via the `handle_new_user` trigger in the schema).
3. Sign in at http://localhost:5173/admin/login with that email/password.

To add more admins later, invite them from Supabase Auth the same way.

## 5. Add your content

From the admin dashboard (`/admin`) add, in this order:
1. **Brands** — the perfume brands you stock.
2. **Categories** — e.g. Men's Perfumes, Women's Perfumes, Unisex, Perfume
   Oils, Gift Sets, New Arrivals.
3. **Products** — each perfume, with images, sizes, notes and pricing. Mark
   products as Featured / Bestseller / New Arrival to have them appear in the
   matching homepage sections.
4. **Settings** — your real WhatsApp number, email, phone, location, social
   links, delivery information, and homepage hero text.

## Project structure

```
src/
  lib/            Supabase client, data-access functions, WhatsApp message builder
  context/        Site settings + admin auth (React context)
  components/     Shared UI (Navbar, Footer, ProductCard, filters, etc.)
  components/admin/  Admin-only UI (image uploader)
  pages/          Public pages (Home, Shop, Product Detail, 404)
  pages/admin/    Admin dashboard pages
supabase/
  schema.sql      Full database schema, RLS policies, storage buckets
```

## How WhatsApp ordering works

`src/lib/whatsapp.js` builds a pre-filled message (product, brand, size,
quantity, price, customer name) and opens `wa.me/<number>?text=<message>` in a
new tab. The WhatsApp number is read from `site_settings` in the database, so
you can change it any time from **Admin -> Settings** without touching code.

## Deploying

The site is a static build — deploy it anywhere that serves static files
(Vercel, Netlify, etc.):

```
npm run build
```

This outputs to `dist/`. Set the same `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` as environment variables on your hosting provider.

## Notes on images

Until you upload real product photography, product cards and detail pages
show a placeholder mark instead of a stock photo — this keeps the storefront
honest about what's a real product versus what still needs a photo. Upload
images per product from **Admin -> Products -> Add/Edit**.

## Security

- The Supabase `anon` key is safe to expose in the frontend — it only grants
  the access defined by Row Level Security policies in `schema.sql`.
- Never put your Supabase **service role** key in this project; it isn't
  needed anywhere in the frontend.
- Public visitors can only read visible (`is_visible = true`) products,
  brands, categories and settings. Only authenticated users with
  `role = 'admin'` in `profiles` can create, edit, or delete anything.
