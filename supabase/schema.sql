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
