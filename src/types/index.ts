export type ListingCondition = 'Brand New' | 'Like New' | 'Gently Used' | 'Fair';

export type ListingStatus = 'active' | 'sold' | 'reserved';

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  count?: number;
}

export interface CampusLocation {
  id: string;
  name: string;
  type: 'Internal Hostel' | 'External Hostel / Area' | 'Campus Gate / Center' | 'Nyeri Town';
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  whatsapp_number: string;
  phone_number?: string;
  campus_hostel: string;
  avatar_url?: string;
  is_verified?: boolean;
  student_id?: string;
  created_at: string;
}

export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string;
  price: number;
  is_negotiable: boolean;
  category_id: string;
  condition: ListingCondition;
  location: string;
  images: string[];
  status: ListingStatus;
  views_count: number;
  inquiries_count: number;
  created_at: string;
  updated_at?: string;
  
  // Joined seller profile data for UI presentation
  seller_name?: string;
  seller_whatsapp?: string;
  seller_phone?: string;
  seller_avatar?: string;
  seller_verified?: boolean;
  seller_hostel?: string;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  minPrice: number | '';
  maxPrice: number | '';
  condition: string;
  location: string;
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'popular';
}

