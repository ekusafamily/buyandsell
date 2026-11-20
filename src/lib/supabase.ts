import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Listing, UserProfile } from '../types';
import { INITIAL_LISTINGS } from './mockData';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Graceful client fallback
export const supabase: SupabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createClient('https://mock-supabase.supabase.co', 'mock-anon-key') as unknown as SupabaseClient);

// Storage helper in local storage for demo fallback when Supabase is not yet linked
const LOCAL_STORAGE_KEY = 'dekut_soko_listings_v1';

export function getLocalListings(): Listing[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_LISTINGS));
      return INITIAL_LISTINGS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse local listings', e);
    return INITIAL_LISTINGS;
  }
}

export function saveLocalListings(listings: Listing[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(listings));
  } catch (e) {
    console.error('Failed to save to localStorage', e);
  }
}

// Fetch active listings with joined seller profile
export async function getActiveListings(): Promise<Listing[]> {
  if (!isSupabaseConfigured) {
    return getLocalListings().filter((item) => item.status !== 'sold' || true);
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .select(`
        *,
        seller:seller_id (
          full_name,
          whatsapp_number,
          phone_number,
          campus_hostel,
          avatar_url,
          is_verified
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error, falling back to local data:', error.message);
      return getLocalListings();
    }

    if (!data || data.length === 0) {
      return getLocalListings();
    }

    // Map nested seller relation
    return data.map((item) => {
      const seller = item.seller as {
        full_name?: string;
        whatsapp_number?: string;
        phone_number?: string;
        campus_hostel?: string;
        avatar_url?: string;
        is_verified?: boolean;
      } | null;

      return {
        ...item,
        seller_name: seller?.full_name || 'DeKUT Student',
        seller_whatsapp: seller?.whatsapp_number || '254700000000',
        seller_phone: seller?.phone_number || seller?.whatsapp_number,
        seller_hostel: seller?.campus_hostel || item.location,
        seller_avatar: seller?.avatar_url,
        seller_verified: seller?.is_verified ?? false,
      };
    });
  } catch (err) {
    console.error('Error fetching listings:', err);
    return getLocalListings();
  }
}

// Create a new listing
export async function createListing(listingData: Omit<Listing, 'id' | 'created_at' | 'views_count' | 'inquiries_count'>): Promise<Listing> {
  const newListing: Listing = {
    ...listingData,
    id: 'dekut-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    views_count: 1,
    inquiries_count: 0,
    created_at: new Date().toISOString(),
  };

  if (!isSupabaseConfigured) {
    const current = getLocalListings();
    const updated = [newListing, ...current];
    saveLocalListings(updated);
    return newListing;
  }

  try {
    const { data, error } = await supabase
      .from('listings')
      .insert({
        seller_id: listingData.seller_id,
        title: listingData.title,
        description: listingData.description,
        price: listingData.price,
        is_negotiable: listingData.is_negotiable,
        category_id: listingData.category_id,
        condition: listingData.condition,
        location: listingData.location,
        images: listingData.images,
        status: 'active',
      })
      .select()
      .single();

    if (error) throw error;
    return { ...newListing, ...data };
  } catch (err) {
    console.warn('Supabase insert failed, saving locally:', err);
    const current = getLocalListings();
    saveLocalListings([newListing, ...current]);
    return newListing;
  }
}

// Update listing status (e.g. mark as sold or active)
export async function updateListingStatus(listingId: string, status: 'active' | 'sold' | 'reserved'): Promise<void> {
  if (!isSupabaseConfigured) {
    const current = getLocalListings();
    const updated = current.map((item) => (item.id === listingId ? { ...item, status } : item));
    saveLocalListings(updated);
    return;
  }

  try {
    await supabase.from('listings').update({ status }).eq('id', listingId);
  } catch (err) {
    console.error('Failed to update status in Supabase:', err);
  }
}

// Delete listing
export async function deleteListing(listingId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const current = getLocalListings();
    const updated = current.filter((item) => item.id !== listingId);
    saveLocalListings(updated);
    return;
  }

  try {
    await supabase.from('listings').delete().eq('id', listingId);
  } catch (err) {
    console.error('Failed to delete listing in Supabase:', err);
  }
}

// Increment inquiry count when buyer clicks WhatsApp
export async function recordWhatsAppInquiry(listingId: string): Promise<void> {
  if (!isSupabaseConfigured) {
    const current = getLocalListings();
    const updated = current.map((item) =>
      item.id === listingId ? { ...item, inquiries_count: (item.inquiries_count || 0) + 1 } : item
    );
    saveLocalListings(updated);
    return;
  }

  try {
    await supabase.rpc('increment_inquiries', { listing_id: listingId });
  } catch (e) {
    // Non-blocking
  }
}

// Fetch user profile
export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}
