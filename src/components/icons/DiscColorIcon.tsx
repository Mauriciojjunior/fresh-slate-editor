export const DiscColorIcon = () => {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full animate-float">
      <defs>
        <linearGradient id="discGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#EC4899', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#F43F5E', stopOpacity: 1 }} />
        </linearGradient>
        <radialGradient id="discCenter">
          <stop offset="0%" style={{ stopColor: '#FDE047', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#FCD34D', stopOpacity: 1 }} />
        </radialGradient>
      </defs>
      
      {/* Main Disc */}
      <circle cx="50" cy="50" r="35" fill="url(#discGrad)" />
      
      {/* Inner Ring */}
      <circle cx="50" cy="50" r="25" fill="url(#discCenter)" />
      
      {/* Center Hole */}
      <circle cx="50" cy="50" r="8" fill="#1F2937" />
      
      {/* Decorative Grooves */}
      <circle cx="50" cy="50" r="30" fill="none" stroke="#F472B6" strokeWidth="1" opacity="0.5" />
      <circle cx="50" cy="50" r="20" fill="none" stroke="#FBBF24" strokeWidth="1" opacity="0.5" />
    </svg>
  );
};
