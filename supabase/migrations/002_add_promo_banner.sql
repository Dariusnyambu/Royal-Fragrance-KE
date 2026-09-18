-- Run this once in your Supabase SQL Editor if you already ran the original
-- schema.sql before the promo banner feature was added. Safe to re-run.

alter table site_settings add column if not exists banner_enabled boolean not null default false;
alter table site_settings add column if not exists banner_heading text;
alter table site_settings add column if not exists banner_subheading text;
alter table site_settings add column if not exists banner_image_url text;
alter table site_settings add column if not exists banner_button_text text default 'Shop Now';
alter table site_settings add column if not exists banner_button_link text default '/shop';
