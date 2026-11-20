import React from 'react';
import { 
  MessageCircle, 
  MapPin, 
  Bookmark, 
  Eye
} from 'lucide-react';
import type { Listing } from '../types';
import { generateWhatsAppLink } from '../lib/whatsapp';
import { recordWhatsAppInquiry } from '../lib/supabase';

interface ListingCardProps {
  listing: Listing;
  isBookmarked: boolean;
  onToggleBookmark: (listingId: string) => void;
  onSelect: (listing: Listing) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  isBookmarked,
  onToggleBookmark,
  onSelect,
}) => {
  const isSold = listing.status === 'sold';
  const mainImage = listing.images && listing.images.length > 0 
    ? listing.images[0] 
    : 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80';

  const handleWhatsAppClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    recordWhatsAppInquiry(listing.id);
    const link = generateWhatsAppLink(
      listing.seller_whatsapp || listing.seller_phone || '254700000000',
      listing.seller_name || 'Comrade',
      listing.title,
      listing.price,
      listing.location
    );
    window.open(link, '_blank', 'noopener,noreferrer');
  };

  const handleBookmarkClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(listing.id);
  };

  return (
    <div
      onClick={() => onSelect(listing)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image Container with Badges */}
      <div className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden">
        <img
          src={mainImage}
          alt={listing.title}
          loading="lazy"
          className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
            isSold ? 'grayscale contrast-125 opacity-60' : ''
          }`}
        />

        {/* Sold Overlay */}
        {isSold && (
          <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-rose-600 text-white font-extrabold text-sm tracking-wider uppercase px-4 py-1.5 rounded-full shadow-lg border border-rose-400">
              SOLD OUT
            </span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          <span className="bg-slate-900/80 backdrop-blur-md text-white font-semibold text-[11px] px-2.5 py-0.5 rounded-full shadow-xs">
            {listing.condition}
          </span>
          {listing.is_negotiable && !isSold && (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white font-medium text-[10px] px-2 py-0.5 rounded-full shadow-xs">
              Negotiable
            </span>
          )}
        </div>

        {/* Bookmark Button */}
        <button
          onClick={handleBookmarkClick}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition-all shadow-md cursor-pointer ${
            isBookmarked
              ? 'bg-amber-400 text-slate-950 ring-2 ring-white scale-110'
              : 'bg-white/80 text-slate-600 hover:bg-white hover:text-slate-900'
          }`}
          title={isBookmarked ? 'Remove bookmark' : 'Save for later'}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>

        {/* Images Count Pill if multiple photos */}
        {listing.images && listing.images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 bg-black/60 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md backdrop-blur-xs">
            📷 {listing.images.length} photos
          </div>
        )}
      </div>

      {/* Details Container */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price Header */}
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="flex items-baseline space-x-1">
              <span className="text-xs font-bold text-emerald-700">KES</span>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">
                {listing.price.toLocaleString()}
              </span>
            </div>
            {listing.views_count > 0 && (
              <span className="text-[10px] text-slate-400 flex items-center space-x-0.5">
                <Eye className="w-3 h-3 text-slate-400" />
                <span>{listing.views_count}</span>
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-2 group-hover:text-emerald-700 transition-colors">
            {listing.title}
          </h3>

          {/* Location Badge */}
          <div className="flex items-center space-x-1 text-slate-500 text-xs mb-3">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate font-medium">{listing.location}</span>
          </div>
        </div>

        {/* Card Footer: Seller info & WhatsApp button */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Seller Preview */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold overflow-hidden shrink-0 border border-emerald-200">
              {listing.seller_avatar ? (
                <img src={listing.seller_avatar} alt={listing.seller_name} className="w-full h-full object-cover" />
              ) : (
                listing.seller_name?.charAt(0) || 'C'
              )}
            </div>
            <span className="text-xs text-slate-600 truncate font-medium">
              {listing.seller_name?.split(' ')[0] || 'Comrade'}
            </span>
          </div>

          {/* Direct WhatsApp Action Button */}
          {!isSold ? (
            <button
              onClick={handleWhatsAppClick}
              className="flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md shadow-emerald-600/30 transition-all cursor-pointer shrink-0"
              title="Chat directly on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 fill-current" />
              <span>WhatsApp</span>
            </button>
          ) : (
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
              Sold
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
