export const DrinkColorIcon = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full animate-float">
      <defs>
        <linearGradient id="bottleGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#10B981', stopOpacity: 0.9 }} />
          <stop offset="100%" style={{ stopColor: '#059669', stopOpacity: 0.9 }} />
        </linearGradient>
        <linearGradient id="wineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#DC2626', stopOpacity: 0.8 }} />
          <stop offset="100%" style={{ stopColor: '#B91C1C', stopOpacity: 0.8 }} />
        </linearGradient>
      </defs>
      
      {/* Wine Bottle */}
      <rect x="25" y="30" width="20" height="45" rx="2" fill="url(#bottleGrad)" />
      
      {/* Bottle Neck */}
      <rect x="30" y="20" width="10" height="12" rx="1" fill="#059669" opacity="0.9" />
      
      {/* Cork */}
      <rect x="29" y="16" width="12" height="5" rx="2" fill="#D97706" />
      
      {/* Label */}
      <rect x="28" y="45" width="14" height="10" rx="1" fill="#FCD34D" />
      
      {/* Wine Glass */}
      <path d="M 60 55 Q 65 60 65 68 L 65 70 L 55 70 L 55 68 Q 55 60 60 55 Z" fill="url(#wineGrad)" />
      
      {/* Glass Stem */}
      <rect x="58" y="70" width="4" height="12" fill="#E5E7EB" opacity="0.9" />
      
      {/* Glass Base */}
      <ellipse cx="60" cy="83" rx="8" ry="2" fill="#E5E7EB" opacity="0.9" />
    </svg>
  );
};
