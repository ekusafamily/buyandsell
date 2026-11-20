import { useState, useEffect, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { FilterBar } from './components/FilterBar';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { AuthModal } from './components/AuthModal';
import { SellerDashboardModal } from './components/SellerDashboardModal';
import { SavedItemsModal } from './components/SavedItemsModal';
import { SafetyModal } from './components/SafetyModal';
import { ConfigGuideModal } from './components/ConfigGuideModal';
import type { Listing, FilterState } from './types';
import { getActiveListings, updateListingStatus, deleteListing } from './lib/supabase';
import { 
  ShoppingBag, 
  Search 
} from 'lucide-react';

const SAVED_STORAGE_KEY = 'dekut_soko_saved_items_v1';

export function App() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'all',
    minPrice: '',
    maxPrice: '',
    condition: 'all',
    location: 'all',
    sortBy: 'newest',
  });

  // Load listings on mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await getActiveListings();
      setListings(data);
      setLoading(false);
    }
    load();

    // Load saved IDs from localStorage
    try {
      const raw = localStorage.getItem(SAVED_STORAGE_KEY);
      if (raw) setSavedIds(JSON.parse(raw));
    } catch (e) {
      console.warn('Failed to load saved items', e);
    }
  }, []);

  // Save bookmarked IDs to localStorage
  const handleToggleBookmark = (id: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      localStorage.setItem(SAVED_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach((item) => {
      counts[item.category_id] = (counts[item.category_id] || 0) + 1;
    });
    return counts;
  }, [listings]);

  // Filtered & Sorted listings
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Search
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description.toLowerCase().includes(q);
          const matchLoc = item.location.toLowerCase().includes(q);
          const matchSeller = item.seller_name?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchLoc && !matchSeller) return false;
        }

        // Category
        if (filters.category !== 'all' && item.category_id !== filters.category) {
          return false;
        }

        // Condition
        if (filters.condition !== 'all' && item.condition !== filters.condition) {
          return false;
        }

        // Campus Location
        if (filters.location !== 'all') {
          const locLow = item.location.toLowerCase();
          if (filters.location === 'batian' && !locLow.includes('batian')) return false;
          if (filters.location === 'nelion' && !locLow.includes('nelion')) return false;
          if (filters.location === 'lenana' && !locLow.includes('lenana')) return false;
          if (filters.location === 'nyaribo' && !locLow.includes('nyaribo')) return false;
          if (filters.location === 'kimathi-stage' && !locLow.includes('kimathi stage')) return false;
          if (filters.location === 'kahawa' && !locLow.includes('kahawa') && !locLow.includes('coffee')) return false;
          if (filters.location === 'main-gate' && !locLow.includes('main gate') && !locLow.includes('resource center')) return false;
          if (filters.location === 'gate-2' && !locLow.includes('gate 2') && !locLow.includes('kangemi') && !locLow.includes('posta')) return false;
          if (filters.location === 'skuta' && !locLow.includes('skuta')) return false;
          if (filters.location === 'nyeri-cbd' && !locLow.includes('nyeri') && !locLow.includes('cbd') && !locLow.includes('town')) return false;
        }

        // Price Min
        if (filters.minPrice !== '' && item.price < Number(filters.minPrice)) {
          return false;
        }

        // Price Max
        if (filters.maxPrice !== '' && item.price > Number(filters.maxPrice)) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price_asc') return a.price - b.price;
        if (filters.sortBy === 'price_desc') return b.price - a.price;
        if (filters.sortBy === 'popular') return (b.views_count || 0) - (a.views_count || 0);
        // Default newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });
  }, [listings, filters]);

  // Saved Listings list
  const savedListings = useMemo(() => {
    return listings.filter((l) => savedIds.includes(l.id));
  }, [listings, savedIds]);

  // Handlers for seller actions
  const handleListingCreated = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
  };

  const handleUpdateStatus = async (id: string, status: 'active' | 'sold') => {
    await updateListingStatus(id, status);
    setListings((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    if (selectedListing?.id === id) {
      setSelectedListing((prev) => (prev ? { ...prev, status } : null));
    }
  };

  const handleDeleteListing = async (id: string) => {
    await deleteListing(id);
    setListings((prev) => prev.filter((item) => item.id !== id));
    if (selectedListing?.id === id) setSelectedListing(null);
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'all',
      minPrice: '',
      maxPrice: '',
      condition: 'all',
      location: 'all',
      sortBy: 'newest',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        onOpenCreateListing={() => setIsCreateOpen(true)}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSaved={() => setIsSavedOpen(true)}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onOpenSafety={() => setIsSafetyOpen(true)}
        onOpenConfigGuide={() => setIsConfigOpen(true)}
        savedCount={savedIds.length}
        searchQuery={filters.searchQuery}
        onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
      />

      {/* Main Container */}
      <main className="container mx-auto px-4 py-4 flex-1 max-w-7xl">
        {/* Hero Banner with Campus context */}
        {!filters.searchQuery && filters.category === 'all' && (
          <HeroBanner
            onPostClick={() => setIsCreateOpen(true)}
            onExploreClick={() => {
              const el = document.getElementById('explore-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {/* Categories Bar */}
        <div id="explore-section">
          <CategoryFilter
            selectedCategory={filters.category}
            onSelectCategory={(catId) => setFilters((prev) => ({ ...prev, category: catId }))}
            categoryCounts={categoryCounts}
          />
        </div>

        {/* Filter Bar (Price, Location, Condition, Sort) */}
        <FilterBar
          filters={filters}
          onFilterChange={(updates) => setFilters((prev) => ({ ...prev, ...updates }))}
          onResetFilters={handleResetFilters}
          totalResults={filteredListings.length}
        />

        {/* Listings Grid */}
        <div className="my-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-3 animate-pulse">
                  <div className="aspect-4/3 bg-slate-200 rounded-xl mb-3" />
                  <div className="h-4 bg-slate-200 rounded w-2/3 mb-2" />
                  <div className="h-3 bg-slate-200 rounded w-1/2 mb-3" />
                  <div className="h-8 bg-slate-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : filteredListings.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredListings.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  isBookmarked={savedIds.includes(item.id)}
                  onToggleBookmark={handleToggleBookmark}
                  onSelect={(l) => setSelectedListing(l)}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-xl mx-auto my-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No items found
              </h3>
              <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
                No products match your current filters. Try resetting filters or searching for something else.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Sell an Item in this Category
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-8 px-4 mt-12">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 text-xs">
            <div className="space-y-2 md:col-span-2">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <ShoppingBag className="w-4 h-4 text-amber-300" />
                </div>
                <span className="text-base font-extrabold text-white">
                  DeKUT<span className="text-emerald-400">Soko</span>
                </span>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Kimathi Comrades
                </span>
              </div>
              <p className="text-slate-400 text-xs max-w-md leading-relaxed">
                A student marketplace platform for Dedan Kimathi University of Technology (DeKUT), Nyeri. Designed for safe, zero-fee, student-to-student transactions with direct WhatsApp communication.
              </p>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider mb-2 text-xs">
                Quick Campus Locations
              </h5>
              <ul className="space-y-1 text-slate-400 text-xs">
                <li>Batian, Nelion & Lenana Hostels</li>
                <li>Nyaribo Off-Campus Estates</li>
                <li>Kimathi Stage & Boda Shed</li>
                <li>Coffee Farm / Kahawa Road</li>
                <li>Main Gate & Resource Center</li>
              </ul>
            </div>

            <div>
              <h5 className="font-bold text-white uppercase tracking-wider mb-2 text-xs">
                Platform Safety & Stack
              </h5>
              <ul className="space-y-1 text-slate-400 text-xs">
                <li>🟢 Direct WhatsApp Connect</li>
                <li>⚡ Database: Supabase PostgreSQL</li>
                <li>☁️ Storage: Cloudflare R2 S3</li>
                <li>🛡️ 0% Commission for Comrades</li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} DeKUT Soko. Built for Dedan Kimathi University Students.</p>
            <div className="flex items-center space-x-4">
              <button onClick={() => setIsSafetyOpen(true)} className="hover:text-emerald-400 transition-colors">
                Safety Rules
              </button>
              <button onClick={() => setIsConfigOpen(true)} className="hover:text-emerald-400 transition-colors">
                Setup Guide
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ListingDetailModal
        listing={selectedListing}
        isOpen={Boolean(selectedListing)}
        onClose={() => setSelectedListing(null)}
        isBookmarked={selectedListing ? savedIds.includes(selectedListing.id) : false}
        onToggleBookmark={handleToggleBookmark}
      />

      <CreateListingModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onListingCreated={handleListingCreated}
        onRequireAuth={() => setIsAuthOpen(true)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />

      <SellerDashboardModal
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        listings={listings}
        onOpenCreateListing={() => setIsCreateOpen(true)}
        onUpdateStatus={handleUpdateStatus}
        onDeleteListing={handleDeleteListing}
        onSelectListing={(l) => setSelectedListing(l)}
      />

      <SavedItemsModal
        isOpen={isSavedOpen}
        onClose={() => setIsSavedOpen(false)}
        savedListings={savedListings}
        onRemoveSaved={handleToggleBookmark}
        onSelectListing={(l) => setSelectedListing(l)}
      />

      <SafetyModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />

      <ConfigGuideModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
      />
    </div>
  );
}
export default App;
