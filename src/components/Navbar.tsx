import React, { useState } from 'react';
import { 
  ShoppingBag, 
  Search, 
  PlusCircle, 
  Bookmark, 
  User, 
  LogOut, 
  ShieldCheck, 
  Settings, 
  Menu, 
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  onOpenCreateListing: () => void;
  onOpenAuth: () => void;
  onOpenSaved: () => void;
  onOpenDashboard: () => void;
  onOpenSafety: () => void;
  onOpenConfigGuide: () => void;
  savedCount: number;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateListing,
  onOpenAuth,
  onOpenSaved,
  onOpenDashboard,
  onOpenSafety,
  onOpenConfigGuide,
  savedCount,
  searchQuery,
  onSearchChange,
}) => {
  const { user, profile, signOut } = useAuth();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      {/* Top Campus Announcement Bar */}
      <div className="bg-emerald-900 text-emerald-100 text-xs px-4 py-1.5 font-medium flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-800 text-amber-300 border border-emerald-700">
              DeKUT Campus
            </span>
            <span className="hidden sm:inline">Dedan Kimathi University of Technology Student Marketplace</span>
            <span className="sm:hidden">DeKUT Student Market</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onOpenSafety}
              className="hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Campus Safety Tips</span>
            </button>
            <button
              onClick={onOpenConfigGuide}
              className="text-amber-300 hover:text-white flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Settings className="w-3 h-3" />
              <span className="hidden md:inline">Supabase & R2 Setup</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div className="flex items-center space-x-3">
            <a href="#" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-700 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
                <ShoppingBag className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">
                    DeKUT<span className="text-emerald-600">Soko</span>
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full border border-amber-300">
                    Kimathi
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 hidden sm:block">
                  Buy, Sell & Connect on WhatsApp
                </p>
              </div>
            </a>
          </div>

          {/* Search Bar - Center */}
          <div className="flex-1 max-w-lg hidden md:block">
            <div className="relative">
              <input
                type="text"
                placeholder="Search electronics, decor, mekos, desks, calculators..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-full text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Bookmarked / Saved Items for Buyer */}
            <button
              onClick={onOpenSaved}
              className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              title="Saved items"
            >
              <Bookmark className="w-5 h-5" />
              {savedCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white">
                  {savedCount}
                </span>
              )}
            </button>

            {/* Post Item (Seller Action) */}
            <button
              onClick={onOpenCreateListing}
              className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3.5 py-2 rounded-xl text-sm font-semibold shadow-sm shadow-emerald-600/30 hover:shadow-md transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">Sell Item</span>
              <span className="sm:hidden">Sell</span>
            </button>

            {/* Seller Account / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-slate-200"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs overflow-hidden border border-emerald-300">
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span>{profile?.full_name?.charAt(0) || 'S'}</span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-slate-700 hidden lg:inline max-w-[90px] truncate">
                    {profile?.full_name?.split(' ')[0] || 'Seller'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{profile?.full_name || 'Seller'}</p>
                      <p className="text-[11px] text-slate-500 truncate">{profile?.email}</p>
                      <span className="inline-block mt-1 text-[10px] bg-emerald-50 text-emerald-700 font-medium px-2 py-0.5 rounded border border-emerald-200">
                        📍 {profile?.campus_hostel || 'DeKUT Campus'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenDashboard();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4 text-emerald-600" />
                      <span>My Seller Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenCreateListing();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <PlusCircle className="w-4 h-4 text-emerald-600" />
                      <span>Post New Listing</span>
                    </button>

                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        onOpenSafety();
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center space-x-2 cursor-pointer"
                    >
                      <ShieldCheck className="w-4 h-4 text-slate-500" />
                      <span>Campus Safety Rules</span>
                    </button>

                    <div className="border-t border-slate-100 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          signOut();
                        }}
                        className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center space-x-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center space-x-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:text-emerald-700 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
                <span>Seller Login</span>
              </button>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 md:hidden text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder="Search items across DeKUT..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs bg-slate-200 rounded-full w-4 h-4 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
