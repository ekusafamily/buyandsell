import React from 'react';
import { ArrowRight, MessageSquare, ShoppingBag, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  onPostClick: () => void;
  onExploreClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onPostClick, onExploreClick }) => {
  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl my-4 group border border-emerald-800/30">
      {/* HERO.png as the full background image */}
      <div className="relative w-full">
        <img
          src="/HERO.png"
          alt="DeKUT Soko - Welcome to Your Student Marketplace at Dedan Kimathi University of Technology"
          className="w-full h-auto block transition-transform duration-700 group-hover:scale-[1.015]"
          loading="eager"
          fetchPriority="high"
        />

        {/* Gradient overlay at the bottom for the interactive CTA bar */}
        <div className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent pointer-events-none" />

        {/* Floating Interactive CTA Bar - overlaid on the bottom of the image */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            {/* Left: tagline + live pulse */}
            <div className="flex items-center space-x-3 text-white">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <p className="text-xs sm:text-sm font-semibold text-white/90 drop-shadow-lg">
                <span className="hidden sm:inline">Students are trading right now — </span>
                <span className="font-bold text-amber-300">browse or sell with zero commission!</span>
              </p>
            </div>

            {/* Right: action buttons */}
            <div className="flex items-center gap-2.5">
              <button
                onClick={onExploreClick}
                className="px-4 sm:px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-bold rounded-xl border border-white/25 transition-all cursor-pointer text-xs sm:text-sm shadow-lg flex items-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-300" />
                <span>Browse Deals</span>
              </button>
              <button
                onClick={onPostClick}
                className="px-4 sm:px-6 py-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-slate-950 font-extrabold rounded-xl shadow-xl shadow-amber-500/30 transition-all transform hover:-translate-y-0.5 cursor-pointer text-xs sm:text-sm flex items-center space-x-2 group/btn"
              >
                <span>Sell An Item</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating WhatsApp Connect badge - top right */}
        <div className="absolute top-3 right-3 sm:top-5 sm:right-5 bg-slate-950/80 backdrop-blur-md border border-emerald-500/40 rounded-2xl p-2.5 sm:p-3 shadow-xl max-w-[200px] sm:max-w-[220px] hidden md:block">
          <div className="flex items-center space-x-2 mb-1.5">
            <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-emerald-500/30">
              <MessageSquare className="w-3.5 h-3.5 fill-current" />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-bold text-white truncate">Instant WhatsApp Connect</p>
              <p className="text-[9px] text-emerald-300 font-medium">Buyer → Seller in 1 click</p>
            </div>
          </div>
          <p className="text-[10px] text-slate-300 italic bg-white/5 p-1.5 rounded-lg border border-white/5 leading-snug">
            "Hey, is the 6kg Meko at Kimathi Stage still available?"
          </p>
        </div>

        {/* Floating "No login needed" badge - top left */}
        <div className="absolute top-3 left-3 sm:top-5 sm:left-5 hidden sm:flex items-center space-x-2 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-bold px-3 py-2 rounded-full border border-emerald-400/40 shadow-lg">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Buyers: No sign-up needed!</span>
        </div>
      </div>
    </div>
  );
};
