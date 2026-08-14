-- ===================================================
-- KUMAR IMPEX LOADS - SUPABASE DATABASE SCHEMA (FIXED)
-- Paste and run this script in your Supabase SQL Editor
-- Project: https://fuzbzzkmenpxinmjkcsn.supabase.co
-- ===================================================

-- 1. Create Locations Table
CREATE TABLE IF NOT EXISTS public.locations (
    id TEXT PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    rate NUMERIC NOT NULL DEFAULT 600,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure active column exists if table was created previously without it
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE public.locations ADD COLUMN IF NOT EXISTS rate NUMERIC DEFAULT 600;

-- 2. Create Loads Table
CREATE TABLE IF NOT EXISTS public.loads (
    id TEXT PRIMARY KEY,
    location_name TEXT NOT NULL,
    rate NUMERIC NOT NULL,
    quantity NUMERIC NOT NULL,
    total NUMERIC NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    remarks TEXT,
    created_by TEXT DEFAULT 'Admin',
    created_role TEXT DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Ensure missing columns exist
ALTER TABLE public.loads ADD COLUMN IF NOT EXISTS created_role TEXT DEFAULT 'Admin';
ALTER TABLE public.loads ADD COLUMN IF NOT EXISTS remarks TEXT;

-- 3. Enable Row Level Security (RLS) & Public Access Policies
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;

-- Clean existing policies to avoid duplicate policy error
DROP POLICY IF EXISTS "Allow public read access on locations" ON public.locations;
DROP POLICY IF EXISTS "Allow public insert access on locations" ON public.locations;
DROP POLICY IF EXISTS "Allow public update access on locations" ON public.locations;
DROP POLICY IF EXISTS "Allow public delete access on locations" ON public.locations;

DROP POLICY IF EXISTS "Allow public read access on loads" ON public.loads;
DROP POLICY IF EXISTS "Allow public insert access on loads" ON public.loads;
DROP POLICY IF EXISTS "Allow public update access on loads" ON public.loads;
DROP POLICY IF EXISTS "Allow public delete access on loads" ON public.loads;

CREATE POLICY "Allow public read access on locations" ON public.locations FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on locations" ON public.locations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on locations" ON public.locations FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on locations" ON public.locations FOR DELETE USING (true);

CREATE POLICY "Allow public read access on loads" ON public.loads FOR SELECT USING (true);
CREATE POLICY "Allow public insert access on loads" ON public.loads FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update access on loads" ON public.loads FOR UPDATE USING (true);
CREATE POLICY "Allow public delete access on loads" ON public.loads FOR DELETE USING (true);

-- 4. Seed Initial Default Locations
INSERT INTO public.locations (id, name, rate, active) VALUES
  ('loc-1', 'Sidco', 600, true),
  ('loc-2', 'Mangal', 700, true),
  ('loc-3', 'Sidco Beam', 600, true),
  ('loc-4', 'Sidco Beam Extra', 800, true),
  ('loc-5', 'Tholilpettai', 1000, true),
  ('loc-6', 'Waste', 600, true)
ON CONFLICT (name) DO UPDATE SET rate = EXCLUDED.rate, active = EXCLUDED.active;

-- 5. Enable Realtime Replication for Tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.loads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.locations;

ALTER TABLE public.loads REPLICA IDENTITY FULL;
ALTER TABLE public.locations REPLICA IDENTITY FULL;
