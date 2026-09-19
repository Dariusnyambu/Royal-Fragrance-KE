-- Royal Fragrance KE — Supabase schema
-- Run this in the Supabase SQL editor (or via the CLI) on a fresh project.
-- Safe to re-run: guarded with IF NOT EXISTS / drop-if-exists where sensible.

create extension if not exists "uuid-ossp";

-- ==========================================================
-- PROFILES (admin users)
-- ==========================================================
create table if not exists profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'admin' check (role in ('admin', 'staff')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user is created.
-- (Admins are created via Supabase Auth, e.g. the dashboard's "Invite user".)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email, 'admin')
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================================
-- BRANDS
-- ==========================================================
create table if not exists brands (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  created_at timestamptz not null default now()
);

-- ==========================================================
-- CATEGORIES
-- ==========================================================
create table if not exists categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  created_at timestamptz not null default now()
);

-- ==========================================================
-- PRODUCTS
-- ==========================================================
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  brand_id uuid references brands (id) on delete set null,
  category_id uuid references categories (id) on delete set null,
  description text,
  price numeric(10, 2) not null default 0,
  sale_price numeric(10, 2),
  sizes text[] default '{}',            -- e.g. {"30ml","50ml","100ml"}
  gender text check (gender in ('men', 'women', 'unisex')) default 'unisex',
  fragrance_family text,
  top_notes text,
  middle_notes text,
  base_notes text,
  stock_status text not null default 'in_stock'
    check (stock_status in ('in_stock', 'low_stock', 'out_of_stock')),
  is_visible boolean not null default true,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_brand on products (brand_id);
create index if not exists idx_products_category on products (category_id);
create index if not exists idx_products_visible on products (is_visible);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
  before update on products
  for each row execute procedure public.set_updated_at();

-- ==========================================================
-- PRODUCT IMAGES
-- ==========================================================
create table if not exists product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products (id) on delete cascade,
  image_url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists idx_product_images_product on product_images (product_id, sort_order);

-- ==========================================================
-- SITE SETTINGS (single row)
-- ==========================================================
create table if not exists site_settings (
  id uuid primary key default uuid_generate_v4(),
  business_name text not null default 'Royal Fragrance KE',
  whatsapp_number text not null default '254708039015',
  email text default 'hello@royalfragrance.co.ke',
  phone text,
  location text default 'Nairobi, Kenya',
  instagram text,
  facebook text,
  tiktok text,
  delivery_information text default 'Delivery Available Across Kenya',
  about_text text default 'Royal Fragrance KE brings you original perfumes from carefully selected fragrance brands, delivered across Kenya.',
  hero_heading text default 'Discover Your Signature Scent.',
  hero_subheading text default 'Original perfumes from carefully selected fragrance brands, delivered across Kenya.',
  banner_enabled boolean not null default false,
  banner_heading text,
  banner_subheading text,
  banner_image_url text,
  banner_button_text text default 'Shop Now',
  banner_button_link text default '/shop',
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_settings_updated_at on site_settings;
create trigger trg_settings_updated_at
  before update on site_settings
  for each row execute procedure public.set_updated_at();

-- Seed a single settings row if none exists yet.
insert into site_settings (business_name)
select 'Royal Fragrance KE'
where not exists (select 1 from site_settings);

-- ==========================================================
-- ROW LEVEL SECURITY
-- ==========================================================
alter table profiles enable row level security;
alter table brands enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table site_settings enable row level security;

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'staff')
  );
$$ language sql stable security definer;

-- --- profiles: admins can see their own profile only ---
drop policy if exists "profiles_select_own" on profiles;
create policy "profiles_select_own" on profiles
  for select using (id = auth.uid());

-- --- brands: public read, admin write ---
drop policy if exists "brands_public_read" on brands;
create policy "brands_public_read" on brands for select using (true);
drop policy if exists "brands_admin_write" on brands;
create policy "brands_admin_write" on brands for all
  using (public.is_admin()) with check (public.is_admin());

-- --- categories: public read, admin write ---
drop policy if exists "categories_public_read" on categories;
create policy "categories_public_read" on categories for select using (true);
drop policy if exists "categories_admin_write" on categories;
create policy "categories_admin_write" on categories for all
  using (public.is_admin()) with check (public.is_admin());

-- --- products: public can read visible products, admin can read/write all ---
drop policy if exists "products_public_read_visible" on products;
create policy "products_public_read_visible" on products
  for select using (is_visible = true or public.is_admin());
drop policy if exists "products_admin_write" on products;
create policy "products_admin_write" on products for all
  using (public.is_admin()) with check (public.is_admin());

-- --- product_images: public read (joined via visible products), admin write ---
drop policy if exists "product_images_public_read" on product_images;
create policy "product_images_public_read" on product_images
  for select using (
    public.is_admin()
    or exists (
      select 1 from products p
      where p.id = product_images.product_id and p.is_visible = true
    )
  );
drop policy if exists "product_images_admin_write" on product_images;
create policy "product_images_admin_write" on product_images for all
  using (public.is_admin()) with check (public.is_admin());

-- --- site_settings: public read, admin write ---
drop policy if exists "settings_public_read" on site_settings;
create policy "settings_public_read" on site_settings for select using (true);
drop policy if exists "settings_admin_write" on site_settings;
create policy "settings_admin_write" on site_settings for update
  using (public.is_admin()) with check (public.is_admin());

-- ==========================================================
-- STORAGE BUCKETS
-- ==========================================================
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('brand-logos', 'brand-logos', true)
on conflict (id) do nothing;

drop policy if exists "product_images_bucket_public_read" on storage.objects;
create policy "product_images_bucket_public_read" on storage.objects
  for select using (bucket_id in ('product-images', 'brand-logos'));

drop policy if exists "product_images_bucket_admin_write" on storage.objects;
create policy "product_images_bucket_admin_write" on storage.objects
  for insert with check (
    bucket_id in ('product-images', 'brand-logos') and public.is_admin()
  );

drop policy if exists "product_images_bucket_admin_update" on storage.objects;
create policy "product_images_bucket_admin_update" on storage.objects
  for update using (
    bucket_id in ('product-images', 'brand-logos') and public.is_admin()
  );

drop policy if exists "product_images_bucket_admin_delete" on storage.objects;
create policy "product_images_bucket_admin_delete" on storage.objects
  for delete using (
    bucket_id in ('product-images', 'brand-logos') and public.is_admin()
  );
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

