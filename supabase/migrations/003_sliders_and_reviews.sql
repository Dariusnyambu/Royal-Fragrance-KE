-- Royal Fragrance KE — migration 003
-- Adds: homepage sliders (hero + promo) and the customer review system.
-- Safe to run more than once (guarded with IF NOT EXISTS / DROP POLICY IF EXISTS).
-- Run this once in the Supabase SQL editor on your existing project.

-- ==========================================================
-- SLIDES (hero slider + second "promo" slider on the homepage)
-- ==========================================================
create table if not exists slides (
  id uuid primary key default uuid_generate_v4(),
  section text not null check (section in ('hero', 'promo')),
  image_url text not null,
  title text,
  description text,
  cta_text text,
  cta_url text,
  link_type text not null default 'custom' check (link_type in ('none', 'product', 'category', 'custom')),
  product_id uuid references products (id) on delete set null,
  category_id uuid references categories (id) on delete set null,
  is_active boolean not null default true,
  display_order int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_slides_section_order on slides (section, display_order);
create index if not exists idx_slides_active on slides (is_active);

drop trigger if exists trg_slides_updated_at on slides;
create trigger trg_slides_updated_at
  before update on slides
  for each row execute procedure public.set_updated_at();

alter table slides enable row level security;

-- Public can only see active slides that are within their scheduled window (if any).
drop policy if exists "slides_public_read" on slides;
create policy "slides_public_read" on slides
  for select using (
    public.is_admin()
    or (
      is_active = true
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
    )
  );

drop policy if exists "slides_admin_write" on slides;
create policy "slides_admin_write" on slides for all
  using (public.is_admin()) with check (public.is_admin());

-- ==========================================================
-- REVIEWS
-- ==========================================================
create table if not exists reviews (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users (id) on delete set null,
  display_name text not null check (char_length(trim(display_name)) between 1 and 80),
  product_id uuid references products (id) on delete set null,
  rating int not null check (rating between 1 and 5),
  review_text text not null check (char_length(trim(review_text)) between 1 and 2000),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  is_verified_purchase boolean not null default false,
  moderated_by uuid references auth.users (id) on delete set null,
  moderated_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_product on reviews (product_id);
create index if not exists idx_reviews_status on reviews (status);
create index if not exists idx_reviews_created on reviews (created_at desc);

alter table reviews enable row level security;

-- Public can read only approved reviews.
drop policy if exists "reviews_public_read_approved" on reviews;
create policy "reviews_public_read_approved" on reviews
  for select using (status = 'approved' or public.is_admin());

-- Anyone (including anonymous visitors) can submit a review, but it always
-- lands as 'pending' and never pre-verified — both are enforced server-side
-- so a crafted client request can't self-approve or self-verify.
drop policy if exists "reviews_public_insert" on reviews;
create policy "reviews_public_insert" on reviews
  for insert with check (
    status = 'pending'
    and is_verified_purchase = false
    and moderated_by is null
    and moderated_at is null
  );

-- Only admins can moderate (update) or delete reviews.
drop policy if exists "reviews_admin_update" on reviews;
create policy "reviews_admin_update" on reviews for update
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews_admin_delete" on reviews;
create policy "reviews_admin_delete" on reviews for delete
  using (public.is_admin());

-- ==========================================================
-- STORAGE: slider images
-- ==========================================================
insert into storage.buckets (id, name, public)
values ('slider-images', 'slider-images', true)
on conflict (id) do nothing;

drop policy if exists "slider_images_bucket_public_read" on storage.objects;
create policy "slider_images_bucket_public_read" on storage.objects
  for select using (bucket_id = 'slider-images');

drop policy if exists "slider_images_bucket_admin_write" on storage.objects;
create policy "slider_images_bucket_admin_write" on storage.objects
  for insert with check (bucket_id = 'slider-images' and public.is_admin());

drop policy if exists "slider_images_bucket_admin_update" on storage.objects;
create policy "slider_images_bucket_admin_update" on storage.objects
  for update using (bucket_id = 'slider-images' and public.is_admin());

drop policy if exists "slider_images_bucket_admin_delete" on storage.objects;
create policy "slider_images_bucket_admin_delete" on storage.objects
  for delete using (bucket_id = 'slider-images' and public.is_admin());
