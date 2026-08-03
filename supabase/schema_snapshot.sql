-- ============================================================
-- Schema Snapshot — captured from live Supabase database
-- Generated: 2026-08-03
--
-- This file documents the full current database schema as a
-- single declarative snapshot. It is NOT an applied migration —
-- the schema was built incrementally across 57 migrations in
-- supabase/migrations/. This file exists for reference and for
-- pushing to GitHub so the repo captures the current DB state.
-- ============================================================

-- ============ Extensions ============
-- pgcrypto (for gen_random_uuid) — installed by Supabase
-- pg_cron — enabled via migration 20260530015255
-- pg_net — enabled alongside pg_cron
-- supabase_vault — installed by Supabase

-- ============ Tables ============

-- Cities
CREATE TABLE public.cities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Event Categories
CREATE TABLE public.event_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT 'blue',
  created_at timestamptz DEFAULT now()
);

-- Events
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  location_name text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city_id uuid REFERENCES public.cities(id),
  category_id uuid REFERENCES public.event_categories(id),
  event_date timestamptz NOT NULL,
  end_date timestamptz,
  image_url text NOT NULL DEFAULT '',
  organizer_name text NOT NULL DEFAULT '',
  organizer_url text,
  is_sponsored boolean NOT NULL DEFAULT false,
  is_free boolean NOT NULL DEFAULT true,
  price_text text,
  dogs_welcome boolean NOT NULL DEFAULT true,
  max_dogs integer,
  tags text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  external_url text,
  phone_number text,
  website text
);

-- Dog Parks
CREATE TABLE public.dog_parks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text NOT NULL,
  type text NOT NULL DEFAULT 'dog_park',
  address text NOT NULL DEFAULT '',
  lat numeric NOT NULL,
  lng numeric NOT NULL,
  description text NOT NULL DEFAULT '',
  hours text,
  tags text[] NOT NULL DEFAULT '{}',
  is_free boolean NOT NULL DEFAULT true,
  dog_friendly_notes text,
  image_url text NOT NULL DEFAULT '',
  website text,
  phone text,
  created_at timestamptz DEFAULT now()
);

-- Pet Deals
CREATE TABLE public.pet_deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  store text NOT NULL,
  store_logo_color text NOT NULL DEFAULT 'bg-stone-700',
  category text NOT NULL DEFAULT 'General',
  image_url text NOT NULL DEFAULT '',
  link text NOT NULL DEFAULT '#',
  price numeric,
  original_price numeric,
  price_text text NOT NULL DEFAULT '',
  original_price_text text NOT NULL DEFAULT '',
  discount_pct integer,
  discount_label text NOT NULL DEFAULT '',
  badges text[] NOT NULL DEFAULT '{}',
  votes integer NOT NULL DEFAULT 0,
  comment_count integer NOT NULL DEFAULT 0,
  is_featured boolean NOT NULL DEFAULT false,
  is_expired boolean NOT NULL DEFAULT false,
  posted_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  last_verified_at timestamptz DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- City Guides
CREATE TABLE public.city_guides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  slug text NOT NULL,
  state text NOT NULL,
  tagline text NOT NULL,
  intro text NOT NULL,
  hero_image_url text NOT NULL,
  accent_color text NOT NULL DEFAULT 'emerald',
  quick_facts jsonb NOT NULL DEFAULT '{}',
  sections jsonb NOT NULL DEFAULT '[]',
  featured_spots jsonb NOT NULL DEFAULT '[]',
  tags text[] NOT NULL DEFAULT '{}',
  last_updated date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(city),
  UNIQUE(slug)
);

-- Postcard Submissions
CREATE TABLE public.postcard_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  your_name text NOT NULL DEFAULT '',
  your_address text NOT NULL DEFAULT '',
  property_name text NOT NULL DEFAULT '',
  pet_story text,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  ip_hash text
);

-- ============ Indexes ============

CREATE INDEX events_city_id_idx ON public.events(city_id);
CREATE INDEX events_category_id_idx ON public.events(category_id);
CREATE INDEX events_event_date_idx ON public.events(event_date);
CREATE INDEX events_is_sponsored_idx ON public.events(is_sponsored);

CREATE INDEX dog_parks_city_idx ON public.dog_parks(city);
CREATE INDEX dog_parks_type_idx ON public.dog_parks(type);

CREATE INDEX pet_deals_category_idx ON public.pet_deals(category);
CREATE INDEX pet_deals_is_expired_idx ON public.pet_deals(is_expired);
CREATE INDEX pet_deals_posted_at_idx ON public.pet_deals(posted_at DESC);

CREATE INDEX idx_postcard_submissions_submitted_at
  ON public.postcard_submissions(submitted_at DESC);

-- ============ Row Level Security ============

ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dog_parks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pet_deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.city_guides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.postcard_submissions ENABLE ROW LEVEL SECURITY;

-- ============ RLS Policies ============

-- Cities: public read
CREATE POLICY "Anyone can read cities"
  ON public.cities FOR SELECT
  TO anon, authenticated
  USING (true);

-- Event Categories: public read
CREATE POLICY "Anyone can read categories"
  ON public.event_categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Events: public read
CREATE POLICY "Anyone can read events"
  ON public.events FOR SELECT
  TO anon, authenticated
  USING (true);

-- Dog Parks: public read
CREATE POLICY "Anyone can read dog parks"
  ON public.dog_parks FOR SELECT
  TO anon, authenticated
  USING (true);

-- Pet Deals: public read of active (non-expired) deals
CREATE POLICY "Anyone can view active deals"
  ON public.pet_deals FOR SELECT
  TO anon, authenticated
  USING (is_expired = false);

-- City Guides: public read
CREATE POLICY "public_read_city_guides"
  ON public.city_guides FOR SELECT
  TO anon, authenticated
  USING (true);

-- Postcard Submissions: public insert with validation, authenticated read
CREATE POLICY "Anyone can submit a postcard"
  ON public.postcard_submissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(your_name) > 0
    AND char_length(your_address) > 0
    AND char_length(property_name) > 0
  );

CREATE POLICY "Authenticated users can view submissions"
  ON public.postcard_submissions FOR SELECT
  TO authenticated
  USING (true);

-- ============ Grants ============
-- Supabase auto-grants full CRUD to anon and authenticated roles
-- on all tables by default.

-- ============ pg_cron Job ============
-- Weekly deal refresh every Monday at 08:00 UTC
-- Created by migration 20260530015311. The Authorization header
-- contains a project-specific anon key token.

-- ============ Row Counts (at time of snapshot) ============
-- cities:                  5 rows
-- event_categories:        8 rows
-- events:                 41 rows
-- dog_parks:              ~60 rows
-- pet_deals:              ~20 rows
-- city_guides:              5 rows
-- postcard_submissions:    varies
