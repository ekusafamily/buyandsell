import React from 'react';

interface HeroBannerProps {
  onPostClick?: () => void;
  onExploreClick?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onExploreClick }) => {
  return (
    <div
      onClick={onExploreClick}
      className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-emerald-900/15 my-4 bg-emerald-950 cursor-pointer group"
      title="Click to explore DeKUT Soko deals"
    >
      <img
        src="/HERO.png"
        alt="DeKUT Soko - Welcome to Your Student Marketplace at Dedan Kimathi University of Technology"
        className="w-full h-auto object-contain sm:object-cover rounded-2xl sm:rounded-3xl block transition-transform duration-500 group-hover:scale-[1.008]"
        loading="eager"
        fetchPriority="high"
      />
    </div>
  );
};
