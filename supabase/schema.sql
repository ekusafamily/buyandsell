-- ==============================================================================
-- DeKUT Soko - Supabase Database Schema & Row Level Security (RLS)
-- Tailored for Dedan Kimathi University of Technology (DeKUT) Students
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase Auth users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    whatsapp_number TEXT NOT NULL,
    phone_number TEXT,
    campus_hostel TEXT DEFAULT 'Batian Hostel',
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT false,
    student_id TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. LISTINGS TABLE
CREATE TABLE IF NOT EXISTS public.listings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    seller_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    is_negotiable BOOLEAN DEFAULT true,
    category_id TEXT NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    condition TEXT NOT NULL CHECK (condition IN ('Brand New', 'Like New', 'Gently Used', 'Fair')),
    location TEXT NOT NULL,
    images TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'reserved')),
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Buyers require NO login to browse, view, and search products.
-- Only Sellers need an authenticated account to create and manage listings.
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

-- Categories RLS: Everyone (anonymous buyers + sellers) can read categories
CREATE POLICY "Public can view categories" 
ON public.categories FOR SELECT 
USING (true);

-- Profiles RLS: Public can view seller profiles for contact info; sellers can update own profile
CREATE POLICY "Public can view seller profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- Listings RLS:
-- 1. BUYERS: Anyone (including unauthenticated anonymous users) can read active & sold listings
CREATE POLICY "Anyone can browse active listings" 
ON public.listings FOR SELECT 
USING (true);

-- 2. SELLERS: Only logged-in users can post listings where seller_id matches their auth ID
CREATE POLICY "Sellers can create listings" 
ON public.listings FOR INSERT 
WITH CHECK (auth.uid() = seller_id);

-- 3. SELLERS: Only the listing owner can update (edit/mark as sold) their own listings
CREATE POLICY "Sellers can update their own listings" 
ON public.listings FOR UPDATE 
USING (auth.uid() = seller_id);

-- 4. SELLERS: Only the listing owner can delete their own listings
CREATE POLICY "Sellers can delete their own listings" 
ON public.listings FOR DELETE 
USING (auth.uid() = seller_id);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION TRIGGER ON USER SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    whatsapp_number,
    campus_hostel,
    avatar_url
  )
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', 'DeKUT Student'),
    COALESCE(new.raw_user_meta_data->>'whatsapp_number', ''),
    COALESCE(new.raw_user_meta_data->>'campus_hostel', 'Batian Hostel'),
    COALESCE(new.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- SEED DEFAULT CATEGORIES
-- ==============================================================================
INSERT INTO public.categories (id, name, icon, description, color) VALUES
('electronics', 'Electronics', 'Tv', 'Speakers, subwoofers, extension cables, monitors, chargers', 'from-blue-500 to-indigo-600'),
('house-decor', 'House Decor', 'Palette', 'LED lights, wall tapestries, carpets, mirrors, room aesthetic', 'from-pink-500 to-rose-600'),
('bedding-furniture', 'Bedding & Furniture', 'Bed', 'Mattresses, bedsheets, study desks, folding chairs, shoe racks', 'from-amber-500 to-orange-600'),
('kitchen-appliances', 'Kitchen & Cookware', 'Utensils', '6kg Gas cylinders (Meko), kettles, blenders, utensils, frypans', 'from-red-500 to-rose-600'),
('academics-tools', 'Academics & Tech', 'BookOpen', 'FX-991EX calculators, T-squares, lab coats, engineering kits, books', 'from-violet-500 to-purple-600'),
('phones-computing', 'Phones & Laptops', 'Laptop', 'Laptops, smartphones, wireless mouse, power banks, SSDs', 'from-cyan-500 to-blue-600'),
('fashion', 'Fashion & Sneakers', 'Shirt', 'Hoodies, thrift jackets, sneakers, campus streetwear, backpacks', 'from-emerald-500 to-green-600'),
('bikes-transit', 'Bikes & Transit', 'Bike', 'Mountain bikes, commuter cycles for Kimathi to town or Nyaribo', 'from-yellow-500 to-amber-600'),
('services', 'Services & Gigs', 'Wrench', 'Laptop repair, braiding, photo shoot, typing & printing, moving help', 'from-purple-500 to-pink-600')
ON CONFLICT (id) DO NOTHING;

