import React from 'react';
import { X, Bookmark, MessageCircle, Trash2 } from 'lucide-react';
import type { Listing } from '../types';
import { generateWhatsAppLink } from '../lib/whatsapp';
import { recordWhatsAppInquiry } from '../lib/supabase';

interface SavedItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedListings: Listing[];
  onRemoveSaved: (listingId: string) => void;
  onSelectListing: (listing: Listing) => void;
}

export const SavedItemsModal: React.FC<SavedItemsModalProps> = ({
  isOpen,
  onClose,
  savedListings,
  onRemoveSaved,
  onSelectListing,
}) => {
  if (!isOpen) return null;

  const handleWhatsApp = (item: Listing, e: React.MouseEvent) => {
    e.stopPropagation();
    recordWhatsAppInquiry(item.id);
    const link = generateWhatsAppLink(
      item.seller_whatsapp || item.seller_phone || '254700000000',
      item.seller_name || 'Comrade',
      item.title,
      item.price,
      item.location
    );
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Bookmark className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Saved Items ({savedListings.length})
              </h3>
              <p className="text-xs text-slate-500">
                Saved on your device • No login required for buyers
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
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {savedListings.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">No saved items yet</p>
              <p className="text-xs text-slate-400 mt-1">
                Click the bookmark icon on any product to save it here for quick access later.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {savedListings.map((item) => {
                const mainImg = item.images && item.images.length > 0 ? item.images[0] : '';
                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      onClose();
                      onSelectListing(item);
                    }}
                    className="flex items-center justify-between p-3 rounded-2xl border border-slate-200 hover:border-emerald-300 hover:bg-slate-50/50 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                        <img src={mainImg} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <h5 className="font-bold text-slate-900 text-xs sm:text-sm truncate group-hover:text-emerald-700">
                          {item.title}
                        </h5>
                        <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                          KES {item.price.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-slate-400 truncate">
                          📍 {item.location} • Seller: {item.seller_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <button
                        onClick={(e) => handleWhatsApp(item, e)}
                        className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                        title="Chat on WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveSaved(item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove from saved"
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
