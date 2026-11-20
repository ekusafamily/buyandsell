import React, { useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Phone, 
  Share2, 
  Bookmark, 
  MapPin, 
  ShieldCheck, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import type { Listing } from '../types';
import { generateWhatsAppLink, generateWhatsAppShareLink } from '../lib/whatsapp';
import { recordWhatsAppInquiry } from '../lib/supabase';

interface ListingDetailModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  isBookmarked: boolean;
  onToggleBookmark: (listingId: string) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  isOpen,
  onClose,
  isBookmarked,
  onToggleBookmark,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  if (!isOpen || !listing) return null;

  const images = listing.images && listing.images.length > 0
    ? listing.images
    : ['https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=800&q=80'];

  const isSold = listing.status === 'sold';
  const whatsappNumber = listing.seller_whatsapp || listing.seller_phone || '254700000000';
  const displayPhone = listing.seller_phone || listing.seller_whatsapp || '07XXXXXXXX';

  const handleWhatsApp = () => {
    recordWhatsAppInquiry(listing.id);
    const link = generateWhatsAppLink(
      whatsappNumber,
      listing.seller_name || 'Comrade',
      listing.title,
      listing.price,
      listing.location
    );
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleShare = () => {
    const link = generateWhatsAppShareLink(listing.title, listing.price, listing.location);
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleCall = () => {
    window.location.href = `tel:${listing.seller_phone || listing.seller_whatsapp}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button Top Right */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 bg-slate-900/60 hover:bg-slate-900 text-white p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Image Gallery */}
          <div className="relative bg-slate-950 flex flex-col justify-between">
            <div className="relative aspect-4/3 md:aspect-square w-full overflow-hidden flex items-center justify-center">
              <img
                src={images[activeImageIndex]}
                alt={listing.title}
                className="w-full h-full object-contain"
              />

              {/* Prev / Next Buttons */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white p-1.5 rounded-full backdrop-blur-xs transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Sold Badge */}
              {isSold && (
                <div className="absolute inset-0 bg-slate-950/65 flex items-center justify-center">
                  <span className="bg-rose-600 text-white font-extrabold text-base tracking-wider uppercase px-6 py-2 rounded-full shadow-lg border border-rose-400">
                    ITEM SOLD
                  </span>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex items-center space-x-2 p-3 bg-slate-900 overflow-x-auto">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx ? 'border-amber-400 scale-105' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Listing Details & Seller Actions */}
          <div className="p-6 flex flex-col justify-between max-h-[85vh] overflow-y-auto">
            <div>
              {/* Badges Bar */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center space-x-1.5 flex-wrap">
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    {listing.condition}
                  </span>
                  {listing.is_negotiable && (
                    <span className="bg-amber-100 text-amber-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      Negotiable
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onToggleBookmark(listing.id)}
                    className={`p-2 rounded-full transition-colors cursor-pointer ${
                      isBookmarked
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title={isBookmarked ? 'Saved' : 'Save Item'}
                  >
                    <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
                    title="Share to WhatsApp"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price Banner */}
              <div className="mb-3">
                <div className="flex items-baseline space-x-1.5">
                  <span className="text-sm font-bold text-emerald-700">KES</span>
                  <span className="text-3xl font-black text-slate-900 tracking-tight">
                    {listing.price.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-lg font-extrabold text-slate-900 mb-2 leading-snug">
                {listing.title}
              </h2>

              {/* Location Tag */}
              <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium mb-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Available at: <strong>{listing.location}</strong></span>
              </div>

              {/* Description */}
              <div className="mb-6">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Item Description
                </h4>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {listing.description}
                </p>
              </div>

              {/* Seller Card */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center font-bold text-sm overflow-hidden border border-emerald-300">
                    {listing.seller_avatar ? (
                      <img src={listing.seller_avatar} alt={listing.seller_name} className="w-full h-full object-cover" />
                    ) : (
                      listing.seller_name?.charAt(0) || 'C'
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <h4 className="text-sm font-bold text-slate-900">
                        {listing.seller_name || 'DeKUT Student'}
                      </h4>
                      {listing.seller_verified && (
                        <span title="Verified Comrade">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      📍 {listing.seller_hostel || listing.location}
                    </p>
                  </div>
                </div>

                <div className="text-[11px] text-emerald-800 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Student seller • Direct handover on campus</span>
                </div>
              </div>

              {/* Safety Advisory Banner */}
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-2.5 text-[11px] text-amber-900 flex items-start space-x-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Campus Trade Safety:</strong> Inspect item in person at well-lit campus zones (e.g. Student Center, Main Gate, Resource Center) before sending M-Pesa. Never pay upfront booking fees.
                </div>
              </div>
            </div>

            {/* Bottom Actions: WhatsApp & Call */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              {!isSold ? (
                <>
                  <button
                    onClick={handleWhatsApp}
                    className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer text-sm"
                  >
                    <MessageCircle className="w-5 h-5 fill-current" />
                    <span>Chat Seller on WhatsApp (Instant)</span>
                  </button>

                  <div className="flex space-x-2">
                    <button
                      onClick={handleCall}
                      className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-xs"
                    >
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>Call {displayPhone}</span>
                    </button>
                    <button
                      onClick={handleShare}
                      className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl flex items-center justify-center space-x-1.5 transition-colors cursor-pointer text-xs"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>Share</span>
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-3 bg-slate-100 text-slate-500 rounded-xl font-bold text-sm">
                  This item has been marked as sold.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
