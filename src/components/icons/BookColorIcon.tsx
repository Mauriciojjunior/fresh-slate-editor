export const BookColorIcon = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full animate-float">
      <defs>
        <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#8B5CF6', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      
      {/* Book Cover */}
      <rect x="20" y="15" width="50" height="70" rx="3" fill="url(#bookGrad)" />
      
      {/* Book Pages */}
      <rect x="23" y="18" width="44" height="64" rx="2" fill="#F3F4F6" />
      
      {/* Book Spine */}
      <rect x="18" y="15" width="6" height="70" rx="2" fill="#7C3AED" />
      
      {/* Decorative Line */}
      <rect x="30" y="30" width="30" height="3" rx="1.5" fill="#FCD34D" />
      <rect x="30" y="40" width="25" height="2" rx="1" fill="#FCD34D" opacity="0.6" />
      <rect x="30" y="48" width="28" height="2" rx="1" fill="#FCD34D" opacity="0.4" />
    </svg>
  );
};
