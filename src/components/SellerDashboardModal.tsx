import React from 'react';
import { 
  X, 
  ShoppingBag, 
  PlusCircle, 
  Trash2, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import type { Listing } from '../types';

interface SellerDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onOpenCreateListing: () => void;
  onUpdateStatus: (listingId: string, status: 'active' | 'sold') => void;
  onDeleteListing: (listingId: string) => void;
  onSelectListing: (listing: Listing) => void;
}

export const SellerDashboardModal: React.FC<SellerDashboardModalProps> = ({
  isOpen,
  onClose,
  listings,
  onOpenCreateListing,
  onUpdateStatus,
  onDeleteListing,
  onSelectListing,
}) => {
  const { user, profile } = useAuth();

  if (!isOpen || !user) return null;

  // Filter listings owned by this seller
  const myListings = listings.filter((l) => l.seller_id === user.id || l.seller_name === profile?.full_name);

  const activeCount = myListings.filter((l) => l.status === 'active').length;
  const soldCount = myListings.filter((l) => l.status === 'sold').length;
  const totalInquiries = myListings.reduce((sum, l) => sum + (l.inquiries_count || 0), 0);
  const totalValue = myListings
    .filter((l) => l.status === 'active')
    .reduce((sum, l) => sum + l.price, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
              <ShoppingBag className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-1.5">
                <span>{profile?.full_name || 'Seller Dashboard'}</span>
                {profile?.is_verified && (
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                )}
              </h3>
              <p className="text-xs text-slate-500">
                📍 {profile?.campus_hostel || 'DeKUT Campus'} • WhatsApp: {profile?.whatsapp_number}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-5">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-3 text-center">
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Active Items</p>
              <p className="text-2xl font-black text-emerald-950 mt-1">{activeCount}</p>
            </div>
            <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-3 text-center">
              <p className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">Sold Items</p>
              <p className="text-2xl font-black text-amber-950 mt-1">{soldCount}</p>
            </div>
            <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-3 text-center">
              <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">WA Inquiries</p>
              <p className="text-2xl font-black text-blue-950 mt-1">{totalInquiries}</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 text-center">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Inventory Value</p>
              <p className="text-lg font-black text-slate-900 mt-1">KES {totalValue.toLocaleString()}</p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900">
              Your Campus Listings ({myListings.length})
            </h4>
            <button
              onClick={() => {
                onClose();
                onOpenCreateListing();
              }}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
              <span>Post New Listing</span>
            </button>
          </div>

          {/* Listings List */}
          {myListings.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No listings posted yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                Have an item you no longer need? Post it here and comrades from Nyaribo, Batian, or Kimathi Stage can reach you.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenCreateListing();
                }}
                className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Post Your First Item
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myListings.map((item) => {
                const isSold = item.status === 'sold';
                const mainImg = item.images && item.images.length > 0 ? item.images[0] : '';

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-3.5 rounded-2xl border transition-all ${
                      isSold
                        ? 'bg-slate-50/80 border-slate-200 opacity-75'
                        : 'bg-white border-slate-200 hover:border-emerald-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0 mb-2 sm:mb-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src={mainImg} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                            {item.title}
                          </h5>
                          {isSold ? (
                            <span className="bg-rose-100 text-rose-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              SOLD
                            </span>
                          ) : (
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                          KES {item.price.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          📍 {item.location} • {item.inquiries_count || 0} inquiries
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => {
                          onClose();
                          onSelectListing(item);
                        }}
                        className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        title="View item as buyer"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      {isSold ? (
                        <button
                          onClick={() => onUpdateStatus(item.id, 'active')}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Mark Active
                        </button>
                      ) : (
                        <button
                          onClick={() => onUpdateStatus(item.id, 'sold')}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Mark as Sold
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete "${item.title}"?`)) {
                            onDeleteListing(item.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete listing"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
